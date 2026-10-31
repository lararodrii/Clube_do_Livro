import React, { useState } from 'react';

/**
 * Componente de Tarja Parcial Interativa no Meio do Texto (||spoiler||)
 * Renderiza uma tarja preta de documento confidencial censurado que revela o texto ao clique.
 */
export function InlineSpoiler({ content }) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        setIsRevealed(!isRevealed);
      }}
      title={isRevealed ? "Clique para censurar trecho novamente" : "★ Trecho Confidencial — Clique para desclassificar"}
      className={`inline-block mx-0.5 px-1.5 py-0.5 rounded cursor-pointer transition-all duration-200 select-none text-xs sm:text-sm font-reading ${
        isRevealed
          ? 'bg-theme-container text-theme-red font-bold border border-theme-red/40 shadow-xs'
          : 'bg-[#111111] text-transparent hover:bg-[#1E1E1E] border border-theme-border shadow-xs'
      }`}
    >
      {content}
    </span>
  );
}

/**
 * Formata texto substituindo marcações de:
 * 1. Negrito (**texto**) por tags <strong> reais.
 * 2. Tarjas parciais (||texto secreto||) por tarjas censuradas interativas que revelam ao clique.
 */
export function formatTextWithBold(text, customBoldClass = 'font-bold text-theme-gold') {
  if (!text || typeof text !== 'string') {
    return text || '';
  }

  // Divide o texto capturando tanto **negrito** quanto ||spoiler||
  const parts = text.split(/(\*\*[^*]+?\*\*|\|\|[^|]+?\|\|)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const boldContent = part.slice(2, -2);
      return (
        <strong key={index} className={customBoldClass}>
          {boldContent}
        </strong>
      );
    }
    if (part.startsWith('||') && part.endsWith('||') && part.length >= 4) {
      const spoilerContent = part.slice(2, -2);
      return (
        <InlineSpoiler key={index} content={spoilerContent} />
      );
    }
    return part;
  });
}
