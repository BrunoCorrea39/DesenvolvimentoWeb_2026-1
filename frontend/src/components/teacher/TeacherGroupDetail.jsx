import BackButton from '../common/BackButton';

export default function TeacherGroupDetail({
  projeto,
  grupo,
  tarefaChatEspiado,
  notaColetiva,
  novaTarefaNome,
  novaTarefaResp,
  onBack,
  onToggleStatus,
  onNotaIndividual,
  onMudarResponsavel,
  onExcluirTarefa,
  onNovaTarefaNomeChange,
  onNovaTarefaRespChange,
  onAdicionarTarefa,
  onGerenciarSolicitacao,
  onEspiarChat,
  onNotaColetivaChange,
  onSalvarNotaColetiva
}) {
  if (!projeto || !grupo) return null;

  return (
    <div>
      <BackButton onClick={onBack} accent="purple">← Voltar</BackButton>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase">Gestão das Tarefas e Autonomia</h4>
          <div className="space-y-3">
            {grupo.tarefas.map((tarefa) => (
              <div
                key={tarefa.id}
                className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h5 className="font-bold text-sm text-slate-200">{tarefa.titulo}</h5>
                  <div className="flex gap-4 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      Status:
                      <button
                        type="button"
                        onClick={() => onToggleStatus(projeto.id, grupo.id, tarefa.id)}
                        className="text-purple-400 font-bold bg-slate-950 border border-slate-800 rounded-md px-2 py-0.5"
                      >
                        {tarefa.status} ⇄
                      </button>
                    </span>
                    {tarefa.chatHistory?.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onEspiarChat(tarefa)}
                        className="text-teal-400 font-bold bg-slate-950 border border-slate-800 rounded-md px-2 py-0.5"
                      >
                        Espiar Chat
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder={tarefa.nota !== null ? String(tarefa.nota) : 'Nota Aluno'}
                    onChange={(event) => onNotaIndividual(projeto.id, grupo.id, tarefa.id, event.target.value)}
                    className="w-28 bg-slate-950 border border-slate-800 rounded p-1 text-xs text-center text-teal-400 placeholder:text-slate-500"
                  />
                  <select
                    value={tarefa.responsavel}
                    onChange={(event) => onMudarResponsavel(projeto.id, grupo.id, tarefa.id, event.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300"
                  >
                    <option value="">Mudar Dono</option>
                    {grupo.integrantes.map((integrante) => (
                      <option key={integrante} value={integrante}>
                        {integrante}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => onExcluirTarefa(projeto.id, grupo.id, tarefa.id)}
                    className="text-red-500 text-xs font-semibold bg-red-500/10 p-1.5 rounded border border-red-500/30 hover:bg-red-500/20"
                  >
                    Excluir
                  </button>
                </div>
                </div>
                {tarefa.descricao && tarefa.descricao !== tarefa.titulo && (
                  <div className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-400">
                    {tarefa.descricao}
                  </div>
                )}
              </div>
            ))}
          </div>

          <form
            onSubmit={(event) => onAdicionarTarefa(event, projeto.id, grupo.id)}
            className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3 text-xs"
          >
            <input
              type="text"
              value={novaTarefaNome}
              onChange={(event) => onNovaTarefaNomeChange(event.target.value)}
              placeholder="Inserir tarefa manual..."
              required
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300 placeholder:text-slate-500"
            />
            <select
              value={novaTarefaResp}
              onChange={(event) => onNovaTarefaRespChange(event.target.value)}
              required
              className="bg-slate-950 border border-slate-800 rounded-lg p-2"
            >
              <option value="">Selecionar Aluno</option>
              {grupo.integrantes.map((integrante) => (
                <option key={integrante} value={integrante}>
                  {integrante}
                </option>
              ))}
            </select>
            <button type="submit" className="bg-purple-600 text-black px-4 py-2 rounded-lg font-bold">
              Criar
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow space-y-3">
            <h4 className="font-bold text-xs uppercase text-slate-400">Solicitações de Inclusão da Equipe</h4>
            {grupo.solicitacoesTarefas?.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-2">Nenhum pedido pendente.</p>
            ) : (
              grupo.solicitacoesTarefas?.map((solicitacao) => (
                <div key={solicitacao.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2 text-xs">
                  <h5 className="font-bold text-slate-200">{solicitacao.titulo}</h5>
                  <p className="text-[11px] text-slate-400">{solicitacao.descricao}</p>
                  <span className="block text-[10px] text-slate-500">Por: {solicitacao.responsavel}</span>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onGerenciarSolicitacao(projeto.id, grupo.id, solicitacao.id, false)}
                      className="flex-1 bg-rose-500/10 text-slate-200 p-1 rounded text-[10px] font-bold"
                    >
                      Recusar
                    </button>
                    <button
                      type="button"
                      onClick={() => onGerenciarSolicitacao(projeto.id, grupo.id, solicitacao.id, true)}
                      className="flex-1 bg-emerald-500/10 text-slate-200 p-1 rounded text-[10px] font-bold"
                    >
                      Aprovar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <h4 className="font-bold text-xs uppercase text-slate-400">Atribuir Nota Coletiva</h4>
            <input
              type="number"
              placeholder="Nota 0-10"
              value={notaColetiva}
              onChange={(event) => onNotaColetivaChange(event.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-center text-teal-400 font-bold placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={() => onSalvarNotaColetiva(projeto.id, grupo.id)}
              className="w-full bg-purple-600 text-black font-bold py-2 rounded-xl text-xs"
            >
              Salvar Nota Coletiva
            </button>
          </div>
        </div>
      </div>

      {tarefaChatEspiado && (
        <div className="mt-6 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
            <h5 className="text-xs font-bold text-teal-400">Chat de: {tarefaChatEspiado.responsavel}</h5>
            <button
              type="button"
              onClick={() => onEspiarChat(null)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Fechar
            </button>
          </div>
          <div className="max-h-[260px] overflow-y-auto space-y-1.5 text-xs">
            {tarefaChatEspiado.chatHistory?.map((mensagem) => (
              <div
                key={mensagem.id}
                className={`p-2 rounded border ${
                  mensagem.sender === 'aluno'
                    ? 'bg-teal-500/10 border-teal-500/30'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <strong className={mensagem.sender === 'aluno' ? 'text-teal-400' : 'text-purple-400'}>
                  {mensagem.sender}:{' '}
                </strong>
                {mensagem.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
