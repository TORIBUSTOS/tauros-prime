'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { apiService } from '@/services/api.service';
import { AuditLog } from '@/types/api';
import { Pagination } from '@/components/ui/Pagination';
import LoadingImperial from '@/components/ui/LoadingImperial';
import BaseCard from '@/components/shared/BaseCard';
import {
  History, RefreshCw, Settings, User, Brain, AlertCircle, Database
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const PAGE_SIZE = 20;

function AuditoriaContent() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [loadError, setLoadError] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const data = await apiService.getAuditLogs(currentPage, PAGE_SIZE);
      setLogs(data.items);
      setTotalRecords(data.total);
      setTotalPages(data.total_pages);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading audit logs:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'recategorizacion': return <User size={14} className="text-blue-400" />;
      case 'creacion_regla': return <Brain size={14} className="text-success" />;
      default: return <Settings size={14} className="text-text-muted/40" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'recategorizacion': return 'Ajuste Manual';
      case 'creacion_regla': return 'Aprendizaje AI';
      default: return action;
    }
  };

  if (loading && currentPage === 1 && logs.length === 0) {
    return <LoadingImperial message="Sincronizando registros de auditoría..." />;
  }

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-2 duration-1000">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2 border-b border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
            <History size={12} />
            Libro de Registro
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-text-prime uppercase italic">
            Historial de <span className="text-primary not-italic underline decoration-primary/20 underline-offset-8">Auditoría</span>
          </h1>
          <div className="flex items-center gap-2 text-xs text-text-muted/50 font-medium">
            <AlertCircle size={14} className="text-primary/40" />
            Registro cronológico de ajustes manuales y evolución del motor inteligente.
          </div>
        </div>

        <button 
          onClick={() => { setCurrentPage(1); fetchLogs(); }}
          className="group flex items-center gap-3 bg-white/[0.02] text-primary text-[10px] font-black px-6 py-3 rounded-xl border border-primary/10 hover:border-primary/40 hover:bg-primary/5 transition-all uppercase tracking-widest shadow-xl"
        >
          <RefreshCw size={14} className={`transition-transform ${loading ? 'animate-spin' : 'group-hover:rotate-180 duration-500'}`} />
          Actualizar Logs
        </button>
      </header>

      <BaseCard className="p-0 overflow-hidden border-white/5 bg-surface/20">
        {logs.length > 0 ? (
          <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black text-primary uppercase tracking-[0.3em]">Timestamp</th>
                <th className="px-8 py-6 text-[10px] font-black text-primary uppercase tracking-[0.3em]">Acción</th>
                <th className="px-8 py-6 text-[10px] font-black text-primary uppercase tracking-[0.3em]">Entidad</th>
                <th className="px-8 py-6 text-[10px] font-black text-primary uppercase tracking-[0.3em]">Ajuste Realizado</th>
                <th className="px-8 py-6 text-[10px] font-black text-primary uppercase tracking-[0.3em]">Detalles Técnicos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {logs.map(log => (
                  <tr key={log.id} className="hover:bg-primary/[0.02] transition-colors group cursor-default">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className="text-text-muted/60 font-black text-[11px] uppercase tracking-tighter">
                        {format(new Date(log.timestamp), "dd MMM HH:mm:ss", { locale: es })}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center">
                          {getActionIcon(log.action)}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-prime">
                          {getActionLabel(log.action)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className="text-xs font-bold text-text-muted/40 capitalize italic">
                        {log.entity_type} <span className="text-primary/30 ml-1">#{log.entity_id}</span>
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="text-[10px] font-medium text-text-muted/30 line-through truncate max-w-[200px]">
                          {log.old_value || '---'}
                        </div>
                        <div className="text-xs font-black text-primary uppercase tracking-tight">
                          {log.new_value}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[11px] font-medium text-text-muted/40 leading-relaxed block max-w-xs truncate" title={log.details || ''}>
                        {log.details || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
          </>
        ) : (
          <div className="min-h-[420px] flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
              <Database className="text-primary" size={30} />
            </div>
            <h3 className="text-text-prime font-black text-xl mb-3 uppercase tracking-widest">
              Sin movimientos de auditoría
            </h3>
            <p className="text-text-muted/60 text-sm max-w-xl leading-relaxed">
              La bóveda registra ajustes cuando se recategorizan movimientos, se crean reglas o el motor aprende nuevos patrones. Si acabás de operar, actualizá los logs para confirmar el registro.
            </p>
            <button
              onClick={() => { setCurrentPage(1); fetchLogs(); }}
              className="mt-8 inline-flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/15 transition-all"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Actualizar Logs
            </button>
            <div className="mt-5 text-[10px] font-bold uppercase tracking-widest text-text-muted/35">
              {loadError
                ? 'No se pudo consultar la auditoría. Revisá la conexión con backend.'
                : lastRefresh
                  ? `Última consulta: ${format(lastRefresh, 'dd MMM HH:mm:ss', { locale: es })}`
                  : 'Todavía no se consultaron logs en esta sesión.'}
            </div>
          </div>
        )}
      </BaseCard>
    </div>
  );
}

export default function AuditoriaPage() {
  return (
    <Suspense fallback={<LoadingImperial message="Cargando Auditoría..." />}>
      <AuditoriaContent />
    </Suspense>
  );
}
