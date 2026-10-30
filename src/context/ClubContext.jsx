import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  INITIAL_MEMBERS,
  INITIAL_CURRENT_READING,
  INITIAL_MEETING,
  INITIAL_QUOTES,
  INITIAL_BALLOT,
  INITIAL_ARCHIVE,
  STORAGE_KEY,
  getInitialMeetingDate
} from '../data/initialData';

const ClubContext = createContext(null);

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
  // Inicialização com dados do localStorage ou mock data
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Verifica se os membros são os novos gatinhos (Paty, Lara, Stephany, etc.)
        const hasNewMembers = parsed.members?.some(m => m.name.includes('Paty (Gatinha Líder)') || m.name === 'Lara');
        if (parsed.members && parsed.currentReading && parsed.meeting && parsed.ballot && hasNewMembers) {
          // Garante que currentReading tenha campo reviews
          if (!parsed.currentReading.reviews) {
            parsed.currentReading.reviews = [];
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Erro ao ler localStorage do Clube do Livro:', e);
    }
    return {
      activeMemberId: 'm1',
      members: INITIAL_MEMBERS,
      currentReading: INITIAL_CURRENT_READING,
      meeting: INITIAL_MEETING,
      quotes: INITIAL_QUOTES,
      ballot: INITIAL_BALLOT,
      archive: INITIAL_ARCHIVE
    };
  });

  const [toast, setToast] = useState(null);

  // Helper para exibir toasts informativos
  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  // Salvar no localStorage sempre que os dados mudarem
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Falha ao persistir no localStorage:', e);
    }
  }, [data]);

  // Membro ativo atual
  const activeMember = data.members.find(m => m.id === data.activeMemberId) || data.members[0];

  // Alternar membro ativo
  const setActiveMember = (memberId) => {
    const member = data.members.find(m => m.id === memberId);
    setData(prev => ({ ...prev, activeMemberId: memberId }));
    if (member) {
      showToast(`Perfil alternado para ${member.name} 🐾★`, 'info');
    }
  };

  // Resetar dados para o padrão limpo do Exército da Paty
  const resetToDefaults = () => {
    const defaultData = {
      activeMemberId: 'm1',
      members: INITIAL_MEMBERS,
      currentReading: INITIAL_CURRENT_READING,
      meeting: {
        ...INITIAL_MEETING,
        dateTime: getInitialMeetingDate()
      },
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
    localStorage.removeItem(STORAGE_KEY);
    triggerComradeConfetti(80);
    showToast('Dados reinicializados com sucesso para o Exército da Paty! 🐾★', 'pink');
  };

  // === EDIÇÃO DE PERFIL DO MEMBRO ===
  const updateMemberProfile = (memberId, updatedFields) => {
    setData(prev => {
      const updatedMembers = prev.members.map(m => {
        if (m.id === memberId) {
          return {
            ...m,
            ...updatedFields
          };
        }
        return m;
      });

      return {
        ...prev,
        members: updatedMembers
      };
    });

    triggerComradeConfetti(45);
    showToast('Perfil atualizado com sucesso! 🐾★', 'success');
  };

  // === EDIÇÃO E GERENCIAMENTO DA REUNIÃO ===
  const updateMeeting = (meetingData) => {
    setData(prev => ({
      ...prev,
      meeting: {
        ...prev.meeting,
        ...meetingData
      }
    }));

    triggerComradeConfetti(40);
    showToast('Detalhes do encontro atualizados com sucesso! 📅★', 'success');
  };

  // === METAS DE LEITURA (Semanais) ===
  const toggleWeeklyGoal = (goalId) => {
    setData(prev => {
      const current = prev.currentReading;
      const memberGoals = current.memberProgress?.[activeMember.id] || [];
      const hasCompleted = memberGoals.includes(goalId);
      
      const newGoals = hasCompleted
        ? memberGoals.filter(id => id !== goalId)
        : [...memberGoals, goalId];

      const updatedProgress = {
        ...(current.memberProgress || {}),
        [activeMember.id]: newGoals
      };

      if (!hasCompleted && newGoals.length === current.readingGoals?.length) {
        triggerComradeConfetti(90);
        showToast('Parabéns, camarada! Você concluiu todas as 4 semanas do livro! 📚👑🐾', 'pink');
      } else if (!hasCompleted) {
        showToast('Meta semanal concluída! Avanço revolucionário registrado! ★', 'success');
      }

      return {
        ...prev,
        currentReading: {
          ...current,
          memberProgress: updatedProgress
        }
      };
    });
  };

  // === EDIÇÃO DO LIVRO ATUAL ===
  const updateCurrentReading = (updatedFields) => {
    setData(prev => ({
      ...prev,
      currentReading: {
        ...prev.currentReading,
        ...updatedFields
      }
    }));
    showToast('Dados da leitura atual atualizados! 📖★', 'success');
  };

  // === AVALIAÇÃO DA OBRA ATUAL (SEMANA 4) ===
  const submitCurrentBookReview = ({ rating, comment, recommendation, pacing }) => {
    if (!rating) {
      showToast('Por favor, selecione uma nota de 1 a 5 estrelas.', 'error');
      return false;
    }

    const today = new Date().toLocaleDateString('pt-BR');

    setData(prev => {
      const currentReviews = prev.currentReading.reviews || [];
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

      return {
        ...prev,
        currentReading: {
          ...prev.currentReading,
          reviews: updatedReviews
        }
      };
    });

    triggerComradeConfetti(100);
    showToast('Sua avaliação crítica foi registrada com sucesso nas métricas do clube! 🐾★', 'pink');
    return true;
  };

  // === RSVP (Confirmação de Presença) ===
  const toggleRsvp = () => {
    setData(prev => {
      const isConfirmed = prev.meeting.confirmedMembers.includes(activeMember.id);
      const newConfirmed = isConfirmed
        ? prev.meeting.confirmedMembers.filter(id => id !== activeMember.id)
        : [...prev.meeting.confirmedMembers, activeMember.id];

      if (!isConfirmed) {
        triggerComradeConfetti(55);
        showToast(`Presença confirmada para ${activeMember.name}! Te vemos na assembleia ★`, 'pink');
      } else {
        showToast('Confirmação de presença cancelada.', 'info');
      }

      return {
        ...prev,
        meeting: {
          ...prev.meeting,
          confirmedMembers: newConfirmed
        }
      };
    });
  };

  // === MURAL DE CITAÇÕES ===
  const addQuote = ({ page, text }) => {
    if (!text || !text.trim()) return;

    const newQuote = {
      id: `q-${Date.now()}`,
      bookTitle: data.currentReading.title,
      page: parseInt(page, 10) || null,
      text: text.trim(),
      memberId: activeMember.id,
      createdAt: new Date().toISOString(),
      likes: []
    };

    setData(prev => ({
      ...prev,
      quotes: [newQuote, ...prev.quotes]
    }));

    triggerComradeConfetti(40);
    showToast('Citação pregada no mural com sucesso! ★📝', 'success');
  };

  const updateQuote = (quoteId, { text, page }) => {
    setData(prev => ({
      ...prev,
      quotes: prev.quotes.map(q => {
        if (q.id === quoteId) {
          return {
            ...q,
            text: text.trim(),
            page: parseInt(page, 10) || null
          };
        }
        return q;
      })
    }));
    showToast('Citação atualizada com sucesso! ★', 'success');
  };

  const deleteQuote = (quoteId) => {
    setData(prev => ({
      ...prev,
      quotes: prev.quotes.filter(q => q.id !== quoteId)
    }));
    showToast('Citação excluída.', 'info');
  };

  const toggleQuoteLike = (quoteId) => {
    setData(prev => {
      return {
        ...prev,
        quotes: prev.quotes.map(q => {
          if (q.id === quoteId) {
            const hasLiked = q.likes?.includes(activeMember.id);
            const newLikes = hasLiked
              ? q.likes.filter(id => id !== activeMember.id)
              : [...(q.likes || []), activeMember.id];
            return { ...q, likes: newLikes };
          }
          return q;
        })
      };
    });
  };

  // === URNA DE VOTAÇÃO ===
  const toggleBallotStatus = () => {
    setData(prev => {
      const newStatus = prev.ballot.status === 'open' ? 'closed' : 'open';
      showToast(newStatus === 'open' ? 'Urna popular aberta para o Exército da Paty!' : 'Urna popular encerrada.', 'info');
      return {
        ...prev,
        ballot: {
          ...prev.ballot,
          status: newStatus
        }
      };
    });
  };

  // Votar em um livro
  const toggleVote = (bookId) => {
    if (data.ballot.status !== 'open') {
      showToast('A votação está encerrada no momento.', 'error');
      return;
    }

    const currentBook = data.ballot.books.find(b => b.id === bookId);
    if (!currentBook) return;

    const alreadyVotedThis = currentBook.votes.includes(activeMember.id);

    // Contar quantos votos o membro ativo já tem na urna
    const totalVotesByMember = data.ballot.books.reduce((acc, book) => {
      return acc + (book.votes.includes(activeMember.id) ? 1 : 0);
    }, 0);

    if (!alreadyVotedThis && totalVotesByMember >= data.ballot.maxVotesPerMember) {
      showToast(`Você já atingiu seu limite de ${data.ballot.maxVotesPerMember} votos nesta rodada.`, 'error');
      return;
    }

    setData(prev => {
      const updatedBooks = prev.ballot.books.map(b => {
        if (b.id === bookId) {
          const newVotes = alreadyVotedThis
            ? b.votes.filter(id => id !== activeMember.id)
            : [...b.votes, activeMember.id];
          return { ...b, votes: newVotes };
        }
        return b;
      });

      return {
        ...prev,
        ballot: {
          ...prev.ballot,
          books: updatedBooks
        }
      };
    });

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

    setData(prev => ({
      ...prev,
      ballot: {
        ...prev.ballot,
        books: [...(prev.ballot.books || []), newBook]
      }
    }));

    triggerComradeConfetti(65);
    showToast(`"${newBook.title}" foi adicionado à urna popular! 📚★`, 'pink');
    return true;
  };

  // Editar indicação existente
  const updateNomination = (bookId, updatedFields) => {
    setData(prev => {
      const updatedBooks = prev.ballot.books.map(b => {
        if (b.id === bookId) {
          return {
            ...b,
            ...updatedFields,
            pages: parseInt(updatedFields.pages, 10) || b.pages
          };
        }
        return b;
      });

      return {
        ...prev,
        ballot: {
          ...prev.ballot,
          books: updatedBooks
        }
      };
    });

    showToast('Indicação atualizada com sucesso! ★', 'success');
  };

  // Excluir indicação própria da urna
  const deleteNomination = (bookId) => {
    setData(prev => ({
      ...prev,
      ballot: {
        ...prev.ballot,
        books: prev.ballot.books.filter(b => b.id !== bookId)
      }
    }));

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
    nextMeetingDate.setHours(20, 15, 0, 0);

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

    setData(prev => ({
      ...prev,
      currentReading: newCurrentReading,
      archive: [archivedOldBook, ...(prev.archive || [])],
      meeting: {
        ...prev.meeting,
        dateTime: nextMeetingDate.toISOString(),
        formattedDate: `quarta-feira, 20:15`,
        confirmedMembers: []
      },
      quotes: [],
      ballot: {
        ...prev.ballot,
        books: remainingBooks,
        status: 'open',
        title: `Eleição da Próxima Leitura`
      }
    }));

    triggerComradeConfetti(150);
    showToast(`"${winningBook.title}" foi promovido a Livro do Mês! Nova leitura iniciada! 👑📚★`, 'pink');
  };

  // === ACERVO & RESENHAS ===
  const addOrUpdateReview = (bookId, { rating, comment }) => {
    if (!rating) {
      showToast('Por favor, selecione uma nota de 1 a 5 estrelas.', 'error');
      return;
    }

    const today = new Date().toLocaleDateString('pt-BR');

    setData(prev => {
      const updatedArchive = (prev.archive || []).map(book => {
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

      return {
        ...prev,
        archive: updatedArchive
      };
    });

    triggerComradeConfetti(50);
    showToast('Sua resenha crítica foi salva com sucesso! 🐾★', 'success');
  };

  // Excluir resenha do membro ativo
  const deleteReview = (bookId, memberId) => {
    setData(prev => {
      const updatedArchive = (prev.archive || []).map(book => {
        if (book.id === bookId) {
          return {
            ...book,
            reviews: (book.reviews || []).filter(r => r.memberId !== memberId)
          };
        }
        return book;
      });

      return {
        ...prev,
        archive: updatedArchive
      };
    });

    showToast('Sua resenha foi removida do acervo.', 'info');
  };

  // Estatísticas calculadas dinamicamente (inclui avaliações do livro atual e do acervo)
  const stats = React.useMemo(() => {
    const archivePages = (data.archive || []).reduce((acc, b) => acc + (b.pages || 0), 0);
    const goalsDone = data.currentReading.readingGoals?.length || 4;
    const memberProgress = data.currentReading.memberProgress || {};
    const totalGoalsCompleted = Object.values(memberProgress).flat().length;
    const avgCompletion = totalGoalsCompleted / (data.members.length * goalsDone || 1);
    const currentReadingPages = Math.round((data.currentReading.pages || 0) * avgCompletion);
    
    const totalPagesYear = archivePages + currentReadingPages;
    const meetingsHeld = (data.archive || []).length;

    // Todas as avaliações (acervo + leitura atual)
    const allReviews = [
      ...(data.archive || []).flatMap(b => b.reviews || []),
      ...(data.currentReading?.reviews || [])
    ];
    
    const averageRating = allReviews.length > 0 
      ? (allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length).toFixed(1)
      : '5.0';

    const genreCounts = {};
    [...(data.archive || []), data.currentReading].forEach(b => {
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
      totalPagesYear,
      meetingsHeld,
      averageRating,
      topGenre,
      totalQuotes: (data.quotes || []).length,
      totalBooksRead: (data.archive || []).length + ((data.currentReading?.reviews || []).length > 0 ? 1 : 0),
      totalReviewsCount: allReviews.length
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
        archive: data.archive || [],
        addOrUpdateReview,
        deleteReview,
        stats,
        resetToDefaults,
        toast,
        showToast,
        closeToast
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
