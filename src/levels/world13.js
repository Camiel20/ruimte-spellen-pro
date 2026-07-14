// ===== WERELD 13 — DE KLEREN-KAST (leveldata) =====
// We stappen een reuzen-kledingkast binnen! 👕 Truien-stapels, wapperend
// wasgoed en sop-badjes. De Sokken-Dief heeft overal één sok van elk paar
// gestolen én de kleren door elkaar gegooid. Drie werkwoorden:
//   - SOKKENPAREN 🧦 : tik twee DEZELFDE sokken — hetzelfde herkennen.
//   - HET MATEN-REK 👕 : hang truien op van klein → groot — ordenen.
//   - DE KNOPEN-WINKEL 🧵 : betaal PRECIES de prijs met munten van 1/2/5.
// Plus de WASLIJN-TOKKELBAAN 🧺 om overheen te zoeven (durf-werkwoord).
// Eindbaas: de Sokken-Dief — vind steeds de tweeling van zijn getoonde sok.

export const LEVEL_13_1 = {
  id: '13-1',
  naam: 'Sokken-Stad',

  worldW: 5000,
  worldH: 800,
  killY: 720,
  terrain: 'kleren',
  bg: { top: 0xbfe3fb, bottom: 0xd8b8e8 }, // zachte kast-gloed → lila truien

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Welkom in de Kleren-Kast! Vind de sokken-tweelingen 🧦',

  // Les 1: sokkenparen (2 paren) en de eerste waslijn-tokkelbaan over het
  // sop-bad. Toetje: een MEER-muur.
  platforms: [
    [0, 660, 2100, 140],     // de sokkenstad
    [2900, 660, 2100, 140],  // de overkant
    [700, 430, 180, 26],     // plank-richel (tel-wolkjes-opstap)
  ],

  water: [[2100, 690, 800, 110]], // het sop-bad — alleen via de waslijn!

  wasLijnen: [
    { x1: 1950, y1: 420, x2: 3050, y2: 460 },
  ],

  sokkenParen: [
    { x: 500, y: 520, patroon: 'strepen' },
    { x: 1250, y: 500, patroon: 'stippen' },
    { x: 1650, y: 520, patroon: 'strepen' },
    { x: 3350, y: 500, patroon: 'stippen' },
  ],

  telWolken: [[950, 320, 130]],

  vraagMuren: [
    { x: 4000, kies: 'meer', opties: [9, 3] },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 1500, y: 600, amount: 1 },
    { x: 3800, y: 600, amount: 1, regen: true }, // vóór de vraagmuur
  ],

  grommels: [
    { type: 'stomp', x: 900, y: 612, patrol: [850, 1050] },
    { type: 'vlieger', x: 1500, y: 300, patrol: [1300, 1700] }, // fladdert als een losgewaaid hemdje
    { type: 'springer', x: 3470, y: 612, patrol: [3400, 3550] },
    { type: 'werper', x: 4400, y: 612, patrol: [4350, 4500] }, // gooit natte sokken!
  ],

  star: { x: 1020, y: 220 },
  goudenNul: { x: 4650, y: 260 },

  goal: { x: 4900, y: 588, value: 10 },

  reward: {
    title: 'Level 13-1 gehaald! 🏆',
    subtitle: 'Alle sokken-tweelingen weer samen — wat een opruimer!',
    stars: 3, medal: 'adventure_13_1', medalLabel: 'Sokken-Vinder',
  },
};

export const LEVEL_13_2 = {
  id: '13-2',
  naam: 'De Waslijn-Weide',

  worldW: 5400,
  worldH: 800,
  killY: 720,
  terrain: 'kleren',
  bg: { top: 0xbfe3fb, bottom: 0xcfc0e8 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Tokkel-tijd: grijp de hangertjes en zoef over het sop! 🧺',

  // Les 2: het waslijn-lint — twee sop-baden met tokkellijnen, een hoge
  // bonus-lijn naar de ster, sokkenparen en een portaal-som.
  platforms: [
    [0, 660, 1400, 140],
    [2200, 660, 1200, 140],  // het midden-eiland
    [4000, 660, 1400, 140],  // de overkant
    [2450, 430, 180, 26],    // opstapje naar de hoge bonus-lijn
  ],

  water: [[1400, 690, 800, 110], [3400, 690, 600, 110]],

  wasLijnen: [
    { x1: 1250, y1: 400, x2: 2350, y2: 440 },  // over sop-bad 1
    { x1: 3250, y1: 400, x2: 4150, y2: 440 },  // over sop-bad 2
    { x1: 2540, y1: 300, x2: 3200, y2: 250 },  // de hoge bonus-lijn (ster!)
  ],

  sokkenParen: [
    { x: 500, y: 520, patroon: 'zigzag' },
    { x: 1000, y: 500, patroon: 'hartjes' },
    { x: 2800, y: 500, patroon: 'zigzag' },
    { x: 4350, y: 520, patroon: 'hartjes' },
  ],

  portalen: [
    { x: 4550, doel: 8, opties: [[5, 3], [4, 2], [6, 3]] },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2350, y: 600, amount: 1 },
    { x: 4300, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 700, y: 612, patrol: [650, 850] },
    { type: 'vlieger', x: 1800, y: 300, patrol: [1600, 2000] },
    { type: 'springer', x: 2870, y: 612, patrol: [2800, 2950] },
    { type: 'werper', x: 4270, y: 612, patrol: [4200, 4350] },
  ],

  star: { x: 3100, y: 180 },
  goudenNul: { x: 800, y: 300 },

  goal: { x: 5300, y: 588, value: 10 },

  reward: {
    title: 'Level 13-2 gehaald! 🏆',
    subtitle: 'Over alle waslijnen gezoefd — wat een durfal!',
    stars: 3, medal: 'adventure_13_2', medalLabel: 'Waslijn-Held',
  },
};

export const LEVEL_13_3 = {
  id: '13-3',
  naam: 'Het Maten-Magazijn',

  worldW: 5600,
  worldH: 800,
  killY: 720,
  terrain: 'kleren',
  bg: { top: 0xbfe3fb, bottom: 0xc8b0d8 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Alles door elkaar! Hang de truien op: klein → groot 👕',

  // Les 3: ORDENEN — twee maten-rekken (eerst 3, dan 4 truien), een
  // duw-kist naar de ster, en een MINDER-muur als toetje.
  platforms: [
    [0, 660, 5600, 140],
    [600, 420, 180, 26],    // gouden-nul-richel
    [2500, 430, 200, 26],   // ster-richel (via de duw-kist)
  ],

  maatRekken: [
    { x: 1400, aantal: 3 },
    { x: 3600, aantal: 4 },
  ],

  duwKisten: [2300],

  sokkenParen: [
    { x: 2900, y: 500, patroon: 'sterren' },
    { x: 4600, y: 500, patroon: 'sterren' },
  ],

  vraagMuren: [
    { x: 4900, kies: 'minder', opties: [2, 8] },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2100, y: 600, amount: 1 },
    { x: 4700, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 800, y: 612, patrol: [750, 950] },
    { type: 'werper', x: 1970, y: 612, patrol: [1900, 2050] },
    { type: 'glijder', x: 3100, y: 612, patrol: [3000, 3200] },
    { type: 'springer', x: 4370, y: 612, patrol: [4300, 4450] },
    { type: 'stomp', x: 5200, y: 612, patrol: [5100, 5300] },
  ],

  star: { x: 2580, y: 340 },
  goudenNul: { x: 690, y: 300 },

  goal: { x: 5500, y: 588, value: 10 },

  reward: {
    title: 'Level 13-3 gehaald! 🏆',
    subtitle: 'Klein, middel, groot — jij ziet het meteen!',
    stars: 3, medal: 'adventure_13_3', medalLabel: 'Maten-Meester',
  },
};

export const LEVEL_13_4 = {
  id: '13-4',
  naam: 'De Knopen-Winkel',

  worldW: 5600,
  worldH: 800,
  killY: 720,
  terrain: 'kleren',
  bg: { top: 0xbfe3fb, bottom: 0xd0a8c8 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'De winkel is open! Betaal precies met knopen-munten 🧵',

  // Les 4: BETALEN — twee knopen-winkels (prijs 7, dan 12), een
  // plank-klim met tel-wolkjes naar de ster, en een hoge waslijn omlaag.
  platforms: [
    [0, 660, 5600, 140],
    [2150, 480, 180, 26],   // kast-plank 1
    [2450, 340, 180, 26],   // kast-plank 2
    [2750, 200, 200, 26],   // kast-plank 3 (de ster!)
  ],

  knopenWinkels: [
    { x: 1200, prijs: 7 },
    { x: 4400, prijs: 12 },
  ],

  wasLijnen: [
    { x1: 2950, y1: 220, x2: 3900, y2: 320 }, // vanaf de hoogste plank omlaag zoeven
  ],

  sokkenParen: [
    { x: 700, y: 520, patroon: 'blokjes' },
    { x: 3500, y: 500, patroon: 'blokjes' },
  ],

  telWolken: [[1900, 560, 120]],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2000, y: 600, amount: 1 },
    { x: 4200, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 800, y: 612, patrol: [700, 900] },
    { type: 'springer', x: 1770, y: 612, patrol: [1700, 1850] },
    { type: 'vlieger', x: 2600, y: 120, patrol: [2400, 2800] }, // bewaakt de ster!
    { type: 'werper', x: 3670, y: 612, patrol: [3600, 3750] },
    { type: 'stomp', x: 5100, y: 612, patrol: [5000, 5200] },
  ],

  star: { x: 2850, y: 120 },
  goudenNul: { x: 5250, y: 280 },

  goal: { x: 5500, y: 588, value: 10 },

  reward: {
    title: 'Level 13-4 gehaald! 🏆',
    subtitle: 'Precies betaald met 1, 2 en 5 — een echte winkel-baas!',
    stars: 3, medal: 'adventure_13_4', medalLabel: 'Knopen-Koopman',
  },
};

export const LEVEL_13_5 = {
  id: '13-5',
  naam: 'De Sokken-Dief',

  worldW: 5200,
  worldH: 800,
  killY: 720,
  terrain: 'kleren',
  bg: { top: 0xa8c8e8, bottom: 0x9888b8 }, // achterin de kast is het schemerig…

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Daar is de Sokken-Dief — vind de tweeling van zijn sok! 🧦',

  // De finale: een aanloop met álle werkwoorden (paar, waslijn, maten-rek)
  // en dan de Sokken-Dief: hij toont een sok in zijn denk-wolkje — raak de
  // TWEELING tussen de zwevende sokken en hij laat een zak sokken los.
  platforms: [
    [0, 660, 1600, 140],
    [2400, 660, 2800, 140],
    [1100, 430, 180, 26],   // ster-richel
  ],

  water: [[1600, 690, 800, 110]],

  wasLijnen: [
    { x1: 1450, y1: 400, x2: 2550, y2: 440 },
  ],

  maatRekken: [
    { x: 3000, aantal: 3 },
  ],

  sokkenParen: [
    { x: 500, y: 520, patroon: 'hartjes' },
    { x: 900, y: 500, patroon: 'hartjes' },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2550, y: 600, amount: 1 },
    { x: 3500, y: 600, amount: 1, regen: true }, // snack tussen de natte sokken
  ],

  grommels: [
    { type: 'stomp', x: 700, y: 612, patrol: [600, 800] },
    { type: 'springer', x: 2770, y: 612, patrol: [2700, 2850] },
    { type: 'werper', x: 3570, y: 612, patrol: [3500, 3650] },
  ],

  boss: {
    x: 4300,
    name: 'De Sokken-Dief',
    look: 'sokdief',
    stijl: 'paar',
    stages: [
      { doel: 'strepen', opties: ['strepen', 'stippen', 'zigzag'] },
      { doel: 'sterren', opties: ['hartjes', 'sterren', 'stippen'] },
      { doel: 'blokjes', opties: ['zigzag', 'strepen', 'blokjes'] },
    ],
  },

  star: { x: 1180, y: 350 },
  goudenNul: { x: 2700, y: 250 },

  goal: { x: 5050, y: 588, value: 10 },

  reward: {
    title: 'DE KLEREN-KAST UITGESPEELD! 🏆👕',
    subtitle: 'De Sokken-Dief deelt nu sokken uit — dankzij jou!',
    stars: 5, medal: 'world13_done', medalLabel: 'Sokken-Held',
  },
};

export const WORLD13 = [LEVEL_13_1, LEVEL_13_2, LEVEL_13_3, LEVEL_13_4, LEVEL_13_5];
