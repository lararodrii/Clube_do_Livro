import React, { useState, useEffect } from 'react';
import { useClub } from '../../context/ClubContext';
import { X, UserCheck, Sparkles, Image, Palette, BookMarked, FileText } from 'lucide-react';

const AVATAR_PRESETS = [
  '/avatars/gato1.jpg',
  '/avatars/gato2.jpg',
  '/avatars/gato3.jpg',
  '/avatars/gato4.jpg',
  '/avatars/gato5.jpg',
  '/avatars/gato6.jpg'
];

const COLOR_PRESETS = [
  { name: 'Vermelho Estrela', hex: '#D62828' },
  { name: 'Rubro Revolução', hex: '#9E2A2B' },
  { name: 'Verde Militar', hex: '#283618' },
  { name: 'Dourado Teoria', hex: '#BC6C25' },
  { name: 'Mostarda Claro', hex: '#DDA15E' },
  { name: 'Preto Manifesto', hex: '#141414' },
  { name: 'Rosa Coletivo', hex: '#E07A5F' },
  { name: 'Azul Proletário', hex: '#3D5A80' }
];

export default function EditProfileModal({ isOpen, onClose }) {
  const { activeMember, updateMemberProfile } = useClub();

  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [roleBadge, setRoleBadge] = useState('');
  const [favBook, setFavBook] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [color, setColor] = useState('#D62828');

  useEffect(() => {
    if (activeMember && isOpen) {
      setName(activeMember.name || '');
      setNickname(activeMember.nickname || '');
      setRoleBadge(activeMember.roleBadge || '');
      setFavBook(activeMember.favBook || '');
      setBio(activeMember.bio || '');
      setAvatar(activeMember.avatar || '');
      setColor(activeMember.color || '#D62828');
    }
  }, [activeMember, isOpen]);

  if (!isOpen || !activeMember) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateMemberProfile(activeMember.id, {
      name: name.trim(),
      nickname: nickname.trim(),
      roleBadge: roleBadge.trim(),
      favBook: favBook.trim(),
      bio: bio.trim(),
      avatar: avatar.trim(),
      color
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative bg-theme-container text-theme-primary rounded-2xl w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 mx-auto border-2 border-theme-border shadow-[8px_8px_0px_var(--shadow-color)] my-4 sm:my-8">
        
        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-theme-muted hover:text-theme-primary p-2 rounded-lg border-2 border-theme-border bg-theme-card hover:bg-theme-gold/20 transition-colors shadow-[2px_2px_0px_var(--shadow-color)]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-theme-red text-xs font-mono font-black uppercase tracking-wider mb-1">
            <span>★</span>
            <span>Credencial Coletiva</span>
            <span className="text-theme-gold">• Não vai lutar contra o fascismo?</span>
          </div>
          <h3 className="font-headline text-2xl sm:text-3xl font-black text-theme-primary">
            Personalizar Credencial ★
          </h3>
          <p className="text-sm text-theme-muted mt-1 font-reading font-semibold">
            Altere seu nome de combate, patente literária, foto, livro predileto e biografia.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Preview do Avatar e Cor */}
          <div className="flex items-center gap-4 p-4 bg-theme-card rounded-xl border-2 border-theme-border shadow-[4px_4px_0px_var(--shadow-color)]">
            <div className="relative shrink-0">
              <img
                src={avatar || AVATAR_PRESETS[0]}
                alt={name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)]"
                style={{ borderColor: color }}
              />
              <span
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-theme-border shadow-sm flex items-center justify-center text-[10px] text-white font-bold"
                style={{ backgroundColor: color }}
              >
                ★
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-headline text-lg font-black text-theme-primary truncate">
                {name || 'Seu Nome'}
              </p>
              <p className="text-xs text-theme-red font-reading font-bold italic truncate">
                {roleBadge || '★ Camarada Leitor(a)'}
              </p>
              <p className="text-[11px] text-theme-muted font-mono truncate mt-0.5">
                {favBook ? `Fav: ${favBook}` : 'Sem livro favorito definido'}
              </p>
            </div>
          </div>

          {/* Nome, Apelido e Insígnia */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1">
                Nome *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Paty (Gatinha Líder)"
                className="w-full text-sm bg-theme-input border-2 border-theme-border rounded-lg px-3 py-2 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1">
                Apelido Felino 🐾
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ex: Comandante Bigodinho"
                className="w-full text-sm bg-theme-input border-2 border-theme-border rounded-lg px-3 py-2 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red font-reading font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1">
                Patente / Cargo ★
              </label>
              <input
                type="text"
                value={roleBadge}
                onChange={(e) => setRoleBadge(e.target.value)}
                placeholder="Ex: ★ Comandante Suprema"
                className="w-full text-sm bg-theme-input border-2 border-theme-border rounded-lg px-3 py-2 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red font-reading font-bold"
              />
            </div>
          </div>

          {/* Livro Favorito da Vida */}
          <div>
            <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1">
              Livro Favorito da Vida
            </label>
            <input
              type="text"
              value={favBook}
              onChange={(e) => setFavBook(e.target.value)}
              placeholder="Ex: Torto Arado"
              className="w-full text-sm bg-theme-input border-2 border-theme-border rounded-lg px-3.5 py-2.5 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red font-reading"
            />
          </div>

          {/* Biografia Literária */}
          <div>
            <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1">
              Biografia Literária
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Conte um pouco sobre suas preferências literárias..."
              className="w-full text-sm bg-theme-input border-2 border-theme-border rounded-lg p-3 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red font-reading italic leading-relaxed"
            />
          </div>

          {/* URL da Foto de Perfil & Presets */}
          <div>
            <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1">
              URL da Foto de Perfil
            </label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://... ou caminho de imagem"
              className="w-full text-xs font-mono bg-theme-input border-2 border-theme-border rounded-lg px-3.5 py-2 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red"
            />

            {/* Presets Rápidos de Fotos */}
            <div className="mt-2.5">
              <span className="text-[11px] text-theme-muted font-mono font-bold block mb-1.5">
                Ou escolha um avatar temático do coletivo:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {AVATAR_PRESETS.map((presetUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(presetUrl)}
                    className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      avatar === presetUrl ? 'border-theme-red scale-105 shadow-[2px_2px_0px_var(--shadow-color)]' : 'border-theme-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={presetUrl} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Seletor de Cores de Destaque */}
          <div>
            <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1.5">
              Cor Temática do Perfil
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setColor(preset.hex)}
                  title={preset.name}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border-2 transition-transform ${
                    color === preset.hex
                      ? 'border-theme-border bg-[#FEF08A] text-[#111111] shadow-[2px_2px_0px_var(--shadow-color)] -translate-y-0.5'
                      : 'border-theme-border bg-theme-card text-theme-muted hover:bg-theme-input'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/30 shrink-0"
                    style={{ backgroundColor: preset.hex }}
                  />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t-2 border-theme-border">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-mono font-bold text-theme-muted hover:bg-theme-card rounded-lg border-2 border-theme-border transition-colors text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto justify-center px-6 py-2.5 bg-theme-red hover:brightness-110 text-white text-xs font-headline font-black uppercase tracking-wider rounded-lg border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-[#FEF08A]" />
              <span>Salvar Alterações ★</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
