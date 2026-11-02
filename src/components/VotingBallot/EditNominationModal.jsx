import React, { useState, useEffect, useRef } from 'react';
import { useClub } from '../../context/ClubContext';
import BookAutocomplete from '../common/BookAutocomplete';
import { X, Save, Trash2, AlertCircle, Upload, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { findDuplicateBookInBallot, isCurrentReadingBook } from '../../utils/bookDuplicateCheck';

export default function EditNominationModal({ book, isOpen, onClose }) {
  const { updateNomination, deleteNomination, ballot, currentReading, showToast } = useClub();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pages, setPages] = useState('');
  const [genre, setGenre] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [nominationReason, setNominationReason] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (book && isOpen) {
      setTitle(book.title || '');
      setAuthor(book.author || '');
      setPages(book.pages || '');
      setGenre(book.genre || '');
      setCoverUrl(book.coverUrl || '');
      setSynopsis(book.synopsis || '');
      setNominationReason(book.nominationReason || '');
      setShowConfirmDelete(false);
      setUploadError('');
      setShowUrlInput(false);
      setIsSaving(false);
    }
  }, [book?.id, isOpen]);

  if (!isOpen || !book) return null;

  const handleSelectBook = (selected) => {
    setTitle(selected.title || '');
    setAuthor(selected.author || '');
    setPages(selected.pages || book.pages || 250);
    setGenre(selected.genre || book.genre || 'Literatura');
    setCoverUrl(selected.cover || selected.coverUrl || book.coverUrl || '');
    if (selected.synopsis) {
      setSynopsis(selected.synopsis);
    }
  };

  // Upload local de imagem via FileReader + compressão Canvas (Base64)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).');
      return;
    }

    setUploadError('');
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target.result;
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 800;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const optimized = canvas.toDataURL('image/jpeg', 0.85);
          setCoverUrl(optimized);
          setIsProcessing(false);
        } catch {
          setCoverUrl(rawDataUrl);
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        setUploadError('Erro ao processar imagem.');
        setIsProcessing(false);
      };
      img.src = rawDataUrl;
    };
    reader.onerror = () => {
      setUploadError('Falha ao ler o arquivo.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const titleChanged = title.trim().toLowerCase() !== (book.title || '').trim().toLowerCase();

  // Validação anti-duplicidade ao editar título (ignora a si mesmo via book.id)
  const duplicateCheck = titleChanged
    ? findDuplicateBookInBallot(title, ballot?.books || [], book.id)
    : { isDuplicate: false, matchedBook: null };
  const duplicateInBallot = duplicateCheck.isDuplicate;
  const duplicateMatchedBook = duplicateCheck.matchedBook;

  const isCurrentReading = titleChanged && isCurrentReadingBook(title, currentReading);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || isSaving || isProcessing) return;

    if (duplicateInBallot) {
      if (showToast) {
        showToast(`Conflito: a obra "${duplicateMatchedBook?.title || title.trim()}" já existe na urna!`, 'error');
      }
      return;
    }

    if (isCurrentReading) {
      if (showToast) {
        showToast(`"${title.trim()}" já é a Leitura Atual do comitê!`, 'error');
      }
      return;
    }

    setIsSaving(true);
    try {
      const success = await updateNomination(book.id, {
        title: title.trim(),
        author: author.trim(),
        pages: parseInt(pages, 10) || book.pages || 250,
        genre: genre.trim() || 'Literatura',
        coverUrl: coverUrl.trim(),
        synopsis: synopsis.trim(),
        nominationReason: nominationReason.trim()
      });

      if (success) {
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    try {
      const success = await deleteNomination(book.id);
      if (success) {
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative bg-theme-container text-theme-primary rounded-2xl w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 mx-auto border-2 border-theme-border shadow-[8px_8px_0px_var(--shadow-color)] my-4 sm:my-8">
        
        {/* Cabeçalho com Botão de Fechar sem sobreposição */}
        <div className="flex items-start justify-between gap-3 w-full pb-2 mb-4 relative z-10">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-1.5 text-theme-red text-xs font-mono font-black uppercase tracking-wider mb-1 flex-wrap">
              <span>★</span>
              <span>Gerenciar Indicação</span>
              <span className="text-theme-gold">• Não vai lutar contra o fascismo?</span>
            </div>
            <h3 className="font-headline text-xl sm:text-2xl font-black text-theme-primary">
              Editar Sua Recomendação ★
            </h3>
            <p className="text-xs sm:text-sm text-theme-muted mt-1 font-reading font-semibold">
              Modifique os dados da obra ou retire a indicação da urna popular deste mês.
            </p>
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

        {/* Confirmação de Exclusão */}
        {showConfirmDelete ? (
          <div className="p-5 bg-theme-card rounded-xl border-2 border-theme-red shadow-[4px_4px_0px_var(--accent-red)] mb-6 text-left animate-pop">
            <h4 className="font-headline font-bold text-theme-red text-sm mb-1 flex items-center gap-1.5">
              <span>★</span> Tem certeza que deseja excluir esta recomendação?
            </h4>
            <p className="text-xs text-theme-muted mb-4 leading-relaxed font-reading">
              O livro "{book.title}" será removido da urna com todos os votos computados para ele. Você poderá indicar outro livro sempre que quiser.
            </p>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-theme-red hover:brightness-110 text-white rounded-lg border-2 border-theme-border text-xs font-mono font-black shadow-[2px_2px_0px_var(--shadow-color)]"
              >
                Sim, Excluir Indicação
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 bg-theme-container hover:bg-theme-card text-theme-primary border-2 border-theme-border rounded-lg text-xs font-mono font-bold shadow-[2px_2px_0px_var(--shadow-color)]"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <BookAutocomplete
                value={title}
                onChange={setTitle}
                onSelectBook={handleSelectBook}
                placeholder="Título da obra..."
                label="Título do Livro *"
                required={true}
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1">
                Autor(a) *
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full text-sm bg-theme-input border-2 border-theme-border rounded-lg px-3.5 py-2.5 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red font-reading"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1">
                Páginas
              </label>
              <input
                type="number"
                min="1"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                className="w-full text-sm bg-theme-input border-2 border-theme-border rounded-lg px-3.5 py-2.5 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1">
                Gênero
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full text-sm bg-theme-input border-2 border-theme-border rounded-lg px-3.5 py-2.5 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red"
              />
            </div>
          </div>

          {/* ÁREA DE CAPA: UPLOAD LOCAL (BASE64) + URL */}
          <div className="bg-theme-card p-3.5 rounded-xl border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)]">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider">
                Capa do Livro (Upload ou URL)
              </label>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] font-mono font-bold text-theme-red hover:underline flex items-center gap-1"
              >
                <LinkIcon className="w-3 h-3" />
                <span>{showUrlInput ? 'Ocultar link' : 'Digitar URL'}</span>
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-center gap-3.5">
              <div className="relative shrink-0 w-14 h-20 bg-theme-container rounded-lg border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] overflow-hidden flex items-center justify-center">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={title || 'Capa'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-1">
                    <ImageIcon className="w-5 h-5 text-theme-muted mx-auto mb-0.5" />
                    <span className="text-[8px] font-mono text-theme-muted block leading-tight">Sem Capa</span>
                  </div>
                )}
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-[9px] font-mono font-bold">
                    ...
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-theme-container hover:bg-[#FEF08A] hover:text-[#111111] text-theme-primary text-xs font-mono font-black uppercase tracking-wider rounded-lg border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-theme-red" />
                    <span>Upload do Dispositivo</span>
                  </button>

                  {coverUrl && (
                    <button
                      type="button"
                      onClick={() => setCoverUrl('')}
                      className="px-2.5 py-1.5 text-xs font-mono font-bold text-theme-red hover:bg-theme-red/10 rounded-lg border border-theme-red flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Limpar Capa</span>
                    </button>
                  )}
                </div>

                {uploadError && (
                  <p className="text-xs text-theme-red font-mono font-bold flex items-center gap-1 justify-center sm:justify-start">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{uploadError}</span>
                  </p>
                )}
              </div>
            </div>

            {showUrlInput && (
              <div className="mt-2.5 pt-2.5 border-t border-theme-border/20">
                <input
                  type="text"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="Cole aqui a URL direta da capa (https://...)"
                  className="w-full text-xs font-mono bg-theme-input border-2 border-theme-border rounded-lg px-3 py-2 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1">
              Sinopse
            </label>
            <textarea
              rows={3}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              className="w-full text-sm bg-theme-input border-2 border-theme-border rounded-lg p-3 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red leading-relaxed font-reading"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1">
              Por que ler este livro? (Defesa para as camaradas)
            </label>
            <textarea
              rows={2}
              value={nominationReason}
              onChange={(e) => setNominationReason(e.target.value)}
              className="w-full text-sm bg-theme-input border-2 border-theme-border rounded-lg p-3 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red font-reading italic"
            />
          </div>

          {/* Alertas de Duplicidade */}
          {duplicateInBallot && (
            <div className="p-3 bg-theme-red/15 border-2 border-theme-red rounded-xl flex items-start gap-2 text-xs font-mono font-bold text-theme-red animate-fade-in shadow-[2px_2px_0px_var(--accent-red)]">
              <AlertCircle className="w-4 h-4 shrink-0 text-theme-red mt-0.5" />
              <div>
                <span className="block font-headline font-black text-xs uppercase tracking-wider text-theme-red">
                  ⚠️ Conflito de título na Urna!
                </span>
                <p className="text-[11px] font-reading font-semibold text-theme-primary mt-0.5">
                  Já existe outra obra indicada com este título ("{duplicateMatchedBook?.title}"). Escolha um título único para evitar duplicidades.
                </p>
              </div>
            </div>
          )}

          {isCurrentReading && (
            <div className="p-3 bg-[#FEF08A]/20 border-2 border-theme-border rounded-xl flex items-start gap-2 text-xs font-mono font-bold text-theme-primary animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-theme-red mt-0.5" />
              <div>
                <span className="block font-headline font-black text-xs uppercase tracking-wider text-theme-red">
                  ★ Leitura Atual Ativa!
                </span>
                <p className="text-[11px] font-reading font-semibold text-theme-primary mt-0.5">
                  Esta obra já é a Leitura Atual do comitê revolucionário.
                </p>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t-2 border-theme-border">
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-mono font-bold text-theme-red hover:bg-theme-red/10 rounded-lg border-2 border-theme-red transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir Indicação</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2 text-xs font-mono font-bold text-theme-muted hover:bg-theme-card rounded-lg border-2 border-theme-border transition-colors text-center cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!title.trim() || duplicateInBallot || isCurrentReading || isSaving || isProcessing}
                className="flex-1 sm:flex-initial justify-center px-5 py-2 bg-theme-red hover:brightness-110 disabled:opacity-50 text-white text-xs font-headline font-black uppercase tracking-wider rounded-lg border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <Save className="w-3.5 h-3.5 text-[#FEF08A]" />
                <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
