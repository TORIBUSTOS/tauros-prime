'use client';

import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { currentTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    const newTheme = currentTheme === 'finance-first' ? 'premium-glass' : 'finance-first';
    setTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-imperial-text-prime transition-all duration-300"
      title={`Cambiar a ${currentTheme === 'finance-first' ? 'Premium Glass' : 'Finance-First'}`}
    >
      <span>{currentTheme === 'finance-first' ? '💰' : '✨'}</span>
      <span className="hidden sm:inline">
        {currentTheme === 'finance-first' ? 'Financiero' : 'Premium'}
      </span>
    </button>
  );
}
