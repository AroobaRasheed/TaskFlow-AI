import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, delta, color = 'purple', i = 0 }) {
  const colors = {
    purple: 'from-purple/30 to-purple/0 text-purple-glow',
    blue: 'from-neon-blue/30 to-neon-blue/0 text-neon-blue',
    green: 'from-emerald-500/30 to-emerald-500/0 text-emerald-400',
    red: 'from-rose-500/30 to-rose-500/0 text-rose-400',
  };
  const positive = (delta ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.06 }}
      className="relative glass p-5 overflow-hidden group hover:border-purple/30 transition-colors"
    >
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${colors[color]} blur-2xl opacity-60`}/>
      <div className="flex items-start justify-between mb-4 relative">
        <div className={`w-10 h-10 rounded-xl grid place-items-center bg-white/5 border border-white/10 ${colors[color].split(' ').slice(-1)[0]}`}>
          <Icon className="w-5 h-5"/>
        </div>
        {delta !== undefined && (
          <span className={`badge ${positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {positive ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
            {positive ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      <div className="text-3xl font-display font-bold mb-1">{value}</div>
      <div className="text-sm text-white/50">{label}</div>
    </motion.div>
  );
}
