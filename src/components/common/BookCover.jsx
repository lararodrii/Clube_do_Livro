import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import ComradeCat from './ComradeCat';

export default function BookCover({
  src,
  alt = 'Capa do Livro',
  title = 'Como as democracias morrem',
  author = 'Steven Levitsky & Daniel Ziblatt',
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
  badge = null,
  forceRealistic3D = false
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(!forceRealistic3D);

  const sizeClasses = {
    sm: 'w-24 h-36',
    md: 'w-36 h-52',
    lg: 'w-52 h-76 sm:w-60 sm:h-88',
    xl: 'w-64 h-92 sm:w-72 sm:h-104'
  };

  const show3DMockup = forceRealistic3D || hasError || !src;

  return (
    <div className={`relative inline-block select-none group book-3d-wrapper ${className}`}>
      
      {show3DMockup ? (
        /* MOCKUP 3D REALISTA DO LIVRO COM O MASCOTE E ARTE RETRÔ */
        <div 
          className={`book-3d ${sizeClasses[size] || sizeClasses.md} rounded-r-md rounded-l-sm bg-gradient-to-tr from-[#7F1D1D] via-[#9E2A2B] to-[#D62828] border-2 border-[#1E1E1E] p-4 flex flex-col justify-between text-center overflow-hidden cursor-pointer`}
        >
          {/* Sombra da Lombada */}
          <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute top-0 bottom-0 left-3 w-[1px] bg-white/20 pointer-events-none" />

          {/* Moldura Dourada da Capa */}
          <div className="absolute inset-2 border border-[#DDA15E]/60 pointer-events-none" />

          {/* Topo: Selo do Exército da Paty */}
          <div className="relative z-10 pt-1">
            <span className="text-[9px] uppercase font-mono tracking-widest text-[#FEF08A] font-extrabold bg-[#1E1E1E]/60 px-2 py-0.5 rounded border border-[#DDA15E]/50 inline-block">
              ★ EXÉRCITO DA PATY ★
            </span>
          </div>

          {/* Centro: Arte com o Mascote e Título */}
          <div className="relative z-10 my-auto flex flex-col items-center">
            {/* O Gato Camarada Estampado na Capa */}
            <div className="scale-75 -my-2 opacity-95 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              <ComradeCat pose="reading" size="sm" showBubble={false} />
            </div>

            <h3 className="font-headline font-black text-white text-xs sm:text-sm md:text-base leading-tight drop-shadow-md line-clamp-2 px-1 mt-1">
              {title}
            </h3>
            
            <div className="w-12 h-0.5 bg-[#DDA15E] my-1.5 opacity-80" />

            <p className="text-[10px] text-[#FEF08A] font-mono tracking-wider uppercase font-bold truncate max-w-full px-1">
              {author}
            </p>
          </div>

          {/* Base da Capa */}
          <div className="relative z-10 pb-0.5">
            <span className="text-[8px] font-mono tracking-widest text-white/80 uppercase">
              EDIÇÃO DO COLETIVO
            </span>
          </div>

          {/* Reflexo de luz na capa */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
        </div>
      ) : (
        /* CAPA REAL IMPORTADA COM PERSPECTIVA E MOLDURA VINTAGE */
        <div
          className={`book-3d ${sizeClasses[size] || sizeClasses.md} relative overflow-hidden rounded-r-md rounded-l-sm bg-[#1E1E1E] border-2 border-[#1E1E1E]`}
        >
          {/* Efeito de Lombada 3D */}
          <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-black/70 via-black/20 to-transparent z-20 pointer-events-none" />
          <div className="absolute top-0 bottom-0 left-3 w-[1px] bg-white/30 z-20 pointer-events-none" />

          {/* Imagem da Capa */}
          <img
            src={src}
            alt={alt || title}
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
          />

          {/* Shimmer de Carregamento com Mascote */}
          {isLoading && (
            <div className="absolute inset-0 bg-[#FAF7F0] flex flex-col items-center justify-center p-3 text-center">
              <ComradeCat pose="reading" size="sm" showBubble={false} />
              <p className="text-[10px] text-[#9E2A2B] font-mono font-bold mt-1 animate-pulse">
                Carregando Obra...
              </p>
            </div>
          )}

          {/* Brilho acetinado ao passar o mouse */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      )}

      {/* Badge sobreposto estilizado */}
      {badge && (
        <div className="absolute -top-3 -right-3 z-30 filter drop-shadow-[2px_2px_0px_#1E1E1E]">
          {badge}
        </div>
      )}
    </div>
  );
}
