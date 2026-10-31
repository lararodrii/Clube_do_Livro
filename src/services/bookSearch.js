/**
 * Serviço Blindado de Busca Multi-API de Livros
 * Consulta com isolamento total em blocos try/catch independentes:
 * 1. Open Library API (CORS 100% liberado, ilimitado e sem bloqueio).
 * 2. Google Books API (com limite isolado e campos completos).
 * 3. Apple Books Brasil via JSONP (contorna 100% o bloqueio de CORS do navegador via <script> tag).
 */

// Limpa tags HTML e entidades de sinopses e textos
export function cleanHtmlText(text) {
  if (!text) return '';
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
    </defs>
    <rect width="300" height="450" fill="url(#bg)" rx="8" />
    <rect x="18" y="18" width="264" height="414" fill="none" stroke="#FDE047" stroke-width="1.5" rx="6" />
    <rect x="0" y="0" width="16" height="450" fill="url(#spine)" />
    <g transform="translate(150, 95)" text-anchor="middle">
      <circle cx="0" cy="0" r="28" fill="#7F1D1D" stroke="#FDE047" stroke-width="1.5" />
      <text x="0" y="9" font-size="24" text-anchor="middle" fill="#FEF08A">★</text>
    </g>
    <text x="150" y="190" text-anchor="middle" fill="#FFFFFF" font-family="serif" font-size="18" font-weight="bold">
      ${cleanTitle.length > 20 ? cleanTitle.substring(0, 18) + '...' : cleanTitle}
    </text>
    <line x1="90" y1="225" x2="210" y2="225" stroke="#FDE047" stroke-width="1.5" />
    <text x="150" y="260" text-anchor="middle" fill="#FEF08A" font-size="12" font-weight="600" letter-spacing="1.5">
      ${cleanAuthor.toUpperCase()}
    </text>
    <text x="150" y="380" text-anchor="middle" fill="#FDE047" font-weight="800" font-size="11" letter-spacing="2">
      ★ EXÉRCITO DA PATY ★
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

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
  return url.replace(/^http:\/\//i, 'https://').replace('&edge=curl', '');
}

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
 * Fonte 1: Open Library Search API
 * CORS 100% liberado pelo servidor da fundação e sem limite de requisição
 */
async function fetchOpenLibrary(query) {
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query.trim())}&fields=key,title,author_name,number_of_pages_median,cover_i,subject,first_sentence&limit=8`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const data = await res.json();
    const docs = data.docs || [];

    return docs.map(doc => {
      const title = doc.title || '';
      const author = doc.author_name ? doc.author_name.join(', ') : 'Autor desconhecido';
      const pages = doc.number_of_pages_median || 250;
      const genre = doc.subject ? doc.subject[0] : 'Literatura';
      const cover = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : '';
      const synopsis = doc.first_sentence 
        ? (Array.isArray(doc.first_sentence) ? doc.first_sentence[0] : doc.first_sentence)
        : '';

      return {
        id: `ol-${doc.key || Math.random().toString(36).substring(2, 7)}`,
        title,
        author,
        pages,
        genre,
        cover: cover || generateFallbackCover(title, author),
        coverUrl: cover || generateFallbackCover(title, author),
        synopsis: cleanHtmlText(synopsis),
        source: 'openlibrary'
      };
    });
  } catch (err) {
    console.warn('Open Library fallback:', err.message);
    return [];
  }
}

/**
 * Fonte 2: Google Books API (isolada em try/catch)
 */
async function fetchGoogleBooks(query) {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query.trim())}&maxResults=8`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const data = await res.json();
    const items = data.items || [];

    return items.map(item => {
      const info = item.volumeInfo || {};
      const title = info.title || 'Título Indisponível';
      const author = info.authors ? info.authors.join(', ') : 'Autor desconhecido';
      const pages = info.pageCount || 250;
      const genre = info.categories ? info.categories[0] : 'Literatura';
      const rawCover = (info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '').replace('http://', 'https://');
      const synopsis = info.description || '';

      return {
        id: item.id || `gb-${Math.random().toString(36).substring(2, 7)}`,
        title,
        author,
        pages,
        genre,
        cover: rawCover || generateFallbackCover(title, author),
        coverUrl: rawCover || generateFallbackCover(title, author),
        synopsis: cleanHtmlText(synopsis),
        source: 'google'
      };
    });
  } catch (err) {
    console.warn('Google Books fallback:', err.message);
    return [];
  }
}

/**
 * Fonte 3: Apple Books Brasil via JSONP
 * Evita 100% de erro de CORS no navegador injetando tag <script> com callback
 */
function fetchAppleBooksJSONP(query) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return resolve([]);
    }

    const callbackName = `itunesCb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const script = document.createElement('script');
    let timeoutId = null;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (window[callbackName]) {
        try {
          delete window[callbackName];
        } catch {
          window[callbackName] = undefined;
        }
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    timeoutId = setTimeout(() => {
      cleanup();
      resolve([]);
    }, 3000);

    window[callbackName] = (data) => {
      cleanup();
      try {
        const results = (data?.results || []).map(item => {
          const hdCover = item.artworkUrl100
            ? item.artworkUrl100.replace('100x100bb', '600x600bb')
            : '';
          const title = item.trackName || '';
          const author = item.artistName || 'Autor desconhecido';

          return {
            id: `apple-${item.trackId}`,
            title,
            author,
            pages: 250,
            genre: item.genres?.[0] || 'Literatura',
            cover: hdCover || generateFallbackCover(title, author),
            coverUrl: hdCover || generateFallbackCover(title, author),
            synopsis: cleanHtmlText(item.description || ''),
            source: 'apple'
          };
        });
        resolve(results);
      } catch {
        resolve([]);
      }
    };

    script.onerror = () => {
      cleanup();
      resolve([]);
    };

    script.src = `https://itunes.apple.com/search?term=${encodeURIComponent(query.trim())}&media=ebook&entity=ebook&country=BR&limit=6&callback=${callbackName}`;
    document.head.appendChild(script);
  });
}

/**
 * Função de Busca Multi-API Principal
 * @param {string} query Termo de busca (a partir de 2 caracteres)
 * @returns {Promise<Array>} Lista de obras combinadas e deduplicadas
 */
export async function searchBooks(query) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const cleanQuery = query.trim();

  // Executa as 3 fontes de forma totalmente independente em blocos protegidos
  const [openLibResults, googleResults, appleResults] = await Promise.all([
    fetchOpenLibrary(cleanQuery),
    fetchGoogleBooks(cleanQuery),
    fetchAppleBooksJSONP(cleanQuery).catch(() => [])
  ]);

  // Mapa para combinar resultados removendo duplicatas e unindo páginas e sinopses
  const mergedMap = new Map();

  const addOrMerge = (book) => {
    const key = normalizeTitle(book.title);
    if (!key) return;

    if (mergedMap.has(key)) {
      const existing = mergedMap.get(key);
      // Se existente não tem capa real mas o novo tem
      if (existing.cover?.startsWith('data:image/svg') && book.cover && !book.cover.startsWith('data:image/svg')) {
        existing.cover = book.cover;
        existing.coverUrl = book.cover;
      }
      // Se existente não tem sinopse rica ou é curta, herda do outro
      if ((!existing.synopsis || existing.synopsis.length < 30) && book.synopsis) {
        existing.synopsis = book.synopsis;
      }
      // Se existente está com páginas default (250) e o outro tem valor real
      if (existing.pages === 250 && book.pages && book.pages !== 250) {
        existing.pages = book.pages;
      }
    } else {
      mergedMap.set(key, { ...book });
    }
  };

  // 1. Apple Books (Prioridade para capas HD e sinopses em PT-BR)
  for (const b of appleResults) addOrMerge(b);

  // 2. Google Books (Rico em páginas e categorias)
  for (const b of googleResults) addOrMerge(b);

  // 3. Open Library (Clássicos e dados editoriais)
  for (const b of openLibResults) addOrMerge(b);

  const results = Array.from(mergedMap.values());
  return results.slice(0, 8);
}

// Alias de retrocompatibilidade para componentes que importam searchBooksAutocomplete
export const searchBooksAutocomplete = searchBooks;
