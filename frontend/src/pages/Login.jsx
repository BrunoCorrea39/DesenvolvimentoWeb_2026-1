// src/pages/Login.jsx
import { useState } from 'react';

export default function Login({ onLogin }) {
  const [isProfessor, setIsProfessor] = useState(false);
  const [email, setEmail] = useState('aluno14a@escola.com');
  const [senha, setSenha] = useState('123456');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email && senha) {
      setErro('');
      setCarregando(true);
      try {
        await onLogin(email, senha);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-200">Projet<span className="text-teal-400">Aí</span></h1>
          <p className="text-slate-400 mt-2">Gestão justa de trabalhos escolares</p>
        </div>

        {/* Switch de Perfil (useState em ação) */}
        <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isProfessor ? 'bg-teal-500 text-black shadow' : 'text-slate-400 hover:text-slate-200'}`}
            onClick={() => {
              setIsProfessor(false);
              setEmail('aluno14a@escola.com');
            }}
          >
            Sou Aluno
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isProfessor ? 'bg-teal-500 text-black shadow' : 'text-slate-400 hover:text-slate-200'}`}
            onClick={() => {
              setIsProfessor(true);
              setEmail('professor@escola.com');
            }}
          >
            Sou Professor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
              placeholder="seuemail@escola.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-teal-500 hover:bg-teal-400 text-black font-bold py-3 rounded-xl transition-colors mt-2 disabled:opacity-50"
          >
            {carregando ? 'Entrando...' : 'Entrar no ProjetAí'}
          </button>

          {erro && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {erro}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
