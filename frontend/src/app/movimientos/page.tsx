'use client';

import React, { useEffect, useState, Suspense, useMemo } from 'react';
import { usePeriod } from '@/context/PeriodContext';
import { apiService } from '@/services/api.service';
import { MovimientoMapped } from '@/types/api';
import LoadingImperial from '@/components/shared/LoadingImperial';
import EmptyState from '@/components/shared/EmptyState';
import BaseCard from '@/components/shared/BaseCard';
import {
  Search, ArrowDownLeft, ArrowUpRight, Filter, Download,
  Database, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const PAGE_SIZE = 25;

function MovimientosContent() {
  const { selectedPeriod } = usePeriod();
  const searchParams = useSearchParams();
  const categoriaParam = searchParams.get('categoria');
  const tipoParam = searchParams.get('tipo') as 'ingreso' | 'egreso' | null;

  const [movements, setMovements] = useState<MovimientoMapped[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'ingreso' | 'egreso'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Sync URL params → state
  useEffect(() => {
    if (categoriaParam) setSearchTerm(categoriaParam);
    if (tipoParam) setFilterType(tipoParam);
  }, [categoriaParam, tipoParam]);

  useEffect(() => {
    async function fetchMovements() {
      setLoading(true);
      try {
        const data = await apiService.getMovements(selectedPeriod);
        setMovements(data);
        setCurrentPage(1); // reset on period change
      } catch (err) {
        console.error('Error loading movements:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMovements();
  }, [selectedPeriod]);

  // Reset page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  const filteredMovements = useMemo(() =>
    movements.filter(m => {
      const matchesSearch =
        m.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || m.tipo === filterType;
      return matchesSearch && matchesType;
    }),
  [movements, searchTerm, filterType]);

  const totalPages = Math.max(1, Math.ceil(filteredMovements.length / PAGE_SIZE));
  const paginatedMovements = useMemo(
    () => filteredMovements.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredMovements, currentPage],
  );

  const safeSetPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  const exportToCSV = () => {
    if (filteredMovements.length === 0) return;
    
    const headers = ['Fecha', 'Descripción', 'Categoría', 'Subcategoría', 'Tipo', 'Monto', 'Confianza AI'];
    const rows = filteredMovements.map(m => [
      m.fecha,
      `"${m.descripcion.replace(/"/g, '""')}"`,
      m.categoria,
      m.subcategoria || '',
      m.tipo,
      m.monto,
      m.confianza
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `auditoria_tauros_${selectedPeriod}.csv`);
    link.click();
  };

  if (loading) return <LoadingImperial message="Recuperando archivos de la Bóveda..." />;

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-2 duration-1000">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2 border-b border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
            <Database size={12} />
            Registros Históricos
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-text-prime uppercase italic">
            Bóveda de <span className="text-primary not-italic underline decoration-primary/20 underline-offset-8">Movimientos</span>
          </h1>
          <div className="flex items-center gap-2 text-xs text-text-muted/50 font-medium">
            <Calendar size={14} className="text-primary/40" />
            Exploración granular de transacciones para el periodo{' '}
            <span className="text-text-prime font-bold">{selectedPeriod}</span>.
          </div>
        </div>

        <button 
          onClick={exportToCSV}
          className="group flex items-center gap-3 bg-white/[0.02] text-primary text-[10px] font-black px-6 py-3 rounded-xl border border-primary/10 hover:border-primary/40 hover:bg-primary/5 transition-all uppercase tracking-widest shadow-xl"
        >
          <Download size={14} className="transition-transform group-hover:-translate-y-1" />
          Exportar Auditoría
        </button>
      </header>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted/30 group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Buscar por descripción o categoría..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); }}
            className="w-full bg-surface/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-text-prime text-sm font-medium outline-none focus:border-primary/40 focus:bg-surface/60 transition-all placeholder:text-text-muted/20"
          />
        </div>

        <div className="flex p-1.5 bg-surface/40 rounded-2xl border border-white/5 backdrop-blur-md">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'ingreso', label: 'Ingresos' },
            { id: 'egreso', label: 'Egresos' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id as 'all' | 'ingreso' | 'egreso')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                filterType === t.id
                  ? 'bg-primary text-black shadow-primary/30'
                  : 'text-text-muted/40 hover:text-text-prime hover:bg-white/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <BaseCard className="p-0 overflow-hidden border-white/5 bg-surface/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black text-primary uppercase tracking-[0.3em]">Fecha</th>
                <th className="px-8 py-6 text-[10px] font-black text-primary uppercase tracking-[0.3em]">Detalle de Transacción</th>
                <th className="px-8 py-6 text-[10px] font-black text-primary uppercase tracking-[0.3em]">Categoría</th>
                <th className="px-8 py-6 text-[10px] font-black text-primary uppercase tracking-[0.3em]">Validación AI</th>
                <th className="px-8 py-6 text-[10px] font-black text-primary uppercase tracking-[0.3em] text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {paginatedMovements.length > 0
                ? paginatedMovements.map(m => (
                  <tr key={m.id} className="hover:bg-primary/[0.02] transition-colors group cursor-default">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className="text-text-muted/60 font-black text-[11px] uppercase tracking-tighter">
                        {new Date(m.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${m.tipo === 'ingreso' ? 'bg-success/10 text-success' : 'bg-white/5 text-text-muted/40'}`}>
                          {m.tipo === 'ingreso' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <span className="text-text-prime text-sm font-bold truncate max-w-[300px] group-hover:text-primary transition-colors" title={m.descripcion}>
                          {m.descripcion}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-[9px] font-black bg-white/5 text-text-muted/60 uppercase tracking-[0.1em] border border-white/5 group-hover:border-primary/20 transition-colors">
                        {m.categoria}{m.subcategoria && <span className="text-primary opacity-40 ml-1.5">/ {m.subcategoria}</span>}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-16 bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${m.confianza > 0.9 ? 'bg-success' : m.confianza > 0.75 ? 'bg-primary' : 'bg-amber-500'}`}
                            style={{ width: `${m.confianza * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-text-muted/30">{(m.confianza * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right">
                      <span className={`text-sm font-black italic tracking-tighter ${m.tipo === 'ingreso' ? 'text-success' : 'text-error'}`}>
                        {m.tipo === 'egreso' ? '-' : '+'}
                        {Math.abs(m.monto).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}
                      </span>
                    </td>
                  </tr>
                ))
                : (
                  <tr>
                    <td colSpan={5} className="py-32">
                      <EmptyState message="No se encontraron registros en la bóveda para los criterios seleccionados." />
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ── */}
        {filteredMovements.length > 0 && (
          <div className="flex items-center justify-between px-8 py-4 border-t border-white/5 bg-white/[0.01] backdrop-blur-sm">
            {/* Info */}
            <div className="flex items-center gap-2 text-[10px] font-black text-text-muted/30 uppercase tracking-widest">
              <Filter size={11} className="text-primary/40" />
              <span>
                {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredMovements.length)}
                {' '}de{' '}
                <span className="text-primary">{filteredMovements.length}</span> registros
              </span>
            </div>

            {/* Page controls */}
            <div className="flex items-center gap-1">
              <PaginationBtn onClick={() => safeSetPage(1)} disabled={currentPage === 1} title="Primera">
                <ChevronsLeft size={13} />
              </PaginationBtn>
              <PaginationBtn onClick={() => safeSetPage(currentPage - 1)} disabled={currentPage === 1} title="Anterior">
                <ChevronLeft size={13} />
              </PaginationBtn>

              {/* Page numbers */}
              <div className="flex gap-1 mx-1">
                {getPageRange(currentPage, totalPages).map((p, i) =>
                  p === '...' ? (
                    <span key={`dot-${i}`} className="w-8 text-center text-[10px] text-text-muted/20 font-black">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => safeSetPage(p as number)}
                      className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all duration-200 ${
                        currentPage === p
                          ? 'bg-primary text-black shadow-primary/30'
                          : 'text-text-muted/40 hover:bg-white/5 hover:text-text-prime'
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>

              <PaginationBtn onClick={() => safeSetPage(currentPage + 1)} disabled={currentPage === totalPages} title="Siguiente">
                <ChevronRight size={13} />
              </PaginationBtn>
              <PaginationBtn onClick={() => safeSetPage(totalPages)} disabled={currentPage === totalPages} title="Última">
                <ChevronsRight size={13} />
              </PaginationBtn>
            </div>
          </div>
        )}
      </BaseCard>
    </div>
  );
}

/* ── Helpers ── */
function PaginationBtn({ children, onClick, disabled, title }: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted/40 hover:bg-white/5 hover:text-text-prime transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

function getPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

export default function MovimientosPage() {
  return (
    <Suspense fallback={<LoadingImperial message="Preparando Bóveda..." />}>
      <MovimientosContent />
    </Suspense>
  );
}
