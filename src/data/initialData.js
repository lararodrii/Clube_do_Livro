/**
 * Mock Data Inicial do Clube do Livro "Exército da Paty"
 * Estética Editorial Retrô Revolucionário — Não vai lutar contra o fascismo? ★
 */

// Membros oficiais com avatares de gatinhos e patentes temáticas revolucionárias
export const INITIAL_MEMBERS = [
  {
    id: 'm1',
    name: 'Paty (Gatinha Líder)',
    nickname: 'Comandante Bigodinho',
    avatar: '/avatars/gato1.jpg',
    color: '#D62828',
    colorLight: '#FEF2F2',
    roleBadge: '★ Comandante Suprema Felina',
    favBook: 'Torto Arado',
    bio: 'Idealizadora e Comandante do Exército da Paty. Líder dos debates literários coletivos: não tolera fascismo, falta de páginas lidas nem pote de ração pela metade!',
    joinedAt: 'Out/2026'
  },
  {
    id: 'm2',
    name: 'Lara',
    nickname: 'Lara Patinha Vermelha',
    avatar: '/avatars/gato2.jpg',
    color: '#9E2A2B',
    colorLight: '#FEF2F2',
    roleBadge: '★ Comissária dos Livros & Ronrons',
    favBook: 'Cem Anos de Solidão',
    bio: 'Especialista em desvendar teorias críticas profundas enquanto se enrola em mantas felinas na biblioteca popular.',
    joinedAt: 'Out/2026'
  },
  {
    id: 'm3',
    name: 'Stephany',
    nickname: 'Stephany Guerrilheira Miau',
    avatar: '/avatars/gato3.jpg',
    color: '#283618',
    colorLight: '#FEF2F2',
    roleBadge: '★ Guarda de Honra Miau',
    favBook: 'A Revolução dos Bichos',
    bio: 'Defensora ferrenha das metas semanais. Pronta para apontar contradições do sistema burguês e exigir petiscos para o coletivo.',
    joinedAt: 'Out/2026'
  },
  {
    id: 'm4',
    name: 'Alana',
    nickname: 'Alana Pelugem Rebelde',
    avatar: '/avatars/gato4.jpg',
    color: '#BC6C25',
    colorLight: '#FEF2F2',
    roleBadge: '★ Capitã da Teoria Crítica',
    favBook: 'Capitães da Areia',
    bio: 'Leitora voraz de ensaios e romances históricos. Ficha cada citação de impacto com a precisão de um felino caçador.',
    joinedAt: 'Out/2026'
  },
  {
    id: 'm5',
    name: 'Liz',
    nickname: 'Liz Patinha Afiada',
    avatar: '/avatars/gato5.jpg',
    color: '#DDA15E',
    colorLight: '#FEF2F2',
    roleBadge: '★ Agitadora Cultural Felina',
    favBook: 'Quarto de Despejo',
    bio: 'Movimenta as assembleias com argumentos perspicazes, energia revolucionária e a elegância de uma felina vigilante.',
    joinedAt: 'Out/2026'
  },
  {
    id: 'm6',
    name: 'Priscila',
    nickname: 'Priscila Bigodes Livres',
    avatar: '/avatars/gato6.jpg',
    color: '#141414',
    colorLight: '#FEF2F2',
    roleBadge: '★ Estrategista do Politburo',
    favBook: 'Como as democracias morrem',
    bio: 'Mente tática por trás da urna popular e das análises políticas. Transforma cada reunião em um marco histórico do clube.',
    joinedAt: 'Out/2026'
  }
];

// Leitura Atual (Destaque do Mês - Como as democracias morrem)
export const INITIAL_CURRENT_READING = {
  id: 'current-democracias',
  title: 'Como as democracias morrem',
  author: 'Steven Levitsky & Daniel Ziblatt',
  pages: 272,
  genre: 'Ciência Política & Sociedade',
  coverUrl: '/covers/como-as-democracias-morrem.jpg',
  monthYear: 'Novembro / 2026',
  badge: '★ Leitura do Comitê',
  synopsis: 'Democracias tradicionais não terminam mais com um estrondo militar, mas com um gemido lento. Os autores analisam como a subversão gradual das regras e normas institucionais corroem governos democráticos por dentro, trazendo lições cruciais da história moderna.',
  readingGoals: [
    { id: 1, week: 'Semana 1', label: 'Capítulos 1 e 2', pages: 'Páginas 1 a 68', targetPage: 68 },
    { id: 2, week: 'Semana 2', label: 'Capítulos 3 ao 5', pages: 'Páginas 69 a 136', targetPage: 136 },
    { id: 3, week: 'Semana 3', label: 'Capítulos 6 e 7', pages: 'Páginas 137 a 204', targetPage: 204 },
    { id: 4, week: 'Semana 4', label: 'Capítulos 8 e 9 (Fim)', pages: 'Páginas 205 a 272', targetPage: 272 },
  ],
  memberProgress: {
    'm1': [],
    'm2': [],
    'm3': [],
    'm4': [],
    'm5': [],
    'm6': []
  },
  reviews: []
};

// Data da Reunião Padrão: 25 de novembro de 2026 às 20:00
export const DEFAULT_MEETING_DATE = new Date(2026, 10, 25, 20, 0, 0).toISOString();

export function getInitialMeetingDate() {
  return DEFAULT_MEETING_DATE;
}

export const INITIAL_MEETING = {
  dateTime: DEFAULT_MEETING_DATE,
  formattedDate: 'quarta-feira, 20:00',
  location: 'Encontro 100% Online via Google Meet',
  address: 'Sala Virtual Google Meet',
  virtualLink: 'https://meet.google.com/exercito-da-paty',
  modality: 'Apenas Online (Google Meet)',
  confirmedMembers: ['m1']
};

// Dossiê Coletivo de Grifos Inicial
export const INITIAL_HIGHLIGHTS = [
  {
    id: 'hl-sample-1',
    page: 24,
    text: 'A trágica ironia da via eleitoral para o autoritarismo é que os assassinos da democracia usam as próprias instituições da democracia — gradual, sutil e até legalmente — para matá-la.',
    color: { name: 'Amarelo Revolucionário', hex: '#FDE047', bgClass: 'bg-yellow-300/40 border-yellow-400 text-yellow-950' },
    isConsensus: true,
    isSpoiler: false,
    highlightedBy: [
      {
        id: 'm1',
        name: 'Lara',
        avatar: '/avatars/gato1.jpg',
        roleBadge: '★ Comissária',
        note: 'Ponto crucial para a tese do livro. Discutir na assembleia!',
        color: { name: 'Amarelo Revolucionário', hex: '#FDE047', bgClass: 'bg-yellow-300/40 border-yellow-400 text-yellow-950' },
        date: '30/10/2026'
      },
      {
        id: 'm2',
        name: 'Stephany',
        avatar: '/avatars/gato2.jpg',
        roleBadge: '★ Estrategista',
        note: 'Grifei exatamente a mesma passagem no meu Kindle!',
        color: { name: 'Rosa Carmim', hex: '#F472B6', bgClass: 'bg-pink-300/40 border-pink-400 text-pink-950' },
        date: '31/10/2026'
      }
    ],
    comments: [
      {
        id: 'c-hl-1',
        memberId: 'm1',
        authorName: 'Lara',
        authorAvatar: '/avatars/gato1.jpg',
        text: 'Atenção para o paralelismo histórico que os autores traçam com as décadas de 1930 e o presente.',
        date: '31/10/2026',
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'hl-sample-2',
    page: 68,
    text: 'Instituições sozinhas não são suficientes para conter autocratas eleitos. Elas devem ser defendidas por normas democráticas compartilhadas: a contenção institucional e a tolerância mútua.',
    color: { name: 'Rosa Carmim', hex: '#F472B6', bgClass: 'bg-pink-300/40 border-pink-400 text-pink-950' },
    isConsensus: false,
    isSpoiler: false,
    highlightedBy: [
      {
        id: 'm1',
        name: 'Lara',
        avatar: '/avatars/gato1.jpg',
        roleBadge: '★ Comissária',
        note: 'Conceito chave: as duas guardas de trânsito da democracia.',
        color: { name: 'Rosa Carmim', hex: '#F472B6', bgClass: 'bg-pink-300/40 border-pink-400 text-pink-950' },
        date: '31/10/2026'
      }
    ],
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mural de Citações Inicial: Contém EXCLUSIVAMENTE os Consensos do Comitê (2+ camaradas)
export const INITIAL_QUOTES = [
  {
    id: 'q-consensus-hl-sample-1',
    highlightId: 'hl-sample-1',
    bookId: 'current-democracias',
    bookTitle: 'Como as democracias morrem',
    debateCycle: 'Novembro / 2026',
    assemblyDate: 'quarta-feira, 20:00',
    isBookSpecific: true,
    page: 'p. 24',
    text: 'A trágica ironia da via eleitoral para o autoritarismo é que os assassinos da democracia usam as próprias instituições da democracia — gradual, sutil e até legalmente — para matá-la.',
    isConsensus: true,
    isSpoiler: false,
    highlightedBy: INITIAL_HIGHLIGHTS[0].highlightedBy,
    authorName: 'Consenso: Lara & Stephany',
    authorAvatar: '/avatars/gato2.jpg',
    authorRole: '★ Consenso do Comitê (2 camaradas)',
    memberId: 'm1',
    comments: INITIAL_HIGHLIGHTS[0].comments,
    likes: ['m1'],
    likedBy: ['m1'],
    date: '31/10/2026',
    createdAt: new Date().toISOString()
  }
];

// Urna Mensal Inicial Limpa (Qualquer pessoa pode indicar quantos livros quiser!)
export const INITIAL_BALLOT = {
  status: 'open',
  title: 'Urna Popular do Exército da Paty ★',
  maxVotesPerMember: 3,
  books: []
};

// Acervo Histórico Consolidado com o Livro e o Ciclo de Debate Atual
export const INITIAL_ARCHIVE = [
  {
    id: 'archived-current-democracias',
    title: 'Como as democracias morrem',
    author: 'Steven Levitsky & Daniel Ziblatt',
    pages: 272,
    genre: 'Ciência Política & Sociedade',
    coverUrl: '/covers/como-as-democracias-morrem.jpg',
    readMonth: 'Novembro / 2026',
    cycle: 'Novembro / 2026',
    debateCycle: 'Novembro / 2026',
    assemblyDate: 'quarta-feira, 20:00',
    status: 'Ciclo Atual / Em Debate',
    synopsis: 'Democracias tradicionais não terminam mais com um estrondo militar, mas com um gemido lento. Os autores analisam como a subversão gradual das regras e normas institucionais corroem governos democráticos por dentro, trazendo lições cruciais da história moderna.',
    reviews: [],
    quotes: INITIAL_QUOTES,
    consensusQuotes: INITIAL_QUOTES,
    highlights: INITIAL_HIGHLIGHTS,
    averageRating: '5.0',
    archivedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Notificações Iniciais do Coletivo
export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-welcome-1',
    type: 'welcome',
    title: 'Comitê em Sessão Plenária! ★',
    message: 'Bem-vinda ao Exército da Paty! Aqui você recebe alertas de quem curtiu suas citações, metas batidas e novidades na urna.',
    linkTab: 'current',
    createdAt: new Date().toISOString(),
    readBy: []
  }
];


