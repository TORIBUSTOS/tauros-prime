'use client';

import { BarChart3, Download, FileCheck2, ShieldCheck, TrendingUp } from 'lucide-react';

import BaseCard from '@/components/shared/BaseCard';
import { apiService } from '@/services/api.service';
import { ExecutiveSummaryResponse } from '@/types/api';

interface ExecutiveSnapshotProps {
  summary: ExecutiveSummaryResponse | null;
}

const formatMoney = (value?: number) =>
  (value ?? 0).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  });

export default function ExecutiveSnapshot({ summary }: ExecutiveSnapshotProps) {
  if (!summary) return null;

  const forecast = summary.forecast && !('error' in summary.forecast) ? summary.forecast : null;
  const realistic = forecast?.scenarios?.realistic;
  const forecastTotal = realistic?.total_3m ?? 0;
  const pending = summary.insights.review.pending ?? 0;
  const approved = summary.insights.review.approved ?? 0;

  return (
    <BaseCard className="overflow-hidden border-primary/10 bg-gradient-to-r from-surface to-primary/[0.04]">
      <div className="absolute right-8 top-8 opacity-[0.04] pointer-events-none">
        <ShieldCheck size={130} className="text-primary" />
      </div>

      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em] text-primary">
              <FileCheck2 size={13} />
              v1.1 Executive Snapshot
            </div>
            <h2 className="mt-2 text-xl font-black uppercase italic tracking-tight text-text-prime">
              Baseline anual <span className="text-primary not-italic">SANARTE</span>
            </h2>
            <p className="mt-1 text-xs text-text-muted/60">
              {summary.baseline.start_period} a {summary.baseline.end_period} · {summary.baseline.months} meses · {summary.baseline.movement_count.toLocaleString('es-AR')} movimientos
            </p>
          </div>

          <a
            href={apiService.exportInsightCandidates('approved')}
            className="inline-flex h-fit items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/15 transition-all"
          >
            <Download size={14} />
            Export insights
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <div className="text-[8px] font-black uppercase tracking-widest text-text-muted/40">Resultado anual</div>
            <div className={`mt-1 text-lg font-black ${summary.financials.net_total >= 0 ? 'text-success' : 'text-error'}`}>
              {formatMoney(summary.financials.net_total)}
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <div className="text-[8px] font-black uppercase tracking-widest text-text-muted/40">Forecast 3M</div>
            <div className={`mt-1 text-lg font-black ${forecastTotal >= 0 ? 'text-success' : 'text-error'}`}>
              {forecast ? formatMoney(forecastTotal) : 'Sin forecast'}
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <div className="text-[8px] font-black uppercase tracking-widest text-text-muted/40">Calidad de base</div>
            <div className="mt-1 flex items-center gap-2 text-lg font-black text-text-prime">
              <BarChart3 size={17} className="text-primary" />
              {summary.baseline.duplicate_groups} dup · {summary.baseline.uncategorized_count} s/c
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <div className="text-[8px] font-black uppercase tracking-widest text-text-muted/40">Insights</div>
            <div className="mt-1 flex items-center gap-2 text-lg font-black text-text-prime">
              <TrendingUp size={17} className="text-primary" />
              {pending} pend · {approved} ok
            </div>
          </div>
        </div>
      </div>
    </BaseCard>
  );
}
