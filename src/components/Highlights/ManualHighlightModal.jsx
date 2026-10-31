import React, { useState } from 'react';
import { 
  X, 
  Send, 
  BookOpen, 
  Lock, 
  Sparkles,
  Palette
} from 'lucide-react';

const HIGHLIGHT_COLORS = [
  { name: 'Amarelo Revolucionário', hex: '#FDE047', bgClass: 'bg-yellow-300/40 border-yellow-400 text-yellow-950', borderHex: '#CA8A04' },
  { name: 'Rosa Carmim (StarNote)', hex: '#F472B6', bgClass: 'bg-pink-300/40 border-pink-400 text-pink-950', borderHex: '#DB2777' },
  { name: 'Verde Sierra', hex: '#4ADE80', bgClass: 'bg-emerald-300/40 border-emerald-400 text-emerald-950', borderHex: '#059669' },
  { name: 'Azul Cibernético', hex: '#38BDF8', bgClass: 'bg-cyan-300/40 border-cyan-400 text-cyan-950', borderHex: '#0284C7' },
  { name: 'Laranja Manifesto', hex: '#FB923C', bgClass: 'bg-orange-300/40 border-orange-400 text-orange-950', borderHex: '#EA580C' }
];

export default function ManualHighlightModal({
  isOpen,
  onClose,
  onSubmit,
  bookTitle = 'Leitura Atual'
}) {
  const [page, setPage] = useState('');
  const [text, setText] = useState('');
  const [note, setNote] = useState('');
  const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS[0]);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    onSubmit({
      page: page ? parseInt(page, 10) : 1,
      text: text.trim(),
      note: note.trim(),
      color: selectedColor,
      isSpoiler
    });

    setText('');
    setPage('');
    setNote('');
    setIsSpoiler(false);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative bg-theme-container text-theme-primary rounded-2xl w-[95vw] max-w-lg p-5 sm:p-6 border-2 border-theme-border shadow-[8px_8px_0px_var(--shadow-color)] my-4 overflow-hidden animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b-2 border-theme-border">
          <div className="flex items-center gap-2">
            <span className="text-theme-red font-black text-lg">★</span>
            <div>
              <h3 className="font-headline font-black text-base sm:text-lg text-theme-primary leading-tight">
                Adicionar Grifo Manualmente
              </h3>
              <p className="text-[11px] font-mono text-theme-muted font-bold">
                Para quem lê em livro físico ou anotações à mão
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-theme-card border border-theme-border/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Número da Página */}
          <div>
            <label className="block text-xs font-mono font-bold text-theme-primary mb-1">
              Página do Livro:
            </label>
            <input
              type="number"
              min="1"
              required
              value={page}
              onChange={(e) => setPage(e.target.value)}
              placeholder="Ex: 45"
              className="w-32 px-3 py-2 text-xs font-mono font-black bg-theme-input border-2 border-theme-border rounded-lg text-theme-primary focus:outline-none focus:border-theme-red shadow-inner"
            />
          </div>

          {/* Trecho Grifado */}
          <div>
            <label className="block text-xs font-mono font-bold text-theme-primary mb-1">
              Texto que você destacou:
            </label>
            <textarea
              rows={4}
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`"Digite exatamente o trecho ou passagem que você sublinhou no livro..."`}
              className="w-full text-xs sm:text-sm font-reading italic leading-relaxed p-3 bg-theme-input border-2 border-theme-border rounded-lg text-theme-primary focus:outline-none focus:border-theme-red shadow-inner"
            />
          </div>

          {/* Seletor de Cor do Marca-texto */}
          <div>
            <label className="block text-xs font-mono font-bold text-theme-primary mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-theme-red" />
              <span>Cor do Marca-texto:</span>
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    selectedColor.name === c.name
                      ? 'border-theme-border scale-105 shadow-[2px_2px_0px_var(--shadow-color)] font-black'
                      : 'border-theme-border/50 opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: `${c.hex}35` }}
                >
                  <span 
                    className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-xs" 
                    style={{ backgroundColor: c.hex }} 
                  />
                  <span className="text-theme-primary">{c.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Observação Crítica Pessoal */}
          <div>
            <label className="block text-xs font-mono font-bold text-theme-primary mb-1">
              Sua Nota / Tese de Debate (Opcional):
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Ponto de partida para a discussão de quarta-feira..."
              className="w-full px-3 py-2 text-xs font-reading bg-theme-input border-2 border-theme-border rounded-lg text-theme-primary focus:outline-none focus:border-theme-red"
            />
          </div>

          {/* Botão de Tarja Confidencial */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsSpoiler(!isSpoiler)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-bold border-2 border-theme-border transition-all cursor-pointer ${
                isSpoiler
                  ? 'bg-theme-red text-white font-black'
                  : 'bg-theme-card text-theme-muted hover:text-theme-primary'
              }`}
            >
              <Lock className={`w-3.5 h-3.5 ${isSpoiler ? 'text-[#FEF08A]' : 'text-theme-red'}`} />
              <span>{isSpoiler ? '🔒 Tarja Confidencial Ativada (Anti-Spoiler)' : '🔒 Proteger com Tarja Confidencial'}</span>
            </button>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-theme-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono font-bold text-theme-muted hover:text-theme-primary rounded-lg border border-theme-border hover:bg-theme-card transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !text.trim()}
              className="px-5 py-2.5 bg-theme-red hover:opacity-90 disabled:opacity-50 text-white text-xs font-mono font-black uppercase tracking-wider rounded-lg border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[#FEF08A]" />
              <span>Prego no Dossiê ★</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
