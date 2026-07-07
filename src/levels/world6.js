// ===== WERELD 6 — HET GRAUWE FORT (de finale!) =====
// Onweerslucht, kasteelstenen, fakkels. Hier woont Baron Grauw. Twee levels:
// eerst de fort-muur BEKLIMMEN (verticaal: worldH 2200, de camera klimt mee),
// daarna de baron zelf — een FINALE-EPOS in drie aktes die de hele reis
// samenvatten. Hij wordt geen verliezer maar een bekeerling: hij ontdekt dat
// tellen leuk is.
//
// RENOVATIE 2026-07-07: 6-1 hoger en rijker (2200 hoog, twee poorten),
// 6-2 volwaardige aanloop (~4600px, alle vier de krachten) + stijl 'finale':
// akte 1 vang de gestolen kleur · akte 2 ram zijn schilden · akte 3 de
// bouw-climax met zijn grootste getal.

export const LEVEL_6_1 = {
  id: '6-1',
  naam: 'De Fort-Klim',

  worldW: 1200,
  worldH: 2200, // VERTICAAL: bijna drie schermen hoog — de grote klim!
  killY: 2180,
  terrain: 'fort',
  bg: { top: 0x2e2a38, bottom: 0x565b61 }, // onweerslucht → grauwe muur

  start: { x: 1100, y: 1960 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Het fort van Baron Grauw! Ram de poorten en klim naar de top!',

  // Twee fortpoorten (tien-kracht!) en een lange zigzag omhoog. Vallen kan
  // niet erg zijn: je landt gewoon op een lager stuk en klimt opnieuw.
  platforms: [
    [0, 2060, 1200, 140],   // fort-vloer (vallen = zacht landen)
    [60, 1920, 240, 26],
    [440, 1780, 240, 26],
    [80, 1640, 240, 26],
    [460, 1500, 240, 26],
    [100, 1360, 240, 26],
    [480, 1220, 240, 26],
    [120, 1080, 240, 26],
    [500, 940, 240, 26],
    [140, 800, 240, 26],
    [480, 660, 240, 26],
    [120, 520, 240, 26],
    [500, 400, 240, 26],
    [480, 260, 300, 26],    // de top — met de vlag
    [0, 320, 120, 26],      // geheim zij-richeltje (Gouden Nul!)
  ],

  // Twee fortpoorten: alleen de tien-kracht komt erdoorheen.
  grauwMuren: [700, 300],

  // Tel-wolken als riskante shortcut tussen de zigzag-kolommen.
  telWolken: [
    [320, 1570, 130, 0],
    [320, 1290, 130, 1400],
    [320, 1010, 130, 0],
    [320, 590, 130, 1400],
  ],

  pickups: [
    { x: 170, y: 1860, amount: 1 },
    { x: 550, y: 1720, amount: 1 },
    { x: 190, y: 1580, amount: 1 },
    { x: 570, y: 1440, amount: 1 },
    { x: 210, y: 1300, amount: 1 },
    { x: 590, y: 880, amount: 1 },
    { x: 230, y: 740, amount: 1 },
  ],

  grommels: [
    { type: 'springer', x: 900, y: 2012, patrol: [800, 1050] },
    { type: 'vlieger', x: 600, y: 1700, patrol: [250, 950] },  // bewaakt de klim
    { type: 'vlieger', x: 400, y: 1100, patrol: [200, 900] },
    { type: 'vlieger', x: 500, y: 500, patrol: [250, 850] },   // de top-wacht!
  ],

  // Ster boven een tel-wolk: voor durvers midden in het ritme.
  star: { x: 385, y: 940 },

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

  worldW: 4600,
  worldH: 800,
  killY: 790, // de kratten-gang ligt op 760
  terrain: 'fort',
  bg: { top: 0x26222f, bottom: 0x4a4f55 }, // het donkerste uur — vlak voor de kleur

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'BARON GRAUW! Gebruik ALLES wat je leerde — en breng de kleur terug!',
  finale: true, // na dit level: het grote feest (geen volgend level)

  // De aanloop door het fort vraagt alle vier de krachten (dubbelsprong,
  // stampen, duwen, tien-kracht) — en dan het FINALE-EPOS in drie aktes:
  // vang de gestolen kleur → ram zijn schilden → bouw zijn grootste getal.
  platforms: [
    [0, 660, 1200, 140],     // fort-hal A
    [700, 458, 60, 202],     // muur-hop (dubbelsprong)
    [1550, 440, 50, 220],    // muur boven de kratten-gang
    [1250, 760, 700, 40],    // kratten-gang (stampen) onder de muur door
    [1950, 660, 2650, 140],  // fort-hal B — duw-kist, poort en de arena
    [2350, 340, 180, 26],    // hoge richel: alleen via de duw-kist (ster!)
  ],

  breakables: [
    [1250, 660, 60, 100],
    [1310, 660, 60, 100],
    [1370, 660, 60, 100],
  ],

  duwKisten: [2270],

  // De laatste fortpoort vóór de arena (en de collider voor de schilden!).
  grauwMuren: [2700],

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 520, y: 600, amount: 1 },
    { x: 1650, y: 724, amount: 1 }, // in de gang
    { x: 2100, y: 600, amount: 1 },
    { x: 3000, y: 600, amount: 1, regen: true }, // vóór het gevecht
  ],

  grommels: [
    { type: 'springer', x: 500, y: 612, patrol: [360, 650] },
    { type: 'vlieger', x: 1000, y: 400, patrol: [850, 1150] },
    { type: 'stomp', x: 2150, y: 612, patrol: [2050, 2250] },
    { type: 'vlieger', x: 3100, y: 400, patrol: [2900, 3300] },
  ],

  // BARON GRAUW — stijl 'finale', drie aktes:
  //   1. hij morst de gestolen kleur: vang 5 kleur-orbs (bliksem ontwijken!)
  //   2. hij verschanst zich achter twee schilden: RAM ze met de tien-kracht
  //   3. de bouw-climax: zijn grootste getal (34 → bouw de 30)
  boss: {
    x: 3900,
    name: 'Baron Grauw',
    look: 'grauw',
    stijl: 'finale',
    stages: [
      { soort: 'vang', doel: 5 },
      { soort: 'muur', doel: 10 },
      { soort: 'bouw', doel: 30, blocks: [21, 13] },
    ],
  },

  // Ster boven de duw-kist-richel: alle krachten verdienen hun moment.
  star: { x: 2440, y: 250 },

  goal: { x: 4450, y: 588, value: 30 },

  reward: {
    title: 'GETALLEN-LAND IS GERED! 🏆🎉',
    subtitle: 'Baron Grauw telt nu mee — en de hele wereld is weer in kleur!',
    stars: 5, medal: 'grauw_verslagen', medalLabel: 'Redder van Getallen-Land',
  },
};

export const WORLD6 = [LEVEL_6_1, LEVEL_6_2];
