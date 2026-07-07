// ===== WERELD 3 — HET GETALLEN-BOS (leveldata) =====
// Diep groen bos. Concept: TIENTALLEN en het eerste plaatswaarde-gevoel:
// "twaalf is tien-en-nog-twee". Eerst red je Acht en Tien (de laatste twee
// dorpsbewoners!), daarna bouw je met tienen: 11, 12, 15, 17, 20. Grote
// blokken van 10 maken "een tiental" letterlijk zichtbaar.
// Zelfde data-gedreven engine; terrain 'bos' + de Boom-Grommel-baas.
//
// RENOVATIE 2026-07-07: levels naar de norm (4800-5600px, 4-6 beats),
// 3-4 kreeg een boom-klim-sectie en de Boom-Baas (3-5) een eigen gevecht:
// stijl 'schud' — STAMP naast de stam en raap precies genoeg eikels.

export const LEVEL_3_1 = {
  id: '3-1',
  naam: 'Acht in het Bos',

  worldW: 5000,
  worldH: 800,
  killY: 720,
  terrain: 'bos',
  bg: { top: 0x8fd3ff, bottom: 0x6faf5f }, // lucht → bosgroen

  start: { x: 90, y: 560 },
  startDoubleJump: true, // krachten uit eerdere werelden blijven
  startStamp: true,
  startDuw: true,
  intro: 'Welkom in het bos! Red Acht!',
  afterGate: 'Ren verder het bos in! 🚩',

  // Beat 1: red Acht + brug 8 → beat 2: duw-kist naar de bonus-richel →
  // beat 3: de tweede keuze-brug (7) → beat 4: springer-bos → beat 5:
  // stronk-stapstenen naar de vlag.
  platforms: [
    [0, 660, 700, 140],      // bosgrond A (start, Acht)
    [1060, 660, 1100, 140],  // bosgrond B (duw-kist + richel)
    [1180, 360, 180, 26],    // hoge richel: alleen te halen via de duw-kist
    [2520, 660, 1100, 140],  // bosgrond C (springers)
    [3720, 660, 140, 40],    // boomstronk-stapsteen 1
    [3960, 660, 140, 40],    // boomstronk-stapsteen 2
    [4200, 660, 800, 140],   // bosgrond D — met de vlag
  ],

  pickups: [
    { x: 240, y: 600, amount: 1 },
    { x: 480, y: 600, amount: 1 },
    { x: 1120, y: 600, amount: 1 },
    { x: 1270, y: 300, amount: 2 }, // bonus op de richel (duw de kist ernaartoe!)
    { x: 2700, y: 600, amount: 1 },
    { x: 4350, y: 600, amount: 1 },
  ],

  // Duw-kist (kracht van Vier, W2): schuif hem onder de richel en klim omhoog.
  duwKisten: [1100],

  // De voorlaatste dorpsbewoner! Acht = 4+4 (dubbel vier).
  rescues: [
    { x: 350, y: 636, doel: 8, blocks: [4, 4], name: 'Acht' },
  ],

  // Twee ravijnen: maak 8 (3+5, afleider 4) en daarna 7 (3+4, afleider 2).
  gates: [
    { type: 'brug', gapX: 700, gapW: 360, y: 650, doel: 8, blocks: [3, 4, 5], triggerX: 580, triggerW: 120 },
    { type: 'brug', gapX: 2160, gapW: 360, y: 650, doel: 7, blocks: [3, 4, 2], triggerX: 2040, triggerW: 120 },
  ],

  grommels: [
    { type: 'stomp', x: 1500, y: 612, patrol: [1420, 1660] },
    { type: 'springer', x: 2800, y: 612, patrol: [2700, 2900] },
    { type: 'stomp', x: 3200, y: 612, patrol: [3100, 3300] },
    { type: 'stomp', x: 4500, y: 612, patrol: [4400, 4600] },
  ],

  // Ster boven bosgrond B — met de dubbelsprong.
  star: { x: 1400, y: 430 },

  goal: { x: 4850, y: 588, value: 8 },

  reward: {
    title: 'Level 3-1 gehaald! 🏆',
    subtitle: 'Acht woont nu in het dorpje!',
    stars: 3, medal: 'adventure_3_1', medalLabel: 'Bos-Vriend',
  },
};

export const LEVEL_3_2 = {
  id: '3-2',
  naam: 'Tien de Held',

  worldW: 5000,
  worldH: 800,
  killY: 720,
  terrain: 'bos',
  bg: { top: 0x8fd3ff, bottom: 0x74b565 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  intro: 'Red Tien — en maak tien-en-twee!',
  afterGate: 'Twaalf = tien en nog twee! 🚩',

  // Beat 1: red Tien (TIEN-KRACHT!) → beat 2: brug 12 (10+2) → beat 3:
  // grauwe muur KABOEM → beat 4: brug 11 (10+1) → beat 5: nog een muur +
  // stronk naar de vlag. Plaatswaarde ("tien-en-nog-x") twee keer geoefend.
  platforms: [
    [0, 660, 760, 140],      // bosgrond A (start, Tien)
    [1120, 660, 1500, 140],  // bosgrond B
    [2980, 660, 1050, 140],  // bosgrond C
    [4130, 660, 140, 40],    // boomstronk-stapsteen
    [4370, 660, 630, 140],   // bosgrond D — met de vlag
  ],

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 520, y: 600, amount: 1 },
    { x: 1500, y: 600, amount: 1 },
    { x: 3150, y: 600, amount: 1 },
  ],

  // De láátste dorpsbewoner: Tien! (4+6, afleider 5 — partners van 10.)
  rescues: [
    { x: 350, y: 636, doel: 10, blocks: [4, 6, 5], gives: 'mega', name: 'Tien' },
  ],

  // Plaatswaarde-bruggen: TWAALF (10+2, afleider 3) en ELF (10+1, afleider 2).
  gates: [
    { type: 'brug', gapX: 760, gapW: 360, y: 650, doel: 12, blocks: [10, 2, 3], triggerX: 640, triggerW: 120 },
    { type: 'brug', gapX: 2620, gapW: 360, y: 650, doel: 11, blocks: [10, 1, 2], triggerX: 2500, triggerW: 120 },
  ],

  grommels: [
    { type: 'stomp', x: 450, y: 612, patrol: [380, 620] },
    { type: 'stomp', x: 1400, y: 612, patrol: [1300, 1600] },
    { type: 'springer', x: 2200, y: 612, patrol: [2100, 2300] },
    { type: 'stomp', x: 3300, y: 612, patrol: [3200, 3400] },
  ],

  // Twee grauwe muren: meteen je kersverse TIEN-KRACHT gebruiken. KABOEM!
  grauwMuren: [1750, 3600],

  star: { x: 1300, y: 430 },

  goal: { x: 4850, y: 588, value: 12 },

  reward: {
    title: 'Level 3-2 gehaald! 🏆',
    subtitle: 'Tien is gered — het dorp is compleet!',
    stars: 3, medal: 'adventure_3_2', medalLabel: 'Tien-Redder',
  },
};

export const LEVEL_3_3 = {
  id: '3-3',
  naam: 'Het Tientallen-Pad',

  worldW: 5400,
  worldH: 800,
  killY: 720,
  terrain: 'bos',
  bg: { top: 0x8fd3ff, bottom: 0x6faf5f },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Tel met tienen — en leer geven!',
  afterGate: 'Goed geteld! Verder! 🚩',

  // Beat 1: brug 15 → beat 2: brug 20 (dubbel tien!) → beat 3: geef-plaat +
  // grauwe muur → beat 4: brug 17 (teen-getal!) → beat 5: tweede geef-plaat
  // en de laatste stronk naar de vlag.
  platforms: [
    [0, 660, 620, 140],      // bosgrond A
    [980, 660, 620, 140],    // bosgrond B
    [1960, 660, 1300, 140],  // bosgrond C
    [3620, 660, 900, 140],   // bosgrond D
    [4620, 660, 140, 40],    // boomstronk-stapsteen
    [4860, 660, 540, 140],   // bosgrond E — met de vlag
  ],

  pickups: [
    { x: 260, y: 600, amount: 1 },
    { x: 1100, y: 600, amount: 1 },
    { x: 2100, y: 600, amount: 1 },
    { x: 2200, y: 600, amount: 1, regen: true }, // magisch: groeit terug (plaat 1)
    { x: 3750, y: 600, amount: 1 },
    { x: 3980, y: 600, amount: 1, regen: true }, // voor plaat 2
  ],

  // GEEF-PLATEN: laat blokjes achter om de slagboom te openen — aftrekken
  // met je eigen lijf! De magische bolletjes ervoor groeien steeds terug.
  plates: [
    { x: 2350, doel: 3 },
    { x: 4150, doel: 5 },
  ],

  // Grauwe muur op het pad: KABOEM met je tien-kracht!
  grauwMuren: [2800],

  // Drie tientallen-bruggen: 15 = 10+5, 20 = 10+10, en 17 = 10+7 (teen-getal).
  gates: [
    { type: 'brug', gapX: 620,  gapW: 360, y: 650, doel: 15, blocks: [10, 5, 2],  triggerX: 500,  triggerW: 120 },
    { type: 'brug', gapX: 1600, gapW: 360, y: 650, doel: 20, blocks: [10, 10, 5], triggerX: 1480, triggerW: 120 },
    { type: 'brug', gapX: 3260, gapW: 360, y: 650, doel: 17, blocks: [10, 7, 4],  triggerX: 3140, triggerW: 120 },
  ],

  grommels: [
    { type: 'stomp', x: 1200, y: 612, patrol: [1100, 1450] },
    { type: 'springer', x: 2600, y: 612, patrol: [2500, 2700] },
    { type: 'stomp', x: 3000, y: 612, patrol: [2900, 3100] },
    { type: 'glijder', x: 3900, y: 612, patrol: [3800, 4050] },
    { type: 'stomp', x: 5050, y: 612, patrol: [4950, 5150] },
  ],

  star: { x: 1250, y: 424 },

  goal: { x: 5250, y: 588, value: 20 },

  reward: {
    title: 'Level 3-3 gehaald! 🏆',
    subtitle: 'Vijftien, zeventien en twintig — jij telt met tienen!',
    stars: 3, medal: 'adventure_3_3', medalLabel: 'Tientallen-Loper',
  },
};

export const LEVEL_3_4 = {
  id: '3-4',
  naam: 'De Grommel-Jacht',

  worldW: 5600,
  worldH: 800,
  killY: 720,
  terrain: 'bos',
  bg: { top: 0x8fd3ff, bottom: 0x74b565 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Kleur alle Grommels terug — dan opent de vlag!',
  afterGate: 'Mooi! Waar zit de volgende Grommel? 🎨',

  // MISSIE-LEVEL: de vlag zit op slot tot je alle VIJF de Grommels hebt
  // teruggekleurd — en eentje zit hoog in de BOOM-KLIM (richels omhoog!).
  missie: 'grommels',

  platforms: [
    [0, 660, 560, 140],      // bosgrond A
    [920, 660, 1000, 140],   // bosgrond B (lang jachtterrein)
    [1920, 660, 640, 140],   // bosgrond C — met de muur
    [2200, 470, 60, 190],    // hoge MUUR op C: alleen met dubbelsprong
    [2920, 660, 2680, 140],  // bosgrond D — met de boom-klim en de vlag
    [3300, 460, 240, 26],    // boom-klim richel 1
    [3700, 300, 260, 26],    // boom-klim richel 2 — daar zit de hoge Grommel!
  ],

  pickups: [
    { x: 200, y: 600, amount: 1 },
    { x: 1050, y: 600, amount: 1 },
    { x: 2050, y: 600, amount: 1 },
    { x: 3400, y: 410, amount: 1 }, // op klim-richel 1
    { x: 4500, y: 600, amount: 1 },
  ],

  // Grauwe muur midden op het jachtterrein.
  grauwMuren: [1700],

  // 13 = 10+3 en 20 = 10+10 — met een afleider erbij.
  gates: [
    { type: 'brug', gapX: 560,  gapW: 360, y: 650, doel: 13, blocks: [10, 3, 4],  triggerX: 440,  triggerW: 120 },
    { type: 'brug', gapX: 2560, gapW: 360, y: 650, doel: 20, blocks: [10, 10, 3], triggerX: 2440, triggerW: 120 },
  ],

  grommels: [
    { type: 'stomp', x: 300,  y: 612, patrol: [180, 500] },
    { type: 'springer', x: 1200, y: 612, patrol: [980, 1520] },
    { type: 'stomp', x: 2400, y: 612, patrol: [2260, 2520] },     // ná de muur
    { type: 'stomp', x: 3800, y: 252, patrol: [3720, 3900] },     // hoog in de boom-klim!
    { type: 'glijder', x: 4700, y: 612, patrol: [4600, 4900] },
  ],

  // Ster hoog boven de muur — pak 'm tijdens de verplichte dubbelsprong-hop.
  star: { x: 2230, y: 430 },

  goal: { x: 5450, y: 588, value: 20 },

  reward: {
    title: 'Level 3-4 gehaald! 🏆',
    subtitle: 'Alle Grommels blij — zelfs die hoog in de boom!',
    stars: 3, medal: 'adventure_3_4', medalLabel: 'Grommel-Vriend',
  },
};

export const LEVEL_3_5 = {
  id: '3-5',
  naam: 'De Boom-Baas',

  worldW: 4800,
  worldH: 800,
  killY: 720,
  terrain: 'bos',
  bg: { top: 0x6fa8c8, bottom: 0x5d9954 }, // schemerig bos — spannend

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'De Boom-Grommel! Stamp — en raap zijn eikels!',

  // Volwaardige aanloop (grauwe muur, tientallen-brug) en dan het gevecht:
  // stijl 'schud' — STAMP naast de stam zodat de eikels vallen, en raap er
  // PRECIES zoveel als hij vraagt (4, dan 6, dan 8). Precies tellen!
  platforms: [
    [0, 660, 1400, 140],     // bosgrond A (aanloop)
    [1760, 660, 3040, 140],  // bosgrond B — de baas-arena
  ],

  pickups: [
    { x: 250,  y: 600, amount: 1 },
    { x: 520,  y: 600, amount: 1 },
    { x: 1900, y: 600, amount: 1 },
    { x: 2200, y: 600, amount: 1, regen: true },
  ],

  // Grauwe muur in de aanloop (tien-kracht!) + een tientallen-brug.
  grauwMuren: [800],

  gates: [
    { type: 'brug', gapX: 1400, gapW: 360, y: 650, doel: 15, blocks: [10, 5, 3], triggerX: 1280, triggerW: 120 },
  ],

  grommels: [
    { type: 'stomp', x: 500, y: 612, patrol: [400, 700] },
    { type: 'stomp', x: 1100, y: 612, patrol: [1000, 1250] },
    { type: 'springer', x: 2500, y: 612, patrol: [2400, 2600] },
  ],

  // De Boom-Grommel — stijl 'schud': stamp naast de stam, de eikels regenen
  // omlaag, raap er precies 4 → 6 → 8. Tussendoor rollen er eikels!
  boss: {
    x: 3600,
    name: 'Boom-Grommel',
    look: 'boom',
    stijl: 'schud',
    stages: [
      { doel: 4 },
      { doel: 6 },
      { doel: 8 },
    ],
  },

  // Verstopte ster boven de arena: pak 'm tussen de eikels door!
  star: { x: 2900, y: 440 },

  goal: { x: 4650, y: 588, value: 20 },

  reward: {
    title: 'WERELD 3 UITGESPEELD! 🏆🎉',
    subtitle: 'Je hebt de Boom-Grommel verslagen en het bos gered!',
    stars: 5, medal: 'world3_done', medalLabel: 'Held van Wereld 3',
  },
};

export const WORLD3 = [LEVEL_3_1, LEVEL_3_2, LEVEL_3_3, LEVEL_3_4, LEVEL_3_5];
