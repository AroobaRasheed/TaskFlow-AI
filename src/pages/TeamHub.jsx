import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Users, UserPlus, Send, Trash2, X, MessageSquare,
  Circle, Edit2, Check, MoreVertical, Search, Building2
} from 'lucide-react';

const DEPT_OPTIONS = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'Operations', 'HR', 'Finance'];
const COLORS = ['#8B5CF6','#3B82F6','#10B981','#F59E0B','#EF4444','#EC4899','#14B8A6','#F97316'];

function Avatar({ initials, color, size = 10, status }) {
  return (
    <div className="relative inline-block shrink-0">
      <div
        className={`w-${size} h-${size} rounded-xl grid place-items-center text-xs font-bold text-white`}
        style={{ background: color, boxShadow: `0 0 12px ${color}55` }}
      >
        {initials}
      </div>
      {status && (
        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-bg
          ${status === 'online' ? 'bg-emerald-400' : status === 'away' ? 'bg-yellow-400' : 'bg-white/30'}`}/>
      )}
    </div>
  );
}

function StatusDot({ status }) {
  const map = { online: 'bg-emerald-400 text-emerald-400', away: 'bg-yellow-400 text-yellow-400', offline: 'bg-white/30 text-white/30' };
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${map[status] || map.offline}`}>
      <Circle className="w-2 h-2 fill-current" />{status}
    </span>
  );
}

// ─── Add Member Modal ──────────────────────────────────────────────────────
function AddMemberModal({ onClose }) {
  const addMember = useMutation(api.teamMembers.addTeamMember);
  const [form, setForm] = useState({ name: '', email: '', role: '', department: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.role.trim()) {
      setError('Name, email and role are required.');
      return;
    }
    setLoading(true);
    try {
      await addMember({ name: form.name, email: form.email, role: form.role, department: form.department || undefined });
      onClose();
    } catch (e) {
      setError(e.message || 'Failed to add member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-strong w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-lg">Add Team Member</h2>
            <p className="text-white/40 text-sm">Invite someone to your team</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition"><X className="w-4 h-4"/></button>
        </div>

        {error && <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</div>}

        <div className="space-y-3">
          {[
            { key: 'name', label: 'Full Name', placeholder: 'e.g. Alex Kim' },
            { key: 'email', label: 'Email Address', placeholder: 'alex@company.com' },
            { key: 'role', label: 'Job Title / Role', placeholder: 'e.g. Frontend Engineer' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">{label}</label>
              <input className="input-glow" placeholder={placeholder} value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
          ))}
          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">Department (optional)</label>
            <select className="input-glow" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
              <option value="">Select department…</option>
              {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
            {loading ? 'Adding…' : 'Add Member'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Member Card ───────────────────────────────────────────────────────────
function MemberCard({ member, onStartChat, onRemove }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const updateMember = useMutation(api.teamMembers.updateTeamMember);

  const cycleStatus = async () => {
    const next = { offline: 'online', online: 'away', away: 'offline' };
    await updateMember({ id: member._id, status: next[member.status] });
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="glass p-4 hover:border-white/20 transition-all group relative">
      <div className="flex items-start gap-3">
        <Avatar initials={member.avatarInitials} color={member.avatarColor} size={11} status={member.status} />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{member.name}</div>
          <div className="text-xs text-white/50 truncate">{member.role}</div>
          {member.department && (
            <div className="flex items-center gap-1 mt-1">
              <Building2 className="w-3 h-3 text-white/30" />
              <span className="text-xs text-white/30">{member.department}</span>
            </div>
          )}
          <button onClick={cycleStatus} className="mt-1.5"><StatusDot status={member.status} /></button>
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen(o => !o)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition">
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-30 glass-strong rounded-xl overflow-hidden w-40 shadow-xl">
              <button onClick={() => { onStartChat(member); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-white/10 transition text-left">
                <MessageSquare className="w-4 h-4 text-blue-400" />Message
              </button>
              <button onClick={() => { onRemove(member._id); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-red-500/20 text-red-400 transition text-left">
                <Trash2 className="w-4 h-4" />Remove
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 text-xs text-white/30 truncate">{member.email}</div>
    </motion.div>
  );
}

// ─── Team Chat ─────────────────────────────────────────────────────────────
function TeamChat({ members, currentUser }) {
  const messages = useQuery(api.teamMessages.getTeamMessages, { limit: 100 });
  const sendMessage = useMutation(api.teamMessages.sendTeamMessage);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedSender, setSelectedSender] = useState(null);
  const bottomRef = useRef(null);

  // Reversed from Convex (desc order) → show oldest first
  const sortedMessages = messages ? [...messages].reverse() : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sortedMessages.length]);

  const senderOptions = [
    { id: `user:${currentUser?._id || 'me'}`, name: currentUser?.name || 'You', initials: (currentUser?.name || 'ME').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(), color: '#8B5CF6' },
    ...(members || []).map(m => ({ id: `member:${m._id}`, name: m.name, initials: m.avatarInitials, color: m.avatarColor })),
  ];

  const activeSender = selectedSender ?? senderOptions[0];

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage({
        content: input.trim(),
        senderName: activeSender.name,
        senderInitials: activeSender.initials,
        senderColor: activeSender.color,
        senderId: activeSender.id,
      });
      setInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="glass flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl grid place-items-center" style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)' }}>
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <div className="font-display font-semibold text-sm">Team Chat</div>
          <div className="text-xs text-white/40">{(members?.length || 0) + 1} members • Real-time</div>
        </div>
        <div className="ml-auto flex -space-x-1">
          {senderOptions.slice(0, 4).map(s => (
            <div key={s.id} className="w-6 h-6 rounded-lg border border-bg grid place-items-center text-[9px] font-bold"
              style={{ background: s.color }}>{s.initials}</div>
          ))}
        </div>
      </div>

      {/* Sender selector */}
      <div className="px-5 py-2 border-b border-white/5 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs text-white/30 shrink-0">Sending as:</span>
        {senderOptions.map(s => (
          <button key={s.id} onClick={() => setSelectedSender(s)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs shrink-0 transition border
              ${activeSender.id === s.id ? 'border-white/30 bg-white/10 text-white' : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'}`}>
            <span className="w-4 h-4 rounded grid place-items-center text-[8px] font-bold" style={{ background: s.color }}>{s.initials}</span>
            {s.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {sortedMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-white/30 gap-3">
            <MessageSquare className="w-10 h-10 opacity-30" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        )}
        {sortedMessages.map((msg, i) => {
          const isMe = activeSender.id === msg.senderId;
          return (
            <motion.div key={msg._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className="w-7 h-7 rounded-lg grid place-items-center text-[10px] font-bold shrink-0"
                style={{ background: msg.senderColor }}>{msg.senderInitials}</div>
              <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <span className={`text-xs text-white/30 ${isMe ? 'text-right' : ''}`}>{msg.senderName} · {formatTime(msg.createdAt)}</span>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                  ${isMe ? 'rounded-br-sm text-white' : 'rounded-bl-sm bg-white/[0.06] text-white/90'}`}
                  style={isMe ? { background: `linear-gradient(135deg, ${activeSender.color}CC, ${activeSender.color}88)` } : {}}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/10 flex items-end gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus-within:border-purple-500/50 transition">
          <input className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
            placeholder={`Message as ${activeSender.name.split(' ')[0]}…`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()} />
        </div>
        <button onClick={handleSend} disabled={!input.trim() || sending}
          className="w-10 h-10 rounded-xl grid place-items-center btn-primary p-0 disabled:opacity-40 disabled:cursor-not-allowed">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function TeamHub() {
  const { user } = useAuth();
  const members = useQuery(api.teamMembers.listTeamMembers);
  const removeMember = useMutation(api.teamMembers.removeTeamMember);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('members'); // 'members' | 'chat'
  const [chatTarget, setChatTarget] = useState(null);

  const filtered = (members || []).filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase()) ||
    (m.department || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleRemove = async (id) => {
    if (!confirm('Remove this team member?')) return;
    try { await removeMember({ id }); } catch (e) { alert(e.message); }
  };

  const handleStartChat = (member) => {
    setChatTarget(member);
    setTab('chat');
  };

  const onlineCount = (members || []).filter(m => m.status === 'online').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Team Hub</h1>
          <p className="text-white/40 text-sm">Manage members, communicate, collaborate.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <UserPlus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: (members?.length || 0) + 1, icon: Users, color: '#8B5CF6' },
          { label: 'Online', value: onlineCount, icon: Circle, color: '#10B981' },
          { label: 'Departments', value: new Set((members || []).map(m => m.department).filter(Boolean)).size || 1, icon: Building2, color: '#3B82F6' },
          { label: 'Messages', value: '∞', icon: MessageSquare, color: '#F59E0B' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <div className="font-display font-bold text-xl">{value}</div>
              <div className="text-xs text-white/40">{label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tab nav */}
      <div className="flex gap-2 border-b border-white/10 pb-0">
        {[
          { id: 'members', label: 'Members', icon: Users },
          { id: 'chat', label: 'Team Chat', icon: MessageSquare },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px
              ${tab === t.id ? 'text-white border-purple-500' : 'text-white/40 border-transparent hover:text-white'}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* Tab: Members */}
      {tab === 'members' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-3 glass px-4 py-2.5 max-w-sm">
            <Search className="w-4 h-4 text-white/30 shrink-0" />
            <input className="bg-transparent flex-1 text-sm text-white placeholder:text-white/30 focus:outline-none"
              placeholder="Search members…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* You card */}
          {user && (
            <div className="glass p-4 border border-purple-500/30" style={{ boxShadow: '0 0 20px rgba(139,92,246,0.1)' }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl grid place-items-center text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', boxShadow: '0 0 12px rgba(139,92,246,0.4)' }}>
                  {user.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'ME'}
                </div>
                <div>
                  <div className="font-medium text-sm">{user.name} <span className="text-xs text-purple-400 ml-1">(You)</span></div>
                  <div className="text-xs text-white/40">{user.email}</div>
                </div>
                <div className="ml-auto"><StatusDot status="online" /></div>
              </div>
            </div>
          )}

          {members === undefined && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass p-4 animate-pulse h-28" />
              ))}
            </div>
          )}

          {members !== undefined && filtered.length === 0 && (
            <div className="glass p-12 text-center">
              <Users className="w-12 h-12 mx-auto text-white/20 mb-3" />
              <p className="text-white/40 text-sm">{search ? 'No members match your search.' : 'No team members yet. Add one to get started!'}</p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map(m => (
                <MemberCard key={m._id} member={m} onStartChat={handleStartChat} onRemove={handleRemove} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Tab: Chat */}
      {tab === 'chat' && (
        <TeamChat members={members || []} currentUser={user} chatTarget={chatTarget} />
      )}

      {showAdd && <AddMemberModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
