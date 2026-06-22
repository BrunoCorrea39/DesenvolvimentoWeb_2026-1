# 🚀 ProjetAí — Gestão Escolar com IA

**Disciplina:** Desenvolvimento de Aplicações Web (DWC08A) — UTFPR  
**Professor:** Luiz Rodrigues  
**Status do Projeto:** Homologado e Hospedado em Produção  

---

## 📝 Sobre o Projeto

O **ProjetAí** é uma plataforma educacional desenvolvida para transformar a forma como trabalhos em grupo são gerenciados na educação básica. A aplicação resolve o descompasso comum entre o planejamento pedagógico do professor e o engajamento prático dos alunos. 

Em vez de incentivar a cultura do "copia e cola" promovida pelo uso sem critério de IAs genéricas, o ProjetAí utiliza Inteligência Artificial integrada ao método socrático de ensino. O sistema quebra temas complexos em tarefas justas dentro de um quadro Kanban e guia o aprendizado dos estudantes por meio de perguntas reflexivas, estimulando o pensamento crítico e o protagonismo juvenil.

---

## 🎯 Funcionalidades Principais (Features)

### 👨‍🏫 Para Professores: Automação Pedagógica
*   **Geração de Escopo por IA:** O docente insere apenas o tema central do trabalho (Ex: *"Impactos da Revolução Industrial"*) e o tamanho do grupo. A IA (Claude API) decompõe o assunto em frentes de trabalho equilibradas e paralelas automaticamente.
*   **Quadro Kanban Automatizado:** O projeto nasce com um cronograma visual de cards técnicos, poupando horas de planejamento do professor.
*   **Monitoramento Centralizado:** Painel administrativo para acompanhamento do progresso dos cards e lançamento de notas.

### 👨‍🎓 Para Alunos: Autonomia e Aprendizado Ativo
*   **Gerenciamento Ágil Interativo:** Interface simplificada para movimentação de cards (*A Fazer*, *Em Andamento*, *Concluído*), permitindo que o grupo dite seu próprio ritmo de entregas.
*   **Help Center Contextualizado:** Cada tarefa possui um chat exclusivo embutido, permitindo consultas pontuais e focadas na atividade.
*   **Tutor Integrado:** A IA consome o contexto do card e o histórico de mensagens para responder às dúvidas com *novos questionamentos*. O sistema é proibido de entregar respostas prontas, obrigando o aluno a pesquisar e formular o próprio conhecimento.

---

## 🏗️ Arquitetura do Ecossistema

Seguindo o modelo tradicional e moderno de aplicações web baseadas em APIs RESTful, o sistema opera de forma totalmente desacoplada:

*   **Frontend:** Interface SPA responsiva construída em **React (Vite)** com gerenciamento dinâmico de estados, hospedada na **Vercel**.
*   **Backend:** API robusta e modularizada construída em **FastAPI (Python 3.12)** com autenticação stateless **JWT** e esquemas de validação estrita via **Pydantic**. Hospedado na **Render**.
*   **Banco de Dados:** Persistência relacional de dados em nuvem utilizando **PostgreSQL**, mapeado e gerenciado via **SQLModel**.
*   **Inteligência Artificial:** Integração nativa e contextualizada com a API da **Anthropic (Claude)**.

---

## 🚀 Como Rodar o Projeto Localmente

Siga as instruções abaixo para configurar e executar os ambientes de desenvolvimento no seu computador.

### 📋 Pré-requisitos
*   **Python 3.12** instalado.
*   **Node.js** (versão 18 ou superior) instalado.
*   Uma chave de API da Anthropic (opcional, para geração real de IA local).

---

### 🔧 1. Configuração do Backend (API)

1. Entre no diretório do backend:
```bash
   cd backend
```

2. Crie e ative o ambiente virtual Python:
```bash
  python -m venv .venv
  # No Windows (Prompt de Comando):
  .venv\Scripts\activate
  # No Linux/macOS:
  source .venv/bin/activate
```

3. Instale todas as dependências requeridas pelo projeto:
```bash
  pip install -r requirements.txt
```

4. Crie um arquivo chamado .env na raiz da pasta backend/ e configure suas variáveis de ambiente:
```bash
  DATABASE_URL=postgresql+psycopg://usuario:senha@localhost:5432/nome_do_banco
  ANTHROPIC_API_KEY=sua_chave_da_api_da_claude
  JWT_SECRET_KEY=uma_chave_secreta_e_segura_aqui
```

(Nota: Para testes rápidos locais sem Postgres, você pode configurar o DATABASE_URL=sqlite:///./projetai.db alterando o driver no database.py se necessário).

5. Inicialize o servidor local via Uvicorn:
```bash  
  uvicorn app.main:app --reload
```

O backend estará disponível e documentado via Swagger UI em: http://localhost:8000/docs.

### 🔧 2. Configuração do Frontend (Interface)

1. Abra um novo terminal e entre no diretório do frontend:
```bash
  cd frontend
```

2. Instale os pacotes de dependências do Node:
```bash
  npm install
```

3. Crie um arquivo chamado .env na raiz da pasta frontend/ indicando o endereço local da sua API:
```bash
  VITE_API_URL=http://localhost:8000
```

4. Inicie o servidor de desenvolvimento do Vite:
```bash
  npm run dev
```

O navegador abrirá automaticamente o link local da aplicação (geralmente http://localhost:5173).



## Desenvolvedores e Contato
* Bruno Correa, Engenharia de Computação, UTFPR Campus Apucarana
* Rafael Ribas, Engenharia de Computação, UTFPR Campus Apucarana
