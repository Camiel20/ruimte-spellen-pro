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
  intro: 'Spring over de wolkjes — en maak samen 10!',

  // Zand-eilanden met TEL-WOLKEN ertussen (verdwijn-platforms op ritme!);
  // daarna een brug-poort over zee.
  platforms: [
    [0, 660, 600, 140],     // zand A (start)
    [1170, 660, 500, 140],  // zand B
    [2030, 660, 370, 140],  // zand C (na de brug) — met de vlag
  ],

  // Wolkjes boven zee: om-en-om aan/uit — spring op het goede moment!
  telWolken: [
    [690, 640, 150, 0],
    [930, 640, 150, 1700],
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
  naam: 'De Dubbel-Deuren',

  worldW: 2600,
  worldH: 800,
  killY: 720,
  terrain: 'zand',
  bg: { top: 0x8fd3ff, bottom: 0xf7d99a }, // lucht → warm zand

  start: { x: 90, y: 560 },
  startDoubleJump: true, // krachten van Wereld 1 blijven
  startStamp: true,
  intro: 'Dubbel! Word 4 (2+2), dan 6 (3+3)!',

  // GEEN brug dit keer — DEUREN (het wees-N-werkwoord, nieuw voor de kust):
  // word precies het dubbel-getal door bolletjes te pakken. Te groot geworden?
  // Een Grommel-tik maakt je weer kleiner, en de magische bolletjes groeien
  // terug — je kunt dus nooit vastlopen.
  platforms: [
    [0, 660, 2600, 140], // doorlopend strand (faal-vriendelijk)
  ],

  // Vriendjes redden blijft: Vier is zelf een dubbel (2+2)!
  rescues: [
    { x: 330, y: 636, doel: 4, blocks: [2, 2], name: 'Vier' },
    { x: 1330, y: 636, doel: 5, blocks: [2, 3], name: 'Vijf' },
  ],

  pickups: [
    { x: 480, y: 600, amount: 1 },
    { x: 620, y: 600, amount: 1 },
    { x: 760, y: 600, amount: 1 },              // 1 → 4 bij de eerste deur
    { x: 880, y: 600, amount: 1, regen: true }, // magisch: altijd bij te tanken
    { x: 1540, y: 600, amount: 1 },
    { x: 1680, y: 600, amount: 1 },             // 4 → 6 bij de tweede deur
    { x: 1810, y: 600, amount: 1, regen: true },
  ],

  doors: [
    { x: 1020, doel: 4, topY: 120 }, // wees 4 — dubbel twee
    { x: 1960, doel: 6, topY: 120 }, // wees 6 — dubbel drie
  ],

  grommels: [
    { type: 'stomp', x: 400, y: 612, patrol: [300, 560] },
    { type: 'stomp', x: 1450, y: 612, patrol: [1380, 1600] },
    { type: 'stomp', x: 2200, y: 612, patrol: [2100, 2340] },
  ],

  // Ster hoog boven de bolletjes-baan — pak 'm met de dubbelsprong.
  star: { x: 700, y: 430 },

  goal: { x: 2490, y: 588, value: 6 },

  reward: {
    title: 'Level 2-4 gehaald! 🏆',
    subtitle: '2+2=4 en 3+3=6 — jij bent een dubbel-held!',
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
  intro: 'Wolken-ritme én samen 10 — laat zien wat je kunt!',
  afterGate: 'Meester van Tien! Naar de vlag! 🚩',

  // De meesterproef van de kust — GEEN drie bruggen meer, maar alles wat je
  // op de kust leerde in één tocht: een lange TEL-WOLKEN-cascade boven zee
  // (timing!), een springende Grommel, en één grote keuze-brug waarin twee
  // paren van 10 verstopt zitten (2+8 of 5+5).
  platforms: [
    [0, 660, 700, 140],     // zand A (start)
    [1550, 660, 600, 140],  // zand B
    [2510, 660, 890, 140],  // zand C — met de vlag
  ],

  // Drie wolken om-en-om aan/uit: spring op het ritme de zee over.
  telWolken: [
    [770, 640, 150, 0],
    [1010, 640, 150, 1100],
    [1250, 640, 150, 2200],
  ],

  water: [
    [700, 692, 850, 108],
  ],

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 500, y: 600, amount: 1 },
    { x: 1700, y: 600, amount: 1 },
    { x: 2650, y: 600, amount: 1 },
  ],

  // Eén grote keuze-brug: vier blokjes, twee goede paren (2+8 of 5+5).
  gate: {
    type: 'brug',
    gapX: 2150, gapW: 360,
    y: 650,
    doel: 10,
    blocks: [2, 5, 5, 8],
    triggerX: 2030,
    triggerW: 120,
    water: true,
  },

  grommels: [
    { type: 'stomp', x: 350, y: 612, patrol: [250, 550] },
    { type: 'springer', x: 1800, y: 612, patrol: [1650, 1950] }, // nieuw: hij hupt!
    { type: 'stomp', x: 2800, y: 612, patrol: [2700, 2980] },
  ],

  // Ster boven de middelste wolk: pak 'm midden in het ritme (voor durvers!)
  star: { x: 1085, y: 540 },

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

  // Verstopte ster boven de arena: pak 'm tussen de golven door!
  star: { x: 880, y: 436 },

  goal: { x: 1850, y: 588, value: 10 },

  reward: {
    title: 'WERELD 2 UITGESPEELD! 🏆🎉',
    subtitle: 'Je hebt de Golf-Baas verslagen en Wereld 2 gered!',
    stars: 5, medal: 'world2_done', medalLabel: 'Held van Wereld 2',
  },
};

export const WORLD2 = [LEVEL_2_1, LEVEL_2_2, LEVEL_2_3, LEVEL_2_4, LEVEL_2_5, LEVEL_2_6, LEVEL_2_7];
