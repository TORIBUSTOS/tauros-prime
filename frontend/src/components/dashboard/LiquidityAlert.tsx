'use client';

import React from 'react';
import { AlertTriangle, TrendingDown, ShieldAlert } from 'lucide-react';
import BaseCard from '@/components/shared/BaseCard';
import { useTheme } from '@/context/ThemeContext';

interface LiquidityAlertProps {
  currentBalance: number;
  projectedBalance: number;
  confidence: number;
}

const LiquidityAlert: React.FC<LiquidityAlertProps> = ({
  currentBalance,
  projectedBalance,
  confidence
}) => {
  const { currentTheme } = useTheme();
  const isCritical = projectedBalance < 0;
  const isWarning = !isCritical && projectedBalance < currentBalance * 0.2;

  if (!isCritical && !isWarning) return null;

  return (
    <BaseCard className={`h-full border-l-4 ${isCritical ? 'border-l-error bg-error/5 critical' : 'border-l-imperial-bronze bg-imperial-bronze/5 warning'} transition-all duration-500 hover:scale-[1.01] liquidity-alert animate-in`}>
      <div className="flex flex-col h-full justify-between gap-4 alert-content">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isCritical ? 'bg-error text-white animate-pulse' : 'bg-imperial-bronze/20 text-imperial-bronze'} alert-icon`}>
              {isCritical ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div>
              <h3 className={`text-sm font-black uppercase tracking-widest ${isCritical ? 'text-error' : 'text-imperial-text-prime'}`}>
                {isCritical ? 'Riesgo de Liquidez Crítico' : 'Alerta de Disponibilidad'}
              </h3>
              <p className="text-[10px] font-bold text-imperial-text-muted/40 uppercase tracking-tighter">
                Análisis Predictivo TAUROS
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-imperial-text-muted/30 uppercase tracking-widest">Confianza</span>
            <span className={`text-xs font-black confidence-value ${confidence > 0.8 ? 'text-success' : 'text-amber-500'}`}>
              {Math.round(confidence * 100)}%
            </span>
          </div>
        </div>
        
        <div className="flex-1 py-2 alert-body">
          <p className="text-sm font-medium leading-relaxed text-imperial-text-muted/80 liquidity-message">
            {isCritical 
              ? <>La bóveda proyecta un <span className="text-error font-bold">déficit</span> de <span className="text-imperial-text-prime font-black font-mono">{Math.abs(projectedBalance).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span> para el cierre de ciclo.</>
              : <>El flujo proyectado indica una caída por debajo del <span className="text-imperial-bronze font-bold">Umbral Imperial (20%)</span>. Se recomienda revisar egresos.</>}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5 alert-footer">
          <div className="flex items-center gap-2">
            <TrendingDown className={`w-4 h-4 ${isCritical ? 'text-error' : 'text-imperial-bronze'}`} />
            <span className="text-[10px] font-bold text-imperial-text-muted/40 uppercase">Tendencia Negativa Detectada</span>
          </div>
          <button className={`
            px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 mitigate-button
            ${isCritical 
              ? 'bg-error text-white hover:bg-error/80 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
              : 'border border-imperial-bronze text-imperial-bronze hover:bg-imperial-bronze hover:text-black'}
          `}>
            Mitigar Riesgo
          </button>
        </div>
      </div>
      {/* Elemento para satisfy .alert-blur selector si es necesario, aunque no tenga efecto visual fuerte */}
      <div className="alert-blur hidden"></div>
    </BaseCard>
  );
};

export default LiquidityAlert;
