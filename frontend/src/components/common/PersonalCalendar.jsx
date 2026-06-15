import { useEffect, useState } from 'react';
import { createCalendarEvent, deleteCalendarEvent, fetchCalendarEvents } from '../../services/api';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const ACENTOS = {
  purple: { botao: 'bg-purple-600', texto: 'text-purple-400', badge: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
  teal: { botao: 'bg-teal-500', texto: 'text-teal-400', badge: 'bg-teal-500/10 border-teal-500/20 text-teal-400' }
};

function formatarData(iso) {
  const [ano, mes, dia] = (iso || '').split('-');
  const indice = Number(mes) - 1;
  return { dia: dia || '--', mes: MESES[indice] || '', ano: ano || '' };
}

export default function PersonalCalendar({ token, accent = 'purple', titulo = 'Meu Calendário', projetos = [] }) {
  const cores = ACENTOS[accent] || ACENTOS.purple;
  const hoje = new Date().toISOString().split('T')[0];

  const [eventos, setEventos] = useState([]);
  const [data, setData] = useState('');
  const [tituloEvento, setTituloEvento] = useState('');
  const [descricao, setDescricao] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    setCarregando(true);
    try {
      const dados = await fetchCalendarEvents(token);
      setEventos(dados);
    } catch (error) {
      alert(error.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    let ativo = true;
    fetchCalendarEvents(token)
      .then((dados) => {
        if (ativo) setEventos(dados);
      })
      .catch(() => {})
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [token]);

  const handleAdicionar = async (event) => {
    event.preventDefault();
    if (!data || !tituloEvento.trim()) return;

    setSalvando(true);
    try {
      await createCalendarEvent(token, { title: tituloEvento, date: data, description: descricao || null });
      await carregar();
      setData('');
      setTituloEvento('');
      setDescricao('');
    } catch (error) {
      alert(error.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (eventId) => {
    try {
      await deleteCalendarEvent(token, eventId);
      await carregar();
    } catch (error) {
      alert(error.message);
    }
  };

  const itensTrabalhos = projetos
    .filter((projeto) => projeto.prazo)
    .map((projeto) => ({
      key: `t${projeto.id}`,
      tipo: 'trabalho',
      date: projeto.prazo,
      title: projeto.titulo,
      description: `Entrega do trabalho${projeto.materia ? ` • ${projeto.materia}` : ''}`
    }));
  const itensPessoais = eventos.map((evento) => ({
    key: `e${evento.id}`,
    tipo: 'pessoal',
    id: evento.id,
    date: evento.date,
    title: evento.title,
    description: evento.description
  }));
  const itens = [...itensPessoais, ...itensTrabalhos].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">{titulo}</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleAdicionar} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit space-y-3 text-xs">
          <h4 className="font-bold text-sm text-slate-200">Novo compromisso</h4>
          <label className="block space-y-1">
            <span className="text-slate-200 font-semibold">Data</span>
            <input
              type="date"
              value={data}
              min={hoje}
              onChange={(e) => setData(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5"
              disabled={salvando}
            />
          </label>
          <input
            type="text"
            value={tituloEvento}
            onChange={(e) => setTituloEvento(e.target.value)}
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5"
            placeholder="Título"
            disabled={salvando}
          />
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows="2"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 resize-none"
            placeholder="Detalhes (opcional)"
            disabled={salvando}
          />
          <button type="submit" disabled={salvando} className={`w-full ${cores.botao} text-black font-bold py-2 rounded-xl disabled:opacity-50`}>
            Adicionar
          </button>
        </form>

        <div className="lg:col-span-2 space-y-3">
          {carregando && <p className="text-xs text-slate-500">Carregando...</p>}

          {!carregando && itens.length === 0 && (
            <p className="text-sm text-slate-500">Nenhum compromisso ainda. Adicione um ou crie um trabalho com prazo.</p>
          )}

          {itens.map((item) => {
            const { dia, mes } = formatarData(item.date);
            const badge = item.tipo === 'trabalho' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : cores.badge;
            return (
              <div key={item.key} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                <div className={`border p-3 rounded-lg font-bold text-center w-14 shrink-0 ${badge}`}>
                  {dia} <span className="block text-[10px] uppercase font-medium">{mes}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {item.tipo === 'trabalho' && (
                      <span className="text-[10px] font-bold uppercase text-rose-400 border border-rose-500/30 rounded px-1.5 py-0.5">Entrega</span>
                    )}
                    <h4 className="font-bold text-sm text-slate-200 truncate">{item.title}</h4>
                  </div>
                  {item.description && <p className="text-xs text-slate-400">{item.description}</p>}
                </div>
                {item.tipo === 'pessoal' && (
                  <button
                    type="button"
                    onClick={() => handleExcluir(item.id)}
                    className="text-xs font-semibold text-red-400 hover:text-red-300 shrink-0"
                  >
                    Excluir
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
