import { motion } from 'framer-motion';

/**
 * Friendly futuristic AI robot rendered in pure SVG.
 * Floats, blinks, and antenna pulses. Pass size & glow.
 */
export default function RobotAvatar({ size = 220, glow = true, talking = false }) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: size, height: size }}
      className="relative"
    >
      {glow && (
        <div className="absolute inset-0 -z-10 blur-3xl"
             style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.55), transparent 65%)' }}/>
      )}
      <svg viewBox="0 0 200 220" width="100%" height="100%">
        <defs>
          <linearGradient id="body" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#F4F1FF"/><stop offset="1" stopColor="#B8A8FF"/>
          </linearGradient>
          <linearGradient id="visor" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#1A1530"/><stop offset="1" stopColor="#3B2E6E"/>
          </linearGradient>
          <radialGradient id="eye" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#C7B8FF"/><stop offset="1" stopColor="#8B5CF6"/>
          </radialGradient>
        </defs>

        {/* antenna */}
        <line x1="100" y1="30" x2="100" y2="55" stroke="#8B5CF6" strokeWidth="3"/>
        <motion.circle cx="100" cy="25" r="6" fill="#A78BFA"
          animate={{ opacity: [0.4, 1, 0.4], r: [5, 7, 5] }}
          transition={{ duration: 1.6, repeat: Infinity }}/>

        {/* head */}
        <rect x="50" y="55" width="100" height="90" rx="28" fill="url(#body)" stroke="#8B5CF6" strokeWidth="1.5"/>
        {/* ears */}
        <rect x="40" y="85" width="12" height="30" rx="6" fill="#B8A8FF"/>
        <rect x="148" y="85" width="12" height="30" rx="6" fill="#B8A8FF"/>
        <circle cx="46" cy="100" r="3" fill="#8B5CF6"/>
        <circle cx="154" cy="100" r="3" fill="#8B5CF6"/>

        {/* visor */}
        <rect x="62" y="75" width="76" height="44" rx="18" fill="url(#visor)"/>
        {/* eyes */}
        <motion.g
          animate={{ scaleY: [1, 1, 0.1, 1] }}
          transition={{ duration: 4, times: [0, 0.92, 0.96, 1], repeat: Infinity }}
          style={{ transformOrigin: '100px 97px' }}
        >
          <circle cx="82" cy="97" r="8" fill="url(#eye)"/>
          <circle cx="118" cy="97" r="8" fill="url(#eye)"/>
          <circle cx="84" cy="95" r="2.5" fill="#fff"/>
          <circle cx="120" cy="95" r="2.5" fill="#fff"/>
        </motion.g>

        {/* mouth */}
        {talking ? (
          <motion.rect x="92" y="128" width="16" height="6" rx="2" fill="#8B5CF6"
            animate={{ scaleY: [1, 0.4, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{ transformOrigin: '100px 131px' }}/>
        ) : (
          <path d="M88 128 Q100 134 112 128" stroke="#8B5CF6" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        )}

        {/* neck */}
        <rect x="92" y="145" width="16" height="10" fill="#B8A8FF"/>

        {/* body */}
        <rect x="55" y="155" width="90" height="55" rx="20" fill="url(#body)" stroke="#8B5CF6" strokeWidth="1.5"/>
        <circle cx="100" cy="183" r="10" fill="#1A1530"/>
        <circle cx="100" cy="183" r="5" fill="#A78BFA">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
        </circle>
        {/* arms */}
        <rect x="35" y="160" width="14" height="40" rx="7" fill="#B8A8FF"/>
        <rect x="151" y="160" width="14" height="40" rx="7" fill="#B8A8FF"/>
      </svg>
    </motion.div>
  );
}
