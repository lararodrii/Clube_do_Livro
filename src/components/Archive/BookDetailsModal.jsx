import React, { useState, useEffect } from 'react';
import { useClub } from '../../context/ClubContext';
import { useAuth } from '../../context/AuthContext';
import BookCover from '../common/BookCover';
import StarRating from '../common/StarRating';
import { 
  X, 
  Star, 
  MessageSquare, 
  Send, 
  Calendar, 
  BookOpen,
  Sparkles,
  Trash2,
  Pencil,
  ShieldAlert
} from 'lucide-react';
import ConfidentialSpoiler from '../common/ConfidentialSpoiler';
import { formatTextWithBold } from '../../utils/textFormat';

export default function BookDetailsModal({ book, isOpen, onClose }) {
  const { activeMember, members, addOrUpdateReview, deleteReview } = useClub();
  const { isAuthenticated, openAuthModal } = useAuth();

  if (!isOpen || !book) return null;

  // Resenha do membro ativo se já existir
  const memberReview = book.reviews?.find(r => r.memberId === activeMember.id);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (memberReview) {
      setRating(memberReview.rating || 5);
      setComment(memberReview.comment || '');
      setIsSpoiler(!!memberReview.isSpoiler);
    } else {
      setRating(5);
      setComment('');
      setIsSpoiler(false);
    }
    setShowDeleteConfirm(false);
  }, [memberReview, activeMember.id]);

  // Média de avaliação
  const reviewsCount = book.reviews?.length || 0;
  const avgRating = reviewsCount > 0
    ? (book.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewsCount).toFixed(1)
    : '5.0';

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('Faça login para registrar ou atualizar sua resenha no acervo.', 'login');
      return;
    }
    setIsSubmitting(true);
    addOrUpdateReview(book.id, { rating, comment, isSpoiler });
    setIsSubmitting(false);
  };

  const handleDeleteReview = () => {
    if (!isAuthenticated) {
      openAuthModal('Faça login para excluir sua resenha.', 'login');
      return;
    }
    deleteReview(book.id, activeMember.id);
    setRating(5);
    setComment('');
    setShowDeleteConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative bg-[#FAF7F0] rounded-2xl max-w-3xl w-full p-6 sm:p-8 border-2 border-[#1E1E1E] shadow-[8px_8px_0px_#1E1E1E] my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-500 hover:text-[#141414] p-2 rounded-lg border-2 border-[#1E1E1E] bg-white hover:bg-[#FEF08A] transition-colors shadow-[2px_2px_0px_#1E1E1E]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Topo do Livro: Capa + Detalhes Principais */}
        <div className="flex flex-col sm:flex-row gap-6 items-start pb-6 border-b-2 border-[#1E1E1E]">
          <div className="shrink-0 mx-auto sm:mx-0">
            <BookCover
              src={book.coverUrl}
              title={book.title}
              author={book.author}
              size="lg"
            />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[11px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded bg-[#D62828] text-white border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] flex items-center gap-1">
                <span className="text-[#FEF08A]">★</span> Lido em {book.readMonth}
              </span>
              {book.status && (
                <span className="text-[11px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded bg-[#283618] text-[#FEF08A] border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E]">
                  Status: {book.status} ★
                </span>
              )}
              {book.assemblyDate && (
                <span className="text-[11px] font-mono font-bold text-[#9E2A2B] bg-[#FDF0ED] px-2.5 py-1 rounded border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E]">
                  Assembleia: {book.assemblyDate}
                </span>
              )}
              <span className="text-[11px] font-mono font-bold text-[#141414] bg-white px-2.5 py-1 rounded border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E]">
                {book.pages} páginas
              </span>
              <span className="text-[11px] font-mono font-bold text-[#283618] bg-[#FEF08A] px-2.5 py-1 rounded border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E]">
                {book.genre}
              </span>
            </div>

            <h2 className="font-headline text-2xl sm:text-3xl font-black text-[#141414] leading-tight">
              {book.title}
            </h2>
            <p className="text-base text-[#D62828] font-reading font-bold italic mt-1">
              por {book.author}
            </p>

            {/* Avaliação Média em Destaque */}
            <div className="flex items-center gap-3 mt-4 bg-white p-3 rounded-xl border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E] w-fit">
              <StarRating rating={Number(avgRating)} size="md" />
              <div className="text-xs">
                <span className="font-mono font-black text-[#141414] text-sm">★ {avgRating}</span>
                <span className="text-[#57534E] ml-1 font-mono">/ 5.0 ({reviewsCount} {reviewsCount === 1 ? 'avaliação' : 'avaliações'})</span>
              </div>
            </div>

            {/* Sinopse */}
            <div className="mt-4">
              <h4 className="text-xs font-mono font-black uppercase tracking-wider text-[#141414] mb-1">
                Sinopse da Obra
              </h4>
              <div className="text-xs sm:text-sm text-[#57534E] leading-relaxed font-reading whitespace-pre-line">
                {formatTextWithBold(book.synopsis)}
              </div>
            </div>
          </div>
        </div>

        {/* SEÇÃO DE AVALIAÇÃO DO MEMBRO ATIVO */}
        <div className="my-6 p-5 bg-white rounded-xl border-2 border-[#1E1E1E] shadow-[4px_4px_0px_#1E1E1E]">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <img
                src={activeMember.avatar}
                alt={activeMember.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-[#1E1E1E]"
              />
              <div>
                <p className="text-xs font-headline font-black text-[#141414] flex items-center gap-1.5">
                  <span className="text-[#D62828]">★</span>
                  <span>{memberReview ? 'Editar sua resenha' : 'Deixar sua resenha e nota'} ({activeMember.name})</span>
                </p>
                <p className="text-[11px] text-[#57534E] font-reading">
                  Avalie de 1 a 5 estrelas e registre sua contribuição crítica para o coletivo
                </p>
              </div>
            </div>

            {/* Botão de Excluir Resenha */}
            {memberReview && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                className="flex items-center gap-1 text-xs font-mono font-bold text-[#D62828] hover:text-white p-1.5 rounded-lg border-2 border-[#D62828] hover:bg-[#D62828] transition-colors"
                title="Excluir minha resenha deste livro"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Excluir Resenha</span>
              </button>
            )}
          </div>

          {/* Confirmação de exclusão */}
          {showDeleteConfirm && (
            <div className="p-3.5 bg-[#FAF7F0] rounded-xl border-2 border-[#D62828] shadow-[2px_2px_0px_#D62828] mb-3 text-left animate-fade-in">
              <p className="text-xs text-[#9E2A2B] font-bold mb-2">
                Deseja realmente remover seu comentário e nota deste livro do acervo?
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDeleteReview}
                  className="px-3 py-1.5 bg-[#D62828] hover:bg-[#9E2A2B] text-white rounded-lg text-xs font-mono font-bold border border-[#1E1E1E] transition-colors"
                >
                  Sim, Excluir
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 bg-white text-[#141414] border border-[#1E1E1E] rounded-lg text-xs font-mono font-bold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-3">
            {/* Seletor de Estrelas Interativo */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-[#141414]">Sua nota:</span>
              <StarRating
                rating={rating}
                interactive={true}
                size="lg"
                onChange={(newRating) => setRating(newRating)}
                showValue={true}
              />
            </div>

            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="O que você achou dos temas, do ritmo e da escrita desta obra? Como foi o debate na reunião?"
              className="w-full text-xs sm:text-sm bg-[#FAF7F0] border-2 border-[#1E1E1E] rounded-lg p-3 text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#D62828] leading-relaxed font-reading"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-mono font-bold text-[#141414] select-none bg-[#FAF7F0] px-2.5 py-1.5 rounded-lg border border-[#1E1E1E]">
                <input
                  type="checkbox"
                  checked={isSpoiler}
                  onChange={(e) => setIsSpoiler(e.target.checked)}
                  className="w-3.5 h-3.5 text-[#D62828] rounded border-[#1E1E1E] focus:ring-0"
                />
                <span className="flex items-center gap-1 text-[11px]">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#D62828]" />
                  <span>Contém Spoiler / Confidencial</span>
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting || !comment.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-[#D62828] hover:bg-[#9E2A2B] disabled:opacity-50 text-white text-xs font-headline font-black uppercase tracking-wider rounded-lg border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
              >
                <Send className="w-3.5 h-3.5 text-[#FEF08A]" />
                <span>{memberReview ? 'Atualizar Avaliação ★' : 'Publicar Resenha ★'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* FEED DE RESENHAS DOS MEMBROS */}
        <div>
          <h4 className="font-headline text-lg font-black text-[#141414] mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#D62828]" />
            <span>Resenhas das Camaradas ({reviewsCount})</span>
          </h4>

          {reviewsCount === 0 ? (
            <p className="text-xs font-reading italic text-[#57534E] py-4 bg-white p-4 rounded-xl border-2 border-[#1E1E1E]">
              Nenhuma resenha registrada ainda para este livro. Seja a primeira a registrar suas impressões críticas!
            </p>
          ) : (
            <div className="space-y-4">
              {book.reviews.map((review, idx) => {
                const reviewer = members.find(m => m.id === review.memberId) || {
                  name: 'Membro do Clube',
                  avatar: '',
                  color: '#D62828',
                  roleBadge: '★ Camarada'
                };

                const isMe = review.memberId === activeMember.id;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border-2 border-[#1E1E1E] transition-all ${
                      isMe 
                        ? 'bg-[#FEF08A]/30 shadow-[4px_4px_0px_#1E1E1E]' 
                        : 'bg-white shadow-[3px_3px_0px_#1E1E1E]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={reviewer.avatar}
                          alt={reviewer.name}
                          className="w-8 h-8 rounded-full object-cover border-2 border-[#1E1E1E]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-headline font-black text-[#141414]">
                              {reviewer.name}
                            </span>
                            {isMe && (
                              <span className="text-[10px] bg-[#D62828] text-white font-mono font-bold px-2 py-0.2 rounded border border-[#1E1E1E]">
                                Você
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#D62828] font-reading font-bold italic">
                            {reviewer.roleBadge}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <StarRating rating={review.rating} size="sm" showValue={true} />
                          <span className="text-[10px] text-[#57534E] font-mono block mt-0.5">
                            {review.date}
                          </span>
                        </div>

                        {/* Botão de Excluir próprio comentário */}
                        {isMe && (
                          <button
                            type="button"
                            onClick={handleDeleteReview}
                            title="Remover meu comentário"
                            className="text-stone-400 hover:text-[#D62828] p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 pl-4 sm:pl-8">
                      <ConfidentialSpoiler isSpoiler={review.isSpoiler}>
                        <div className="text-xs sm:text-sm text-[#141414] leading-relaxed font-reading italic pl-3 border-l-2 border-[#D62828] whitespace-pre-line">
                          "{formatTextWithBold(review.comment)}"
                        </div>
                      </ConfidentialSpoiler>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
