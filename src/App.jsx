import React, { useState } from 'react';
import { ClubProvider } from './context/ClubContext';
import Header from './components/Header';
import CurrentReadingCard from './components/CurrentReading/CurrentReadingCard';
import NextMeetingCard from './components/CurrentReading/NextMeetingCard';
import QuotesWall from './components/CurrentReading/QuotesWall';
import VotingBallot from './components/VotingBallot/VotingBallot';
import ArchiveSection from './components/Archive/ArchiveSection';
import MembersSection from './components/Members/MembersSection';
import ComradeCat from './components/common/ComradeCat';
import Toast from './components/common/Toast';

function ClubApp() {
  const [activeTab, setActiveTab] = useState('current');

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F2E9] text-[#141414] relative overflow-x-hidden selection:bg-[#D62828] selection:text-white">
      
      {/* Barra de Navegação e Perfil */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Conteúdo Principal com Layout Fluido e Responsivo */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        
        {/* TAB 1: LEITURA ATUAL & ENCONTRO */}
        {activeTab === 'current' && (
          <div className="space-y-8 animate-fade-in">
            {/* Destaque do Mês */}
            <CurrentReadingCard />

            {/* Grid com Próxima Reunião e Mural de Citações */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 w-full">
                <NextMeetingCard />
              </div>
              <div className="lg:col-span-7 w-full">
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
      <footer className="mt-16 bg-[#141414] text-stone-200 border-t-4 border-[#D62828] py-12 relative overflow-hidden">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            
            <div className="flex items-center gap-4">
              {/* O Gato Camarada comemorando no rodapé */}
              <div className="shrink-0 bg-[#FAF7F0] p-1 rounded-xl border-2 border-[#D62828] shadow-[3px_3px_0px_#D62828]">
                <ComradeCat 
                  pose="celebrating" 
                  size="sm" 
                  showBubble={false}
                  className="scale-90"
                />
              </div>
              <div>
                <p className="font-headline font-black text-xl text-white tracking-wider flex items-center justify-center md:justify-start gap-1.5">
                  <span className="text-[#D62828]">★</span> Exército da Paty
                </p>
                <p className="text-xs text-[#FEF08A] font-reading font-bold italic">
                  "Não vai lutar contra o fascismo?" • Clube do Livro
                </p>
              </div>
            </div>

            <div className="text-xs text-stone-400 max-w-md leading-relaxed font-mono">
              Integração nativa com a Google Books API. Persistência de dados local no navegador. Curadoria literária e debates entre camaradas.
            </div>

            <div className="text-xs text-[#FEF08A] flex items-center gap-1.5 font-mono font-bold bg-[#283618] px-3.5 py-2 rounded-lg border border-[#DDA15E]">
              <span className="text-[#D62828] text-sm">★</span>
              <span>"Não vai lutar contra o fascismo?"</span>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-stone-800 text-center text-[11px] font-mono text-stone-500">
            © {new Date().getFullYear()} Exército da Paty ★ O Comitê Literário dos Camaradas. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      {/* Sistema de Notificações Toast */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <ClubProvider>
      <ClubApp />
    </ClubProvider>
  );
}
