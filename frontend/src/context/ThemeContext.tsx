'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeName = 'finance-first' | 'premium-glass';

interface ThemeContextType {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  isFtStyle: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentThemeState] = useState<ThemeName>('finance-first');
  const [mounted, setMounted] = useState(false);

  // Cargar tema guardado en localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('toro-theme') as ThemeName | null;
    if (savedTheme && ['finance-first', 'premium-glass'].includes(savedTheme)) {
      setCurrentThemeState(savedTheme);
    }
    setMounted(true);
  }, []);

  const setTheme = (theme: ThemeName) => {
    setCurrentThemeState(theme);
    localStorage.setItem('toro-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  };

  // Aplicar tema al DOM
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', currentTheme);
    }
  }, [currentTheme, mounted]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, isFtStyle: currentTheme === 'finance-first' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe estar dentro de <ThemeProvider>');
  }
  return context;
};
