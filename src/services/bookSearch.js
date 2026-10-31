/**
 * Serviço de Busca Híbrida Multi-API de Livros
 * Consulta em paralelo/fallback:
 * 1. Apple Books / iTunes Store API (Brasil) - Alta fidelidade em PT-BR, capas HD 600x600 e sinopses editoriais.
 * 2. Google Books API (sem intitle: restritivo e com fallback internacional).
 * 3. Open Library Search API - Excelente para clássicos e contagem exata de páginas.
 */

// Gera uma capa elegante em SVG Data URI caso o livro não tenha thumbnail
export function generateFallbackCover(title, author) {
  const cleanTitle = (title || 'Sem Título').substring(0, 36);
  const cleanAuthor = (author || 'Autor Desconhecido').substring(0, 28);
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" width="300" height="450">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#DC2626" />
        <stop offset="50%" stop-color="#991B1B" />
        <stop offset="100%" stop-color="#450A0A" />
      </linearGradient>
      <linearGradient id="spine" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.35" />
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0.15" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.25" />
      </linearGradient>
      <pattern id="stars" width="24" height="24" patternUnits="userSpaceOnUse">
        <circle cx="6" cy="6" r="1" fill="#FEF08A" fill-opacity="0.35" />
        <circle cx="18" cy="18" r="1.5" fill="#FCA5A5" fill-opacity="0.25" />
      </pattern>
    </defs>
    
    <rect width="300" height="450" fill="url(#bg)" rx="8" />
    <rect width="300" height="450" fill="url(#stars)" rx="8" />
    
    <!-- Moldura dourada -->
    <rect x="18" y="18" width="264" height="414" fill="none" stroke="#FDE047" stroke-width="1.5" stroke-opacity="0.8" rx="6" />
    <rect x="22" y="22" width="256" height="406" fill="none" stroke="#FEF08A" stroke-width="0.75" stroke-opacity="0.4" rx="4" />
    
    <!-- Lombada ilusória -->
    <rect x="0" y="0" width="16" height="450" fill="url(#spine)" />
    
    <!-- Estrela Vermelha / Brasão -->
    <g transform="translate(150, 95)" text-anchor="middle">
      <circle cx="0" cy="0" r="28" fill="#7F1D1D" stroke="#FDE047" stroke-width="1.5" stroke-opacity="0.9" />
      <text x="0" y="9" font-size="24" text-anchor="middle" fill="#FEF08A">★</text>
    </g>

    <!-- Título -->
    <text x="150" y="190" text-anchor="middle" fill="#FFFFFF" font-family="'Plus Jakarta Sans', Georgia, serif" font-size="19" font-weight="bold">
      ${cleanTitle.length > 20 ? cleanTitle.substring(0, 18) + '...' : cleanTitle}
    </text>
    
    <!-- Divisor com brilho -->
    <line x1="90" y1="225" x2="210" y2="225" stroke="#FDE047" stroke-width="1.5" stroke-opacity="0.8" />
    
    <!-- Autor -->
    <text x="150" y="260" text-anchor="middle" fill="#FEF08A" font-family="system-ui, sans-serif" font-size="12" font-weight="600" letter-spacing="1.5">
      ${cleanAuthor.toUpperCase()}
    </text>

    <!-- Selo Exército da Paty -->
    <text x="150" y="375" text-anchor="middle" fill="#FDE047" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="11" letter-spacing="3" opacity="0.95">
      ★ EXÉRCITO DA PATY ★
    </text>
    <text x="150" y="398" text-anchor="middle" fill="#FAF7F0" font-family="system-ui, sans-serif" font-weight="700" font-size="8.5" letter-spacing="0.8" opacity="0.85">
      NÃO VAI LUTAR CONTRA O FASCISMO?
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Limpa tags HTML e entidades de sinopses e textos
export function cleanHtmlText(text) {
  if (!text) return 'Sinopse não informada pelo catálogo da editora.';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

// Higieniza URL de capa
export function sanitizeCoverUrl(imageLinks, title = '', author = '') {
  if (!imageLinks) return generateFallbackCover(title, author);
  
  let url = typeof imageLinks === 'string'
    ? imageLinks
    : imageLinks.extraLarge || 
      imageLinks.large || 
      imageLinks.medium || 
      imageLinks.small || 
      imageLinks.thumbnail || 
      imageLinks.smallThumbnail;

  if (!url) return generateFallbackCover(title, author);

  url = url.replace(/^http:\/\//i, 'https://');
  url = url.replace('&edge=curl', '');
  return url;
}

// Helper para normalizar título para agrupamento e deduplicação
function normalizeTitle(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Consulta a Apple Books / iTunes Store Brasil API
 */
async function fetchAppleBooks(encodedQuery) {
  try {
    const url = `https://itunes.apple.com/search?term=${encodedQuery}&media=ebook&entity=ebook&country=BR&limit=6`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const data = await res.json();
    const results = data.results || [];

    return results.map(item => {
      const hdCover = item.artworkUrl100
        ? item.artworkUrl100.replace('100x100bb', '600x600bb')
        : null;

      return {
        id: `apple-${item.trackId}`,
        source: 'apple',
        title: item.trackName || '',
        author: item.artistName || 'Autor Desconhecido',
        coverUrl: hdCover || generateFallbackCover(item.trackName, item.artistName),
        genre: item.genres?.[0] || 'Literatura',
        synopsis: cleanHtmlText(item.description),
        pages: null, // iTunes geralmente não informa pageCount no resumo
        raw: item
      };
    });
  } catch {
    return [];
  }
}

/**
 * Consulta a Google Books API (sem intitle: e com fallback internacional)
 */
async function fetchGoogleBooks(encodedQuery) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const primaryUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&langRestrict=pt&maxResults=6`;
    let res = await fetch(primaryUrl, { signal: controller.signal });
    let data = res.ok ? await res.json() : null;
    let items = data?.items || [];

    if (items.length === 0) {
      const fallbackUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&maxResults=6`;
      res = await fetch(fallbackUrl, { signal: controller.signal });
      if (res.ok) {
        data = await res.json();
        items = data?.items || [];
      }
    }
    clearTimeout(timeoutId);

    return (items || []).map(item => {
      const info = item.volumeInfo || {};
      const title = info.title || 'Título Indisponível';
      const authors = info.authors ? info.authors.join(', ') : 'Autor Desconhecido';
      const coverUrl = sanitizeCoverUrl(info.imageLinks, title, authors);
      const synopsis = cleanHtmlText(info.description);
      const pages = info.pageCount ? parseInt(info.pageCount, 10) : null;
      const genre = info.categories?.[0] || 'Literatura';

      return {
        id: item.id || `gb-${Math.random().toString(36).substring(2, 8)}`,
        source: 'google',
        title,
        author: authors,
        coverUrl,
        genre,
        synopsis,
        pages,
        year: info.publishedDate ? info.publishedDate.substring(0, 4) : '',
        raw: item
      };
    });
  } catch {
    return [];
  }
}

/**
 * Consulta a Open Library Search API
 */
async function fetchOpenLibrary(encodedQuery) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const url = `https://openlibrary.org/search.json?q=${encodedQuery}&limit=6`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const data = await res.json();
    const docs = data.docs || [];

    return docs.map(doc => {
      const title = doc.title || '';
      const authors = doc.author_name ? doc.author_name.join(', ') : 'Autor Desconhecido';
      const pages = doc.number_of_pages_median 
        ? parseInt(doc.number_of_pages_median, 10) 
        : (doc.number_of_pages ? parseInt(doc.number_of_pages, 10) : null);
      
      const coverUrl = doc.cover_i 
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
        : generateFallbackCover(title, authors);

      const genre = doc.subject?.[0] || 'Literatura';
      const firstSentence = doc.first_sentence 
        ? (Array.isArray(doc.first_sentence) ? doc.first_sentence.join(' ') : doc.first_sentence)
        : '';

      return {
        id: `ol-${doc.key || Math.random().toString(36).substring(2, 8)}`,
        source: 'openlibrary',
        title,
        author: authors,
        coverUrl,
        genre,
        synopsis: cleanHtmlText(firstSentence) || 'Sinopse disponível no acervo editorial.',
        pages,
        raw: doc
      };
    });
  } catch {
    return [];
  }
}

/**
 * Função Principal de Autocomplete Multi-API
 * Realiza busca paralela nas 3 APIs e mescla resultados inteligentemente.
 * @param {string} query Termo digitado pelo camarada (pelo menos 3 letras)
 * @returns {Promise<Array>} Lista de até 6 sugestões enriquecidas
 */
export async function searchBooksAutocomplete(query) {
  if (!query || query.trim().length < 3) {
    return [];
  }

  const cleanQuery = query.trim();
  const encodedQuery = encodeURIComponent(cleanQuery);

  // Executa as 3 fontes em paralelo com tratamento resiliente
  const [appleRes, googleRes, openLibRes] = await Promise.allSettled([
    fetchAppleBooks(encodedQuery),
    fetchGoogleBooks(encodedQuery),
    fetchOpenLibrary(encodedQuery)
  ]);

  const appleBooks = appleRes.status === 'fulfilled' ? appleRes.value : [];
  const googleBooks = googleRes.status === 'fulfilled' ? googleRes.value : [];
  const openLibraryBooks = openLibRes.status === 'fulfilled' ? openLibRes.value : [];

  // Mapa para agrupar e mesclar dados complementares por título normalizado
  const mergedMap = new Map();

  // 1. Processa Apple Books (Prioridade para capas HD e sinopses fluídas em PT-BR)
  for (const book of appleBooks) {
    const key = normalizeTitle(book.title);
    if (!key) continue;
    mergedMap.set(key, { ...book });
  }

  // 2. Processa Google Books (Enriquece com pageCount, categorias e adiciona novas obras)
  for (const book of googleBooks) {
    const key = normalizeTitle(book.title);
    if (!key) continue;

    if (mergedMap.has(key)) {
      const existing = mergedMap.get(key);
      // Se a Apple não tinha páginas, herda de Google
      if (!existing.pages && book.pages) {
        existing.pages = book.pages;
      }
      // Se a sinopse da Apple for vazia, herda da Google
      if ((!existing.synopsis || existing.synopsis.length < 30) && book.synopsis) {
        existing.synopsis = book.synopsis;
      }
      // Se a capa da Apple for fallback mas a Google tiver imagem real
      if (existing.coverUrl?.startsWith('data:image/svg') && !book.coverUrl?.startsWith('data:image/svg')) {
        existing.coverUrl = book.coverUrl;
      }
    } else {
      mergedMap.set(key, { ...book });
    }
  }

  // 3. Processa Open Library (Excelente para número exato de páginas de clássicos)
  for (const book of openLibraryBooks) {
    const key = normalizeTitle(book.title);
    if (!key) continue;

    if (mergedMap.has(key)) {
      const existing = mergedMap.get(key);
      if (!existing.pages && book.pages) {
        existing.pages = book.pages;
      }
      if (existing.coverUrl?.startsWith('data:image/svg') && !book.coverUrl?.startsWith('data:image/svg')) {
        existing.coverUrl = book.coverUrl;
      }
    } else if (mergedMap.size < 8) {
      mergedMap.set(key, { ...book });
    }
  }

  // Converte o mapa em lista final de até 6 sugestões
  const results = Array.from(mergedMap.values()).map(item => {
    return {
      ...item,
      // Se nenhuma API tiver trazido o total de páginas, define um padrão razoável de leitura
      pages: item.pages ? parseInt(item.pages, 10) : 280,
      genre: item.genre || 'Literatura',
      synopsis: item.synopsis || 'Sinopse editorial em processamento pelo comitê do clube.'
    };
  });

  return results.slice(0, 6);
}
