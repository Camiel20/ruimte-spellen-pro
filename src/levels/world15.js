// ===== WERELD 15 — DINO-DAL (leveldata) =====
// Een prehistorische vallei vol vriendelijke dino's! 🦖 Concept: SPRONGEN
// op de getallenlijn (2, 5 en 10) — dé opstap naar de tafels.
//   - DE DINO-RIT 🦖 : kies de dino die PRECIES op het doel landt en tel
//     zijn sprongen mee. Moe-regel: max 6 sprongen — grote sprongen komen
//     véél sneller ver (daarom kan alleen de Reuzen-Dino 40 halen).
//   - FOSSIELEN 🦴 : veeg het zand weg en graaf een dino-skelet op.
//   - LAVA & GEISERS 🌋 : borrelende lava-poelen met geiser-lanceringen
//     eroverheen — timen, zweven, bijsturen.
// Eindbaas: Reken-Rex — tel zíjn sprongen en raak het goede bot-bord.
// HERZIEN (speeltest 2026-07-15): "te herhalend, veel rechtdoor lopen" →
// elk level heeft nu lava-kloven, hoogte-routes en gemixte beats
// (kei-achtervolging, duwkist, grauwmuur, portalen, telwolken-klimmen).

export const LEVEL_15_1 = {
  id: '15-1',
  naam: 'De Varen-Vallei',

  worldW: 5000,
  worldH: 800,
  killY: 720,
  terrain: 'dino',
  bg: { top: 0xffd9a0, bottom: 0x8fbf6a }, // warme oerzon → varen-groen

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Welkom in het Dino-Dal! Kies de dino die PRECIES landt 🦖',

  // Les 1 (5 beats): dino-rit → tel-wolk over de lava → fossiel + klim
  // naar de ster → geiser-lancering over lava 2 (gouden nul in de lucht!)
  // → MEER-muur.
  platforms: [
    [0, 660, 1450, 140],     // de vallei-ingang (met de dino-rit)
    [1750, 660, 1450, 140],  // het midden-plateau
    [3500, 660, 1500, 140],  // de overkant
    [2500, 430, 170, 26],    // klim-richel 1
    [2750, 300, 150, 26],    // klim-richel 2 (de ster!)
    [3320, 420, 150, 26],    // tussenlanding boven lava 2
  ],

  water: [[1450, 690, 300, 110], [3200, 690, 300, 110]], // borrelende lava!

  dinoRitten: [
    { x: 550, start: 0, doel: 6 },
  ],

  telWolken: [[1480, 540, 130]], // de wolk-brug over lava 1

  fossielen: [[2100]],

  geisers: [
    { x: 3140 }, // lanceert je over lava 2 — grijp de gouden nul!
  ],

  vraagMuren: [
    { x: 4200, kies: 'meer', opties: [8, 3] },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 1900, y: 600, amount: 1 },
    { x: 4000, y: 600, amount: 1, regen: true }, // vóór de vraagmuur
  ],

  grommels: [
    { type: 'stomp', x: 1150, y: 612, patrol: [1080, 1280] },
    { type: 'springer', x: 2270, y: 612, patrol: [2200, 2350] },
    { type: 'vlieger', x: 2650, y: 220, patrol: [2450, 2850] }, // bewaakt de ster!
    { type: 'werper', x: 3870, y: 612, patrol: [3800, 3950] },
    { type: 'stomp', x: 4550, y: 612, patrol: [4450, 4650] },
  ],

  star: { x: 2820, y: 220 },
  goudenNul: { x: 3350, y: 300 }, // boven de lava — geiser-vlucht!

  goal: { x: 4900, y: 588, value: 10 },

  reward: {
    title: 'Level 15-1 gehaald! 🏆',
    subtitle: 'Drie sprongen van 2 — precies op 6 geland!',
    stars: 3, medal: 'adventure_15_1', medalLabel: 'Dino-Vriend',
  },
};

export const LEVEL_15_2 = {
  id: '15-2',
  naam: 'Het Eier-Veld',

  worldW: 5400,
  worldH: 800,
  killY: 720,
  terrain: 'dino',
  bg: { top: 0xffd2a0, bottom: 0x86b562 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Sprongen van 5… en RENNEN voor de rollende kei! 🥚',

  // Les 2 (5 beats): dino-rit van 5 → KEI-ACHTERVOLGING → geiser over de
  // lava → geiser-klim naar de ster → fossiel + richel-klim (gouden nul).
  platforms: [
    [0, 660, 2600, 140],
    [2950, 660, 2450, 140],  // na de lava
    [3550, 300, 160, 26],    // ster-richel (via de hoge geiser)
    [4600, 480, 150, 26],    // klim-richel 1
    [4850, 360, 150, 26],    // klim-richel 2 (gouden nul)
  ],

  water: [[2600, 690, 350, 110]],

  dinoRitten: [
    { x: 600, start: 0, doel: 15 },
  ],

  achtervolgingen: [
    { spawnX: 1400, triggerX: 1650, endX: 2450 }, // een rollende oer-kei!
  ],

  geisers: [
    { x: 2540 },                 // over de lava
    { x: 3620, hoogte: 340 },    // omhoog naar de ster-richel
  ],

  fossielen: [[4200]],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 1350, y: 600, amount: 1 }, // vóór de achtervolging
    { x: 3100, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 1150, y: 612, patrol: [1080, 1280] },
    { type: 'werper', x: 3270, y: 612, patrol: [3200, 3350] }, // gooit mini-eitjes!
    { type: 'vlieger', x: 3900, y: 260, patrol: [3700, 4100] },
    { type: 'springer', x: 4470, y: 612, patrol: [4400, 4550] },
    { type: 'stomp', x: 5100, y: 612, patrol: [5000, 5200] },
  ],

  star: { x: 3620, y: 210 },
  goudenNul: { x: 4920, y: 280 },

  goal: { x: 5300, y: 588, value: 10 },

  reward: {
    title: 'Level 15-2 gehaald! 🏆',
    subtitle: 'Vijf-tien-vijftien geteld én de kei te snel af!',
    stars: 3, medal: 'adventure_15_2', medalLabel: 'Eier-Teller',
  },
};

export const LEVEL_15_3 = {
  id: '15-3',
  naam: 'De Lava-Helling',

  worldW: 5600,
  worldH: 800,
  killY: 720,
  terrain: 'dino',
  bg: { top: 0xffc98a, bottom: 0x7aa858 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'De vulkaan borrelt! Alleen de REUZEN-DINO haalt de 40 🌋',

  // Les 3 (6 beats): de Reuzen-Dino-rit (40!) → geiser over lava 1 →
  // tel-wolken-klim → richel-trap de helling op (ster) → geiser over
  // lava 2 → MINDER-muur.
  platforms: [
    [0, 660, 2000, 140],
    [2300, 660, 1200, 140],  // het middenstuk
    [3800, 660, 1800, 140],  // de overkant
    [2800, 470, 160, 26],    // helling-trede 1
    [3100, 350, 160, 26],    // helling-trede 2 (de ster!)
  ],

  water: [[2000, 690, 300, 110], [3500, 690, 300, 110]],

  dinoRitten: [
    { x: 700, start: 0, doel: 40 },
  ],

  geisers: [
    { x: 1940 },  // over lava 1
    { x: 3440 },  // aan de rand van lava 2 — wacht op de spuit en zweef!
  ],

  telWolken: [[2330, 540, 120], [2560, 420, 120]], // de wolken-klim omhoog

  vraagMuren: [
    { x: 4700, kies: 'minder', opties: [2, 9] },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2400, y: 600, amount: 1 },
    { x: 4500, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'glijder', x: 1700, y: 612, patrol: [1600, 1800] },
    { type: 'vlieger', x: 2900, y: 260, patrol: [2700, 3100] }, // boven de helling
    { type: 'werper', x: 3270, y: 612, patrol: [3200, 3350] },
    { type: 'vlieger', x: 3650, y: 300, patrol: [3520, 3780] }, // boven lava 2!
    { type: 'stomp', x: 5100, y: 612, patrol: [5000, 5200] },
  ],

  star: { x: 3170, y: 270 },
  goudenNul: { x: 2620, y: 300 }, // hoog boven de tel-wolken

  goal: { x: 5500, y: 588, value: 10 },

  reward: {
    title: 'Level 15-3 gehaald! 🏆',
    subtitle: 'Tien, twintig, dertig, VEERTIG — reuzensprongen!',
    stars: 3, medal: 'adventure_15_3', medalLabel: 'Lava-Springer',
  },
};

export const LEVEL_15_4 = {
  id: '15-4',
  naam: 'Het Botten-Bos',

  worldW: 6000,
  worldH: 800,
  killY: 720,
  terrain: 'dino',
  bg: { top: 0xffcf94, bottom: 0x6f9d50 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Start eens NIET op nul: van 5 naar 30, van 10 naar 60! 🦴',

  // Les 4 (6 beats): rit 5→30 → duw-kist naar de gouden nul → geiser over
  // de lava → fossiel → GRAUWE MUUR (ram!) + portaal-som → rit 10→60 →
  // ster-richel als toetje.
  platforms: [
    [0, 660, 2200, 140],
    [2500, 660, 3500, 140],  // na de lava
    [1780, 460, 170, 26],    // duwkist-richel (gouden nul)
    [5350, 430, 170, 26],    // ster-richel na de grote rit
  ],

  water: [[2200, 690, 300, 110]],

  dinoRitten: [
    { x: 500, start: 5, doel: 30 },
    { x: 4100, start: 10, doel: 60 },
  ],

  duwKisten: [1600],

  geisers: [
    { x: 2140 },  // over de lava
  ],

  fossielen: [[2700]],

  grauwMuren: [3050],

  portalen: [
    { x: 3350, doel: 10, opties: [[5, 5], [6, 5], [8, 3]] },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2600, y: 600, amount: 1 },
    { x: 3200, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 1250, y: 612, patrol: [1180, 1380] },
    { type: 'springer', x: 1970, y: 612, patrol: [1900, 2050] },
    { type: 'werper', x: 2870, y: 612, patrol: [2800, 2950] },
    { type: 'vlieger', x: 3900, y: 260, patrol: [3700, 4100] },
    { type: 'glijder', x: 5150, y: 612, patrol: [5050, 5250] },
  ],

  star: { x: 5430, y: 340 },
  goudenNul: { x: 1860, y: 340 }, // op de richel — duw de kist ernaartoe!

  goal: { x: 5900, y: 588, value: 10 },

  reward: {
    title: 'Level 15-4 gehaald! 🏆',
    subtitle: 'Van 10 naar 60 in vijf reuzensprongen — knap geteld!',
    stars: 3, medal: 'adventure_15_4', medalLabel: 'Botten-Baas',
  },
};

export const LEVEL_15_5 = {
  id: '15-5',
  naam: 'Reken-Rex',

  worldW: 5200,
  worldH: 800,
  killY: 720,
  terrain: 'dino',
  bg: { top: 0xf0b070, bottom: 0x5f8a45 }, // schemer in het dal…

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'REKEN-REX verspert het dal — tel zijn sprongen mee! 🦖',

  // De finale (5 beats): dino-rit → geiser over de lava (gouden nul!) →
  // fossiel + ster-richel → tel-wolk → REKEN-REX zelf (2 → 5 → 10).
  platforms: [
    [0, 660, 1700, 140],
    [2000, 660, 3200, 140],  // de baas-vallei
    [2450, 430, 180, 26],    // ster-richel
  ],

  water: [[1700, 690, 300, 110]],

  dinoRitten: [
    { x: 600, start: 0, doel: 8 },
  ],

  geisers: [
    { x: 1640 },  // over de lava — grijp de gouden nul in de vlucht!
  ],

  fossielen: [[2300]],

  telWolken: [[2900, 500, 130]],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2150, y: 600, amount: 1 },
    { x: 3500, y: 600, amount: 1, regen: true }, // snack tussen de eieren
  ],

  grommels: [
    { type: 'stomp', x: 1300, y: 612, patrol: [1230, 1430] },
    { type: 'springer', x: 2770, y: 612, patrol: [2700, 2850] },
    { type: 'werper', x: 3670, y: 612, patrol: [3600, 3750] },
  ],

  boss: {
    x: 4300,
    name: 'Reken-Rex',
    look: 'rex',
    stijl: 'sprong',
    stages: [
      { start: 4, sprong: 2, keer: 3, doel: 10, opties: [10, 8, 12] },
      { start: 10, sprong: 5, keer: 4, doel: 30, opties: [30, 25, 35] },
      { start: 20, sprong: 10, keer: 3, doel: 50, opties: [50, 40, 53] },
    ],
  },

  star: { x: 2530, y: 350 },
  goudenNul: { x: 1850, y: 300 }, // boven de lava — geiser-vlucht!

  goal: { x: 5050, y: 588, value: 10 },

  reward: {
    title: 'HET DINO-DAL UITGESPEELD! 🏆🦖',
    subtitle: 'Reken-Rex telt nu mee in plaats van te brullen!',
    stars: 5, medal: 'world15_done', medalLabel: 'Dino-Ruiter',
  },
};

export const WORLD15 = [LEVEL_15_1, LEVEL_15_2, LEVEL_15_3, LEVEL_15_4, LEVEL_15_5];
