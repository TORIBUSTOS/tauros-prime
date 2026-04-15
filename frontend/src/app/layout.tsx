'use client';

import "./globals.css";
import "@/styles/themes.css";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Zap,
  Calendar,
  FileText,
  Tag,
  ChevronDown,
} from "lucide-react";
import { PeriodProvider, usePeriod } from "@/context/PeriodContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

// ── Period Selector Dropdown (used in TopBar) ──────────────────────────────
function PeriodDropdown() {
  const { selectedPeriod, setSelectedPeriod, availablePeriods, isLoading } = usePeriod();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const formatPeriod = (p: string) => {
    const [y, m] = p.split('-');
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${months[parseInt(m) - 1]} ${y}`;
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={isLoading}
        className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-imperial-surface/60 border border-white/8 hover:border-imperial-bronze/30 transition-all group"
      >
        <Calendar className="w-4 h-4 text-imperial-bronze" />
        <div className="flex flex-col items-start">
          <span className="text-[8px] font-black text-imperial-text-muted/40 uppercase tracking-[0.3em] leading-none">Periodo</span>
          <span className="text-sm font-black text-imperial-text-prime tracking-tight">
            {selectedPeriod ? formatPeriod(selectedPeriod) : '...'}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-imperial-text-muted/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 min-w-[180px] bg-[#1a1a1b] border border-white/10 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden backdrop-blur-xl">
          <div className="p-1.5 max-h-[240px] overflow-y-auto">
            {availablePeriods.map(p => (
              <button
                key={p}
                onClick={() => { setSelectedPeriod(p); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-150 flex items-center gap-3 ${
                  p === selectedPeriod
                    ? 'bg-imperial-bronze/15 text-imperial-bronze'
                    : 'text-imperial-text-muted/70 hover:bg-white/5 hover:text-imperial-text-prime'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p === selectedPeriod ? 'bg-imperial-bronze shadow-[0_0_8px_rgba(192,152,145,0.6)]' : 'bg-white/10'}`} />
                {formatPeriod(p)}
                <span className="ml-auto text-[10px] text-imperial-text-muted/30 font-mono">{p}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── TopBar ─────────────────────────────────────────────────────────────────
const PAGE_TITLES: Record<string, { label: string; breadcrumb: string }> = {
  '/':            { label: 'Digital Vault',          breadcrumb: 'Dashboard' },
  '/movimientos': { label: 'Bóveda de Movimientos',  breadcrumb: 'Movimientos' },
  '/categorias':  { label: 'Gestión de Categorías',  breadcrumb: 'Categorías' },
  '/reportes':    { label: 'Reporte P&L',            breadcrumb: 'Reportes' },
  '/analytics':   { label: 'Inteligencia Analítica', breadcrumb: 'Análisis' },
  '/insights':    { label: 'Feed de Insights',       breadcrumb: 'Insights' },
};

function TopBar() {
  const pathname = usePathname();
  const page = PAGE_TITLES[pathname] || { label: 'TAUROS', breadcrumb: '' };

  return (
    <div className="flex items-center justify-between gap-4 px-4 md:px-6 py-3 border-b border-white/5 bg-[#0e0e0f]/60 backdrop-blur-xl sticky top-0 z-40">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden md:flex items-center gap-2 text-[10px] text-imperial-text-muted/30 font-bold uppercase tracking-[0.2em]">
          <span>TAUROS</span>
          <span className="text-imperial-bronze/30">/</span>
          <span className="text-imperial-text-muted/50">{page.breadcrumb}</span>
        </div>
        {/* Mobile: show page name only */}
        <span className="md:hidden text-xs font-black text-imperial-text-prime uppercase tracking-widest">{page.breadcrumb}</span>
      </div>

      {/* Right: Period Selector + Status */}
      <div className="flex items-center gap-3">
        <PeriodDropdown />
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-[0_0_6px_rgba(163,230,53,0.4)]" />
          <span className="text-[9px] font-black text-imperial-text-muted/40 uppercase tracking-widest">En Línea</span>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────
function SidebarContent() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Movimientos', href: '/movimientos', icon: ArrowLeftRight },
    { name: 'Categorías', href: '/categorias', icon: Tag },
    { name: 'Reportes', href: '/reportes', icon: FileText },
    { name: 'Análisis', href: '/analytics', icon: BarChart3 },
    { name: 'Insights', href: '/insights', icon: Zap },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Identity Block - Imperial Gold Foundation */}
      <div className="bg-gradient-to-b from-amber-500/20 via-imperial-bronze/10 to-transparent -mx-6 -mt-6 p-4 border-b border-white/5 flex flex-col items-center gap-3 relative overflow-hidden group justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

        {/* Decorative Gold Rim */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"></div>

        <div className="relative w-32 h-32 flex-shrink-0">
          <Image
            src="/branding/LOGO TAUROS PRIME.png"
            alt="Tauros Logo"
            fill
            sizes="(max-width: 768px) 128px, 128px"
            className="relative z-10 object-contain filter drop-shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
            priority
          />
        </div>
        <div className="text-center relative z-10">
          <h2 className="text-imperial-text-prime font-black tracking-[0.3em] text-lg leading-none mb-1 uppercase italic ml-[0.3em]">TAUROS</h2>
          <p className="text-amber-500/60 text-[9px] uppercase tracking-[0.4em] font-black leading-none">Bóveda Prime</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1.5 mt-4 px-1 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
                isActive 
                  ? "text-imperial-text-prime" 
                  : "text-imperial-text-muted/60 hover:text-imperial-text-prime"
              }`}
            >
              {/* Premium Hover Background */}
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute inset-0 bg-gradient-to-r from-imperial-bronze/10 to-transparent border-l-2 border-imperial-bronze/50 z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <div className="relative z-10 flex items-center gap-3 w-full">
                <Icon className={`w-5 h-5 transition-transform duration-500 group-hover:scale-110 ${isActive ? "text-imperial-bronze" : "text-imperial-text-muted/40 group-hover:text-imperial-bronze/70"}`} />
                <span className={`text-[13px] tracking-wide transition-all ${isActive ? "font-black" : "font-medium"}`}>
                  {item.name}
                </span>

                {isActive && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-1 h-1 rounded-full bg-imperial-bronze shadow-[0_0_10px_rgba(192,152,145,1)]" 
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Theme Toggle Only */}
      <div className="mt-auto pt-4 border-t border-white/5">
        <div className="p-3 rounded-2xl bg-imperial-surface/50 border border-white/5 backdrop-blur-sm">
          <label className="text-[10px] text-imperial-text-muted/40 uppercase tracking-widest block mb-2 font-semibold">
            Tema Visual
          </label>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  return (
    <html lang="es" className="h-full">
      <body className="h-full flex bg-[#131314] text-slate-200">
        <ThemeProvider>
          <PeriodProvider>
            <ToastProvider>
            <aside className="w-60 border-r border-white/5 p-6 flex flex-col hidden lg:flex bg-[#0e0e0f]/50 h-screen sticky top-0">
              <SidebarContent />
            </aside>
            
            <div className="flex-1 flex flex-col overflow-y-auto h-screen">
              <TopBar />
              <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-6">
                {children}
              </main>
            </div>

            {/* Premium Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-[#0e0e0f]/90 backdrop-blur-xl border-t border-white/5 px-4 py-2 z-50 flex justify-between items-center pb-[safe-area-inset-bottom]">
              {[
                { name: 'Dashboard', href: '/', icon: LayoutDashboard },
                { name: 'Análisis', href: '/analytics', icon: BarChart3 },
                { name: 'Insights', href: '/insights', icon: Zap },
                { name: 'Reportes', href: '/reportes', icon: FileText },
              ].map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center gap-1.5 p-2 transition-all duration-300 relative"
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-imperial-bronze" : "text-imperial-text-muted/40"}`} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? "text-imperial-text-prime" : "text-imperial-text-muted/40"}`}>
                      {item.name}
                    </span>
                    {isActive && (
                      <motion.div 
                        layoutId="active-dot-mobile"
                        className="absolute -top-1 w-1 h-1 rounded-full bg-imperial-bronze shadow-[0_0_8px_rgba(192,152,145,1)]"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
            </ToastProvider>
          </PeriodProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
