import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Calendar, Users, Flag, Zap, Clock, AlertTriangle, ListChecks, Lightbulb, Sparkles } from 'lucide-react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import RobotAvatar from '../components/RobotAvatar.jsx';

const MOCK_RESULT = {
  priority: 'high',
  estimatedHours: 144,
  riskLevel: 'medium',
  workflowSuggestions: [
    'Audit current auth surface (mobile + web SDKs)',
    'Spec WebAuthn ceremony flows and fallback UX',
    'Backend: passkey registration + verification endpoints',
    'Client: integrate WebAuthn APIs across platforms',
    'Migration plan + opt-in beta, then forced rollout',
    'Telemetry, error budgets, deprecate password flow',
  ],
  productivityAdvice: 'Pair back-end and mobile engineers for the first ceremony spike to reduce coordination overhead.',
};

export default function AITaskAnalyzer() {
  const [phase, setPhase] = useState('idle'); // idle | scanning | done
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: 'Migrate auth to passkeys',
    description: 'Replace password-based auth with WebAuthn passkeys across mobile and web. Include fallback flows.',
    deadline: '2026-06-15',
    teamSize: 4,
    priority: 'High',
  });

  const analyzeTask = useAction(api.ai.analyzeTask);

  const analyze = async () => {
    if (!form.title.trim()) return setError('Please enter a task title.');
    setPhase('scanning');
    setError('');
    setResult(null);

    try {
      const analysis = await analyzeTask({
        title: form.title,
        description: form.description,
        deadline: form.deadline ? new Date(form.deadline).getTime() : undefined,
        teamSize: form.teamSize,
      });
      setResult(analysis);
      setPhase('done');
    } catch (err) {
      // Fallback to mock if Gemini not configured
      console.warn('AI not configured, using mock:', err.message);
      await new Promise(r => setTimeout(r, 2000));
      setResult(MOCK_RESULT);
      setPhase('done');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">AI Task Analyzer</h1>
          <p className="text-white/50 text-sm">Drop in a task — get priority, risk, and a clean execution plan.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>Gemini AI · TaskFlow v3
        </div>
      </div>

      {error && (
        <div className="glass border border-rose-500/40 text-rose-300 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 glass p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple to-neon-blue grid place-items-center glow-purple">
              <BrainCircuit className="w-5 h-5"/>
            </div>
            <div>
              <div className="font-display font-semibold">Task Input</div>
              <div className="text-xs text-white/40">All fields help the model reason</div>
            </div>
          </div>

          <div className="space-y-4">
            <Field label="Task Title">
              <input className="input-glow" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}/>
            </Field>
            <Field label="Description">
              <textarea rows={4} className="input-glow resize-none" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}/>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Deadline" icon={Calendar}>
                <input type="date" className="input-glow pl-10" value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}/>
              </Field>
              <Field label="Team Size" icon={Users}>
                <input type="number" min={1} max={50} className="input-glow pl-10" value={form.teamSize}
                  onChange={e => setForm({ ...form, teamSize: +e.target.value })}/>
              </Field>
            </div>
            <Field label="Priority" icon={Flag}>
              <div className="flex gap-2 pl-10">
                {['Low', 'Medium', 'High'].map(p => (
                  <button key={p} type="button" onClick={() => setForm({ ...form, priority: p })}
                    className={`flex-1 py-2 rounded-xl text-sm border transition
                      ${form.priority === p
                        ? 'bg-purple/20 border-purple/50 text-white shadow-[0_0_18px_rgba(139,92,246,0.3)]'
                        : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </Field>

            <button onClick={analyze} disabled={phase === 'scanning'} className="btn-primary w-full mt-2 disabled:opacity-60">
              <Sparkles className="w-4 h-4"/>
              {phase === 'scanning' ? 'Analyzing…' : 'Run AI Analysis'}
            </button>
          </div>
        </div>

        {/* Result panel */}
        <div className="lg:col-span-3 glass p-6 relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {phase === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 grid place-items-center text-center p-8">
                <div>
                  <RobotAvatar size={180}/>
                  <p className="text-white/50 mt-4">Submit the task and Gemini AI will think it through.</p>
                  <p className="text-white/30 text-xs mt-2">Works with mock data if Gemini key not set.</p>
                </div>
              </motion.div>
            )}

            {phase === 'scanning' && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="relative w-40 h-40 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-2 border-purple/30"/>
                    <motion.div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-glow"
                      animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}/>
                    <motion.div className="absolute inset-3 rounded-full border-2 border-transparent border-t-neon-blue"
                      animate={{ rotate: -360 }} transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}/>
                    <div className="absolute inset-0 grid place-items-center">
                      <RobotAvatar size={90} glow={false} talking/>
                    </div>
                  </div>
                  <div className="font-display text-lg">Scanning task graph…</div>
                  <div className="text-sm text-white/40 mt-1">Evaluating dependencies, risk, and owner fit.</div>
                  <div className="mt-6 max-w-md mx-auto space-y-2 text-left">
                    {['Parsing requirements','Cross-referencing similar tasks','Estimating effort & time','Scoring risk vectors'].map((s, i) => (
                      <motion.div key={s} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.4 }}
                        className="flex items-center gap-2 text-sm text-white/70">
                        <motion.span className="w-1.5 h-1.5 rounded-full bg-purple-glow shrink-0"
                          animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}/>
                        {s}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'done' && result && (
              <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  <ScoreCard icon={Flag} label="AI Priority"
                    value={(result.priority?.charAt(0).toUpperCase() + result.priority?.slice(1)) || '—'}
                    sub="" tone="purple"/>
                  <ScoreCard icon={Clock} label="Est. Time"
                    value={result.estimatedHours >= 8 ? `${Math.round(result.estimatedHours / 8)}d` : `${result.estimatedHours}h`}
                    sub="estimated" tone="blue"/>
                  <ScoreCard icon={AlertTriangle} label="Risk Level"
                    value={(result.riskLevel?.charAt(0).toUpperCase() + result.riskLevel?.slice(1)) || '—'}
                    sub="" tone="amber"/>
                </div>

                <Block icon={ListChecks} title="Suggested Workflow Steps">
                  <ol className="space-y-2 text-sm">
                    {result.workflowSuggestions?.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/[0.03]">
                        <span className="w-6 h-6 rounded-md bg-purple/20 text-purple-glow grid place-items-center text-xs font-semibold shrink-0">{i + 1}</span>
                        <span className="text-white/80">{s}</span>
                      </li>
                    ))}
                  </ol>
                </Block>

                <Block icon={Lightbulb} title="Productivity Advice">
                  <p className="flex gap-2 text-sm text-white/70">
                    <Zap className="w-4 h-4 text-purple-glow mt-0.5 shrink-0"/>
                    {result.productivityAdvice}
                  </p>
                </Block>

                <button onClick={() => setPhase('idle')} className="btn-ghost text-sm py-2 w-full">
                  ← Analyze another task
                </button>
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
        {Icon && <Icon className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2"/>}
        {children}
      </div>
    </label>
  );
}

function ScoreCard({ icon: Icon, label, value, sub, tone }) {
  const tones = {
    purple: 'from-purple/30 to-purple/0',
    blue: 'from-neon-blue/30 to-neon-blue/0',
    amber: 'from-amber-500/30 to-amber-500/0',
  };
  return (
    <div className="relative glass p-4 overflow-hidden">
      <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${tones[tone]} blur-2xl opacity-70`}/>
      <div className="relative flex items-center gap-2 mb-2 text-white/50 text-xs"><Icon className="w-3.5 h-3.5"/>{label}</div>
      <div className="relative flex items-baseline gap-1">
        <div className="font-display text-2xl font-bold">{value}</div>
        {sub && <div className="text-xs text-white/40">{sub}</div>}
      </div>
    </div>
  );
}

function Block({ icon: Icon, title, children }) {
  return (
    <div className="glass p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-purple-glow"/><div className="font-display font-semibold">{title}</div>
      </div>
      {children}
    </div>
  );
}
