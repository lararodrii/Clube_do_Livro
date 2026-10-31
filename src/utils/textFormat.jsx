import React from 'react';

/**
 * Formata texto substituindo marcações de negrito (**texto**) por tags <strong> reais,
 * preservando parágrafos e quebras de linha em conjunto com 'whitespace-pre-line'.
 * 
 * Exemplo:
 * "Trecho **muito importante** de leitura" ->
 * <span>Trecho <strong className="...">muito importante</strong> de leitura</span>
 */
export function formatTextWithBold(text, customBoldClass = 'font-bold text-amber-600 dark:text-amber-300') {
  if (!text || typeof text !== 'string') {
    return text || '';
  }

  // Divide o texto mantendo o separador **conteúdo**
  const parts = text.split(/(\*\*[^*]+?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const boldContent = part.slice(2, -2);
      return (
        <strong key={index} className={customBoldClass}>
          {boldContent}
        </strong>
      );
    }
    return part;
  });
}
