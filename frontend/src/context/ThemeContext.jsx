// src/context/ThemeContext.jsx
// Real working theme system using CSS variables injected into :root

import { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = {
  Midnight: {
    '--accent-1': '#8B5CF6',
    '--accent-2': '#3B82F6',
    '--bg-base':  '#0B0B12',
    '--bg-grad1': 'rgba(139,92,246,0.15)',
    '--bg-grad2': 'rgba(59,130,246,0.12)',
    '--glow-1':   'rgba(139,92,246,0.35)',
    '--glow-2':   'rgba(59,130,246,0.3)',
    '--scrollbar': 'rgba(139,92,246,0.3)',
    '--btn-from': '#8B5CF6',
    '--btn-to':   '#3B82F6',
  },
  Aurora: {
    '--accent-1': '#34D399',
    '--accent-2': '#22D3EE',
    '--bg-base':  '#0F1419',
    '--bg-grad1': 'rgba(52,211,153,0.15)',
    '--bg-grad2': 'rgba(34,211,238,0.12)',
    '--glow-1':   'rgba(52,211,153,0.35)',
    '--glow-2':   'rgba(34,211,238,0.3)',
    '--scrollbar': 'rgba(52,211,153,0.3)',
    '--btn-from': '#34D399',
    '--btn-to':   '#22D3EE',
  },
  Sunset: {
    '--accent-1': '#F472B6',
    '--accent-2': '#FBBF24',
    '--bg-base':  '#1A0F1F',
    '--bg-grad1': 'rgba(244,114,182,0.15)',
    '--bg-grad2': 'rgba(251,191,36,0.12)',
    '--glow-1':   'rgba(244,114,182,0.35)',
    '--glow-2':   'rgba(251,191,36,0.3)',
    '--scrollbar': 'rgba(244,114,182,0.3)',
    '--btn-from': '#F472B6',
    '--btn-to':   '#FBBF24',
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('taskflow_theme') || 'Midnight');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  const applyTheme = (name) => {
    const vars = THEMES[name];
    if (!vars) return;
    const root = document.documentElement;
    Object.entries(vars).forEach(([key, val]) => root.style.setProperty(key, val));

    // Apply background
    document.body.style.backgroundColor = vars['--bg-base'];
    document.body.style.backgroundImage = `
      radial-gradient(ellipse 80% 50% at 20% 0%, ${vars['--bg-grad1']}, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 100%, ${vars['--bg-grad2']}, transparent 60%),
      linear-gradient(180deg, ${vars['--bg-base']} 0%, ${vars['--bg-base']}CC 100%)
    `;

    // Update scrollbar color via CSS var
    const styleId = 'theme-scrollbar';
    let el = document.getElementById(styleId);
    if (!el) { el = document.createElement('style'); el.id = styleId; document.head.appendChild(el); }
    el.textContent = `
      ::-webkit-scrollbar-thumb { background: ${vars['--scrollbar']} !important; }
      ::-webkit-scrollbar-thumb:hover { background: ${vars['--accent-1']}80 !important; }
      ::selection { background: ${vars['--accent-1']}66 !important; }
    `;

    localStorage.setItem('taskflow_theme', name);
  };

  useEffect(() => { applyTheme(theme); }, []);

  const changeTheme = (name) => {
    setTheme(name);
    applyTheme(name);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, reducedMotion, setReducedMotion, compactMode, setCompactMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
