'use client';

import React, { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Activity } from 'lucide-react';
import { MovimientoMapped } from '@/types/api';
import BaseCard from '../shared/BaseCard';

interface FlowChartProps {
  movements: MovimientoMapped[];
  period: string;
}

const FlowChart: React.FC<FlowChartProps> = ({ movements, period }) => {
  const [isMounted, setIsMounted] = React.useState(false);
  
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = useMemo(() => {
    if (!movements.length) return [];

    const days: Record<string, { dia: string, neto: number, ingresos: number, egresos: number }> = {};
    
    const [year, month] = period.split('-').map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    
    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${period}-${String(d).padStart(2, '0')}`;
      days[dateStr] = { dia: String(d), neto: 0, ingresos: 0, egresos: 0 };
    }

    movements.forEach(m => {
      const date = m.fecha.substring(0, 10);
      if (days[date]) {
        if (m.monto > 0) {
          days[date].ingresos += m.monto;
        } else {
          days[date].egresos += Math.abs(m.monto);
        }
        days[date].neto += m.monto;
      }
    });

    let cumulative = 0;
    return Object.keys(days).sort().map(key => {
      cumulative += days[key].neto;
      return {
        ...days[key],
        date: key,
        balance: cumulative
      };
    });
  }, [movements, period]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface/90 backdrop-blur-xl border border-white/10 p-4 rounded-[var(--radius-card)] shadow-2xl min-w-[180px]">
          <p className="text-[10px] font-black text-muted/40 uppercase tracking-[0.2em] mb-3 border-b border-white/5 pb-2">
            Día {data.dia} • {data.date}
          </p>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-emerald-400/60 uppercase tracking-widest">Ingresos</span>
              <span className="text-[11px] font-black text-emerald-400 tabular-nums">
                +${data.ingresos.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-rose-400/60 uppercase tracking-widest">Egresos</span>
              <span className="text-[11px] font-black text-rose-400 tabular-nums">
                -${data.egresos.toLocaleString()}
              </span>
            </div>
            <div className="mt-1 pt-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Balance Acum.</span>
              <span className="text-sm font-black text-prime tabular-nums">
                ${data.balance.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <BaseCard className="w-full h-full flex flex-col group overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 pointer-events-none">
        <Activity size={120} className="text-primary" />
      </div>

      <div className="flex justify-between items-start relative z-10 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className="text-primary" />
            <h3 className="text-prime font-black text-xs uppercase tracking-[0.2em]">Evolución Balance</h3>
          </div>
          <p className="text-muted/40 text-[9px] font-bold uppercase tracking-[0.3em]">Flujo de capital acumulado en el periodo</p>
        </div>
        
        <div className="flex items-center gap-4 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--p-primary-rgb),0.4)]"></div>
              <span className="text-[9px] font-black text-prime uppercase tracking-widest">Neto General</span>
           </div>
        </div>
      </div>

      <div className="flex-1 h-[300px] relative z-10 -ml-4">
        {isMounted && (
          <ResponsiveContainer width="100%" height="100%" minHeight={0}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis 
                dataKey="dia" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 700 }}
                dy={10}
                interval={4}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 700 }}
                tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(var(--p-primary-rgb),0.2)', strokeWidth: 1 }} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="var(--primary)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorBalance)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </BaseCard>
  );
};

export default FlowChart;
