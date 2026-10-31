/**
 * Serviço de Extração Automática de Grifos (PDF / Kindle)
 * 
 * Suporta:
 * 1. Arquivos PDF com anotações nativas (Highlight em amarelo)
 * 2. Validação visual por amostragem de pixels em Canvas (elimina 100% de palavras antes ou depois do grifo)
 * 3. Suporte a Tablets (StarNote, Samsung Notes, GoodNotes e PDFs achatados)
 * 4. Arquivos exportados do Kindle (My Clippings.txt e cadernos de notas .html)
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

const YELLOW_COLOR_INFO = {
  name: 'Amarelo Revolucionário',
  hex: '#FDE047',
  bgClass: 'bg-yellow-300/40 border-yellow-400 text-yellow-950'
};

/**
 * Detecta com rigor absoluto se um pixel do Canvas é Marca-Texto Amarelo.
 * 
 * Rejeita categoricamente:
 * - Branco puro ou papel creme (onde R, G e B são muito próximos: |R - B| < 30)
 * - Azul de links ou sumário (onde B > R ou B > 150)
 * - Texto preto/cinza escuro (R < 150 ou G < 140)
 */
function isYellowHighlighterPixel(r, g, b) {
  // 1. Deve ser luminoso (fundo de marca-texto amarelo fluorescente)
  if (r < 160 || g < 150) return false;

  // 2. O azul deve ser marcadamente menor que o vermelho e o verde.
  // No papel branco/creme: (r - b) é pequeno (< 35).
  // No marca-texto amarelo: (r - b) >= 55 e (g - b) >= 45.
  if ((r - b) < 55 || (g - b) < 45) return false;

  // 3. Rejeita tons azulados/ciano
  if (b > 150) return false;

  // 4. Vermelho e verde devem ser equilibrados (amarelo puro)
  if (Math.abs(r - g) > 55) return false;

  return true;
}

/**
 * Valida se uma palavra está REALMENTE coberta por marca-texto amarelo no Canvas renderizado.
 * Analisa os pixels no centro da caixa delimitadora da palavra.
 */
function isWordYellowOnCanvas(wordBox, data, canvasW, canvasH) {
  // Ajusta levemente os limites para focar no corpo principal das letras
  const startX = Math.max(0, Math.floor(wordBox.x + 1));
  const endX = Math.min(canvasW - 1, Math.ceil(wordBox.x + wordBox.width - 1));
  const startY = Math.max(0, Math.floor(wordBox.y + wordBox.height * 0.15));
  const endY = Math.min(canvasH - 1, Math.ceil(wordBox.y + wordBox.height * 0.85));

  if (endX <= startX || endY <= startY) return false;

  let totalSampled = 0;
  let yellowCount = 0;

  // Amostragem densa a cada 2 pixels para altíssima precisão sem lentidão
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

  if (totalSampled < 4) return false;

  // Palavras sem grifo têm 0% de pixels amarelos.
  // Palavras com marca-texto amarelo têm entre 20% e 80% de pixels amarelos
  // (o restante são as letras pretas).
  const yellowRatio = yellowCount / totalSampled;
  return yellowRatio >= 0.18;
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
 * Agrupa palavras grifadas consecutivas em trechos contínuos e limpos.
 * Separa frases quando houver quebra de parágrafo ou trechos não grifados no meio.
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
    const isSameLine = Math.abs(word.box.y - prev.box.y) <= 6;
    const isNextLine = !isSameLine && (word.box.y > prev.box.y) && ((word.box.y - prev.box.y) < Math.max(prev.box.height, word.box.height) * 1.85);

    let shouldJoin = false;

    if (isSameLine) {
      // Mesma linha: verifica se são palavras contíguas (espaço normal entre palavras)
      const gapX = word.box.x - (prev.box.x + prev.box.width);
      if (gapX >= -2 && gapX < Math.max(prev.box.height, 14) * 2.5) {
        shouldJoin = true;
      }
    } else if (isNextLine) {
      // Linha imediatamente subsequente: verifica se a frase continuou na linha de baixo sem pular linhas
      const lineGap = word.box.y - prev.box.y;
      if (lineGap < Math.max(prev.box.height, 14) * 1.9) {
        shouldJoin = true;
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
    .filter(g => g.text.length >= 3 && !/^[0-9.,;:!?\s]+$/.test(g.text));
}

/**
 * Extrai grifos de um arquivo PDF (.pdf) com confirmação visual no Canvas
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
      message: `Analisando página ${pageNum} de ${numPages} (${allExtractedHighlights.length} grifos em amarelo)...`
    });

    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });

      // 1. Extração do conteúdo de texto em palavras individuais
      const textContent = await page.getTextContent();
      const allWords = [];

      for (const item of textContent.items) {
        if (!item.str || !item.str.trim()) continue;

        // Converte coordenadas do PDF para o espaço do Viewport
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

      if (allWords.length === 0) continue;

      // 2. Renderização da página em um canvas oculto para verdade visual absoluta dos pixels
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

      // 3. Leitura de anotações nativas do PDF para capturar comentários anexados
      const annotations = await page.getAnnotations();
      const notesByArea = [];

      for (const annot of annotations) {
        const subtype = (annot.subtype || '').toLowerCase();
        if (subtype !== 'highlight' && subtype !== 'underline') continue;

        const annotNote = annot.contents || annot.richText || '';
        if (!annotNote) continue;

        if (annot.rect && Array.isArray(annot.rect) && annot.rect.length === 4) {
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

      // 4. Verificação RIGOROSA palavra por palavra contra o Canvas:
      // Apenas palavras com pixels amarelos reais de marca-texto no Canvas são aceitas.
      // Qualquer palavra antes do ponto, depois do ponto ou em parágrafos vizinhos sem amarelo é descartada!
      const confirmedYellowWords = [];

      for (const word of allWords) {
        const isYellow = isWordYellowOnCanvas(word.box, data, canvasW, canvasH);
        if (isYellow) {
          // Verifica se há alguma anotação de texto correspondente
          const matchingNote = notesByArea.find(n => 
            word.box.x >= n.box.x - 10 && 
            word.box.x <= (n.box.x + n.box.width + 10) &&
            word.box.y >= n.box.y - 10 && 
            word.box.y <= (n.box.y + n.box.height + 10)
          );

          confirmedYellowWords.push({
            ...word,
            color: YELLOW_COLOR_INFO,
            note: matchingNote ? matchingNote.note : '',
            source: 'pdf_verified_scan'
          });
        }
      }

      // 5. Agrupa as palavras confirmadas em trechos contínuos
      const pageHighlights = groupConsecutiveWords(
        confirmedYellowWords,
        pageNum,
        YELLOW_COLOR_INFO,
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
 * Extrai notas e destaques de arquivo Kindle (My Clippings.txt ou HTML Notebook)
 */
async function extractFromKindle(file, onProgress = () => {}) {
  onProgress({ current: 0, total: 100, stage: 'reading', message: 'Lendo arquivo do Kindle...' });
  const content = await file.text();
  const isHtml = file.name.endsWith('.html') || file.type.includes('html') || content.includes('<html');

  const highlights = [];

  if (isHtml) {
    // Parser de HTML exportado do Kindle Notebook
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    const noteHeadings = doc.querySelectorAll('.noteHeading, .kp-notebook-metadata, h3');
    const noteTexts = doc.querySelectorAll('.noteText, .kp-notebook-highlight, p.body-text');

    const total = Math.max(noteHeadings.length, noteTexts.length);
    for (let i = 0; i < total; i++) {
      const heading = noteHeadings[i]?.textContent || '';
      const text = noteTexts[i]?.textContent?.trim() || '';

      if (!text) continue;

      const pageMatch = heading.match(/(?:página|page|pág\.)\s*(\d+)/i);
      const locMatch = heading.match(/(?:posição|location|pos\.)\s*([\d-]+)/i);
      const pageNum = pageMatch ? parseInt(pageMatch[1], 10) : (locMatch ? locMatch[1] : 1);

      highlights.push({
        id: `hl-knd-${Date.now()}-${i}`,
        page: pageNum,
        text: text.replace(/\s+/g, ' ').trim(),
        note: heading.includes('Nota') || heading.includes('Note') ? heading : '',
        color: YELLOW_COLOR_INFO,
        source: 'kindle_html',
        createdAt: new Date().toISOString()
      });
    }
  } else {
    // Parser de My Clippings.txt do Kindle
    const blocks = content.split(/={8,}/);
    let index = 0;

    for (const block of blocks) {
      const lines = block.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) continue;

      const titleLine = lines[0];
      const metaLine = lines[1] || '';
      const textLines = lines.slice(2).join(' ').trim();

      if (!textLines || textLines.length < 3) continue;

      const pageMatch = metaLine.match(/(?:página|page|pág\.)\s*(\d+)/i);
      const locMatch = metaLine.match(/(?:posição|location|pos\.)\s*([\d-]+)/i);
      const pageNum = pageMatch ? parseInt(pageMatch[1], 10) : (locMatch ? locMatch[1] : 1);

      highlights.push({
        id: `hl-clp-${Date.now()}-${index++}`,
        page: pageNum,
        text: textLines.replace(/\s+/g, ' ').trim(),
        note: metaLine.toLowerCase().includes('nota') ? metaLine : '',
        bookHint: titleLine,
        color: YELLOW_COLOR_INFO,
        source: 'kindle_clippings',
        createdAt: new Date().toISOString()
      });
    }
  }

  onProgress({ current: 100, total: 100, stage: 'completed', message: 'Notas do Kindle extraídas com sucesso!' });
  return highlights;
}

/**
 * Função principal exportada: extrai grifos de qualquer arquivo suportado (.pdf, .txt, .html)
 * 
 * @param {File} file - Arquivo selecionado pela camarada
 * @param {Function} onProgress - Callback com ({ current, total, stage, message })
 * @returns {Promise<Array>} Lista de grifos extraídos e higienizados
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
