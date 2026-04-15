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
import { TrendingUp, Sparkles } from 'lucide-react';
import { ForecastResponse } from '@/types/api';
import BaseCard from '../shared/BaseCard';

interface ForecastChartProps {
  data: ForecastResponse;
}

const ForecastChart: React.FC<ForecastChartProps> = ({ data }) => {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = useMemo(() => {
    if (!data.forecast) return [];

    return data.forecast.map(month => {
      let total_esperado = 0;
      let total_max = 0;
      
      month.forecast.forEach(item => {
        // expected_total can be negative for expenses
        total_esperado += item.expected_total;
        
        // Simular un escenario optimista basado en la confianza
        // Si es ingreso y confianza es baja, el optimista es mayor.
        // Si es egreso y confianza es baja, el optimista (menos egreso) es menor.
        const uncertainty = (1 - item.confidence) * 0.2; // 20% max uncertainty
        if (item.expected_total > 0) {
          total_max += item.expected_total * (1 + uncertainty);
        } else {
          total_max += item.expected_total * (1 - uncertainty);
        }
      });

      return {
        month: month.period,
        monto_proyectado: total_esperado,
        monto_max: total_max,
        name: new Date(month.period + '-01').toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }).toUpperCase()
      };
    });
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-[#131314]/95 backdrop-blur-xl border border-imperial-accent/20 p-4 rounded-2xl shadow-2xl min-w-[200px]">
          <p className="text-[10px] font-black text-imperial-accent uppercase tracking-[0.2em] mb-3 border-b border-white/5 pb-2">
            Proyección {item.month}
          </p>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-imperial-text-mute uppercase tracking-widest">Resultado Esperado</span>
              <span className={`text-[11px] font-black tabular-nums ${item.monto_proyectado >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ${item.monto_proyectado.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-imperial-accent/60 uppercase tracking-widest">Escenario Optimista</span>
              <span className={`text-[11px] font-black tabular-nums ${item.monto_max >= 0 ? 'text-emerald-400/70' : 'text-rose-400/70'}`}>
                ${item.monto_max.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="mt-3 bg-imperial-accent/5 px-2 py-1.5 rounded-lg border border-imperial-accent/10">
             <p className="text-[8px] text-imperial-accent font-black uppercase tracking-tighter italic text-center">
               Cálculo basado en patrones históricos
             </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <BaseCard className="w-full h-full flex flex-col group overflow-hidden border-imperial-bronze/20">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 pointer-events-none">
        <TrendingUp size={120} className="text-imperial-gold" />
      </div>

      <div className="flex justify-between items-start relative z-10 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-imperial-gold animate-pulse" />
            <h3 className="text-imperial-text-prime font-black text-xs uppercase tracking-[0.2em]">Forecasting 3M</h3>
          </div>
          <p className="text-imperial-text-mute/40 text-[9px] font-bold uppercase tracking-[0.3em]">Proyección algorítmica de flujo neto</p>
        </div>
        
        <div className="px-3 py-1 bg-imperial-gold/10 rounded-full border border-imperial-gold/20">
           <span className="text-[8px] font-black text-imperial-gold uppercase tracking-widest">IA Powered</span>
        </div>
      </div>

      <div className="flex-1 h-[300px] relative z-10 -ml-4">
        {isMounted && (
          <ResponsiveContainer width="100%" height="100%" minHeight={0}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--imperial-accent)" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="var(--imperial-accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 800 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 800 }}
                tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
              <Area 
                type="monotone" 
                dataKey="monto_max" 
                stroke="var(--imperial-accent)" 
                strokeDasharray="5 5"
                strokeWidth={1}
                fillOpacity={1} 
                fill="url(#colorMax)" 
                name="Optimista"
              />
              <Area 
                type="monotone" 
                dataKey="monto_proyectado" 
                stroke="var(--imperial-accent)" 
                strokeWidth={4}
                fill="transparent"
                name="Proyectado"
                animationDuration={2500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </BaseCard>
  );
};

export default ForecastChart;
