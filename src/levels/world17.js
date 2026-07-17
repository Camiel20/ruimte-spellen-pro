// ===== WERELD 17 — HET CIRCUS-KANON (leveldata) =====
// De grote circustent! 🎪 Concept: WEGEN & BALANS (zwaarder/lichter,
// precies gelijk maken). Drie werkwoorden:
//   - DE WEEGSCHAAL-WIP ⚖️ : links weegt al iets — leg schijven van 1/2/5
//     tot het PRECIES gelijk is (de wip kantelt live mee!).
//   - HET CIRCUS-KANON 💥 : laad kruit-vaatjes en KNAL over het ravijn.
//   - KOORDDANSEN 🎪 : durf jij over het slappe koord?
// Eindbaas: De Sterke Man — maak zijn halter precies even zwaar.
// Dit is de nieuwe LAATSTE wereld: na 17-5 volgt het Grote Slotfeest!

export const LEVEL_17_1 = {
  id: '17-1',
  naam: 'De Piste',

  worldW: 5000,
  worldH: 800,
  killY: 720,
  terrain: 'circus',
  bg: { top: 0x8a4a6a, bottom: 0x3a2438 }, // feesttent-paars

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Dames en heren… welkom in het circus! Maak de wip gelijk ⚖️',

  // Les 1: de weegschaal-wip (5) en het eerste koord. Toetje: een MEER-muur.
  platforms: [
    [0, 660, 5000, 140],
    [1600, 500, 180, 26],   // opstapje naar het koord
    [2450, 500, 180, 26],   // en eraf
  ],

  weegWippen: [
    { x: 900, doel: 5 },
  ],

  koorden: [
    [1780, 2450, 480],
  ],

  telWolken: [[3100, 480, 130]],

  vraagMuren: [
    { x: 4000, kies: 'meer', opties: [7, 2] },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2900, y: 600, amount: 1 },
    { x: 3800, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 2000, y: 612, patrol: [1900, 2100] },  // onder het koord!
    { type: 'vlieger', x: 3000, y: 280, patrol: [2800, 3200] },
    { type: 'springer', x: 3470, y: 612, patrol: [3400, 3550] },
    { type: 'stomp', x: 4500, y: 612, patrol: [4400, 4600] },
  ],

  star: { x: 2100, y: 380 },  // boven het koord — balanceer ernaartoe!
  goudenNul: { x: 4650, y: 260 },

  goal: { x: 4900, y: 588, value: 10 },

  reward: {
    title: 'Level 17-1 gehaald! 🏆',
    subtitle: 'Vijf en vijf in balans — het publiek juicht!',
    stars: 3, medal: 'adventure_17_1', medalLabel: 'Piste-Ster',
  },
};

export const LEVEL_17_2 = {
  id: '17-2',
  naam: 'De Kanon-Knal',

  worldW: 5400,
  worldH: 800,
  killY: 720,
  terrain: 'circus',
  bg: { top: 0x7a4260, bottom: 0x342032 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Kruip in het kanon en KNAL over het ravijn! 💥',

  // Les 2: twee circus-kanonnen over twee ravijnen (2 en 3 vaatjes kruit)
  // en een koord ertussen.
  platforms: [
    [0, 660, 1450, 140],
    [1950, 660, 1600, 140],  // tussen de ravijnen
    [4100, 660, 1300, 140],  // de overkant
    [2350, 500, 170, 26],    // koord-opstapjes
    [3080, 500, 170, 26],
  ],

  kanonnen: [
    { x: 1200, vaatjes: 2, landX: 2100 },
    { x: 3400, vaatjes: 3, landX: 4300 },
  ],

  koorden: [
    [2520, 3080, 480],
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2150, y: 600, amount: 1 },
    { x: 4450, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 700, y: 612, patrol: [600, 800] },
    { type: 'springer', x: 2770, y: 612, patrol: [2700, 2850] },
    { type: 'vlieger', x: 2800, y: 260, patrol: [2600, 3000] },
    { type: 'werper', x: 4670, y: 612, patrol: [4600, 4750] }, // gooit jongleer-balletjes!
  ],

  star: { x: 2800, y: 380 },
  goudenNul: { x: 700, y: 300 },

  goal: { x: 5300, y: 588, value: 10 },

  reward: {
    title: 'Level 17-2 gehaald! 🏆',
    subtitle: 'Twee perfecte knallen — wat een menselijke kanonskogel!',
    stars: 3, medal: 'adventure_17_2', medalLabel: 'Kanonskogel',
  },
};

export const LEVEL_17_3 = {
  id: '17-3',
  naam: 'Het Weeg-Plein',

  worldW: 5600,
  worldH: 800,
  killY: 720,
  terrain: 'circus',
  bg: { top: 0x6e3a56, bottom: 0x2c1c2c },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Twee wippen: eerst 7, dan 12 — kies je schijven slim! ⚖️',

  // Les 3: twee weegwippen (7 en 12 — die tweede vraagt om 5+5+2!), een
  // duw-kist naar de ster en een rollende circus-bal-achtervolging.
  platforms: [
    [0, 660, 5600, 140],
    [2650, 430, 200, 26],   // ster-richel
  ],

  weegWippen: [
    { x: 1100, doel: 7 },
    { x: 4400, doel: 12 },
  ],

  duwKisten: [2450],

  achtervolgingen: [
    { spawnX: 2900, triggerX: 3100, endX: 3900, skin: 'bal' },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2200, y: 600, amount: 1 },
    { x: 4100, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 800, y: 612, patrol: [700, 900] },
    { type: 'werper', x: 2070, y: 612, patrol: [2000, 2150] },
    { type: 'glijder', x: 2350, y: 612, patrol: [2250, 2450] },
    { type: 'stomp', x: 5200, y: 612, patrol: [5100, 5300] },
  ],

  star: { x: 2740, y: 340 },
  goudenNul: { x: 700, y: 280 },

  goal: { x: 5500, y: 588, value: 10 },

  reward: {
    title: 'Level 17-3 gehaald! 🏆',
    subtitle: 'Vijf plus vijf plus twee — twaalf in balans!',
    stars: 3, medal: 'adventure_17_3', medalLabel: 'Weeg-Wonder',
  },
};

export const LEVEL_17_4 = {
  id: '17-4',
  naam: 'De Hoge Draad',

  worldW: 6000,
  worldH: 800,
  killY: 720,
  terrain: 'circus',
  bg: { top: 0x623450, bottom: 0x261828 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Hoog boven de piste: koord… koord… en KNAL! 🎪',

  // Les 4: het hoge-draad-nummer — twee koorden achter elkaar, dan het
  // kanon over het grote ravijn, en een weegwip (10) als finale-poort.
  platforms: [
    [0, 660, 3800, 140],
    [4400, 660, 1600, 140],
    [1050, 500, 170, 26],   // koord-opstapjes
    [1900, 500, 170, 26],
    [2750, 500, 170, 26],
  ],

  koorden: [
    [1220, 1900, 480],
    [2070, 2750, 480],
  ],

  kanonnen: [
    { x: 3500, vaatjes: 3, landX: 4600 },
  ],

  weegWippen: [
    { x: 5100, doel: 10 },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 3100, y: 600, amount: 1 },
    { x: 4700, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 700, y: 612, patrol: [600, 800] },
    { type: 'stomp', x: 1600, y: 612, patrol: [1500, 1700] }, // onder de koorden
    { type: 'vlieger', x: 2300, y: 300, patrol: [2100, 2500] },
    { type: 'werper', x: 3170, y: 612, patrol: [3100, 3250] },
    { type: 'springer', x: 4870, y: 612, patrol: [4800, 4950] },
  ],

  star: { x: 2400, y: 380 },
  goudenNul: { x: 3650, y: 280 },

  goal: { x: 5900, y: 588, value: 10 },

  reward: {
    title: 'Level 17-4 gehaald! 🏆',
    subtitle: 'Over de hoge draad én uit het kanon — wat een nummer!',
    stars: 3, medal: 'adventure_17_4', medalLabel: 'Hoge-Draad-Danser',
  },
};

export const LEVEL_17_5 = {
  id: '17-5',
  naam: 'De Sterke Man',

  worldW: 5200,
  worldH: 800,
  killY: 720,
  terrain: 'circus',
  bg: { top: 0x562c48, bottom: 0x201224 }, // de grote finale-avond!

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'De hoofdact: versla De Sterke Man met… BALANS! 💪',
  // (finale 'slot' is verhuisd naar 19-5 — het Spook-Slot is de nieuwe laatste wereld)

  // De allerlaatste finale van het spel: weegwip + kanon + koord als
  // aanloop, dan De Sterke Man. Maak zijn halter per fase precies even
  // zwaar (10 → 15 → 20) — dan tilt hij hem, wankelt… en buigt voor jou.
  platforms: [
    [0, 660, 2100, 140],
    [2700, 660, 2500, 140],
    [3280, 500, 170, 26],   // koord-opstapjes
    [3830, 500, 170, 26],
  ],

  weegWippen: [
    { x: 800, doel: 9 },
  ],

  kanonnen: [
    { x: 1900, vaatjes: 2, landX: 2900 },
  ],

  koorden: [
    [3450, 3830, 480],
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 3000, y: 600, amount: 1 },
    { x: 3550, y: 600, amount: 1, regen: true }, // snack tussen de kettlebells
  ],

  grommels: [
    { type: 'stomp', x: 1400, y: 612, patrol: [1300, 1500] },
    { type: 'springer', x: 3070, y: 612, patrol: [3000, 3150] },
  ],

  boss: {
    x: 4300,
    name: 'De Sterke Man',
    look: 'sterkeman',
    stijl: 'balans',
    stages: [
      { doel: 10 },
      { doel: 15 },
      { doel: 20 },
    ],
  },

  star: { x: 3640, y: 380 },
  goudenNul: { x: 600, y: 280 },

  goal: { x: 5050, y: 588, value: 10 },

  reward: {
    title: 'HET CIRCUS-KANON UITGESPEELD! 🏆🎪',
    subtitle: 'De Sterke Man buigt voor jou — op naar het Grote Slotfeest!',
    stars: 5, medal: 'world17_done', medalLabel: 'Circus-Directeur',
  },
};

export const WORLD17 = [LEVEL_17_1, LEVEL_17_2, LEVEL_17_3, LEVEL_17_4, LEVEL_17_5];
