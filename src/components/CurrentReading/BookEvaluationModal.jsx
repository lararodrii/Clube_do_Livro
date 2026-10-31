import React, { useState, useEffect } from 'react';
import { useClub } from '../../context/ClubContext';
import StarRating from '../common/StarRating';
import ComradeCat from '../common/ComradeCat';
import { X, Star, Send, Award, Sparkles, CheckCircle2, Lock } from 'lucide-react';

const RECOMMENDATION_OPTIONS = [
  '★ Super recomendo (leitura essencial)',
  '▲ Recomendo com ponderações críticas',
  '✖ Não funcionou para mim'
];

const PACING_OPTIONS = [
  'Devorei antes do prazo',
  'Segui o cronograma semanal com disciplina',
  'Finalizei na reta final com esforço coletivo'
];

export default function BookEvaluationModal({ isOpen, onClose }) {
  const { currentReading, activeMember, submitCurrentBookReview } = useClub();

  // Se o membro já tiver avaliado a leitura atual anteriormente, carrega os dados
  const existingReview = currentReading?.reviews?.find(r => r.memberId === activeMember.id);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [recommendation, setRecommendation] = useState(RECOMMENDATION_OPTIONS[0]);
  const [pacing, setPacing] = useState(PACING_OPTIONS[1]);
  const [isSpoiler, setIsSpoiler] = useState(false);

  useEffect(() => {
    setHoverRating(0);
    if (existingReview) {
      setRating(existingReview.rating || 5);
      setComment(existingReview.comment || '');
      setRecommendation(existingReview.recommendation || RECOMMENDATION_OPTIONS[0]);
      setPacing(existingReview.pacing || PACING_OPTIONS[1]);
      setIsSpoiler(!!existingReview.isSpoiler);
    } else {
      setRating(5);
      setComment('');
      setRecommendation(RECOMMENDATION_OPTIONS[0]);
      setPacing(PACING_OPTIONS[1]);
      setIsSpoiler(false);
    }
  }, [existingReview, isOpen]);

  const displayRating = hoverRating || rating;

  const getRatingLegend = (stars) => {
    switch (stars) {
      case 5:
        return '👑 Obra-prima indispensável!';
      case 4:
        return '★ Excelente leitura coletiva!';
      case 3:
        return '▲ Boa leitura com altos e baixos.';
      case 2:
        return '▼ Deixou a desejar.';
      case 1:
        return '✖ Decepção teórica/literária.';
      default:
        return 'Selecione uma nota de 1 a 5 estrelas';
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    submitCurrentBookReview({
      rating,
      comment: comment.trim(),
      recommendation,
      pacing,
      isSpoiler
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative bg-theme-container text-theme-primary rounded-2xl w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 mx-auto border-2 border-theme-border shadow-[8px_8px_0px_var(--shadow-color)] my-4 sm:my-8">
        
        {/* Topo Festivo com o Mascote Comemorando e Botão de Fechar sem sobreposição */}
        <div className="flex items-start justify-between gap-3 w-full pb-4 mb-4 border-b-2 border-theme-border relative z-10">
          <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
            <div className="shrink-0">
              <ComradeCat pose="celebrating" size="sm" showBubble={false} className="scale-100" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-theme-red text-white text-[10px] font-mono font-black uppercase tracking-wider border border-theme-border shadow-[1px_1px_0px_var(--shadow-color)] mb-1 flex-wrap">
                <span>★</span>
                <span>SEMANA 4 CONCLUÍDA! LEITURA FINALIZADA</span>
              </div>
              <h3 className="font-headline text-lg sm:text-2xl font-black text-theme-primary leading-tight">
                Avaliação Crítica da Obra ★
              </h3>
              <p className="text-xs text-theme-muted font-reading font-semibold mt-0.5">
                Camarada <strong>{activeMember.name}</strong>, registre sua nota e impressões para computar em membros e métricas!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            title="Fechar modal"
            className="shrink-0 z-30 w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer text-theme-muted hover:text-theme-primary border-2 border-theme-border bg-theme-card hover:bg-theme-gold/20 transition-colors shadow-[2px_2px_0px_var(--shadow-color)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Obra Sendo Avaliada */}
          <div className="bg-theme-card p-3.5 rounded-xl border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-theme-red block">
                Obra Finalizada:
              </span>
              <p className="font-headline font-black text-sm text-theme-primary">
                {currentReading.title}
              </p>
              <p className="text-xs text-theme-muted font-reading italic">
                por {currentReading.author}
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-[#FEF08A] text-[#111111] px-2.5 py-1 rounded border border-theme-border">
              {currentReading.pages} págs
            </span>
          </div>

          {/* Seletor de Nota em Estrelas Interativas */}
          <div className="bg-theme-card p-4 rounded-xl border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-bold text-theme-primary uppercase tracking-wider">
                Sua Nota para o Livro:
              </label>
              <span className="font-mono font-black text-sm text-[#111111] bg-[#FEF08A] px-2.5 py-1 rounded-lg border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] flex items-center gap-1 transition-all">
                <span className="text-[#92400E]">★</span> {displayRating}.0 / 5.0
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <StarRating
                rating={rating}
                interactive={true}
                size="lg"
                onChange={(newRating) => setRating(newRating)}
                onHoverChange={(hVal) => setHoverRating(hVal)}
                showValue={false}
              />
              <span className="text-xs font-reading font-bold text-theme-primary bg-theme-container px-3 py-1.5 rounded-lg border border-theme-border transition-all">
                {getRatingLegend(displayRating)}
              </span>
            </div>
          </div>

          {/* Comentário / Resenha Crítica */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider">
                O que você achou da obra? (Resenha Crítica) *
              </label>
              <button
                type="button"
                onClick={() => setIsSpoiler(!isSpoiler)}
                title="Ativar tarja censurada para proteger as camaradas de spoilers"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border-2 border-theme-border transition-all ${
                  isSpoiler
                    ? 'bg-theme-red text-white font-black shadow-[2px_2px_0px_var(--shadow-color)]'
                    : 'bg-theme-card text-theme-muted hover:text-theme-primary'
                }`}
              >
                <Lock className={`w-3.5 h-3.5 ${isSpoiler ? 'text-[#FEF08A]' : 'text-theme-red'}`} />
                <span>{isSpoiler ? '🔒 Tarja Confidencial Ativada' : '🔒 Tarja Confidencial (Spoiler)'}</span>
              </button>
            </div>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Quais foram seus pontos favoritos, reflexões políticas ou impressões centrais para o debate com as outras camaradas? (Dica: use ||texto|| para tarja parcial)"
              className="w-full text-xs sm:text-sm bg-theme-input border-2 border-theme-border rounded-xl p-3 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red leading-relaxed font-reading"
            />
          </div>

          {/* Pergunta: Recomendação */}
          <div>
            <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1.5">
              Recomendação para o Coletivo:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {RECOMMENDATION_OPTIONS.map((rec) => (
                <button
                  key={rec}
                  type="button"
                  onClick={() => setRecommendation(rec)}
                  className={`p-2.5 rounded-lg text-xs font-reading font-bold border-2 border-theme-border text-left transition-all ${
                    recommendation === rec
                      ? 'bg-[#FEF08A] text-[#111111] shadow-[3px_3px_0px_var(--shadow-color)] -translate-y-0.5'
                      : 'bg-theme-card hover:bg-theme-input text-theme-primary'
                  }`}
                >
                  {rec}
                </button>
              ))}
            </div>
          </div>

          {/* Pergunta: Ritmo de Leitura */}
          <div>
            <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1.5">
              Como foi seu ritmo ao longo das 4 semanas?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PACING_OPTIONS.map((pace) => (
                <button
                  key={pace}
                  type="button"
                  onClick={() => setPacing(pace)}
                  className={`p-2.5 rounded-lg text-[11px] font-mono font-bold border-2 border-theme-border text-center transition-all ${
                    pacing === pace
                      ? 'bg-[#283618] text-[#FEF08A] shadow-[3px_3px_0px_var(--shadow-color)] -translate-y-0.5'
                      : 'bg-theme-card hover:bg-theme-input text-theme-primary'
                  }`}
                >
                  {pace}
                </button>
              ))}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t-2 border-theme-border">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-mono font-bold text-theme-muted hover:bg-theme-card rounded-lg border-2 border-theme-border transition-colors text-center"
            >
              Avaliar Mais Tarde
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto justify-center px-6 py-2.5 bg-theme-red hover:brightness-110 text-white text-xs font-headline font-black uppercase tracking-wider rounded-lg border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2"
            >
              <Send className="w-4 h-4 text-[#FEF08A]" />
              <span>Salvar Avaliação ★</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
