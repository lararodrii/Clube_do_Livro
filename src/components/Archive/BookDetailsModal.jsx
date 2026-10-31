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
  ShieldAlert,
  Lock
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative bg-theme-container text-theme-primary rounded-2xl w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 mx-auto border-2 border-theme-border shadow-[8px_8px_0px_var(--shadow-color)] my-4 sm:my-8">
        
        {/* Barra Superior com Botão Fechar sem sobreposição */}
        <div className="flex items-center justify-between gap-3 w-full pb-3 mb-4 border-b-2 border-theme-border relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono font-black uppercase tracking-wider text-theme-primary truncate">
            <span className="text-theme-red">★</span>
            <span>Ficha Catalográfica da Obra</span>
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

        {/* Topo do Livro: Capa + Detalhes Principais */}
        <div className="flex flex-col sm:flex-row gap-6 items-start pb-6 border-b-2 border-theme-border">
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
              <span className="text-[11px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded bg-theme-red text-white border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] flex items-center gap-1">
                <span className="text-[#FEF08A]">★</span> Lido em {book.readMonth}
              </span>
              {book.status && (
                <span className="text-[11px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded bg-[#283618] text-[#FEF08A] border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)]">
                  Status: {book.status} ★
                </span>
              )}
              {book.assemblyDate && (
                <span className="text-[11px] font-mono font-bold text-theme-red bg-theme-red/10 px-2.5 py-1 rounded border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)]">
                  Assembleia: {book.assemblyDate}
                </span>
              )}
              <span className="text-[11px] font-mono font-bold text-theme-primary bg-theme-card px-2.5 py-1 rounded border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)]">
                {book.pages} páginas
              </span>
              <span className="text-[11px] font-mono font-bold text-[#111111] bg-[#FEF08A] px-2.5 py-1 rounded border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)]">
                {book.genre}
              </span>
            </div>

            <h2 className="font-headline text-2xl sm:text-3xl font-black text-theme-primary leading-tight">
              {book.title}
            </h2>
            <p className="text-base text-theme-red font-reading font-bold italic mt-1">
              por {book.author}
            </p>

            {/* Avaliação Média em Destaque */}
            <div className="flex items-center gap-3 mt-4 bg-theme-card p-3 rounded-xl border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] w-fit">
              <StarRating rating={Number(avgRating)} size="md" />
              <div className="text-xs">
                <span className="font-mono font-black text-theme-primary text-sm">★ {avgRating}</span>
                <span className="text-theme-muted ml-1 font-mono">/ 5.0 ({reviewsCount} {reviewsCount === 1 ? 'avaliação' : 'avaliações'})</span>
              </div>
            </div>

            {/* Sinopse */}
            <div className="mt-4">
              <h4 className="text-xs font-mono font-black uppercase tracking-wider text-theme-primary mb-1">
                Sinopse da Obra
              </h4>
              <div className="text-xs sm:text-sm text-theme-secondary leading-relaxed font-reading whitespace-pre-line">
                {formatTextWithBold(book.synopsis)}
              </div>
            </div>
          </div>
        </div>

        {/* SEÇÃO DE AVALIAÇÃO DO MEMBRO ATIVO */}
        <div className="my-6 p-5 bg-theme-card rounded-xl border-2 border-theme-border shadow-[4px_4px_0px_var(--shadow-color)]">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <img
                src={activeMember.avatar}
                alt={activeMember.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-theme-border"
              />
              <div>
                <p className="text-xs font-headline font-black text-theme-primary flex items-center gap-1.5">
                  <span className="text-theme-red">★</span>
                  <span>{memberReview ? 'Editar sua resenha' : 'Deixar sua resenha e nota'} ({activeMember.name})</span>
                </p>
                <p className="text-[11px] text-theme-muted font-reading">
                  Avalie de 1 a 5 estrelas e registre sua contribuição crítica para o coletivo
                </p>
              </div>
            </div>

            {/* Botão de Excluir Resenha */}
            {memberReview && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                className="flex items-center gap-1 text-xs font-mono font-bold text-theme-red hover:text-white p-1.5 rounded-lg border-2 border-theme-red hover:bg-theme-red transition-colors"
                title="Excluir minha resenha deste livro"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Excluir Resenha</span>
              </button>
            )}
          </div>

          {/* Confirmação de exclusão */}
          {showDeleteConfirm && (
            <div className="p-3.5 bg-theme-container rounded-xl border-2 border-theme-red shadow-[2px_2px_0px_var(--shadow-color)] mb-3 text-left animate-fade-in">
              <p className="text-xs text-theme-red font-bold mb-2">
                Deseja realmente remover seu comentário e nota deste livro do acervo?
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDeleteReview}
                  className="px-3 py-1.5 bg-theme-red hover:brightness-110 text-white rounded-lg text-xs font-mono font-bold border border-theme-border transition-colors"
                >
                  Sim, Excluir
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 bg-theme-card text-theme-primary border border-theme-border rounded-lg text-xs font-mono font-bold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-3">
            {/* Seletor de Estrelas Interativo */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-theme-primary">Sua nota:</span>
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
              className="w-full text-xs sm:text-sm bg-theme-input border-2 border-theme-border rounded-lg p-3 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red leading-relaxed font-reading"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsSpoiler(!isSpoiler)}
                title="Ativar tarja censurada para proteger as camaradas de spoilers"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border-2 border-theme-border transition-all ${
                  isSpoiler
                    ? 'bg-theme-red text-white font-black shadow-[2px_2px_0px_var(--shadow-color)]'
                    : 'bg-theme-card text-theme-muted hover:text-theme-primary'
                }`}
              >
                <Lock className={`w-3.5 h-3.5 ${isSpoiler ? 'text-[#FEF08A]' : 'text-theme-red'}`} />
                <span>{isSpoiler ? '🔒 Tarja Confidencial Ativada' : '🔒 Tarja Confidencial (Spoiler)'}</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !comment.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-theme-red hover:brightness-110 disabled:opacity-50 text-white text-xs font-headline font-black uppercase tracking-wider rounded-lg border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
              >
                <Send className="w-3.5 h-3.5 text-[#FEF08A]" />
                <span>{memberReview ? 'Atualizar Avaliação ★' : 'Publicar Resenha ★'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* FEED DE RESENHAS DOS MEMBROS */}
        <div>
          <h4 className="font-headline text-lg font-black text-theme-primary mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-theme-red" />
            <span>Resenhas das Camaradas ({reviewsCount})</span>
          </h4>

          {reviewsCount === 0 ? (
            <p className="text-xs font-reading italic text-theme-muted py-4 bg-theme-card p-4 rounded-xl border-2 border-theme-border">
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
                    className={`p-4 rounded-xl border-2 border-theme-border transition-all ${
                      isMe 
                        ? 'bg-theme-gold/10 shadow-[4px_4px_0px_var(--shadow-color)]' 
                        : 'bg-theme-card shadow-[3px_3px_0px_var(--shadow-color)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={reviewer.avatar}
                          alt={reviewer.name}
                          className="w-8 h-8 rounded-full object-cover border-2 border-theme-border"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-headline font-black text-theme-primary">
                              {reviewer.name}
                            </span>
                            {isMe && (
                              <span className="text-[10px] bg-theme-red text-white font-mono font-bold px-2 py-0.2 rounded border border-theme-border">
                                Você
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-theme-red font-reading font-bold italic">
                            {reviewer.roleBadge}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <StarRating rating={review.rating} size="sm" showValue={true} />
                          <span className="text-[10px] text-theme-muted font-mono block mt-0.5">
                            {review.date}
                          </span>
                        </div>

                        {/* Botão de Excluir próprio comentário */}
                        {isMe && (
                          <button
                            type="button"
                            onClick={handleDeleteReview}
                            title="Remover meu comentário"
                            className="text-theme-muted hover:text-theme-red p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 pl-4 sm:pl-8">
                      <ConfidentialSpoiler isSpoiler={review.isSpoiler}>
                        <div className="text-xs sm:text-sm text-theme-secondary leading-relaxed font-reading italic pl-3 border-l-2 border-theme-red whitespace-pre-line">
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
