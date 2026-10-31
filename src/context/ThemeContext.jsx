import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = [
  {
    id: 'clandestina',
    name: 'Imprensa Clandestina',
    subtitle: 'Modo Claro Retrô • Xilogravura & Panfleto',
    badge: '★ Tradicional',
    icon: '📰',
    primaryColor: '#D62828',
    bgColor: '#F5F0E6',
    cardColor: '#FFFDF9',
    borderColor: '#141414',
    textColor: '#141414'
  },
  {
    id: 'sierra',
    name: 'Sierra Maestra & Café',
    subtitle: 'Verde Guerrilha • Café Expresso & Terracota',
    badge: '★ Camponês',
    icon: '☕',
    primaryColor: '#D4A359',
    bgColor: '#162419',
    cardColor: '#231915',
    borderColor: '#D4A359',
    textColor: '#EDE6D6'
  },
  {
    id: 'carmim',
    name: 'Manifesto Carmim',
    subtitle: 'Alto Contraste Escuro • Carbono & Vermelho Vivo',
    badge: '★ Vanguarda',
    icon: '☭',
    primaryColor: '#E11D48',
    bgColor: '#0F0F12',
    cardColor: '#18181C',
    borderColor: '#E11D48',
    textColor: '#F3F4F6'
  },
  {
    id: 'cybersyn',
    name: 'Socialismo Cibernético',
    subtitle: 'Cybersyn Noir 1970s • Neon, Âmbar & Monospace',
    badge: '★ Cybersyn',
    icon: '⚡',
    primaryColor: '#FF2A54',
    bgColor: '#0B132B',
    cardColor: '#1C2541',
    borderColor: '#FF2A54',
    textColor: '#E0FBFC'
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
