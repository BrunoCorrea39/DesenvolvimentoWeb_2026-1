# ProjetAí

Sistema web para apoiar professores e estudantes na gestão de trabalhos escolares em grupo, com tutoria assistida por IA e persistência real.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: FastAPI + SQLModel
- Banco de dados: SQLite
- Autenticação: JWT
- IA: serviço de tutoria e divisão de tarefas com resposta assistida no backend

## Usuários de demonstração

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Aluno | `aluno@escola.com` | `123456` |
| Professor | `professor@escola.com` | `123456` |

## Rodar com Docker

Essa é a forma recomendada, porque o projeto roda com Python 3.12 no container e evita problemas com Python 3.14 local.

Se for usar Claude API, crie um arquivo `.env` na raiz do projeto, junto de `docker-compose.yml`:

```env
ANTHROPIC_API_KEY=sua-chave-da-claude-api
ANTHROPIC_MODEL=claude-haiku-4-5
```

Depois rode:

```powershell
docker compose up --build
```

URLs:

```txt
Frontend: http://127.0.0.1:5173
Backend:  http://127.0.0.1:8000
API docs: http://127.0.0.1:8000/docs
```

Para parar:

```powershell
docker compose down
```

Para apagar o banco SQLite criado no volume e recomeçar com os dados iniciais:

```powershell
docker compose down --volumes
```

## Rodar o backend localmente

Use Python 3.12 ou 3.13. Com Python 3.14, o `SQLModel/Pydantic` pode falhar ao interpretar os modelos.

```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

A API ficará em:

```txt
http://127.0.0.1:8000
```

Documentação automática:

```txt
http://127.0.0.1:8000/docs
```

O banco SQLite é criado automaticamente em `backend/projetai.db` com dados iniciais.

### Claude API

O backend já está preparado para usar Claude na tutoria e na criação de tarefas por IA. Antes de iniciar o `uvicorn`, configure a chave no PowerShell:

```powershell
$env:ANTHROPIC_API_KEY="sua-chave-da-claude-api"
$env:ANTHROPIC_MODEL="claude-haiku-4-5"
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Sem `ANTHROPIC_API_KEY`, o sistema usa um fallback local para não quebrar a demonstração.

## Rodar o frontend

Use Node `20.19+` ou `22.12+`.

```powershell
cd frontend
npm install
npm run dev
```

O frontend ficará em:

```txt
http://127.0.0.1:5173
```

Se a API estiver em outra URL, crie `frontend/.env.local`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## Funcionalidades da Sprint 3

- Login real com JWT.
- Projetos carregados da API em vez de mock local.
- Persistência de tarefas, status, responsáveis, notas e solicitações em SQLite.
- Professor cria trabalhos com divisão de tarefas assistida por IA.
- Aluno conversa com tutor IA dentro da tarefa.
- Endpoints protegidos por perfil de usuário.
