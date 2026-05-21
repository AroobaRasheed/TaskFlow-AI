/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0B12',
        surface: 'rgba(255,255,255,0.05)',
        purple: { DEFAULT: '#8B5CF6', deep: '#6D28D9', glow: '#A78BFA' },
        neon: { blue: '#3B82F6', cyan: '#22D3EE' }
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      backgroundImage: {
        'grid-purple': "radial-gradient(circle at 1px 1px, rgba(139,92,246,0.15) 1px, transparent 0)",
        'glow-radial': 'radial-gradient(circle at 50% 50%, rgba(139,92,246,0.25) 0%, transparent 60%)'
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'gradient': 'gradientShift 8s ease infinite',
        'blink': 'blink 4s infinite',
        'shimmer': 'shimmer 2s linear infinite'
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' }
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 30px rgba(139,92,246,0.4)' },
          '50%': { boxShadow: '0 0 60px rgba(139,92,246,0.8)' }
        },
        gradientShift: {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        blink: {
          '0%,96%,100%': { transform: 'scaleY(1)' },
          '98%': { transform: 'scaleY(0.1)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      }
    }
  },
  plugins: []
};
