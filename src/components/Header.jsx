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
    <header className="sticky top-0 z-40 bg-[#FAF7F0] border-b-2 border-[#1E1E1E] shadow-[0_3px_0px_0px_#1E1E1E]">
      
      {/* Faixa Superior Editorial com Layout Empilhável Responsivo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 min-h-[5.5rem] py-3">
          
          {/* Logo e Nome do Clube com o Mascote O Gato Camarada */}
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
            
            {/* O GATO CAMARADA (Mascote Oficial Fixo - Pose Grumpy e Conselhos Interativos) */}
            <div className="flex items-center shrink-0">
              <ComradeCat 
                pose="grumpy" 
                size="sm" 
                showBubble={true}
                bubblePosition="right"
                className="scale-90 sm:scale-100"
              />
            </div>

            {/* Título & Slogan Oficial */}
            <div className="border-l-2 border-[#1E1E1E] pl-3 sm:pl-4">
              <div className="flex items-center gap-2">
                <h1 
                  onClick={() => setActiveTab('current')}
                  className="font-headline font-black tracking-tight text-xl sm:text-2xl md:text-3xl text-[#D62828] hover:text-[#9E2A2B] cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <span className="text-[#D62828]">★</span>
                  <span>Exército da Paty</span>
                </h1>
                <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#D62828] text-white font-extrabold border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E]">
                  ★ Clube do Livro
                </span>
              </div>
              <p className="text-xs text-[#283618] font-reading font-bold italic tracking-wide mt-0.5">
                "Não vai lutar contra o fascismo?" • Est. 2026
              </p>
            </div>
          </div>

          {/* Área de Ações: Seletor de Tema, Reset e Perfil Ativo */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-2.5 w-full sm:w-auto">
            
            {/* SELETOR DE TEMAS CRIATIVOS ("Modo Ideológico") */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowThemeSelector(!showThemeSelector)}
                title={`Modo Ideológico Atual: ${currentThemeInfo.name}`}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-black bg-white hover:bg-[#FAF7F0] text-[#141414] border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] rounded-xl transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
              >
                <span className="text-sm">{currentThemeInfo.icon}</span>
                <span className="hidden md:inline">{currentThemeInfo.name}</span>
                <Palette className="w-3.5 h-3.5 text-[#D62828]" />
              </button>

              {/* Popover / Dropdown de Temas */}
              {showThemeSelector && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl border-2 border-[#1E1E1E] shadow-[6px_6px_0px_#1E1E1E] z-50 p-3 space-y-2 animate-fade-in text-left">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-[#1E1E1E]">
                    <div className="flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-[#D62828]" />
                      <span className="text-xs font-headline font-black uppercase text-[#141414]">Modo Ideológico ★</span>
                    </div>
                    <button
                      onClick={() => setShowThemeSelector(false)}
                      className="p-1 rounded text-stone-500 hover:text-black"
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
                              ? 'border-[#D62828] bg-[#FDF0ED] shadow-[3px_3px_0px_#1E1E1E] -translate-x-0.5'
                              : 'border-[#1E1E1E] bg-[#FAF7F0] hover:bg-white shadow-[2px_2px_0px_#1E1E1E]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl p-1 bg-white rounded-lg border border-[#1E1E1E] shrink-0">{t.icon}</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-headline font-black text-[#141414]">{t.name}</span>
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-stone-200 text-stone-700 font-bold">{t.badge}</span>
                              </div>
                              <p className="text-[10px] text-[#57534E] font-reading leading-tight mt-0.5">{t.subtitle}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <span className="w-3.5 h-3.5 rounded-full border border-black shadow-sm" style={{ backgroundColor: t.primaryColor }} />
                            <span className="w-3.5 h-3.5 rounded-full border border-black shadow-sm" style={{ backgroundColor: t.bgColor }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>



            {/* ÁREA DE AUTENTICAÇÃO / PERFIL ATIVO (TRAVADO NA INTEGRANTE LOGADA) */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* CARD DE PERFIL FIXO E ESTÁTICO (SEM DROPDOWN DE TROCAR LIVREMENTE) */}
                <div 
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-white border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E] select-none"
                  title={`Conectada como ${activeMember.name} (${currentUser?.email})`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={activeMember.avatar}
                      alt={activeMember.name}
                      className="w-8 h-8 rounded-lg object-cover border border-[#1E1E1E]"
                    />
                    <span 
                      className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border border-white bg-[#283618] flex items-center justify-center text-[7px] text-[#FEF08A] font-bold shadow-sm"
                      title="Sessão autenticada no comitê"
                    >
                      ★
                    </span>
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-black text-[#141414] leading-tight flex items-center gap-1.5">
                      <span>{activeMember.name.split(' ')[0]}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" title="Sessão ativa e sincronizada" />
                    </p>
                    <p className="text-[10px] text-[#283618] font-mono font-bold leading-none truncate max-w-[130px] mt-0.5">
                      {activeMember.roleBadge}
                    </p>
                  </div>
                </div>

                {/* Botão de Sair / Logout ao lado do perfil */}
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  title="Sair da sessão / Encerrar conta para alternar de perfil"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold text-stone-700 hover:text-[#D62828] bg-white hover:bg-[#FDF0ED] border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
                >
                  <LogOut className="w-4 h-4 text-[#D62828]" />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              /* Se NÃO estiver autenticado: Botão Destacado de Acesso das Camaradas */
              <button
                type="button"
                onClick={() => openAuthModal('Faça login com sua conta para votar, debater e registrar presenças no comitê!', 'login')}
                className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl bg-[#D62828] hover:bg-[#9E2A2B] text-white border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E] text-xs font-headline font-black uppercase tracking-wider transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
              >
                <LogIn className="w-4 h-4 text-[#FEF08A]" />
                <span>Acesso das Camaradas ★</span>
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Barra de Navegação por Abas (Tabs 100% Responsivas: Grid 2x2 no Mobile, Flex no Desktop, sem cortes) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t-2 border-[#1E1E1E] bg-[#F6F2E9]">
        <nav className="grid grid-cols-2 md:flex md:flex-wrap items-center justify-center gap-2 py-2.5 w-full" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full md:w-auto flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 py-2 px-2.5 sm:px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all border-2 border-[#1E1E1E] ${
                  isActive
                    ? 'bg-[#D62828] text-white shadow-[3px_3px_0px_#1E1E1E] -translate-y-0.5'
                    : 'bg-white text-[#141414] hover:bg-[#FAF7F0] shadow-[2px_2px_0px_#1E1E1E] hover:-translate-y-0.5'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FEF08A]' : 'text-[#D62828]'}`} />
                <span className="truncate">{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] sm:text-[10px] uppercase font-mono font-black tracking-wider px-1.5 sm:px-2 py-0.5 rounded shrink-0 ${
                    isActive ? 'bg-[#FEF08A] text-[#141414]' : 'bg-[#D62828] text-white'
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
