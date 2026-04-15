'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Shield, Loader2 } from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import TopCategorias from '@/components/dashboard/TopCategorias';
import CortexHub from '@/components/dashboard/CortexHub';
import FileUploadZone from '@/components/dashboard/FileUploadZone';
import BaseCard from '@/components/shared/BaseCard';
import FlowChart from '@/components/analytics/FlowChart';
import { apiService } from '@/services/api.service';
import { MovimientoMapped, InsightsResponse, ForecastResponse } from '@/types/api';
import { usePeriod } from '@/context/PeriodContext';
import { useToast } from '@/context/ToastContext';

export default function DashboardPage() {
  const [movements, setMovements] = useState<MovimientoMapped[]>([]);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  
  const { selectedPeriod, isLoading: isPeriodLoading, refreshPeriods } = usePeriod();
  const { showToast } = useToast();
  const router = useRouter();

  const fetchData = async (period: string) => {
    if (!period) return;
    setLoading(true);
    setError(null);
    try {
      const [movData, insData, sumData, foreData] = await Promise.all([
        apiService.getMovements(period),
        apiService.getInsights(period),
        apiService.getSummary(period),
        apiService.getForecast(period)
      ]);
      setMovements(movData);
      setInsights(insData);
      setSummary(sumData);
      setForecastData(foreData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      showToast("Error de conexión con la Bóveda Digital", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedPeriod);
  }, [selectedPeriod]);

  const handleFileUpload = async (file: File) => {
    setImporting(true);
    showToast(`Comenzando desencriptación de ${file.name}...`, "info");
    try {
      const result = await apiService.importMovements(file);
      showToast(`Éxito: Se importaron ${result.movimientos} movimientos.`, "success");
      await refreshPeriods();
      await fetchData(selectedPeriod);
    } catch (err: any) {
      showToast(`Falla en Bóveda: ${err.message}`, "error");
    } finally {
      setImporting(false);
    }
  };

  const nextMonthForecast = forecastData?.forecast?.[0];
  const projectedNet = nextMonthForecast?.forecast.reduce((acc, item) => acc + item.expected_total, 0) || 0;
  const currentBalance = summary?.balance || 0;
  const confidence = nextMonthForecast?.forecast[0]?.confidence || 0.85;

  if ((loading || isPeriodLoading) && !importing) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-6 min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-b-2 border-imperial-bronze animate-spin" />
          <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-imperial-bronze animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-sm font-black text-imperial-text-prime uppercase tracking-[0.3em]">Accediendo a la Bóveda</h2>
          <p className="text-[10px] text-imperial-text-muted/40 font-bold uppercase tracking-widest italic animate-pulse">
            TAUROS Prime Intelligence está sincronizando datos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-1000 relative">
      {/* Background Brand Watermark */}
      <div className="absolute top-40 -right-20 w-[600px] h-[600px] opacity-[0.03] pointer-events-none select-none mix-blend-overlay grayscale">
        <Image 
          src="/branding/toro_romano.png" 
          alt="Imperial Branding" 
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-contain"
          priority
        />
      </div>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-1 border-b border-white/5 relative z-10">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-imperial-text-prime tracking-tighter uppercase italic">
              Digital <span className="text-imperial-bronze not-italic">Vault</span>
            </h1>
            <div className="bg-imperial-bronze/10 px-2 py-0.5 rounded-full border border-imperial-bronze/20 flex items-center gap-1.5">
              <Shield className="w-2.5 h-2.5 text-imperial-bronze" />
              <span className="text-[9px] font-black text-imperial-bronze uppercase tracking-widest">Secure</span>
            </div>
          </div>
          <p className="text-[10px] text-imperial-text-muted/40 font-medium">
            Panel de control financiero — TAUROS v2.5
          </p>
        </div>
      </header>

      {/* Bento Grid Layout - Reduced Scale */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 auto-rows-auto relative z-10">
        
        {/* Row 1: Key Metrics */}
        <div className="lg:col-span-2">
          <MetricCard 
            label="Balance Imperial" 
            value={currentBalance.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}
            trend={2.4}
            accent="gold"
            valueClassName={currentBalance >= 0 ? 'text-success' : 'text-error'}
          />
        </div>
        <div className="lg:col-span-1">
          <MetricCard 
            label="Ingresos Mensuales" 
            value={summary?.ingresos_total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}
            subtitle={`Flujo de entrada ${selectedPeriod.split(' ')[0]}`}
            valueClassName="text-success"
            onClick={() => router.push('/movimientos?tipo=ingreso')}
          />
        </div>
        <div className="lg:col-span-1">
          <MetricCard 
            label="Egresos Mensuales" 
            value={summary?.egresos_total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}
            accent="bronze"
            subtitle={`Flujo de salida ${selectedPeriod.split(' ')[0]}`}
            valueClassName="text-error"
            className="cursor-pointer"
            onClick={() => router.push('/movimientos?tipo=egreso')}
          />
        </div>

        {/* Row 2: Graph & Top Categorías */}
        <div className="lg:col-span-2 min-h-[300px] md:min-h-[400px]">
          <FlowChart movements={movements} period={selectedPeriod} />
        </div>

        <div className="lg:col-span-2">
          <TopCategorias movements={movements} period={selectedPeriod} />
        </div>
        
        {/* Row 3: Action & Intelligence Hub */}
        <div className="lg:col-span-2">
          <FileUploadZone onUpload={handleFileUpload} isUploading={importing} />
        </div>

        <div className="lg:col-span-2 min-h-[400px]">
          <CortexHub 
            insights={insights?.insights || []}
            currentBalance={currentBalance}
            projectedBalance={projectedNet}
            confidence={confidence}
          />
        </div>

      </div>
    </div>
  );
}

