import { useCallback, useEffect, useState } from 'react';
import Login from './pages/Login';
import DashboardAluno from './pages/DashboardAluno';
import DashboardProfessor from './pages/DashboardProfessor';
import { fetchProjects, login } from './services/api';

function getSavedSession() {
  try {
    const saved = localStorage.getItem('projetai_session');
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem('projetai_session');
    return null;
  }
}

export default function App() {
  const [session, setSession] = useState(getSavedSession);
  const [projetos, setProjetos] = useState([]);
  const [carregando, setCarregando] = useState(() => Boolean(localStorage.getItem('projetai_session')));
  const [erro, setErro] = useState('');

  const carregarProjetos = useCallback(async () => {
    if (!session?.access_token) return;
    setCarregando(true);
    setErro('');
    try {
      const dados = await fetchProjects(session.access_token);
      setProjetos(dados);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }, [session]);

  useEffect(() => {
    if (!session?.access_token) return;

    let ativo = true;
    fetchProjects(session.access_token)
      .then((dados) => {
        if (ativo) setProjetos(dados);
      })
      .catch((error) => {
        if (ativo) setErro(error.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [session]);

  const handleLogin = async (email, senha) => {
    const data = await login(email, senha);
    const nextSession = { access_token: data.access_token, user: data.user };
    const dados = await fetchProjects(data.access_token);
    localStorage.setItem('projetai_session', JSON.stringify(nextSession));
    setProjetos(dados);
    setSession(nextSession);
  };

  const handleLogout = () => {
    localStorage.removeItem('projetai_session');
    setSession(null);
    setProjetos([]);
  };

  if (!session) {
    return <Login onLogin={handleLogin} />;
  }

  if (carregando && projetos.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-sm text-slate-400">
        Carregando dados da API...
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md text-center space-y-3">
          <h1 className="font-bold text-slate-200">Não foi possível carregar a API</h1>
          <p className="text-sm text-slate-400">{erro}</p>
          <button type="button" onClick={handleLogout} className="bg-teal-500 text-black font-bold px-4 py-2 rounded-xl text-sm">
            Voltar ao login
          </button>
        </div>
      </div>
    );
  }

  if (session.user.role === 'aluno') {
    return (
      <DashboardAluno
        projetos={projetos}
        token={session.access_token}
        currentUser={session.user}
        onProjectsChanged={carregarProjetos}
        onLogout={handleLogout}
      />
    );
  }

  if (session.user.role === 'professor') {
    return (
      <DashboardProfessor
        projetos={projetos}
        token={session.access_token}
        currentUser={session.user}
        onProjectsChanged={carregarProjetos}
        onLogout={handleLogout}
      />
    );
  }

  return null;
}
