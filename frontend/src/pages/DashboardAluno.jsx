import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import StudentCalendarView from '../components/student/StudentCalendarView';
import StudentPersonalTasks from '../components/student/StudentPersonalTasks';
import StudentProjectDetail from '../components/student/StudentProjectDetail';
import StudentProjectsView from '../components/student/StudentProjectsView';
import StudentSettingsView from '../components/student/StudentSettingsView';
import StudentTaskDetail from '../components/student/StudentTaskDetail';
import TaskRequestModal from '../components/student/TaskRequestModal';

const MEU_NOME = 'Bruno';
const MENU_ITEMS = ['Projetos', 'Minhas tarefas', 'Calendário', 'Configurações'];

export default function DashboardAluno({ projetos, setProjetos, onLogout }) {
  const [menuAtivo, setMenuAtivo] = useState('Projetos');
  const [janelaAtiva, setJanelaAtiva] = useState('hub');
  const [projetoSelecionado, setProjetoSelecionado] = useState(null);
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [novaTitulo, setNovaTitulo] = useState('');
  const [novaDesc, setNovaDesc] = useState('');
  const [novaResp, setNovaResp] = useState(MEU_NOME);
  const [notificacoes, setNotificacoes] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [digitando, setDigitando] = useState(false);

  const projetoAtual = projetos.find((projeto) => projeto.id === projetoSelecionado?.id);
  const grupoAtual = projetoAtual?.grupos.find((grupo) => grupo.id === grupoSelecionado?.id);
  const tarefaAtual = grupoAtual?.tarefas.find((tarefa) => tarefa.id === tarefaSelecionada?.id);

  const handleMenuChange = (menu) => {
    setMenuAtivo(menu);
    setJanelaAtiva('hub');
  };

  const handleOpenProject = (projeto, grupo) => {
    setProjetoSelecionado(projeto);
    setGrupoSelecionado(grupo);
    setJanelaAtiva('projeto');
  };

  const handleMudarStatus = (projId, grupoId, tarefaId, responsavel) => {
    if (responsavel !== MEU_NOME) {
      alert('Apenas o responsável atribuído pode alterar o andamento desta tarefa.');
      return;
    }

    const ciclo = { 'A Fazer': 'Em Andamento', 'Em Andamento': 'Concluído', 'Concluído': 'A Fazer' };
    setProjetos(
      projetos.map((projeto) => {
        if (projeto.id !== projId) return projeto;

        return {
          ...projeto,
          grupos: projeto.grupos.map((grupo) => {
            if (grupo.id !== grupoId) return grupo;

            const tarefas = grupo.tarefas.map((tarefa) =>
              tarefa.id === tarefaId ? { ...tarefa, status: ciclo[tarefa.status] } : tarefa
            );
            const progresso = Math.round((tarefas.filter((tarefa) => tarefa.status === 'Concluído').length / tarefas.length) * 100);

            return { ...grupo, tarefas, progresso };
          })
        };
      })
    );
  };

  const handleSugerirTarefa = (event) => {
    event.preventDefault();

    setProjetos(
      projetos.map((projeto) => {
        if (projeto.id !== projetoSelecionado.id) return projeto;

        return {
          ...projeto,
          grupos: projeto.grupos.map((grupo) => {
            if (grupo.id !== grupoSelecionado.id) return grupo;

            return {
              ...grupo,
              solicitacoesTarefas: [
                ...grupo.solicitacoesTarefas,
                { id: Date.now(), titulo: novaTitulo, descricao: novaDesc, responsavel: novaResp }
              ]
            };
          })
        };
      })
    );

    alert('Solicitação de tarefa enviada com sucesso para aprovação do professor!');
    setModalAberto(false);
    setNovaTitulo('');
    setNovaDesc('');
  };

  const handleEnviarMensagem = (event, projId, grupoId, tarefaId) => {
    event.preventDefault();
    if (!inputMessage.trim()) return;

    const novaMsg = { id: Date.now(), sender: 'aluno', text: inputMessage };
    const textoUsuario = inputMessage.toLowerCase();
    setInputMessage('');
    setDigitando(true);

    setProjetos((projetosAtuais) =>
      projetosAtuais.map((projeto) => {
        if (projeto.id !== projId) return projeto;

        return {
          ...projeto,
          grupos: projeto.grupos.map((grupo) => {
            if (grupo.id !== grupoId) return grupo;

            return {
              ...grupo,
              tarefas: grupo.tarefas.map((tarefa) =>
                tarefa.id === tarefaId ? { ...tarefa, chatHistory: [...(tarefa.chatHistory || []), novaMsg] } : tarefa
              )
            };
          })
        };
      })
    );

    setTimeout(() => {
      let resposta = 'Ótimo ponto de vista. O que motivou essa situação na sua opinião?';
      if (textoUsuario.includes('resposta') || textoUsuario.includes('pronto')) {
        resposta = 'Se eu te der a resposta pronta, seu aprendizado para por aí! O que a Família Real ganharia abrindo os portos do Brasil?';
      } else if (textoUsuario.includes('ajuda')) {
        resposta = 'Experimente pesquisar o impacto da chegada da corte no comércio colonial.';
      }

      const msgIA = { id: Date.now() + 1, sender: 'ia', text: resposta };
      setProjetos((projetosAtuais) =>
        projetosAtuais.map((projeto) => {
          if (projeto.id !== projId) return projeto;

          return {
            ...projeto,
            grupos: projeto.grupos.map((grupo) => {
              if (grupo.id !== grupoId) return grupo;

              return {
                ...grupo,
                tarefas: grupo.tarefas.map((tarefa) =>
                  tarefa.id === tarefaId ? { ...tarefa, chatHistory: [...(tarefa.chatHistory || []), msgIA] } : tarefa
                )
              };
            })
          };
        })
      );
      setDigitando(false);
    }, 1000);
  };

  return (
    <AppLayout
      profile={{ initials: 'B', name: 'Bruno Corrêa', subtitle: '9º Ano A' }}
      menuItems={MENU_ITEMS}
      activeMenu={menuAtivo}
      onMenuChange={handleMenuChange}
      onLogout={onLogout}
      accent="teal"
    >
      {menuAtivo === 'Minhas tarefas' && <StudentPersonalTasks projetos={projetos} meuNome={MEU_NOME} />}
      {menuAtivo === 'Calendário' && <StudentCalendarView />}
      {menuAtivo === 'Configurações' && (
        <StudentSettingsView
          notificacoes={notificacoes}
          onToggleNotificacoes={() => setNotificacoes((valorAtual) => !valorAtual)}
        />
      )}

      {menuAtivo === 'Projetos' && janelaAtiva === 'hub' && (
        <StudentProjectsView projetos={projetos} meuNome={MEU_NOME} onOpenProject={handleOpenProject} />
      )}

      {menuAtivo === 'Projetos' && janelaAtiva === 'projeto' && (
        <StudentProjectDetail
          projeto={projetoAtual}
          grupo={grupoAtual}
          meuNome={MEU_NOME}
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
          meuNome={MEU_NOME}
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
