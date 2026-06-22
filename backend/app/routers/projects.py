import random
import sys
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..auth import get_current_user, require_professor
from ..config import ANTHROPIC_API_KEY, ANTHROPIC_MODEL
from ..database import get_session
from ..models import ChatMessage, Group, Project, Task, TaskRequest, User
from ..schemas import (
    AIProjectCreate,
    ChatCreate,
    GroupGradeUpdate,
    ResolveTaskRequest,
    TaskCreate,
    TaskRequestCreate,
    TaskStatusUpdate,
    TaskUpdate,
)
from ..services import (
    call_claude,
    _fallback_ai_group_plan,
    STATUS_CYCLE,
    class_name_matches,
    generate_ai_group_plan,
    generate_tutor_response,
    generated_group_id,
    json_to_members,
    list_projects_for_user,
    members_to_json,
    recalculate_group_progress,
)


router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("/ai/status")
def ai_status(
    ping: bool = False,
    _: User = Depends(require_professor),
) -> dict:
    info: dict = {
        "key_configured": bool(ANTHROPIC_API_KEY),
        "model": ANTHROPIC_MODEL,
        "mode": "ia" if ANTHROPIC_API_KEY else "fallback",
    }
    if ping and ANTHROPIC_API_KEY:
        resposta = call_claude("Responda apenas com a palavra: ok", "ok", max_tokens=5)
        info["live"] = bool(resposta)
        info["sample"] = (resposta or "")[:60]
    return info


@router.get("")
def list_projects(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> list[dict]:
    return list_projects_for_user(session, user)


@router.get("/classes")
def list_classes(
    _: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> list[dict]:
    students = session.exec(select(User).where(User.role == "aluno")).all()

    years: dict[str, dict[str, None]] = {}
    for student in students:
        class_name = (student.class_name or "").strip()
        if not class_name:
            continue
        parts = class_name.rsplit(" ", 1)
        year_name = parts[0] if len(parts) == 2 else class_name
        years.setdefault(year_name, {})[class_name] = None

    return [
        {
            "id": year_name,
            "nome": year_name,
            "turmas": [{"id": turma, "nome": turma} for turma in sorted(years[year_name])],
        }
        for year_name in sorted(years)
    ]


@router.get("/classes/{class_id}/students")
def list_class_students(
    class_id: str,
    _: User = Depends(require_professor),
    session: Session = Depends(get_session),
) -> list[dict]:
    students_by_name: dict[str, dict] = {}

    registered_students = session.exec(select(User).where(User.role == "aluno")).all()
    for student in registered_students:
        if class_name_matches(class_id, student.class_name):
            students_by_name[student.name] = {
                "id": student.id,
                "nome": student.name,
                "email": student.email,
                "turma": student.class_name,
                "origem": "Cadastro",
            }

    projects = session.exec(select(Project).where(Project.class_id == class_id)).all()
    for project in projects:
        groups = session.exec(select(Group).where(Group.project_id == project.id)).all()
        for group in groups:
            for member in json_to_members(group.members_json):
                students_by_name.setdefault(
                    member,
                    {
                        "id": None,
                        "nome": member,
                        "email": None,
                        "turma": class_id,
                        "origem": "Grupos",
                    },
                )

    return sorted(students_by_name.values(), key=lambda student: student["nome"].lower())


def iso_or_none(value: str | None) -> str | None:
    try:
        return date.fromisoformat((value or "").strip()).isoformat()
    except ValueError:
        return None


def draw_groups(student_names: list[str], number_of_groups: int) -> list[list[str]]:
    shuffled = student_names[:]
    random.shuffle(shuffled)
    buckets: list[list[str]] = [[] for _ in range(number_of_groups)]
    for index, name in enumerate(shuffled):
        buckets[index % number_of_groups].append(name)
    return buckets


@router.post("/ai")
def create_project_with_ai(
    payload: AIProjectCreate,
    professor: User = Depends(require_professor),
    session: Session = Depends(get_session),
) -> dict:
    registered_students = session.exec(select(User).where(User.role == "aluno")).all()
    class_students = [
        student.name
        for student in registered_students
        if class_name_matches(payload.turmaId, student.class_name)
    ]
    if not class_students:
        raise HTTPException(
            status_code=404,
            detail="Nenhum aluno cadastrado nesta turma para sortear os grupos.",
        )

    number_of_groups = max(1, min(payload.numeroGrupos, len(class_students)))
    groups_members = draw_groups(class_students, number_of_groups)
    try:
        plan = generate_ai_group_plan(
            payload.titulo,
            payload.conteudo,
            groups_members,
            payload.turmaId,
            payload.prazo,
        )
    except Exception as error:
        print(f"[ai] Falha ao gerar plano com IA, usando fallback: {error}", file=sys.stderr)
        plan = None
    if not plan or len(plan) != len(groups_members):
        plan = _fallback_ai_group_plan(
            payload.titulo, payload.conteudo, groups_members, payload.turmaId
        )

    project = Project(
        class_id=payload.turmaId,
        title=payload.titulo,
        subject=professor.subject or "História",
        content=payload.conteudo,
        created_by_id=professor.id,
        deadline=iso_or_none(payload.prazo),
    )
    session.add(project)
    session.commit()
    session.refresh(project)
    project_id = project.id

    for index, (members, bloco) in enumerate(zip(groups_members, plan), start=1):
        group_id = generated_group_id()
        session.add(
            Group(
                id=group_id,
                project_id=project_id,
                name=f"Grupo {index}",
                members_json=members_to_json(members),
                progress=0,
            )
        )

        for task in bloco["tarefas"]:
            task.group_id = group_id
            session.add(task)

    session.commit()

    return {
        "message": "Trabalho criado com grupos sorteados por IA.",
        "project_id": project_id,
        "grupos": number_of_groups,
    }


@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    _: User = Depends(require_professor),
    session: Session = Depends(get_session),
) -> dict:
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Trabalho não encontrado.")

    groups = session.exec(select(Group).where(Group.project_id == project_id)).all()
    for group in groups:
        tasks = session.exec(select(Task).where(Task.group_id == group.id)).all()
        for task in tasks:
            messages = session.exec(
                select(ChatMessage).where(ChatMessage.task_id == task.id)
            ).all()
            for message in messages:
                session.delete(message)
            session.delete(task)

        requests = session.exec(
            select(TaskRequest).where(TaskRequest.group_id == group.id)
        ).all()
        for request in requests:
            session.delete(request)

        session.delete(group)

    session.delete(project)
    session.commit()
    return {"message": "Trabalho excluído."}


@router.patch("/tasks/{task_id}/status")
def update_task_status(
    task_id: int,
    payload: TaskStatusUpdate,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> dict:
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
    if user.role == "aluno" and task.responsible != user.name:
        raise HTTPException(status_code=403, detail="Apenas o responsável pode alterar esta tarefa.")

    task.status = payload.status or STATUS_CYCLE.get(task.status, "A Fazer")
    session.add(task)
    recalculate_group_progress(session, task.group_id)
    session.commit()
    return {"message": "Status atualizado.", "status": task.status}


@router.patch("/tasks/{task_id}")
def update_task(
    task_id: int,
    payload: TaskUpdate,
    _: User = Depends(require_professor),
    session: Session = Depends(get_session),
) -> dict:
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada.")

    if payload.responsavel is not None:
        task.responsible = payload.responsavel
    if payload.nota is not None:
        if payload.nota < 0 or payload.nota > 10:
            raise HTTPException(status_code=422, detail="A nota individual deve estar entre 0 e 10.")
        task.grade = payload.nota
    session.add(task)
    session.commit()
    return {"message": "Tarefa atualizada."}


@router.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    _: User = Depends(require_professor),
    session: Session = Depends(get_session),
) -> dict:
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada.")

    group_id = task.group_id
    session.delete(task)
    recalculate_group_progress(session, group_id)
    session.commit()
    return {"message": "Tarefa excluída."}


@router.post("/groups/{group_id}/tasks")
def create_task(
    group_id: str,
    payload: TaskCreate,
    _: User = Depends(require_professor),
    session: Session = Depends(get_session),
) -> dict:
    group = session.get(Group, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Grupo não encontrado.")

    task = Task(
        group_id=group_id,
        title=payload.titulo,
        description=payload.descricao,
        responsible=payload.responsavel,
        deadline=payload.prazo,
    )
    session.add(task)
    session.commit()
    return {"message": "Tarefa criada.", "task_id": task.id}


@router.post("/groups/{group_id}/requests")
def create_task_request(
    group_id: str,
    payload: TaskRequestCreate,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> dict:
    group = session.get(Group, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Grupo não encontrado.")
    if user.role != "aluno":
        raise HTTPException(status_code=403, detail="Apenas alunos podem solicitar novas tarefas.")

    request = TaskRequest(
        group_id=group_id,
        title=payload.titulo,
        description=payload.descricao,
        responsible=payload.responsavel,
    )
    session.add(request)
    session.commit()
    return {"message": "Solicitação enviada ao professor.", "request_id": request.id}


@router.post("/requests/{request_id}/resolve")
def resolve_task_request(
    request_id: int,
    payload: ResolveTaskRequest,
    _: User = Depends(require_professor),
    session: Session = Depends(get_session),
) -> dict:
    request = session.get(TaskRequest, request_id)
    if not request or request.status != "pendente":
        raise HTTPException(status_code=404, detail="Solicitação pendente não encontrada.")

    request.status = "aprovada" if payload.aprovar else "recusada"
    if payload.aprovar:
        task = Task(
            group_id=request.group_id,
            title=f"[Aprovado] {request.title}",
            description=request.description,
            responsible=request.responsible,
            deadline="Definido por Prof",
        )
        session.add(task)

    session.add(request)
    session.commit()
    return {"message": "Solicitação processada."}


@router.patch("/groups/{group_id}/grade")
def update_group_grade(
    group_id: str,
    payload: GroupGradeUpdate,
    _: User = Depends(require_professor),
    session: Session = Depends(get_session),
) -> dict:
    group = session.get(Group, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Grupo não encontrado.")

    group.collective_grade = payload.notaColetiva
    session.add(group)
    session.commit()
    return {"message": "Nota coletiva salva."}


@router.post("/tasks/{task_id}/chat")
def chat_with_ai(
    task_id: int,
    payload: ChatCreate,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> dict:
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
    if user.role == "aluno" and task.responsible != user.name:
        raise HTTPException(status_code=403, detail="Apenas o responsável pode conversar sobre esta tarefa.")

    user_message = ChatMessage(task_id=task_id, sender="aluno", text=payload.message)
    ai_message = ChatMessage(task_id=task_id, sender="ia", text=generate_tutor_response(payload.message, task))
    session.add(user_message)
    session.add(ai_message)
    session.commit()
    return {"message": "Resposta gerada pela IA.", "response": ai_message.text}
