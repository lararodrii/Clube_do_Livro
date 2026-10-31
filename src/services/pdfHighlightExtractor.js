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

export const YELLOW_COLOR_INFO = {
  name: 'Amarelo Revolucionário',
  hex: '#FDE047',
  bgClass: 'bg-yellow-300/40 border-yellow-400 text-yellow-950'
};

export const KINDLE_COLOR_INFO = {
  name: 'Destaque Kindle',
  hex: '#FEF08A',
  bgClass: 'bg-yellow-200/50 border-yellow-400 text-yellow-950'
};

/**
 * Detecta se um pixel do Canvas é Marca-Texto Amarelo.
 */
function isYellowHighlighterPixel(r, g, b) {
  if (r < 155 || g < 145) return false;
  if ((r - b) < 45 || (g - b) < 35) return false;
  if (b > 155) return false;
  if (Math.abs(r - g) > 55) return false;
  return true;
}

/**
 * Validação visual para o Canvas (exportada para uso em testes e análise óptica).
 */
export function isWordYellowOnCanvas(wordBox, data, canvasW, canvasH, isShortWord = false) {
  const padX = isShortWord ? 3 : 1;
  const startX = Math.max(0, Math.floor(wordBox.x - padX));
  const endX = Math.min(canvasW - 1, Math.ceil(wordBox.x + wordBox.width + padX));
  const startY = Math.max(0, Math.floor(wordBox.y + wordBox.height * 0.1));
  const endY = Math.min(canvasH - 1, Math.ceil(wordBox.y + wordBox.height * 0.9));

  if (endX <= startX || endY <= startY) return false;

  let totalSampled = 0;
  let yellowCount = 0;

  for (let y = startY; y < endY; y += 2) {
    for (let x = startX; x < endX; x += 2) {
      const idx = (y * canvasW + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (a < 120) continue;

      totalSampled++;
      if (isYellowHighlighterPixel(r, g, b)) {
        yellowCount++;
      }
    }
  }

  if (totalSampled < 3) return false;

  const yellowRatio = yellowCount / totalSampled;
  const threshold = isShortWord ? 0.08 : 0.13;
  return yellowRatio >= threshold;
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
 */
export function wordOverlapsBox(wBox, bBox, tolerance = 0.15) {
  const overlapX = Math.max(0, Math.min(wBox.x + wBox.width, bBox.x + bBox.width) - Math.max(wBox.x, bBox.x));
  const overlapY = Math.max(0, Math.min(wBox.y + wBox.height, bBox.y + bBox.height) - Math.max(wBox.y, bBox.y));

  if (overlapX <= 0 || overlapY <= 0) return false;
  return (overlapX / wBox.width) > tolerance && (overlapY / wBox.height) > tolerance;
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
 */
function filterLineWordsWithContinuity(lineWords, data, canvasW, canvasH) {
  if (!lineWords || lineWords.length === 0) return [];

  const wordStatus = lineWords.map(w => {
    const isShort = w.text.length <= 2;
    return isWordYellowOnCanvas(w.box, data, canvasW, canvasH, isShort);
  });

  const finalConfirmed = [];

  for (let i = 0; i < lineWords.length; i++) {
    const isDirectlyYellow = wordStatus[i];

    if (isDirectlyYellow) {
      finalConfirmed.push(lineWords[i]);
    } else {
      const prevYellowIdx = wordStatus.lastIndexOf(true, i);
      const nextYellowIdx = wordStatus.indexOf(true, i);

      if (prevYellowIdx !== -1 && nextYellowIdx !== -1) {
        const prevWord = lineWords[prevYellowIdx];
        const nextWord = lineWords[nextYellowIdx];
        const gap = nextWord.box.x - (prevWord.box.x + prevWord.box.width);

        if (gap < Math.max(prevWord.box.height, 14) * 5.0 && (nextYellowIdx - prevYellowIdx) <= 3) {
          finalConfirmed.push(lineWords[i]);
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
    const isSameLine = Math.abs(word.box.y - prev.box.y) <= 7;
    const isNextLine = !isSameLine && (word.box.y > prev.box.y) && ((word.box.y - prev.box.y) < Math.max(prev.box.height, word.box.height) * 2.2);

    let shouldJoin = false;

    if (isSameLine) {
      const gapX = word.box.x - (prev.box.x + prev.box.width);
      if (gapX >= -6 && gapX < Math.max(prev.box.height, 14) * 3.5) {
        shouldJoin = true;
      }
    } else if (isNextLine) {
      const lineGap = word.box.y - prev.box.y;
      if (lineGap < Math.max(prev.box.height, 14) * 2.2) {
        shouldJoin = true;
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
    .map(g => ({
      id: `hl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      page: g.page,
      text: g.text.replace(/\s+/g, ' ').trim(),
      note: g.note?.trim() || '',
      color: g.color || defaultColor,
      source: g.source,
      words: g.words,
      createdAt: new Date().toISOString()
    }))
    .filter(g => g.text.length >= 3 && !/^[0-9.,;:!?\s]+$/.test(g.text));
}

/**
 * Extrai grifos de um arquivo PDF (.pdf) com reconstrução completa na íntegra
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
        const areas = annotationAreas(annot, viewport);
        nativeAreas.push(...areas);

        // Captura todas as palavras contidas nas áreas da anotação
        const words = allWords.filter(w => areas.some(area => wordOverlapsBox(w.box, area, 0.15)));
        const parts = groupConsecutiveWords(words, pageNum, YELLOW_COLOR_INFO, 'pdf_annotation');
        const text = parts.map(p => p.text).join(' ').trim();

        if (text) {
          const minY = words.length ? Math.min(...words.map(w => w.box.y)) : (areas.length ? Math.min(...areas.map(a => a.y)) : 0);
          const maxY = words.length ? Math.max(...words.map(w => w.box.y + w.box.height)) : (areas.length ? Math.max(...areas.map(a => a.y + a.height)) : 0);

          pageHighlights.push({
            id: `native-${pageNum}-${annot.id || pageHighlights.length}`,
            page: pageNum,
            text,
            note: annot.contentsObj?.str || (typeof annot.contents === 'string' ? annot.contents : ''),
            color: YELLOW_COLOR_INFO,
            source: 'pdf_annotation',
            confidence: words.length ? 0.95 : 0.3,
            createdAt: new Date().toISOString(),
            annotDate: annot.modificationDate || annot.date || null,
            box: { minY, maxY },
            viewportHeight: viewport.height
          });
        }
      }

      // 4. Verificação visual via Canvas para trechos desenhados diretamente (StarNote / tablets)
      if (canvasData && ctx) {
        // Filtra palavras que já foram cobertas pelas anotações nativas
        const remainingWords = allWords.filter(w => !nativeAreas.some(area => wordOverlapsBox(w.box, area, 0.05)));

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
            const yellowWordsOnLine = filterLineWordsWithContinuity(lineWords, canvasData, canvas.width, canvas.height);

            for (const w of yellowWordsOnLine) {
              confirmedWords.push({
                ...w,
                color: YELLOW_COLOR_INFO,
                note: '',
                source: 'pdf_verified_scan'
              });
            }
          }

          const visualHighlights = groupConsecutiveWords(
            confirmedWords,
            pageNum,
            YELLOW_COLOR_INFO,
            'pdf_verified_scan'
          );

          // Descarta qualquer grifo visual cujo texto ou linha já foi coberto por anotação nativa na mesma página
          const nonDuplicateVisuals = visualHighlights.filter(vh => {
            const vText = normalizeForComparison(vh.text);
            if (!vText || vText.length < 3) return false;

            return !pageHighlights.some(nh => {
              const nText = normalizeForComparison(nh.text);
              if (nText === vText || nText.includes(vText) || vText.includes(nText)) return true;
              if (calculateTextSimilarity(nh.text, vh.text) >= 0.65) return true;
              if (nh.box && vh.box) {
                const yOverlap = Math.max(0, Math.min(nh.box.maxY, vh.box.maxY) - Math.max(nh.box.minY, vh.box.minY));
                const minH = Math.min(nh.box.maxY - nh.box.minY, vh.box.maxY - vh.box.minY);
                if (minH > 0 && (yOverlap / minH) > 0.40) return true;
              }
              return false;
            });
          });

          pageHighlights.push(...nonDuplicateVisuals.map(h => ({
            ...h,
            confidence: 0.85,
            box: {
              minY: h.words?.length ? Math.min(...h.words.map(w => w.box.y)) : 0,
              maxY: h.words?.length ? Math.max(...h.words.map(w => w.box.y + w.box.height)) : 0
            },
            viewportHeight: viewport.height
          })));
        }
      }

      // Deduplica grifos na mesma página (remove duplicatas puras e sobreposições)
      const dedupedPageHighlights = deduplicateHighlights(pageHighlights);
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
 * Extrai notas e destaques de arquivo Kindle (My Clippings.txt ou HTML Notebook)
 */
async function extractFromKindle(file, onProgress = () => {}) {
  onProgress({ current: 0, total: 100, stage: 'reading', message: 'Lendo arquivo do Kindle...' });
  const content = await file.text();
  const isHtml = file.name.endsWith('.html') || file.type.includes('html') || content.includes('<html');

  const highlights = [];

  if (isHtml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    const noteHeadings = doc.querySelectorAll('.noteHeading, .kp-notebook-metadata, h3');
    const noteTexts = doc.querySelectorAll('.noteText, .kp-notebook-highlight, p.body-text');

    const total = Math.max(noteHeadings.length, noteTexts.length);
    for (let i = 0; i < total; i++) {
      const heading = noteHeadings[i]?.textContent || '';
      let text = noteTexts[i]?.textContent?.trim() || '';

      if (!text) continue;

      text = text.replace(/^["“'‘\s]+|["”'’\s]+$/g, '').trim();
      if (text.length < 3) continue;

      const pageMatch = heading.match(/(?:página|page|pág\.)\s*(\d+)/i);
      const locMatch = heading.match(/(?:posição|location|pos\.)\s*([\d-]+)/i);
      const pageNum = pageMatch ? parseInt(pageMatch[1], 10) : (locMatch ? locMatch[1] : 1);

      highlights.push({
        id: `hl-knd-${Date.now()}-${i}`,
        page: pageNum,
        text,
        note: heading.includes('Nota') || heading.includes('Note') ? heading : '',
        color: KINDLE_COLOR_INFO,
        source: 'kindle_html',
        createdAt: new Date().toISOString()
      });
    }
  } else if (content.includes('==========')) {
    const blocks = content.split(/={8,}/);
    let index = 0;

    for (const block of blocks) {
      const lines = block.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) continue;

      const titleLine = lines[0];
      const metaLine = lines[1] || '';
      let textLines = lines.slice(2).join(' ').trim();

      if (!textLines || textLines.length < 3) continue;

      textLines = textLines.replace(/^["“'‘\s]+|["”'’\s]+$/g, '').trim();

      const pageMatch = metaLine.match(/(?:página|page|pág\.)\s*(\d+)/i);
      const locMatch = metaLine.match(/(?:posição|location|pos\.)\s*([\d-]+)/i);
      const pageNum = pageMatch ? parseInt(pageMatch[1], 10) : (locMatch ? locMatch[1] : 1);

      highlights.push({
        id: `hl-clp-${Date.now()}-${index++}`,
        page: pageNum,
        text: textLines.replace(/\s+/g, ' ').trim(),
        note: metaLine.toLowerCase().includes('nota') ? metaLine : '',
        bookHint: titleLine,
        color: KINDLE_COLOR_INFO,
        source: 'kindle_clippings',
        createdAt: new Date().toISOString()
      });
    }
  } else {
    const lines = content.split(/\r?\n/);
    let currentMeta = null;
    let currentText = [];
    let index = 0;

    const flushCurrent = () => {
      if (currentText.length > 0) {
        let joined = currentText.join(' ').trim();
        joined = joined.replace(/^["“'‘\s]+|["”'’\s]+$/g, '').trim();

        if (joined.length >= 3) {
          const pageMatch = currentMeta ? currentMeta.match(/(?:página|page|pág\.)\s*(\d+)/i) : null;
          const locMatch = currentMeta ? currentMeta.match(/(?:posição|location|pos\.)\s*([\d-]+)/i) : null;
          const pageNum = pageMatch ? parseInt(pageMatch[1], 10) : (locMatch ? locMatch[1] : 1);

          highlights.push({
            id: `hl-kndtxt-${Date.now()}-${index++}`,
            page: pageNum,
            text: joined.replace(/\s+/g, ' '),
            note: currentMeta && (currentMeta.toLowerCase().includes('nota') || currentMeta.toLowerCase().includes('note')) ? currentMeta : '',
            color: KINDLE_COLOR_INFO,
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
 * Deduplica grifos na mesma página ou no documento, eliminando repetições idênticas,
 * subconjuntos e sobreposições indesejadas (ex: sobreposição de nativo com scanner de canvas).
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

      const exNorm = normalizeForComparison(existing.text);

      const hasBoxes = existing.box?.minY !== undefined && hl.box?.minY !== undefined;
      const yDiff = hasBoxes ? Math.abs(existing.box.minY - hl.box.minY) : 0;
      const isSameLine = !hasBoxes || yDiff < 15;

      // 1. Textos idênticos na mesma linha ou mesmo trecho
      if (exNorm === textNorm) {
        // Se ambos forem anotações com notas diferentes em linhas distantes (como no teste 5), não deduplica
        if (hasBoxes && yDiff >= 15 && existing.note !== hl.note && existing.note && hl.note) {
          return false;
        }
        return true;
      }

      // 2. Um contém o outro na mesma linha/região
      if ((exNorm.includes(textNorm) || textNorm.includes(exNorm)) && isSameLine) {
        return true;
      }

      // 3. Alta similaridade lexical (>= 80%) na mesma linha
      if (isSameLine && calculateTextSimilarity(existing.text, hl.text) >= 0.80) {
        return true;
      }

      return false;
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
        page: String(existing.page).length >= String(hl.page).length ? existing.page : hl.page
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

  // 2. Início de B com letra minúscula: em livros diagramados, uma nova frase nunca inicia com minúscula
  const bWithoutLeadingQuotes = cleanB.replace(/^["'“‘«(\s]+/, '');
  const startsWithLowerB = /^[a-záàâãéèêíïóôõöúçñ]/.test(bWithoutLeadingQuotes);
  if (startsWithLowerB) {
    return true;
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
  if (cleanA.endsWith('.')) {
    const wordBeforeDot = lastWordA.replace(/\.$/, '');
    if (COMMON_ABBREVIATIONS.has(wordBeforeDot)) {
      return true;
    }
  }

  // 6. Terminação sem pontuação terminal (. ! ?): a frase não terminou na página A
  const endsWithTerminalPunct = /[.!?…]["'”’»)]*$/.test(cleanA);
  if (!endsWithTerminalPunct) {
    return true;
  }

  // 7. Mesmo timestamp exato de anotação no PDF (mesmo gesto contínuo de arrastar)
  if (hlA.annotDate && hlB.annotDate && hlA.annotDate === hlB.annotDate) {
    const isABottom = !hlA.viewportHeight || (hlA.box?.maxY / hlA.viewportHeight) > 0.60;
    const isBTop = !hlB.viewportHeight || (hlB.box?.minY / hlB.viewportHeight) < 0.40;
    if (isABottom && isBTop) {
      return true;
    }
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

  if (prevHl.color?.name && nextHl.color?.name) {
    const isYellow1 = prevHl.color.name.toLowerCase().includes('amarel');
    const isYellow2 = nextHl.color.name.toLowerCase().includes('amarel');
    if (isYellow1 !== isYellow2) {
      return false;
    }
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
    }
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
export async function extractHighlightsFromFile(file, onProgress = () => {}) {
  if (!file) throw new Error('Nenhum arquivo informado.');

  const ext = file.name.split('.').pop().toLowerCase();
  let raw = [];

  if (ext === 'pdf' || file.type === 'application/pdf') {
    raw = await extractFromPdf(file, onProgress);
  } else if (ext === 'txt' || ext === 'html' || ext === 'htm' || file.type.includes('text') || file.type.includes('html')) {
    raw = await extractFromKindle(file, onProgress);
  } else {
    throw new Error(`Formato .${ext} não suportado. Utilize arquivos .pdf, .txt (My Clippings) ou .html (Kindle Notebook).`);
  }

  const merged = mergeCrossPageHighlights(raw);
  return deduplicateHighlights(merged);
}
