# Preparação da Review — Sprint 3 (Backend, Banco e IA)

**Data da review:** 15/06 · **Peso:** 40% · **Sistema:** ProjetAí

A review é uma daily de até 5 minutos. Os dois membros precisam dominar todas as frentes — o professor pode perguntar qualquer parte a qualquer um. Este documento tem três blocos: roteiro de demo, mapa dos critérios para o código e banco de perguntas técnicas.

---

## 1. Checklist antes de começar

1. Subir o backend com a chave da IA configurada (senão a IA cai no fallback local):
   ```powershell
   cd backend
   $env:ANTHROPIC_API_KEY="sua-chave"
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
2. Conferir `http://127.0.0.1:8000/api/health` retornando `{"status":"ok"}`.
3. Subir o frontend (`cd frontend; npm run dev`) em `http://127.0.0.1:5173`.
4. Deixar abertas duas abas/janelas: uma logada como professor, outra como aluno.
5. Deixar o Swagger aberto em `http://127.0.0.1:8000/docs` para mostrar a API.

Usuários de demonstração: `professor@escola.com` / `aluno@escola.com`, senha `123456`.

---

## 2. Roteiro de demonstração (5 min)

O foco da Sprint 3 é provar três coisas: **frontend consome a API real, persistência funciona e a IA opera de ponta a ponta**.

1. **Login real (JWT) — 30s.** Logar como aluno. Abrir o DevTools → aba Network → mostrar a chamada `POST /api/auth/login` devolvendo `access_token`, e as chamadas seguintes enviando `Authorization: Bearer ...`. Diz: "os dados não são mais mockados, vêm da API protegida por token".

2. **Persistência real — 1min30.** Como aluno, mudar o status de uma tarefa (ex.: "Análise da Constituição de 1824") e mostrar a barra de progresso do grupo recalculada. **Recarregar a página** e mostrar que o estado persistiu — prova de que está no SQLite, não em memória.

3. **IA #1 — tutor pedagógico — 1min30.** Abrir o chat de uma tarefa (como o aluno responsável) e perguntar algo. Mostrar que a IA orienta com perguntas em vez de dar a resposta pronta. A conversa fica salva (recarregar e o histórico continua lá).

4. **IA #2 — divisão de tarefas — 1min.** Logar como professor, criar um trabalho com "divisão assistida por IA". Mostrar que o sistema gera as tarefas e distribui entre os integrantes automaticamente.

5. **Proteção por perfil — 30s.** No Swagger, tentar `POST /api/projects/ai` com o token do aluno → mostrar o `403`. Reforça que endpoints sensíveis são protegidos por papel.

---

## 3. Mapa dos critérios de avaliação → onde está no código

| Critério da Sprint 3 | Onde está | Observação |
| --- | --- | --- |
| Backend em módulos com responsabilidades separadas | `routers/` (auth, projects), `models.py`, `schemas.py`, `auth.py`, `config.py`, `database.py`, `services.py` | Rotas, modelos, schemas, autenticação e config em arquivos distintos. |
| Schemas Pydantic alinhados ao frontend | `schemas.py` | Campos em português (`titulo`, `descricao`, `responsavel`, `nota`, `notaColetiva`, `turmaId`) batendo com o que o React envia. |
| Erros descritivos e códigos HTTP adequados | `routers/projects.py`, `routers/auth.py`, `auth.py` | `401` (login/token), `403` (perfil), `404` (não encontrado), `422` (nota fora de 0–10). |
| JWT com proteção coerente | `auth.py` + dependências `get_current_user` / `require_professor` | Endpoints de escrita exigem token; ações de professor exigem papel. |
| Modelos SQLModel refletindo o domínio | `models.py` | 6 entidades: `User`, `Project`, `Group`, `Task`, `TaskRequest`, `ChatMessage`, com chaves estrangeiras. |
| IA agregando valor real ao fluxo | `services.py` (`call_claude`, `generate_tutor_response`, `generate_ai_tasks`) | Duas funcionalidades de IA integradas ao fluxo do aluno e do professor, com fallback. |

---

## 4. Banco de perguntas técnicas (e respostas)

### Autenticação / JWT
- **Como o login funciona?** `POST /api/auth/login` valida e-mail e senha; se ok, `create_access_token` gera um JWT (PyJWT, algoritmo HS256) com `sub` (id), `role` e `exp`. O frontend guarda o token e o envia no header `Authorization: Bearer` nas próximas chamadas.
- **Como a senha é verificada?** `verify_password` compara o hash SHA-256 do que foi digitado com o hash salvo (`hash_password`). *(Ponto a evoluir: ver seção 5.)*
- **Como um endpoint sabe quem está logado?** Pela dependência `get_current_user`, que decodifica o token, valida e busca o `User` no banco. Token inválido/expirado → `401`.
- **Como protege ações só de professor?** A dependência `require_professor` checa `user.role`; se não for professor, retorna `403`.
- **Validade do token?** 8 horas (`ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8`).

### Banco de dados / SQLModel
- **Quais entidades existem?** `User`, `Project`, `Group`, `Task`, `TaskRequest` e `ChatMessage`.
- **Como se relacionam?** `Project` tem grupos; `Group` tem tarefas, solicitações e integrantes; `Task` tem mensagens de chat. As ligações são feitas por chaves estrangeiras (`foreign_key="..."`) e resolvidas por consultas com `select().where()` em `services.py`.
- **Por que os integrantes do grupo são um campo JSON?** Decisão de escopo: a lista de nomes é guardada em `members_json` (Text) para simplificar. Uma evolução natural seria uma tabela de associação aluno↔grupo.
- **Como o banco é criado?** `create_db_and_tables()` no startup gera as tabelas; `seed_database()` popula dados iniciais só se o banco estiver vazio. Banco: SQLite (`projetai.db`).
- **Como o progresso do grupo é calculado?** `recalculate_group_progress` conta tarefas concluídas sobre o total e salva a porcentagem, rodando a cada mudança de status ou exclusão.

### IA
- **Quais são as funcionalidades de IA?** Duas: (1) **tutor pedagógico** no chat da tarefa (`generate_tutor_response`) e (2) **divisão de tarefas assistida** na criação do projeto pelo professor (`generate_ai_tasks`).
- **Como a IA é chamada?** `call_claude` faz um POST para a API da Anthropic (`/v1/messages`) com `system` + `user` prompt. A chave vem da variável de ambiente `ANTHROPIC_API_KEY`.
- **E se a IA falhar ou não houver chave?** Há fallback local determinístico nas duas funções, então a demo nunca quebra. Erros de rede/JSON são tratados em `call_claude` (retorna `None` → cai no fallback).
- **Por que o tutor não dá a resposta pronta?** É instruído no `system_prompt` a orientar por perguntas e passos — coerente com o domínio (educação básica).
- **Como garante que a divisão de tarefas é válida?** O retorno da IA é exigido em JSON; é feito `json.loads`, filtragem dos campos obrigatórios e checagem de que o responsável é um integrante real. JSON inválido → fallback.

### Frontend ↔ API
- **Como o frontend consome a API?** `frontend/src/services/api.js` centraliza as chamadas `fetch`, injeta o header do token e trata erros, lançando `data.detail` quando a resposta não é ok.
- **Onde estava o mock antes?** Em `src/mock/dadosMockados.js` (Sprint 2). Na Sprint 3 os dados passam a vir de `GET /api/projects`.
- **CORS?** Configurado em `main.py` liberando as origens do Vite (`localhost:5173` / `127.0.0.1:5173`).

---

## 5. Pontos a melhorar (assumir com honestidade se perguntado)

Reconhecer limitações conta a favor numa review. Estes são pontos conscientes, alguns já mirando a Sprint 4:

- **Hash de senha:** usa SHA-256 sem salt. O ideal é `bcrypt`/`argon2` (via `passlib`). Funcional para a demo, mas não é o padrão de produção.
- **Segredo do JWT:** `JWT_SECRET_KEY` está fixo em `config.py`. Deve ir para variável de ambiente antes do deploy (Sprint 4, critério "credenciais sem chaves expostas").
- **`@app.on_event("startup")`:** está depreciado nas versões recentes do FastAPI; a recomendação atual é usar *lifespan handlers* (`lifespan=...`). Troca simples e vale fazer.
- **Relacionamentos SQLModel:** existem as chaves estrangeiras, mas não há `Relationship()` declarado — as junções são manuais. Funciona, mas declarar relacionamentos deixaria o modelo mais expressivo.
- **Integrantes fixos na criação por IA:** `create_project_with_ai` usa uma lista de nomes fixa (`["Guilherme", "Sophia", "Lucas"]`). Numa próxima iteração viria da turma real.

---

## 6. Resumo de 30 segundos (abertura da review)

> "O ProjetAí ajuda professores e alunos a gerir trabalhos em grupo. Nesta sprint o frontend deixou de usar mock e passou a consumir uma API FastAPI com SQLModel e SQLite, login por JWT com proteção por perfil, e duas funcionalidades de IA: um tutor que orienta o aluno sem entregar a resposta pronta, e a divisão automática de tarefas quando o professor cria um trabalho. Tudo persiste no banco e funciona de ponta a ponta."
