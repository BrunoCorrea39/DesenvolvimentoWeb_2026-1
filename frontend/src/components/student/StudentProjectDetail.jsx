import BackButton from '../common/BackButton';

export default function StudentProjectDetail({
  projeto,
  grupo,
  meuNome,
  onBack,
  onOpenTask,
  onStatusChange,
  onOpenTaskRequest
}) {
  if (!projeto || !grupo) return null;

  return (
    <div>
      <BackButton onClick={onBack}>← Voltar</BackButton>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold">{projeto.titulo}</h3>
          <p className="text-xs text-slate-400 mt-1">
            Sua Equipe: <strong className="text-slate-200">{grupo.integrantes.join(', ')}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs">
            Nota do Grupo:{' '}
            <strong className="text-purple-400">{grupo.notaColetiva !== null ? grupo.notaColetiva : 'Pendente'}</strong>
          </div>
          <button
            type="button"
            onClick={onOpenTaskRequest}
            className="bg-purple-600 hover:bg-purple-500 text-black font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow"
          >
            + Solicitar Nova Tarefa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['A Fazer', 'Em Andamento', 'Concluído'].map((coluna) => (
          <div key={coluna} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl h-fit">
            <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase px-1">{coluna}</h4>
            <div className="space-y-3">
              {grupo.tarefas
                .filter((tarefa) => tarefa.status === coluna)
                .map((tarefa) => (
                  <div
                    key={tarefa.id}
                    className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between min-h-[120px]"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h5
                          onClick={() => onOpenTask(tarefa)}
                          className="font-bold text-sm text-slate-200 cursor-pointer hover:text-teal-400 transition-colors line-clamp-1"
                        >
                          {tarefa.titulo}
                        </h5>
                        <button
                          type="button"
                          onClick={() => onStatusChange(projeto.id, grupo.id, tarefa.id, tarefa.responsavel)}
                          className="text-[10px] text-slate-500 hover:text-teal-400 border border-slate-800 px-1 rounded"
                        >
                          ⇄
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Atribuído:{' '}
                        <strong className={tarefa.responsavel === meuNome ? 'text-teal-400' : 'text-purple-400'}>
                          {tarefa.responsavel}
                        </strong>
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-900/80 flex justify-between items-center text-[10px]">
                      <span className="text-slate-500">
                        Prazo: <strong className="text-rose-400 font-medium">{tarefa.prazo}</strong>
                      </span>
                      {tarefa.nota !== null && (
                        <span className="font-bold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          Nota: {tarefa.nota}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
