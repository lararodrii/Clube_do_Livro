import React, { useState, useRef } from 'react';
import ComradeCat from './ComradeCat';

export default function BookCover({
  src,
  alt = 'Capa do Livro',
  title = 'Como as democracias morrem',
  author = 'Steven Levitsky & Daniel Ziblatt',
  pages = 272,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
  badge = null,
  forceRealistic3D = false
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(!forceRealistic3D);

  // Estados de inclinação 3D interativa (Tilt ao cursor) e brilho dinâmico
  const [tilt, setTilt] = useState({ x: 3, y: -14 });
  const [glare, setGlare] = useState({ x: 50, y: 30, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const containerRef = useRef(null);

  const sizeClasses = {
    sm: 'w-24 h-36',
    md: 'w-36 h-52',
    lg: 'w-44 h-64 sm:w-56 sm:h-80 max-w-[200px] sm:max-w-[240px]',
    xl: 'w-52 h-76 sm:w-72 sm:h-104 max-w-[240px] sm:max-w-[280px]'
  };

  const show3DMockup = forceRealistic3D || hasError || !src;

  // Cálculo da espessura física da lombada proporcional às páginas da obra
  const numericPages = Number(pages) || 250;
  const spineWidth = Math.min(34, Math.max(12, Math.round(numericPages / 15)));

  // Interatividade 3D onMouseMove seguindo o cursor do mouse
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    // Inclinações dinâmicas
    const rotateX = (0.5 - y) * 24;
    const rotateY = (x - 0.5) * 32 - 10;

    setTilt({ x: rotateX, y: rotateY });
    setGlare({ x: x * 100, y: y * 100, opacity: 0.38 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Retorna suavemente à pose padrão de vitrine editorial
    setTilt({ x: 3, y: -14 });
    setGlare({ x: 50, y: 30, opacity: 0 });
  };

  const dynamicTransform = `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${
    isHovered ? 'translateY(-6px) scale(1.02)' : ''
  }`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-block select-none group book-3d-wrapper ${className}`}
    >
      {/* Sombra Projetada Realista no Chão */}
      <div 
        className="absolute -bottom-4 left-2 right-1 h-6 bg-black/50 rounded-[100%] blur-md -z-10 transform skew-x-[-15deg] pointer-events-none transition-all duration-300"
        style={{
          transform: `skewX(${tilt.y > 0 ? 10 : -18}deg) scale(${isHovered ? 1.08 : 1})`,
          opacity: isHovered ? 0.9 : 0.65
        }}
      />

      {show3DMockup ? (
        /* MOCKUP 3D REALISTA DO LIVRO COM O MASCOTE E ARTE RETRÔ */
        <div 
          className={`book-3d ${sizeClasses[size] || sizeClasses.md} rounded-r-md rounded-l-sm bg-gradient-to-tr from-[#7F1D1D] via-[#9E2A2B] to-[#D62828] border-2 border-[#1E1E1E] p-4 flex flex-col justify-between text-center overflow-hidden cursor-pointer shadow-2xl`}
          style={{ transform: dynamicTransform }}
        >
          {/* Laterais das páginas com espessura calculada pelas páginas da obra */}
          <div 
            className="book-pages-block"
            style={{ 
              right: `-${spineWidth}px`, 
              width: `${spineWidth}px` 
            }}
          />

          {/* Relevo e Sombra da Lombada Editorial */}
          <div className="book-spine-relief" />
          <div className="book-hinge-crease" />

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

          {/* Base da Capa com contagem de páginas da lombada */}
          <div className="relative z-10 pb-0.5 flex items-center justify-between px-1">
            <span className="text-[8px] font-mono tracking-widest text-white/80 uppercase">
              EDIÇÃO COLETIVA
            </span>
            <span className="text-[8px] font-mono text-[#FEF08A] font-bold">
              {pages} p.
            </span>
          </div>

          {/* Reflexo de Luz / Glare Dinâmico que segue o Cursor */}
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-200"
            style={{
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}) 0%, transparent 65%)`
            }}
          />
        </div>
      ) : (
        /* CAPA REAL COM TILT INTERATIVO, REFLEXO DINÂMICO E ESPESSURA DE PÁGINAS */
        <div
          className={`book-3d ${sizeClasses[size] || sizeClasses.md} relative overflow-hidden rounded-r-md rounded-l-sm bg-[#1E1E1E] border-2 border-[#1E1E1E] shadow-2xl cursor-pointer`}
          style={{ transform: dynamicTransform }}
        >
          {/* Bloco de páginas lateral calculado pelas páginas */}
          <div 
            className="book-pages-block"
            style={{ 
              right: `-${spineWidth}px`, 
              width: `${spineWidth}px` 
            }}
          />

          {/* Efeito de Lombada 3D com Relevo e Vinco Físico */}
          <div className="book-spine-relief" />
          <div className="book-hinge-crease" />

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
            <div className="absolute inset-0 bg-theme-card flex flex-col items-center justify-center p-3 text-center">
              <ComradeCat pose="reading" size="sm" showBubble={false} />
              <p className="text-[10px] text-theme-red font-mono font-bold mt-1 animate-pulse">
                Carregando Obra...
              </p>
            </div>
          )}

          {/* Reflexo Glare Dinâmico */}
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-200"
            style={{
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}) 0%, transparent 65%)`
            }}
          />
        </div>
      )}

      {/* Badge sobreposto estilizado com efeito de Carimbo */}
      {badge && (
        <div className="absolute -top-3 -right-3 z-30 filter drop-shadow-[2px_2px_0px_#1E1E1E] rev-stamp-animate">
          {badge}
        </div>
      )}
    </div>
  );
}
