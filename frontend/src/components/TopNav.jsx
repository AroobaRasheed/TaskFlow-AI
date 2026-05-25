import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Menu, ChevronDown, LogOut, User, Settings, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { api } from '../lib/api.js';

export default function TopNav({ onMobileMenu }) {
  const [profileOpen, setProfileOpen]   = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const { user, logout } = useAuth();
  const navigate    = useNavigate();
  const profileRef  = useRef(null);
  const notifRef    = useRef(null);
  const searchRef   = useRef(null);

  // Live data for search
  const { data: allTasks } = useApi(() => api.getTasks(), { interval: 15000 });

  // Live notifications
  const { data: liveNotifs } = useApi(() => api.getNotifications(), { interval: 10000 });
  const unreadCount = liveNotifs?.filter(n => !n.read)?.length ?? 0;

  const notifications = (Array.isArray(liveNotifs) ? liveNotifs : []).slice(0, 5).map(n => ({
    title: n.title,
    message: n.message,
    time: new Date(n.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    color: n.type === 'success' ? '#34D399' : n.type === 'warning' ? '#FBBF24' : n.type === 'error' ? '#F87171' : '#A78BFA',
  }));
  const fallbackNotifs = notifications.length > 0 ? notifications : [
    { title: 'AI flagged a high-risk task', message: 'Payments integration needs attention', time: '2m ago', color: '#F87171' },
    { title: 'Q3 Roadmap assigned to you',  message: 'New task assigned by Mira',           time: '1h ago', color: '#A78BFA' },
    { title: 'Mira completed 3 tasks',       message: 'Sprint progress updated',              time: '3h ago', color: '#34D399' },
  ];

  // ─── Search logic ─────────────────────────────────────────────────────────
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) { setSearchResults([]); setSearchOpen(false); return; }
    setSearchOpen(true);

    const taskResults = (allTasks ?? [])
      .filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q) ||
        t.priority.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q)
      )
      .slice(0, 6)
      .map(t => ({
        type: 'task',
        label: t.title,
        sub: `${t.status.replace('_', ' ')} · ${t.priority} priority`,
        color: t.priority === 'high' ? '#F87171' : t.priority === 'medium' ? '#FBBF24' : '#34D399',
        action: () => { navigate('/app/tasks'); closeSearch(); },
      }));

    // Static nav pages that match
    const pages = [
      { label: 'Dashboard',       path: '/app',          icon: '📊' },
      { label: 'AI Task Analyzer',path: '/app/analyzer', icon: '🧠' },
      { label: 'Task Board',      path: '/app/tasks',    icon: '📋' },
      { label: 'Chat Assistant',  path: '/app/chat',     icon: '💬' },
      { label: 'Progress Tracking',path:'/app/progress', icon: '📈' },
      { label: 'Team Analytics',  path: '/app/team',     icon: '👥' },
      { label: 'Settings',        path: '/app/settings', icon: '⚙️' },
    ].filter(p => p.label.toLowerCase().includes(q))
     .map(p => ({
       type: 'page',
       label: p.label,
       sub: 'Navigate to page',
       color: 'var(--accent-1, #A78BFA)',
       icon: p.icon,
       action: () => { navigate(p.path); closeSearch(); },
     }));

    setSearchResults([...pages, ...taskResults]);
  }, [searchQuery, allTasks]);

  const closeSearch = () => {
    setSearchQuery('');
    setSearchOpen(false);
    setSearchResults([]);
  };

  // ─── Close dropdowns on outside click ────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (searchRef.current  && !searchRef.current.contains(e.target))  closeSearch();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ─── Keyboard shortcut Ctrl+K / Cmd+K ────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('main-search')?.focus();
      }
      if (e.key === 'Escape') closeSearch();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSignOut = () => {
    logout();
    setProfileOpen(false);
    navigate('/login');
  };

  const displayName = user?.name || 'Guest';
  const initials    = displayName.substring(0, 2).toUpperCase();

  return (
    <header className="h-16 flex items-center gap-4 px-4 lg:px-6 border-b border-white/5 bg-bg/60 backdrop-blur-xl sticky top-0 z-30">
      <button onClick={onMobileMenu} className="lg:hidden p-2 rounded-lg hover:bg-white/5">
        <Menu className="w-5 h-5"/>
      </button>

      {/* ── Search bar ── */}
      <div className="flex-1 max-w-xl relative" ref={searchRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none"/>
        <input
          id="main-search"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery && setSearchOpen(true)}
          placeholder="Search tasks, pages… (Ctrl+K)"
          className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-10 py-2 text-sm
                     placeholder:text-white/30 focus:outline-none transition-all"
          style={{ borderColor: searchOpen ? 'var(--accent-1, #8B5CF6)99' : undefined }}
          autoComplete="off"
        />
        {searchQuery
          ? <button onClick={closeSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
              <X className="w-3.5 h-3.5"/>
            </button>
          : <kbd className="hidden md:inline absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40 border border-white/10 rounded px-1.5 py-0.5">⌘K</kbd>
        }

        {/* Search results dropdown */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              className="absolute top-full mt-2 w-full glass-strong rounded-2xl overflow-hidden z-50 shadow-2xl">
              {searchResults.length === 0 ? (
                <div className="px-4 py-5 text-sm text-white/40 text-center">
                  No results for "<span className="text-white/60">{searchQuery}</span>"
                </div>
              ) : (
                <div className="p-2">
                  {searchResults.map((r, i) => (
                    <button key={i} onClick={r.action}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-left transition group">
                      <div className="w-7 h-7 rounded-lg grid place-items-center text-sm shrink-0 bg-white/5">
                        {r.type === 'page' ? r.icon : '✅'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{r.label}</div>
                        <div className="text-xs text-white/40 truncate">{r.sub}</div>
                      </div>
                      <span className="text-xs text-white/20 group-hover:text-white/40 transition">
                        {r.type === 'page' ? 'Go →' : 'View →'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2">
        {/* ── Notifications ── */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen(o => !o)}
            className="relative p-2.5 rounded-xl hover:bg-white/5 border border-white/5 transition">
            <Bell className="w-5 h-5"/>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full shadow-[0_0_8px_#8B5CF6]"
                style={{ background: 'var(--accent-1, #8B5CF6)' }}/>
            )}
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="absolute right-0 mt-2 w-80 glass-strong p-3 z-50">
                <div className="flex items-center justify-between px-2 py-1 mb-1">
                  <span className="text-xs uppercase tracking-wider text-white/40">Notifications</span>
                  <button className="text-xs hover:text-white transition" style={{ color: 'var(--accent-1, #A78BFA)' }}>
                    Mark all read
                  </button>
                </div>
                {fallbackNotifs.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-white/40 text-center">No notifications</div>
                ) : fallbackNotifs.map((n, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition">
                    <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: n.color, boxShadow: `0 0 8px ${n.color}` }}/>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{n.title}</div>
                      <div className="text-xs text-white/40 truncate">{n.message}</div>
                      <div className="text-xs text-white/25 mt-0.5">{n.time}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Profile ── */}
        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen(o => !o)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-white/5 border border-white/5 transition">
            <div className="w-8 h-8 rounded-lg grid place-items-center text-xs font-semibold"
              style={{ background: 'linear-gradient(135deg, var(--btn-from, #8B5CF6), var(--btn-to, #3B82F6))' }}>
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm leading-tight">{displayName}</div>
              <div className="text-[11px] text-white/40 leading-tight capitalize">{user?.role || 'member'}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-white/40"/>
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="absolute right-0 mt-2 w-56 glass-strong p-2 z-50">
                <Link to="/app/settings" onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm">
                  <User className="w-4 h-4"/>Profile
                </Link>
                <Link to="/app/settings" onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm">
                  <Settings className="w-4 h-4"/>Account settings
                </Link>
                <div className="my-1 h-px bg-white/10"/>
                <button onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-red-400 hover:text-red-300 transition">
                  <LogOut className="w-4 h-4"/>Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
