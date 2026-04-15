'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart2, ArrowUpRight, Hash, DollarSign } from 'lucide-react';
import { MovimientoMapped } from '@/types/api';
import BaseCard from '@/components/shared/BaseCard';

interface TopCategoriasProps {
  movements: MovimientoMapped[];
  period: string;
}

type ViewMode = 'monto' | 'count';

const ACCENT_COLORS = [
  'bg-imperial-bronze',
  'bg-imperial-gold',
  'bg-amber-600',
  'bg-stone-500',
  'bg-zinc-500',
  'bg-neutral-600',
];

const TopCategorias: React.FC<TopCategoriasProps> = ({ movements, period }) => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('monto');

  const { categorias, totalEgresos, totalCount } = useMemo(() => {
    const egresos = movements.filter(m => m.tipo === 'egreso');
    const total = egresos.reduce((sum, m) => sum + Math.abs(m.monto), 0);

    const mapMonto = new Map<string, number>();
    const mapCount = new Map<string, number>();
    for (const m of egresos) {
      const cat = m.categoria || 'Sin categorizar';
      mapMonto.set(cat, (mapMonto.get(cat) ?? 0) + Math.abs(m.monto));
      mapCount.set(cat, (mapCount.get(cat) ?? 0) + 1);
    }

    const sorted = Array.from(mapMonto.entries())
      .map(([nombre, monto]) => ({
        nombre,
        monto,
        count: mapCount.get(nombre) ?? 0,
        pctMonto: total > 0 ? (monto / total) * 100 : 0,
        pctCount: egresos.length > 0 ? ((mapCount.get(nombre) ?? 0) / egresos.length) * 100 : 0,
      }));

    // Sort by active mode
    sorted.sort((a, b) => viewMode === 'monto' ? b.monto - a.monto : b.count - a.count);

    return { 
      categorias: sorted.slice(0, 6), 
      totalEgresos: total,
      totalCount: egresos.length,
    };
  }, [movements, viewMode]);

  const maxValue = viewMode === 'monto' 
    ? (categorias[0]?.monto ?? 1) 
    : (categorias[0]?.count ?? 1);

  return (
    <BaseCard className="flex flex-col h-full bg-imperial-surface/40">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-imperial-bronze" />
          <h3 className="text-sm font-black text-imperial-text-prime uppercase tracking-widest">
            Top Categorías
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex p-0.5 bg-white/5 rounded-lg border border-white/5">
            <button
              onClick={() => setViewMode('monto')}
              title="Ordenar por monto"
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                viewMode === 'monto'
                  ? 'bg-imperial-bronze/20 text-imperial-bronze shadow-sm'
                  : 'text-imperial-text-muted/30 hover:text-imperial-text-muted/60'
              }`}
            >
              <DollarSign size={10} />
              <span className="hidden sm:inline">Valor</span>
            </button>
            <button
              onClick={() => setViewMode('count')}
              title="Ordenar por cantidad"
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                viewMode === 'count'
                  ? 'bg-imperial-bronze/20 text-imperial-bronze shadow-sm'
                  : 'text-imperial-text-muted/30 hover:text-imperial-text-muted/60'
              }`}
            >
              <Hash size={10} />
              <span className="hidden sm:inline">Qty</span>
            </button>
          </div>
          <button
            onClick={() => router.push('/movimientos')}
            className="text-[10px] font-black text-imperial-bronze hover:text-imperial-text-prime transition-all uppercase tracking-widest border border-imperial-bronze/20 px-3 py-1 rounded-full bg-imperial-bronze/5 hover:bg-imperial-bronze/10"
          >
            Ver Todo
          </button>
        </div>
      </div>

      {categorias.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 py-10">
          <div className="p-3 rounded-full bg-white/5 text-imperial-text-muted/20">
            <BarChart2 size={24} />
          </div>
          <p className="text-xs text-imperial-text-muted/30 italic font-medium uppercase tracking-widest">
            Sin egresos en este período
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 flex-1">
          {categorias.map((cat, i) => {
            const currentValue = viewMode === 'monto' ? cat.monto : cat.count;
            const currentPct = viewMode === 'monto' ? cat.pctMonto : cat.pctCount;
            
            return (
              <button
                key={cat.nombre}
                onClick={() => router.push(`/movimientos?categoria=${encodeURIComponent(cat.nombre)}`)}
                className="group flex items-center gap-3 text-left hover:bg-white/[0.02] rounded-xl p-2 -mx-2 transition-all duration-200"
              >
                {/* Rank */}
                <span className="text-[10px] font-black text-imperial-text-muted/30 w-4 shrink-0 text-center">
                  {i + 1}
                </span>

                {/* Name + bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-[11px] font-black text-imperial-text-prime uppercase tracking-tight truncate group-hover:text-imperial-bronze transition-colors">
                      {cat.nombre}
                    </span>
                    <span className="text-[10px] font-black text-error shrink-0 ml-2 tabular-nums">
                      {viewMode === 'monto' 
                        ? `-${cat.monto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}`
                        : `${cat.count} movs`
                      }
                    </span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${ACCENT_COLORS[i % ACCENT_COLORS.length]}`}
                      style={{ width: `${(currentValue / maxValue) * 100}%` }}
                    />
                  </div>
                </div>

                {/* % */}
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] font-black text-imperial-text-muted/40 tabular-nums">
                    {currentPct.toFixed(1)}%
                  </span>
                  <ArrowUpRight size={10} className="text-imperial-bronze/30 group-hover:text-imperial-bronze transition-colors" />
                </div>
              </button>
            );
          })}

          {/* Total footer */}
          <div className="mt-2 pt-3 border-t border-white/5 flex justify-between items-center">
            <span className="text-[9px] font-black text-imperial-text-muted/30 uppercase tracking-widest">
              {viewMode === 'monto' ? `Total Egresos ${period}` : `Total Movimientos ${period}`}
            </span>
            <span className="text-[11px] font-black text-error tabular-nums">
              {viewMode === 'monto'
                ? `-${totalEgresos.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}`
                : `${totalCount} movs`
              }
            </span>
          </div>
        </div>
      )}
    </BaseCard>
  );
};

export default TopCategorias;
