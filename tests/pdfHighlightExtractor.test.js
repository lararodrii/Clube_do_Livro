import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  annotationAreas,
  isWordYellowOnCanvas,
  groupConsecutiveWords,
  extractHighlightsFromFile,
  mergeCrossPageHighlights,
  deduplicateHighlights,
  wordOverlapsBox,
  matchHighlighterColor,
  parseAnnotationColor,
  isBlacklistedText,
  parseKindleClippings,
  getWordHighlighterOnCanvas,
  HIGHLIGHT_PALETTE,
  KINDLE_COLOR_INFO
} from '../src/services/pdfHighlightExtractor.js';
const palette={gray:{name:'Cinza'},yellow:{name:'Amarelo Revolucionário',hex:'#FDE047'}};
const word=(text,x,y)=>({text,box:{x,y,width:text.length*6,height:12},color:palette.gray});
test('palavras consecutivas e linhas formam uma passagem',()=>{
 const groups=groupConsecutiveWords([word('inteiro',70,10),word('Um',10,10),word('trecho',27,10),word('continua',10,27)],1,palette.gray,'pdf_verified_scan');
 assert.equal(groups.length,1);assert.equal(groups[0].text,'Um trecho inteiro continua');
});
test('cores e passagens afastadas permanecem separadas',()=>assert.equal(groupConsecutiveWords([word('Trecho',10,10),word('Outro',200,10)],1,palette.gray).length,2));
test('cinza não vira grifo amarelo; fundo amarelo gera candidato',()=>{
 const data=new Uint8ClampedArray(100*30*4).fill(255);
 const box={x:0,y:0,width:100,height:30};
 for(let y=0;y<30;y++)for(let x=0;x<15;x++){const n=(y*100+x)*4;data[n]=data[n+1]=data[n+2]=170;}
 assert.equal(isWordYellowOnCanvas(box,data,100,30),false);
 for(let i=0;i<data.length;i+=4)data[i]=data[i+1]=data[i+2]=170;
 assert.equal(isWordYellowOnCanvas(box,data,100,30),false);
 for(let i=0;i<data.length;i+=4){data[i]=255;data[i+1]=230;data[i+2]=40;}
 assert.equal(isWordYellowOnCanvas(box,data,100,30),true);
});
test('QuadPoints multilineares preservam regiões, sem englobar texto intermediário',()=>{
 assert.equal(annotationAreas({quadPoints:[0,12,20,12,0,0,20,0,0,32,20,32,0,20,20,20]},{convertToViewportRectangle:r=>r}).length,2);
});
test('251 anotações nativas com várias palavras geram 251 registros, não palavras',async()=>{
 const annotations=Array.from({length:251},(_,i)=>({id:String(i),subtype:'Highlight',rect:[10,i*20,180,i*20+12],contentsObj:{str:'Nota '+i}}));
 const items=annotations.map((a,i)=>({str:'Este trecho tem várias palavras',width:170,height:12,transform:[12,0,0,12,10,i*20]}));
 const data=new Uint8ClampedArray(200*5040*4).fill(255);
 const page={getViewport:()=>({width:200,height:5040,convertToViewportRectangle:r=>r}),getAnnotations:async()=>annotations,getTextContent:async()=>({items}),render:()=>({promise:Promise.resolve()})};
 globalThis.window={pdfjsLib:{GlobalWorkerOptions:{},getDocument:()=>({promise:Promise.resolve({numPages:1,getPage:async()=>page})})}};
 globalThis.document={createElement:()=>({getContext:()=>({getImageData:()=>({data})})})};
 try{
  const result=await extractHighlightsFromFile({name:'fixture.pdf',type:'application/pdf',arrayBuffer:async()=>new ArrayBuffer(0)});
  assert.equal(result.length,251);assert.equal(result[0].text,'Este trecho tem várias palavras');assert.equal(result[250].note,'Nota 250');
  assert(result.every(r=>r.source==='pdf_annotation'));
 }finally{delete globalThis.window;delete globalThis.document;}
});

test('frase contínua cortada por quebra de página se une na íntegra (caso Existe + alguma relação)',()=>{
  const h1 = {
    id: 'hl-p5',
    page: 5,
    text: 'Existe',
    color: palette.yellow,
    source: 'pdf_annotation'
  };
  const h2 = {
    id: 'hl-p6',
    page: 6,
    text: 'alguma relação entre as regras eleitorais e o grau de corrupção? Por que mais cidadãos comparecem para votar?',
    color: palette.yellow,
    source: 'pdf_annotation'
  };
  const merged = mergeCrossPageHighlights([h1, h2]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].page, '5-6');
  assert.equal(merged[0].text, 'Existe alguma relação entre as regras eleitorais e o grau de corrupção? Por que mais cidadãos comparecem para votar?');
});

test('hifenização no fim de página junta sem hífen e preserva prefixo composto',()=>{
  const h1 = { id: '1', page: 1, text: 'instituições democrá-', color: palette.yellow };
  const h2 = { id: '2', page: 2, text: 'ticas estão sob risco.', color: palette.yellow };
  const merged1 = mergeCrossPageHighlights([h1, h2]);
  assert.equal(merged1.length, 1);
  assert.equal(merged1[0].text, 'instituições democráticas estão sob risco.');
  assert.equal(merged1[0].page, '1-2');

  const h3 = { id: '3', page: 3, text: 'A sociedade norte-', color: palette.yellow };
  const h4 = { id: '4', page: 4, text: 'americana é polarizada.', color: palette.yellow };
  const merged2 = mergeCrossPageHighlights([h3, h4]);
  assert.equal(merged2.length, 1);
  assert.equal(merged2[0].text, 'A sociedade norte-americana é polarizada.');
});

test('frases completas e independentes com ponto final não se unem',()=>{
  const h1 = { id: '1', page: 1, text: 'A democracia triunfou após a guerra.', color: palette.yellow };
  const h2 = { id: '2', page: 2, text: 'Novos dilemas surgiram nas décadas seguintes.', color: palette.yellow };
  const merged = mergeCrossPageHighlights([h1, h2]);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].page, 1);
  assert.equal(merged[1].page, 2);
});

test('páginas não consecutivas não se unem',()=>{
  const h1 = { id: '1', page: 1, text: 'Existe', color: palette.yellow };
  const h2 = { id: '2', page: 3, text: 'alguma relação importante.', color: palette.yellow };
  const merged = mergeCrossPageHighlights([h1, h2]);
  assert.equal(merged.length, 2);
});

test('elimina repetição idêntica de grifo na mesma página (caso página 5 repetida)',()=>{
  const h1 = {
    id: 'native-5-1',
    page: 5,
    text: 'Por que as mulheres e minorias étnicas são representadas em maior número em alguns países?',
    color: palette.yellow,
    source: 'pdf_annotation',
    box: { minY: 680, maxY: 710 }
  };
  const h2 = {
    id: 'hl-scan-5-2',
    page: 5,
    text: 'Por que as mulheres e minorias étnicas são representadas em maior número em alguns países?',
    color: palette.yellow,
    source: 'pdf_verified_scan',
    box: { minY: 680, maxY: 710 }
  };
  const deduped = deduplicateHighlights([h1, h2]);
  assert.equal(deduped.length, 1);
  assert.equal(deduped[0].page, 5);
  assert.equal(deduped[0].text, 'Por que as mulheres e minorias étnicas são representadas em maior número em alguns países?');
  assert.equal(deduped[0].source, 'pdf_annotation');
});

test('elimina fragmento quando o trecho completo já foi extraído na mesma página',()=>{
  const h1 = {
    id: '1',
    page: 5,
    text: 'Por que as mulheres e minorias étnicas são representadas em maior número em alguns países? Existe',
    color: palette.yellow,
    box: { minY: 680, maxY: 710 }
  };
  const h2 = {
    id: '2',
    page: 5,
    text: 'Por que as mulheres e minorias étnicas são representadas em maior número em alguns países?',
    color: palette.yellow,
    box: { minY: 680, maxY: 710 }
  };
  const deduped = deduplicateHighlights([h1, h2]);
  assert.equal(deduped.length, 1);
  assert.equal(deduped[0].text, 'Por que as mulheres e minorias étnicas são representadas em maior número em alguns países? Existe');
});

test('diferencia pausa na marcação e frase com ponto final de mudança contínua (caso pág. 8 e 9)',()=>{
  const h1 = {
    id: 'hl-p8',
    page: 8,
    text: 'Entender o modo com que regimes democráticos tradicionais e consolidados são enfraquecidos de modo "legal", por dentro, é fundamental.',
    color: palette.yellow,
    source: 'pdf_annotation',
    unhighlightedWordsBelowCount: 25 // texto do prefácio abaixo antes do fim da página
  };
  const h2 = {
    id: 'hl-p9',
    page: 9,
    text: 'os sombrios anos 1930 na Europa, os repressivos anos 1970 na América Latina.',
    color: palette.yellow,
    source: 'pdf_annotation',
    unhighlightedWordsAboveCount: 30 // título Introdução e texto acima antes do início do grifo
  };
  const merged = mergeCrossPageHighlights([h1, h2]);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].page, 8);
  assert.equal(merged[0].text, 'Entender o modo com que regimes democráticos tradicionais e consolidados são enfraquecidos de modo "legal", por dentro, é fundamental.');
  assert.equal(merged[1].page, 9);
  assert.equal(merged[1].text, 'os sombrios anos 1930 na Europa, os repressivos anos 1970 na América Latina.');
});

test('wordOverlapsBox rejeita sangria vertical de descenders e invasão de linhas adjacentes', () => {
  const line1Box = { x: 50, y: 100, width: 300, height: 16 };
  const line1Word = { x: 55, y: 102, width: 40, height: 12 };
  // Palavra da linha 1 deve sobrepor com folga
  assert.equal(wordOverlapsBox(line1Word, line1Box, 0.40), true);

  // Palavra da linha 2 cujo topo (y=114) encosta 2px na borda inferior do box da linha 1 (y=116)
  const line2BleedingWord = { x: 55, y: 114, width: 40, height: 12 };
  assert.equal(wordOverlapsBox(line2BleedingWord, line1Box, 0.40), false);

  // Palavra da mesma linha mas fora da margem horizontal do grifo
  const partialBox = { x: 50, y: 100, width: 150, height: 16 }; // termina em x=200
  const afterWord = { x: 205, y: 102, width: 30, height: 12 };
  assert.equal(wordOverlapsBox(afterWord, partialBox, 0.40), false);
});

test('elimina captura indevida da linha de baixo (caso "Os homens da organização...")', () => {
  // Simula o caso real do usuário onde o grifo termina em "velhos amigos" no meio da linha 3
  const areas = [
    { x: 50, y: 100, width: 450, height: 16 }, // Linha 1 completa
    { x: 50, y: 116, width: 450, height: 16 }, // Linha 2 completa
    { x: 50, y: 132, width: 170, height: 16 }  // Linha 3 até "velhos amigos". (termina em x=220)
  ];

  // Palavras da página
  const allWords = [
    // Linha 1 (grifada)
    { text: 'Os', box: { x: 50, y: 102, width: 20, height: 12 } },
    { text: 'homens', box: { x: 75, y: 102, width: 50, height: 12 } },
    { text: 'da', box: { x: 130, y: 102, width: 15, height: 12 } },
    { text: 'organização', box: { x: 150, y: 102, width: 80, height: 12 } },
    { text: 'não', box: { x: 235, y: 102, width: 25, height: 12 } },
    { text: 'eram', box: { x: 265, y: 102, width: 35, height: 12 } },
    { text: 'propriamente', box: { x: 305, y: 102, width: 90, height: 12 } },
    { text: 'representativos', box: { x: 400, y: 102, width: 95, height: 12 } },
    // Linha 2 (grifada)
    { text: 'da', box: { x: 50, y: 118, width: 15, height: 12 } },
    { text: 'sociedade', box: { x: 70, y: 118, width: 65, height: 12 } },
    { text: 'norte-americana.', box: { x: 140, y: 118, width: 110, height: 12 } },
    { text: 'Com', box: { x: 255, y: 118, width: 30, height: 12 } },
    { text: 'efeito,', box: { x: 290, y: 118, width: 45, height: 12 } },
    { text: 'eles', box: { x: 340, y: 118, width: 30, height: 12 } },
    { text: 'seriam', box: { x: 375, y: 118, width: 45, height: 12 } },
    { text: 'a', box: { x: 425, y: 118, width: 10, height: 12 } },
    { text: 'própria', box: { x: 440, y: 118, width: 55, height: 12 } },
    // Linha 3 (grifada até "amigos"., restante NÃO grifado)
    { text: 'definição', box: { x: 50, y: 134, width: 60, height: 12 } },
    { text: 'de', box: { x: 115, y: 134, width: 15, height: 12 } },
    { text: 'uma', box: { x: 135, y: 134, width: 25, height: 12 } },
    { text: 'rede', box: { x: 165, y: 134, width: 30, height: 12 } },
    { text: 'de', box: { x: 200, y: 134, width: 15, height: 12 } },
    // AQUI TERMINA O GRIFO REAL (x=220)
    // Palavras não grifadas na mesma linha 3:
    { text: 'A', box: { x: 230, y: 134, width: 10, height: 12 } },
    { text: 'maioria', box: { x: 245, y: 134, width: 50, height: 12 } },
    { text: 'dos', box: { x: 300, y: 134, width: 25, height: 12 } },
    { text: 'membros', box: { x: 330, y: 134, width: 60, height: 12 } },
    // Linha 4 (totalmente NÃO grifada, mas encosta 2px verticalmente na área 3):
    { text: 'pobres', box: { x: 50, y: 146, width: 45, height: 12 } },
    { text: 'e', box: { x: 100, y: 146, width: 10, height: 12 } },
    { text: 'sem', box: { x: 115, y: 146, width: 25, height: 12 } },
    { text: 'conexões', box: { x: 145, y: 146, width: 65, height: 12 } }
  ];

  const matchedWords = allWords.filter(w => areas.some(area => wordOverlapsBox(w.box, area, 0.40)));
  const parts = groupConsecutiveWords(matchedWords, 38, palette.yellow, 'pdf_annotation');
  const resultText = parts.map(p => p.text).join(' ').trim();

  // Garante que o texto capturado contém APENAS a parte grifada
  assert.equal(
    resultText,
    'Os homens da organização não eram propriamente representativos da sociedade norte-americana. Com efeito, eles seriam a própria definição de uma rede de'
  );
  // Garante categoricamente que as frases excedentes da linha 3 e linha 4 NÃO foram capturadas
  assert.equal(resultText.includes('maioria'), false);
  assert.equal(resultText.includes('membros'), false);
  assert.equal(resultText.includes('pobres'), false);
  assert.equal(resultText.includes('conexões'), false);
});

test('elimina captura indevida da linha de baixo (caso "Por outro lado, o sistema de convenções...")', () => {
  // Simula o segundo caso real do usuário
  const areas = [
    { x: 50, y: 100, width: 500, height: 16 }, // Linha 1 inteira
    { x: 50, y: 116, width: 350, height: 16 }  // Linha 2 até "candidatos perigosos." (termina em x=400)
  ];

  const allWords = [
    // Linha 1 (grifada)
    { text: 'Por', box: { x: 50, y: 102, width: 25, height: 12 } },
    { text: 'outro', box: { x: 80, y: 102, width: 35, height: 12 } },
    { text: 'lado,', box: { x: 120, y: 102, width: 35, height: 12 } },
    { text: 'o', box: { x: 160, y: 102, width: 10, height: 12 } },
    { text: 'sistema', box: { x: 175, y: 102, width: 50, height: 12 } },
    { text: 'de', box: { x: 230, y: 102, width: 15, height: 12 } },
    { text: 'convenções', box: { x: 250, y: 102, width: 75, height: 12 } },
    { text: 'era', box: { x: 330, y: 102, width: 25, height: 12 } },
    { text: 'um', box: { x: 360, y: 102, width: 20, height: 12 } },
    { text: 'guardião', box: { x: 385, y: 102, width: 55, height: 12 } },
    { text: 'eficiente,', box: { x: 445, y: 102, width: 60, height: 12 } },
    { text: 'pois', box: { x: 510, y: 102, width: 30, height: 12 } },
    // Linha 2 (grifada até "perigosos.")
    { text: 'filtrava', box: { x: 50, y: 118, width: 50, height: 12 } },
    { text: 'de', box: { x: 105, y: 118, width: 15, height: 12 } },
    { text: 'maneira', box: { x: 125, y: 118, width: 50, height: 12 } },
    { text: 'sistemática', box: { x: 180, y: 118, width: 75, height: 12 } },
    { text: 'candidatos', box: { x: 260, y: 118, width: 65, height: 12 } },
    { text: 'perigosos.', box: { x: 330, y: 118, width: 65, height: 12 } },
    // Linha 2 (NÃO grifada após perigosos.)
    { text: 'Os', box: { x: 410, y: 118, width: 20, height: 12 } },
    { text: 'insiders', box: { x: 435, y: 118, width: 50, height: 12 } },
    { text: 'partidários', box: { x: 490, y: 118, width: 65, height: 12 } },
    // Linha 3 (NÃO grifada, topo em y=130 encosta 2px na área 2 em y=132)
    { text: 'proviam', box: { x: 50, y: 130, width: 50, height: 12 } },
    { text: 'o', box: { x: 105, y: 130, width: 10, height: 12 } },
    { text: 'que', box: { x: 120, y: 130, width: 25, height: 12 } },
    { text: 'os', box: { x: 150, y: 130, width: 15, height: 12 } },
    { text: 'cientistas', box: { x: 170, y: 130, width: 60, height: 12 } },
    { text: 'políticos', box: { x: 235, y: 130, width: 55, height: 12 } },
    { text: 'chamam', box: { x: 295, y: 130, width: 50, height: 12 } },
    { text: 'de', box: { x: 350, y: 130, width: 15, height: 12 } },
    { text: '“revisão', box: { x: 370, y: 130, width: 55, height: 12 } }
  ];

  const matchedWords = allWords.filter(w => areas.some(area => wordOverlapsBox(w.box, area, 0.40)));
  const parts = groupConsecutiveWords(matchedWords, 38, palette.yellow, 'pdf_annotation');
  const resultText = parts.map(p => p.text).join(' ').trim();

  assert.equal(
    resultText,
    'Por outro lado, o sistema de convenções era um guardião eficiente, pois filtrava de maneira sistemática candidatos perigosos.'
  );
  assert.equal(resultText.includes('insiders'), false);
  assert.equal(resultText.includes('proviam'), false);
  assert.equal(resultText.includes('revisão'), false);
});

test('detector de amarelo no canvas suporta tons pastéis e amarelo claro sem confundir com branco ou cinza', () => {
  const box = { x: 0, y: 0, width: 50, height: 20 };

  // 1. Amarelo pastel / mais claro (ex: b=180, r=255, g=248)
  const pastelData = new Uint8ClampedArray(50 * 20 * 4);
  for (let i = 0; i < pastelData.length; i += 4) {
    pastelData[i] = 255;     // R
    pastelData[i + 1] = 248; // G
    pastelData[i + 2] = 180; // B
    pastelData[i + 3] = 255; // A
  }
  assert.equal(isWordYellowOnCanvas(box, pastelData, 50, 20), true);

  // 2. Fundo branco do PDF (r=255, g=255, b=255)
  const whiteData = new Uint8ClampedArray(50 * 20 * 4).fill(255);
  assert.equal(isWordYellowOnCanvas(box, whiteData, 50, 20), false);

  // 3. Fundo papel creme/antigo (r=250, g=248, b=238)
  const creamData = new Uint8ClampedArray(50 * 20 * 4);
  for (let i = 0; i < creamData.length; i += 4) {
    creamData[i] = 250;
    creamData[i + 1] = 248;
    creamData[i + 2] = 238;
    creamData[i + 3] = 255;
  }
  assert.equal(isWordYellowOnCanvas(box, creamData, 50, 20), false);

  // 4. Cinza (r=200, g=200, b=200)
  const grayData = new Uint8ClampedArray(50 * 20 * 4);
  for (let i = 0; i < grayData.length; i += 4) {
    grayData[i] = 200;
    grayData[i + 1] = 200;
    grayData[i + 2] = 200;
    grayData[i + 3] = 255;
  }
  assert.equal(isWordYellowOnCanvas(box, grayData, 50, 20), false);
});

test('matchHighlighterColor aceita paleta de marca-texto permitida e rejeita azuis de links, pretos e cinzas', () => {
  // Amarelo (#fef08a)
  assert.equal(matchHighlighterColor(254, 240, 138)?.id, 'yellow');
  // Laranja (#fdba74)
  assert.equal(matchHighlighterColor(253, 186, 116)?.id, 'orange');
  // Rosa / Magenta (#f472b6 e #fbcfe8)
  assert.equal(matchHighlighterColor(244, 114, 182)?.id, 'pink');
  assert.equal(matchHighlighterColor(251, 207, 232)?.id, 'pink');
  // Verde (#86efac e #bbf7d0)
  assert.equal(matchHighlighterColor(134, 239, 172)?.id, 'green');
  assert.equal(matchHighlighterColor(187, 247, 208)?.id, 'green');
  // Roxo / Lilás (#d8b4fe)
  assert.equal(matchHighlighterColor(216, 180, 254)?.id, 'purple');

  // REJEIÇÕES ESTRITAS:
  // 1. Azul escuro padrão de links (#1a0dab)
  assert.equal(matchHighlighterColor(26, 13, 171), null);
  // 2. Azul puro (#0000ff)
  assert.equal(matchHighlighterColor(0, 0, 255), null);
  // 3. Azul de link comum (#0066cc)
  assert.equal(matchHighlighterColor(0, 102, 204), null);
  // 4. Preto de texto comum
  assert.equal(matchHighlighterColor(20, 20, 20), null);
  // 5. Cinza escuro
  assert.equal(matchHighlighterColor(80, 80, 80), null);
  // 6. Cinza médio
  assert.equal(matchHighlighterColor(160, 160, 160), null);
  // 7. Branco do papel
  assert.equal(matchHighlighterColor(255, 255, 255), null);
});

test('parseAnnotationColor descarta anotações azuis de links, pretas ou cinzas e mapeia paleta de destaque', () => {
  // Anotação azul (links do Le Livros ou rodapé) deve ser completamente descartada
  assert.equal(parseAnnotationColor([0, 0, 1], 'Underline'), null);
  assert.equal(parseAnnotationColor([0.1, 0.1, 0.8], 'Highlight'), null);

  // Anotação preta ou cinza deve ser descartada
  assert.equal(parseAnnotationColor([0, 0, 0], 'Highlight'), null);
  assert.equal(parseAnnotationColor([0.5, 0.5, 0.5], 'Underline'), null);

  // Anotações da paleta de marca-texto devem ser aceitas com seus objetos de cor
  assert.equal(parseAnnotationColor([1, 1, 0], 'Highlight')?.id, 'yellow');
  assert.equal(parseAnnotationColor([0.96, 0.45, 0.71], 'Highlight')?.id, 'pink');
  assert.equal(parseAnnotationColor([0.53, 0.94, 0.67], 'Highlight')?.id, 'green');
  assert.equal(parseAnnotationColor([0.99, 0.73, 0.45], 'Highlight')?.id, 'orange');
  assert.equal(parseAnnotationColor([0.85, 0.71, 1.0], 'Highlight')?.id, 'purple');

  // Highlight sem cor especificada assume Amarelo padrão
  assert.equal(parseAnnotationColor(null, 'Highlight')?.id, 'yellow');
  // Underline sem cor especificada é descartado (evita falsos links)
  assert.equal(parseAnnotationColor(null, 'Underline'), null);
});

test('isBlacklistedText descarta avisos de direitos autorais, prefácios piratas (Le Livros), URLs e sumários', () => {
  // Termos de pirataria e marcas dágua de distribuidores
  assert.equal(isBlacklistedText('Le Livros'), true);
  assert.equal(isBlacklistedText('Visite lelivros.love para baixar mais livros'), true);
  assert.equal(isBlacklistedText('www.lelivros.site'), true);
  assert.equal(isBlacklistedText('https://lelivros.love/livro/como-as-democracias-morrem/'), true);

  // Avisos editoriais e direitos autorais
  assert.equal(isBlacklistedText('Sobre a obra: Este livro discute a erosão institucional...'), true);
  assert.equal(isBlacklistedText('Todos os direitos reservados à Editora Zahar.'), true);
  assert.equal(isBlacklistedText('All rights reserved. No part of this publication...'), true);
  assert.equal(isBlacklistedText('Copyright © 2018 by Steven Levitsky and Daniel Ziblatt'), true);
  assert.equal(isBlacklistedText('Ficha catalográfica elaborada pela editora'), true);
  assert.equal(isBlacklistedText('CIP-BRASIL. CATALOGAÇÃO NA PUBLICAÇÃO'), true);
  assert.equal(isBlacklistedText('Conversão para ePub realizada por Digital Books'), true);
  assert.equal(isBlacklistedText('Distribuição gratuita - Venda proibida'), true);

  // Sumários e índices
  assert.equal(isBlacklistedText('Sumário: 1. Alianças Fatais, 2. Guardiões da América...'), true);
  assert.equal(isBlacklistedText('Índice Remissivo'), true);

  // Grifos legítimos do conteúdo NÃO devem ser descartados
  assert.equal(
    isBlacklistedText('Os homens da organização não eram propriamente representativos da sociedade norte-americana.'),
    false
  );
  assert.equal(
    isBlacklistedText('Por outro lado, o sistema de convenções era um guardião eficiente, pois filtrava de maneira sistemática candidatos perigosos.'),
    false
  );
});

test('parseKindleClippings extrai grifos do My Clippings.txt, limpa aspas, associa notas e filtra por livro', () => {
  const sampleClippings = `
Como as democracias morrem (Steven Levitsky; Daniel Ziblatt)
- Seu destaque na página 38 | posição 578-579 | Adicionado: domingo, 29 de janeiro de 2023 15:45:00

"Por outro lado, o sistema de convenções era um guardião eficiente, pois filtrava de maneira sistemática candidatos perigosos."
==========
Como as democracias morrem (Steven Levitsky; Daniel Ziblatt)
- Sua nota na página 38 | posição 580 | Adicionado: domingo, 29 de janeiro de 2023 15:46:00

Ponto central para debater sobre filtragem partidária e gatekeepers.
==========
Como as democracias morrem (Steven Levitsky; Daniel Ziblatt)
- Seu destaque na página 12 | posição 150 | Adicionado: domingo, 29 de janeiro de 2023 15:20:00

Le Livros - baixe livros gratuitamente em www.lelivros.love
==========
A Revolução dos Bichos (George Orwell)
- Seu destaque na página 50 | posição 700 | Adicionado: sábado, 10 de fevereiro de 2023 10:00:00

Todos os animais são iguais, mas alguns animais são mais iguais do que os outros.
==========
`;

  // 1. Extração geral associando ao livro atual do clube
  const resultsForCurrentBook = parseKindleClippings(sampleClippings, {
    currentBookTitle: 'Como as democracias morrem'
  });

  // Deve extrair apenas o grifo de "Como as democracias morrem", excluindo o grifo do outro livro e o aviso pirata do Le Livros
  assert.equal(resultsForCurrentBook.length, 1);
  assert.equal(
    resultsForCurrentBook[0].text,
    'Por outro lado, o sistema de convenções era um guardião eficiente, pois filtrava de maneira sistemática candidatos perigosos.'
  );
  assert.equal(resultsForCurrentBook[0].page, 38);
  assert.equal(resultsForCurrentBook[0].color.name, 'Destaque Kindle');
  assert.equal(resultsForCurrentBook[0].source, 'kindle_clippings');
  // Nota associada automaticamente pelo pareamento de livro e página:
  assert.equal(
    resultsForCurrentBook[0].note,
    'Ponto central para debater sobre filtragem partidária e gatekeepers.'
  );

  // 2. Extração sem filtro de livro deve retornar ambos os livros válidos e filtrar o bloco com Le Livros
  const allResults = parseKindleClippings(sampleClippings);
  assert.equal(allResults.length, 2);
  assert.equal(allResults.some(r => r.text.includes('animais são mais iguais')), true);
  assert.equal(allResults.some(r => r.text.includes('Le Livros')), false);
});

