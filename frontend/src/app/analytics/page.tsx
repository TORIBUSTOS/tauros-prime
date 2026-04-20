'use client';

import React, { useEffect, useState, useMemo } from 'react';
import FlowChart from '@/components/analytics/FlowChart';
import CategoryPieChart from '@/components/analytics/CategoryPieChart';
import HormigaAnalysis from '@/components/analytics/HormigaAnalysis';
import ForecastChart from '@/components/analytics/ForecastChart';
import MetricCard from '@/components/dashboard/MetricCard';
import BaseCard from '@/components/shared/BaseCard';
import { apiService } from '@/services/api.service';
import { MovimientoMapped, PLReportResponse, ForecastResponse } from '@/types/api';
import { TrendingUp, Activity, PieChart as PieIcon, ShieldCheck, Brain, Loader2, Target, Sparkles } from 'lucide-react';
import { usePeriod } from '@/context/PeriodContext';

export default function AnalyticsPage() {
  const [movements, setMovements] = useState<MovimientoMapped[]>([]);
  const [reportData, setReportData] = useState<PLReportResponse | null>(null);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { selectedPeriod } = usePeriod();

  const fetchData = async (period: string) => {
    if (!period) return;
    setLoading(true);
    try {
      const [movData, plData, foreData] = await Promise.all([
        apiService.getMovements(period),
        apiService.getReportPL(period),
        apiService.getForecast(period)
      ]);
      setMovements(movData);
      setReportData(plData);
      setForecastData(foreData);
    } catch (err) {
      console.error("Error fetching analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedPeriod);
  }, [selectedPeriod]);

  const burnRate = useMemo(() => {
    if (!reportData || !selectedPeriod) return 0;
    const [year, month] = selectedPeriod.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    return reportData.egresos_total / daysInMonth;
  }, [reportData, selectedPeriod]);

  const savingsRate = reportData ? (reportData.resultado_neto / reportData.ingresos_total) * 100 : 0;

  // ─── Health Score dinámico ───────────────────────────────────────────────
  // Compuesto por 4 indicadores (25 pts c/u):
  //  1. Savings rate > 10% → positivo
  //  2. Confianza AI promedio > 80%
  //  3. Forecast disponible
  //  4. Egresos < Ingresos (no en déficit)
  const avgConfianza = movements.length > 0
    ? movements.reduce((s, m) => s + m.confianza, 0) / movements.length
    : 0;

  const healthScore = Math.round(
    (savingsRate > 10 ? 25 : savingsRate > 0 ? 15 : 0) +
    (avgConfianza > 0.8 ? 25 : avgConfianza > 0.6 ? 15 : 5) +
    (forecastData ? 25 : 0) +
    (reportData && reportData.resultado_neto >= 0 ? 25 : 10),
  );

  const healthLabel =
    healthScore >= 80 ? 'estable' :
    healthScore >= 55 ? 'moderado' :
    'en alerta';

  const healthTextColor =
    healthScore >= 80 ? 'text-success' :
    healthScore >= 55 ? 'text-amber-400' :
    'text-error';

  const healthBarColor =
    healthScore >= 80 ? 'bg-primary' :
    healthScore >= 55 ? 'bg-amber-400' :
    'bg-error';

  // Confianza del modelo = promedio de confianza AI de los movimientos
  const modelConfianza = avgConfianza > 0
    ? `${(avgConfianza * 100).toFixed(1)}% Precisión AI`
    : 'Sin datos';

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-6 min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-b-2 border-primary animate-spin" />
          <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-sm font-black text-prime uppercase tracking-[0.3em]">Procesando Inteligencia</h2>
          <p className="text-[10px] text-muted/40 font-bold uppercase tracking-widest italic animate-pulse">
            Ejecutando modelos predictivos TAUROS...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-2 duration-1000">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2 border-b border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
            <Activity size={12} className="animate-pulse" />
            Financial Intelligence
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-prime uppercase italic">
             Inteligencia <span className="text-primary not-italic underline decoration-primary/20 underline-offset-8">Analítica</span>
          </h1>
          <div className="flex items-center gap-2 text-xs text-muted/50 font-medium">
            <Target size={14} className="text-primary/40" />
            Análisis de flujo y predicción de comportamiento para <span className="text-prime font-bold">{selectedPeriod}</span>.
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-md">
          <div className="text-right">
            <p className="text-[9px] text-muted/40 font-black uppercase tracking-widest leading-none mb-1">Confianza del Modelo</p>
            <p className="text-xs text-primary font-black flex items-center justify-end gap-2 uppercase italic tracking-tighter">
              {modelConfianza}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Brain className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Chart Column */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {movements.length > 0 ? (
            <div className="h-[320px] md:h-[450px]">
              <FlowChart movements={movements} period={selectedPeriod} />
            </div>
          ) : (
            <div className="h-[450px] bg-white/2 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-4 p-6">
              <Activity size={32} className="text-primary/40" />
              <div className="text-center">
                <p className="text-sm font-bold text-prime mb-1">Sin datos para visualizar</p>
                <p className="text-xs text-muted/50">No hay movimientos cargados para el período {selectedPeriod}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <MetricCard
                label="Burn Rate Diario"
                value={burnRate.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                subtitle="Promedio de egresos diarios"
                accent="bronze"
             />
             <MetricCard
                label="Tasa de Ahorro"
                value={`${savingsRate > 0 ? '+' : ''}${savingsRate.toFixed(1)}%` }
                subtitle="Eficiencia del flujo neto"
                accent={savingsRate > 20 ? 'gold' : 'none'}
             />
          </div>

          {forecastData && (
            <div className="h-[320px] md:h-[450px] animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              <ForecastChart data={forecastData} />
            </div>
          )}
        </div>

        {/* Side Column: Distribution & Analysis */}
        <div className="flex flex-col gap-8">
          {reportData ? (
            <div className="h-[300px] md:h-[400px]">
              <CategoryPieChart data={reportData} />
            </div>
          ) : (
            <div className="h-[400px] bg-white/2 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-4 p-6">
              <PieIcon size={32} className="text-primary/40" />
              <div className="text-center">
                <p className="text-sm font-bold text-prime mb-1">Datos no disponibles</p>
                <p className="text-xs text-muted/50">Cargando distribución...</p>
              </div>
            </div>
          )}

          {movements.length > 0 && <HormigaAnalysis movements={movements} />}
          
          {/* Health Check Card */}
          <BaseCard className="bg-gradient-to-br from-surface to-black border-primary/20">
             <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-prime font-black text-sm uppercase tracking-[0.2em]">Estado de Salud</h3>
                  <p className="text-[10px] font-bold text-muted/40 uppercase">Auditoría en Tiempo Real</p>
                </div>
             </div>
             
             <p className="text-sm text-muted/80 leading-relaxed font-medium">
               La salud financiera de este ciclo se mantiene{' '}
               <span className={`font-black uppercase italic ${healthTextColor}`}>{healthLabel}</span>.
               {savingsRate > 10
                 ? ' El ratio de liquidez es óptimo y la presión de egresos está bajo parámetros nominales.'
                 : savingsRate >= 0
                 ? ' El balance es positivo aunque el margen de ahorro es ajustado. Monitorear egresos.'
                 : ' El período cerró en déficit. Revisar categorías de gasto y proyecciones.'
               }
             </p>

             <div className="mt-6 space-y-4">
               {/* Score bar */}
               <div className="space-y-2">
                 <div className="flex justify-between items-end">
                   <span className="text-[10px] font-black text-muted/40 uppercase tracking-widest">Score Imperial</span>
                   <span className={`text-xs font-black ${healthTextColor}`}>{healthScore}/100</span>
                 </div>
                 <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                   <div
                     className={`${healthBarColor} h-full rounded-full shadow-[0_0_15px_rgba(var(--p-primary-rgb),0.4)] transition-all duration-1000`}
                     style={{ width: `${healthScore}%` }}
                   />
                 </div>
               </div>

               {/* Mini KPIs */}
               <div className="grid grid-cols-2 gap-3 pt-2">
                 <MiniKpi
                   label="Confianza AI"
                   value={`${(avgConfianza * 100).toFixed(0)}%`}
                   ok={avgConfianza > 0.8}
                 />
                 <MiniKpi
                   label="Tasa Ahorro"
                   value={`${savingsRate > 0 ? '+' : ''}${savingsRate.toFixed(1)}%`}
                   ok={savingsRate > 10}
                 />
                 <MiniKpi label="Forecast" value={forecastData ? 'OK' : 'N/A'} ok={!!forecastData} />
                 <MiniKpi label="Balance" value={reportData && reportData.resultado_neto >= 0 ? 'Positivo' : 'Déficit'} ok={!!reportData && reportData.resultado_neto >= 0} />
               </div>
             </div>
          </BaseCard>
        </div>

      </div>
    </div>
  );
}

// ─── Sub-componente MiniKpi ───────────────────────────────────────────────
function MiniKpi({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className={`flex flex-col gap-1 p-2.5 rounded-xl border transition-colors ${
      ok ? 'border-success/10 bg-success/5' : 'border-error/10 bg-error/5'
    }`}>
      <span className="text-[8px] font-black uppercase tracking-widest text-muted/40">{label}</span>
      <span className={`text-xs font-black tabular-nums ${ok ? 'text-success' : 'text-error'}`}>{value}</span>
    </div>
  );
}
