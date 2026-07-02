// ===== WERELD 2 — HANDJES-KUST (leveldata) =====
// Strand & zee. Concept: vijftallen, dubbelen, en vooral SAMEN 10 MAKEN.
// Nieuw t.o.v. Wereld 1: water met stapstenen (springen over zee) en grotere
// getallen (bouw 10). Je houdt je geleerde krachten (dubbelsprong + stamp).
// Zelfde data-gedreven engine als Wereld 1 (zie AdventureScene / world1.js).

export const LEVEL_2_1 = {
  id: '2-1',
  naam: 'Samen Tien op de Kust',

  worldW: 2400,
  worldH: 800,
  killY: 720,
  bg: { top: 0x8fd3ff, bottom: 0xf3e2b0 }, // lucht → zand

  start: { x: 90, y: 560 },
  startDoubleJump: true, // krachten van Wereld 1 blijven
  startStamp: true,
  intro: 'Welkom op de kust! Maak samen 10!',

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
    title: 'Level 2-1 gehaald! 🏆',
    subtitle: 'Je hebt samen 10 gemaakt op de kust!',
    stars: 3, medal: 'adventure_2_1', medalLabel: 'Tien-Maker',
  },
};

export const LEVEL_2_2 = {
  id: '2-2',
  naam: 'Dubbel Vijf op het Strand',

  worldW: 2600,
  worldH: 800,
  killY: 720,
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
    title: 'Level 2-2 gehaald! 🏆',
    subtitle: 'Dubbel vijf is tien — knap gedaan!',
    stars: 3, medal: 'adventure_2_2', medalLabel: 'Dubbel-Held',
  },
};

export const LEVEL_2_3 = {
  id: '2-3',
  naam: 'Partners van Tien',

  worldW: 3300,
  worldH: 800,
  killY: 720,
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
    title: 'Level 2-3 gehaald! 🏆',
    subtitle: 'Jij kent alle partners van tien!',
    stars: 3, medal: 'adventure_2_3', medalLabel: 'Tien-Partner',
  },
};

export const WORLD2 = [LEVEL_2_1, LEVEL_2_2, LEVEL_2_3];
