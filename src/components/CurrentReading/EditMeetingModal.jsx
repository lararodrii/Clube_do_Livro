import React, { useState, useEffect } from 'react';
import { useClub } from '../../context/ClubContext';
import { 
  X, 
  Calendar, 
  Video, 
  MapPin, 
  Save,
  Globe
} from 'lucide-react';

const MODALITIES = [
  'Apenas Online (Google Meet)',
  'Híbrida (Presencial + Google Meet)',
  'Apenas Presencial'
];

export default function EditMeetingModal({ isOpen, onClose }) {
  const { meeting, updateMeeting } = useClub();

  // Converte data ISO ou string para o formato 'YYYY-MM-DDTHH:mm' sem desvios de fuso horário
  const getFormattedDateTimeLocal = (dateVal) => {
    try {
      if (!dateVal) return '2026-11-25T20:00';
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '2026-11-25T20:00';
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '2026-11-25T20:00';
    }
  };

  const [dateTimeLocal, setDateTimeLocal] = useState('');
  const [modality, setModality] = useState('Apenas Online (Google Meet)');
  const [virtualLink, setVirtualLink] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (meeting && isOpen) {
      setDateTimeLocal(getFormattedDateTimeLocal(meeting.dateTime));
      setModality(meeting.modality || 'Apenas Online (Google Meet)');
      setVirtualLink(meeting.virtualLink || 'https://meet.google.com/exercito-da-paty');
      setLocation(meeting.location || '');
      setAddress(meeting.address || '');
    }
  }, [meeting, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!dateTimeLocal) return;

    // Tratamento rigoroso de data e hora sem erro de fuso horário
    const [datePart, timePart] = dateTimeLocal.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = (timePart || '20:00').split(':').map(Number);
    const validDate = new Date(year, month - 1, day, hours, minutes, 0);

    const weekday = validDate.toLocaleDateString('pt-BR', { weekday: 'long' });
    const formattedDate = `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${validDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const isOnlineOnly = modality.includes('Apenas Online');

    const dadosAtualizados = {
      ...(meeting || {}),
      dateTime: validDate.toISOString(),
      formattedDate,
      modality,
      virtualLink: virtualLink.trim() || 'https://meet.google.com/exercito-da-paty',
      location: isOnlineOnly ? 'Encontro 100% Online via Google Meet' : location.trim() || 'Livraria / Espaço Cultural',
      address: isOnlineOnly ? 'Sala Virtual Google Meet' : address.trim() || 'Endereço a confirmar'
    };

    // Atualiza o encontro (sincroniza diretamente na nuvem via Firestore)
    updateMeeting(dadosAtualizados);

    // Fecha o modal imediatamente
    onClose();
  };

  const isOnlineOnly = modality.includes('Apenas Online');
  const isPresentialOnly = modality.includes('Apenas Presencial');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative bg-[#FAF7F0] rounded-2xl max-w-xl w-full p-6 sm:p-8 border-2 border-[#1E1E1E] shadow-[8px_8px_0px_#1E1E1E] my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-500 hover:text-[#141414] p-2 rounded-lg border-2 border-[#1E1E1E] bg-white hover:bg-[#FEF08A] transition-colors shadow-[2px_2px_0px_#1E1E1E]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[#D62828] text-xs font-mono font-black uppercase tracking-wider mb-1">
            <span>★</span>
            <span>Assembleia do Coletivo</span>
            <span className="text-[#283618]">• Não vai lutar contra o fascismo?</span>
          </div>
          <h3 className="font-headline text-2xl sm:text-3xl font-black text-[#141414]">
            Editar Detalhes do Encontro ★
          </h3>
          <p className="text-sm text-[#57534E] mt-1 font-reading font-semibold">
            Altere data, horário, modalidade (100% online, híbrida ou presencial) e link da reunião.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Data e Hora */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-wider mb-1">
              Data & Horário do Encontro *
            </label>
            <input
              type="datetime-local"
              required
              value={dateTimeLocal}
              onChange={(e) => setDateTimeLocal(e.target.value)}
              className="w-full text-sm bg-white border-2 border-[#1E1E1E] rounded-lg px-3.5 py-2.5 text-[#141414] focus:outline-none font-mono"
            />
          </div>

          {/* Modalidade */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-wider mb-1.5">
              Modalidade do Encontro *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {MODALITIES.map((mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => setModality(mod)}
                  className={`p-3 rounded-xl text-xs font-mono font-bold border-2 border-[#1E1E1E] text-center transition-transform flex flex-col items-center justify-center gap-1.5 ${
                    modality === mod
                      ? 'bg-[#D62828] text-white shadow-[3px_3px_0px_#1E1E1E] -translate-y-0.5'
                      : 'bg-white hover:bg-[#FAF7F0] text-[#141414] shadow-[2px_2px_0px_#1E1E1E]'
                  }`}
                >
                  {mod.includes('Online') ? (
                    <Video className={`w-4 h-4 ${modality === mod ? 'text-[#FEF08A]' : 'text-[#D62828]'}`} />
                  ) : mod.includes('Híbrida') ? (
                    <Globe className={`w-4 h-4 ${modality === mod ? 'text-[#FEF08A]' : 'text-[#BC6C25]'}`} />
                  ) : (
                    <MapPin className={`w-4 h-4 ${modality === mod ? 'text-[#FEF08A]' : 'text-[#283618]'}`} />
                  )}
                  <span>{mod.split('(')[0].trim()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Link do Google Meet (apenas se online ou híbrida) */}
          {!isPresentialOnly && (
            <div>
              <label className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-wider mb-1">
                Link da Reunião Virtual (Google Meet)
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={virtualLink}
                  onChange={(e) => setVirtualLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full text-xs sm:text-sm bg-white border-2 border-[#1E1E1E] rounded-lg pl-9 pr-3 py-2.5 text-[#141414] focus:outline-none font-mono"
                />
                <Video className="w-4 h-4 text-[#D62828] absolute left-3 top-3" />
              </div>
            </div>
          )}

          {/* Local Físico */}
          {!isOnlineOnly ? (
            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-wider mb-1">
                  Nome do Local Presencial
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Livraria ou Café"
                  className="w-full text-sm bg-white border-2 border-[#1E1E1E] rounded-lg px-3.5 py-2.5 text-[#141414] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-wider mb-1">
                  Endereço Completo
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Rua das Flores, 123"
                  className="w-full text-sm bg-white border-2 border-[#1E1E1E] rounded-lg px-3.5 py-2.5 text-[#141414] focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-white rounded-xl border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] text-xs text-[#141414] flex items-center gap-2">
              <span className="text-[#D62828] font-bold text-sm">★</span>
              <span>
                Modalidade configurada como <strong>100% Online</strong>. O link do Google Meet conectará todo o Exército da Paty.
              </span>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-[#1E1E1E]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-mono font-bold text-[#57534E] hover:bg-stone-200 rounded-lg border-2 border-[#1E1E1E] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#D62828] hover:bg-[#9E2A2B] text-white text-xs font-headline font-black uppercase tracking-wider rounded-lg border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-[#FEF08A]" />
              <span>Salvar Encontro ★</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
