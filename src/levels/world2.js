// ===== WERELD 2 — HANDJES-KUST (leveldata) =====
// Strand & zee. Concept: eerst KENNISMAKEN met 6 t/m 9 (het gat na Wereld 1,
// die tot 5 gaat), daarna vijftallen, DUBBELEN (3+3, 4+4, 5+5) en vooral
// SAMEN 10 MAKEN (partners van 10). Nieuw t.o.v. Wereld 1: water met
// stapstenen en grotere getallen. Krachten (dubbelsprong + stamp) blijven.
// Zelfde data-gedreven engine als Wereld 1 (zie AdventureScene / world1.js).

export const LEVEL_2_1 = {
  id: '2-1',
  naam: 'Zes en Zeven',

  worldW: 2200,
  worldH: 800,
  killY: 720,
  terrain: 'zand',
  bg: { top: 0x8fd3ff, bottom: 0xf3e2b0 }, // lucht → zand

  start: { x: 90, y: 560 },
  startDoubleJump: true, // krachten van Wereld 1 blijven
  startStamp: true,
  intro: 'Welkom op de kust! Ontmoet Zes en Zeven!',

  // Rustig kennismakings-level: twee nieuwe vriendjes, één stapsteen-sprong.
  platforms: [
    [0, 660, 700, 140],     // zand A (start, Zes)
    [790, 660, 150, 40],    // stapsteen
    [1040, 660, 600, 140],  // zand B (Zeven, ster)
    [1730, 660, 150, 40],   // stapsteen 2
    [1980, 660, 220, 140],  // zand C — met de vlag
  ],

  // Water (alleen visueel) onder de stapsteen-stukken.
  water: [
    [700, 692, 340, 108],
    [1640, 692, 340, 108],
  ],

  // Groei-bolletjes: het figuurtje groeit onderweg mee.
  pickups: [
    { x: 240, y: 600, amount: 1 },
    { x: 500, y: 600, amount: 1 },
    { x: 1200, y: 600, amount: 1 },
  ],

  // Nieuwe vriendjes! Zes = 3+3 (het eerste DUBBEL) en Zeven = 3+4.
  rescues: [
    { x: 350, y: 636, doel: 6, blocks: [3, 3], name: 'Zes' },
    { x: 1350, y: 636, doel: 7, blocks: [3, 4], name: 'Zeven' },
  ],

  grommels: [
    { type: 'stomp', x: 1520, y: 612, patrol: [1430, 1600] },
  ],

  // Ster boven zand B — met de dubbelsprong.
  star: { x: 1150, y: 430 },

  goal: { x: 2100, y: 588, value: 7 },

  reward: {
    title: 'Level 2-1 gehaald! 🏆',
    subtitle: 'Je hebt Zes en Zeven ontmoet!',
    stars: 3, medal: 'adventure_2_1', medalLabel: 'Vrienden-Vinder',
  },
};

export const LEVEL_2_2 = {
  id: '2-2',
  naam: 'Acht en Negen',

  worldW: 2400,
  worldH: 800,
  killY: 720,
  terrain: 'zand',
  bg: { top: 0x8fd3ff, bottom: 0xf7dda6 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  intro: 'Bouw de 8 — dubbel vier! En red Negen!',
  afterGate: 'Ren verder! 🚩',

  platforms: [
    [0, 660, 800, 140],     // zand A (start)
    [1160, 660, 700, 140],  // zand B (Negen)
    [1920, 660, 140, 40],   // stapsteen
    [2160, 660, 240, 140],  // zand C — met de vlag
  ],

  water: [
    [800, 692, 360, 108],
    [1860, 692, 300, 108],
  ],

  pickups: [
    { x: 260, y: 600, amount: 1 },
    { x: 520, y: 600, amount: 1 },
    { x: 1700, y: 600, amount: 1 },
  ],

  // Brug over zee: bouw de 8 door VIER te DUBBELEN (4 + 4).
  gate: {
    type: 'brug',
    gapX: 800, gapW: 360,
    y: 650,
    doel: 8,
    blocks: [4, 4],
    triggerX: 680,
    triggerW: 120,
    water: true,
  },

  // Nieuw vriendje: Negen = 4+5.
  rescues: [
    { x: 1400, y: 636, doel: 9, blocks: [4, 5], name: 'Negen' },
  ],

  grommels: [
    { type: 'stomp', x: 420, y: 612, patrol: [330, 560] },
    { type: 'stomp', x: 1620, y: 612, patrol: [1520, 1760] },
  ],

  // Ster boven zand B.
  star: { x: 1280, y: 424 },

  goal: { x: 2320, y: 588, value: 9 },

  reward: {
    title: 'Level 2-2 gehaald! 🏆',
    subtitle: 'Dubbel vier is acht — en je hebt Negen gered!',
    stars: 3, medal: 'adventure_2_2', medalLabel: 'Dubbel-Denker',
  },
};

export const LEVEL_2_3 = {
  id: '2-3',
  naam: 'Samen Tien op de Kust',

  worldW: 2400,
  worldH: 800,
  killY: 720,
  terrain: 'zand',
  bg: { top: 0x8fd3ff, bottom: 0xf3e2b0 }, // lucht → zand

  start: { x: 90, y: 560 },
  startDoubleJump: true, // krachten van Wereld 1 blijven
  startStamp: true,
  intro: 'Maak samen 10!',

  // Zand-eilanden met stapstenen ertussen; daarna een brug-poort over zee.
  platforms: [
    [0, 660, 600, 140],     // zand A (start)
    [690, 660, 150, 40],    // stapsteen 1
    [930, 660, 150, 40],    // stapsteen 2
    [1170, 660, 500, 140],  // zand B
    [2030, 660, 370, 140],  // zand C (na de brug) — met de vlag
  ],

  // Water (alleen visueel) onder het stapsteen-gedeelte.
  water: [
    [600, 692, 1070, 108],
  ],

  // Groei-bolletjes: het figuurtje groeit onderweg mee (1 → 5).
  pickups: [
    { x: 240, y: 600, amount: 1 },
    { x: 470, y: 600, amount: 1 },
    { x: 1300, y: 600, amount: 1 },
    { x: 1520, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'stomp', x: 300, y: 612, patrol: [180, 520] },
  ],

  // Brug over zee: maak SAMEN 10 (4 + 6). Grotere som = Wereld-2-concept.
  gate: {
    type: 'brug',
    gapX: 1670, gapW: 360,
    y: 650,
    doel: 10,
    blocks: [4, 6],
    triggerX: 1550,
    triggerW: 120,
    water: true, // teken de kloof als water i.p.v. donkere spleet
  },

  // Ster boven zand B — met de dubbelsprong.
  star: { x: 1400, y: 430 },

  goal: { x: 2300, y: 588, value: 10 },

  reward: {
    title: 'Level 2-3 gehaald! 🏆',
    subtitle: 'Je hebt samen 10 gemaakt op de kust!',
    stars: 3, medal: 'adventure_2_3', medalLabel: 'Tien-Maker',
  },
};

export const LEVEL_2_4 = {
  id: '2-4',
  naam: 'Dubbel Vijf op het Strand',

  worldW: 2600,
  worldH: 800,
  killY: 720,
  terrain: 'zand',
  bg: { top: 0x8fd3ff, bottom: 0xf7d99a }, // lucht → warm zand

  start: { x: 90, y: 560 },
  startDoubleJump: true, // krachten van Wereld 1 blijven
  startStamp: true,
  intro: 'Red Vier en Vijf, en maak samen 10!',
  afterGate: 'Ren naar de vlag! 🚩',

  // Zand-eilanden met stapstenen over de zee ertussen, daarna de brug-poort.
  platforms: [
    [0, 660, 700, 140],     // zand A (start, Vier, Grommel)
    [790, 660, 140, 40],    // stapsteen 1
    [1010, 660, 140, 40],   // stapsteen 2
    [1230, 660, 600, 140],  // zand B (Vijf, ster, brug-aanloop)
    [2190, 660, 410, 140],  // zand C (na de brug) — met de vlag
  ],

  // Water (alleen visueel) onder het stapsteen-gedeelte.
  water: [
    [700, 692, 530, 108],
  ],

  // Groei-bolletjes: het figuurtje groeit onderweg mee (1 → 5).
  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 480, y: 600, amount: 1 },
    { x: 1300, y: 600, amount: 1 },
    { x: 1500, y: 600, amount: 1 },
  ],

  // Twee vriendjes redden: eerst Vier (dubbel twee!), dan Vijf. Deze redding
  // geeft geen kracht (die heb je al uit Wereld 1) — puur het bouwplezier én
  // de opbouw naar "dubbel vijf is tien" bij de brug.
  rescues: [
    { x: 350, y: 636, doel: 4, blocks: [2, 2], name: 'Vier' },
    { x: 1400, y: 636, doel: 5, blocks: [2, 3], name: 'Vijf' },
  ],

  grommels: [
    { type: 'stomp', x: 520, y: 612, patrol: [430, 660] },
    { type: 'stomp', x: 1650, y: 612, patrol: [1560, 1790] },
  ],

  // Brug over zee: maak SAMEN 10 door VIJF te DUBBELEN (5 + 5).
  gate: {
    type: 'brug',
    gapX: 1830, gapW: 360,
    y: 650,
    doel: 10,
    blocks: [5, 5],
    triggerX: 1710,
    triggerW: 120,
    water: true, // teken de kloof als water i.p.v. donkere spleet
  },

  // Ster hoog boven zand B — pak 'm met de dubbelsprong.
  star: { x: 1520, y: 424 },

  goal: { x: 2490, y: 588, value: 10 },

  reward: {
    title: 'Level 2-4 gehaald! 🏆',
    subtitle: 'Dubbel vijf is tien — knap gedaan!',
    stars: 3, medal: 'adventure_2_4', medalLabel: 'Dubbel-Held',
  },
};

export const LEVEL_2_5 = {
  id: '2-5',
  naam: 'Partners van Tien',

  worldW: 3300,
  worldH: 800,
  killY: 720,
  terrain: 'zand',
  bg: { top: 0x8fd3ff, bottom: 0xf3e2b0 }, // lucht → zand

  start: { x: 90, y: 560 },
  startDoubleJump: true, // krachten van Wereld 1 blijven
  startStamp: true,
  intro: 'Zoek telkens de twee die samen 10 zijn!',
  afterGate: 'Top! Op naar de volgende brug! 🚩',

  // Vier zand-eilanden, gescheiden door drie zee-kloven. Elke kloof overbrug je
  // door SAMEN 10 te maken — maar nu liggen er méér blokjes klaar dan nodig:
  // Adrian moet zélf het paar kiezen dat samen 10 is (één afleider per brug).
  platforms: [
    [0, 660, 620, 140],     // zand A (start)
    [980, 660, 560, 140],   // zand B
    [1900, 660, 560, 140],  // zand C
    [2820, 660, 480, 140],  // zand D — met de vlag
  ],

  // Drie bruggen; elk maakt 10 uit een ander partner-paar, met één afleider.
  gates: [
    { type: 'brug', gapX: 620,  gapW: 360, y: 650, doel: 10, blocks: [3, 4, 7], triggerX: 500,  triggerW: 120, water: true }, // 3 + 7 (afleider 4)
    { type: 'brug', gapX: 1540, gapW: 360, y: 650, doel: 10, blocks: [2, 5, 8], triggerX: 1420, triggerW: 120, water: true }, // 2 + 8 (afleider 5)
    { type: 'brug', gapX: 2460, gapW: 360, y: 650, doel: 10, blocks: [1, 4, 6], triggerX: 2340, triggerW: 120, water: true }, // 4 + 6 (afleider 1)
  ],

  // Groei-bolletjes: het figuurtje groeit onderweg mee (1 → 5).
  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 1100, y: 600, amount: 1 },
    { x: 2000, y: 600, amount: 1 },
    { x: 2900, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'stomp', x: 1200, y: 612, patrol: [1040, 1500] },
    { type: 'stomp', x: 2100, y: 612, patrol: [1960, 2420] },
  ],

  // Ster hoog boven zand B — pak 'm met de dubbelsprong.
  star: { x: 1250, y: 424 },

  goal: { x: 3180, y: 588, value: 10 },

  reward: {
    title: 'Level 2-5 gehaald! 🏆',
    subtitle: 'Jij kent alle partners van tien!',
    stars: 3, medal: 'adventure_2_5', medalLabel: 'Tien-Partner',
  },
};

export const LEVEL_2_6 = {
  id: '2-6',
  naam: 'Meester van Tien',

  worldW: 3400,
  worldH: 800,
  killY: 720,
  terrain: 'zand',
  bg: { top: 0x8fd3ff, bottom: 0xf3e2b0 }, // lucht → zand

  start: { x: 90, y: 560 },
  startDoubleJump: true, // krachten van Wereld 1 blijven
  startStamp: true,
  intro: 'Toon dat je een Meester van Tien bent!',
  afterGate: 'Goed zo! Op naar de volgende brug! 🚩',

  // Vier zand-eilanden, drie zee-kloven. Grootste Wereld 2-level vóór de baas:
  // alles komt samen (partners + dubbelen) mét een dubbelsprong-muur ertussen.
  platforms: [
    [0, 660, 560, 140],     // zand A (start)
    [920, 660, 640, 140],   // zand B
    [1920, 660, 640, 140],  // zand C — met de dubbelsprong-muur
    [2200, 470, 60, 190],   // hoge MUUR op C: alleen met dubbelsprong eroverheen
    [2920, 660, 480, 140],  // zand D — met de vlag
  ],

  // Groei-bolletjes: het figuurtje groeit onderweg mee (1 → 5).
  pickups: [
    { x: 200, y: 600, amount: 1 },
    { x: 1050, y: 600, amount: 1 },
    { x: 2050, y: 600, amount: 1 },
    { x: 3050, y: 600, amount: 1 },
  ],

  // Drie bruggen; nu telkens VIER blokjes klaar met méér keuze — Adrian moet
  // zelf een paar vinden dat samen 10 is (partners én dubbelen door elkaar).
  gates: [
    { type: 'brug', gapX: 560,  gapW: 360, y: 650, doel: 10, blocks: [2, 4, 6, 8], triggerX: 440,  triggerW: 120, water: true }, // 2+8 of 4+6
    { type: 'brug', gapX: 1560, gapW: 360, y: 650, doel: 10, blocks: [3, 5, 5, 7], triggerX: 1440, triggerW: 120, water: true }, // 5+5 of 3+7
    { type: 'brug', gapX: 2560, gapW: 360, y: 650, doel: 10, blocks: [1, 4, 6, 9], triggerX: 2440, triggerW: 120, water: true }, // 1+9 of 4+6
  ],

  grommels: [
    { type: 'stomp', x: 300,  y: 612, patrol: [180, 500] },
    { type: 'stomp', x: 1200, y: 612, patrol: [980, 1520] },
    { type: 'stomp', x: 2400, y: 612, patrol: [2260, 2520] }, // ná de muur
  ],

  // Ster hoog boven de muur — pak 'm tijdens de verplichte dubbelsprong-hop.
  star: { x: 2230, y: 430 },

  goal: { x: 3300, y: 588, value: 10 },

  reward: {
    title: 'Level 2-6 gehaald! 🏆',
    subtitle: 'Jij bent een echte Meester van Tien!',
    stars: 3, medal: 'adventure_2_6', medalLabel: 'Meester van Tien',
  },
};

export const LEVEL_2_7 = {
  id: '2-7',
  naam: 'De Golf-Baas',

  worldW: 2000,
  worldH: 800,
  killY: 720,
  terrain: 'zand',
  bg: { top: 0x6fa8d8, bottom: 0xe8d8b0 }, // grauwere lucht boven het strand — spannend

  start: { x: 90, y: 560 },
  startDoubleJump: true, // krachten van Wereld 1 blijven
  startStamp: true,
  intro: 'De Golf-Baas! Bouw de 10 — en spring over zijn golven!',

  // Doorlopende strand-arena; de baas verspert de weg tot je 'm verslaat.
  platforms: [
    [0, 660, 2000, 140],
  ],

  // Groei-bolletjes: het figuurtje groeit onderweg mee (1 → 5).
  pickups: [
    { x: 250,  y: 600, amount: 1 },
    { x: 520,  y: 600, amount: 1 },
    { x: 780,  y: 600, amount: 1 },
    { x: 1040, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'stomp', x: 500, y: 612, patrol: [360, 760] },
    { type: 'stomp', x: 950, y: 612, patrol: [800, 1150] },
  ],

  // De Golf-Baas: drie golven, elke keer bouw je 10 — maar met steeds méér
  // keuze (2 blokjes → 3 met afleider → 4 om uit te kiezen). Geweldloos verslaan.
  boss: {
    x: 1500,
    name: 'Golf-Baas',
    look: 'golf', // eigen art + golf-aanval (i.p.v. de grijze Grommel-baas van W1)
    stages: [
      { doel: 10, blocks: [4, 6] },
      { doel: 10, blocks: [3, 5, 7] },
      { doel: 10, blocks: [2, 4, 6, 8] },
    ],
  },

  goal: { x: 1850, y: 588, value: 10 },

  reward: {
    title: 'WERELD 2 UITGESPEELD! 🏆🎉',
    subtitle: 'Je hebt de Golf-Baas verslagen en Wereld 2 gered!',
    stars: 5, medal: 'world2_done', medalLabel: 'Held van Wereld 2',
  },
};

export const WORLD2 = [LEVEL_2_1, LEVEL_2_2, LEVEL_2_3, LEVEL_2_4, LEVEL_2_5, LEVEL_2_6, LEVEL_2_7];
