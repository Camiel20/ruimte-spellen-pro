// ===== WERELD 16 — DE KLOKKEN-TOREN (leveldata) =====
// We klimmen BINNEN in een reuzenklok! 🕰️ Concept: KLOKKIJKEN (hele en
// halve uren) — hét groep-3-onderwerp. Drie werkwoorden:
//   - DE KOEKOEKSKLOK 🐦 : tik de wijzer naar het goede uur en tik het
//     deurtje — KOEKOEK! (lancering + poort open).
//   - SLINGER-LIANEN 🕰️ : grijp het zwaaiende slinger-gewicht en laat op
//     het goede moment los — timing!
//   - HET REUZEN-TANDWIEL ⚙️ : teken rondjes met je vinger — drie slagen
//     draait de poort open.
// Eindbaas: Baron Tik-Tak — raak de klok die de gevraagde tijd toont.

export const LEVEL_16_1 = {
  id: '16-1',
  naam: 'De Tik-Tak-Hal',

  worldW: 5000,
  worldH: 800,
  killY: 720,
  terrain: 'klok',
  bg: { top: 0x8a6a45, bottom: 0x4a3a26 }, // warm koper → donker hout

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Tik-tak… zet de koekoeksklok op 3 uur! 🕐',

  // Les 1: de koekoeksklok (3 uur) en de eerste slinger over het gat in de
  // vloer. Toetje: tel-wolkjes en een MEER-muur.
  platforms: [
    [0, 660, 2300, 140],
    [2700, 660, 2300, 140],  // na het vloer-gat
    [1550, 460, 180, 26],    // tel-wolk-opstap
  ],

  koekoeken: [
    { x: 900, uur: 3 },
  ],

  slingers: [
    { x: 2500, y: 240, lengte: 260 },
  ],

  telWolken: [[1800, 340, 130]],

  vraagMuren: [
    { x: 3900, kies: 'meer', opties: [9, 4] },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 1900, y: 600, amount: 1 },
    { x: 3700, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 1400, y: 612, patrol: [1300, 1500] },
    { type: 'vlieger', x: 2000, y: 280, patrol: [1800, 2200] },
    { type: 'springer', x: 3170, y: 612, patrol: [3100, 3250] },
    { type: 'stomp', x: 4400, y: 612, patrol: [4300, 4500] },
  ],

  star: { x: 1860, y: 240 },
  goudenNul: { x: 4650, y: 260 },

  goal: { x: 4900, y: 588, value: 10 },

  reward: {
    title: 'Level 16-1 gehaald! 🏆',
    subtitle: 'KOEKOEK! Drie uur precies — de tijd tikt weer!',
    stars: 3, medal: 'adventure_16_1', medalLabel: 'Tik-Tak-Held',
  },
};

export const LEVEL_16_2 = {
  id: '16-2',
  naam: 'De Slinger-Zaal',

  worldW: 5400,
  worldH: 800,
  killY: 720,
  terrain: 'klok',
  bg: { top: 0x7a5c36, bottom: 0x42331f },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Zwaai van slinger naar slinger — laat op tijd los! 🕰️',

  // Les 2: het slinger-lint — twee vloer-gaten met zwaaiende slingers,
  // een fun-slinger op het land, en een koekoek op 7 uur.
  platforms: [
    [0, 660, 1500, 140],
    [1850, 660, 1450, 140],
    [3700, 660, 1700, 140],
  ],

  slingers: [
    { x: 1675, y: 250, lengte: 260 },  // over gat 1
    { x: 2600, y: 300, lengte: 220 },  // de fun-zwaai (ster erboven!)
    { x: 3500, y: 230, lengte: 280 },  // over gat 2
  ],

  koekoeken: [
    { x: 4400, uur: 7 },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2100, y: 600, amount: 1 },
    { x: 4100, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 800, y: 612, patrol: [700, 900] },
    { type: 'springer', x: 2270, y: 612, patrol: [2200, 2350] },
    { type: 'vlieger', x: 3000, y: 260, patrol: [2800, 3200] },
    { type: 'werper', x: 4070, y: 612, patrol: [4000, 4150] }, // gooit radertjes!
  ],

  star: { x: 2600, y: 160 }, // hoog boven de fun-slinger — laat omhoog los!
  goudenNul: { x: 900, y: 300 },

  goal: { x: 5300, y: 588, value: 10 },

  reward: {
    title: 'Level 16-2 gehaald! 🏆',
    subtitle: 'Zwaaien als een klok — wat een timing!',
    stars: 3, medal: 'adventure_16_2', medalLabel: 'Slinger-Aap',
  },
};

export const LEVEL_16_3 = {
  id: '16-3',
  naam: 'Het Tandwiel-Ruim',

  worldW: 5600,
  worldH: 800,
  killY: 720,
  terrain: 'klok',
  bg: { top: 0x6e5436, bottom: 0x3a2c1c },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Draai de reuzen-tandwielen — drie rondjes elk! ⚙️',

  // Les 3: twee reuzen-tandwielen (vinger-rondjes!), een duw-kist naar de
  // ster en een MINDER-muur.
  platforms: [
    [0, 660, 5600, 140],
    [2650, 430, 200, 26],   // ster-richel (via de duw-kist)
  ],

  tandwielen: [
    { x: 1400, y: 400 },
    { x: 3800, y: 380 },
  ],

  duwKisten: [2450],

  vraagMuren: [
    { x: 4800, kies: 'minder', opties: [3, 8] },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2200, y: 600, amount: 1 },
    { x: 4600, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 900, y: 612, patrol: [800, 1000] },
    { type: 'werper', x: 2070, y: 612, patrol: [2000, 2150] },
    { type: 'glijder', x: 3200, y: 612, patrol: [3100, 3300] },
    { type: 'springer', x: 4370, y: 612, patrol: [4300, 4450] },
    { type: 'stomp', x: 5200, y: 612, patrol: [5100, 5300] },
  ],

  star: { x: 2740, y: 340 },
  goudenNul: { x: 700, y: 280 },

  goal: { x: 5500, y: 588, value: 10 },

  reward: {
    title: 'Level 16-3 gehaald! 🏆',
    subtitle: 'Zes hele rondjes gedraaid — de raderen lopen weer!',
    stars: 3, medal: 'adventure_16_3', medalLabel: 'Tandwiel-Draaier',
  },
};

export const LEVEL_16_4 = {
  id: '16-4',
  naam: 'De Toren-Klim',

  worldW: 2400,
  worldH: 1800,
  killY: 1730,
  terrain: 'klok',
  bg: { top: 0x9a7a4a, bottom: 0x2e2214 }, // licht bovenin — klim naar de wijzerplaat!

  start: { x: 90, y: 1560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Klim de toren in — de koekoek geeft je een zetje! 🗼',

  // Les 4: DE VERTICALE KLIM. Beneden een koekoek (9 uur) die de poort
  // opent én je omhoog lanceert; daarna richel voor richel, slinger voor
  // slinger omhoog naar de vlag op de top.
  platforms: [
    [0, 1660, 2400, 140],     // de torenvloer
    [1000, 1480, 170, 26],
    [1400, 1330, 170, 26],
    [1800, 1180, 170, 26],
    [2050, 1010, 190, 26],
    [1650, 860, 170, 26],
    [1250, 710, 170, 26],
    [850, 560, 170, 26],
    [1250, 410, 190, 26],
    [1750, 300, 260, 26],     // de top (vlag!)
    [500, 300, 170, 26],      // ster-richel (via de hoge slinger)
  ],

  koekoeken: [
    { x: 600, uur: 9 },
  ],

  slingers: [
    { x: 700, y: 1200, lengte: 220 },  // opstap-zwaai naar de eerste richels
    { x: 1100, y: 220, lengte: 200 },  // de hoge zwaai (naar de ster!)
  ],

  telWolken: [[420, 1360, 120]],

  pickups: [
    { x: 300, y: 1600, amount: 1 },
    { x: 1085, y: 1440, amount: 1 },
    { x: 1730, y: 1140, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 1500, y: 1612, patrol: [1400, 1600] },
    { type: 'vlieger', x: 1500, y: 900, patrol: [1300, 1700] },
    { type: 'vlieger', x: 1200, y: 480, patrol: [1000, 1400] }, // bewaakt de top!
  ],

  star: { x: 580, y: 220 },
  goudenNul: { x: 2140, y: 930 },

  goal: { x: 1900, y: 228, value: 10 },

  reward: {
    title: 'Level 16-4 gehaald! 🏆',
    subtitle: 'Helemaal naar de top van de toren geklommen!',
    stars: 3, medal: 'adventure_16_4', medalLabel: 'Toren-Klimmer',
  },
};

export const LEVEL_16_5 = {
  id: '16-5',
  naam: 'Baron Tik-Tak',

  worldW: 5200,
  worldH: 800,
  killY: 720,
  terrain: 'klok',
  bg: { top: 0x5a442c, bottom: 0x28200f }, // de tijd staat stil…

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Baron Tik-Tak heeft de tijd stilgezet — zet hem terug! 🕰️',

  // De finale: koekoek + slinger + tandwiel als aanloop, dan de Baron.
  // Per fase: raak de klok die zijn gevraagde tijd toont (heel → half uur).
  platforms: [
    [0, 660, 5200, 140],
    [1550, 430, 180, 26],   // ster-richel
  ],

  koekoeken: [
    { x: 900, uur: 6 },
  ],

  slingers: [
    { x: 1900, y: 260, lengte: 240 },
  ],

  tandwielen: [
    { x: 2800, y: 400 },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2200, y: 600, amount: 1 },
    { x: 3500, y: 600, amount: 1, regen: true }, // snack tussen de wijzertjes
  ],

  grommels: [
    { type: 'stomp', x: 1400, y: 612, patrol: [1300, 1500] },
    { type: 'springer', x: 2370, y: 612, patrol: [2300, 2450] },
    { type: 'werper', x: 3670, y: 612, patrol: [3600, 3750] },
  ],

  boss: {
    x: 4300,
    name: 'Baron Tik-Tak',
    look: 'tiktak',
    stijl: 'klok',
    stages: [
      { doel: 4, opties: [4, 7, 10] },
      { doel: 8, opties: [8, 2, 11] },
      { doel: 7.5, opties: [7.5, 6.5, 4] }, // half 8!
    ],
  },

  star: { x: 1640, y: 350 },
  goudenNul: { x: 2700, y: 250 },

  goal: { x: 5050, y: 588, value: 10 },

  reward: {
    title: 'DE KLOKKEN-TOREN UITGESPEELD! 🏆🕰️',
    subtitle: 'De tijd tikt weer — en Baron Tik-Tak danst mee!',
    stars: 5, medal: 'world16_done', medalLabel: 'Klokken-Meester',
  },
};

export const WORLD16 = [LEVEL_16_1, LEVEL_16_2, LEVEL_16_3, LEVEL_16_4, LEVEL_16_5];
