// ===== WERELD 7 — DE PIZZA-VULKAAN (leveldata) =====
// Adrians eigen wens: een pizza-wereld! Kaas-heuvels, een rivier van
// tomatensaus, salami-stapstenen en bovenop de berg de grote oven-vulkaan.
// Concept: EERLIJK DELEN (de voorloper van breuken) + toppings tellen.
// Nieuwe werkwoorden: saus-geisers (omhoog gelanceerd worden op het juiste
// moment), kantel-punten (pizzapunt-platforms die omklappen — doorspringen!)
// en de Pizza-Bakkerij (toppings verzamelen → eerlijk over de pizza's
// verdelen → de oven bakt een brug van pizzapunten).

export const LEVEL_7_1 = {
  id: '7-1',
  naam: 'De Kaas-Heuvels',

  worldW: 2800,
  worldH: 800,
  killY: 720,
  terrain: 'pizza',
  bg: { top: 0x8fd3ff, bottom: 0xf3cf7a }, // zomerlucht → kaas-goud

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Welkom in de Pizza-Vulkaan! Spring op de saus-geisers omhoog! 🍕⛲',

  // Les 1: de saus-geiser. Hoge kaas-richels die je alleen haalt door op
  // het juiste moment in de geiser-zuil te staan.
  platforms: [
    [0, 660, 2800, 140],     // doorlopende kaas-vlakte
    [560, 430, 190, 26],     // hoge richel boven geiser 1
    [1330, 380, 190, 26],    // nóg hoger boven geiser 2
    [2050, 430, 190, 26],    // richel boven geiser 3
  ],

  geisers: [
    { x: 470, hoogte: 300 },
    { x: 1240, hoogte: 350, offset: 900 },
    { x: 1960, hoogte: 300, offset: 1800 },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 650, y: 370, amount: 1 },   // op de richel
    { x: 1420, y: 320, amount: 1 },
    { x: 1750, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'stomp', x: 900, y: 612, patrol: [800, 1080] },
    { type: 'stomp', x: 1700, y: 612, patrol: [1600, 1850] },
    { type: 'springer', x: 2400, y: 612, patrol: [2300, 2550] },
  ],

  // Ster hoog boven de middelste geiser — timing!
  star: { x: 1425, y: 250 },

  goal: { x: 2720, y: 588, value: 7 },

  reward: {
    title: 'Level 7-1 gehaald! 🏆',
    subtitle: 'Gelanceerd door tomatensaus — welkom in de Pizza-Vulkaan!',
    stars: 3, medal: 'adventure_7_1', medalLabel: 'Saus-Springer',
  },
};

export const LEVEL_7_2 = {
  id: '7-2',
  naam: 'De Pizza-Bakkerij',

  worldW: 3000,
  worldH: 800,
  killY: 720,
  terrain: 'pizza',
  bg: { top: 0x8fd3ff, bottom: 0xf0b24a },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Zoek 6 toppings en verdeel ze EERLIJK — de oven bakt een brug! 🍕🔥',

  // Eén groot saus-ravijn (te breed om te springen): alleen de gebakken
  // pizzapunten-brug komt eroverheen. De 6 toppings liggen verstopt op
  // richels en achter Grommels.
  platforms: [
    [0, 660, 1500, 140],     // bakkerij-kant
    [300, 470, 170, 26],     // richel 1 (topping)
    [700, 400, 170, 26],     // richel 2 (topping, hoog)
    [1050, 470, 170, 26],    // richel 3 (topping)
    [2360, 660, 640, 140],   // overkant — landing + vlag
  ],

  water: [[1500, 690, 860, 110]], // de tomatensaus-rivier onder de brug

  bakkerij: {
    x: 1380,
    pizzas: 2,
    per: 3,
    toppings: [
      [180, 600], [560, 600], [900, 600],     // op de grond
      [385, 410], [785, 340], [1135, 410],    // op de richels
    ],
    brug: [1500, 660, 860],
  },

  geisers: [
    { x: 240, hoogte: 260 },   // helpt je naar richel 1
  ],

  pickups: [
    { x: 460, y: 600, amount: 1 },
    { x: 1230, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'stomp', x: 660, y: 612, patrol: [560, 800] },
    { type: 'vlieger', x: 800, y: 260, patrol: [400, 1200] }, // bewaakt de hoge toppings
    { type: 'stomp', x: 2650, y: 612, patrol: [2550, 2800] },
  ],

  // Ster boven de hoogste richel.
  star: { x: 785, y: 270 },

  // GEHEIM: een Gouden Nul boven het saus-ravijn — alleen via de brug + sprong.
  goudenNul: { x: 1930, y: 520 },

  goal: { x: 2920, y: 588, value: 3 }, // 3 = evenveel op elke pizza!

  reward: {
    title: 'Level 7-2 gehaald! 🏆',
    subtitle: '3 en 3 — eerlijk gedeeld! De lekkerste brug ooit gebakken.',
    stars: 3, medal: 'adventure_7_2', medalLabel: 'Pizza-Bakker',
  },
};

export const LEVEL_7_3 = {
  id: '7-3',
  naam: 'Kantel-Canyon',

  worldW: 2900,
  worldH: 800,
  killY: 720,
  terrain: 'pizza',
  bg: { top: 0x8fd3ff, bottom: 0xe8a83e },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'De pizzapunten kantelen — blijf doorspringen! 🍕⏱️',

  // Les 3: kantel-punten. Twee saus-kloven, alleen over te steken via
  // pizzapunten die na je landing omklappen. Niet blijven staan!
  platforms: [
    [0, 660, 700, 140],       // startvlakte
    [1310, 660, 580, 140],    // midden-eiland
    [2470, 660, 430, 140],    // eind-vlakte
  ],

  water: [[700, 690, 610, 110], [1890, 690, 580, 110]], // saus-kloven

  kantels: [
    [800, 610, 130],    // kloof 1: drie kantel-punten
    [1000, 560, 130],
    [1200, 610, 130],
    [1990, 600, 130],   // kloof 2: hoger en verder uit elkaar
    [2190, 540, 130],
    [2380, 600, 130],
  ],

  geisers: [
    { x: 1600, hoogte: 320 },  // midden-eiland: lancering naar de ster
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 1450, y: 600, amount: 1 },
    { x: 1760, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'stomp', x: 470, y: 612, patrol: [370, 620] },
    { type: 'stomp', x: 1600, y: 612, patrol: [1400, 1800] },
    { type: 'springer', x: 2650, y: 612, patrol: [2550, 2800] },
  ],

  // Ster hoog boven de geiser op het midden-eiland.
  star: { x: 1600, y: 260 },

  goal: { x: 2820, y: 588, value: 6 },

  reward: {
    title: 'Level 7-3 gehaald! 🏆',
    subtitle: 'Sneller dan smeltende kaas — geen punt kan jou laten vallen!',
    stars: 3, medal: 'adventure_7_3', medalLabel: 'Punten-Danser',
  },
};

export const LEVEL_7_4 = {
  id: '7-4',
  naam: 'De Oven-Klim',

  worldW: 3100,
  worldH: 800,
  killY: 720,
  terrain: 'pizza',
  bg: { top: 0x86c8f5, bottom: 0xdf9a30 }, // dieper de vulkaan in

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'De grote klim naar de oven — geisers, punten én een dubbel-raadsel! 🌋',

  // Meesterproef: alles samen. Geisers + kantel-punten + een portaal-raadsel
  // met DUBBELEN (4+4=8 — eerlijk delen andersom!) en een tweede bakkerij.
  platforms: [
    [0, 660, 1250, 140],      // aanloop met portalen
    [1250, 660, 550, 140],    // geiser-plein
    [1050, 430, 170, 26],     // richel boven geiser (topping-plek)
    [1550, 400, 170, 26],     // hoge richel (topping-plek)
    [2560, 660, 540, 140],    // top-vlakte — de oven staat hier al te roken
  ],

  water: [[1800, 690, 760, 110]], // het laatste saus-ravijn voor de top

  // Dubbel-raadsel: welk portaal maakt 8? (4+4 — dubbelen!)
  portalen: [
    { x: 400, doel: 8, opties: [[4, 4], [5, 4], [3, 4]] },
  ],

  geisers: [
    { x: 960, hoogte: 300, offset: 400 },
    { x: 1460, hoogte: 340, offset: 1200 },
  ],

  kantels: [
    [1730, 560, 120],   // opstapje richting de bakkerij-kant
  ],

  bakkerij: {
    x: 1300,
    pizzas: 2,
    per: 4,             // stapje moeilijker: 8 toppings, 4 op elk
    toppings: [
      [240, 600], [700, 600], [880, 600], [1180, 600],
      [1135, 370], [1635, 340],           // op de richels (geiser-werk!)
      [1385, 600], [1730, 500],           // bij het plein + op de kantel-punt
    ],
    brug: [1800, 660, 760],
  },

  pickups: [
    { x: 320, y: 600, amount: 1 },
    { x: 1080, y: 600, amount: 1 },
    { x: 2700, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'stomp', x: 700, y: 612, patrol: [600, 850] },
    { type: 'stomp', x: 1500, y: 612, patrol: [1350, 1700] },
    { type: 'vlieger', x: 1350, y: 250, patrol: [1000, 1700] },
    { type: 'springer', x: 2800, y: 612, patrol: [2700, 2950] },
  ],

  // Ster boven de hoogste richel.
  star: { x: 1635, y: 270 },

  goal: { x: 3020, y: 588, value: 8 },

  reward: {
    title: 'Level 7-4 gehaald! 🏆',
    subtitle: '4 + 4 = 8, eerlijk gedeeld én de top bereikt — wat een klim!',
    stars: 3, medal: 'adventure_7_4', medalLabel: 'Oven-Klimmer',
  },
};

export const LEVEL_7_5 = {
  id: '7-5',
  naam: 'De Kaas-Grommel',

  worldW: 2000,
  worldH: 800,
  killY: 720,
  terrain: 'pizza',
  bg: { top: 0xf0b24a, bottom: 0xc96a2e }, // gloeiend oven-licht — spannend!

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'De Kaas-Grommel heeft alle toppings gestolen! Verdeel ze eerlijk terug — ontwijk de kaaswielen! 🧀',

  platforms: [
    [0, 660, 2000, 140],
  ],

  pickups: [
    { x: 240, y: 600, amount: 1 },
    { x: 500, y: 600, amount: 1 },
    { x: 760, y: 600, amount: 1 },
    { x: 1020, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'stomp', x: 520, y: 612, patrol: [400, 700] },
    { type: 'stomp', x: 950, y: 612, patrol: [820, 1150] },
  ],

  // Eerlijk-delen-fasen: "6 salami's, 2 pizza's → 3 op elk!" — elke fase
  // geeft de gestolen buit, jij bouwt het eerlijke deel. De kaaswielen
  // rollen bijna zo snel als de vuurballen van Wereld 5.
  boss: {
    x: 1500,
    name: 'Kaas-Grommel',
    look: 'kaas',
    stages: [
      { doel: 3, blocks: [4, 2] },   // 6 gestolen → 3 op elke pizza
      { doel: 4, blocks: [5, 3] },   // 8 gestolen → 4 op elk
      { doel: 5, blocks: [6, 4] },   // 10 gestolen → 5 op elk
    ],
  },

  // Verstopte ster boven de arena — grijp 'm tussen de kaaswielen door!
  star: { x: 880, y: 440 },

  goal: { x: 1850, y: 588, value: 5 },

  reward: {
    title: 'WERELD 7 UITGESPEELD! 🏆🍕',
    subtitle: 'De Kaas-Grommel deelt nu eerlijk — en trakteert het hele dorp op pizza!',
    stars: 5, medal: 'world7_done', medalLabel: 'Held van de Pizza-Vulkaan',
  },
};

export const WORLD7 = [LEVEL_7_1, LEVEL_7_2, LEVEL_7_3, LEVEL_7_4, LEVEL_7_5];
