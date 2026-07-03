// ===== WERELD 6 — HET GRAUWE FORT (de finale!) =====
// Onweerslucht, kasteelstenen, fakkels. Hier woont Baron Grauw. Twee levels:
// eerst de fort-muur BEKLIMMEN (het eerste VERTICALE level: worldH 1800,
// de camera klimt mee), daarna de baron zelf — geweldloos verslagen met de
// grootste getallen van het spel (10 → 20 → 30). Hij wordt geen verliezer
// maar een bekeerling: hij ontdekt dat tellen leuk is.

export const LEVEL_6_1 = {
  id: '6-1',
  naam: 'De Fort-Klim',

  worldW: 1200,
  worldH: 1800, // VERTICAAL: ruim twee schermen hoog — klimmen!
  killY: 1780,
  terrain: 'fort',
  bg: { top: 0x2e2a38, bottom: 0x565b61 }, // onweerslucht → grauwe muur

  start: { x: 1100, y: 1560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Het fort van Baron Grauw! Ram de poort en klim naar de top!',

  // Eerst met de tien-kracht door de fortpoort, dan zigzag omhoog langs de
  // richels. Vallen kan niet erg zijn: je landt gewoon weer op de fort-vloer.
  platforms: [
    [0, 1660, 1200, 140],   // fort-vloer (vallen = zacht landen, opnieuw klimmen)
    [60, 1520, 240, 26],
    [440, 1380, 240, 26],
    [80, 1240, 240, 26],
    [460, 1100, 240, 26],
    [100, 960, 240, 26],
    [480, 820, 240, 26],
    [120, 680, 240, 26],
    [500, 540, 240, 26],
    [140, 400, 240, 26],
    [480, 260, 300, 26],    // de top — met de vlag
    [0, 320, 120, 26],      // geheim zij-richeltje (Gouden Nul!)
  ],

  // De fortpoort: alleen de tien-kracht komt erdoorheen.
  grauwMuren: [700],

  // Tel-wolken als riskante shortcut tussen de zigzag-kolommen.
  telWolken: [
    [320, 1170, 130, 0],
    [320, 890, 130, 1400],
  ],

  pickups: [
    { x: 170, y: 1460, amount: 1 },
    { x: 550, y: 1320, amount: 1 },
    { x: 190, y: 1180, amount: 1 },
    { x: 570, y: 1040, amount: 1 },
    { x: 210, y: 900, amount: 1 }, // hoe hoger je komt, hoe hoger je springt
  ],

  grommels: [
    { type: 'springer', x: 900, y: 1612, patrol: [800, 1050] },
    { type: 'vlieger', x: 600, y: 1300, patrol: [250, 950] },  // bewaakt de klim
    { type: 'vlieger', x: 400, y: 700, patrol: [200, 900] },
  ],

  // Ster boven de tweede tel-wolk: voor durvers midden in het ritme.
  star: { x: 385, y: 820 },

  // Gouden Nul op het geheime zij-richeltje, helemaal bovenin links.
  goudenNul: { x: 55, y: 260 },

  goal: { x: 630, y: 188, value: 10 },

  reward: {
    title: 'Level 6-1 gehaald! 🏆',
    subtitle: 'Je hebt de fort-muur beklommen — daar is de baron!',
    stars: 3, medal: 'adventure_6_1', medalLabel: 'Fort-Klimmer',
  },
};

export const LEVEL_6_2 = {
  id: '6-2',
  naam: 'Baron Grauw',

  worldW: 2200,
  worldH: 800,
  killY: 720,
  terrain: 'fort',
  bg: { top: 0x26222f, bottom: 0x4a4f55 }, // het donkerste uur — vlak voor de kleur

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'BARON GRAUW! Bouw de grootste getallen — en breng de kleur terug!',
  finale: true, // na dit level: het grote feest (geen volgend level)

  platforms: [
    [0, 660, 2200, 140],
  ],

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 520, y: 600, amount: 1 },
    { x: 790, y: 600, amount: 1 },
    { x: 1060, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'springer', x: 500, y: 612, patrol: [360, 760] },
    { type: 'vlieger', x: 1100, y: 400, patrol: [850, 1350] },
  ],

  // De finale-fasen: de grootste bouwsels van het spel, altijd mét splitsen
  // (7+6=13 → scheur 10 af, enzovoort). Zijn grauw-wolkjes zijn het snelst.
  boss: {
    x: 1700,
    name: 'Baron Grauw',
    look: 'grauw',
    stages: [
      { doel: 10, blocks: [7, 6] },    // 13 → 10 + 3
      { doel: 20, blocks: [14, 9] },   // 23 → 20 + 3
      { doel: 30, blocks: [21, 13] },  // 34 → 30 + 4
    ],
  },

  // Ster boven de arena: pak 'm tussen de grauw-wolkjes door!
  star: { x: 900, y: 440 },

  goal: { x: 2080, y: 588, value: 30 },

  reward: {
    title: 'GETALLEN-LAND IS GERED! 🏆🎉',
    subtitle: 'Baron Grauw telt nu mee — en de hele wereld is weer in kleur!',
    stars: 5, medal: 'grauw_verslagen', medalLabel: 'Redder van Getallen-Land',
  },
};

export const WORLD6 = [LEVEL_6_1, LEVEL_6_2];
