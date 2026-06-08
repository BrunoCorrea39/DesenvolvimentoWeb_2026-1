import { useState } from 'react';
import { mockAnos, mockTurmasPorAno } from '../mock/dadosMockados'; 

export default function DashboardProfessor({ projetos, setProjetos, onLogout }) { 
  const [menuAtivo, setMenuAtivo] = useState('turmas');
  const [janelaAtiva, setJanelaAtiva] = useState('anosHub');
  
  const [anoSelecionado, setAnoSelecionado] = useState(null);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [trabalhoSelecionado, setTrabalhoSelecionado] = useState(null);
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);

  const [carregandoIA, setCarregandoIA] = useState(false);
  const [tituloTrab, setTituloTrab] = useState('');
  const [conteudoTrab, setConteudoTrab] = useState('');

  // Estados para inserção manual de nova tarefa (REINTRODUZIDO)
  const [novaTarefaNome, setNovaTarefaNome] = useState('');
  const [novaTarefaResp, setNovaTarefaResp] = useState('');

  // Monitoramento
  const [tarefaChatEspiado, setTarefaChatEspiado] = useState(null);
  const [notaColetiva, setNotaColetiva] = useState('');

  // 1. Alterar o status da tarefa direto (REINTRODUZIDO)
  const handleAlternarStatusProf = (projId, grupoId, tarefaId) => {
    const ciclo = { 'A Fazer': 'Em Andamento', 'Em Andamento': 'Concluído', 'Concluído': 'A Fazer' };
    setProjetos(projetos.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          grupos: p.grupos.map(g => {
            if (g.id === grupoId) {
              return { ...g, tarefas: g.tarefas.map(t => t.id === tarefaId ? { ...t, status: ciclo[t.status] } : t) };
            }
            return g;
          })
        };
      }
      return p;
    }));
  };

  // 2. Atribuir/Alterar nota individual do aluno (REINTRODUZIDO)
  const handleNotaIndividual = (projId, grupoId, tarefaId, notaValor) => {
    setProjetos(projetos.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          grupos: p.grupos.map(g => {
            if (g.id === grupoId) {
              return { ...g, tarefas: g.tarefas.map(t => t.id === tarefaId ? { ...t, nota: notaValor ? Number(notaValor) : null } : t) };
            }
            return g;
          })
        };
      }
      return p;
    }));
  };

  // 3. Ver e gerenciar pedidos de inclusão vindos dos grupos (REINTRODUZIDO)
  const gerenciarSolicitacao = (projId, grupoId, solId, aprovar) => {
    setProjetos(projetos.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          grupos: p.grupos.map(g => {
            if (g.id === grupoId) {
              const sol = g.solicitacoesTarefas.find(s => s.id === solId);
              let tAtualizadas = [...g.tarefas];
              if (aprovar && sol) {
                tAtualizadas.push({
                  id: Date.now(),
                  titulo: `[Aprovado] ${sol.titulo}`,
                  descricao: sol.descricao,
                  responsavel: sol.responsavel,
                  status: "A Fazer",
                  prazo: "Definido por Prof",
                  nota: null,
                  chatHistory: []
                });
              }
              return {
                ...g,
                solicitacoesTarefas: g.solicitacoesTarefas.filter(s => s.id !== solId),
                tarefas: tAtualizadas
              };
            }
            return g;
          })
        };
      }
      return p;
    }));
  };

  // Autonomia: Mudar Responsável
  const handleMudarResponsavel = (projId, grupoId, tarefaId, novoDono) => {
    setProjetos(projetos.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          grupos: p.grupos.map(g => {
            if (g.id === grupoId) {
              return { ...g, tarefas: g.tarefas.map(t => t.id === tarefaId ? { ...t, responsavel: novoDono } : t) };
            }
            return g;
          })
        };
      }
      return p;
    }));
  };

  // Autonomia: Excluir Tarefa (REINTRODUZIDO)
  const handleExcluirTarefa = (projId, grupoId, tarefaId) => {
    setProjetos(projetos.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          grupos: p.grupos.map(g => {
            if (g.id === grupoId) {
              return { ...g, tarefas: g.tarefas.filter(t => t.id !== tarefaId) };
            }
            return g;
          })
        };
      }
      return p;
    }));
  };

  // Autonomia: Inserir Tarefa na Mão (REINTRODUZIDO)
  const handleAdicionarTarefaManual = (e, projId, grupoId) => {
    e.preventDefault();
    if (!novaTarefaNome.trim() || !novaTarefaResp) return;
    const novaT = {
      id: Date.now(),
      titulo: novaTarefaNome,
      descricao: "Inclusão manual do professor.",
      responsavel: novaTarefaResp,
      status: "A Fazer",
      prazo: "A combinar",
      nota: null,
      chatHistory: []
    };
    setProjetos(projetos.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          grupos: p.grupos.map(g => {
            if (g.id === grupoId) { return { ...g, tarefas: [...g.tarefas, novaT] }; }
            return g;
          })
        };
      }
      return p;
    }));
    setNovaTarefaNome('');
  };

  const handleCriarTrabalhoIA = (e) => {
    e.preventDefault();
    if (!tituloTrab || !conteudoTrab) return;
    setCarregandoIA(true);
    setTimeout(() => {
      const novoTrabalho = {
        id: Date.now(),
        turmaId: turmaSelecionada.id,
        titulo: tituloTrab,
        materia: "História",
        conteudo: conteudoTrab,
        grupos: [
          {
            id: `g_v4_${Date.now()}`,
            nome: "Grupo 1 - Gerado por IA",
            integrantes: ["Guilherme", "Sophia", "Lucas"],
            progresso: 0,
            notaColetiva: null,
            solicitacoesTarefas: [],
            tarefas: [
              { id: Date.now() + 5, titulo: "Pesquisa Temática", responsavel: "Guilherme", status: "A Fazer", prazo: "10/06", nota: null, chatHistory: [] }
            ]
          }
        ]
      };
      setProjetos([novoTrabalho, ...projetos]);
      setTituloTrab('');
      setConteudoTrab('');
      setCarregandoIA(false);
    }, 1200);
  };

  const handleSalvarNotasColetiva = (projId, grupoId) => {
    setProjetos(projetos.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          grupos: p.grupos.map(g => g.id === grupoId ? { ...g, notaColetiva: notaColetiva ? Number(notaColetiva) : g.notaColetiva } : g)
        };
      }
      return p;
    }));
    alert("Nota do grupo salva!");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-black">PF</div>
            <div>
              <h2 className="font-bold text-sm text-slate-200">Prof. Fernando</h2>
              <span className="text-xs text-purple-400 font-medium">História</span>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {['turmas', 'calendário', 'configurações'].map(tab => (
              <button key={tab} onClick={() => { setMenuAtivo(tab); setJanelaAtiva('anosHub'); }} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${menuAtivo === tab ? 'bg-purple-600 text-white font-bold shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>{tab}</button>
            ))}
          </nav>
        </div>
        <div className="p-4">
          <button onClick={onLogout} className="w-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white px-4 py-2 rounded-xl text-sm">Sair</button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL (SUBMENUS PRONTOS - CORRIGIDO) */}
      <main className="flex-1 p-8 overflow-y-auto">
        {menuAtivo === 'calendário' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-xl font-bold mb-4">Agenda do Professor</h3>
            <p className="text-sm text-slate-400">15/06 - Fechamento de Notas parciais da maquete (9º Ano A).</p>
          </div>
        )}

        {menuAtivo === 'configurações' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm">
            <h3 className="text-xl font-bold mb-4">Ajustes da Conta</h3>
            <p className="text-sm text-slate-400">Notificações de novas dúvidas no chat do Tutor IA ligadas.</p>
          </div>
        )}

        {menuAtivo === 'turmas' && (
          <>
            {janelaAtiva === 'anosHub' && (
              <div>
                <h3 className="text-2xl font-bold mb-6">Níveis de Ensino</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mockAnos.map(ano => (
                    <div key={ano.id} onClick={() => { setAnoSelecionado(ano); setJanelaAtiva('turmasHub'); }} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl cursor-pointer hover:border-purple-500/40 transition-all shadow-md">
                      <h4 className="text-lg font-bold text-slate-200">{ano.nome}</h4>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {janelaAtiva === 'turmasHub' && anoSelecionado && (
              <div>
                <button onClick={() => setJanelaAtiva('anosHub')} className="text-xs text-purple-400 hover:underline mb-4">← Voltar</button>
                <h3 className="text-xl font-bold mb-6">Turmas do <span className="text-purple-400">{anoSelecionado.nome}</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {mockTurmasPorAno[anoSelecionado.id]?.map(turma => (
                    <div key={turma.id} onClick={() => { setTurmaSelecionada(turma); setJanelaAtiva('trabalhosHub'); }} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl cursor-pointer hover:border-purple-500/40 transition-all shadow-md">
                      <h4 className="text-base font-bold text-slate-200">{turma.nome}</h4>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {janelaAtiva === 'trabalhosHub' && turmaSelecionada && (
              <div>
                <button onClick={() => setJanelaAtiva('turmasHub')} className="text-xs text-purple-400 hover:underline mb-4">← Voltar</button>
                <h3 className="text-xl font-bold mb-6">Trabalhos em: <span className="text-purple-400">{turmaSelecionada.nome}</span></h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit space-y-4">
                    <h4 className="font-bold text-sm text-slate-200">Novo Trabalho com IA</h4>
                    <form onSubmit={handleCriarTrabalhoIA} className="space-y-3 text-xs">
                      <input type="text" value={tituloTrab} onChange={e => setTituloTrab(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5" placeholder="Tema" disabled={carregandoIA} />
                      <textarea value={conteudoTrab} onChange={e => setConteudoTrab(e.target.value)} required rows="3" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 resize-none" placeholder="Diretrizes..." disabled={carregandoIA} />
                      <button type="submit" disabled={carregandoIA} className="w-full bg-purple-600 text-white font-bold py-2 rounded-xl">Distribuir com IA</button>
                    </form>
                  </div>
                  <div className="lg:col-span-2 space-y-3">
                    {projetos.filter(p => p.turmaId === turmaSelecionada.id).map(p => (
                      <div key={p.id} onClick={() => { setTrabalhoSelecionado(p); setJanelaAtiva('gruposHub'); }} className="bg-slate-900 border border-slate-800 p-5 rounded-xl cursor-pointer hover:border-slate-700 transition-all flex justify-between items-center">
                        <h5 className="font-bold text-sm text-slate-200">{p.titulo}</h5>
                        <span className="text-xs text-purple-400 font-semibold">{p.grupos.length} Grupos</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {janelaAtiva === 'gruposHub' && trabalhoSelecionado && (
              <div>
                <button onClick={() => setJanelaAtiva('trabalhosHub')} className="text-xs text-purple-400 hover:underline mb-4">← Voltar</button>
                <h3 className="text-xl font-bold mb-6">Equipes: <span className="text-purple-400">{trabalhoSelecionado.titulo}</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projetos.find(p => p.id === trabalhoSelecionado.id)?.grupos.map(g => (
                    <div key={g.id} onClick={() => { setGrupoSelecionado(g); setJanelaAtiva('grupoDetalhe'); setTarefaChatEspiado(null); }} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl cursor-pointer hover:border-purple-500/40 transition-all shadow-md">
                      <h4 className="text-base font-bold text-slate-200">{g.nome}</h4>
                      <p className="text-xs text-slate-500 mt-1">Alunos: {g.integrantes.join(', ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {janelaAtiva === 'grupoDetalhe' && trabalhoSelecionado && grupoSelecionado && (
              (() => {
                const projAtual = projetos.find(p => p.id === trabalhoSelecionado.id);
                const grupAtual = projAtual.grupos.find(g => g.id === grupoSelecionado.id);
                return (
                  <div>
                    <button onClick={() => setJanelaAtiva('gruposHub')} className="text-xs text-purple-400 hover:underline mb-4">← Voltar</button>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      <div className="lg:col-span-2 space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase">Gestão das Tarefas e Autonomia</h4>
                        <div className="space-y-3">
                          {grupAtual.tarefas.map(t => (
                            <div key={t.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                <h5 className="font-bold text-sm text-slate-200">{t.titulo}</h5>
                                <div className="flex gap-4 text-xs text-slate-500 mt-1">
                                  {/* ALTERAR STATUS DA TAREFA REINTRODUZIDO */}
                                  <span>Status: <button onClick={() => handleAlternarStatusProf(projAtual.id, grupAtual.id, t.id)} className="text-purple-400 hover:underline font-bold">{t.status} ⇄</button></span>
                                  {t.chatHistory?.length > 0 && <button onClick={() => setTarefaChatEspiado(t)} className="text-teal-400 hover:underline font-medium">Espiar Chat</button>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* ATRIBUIR NOTA INDIVIDUAL REINTRODUZIDO */}
                                <input type="number" placeholder={t.nota !== null ? String(t.nota) : "Nota Aluno"} onChange={e => handleNotaIndividual(projAtual.id, grupAtual.id, t.id, e.target.value)} className="w-20 bg-slate-950 border border-slate-800 rounded p-1 text-xs text-center text-teal-400" />
                                <select value={t.responsavel} onChange={e => handleMudarResponsavel(projAtual.id, grupAtual.id, t.id, e.target.value)} className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300"><option value="">Mudar Dono</option>{grupAtual.integrantes.map(i => <option key={i} value={i}>{i}</option>)}</select>
                                {/* EXCLUIR TAREFA REINTRODUZIDO */}
                                <button onClick={() => handleExcluirTarefa(projAtual.id, grupAtual.id, t.id)} className="text-rose-400 text-xs bg-rose-500/10 p-1.5 rounded border border-rose-500/20">Excluir</button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* ADICIONAR TAREFA NA MÃO REINTRODUZIDO */}
                        <form onSubmit={(e) => handleAdicionarTarefaManual(e, projAtual.id, grupAtual.id)} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3 text-xs">
                          <input type="text" value={novaTarefaNome} onChange={e => setNovaTarefaNome(e.target.value)} placeholder="Inserir tarefa manual..." required className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2" />
                          <select value={novaTarefaResp} onChange={e => setNovaTarefaResp(e.target.value)} required className="bg-slate-950 border border-slate-800 rounded-lg p-2"><option value="">Selecionar Aluno</option>{grupAtual.integrantes.map(i => <option key={i} value={i}>{i}</option>)}</select>
                          <button type="submit" className="bg-purple-600 px-4 py-2 rounded-lg font-bold">Criar</button>
                        </form>
                      </div>

                      <div className="space-y-4">
                        {/* SOLICITAÇÕES DOS ALUNOS REINTRODUZIDO */}
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow space-y-3">
                          <h4 className="font-bold text-xs uppercase text-slate-400">Solicitações de Inclusão da Equipe</h4>
                          {grupAtual.solicitacoesTarefas?.length === 0 ? (
                            <p className="text-xs text-slate-500 text-center py-2">Nenhum pedido pendente.</p>
                          ) : (
                            grupAtual.solicitacoesTarefas?.map(sol => (
                              <div key={sol.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2 text-xs">
                                <h5 className="font-bold text-slate-200">{sol.titulo}</h5>
                                <p className="text-[11px] text-slate-400">{sol.descricao}</p>
                                <span className="block text-[10px] text-slate-500">Por: {sol.responsavel}</span>
                                <div className="flex gap-2 pt-1">
                                  <button onClick={() => gerenciarSolicitacao(projAtual.id, grupAtual.id, sol.id, false)} className="flex-1 bg-rose-500/10 text-rose-400 p-1 rounded text-[10px] font-bold">Recusar</button>
                                  <button onClick={() => gerenciarSolicitacao(projAtual.id, grupAtual.id, sol.id, true)} className="flex-1 bg-emerald-500/10 text-emerald-400 p-1 rounded text-[10px] font-bold">Aprovar</button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* ESPIAR CHAT (REINTRODUZIDO) */}
                        {tarefaChatEspiado && (
                          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl h-[200px] flex flex-col shadow">
                            <h5 className="text-xs font-bold text-teal-400 mb-2 pb-1 border-b border-slate-800">Chat de: {tarefaChatEspiado.responsavel}</h5>
                            <div className="flex-1 overflow-y-auto space-y-1.5 text-[11px]">
                              {tarefaChatEspiado.chatHistory?.map(c => (
                                <div key={c.id} className="bg-slate-950 p-1.5 rounded"><strong className="text-purple-400">{c.sender}: </strong>{c.text}</div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
                          <h4 className="font-bold text-xs uppercase text-slate-400">Atribuir Nota Coletiva</h4>
                          <input type="number" placeholder="Nota 0-10" value={notaColetiva} onChange={e => setNotaColetiva(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-center text-teal-400 font-bold" />
                          <button onClick={() => handleSalvarNotasColetiva(projAtual.id, grupAtual.id)} className="w-full bg-purple-600 font-bold py-2 rounded-xl text-xs">Salvar Nota Coletiva</button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()
            )}
          </>
        )}
      </main>
    </div>
  );
}