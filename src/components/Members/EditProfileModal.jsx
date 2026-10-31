import React, { useState, useEffect, useRef } from 'react';
import { useClub } from '../../context/ClubContext';
import { X, UserCheck, Sparkles, Image, Palette, BookMarked, FileText, Upload, Loader2, AlertCircle } from 'lucide-react';

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
  const [uploadError, setUploadError] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (activeMember && isOpen) {
      setName(activeMember.name || '');
      setNickname(activeMember.nickname || '');
      setRoleBadge(activeMember.roleBadge || '');
      setFavBook(activeMember.favBook || '');
      setBio(activeMember.bio || '');
      setAvatar(activeMember.avatar || '');
      setColor(activeMember.color || '#D62828');
      setUploadError('');
    }
  }, [activeMember, isOpen]);

  if (!isOpen || !activeMember) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Selecione uma imagem válida (JPG, PNG ou WebP).');
      return;
    }

    setUploadError('');
    setIsProcessingImage(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target.result;
      const img = new window.Image();
      img.onload = () => {
        try {
          const maxDim = 400;
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
          setAvatar(optimized);
          setIsProcessingImage(false);
        } catch {
          setAvatar(rawDataUrl);
          setIsProcessingImage(false);
        }
      };
      img.onerror = () => {
        setUploadError('Erro ao processar imagem.');
        setIsProcessingImage(false);
      };
      img.src = rawDataUrl;
    };
    reader.onerror = () => {
      setUploadError('Falha ao ler o arquivo.');
      setIsProcessingImage(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

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
        
        {/* Cabeçalho com Botão de Fechar sem sobreposição */}
        <div className="flex items-start justify-between gap-3 w-full pb-2 mb-4 relative z-10">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-1.5 text-theme-red text-xs font-mono font-black uppercase tracking-wider mb-1 flex-wrap">
              <span>★</span>
              <span>Credencial Coletiva</span>
              <span className="text-theme-gold">• Não vai lutar contra o fascismo?</span>
            </div>
            <h3 className="font-headline text-xl sm:text-2xl font-black text-theme-primary">
              Editar Ficha da Camarada ★
            </h3>
            <p className="text-xs sm:text-sm text-theme-muted mt-1 font-reading font-semibold">
              Altere seu nome de guerra, cargo no comitê, foto de perfil, livro predileto e biografia.
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

          {/* Foto de Perfil (Avatar): Presets e Upload do Celular/PC */}
          <div>
            <label className="block text-xs font-mono font-bold text-theme-primary uppercase tracking-wider mb-1.5">
              Foto de Perfil (Avatar) ★
            </label>

            {/* Input Oculto de Upload de Arquivo */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {/* Presets de Gatinhos */}
            <div className="mb-3">
              <span className="text-[11px] text-theme-muted font-mono font-bold block mb-1.5">
                Escolha um dos 6 gatinhos padrão do coletivo:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {AVATAR_PRESETS.map((presetUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(presetUrl)}
                    title={`Gatinho Camarada 0${idx + 1}`}
                    className={`w-11 h-11 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      avatar === presetUrl 
                        ? 'border-theme-red scale-105 shadow-[2px_2px_0px_var(--shadow-color)] ring-2 ring-theme-red/50' 
                        : 'border-theme-border opacity-70 hover:opacity-100 hover:scale-102'
                    }`}
                  >
                    <img src={presetUrl} alt={`Gatinho ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Botão de Enviar Foto Própria */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingImage}
                className="w-full py-2.5 px-3 rounded-lg border-2 border-dashed border-theme-border bg-theme-input hover:bg-theme-card text-xs font-mono font-bold text-theme-primary transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:border-theme-red"
              >
                {isProcessingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-theme-red" />
                    <span>Comprimindo imagem...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-theme-red" />
                    <span>Enviar foto própria do celular ou computador</span>
                  </>
                )}
              </button>

              {uploadError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-500 font-mono">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* URL Manual (Opcional) */}
              <div className="pt-1">
                <span className="text-[10px] text-theme-muted font-mono block mb-1">
                  Ou cole o link direto da imagem:
                </span>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://... ou caminho de imagem"
                  className="w-full text-xs font-mono bg-theme-input border-2 border-theme-border rounded-lg px-3 py-1.5 text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-red"
                />
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
