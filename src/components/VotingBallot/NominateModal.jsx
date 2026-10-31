import React, { useState, useEffect, useRef } from 'react';
import { useClub } from '../../context/ClubContext';
import BookAutocomplete from '../common/BookAutocomplete';
import BookCover from '../common/BookCover';
import { 
  Search, 
  X, 
  Loader2, 
  BookPlus, 
  Check, 
  Sparkles,
  BookOpen,
  Info,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  AlertCircle
} from 'lucide-react';

export default function NominateModal({ isOpen, onClose }) {
  const { nominateBook, activeMember, ballot, currentReading, triggerComradeConfetti, showToast } = useClub();

  // Campos do formulário preenchidos automaticamente
  const [selectedBook, setSelectedBook] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pages, setPages] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [genre, setGenre] = useState('');
  const [nominationReason, setNominationReason] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef(null);

  // Normalização de texto para validação anti-duplicidade em tempo real
  const normalize = (str) => (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const cleanTitle = normalize(title);
  const cleanAuthor = normalize(author);

  // Verifica se o título informado já existe na Urna Popular
  const duplicateInBallot = Boolean(
    cleanTitle &&
    (ballot?.books || []).some(b => {
      const existingTitle = normalize(b.title);
      if (existingTitle === cleanTitle) return true;
      if (cleanTitle.length > 5 && existingTitle.length > 5) {
        if (existingTitle.includes(cleanTitle) || cleanTitle.includes(existingTitle)) {
          const existingAuthor = normalize(b.author);
          if (cleanAuthor && existingAuthor && (existingAuthor.includes(cleanAuthor) || cleanAuthor.includes(existingAuthor))) {
            return true;
          }
        }
      }
      return false;
    })
  );

  // Verifica se o título informado já é a leitura atual do mês
  const isCurrentReading = Boolean(
    cleanTitle &&
    normalize(currentReading?.title) &&
    (normalize(currentReading?.title) === cleanTitle || 
      (cleanTitle.length > 5 && normalize(currentReading?.title).includes(cleanTitle)))
  );

  // Ao selecionar um livro da busca Multi-API, autopreenche tudo
  const handleSelectBook = (book) => {
    setSelectedBook(book);
    setTitle(book.title || '');
    setAuthor(book.author || '');
    setPages(book.pages || 250);
    setCoverUrl(book.cover || book.coverUrl || '');
    setSynopsis(book.synopsis || '');
    setGenre(book.genre || 'Literatura');
  };

  // Upload local de imagem via FileReader (Base64)
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (duplicateInBallot) {
      if (showToast) {
        showToast(`A obra "${title.trim()}" já está indicada na Urna Popular! Você pode votar nela diretamente. 📚★`, 'error');
      }
      return;
    }

    if (isCurrentReading) {
      if (showToast) {
        showToast(`"${title.trim()}" já é a Leitura Atual do comitê! Escolha outra obra para a próxima rodada. 📚★`, 'error');
      }
      return;
    }

    const success = nominateBook({
      title,
      author,
      pages,
      coverUrl,
      synopsis,
      genre,
      nominationReason
    });

    if (success) {
      if (triggerComradeConfetti) {
        triggerComradeConfetti();
      }
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedBook(null);
    setTitle('');
    setAuthor('');
    setPages('');
    setCoverUrl('');
    setSynopsis('');
    setGenre('');
    setNominationReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative bg-theme-container text-theme-primary rounded-2xl w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 mx-auto border-2 border-theme-border shadow-[8px_8px_0px_var(--shadow-color)] my-4 sm:my-8">
        
        {/* Cabeçalho com Botão de Fechar sem sobreposição */}
        <div className="flex items-start justify-between gap-3 w-full pb-2 mb-4 relative z-10">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-1.5 text-theme-red text-xs font-mono font-black uppercase tracking-wider mb-1 flex-wrap">
              <span>★</span>
              <span>Indicação Popular do Coletivo</span>
              <span className="text-theme-gold">• Não vai lutar contra o fascismo?</span>
            </div>
            <h3 className="font-headline text-xl sm:text-2xl font-black text-theme-primary">
              Sugerir Livro para a Urna ★
            </h3>
            <p className="text-xs sm:text-sm text-theme-muted mt-1 font-reading font-semibold">
              Camarada, indique quantos livros quiser! Digite o título no campo abaixo para buscar automaticamente em Apple Books, Google Books e Open Library e autopreencher com 1 clique.
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleClose(); }}
            title="Fechar modal"
            className="shrink-0 z-30 w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer text-theme-muted hover:text-theme-primary border-2 border-theme-border bg-theme-card hover:bg-theme-gold/20 transition-colors shadow-[2px_2px_0px_var(--shadow-color)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORMULÁRIO DE INDICAÇÃO */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          
          {/* Preview se livro estiver selecionado */}
          {coverUrl && (
            <div className="flex items-center gap-4 p-3.5 bg-theme-card rounded-xl border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] mb-4">
              <img
                src={coverUrl}
                alt={title}
                className="w-12 h-16 object-cover rounded border border-theme-border bg-theme-container"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-mono font-bold text-[#111111] bg-[#FEF08A] px-2 py-0.5 rounded border border-theme-border inline-flex items-center gap-1 mb-1">
                  <span>★</span> Dados Importados da API Multi-Busca
                </span>
                <p className="text-sm font-headline font-bold text-theme-primary truncate">{title}</p>
                <p className="text-xs text-theme-red font-reading italic">{author}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <BookAutocomplete
                value={title}
                onChange={setTitle}
                onSelectBook={handleSelectBook}
                placeholder="Ex: Teoria Geral do Esquecimento"
                label="Título da Obra / Busca Multi-API *"
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
                placeholder="Ex: José Eduardo Agualusa"
                className="w-full text-sm bg-theme-input border-2 border-theme-border rounded-lg px-3.5 py-2.5 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red font-reading"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1">
                Total de Páginas
              </label>
              <input
                type="number"
                min="1"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                placeholder="Ex: 280"
                className="w-full text-sm bg-theme-input border-2 border-theme-border rounded-lg px-3.5 py-2.5 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1">
                Gênero / Categoria
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Ex: Romance Histórico"
                className="w-full text-sm bg-theme-input border-2 border-theme-border rounded-lg px-3.5 py-2.5 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red"
              />
            </div>
          </div>

          {/* ÁREA DE CAPA: UPLOAD LOCAL (BASE64) + URL GOOGLE BOOKS */}
          <div className="bg-theme-card p-4 rounded-xl border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)]">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider">
                Capa do Livro (Upload do Arquivo ou URL)
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

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative shrink-0 w-16 h-24 bg-theme-container rounded-lg border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] overflow-hidden flex items-center justify-center">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={title || 'Capa'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-1.5">
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
                    className="px-3.5 py-2 bg-theme-container hover:bg-[#FEF08A] hover:text-[#111111] text-theme-primary text-xs font-mono font-black uppercase tracking-wider rounded-lg border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 flex items-center gap-2"
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

                <p className="text-[11px] text-theme-muted font-reading">
                  Carregue do computador/celular em Base64 ou use a busca Google Books acima.
                </p>

                {uploadError && (
                  <p className="text-xs text-theme-red font-mono font-bold flex items-center gap-1 justify-center sm:justify-start">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{uploadError}</span>
                  </p>
                )}
              </div>
            </div>

            {showUrlInput && (
              <div className="mt-3 pt-3 border-t border-theme-border/20">
                <input
                  type="url"
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
              Sinopse do Livro
            </label>
            <textarea
              rows={3}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Breve descrição da obra..."
              className="w-full text-sm bg-theme-input border-2 border-theme-border rounded-lg p-3 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red leading-relaxed font-reading"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1">
              Por que ler este livro? (Defesa da sua indicação para o Coletivo)
            </label>
            <textarea
              rows={2}
              value={nominationReason}
              onChange={(e) => setNominationReason(e.target.value)}
              placeholder="Explique ao coletivo por que essa leitura vale a pena..."
              className="w-full text-sm bg-theme-input border-2 border-theme-border rounded-lg p-3 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red font-reading italic"
            />
          </div>

          {/* Alertas de Duplicidade em Tempo Real */}
          {duplicateInBallot && (
            <div className="p-3 bg-theme-red/10 border-2 border-theme-red rounded-xl flex items-center gap-2.5 text-xs font-mono font-bold text-theme-red animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-theme-red" />
              <span>Esta obra já foi indicada na Urna Popular! Você pode votar nela diretamente na urna em vez de cadastrá-la novamente.</span>
            </div>
          )}

          {isCurrentReading && (
            <div className="p-3 bg-[#FEF08A]/20 border-2 border-theme-border rounded-xl flex items-center gap-2.5 text-xs font-mono font-bold text-theme-primary animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-theme-red" />
              <span>Esta obra já é a Leitura Atual do comitê! Escolha outra obra para a próxima rodada de votação.</span>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t-2 border-theme-border">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-mono font-bold text-theme-muted hover:bg-theme-card rounded-lg border-2 border-theme-border transition-colors text-center cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim() || duplicateInBallot || isCurrentReading || isProcessing}
              className="w-full sm:w-auto justify-center px-6 py-2.5 bg-theme-red hover:brightness-110 disabled:opacity-50 text-white text-xs font-headline font-black uppercase tracking-wider rounded-lg border-2 border-theme-border shadow-[4px_4px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <BookPlus className="w-4 h-4 text-[#FEF08A]" />
              <span>★ Adicionar à Urna</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
