import React, { useState } from 'react';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';

/**
 * Componente Tarja de "Arquivo Confidencial" (Anti-Spoiler)
 * Cobre textos sensíveis com tarja preta de documento censurado oficial
 * e dissolve suavemente ao clique do camarada.
 */
export default function ConfidentialSpoiler({ 
  children, 
  isSpoiler = false, 
  label = 'CONFIDENCIAL — CLIQUE PARA REVELAR' 
}) {
  const [isRevealed, setIsRevealed] = useState(false);

  if (!isSpoiler) {
    return <>{children}</>;
  }

  return (
    <div className="relative group my-2">
      {!isRevealed ? (
        <div
          onClick={() => setIsRevealed(true)}
          title="Clique para revelar o conteúdo censurado"
          className="cursor-pointer relative overflow-hidden rounded-xl border-2 border-[#1E1E1E] bg-[#141414] text-white p-4 sm:p-5 select-none shadow-[4px_4px_0px_#D62828] hover:bg-[#1C1917] transition-all hover:scale-[1.01]"
        >
          {/* Efeito de linhas pretas censuradas no fundo simulando texto riscado */}
          <div className="space-y-2 opacity-35 filter blur-[1px] pointer-events-none">
            <div className="h-3 bg-stone-500 rounded w-5/6" />
            <div className="h-3 bg-stone-500 rounded w-full" />
            <div className="h-3 bg-stone-500 rounded w-4/6" />
          </div>

          {/* Selo Carimbado Central "DOCUMENTO CONFIDENCIAL" */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-black/60 backdrop-blur-[2px]">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-[#D62828] text-white text-xs font-mono font-black uppercase tracking-wider border-2 border-white shadow-[2px_2px_0px_#000000] rev-stamp transform -rotate-1 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-3.5 h-3.5 text-[#FEF08A] shrink-0" />
              <span>{label}</span>
            </div>
            <p className="text-[10px] text-stone-300 font-mono mt-1.5">
              ⚠ Este trecho contém spoilers da leitura aprovados pelo comitê
            </p>
          </div>
        </div>
      ) : (
        <div className="relative animate-fade-in">
          {/* Conteúdo Revelado com Faixa Indicadora e Botão de Ocultar */}
          <div className="relative pl-3.5 border-l-4 border-[#D62828] bg-[#FDF0ED] p-3 rounded-r-xl border-y border-r border-[#1E1E1E]/30">
            <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-[#D62828]/20">
              <span className="text-[9px] font-mono font-black text-[#D62828] uppercase tracking-wider flex items-center gap-1">
                <span>★</span> ARQUIVO CONFIDENCIAL REVELADO
              </span>
              <button
                type="button"
                onClick={() => setIsRevealed(false)}
                title="Censurar trecho novamente"
                className="flex items-center gap-1 text-[10px] font-mono font-bold text-stone-600 hover:text-[#D62828] transition-colors"
              >
                <EyeOff className="w-3 h-3" />
                <span>Ocultar spoiler</span>
              </button>
            </div>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
