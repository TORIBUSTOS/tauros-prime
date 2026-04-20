'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { usePeriod } from '@/context/PeriodContext';
import { apiService } from '@/services/api.service';
import { InsightItem } from '@/types/api';
import LoadingImperial from '@/components/shared/LoadingImperial';
import EmptyState from '@/components/shared/EmptyState';
import BaseCard from '@/components/shared/BaseCard';
import { Sparkles, AlertTriangle, TrendingDown, Target, Zap, ArrowRight, BrainCircuit } from 'lucide-react';

export default function InsightsPage() {
  const { selectedPeriod } = usePeriod();
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      setError(false);
      try {
        const data = await apiService.getInsights(selectedPeriod);
        setInsights(data.insights || []);
      } catch (err) {
        console.error('Error loading insights:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, [selectedPeriod]);

  // Agrupar y deduplicar insights
  const groupedInsights = useMemo(() => {
    const map = new Map<string, { insight: InsightItem; count: number }>();
    for (const ins of insights) {
      const key = `${ins.type}:${ins.categoria}`;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, { insight: ins, count: 1 });
      } else {
        existing.count += 1;
        if (ins.confidence > existing.insight.confidence) {
          existing.insight = ins;
        }
      }
    }
    return Array.from(map.values());
  }, [insights]);

  const avgConfidence = useMemo(() => {
    if (insights.length === 0) return 0;
    return insights.reduce((acc, curr) => acc + curr.confidence, 0) / insights.length;
  }, [insights]);

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'outlier':         return <AlertTriangle className="text-error" size={20} />;
      case 'pattern':         return <Zap className="text-primary" size={20} />;
      case 'context_anomaly': return <Target className="text-amber-400" size={20} />;
      default:                return <Sparkles className="text-primary" size={20} />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type.toLowerCase()) {
      case 'outlier':         return 'Anomalía Detectada';
      case 'pattern':         return 'Patrón Recurrente';
      case 'context_anomaly': return 'Anomalía Contextual';
      default:                return 'Hallazgo de Inteligencia';
    }
  };

  const handleCardClick = (item: InsightItem) => {
    const params = new URLSearchParams({ categoria: item.categoria });
    if (item.data?.fecha) params.set('fecha', item.data.fecha);
    router.push(`/movimientos?${params.toString()}`);
  };

  if (loading) return <LoadingImperial message="Sincronizando con el Motor Cognitivo..." />;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-primary font-bold">
          <div className="w-4 h-[1px] bg-primary/40" />
          Inteligencia Financiera
        </div>
        <h1 className="text-2xl font-black tracking-tight text-text-prime">
          Feed de <span className="text-primary">Insights</span>
        </h1>
        <p className="text-sm text-text-muted max-w-2xl leading-relaxed">
          Análisis avanzado mediante modelos estadísticos para detectar patrones, anomalías y optimizaciones en el flujo de capital de {selectedPeriod}.
        </p>
      </header>

      {insights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Banner del analizador */}
          <BaseCard className="md:col-span-2 lg:col-span-3 overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 md:p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700 scale-100 md:scale-125 group-hover:scale-110 pointer-events-none">
              <BrainCircuit size={150} className="text-primary md:w-[180px] md:h-[180px]" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 md:gap-8 py-4">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-4 md:mb-6">
                  <Sparkles size={12} /> Estado del Analizador
                </div>
                <h2 className="text-lg md:text-xl font-bold text-text-prime mb-3 md:mb-4 leading-tight">
                  Sincronización Cognitiva <span className="text-primary">Completada</span>.
                </h2>
                <p className="text-text-muted text-sm md:text-base mb-6 md:mb-8 leading-relaxed max-w-xl">
                  Se han consolidado {groupedInsights.length} hallazgos únicos a partir de {insights.length} señales detectadas en el periodo {selectedPeriod}.
                </p>
                <div className="flex flex-wrap gap-3 md:gap-4">
                  <div className="bg-surface/50 backdrop-blur-sm border border-white/5 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl min-w-fit">
                    <div className="text-[9px] md:text-[10px] uppercase tracking-widest text-text-muted/40 mb-1 text-center font-bold">Confianza Promedio</div>
                    <div className="text-lg md:text-xl font-bold text-primary text-center">{(avgConfidence * 100).toFixed(1)}%</div>
                  </div>
                  {!error && (
                    <div className="bg-surface/50 backdrop-blur-sm border border-white/5 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl min-w-fit flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <div className="text-[9px] md:text-[10px] uppercase tracking-widest text-text-prime font-bold">Analizador Activo</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </BaseCard>

          {/* Cards de insights */}
          {groupedInsights.map(({ insight, count }) => (
            <BaseCard
              key={`${insight.type}:${insight.categoria}`}
              className="flex flex-col gap-4 md:gap-6 hover:translate-y-[-4px] transition-transform duration-300 group cursor-pointer"
              onClick={() => handleCardClick(insight)}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="p-3 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 group-hover:border-primary/20 transition-colors flex-shrink-0">
                  {getIcon(insight.type)}
                </div>
                <div className="flex items-center gap-2">
                  {count > 1 && (
                    <div className="text-[9px] font-black text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase">
                      x{count}
                    </div>
                  )}
                  <div className="text-[9px] md:text-[10px] font-black text-text-muted/50 uppercase tracking-widest bg-white/5 px-2 py-1 rounded whitespace-nowrap">
                    {(insight.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[9px] md:text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">
                  {getTypeName(insight.type)}
                </div>
                <h3 className="text-text-prime font-bold text-base md:text-lg mb-3 leading-snug line-clamp-2">
                  {insight.categoria}
                </h3>
                <p className="text-text-muted/80 text-xs md:text-sm leading-relaxed line-clamp-4">
                  {insight.insight}
                </p>
              </div>

              <div className="mt-2 md:mt-4 pt-4 border-t border-white/5 flex justify-between items-center gap-2 group-hover:border-primary/10 transition-colors">
                <span className="text-[9px] md:text-[10px] text-text-muted/40 uppercase tracking-widest font-bold whitespace-nowrap">
                  Detalle
                </span>
                <ArrowRight
                  size={14}
                  className="text-primary transform group-hover:translate-x-1 transition-transform flex-shrink-0"
                />
              </div>
            </BaseCard>
          ))}

        </div>
      ) : (
        <EmptyState message="El Motor Cognitivo aún no ha detectado patrones significativos para este periodo." />
      )}
    </div>
  );
}
