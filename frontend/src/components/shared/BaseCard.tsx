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
    bronze: 'border-imperial-bronze/20 ring-1 ring-imperial-bronze/10',
    gold: 'border-amber-500/20 ring-1 ring-amber-500/10',
    success: 'border-success/20 ring-1 ring-success/10',
  };

  const hoverStyles = hoverable || onClick
    ? 'hover:bg-white/10 hover:border-white/10 hover:translate-y-[-2px] cursor-pointer transition-all duration-300'
    : '';

  return (
    <div 
      onClick={onClick}
      className={`
        glass-panel rim-light rounded-2xl p-5 relative overflow-hidden
        ${accentStyles[accent]}
        ${hoverStyles}
        ${className}
      `}
    >
      {/* Luz ambiental sutil en la esquina superior izquierda si tiene acento */}
      {accent !== 'none' && (
        <div className={`
          absolute -top-12 -left-12 w-24 h-24 blur-[40px] opacity-20 pointer-events-none rounded-full
          ${accent === 'bronze' ? 'bg-imperial-bronze' : ''}
          ${accent === 'gold' ? 'bg-amber-400' : ''}
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
