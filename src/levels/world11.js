// ===== WERELD 11 — BILLENLAND (leveldata) =====
// Adrians eigen wens: een billen-wereld! 🍑 Zacht-roze giechel-land met
// billen-heuvels, zeepbellen en de Stinke-Bil die NIET in bad wil.
// Concept: EVEN & ONEVEN — billen komen in PAREN! Twee nieuwe werkwoorden:
//   - STUITEREN 🍑 : land op een stuiter-bil → PRRRT! → hoog gelanceerd
//     (hoger dan je zelf springt, en je dubbelsprong laadt opnieuw).
//   - PAREN CHECKEN 💑 : het paren-bord toont een getal mét zijn stipjes in
//     paren — heeft iedereen een maatje (even) of blijft er eentje alleen
//     (oneven)? Kopstoot tegen het goede blok.
// Levels volgen de lengte-norm: ~5000-6000px, 4-6 speel-beats per level.

export const LEVEL_11_1 = {
  id: '11-1',
  naam: 'Stuiter-Start',

  worldW: 5000,
  worldH: 800,
  killY: 720,
  terrain: 'billen',
  bg: { top: 0x8fd3ff, bottom: 0xf5c8c0 }, // zomerlucht → zacht perzik-roze

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Spring op de stuiter-bil — PRRRT, de lucht in! 🍑',

  // Les 1: de stuiter-bil (hoog!) en het eerste paren-bord (4 = makkelijk
  // even). Beat voor beat: oefenen → bil + ster-richel → paren-bord →
  // bil 2 met de Gouden Nul hoog in de lucht → eind-bil naar de vlag-richel.
  platforms: [
    [0, 660, 5000, 140],
    [900, 380, 200, 26],    // ster-richel — alleen via de stuiter-bil
    [4560, 400, 240, 26],   // de eind-richel met de vlag
  ],

  bilTrampolines: [[820, 600], [2600, 600], [4460, 600]],

  parenBorden: [
    { x: 1900, getal: 4 },  // ⚫⚫ ⚫⚫ — iedereen een maatje!
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 1650, y: 600, amount: 1, regen: true }, // vóór het paren-bord
    { x: 3300, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'stomp', x: 550, y: 612, patrol: [450, 700] },
    { type: 'springer', x: 3000, y: 612, patrol: [2900, 3100] },
    { type: 'stomp', x: 3900, y: 612, patrol: [3800, 3980] },
  ],

  // Ster op de hoge richel; de Gouden Nul hangt hoog boven bil 2 —
  // stuiteren + dubbelsprong om 'm te grijpen!
  star: { x: 1000, y: 340 },
  goudenNul: { x: 2600, y: 300 },

  goal: { x: 4680, y: 358, value: 4 },

  reward: {
    title: 'Level 11-1 gehaald! 🏆',
    subtitle: 'PRRRT de lucht in — welkom in Billenland!',
    stars: 3, medal: 'adventure_11_1', medalLabel: 'Stuiter-Ster',
  },
};

export const LEVEL_11_2 = {
  id: '11-2',
  naam: 'Het Paren-Pad',

  worldW: 5400,
  worldH: 800,
  killY: 720,
  terrain: 'billen',
  bg: { top: 0x8fd3ff, bottom: 0xf2bcb2 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Heeft iedereen een maatje? Kijk goed naar de stipjes! 💑',

  // Les 2: paren checken onder druk. Twee borden (5 = oneven!, 8 = even),
  // tel-wolken omhoog naar de ster, een MEER-vraagmuur als opfrisser en een
  // bad-meer dat je alleen met een stuiter-bil oversteekt.
  platforms: [
    [0, 660, 2400, 140],     // veld A
    [2600, 660, 2800, 140],  // veld B
  ],

  water: [[2400, 690, 200, 110]], // het bad-meer (zeepsop!)

  bilTrampolines: [[2300, 600], [4800, 600]], // de oversteek + een fun-bil

  parenBorden: [
    { x: 1200, getal: 5 },  // ⚫⚫ ⚫⚫ ⚫ — eentje alleen!
    { x: 4200, getal: 8 },
  ],

  vraagMuren: [
    { x: 3300, kies: 'meer', opties: [7, 4] },
  ],

  telWolken: [[600, 420, 120], [780, 340, 120]], // wolken-trapje naar de ster

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 980, y: 600, amount: 1, regen: true },  // vóór bord 1
    { x: 3100, y: 600, amount: 1, regen: true }, // vóór de vraagmuur
    { x: 4000, y: 600, amount: 1, regen: true }, // vóór bord 2
  ],

  grommels: [
    { type: 'stomp', x: 800, y: 612, patrol: [700, 900] },
    { type: 'glijder', x: 1700, y: 612, patrol: [1500, 1900] },
    { type: 'springer', x: 2870, y: 612, patrol: [2800, 2950] },
    { type: 'vlieger', x: 3700, y: 300, patrol: [3500, 3900] },
    { type: 'stomp', x: 4570, y: 612, patrol: [4500, 4650] },
  ],

  // Ster boven het wolken-trapje; de Gouden Nul zweeft boven het bad-meer —
  // grijp 'm tijdens de stuiter-oversteek!
  star: { x: 840, y: 280 },
  goudenNul: { x: 2500, y: 460 },

  goal: { x: 5300, y: 588, value: 8 },

  reward: {
    title: 'Level 11-2 gehaald! 🏆',
    subtitle: '5 is oneven, 8 is even — jij ziet het zó!',
    stars: 3, medal: 'adventure_11_2', medalLabel: 'Paren-Kenner',
  },
};

export const LEVEL_11_3 = {
  id: '11-3',
  naam: 'Zeepbellen-Vallei',

  worldW: 5600,
  worldH: 800,
  killY: 720,
  terrain: 'billen',
  bg: { top: 0x8fd3ff, bottom: 0xefb2a8 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Stuiter, duw en reken je een weg door de vallei! 🍑🧼',

  // Les 3: de grote mix. Stuiter-billen naar hoge richels, een paren-bord
  // met 9 (lastig: veel stipjes!), een duw-kist, en een portaal-som (7).
  platforms: [
    [0, 660, 5600, 140],
    [1400, 430, 200, 26],  // richel boven bil 1
    [2900, 380, 220, 26],  // hoge richel boven bil 2 (met de ster)
  ],

  bilTrampolines: [[1300, 600], [2800, 600], [3900, 600]],

  parenBorden: [
    { x: 2100, getal: 9 }, // ⚫⚫ ⚫⚫ ⚫⚫ ⚫⚫ ⚫ — eentje alleen!
  ],

  duwKisten: [3300],

  portalen: [
    { x: 4400, doel: 7, opties: [[3, 4], [2, 4], [5, 3]] },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 1900, y: 600, amount: 1, regen: true }, // vóór het bord
    { x: 4200, y: 600, amount: 1, regen: true }, // vóór de portalen
  ],

  grommels: [
    { type: 'stomp', x: 700, y: 612, patrol: [600, 800] },
    { type: 'springer', x: 1780, y: 612, patrol: [1700, 1850] },
    { type: 'werper', x: 2470, y: 612, patrol: [2400, 2550] }, // gooit zeep-klodders!
    { type: 'vlieger', x: 3450, y: 300, patrol: [3200, 3700] },
    { type: 'stomp', x: 5000, y: 612, patrol: [4900, 5100] },
  ],

  star: { x: 3010, y: 330 },
  goudenNul: { x: 3900, y: 260 }, // héél hoog boven bil 3: stuiter + dubbelsprong!

  goal: { x: 5480, y: 588, value: 9 },

  reward: {
    title: 'Level 11-3 gehaald! 🏆',
    subtitle: 'Door de zeepbellen heen — niets houdt jou tegen!',
    stars: 3, medal: 'adventure_11_3', medalLabel: 'Bellen-Baas',
  },
};

export const LEVEL_11_4 = {
  id: '11-4',
  naam: 'De Grote Stuiter-Show',

  worldW: 6000,
  worldH: 800,
  killY: 720,
  terrain: 'billen',
  bg: { top: 0x8fd3ff, bottom: 0xecaba0 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Stuiter van bil naar bil — hoger en hoger! 🍑🍑',

  // Les 4: de stuiter-ketting! Een klim over twee hoge richels, tel-wolken,
  // twee paren-borden (7 en 10) en een MINDER-vraagmuur. Het langste level
  // van Billenland.
  platforms: [
    [0, 660, 6000, 140],
    [1000, 360, 180, 26],   // klim-richel 1 (via bil 1)
    [1360, 280, 180, 26],   // klim-richel 2 (dubbelsprong vanaf richel 1)
    [5560, 380, 240, 26],   // de eind-richel met de vlag
  ],

  bilTrampolines: [[900, 600], [1270, 600], [3300, 600], [5460, 600]],

  parenBorden: [
    { x: 2200, getal: 7 },
    { x: 4700, getal: 10 },
  ],

  vraagMuren: [
    { x: 3800, kies: 'minder', opties: [3, 8] },
  ],

  telWolken: [[2700, 420, 120], [2880, 340, 120]],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2000, y: 600, amount: 1, regen: true }, // vóór bord 1
    { x: 3600, y: 600, amount: 1, regen: true }, // vóór de vraagmuur
    { x: 4500, y: 600, amount: 1, regen: true }, // vóór bord 2
  ],

  grommels: [
    { type: 'stomp', x: 700, y: 612, patrol: [600, 780] },
    { type: 'springer', x: 1680, y: 612, patrol: [1600, 1750] },
    { type: 'glijder', x: 2650, y: 612, patrol: [2500, 2900] },
    { type: 'vlieger', x: 3250, y: 280, patrol: [3000, 3500] },
    { type: 'springer', x: 4290, y: 612, patrol: [4200, 4380] },
    { type: 'stomp', x: 5290, y: 612, patrol: [5200, 5380] },
  ],

  // Ster helemaal bovenop de klim-route; Gouden Nul hoog boven bil 3.
  star: { x: 1450, y: 220 },
  goudenNul: { x: 3300, y: 240 },

  goal: { x: 5680, y: 338, value: 10 },

  reward: {
    title: 'Level 11-4 gehaald! 🏆',
    subtitle: 'Wat een stuiter-show — het hele land klapt voor jou!',
    stars: 3, medal: 'adventure_11_4', medalLabel: 'Stuiter-Artiest',
  },
};

export const LEVEL_11_5 = {
  id: '11-5',
  naam: 'De Stinke-Bil',

  worldW: 5200,
  worldH: 800,
  killY: 720,
  terrain: 'billen',
  bg: { top: 0x9dc8e8, bottom: 0xd8988a }, // de lucht betrekt — hier stinkt het!

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'De Stinke-Bil wil niet in bad — vang de zeepbellen! 🧼💨',

  // De finale: stuiteren en paren op weg naar de Stinke-Bil. Hij gooit
  // stinkwolkjes en heeft de zeepbellen gestolen: vang er per fase precies
  // 4, 6 en 8 terug (allemaal PAREN — tel maar na!) en dan móet hij in bad.
  platforms: [
    [0, 660, 5200, 140],
    [1500, 420, 200, 26], // ster-richel boven bil 1
  ],

  bilTrampolines: [[1400, 600], [2500, 600]],

  parenBorden: [
    { x: 2000, getal: 6 }, // opwarmer: 6 = drie paren
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 900, y: 600, amount: 1 },
    { x: 3400, y: 600, amount: 1, regen: true }, // snack tussen de stinkwolkjes
  ],

  grommels: [
    { type: 'stomp', x: 700, y: 612, patrol: [600, 800] },
    { type: 'springer', x: 2670, y: 612, patrol: [2600, 2750] },
    { type: 'glijder', x: 3150, y: 612, patrol: [3000, 3300] },
  ],

  boss: {
    x: 3900,
    name: 'De Stinke-Bil',
    look: 'bil',
    stijl: 'vang',
    stages: [
      { doel: 4 }, // 2 paren zeepbellen
      { doel: 6 }, // 3 paren
      { doel: 8 }, // 4 paren — en dan het bad in!
    ],
  },

  star: { x: 1600, y: 370 },
  goudenNul: { x: 2500, y: 280 }, // hoog boven bil 2

  goal: { x: 5000, y: 588, value: 10 },

  reward: {
    title: 'BILLENLAND UITGESPEELD! 🏆🍑',
    subtitle: 'De Stinke-Bil zit in bad en het hele land ruikt weer fris!',
    stars: 5, medal: 'world11_done', medalLabel: 'Held van Billenland',
  },
};

export const WORLD11 = [LEVEL_11_1, LEVEL_11_2, LEVEL_11_3, LEVEL_11_4, LEVEL_11_5];
