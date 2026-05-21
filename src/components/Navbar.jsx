import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Logo from './Logo.jsx';

export default function Navbar() {
  const links = [
    { label: 'Features', href: '#features' },
    { label: 'Workflow', href: '#workflow' },
    { label: 'AI', href: '#ai' },
    { label: 'Team', href: '#team' },
  ];
  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-bg/60 border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
          {links.map(l => (
            <a key={l.label} href={l.href} className="hover:text-white transition-colors">{l.label}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden sm:inline text-sm text-white/70 hover:text-white">Sign in</Link>
          <Link to="/signup" className="btn-primary text-sm py-2 px-4">
            <Sparkles className="w-4 h-4"/> Get Started
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
