import { useState } from 'react';
import Login from './pages/Login';
import DashboardAluno from './pages/DashboardAluno';
import DashboardProfessor from './pages/DashboardProfessor';

export default function App() {
  const [userRole, setUserRole] = useState(null); // null = deslogado, 'aluno' ou 'professor'

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

  // 2. Se logar como Aluno, mostra o Workspace com o chat socrático
  if (userRole === 'aluno') {
    return <DashboardAluno onLogout={handleLogout} />;
  }

  // 3. Se logar como Professor, mostra o Formulário de Criação com IA ativa
  if (userRole === 'professor') {
    return <DashboardProfessor onLogout={handleLogout} />;
  }
}