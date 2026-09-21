import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  durationMs?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, durationMs?: number) => void;
  errorToast: (message: string) => void;
  successToast: (message: string) => void;
  infoToast: (message: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', durationMs = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message, durationMs }]);

      if (durationMs > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, durationMs);
      }
    },
    [dismissToast]
  );

  const errorToast = useCallback(
    (message: string) => showToast(message, 'error', 5000),
    [showToast]
  );

  const successToast = useCallback(
    (message: string) => showToast(message, 'success', 3500),
    [showToast]
  );

  const infoToast = useCallback(
    (message: string) => showToast(message, 'info', 3500),
    [showToast]
  );

  const styles: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: {
      bg: 'bg-[#22B14C] text-white',
      border: 'border-[#102040]',
      icon: '✓',
    },
    error: {
      bg: 'bg-[#D32F2F] text-white',
      border: 'border-[#102040]',
      icon: '✕',
    },
    warning: {
      bg: 'bg-[#FFCC00] text-[#102040]',
      border: 'border-[#102040]',
      icon: '⚠',
    },
    info: {
      bg: 'bg-[#5C94FC] text-white',
      border: 'border-[#102040]',
      icon: 'ℹ',
    },
  };

  return (
    <ToastContext.Provider
      value={{ showToast, errorToast, successToast, infoToast, dismissToast }}
    >
      {children}
      {/* Toast floating container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] pointer-events-none">
        {toasts.map((toast) => {
          const s = styles[toast.type];
          return (
            <div
              key={toast.id}
              className={`
                pointer-events-auto flex items-start justify-between gap-3 p-3.5
                border-3 ${s.border} ${s.bg} shadow-[4px_4px_0px_#102040]
                animate-in slide-in-from-bottom-2 duration-150
              `}
            >
              <div className="flex items-start gap-2.5">
                <span className="font-pixel text-xs mt-0.5">{s.icon}</span>
                <span className="font-mono text-xs font-semibold leading-snug break-words">
                  {toast.message}
                </span>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss toast"
                className="opacity-80 hover:opacity-100 font-pixel text-[10px] ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
