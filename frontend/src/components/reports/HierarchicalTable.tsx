'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReportNode } from '../../types/api';
import { ChevronRight, ArrowUpRight, List, TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface HierarchicalTableProps {
  nodos: ReportNode[];
}

export default function HierarchicalTable({ nodos }: HierarchicalTableProps) {
  return (
    <div className="flex flex-col gap-6">
      {nodos.map((nodo, idx) => (
        <RootNodeRow key={idx} nodo={nodo} />
      ))}
    </div>
  );
}

function RootNodeRow({ nodo }: { nodo: ReportNode }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { isFtStyle } = useTheme();
  const isIngreso = nodo.nombre.toLowerCase().includes('ingreso');

  return (
    <div className="flex flex-col border border-white/5 rounded-[2rem] overflow-hidden bg-white/[0.02] backdrop-blur-sm transition-all duration-500">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`p-6 flex items-center justify-between cursor-pointer transition-all duration-300 hover:bg-white/[0.04] relative group ${isIngreso ? 'border-l-4 border-imperial-bronze' : 'border-l-4 border-error/50'}`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-500 ${isExpanded ? 'rotate-90' : ''} ${isIngreso ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
            <ChevronRight size={20} />
          </div>
          <div className="flex flex-col">
            <span className={`text-xl font-black tracking-[0.1em] text-imperial-text-prime uppercase ${isFtStyle ? 'font-mono' : ''}`}>{nodo.nombre}</span>
            <span className="text-[10px] uppercase tracking-widest text-imperial-text-mute/40 font-bold">Categoría Principal</span>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden md:flex flex-col items-end opacity-40">
             <span className="text-[10px] uppercase tracking-widest font-black">Estado del Flujo</span>
             <div className="flex items-center gap-1">
                {isIngreso ? <TrendingUp size={12} className="text-success" /> : <TrendingDown size={12} className="text-error" />}
                <span className="text-[10px] font-bold uppercase">{isIngreso ? 'Entrante' : 'Saliente'}</span>
             </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-baseline gap-1">
               <span className="text-xs text-imperial-text-mute/30 font-light">$</span>
               <span className={`text-2xl font-black tracking-tight tabular-nums ${isIngreso ? 'text-success' : 'text-error'} ${isFtStyle ? 'font-mono text-xl' : ''}`}>
                 {nodo.total.toLocaleString()}
               </span>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-col bg-black/10">
          {nodo.hijos.map((cat, idx) => (
            <CategoryRow key={idx} nodo={cat} isIngreso={isIngreso} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryRow({ nodo, isIngreso }: { nodo: ReportNode, isIngreso: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isFtStyle } = useTheme();
  const router = useRouter();

  const handleDrillDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/movimientos?categoria=${encodeURIComponent(nodo.nombre)}`);
  };

  return (
    <div className="border-t border-white/5 overflow-hidden group/cat">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-10 py-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.03] transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
             <ChevronRight size={16} className="text-imperial-bronze/60" />
          </div>
          <span className={`text-sm font-bold text-imperial-text-prime/90 tracking-wide ${isFtStyle ? 'font-mono' : ''}`}>{nodo.nombre}</span>
          
          {nodo.variacion !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${nodo.variacion >= 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'} ${isFtStyle ? 'font-mono' : ''}`}>
              {nodo.variacion > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {Math.abs(nodo.variacion)}%
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <span className={`text-sm font-black text-imperial-text-prime tabular-nums ${isFtStyle ? 'font-mono' : ''}`}>
            ${nodo.total.toLocaleString()}
          </span>
          <button
            onClick={handleDrillDown}
            className="opacity-0 group-hover/cat:opacity-100 transition-all duration-300 w-8 h-8 rounded-lg bg-imperial-bronze/10 text-imperial-bronze hover:bg-imperial-bronze hover:text-black flex items-center justify-center"
            title="Explorar Movimientos"
          >
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-black/10 pb-4 border-b border-white/5 animate-in fade-in slide-in-from-top-1 duration-300">
          {nodo.hijos.map((sub, idx) => (
            <SubCategoryRow key={idx} nodo={sub} isIngreso={isIngreso} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubCategoryRow({ nodo, isIngreso }: { nodo: ReportNode, isIngreso: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isFtStyle } = useTheme();

  return (
    <div className="flex flex-col">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-16 py-3 flex items-center justify-between cursor-pointer hover:text-imperial-bronze transition-all duration-200 border-l border-white/5 ml-12 group/sub"
      >
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isExpanded ? 'bg-imperial-bronze scale-125' : 'bg-white/10'}`}></div>
          <span className={`text-xs text-imperial-text-mute font-medium ${isFtStyle ? 'font-mono uppercase text-[10px]' : ''}`}>{nodo.nombre}</span>
        </div>
        <div className="flex items-center gap-3">
           <span className={`text-xs font-bold text-imperial-text-prime/40 tabular-nums ${isFtStyle ? 'font-mono' : ''}`}>${nodo.total.toLocaleString()}</span>
           <List size={12} className={`opacity-0 group-hover/sub:opacity-40 transition-opacity ${isExpanded ? 'opacity-100 text-imperial-bronze' : ''}`} />
        </div>
      </div>

      {isExpanded && nodo.movimientos.length > 0 && (
        <div className="mx-20 my-4 rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden shadow-inner animate-in zoom-in-95 duration-300">
          <table className="w-full text-left text-[10px]">
            <thead className="bg-white/5 text-imperial-text-mute/40 uppercase tracking-widest font-black">
              <tr>
                <th className="px-6 py-3 font-black">Fecha</th>
                <th className="px-6 py-3 font-black">Identificador / Descripción</th>
                <th className="px-6 py-3 text-right font-black">Magnitud</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {nodo.movimientos.map((m) => (
                <tr key={m.id} className="hover:bg-white/5 transition-colors group/row">
                  <td className="px-6 py-3 text-imperial-text-mute/50 font-mono">{m.fecha}</td>
                  <td className="px-6 py-3 text-imperial-text-prime/70 font-bold uppercase tracking-tight">{m.descripcion}</td>
                  <td className={`px-6 py-3 text-right font-black tabular-nums ${isIngreso ? 'text-success/80' : 'text-error/80'}`}>
                    {isIngreso ? '+' : '-'}${Math.abs(m.monto).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
