export default function BackButton({ onClick, children, accent = 'teal' }) {
  const color = accent === 'purple' ? 'text-purple-400' : 'text-teal-400';

  return (
    <button type="button" onClick={onClick} className={`text-xs ${color} hover:underline mb-4`}>
      {children}
    </button>
  );
}
