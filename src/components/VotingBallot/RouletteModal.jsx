import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import ComradeCat from '../common/ComradeCat';
import { 
  Dices, 
  X, 
  Trophy, 
  CheckCircle,
  RotateCw
} from 'lucide-react';

export default function RouletteModal({ isOpen, onClose, books = [] }) {
  const { promoteToCurrentBook, triggerComradeConfetti } = useClub();
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [winnerBook, setWinnerBook] = useState(null);
  const [rotationDegrees, setRotationDegrees] = useState(0);

  const candidateBooks = books.length > 0 ? books : [];

  const handleSpin = () => {
    if (isSpinning || candidateBooks.length === 0) return;

    setIsSpinning(true);
    setWinnerBook(null);

    const winningIdx = Math.floor(Math.random() * candidateBooks.length);
    const spins = 5 + Math.floor(Math.random() * 3);
    const segmentAngle = 360 / candidateBooks.length;
    const targetAngle = spins * 360 + (candidateBooks.length - winningIdx) * segmentAngle - segmentAngle / 2;

    setRotationDegrees(prev => prev + targetAngle);

    let step = 0;
    const totalSteps = 28;
    const intervalTime = 100;
    
    const stepper = setInterval(() => {
      step++;
      setSelectedIndex(prev => (prev + 1) % candidateBooks.length);
      if (step >= totalSteps) {
        clearInterval(stepper);
      }
    }, intervalTime);

    setTimeout(() => {
      setSelectedIndex(winningIdx);
      setWinnerBook(candidateBooks[winningIdx]);
      setIsSpinning(false);

      if (triggerComradeConfetti) {
        triggerComradeConfetti(120);
      }
    }, 3500);
  };

  const handlePromoteWinner = () => {
    if (winnerBook) {
      promoteToCurrentBook(winnerBook.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative bg-theme-container text-theme-primary rounded-2xl w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 mx-auto border-2 border-theme-border shadow-[8px_8px_0px_var(--shadow-color)] text-center my-4 sm:my-8">
        
        {/* Cabeçalho com Botão de Fechar sem sobreposição */}
        <div className="flex items-start justify-between gap-3 w-full pb-2 mb-4 relative z-10 text-left">
          <div className="flex-1 min-w-0 pr-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#FEF08A] border-2 border-theme-border text-[#111111] text-xs font-mono font-black uppercase tracking-wider mb-1 shadow-[2px_2px_0px_var(--shadow-color)]">
              <span className="text-theme-red">★</span>
              <span>Sorteio Popular da Assembleia 🎲</span>
            </div>
            <h3 className="font-headline font-black text-xl sm:text-2xl text-theme-primary">
              Desempate da Sorte
            </h3>
            <p className="text-xs sm:text-sm text-theme-muted mt-1 font-reading font-semibold">
              Quando a votação fica acirrada entre as camaradas, a roleta decide democraticamente a próxima leitura!
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            disabled={isSpinning}
            title="Fechar modal"
            className="shrink-0 z-30 w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer text-theme-muted hover:text-theme-primary border-2 border-theme-border bg-theme-card hover:bg-theme-gold/20 transition-colors disabled:opacity-30 shadow-[2px_2px_0px_var(--shadow-color)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VISUAL DA ROLETA */}
        <div className="relative my-6 flex flex-col items-center justify-center z-10">
          
          {/* Ponteiro Indicador Superior */}
          <div className="z-30 -mb-3 text-theme-red filter drop-shadow-[0_2px_0px_var(--shadow-color)] animate-bounce">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-theme-red" />
          </div>

          {/* Disco da Roleta Estilizado */}
          <div 
            className="w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-theme-border bg-theme-card relative overflow-hidden shadow-[4px_4px_0px_var(--shadow-color)] flex items-center justify-center transition-transform duration-[3500ms] cubic-bezier(0.12, 0.8, 0.32, 1)"
            style={{ transform: `rotate(${rotationDegrees}deg)` }}
          >
            {candidateBooks.map((book, idx) => {
              const count = candidateBooks.length;
              const angle = (360 / count) * idx;
              const colors = ['#D62828', '#283618', '#BC6C25', '#9E2A2B', '#DDA15E', '#1E2812'];
              const sliceColor = colors[idx % colors.length];

              return (
                <div
                  key={book.id}
                  className="absolute top-0 left-0 w-full h-full flex items-start justify-center origin-center pt-3"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-white max-w-[80px] truncate drop-shadow">
                      {book.title}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FEF08A] mt-1 border border-theme-border" />
                  </div>
                </div>
              );
            })}

            {/* Centro da Roleta com Estrela Vermelha */}
            <div className="w-20 h-20 rounded-full bg-theme-card border-4 border-theme-border flex items-center justify-center shadow-lg z-20">
              <span className="text-3xl font-black text-theme-red">★</span>
            </div>
          </div>

          {/* Foco Atual */}
          <div className="mt-6 p-4 rounded-xl bg-theme-card border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] w-full max-w-md">
            <span className="text-[10px] font-mono font-black text-theme-red uppercase tracking-wider block mb-1">
              ★ Foco Atual do Sorteio:
            </span>
            <p className="font-headline text-lg font-black text-theme-primary truncate">
              {candidateBooks[selectedIndex]?.title || 'Gire a roleta'}
            </p>
            <p className="text-xs text-theme-muted italic font-reading">
              {candidateBooks[selectedIndex] ? `por ${candidateBooks[selectedIndex].author}` : ''}
            </p>
          </div>
        </div>

        {/* Vencedor Revelado com o Mascote Comemorando */}
        {winnerBook && !isSpinning && (
          <div className="p-5 bg-theme-card rounded-xl border-2 border-theme-red shadow-[4px_4px_0px_var(--accent-red)] mb-6 animate-pop relative z-10 flex flex-col items-center">
            <div className="scale-75 -my-2">
              <ComradeCat pose="celebrating" size="sm" showBubble={false} />
            </div>

            <div className="flex items-center justify-center gap-2 text-theme-red font-mono font-black text-xs uppercase mb-1">
              <Trophy className="w-4 h-4 text-theme-gold" />
              <span>OBRA ELEITA PELA ROLETA:</span>
            </div>
            
            <h4 className="font-headline text-xl sm:text-2xl font-black text-theme-primary">
              {winnerBook.title}
            </h4>
            <p className="text-xs text-theme-muted italic font-reading">
              por {winnerBook.author} ({winnerBook.pages} págs)
            </p>

            <button
              onClick={handlePromoteWinner}
              className="mt-4 px-6 py-2.5 bg-theme-red hover:brightness-110 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 flex items-center justify-center gap-2 mx-auto"
            >
              <CheckCircle className="w-4 h-4 text-[#FEF08A]" />
              <span>Promover a Livro do Mês ★</span>
            </button>
          </div>
        )}

        {/* Botão de Rodar a Roleta */}
        <div className="flex items-center justify-center gap-3 relative z-10">
          <button
            onClick={handleSpin}
            disabled={isSpinning || candidateBooks.length === 0}
            className="px-8 py-3.5 bg-theme-red hover:brightness-110 disabled:opacity-50 text-white font-headline font-black text-sm uppercase tracking-wider rounded-xl border-2 border-theme-border shadow-[4px_4px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2.5"
          >
            <RotateCw className={`w-5 h-5 text-[#FEF08A] ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'Consultando as camaradas...' : 'Girar a Roleta Popular! 🎲★'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
