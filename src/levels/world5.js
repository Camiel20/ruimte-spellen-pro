// ===== WERELD 5 — DE RUIMTE (leveldata) =====
// Sterrenhemel, maanrots en zwevende ruimte-eilandjes. Concept: TIENTALLEN &
// HONDERD — tel met sprongen van 10 (tank de raket tot precies 100!), zweef
// door maan-zwaartekracht, kies het portaal met de kloppende som en spring
// de Meteoor-Grommel op zijn kop. Het niveau ligt weer hoger: de vuurballen
// zijn de snelste projectielen tot nu toe en de kometen rennen het hardst.
//
// RENOVATIE 2026-07-07: levels naar de norm (5200-5600px), 5-2 is nu een
// VERTICALE maan-klim en de Meteoor-Grommel (5-5) heeft een eigen gevecht:
// stijl 'stomp' — zweef omhoog en spring Mario-stijl op zijn kop.

export const LEVEL_5_1 = {
  id: '5-1',
  naam: 'De Raket-Lift',

  worldW: 5200,
  worldH: 800,
  killY: 720,
  terrain: 'ruimte',
  bg: { top: 0x141233, bottom: 0x4a3a78 }, // diepe ruimte → paarse gloed

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Tank precies 100! Tel: 10, 20, 30… ⛽🚀',

  // Beat 1-2: vaatjes verzamelen (eilandjes!) en de raket-vlucht over het
  // ravijn → beat 3: grauwe muur op de maanvlakte → beat 4: tientallen-
  // vraagmuur → beat 5: glijder-veld naar de vlag.
  platforms: [
    [0, 660, 1360, 140],     // maanrots A (start + raket)
    [340, 500, 170, 26],     // eilandje 1
    [700, 400, 150, 26],     // eilandje 2 (hoog)
    [1060, 500, 170, 26],    // eilandje 3
    [2400, 660, 2800, 140],  // maanrots B — landing en de lange terugtocht
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
    { x: 3900, y: 600, amount: 1, regen: true }, // vóór de vraagmuur
  ],

  vraagMuren: [
    { x: 4100, kies: 'meer', opties: [90, 60] }, // tientallen vergelijken!
  ],

  grauwMuren: [3200],

  grommels: [
    { type: 'stomp', x: 640, y: 612, patrol: [560, 780] },
    { type: 'stomp', x: 1000, y: 612, patrol: [920, 1140] },
    { type: 'vlieger', x: 750, y: 250, patrol: [400, 1100] }, // bewaakt de vaatjes!
    { type: 'stomp', x: 3600, y: 612, patrol: [3500, 3700] },
    { type: 'glijder', x: 4500, y: 612, patrol: [4400, 4650] },
  ],

  // Ster boven het hoogste eilandje.
  star: { x: 775, y: 330 },

  goal: { x: 5050, y: 588, value: 100 }, // de vlag toont HONDERD!

  reward: {
    title: 'Level 5-1 gehaald! 🏆',
    subtitle: 'Tien, twintig… honderd — jij bent een echte piloot!',
    stars: 3, medal: 'adventure_5_1', medalLabel: 'Honderd-Piloot',
  },
};

export const LEVEL_5_2 = {
  id: '5-2',
  naam: 'De Maan-Klim',

  // VERTICAAL level: het hele ravijn heeft maan-zwaartekracht — zweef-spring
  // van richel naar richel omhoog naar de slaapplek van Twintig, helemaal
  // boven in de sterren. (De richels staan verder uit elkaar dan normaal:
  // alleen met de maan-zweef haalbaar.)
  worldW: 1200,
  worldH: 1800,
  killY: 1760,
  terrain: 'ruimte',
  bg: { top: 0x1c1840, bottom: 0x4a3a78 },

  start: { x: 90, y: 1560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Maan-zwaartekracht: zweef-klim naar Twintig! 🌙',

  platforms: [
    [0, 1660, 1200, 140],   // de maanvlakte, helemaal onderaan
    [180, 1360, 240, 26],   // richel 1
    [760, 1080, 240, 26],   // richel 2
    [180, 800, 240, 26],    // richel 3
    [740, 520, 240, 26],    // richel 4
    [400, 260, 400, 26],    // de top — de slaapplek van Twintig
  ],

  // Het hele ravijn is één grote maan-zone: overal zweven!
  maanZones: [
    { x: 0, w: 1200 },
  ],

  rescues: [
    { x: 560, y: 230, doel: 20, name: 'Twintig', blocks: [8, 12] },
  ],

  pickups: [
    { x: 350, y: 1600, amount: 1 },
    { x: 300, y: 1300, amount: 1 },  // op richel 1
    { x: 880, y: 1020, amount: 1 },  // op richel 2
    { x: 300, y: 740, amount: 1 },   // op richel 3
    { x: 860, y: 460, amount: 1 },   // op richel 4
  ],

  grommels: [
    { type: 'stomp', x: 700, y: 1612, patrol: [600, 900] },
    { type: 'vlieger', x: 500, y: 1200, patrol: [250, 850] }, // lucht-wachten!
    { type: 'vlieger', x: 550, y: 650, patrol: [300, 800] },
  ],

  // Ster hoog naast de klim-route: durf jij de zij-zweef aan?
  star: { x: 100, y: 700 },

  // GEHEIM: een Gouden Nul hoog naast richel 4 (zweef-sprong opzij!).
  goudenNul: { x: 1050, y: 400 },

  goal: { x: 740, y: 188, value: 20 },

  reward: {
    title: 'Level 5-2 gehaald! 🏆',
    subtitle: 'Twintig is wakker — en jij zweeft als een astronaut!',
    stars: 3, medal: 'adventure_5_2', medalLabel: 'Maan-Springer',
  },
};

export const LEVEL_5_3 = {
  id: '5-3',
  naam: 'Het Portalen-Raadsel',

  worldW: 5200,
  worldH: 800,
  killY: 720,
  terrain: 'ruimte',
  bg: { top: 0x1c1840, bottom: 0x453a70 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Kies het portaal met de goede som! ✨',

  platforms: [
    [0, 660, 5200, 140],
  ],

  // Drie portaal-groepen, steeds groter: 20, 60 en als klap op de vuurpijl
  // HONDERD (50+50!). Fout portaal = terug en opnieuw kiezen.
  portalen: [
    { x: 620, doel: 20, opties: [[10, 5], [10, 10], [20, 10]] },
    { x: 1750, doel: 60, opties: [[30, 30], [40, 30], [20, 30]] },
    { x: 3600, doel: 100, opties: [[50, 50], [60, 30], [40, 50]] },
  ],

  // Maan-zone met zweef-bolletjes hoog in de lucht (tussen portaal 2 en 3).
  maanZones: [
    { x: 2700, w: 500 },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 1300, y: 600, amount: 1 },
    { x: 2850, y: 340, amount: 1 }, // zweef-bolletje!
    { x: 2980, y: 260, amount: 1 },
    { x: 4500, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'stomp', x: 1350, y: 612, patrol: [1250, 1480] },
    { type: 'springer', x: 2600, y: 612, patrol: [2500, 2700] },
    { type: 'vlieger', x: 3300, y: 300, patrol: [3100, 3500] },
    { type: 'stomp', x: 4500, y: 612, patrol: [4400, 4600] },
  ],

  // Grauwe muur vlak voor de vlag: alleen de tien-kracht komt erdoorheen.
  grauwMuren: [4800],

  star: { x: 1400, y: 430 },

  goal: { x: 5050, y: 588, value: 100 },

  reward: {
    title: 'Level 5-3 gehaald! 🏆',
    subtitle: '50 + 50 = 100 — geen portaal houdt jou voor de gek!',
    stars: 3, medal: 'adventure_5_3', medalLabel: 'Portaal-Rekenaar',
  },
};

export const LEVEL_5_4 = {
  id: '5-4',
  naam: 'De Komeet-Ren',

  worldW: 5600,
  worldH: 800,
  killY: 720,
  terrain: 'ruimte',
  bg: { top: 0x181540, bottom: 0x50406e },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'RENNEN! De kometen komen eraan! ☄️',

  // Meesterproef: DRIE komeet-achtervolgingen (de laatste is de snelste van
  // het hele spel!), twee maan-zones en twee tientallen-vraagmuren ertussen.
  platforms: [
    [0, 660, 1420, 140],    // maanpad A (komeet 1)
    [1510, 660, 1690, 140], // maanpad B (zone + muur + komeet 2)
    [3290, 660, 2310, 140], // maanpad C (zone 2 + muur 2 + de eindsprint!)
  ],

  achtervolgingen: [
    { spawnX: 60, triggerX: 320, endX: 1330, speed: 205, skin: 'komeet' },
    { spawnX: 2050, triggerX: 2320, endX: 3080, speed: 215, skin: 'komeet' },
    { spawnX: 4060, triggerX: 4320, endX: 5350, speed: 225, skin: 'komeet' }, // de snelste!
  ],

  maanZones: [
    { x: 1560, w: 420 },
    { x: 3350, w: 400 },
  ],

  // Kopstoot tegen het goede tiental: meer én minder.
  vraagMuren: [
    { x: 2150, kies: 'meer', opties: [70, 50] },
    { x: 3950, kies: 'minder', opties: [40, 80] },
  ],

  pickups: [
    { x: 500, y: 600, amount: 1 },   // grijp ze tijdens het rennen!
    { x: 860, y: 600, amount: 1 },
    { x: 1680, y: 340, amount: 1 },  // zweef-bolletjes hoog in de maan-zone
    { x: 1810, y: 260, amount: 1 },
    { x: 2080, y: 600, amount: 1, regen: true }, // magisch: altijd groot genoeg voor de kopstoot
    { x: 2650, y: 600, amount: 1 },  // durf jij 'm te pakken tijdens komeet 2?
    { x: 3850, y: 600, amount: 1, regen: true }, // vóór muur 2
  ],

  grommels: [
    { type: 'stomp', x: 1740, y: 612, patrol: [1650, 1830] },
    { type: 'vlieger', x: 4700, y: 430, patrol: [4400, 5000] }, // duikt boven de eindsprint!
  ],

  // Ster midden op het eerste komeet-pad: voor durvers.
  star: { x: 960, y: 430 },

  goal: { x: 5500, y: 588, value: 20 },

  reward: {
    title: 'Level 5-4 gehaald! 🏆',
    subtitle: 'Sneller dan drie kometen — dat kan bijna niemand!',
    stars: 3, medal: 'adventure_5_4', medalLabel: 'Komeet-Renner',
  },
};

export const LEVEL_5_5 = {
  id: '5-5',
  naam: 'De Meteoor-Grommel',

  worldW: 4800,
  worldH: 800,
  killY: 720,
  terrain: 'ruimte',
  bg: { top: 0x241436, bottom: 0x54304a }, // gloeiende schemer — spannend!

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'De Meteoor-Grommel! Zweef omhoog en spring op zijn kop! ☄️🌙',

  // Volwaardige aanloop (portaal + grauwe muur) en dan het gevecht: stijl
  // 'stomp' — de arena heeft maan-zwaartekracht: zweef-spring óp zijn kop
  // (Mario!) en tel de tientallen: TIEN! TWINTIG! DERTIG! Vuurballen worden
  // per fase sneller — ontwijken tussen de sprongen door.
  platforms: [
    [0, 660, 4800, 140],
  ],

  portalen: [
    { x: 700, doel: 30, opties: [[10, 20], [10, 10], [20, 20]] },
  ],

  grauwMuren: [1600],

  // De arena heeft maan-zwaartekracht: zo kom je op zijn kop!
  maanZones: [
    { x: 2900, w: 1100 },
  ],

  pickups: [
    { x: 240, y: 600, amount: 1 },
    { x: 500, y: 600, amount: 1 },
    { x: 1900, y: 600, amount: 1 },
    { x: 2200, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 400, y: 612, patrol: [300, 600] },
    { type: 'springer', x: 2000, y: 612, patrol: [1900, 2100] },
    { type: 'stomp', x: 2500, y: 612, patrol: [2400, 2600] },
  ],

  // De Meteoor-Grommel — stijl 'stomp': drie kop-sprongen, de tientallen
  // tellen op (10 → 20 → 30) en zijn vuurballen worden steeds sneller.
  boss: {
    x: 3600,
    name: 'Meteoor-Grommel',
    look: 'meteoor',
    stijl: 'stomp',
    stages: [
      { doel: 10 },
      { doel: 20 },
      { doel: 30 },
    ],
  },

  // Verstopte ster boven de arena: pak 'm met een maan-zweef!
  star: { x: 3100, y: 340 },

  goal: { x: 4650, y: 588, value: 30 },

  reward: {
    title: 'WERELD 5 UITGESPEELD! 🏆🎉',
    subtitle: 'De Meteoor-Grommel is afgekoeld — 10, 20, 30… jij bent de held van de tientallen!',
    stars: 5, medal: 'world5_done', medalLabel: 'Held van Wereld 5',
  },
};

export const WORLD5 = [LEVEL_5_1, LEVEL_5_2, LEVEL_5_3, LEVEL_5_4, LEVEL_5_5];
