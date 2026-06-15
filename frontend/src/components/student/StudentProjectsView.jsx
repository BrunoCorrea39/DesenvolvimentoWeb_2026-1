export default function StudentProjectsView({ projetos, meuNome, onOpenProject }) {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Seus Projetos Escolares</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projetos.map((projeto) => {
          const meuGrupo = projeto.grupos.find((grupo) => grupo.integrantes.includes(meuNome));
          if (!meuGrupo) return null;

          return (
            <div
              key={projeto.id}
              onClick={() => onOpenProject(projeto, meuGrupo)}
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl cursor-pointer hover:bg-purple-500 hover:border-purple-500 transition-all shadow-md"
            >
              <span className="text-xs font-bold text-slate-200 bg-teal-500/10 px-2 py-0.5 rounded">
                {projeto.materia}
              </span>
              <h4 className="text-lg font-bold mt-2">
                {projeto.titulo}
              </h4>
              <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-between items-center text-xs text-slate-500">
                <span>
                  Sua Equipe: <strong>{meuGrupo.nome}</strong>
                </span>
                <span>{meuGrupo.progresso}% Feito</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
