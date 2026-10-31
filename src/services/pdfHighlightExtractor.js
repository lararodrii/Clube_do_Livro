/**
 * Serviço de Extração Automática de Grifos (PDF / Kindle)
 * 
 * Regras estritas:
 * 1. Filtro exato de cores para marca-textos (alta luminosidade e saturação controlada):
 *    - Amarelo / Laranja (alta presença de vermelho/verde, baixo azul)
 *    - Rosa / Magenta (alto vermelho e azul, baixo verde)
 *    - Verde Limão / Claro (verde predominante)
 *    - Azul Claro / Ciano Pastel (luminosidade > 80%, rejeitando azuis escuros)
 *    - Roxo / Lilás Pastel (luminosidade alta)
 *    - Cinza E-Ink (leitores de e-ink e tons de cinza)
 *    - Bloqueio definitivo de links azuis (#1a0dab, #0000ff, #0066cc)
 * 2. Bloqueio definitivo de links e metadados:
 *    - Ignora anotações de links (annot.subtype === 'Link')
 *    - Ignora URLs, rodapés de sites ("LeLivros", "LeLivros.site", etc.) e avisos de copyright
 * 3. Suporte completo a notas do Kindle (P&B / My Clippings / Notebook .txt e .html):
 *    - Extrai trechos destacados, páginas e posições, mesmo sem cor de fundo
 * 
 * Carregado via CDN para garantir total compatibilidade no Vite e Netlify sem quebra de workers.
 */

const PDFJS_CDN_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfjsLoadingPromise = null;

/**
 * Carrega a biblioteca PDF.js dinamicamente e de forma segura via CDN
 */
export function loadPdfJs() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('PDF.js só pode ser carregado no navegador.'));
  }

  if (window.pdfjsLib) {
    if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
    }
    return Promise.resolve(window.pdfjsLib);
  }

  if (pdfjsLoadingPromise) {
    return pdfjsLoadingPromise;
  }

  pdfjsLoadingPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-pdfjs-cdn]');
    if (existingScript && window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
      resolve(window.pdfjsLib);
      return;
    }

    const script = document.createElement('script');
    script.src = PDFJS_CDN_URL;
    script.setAttribute('data-pdfjs-cdn', 'true');
    script.async = true;

    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
        resolve(window.pdfjsLib);
      } else {
        pdfjsLoadingPromise = null;
        reject(new Error('PDF.js falhou ao inicializar no ambiente window.'));
      }
    };

    script.onerror = () => {
      pdfjsLoadingPromise = null;
      reject(new Error('Erro de conexão ao carregar PDF.js via CDN. Verifique sua conexão com a internet.'));
    };

    document.head.appendChild(script);
  });

  return pdfjsLoadingPromise;
}

// Paleta padrão de cores de marca-texto permitidas
export const HIGHLIGHTER_PALETTE = {
  yellow: {
    name: 'Amarelo Revolucionário',
    hex: '#FDE047',
    bgClass: 'bg-yellow-300/40 border-yellow-400 text-yellow-950'
  },
  orange: {
    name: 'Laranja Manifesto',
    hex: '#FB923C',
    bgClass: 'bg-orange-300/40 border-orange-400 text-orange-950'
  },
  pink: {
    name: 'Rosa Carmim (StarNote)',
    hex: '#F472B6',
    bgClass: 'bg-pink-300/40 border-pink-400 text-pink-950'
  },
  green: {
    name: 'Verde Sierra',
    hex: '#4ADE80',
    bgClass: 'bg-emerald-300/40 border-emerald-400 text-emerald-950'
  },
  cyan: {
    name: 'Azul Claro Pastel',
    hex: '#7DD3FC',
    bgClass: 'bg-sky-200/50 border-sky-400 text-sky-950'
  },
  purple: {
    name: 'Lilás Pastel',
    hex: '#C084FC',
    bgClass: 'bg-purple-300/40 border-purple-400 text-purple-950'
  },
  gray: {
    name: 'Cinza E-Ink',
    hex: '#9CA3AF',
    bgClass: 'bg-gray-300/50 border-gray-400 text-gray-950'
  },
  kindle: {
    name: 'Destaque Kindle',
    hex: '#FEF08A',
    bgClass: 'bg-yellow-200/50 border-yellow-400 text-yellow-950'
  }
};

/**
 * Classifica rigorosamente se um pixel pertence à paleta de marca-texto permitida.
 * 
 * Rejeita categoricamente:
 * - Branco puro ou papel creme (avg > 240 ou saturação quase nula em tons claros)
 * - Texto preto/cinza escuro (avg < 110)
 * - Links azuis escuros / médios (ex: #1a0dab, #0000ff, #0066cc, #0000ee)
 */
function classifyHighlighterPixel(r, g, b) {
  const avg = (r + g + b) / 3;

  // 1. Rejeita preto ou tinta escura
  if (avg < 105) return null;

  // 2. Rejeita papel branco puro ou creme sem grifo
  if (avg > 245 && Math.abs(r - g) < 14 && Math.abs(r - b) < 18) {
    return null;
  }

  // 3. BLOQUEIO DEFINITIVO DE AZUL DE LINKS (#1a0dab, #0000ff, #0066cc):
  // Se o azul predominar sobre o vermelho com saturação escura ou média (não pastel claro), REJEITA!
  if (b > r + 25) {
    // Para ser aceito como Azul Claro / Ciano Pastel de marca-texto, a luminosidade deve ser alta (> 80% = avg > 204)
    const isPastelCyan = avg >= 204 && b >= 195 && g >= 185 && r >= 155;
    if (!isPastelCyan) {
      return null; // Descarta links escuros e azuis de rodapé/sumário
    }
  }

  // 4. AMARELO / LARANJA
  // Alta presença de vermelho e verde, com azul marcadamente baixo
  if (r >= 160 && g >= 145 && b <= 145) {
    if ((r - b) >= 45 && (g - b) >= 30) {
      // Amarelo clássico
      if (Math.abs(r - g) <= 55) {
        return HIGHLIGHTER_PALETTE.yellow;
      }
      // Laranja se o vermelho predominar sobre o verde
      if ((r - g) > 55) {
        return HIGHLIGHTER_PALETTE.orange;
      }
    }
  }

  // Laranja manifesto (tons mais quentes)
  if (r >= 185 && g >= 85 && g <= 175 && b <= 120 && (r - g) >= 25 && (r - b) >= 65) {
    return HIGHLIGHTER_PALETTE.orange;
  }

  // 5. ROSA / MAGENTA (Típico do StarNote / Tablets)
  // Alto vermelho e azul, com verde menor
  if (r >= 170 && b >= 125 && g <= 185 && (r - g) >= 28) {
    return HIGHLIGHTER_PALETTE.pink;
  }

  // 6. VERDE LIMÃO / CLARO
  // Verde marcadamente predominante
  if (g >= 145 && g > r + 15 && g > b + 18) {
    return HIGHLIGHTER_PALETTE.green;
  }

  // 7. AZUL CLARO / CIANO PASTEL (Luminosidade > 80%)
  if (avg >= 204 && b >= 195 && g >= 185 && r >= 155 && b > r + 10) {
    return HIGHLIGHTER_PALETTE.cyan;
  }

  // 8. ROXO / LILÁS PASTEL (Luminosidade alta)
  if (avg >= 180 && r >= 155 && b >= 175 && g >= 135 && (b - g) >= 15 && (r - g) >= 10) {
    return HIGHLIGHTER_PALETTE.purple;
  }

  // 9. CINZA E-INK (Leitores em escala de cinza / E-Ink)
  // Faixa intermediária neutra
  if (avg >= 125 && avg <= 222) {
    if (Math.abs(r - g) <= 15 && Math.abs(r - b) <= 15 && Math.abs(g - b) <= 15) {
      return HIGHLIGHTER_PALETTE.gray;
    }
  }

  return null;
}

/**
 * Valida visualmente se uma palavra está REALMENTE coberta por marca-texto no Canvas.
 * Retorna o objeto de cor predominante da paleta ou null se não houver grifo.
 */
function checkWordHighlightOnCanvas(wordBox, data, canvasW, canvasH) {
  const startX = Math.max(0, Math.floor(wordBox.x + 1));
  const endX = Math.min(canvasW - 1, Math.ceil(wordBox.x + wordBox.width - 1));
  const startY = Math.max(0, Math.floor(wordBox.y + wordBox.height * 0.15));
  const endY = Math.min(canvasH - 1, Math.ceil(wordBox.y + wordBox.height * 0.85));

  if (endX <= startX || endY <= startY) return null;

  let totalSampled = 0;
  const colorCounts = {};

  // Amostragem densa a cada 2 pixels para máxima precisão
  for (let y = startY; y < endY; y += 2) {
    for (let x = startX; x < endX; x += 2) {
      const idx = (y * canvasW + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (a < 120) continue;

      totalSampled++;
      const detected = classifyHighlighterPixel(r, g, b);
      if (detected) {
        colorCounts[detected.name] = (colorCounts[detected.name] || { count: 0, color: detected });
        colorCounts[detected.name].count++;
      }
    }
  }

  if (totalSampled < 4) return null;

  // Localiza a cor mais abundante na caixa da palavra
  let bestEntry = null;
  let maxCount = 0;

  for (const entry of Object.values(colorCounts)) {
    if (entry.count > maxCount) {
      maxCount = entry.count;
      bestEntry = entry;
    }
  }

  // A cobertura mínima da cor deve ser de pelo menos 18% da caixa da palavra
  if (bestEntry && (maxCount / totalSampled) >= 0.18) {
    return bestEntry.color;
  }

  return null;
}

/**
 * Verifica se um trecho de texto é metadado, URL ou rodapé de site que deve ser ignorado.
 */
function isMetadataOrLinkText(text) {
  if (!text) return true;
  const lower = text.toLowerCase().trim();

  // URLs e endereços da web
  if (/https?:\/\/|www\.|\.site|\.com|\.org|\.net|\.br|\.io|doi\.org|\.html|\.php|mailto:/i.test(lower)) {
    return true;
  }

  // Rodapés conhecidos de sites e distribuição de e-books (ex: LeLivros.site, Docero, etc.)
  if (lower.includes('lelivros') || lower.includes('docero') || lower.includes('z-library') || lower.includes('annas-archive') || lower.includes('epub') || lower.includes('mobi')) {
    return true;
  }

  // Metadados editoriais e avisos de copyright iniciais
  if (
    lower.includes('todos os direitos reservados') ||
    lower.includes('copyright') ||
    lower.includes('ficha catalográfica') ||
    lower.includes('dados internacionais de catalogação') ||
    lower.includes('câmara brasileira do livro') ||
    lower.includes('direitos desta edição') ||
    lower.includes('reprodução proibida') ||
    lower.includes('grafia atualizada') ||
    lower.includes('isbn')
  ) {
    return true;
  }

  return false;
}

/**
 * Divide um item de texto do PDF.js em palavras individuais com caixas delimitadoras precisas.
 */
function splitItemIntoWords(item) {
  const str = item.str || '';
  if (!str.trim()) return [];

  const words = [];
  const regex = /\S+/g;
  let match;
  const totalLen = str.length;
  const charWidth = totalLen > 0 ? (item.box.width / totalLen) : 10;

  while ((match = regex.exec(str)) !== null) {
    const wordText = match[0];
    const startIndex = match.index;
    const wordLen = wordText.length;

    const wordX = item.box.x + (startIndex * charWidth);
    const wordW = Math.max(3, wordLen * charWidth);

    words.push({
      text: wordText,
      box: {
        x: wordX,
        y: item.box.y,
        width: wordW,
        height: item.box.height
      },
      lineY: item.box.y
    });
  }

  return words;
}

/**
 * Verifica sobreposição de caixa com uma caixa delimitadora de link
 */
function wordOverlapsBox(wBox, bBox, tolerance = 0.2) {
  const overlapX = Math.max(0, Math.min(wBox.x + wBox.width, bBox.x + bBox.width) - Math.max(wBox.x, bBox.x));
  const overlapY = Math.max(0, Math.min(wBox.y + wBox.height, bBox.y + bBox.height) - Math.max(wBox.y, bBox.y));

  if (overlapX <= 0 || overlapY <= 0) return false;
  return (overlapX / wBox.width) > tolerance && (overlapY / wBox.height) > tolerance;
}

/**
 * Agrupa palavras grifadas consecutivas em trechos contínuos e limpos.
 * Separa frases quando houver quebra de parágrafo, trechos não grifados ou mudança de cor.
 */
function groupConsecutiveWords(words, pageNum, defaultColor, source) {
  if (!words || words.length === 0) return [];

  // Remove duplicatas exatas de palavras na mesma coordenada (evita eco de OCR)
  const uniqueWords = [];
  for (const w of words) {
    const isDup = uniqueWords.some(
      u => u.text === w.text && Math.abs(u.box.x - w.box.x) < 4 && Math.abs(u.box.y - w.box.y) < 4
    );
    if (!isDup) uniqueWords.push(w);
  }

  // Ordena por ordem natural de leitura: de cima para baixo, da esquerda para a direita
  uniqueWords.sort((a, b) => {
    const diffY = a.box.y - b.box.y;
    if (Math.abs(diffY) > 5) {
      return diffY;
    }
    return a.box.x - b.box.x;
  });

  const highlights = [];
  let currentGroup = null;

  for (let i = 0; i < uniqueWords.length; i++) {
    const word = uniqueWords[i];

    if (!currentGroup) {
      currentGroup = {
        page: pageNum,
        words: [word],
        text: word.text,
        color: word.color || defaultColor,
        note: word.note || '',
        source: source || 'pdf_annotation',
        lastWord: word
      };
      continue;
    }

    const prev = currentGroup.lastWord;
    const isSameColor = prev.color?.name === word.color?.name;
    const isSameLine = Math.abs(word.box.y - prev.box.y) <= 6;
    const isNextLine = !isSameLine && (word.box.y > prev.box.y) && ((word.box.y - prev.box.y) < Math.max(prev.box.height, word.box.height) * 1.85);

    let shouldJoin = false;

    if (isSameColor) {
      if (isSameLine) {
        // Mesma linha: verifica se são palavras contíguas (espaço normal entre palavras)
        const gapX = word.box.x - (prev.box.x + prev.box.width);
        if (gapX >= -2 && gapX < Math.max(prev.box.height, 14) * 2.5) {
          shouldJoin = true;
        }
      } else if (isNextLine) {
        // Linha imediatamente subsequente sem pular linhas
        const lineGap = word.box.y - prev.box.y;
        if (lineGap < Math.max(prev.box.height, 14) * 1.9) {
          shouldJoin = true;
        }
      }
    }

    if (shouldJoin) {
      currentGroup.words.push(word);
      if (currentGroup.text.endsWith('-')) {
        currentGroup.text = currentGroup.text.slice(0, -1) + word.text;
      } else {
        currentGroup.text += ' ' + word.text;
      }
      if (word.note && !currentGroup.note.includes(word.note)) {
        currentGroup.note = currentGroup.note ? `${currentGroup.note} | ${word.note}` : word.note;
      }
      currentGroup.lastWord = word;
    } else {
      // Finaliza o trecho atual e inicia novo grifo independente
      highlights.push(currentGroup);
      currentGroup = {
        page: pageNum,
        words: [word],
        text: word.text,
        color: word.color || defaultColor,
        note: word.note || '',
        source: source || 'pdf_annotation',
        lastWord: word
      };
    }
  }

  if (currentGroup) {
    highlights.push(currentGroup);
  }

  return highlights
    .map(g => ({
      id: `hl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      page: g.page,
      text: g.text.replace(/\s+/g, ' ').trim(),
      note: g.note?.trim() || '',
      color: g.color || defaultColor,
      source: g.source,
      createdAt: new Date().toISOString()
    }))
    .filter(g => {
      // Descarta fragmentos muito curtos, pontuação isolada ou sobras de metadados/links
      if (g.text.length < 3) return false;
      if (/^[0-9.,;:!?\s]+$/.test(g.text)) return false;
      if (isMetadataOrLinkText(g.text)) return false;
      return true;
    });
}

/**
 * Extrai grifos de um arquivo PDF (.pdf) com confirmação visual no Canvas e bloqueio de links
 */
async function extractFromPdf(file, onProgress = () => {}) {
  const pdfjs = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  
  onProgress({ current: 0, total: 100, stage: 'loading', message: 'Abrindo documento PDF...' });
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  const allExtractedHighlights = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    onProgress({
      current: pageNum,
      total: numPages,
      stage: 'analyzing',
      message: `Analisando página ${pageNum} de ${numPages} (${allExtractedHighlights.length} grifos identificados)...`
    });

    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });

      // 1. Coleta todas as anotações da página (Links e Destaques)
      const annotations = await page.getAnnotations();
      const linkBoxes = [];
      const notesByArea = [];

      for (const annot of annotations) {
        const subtype = (annot.subtype || '').toLowerCase();

        // Identifica anotações de links clicáveis (TOC, hyperlinks externos, etc.)
        const isLink = subtype === 'link' || annot.url || annot.action || annot.dest;
        if (isLink && annot.rect && Array.isArray(annot.rect) && annot.rect.length === 4) {
          const [vx1, vy1, vx2, vy2] = viewport.convertToViewportRectangle(annot.rect);
          linkBoxes.push({
            x: Math.min(vx1, vx2),
            y: Math.min(vy1, vy2),
            width: Math.abs(vx2 - vx1),
            height: Math.abs(vy2 - vy1)
          });
          continue;
        }

        // Destaques com notas anexadas
        if (subtype === 'highlight' || subtype === 'underline') {
          const annotNote = annot.contents || annot.richText || '';
          if (annotNote && annot.rect && Array.isArray(annot.rect) && annot.rect.length === 4) {
            const [vx1, vy1, vx2, vy2] = viewport.convertToViewportRectangle(annot.rect);
            notesByArea.push({
              box: {
                x: Math.min(vx1, vx2),
                y: Math.min(vy1, vy2),
                width: Math.abs(vx2 - vx1),
                height: Math.abs(vy2 - vy1)
              },
              note: annotNote
            });
          }
        }
      }

      // 2. Extração do conteúdo de texto em palavras individuais, ignorando metadados
      const textContent = await page.getTextContent();
      const allWords = [];

      for (const item of textContent.items) {
        const rawStr = (item.str || '').trim();
        if (!rawStr) continue;

        // Ignora linhas inteiras que sejam rodapés conhecidos ou URLs
        if (isMetadataOrLinkText(rawStr)) continue;

        const tx = item.transform[4];
        const ty = item.transform[5];
        const w = item.width || 10;
        const h = item.height || Math.hypot(item.transform[2], item.transform[3]) || 12;

        const [vx1, vy1, vx2, vy2] = viewport.convertToViewportRectangle([tx, ty, tx + w, ty + h]);
        const itemBox = {
          x: Math.min(vx1, vx2),
          y: Math.min(vy1, vy2),
          width: Math.abs(vx2 - vx1),
          height: Math.abs(vy2 - vy1)
        };

        const wordsInItem = splitItemIntoWords({
          str: item.str,
          box: itemBox
        });

        // Filtra palavras que caem dentro de links clicáveis ou contêm metadados
        for (const wObj of wordsInItem) {
          if (isMetadataOrLinkText(wObj.text)) continue;

          const isInsideLink = linkBoxes.some(lb => wordOverlapsBox(wObj.box, lb, 0.25));
          if (isInsideLink) continue;

          allWords.push(wObj);
        }
      }

      if (allWords.length === 0) continue;

      // 3. Renderização da página em Canvas oculto para verificação óptica real
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) continue;

      await page.render({ canvasContext: ctx, viewport }).promise;
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const canvasW = canvas.width;
      const canvasH = canvas.height;

      // 4. Verificação rigorosa contra a paleta de marca-texto no Canvas:
      const confirmedHighlights = [];

      for (const word of allWords) {
        const detectedColor = checkWordHighlightOnCanvas(word.box, data, canvasW, canvasH);
        if (detectedColor) {
          const matchingNote = notesByArea.find(n =>
            word.box.x >= n.box.x - 10 &&
            word.box.x <= (n.box.x + n.box.width + 10) &&
            word.box.y >= n.box.y - 10 &&
            word.box.y <= (n.box.y + n.box.height + 10)
          );

          confirmedHighlights.push({
            ...word,
            color: detectedColor,
            note: matchingNote ? matchingNote.note : '',
            source: 'pdf_verified_scan'
          });
        }
      }

      // 5. Agrupa as palavras confirmadas em trechos contínuos
      const pageHighlights = groupConsecutiveWords(
        confirmedHighlights,
        pageNum,
        HIGHLIGHTER_PALETTE.yellow,
        'pdf_verified_scan'
      );

      allExtractedHighlights.push(...pageHighlights);

    } catch (pageErr) {
      console.warn(`[pdfHighlightExtractor] Erro ao processar página ${pageNum}:`, pageErr.message);
    }
  }

  onProgress({ current: numPages, total: numPages, stage: 'completed', message: 'Extração concluída com sucesso!' });
  return allExtractedHighlights;
}

/**
 * Parser robusto para arquivos exportados do Kindle (My Clippings.txt ou Cadernos .txt / .html)
 * Suporta formatos em preto e branco sem cor de fundo, identificando citações, posições e notas.
 */
async function extractFromKindle(file, onProgress = () => {}) {
  onProgress({ current: 0, total: 100, stage: 'reading', message: 'Lendo arquivo do Kindle...' });
  const content = await file.text();
  const isHtml = file.name.endsWith('.html') || file.type.includes('html') || content.includes('<html');

  const highlights = [];

  if (isHtml) {
    // 1. Caderno de Notas HTML exportado pelo aplicativo Kindle
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    // Título do livro no cabeçalho do documento Kindle
    const bookTitleEl = doc.querySelector('.bookTitle, h1, .kp-notebook-book-title');
    const bookTitle = bookTitleEl ? bookTitleEl.textContent.trim() : '';

    const noteHeadings = doc.querySelectorAll('.noteHeading, .kp-notebook-metadata, h3');
    const noteTexts = doc.querySelectorAll('.noteText, .kp-notebook-highlight, p.body-text');

    const total = Math.max(noteHeadings.length, noteTexts.length);
    for (let i = 0; i < total; i++) {
      const heading = noteHeadings[i]?.textContent || '';
      let text = noteTexts[i]?.textContent?.trim() || '';

      if (!text) continue;

      // Limpa aspas ao redor do trecho se houver
      text = text.replace(/^["“'‘\s]+|["”'’\s]+$/g, '').trim();
      if (text.length < 3) continue;

      // Identifica número da página ou posição
      const pageMatch = heading.match(/(?:página|page|pág\.)\s*(\d+)/i);
      const locMatch = heading.match(/(?:posição|location|pos\.)\s*([\d-]+)/i);
      const pageNum = pageMatch ? parseInt(pageMatch[1], 10) : (locMatch ? locMatch[1] : 1);

      // Identifica se havia nota pessoal do leitor
      const isPersonalNote = heading.toLowerCase().includes('nota') || heading.toLowerCase().includes('note');

      highlights.push({
        id: `hl-knd-${Date.now()}-${i}`,
        page: pageNum,
        text,
        note: isPersonalNote ? heading.trim() : '',
        bookHint: bookTitle,
        color: HIGHLIGHTER_PALETTE.kindle,
        source: 'kindle_html',
        createdAt: new Date().toISOString()
      });
    }
  } else if (content.includes('==========')) {
    // 2. Arquivo padrão "My Clippings.txt" do leitor Kindle
    const blocks = content.split(/={8,}/);
    let index = 0;

    for (const block of blocks) {
      const lines = block.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) continue;

      const titleLine = lines[0]; // Título da Obra (Autor)
      const metaLine = lines[1] || ''; // - Seu destaque na página X | posição Y-Z | Adicionado em...
      let textLines = lines.slice(2).join(' ').trim();

      if (!textLines || textLines.length < 3) continue;

      // Limpa aspas decorativas
      textLines = textLines.replace(/^["“'‘\s]+|["”'’\s]+$/g, '').trim();

      // Extrai número da página e posição
      const pageMatch = metaLine.match(/(?:página|page|pág\.)\s*(\d+)/i);
      const locMatch = metaLine.match(/(?:posição|location|pos\.)\s*([\d-]+)/i);
      const pageNum = pageMatch ? parseInt(pageMatch[1], 10) : (locMatch ? locMatch[1] : 1);

      const isPersonalNote = metaLine.toLowerCase().includes('nota') || metaLine.toLowerCase().includes('note');

      highlights.push({
        id: `hl-clp-${Date.now()}-${index++}`,
        page: pageNum,
        text: textLines.replace(/\s+/g, ' ').trim(),
        note: isPersonalNote ? metaLine : '',
        bookHint: titleLine,
        color: HIGHLIGHTER_PALETTE.kindle,
        source: 'kindle_clippings',
        createdAt: new Date().toISOString()
      });
    }
  } else {
    // 3. Caderno de Notas exportado em texto puro (.txt)
    // Padrão: Blocos contendo "Destaque (cor) - Página X" ou "Highlight - Page X" seguidos de citação
    const lines = content.split(/\r?\n/);
    let currentMeta = null;
    let currentText = [];
    let index = 0;

    const flushCurrent = () => {
      if (currentText.length > 0) {
        let joined = currentText.join(' ').trim();
        joined = joined.replace(/^["“'‘\s]+|["”'’\s]+$/g, '').trim();

        if (joined.length >= 3 && !isMetadataOrLinkText(joined)) {
          const pageMatch = currentMeta ? currentMeta.match(/(?:página|page|pág\.)\s*(\d+)/i) : null;
          const locMatch = currentMeta ? currentMeta.match(/(?:posição|location|pos\.)\s*([\d-]+)/i) : null;
          const pageNum = pageMatch ? parseInt(pageMatch[1], 10) : (locMatch ? locMatch[1] : 1);

          highlights.push({
            id: `hl-kndtxt-${Date.now()}-${index++}`,
            page: pageNum,
            text: joined.replace(/\s+/g, ' '),
            note: currentMeta && (currentMeta.toLowerCase().includes('nota') || currentMeta.toLowerCase().includes('note')) ? currentMeta : '',
            color: HIGHLIGHTER_PALETTE.kindle,
            source: 'kindle_text_notebook',
            createdAt: new Date().toISOString()
          });
        }
      }
      currentText = [];
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      const isHeader = /(?:destaque|highlight|nota|note)\s*(?:\([^)]*\))?\s*[-–—]\s*(?:página|page|posição|location)/i.test(line);

      if (isHeader) {
        flushCurrent();
        currentMeta = line;
      } else if (currentMeta) {
        currentText.push(line);
      }
    }
    flushCurrent();
  }

  onProgress({ current: 100, total: 100, stage: 'completed', message: 'Notas do Kindle extraídas com sucesso!' });
  return highlights;
}

/**
 * Função principal exportada: extrai grifos de qualquer arquivo suportado (.pdf, .txt, .html)
 */
export async function extractHighlightsFromFile(file, onProgress = () => {}) {
  if (!file) throw new Error('Nenhum arquivo informado.');

  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'pdf' || file.type === 'application/pdf') {
    return await extractFromPdf(file, onProgress);
  }

  if (ext === 'txt' || ext === 'html' || ext === 'htm' || file.type.includes('text') || file.type.includes('html')) {
    return await extractFromKindle(file, onProgress);
  }

  throw new Error(`Formato .${ext} não suportado. Utilize arquivos .pdf, .txt (My Clippings) ou .html (Kindle Notebook).`);
}
