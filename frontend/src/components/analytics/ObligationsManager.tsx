'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api.service';
import { ManualObligation } from '@/types/api';
import { Wallet, Plus, Trash2, CheckCircle2, AlertCircle, Clock, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/context/ToastContext';
import BaseCard from '../shared/BaseCard';

const ObligationsManager: React.FC = () => {
  const [obligations, setObligations] = useState<ManualObligation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newObs, setNewObs] = useState({
    concepto: '',
    monto: '',
    fecha_limite: new Date().toISOString().split('T')[0],
    prioridad: 2
  });
  
  const { showToast } = useToast();

  const fetchObligations = async () => {
    try {
      const data = await apiService.getObligations();
      setObligations(data);
    } catch (err) {
      showToast('Error al sincronizar compromisos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObligations();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObs.concepto || !newObs.monto) return;
    
    try {
      await apiService.createObligation({
        ...newObs,
        monto: parseFloat(newObs.monto)
      });
      showToast('Compromiso registrado en la Bóveda', 'success');
      setShowAddForm(false);
      setNewObs({
        concepto: '',
        monto: '',
        fecha_limite: new Date().toISOString().split('T')[0],
        prioridad: 2
      });
      fetchObligations();
    } catch (err) {
      showToast('Falla en el registro', 'error');
    }
  };

  const handleTogglePaid = async (id: number, currentPaid: number) => {
    try {
      await apiService.updateObligation(id, { pagado: currentPaid === 1 ? 0 : 1 });
      fetchObligations();
      showToast(currentPaid === 1 ? 'Marcado como pendiente' : 'Compromiso liquidado', 'info');
    } catch (err) {
      showToast('Error al actualizar estado', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteObligation(id);
      fetchObligations();
      showToast('Compromiso eliminado', 'success');
    } catch (err) {
      showToast('Error al eliminar', 'error');
    }
  };

  return (
    <BaseCard className="flex flex-col h-full gap-4 relative overflow-hidden border-primary/20">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none grayscale">
        <Wallet size={120} className="text-primary" />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={16} className="text-primary" />
            <h3 className="text-text-prime font-black text-xs uppercase tracking-[0.2em]">Compromisos Financieros</h3>
          </div>
          <p className="text-text-muted/40 text-[9px] font-bold uppercase tracking-[0.3em]">
            Gestión manual de obligaciones futuras
          </p>
        </div>
        
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all border border-primary/20"
        >
          <Plus size={18} className={showAddForm ? 'rotate-45' : ''} />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {showAddForm ? (
            <motion.form 
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleAdd}
              className="bg-surface/60 p-4 rounded-2xl border border-white/5 space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Concepto</label>
                  <input 
                    type="text" 
                    value={newObs.concepto}
                    onChange={e => setNewObs({...newObs, concepto: e.target.value})}
                    placeholder="Ej: Alquiler, Patente..."
                    className="w-full bg-background/50 border border-white/5 rounded-xl px-3 py-2 text-[11px] text-text-prime focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Monto (ARS)</label>
                  <input 
                    type="number" 
                    value={newObs.monto}
                    onChange={e => setNewObs({...newObs, monto: e.target.value})}
                    placeholder="0.00"
                    className="w-full bg-background/50 border border-white/5 rounded-xl px-3 py-2 text-[11px] text-text-prime focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Fecha</label>
                  <input 
                    type="date" 
                    value={newObs.fecha_limite}
                    onChange={e => setNewObs({...newObs, fecha_limite: e.target.value})}
                    className="w-full bg-background/50 border border-white/5 rounded-xl px-3 py-2 text-[11px] text-text-prime focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-2.5 bg-primary text-background font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gold transition-colors"
              >
                Registrar Obligación
              </button>
            </motion.form>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2"
            >
              {obligations.length === 0 && !loading ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 py-10">
                  <AlertCircle size={32} className="mb-3 opacity-20" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Sin compromisos activos</p>
                </div>
              ) : (
                obligations.map((obs) => (
                  <div 
                    key={obs.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${
                      obs.pagado ? 'bg-success/5 border-success/20 opacity-60' : 'bg-surface/40 border-white/5 hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <button 
                        onClick={() => handleTogglePaid(obs.id, obs.pagado)}
                        className={`shrink-0 transition-colors ${obs.pagado ? 'text-success' : 'text-text-muted/30 hover:text-primary'}`}
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      
                      <div className="flex flex-col overflow-hidden">
                        <span className={`text-[11px] font-black uppercase tracking-tight truncate ${obs.pagado ? 'line-through' : 'text-text-prime'}`}>
                          {obs.concepto}
                        </span>
                        <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-text-muted/40">
                          <Calendar size={8} />
                          {new Date(obs.fecha_limite).toLocaleDateString()}
                          <div className="w-0.5 h-0.5 rounded-full bg-white/10" />
                          <Clock size={8} />
                          {obs.prioridad === 3 ? 'Prioridad Alta' : obs.prioridad === 2 ? 'Media' : 'Baja'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className={`text-[11px] font-black tabular-nums ${obs.pagado ? 'text-text-muted' : 'text-error'}`}>
                          -${obs.monto.toLocaleString()}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(obs.id)}
                        className="p-1.5 text-text-muted/20 hover:text-error transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!showAddForm && obligations.some(o => !o.pagado) && (
        <div className="pt-2 border-t border-white/5">
           <div className="flex justify-between items-center px-2">
             <span className="text-[9px] font-black text-text-muted/40 uppercase tracking-widest">Pendiente Total</span>
             <span className="text-[11px] font-black text-error tabular-nums">
               -${obligations.filter(o => !o.pagado).reduce((acc, o) => acc + o.monto, 0).toLocaleString()}
             </span>
           </div>
        </div>
      )}
    </BaseCard>
  );
};

export default ObligationsManager;
