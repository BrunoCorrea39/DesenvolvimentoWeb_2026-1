\# Plano de Execução - ProjetaEscola AI (Versão Anti-Panelinha)



\## 1. Descrição do Problema e Usuário-Alvo

\- \[cite\_start]\*\*Usuário-Alvo:\*\* Professores e estudantes da Educação Básica.

\- \*\*Problema:\*\* Trabalhos em grupo na escola frequentemente sofrem com dois problemas: a formação de "panelinhas" (isolando alunos e impedindo a socialização da turma) e a divisão injusta de tarefas, onde um ou dois alunos acabam sobrecarregados enquanto outros não participam.



\## 2. Entidades do Sistema (Escopo Enxuto)

\[cite\_start]Mantendo o foco em um sistema enxuto e funcional\[cite: 21, 22]:

1\. \*\*User:\*\* `id`, `nome`, `email`, `senha\_hash`, `cargo` (professor ou estudante).

2\. \*\*Project:\*\* `id`, `titulo`, `materia`, `conteudo\_base`, `professor\_id` (FK).

3\. \*\*Team:\*\* `id`, `project\_id` (FK), `nome\_equipe`.

4\. \*\*Task:\*\* `id`, `team\_id` (FK), `student\_id` (FK, alocado pelo sistema), `titulo`, `descricao`, `data\_entrega`, `status`.



\## 3. Funcionalidade de IA e Integração no Fluxo

A IA atuará como uma \*\*Engenheira Pedagógica de Carga de Trabalho\*\*.

\- \*\*O Fluxo:\*\* O professor cria o trabalho informando apenas a matéria, o conteúdo e a data final. O sistema (via backend) sorteia os grupos aleatoriamente para quebrar as panelinhas. 

\- \*\*Onde entra a IA:\*\* A IA recebe o conteúdo do trabalho e o tamanho do grupo. Ela analisa a complexidade do tema e quebra o trabalho em $N$ subtarefas com \*\*pesos de esforço equivalentes\*\* (ex: se o grupo tem 4 pessoas, ela gera 4 tarefas de igual dificuldade). A IA também define cronogramas parciais automáticos baseados na dificuldade de cada etapa. O sistema então aloca essas tarefas igualmente entre os membros sorteados.



\## 4. Distribuição Preliminar de Tarefas por Sprint

\- \[cite\_start]\*\*Sprint 1 (Concluída):\*\* Definição do escopo anti-panelinha, plano.md e prototipação das telas\[cite: 26, 29].

\- \[cite\_start]\*\*Sprint 2 (Frontend):\*\* Criação das telas em React com dados mockados (Foco no painel do Professor criando o projeto e no painel do Aluno vendo sua equipe e tarefa sorteada)\[cite: 38, 39].

\- \[cite\_start]\*\*Sprint 3 (Backend \& IA):\*\* Rotas em FastAPI, lógica de sorteio de equipes, persistência e integração com a API de IA para divisão justa de tarefas\[cite: 52, 54].

\- \[cite\_start]\*\*Sprint 4 (Testes \& Deploy):\*\* Deploy (Vercel/Render), testes de ponta a ponta e manual do usuário\[cite: 64, 66].

