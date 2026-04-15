'use client';

import React from 'react';
import { Database } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export default function EmptyState({ 
  title = "Bóveda Vacía", 
  message = "No se encontraron registros para el periodo seleccionado." 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
        <Database className="text-[#BEA8A7]/20" size={32} />
      </div>
      <h3 className="text-[#F4DBD8] font-bold text-lg mb-2 uppercase tracking-widest">{title}</h3>
      <p className="text-[#BEA8A7]/40 text-sm max-w-xs mx-auto leading-relaxed">
        {message}
      </p>
    </div>
  );
}
