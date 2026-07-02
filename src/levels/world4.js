// ===== WERELD 4 — DE KRISTAL-BERGEN (leveldata) =====
// Grijze rotsen, paarse kristallen. Concept: SPLITSEN & AFTREKKEN — verdeel
// blokken over trein-wagons, geef delen van jezelf weg (helften!), en denk
// na: meer of minder? Het niveau ligt hoger: achtervolgingen, snellere
// projectielen en grotere splits-raadsels (je krijgt vaak één GROOT blok en
// moet zelf het goede stuk eraf scheuren).
// Nieuwe werkwoorden: trein-verdelen, antwoord-blokken (kopstoot!), rennen.

export const LEVEL_4_1 = {
  id: '4-1',
  naam: 'De Splits-Trein',

  worldW: 2600,
  worldH: 800,
  killY: 720,
  terrain: 'berg',
  bg: { top: 0xa9c4e8, bottom: 0x9aa0a6 }, // berglucht → rots

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  intro: 'Splits de 10 en vul de trein!',
  afterGate: 'Tsjoeke-tsjoek! Volgende trein! 🚂',

  platforms: [
    [0, 660, 640, 140],     // rots A (start)
    [1000, 660, 640, 140],  // rots B
    [2000, 660, 600, 140],  // rots C — met de vlag
  ],

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 1150, y: 600, amount: 1 },
  ],

  // Twee treinen: je krijgt ÉÉN blok van 10 en moet 'm precies verdelen.
  // Trein 1: 4+6 (partners van 10) · Trein 2: 5+5 (de helft!).
  gates: [
    { type: 'trein', gapX: 640,  gapW: 360, y: 650, wagons: [4, 6], blocks: [10], triggerX: 520,  triggerW: 120 },
    { type: 'trein', gapX: 1640, gapW: 360, y: 650, wagons: [5, 5], blocks: [10], triggerX: 1520, triggerW: 120 },
  ],

  grommels: [
    { type: 'stomp', x: 380,  y: 612, patrol: [300, 540] },
    { type: 'stomp', x: 1300, y: 612, patrol: [1180, 1480] },
  ],

  star: { x: 1320, y: 424 },

  goal: { x: 2480, y: 588, value: 10 },

  reward: {
    title: 'Level 4-1 gehaald! 🏆',
    subtitle: 'Jij kunt 10 verdelen als een echte machinist!',
    stars: 3, medal: 'adventure_4_1', medalLabel: 'Splits-Machinist',
  },
};

export const LEVEL_4_2 = {
  id: '4-2',
  naam: 'Meer of Minder?',

  worldW: 2600,
  worldH: 800,
  killY: 720,
  terrain: 'berg',
  bg: { top: 0xa9c4e8, bottom: 0x9fa5ac },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  intro: 'Spring tegen het goede blok: meer of minder?',

  // Doorlopende bergweg met drie vraag-muren; Grommels patrouilleren
  // precies waar jij moet springen (niveau omhoog!).
  platforms: [
    [0, 660, 2600, 140],
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 1200, y: 600, amount: 1 },
    { x: 1950, y: 600, amount: 1 },
  ],

  // Kopstoot tegen het juiste antwoord-blok → de muur zakt weg.
  vraagMuren: [
    { x: 700,  kies: 'meer',   opties: [7, 4] },
    { x: 1400, kies: 'minder', opties: [3, 8] },
    { x: 2100, kies: 'meer',   opties: [12, 9] },
  ],

  grommels: [
    { type: 'stomp', x: 950,  y: 612, patrol: [850, 1150] },
    { type: 'stomp', x: 1750, y: 612, patrol: [1600, 1900] },
  ],

  star: { x: 1750, y: 420 },

  goal: { x: 2480, y: 588, value: 12 },

  reward: {
    title: 'Level 4-2 gehaald! 🏆',
    subtitle: 'Meer, minder — jij weet het altijd!',
    stars: 3, medal: 'adventure_4_2', medalLabel: 'Slimme Springer',
  },
};

export const LEVEL_4_3 = {
  id: '4-3',
  naam: 'De Rollende Rots',

  worldW: 3000,
  worldH: 800,
  killY: 720,
  terrain: 'berg',
  bg: { top: 0x9fb8dc, bottom: 0x9aa0a6 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  intro: 'RENNEN! De rots komt eraan!',

  platforms: [
    [0, 660, 1400, 140],    // bergpad A (achtervolging 1)
    [1490, 660, 1510, 140], // bergpad B (plaat + achtervolging 2)
  ],

  pickups: [
    { x: 500,  y: 600, amount: 1 },  // grijp ze tijdens het rennen!
    { x: 800,  y: 600, amount: 1 },
    { x: 1820, y: 600, amount: 1, regen: true }, // magisch (voor de plaat)
    { x: 2150, y: 600, amount: 1 },
  ],

  // Twee achtervolgingen — de tweede is sneller. Tussendoor: geef 3.
  achtervolgingen: [
    { spawnX: 60,   triggerX: 300,  endX: 1300, speed: 185 },
    { spawnX: 1960, triggerX: 2200, endX: 2860, speed: 195 },
  ],

  plates: [
    { x: 1900, doel: 3 },
  ],

  grommels: [
    { type: 'stomp', x: 1650, y: 612, patrol: [1560, 1760] },
  ],

  // Ster midden op het achtervolgings-pad: durf jij 'm te grijpen?
  star: { x: 1000, y: 430 },

  goal: { x: 2940, y: 588, value: 5 },

  reward: {
    title: 'Level 4-3 gehaald! 🏆',
    subtitle: 'Sneller dan de rots — wat een held!',
    stars: 3, medal: 'adventure_4_3', medalLabel: 'Rots-Renner',
  },
};

export const LEVEL_4_4 = {
  id: '4-4',
  naam: 'De Splits-Meester',

  worldW: 3200,
  worldH: 800,
  killY: 790, // de ondergrondse gang ligt op 760
  terrain: 'berg',
  bg: { top: 0xa9c4e8, bottom: 0x9fa5ac },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  intro: 'Splits de 15 — en geef de helft!',
  afterGate: 'Knap gesplitst! Verder! 🚩',

  // Mastery: splits-brug (15 → scheur er 7 af), stamp-gang onder de muur,
  // en een geef-plaat (10 bij je? geef de helft: 5).
  platforms: [
    [0, 660, 600, 140],     // rots A
    [960, 660, 700, 140],   // rots B (tot de kratten)
    [1250, 458, 60, 202],   // hoge MUUR op B: alleen met dubbelsprong
    [1660, 760, 700, 40],   // ondergrondse gang (val er via de kratten in)
    [2360, 660, 840, 140],  // rots C — plaat + vlag
  ],

  // Breekbare kratten-vloer: stampen → je valt de gang in.
  breakables: [
    [1660, 660, 60, 100],
    [1720, 660, 60, 100],
    [1780, 660, 60, 100],
  ],

  pickups: [
    { x: 200,  y: 600, amount: 1 },
    { x: 1050, y: 600, amount: 1 },
    { x: 2450, y: 600, amount: 1 },
    { x: 2620, y: 600, amount: 1, regen: true }, // magisch (voor de plaat)
    { x: 2880, y: 600, amount: 1 },
  ],

  // SPLITS-brug: je krijgt alleen een 15 — scheur er precies 7 af!
  gate: {
    type: 'brug',
    gapX: 600, gapW: 360,
    y: 650,
    doel: 7,
    blocks: [15],
    triggerX: 480,
    triggerW: 120,
  },

  // Geef de helft: 5 blokjes op de plaat.
  plates: [
    { x: 2700, doel: 5 },
  ],

  grommels: [
    { type: 'stomp', x: 350,  y: 612, patrol: [260, 520] },
    { type: 'stomp', x: 1450, y: 612, patrol: [1370, 1580] },
    { type: 'stomp', x: 2950, y: 612, patrol: [2870, 3060] },
  ],

  // Ster boven de muur.
  star: { x: 1280, y: 405 },

  goal: { x: 3120, y: 588, value: 10 },

  reward: {
    title: 'Level 4-4 gehaald! 🏆',
    subtitle: 'Splitsen, stampen én de helft geven — meester!',
    stars: 3, medal: 'adventure_4_4', medalLabel: 'Splits-Meester',
  },
};

export const LEVEL_4_5 = {
  id: '4-5',
  naam: 'De Kristal-Grommel',

  worldW: 2000,
  worldH: 800,
  killY: 720,
  terrain: 'berg',
  bg: { top: 0x8f86c8, bottom: 0x8a8f96 }, // paarse schemer — spannend

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  intro: 'De Kristal-Grommel! Splits zijn raadsels — ontwijk de scherven!',

  platforms: [
    [0, 660, 2000, 140],
  ],

  pickups: [
    { x: 250,  y: 600, amount: 1 },
    { x: 520,  y: 600, amount: 1 },
    { x: 780,  y: 600, amount: 1 },
    { x: 1040, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'stomp', x: 500, y: 612, patrol: [360, 760] },
    { type: 'stomp', x: 950, y: 612, patrol: [800, 1150] },
  ],

  // De Kristal-Grommel: SPLITS-fasen — je krijgt een groot blok en moet er
  // precies het gevraagde stuk af scheuren. Scherven zijn sneller dan de
  // golven/eikels van eerdere werelden!
  boss: {
    x: 1500,
    name: 'Kristal-Grommel',
    look: 'kristal',
    stages: [
      { doel: 6,  blocks: [10] },      // scheur 6 van de 10
      { doel: 9,  blocks: [15, 3] },   // 15 → 9+6 (of 18 → 9+9!)
      { doel: 12, blocks: [20, 5] },   // 20 → 12+8
    ],
  },

  goal: { x: 1850, y: 588, value: 12 },

  reward: {
    title: 'WERELD 4 UITGESPEELD! 🏆🎉',
    subtitle: 'De Kristal-Grommel straalt weer — jij bent een splits-held!',
    stars: 5, medal: 'world4_done', medalLabel: 'Held van Wereld 4',
  },
};

export const WORLD4 = [LEVEL_4_1, LEVEL_4_2, LEVEL_4_3, LEVEL_4_4, LEVEL_4_5];
