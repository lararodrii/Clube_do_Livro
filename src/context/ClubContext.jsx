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
  INITIAL_ARCHIVE
} from '../data/initialData';
import { useAuth } from './AuthContext';

const ClubContext = createContext(null);

const CLUBE_COLLECTION = 'clube';
const CLUBE_DOC_ID = 'clube_dados';

// Confetti especial em tons de vermelho revolucionário, amarelo margarida e dourado
export const triggerComradeConfetti = (particleCount = 75) => {
  confetti({
    particleCount,
    spread: 70,
    origin: { y: 0.65 },
    colors: ['#D62828', '#9E2A2B', '#283618', '#FEF08A', '#BC6C25', '#FFFFFF']
  });
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
    archive: INITIAL_ARCHIVE
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
            setData(prev => ({
              ...prev,
              members: cloud.members || prev.members || INITIAL_MEMBERS,
              currentReading: cloud.currentReading || prev.currentReading || INITIAL_CURRENT_READING,
              meeting: cloud.meeting || prev.meeting || INITIAL_MEETING,
              ballot: cloud.ballot || prev.ballot || INITIAL_BALLOT,
              archive: cloud.archive || prev.archive || INITIAL_ARCHIVE,
              quotes: cloud.quotes || prev.quotes || INITIAL_QUOTES
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

  // Membro ativo atual do dispositivo
  const activeMember = data.members.find(m => m.id === activeMemberId) || data.members[0] || INITIAL_MEMBERS[0];

  // Alternar membro ativo deste dispositivo
  const setActiveMember = (memberId) => {
    const member = data.members.find(m => m.id === memberId);
    setActiveMemberId(memberId);
    try {
      localStorage.setItem('clube_active_member_id', memberId);
    } catch {}
    if (member) {
      showToast(`Perfil alternado para ${member.name} 🐾★`, 'info');
    }
  };

  // Resetar dados para o padrão limpo do Exército da Paty na nuvem
  const resetToDefaults = () => {
    const defaultData = {
      members: INITIAL_MEMBERS,
      currentReading: INITIAL_CURRENT_READING,
      meeting: INITIAL_MEETING,
      quotes: [],
      ballot: {
        status: 'open',
        title: 'Urna Popular do Exército da Paty ★',
        maxVotesPerMember: 3,
        books: []
      },
      archive: []
    };

    setData(defaultData);
    syncToCloud(defaultData);

    triggerComradeConfetti(80);
    showToast('Dados reinicializados com sucesso no Firebase! 🐾★', 'pink');
  };

  // === EDIÇÃO DE PERFIL DO MEMBRO ===
  const updateMemberProfile = (memberId, updatedFields) => {
    if (!currentUser) {
      openAuthModal('Faça login com seu perfil de camarada para editar suas informações!', 'login');
      return;
    }

    const updatedMembers = data.members.map(m => {
      if (m.id === memberId) {
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
    showToast('Perfil atualizado com sucesso! 🐾★', 'success');
  };

  // === EDIÇÃO E GERENCIAMENTO DA REUNIÃO ===
  const updateMeeting = (meetingData) => {
    if (!currentUser) {
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
    if (!currentUser) {
      openAuthModal('Faça login para registrar o cumprimento da sua meta de leitura!', 'login');
      return;
    }

    const current = data.currentReading;
    const memberGoals = current.memberProgress?.[activeMember.id] || [];
    const hasCompleted = memberGoals.includes(goalId);
    
    const newGoals = hasCompleted
      ? memberGoals.filter(id => id !== goalId)
      : [...memberGoals, goalId];

    const updatedProgress = {
      ...(current.memberProgress || {}),
      [activeMember.id]: newGoals
    };

    const updatedReading = {
      ...current,
      memberProgress: updatedProgress
    };

    if (!hasCompleted && newGoals.length === current.readingGoals?.length) {
      triggerComradeConfetti(90);
      showToast('Parabéns, camarada! Você concluiu todas as 4 semanas do livro! 📚👑🐾', 'pink');
    } else if (!hasCompleted) {
      showToast('Meta semanal concluída! Avanço revolucionário registrado! ★', 'success');
    }

    setData(prev => ({
      ...prev,
      currentReading: updatedReading
    }));
    syncToCloud({ currentReading: updatedReading });
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
  const submitCurrentBookReview = ({ rating, comment, recommendation, pacing }) => {
    if (!currentUser) {
      openAuthModal('Faça login para registrar sua avaliação crítica da leitura!', 'login');
      return false;
    }

    if (!rating) {
      showToast('Por favor, selecione uma nota de 1 a 5 estrelas.', 'error');
      return false;
    }

    const today = new Date().toLocaleDateString('pt-BR');
    const currentReviews = data.currentReading.reviews || [];
    const existingIdx = currentReviews.findIndex(r => r.memberId === activeMember.id);

    const reviewPayload = {
      memberId: activeMember.id,
      rating: Number(rating),
      comment: comment?.trim() || 'Leitura concluída com sucesso pelo coletivo!',
      recommendation: recommendation || '★ Super recomendo',
      pacing: pacing || 'Segui o ritmo semanal',
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
    if (!currentUser) {
      openAuthModal('Faça login para confirmar sua presença na assembleia literária!', 'login');
      return;
    }

    const isConfirmed = data.meeting.confirmedMembers?.includes(activeMember.id);
    const newConfirmed = isConfirmed
      ? data.meeting.confirmedMembers.filter(id => id !== activeMember.id)
      : [...(data.meeting.confirmedMembers || []), activeMember.id];

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

  // === MURAL DE CITAÇÕES ===
  const addQuote = ({ page, text }) => {
    if (!currentUser) {
      openAuthModal('Faça login para pregar citações no Mural Revolucionário!', 'login');
      return;
    }

    if (!text || !text.trim()) return;

    const formattedPage = page 
      ? (String(page).trim().startsWith('p.') ? String(page).trim() : `p. ${String(page).trim()}`)
      : null;

    const newQuote = {
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      bookTitle: data.currentReading?.title || 'Leitura Coletiva',
      page: formattedPage,
      text: text.trim(),
      memberId: activeMember.id,
      authorName: activeMember.name,
      authorAvatar: activeMember.avatar,
      authorRole: activeMember.roleBadge || activeMember.nickname || 'Membro do Coletivo',
      date: new Date().toLocaleDateString('pt-BR'),
      createdAt: new Date().toISOString(),
      likes: [],
      likedBy: []
    };

    const updatedQuotes = [newQuote, ...(data.quotes || [])];

    setData(prev => ({
      ...prev,
      quotes: updatedQuotes
    }));
    syncToCloud({ quotes: updatedQuotes });

    triggerComradeConfetti(40);
    showToast('Citação pregada no mural com sucesso! ★📝', 'success');
  };

  const updateQuote = (quoteId, { text, page }) => {
    const updatedQuotes = (data.quotes || []).map(q => {
      if (q.id === quoteId) {
        return {
          ...q,
          text: text.trim(),
          page: page ? (String(page).trim().startsWith('p.') ? String(page).trim() : `p. ${String(page).trim()}`) : null
        };
      }
      return q;
    });

    setData(prev => ({ ...prev, quotes: updatedQuotes }));
    syncToCloud({ quotes: updatedQuotes });
    showToast('Citação atualizada com sucesso! 📝★', 'success');
  };

  const deleteQuote = (quoteId) => {
    const updatedQuotes = (data.quotes || []).filter(q => q.id !== quoteId);

    setData(prev => ({ ...prev, quotes: updatedQuotes }));
    syncToCloud({ quotes: updatedQuotes });
    showToast('Citação removida do mural.', 'info');
  };

  const toggleQuoteLike = (quoteId) => {
    const updatedQuotes = (data.quotes || []).map(q => {
      if (q.id === quoteId) {
        const currentLikes = q.likedBy || q.likes || [];
        const hasLiked = currentLikes.includes(activeMember.id);
        const newLikes = hasLiked
          ? currentLikes.filter(id => id !== activeMember.id)
          : [...currentLikes, activeMember.id];
        return { ...q, likes: newLikes, likedBy: newLikes };
      }
      return q;
    });

    setData(prev => ({ ...prev, quotes: updatedQuotes }));
    syncToCloud({ quotes: updatedQuotes });
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

  // Votar em um livro (Limite rigoroso de no máximo 3 votos por membro ativo)
  const toggleVote = (bookId) => {
    if (!currentUser) {
      openAuthModal('Faça login com seu perfil para votar na Urna Popular!', 'login');
      return;
    }

    if (data.ballot?.status !== 'open') {
      showToast('A votação está encerrada no momento.', 'error');
      return;
    }

    const currentBook = data.ballot?.books?.find(b => b.id === bookId);
    if (!currentBook) return;

    const alreadyVotedThis = (currentBook.votes || []).includes(activeMember.id);
    const maxVotes = data.ballot?.maxVotesPerMember || 3;

    // Contar rigorosamente quantos votos o membro ativo já tem na urna
    const totalVotesByMember = (data.ballot?.books || []).reduce((acc, book) => {
      return acc + ((book.votes || []).includes(activeMember.id) ? 1 : 0);
    }, 0);

    if (!alreadyVotedThis && totalVotesByMember >= maxVotes) {
      showToast(`Votos esgotados nesta rodada! Você já utilizou seus ${maxVotes} votos permitidos.`, 'error');
      return;
    }

    const updatedBooks = (data.ballot?.books || []).map(b => {
      if (b.id === bookId) {
        const bookVotes = b.votes || [];
        const newVotes = alreadyVotedThis
          ? bookVotes.filter(id => id !== activeMember.id)
          : [...bookVotes, activeMember.id];
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

  // Indicar livro para a urna (SEM LIMITE DE QUANTIDADE POR PESSOA!)
  const nominateBook = ({ title, author, pages, coverUrl, synopsis, genre, nominationReason }) => {
    const newBook = {
      id: `ballot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      author: author.trim() || 'Autor não informado',
      pages: parseInt(pages, 10) || 280,
      coverUrl: coverUrl || '',
      synopsis: synopsis || 'Sem sinopse cadastrada.',
      genre: genre || 'Literatura',
      nominatedBy: activeMember.id,
      nominationReason: nominationReason?.trim() || 'Indicação especial para o Exército da Paty!',
      votes: [activeMember.id] // Quem indica já vota automaticamente
    };

    const updatedBallot = {
      ...data.ballot,
      books: [...(data.ballot.books || []), newBook]
    };

    setData(prev => ({
      ...prev,
      ballot: updatedBallot
    }));
    syncToCloud({ ballot: updatedBallot });

    triggerComradeConfetti(65);
    showToast(`"${newBook.title}" foi adicionado à urna popular! 📚★`, 'pink');
    return true;
  };

  // Editar indicação existente
  const updateNomination = (bookId, updatedFields) => {
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

    // Salvar o livro anterior no acervo histórico preservando suas resenhas
    const oldBook = data.currentReading;
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
      reviews: oldBook.reviews || []
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
      quotes: [],
      ballot: updatedBallot
    }));

    syncToCloud({
      currentReading: newCurrentReading,
      archive: updatedArchive,
      meeting: updatedMeeting,
      quotes: [],
      ballot: updatedBallot
    });

    triggerComradeConfetti(150);
    showToast(`"${winningBook.title}" foi promovido a Livro do Mês! Nova leitura iniciada! 👑📚★`, 'pink');
  };

  // === ARQUIVAMENTO AUTOMÁTICO E MANUAL DO LIVRO ATUAL NO ACERVO ===
  const archiveCurrentReading = (manual = false) => {
    const current = data.currentReading;
    if (!current) return;

    // Verifica se já está arquivado no acervo para não duplicar
    const alreadyInArchive = (data.archive || []).some(
      b => b.title === current.title || b.id === `archived-${current.id}`
    );

    if (current.isArchived || alreadyInArchive) {
      if (manual) {
        showToast(`"${current.title}" já se encontra arquivado no Acervo Coletivo! ★`, 'info');
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
      : new Date().toLocaleDateString('pt-BR');

    const archivedBook = {
      id: `archived-${current.id || Date.now()}`,
      title: current.title,
      author: current.author,
      pages: current.pages,
      genre: current.genre || 'Ciência Política & Sociedade',
      coverUrl: current.coverUrl,
      readMonth: current.monthYear || 'Novembro / 2026',
      assemblyDate: assemblyDateStr,
      status: 'Concluído',
      synopsis: current.synopsis,
      reviews: reviews,
      averageRating: avgRating,
      archivedAt: new Date().toISOString()
    };

    const updatedReading = {
      ...current,
      isArchived: true
    };
    const updatedArchive = [archivedBook, ...(data.archive || [])];

    setData(prev => ({
      ...prev,
      currentReading: updatedReading,
      archive: updatedArchive
    }));

    syncToCloud({
      currentReading: updatedReading,
      archive: updatedArchive
    });

    if (manual) {
      triggerComradeConfetti(90);
      showToast(`"${current.title}" arquivado no Acervo Coletivo com status Concluído! 📚★`, 'pink');
    } else {
      showToast(`Prazo encerrado! "${current.title}" arquivado automaticamente no Acervo! 🏛️★`, 'pink');
    }
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
  const addOrUpdateReview = (bookId, { rating, comment }) => {
    if (!rating) {
      showToast('Por favor, selecione uma nota de 1 a 5 estrelas.', 'error');
      return;
    }

    const today = new Date().toLocaleDateString('pt-BR');

    const updatedArchive = (data.archive || []).map(book => {
      if (book.id === bookId) {
        const existingReviews = book.reviews || [];
        const existingIndex = existingReviews.findIndex(r => r.memberId === activeMember.id);

        let newReviews;
        if (existingIndex >= 0) {
          newReviews = existingReviews.map((r, idx) => 
            idx === existingIndex 
              ? { ...r, rating: Number(rating), comment: comment.trim(), date: today }
              : r
          );
        } else {
          newReviews = [
            ...existingReviews,
            {
              memberId: activeMember.id,
              rating: Number(rating),
              comment: comment.trim(),
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

  // Excluir resenha do membro ativo
  const deleteReview = (bookId, memberId) => {
    const updatedArchive = (data.archive || []).map(book => {
      if (book.id === bookId) {
        return {
          ...book,
          reviews: (book.reviews || []).filter(r => r.memberId !== memberId)
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
