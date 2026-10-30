import React, { useEffect } from 'react';
import { useClub } from '../../context/ClubContext';
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from 'lucide-react';

export default function Toast() {
  const { toast, closeToast } = useClub();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      closeToast();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, closeToast]);

  if (!toast) return null;

  const typeConfig = {
    success: {
      bg: 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 border-red-400 text-white shadow-red-600/30',
      icon: <span className="text-amber-200 text-base shrink-0 font-black">★</span>
    },
    error: {
      bg: 'bg-stone-900 border-red-500/50 text-white shadow-stone-950/40',
      icon: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
    },
    info: {
      bg: 'bg-stone-900 border-amber-500/40 text-amber-100 shadow-stone-950/50',
      icon: <Info className="w-5 h-5 text-amber-300 shrink-0" />
    },
    pink: {
      bg: 'bg-gradient-to-r from-red-600 via-amber-600 to-rose-600 border-amber-300 text-white shadow-red-600/40',
      icon: <span className="text-amber-200 text-lg shrink-0 animate-bounce">★</span>
    },
    comrade: {
      bg: 'bg-gradient-to-r from-red-600 via-amber-600 to-rose-600 border-amber-300 text-white shadow-red-600/40',
      icon: <span className="text-amber-200 text-lg shrink-0 animate-bounce">★</span>
    }
  };

  const current = typeConfig[toast.type] || typeConfig.success;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-fade-in transition-all duration-300 px-4 sm:px-0">
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md ${current.bg}`}
      >
        {current.icon}
        <div className="flex-1 text-xs sm:text-sm font-bold leading-relaxed">
          {toast.message}
        </div>
        <button
          onClick={closeToast}
          className="text-white/70 hover:text-white p-0.5 rounded-lg transition-colors focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
