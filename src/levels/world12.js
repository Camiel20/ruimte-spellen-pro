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
  naam: 'De Diepzee-Duik',

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
  intro: 'Een HAAI! Zwem naar de duikboot en vaar de diepte in! 🦈🫧',

  // Les 3 HERBOUWD (was ~= 12-1, "zwem+duik+vraag"). Nu een eigen verhaal: een
  // jaag-HAAI drijft je over het rif naar de duikboot; je maakt de tank vol
  // (7 ❤ 3) en VAART de haai voorbij, de donkere geul over. Aan de overkant een
  // rustige zwem-zone naar de vlag. De duikboot is hier de STER (één grote rit).
  platforms: [
    [0, 660, 2500, 140],     // het rif (haai-vlucht + duikboot-dok)
    [3400, 660, 2200, 140],  // de overkant (na de diepe geul)
    [340, 470, 170, 26],     // richel met de Gouden Nul (vóór de haai losbreekt)
  ],

  water: [[2500, 690, 900, 110]], // de diepe geul — alleen per duikboot!

  achtervolgingen: [
    { spawnX: 200, triggerX: 700, endX: 2100, skin: 'haai' }, // ZWEM! de haai jaagt!
  ],

  duikboten: [
    { x: 2250, landX: 3500, toon: 7, bellen: [[1650, 470, 6], [1820, 390, 3], [1980, 510, 8]] },
  ],

  zwemZones: [{ x: 4200, w: 600 }], // rustig omhoog zwemmen naar de ster

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 3600, y: 600, amount: 1 },              // na de landing
    { x: 4900, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'vlieger', x: 2900, y: 300, patrol: [2700, 3100] }, // een kwal boven de geul
    { type: 'springer', x: 3600, y: 612, patrol: [3500, 3750] },
    { type: 'vlieger', x: 4300, y: 280, patrol: [4100, 4500] }, // kwal in de zwem-zone
    { type: 'stomp', x: 5200, y: 612, patrol: [5100, 5400] },
  ],

  // Gouden Nul op de vroege richel (pak 'm vóór de haai losbreekt!); ster hoog
  // in de zwem-zone aan de overkant.
  star: { x: 4500, y: 210 },
  goudenNul: { x: 425, y: 420 },

  goal: { x: 5500, y: 588, value: 10 },

  reward: {
    title: 'Level 12-3 gehaald! 🏆',
    subtitle: 'De haai voorbij gevaren — 7 en 3 zijn verliefd, samen 10!',
    stars: 3, medal: 'adventure_12_3', medalLabel: 'Diepzee-Kapitein',
  },
};

export const LEVEL_12_4 = {
  id: '12-4',
  naam: 'De Stroom-Klim',

  worldW: 2400,
  worldH: 1800,
  killY: 1730,
  terrain: 'zee',
  bg: { top: 0x5fb8dd, bottom: 0x0f4a68 }, // licht bovenaan → donkere diepte onder

  start: { x: 90, y: 1560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Kom met de duikboot en ZWEM daarna de stroom omhoog! 🫧⬆️',

  // Les 4 HERBOUWD (was de "grote mix"). Nu de enige VERTICALE Bubbel-Zee-
  // beat: arriveer per duikboot (7 ❤ 3) onderin, en ZWEM daarna de stroom-
  // kolom omhoog — tik-tik-tik langs koraal-richels en kwallen naar de zwevende
  // vlag bovenin. Val je? Dan dobber je zacht terug (faal-vriendelijk; je kunt
  // in het water niet dood). NB: onderste vloer = platforms[0] (systemen
  // ankeren op de hoofdvloer); de vlag is een zweef-sensor (geen bonk).
  platforms: [
    [0, 1660, 900, 140],      // dok-vloer (start + duikboot) — hoofdvloer
    [1300, 1660, 1100, 140],  // klim-vloer (voet van de stroom-kolom)
    [1400, 1400, 150, 22],    // koraal-richel links
    [2150, 1200, 150, 22],    // koraal-richel rechts
    [1400, 1000, 150, 22],    // koraal-richel links
    [2150, 800, 150, 22],     // koraal-richel rechts (ster)
    [1400, 600, 150, 22],     // koraal-richel links (gouden nul)
  ],

  water: [[900, 1690, 400, 110]], // de geul onder de duikboot (900-1300)

  duikboten: [
    { x: 600, landX: 1400, toon: 7, bellen: [[220, 1560, 4], [380, 1500, 3], [520, 1560, 8]] },
  ],

  zwemZones: [{ x: 1400, w: 900 }], // de stroom-kolom: zwem omhoog!

  pickups: [
    { x: 250, y: 1600, amount: 1 },
    { x: 1560, y: 1600, amount: 1 }, // aan de voet van de kolom
  ],

  grommels: [
    { type: 'vlieger', x: 1800, y: 1250, patrol: [1450, 2250] }, // kwal
    { type: 'vlieger', x: 1950, y: 780, patrol: [1500, 2280] },  // kwal
    { type: 'vlieger', x: 1700, y: 440, patrol: [1450, 2050] },  // kwal bewaakt de top
  ],

  star: { x: 2225, y: 760 },       // op de rechter koraal-richel
  goudenNul: { x: 1475, y: 560 },  // op de hoge linker koraal-richel

  goal: { x: 1850, y: 320, value: 10 }, // zweeft bovenin de stroom-kolom

  reward: {
    title: 'Level 12-4 gehaald! 🏆',
    subtitle: 'De hele stroom omhoog gezwommen — naar de top van de zee!',
    stars: 3, medal: 'adventure_12_4', medalLabel: 'Stroom-Klimmer',
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
  // (finale 'slot' is verhuisd naar 14-5 — het Stuiter-Stadion is nu het einde)

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
    subtitle: 'De zee is gered — en er wachten alweer nieuwe landen!',
    stars: 5, medal: 'world12_done', medalLabel: 'Held van de Bubbel-Zee',
  },
};

export const WORLD12 = [LEVEL_12_1, LEVEL_12_2, LEVEL_12_3, LEVEL_12_4, LEVEL_12_5];
