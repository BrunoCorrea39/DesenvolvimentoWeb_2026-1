# Plano de Execução - ProjetaEscola AI (Versão Anti-Panelinha)


## 1. Descrição do Problema e Usuário-Alvo
- **Usuário-Alvo:** Professores e estudantes da Educação Básica.
- **Problema:** Trabalhos em grupo na escola frequentemente sofrem com dois problemas: a formação de "panelinhas" (isolando alunos e impedindo a socialização da turma) e a divisão injusta de tarefas, onde um ou dois alunos acabam sobrecarregados enquanto outros não participam.


## 2. Entidades do Sistema (Escopo Ajustado)
1. **User:** id, nome, email, senha_hash, cargo (professor ou estudante).
2. **Project:** id, titulo, materia, conteudo_base, professor_id (FK).
3. **Team:** id, project_id (FK), nome_equipe.
4. **Task:** id, team_id (FK), student_id (FK), titulo, descricao, data_entrega, status.
5. **ChatMessage (Nova):** id, task_id (FK), sender_id (FK), message_text, timestamp (Para persistência do histórico de orientações da IA).


## 3. Funcionalidade de IA e Integração no Fluxo
O sistema contará com uma IA de dupla atuação perfeitamente integrada ao fluxo:
1. **No planejamento (Foco do Professor):** A IA analisa o tema e divide o trabalho em subtarefas de peso e complexidade equivalentes para os membros da equipe sorteada.
2. **Na execução (Foco do Aluno):** Cada tarefa gerada terá um canal de chat direto com a IA. Esse chat funcionará como um **Tutor**. Através de engenharia de prompt no backend, a IA será instruída a nunca dar respostas prontas, mas sim fazer perguntas orientadoras, sugerir métodos de pesquisa e guiar o estudante no cumprimento daquela tarefa específica.


## 4. Distribuição Preliminar de Tarefas por Sprint
- **Sprint 1 (Concluída):** Definição do escopo anti-panelinha, plano.md e prototipação das telas.
- **Sprint 2 (Frontend):** Criação das telas em React com dados mockados (Foco no painel do Professor criando o projeto e no painel do Aluno vendo sua equipe e tarefa sorteada).
- **Sprint 3 (Backend \& IA):** Rotas em FastAPI, lógica de sorteio de equipes, persistência e integração com a API de IA para divisão justa de tarefas.
- **Sprint 4 (Testes \& Deploy):** Deploy (Vercel/Render), testes de ponta a ponta e manual do usuário.

