// ===== WERELD 18 — ONDER-NUL (leveldata) =====
// Een glinsterend ijspaleis ❄️ waar het cijfer 0 wóónt. Concept: TERUGTELLEN
// NAAR 0 — en voorzichtig eronder ("kouder dan nul"). VIER levels met elk een
// eigen karakter (geen gang vol muren): een glij-slalom, een sneeuwbal-
// smederij, een verticale diepvries en de baas. De reken-truc (thermometer /
// sneeuwbal) is per level een HOOGTEPUNT, de ruggengraat is actieve beweging.
//   - GLIJ-IJS ❄️ : gladde ijsvloeren waarop je vaart maakt (over de kloven!).
//   - DE GROEI-SNEEUWBAL ⛄ : duw een bal, hij groeit (1,2,3…) tot hij een
//     bevroren poort ramt.
//   - DE VRIES-THERMOMETER 🌡️ : tik ▼ kouder / ▲ warmer, tel terug naar het
//     doel (0, of eronder), tik het ijs-luik → de poort barst.
// Eindbaas: De Vrieskoning — tel zijn thermometer terug naar 0 (en eronder).

export const LEVEL_18_1 = {
  id: '18-1',
  naam: 'Glij-Vallei',

  worldW: 4600,
  worldH: 800,
  killY: 720,
  terrain: 'ijs',
  bg: { top: 0x9fd0ea, bottom: 0x5a86a0 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Welkom in Onder-Nul! Maak vaart op het ijs en zoef over de kloven! ❄️',

  // SNELHEID: twee glij-ijs-stroken met kloven ertussen (momentum-sprongen),
  // een telwolken-klim naar de ster, en een reuzen-sneeuwbal die je opjaagt.
  platforms: [
    [0, 660, 1200, 140],
    [1550, 660, 1100, 140],  // na kloof 1
    [2950, 660, 1650, 140],  // na kloof 2 (hier rolt de sneeuwbal!)
  ],

  glijbanen: [
    [350, 750, 1],   // zoef over kloof 1
    [1700, 750, 1],  // zoef over kloof 2
  ],

  telWolken: [[1280, 520, 120], [1440, 420, 120], [2150, 400, 120], [2350, 300, 120]],

  achtervolgingen: [
    { spawnX: 3050, triggerX: 3200, endX: 3900, skin: 'sneeuwbal' },
  ],

  vraagMuren: [
    { x: 4300, kies: 'meer', opties: [9, 4] },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 1900, y: 600, amount: 1 },
    { x: 3400, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'vlieger', x: 1370, y: 320, patrol: [1250, 1500] }, // boven kloof 1
    { type: 'stomp', x: 2200, y: 612, patrol: [2050, 2350] },
    { type: 'vlieger', x: 3600, y: 300, patrol: [3400, 3800] },
  ],

  star: { x: 2350, y: 250 },
  goudenNul: { x: 600, y: 300 },

  goal: { x: 4500, y: 588, value: 10 },

  reward: {
    title: 'Level 18-1 gehaald! 🏆',
    subtitle: 'Over het gladde ijs gescheurd — wat een glij-kampioen!',
    stars: 3, medal: 'adventure_18_1', medalLabel: 'Glij-Kampioen',
  },
};

export const LEVEL_18_2 = {
  id: '18-2',
  naam: 'De Sneeuwbal-Smederij',

  worldW: 4400,
  worldH: 800,
  killY: 720,
  terrain: 'ijs',
  bg: { top: 0x92c6e2, bottom: 0x517d96 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Duw de sneeuwbal groot, ram de muren, en durf op het ijs-koord! ⛄',

  // FYSIEK: rol een sneeuwbal groot (telt op), ram met de duw/tien-kracht door
  // een ijsmuur, en balanceer over een ijs-koord boven een crevasse.
  platforms: [
    [0, 660, 2400, 140],       // sneeuwbal + smash-muur
    [2400, 660, 300, 140],     // aanloop naar het koord
    [3100, 660, 1300, 140],    // over de crevasse (koord) — naar de finish
  ],

  sneeuwballen: [
    { x: 500, doel: 5 },
  ],

  duwKisten: [1600],
  grauwMuren: [1950],

  koorden: [
    [2620, 3260, 480],  // over de crevasse 2700-3100
  ],

  telWolken: [[1150, 480, 120], [980, 360, 120]],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2500, y: 600, amount: 1 },
    { x: 3300, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'werper', x: 1150, y: 612, patrol: [1050, 1250] }, // gooit ijsklompjes
    { type: 'stomp', x: 2500, y: 612, patrol: [2420, 2660] },
    { type: 'springer', x: 3400, y: 612, patrol: [3300, 3550] },
  ],

  star: { x: 1000, y: 310 },
  goudenNul: { x: 3900, y: 300 },

  goal: { x: 4300, y: 588, value: 10 },

  reward: {
    title: 'Level 18-2 gehaald! 🏆',
    subtitle: 'Eén, twee, drie, vier, VIJF — en BOEM door de ijsmuur!',
    stars: 3, medal: 'adventure_18_2', medalLabel: 'Sneeuwbal-Smid',
  },
};

export const LEVEL_18_3 = {
  id: '18-3',
  naam: 'De Diepvries',

  worldW: 2400,
  worldH: 1800,
  killY: 1730,
  terrain: 'ijs',
  bg: { top: 0x6fa0be, bottom: 0x365a72 },

  start: { x: 120, y: 180 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Daal af in de diepvries… en zet onderin de dialen: 0, en dan −2! ⬇️❄️',

  // VERTICAAL: een afdaling langs ijs-richels en een glij-richel, helemaal naar
  // de koudste kelder. Onderin twee thermometers (0 en −2) als terugtel-finale.
  // NB: de kelder-bodem staat als platforms[0] (systemen ankeren op de
  // hoofdvloer — de thermometer-poorten horen onderin te staan).
  platforms: [
    [0, 1660, 2400, 140],    // de koudste kelder-bodem (hoofdvloer)
    [40, 240, 320, 24],      // instap bovenaan
    [700, 420, 300, 24],
    [220, 620, 300, 24],
    [900, 840, 320, 24],
    [300, 1060, 300, 24],
    [1000, 1280, 340, 24],
    [400, 1480, 300, 24],
  ],

  glijbanen: [
    [900, 300, 1, 840],  // een ijs-glij-richel diep in de schacht
  ],

  thermometers: [
    { x: 700, doel: 0 },
    { x: 1500, doel: -2 },  // diep onder nul
  ],

  telWolken: [[620, 520, 110], [560, 720, 110]],

  pickups: [
    { x: 150, y: 190, amount: 1 },
    { x: 400, y: 1600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'vlieger', x: 700, y: 700, patrol: [500, 900] },
    { type: 'vlieger', x: 1100, y: 1100, patrol: [900, 1300] },
  ],

  star: { x: 1160, y: 1220 },
  goudenNul: { x: 320, y: 1010 },

  goal: { x: 2220, y: 1588, value: 10 },

  reward: {
    title: 'Level 18-3 gehaald! 🏆',
    subtitle: 'Naar nul, en tot min twee — de diepvries is bedwongen!',
    stars: 3, medal: 'adventure_18_3', medalLabel: 'Diepvries-Duiker',
  },
};

export const LEVEL_18_4 = {
  id: '18-4',
  naam: 'De Vrieskoning',

  worldW: 4600,
  worldH: 800,
  killY: 720,
  terrain: 'ijs',
  bg: { top: 0x5a86a4, bottom: 0x2a4a60 }, // de troonzaal van ijs

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'De ijskoning zelf! Tel zijn thermometer terug naar NUL — en eronder! ❄️👑',

  // BAAS: een korte, gemixte aanloop (sneeuwbal + glij-ijs + koord boven een
  // crevasse), dan De Vrieskoning: tel zijn ijs terug (4→0, 6→0, en 3→−3).
  platforms: [
    [0, 660, 2000, 140],
    [2400, 660, 400, 140],     // landing na de glij-kloof
    [3200, 660, 1400, 140],    // de troonzaal (koord ervoor over een crevasse)
  ],

  sneeuwballen: [
    { x: 500, doel: 4 },
  ],

  glijbanen: [
    [1400, 360, 1],  // glij over kloof 2000-2400
  ],

  koorden: [
    [2620, 3260, 480],  // over de crevasse 2800-3200 de troonzaal in
  ],

  boss: {
    x: 3900,
    name: 'De Vrieskoning',
    look: 'vrieskoning',
    stijl: 'vries',
    stages: [
      { start: 4, doel: 0 },
      { start: 6, doel: 0 },
      { start: 3, doel: -3 },  // durf onder nul!
    ],
  },

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2500, y: 600, amount: 1 },
    { x: 3400, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 1350, y: 612, patrol: [1250, 1450] },
    { type: 'springer', x: 3400, y: 612, patrol: [3300, 3550] },
  ],

  star: { x: 2600, y: 360 },
  goudenNul: { x: 600, y: 280 },

  goal: { x: 4500, y: 588, value: 10 },

  reward: {
    title: 'ONDER-NUL UITGESPEELD! 🏆❄️',
    subtitle: 'De Vrieskoning dooit en buigt — de nul woont weer warm en blij!',
    stars: 5, medal: 'world18_done', medalLabel: 'Winter-Koning',
  },
};

export const WORLD18 = [LEVEL_18_1, LEVEL_18_2, LEVEL_18_3, LEVEL_18_4];
