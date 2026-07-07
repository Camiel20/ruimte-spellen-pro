// ===== WERELD 4 — DE KRISTAL-BERGEN (leveldata) =====
// Grijze rotsen, paarse kristallen. Concept: SPLITSEN & AFTREKKEN — verdeel
// blokken over trein-wagons, geef delen van jezelf weg (helften!), en denk
// na: meer of minder? Het niveau ligt hoger: achtervolgingen, snellere
// projectielen en grotere splits-raadsels (je krijgt vaak één GROOT blok en
// moet zelf het goede stuk eraf scheuren).
// Nieuwe werkwoorden: trein-verdelen, antwoord-blokken (kopstoot!), rennen.
//
// RENOVATIE 2026-07-07: levels naar de norm (5000-5600px), 4-3 kreeg een
// derde, snellere achtervolging en de Kristal-Grommel (4-5) een eigen
// gevecht: stijl 'splits' — "10 = 6 + ?" — raak het goede kristal-brok.

export const LEVEL_4_1 = {
  id: '4-1',
  naam: 'De Splits-Trein',

  worldW: 5000,
  worldH: 800,
  killY: 720,
  terrain: 'berg',
  bg: { top: 0xa9c4e8, bottom: 0x9aa0a6 }, // berglucht → rots

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Splits de 10 en vul de trein!',
  afterGate: 'Tsjoeke-tsjoek! Volgende trein! 🚂',

  // Drie treinen: telkens één blok van 10, steeds anders verdelen —
  // 4+6, 5+5 (de helft!) en 3+7. Tussendoor springers en een glijder.
  platforms: [
    [0, 660, 640, 140],      // rots A (start)
    [1000, 660, 640, 140],   // rots B
    [2000, 660, 900, 140],   // rots C
    [3260, 660, 1740, 140],  // rots D — met de vlag
  ],

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 1150, y: 600, amount: 1 },
    { x: 2200, y: 600, amount: 1 },
    { x: 3500, y: 600, amount: 1 },
  ],

  gates: [
    { type: 'trein', gapX: 640,  gapW: 360, y: 650, wagons: [4, 6], blocks: [10], triggerX: 520,  triggerW: 120 },
    { type: 'trein', gapX: 1640, gapW: 360, y: 650, wagons: [5, 5], blocks: [10], triggerX: 1520, triggerW: 120 },
    { type: 'trein', gapX: 2900, gapW: 360, y: 650, wagons: [3, 7], blocks: [10], triggerX: 2780, triggerW: 120 },
  ],

  grommels: [
    { type: 'stomp', x: 380,  y: 612, patrol: [300, 540] },
    { type: 'stomp', x: 1300, y: 612, patrol: [1180, 1480] },
    { type: 'springer', x: 2500, y: 612, patrol: [2400, 2600] },
    { type: 'stomp', x: 3600, y: 612, patrol: [3500, 3700] },
    { type: 'glijder', x: 4200, y: 612, patrol: [4100, 4300] },
  ],

  star: { x: 1320, y: 424 },

  goal: { x: 4850, y: 588, value: 10 },

  reward: {
    title: 'Level 4-1 gehaald! 🏆',
    subtitle: 'Jij kunt 10 verdelen als een echte machinist!',
    stars: 3, medal: 'adventure_4_1', medalLabel: 'Splits-Machinist',
  },
};

export const LEVEL_4_2 = {
  id: '4-2',
  naam: 'Meer of Minder?',

  worldW: 5200,
  worldH: 800,
  killY: 720,
  terrain: 'berg',
  bg: { top: 0xa9c4e8, bottom: 0x9fa5ac },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Spring tegen het goede blok: meer of minder?',

  // Doorlopende bergweg met VIJF vraag-muren — steeds grotere getallen
  // (tot 15 vs 18!). Grommels patrouilleren precies waar jij moet springen.
  platforms: [
    [0, 660, 5200, 140],
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 1200, y: 600, amount: 1 },
    { x: 1950, y: 600, amount: 1 },
    { x: 3000, y: 600, amount: 1, regen: true },
    { x: 4000, y: 600, amount: 1, regen: true },
  ],

  // Kopstoot tegen het juiste antwoord-blok → de muur zakt weg.
  vraagMuren: [
    { x: 700,  kies: 'meer',   opties: [7, 4] },
    { x: 1400, kies: 'minder', opties: [3, 8] },
    { x: 2100, kies: 'meer',   opties: [12, 9] },
    { x: 3300, kies: 'minder', opties: [6, 13] },
    { x: 4300, kies: 'meer',   opties: [15, 18] },
  ],

  grommels: [
    { type: 'stomp', x: 950,  y: 612, patrol: [850, 1150] },
    { type: 'springer', x: 1750, y: 612, patrol: [1600, 1900] },
    { type: 'vlieger', x: 2650, y: 400, patrol: [2400, 2900] },
    { type: 'stomp', x: 3650, y: 612, patrol: [3500, 3800] },
    { type: 'glijder', x: 4650, y: 612, patrol: [4550, 4800] },
  ],

  star: { x: 1750, y: 420 },

  goal: { x: 5050, y: 588, value: 15 },

  reward: {
    title: 'Level 4-2 gehaald! 🏆',
    subtitle: 'Meer, minder — jij weet het altijd!',
    stars: 3, medal: 'adventure_4_2', medalLabel: 'Slimme Springer',
  },
};

export const LEVEL_4_3 = {
  id: '4-3',
  naam: 'De Rollende Rots',

  worldW: 5400,
  worldH: 800,
  killY: 720,
  terrain: 'berg',
  bg: { top: 0x9fb8dc, bottom: 0x9aa0a6 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'RENNEN! De rotsen komen eraan!',

  // DRIE achtervolgingen, elk sneller dan de vorige — met adempauzes
  // (geef-plaat) ertussen. De laatste is een lange eindsprint!
  platforms: [
    [0, 660, 1400, 140],     // bergpad A (achtervolging 1)
    [1490, 660, 1510, 140],  // bergpad B (plaat + achtervolging 2)
    [3000, 660, 2400, 140],  // bergpad C (de eindsprint!)
  ],

  pickups: [
    { x: 500,  y: 600, amount: 1 },  // grijp ze tijdens het rennen!
    { x: 800,  y: 600, amount: 1 },
    { x: 1820, y: 600, amount: 1, regen: true }, // magisch (voor de plaat)
    { x: 2150, y: 600, amount: 1 },
    { x: 3900, y: 600, amount: 1 },
    { x: 4500, y: 600, amount: 1 },
  ],

  // Drie achtervolgingen — steeds sneller. Tussendoor: geef 3.
  achtervolgingen: [
    { spawnX: 60,   triggerX: 300,  endX: 1300, speed: 185 },
    { spawnX: 1960, triggerX: 2200, endX: 2860, speed: 195 },
    { spawnX: 3160, triggerX: 3400, endX: 5100, speed: 205 }, // de eindsprint!
  ],

  plates: [
    { x: 1900, doel: 3 },
  ],

  grommels: [
    { type: 'stomp', x: 1650, y: 612, patrol: [1560, 1760] },
    { type: 'vlieger', x: 700, y: 430, patrol: [450, 950] },   // duikt boven het renpad!
    { type: 'vlieger', x: 3800, y: 430, patrol: [3500, 4200] }, // en nóg een!
  ],

  // Ster midden op het achtervolgings-pad: durf jij 'm te grijpen?
  star: { x: 1000, y: 430 },

  goal: { x: 5300, y: 588, value: 5 },

  reward: {
    title: 'Level 4-3 gehaald! 🏆',
    subtitle: 'Sneller dan drie rotsen — wat een held!',
    stars: 3, medal: 'adventure_4_3', medalLabel: 'Rots-Renner',
  },
};

export const LEVEL_4_4 = {
  id: '4-4',
  naam: 'De Splits-Meester',

  worldW: 5600,
  worldH: 800,
  killY: 790, // de ondergrondse gang ligt op 760
  terrain: 'berg',
  bg: { top: 0xa9c4e8, bottom: 0x9fa5ac },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Splits de 15 — en geef de helft!',
  afterGate: 'Knap gesplitst! Verder! 🚩',

  // Mastery: splits-brug (15 → scheur er 7 af), stamp-gang onder de muur,
  // geef-plaat (de helft: 5), een TWEEDE splits-brug (12 → 5) en op het eind
  // een vraagmuur + je eerste WERPER-Grommel. Alles komt samen.
  platforms: [
    [0, 660, 600, 140],      // rots A
    [960, 660, 700, 140],    // rots B (tot de kratten)
    [1250, 458, 60, 202],    // hoge MUUR op B: alleen met dubbelsprong
    [1660, 760, 700, 40],    // ondergrondse gang (val er via de kratten in)
    [2360, 660, 1200, 140],  // rots C — met de plaat
    [3920, 660, 1680, 140],  // rots D — vraagmuur, werper en de vlag
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
    { x: 4100, y: 600, amount: 1, regen: true }, // vóór de vraagmuur
  ],

  // Twee SPLITS-bruggen: scheur precies het goede stuk van één groot blok.
  gates: [
    { type: 'brug', gapX: 600, gapW: 360, y: 650, doel: 7, blocks: [15], triggerX: 480, triggerW: 120 },
    { type: 'brug', gapX: 3560, gapW: 360, y: 650, doel: 5, blocks: [12], triggerX: 3440, triggerW: 120 },
  ],

  // Geef de helft: 5 blokjes op de plaat.
  plates: [
    { x: 2700, doel: 5 },
  ],

  vraagMuren: [
    { x: 4500, kies: 'minder', opties: [4, 9] },
  ],

  grommels: [
    { type: 'stomp', x: 350,  y: 612, patrol: [260, 520] },
    { type: 'springer', x: 1450, y: 612, patrol: [1370, 1580] },
    { type: 'stomp', x: 3000, y: 612, patrol: [2900, 3150] },
    { type: 'werper', x: 4900, y: 612, patrol: [4800, 5000] }, // hij gooit kiezels!
  ],

  // Ster boven de muur.
  star: { x: 1280, y: 405 },

  // GEHEIM: een Gouden Nul achterin de ondergrondse gang.
  goudenNul: { x: 2280, y: 724 },

  goal: { x: 5450, y: 588, value: 10 },

  reward: {
    title: 'Level 4-4 gehaald! 🏆',
    subtitle: 'Splitsen, stampen én de helft geven — meester!',
    stars: 3, medal: 'adventure_4_4', medalLabel: 'Splits-Meester',
  },
};

export const LEVEL_4_5 = {
  id: '4-5',
  naam: 'De Kristal-Grommel',

  worldW: 4800,
  worldH: 800,
  killY: 720,
  terrain: 'berg',
  bg: { top: 0x8f86c8, bottom: 0x8a8f96 }, // paarse schemer — spannend

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'De Kristal-Grommel! Los zijn splits-raadsels op! 💎',

  // Volwaardige aanloop (vraagmuur + splits-brug) en dan het gevecht:
  // stijl 'splits' — hij toont "10 = 6 + ?" en er zweven drie kristallen:
  // raak het brok dat het raadsel afmaakt. Scherven zijn snel — ontwijk!
  platforms: [
    [0, 660, 1500, 140],     // rots A (aanloop)
    [1860, 660, 2940, 140],  // rots B — de baas-arena
  ],

  pickups: [
    { x: 250,  y: 600, amount: 1 },
    { x: 520,  y: 600, amount: 1 },
    { x: 700,  y: 600, amount: 1, regen: true }, // vóór de vraagmuur
    { x: 2000, y: 600, amount: 1 },
  ],

  vraagMuren: [
    { x: 900, kies: 'meer', opties: [11, 7] },
  ],

  gates: [
    { type: 'brug', gapX: 1500, gapW: 360, y: 650, doel: 4, blocks: [10], triggerX: 1380, triggerW: 120 },
  ],

  grommels: [
    { type: 'stomp', x: 400, y: 612, patrol: [300, 650] },
    { type: 'springer', x: 1100, y: 612, patrol: [1000, 1200] },
    { type: 'stomp', x: 2300, y: 612, patrol: [2200, 2400] },
    { type: 'glijder', x: 3000, y: 612, patrol: [2900, 3100] },
  ],

  // De Kristal-Grommel — stijl 'splits': "10 = 6 + ?", "15 = 9 + ?",
  // "20 = 12 + ?" — raak steeds het kristal-brok dat het raadsel afmaakt.
  boss: {
    x: 3600,
    name: 'Kristal-Grommel',
    look: 'kristal',
    stijl: 'splits',
    stages: [
      { van: 10, weg: 6,  doel: 4, opties: [4, 3, 6] },
      { van: 15, weg: 9,  doel: 6, opties: [6, 5, 8] },
      { van: 20, weg: 12, doel: 8, opties: [8, 7, 10] },
    ],
  },

  // Verstopte ster boven de arena: pak 'm tussen de scherven door!
  star: { x: 2700, y: 440 },

  goal: { x: 4650, y: 588, value: 12 },

  reward: {
    title: 'WERELD 4 UITGESPEELD! 🏆🎉',
    subtitle: 'De Kristal-Grommel straalt weer — jij bent een splits-held!',
    stars: 5, medal: 'world4_done', medalLabel: 'Held van Wereld 4',
  },
};

export const WORLD4 = [LEVEL_4_1, LEVEL_4_2, LEVEL_4_3, LEVEL_4_4, LEVEL_4_5];
