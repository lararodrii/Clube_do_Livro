import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  annotationAreas,
  isWordYellowOnCanvas,
  groupConsecutiveWords,
  extractHighlightsFromFile,
  mergeCrossPageHighlights
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


