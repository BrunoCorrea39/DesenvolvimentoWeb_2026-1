# 📖 Manual do Usuário — ProjetAí

**Disciplina:** Desenvolvimento de Aplicações Web (DWC08A) — UTFPR  
**Professor:** Luiz Rodrigues  
**Ambiente de Produção:** `https://projetai-utfpr.vercel.app/`

---

Este guia prático foi desenvolvido seguindo princípios de Interação Humano-Computador para garantir uma documentação concisa, de fácil pesquisa e estritamente focada nas tarefas concretas do usuário. 

O **ProjetAí** é uma plataforma que integra gerenciamento de projetos escolares (via quadros Kanban) a um sistema de tutoria assistido por Inteligência Artificial, eliminando a discrepância entre a expectativa de design e a experiência real de uso.

---

## 🔑 1. Credenciais de Acesso Rápido

Para realizar consultas pontuais e testes imediatos no ambiente de homologação, utilize as contas pré-configuradas no banco de dados:

| Perfil | E-mail / Login | Senha |
| :--- | :--- | :--- |
| **Professor** | `professor@escola.com` | `123456` |
| **Aluno** | `aluno(XX)(TURMA)@escola.com` | `123456` |

XX - Número do aluno (de 01 a 20).

TURMA - **a** ou **b**.

---

## 👨‍🏫 2. Painel do Professor: Criando Projetos com IA
*Fluxo focado na decomposição automatizada de escopo pedagógico pelo docente.*

### Etapas para execução da tarefa:
1. **Acesse a interface:** Na tela de login, insira o e-mail de professor e a senha. O sistema habilitará o botão "Entrar" automaticamente assim que os campos forem preenchidos.
2. **Escolha a série e turma desejada**: Na dashboard haverá as séries (8º, 9º ano, etc) e dentro das séries as turmas geridas pelo professor (9º ano A, 9º an0 B, etc). Selecione a turma desejada.
3. **Acompanhamento da turma**: Dentro da turma será possível vizualizar os alunos matriculados e os projetos já em andamento.  
4. **Gerar trabalho:** Na dashboard da turma, do lado esquerdo, está o campo para iniciar um novo projeto.
5. **Defina os Parâmetros:** No formulário , preencha o campo **Tema/Título** (Ex: *“Impactos da Revolução Industrial”*), estipule a quantidade de **Alunos por grupo**, dê as diretrizes do projeto e defina o prazo de entrega.
6. **Dispare o Processo:** Clique no botão de ação **"Distribuir com IA"**. O sistema exibirá um indicador visual de carregamento enquanto o backend consome a API. Em poucos segundos, o projeto persistido com seu quadro Kanban estruturado surgirá na tela.
7. **Acompanhamento do projeto**: Ao clicar no projeto criado, acompanhe o andamento do mesmo observando os grupos criados, sendo possível verificar os chats com IA de cada aluno e fazer alterações nos temas e tópicos caso julgue necessário.  

---

## 👨‍🎓 3. Painel do Aluno: Kanban e o Tutor IA
*Fluxo focado no avanço de atividades e resolução autônoma de dúvidas em contexto.*

### Etapas concretas para execução da tarefa:
1. **Selecione o Projeto:** Faça o login com o perfil de Aluno. Na listagem inicial de projetos, clique sobre o card do trabalho desejado para expandir o quadro Kanban.
2. **Movimente o Progresso:** Cada tarefa representa uma entrega específica. Para alterar o status de uma atividade, clique nos botões de transição (`⇄`) localizados no canto inferior do card. A tarefa se moverá instantaneamente entre as colunas (**A Fazer**, **Em Andamento** e **Concluído**), atualizando as informações no banco de dados.
3. **Acione o Tutor (IA):**
   * Clique sobre a tarefa em que possui dúvidas para abrir o painel lateral de ajuda contextualizada.
   * Digite seu questionamento diretamente no campo de texto do chat (Ex: *“O que foi a máquina a vapor?”*).
   * **Comportamento do Sistema:** Em alinhamento às boas práticas pedagógicas, a IA atuará como um guia. Ela **nunca** fornecerá respostas prontas para copiar e colar; em vez disso, devolverá perguntas reflexivas que instigam o usuário a formular o conhecimento por conta própria.
  
4. **Acidione uma tarefa (opicional)**: Caso o aluno deseje adicionar ou alterar uma tarefa e/ou tópico ao projeto, ele pode solicitar ao professor. Clique no cando superior direito em 'Solicitar nova tarefa'. Insira o título da tarefa, explique o que será feito nela, indique um dos alunos do grupo para ser o responsável por ela e envie o pedido. O professor receberá o pedido e caso aceite a nova tarefa irá aparecer na dashboard.  

---

## ❓ 4. Perguntas Frequentes (FAQ)
*Consultas gerais e descontextualizadas para resolução rápida de problemas de infraestrutura.*

#### 1. Cliquei em entrar e o sistema retornou erro de rede ou ficou carregando infinitamente. O que fazer?
* **Causa:** O backend da aplicação está hospedado em servidores de camada gratuita que entram em modo de repouso (*Cold Start*) após 15 minutos de inatividade para poupar recursos.
* **Solução:** Aguarde cerca de 30 segundos para o servidor acordar e restabelecer as conexões assíncronas, então atualize a página (F5).

#### 2. O histórico do chat com a IA sumiu quando fechei o navegador?
* **Causa:** Nenhuma.
* **Garantia:** Ao contrário de dados mockados voláteis, todas as interações do chat são salvas de forma relacional através do **SQLModel** no banco de dados PostgreSQL. Suas consultas pontuais permanecem gravadas de forma definitiva e segura e serão recarregadas no próximo login.
