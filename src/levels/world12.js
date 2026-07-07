// ===== WERELD 12 — DE BUBBEL-ZEE (leveldata) =====
// We duiken ÓNDER water! 🌊 Lichtstralen, koraal, kwallen en de gele
// duikboot. Concept: VERLIEFDE GETALLEN (samen 10) — dé rekenvaardigheid
// van groep 3. Twee nieuwe werkwoorden:
//   - ZWEMMEN 🐠 : in diep-water-zones zweef je en is elke sprong-tik een
//     zwemslag — tik-tik-tik omhoog naar sterren en gouden nullen.
//   - DE DUIKBOOT 🫧 : de lucht-tank toont "7 ❤ ? = 10"; alleen de bel met
//     het 10-maatje maakt hem PRECIES vol → instappen → golvend met
//     bubbel-spoor over de donkere geul varen! (Het geliefde raket-recept.)
// Eindbaas: de Inkt-Octopus — peuter zijn tentakels los met 10-maatjes.
// Elke vlag telt hier naar 10 — alles in deze wereld draait om de 10.

export const LEVEL_12_1 = {
  id: '12-1',
  naam: 'De Ondiepe Baai',

  worldW: 5000,
  worldH: 800,
  killY: 720,
  terrain: 'zee',
  bg: { top: 0x5fb8dd, bottom: 0x1f6f96 }, // licht water → dieper blauw

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Welkom onder water! Zoek het 10-maatje voor de duikboot 🫧',

  // Les 1: zwemmen (oefen-zone met de ster hoog) en de eerste duikboot:
  // 7 + ? = 10 → pak de 3-bel → varen over de diepe geul!
  platforms: [
    [0, 660, 2100, 140],     // de baai
    [2900, 660, 2100, 140],  // de overkant
  ],

  water: [[2100, 690, 800, 110]], // de diepe geul — alleen per duikboot!

  zwemZones: [{ x: 600, w: 500 }],

  duikboten: [
    { x: 1900, landX: 3060, toon: 7, bellen: [[1450, 480, 3], [1620, 400, 5], [1760, 520, 8]] },
  ],

  vraagMuren: [
    { x: 4000, kies: 'meer', opties: [9, 3] },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 1300, y: 600, amount: 1 },
    { x: 3800, y: 600, amount: 1, regen: true }, // vóór de vraagmuur
  ],

  grommels: [
    { type: 'stomp', x: 400, y: 612, patrol: [350, 550] },
    { type: 'vlieger', x: 1400, y: 300, patrol: [1200, 1600] }, // een kwal!
    { type: 'springer', x: 3470, y: 612, patrol: [3400, 3550] },
    { type: 'stomp', x: 4400, y: 612, patrol: [4300, 4500] },
  ],

  // Ster hoog in de zwem-zone (tik-tik-tik omhoog!); Gouden Nul hoog bij
  // het einde (dubbelsprong).
  star: { x: 850, y: 240 },
  goudenNul: { x: 4600, y: 250 },

  goal: { x: 4900, y: 588, value: 10 },

  reward: {
    title: 'Level 12-1 gehaald! 🏆',
    subtitle: '7 en 3 zijn verliefd — samen 10! Wat een duik!',
    stars: 3, medal: 'adventure_12_1', medalLabel: 'Diep-Duiker',
  },
};

export const LEVEL_12_2 = {
  id: '12-2',
  naam: 'Het Koraal-Rif',

  worldW: 5400,
  worldH: 800,
  killY: 720,
  terrain: 'zee',
  bg: { top: 0x54aed4, bottom: 0x1a628a },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Zwem het rif over — pas op voor kwallen en inkt! 🐠',

  // Les 2: zwemmen centraal. Klim zwemmend langs de koraal-richels (met een
  // kwal ertussen!), duw een kist, en een MINDER-muur als toetje.
  platforms: [
    [0, 660, 5400, 140],
    [1200, 430, 180, 26],   // koraal-richel 1
    [1500, 320, 180, 26],   // koraal-richel 2 (de ster!)
    [2600, 380, 200, 26],   // koraal-richel 3
  ],

  zwemZones: [{ x: 1100, w: 900 }, { x: 3600, w: 700 }],

  duwKisten: [3000],

  vraagMuren: [
    { x: 4400, kies: 'minder', opties: [2, 8] },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2300, y: 600, amount: 1 },
    { x: 4200, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 700, y: 612, patrol: [600, 800] },
    { type: 'vlieger', x: 1800, y: 280, patrol: [1600, 2000] }, // kwal in de zwem-zone!
    { type: 'springer', x: 2970, y: 612, patrol: [2900, 3050] },
    { type: 'werper', x: 3970, y: 612, patrol: [3900, 4050] }, // spuugt inkt!
    { type: 'stomp', x: 5000, y: 612, patrol: [4900, 5100] },
  ],

  star: { x: 1580, y: 260 },
  goudenNul: { x: 3950, y: 180 }, // helemaal bovenin zwem-zone 2 — zwem hoog!

  goal: { x: 5300, y: 588, value: 10 },

  reward: {
    title: 'Level 12-2 gehaald! 🏆',
    subtitle: 'Over het rif gezwommen als een echte vis!',
    stars: 3, medal: 'adventure_12_2', medalLabel: 'Rif-Zwemmer',
  },
};

export const LEVEL_12_3 = {
  id: '12-3',
  naam: 'De Donkere Geul',

  worldW: 5600,
  worldH: 800,
  killY: 720,
  terrain: 'zee',
  bg: { top: 0x4499c2, bottom: 0x14506e }, // hier wordt het donker…

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'TWEE geulen, TWEE duikboten — zoek beide 10-maatjes! 🫧🫧',

  // Les 3: de dubbele duikboot-tocht. 4 + ? en 8 + ? — twee tanks, twee
  // ritten over twee donkere geulen, met een zwem-eiland ertussen.
  platforms: [
    [0, 660, 1600, 140],
    [2400, 660, 1400, 140],  // het midden-eiland
    [4600, 660, 1000, 140],  // de overkant
    [600, 420, 180, 26],     // richel voor de Gouden Nul
  ],

  water: [[1600, 690, 800, 110], [3800, 690, 800, 110]],

  zwemZones: [{ x: 2700, w: 600 }],

  duikboten: [
    { x: 1400, landX: 2560, toon: 4, bellen: [[900, 500, 6], [1080, 420, 2], [1230, 520, 5]] },
    { x: 3600, landX: 4760, toon: 8, bellen: [[3000, 480, 2], [3180, 400, 6], [3330, 500, 1]] },
  ],

  vraagMuren: [
    { x: 3500, kies: 'meer', opties: [8, 4] },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2550, y: 600, amount: 1 },
    { x: 3350, y: 600, amount: 1, regen: true }, // vóór de vraagmuur
  ],

  grommels: [
    { type: 'stomp', x: 500, y: 612, patrol: [400, 600] },
    { type: 'springer', x: 2870, y: 612, patrol: [2800, 2950] },
    { type: 'vlieger', x: 3200, y: 280, patrol: [3000, 3400] },
    { type: 'stomp', x: 4900, y: 612, patrol: [4800, 5000] },
  ],

  // Ster hoog in de zwem-zone; Gouden Nul boven de start-richel.
  star: { x: 3000, y: 220 },
  goudenNul: { x: 690, y: 300 },

  goal: { x: 5450, y: 588, value: 10 },

  reward: {
    title: 'Level 12-3 gehaald! 🏆',
    subtitle: 'Twee geulen, twee verliefde paren — kapitein op de vloot!',
    stars: 3, medal: 'adventure_12_3', medalLabel: 'Geul-Kapitein',
  },
};

export const LEVEL_12_4 = {
  id: '12-4',
  naam: 'De Bellen-Tuin',

  worldW: 6000,
  worldH: 800,
  killY: 720,
  terrain: 'zee',
  bg: { top: 0x4fa8cc, bottom: 0x17587a },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'De grote bellen-tuin: zwem, vaar en maak overal 10! 💙',

  // Les 4: de grote mix. Een duikboot-rit als lucht-lift over het drukke
  // rif, twee zwem-zones, een duw-kist, een MINDER-muur en als finale een
  // portaal-som die óók 10 maakt (natuurlijk).
  platforms: [
    [0, 660, 6000, 140],
    [900, 420, 180, 26],    // koraal-richel
    [3300, 400, 200, 26],   // hoge richel met de ster
  ],

  zwemZones: [{ x: 1400, w: 800 }, { x: 4200, w: 600 }],

  duikboten: [
    { x: 2600, landX: 3920, toon: 6, bellen: [[2200, 480, 4], [2340, 400, 3], [2470, 520, 7]] },
  ],

  duwKisten: [1200],

  vraagMuren: [
    { x: 4800, kies: 'minder', opties: [3, 9] },
  ],

  portalen: [
    { x: 5150, doel: 10, opties: [[6, 4], [5, 3], [8, 3]] }, // ook hier: samen 10!
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2000, y: 600, amount: 1 },
    { x: 4600, y: 600, amount: 1, regen: true }, // vóór de vraagmuur
  ],

  grommels: [
    { type: 'stomp', x: 600, y: 612, patrol: [500, 700] },
    { type: 'springer', x: 1970, y: 612, patrol: [1900, 2050] },
    { type: 'glijder', x: 2300, y: 612, patrol: [2200, 2400] },
    { type: 'vlieger', x: 3300, y: 260, patrol: [3000, 3600] },
    { type: 'stomp', x: 4170, y: 612, patrol: [4100, 4250] },
  ],

  star: { x: 3400, y: 350 },
  goudenNul: { x: 4500, y: 180 }, // helemaal bovenin zwem-zone 2

  goal: { x: 5920, y: 588, value: 10 },

  reward: {
    title: 'Level 12-4 gehaald! 🏆',
    subtitle: 'Overal 10 gemaakt — de bellen-tuin bloeit voor jou!',
    stars: 3, medal: 'adventure_12_4', medalLabel: 'Bellen-Tuinier',
  },
};

export const LEVEL_12_5 = {
  id: '12-5',
  naam: 'De Inkt-Octopus',

  worldW: 5200,
  worldH: 800,
  killY: 720,
  terrain: 'zee',
  bg: { top: 0x3a86ad, bottom: 0x0f4460 }, // het diepste, donkerste water

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'De Inkt-Octopus verspert de weg — versla hem met 10-maatjes! 🐙',

  // De finale: een duikboot-aanloop (5 ❤ 5!) en dan de Inkt-Octopus: hij
  // toont steeds een getal — raak de bel die het tot 10 aanvult en een
  // tentakel laat los. Drie tentakels = doorgang vrij (en een blije,
  // schone octopus).
  platforms: [
    [0, 660, 5200, 140],
    [1300, 430, 200, 26], // ster-richel
  ],

  zwemZones: [{ x: 1800, w: 600 }],

  duikboten: [
    { x: 2700, landX: 3420, toon: 5, bellen: [[2300, 480, 5], [2440, 400, 3], [2560, 520, 4]] },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 900, y: 600, amount: 1 },
    { x: 3550, y: 600, amount: 1, regen: true }, // snack tussen de inkt-klodders
  ],

  grommels: [
    { type: 'stomp', x: 600, y: 612, patrol: [500, 700] },
    { type: 'vlieger', x: 2100, y: 280, patrol: [1900, 2300] }, // kwal in de zwem-zone
    { type: 'springer', x: 3070, y: 612, patrol: [3000, 3150] },
  ],

  boss: {
    x: 3900,
    name: 'De Inkt-Octopus',
    look: 'octopus',
    stijl: 'tien',
    stages: [
      { doel: 6, opties: [4, 2, 7] }, // 6 + 4 = 10
      { doel: 3, opties: [7, 5, 1] }, // 3 + 7 = 10
      { doel: 8, opties: [2, 6, 9] }, // 8 + 2 = 10
    ],
  },

  star: { x: 1400, y: 380 },
  goudenNul: { x: 2100, y: 180 }, // helemaal bovenin de zwem-zone

  goal: { x: 5000, y: 588, value: 10 },

  reward: {
    title: 'DE BUBBEL-ZEE UITGESPEELD! 🏆🌊',
    subtitle: 'Alle 10-maatjes gevonden — de octopus zwaait je blij uit!',
    stars: 5, medal: 'world12_done', medalLabel: 'Held van de Bubbel-Zee',
  },
};

export const WORLD12 = [LEVEL_12_1, LEVEL_12_2, LEVEL_12_3, LEVEL_12_4, LEVEL_12_5];
