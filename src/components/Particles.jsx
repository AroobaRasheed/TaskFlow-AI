import { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function Particles({ count = 24, className = '' }) {
  const dots = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 4,
      color: Math.random() > 0.5 ? '#8B5CF6' : '#3B82F6'
    })), [count]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {dots.map(d => (
        <motion.span
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: `${d.x}%`, top: `${d.y}%`,
            width: d.size, height: d.size,
            background: d.color,
            boxShadow: `0 0 ${d.size * 4}px ${d.color}`
          }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 1, 0.2] }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
