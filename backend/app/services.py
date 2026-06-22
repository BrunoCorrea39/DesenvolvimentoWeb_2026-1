import json
import sys
import unicodedata
from datetime import date
from json import JSONDecodeError
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from uuid import uuid4

from sqlmodel import Session, select

from .auth import hash_password
from .config import ANTHROPIC_API_KEY, ANTHROPIC_MODEL, ANTHROPIC_VERSION
from .models import ChatMessage, Group, Project, Task, TaskRequest, User


STATUS_CYCLE = {
    "A Fazer": "Em Andamento",
    "Em Andamento": "Concluído",
    "Concluído": "A Fazer",
}


def normalize_class_name(value: str | None) -> str:
    stripped = (value or "").replace("º", "").replace("ª", "").replace("°", "")
    normalized = unicodedata.normalize("NFKD", stripped)
    without_marks = "".join(char for char in normalized if not unicodedata.combining(char))
    return "".join(char.lower() for char in without_marks if char.isalnum())


def class_name_matches(class_id: str, class_name: str | None) -> bool:
    normalized_class = normalize_class_name(class_name)
    normalized_id = normalize_class_name(class_id)
    if not normalized_class or not normalized_id:
        return False

    year = "".join(char for char in normalized_id if char.isdigit())
    letter = "".join(char for char in normalized_id if char.isalpha())
    candidates = {normalized_id}
    if year and letter:
        candidates.add(f"{year}ano{letter}")

    return any(candidate == normalized_class for candidate in candidates)


def members_to_json(members: list[str]) -> str:
    return json.dumps(members, ensure_ascii=False)


def json_to_members(value: str) -> list[str]:
    return json.loads(value or "[]")


def recalculate_group_progress(session: Session, group_id: str) -> None:
    group = session.get(Group, group_id)
    if not group:
        return

    tasks = session.exec(select(Task).where(Task.group_id == group_id)).all()
    if not tasks:
        group.progress = 0
    else:
        done = len([task for task in tasks if task.status == "Concluído"])
        group.progress = round((done / len(tasks)) * 100)
    session.add(group)


def task_to_frontend(session: Session, task: Task) -> dict:
    messages = session.exec(
        select(ChatMessage).where(ChatMessage.task_id == task.id).order_by(ChatMessage.created_at)
    ).all()
    return {
        "id": task.id,
        "titulo": task.title,
        "descricao": task.description,
        "responsavel": task.responsible,
        "status": task.status,
        "prazo": task.deadline,
        "nota": task.grade,
        "chatHistory": [
            {"id": message.id, "sender": message.sender, "text": message.text}
            for message in messages
        ],
    }


def group_to_frontend(session: Session, group: Group) -> dict:
    tasks = session.exec(select(Task).where(Task.group_id == group.id).order_by(Task.id)).all()
    requests = session.exec(
        select(TaskRequest)
        .where(TaskRequest.group_id == group.id, TaskRequest.status == "pendente")
        .order_by(TaskRequest.id)
    ).all()
    return {
        "id": group.id,
        "nome": group.name,
        "integrantes": json_to_members(group.members_json),
        "progresso": group.progress,
        "notaColetiva": group.collective_grade,
        "solicitacoesTarefas": [
            {
                "id": request.id,
                "titulo": request.title,
                "descricao": request.description,
                "responsavel": request.responsible,
            }
            for request in requests
        ],
        "tarefas": [task_to_frontend(session, task) for task in tasks],
    }


def project_to_frontend(session: Session, project: Project, only_member: str | None = None) -> dict | None:
    groups = session.exec(select(Group).where(Group.project_id == project.id).order_by(Group.id)).all()
    frontend_groups = []
    for group in groups:
        members = json_to_members(group.members_json)
        if only_member and only_member not in members:
            continue
        frontend_groups.append(group_to_frontend(session, group))

    if only_member and not frontend_groups:
        return None

    return {
        "id": project.id,
        "turmaId": project.class_id,
        "titulo": project.title,
        "materia": project.subject,
        "conteudo": project.content,
        "prazo": project.deadline,
        "grupos": frontend_groups,
    }


def list_projects_for_user(session: Session, user: User) -> list[dict]:
    projects = session.exec(select(Project).order_by(Project.id)).all()
    if user.role == "aluno":
        projects = [
            project
            for project in projects
            if class_name_matches(project.class_id, user.class_name)
        ]
        only_member = user.name
    else:
        only_member = None
    serialized = [project_to_frontend(session, project, only_member) for project in projects]
    return [project for project in serialized if project]


def call_claude(system_prompt: str, user_prompt: str, max_tokens: int = 500) -> str | None:
    if not ANTHROPIC_API_KEY:
        print("[claude] ANTHROPIC_API_KEY ausente; usando fallback local.", file=sys.stderr)
        return None

    payload = {
        "model": ANTHROPIC_MODEL,
        "max_tokens": max_tokens,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_prompt}],
    }
    request = Request(
        "https://api.anthropic.com/v1/messages",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": ANTHROPIC_VERSION,
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=25) as response:
            data = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        print(f"[claude] HTTP {error.code}: {body}", file=sys.stderr)
        return None
    except URLError as error:
        print(f"[claude] Erro de conexão: {error}", file=sys.stderr)
        return None
    except TimeoutError:
        print("[claude] Timeout ao chamar a Anthropic.", file=sys.stderr)
        return None
    except JSONDecodeError as error:
        print(f"[claude] Resposta JSON inválida: {error}", file=sys.stderr)
        return None

    text_parts = [
        block.get("text", "")
        for block in data.get("content", [])
        if block.get("type") == "text"
    ]
    return "\n".join(part for part in text_parts if part).strip() or None


def clean_tutor_response(text: str) -> str:
    return (
        text.replace("**", "")
        .replace("__", "")
        .replace("### ", "")
        .replace("## ", "")
        .replace("# ", "")
        .strip()
    )


def generate_tutor_response(message: str, task: Task) -> str:
    claude_response = call_claude(
        system_prompt=(
            "Você é um tutor pedagógico para estudantes da educação básica. "
            "Oriente com perguntas, passos e dicas. Não entregue resposta pronta. "
            "Responda em português brasileiro com até 90 palavras. "
            "Não use Markdown, títulos, listas com asteriscos ou formatação especial."
        ),
        user_prompt=(
            f"Tarefa: {task.title}\n"
            f"Descrição: {task.description}\n"
            f"Mensagem do aluno: {message}"
        ),
        max_tokens=220,
    )
    if claude_response:
        return clean_tutor_response(claude_response)

    text = message.lower()
    if "resposta" in text or "pronto" in text:
        return (
            "Posso te orientar, mas não entregar pronto. Comece explicando o contexto, "
            f"depois conecte sua ideia com a tarefa: {task.title}."
        )
    if "ajuda" in text or "dúvida" in text or "duvida" in text:
        return (
            "Vamos quebrar em passos: levante 2 fontes, anote 3 ideias principais e transforme "
            "cada ideia em um parágrafo curto com exemplo."
        )
    return (
        "Boa linha de raciocínio. Para avançar, tente justificar sua resposta com uma evidência "
        "do conteúdo estudado e uma conclusão própria."
    )


def _extract_json_array(text: str) -> str:
    start = text.find("[")
    end = text.rfind("]")
    if start != -1 and end != -1 and end > start:
        return text[start : end + 1]
    return text


def _format_deadline(value: str | None) -> str:
    texto = (value or "").strip()
    if not texto:
        return "A combinar"
    try:
        return date.fromisoformat(texto).strftime("%d/%m/%Y")
    except ValueError:
        return texto


def _class_complexity(class_name: str) -> tuple[str, str, str]:
    text = (class_name or "").lower()
    digits = "".join(char for char in text if char.isdigit())
    year = int(digits) if digits else 0
    is_medio = "medio" in text or "médio" in text
    rank = (10 + year) if is_medio else year

    if is_medio:
        label = f"alunos do {year}º ano do Ensino Médio" if year else "alunos do Ensino Médio"
    elif year:
        label = f"alunos do {year}º ano do Ensino Fundamental"
    else:
        label = "alunos do Ensino Fundamental"

    if rank >= 13:
        instrucao = (
            "complexidade muito alta: exija análise crítica, argumentação autoral, conexões "
            "interdisciplinares, avaliação de fontes e proposição de soluções; use vocabulário técnico."
        )
        suffix = "Nível Ensino Médio (3º ano): análise crítica, argumentação autoral e proposição de soluções."
    elif rank == 12:
        instrucao = (
            "complexidade alta: exija análise aprofundada de causas e consequências, comparações e "
            "argumentação sustentada por evidências."
        )
        suffix = "Nível Ensino Médio (2º ano): análise aprofundada e argumentação com evidências."
    elif rank == 11:
        instrucao = (
            "complexidade média-alta: peça explicação com análise inicial, exemplos e primeiras "
            "conclusões próprias."
        )
        suffix = "Nível Ensino Médio (1º ano): explicação com análise inicial e exemplos."
    elif rank >= 7:
        instrucao = (
            "complexidade média: peça compreensão do tema com algum aprofundamento e exemplos do cotidiano."
        )
        suffix = "Nível Fundamental (anos finais): compreensão com exemplos e algum aprofundamento."
    elif rank >= 4:
        instrucao = (
            "complexidade básica: use linguagem acessível, exemplos concretos e foco em explicar e descrever."
        )
        suffix = "Nível Fundamental (anos intermediários): linguagem acessível e exemplos concretos."
    else:
        instrucao = (
            "complexidade introdutória: use linguagem muito simples, foco em identificar, nomear e "
            "descrever com exemplos do dia a dia."
        )
        suffix = "Nível Fundamental (anos iniciais): linguagem muito simples, identificar e descrever."

    return label, instrucao, suffix


def generate_ai_tasks(
    title: str,
    content: str,
    members: list[str],
    class_name: str = "",
    prazo: str | None = None,
) -> list[Task]:
    quantidade = len(members)
    deadline = _format_deadline(prazo)
    label, instrucao, _ = _class_complexity(class_name)
    claude_response = call_claude(
        system_prompt=(
            "Você é um professor que divide um trabalho escolar em subtemas. "
            "Cada integrante recebe um subtema diferente; juntos, os subtemas cobrem o tema "
            "e cumprem o objetivo descrito nas diretrizes. Ordene do conceito mais básico ao mais "
            "aplicado e faça com que o último subtema seja uma reflexão ou proposta de solução que "
            "gere aprendizado extra (por exemplo: 'Como podemos reduzir os conflitos políticos em "
            "campeonatos esportivos'). Adapte a profundidade e o vocabulário ao público-alvo e ao "
            "nível de complexidade indicados. Retorne apenas JSON válido, sem markdown, no formato "
            "[{\"titulo\":\"...\",\"descricao\":\"...\"}]."
        ),
        user_prompt=(
            f"Tema: {title}\n"
            f"Diretrizes: {content}\n"
            f"Público-alvo: {label}\n"
            f"Nível de complexidade: {instrucao}\n"
            f"Número de integrantes: {quantidade}\n"
            f"Gere exatamente {quantidade} subtemas complementares, um para cada integrante, "
            "do básico ao aplicado, terminando com uma reflexão ou proposta de solução."
        ),
        max_tokens=min(3000, 300 + 140 * quantidade),
    )
    if claude_response:
        try:
            parsed_tasks = json.loads(_extract_json_array(claude_response))
            tasks = [
                Task(
                    title=item["titulo"],
                    description=item.get("descricao") or item["titulo"],
                    responsible=members[index],
                    status="A Fazer",
                    deadline=deadline,
                )
                for index, item in enumerate(parsed_tasks[:quantidade])
                if item.get("titulo")
            ]
            if len(tasks) == quantidade:
                return tasks
        except (JSONDecodeError, KeyError, TypeError):
            pass

    return _fallback_ai_tasks(title, content, members, class_name, deadline)


def _fallback_ai_tasks(
    title: str,
    content: str,
    members: list[str],
    class_name: str = "",
    deadline: str = "A combinar",
) -> list[Task]:
    tema = (title or "o tema").strip()
    _, _, nivel_suffix = _class_complexity(class_name)
    foco = (content or "").strip()
    foco_curto = f"{foco[:80]}..." if len(foco) > 80 else (foco or "as diretrizes do trabalho")

    angulos = [
        ("Conceitos fundamentais", f"Explique os conceitos-base necessários para compreender {foco_curto} no contexto de {tema}."),
        ("Contexto histórico", f"Apresente o histórico e a evolução de {tema} em relação a {foco_curto}."),
        ("Análise central", f"Analise como {foco_curto} se manifesta especificamente em {tema}, com exemplos concretos."),
        ("Aprofundamento crítico", f"Aprofunde os principais aspectos de {foco_curto} em {tema}, discutindo causas e consequências."),
        ("Evidências e dados", f"Levante fontes, dados e evidências que sustentem a discussão sobre {foco_curto} em {tema}."),
        ("Comparações e perspectivas", f"Compare diferentes casos ou pontos de vista envolvendo {foco_curto} em {tema}."),
    ]
    reflexao = (
        "Reflexão e proposta",
        f"Com base no estudo do grupo, proponha como poderíamos enfrentar ou melhorar {foco_curto} "
        f"relacionado a {tema} — um aprendizado que vai além do conteúdo.",
    )

    total = len(members)
    tasks = []
    for index, member in enumerate(members):
        if total >= 2 and index == total - 1:
            titulo, descricao = reflexao
        else:
            titulo, descricao = angulos[index % len(angulos)]
        tasks.append(
            Task(
                title=f"{titulo}: {tema}",
                description=f"{descricao} {nivel_suffix}",
                responsible=member,
                status="A Fazer",
                deadline=deadline,
            )
        )
    return tasks


def generate_ai_group_plan(
    title: str,
    content: str,
    groups_members: list[list[str]],
    class_name: str = "",
    prazo: str | None = None,
) -> list[dict]:
    """Define um recorte distinto por grupo e uma pergunta direcionada por
    integrante. Retorna lista alinhada a groups_members:
    [{"subtema": str, "tarefas": list[Task]}]."""
    deadline = _format_deadline(prazo)
    label, instrucao, _ = _class_complexity(class_name)
    total_alunos = sum(len(members) for members in groups_members)
    composicao = "; ".join(
        f"Grupo {index}: {len(members)} integrante(s)"
        for index, members in enumerate(groups_members, start=1)
    )

    claude_response = call_claude(
        system_prompt=(
            "Você é um professor que planeja um trabalho escolar em grupo. "
            "Para CADA grupo, escolha um RECORTE distinto e específico do tema, sem repetir "
            "recorte entre grupos, coerente com as diretrizes. Dentro de cada grupo, gere uma "
            "atribuição DIRECIONADA por integrante, todas sobre o recorte daquele grupo, "
            "ordenadas do conceito mais básico ao mais aplicado; a última deve ser uma reflexão "
            "ou proposta de solução. Para cada integrante produza dois campos: \"titulo\" = um "
            "título curto (3 a 8 palavras) que nomeia o subtema/aspecto investigado, citando o "
            "recorte (ex.: 'Floresta Amazônica: características geográficas'); \"descricao\" = a "
            "pergunta de pesquisa completa e autoexplicativa que o aluno deve responder (ex.: "
            "'O que é a Floresta Amazônica e quais são suas principais características "
            "geográficas (clima, vegetação, localização no Brasil)?'). O titulo e a descricao "
            "não devem ser iguais. Adapte profundidade e vocabulário ao público-alvo e ao nível "
            "indicados. Retorne apenas JSON válido, sem markdown, no formato "
            "[{\"subtema\":\"...\",\"tarefas\":[{\"titulo\":\"...\",\"descricao\":\"...\"}]}]."
        ),
        user_prompt=(
            f"Tema: {title}\n"
            f"Diretrizes: {content}\n"
            f"Público-alvo: {label}\n"
            f"Nível de complexidade: {instrucao}\n"
            f"Quantidade de grupos: {len(groups_members)}\n"
            f"Composição (gere exatamente esta quantidade de tarefas por grupo): {composicao}\n"
            "Cada grupo recebe um recorte diferente; cada integrante recebe um titulo curto e uma pergunta completa."
        ),
        max_tokens=min(4096, 400 + 130 * total_alunos),
    )

    if claude_response:
        plan = _parse_group_plan(claude_response, groups_members, deadline)
        if plan:
            return plan

    return _fallback_ai_group_plan(title, content, groups_members, class_name, deadline)


def _parse_group_plan(
    raw: str,
    groups_members: list[list[str]],
    deadline: str,
) -> list[dict] | None:
    try:
        parsed = json.loads(_extract_json_array(raw))
    except (JSONDecodeError, TypeError):
        return None
    if not isinstance(parsed, list) or len(parsed) < len(groups_members):
        return None

    plan: list[dict] = []
    for index, members in enumerate(groups_members):
        bloco = parsed[index]
        if not isinstance(bloco, dict):
            return None
        itens = bloco.get("tarefas") or []
        if not isinstance(itens, list) or len(itens) < len(members):
            return None
        subtema = (bloco.get("subtema") or "").strip() or f"Recorte {index + 1}"
        tarefas: list[Task] = []
        for member, item in zip(members, itens):
            if not isinstance(item, dict):
                return None
            titulo = (item.get("titulo") or "").strip()
            if not titulo:
                return None
            tarefas.append(
                Task(
                    title=titulo,
                    description=(item.get("descricao") or titulo).strip(),
                    responsible=member,
                    status="A Fazer",
                    deadline=deadline,
                )
            )
        plan.append({"subtema": subtema, "tarefas": tarefas})
    return plan


def _fallback_ai_group_plan(
    title: str,
    content: str,
    groups_members: list[list[str]],
    class_name: str = "",
    deadline: str = "A combinar",
) -> list[dict]:
    plan: list[dict] = []
    for index, members in enumerate(groups_members, start=1):
        subtema = f"Recorte {index}"
        tarefas = _fallback_ai_tasks(title, content, members, class_name, deadline)
        for task in tarefas:
            task.title = f"[{subtema}] {task.title}"
        plan.append({"subtema": subtema, "tarefas": tarefas})
    return plan


SEED_PASSWORD = "123456"

CLASSES = [
    {"name": "9º Ano A", "suffix": "a"},
    {"name": "9º Ano B", "suffix": "b"},
]

STUDENT_FIRST_NAMES = [
    "Ana", "Bruno", "Carla", "Daniel", "Eduarda", "Felipe", "Gabriela", "Henrique",
    "Isabela", "João", "Larissa", "Marcos", "Natália", "Otávio", "Patrícia", "Rafael",
    "Sofia", "Thiago", "Vitória", "William",
]

STUDENT_LAST_NAMES = [
    "Silva", "Souza", "Oliveira", "Santos", "Pereira", "Lima", "Costa", "Ferreira",
    "Almeida", "Rodrigues", "Gomes", "Martins", "Araújo", "Barbosa", "Ribeiro", "Carvalho",
    "Cardoso", "Teixeira", "Moraes", "Nunes",
]


def seed_database(session: Session) -> None:
    existing_user = session.exec(select(User)).first()
    if existing_user:
        return

    professor = User(
        name="Prof. Fernando",
        email="professor@escola.com",
        password_hash=hash_password(SEED_PASSWORD),
        role="professor",
        subject="História",
    )
    session.add(professor)

    students: list[User] = []
    for turma in CLASSES:
        for index in range(20):
            number = f"{index + 1:02d}"
            full_name = f"{STUDENT_FIRST_NAMES[index]} {STUDENT_LAST_NAMES[index]}"
            students.append(
                User(
                    name=full_name,
                    email=f"aluno{number}{turma['suffix']}@escola.com",
                    password_hash=hash_password(SEED_PASSWORD),
                    role="aluno",
                    class_name=turma["name"],
                )
            )

    session.add_all(students)
    session.commit()


def generated_group_id() -> str:
    return f"g_{uuid4().hex[:10]}"
