import BackButton from '../common/BackButton';

export default function StudentTaskDetail({
  projeto,
  grupo,
  tarefa,
  meuNome,
  inputMessage,
  digitando,
  onBack,
  onMessageChange,
  onSendMessage
}) {
  if (!projeto || !grupo || !tarefa) return null;

  const eDonoDaTarefa = tarefa.responsavel === meuNome;

  return (
    <div>
      <BackButton onClick={onBack}>← Voltar</BackButton>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[480px] lg:h-[calc(100vh-6rem)] shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 rounded-t-2xl flex items-center justify-between">
            <span className="font-bold text-xs text-slate-300">Histórico de Tutoria IA</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {(tarefa.chatHistory || []).map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'aluno' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-xl px-3.5 py-2 text-xs ${
                    msg.sender === 'aluno'
                      ? 'bg-teal-500 text-black font-semibold'
                      : 'bg-slate-950 text-slate-300 border border-slate-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {digitando && <div className="text-xs text-slate-500 animate-pulse">Pensando...</div>}
          </div>
          <form onSubmit={(event) => onSendMessage(event, projeto.id, grupo.id, tarefa.id)} className="p-4 border-t border-slate-800 bg-slate-950 rounded-b-2xl flex gap-2">
            <input
              type="text"
              disabled={!eDonoDaTarefa}
              value={inputMessage}
              onChange={(event) => onMessageChange(event.target.value)}
              placeholder={eDonoDaTarefa ? 'Peça orientações...' : 'Apenas o dono da tarefa pode conversar com a IA.'}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-teal-500 disabled:opacity-40"
            />
            <button type="submit" disabled={!eDonoDaTarefa} className="bg-teal-500 text-black font-bold px-4 py-2 rounded-xl text-xs disabled:opacity-40">
              Enviar
            </button>
          </form>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit space-y-4 shadow-md">
          <div>
            <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Visualizando Tarefa</span>
            <h3 className="text-xl font-bold text-slate-200 mt-0.5">{tarefa.titulo}</h3>
            <p className="text-xs text-slate-400 mt-1">
              Responsável: <strong className="text-slate-200">{tarefa.responsavel}</strong>
            </p>
          </div>
          <p className="text-xs text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-800 leading-relaxed">
            {tarefa.descricao}
          </p>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between text-xs">
            <span className="text-slate-500">Data Limite:</span>
            <span className="text-rose-400 font-bold">{tarefa.prazo}</span>
          </div>
          {!eDonoDaTarefa && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-slate-200 p-3 rounded-xl text-[11px] text-center font-medium">
              Modo de Leitura. Tarefa de <strong>{tarefa.responsavel}</strong>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
