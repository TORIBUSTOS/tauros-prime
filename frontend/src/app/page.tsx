'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import TopCategorias from '@/components/dashboard/TopCategorias';
import FileUploadZone from '@/components/dashboard/FileUploadZone';
import FlowChart from '@/components/analytics/FlowChart';
import { apiService } from '@/services/api.service';
import { MovimientoMapped, CategoryStats } from '@/types/api';
import { usePeriod } from '@/context/PeriodContext';
import { useToast } from '@/context/ToastContext';

export default function DashboardPage() {
  const [movements, setMovements] = useState<MovimientoMapped[]>([]);
  const [summary, setSummary] = useState<any>(null);
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
      const [movData, sumData, catData] = await Promise.all([
        apiService.getMovements({ period, pageSize: 100 }),
        apiService.getSummary(period),
        apiService.getCategories(period)
      ]);
      setMovements(movData.items);
      setSummary(sumData);
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
  const formatMoney = (value?: number) => (
    (value ?? 0).toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    })
  );

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

      <div className="relative z-10 w-full">
        <div className="flex flex-col gap-6">
          
          {/* Row 1: Key Metrics */}
          <div className="grid grid-cols-1 2xl:grid-cols-3 gap-4">
            <div className="min-w-0">
              <MetricCard 
                label="Balance Imperial" 
                value={formatMoney(currentBalance)}
                accent="gold"
                valueClassName={currentBalance >= 0 ? 'text-success' : 'text-error'}
                valueTitle={formatMoney(currentBalance)}
                subtitle="Patrimonio líquido acumulado"
              />
            </div>
            <div className="min-w-0">
              <MetricCard 
                label="Ingresos Mensuales" 
                value={formatMoney(summary?.ingresos_total)}
                subtitle={`Flujo de entrada ${selectedPeriod.split(' ')[0]}`}
                valueClassName="text-success"
                valueTitle={formatMoney(summary?.ingresos_total)}
                onClick={() => router.push('/movimientos?tipo=ingreso')}
              />
            </div>
            <div className="min-w-0">
              <MetricCard 
                label="Egresos Mensuales" 
                value={formatMoney(summary?.egresos_total)}
                accent="bronze"
                subtitle={`Flujo de salida ${selectedPeriod.split(' ')[0]}`}
                valueClassName="text-error"
                valueTitle={formatMoney(summary?.egresos_total)}
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
      </div>
    </div>
  );
}

