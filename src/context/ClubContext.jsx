import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { db } from '../services/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import {
  INITIAL_MEMBERS,
  INITIAL_CURRENT_READING,
  INITIAL_MEETING,
  INITIAL_QUOTES,
  INITIAL_BALLOT,
  INITIAL_ARCHIVE,
  INITIAL_NOTIFICATIONS,
  INITIAL_HIGHLIGHTS
} from '../data/initialData';
import { useAuth } from './AuthContext';
import {
  findDuplicateBookInBallot,
  isCurrentReadingBook,
  deduplicateBallotBooks
} from '../utils/bookDuplicateCheck';
import { mergeHighlightsIntoDossier } from '../utils/highlightMatcher';
import {
  syncConsensusState,
  isConsensusHighlight,
  filterConsensusHighlights
} from '../utils/consensusSync';

const ClubContext = createContext(null);

const CLUBE_COLLECTION = 'clube';
const CLUBE_DOC_ID = 'clube_dados';

// Chuva de estrelas vermelhas e douradas (★) com efeito de celebração revolucionária
export const triggerComradeConfetti = (particleCount = 85) => {
  try {
    const starShape = confetti.shapeFromText 
      ? confetti.shapeFromText({ text: '★', scalar: 1.8 }) 
      : 'circle';

    confetti({
      particleCount,
      spread: 85,
      origin: { y: 0.6 },
      colors: ['#D62828', '#E11D48', '#F59E0B', '#FEF08A', '#D4A359', '#FFFFFF'],
      shapes: [starShape, 'circle'],
      scalar: 1.2
    });

    // Salva de canhões duplos para grandes celebrações
    if (particleCount >= 90) {
      setTimeout(() => {
        confetti({
          particleCount: Math.round(particleCount * 0.4),
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#D62828', '#FEF08A', '#F59E0B'],
          shapes: [starShape]
        });
        confetti({
          particleCount: Math.round(particleCount * 0.4),
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#D62828', '#FEF08A', '#F59E0B'],
          shapes: [starShape]
        });
      }, 180);
    }
  } catch {
    confetti({
      particleCount,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#D62828', '#9E2A2B', '#283618', '#FEF08A', '#BC6C25', '#FFFFFF']
    });
  }
};

export const triggerPinkConfetti = triggerComradeConfetti;

export function ClubProvider({ children }) {
  // Estado centralizado dos dados do Clube
  const [data, setData] = useState({
    members: INITIAL_MEMBERS,
    currentReading: INITIAL_CURRENT_READING,
    meeting: INITIAL_MEETING,
    quotes: INITIAL_QUOTES,
    ballot: INITIAL_BALLOT,
    archive: INITIAL_ARCHIVE,
    notifications: INITIAL_NOTIFICATIONS,
    highlights: INITIAL_HIGHLIGHTS
  });

  const authContext = useAuth();
  const currentUser = authContext?.currentUser || null;
  const userProfile = authContext?.userProfile || null;
  const isAuthenticated = authContext?.isAuthenticated || false;
  const openAuthModal = authContext?.openAuthModal || (() => {});

  // Membro ativo da sessão (identifica qual camarada está conectada neste dispositivo)
  const [activeMemberId, setActiveMemberId] = useState(() => {
    try {
      return localStorage.getItem('clube_active_member_id') || 'm1';
    } catch {
      return 'm1';
    }
  });

  // Sincroniza automaticamente o perfil ativo quando a camarada estiver autenticada
  useEffect(() => {
    if (userProfile?.memberId) {
      setActiveMemberId(userProfile.memberId);
      try {
        localStorage.setItem('clube_active_member_id', userProfile.memberId);
      } catch {}
    }
  }, [userProfile?.memberId]);

  const [toast, setToast] = useState(null);

  // Helper para exibir toasts informativos
  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  // === SINCRONIZAÇÃO EM TEMPO REAL VIA FIRESTORE (onSnapshot) ===
  useEffect(() => {
    let unsubscribe = () => {};

    try {
      const docRef = doc(db, CLUBE_COLLECTION, CLUBE_DOC_ID);

      unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const cloud = docSnap.data();

            // Saneamento e deduplicação automática da Urna em tempo real
            let cleanBallot = cloud.ballot || INITIAL_BALLOT;
            if (cleanBallot && Array.isArray(cleanBallot.books)) {
              const { dedupedBooks, hadDuplicates } = deduplicateBallotBooks(cleanBallot.books);
              if (hadDuplicates) {
                cleanBallot = { ...cleanBallot, books: dedupedBooks };
                // Sincroniza silenciosamente a lista unificada de volta com o Firestore
                setDoc(docRef, { ballot: cleanBallot, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
              }
            }

            const cloudHighlights = cloud.highlights || prev.highlights || INITIAL_HIGHLIGHTS;
            const cloudReading = cloud.currentReading || prev.currentReading || INITIAL_CURRENT_READING;
            const cloudMeeting = cloud.meeting || prev.meeting || INITIAL_MEETING;
            const cloudArchive = cloud.archive || prev.archive || INITIAL_ARCHIVE;

            const { consensusQuotes, updatedArchive } = syncConsensusState({
              highlights: cloudHighlights,
              currentReading: cloudReading,
              meeting: cloudMeeting,
              archive: cloudArchive
            });

            setData(prev => ({
              ...prev,
              members: cloud.members || prev.members || INITIAL_MEMBERS,
              currentReading: cloudReading,
              meeting: cloudMeeting,
              ballot: cleanBallot,
              archive: updatedArchive,
              quotes: consensusQuotes,
              notifications: cloud.notifications || prev.notifications || INITIAL_NOTIFICATIONS,
              highlights: cloudHighlights
            }));
          } else {
            // Se o documento no Firestore ainda estiver vazio no primeiro acesso,
            // preenche automaticamente com os dados padrão atuais para que a aplicação não quebre.
            const defaultInitialPayload = {
              members: INITIAL_MEMBERS,
              currentReading: INITIAL_CURRENT_READING,
              meeting: INITIAL_MEETING,
              ballot: INITIAL_BALLOT,
              archive: INITIAL_ARCHIVE,
              quotes: INITIAL_QUOTES,
              notifications: INITIAL_NOTIFICATIONS,
              highlights: INITIAL_HIGHLIGHTS,
              createdAt: new Date().toISOString()
            };
            setDoc(docRef, defaultInitialPayload).catch(err => {
              console.warn('Inicialização inicial no Firestore (documento vazio):', err);
            });
          }
        },
        (error) => {
          console.warn('Listener Firestore em fallback offline/local:', error.message);
        }
      );
    } catch (e) {
      console.warn('Falha ao inicializar listener Firestore:', e);
    }

    return () => unsubscribe();
  }, []);

  // Helper centralizado para sincronizar alterações no documento Firestore
  const syncToCloud = async (updatedFields) => {
    try {
      const docRef = doc(db, CLUBE_COLLECTION, CLUBE_DOC_ID);
      await setDoc(docRef, { ...updatedFields, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.warn('Erro ao sincronizar com Firestore:', err);
    }
  };

  // Membro ativo: quando autenticada, é SEMPRE e RIGOROSAMENTE o membro vinculado à conta no Firebase Auth
  const effectiveActiveMemberId = (isAuthenticated && userProfile?.memberId) 
    ? userProfile.memberId 
    : activeMemberId;

  const activeMember = data.members.find(m => m.id === effectiveActiveMemberId) || data.members[0] || INITIAL_MEMBERS[0];

  // Alternar membro ativo deste dispositivo - bloqueado estritamente durante a sessão autenticada
  const setActiveMember = (memberId) => {
    if (isAuthenticated) {
      showToast('A troca de perfil é bloqueada. Para trocar de camarada, encerre a sessão (Sair) e entre com a outra conta!', 'error');
      return;
    }
    setActiveMemberId(memberId);
    try {
      localStorage.setItem('clube_active_member_id', memberId);
    } catch {}
  };

  // Operação de reset desativada para proteger os dados do coletivo no Firebase Firestore
  const resetToDefaults = () => {
    console.warn('Operação de reset de fábrica desativada por segurança.');
    showToast('A restauração de fábrica foi desativada para proteger os dados do coletivo! ★', 'info');
  };

  // === EDIÇÃO DE PERFIL DO MEMBRO ===
  const updateMemberProfile = (memberId, updatedFields) => {
    if (!currentUser || !isAuthenticated || !userProfile?.memberId) {
      openAuthModal('Faça login com seu perfil de camarada para editar suas informações!', 'login');
      return;
    }

    // Só é permitido editar o próprio perfil vinculado à conta autenticada
    const targetMemberId = userProfile.memberId;

    const updatedMembers = data.members.map(m => {
      if (m.id === targetMemberId) {
        return {
          ...m,
          ...updatedFields
        };
      }
      return m;
    });

    setData(prev => ({ ...prev, members: updatedMembers }));
    syncToCloud({ members: updatedMembers });

    triggerComradeConfetti(45);
    showToast('Seu perfil foi atualizado com sucesso! 🐾★', 'success');
  };

  // === EDIÇÃO E GERENCIAMENTO DA REUNIÃO ===
  const updateMeeting = (meetingData) => {
    if (!currentUser || !isAuthenticated) {
      openAuthModal('Acesso restrito: faça login para editar os detalhes da reunião!', 'login');
      return;
    }

    const updatedMeeting = {
      ...data.meeting,
      ...meetingData
    };

    setData(prev => ({ ...prev, meeting: updatedMeeting }));
    syncToCloud({ meeting: updatedMeeting });

    triggerComradeConfetti(40);
    showToast('Detalhes do encontro atualizados na nuvem! 📅★', 'success');
  };

  // === METAS DE LEITURA (Semanais) ===
  const toggleWeeklyGoal = (goalId) => {
    if (!currentUser || !isAuthenticated || !userProfile?.memberId) {
      openAuthModal('Faça login para registrar o cumprimento da sua meta de leitura!', 'login');
      return;
    }

    const memberId = userProfile.memberId;
    const current = data.currentReading;
    const memberGoals = current.memberProgress?.[memberId] || [];
    const hasCompleted = memberGoals.includes(goalId);
    
    const newGoals = hasCompleted
      ? memberGoals.filter(id => id !== goalId)
      : [...memberGoals, goalId];

    const updatedProgress = {
      ...(current.memberProgress || {}),
      [memberId]: newGoals
    };

    const updatedReading = {
      ...current,
      memberProgress: updatedProgress
    };

    let updatedNotifications = data.notifications || [];

    if (!hasCompleted && newGoals.length === current.readingGoals?.length) {
      triggerComradeConfetti(90);
      showToast('Parabéns, camarada! Você concluiu todas as 4 semanas do livro! 📚👑🐾', 'pink');
    } else if (!hasCompleted) {
      showToast('Meta semanal concluída! Avanço revolucionário registrado! ★', 'success');
    }

    if (!hasCompleted) {
      const actorMember = data.members.find(m => m.id === memberId) || activeMember;
      const targetGoal = current.readingGoals?.find(g => g.id === goalId);
      const goalNotif = {
        id: `notif-goal-${Date.now()}`,
        type: 'goal_completed',
        title: `${actorMember.name} bateu uma meta! 🎯`,
        message: `${targetGoal ? targetGoal.week + ' (' + targetGoal.label + ')' : 'Meta semanal cumprida'} de "${current.title}"!`,
        linkTab: 'current',
        actorId: memberId,
        actorName: actorMember.name,
        actorAvatar: actorMember.avatar,
        createdAt: new Date().toISOString(),
        readBy: [memberId]
      };
      updatedNotifications = [goalNotif, ...updatedNotifications].slice(0, 40);
    }

    setData(prev => ({
      ...prev,
      currentReading: updatedReading,
      notifications: updatedNotifications
    }));
    syncToCloud({ currentReading: updatedReading, notifications: updatedNotifications });
  };

  // === EDIÇÃO DO LIVRO ATUAL ===
  const updateCurrentReading = (updatedFields) => {
    if (!currentUser) {
      openAuthModal('Acesso restrito: faça login para alterar os dados da obra atual!', 'login');
      return;
    }

    const updatedReading = {
      ...data.currentReading,
      ...updatedFields
    };

    setData(prev => ({
      ...prev,
      currentReading: updatedReading
    }));
    syncToCloud({ currentReading: updatedReading });
    showToast('Dados da leitura atual atualizados na nuvem! 📖★', 'success');
  };

  // === AVALIAÇÃO DA OBRA ATUAL (SEMANA 4) ===
  const submitCurrentBookReview = ({ rating, comment, recommendation, pacing, isSpoiler = false }) => {
    if (!currentUser || !isAuthenticated || !userProfile?.memberId) {
      openAuthModal('Faça login para registrar sua avaliação crítica da leitura!', 'login');
      return false;
    }

    if (!rating) {
      showToast('Por favor, selecione uma nota de 1 a 5 estrelas.', 'error');
      return false;
    }

    const reviewerId = userProfile.memberId;
    const today = new Date().toLocaleDateString('pt-BR');
    const currentReviews = data.currentReading.reviews || [];
    const existingIdx = currentReviews.findIndex(r => r.memberId === reviewerId);

    const reviewPayload = {
      memberId: reviewerId,
      rating: Number(rating),
      comment: comment?.trim() || 'Leitura concluída com sucesso pelo coletivo!',
      recommendation: recommendation || '★ Super recomendo',
      pacing: pacing || 'Segui o ritmo semanal',
      isSpoiler: !!isSpoiler,
      date: today
    };

    let updatedReviews;
    if (existingIdx >= 0) {
      updatedReviews = currentReviews.map((r, i) => i === existingIdx ? reviewPayload : r);
    } else {
      updatedReviews = [...currentReviews, reviewPayload];
    }

    const updatedReading = {
      ...data.currentReading,
      reviews: updatedReviews
    };

    setData(prev => ({
      ...prev,
      currentReading: updatedReading
    }));
    syncToCloud({ currentReading: updatedReading });

    triggerComradeConfetti(100);
    showToast('Sua avaliação crítica foi registrada com sucesso nas métricas do clube! 🐾★', 'pink');
    return true;
  };

  // === RSVP (Confirmação de Presença) ===
  const toggleRsvp = () => {
    if (!currentUser || !isAuthenticated || !userProfile?.memberId) {
      openAuthModal('Faça login para confirmar sua presença na assembleia literária!', 'login');
      return;
    }

    const comradeId = userProfile.memberId;
    const isConfirmed = data.meeting.confirmedMembers?.includes(comradeId);
    const newConfirmed = isConfirmed
      ? data.meeting.confirmedMembers.filter(id => id !== comradeId)
      : [...(data.meeting.confirmedMembers || []), comradeId];

    if (!isConfirmed) {
      triggerComradeConfetti(55);
      showToast(`Presença confirmada para ${activeMember.name}! Te vemos na assembleia ★`, 'pink');
    } else {
      showToast('Confirmação de presença cancelada.', 'info');
    }

    const updatedMeeting = {
      ...data.meeting,
      confirmedMembers: newConfirmed
    };

    setData(prev => ({
      ...prev,
      meeting: updatedMeeting
    }));
    syncToCloud({ meeting: updatedMeeting });
  };

  // === MURAL DE CITAÇÕES (ESTRITO PARA CONSENSOS DO COMITÊ) ===
  const addQuote = ({ page, text, isSpoiler = false, isBookSpecific = true }) => {
    if (!currentUser || !isAuthenticated || !userProfile?.memberId) {
      openAuthModal('Faça login para sugerir passagens para o Mural Revolucionário!', 'login');
      return;
    }

    if (!text || !text.trim()) return;

    // Converte a submissão no Dossiê Coletivo, acionando a detecção automática de consenso
    const parsedPage = page 
      ? (String(page).trim().startsWith('p.') ? parseInt(String(page).replace(/\D+/g, ''), 10) || 1 : parseInt(page, 10) || 1)
      : 1;

    return addManualHighlight({
      page: parsedPage,
      text: text.trim(),
      note: '',
      isSpoiler: !!isSpoiler
    });
  };

  const updateQuote = (quoteId, { text, page, isSpoiler }) => {
    if (!currentUser || !isAuthenticated || !userProfile?.memberId) {
      openAuthModal('Faça login para editar sua citação!', 'login');
      return;
    }

    const targetQuote = (data.quotes || []).find(q => q.id === quoteId);
    const targetHlId = targetQuote?.highlightId || quoteId.replace('q-consensus-', '');

    const updatedHighlights = (data.highlights || []).map(h => {
      if (h.id === targetHlId) {
        return {
          ...h,
          text: text ? text.trim() : h.text,
          page: page ? (parseInt(String(page).replace(/\D+/g, ''), 10) || h.page) : h.page,
          ...(isSpoiler !== undefined ? { isSpoiler: !!isSpoiler } : {})
        };
      }
      return h;
    });

    const { consensusQuotes, updatedArchive } = syncConsensusState({
      highlights: updatedHighlights,
      currentReading: data.currentReading,
      meeting: data.meeting,
      archive: data.archive
    });

    setData(prev => ({
      ...prev,
      highlights: updatedHighlights,
      quotes: consensusQuotes,
      archive: updatedArchive
    }));

    syncToCloud({
      highlights: updatedHighlights,
      quotes: consensusQuotes,
      archive: updatedArchive
    });

    showToast('Citação atualizada com sucesso! 📝★', 'success');
  };

  const toggleQuoteSpoiler = (quoteId) => {
    if (!currentUser || !isAuthenticated || !userProfile?.memberId) {
      openAuthModal('Faça login para alterar a tarja confidencial desta citação!', 'login');
      return;
    }

    const targetQuote = (data.quotes || []).find(q => q.id === quoteId);
    const targetHlId = targetQuote?.highlightId || quoteId.replace('q-consensus-', '');
    let isNowSpoiler = false;

    const updatedHighlights = (data.highlights || []).map(h => {
      if (h.id === targetHlId || h.id === quoteId) {
        isNowSpoiler = !h.isSpoiler;
        return { ...h, isSpoiler: isNowSpoiler };
      }
      return h;
    });

    const { consensusQuotes, updatedArchive } = syncConsensusState({
      highlights: updatedHighlights,
      currentReading: data.currentReading,
      meeting: data.meeting,
      archive: data.archive
    });

    setData(prev => ({
      ...prev,
      highlights: updatedHighlights,
      quotes: consensusQuotes,
      archive: updatedArchive
    }));

    syncToCloud({
      highlights: updatedHighlights,
      quotes: consensusQuotes,
      archive: updatedArchive
    });

    showToast(isNowSpoiler ? 'Tarja confidencial ativada! 🔒★' : 'Tarja confidencial desativada! 📖★', 'info');
  };

  const deleteQuote = (quoteId) => {
    if (!currentUser || !isAuthenticated || !userProfile?.memberId) {
      openAuthModal('Faça login para gerenciar suas citações!', 'login');
      return;
    }

    const targetQuote = (data.quotes || []).find(q => q.id === quoteId);
    const targetHlId = targetQuote?.highlightId || quoteId.replace('q-consensus-', '');

    deleteHighlight(targetHlId);
  };

  const toggleQuoteLike = (quoteId) => {
    if (!currentUser || !isAuthenticated || !userProfile?.memberId) {
      openAuthModal('Faça login para curtir citações no mural!', 'login');
      return;
    }

    const likerId = userProfile.memberId;
    const targetQuote = (data.quotes || []).find(q => q.id === quoteId);
    const targetHlId = targetQuote?.highlightId || quoteId.replace('q-consensus-', '');

    const updatedHighlights = (data.highlights || []).map(h => {
      if (h.id === targetHlId || h.id === quoteId) {
        const currentLikes = h.likedBy || h.likes || [];
        const hasLiked = currentLikes.includes(likerId);
        const newLikes = hasLiked
          ? currentLikes.filter(id => id !== likerId)
          : [...currentLikes, likerId];
        return { ...h, likes: newLikes, likedBy: newLikes };
      }
      return h;
    });

    const { consensusQuotes, updatedArchive } = syncConsensusState({
      highlights: updatedHighlights,
      currentReading: data.currentReading,
      meeting: data.meeting,
      archive: data.archive
    });

    setData(prev => ({
      ...prev,
      highlights: updatedHighlights,
      quotes: consensusQuotes,
      archive: updatedArchive
    }));

    syncToCloud({
      highlights: updatedHighlights,
      quotes: consensusQuotes,
      archive: updatedArchive
    });
  };

  // === URNA DE VOTAÇÃO ===
  const toggleBallotStatus = () => {
    const newStatus = data.ballot.status === 'open' ? 'closed' : 'open';
    showToast(newStatus === 'open' ? 'Urna popular aberta para o Exército da Paty!' : 'Urna popular encerrada.', 'info');
    
    const updatedBallot = {
      ...data.ballot,
      status: newStatus
    };

    setData(prev => ({
      ...prev,
      ballot: updatedBallot
    }));
    syncToCloud({ ballot: updatedBallot });
  };

  // Votar em um livro (Limite rigoroso de no máximo 3 votos por membro ativo autenticado)
  const toggleVote = (bookId) => {
    if (!currentUser || !isAuthenticated || !userProfile?.memberId) {
      openAuthModal('Faça login com seu perfil para votar na Urna Popular!', 'login');
      return;
    }

    if (data.ballot?.status !== 'open') {
      showToast('A votação está encerrada no momento.', 'error');
      return;
    }

    const currentBook = data.ballot?.books?.find(b => b.id === bookId);
    if (!currentBook) return;

    const voterId = userProfile.memberId;
    const alreadyVotedThis = (currentBook.votes || []).includes(voterId);
    const maxVotes = data.ballot?.maxVotesPerMember || 3;

    // Contar rigorosamente quantos votos o membro ativo já tem na urna
    const totalVotesByMember = (data.ballot?.books || []).reduce((acc, book) => {
      return acc + ((book.votes || []).includes(voterId) ? 1 : 0);
    }, 0);

    if (!alreadyVotedThis && totalVotesByMember >= maxVotes) {
      showToast(`Votos esgotados nesta rodada! Você já utilizou seus ${maxVotes} votos permitidos.`, 'error');
      return;
    }

    const updatedBooks = (data.ballot?.books || []).map(b => {
      if (b.id === bookId) {
        const bookVotes = b.votes || [];
        const newVotes = alreadyVotedThis
          ? bookVotes.filter(id => id !== voterId)
          : [...bookVotes, voterId];
        return { ...b, votes: newVotes };
      }
      return b;
    });

    const updatedBallot = {
      ...data.ballot,
      books: updatedBooks
    };

    setData(prev => ({
      ...prev,
      ballot: updatedBallot
    }));
    syncToCloud({ ballot: updatedBallot });

    if (!alreadyVotedThis) {
      triggerComradeConfetti(45);
      showToast(`Voto registrado para "${currentBook.title}"! ★`, 'success');
    } else {
      showToast(`Voto retirado de "${currentBook.title}".`, 'info');
    }
  };

  // Indicar livro para a urna (SEM DUPLICIDADE!)
  const nominateBook = ({ title, author, pages, coverUrl, synopsis, genre, nominationReason }) => {
    if (!currentUser || !isAuthenticated || !userProfile?.memberId) {
      openAuthModal('Faça login com seu perfil para indicar um livro para a urna popular!', 'login');
      return false;
    }

    if (!title || !title.trim()) {
      showToast('Por favor, informe o título da obra.', 'error');
      return false;
    }

    const currentBooks = data.ballot?.books || [];

    // 1. Validação anti-duplicidade abrangente (título idêntico, subtítulos ou tokens equivalentes)
    const duplicateCheck = findDuplicateBookInBallot(title, currentBooks);
    if (duplicateCheck.isDuplicate) {
      const existingName = duplicateCheck.matchedBook?.title || title.trim();
      showToast(`A obra "${existingName}" já está na Urna Popular! Você pode votar diretamente nela. 📚★`, 'error');
      return false;
    }

    // 2. Verifica se já é a leitura atual do comitê
    if (isCurrentReadingBook(title, data.currentReading)) {
      showToast(`"${title.trim()}" já é a Leitura Atual do comitê! Escolha outra obra para a próxima rodada. 📚★`, 'error');
      return false;
    }

    const nominatorId = userProfile.memberId;
    const newBook = {
      id: `ballot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      author: author?.trim() || 'Autor não informado',
      pages: parseInt(pages, 10) || 280,
      coverUrl: coverUrl || '',
      synopsis: synopsis || 'Sem sinopse cadastrada.',
      genre: genre || 'Literatura',
      nominatedBy: nominatorId,
      nominationReason: nominationReason?.trim() || 'Indicação especial para o Exército da Paty!',
      votes: [nominatorId] // Quem indica já vota automaticamente com seu ID autenticado
    };

    // Deduplica preventivamente ao montar a nova lista
    const { dedupedBooks } = deduplicateBallotBooks([...currentBooks, newBook]);

    const nominatorMember = data.members.find(m => m.id === nominatorId) || activeMember;
    const nominationNotif = {
      id: `notif-nomination-${Date.now()}`,
      type: 'ballot_nomination',
      title: `${nominatorMember.name} indicou um livro! 🗳️`,
      message: `"${newBook.title}" (${newBook.author}) está concorrendo na Urna Popular!`,
      linkTab: 'ballot',
      actorId: nominatorId,
      actorName: nominatorMember.name,
      actorAvatar: nominatorMember.avatar,
      createdAt: new Date().toISOString(),
      readBy: [nominatorId]
    };
    const updatedNotifications = [nominationNotif, ...(data.notifications || [])].slice(0, 40);

    const updatedBallot = {
      ...data.ballot,
      books: dedupedBooks
    };

    setData(prev => ({
      ...prev,
      ballot: updatedBallot,
      notifications: updatedNotifications
    }));
    syncToCloud({ ballot: updatedBallot, notifications: updatedNotifications });

    triggerComradeConfetti(65);
    showToast(`"${newBook.title}" foi adicionado à urna popular! 📚★`, 'pink');
    return true;
  };

  // Editar indicação existente
  const updateNomination = (bookId, updatedFields) => {
    if (!currentUser || !isAuthenticated || !userProfile?.memberId) {
      openAuthModal('Faça login para editar sua indicação!', 'login');
      return;
    }

    const targetBook = (data.ballot.books || []).find(b => b.id === bookId);
    if (targetBook && targetBook.nominatedBy !== userProfile.memberId) {
      showToast('Você só pode editar indicações feitas por você!', 'error');
      return;
    }

    // Se estiver alterando o título, valida contra duplicidades na urna
    if (updatedFields.title) {
      const duplicateCheck = findDuplicateBookInBallot(updatedFields.title, data.ballot?.books || [], bookId);
      if (duplicateCheck.isDuplicate) {
        showToast(`Conflito: a obra "${duplicateCheck.matchedBook?.title || updatedFields.title}" já existe na urna!`, 'error');
        return;
      }
      if (isCurrentReadingBook(updatedFields.title, data.currentReading)) {
        showToast(`"${updatedFields.title.trim()}" já é a Leitura Atual do comitê!`, 'error');
        return;
      }
    }

    const updatedBooks = data.ballot.books.map(b => {
      if (b.id === bookId) {
        return {
          ...b,
          ...updatedFields,
          pages: parseInt(updatedFields.pages, 10) || b.pages
        };
      }
      return b;
    });

    const updatedBallot = {
      ...data.ballot,
      books: updatedBooks
    };

    setData(prev => ({
      ...prev,
      ballot: updatedBallot
    }));
    syncToCloud({ ballot: updatedBallot });

    showToast('Indicação atualizada com sucesso! ★', 'success');
  };

  // Excluir indicação própria da urna
  const deleteNomination = (bookId) => {
    if (!currentUser || !isAuthenticated || !userProfile?.memberId) {
      openAuthModal('Faça login para remover uma indicação da urna!', 'login');
      return;
    }

    const targetBook = (data.ballot.books || []).find(b => b.id === bookId);
    if (targetBook && targetBook.nominatedBy !== userProfile.memberId) {
      showToast('Você só pode remover indicações feitas por você!', 'error');
      return;
    }

    const updatedBallot = {
      ...data.ballot,
      books: data.ballot.books.filter(b => b.id !== bookId)
    };

    setData(prev => ({
      ...prev,
      ballot: updatedBallot
    }));
    syncToCloud({ ballot: updatedBallot });

    showToast('Recomendação removida da urna.', 'info');
  };

  // Promover livro da urna para Livro do Mês
  const promoteToCurrentBook = (bookId) => {
    const winningBook = data.ballot.books.find(b => b.id === bookId);
    if (!winningBook) return;

    // Criar metas semanais proporcionais às páginas
    const totalPages = winningBook.pages || 300;
    const q1 = Math.round(totalPages * 0.25);
    const q2 = Math.round(totalPages * 0.50);
    const q3 = Math.round(totalPages * 0.75);

    const generatedGoals = [
      { id: 1, week: 'Semana 1', label: `Páginas 1 a ${q1}`, pages: `Páginas 1 a ${q1}`, targetPage: q1 },
      { id: 2, week: 'Semana 2', label: `Páginas ${q1 + 1} a ${q2}`, pages: `Páginas ${q1 + 1} a ${q2}`, targetPage: q2 },
      { id: 3, week: 'Semana 3', label: `Páginas ${q2 + 1} a ${q3}`, pages: `Páginas ${q2 + 1} a ${q3}`, targetPage: q3 },
      { id: 4, week: 'Semana 4', label: `Páginas ${q3 + 1} a ${totalPages}`, pages: `Páginas ${q3 + 1} a ${totalPages}`, targetPage: totalPages },
    ];

    // Data da nova reunião: 30 dias a partir de hoje
    const nextMeetingDate = new Date();
    nextMeetingDate.setDate(nextMeetingDate.getDate() + 30);
    nextMeetingDate.setHours(20, 0, 0, 0);

    const nextMonthName = nextMeetingDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const formattedMonth = nextMonthName.charAt(0).toUpperCase() + nextMonthName.slice(1);

    // Salvar o livro anterior no acervo histórico preservando suas resenhas, citações e grifos associados
    const oldBook = data.currentReading;
    const oldBookQuotes = (data.quotes || []).filter(q => 
      q.isBookSpecific !== false && (q.bookId === oldBook.id || q.bookTitle === oldBook.title)
    );

    const archivedOldBook = {
      id: `arch-${Date.now()}`,
      title: oldBook.title,
      author: oldBook.author,
      pages: oldBook.pages,
      genre: oldBook.genre || 'Literatura',
      readMonth: oldBook.monthYear || 'Novembro / 2026',
      year: new Date().getFullYear().toString(),
      coverUrl: oldBook.coverUrl,
      synopsis: oldBook.synopsis,
      reviews: oldBook.reviews || [],
      quotes: oldBookQuotes,
      highlights: data.highlights || []
    };

    const newCurrentReading = {
      id: `current-${winningBook.id}`,
      title: winningBook.title,
      author: winningBook.author,
      pages: winningBook.pages,
      genre: winningBook.genre || 'Ficção',
      coverUrl: winningBook.coverUrl,
      monthYear: formattedMonth,
      badge: 'Em Leitura',
      synopsis: winningBook.synopsis,
      readingGoals: generatedGoals,
      memberProgress: {
        'm1': [], 'm2': [], 'm3': [], 'm4': [], 'm5': [], 'm6': []
      },
      reviews: []
    };

    // Remove o livro eleito da urna e limpa votos dos demais para uma nova rodada
    const remainingBooks = data.ballot.books.filter(b => b.id !== bookId).map(b => ({
      ...b,
      votes: []
    }));

    // Citações gerais permanecem no mural, apenas as citações específicas da obra anterior foram para o acervo
    const remainingQuotes = (data.quotes || []).filter(q => q.isBookSpecific === false);

    const updatedArchive = [archivedOldBook, ...(data.archive || [])];
    const updatedMeeting = {
      ...data.meeting,
      dateTime: nextMeetingDate.toISOString(),
      formattedDate: `quarta-feira, 20:00`,
      confirmedMembers: []
    };
    const updatedBallot = {
      ...data.ballot,
      books: remainingBooks,
      status: 'open',
      title: `Eleição da Próxima Leitura`
    };

    setData(prev => ({
      ...prev,
      currentReading: newCurrentReading,
      archive: updatedArchive,
      meeting: updatedMeeting,
      quotes: remainingQuotes,
      highlights: [],
      ballot: updatedBallot
    }));

    syncToCloud({
      currentReading: newCurrentReading,
      archive: updatedArchive,
      meeting: updatedMeeting,
      quotes: remainingQuotes,
      highlights: [],
      ballot: updatedBallot
    });

    triggerComradeConfetti(150);
    showToast(`"${winningBook.title}" foi promovido a Livro do Mês! Nova leitura iniciada! 👑📚★`, 'pink');
  };

  // === ARQUIVAMENTO AUTOMÁTICO E MANUAL DO LIVRO ATUAL NO ACERVO ===
  const archiveCurrentReading = (manual = false) => {
    const current = data.currentReading;
    if (!current) return;

    if (current.isArchived) {
      if (manual) {
        showToast(`"${current.title}" já se encontra com leitura concluída no Acervo Coletivo! ★`, 'info');
      }
      return;
    }

    const reviews = current.reviews || [];
    const avgRating = reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

    const assemblyDateStr = data.meeting?.dateTime
      ? new Date(data.meeting.dateTime).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      : (data.meeting?.formattedDate || new Date().toLocaleDateString('pt-BR'));

    const { consensusQuotes, updatedArchive: syncedArchive } = syncConsensusState({
      highlights: data.highlights || [],
      currentReading: current,
      meeting: data.meeting,
      archive: data.archive || []
    });

    const finalArchive = syncedArchive.map(b => {
      if (b.title === current.title || b.id === current.id || b.id === `archived-${current.id}`) {
        return {
          ...b,
          status: 'Concluído',
          averageRating: avgRating,
          assemblyDate: assemblyDateStr,
          reviews: reviews,
          quotes: consensusQuotes,
          consensusQuotes: consensusQuotes,
          highlights: data.highlights || [],
          archivedAt: b.archivedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      return b;
    });

    const updatedReading = {
      ...current,
      isArchived: true
    };

    setData(prev => ({
      ...prev,
      currentReading: updatedReading,
      archive: finalArchive,
      quotes: consensusQuotes
    }));

    syncToCloud({
      currentReading: updatedReading,
      archive: finalArchive,
      quotes: consensusQuotes
    });

    if (manual) {
      triggerComradeConfetti(90);
      showToast(`"${current.title}" arquivado no Acervo Coletivo como Concluído com seus consensos salvos! 📚★`, 'pink');
    } else {
      showToast(`Prazo encerrado! "${current.title}" arquivado automaticamente no Acervo com seus consensos! 🏛️★`, 'pink');
    }
  };

  // === GERENCIAMENTO DE NOTIFICAÇÕES DO COLETIVO ===
  const addNotification = (notifPayload) => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      readBy: [],
      ...notifPayload
    };
    const updatedNotifications = [newNotif, ...(data.notifications || [])].slice(0, 40);
    setData(prev => ({ ...prev, notifications: updatedNotifications }));
    syncToCloud({ notifications: updatedNotifications });
  };

  const markNotificationAsRead = (notifId) => {
    const memberId = userProfile?.memberId || activeMemberId;
    const updatedNotifications = (data.notifications || []).map(n => {
      if (n.id === notifId) {
        const readBy = n.readBy || [];
        if (!readBy.includes(memberId)) {
          return { ...n, readBy: [...readBy, memberId] };
        }
      }
      return n;
    });

    setData(prev => ({ ...prev, notifications: updatedNotifications }));
    syncToCloud({ notifications: updatedNotifications });
  };

  const markAllNotificationsAsRead = () => {
    const memberId = userProfile?.memberId || activeMemberId;
    const updatedNotifications = (data.notifications || []).map(n => {
      const readBy = n.readBy || [];
      if (!readBy.includes(memberId)) {
        return { ...n, readBy: [...readBy, memberId] };
      }
      return n;
    });

    setData(prev => ({ ...prev, notifications: updatedNotifications }));
    syncToCloud({ notifications: updatedNotifications });
    showToast('Todas as notificações foram marcadas como lidas! ★', 'info');
  };

  // === DOSSIÊ COLETIVO DE GRIFOS & COMPARADOR DE PDF/KINDLE ===
  const addHighlightsToDossier = (incomingHighlights) => {
    if (!currentUser || !isAuthenticated || !userProfile?.memberId) {
      openAuthModal('Faça login com seu perfil para contribuir com o Dossiê de Grifos!', 'login');
      return { success: false };
    }

    if (!incomingHighlights || incomingHighlights.length === 0) {
      showToast('Nenhum grifo válido para adicionar.', 'info');
      return { success: false };
    }

    const { updatedDossier, newCount, newConsensusCount, consensusHighlights } = mergeHighlightsIntoDossier(
      data.highlights || [],
      incomingHighlights,
      activeMember
    );

    let updatedNotifications = data.notifications || [];

    if (newConsensusCount > 0) {
      triggerComradeConfetti(110);
      showToast(`🔥 ${newConsensusCount} trecho(s) atingiram CONSENSO DO COMITÊ! Vinculados ao Mural e ao Acervo! ★`, 'pink');

      const consensusNotif = {
        id: `notif-consensus-${Date.now()}`,
        type: 'highlight_consensus',
        title: `🔥 Consenso do Comitê Detectado!`,
        message: `${activeMember.name} e outras camaradas grifaram as mesmas passagens em "${data.currentReading?.title}"!`,
        linkTab: 'current',
        actorId: userProfile.memberId,
        actorName: activeMember.name,
        actorAvatar: activeMember.avatar,
        createdAt: new Date().toISOString(),
        readBy: [userProfile.memberId]
      };
      updatedNotifications = [consensusNotif, ...updatedNotifications].slice(0, 40);
    } else {
      triggerComradeConfetti(45);
      showToast(`${newCount} grifo(s) adicionados ao Dossiê Coletivo! Destaques individuais ficam no Dossiê e subirão ao Mural quando atingirem consenso. 📄★`, 'success');

      const highlightNotif = {
        id: `notif-hl-${Date.now()}`,
        type: 'new_highlight',
        title: `${activeMember.name} adicionou grifos ao Dossiê! ★`,
        message: `${incomingHighlights.length} passagem(ns) analisada(s) em "${data.currentReading?.title}".`,
        linkTab: 'current',
        actorId: userProfile.memberId,
        actorName: activeMember.name,
        actorAvatar: activeMember.avatar,
        createdAt: new Date().toISOString(),
        readBy: [userProfile.memberId]
      };
      updatedNotifications = [highlightNotif, ...updatedNotifications].slice(0, 40);
    }

    const { consensusQuotes, updatedArchive } = syncConsensusState({
      highlights: updatedDossier,
      currentReading: data.currentReading,
      meeting: data.meeting,
      archive: data.archive
    });

    setData(prev => ({
      ...prev,
      highlights: updatedDossier,
      archive: updatedArchive,
      quotes: consensusQuotes,
      notifications: updatedNotifications
    }));

    syncToCloud({
      highlights: updatedDossier,
      archive: updatedArchive,
      quotes: consensusQuotes,
      notifications: updatedNotifications
    });

    return {
      success: true,
      newCount,
      newConsensusCount,
      consensusHighlights
    };
  };

  const addManualHighlight = ({ page, text, note = '', color, isSpoiler = false }) => {
    return addHighlightsToDossier([{
      id: `hl-manual-${Date.now()}`,
      page: parseInt(page, 10) || 1,
      text: text.trim(),
      note: note.trim(),
      color: color || { name: 'Amarelo Revolucionário', hex: '#FDE047', bgClass: 'bg-yellow-300/40 border-yellow-400 text-yellow-950' },
      isSpoiler: !!isSpoiler,
      source: 'manual'
    }]);
  };

  const joinHighlightAsComrade = (highlightId, comradeNote = '') => {
    if (!currentUser || !isAuthenticated || !userProfile?.memberId) {
      openAuthModal('Faça login para registrar que você também grifou este trecho!', 'login');
      return { success: false };
    }

    const currentMemberId = userProfile.memberId;
    const authorMember = data.members.find(m => m.id === currentMemberId) || activeMember;
    const target = (data.highlights || []).find(h => h.id === highlightId);
    if (!target) return { success: false };

    const alreadyJoined = (target.highlightedBy || []).some(m => m.id === currentMemberId);
    let updatedHighlights;
    let isNowConsensus = false;

    if (alreadyJoined) {
      const remaining = (target.highlightedBy || []).filter(m => m.id !== currentMemberId);
      if (remaining.length === 0) {
        deleteHighlight(highlightId);
        return { success: true, removed: true };
      }
      const isStillConsensus = new Set(remaining.map(m => m.id)).size >= 2;
      updatedHighlights = (data.highlights || []).map(h => {
        if (h.id === highlightId) {
          return {
            ...h,
            highlightedBy: remaining,
            isConsensus: isStillConsensus,
            updatedAt: new Date().toISOString()
          };
        }
        return h;
      });
      showToast('Sua marcação neste trecho foi desfeita.', 'info');
    } else {
      const newMemberEntry = {
        id: currentMemberId,
        name: authorMember.name,
        avatar: authorMember.avatar,
        roleBadge: authorMember.roleBadge || '★ Camarada',
        note: comradeNote || '',
        color: authorMember.color ? { name: authorMember.name, hex: authorMember.color, bgClass: 'bg-yellow-300/40 border-yellow-400 text-yellow-950' } : undefined,
        date: new Date().toLocaleDateString('pt-BR')
      };

      const newHighlighters = [...(target.highlightedBy || []), newMemberEntry];
      isNowConsensus = new Set(newHighlighters.map(m => m.id)).size >= 2;

      updatedHighlights = (data.highlights || []).map(h => {
        if (h.id === highlightId) {
          return {
            ...h,
            highlightedBy: newHighlighters,
            isConsensus: isNowConsensus,
            updatedAt: new Date().toISOString()
          };
        }
        return h;
      });

      if (isNowConsensus) {
        triggerComradeConfetti(110);
        showToast('🔥 CONSENSO DO COMITÊ! Você e outra(s) camarada(s) grifaram este trecho! Registrado no Mural e no Acervo!', 'pink');
      } else {
        showToast('Grifo registrado com sucesso!', 'success');
      }
    }

    const { consensusQuotes, updatedArchive } = syncConsensusState({
      highlights: updatedHighlights,
      currentReading: data.currentReading,
      meeting: data.meeting,
      archive: data.archive
    });

    setData(prev => ({
      ...prev,
      highlights: updatedHighlights,
      archive: updatedArchive,
      quotes: consensusQuotes
    }));

    syncToCloud({
      highlights: updatedHighlights,
      archive: updatedArchive,
      quotes: consensusQuotes
    });

    return { success: true, becameConsensus: isNowConsensus };
  };

  const toggleHighlightSpoiler = (highlightId) => {
    if (!currentUser || !isAuthenticated || !userProfile?.memberId) {
      openAuthModal('Faça login para alterar a tarja confidencial deste grifo!', 'login');
      return;
    }

    let isNowSpoiler = false;
    const updatedHighlights = (data.highlights || []).map(h => {
      if (h.id === highlightId) {
        isNowSpoiler = !h.isSpoiler;
        return { ...h, isSpoiler: isNowSpoiler };
      }
      return h;
    });

    const { consensusQuotes, updatedArchive } = syncConsensusState({
      highlights: updatedHighlights,
      currentReading: data.currentReading,
      meeting: data.meeting,
      archive: data.archive
    });

    setData(prev => ({
      ...prev,
      highlights: updatedHighlights,
      archive: updatedArchive,
      quotes: consensusQuotes
    }));
    syncToCloud({
      highlights: updatedHighlights,
      archive: updatedArchive,
      quotes: consensusQuotes
    });
    showToast(isNowSpoiler ? 'Tarja confidencial ativada no grifo! 🔒' : 'Tarja confidencial desativada! 📖', 'info');
  };

  const deleteHighlight = (highlightId) => {
    if (!currentUser || !isAuthenticated || !userProfile?.memberId) {
      openAuthModal('Faça login para remover este grifo!', 'login');
      return;
    }

    const currentMemberId = userProfile.memberId;
    const target = (data.highlights || []).find(h => h.id === highlightId);
    if (!target) return;

    let updatedHighlights;
    if (target.highlightedBy.length > 1) {
      const remainingHighlightedBy = target.highlightedBy.filter(m => m.id !== currentMemberId);
      const isStillConsensus = new Set(remainingHighlightedBy.map(m => m.id)).size >= 2;
      updatedHighlights = (data.highlights || []).map(h => {
        if (h.id === highlightId) {
          return {
            ...h,
            highlightedBy: remainingHighlightedBy,
            isConsensus: isStillConsensus
          };
        }
        return h;
      });
      showToast('Sua participação neste grifo foi removida.', 'info');
    } else {
      if (target.highlightedBy[0]?.id !== currentMemberId) {
        showToast('Você só pode excluir grifos adicionados por você!', 'error');
        return;
      }
      updatedHighlights = (data.highlights || []).filter(h => h.id !== highlightId);
      showToast('Grifo removido do dossiê coletivo.', 'info');
    }

    const { consensusQuotes, updatedArchive } = syncConsensusState({
      highlights: updatedHighlights,
      currentReading: data.currentReading,
      meeting: data.meeting,
      archive: data.archive
    });

    setData(prev => ({
      ...prev,
      highlights: updatedHighlights,
      archive: updatedArchive,
      quotes: consensusQuotes
    }));
    syncToCloud({
      highlights: updatedHighlights,
      archive: updatedArchive,
      quotes: consensusQuotes
    });
  };

  const deleteMultipleHighlights = (highlightIds = []) => {
    if (!currentUser || !isAuthenticated) {
      openAuthModal('Faça login para gerenciar grifos!', 'login');
      return;
    }

    if (!Array.isArray(highlightIds) || highlightIds.length === 0) return;

    const idsSet = new Set(highlightIds);
    const updatedHighlights = (data.highlights || []).filter(h => !idsSet.has(h.id));
    const count = (data.highlights || []).length - updatedHighlights.length;

    const { consensusQuotes, updatedArchive } = syncConsensusState({
      highlights: updatedHighlights,
      currentReading: data.currentReading,
      meeting: data.meeting,
      archive: data.archive
    });

    setData(prev => ({
      ...prev,
      highlights: updatedHighlights,
      archive: updatedArchive,
      quotes: consensusQuotes
    }));
    syncToCloud({
      highlights: updatedHighlights,
      archive: updatedArchive,
      quotes: consensusQuotes
    });
    showToast(`${count} ${count === 1 ? 'grifo removido' : 'grifos removidos'} do dossiê coletivo.`, 'info');
  };

  const addHighlightComment = (highlightId, commentText) => {
    if (!currentUser || !isAuthenticated || !userProfile?.memberId) {
      openAuthModal('Faça login para debater e comentar neste grifo coletivo!', 'login');
      return;
    }

    if (!commentText || !commentText.trim()) return;

    const newComment = {
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      memberId: userProfile.memberId,
      authorName: activeMember.name,
      authorAvatar: activeMember.avatar,
      authorRole: activeMember.roleBadge || '★ Camarada',
      text: commentText.trim(),
      date: new Date().toLocaleDateString('pt-BR'),
      createdAt: new Date().toISOString()
    };

    const updatedHighlights = (data.highlights || []).map(h => {
      if (h.id === highlightId) {
        return {
          ...h,
          comments: [...(h.comments || []), newComment]
        };
      }
      return h;
    });

    setData(prev => ({ ...prev, highlights: updatedHighlights }));
    syncToCloud({ highlights: updatedHighlights });
    showToast('Anotação crítica adicionada ao debate do grifo! 💬★', 'success');
  };

  const deleteHighlightComment = (highlightId, commentId) => {
    if (!currentUser || !isAuthenticated || !userProfile?.memberId) {
      openAuthModal('Faça login para remover seu comentário!', 'login');
      return;
    }

    const updatedHighlights = (data.highlights || []).map(h => {
      if (h.id === highlightId) {
        return {
          ...h,
          comments: (h.comments || []).filter(c => c.id !== commentId || c.memberId !== userProfile.memberId)
        };
      }
      return h;
    });

    setData(prev => ({ ...prev, highlights: updatedHighlights }));
    syncToCloud({ highlights: updatedHighlights });
    showToast('Anotação removida do debate.', 'info');
  };

  // Verificação de prazo da assembleia para arquivamento automático
  useEffect(() => {
    const checkArchivalDue = () => {
      if (!data.meeting?.dateTime || !data.currentReading) return;
      const targetTime = new Date(data.meeting.dateTime).getTime();
      const now = Date.now();

      if (!isNaN(targetTime) && now >= targetTime) {
        const isAlreadyArchived = (data.archive || []).some(
          b => b.title === data.currentReading.title || b.id === `archived-${data.currentReading.id}`
        ) || data.currentReading.isArchived;

        if (!isAlreadyArchived) {
          archiveCurrentReading(false);
        }
      }
    };

    checkArchivalDue();
    const timerInterval = setInterval(checkArchivalDue, 15000);
    return () => clearInterval(timerInterval);
  }, [data.meeting?.dateTime, data.currentReading?.title, data.currentReading?.isArchived, data.archive]);

  // === ACERVO & RESENHAS ===
  const addOrUpdateReview = (bookId, { rating, comment, isSpoiler = false }) => {
    if (!currentUser || !isAuthenticated || !userProfile?.memberId) {
      openAuthModal('Faça login com seu perfil de camarada para publicar sua resenha!', 'login');
      return;
    }

    if (!rating) {
      showToast('Por favor, selecione uma nota de 1 a 5 estrelas.', 'error');
      return;
    }

    const reviewerId = userProfile.memberId;
    const today = new Date().toLocaleDateString('pt-BR');

    const updatedArchive = (data.archive || []).map(book => {
      if (book.id === bookId) {
        const existingReviews = book.reviews || [];
        const existingIndex = existingReviews.findIndex(r => r.memberId === reviewerId);

        let newReviews;
        if (existingIndex >= 0) {
          newReviews = existingReviews.map((r, idx) => 
            idx === existingIndex 
              ? { ...r, rating: Number(rating), comment: comment.trim(), isSpoiler: !!isSpoiler, date: today }
              : r
          );
        } else {
          newReviews = [
            ...existingReviews,
            {
              memberId: reviewerId,
              rating: Number(rating),
              comment: comment.trim(),
              isSpoiler: !!isSpoiler,
              date: today
            }
          ];
        }

        return { ...book, reviews: newReviews };
      }
      return book;
    });

    setData(prev => ({
      ...prev,
      archive: updatedArchive
    }));
    syncToCloud({ archive: updatedArchive });

    triggerComradeConfetti(50);
    showToast('Sua resenha crítica foi salva com sucesso! 🐾★', 'success');
  };

  // Excluir resenha do membro autenticado
  const deleteReview = (bookId) => {
    if (!currentUser || !isAuthenticated || !userProfile?.memberId) {
      openAuthModal('Faça login com seu perfil para remover sua resenha!', 'login');
      return;
    }

    const reviewerId = userProfile.memberId;
    const updatedArchive = (data.archive || []).map(book => {
      if (book.id === bookId) {
        return {
          ...book,
          reviews: (book.reviews || []).filter(r => r.memberId !== reviewerId)
        };
      }
      return book;
    });

    setData(prev => ({
      ...prev,
      archive: updatedArchive
    }));
    syncToCloud({ archive: updatedArchive });

    showToast('Sua resenha foi removida do acervo.', 'info');
  };

  // Estatísticas calculadas dinamicamente com tratamento 100% defensivo
  const stats = React.useMemo(() => {
    const archiveList = Array.isArray(data.archive) ? data.archive : [];
    const archivePages = archiveList.reduce((acc, b) => acc + (Number(b?.pages) || 0), 0);
    
    const readingGoals = data.currentReading?.readingGoals || [];
    const goalsDone = readingGoals.length || 4;
    const memberProgress = data.currentReading?.memberProgress || {};
    const totalGoalsCompleted = Object.values(memberProgress).flat().length || 0;
    const membersCount = Array.isArray(data.members) && data.members.length > 0 ? data.members.length : 1;
    const totalPossibleGoals = membersCount * goalsDone;
    const avgCompletion = totalPossibleGoals > 0 ? (totalGoalsCompleted / totalPossibleGoals) : 0;
    const currentReadingPages = Math.round((Number(data.currentReading?.pages) || 0) * (avgCompletion || 0));
    
    const totalPagesYear = (archivePages || 0) + (currentReadingPages || 0);
    const meetingsHeld = archiveList.length || 0;

    // Todas as avaliações válidas (acervo + leitura atual)
    const allReviews = [
      ...archiveList.flatMap(b => Array.isArray(b?.reviews) ? b.reviews : []),
      ...(Array.isArray(data.currentReading?.reviews) ? data.currentReading.reviews : [])
    ].filter(r => r && typeof r.rating === 'number' && !isNaN(r.rating));
    
    const totalRatingSum = allReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    const averageRating = allReviews.length > 0 
      ? (totalRatingSum / allReviews.length).toFixed(1)
      : '5.0';

    const genreCounts = {};
    [...archiveList, data.currentReading].forEach(b => {
      if (b && b.genre) {
        const g = b.genre?.split('/')[0]?.split('&')[0]?.trim() || 'Literatura';
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      }
    });
    let topGenre = 'Ciência Política & Sociedade';
    let maxG = 0;
    Object.entries(genreCounts).forEach(([k, v]) => {
      if (v > maxG) {
        maxG = v;
        topGenre = k;
      }
    });

    return {
      totalPagesYear: totalPagesYear || 0,
      meetingsHeld: meetingsHeld || 0,
      averageRating: averageRating || '5.0',
      topGenre: topGenre || 'Literatura Revolucionária',
      totalQuotes: (data.quotes || []).length || 0,
      totalBooksRead: archiveList.length + ((data.currentReading?.reviews || []).length > 0 ? 1 : 0),
      totalReviewsCount: allReviews.length || 0
    };
  }, [data]);

  return (
    <ClubContext.Provider
      value={{
        activeMember,
        members: data.members,
        setActiveMember,
        updateMemberProfile,
        currentReading: data.currentReading,
        updateCurrentReading,
        toggleWeeklyGoal,
        submitCurrentBookReview,
        meeting: data.meeting,
        updateMeeting,
        toggleRsvp,
        quotes: data.quotes || [],
        addQuote,
        updateQuote,
        deleteQuote,
        toggleQuoteLike,
        toggleQuoteSpoiler,
        ballot: data.ballot,
        toggleBallotStatus,
        toggleVote,
        nominateBook,
        updateNomination,
        deleteNomination,
        promoteToCurrentBook,
        archiveCurrentReading,
        archive: data.archive || [],
        addOrUpdateReview,
        deleteReview,
        highlights: data.highlights || [],
        addHighlightsToDossier,
        addManualHighlight,
        joinHighlightAsComrade,
        toggleHighlightSpoiler,
        deleteHighlight,
        deleteMultipleHighlights,
        addHighlightComment,
        deleteHighlightComment,
        notifications: data.notifications || [],
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        triggerComradeConfetti,
        stats,
        resetToDefaults,
        toast,
        showToast,
        closeToast,
        currentUser,
        userProfile,
        isAuthenticated,
        openAuthModal
      }}
    >
      {children}
    </ClubContext.Provider>
  );
}

export function useClub() {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error('useClub deve ser utilizado dentro de um ClubProvider');
  }
  return context;
}
