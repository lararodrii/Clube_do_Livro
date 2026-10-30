import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import EditProfileModal from './EditProfileModal';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Star, 
  Sparkles, 
  Pencil, 
  Check 
} from 'lucide-react';

export default function MembersSection() {
  const { members, activeMember, setActiveMember, stats, archive, currentReading, quotes, meeting } = useClub();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  return (
    <div className="space-y-8">
      
      {/* PAINEL DE ESTATÍSTICAS GERAIS DO CLUBE NO TOPO */}
      <div className="retro-card rounded-2xl p-6 sm:p-8 bg-white border-2 border-[#1E1E1E] shadow-[6px_6px_0px_#1E1E1E]">
        
        <div className="pb-6 border-b-2 border-[#1E1E1E] mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D62828] border border-[#1E1E1E]" />
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#D62828] flex items-center gap-1.5">
                <span>★</span> Painel Coletivo do Exército da Paty
              </span>
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl font-black text-[#141414] flex items-center gap-2">
              <span>Métricas & Camaradas</span>
              <span className="text-[#D62828]">★</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] mt-1 max-w-xl font-reading font-semibold">
              Acompanhe o ritmo de leitura do coletivo, confira as credenciais de cada camarada e edite seus dados pessoais.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 bg-[#FEF08A] px-4 py-2 rounded-xl border-2 border-[#1E1E1E] text-xs text-[#141414] font-headline font-black shrink-0 shadow-[2px_2px_0px_#1E1E1E]">
            <span className="text-[#D62828]">★</span>
            <span>"Não vai lutar contra o fascismo?"</span>
          </div>
        </div>

        {/* Grid de Métricas Principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-[#FAF7F0] p-4 sm:p-5 rounded-xl border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E]">
            <div className="flex items-center justify-between text-[#D62828] mb-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#57534E]">
                Páginas Lidas
              </span>
              <BookOpen className="w-4 h-4 text-[#D62828]" />
            </div>
            <p className="font-mono text-2xl sm:text-3xl font-black text-[#141414]">
              {(stats?.totalPagesYear || 0).toLocaleString('pt-BR')}
            </p>
            <p className="text-[10px] font-mono text-[#D62828] font-bold mt-1">
              ★ Produção contínua
            </p>
          </div>

          <div className="bg-[#FAF7F0] p-4 sm:p-5 rounded-xl border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E]">
            <div className="flex items-center justify-between text-[#283618] mb-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#57534E]">
                Reuniões Realizadas
              </span>
              <Calendar className="w-4 h-4 text-[#283618]" />
            </div>
            <p className="font-mono text-2xl sm:text-3xl font-black text-[#141414]">
              {stats?.meetingsHeld || 0}
            </p>
            <p className="text-[10px] font-mono text-[#283618] font-bold mt-1">
              ★ Debate agendado
            </p>
          </div>

          <div className="bg-[#FAF7F0] p-4 sm:p-5 rounded-xl border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E]">
            <div className="flex items-center justify-between text-[#BC6C25] mb-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#57534E]">
                Média do Clube
              </span>
              <Star className="w-4 h-4 text-[#BC6C25] fill-[#BC6C25]" />
            </div>
            <p className="font-mono text-2xl sm:text-3xl font-black text-[#141414]">
              ★ {stats?.averageRating || '5.0'}
            </p>
            <p className="text-[10px] font-mono text-[#BC6C25] font-bold mt-1">
              ★ Alto critério crítico
            </p>
          </div>

          <div className="bg-[#FAF7F0] p-4 sm:p-5 rounded-xl border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E]">
            <div className="flex items-center justify-between text-[#EF4444] mb-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#57534E]">
                Gênero em Destaque
              </span>
              <Sparkles className="w-4 h-4 text-[#EF4444]" />
            </div>
            <p className="font-headline text-base sm:text-lg font-black text-[#141414] truncate">
              {stats?.topGenre || 'Literatura'}
            </p>
            <p className="text-[10px] font-mono text-[#57534E] font-bold mt-1">
              ★ Tema da leitura atual
            </p>
          </div>

        </div>
      </div>

      {/* OS 6 MEMBROS DO CLUBE */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-headline text-2xl font-black text-[#141414] flex items-center gap-2">
              <span>As 6 Camaradas do Exército da Paty</span>
              <span className="text-[#D62828]">★</span>
            </h3>
            <p className="text-xs text-[#57534E] font-reading font-semibold italic">
              Conheça as integrantes, personalize seu perfil ou alterne de usuária para testar
            </p>
          </div>
          <span className="text-xs font-mono font-black px-3 py-1 rounded-lg bg-[#FEF08A] text-[#141414] border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] flex items-center gap-1.5">
            <span>★</span> 6 Camaradas Ativas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => {
            const isMe = member.id === activeMember.id;

            // Inclui avaliações do acervo e da leitura atual (Semana 4)
            const allClubReviews = [
              ...(archive || []).flatMap(b => b.reviews || []),
              ...(currentReading?.reviews || [])
            ];
            const reviewsAuthored = allClubReviews.filter(r => r.memberId === member.id).length;
            const quotesAuthored = (quotes || []).filter(q => q.memberId === member.id).length;
            const rsvpConfirmed = meeting.confirmedMembers?.includes(member.id);

            return (
              <div
                key={member.id}
                className={`retro-card rounded-2xl p-6 flex flex-col justify-between relative transition-all duration-200 border-2 border-[#1E1E1E] ${
                  isMe 
                    ? 'bg-[#FDF0ED] shadow-[6px_6px_0px_#D62828] -translate-x-0.5 -translate-y-0.5' 
                    : 'bg-white shadow-[4px_4px_0px_#1E1E1E] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#1E1E1E]'
                }`}
              >
                {/* Badge Ativo */}
                {isMe && (
                  <div className="absolute -top-3 right-6 z-20">
                    <span className="flex items-center gap-1 text-[10px] font-mono font-black uppercase tracking-wider px-3 py-0.5 rounded bg-[#D62828] text-white border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E]">
                      <Check className="w-3 h-3" />
                      ★ Seu Perfil Ativo
                    </span>
                  </div>
                )}

                <div>
                  {/* Topo: Avatar e Identidade */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative shrink-0">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-16 h-16 rounded-xl object-cover border-2 border-[#1E1E1E] shadow-sm"
                      />
                      <span
                        className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full border-2 border-[#1E1E1E] flex items-center justify-center text-[8px] text-white font-bold"
                        style={{ backgroundColor: member.color || '#D62828' }}
                      >
                        ★
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-headline text-lg font-black text-[#141414] truncate">
                          {member.name}
                        </h4>
                        {isMe && (
                          <button
                            type="button"
                            onClick={() => setIsEditProfileOpen(true)}
                            title="Editar meu perfil"
                            className="p-1 hover:bg-[#FEF08A] text-[#141414] rounded border border-[#1E1E1E] transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-[#D62828] font-reading font-bold italic">
                        {member.roleBadge}
                      </p>
                      {member.nickname && (
                        <p className="text-[11px] font-mono font-bold text-[#283618] truncate mt-0.5">
                          🐾 "{member.nickname}"
                        </p>
                      )}
                      <span className="text-[10px] text-[#57534E] font-mono block mt-0.5">
                        No coletivo desde {member.joinedAt}
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-[#141414] leading-relaxed font-reading italic bg-[#FAF7F0] p-3 rounded-xl border border-[#1E1E1E]/30 mb-4">
                    "{member.bio}"
                  </p>

                  {/* Livro Favorito */}
                  <div className="flex items-start gap-2 text-xs mb-4">
                    <span className="text-[#D62828] font-black text-xs shrink-0 mt-0.5">★</span>
                    <div>
                      <span className="text-[#EF4444] text-[10px] font-mono font-bold uppercase tracking-wider block">Leitura de Cabeceira:</span>
                      <strong className="text-[#141414] font-headline">{member.favBook}</strong>
                    </div>
                  </div>

                  {/* Métricas Individuais */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y-2 border-[#1E1E1E] text-center mb-5 font-mono">
                    <div>
                      <span className="font-black text-xs text-[#D62828] block">
                        {reviewsAuthored}
                      </span>
                      <span className="text-[10px] text-[#57534E]">Resenhas</span>
                    </div>

                    <div>
                      <span className="font-black text-xs text-[#D62828] block">
                        {quotesAuthored}
                      </span>
                      <span className="text-[10px] text-[#57534E]">Citações</span>
                    </div>

                    <div>
                      <span className={`font-black text-xs block ${rsvpConfirmed ? 'text-[#283618]' : 'text-stone-400'}`}>
                        {rsvpConfirmed ? 'Presente ★' : 'Pendente'}
                      </span>
                      <span className="text-[10px] text-[#57534E]">Reunião</span>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                {isMe ? (
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(true)}
                    className="w-full py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider bg-[#D62828] hover:bg-[#9E2A2B] text-white border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#FEF08A]" />
                    <span>Editar Meu Perfil ★</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveMember(member.id)}
                    className="w-full py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-white hover:bg-[#FEF08A] text-[#141414] border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <span>Alternar para {member.name.split(' ')[0]}</span>
                  </button>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Edição de Perfil */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

    </div>
  );
}
