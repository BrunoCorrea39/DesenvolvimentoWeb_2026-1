import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import TeacherCalendarView from '../components/teacher/TeacherCalendarView';
import TeacherClassesView from '../components/teacher/TeacherClassesView';
import TeacherGroupDetail from '../components/teacher/TeacherGroupDetail';
import TeacherGroupsView from '../components/teacher/TeacherGroupsView';
import TeacherSettingsView from '../components/teacher/TeacherSettingsView';
import TeacherWorksView from '../components/teacher/TeacherWorksView';
import TeacherYearsView from '../components/teacher/TeacherYearsView';
import { mockAnos, mockTurmasPorAno } from '../mock/dadosMockados';

const MENU_ITEMS = ['turmas', 'calendário', 'configurações'];

export default function DashboardProfessor({ projetos, setProjetos, onLogout }) {
  const [menuAtivo, setMenuAtivo] = useState('turmas');
  const [janelaAtiva, setJanelaAtiva] = useState('anosHub');
  const [anoSelecionado, setAnoSelecionado] = useState(null);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [trabalhoSelecionado, setTrabalhoSelecionado] = useState(null);
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [tituloTrab, setTituloTrab] = useState('');
  const [conteudoTrab, setConteudoTrab] = useState('');
  const [novaTarefaNome, setNovaTarefaNome] = useState('');
  const [novaTarefaResp, setNovaTarefaResp] = useState('');
  const [tarefaChatEspiado, setTarefaChatEspiado] = useState(null);
  const [notaColetiva, setNotaColetiva] = useState('');

  const trabalhoAtual = projetos.find((projeto) => projeto.id === trabalhoSelecionado?.id);
  const grupoAtual = trabalhoAtual?.grupos.find((grupo) => grupo.id === grupoSelecionado?.id);

  const handleMenuChange = (menu) => {
    setMenuAtivo(menu);
    setJanelaAtiva('anosHub');
  };

  const handleAlternarStatusProf = (projId, grupoId, tarefaId) => {
    const ciclo = { 'A Fazer': 'Em Andamento', 'Em Andamento': 'Concluído', 'Concluído': 'A Fazer' };

    setProjetos(
      projetos.map((projeto) => {
        if (projeto.id !== projId) return projeto;

        return {
          ...projeto,
          grupos: projeto.grupos.map((grupo) => {
            if (grupo.id !== grupoId) return grupo;

            return {
              ...grupo,
              tarefas: grupo.tarefas.map((tarefa) =>
                tarefa.id === tarefaId ? { ...tarefa, status: ciclo[tarefa.status] } : tarefa
              )
            };
          })
        };
      })
    );
  };

  const handleNotaIndividual = (projId, grupoId, tarefaId, notaValor) => {
    setProjetos(
      projetos.map((projeto) => {
        if (projeto.id !== projId) return projeto;

        return {
          ...projeto,
          grupos: projeto.grupos.map((grupo) => {
            if (grupo.id !== grupoId) return grupo;

            return {
              ...grupo,
              tarefas: grupo.tarefas.map((tarefa) =>
                tarefa.id === tarefaId ? { ...tarefa, nota: notaValor ? Number(notaValor) : null } : tarefa
              )
            };
          })
        };
      })
    );
  };

  const gerenciarSolicitacao = (projId, grupoId, solId, aprovar) => {
    setProjetos(
      projetos.map((projeto) => {
        if (projeto.id !== projId) return projeto;

        return {
          ...projeto,
          grupos: projeto.grupos.map((grupo) => {
            if (grupo.id !== grupoId) return grupo;

            const solicitacao = grupo.solicitacoesTarefas.find((item) => item.id === solId);
            const tarefas = [...grupo.tarefas];
            if (aprovar && solicitacao) {
              tarefas.push({
                id: Date.now(),
                titulo: `[Aprovado] ${solicitacao.titulo}`,
                descricao: solicitacao.descricao,
                responsavel: solicitacao.responsavel,
                status: 'A Fazer',
                prazo: 'Definido por Prof',
                nota: null,
                chatHistory: []
              });
            }

            return {
              ...grupo,
              solicitacoesTarefas: grupo.solicitacoesTarefas.filter((item) => item.id !== solId),
              tarefas
            };
          })
        };
      })
    );
  };

  const handleMudarResponsavel = (projId, grupoId, tarefaId, novoDono) => {
    setProjetos(
      projetos.map((projeto) => {
        if (projeto.id !== projId) return projeto;

        return {
          ...projeto,
          grupos: projeto.grupos.map((grupo) => {
            if (grupo.id !== grupoId) return grupo;

            return {
              ...grupo,
              tarefas: grupo.tarefas.map((tarefa) =>
                tarefa.id === tarefaId ? { ...tarefa, responsavel: novoDono } : tarefa
              )
            };
          })
        };
      })
    );
  };

  const handleExcluirTarefa = (projId, grupoId, tarefaId) => {
    setProjetos(
      projetos.map((projeto) => {
        if (projeto.id !== projId) return projeto;

        return {
          ...projeto,
          grupos: projeto.grupos.map((grupo) =>
            grupo.id === grupoId ? { ...grupo, tarefas: grupo.tarefas.filter((tarefa) => tarefa.id !== tarefaId) } : grupo
          )
        };
      })
    );
  };

  const handleAdicionarTarefaManual = (event, projId, grupoId) => {
    event.preventDefault();
    if (!novaTarefaNome.trim() || !novaTarefaResp) return;

    const novaTarefa = {
      id: Date.now(),
      titulo: novaTarefaNome,
      descricao: 'Inclusão manual do professor.',
      responsavel: novaTarefaResp,
      status: 'A Fazer',
      prazo: 'A combinar',
      nota: null,
      chatHistory: []
    };

    setProjetos(
      projetos.map((projeto) => {
        if (projeto.id !== projId) return projeto;

        return {
          ...projeto,
          grupos: projeto.grupos.map((grupo) =>
            grupo.id === grupoId ? { ...grupo, tarefas: [...grupo.tarefas, novaTarefa] } : grupo
          )
        };
      })
    );
    setNovaTarefaNome('');
  };

  const handleCriarTrabalhoIA = (event) => {
    event.preventDefault();
    if (!tituloTrab || !conteudoTrab) return;

    setCarregandoIA(true);
    setTimeout(() => {
      const novoTrabalho = {
        id: Date.now(),
        turmaId: turmaSelecionada.id,
        titulo: tituloTrab,
        materia: 'História',
        conteudo: conteudoTrab,
        grupos: [
          {
            id: `g_v4_${Date.now()}`,
            nome: 'Grupo 1 - Gerado por IA',
            integrantes: ['Guilherme', 'Sophia', 'Lucas'],
            progresso: 0,
            notaColetiva: null,
            solicitacoesTarefas: [],
            tarefas: [
              {
                id: Date.now() + 5,
                titulo: 'Pesquisa Temática',
                responsavel: 'Guilherme',
                status: 'A Fazer',
                prazo: '10/06',
                nota: null,
                chatHistory: []
              }
            ]
          }
        ]
      };

      setProjetos((projetosAtuais) => [novoTrabalho, ...projetosAtuais]);
      setTituloTrab('');
      setConteudoTrab('');
      setCarregandoIA(false);
    }, 1200);
  };

  const handleSalvarNotasColetiva = (projId, grupoId) => {
    setProjetos(
      projetos.map((projeto) => {
        if (projeto.id !== projId) return projeto;

        return {
          ...projeto,
          grupos: projeto.grupos.map((grupo) =>
            grupo.id === grupoId ? { ...grupo, notaColetiva: notaColetiva ? Number(notaColetiva) : grupo.notaColetiva } : grupo
          )
        };
      })
    );
    alert('Nota do grupo salva!');
  };

  return (
    <AppLayout
      profile={{ initials: 'PF', name: 'Prof. Fernando', subtitle: 'História' }}
      menuItems={MENU_ITEMS}
      activeMenu={menuAtivo}
      onMenuChange={handleMenuChange}
      onLogout={onLogout}
      accent="purple"
    >
      {menuAtivo === 'calendário' && <TeacherCalendarView />}
      {menuAtivo === 'configurações' && <TeacherSettingsView />}

      {menuAtivo === 'turmas' && janelaAtiva === 'anosHub' && (
        <TeacherYearsView
          anos={mockAnos}
          onSelectAno={(ano) => {
            setAnoSelecionado(ano);
            setJanelaAtiva('turmasHub');
          }}
        />
      )}

      {menuAtivo === 'turmas' && janelaAtiva === 'turmasHub' && (
        <TeacherClassesView
          anoSelecionado={anoSelecionado}
          turmas={mockTurmasPorAno[anoSelecionado?.id] || []}
          onBack={() => setJanelaAtiva('anosHub')}
          onSelectTurma={(turma) => {
            setTurmaSelecionada(turma);
            setJanelaAtiva('trabalhosHub');
          }}
        />
      )}

      {menuAtivo === 'turmas' && janelaAtiva === 'trabalhosHub' && (
        <TeacherWorksView
          turmaSelecionada={turmaSelecionada}
          projetos={projetos}
          tituloTrab={tituloTrab}
          conteudoTrab={conteudoTrab}
          carregandoIA={carregandoIA}
          onBack={() => setJanelaAtiva('turmasHub')}
          onTituloChange={setTituloTrab}
          onConteudoChange={setConteudoTrab}
          onCreateWork={handleCriarTrabalhoIA}
          onSelectTrabalho={(trabalho) => {
            setTrabalhoSelecionado(trabalho);
            setJanelaAtiva('gruposHub');
          }}
        />
      )}

      {menuAtivo === 'turmas' && janelaAtiva === 'gruposHub' && (
        <TeacherGroupsView
          trabalho={trabalhoAtual}
          grupos={trabalhoAtual?.grupos || []}
          onBack={() => setJanelaAtiva('trabalhosHub')}
          onSelectGrupo={(grupo) => {
            setGrupoSelecionado(grupo);
            setJanelaAtiva('grupoDetalhe');
            setTarefaChatEspiado(null);
          }}
        />
      )}

      {menuAtivo === 'turmas' && janelaAtiva === 'grupoDetalhe' && (
        <TeacherGroupDetail
          projeto={trabalhoAtual}
          grupo={grupoAtual}
          tarefaChatEspiado={tarefaChatEspiado}
          notaColetiva={notaColetiva}
          novaTarefaNome={novaTarefaNome}
          novaTarefaResp={novaTarefaResp}
          onBack={() => setJanelaAtiva('gruposHub')}
          onToggleStatus={handleAlternarStatusProf}
          onNotaIndividual={handleNotaIndividual}
          onMudarResponsavel={handleMudarResponsavel}
          onExcluirTarefa={handleExcluirTarefa}
          onNovaTarefaNomeChange={setNovaTarefaNome}
          onNovaTarefaRespChange={setNovaTarefaResp}
          onAdicionarTarefa={handleAdicionarTarefaManual}
          onGerenciarSolicitacao={gerenciarSolicitacao}
          onEspiarChat={setTarefaChatEspiado}
          onNotaColetivaChange={setNotaColetiva}
          onSalvarNotaColetiva={handleSalvarNotasColetiva}
        />
      )}
    </AppLayout>
  );
}
