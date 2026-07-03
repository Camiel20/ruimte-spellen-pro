// ===== WERELD 3 — HET GETALLEN-BOS (leveldata) =====
// Diep groen bos. Concept: TIENTALLEN en het eerste plaatswaarde-gevoel:
// "twaalf is tien-en-nog-twee". Eerst red je Acht en Tien (de laatste twee
// dorpsbewoners!), daarna bouw je met tienen: 12, 15, 20 — en de teen-getallen
// 13 en 17. Grote blokken van 10 maken "een tiental" letterlijk zichtbaar.
// Zelfde data-gedreven engine; nieuw: terrain 'bos' + de Boom-Grommel-baas.

export const LEVEL_3_1 = {
  id: '3-1',
  naam: 'Acht in het Bos',

  worldW: 2400,
  worldH: 800,
  killY: 720,
  terrain: 'bos',
  bg: { top: 0x8fd3ff, bottom: 0x6faf5f }, // lucht → bosgroen

  start: { x: 90, y: 560 },
  startDoubleJump: true, // krachten uit eerdere werelden blijven
  startStamp: true,
  intro: 'Welkom in het bos! Red Acht!',
  afterGate: 'Ren verder het bos in! 🚩',

  platforms: [
    [0, 660, 700, 140],     // bosgrond A (start, Acht)
    [1060, 660, 700, 140],  // bosgrond B
    [1850, 660, 140, 40],   // boomstronk-stapsteen
    [2080, 660, 320, 140],  // bosgrond C — met de vlag
  ],

  pickups: [
    { x: 240, y: 600, amount: 1 },
    { x: 480, y: 600, amount: 1 },
    { x: 1300, y: 600, amount: 1 },
  ],

  // De voorlaatste dorpsbewoner! Acht = 4+4 (dubbel vier).
  rescues: [
    { x: 350, y: 636, doel: 8, blocks: [4, 4], name: 'Acht' },
  ],

  // Ravijn in het bos: maak 8 — kies zelf het paar (3+5, afleider 4).
  gate: {
    type: 'brug',
    gapX: 700, gapW: 360,
    y: 650,
    doel: 8,
    blocks: [3, 4, 5],
    triggerX: 580,
    triggerW: 120,
  },

  grommels: [
    { type: 'stomp', x: 1300, y: 612, patrol: [1200, 1600] },
  ],

  // Ster boven bosgrond B — met de dubbelsprong.
  star: { x: 1400, y: 430 },

  goal: { x: 2280, y: 588, value: 8 },

  reward: {
    title: 'Level 3-1 gehaald! 🏆',
    subtitle: 'Acht woont nu in het dorpje!',
    stars: 3, medal: 'adventure_3_1', medalLabel: 'Bos-Vriend',
  },
};

export const LEVEL_3_2 = {
  id: '3-2',
  naam: 'Tien de Held',

  worldW: 2400,
  worldH: 800,
  killY: 720,
  terrain: 'bos',
  bg: { top: 0x8fd3ff, bottom: 0x74b565 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  intro: 'Red Tien — en maak tien-en-twee!',
  afterGate: 'Twaalf = tien en nog twee! 🚩',

  platforms: [
    [0, 660, 760, 140],     // bosgrond A (start, Tien)
    [1120, 660, 800, 140],  // bosgrond B
    [2000, 660, 140, 40],   // boomstronk-stapsteen
    [2220, 660, 180, 140],  // bosgrond C — met de vlag
  ],

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 520, y: 600, amount: 1 },
    { x: 1500, y: 600, amount: 1 },
  ],

  // De láátste dorpsbewoner: Tien! (4+6, afleider 5 — partners van 10.)
  rescues: [
    { x: 350, y: 636, doel: 10, blocks: [4, 6, 5], name: 'Tien' },
  ],

  // Eerste plaatswaarde-brug: TWAALF = het grote 10-blok + 2 (afleider 3).
  gate: {
    type: 'brug',
    gapX: 760, gapW: 360,
    y: 650,
    doel: 12,
    blocks: [10, 2, 3],
    triggerX: 640,
    triggerW: 120,
  },

  grommels: [
    { type: 'stomp', x: 450, y: 612, patrol: [380, 620] },
    { type: 'stomp', x: 1400, y: 612, patrol: [1300, 1600] },
  ],

  star: { x: 1300, y: 430 },

  goal: { x: 2320, y: 588, value: 12 },

  reward: {
    title: 'Level 3-2 gehaald! 🏆',
    subtitle: 'Tien is gered — het dorp is compleet!',
    stars: 3, medal: 'adventure_3_2', medalLabel: 'Tien-Redder',
  },
};

export const LEVEL_3_3 = {
  id: '3-3',
  naam: 'Het Tientallen-Pad',

  worldW: 3000,
  worldH: 800,
  killY: 720,
  terrain: 'bos',
  bg: { top: 0x8fd3ff, bottom: 0x6faf5f },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  intro: 'Tel met tienen — en leer geven!',
  afterGate: 'Goed geteld! Verder! 🚩',

  platforms: [
    [0, 660, 620, 140],     // bosgrond A
    [980, 660, 620, 140],   // bosgrond B
    [1960, 660, 1040, 140], // bosgrond C — met de vlag
  ],

  pickups: [
    { x: 260, y: 600, amount: 1 },
    { x: 1100, y: 600, amount: 1 },
    { x: 2100, y: 600, amount: 1 },
    { x: 2320, y: 600, amount: 1, regen: true }, // magisch: groeit terug (voor de plaat)
    { x: 2600, y: 600, amount: 1 },
  ],

  // GEEF-PLAAT: laat 3 blokjes achter om de slagboom te openen — aftrekken
  // met je eigen lijf! Het magische bolletje ervoor groeit steeds terug.
  plates: [
    { x: 2400, doel: 3 },
  ],

  // Twee tientallen-bruggen: 15 = 10+5, en 20 = 10+10 (dubbel tien!).
  gates: [
    { type: 'brug', gapX: 620,  gapW: 360, y: 650, doel: 15, blocks: [10, 5, 2],  triggerX: 500,  triggerW: 120 },
    { type: 'brug', gapX: 1600, gapW: 360, y: 650, doel: 20, blocks: [10, 10, 5], triggerX: 1480, triggerW: 120 },
  ],

  grommels: [
    { type: 'stomp', x: 1200, y: 612, patrol: [1100, 1450] },
    { type: 'springer', x: 2300, y: 612, patrol: [2150, 2500] },
  ],

  star: { x: 1250, y: 424 },

  goal: { x: 2880, y: 588, value: 20 },

  reward: {
    title: 'Level 3-3 gehaald! 🏆',
    subtitle: 'Vijftien en twintig — jij telt met tienen!',
    stars: 3, medal: 'adventure_3_3', medalLabel: 'Tientallen-Loper',
  },
};

export const LEVEL_3_4 = {
  id: '3-4',
  naam: 'De Grommel-Jacht',

  worldW: 3400,
  worldH: 800,
  killY: 720,
  terrain: 'bos',
  bg: { top: 0x8fd3ff, bottom: 0x74b565 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  intro: 'Kleur alle Grommels terug — dan opent de vlag!',
  afterGate: 'Mooi! Waar zit de volgende Grommel? 🎨',

  // MISSIE-LEVEL: de vlag zit op slot tot je alle drie de Grommels hebt
  // teruggekleurd (stampen!). Een jacht i.p.v. alleen bouwen — met twee
  // plaatswaarde-bruggen (13 en 20) en de dubbelsprong-muur onderweg.
  missie: 'grommels',

  platforms: [
    [0, 660, 560, 140],     // bosgrond A
    [920, 660, 1000, 140],  // bosgrond B (lang jachtterrein)
    [1920, 660, 640, 140],  // bosgrond C — met de muur
    [2200, 470, 60, 190],   // hoge MUUR op C: alleen met dubbelsprong
    [2920, 660, 480, 140],  // bosgrond D — met de vlag
  ],

  pickups: [
    { x: 200, y: 600, amount: 1 },
    { x: 1050, y: 600, amount: 1 },
    { x: 2050, y: 600, amount: 1 },
    { x: 3050, y: 600, amount: 1 },
  ],

  // 13 = 10+3 en 20 = 10+10 — met een afleider erbij.
  gates: [
    { type: 'brug', gapX: 560,  gapW: 360, y: 650, doel: 13, blocks: [10, 3, 4],  triggerX: 440,  triggerW: 120 },
    { type: 'brug', gapX: 2560, gapW: 360, y: 650, doel: 20, blocks: [10, 10, 3], triggerX: 2440, triggerW: 120 },
  ],

  grommels: [
    { type: 'stomp', x: 300,  y: 612, patrol: [180, 500] },
    { type: 'springer', x: 1200, y: 612, patrol: [980, 1520] },
    { type: 'stomp', x: 2400, y: 612, patrol: [2260, 2520] }, // ná de muur
  ],

  // Ster hoog boven de muur — pak 'm tijdens de verplichte dubbelsprong-hop.
  star: { x: 2230, y: 430 },

  goal: { x: 3300, y: 588, value: 20 },

  reward: {
    title: 'Level 3-4 gehaald! 🏆',
    subtitle: 'Alle Grommels blij én tot twintig geteld!',
    stars: 3, medal: 'adventure_3_4', medalLabel: 'Grommel-Vriend',
  },
};

export const LEVEL_3_5 = {
  id: '3-5',
  naam: 'De Boom-Baas',

  worldW: 2000,
  worldH: 800,
  killY: 720,
  terrain: 'bos',
  bg: { top: 0x6fa8c8, bottom: 0x5d9954 }, // schemerig bos — spannend

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  intro: 'De Boom-Grommel! Bouw 10, 15 en 20 — spring over zijn eikels!',

  // Doorlopende bos-arena; de boom verspert de weg tot je 'm verslaat.
  platforms: [
    [0, 660, 2000, 140],
  ],

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

  // De Boom-Grommel: drie fasen met stijgende tientallen — tussen de fasen
  // rollen er eikels over de bosgrond (zelfde spring-mechaniek als de golven).
  boss: {
    x: 1500,
    name: 'Boom-Grommel',
    look: 'boom', // eigen boom-art + eikel-aanval
    stages: [
      { doel: 10, blocks: [4, 6] },
      { doel: 15, blocks: [10, 5, 2] },
      { doel: 20, blocks: [10, 10, 5] },
    ],
  },

  // Verstopte ster boven de arena: pak 'm tussen de eikels door!
  star: { x: 860, y: 440 },

  goal: { x: 1850, y: 588, value: 20 },

  reward: {
    title: 'WERELD 3 UITGESPEELD! 🏆🎉',
    subtitle: 'Je hebt de Boom-Grommel verslagen en het bos gered!',
    stars: 5, medal: 'world3_done', medalLabel: 'Held van Wereld 3',
  },
};

export const WORLD3 = [LEVEL_3_1, LEVEL_3_2, LEVEL_3_3, LEVEL_3_4, LEVEL_3_5];
