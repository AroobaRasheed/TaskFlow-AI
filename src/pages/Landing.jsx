import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, BrainCircuit, BarChart3, MessageSquare, CheckCircle, Star, Play, Shield, Zap, Users } from 'lucide-react';
import Particles from '../components/Particles.jsx';
import RobotAvatar from '../components/RobotAvatar.jsx';
import Logo from '../components/Logo.jsx';

const features = [
  { icon: BrainCircuit, title: 'AI Task Analysis', desc: 'Gemini AI scores every task by priority, risk, and time — automatically.' },
  { icon: MessageSquare, title: 'AI Chat Assistant', desc: 'Ask your co-pilot anything about your project. Get instant, actionable advice.' },
  { icon: BarChart3,    title: 'Live Analytics',   desc: 'Real-time dashboards track team velocity, overdue tasks, and sprint health.' },
  { icon: CheckCircle,  title: 'Smart Task Board', desc: 'Kanban board with AI-assisted prioritization and one-click status updates.' },
];

const testimonials = [
  { name: 'Mira Chen',    role: 'Design Lead at Framer', quote: 'TaskFlow AI cut our sprint planning from 2 hours to 20 minutes.' },
  { name: 'Jordan Reyes', role: 'Sr. Engineer at Stripe', quote: 'The AI risk scoring caught a 3-week delay before we even started the sprint.' },
  { name: 'Sam Patel',    role: 'PM at Anthropic',        quote: 'Finally a PM tool that actually understands what "blocked" means.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <Particles count={30}/>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 border-b border-white/5 bg-bg/40 backdrop-blur-xl">
        <Logo/>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          {['Features', 'Pricing', 'Docs', 'Blog'].map(l => (
            <a key={l} href="#" className="hover:text-white transition">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login"  className="btn-ghost text-sm py-2 px-4">Sign in</Link>
          <Link to="/signup" className="btn-primary text-sm py-2 px-4">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-20 pb-16 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs mb-8"
            style={{ color: 'var(--accent-1, #A78BFA)' }}>
            <Sparkles className="w-3.5 h-3.5"/>Powered by Gemini AI · Built on Convex
          </div>
          <h1 className="heading-hero text-5xl lg:text-7xl mb-6 leading-tight">
            Project management<br/>that thinks for you
          </h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            TaskFlow AI combines real-time collaboration with Gemini-powered insights — so your team spends less time managing and more time building.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/signup" className="btn-primary text-base py-3 px-8">
              Start free — no card needed <ArrowRight className="w-5 h-5"/>
            </Link>
            <Link to="/login" className="btn-ghost text-base py-3 px-8">
              <Play className="w-4 h-4"/>Watch demo
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-white/30">
            {['Free 14-day trial', 'No credit card', 'Cancel anytime'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400"/>{t}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-16 relative">
          <div className="absolute inset-0 rounded-3xl blur-3xl opacity-20"
            style={{ background: `linear-gradient(135deg, var(--accent-1, #8B5CF6), var(--accent-2, #3B82F6))` }}/>
          <div className="relative glass p-1 rounded-3xl border border-white/10">
            <div className="glass rounded-2xl p-8 flex items-center justify-center min-h-[200px]">
              <div className="flex items-center gap-8 flex-wrap justify-center">
                <RobotAvatar size={120} talking/>
                <div className="space-y-3 text-left max-w-xs">
                  {[
                    { label: 'Sprint velocity', val: '↑ 23%', ok: true  },
                    { label: 'Overdue tasks',   val: '↓ 8',   ok: true  },
                    { label: 'AI suggestions',  val: '12 new', ok: false },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between gap-8 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                      <span className="text-sm text-white/70">{item.label}</span>
                      <span className="text-sm font-semibold" style={{ color: item.ok ? '#34D399' : 'var(--accent-1, #A78BFA)' }}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 lg:px-12 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-sm mb-3" style={{ color: 'var(--accent-1, #A78BFA)' }}>Everything you need</div>
          <h2 className="font-display text-4xl font-bold">Built for teams that ship fast</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass p-6 hover:border-white/20 transition-all group">
              <div className="w-10 h-10 rounded-xl grid place-items-center mb-4"
                style={{ background: `var(--accent-1, #8B5CF6)33` }}>
                <f.icon className="w-5 h-5" style={{ color: 'var(--accent-1, #A78BFA)' }}/>
              </div>
              <div className="font-display font-semibold mb-2">{f.title}</div>
              <div className="text-sm text-white/50 leading-relaxed">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 px-6 lg:px-12 py-20 max-w-6xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-center mb-12">Loved by teams</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400"/>)}
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-4">"{t.quote}"</p>
              <div className="text-sm font-semibold">{t.name}</div>
              <div className="text-xs text-white/40">{t.role}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto glass p-10 rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 rounded-3xl"
            style={{ background: `linear-gradient(135deg, var(--accent-1, #8B5CF6), var(--accent-2, #3B82F6))` }}/>
          <div className="relative">
            <h2 className="font-display text-4xl font-bold mb-4">Ready to ship faster?</h2>
            <p className="text-white/50 mb-8">Join thousands of teams already using TaskFlow AI.</p>
            <Link to="/signup" className="btn-primary text-base py-3 px-8 inline-flex">
              Start free today <ArrowRight className="w-5 h-5"/>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 lg:px-12 py-8 text-center text-xs text-white/30">
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <Logo/>
          <span>© 2026 TaskFlow AI</span>
          {['Privacy', 'Terms', 'Docs', 'Status'].map(l => (
            <a key={l} href="#" className="hover:text-white transition">{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
