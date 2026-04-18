'use client';

import React, { useMemo, useState } from 'react';
import { MovimientoMapped } from '@/types/api';
import { Bug, ArrowRight, TrendingDown, Target, ChevronLeft, Calendar, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/context/ToastContext';
import BaseCard from '../shared/BaseCard';

interface HormigaAnalysisProps {
  movements: MovimientoMapped[];
}

const HormigaAnalysis: React.FC<HormigaAnalysisProps> = ({ movements }) => {
  const [selectedDesc, setSelectedDesc] = useState<string | null>(null);
  const { showToast } = useToast();

  const hormigas = useMemo(() => {
    const egresos = movements.filter(m => m.monto < 0);
    const groups: Record<string, { count: number, total: number, categoria: string }> = {};
    
    egresos.forEach(m => {
      const desc = m.descripcion;
      if (!groups[desc]) {
        groups[desc] = { count: 0, total: 0, categoria: m.categoria };
      }
      groups[desc].count += 1;
      groups[desc].total += Math.abs(m.monto);
    });

    return Object.entries(groups)
      .map(([desc, data]) => ({
        descripcion: desc,
        ...data,
        average: data.total / data.count
      }))
      .filter(h => h.count >= 2 || (h.average < 10000 && h.count >= 1))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [movements]);

  const selectedDetails = useMemo(() => {
    if (!selectedDesc) return [];
    return movements
      .filter(m => m.descripcion === selectedDesc)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [selectedDesc, movements]);

  const totalPossibleSavings = hormigas.reduce((acc, h) => acc + h.total, 0);

  const handleOptimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    showToast('La IA ha marcado estos egresos para optimización en tu próximo plan financiero.', 'success');
  };

  return (
    <BaseCard className="w-full h-full flex flex-col gap-6 group overflow-hidden relative border-primary/10">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 pointer-events-none">
        <Bug size={120} className="text-primary" />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Bug size={16} className="text-primary" />
            <h3 className="text-text-prime font-black text-xs uppercase tracking-[0.2em]">Fugas de Capital (Hormiga)</h3>
          </div>
          <p className="text-text-muted/40 text-[9px] font-bold uppercase tracking-[0.3em]">
            {selectedDesc ? `Detalle: ${selectedDesc}` : 'Análisis de egresos recurrentes de baja magnitud'}
          </p>
        </div>
        
        {selectedDesc && (
          <button 
            onClick={() => setSelectedDesc(null)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all text-[9px] font-black uppercase tracking-widest text-text-prime"
          >
            <ChevronLeft size={12} />
            Volver
          </button>
        )}
      </div>

      <div className="relative flex-1 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {!selectedDesc ? (
            <motion.div 
              key="list"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="flex flex-col gap-3 h-full overflow-y-auto pr-1 custom-scrollbar"
            >
              {hormigas.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-30 italic text-sm text-text-muted py-8">
                  <Target size={32} className="mb-4 opacity-20" />
                  No se detectaron fugas relevantes
                </div>
              ) : (
                hormigas.map((h, i) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedDesc(h.descripcion)}
                    className="flex items-center justify-between p-4 bg-surface/40 rounded-2xl border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 group/item text-left w-full"
                  >
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <span className="text-text-prime text-[11px] font-black uppercase truncate tracking-tight group-hover/item:text-primary transition-colors flex items-center gap-2">
                        {h.descripcion}
                        <ExternalLink size={10} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-text-muted/40 font-bold uppercase tracking-widest">{h.categoria}</span>
                        <div className="w-1 h-1 rounded-full bg-white/10"></div>
                        <span className="text-[9px] text-primary/70 font-black uppercase">
                          {h.count}x transacciones
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col shrink-0">
                      <span className="text-error font-black text-sm tabular-nums tracking-tighter">
                        -${h.total.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-text-muted/30 font-bold uppercase tracking-widest">Impacto Mes</span>
                    </div>
                  </button>
                ))
              )}

              {hormigas.length > 0 && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mt-auto p-4 bg-primary/5 border border-primary/10 rounded-2xl relative group-hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                     <TrendingDown size={14} className="text-primary" />
                     <span className="text-[10px] font-black text-primary uppercase tracking-widest">Potencial de Optimización</span>
                  </div>
                  <p className="text-[11px] text-text-prime/70 italic leading-snug">
                    La eliminación estratégica de estas fugas redireccionaría <b className="text-primary not-italic">${totalPossibleSavings.toLocaleString()}</b> a tu balance este mes.
                  </p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="details"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="flex flex-col h-full gap-4"
            >
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
                {selectedDetails.map((mov, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/2 rounded-xl border border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-text-prime font-bold uppercase">{mov.categoria}</span>
                      <div className="flex items-center gap-2 text-[8px] text-text-muted/50 font-black uppercase">
                        <Calendar size={8} />
                        {new Date(mov.fecha).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="text-[11px] font-black tabular-nums text-error">
                      -${Math.abs(mov.monto).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleOptimize}
                className="w-full py-3 bg-primary text-background font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gold transition-colors flex items-center justify-center gap-2"
              >
                <Target size={14} />
                Optimizar Egresos Recurrentes
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BaseCard>
  );
};

export default HormigaAnalysis;
