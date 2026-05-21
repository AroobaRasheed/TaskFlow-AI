import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { User, Mail, Lock, ArrowRight, ChevronDown, Shield, RefreshCw, CheckCircle } from 'lucide-react';
import Particles from '../components/Particles.jsx';
import RobotAvatar from '../components/RobotAvatar.jsx';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';

const roles = ['Product Manager', 'Designer', 'Engineer', 'Marketing', 'Operations', 'Founder / Exec'];

// ─── Step 1: Signup form ──────────────────────────────────────────────────
// ─── Step 2: Verify email OTP ─────────────────────────────────────────────

export default function Signup() {
  const [step, setStep]         = useState('form'); // 'form' | 'verify' | 'done'
  const [role, setRole]         = useState('Product Manager');
  const [roleOpen, setRoleOpen] = useState(false);
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [agreed, setAgreed]     = useState(false);
  const [otp, setOtp]           = useState(['', '', '', '', '', '']); // 6 boxes
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devCode, setDevCode]   = useState(''); // shown when Resend not configured

  const navigate = useNavigate();
  const { login } = useAuth();
  const createUser          = useMutation(api.users.createUser);
  const sendVerification    = useAction(api.email.sendVerificationEmail);
  const verifyToken         = useMutation(api.email.verifyEmailToken);

  // ─── Step 1: Submit signup form ──────────────────────────────────────────
  const handleSignup = async (e) => {
    e?.preventDefault();
    setError('');
    if (!name.trim())             return setError('Please enter your full name.');
    if (!email.trim())            return setError('Please enter your email.');
    if (!/\S+@\S+\.\S+/.test(email)) return setError('Please enter a valid email address.');
    if (password.length < 6)     return setError('Password must be at least 6 characters.');
    if (password !== confirm)     return setError('Passwords do not match.');
    if (!agreed)                  return setError('Please agree to the Terms and Privacy Policy.');

    setLoading(true);
    try {
      // Save user to Convex (unverified)
      await createUser({ name, email, password, role: 'member' }).catch(() => {});

      // Send OTP email
      const result = await sendVerification({ email, name });

      // In dev mode (no Resend key), show the code on screen
      if (result?.devToken) {
        setDevCode(result.devToken);
      }

      setStep('verify');
      startResendCooldown();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Verify OTP ───────────────────────────────────────────────────
  const handleVerify = async (e) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return setError('Please enter all 6 digits.');
    setError('');
    setLoading(true);
    try {
      await verifyToken({ email, token: code });
      login({ name, email, role: 'member', emailVerified: true });
      setStep('done');
      setTimeout(() => navigate('/app'), 2000);
    } catch (err) {
      setError(err.message || 'Invalid code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Resend OTP with 60s cooldown ────────────────────────────────────────
  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(s => {
        if (s <= 1) { clearInterval(interval); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    try {
      const result = await sendVerification({ email, name });
      if (result?.devToken) setDevCode(result.devToken);
      startResendCooldown();
    } catch (err) {
      setError('Could not resend. Please try again.');
    }
  };

  // ─── OTP input handler — auto-advance between boxes ──────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const next = [...otp];
    next[index] = value.slice(-1); // only last char
    setOtp(next);
    // Auto-advance to next box
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = ['', '', '', '', '', ''];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    document.getElementById(`otp-${Math.min(pasted.length, 5)}`)?.focus();
  };

  return (
    <div className="min-h-screen relative grid lg:grid-cols-2 overflow-hidden">
      <Particles count={28}/>

      {/* LEFT ILLUSTRATION */}
      <div className="hidden lg:flex relative items-center justify-center p-12 bg-gradient-to-br from-neon-blue/10 via-transparent to-purple/15 overflow-hidden order-2">
        <div className="absolute inset-0 bg-grid-purple opacity-30" style={{ backgroundSize: '40px 40px' }}/>
        <div className="relative text-center">
          <RobotAvatar size={280} talking={step === 'verify'}/>
          <div className="mt-8 max-w-md">
            <div className="font-display text-2xl font-semibold mb-2">
              {step === 'form'   && "Let's get you set up"}
              {step === 'verify' && 'Check your inbox'}
              {step === 'done'   && 'You\'re all set! 🎉'}
            </div>
            <p className="text-white/50">
              {step === 'form'   && '90 seconds to your first AI-prioritized task board.'}
              {step === 'verify' && `We sent a 6-digit code to ${email}`}
              {step === 'done'   && 'Redirecting you to your dashboard…'}
            </p>
          </div>
          {step === 'form' && (
            <div className="mt-8 space-y-3 max-w-sm mx-auto">
              {['Free 14-day trial — no card needed','SOC 2 Type II, GDPR compliant','Import from Jira, Linear, Notion'].map(t => (
                <div key={t} className="flex items-center gap-3 glass px-4 py-2.5 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-1, #A78BFA)', boxShadow: '0 0 8px var(--accent-1, #A78BFA)' }}/>{t}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="relative flex flex-col p-6 lg:p-12 order-1">
        <Logo />
        <div className="flex-1 grid place-items-center">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: Sign up form ── */}
            {step === 'form' && (
              <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="w-full max-w-md glass-strong p-8">
                <h1 className="font-display text-3xl font-bold mb-2">Create your account</h1>
                <p className="text-white/50 text-sm mb-6">Start free — meet your AI co-pilot in seconds.</p>

                {error && <ErrorBox message={error}/>}

                <form className="space-y-4" onSubmit={handleSignup}>
                  <Field label="Full Name" icon={User}>
                    <input type="text" placeholder="Alex Kim" className="input-glow pl-10"
                      value={name} onChange={e => setName(e.target.value)} autoComplete="name" autoFocus/>
                  </Field>
                  <Field label="Email" icon={Mail}>
                    <input type="email" placeholder="you@team.com" className="input-glow pl-10"
                      value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"/>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Password" icon={Lock}>
                      <input type="password" placeholder="Min. 6 chars" className="input-glow pl-10"
                        value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password"/>
                    </Field>
                    <Field label="Confirm" icon={Lock}>
                      <input type="password" placeholder="Repeat" className="input-glow pl-10"
                        value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password"/>
                    </Field>
                  </div>

                  <div>
                    <span className="text-xs text-white/50 mb-1.5 block">Team Role</span>
                    <div className="relative">
                      <button type="button" onClick={() => setRoleOpen(o => !o)}
                        className="input-glow flex items-center justify-between w-full">
                        {role}<ChevronDown className="w-4 h-4 text-white/40"/>
                      </button>
                      {roleOpen && (
                        <div className="absolute top-full mt-2 w-full glass-strong p-1 z-10">
                          {roles.map(r => (
                            <button key={r} type="button"
                              onClick={() => { setRole(r); setRoleOpen(false); }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/5 ${r === role ? 'text-purple-glow' : ''}`}>
                              {r}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <label className="flex items-start gap-2 text-xs text-white/50 cursor-pointer">
                    <input type="checkbox" className="mt-0.5 accent-purple"
                      checked={agreed} onChange={e => setAgreed(e.target.checked)}/>
                    I agree to the <a href="#" className="text-purple-glow">Terms</a> and{' '}
                    <a href="#" className="text-purple-glow">Privacy Policy</a>.
                  </label>

                  <button type="submit" disabled={loading}
                    className="btn-primary w-full disabled:opacity-60">
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/><span>Sending code…</span></>
                      : <><Mail className="w-4 h-4"/>Continue — verify email</>}
                  </button>
                </form>

                <p className="text-sm text-center text-white/40 mt-6">
                  Already have one? <Link to="/login" className="text-purple-glow hover:text-white">Sign in</Link>
                </p>
              </motion.div>
            )}

            {/* ── STEP 2: OTP verification ── */}
            {step === 'verify' && (
              <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="w-full max-w-md glass-strong p-8">

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl grid place-items-center"
                    style={{ background: 'linear-gradient(135deg, var(--btn-from, #8B5CF6), var(--btn-to, #3B82F6))' }}>
                    <Shield className="w-6 h-6"/>
                  </div>
                  <div>
                    <h1 className="font-display text-2xl font-bold">Verify your email</h1>
                    <p className="text-xs text-white/40">Code sent to {email}</p>
                  </div>
                </div>

                <p className="text-sm text-white/60 mb-6 leading-relaxed">
                  We sent a <strong className="text-white">6-digit verification code</strong> to your inbox.
                  Enter it below to activate your account.
                </p>

                {/* Dev mode hint */}
                {devCode && (
                  <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                    <div className="font-semibold mb-1">🔧 Dev mode — Resend not configured</div>
                    <div>Your code is: <span className="font-mono font-bold text-amber-200 tracking-widest">{devCode}</span></div>
                    <div className="mt-1 text-amber-400/70">Add RESEND_API_KEY to send real emails.</div>
                  </div>
                )}

                {error && <ErrorBox message={error}/>}

                <form onSubmit={handleVerify} className="space-y-6">
                  {/* 6 OTP boxes */}
                  <div>
                    <label className="text-xs text-white/50 mb-3 block">Enter your 6-digit code</label>
                    <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          id={`otp-${i}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          className="w-12 h-14 text-center text-2xl font-bold font-mono rounded-xl border-2 bg-white/[0.04] text-white transition-all focus:outline-none"
                          style={{
                            borderColor: digit ? 'var(--accent-1, #8B5CF6)' : 'rgba(255,255,255,0.15)',
                            boxShadow: digit ? `0 0 16px var(--accent-1, #8B5CF6)33` : 'none',
                          }}
                          autoFocus={i === 0}
                        />
                      ))}
                    </div>
                  </div>

                  <button type="submit" disabled={loading || otp.join('').length < 6}
                    className="btn-primary w-full disabled:opacity-60">
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Verifying…</>
                      : <>Verify & activate account <ArrowRight className="w-4 h-4"/></>}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-white/40">Didn't get the code?</p>
                  <button onClick={handleResend} disabled={resendCooldown > 0}
                    className="mt-2 flex items-center gap-1.5 text-sm mx-auto disabled:opacity-40 transition"
                    style={{ color: resendCooldown > 0 ? undefined : 'var(--accent-1, #A78BFA)' }}>
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}/>
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </div>

                <button onClick={() => { setStep('form'); setError(''); setOtp(['','','','','','']); }}
                  className="mt-4 w-full text-xs text-white/30 hover:text-white/60 transition text-center">
                  ← Use a different email
                </button>
              </motion.div>
            )}

            {/* ── STEP 3: Success ── */}
            {step === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md glass-strong p-8 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                  className="w-20 h-20 rounded-full grid place-items-center mx-auto mb-5"
                  style={{ background: 'linear-gradient(135deg, var(--btn-from, #8B5CF6), var(--btn-to, #3B82F6))', boxShadow: '0 0 40px var(--glow-1, rgba(139,92,246,0.5))' }}>
                  <CheckCircle className="w-10 h-10"/>
                </motion.div>
                <h1 className="font-display text-3xl font-bold mb-2">Email verified! 🎉</h1>
                <p className="text-white/50 mb-6">Your account is active. Taking you to your dashboard…</p>
                <div className="flex items-center justify-center gap-2 text-sm text-white/40">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"/>
                  Redirecting…
                </div>
              </motion.div>
            )}

          </AnimatePresence>
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

function ErrorBox({ message }) {
  return (
    <div className="mb-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-2">
      {message}
    </div>
  );
}
