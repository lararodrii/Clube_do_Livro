import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  CheckSquare, 
  Square, 
  Sparkles, 
  FileText, 
  BookOpen, 
  Pencil, 
  Trash2, 
  Loader2,
  Lock
} from 'lucide-react';
import ComradeCat from '../common/ComradeCat';

export default function ReviewHighlightsModal({
  isOpen,
  onClose,
  extractedHighlights = [],
  isProcessing = false,
  progressInfo = { current: 0, total: 100, message: '' },
  onConfirmPublish,
  bookTitle = 'Leitura Atual'
}) {
  const [selectedItems, setSelectedItems] = useState({});
  const [editedItems, setEditedItems] = useState([]);

  useEffect(() => {
    if (extractedHighlights) {
      setEditedItems(extractedHighlights.map(h => ({ ...h })));
      // Por padrão seleciona todos os grifos encontrados
      const initialSelection = {};
      extractedHighlights.forEach(h => {
        initialSelection[h.id] = h.source !== 'pdf_verified_scan' && !!h.text?.trim();
      });
      setSelectedItems(initialSelection);
    }
  }, [extractedHighlights]);

  if (!isOpen) return null;

  const toggleSelect = (id) => {
    setSelectedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleSelectAll = () => {
    const allSelected = editedItems.every(h => selectedItems[h.id]);
    const newSelection = {};
    editedItems.forEach(h => {
      newSelection[h.id] = !allSelected;
    });
    setSelectedItems(newSelection);
  };

  const handleTextChange = (id, newText) => {
    setEditedItems(prev => prev.map(h => h.id === id ? { ...h, text: newText } : h));
  };

  const handlePageChange = (id, newPage) => {
    setEditedItems(prev => prev.map(h => h.id === id ? { ...h, page: newPage } : h));
  };

  const handleNoteChange = (id, newNote) => {
    setEditedItems(prev => prev.map(h => h.id === id ? { ...h, note: newNote } : h));
  };

  const handleRemove = (id) => {
    setEditedItems(prev => prev.filter(h => h.id !== id));
    setSelectedItems(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleConfirm = () => {
    const toPublish = editedItems.filter(h => selectedItems[h.id] && h.text.trim());
    if (toPublish.length === 0) return;
    onConfirmPublish(toPublish);
    onClose();
  };

  const selectedCount = editedItems.filter(h => selectedItems[h.id]).length;
  const progressPercent = progressInfo.total > 0 
    ? Math.min(100, Math.round((progressInfo.current / progressInfo.total) * 100))
    : 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative bg-theme-container text-theme-primary rounded-2xl w-[95vw] max-w-3xl max-h-[90vh] flex flex-col border-2 border-theme-border shadow-[8px_8px_0px_var(--shadow-color)] my-4 overflow-hidden animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 bg-theme-card border-b-2 border-theme-border flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-theme-red text-white flex items-center justify-center border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)]">
              <FileText className="w-5 h-5 text-[#FEF08A]" />
            </div>
            <div>
              <h3 className="font-headline font-black text-base sm:text-lg text-theme-primary leading-tight flex items-center gap-1.5">
                <span>Scanner de Grifos & Dossiê</span>
                <span className="text-theme-red">★</span>
              </h3>
              <p className="text-[11px] font-mono text-theme-muted font-bold truncate max-w-[240px] sm:max-w-md">
                Livro: "{bookTitle}"
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-theme-container border border-theme-border/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          {/* Estado de Processamento em Andamento */}
          {isProcessing ? (
            <div className="py-12 px-4 text-center space-y-5">
              <div className="w-16 h-16 mx-auto animate-bounce">
                <ComradeCat pose="reading" size="md" showBubble={false} />
              </div>

              <div>
                <h4 className="font-headline font-black text-lg text-theme-primary mb-1 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 text-theme-red animate-spin" />
                  <span>Analisando Arquivo de Leitura...</span>
                </h4>
                <p className="text-xs font-mono text-theme-muted">
                  {progressInfo.message || 'Mapeando anotações e varrendo marca-texto com scanner canvas...'}
                </p>
              </div>

              {/* Barra de Progresso */}
              <div className="max-w-md mx-auto">
                <div className="w-full bg-theme-card border-2 border-theme-border rounded-full h-4 overflow-hidden p-0.5 shadow-inner">
                  <div 
                    className="bg-theme-red h-full rounded-full transition-all duration-300 relative overflow-hidden"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                </div>
                <div className="flex justify-between text-[10px] font-mono font-bold text-theme-muted mt-1 px-1">
                  <span>Página {progressInfo.current} de {progressInfo.total || '?'}</span>
                  <span>{progressPercent}%</span>
                </div>
              </div>
            </div>
          ) : editedItems.length === 0 ? (
            /* Nenhum grifo encontrado */
            <div className="py-10 px-4 text-center">
              <div className="w-14 h-14 mx-auto mb-3 opacity-80">
                <ComradeCat pose="grumpy" size="md" showBubble={false} />
              </div>
              <h4 className="font-headline font-black text-base text-theme-primary mb-1">
                Nenhum grifo detectado neste arquivo
              </h4>
              <p className="text-xs font-reading text-theme-muted max-w-sm mx-auto italic mb-4">
                O arquivo enviado não possui anotações nativas nem marcas de cor identificadas pelo scanner.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-theme-red text-white text-xs font-mono font-bold rounded-lg border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)]"
              >
                Voltar e Tentar Outro Arquivo
              </button>
            </div>
          ) : (
            /* Lista de Grifos para Revisão */
            <>
              {/* Barra de Informação e Ações Rápidas */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-theme-card rounded-xl border-2 border-theme-border shadow-xs">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-theme-primary">
                  <span className="text-theme-red font-black text-sm">★</span>
                  <span>{editedItems.length} resultados para revisão (anotações e candidatos visuais). Candidatos visuais não são comentários confirmados:</span>
                </div>

                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg border border-theme-border bg-theme-container hover:bg-theme-gold/20 text-theme-primary flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {selectedCount === editedItems.length ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5 text-theme-red" />
                      <span>Desmarcar Todos</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5 text-theme-muted" />
                      <span>Selecionar Todos</span>
                    </>
                  )}
                </button>
              </div>

              {/* Feed de Itens Extraídos */}
              <div className="space-y-3.5">
                {editedItems.map((item, idx) => {
                  const isChecked = !!selectedItems[item.id];

                  return (
                    <div
                      key={item.id || idx}
                      className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all ${
                        isChecked
                          ? 'bg-theme-card border-theme-border shadow-[3px_3px_0px_var(--shadow-color)]'
                          : 'bg-theme-container/60 border-theme-border/40 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox de Inclusão */}
                        <button
                          type="button"
                          onClick={() => toggleSelect(item.id)}
                          className="mt-1 shrink-0 cursor-pointer"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-theme-red" />
                          ) : (
                            <Square className="w-5 h-5 text-theme-muted hover:text-theme-primary" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Cabeçalho do Grifo */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold text-theme-muted">
                                Página:
                              </span>
                              <input
                                type="text"
                                value={item.page || ''}
                                onChange={(e) => handlePageChange(item.id, e.target.value)}
                                placeholder="Pág."
                                className="w-16 px-2 py-0.5 text-xs font-mono font-black bg-theme-container border border-theme-border rounded text-theme-primary"
                              />

                              <span 
                                className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded border border-theme-border shadow-xs"
                                style={{ backgroundColor: item.color?.hex ? `${item.color.hex}40` : '#FDE04740' }}
                              >
                                {item.color?.name || 'Marca-texto'}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemove(item.id)}
                              title="Remover este grifo da lista"
                              className="text-theme-muted hover:text-theme-red p-1 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Trecho Grifado Editável */}
                          <textarea
                            rows={2}
                            value={item.text}
                            onChange={(e) => handleTextChange(item.id, e.target.value)}
                            className="w-full text-xs sm:text-sm font-reading italic leading-relaxed p-2.5 rounded-lg border-2 border-theme-border/60 bg-theme-input text-theme-primary focus:outline-none focus:border-theme-red shadow-inner"
                          />

                          {/* Campo de Nota Pessoal / Observação Crítica */}
                          <input
                            type="text"
                            value={item.note || ''}
                            onChange={(e) => handleNoteChange(item.id, e.target.value)}
                            placeholder="Adicionar nota pessoal de debate (opcional)..."
                            className="w-full text-xs font-mono bg-theme-container border border-theme-border/60 rounded px-2.5 py-1.5 text-theme-secondary placeholder:text-theme-muted focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Rodapé com Botão de Confirmação */}
        {!isProcessing && editedItems.length > 0 && (
          <div className="p-3.5 sm:p-4 bg-theme-card border-t-2 border-theme-border flex items-center justify-between gap-3 shrink-0">
            <span className="text-xs font-mono font-bold text-theme-muted">
              {selectedCount} de {editedItems.length} selecionados
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-mono font-bold text-theme-muted hover:text-theme-primary rounded-lg border border-theme-border hover:bg-theme-container transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={selectedCount === 0}
                className="px-5 py-2.5 bg-theme-red hover:opacity-90 disabled:opacity-50 text-white text-xs font-mono font-black uppercase tracking-wider rounded-lg border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#FEF08A]" />
                <span>Publicar no Dossiê do Comitê ({selectedCount}) ★</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
