/**
 * Utilitário Centralizado de Validação Anti-Duplicidade e Deduplicação de Obras
 * Protege a Urna Popular contra cadastros duplicados (com subtítulos, pontuações,
 * acentos ou variações de escrita) e normaliza títulos para comparação robusta.
 */

/**
 * Remove acentos, pontuação excessiva, múltiplos espaços e converte para minúsculas
 */
export function normalizeClean(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^\w\s]/gi, ' ') // remove pontuações mantendo palavras
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrai o título principal da obra antes de separadores comuns de subtítulo
 * (ex: ':', '—', '–', '-', '|', '/', '(', '.')
 */
export function extractMainTitle(title) {
  if (!title) return '';
  const firstSeparator = title.split(/[:\—\–\-\|\/\(\.]/)[0];
  return normalizeClean(firstSeparator);
}

// Stopwords que não alteram a identidade de uma obra
const STOPWORDS = new Set([
  'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas',
  'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na',
  'nos', 'nas', 'por', 'para', 'com', 'sem', 'e', 'ou',
  'se', 'que', 'ao', 'aos', 'sobre'
]);

/**
 * Retorna os tokens significativos de um título (ignorando stopwords)
 */
export function getSignificantTokens(str) {
  const clean = normalizeClean(str);
  return clean
    .split(' ')
    .filter(word => word.length >= 2 && !STOPWORDS.has(word));
}

/**
 * Avalia se dois títulos referem-se à mesma obra
 */
export function areTitlesEquivalent(titleA, titleB) {
  if (!titleA || !titleB) return false;

  const cleanA = normalizeClean(titleA);
  const cleanB = normalizeClean(titleB);
  
  if (!cleanA || !cleanB) return false;

  // 1. Igualdade estrita após normalização básica
  if (cleanA === cleanB) return true;

  // 2. Título principal idêntico (ex: "Como funciona o fascismo: A política..." vs "Como funciona o fascismo")
  const mainA = extractMainTitle(titleA);
  const mainB = extractMainTitle(titleB);
  if (mainA && mainB && mainA === mainB && mainA.length >= 4) {
    return true;
  }

  // 3. Substring containment se um dos títulos for prefixo do outro
  if (cleanA.length >= 5 && cleanB.length >= 5) {
    if (cleanA.startsWith(cleanB) || cleanB.startsWith(cleanA)) {
      return true;
    }
  }

  // 4. Token containment: se todos os tokens significativos de uma versão estão contidos na outra
  const tokensA = getSignificantTokens(titleA);
  const tokensB = getSignificantTokens(titleB);

  if (tokensA.length >= 2 && tokensB.length >= 2) {
    const smaller = tokensA.length <= tokensB.length ? tokensA : tokensB;
    const larger = tokensA.length <= tokensB.length ? tokensB : tokensA;
    const largerSet = new Set(larger);

    const allMatch = smaller.every(t => largerSet.has(t));
    if (allMatch && smaller.length >= 2) {
      return true;
    }
  }

  return false;
}

/**
 * Verifica se um candidato a título já existe na lista de livros da Urna
 * @param {string} candidateTitle Título informado ou selecionado
 * @param {Array} booksList Lista atual de livros da Urna
 * @param {string|null} excludeBookId ID para ignorar (usado ao editar indicação própria)
 * @returns {{ isDuplicate: boolean, matchedBook: Object|null }}
 */
export function findDuplicateBookInBallot(candidateTitle, booksList = [], excludeBookId = null) {
  if (!candidateTitle || !candidateTitle.trim() || !Array.isArray(booksList)) {
    return { isDuplicate: false, matchedBook: null };
  }

  const cleanCandidate = normalizeClean(candidateTitle);
  if (cleanCandidate.length < 2) {
    return { isDuplicate: false, matchedBook: null };
  }

  const matchedBook = booksList.find(b => {
    if (excludeBookId && b.id === excludeBookId) return false;
    return areTitlesEquivalent(candidateTitle, b.title);
  });

  return {
    isDuplicate: Boolean(matchedBook),
    matchedBook: matchedBook || null
  };
}

/**
 * Verifica se a obra informada coincide com a leitura atual do mês
 */
export function isCurrentReadingBook(candidateTitle, currentReading) {
  if (!candidateTitle || !candidateTitle.trim() || !currentReading?.title) {
    return false;
  }
  return areTitlesEquivalent(candidateTitle, currentReading.title);
}

/**
 * Deduplica a lista de livros da Urna preservando todos os votos computados
 * e unificando capas e sinopses mais completas.
 * @param {Array} booksList Lista de livros da urna
 * @returns {{ dedupedBooks: Array, hadDuplicates: boolean }}
 */
export function deduplicateBallotBooks(booksList = []) {
  if (!Array.isArray(booksList) || booksList.length === 0) {
    return { dedupedBooks: [], hadDuplicates: false };
  }

  const deduped = [];
  let hadDuplicates = false;

  for (const book of booksList) {
    if (!book || !book.title) continue;

    const existingIndex = deduped.findIndex(b => areTitlesEquivalent(b.title, book.title));

    if (existingIndex >= 0) {
      hadDuplicates = true;
      const target = deduped[existingIndex];

      // Unir votos sem duplicar o ID da mesma integrante
      const mergedVotes = Array.from(new Set([...(target.votes || []), ...(book.votes || [])]));
      target.votes = mergedVotes;

      // Preservar a melhor sinopse
      if ((!target.synopsis || target.synopsis.length < (book.synopsis || '').length) && book.synopsis) {
        target.synopsis = book.synopsis;
      }

      // Preservar a melhor capa (preferência por imagens reais em vez de SVG fallback)
      if ((!target.coverUrl || target.coverUrl.startsWith('data:image/svg')) && book.coverUrl && !book.coverUrl.startsWith('data:image/svg')) {
        target.coverUrl = book.coverUrl;
      }

      // Preservar maior número de páginas se o atual for default 250
      if ((target.pages === 250 || !target.pages) && book.pages && book.pages !== 250) {
        target.pages = book.pages;
      }
    } else {
      deduped.push({
        ...book,
        votes: Array.isArray(book.votes) ? [...book.votes] : []
      });
    }
  }

  return { dedupedBooks: deduped, hadDuplicates };
}
