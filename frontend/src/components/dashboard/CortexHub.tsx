'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Cpu, Radio, Sparkles, ChevronRight, Zap, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import { InsightItem } from '@/types/api';
import BaseCard from '@/components/shared/BaseCard';
import InsightCard from './InsightCard';
import LiquidityAlert from './LiquidityAlert';

interface CortexHubProps {
  insights: InsightItem[];
  currentBalance: number;
  projectedBalance: number;
  confidence: number;
  stability?: string;
}

const CortexHub: React.FC<CortexHubProps> = ({ 
  insights, 
  currentBalance, 
  projectedBalance, 
  confidence,
  stability
}) => {
  const [activeTab, setActiveTab] = useState<'hallazgos' | 'alertas'>('hallazgos');
  const [scannedCount, setScannedCount] = useState(0);

  // Agrupar insights por tipo + categoría para evitar cards repetidas
  const groupedInsights = useMemo(() => {
    const map = new Map<string, { insight: InsightItem; count: number }>();
    for (const ins of insights) {
      const key = `${ins.type}:${ins.categoria}`;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, { insight: ins, count: 1 });
      } else {
        existing.count += 1;
        // Conservar el de mayor confianza como representativo
        if (ins.confidence > existing.insight.confidence) {
          existing.insight = ins;
        }
      }
    }
    return Array.from(map.values());
  }, [insights]);

  // Simulación de "IA Scanning" para el efecto WOW
  useEffect(() => {
    if (groupedInsights.length > 0) {
      setScannedCount(0);
      const interval = setInterval(() => {
        setScannedCount(prev => (prev < groupedInsights.length ? prev + 1 : prev));
      }, 300);
      return () => clearInterval(interval);
    }
  }, [groupedInsights]);

  const hasCriticalAlert = projectedBalance < 0;

  return (
    <BaseCard className="flex flex-col h-full overflow-hidden p-0 cortex-hub" hoverable={false}>
      {/* Search/Header Area */}
      <div className="p-4 border-b border-white/5 bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Cpu className="w-5 h-5 text-primary animate-pulse" />
            <div className="absolute inset-0 bg-primary/20 blur-md rounded-full animate-ping" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-prime">Cortex Intelligence Hub</h3>
            <p className="text-[9px] font-bold text-muted/40 uppercase tracking-widest flex items-center gap-1.5">
              <Radio size={8} className="text-success animate-pulse" /> {groupedInsights.length} hallazgos únicos ({insights.length} señales)
            </p>
          </div>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 tab-controls">
          <button 
            onClick={() => setActiveTab('hallazgos')}
            className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all ${activeTab === 'hallazgos' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-muted/60 hover:text-prime'}`}
          >
            Feed
          </button>
          <button 
            onClick={() => setActiveTab('alertas')}
            className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all flex items-center gap-1.5 ${activeTab === 'alertas' ? 'bg-error text-white shadow-lg shadow-error/20' : 'text-muted/60 hover:text-prime'}`}
          >
            Alertas {hasCriticalAlert && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
          </button>
        </div>
      </div>

      {/* Main Stream Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar intelligence-stream">
        {activeTab === 'hallazgos' ? (
          <>
            {groupedInsights.slice(0, scannedCount).map(({ insight, count }, idx) => (
              <div key={`${insight.type}:${insight.categoria}`} className="animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                <InsightCard insight={insight} count={count} />
              </div>
            ))}
            {groupedInsights.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center opacity-30">
                <Sparkles className="w-10 h-10 mb-3 text-primary/50" />
                <p className="text-xs font-black uppercase tracking-widest italic">Cortex no detectó anomalías relevantes en este ciclo</p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-500">
             <LiquidityAlert 
                currentBalance={currentBalance} 
                projectedBalance={projectedBalance} 
                confidence={confidence} 
             />
             
             {/* Future: Add more alert types like "Spending Spikes" */}
          </div>
        )}
      </div>

      {/* Footer / Console Stats */}
      <div className="p-3 border-t border-white/5 bg-black/20 flex items-center justify-between hub-footer">
        <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-tighter text-muted/40">
          <div className="flex items-center gap-1.5">
            <Zap size={10} className="text-primary" />
            Confidence: <span className="text-prime">{(confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={10} className={stability === 'Crítica' ? 'text-error' : stability === 'Bajo Control' ? 'text-warning' : 'text-success'} />
            Estabilidad: <span className="text-prime">{stability || 'Normal'}</span>
          </div>
        </div>
        <button 
          onClick={() => window.location.href = '/insights'}
          className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 hover:bg-primary/20 rounded-md text-[9px] font-black uppercase tracking-widest text-primary transition-all border border-primary/20 group/btn"
        >
          Optimizar <ChevronRight size={10} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <style jsx global>{`
        .intelligence-stream::-webkit-scrollbar {
          width: 4px;
        }
        .intelligence-stream::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .intelligence-stream::-webkit-scrollbar-thumb {
          background: rgba(var(--p-primary-rgb), 0.1);
          border-radius: 10px;
        }
        .intelligence-stream::-webkit-scrollbar-thumb:hover {
          background: rgba(var(--p-primary-rgb), 0.3);
        }
      `}</style>
    </BaseCard>
  );
};

export default CortexHub;
