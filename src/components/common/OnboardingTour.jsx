import React, { useState, useEffect } from 'react';
import ComradeCat from './ComradeCat';
import { useClub } from '../../context/ClubContext';
import { useAuth } from '../../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Sparkles, 
  BookOpen, 
  Vote, 
  Library, 
  BarChart3, 
  HelpCircle,
  Compass
} from 'lucide-react';

const TOUR_STEPS = [
  {
    step: 1,
    tabId: null, // Visão geral do Cabeçalho
    title: 'Boas-vindas ao Exército da Paty! ★',
    subtitle: 'Seu Comitê Literário Revolucionário',
    badge: 'Passo 1/5 • Visão Geral',
    icon: Compass,
    pose: 'curious',
    content: (
      <>
        Saudações, camarada! Este é o espaço oficial do nosso clube do livro.
        No topo da página você encontra:
        <ul className="mt-2 space-y-1.5 text-xs text-theme-muted list-disc list-inside">
          <li><strong>Modo Ideológico:</strong> alterne entre 4 paletas estéticas retrô.</li>
          <li><strong>O Gato Camarada:</strong> clique nele a qualquer momento para conselhos.</li>
          <li><strong>Lápis de Perfil:</strong> clique no ícone de lápis ao lado do seu nome para editar seu apelido, cargo e foto!</li>
        </ul>
      </>
    )
  },
  {
    step: 2,
    tabId: 'current',
    title: 'Leitura do Mês & Encontros',
    subtitle: 'Aba: Leitura & Encontro',
    badge: 'Passo 2/5 • Leitura Ativa',
    icon: BookOpen,
    pose: 'reading',
    content: (
      <>
        Acompanhe a obra atualmente em debate no clube:
        <ul className="mt-2 space-y-1.5 text-xs text-theme-muted list-disc list-inside">
          <li><strong>Checklist Semanal:</strong> registre seu progresso nas 4 semanas.</li>
          <li><strong>Assembleia & Countdown:</strong> acompanhe a data e confirme sua presença.</li>
          <li><strong>Mural Revolucionário:</strong> compartilhe citações do livro e use a <em>Tarja Confidencial</em> para evitar spoilers!</li>
        </ul>
      </>
    )
  },
  {
    step: 3,
    tabId: 'ballot',
    title: 'Urna Popular & Indicações Livres',
    subtitle: 'Aba: Urna Mensal',
    badge: 'Passo 3/5 • Votação Democrática',
    icon: Vote,
    pose: 'voting',
    content: (
      <>
        A escolha dos livros é 100% democrática:
        <ul className="mt-2 space-y-1.5 text-xs text-theme-muted list-disc list-inside">
          <li><strong>Indicações Ilimitadas:</strong> sugira livros com busca automática em Apple Books, Google Books e Open Library.</li>
          <li><strong>3 Cédulas por Camarada:</strong> distribua seus 3 votos entre suas obras favoritas.</li>
          <li><strong>Desempate da Sorte:</strong> em caso de empate, a Roleta decide a vencedora!</li>
        </ul>
      </>
    )
  },
  {
    step: 4,
    tabId: 'archive',
    title: 'Acervo Histórico & Resenhas',
    subtitle: 'Aba: Acervo & Resenhas',
    badge: 'Passo 4/5 • Memória Coletiva',
    icon: Library,
    pose: 'grumpy',
    content: (
      <>
        Todos os livros debatidos ficam salvos na nossa biblioteca histórica:
        <ul className="mt-2 space-y-1.5 text-xs text-theme-muted list-disc list-inside">
          <li><strong>Catálogo Completo:</strong> veja capas em 3D, datas e fichas das obras lidas.</li>
          <li><strong>Resenhas Críticas:</strong> leia as opiniões e notas de 1 a 5 estrelas das outras integrantes.</li>
          <li><strong>Edição Livre:</strong> atualize sua própria avaliação a qualquer momento.</li>
        </ul>
      </>
    )
  },
  {
    step: 5,
    tabId: 'members',
    title: 'Carteirinhas & Estatísticas',
    subtitle: 'Aba: Membros & Métricas',
    badge: 'Passo 5/5 • Coletivo & Sindicato',
    icon: BarChart3,
    pose: 'celebrating',
    content: (
      <>
        Conheça a força do nosso comitê:
        <ul className="mt-2 space-y-1.5 text-xs text-theme-muted list-disc list-inside">
          <li><strong>Carteiras de Filiação:</strong> registros sindicais das 6 camaradas com foto 3x4 e carimbos de assiduidade.</li>
          <li><strong>Painel de Métricas:</strong> total de páginas lidas no ano, média de notas e reuniões concluídas.</li>
          <li><strong>Pronta para a revolução literária?</strong> Bom proveito, camarada!</li>
        </ul>
      </>
    )
  }
];

export default function OnboardingTour({ isOpen, onClose, setActiveTab }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { currentUser, userProfile } = useAuth();
  const { triggerComradeConfetti, showToast } = useClub();

  const currentStep = TOUR_STEPS[currentStepIndex];

  // Alterna a aba automaticamente ao avançar ou retroceder
  useEffect(() => {
    if (isOpen && currentStep.tabId && setActiveTab) {
      setActiveTab(currentStep.tabId);
    }
  }, [isOpen, currentStepIndex, currentStep, setActiveTab]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const markTourAsCompleted = async () => {
    try {
      const storageKey = currentUser?.uid 
        ? `tour_completed_${currentUser.uid}` 
        : 'tour_completed_guest';
      localStorage.setItem(storageKey, 'true');

      // Se autenticado, salva no documento do usuário no Firestore
      if (currentUser?.uid && db) {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, { hasSeenTour: true }, { merge: true });
      }
    } catch (err) {
      console.warn('Erro ao salvar estado do tour:', err);
    }
  };

  const handleComplete = () => {
    markTourAsCompleted();
    if (triggerComradeConfetti) {
      triggerComradeConfetti(80);
    }
    showToast('Tour concluído! Você está pronta para os debates, camarada! ★🐾', 'success');
    setCurrentStepIndex(0);
    onClose();
  };

  const handleSkip = () => {
    markTourAsCompleted();
    setCurrentStepIndex(0);
    onClose();
  };

  const IconComponent = currentStep.icon;
  const progressPercent = ((currentStepIndex + 1) / TOUR_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-step-title"
        className="relative bg-theme-container text-theme-primary rounded-2xl w-[92vw] max-w-md p-4 sm:p-6 mx-auto border-2 border-theme-border shadow-[8px_8px_0px_var(--shadow-color)] my-4 animate-pop"
      >
        
        {/* Topo: Barra de Progresso e Botão Fechar */}
        <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b-2 border-theme-border">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-theme-red animate-pulse" />
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-theme-red">
              {currentStep.badge}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            title="Pular / Fechar Tour"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-theme-muted hover:text-theme-primary border-2 border-theme-border bg-theme-card hover:bg-theme-gold/20 transition-colors shadow-[2px_2px_0px_var(--shadow-color)] shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Linha de Barra de Progresso Segmentada */}
        <div className="w-full bg-theme-card h-2 rounded-full border border-theme-border overflow-hidden mb-4 shadow-inner">
          <div 
            className="h-full bg-theme-red transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Área do Mascote & Título do Passo */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="shrink-0 p-1 bg-theme-card rounded-xl border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)]">
            <ComradeCat 
              pose={currentStep.pose} 
              size="sm" 
              showBubble={false}
              className="scale-95"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-theme-gold font-mono font-bold mb-0.5">
              <IconComponent className="w-3.5 h-3.5 text-theme-red shrink-0" />
              <span className="truncate">{currentStep.subtitle}</span>
            </div>
            <h3 id="tour-step-title" className="font-headline font-black text-base sm:text-lg text-theme-primary leading-tight">
              {currentStep.title}
            </h3>
          </div>
        </div>

        {/* Conteúdo Explicativo do Passo */}
        <div className="bg-theme-card p-3.5 sm:p-4 rounded-xl border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] text-xs sm:text-sm font-reading text-theme-secondary leading-relaxed mb-5">
          {currentStep.content}
        </div>

        {/* Rodapé de Ações de Navegação */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t-2 border-theme-border">
          <button
            type="button"
            onClick={handleSkip}
            className="text-[11px] font-mono font-bold text-theme-muted hover:text-theme-primary underline underline-offset-2 transition-colors px-1"
          >
            Pular Tour
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-1.5 text-xs font-mono font-bold bg-theme-card hover:bg-theme-container text-theme-primary border-2 border-theme-border rounded-xl shadow-[2px_2px_0px_var(--shadow-color)] flex items-center gap-1 transition-transform active:translate-y-0.5"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-1.5 text-xs font-headline font-black uppercase tracking-wider bg-theme-red hover:opacity-95 text-white border-2 border-theme-border rounded-xl shadow-[3px_3px_0px_var(--shadow-color)] flex items-center gap-1.5 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
            >
              <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Concluir ★' : 'Próximo'}</span>
              {currentStepIndex === TOUR_STEPS.length - 1 ? (
                <Check className="w-3.5 h-3.5 text-[#FEF08A]" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
