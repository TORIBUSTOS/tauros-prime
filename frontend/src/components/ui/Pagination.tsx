'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  isLoading = false
}: PaginationProps) {
  if (totalRecords === 0) return null;

  const safeSetPage = (p: number) => {
    const target = Math.min(Math.max(1, p), totalPages);
    if (target !== currentPage) {
      onPageChange(target);
    }
  };

  const getPageRange = (current: number, total: number): (number | '...')[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (current > 3) pages.push('...');
    for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  };

  return (
    <div className={`flex items-center justify-between px-8 py-4 border-t border-white/5 bg-white/[0.01] backdrop-blur-sm transition-opacity ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      {/* Info */}
      <div className="flex items-center gap-2 text-[10px] font-black text-text-muted/30 uppercase tracking-widest">
        <Filter size={11} className="text-primary/40" />
        <span>
          {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalRecords)}
          {' '}de{' '}
          <span className="text-primary">{totalRecords}</span> registros
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
  );
}

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
