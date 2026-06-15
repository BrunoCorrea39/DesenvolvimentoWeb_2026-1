const accentStyles = {
  teal: {
    avatar: 'bg-teal-500 text-black',
    active: 'bg-teal-500 text-black',
    meta: 'text-teal-400'
  },
  purple: {
    avatar: 'bg-purple-500 text-black',
    active: 'bg-purple-600 text-black',
    meta: 'text-purple-400'
  }
};

export default function AppLayout({
  profile,
  menuItems,
  activeMenu,
  onMenuChange,
  onLogout,
  accent = 'teal',
  children
}) {
  const styles = accentStyles[accent];

  return (
    <div className="min-h-screen bg-white text-slate-200 flex">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shadow-sm">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${styles.avatar}`}>
              {profile.initials}
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-200">{profile.name}</h2>
              <span className={`text-xs font-medium ${styles.meta}`}>{profile.subtitle}</span>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onMenuChange(item)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeMenu === item
                    ? `${styles.active} font-bold shadow`
                    : 'text-slate-400 hover:bg-slate-950 hover:text-slate-200'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4">
          <button
            type="button"
            onClick={onLogout}
            className="w-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 px-4 py-2 rounded-xl text-sm"
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
