import React, { useState, useMemo } from 'react';
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
  Flame,
  Search,
  Users
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'my'
  const [searchQuery, setSearchQuery] = useState('');

  // Estado para citação sendo editada
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editPage, setEditPage] = useState('');
  const [editSpoiler, setEditSpoiler] = useState(false);

  // FILTRAGEM ESTRITA PARA O MURAL:
  // Exclusivamente e apenas trechos classificados como Consensos do Comitê (grifados por 2 ou mais camaradas).
  // Destaques individuais ficam restritos ao Dossiê Coletivo ou à visão pessoal.
  const consensusQuotes = useMemo(() => {
    return (quotes || []).filter(q => 
      q.isConsensus === true || (Array.isArray(q.highlightedBy) && q.highlightedBy.length >= 2)
    );
  }, [quotes]);

  // Contagem de consensos com a participação do membro logado
  const myConsensusCount = useMemo(() => {
    return consensusQuotes.filter(q => 
      Array.isArray(q.highlightedBy) && q.highlightedBy.some(m => m.id === activeMember.id)
    ).length;
  }, [consensusQuotes, activeMember.id]);

  // Lista filtrada por aba e termo de busca
  const displayedQuotes = useMemo(() => {
    let list = [...consensusQuotes];

    if (filterType === 'my') {
      list = list.filter(q => 
        Array.isArray(q.highlightedBy) && q.highlightedBy.some(m => m.id === activeMember.id)
      );
    }

    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase().trim();
      list = list.filter(q => 
        (q.text || '').toLowerCase().includes(term) ||
        String(q.page || '').includes(term) ||
        (Array.isArray(q.highlightedBy) && q.highlightedBy.some(m => (m.name || '').toLowerCase().includes(term)))
      );
    }

    return list;
  }, [consensusQuotes, filterType, searchQuery, activeMember.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('Faça login para sugerir passagens para o Mural do Comitê.', 'login');
      return;
    }
    if (!text.trim()) return;

    setIsSubmitting(true);
    addQuote({ text, page, isSpoiler, isBookSpecific: true });
    setText('');
    setPage('');
    setIsSpoiler(false);
    setIsSubmitting(false);

    if (triggerComradeConfetti) {
      triggerComradeConfetti(45);
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
  };

  const handleDelete = (quoteId) => {
    if (!isAuthenticated) {
      openAuthModal('Faça login para gerenciar sua citação.', 'login');
      return;
    }
    deleteQuote(quoteId);
  };

  const handleLikeClick = (quoteId) => {
    if (!isAuthenticated) {
      openAuthModal('Faça login para curtir passagens no mural coletivo.', 'login');
      return;
    }
    toggleQuoteLike(quoteId);
  };

  const handleSaveEdit = (quoteId) => {
    if (!editText.trim()) return;
    updateQuote(quoteId, { 
      text: editText, 
      page: editPage, 
      isSpoiler: editSpoiler 
    });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditPage('');
    setEditSpoiler(false);
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
              Consensos do Comitê de "{currentReading.title}" (grifados por 2+ camaradas)
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono font-black text-[#111111] bg-[#FEF08A] px-3 py-1 rounded-lg border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-theme-red fill-current" />
          <span>{consensusQuotes.length} {consensusQuotes.length === 1 ? 'consenso do comitê' : 'consensos do comitê'}</span>
        </span>
      </div>

      {/* Formulário de Registro / Sugestão de Passagem */}
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
              Qual trecho marcante de "{currentReading?.title}" você sublinhou hoje?
            </p>
          </div>
        </div>

        <textarea
          rows={3}
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`"Cole ou digite aqui uma passagem marcante que você sublinhou no livro..."`}
          className="w-full text-xs sm:text-sm bg-theme-input border-2 border-theme-border rounded-lg p-3 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red/20 leading-relaxed font-reading italic shadow-inner"
        />

        {/* Banner Informativo da Regra Estrita do Mural */}
        <div className="mt-2.5 p-2.5 rounded-lg bg-[#FEF08A]/30 border border-[#FEF08A] text-theme-primary flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-theme-red shrink-0 mt-0.5" />
          <p className="text-[11px] font-reading leading-relaxed">
            <strong className="font-bold text-theme-red">★ Regra Estrita do Mural:</strong> Este espaço exibe exclusivamente passagens que atingiram o <strong className="font-bold">Consenso do Comitê</strong> (grifadas por 2 ou mais camaradas). Trechos individuais ficam guardados no Dossiê Coletivo e subirão automaticamente para cá e para o Acervo assim que outra camarada também os marcar!
          </p>
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
            <span>Sugerir Trecho / Grifar ★</span>
          </button>
        </div>
      </form>

      {/* Controles de Filtragem e Busca de Consensos */}
      {consensusQuotes.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3.5 pb-2.5 border-b border-theme-border/50">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-[11px] font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-theme-red text-white border-theme-border font-black shadow-xs'
                  : 'bg-theme-card text-theme-muted hover:text-theme-primary border-theme-border/40'
              }`}
            >
              Todos os Consensos ({consensusQuotes.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('my')}
              className={`px-3 py-1 text-[11px] font-mono font-bold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                filterType === 'my'
                  ? 'bg-theme-red text-white border-theme-border font-black shadow-xs'
                  : 'bg-theme-card text-theme-muted hover:text-theme-primary border-theme-border/40'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Minha Participação ({myConsensusCount})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-48">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar trecho ou pág..."
              className="w-full text-xs bg-theme-input border border-theme-border rounded-lg pl-7 pr-2.5 py-1 text-theme-primary placeholder:text-theme-muted focus:outline-none"
            />
            <Search className="w-3 h-3 text-theme-muted absolute left-2 top-2" />
          </div>
        </div>
      )}

      {/* Lista de Consensos do Comitê OU Empty State Estrito */}
      {consensusQuotes.length === 0 ? (
        <div className="p-6 sm:p-8 text-center bg-theme-card rounded-xl border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] flex flex-col items-center">
          <div className="w-full flex items-center justify-center gap-2.5 sm:gap-4 my-2">
            <ComradeCat 
              pose="reading" 
              size="md" 
              showBubble={true} 
              customQuote="Camaradas, quando 2 de vocês grifarem a mesma passagem, ela brilhará aqui no Mural!" 
              bubblePosition="right" 
            />
          </div>
          <h4 className="font-headline font-black text-lg text-theme-primary mb-1 mt-3">
            Nenhum Consenso do Comitê no Mural ainda!
          </h4>
          <p className="text-xs text-theme-muted font-reading max-w-md mx-auto italic leading-relaxed">
            O Mural exibe exclusivamente os consensos revolucionários (trechos grifados por 2 ou mais camaradas). Destaques individuais ficam guardados no Dossiê Coletivo ou na visão pessoal.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-[#FEF08A] px-3.5 py-1.5 rounded-lg border-2 border-theme-border text-xs font-mono font-bold text-[#111111] shadow-[2px_2px_0px_var(--shadow-color)]">
            <span className="text-theme-red">★</span>
            <span>Grife trechos no Dossiê Coletivo abaixo para formar consensos!</span>
          </div>
        </div>
      ) : displayedQuotes.length === 0 ? (
        <div className="p-6 text-center bg-theme-card rounded-xl border-2 border-theme-border text-theme-muted text-xs font-reading">
          Nenhum consenso encontrado com o filtro atual. Tente alterar o filtro ou limpar o campo de busca.
        </div>
      ) : (
        /* Container Rolável de Cards de Consenso */
        <div className="max-h-[580px] sm:max-h-[660px] overflow-y-auto pr-1 sm:pr-2 space-y-4 custom-scrollbar">
          {displayedQuotes.map((quote) => {
            const highlighters = Array.isArray(quote.highlightedBy) ? quote.highlightedBy : [];
            const isParticipant = highlighters.some(m => m.id === activeMember.id);
            const isEditing = editingId === quote.id;
            const isLiked = (quote.likedBy || quote.likes || []).includes(activeMember.id);
            const likesCount = (quote.likedBy || quote.likes || []).length;

            const likerIds = quote.likedBy || quote.likes || [];
            const likerMembers = likerIds.map(id => members.find(m => m.id === id)).filter(Boolean);

            const namesList = highlighters.map(m => m.name.split(' ')[0]).join(' & ');

            return (
              <div
                key={quote.id}
                className="p-4 sm:p-5 rounded-xl border-2 border-theme-border transition-all bg-gradient-to-br from-theme-card via-theme-card to-amber-500/5 shadow-[4px_4px_0px_var(--shadow-color)]"
              >
                {/* Topo do Card: Avatares Coletivos, Selos e Ações */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    {/* Avatares sobrepostos dos camaradas que atingiram o consenso */}
                    <div className="flex items-center -space-x-2 shrink-0">
                      {highlighters.map((m, idx) => (
                        <img
                          key={m.id || idx}
                          src={m.avatar}
                          alt={m.name}
                          title={m.name}
                          className="w-8 h-8 rounded-full object-cover border-2 border-theme-border bg-theme-card shadow-xs"
                        />
                      ))}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-headline font-black text-theme-primary">
                          Consenso: {namesList || 'Comitê'}
                        </span>
                        {isParticipant && (
                          <span className="text-[9px] font-mono bg-theme-red text-white font-bold px-1.5 py-0.2 rounded border border-theme-border">
                            Você participou
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-theme-muted font-mono block">
                        {highlighters.length} camaradas grifaram • {quote.date || 'Hoje'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Badge de Consenso Revolucionário */}
                    <span 
                      title="Passagem classificada como Consenso do Comitê por múltiplos membros"
                      className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 text-yellow-950 border border-yellow-600 shadow-[1px_1px_0px_rgba(0,0,0,0.2)] flex items-center gap-1"
                    >
                      <Flame className="w-3 h-3 text-theme-red fill-current" />
                      <span>★ CONSENSO DO COMITÊ</span>
                    </span>

                    {quote.page && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-theme-container text-theme-red border border-theme-border">
                        {quote.page}
                      </span>
                    )}

                    {/* Botão de Tarja Confidencial */}
                    <button
                      type="button"
                      onClick={() => toggleQuoteSpoiler(quote.id)}
                      title={quote.isSpoiler ? "Desativar Tarja Confidencial deste trecho" : "Ativar Tarja Confidencial (Anti-Spoiler)"}
                      className={`p-1.5 border border-theme-border rounded transition-all flex items-center gap-1 text-[10px] font-mono font-bold cursor-pointer ${
                        quote.isSpoiler
                          ? 'bg-theme-red text-white shadow-xs'
                          : 'bg-theme-container text-theme-muted hover:text-theme-primary'
                      }`}
                    >
                      {quote.isSpoiler ? <EyeOff className="w-3 h-3 text-[#FEF08A]" /> : <Lock className="w-3 h-3 text-theme-red" />}
                      <span className="hidden sm:inline">{quote.isSpoiler ? 'Confidencial' : 'Tarja'}</span>
                    </button>

                    {/* Ações para integrantes do consenso */}
                    {isParticipant && !isEditing && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(quote)}
                          title="Editar passagem"
                          className="p-1 hover:bg-[#FEF08A] hover:text-[#111111] text-theme-primary border border-theme-border rounded transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(quote.id)}
                          title="Remover meu grifo deste consenso"
                          className="p-1 hover:bg-theme-red hover:text-white text-theme-red border border-theme-border rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
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
                      <div className="text-xs sm:text-sm text-theme-secondary leading-relaxed font-reading italic pl-3 border-l-4 border-theme-red bg-theme-container/50 p-2.5 rounded-r-lg my-2 whitespace-pre-line">
                        "{formatTextWithBold(quote.text)}"
                      </div>
                    </ConfidentialSpoiler>

                    {/* Notas pessoais adicionadas pelas camaradas neste trecho */}
                    {highlighters.some(m => m.note) && (
                      <div className="mt-2.5 space-y-1.5">
                        {highlighters.filter(m => m.note).map((m, idx) => (
                          <div 
                            key={idx} 
                            className="text-[11px] font-reading bg-theme-container/80 p-2 rounded-lg border border-theme-border/60 flex items-start gap-2"
                          >
                            <img
                              src={m.avatar}
                              alt={m.name}
                              className="w-4 h-4 rounded-full object-cover shrink-0 mt-0.5"
                            />
                            <div>
                              <span className="font-headline font-bold text-theme-primary mr-1">
                                {m.name}:
                              </span>
                              <span className="text-theme-secondary italic">
                                "{m.note}"
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Barra Inferior: Quem curtiu + Botão de Curtida */}
                    <div className="flex items-center justify-between gap-2 pt-2.5 mt-2 border-t border-theme-border/40">
                      {/* Avatares dos membros que curtiram */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        {likerMembers.length > 0 ? (
                          <div className="flex items-center gap-1.5 min-w-0">
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
                        title={isLiked ? "Descurtir passagem" : "Curtir passagem"}
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
