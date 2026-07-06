// ===== WERELD 9 — WC-WONDERLAND (leveldata) =====
// Adrians derde wens: een POEP-WERELD hahaha! Vrolijke drollen-heuvels met
// gezichtjes, torens van wc-rollen en een hoop giechels — schattig en gek,
// nooit vies. Concept: SOMMEN KIEZEN (welke pot klopt?) + timing.
// Nieuwe werkwoorden: doorspoel-potten (kies de pot met de juiste som en
// word doorgespoeld!), wc-rol-platforms (het papier rolt af — doorlopen!)
// en stink-wolkjes (de stank tilt je op — sorry, niet sorry).

export const LEVEL_9_1 = {
  id: '9-1',
  naam: 'De Drollen-Heuvels',

  worldW: 3400,
  worldH: 800,
  killY: 720,
  terrain: 'wc',
  bg: { top: 0x8fd3ff, bottom: 0xcfe8b8 }, // frisse lucht → zacht groen

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Welkom in Wc-Wonderland! De stank tilt je OMHOOG! 💩💨',

  // Les 1: stink-wolkjes (zweef-kolommen), de eerste wc-rol, en een
  // "wees 2"-deurtje (splitsen!) op weg naar de vlag.
  platforms: [
    [0, 660, 3400, 140],
    [640, 430, 180, 26],     // richel boven stink-kolom 1
    [1520, 400, 180, 26],    // richel boven stink-kolom 2
    [3140, 380, 220, 26],    // de EIND-RICHEL met de vlag
  ],

  // De kolommen staan nét links van hun richel: je zweeft ernaast omhoog
  // en stuurt er bovenop (er ónder zweven = hoofdstoot — vermeden).
  stinkZones: [
    { x: 530, w: 100 },
    { x: 1400, w: 110 },
    { x: 3020, w: 110 },
  ],

  wcRollen: [
    [1050, 540, 150],        // oefen-rolletje naar een bolletje
    [2650, 550, 140],        // extra rolletje met een bolletje erop
  ],

  // Alleen als je PRECIES 2 bent past het wc-deurtje (tik = splitsen!).
  doors: [
    { x: 2300, doel: 2, topY: 140 },
  ],

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 1050, y: 490, amount: 1 },  // op de wc-rol!
    { x: 1900, y: 600, amount: 1, regen: true },
    { x: 2650, y: 500, amount: 1 },  // op het extra rolletje
  ],

  grommels: [
    { type: 'stomp', x: 900, y: 612, patrol: [800, 1050] },
    { type: 'springer', x: 1950, y: 612, patrol: [1850, 2100] },
    { type: 'vlieger', x: 1250, y: 300, patrol: [1000, 1500] }, // een vliegje!
    { type: 'loerder', x: 2800, y: 632, patrol: [2700, 2950] }, // loert uit z'n pot!
  ],

  // Ster hoog in stink-kolom 2 — laat je optillen!
  star: { x: 1500, y: 280 },

  // GEHEIM: een Gouden Nul boven richel 1.
  goudenNul: { x: 700, y: 320 },

  goal: { x: 3250, y: 308, value: 9 }, // op de eind-richel via de stank!

  reward: {
    title: 'Level 9-1 gehaald! 🏆',
    subtitle: 'Omhoog getild door een stinkwolkje — alleen in Wc-Wonderland!',
    stars: 3, medal: 'adventure_9_1', medalLabel: 'Stink-Zwever',
  },
};

export const LEVEL_9_2 = {
  id: '9-2',
  naam: 'Het Spoel-Station',

  worldW: 3500,
  worldH: 800,
  killY: 720,
  terrain: 'wc',
  bg: { top: 0x8fd3ff, bottom: 0xc2e0f0 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Spring in de pot met de JUISTE som — SPOEEEL! 🚽',

  // Les 2: de doorspoel-potten. Twee brede spoelwater-kloven; alleen de
  // pot met de kloppende som spoelt je naar de overkant. En op de eind-
  // vlakte: een MEER-vraagmuur als laatste proef.
  platforms: [
    [0, 660, 1000, 140],
    [1400, 660, 700, 140],
    [2400, 660, 1100, 140],
  ],

  water: [[1000, 690, 400, 110], [2100, 690, 300, 110]],

  spoelpotten: [
    { x: 540, doel: 7, opties: [[3, 4], [2, 3], [5, 3]], uitX: 1480 },
    { x: 1620, doel: 10, opties: [[5, 5], [4, 5], [6, 5]], uitX: 2480 },
  ],

  vraagMuren: [
    { x: 3100, kies: 'meer', opties: [10, 7] },
  ],

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 1480, y: 600, amount: 1 },
    { x: 2850, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 400, y: 612, patrol: [300, 500] },
    { type: 'springer', x: 2650, y: 612, patrol: [2550, 2800] },
    { type: 'loerder', x: 3280, y: 632, patrol: [3180, 3380] }, // loert uit z'n pot!
  ],

  // Ster hoog boven vallei B — dubbelsprong.
  star: { x: 2000, y: 430 },

  // GEHEIM: een Gouden Nul boven de eerste potten-rij.
  goudenNul: { x: 670, y: 420 },

  goal: { x: 3420, y: 588, value: 10 },

  reward: {
    title: 'Level 9-2 gehaald! 🏆',
    subtitle: '3+4 en 5+5 — jij spoelt alleen door met de goede som!',
    stars: 3, medal: 'adventure_9_2', medalLabel: 'Spoel-Rekenaar',
  },
};

export const LEVEL_9_3 = {
  id: '9-3',
  naam: 'De Wc-Rollen-Ren',

  worldW: 3600,
  worldH: 800,
  killY: 720,
  terrain: 'wc',
  bg: { top: 0x86c8f5, bottom: 0xbcd9a0 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Het papier rolt af — RENNEN over de rollen! 🧻⚡',

  // Les 3: wc-rol-kettingen over het spoelwater. Blijf bewegen: het papier
  // scheurt onder je voeten. Het vliegje bewaakt de oversteek, en op de
  // eind-vlakte vraagt een geef-plaat om 2 blokjes.
  platforms: [
    [0, 660, 700, 140],
    [1450, 660, 550, 140],
    [2450, 660, 1150, 140],
  ],

  water: [[700, 690, 750, 110], [2000, 690, 450, 110]],

  wcRollen: [
    [790, 600, 140],
    [990, 550, 140],
    [1190, 600, 140],
    [1340, 540, 110],
    [2090, 590, 130],
    [2290, 540, 130],
  ],

  stinkZones: [{ x: 1700, w: 110 }],

  // Geef-plaat: geef 2 blokjes om de slagboom te openen (aftrekken!).
  plates: [
    { x: 3100, doel: 2 },
  ],

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 1550, y: 600, amount: 1 },
    { x: 2550, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'vlieger', x: 1050, y: 320, patrol: [750, 1400] }, // boven de rollen!
    { type: 'stomp', x: 1800, y: 612, patrol: [1700, 1950] },
    { type: 'springer', x: 2700, y: 612, patrol: [2600, 2850] },
    { type: 'loerder', x: 3350, y: 632, patrol: [3260, 3480] }, // loert uit z'n pot!
  ],

  // Ster hoog in de stink-kolom op het midden-eiland.
  star: { x: 1755, y: 300 },

  // GEHEIM: een Gouden Nul boven de rollen-ketting.
  goudenNul: { x: 1190, y: 470 },

  goal: { x: 3520, y: 588, value: 8 },

  reward: {
    title: 'Level 9-3 gehaald! 🏆',
    subtitle: 'Sneller dan scheurend wc-papier — wat een ren!',
    stars: 3, medal: 'adventure_9_3', medalLabel: 'Rollen-Renner',
  },
};

export const LEVEL_9_4 = {
  id: '9-4',
  naam: 'Het Grote Doorspoelen',

  worldW: 3600,
  worldH: 800,
  killY: 720,
  terrain: 'wc',
  bg: { top: 0x8fd3ff, bottom: 0xb8d4a8 },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'De meesterproef: spoel dóór met sommen tot 20! 🚽💨',

  // Alles samen: pot-sommen (nu ook met tientallen!), een wc-rol, een
  // stink-klim naar de ster, en een MINDER-vraagmuur als slot.
  platforms: [
    [0, 660, 900, 140],
    [1300, 660, 800, 140],
    [2600, 660, 1000, 140],
    [2860, 400, 160, 26],    // ster-richel boven de stink-kolom
  ],

  water: [[900, 690, 400, 110], [2100, 690, 500, 110]],

  spoelpotten: [
    { x: 440, doel: 12, opties: [[6, 6], [5, 6], [7, 6]], uitX: 1380 },
    { x: 1700, doel: 20, opties: [[10, 10], [10, 5], [10, 9]], uitX: 2680 },
  ],

  wcRollen: [[1480, 560, 130]],

  stinkZones: [{ x: 2740, w: 100 }], // links van de ster-richel (geen hoofdstoot)

  // MINDER-vraagmuur als allerlaatste proef vóór de vlag.
  vraagMuren: [
    { x: 3350, kies: 'minder', opties: [6, 14] },
  ],

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 1480, y: 510, amount: 1 },  // op de wc-rol
    { x: 2750, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 700, y: 612, patrol: [600, 850] },
    { type: 'vlieger', x: 1600, y: 300, patrol: [1350, 1900] },
    { type: 'stomp', x: 1950, y: 612, patrol: [1850, 2080] },
    { type: 'loerder', x: 3180, y: 632, patrol: [3090, 3270] }, // loert uit z'n pot!
  ],

  // Ster op de hoge richel — laat de stank je erheen tillen.
  star: { x: 2930, y: 340 },

  // GEHEIM: een Gouden Nul boven de tweede potten-rij.
  goudenNul: { x: 1830, y: 420 },

  goal: { x: 3520, y: 588, value: 20 }, // de vlag toont TWINTIG!

  reward: {
    title: 'Level 9-4 gehaald! 🏆',
    subtitle: '10+10=20 — jij spoelt zelfs met tientallen door!',
    stars: 3, medal: 'adventure_9_4', medalLabel: 'Meester-Doorspoeler',
  },
};

export const LEVEL_9_5 = {
  id: '9-5',
  naam: 'De Reuzen-Drol',

  worldW: 2000,
  worldH: 800,
  killY: 720,
  terrain: 'wc',
  bg: { top: 0xcfe8b8, bottom: 0x9c8a5a }, // schemerig moeras — spannend!

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'De REUZEN-DROL kan alleen DOORGESPOELD worden — spring in de pot met de goede som! 💩🚽',

  platforms: [
    [0, 660, 2000, 140],
  ],

  pickups: [
    { x: 240, y: 600, amount: 1 },
    { x: 500, y: 600, amount: 1 },
    { x: 760, y: 600, amount: 1 },
    { x: 1020, y: 600, amount: 1 },
  ],

  grommels: [
    { type: 'loerder', x: 520, y: 632, patrol: [400, 700] }, // loert mee uit z'n pot!
    { type: 'stomp', x: 950, y: 612, patrol: [820, 1150] },
  ],

  // HET DOORSPOEL-DUEL (stijl 'spoel'): drie wc-potten met sommen in de
  // arena — spring in de pot die het doel maakt en een waterstraal spettert
  // de Reuzen-Drol nat! Foute pot = teruggeworpen. Ondertussen huppelen de
  // drolletjes op je af. Elke fase: nieuwe sommen, hoger doel.
  boss: {
    x: 1500,
    name: 'Reuzen-Drol',
    look: 'drol',
    stijl: 'spoel',
    stages: [
      { doel: 7, sommen: [[3, 4], [2, 4], [5, 4]] },
      { doel: 9, sommen: [[5, 4], [3, 4], [6, 4]] },
      { doel: 12, sommen: [[6, 6], [5, 6], [10, 4]] },
    ],
  },

  // Verstopte ster boven de arena — tussen de drolletjes door!
  star: { x: 880, y: 440 },

  goal: { x: 1850, y: 588, value: 12 },

  reward: {
    title: 'WERELD 9 UITGESPEELD! 🏆💩',
    subtitle: 'De Reuzen-Drol heeft een strikje — en heel Wc-Wonderland spoelt van blijdschap!',
    stars: 5, medal: 'world9_done', medalLabel: 'Held van Wc-Wonderland',
  },
};

export const WORLD9 = [LEVEL_9_1, LEVEL_9_2, LEVEL_9_3, LEVEL_9_4, LEVEL_9_5];
