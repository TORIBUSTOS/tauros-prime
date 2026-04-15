'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownLeft, ReceiptText } from 'lucide-react';
import { MovimientoMapped } from '@/types/api';
import BaseCard from '@/components/shared/BaseCard';
import { useTheme } from '@/context/ThemeContext';

interface RecentTransactionsProps {
  movements: MovimientoMapped[];
  limit?: number;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ movements, limit }) => {
  const { currentTheme } = useTheme();
  const displayedMovements = limit ? movements.slice(0, limit) : movements;

  return (
    <BaseCard className="transactions-container flex flex-col h-full bg-imperial-surface/40 transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <ReceiptText className="w-5 h-5 text-imperial-bronze" />
          <h3 className="text-sm font-black text-imperial-text-prime uppercase tracking-widest">
            Bóveda Reciente
          </h3>
        </div>
        <a 
          href="/movimientos"
          className="text-[10px] font-black text-imperial-bronze hover:text-imperial-text-prime transition-all uppercase tracking-widest border border-imperial-bronze/20 px-3 py-1 rounded-full bg-imperial-bronze/5 hover:bg-imperial-bronze/10"
        >
          Expediente Completo
        </a>
      </div>
      
      <div className={`transactions-list flex-1 ${!limit ? 'overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
        {movements.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
            <div className="p-3 rounded-full bg-white/5 text-imperial-text-muted/20">
              <ReceiptText size={24} />
            </div>
            <p className="text-xs text-imperial-text-muted/30 italic font-medium uppercase tracking-widest">
              Sin movimientos registrados
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedMovements.map((m) => (
              <div 
                key={m.id} 
                className="transaction-item group flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-white/5 hover:bg-white/[0.02] transition-all duration-300"
              >
                <div className={`
                  icon-container w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110
                  ${m.tipo === 'ingreso' ? 'ingreso bg-success/10 text-success' : 'egreso bg-white/5 text-imperial-text-muted/60'}
                `}>
                  {m.tipo === 'ingreso' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </div>
                
                <div className="transaction-info flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p 
                      className="text-sm font-bold text-imperial-text-prime truncate group-hover:text-imperial-bronze transition-colors"
                      title={m.descripcion}
                    >
                      {m.descripcion}
                    </p>
                    <p className={`transaction-amount text-sm font-black italic shrink-0 ${m.tipo === 'ingreso' ? 'ingreso text-success' : 'egreso text-error'}`}>
                      {m.tipo === 'egreso' ? '-' : '+'}{Math.abs(m.monto).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                      <span className="transaction-category text-[10px] font-black text-imperial-text-muted/40 uppercase tracking-widest">
                        {m.categoria}
                      </span>
                      {m.confianza < 0.8 && (
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 rounded-full bg-amber-500" />
                          <span className="text-[9px] font-bold text-amber-500/70 uppercase">
                            AI {(m.confianza * 100).toFixed(0)}% confianza
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="date text-[10px] font-medium text-imperial-text-muted/30 uppercase">
                      {new Date(m.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(192, 152, 145, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(192, 152, 145, 0.2);
        }
      `}</style>
    </BaseCard>
  );
};

export default RecentTransactions;
