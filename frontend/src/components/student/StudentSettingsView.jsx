export default function StudentSettingsView({ notificacoes, onToggleNotificacoes }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md">
      <h3 className="text-xl font-bold mb-4">Preferências do Sistema</h3>
      <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-300">
        <input
          type="checkbox"
          checked={notificacoes}
          onChange={onToggleNotificacoes}
          className="rounded bg-slate-950 border-slate-800 text-teal-500"
        />
        Ativar avisos de prazos de tarefas por e-mail
      </label>
    </div>
  );
}
