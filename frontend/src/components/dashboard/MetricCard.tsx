'use client';

import React from 'react';
import BaseCard from '@/components/shared/BaseCard';


interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: number;
  subtitle?: string;
  accent?: 'gold' | 'bronze' | 'none';
  onClick?: () => void;
  className?: string;
  valueClassName?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  trend,
  subtitle,
  accent = 'none',
  onClick,
  className = '',
  valueClassName = ''
}) => {
  const finalValueColorClass = valueClassName || 'text-foreground';

  return (
    <BaseCard
      accent="none"
      onClick={onClick}
      className={`metric-card h-full flex flex-col justify-center ${className}`}
      hoverable={!!onClick}
    >
      <div className="flex flex-col h-full">
        <span className="metric-label">
          {label}
        </span>

        <div className="flex items-baseline gap-3">
          <h2 className={`metric-value ${finalValueColorClass}`}>
            {value}
          </h2>
          {trend !== undefined && (
            <div className={`metric-trend px-2 py-0.5 rounded-md text-[10px] font-bold ring-1 ring-inset ${
              trend >= 0
                ? 'text-success bg-success/10 ring-success/20'
                : 'text-error bg-error/10 ring-error/20'
            }`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>

        {subtitle && (
          <p className="metric-subtitle text-xs text-text-muted/60 mt-3 font-medium flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-primary/40" />
            {subtitle}
          </p>
        )}
      </div>

      {/* Decorative Accent Glow */}
      {accent !== 'none' && (
        <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-300 ${
          accent === 'bronze' ? 'bg-primary' :
          accent === 'gold' ? 'bg-gold' :
          ''
        }`} />
      )}
    </BaseCard>
  );
};

export default MetricCard;
