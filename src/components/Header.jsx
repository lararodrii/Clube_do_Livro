import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { useTheme } from '../context/ThemeContext';
import EditProfileModal from './Members/EditProfileModal';
import ComradeCat from './common/ComradeCat';
import { 
  BookOpen, 
  Vote, 
  Library, 
  BarChart3, 
  LogIn, 
  LogOut,
  Palette,
  X,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ activeTab, setActiveTab }) {
  const { activeMember, ballot, showToast } = useClub();
  const { currentUser, isAuthenticated, logout, openAuthModal } = useAuth();
  const { theme, setTheme, themes, currentThemeInfo } = useTheme();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const handleLogoutClick = async () => {
    await logout();
    showToast('Sessão encerrada com sucesso. Até logo, camarada! 🐾★', 'info');
  };

  const tabs = [
    { id: 'current', label: 'Leitura & Encontro', icon: BookOpen },
    { 
      id: 'ballot', 
      label: 'Urna Mensal', 
      icon: Vote, 
      badge: ballot.status === 'open' ? 'Aberta' : null 
    },
    { id: 'archive', label: 'Acervo & Resenhas', icon: Library },
    { id: 'members', label: 'Membros & Métricas', icon: BarChart3 }
  ];

  return (
    <header className="sticky top-0 z-40 bg-theme-container border-b-2 border-theme-border shadow-[0_3px_0px_0px_var(--shadow-color)] transition-colors duration-300">
      
      {/* Faixa Superior Editorial com Layout Empilhável Responsivo Esticado */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8 min-h-[5.5rem] py-3">
        
        {/* LAYOUT DESKTOP / TABLET E GERAL */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center justify-between lg:justify-start gap-4 shrink-0">
          {/* Logo e Nome do Clube com o Mascote O Gato Camarada */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            {/* O GATO CAMARADA */}
            <div className="flex items-center shrink-0">
              <ComradeCat 
                pose="grumpy" 
                size="sm" 
                showBubble={true}
                bubblePosition="right"
              />
            </div>

            {/* Título & Slogan Oficial */}
            <div className="border-l-2 border-theme-border pl-3 md:pl-4">
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                <h1 
                  onClick={() => setActiveTab('current')}
                  className="font-headline font-black tracking-tight text-xl sm:text-2xl md:text-3xl text-theme-red hover:opacity-90 cursor-pointer transition-colors flex items-center gap-1.5 sm:whitespace-nowrap"
                >
                  <span className="text-theme-red">★</span>
                  <span>Exército da Paty</span>
                </h1>
                <span className="whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono uppercase rounded bg-theme-red text-white font-extrabold border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)]">
                  ★ CLUBE DO LIVRO
                </span>
              </div>
              <p className="text-xs sm:text-sm text-theme-muted font-reading font-bold italic tracking-wide mt-0.5 sm:whitespace-nowrap">
                "Não vai lutar contra o fascismo?" • Est. 2026
              </p>
            </div>
          </div>
        </div>

        {/* Área de Ações: Seletor de Tema e Perfil Ativo */}
        <div className="flex items-center justify-center sm:justify-end gap-2.5 w-full lg:w-auto shrink-0">
          {/* SELETOR DE TEMAS CRIATIVOS ("Modo Ideológico") */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              title={`Modo Ideológico Atual: ${currentThemeInfo.name}`}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-black bg-theme-card hover:bg-theme-container text-theme-primary border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] rounded-xl transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
            >
              <span className="text-sm">{currentThemeInfo.icon}</span>
              <span className="inline">{currentThemeInfo.name}</span>
              <Palette className="w-3.5 h-3.5 text-theme-red" />
            </button>
          </div>

          {/* ÁREA DE AUTENTICAÇÃO / PERFIL ATIVO */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-theme-card border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] select-none"
                title={`Conectada como ${activeMember.name} (${currentUser?.email})`}
              >
                <div className="relative shrink-0">
                  <img
                    src={activeMember.avatar}
                    alt={activeMember.name}
                    className="w-8 h-8 rounded-lg object-cover border border-theme-border"
                  />
                  <span 
                    className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border border-theme-border bg-theme-container flex items-center justify-center text-[7px] text-theme-gold font-bold shadow-sm"
                    title="Sessão autenticada no comitê"
                  >
                    ★
                  </span>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-black text-theme-primary leading-tight flex items-center gap-1.5">
                    <span>{activeMember.name.split(' ')[0]}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Sessão ativa e sincronizada" />
                  </p>
                  <p className="text-[10px] text-theme-muted font-mono font-bold leading-none truncate max-w-[130px] mt-0.5">
                    {activeMember.roleBadge}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogoutClick}
                title="Sair da sessão / Encerrar conta para alternar de perfil"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold text-theme-muted hover:text-theme-red bg-theme-card hover:bg-theme-container border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
              >
                <LogOut className="w-4 h-4 text-theme-red" />
                <span>Sair</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('Faça login com sua conta para votar, debater e registrar presenças no comitê!', 'login')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-theme-red hover:opacity-90 text-white font-bold border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] text-xs font-headline font-black uppercase tracking-wider transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
            >
              <LogIn className="w-4 h-4 text-[#FEF08A]" />
              <span>Acesso das Camaradas ★</span>
            </button>
          )}
        </div>

        {/* LAYOUT MOBILE (< sm / 320px a 639px): 2 Linhas Limpas e 100% Fluídas */}
        <div className="flex sm:hidden flex-col gap-2.5 py-2.5 w-full">
          {/* Linha 1: Card da usuária logada (compacto), seletor de tema e botão "Sair" alinhados no topo */}
          <div className="w-full flex items-center justify-between gap-2">
            {isAuthenticated ? (
              <>
                <div 
                  className="flex items-center gap-2 p-1 pr-2.5 rounded-xl bg-theme-card border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] select-none min-w-0"
                  title={`Conectada como ${activeMember.name}`}
                >
                  <img
                    src={activeMember.avatar}
                    alt={activeMember.name}
                    className="w-7 h-7 rounded-lg object-cover border border-theme-border shrink-0"
                  />
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-black text-theme-primary leading-tight truncate">
                      {activeMember.name.split(' ')[0]}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowThemeSelector(!showThemeSelector)}
                    title={`Modo Ideológico: ${currentThemeInfo.name}`}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono font-black bg-theme-card hover:bg-theme-container text-theme-primary border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] rounded-xl"
                  >
                    <span>{currentThemeInfo.icon}</span>
                    <Palette className="w-3.5 h-3.5 text-theme-red" />
                  </button>

                  <button
                    type="button"
                    onClick={handleLogoutClick}
                    title="Sair da sessão"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold text-theme-muted hover:text-theme-red bg-theme-card hover:bg-theme-container border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)]"
                  >
                    <LogOut className="w-3.5 h-3.5 text-theme-red" />
                    <span>Sair</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowThemeSelector(!showThemeSelector)}
                  title={`Modo: ${currentThemeInfo.name}`}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono font-black bg-theme-card border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] rounded-xl text-theme-primary"
                >
                  <span>{currentThemeInfo.icon}</span>
                  <Palette className="w-3.5 h-3.5 text-theme-red" />
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('Faça login com sua conta para votar e debater!', 'login')}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-theme-red text-white font-bold border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] text-xs font-headline font-black uppercase tracking-wider text-center"
                >
                  Acesso das Camaradas ★
                </button>
              </div>
            )}
          </div>

          {/* Linha 2: O Gato Camarada ao lado do balão de fala */}
          <div className="w-full flex items-center gap-2">
            <ComradeCat 
              pose="grumpy" 
              size="sm" 
              showBubble={true}
              bubblePosition="right"
              className="w-full"
            />
          </div>
        </div>

        {/* POPOVER / DROPDOWN DE TEMAS COMPARTILHADO */}
        {showThemeSelector && (
          <div className="absolute right-3 sm:right-6 top-16 sm:top-20 mt-2 w-72 sm:w-80 bg-theme-card rounded-2xl border-2 border-theme-border shadow-[6px_6px_0px_var(--shadow-color)] z-50 p-3 space-y-2 animate-fade-in text-left text-theme-primary">
            <div className="flex items-center justify-between pb-2 border-b-2 border-theme-border">
              <div className="flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-theme-red" />
                <span className="text-xs font-headline font-black uppercase text-theme-primary">Modo Ideológico ★</span>
              </div>
              <button
                onClick={() => setShowThemeSelector(false)}
                className="p-1 rounded text-theme-muted hover:text-theme-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {themes.map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setShowThemeSelector(false);
                      showToast(`Modo Ideológico alterado para "${t.name}"! ★`, 'info');
                    }}
                    className={`w-full p-2.5 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-theme-red bg-theme-container shadow-[3px_3px_0px_var(--shadow-color)] -translate-x-0.5'
                        : 'border-theme-border bg-theme-card hover:bg-theme-container shadow-[2px_2px_0px_var(--shadow-color)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl p-1 bg-theme-container rounded-lg border border-theme-border shrink-0">{t.icon}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-headline font-black text-theme-primary">{t.name}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-theme-container text-theme-muted border border-theme-border font-bold">{t.badge}</span>
                        </div>
                        <p className="text-[10px] text-theme-muted font-reading leading-tight mt-0.5">{t.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <span className="w-3.5 h-3.5 rounded-full border border-theme-border shadow-sm" style={{ backgroundColor: t.primaryColor }} />
                      <span className="w-3.5 h-3.5 rounded-full border border-theme-border shadow-sm" style={{ backgroundColor: t.bgColor }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Barra de Navegação das 4 Abas (Navbar Esticada de Ponta a Ponta) */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 border-t-2 border-theme-border bg-theme-page transition-colors duration-300">
        <nav className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full py-3" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full justify-center whitespace-nowrap py-3 px-4 flex items-center gap-2 text-center rounded-xl text-xs sm:text-sm font-extrabold transition-all border-2 border-theme-border ${
                  isActive
                    ? 'bg-theme-red text-white font-bold shadow-[3px_3px_0px_var(--shadow-color)] -translate-y-0.5'
                    : 'bg-theme-card text-theme-primary hover:bg-theme-container shadow-[2px_2px_0px_var(--shadow-color)] hover:-translate-y-0.5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isActive ? 'text-[#FEF08A]' : 'text-theme-red'}`} />
                <span className="whitespace-nowrap">{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[8px] sm:text-[9px] uppercase font-mono font-black tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                    isActive ? 'bg-[#FEF08A] text-[#111111] font-bold' : 'bg-theme-red text-white font-bold'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Modal de Edição de Perfil */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

    </header>
  );
}
