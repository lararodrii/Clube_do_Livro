/**
 * Google Books API Service
 * Endpoint: https://www.googleapis.com/books/v1/volumes?q={query}&maxResults=6&langRestrict=pt
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

// Higieniza URL de capa
export function sanitizeCoverUrl(imageLinks, title = '', author = '') {
  if (!imageLinks) {
    return generateFallbackCover(title, author);
  }
  
  let url = imageLinks.extraLarge || 
            imageLinks.large || 
            imageLinks.medium || 
            imageLinks.small || 
            imageLinks.thumbnail || 
            imageLinks.smallThumbnail;

  if (!url) {
    return generateFallbackCover(title, author);
  }

  // Converte http para https
  url = url.replace(/^http:\/\//i, 'https://');
  
  // Remove edge curl para capa plana limpa e de melhor resolução
  url = url.replace('&edge=curl', '');
  
  // Se for zoom=1 ou zoom=5, garante que carrega em boa qualidade
  return url;
}

// Remove tags HTML de descrições e sinopses
export function cleanHtmlText(text) {
  if (!text) return 'Sinopse não informada pelo catálogo da editora.';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

import { searchBooksAutocomplete } from './bookSearch';

/**
 * Busca livros na Google Books API (agora com motor híbrido Multi-API)
 * @param {string} query Termo de busca (título, autor, ISBN)
 * @returns {Promise<Array>} Lista de livros sanitizados
 */
export async function searchGoogleBooks(query) {
  return searchBooksAutocomplete(query);
}
