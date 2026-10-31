import React, { useState, useEffect, useRef } from 'react';
import { useClub } from '../../context/ClubContext';
import { searchGoogleBooks } from '../../services/googleBooks';
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
  const { nominateBook, activeMember, triggerComradeConfetti } = useClub();

  // Estados de busca
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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

  const debounceTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Busca debounced na Google Books API
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsSearching(true);
      setHasSearched(true);
      const results = await searchGoogleBooks(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 350);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Ao selecionar um livro da busca Google Books, autopreenche tudo
  const handleSelectBook = (book) => {
    setSelectedBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setPages(book.pages);
    setCoverUrl(book.coverUrl);
    setSynopsis(book.synopsis);
    setGenre(book.genre || 'Literatura');
    setSearchResults([]);
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
    setSearchQuery('');
    setSearchResults([]);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative bg-[#FAF7F0] rounded-2xl max-w-2xl w-full p-6 sm:p-8 border-2 border-[#1E1E1E] shadow-[8px_8px_0px_#1E1E1E] my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Botão de Fechar */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-stone-500 hover:text-[#141414] p-2 rounded-lg border-2 border-[#1E1E1E] bg-white hover:bg-[#FEF08A] transition-colors shadow-[2px_2px_0px_#1E1E1E]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="mb-6 relative z-10">
          <div className="flex items-center gap-2 text-[#D62828] text-xs font-mono font-black uppercase tracking-wider mb-1">
            <span>★</span>
            <span>Indicação Popular do Coletivo</span>
            <span className="text-[#283618]">• Não vai lutar contra o fascismo?</span>
          </div>
          <h3 className="font-headline text-2xl sm:text-3xl font-black text-[#141414]">
            Sugerir Livro para a Urna ★
          </h3>
          <p className="text-xs sm:text-sm text-[#57534E] mt-1 font-reading font-semibold">
            Camarada, indique quantos livros quiser! Busque no catálogo da Google Books para preencher a ficha com 1 clique.
          </p>
        </div>

        {/* CAMPO DE BUSCA GOOGLE BOOKS INTEGRADO */}
        <div className="relative mb-6 z-20">
          <label className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-wider mb-2">
            Pesquisar no Catálogo Google Books:
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite o título, autor ou palavra-chave..."
              className="w-full text-xs sm:text-sm bg-white border-2 border-[#1E1E1E] rounded-xl pl-10 pr-10 py-3 text-[#141414] placeholder:text-stone-400 focus:outline-none shadow-[2px_2px_0px_#1E1E1E]"
            />
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
            {isSearching && (
              <Loader2 className="w-4 h-4 text-[#D62828] animate-spin absolute right-3.5 top-3.5" />
            )}
          </div>

          {/* DROPDOWN DINÂMICO DE RESULTADOS DA API */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border-2 border-[#1E1E1E] shadow-[6px_6px_0px_#1E1E1E] z-50 max-h-72 overflow-y-auto divide-y-2 divide-[#1E1E1E] animate-fade-in">
              <div className="p-3 bg-[#D62828] text-white text-[11px] font-mono font-black uppercase flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>★</span> Resultados no Google Books ({searchResults.length}):
                </span>
                <span className="text-[10px] text-[#FEF08A]">Clique para autopreencher</span>
              </div>
              {searchResults.map((book) => (
                <div
                  key={book.id}
                  onClick={() => handleSelectBook(book)}
                  className="flex items-center gap-3.5 p-3 hover:bg-[#FAF7F0] cursor-pointer transition-colors text-left"
                >
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-10 h-14 object-cover rounded border border-[#1E1E1E] shrink-0 bg-stone-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-headline font-bold text-[#141414] truncate">
                      {book.title}
                    </p>
                    <p className="text-xs text-[#D62828] font-reading italic truncate">
                      {book.author}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#57534E] mt-0.5">
                      <span>{book.pages} páginas</span>
                      {book.year && <span>• {book.year}</span>}
                    </div>
                  </div>
                  <BookPlus className="w-4 h-4 text-[#D62828] shrink-0" />
                </div>
              ))}
            </div>
          )}

          {hasSearched && !isSearching && searchResults.length === 0 && searchQuery.trim().length >= 2 && (
            <p className="text-xs text-[#57534E] mt-2 italic font-reading">
              Nenhum resultado direto retornado. Você pode preencher os campos manualmente abaixo.
            </p>
          )}
        </div>

        {/* FORMULÁRIO DE INDICAÇÃO */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          
          {/* Preview se livro estiver selecionado */}
          {coverUrl && (
            <div className="flex items-center gap-4 p-3.5 bg-white rounded-xl border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E] mb-4">
              <img
                src={coverUrl}
                alt={title}
                className="w-12 h-16 object-cover rounded border border-[#1E1E1E] bg-stone-100"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-mono font-bold text-[#283618] bg-[#FEF08A] px-2 py-0.5 rounded border border-[#1E1E1E] inline-flex items-center gap-1 mb-1">
                  <span>★</span> Dados Importados da API
                </span>
                <p className="text-sm font-headline font-bold text-[#141414] truncate">{title}</p>
                <p className="text-xs text-[#D62828] font-reading italic">{author}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-wider mb-1">
                Título do Livro *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Teoria Geral do Esquecimento"
                className="w-full text-sm bg-white border-2 border-[#1E1E1E] rounded-lg px-3.5 py-2.5 text-[#141414] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-wider mb-1">
                Autor(a) *
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Ex: José Eduardo Agualusa"
                className="w-full text-sm bg-white border-2 border-[#1E1E1E] rounded-lg px-3.5 py-2.5 text-[#141414] focus:outline-none font-reading"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-wider mb-1">
                Total de Páginas
              </label>
              <input
                type="number"
                min="1"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                placeholder="Ex: 280"
                className="w-full text-sm bg-white border-2 border-[#1E1E1E] rounded-lg px-3.5 py-2.5 text-[#141414] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-wider mb-1">
                Gênero / Categoria
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Ex: Romance Histórico"
                className="w-full text-sm bg-white border-2 border-[#1E1E1E] rounded-lg px-3.5 py-2.5 text-[#141414] focus:outline-none"
              />
            </div>
          </div>

          {/* ÁREA DE CAPA: UPLOAD LOCAL (BASE64) + URL GOOGLE BOOKS */}
          <div className="bg-white p-4 rounded-xl border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E]">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-wider">
                Capa do Livro (Upload do Arquivo ou URL)
              </label>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] font-mono font-bold text-[#D62828] hover:text-[#9E2A2B] underline flex items-center gap-1"
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
              <div className="relative shrink-0 w-16 h-24 bg-[#FAF7F0] rounded-lg border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] overflow-hidden flex items-center justify-center">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={title || 'Capa'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-1.5">
                    <ImageIcon className="w-5 h-5 text-stone-400 mx-auto mb-0.5" />
                    <span className="text-[8px] font-mono text-[#57534E] block leading-tight">Sem Capa</span>
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
                    className="px-3.5 py-2 bg-[#FAF7F0] hover:bg-[#FEF08A] text-[#141414] text-xs font-mono font-black uppercase tracking-wider rounded-lg border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#D62828]" />
                    <span>Upload do Dispositivo</span>
                  </button>

                  {coverUrl && (
                    <button
                      type="button"
                      onClick={() => setCoverUrl('')}
                      className="px-2.5 py-1.5 text-xs font-mono font-bold text-[#D62828] hover:bg-red-50 rounded-lg border border-[#D62828] flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Limpar Capa</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-[#57534E] font-reading">
                  Carregue do computador/celular em Base64 ou use a busca Google Books acima.
                </p>

                {uploadError && (
                  <p className="text-xs text-[#D62828] font-mono font-bold flex items-center gap-1 justify-center sm:justify-start">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{uploadError}</span>
                  </p>
                )}
              </div>
            </div>

            {showUrlInput && (
              <div className="mt-3 pt-3 border-t border-[#1E1E1E]/20">
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="Cole aqui a URL direta da capa (https://...)"
                  className="w-full text-xs font-mono bg-[#FAF7F0] border-2 border-[#1E1E1E] rounded-lg px-3 py-2 text-[#141414] focus:outline-none"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-wider mb-1">
              Sinopse do Livro
            </label>
            <textarea
              rows={3}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Breve descrição da obra..."
              className="w-full text-sm bg-white border-2 border-[#1E1E1E] rounded-lg p-3 text-[#141414] focus:outline-none leading-relaxed font-reading"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-wider mb-1">
              Por que ler este livro? (Defesa da sua indicação para o Coletivo)
            </label>
            <textarea
              rows={2}
              value={nominationReason}
              onChange={(e) => setNominationReason(e.target.value)}
              placeholder="Explique ao coletivo por que essa leitura vale a pena..."
              className="w-full text-sm bg-white border-2 border-[#1E1E1E] rounded-lg p-3 text-[#141414] focus:outline-none font-reading italic"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-[#1E1E1E]">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 text-xs font-mono font-bold text-[#57534E] hover:bg-stone-200 rounded-lg border-2 border-[#1E1E1E] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-6 py-2.5 bg-[#D62828] hover:bg-[#9E2A2B] disabled:opacity-50 text-white text-xs font-headline font-black uppercase tracking-wider rounded-lg border-2 border-[#1E1E1E] shadow-[4px_4px_0px_#1E1E1E] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2"
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
