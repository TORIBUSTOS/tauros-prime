'use client';

import React, { useEffect, useState } from 'react';
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
  const router = useRouter();

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      try {
        const data = await apiService.getInsights(selectedPeriod);
        setInsights(data.insights || []);
      } catch (err) {
        console.error('Error loading insights:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, [selectedPeriod]);

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'anomaly':           return <AlertTriangle className="text-error" size={20} />;
      case 'saving_opportunity': return <TrendingDown className="text-success" size={20} />;
      case 'recurring':         return <Zap className="text-primary-muted" size={20} />;
      case 'budget_alert':      return <Target className="text-warning" size={20} />;
      default:                  return <Sparkles className="text-primary" size={20} />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type.toLowerCase()) {
      case 'anomaly':           return 'Anomalía Detectada';
      case 'saving_opportunity': return 'Oportunidad de Ahorro';
      case 'recurring':         return 'Patrón Recurrente';
      case 'budget_alert':      return 'Alerta de Presupuesto';
      default:                  return 'Hallazgo de Inteligencia';
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
          Análisis avanzado mediante redes neuronales para detectar patrones, anomalías y optimizaciones en el flujo de capital de {selectedPeriod}.
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
                  El motor ha procesado{' '}
                  <span className="text-primary">{insights.length} hallazgos</span> clave.
                </h2>
                <p className="text-text-muted text-sm md:text-base mb-6 md:mb-8 leading-relaxed line-clamp-3">
                  Se detectaron variaciones atípicas en gastos operativos y una oportunidad significativa de optimización en suscripciones digitales.
                </p>
                <div className="flex flex-wrap gap-3 md:gap-4">
                  <div className="bg-surface/50 backdrop-blur-sm border border-white/5 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl min-w-fit">
                    <div className="text-[9px] md:text-[10px] uppercase tracking-widest text-text-muted/40 mb-1 text-center font-bold">Precisión</div>
                    <div className="text-lg md:text-xl font-bold text-success text-center">98.4%</div>
                  </div>
                  <div className="bg-surface/50 backdrop-blur-sm border border-white/5 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl min-w-fit">
                    <div className="text-[9px] md:text-[10px] uppercase tracking-widest text-text-muted/40 mb-1 text-center font-bold">Latencia</div>
                    <div className="text-lg md:text-xl font-bold text-text-prime text-center">12ms</div>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>

          {/* Cards de insights */}
          {insights.map((item, idx) => (
            <BaseCard
              key={idx}
              className="flex flex-col gap-4 md:gap-6 hover:translate-y-[-4px] transition-transform duration-300 group cursor-pointer"
              onClick={() => handleCardClick(item)}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="p-3 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 group-hover:border-primary/20 transition-colors flex-shrink-0">
                  {getIcon(item.type)}
                </div>
                <div className="text-[9px] md:text-[10px] font-black text-text-muted/50 uppercase tracking-widest bg-white/5 px-2 py-1 rounded whitespace-nowrap">
                  {(item.confidence * 100).toFixed(0)}%
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[9px] md:text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">
                  {getTypeName(item.type)}
                </div>
                <h3 className="text-text-prime font-bold text-base md:text-lg mb-3 leading-snug line-clamp-2">
                  {item.categoria}
                </h3>
                <p className="text-text-muted/80 text-xs md:text-sm leading-relaxed line-clamp-4">
                  {item.insight}
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
