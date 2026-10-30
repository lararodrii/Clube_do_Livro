import React, { useState, useEffect, useRef } from 'react';
import { useClub } from '../../context/ClubContext';
import { INITIAL_CURRENT_READING } from '../../data/initialData';
import { 
  X, 
  Save, 
  Upload, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  RotateCcw, 
  Trash2, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function EditCurrentReadingModal({ isOpen, onClose }) {
  const { currentReading, updateCurrentReading } = useClub();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pages, setPages] = useState('');
  const [genre, setGenre] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentReading && isOpen) {
      setTitle(currentReading.title || '');
      setAuthor(currentReading.author || '');
      setPages(currentReading.pages || '');
      setGenre(currentReading.genre || '');
      setCoverUrl(currentReading.coverUrl || '');
      setSynopsis(currentReading.synopsis || '');
      setUploadError('');
      setShowUrlInput(false);
    }
  }, [currentReading, isOpen]);

  if (!isOpen) return null;

  // Processa o arquivo selecionado, converte em Base64 e comprime via Canvas para o localStorage
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

      // Cria imagem temporária para redimensionamento otimizado
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 800; // Limite ideal para capa de livro em alta definição
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

          // Gera Base64 em JPEG de qualidade 0.85 (tamanho ~80-150KB)
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCoverUrl(optimizedDataUrl);
          setIsProcessing(false);
        } catch {
          // Fallback caso o canvas falhe
          setCoverUrl(rawDataUrl);
          setIsProcessing(false);
        }
      };

      img.onerror = () => {
        setUploadError('Erro ao decodificar a imagem selecionada.');
        setIsProcessing(false);
      };

      img.src = rawDataUrl;
    };

    reader.onerror = () => {
      setUploadError('Falha ao ler o arquivo do dispositivo.');
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);

    // Reseta o input para permitir selecionar o mesmo arquivo novamente se quiser
    e.target.value = '';
  };

  const handleRemoveCover = () => {
    setCoverUrl('');
    setUploadError('');
  };

  const handleRestoreDefault = () => {
    setCoverUrl(INITIAL_CURRENT_READING.coverUrl || '');
    setUploadError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    updateCurrentReading({
      title: title.trim(),
      author: author.trim(),
      pages: parseInt(pages, 10) || currentReading.pages,
      genre: genre.trim(),
      coverUrl: coverUrl.trim(),
      synopsis: synopsis.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative bg-[#FAF7F0] rounded-2xl max-w-xl w-full p-6 sm:p-8 border-2 border-[#1E1E1E] shadow-[8px_8px_0px_#1E1E1E] my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-500 hover:text-[#141414] p-2 rounded-lg border-2 border-[#1E1E1E] bg-white hover:bg-[#FEF08A] transition-colors shadow-[2px_2px_0px_#1E1E1E]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[#D62828] text-xs font-mono font-black uppercase tracking-wider mb-1">
            <span>★</span>
            <span>Leitura do Mês</span>
            <span className="text-[#283618]">• Não vai lutar contra o fascismo?</span>
          </div>
          <h3 className="font-headline text-2xl sm:text-3xl font-black text-[#141414]">
            Editar Dados da Leitura ★
          </h3>
          <p className="text-sm text-[#57534E] mt-1 font-reading font-semibold">
            Ajuste as informações da obra atualmente em debate no coletivo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-wider mb-1">
                Título da Obra *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm bg-white border-2 border-[#1E1E1E] rounded-lg px-3.5 py-2.5 text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
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
                className="w-full text-sm bg-white border-2 border-[#1E1E1E] rounded-lg px-3.5 py-2.5 text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#D62828] font-reading font-bold"
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
                className="w-full text-sm bg-white border-2 border-[#1E1E1E] rounded-lg px-3.5 py-2.5 text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#D62828] font-mono"
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
                className="w-full text-sm bg-white border-2 border-[#1E1E1E] rounded-lg px-3.5 py-2.5 text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
              />
            </div>
          </div>

          {/* ÁREA DE UPLOAD DE ARQUIVO DA CAPA (BASE64 + PREVIEW) */}
          <div className="bg-white p-4 rounded-xl border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E]">
            <div className="flex items-center justify-between mb-2.5">
              <label className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-wider">
                Capa do Livro (Upload do Dispositivo) *
              </label>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] font-mono font-bold text-[#D62828] hover:text-[#9E2A2B] underline flex items-center gap-1"
              >
                <LinkIcon className="w-3 h-3" />
                <span>{showUrlInput ? 'Ocultar campo de link' : 'Ou colar URL de imagem'}</span>
              </button>
            </div>

            {/* Input nativo oculto acionado pelo botão estilizado */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Miniatura de Pré-visualização da Capa */}
              <div className="relative shrink-0 w-20 h-28 bg-[#FAF7F0] rounded-lg border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] overflow-hidden flex items-center justify-center">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt="Pré-visualização da Capa"
                    className="w-full h-full object-cover"
                    onError={() => setUploadError('Não foi possível exibir a imagem.')}
                  />
                ) : (
                  <div className="text-center p-2">
                    <ImageIcon className="w-6 h-6 text-stone-400 mx-auto mb-1" />
                    <span className="text-[9px] font-mono text-[#57534E] block leading-tight">Sem Capa (Usa Mockup 3D)</span>
                  </div>
                )}
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-[10px] font-mono font-bold">
                    Otimizando...
                  </div>
                )}
              </div>

              {/* Botões e Instruções de Upload */}
              <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-[#FAF7F0] hover:bg-[#FEF08A] text-[#141414] text-xs font-mono font-black uppercase tracking-wider rounded-lg border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#D62828]" />
                    <span>Carregar Imagem do Dispositivo</span>
                  </button>

                  {coverUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      className="px-2.5 py-2 text-xs font-mono font-bold text-[#D62828] hover:bg-red-50 rounded-lg border border-transparent hover:border-[#D62828] transition-colors flex items-center gap-1"
                      title="Remover capa e exibir mockup 3D automático"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remover</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleRestoreDefault}
                    className="px-2.5 py-2 text-xs font-mono font-bold text-[#57534E] hover:text-[#141414] hover:bg-stone-100 rounded-lg border border-transparent transition-colors flex items-center gap-1"
                    title="Restaurar capa padrão da obra"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restaurar Padrão</span>
                  </button>
                </div>

                <p className="text-[11px] text-[#57534E] font-reading">
                  {coverUrl 
                    ? '★ Imagem pronta e convertida para o acervo local.' 
                    : 'Formatos aceitos: JPG, PNG, WEBP. Arquivos locais são salvos em Base64 e persistidos no seu navegador.'}
                </p>

                {uploadError && (
                  <p className="text-xs text-[#D62828] font-mono font-bold flex items-center gap-1 justify-center sm:justify-start">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{uploadError}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Opção secundária: Digitar link da imagem */}
            {showUrlInput && (
              <div className="mt-3 pt-3 border-t border-[#1E1E1E]/20 animate-fade-in">
                <label className="block text-[10px] font-mono font-bold text-[#57534E] uppercase tracking-wider mb-1">
                  Ou digite a URL direta da imagem:
                </label>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => {
                    setCoverUrl(e.target.value);
                    setUploadError('');
                  }}
                  placeholder="https://..."
                  className="w-full text-xs font-mono bg-[#FAF7F0] border-2 border-[#1E1E1E] rounded-lg px-3 py-2 text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
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
              className="w-full text-sm bg-white border-2 border-[#1E1E1E] rounded-lg p-3 text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#D62828] leading-relaxed font-reading"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-[#1E1E1E]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-mono font-bold text-[#57534E] hover:bg-stone-200 rounded-lg border-2 border-[#1E1E1E] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#D62828] hover:bg-[#9E2A2B] text-white text-xs font-headline font-black uppercase tracking-wider rounded-lg border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-[#FEF08A]" />
              <span>Salvar Dados da Obra ★</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
