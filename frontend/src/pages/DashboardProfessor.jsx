import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import PersonalCalendar from '../components/common/PersonalCalendar';
import TeacherClassesView from '../components/teacher/TeacherClassesView';
import TeacherGroupDetail from '../components/teacher/TeacherGroupDetail';
import TeacherGroupsView from '../components/teacher/TeacherGroupsView';
import TeacherSettingsView from '../components/teacher/TeacherSettingsView';
import TeacherWorksView from '../components/teacher/TeacherWorksView';
import TeacherYearsView from '../components/teacher/TeacherYearsView';
import {
  createProjectWithAI,
  createTask,
  deleteProject,
  deleteTask,
  fetchClasses,
  fetchClassStudents,
  resolveTaskRequest,
  updateGroupGrade,
  updateTask,
  updateTaskStatus
} from '../services/api';

const MENU_ITEMS = ['turmas', 'calendário', 'configurações'];

export default function DashboardProfessor({ projetos, token, currentUser, onProjectsChanged, onLogout }) {
  const [menuAtivo, setMenuAtivo] = useState('turmas');
  const [janelaAtiva, setJanelaAtiva] = useState('anosHub');
  const [anoSelecionado, setAnoSelecionado] = useState(null);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [trabalhoSelecionado, setTrabalhoSelecionado] = useState(null);
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [tituloTrab, setTituloTrab] = useState('');
  const [conteudoTrab, setConteudoTrab] = useState('');
  const [numeroGrupos, setNumeroGrupos] = useState(1);
  const [prazoTrab, setPrazoTrab] = useState('');
  const [novaTarefaNome, setNovaTarefaNome] = useState('');
  const [novaTarefaResp, setNovaTarefaResp] = useState('');
  const [tarefaChatEspiado, setTarefaChatEspiado] = useState(null);
  const [notaColetiva, setNotaColetiva] = useState('');
  const [alunosTurma, setAlunosTurma] = useState([]);
  const [carregandoAlunos, setCarregandoAlunos] = useState(false);
  const [anos, setAnos] = useState([]);

  const trabalhoAtual = projetos.find((projeto) => projeto.id === trabalhoSelecionado?.id);
  const grupoAtual = trabalhoAtual?.grupos.find((grupo) => grupo.id === grupoSelecionado?.id);
  const turmasDoAno = anos.find((ano) => ano.id === anoSelecionado?.id)?.turmas || [];

  useEffect(() => {
    let ativo = true;
    fetchClasses(token)
      .then((dados) => {
        if (ativo) setAnos(dados);
      })
      .catch(() => {
        if (ativo) setAnos([]);
      });
    return () => {
      ativo = false;
    };
  }, [token]);

  const handleMenuChange = (menu) => {
    setMenuAtivo(menu);
    setJanelaAtiva('anosHub');
  };

  const carregarAlunosDaTurma = async (turmaId) => {
    setCarregandoAlunos(true);
    try {
      const alunos = await fetchClassStudents(token, turmaId);
      setAlunosTurma(alunos);
    } catch (error) {
      setAlunosTurma([]);
      alert(error.message);
    } finally {
      setCarregandoAlunos(false);
    }
  };

  const handleAlternarStatusProf = async (_projId, _grupoId, tarefaId) => {
    try {
      await updateTaskStatus(token, tarefaId);
      await onProjectsChanged();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleNotaIndividual = async (_projId, _grupoId, tarefaId, notaValor) => {
    try {
      await updateTask(token, tarefaId, { nota: notaValor ? Number(notaValor) : null });
      await onProjectsChanged();
    } catch (error) {
      alert(error.message);
    }
  };

  const gerenciarSolicitacao = async (_projId, _grupoId, solId, aprovar) => {
    try {
      await resolveTaskRequest(token, solId, aprovar);
      await onProjectsChanged();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleMudarResponsavel = async (_projId, _grupoId, tarefaId, novoDono) => {
    try {
      await updateTask(token, tarefaId, { responsavel: novoDono });
      await onProjectsChanged();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleExcluirTarefa = async (_projId, _grupoId, tarefaId) => {
    try {
      await deleteTask(token, tarefaId);
      await onProjectsChanged();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAdicionarTarefaManual = async (event, _projId, grupoId) => {
    event.preventDefault();
    if (!novaTarefaNome.trim() || !novaTarefaResp) return;

    try {
      await createTask(token, grupoId, {
        titulo: novaTarefaNome,
      descricao: 'Inclusão manual do professor.',
      responsavel: novaTarefaResp,
        prazo: 'A combinar'
      });
      await onProjectsChanged();
      setNovaTarefaNome('');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCriarTrabalhoIA = async (event) => {
    event.preventDefault();
    if (!tituloTrab || !conteudoTrab) return;

    setCarregandoIA(true);
    try {
      await createProjectWithAI(token, {
        turmaId: turmaSelecionada.id,
        titulo: tituloTrab,
        conteudo: conteudoTrab,
        numeroGrupos,
        prazo: prazoTrab || null
      });
      await onProjectsChanged();
      await carregarAlunosDaTurma(turmaSelecionada.id);
      setTituloTrab('');
      setConteudoTrab('');
      setNumeroGrupos(1);
      setPrazoTrab('');
    } catch (error) {
      alert(error.message);
    } finally {
      setCarregandoIA(false);
    }
  };

  const handleExcluirTrabalho = async (trabalho) => {
    if (!window.confirm(`Excluir o trabalho "${trabalho.titulo}"? Esta ação não pode ser desfeita.`)) return;

    try {
      await deleteProject(token, trabalho.id);
      await onProjectsChanged();
      if (trabalhoSelecionado?.id === trabalho.id) {
        setTrabalhoSelecionado(null);
        setJanelaAtiva('trabalhosHub');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSalvarNotasColetiva = async (_projId, grupoId) => {
    try {
      await updateGroupGrade(token, grupoId, Number(notaColetiva));
      await onProjectsChanged();
      alert('Nota do grupo salva!');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <AppLayout
      profile={{ initials: 'PF', name: currentUser?.name || 'Prof. Fernando', subtitle: currentUser?.subject || 'História' }}
      menuItems={MENU_ITEMS}
      activeMenu={menuAtivo}
      onMenuChange={handleMenuChange}
      onLogout={onLogout}
      accent="purple"
    >
      {menuAtivo === 'calendário' && <PersonalCalendar token={token} accent="purple" titulo="Agenda do Professor" projetos={projetos} />}
      {menuAtivo === 'configurações' && <TeacherSettingsView />}

      {menuAtivo === 'turmas' && janelaAtiva === 'anosHub' && (
        <TeacherYearsView
          anos={anos}
          onSelectAno={(ano) => {
            setAnoSelecionado(ano);
            setJanelaAtiva('turmasHub');
          }}
        />
      )}

      {menuAtivo === 'turmas' && janelaAtiva === 'turmasHub' && (
        <TeacherClassesView
          anoSelecionado={anoSelecionado}
          turmas={turmasDoAno}
          onBack={() => setJanelaAtiva('anosHub')}
          onSelectTurma={async (turma) => {
            setTurmaSelecionada(turma);
            setAlunosTurma([]);
            setJanelaAtiva('trabalhosHub');
            await carregarAlunosDaTurma(turma.id);
          }}
        />
      )}

      {menuAtivo === 'turmas' && janelaAtiva === 'trabalhosHub' && (
        <TeacherWorksView
          turmaSelecionada={turmaSelecionada}
          projetos={projetos}
          tituloTrab={tituloTrab}
          conteudoTrab={conteudoTrab}
          numeroGrupos={numeroGrupos}
          prazoTrab={prazoTrab}
          carregandoIA={carregandoIA}
          alunosTurma={alunosTurma}
          carregandoAlunos={carregandoAlunos}
          onBack={() => setJanelaAtiva('turmasHub')}
          onTituloChange={setTituloTrab}
          onConteudoChange={setConteudoTrab}
          onNumeroGruposChange={setNumeroGrupos}
          onPrazoChange={setPrazoTrab}
          onCreateWork={handleCriarTrabalhoIA}
          onSelectTrabalho={(trabalho) => {
            setTrabalhoSelecionado(trabalho);
            setJanelaAtiva('gruposHub');
          }}
          onDeleteWork={handleExcluirTrabalho}
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
