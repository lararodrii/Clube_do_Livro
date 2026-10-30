import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import BookCover from '../common/BookCover';
import ComradeCat from '../common/ComradeCat';
import EditCurrentReadingModal from './EditCurrentReadingModal';
import BookEvaluationModal from './BookEvaluationModal';
import { 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Bookmark, 
  ChevronDown, 
  ChevronUp,
  Pencil,
  Sparkles,
  Layers,
  Star
} from 'lucide-react';

export default function CurrentReadingCard() {
  const { currentReading, activeMember, members, toggleWeeklyGoal, triggerComradeConfetti } = useClub();
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [prefer3DMockup, setPrefer3DMockup] = useState(false);
  const [animatingGoalId, setAnimatingGoalId] = useState(null);

  // Metas concluídas pelo membro ativo
  const activeMemberGoals = currentReading.memberProgress?.[activeMember.id] || [];
  const totalGoals = currentReading.readingGoals?.length || 4;
  const memberCompletionPercent = Math.round((activeMemberGoals.length / totalGoals) * 100);

  // Avaliação já feita pelo membro ativo nesta obra
  const myReview = currentReading.reviews?.find(r => r.memberId === activeMember.id);

  // Média do clube
  const allCompletedGoals = Object.values(currentReading.memberProgress || {}).flat().length;
  const clubCompletionPercent = Math.round((allCompletedGoals / (members.length * totalGoals)) * 100);

  const handleGoalClick = (goalId) => {
    setAnimatingGoalId(goalId);
    
    const isNowCompleting = !activeMemberGoals.includes(goalId);
    toggleWeeklyGoal(goalId);
    
    // Se estava desmarcado e agora está marcando, dispara confete comemorativo
    if (isNowCompleting && triggerComradeConfetti) {
      triggerComradeConfetti();
    }

    // Se marcou a Semana 4 (conclusão da leitura), abre automaticamente o modal de avaliação!
    if (isNowCompleting && (goalId === 4 || goalId === currentReading.readingGoals?.length)) {
      setTimeout(() => {
        setIsEvaluationModalOpen(true);
      }, 350);
    }

    setTimeout(() => setAnimatingGoalId(null), 500);
  };

  return (
    <div className="retro-card rounded-2xl p-6 sm:p-8 relative bg-white border-2 border-[#1E1E1E] shadow-[6px_6px_0px_#1E1E1E]">
      
      {/* Detalhe de fita de carimbo revolucionário no canto */}
      <div className="absolute top-0 right-10 bg-[#D62828] text-[#FEF08A] font-mono text-xs font-black px-3 py-1.5 border-b-2 border-x-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] hidden sm:flex items-center gap-1">
        <span>★</span>
        <span>LEITURA DO COLETIVO</span>
      </div>

      {/* Banner de Destaque com o Mascote e Slogan Oficial */}
      <div className="mb-6 rounded-xl bg-[#FAF7F0] border-2 border-[#1E1E1E] p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[3px_3px_0px_#1E1E1E]">
        <div className="flex items-center gap-3.5">
          <div className="shrink-0">
            <ComradeCat 
              pose="reading" 
              size="sm" 
              showBubble={false}
              className="scale-90"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-headline font-black text-[#D62828] text-base sm:text-lg tracking-tight">
                "Não vai lutar contra o fascismo?"
              </span>
              <span className="text-[10px] bg-[#283618] text-[#FEF08A] font-mono font-extrabold px-2 py-0.5 rounded border border-[#1E1E1E] uppercase tracking-wider">
                Comitê Literário
              </span>
            </div>
            <p className="text-xs text-[#57534E] font-reading font-semibold italic mt-0.5">
              "Sem teoria crítica e páginas lidas, não há transformação!"
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-black text-[#141414] bg-[#FEF08A] px-3.5 py-1.5 rounded-lg border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] shrink-0">
          <span className="text-[#D62828]">★</span>
          <span>{currentReading.monthYear || 'Novembro / 2026'}</span>
        </div>
      </div>

      {/* Cabeçalho do Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-[#1E1E1E]">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-[#D62828] border border-[#1E1E1E] animate-pulse" />
          <span className="text-xs font-mono font-black uppercase tracking-wider px-3 py-1 rounded bg-[#FDF0ED] text-[#D62828] border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] flex items-center gap-1.5">
            <span>★</span> {currentReading.badge || 'Livro em Debate'}
          </span>
          <span className="text-[#1E1E1E] font-bold">•</span>
          <span className="text-xs text-[#57534E] font-reading font-bold italic">
            Meta ativa
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Alternar Mockup 3D */}
          <button
            type="button"
            onClick={() => setPrefer3DMockup(!prefer3DMockup)}
            title="Alternar entre capa original e mockup 3D realista"
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold text-[#141414] bg-white hover:bg-[#FAF7F0] border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] rounded-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
          >
            <Layers className="w-3.5 h-3.5 text-[#D62828]" />
            <span className="hidden sm:inline">{prefer3DMockup ? 'Capa Plana' : 'Mockup 3D'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            title="Editar informações da leitura atual"
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold text-white bg-[#283618] hover:bg-[#1E2812] border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] rounded-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
          >
            <Pencil className="w-3.5 h-3.5 text-[#FEF08A]" />
            <span>Editar Obra</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Principal: Capa 3D + Detalhes */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Coluna da Capa */}
        <div className="md:col-span-5 lg:col-span-4 flex flex-col items-center">
          <BookCover
            src={currentReading.coverUrl}
            title={currentReading.title}
            author={currentReading.author}
            size="lg"
            forceRealistic3D={prefer3DMockup}
            badge={
              <span className="bg-[#D62828] text-white border-2 border-[#1E1E1E] text-[10px] font-mono font-black px-2.5 py-1 rounded shadow-[2px_2px_0px_#1E1E1E] uppercase tracking-wider flex items-center gap-1">
                <span>★</span> Em Leitura
              </span>
            }
          />

          <div className="mt-5 text-center flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-mono font-black uppercase px-3 py-1 rounded bg-[#FAF7F0] text-[#141414] border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E]">
              {currentReading.genre}
            </span>
            <span className="text-[11px] font-mono font-black uppercase px-3 py-1 rounded bg-[#FEF08A] text-[#141414] border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E]">
              {currentReading.pages} páginas
            </span>
          </div>
        </div>

        {/* Coluna de Detalhes e Metas Semanais */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-between">
          <div>
            <h2 className="font-headline font-black text-2xl sm:text-3xl md:text-4xl text-[#141414] tracking-tight leading-tight">
              {currentReading.title}
            </h2>
            <p className="text-base sm:text-lg text-[#D62828] font-reading italic mt-1 font-bold">
              por {currentReading.author}
            </p>

            {/* Sinopse em Caixa Estilo Jornal de Época */}
            <div className="mt-4 text-[#141414] text-xs sm:text-sm leading-relaxed bg-[#FAF7F0] p-4 sm:p-5 rounded-xl border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E]">
              <div className="flex items-center gap-2 text-[#9E2A2B] font-mono text-[10px] uppercase font-black mb-1">
                <span>★ RESUMO DA OBRA:</span>
              </div>
              <p className={`font-reading ${showFullSynopsis ? '' : 'line-clamp-3'}`}>
                {currentReading.synopsis}
              </p>
              <button
                onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                className="mt-2 text-xs font-mono font-bold text-[#D62828] hover:text-[#9E2A2B] flex items-center gap-1 underline focus:outline-none"
              >
                {showFullSynopsis ? (
                  <>Recolher sinopse <ChevronUp className="w-3.5 h-3.5" /></>
                ) : (
                  <>Ler sinopse completa <ChevronDown className="w-3.5 h-3.5" /></>
                )}
              </button>
            </div>
          </div>

          {/* Progresso de Leitura Coletivo e Individual com o Mascote */}
          <div className="mt-6 pt-6 border-t-2 border-[#1E1E1E]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <h4 className="text-sm sm:text-base font-headline font-black text-[#141414] flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-[#D62828]" />
                  <span>Metas Semanais de Leitura</span>
                  <span className="text-[#D62828]">★</span>
                </h4>
                <p className="text-xs text-[#57534E] font-reading font-semibold">
                  Clique no card da semana para registrar o seu progresso individual
                </p>
              </div>

              {/* Indicadores de Percentual e Botão de Avaliação da Semana 4 */}
              <div className="flex items-center gap-2.5 sm:gap-3 text-right flex-wrap">
                {activeMemberGoals.includes(4) && (
                  <button
                    type="button"
                    onClick={() => setIsEvaluationModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF08A] hover:bg-[#FDE047] text-[#141414] text-xs font-mono font-black border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] rounded-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <Star className="w-3.5 h-3.5 text-[#D62828] fill-[#D62828]" />
                    <span>{myReview ? `★ Minha Avaliação (${myReview.rating}★)` : '★ Avaliar Obra Concluída'}</span>
                  </button>
                )}

                <div className="bg-[#FAF7F0] p-2 rounded-lg border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E]">
                  <span className="text-[9px] font-mono text-[#57534E] font-bold uppercase tracking-wider block">Seu Avanço:</span>
                  <span className="text-sm font-mono font-black text-[#D62828]">
                    {memberCompletionPercent}%
                  </span>
                </div>
                <div className="bg-[#FAF7F0] p-2 rounded-lg border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E]">
                  <span className="text-[9px] font-mono text-[#57534E] font-bold uppercase tracking-wider block">Média do Clube:</span>
                  <span className="text-sm font-mono font-black text-[#283618]">
                    {clubCompletionPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Barra de Progresso Vibrante em Vermelho com Borda Neo-brutalista */}
            <div className="w-full bg-[#FAF7F0] h-5 rounded-lg border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] overflow-hidden mb-5 p-0.5 relative">
              <div
                className="bg-[#D62828] h-full rounded transition-all duration-500 relative flex items-center justify-end pr-2"
                style={{ width: `${Math.max(memberCompletionPercent, 5)}%` }}
              >
                {memberCompletionPercent >= 20 && (
                  <span className="text-[10px] font-mono font-black text-[#FEF08A] tracking-wider">
                    ★ {memberCompletionPercent}%
                  </span>
                )}
              </div>
            </div>

            {/* Grid de Metas Semanais com Cards Dinâmicos e Checkmarks Animados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {currentReading.readingGoals?.map((goal) => {
                const isCompleted = activeMemberGoals.includes(goal.id);
                const isAnimating = animatingGoalId === goal.id;
                
                // Membros que já concluíram esta meta
                const membersWhoCompleted = members.filter(m => 
                  currentReading.memberProgress?.[m.id]?.includes(goal.id)
                );

                return (
                  <div
                    key={goal.id}
                    onClick={() => handleGoalClick(goal.id)}
                    className={`cursor-pointer p-4 rounded-xl border-2 border-[#1E1E1E] transition-all duration-150 text-left select-none relative group ${
                      isCompleted
                        ? 'bg-[#FDF0ED] shadow-[4px_4px_0px_#9E2A2B] translate-x-[-1px] translate-y-[-1px]'
                        : 'bg-white hover:bg-[#FAF7F0] shadow-[3px_3px_0px_#1E1E1E] hover:-translate-x-0.5 hover:-translate-y-0.5'
                    } ${isAnimating ? 'animate-pop' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-mono font-black text-[#141414] uppercase tracking-wider">
                        {goal.week}
                      </span>
                      {isCompleted ? (
                        <div className="w-6 h-6 rounded-md bg-[#D62828] text-white border-2 border-[#1E1E1E] flex items-center justify-center shadow-[1px_1px_0px_#1E1E1E] shrink-0 group-hover:scale-110 transition-transform">
                          <CheckCircle2 className="w-4 h-4 text-[#FEF08A]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-md bg-white border-2 border-[#1E1E1E] flex items-center justify-center shadow-[1px_1px_0px_#1E1E1E] shrink-0 group-hover:border-[#D62828] transition-colors">
                          <Circle className="w-3.5 h-3.5 text-stone-300 group-hover:text-[#D62828]" />
                        </div>
                      )}
                    </div>

                    <p className={`text-xs font-bold mt-2 font-headline leading-tight ${isCompleted ? 'text-[#D62828]' : 'text-[#141414]'}`}>
                      {goal.label}
                    </p>
                    <p className="text-[11px] text-[#57534E] mt-1 font-mono">
                      {goal.pages}
                    </p>

                    {/* Status de leitura e avatares */}
                    <div className="mt-3 pt-2 border-t border-[#1E1E1E]/20 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-[#141414]">
                        {membersWhoCompleted.length}/6 leram
                      </span>
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {membersWhoCompleted.map(m => (
                          <img
                            key={m.id}
                            src={m.avatar}
                            alt={m.name}
                            title={`${m.name} concluiu`}
                            className="w-4 h-4 rounded-full border border-[#1E1E1E] object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>

      {/* Modal de Edição do Livro Atual */}
      <EditCurrentReadingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Modal de Avaliação ao Concluir a Semana 4 */}
      <BookEvaluationModal
        isOpen={isEvaluationModalOpen}
        onClose={() => setIsEvaluationModalOpen(false)}
      />
    </div>
  );
}
