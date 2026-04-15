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
      // Solo seteamos el inicial si no hay uno seleccionado o el actual ya no existe
      if (periods.length > 0 && (!selectedPeriod || !periods.includes(selectedPeriod))) {
        setSelectedPeriod(periods[0]);
      }
    } catch (error) {
      console.error('Error fetching periods:', error);
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
