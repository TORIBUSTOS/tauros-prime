'use client';

import React from 'react';

interface FinancialValueProps {
  value: number;
  type?: 'currency' | 'percentage' | 'number';
  colorize?: boolean;
  reverse?: boolean; // If true, negative is good (e.g., expenses decrease)
  className?: string;
  showSymbol?: boolean;
  maximumFractionDigits?: number;
}

const FinancialValue: React.FC<FinancialValueProps> = ({
  value,
  type = 'currency',
  colorize = true,
  reverse = false,
  className = '',
  showSymbol = true,
  maximumFractionDigits = 0
}) => {
  const isPositive = value >= 0;
  
  // Decide color logic
  let colorClass = '';
  if (colorize) {
    if (reverse) {
      colorClass = isPositive ? 'text-error' : 'text-success';
    } else {
      colorClass = isPositive ? 'text-success' : 'text-error';
    }
  }

  // Format value
  let formattedValue = '';
  if (type === 'currency') {
    formattedValue = Math.abs(value).toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits
    });
  } else if (type === 'percentage') {
    formattedValue = `${Math.abs(value).toFixed(1)}%`;
  } else {
    formattedValue = Math.abs(value).toLocaleString('es-AR', {
      maximumFractionDigits
    });
  }

  const symbol = showSymbol ? (isPositive ? '+' : '-') : '';

  return (
    <span className={`${colorClass} ${className} tabular-nums`}>
      {symbol}{formattedValue}
    </span>
  );
};

export default FinancialValue;
