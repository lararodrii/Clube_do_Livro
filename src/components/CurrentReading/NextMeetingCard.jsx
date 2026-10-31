import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { useAuth } from '../../context/AuthContext';
import EditMeetingModal from './EditMeetingModal';
import Countdown from './Countdown';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Users, 
  CheckCircle, 
  ExternalLink,
  Pencil
} from 'lucide-react';

export default function NextMeetingCard() {
  const { meeting, activeMember, members, toggleRsvp, triggerComradeConfetti } = useClub();
  const { isAuthenticated, openAuthModal } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isConfirmed = meeting.confirmedMembers?.includes(activeMember.id);
  const confirmedCount = meeting.confirmedMembers?.length || 0;
  const isOnlineOnly = meeting.modality?.includes('Apenas Online');
  const isPresentialOnly = meeting.modality?.includes('Apenas Presencial');

  const handleRsvpClick = () => {
    if (!isAuthenticated) {
      openAuthModal('Faça login para confirmar sua presença na assembleia literária.', 'login');
      return;
    }
    toggleRsvp();
    if (!isConfirmed && triggerComradeConfetti) {
      triggerComradeConfetti();
    }
  };

  const handleOpenEdit = () => {
    if (!isAuthenticated) {
      openAuthModal('Faça login para editar a data, local ou detalhes da assembleia.', 'login');
      return;
    }
    setIsEditModalOpen(true);
  };

  return (
    <div className="retro-card rounded-2xl p-6 sm:p-7 relative bg-theme-container border-2 border-theme-border shadow-[6px_6px_0px_var(--shadow-color)] transition-colors duration-300">
      
      {/* Cabeçalho do Encontro com botão de Edição */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-theme-border mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-theme-red text-white border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] flex items-center justify-center font-black text-sm">
            ★
          </div>
          <div>
            <h3 className="font-headline font-black text-lg sm:text-xl text-theme-primary flex items-center gap-1.5">
              <span>Assembleia Literária & Debate</span>
              <span className="text-theme-red">★</span>
            </h3>
            <p className="text-xs text-theme-muted font-reading font-semibold italic">
              "Não vai lutar contra o fascismo?" • Encontro do Clube
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-black px-3 py-1 rounded bg-[#FEF08A] text-[#111111] font-bold border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)]">
            {meeting.modality}
          </span>
          <button
            type="button"
            onClick={handleOpenEdit}
            title="Editar data, horário, modalidade ou links da reunião"
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold text-theme-primary bg-theme-card hover:bg-theme-container border-2 border-theme-border shadow-[2px_2px_0px_var(--shadow-color)] rounded-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
          >
            <Pencil className="w-3.5 h-3.5 text-theme-red" />
            <span>Editar Reunião</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        
        {/* Bloco de Informações de Local & Horário */}
        <div className="w-full space-y-3.5">
          <div className="flex items-start gap-3 bg-theme-card p-3.5 rounded-xl border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)]">
            <div className="w-8 h-8 rounded-lg bg-theme-container text-theme-gold border border-theme-border flex items-center justify-center shrink-0 mt-0.5">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-theme-red font-mono font-black uppercase tracking-wider flex items-center gap-1">
                <span>★</span> Data Marcada no Calendário
              </p>
              <p className="text-sm font-bold text-theme-primary leading-snug font-headline">
                {new Date(meeting.dateTime).toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })} às {new Date(meeting.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Local Físico (se não for 100% online) */}
          {!isOnlineOnly && (
            <div className="flex items-start gap-3 bg-theme-card p-3.5 rounded-xl border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)]">
              <div className="w-8 h-8 rounded-lg bg-theme-container text-theme-gold border border-theme-border flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-theme-gold font-mono font-black uppercase tracking-wider">Local Presencial</p>
                <p className="text-sm font-bold text-theme-primary leading-snug font-headline">
                  {meeting.location}
                </p>
                <p className="text-xs text-theme-muted mt-0.5 font-reading">
                  {meeting.address}
                </p>
              </div>
            </div>
          )}

          {/* Se for 100% online */}
          {isOnlineOnly && (
            <div className="flex items-start gap-3 bg-theme-card p-3.5 rounded-xl border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)]">
              <div className="w-8 h-8 rounded-lg bg-theme-container text-theme-gold border border-theme-border flex items-center justify-center shrink-0 mt-0.5">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-theme-gold font-mono font-black uppercase tracking-wider">Modalidade da Assembleia</p>
                <p className="text-sm font-bold text-theme-primary leading-snug font-headline">
                  Encontro 100% Online via Google Meet
                </p>
                <p className="text-xs text-theme-muted mt-0.5 font-reading">
                  Prepare suas notas e anotações críticas para o debate coletivo!
                </p>
              </div>
            </div>
          )}

          {/* Botão de Link do Meet */}
          {!isPresentialOnly && meeting.virtualLink && (
            <div className="pt-1">
              <a
                href={meeting.virtualLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-black bg-theme-card hover:bg-theme-container text-theme-primary border-2 border-theme-border shadow-[3px_3px_0px_var(--shadow-color)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
              >
                <Video className="w-4 h-4 text-theme-red" />
                <span>Acessar Sala do Google Meet</span>
                <ExternalLink className="w-3.5 h-3.5 text-theme-muted" />
              </a>
            </div>
          )}
        </div>

        {/* CONTADOR REGRESSIVO DE ALTO CONTRASTE TOTALMENTE CONTIDO */}
        <div className="w-full">
          <Countdown targetDate={meeting.dateTime} />
        </div>

      </div>

      {/* Seção de Confirmação de Presença (RSVP com Grande Destaque) */}
      <div className="mt-6 pt-5 border-t-2 border-theme-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Lista de Confirmados com Avatares */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-theme-red" />
            <span className="text-xs font-mono font-black text-theme-primary uppercase">
              Quórum Confirmado ({confirmedCount} de {members.length} camaradas)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden py-1">
              {meeting.confirmedMembers?.map((memberId) => {
                const member = members.find(m => m.id === memberId);
                if (!member) return null;
                return (
                  <img
                    key={member.id}
                    src={member.avatar}
                    alt={member.name}
                    title={`${member.name} confirmada`}
                    className="w-8 h-8 rounded-lg border-2 border-theme-border object-cover"
                  />
                );
              })}
            </div>
            {confirmedCount === 0 && (
              <span className="text-xs text-theme-muted font-reading italic">
                Nenhuma presença confirmada ainda. Seja a primeira!
              </span>
            )}
          </div>
        </div>

        {/* BOTÃO PROMINENTE DE RSVP */}
        <button
          type="button"
          onClick={handleRsvpClick}
          className={`px-6 py-3 rounded-xl border-2 border-theme-border font-headline font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-transform hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0.5 active:translate-y-0.5 ${
            isConfirmed
              ? 'bg-[#283618] text-[#FEF08A] shadow-[4px_4px_0px_var(--shadow-color)]'
              : 'bg-theme-red text-white font-bold shadow-[5px_5px_0px_var(--shadow-color)] hover:opacity-90'
          }`}
        >
          <CheckCircle className={`w-5 h-5 ${isConfirmed ? 'text-[#FEF08A]' : 'text-white'}`} />
          <span>
            {isConfirmed ? '★ Presença Confirmada!' : '★ Confirmar Minha Presença'}
          </span>
        </button>

      </div>

      {/* Modal de Edição da Reunião */}
      <EditMeetingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

    </div>
  );
}
