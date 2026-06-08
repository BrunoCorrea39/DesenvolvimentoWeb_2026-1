import { useState } from 'react';
import Login from './pages/Login';
import DashboardAluno from './pages/DashboardAluno';
import DashboardProfessor from './pages/DashboardProfessor';
import { mockProjetosIniciais } from './mock/dadosMockados';

export default function App() {
  const [userRole, setUserRole] = useState(null);
  const [projetos, setProjetos] = useState(mockProjetosIniciais);

  const handleLogin = (role) => {
    setUserRole(role);
  };

  const handleLogout = () => {
    setUserRole(null);
  };

  // 1. Se estiver deslogado, mostra o Login
  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  // 2. Se logar como Aluno, passa os projetos compartilhados
  if (userRole === 'aluno') {
    return (
      <DashboardAluno 
        projetos={projetos} 
        setProjetos={setProjetos} 
        onLogout={handleLogout} 
      />
    );
  }

  // 3. Se logar como Professor, passa os mesmos projetos compartilhados
  if (userRole === 'professor') {
    return (
      <DashboardProfessor 
        projetos={projetos} 
        setProjetos={setProjetos} 
        onLogout={handleLogout} 
      />
    );
  }

  return null;
}