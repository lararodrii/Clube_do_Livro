import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import BookCover from '../common/BookCover';
import ComradeCat from '../common/ComradeCat';
import NominateModal from './NominateModal';
import RouletteModal from './RouletteModal';
import EditNominationModal from './EditNominationModal';
import { formatTextWithBold } from '../../utils/textFormat';
import { 
  Vote, 
  BookPlus, 
  Dices, 
  Check, 
  Lock, 
  Unlock, 
  Users,
  Award,
  Pencil,
  Trash2,
  Sparkles
} from 'lucide-react';

export default function VotingBallot() {
  const { 
    ballot, 
    activeMember, 
    members, 
    toggleVote, 
    toggleBallotStatus, 
    promoteToCurrentBook,
    triggerComradeConfetti,
    isAuthenticated,
    openAuthModal
  } = useClub();

  const [isNominateOpen, setIsNominateOpen] = useState(false);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const books = ballot.books || [];

  // Total de votos nesta rodada
  const totalBallotVotes = books.reduce((acc, b) => acc + (b.votes?.length || 0), 0);

  const maxVotes = ballot.maxVotesPerMember || 3;

  // Votos já utilizados pelo membro ativo (limite estrito de até 3 votos)
  const activeMemberVotesCount = books.reduce((acc, b) => {
    return acc + ((b.votes || []).includes(activeMember.id) ? 1 : 0);
  }, 0);

  const remainingVotes = Math.max(0, maxVotes - activeMemberVotesCount);
  const isQuotaReached = activeMemberVotesCount >= maxVotes;

  // Encontrar o(s) livro(s) líder(es) de votação
  const sortedBooks = [...books].sort((a, b) => (b.votes?.length || 0) - (a.votes?.length || 0));
  const topVotes = sortedBooks[0]?.votes?.length || 0;
  const isLeader = (book) => topVotes > 0 && book.votes?.length === topVotes;

  const handleVoteClick = (bookId) => {
    if (!isAuthenticated) {
      openAuthModal('Identifique-se com sua conta para votar na Urna Popular!', 'login');
      return;
    }
    toggleVote(bookId);
    if (triggerComradeConfetti) {
      triggerComradeConfetti();
    }
  };

  const handleNominateClick = () => {
    if (!isAuthenticated) {
      openAuthModal('Faça login para indicar novas obras na Urna Popular!', 'login');
      return;
    }
    setIsNominateOpen(true);
  };

  const handleToggleBallotStatus = () => {
    if (!isAuthenticated) {
      openAuthModal('Acesso restrito: faça login para abrir ou fechar a urna popular!', 'login');
      return;
    }
    toggleBallotStatus();
  };

  const handlePromoteClick = (bookId) => {
    if (!isAuthenticated) {
      openAuthModal('Acesso restrito: faça login para eleger o livro do mês!', 'login');
      return;
    }
    promoteToCurrentBook(bookId);
  };

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho do Módulo de Votação com o Mascote Fiscalizando a Urna */}
      <div className="retro-card rounded-2xl p-3.5 sm:p-8 bg-theme-container border-2 border-theme-border shadow-[6px_6px_0px_var(--shadow-color)] relative transition-colors duration-300">
        
        {/* Título e Status da Urna */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-theme-border">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] ${
                ballot.status === 'open' 
                  ? 'bg-[#FEF08A] text-[#111111] font-bold' 
                  : 'bg-theme-card text-theme-muted'
              }`}>
                {ballot.status === 'open' ? '★ Urna Popular Aberta' : 'Votação Encerrada'}
              </span>
              <span className="text-xs text-theme-muted font-reading font-bold italic">
                Eleição da Próxima Leitura
              </span>
            </div>

            <h2 className="font-headline font-black text-xl sm:text-2xl text-theme-primary flex items-center gap-1.5">
              <span className="text-theme-red">★</span>
              <span>Urna Popular do Exército da Paty</span>
            </h2>
            <p className="text-xs sm:text-sm text-theme-muted mt-0.5 max-w-xl font-reading font-semibold">
              Indicações <strong className="text-theme-red font-black">100% livres e ilimitadas</strong>! Cada camarada tem direito a até {ballot.maxVotesPerMember} votos para eleger a próxima obra revolucionária.
            </p>
          </div>
        </div>

        {/* Bloco do Gato + Balão de fala Centralizado e Compacto */}
        <div className="w-full flex items-center justify-center gap-2.5 sm:gap-4 p-3 sm:p-5 mx-auto">
          <ComradeCat 
            pose="voting" 
            size="md" 
            showBubble={true}
            customQuote="Não vai lutar contra o fascismo? Vote já!"
            bubblePosition="right"
            className="w-full max-w-lg justify-center"
          />
        </div>

        {/* Grid Limpo e Centralizado de Ações */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-between gap-2.5 w-full mt-2 pt-3 border-t-2 border-theme-border">
          
          {/* Votos Usados / Cota de Votos */}
          {isQuotaReached ? (
            <div className="bg-theme-red text-white px-3 py-2 rounded-xl border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] text-center flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FEF08A] animate-ping shrink-0" />
              <div className="text-left">
                <span className="text-[9px] font-mono font-black uppercase tracking-wider text-[#FEF08A] block leading-none">
                  ★ Votos esgotados
                </span>
                <span className="text-[10px] font-mono font-bold text-white leading-tight">
                  {activeMemberVotesCount}/{maxVotes} votos
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-theme-card px-3 py-2 rounded-xl border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] text-center">
              <span className="text-[9px] font-mono text-theme-muted font-bold uppercase tracking-wider block">
                Cédulas Restantes:
              </span>
              <span className="text-xs sm:text-sm font-mono font-black text-theme-red">
                {remainingVotes} de {maxVotes} votos
              </span>
            </div>
          )}

          {/* Alternar Status (Administrador da Urna) */}
          <button
            onClick={handleToggleBallotStatus}
            title="Abrir ou fechar a urna de votação"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-theme-card hover:bg-theme-container text-theme-primary border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
          >
            {ballot.status === 'open' ? (
              <>
                <Lock className="w-3.5 h-3.5 text-theme-red shrink-0" />
                <span className="whitespace-nowrap">Fechar Urna</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-theme-gold shrink-0" />
                <span className="whitespace-nowrap">Reabrir Urna</span>
              </>
            )}
          </button>

          {/* BOTÃO DE INDICAÇÃO (ILIMITADO) */}
          <button
            onClick={handleNominateClick}
            className="col-span-2 sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 bg-theme-red hover:opacity-90 text-white font-bold rounded-xl text-xs font-headline font-black uppercase tracking-wider border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
          >
            <BookPlus className="w-4 h-4 text-[#FEF08A] shrink-0" />
            <span className="whitespace-nowrap">INDICAR LIVRO (+1) ★</span>
          </button>
        </div>

        {/* Barra de Ações Rápidas: Desempate da Sorte e Promoção */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-theme-primary">
            <Users className="w-4 h-4 text-theme-red" />
            <span>Total de {totalBallotVotes} votos computados ({books.length} obras indicadas)</span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Botão Desempate da Sorte (Roleta) */}
            {books.length > 0 && (
              <button
                type="button"
                onClick={() => setIsRouletteOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-black bg-[#FEF08A] hover:bg-[#FDE047] text-[#111111] font-bold border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 group"
              >
                <Dices className="w-4 h-4 text-theme-red group-hover:rotate-45 transition-transform" />
                <span>Sorteio da Roleta 🎲</span>
              </button>
            )}

            {/* Botão Promover mais votado */}
            {sortedBooks.length > 0 && topVotes > 0 && (
              <button
                type="button"
                onClick={() => handlePromoteClick(sortedBooks[0].id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-black bg-theme-container text-theme-gold border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <span>★</span>
                <span>Eleger Líder ({sortedBooks[0].title.substring(0, 15)}...)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Cards dos Livros na Urna OU Empty State Padronizado com o Gato Camarada */}
      {books.length === 0 ? (
        <div className="retro-card rounded-2xl p-8 sm:p-12 text-center bg-theme-card border-2 border-theme-border shadow-[6px_6px_0px_var(--shadow-color)] flex flex-col items-center">
          <div className="mb-3">
            <ComradeCat 
              pose="reading" 
              size="lg" 
              showBubble={true} 
              customQuote="Camaradas, a urna está zerada! Quem vai indicar a primeira obra?"
              bubblePosition="top"
            />
          </div>
          <h3 className="font-headline font-black text-2xl text-theme-primary mb-2 mt-2">
            Urna Popular Pronta para Votação!
          </h3>
          <p className="text-sm text-theme-muted max-w-md mx-auto mb-6 font-reading italic leading-relaxed">
            O Gato Camarada está a postos fiscalizando a urna com sua boina estrelada. Todas as 6 integrantes podem indicar quantas obras quiserem e votar em até 3 favoritas!
          </p>
          <button
            onClick={handleNominateClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-theme-red hover:opacity-90 text-white font-bold rounded-xl text-sm font-headline font-black uppercase tracking-wider border-2 border-theme-border shadow-[4px_4px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
          >
            <BookPlus className="w-4 h-4 text-[#FEF08A]" />
            <span>Indicar a Primeira Obra ★</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => {
            const voteCount = book.votes?.length || 0;
            const votePercentage = totalBallotVotes > 0 
              ? Math.round((voteCount / totalBallotVotes) * 100) 
              : 0;
            
            const hasVotedForThis = book.votes?.includes(activeMember.id);
            const isMyNomination = book.nominatedBy === activeMember.id;
            const leader = isLeader(book);
            
            // Membro que indicou
            const nominator = members.find(m => m.id === book.nominatedBy) || {
              name: 'Camarada',
              avatar: '',
              color: '#D62828'
            };

            return (
              <div
                key={book.id}
                className={`retro-card rounded-2xl p-5 flex flex-col justify-between relative transition-all duration-200 border-2 border-theme-border ${
                  hasVotedForThis
                    ? 'bg-theme-card shadow-[6px_6px_0px_var(--accent-red)] -translate-x-0.5 -translate-y-0.5'
                    : 'bg-theme-card shadow-[4px_4px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_var(--shadow-color)]'
                }`}
              >
                {/* Badges superiores estilo carimbo */}
                <div className="absolute -top-3 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
                  {leader ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-theme-red text-white font-bold border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)]">
                      <span>★</span> Mais Votado
                    </span>
                  ) : <span />}

                  {isMyNomination && (
                    <span className="flex items-center gap-1 text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#FEF08A] text-[#111111] font-bold border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)]">
                      <span>★</span> Sua Indicação
                    </span>
                  )}
                </div>

                <div>
                  {/* Linha Superior: Quem indicou + Botão Editar se for autor */}
                  <div className="flex items-center justify-between gap-2 mb-4 pt-1">
                    <div className="flex items-center gap-2">
                      <img
                        src={nominator.avatar}
                        alt={nominator.name}
                        className="w-6 h-6 rounded-md object-cover border border-theme-border"
                      />
                      <span className="text-[11px] text-theme-muted font-reading font-bold">
                        {isMyNomination ? (
                          <strong className="text-theme-red">Você indicou</strong>
                        ) : (
                          <>Indicado por <strong className="text-theme-primary">{nominator.name}</strong></>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-theme-muted bg-theme-container px-2 py-0.5 rounded border border-theme-border">
                        {book.pages} págs
                      </span>

                      {/* BOTÃO DE EDITAR / EXCLUIR PRÓPRIA RECOMENDAÇÃO */}
                      {isMyNomination && (
                        <button
                          type="button"
                          onClick={() => setEditingBook(book)}
                          title="Editar ou excluir sua recomendação"
                          className="p-1 hover:bg-[#FEF08A] hover:text-[#111111] text-theme-primary rounded border border-theme-border transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bloco de Capa e Título */}
                  <div className="flex gap-4 items-start mb-4">
                    <div className="shrink-0">
                      <BookCover
                        src={book.coverUrl}
                        title={book.title}
                        author={book.author}
                        size="md"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-headline font-black text-base sm:text-lg text-theme-primary leading-snug line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-xs text-theme-red font-reading font-bold italic mt-0.5">
                        por {book.author}
                      </p>
                      <p className="text-[10px] text-theme-muted font-mono mt-1 line-clamp-1 uppercase font-bold">
                        {book.genre}
                      </p>

                      {/* Defesa da Indicação ("Por que ler") */}
                      {book.nominationReason && (
                        <div className="mt-3 p-2.5 bg-theme-container rounded-lg border border-theme-border/40 text-theme-secondary">
                          <p className="text-[11px] italic font-reading line-clamp-3 leading-relaxed whitespace-pre-line">
                            "{formatTextWithBold(book.nominationReason)}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Seção Inferior: Votos, Percentual e Botão */}
                <div className="mt-4 pt-4 border-t-2 border-theme-border">
                  
                  {/* Barra de Progresso e Contagem de Votos */}
                  <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                    <span className="font-black text-theme-primary">
                      {voteCount} {voteCount === 1 ? 'voto' : 'votos'}
                    </span>
                    <span className="font-black text-theme-red">
                      {votePercentage}%
                    </span>
                  </div>

                  <div className="w-full bg-theme-container h-3 rounded border-2 border-theme-border overflow-hidden mb-3 p-0.5">
                    <div
                      className={`h-full rounded transition-all duration-500 ${
                        leader ? 'bg-theme-red' : 'bg-theme-gold'
                      }`}
                      style={{ width: `${votePercentage}%` }}
                    />
                  </div>

                  {/* Avatares dos membros que votaram neste livro */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono text-theme-muted font-bold">Votos confirmados:</span>
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {book.votes?.map((memberId) => {
                        const m = members.find(mem => mem.id === memberId);
                        if (!m) return null;
                        return (
                          <img
                            key={m.id}
                            src={m.avatar}
                            alt={m.name}
                            title={m.name}
                            className="w-5 h-5 rounded-full object-cover border border-theme-border"
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Botão de Votação (Desativa e exibe badge quando cota de 3 votos for atingida) */}
                  <button
                    type="button"
                    onClick={() => handleVoteClick(book.id)}
                    disabled={ballot.status !== 'open' || (!hasVotedForThis && isQuotaReached)}
                    className={`w-full py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider border-2 border-theme-border transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-1.5 ${
                      hasVotedForThis
                        ? 'bg-theme-red text-white font-bold shadow-[3px_3px_0px_var(--shadow-color)]'
                        : !isQuotaReached && ballot.status === 'open'
                        ? 'bg-theme-container hover:bg-[#FEF08A] hover:text-[#111111] text-theme-primary shadow-[3px_3px_0px_var(--shadow-color)]'
                        : 'bg-theme-card text-theme-muted border-theme-border/40 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {hasVotedForThis ? (
                      <>
                        <Check className="w-4 h-4 text-[#FEF08A]" />
                        <span>Voto Registrado (Remover)</span>
                      </>
                    ) : isQuotaReached ? (
                      <span className="text-theme-muted font-bold">Votos esgotados nesta rodada</span>
                    ) : ballot.status === 'open' ? (
                      <>
                        <Vote className="w-4 h-4 text-theme-red" />
                        <span>Votar neste Livro ({remainingVotes} restando)</span>
                      </>
                    ) : (
                      <span>Votação Encerrada</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modais */}
      <NominateModal
        isOpen={isNominateOpen}
        onClose={() => setIsNominateOpen(false)}
      />

      <RouletteModal
        isOpen={isRouletteOpen}
        onClose={() => setIsRouletteOpen(false)}
        books={books}
      />

      <EditNominationModal
        book={editingBook}
        isOpen={!!editingBook}
        onClose={() => setEditingBook(null)}
      />

    </div>
  );
}
