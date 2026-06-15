import BackButton from '../common/BackButton';

export default function TeacherWorksView({
  turmaSelecionada,
  projetos,
  tituloTrab,
  conteudoTrab,
  numeroGrupos,
  prazoTrab,
  carregandoIA,
  alunosTurma,
  carregandoAlunos,
  onBack,
  onTituloChange,
  onConteudoChange,
  onNumeroGruposChange,
  onPrazoChange,
  onCreateWork,
  onSelectTrabalho,
  onDeleteWork
}) {
  if (!turmaSelecionada) return null;

  const hoje = new Date().toISOString().split('T')[0];
  const maxGrupos = alunosTurma.length > 0 ? alunosTurma.length : 20;
  const ajustarGrupos = (delta) => {
    const proximo = Math.min(maxGrupos, Math.max(1, numeroGrupos + delta));
    onNumeroGruposChange(proximo);
  };

  return (
    <div>
      <BackButton onClick={onBack} accent="purple">← Voltar</BackButton>
      <h3 className="text-xl font-bold mb-6">
        Trabalhos em: <span className="text-purple-400">{turmaSelecionada.nome}</span>
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit space-y-4">
          <h4 className="font-bold text-sm text-slate-200">Novo Trabalho com IA</h4>
          <form onSubmit={onCreateWork} className="space-y-3 text-xs">
            <input
              type="text"
              value={tituloTrab}
              onChange={(event) => onTituloChange(event.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5"
              placeholder="Tema"
              disabled={carregandoIA}
            />

            <div className="flex items-center justify-between gap-3 bg-slate-950 border border-slate-800 rounded-xl p-2.5">
              <span className="text-slate-200 font-semibold">Número de grupos</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => ajustarGrupos(-1)}
                  disabled={carregandoIA || numeroGrupos <= 1}
                  className="w-7 h-7 rounded-lg bg-slate-800 text-slate-200 font-black leading-none disabled:opacity-40"
                  aria-label="Diminuir número de grupos"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold  text-slate-200">{numeroGrupos}</span>
                <button
                  type="button"
                  onClick={() => ajustarGrupos(1)}
                  disabled={carregandoIA || numeroGrupos >= maxGrupos}
                  className="w-7 h-7 rounded-lg bg-slate-800 text-slate-200 font-black leading-none disabled:opacity-40"
                  aria-label="Aumentar número de grupos"
                >
                  +
                </button>
              </div>
            </div>

            <textarea
              value={conteudoTrab}
              onChange={(event) => onConteudoChange(event.target.value)}
              required
              rows="3"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 resize-none"
              placeholder="Diretrizes..."
              disabled={carregandoIA}
            />

            <label className="block space-y-1">
              <span className="text-slate-200 font-semibold">Prazo de entrega</span>
              <input
                type="date"
                value={prazoTrab}
                min={hoje}
                onChange={(event) => onPrazoChange(event.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5"
                disabled={carregandoIA}
              />
            </label>

            <button type="submit" disabled={carregandoIA} className="w-full bg-purple-600 text-black font-bold py-2 rounded-xl">
              Distribuir com IA
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <section className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h4 className="font-bold text-sm text-slate-200">Alunos da turma</h4>
                <p className="text-xs text-slate-500">{alunosTurma.length} aluno(s) encontrados</p>
              </div>
              {carregandoAlunos && <span className="text-xs text-purple-400 font-semibold">Carregando...</span>}
            </div>

            {alunosTurma.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {alunosTurma.map((aluno) => (
                  <div key={`${aluno.nome}-${aluno.email || aluno.origem}`} className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-yellow-400 text-black flex items-center justify-center text-xs font-black">
                        {aluno.nome.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-sm font-bold text-slate-200 truncate">{aluno.nome}</h5>
                        <p className="text-[11px] text-slate-500 truncate">{aluno.email || aluno.origem}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Nenhum aluno encontrado para esta turma ainda. Crie um trabalho ou cadastre alunos para popular a lista.
              </p>
            )}
          </section>

          {projetos
            .filter((projeto) => projeto.turmaId === turmaSelecionada.id)
            .map((projeto) => (
              <div
                key={projeto.id}
                onClick={() => onSelectTrabalho(projeto)}
                className="bg-slate-900 border border-slate-800 p-5 rounded-xl cursor-pointer hover:bg-purple-500 hover:border-purple-500 transition-all flex justify-between items-center gap-3"
              >
                <h5 className="font-bold text-sm text-slate-200">{projeto.titulo}</h5>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold">{projeto.grupos.length} Grupos</span>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteWork(projeto);
                    }}
                    className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/30 rounded-md px-2 py-0.5 hover:bg-red-500/20"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
