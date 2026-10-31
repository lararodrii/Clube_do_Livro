/**
 * Algoritmo Inteligente de Cruzamento de Grifos & Detector de Consenso Coletivo
 * 
 * Normaliza textos, calcula similaridade semântica (sub-sequência e sobreposição > 55%),
 * tolera variações de paginação (+- 1 página entre edições de PDF/Kindle)
 * e une múltiplos grifos com marcação de isConsensus = true (quando 2+ camaradas grifam o mesmo ponto).
 */

/**
 * Higieniza e normaliza uma string para comparação fonética e lexical
 */
export function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos (é -> e, ã -> a)
    .replace(/[^\w\s]/gi, ' ') // Remove pontuações e aspas
    .replace(/\s+/g, ' ') // Unifica espaços múltiplos
    .trim();
}

/**
 * Calcula a taxa de similaridade entre dois trechos de texto (0 a 1.0)
 * Baseado no coeficiente de sobreposição lexical (Dice/Jaccard) e contenção de subsequência.
 */
export function calculateTextSimilarity(text1, text2) {
  const s1 = normalizeText(text1);
  const s2 = normalizeText(text2);

  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1.0;

  // Se um trecho está contido no outro e é substancial (>= 45% do comprimento do maior)
  if (s1.includes(s2) || s2.includes(s1)) {
    const minLen = Math.min(s1.length, s2.length);
    const maxLen = Math.max(s1.length, s2.length);
    const ratio = minLen / maxLen;
    return ratio >= 0.35 ? 0.90 : ratio + 0.4;
  }

  // Compara conjunto de palavras com mais de 2 letras
  const words1 = s1.split(' ').filter(w => w.length > 2);
  const words2 = s2.split(' ').filter(w => w.length > 2);

  if (words1.length === 0 || words2.length === 0) return 0;

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  let common = 0;
  for (const w of set1) {
    if (set2.has(w)) common++;
  }

  // Similaridade de sobreposição em relação ao menor conjunto de palavras
  const overlapRatio = common / Math.min(set1.size, set2.size);
  // Similaridade de Jaccard
  const jaccard = common / (set1.size + set2.size - common);

  // Média ponderada dando maior peso ao fato de as palavras do trecho menor estarem no maior
  return overlapRatio * 0.7 + jaccard * 0.3;
}

/**
 * Determina se dois grifos correspondem ao mesmo trecho do livro
 */
export function isSameHighlight(h1, h2) {
  const p1 = parseInt(h1.page, 10);
  const p2 = parseInt(h2.page, 10);

  const similarity = calculateTextSimilarity(h1.text, h2.text);

  // Caso 1: Mesma página ou páginas vizinhas (+- 1 página de diferença entre versões)
  if (!isNaN(p1) && !isNaN(p2) && Math.abs(p1 - p2) <= 1) {
    return similarity >= 0.50; // Mais de 50% de palavras em comum na mesma vizinhança
  }

  // Caso 2: Páginas até 2 de distância, requer maior similaridade
  if (!isNaN(p1) && !isNaN(p2) && Math.abs(p1 - p2) <= 2) {
    return similarity >= 0.65;
  }

  // Caso 3: Página desconhecida (ex: Kindle com posição em vez de página)
  return similarity >= 0.72;
}

/**
 * Cruza uma lista de novos grifos com o Dossiê existente do clube,
 * associando a integrante logada e detectando consensos automaticamente.
 * 
 * @param {Array} currentDossier - Grifos já registrados no Firestore para a obra
 * @param {Array} incomingHighlights - Novos grifos extraídos do arquivo ou manuais
 * @param {Object} member - Integrante ativa ({ id, name, avatar, roleBadge })
 * @returns {Object} { updatedDossier, newCount, newConsensusCount, consensusHighlights }
 */
export function mergeHighlightsIntoDossier(currentDossier = [], incomingHighlights = [], member) {
  const memberId = member?.id || 'm1';
  const memberName = member?.name || 'Camarada';
  const memberAvatar = member?.avatar || '/avatars/gato1.jpg';
  const memberRole = member?.roleBadge || '★ Camarada';

  const updatedDossier = (currentDossier || []).map(h => ({
    ...h,
    highlightedBy: Array.isArray(h.highlightedBy) ? [...h.highlightedBy] : [],
    comments: Array.isArray(h.comments) ? [...h.comments] : []
  }));

  let newCount = 0;
  let newConsensusCount = 0;
  const newlyFormedConsensus = [];

  for (const item of incomingHighlights) {
    if (!item.text || !item.text.trim()) continue;

    // Procura se já existe correspondência no dossiê
    let matchIdx = updatedDossier.findIndex(existing => isSameHighlight(existing, item));

    const memberEntry = {
      id: memberId,
      name: memberName,
      avatar: memberAvatar,
      roleBadge: memberRole,
      note: item.note || '',
      color: item.color || { name: 'Amarelo Revolucionário', hex: '#FDE047', bgClass: 'bg-yellow-300/40 border-yellow-400 text-yellow-950' },
      date: new Date().toLocaleDateString('pt-BR')
    };

    if (matchIdx >= 0) {
      // Já existe: funde no registro existente
      const target = updatedDossier[matchIdx];
      const hadConsensusBefore = target.isConsensus;

      // Adiciona o membro se ainda não constar neste grifo
      const alreadyHasMember = target.highlightedBy.some(m => m.id === memberId);
      if (!alreadyHasMember) {
        target.highlightedBy.push(memberEntry);
      } else {
        // Atualiza nota do membro se houver uma nova
        if (item.note) {
          const mIdx = target.highlightedBy.findIndex(m => m.id === memberId);
          if (mIdx >= 0 && !target.highlightedBy[mIdx].note) {
            target.highlightedBy[mIdx].note = item.note;
          }
        }
      }

      // Se o novo trecho for mais longo e completo, adota como texto principal
      if (item.text.length > target.text.length) {
        target.text = item.text;
      }

      // Atualiza página se a atual estiver melhor definida
      if (!target.page && item.page) {
        target.page = item.page;
      }

      // Se atingiu 2 ou mais integrantes distintas, MARCA CONSENSO!
      const uniqueMembers = new Set(target.highlightedBy.map(m => m.id));
      if (uniqueMembers.size >= 2) {
        target.isConsensus = true;
        if (!hadConsensusBefore) {
          newConsensusCount++;
          newlyFormedConsensus.push(target);
        }
      }

      target.updatedAt = new Date().toISOString();
    } else {
      // Novo grifo inédito
      const newDossierItem = {
        id: item.id || `hl-dos-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        page: item.page || 1,
        text: item.text.trim(),
        color: item.color || { name: 'Amarelo Revolucionário', hex: '#FDE047', bgClass: 'bg-yellow-300/40 border-yellow-400 text-yellow-950' },
        isConsensus: false,
        isSpoiler: !!item.isSpoiler,
        highlightedBy: [memberEntry],
        comments: item.note ? [{
          id: `c-${Date.now()}`,
          memberId,
          authorName: memberName,
          authorAvatar: memberAvatar,
          text: item.note,
          date: new Date().toLocaleDateString('pt-BR'),
          createdAt: new Date().toISOString()
        }] : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      updatedDossier.push(newDossierItem);
      newCount++;
    }
  }

  // Ordena por página crescente por padrão
  updatedDossier.sort((a, b) => {
    const pA = parseInt(a.page, 10) || 0;
    const pB = parseInt(b.page, 10) || 0;
    return pA - pB;
  });

  return {
    updatedDossier,
    newCount,
    newConsensusCount,
    consensusHighlights: newlyFormedConsensus
  };
}
