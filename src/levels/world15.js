// ===== WERELD 15 — DINO-DAL (leveldata) =====
// Een prehistorische vallei vol vriendelijke dino's! 🦖 Concept: SPRONGEN
// op de getallenlijn (2, 5 en 10) — dé opstap naar de tafels.
//   - DE DINO-RIT 🦖 : kies de dino die PRECIES op het doel landt en tel
//     zijn sprongen mee. Moe-regel: max 6 sprongen — grote sprongen komen
//     véél sneller ver (daarom kan alleen de Reuzen-Dino 40 halen).
//   - FOSSIELEN 🦴 : veeg het zand weg en graaf een dino-skelet op.
//   - LAVA-GEISERS : de saus-geisers in oer-uitvoering (lanceer-fonteinen).
// Eindbaas: Reken-Rex — tel zíjn sprongen en raak het goede bot-bord.

export const LEVEL_15_1 = {
  id: '15-1',
  naam: 'De Varen-Vallei',

  worldW: 5000,
  worldH: 800,
  killY: 720,
  terrain: 'dino',
  bg: { top: 0xffd9a0, bottom: 0x8fbf6a }, // warme oerzon → varen-groen

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Welkom in het Dino-Dal! Kies de dino die PRECIES landt 🦖',

  // Les 1: de dino-rit (afstand 6 → alleen de Stapper met sprongen van 2)
  // en het eerste fossiel. Toetje: tel-wolkjes en een MEER-muur.
  platforms: [
    [0, 660, 5000, 140],
    [2400, 430, 180, 26],   // ster-richel
  ],

  dinoRitten: [
    { x: 900, start: 0, doel: 6 },
  ],

  fossielen: [[3000]],

  telWolken: [[2150, 540, 120]],

  vraagMuren: [
    { x: 4000, kies: 'meer', opties: [8, 3] },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 1900, y: 600, amount: 1 },
    { x: 3800, y: 600, amount: 1, regen: true }, // vóór de vraagmuur
  ],

  grommels: [
    { type: 'stomp', x: 1500, y: 612, patrol: [1400, 1600] },
    { type: 'vlieger', x: 2600, y: 280, patrol: [2400, 2800] },
    { type: 'springer', x: 3470, y: 612, patrol: [3400, 3550] },
    { type: 'stomp', x: 4500, y: 612, patrol: [4400, 4600] },
  ],

  star: { x: 2490, y: 350 },
  goudenNul: { x: 4650, y: 260 },

  goal: { x: 4900, y: 588, value: 10 },

  reward: {
    title: 'Level 15-1 gehaald! 🏆',
    subtitle: 'Drie sprongen van 2 — precies op 6 geland!',
    stars: 3, medal: 'adventure_15_1', medalLabel: 'Dino-Vriend',
  },
};

export const LEVEL_15_2 = {
  id: '15-2',
  naam: 'Het Eier-Veld',

  worldW: 5400,
  worldH: 800,
  killY: 720,
  terrain: 'dino',
  bg: { top: 0xffd2a0, bottom: 0x86b562 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Twee ritten: sprongen van 5 én van 2 — tel goed mee! 🥚',

  // Les 2: twee dino-ritten (15 = sprongen van 5; 12 = zes sprongen van 2)
  // met borrelende lava-geisers ertussen.
  platforms: [
    [0, 660, 5400, 140],
    [1600, 430, 180, 26],   // geiser-richel
  ],

  dinoRitten: [
    { x: 700, start: 0, doel: 15 },
    { x: 2500, start: 0, doel: 12 },
  ],

  geisers: [
    { x: 1500 }, { x: 3400 },
  ],

  fossielen: [[4200]],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2200, y: 600, amount: 1 },
    { x: 4000, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 1900, y: 612, patrol: [1800, 2000] },
    { type: 'werper', x: 3170, y: 612, patrol: [3100, 3250] }, // gooit mini-eitjes!
    { type: 'vlieger', x: 3800, y: 280, patrol: [3600, 4000] },
    { type: 'springer', x: 4670, y: 612, patrol: [4600, 4750] },
  ],

  star: { x: 1690, y: 240 }, // via de geiser-lancering!
  goudenNul: { x: 4900, y: 280 },

  goal: { x: 5300, y: 588, value: 10 },

  reward: {
    title: 'Level 15-2 gehaald! 🏆',
    subtitle: 'Vijf-vijf-vijf en twee-twee-twee — jij telt als een dino!',
    stars: 3, medal: 'adventure_15_2', medalLabel: 'Eier-Teller',
  },
};

export const LEVEL_15_3 = {
  id: '15-3',
  naam: 'De Lava-Helling',

  worldW: 5600,
  worldH: 800,
  killY: 720,
  terrain: 'dino',
  bg: { top: 0xffc98a, bottom: 0x7aa858 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'De vulkaan borrelt! Alleen de REUZEN-DINO haalt de 40 🌋',

  // Les 3: de Reuzen-Dino schittert (40 = vier sprongen van 10 — de rest
  // wordt moe!), met een geisers-lint en een MINDER-muur.
  platforms: [
    [0, 660, 5600, 140],
    [3300, 430, 180, 26],
  ],

  dinoRitten: [
    { x: 900, start: 0, doel: 40 },
  ],

  geisers: [
    { x: 2200 }, { x: 2800 }, { x: 3400 },
  ],

  vraagMuren: [
    { x: 4700, kies: 'minder', opties: [2, 9] },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2500, y: 600, amount: 1 },
    { x: 4500, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 2000, y: 612, patrol: [1900, 2100] },
    { type: 'glijder', x: 2600, y: 612, patrol: [2500, 2700] },
    { type: 'werper', x: 3970, y: 612, patrol: [3900, 4050] },
    { type: 'vlieger', x: 3300, y: 260, patrol: [3100, 3500] },
    { type: 'stomp', x: 5200, y: 612, patrol: [5100, 5300] },
  ],

  star: { x: 3390, y: 350 },
  goudenNul: { x: 700, y: 280 },

  goal: { x: 5500, y: 588, value: 10 },

  reward: {
    title: 'Level 15-3 gehaald! 🏆',
    subtitle: 'Tien, twintig, dertig, VEERTIG — reuzensprongen!',
    stars: 3, medal: 'adventure_15_3', medalLabel: 'Lava-Springer',
  },
};

export const LEVEL_15_4 = {
  id: '15-4',
  naam: 'Het Botten-Bos',

  worldW: 6000,
  worldH: 800,
  killY: 720,
  terrain: 'dino',
  bg: { top: 0xffcf94, bottom: 0x6f9d50 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Start eens NIET op nul: van 5 naar 30, van 10 naar 60! 🦴',

  // Les 4: ritten die niet op 0 beginnen (5→30 met vijven, 10→60 met
  // tienen), twee fossielen en een portaal-som.
  platforms: [
    [0, 660, 6000, 140],
    [2400, 430, 180, 26],
  ],

  dinoRitten: [
    { x: 700, start: 5, doel: 30 },
    { x: 3300, start: 10, doel: 60 },
  ],

  fossielen: [[1700], [5000]],

  portalen: [
    { x: 4700, doel: 10, opties: [[5, 5], [6, 5], [8, 3]] },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2600, y: 600, amount: 1 },
    { x: 4550, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 1500, y: 612, patrol: [1400, 1600] },
    { type: 'springer', x: 2170, y: 612, patrol: [2100, 2250] },
    { type: 'werper', x: 2900, y: 612, patrol: [2830, 2970] },
    { type: 'vlieger', x: 2500, y: 260, patrol: [2300, 2700] },
    { type: 'stomp', x: 5500, y: 612, patrol: [5400, 5600] },
  ],

  star: { x: 2490, y: 350 },
  goudenNul: { x: 1750, y: 260 },

  goal: { x: 5900, y: 588, value: 10 },

  reward: {
    title: 'Level 15-4 gehaald! 🏆',
    subtitle: 'Van 10 naar 60 in vijf reuzensprongen — knap geteld!',
    stars: 3, medal: 'adventure_15_4', medalLabel: 'Botten-Baas',
  },
};

export const LEVEL_15_5 = {
  id: '15-5',
  naam: 'Reken-Rex',

  worldW: 5200,
  worldH: 800,
  killY: 720,
  terrain: 'dino',
  bg: { top: 0xf0b070, bottom: 0x5f8a45 }, // schemer in het dal…

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'REKEN-REX verspert het dal — tel zijn sprongen mee! 🦖',

  // De finale: een dino-rit als aanloop, dan Reken-Rex zelf. Hij doet
  // sprongen over de getallenlijn boven de arena — raak het bot-bord met
  // de plek waar hij landt (2 → 5 → 10, steeds groter).
  platforms: [
    [0, 660, 5200, 140],
    [1500, 430, 180, 26],   // ster-richel
  ],

  dinoRitten: [
    { x: 800, start: 0, doel: 8 },
  ],

  fossielen: [[2400]],

  geisers: [
    { x: 3000 },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2200, y: 600, amount: 1 },
    { x: 3500, y: 600, amount: 1, regen: true }, // snack tussen de eieren
  ],

  grommels: [
    { type: 'stomp', x: 1900, y: 612, patrol: [1800, 2000] },
    { type: 'springer', x: 2770, y: 612, patrol: [2700, 2850] },
    { type: 'werper', x: 3670, y: 612, patrol: [3600, 3750] },
  ],

  boss: {
    x: 4300,
    name: 'Reken-Rex',
    look: 'rex',
    stijl: 'sprong',
    stages: [
      { start: 4, sprong: 2, keer: 3, doel: 10, opties: [10, 8, 12] },
      { start: 10, sprong: 5, keer: 4, doel: 30, opties: [30, 25, 35] },
      { start: 20, sprong: 10, keer: 3, doel: 50, opties: [50, 40, 53] },
    ],
  },

  star: { x: 1590, y: 350 },
  goudenNul: { x: 2700, y: 260 },

  goal: { x: 5050, y: 588, value: 10 },

  reward: {
    title: 'HET DINO-DAL UITGESPEELD! 🏆🦖',
    subtitle: 'Reken-Rex telt nu mee in plaats van te brullen!',
    stars: 5, medal: 'world15_done', medalLabel: 'Dino-Ruiter',
  },
};

export const WORLD15 = [LEVEL_15_1, LEVEL_15_2, LEVEL_15_3, LEVEL_15_4, LEVEL_15_5];
