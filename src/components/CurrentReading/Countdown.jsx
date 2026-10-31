import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

/**
 * Utilitário seguro para extrair timestamp sem erros de fuso horário
 */
function safeGetTimestamp(dateInput) {
  if (!dateInput) return NaN;
  if (typeof dateInput === 'number') return dateInput;
  if (dateInput instanceof Date) return dateInput.getTime();

  // Se já for ISO string válido ou timestamp string
  const directParsed = new Date(dateInput).getTime();
  if (!isNaN(directParsed)) return directParsed;

  // Fallback para strings locais no formato 'YYYY-MM-DDTHH:mm'
  if (typeof dateInput === 'string' && dateInput.includes('T')) {
    const [dPart, tPart] = dateInput.split('T');
    const [y, m, d] = dPart.split('-').map(Number);
    const [h, min] = (tPart || '00:00').split(':').map(Number);
    return new Date(y, m - 1, d, h || 0, min || 0, 0).getTime();
  }

  return NaN;
}

/**
 * Componente do timer (Countdown) sincronizado em tempo real via props/Firestore
 */
export default function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false
  });

  useEffect(() => {
    function calculateTime() {
      const dateToUse = targetDate || new Date(2026, 10, 25, 20, 0, 0).toISOString();
      const targetTimestamp = safeGetTimestamp(dateToUse);
      const now = Date.now();
      const difference = targetTimestamp - now;

      if (isNaN(targetTimestamp) || difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    }

    // Calcula imediatamente ao montar ou quando a prop targetDate mudar
    calculateTime();

    // Atualiza a cada 1 segundo
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="w-full bg-[#FAF7F0] p-3 sm:p-4 rounded-2xl border-2 border-[#1E1E1E] shadow-[4px_4px_0px_#1E1E1E] flex flex-col justify-center items-center overflow-hidden">
      <div className="flex items-center justify-center gap-1.5 text-center text-xs font-mono font-black uppercase tracking-wider text-[#D62828] mb-3">
        <Timer className="w-3.5 h-3.5 text-[#D62828]" />
        <span>Contagem Regressiva para o Debate ★</span>
      </div>

      <div className="flex items-center justify-center gap-1.5 sm:gap-2 w-full mx-auto">
        
        {/* Dias */}
        <div className="flex-1 min-w-0 bg-[#141414] text-[#FEF08A] py-2 px-1 rounded-xl border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#BC6C25] flex flex-col items-center justify-center text-center">
          <span className="font-mono text-lg sm:text-2xl font-bold block leading-none tabular-nums text-center truncate">
            {String(timeLeft.days).padStart(2, '0')}
          </span>
          <span className="text-[9px] sm:text-[10px] font-semibold tracking-normal text-stone-300 font-mono mt-0.5 leading-none text-center">
            DIAS
          </span>
        </div>

        {/* Hora */}
        <div className="flex-1 min-w-0 bg-[#141414] text-[#FEF08A] py-2 px-1 rounded-xl border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#BC6C25] flex flex-col items-center justify-center text-center">
          <span className="font-mono text-lg sm:text-2xl font-bold block leading-none tabular-nums text-center truncate">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[9px] sm:text-[10px] font-semibold tracking-normal text-stone-300 font-mono mt-0.5 leading-none text-center">
            HORA
          </span>
        </div>

        {/* Min */}
        <div className="flex-1 min-w-0 bg-[#141414] text-[#FEF08A] py-2 px-1 rounded-xl border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#BC6C25] flex flex-col items-center justify-center text-center">
          <span className="font-mono text-lg sm:text-2xl font-bold block leading-none tabular-nums text-center truncate">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[9px] sm:text-[10px] font-semibold tracking-normal text-stone-300 font-mono mt-0.5 leading-none text-center">
            MIN
          </span>
        </div>

        {/* Seg */}
        <div className="flex-1 min-w-0 bg-[#141414] text-[#FEF08A] py-2 px-1 rounded-xl border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#BC6C25] flex flex-col items-center justify-center text-center">
          <span className="font-mono text-lg sm:text-2xl font-bold text-[#EF4444] block leading-none tabular-nums text-center truncate">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[9px] sm:text-[10px] font-semibold tracking-normal text-stone-300 font-mono mt-0.5 leading-none text-center">
            SEG
          </span>
        </div>

      </div>
    </div>
  );
}
