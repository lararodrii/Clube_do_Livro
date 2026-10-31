import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { useAuth } from '../../context/AuthContext';
import EditProfileModal from './EditProfileModal';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Star, 
  Sparkles, 
  Pencil, 
  Check,
  ShieldCheck,
  Award,
  BadgeCheck
} from 'lucide-react';

export default function MembersSection() {
  const { members, activeMember, stats, archive, currentReading, quotes, meeting } = useClub();
  const { isAuthenticated, openAuthModal } = useAuth();
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
              Acompanhe o ritmo de leitura do coletivo, confira as credenciais oficiais sindicais de cada camarada e edite seus dados pessoais.
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

      {/* CARTEIRINHAS DE FILIAÇÃO SINDICAL - AS 6 CAMARADAS */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-headline text-2xl font-black text-[#141414] flex items-center gap-2">
              <span>Carteiras de Filiação ao Comitê Literário</span>
              <span className="text-[#D62828]">★</span>
            </h3>
            <p className="text-xs text-[#57534E] font-reading font-semibold italic">
              Registros sindicais oficiais das 6 integrantes com matrícula, foto 3x4, cargo e carimbos acumulados
            </p>
          </div>
          <span className="text-xs font-mono font-black px-3 py-1.5 rounded-lg bg-[#FEF08A] text-[#141414] border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#D62828]" />
            <span>6 Camaradas Homologadas</span>
          </span>
        </div>

        {/* Grid das Carteirinhas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => {
            const isMe = member.id === activeMember.id;
            const matriculaCode = `CL-2026-00${member.id}`;
            const photoUrl = `/avatars/gato${member.id}.jpg`;

            // Avaliações do acervo e da leitura atual
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
                className={`retro-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative transition-all duration-200 border-2 border-[#1E1E1E] overflow-hidden ${
                  isMe 
                    ? 'bg-[#FFFDF9] shadow-[6px_6px_0px_#D62828] -translate-x-0.5 -translate-y-0.5' 
                    : 'bg-[#FFFDF9] shadow-[5px_5px_0px_#1E1E1E] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_#1E1E1E]'
                }`}
              >
                {/* Cabeçalho Oficial da Carteirinha Sindical */}
                <div className="bg-[#141414] text-[#FAF7F0] -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 p-3 px-4 sm:px-5 border-b-2 border-[#1E1E1E] flex items-center justify-between">
                  <div>
                    <span className="text-[8px] sm:text-[9px] font-mono tracking-widest text-[#FEF08A] uppercase font-black block">
                      COMITÊ CENTRAL • EXÉRCITO DA PATY
                    </span>
                    <span className="text-xs font-headline font-black tracking-tight text-white flex items-center gap-1 mt-0.5">
                      <span className="text-[#D62828]">★</span> CARTEIRA DE FILIAÇÃO
                    </span>
                  </div>

                  <span className="text-[10px] font-mono font-black text-[#FEF08A] bg-[#283618] px-2 py-0.5 rounded border border-[#DDA15E]">
                    {matriculaCode}
                  </span>
                </div>

                {/* Badge de Perfil Autenticado */}
                {isMe && (
                  <div className="mt-3 flex justify-end">
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#D62828] text-white border border-[#1E1E1E] shadow-sm">
                      <Check className="w-3 h-3 text-[#FEF08A]" />
                      ★ Seu Perfil Ativo
                    </span>
                  </div>
                )}

                {/* Bloco de Identificação: Foto 3x4 + Dados Sindicais */}
                <div className="mt-3 flex gap-3.5 sm:gap-4 items-start">
                  
                  {/* Foto 3x4 Oficial com Carimbo do Comitê */}
                  <div className="relative shrink-0">
                    <div className="w-20 h-24 sm:w-22 sm:h-26 rounded bg-stone-100 border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] overflow-hidden p-1 bg-white relative">
                      <img
                        src={photoUrl}
                        alt={`Foto 3x4 de ${member.name}`}
                        onError={(e) => {
                          e.target.src = member.avatar;
                        }}
                        className="w-full h-full object-cover rounded-sm grayscale contrast-110"
                      />
                      {/* Selo 3x4 sobreposto */}
                      <span className="absolute bottom-1 right-1 text-[7px] font-mono font-extrabold bg-black/75 text-white px-1 rounded">
                        3x4 OFICIAL
                      </span>
                    </div>

                    {/* Carimbo de Tinta Circular Rotacionado "FILIADA EM DIA" */}
                    <div className="absolute -bottom-2 -right-3 transform -rotate-12 pointer-events-none select-none">
                      <div className="border-2 border-[#D62828] text-[#D62828] rounded-full w-12 h-12 flex flex-col items-center justify-center p-0.5 bg-white/90 shadow-sm opacity-90 text-[7px] font-mono font-black text-center leading-tight">
                        <span>★</span>
                        <span>EM DIA</span>
                      </div>
                    </div>
                  </div>

                  {/* Informações Funcionais */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-headline text-base sm:text-lg font-black text-[#141414] leading-tight truncate">
                        {member.name}
                      </h4>
                      {isMe && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!isAuthenticated) {
                              openAuthModal('Faça login para editar seu perfil!', 'login');
                              return;
                            }
                            setIsEditProfileOpen(true);
                          }}
                          title="Editar meu perfil"
                          className="p-1 hover:bg-[#FEF08A] text-[#141414] rounded border border-[#1E1E1E] transition-colors shrink-0 ml-1"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Cargo em Faixa Retrô */}
                    <div className="mt-1">
                      <span className="inline-block text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#FEF08A] text-[#141414] border border-[#1E1E1E]">
                        {member.roleBadge}
                      </span>
                    </div>

                    {member.nickname && (
                      <p className="text-[11px] font-mono font-bold text-[#283618] truncate mt-1">
                        🐾 "{member.nickname}"
                      </p>
                    )}

                    <span className="text-[9px] text-[#57534E] font-mono block mt-1">
                      Filiação: {member.joinedAt || '2026'}
                    </span>
                  </div>
                </div>

                {/* Declaração Ideológica / Bio */}
                <div className="mt-4 p-2.5 rounded-lg bg-[#FAF7F0] border border-[#1E1E1E]/40 text-xs text-[#141414] font-reading italic leading-relaxed">
                  <span className="text-[9px] font-mono font-black text-[#D62828] uppercase not-italic block mb-0.5">
                    ★ Declaração Ideológica:
                  </span>
                  "{member.bio}"
                </div>

                {/* Leitura de Cabeceira */}
                <div className="mt-3 flex items-start gap-1.5 text-xs">
                  <span className="text-[#D62828] font-black text-xs shrink-0 mt-0.5">★</span>
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono font-bold uppercase text-[#57534E] block">
                      Livro de Cabeceira:
                    </span>
                    <p className="font-headline font-bold text-[#141414] text-xs truncate">
                      {member.favBook}
                    </p>
                  </div>
                </div>

                {/* Selos & Carimbos Acumulados de Leitura */}
                <div className="mt-4 pt-3 border-t-2 border-[#1E1E1E]">
                  <span className="text-[9px] font-mono font-black uppercase tracking-wider text-[#57534E] block mb-2">
                    Carimbos Homologados de Leitura:
                  </span>

                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-[#FAF7F0] border border-[#1E1E1E] text-[#141414] flex items-center gap-1">
                      <Award className="w-3 h-3 text-[#D62828]" />
                      <span>{reviewsAuthored} {reviewsAuthored === 1 ? 'Resenha' : 'Resenhas'}</span>
                    </span>

                    <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-[#FAF7F0] border border-[#1E1E1E] text-[#141414] flex items-center gap-1">
                      <span>★</span>
                      <span>{quotesAuthored} Citações</span>
                    </span>

                    <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border border-[#1E1E1E] flex items-center gap-1 ${
                      rsvpConfirmed ? 'bg-[#283618] text-[#FEF08A]' : 'bg-stone-100 text-stone-500'
                    }`}>
                      <BadgeCheck className="w-3 h-3" />
                      <span>{rsvpConfirmed ? 'Presença Confirmada' : 'Presença Pendente'}</span>
                    </span>
                  </div>
                </div>

                {/* Rodapé da Carteira com Ação */}
                <div className="mt-2 pt-2 border-t border-[#1E1E1E]/20">
                  {isMe ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!isAuthenticated) {
                          openAuthModal('Faça login com seu perfil para editar suas informações!', 'login');
                          return;
                        }
                        setIsEditProfileOpen(true);
                      }}
                      className="w-full py-2 rounded-xl text-xs font-mono font-black uppercase tracking-wider bg-[#D62828] hover:bg-[#9E2A2B] text-white border-2 border-[#1E1E1E] shadow-[2px_2px_0px_#1E1E1E] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#FEF08A]" />
                      <span>Atualizar Minha Carteira ★</span>
                    </button>
                  ) : (
                    <div className="w-full py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-center text-[#57534E] select-none bg-[#FAF7F0] rounded border border-[#1E1E1E]">
                      ★ Registro Sindical Autenticado
                    </div>
                  )}
                </div>

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
