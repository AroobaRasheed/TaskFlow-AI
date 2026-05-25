import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, BrainCircuit, KanbanSquare, MessagesSquare,
  LineChart, Users, Settings as SettingsIcon, ChevronLeft, Sparkles,
  UserCheck, GitBranch
} from 'lucide-react';
import Logo from './Logo.jsx';

const items = [
  { to: '/app',            label: 'Dashboard',        icon: LayoutDashboard, end: true },
  { to: '/app/analyzer',   label: 'AI Task Analyzer',  icon: BrainCircuit },
  { to: '/app/tasks',      label: 'Tasks',             icon: KanbanSquare },
  { to: '/app/chat',       label: 'Chat Assistant',    icon: MessagesSquare },
  { to: '/app/progress',   label: 'Progress Tracking', icon: LineChart },
  { to: '/app/team',       label: 'Team Analytics',    icon: Users },
  { to: '/app/team-hub',   label: 'Team Hub',          icon: UserCheck },
  { to: '/app/workflows',  label: 'Workflows',         icon: GitBranch },
  { to: '/app/settings',   label: 'Settings',          icon: SettingsIcon },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  return (
    <>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onMobileClose}/>
      )}
      <motion.aside
        animate={{ width: collapsed ? 76 : 248 }}
        transition={{ duration: 0.25 }}
        className={`fixed lg:static z-50 top-0 left-0 h-screen flex flex-col
                    bg-bg/80 backdrop-blur-2xl border-r border-white/5
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    transition-transform`}>

        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/5">
          {!collapsed
            ? <Logo to="/app"/>
            : <div className="w-9 h-9 rounded-xl grid place-items-center mx-auto"
                style={{ background: 'linear-gradient(135deg, var(--btn-from, #8B5CF6), var(--btn-to, #3B82F6))', boxShadow: '0 0 20px var(--glow-1, rgba(139,92,246,0.35))' }}>
                <Sparkles className="w-5 h-5"/>
              </div>
          }
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={onMobileClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                 transition-all ${isActive
                   ? 'text-white border'
                   : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'}`}
              style={({ isActive }) => isActive ? {
                background: 'linear-gradient(to right, var(--accent-1, #8B5CF6)33, var(--accent-2, #3B82F6)1A)',
                borderColor: 'var(--accent-1, #8B5CF6)4D',
                boxShadow: '0 0 20px var(--glow-1, rgba(139,92,246,0.25))',
              } : {}}>
              {({ isActive }) => (
                <>
                  <item.icon className="w-5 h-5 shrink-0"
                    style={isActive ? { color: 'var(--accent-1, #A78BFA)' } : {}}/>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {isActive && !collapsed && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{ background: 'var(--accent-1, #A78BFA)', boxShadow: '0 0 8px var(--accent-1, #A78BFA)' }}/>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button onClick={onToggle}
          className="hidden lg:flex items-center justify-center h-10 mx-3 mb-3 rounded-xl border border-white/10 hover:bg-white/5 text-white/60 hover:text-white transition">
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`}/>
        </button>
      </motion.aside>
    </>
  );
}
