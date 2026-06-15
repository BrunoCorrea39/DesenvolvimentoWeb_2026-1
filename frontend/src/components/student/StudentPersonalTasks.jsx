export default function StudentPersonalTasks({ projetos, meuNome }) {
  const tarefas = projetos.flatMap((projeto) =>
    projeto.grupos.flatMap((grupo) =>
      grupo.tarefas
        .filter((tarefa) => tarefa.responsavel === meuNome)
        .map((tarefa) => ({ ...tarefa, projetoTitulo: projeto.titulo }))
    )
  );

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Suas Atribuições Individuais</h3>
      <div className="space-y-3">
        {tarefas.map((tarefa) => (
          <div key={tarefa.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center gap-4">
            <div className="min-w-0">
              <span className="text-[10px] bg-teal-500/10 text-slate-200 px-2 py-0.5 rounded font-bold uppercase">
                {tarefa.projetoTitulo}
              </span>
              <h4 className="font-bold text-base text-slate-200 mt-1">{tarefa.titulo}</h4>
              <p className="text-xs text-slate-400">{tarefa.descricao}</p>
            </div>
            <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-slate-200 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg">
              {tarefa.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
