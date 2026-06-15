export default function StudentCalendarView() {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Calendário de Entregas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-rose-400 font-bold text-center w-14">
            08 <span className="block text-[10px] uppercase font-medium">Jun</span>
          </div>
          <div>
            <h4 className="font-bold text-sm">Entrega: Pesquisa Inicial da Família Real</h4>
            <p className="text-xs text-slate-400">História - Brasil Império</p>
          </div>
        </div>
      </div>
    </div>
  );
}
