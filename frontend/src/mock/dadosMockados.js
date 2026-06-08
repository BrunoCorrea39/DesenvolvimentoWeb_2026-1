// src/mock/dadosMockados.js

export const mockAnos = [
  { id: "9", nome: "9º Ano - Ensino Fundamental" },
  { id: "1", nome: "1º Ano - Ensino Médio" }
];

export const mockTurmasPorAno = {
  "9": [
    { id: "9a", nome: "Turma A (Matutino)" },
    { id: "9b", nome: "Turma B (Vespertino)" }
  ],
  "1": [
    { id: "1a", nome: "Turma A" }
  ]
};

export const mockProjetosIniciais = [
  {
    id: 101,
    turmaId: "9a",
    titulo: "Brasil Império: Primeiro Reinado",
    materia: "História",
    conteudo: "Análise crítica sobre a outorga da Constituição de 1824 e o Poder Moderador.",
    grupos: [
      {
        id: "g2",
        nome: "Grupo 2 - Sorteado por IA",
        integrantes: ["Bruno", "Sua Dupla", "Mariana", "Carlos"],
        progresso: 25,
        notaColetiva: null,
        
        // SOLICITAÇÃO DE MUDANÇA ADICIONADA AQUI PARA O TESTE
        solicitacoesTarefas: [
          { 
            id: 901, 
            titulo: "Mudança de escopo: Redação para Podcast", 
            descricao: "Solicito alterar o formato da minha tarefa de Redação do Resumo para a gravação de um Podcast de 3 minutos sobre a visão das províncias, mantendo o mesmo nível de esforço.", 
            responsavel: "Carlos" 
          }
        ],
        
        tarefas: [
          { 
            id: 201, 
            titulo: "Pesquisa: A vinda da Família Real", 
            descricao: "Analisar as mudanças econômicas com a abertura dos portos em 1808.", 
            responsavel: "Bruno", 
            status: "Concluído", 
            prazo: "08/06", 
            nota: 10,
            chatHistory: [
              { id: 1, sender: "ia", text: "Olá Bruno! Como posso te ajudar na sua pesquisa sobre a Família Real?" },
              { id: 2, sender: "aluno", text: "Me dá a resposta pronta sobre a abertura dos portos." },
              { id: 3, sender: "ia", text: "Se eu te der pronto, você não aprende! Pense: quem se beneficiou quando o Brasil abriu os portos para as nações amigas?" }
            ]
          },
          { 
            id: 202, 
            titulo: "Análise da Constituição de 1824", 
            descricao: "Estudar o papel do Poder Moderador na centralização política.", 
            responsavel: "Sua Dupla", 
            status: "Em Andamento", 
            prazo: "11/06", 
            nota: null,
            chatHistory: [
              { id: 1, sender: "ia", text: "Olá! Pronto para desvendar a constituição de 1824?" },
              { id: 2, sender: "aluno", text: "O que era o poder moderador?" }
            ]
          },
          { id: 203, titulo: "Montagem dos Slides do Grupo", descricao: "Compilar dados visuais e tópicos sintéticos.", responsavel: "Mariana", status: "A Fazer", prazo: "15/06", nota: null, chatHistory: [] },
          { id: 204, titulo: "Redação do Resumo Crítico", descricao: "Texto dissertativo-argumentativo de fechamento.", responsavel: "Carlos", status: "A Fazer", prazo: "15/06", nota: null, chatHistory: [] }
        ]
      },
      {
        id: "g1",
        nome: "Grupo 1 - Sorteado por IA",
        integrantes: ["Pedro", "Aline", "Julia"],
        progresso: 0,
        notaColetiva: null,
        solicitacoesTarefas: [],
        tarefas: [
          { id: 301, titulo: "Mapeamento das Províncias", descricao: "Levantar focos de resistência nas províncias.", responsavel: "Pedro", status: "A Fazer", prazo: "08/06", nota: null, chatHistory: [] }
        ]
      }
    ]
  }
];