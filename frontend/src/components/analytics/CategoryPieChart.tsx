'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Sector,
  Legend
} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { PLReportResponse } from '@/types/api';
import BaseCard from '../shared/BaseCard';

interface CategoryPieChartProps {
  data: PLReportResponse | null;
}

const IMPERIAL_COLORS = [
  'var(--imperial-bronze)',
  'var(--imperial-gold)',
  'var(--imperial-bronze-muted)',
  'var(--imperial-gold-muted)',
  '#BEA8A7', // Muted text color
  '#7D5A50', // Earth
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
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 25) * cos;
    const my = cy + (outerRadius + 25) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 20;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

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
          x={ex + (cos >= 0 ? 1 : -1) * 12} 
          y={ey} 
          textAnchor={textAnchor} 
          fill="#FFF" 
          className="font-black text-[11px] tabular-nums tracking-tight"
        >
          {`$${value.toLocaleString()}`}
        </text>
        <text 
          x={ex + (cos >= 0 ? 1 : -1) * 12} 
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
        <PieIcon size={120} className="text-imperial-bronze" />
      </div>

      <div className="flex justify-between items-start relative z-10 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <PieIcon size={16} className="text-imperial-bronze" />
            <h3 className="text-imperial-text-prime font-black text-xs uppercase tracking-[0.2em]">Distribución de Capital</h3>
          </div>
          <p className="text-imperial-text-mute/40 text-[9px] font-bold uppercase tracking-[0.3em]">Peso relativo por categoría</p>
        </div>
        
        <div className="flex bg-[#131314]/60 backdrop-blur-md rounded-xl p-1 border border-white/5 ring-1 ring-white/5">
          <button 
            onClick={() => setView('egresos')}
            className={`px-4 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-[0.15em] transition-all ${
                view === 'egresos' 
                ? 'bg-imperial-bronze text-black' 
                : 'text-imperial-text-mute/40 hover:text-imperial-text-prime hover:bg-white/5'
            }`}
          >
            Egresos
          </button>
          <button 
            onClick={() => setView('ingresos')}
            className={`px-4 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-[0.15em] transition-all ${
                view === 'ingresos' 
                ? 'bg-imperial-bronze text-black' 
                : 'text-imperial-text-mute/40 hover:text-imperial-text-prime hover:bg-white/5'
            }`}
          >
            Ingresos
          </button>
        </div>
      </div>

      <div className="flex-1 h-[340px] relative z-10">
        {!data ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-30 italic text-sm text-imperial-text-mute">
             <div className="w-8 h-8 rounded-full border-2 border-imperial-bronze/20 border-t-imperial-bronze animate-spin" />
             Cargando inteligencia maestra...
           </div>
        ) : chartData.length === 0 ? (
           <div className="absolute inset-0 flex items-center justify-center opacity-30 italic text-sm text-imperial-text-mute">
             Sin movimientos registrados en este periodo
           </div>
        ) : (
          isMounted && (
            <ResponsiveContainer width="100%" height="100%" minHeight={0}>
              <PieChart>
                <Pie
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({ activeIndex, activeShape: renderActiveShape } as any)}
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
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
                      fill={IMPERIAL_COLORS[index % IMPERIAL_COLORS.length]}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  content={(props) => {
                    const { payload } = props;
                    return (
                      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8">
                        {payload?.map((entry: any, index: number) => (
                          <div key={`item-${index}`} className="flex items-center gap-2 group/legend cursor-default">
                            <div 
                              className="w-2 h-2 rounded-full transition-transform group-hover/legend:scale-125" 
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-[9px] font-bold text-imperial-text-mute/50 uppercase tracking-[0.15em] transition-colors group-hover/legend:text-imperial-text-prime">
                              {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )
        )}
      </div>
    </BaseCard>
  );
};

export default CategoryPieChart;
