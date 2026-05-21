import { Link } from 'react-router-dom';

export default function Logo({ size = 'md', to = '/' }) {
  const dims = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  return (
    <Link to={to} className="flex items-center gap-2.5 group">
      <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-purple to-neon-blue grid place-items-center
                      shadow-[0_0_20px_rgba(139,92,246,0.5)] group-hover:shadow-[0_0_30px_rgba(139,92,246,0.8)] transition-shadow">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white">
          <path d="M12 2 L20 7 L20 17 L12 22 L4 17 L4 7 Z" fill="none" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
        </svg>
      </div>
      <span className={`font-display font-bold ${dims} tracking-tight`}>
        TaskFlow <span className="text-gradient">AI</span>
      </span>
    </Link>
  );
}
