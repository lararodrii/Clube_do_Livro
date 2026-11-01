import React, { useState, useRef, useMemo } from 'react';
import { useClub } from '../../context/ClubContext';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, 
  Highlighter, 
  Sparkles, 
  Upload, 
  Plus, 
  Download, 
  Flame, 
  Search, 
  Filter, 
  MessageSquare, 
  Lock, 
  Unlock, 
  Trash2, 
  Send, 
  BookOpen, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import ComradeCat from '../common/ComradeCat';
import ConfidentialSpoiler from '../common/ConfidentialSpoiler';
import ReviewHighlightsModal from './ReviewHighlightsModal';
import ManualHighlightModal from './ManualHighlightModal';
import { extractHighlightsFromFile } from '../../services/pdfHighlightExtractor';
import { openPrintableDossier } from '../../utils/dossierPrintReport';
import { formatTextWithBold } from '../../utils/textFormat';

export default function CollectiveHighlights({ isArchiveView = false, customHighlights = null, archivedBook = null }) {
  const { 
    highlights: liveHighlights = [], 
    addHighlightsToDossier, 
    addManualHighlight, 
    toggleHighlightSpoiler, 
    deleteHighlight, 
    addHighlightComment, 
    deleteHighlightComment,
    currentReading,
    members = [],
    activeMember,
    meeting,
    showToast
  } = useClub();

  const { isAuthenticated, openAuthModal } = useAuth();

  // Se estiver visualizando pelo acervo, usa os grifos passados por prop
  const highlights = customHighlights || liveHighlights;
  const bookInfo = archivedBook || currentReading || { title: 'Leitura Atual', author: 'Clube do Livro' };

  // Estados locais para arquivos e modais
  const fileInputRef = useRef(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progressInfo, setProgressInfo] = useState({ current: 0, total: 100, message: '' });
  const [extractedItems, setExtractedItems] = useState([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);

  // Estados de Filtros e Busca
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'consensus' | 'member'
  const [selectedMemberFilter, setSelectedMemberFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('page_asc'); // 'page_asc' | 'page_desc' | 'popular'

  // Estados de expansão de comentários por grifo
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  // Manipulador de upload de arquivo (.pdf, .txt, .html)
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAuthenticated) {
      openAuthModal('Faça login com sua conta para subir seus grifos e participar do dossiê!', 'login');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsExtracting(true);
    setProgressInfo({ current: 0, total: 100, message: `Iniciando análise de ${file.name}...` });
    setIsReviewOpen(true);

    try {
      const results = await extractHighlightsFromFile(file, (progress) => {
        setProgressInfo({
          current: progress.current || 0,
          total: progress.total || 100,
          message: progress.message || 'Processando documento...'
        });
      }, {
        currentBookTitle: bookInfo?.title,
        currentBookAuthor: bookInfo?.author
      });

      if (!results || results.length === 0) {
        showToast('Nenhum grifo detectado neste arquivo. Verifique se o documento possui marcações visuais ou exportação compatível.', 'warning');
      }

      setExtractedItems(results || []);
    } catch (err) {
      console.error('Erro na extração de grifos:', err);
      showToast(`Erro ao ler arquivo: ${err.message || 'Falha no processamento.'}`, 'error');
      setIsReviewOpen(false);
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Confirmar publicação dos grifos revisados
  const handleConfirmPublish = async (toPublish) => {
    if (!toPublish || toPublish.length === 0) return;

    try {
      await addHighlightsToDossier(toPublish);
      showToast(`${toPublish.length} grifos sincronizados com o Dossiê Coletivo com sucesso! ★`, 'success');
    } catch (err) {
      console.error('Erro ao salvar grifos:', err);
      showToast('Falha ao sincronizar com o Firestore. Tente novamente.', 'error');
    }
  };

  // Enviar grifo manual
  const handleManualSubmit = async (data) => {
    try {
      await addManualHighlight(data);
      showToast('Grifo manual catalogado com sucesso!', 'success');
      setIsManualOpen(false);
    } catch (err) {
      console.error('Erro ao adicionar grifo manual:', err);
      showToast('Falha ao adicionar grifo.', 'error');
    }
  };

  // Abertura do relatório limpo de impressão
  const handleExportReport = () => {
    if (highlights.length === 0) {
      showToast('Ainda não existem grifos para gerar o relatório da assembleia.', 'info');
      return;
    }
    openPrintableDossier({
      bookTitle: bookInfo.title,
      bookAuthor: bookInfo.author,
      highlights,
      meetingDate: meeting?.date
    });
  };

  // Alternar spoiler do grifo
  const handleToggleSpoiler = (id) => {
    if (!isAuthenticated) {
      openAuthModal('Faça login para alterar a confidencialidade do trecho.', 'login');
      return;
    }
    toggleHighlightSpoiler(id);
  };

  // Excluir grifo
  const handleDeleteHighlight = (id) => {
    if (!isAuthenticated) {
      openAuthModal('Faça login para gerenciar grifos.', 'login');
      return;
    }
    if (window.confirm('Deseja realmente remover este grifo do Dossiê Coletivo?')) {
      deleteHighlight(id);
      showToast('Grifo removido do dossiê.', 'info');
    }
  };

  // Alternar comentários expandidos
  const toggleComments = (id) => {
    setExpandedComments(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Adicionar comentário ao grifo
  const handleAddComment = (id) => {
    if (!isAuthenticated) {
      openAuthModal('Faça login para comentar e debater este grifo.', 'login');
      return;
    }
    const text = (commentInputs[id] || '').trim();
    if (!text) return;

    addHighlightComment(id, text);
    setCommentInputs(prev => ({ ...prev, [id]: '' }));
    showToast('Anotação adicionada ao debate!', 'success');
  };

  // Grifos filtrados e ordenados
  const filteredHighlights = useMemo(() => {
    let list = [...highlights];

    // Filtro por categoria
    if (activeFilter === 'consensus') {
      list = list.filter(h => h.isConsensus);
    } else if (activeFilter === 'member' && selectedMemberFilter) {
      list = list.filter(h => 
        Array.isArray(h.highlightedBy) && h.highlightedBy.some(m => m.id === selectedMemberFilter)
      );
    }

    // Filtro por texto de busca ou página
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(h => {
        const textMatch = (h.text || '').toLowerCase().includes(q);
        const pageMatch = String(h.page || '').includes(q);
        const memberMatch = Array.isArray(h.highlightedBy) && h.highlightedBy.some(m => 
          (m.name || '').toLowerCase().includes(q) || (m.note || '').toLowerCase().includes(q)
        );
        return textMatch || pageMatch || memberMatch;
      });
    }

    // Ordenação
    list.sort((a, b) => {
      if (sortOrder === 'popular') {
        const aCount = a.highlightedBy?.length || 1;
        const bCount = b.highlightedBy?.length || 1;
        if (bCount !== aCount) return bCount - aCount;
        return (parseInt(a.page, 10) || 0) - (parseInt(b.page, 10) || 0);
      }
      if (sortOrder === 'page_desc') {
        return (parseInt(b.page, 10) || 0) - (parseInt(a.page, 10) || 0);
      }
      // Padrão: page_asc
      return (parseInt(a.page, 10) || 0) - (parseInt(b.page, 10) || 0);
    });

    return list;
  }, [highlights, activeFilter, selectedMemberFilter, searchQuery, sortOrder]);

  const consensusCount = highlights.filter(h => h.isConsensus).length;

  return (
    <section className="bg-theme-card rounded-2xl border-4 border-theme-border p-4 sm:p-6 md:p-8 shadow-[6px_6px_0px_var(--shadow-color)] relative transition-all duration-300">
      
      {/* Input oculto para carregar PDF / TXT / HTML */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.html,.htm"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header do Dossiê */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b-2 border-theme-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded bg-theme-red text-white border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#FEF08A]" />
              <span>Inteligência Coletiva</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-theme-primary bg-theme-container px-2.5 py-1 rounded border-2 border-theme-border">
              {highlights.length} {highlights.length === 1 ? 'trecho catalogado' : 'trechos catalogados'}
            </span>
            {consensusCount > 0 && (
              <span className="text-[11px] font-mono font-black text-yellow-950 bg-gradient-to-r from-yellow-300 to-amber-300 px-2.5 py-1 rounded border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-theme-red fill-current" />
                <span>{consensusCount} {consensusCount === 1 ? 'Consenso' : 'Consensos'}</span>
              </span>
            )}
          </div>

          <h3 className="font-headline font-black text-2xl sm:text-3xl text-theme-primary tracking-tight flex items-center gap-2">
            <span>Dossiê Coletivo de Grifos</span>
            <span className="text-theme-red">★</span>
          </h3>

          <p className="text-xs sm:text-sm text-theme-secondary font-reading max-w-2xl leading-relaxed">
            Suba seu PDF com anotações (nativas ou tablets como StarNote), caderno Kindle ou digite manualmente. 
            O algoritmo cruza os trechos de todas as camaradas e destaca automaticamente onde houve <strong className="text-theme-red font-bold">consenso de leitura</strong>!
          </p>
        </div>

        {/* Botões de Ação Principais */}
        {!isArchiveView && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 bg-theme-red hover:brightness-110 active:scale-95 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] transition-all cursor-pointer"
              title="Subir arquivo PDF, Kindle TXT ou HTML"
            >
              <Upload className="w-4 h-4 text-[#FEF08A]" />
              <span>Subir Meu PDF / Kindle</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal('Faça login para adicionar um grifo manual.', 'login');
                  return;
                }
                setIsManualOpen(true);
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-theme-container hover:bg-theme-card text-theme-primary font-mono font-bold text-xs rounded-xl border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] transition-colors cursor-pointer"
              title="Adicionar citação ou grifo de livro físico manualmente"
            >
              <Plus className="w-4 h-4 text-theme-red" />
              <span>Digitar Manualmente</span>
            </button>

            <button
              type="button"
              onClick={handleExportReport}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-theme-gold/20 hover:bg-theme-gold/30 text-theme-primary font-mono font-bold text-xs rounded-xl border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] transition-colors cursor-pointer"
              title="Gerar PDF / Relatório formatado para a reunião do clube"
            >
              <Download className="w-4 h-4 text-theme-red" />
              <span className="hidden sm:inline">Baixar Relatório</span>
            </button>
          </div>
        )}

        {isArchiveView && (
          <button
            type="button"
            onClick={handleExportReport}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-theme-gold/20 hover:bg-theme-gold/30 text-theme-primary font-mono font-bold text-xs rounded-xl border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] transition-colors cursor-pointer"
            title="Gerar PDF / Relatório formatado da assembleia deste livro"
          >
            <Download className="w-4 h-4 text-theme-red" />
            <span>Baixar Dossiê em PDF</span>
          </button>
        )}
      </div>

      {/* Barra de Filtros, Ordenação e Pesquisa */}
      <div className="my-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Abas de Filtro Rápido */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          <button
            type="button"
            onClick={() => { setActiveFilter('all'); setSelectedMemberFilter(''); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all border-2 border-theme-border ${
              activeFilter === 'all'
                ? 'bg-theme-primary text-theme-inverted shadow-[2px_2px_0px_var(--shadow-color)]'
                : 'bg-theme-container text-theme-secondary hover:text-theme-primary'
            }`}
          >
            Todos os Grifos ({highlights.length})
          </button>

          <button
            type="button"
            onClick={() => { setActiveFilter('consensus'); setSelectedMemberFilter(''); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-black whitespace-nowrap transition-all border-2 border-theme-border flex items-center gap-1.5 ${
              activeFilter === 'consensus'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-yellow-950 shadow-[2px_2px_0px_var(--shadow-color)]'
                : 'bg-theme-container text-theme-secondary hover:text-theme-primary'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-theme-red fill-current" />
            <span>Consenso do Comitê ({consensusCount})</span>
          </button>

          {/* Filtro por Camarada */}
          <div className="relative">
            <select
              value={selectedMemberFilter}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedMemberFilter(val);
                setActiveFilter(val ? 'member' : 'all');
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-theme-container text-theme-primary border-2 border-theme-border cursor-pointer focus:outline-none focus:ring-1 focus:ring-theme-red"
            >
              <option value="">Por Camarada...</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Busca e Ordenação */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-theme-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar página ou texto..."
              className="w-full pl-8 pr-3 py-1.5 bg-theme-input text-theme-primary text-xs font-reading rounded-lg border-2 border-theme-border placeholder:text-theme-muted focus:outline-none focus:ring-1 focus:ring-theme-red"
            />
          </div>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-theme-container text-theme-primary border-2 border-theme-border cursor-pointer focus:outline-none"
            title="Critério de ordenação dos grifos"
          >
            <option value="page_asc">Pág: Menor → Maior</option>
            <option value="page_desc">Pág: Maior → Menor</option>
            <option value="popular">Mais Grifados (Consenso)</option>
          </select>
        </div>
      </div>

      {/* Lista de Grifos */}
      {filteredHighlights.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-theme-container rounded-2xl border-2 border-dashed border-theme-border/60 my-4 flex flex-col items-center">
          <ComradeCat 
            pose="reading" 
            size="md" 
            showBubble={false}
            className="mb-4"
          />
          <h4 className="font-headline font-black text-lg text-theme-primary mb-1">
            {searchQuery || activeFilter !== 'all' 
              ? 'Nenhum grifo corresponde aos filtros selecionados' 
              : 'O Dossiê Coletivo ainda aguarda os primeiros grifos!'}
          </h4>
          <p className="text-xs sm:text-sm text-theme-secondary font-reading max-w-md mx-auto mb-5 leading-relaxed">
            {searchQuery || activeFilter !== 'all'
              ? 'Tente limpar a pesquisa ou selecionar "Todos os Grifos" para ver as passagens catalogadas.'
              : 'Suba o PDF que você leu no computador ou tablet (StarNote, Samsung Notes), seu My Clippings do Kindle ou digite manualmente suas passagens prediletas.'}
          </p>

          {!isArchiveView && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-theme-red text-white font-mono font-bold text-xs rounded-xl border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] hover:brightness-110 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#FEF08A]" />
                <span>Subir Arquivo PDF / Kindle</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    openAuthModal('Faça login para adicionar um grifo.', 'login');
                    return;
                  }
                  setIsManualOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-theme-card text-theme-primary font-mono font-bold text-xs rounded-xl border-2 border-theme-border hover:bg-theme-container cursor-pointer"
              >
                <Plus className="w-4 h-4 text-theme-red" />
                <span>Adicionar Trecho Manualmente</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 my-4">
          {filteredHighlights.map((hl) => {
            const highlighters = Array.isArray(hl.highlightedBy) ? hl.highlightedBy : [];
            const isMyHighlight = highlighters.some(m => m.id === activeMember.id);
            const commentsCount = hl.comments?.length || 0;
            const isCommentsOpen = !!expandedComments[hl.id];

            // Cores do marca-texto
            const colorBg = hl.color?.bgClass || 'bg-yellow-200/50 border-yellow-400 text-yellow-950';

            return (
              <div
                key={hl.id}
                className={`flex flex-col justify-between rounded-xl border-2 border-theme-border p-4 transition-all duration-200 bg-theme-card shadow-[4px_4px_0px_var(--shadow-color)] ${
                  hl.isConsensus 
                    ? 'ring-2 ring-yellow-400/80 bg-gradient-to-br from-theme-card via-theme-card to-amber-500/5' 
                    : ''
                }`}
              >
                <div>
                  {/* Topo do Card: Página, Selo de Consenso e Ações */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-mono font-black px-2.5 py-0.5 rounded bg-theme-container text-theme-red border border-theme-border shadow-[1px_1px_0px_var(--shadow-color)]">
                        Pág. {hl.page || '—'}
                      </span>

                      {hl.isConsensus && (
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 text-yellow-950 border border-yellow-600 shadow-[1px_1px_0px_rgba(0,0,0,0.2)] flex items-center gap-1 animate-pulse">
                          <Flame className="w-3 h-3 text-theme-red fill-current" />
                          <span>★ CONSENSO REVOLUCIONÁRIO</span>
                        </span>
                      )}
                    </div>

                    {/* Botões de Ação do Card */}
                    <div className="flex items-center gap-1">
                      {/* Alternar Spoiler */}
                      <button
                        type="button"
                        onClick={() => handleToggleSpoiler(hl.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          hl.isSpoiler
                            ? 'bg-theme-red/10 border-theme-red text-theme-red'
                            : 'bg-theme-container border-theme-border text-theme-muted hover:text-theme-primary'
                        }`}
                        title={hl.isSpoiler ? 'Trecho marcado como confidencial (spoiler)' : 'Marcar como spoiler'}
                      >
                        {hl.isSpoiler ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>

                      {/* Excluir se o usuário for um dos donos */}
                      {(isMyHighlight || isAuthenticated) && !isArchiveView && (
                        <button
                          type="button"
                          onClick={() => handleDeleteHighlight(hl.id)}
                          className="p-1.5 rounded-lg border border-theme-border bg-theme-container text-theme-muted hover:text-theme-red hover:border-theme-red transition-colors"
                          title="Remover este grifo do dossiê"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Trecho Grifado (Efeito Realista de Marca-Texto) */}
                  <div className="relative my-2">
                    <ConfidentialSpoiler isSpoiler={hl.isSpoiler}>
                      <div className="relative p-3.5 rounded-lg border-l-4 border-theme-red bg-theme-container/60">
                        {/* Marca-texto estilizado ao redor das palavras */}
                        <p className={`font-reading text-xs sm:text-sm leading-relaxed text-theme-primary px-2 py-1 rounded inline ${colorBg}`}>
                          "{formatTextWithBold(hl.text)}"
                        </p>
                      </div>
                    </ConfidentialSpoiler>
                  </div>

                  {/* Notas pessoais das camaradas ao grifar este trecho */}
                  {highlighters.some(m => m.note) && (
                    <div className="mt-2 space-y-1.5">
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
                </div>

                {/* Rodapé do Card: Avatares das Camaradas & Botão de Debate */}
                <div className="mt-4 pt-3 border-t border-theme-border/40 flex items-center justify-between gap-2">
                  {/* Avatares dos membros que grifaram */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center -space-x-2 shrink-0">
                      {highlighters.map((m, idx) => (
                        <img
                          key={m.id || idx}
                          src={m.avatar}
                          alt={m.name}
                          title={`Grifado por ${m.name}`}
                          className="w-6 h-6 rounded-full object-cover border-2 border-theme-border bg-theme-card"
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-theme-muted truncate">
                      {highlighters.length === 1 
                        ? highlighters[0]?.name 
                        : `${highlighters.length} camaradas grifaram`}
                    </span>
                  </div>

                  {/* Botão de Debate / Anotação Coletiva */}
                  <button
                    type="button"
                    onClick={() => toggleComments(hl.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-theme-container hover:bg-theme-card text-theme-primary border border-theme-border transition-colors cursor-pointer shrink-0"
                    title="Abrir anotações e debate sobre esta passagem"
                  >
                    <MessageSquare className="w-3 h-3 text-theme-red" />
                    <span>Debate ({commentsCount})</span>
                    {isCommentsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Área Expansível de Debate Coletivo */}
                {isCommentsOpen && (
                  <div className="mt-3 pt-3 border-t-2 border-theme-border/60 space-y-2.5 animate-fade-in">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-theme-muted flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-theme-red" />
                      <span>Debate Coletivo sobre este Trecho</span>
                    </div>

                    {/* Lista de Comentários */}
                    {commentsCount === 0 ? (
                      <p className="text-[11px] font-reading italic text-theme-muted py-1">
                        Nenhum comentário ainda. Abra o debate sobre a importância desta passagem para a assembleia!
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                        {hl.comments.map((c) => {
                          const isAuthor = c.memberId === activeMember.id;
                          return (
                            <div 
                              key={c.id} 
                              className="p-2 rounded-lg bg-theme-container border border-theme-border/60 text-xs flex items-start justify-between gap-2"
                            >
                              <div className="flex items-start gap-2">
                                <img
                                  src={c.memberAvatar}
                                  alt={c.memberName}
                                  className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5 border border-theme-border"
                                />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-headline font-bold text-theme-primary text-[11px]">
                                      {c.memberName}
                                    </span>
                                    <span className="text-[9.5px] font-mono text-theme-muted">
                                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-BR') : ''}
                                    </span>
                                  </div>
                                  <p className="text-theme-secondary font-reading mt-0.5 leading-relaxed">
                                    {c.text}
                                  </p>
                                </div>
                              </div>

                              {isAuthor && (
                                <button
                                  type="button"
                                  onClick={() => deleteHighlightComment(hl.id, c.id)}
                                  className="text-theme-muted hover:text-theme-red p-1 rounded transition-colors shrink-0"
                                  title="Excluir meu comentário"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Formulário para Inserir Comentário */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        value={commentInputs[hl.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [hl.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(hl.id);
                        }}
                        placeholder="Comente este grifo para a reunião..."
                        className="flex-1 px-2.5 py-1.5 bg-theme-input text-theme-primary text-xs font-reading rounded-lg border border-theme-border placeholder:text-theme-muted focus:outline-none focus:ring-1 focus:ring-theme-red"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(hl.id)}
                        className="p-1.5 bg-theme-red hover:brightness-110 text-white rounded-lg border border-theme-border transition-transform active:scale-95 cursor-pointer"
                        title="Publicar anotação coletiva"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Revisão dos Grifos Extraídos do PDF / Kindle */}
      <ReviewHighlightsModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        extractedHighlights={extractedItems}
        isProcessing={isExtracting}
        progressInfo={progressInfo}
        onConfirmPublish={handleConfirmPublish}
        bookTitle={bookInfo.title}
      />

      {/* Modal de Adição Manual de Grifo */}
      <ManualHighlightModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        onSubmit={handleManualSubmit}
        bookTitle={bookInfo.title}
      />

    </section>
  );
}
