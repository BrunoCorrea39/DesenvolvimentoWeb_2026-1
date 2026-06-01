# Plano de Execução - ProjetaEscola AI (Versão Anti-Panelinha)



## 1. Descrição do Problema e Usuário-Alvo

- **Usuário-Alvo:** Professores e estudantes da Educação Básica.

- **Problema:** Trabalhos em grupo na escola frequentemente sofrem com dois problemas: a formação de "panelinhas" (isolando alunos e impedindo a socialização da turma) e a divisão injusta de tarefas, onde um ou dois alunos acabam sobrecarregados enquanto outros não participam.



## 2. Entidades do Sistema (Escopo Enxuto)

Mantendo o foco em um sistema enxuto e funcional:

1. **User:** `id`, `nome`, `email`, `senha_hash`, `cargo` (professor ou estudante).

2. **Project:** `id`, `titulo`, `materia`, `conteudo_base`, `professor_id` (FK).

3. **Team:** `id`, `project_id` (FK), `nome_equipe`.

4. **Task:** `id`, `team_id` (FK), `student_id` (FK, alocado pelo sistema), `titulo`, `descricao`, `data_entrega`, `status`.



## 3. Funcionalidade de IA e Integração no Fluxo

A IA atuará como uma **Engenheira Pedagógica de Carga de Trabalho**.

- **O Fluxo:** O professor cria o trabalho informando apenas a matéria, o conteúdo e a data final. O sistema (via backend) sorteia os grupos aleatoriamente para quebrar as panelinhas. 

- **Onde entra a IA:** A IA recebe o conteúdo do trabalho e o tamanho do grupo. Ela analisa a complexidade do tema e quebra o trabalho em $N$ subtarefas com **pesos de esforço equivalentes** (ex: se o grupo tem 4 pessoas, ela gera 4 tarefas de igual dificuldade). A IA também define cronogramas parciais automáticos baseados na dificuldade de cada etapa. O sistema então aloca essas tarefas igualmente entre os membros sorteados.



## 4. Distribuição Preliminar de Tarefas por Sprint

- **Sprint 1 (Concluída):** Definição do escopo anti-panelinha, plano.md e prototipação das telas.

- **Sprint 2 (Frontend):** Criação das telas em React com dados mockados (Foco no painel do Professor criando o projeto e no painel do Aluno vendo sua equipe e tarefa sorteada).

- **Sprint 3 (Backend \& IA):** Rotas em FastAPI, lógica de sorteio de equipes, persistência e integração com a API de IA para divisão justa de tarefas.

- **Sprint 4 (Testes \& Deploy):** Deploy (Vercel/Render), testes de ponta a ponta e manual do usuário.

