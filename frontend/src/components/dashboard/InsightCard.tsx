'use client';

import React from 'react';
import { AlertCircle, TrendingUp, Zap, ChevronRight } from 'lucide-react';
import { InsightItem } from '@/types/api';
import { useRouter } from 'next/navigation';
import BaseCard from '@/components/shared/BaseCard';
import { useTheme } from '@/context/ThemeContext';

interface InsightCardProps {
  insight: InsightItem;
  count?: number;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, count = 1 }) => {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const Icon = insight.type === 'anomalia' ? AlertCircle : 
               insight.type === 'patron' ? TrendingUp : Zap;
  
  // Color basado en la confianza o tipo
  const isHighConfidence = insight.confidence > 0.8;
  const isLowConfidence = insight.confidence < 0.4;
  
  const accentColorClass = isHighConfidence ? 'text-success' : 
                           isLowConfidence ? 'text-error' : 
                           'text-primary';

  const handleAnalyze = () => {
    router.push(`/movimientos?categoria=${encodeURIComponent(insight.categoria)}`);
  };

  return (
    <BaseCard className="h-full flex flex-col justify-between group insight-card" hoverable>
      <div className="insight-body">
        <div className="flex items-center justify-between mb-6 insight-header">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white/5 ${accentColorClass} ring-1 ring-inset ring-white/5 shadow-sm icon-badge`}>
              <Icon size={18} />
            </div>
            <span className={`text-[10px] uppercase font-bold tracking-widest text-text-prime insight-type`}>
              {insight.type}
            </span>
            {count > 1 && (
              <span className="text-[9px] font-black bg-white/10 text-text-muted/60 px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-widest">
                ×{count}
              </span>
            )}
          </div>
          <button 
            onClick={handleAnalyze}
            className="text-[10px] text-text-muted/40 group-hover:text-primary transition-all flex items-center gap-1 uppercase tracking-tighter font-bold analyze-button"
          >
            Analizar <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-lg font-bold text-text-prime tracking-tight category-title">{insight.categoria}</h4>
          <p className="text-sm text-text-muted/70 leading-relaxed font-medium insight-description">
            {insight.insight}
          </p>
        </div>
      </div>
      
      <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center insight-footer">
        <div className="flex flex-col">
          <span className="text-[10px] text-text-muted/30 uppercase tracking-[0.1em] font-bold">Confianza del IA Motor</span>
          <div className="h-1 w-24 bg-white/5 rounded-full mt-1.5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out shadow-[0_0_8px_currentColor] progress-bar ${isHighConfidence ? 'bg-success' : isLowConfidence ? 'bg-error' : 'bg-primary'}`}
              style={{ width: `${insight.confidence * 100}%` }}
            />
          </div>
        </div>
        <span className={`text-sm font-black italic text-text-prime impact-value`}>
          {(insight.confidence * 100).toFixed(0)}%
        </span>
      </div>
    </BaseCard>
  );
};

export default InsightCard;
