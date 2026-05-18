'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  CircleSlash,
  Eye,
  FileWarning,
  GitBranchPlus,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

import BaseCard from '@/components/shared/BaseCard';
import { apiService } from '@/services/api.service';
import { InsightCandidate, InsightReviewStatus, MovimientoResponse } from '@/types/api';

const reviewActions: Array<{
  status: InsightReviewStatus;
  label: string;
  icon: typeof CheckCircle2;
  className: string;
}> = [
  { status: 'approved', label: 'Aprobar', icon: CheckCircle2, className: 'text-success border-success/20 hover:bg-success/10' },
  { status: 'rejected', label: 'Rechazar', icon: XCircle, className: 'text-error border-error/20 hover:bg-error/10' },
  { status: 'ignored', label: 'Ignorar', icon: CircleSlash, className: 'text-text-muted border-white/10 hover:bg-white/10' },
  { status: 'converted_to_rule', label: 'Convertir', icon: GitBranchPlus, className: 'text-primary border-primary/20 hover:bg-primary/10' },
];

const formatMoney = (value: number) =>
  value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  });

const severityClass: Record<string, string> = {
  critical: 'text-error bg-error/10 border-error/20',
  high: 'text-error bg-error/10 border-error/20',
  medium: 'text-amber-300 bg-amber-400/10 border-amber-400/20',
  low: 'text-blue-300 bg-blue-400/10 border-blue-400/20',
  info: 'text-primary bg-primary/10 border-primary/20',
};

function CandidateCard({
  candidate,
  isUpdating,
  onReview,
}: {
  candidate: InsightCandidate;
  isUpdating: boolean;
  onReview: (id: number, status: InsightReviewStatus) => void;
}) {
  const data = candidate.datos_utilizados || {};
  const amount = data.current_total_abs ?? data.current_income ?? data.total_abs;
  const baseline = data.baseline_avg_abs ?? data.baseline_share_pct;

  return (
    <BaseCard className="p-0 overflow-hidden border-white/5 bg-surface/30">
      <div className="p-5 md:p-6 flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
                {candidate.periodo_analizado}
              </span>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${severityClass[candidate.severidad] || severityClass.info}`}>
                {candidate.severidad}
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border border-white/10 text-text-muted bg-white/5">
                {candidate.tipo}
              </span>
            </div>
            <h3 className="text-base md:text-lg font-black text-text-prime uppercase tracking-tight leading-snug">
              {candidate.titulo}
            </h3>
            <p className="text-sm text-text-muted/70 mt-2 leading-relaxed">
              {candidate.descripcion}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 md:min-w-[220px]">
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
              <div className="text-[8px] font-black uppercase tracking-widest text-text-muted/40">Actual</div>
              <div className="text-sm font-black text-text-prime mt-1">
                {typeof amount === 'number' ? formatMoney(amount) : data.share_pct ? `${data.share_pct}%` : '-'}
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
              <div className="text-[8px] font-black uppercase tracking-widest text-text-muted/40">Baseline</div>
              <div className="text-sm font-black text-text-prime mt-1">
                {typeof baseline === 'number'
                  ? data.baseline_share_pct
                    ? `${baseline}%`
                    : formatMoney(baseline)
                  : '-'}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-primary/10 bg-primary/[0.03] p-4">
          <div className="text-[9px] font-black uppercase tracking-[0.25em] text-primary mb-2">
            Explicación
          </div>
          <p className="text-xs md:text-sm text-text-muted/75 leading-relaxed">
            {candidate.explicacion}
          </p>
          <div className="mt-3 text-xs font-bold text-text-prime/80">
            {candidate.accion_sugerida}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {reviewActions.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.status}
                disabled={isUpdating}
                onClick={() => onReview(candidate.id, action.status)}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-40 ${action.className}`}
              >
                <Icon size={13} />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </BaseCard>
  );
}

function UncategorizedPanel({ movements }: { movements: MovimientoResponse[] }) {
  if (movements.length === 0) return null;

  return (
    <BaseCard className="border-error/20 bg-error/[0.03]">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center text-error shrink-0">
          <FileWarning size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-error mb-2">
            Bandeja sin categoría
          </div>
          <h3 className="text-lg font-black text-text-prime uppercase tracking-tight">
            {movements.length} movimiento pendiente
          </h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {movements.slice(0, 4).map(movement => (
              <div key={movement.id} className="rounded-xl border border-white/5 bg-black/20 p-3">
                <div className="text-[10px] font-black text-text-muted/50 uppercase tracking-widest">
                  #{movement.id} · {movement.fecha}
                </div>
                <div className="text-xs text-text-prime font-bold mt-1 truncate" title={movement.descripcion}>
                  {movement.descripcion}
                </div>
                <div className="text-sm font-black text-error mt-2">
                  {formatMoney(Math.abs(movement.monto))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseCard>
  );
}

export default function InsightReviewQueue() {
  const [candidates, setCandidates] = useState<InsightCandidate[]>([]);
  const [uncategorized, setUncategorized] = useState<MovimientoResponse[]>([]);
  const [filter, setFilter] = useState<'all' | InsightReviewStatus>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadQueue = async () => {
    setLoading(true);
    setError(false);
    try {
      const [candidateData, uncategorizedData] = await Promise.all([
        apiService.getInsightCandidates(filter === 'all' ? {} : { estado_revision: filter }),
        apiService.getUncategorizedReviewQueue(),
      ]);
      setCandidates(candidateData);
      setUncategorized(uncategorizedData);
    } catch (err) {
      console.error('Error loading insight review queue:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [filter]);

  const stats = useMemo(() => {
    const pending = candidates.filter(c => c.estado_revision === 'pending').length;
    return {
      total: candidates.length,
      pending: filter === 'pending' ? candidates.length : pending,
    };
  }, [candidates, filter]);

  const handleReview = async (id: number, status: InsightReviewStatus) => {
    setUpdatingId(id);
    try {
      await apiService.updateInsightCandidateReview(id, status);
      await loadQueue();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col lg:flex-row justify-between gap-5 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-primary">
            <Eye size={12} />
            SP9 Review Desk
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tighter text-text-prime uppercase italic">
            Bandeja de <span className="text-primary not-italic">Insights</span>
          </h2>
          <p className="mt-2 text-sm text-text-muted/60 max-w-3xl leading-relaxed">
            Revisión humana de candidatos generados por el Canon TAUROS. Aprobá lo que sea señal real, rechazá ruido y convertí en regla lo que deba quedar como criterio operativo.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 min-w-0 lg:min-w-[360px]">
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
            <div className="text-[8px] font-black uppercase tracking-widest text-text-muted/40">Vista</div>
            <div className="text-xl font-black text-text-prime">{stats.total}</div>
          </div>
          <div className="rounded-xl border border-primary/10 bg-primary/[0.04] p-3">
            <div className="text-[8px] font-black uppercase tracking-widest text-primary/70">Pendientes</div>
            <div className="text-xl font-black text-primary">{filter === 'pending' ? stats.total : stats.pending}</div>
          </div>
          <div className="rounded-xl border border-error/10 bg-error/[0.04] p-3">
            <div className="text-[8px] font-black uppercase tracking-widest text-error/70">Sin cat.</div>
            <div className="text-xl font-black text-error">{uncategorized.length}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['pending', 'approved', 'rejected', 'ignored', 'converted_to_rule', 'all'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              filter === status
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-white/10 bg-white/[0.02] text-text-muted/60 hover:text-text-prime hover:bg-white/[0.05]'
            }`}
          >
            {status === 'converted_to_rule' ? 'convertidos' : status}
          </button>
        ))}
        <button
          onClick={loadQueue}
          className="ml-auto inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-text-muted/70 hover:text-primary hover:border-primary/20 transition-all"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      <UncategorizedPanel movements={uncategorized} />

      {error && (
        <BaseCard className="border-error/20 bg-error/[0.03] text-error">
          <div className="flex items-center gap-3 text-sm font-bold">
            <AlertTriangle size={16} />
            No se pudo cargar la bandeja de insights. Revisá que el backend esté activo.
          </div>
        </BaseCard>
      )}

      {loading ? (
        <BaseCard className="min-h-[180px] flex items-center justify-center">
          <div className="flex items-center gap-3 text-primary text-xs font-black uppercase tracking-widest">
            <RefreshCw size={16} className="animate-spin" />
            Sincronizando candidatos
          </div>
        </BaseCard>
      ) : candidates.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {candidates.map(candidate => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isUpdating={updatingId === candidate.id}
              onReview={handleReview}
            />
          ))}
        </div>
      ) : (
        <BaseCard className="min-h-[220px] flex flex-col items-center justify-center text-center">
          <ShieldCheck size={34} className="text-success mb-4" />
          <h3 className="text-lg font-black uppercase tracking-widest text-text-prime">
            Bandeja limpia
          </h3>
          <p className="text-sm text-text-muted/60 mt-2 max-w-xl">
            No hay candidatos en este estado. Cambiá el filtro o re-evaluá el Canon desde backend si necesitás regenerar señales.
          </p>
        </BaseCard>
      )}
    </section>
  );
}
