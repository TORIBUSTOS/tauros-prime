'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  AlertTriangle, Zap, Target, Sparkles, ShieldCheck, HeartPulse, 
  Activity, Coins, Calendar, ArrowRight, TrendingUp, Clock,
  ChevronRight, AlertCircle, Info
} from 'lucide-react';

import { usePeriod } from '@/context/PeriodContext';
import { apiService } from '@/services/api.service';
import { 
  InsightItem, PatronRecurrenteResponse, HormigasResponse, 
  HealthFlagsResponse, ProjectionsResponse 
} from '@/types/api';

import ScoreGauge from '@/components/insights/ScoreGauge';
import BaseCard from '@/components/shared/BaseCard';
import LoadingImperial from '@/components/shared/LoadingImperial';
import EmptyState from '@/components/shared/EmptyState';

export default function InsightsPage() {
  const { selectedPeriod } = usePeriod();
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [patrones, setPatrones] = useState<PatronRecurrenteResponse[]>([]);
  const [hormigas, setHormigas] = useState<HormigasResponse | null>(null);
  const [salud, setSalud] = useState<HealthFlagsResponse | null>(null);
  const [projections, setProjections] = useState<ProjectionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchAllIntelligence() {
      setLoading(true);
      setError(false);
      try {
        const [insData, patData, horData, salData, proData] = await Promise.all([
          apiService.getInsights(selectedPeriod),
          apiService.getPatrones(),
          apiService.getHormigas(),
          apiService.getSalud(),
          apiService.getProjections()
        ]);
        setInsights(insData.insights || []);
        setPatrones(patData || []);
        setHormigas(horData);
        setSalud(salData);
        setProjections(proData);
      } catch (err) {
        console.error('Error loading intelligence data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchAllIntelligence();
  }, [selectedPeriod]);

  // Contenedor para animaciones escalonadas
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

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
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="flex flex-col gap-8 pb-12"
    >
      <header className="flex flex-col gap-2">
        <motion.div variants={itemVariants} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-primary font-bold">
          <div className="w-4 h-[1px] bg-primary/40" />
          Inteligencia Financiera
        </motion.div>
        <motion.h1 variants={itemVariants} className="text-2xl font-black tracking-tight text-text-prime">
          Centro de <span className="text-primary">Comando Cognitivo</span>
        </motion.h1>
        <motion.p variants={itemVariants} className="text-sm text-text-muted max-w-2xl leading-relaxed">
          Análisis avanzado mediante modelos estadísticos para detectar patrones, anomalías y salud financiera en el periodo {selectedPeriod}.
        </motion.p>
      </header>

      {/* == SECCIÓN 1: SALUD FINANCIERA ====================================== */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BaseCard className="lg:col-span-2 overflow-hidden group bg-gradient-to-br from-surface to-surface/50">
          <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-all duration-700 scale-125 pointer-events-none">
            <HeartPulse size={120} className="text-primary" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 text-primary">
                <ShieldCheck size={20} />
              </div>
              <h2 className="text-lg font-bold text-text-prime uppercase tracking-widest">Estado de Salud Digital</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden h-full">
                <ScoreGauge score={salud?.score_general || 0} size={180} />
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="text-[9px] uppercase tracking-widest text-text-muted/40 mb-1 font-bold">Tasa de Ahorro</div>
                    <div className="text-lg font-bold text-text-prime">{((salud?.ahorro_tasa || 0) * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="text-[9px] uppercase tracking-widest text-text-muted/40 mb-1 font-bold">Balance Neto</div>
                    <div className={`text-lg font-bold ${salud?.balance_ingresos_gastos && salud.balance_ingresos_gastos >= 0 ? 'text-success' : 'text-error'}`}>
                      {salud?.balance_ingresos_gastos?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
                
                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                  <div className="text-[9px] uppercase tracking-widest text-primary mb-2 font-bold flex items-center gap-2">
                    <Activity size={10} /> Alertas de Sistema
                  </div>
                  <ul className="space-y-2">
                    {salud?.alertas && salud.alertas.length > 0 ? (
                      salud.alertas.map((alerta, i) => (
                        <li key={i} className="text-xs text-text-muted/90 flex items-start gap-2 leading-tight">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1 shrink-0" />
                          {alerta}
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-success flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-success rounded-full" />
                        No hay alertas críticas detectadas.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        {/* == SECCIÓN 2: GASTO HORMIGA ======================================= */}
        <motion.div variants={itemVariants} className="h-full">
          <BaseCard className="overflow-hidden group border-amber-500/20 bg-gradient-to-br from-surface to-amber-500/5 h-full">
          <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-all duration-700 pointer-events-none">
            <Coins size={100} className="text-amber-500" />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500">
                <Zap size={20} />
              </div>
              <h2 className="text-lg font-bold text-text-prime uppercase tracking-widest">Fuga de Capital</h2>
            </div>
            
            <div className="mb-6">
              <div className="text-[10px] uppercase tracking-widest text-text-muted/60 mb-1 font-black">Impacto Anual Proyectado</div>
              <div className="text-3xl font-black text-amber-500">
                {((hormigas?.total_mensual_hormiga || 0) * 12).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}
              </div>
              <p className="text-[10px] text-text-muted/40 mt-1 italic leading-tight">
                {hormigas?.recomendacion || "Análisis en curso..."}
              </p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[120px] pr-2 custom-scrollbar">
              {hormigas?.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/5">
                  <div>
                    <div className="text-[10px] font-bold text-text-prime uppercase truncate w-24">{item.categoria}</div>
                    <div className="text-[9px] text-text-muted/50">{item.frecuencia_mensual}x al mes</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-amber-500">-${item.monto_promedio}</div>
                    <div className="text-[8px] text-text-muted/40 uppercase tracking-tighter">Promedio</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </BaseCard>
      </div>

        </motion.div>
      </motion.div>

      {/* == SECCIÓN 3: PATRONES RECURRENTES ================================= */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Calendar size={18} />
            </div>
            <h2 className="text-lg font-black text-text-prime uppercase tracking-widest">Patrones de Conducta</h2>
          </div>
          <div className="text-[10px] font-bold text-text-muted/40 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
            {patrones.length} Patrones Activos
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {patrones.map((patron) => (
            <BaseCard key={patron.id} className="group hover:border-primary/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  {patron.frecuencia}
                </div>
                <div className="text-[10px] font-bold text-text-muted/40 uppercase tracking-widest">
                  {(patron.confianza * 100).toFixed(0)}% Confianza
                </div>
              </div>
              <h3 className="text-sm font-bold text-text-prime uppercase tracking-tight mb-1 truncate">{patron.concepto}</h3>
              <div className="text-xl font-black text-text-prime mb-3">
                ${patron.monto_promedio.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                <Calendar size={12} className="text-primary/60" />
                <span className="text-[10px] text-text-muted/70 font-bold">Día {patron.dia_mes || '??'} estimado</span>
              </div>
            </BaseCard>
          ))}
          {patrones.length === 0 && (
            <div className="col-span-full py-8 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
              <p className="text-xs font-bold text-text-muted/30 uppercase tracking-widest">No se han consolidado patrones recurrentes aún.</p>
            </div>
          )}
        </div>
      
      {/* == SECCIÓN 2.5: PROYECCIONES INTELIGENTES =========================== */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <BaseCard className="lg:col-span-3 overflow-hidden bg-gradient-to-r from-surface to-primary/5 border-primary/10 relative">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
            <TrendingUp size={140} className="text-primary" />
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Clock size={18} />
                </div>
                <h2 className="text-sm font-black text-text-prime uppercase tracking-widest">Ritmo de Gasto y Proyección</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-text-muted/60 mb-1 font-bold">Gasto Proyectado a Fin de Mes</div>
                  <div className="text-4xl font-black text-text-prime flex items-baseline gap-2">
                    {projections?.proyeccion_total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}
                    <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">Est.</span>
                  </div>
                  <p className="text-[10px] text-text-muted/50 mt-2 leading-tight max-w-xs">
                    Basado en tu ritmo diario actual de {projections?.dia_del_mes} días transcurridos y compromisos recurrentes detectados.
                  </p>
                </div>
                
                <div className="flex flex-col justify-end gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-text-muted">Gasto Actual</span>
                      <span className="text-text-prime">{projections?.gasto_actual.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(projections?.gasto_actual || 0) / (projections?.proyeccion_total || 1) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" 
                      />
                    </div>
                    <div className="flex justify-between text-[8px] text-text-muted/40 font-bold uppercase">
                      <span>Día {projections?.dia_del_mes}</span>
                      <span>Día 30/31</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard className="bg-surface/30 border-white/5 flex flex-col">
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Calendar size={12} /> Próximos Cargos
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[180px] pr-2 custom-scrollbar">
            {projections?.patrones_pendientes && projections.patrones_pendientes.length > 0 ? (
              projections.patrones_pendientes.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary group-hover:scale-110 transition-transform">
                    {p.dia}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-text-prime truncate uppercase">{p.concepto}</div>
                    <div className="text-[9px] text-text-muted/50 font-bold">${p.monto.toLocaleString('es-AR')}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                <ShieldCheck size={24} className="mb-2" />
                <div className="text-[10px] font-bold uppercase">No hay cargos pendientes detectados</div>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
             <div className="text-[9px] text-text-muted/60 font-bold uppercase tracking-widest flex justify-between">
               <span>Subtotal Pendiente</span>
               <span className="text-text-prime">${projections?.pendientes_recurrentes.toLocaleString('es-AR')}</span>
             </div>
          </div>
        </BaseCard>
      </motion.div>

      {/* == SECCIÓN 4: FEED DE INTELIGENCIA (Hallazgos Puntuales) ========== */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 mt-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Activity size={18} />
          </div>
          <h2 className="text-lg font-black text-text-prime uppercase tracking-widest">Feed de Hallazgos <span className="text-primary">Específicos</span></h2>
        </div>

        {groupedInsights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedInsights.map(({ insight, count }) => (
              <BaseCard
                key={`${insight.type}:${insight.categoria}`}
                className="flex flex-col gap-4 md:gap-6 hover:translate-y-[-4px] transition-transform duration-300 group cursor-pointer border-white/5"
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
          <EmptyState message="El Motor Cognitivo aún no ha detectado anomalías puntuales para este periodo." />
        )}
      </motion.div>
    </motion.div>
  );
}
