// ===== WERELD 2 — HANDJES-KUST (leveldata) =====
// Strand & zee. Concept: eerst KENNISMAKEN met 6 t/m 9 (het gat na Wereld 1,
// die tot 5 gaat), daarna vijftallen, DUBBELEN (3+3, 4+4, 5+5) en vooral
// SAMEN 10 MAKEN (partners van 10). Nieuw t.o.v. Wereld 1: water met
// stapstenen en grotere getallen. Krachten (dubbelsprong + stamp) blijven.
// Zelfde data-gedreven engine als Wereld 1 (zie AdventureScene / world1.js).
//
// RENOVATIE 2026-07-07: alle levels naar de norm (4800-5400px, 4-6 beats),
// 2-6 is nu een VERTICALE wolken-klim en de Golf-Baas (2-7) heeft een eigen
// gevecht: stijl 'surf' — TEL zijn golven en raak de goede schelp.

export const LEVEL_2_1 = {
  id: '2-1',
  naam: 'Zes en Zeven',

  worldW: 4800,
  worldH: 800,
  killY: 720,
  terrain: 'zand',
  bg: { top: 0x8fd3ff, bottom: 0xf3e2b0 }, // lucht → zand

  start: { x: 90, y: 560 },
  startDoubleJump: true, // krachten van Wereld 1 blijven
  startStamp: true,
  intro: 'Welkom op de kust! Ontmoet Zes en Zeven!',

  // Beat 1: red Zes → beat 2: stapsteen-water → beat 3: red Zeven (+ ster) →
  // beat 4: de drieling-stapstenen → beat 5: springer-strand → vlag.
  platforms: [
    [0, 660, 700, 140],      // zand A (start, Zes)
    [790, 660, 150, 40],     // stapsteen
    [1040, 660, 900, 140],   // zand B (Zeven, ster)
    [2040, 660, 140, 40],    // stapsteen-drieling…
    [2280, 660, 140, 40],
    [2520, 660, 140, 40],
    [2760, 660, 1200, 140],  // zand C (springer-strand)
    [4060, 660, 150, 40],    // laatste stapsteen
    [4310, 660, 490, 140],   // zand D — met de vlag
  ],

  // Water (alleen visueel) onder de stapsteen-stukken.
  water: [
    [700, 692, 340, 108],
    [1940, 692, 820, 108],
    [3960, 692, 350, 108],
  ],

  pickups: [
    { x: 240, y: 600, amount: 1 },
    { x: 500, y: 600, amount: 1 },
    { x: 1200, y: 600, amount: 1 },
    { x: 2900, y: 600, amount: 1 },
    { x: 3600, y: 600, amount: 1 },
  ],

  // Nieuwe vriendjes! Zes = 3+3 (het eerste DUBBEL) en Zeven = 3+4.
  rescues: [
    { x: 350, y: 636, doel: 6, blocks: [3, 3], name: 'Zes' },
    { x: 1350, y: 636, doel: 7, blocks: [3, 4], name: 'Zeven' },
  ],

  grommels: [
    { type: 'stomp', x: 1520, y: 612, patrol: [1430, 1600] },
    { type: 'springer', x: 3100, y: 612, patrol: [3000, 3200] },
    { type: 'stomp', x: 3600, y: 612, patrol: [3500, 3700] },
  ],

  // Ster boven zand B — met de dubbelsprong.
  star: { x: 1150, y: 430 },

  goal: { x: 4650, y: 588, value: 7 },

  reward: {
    title: 'Level 2-1 gehaald! 🏆',
    subtitle: 'Je hebt Zes en Zeven ontmoet!',
    stars: 3, medal: 'adventure_2_1', medalLabel: 'Vrienden-Vinder',
  },
};

export const LEVEL_2_2 = {
  id: '2-2',
  naam: 'Acht en Negen',

  worldW: 5000,
  worldH: 800,
  killY: 720,
  terrain: 'zand',
  bg: { top: 0x8fd3ff, bottom: 0xf7dda6 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  intro: 'Bouw de 8 — dubbel vier! En red Negen!',
  afterGate: 'Ren verder! 🚩',

  // Beat 1: brug 8 (dubbel 4) → beat 2: red Negen (+ ster) → beat 3: de
  // TWEEDE brug: dubbel 3 met een afleider → beat 4: springer-strand →
  // beat 5: stapsteen naar de vlag.
  platforms: [
    [0, 660, 800, 140],      // zand A (start)
    [1160, 660, 1700, 140],  // zand B (Negen)
    [3220, 660, 900, 140],   // zand C (na brug 2)
    [4220, 660, 140, 40],    // stapsteen
    [4460, 660, 540, 140],   // zand D — met de vlag
  ],

  water: [
    [800, 692, 360, 108],
    [2860, 692, 360, 108],
    [4120, 692, 340, 108],
  ],

  pickups: [
    { x: 260, y: 600, amount: 1 },
    { x: 520, y: 600, amount: 1 },
    { x: 1700, y: 600, amount: 1 },
    { x: 3350, y: 600, amount: 1 },
    { x: 4550, y: 600, amount: 1 },
  ],

  // Twee bruggen: bouw de 8 door VIER te DUBBELEN, daarna dubbel DRIE
  // (met een afleider — kies zelf het paar!).
  gates: [
    { type: 'brug', gapX: 800, gapW: 360, y: 650, doel: 8, blocks: [4, 4], triggerX: 680, triggerW: 120, water: true },
    { type: 'brug', gapX: 2860, gapW: 360, y: 650, doel: 6, blocks: [3, 3, 4], triggerX: 2740, triggerW: 120, water: true },
  ],

  // Nieuw vriendje: Negen = 4+5.
  rescues: [
    { x: 1400, y: 636, doel: 9, blocks: [4, 5], name: 'Negen' },
  ],

  grommels: [
    { type: 'stomp', x: 420, y: 612, patrol: [330, 560] },
    { type: 'stomp', x: 1620, y: 612, patrol: [1520, 1760] },
    { type: 'springer', x: 3500, y: 612, patrol: [3400, 3600] },
    { type: 'stomp', x: 3900, y: 612, patrol: [3800, 4000] },
  ],

  // Ster boven zand B.
  star: { x: 1280, y: 424 },

  goal: { x: 4850, y: 588, value: 9 },

  reward: {
    title: 'Level 2-2 gehaald! 🏆',
    subtitle: 'Dubbel vier is acht — en je hebt Negen gered!',
    stars: 3, medal: 'adventure_2_2', medalLabel: 'Dubbel-Denker',
  },
};

export const LEVEL_2_3 = {
  id: '2-3',
  naam: 'Samen Tien op de Kust',

  worldW: 5000,
  worldH: 800,
  killY: 720,
  terrain: 'zand',
  bg: { top: 0x8fd3ff, bottom: 0xf3e2b0 }, // lucht → zand

  start: { x: 90, y: 560 },
  startDoubleJump: true, // krachten van Wereld 1 blijven
  startStamp: true,
  intro: 'Spring over de wolkjes — en maak samen 10!',

  // Beat 1: twee tel-wolken → beat 2: brug 10 (4+6) → beat 3: de grote
  // wolken-cascade (drie op ritme!) → beat 4: brug 10 met afleider (3+7) →
  // beat 5: de vlag.
  platforms: [
    [0, 660, 600, 140],      // zand A (start)
    [1170, 660, 500, 140],   // zand B
    [2030, 660, 600, 140],   // zand C
    [3420, 660, 600, 140],   // zand D
    [4380, 660, 620, 140],   // zand E — met de vlag
  ],

  // Wolkjes boven zee: om-en-om aan/uit — spring op het goede moment!
  telWolken: [
    [690, 640, 150, 0],
    [930, 640, 150, 1700],
    [2710, 640, 150, 0],
    [2950, 640, 150, 1100],
    [3190, 640, 150, 2200],
  ],

  water: [
    [600, 692, 1070, 108],
    [2630, 692, 790, 108],
    [4020, 692, 360, 108],
  ],

  pickups: [
    { x: 240, y: 600, amount: 1 },
    { x: 470, y: 600, amount: 1 },
    { x: 1300, y: 600, amount: 1 },
    { x: 2200, y: 600, amount: 1 },
    { x: 3550, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'stomp', x: 300, y: 612, patrol: [180, 520] },
    { type: 'stomp', x: 2300, y: 612, patrol: [2150, 2500] },
    { type: 'springer', x: 3650, y: 612, patrol: [3550, 3750] },
    { type: 'stomp', x: 4600, y: 612, patrol: [4500, 4750] },
  ],

  // Twee bruggen over zee: samen 10 (4+6), en daarna 10 uit drie blokjes
  // (3+7, met de 5 als afleider — kies het goede paar!).
  gates: [
    { type: 'brug', gapX: 1670, gapW: 360, y: 650, doel: 10, blocks: [4, 6], triggerX: 1550, triggerW: 120, water: true },
    { type: 'brug', gapX: 4020, gapW: 360, y: 650, doel: 10, blocks: [3, 5, 7], triggerX: 3900, triggerW: 120, water: true },
  ],

  // Ster boven zand B — met de dubbelsprong.
  star: { x: 1400, y: 430 },

  goal: { x: 4850, y: 588, value: 10 },

  reward: {
    title: 'Level 2-3 gehaald! 🏆',
    subtitle: 'Je hebt samen 10 gemaakt op de kust!',
    stars: 3, medal: 'adventure_2_3', medalLabel: 'Tien-Maker',
  },
};

export const LEVEL_2_4 = {
  id: '2-4',
  naam: 'De Dubbel-Deuren',

  worldW: 5000,
  worldH: 800,
  killY: 720,
  terrain: 'zand',
  bg: { top: 0x8fd3ff, bottom: 0xf7d99a }, // lucht → warm zand

  start: { x: 90, y: 560 },
  startDoubleJump: true, // krachten van Wereld 1 blijven
  startStamp: true,
  intro: 'Dubbel! Word 4, dan 6 — en dan 8!',

  // GEEN brug dit keer — DEUREN (het wees-N-werkwoord): word precies het
  // dubbel-getal. Drie deuren nu: 4 (2+2), 6 (3+3) en 8 (4+4). Te groot?
  // Tik op jezelf om te splitsen — je kunt nooit vastlopen (regen-bolletjes).
  platforms: [
    [0, 660, 5000, 140],   // doorlopend strand (faal-vriendelijk)
    [2140, 340, 180, 26],  // hoge richel: alleen te halen via de duw-kist
  ],

  // Je eerste duw-kist! Schuif hem onder de richel en klim naar de ster.
  duwKisten: [2060],

  // Vriendjes redden blijft: Vier is zelf een dubbel (2+2) — en de sterkste
  // van het stel: hij leert je ZWARE KISTEN DUWEN (nieuwe kracht!).
  rescues: [
    { x: 330, y: 636, doel: 4, blocks: [2, 2], gives: 'duw', name: 'Vier' },
    { x: 1330, y: 636, doel: 5, blocks: [2, 3], name: 'Vijf' },
  ],

  pickups: [
    { x: 480, y: 600, amount: 1, regen: true },
    { x: 620, y: 600, amount: 1, regen: true },
    { x: 760, y: 600, amount: 1, regen: true },  // 1 → 4 bij de eerste deur
    { x: 880, y: 600, amount: 1, regen: true },
    { x: 1540, y: 600, amount: 1, regen: true },
    { x: 1680, y: 600, amount: 1, regen: true }, // 4 → 6 bij de tweede deur
    { x: 1810, y: 600, amount: 1, regen: true },
    { x: 3700, y: 600, amount: 1, regen: true }, // 6 → 8 bij de derde deur
    { x: 3850, y: 600, amount: 1, regen: true },
  ],

  doors: [
    { x: 1020, doel: 4, topY: 120 }, // wees 4 — dubbel twee
    { x: 1960, doel: 6, topY: 120 }, // wees 6 — dubbel drie
    { x: 4200, doel: 8, topY: 120 }, // wees 8 — dubbel vier!
  ],

  grommels: [
    { type: 'stomp', x: 400, y: 612, patrol: [300, 560] },
    { type: 'stomp', x: 1450, y: 612, patrol: [1380, 1600] },
    { type: 'stomp', x: 2500, y: 612, patrol: [2400, 2650] },
    { type: 'springer', x: 3200, y: 612, patrol: [3100, 3350] },
    { type: 'stomp', x: 4550, y: 612, patrol: [4450, 4650] },
  ],

  // Ster boven de richel: duw de kist eronder en klim omhoog (duw-kracht!).
  star: { x: 2230, y: 250 },

  goal: { x: 4870, y: 588, value: 8 },

  reward: {
    title: 'Level 2-4 gehaald! 🏆',
    subtitle: '2+2, 3+3 én 4+4 — jij bent een dubbel-held!',
    stars: 3, medal: 'adventure_2_4', medalLabel: 'Dubbel-Held',
  },
};

export const LEVEL_2_5 = {
  id: '2-5',
  naam: 'Partners van Tien',

  worldW: 5400,
  worldH: 800,
  killY: 720,
  terrain: 'zand',
  bg: { top: 0x8fd3ff, bottom: 0xf3e2b0 }, // lucht → zand

  start: { x: 90, y: 560 },
  startDoubleJump: true, // krachten van Wereld 1 blijven
  startStamp: true,
  startDuw: true, // net geleerd van Vier (2-4)
  intro: 'Zoek telkens de twee die samen 10 zijn!',
  afterGate: 'Top! Op naar de volgende brug! 🚩',

  // Vijf zand-eilanden, vier zee-kloven. Elke kloof overbrug je door SAMEN 10
  // te maken — er liggen méér blokjes dan nodig: kies zélf het paar dat 10 is.
  // De laatste brug is een DUBBEL (5+5): alles komt samen.
  platforms: [
    [0, 660, 620, 140],      // zand A (start)
    [980, 660, 700, 140],    // zand B
    [2040, 660, 700, 140],   // zand C
    [3100, 660, 700, 140],   // zand D
    [4160, 660, 1240, 140],  // zand E — met de vlag
  ],

  // Vier bruggen; elk maakt 10 uit een ander partner-paar, met één afleider.
  gates: [
    { type: 'brug', gapX: 620,  gapW: 360, y: 650, doel: 10, blocks: [3, 4, 7], triggerX: 500,  triggerW: 120, water: true }, // 3 + 7
    { type: 'brug', gapX: 1680, gapW: 360, y: 650, doel: 10, blocks: [2, 5, 8], triggerX: 1560, triggerW: 120, water: true }, // 2 + 8
    { type: 'brug', gapX: 2740, gapW: 360, y: 650, doel: 10, blocks: [1, 4, 6], triggerX: 2620, triggerW: 120, water: true }, // 4 + 6
    { type: 'brug', gapX: 3800, gapW: 360, y: 650, doel: 10, blocks: [5, 2, 5], triggerX: 3680, triggerW: 120, water: true }, // 5 + 5!
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 1100, y: 600, amount: 1 },
    { x: 2150, y: 600, amount: 1 },
    { x: 3250, y: 600, amount: 1 },
    { x: 4350, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'stomp', x: 1200, y: 612, patrol: [1100, 1550] },
    { type: 'stomp', x: 2200, y: 612, patrol: [2100, 2550] },
    { type: 'springer', x: 3300, y: 612, patrol: [3200, 3450] },
    { type: 'stomp', x: 4600, y: 612, patrol: [4500, 4800] },
  ],

  // Ster hoog boven zand B — pak 'm met de dubbelsprong.
  star: { x: 1250, y: 424 },

  goal: { x: 5250, y: 588, value: 10 },

  reward: {
    title: 'Level 2-5 gehaald! 🏆',
    subtitle: 'Jij kent alle partners van tien!',
    stars: 3, medal: 'adventure_2_5', medalLabel: 'Tien-Partner',
  },
};

export const LEVEL_2_6 = {
  id: '2-6',
  naam: 'De Wolken-Klim',

  // VERTICAAL level (zoals de fort-klim 6-1): klim langs tel-wolken en
  // zand-richels omhoog naar de deur in de lucht — en word onderweg
  // PRECIES 10 door de bolletjes te tellen die je al klimmend pakt!
  worldW: 1200,
  worldH: 1700,
  killY: 1660,
  terrain: 'zand',
  bg: { top: 0x8fd3ff, bottom: 0xf3e2b0 },

  start: { x: 90, y: 1460 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  intro: 'Klim naar de wolken — word onderweg precies 10!',

  platforms: [
    [0, 1560, 1200, 140],   // het strand, helemaal onderaan
    [180, 1300, 260, 26],   // zand-richel 1 (rustpunt)
    [740, 1140, 260, 26],   // zand-richel 2
    [160, 960, 260, 26],    // zand-richel 3
    [700, 780, 260, 26],    // zand-richel 4
    [180, 600, 260, 26],    // zand-richel 5
    [400, 360, 500, 26],    // het TOP-plateau met de deur en de vlag
  ],

  // Tel-wolken als tussenstapjes (om-en-om aan/uit — ritme!).
  telWolken: [
    [520, 1420, 140, 0],
    [520, 1220, 140, 1300],
    [460, 1050, 140, 0],
    [480, 860, 140, 1300],
    [520, 680, 140, 0],
    [520, 480, 140, 1300],
  ],

  // Klim-bolletjes: 9 stuks van start tot top → precies 10 bij de deur.
  // Allemaal regen: een Grommel-tikje kan de klim nooit op slot zetten.
  pickups: [
    { x: 300, y: 1500, amount: 1, regen: true },
    { x: 560, y: 1500, amount: 1, regen: true },
    { x: 300, y: 1250, amount: 1, regen: true },
    { x: 860, y: 1090, amount: 1, regen: true },
    { x: 280, y: 910, amount: 1, regen: true },
    { x: 820, y: 730, amount: 1, regen: true },
    { x: 300, y: 550, amount: 1, regen: true },
    { x: 560, y: 430, amount: 1, regen: true },
    { x: 500, y: 310, amount: 1, regen: true },
  ],

  // De meesterproef: WEES 10 bij de wolken-deur bovenaan.
  doors: [
    { x: 700, doel: 10, topY: 60, y: 360 },
  ],

  grommels: [
    { type: 'stomp', x: 700, y: 1512, patrol: [600, 900] },
    { type: 'vlieger', x: 500, y: 1000, patrol: [250, 850] },  // lucht-wacht!
    { type: 'vlieger', x: 550, y: 560, patrol: [300, 800] },
  ],

  // Ster hoog naast de klim-route: durf jij de zijsprong aan?
  star: { x: 1060, y: 700 },

  goal: { x: 830, y: 288, value: 10 },

  reward: {
    title: 'Level 2-6 gehaald! 🏆',
    subtitle: 'Tot boven de wolken geklommen — als een echte 10!',
    stars: 3, medal: 'adventure_2_6', medalLabel: 'Meester van Tien',
  },
};

export const LEVEL_2_7 = {
  id: '2-7',
  naam: 'De Golf-Baas',

  worldW: 4800,
  worldH: 800,
  killY: 720,
  terrain: 'zand',
  bg: { top: 0x6fa8d8, bottom: 0xe8d8b0 }, // grauwere lucht boven het strand — spannend

  start: { x: 90, y: 560 },
  startDoubleJump: true, // krachten van Wereld 1 blijven
  startStamp: true,
  startDuw: true,
  intro: 'De Golf-Baas! TEL zijn golven en raak de goede schelp!',

  // Volwaardige aanloop met de kust-werkwoorden (stapstenen, tel-wolken),
  // dan de arena: de Golf-Baas stuurt telbare golven-setjes — spring erover
  // én tel mee, en raak daarna de schelp met het goede aantal (stijl 'surf').
  platforms: [
    [0, 660, 900, 140],      // zand A (start)
    [990, 660, 140, 40],     // stapsteen 1
    [1230, 660, 140, 40],    // stapsteen 2
    [1470, 660, 700, 140],   // zand B
    [2720, 660, 2080, 140],  // zand C — de baas-arena
  ],

  telWolken: [
    [2250, 640, 150, 0],
    [2490, 640, 150, 1400],
  ],

  water: [
    [900, 692, 570, 108],
    [2170, 692, 550, 108],
  ],

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 520, y: 600, amount: 1 },
    { x: 1600, y: 600, amount: 1 },
    { x: 3000, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 500, y: 612, patrol: [400, 650] },
    { type: 'springer', x: 1700, y: 612, patrol: [1600, 1800] },
    { type: 'stomp', x: 3000, y: 612, patrol: [2900, 3100] },
  ],

  // De Golf-Baas — stijl 'surf': hij stuurt 3, dan 4, dan 5 golven; TEL ze
  // (spring eroverheen!) en raak daarna de schelp met het juiste aantal.
  boss: {
    x: 3600,
    name: 'Golf-Baas',
    look: 'golf',
    stijl: 'surf',
    stages: [
      { doel: 3, opties: [3, 2, 5] },
      { doel: 4, opties: [4, 3, 6] },
      { doel: 5, opties: [5, 4, 7] },
    ],
  },

  // Verstopte ster boven zand B: pak 'm vóór het gevecht!
  star: { x: 1700, y: 430 },

  goal: { x: 4650, y: 588, value: 10 },

  reward: {
    title: 'WERELD 2 UITGESPEELD! 🏆🎉',
    subtitle: 'Je telde álle golven en de Golf-Baas geeft zich gewonnen!',
    stars: 5, medal: 'world2_done', medalLabel: 'Held van Wereld 2',
  },
};

export const WORLD2 = [LEVEL_2_1, LEVEL_2_2, LEVEL_2_3, LEVEL_2_4, LEVEL_2_5, LEVEL_2_6, LEVEL_2_7];
