// ===== WERELD 8 — HET PANNENKOEKEN-PARADIJS (leveldata) =====
// Adrians tweede eet-wens: de pannenkoekenwereld! Stapel-torens, boter-
// glijbanen, slagroomwolken en stroop-meren. Concept: DOORTELLEN & PATRONEN
// + een gloednieuw beweeg-gevoel. Dit is de laatste wereld — hij mag dus
// lekker uitdagend zijn.
// Nieuwe werkwoorden: flipperpannen (salto-lancering!), boter-glijbanen
// (momentum: vaart houden over gaten), de pannenkoeken-toren (bak er
// PRECIES n — te veel = omkieperen), de patroon-pannenkoek (wat komt er
// nu?) en DE REUZENFLIP (reuzen-pannenkoeken die periodiek omflippen).

export const LEVEL_8_1 = {
  id: '8-1',
  naam: 'Flipper-Vallei',

  worldW: 2900,
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

  // Les 1: de flipperpan. Eén pan zweeft boven het stroop-meer — de enige
  // weg naar de overkant. De vlag staat hoog: alleen via de laatste pan.
  platforms: [
    [0, 660, 1150, 140],     // vallei A
    [1450, 660, 800, 140],   // vallei B (met boter-glijbaan naar het gat!)
    [2450, 660, 450, 140],   // eind-vallei
    [700, 430, 180, 26],     // oefen-richel boven flipperpan 1
    [2540, 390, 240, 26],    // de EIND-RICHEL met de vlag
  ],

  water: [[1150, 690, 300, 110], [2250, 690, 200, 110]], // stroop-meren

  flippers: [
    [600, 600],     // oefenpan (naar de richel + gouden nul)
    [1300, 560],    // ZWEVENDE pan boven het stroop-meer — de oversteek!
    [2480, 600],    // lanceert je naar de vlag-richel
  ],

  glijbanen: [
    [1500, 600, 1], // boter-baan op vallei B: met vaart over het tweede gat!
  ],

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 760, y: 370, amount: 1 },   // op de oefen-richel
    { x: 1900, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'stomp', x: 900, y: 612, patrol: [800, 1050] },
    { type: 'stomp', x: 1800, y: 612, patrol: [1700, 2000] },
  ],

  // Ster hoog boven de zwevende pan: flip-lancering + grijpen!
  star: { x: 1300, y: 230 },

  // GEHEIM: een Gouden Nul boven de oefen-richel.
  goudenNul: { x: 700, y: 300 },

  goal: { x: 2650, y: 318, value: 8 }, // op de hoge eind-richel

  reward: {
    title: 'Level 8-1 gehaald! 🏆',
    subtitle: 'Salto na salto — welkom in het Pannenkoeken-Paradijs!',
    stars: 3, medal: 'adventure_8_1', medalLabel: 'Salto-Springer',
  },
};

export const LEVEL_8_2 = {
  id: '8-2',
  naam: 'De Pannenkoeken-Toren',

  worldW: 2600,
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

  // Les 2: de pannenkoeken-toren. Tel hardop mee tot 10 en luid de bel —
  // de toren wordt een trap naar de hoge vlag-richel.
  platforms: [
    [0, 660, 2600, 140],
    [2280, 360, 240, 26],    // de vlag-richel: alleen via de toren-trap
  ],

  stapel: {
    x: 1750,
    doel: 10,
    trap: [
      [1960, 560, 120],
      [2110, 460, 120],
    ],
  },

  flippers: [[500, 600]],
  glijbanen: [[850, 500, 1]],

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 1450, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'stomp', x: 1250, y: 612, patrol: [1150, 1400] },
    { type: 'springer', x: 2350, y: 612, patrol: [2260, 2500] },
  ],

  star: { x: 500, y: 240 }, // hoog boven de flipperpan

  goal: { x: 2360, y: 288, value: 10 }, // de vlag toont het bak-doel!

  reward: {
    title: 'Level 8-2 gehaald! 🏆',
    subtitle: 'Precies 10 — jij telt als een echte pannenkoeken-chef!',
    stars: 3, medal: 'adventure_8_2', medalLabel: 'Toren-Chef',
  },
};

export const LEVEL_8_3 = {
  id: '8-3',
  naam: 'Boter-Banen',

  worldW: 3200,
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

  // Les 3 — het snelheidslevel: vier boter-banen achter elkaar die je vol
  // vaart op de stroop-gaten af sturen. Springen op het juiste moment
  // (en over de Grommels heen!) — het snelste level van het spel.
  platforms: [
    [0, 660, 900, 140],
    [1100, 660, 700, 140],
    [2000, 660, 500, 140],
    [2700, 660, 500, 140],
  ],

  water: [
    [900, 690, 200, 110],
    [1800, 690, 200, 110],
    [2500, 690, 200, 110],
  ],

  glijbanen: [
    [300, 550, 1],
    [1200, 550, 1],
    [2050, 400, 1],
    [2750, 300, 1],
  ],

  pickups: [
    { x: 150, y: 600, amount: 1 },
    { x: 1150, y: 600, amount: 1 },
    { x: 2030, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'stomp', x: 600, y: 612, patrol: [500, 750] },     // spring eroverheen tijdens het glijden!
    { type: 'stomp', x: 1500, y: 612, patrol: [1400, 1650] },
    { type: 'springer', x: 2250, y: 612, patrol: [2100, 2400] },
    { type: 'vlieger', x: 1400, y: 280, patrol: [1100, 1800] },
  ],

  // Ster middenin de glij-sprong boven het tweede gat — voor durvers.
  star: { x: 1900, y: 500 },

  // GEHEIM: een Gouden Nul boven het eerste gat (grijp 'm in de vlucht).
  goudenNul: { x: 1000, y: 500 },

  goal: { x: 3120, y: 588, value: 9 },

  reward: {
    title: 'Level 8-3 gehaald! 🏆',
    subtitle: 'Gleden, gesprongen, gevlogen — sneller dan warme stroop!',
    stars: 3, medal: 'adventure_8_3', medalLabel: 'Boter-Bliksem',
  },
};

export const LEVEL_8_4 = {
  id: '8-4',
  naam: 'Het Patroon-Terras',

  worldW: 2800,
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

  // Les 4: patronen! De chef laat je drie patronen afmaken (steeds lastiger:
  // AB → AAB → ABC), daarna nog één keer precies bakken — 12 deze keer.
  platforms: [
    [0, 660, 2800, 140],
    [2400, 300, 220, 26],    // de hoogste vlag-richel van het spel
  ],

  patroon: {
    x: 640,
    rondes: [
      { reeks: ['aardbei', 'banaan', 'aardbei', 'banaan'], opties: ['aardbei', 'banaan'], antwoord: 'aardbei' },
      { reeks: ['room', 'room', 'bes', 'room', 'room'], opties: ['bes', 'room'], antwoord: 'bes' },
      { reeks: ['aardbei', 'bes', 'banaan', 'aardbei', 'bes'], opties: ['banaan', 'aardbei', 'bes'], antwoord: 'banaan' },
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

  flippers: [[1150, 600]],
  glijbanen: [[850, 240, 1]],

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 1450, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'stomp', x: 1000, y: 612, patrol: [900, 1150] },
    { type: 'springer', x: 1450, y: 612, patrol: [1350, 1550] },
    { type: 'stomp', x: 2600, y: 612, patrol: [2500, 2750] }, // bewaakt de vlag-klim
  ],

  star: { x: 1150, y: 230 },

  goal: { x: 2470, y: 228, value: 12 }, // de vlag toont 12 — hoog doortellen!

  reward: {
    title: 'Level 8-4 gehaald! 🏆',
    subtitle: 'Patronen én precies 12 — jouw hoofd is net zo vol als de pannenkoek!',
    stars: 3, medal: 'adventure_8_4', medalLabel: 'Patroon-Meester',
  },
};

export const LEVEL_8_5 = {
  id: '8-5',
  naam: 'De Reuzenflip',

  worldW: 3000,
  worldH: 800,
  killY: 720,
  terrain: 'pannenkoek',
  bg: { top: 0xf3d9a4, bottom: 0xdf9a4a }, // gouden avondlucht — de finale!

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'DE REUZENFLIP! Steek over vóór de pannenkoeken flippen! 🥞⚡',

  // De eindproef: één gigantisch stroop-meer, vier reuzen-pannenkoeken die
  // om de beurt omflippen. Wachten, rennen, springen — timing onder druk.
  platforms: [
    [0, 660, 700, 140],      // start-oever
    [2500, 660, 500, 140],   // eind-oever
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
  ],

  grommels: [
    { type: 'stomp', x: 2700, y: 612, patrol: [2600, 2850] },
  ],

  // Ster boven reuzenflip 2 — grijp 'm midden in de oversteek!
  star: { x: 1350, y: 340 },

  // GEHEIM: een Gouden Nul boven reuzenflip 3.
  goudenNul: { x: 1750, y: 420 },

  goal: { x: 2900, y: 588, value: 10 },

  reward: {
    title: 'WERELD 8 UITGESPEELD! 🏆🥞',
    subtitle: 'Over vier flippende reuzen-pannenkoeken — het hele Paradijs juicht voor jou!',
    stars: 5, medal: 'world8_done', medalLabel: 'Held van het Pannenkoeken-Paradijs',
  },
};

export const WORLD8 = [LEVEL_8_1, LEVEL_8_2, LEVEL_8_3, LEVEL_8_4, LEVEL_8_5];
