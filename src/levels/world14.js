// ===== WERELD 14 — HET STUITER-STADION (leveldata) =====
// Sportdag in het grote stadion! ⚽ Tribunes vol publiek, ballonnen en
// krijtlijnen op het gras. De moeilijkheid GROEIT door de wereld heen:
// eerst sommen t/m 10, dan de tiental-rekken (30 − 12 … 60 − 24).
//   - STUITERBALLEN ⚽ : duw de reuzen-bal waar jij wilt en stuiter hoger
//     dan je ooit kunt springen (beslissen + motoriek).
//   - DE BOWLING-BAAN 🎳 : rol de bal, kegels vallen — hoeveel staan er
//     NOG? (aftrekken; grote banen tonen rekken van 10 = tientallen zien!)
//   - DE BASKET 🏀 : gooi er PRECIES n in en stop op tijd (tellen).
// Eindbaas: de Kegel-Koning — reken zijn kegel-sommen uit (10−4 … 60−24).
// Dit is de nieuwe LAATSTE wereld: na 14-5 volgt het Grote Slotfeest.

export const LEVEL_14_1 = {
  id: '14-1',
  naam: 'Het Stuiterveld',

  worldW: 5000,
  worldH: 800,
  killY: 720,
  terrain: 'ballen',
  bg: { top: 0x8fd3ff, bottom: 0x7ec97a }, // sportdag-lucht → grasveld

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Welkom in het stadion! Duw de bal en STUITER! ⚽',

  // Les 1: de stuiterbal (duwen + stuiteren) en de eerste basket (3).
  platforms: [
    [0, 660, 5000, 140],
    [1900, 360, 200, 26],   // hoge ere-tribune-richel (alleen via de stuiterbal!)
  ],

  stuiterBallen: [1500, 3800],

  baskets: [
    { x: 2700, doel: 3 },
  ],

  telWolken: [[900, 480, 130]],

  vraagMuren: [
    { x: 4300, kies: 'meer', opties: [7, 2] },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2300, y: 600, amount: 1 },
    { x: 4100, y: 600, amount: 1, regen: true }, // vóór de vraagmuur
  ],

  grommels: [
    { type: 'stomp', x: 700, y: 612, patrol: [650, 850] },
    { type: 'vlieger', x: 1700, y: 260, patrol: [1500, 1900] },
    { type: 'springer', x: 3170, y: 612, patrol: [3100, 3250] },
    { type: 'stomp', x: 4600, y: 612, patrol: [4500, 4700] },
  ],

  star: { x: 2000, y: 290 },
  goudenNul: { x: 3900, y: 240 }, // hoog — duw de stuiterbal eronder!

  goal: { x: 4900, y: 588, value: 10 },

  reward: {
    title: 'Level 14-1 gehaald! 🏆',
    subtitle: 'Duwen, stuiteren, scoren — het stadion juicht!',
    stars: 3, medal: 'adventure_14_1', medalLabel: 'Stuiter-Ster',
  },
};

export const LEVEL_14_2 = {
  id: '14-2',
  naam: 'De Bowling-Baan',

  worldW: 5400,
  worldH: 800,
  killY: 720,
  terrain: 'ballen',
  bg: { top: 0x8fd3ff, bottom: 0x74bf70 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Rol de bal! Hoeveel kegels blijven er staan? 🎳',

  // Les 2: AFTREKKEN t/m 10 — twee bowlingbanen (8 en 10 kegels), en als
  // klap op de vuurpijl: een reuzen-voetbal-achtervolging!
  platforms: [
    [0, 660, 5400, 140],
    [2050, 470, 130, 26],   // opstapjes naar de ster
    [2280, 350, 130, 26],
  ],

  bowlingBanen: [
    { x: 900, kegels: 8 },
    { x: 2900, kegels: 10 },
  ],

  achtervolgingen: [
    { spawnX: 3600, triggerX: 3800, endX: 4800, skin: 'bal' },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 1700, y: 600, amount: 1 },
    { x: 3550, y: 600, amount: 1, regen: true }, // vóór de achtervolging
  ],

  grommels: [
    { type: 'stomp', x: 550, y: 612, patrol: [480, 680] },
    { type: 'springer', x: 1770, y: 612, patrol: [1700, 1850] },
    { type: 'werper', x: 2570, y: 612, patrol: [2500, 2650] }, // gooit voetballetjes!
    { type: 'stomp', x: 5000, y: 612, patrol: [4900, 5100] },
  ],

  star: { x: 2350, y: 270 },
  goudenNul: { x: 5150, y: 300 },

  goal: { x: 5300, y: 588, value: 10 },

  reward: {
    title: 'Level 14-2 gehaald! 🏆',
    subtitle: 'Kegels geteld én de reuzen-voetbal verslagen!',
    stars: 3, medal: 'adventure_14_2', medalLabel: 'Kegel-Knaller',
  },
};

export const LEVEL_14_3 = {
  id: '14-3',
  naam: 'Basket-Bergen',

  worldW: 5600,
  worldH: 800,
  killY: 720,
  terrain: 'ballen',
  bg: { top: 0x8fd3ff, bottom: 0x6ab566 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Gooi PRECIES genoeg — en stop op tijd! 🏀',

  // Les 3: PRECIES TELLEN — baskets van 8 en 12 (stop op tijd!), en een
  // stuiterbal-klim naar de hoge richels.
  platforms: [
    [0, 660, 5600, 140],
    [3000, 460, 170, 26],   // klim-richel 1
    [3350, 300, 170, 26],   // klim-richel 2
    [3700, 170, 200, 26],   // de top (ster!)
  ],

  baskets: [
    { x: 1300, doel: 8 },
    { x: 4400, doel: 12 },
  ],

  stuiterBallen: [2800, 3250],

  telWolken: [[2550, 540, 120]],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2400, y: 600, amount: 1 },
    { x: 4200, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'springer', x: 870, y: 612, patrol: [800, 950] },
    { type: 'werper', x: 2070, y: 612, patrol: [2000, 2150] },
    { type: 'vlieger', x: 3400, y: 200, patrol: [3200, 3600] }, // bewaakt de top!
    { type: 'glijder', x: 4000, y: 612, patrol: [3900, 4100] },
    { type: 'stomp', x: 5200, y: 612, patrol: [5100, 5300] },
  ],

  star: { x: 3800, y: 90 },
  goudenNul: { x: 700, y: 300 },

  goal: { x: 5500, y: 588, value: 10 },

  reward: {
    title: 'Level 14-3 gehaald! 🏆',
    subtitle: 'Acht én twaalf — precies geteld, precies gestopt!',
    stars: 3, medal: 'adventure_14_3', medalLabel: 'Basket-Baas',
  },
};

export const LEVEL_14_4 = {
  id: '14-4',
  naam: 'De Tiental-Arena',

  worldW: 6000,
  worldH: 800,
  killY: 720,
  terrain: 'ballen',
  bg: { top: 0x8fd3ff, bottom: 0x60a95c },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'De REKKEN van 10: kijk hoe 30 − 12 eruitziet! 🎳',

  // Les 4: TIENTALLEN — bowlingbanen met rekken van 10 (30 en 60 kegels),
  // een maan-zweefzone ertussen en een portaal-som die 20 maakt.
  platforms: [
    [0, 660, 6000, 140],
  ],

  bowlingBanen: [
    { x: 800, kegels: 30 },
    { x: 3600, kegels: 60 },
  ],

  maanZones: [{ x: 2200, w: 800 }], // het zweef-schot: zweef naar de hoge bonussen

  portalen: [
    { x: 4700, doel: 20, opties: [[10, 10], [15, 10], [12, 6]] },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2600, y: 600, amount: 1 },
    { x: 4500, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'werper', x: 1670, y: 612, patrol: [1600, 1750] },
    { type: 'springer', x: 2070, y: 612, patrol: [2000, 2150] },
    { type: 'glijder', x: 3200, y: 612, patrol: [3100, 3300] },
    { type: 'werper', x: 4370, y: 612, patrol: [4300, 4450] },
    { type: 'stomp', x: 5600, y: 612, patrol: [5500, 5700] },
  ],

  star: { x: 2600, y: 180 },     // hoog in de maan-zone — zweef ernaartoe!
  goudenNul: { x: 2900, y: 140 },

  goal: { x: 5900, y: 588, value: 10 },

  reward: {
    title: 'Level 14-4 gehaald! 🏆',
    subtitle: '60 − 24 = 36 — jij rekent al met rekken van tien!',
    stars: 3, medal: 'adventure_14_4', medalLabel: 'Tiental-Topper',
  },
};

export const LEVEL_14_5 = {
  id: '14-5',
  naam: 'De Kegel-Koning',

  worldW: 5200,
  worldH: 800,
  killY: 720,
  terrain: 'ballen',
  bg: { top: 0x7ec3f0, bottom: 0x559a52 }, // avondwedstrijd — de finale!

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'De Kegel-Koning daagt je uit — reken zijn kegels uit! 👑',
  finale: 'slot', // het állerlaatste level: hierna het Grote Slotfeest!

  // De finale: een aanloop met alle stadion-werkwoorden (stuiterbal, basket,
  // tiental-bowling) en dan de Kegel-Koning: hij kegelt zijn eigen
  // onderdanen om — raak het bord met hoeveel er nog staan. Zijn sommen
  // groeien mee: 10−4 → 30−12 → 60−24.
  platforms: [
    [0, 660, 5200, 140],
    [950, 400, 180, 26],    // ster-richel (via de stuiterbal)
  ],

  stuiterBallen: [900],

  baskets: [
    { x: 1600, doel: 5 },
  ],

  bowlingBanen: [
    { x: 2400, kegels: 20 },
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 2200, y: 600, amount: 1 },
    { x: 3500, y: 600, amount: 1, regen: true }, // snack tussen de bowlingballen
  ],

  grommels: [
    { type: 'stomp', x: 600, y: 612, patrol: [500, 700] },
    { type: 'springer', x: 2070, y: 612, patrol: [2000, 2150] },
    { type: 'werper', x: 3670, y: 612, patrol: [3600, 3750] },
  ],

  boss: {
    x: 4300,
    name: 'De Kegel-Koning',
    look: 'kegel',
    stijl: 'kegel',
    stages: [
      { van: 10, weg: 4, doel: 6, opties: [6, 5, 7] },
      { van: 30, weg: 12, doel: 18, opties: [18, 8, 17] },
      { van: 60, weg: 24, doel: 36, opties: [36, 26, 35] },
    ],
  },

  star: { x: 1030, y: 320 },
  goudenNul: { x: 3400, y: 300 },

  goal: { x: 5050, y: 588, value: 10 },

  reward: {
    title: 'HET STUITER-STADION UITGESPEELD! 🏆⚽',
    subtitle: 'De Kegel-Koning buigt voor jou — op naar het Grote Slotfeest!',
    stars: 5, medal: 'world14_done', medalLabel: 'Stadion-Kampioen',
  },
};

export const WORLD14 = [LEVEL_14_1, LEVEL_14_2, LEVEL_14_3, LEVEL_14_4, LEVEL_14_5];
