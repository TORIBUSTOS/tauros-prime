'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import TopCategorias from '@/components/dashboard/TopCategorias';
import CortexHub from '@/components/dashboard/CortexHub';
import FileUploadZone from '@/components/dashboard/FileUploadZone';
import BaseCard from '@/components/shared/BaseCard';
import FlowChart from '@/components/analytics/FlowChart';
import { apiService } from '@/services/api.service';
import { MovimientoMapped, InsightsResponse, ForecastResponse, CategoryStats } from '@/types/api';
import { usePeriod } from '@/context/PeriodContext';
import { useToast } from '@/context/ToastContext';

export default function DashboardPage() {
  const [movements, setMovements] = useState<MovimientoMapped[]>([]);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [categories, setCategories] = useState<CategoryStats[]>([]);
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
      const [movData, insData, sumData, foreData, catData] = await Promise.all([
        apiService.getMovements(period),
        apiService.getInsights(period),
        apiService.getSummary(period),
        apiService.getForecast(period),
        apiService.getCategories(period)
      ]);
      setMovements(movData);
      setInsights(insData);
      setSummary(sumData);
      setForecastData(foreData);
      setCategories(catData);
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

  const currentBalance = summary?.equity ?? 0;
  const currentNet = summary?.balance ?? 0;
  
  const nextMonthForecast = forecastData?.forecast?.[0];
  const totalForecastedNet = nextMonthForecast?.forecast.reduce((acc, item) => acc + item.expected_total, 0) ?? 0;
  
  // El balance proyectado al cierre es: Balance Actual + (Lo que falta ocurrir del forecast)
  // remainingNet = Forecast Total - Lo que ya ocurrió
  const remainingNet = totalForecastedNet - currentNet;
  const projectedBalance = currentBalance + remainingNet;
  
  const forecastItems = nextMonthForecast?.forecast ?? [];
  const confidence = forecastItems.length > 0
    ? forecastItems.reduce((s, f) => s + f.confidence, 0) / forecastItems.length
    : 0;

  const stability = projectedBalance < 0 
    ? 'Crítica' 
    : currentNet < 0 
      ? 'Bajo Control' 
      : 'Creciente';

  if ((loading || isPeriodLoading) && !importing) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-6 min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-b-2 border-primary animate-spin" />
          <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-sm font-black text-text-prime uppercase tracking-[0.3em]">Accediendo a la Bóveda</h2>
          <p className="text-[10px] text-text-muted/40 font-bold uppercase tracking-widest italic animate-pulse">
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
            <h1 className="text-xl font-black text-foreground tracking-tighter uppercase italic font-sans">
              Digital <span className="text-primary not-italic">Vault</span>
            </h1>
          </div>
            <p className="text-[10px] text-text-muted/40 font-medium">
              Panel de control financiero
            </p>
        </div>
      </header>

      {/* Main Content + Sidebar Layout for better UX */}
      <div className="flex flex-col xl:flex-row gap-6 relative z-10 w-full">
        
        {/* Lado Izquierdo: Main Dashboard Content */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Row 1: Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <MetricCard 
                label="Balance Imperial" 
                value={currentBalance.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}
                accent="gold"
                valueClassName={currentBalance >= 0 ? 'text-success' : 'text-error'}
                subtitle="Patrimonio líquido acumulado"
              />
            </div>
            <div className="md:col-span-1">
              <MetricCard 
                label="Ingresos Mensuales" 
                value={summary?.ingresos_total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}
                subtitle={`Flujo de entrada ${selectedPeriod.split(' ')[0]}`}
                valueClassName="text-success"
                onClick={() => router.push('/movimientos?tipo=ingreso')}
              />
            </div>
            <div className="md:col-span-1">
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
          </div>

          {/* Row 2: Graph & Top Categorías */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="min-h-[350px] md:min-h-[400px]">
              <FlowChart movements={movements} period={selectedPeriod} />
            </div>
            <div className="min-h-[350px] md:min-h-[400px]">
              <TopCategorias categories={categories} period={selectedPeriod} />
            </div>
          </div>
          
          {/* Row 3: Action (File Upload) */}
          <div className="w-full h-40">
            <FileUploadZone onUpload={handleFileUpload} isUploading={importing} />
          </div>
        </div>

        {/* Lado Derecho: Cortex Intelligence Hub (Sticky Sidebar) */}
        <div className="w-full xl:w-96 shrink-0 flex flex-col h-[600px] xl:h-[calc(100vh-8rem)] xl:sticky xl:top-24">
          <CortexHub 
            insights={insights?.insights || []}
            currentBalance={currentBalance}
            projectedBalance={projectedBalance}
            confidence={confidence}
            stability={stability}
          />
        </div>

      </div>
    </div>
  );
}

