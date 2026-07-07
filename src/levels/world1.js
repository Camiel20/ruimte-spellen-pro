// ===== WERELD 1 — LEVELDATA (data-gedreven) =====
// Een level is PUUR data. De engine (AdventureScene) leest deze objecten uit en
// bouwt de wereld. Alle features zijn optioneel per level, dus alle levels delen
// één engine. Nieuwe levels = een object aan WORLD1 hangen — geen engine-wijziging.
//
// Coördinaten: (0,0) = linksboven. Platforms zijn [x, y, breedte, hoogte] met
// (x,y) als LINKERBOVENHOEK (statische Arcade-bodies). Grond ligt op y≈660; het
// scherm is 480×800 (worldH=800 = viewport, dus geen verticaal scrollen — alles
// tussen y 0 en 800 is altijd in beeld). De wereld scrollt horizontaal mee.
//
// Ondersteunde velden:
//   start, startValue, startDoubleJump, worldW, worldH, killY, bg{top,bottom}
//   platforms[], pickups[{x,y,amount}], grommels[{x,y,patrol}], star{x,y}, goal{x,y,value}
//   gate{...}        — brug-poort (bouw N van blokjes → planken over de kloof)
//   rescues[{x,y,doel,blocks,gives,name}] — help een gevallen Numberblock → kracht
//   doors[{x,doel,topY,y}]                — 'wees N': opent als JIJ waarde N bent
//   intro, afterGate  — HUD-teksten;  reward{title,subtitle,stars,medal,medalLabel}
//
// RENOVATIE 2026-07-07: alle levels verlengd naar de norm (leer-wereld:
// ~4000-4400px, 4-5 beats) — de eerste indruk verdient dezelfde rijkdom als
// de nieuwste werelden. De leer-boog per level is ongewijzigd.

export const LEVEL_1_1 = {
  id: '1-1',
  naam: 'De Kapotte Brug',

  worldW: 4200,
  worldH: 800,
  killY: 700,
  bg: { top: 0x8fd3ff, bottom: 0x8ed36b },

  start: { x: 90, y: 560 },
  intro: 'Steek de kloof over!',
  afterGate: 'Ren verder! 🚩',

  // Beat 1: leren lopen/springen → beat 2: de brug bouwen (3) → beat 3: de
  // ster-richel → beat 4: eilandjes-oversteek (springen!) → beat 5: de vlag.
  platforms: [
    [0, 660, 760, 140],      // grond A (start)
    [1120, 660, 1400, 140],  // grond B (na de brug-kloof)
    [1400, 490, 150, 24],    // richel met de ster
    [2620, 660, 140, 140],   // eilandje 1…
    [2860, 660, 140, 140],   // …eilandje 2 (spring-oversteek)
    [3100, 660, 1100, 140],  // grond C — met de vlag
  ],

  pickups: [
    { x: 360, y: 600, amount: 1 },
    { x: 1250, y: 600, amount: 1 },
    { x: 3250, y: 600, amount: 1 },
  ],

  // Brug over de brede (onspringbare) kloof: maak 3 van de losse blokjes.
  gate: {
    type: 'brug',
    gapX: 760, gapW: 360,
    y: 650,
    doel: 3,
    blocks: [1, 2],
    triggerX: 640,
    triggerW: 120,
  },

  grommels: [
    { type: 'stomp', x: 540, y: 612, patrol: [460, 700] },
    { type: 'stomp', x: 1800, y: 612, patrol: [1700, 1950] },
    { type: 'stomp', x: 3500, y: 612, patrol: [3400, 3650] },
  ],

  star: { x: 1475, y: 452 },
  goal: { x: 4100, y: 588, value: 3 },

  reward: {
    title: 'Level 1-1 gehaald! 🏆',
    subtitle: 'Je hebt de brug gemaakt en de kloof overgestoken!',
    stars: 3, medal: 'adventure_1_1', medalLabel: 'Brug-Bouwer',
  },
};

export const LEVEL_1_2 = {
  id: '1-2',
  naam: 'Twee en de Deur',

  worldW: 4200,
  worldH: 800,
  killY: 720,
  bg: { top: 0x8fd3ff, bottom: 0x9be0d0 }, // net iets andere lucht

  start: { x: 90, y: 560 },
  intro: 'Help Twee en open de deur!',

  // Doorlopende grond (geen pits → faal-vriendelijk). Beat 1: red Twee
  // (dubbelsprong!) → beat 2+3: twee muur-hops om te oefenen → beat 4: word 3
  // voor de deur → beat 5: word 5 voor de TWEEDE deur (herhaling, groter).
  platforms: [
    [0, 660, 4200, 140],
    [1000, 468, 60, 192],  // MUUR 1 (top y=468): enkel met dubbelsprong eroverheen
    [1500, 468, 60, 192],  // MUUR 2: nog een keer — nu kun je het!
  ],

  // Redding: help "Twee" (twee losse enen → 2). Beloning = DUBBELSPRONG.
  rescues: [
    { x: 330, y: 636, doel: 2, blocks: [1, 1], gives: 'doubleJump', name: 'Twee' },
  ],

  grommels: [
    { type: 'stomp', x: 660, y: 612, patrol: [580, 800] },
    { type: 'stomp', x: 1800, y: 612, patrol: [1700, 1900] },
    { type: 'stomp', x: 3050, y: 612, patrol: [2950, 3200] },
  ],

  // Groei-bolletjes vóór elke deur — regen: true, zodat een Grommel-tikje
  // nooit een slot oplevert (het bolletje komt altijd terug).
  pickups: [
    { x: 2200, y: 600, amount: 1, regen: true },
    { x: 2340, y: 600, amount: 1, regen: true },
    { x: 2900, y: 600, amount: 1, regen: true },
    { x: 3300, y: 600, amount: 1, regen: true },
  ],

  // Deur 'wees 3' en daarna 'wees 5': opent alleen als JIJ die waarde bent.
  doors: [
    { x: 2600, doel: 3, topY: 120, y: 660 },
    { x: 3600, doel: 5, topY: 120, y: 660 },
  ],

  // Ster zweeft boven muur 1: je pakt 'm tijdens de verplichte dubbelsprong-hop.
  star: { x: 1030, y: 418 },

  goal: { x: 4050, y: 588, value: 5 },

  reward: {
    title: 'Level 1-2 gehaald! 🏆',
    subtitle: 'Je hebt Twee gered én twee deuren geopend!',
    stars: 3, medal: 'adventure_1_2', medalLabel: 'Deur-Opener',
  },
};

export const LEVEL_1_3 = {
  id: '1-3',
  naam: 'Drie en de Blokkade',

  worldW: 4000,
  worldH: 800,
  killY: 790,
  bg: { top: 0x8fd3ff, bottom: 0xa8dca0 },

  start: { x: 90, y: 560 },
  intro: 'Red Drie en sla door de kratten!',

  // Beat 1: red Drie (stampen!) → beat 2: de eerste kratten-gang onder de
  // muur door → beat 3: even op adem op grond C → beat 4: een TWEEDE, langere
  // kratten-gang (herhaling) met een verstopt bolletje → beat 5: de vlag.
  platforms: [
    [0, 660, 820, 140],      // grond A (start, Drie, Grommel)
    [1000, 440, 50, 220],    // hoge MUUR 1 (top 440): niet overspringbaar
    [820, 760, 720, 40],     // gang 1, loopt onder muur 1 door
    [1540, 660, 660, 140],   // grond C (tussenstuk)
    [2500, 440, 50, 220],    // hoge MUUR 2
    [2200, 760, 760, 40],    // gang 2, langer — onder muur 2 door
    [2960, 660, 1040, 140],  // grond D — met de vlag
  ],

  // Breekbare kratten: de vloer naar gang 1 én naar gang 2.
  breakables: [
    [820, 660, 60, 100],
    [880, 660, 60, 100],
    [940, 660, 60, 100],
    [2200, 660, 60, 100],
    [2260, 660, 60, 100],
    [2320, 660, 60, 100],
  ],

  // Redding: help "Drie" (1+2 → 3). Beloning = STAMPEN (door kratten heen).
  rescues: [
    { x: 330, y: 636, doel: 3, blocks: [1, 2], gives: 'stamp', name: 'Drie' },
  ],

  grommels: [
    { type: 'stomp', x: 600, y: 612, patrol: [520, 740] },
    { type: 'stomp', x: 1850, y: 612, patrol: [1750, 2050] },
    { type: 'stomp', x: 3400, y: 612, patrol: [3300, 3550] },
  ],

  pickups: [
    { x: 2600, y: 724, amount: 1 }, // verstopt in gang 2!
    { x: 3200, y: 600, amount: 1 },
  ],

  // Ster in gang 1 — pak je terwijl je onder de muur door loopt.
  star: { x: 1180, y: 724 },

  goal: { x: 3900, y: 588, value: 5 },

  reward: {
    title: 'Level 1-3 gehaald! 🏆',
    subtitle: 'Je hebt Drie gered en door álle kratten gestampt!',
    stars: 3, medal: 'adventure_1_3', medalLabel: 'Stamp-Baas',
  },
};

export const LEVEL_1_4 = {
  id: '1-4',
  naam: 'Twee Krachten',

  worldW: 4400,
  worldH: 800,
  killY: 790,
  bg: { top: 0x8fd3ff, bottom: 0xbfe0c8 },

  start: { x: 90, y: 560 },
  // Je hebt de krachten van Twee & Drie al geleerd → begin ermee.
  startDoubleJump: true,
  startStamp: true,
  intro: 'Gebruik je krachten en bouw de 5!',

  // Beat 1: muur-hop (dubbelsprong) → beat 2: Grommel-veld → beat 3:
  // kratten-gang (stampen) → beat 4: de eerste SPRINGER-Grommel! → beat 5:
  // de grote brug (bouw 5) → vlag.
  platforms: [
    [0, 660, 760, 140],      // grond A (start)
    [760, 458, 60, 202],     // hoge MUUR: alleen met dubbelsprong eroverheen
    [820, 660, 1180, 140],   // grond B
    [2280, 440, 50, 220],    // MUUR 2 boven de gang
    [2000, 760, 600, 40],    // kratten-gang onder muur 2 door
    [2600, 660, 700, 140],   // grond C (met de springer)
    [3780, 660, 620, 140],   // grond D (na de brug) — met de vlag
  ],

  breakables: [
    [2000, 660, 60, 100],
    [2060, 660, 60, 100],
    [2120, 660, 60, 100],
  ],

  grommels: [
    { type: 'stomp', x: 400, y: 612, patrol: [300, 560] },
    { type: 'stomp', x: 1200, y: 612, patrol: [1050, 1400] },
    { type: 'springer', x: 2850, y: 612, patrol: [2750, 2950] }, // nieuw type!
  ],

  pickups: [
    { x: 1600, y: 600, amount: 1 },
    { x: 2450, y: 724, amount: 1 }, // in de gang
    { x: 3150, y: 600, amount: 1, regen: true }, // vóór de brug
  ],

  // Brede kloof (onspringbaar, ook met dubbelsprong): bouw de 5 (2+3).
  gate: {
    type: 'brug',
    gapX: 3300, gapW: 480,
    y: 650,
    doel: 5,
    blocks: [2, 3],
    triggerX: 3180,
    triggerW: 120,
  },

  // Ster boven de muur — pak 'm tijdens de verplichte dubbelsprong-hop.
  star: { x: 790, y: 405 },

  goal: { x: 4300, y: 588, value: 5 },

  reward: {
    title: 'Level 1-4 gehaald! 🏆',
    subtitle: 'Je hebt met al je krachten de 5 gebouwd!',
    stars: 3, medal: 'adventure_1_4', medalLabel: 'Vijf-Meester',
  },
};

export const LEVEL_1_5 = {
  id: '1-5',
  naam: 'De Baas van Wereld 1',

  worldW: 4400,
  worldH: 800,
  killY: 790,
  bg: { top: 0x8fbcff, bottom: 0xb6d0a0 }, // ietsje spannender

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  intro: 'Op naar de grote Grommel-baas!',

  // De eindproef van Wereld 1: alle werkwoorden nog één keer op weg naar de
  // baas — muur-hop, kratten-gang, brug bouwen — en dan het gevecht zelf.
  platforms: [
    [0, 660, 900, 140],      // grond A
    [900, 458, 60, 202],     // muur-hop (dubbelsprong)
    [960, 660, 840, 140],    // grond B
    [2100, 440, 50, 220],    // muur boven de gang
    [1800, 760, 560, 40],    // kratten-gang (stampen)
    [2360, 660, 440, 140],   // grond C (brug-aanloop)
    [3160, 660, 1240, 140],  // grond D — de baas-arena
  ],

  breakables: [
    [1800, 660, 60, 100],
    [1860, 660, 60, 100],
    [1920, 660, 60, 100],
  ],

  gate: {
    type: 'brug',
    gapX: 2800, gapW: 360,
    y: 650,
    doel: 4,
    blocks: [1, 3],
    triggerX: 2680,
    triggerW: 120,
  },

  grommels: [
    { type: 'stomp', x: 500, y: 612, patrol: [400, 650] },
    { type: 'stomp', x: 1350, y: 612, patrol: [1200, 1500] },
    { type: 'springer', x: 3350, y: 612, patrol: [3250, 3450] },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2050, y: 724, amount: 1 }, // in de gang
    { x: 2600, y: 600, amount: 1, regen: true }, // vóór de brug
  ],

  // De Baas-Grommel: bouw in fasen 3 → 4 → 5 (steeds een grotere stapel) om
  // hem geweldloos te verslaan. Daarna stapt hij als vriendje opzij.
  boss: {
    x: 3600,
    name: 'Baas-Grommel',
    stages: [
      { doel: 3, blocks: [1, 2] },
      { doel: 4, blocks: [1, 3] },
      { doel: 5, blocks: [2, 3] },
    ],
  },

  // Ster boven de muur-hop: pak 'm tijdens de dubbelsprong.
  star: { x: 930, y: 405 },

  goal: { x: 4300, y: 588, value: 5 },

  reward: {
    title: 'WERELD 1 UITGESPEELD! 🏆🎉',
    subtitle: 'Je hebt de Baas-Grommel verslagen en Wereld 1 gered!',
    stars: 5, medal: 'world1_done', medalLabel: 'Held van Wereld 1',
  },
};

export const WORLD1 = [LEVEL_1_1, LEVEL_1_2, LEVEL_1_3, LEVEL_1_4, LEVEL_1_5];
