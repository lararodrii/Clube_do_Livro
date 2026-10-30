import React, { useState, useEffect } from 'react';
import { useClub } from '../../context/ClubContext';
import { X, Save, BookOpen, Trash2 } from 'lucide-react';

export default function EditNominationModal({ book, isOpen, onClose }) {
  const { updateNomination, deleteNomination, activeMember } = useClub();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pages, setPages] = useState('');
  const [genre, setGenre] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [nominationReason, setNominationReason] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

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
    }
  }, [book, isOpen]);

  if (!isOpen || !book) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    updateNomination(book.id, {
      title: title.trim(),
      author: author.trim(),
      pages: parseInt(pages, 10) || book.pages,
      genre: genre.trim(),
      coverUrl: coverUrl.trim(),
      synopsis: synopsis.trim(),
      nominationReason: nominationReason.trim()
    });

    onClose();
  };

  const handleDelete = () => {
    deleteNomination(book.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
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
            <span>Gerenciar Indicação</span>
            <span className="text-[#283618]">• Não vai lutar contra o fascismo?</span>
          </div>
          <h3 className="font-headline text-2xl sm:text-3xl font-black text-[#141414]">
            Editar Sua Recomendação ★
          </h3>
          <p className="text-sm text-[#57534E] mt-1 font-reading font-semibold">
            Modifique os dados da obra ou retire a indicação da urna popular deste mês.
          </p>
        </div>

        {/* Confirmação de Exclusão */}
        {showConfirmDelete ? (
          <div className="p-5 bg-white rounded-xl border-2 border-[#D62828] shadow-[4px_4px_0px_#D62828] mb-6 text-left animate-pop">
            <h4 className="font-headline font-bold text-[#D62828] text-sm mb-1 flex items-center gap-1.5">
              <span>★</span> Tem certeza que deseja excluir esta recomendação?
            </h4>
            <p className="text-xs text-[#57534E] mb-4 leading-relaxed font-reading">
              O livro "{book.title}" será removido da urna com todos os votos computados para ele. Você poderá indicar outro livro sempre que quiser.
            </p>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-[#D62828] hover:bg-[#9E2A2B] text-white rounded-lg border-2 border-[#1E1E1E] text-xs font-mono font-black shadow-[2px_2px_0px_#1E1E1E]"
              >
                Sim, Excluir Indicação
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 bg-white hover:bg-stone-100 text-[#141414] border-2 border-[#1E1E1E] rounded-lg text-xs font-mono font-bold shadow-[2px_2px_0px_#1E1E1E]"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          
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
                className="w-full text-sm bg-white border-2 border-[#1E1E1E] rounded-lg px-3.5 py-2.5 text-[#141414] focus:outline-none font-reading"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-wider mb-1">
                Páginas
              </label>
              <input
                type="number"
                min="1"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                className="w-full text-sm bg-white border-2 border-[#1E1E1E] rounded-lg px-3.5 py-2.5 text-[#141414] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-wider mb-1">
                Gênero
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full text-sm bg-white border-2 border-[#1E1E1E] rounded-lg px-3.5 py-2.5 text-[#141414] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-wider mb-1">
              URL da Imagem de Capa
            </label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://..."
              className="w-full text-xs bg-white border-2 border-[#1E1E1E] rounded-lg px-3.5 py-2 text-[#141414] focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-wider mb-1">
              Sinopse
            </label>
            <textarea
              rows={2}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              className="w-full text-sm bg-white border-2 border-[#1E1E1E] rounded-lg p-3 text-[#141414] focus:outline-none leading-relaxed font-reading"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-wider mb-1">
              Por que ler este livro? (Defesa para as camaradas)
            </label>
            <textarea
              rows={2}
              value={nominationReason}
              onChange={(e) => setNominationReason(e.target.value)}
              className="w-full text-sm bg-white border-2 border-[#1E1E1E] rounded-lg p-3 text-[#141414] focus:outline-none font-reading italic"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t-2 border-[#1E1E1E]">
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-bold text-[#D62828] hover:bg-[#FDF0ED] rounded-lg border-2 border-[#D62828] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir Indicação</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-mono font-bold text-[#57534E] hover:bg-stone-200 rounded-lg border-2 border-[#1E1E1E] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#283618] hover:bg-[#1E2812] text-[#FEF08A] text-xs font-headline font-black uppercase tracking-wider rounded-lg border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5 text-[#FEF08A]" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
