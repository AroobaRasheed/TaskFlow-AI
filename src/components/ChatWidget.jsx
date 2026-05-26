import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Zap, ListChecks, Users, BarChart3, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const QUICK_ACTIONS = [
  { label: 'My Stats', icon: BarChart3, prompt: 'Show my stats' },
  { label: 'My Tasks', icon: ListChecks, prompt: 'List all my tasks' },
  { label: 'Overdue', icon: Clock, prompt: "What's overdue?" },
  { label: 'Team', icon: Users, prompt: 'Show my team' },
];

function formatMessage(text) {
  if (!text) return '';
  return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function ActionBadge({ type }) {
  const badges = {
    task_created:     { label: 'Task Created',    color: '#34D399' },
    task_updated:     { label: 'Task Updated',    color: '#60A5FA' },
    task_deleted:     { label: 'Task Deleted',    color: '#F87171' },
    task_list:        { label: 'Tasks',           color: '#93C5FD' },
    stats:            { label: 'Dashboard',       color: '#818CF8' },
    member_added:     { label: 'Member Added',    color: '#34D399' },
    member_removed:   { label: 'Member Removed',  color: '#F87171' },
    team_list:        { label: 'Team',            color: '#60A5FA' },
    workflow_created: { label: 'Workflow Created', color: '#34D399' },
    workflow_list:    { label: 'Workflows',       color: '#93C5FD' },
    deadlines:        { label: 'Deadlines',       color: '#FBBF24' },
    overdue:          { label: 'Overdue',         color: '#F87171' },
  };
  const b = badges[type];
  if (!b) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mb-2"
      style={{ background: `${b.color}18`, color: b.color, border: `1px solid ${b.color}25` }}>
      <Zap className="w-3 h-3"/>{b.label}
    </span>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuth();

  const displayName = user?.name?.split(' ')[0] || 'there';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape' && open) setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('taskflow_user'))?.token}`,
        },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMessages(m => [...m, {
        role: 'ai',
        text: data.message,
        actionType: data.data?.type,
        intent: data.intent,
      }]);
    } catch (err) {
      setMessages(m => [...m, {
        role: 'ai',
        text: err.message || 'Something went wrong. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const userInitials = (user?.name || 'U').substring(0, 2).toUpperCase();

  return (
    <>
      {/* ── Floating Glass Trigger ── */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-2xl grid place-items-center border border-white/20 transition-all hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.35), rgba(139,92,246,0.25))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(59,130,246,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={!open ? { y: [0, -4, 0] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        title="AI Command Center (Ctrl+J)"
      >
        <Sparkles className="w-6 h-6 text-white drop-shadow-lg"/>
        <span className="absolute inset-0 rounded-2xl animate-ping opacity-15"
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.4), rgba(139,92,246,0.3))' }}/>
      </motion.button>

      {/* ── Glass Modal Overlay ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] grid place-items-center p-4"
            style={{ background: 'rgba(0, 10, 30, 0.45)', backdropFilter: 'blur(4px)' }}
            onClick={e => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl h-[75vh] flex flex-col rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(165deg, rgba(255,255,255,0.10) 0%, rgba(59,130,246,0.08) 40%, rgba(139,92,246,0.06) 100%)',
                backdropFilter: 'blur(40px) saturate(1.4)',
                WebkitBackdropFilter: 'blur(40px) saturate(1.4)',
                border: '1px solid rgba(255,255,255,0.18)',
                boxShadow: '0 0 80px rgba(59,130,246,0.12), 0 25px 60px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(255,255,255,0.05)',
              }}
            >
              {/* ── Glass Header ── */}
              <div className="flex items-center justify-between px-6 py-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(59,130,246,0.06))',
                  borderBottom: '1px solid rgba(255,255,255,0.10)',
                }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl grid place-items-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.4), rgba(139,92,246,0.35))',
                      border: '1px solid rgba(255,255,255,0.15)',
                      boxShadow: '0 4px 15px rgba(59,130,246,0.25)',
                    }}>
                    <Sparkles className="w-5 h-5 text-white"/>
                  </div>
                  <div>
                    <div className="font-display font-semibold text-sm text-white/90">AI Command Center</div>
                    <div className="text-xs text-white/40 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_6px_rgba(59,130,246,0.6)]"/>
                      Ready · Ctrl+J to toggle
                    </div>
                  </div>
                </div>
                <button onClick={() => setOpen(false)}
                  className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition">
                  <X className="w-5 h-5"/>
                </button>
              </div>

              {/* ── Messages ── */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {messages.length === 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-4 grid place-items-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.15))',
                        border: '1px solid rgba(255,255,255,0.10)',
                      }}>
                      <Sparkles className="w-8 h-8 text-blue-300"/>
                    </div>
                    <div className="font-display font-semibold text-lg mb-2 text-white/90">Hi {displayName}!</div>
                    <p className="text-sm text-white/40 max-w-sm mx-auto leading-relaxed">
                      I can manage your tasks, check stats, handle your team, and more — all through chat.
                    </p>
                  </motion.div>
                )}

                {messages.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg grid place-items-center text-xs font-semibold shrink-0 ${
                      m.role === 'user'
                        ? 'bg-gradient-to-br from-blue-400/80 to-cyan-400/70'
                        : ''
                    }`}
                      style={m.role !== 'user' ? {
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.4), rgba(139,92,246,0.35))',
                        border: '1px solid rgba(255,255,255,0.12)',
                      } : { border: '1px solid rgba(255,255,255,0.12)' }}>
                      {m.role === 'user' ? userInitials : 'AI'}
                    </div>
                    <div className={`max-w-[80%] ${m.role === 'user' ? 'text-right' : ''}`}>
                      {m.actionType && <ActionBadge type={m.actionType}/>}
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                        m.role === 'user'
                          ? 'rounded-tr-sm inline-block text-left'
                          : 'rounded-tl-sm'
                      }`}
                        style={m.role === 'user'
                          ? {
                              background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(99,102,241,0.20))',
                              border: '1px solid rgba(59,130,246,0.20)',
                            }
                          : {
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.10)',
                            }
                        }>
                        {m.role === 'ai' ? formatMessage(m.text) : m.text}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg grid place-items-center text-xs font-semibold"
                      style={{
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.4), rgba(139,92,246,0.35))',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}>AI</div>
                    <div className="rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                      {[0,1,2].map(j => (
                        <motion.span key={j} className="w-1.5 h-1.5 rounded-full bg-blue-400"
                          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: j * 0.15 }}/>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* ── Quick Actions ── */}
              {messages.length === 0 && (
                <div className="px-6 pb-3">
                  <div className="flex flex-wrap gap-2">
                    {QUICK_ACTIONS.map(a => (
                      <button key={a.label} onClick={() => send(a.prompt)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white/60 hover:text-white transition"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.10)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}>
                        <a.icon className="w-3 h-3"/>{a.label}
                      </button>
                    ))}
                    <button onClick={() => send('Create a high priority task called "Review PR" due tomorrow')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-blue-300/70 hover:text-blue-200 transition"
                      style={{
                        background: 'rgba(59,130,246,0.08)',
                        border: '1px solid rgba(59,130,246,0.18)',
                      }}>
                      <Zap className="w-3 h-3 text-blue-400"/>Try: Create a task
                    </button>
                  </div>
                </div>
              )}

              {/* ── Glass Input Bar ── */}
              <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-2 rounded-2xl px-4 py-1"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                  }}>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder="Create a task, check stats, manage team…"
                    className="flex-1 bg-transparent outline-none text-sm py-2.5 placeholder:text-white/25 text-white/90"
                    disabled={loading}
                  />
                  <button onClick={() => send()} disabled={!input.trim() || loading}
                    className="p-2 rounded-xl transition disabled:opacity-30"
                    style={{
                      background: input.trim()
                        ? 'linear-gradient(135deg, rgba(59,130,246,0.5), rgba(139,92,246,0.4))'
                        : 'transparent',
                      border: input.trim() ? '1px solid rgba(255,255,255,0.12)' : 'none',
                    }}>
                    <Send className="w-4 h-4"/>
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2 px-1">
                  <span className="text-xs text-white/20">Powered by Gemini AI</span>
                  <span className="text-xs text-white/20">Esc to close</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
