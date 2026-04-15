'use client';

import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api.service';
import { PLReportResponse } from '../../types/api';
import HierarchicalTable from '../../components/reports/HierarchicalTable';
import { usePeriod } from '@/context/PeriodContext';
import { useTheme } from '@/context/ThemeContext';
import BaseCard from '@/components/shared/BaseCard';
import LoadingImperial from '@/components/shared/LoadingImperial';
import { Download, FileText, ChevronRight } from 'lucide-react';

export default function ReportesPage() {
  const [report, setReport] = useState<PLReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedPeriod } = usePeriod();
  const { currentTheme } = useTheme();
  const isFtStyle = currentTheme === 'finance-first';

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const data = await apiService.getReportPL(selectedPeriod);
        setReport(data);
        setError(null);
      } catch (err) {
        setError('No se pudo cargar el reporte de P&L. Verifica la conexión con el backend.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [selectedPeriod]);

  if (loading) return <LoadingImperial message="Extrayendo datos de la Bóveda Financiera..." />;

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-imperial-bronze font-bold">
            <div className="w-4 h-[1px] bg-imperial-bronze/40"></div>
            Estados Financieros
          </div>
          <h1 className={`text-2xl font-black tracking-tight text-imperial-text-prime ${isFtStyle ? 'font-mono' : ''}`}>
            Reporte <span className="text-imperial-bronze italic">P&L</span>
          </h1>
          <p className="text-sm text-imperial-text-mute max-w-md leading-relaxed">
            Desglose detallado de rentabilidad, costos operativos y flujos de caja del periodo {selectedPeriod}.
          </p>
        </div>

        <div className="flex items-center gap-4 p-1 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
          <div className="text-imperial-bronze text-[10px] font-black px-6 py-3 uppercase tracking-[0.2em] border-r border-white/10 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-imperial-bronze animate-pulse"></div>
             {selectedPeriod}
          </div>
          <button className="text-imperial-text-prime text-[10px] font-black px-6 py-3 rounded-xl hover:bg-imperial-bronze hover:text-black transition-all uppercase tracking-widest flex items-center gap-2 group">
            <Download size={14} className="group-hover:scale-110 transition-transform" />
            Exportar
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard 
            title="Ingresos Totales" 
            value={report.ingresos_total} 
            color="text-imperial-bronze" 
            label="Total facturado en el periodo"
            icon={<FileText size={18} className="text-imperial-bronze opacity-50" />}
          />
          <SummaryCard 
            title="Egresos Totales" 
            value={report.egresos_total} 
            color="text-imperial-text-prime" 
            label="Total costos y gastos operativos"
            icon={<FileText size={18} className="text-imperial-text-prime opacity-50" />}
          />
          <SummaryCard 
            title="Resultado Neto" 
            value={report.resultado_neto} 
            color={report.resultado_neto >= 0 ? "text-success" : "text-error"} 
            label="Utilidad balance final"
            highlight={true}
            icon={<ChevronRight size={18} className={report.resultado_neto >= 0 ? "text-success" : "text-error"} />}
          />
        </div>
      )}

      {/* Main Table Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-imperial-bronze/50 rounded-full"></div>
              <h3 className="text-xs uppercase tracking-[0.3em] text-imperial-text-mute font-black">Estructura Jerárquica</h3>
           </div>
          <span className="text-[10px] text-imperial-text-mute/30 font-bold uppercase tracking-widest">Interactúa con las filas para expandir</span>
        </div>

        {error ? (
          <BaseCard className="p-12 text-center border-rose-500/20 bg-rose-500/5">
            <span className="text-rose-400 text-sm font-bold tracking-tight">{error}</span>
          </BaseCard>
        ) : report && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-1000">
            <HierarchicalTable nodos={report.nodos} />
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, color, label, highlight = false, icon }: any) {
  const { isFtStyle } = useTheme();
  return (
    <BaseCard className={`flex flex-col gap-4 relative overflow-hidden group ${highlight ? 'border-imperial-bronze/30 shadow-[0_0_50px_-12px_rgba(192,152,145,0.05)]' : ''}`}>
      {highlight && (
         <div className="absolute -right-4 -top-4 w-24 h-24 bg-imperial-bronze/5 rounded-full blur-3xl group-hover:bg-imperial-bronze/10 transition-colors"></div>
      )}
      
      <div className="flex justify-between items-center relative z-10">
        <span className={`text-[10px] uppercase tracking-[0.2em] text-imperial-text-mute font-black ${isFtStyle ? 'font-mono' : ''}`}>{title}</span>
        {icon}
      </div>

      <div className="flex flex-col relative z-10">
        <div className="flex items-baseline gap-1">
          <span className="text-imperial-text-mute/30 text-xl font-light">$</span>
          <span className={`text-2xl font-black tracking-tighter tabular-nums ${color} drop-shadow-sm ${isFtStyle ? 'font-mono text-xl' : ''}`}>
            {value.toLocaleString()}
          </span>
        </div>
        <span className="text-[10px] text-imperial-text-mute/40 mt-1 font-bold uppercase tracking-wider">{label}</span>
      </div>
    </BaseCard>
  );
}
