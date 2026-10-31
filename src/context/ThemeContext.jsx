import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = [
  {
    id: 'clandestina',
    name: 'Imprensa Clandestina',
    subtitle: 'Modo Claro Retrô • Xilogravura & Panfleto',
    badge: '★ Tradicional',
    icon: '📰',
    primaryColor: '#B91C1C',
    bgColor: '#F4EFE6',
    cardColor: '#FFFFFF',
    borderColor: '#141414',
    textColor: '#111111'
  },
  {
    id: 'carmim',
    name: 'Manifesto Carmim',
    subtitle: 'Alto Contraste Escuro • Carbono & Carmim',
    badge: '★ Vanguarda',
    icon: '☭',
    primaryColor: '#FF4D6D',
    bgColor: '#09090B',
    cardColor: '#1C1C22',
    borderColor: '#FF4D6D',
    textColor: '#FFFFFF'
  },
  {
    id: 'sierra',
    name: 'Sierra Maestra & Café',
    subtitle: 'Verde Guerrilha • Café Expresso & Terracota',
    badge: '★ Camponês',
    icon: '☕',
    primaryColor: '#F87171',
    bgColor: '#0F1912',
    cardColor: '#211A16',
    borderColor: '#D4A359',
    textColor: '#FAF6EB'
  },
  {
    id: 'cybersyn',
    name: 'Socialismo Cibernético',
    subtitle: 'Cybersyn Noir 1970s • Neon, Âmbar & Monospace',
    badge: '★ Cybersyn',
    icon: '⚡',
    primaryColor: '#FF2A54',
    bgColor: '#070B19',
    cardColor: '#1E293B',
    borderColor: '#FF2A54',
    textColor: '#F8FAFC'
  }
];

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem('clube_tema_ideologico') || 'clandestina';
    } catch {
      return 'clandestina';
    }
  });

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('clube_tema_ideologico', newTheme);
    } catch {}
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const currentThemeInfo = THEMES.find(t => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES, currentThemeInfo }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}
