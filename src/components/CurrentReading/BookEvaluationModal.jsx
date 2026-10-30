import React, { useState, useEffect } from 'react';
import { useClub } from '../../context/ClubContext';
import StarRating from '../common/StarRating';
import ComradeCat from '../common/ComradeCat';
import { X, Star, Send, Award, Sparkles, CheckCircle2 } from 'lucide-react';

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

  useEffect(() => {
    setHoverRating(0);
    if (existingReview) {
      setRating(existingReview.rating || 5);
      setComment(existingReview.comment || '');
      setRecommendation(existingReview.recommendation || RECOMMENDATION_OPTIONS[0]);
      setPacing(existingReview.pacing || PACING_OPTIONS[1]);
    } else {
      setRating(5);
      setComment('');
      setRecommendation(RECOMMENDATION_OPTIONS[0]);
      setPacing(PACING_OPTIONS[1]);
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
      pacing
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative bg-[#FAF7F0] rounded-2xl max-w-xl w-full p-6 sm:p-8 border-2 border-[#1E1E1E] shadow-[8px_8px_0px_#1E1E1E] my-8 max-h-[92vh] overflow-y-auto">
        
        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-500 hover:text-[#141414] p-2 rounded-lg border-2 border-[#1E1E1E] bg-white hover:bg-[#FEF08A] transition-colors shadow-[2px_2px_0px_#1E1E1E]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Topo Festivo com o Mascote Comemorando */}
        <div className="flex items-center gap-4 mb-5 pb-5 border-b-2 border-[#1E1E1E]">
          <div className="shrink-0">
            <ComradeCat pose="celebrating" size="sm" showBubble={false} className="scale-100" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#D62828] text-white text-[10px] font-mono font-black uppercase tracking-wider border border-[#1E1E1E] shadow-[1px_1px_0px_#1E1E1E] mb-1">
              <span>★</span>
              <span>SEMANA 4 CONCLUÍDA! LEITURA FINALIZADA</span>
            </div>
            <h3 className="font-headline text-xl sm:text-2xl font-black text-[#141414] leading-tight">
              Avaliação Crítica da Obra ★
            </h3>
            <p className="text-xs text-[#57534E] font-reading font-semibold mt-0.5">
              Camarada <strong>{activeMember.name}</strong>, registre sua nota e impressões para computar em membros e métricas!
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Obra Sendo Avaliada */}
          <div className="bg-white p-3.5 rounded-xl border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E] flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#9E2A2B] block">
                Obra Finalizada:
              </span>
              <p className="font-headline font-black text-sm text-[#141414]">
                {currentReading.title}
              </p>
              <p className="text-xs text-[#57534E] font-reading italic">
                por {currentReading.author}
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-[#FEF08A] px-2.5 py-1 rounded border border-[#1E1E1E]">
              {currentReading.pages} págs
            </span>
          </div>

          {/* Seletor de Nota em Estrelas Interativas */}
          <div className="bg-white p-4 rounded-xl border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-bold text-[#141414] uppercase tracking-wider">
                Sua Nota para o Livro:
              </label>
              <span className="font-mono font-black text-sm text-[#B45309] bg-[#FEF08A] px-2.5 py-1 rounded-lg border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] flex items-center gap-1 transition-all">
                <span className="text-[#F59E0B]">★</span> {displayRating}.0 / 5.0
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
              <span className="text-xs font-reading font-bold text-[#141414] bg-[#FAF7F0] px-3 py-1.5 rounded-lg border border-[#1E1E1E] transition-all">
                {getRatingLegend(displayRating)}
              </span>
            </div>
          </div>

          {/* Comentário / Resenha Crítica */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-wider mb-1">
              O que você achou da obra? (Resenha Crítica) *
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Quais foram seus pontos favoritos, reflexões políticas ou impressões centrais para o debate com as outras camaradas?"
              className="w-full text-xs sm:text-sm bg-white border-2 border-[#1E1E1E] rounded-xl p-3 text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#D62828] leading-relaxed font-reading"
            />
          </div>

          {/* Pergunta: Recomendação */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-wider mb-1.5">
              Recomendação para o Coletivo:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {RECOMMENDATION_OPTIONS.map((rec) => (
                <button
                  key={rec}
                  type="button"
                  onClick={() => setRecommendation(rec)}
                  className={`p-2.5 rounded-lg text-xs font-reading font-bold border-2 border-[#1E1E1E] text-left transition-all ${
                    recommendation === rec
                      ? 'bg-[#FEF08A] text-[#141414] shadow-[3px_3px_0px_#1E1E1E] -translate-y-0.5'
                      : 'bg-white hover:bg-[#FAF7F0] text-[#57534E]'
                  }`}
                >
                  {rec}
                </button>
              ))}
            </div>
          </div>

          {/* Pergunta: Ritmo de Leitura */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-wider mb-1.5">
              Como foi seu ritmo ao longo das 4 semanas?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PACING_OPTIONS.map((pace) => (
                <button
                  key={pace}
                  type="button"
                  onClick={() => setPacing(pace)}
                  className={`p-2.5 rounded-lg text-[11px] font-mono font-bold border-2 border-[#1E1E1E] text-center transition-all ${
                    pacing === pace
                      ? 'bg-[#283618] text-[#FEF08A] shadow-[3px_3px_0px_#1E1E1E] -translate-y-0.5'
                      : 'bg-white hover:bg-[#FAF7F0] text-[#57534E]'
                  }`}
                >
                  {pace}
                </button>
              ))}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-[#1E1E1E]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-mono font-bold text-[#57534E] hover:bg-stone-200 rounded-lg border-2 border-[#1E1E1E] transition-colors"
            >
              Avaliar Mais Tarde
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#D62828] hover:bg-[#9E2A2B] text-white text-xs font-headline font-black uppercase tracking-wider rounded-lg border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2"
            >
              <Send className="w-4 h-4 text-[#FEF08A]" />
              <span>Salvar Avaliação no Meu Perfil ★</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
