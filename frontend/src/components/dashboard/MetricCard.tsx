'use client';

import React from 'react';
import BaseCard from '@/components/shared/BaseCard';
import { useTheme } from '@/context/ThemeContext';

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: number;
  subtitle?: string;
  accent?: 'gold' | 'bronze' | 'none';
  onClick?: () => void;
  className?: string;
  colorizeValue?: boolean;
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
  colorizeValue = false,
  valueClassName = ''
}) => {
  const { currentTheme } = useTheme();

  const isNumericValue = typeof value === 'number';
  const semanticColorClass = colorizeValue && isNumericValue
    ? (value >= 0 ? 'text-success' : 'text-error')
    : '';

  const finalValueColorClass = valueClassName || semanticColorClass || 'text-imperial-text-prime';

  // Theme-aware font sizing
  const isFtStyle = currentTheme === 'finance-first';
  const valueSizeClass = isFtStyle ? 'text-[3.5rem]' : 'text-3xl';

  return (
    <BaseCard
      accent={accent}
      onClick={onClick}
      className={`metric-card h-full flex flex-col justify-center transition-all duration-300 ${className}`}
      hoverable={!!onClick}
    >
      <div className="flex flex-col h-full">
        <span className="metric-label">
          {label}
        </span>

        <div className="flex items-baseline gap-3">
          <h2 className={`metric-value ${isFtStyle ? 'font-mono' : 'font-sans'} ${finalValueColorClass}`}>
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
          <p className="metric-subtitle text-xs text-imperial-text-muted/60 mt-3 font-medium flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-imperial-bronze/40" />
            {subtitle}
          </p>
        )}
      </div>

      {/* Decorative Accent Glow */}
      {accent !== 'none' && (
        <div className={`absolute top-0 left-0 w-1 h-full opacity-60 transition-colors duration-300 ${
          accent === 'bronze' ? 'bg-imperial-bronze shadow-[0_0_10px_rgba(192,152,145,0.4)]' :
          accent === 'gold' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]' :
          ''
        }`} />
      )}
    </BaseCard>
  );
};

export default MetricCard;
