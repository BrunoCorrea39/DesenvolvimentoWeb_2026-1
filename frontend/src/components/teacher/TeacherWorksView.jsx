import BackButton from '../common/BackButton';

export default function TeacherWorksView({
  turmaSelecionada,
  projetos,
  tituloTrab,
  conteudoTrab,
  carregandoIA,
  onBack,
  onTituloChange,
  onConteudoChange,
  onCreateWork,
  onSelectTrabalho
}) {
  if (!turmaSelecionada) return null;

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
            <textarea
              value={conteudoTrab}
              onChange={(event) => onConteudoChange(event.target.value)}
              required
              rows="3"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 resize-none"
              placeholder="Diretrizes..."
              disabled={carregandoIA}
            />
            <button type="submit" disabled={carregandoIA} className="w-full bg-purple-600 text-black font-bold py-2 rounded-xl">
              Distribuir com IA
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-3">
          {projetos
            .filter((projeto) => projeto.turmaId === turmaSelecionada.id)
            .map((projeto) => (
              <div
                key={projeto.id}
                onClick={() => onSelectTrabalho(projeto)}
                className="bg-slate-900 border border-slate-800 p-5 rounded-xl cursor-pointer hover:border-slate-700 transition-all flex justify-between items-center"
              >
                <h5 className="font-bold text-sm text-slate-200">{projeto.titulo}</h5>
                <span className="text-xs text-purple-400 font-semibold">{projeto.grupos.length} Grupos</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
