import React, { useState } from 'react';

const WITTY_QUOTES = [
  "Não vai lutar contra o fascismo?",
  "Sem teoria revolucionária não há leitura concluída!",
  "A burguesia não quer que você termine o capítulo 4.",
  "Camarada, ler 10 páginas por dia já é um ato de resistência!",
  "Menos desculpas, mais materialismo dialético!",
  "A sua citação no mural já desmascarou o imperialismo hoje?",
  "Quem não lê, vira massa de manobra do algoritmo!",
  "A urna popular não aceita omissão, camarada!",
  "Fichou o capítulo ou vai esperar a revolução acontecer sozinha?"
];

export default function ComradeCat({ 
  pose = 'grumpy', 
  size = 'md', 
  showBubble = true,
  customQuote = null,
  className = '',
  bubblePosition = 'right' // 'right' | 'top' | 'left'
}) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isWiggling, setIsWiggling] = useState(false);

  const currentQuote = customQuote || WITTY_QUOTES[quoteIndex % WITTY_QUOTES.length];

  const handleNextQuote = () => {
    setIsWiggling(true);
    setQuoteIndex(prev => prev + 1);
    setTimeout(() => setIsWiggling(false), 300);
  };

  // Dimensões do container SVG
  const sizeMap = {
    sm: { w: 90, h: 90, viewBox: "0 0 160 160" },
    md: { w: 140, h: 140, viewBox: "0 0 160 160" },
    lg: { w: 200, h: 200, viewBox: "0 0 160 160" },
    xl: { w: 260, h: 260, viewBox: "0 0 160 160" },
  };

  const { w, h, viewBox } = sizeMap[size] || sizeMap.md;

  // Renderização SVG detalhada de acordo com a pose
  const renderCatPose = () => {
    switch (pose) {
      case 'reading':
        return (
          <g id="pose-reading">
            {/* Sombra base */}
            <ellipse cx="80" cy="150" rx="60" ry="8" fill="#1E1E1E" fillOpacity="0.2" />

            {/* Corpo do gato */}
            <path d="M48 110 C48 85, 112 85, 112 110 L118 145 C118 150, 42 150, 42 145 Z" fill="#1C1917" stroke="#1E1E1E" strokeWidth="3" />
            
            {/* Orelhas */}
            <polygon points="50,65 35,28 65,48" fill="#1C1917" stroke="#1E1E1E" strokeWidth="3" strokeLinejoin="round" />
            <polygon points="50,60 40,35 60,48" fill="#F43F5E" opacity="0.6" />
            
            <polygon points="110,65 125,28 95,48" fill="#1C1917" stroke="#1E1E1E" strokeWidth="3" strokeLinejoin="round" />
            <polygon points="110,60 120,35 100,48" fill="#F43F5E" opacity="0.6" />

            {/* Cabeça redonda do gato */}
            <circle cx="80" cy="75" r="38" fill="#1C1917" stroke="#1E1E1E" strokeWidth="3" />

            {/* Boina Militar do Che Guevara (Oliva/Preto com inclinação) */}
            <path d="M40 54 C35 34, 115 24, 126 48 C126 56, 42 62, 40 54 Z" fill="#283618" stroke="#1E1E1E" strokeWidth="3" />
            <ellipse cx="78" cy="48" rx="42" ry="12" fill="#283618" stroke="#1E1E1E" strokeWidth="2" />
            
            {/* Estrela Vermelha na Boina */}
            <g transform="translate(78, 44)">
              <circle cx="0" cy="0" r="7.5" fill="#1E1E1E" />
              <polygon points="0,-6 1.8,-1.8 6.3,-1.8 2.7,0.9 4,5.4 0,2.7 -4,5.4 -2.7,0.9 -6.3,-1.8 -1.8,-1.8" fill="#D62828" stroke="#FDE047" strokeWidth="0.8" />
            </g>

            {/* Olhos concentrados olhando para baixo */}
            <ellipse cx="68" cy="74" rx="7" ry="5.5" fill="#FEF08A" stroke="#1E1E1E" strokeWidth="1.5" />
            <circle cx="68" cy="76" r="3" fill="#1E1E1E" />
            <ellipse cx="92" cy="74" rx="7" ry="5.5" fill="#FEF08A" stroke="#1E1E1E" strokeWidth="1.5" />
            <circle cx="92" cy="76" r="3" fill="#1E1E1E" />

            {/* Óculos redondos de intelectual revolucionário */}
            <circle cx="68" cy="74" r="10" fill="none" stroke="#DDA15E" strokeWidth="2.5" />
            <circle cx="92" cy="74" r="10" fill="none" stroke="#DDA15E" strokeWidth="2.5" />
            <line x1="78" y1="74" x2="82" y2="74" stroke="#DDA15E" strokeWidth="2.5" />

            {/* Focinho e bigodes */}
            <polygon points="80,84 76,80 84,80" fill="#F43F5E" />
            <path d="M80 84 Q76 90 72 88 M80 84 Q84 90 88 88" stroke="#F6F2E9" strokeWidth="1.5" fill="none" />
            <line x1="58" y1="84" x2="38" y2="82" stroke="#F6F2E9" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="58" y1="88" x2="36" y2="90" stroke="#F6F2E9" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="102" y1="84" x2="122" y2="82" stroke="#F6F2E9" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="102" y1="88" x2="124" y2="90" stroke="#F6F2E9" strokeWidth="1.5" strokeLinecap="round" />

            {/* Livro Aberto entre as patas */}
            <g id="open-book" transform="translate(80, 126)">
              {/* Capa vermelha dura */}
              <polygon points="-46,-12 0,0 46,-12 48,16 0,26 -48,16" fill="#9E2A2B" stroke="#1E1E1E" strokeWidth="3" />
              {/* Páginas do livro */}
              <polygon points="-44,-10 -2,0 -2,22 -44,12" fill="#FAF7F0" stroke="#1E1E1E" strokeWidth="2" />
              <polygon points="44,-10 2,0 2,22 44,12" fill="#FAF7F0" stroke="#1E1E1E" strokeWidth="2" />
              
              {/* Linhas de texto nas páginas */}
              <line x1="-38" y1="-4" x2="-8" y2="2" stroke="#78716C" strokeWidth="1.5" />
              <line x1="-38" y1="1" x2="-12" y2="7" stroke="#78716C" strokeWidth="1.5" />
              <line x1="-38" y1="6" x2="-8" y2="12" stroke="#78716C" strokeWidth="1.5" />
              
              <line x1="8" y1="2" x2="38" y2="-4" stroke="#78716C" strokeWidth="1.5" />
              <line x1="12" y1="7" x2="38" y2="1" stroke="#78716C" strokeWidth="1.5" />
              <line x1="8" y1="12" x2="38" y2="6" stroke="#78716C" strokeWidth="1.5" />

              {/* Patinhas segurando o livro */}
              <ellipse cx="-34" cy="-6" rx="6" ry="5" fill="#1C1917" stroke="#1E1E1E" strokeWidth="2" />
              <ellipse cx="34" cy="-6" rx="6" ry="5" fill="#1C1917" stroke="#1E1E1E" strokeWidth="2" />
            </g>
          </g>
        );

      case 'voting':
        return (
          <g id="pose-voting">
            {/* Sombra base */}
            <ellipse cx="80" cy="150" rx="60" ry="8" fill="#1E1E1E" fillOpacity="0.2" />

            {/* Urna de Votação Popular (estilo caixa vintage) */}
            <g id="ballot-box" transform="translate(100, 95)">
              <rect x="0" y="0" width="46" height="52" fill="#283618" stroke="#1E1E1E" strokeWidth="3" rx="2" />
              {/* Fenda da urna */}
              <rect x="10" y="2" width="26" height="4" fill="#141414" stroke="#1E1E1E" strokeWidth="1.5" />
              {/* Estrela vermelha na urna */}
              <polygon points="23,24 25,30 31,30 26,34 28,40 23,36 18,40 20,34 15,30 21,30" fill="#D62828" stroke="#FDE047" strokeWidth="0.8" />
              <text x="23" y="48" fontSize="6" fontWeight="bold" fill="#FAF7F0" textAnchor="middle" letterSpacing="0.5">URNA</text>
            </g>

            {/* Corpo do gato */}
            <path d="M30 110 C30 85, 95 85, 95 110 L100 148 C100 152, 25 152, 25 148 Z" fill="#1C1917" stroke="#1E1E1E" strokeWidth="3" />

            {/* Orelhas */}
            <polygon points="40,65 25,28 55,48" fill="#1C1917" stroke="#1E1E1E" strokeWidth="3" />
            <polygon points="40,60 30,35 50,48" fill="#F43F5E" opacity="0.6" />
            <polygon points="90,65 105,28 75,48" fill="#1C1917" stroke="#1E1E1E" strokeWidth="3" />
            <polygon points="90,60 100,35 80,48" fill="#F43F5E" opacity="0.6" />

            {/* Cabeça */}
            <circle cx="65" cy="72" r="36" fill="#1C1917" stroke="#1E1E1E" strokeWidth="3" />

            {/* Boina Militar */}
            <path d="M25 50 C20 30, 100 20, 110 44 C110 52, 27 58, 25 50 Z" fill="#283618" stroke="#1E1E1E" strokeWidth="3" />
            <ellipse cx="65" cy="44" rx="40" ry="11" fill="#283618" stroke="#1E1E1E" strokeWidth="2" />
            
            {/* Estrela Vermelha */}
            <g transform="translate(65, 40)">
              <circle cx="0" cy="0" r="7" fill="#1E1E1E" />
              <polygon points="0,-5 1.5,-1.5 5.5,-1.5 2.5,0.8 3.5,4.8 0,2.4 -3.5,4.8 -2.5,0.8 -5.5,-1.5 -1.5,-1.5" fill="#D62828" stroke="#FDE047" strokeWidth="0.8" />
            </g>

            {/* Olhos vigilantes com atitude */}
            <ellipse cx="54" cy="70" rx="7" ry="8" fill="#FEF08A" stroke="#1E1E1E" strokeWidth="1.5" />
            <circle cx="56" cy="70" r="3.5" fill="#1E1E1E" />
            <ellipse cx="76" cy="70" rx="7" ry="8" fill="#FEF08A" stroke="#1E1E1E" strokeWidth="1.5" />
            <circle cx="78" cy="70" r="3.5" fill="#1E1E1E" />

            {/* Focinho e bigodes */}
            <polygon points="65,79 61,75 69,75" fill="#F43F5E" />
            <path d="M65 79 Q61 85 57 83 M65 79 Q69 85 73 83" stroke="#F6F2E9" strokeWidth="1.5" fill="none" />
            <line x1="48" y1="78" x2="28" y2="76" stroke="#F6F2E9" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="48" y1="82" x2="26" y2="84" stroke="#F6F2E9" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="82" y1="78" x2="102" y2="76" stroke="#F6F2E9" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="82" y1="82" x2="104" y2="84" stroke="#F6F2E9" strokeWidth="1.5" strokeLinecap="round" />

            {/* Pata levantada segurando a cédula eleitoral */}
            <g id="paw-voting">
              {/* Braço erguido */}
              <path d="M85 96 Q108 82 116 70" stroke="#1C1917" strokeWidth="12" strokeLinecap="round" />
              {/* Cédula de Votação oficial */}
              <g transform="translate(116, 60) rotate(-15)">
                <rect x="-8" y="-12" width="16" height="24" fill="#FAF7F0" stroke="#1E1E1E" strokeWidth="2" rx="1" />
                <line x1="-5" y1="-7" x2="5" y2="-7" stroke="#D62828" strokeWidth="2" />
                <line x1="-5" y1="-2" x2="3" y2="-2" stroke="#1E1E1E" strokeWidth="1.2" />
                <line x1="-5" y1="3" x2="4" y2="3" stroke="#1E1E1E" strokeWidth="1.2" />
                {/* Carimbo de 'VOTO' */}
                <circle cx="2" cy="7" r="3" fill="none" stroke="#D62828" strokeWidth="1" />
              </g>
              {/* Patinha preta segurando */}
              <circle cx="114" cy="68" r="6" fill="#1C1917" stroke="#1E1E1E" strokeWidth="2" />
            </g>
          </g>
        );

      case 'celebrating':
        return (
          <g id="pose-celebrating">
            {/* Sombra base */}
            <ellipse cx="80" cy="150" rx="55" ry="8" fill="#1E1E1E" fillOpacity="0.2" />

            {/* Estrelinhas de celebração flutuando */}
            <polygon points="32,26 34,31 39,31 35,34 37,39 32,36 27,39 29,34 25,31 30,31" fill="#E79E3C" />
            <polygon points="128,26 130,31 135,31 131,34 133,39 128,36 123,39 125,34 121,31 126,31" fill="#E79E3C" />
            <polygon points="80,12 82,17 87,17 83,20 85,25 80,22 75,25 77,20 73,17 78,17" fill="#D62828" />

            {/* Corpo */}
            <path d="M45 105 C45 80, 115 80, 115 105 L118 146 C118 150, 42 150, 42 146 Z" fill="#1C1917" stroke="#1E1E1E" strokeWidth="3" />

            {/* Braços erguidos em vitória! */}
            <path d="M48 95 Q25 70 24 50" stroke="#1C1917" strokeWidth="12" strokeLinecap="round" />
            <circle cx="24" cy="48" r="6.5" fill="#1C1917" stroke="#1E1E1E" strokeWidth="2" />
            
            <path d="M112 95 Q135 70 136 50" stroke="#1C1917" strokeWidth="12" strokeLinecap="round" />
            <circle cx="136" cy="48" r="6.5" fill="#1C1917" stroke="#1E1E1E" strokeWidth="2" />

            {/* Orelhas */}
            <polygon points="52,65 37,28 67,48" fill="#1C1917" stroke="#1E1E1E" strokeWidth="3" />
            <polygon points="52,60 42,35 62,48" fill="#F43F5E" opacity="0.6" />
            <polygon points="108,65 123,28 93,48" fill="#1C1917" stroke="#1E1E1E" strokeWidth="3" />
            <polygon points="108,60 118,35 98,48" fill="#F43F5E" opacity="0.6" />

            {/* Cabeça */}
            <circle cx="80" cy="72" r="36" fill="#1C1917" stroke="#1E1E1E" strokeWidth="3" />

            {/* Boina Militar */}
            <path d="M40 50 C35 30, 115 20, 126 44 C126 52, 42 58, 40 50 Z" fill="#283618" stroke="#1E1E1E" strokeWidth="3" />
            <ellipse cx="78" cy="44" rx="42" ry="11" fill="#283618" stroke="#1E1E1E" strokeWidth="2" />
            
            {/* Estrela Vermelha */}
            <g transform="translate(78, 40)">
              <circle cx="0" cy="0" r="7" fill="#1E1E1E" />
              <polygon points="0,-5 1.5,-1.5 5.5,-1.5 2.5,0.8 3.5,4.8 0,2.4 -3.5,4.8 -2.5,0.8 -5.5,-1.5 -1.5,-1.5" fill="#D62828" stroke="#FDE047" strokeWidth="0.8" />
            </g>

            {/* Olhos felizes fechados em arco (sorriso felino) */}
            <path d="M60 68 Q68 60 74 68" stroke="#FEF08A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M86 68 Q92 60 100 68" stroke="#FEF08A" strokeWidth="3.5" strokeLinecap="round" fill="none" />

            {/* Focinho e bocão aberto de comemoração */}
            <polygon points="80,75 76,71 84,71" fill="#F43F5E" />
            <path d="M72 78 Q80 94 88 78 Z" fill="#DC2626" stroke="#1E1E1E" strokeWidth="2" />
            <polygon points="76,78 78,82 80,78" fill="#FAF7F0" />
            <polygon points="80,78 82,82 84,78" fill="#FAF7F0" />

            {/* Bigodes empinados */}
            <line x1="58" y1="74" x2="36" y2="68" stroke="#F6F2E9" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="58" y1="79" x2="34" y2="78" stroke="#F6F2E9" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="102" y1="74" x2="124" y2="68" stroke="#F6F2E9" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="102" y1="79" x2="126" y2="78" stroke="#F6F2E9" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        );

      case 'sleeping':
        return (
          <g id="pose-sleeping">
            {/* Sombra base */}
            <ellipse cx="80" cy="150" rx="66" ry="8" fill="#1E1E1E" fillOpacity="0.25" />

            {/* Pilha de Livros Clássicos de Capa Dura */}
            <g id="book-stack">
              {/* Livro 1 (Base - Vermelho Revolucionário) */}
              <rect x="24" y="130" width="112" height="18" fill="#9E2A2B" stroke="#1E1E1E" strokeWidth="2.5" rx="3" />
              <rect x="28" y="134" width="104" height="10" fill="#FAF7F0" stroke="#1E1E1E" strokeWidth="1" />
              <line x1="38" y1="130" x2="38" y2="148" stroke="#FDE047" strokeWidth="1.5" />
              
              {/* Livro 2 (Topo - Verde Militar) */}
              <rect x="34" y="114" width="92" height="18" fill="#283618" stroke="#1E1E1E" strokeWidth="2.5" rx="3" />
              <rect x="38" y="118" width="84" height="10" fill="#FAF7F0" stroke="#1E1E1E" strokeWidth="1" />
              <line x1="48" y1="114" x2="48" y2="132" stroke="#BC6C25" strokeWidth="1.5" />
              {/* Marcador de fita vermelha saindo do livro */}
              <path d="M42 132 C38 140, 44 144, 40 148" stroke="#D62828" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </g>

            {/* Corpo do Gato dormindo em formato de pãozinho/bola aconchegada */}
            {/* Rabo felino curvado ao redor do corpo */}
            <path d="M115 106 C128 104, 132 88, 120 84 C114 82, 110 88, 112 94" stroke="#1C1917" strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d="M120 84 C117 82, 114 85, 115 88" stroke="#FAF7F0" strokeWidth="4" strokeLinecap="round" fill="none" />

            {/* Dorso e corpo fofo do gatinho */}
            <path d="M48 114 C46 92, 65 74, 94 74 C116 74, 124 90, 122 114 Z" fill="#1C1917" stroke="#1E1E1E" strokeWidth="3" />

            {/* Duas patinhas brancas dianteiras apoiadas fofamente */}
            <ellipse cx="62" cy="115" rx="7" ry="5" fill="#FAF7F0" stroke="#1E1E1E" strokeWidth="2" />
            <line x1="60" y1="114" x2="60" y2="117" stroke="#1E1E1E" strokeWidth="1" />
            <line x1="64" y1="114" x2="64" y2="117" stroke="#1E1E1E" strokeWidth="1" />

            <ellipse cx="76" cy="115" rx="7" ry="5" fill="#FAF7F0" stroke="#1E1E1E" strokeWidth="2" />
            <line x1="74" y1="114" x2="74" y2="117" stroke="#1E1E1E" strokeWidth="1" />
            <line x1="78" y1="114" x2="78" y2="117" stroke="#1E1E1E" strokeWidth="1" />

            {/* Cabeça do gatinho descansando suavemente de lado */}
            <circle cx="68" cy="88" r="23" fill="#1C1917" stroke="#1E1E1E" strokeWidth="2.5" />

            {/* Orelhinhas pontudinhas com rosa fofo */}
            <polygon points="50,74 44,54 60,66" fill="#1C1917" stroke="#1E1E1E" strokeWidth="2" strokeLinejoin="round" />
            <polygon points="51,70 47,58 58,66" fill="#F43F5E" opacity="0.65" />

            <polygon points="76,70 85,52 88,68" fill="#1C1917" stroke="#1E1E1E" strokeWidth="2" strokeLinejoin="round" />
            <polygon points="78,68 84,56 86,67" fill="#F43F5E" opacity="0.65" />

            {/* Boina Militar do Che bem colocada e inclinada na cabeça */}
            <path d="M48 66 C44 50, 88 44, 94 60 C94 66, 50 72, 48 66 Z" fill="#283618" stroke="#1E1E1E" strokeWidth="2.5" />
            <ellipse cx="70" cy="58" rx="24" ry="7" fill="#283618" stroke="#1E1E1E" strokeWidth="1.5" />

            {/* Estrela Vermelha dourada na Boina */}
            <g transform="translate(70, 54)">
              <circle cx="0" cy="0" r="5" fill="#1E1E1E" />
              <polygon points="0,-4 1.2,-1.2 4.2,-1.2 1.8,0.6 2.7,3.6 0,1.8 -2.7,3.6 -1.8,0.6 -4.2,-1.2 -1.2,-1.2" fill="#D62828" stroke="#FDE047" strokeWidth="0.5" />
            </g>

            {/* Rostinho meigo: Olhos fechados dormindo serenamente (⌒ ⌒) */}
            <path d="M54 88 Q60 83 65 88" stroke="#FEF08A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M71 88 Q76 83 82 88" stroke="#FEF08A" strokeWidth="2.2" strokeLinecap="round" fill="none" />

            {/* Focinho triangular rosa e boquinha serena de sono */}
            <polygon points="68,92 65,89 71,89" fill="#F43F5E" />
            <path d="M68 92 Q65 95 62 94 M68 92 Q71 95 74 94" stroke="#F6F2E9" strokeWidth="1.4" strokeLinecap="round" fill="none" />

            {/* Bigodes brancos finos */}
            <line x1="53" y1="91" x2="38" y2="90" stroke="#FAF7F0" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="53" y1="94" x2="39" y2="96" stroke="#FAF7F0" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="79" y1="91" x2="94" y2="90" stroke="#FAF7F0" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="79" y1="94" x2="93" y2="96" stroke="#FAF7F0" strokeWidth="1.3" strokeLinecap="round" />

            {/* 'z z Z' flutuando com estética retrô */}
            <text x="86" y="48" fontSize="13" fontWeight="900" fill="#D62828" fontStyle="italic" fontFamily="monospace">z</text>
            <text x="98" y="36" fontSize="16" fontWeight="900" fill="#BC6C25" fontStyle="italic" fontFamily="monospace">z</text>
            <text x="112" y="22" fontSize="20" fontWeight="900" fill="#D62828" fontStyle="italic" fontFamily="monospace">Z</text>
          </g>
        );

      case 'grumpy':
      default:
        return (
          <g id="pose-grumpy">
            {/* Sombra base */}
            <ellipse cx="80" cy="150" rx="55" ry="8" fill="#1E1E1E" fillOpacity="0.2" />

            {/* Corpo do gato preto com casaco estilo Che */}
            <path d="M42 98 C42 80, 118 80, 118 98 L122 146 C122 150, 38 150, 38 146 Z" fill="#1C1917" stroke="#1E1E1E" strokeWidth="3" />

            {/* Orelhas pontudas */}
            <polygon points="50,62 34,22 66,44" fill="#1C1917" stroke="#1E1E1E" strokeWidth="3" strokeLinejoin="round" />
            <polygon points="50,56 40,30 62,44" fill="#F43F5E" opacity="0.6" />
            
            <polygon points="110,62 126,22 94,44" fill="#1C1917" stroke="#1E1E1E" strokeWidth="3" strokeLinejoin="round" />
            <polygon points="110,56 120,30 98,44" fill="#F43F5E" opacity="0.6" />

            {/* Cabeça redonda do gato */}
            <circle cx="80" cy="72" r="38" fill="#1C1917" stroke="#1E1E1E" strokeWidth="3" />

            {/* Boina Militar do Che Guevara (Verde Oliva com dobra pronunciada) */}
            <path d="M36 50 C30 28, 120 18, 130 42 C130 52, 38 58, 36 50 Z" fill="#283618" stroke="#1E1E1E" strokeWidth="3" />
            <ellipse cx="78" cy="44" rx="44" ry="12" fill="#283618" stroke="#1E1E1E" strokeWidth="2.5" />
            
            {/* Estrela Vermelha de 5 pontas centralizada na Boina */}
            <g transform="translate(78, 40)">
              <circle cx="0" cy="0" r="8" fill="#1E1E1E" />
              <polygon points="0,-6 1.8,-1.8 6.3,-1.8 2.7,0.9 4,5.4 0,2.7 -4,5.4 -2.7,0.9 -6.3,-1.8 -1.8,-1.8" fill="#D62828" stroke="#FDE047" strokeWidth="0.8" />
            </g>

            {/* Sobrancelha esquerda arqueada de deboche/ranzinza */}
            <path d="M58 56 Q66 50 74 58" stroke="#FAF7F0" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Sobrancelha direita franzida */}
            <path d="M86 58 Q94 54 102 59" stroke="#FAF7F0" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Olhos amarelos penetrantes e ranzinzas */}
            <ellipse cx="66" cy="68" rx="8" ry="9" fill="#FEF08A" stroke="#1E1E1E" strokeWidth="1.8" />
            <circle cx="68" cy="68" r="3.8" fill="#1E1E1E" />
            <circle cx="66" cy="66" r="1.2" fill="#FFFFFF" />

            <ellipse cx="94" cy="68" rx="8" ry="9" fill="#FEF08A" stroke="#1E1E1E" strokeWidth="1.8" />
            <circle cx="92" cy="68" r="3.8" fill="#1E1E1E" />
            <circle cx="94" cy="66" r="1.2" fill="#FFFFFF" />

            {/* Focinho e bigodes caídos de desaprovação */}
            <polygon points="80,78 76,74 84,74" fill="#F43F5E" />
            {/* Boquinha ranzinza curvada para baixo */}
            <path d="M80 79 L80 83 M80 83 Q74 86 68 84 M80 83 Q86 86 92 84" stroke="#F6F2E9" strokeWidth="1.8" strokeLinecap="round" fill="none" />

            {/* Bigodes brancos nítidos */}
            <line x1="56" y1="78" x2="32" y2="76" stroke="#F6F2E9" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="56" y1="83" x2="30" y2="86" stroke="#F6F2E9" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="104" y1="78" x2="128" y2="76" stroke="#F6F2E9" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="104" y1="83" x2="130" y2="86" stroke="#F6F2E9" strokeWidth="1.8" strokeLinecap="round" />

            {/* Braços cruzados sobre o peito (Meme clássico do gato de braços cruzados) */}
            <g id="crossed-arms" transform="translate(80, 115)">
              {/* Braço direito cruzando por cima */}
              <path d="M-38,-6 C-38 12, 38 12, 38,-6 C28 18, -28 18, -38,-6 Z" fill="#283618" stroke="#1E1E1E" strokeWidth="3" />
              {/* Patinha esquerda por baixo */}
              <ellipse cx="-22" cy="5" rx="8" ry="6" fill="#1C1917" stroke="#1E1E1E" strokeWidth="2" />
              {/* Patinha direita por cima */}
              <ellipse cx="22" cy="5" rx="8" ry="6" fill="#1C1917" stroke="#1E1E1E" strokeWidth="2" />
              {/* Divisor do cruzar de braços */}
              <path d="M-28,4 Q0,10 28,4" stroke="#1E1E1E" strokeWidth="2" fill="none" />
            </g>
          </g>
        );
    }
  };

  return (
    <div className={`relative inline-flex items-center select-none ${className}`}>
      
      {/* Container SVG do Mascote */}
      <div 
        onClick={handleNextQuote}
        title="Clique no camarada para ouvir conselhos revolucionários"
        className={`cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 ${
          isWiggling ? 'animate-wiggle' : ''
        }`}
        style={{ width: `${w}px`, height: `${h}px` }}
      >
        <svg 
          viewBox={viewBox} 
          width="100%" 
          height="100%"
          className="filter drop-shadow-[2px_3px_0px_rgba(30,30,30,0.8)] overflow-visible"
        >
          {renderCatPose()}
        </svg>
      </div>

      {/* Balão de Fala Interativo */}
      {showBubble && (
        <div 
          onClick={handleNextQuote}
          className={`cursor-pointer z-30 transition-all duration-200 hover:scale-102 ${
            bubblePosition === 'top' 
              ? 'absolute -top-16 left-1/2 -translate-x-1/2' 
              : bubblePosition === 'left'
              ? 'mr-3'
              : 'ml-3 sm:ml-4'
          }`}
        >
          <div className="relative bg-[#FAF7F0] text-[#141414] border-2 border-[#1E1E1E] shadow-[3px_3px_0px_#1E1E1E] px-3.5 py-2 rounded-xl max-w-xs sm:max-w-sm">
            {/* Ponta da fala do balão */}
            {bubblePosition === 'right' && (
              <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-[#1E1E1E]" />
            )}
            
            <div className="flex items-start gap-2">
              <span className="text-[#D62828] text-xs font-black shrink-0 mt-0.5">★</span>
              <div>
                <p className="font-serif italic font-extrabold text-xs sm:text-sm text-[#141414] leading-snug">
                  "{currentQuote}"
                </p>
                <span className="text-[9px] uppercase font-mono font-black text-[#9E2A2B] tracking-wider block mt-1">
                  O Gato Camarada • Clique p/ outro conselho
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
