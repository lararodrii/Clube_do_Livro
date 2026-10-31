import React, { useState } from 'react';
import BookCover from '../common/BookCover';
import { formatTextWithBold } from '../../utils/textFormat';
import { searchBooks } from '../../services/bookSearch';
import { useClub } from '../../context/ClubContext';
import { 
  X, 
  Check, 
  Vote, 
  BookOpen, 
  Pencil, 
  Users, 
  Sparkles,
  Search,
  Loader2,
  FileText
} from 'lucide-react';

export default function NominationDetailsModal({
  isOpen,
  onClose,
  book,
  nominator,
  isMyNomination,
  hasVoted,
  voteCount,
  votePercentage,
  isLeader,
  isQuotaReached,
  remainingVotes,
  maxVotes,
  onVoteToggle,
  onEdit
}) {
  const { updateNomination, members = [], showToast } = useClub();
  const [isSearchingSynopsis, setIsSearchingSynopsis] = useState(false);

  if (!isOpen || !book) return null;

  const hasValidSynopsis = book.synopsis && 
    book.synopsis.trim() !== '' && 
    book.synopsis !== 'Sem sinopse cadastrada.';

  const handleFetchSynopsis = async () => {
    try {
      setIsSearchingSynopsis(true);
      const query = `${book.title} ${book.author}`;
      const results = await searchBooks(query);

      if (results && results.length > 0) {
        const match = results.find(r => r.synopsis && r.synopsis.length > 30) || results[0];
        if (match?.synopsis) {
          updateNomination(book.id, { synopsis: match.synopsis });
          showToast(`Sinopse de "${book.title}" carregada com sucesso! 📚★`, 'success');
        } else {
          showToast('Nenhuma sinopse encontrada nos registros públicos para este título.', 'info');
        }
      } else {
        showToast('Nenhuma sinopse encontrada nos registros públicos.', 'info');
      }
    } catch (err) {
      console.error('Erro ao buscar sinopse:', err);
      showToast('Falha ao buscar sinopse nos registros públicos.', 'error');
    } finally {
      setIsSearchingSynopsis(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="nomination-details-title"
        className="relative bg-theme-container text-theme-primary rounded-2xl w-full max-w-2xl p-4 sm:p-6 mx-auto border-2 border-theme-border shadow-[8px_8px_0px_var(--shadow-color)] my-4 animate-pop max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOPO: Título e Botão Fechar Padronizado (Anti-Sobreposição) */}
        <div className="flex items-start justify-between gap-3 w-full pb-2 mb-4 border-b-2 border-theme-border">
          <div className="flex-1 min-w-0 pr-2">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-theme-red flex items-center gap-1.5 truncate">
              <span>★</span> URNA POPULAR • FICHA COMPLETA DA OBRA INDICADA
            </span>
            <h3 id="nomination-details-title" className="font-headline text-lg sm:text-2xl font-black text-theme-primary truncate mt-0.5">
              {book.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Fechar modal"
            className="shrink-0 z-30 w-9 h-9 flex items-center justify-center rounded-lg border-2 border-theme-border bg-theme-card hover:bg-theme-container text-theme-muted hover:text-theme-primary transition-all shadow-[2px_2px_0px_var(--shadow-color)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          >
            <X className="w-5 h-5 text-theme-red" />
          </button>
        </div>

        {/* BLOCO PRINCIPAL: Capa + Metadados */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6">
          <div className="shrink-0 mx-auto sm:mx-0">
            <BookCover
              src={book.coverUrl}
              title={book.title}
              author={book.author}
              size="lg"
            />
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left w-full">
            {/* Badges de Status */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              {isLeader && (
                <span className="text-[11px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-theme-red text-white border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] flex items-center gap-1">
                  <span>★</span> Mais Votado
                </span>
              )}
              {isMyNomination && (
                <span className="text-[11px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#FEF08A] text-[#111111] border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] font-bold">
                  ★ Sua Indicação
                </span>
              )}
              <span className="text-[11px] font-mono font-bold text-theme-primary bg-theme-card px-2.5 py-0.5 rounded border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)]">
                {book.pages} páginas
              </span>
              <span className="text-[11px] font-mono font-bold text-theme-primary bg-theme-card px-2.5 py-0.5 rounded border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)]">
                {book.genre || 'Literatura'}
              </span>
            </div>

            <h2 className="font-headline text-xl sm:text-2xl font-black text-theme-primary leading-tight">
              {book.title}
            </h2>
            <p className="text-sm sm:text-base text-theme-red font-reading font-bold italic mt-1">
              por {book.author}
            </p>

            {/* QUEM INDICOU ESTA OBRA */}
            <div className="mt-4 p-3 bg-theme-card rounded-xl border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)]">
              <div className="flex items-center gap-2 mb-1.5">
                <img
                  src={nominator.avatar}
                  alt={nominator.name}
                  className="w-6 h-6 rounded-md object-cover border border-theme-border shrink-0"
                />
                <span className="text-xs font-mono font-black text-theme-primary">
                  {isMyNomination ? 'Você indicou esta obra' : `Indicado por ${nominator.name}`}
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-theme-container text-theme-muted border border-theme-border">
                  {nominator.roleBadge || 'Camarada'}
                </span>
              </div>

              {book.nominationReason ? (
                <p className="text-xs font-reading italic text-theme-secondary leading-relaxed pl-1 border-l-2 border-theme-red/40 whitespace-pre-line">
                  "{formatTextWithBold(book.nominationReason)}"
                </p>
              ) : (
                <p className="text-xs font-reading italic text-theme-muted pl-1">
                  "Indicação especial para o debate coletivo do Exército da Paty!"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SEÇÃO DA SINOPSE COMPLETA */}
        <div className="mb-6 p-4 bg-theme-card rounded-xl border-2 border-theme-border shadow-[4px_4px_0px_var(--shadow-color)]">
          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-theme-border/30">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-theme-red" />
              <h4 className="font-headline font-black text-sm uppercase tracking-wider text-theme-primary">
                Sinopse da Obra
              </h4>
            </div>

            {!hasValidSynopsis && (
              <button
                type="button"
                onClick={handleFetchSynopsis}
                disabled={isSearchingSynopsis}
                className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg bg-theme-container hover:bg-theme-page text-theme-primary border border-theme-border transition-colors disabled:opacity-50"
              >
                {isSearchingSynopsis ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-theme-red" />
                    <span>Buscando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3 h-3 text-theme-red" />
                    <span>Buscar Sinopse na Web</span>
                  </>
                )}
              </button>
            )}
          </div>

          {hasValidSynopsis ? (
            <div className="text-xs sm:text-sm text-theme-secondary font-reading leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto pr-1">
              {formatTextWithBold(book.synopsis)}
            </div>
          ) : (
            <div className="text-center py-4 text-theme-muted">
              <FileText className="w-8 h-8 mx-auto mb-1 opacity-40 text-theme-red" />
              <p className="text-xs font-reading italic">
                Nenhuma sinopse detalhada foi fornecida na indicação desta obra.
              </p>
              <button
                type="button"
                onClick={handleFetchSynopsis}
                disabled={isSearchingSynopsis}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-xl bg-theme-red text-white hover:opacity-90 border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] transition-transform active:translate-y-0.5 disabled:opacity-50"
              >
                {isSearchingSynopsis ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Consultando bases de dados...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#FEF08A]" />
                    <span>Buscar Sinopse Automática na Web</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* SEÇÃO DE VOTOS & ENGAJAMENTO */}
        <div className="mb-6 p-4 bg-theme-card rounded-xl border-2 border-theme-border shadow-[4px_4px_0px_var(--shadow-color)]">
          <div className="flex items-center justify-between text-xs mb-2 font-mono">
            <span className="font-black text-theme-primary flex items-center gap-1.5">
              <Vote className="w-3.5 h-3.5 text-theme-red" />
              <span>{voteCount} {voteCount === 1 ? 'voto computado' : 'votos computados'}</span>
            </span>
            <span className="font-black text-theme-red">
              {votePercentage}% do total
            </span>
          </div>

          <div className="w-full bg-theme-container h-3 rounded-full border-2 border-theme-border overflow-hidden mb-3 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isLeader ? 'bg-theme-red' : 'bg-theme-gold'
              }`}
              style={{ width: `${votePercentage}%` }}
            />
          </div>

          {/* Camaradas que votaram */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-theme-border/20">
            <span className="text-[11px] font-mono text-theme-muted font-bold flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-theme-red" />
              <span>Camaradas que votaram:</span>
            </span>

            {book.votes && book.votes.length > 0 ? (
              <div className="flex -space-x-2">
                {book.votes.map((memberId) => {
                  const m = members.find(mem => mem.id === memberId);
                  if (!m) return null;
                  return (
                    <img
                      key={m.id}
                      src={m.avatar}
                      alt={m.name}
                      title={m.name}
                      className="w-6 h-6 rounded-full object-cover border-2 border-theme-border shadow-sm"
                    />
                  );
                })}
              </div>
            ) : (
              <span className="text-[11px] font-mono text-theme-muted italic">
                Nenhum voto confirmado ainda
              </span>
            )}
          </div>
        </div>

        {/* RODAPÉ DE AÇÕES */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-theme-border">
          <div className="flex items-center gap-2">
            {isMyNomination && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(book);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold bg-theme-card hover:bg-theme-container text-theme-primary border-2 border-theme-border rounded-xl shadow-[2px_2px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
              >
                <Pencil className="w-3.5 h-3.5 text-theme-gold" />
                <span>Editar Indicação</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono font-bold text-theme-muted hover:text-theme-primary bg-theme-card hover:bg-theme-container border-2 border-theme-border rounded-xl shadow-[2px_2px_0px_var(--shadow-color)] transition-transform active:translate-y-0.5"
            >
              Fechar
            </button>
          </div>

          {/* BOTÃO DE VOTAÇÃO NO MODAL */}
          <button
            type="button"
            onClick={() => onVoteToggle(book.id)}
            disabled={!hasVoted && isQuotaReached}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-headline font-black uppercase tracking-wider border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
              hasVoted
                ? 'bg-theme-red text-white hover:opacity-90'
                : isQuotaReached
                ? 'bg-theme-container text-theme-muted cursor-not-allowed opacity-60'
                : 'bg-theme-card hover:bg-theme-container text-theme-primary hover:border-theme-red'
            }`}
          >
            {hasVoted ? (
              <>
                <Check className="w-4 h-4 text-[#FEF08A]" />
                <span>Voto Confirmado (Remover)</span>
              </>
            ) : isQuotaReached ? (
              <span>Cotas de Votos Esgotadas ({maxVotes}/{maxVotes})</span>
            ) : (
              <>
                <Vote className="w-4 h-4 text-theme-red" />
                <span>Votar neste Livro ({remainingVotes} restando)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
