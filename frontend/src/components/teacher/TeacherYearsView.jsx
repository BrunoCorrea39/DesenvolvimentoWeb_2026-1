export default function TeacherYearsView({ anos, onSelectAno }) {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Níveis de Ensino</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {anos.map((ano) => (
          <div
            key={ano.id}
            onClick={() => onSelectAno(ano)}
            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl cursor-pointer hover:bg-purple-500 hover:border-purple-500 transition-all shadow-md"
          >
            <h4 className="text-lg font-bold text-slate-200">{ano.nome}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}
