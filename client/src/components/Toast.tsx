import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Overlay Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';
          
          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 p-4 rounded-xl shadow-premium border backdrop-blur-md animate-fade-in pointer-events-auto transition-all duration-300 ${
                isSuccess
                  ? 'bg-green-50/90 border-green-200/50 text-green-800 dark:bg-green-950/90 dark:border-green-900/50 dark:text-green-200'
                  : isError
                  ? 'bg-red-50/90 border-red-200/50 text-red-800 dark:bg-red-950/90 dark:border-red-900/50 dark:text-red-200'
                  : isWarning
                  ? 'bg-amber-50/90 border-amber-200/50 text-amber-800 dark:bg-amber-950/90 dark:border-amber-900/50 dark:text-amber-200'
                  : 'bg-white/90 border-notion-border-light text-notion-text-light dark:bg-notion-sidebar-dark dark:border-notion-border-dark dark:text-notion-text-dark'
              }`}
            >
              {/* Toast Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {isSuccess && <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />}
                {isError && <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
                {isWarning && <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
                {toast.type === 'info' && <Info className="h-5 w-5 text-stripe-primary" />}
              </div>

              {/* Toast Message */}
              <div className="flex-grow text-sm font-medium">
                {toast.message}
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
