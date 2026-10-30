import React, { useState, useEffect } from 'react';
import { useClub } from '../../context/ClubContext';
import { X, Save, BookOpen, Sparkles } from 'lucide-react';

export default function EditCurrentReadingModal({ isOpen, onClose }) {
  const { currentReading, updateCurrentReading } = useClub();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pages, setPages] = useState('');
  const [genre, setGenre] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [synopsis, setSynopsis] = useState('');

  useEffect(() => {
    if (currentReading && isOpen) {
      setTitle(currentReading.title || '');
      setAuthor(currentReading.author || '');
      setPages(currentReading.pages || '');
      setGenre(currentReading.genre || '');
      setCoverUrl(currentReading.coverUrl || '');
      setSynopsis(currentReading.synopsis || '');
    }
  }, [currentReading, isOpen]);

  if (!isOpen) return null;

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

          <div>
            <label className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-wider mb-1">
              URL da Imagem da Capa (ou capa 3D automática)
            </label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://..."
              className="w-full text-xs font-mono bg-white border-2 border-[#1E1E1E] rounded-lg px-3.5 py-2 text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#D62828]"
            />
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
