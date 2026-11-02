/**
 * Utilitário de Sincronização Estrita de Consensos do Comitê para o Mural e Acervo.
 * 
 * Regras do Exército da Paty:
 * 1. Filtragem Estrita para o Mural:
 *    Exclusivamente trechos classificados como Consensos do Comitê (2 ou mais camaradas).
 *    Destaques individuais ficam restritos ao Dossiê Coletivo ou à visão pessoal.
 * 
 * 2. Registro Automático no Acervo:
 *    Sempre que um novo consenso for identificado e salvo, vincula-se e registra-se
 *    automaticamente no Acervo da plataforma, associando a citação diretamente ao livro lido da vez
 *    e ao ciclo de debate atual.
 */

export function isConsensusHighlight(h) {
  if (!h) return false;
  if (h.isConsensus === true) return true;
  if (Array.isArray(h.highlightedBy) && h.highlightedBy.length >= 2) return true;
  return false;
}

export function filterConsensusHighlights(highlights = []) {
  if (!Array.isArray(highlights)) return [];
  return highlights.filter(isConsensusHighlight);
}

export function buildConsensusQuotes(highlights = [], currentReading = null, meeting = null) {
  const consensusList = filterConsensusHighlights(highlights);
  const currentCycle = currentReading?.monthYear || 'Novembro / 2026';
  const meetingDateStr = meeting?.dateTime
    ? new Date(meeting.dateTime).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : (meeting?.formattedDate || 'quarta-feira, 20:00');

  return consensusList.map(h => {
    const highlighters = Array.isArray(h.highlightedBy) ? h.highlightedBy : [];
    const firstAuthor = highlighters[0] || { name: 'Comitê', avatar: '/avatars/gato1.jpg' };
    const memberNames = highlighters.map(m => m.name.split(' ')[0]).join(' & ');

    const formattedPage = h.page
      ? (String(h.page).trim().startsWith('p.') ? String(h.page).trim() : `p. ${String(h.page).trim()}`)
      : null;

    return {
      id: h.id.startsWith('hl-') ? h.id.replace('hl-', 'q-consensus-') : `q-consensus-${h.id}`,
      highlightId: h.id,
      bookId: currentReading?.id || 'current-democracias',
      bookTitle: currentReading?.title || 'Como as democracias morrem',
      debateCycle: currentCycle,
      assemblyDate: meetingDateStr,
      page: formattedPage,
      text: h.text,
      color: h.color || { name: 'Amarelo Revolucionário', hex: '#FDE047', bgClass: 'bg-yellow-300/40 border-yellow-400 text-yellow-950' },
      isConsensus: true,
      isSpoiler: !!h.isSpoiler,
      isBookSpecific: true,
      highlightedBy: highlighters,
      authorName: memberNames ? `Consenso: ${memberNames}` : 'Consenso do Comitê',
      authorAvatar: firstAuthor.avatar || '/avatars/gato1.jpg',
      authorRole: `★ Consenso do Comitê (${highlighters.length} camaradas)`,
      memberId: firstAuthor.id || 'consensus',
      comments: Array.isArray(h.comments) ? h.comments : [],
      likes: Array.isArray(h.likes) ? h.likes : [],
      likedBy: Array.isArray(h.likedBy) ? h.likedBy : (Array.isArray(h.likes) ? h.likes : []),
      date: h.updatedAt ? new Date(h.updatedAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
      createdAt: h.createdAt || new Date().toISOString()
    };
  });
}

export function syncConsensusToArchive(currentArchive = [], consensusQuotes = [], highlights = [], currentReading = null, meeting = null) {
  if (!currentReading) return currentArchive || [];

  const archiveList = Array.isArray(currentArchive) ? [...currentArchive] : [];
  const currentCycle = currentReading.monthYear || 'Novembro / 2026';
  const meetingDateStr = meeting?.dateTime
    ? new Date(meeting.dateTime).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : (meeting?.formattedDate || 'quarta-feira, 20:00');

  const bookIdx = archiveList.findIndex(b => 
    b.title === currentReading.title || b.id === currentReading.id || b.id === `archived-${currentReading.id}`
  );

  if (bookIdx >= 0) {
    const existing = archiveList[bookIdx];
    const existingReviews = Array.isArray(existing.reviews) ? existing.reviews : [];
    const currentReviews = Array.isArray(currentReading.reviews) ? currentReading.reviews : [];
    const mergedReviewsMap = new Map();
    existingReviews.forEach(r => { if (r?.memberId) mergedReviewsMap.set(r.memberId, r); });
    currentReviews.forEach(r => { if (r?.memberId) mergedReviewsMap.set(r.memberId, r); });
    const mergedReviews = mergedReviewsMap.size > 0
      ? Array.from(mergedReviewsMap.values())
      : (existingReviews.length > 0 ? existingReviews : currentReviews);

    archiveList[bookIdx] = {
      ...existing,
      title: currentReading.title,
      author: currentReading.author,
      pages: currentReading.pages,
      genre: currentReading.genre || existing.genre || 'Ciência Política & Sociedade',
      coverUrl: currentReading.coverUrl || existing.coverUrl,
      readMonth: currentReading.monthYear || existing.readMonth || currentCycle,
      cycle: currentCycle,
      debateCycle: currentCycle,
      assemblyDate: meetingDateStr || existing.assemblyDate,
      status: existing.status || (currentReading.isArchived ? 'Concluído' : 'Ciclo Atual / Em Debate'),
      synopsis: currentReading.synopsis || existing.synopsis,
      reviews: mergedReviews,
      quotes: consensusQuotes,
      consensusQuotes: consensusQuotes,
      highlights: highlights || [],
      updatedAt: new Date().toISOString()
    };
  } else {
    const newArchivedBook = {
      id: `archived-${currentReading.id || Date.now()}`,
      title: currentReading.title,
      author: currentReading.author,
      pages: currentReading.pages,
      genre: currentReading.genre || 'Ciência Política & Sociedade',
      coverUrl: currentReading.coverUrl,
      readMonth: currentCycle,
      cycle: currentCycle,
      debateCycle: currentCycle,
      assemblyDate: meetingDateStr,
      status: currentReading.isArchived ? 'Concluído' : 'Ciclo Atual / Em Debate',
      synopsis: currentReading.synopsis,
      reviews: currentReading.reviews || [],
      quotes: consensusQuotes,
      consensusQuotes: consensusQuotes,
      highlights: highlights || [],
      averageRating: '5.0',
      archivedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    archiveList.unshift(newArchivedBook);
  }

  return archiveList;
}

export function syncConsensusState({ highlights = [], currentReading = null, meeting = null, archive = [] }) {
  const consensusQuotes = buildConsensusQuotes(highlights, currentReading, meeting);
  const updatedArchive = syncConsensusToArchive(archive, consensusQuotes, highlights, currentReading, meeting);
  return {
    consensusQuotes,
    updatedArchive
  };
}
