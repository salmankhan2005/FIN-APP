import { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  {
    id: 'light',
    label: 'Daylight',
    description: 'Clean white professional',
    icon: '☀️',
    preview: ['#f5f7fa', '#2563eb', '#ffffff'],
  },
  {
    id: 'deep-ocean',
    label: 'Deep Ocean',
    description: 'Dark navy & cyan',
    icon: '🌊',
    preview: ['#0f1b2d', '#00d4ff', '#162236'],
  },
  {
    id: 'slate-obsidian',
    label: 'Slate Obsidian',
    description: 'Charcoal & gold',
    icon: '🖤',
    preview: ['#1a1a2e', '#f59e0b', '#16213e'],
  },
  {
    id: 'forest-finance',
    label: 'Forest Finance',
    description: 'Dark teal & emerald',
    icon: '🌿',
    preview: ['#0a1f14', '#10b981', '#0d2b1a'],
  },
  {
    id: 'royal-indigo',
    label: 'Royal Indigo',
    description: 'Deep violet & rose',
    icon: '💜',
    preview: ['#1e1b4b', '#7c3aed', '#2e2b5b'],
  },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('finova_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('finova_theme', theme);
  }, [theme]);

  // Apply on first render too
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
