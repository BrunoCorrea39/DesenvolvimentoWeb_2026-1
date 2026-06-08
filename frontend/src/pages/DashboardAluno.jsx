import { useState } from 'react';
import { mockProjetosIniciais } from '../mock/dadosMockados';

export default function DashboardAluno({ onLogout }) {
  const [menuAtivo, setMenuAtivo] = useState('Projetos');
  const [janelaAtiva, setJanelaAtiva] = useState('hub');
  const [projetos, setProjetos] = useState(mockProjetosIniciais);
  
  const [projetoSelecionado, setProjetoSelecionado] = useState(null);
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);

  // Estados para solicitar inclusão de tarefa
  const [modalAberto, setModalAberto] = useState(false);
  const [novaTitulo, setNovaTitulo] = useState('');
  const [novaDesc, setNovaDesc] = useState('');
  const [novaResp, setNovaResp] = useState('Bruno');

  // Configurações e Chat
  const [notificacoes, setNotificacoes] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [digitando, setDigitando] = useState(false);

  const meuNome = "Bruno";

  const handleMudarStatus = (projId, grupoId, tarefaId, responsavel) => {
    if (responsavel !== meuNome) {
      alert("Apenas o responsável atribuído pode alterar o andamento desta tarefa.");
      return;
    }
    const ciclo = { 'A Fazer': 'Em Andamento', 'Em Andamento': 'Concluído', 'Concluído': 'A Fazer' };
    setProjetos(projetos.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          grupos: p.grupos.map(g => {
            if (g.id === grupoId) {
              const tAtualizadas = g.tarefas.map(t => t.id === tarefaId ? { ...t, status: ciclo[t.status] } : t);
              const prg = Math.round((tAtualizadas.filter(t => t.status === 'Concluído').length / tAtualizadas.length) * 100);
              return { ...g, tarefas: tAtualizadas, progresso: prg };
            }
            return g;
          })
        };
      }
      return p;
    }));
  };

  const handleSugerirTarefa = (e) => {
    e.preventDefault();
    setProjetos(projetos.map(p => {
      if (p.id === projetoSelecionado.id) {
        return {
          ...p,
          grupos: p.grupos.map(g => {
            if (g.id === grupoSelecionado.id) {
              return {
                ...g,
                solicitacoesTarefas: [...g.solicitacoesTarefas, { id: Date.now(), titulo: novaTitulo, descricao: novaDesc, responsavel: novaResp }]
              };
            }
            return g;
          })
        };
      }
      return p;
    }));
    alert('Solicitação de tarefa enviada com sucesso para aprovação do professor!');
    setModalAberto(false);
    setNovaTitulo('');
    setNovaDesc('');
  };

  const handleEnviarMensagem = (e, projId, grupoId, tarefaId) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const novaMsg = { id: Date.now(), sender: 'aluno', text: inputMessage };
    let userText = inputMessage.toLowerCase();
    setInputMessage('');
    setDigitando(true);

    setProjetos(prev => prev.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          grupos: p.grupos.map(g => {
            if (g.id === grupoId) {
              return {
                ...g,
                tarefas: g.tarefas.map(t => t.id === tarefaId ? { ...t, chatHistory: [...(t.chatHistory || []), novaMsg] } : t)
              };
            }
            return g;
          })
        };
      }
      return p;
    }));

    setTimeout(() => {
      let resposta = "Ótimo ponto de vista. O que motivou essa situação na sua opinião?";
      if (userText.includes('resposta') || userText.includes('pronto')) {
        resposta = "Se eu te der a resposta pronta, seu aprendizado para por aí! O que a Família Real ganharia abrindo os portos do Brasil?";
      } else if (userText.includes('ajuda')) {
        resposta = "Experimente pesquisar o impacto da chegada da corte no comércio colonial.";
      }
      const msgIA = { id: Date.now() + 1, sender: 'ia', text: resposta };
      setProjetos(prev => prev.map(p => {
        if (p.id === projId) {
          return {
            ...p,
            grupos: p.grupos.map(g => {
              if (g.id === grupoId) {
                return { ...g, tarefas: g.tarefas.map(t => t.id === tarefaId ? { ...t, chatHistory: [...(t.chatHistory || []), msgIA] } : t) };
              }
              return g;
            })
          };
        }
        return p;
      }));
      setDigitando(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-slate-950 font-black">B</div>
            <div>
              <h2 className="font-bold text-sm text-slate-200">Bruno Corrêa</h2>
              <span className="text-xs text-teal-400 font-medium">9º Ano A</span>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {['Projetos', 'Minhas tarefas', 'Calendário', 'Configurações'].map(tab => (
              <button key={tab} onClick={() => { setMenuAtivo(tab); setJanelaAtiva('hub'); }} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${menuAtivo === tab ? 'bg-teal-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>{tab}</button>
            ))}
          </nav>
        </div>
        <div className="p-4">
          <button onClick={onLogout} className="w-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white px-4 py-2 rounded-xl text-sm">Sair</button>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 p-8 overflow-y-auto">
        {menuAtivo === 'Minhas tarefas' && (
          <div>
            <h3 className="text-2xl font-bold mb-6">Suas Atribuições Individuais</h3>
            <div className="space-y-3">
              {projetos.flatMap(p => p.grupos.flatMap(g => g.tarefas.filter(t => t.responsavel === meuNome).map(t => (
                <div key={t.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded font-bold uppercase">{p.titulo}</span>
                    <h4 className="font-bold text-base text-slate-200 mt-1">{t.titulo}</h4>
                    <p className="text-xs text-slate-400">{t.descricao}</p>
                  </div>
                  <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg">{t.status}</span>
                </div>
              ))))}
            </div>
          </div>
        )}

        {menuAtivo === 'Calendário' && (
          <div>
            <h3 className="text-2xl font-bold mb-6">Calendário de Entregas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-rose-400 font-bold text-center w-14">08 <span className="block text-[10px] uppercase font-medium">Jun</span></div>
                <div>
                  <h4 className="font-bold text-sm">Entrega: Pesquisa Inicial da Família Real</h4>
                  <p className="text-xs text-slate-400">História - Brasil Império</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {menuAtivo === 'Configurações' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md">
            <h3 className="text-xl font-bold mb-4">Preferências do Sistema</h3>
            <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-300">
              <input type="checkbox" checked={notificacoes} onChange={() => setNotificacoes(!notificacoes)} className="rounded bg-slate-950 border-slate-800 text-teal-500" />
              Ativar avisos de prazos de tarefas por e-mail
            </label>
          </div>
        )}

        {menuAtivo === 'Projetos' && (
          <>
            {janelaAtiva === 'hub' && (
              <div>
                <h3 className="text-2xl font-bold mb-6">Seus Projetos Escolares</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projetos.map(p => {
                    const meuGrupo = p.grupos.find(g => g.integrantes.includes(meuNome));
                    if (!meuGrupo) return null;
                    return (
                      <div key={p.id} onClick={() => { setProjetoSelecionado(p); setGrupoSelecionado(meuGrupo); setJanelaAtiva('projeto'); }} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl cursor-pointer hover:border-teal-500/40 transition-all shadow-md group">
                        <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">{p.materia}</span>
                        <h4 className="text-lg font-bold mt-2 group-hover:text-teal-400 transition-colors">{p.titulo}</h4>
                        <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-between items-center text-xs text-slate-500">
                          <span>Sua Equipe: <strong>{meuGrupo.nome}</strong></span>
                          <span>{meuGrupo.progresso}% Feito</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {janelaAtiva === 'projeto' && projetoSelecionado && grupoSelecionado && (
              (() => {
                const projAtual = projetos.find(p => p.id === projetoSelecionado.id);
                const grupAtual = projAtual.grupos.find(g => g.id === grupoSelecionado.id);
                return (
                  <div>
                    <button onClick={() => setJanelaAtiva('hub')} className="text-xs text-teal-400 hover:underline mb-4">← Voltar</button>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-bold">{projAtual.titulo}</h3>
                        <p className="text-xs text-slate-400 mt-1">Sua Equipe: <strong className="text-slate-200">{grupAtual.integrantes.join(', ')}</strong></p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs">
                          Nota do Grupo: <strong className="text-purple-400">{grupAtual.notaColetiva !== null ? grupAtual.notaColetiva : "Pendente"}</strong>
                        </div>
                        <button onClick={() => setModalAberto(true)} className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow">+ Solicitar Nova Tarefa</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {['A Fazer', 'Em Andamento', 'Concluído'].map(col => (
                        <div key={col} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl h-fit">
                          <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase px-1">{col}</h4>
                          <div className="space-y-3">
                            {grupAtual.tarefas.filter(t => t.status === col).map(t => (
                              <div key={t.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between min-h-[120px]">
                                <div>
                                  <div className="flex justify-between items-start gap-2">
                                    <h5 onClick={() => { setTarefaSelecionada(t); setJanelaAtiva('tarefa'); }} className="font-bold text-sm text-slate-200 cursor-pointer hover:text-teal-400 transition-colors line-clamp-1">{t.titulo}</h5>
                                    <button onClick={() => handleMudarStatus(projAtual.id, grupAtual.id, t.id, t.responsavel)} className="text-[10px] text-slate-500 hover:text-teal-400 border border-slate-800 px-1 rounded">⇄</button>
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-1">Atribuído: <strong className={t.responsavel === meuNome ? "text-teal-400" : "text-purple-400"}>{t.responsavel}</strong></p>
                                </div>
                                
                                {/* 📅 EXIBIÇÃO DO PRAZO DIRETAMENTE NO CARD DO KANBAN */}
                                <div className="mt-3 pt-2 border-t border-slate-900/80 flex justify-between items-center text-[10px]">
                                  <span className="text-slate-500">Prazo: <strong className="text-rose-400 font-medium">{t.prazo}</strong></span>
                                  {t.nota !== null && <span className="font-bold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">Nota: {t.nota}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()
            )}

            {janelaAtiva === 'tarefa' && tarefaSelecionada && (
              (() => {
                const projAtual = projetos.find(p => p.id === projetoSelecionado.id);
                const grupAtual = projAtual.grupos.find(g => g.id === grupoSelecionado.id);
                const tarefAtual = grupAtual.tarefas.find(t => t.id === tarefaSelecionada.id);
                const eDonoDaTarefa = tarefAtual.responsavel === meuNome;

                return (
                  <div>
                    <button onClick={() => setJanelaAtiva('projeto')} className="text-xs text-teal-400 hover:underline mb-4">← Voltar</button>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit space-y-4 shadow-md">
                        <div>
                          <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Visualizando Tarefa</span>
                          <h3 className="text-xl font-bold text-slate-200 mt-0.5">{tarefAtual.titulo}</h3>
                          <p className="text-xs text-slate-400 mt-1">Responsável: <strong className="text-slate-200">{tarefAtual.responsavel}</strong></p>
                        </div>
                        <p className="text-xs text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-800 leading-relaxed">{tarefAtual.descricao}</p>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between text-xs">
                          <span className="text-slate-500">Data Limite:</span>
                          <span className="text-rose-400 font-bold">{tarefAtual.prazo}</span>
                        </div>
                        {!eDonoDaTarefa && (
                          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-xl text-[11px] text-center font-medium">🔒 Modo de Leitura. Tarefa de <strong>{tarefAtual.responsavel}</strong>.</div>
                        )}
                      </div>

                      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[480px] shadow-xl">
                        <div className="p-4 bg-slate-950 border-b border-slate-800 rounded-t-2xl flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-300">Histórico de Tutoria IA</span>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-3">
                          {(tarefAtual.chatHistory || []).map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'aluno' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] rounded-xl px-3.5 py-2 text-xs ${msg.sender === 'aluno' ? 'bg-teal-500 text-slate-950 font-semibold' : 'bg-slate-950 text-slate-300 border border-slate-800'}`}>{msg.text}</div>
                            </div>
                          ))}
                          {digitando && <div className="text-xs text-slate-500 animate-pulse">Pensando...</div>}
                        </div>
                        <form onSubmit={(e) => handleEnviarMensagem(e, projAtual.id, grupAtual.id, tarefAtual.id)} className="p-4 border-t border-slate-800 bg-slate-950 rounded-b-2xl flex gap-2">
                          <input type="text" disabled={!eDonoDaTarefa} value={inputMessage} onChange={e => setInputMessage(e.target.value)} placeholder={eDonoDaTarefa ? "Peça orientações..." : "Apenas o dono da tarefa pode conversar com a IA."} className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-teal-500 disabled:opacity-40" />
                          <button type="submit" disabled={!eDonoDaTarefa} className="bg-teal-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs disabled:opacity-40">Enviar</button>
                        </form>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </>
        )}
      </main>

      {/* MODAL SOLICITAÇÃO */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4">
            <h4 className="text-lg font-bold">Solicitar Inclusão de Tarefa</h4>
            <form onSubmit={handleSugerirTarefa} className="space-y-3 text-sm">
              <div>
                <label className="block text-slate-400 text-xs mb-1">Título da Tarefa</label>
                <input type="text" value={novaTitulo} onChange={e => setNovaTitulo(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">O que será feito</label>
                <textarea value={novaDesc} onChange={e => setNovaDesc(e.target.value)} required rows="3" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white resize-none" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Responsável Proposto</label>
                <select value={novaResp} onChange={e => setNovaResp(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-300">
                  {grupoSelecionado?.integrantes.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setModalAberto(false)} className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-semibold text-slate-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl text-xs">Enviar Pedido</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}