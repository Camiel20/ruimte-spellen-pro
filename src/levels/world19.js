// ===== WERELD 19 — HET SPOOK-SLOT (leveldata) =====
// Een vriendelijk griezel-kasteel 👻 in de maneschijn. Concept: SUBITIZEREN
// (flits-tellen — een aantal in één oogopslag herkennen). VIER levels met elk
// een eigen karakter: een verdwijn-trappen-gauntlet, de donkere tel-zalen, een
// toren-klim en de baas. De flits is per level een HOOGTEPUNT; de ruggengraat
// is actieve beweging (verdwijn-treden timen, klimmen, achtervolging).
//   - SPOOK-TREDEN 👻 : stenen treden die om de beurt VERVAGEN — time je sprong.
//   - DE LANTAARN-FLITS 🔦 : tik de lantaarn → spookjes lichten 1 seconde op…
//     en weg! Hoeveel waren het? Tik het grafzerkje met het juiste getal.
// Eindbaas: Het Grote Boe — tel zijn geflitste spookjes en raak het zerkje.
// Dit is de nieuwe LAATSTE wereld: na 19-4 volgt het Grote Slotfeest!

export const LEVEL_19_1 = {
  id: '19-1',
  naam: 'De Verdwijn-Trappen',

  worldW: 4600,
  worldH: 800,
  killY: 720,
  terrain: 'spook',
  bg: { top: 0x2c2450, bottom: 0x161228 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Welkom in het Spook-Slot! Spring over de treden die vervagen! 👻',

  // TIMING: een gauntlet van verdwijn-treden over de afgrond, dan een groot
  // jaag-spook dat je opjaagt. Beweging + durf — nog geen flits.
  platforms: [
    [0, 660, 1400, 140],
    [2200, 660, 2400, 140],  // over de afgrond (verdwijn-treden)
  ],

  spookTreden: [
    { x: 1520, y: 600, w: 130 },
    { x: 1750, y: 600, w: 130 },
    { x: 1980, y: 600, w: 130 },
  ],

  achtervolgingen: [
    { spawnX: 2700, triggerX: 2850, endX: 3900, skin: 'spook' },
  ],

  telWolken: [[400, 480, 120], [600, 360, 120]],

  vraagMuren: [
    { x: 4300, kies: 'minder', opties: [8, 3] },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2400, y: 600, amount: 1 },
    { x: 4200, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'vlieger', x: 1700, y: 300, patrol: [1450, 2150] }, // boven de afgrond
    { type: 'stomp', x: 4200, y: 612, patrol: [4100, 4400] },
  ],

  star: { x: 600, y: 310 },
  goudenNul: { x: 3000, y: 300 },

  goal: { x: 4500, y: 588, value: 10 },

  reward: {
    title: 'Level 19-1 gehaald! 🏆',
    subtitle: 'Over de vervagende treden gesprongen — en het spook ontsnapt!',
    stars: 3, medal: 'adventure_19_1', medalLabel: 'Treden-Danser',
  },
};

export const LEVEL_19_2 = {
  id: '19-2',
  naam: 'De Donkere Zalen',

  worldW: 4200,
  worldH: 800,
  killY: 720,
  terrain: 'spook',
  bg: { top: 0x282050, bottom: 0x141024 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Tik de lantaarn — hoeveel spookjes flitsen er in de zaal? 🔦👻',

  // TELLEN: hier is de lantaarn-flits het hoofdgerecht (3 en 5 spookjes), met
  // een telwolken-klim naar de ster en verdwijn-treden over een kloof ertussen.
  platforms: [
    [0, 660, 2400, 140],
    [2800, 660, 1400, 140],  // na de kloof
  ],

  flitsSpoken: [
    { x: 600, aantal: 3 },
    { x: 3200, aantal: 5 },
  ],

  spookTreden: [
    { x: 2500, y: 600, w: 120 },
    { x: 2680, y: 600, w: 120 },
  ],

  telWolken: [[1400, 500, 120], [1200, 380, 120]],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2000, y: 600, amount: 1 },
    { x: 3800, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 1000, y: 612, patrol: [900, 1100] },
    { type: 'vlieger', x: 2600, y: 320, patrol: [2450, 2780] }, // boven de kloof
    { type: 'werper', x: 3600, y: 612, patrol: [3500, 3750] },
  ],

  star: { x: 1200, y: 330 },
  goudenNul: { x: 3900, y: 300 },

  goal: { x: 4100, y: 588, value: 10 },

  reward: {
    title: 'Level 19-2 gehaald! 🏆',
    subtitle: 'Drie… vijf… in één oogopslag geteld in het donker!',
    stars: 3, medal: 'adventure_19_2', medalLabel: 'Zaal-Teller',
  },
};

export const LEVEL_19_3 = {
  id: '19-3',
  naam: 'De Toren-Klim',

  worldW: 2400,
  worldH: 1800,
  killY: 1730,
  terrain: 'spook',
  bg: { top: 0x241c46, bottom: 0x120e20 },

  start: { x: 120, y: 1560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Flits eerst de poort open, klim dan de spook-toren op! ⬆️👻',

  // VERTICAAL: onderaan een lantaarn-flits (6 spookjes!) als toegangspoort,
  // dan een klim langs richels en verdwijn-treden naar het torendak.
  // NB: de begane grond staat als platforms[0] (systemen ankeren daar).
  platforms: [
    [0, 1660, 2400, 140],    // begane grond (hoofdvloer)
    [1100, 1480, 320, 24],
    [700, 1300, 320, 24],
    [1100, 1120, 320, 24],
    [700, 940, 320, 24],
    [1100, 760, 320, 24],
    [1050, 540, 340, 24],    // het torendak
  ],

  flitsSpoken: [
    { x: 500, aantal: 6 },
  ],

  spookTreden: [
    { x: 1500, y: 1300, w: 110 },
    { x: 400, y: 940, w: 110 },
    { x: 1500, y: 640, w: 110 },
  ],

  telWolken: [[900, 1560, 110]],

  pickups: [
    { x: 150, y: 1600, amount: 1 },
    { x: 1200, y: 1080, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'vlieger', x: 900, y: 1000, patrol: [600, 1200] },
    { type: 'vlieger', x: 1000, y: 640, patrol: [700, 1300] },
  ],

  star: { x: 1500, y: 1250 },
  goudenNul: { x: 400, y: 890 },

  goal: { x: 1220, y: 470, value: 10 },

  reward: {
    title: 'Level 19-3 gehaald! 🏆',
    subtitle: 'Helemaal naar het torendak — de spookjes juichen je toe!',
    stars: 3, medal: 'adventure_19_3', medalLabel: 'Toren-Klimmer',
  },
};

export const LEVEL_19_4 = {
  id: '19-4',
  naam: 'Het Grote Boe',

  worldW: 4600,
  worldH: 800,
  killY: 720,
  terrain: 'spook',
  bg: { top: 0x1a1438, bottom: 0x0c0818 }, // de grote balzaal bij middernacht
  finale: 'slot', // het állerlaatste level: hierna het Grote Slotfeest!

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'De hoofdact: Het Grote Boe! Tel zijn geflitste spookjes! 👻',

  // BAAS: een gemixte aanloop (flits + verdwijn-treden-gauntlet + koord boven
  // een crevasse), dan Het Grote Boe — tel per fase zijn geflitste spookjes.
  platforms: [
    [0, 660, 1600, 140],
    [2400, 660, 700, 140],     // tussen de afgrond en de crevasse
    [3500, 660, 1100, 140],    // de balzaal
    [2730, 500, 170, 26],      // koord-opstapjes
    [3560, 500, 170, 26],
  ],

  flitsSpoken: [
    { x: 600, aantal: 4 },
  ],

  spookTreden: [
    { x: 1750, y: 600, w: 120 },
    { x: 1980, y: 580, w: 120 },
    { x: 2210, y: 600, w: 120 },
  ],

  koorden: [
    [2900, 3560, 480],  // over de crevasse 3100-3500 de balzaal in
  ],

  boss: {
    x: 4000,
    name: 'Het Grote Boe',
    look: 'boe',
    stijl: 'flits',
    stages: [
      { doel: 3, opties: [3, 4, 2] },
      { doel: 5, opties: [5, 4, 6] },
      { doel: 6, opties: [6, 7, 5] },
    ],
  },

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2600, y: 600, amount: 1 },
    { x: 3700, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 800, y: 612, patrol: [700, 900] },
    { type: 'springer', x: 3700, y: 612, patrol: [3600, 3800] },
  ],

  star: { x: 2600, y: 360 },
  goudenNul: { x: 600, y: 280 },

  goal: { x: 4400, y: 588, value: 10 },

  reward: {
    title: 'HET SPOOK-SLOT UITGESPEELD! 🏆👻',
    subtitle: 'Het Grote Boe lacht met je mee — op naar het Grote Slotfeest!',
    stars: 5, medal: 'world19_done', medalLabel: 'Slot-Heer',
  },
};

export const WORLD19 = [LEVEL_19_1, LEVEL_19_2, LEVEL_19_3, LEVEL_19_4];
