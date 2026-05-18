'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Sector,
} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { PLReportResponse } from '@/types/api';
import BaseCard from '../shared/BaseCard';

interface CategoryPieChartProps {
  data: PLReportResponse | null;
}

const CHART_COLORS = [
  'oklch(70% 0.14 290)',
  'oklch(79% 0.12 82)',
  'oklch(76% 0.155 145)',
  'oklch(70% 0.14 290 / 0.7)',
  'oklch(79% 0.12 82 / 0.6)',
  'oklch(52% 0.10 285)',
];

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [view, setView] = useState<'egresos' | 'ingresos'>('egresos');
  const [activeIndex, setActiveIndex] = useState(-1);

  const chartData = useMemo(() => {
    if (!data || !data.nodos) return [];
    
    // El nodo 0 suele ser INGRESOS, el 1 EGRESOS
    const node = view === 'ingresos' ? data.nodos[0] : data.nodos[1];
    if (!node || !node.hijos) return [];

    return node.hijos
      .map(cat => ({
        name: cat.nombre,
        value: cat.total,
        percentage: (cat.total / node.total) * 100
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [data, view]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cosVal = Math.cos(-RADIAN * midAngle);
    
    const sx = cx + (outerRadius + 10) * cosVal;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 25) * cosVal;
    const my = cy + (outerRadius + 25) * sin;
    const ex = mx + (cosVal >= 0 ? 1 : -1) * 20;
    const ey = my;
    const textAnchor = cosVal >= 0 ? 'start' : 'end';

    return (
      <g>
        <text 
          x={cx} 
          y={cy} 
          dy={8} 
          textAnchor="middle" 
          fill={fill} 
          className="font-black text-[10px] uppercase tracking-[0.2em]"
        >
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          className="opacity-90"
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 8}
          outerRadius={outerRadius + 10}
          fill={fill}
          className="opacity-40"
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} strokeWidth={1} fill="none" opacity={0.5} />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text 
          x={ex + (cosVal >= 0 ? 1 : -1) * 12} 
          y={ey} 
          textAnchor={textAnchor} 
          fill="var(--text-prime)" 
          className="font-black text-[11px] tabular-nums tracking-tight"
        >
          {`$${value.toLocaleString()}`}
        </text>
        <text 
          x={ex + (cosVal >= 0 ? 1 : -1) * 12} 
          y={ey} 
          dy={14} 
          textAnchor={textAnchor} 
          fill={fill} 
          className="font-bold text-[9px] uppercase tracking-widest opacity-60"
        >
          {`(${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    );
  };

  return (
    <BaseCard className="w-full h-full flex flex-col group overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 pointer-events-none">
        <PieIcon size={120} className="text-primary" />
      </div>

      <div className="flex justify-between items-start relative z-10 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <PieIcon size={16} className="text-primary" />
            <h3 className="text-text-prime font-black text-xs uppercase tracking-[0.2em]">Distribución de Capital</h3>
          </div>
          <p className="text-text-muted/40 text-[9px] font-bold uppercase tracking-[0.3em]">Peso relativo por categoría</p>
        </div>
        
        <div className="flex bg-surface-deep/60 backdrop-blur-md rounded-xl p-1 border border-white/5 ring-1 ring-white/5">
          <button 
            onClick={() => setView('egresos')}
            className={`px-4 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-[0.15em] transition-all ${
                view === 'egresos' 
                ? 'bg-primary text-background' 
                : 'text-text-muted/40 hover:text-text-prime hover:bg-white/5'
            }`}
          >
            Egresos
          </button>
          <button 
            onClick={() => setView('ingresos')}
            className={`px-4 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-[0.15em] transition-all ${
                view === 'ingresos' 
                ? 'bg-primary text-background' 
                : 'text-text-muted/40 hover:text-text-prime hover:bg-white/5'
            }`}
          >
            Ingresos
          </button>
        </div>
      </div>

      <div className="min-h-[300px] w-full relative z-10">
        {!data ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-30 italic text-sm text-text-muted">
             <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
             Cargando inteligencia maestra...
           </div>
        ) : chartData.length === 0 ? (
           <div className="absolute inset-0 flex items-center justify-center opacity-30 italic text-sm text-text-muted">
             Sin movimientos registrados en este periodo
           </div>
        ) : (
          isMounted && (
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_220px] gap-4 items-center">
              <div className="h-[260px] min-w-0">
                <ResponsiveContainer width="100%" height="100%" minHeight={0}>
                  <PieChart>
                    <Pie
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      {...({ activeIndex, activeShape: renderActiveShape } as any)}
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={82}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                      onMouseLeave={() => setActiveIndex(-1)}
                      paddingAngle={4}
                      stroke="rgba(0,0,0,0.2)"
                      strokeWidth={2}
                      className="cursor-pointer"
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          className="hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => Number(value ?? 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}
                      contentStyle={{
                        background: 'rgba(0,0,0,0.9)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 8,
                        color: 'var(--text-prime)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2">
                {chartData.slice(0, 6).map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/20 px-3 py-2">
                    <div
                      className="w-2 h-8 rounded-full shrink-0"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-black uppercase tracking-[0.08em] text-text-prime">
                        {entry.name}
                      </p>
                      <p className="text-[9px] font-bold text-text-muted/55 tabular-nums">
                        {entry.percentage.toFixed(1)}% del total
                      </p>
                    </div>
                    <span className="text-[10px] font-black text-primary tabular-nums">
                      {entry.value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </BaseCard>
  );
};

export default CategoryPieChart;
