import BackButton from '../common/BackButton';

export default function TeacherGroupsView({ trabalho, grupos, onBack, onSelectGrupo }) {
  if (!trabalho) return null;

  return (
    <div>
      <BackButton onClick={onBack} accent="purple">← Voltar</BackButton>
      <h3 className="text-xl font-bold mb-6">
        Equipes: <span className="text-purple-400">{trabalho.titulo}</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {grupos.map((grupo) => (
          <div
            key={grupo.id}
            onClick={() => onSelectGrupo(grupo)}
            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl cursor-pointer hover:bg-purple-500 hover:border-purple-500 transition-all shadow-md"
          >
            <h4 className="text-base font-bold text-slate-200">{grupo.nome}</h4>
            <p className="text-xs text-slate-500 mt-1">Alunos: {grupo.integrantes.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
