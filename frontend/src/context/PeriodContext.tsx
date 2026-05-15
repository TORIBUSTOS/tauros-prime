'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiService } from '../services/api.service';

interface PeriodContextType {
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  availablePeriods: string[];
  isLoading: boolean;
  refreshPeriods: () => Promise<void>;
}

const PeriodContext = createContext<PeriodContextType | undefined>(undefined);

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPeriods = async () => {
    try {
      const periods = await apiService.getPeriods();
      setAvailablePeriods(periods);
      if (periods.length > 0 && (!selectedPeriod || !periods.includes(selectedPeriod))) {
        setSelectedPeriod(periods[0]);
      }
    } catch (error) {
      console.warn('Backend unavailable, using fallback periods');
      const fallback = ['2026-04', '2026-03', '2026-02', '2026-01'];
      setAvailablePeriods(fallback);
      if (!selectedPeriod) setSelectedPeriod(fallback[0]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  return (
    <PeriodContext.Provider value={{
      selectedPeriod,
      setSelectedPeriod,
      availablePeriods,
      isLoading,
      refreshPeriods: fetchPeriods
    }}>
      {children}
    </PeriodContext.Provider>
  );
}

export function usePeriod() {
  const context = useContext(PeriodContext);
  if (context === undefined) {
    throw new Error('usePeriod must be used within a PeriodProvider');
  }
  return context;
}
