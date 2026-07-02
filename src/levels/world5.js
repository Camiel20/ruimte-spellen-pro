// ===== WERELD 5 — DE RUIMTE (leveldata) =====
// Sterrenhemel, maanrots en zwevende ruimte-eilandjes. Concept: TIENTALLEN &
// HONDERD — tel met sprongen van 10 (tank de raket tot precies 100!), zweef
// door maan-zwaartekracht, kies het portaal met de kloppende som en versla de
// Meteoor-Grommel met tientallen-raadsels. Het niveau ligt weer hoger: de
// vuurballen zijn de snelste projectielen tot nu toe en de komeet rent harder
// dan de rots van Wereld 4.
// Nieuwe werkwoorden: tanken (tellen in tientallen), zweven (maan-zones),
// portaal-rekenen (kies de goede som).

export const LEVEL_5_1 = {
  id: '5-1',
  naam: 'De Raket-Lift',

  worldW: 3000,
  worldH: 800,
  killY: 720,
  terrain: 'ruimte',
  bg: { top: 0x141233, bottom: 0x4a3a78 }, // diepe ruimte → paarse gloed

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  intro: 'Tank precies 100! Tel: 10, 20, 30… ⛽🚀',

  // Eén groot ruimte-ravijn (1040 breed — nooit te overspringen): de raket
  // is de enige weg. Zwevende eilandjes boven pad A dragen de hoge vaatjes.
  platforms: [
    [0, 660, 1360, 140],    // maanrots A (start + raket)
    [340, 500, 170, 26],    // eilandje 1
    [700, 400, 150, 26],    // eilandje 2 (hoog)
    [1060, 500, 170, 26],   // eilandje 3
    [2400, 660, 600, 140],  // maanrots B — landing + vlag
  ],

  // 10 vaatjes van 10 = precies 100. Vier op de grond, zes op de eilandjes.
  raket: {
    x: 1270,
    doel: 100,
    landX: 2520,
    drums: [
      [180, 600], [520, 600], [900, 600], [1180, 600],
      [390, 440], [460, 440],
      [740, 340], [810, 340],
      [1100, 440], [1170, 440],
    ],
  },

  pickups: [
    { x: 260, y: 600, amount: 1 },
    { x: 980, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'stomp', x: 640, y: 612, patrol: [560, 780] },
    { type: 'stomp', x: 1000, y: 612, patrol: [920, 1140] },
  ],

  // Ster boven het hoogste eilandje.
  star: { x: 775, y: 330 },

  goal: { x: 2920, y: 588, value: 100 }, // de vlag toont HONDERD!

  reward: {
    title: 'Level 5-1 gehaald! 🏆',
    subtitle: 'Tien, twintig… honderd — jij bent een echte piloot!',
    stars: 3, medal: 'adventure_5_1', medalLabel: 'Honderd-Piloot',
  },
};

export const LEVEL_5_2 = {
  id: '5-2',
  naam: 'Maan-Sprongen',

  worldW: 2800,
  worldH: 800,
  killY: 720,
  terrain: 'ruimte',
  bg: { top: 0x1c1840, bottom: 0x4a3a78 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  intro: 'Maan-zwaartekracht: spring superhoog! 🌙',

  // Hoge richels die je alléén met maan-zwaartekracht haalt; helemaal
  // bovenop slaapt TWINTIG — het grootste vriendje tot nu toe.
  platforms: [
    [0, 660, 2800, 140],     // doorlopende maanvlakte
    [700, 300, 180, 26],     // hoge richel in zone 1
    [1850, 320, 170, 26],    // richel-trap in zone 2…
    [2130, 220, 170, 26],    // …naar de slaapplek van Twintig
  ],

  maanZones: [
    { x: 500, w: 550 },
    { x: 1700, w: 650 },
  ],

  rescues: [
    { x: 2215, y: 190, doel: 20, name: 'Twintig', blocks: [8, 12] },
  ],

  pickups: [
    { x: 350, y: 600, amount: 1 },
    { x: 780, y: 240, amount: 1 },   // op de hoge richel
    { x: 1930, y: 260, amount: 1 },
    { x: 1450, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'stomp', x: 380, y: 612, patrol: [300, 480] },
    { type: 'stomp', x: 1350, y: 612, patrol: [1250, 1500] },
    { type: 'stomp', x: 2550, y: 612, patrol: [2460, 2680] },
  ],

  // Ster hoog boven de eerste richel: alleen met een zweefsprong.
  star: { x: 790, y: 170 },

  goal: { x: 2740, y: 588, value: 20 },

  reward: {
    title: 'Level 5-2 gehaald! 🏆',
    subtitle: 'Twintig is wakker — en jij zweeft als een astronaut!',
    stars: 3, medal: 'adventure_5_2', medalLabel: 'Maan-Springer',
  },
};

export const LEVEL_5_3 = {
  id: '5-3',
  naam: 'Het Portalen-Raadsel',

  worldW: 2900,
  worldH: 800,
  killY: 720,
  terrain: 'ruimte',
  bg: { top: 0x1c1840, bottom: 0x453a70 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  intro: 'Kies het portaal met de goede som! ✨',

  platforms: [
    [0, 660, 2900, 140],
  ],

  // Twee portaal-groepen: alleen de som die het doel maakt brengt je verder;
  // een fout portaal stuurt je terug. Groep 2 rekent met tientallen!
  portalen: [
    { x: 620, doel: 20, opties: [[10, 5], [10, 10], [20, 10]] },
    { x: 1750, doel: 60, opties: [[30, 30], [40, 30], [20, 30]] },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 1300, y: 600, amount: 1 },
    { x: 2450, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'stomp', x: 1350, y: 612, patrol: [1250, 1480] },
    { type: 'stomp', x: 2450, y: 612, patrol: [2380, 2580] },
  ],

  star: { x: 1400, y: 430 },

  goal: { x: 2840, y: 588, value: 60 },

  reward: {
    title: 'Level 5-3 gehaald! 🏆',
    subtitle: '30 + 30 = 60 — geen portaal houdt jou voor de gek!',
    stars: 3, medal: 'adventure_5_3', medalLabel: 'Portaal-Rekenaar',
  },
};

export const LEVEL_5_4 = {
  id: '5-4',
  naam: 'De Komeet-Ren',

  worldW: 3200,
  worldH: 800,
  killY: 720,
  terrain: 'ruimte',
  bg: { top: 0x181540, bottom: 0x50406e },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  intro: 'RENNEN! De komeet komt eraan! ☄️',

  // Meesterproef: twee komeet-achtervolgingen (sneller dan de rots van W4!),
  // een maan-zone met zweef-bolletjes en een tientallen-vraagmuur ertussen.
  platforms: [
    [0, 660, 1420, 140],    // maanpad A (komeet 1)
    [1510, 660, 1690, 140], // maanpad B (zone + muur + komeet 2)
  ],

  achtervolgingen: [
    { spawnX: 60, triggerX: 320, endX: 1330, speed: 205, skin: 'komeet' },
    { spawnX: 2050, triggerX: 2320, endX: 3080, speed: 215, skin: 'komeet' },
  ],

  maanZones: [
    { x: 1560, w: 420 },
  ],

  // Kopstoot tegen het goede tiental: waar is MEER?
  vraagMuren: [
    { x: 2150, kies: 'meer', opties: [70, 50] },
  ],

  pickups: [
    { x: 500, y: 600, amount: 1 },   // grijp ze tijdens het rennen!
    { x: 860, y: 600, amount: 1 },
    { x: 1680, y: 340, amount: 1 },  // zweef-bolletjes hoog in de maan-zone
    { x: 1810, y: 260, amount: 1 },
    { x: 2080, y: 600, amount: 1, regen: true }, // magisch: altijd groot genoeg voor de kopstoot
    { x: 2650, y: 600, amount: 1 },  // durf jij 'm te pakken tijdens komeet 2?
  ],

  grommels: [
    { type: 'stomp', x: 1740, y: 612, patrol: [1650, 1830] },
  ],

  // Ster midden op het eerste komeet-pad: voor durvers.
  star: { x: 960, y: 430 },

  goal: { x: 3140, y: 588, value: 10 },

  reward: {
    title: 'Level 5-4 gehaald! 🏆',
    subtitle: 'Sneller dan een komeet — dat kan bijna niemand!',
    stars: 3, medal: 'adventure_5_4', medalLabel: 'Komeet-Renner',
  },
};

export const LEVEL_5_5 = {
  id: '5-5',
  naam: 'De Meteoor-Grommel',

  worldW: 2000,
  worldH: 800,
  killY: 720,
  terrain: 'ruimte',
  bg: { top: 0x241436, bottom: 0x54304a }, // gloeiende schemer — spannend!

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  intro: 'De Meteoor-Grommel! Maak zijn tientallen — ontwijk de vuurballen! ☄️',

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
    { type: 'stomp', x: 500, y: 612, patrol: [360, 700] },
    { type: 'stomp', x: 950, y: 612, patrol: [820, 1150] },
  ],

  // Tientallen-fasen: 10 → 20 → 30. Elke fase geeft nét te veel blokjes,
  // dus samenvoegen én op de juiste grens splitsen (11 = 10 + 1!). De
  // vuurballen zijn sneller dan de kristal-scherven van Wereld 4.
  boss: {
    x: 1500,
    name: 'Meteoor-Grommel',
    look: 'meteoor',
    stages: [
      { doel: 10, blocks: [4, 7] },    // 11 → 10 + 1
      { doel: 20, blocks: [13, 9] },   // 22 → 20 + 2
      { doel: 30, blocks: [16, 15] },  // 31 → 30 + 1
    ],
  },

  goal: { x: 1850, y: 588, value: 30 },

  reward: {
    title: 'WERELD 5 UITGESPEELD! 🏆🎉',
    subtitle: 'De Meteoor-Grommel is afgekoeld — 10, 20, 30… jij bent de held van de tientallen!',
    stars: 5, medal: 'world5_done', medalLabel: 'Held van Wereld 5',
  },
};

export const WORLD5 = [LEVEL_5_1, LEVEL_5_2, LEVEL_5_3, LEVEL_5_4, LEVEL_5_5];
