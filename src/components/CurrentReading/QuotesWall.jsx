import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import ComradeCat from '../common/ComradeCat';
import { 
  Quote, 
  Send, 
  Heart, 
  Trash2, 
  Pencil,
  Check,
  X,
  Sparkles
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
    currentReading,
    triggerComradeConfetti
  } = useClub();

  const [text, setText] = useState('');
  const [page, setPage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para citação sendo editada
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editPage, setEditPage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    addQuote({ text, page });
    setText('');
    setPage('');
    setIsSubmitting(false);

    if (triggerComradeConfetti) {
      triggerComradeConfetti();
    }
  };

  const handleStartEdit = (quote) => {
    setEditingId(quote.id);
    setEditText(quote.text);
    setEditPage(quote.page || '');
  };

  const handleSaveEdit = (quoteId) => {
    if (!editText.trim()) return;
    updateQuote(quoteId, { text: editText, page: editPage });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditPage('');
  };

  return (
    <div className="retro-card rounded-2xl p-6 sm:p-7 relative bg-white border-2 border-[#1E1E1E] shadow-[6px_6px_0px_#1E1E1E]">
      
      {/* Cabeçalho do Mural */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-[#1E1E1E] mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#D62828] text-[#FEF08A] border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] flex items-center justify-center font-black text-sm">
            ★
          </div>
          <div>
            <h3 className="font-headline font-black text-lg sm:text-xl text-[#141414] flex items-center gap-1.5">
              <span>Mural Revolucionário de Citações</span>
              <span className="text-[#D62828]">★</span>
            </h3>
            <p className="text-xs text-[#57534E] font-reading font-semibold italic">
              Passagens marcantes de "{currentReading.title}"
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono font-black text-[#141414] bg-[#FEF08A] px-3 py-1 rounded-lg border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E]">
          {quotes.length} {quotes.length === 1 ? 'citação' : 'citações compartilhadas'}
        </span>
      </div>

      {/* Formulário Rápido de Adicionar Citação */}
      <form onSubmit={handleSubmit} className="mb-6 bg-[#FAF7F0] p-4 sm:p-5 rounded-xl border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E]">
        <div className="flex items-center gap-2.5 mb-3">
          <img
            src={activeMember.avatar}
            alt={activeMember.name}
            className="w-8 h-8 rounded-lg object-cover border-2 border-[#1E1E1E]"
          />
          <div>
            <p className="text-xs font-mono font-black text-[#141414]">
              Publicar como: <span className="text-[#D62828]">{activeMember.name}</span>
            </p>
            <p className="text-[10px] text-[#57534E] font-reading">
              Qual trecho do livro chamou a sua atenção hoje?
            </p>
          </div>
        </div>

        <textarea
          rows={3}
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`"Cole ou digite aqui uma passagem marcante que você sublinhou..."`}
          className="w-full text-xs sm:text-sm bg-white border-2 border-[#1E1E1E] rounded-lg p-3 text-[#141414] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#D62828]/20 leading-relaxed font-reading italic shadow-inner"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
          <input
            type="text"
            value={page}
            onChange={(e) => setPage(e.target.value)}
            placeholder="Página (ex: p. 45)"
            className="w-36 text-xs bg-white border-2 border-[#1E1E1E] rounded-lg px-3 py-2 text-[#141414] focus:outline-none font-mono"
          />

          <button
            type="submit"
            disabled={isSubmitting || !text.trim()}
            className="px-5 py-2.5 bg-[#D62828] hover:bg-[#9E2A2B] disabled:opacity-50 text-white text-xs font-mono font-black uppercase tracking-wider rounded-lg border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5 text-[#FEF08A]" />
            <span>Prego no Mural ★</span>
          </button>
        </div>
      </form>

      {/* Lista de Citações OU Empty State com o Gato Camarada */}
      {quotes.length === 0 ? (
        <div className="p-8 sm:p-10 text-center bg-[#FAF7F0] rounded-xl border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E] flex flex-col items-center">
          <div className="mb-2">
            <ComradeCat pose="sleeping" size="md" showBubble={false} />
          </div>
          <h4 className="font-headline font-black text-lg text-[#141414] mb-1">
            Nenhuma citação pregada no mural ainda!
          </h4>
          <p className="text-xs text-[#57534E] font-reading max-w-md mx-auto italic">
            O Gato Camarada está tirando uma soneca sobre os livros enquanto espera você destacar uma passagem impactante de "{currentReading.title}". Seja a primeira!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => {
            const authorMember = members.find(m => m.id === quote.memberId) || {
              name: quote.authorName || 'Camarada',
              avatar: '',
              color: '#D62828'
            };

            const isAuthor = quote.memberId === activeMember.id;
            const isEditing = editingId === quote.id;
            const isLiked = quote.likedBy?.includes(activeMember.id);
            const likesCount = quote.likedBy?.length || 0;

            return (
              <div
                key={quote.id}
                className={`p-4 sm:p-5 rounded-xl border-2 border-[#1E1E1E] transition-all ${
                  isAuthor 
                    ? 'bg-[#FAF7F0] shadow-[4px_4px_0px_#D62828]' 
                    : 'bg-white shadow-[3px_3px_0px_#1E1E1E]'
                }`}
              >
                {/* Topo do Card de Citação */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={authorMember.avatar}
                      alt={authorMember.name}
                      className="w-8 h-8 rounded-lg object-cover border-2 border-[#1E1E1E]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-headline font-bold text-[#141414]">
                          {authorMember.name}
                        </span>
                        {isAuthor && (
                          <span className="text-[9px] font-mono bg-[#D62828] text-white font-bold px-1.5 py-0.2 rounded border border-[#1E1E1E]">
                            Você
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#57534E] font-mono block">
                        {quote.date || 'Hoje'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {quote.page && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-[#9E2A2B] border border-[#1E1E1E]">
                        {quote.page}
                      </span>
                    )}

                    {/* Botões de Edição e Exclusão pelo Autor */}
                    {isAuthor && !isEditing && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(quote)}
                          title="Editar citação"
                          className="p-1 hover:bg-[#FEF08A] text-[#141414] border border-[#1E1E1E] rounded transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteQuote(quote.id)}
                          title="Excluir citação"
                          className="p-1 hover:bg-[#D62828] hover:text-white text-[#D62828] border border-[#1E1E1E] rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
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
                      className="w-full text-xs sm:text-sm bg-white border-2 border-[#1E1E1E] rounded-lg p-2.5 text-[#141414] focus:outline-none font-reading italic"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={editPage}
                        onChange={(e) => setEditPage(e.target.value)}
                        placeholder="Página (ex: p. 45)"
                        className="w-28 text-xs bg-white border-2 border-[#1E1E1E] rounded px-2.5 py-1 text-[#141414] font-mono"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-3 py-1 text-xs font-bold text-[#57534E] hover:bg-stone-200 rounded border border-[#1E1E1E]"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(quote.id)}
                          className="px-3 py-1 text-xs font-bold bg-[#D62828] hover:bg-[#9E2A2B] text-white rounded border border-[#1E1E1E] flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3 h-3" />
                          <span>Salvar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xs sm:text-sm text-[#141414] leading-relaxed font-reading italic pl-3 border-l-2 border-[#D62828] my-2">
                      "{quote.text}"
                    </p>

                    {/* Botão de Curtida */}
                    <div className="flex items-center justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => toggleQuoteLike(quote.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold border-2 border-[#1E1E1E] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 ${
                          isLiked 
                            ? 'bg-[#D62828] text-white shadow-[2px_2px_0px_#1E1E1E]' 
                            : 'bg-white text-[#141414] hover:bg-[#FAF7F0] shadow-[2px_2px_0px_#1E1E1E]'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#FEF08A] text-[#FEF08A]' : 'text-[#D62828]'}`} />
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
