import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClubProvider } from './context/ClubContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import CurrentReadingCard from './components/CurrentReading/CurrentReadingCard';
import NextMeetingCard from './components/CurrentReading/NextMeetingCard';
import QuotesWall from './components/CurrentReading/QuotesWall';
import VotingBallot from './components/VotingBallot/VotingBallot';
import ArchiveSection from './components/Archive/ArchiveSection';
import MembersSection from './components/Members/MembersSection';
import AuthModal from './components/Auth/AuthModal';
import OnboardingTour from './components/common/OnboardingTour';
import ComradeCat from './components/common/ComradeCat';
import Toast from './components/common/Toast';

function ClubApp() {
  const [activeTab, setActiveTab] = useState('current');
  const [isTourOpen, setIsTourOpen] = useState(false);
  const { currentUser, userProfile } = useAuth();

  // Disparo Automático do Tour no Primeiro Login
  useEffect(() => {
    if (currentUser) {
      const tourKey = `tour_completed_${currentUser.uid}`;
      const hasSeenLocal = localStorage.getItem(tourKey);
      if (!hasSeenLocal && !userProfile?.hasSeenTour) {
        const timer = setTimeout(() => {
          setIsTourOpen(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [currentUser, userProfile]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-300">
      
      {/* Overlay sutil de granulação de papel / filme retrô em toda a tela */}
      <div 
        aria-hidden="true" 
        className="film-grain-overlay pointer-events-none fixed inset-0 opacity-[0.04] z-50" 
      />
      
      {/* Barra de Navegação e Perfil */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenTour={() => setIsTourOpen(true)}
      />

      {/* Conteúdo Principal com Layout Fluido e Responsivo */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 py-2 sm:px-6 sm:py-4 overflow-x-hidden">
        
        {/* TAB 1: LEITURA ATUAL & ENCONTRO */}
        {activeTab === 'current' && (
          <div className="space-y-8 animate-fade-in">
            {/* Destaque do Mês */}
            <CurrentReadingCard />

            {/* Grid com Próxima Reunião e Mural de Citações (Coluna única no celular, 2 colunas no desktop) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="w-full">
                <NextMeetingCard />
              </div>
              <div className="w-full">
                <QuotesWall />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: URNA MENSAL & VOTAÇÃO */}
        {activeTab === 'ballot' && (
          <div className="animate-fade-in">
            <VotingBallot />
          </div>
        )}

        {/* TAB 3: ACERVO HISTÓRICO & RESENHAS */}
        {activeTab === 'archive' && (
          <div className="animate-fade-in">
            <ArchiveSection />
          </div>
        )}

        {/* TAB 4: MEMBROS & ESTATÍSTICAS */}
        {activeTab === 'members' && (
          <div className="animate-fade-in">
            <MembersSection />
          </div>
        )}

      </main>

      {/* Rodapé Retrô Revolucionário do Exército da Paty */}
      <footer className="mt-16 bg-theme-container text-theme-secondary border-t-4 border-theme-border py-12 relative overflow-hidden transition-colors duration-300">
        
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            
            <div className="flex items-center gap-4">
              {/* O Gato Camarada comemorando no rodapé */}
              <div className="shrink-0 bg-theme-card p-1 rounded-xl border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)]">
                <ComradeCat 
                  pose="celebrating" 
                  size="sm" 
                  showBubble={false}
                  className="scale-90"
                />
              </div>
              <div>
                <p className="font-headline font-black text-xl text-theme-primary tracking-wider flex items-center justify-center md:justify-start gap-1.5">
                  <span className="text-theme-red">★</span> Exército da Paty
                </p>
                <p className="text-xs text-theme-muted font-reading font-bold italic">
                  "Não vai lutar contra o fascismo?" • Clube do Livro
                </p>
              </div>
            </div>

            <div className="text-xs text-theme-muted max-w-md leading-relaxed font-mono">
              Curadoria coletiva, debates democráticos e literatura crítica. O Clube do Livro das camaradas.
            </div>

            <div className="text-xs text-[#111111] flex items-center gap-1.5 font-mono font-bold bg-[#FEF08A] px-3.5 py-2 rounded-lg border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)]">
              <span className="text-theme-red text-sm">★</span>
              <span>"Não vai lutar contra o fascismo?"</span>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-theme-border/20 text-center text-[11px] font-mono text-theme-muted">
            © {new Date().getFullYear()} Exército da Paty ★ O Comitê Literário dos Camaradas. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      {/* Tour Guiado Passo a Passo de Onboarding */}
      <OnboardingTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        setActiveTab={setActiveTab}
      />

      {/* Modal Global de Acesso e Autenticação das Camaradas */}
      <AuthModal />

      {/* Sistema de Notificações Toast */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ClubProvider>
          <ClubApp />
        </ClubProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
