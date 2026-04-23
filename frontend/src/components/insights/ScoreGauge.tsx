'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  label?: string;
  size?: number;
}

export default function ScoreGauge({ score, label = "Score General", size = 200 }: ScoreGaugeProps) {
  const radius = size * 0.4;
  const circumference = 2 * Math.PI * radius;
  const halfCircumference = circumference / 2;
  
  // Mapeamos el score (0-100) al arco del gauge (que es medio círculo)
  const strokeDashoffset = halfCircumference - (score / 100) * halfCircumference;
  
  const getColor = (s: number) => {
    if (s > 70) return '#10b981'; // Success (Emerald)
    if (s > 40) return '#3b82f6'; // Primary (Blue)
    return '#ef4444'; // Error (Red)
  };

  const color = getColor(score);

  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ width: size, height: size / 1.5 }}>
      <svg width={size} height={size / 1.5} className="transform -rotate-180">
        {/* Fondo del Gauge */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={size * 0.08}
          strokeDasharray={halfCircumference}
          strokeLinecap="round"
          className="text-white/5"
        />
        
        {/* Progreso del Gauge */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={size * 0.08}
          strokeDasharray={halfCircumference}
          initial={{ strokeDashoffset: halfCircumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          className="drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.3)]"
          style={{ 
            filter: `drop-shadow(0 0 12px ${color}44)`
          }}
        />
      </svg>

      {/* Texto Central */}
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 flex flex-col items-center">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-4xl font-black tracking-tighter text-text-prime"
          style={{ color }}
        >
          {Math.round(score)}
        </motion.span>
        <span className="text-[9px] uppercase tracking-[0.3em] text-text-muted/40 font-bold mt-1">
          {label}
        </span>
      </div>

      {/* Decoración Imperial */}
      <div className="absolute bottom-0 w-full flex justify-between px-6 text-[8px] font-black text-text-muted/20 uppercase tracking-widest">
        <span>Crit</span>
        <span>Opt</span>
      </div>
    </div>
  );
}
