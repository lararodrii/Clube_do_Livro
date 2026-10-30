import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import EditProfileModal from './Members/EditProfileModal';
import ComradeCat from './common/ComradeCat';
import { 
  RotateCcw, 
  BookOpen, 
  Vote, 
  Library, 
  BarChart3, 
  LogIn, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ activeTab, setActiveTab }) {
  const { activeMember, resetToDefaults, ballot, showToast } = useClub();
  const { currentUser, isAuthenticated, logout, openAuthModal } = useAuth();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

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
      
      {/* Faixa Superior Editorial */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[5.5rem] py-2">
          
          {/* Logo e Nome do Clube com o Mascote O Gato Camarada */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* O GATO CAMARADA (Mascote Oficial Fixo - Pose Grumpy) */}
            <div className="flex items-center">
              <ComradeCat 
                pose="grumpy" 
                size="sm" 
                showBubble={true}
                customQuote="Não vai lutar contra o fascismo?"
                bubblePosition="right"
                className="scale-90 sm:scale-100"
              />
            </div>

            {/* Título & Slogan Oficial */}
            <div className="border-l-2 border-[#1E1E1E] pl-3 sm:pl-4 hidden xs:block">
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

          {/* Área de Ações e Seletor de Perfil */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Botão de Restaurar Dados (Reset) */}
            <button
              onClick={() => setShowResetConfirm(true)}
              title="Restaurar dados padrão do clube"
              className="p-2 text-[#57534E] hover:text-[#D62828] bg-white hover:bg-[#FDF0ED] border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] rounded-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* ÁREA DE AUTENTICAÇÃO / PERFIL ATIVO */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* CARD DE PERFIL FIXO E ESTÁTICO (SEM DROPDOWN, SEM SETA DE ALTERNAR) */}
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

      {/* Barra de Navegação por Abas (Tabs em estilo Carimbo Retrô) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t-2 border-[#1E1E1E] bg-[#F6F2E9]">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto py-2.5 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all border-2 border-[#1E1E1E] ${
                  isActive
                    ? 'bg-[#D62828] text-white shadow-[3px_3px_0px_#1E1E1E] -translate-y-0.5'
                    : 'bg-white text-[#141414] hover:bg-[#FAF7F0] shadow-[2px_2px_0px_#1E1E1E] hover:-translate-y-0.5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FEF08A]' : 'text-[#D62828]'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] uppercase font-mono font-black tracking-wider px-2 py-0.5 rounded ${
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

      {/* Modal de Confirmação de Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FAF7F0] rounded-2xl max-w-md w-full p-6 border-2 border-[#1E1E1E] shadow-[6px_6px_0px_#1E1E1E]">
            <div className="flex items-center gap-2 text-[#D62828] font-black mb-2">
              <span className="text-xl">★</span>
              <h3 className="font-headline text-xl text-[#141414]">
                Limpar e restaurar dados?
              </h3>
            </div>
            <p className="text-xs text-[#57534E] mb-6 leading-relaxed font-reading">
              Isso deixará a urna, o mural de citações e o acervo limpos e prontos para novas recomendações dos camaradas do Exército da Paty.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-bold text-[#141414] bg-white hover:bg-stone-100 rounded-lg border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetToDefaults();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 text-xs font-extrabold bg-[#D62828] hover:bg-[#9E2A2B] text-white rounded-lg border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                Sim, Limpar Tudo ★
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
