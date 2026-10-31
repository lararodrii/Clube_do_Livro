import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { useAuth } from '../../context/AuthContext';
import BookCover from '../common/BookCover';
import ComradeCat from '../common/ComradeCat';
import EditCurrentReadingModal from './EditCurrentReadingModal';
import BookEvaluationModal from './BookEvaluationModal';
import { formatTextWithBold } from '../../utils/textFormat';
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
  Star,
  Archive
} from 'lucide-react';

export default function CurrentReadingCard() {
  const { currentReading, activeMember, members, toggleWeeklyGoal, triggerComradeConfetti, archiveCurrentReading, archive } = useClub();
  const { isAuthenticated, openAuthModal } = useAuth();
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [prefer3DMockup, setPrefer3DMockup] = useState(false);
  const [animatingGoalId, setAnimatingGoalId] = useState(null);

  // Metas concluídas pelo membro ativo
  const activeMemberGoals = currentReading.memberProgress?.[activeMember.id] || [];
  const totalGoals = currentReading.readingGoals?.length || 4;
  const memberCompletionPercent = Math.round((activeMemberGoals.length / totalGoals) * 100);

  // Status de arquivamento no Acervo
  const isArchived = currentReading.isArchived || (archive || []).some(b => b.title === currentReading.title);

  // Avaliação já feita pelo membro ativo nesta obra
  const myReview = currentReading.reviews?.find(r => r.memberId === activeMember.id);

  // Média do clube
  const allCompletedGoals = Object.values(currentReading.memberProgress || {}).flat().length;
  const clubCompletionPercent = Math.round((allCompletedGoals / (members.length * totalGoals)) * 100);

  const handleGoalClick = (goalId) => {
    if (!isAuthenticated) {
      openAuthModal('Faça login para registrar seu progresso semanal de leitura.', 'login');
      return;
    }

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

  const handleEditClick = () => {
    if (!isAuthenticated) {
      openAuthModal('Faça login para editar os dados da leitura atual.', 'login');
      return;
    }
    setIsEditModalOpen(true);
  };

  const handleArchiveClick = () => {
    if (!isAuthenticated) {
      openAuthModal('Faça login para arquivar a leitura no Acervo Histórico.', 'login');
      return;
    }
    archiveCurrentReading(true);
  };

  const handleEvaluationClick = () => {
    if (!isAuthenticated) {
      openAuthModal('Faça login para avaliar e deixar notas sobre a leitura.', 'login');
      return;
    }
    setIsEvaluationModalOpen(true);
  };

  return (
    <div className="retro-card rounded-2xl p-3.5 sm:p-8 relative bg-theme-container border-2 border-theme-border shadow-[6px_6px_0px_var(--shadow-color)] transition-colors duration-300">
      
      {/* Detalhe de fita de carimbo revolucionário no canto */}
      <div className="absolute top-0 right-10 bg-theme-red text-white font-mono text-xs font-black px-3 py-1.5 border-b-2 border-x-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] hidden sm:flex items-center gap-1">
        <span>★</span>
        <span>LEITURA DO COLETIVO</span>
      </div>

      {/* Banner de Destaque com o Mascote e Slogan Oficial (Horizontal Proporcional) */}
      <div className="mb-4 sm:mb-6 rounded-xl bg-theme-card border-2 border-theme-border p-2.5 sm:p-5 flex flex-row items-center justify-between gap-2 shadow-[3px_3px_0px_var(--shadow-color)]">
        <div className="w-10 h-10 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center">
          <ComradeCat 
            pose="reading" 
            size="sm" 
            showBubble={false}
            className="w-full h-full scale-90"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-nowrap">
            <span className="font-headline font-black text-theme-red text-xs sm:text-xl tracking-tight truncate">
              "Não vai lutar contra o fascismo?"
            </span>
            <span className="text-[7px] sm:text-[10px] bg-theme-container text-theme-gold font-mono font-extrabold px-1.5 py-0.5 rounded border border-theme-border uppercase tracking-wider whitespace-nowrap shrink-0">
              COMITÊ LITERÁRIO
            </span>
          </div>
          <p className="text-[9px] sm:text-xs text-theme-muted font-reading font-semibold italic mt-0.5 leading-tight truncate">
            "Sem teoria crítica e páginas lidas, não há transformação!"
          </p>
        </div>

        <div className="flex items-center gap-1 text-[9px] sm:text-xs font-mono font-black text-[#111111] bg-[#FEF08A] px-2 py-1 rounded-lg border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] whitespace-nowrap shrink-0">
          <span className="text-theme-red">★</span>
          <span>{currentReading.monthYear || 'Novembro / 2026'}</span>
        </div>
      </div>

      {/* Cabeçalho do Card e Botões de Ação */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-theme-border">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-theme-red border border-theme-border animate-pulse shrink-0" />
          <span className="whitespace-nowrap text-[9px] sm:text-xs px-2 py-0.5 font-mono font-black uppercase tracking-wider rounded bg-theme-card text-theme-red border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] flex items-center gap-1 shrink-0">
            <span>{currentReading.badge?.startsWith('★') ? currentReading.badge : `★ ${currentReading.badge || 'LEITURA DO COMITÊ'}`}</span>
          </span>
          <span className="text-theme-muted font-bold text-xs">•</span>
          <span className="whitespace-nowrap text-[9px] sm:text-xs text-theme-muted font-reading font-bold italic">
            Meta ativa
          </span>
        </div>

        <div className="flex flex-nowrap items-center justify-between sm:justify-end gap-1 sm:gap-2 w-full sm:w-auto">
          {/* Alternar Mockup 3D */}
          <button
            type="button"
            onClick={() => setPrefer3DMockup(!prefer3DMockup)}
            title="Alternar entre capa original e mockup 3D realista"
            className="flex items-center gap-1 text-[9px] sm:text-xs px-2 py-1 rounded font-mono font-bold whitespace-nowrap text-theme-primary bg-theme-card hover:bg-theme-container border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 shrink-0"
          >
            <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-theme-red shrink-0" />
            <span>{prefer3DMockup ? 'Capa Plana' : 'Mockup 3D'}</span>
          </button>

          <button
            type="button"
            onClick={handleEditClick}
            title="Editar informações da leitura atual"
            className="flex items-center gap-1 text-[9px] sm:text-xs px-2 py-1 rounded font-mono font-bold whitespace-nowrap text-theme-primary bg-theme-card hover:bg-theme-container border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 shrink-0"
          >
            <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-theme-gold shrink-0" />
            <span>Editar Obra</span>
          </button>

          {/* Botão Administrativo: Arquivar Obra Manualmente */}
          <button
            type="button"
            onClick={handleArchiveClick}
            title={isArchived ? "Obra já arquivada no Acervo Coletivo" : "Arquivar esta obra no Acervo & Resenhas"}
            className={`flex items-center gap-1 text-[9px] sm:text-xs px-2 py-1 rounded font-mono font-bold whitespace-nowrap border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 shrink-0 ${
              isArchived
                ? 'bg-theme-card text-theme-muted opacity-80'
                : 'bg-[#FEF08A] hover:bg-[#FDE047] text-[#111111] font-bold'
            }`}
          >
            <Archive className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-theme-red shrink-0" />
            <span>{isArchived ? 'Obra Arquivada' : 'Arquivar Manualmente'}</span>
          </button>
        </div>
      </div>

      {/* Notificação Visual Leve de Obra Arquivada no Acervo */}
      {isArchived && (
        <div className="mb-6 p-3.5 sm:p-4 rounded-xl bg-theme-card text-theme-primary border-2 border-theme-border shadow-[4px_4px_0px_var(--shadow-color)] flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-theme-gold animate-ping shrink-0" />
            <div>
              <p className="font-headline font-black text-xs sm:text-sm tracking-wide flex items-center gap-1.5 text-theme-primary">
                <span className="text-theme-gold">★</span> OBRA CATALOGADA NO ACERVO COLETIVO
              </p>
              <p className="text-[11px] sm:text-xs font-reading text-theme-secondary mt-0.5">
                Esta obra cumpriu o prazo da assembleia ou foi arquivada pelo comitê. As resenhas e métricas estão salvas no <strong>Acervo & Resenhas</strong>.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-black uppercase px-3 py-1 rounded bg-[#FEF08A] text-[#111111] font-bold border border-theme-border shadow-sm shrink-0">
            Status: Concluído ★
          </span>
        </div>
      )}

      {/* Conteúdo Principal: Capa 3D Centralizada no Mobile + Detalhes */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        
        {/* Coluna da Capa Centralizada no Mobile */}
        <div className="w-full md:w-auto shrink-0 flex flex-col items-center justify-center text-center mx-auto max-w-[200px] sm:max-w-[240px]">
          <BookCover
            src={currentReading.coverUrl}
            title={currentReading.title}
            author={currentReading.author}
            pages={currentReading.pages}
            size="lg"
            forceRealistic3D={prefer3DMockup}
            badge={
              <span className="bg-theme-red text-white font-bold border-2 border-theme-border text-[10px] font-mono px-2.5 py-1 rounded shadow-[2px_2px_0px_var(--shadow-color)] uppercase tracking-wider flex items-center gap-1">
                <span>★</span> Em Leitura
              </span>
            }
          />

          <div className="mt-5 text-center flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-mono font-black uppercase px-3 py-1 rounded bg-theme-card text-theme-primary border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)]">
              {currentReading.genre}
            </span>
            <span className="text-[11px] font-mono font-black uppercase px-3 py-1 rounded bg-[#FEF08A] text-[#111111] font-bold border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)]">
              {currentReading.pages} páginas
            </span>
          </div>
        </div>

        {/* Coluna de Detalhes e Metas Semanais */}
        <div className="flex-1 w-full flex flex-col justify-between">
          <div>
            <h2 className="font-headline font-black text-lg sm:text-3xl text-theme-primary tracking-tight leading-tight break-words">
              {currentReading.title}
            </h2>
            <p className="text-sm sm:text-lg text-theme-red font-reading italic mt-1 font-bold">
              por {currentReading.author}
            </p>

            {/* Sinopse em Caixa Estilo Jornal de Época */}
            <div className="mt-3 sm:mt-4 text-theme-secondary text-xs sm:text-base leading-relaxed bg-theme-card p-3 sm:p-5 rounded-xl border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)]">
              <div className="flex items-center gap-2 text-theme-red font-mono text-[9px] sm:text-[10px] uppercase font-black mb-1">
                <span>★ RESUMO DA OBRA:</span>
              </div>
              <p className={`font-reading whitespace-pre-line leading-relaxed ${showFullSynopsis ? '' : 'line-clamp-3'}`}>
                {formatTextWithBold(currentReading.synopsis, 'font-bold text-theme-red')}
              </p>
              <button
                onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                className="mt-2 text-xs font-mono font-bold text-theme-red hover:underline flex items-center gap-1 focus:outline-none"
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
          <div className="mt-6 pt-6 border-t-2 border-theme-border">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <h4 className="text-sm sm:text-base font-headline font-black text-theme-primary flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-theme-red" />
                  <span>Metas Semanais de Leitura</span>
                  <span className="text-theme-red">★</span>
                </h4>
                <p className="text-xs text-theme-muted font-reading font-semibold">
                  Clique no card da semana para registrar o seu progresso individual
                </p>
              </div>

              {/* Indicadores de Percentual e Botão de Avaliação da Semana 4 */}
              <div className="flex items-center gap-2.5 sm:gap-3 text-right flex-wrap">
                {activeMemberGoals.includes(4) && (
                  <button
                    type="button"
                    onClick={handleEvaluationClick}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF08A] hover:bg-[#FDE047] text-[#111111] font-bold text-xs font-mono border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] rounded-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <Star className="w-3.5 h-3.5 text-theme-red fill-current" />
                    <span>{myReview ? `★ Minha Avaliação (${myReview.rating}★)` : '★ Avaliar Obra Concluída'}</span>
                  </button>
                )}

                <div className="bg-theme-card p-2 rounded-lg border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)]">
                  <span className="text-[9px] font-mono text-theme-muted font-bold uppercase tracking-wider block">Seu Avanço:</span>
                  <span className="text-sm font-mono font-black text-theme-red">
                    {memberCompletionPercent}%
                  </span>
                </div>
                <div className="bg-theme-card p-2 rounded-lg border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)]">
                  <span className="text-[9px] font-mono text-theme-muted font-bold uppercase tracking-wider block">Média do Clube:</span>
                  <span className="text-sm font-mono font-black text-theme-gold">
                    {clubCompletionPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Barra de Progresso Vibrante em Vermelho com Borda Neo-brutalista */}
            <div className="w-full bg-theme-card h-5 rounded-lg border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] overflow-hidden mb-5 p-0.5 relative">
              <div
                className="bg-theme-red h-full rounded transition-all duration-500 relative flex items-center justify-end pr-2"
                style={{ width: `${Math.max(memberCompletionPercent, 5)}%` }}
              >
                {memberCompletionPercent >= 20 && (
                  <span className="text-[10px] font-mono font-black text-white tracking-wider">
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
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-150 text-left select-none relative group ${
                      isCompleted
                        ? 'border-theme-border bg-theme-card shadow-[4px_4px_0px_var(--shadow-color)] translate-x-[-1px] translate-y-[-1px]'
                        : 'border-theme-border bg-theme-card hover:bg-theme-container shadow-[3px_3px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5'
                    } ${isAnimating ? 'animate-pop' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <span className={`text-xs font-mono font-black uppercase tracking-wider ${isCompleted ? 'text-theme-red' : 'text-theme-primary'}`}>
                        {goal.week}
                      </span>
                      {isCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-theme-red text-white border-2 border-theme-border flex items-center justify-center shadow-[1px_1px_0px_var(--shadow-color)] shrink-0 group-hover:scale-110 transition-transform">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-theme-container border-2 border-theme-border flex items-center justify-center shadow-[1px_1px_0px_var(--shadow-color)] shrink-0 group-hover:border-theme-red transition-colors">
                          <Circle className="w-3.5 h-3.5 text-theme-muted group-hover:text-theme-red" />
                        </div>
                      )}
                    </div>

                    <p className={`text-xs font-bold mt-2 font-headline leading-tight ${isCompleted ? 'text-theme-red' : 'text-theme-primary'}`}>
                      {goal.label}
                    </p>
                    <p className="text-[11px] text-theme-muted mt-1 font-mono">
                      {goal.pages}
                    </p>

                    {/* Status de leitura e avatares */}
                    <div className="mt-3 pt-2 border-t border-theme-border/20 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-theme-muted">
                        {membersWhoCompleted.length}/6 leram
                      </span>
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {membersWhoCompleted.map(m => (
                          <img
                            key={m.id}
                            src={m.avatar}
                            alt={m.name}
                            title={`${m.name} concluiu`}
                            className="w-4 h-4 rounded-full border border-theme-border object-cover"
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
