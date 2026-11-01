/**
 * Serviço de Extração Automática de Grifos (PDF / Kindle)
 * 
 * Reconstrução contínua e sem corte de palavras:
 * 1. Fatiamento proporcional de palavras (evita drift de fonte).
 * 2. Preserva anotações nativas do PDF na íntegra (uma anotação = um registro contínuo).
 * 3. Amostragem em nível de linha no Canvas (preserva 100% de conectivos como "é", "a", "em", "de").
 * 4. Corte milimétrico das sobras externas (palavras antes do início ou após o ponto final não entram).
 * 5. Junção contínua respeitando hífens compostos (ex: "norte-americana").
 * 6. Suporte completo a notas do Kindle (P&B / My Clippings / Notebooks .txt e .html).
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

export const HIGHLIGHT_PALETTE = {
  yellow: {
    id: 'yellow',
    name: 'Amarelo Revolucionário',
    hex: '#FDE047',
    bgClass: 'bg-yellow-300/40 border-yellow-400 text-yellow-950'
  },
  blue: {
    id: 'blue',
    name: 'Azul Céu',
    hex: '#38BDF8',
    bgClass: 'bg-sky-300/40 border-sky-400 text-sky-950'
  },
  pink: {
    id: 'pink',
    name: 'Rosa Crítico',
    hex: '#F472B6',
    bgClass: 'bg-pink-300/40 border-pink-400 text-pink-950'
  },
  green: {
    id: 'green',
    name: 'Verde Esperança',
    hex: '#86EFAC',
    bgClass: 'bg-green-300/40 border-green-400 text-green-950'
  },
  orange: {
    id: 'orange',
    name: 'Laranja Debate',
    hex: '#FDBA74',
    bgClass: 'bg-orange-300/40 border-orange-400 text-orange-950'
  },
  purple: {
    id: 'purple',
    name: 'Lilás Teórico',
    hex: '#D8B4FE',
    bgClass: 'bg-purple-300/40 border-purple-400 text-purple-950'
  }
};

export const YELLOW_COLOR_INFO = HIGHLIGHT_PALETTE.yellow;

export const KINDLE_COLOR_INFO = {
  id: 'kindle',
  name: 'Destaque Kindle',
  hex: '#FEF08A',
  bgClass: 'bg-yellow-200/50 border-yellow-400 text-yellow-950'
};

/**
 * Validação anti-falsos-positivos:
 * Rejeita qualquer aviso de direitos autorais, termos de prefácios piratas (Le Livros, etc.),
 * URLs, índices ou metadados de domínio público.
 */
export function isBlacklistedText(text) {
  if (!text || typeof text !== 'string') return true;
  const clean = text.trim();
  if (clean.length < 4) return true;

  // Somente pontuação ou números isolados
  if (/^[0-9.,;:!?\s\-_/\\()#*•]+$/.test(clean)) return true;

  // 1. Termos piratas específicos e marcas d'água de distribuidores
  if (/\b(le\s*livros|lelivros|livrosdigitais|elivros|docero|pdfdrive|z-library|libgen|epubr)\b/i.test(clean)) {
    return true;
  }

  // 2. URLs completas ou menções a sites/domínios
  if (/(https?:\/\/|www\.)\S+/i.test(clean) || /\b[a-z0-9\-]+\.(com|org|net|bid|love|site|rip|club|me)(\/[^\s]*)?/i.test(clean)) {
    return true;
  }

  // 3. Cabeçalhos de prefácios piratas e seções de metadados
  if (/\bsobre\s+a\s+obra\b/i.test(clean)) return true;
  if (/\bsobre\s+o[s]?\s+autor(es)?\b/i.test(clean) && clean.length < 120) return true;

  // 4. Avisos de direitos autorais e copyright
  if (/todos\s+os\s+direitos\s+reservados/i.test(clean)) return true;
  if (/all\s+rights\s+reserved/i.test(clean)) return true;
  if (/direitos\s+autorais/i.test(clean)) return true;
  if (/copyright\s*(©|\(c\)|by)?\s*\d{4}/i.test(clean)) return true;
  if (/^©\s*\d{4}/i.test(clean)) return true;

  // 5. Dados editoriais, ficha catalográfica e conversão técnica
  if (/ficha\s+catalogr[aá]fica/i.test(clean)) return true;
  if (/dados\s+internacionais\s+de\s+cataloga[cç][aã]o/i.test(clean)) return true;
  if (/cip[- ]brasil/i.test(clean)) return true;
  if (/convers[aã]o\s+para\s+(e[-]?pub|mobi|pdf)/i.test(clean)) return true;
  if (/distribui[cç][aã]o\s+gratuita|venda\s+proibida|n[aã]o\s+comercialize/i.test(clean)) return true;
  if (/baixe\s+mais\s+livros|acesse\s+nosso\s+site|visite\s+nosso\s+site/i.test(clean)) return true;

  // 6. Sumários e índices isolados
  if (/^(sum[aá]rio|table\s+of\s+contents|[íi]ndice(\s+remissivo)?)\b/i.test(clean) && clean.length < 100) {
    return true;
  }

  return false;
}

/**
 * Classifica um pixel RGB estritamente dentro da paleta permitida de marca-texto.
 * Descarta completamente:
 * - Azul de links e rodapés (ex: #1a0dab, #0000ff, links de Le Livros)
 * - Cores escuras ou pretas de textos comuns
 * - Branco e cinzas neutros do fundo
 * Retorna o objeto da cor correspondente ou null se for descartado.
 */
export function matchHighlighterColor(r, g, b) {
  // 1. Rejeição imediata de cores escuras (textos comuns, preto, azul escuro, cinza escuro)
  if (r < 110 && g < 110 && b < 110) return null;
  const luminance = (r * 0.299 + g * 0.587 + b * 0.114);
  if (luminance < 115) return null;

  // 2. Rejeição imediata de tons neutros (branco do papel, creme ou cinza onde r ≈ g ≈ b)
  const maxChannel = Math.max(r, g, b);
  const minChannel = Math.min(r, g, b);
  const delta = maxChannel - minChannel;
  if (delta < 18) return null;
  if (r >= 235 && g >= 235 && b >= 235 && delta < 22) return null;

  // 3. Rejeição estrita de AZUL escuro de links e rodapés (ex: #1a0dab, #0000ff, #0066cc, links de Le Livros):
  // Links de páginas web e PDFs possuem baixa luminosidade (luminance < 145), canais vermelho e verde escuros (r < 90 && g < 140)
  // ou alta dominância escura sem canais claros equilibrados ((r + g) < 210).
  if (b > r + 20 && b > g + 10) {
    if (luminance < 145) return null;
    if (r < 90 && g < 140) return null;
    if ((r + g) < 210) return null;
  }
  // Bloqueio de azul puro ou links escuros com canal vermelho/verde muito rebaixado
  if (b > 120 && (r < 75 || g < 75) && luminance < 145) return null;

  // 4. Reconhecimento estrito da paleta de marca-texto permitida:

  // A) AMARELO (#fdf084, #fef08a, #fde047 - alta luminosidade, vermelho e verde altos, azul reduzido)
  if (r >= 155 && g >= 140 && (r - b) >= 28 && (g - b) >= 20 && b <= 218 && Math.abs(r - g) <= 55) {
    return HIGHLIGHT_PALETTE.yellow;
  }

  // B) LARANJA (#fdba74, #fb923c - vermelho predominante sobre verde, azul baixo)
  if (r >= 180 && g >= 115 && g <= 200 && (r - g) >= 25 && (r - b) >= 45 && b <= 180) {
    return HIGHLIGHT_PALETTE.orange;
  }

  // C) ROSA / MAGENTA (#f472b6, #fbcfe8 - vermelho alto, azul moderado/alto, verde rebaixado)
  if (r >= 170 && b >= 105 && (r - g) >= 28 && (g <= r - 25)) {
    if (r >= b - 15) {
      return HIGHLIGHT_PALETTE.pink;
    }
  }

  // D) VERDE (#86efac, #bbf7d0 - verde predominante sobre vermelho e azul)
  if (g >= 155 && (g - r) >= 22 && (g - b) >= 18) {
    return HIGHLIGHT_PALETTE.green;
  }

  // E) ROXO / LILÁS (#d8b4fe, #c084fc - azul e vermelho altos com verde rebaixado)
  if (b >= 150 && r >= 135 && g <= Math.min(r, b) - 20 && Math.abs(r - b) <= 65) {
    return HIGHLIGHT_PALETTE.purple;
  }

  // F) AZUL PASTEL / AZUL CÉU / CIANO CLARO (#7dd3fc, #38bdf8, #bae6fd, #a5f3fc, #67e8f9)
  // Alta luminosidade (>= 145), azul elevado (b >= 175), verde balanceado (g >= 140 e g >= r - 25)
  // e canais claros bem distribuídos ((r + g) >= 200). Diferencia-se de roxo porque no azul o verde é elevado.
  if (b >= 175 && g >= 140 && luminance >= 145 && (r + g) >= 200 && (b - r) >= 20 && g >= (r - 25)) {
    return HIGHLIGHT_PALETTE.blue;
  }

  return null;
}

/**
 * Valida a cor de uma anotação nativa do PDF (page.getAnnotations()).
 * Descarta imediatamente links azuis, sublinhados pretos/cinzas e anotações fora da paleta.
 */
export function parseAnnotationColor(colorArray, subtype = 'Highlight') {
  if (!Array.isArray(colorArray) || colorArray.length < 3) {
    // Se for do tipo Highlight puro e sem cor declarada, assume Amarelo padrão do leitor de PDF
    if (subtype === 'Highlight') {
      return HIGHLIGHT_PALETTE.yellow;
    }
    // Sublinhados ou outros tipos sem cor explícita de marca-texto são ignorados (evita links azuis)
    return null;
  }

  let [r, g, b] = colorArray;
  if (r <= 1 && g <= 1 && b <= 1) {
    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);
  }

  return matchHighlighterColor(r, g, b);
}

/**
 * Compatibilidade reversa para detecção de pixel amarelo no canvas.
 */
function isYellowHighlighterPixel(r, g, b) {
  const match = matchHighlighterColor(r, g, b);
  return match?.id === 'yellow';
}

/**
 * Avalia se uma palavra no Canvas está destacada com alguma cor da paleta permitida de marca-texto.
 */
export function getWordHighlighterOnCanvas(wordBox, data, canvasW, canvasH, isShortWord = false) {
  const padX = isShortWord ? 3 : 1;
  const startX = Math.max(0, Math.floor(wordBox.x - padX));
  const endX = Math.min(canvasW - 1, Math.ceil(wordBox.x + wordBox.width + padX));
  const startY = Math.max(0, Math.floor(wordBox.y + wordBox.height * 0.1));
  const endY = Math.min(canvasH - 1, Math.ceil(wordBox.y + wordBox.height * 0.9));

  if (endX <= startX || endY <= startY) return { isHighlighted: false, color: null };

  let totalSampled = 0;
  const colorCounts = {
    yellow: 0,
    blue: 0,
    pink: 0,
    green: 0,
    orange: 0,
    purple: 0
  };

  for (let y = startY; y < endY; y += 2) {
    for (let x = startX; x < endX; x += 2) {
      const idx = (y * canvasW + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (a < 120) continue;

      totalSampled++;
      const matched = matchHighlighterColor(r, g, b);
      if (matched && matched.id && colorCounts[matched.id] !== undefined) {
        colorCounts[matched.id]++;
      }
    }
  }

  if (totalSampled < 3) return { isHighlighted: false, color: null };

  let bestColorId = null;
  let bestCount = 0;
  for (const [id, count] of Object.entries(colorCounts)) {
    if (count > bestCount) {
      bestCount = count;
      bestColorId = id;
    }
  }

  const ratio = bestCount / totalSampled;
  const threshold = isShortWord ? 0.08 : 0.13;

  if (ratio >= threshold && bestColorId) {
    return {
      isHighlighted: true,
      color: HIGHLIGHT_PALETTE[bestColorId] || HIGHLIGHT_PALETTE.yellow
    };
  }

  return { isHighlighted: false, color: null };
}

/**
 * Validação visual para o Canvas (exportada para compatibilidade de testes).
 */
export function isWordYellowOnCanvas(wordBox, data, canvasW, canvasH, isShortWord = false) {
  const res = getWordHighlighterOnCanvas(wordBox, data, canvasW, canvasH, isShortWord);
  return !!(res.isHighlighted && res.color?.id === 'yellow');
}

/**
 * Estima a largura de um caractere para compensar fontes proporcionais.
 */
function getCharWeight(ch) {
  if ('ijlftrI1 .,:;!\'`'.includes(ch)) return 0.55;
  if ('mwMWOQ@%'.includes(ch)) return 1.35;
  return 1.0;
}

/**
 * Divide um item de texto do PDF.js em palavras individuais com caixas proporcionais precisas.
 */
function splitItemIntoWords(item) {
  const str = item.str || '';
  if (!str.trim()) return [];

  const words = [];
  const regex = /\S+/g;
  let match;

  let totalWeight = 0;
  for (let i = 0; i < str.length; i++) {
    totalWeight += getCharWeight(str[i]);
  }
  const unitWidth = totalWeight > 0 ? (item.box.width / totalWeight) : 8;

  const xOffsets = new Float32Array(str.length + 1);
  let currentX = item.box.x;
  for (let i = 0; i < str.length; i++) {
    xOffsets[i] = currentX;
    currentX += getCharWeight(str[i]) * unitWidth;
  }
  xOffsets[str.length] = currentX;

  while ((match = regex.exec(str)) !== null) {
    const wordText = match[0];
    const startIndex = match.index;
    const endIndex = startIndex + wordText.length;

    const wordX = xOffsets[startIndex];
    const wordW = Math.max(4, xOffsets[endIndex] - wordX);

    words.push({
      text: wordText,
      box: {
        x: wordX,
        y: item.box.y,
        width: wordW,
        height: item.box.height
      },
      lineY: Math.round(item.box.y)
    });
  }

  return words;
}

/**
 * Verifica sobreposição de uma palavra com uma caixa delimitadora.
 * 
 * Regras estritas contra sangria vertical (descenders) e invasão horizontal:
 * 1. O centro vertical da palavra deve estar contido na altura da caixa (com margem milimétrica).
 * 2. A sobreposição vertical deve ser de pelo menos 40% da altura da palavra (evita que 1-2px
 *    de padding da linha acima atinjam palavras da linha abaixo).
 * 3. A sobreposição horizontal deve ser de pelo menos 20% da largura da palavra (evita que
 *    palavras não grifadas na mesma linha após o ponto final entrem).
 */
export function wordOverlapsBox(wBox, bBox, tolerance = 0.40) {
  const overlapX = Math.max(0, Math.min(wBox.x + wBox.width, bBox.x + bBox.width) - Math.max(wBox.x, bBox.x));
  const overlapY = Math.max(0, Math.min(wBox.y + wBox.height, bBox.y + bBox.height) - Math.max(wBox.y, bBox.y));

  if (overlapX <= 0 || overlapY <= 0) return false;

  const wordCenterY = wBox.y + wBox.height / 2;
  const marginY = Math.min(2.5, wBox.height * 0.2);
  const isCenterInsideY = wordCenterY >= (bBox.y - marginY) && wordCenterY <= (bBox.y + bBox.height + marginY);

  const overlapYRatio = overlapY / wBox.height;
  const overlapXRatio = overlapX / wBox.width;

  return isCenterInsideY && overlapYRatio >= tolerance && overlapXRatio > 0.20;
}

/**
 * Extrai as áreas das anotações nativas (QuadPoints ou Rect).
 */
export function annotationAreas(annotation, viewport) {
  const quads = annotation.quadPoints;
  const flat = quads ? Array.from(quads).flat(Infinity) : [];
  const numbers = flat.flatMap(p => typeof p === 'number' ? [p] : [p.x, p.y]);
  const regions = [];

  for (let i = 0; i + 7 < numbers.length; i += 8) {
    const xs = [numbers[i], numbers[i + 2], numbers[i + 4], numbers[i + 6]];
    const ys = [numbers[i + 1], numbers[i + 3], numbers[i + 5], numbers[i + 7]];
    regions.push([Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]);
  }

  if (!regions.length && annotation.rect) {
    regions.push(annotation.rect);
  }

  return regions.map(r => {
    const [x1, y1, x2, y2] = viewport.convertToViewportRectangle(r);
    return {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1)
    };
  });
}

/**
 * Reconstrução contínua por linha:
 * Garante que nenhuma palavra no meio do grifo ("é", "a", "em", "de", "os", etc.) seja cortada,
 * enquanto palavras externas antes do início ou após o ponto final continuam rigorosamente excluídas.
 * Atribui a cor específica detectada (amarelo, rosa, verde, laranja, roxo).
 */
function filterLineWordsWithContinuity(lineWords, data, canvasW, canvasH) {
  if (!lineWords || lineWords.length === 0) return [];

  const wordResults = lineWords.map(w => {
    const isShort = w.text.length <= 2;
    return getWordHighlighterOnCanvas(w.box, data, canvasW, canvasH, isShort);
  });

  const finalConfirmed = [];

  for (let i = 0; i < lineWords.length; i++) {
    const res = wordResults[i];

    if (res.isHighlighted && res.color) {
      finalConfirmed.push({
        ...lineWords[i],
        color: res.color
      });
    } else {
      let prevIdx = -1;
      for (let j = i - 1; j >= 0; j--) {
        if (wordResults[j].isHighlighted) {
          prevIdx = j;
          break;
        }
      }
      let nextIdx = -1;
      for (let j = i + 1; j < wordResults.length; j++) {
        if (wordResults[j].isHighlighted) {
          nextIdx = j;
          break;
        }
      }

      if (prevIdx !== -1 && nextIdx !== -1) {
        const prevRes = wordResults[prevIdx];
        const nextRes = wordResults[nextIdx];

        // Só junta conectivos intermediários se ambos os lados compartilharem a MESMA cor
        if (prevRes.color?.id === nextRes.color?.id) {
          const prevWord = lineWords[prevIdx];
          const nextWord = lineWords[nextIdx];
          const gap = nextWord.box.x - (prevWord.box.x + prevWord.box.width);

          if (gap < Math.max(prevWord.box.height, 14) * 2.2 && (nextIdx - prevIdx) <= 2 && lineWords[i].text.length <= 3) {
            finalConfirmed.push({
              ...lineWords[i],
              color: prevRes.color
            });
          }
        }
      }
    }
  }

  return finalConfirmed;
}

/**
 * Agrupa palavras grifadas consecutivas em trechos contínuos na íntegra.
 */
export function groupConsecutiveWords(words, pageNum, defaultColor, source) {
  if (!words || words.length === 0) return [];

  const uniqueWords = [];
  for (const w of words) {
    const isDup = uniqueWords.some(
      u => u.text === w.text && Math.abs(u.box.x - w.box.x) < 4 && Math.abs(u.box.y - w.box.y) < 4
    );
    if (!isDup) uniqueWords.push(w);
  }

  uniqueWords.sort((a, b) => {
    const diffY = a.box.y - b.box.y;
    if (Math.abs(diffY) > 5) {
      return diffY;
    }
    return a.box.x - b.box.x;
  });

  const highlights = [];
  let currentGroup = null;

  const COMPOUND_PREFIXES = [
    'norte-', 'sul-', 'leste-', 'oeste-', 'latino-', 'afro-', 'anglo-', 'euro-',
    'recém-', 'bem-', 'mal-', 'pré-', 'pós-', 'pró-', 'anti-', 'super-', 'ultra-',
    'guarda-', 'porta-', 'auto-'
  ];

  for (let i = 0; i < uniqueWords.length; i++) {
    const word = uniqueWords[i];

    if (!currentGroup) {
      currentGroup = {
        page: pageNum,
        words: [word],
        text: word.text,
        color: word.color || defaultColor,
        note: word.note || '',
        source: source || 'pdf_verified_scan',
        lastWord: word
      };
      continue;
    }

    const prev = currentGroup.lastWord;
    const isSameColor = !word.color?.id || !currentGroup.color?.id || word.color.id === currentGroup.color.id;

    // Altura da linha de texto padrão
    const lineHeight = Math.max(prev.box.height, word.box.height, 12);
    // Delta Y vertical entre o topo de prev e o topo de word
    const deltaY = word.box.y - prev.box.y;
    // Espaçamento vertical entre a base da linha anterior e o topo da linha atual
    const verticalGap = word.box.y - (prev.box.y + prev.box.height);

    // 1. Mesma linha física (faixa de altura menor ou igual a 6px)
    const isSameLine = Math.abs(deltaY) <= 6;

    // 2. Linha consecutiva direta:
    // delta Y estrito menor que a altura de uma linha de texto padrão (< 14px de espaçamento vertical)
    // NUNCA junta se verticalGap >= 10px ou deltaY >= 21px (que caracterizam espaçamento ou quebra de parágrafo)
    const isConsecutiveLine = !isSameLine && deltaY > 0 && verticalGap >= -8 && verticalGap < 10 && deltaY <= (lineHeight + 8);

    let shouldJoin = false;

    if (isSameColor) {
      if (isSameLine) {
        const gapX = word.box.x - (prev.box.x + prev.box.width);
        if (gapX >= -6 && gapX < Math.max(lineHeight, 14) * 1.6) {
          shouldJoin = true;
        }
      } else if (isConsecutiveLine) {
        // Se a linha anterior encerrou com pontuação terminal (. ! ?) e há respiro vertical (>= 5px), não funde
        const prevTextTrimmed = currentGroup.text.trim();
        const endsWithTerminal = /[.!?…]["'”’»)]*$/.test(prevTextTrimmed);

        if (endsWithTerminal && verticalGap >= 5) {
          shouldJoin = false;
        } else {
          // Continuidade horizontal entre linhas: início próximo à margem ou marcação contínua nativa
          const isAtLeftMargin = word.box.x <= Math.max(prev.box.x, 180);
          const isNativeAnnot = source === 'pdf_annotation';

          if (isNativeAnnot || isAtLeftMargin) {
            shouldJoin = true;
          }
        }
      }
    }

    if (shouldJoin) {
      currentGroup.words.push(word);

      if (currentGroup.text.endsWith('-')) {
        const lastWordInText = currentGroup.text.split(' ').pop().toLowerCase();
        const isCompound = COMPOUND_PREFIXES.some(prefix => lastWordInText.endsWith(prefix));

        if (isCompound) {
          currentGroup.text += word.text;
        } else {
          currentGroup.text = currentGroup.text.slice(0, -1) + word.text;
        }
      } else {
        currentGroup.text += ' ' + word.text;
      }

      if (word.note && !currentGroup.note.includes(word.note)) {
        currentGroup.note = currentGroup.note ? `${currentGroup.note} | ${word.note}` : word.note;
      }
      currentGroup.lastWord = word;
    } else {
      highlights.push(currentGroup);
      currentGroup = {
        page: pageNum,
        words: [word],
        text: word.text,
        color: word.color || defaultColor,
        note: word.note || '',
        source: source || 'pdf_verified_scan',
        lastWord: word
      };
    }
  }

  if (currentGroup) {
    highlights.push(currentGroup);
  }

  return highlights
    .map(g => {
      const gWords = g.words || [];
      const minY = gWords.length ? Math.min(...gWords.map(w => w.box.y)) : 0;
      const maxY = gWords.length ? Math.max(...gWords.map(w => w.box.y + w.box.height)) : 0;
      const minX = gWords.length ? Math.min(...gWords.map(w => w.box.x)) : 0;
      const maxX = gWords.length ? Math.max(...gWords.map(w => w.box.x + w.box.width)) : 0;

      return {
        id: `hl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        page: g.page,
        text: g.text.replace(/\s+/g, ' ').trim(),
        note: g.note?.trim() || '',
        color: g.color || defaultColor,
        source: g.source,
        words: g.words,
        box: { minY, maxY, minX, maxX },
        createdAt: new Date().toISOString()
      };
    })
    .filter(g => g.text.length >= 3 && !/^[0-9.,;:!?\s]+$/.test(g.text) && !isBlacklistedText(g.text));
}

/**
 * Extrai grifos de um arquivo PDF (.pdf) com reconstrução completa na íntegra
 */
async function extractFromPdf(file, onProgress = () => {}, options = {}) {
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

      // 1. Extração do conteúdo de texto em palavras proporcionais
      const textContent = await page.getTextContent();
      const allWords = [];

      for (const item of textContent.items) {
        if (!item.str || !item.str.trim()) continue;

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

        allWords.push(...wordsInItem);
      }

      // 2. Renderização do Canvas para verificação óptica real
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      let canvasData = null;
      if (ctx) {
        await page.render({ canvasContext: ctx, viewport }).promise;
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        canvasData = imgData.data;
      }

      // 3. Processamento de Anotações Nativas (Preserva cada anotação como um registro íntegro)
      const annotations = await page.getAnnotations();
      const nativeAreas = [];
      const pageHighlights = [];

      for (const annot of annotations) {
        if (!['Highlight', 'Underline', 'StrikeOut', 'Squiggly', 'Text', 'FreeText'].includes(annot.subtype)) continue;

        // Validação estrita de cores: ignora completamente links azuis, textos pretos/cinzas ou fora da paleta
        const annotColor = parseAnnotationColor(annot.color, annot.subtype);
        if (!annotColor) {
          continue;
        }

        const areas = annotationAreas(annot, viewport);
        nativeAreas.push(...areas);

        // Captura todas as palavras contidas nas áreas da anotação (rigor contra sangria vertical)
        const words = allWords.filter(w => areas.some(area => wordOverlapsBox(w.box, area, 0.40)));
        const parts = groupConsecutiveWords(words, pageNum, annotColor, 'pdf_annotation');

        for (let pIdx = 0; pIdx < parts.length; pIdx++) {
          const part = parts[pIdx];
          const text = part.text.trim();

          if (text && !isBlacklistedText(text)) {
            const partWords = part.words || [];
            const minY = partWords.length ? Math.min(...partWords.map(w => w.box.y)) : (areas.length ? Math.min(...areas.map(a => a.y)) : 0);
            const maxY = partWords.length ? Math.max(...partWords.map(w => w.box.y + w.box.height)) : (areas.length ? Math.max(...areas.map(a => a.y + a.height)) : 0);
            const minX = partWords.length ? Math.min(...partWords.map(w => w.box.x)) : (areas.length ? Math.min(...areas.map(a => a.x)) : 0);
            const maxX = partWords.length ? Math.max(...partWords.map(w => w.box.x + w.box.width)) : (areas.length ? Math.max(...areas.map(a => a.x + a.width)) : 0);

            pageHighlights.push({
              id: `native-${pageNum}-${annot.id || pageHighlights.length}${parts.length > 1 ? `-${pIdx + 1}` : ''}`,
              page: pageNum,
              text,
              note: annot.contentsObj?.str || (typeof annot.contents === 'string' ? annot.contents : ''),
              color: annotColor,
              source: 'pdf_annotation',
              confidence: partWords.length ? 0.95 : 0.3,
              createdAt: new Date().toISOString(),
              annotDate: annot.modificationDate || annot.date || null,
              box: { minY, maxY, minX, maxX },
              viewportHeight: viewport.height
            });
          }
        }
      }

      // 4. Verificação visual via Canvas para trechos desenhados diretamente (StarNote / tablets)
      if (canvasData && ctx) {
        // Filtra palavras que já foram cobertas pelas anotações nativas
        const remainingWords = allWords.filter(w => !nativeAreas.some(area => wordOverlapsBox(w.box, area, 0.40)));

        if (remainingWords.length > 0) {
          const linesMap = new Map();
          for (const w of remainingWords) {
            const matchedLineKey = Array.from(linesMap.keys()).find(k => Math.abs(k - w.lineY) <= 5);
            const lineKey = matchedLineKey !== undefined ? matchedLineKey : w.lineY;

            if (!linesMap.has(lineKey)) {
              linesMap.set(lineKey, []);
            }
            linesMap.get(lineKey).push(w);
          }

          const confirmedWords = [];

          for (const lineWords of linesMap.values()) {
            lineWords.sort((a, b) => a.box.x - b.box.x);
            const confirmedWordsOnLine = filterLineWordsWithContinuity(lineWords, canvasData, canvas.width, canvas.height);

            for (const w of confirmedWordsOnLine) {
              confirmedWords.push({
                ...w,
                color: w.color || HIGHLIGHT_PALETTE.yellow,
                note: '',
                source: 'pdf_verified_scan'
              });
            }
          }

          const visualHighlights = groupConsecutiveWords(
            confirmedWords,
            pageNum,
            HIGHLIGHT_PALETTE.yellow,
            'pdf_verified_scan'
          );

          // Descarta apenas grifos visuais que correspondam à exata mesma marcação física já coberta por anotação nativa
          const nonDuplicateVisuals = visualHighlights
            .filter(vh => !isBlacklistedText(vh.text))
            .filter(vh => {
              const vText = normalizeForComparison(vh.text);
              if (!vText || vText.length < 3) return false;

              return !pageHighlights.some(nh => areHighlightsSamePhysicalMark(nh, vh));
            });

          pageHighlights.push(...nonDuplicateVisuals.map(h => ({
            ...h,
            confidence: 0.85,
            box: {
              minY: h.words?.length ? Math.min(...h.words.map(w => w.box.y)) : (h.box?.minY ?? 0),
              maxY: h.words?.length ? Math.max(...h.words.map(w => w.box.y + w.box.height)) : (h.box?.maxY ?? 0),
              minX: h.words?.length ? Math.min(...h.words.map(w => w.box.x)) : (h.box?.minX ?? 0),
              maxX: h.words?.length ? Math.max(...h.words.map(w => w.box.x + w.box.width)) : (h.box?.maxX ?? 0)
            },
            viewportHeight: viewport.height
          })));
        }
      }

      // Deduplica grifos na mesma página (remove duplicatas puras e sobreposições)
      const dedupedPageHighlights = deduplicateHighlights(pageHighlights);

      // Avalia se há palavras de texto não grifadas antes ou depois de cada grifo na página (detecção de pausa na marcação)
      for (const hl of dedupedPageHighlights) {
        if (hl.box && allWords.length) {
          const wordsBelow = allWords.filter(w => {
            if (w.box.y <= hl.box.maxY + 6) return false;
            if (/^\d{1,4}$/.test(w.text.trim())) return false; // ignora número isolado de página no rodapé
            return true;
          });
          const wordsAbove = allWords.filter(w => {
            if (w.box.y + w.box.height >= hl.box.minY - 6) return false;
            if (/^\d{1,4}$/.test(w.text.trim())) return false; // ignora número isolado de página no topo
            return true;
          });
          hl.unhighlightedWordsBelowCount = wordsBelow.length;
          hl.unhighlightedWordsAboveCount = wordsAbove.length;
        }
      }

      dedupedPageHighlights.sort((a, b) => (a.box?.minY ?? 0) - (b.box?.minY ?? 0));
      allExtractedHighlights.push(...dedupedPageHighlights);

    } catch (pageErr) {
      console.warn(`[pdfHighlightExtractor] Erro ao processar página ${pageNum}:`, pageErr.message);
    }
  }

  onProgress({ current: numPages, total: numPages, stage: 'completed', message: 'Extração concluída com sucesso!' });
  const crossMerged = mergeCrossPageHighlights(allExtractedHighlights);
  return deduplicateHighlights(crossMerged);
}

/**
 * Parser Dedicado para Arquivos de Notas do Kindle (My Clippings.txt e exportações similares).
 * 
 * Regras:
 * 1. Identifica blocos delimitados por '==========' e metadados de livro/posição/página.
 * 2. Limpa aspas do início e fim dos trechos destacados ("...", “...”, «...»).
 * 3. Trata blocos em preto e branco como grifos válidos (KINDLE_COLOR_INFO), associando ao livro.
 * 4. Une notas anexadas à mesma página/posição do destaque correspondente.
 * 5. Rejeita qualquer aviso de direitos autorais, prefácios piratas ou URLs (isBlacklistedText).
 * 6. Se options.currentBookTitle for informado, filtra/associa com precisão ao livro do clube.
 */
export function parseKindleClippings(content, options = {}) {
  if (!content || typeof content !== 'string') return [];

  const blocks = content.split(/={5,}/);
  const highlights = [];
  const notesByLocation = new Map();
  let index = 0;

  for (const block of blocks) {
    const rawLines = block.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (rawLines.length < 2) continue;

    // Linha 1: Título da obra e autor (ex: "Como as democracias morrem (Steven Levitsky; Daniel Ziblatt)")
    const titleLine = rawLines[0].replace(/^[\uFEFF\s]+/, '').trim();
    if (!titleLine) continue;

    // Linha 2: Metadados do Kindle
    const metaLine = rawLines[1] || '';

    // Linhas 3+: O texto destacado ou a nota
    let textLines = rawLines.slice(2).join(' ').trim();
    if (!textLines || textLines.length < 3) continue;

    // Limpa aspas no início e fim do texto destacado pelo Kindle
    textLines = textLines.replace(/^["“'‘«\s]+|["”'’»\s]+$/g, '').trim();
    if (textLines.length < 3) continue;

    // Rejeita termos da lista negra (direitos autorais, Le Livros, URLs, sumários)
    if (isBlacklistedText(textLines)) continue;

    // Extrai número de página e posição
    const pageMatch = metaLine.match(/(?:p[aá]gina|page|p[aá]g\.)\s*(\d+)/i);
    const locMatch = metaLine.match(/(?:posi[cç][aã]o|location|pos\.)\s*([\d-]+)/i);
    const pageNum = pageMatch ? parseInt(pageMatch[1], 10) : (locMatch ? locMatch[1] : 1);
    const locationKey = locMatch ? locMatch[1] : `p-${pageNum}`;

    const isNote = /(?:nota|note|anota[cç][aã]o)\b/i.test(metaLine);
    const isBookmark = /(?:marcador|bookmark)\b/i.test(metaLine);

    if (isBookmark) continue;

    if (isNote) {
      const key = `${normalizeForComparison(titleLine)}::${pageNum}::${locationKey}`;
      notesByLocation.set(key, textLines);
      notesByLocation.set(`${normalizeForComparison(titleLine)}::${pageNum}`, textLines);
      continue;
    }

    highlights.push({
      id: `hl-clp-${Date.now()}-${index++}`,
      page: pageNum,
      text: textLines.replace(/\s+/g, ' ').trim(),
      note: '',
      bookHint: titleLine,
      color: KINDLE_COLOR_INFO,
      source: 'kindle_clippings',
      location: locationKey,
      createdAt: new Date().toISOString()
    });
  }

  // Associa notas aos respectivos grifos
  for (const hl of highlights) {
    const fullKey = `${normalizeForComparison(hl.bookHint)}::${hl.page}::${hl.location}`;
    const pageKey = `${normalizeForComparison(hl.bookHint)}::${hl.page}`;
    if (notesByLocation.has(fullKey)) {
      hl.note = notesByLocation.get(fullKey);
    } else if (notesByLocation.has(pageKey)) {
      hl.note = notesByLocation.get(pageKey);
    }
  }

  // Filtragem inteligente por livro se options.currentBookTitle for fornecido
  if (options.currentBookTitle && highlights.length > 0) {
    const targetNorm = normalizeForComparison(options.currentBookTitle);
    const matchedForBook = highlights.filter(hl => {
      const bookNorm = normalizeForComparison(hl.bookHint);
      return bookNorm.includes(targetNorm) || targetNorm.includes(bookNorm) || calculateTextSimilarity(bookNorm, targetNorm) >= 0.35;
    });

    if (matchedForBook.length > 0) {
      return matchedForBook;
    }
  }

  return highlights;
}

/**
 * Extrai notas e destaques de arquivo Kindle (My Clippings.txt, HTML Notebook ou texto plano)
 */
async function extractFromKindle(file, onProgress = () => {}, options = {}) {
  onProgress({ current: 0, total: 100, stage: 'reading', message: 'Lendo arquivo do Kindle...' });
  const content = await file.text();
  const isHtml = file.name.endsWith('.html') || file.type.includes('html') || content.includes('<html');

  if (isHtml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    const noteHeadings = doc.querySelectorAll('.noteHeading, .kp-notebook-metadata, h3');
    const noteTexts = doc.querySelectorAll('.noteText, .kp-notebook-highlight, p.body-text');

    const total = Math.max(noteHeadings.length, noteTexts.length);
    const highlights = [];

    for (let i = 0; i < total; i++) {
      const heading = noteHeadings[i]?.textContent || '';
      let text = noteTexts[i]?.textContent?.trim() || '';

      if (!text) continue;

      text = text.replace(/^["“'‘«\s]+|["”'’»\s]+$/g, '').trim();
      if (text.length < 3) continue;
      if (isBlacklistedText(text)) continue;

      const pageMatch = heading.match(/(?:p[aá]gina|page|p[aá]g\.)\s*(\d+)/i);
      const locMatch = heading.match(/(?:posi[cç][aã]o|location|pos\.)\s*([\d-]+)/i);
      const pageNum = pageMatch ? parseInt(pageMatch[1], 10) : (locMatch ? locMatch[1] : 1);

      // Detecta cor mencionada no heading do Kindle HTML (ex: "Destaque (amarelo)", "Highlight (pink)")
      let itemColor = KINDLE_COLOR_INFO;
      const hLower = heading.toLowerCase();
      if (hLower.includes('amarel') || hLower.includes('yellow')) {
        itemColor = HIGHLIGHT_PALETTE.yellow;
      } else if (hLower.includes('azul') || hLower.includes('blue') || hLower.includes('cian') || hLower.includes('cyan')) {
        itemColor = HIGHLIGHT_PALETTE.blue;
      } else if (hLower.includes('rosa') || hLower.includes('pink') || hLower.includes('magenta')) {
        itemColor = HIGHLIGHT_PALETTE.pink;
      } else if (hLower.includes('verd') || hLower.includes('green')) {
        itemColor = HIGHLIGHT_PALETTE.green;
      } else if (hLower.includes('laranj') || hLower.includes('orange')) {
        itemColor = HIGHLIGHT_PALETTE.orange;
      } else if (hLower.includes('rox') || hLower.includes('lil') || hLower.includes('purple')) {
        itemColor = HIGHLIGHT_PALETTE.purple;
      }

      highlights.push({
        id: `hl-knd-${Date.now()}-${i}`,
        page: pageNum,
        text,
        note: heading.includes('Nota') || heading.includes('Note') ? heading : '',
        color: itemColor,
        source: 'kindle_html',
        bookHint: options.currentBookTitle || '',
        createdAt: new Date().toISOString()
      });
    }

    onProgress({ current: 100, total: 100, stage: 'completed', message: 'Notas do Kindle extraídas com sucesso!' });
    return highlights;
  }

  if (content.includes('==========')) {
    onProgress({ current: 100, total: 100, stage: 'completed', message: 'Destaques do My Clippings processados!' });
    return parseKindleClippings(content, options);
  }

  // Fallback para outros formatos de texto do Kindle
  const lines = content.split(/\r?\n/);
  let currentMeta = null;
  let currentText = [];
  let index = 0;
  const highlights = [];

  const flushCurrent = () => {
    if (currentText.length > 0) {
      let joined = currentText.join(' ').trim();
      joined = joined.replace(/^["“'‘«\s]+|["”'’»\s]+$/g, '').trim();

      if (joined.length >= 3 && !isBlacklistedText(joined)) {
        const pageMatch = currentMeta ? currentMeta.match(/(?:p[aá]gina|page|p[aá]g\.)\s*(\d+)/i) : null;
        const locMatch = currentMeta ? currentMeta.match(/(?:posi[cç][aã]o|location|pos\.)\s*([\d-]+)/i) : null;
        const pageNum = pageMatch ? parseInt(pageMatch[1], 10) : (locMatch ? locMatch[1] : 1);

        highlights.push({
          id: `hl-kndtxt-${Date.now()}-${index++}`,
          page: pageNum,
          text: joined.replace(/\s+/g, ' '),
          note: currentMeta && (currentMeta.toLowerCase().includes('nota') || currentMeta.toLowerCase().includes('note')) ? currentMeta : '',
          color: KINDLE_COLOR_INFO,
          source: 'kindle_text_notebook',
          bookHint: options.currentBookTitle || '',
          createdAt: new Date().toISOString()
        });
      }
    }
    currentText = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const isHeader = /(?:destaque|highlight|nota|note)\s*(?:\([^)]*\))?\s*[-–—]\s*(?:p[aá]gina|page|posi[cç][aã]o|location)/i.test(line);

    if (isHeader) {
      flushCurrent();
      currentMeta = line;
    } else if (currentMeta) {
      currentText.push(line);
    }
  }
  flushCurrent();

  onProgress({ current: 100, total: 100, stage: 'completed', message: 'Notas do Kindle extraídas com sucesso!' });
  return highlights;
}

/**
 * Normaliza uma string para comparação textual robusta
 */
export function normalizeForComparison(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calcula a taxa de similaridade textual entre dois trechos (0 a 1.0)
 */
export function calculateTextSimilarity(text1, text2) {
  const s1 = normalizeForComparison(text1);
  const s2 = normalizeForComparison(text2);

  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1.0;

  if (s1.includes(s2) || s2.includes(s1)) {
    const minLen = Math.min(s1.length, s2.length);
    const maxLen = Math.max(s1.length, s2.length);
    return minLen / maxLen >= 0.35 ? 0.90 : 0.70;
  }

  const words1 = s1.split(' ').filter(w => w.length > 2);
  const words2 = s2.split(' ').filter(w => w.length > 2);

  if (words1.length === 0 || words2.length === 0) return 0;

  const set1 = new Set(words1);
  const set2 = new Set(words2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return union.size > 0 ? (intersection.size / union.size) : 0;
}

/**
 * Determina com precisão milimétrica se dois grifos correspondem à MESMA marcação física no PDF.
 * Permite destaques curtos ou recorrentes na mesma página quando tiverem coordenadas retangulares distintas.
 */
export function areHighlightsSamePhysicalMark(h1, h2) {
  if (!h1 || !h2) return false;
  if (h1.id && h2.id && h1.id === h2.id) return true;

  const hasBoxes1 = h1.box && typeof h1.box.minY === 'number' && typeof h1.box.maxY === 'number';
  const hasBoxes2 = h2.box && typeof h2.box.minY === 'number' && typeof h2.box.maxY === 'number';

  if (!hasBoxes1 || !hasBoxes2) {
    if (h1.location && h2.location && h1.location === h2.location) {
      return normalizeForComparison(h1.text) === normalizeForComparison(h2.text);
    }
    return false;
  }

  const b1 = h1.box;
  const b2 = h2.box;

  const diffMinY = Math.abs(b1.minY - b2.minY);
  const diffMaxY = Math.abs(b1.maxY - b2.maxY);

  const h1Height = Math.abs(b1.maxY - b1.minY);
  const h2Height = Math.abs(b2.maxY - b2.minY);

  // Se os retângulos têm alturas substancialmente diferentes (ex: uma pergunta isolada vs um parágrafo longo),
  // ou iniciam/terminam em linhas diferentes, são marcações físicas distintas!
  const isSameVerticalSpan = diffMinY < 10 && diffMaxY < 10 && Math.abs(h1Height - h2Height) < 12;

  if (!isSameVerticalSpan) {
    return false;
  }

  // Se tiver coordenadas horizontais (minX, maxX):
  if (b1.minX !== undefined && b2.minX !== undefined && b1.maxX !== undefined && b2.maxX !== undefined) {
    const diffMaxX = Math.abs(b1.maxX - b2.maxX);
    // Se um dos destaques terminar em ponto horizontal bem anterior (ex: apenas a pergunta isolada no início da linha)
    if (diffMaxX > 35) {
      return false;
    }
  }

  const t1 = normalizeForComparison(h1.text);
  const t2 = normalizeForComparison(h2.text);

  if (t1 === t2) return true;
  if (t1.includes(t2) || t2.includes(t1)) return true;
  if (calculateTextSimilarity(h1.text, h2.text) >= 0.80) return true;

  return false;
}

/**
 * Deduplica grifos na mesma página ou no documento, eliminando repetições idênticas,
 * subconjuntos e sobreposições indesejadas (ex: sobreposição de nativo com scanner de canvas).
 * Preserva integralmente destaques curtos ou recorrentes com coordenadas retangulares distintas.
 */
export function deduplicateHighlights(highlights) {
  if (!Array.isArray(highlights) || highlights.length <= 1) {
    return highlights || [];
  }

  const result = [];

  for (const hl of highlights) {
    const textNorm = normalizeForComparison(hl.text);
    if (!textNorm || textNorm.length < 3) continue;

    const pageStr = String(hl.page || '1');
    const pStart = parseInt(pageStr.split('-')[0], 10);
    const pEnd = parseInt(pageStr.split('-').pop(), 10);

    const existingIdx = result.findIndex(existing => {
      const existingPageStr = String(existing.page || '1');
      const exStart = parseInt(existingPageStr.split('-')[0], 10);
      const exEnd = parseInt(existingPageStr.split('-').pop(), 10);

      const samePage = (pStart === exStart && pEnd === exEnd) || (pStart === exStart);
      if (!samePage) return false;

      return areHighlightsSamePhysicalMark(existing, hl);
    });

    if (existingIdx === -1) {
      result.push(hl);
    } else {
      const existing = result[existingIdx];
      const exNorm = normalizeForComparison(existing.text);

      const isNewLonger = textNorm.length > exNorm.length;
      const isNative = existing.source === 'pdf_annotation' || hl.source === 'pdf_annotation';

      let mergedNote = existing.note || '';
      if (hl.note && !mergedNote.includes(hl.note)) {
        mergedNote = mergedNote ? `${mergedNote} | ${hl.note}` : hl.note;
      }

      result[existingIdx] = {
        ...existing,
        text: isNewLonger ? hl.text : existing.text,
        note: mergedNote.trim(),
        source: isNative ? 'pdf_annotation' : (existing.source || hl.source),
        confidence: Math.max(existing.confidence || 0.8, hl.confidence || 0.8),
        color: existing.color || hl.color,
        page: String(existing.page).length >= String(hl.page).length ? existing.page : hl.page,
        box: existing.box || hl.box
      };
    }
  }

  return result;
}

const COMMON_ABBREVIATIONS = new Set([
  'art', 'pág', 'pag', 'p', 'pp', 'vol', 'cap', 'ed', 'ex', 'etc',
  'séc', 'sec', 'dr', 'dra', 'sr', 'sra', 'prof', 'profa', 'gov',
  'min', 'pres', 'vs', 'v', 'av', 'núm', 'num', 'nº', 'al', 'eg', 'ie'
]);

const CONNECTIVES = new Set([
  'de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos',
  'por', 'pela', 'pelo', 'pelas', 'pelos', 'com', 'para', 'pra', 'pro',
  'sob', 'sobre', 'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas',
  'e', 'ou', 'mas', 'que', 'se', 'como', 'quando', 'onde', 'qual', 'quais',
  'cujo', 'cuja', 'cujos', 'cujas', 'nem', 'sem', 'até'
]);

/**
 * Avalia se dois trechos em páginas consecutivas compõem a mesma frase contínua
 */
export function isTextContinuousAcrossPages(textA, textB, hlA = {}, hlB = {}) {
  const cleanA = (textA || '').trim();
  const cleanB = (textB || '').trim();

  if (!cleanA || !cleanB) return false;

  // 1. Terminação com hífen (palavra cortada entre páginas, ex: "democrá-" + "ticas")
  if (cleanA.endsWith('-') || cleanA.endsWith('‐') || cleanA.endsWith('–')) {
    return true;
  }

  // 2. Verifica se cleanA termina com pontuação terminal (. ! ?)
  const endsWithTerminalPunct = /[.!?…]["'”’»)]*$/.test(cleanA);
  let isAbbreviation = false;
  if (cleanA.endsWith('.')) {
    const wordsA = cleanA.split(/\s+/);
    const lastWordA = wordsA[wordsA.length - 1].replace(/^[("“‘«]+|[.,;:!?)"”’»]+$/g, '').toLowerCase();
    if (COMMON_ABBREVIATIONS.has(lastWordA)) {
      isAbbreviation = true;
    }
  }

  // Regra Fundamental: Se o trecho anterior termina com ponto final/interrogação/exclamação legítimo:
  // É o término de uma sentença completa. Não deve ser fundido com o início de outro trecho da página seguinte!
  if (endsWithTerminalPunct && !isAbbreviation) {
    // Exceção estrita: se ambos compartilharem exatamente a mesma anotação e colarem na margem sem palavras intermediárias
    if (hlA.annotDate && hlB.annotDate && hlA.annotDate === hlB.annotDate) {
      const noGap = (hlA.unhighlightedWordsBelowCount ?? 0) <= 2 && (hlB.unhighlightedWordsAboveCount ?? 0) <= 2;
      if (noGap) {
        return true;
      }
    }
    return false;
  }

  // 3. Pontuação não terminal no final de A (vírgula, dois pontos, ponto e vírgula, travessão)
  const endsWithNonTerminalPunct = /[,;:\-—–]["'”’»)]*$/.test(cleanA);
  if (endsWithNonTerminalPunct) {
    return true;
  }

  // 4. Terminação com conectivo no final de A (ex: "de", "em", "o papel de")
  const wordsA = cleanA.split(/\s+/);
  const lastWordA = wordsA[wordsA.length - 1].replace(/^[("“‘«]+|[.,;:!?)"”’»]+$/g, '').toLowerCase();
  if (CONNECTIVES.has(lastWordA)) {
    return true;
  }

  // 5. Terminação com abreviação comum com ponto (ex: "art.", "pág.")
  if (isAbbreviation) {
    return true;
  }

  // 6. Terminação sem pontuação terminal (. ! ?) - ex: "Existe" no rodapé da página 5
  if (!endsWithTerminalPunct) {
    return true;
  }

  return false;
}

/**
 * Verifica se dois grifos devem ser unificados através de uma quebra de página
 */
export function shouldMergeAcrossPages(prevHl, nextHl) {
  if (!prevHl || !nextHl) return false;

  const prevPageStr = String(prevHl.page || '0');
  const nextPageStr = String(nextHl.page || '0');

  const p1End = parseInt(prevPageStr.split('-').pop(), 10);
  const p2Start = parseInt(nextPageStr.split('-')[0], 10);

  if (isNaN(p1End) || isNaN(p2Start) || p2Start !== p1End + 1) {
    return false;
  }

  if (prevHl.color?.id && nextHl.color?.id) {
    if (prevHl.color.id !== nextHl.color.id) {
      return false;
    }
  } else if (prevHl.color?.name && nextHl.color?.name) {
    const isYellow1 = prevHl.color.name.toLowerCase().includes('amarel');
    const isYellow2 = nextHl.color.name.toLowerCase().includes('amarel');
    if (isYellow1 !== isYellow2) {
      return false;
    }
  }

  // Se houver uma pausa clara na marcação antes do rodapé da página anterior:
  // (há mais de 6 palavras de texto não grifado abaixo do grifo no fim da página)
  if (prevHl.unhighlightedWordsBelowCount !== undefined && prevHl.unhighlightedWordsBelowCount > 6) {
    return false;
  }

  // Se houver uma pausa clara na marcação antes do início do grifo na página seguinte:
  // (há mais de 6 palavras de texto não grifado acima do grifo no início da página)
  if (nextHl.unhighlightedWordsAboveCount !== undefined && nextHl.unhighlightedWordsAboveCount > 6) {
    return false;
  }

  return isTextContinuousAcrossPages(prevHl.text, nextHl.text, prevHl, nextHl);
}

/**
 * Une dois grifos contíguos de páginas consecutivas em uma passagem única
 */
export function mergeTwoHighlights(h1, h2) {
  const p1 = String(h1.page || '1').split('-')[0];
  const p2 = String(h2.page || '1').split('-').pop();
  const pageLabel = p1 === p2 ? p1 : `${p1}-${p2}`;

  const text1 = (h1.text || '').trim();
  const text2 = (h2.text || '').trim();

  let mergedText = '';

  const COMPOUND_PREFIXES = [
    'norte-', 'sul-', 'leste-', 'oeste-', 'latino-', 'afro-', 'anglo-', 'euro-',
    'recém-', 'bem-', 'mal-', 'pré-', 'pós-', 'pró-', 'anti-', 'super-', 'ultra-',
    'guarda-', 'porta-', 'auto-'
  ];

  if (text1.endsWith('-') || text1.endsWith('‐') || text1.endsWith('–')) {
    const rawPrefix = text1.slice(0, -1);
    const lastWord = rawPrefix.split(/\s+/).pop().toLowerCase() + '-';
    const isCompound = COMPOUND_PREFIXES.some(prefix => lastWord.endsWith(prefix));

    if (isCompound) {
      mergedText = rawPrefix + '-' + text2;
    } else {
      mergedText = rawPrefix + text2;
    }
  } else if (/["'“‘«(]$/.test(text1) || /^[)"'”’».,;:!?]/.test(text2)) {
    mergedText = text1 + text2;
  } else {
    mergedText = text1 + ' ' + text2;
  }

  let mergedNote = h1.note || '';
  if (h2.note && !mergedNote.includes(h2.note)) {
    mergedNote = mergedNote ? `${mergedNote} | ${h2.note}` : h2.note;
  }

  return {
    ...h1,
    id: h1.id,
    page: pageLabel,
    text: mergedText.replace(/\s+/g, ' ').trim(),
    note: mergedNote.trim(),
    confidence: Math.max(h1.confidence || 0.8, h2.confidence || 0.8),
    source: (h1.source === 'pdf_annotation' || h2.source === 'pdf_annotation') ? 'pdf_annotation' : (h1.source || h2.source),
    color: h1.color || h2.color,
    box: {
      minY: h1.box?.minY ?? 0,
      maxY: h2.box?.maxY ?? h1.box?.maxY ?? 0
    },
    unhighlightedWordsAboveCount: h1.unhighlightedWordsAboveCount,
    unhighlightedWordsBelowCount: h2.unhighlightedWordsBelowCount
  };
}

/**
 * Reúne grifos consecutivos que atravessam quebras de página em uma única frase contínua
 */
export function mergeCrossPageHighlights(highlights) {
  if (!Array.isArray(highlights) || highlights.length <= 1) {
    return highlights || [];
  }

  // Ordena por página e depois pela posição vertical de leitura
  const sorted = [...highlights].sort((a, b) => {
    const pA = parseInt(String(a.page || '0').split('-')[0], 10) || 0;
    const pB = parseInt(String(b.page || '0').split('-')[0], 10) || 0;
    if (pA !== pB) return pA - pB;
    const yA = a.box?.minY ?? 0;
    const yB = b.box?.minY ?? 0;
    return yA - yB;
  });

  const merged = [];

  for (let i = 0; i < sorted.length; i++) {
    let item = sorted[i];

    while (merged.length > 0) {
      const prev = merged[merged.length - 1];
      if (shouldMergeAcrossPages(prev, item)) {
        merged.pop();
        item = mergeTwoHighlights(prev, item);
      } else {
        break;
      }
    }

    merged.push(item);
  }

  return merged;
}

/**
 * Função principal exportada: extrai grifos de qualquer arquivo suportado (.pdf, .txt, .html)
 */
export async function extractHighlightsFromFile(file, onProgress = () => {}, options = {}) {
  if (!file) throw new Error('Nenhum arquivo informado.');

  const ext = file.name.split('.').pop().toLowerCase();
  let raw = [];

  if (ext === 'pdf' || file.type === 'application/pdf') {
    raw = await extractFromPdf(file, onProgress, options);
  } else if (ext === 'txt' || ext === 'html' || ext === 'htm' || file.type.includes('text') || file.type.includes('html')) {
    raw = await extractFromKindle(file, onProgress, options);
  } else {
    throw new Error(`Formato .${ext} não suportado. Utilize arquivos .pdf, .txt (My Clippings) ou .html (Kindle Notebook).`);
  }

  // Filtra itens da lista negra (direitos autorais, Le Livros, URLs, sumários)
  const cleanRaw = raw.filter(h => !isBlacklistedText(h.text));
  const merged = mergeCrossPageHighlights(cleanRaw);
  return deduplicateHighlights(merged).filter(h => !isBlacklistedText(h.text));
}
