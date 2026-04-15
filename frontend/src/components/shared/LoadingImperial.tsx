'use client';

import React from 'react';

interface LoadingImperialProps {
  message?: string;
}

export default function LoadingImperial({ message = "Accediendo a la Bóveda Imperial..." }: LoadingImperialProps) {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-6">
        {/* Spinner animado con estilo premium */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-2 border-[#C09891]/10 rounded-full"></div>
          <div className="absolute inset-0 border-2 border-t-[#C09891] rounded-full animate-spin"></div>
          <div className="absolute inset-4 border border-[#C09891]/20 rounded-full animate-pulse"></div>
        </div>
        
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-[#F4DBD8] text-sm font-medium tracking-[0.2em] uppercase animate-pulse">
            Sincronizando
          </span>
          <span className="text-[#BEA8A7]/40 text-[10px] uppercase tracking-widest">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
}
