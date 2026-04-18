import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 w-full max-w-sm pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const { message, type, title } = toast;

  const iconMap = {
    success: <CheckCircle2 className="text-emerald-400" size={20} />,
    error: <AlertCircle className="text-rose-400" size={20} />,
    info: <Info className="text-primary" size={20} />,
    warning: <AlertTriangle className="text-amber-400" size={20} />,
  };

  const borderMap = {
    success: 'border-emerald-500/30',
    error: 'border-rose-500/30',
    info: 'border-primary/30',
    warning: 'border-amber-500/30',
  };

  const bgMap = {
    success: 'bg-emerald-500/5',
    error: 'bg-rose-500/5',
    info: 'bg-primary/5',
    warning: 'bg-amber-500/5',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className={`pointer-events-auto relative overflow-hidden flex items-start gap-4 p-5 rounded-card bg-surface/90 backdrop-blur-2xl border ${borderMap[type]} shadow-[0_20px_40px_rgba(0,0,0,0.4)] group`}
    >
      {/* Background Glow */}
      <div className={`absolute inset-0 ${bgMap[type]} opacity-50`} />
      
      {/* Rim light effect */}
      <div className="absolute inset-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]" />

      <div className="relative z-10 shrink-0 mt-0.5">
        {iconMap[type]}
      </div>

      <div className="relative z-10 flex-1 flex flex-col gap-1">
        {title && (
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-prime">
            {title}
          </h4>
        )}
        <p className="text-[11px] font-bold text-text-muted leading-relaxed">
          {message}
        </p>
      </div>

      <button 
        onClick={onRemove}
        className="relative z-10 shrink-0 text-white/10 hover:text-white/40 transition-colors p-1"
      >
        <X size={14} />
      </button>

      {/* Progress Bar */}
      <motion.div 
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 5, ease: "linear" }}
        className={`absolute bottom-0 left-0 right-0 h-[2px] origin-left ${type === 'info' ? 'bg-primary' : `bg-${type === 'success' ? 'emerald' : type === 'error' ? 'rose' : 'amber'}-500/50`}`}
      />
    </motion.div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
