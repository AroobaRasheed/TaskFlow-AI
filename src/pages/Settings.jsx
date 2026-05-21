import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Palette, Users, ShieldCheck, CreditCard, Camera, Save, Loader2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme, THEMES } from '../context/ThemeContext.jsx';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const tabs = [
  { key: 'profile',       label: 'Profile',       icon: User },
  { key: 'appearance',    label: 'Appearance',     icon: Palette },
  { key: 'notifications', label: 'Notifications',  icon: Bell },
  { key: 'team',          label: 'Team',           icon: Users },
  { key: 'security',      label: 'Security',       icon: ShieldCheck },
  { key: 'billing',       label: 'Billing',        icon: CreditCard },
];

export default function Settings() {
  const [tab, setTab] = useState('profile');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="text-white/50 text-sm">Tune TaskFlow to how your team actually works.</p>
      </div>

      <div className="grid lg:grid-cols-[220px,1fr] gap-6">
        <nav className="glass p-2 h-fit">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition
                ${tab === t.key
                  ? 'text-white border border-white/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'}`}
              style={tab === t.key ? {
                background: `linear-gradient(to right, var(--accent-1, #8B5CF6)33, var(--accent-2, #3B82F6)1A)`,
                borderColor: `var(--accent-1, #8B5CF6)4D`
              } : {}}>
              <t.icon className="w-4 h-4"/>{t.label}
            </button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} className="space-y-5">
            {tab === 'profile'       && <ProfilePane/>}
            {tab === 'appearance'    && <AppearancePane/>}
            {tab === 'notifications' && <NotificationsPane/>}
            {tab === 'team'          && <TeamPane/>}
            {tab === 'security'      && <SecurityPane/>}
            {tab === 'billing'       && <BillingPane/>}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Reusable sub-components ──────────────────────────────────────────────

function Card({ title, sub, children }) {
  return (
    <div className="glass p-6">
      <div className="font-display font-semibold text-lg">{title}</div>
      {sub && <div className="text-xs text-white/40 mt-0.5 mb-4">{sub}</div>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Row({ label, hint, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-white/5 last:border-0">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-white/40 mt-0.5">{hint}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange, defaultOn = false }) {
  const [on, setOn] = useState(value ?? defaultOn);
  const toggle = () => {
    const next = !on;
    setOn(next);
    onChange?.(next);
  };
  return (
    <button onClick={toggle} aria-label="toggle"
      className="w-11 h-6 rounded-full p-0.5 transition-all duration-300 focus:outline-none"
      style={{ background: on ? `linear-gradient(to right, var(--btn-from, #8B5CF6), var(--btn-to, #3B82F6))` : 'rgba(255,255,255,0.1)' }}>
      <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${on ? 'translate-x-5' : ''}`}/>
    </button>
  );
}

function Labeled({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs text-white/50 mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────

function ProfilePane() {
  const { user, updateUser } = useAuth();
  const updateProfile = useMutation(api.users.updateProfile);
  const [name, setName]       = useState(user?.name || '');
  const [timezone, setTimezone] = useState('UTC+5 · Pakistan');
  const [saving, setSaving]   = useState(false);
  const [status, setStatus]   = useState(''); // '' | 'saved' | 'error'
  const [errMsg, setErrMsg]   = useState('');

  const handleSave = async () => {
    if (!name.trim()) { setErrMsg('Name cannot be empty.'); setStatus('error'); return; }
    setSaving(true);
    setStatus('');
    try {
      updateUser({ name: name.trim() });
      await updateProfile({ name: name.trim() }).catch(() => {});
      setStatus('saved');
      setTimeout(() => setStatus(''), 2500);
    } catch (err) {
      setErrMsg(err.message || 'Save failed.');
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setStatus('');
    setErrMsg('');
  };

  return (
    <Card title="Profile">
      {/* Avatar */}
      <div className="flex items-center gap-5 mb-6 pb-6 border-b border-white/5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl grid place-items-center text-2xl font-display font-bold"
            style={{ background: `linear-gradient(135deg, var(--btn-from, #8B5CF6), var(--btn-to, #3B82F6))`, boxShadow: `0 0 40px var(--glow-1, rgba(139,92,246,0.35))` }}>
            {name ? name.substring(0, 2).toUpperCase() : 'U'}
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-bg border border-white/10 grid place-items-center hover:border-white/30 transition"
            title="Upload photo (UI demo)">
            <Camera className="w-3.5 h-3.5"/>
          </button>
        </div>
        <div>
          <div className="text-lg font-semibold">{user?.name || 'Guest'}</div>
          <div className="text-sm text-white/50 capitalize">{user?.role || 'member'} · {user?.email || 'No email'}</div>
          <button className="mt-2 btn-ghost text-xs py-1.5 px-3">Upload new photo</button>
        </div>
      </div>

      {/* Status messages */}
      {status === 'error' && (
        <div className="mb-4 flex items-center gap-2 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-2">
          <X className="w-4 h-4 shrink-0"/>{errMsg}
        </div>
      )}
      {status === 'saved' && (
        <div className="mb-4 flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2">
          <Check className="w-4 h-4 shrink-0"/>Profile saved successfully!
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Labeled label="Full name">
          <input className="input-glow" value={name} onChange={e => setName(e.target.value)}/>
        </Labeled>
        <Labeled label="Email">
          <input className="input-glow opacity-60 cursor-not-allowed" value={user?.email || 'No email set'} disabled/>
        </Labeled>
        <Labeled label="Role">
          <input className="input-glow opacity-60 cursor-not-allowed" value={user?.role || 'member'} disabled/>
        </Labeled>
        <Labeled label="Timezone">
          <select className="input-glow" value={timezone} onChange={e => setTimezone(e.target.value)}>
            {['UTC+5 · Pakistan','UTC+0 · London','UTC-5 · New York','UTC-8 · Los Angeles','UTC+1 · Paris','UTC+8 · Singapore'].map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </Labeled>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button className="btn-ghost text-sm py-2 px-4" onClick={handleCancel}>Cancel</button>
        <button onClick={handleSave} disabled={saving}
          className="btn-primary text-sm py-2 px-4 disabled:opacity-60">
          {saving
            ? <><Loader2 className="w-4 h-4 animate-spin"/>Saving…</>
            : <><Save className="w-4 h-4"/>Save changes</>}
        </button>
      </div>
    </Card>
  );
}

// ─── Appearance ───────────────────────────────────────────────────────────

function AppearancePane() {
  const { theme, changeTheme, reducedMotion, setReducedMotion, compactMode, setCompactMode } = useTheme();

  const themes = [
    { name: 'Midnight', bg: '#0B0B12', colors: ['#8B5CF6', '#3B82F6'], desc: 'Classic purple & blue' },
    { name: 'Aurora',   bg: '#0F1419', colors: ['#34D399', '#22D3EE'], desc: 'Green & cyan' },
    { name: 'Sunset',   bg: '#1A0F1F', colors: ['#F472B6', '#FBBF24'], desc: 'Pink & gold' },
  ];

  const handleTheme = (name) => {
    changeTheme(name);
  };

  const handleReducedMotion = (val) => {
    setReducedMotion(val);
    document.documentElement.classList.toggle('reduced-motion', val);
  };

  const handleCompact = (val) => {
    setCompactMode(val);
    document.documentElement.classList.toggle('compact', val);
  };

  return (
    <Card title="Appearance" sub="Changes apply instantly to the whole app">
      <div className="mb-6">
        <div className="text-sm font-medium mb-3">Color Theme</div>
        <div className="grid sm:grid-cols-3 gap-3">
          {themes.map(t => (
            <button key={t.name} onClick={() => handleTheme(t.name)}
              className={`relative p-4 rounded-2xl border-2 transition-all duration-300 text-left group`}
              style={{
                background: t.bg,
                borderColor: theme === t.name ? t.colors[0] : 'rgba(255,255,255,0.1)',
                boxShadow: theme === t.name ? `0 0 24px ${t.colors[0]}55` : 'none',
              }}>
              {/* Color dots */}
              <div className="flex gap-2 mb-3">
                {t.colors.map(c => (
                  <div key={c} className="w-7 h-7 rounded-full transition-transform group-hover:scale-110"
                    style={{ background: c, boxShadow: `0 0 12px ${c}99` }}/>
                ))}
              </div>
              <div className="font-semibold text-sm">{t.name}</div>
              <div className="text-xs text-white/50 mt-0.5">{t.desc}</div>
              {/* Active checkmark */}
              {theme === t.name && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full grid place-items-center"
                  style={{ background: t.colors[0] }}>
                  <Check className="w-3 h-3 text-white"/>
                </div>
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-white/30 mt-3">Theme is saved and applied across all pages instantly.</p>
      </div>

      <div className="border-t border-white/5 pt-4">
        <div className="text-sm font-medium mb-3">Display Options</div>
        <Row label="Reduced motion" hint="Minimize all animations and transitions">
          <Toggle defaultOn={reducedMotion} onChange={handleReducedMotion}/>
        </Row>
        <Row label="Compact density" hint="Tighter spacing in panels and lists">
          <Toggle defaultOn={compactMode} onChange={handleCompact}/>
        </Row>
        <Row label="Glass panels" hint="Translucent blurred surfaces (always on)">
          <Toggle defaultOn={true}/>
        </Row>
      </div>
    </Card>
  );
}

// ─── Notifications ────────────────────────────────────────────────────────

function NotificationsPane() {
  const [prefs, setPrefs] = useState({
    aiAlerts: true, mentions: true, digest: true, sprint: false, slack: false
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key) => (val) => setPrefs(p => ({ ...p, [key]: val }));

  const handleSave = () => {
    // In a real app this would persist to DB
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card title="Notifications" sub="What gets to you, and how">
      <Row label="AI risk alerts" hint="When the AI detects elevated risk on a task">
        <Toggle defaultOn={prefs.aiAlerts} onChange={toggle('aiAlerts')}/>
      </Row>
      <Row label="Task mentions" hint="When you're @mentioned in a task or comment">
        <Toggle defaultOn={prefs.mentions} onChange={toggle('mentions')}/>
      </Row>
      <Row label="Daily digest" hint="Morning brief of your top priorities">
        <Toggle defaultOn={prefs.digest} onChange={toggle('digest')}/>
      </Row>
      <Row label="Sprint summaries" hint="End-of-sprint auto-generated retro summary">
        <Toggle defaultOn={prefs.sprint} onChange={toggle('sprint')}/>
      </Row>
      <Row label="Slack mirror" hint="Cross-post critical alerts to #ops channel">
        <Toggle defaultOn={prefs.slack} onChange={toggle('slack')}/>
      </Row>

      <div className="mt-5 flex items-center justify-between">
        {saved && <span className="text-sm text-emerald-400 flex items-center gap-1"><Check className="w-4 h-4"/>Preferences saved!</span>}
        <div className="ml-auto">
          <button onClick={handleSave} className="btn-primary text-sm py-2 px-4">
            <Save className="w-4 h-4"/>Save preferences
          </button>
        </div>
      </div>
    </Card>
  );
}

// ─── Team ─────────────────────────────────────────────────────────────────

function TeamPane() {
  const [members, setMembers] = useState([
    { name: 'Mira Chen',    role: 'Design Lead',   email: 'mira@taskflow.ai',   plan: 'Admin'  },
    { name: 'Jordan Reyes', role: 'Sr. Engineer',  email: 'jordan@taskflow.ai', plan: 'Member' },
    { name: 'Sam Patel',    role: 'ML Researcher', email: 'sam@taskflow.ai',    plan: 'Member' },
  ]);
  const [showInvite, setShowInvite]   = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole]   = useState('Member');
  const [inviteSent, setInviteSent]   = useState(false);

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setMembers(m => [...m, { name: inviteEmail.split('@')[0], role: inviteRole, email: inviteEmail, plan: inviteRole }]);
    setInviteEmail('');
    setInviteSent(true);
    setTimeout(() => { setInviteSent(false); setShowInvite(false); }, 2000);
  };

  const handleRemove = (email) => {
    if (!confirm(`Remove ${email} from the team?`)) return;
    setMembers(m => m.filter(x => x.email !== email));
  };

  return (
    <Card title="Team" sub="Manage your workspace members">
      <div className="space-y-2 mb-4">
        {members.map(m => (
          <div key={m.email} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="w-9 h-9 rounded-lg grid place-items-center text-xs font-semibold shrink-0"
              style={{ background: `linear-gradient(135deg, var(--btn-from, #8B5CF6), var(--btn-to, #3B82F6))` }}>
              {m.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{m.name}</div>
              <div className="text-xs text-white/40 truncate">{m.role} · {m.email}</div>
            </div>
            <span className="text-xs bg-white/5 text-white/60 px-2 py-1 rounded-full">{m.plan}</span>
            <button onClick={() => handleRemove(m.email)}
              className="text-xs text-white/30 hover:text-rose-400 transition ml-1" title="Remove">
              <X className="w-3.5 h-3.5"/>
            </button>
          </div>
        ))}
      </div>

      {/* Invite form */}
      <AnimatePresence>
        {showInvite && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} onSubmit={handleInvite}
            className="mb-4 p-4 glass rounded-xl space-y-3 overflow-hidden">
            <div className="text-sm font-medium">Invite team member</div>
            <div className="grid grid-cols-2 gap-3">
              <input className="input-glow py-2 text-sm" type="email" placeholder="email@team.com"
                value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} autoFocus required/>
              <select className="input-glow py-2 text-sm" value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                <option>Admin</option>
                <option>Member</option>
                <option>Viewer</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-ghost text-xs py-1.5 px-3" onClick={() => setShowInvite(false)}>Cancel</button>
              <button type="submit" className="btn-primary text-xs py-1.5 px-3">
                {inviteSent ? <><Check className="w-3.5 h-3.5"/>Sent!</> : 'Send invite'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <button className="btn-primary text-sm py-2 px-4" onClick={() => setShowInvite(s => !s)}>
        {showInvite ? 'Cancel' : '+ Invite member'}
      </button>
    </Card>
  );
}

// ─── Security ─────────────────────────────────────────────────────────────

function SecurityPane() {
  const [twoFactor, setTwoFactor]         = useState(true);
  const [showSessions, setShowSessions]   = useState(false);
  const [showPwForm, setShowPwForm]       = useState(false);
  const [currentPw, setCurrentPw]         = useState('');
  const [newPw, setNewPw]                 = useState('');
  const [confirmPw, setConfirmPw]         = useState('');
  const [pwStatus, setPwStatus]           = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const sessions = [
    { device: 'Chrome · Windows 11',   location: 'Lahore, PK',   time: 'Now (current)',    current: true  },
    { device: 'Safari · iPhone 15',    location: 'Lahore, PK',   time: '2 hours ago',      current: false },
    { device: 'Firefox · MacBook Pro', location: 'Karachi, PK',  time: 'Yesterday 10:32',  current: false },
  ];

  const handlePwChange = (e) => {
    e.preventDefault();
    if (!currentPw) return setPwStatus('Enter your current password.');
    if (newPw.length < 6) return setPwStatus('New password must be at least 6 characters.');
    if (newPw !== confirmPw) return setPwStatus('Passwords do not match.');
    setPwStatus('success');
    setTimeout(() => { setPwStatus(''); setShowPwForm(false); setCurrentPw(''); setNewPw(''); setConfirmPw(''); }, 2000);
  };

  return (
    <Card title="Security" sub="Account protection and access">
      <Row label="Two-factor authentication" hint="Extra layer via authenticator app">
        <Toggle defaultOn={twoFactor} onChange={setTwoFactor}/>
      </Row>

      <Row label="Active sessions" hint={`${sessions.length} devices signed in`}>
        <button className="btn-ghost text-xs py-1.5 px-3" onClick={() => setShowSessions(s => !s)}>
          {showSessions ? 'Hide' : 'View'}
        </button>
      </Row>

      <AnimatePresence>
        {showSessions && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mb-3 space-y-2 pt-2">
              {sessions.map((s, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${s.current ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-white/[0.02]'}`}>
                  <div className={`w-2 h-2 rounded-full ${s.current ? 'bg-emerald-400' : 'bg-white/20'}`}/>
                  <div className="flex-1">
                    <div className="text-sm">{s.device}</div>
                    <div className="text-xs text-white/40">{s.location} · {s.time}</div>
                  </div>
                  {!s.current && <button className="text-xs text-rose-400 hover:text-rose-300">Revoke</button>}
                  {s.current && <span className="text-xs text-emerald-400">Current</span>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Row label="Change password" hint="Update your account password">
        <button className="btn-ghost text-xs py-1.5 px-3" onClick={() => setShowPwForm(s => !s)}>
          {showPwForm ? 'Cancel' : 'Update'}
        </button>
      </Row>

      <AnimatePresence>
        {showPwForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} onSubmit={handlePwChange}
            className="overflow-hidden space-y-3 pt-2 mb-2">
            {pwStatus && pwStatus !== 'success' && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{pwStatus}</div>
            )}
            {pwStatus === 'success' && (
              <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2 flex items-center gap-1">
                <Check className="w-3.5 h-3.5"/>Password updated successfully!
              </div>
            )}
            <input type="password" className="input-glow py-2 text-sm" placeholder="Current password"
              value={currentPw} onChange={e => setCurrentPw(e.target.value)}/>
            <div className="grid grid-cols-2 gap-2">
              <input type="password" className="input-glow py-2 text-sm" placeholder="New password"
                value={newPw} onChange={e => setNewPw(e.target.value)}/>
              <input type="password" className="input-glow py-2 text-sm" placeholder="Confirm"
                value={confirmPw} onChange={e => setConfirmPw(e.target.value)}/>
            </div>
            <button type="submit" className="btn-primary text-xs py-1.5 px-4">Update password</button>
          </motion.form>
        )}
      </AnimatePresence>

      <Row label="Delete account" hint="Permanently remove your account and data">
        <button className="text-xs text-rose-400 hover:text-rose-300 border border-rose-400/30 hover:border-rose-400/60 px-3 py-1.5 rounded-lg transition"
          onClick={() => { if (confirm('Are you sure? This cannot be undone.')) { logout(); } }}>
          Delete account
        </button>
      </Row>
    </Card>
  );
}

// ─── Billing ──────────────────────────────────────────────────────────────

function BillingPane() {
  const [showUpgrade, setShowUpgrade] = useState(false);

  const plans = [
    { name: 'Pro',        price: '$29/seat/mo',  features: ['Unlimited AI analysis','5 workspaces','Priority support'],             current: true  },
    { name: 'Enterprise', price: '$79/seat/mo',  features: ['SSO + SAML','Audit logs','Dedicated CSM','Custom AI models'],          current: false },
  ];

  return (
    <Card title="Billing" sub="Manage your subscription and payment">
      <Row label="Current plan" hint="Pro · billed monthly">
        <span className="text-xs font-medium px-3 py-1 rounded-full border"
          style={{ color: 'var(--accent-1, #8B5CF6)', borderColor: 'var(--accent-1, #8B5CF6)4D', background: 'var(--accent-1, #8B5CF6)1A' }}>
          Pro Plan
        </span>
      </Row>
      <Row label="Next invoice" hint="June 30, 2026">
        <span className="text-sm font-semibold">$348.00</span>
      </Row>
      <Row label="Payment method" hint="Visa ending in 4242 · exp 09/27">
        <button className="btn-ghost text-xs py-1.5 px-3">Update card</button>
      </Row>
      <Row label="Billing email" hint="invoices@yourteam.com">
        <button className="btn-ghost text-xs py-1.5 px-3">Change</button>
      </Row>
      <Row label="Download invoices" hint="Last 12 months">
        <button className="btn-ghost text-xs py-1.5 px-3">Download</button>
      </Row>

      <div className="mt-4 pt-4 border-t border-white/5">
        <button onClick={() => setShowUpgrade(s => !s)} className="btn-primary text-sm py-2 px-4">
          {showUpgrade ? 'Hide plans' : '⬆ Upgrade plan'}
        </button>
      </div>

      <AnimatePresence>
        {showUpgrade && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-4 grid sm:grid-cols-2 gap-3">
            {plans.map(p => (
              <div key={p.name} className={`p-4 rounded-2xl border-2 transition-all ${p.current ? 'border-white/20 opacity-60' : 'border-white/10 hover:border-white/20 cursor-pointer'}`}>
                <div className="font-display font-semibold">{p.name}</div>
                <div className="text-sm font-bold mt-1 mb-3" style={{ color: 'var(--accent-1, #8B5CF6)' }}>{p.price}</div>
                <ul className="space-y-1.5">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-white/70">
                      <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-1, #8B5CF6)' }}/>{f}
                    </li>
                  ))}
                </ul>
                <button className={`mt-4 w-full text-xs py-2 rounded-xl transition ${p.current ? 'bg-white/5 text-white/40 cursor-not-allowed' : 'btn-primary py-2'}`}
                  disabled={p.current}>
                  {p.current ? 'Current plan' : `Upgrade to ${p.name}`}
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
