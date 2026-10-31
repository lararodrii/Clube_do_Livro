import React, { useState } from 'react';
import { Lock, EyeOff, ShieldAlert } from 'lucide-react';

/**
 * Componente Tarja de "Arquivo Confidencial" (Anti-Spoiler)
 * Cobre o comentário com desfoque e carimbo de documento censurado oficial
 * e dissolve suavemente ao clique do camarada, exibindo botão de ocultar novamente.
 */
export default function ConfidentialSpoiler({ 
  children, 
  isSpoiler = false, 
  label = '★ ARQUIVO CONFIDENCIAL (SPOILER) — CLIQUE PARA DESCLASSIFICAR' 
}) {
  const [isRevealed, setIsRevealed] = useState(false);

  if (!isSpoiler) {
    return <>{children}</>;
  }

  return (
    <div className="relative my-2">
      {!isRevealed ? (
        <div
          onClick={() => setIsRevealed(true)}
          title="Clique para desclassificar o comentário confidencial"
          className="relative cursor-pointer group overflow-hidden rounded-xl border-2 border-theme-border bg-theme-card p-4 select-none shadow-[3px_3px_0px_var(--shadow-color)] transition-all hover:scale-[1.005]"
        >
          {/* Conteúdo com desfoque de documento censurado */}
          <div className="blur-md select-none opacity-25 pointer-events-none filter">
            {children}
          </div>

          {/* Carimbo Clicável Centralizado por cima */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-black/40 backdrop-blur-[1px]">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-theme-red text-white text-xs font-mono font-black uppercase tracking-wider border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] rev-stamp transform -rotate-1 group-hover:scale-105 transition-transform">
              <Lock className="w-4 h-4 text-[#FEF08A] shrink-0" />
              <span>{label}</span>
            </div>
            <p className="text-[10px] text-[#111111] font-mono mt-2 font-bold bg-[#FEF08A] px-2 py-0.5 rounded border border-theme-border">
              ⚠ Contém detalhes cruciais da obra aprovados pelo comitê
            </p>
          </div>
        </div>
      ) : (
        <div className="relative animate-fade-in my-2">
          {/* Conteúdo Revelado com Faixa Indicadora e Botão de Ocultar Novamente */}
          <div className="relative pl-3.5 border-l-4 border-theme-red bg-theme-container p-3.5 rounded-r-xl border-y border-r border-theme-border/40 text-theme-secondary shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-theme-border/40">
              <span className="text-[10px] font-mono font-black text-theme-red uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-theme-red" />
                <span>★ ARQUIVO CONFIDENCIAL DESCLASSIFICADO</span>
              </span>
              <button
                type="button"
                onClick={() => setIsRevealed(false)}
                title="Ocultar conteúdo confidencial novamente"
                className="flex items-center gap-1 text-[11px] font-mono font-bold text-theme-muted hover:text-theme-red transition-colors px-2 py-0.5 rounded bg-theme-card border border-theme-border shadow-xs"
              >
                <Lock className="w-3 h-3 text-theme-red" />
                <span>🔒 Ocultar novamente</span>
              </button>
            </div>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
