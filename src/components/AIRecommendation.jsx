import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function AIRecommendation({ items }) {
  return (
    <div className="glass p-6 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-purple/20 blur-3xl"/>
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-neon-blue/15 blur-3xl"/>
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple to-neon-blue grid place-items-center glow-purple">
            <Sparkles className="w-4 h-4"/>
          </div>
          <div>
            <div className="font-display font-semibold">AI Recommendations</div>
            <div className="text-xs text-white/40">Powered by TaskFlow Intelligence</div>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {items.map((it, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-purple/30 cursor-pointer group">
              <span className="text-xs font-semibold mt-0.5 text-purple-glow">{String(i + 1).padStart(2, '0')}</span>
              <div className="flex-1">
                <div className="text-sm font-medium">{it.title}</div>
                <div className="text-xs text-white/50 mt-0.5">{it.desc}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white group-hover:translate-x-0.5 transition-all"/>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
