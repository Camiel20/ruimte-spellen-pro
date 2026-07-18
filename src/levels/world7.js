// ===== WERELD 7 — DE PIZZA-VULKAAN (leveldata) =====
// Adrians eigen wens: een pizza-wereld! Kaas-heuvels, een rivier van
// tomatensaus, salami-stapstenen en bovenop de berg de grote oven-vulkaan.
// Concept: EERLIJK DELEN (de voorloper van breuken) + toppings tellen.
// Werkwoorden: saus-geisers (gelanceerd worden op het juiste moment),
// kantel-punten (pizzapunt-platforms die omklappen — doorspringen!) en de
// Pizza-Bakkerij (toppings verzamelen → eerlijk verdelen → de oven bakt
// een brug van pizzapunten).
//
// SPRINT 2 (2026-07-07): alle levels bijgetrokken naar de norm
// (5200-5600px, 4-6 beats; baas-level 4800 met volwaardige aanloop).

export const LEVEL_7_1 = {
  id: '7-1',
  naam: 'De Kaas-Heuvels',

  worldW: 5200,
  worldH: 800,
  killY: 720,
  terrain: 'pizza',
  bg: { top: 0x8fd3ff, bottom: 0xf3cf7a }, // zomerlucht → kaas-goud

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'De vlag staat HOOG — laat de saus-geisers je lanceren! 🍕⛲',

  // Les 1: de saus-geiser. Vijf lanceringen, steeds nét anders getimed,
  // een MEER-vraagmuur halverwege en de vlag op een hoge eind-richel.
  platforms: [
    [0, 660, 5200, 140],     // doorlopende kaas-vlakte
    [560, 430, 190, 26],     // hoge richel boven geiser 1
    [1330, 380, 190, 26],    // nóg hoger boven geiser 2
    [2050, 430, 190, 26],    // richel boven geiser 3
    [3500, 380, 190, 26],    // richel boven geiser 4 (met een bolletje)
    [4940, 400, 240, 26],    // de EIND-RICHEL met de vlag (alleen via geiser 5)
  ],

  geisers: [
    { x: 470, hoogte: 300 },
    { x: 1240, hoogte: 350, offset: 900 },
    { x: 1960, hoogte: 300, offset: 1800 },
    { x: 3410, hoogte: 340, offset: 500 },
    { x: 4860, hoogte: 340, offset: 600 },  // de lancering naar de vlag
  ],

  // Kopstoot tegen het goede blok: waar is MEER?
  vraagMuren: [
    { x: 2550, kies: 'meer', opties: [9, 6] },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 650, y: 370, amount: 1 },   // op de richel
    { x: 1420, y: 320, amount: 1 },
    { x: 1750, y: 600, amount: 1 },
    { x: 2280, y: 600, amount: 1, regen: true }, // vóór de vraagmuur
    { x: 3590, y: 320, amount: 1 },  // op richel 4
    { x: 4200, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'stomp', x: 900, y: 612, patrol: [800, 1080] },
    { type: 'werper', x: 1700, y: 612, patrol: [1600, 1850] }, // gooit tomaten!
    { type: 'springer', x: 2850, y: 612, patrol: [2750, 3000] },
    { type: 'glijder', x: 3800, y: 612, patrol: [3700, 3950] },
    { type: 'stomp', x: 4400, y: 612, patrol: [4300, 4500] },
  ],

  // Ster hoog boven de middelste geiser — timing!
  star: { x: 1425, y: 250 },

  goal: { x: 5060, y: 328, value: 7 }, // op de hoge eind-richel!

  reward: {
    title: 'Level 7-1 gehaald! 🏆',
    subtitle: 'Gelanceerd door tomatensaus — welkom in de Pizza-Vulkaan!',
    stars: 3, medal: 'adventure_7_1', medalLabel: 'Saus-Springer',
  },
};

export const LEVEL_7_2 = {
  id: '7-2',
  naam: 'De Pizza-Bakkerij',

  worldW: 5400,
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

  // BAKKERIJ = DE STER (rework 2026-07-18: geisers eruit — die horen in 7-1;
  // hier draait álles om eerlijk delen). Eén groot saus-ravijn (te breed om te
  // springen): alleen de gebakken pizzapunten-brug komt eroverheen. Daarna een
  // lange overkant met kantel-punten naar de Gouden Nul, een hoge richel en een
  // MINDER-vraagmuur vlak voor de vlag. De topping-richels haal je met je
  // dubbelsprong (geen geiser nodig).
  platforms: [
    [0, 660, 1500, 140],     // bakkerij-kant
    [300, 470, 170, 26],     // richel 1 (topping)
    [700, 400, 170, 26],     // richel 2 (topping, hoog)
    [1050, 470, 170, 26],    // richel 3 (topping)
    [2360, 660, 3040, 140],  // overkant — kantels, vraagmuur, vlag
    [3490, 430, 190, 26],    // hoge richel op de overkant (dubbelsprong)
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

  // Kantel-punten: eerst naar de Gouden Nul, verderop een tweede paar.
  kantels: [
    [2760, 540, 130],
    [2960, 480, 130],
    [3950, 560, 130],
    [4150, 500, 130],
  ],

  // …en een MINDER-vraagmuur vlak voor de vlag.
  vraagMuren: [
    { x: 4800, kies: 'minder', opties: [3, 8] },
  ],

  pickups: [
    { x: 460, y: 600, amount: 1 },
    { x: 1230, y: 600, amount: 1 },
    { x: 2550, y: 600, amount: 1, regen: true },
    { x: 3580, y: 370, amount: 1 },              // op de hoge richel
    { x: 4600, y: 600, amount: 1, regen: true }, // vóór de vraagmuur
  ],

  grommels: [
    { type: 'stomp', x: 660, y: 612, patrol: [560, 800] },
    { type: 'vlieger', x: 800, y: 260, patrol: [400, 1200] }, // bewaakt de hoge toppings
    { type: 'stomp', x: 2650, y: 612, patrol: [2550, 2800] },
    { type: 'werper', x: 3800, y: 612, patrol: [3700, 3900] },
    { type: 'springer', x: 4450, y: 612, patrol: [4350, 4550] },
  ],

  // Ster boven de hoogste richel.
  star: { x: 785, y: 270 },

  // GEHEIM: een Gouden Nul hoog boven de kantel-punten op de overkant.
  goudenNul: { x: 2960, y: 380 },

  goal: { x: 5250, y: 588, value: 3 }, // 3 = evenveel op elke pizza!

  reward: {
    title: 'Level 7-2 gehaald! 🏆',
    subtitle: '3 en 3 — eerlijk gedeeld! De lekkerste brug ooit gebakken.',
    stars: 3, medal: 'adventure_7_2', medalLabel: 'Pizza-Bakker',
  },
};

export const LEVEL_7_3 = {
  id: '7-3',
  naam: 'Kantel-Canyon',

  worldW: 5400,
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

  // KANTEL = DE STER (rework 2026-07-18: geisers eruit — pure kantel-canyon).
  // DRIE saus-kloven, steeds hoger en verder uit elkaar. Tussendoor een
  // geef-plaat, een ster op een richel boven het midden-eiland en een
  // bonus-richel aan het eind (allebei met je dubbelsprong te halen).
  platforms: [
    [0, 660, 700, 140],       // startvlakte
    [1310, 660, 580, 140],    // midden-eiland 1
    [1490, 450, 170, 26],     // richel boven het eiland (met de ster)
    [2470, 660, 900, 140],    // midden-vlakte (met geef-plaat)
    [4030, 660, 1370, 140],   // eind-vlakte
    [4390, 430, 170, 26],     // bonus-richel (dubbelsprong)
  ],

  water: [
    [700, 690, 610, 110],
    [1890, 690, 580, 110],
    [3370, 690, 660, 110],
  ],

  kantels: [
    [800, 610, 130],    // kloof 1: drie kantel-punten
    [1000, 560, 130],
    [1200, 610, 130],
    [1990, 600, 130],   // kloof 2: hoger en verder uit elkaar
    [2190, 540, 130],
    [2380, 600, 130],
    [3460, 590, 120],   // kloof 3: de proef!
    [3660, 530, 120],
    [3860, 590, 120],
  ],

  // Geef-plaat op de midden-vlakte: geef 3 blokjes weg (aftrekken met je lijf).
  plates: [
    { x: 2900, doel: 3 },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 1450, y: 600, amount: 1 },
    { x: 1760, y: 600, amount: 1 },
    { x: 2600, y: 600, amount: 1, regen: true }, // groei-hulp vóór de plaat
    { x: 4480, y: 370, amount: 1 },              // op de bonus-richel
  ],

  grommels: [
    { type: 'stomp', x: 470, y: 612, patrol: [370, 620] },
    { type: 'stomp', x: 1600, y: 612, patrol: [1400, 1800] },
    { type: 'springer', x: 2650, y: 612, patrol: [2550, 2800] },
    { type: 'werper', x: 3150, y: 612, patrol: [3050, 3280] }, // gooit tomaten!
    { type: 'glijder', x: 4700, y: 612, patrol: [4600, 4850] },
    { type: 'stomp', x: 5100, y: 612, patrol: [5000, 5250] },
  ],

  // Ster op de richel boven het midden-eiland (dubbelsprong).
  star: { x: 1575, y: 405 },

  goal: { x: 5320, y: 588, value: 6 },

  reward: {
    title: 'Level 7-3 gehaald! 🏆',
    subtitle: 'Sneller dan smeltende kaas — geen punt kan jou laten vallen!',
    stars: 3, medal: 'adventure_7_3', medalLabel: 'Punten-Danser',
  },
};

export const LEVEL_7_4 = {
  id: '7-4',
  naam: 'Het Rollende Kaaswiel',

  worldW: 5600,
  worldH: 800,
  killY: 720,
  terrain: 'pizza',
  bg: { top: 0x86c8f5, bottom: 0xdf9a30 }, // dieper de vulkaan in

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'RENNEN! Een reuzen-kaaswiel rolt achter je aan! 🧀💨',

  // BEWEGING-LEVEL (rework 2026-07-18: was de vormeloze "meesterproef-mix" met
  // geiser+kantel+bakkerij+2 portalen). Nu één duidelijke ruggengraat: RENNEN
  // voor een rollend reuzen-kaaswiel, dan een koord-oversteek over het saus-
  // ravijn, één dubbel-portaal (5+5=10) als reken-hoogtepunt, en een tel-wolken-
  // klim naar de ster. Geen geiser hier — die horen in 7-1.
  platforms: [
    [0, 660, 3400, 140],      // de renbaan (kaaswiel-achtervolging)
    [3700, 660, 1900, 140],   // de overkant (na het koord)
  ],

  water: [[3400, 690, 300, 110]], // saus-ravijn onder het koord

  achtervolgingen: [
    { spawnX: 400, triggerX: 900, endX: 3100, skin: 'kaaswiel' }, // RENNEN!
  ],

  koorden: [[3380, 3740, 480]], // koord-oversteek over het ravijn

  // Eén dubbel-raadsel als reken-hoogtepunt: welke som maakt 10?
  portalen: [
    { x: 4300, doel: 10, opties: [[5, 5], [4, 5], [6, 5]] },
  ],

  telWolken: [[4850, 460, 120], [5050, 360, 120]], // wolken-klim naar de ster

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 600, y: 600, amount: 1 },
    { x: 3800, y: 600, amount: 1 },              // na het koord
    { x: 4150, y: 600, amount: 1, regen: true }, // vóór het portaal
  ],

  grommels: [
    { type: 'stomp', x: 650, y: 612, patrol: [550, 800] }, // vóór de achtervolging
    { type: 'vlieger', x: 2100, y: 300, patrol: [1800, 2400] }, // vliegende tomaat
    { type: 'springer', x: 3950, y: 612, patrol: [3850, 4100] },
    { type: 'werper', x: 5000, y: 612, patrol: [4900, 5150] }, // gooit tomaten!
  ],

  // Ster bovenop de tel-wolken-klim; Gouden Nul hoog boven het koord.
  star: { x: 5100, y: 310 },
  goudenNul: { x: 3560, y: 380 },

  goal: { x: 5500, y: 588, value: 10 },

  reward: {
    title: 'Level 7-4 gehaald! 🏆',
    subtitle: 'Het kaaswiel voorbij gerend — en 5+5=10 op de koop toe!',
    stars: 3, medal: 'adventure_7_4', medalLabel: 'Kaas-Renner',
  },
};

export const LEVEL_7_5 = {
  id: '7-5',
  naam: 'De Kaas-Grommel',

  worldW: 4800,
  worldH: 800,
  killY: 720,
  terrain: 'pizza',
  bg: { top: 0xf0b24a, bottom: 0xc96a2e }, // gloeiend oven-licht — spannend!

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Naar het hol van de Kaas-Grommel — over de kantel-punten! 🧀',

  // Volwaardige aanloop met de vulkaan-werkwoorden (kantel-kloof, geiser-
  // richel, vraagmuur) en dan het VANG-gevecht: de Kaas-Grommel strooit de
  // gestolen toppings — vang er PRECIES genoeg terug (tellen onder druk!)
  // terwijl de kaaswielen op je af rollen.
  platforms: [
    [0, 660, 1200, 140],      // startvlakte
    [1810, 660, 700, 140],    // geiser-veld
    [2190, 420, 170, 26],     // richel boven de geiser
    [2510, 660, 2290, 140],   // de baas-arena
  ],

  water: [[1200, 690, 610, 110]], // saus-kloof met kantel-punten

  kantels: [
    [1300, 600, 130],
    [1500, 540, 130],
    [1700, 600, 130],
  ],

  geisers: [
    { x: 2100, hoogte: 300, offset: 400 },
  ],

  vraagMuren: [
    { x: 2900, kies: 'meer', opties: [7, 4] },
  ],

  pickups: [
    { x: 240, y: 600, amount: 1 },
    { x: 500, y: 600, amount: 1 },
    { x: 2280, y: 360, amount: 1 },              // op de geiser-richel
    { x: 2700, y: 600, amount: 1, regen: true }, // vóór de vraagmuur
    { x: 3100, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'werper', x: 500, y: 612, patrol: [400, 650] }, // gooit tomaten mee!
    { type: 'stomp', x: 900, y: 612, patrol: [800, 1050] },
    { type: 'springer', x: 3150, y: 612, patrol: [3080, 3250] },
  ],

  // HET VANG-GEVECHT (stijl 'vang'): geen bouw-overlay — alles in de arena.
  boss: {
    x: 3600,
    name: 'Kaas-Grommel',
    look: 'kaas',
    stijl: 'vang',
    stages: [
      { doel: 4 },
      { doel: 6 },
      { doel: 8 },
    ],
  },

  // Verstopte ster boven de geiser-richel!
  star: { x: 2280, y: 300 },

  goal: { x: 4650, y: 588, value: 5 },

  reward: {
    title: 'WERELD 7 UITGESPEELD! 🏆🍕',
    subtitle: 'De Kaas-Grommel deelt nu eerlijk — en trakteert het hele dorp op pizza!',
    stars: 5, medal: 'world7_done', medalLabel: 'Held van de Pizza-Vulkaan',
  },
};

export const WORLD7 = [LEVEL_7_1, LEVEL_7_2, LEVEL_7_3, LEVEL_7_4, LEVEL_7_5];
