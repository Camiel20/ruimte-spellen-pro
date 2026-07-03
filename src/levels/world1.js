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

export const LEVEL_1_1 = {
  id: '1-1',
  naam: 'De Kapotte Brug',

  worldW: 2100,
  worldH: 800,
  killY: 700,
  bg: { top: 0x8fd3ff, bottom: 0x8ed36b },

  start: { x: 90, y: 560 },
  intro: 'Steek de kloof over!',
  afterGate: 'Ren naar de vlag! 🚩',

  platforms: [
    [0, 660, 760, 140],     // grond A
    [1120, 660, 980, 140],  // grond B (na de kloof)
    [1300, 490, 150, 24],   // richel met de ster
  ],

  pickups: [
    { x: 360, y: 600, amount: 1 },
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
  ],

  star: { x: 1375, y: 452 },
  goal: { x: 2000, y: 588, value: 3 },

  reward: {
    title: 'Level 1-1 gehaald! 🏆',
    subtitle: 'Je hebt de brug gemaakt en de kloof overgestoken!',
    stars: 3, medal: 'adventure_1_1', medalLabel: 'Brug-Bouwer',
  },
};

export const LEVEL_1_2 = {
  id: '1-2',
  naam: 'Twee en de Deur',

  worldW: 2000,
  worldH: 800,
  killY: 720,
  bg: { top: 0x8fd3ff, bottom: 0x9be0d0 }, // net iets andere lucht

  start: { x: 90, y: 560 },
  intro: 'Help Twee en open de deur!',

  // Doorlopende grond (geen pits → faal-vriendelijk). Een hoge MUUR op het
  // hoofdpad die je alléén met de dubbelsprong overkomt: zo MOET je eerst Twee
  // redden (die de dubbelsprong geeft) voor je verder kunt. Plus een losse
  // hoge richel met de verstopte ster.
  platforms: [
    [0, 660, 2000, 140],
    [1000, 468, 60, 192],  // MUUR (top y=468): enkel met dubbelsprong eroverheen
  ],

  // Redding: help "Twee" (twee losse enen → 2). Beloning = DUBBELSPRONG.
  rescues: [
    { x: 330, y: 636, doel: 2, blocks: [1, 1], gives: 'doubleJump', name: 'Twee' },
  ],

  grommels: [
    { type: 'stomp', x: 660, y: 612, patrol: [580, 800] },
  ],

  // Twee groei-bolletjes NA de Grommel en vóór de deur: 1 → 3 (geen enemy
  // ertussen, dus je komt altijd als 3 bij de deur — geen softlock mogelijk).
  pickups: [
    { x: 1200, y: 600, amount: 1 },
    { x: 1340, y: 600, amount: 1 },
  ],

  // Deur 'wees 3': opent alleen als JIJ waarde 3 bent (nieuw poorttype).
  doors: [
    { x: 1480, doel: 3, topY: 120, y: 660 },
  ],

  // Ster zweeft boven de muur: je pakt 'm tijdens de verplichte dubbelsprong-hop
  // (iedereen doet die op waarde 1, dus betrouwbaar te pakken).
  star: { x: 1030, y: 418 },

  goal: { x: 1850, y: 588, value: 3 },

  reward: {
    title: 'Level 1-2 gehaald! 🏆',
    subtitle: 'Je hebt Twee gered én de deur geopend!',
    stars: 3, medal: 'adventure_1_2', medalLabel: 'Deur-Opener',
  },
};

export const LEVEL_1_3 = {
  id: '1-3',
  naam: 'Drie en de Blokkade',

  worldW: 1900,
  worldH: 800,
  killY: 790,
  bg: { top: 0x8fd3ff, bottom: 0xa8dca0 },

  start: { x: 90, y: 560 },
  intro: 'Red Drie en sla door de kratten!',

  // Bovenlaag (grond A) + ondergrondse gang. Een te hoge MUUR blokkeert het
  // bovenpad; de enige weg is DOOR de breekbare kratten-vloer naar de gang die
  // onder de muur doorloopt. Stampen (van Drie) is dus verplicht.
  platforms: [
    [0, 660, 820, 140],     // grond A (start, Drie, Grommel)
    [1000, 440, 50, 220],   // hoge MUUR (top 440): niet overspringbaar op waarde 1
    [820, 760, 720, 40],    // ondergrondse gang, loopt onder de muur door
    [1540, 660, 360, 140],  // grond C (na de muur) — met de vlag
  ],

  // Breekbare kratten die de vloer vormen tussen grond A en de muur.
  breakables: [
    [820, 660, 60, 100],
    [880, 660, 60, 100],
    [940, 660, 60, 100],
  ],

  // Redding: help "Drie" (1+2 → 3). Beloning = STAMPEN (door kratten heen).
  rescues: [
    { x: 330, y: 636, doel: 3, blocks: [1, 2], gives: 'stamp', name: 'Drie' },
  ],

  grommels: [
    { type: 'stomp', x: 600, y: 612, patrol: [520, 740] },
  ],

  // Ster in de gang — pak je terwijl je onder de muur door loopt.
  star: { x: 1180, y: 724 },

  goal: { x: 1780, y: 588, value: 3 },

  reward: {
    title: 'Level 1-3 gehaald! 🏆',
    subtitle: 'Je hebt Drie gered en door de kratten gestampt!',
    stars: 3, medal: 'adventure_1_3', medalLabel: 'Stamp-Baas',
  },
};

export const LEVEL_1_4 = {
  id: '1-4',
  naam: 'Twee Krachten',

  worldW: 2600,
  worldH: 800,
  killY: 720,
  bg: { top: 0x8fd3ff, bottom: 0xbfe0c8 },

  start: { x: 90, y: 560 },
  // Je hebt de krachten van Twee & Drie al geleerd → begin ermee.
  startDoubleJump: true,
  startStamp: true,
  intro: 'Gebruik je krachten en bouw de 5!',

  platforms: [
    [0, 660, 760, 140],     // grond A (start)
    [760, 458, 60, 202],    // hoge MUUR: alleen met dubbelsprong eroverheen
    [820, 660, 820, 140],   // grond B
    [2120, 660, 480, 140],  // grond C (na de brug) — met de vlag
  ],

  grommels: [
    { type: 'stomp', x: 400, y: 612, patrol: [300, 560] },
    { type: 'stomp', x: 1200, y: 612, patrol: [1050, 1400] },
  ],

  // Brede kloof (onspringbaar, ook met dubbelsprong): bouw de 5 (2+3).
  gate: {
    type: 'brug',
    gapX: 1640, gapW: 480,
    y: 650,
    doel: 5,
    blocks: [2, 3],
    triggerX: 1520,
    triggerW: 120,
  },

  // Ster boven de muur — pak 'm tijdens de verplichte dubbelsprong-hop.
  star: { x: 790, y: 405 },

  goal: { x: 2450, y: 588, value: 5 },

  reward: {
    title: 'Level 1-4 gehaald! 🏆',
    subtitle: 'Je hebt met al je krachten de 5 gebouwd!',
    stars: 3, medal: 'adventure_1_4', medalLabel: 'Vijf-Meester',
  },
};

export const LEVEL_1_5 = {
  id: '1-5',
  naam: 'De Baas van Wereld 1',

  worldW: 1800,
  worldH: 800,
  killY: 720,
  bg: { top: 0x8fbcff, bottom: 0xb6d0a0 }, // ietsje spannender

  start: { x: 90, y: 560 },
  intro: 'Versla de grote Grommel-baas!',

  // Doorlopende arena; de baas blokkeert de doorgang tot je 'm verslaat.
  platforms: [
    [0, 660, 1800, 140],
  ],

  grommels: [
    { type: 'stomp', x: 500, y: 612, patrol: [360, 720] },
  ],

  // De Baas-Grommel: bouw in fasen 3 → 4 → 5 (steeds een grotere stapel) om
  // hem geweldloos te verslaan. Daarna stapt hij als vriendje opzij.
  boss: {
    x: 1300,
    name: 'Baas-Grommel',
    stages: [
      { doel: 3, blocks: [1, 2] },
      { doel: 4, blocks: [1, 3] },
      { doel: 5, blocks: [2, 3] },
    ],
  },

  // Verstopte ster boven de arena: durf jij 'm te pakken tijdens het gevecht?
  star: { x: 850, y: 440 },

  goal: { x: 1650, y: 588, value: 5 },

  reward: {
    title: 'WERELD 1 UITGESPEELD! 🏆🎉',
    subtitle: 'Je hebt de Baas-Grommel verslagen en Wereld 1 gered!',
    stars: 5, medal: 'world1_done', medalLabel: 'Held van Wereld 1',
  },
};

export const WORLD1 = [LEVEL_1_1, LEVEL_1_2, LEVEL_1_3, LEVEL_1_4, LEVEL_1_5];
