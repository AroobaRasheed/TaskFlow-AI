import { motion } from 'framer-motion';
import { Calendar, MessageSquare, Paperclip } from 'lucide-react';

const priorityStyle = {
  High: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  Medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Low: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
};

export default function TaskCard({ task, i = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      whileHover={{ y: -3, boxShadow: '0 10px 40px rgba(139,92,246,0.25)' }}
      className="glass p-4 cursor-grab active:cursor-grabbing hover:border-purple/40 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`badge border ${priorityStyle[task.priority]}`}>{task.priority}</span>
        <span className="text-xs text-white/40">{task.tag}</span>
      </div>
      <h4 className="font-medium mb-1.5 leading-snug">{task.title}</h4>
      <p className="text-xs text-white/50 line-clamp-2 mb-3">{task.description}</p>

      {task.progress !== undefined && (
        <div className="mb-3">
          <div className="flex justify-between text-[11px] text-white/40 mb-1">
            <span>Progress</span><span>{task.progress}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple to-neon-blue" style={{ width: `${task.progress}%` }}/>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-white/40">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{task.deadline}</span>
          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3"/>{task.comments}</span>
          <span className="flex items-center gap-1"><Paperclip className="w-3 h-3"/>{task.attachments}</span>
        </div>
        <div className="flex -space-x-2">
          {task.assignees.map((a, idx) => (
            <div key={idx} className="w-6 h-6 rounded-full border-2 border-bg grid place-items-center text-[10px] font-semibold"
                 style={{ background: a.color }}>{a.initials}</div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
