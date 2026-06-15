export default function TaskRequestModal({
  grupoSelecionado,
  novaTitulo,
  novaDesc,
  novaResp,
  onTituloChange,
  onDescChange,
  onRespChange,
  onClose,
  onSubmit
}) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4">
        <h4 className="text-lg font-bold">Solicitar Inclusão de Tarefa</h4>
        <form onSubmit={onSubmit} className="space-y-3 text-sm">
          <div>
            <label className="block text-slate-400 text-xs mb-1">Título da Tarefa</label>
            <input
              type="text"
              value={novaTitulo}
              onChange={(event) => onTituloChange(event.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs mb-1">O que será feito</label>
            <textarea
              value={novaDesc}
              onChange={(event) => onDescChange(event.target.value)}
              required
              rows="3"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 resize-none"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs mb-1">Responsável Proposto</label>
            <select
              value={novaResp}
              onChange={(event) => onRespChange(event.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-300"
            >
              {grupoSelecionado?.integrantes.map((integrante) => (
                <option key={integrante} value={integrante}>
                  {integrante}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-semibold text-slate-300">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-black font-bold rounded-xl text-xs">
              Enviar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
