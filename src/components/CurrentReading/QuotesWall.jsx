import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { useAuth } from '../../context/AuthContext';
import ComradeCat from '../common/ComradeCat';
import ConfidentialSpoiler from '../common/ConfidentialSpoiler';
import { formatTextWithBold } from '../../utils/textFormat';
import { 
  Quote, 
  Send, 
  Heart, 
  Trash2, 
  Pencil, 
  Check, 
  X, 
  Sparkles, 
  ShieldAlert,
  Lock,
  EyeOff,
  BookOpen,
  MessageSquare,
  BookmarkCheck,
  CheckSquare,
  Square
} from 'lucide-react';

export default function QuotesWall() {
  const { 
    quotes, 
    activeMember, 
    members, 
    addQuote, 
    updateQuote, 
    deleteQuote, 
    toggleQuoteLike, 
    toggleQuoteSpoiler,
    currentReading,
    triggerComradeConfetti
  } = useClub();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [text, setText] = useState('');
  const [page, setPage] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [isBookSpecific, setIsBookSpecific] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'book', 'general'

  // Estado para citação sendo editada
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editPage, setEditPage] = useState('');
  const [editSpoiler, setEditSpoiler] = useState(false);
  const [editIsBookSpecific, setEditIsBookSpecific] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('Faça login para publicar uma citação no mural coletivo.', 'login');
      return;
    }
    if (!text.trim()) return;

    setIsSubmitting(true);
    addQuote({ text, page, isSpoiler, isBookSpecific });
    setText('');
    setPage('');
    setIsSpoiler(false);
    setIsBookSpecific(true);
    setIsSubmitting(false);

    if (triggerComradeConfetti) {
      triggerComradeConfetti();
    }
  };

  const handleStartEdit = (quote) => {
    if (!isAuthenticated) {
      openAuthModal('Faça login para editar sua citação.', 'login');
      return;
    }
    setEditingId(quote.id);
    setEditText(quote.text);
    setEditPage(quote.page || '');
    setEditSpoiler(!!quote.isSpoiler);
    setEditIsBookSpecific(quote.isBookSpecific !== false);
  };

  const handleDelete = (quoteId) => {
    if (!isAuthenticated) {
      openAuthModal('Faça login para excluir sua citação.', 'login');
      return;
    }
    deleteQuote(quoteId);
  };

  const handleLikeClick = (quoteId) => {
    if (!isAuthenticated) {
      openAuthModal('Faça login para curtir citações no mural coletivo.', 'login');
      return;
    }
    toggleQuoteLike(quoteId);
  };

  const handleSaveEdit = (quoteId) => {
    if (!editText.trim()) return;
    updateQuote(quoteId, { 
      text: editText, 
      page: editPage, 
      isSpoiler: editSpoiler, 
      isBookSpecific: editIsBookSpecific 
    });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditPage('');
    setEditSpoiler(false);
    setEditIsBookSpecific(true);
  };

  return (
    <div className="retro-card rounded-2xl p-3.5 sm:p-7 relative bg-theme-container border-2 border-theme-border shadow-[6px_6px_0px_var(--shadow-color)] transition-colors duration-300">
      
      {/* Cabeçalho do Mural */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-theme-border mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-theme-red text-white border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] flex items-center justify-center font-black text-sm">
            ★
          </div>
          <div>
            <h3 className="font-headline font-black text-lg sm:text-xl text-theme-primary flex items-center gap-1.5">
              <span>Mural Revolucionário de Citações</span>
              <span className="text-theme-red">★</span>
            </h3>
            <p className="text-xs text-theme-muted font-reading font-semibold italic">
              Passagens marcantes de "{currentReading.title}"
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono font-black text-[#111111] bg-[#FEF08A] px-3 py-1 rounded-lg border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)]">
          {quotes.length} {quotes.length === 1 ? 'citação' : 'citações compartilhadas'}
        </span>
      </div>

      {/* Formulário Rápido de Adicionar Citação */}
      <form onSubmit={handleSubmit} className="mb-6 bg-theme-card p-4 sm:p-5 rounded-xl border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)]">
        <div className="flex items-center gap-2.5 mb-3">
          <img
            src={activeMember.avatar}
            alt={activeMember.name}
            className="w-9 h-9 rounded-lg object-cover border-2 border-theme-border shadow-sm"
          />
          <div>
            <p className="text-xs font-mono font-black text-theme-primary">
              Publicando como: <span className="text-theme-red font-black">{activeMember.name}</span>
              <span className="text-[10px] text-theme-muted ml-1.5 font-bold">({activeMember.roleBadge})</span>
            </p>
            <p className="text-[10px] text-theme-muted font-reading">
              Qual trecho do livro chamou a sua atenção hoje?
            </p>
          </div>
        </div>

        <textarea
          rows={3}
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`"Cole ou digite aqui uma passagem marcante que você sublinhou..."`}
          className="w-full text-xs sm:text-sm bg-theme-input border-2 border-theme-border rounded-lg p-3 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red/20 leading-relaxed font-reading italic shadow-inner"
        />

        {/* Caixinha Seletora de Associação à Leitura Atual */}
        <div className="mt-2.5 p-2.5 rounded-lg bg-theme-container border border-theme-border/70 flex items-start gap-2.5 transition-colors">
          <input
            id="quote-book-link"
            type="checkbox"
            checked={isBookSpecific}
            onChange={(e) => setIsBookSpecific(e.target.checked)}
            className="w-4 h-4 rounded text-theme-red accent-theme-red cursor-pointer shrink-0 mt-0.5"
          />
          <label htmlFor="quote-book-link" className="text-xs cursor-pointer select-none">
            <span className="font-bold text-theme-primary flex items-center gap-1.5 flex-wrap">
              <span>Vincular esta citação à leitura atual</span>
              <span className="font-mono text-[10px] text-theme-red bg-theme-red/10 px-1.5 py-0.2 rounded border border-theme-red/30 font-bold">
                "{currentReading?.title || 'Livro Atual'}"
              </span>
            </span>
            <span className="block text-[10.5px] text-theme-muted font-reading mt-0.5 leading-snug">
              {isBookSpecific 
                ? '★ Sim! Assim que o livro for para o acervo de já lidos, estas citações irão para lá automaticamente.'
                : '💬 Não vincular. Publicar como comentário geral ou conversa do clube (não será associado ao livro no acervo).'}
            </span>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-3 w-full">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={page}
              onChange={(e) => setPage(e.target.value)}
              placeholder="Página (ex: p. 45)"
              className="w-full sm:w-32 text-xs bg-theme-input border-2 border-theme-border rounded-lg px-3 py-2 text-theme-primary focus:outline-none font-mono"
            />

            {/* Botão Seletor Temático Tarja Confidencial (Spoiler) */}
            <button
              type="button"
              onClick={() => setIsSpoiler(!isSpoiler)}
              title="Ativar tarja censurada para proteger camaradas de spoilers"
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-bold border-2 border-theme-border transition-all shadow-[2px_2px_0px_var(--shadow-color)] ${
                isSpoiler
                  ? 'bg-theme-red text-white font-black'
                  : 'bg-theme-container text-theme-muted hover:text-theme-primary'
              }`}
            >
              <Lock className={`w-3.5 h-3.5 ${isSpoiler ? 'text-[#FEF08A]' : 'text-theme-red'}`} />
              <span>{isSpoiler ? '🔒 Tarja Confidencial Ativada' : '🔒 Tarja Confidencial (Spoiler)'}</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !text.trim()}
            className="w-full sm:w-auto justify-center px-5 py-2.5 bg-theme-red hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs font-mono font-black uppercase tracking-wider rounded-lg border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-[#FEF08A]" />
            <span>Prego no Mural ★</span>
          </button>
        </div>
      </form>

      {/* Controles de Filtragem e Status de Rolagem */}
      {quotes.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-theme-border/50">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-theme-red text-white border-theme-border font-black shadow-xs'
                  : 'bg-theme-card text-theme-muted hover:text-theme-primary border-theme-border/40'
              }`}
            >
              Todas ({quotes.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('book')}
              className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                filterType === 'book'
                  ? 'bg-theme-red text-white border-theme-border font-black shadow-xs'
                  : 'bg-theme-card text-theme-muted hover:text-theme-primary border-theme-border/40'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>Deste Livro ({quotes.filter(q => q.isBookSpecific !== false).length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType('general')}
              className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                filterType === 'general'
                  ? 'bg-theme-red text-white border-theme-border font-black shadow-xs'
                  : 'bg-theme-card text-theme-muted hover:text-theme-primary border-theme-border/40'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>Gerais ({quotes.filter(q => q.isBookSpecific === false).length})</span>
            </button>
          </div>

          <span className="text-[10px] font-mono text-theme-muted font-bold hidden sm:inline flex items-center gap-1">
            <span>↕ Rolagem ativada</span>
          </span>
        </div>
      )}

      {/* Lista de Citações OU Empty State com o Gato Camarada */}
      {quotes.length === 0 ? (
        <div className="p-6 sm:p-8 text-center bg-theme-card rounded-xl border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] flex flex-col items-center">
          <div className="w-full flex items-center justify-center gap-2.5 sm:gap-4 my-2">
            <ComradeCat 
              pose="reading" 
              size="md" 
              showBubble={true} 
              customQuote="Camaradas, destaque uma passagem e compartilhe com o comitê!" 
              bubblePosition="right" 
            />
          </div>
          <h4 className="font-headline font-black text-lg text-theme-primary mb-1 mt-3">
            Nenhuma citação pregada no mural ainda!
          </h4>
          <p className="text-xs text-theme-muted font-reading max-w-md mx-auto italic">
            O Gato Camarada está esperando você destacar uma passagem impactante de "{currentReading.title}". Seja a primeira!
          </p>
        </div>
      ) : (
        /* Container Rolável Dedicado para quando o número de citações for grande */
        <div className="max-h-[580px] sm:max-h-[660px] overflow-y-auto pr-1 sm:pr-2 space-y-4 custom-scrollbar">
          {quotes
            .filter(q => {
              if (filterType === 'book') return q.isBookSpecific !== false;
              if (filterType === 'general') return q.isBookSpecific === false;
              return true;
            })
            .map((quote) => {
              const authorMember = members.find(m => m.id === quote.memberId) || {
                name: quote.authorName || 'Camarada',
                avatar: quote.authorAvatar || activeMember.avatar,
                color: '#D62828'
              };

              const isAuthor = quote.memberId === activeMember.id;
              const isEditing = editingId === quote.id;
              const isLiked = (quote.likedBy || quote.likes || []).includes(activeMember.id);
              const likesCount = (quote.likedBy || quote.likes || []).length;

              // Identifica os membros que curtiram este comentário
              const likerIds = quote.likedBy || quote.likes || [];
              const likerMembers = likerIds.map(id => members.find(m => m.id === id)).filter(Boolean);

              return (
                <div
                  key={quote.id}
                  className={`p-4 sm:p-5 rounded-xl border-2 border-theme-border transition-all ${
                    isAuthor 
                      ? 'bg-theme-card shadow-[4px_4px_0px_var(--accent-red)]' 
                      : 'bg-theme-card shadow-[3px_3px_0px_var(--shadow-color)]'
                  }`}
                >
                  {/* Topo do Card de Citação */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={authorMember.avatar || quote.authorAvatar || activeMember.avatar}
                        alt={authorMember.name || quote.authorName}
                        className="w-8 h-8 rounded-lg object-cover border-2 border-theme-border"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-headline font-bold text-theme-primary">
                            {authorMember.name || quote.authorName}
                          </span>
                          {isAuthor && (
                            <span className="text-[9px] font-mono bg-theme-red text-white font-bold px-1.5 py-0.2 rounded border border-theme-border">
                              Você
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-theme-muted font-mono block">
                          {quote.date || 'Hoje'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Selo: Livro Atual vs Comentário Geral */}
                      {quote.isBookSpecific !== false ? (
                        <span 
                          title={`Associado ao livro: ${quote.bookTitle || currentReading.title}`}
                          className="text-[9.5px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-theme-red/10 text-theme-red border border-theme-red/30 flex items-center gap-1 max-w-[140px] sm:max-w-[210px] truncate"
                        >
                          <BookOpen className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{quote.bookTitle || currentReading.title}</span>
                        </span>
                      ) : (
                        <span 
                          title="Comentário geral do clube (não associado a um livro específico)"
                          className="text-[9.5px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-theme-container text-theme-muted border border-theme-border flex items-center gap-1"
                        >
                          <MessageSquare className="w-2.5 h-2.5 shrink-0" />
                          <span>Comentário Geral</span>
                        </span>
                      )}

                      {quote.page && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-theme-container text-theme-red border border-theme-border">
                          {quote.page}
                        </span>
                      )}

                      {/* Botão Rápido de Tarja Confidencial + Botões de Edição e Exclusão */}
                      <div className="flex items-center gap-1 ml-1">
                        <button
                          type="button"
                          onClick={() => toggleQuoteSpoiler(quote.id)}
                          title={quote.isSpoiler ? "Desativar Tarja Confidencial deste comentário" : "Ativar Tarja Confidencial (Anti-Spoiler)"}
                          className={`p-1.5 border border-theme-border rounded transition-all flex items-center gap-1 text-[10px] font-mono font-bold cursor-pointer ${
                            quote.isSpoiler
                              ? 'bg-theme-red text-white shadow-xs'
                              : 'bg-theme-container text-theme-muted hover:text-theme-primary'
                          }`}
                        >
                          {quote.isSpoiler ? <EyeOff className="w-3 h-3 text-[#FEF08A]" /> : <Lock className="w-3 h-3 text-theme-red" />}
                          <span className="hidden sm:inline">{quote.isSpoiler ? 'Confidencial' : 'Tarja'}</span>
                        </button>

                        {isAuthor && !isEditing && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(quote)}
                              title="Editar citação"
                              className="p-1 hover:bg-[#FEF08A] hover:text-[#111111] text-theme-primary border border-theme-border rounded transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(quote.id)}
                              title="Excluir citação"
                              className="p-1 hover:bg-theme-red hover:text-white text-theme-red border border-theme-border rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo da Citação: Normal ou Modo Edição */}
                  {isEditing ? (
                    <div className="space-y-3 pt-2">
                      <textarea
                        rows={3}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full text-xs sm:text-sm bg-theme-input border-2 border-theme-border rounded-lg p-2.5 text-theme-primary focus:outline-none font-reading italic"
                      />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            value={editPage}
                            onChange={(e) => setEditPage(e.target.value)}
                            placeholder="Página (ex: p. 45)"
                            className="w-28 text-xs bg-theme-input border-2 border-theme-border rounded px-2.5 py-1 text-theme-primary font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setEditSpoiler(!editSpoiler)}
                            className={`px-2 py-1 text-[10px] font-mono font-bold rounded border border-theme-border flex items-center gap-1 cursor-pointer ${
                              editSpoiler ? 'bg-theme-red text-white' : 'bg-theme-container text-theme-muted'
                            }`}
                          >
                            <Lock className="w-3 h-3" />
                            <span>{editSpoiler ? 'Com Spoiler' : 'Sem Spoiler'}</span>
                          </button>

                          <label className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-theme-primary cursor-pointer px-2 py-1 rounded border border-theme-border bg-theme-container">
                            <input
                              type="checkbox"
                              checked={editIsBookSpecific}
                              onChange={(e) => setEditIsBookSpecific(e.target.checked)}
                              className="w-3 h-3 text-theme-red accent-theme-red cursor-pointer"
                            />
                            <span>Vincular ao livro</span>
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-xs font-bold text-theme-muted hover:bg-theme-container rounded border border-theme-border cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(quote.id)}
                            className="px-3 py-1 text-xs font-bold bg-theme-red text-white rounded border border-theme-border flex items-center gap-1 shadow-sm cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Salvar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <ConfidentialSpoiler isSpoiler={quote.isSpoiler}>
                        <div className="text-xs sm:text-sm text-theme-secondary leading-relaxed font-reading italic pl-3 border-l-2 border-theme-red my-2 whitespace-pre-line">
                          "{formatTextWithBold(quote.text)}"
                        </div>
                      </ConfidentialSpoiler>

                      {/* Barra Inferior: Quem curtiu + Botão de Curtida */}
                      <div className="flex items-center justify-between gap-2 pt-2.5 mt-2 border-t border-theme-border/40">
                        {/* Quem curtiu (Avatares e Nomes) */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          {likerMembers.length > 0 ? (
                            <div className="flex items-center gap-1.5 min-w-0">
                              {/* Avatares sobrepostos */}
                              <div className="flex items-center -space-x-1.5 shrink-0">
                                {likerMembers.slice(0, 4).map((member, i) => (
                                  <img
                                    key={member.id || i}
                                    src={member.avatar}
                                    alt={member.name}
                                    title={member.name}
                                    className="w-5 h-5 rounded-full object-cover border border-theme-border ring-1 ring-theme-container shadow-xs"
                                  />
                                ))}
                              </div>
                              <span 
                                className="text-[10px] font-mono text-theme-muted font-bold truncate max-w-[160px] sm:max-w-xs"
                                title={`Curtido por: ${likerMembers.map(m => m.name).join(', ')}`}
                              >
                                Curtido por{' '}
                                <span className="text-theme-primary font-bold">
                                  {likerMembers.map(m => (m.id === activeMember.id ? 'Você' : m.name.split(' ')[0])).slice(0, 2).join(', ')}
                                  {likerMembers.length > 2 ? ` e +${likerMembers.length - 2}` : ''}
                                </span>
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-mono text-theme-muted italic">
                              Nenhuma curtida ainda
                            </span>
                          )}
                        </div>

                        {/* Botão de Curtida */}
                        <button
                          type="button"
                          onClick={() => handleLikeClick(quote.id)}
                          title={isLiked ? "Descurtir citação" : "Curtir citação"}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold border-2 border-theme-border transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 shrink-0 cursor-pointer ${
                            isLiked 
                              ? 'bg-theme-red text-white font-bold shadow-[2px_2px_0px_var(--shadow-color)]' 
                              : 'bg-theme-card text-theme-primary hover:bg-theme-container shadow-[2px_2px_0px_var(--shadow-color)]'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#FEF08A] text-[#FEF08A]' : 'text-theme-red'}`} />
                          <span>{likesCount}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
        </div>
      )}

    </div>
  );
}
