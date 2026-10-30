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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-[#FAF7F0] rounded-2xl max-w-xl w-full p-6 sm:p-8 border-2 border-[#1E1E1E] shadow-[8px_8px_0px_#1E1E1E] overflow-hidden text-center max-h-[90vh] overflow-y-auto">
        
        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          disabled={isSpinning}
          className="absolute top-5 right-5 text-stone-500 hover:text-[#141414] p-2 rounded-lg border-2 border-[#1E1E1E] bg-white hover:bg-[#FEF08A] transition-colors disabled:opacity-30 shadow-[2px_2px_0px_#1E1E1E]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="mb-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#FEF08A] border-2 border-[#1E1E1E] text-[#141414] text-xs font-mono font-black uppercase tracking-wider mb-2 shadow-[2px_2px_0px_#1E1E1E]">
            <span className="text-[#D62828]">★</span>
            <span>Sorteio Popular da Assembleia 🎲</span>
          </div>
          <h3 className="font-headline font-black text-2xl sm:text-3xl text-[#141414]">
            Desempate da Sorte
          </h3>
          <p className="text-xs sm:text-sm text-[#57534E] mt-1 max-w-sm mx-auto font-reading font-semibold">
            Quando a votação fica acirrada entre as camaradas, a roleta decide democraticamente a próxima leitura!
          </p>
        </div>

        {/* VISUAL DA ROLETA */}
        <div className="relative my-6 flex flex-col items-center justify-center z-10">
          
          {/* Ponteiro Indicador Superior */}
          <div className="z-30 -mb-3 text-[#D62828] filter drop-shadow-[0_2px_0px_#1E1E1E] animate-bounce">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-[#D62828]" />
          </div>

          {/* Disco da Roleta Estilizado */}
          <div 
            className="w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-[#1E1E1E] bg-[#141414] relative overflow-hidden shadow-[4px_4px_0px_#1E1E1E] flex items-center justify-center transition-transform duration-[3500ms] cubic-bezier(0.12, 0.8, 0.32, 1)"
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
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FEF08A] mt-1 border border-[#1E1E1E]" />
                  </div>
                </div>
              );
            })}

            {/* Centro da Roleta com Estrela Vermelha */}
            <div className="w-20 h-20 rounded-full bg-white border-4 border-[#1E1E1E] flex items-center justify-center shadow-lg z-20">
              <span className="text-3xl font-black text-[#D62828]">★</span>
            </div>
          </div>

          {/* Foco Atual */}
          <div className="mt-6 p-4 rounded-xl bg-white border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E] w-full max-w-md">
            <span className="text-[10px] font-mono font-black text-[#D62828] uppercase tracking-wider block mb-1">
              ★ Foco Atual do Sorteio:
            </span>
            <p className="font-headline text-lg font-black text-[#141414] truncate">
              {candidateBooks[selectedIndex]?.title || 'Gire a roleta'}
            </p>
            <p className="text-xs text-[#57534E] italic font-reading">
              {candidateBooks[selectedIndex] ? `por ${candidateBooks[selectedIndex].author}` : ''}
            </p>
          </div>
        </div>

        {/* Vencedor Revelado com o Mascote Comemorando */}
        {winnerBook && !isSpinning && (
          <div className="p-5 bg-white rounded-xl border-2 border-[#D62828] shadow-[4px_4px_0px_#D62828] mb-6 animate-pop relative z-10 flex flex-col items-center">
            <div className="scale-75 -my-2">
              <ComradeCat pose="celebrating" size="sm" showBubble={false} />
            </div>

            <div className="flex items-center justify-center gap-2 text-[#D62828] font-mono font-black text-xs uppercase mb-1">
              <Trophy className="w-4 h-4 text-[#BC6C25]" />
              <span>OBRA ELEITA PELA ROLETA:</span>
            </div>
            
            <h4 className="font-headline text-xl sm:text-2xl font-black text-[#141414]">
              {winnerBook.title}
            </h4>
            <p className="text-xs text-[#57534E] italic font-reading">
              por {winnerBook.author} ({winnerBook.pages} págs)
            </p>

            <button
              onClick={handlePromoteWinner}
              className="mt-4 px-6 py-2.5 bg-[#D62828] hover:bg-[#9E2A2B] text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 flex items-center justify-center gap-2 mx-auto"
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
            className="px-8 py-3.5 bg-[#D62828] hover:bg-[#9E2A2B] disabled:opacity-50 text-white font-headline font-black text-sm uppercase tracking-wider rounded-xl border-2 border-[#1E1E1E] shadow-[4px_4px_0px_#1E1E1E] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2.5"
          >
            <RotateCw className={`w-5 h-5 text-[#FEF08A] ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'Consultando as camaradas...' : 'Girar a Roleta Popular! 🎲★'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
