import BackButton from '../common/BackButton';

export default function TeacherClassesView({ anoSelecionado, turmas, onBack, onSelectTurma }) {
  if (!anoSelecionado) return null;

  return (
    <div>
      <BackButton onClick={onBack} accent="purple">← Voltar</BackButton>
      <h3 className="text-xl font-bold mb-6">
        Turmas do <span className="text-purple-400">{anoSelecionado.nome}</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {turmas.map((turma) => (
          <div
            key={turma.id}
            onClick={() => onSelectTurma(turma)}
            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl cursor-pointer hover:border-purple-500/40 transition-all shadow-md"
          >
            <h4 className="text-base font-bold text-slate-200">{turma.nome}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}
