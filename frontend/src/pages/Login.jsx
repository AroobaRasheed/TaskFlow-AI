import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, ArrowRight, Github } from 'lucide-react';
import Particles from '../components/Particles.jsx';
import RobotAvatar from '../components/RobotAvatar.jsx';
import Logo from '../components/Logo.jsx';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';

export default function Login() {
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      return setError('Please fill in both fields.');
    }
    setLoading(true);
    try {
      const data = await api.login({ email: email.trim(), password });
      login(data);
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative grid lg:grid-cols-2 overflow-hidden">
      <Particles count={28}/>
      <div className="relative flex flex-col p-6 lg:p-12">
        <Logo />
        <div className="flex-1 grid place-items-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="w-full max-w-md glass-strong p-8 relative">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-purple/30 via-transparent to-neon-blue/30 -z-10 blur-lg"/>
            <h1 className="font-display text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-white/50 text-sm mb-7">Sign in to continue building with your AI co-pilot.</p>

            {error && (
              <div className="mb-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-2">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Field label="Email" icon={Mail}>
                <input type="email" placeholder="you@team.com" className="input-glow pl-10"
                  value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"/>
              </Field>
              <Field label="Password" icon={Lock}>
                <input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  className="input-glow pl-10 pr-10"
                  value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password"/>
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  <Eye className="w-4 h-4"/>
                </button>
              </Field>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-white/60 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded bg-white/5 border-white/20 accent-purple"/>
                  Remember me
                </label>
                <a href="#" className="text-purple-glow hover:text-white">Forgot password?</a>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-2 disabled:opacity-60">
                {loading ? 'Signing in…' : 'Sign in'} <ArrowRight className="w-4 h-4"/>
              </button>
            </form>

            <div className="flex items-center gap-3 my-6 text-xs text-white/30">
              <div className="flex-1 h-px bg-white/10"/> or continue with <div className="flex-1 h-px bg-white/10"/>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Google', icon: GoogleIcon },
                { label: 'GitHub', icon: Github },
                { label: 'SSO', icon: SSOIcon },
              ].map(s => (
                <button key={s.label} className="btn-ghost py-2.5 text-sm gap-2">
                  <s.icon className="w-4 h-4"/>{s.label}
                </button>
              ))}
            </div>

            <p className="text-sm text-center text-white/40 mt-6">
              New to TaskFlow? <Link to="/signup" className="text-purple-glow hover:text-white">Create an account</Link>
            </p>
          </motion.div>
        </div>
      </div>

      <div className="hidden lg:flex relative items-center justify-center p-12 bg-gradient-to-br from-purple/10 via-transparent to-neon-blue/10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-purple opacity-30" style={{ backgroundSize: '40px 40px' }}/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-glow-radial"/>
        <div className="relative text-center">
          <RobotAvatar size={300} talking/>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="mt-8 max-w-md mx-auto">
            <div className="font-display text-2xl font-semibold mb-2">Your AI co-pilot is online</div>
            <p className="text-white/50">Welcome back — I prepped your morning brief and flagged 2 priority items.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="block">
      <span className="text-xs text-white/50 mb-1.5 block">{label}</span>
      <div className="relative">
        <Icon className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2"/>
        {children}
      </div>
    </label>
  );
}

function GoogleIcon(props) { return (<svg viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M21.35 11.1H12v3.2h5.35c-.23 1.5-1.69 4.4-5.35 4.4-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.57-2.48C16.7 4.3 14.6 3.4 12 3.4 6.97 3.4 3 7.36 3 12.75s3.97 9.35 9 9.35c5.2 0 8.66-3.65 8.66-8.78 0-.59-.06-1.04-.16-1.42z"/></svg>); }
function SSOIcon(props) { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z"/></svg>); }
