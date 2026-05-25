import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', glow = false, hover = true, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={`relative glass p-6 ${glow ? 'glow-purple' : ''} ${className}`}
      {...props}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-purple/5 pointer-events-none" />
      <div className="relative">{children}</div>
    </motion.div>
  );
}
