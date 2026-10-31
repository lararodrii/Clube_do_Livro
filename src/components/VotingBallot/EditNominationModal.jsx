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
              <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1">
                Título do Livro *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm bg-theme-input border-2 border-theme-border rounded-lg px-3.5 py-2.5 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red"
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

          <div>
            <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1">
              URL da Imagem de Capa
            </label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://..."
              className="w-full text-xs bg-theme-input border-2 border-theme-border rounded-lg px-3.5 py-2 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1">
              Sinopse
            </label>
            <textarea
              rows={2}
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
                className="flex-1 sm:flex-initial px-4 py-2 text-xs font-mono font-bold text-theme-muted hover:bg-theme-card rounded-lg border-2 border-theme-border transition-colors text-center"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-initial justify-center px-5 py-2 bg-theme-red hover:brightness-110 text-white text-xs font-headline font-black uppercase tracking-wider rounded-lg border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1.5"
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
