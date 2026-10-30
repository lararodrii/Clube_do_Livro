import React, { useState, useEffect } from 'react';
import { useClub } from '../../context/ClubContext';
import EditMeetingModal from './EditMeetingModal';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Users, 
  CheckCircle, 
  ExternalLink,
  Pencil,
  Timer
} from 'lucide-react';

export default function NextMeetingCard() {
  const { meeting, activeMember, members, toggleRsvp, triggerComradeConfetti } = useClub();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Cálculo do contador regressivo em tempo real
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false
  });

  useEffect(() => {
    function calculateTime() {
      const target = new Date(meeting.dateTime).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (isNaN(target) || difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    }

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [meeting.dateTime]);

  const isConfirmed = meeting.confirmedMembers?.includes(activeMember.id);
  const confirmedCount = meeting.confirmedMembers?.length || 0;
  const isOnlineOnly = meeting.modality?.includes('Apenas Online');
  const isPresentialOnly = meeting.modality?.includes('Apenas Presencial');

  const handleRsvpClick = () => {
    toggleRsvp();
    if (!isConfirmed && triggerComradeConfetti) {
      triggerComradeConfetti();
    }
  };

  return (
    <div className="retro-card rounded-2xl p-6 sm:p-7 relative bg-white border-2 border-[#1E1E1E] shadow-[6px_6px_0px_#1E1E1E]">
      
      {/* Cabeçalho do Encontro com botão de Edição */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-[#1E1E1E] mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#D62828] text-[#FEF08A] border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] flex items-center justify-center font-black text-sm">
            ★
          </div>
          <div>
            <h3 className="font-headline font-black text-lg sm:text-xl text-[#141414] flex items-center gap-1.5">
              <span>Assembleia Literária & Debate</span>
              <span className="text-[#D62828]">★</span>
            </h3>
            <p className="text-xs text-[#57534E] font-reading font-semibold italic">
              "Não vai lutar contra o fascismo?" • Encontro do Clube
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-black px-3 py-1 rounded bg-[#FEF08A] text-[#141414] border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E]">
            {meeting.modality}
          </span>
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            title="Editar data, horário, modalidade ou links da reunião"
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold text-[#141414] bg-white hover:bg-[#FAF7F0] border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] rounded-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
          >
            <Pencil className="w-3.5 h-3.5 text-[#D62828]" />
            <span>Editar Reunião</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Bloco de Informações de Local & Horário */}
        <div className="lg:col-span-6 space-y-3.5">
          <div className="flex items-start gap-3 bg-[#FAF7F0] p-3.5 rounded-xl border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E]">
            <div className="w-8 h-8 rounded-lg bg-[#283618] text-[#FEF08A] border border-[#1E1E1E] flex items-center justify-center shrink-0 mt-0.5">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-[#D62828] font-mono font-black uppercase tracking-wider flex items-center gap-1">
                <span>★</span> Data Marcada no Calendário
              </p>
              <p className="text-sm font-bold text-[#141414] leading-snug font-headline">
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
            <div className="flex items-start gap-3 bg-[#FAF7F0] p-3.5 rounded-xl border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E]">
              <div className="w-8 h-8 rounded-lg bg-[#BC6C25] text-white border border-[#1E1E1E] flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-[#9E2A2B] font-mono font-black uppercase tracking-wider">Local Presencial</p>
                <p className="text-sm font-bold text-[#141414] leading-snug font-headline">
                  {meeting.location}
                </p>
                <p className="text-xs text-[#57534E] mt-0.5 font-reading">
                  {meeting.address}
                </p>
              </div>
            </div>
          )}

          {/* Se for 100% online */}
          {isOnlineOnly && (
            <div className="flex items-start gap-3 bg-[#FAF7F0] p-3.5 rounded-xl border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E]">
              <div className="w-8 h-8 rounded-lg bg-[#283618] text-[#FEF08A] border border-[#1E1E1E] flex items-center justify-center shrink-0 mt-0.5">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-[#283618] font-mono font-black uppercase tracking-wider">Modalidade da Assembleia</p>
                <p className="text-sm font-bold text-[#141414] leading-snug font-headline">
                  Encontro 100% Online via Google Meet
                </p>
                <p className="text-xs text-[#57534E] mt-0.5 font-reading">
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
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-black bg-white hover:bg-[#FAF7F0] text-[#141414] border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
              >
                <Video className="w-4 h-4 text-[#D62828]" />
                <span>Acessar Sala do Google Meet</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#57534E]" />
              </a>
            </div>
          )}
        </div>

        {/* CONTADOR REGRESSIVO DE ALTO CONTRASTE COM BLOCOS NEO-BRUTALISTAS AMPLOS */}
        <div className="lg:col-span-6 bg-[#FAF7F0] p-4 sm:p-6 rounded-2xl border-2 border-[#1E1E1E] shadow-[4px_4px_0px_#1E1E1E] flex flex-col justify-center">
          <div className="flex items-center justify-center gap-1.5 text-center text-xs font-mono font-black uppercase tracking-wider text-[#D62828] mb-4">
            <Timer className="w-4 h-4 text-[#D62828]" />
            <span>Contagem Regressiva para o Debate ★</span>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3.5 text-center w-full max-w-lg mx-auto">
            
            {/* Dias */}
            <div className="bg-[#141414] text-[#FEF08A] py-3.5 px-2 sm:px-3 rounded-xl border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#BC6C25] flex flex-col items-center justify-center min-h-[88px] sm:min-h-[96px] min-w-0 overflow-hidden">
              <span className="font-mono text-2xl sm:text-3xl md:text-4xl font-black block leading-none tabular-nums tracking-normal">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-[11px] text-stone-300 uppercase tracking-widest font-mono font-black mt-2 leading-none">
                Dias
              </span>
            </div>

            {/* Horas */}
            <div className="bg-[#141414] text-[#FEF08A] py-3.5 px-2 sm:px-3 rounded-xl border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#BC6C25] flex flex-col items-center justify-center min-h-[88px] sm:min-h-[96px] min-w-0 overflow-hidden">
              <span className="font-mono text-2xl sm:text-3xl md:text-4xl font-black block leading-none tabular-nums tracking-normal">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-[11px] text-stone-300 uppercase tracking-widest font-mono font-black mt-2 leading-none">
                Horas
              </span>
            </div>

            {/* Minutos */}
            <div className="bg-[#141414] text-[#FEF08A] py-3.5 px-2 sm:px-3 rounded-xl border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#BC6C25] flex flex-col items-center justify-center min-h-[88px] sm:min-h-[96px] min-w-0 overflow-hidden">
              <span className="font-mono text-2xl sm:text-3xl md:text-4xl font-black block leading-none tabular-nums tracking-normal">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-[11px] text-stone-300 uppercase tracking-widest font-mono font-black mt-2 leading-none">
                Min
              </span>
            </div>

            {/* Segundos */}
            <div className="bg-[#141414] text-[#FEF08A] py-3.5 px-2 sm:px-3 rounded-xl border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#BC6C25] flex flex-col items-center justify-center min-h-[88px] sm:min-h-[96px] min-w-0 overflow-hidden">
              <span className="font-mono text-2xl sm:text-3xl md:text-4xl font-black text-[#D62828] block leading-none tabular-nums tracking-normal">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-[11px] text-stone-300 uppercase tracking-widest font-mono font-black mt-2 leading-none">
                Seg
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* Seção de Confirmação de Presença (RSVP com Grande Destaque) */}
      <div className="mt-6 pt-5 border-t-2 border-[#1E1E1E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Lista de Confirmados com Avatares */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-[#D62828]" />
            <span className="text-xs font-mono font-black text-[#141414] uppercase">
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
                    className="w-8 h-8 rounded-lg border-2 border-[#1E1E1E] object-cover"
                  />
                );
              })}
            </div>
            {confirmedCount === 0 && (
              <span className="text-xs text-[#57534E] font-reading italic">
                Nenhuma presença confirmada ainda. Seja a primeira!
              </span>
            )}
          </div>
        </div>

        {/* BOTÃO PROMINENTE DE RSVP */}
        <button
          type="button"
          onClick={handleRsvpClick}
          className={`px-6 py-3 rounded-xl border-2 border-[#1E1E1E] font-headline font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-transform hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0.5 active:translate-y-0.5 ${
            isConfirmed
              ? 'bg-[#283618] text-[#FEF08A] shadow-[4px_4px_0px_#1E1E1E]'
              : 'bg-[#D62828] text-white shadow-[5px_5px_0px_#1E1E1E] hover:bg-[#9E2A2B]'
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
