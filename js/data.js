/**
 * DEMOCRACIA FIGHTER - Banco de Dados de Personagens, Fases, Assists e Políticas Públicas
 */

const HEROES = [
  {
    id: 'lula',
    name: 'Lula',
    avatar: '⭐️',
    portrait: 'assets/portraits/lula.png',
    baseFacing: 1,
    role: 'Reeleição 2026 / All-Around Brawler',
    colorHead: '#f5d0b5',
    colorHair: '#ffffff',
    colorBeard: '#f1f5f9',
    colorShirt: '#ffffff',
    colorTie: '#dc2626',
    colorPants: '#1e293b',
    hasBeard: true,
    speed: 4.0,
    punchDmg: 7,
    kickDmg: 12,
    special: {
      name: 'Onda Vermelha 2026 (Estrela 13)',
      type: 'projectile',
      projectileColor: '#ef4444',
      damage: 18,
      speed: 6.5
    },
    superMove: {
      name: 'A Voz da Massa: O 4º Mandato',
      damage: 42,
      color: '#dc2626'
    },
    quote: 'Nunca antes na história deste país o povo defendeu a democracia quatro vezes com tanta categoria!'
  },
  {
    id: 'dilma',
    name: 'Dilma',
    avatar: '🌪️',
    portrait: 'assets/portraits/dilma.png',
    baseFacing: 1,
    role: 'Banco dos BRICS / Zoner Heavy',
    colorHead: '#f8d7c4',
    colorHair: '#475569',
    colorShirt: '#dc2626',
    colorTie: null,
    colorPants: '#334155',
    hasBeard: false,
    speed: 3.6,
    punchDmg: 8,
    kickDmg: 14,
    special: {
      name: 'Estocadora de Vento Geopolítica',
      type: 'projectile',
      projectileColor: '#38bdf8',
      damage: 20,
      speed: 7.0
    },
    superMove: {
      name: 'Reparação Histórica: A Vingança do Coração Valente',
      damage: 45,
      color: '#38bdf8'
    },
    quote: 'A história não absolveu só a mim, absolveu a democracia brasileira! E a meta agora foi quadruplicada!'
  },
  {
    id: 'marina',
    name: 'Marina Silva',
    avatar: '🌿',
    portrait: 'assets/portraits/marina.png',
    baseFacing: 1,
    role: 'Autoridade Climática COP30 / Agile Trapper',
    colorHead: '#e2ba99',
    colorHair: '#1e293b',
    colorShirt: '#15803d',
    colorTie: null,
    colorPants: '#064e3b',
    hasBeard: false,
    speed: 4.8,
    punchDmg: 6,
    kickDmg: 10,
    special: {
      name: 'Fiscalização do IBAMA (Garras da Floresta)',
      type: 'ground_trap',
      projectileColor: '#22c55e',
      damage: 16,
      speed: 8.0
    },
    superMove: {
      name: 'O Julgamento da COP: Tsunami da Floresta Viva',
      damage: 40,
      color: '#16a34a'
    },
    quote: 'O Brasil não é o quintal de predadores ambientais. A floresta em pé venceu a eleição!'
  },
  {
    id: 'erika',
    name: 'Érika Hilton',
    avatar: '👑',
    portrait: 'assets/portraits/erika.png',
    baseFacing: 1,
    role: 'Liderança do Plenário / Rushdown Glamour',
    colorHead: '#9c6c4c',
    colorHair: '#d8a46b', // Loiro mel / dourado ondulado da foto
    colorShirt: '#c026d3',
    colorTie: null,
    colorPants: '#581c87',
    hasBeard: false,
    speed: 4.6,
    punchDmg: 7,
    kickDmg: 13,
    special: {
      name: 'Giro do Leque Parlamentar',
      type: 'melee_spin',
      projectileColor: '#f43f5e',
      damage: 19,
      speed: 7.5
    },
    superMove: {
      name: 'Baile da Democracia: O Nocaute Ballroom',
      damage: 44,
      color: '#d946ef'
    },
    quote: 'Travesti no Senado, elegância no plenário e nocaute no tatame eleitoral. Chora, bancada do ódio!'
  },
  {
    id: 'cortez',
    name: 'Guilherme Cortez',
    avatar: '📣',
    portrait: 'assets/portraits/cortez.png',
    baseFacing: 1,
    role: 'Renovação Combatente / Youth Fast Combo',
    colorHead: '#f3c7a9',
    colorHair: '#3b2416', // Cabelo castanho escuro
    colorShirt: '#cbd5e1', // Terno cinza claro da foto
    colorTie: '#2563eb', // Gravata azul estampada da foto
    colorPants: '#94a3b8',
    hasBeard: true,
    hasGlasses: true, // Óculos redondos pretos da foto
    speed: 4.7,
    punchDmg: 6,
    kickDmg: 11,
    special: {
      name: 'Megafone Universitário 2026',
      type: 'projectile',
      projectileColor: '#f97316',
      damage: 17,
      speed: 7.2
    },
    superMove: {
      name: 'Rebelião da Juventude: Ocupa Brasília 2026',
      damage: 41,
      color: '#ea580c'
    },
    quote: 'A juventude não aceita retrocesso, censura nem fanatismo. 2026 é o nosso futuro!'
  }
];

// ESCADA OFICIAL DE OPONENTES DA CAMPANHA (ELEIÇÃO 2026)
// ESCADA OFICIAL DE OPONENTES DA CAMPANHA (ELEIÇÃO 2026)
const OPPONENTS_LADDER = [
  {
    id: 'npc',
    name: 'NPC Bolsonarista',
    stageName: 'Caravana da Anistia 2026',
    stageImage: 'assets/stages/caravana.jpg',
    avatar: '🚙',
    portrait: 'assets/portraits/npc.png',
    baseFacing: -1,
    difficulty: 1,
    maxHp: 90,
    speed: 2.8,
    colorHead: '#f3c7a9',
    colorHair: '#71717a',
    colorShirt: '#eab308', // Camisa amarela gasta de 2022
    colorPants: '#15803d',
    hasBeard: false,
    specialName: 'Reza da Anistia',
    specialColor: '#eab308',
    superMove: {
      name: 'Sinal de Lanterna de 72 Horas',
      damage: 28,
      color: '#eab308'
    },
    quoteLoss: 'A eleição de 2026 foi fraudada! É só esperar mais 72 horas pelo relatório!'
  },
  {
    id: 'campopiano',
    name: 'Eduarda Campopiano',
    stageName: 'Vão Livre do MASP 2026',
    stageImage: 'assets/cenas/SP_MASP.jpg',
    avatar: '📑',
    portrait: 'assets/portraits/campopiano.png',
    baseFacing: -1,
    difficulty: 2,
    maxHp: 100,
    speed: 3.2,
    colorHead: '#f9d5bb',
    colorHair: '#78350f',
    colorShirt: '#0284c7',
    colorPants: '#0f172a',
    hasBeard: false,
    specialName: 'Fundo Partidário Strike',
    specialColor: '#38bdf8',
    superMove: {
      name: 'Processo na Justiça Eleitoral',
      damage: 32,
      color: '#38bdf8'
    },
    quoteLoss: 'Vocês me calaram agora, mas meu engajamento no 1º turno vai explodir!'
  },
  {
    id: 'pavanato',
    name: 'Lucas Pavanato',
    stageName: 'Avenida Paulista & MASP 2026',
    stageImage: 'assets/cenas/SP_MASP.jpg',
    avatar: '📢',
    portrait: 'assets/portraits/pavanato.png',
    baseFacing: -1,
    difficulty: 3,
    maxHp: 110,
    speed: 3.6,
    colorHead: '#f7d8c5',
    colorHair: '#18181b',
    colorShirt: '#047857',
    colorPants: '#1e293b',
    hasBeard: false,
    specialName: 'Tripé da Lacração',
    specialColor: '#10b981',
    superMove: {
      name: 'Megafone do Pânico Moral',
      damage: 34,
      color: '#10b981'
    },
    quoteLoss: 'Cortem isso na edição! Ninguém pode ver meu candidato perdendo no debate!'
  },
  {
    id: 'moro',
    name: 'Sergio Moro',
    stageName: 'Senado Federal (3ª Via 2026)',
    stageImage: 'assets/stages/curitiba.jpg',
    avatar: '⚖️',
    portrait: 'assets/portraits/moro.png',
    baseFacing: -1,
    difficulty: 4,
    maxHp: 125,
    speed: 3.4,
    colorHead: '#f3cbb1',
    colorHair: '#3f3f46',
    colorShirt: '#09090b', // Toga / Terno sóbrio
    colorPants: '#09090b',
    hasBeard: false,
    specialName: 'PowerPoint Revisitado 2026',
    specialColor: '#ef4444',
    superMove: {
      name: 'Sentença da República de Curitiba',
      damage: 38,
      color: '#ef4444'
    },
    quoteLoss: 'Quero consignar em ata meus protestos contra este resultado eleitoral...'
  },
  {
    id: 'nikolas',
    name: 'Nikolas Ferreira',
    stageName: 'Comício Viral 2026',
    stageImage: 'assets/stages/comicio.jpg',
    avatar: '📱',
    portrait: 'assets/portraits/nikolas.png',
    baseFacing: -1,
    difficulty: 5,
    maxHp: 135,
    speed: 4.2,
    colorHead: '#fce2d0',
    colorHair: '#52525b',
    colorShirt: '#1e293b',
    colorPants: '#0f172a',
    hasBeard: false,
    specialName: 'Live do Milhão de Votos',
    specialColor: '#f59e0b',
    superMove: {
      name: 'Chupetinha Viral Explosivo',
      damage: 40,
      color: '#f59e0b'
    },
    quoteLoss: 'Vou denunciar esse resultado ao plenário e pedir a anulação das urnas eletrônicas!'
  },
  {
    id: 'flavio',
    name: 'Flávio Bolsonaro (CHEFE 2026)',
    stageName: 'Congresso Nacional (Brasília 2026)',
    stageImage: 'assets/cenas/DF_CONGRESSO.jpg',
    avatar: '🍫',
    portrait: 'assets/portraits/flavio.png',
    baseFacing: -1,
    difficulty: 6,
    maxHp: 150,
    speed: 4.0,
    colorHead: '#f5c6a5',
    colorHair: '#27272a',
    colorShirt: '#ca8a04', // Dourado / Terno presidencial
    colorPants: '#1c1917',
    hasBeard: true,
    specialName: 'Emenda Secreta & Panetone',
    specialColor: '#d97706',
    superMove: {
      name: 'Tempestade de Chocolates e Precatórios',
      damage: 44,
      color: '#d97706'
    },
    quoteLoss: 'Esse resultado não passa na CCJ do Senado! Meus assessores vão recorrer!'
  }
];

// CHEFES SECRETOS DA ELEIÇÃO 2026 (DESBLOQUEÁVEIS POR CÓDIGO OU CONQUISTA)
const SECRET_BOSSES = [
  {
    code: 'BOLSO',
    id: 'jair',
    name: 'Jair Bolsonaro (O INELEGÍVEL)',
    stageName: 'Bunker do Inelegível (Orlando/Flórida)',
    stageImage: 'assets/stages/orlando.jpg',
    avatar: '🛵',
    portrait: 'assets/portraits/jair.png',
    baseFacing: -1,
    difficulty: 7,
    maxHp: 175,
    speed: 4.5,
    colorHead: '#efbe9b',
    colorHair: '#52525b',
    colorShirt: '#eab308',
    colorPants: '#1d4ed8',
    hasBeard: false,
    specialName: 'Caneta Bic Gigante',
    specialColor: '#3b82f6',
    superMove: {
      name: 'Motociata do Inelegível Destrutiva',
      damage: 48,
      color: '#dc2626'
    },
    quoteLoss: 'Acabou, p***a! Mas eu continuo inelegível no coração do povo!'
  },
  {
    code: 'VORCARO',
    id: 'vorcaro',
    name: 'Daniel Vorcaro (FINANCIADOR 2026)',
    stageName: 'Faria Lima Finance 2026',
    stageImage: 'assets/stages/farialima.jpg',
    avatar: '💼',
    portrait: 'assets/portraits/vorcaro.png',
    baseFacing: -1,
    difficulty: 7,
    maxHp: 165,
    speed: 4.2,
    colorHead: '#f0caa7',
    colorHair: '#18181b',
    colorShirt: '#0f172a',
    colorPants: '#334155',
    hasBeard: true,
    specialName: 'Crédito Podre de Campanha',
    specialColor: '#10b981',
    superMove: {
      name: 'Colapso dos Faria Limers',
      damage: 45,
      color: '#059669'
    },
    quoteLoss: 'Vou emitir um precatório judicial contra a minha derrota eleitoral!'
  },
  {
    code: 'CARLUXO',
    id: 'carlos',
    name: 'Carlos Bolsonaro (IA DO ÓDIO 2026)',
    stageName: 'Fazenda de Bots & IA 2026',
    stageImage: 'assets/stages/bunker_bots.jpg',
    avatar: '🤖',
    portrait: 'assets/portraits/carlos.png',
    baseFacing: -1,
    difficulty: 7,
    maxHp: 160,
    speed: 4.4,
    colorHead: '#ecc1a0',
    colorHair: '#27272a',
    colorShirt: '#1e1b4b',
    colorPants: '#09090b',
    hasBeard: false,
    specialName: 'Deepfake & Disparo Zap 2026',
    specialColor: '#22c55e',
    superMove: {
      name: 'Enxurrada Cibernética do Gabinete do Ódio',
      damage: 46,
      color: '#7c3aed'
    },
    quoteLoss: 'O algoritmo foi sabotado pela imprensa tradicional! Não aceito!'
  }
];

// SISTEMA DE APOIO POPULAR / FANDOMS / CIÊNCIA (ASSISTS)
const ASSISTS_LIST = [
  {
    id: 'gotinha',
    name: 'Universidades & Zé Gotinha',
    tag: '💉 CIÊNCIA & VACINA',
    desc: 'Cura 35 pontos de vida e anula atordoamento!',
    effect: 'heal',
    value: 35
  },
  {
    id: 'fandoms',
    name: 'Apoio dos Fandoms (Pop & K-Pop)',
    tag: '💖 SWIFTIES & BEYHIVES',
    desc: 'Varre projéteis e concede super velocidade!',
    effect: 'speed_boost',
    value: 2.0
  },
  {
    id: 'artistas',
    name: 'Vozes da MPB & Cultura',
    tag: '🎸 ARTISTAS NACIONAIS',
    desc: 'Atordoa o adversário e recarrega 50% de Super!',
    effect: 'super_charge',
    value: 50
  }
];

// PÍLULAS DE CIDADANIA (CONSCIENTIZAÇÃO POLÍTICA E POLÍTICAS PÚBLICAS)
const CIVIC_CARDS = [
  {
    title: 'O SUS: O MAIOR SISTEMA PÚBLICO DO MUNDO',
    icon: '🏥',
    text: 'Criado pela Constituição Cidadã de 1988, o SUS garante assistência integral e gratuita a mais de 190 milhões de brasileiros, do transplante de órgãos complexo à vacinação básica na ponta.',
    stat: '📊 Mais de 3,7 bilhões de atendimentos ambulatoriais e 11 milhões de internações por ano!'
  },
  {
    title: 'UNIVERSIDADES PÚBLICAS & LEI DE COTAS',
    icon: '🎓',
    text: 'A expansão das Universidades Federais e a Lei de Cotas transformaram a demografia do ensino superior, garantindo inclusão histórica para jovens negros, pardos, indígenas e de escolas públicas.',
    stat: '📊 A proporção de alunos pretos e pardos em universidades públicas dobrou nos últimos 15 anos!'
  },
  {
    title: 'SEGURANÇA ALIMENTAR & BOLSA FAMÍLIA',
    icon: '🍲',
    text: 'Aliando transferência de renda com permanência escolar e vacinação das crianças, os programas sociais e o fortalecimento da agricultura familiar retiraram o país do Mapa da Fome da ONU.',
    stat: '📊 Mais de 20 milhões de famílias protegidas da extrema pobreza com dignidade.'
  },
  {
    title: 'MEIO AMBIENTE & POVOS ORIGINÁRIOS',
    icon: '🌳',
    text: 'A demarcação de terras indígenas e o investimento no IBAMA e ICMBio são as ferramentas mais comprovadas pela ciência mundial para barrar o aquecimento global e preservar a Amazônia e o Cerrado.',
    stat: '📊 Terras indígenas homologadas apresentam índices de desmatamento até 80% menores!'
  },
  {
    title: 'DIREITOS CIVIS & COMBATE À LGBTFOBIA',
    icon: '🌈',
    text: 'A equiparação da homotransfobia ao crime de racismo pelo STF e as políticas públicas de proteção às mulheres e minorias consolidam a dignidade humana como cláusula pétrea da República.',
    stat: '📊 O Brasil é pioneiro no atendimento gratuito do processo transexualizador via SUS.'
  },
  {
    title: 'INFRAESTRUTURA: ÁGUA E TETO PARA O POVO',
    icon: '💧',
    text: 'A Transposição das Águas do Rio São Francisco levou segurança hídrica definitiva a mais de 12 milhões de sertanejos, enquanto o Minha Casa Minha Vida realizou o sonho da moradia digna.',
    stat: '📊 Mais de 6 milhões de moradias entregues e rios perenes no coração do semiárido brasileiro.'
  }
];
