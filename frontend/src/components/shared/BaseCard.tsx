'use client';

import React from 'react';

interface BaseCardProps {
  children: React.ReactNode;
  className?: string;
  accent?: 'none' | 'bronze' | 'gold' | 'success';
  onClick?: () => void;
  hoverable?: boolean;
}

const BaseCard: React.FC<BaseCardProps> = ({ 
  children, 
  className = '', 
  accent = 'none',
  onClick,
  hoverable = false
}) => {
  const accentStyles = {
    none: 'border-white/5',
    bronze: 'border-primary/40 ring-1 ring-primary/20',
    gold: 'border-gold/40 ring-1 ring-gold/20',
    success: 'border-success/40 ring-1 ring-success/20',
  };

  const hoverStyles = hoverable || onClick
    ? 'hover:bg-white/[0.08] hover:translate-y-[-4px] cursor-pointer'
    : '';

  return (
    <div 
      onClick={onClick}
      className={`
        glass-panel rim-light rounded-card p-6 relative overflow-hidden
        transition-all duration-[var(--t-transition-duration)] ease-[var(--t-transition-timing)]
        shadow-[var(--t-shadow-card)] hover:shadow-[var(--t-shadow-card-hover)]
        ${accentStyles[accent]}
        ${hoverStyles}
        ${className}
      `}
    >
      {/* Luz ambiental sutil en la esquina superior izquierda si tiene acento */}
      {accent !== 'none' && (
        <div className={`
          absolute -top-12 -left-12 w-24 h-24 blur-[40px] opacity-20 pointer-events-none rounded-full
          ${accent === 'bronze' ? 'bg-primary' : ''}
          ${accent === 'gold' ? 'bg-gold' : ''}
          ${accent === 'success' ? 'bg-success' : ''}
        `} />
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default BaseCard;
