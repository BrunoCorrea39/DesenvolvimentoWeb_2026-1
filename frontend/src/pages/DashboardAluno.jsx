import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import PersonalCalendar from '../components/common/PersonalCalendar';
import StudentPersonalTasks from '../components/student/StudentPersonalTasks';
import StudentProjectDetail from '../components/student/StudentProjectDetail';
import StudentProjectsView from '../components/student/StudentProjectsView';
import StudentSettingsView from '../components/student/StudentSettingsView';
import StudentTaskDetail from '../components/student/StudentTaskDetail';
import TaskRequestModal from '../components/student/TaskRequestModal';
import { createTaskRequest, sendTaskMessage, updateTaskStatus } from '../services/api';

const MEU_NOME = 'Bruno';
const MENU_ITEMS = ['Projetos', 'Minhas tarefas', 'Calendário', 'Configurações'];

export default function DashboardAluno({ projetos, token, currentUser, onProjectsChanged, onLogout }) {
  const [menuAtivo, setMenuAtivo] = useState('Projetos');
  const [janelaAtiva, setJanelaAtiva] = useState('hub');
  const [projetoSelecionado, setProjetoSelecionado] = useState(null);
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [novaTitulo, setNovaTitulo] = useState('');
  const [novaDesc, setNovaDesc] = useState('');
  const [novaResp, setNovaResp] = useState(currentUser?.name || MEU_NOME);
  const [notificacoes, setNotificacoes] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [digitando, setDigitando] = useState(false);

  const projetoAtual = projetos.find((projeto) => projeto.id === projetoSelecionado?.id);
  const grupoAtual = projetoAtual?.grupos.find((grupo) => grupo.id === grupoSelecionado?.id);
  const tarefaAtual = grupoAtual?.tarefas.find((tarefa) => tarefa.id === tarefaSelecionada?.id);
  const meuNome = currentUser?.name || MEU_NOME;
  const iniciais = meuNome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase();

  const handleMenuChange = (menu) => {
    setMenuAtivo(menu);
    setJanelaAtiva('hub');
  };

  const handleOpenProject = (projeto, grupo) => {
    setProjetoSelecionado(projeto);
    setGrupoSelecionado(grupo);
    setJanelaAtiva('projeto');
  };

  const handleMudarStatus = async (_projId, _grupoId, tarefaId, responsavel) => {
    if (responsavel !== meuNome) {
      alert('Apenas o responsável atribuído pode alterar o andamento desta tarefa.');
      return;
    }

    try {
      await updateTaskStatus(token, tarefaId);
      await onProjectsChanged();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSugerirTarefa = async (event) => {
    event.preventDefault();

    try {
      await createTaskRequest(token, grupoSelecionado.id, {
        titulo: novaTitulo,
        descricao: novaDesc,
        responsavel: novaResp
      });
      await onProjectsChanged();
      alert('Solicitação de tarefa enviada com sucesso para aprovação do professor!');
      setModalAberto(false);
      setNovaTitulo('');
      setNovaDesc('');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEnviarMensagem = async (event, _projId, _grupoId, tarefaId) => {
    event.preventDefault();
    if (!inputMessage.trim()) return;

    const mensagem = inputMessage;
    setInputMessage('');
    setDigitando(true);

    try {
      await sendTaskMessage(token, tarefaId, mensagem);
      await onProjectsChanged();
    } catch (error) {
      alert(error.message);
    } finally {
      setDigitando(false);
    }
  };

  return (
    <AppLayout
      profile={{ initials: iniciais || 'A', name: meuNome, subtitle: currentUser?.class_name || '' }}
      menuItems={MENU_ITEMS}
      activeMenu={menuAtivo}
      onMenuChange={handleMenuChange}
      onLogout={onLogout}
      accent="teal"
    >
      {menuAtivo === 'Minhas tarefas' && <StudentPersonalTasks projetos={projetos} meuNome={meuNome} />}
      {menuAtivo === 'Calendário' && <PersonalCalendar token={token} accent="teal" titulo="Meu Calendário" projetos={projetos} />}
      {menuAtivo === 'Configurações' && (
        <StudentSettingsView
          notificacoes={notificacoes}
          onToggleNotificacoes={() => setNotificacoes((valorAtual) => !valorAtual)}
        />
      )}

      {menuAtivo === 'Projetos' && janelaAtiva === 'hub' && (
        <StudentProjectsView projetos={projetos} meuNome={meuNome} onOpenProject={handleOpenProject} />
      )}

      {menuAtivo === 'Projetos' && janelaAtiva === 'projeto' && (
        <StudentProjectDetail
          projeto={projetoAtual}
          grupo={grupoAtual}
          meuNome={meuNome}
          onBack={() => setJanelaAtiva('hub')}
          onOpenTask={(tarefa) => {
            setTarefaSelecionada(tarefa);
            setJanelaAtiva('tarefa');
          }}
          onStatusChange={handleMudarStatus}
          onOpenTaskRequest={() => setModalAberto(true)}
        />
      )}

      {menuAtivo === 'Projetos' && janelaAtiva === 'tarefa' && (
        <StudentTaskDetail
          projeto={projetoAtual}
          grupo={grupoAtual}
          tarefa={tarefaAtual}
          meuNome={meuNome}
          inputMessage={inputMessage}
          digitando={digitando}
          onBack={() => setJanelaAtiva('projeto')}
          onMessageChange={setInputMessage}
          onSendMessage={handleEnviarMensagem}
        />
      )}

      {modalAberto && (
        <TaskRequestModal
          grupoSelecionado={grupoAtual}
          novaTitulo={novaTitulo}
          novaDesc={novaDesc}
          novaResp={novaResp}
          onTituloChange={setNovaTitulo}
          onDescChange={setNovaDesc}
          onRespChange={setNovaResp}
          onClose={() => setModalAberto(false)}
          onSubmit={handleSugerirTarefa}
        />
      )}
    </AppLayout>
  );
}
