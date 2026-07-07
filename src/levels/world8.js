// ===== WERELD 8 — HET PANNENKOEKEN-PARADIJS (leveldata) =====
// Adrians tweede eet-wens: de pannenkoekenwereld! Stapel-torens, boter-
// glijbanen, slagroomwolken en stroop-meren. Concept: DOORTELLEN & PATRONEN
// + een gloednieuw beweeg-gevoel.
// Werkwoorden: flipperpannen (salto-lancering!), boter-glijbanen (momentum:
// vaart houden over gaten), de pannenkoeken-toren (bak er PRECIES n — te
// veel = omkieperen), de patroon-pannenkoek (wat komt er nu?) en DE
// REUZENFLIP (reuzen-pannenkoeken die periodiek omflippen).
//
// SPRINT 2 (2026-07-07): alle levels naar de norm (5200-5600px) én W8
// heeft eindelijk zijn baas: DE PANNEN-BAAS (8-5, stijl 'surf' —
// tel de geflipte pannenkoeken!) met de reuzenflip-oversteek als aanloop.

export const LEVEL_8_1 = {
  id: '8-1',
  naam: 'Flipper-Vallei',

  worldW: 5200,
  worldH: 800,
  killY: 720,
  terrain: 'pannenkoek',
  bg: { top: 0x8fd3ff, bottom: 0xf3d9a4 }, // zomerlucht → honing-goud

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'FLIP! Land op de pannen en maak een salto! 🥞',

  // Les 1: de flipperpan. Twee zwevende pan-oversteken, een boter-baan,
  // een MEER-vraagmuur — en de vlag hoog op de eind-richel.
  platforms: [
    [0, 660, 1150, 140],     // vallei A
    [1450, 660, 800, 140],   // vallei B (met boter-glijbaan naar het gat!)
    [2450, 660, 1050, 140],  // vallei C (vraagmuur)
    [3800, 660, 1400, 140],  // eind-vallei
    [700, 430, 180, 26],     // oefen-richel boven flipperpan 1
    [4840, 390, 240, 26],    // de EIND-RICHEL met de vlag
  ],

  water: [
    [1150, 690, 300, 110],
    [2250, 690, 200, 110],
    [3500, 690, 300, 110],
  ],

  flippers: [
    [600, 600],     // oefenpan (naar de richel + gouden nul)
    [1300, 560],    // ZWEVENDE pan boven stroop-meer 1 — de oversteek!
    [3650, 560],    // zwevende pan boven meer 3
    [4780, 600],    // lanceert je naar de vlag-richel
  ],

  glijbanen: [
    [1500, 600, 1], // boter-baan op vallei B: met vaart over het tweede gat!
    [3950, 600, 1],
  ],

  // Kopstoot tegen het goede blok: waar is MEER pannenkoek?
  vraagMuren: [
    { x: 2820, kies: 'meer', opties: [7, 3] },
  ],

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 760, y: 370, amount: 1 },   // op de oefen-richel
    { x: 1900, y: 600, amount: 1 },
    { x: 2560, y: 600, amount: 1, regen: true }, // vóór de vraagmuur
    { x: 4300, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'stomp', x: 900, y: 612, patrol: [800, 1050] },
    { type: 'glijder', x: 1800, y: 612, patrol: [1550, 2050] }, // STORMT over de boter!
    { type: 'springer', x: 2950, y: 612, patrol: [2880, 3050] },
    { type: 'glijder', x: 4200, y: 612, patrol: [4100, 4350] },
    { type: 'stomp', x: 4600, y: 612, patrol: [4500, 4700] },
  ],

  // Ster hoog boven de zwevende pan: flip-lancering + grijpen!
  star: { x: 1300, y: 230 },

  // GEHEIM: een Gouden Nul boven de oefen-richel.
  goudenNul: { x: 700, y: 300 },

  goal: { x: 4960, y: 318, value: 8 }, // op de hoge eind-richel

  reward: {
    title: 'Level 8-1 gehaald! 🏆',
    subtitle: 'Salto na salto — welkom in het Pannenkoeken-Paradijs!',
    stars: 3, medal: 'adventure_8_1', medalLabel: 'Salto-Springer',
  },
};

export const LEVEL_8_2 = {
  id: '8-2',
  naam: 'De Pannenkoeken-Toren',

  worldW: 5200,
  worldH: 800,
  killY: 720,
  terrain: 'pannenkoek',
  bg: { top: 0x8fd3ff, bottom: 0xefd096 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Bak er PRECIES 10 — stop op tijd, anders kiepert de toren om! 🥞🔔',

  // Les 2: eerst TWEE dubbel-portalen (3+3=6 en 4+4=8), dan hardop
  // meetellen tot 10 bij de toren — die een trap wordt naar de vlag-richel.
  platforms: [
    [0, 660, 5200, 140],
    [4880, 360, 240, 26],    // de vlag-richel: alleen via de toren-trap
  ],

  // Dubbel-raadsels onderweg: welk portaal maakt 6? En daarna: 8?
  portalen: [
    { x: 1450, doel: 6, opties: [[3, 3], [2, 3], [4, 3]] },
    { x: 2600, doel: 8, opties: [[4, 4], [3, 4], [5, 4]] },
  ],

  stapel: {
    x: 4150,
    doel: 10,
    trap: [
      [4560, 560, 120],
      [4710, 460, 120],
    ],
  },

  flippers: [[500, 600]],
  glijbanen: [[850, 500, 1], [3300, 550, 1]],

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 1250, y: 600, amount: 1, regen: true },
    { x: 2450, y: 600, amount: 1, regen: true },
    { x: 3800, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'stomp', x: 1150, y: 612, patrol: [1050, 1300] },
    { type: 'springer', x: 2250, y: 612, patrol: [2150, 2350] },
    { type: 'glijder', x: 3550, y: 612, patrol: [3450, 3700] },
    { type: 'springer', x: 4370, y: 612, patrol: [4300, 4450] },
    { type: 'stomp', x: 5050, y: 612, patrol: [4980, 5150] }, // onder de vlag-richel
  ],

  star: { x: 500, y: 240 }, // hoog boven de flipperpan

  goal: { x: 4960, y: 288, value: 10 }, // de vlag toont het bak-doel!

  reward: {
    title: 'Level 8-2 gehaald! 🏆',
    subtitle: 'Precies 10 — jij telt als een echte pannenkoeken-chef!',
    stars: 3, medal: 'adventure_8_2', medalLabel: 'Toren-Chef',
  },
};

export const LEVEL_8_3 = {
  id: '8-3',
  naam: 'Boter-Banen',

  worldW: 5600,
  worldH: 800,
  killY: 720,
  terrain: 'pannenkoek',
  bg: { top: 0x86c8f5, bottom: 0xe8c380 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Gliiiij-den! Spring op het juiste moment over de stroop! 🧈⚡',

  // Les 3 — het snelheidslevel: ZES boter-banen achter elkaar die je vol
  // vaart op de stroop-gaten af sturen. Springen op het juiste moment
  // (en over de Grommels heen!) — het snelste level van het spel.
  platforms: [
    [0, 660, 900, 140],
    [1100, 660, 700, 140],
    [2000, 660, 500, 140],
    [2700, 660, 500, 140],
    [3400, 660, 500, 140],
    [4100, 660, 500, 140],
    [4800, 660, 800, 140],   // de finish-oever
  ],

  water: [
    [900, 690, 200, 110],
    [1800, 690, 200, 110],
    [2500, 690, 200, 110],
    [3200, 690, 200, 110],
    [3900, 690, 200, 110],
    [4600, 690, 200, 110],
  ],

  glijbanen: [
    [300, 550, 1],
    [1200, 550, 1],
    [2050, 400, 1],
    [2750, 300, 1],
    [3450, 250, 1],
    [4150, 300, 1],
    [4900, 550, 1],   // laatste spurt naar de vlag
  ],

  pickups: [
    { x: 150, y: 600, amount: 1 },
    { x: 1150, y: 600, amount: 1 },
    { x: 2030, y: 600, amount: 1 },
    { x: 4950, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'stomp', x: 600, y: 612, patrol: [500, 750] },     // spring eroverheen tijdens het glijden!
    { type: 'glijder', x: 1500, y: 612, patrol: [1200, 1700] }, // stormt over de baan!
    { type: 'springer', x: 2250, y: 612, patrol: [2100, 2400] },
    { type: 'vlieger', x: 1400, y: 280, patrol: [1100, 1800] },
    { type: 'stomp', x: 3550, y: 612, patrol: [3470, 3650] },
    { type: 'vlieger', x: 4350, y: 280, patrol: [4100, 4600] },
    { type: 'stomp', x: 5250, y: 612, patrol: [5150, 5400] },
  ],

  // Ster middenin de glij-sprong boven het tweede gat — voor durvers.
  star: { x: 1900, y: 500 },

  // GEHEIM: een Gouden Nul boven een gat (grijp 'm in de vlucht).
  goudenNul: { x: 3300, y: 500 },

  goal: { x: 5450, y: 588, value: 9 },

  reward: {
    title: 'Level 8-3 gehaald! 🏆',
    subtitle: 'Gleden, gesprongen, gevlogen — sneller dan warme stroop!',
    stars: 3, medal: 'adventure_8_3', medalLabel: 'Boter-Bliksem',
  },
};

export const LEVEL_8_4 = {
  id: '8-4',
  naam: 'Het Patroon-Terras',

  worldW: 5400,
  worldH: 800,
  killY: 720,
  terrain: 'pannenkoek',
  bg: { top: 0x8fd3ff, bottom: 0xe8b96e },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Aardbei, banaan, aardbei… wat komt er NU? 🍓🍌',

  // Les 4: patronen! VIER patronen afmaken (AB → AAB → ABC → de proef),
  // precies 12 bakken, een flipper naar een hoge bonus-richel en twee
  // vraagmuren. Het volste level van het Paradijs.
  platforms: [
    [0, 660, 5400, 140],
    [2400, 300, 220, 26],    // de hoogste richel van het spel (Gouden Nul!)
    [4470, 380, 200, 26],    // bonus-richel via de tweede flipper
  ],

  patroon: {
    x: 640,
    rondes: [
      { reeks: ['aardbei', 'banaan', 'aardbei', 'banaan'], opties: ['aardbei', 'banaan'], antwoord: 'aardbei' },
      { reeks: ['room', 'room', 'bes', 'room', 'room'], opties: ['bes', 'room'], antwoord: 'bes' },
      { reeks: ['aardbei', 'bes', 'banaan', 'aardbei', 'bes'], opties: ['banaan', 'aardbei', 'bes'], antwoord: 'banaan' },
      { reeks: ['banaan', 'banaan', 'aardbei', 'banaan', 'banaan'], opties: ['aardbei', 'banaan', 'bes'], antwoord: 'aardbei' },
    ],
  },

  stapel: {
    x: 1650,
    doel: 12,
    trap: [
      [1900, 560, 120],
      [2050, 460, 120],
      [2200, 380, 110],
    ],
  },

  flippers: [[1150, 600], [4380, 600]],
  glijbanen: [[850, 240, 1], [3400, 550, 1]],

  // Twee vraagmuren: MEER halverwege, MINDER als slotproef.
  vraagMuren: [
    { x: 2950, kies: 'meer', opties: [12, 7] },
    { x: 4900, kies: 'minder', opties: [5, 11] },
  ],

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 1450, y: 600, amount: 1 },
    { x: 2700, y: 600, amount: 1, regen: true },
    { x: 4560, y: 320, amount: 1 },              // op de bonus-richel
    { x: 4750, y: 600, amount: 1, regen: true }, // vóór de tweede vraagmuur
  ],

  grommels: [
    { type: 'stomp', x: 1000, y: 612, patrol: [900, 1150] },
    { type: 'springer', x: 1450, y: 612, patrol: [1350, 1550] },
    { type: 'glijder', x: 2600, y: 612, patrol: [2450, 2780] }, // stormt onder de richel
    { type: 'werper', x: 3750, y: 612, patrol: [3650, 3850] },
    { type: 'stomp', x: 5150, y: 612, patrol: [5080, 5250] },
  ],

  star: { x: 1150, y: 230 },

  // GEHEIM: de Gouden Nul troont op de hoogste richel (via de toren-trap!).
  goudenNul: { x: 2510, y: 240 },

  goal: { x: 5300, y: 588, value: 12 }, // de vlag toont 12 — hoog doortellen!

  reward: {
    title: 'Level 8-4 gehaald! 🏆',
    subtitle: 'Patronen én precies 12 — jouw hoofd is net zo vol als de pannenkoek!',
    stars: 3, medal: 'adventure_8_4', medalLabel: 'Patroon-Meester',
  },
};

export const LEVEL_8_5 = {
  id: '8-5',
  naam: 'De Pannen-Baas',

  worldW: 5000,
  worldH: 800,
  killY: 720,
  terrain: 'pannenkoek',
  bg: { top: 0xf3d9a4, bottom: 0xdf9a4a }, // gouden avondlucht — de finale!

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Over de REUZENFLIP — naar de Pannen-Baas! Tel zijn pannenkoeken! 🥞',

  // De finale: eerst de beroemde reuzenflip-oversteek (vier flippende
  // reuzen-pannenkoeken boven het grote stroop-meer), en daarna het
  // gevecht: DE PANNEN-BAAS flipt 3, dan 4, dan 5 pannenkoeken de arena
  // over — TEL ze (spring erover!) en raak het bord met het goede aantal
  // (stijl 'surf' — het W8-leerdoel doortellen als baasgevecht).
  platforms: [
    [0, 660, 700, 140],      // start-oever
    [2500, 660, 2500, 140],  // de overkant — de baas-arena
  ],

  water: [[700, 690, 1800, 110]], // het grote stroop-meer

  reuzenflips: [
    [950, 560, 220],
    [1350, 500, 220],
    [1750, 560, 220],
    [2150, 500, 200],
  ],

  flippers: [[400, 600]], // oefenpan op de oever

  pickups: [
    { x: 200, y: 600, amount: 1 },
    { x: 550, y: 600, amount: 1, regen: true },
    { x: 3000, y: 600, amount: 1, regen: true }, // snack in de arena
  ],

  grommels: [
    { type: 'stomp', x: 2720, y: 612, patrol: [2650, 2800] },
    { type: 'springer', x: 3170, y: 612, patrol: [3100, 3250] },
  ],

  // DE PANNEN-BAAS — stijl 'surf': tel de geflipte pannenkoeken (3 → 4 → 5)
  // en raak daarna het bord met het juiste aantal. Fout geteld? Dan flipt
  // hij ze gewoon nog een keer.
  boss: {
    x: 3800,
    name: 'De Pannen-Baas',
    look: 'pan',
    stijl: 'surf',
    stages: [
      { doel: 3, opties: [3, 2, 5] },
      { doel: 4, opties: [4, 6, 3] },
      { doel: 5, opties: [5, 4, 7] },
    ],
  },

  // Ster boven reuzenflip 2 — grijp 'm midden in de oversteek!
  star: { x: 1350, y: 340 },

  // GEHEIM: een Gouden Nul boven reuzenflip 3.
  goudenNul: { x: 1750, y: 420 },

  goal: { x: 4850, y: 588, value: 10 },

  reward: {
    title: 'WERELD 8 UITGESPEELD! 🏆🥞',
    subtitle: 'Alle pannenkoeken geteld — de Pannen-Baas bakt er nu eentje voor jou!',
    stars: 5, medal: 'world8_done', medalLabel: 'Held van het Pannenkoeken-Paradijs',
  },
};

export const WORLD8 = [LEVEL_8_1, LEVEL_8_2, LEVEL_8_3, LEVEL_8_4, LEVEL_8_5];
