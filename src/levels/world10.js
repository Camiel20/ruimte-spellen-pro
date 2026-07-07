// ===== WERELD 10 — REUZENLAND (leveldata) =====
// Een groene wereld waarin ALLES gigantisch is: reuzenpaddenstoelen, manshoge
// bloemen, kolossale rotsblokken. Concept: GROTER & KLEINER — het fundament
// onder vergelijken en meten. Twee gloednieuwe werkwoorden:
//   - HAPPEN 🍎 : eet een reuzenhap → word een stampende REUS die dwars door
//     reuzenblokken beukt en Grommels platstampt.
//   - KRIMPEN 🫐 : eet een krimpbes → word MUIZEKLEIN en kruip door lage tunnels
//     waar je normaal met je kop tegenaan botst.
// Een maatbloem 🌼 zet je terug op je eigen maat. De maat "meet" je vanzelf via
// de physics (te groot = kop botst), dus geen fout mogelijk — alleen ontdekken.
//
// LEVEL-LENGTE (afspraak 2026-07-06): levels waren te snel klaar (<1 min).
// Vanaf nu: ~5000-6000px breed en 4-6 speel-beats per level.
//
// LET OP tunnel-openingen: 36px laat alleen een MUIZEKLEINE waarde-1 door
// (tiny waarde-2 is al 42px). Daarom liggen groei-bolletjes in tunnel-levels
// altijd NÁ de laatste tunnel — anders moet een kind eerst zelf splitsen.

export const LEVEL_10_1 = {
  id: '10-1',
  naam: 'Klein in Reuzenland',

  worldW: 5000,
  worldH: 800,
  killY: 720,
  terrain: 'reus',
  bg: { top: 0x8fd3ff, bottom: 0x86cf63 }, // zomerlucht → sappig gras

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Hap de grote appel en word een REUS — stamp door de rotsen! 🍎🦣',

  // Les 1: de reuzenhap. Beat voor beat: oefenen met Grommels → appel 1 +
  // rots 1 → ster-richel → appel 2 + DUBBELE rots → vraagmuur → eind-klim.
  platforms: [
    [0, 660, 5000, 140],     // doorlopende groene vlakte (leerlevel: geen kuilen)
    [2150, 440, 220, 26],    // ster-richel halverwege
    [4560, 440, 240, 26],    // de eind-richel met de vlag (dubbelsprong-klim)
  ],

  reuzenhappen: [[1120, 600], [3000, 600]],
  reuzenBlokken: [
    [1550, 360, 90, 300],    // rots 1 (vlak na appel 1)
    [3350, 360, 90, 300],    // dubbele rots na appel 2…
    [3600, 360, 90, 300],    // …BOEM-BOEM achter elkaar!
  ],

  // Kopstoot tegen het goede blok: waar is MEER?
  vraagMuren: [
    { x: 4200, kies: 'meer', opties: [7, 2] },
  ],

  pickups: [
    { x: 320, y: 600, amount: 1 },
    { x: 820, y: 600, amount: 1 },
    { x: 2500, y: 600, amount: 1 },
    { x: 3950, y: 600, amount: 1, regen: true }, // vóór de vraagmuur
  ],

  grommels: [
    { type: 'stomp', x: 700, y: 612, patrol: [600, 950] },
    { type: 'springer', x: 2550, y: 612, patrol: [2450, 2700] },
    { type: 'stomp', x: 3950, y: 612, patrol: [3850, 4080] },
    { type: 'springer', x: 4400, y: 612, patrol: [4320, 4500] }, // onder de eind-richel
  ],

  // Ster op de richel; een Gouden Nul zweeft hoog boven appel 1.
  star: { x: 2260, y: 400 },
  goudenNul: { x: 1120, y: 430 },

  goal: { x: 4680, y: 398, value: 3 },

  reward: {
    title: 'Level 10-1 gehaald! 🏆',
    subtitle: 'Van muisje tot reus — welkom in Reuzenland!',
    stars: 3, medal: 'adventure_10_1', medalLabel: 'Reuzen-Happer',
  },
};

export const LEVEL_10_2 = {
  id: '10-2',
  naam: 'Grote Stappen',

  worldW: 5600,
  worldH: 800,
  killY: 720,
  terrain: 'reus',
  bg: { top: 0x8fd3ff, bottom: 0x7cc85e },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Word groot en BEUK je een weg door Reuzenland! 🦣💥',

  // Les 2: als reus ben je onstuitbaar — maar bij een val in het water ben je
  // je reuzen-maat kwijt (respawn = eigen maat). Zes rotsen, twee riviertjes,
  // een leger Grommels en twee vraagmuren: de reuzen-gauntlet.
  platforms: [
    [0, 660, 1800, 140],     // veld A
    [2000, 660, 1600, 140],  // veld B
    [3800, 660, 1800, 140],  // veld C
  ],

  water: [[1800, 690, 200, 110], [3600, 690, 200, 110]], // riviertjes

  reuzenhappen: [[500, 600], [2400, 600], [4200, 600]],
  reuzenBlokken: [
    [900, 360, 90, 300],
    [1250, 360, 90, 300],
    [2800, 360, 90, 300],
    [3100, 360, 90, 300],
    [4600, 360, 90, 300],
    [4900, 360, 90, 300],
  ],

  vraagMuren: [
    { x: 3400, kies: 'meer', opties: [8, 5] },   // op veld B
    { x: 5350, kies: 'minder', opties: [3, 9] }, // op veld C, vlak voor de vlag
  ],

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 1600, y: 600, amount: 1 },
    { x: 3250, y: 600, amount: 1, regen: true }, // vóór vraagmuur 1
    { x: 5150, y: 600, amount: 1, regen: true }, // vóór vraagmuur 2
  ],

  grommels: [
    { type: 'stomp', x: 700, y: 612, patrol: [600, 800] },
    { type: 'springer', x: 1550, y: 612, patrol: [1450, 1700] },
    { type: 'stomp', x: 2250, y: 612, patrol: [2150, 2350] },
    { type: 'vlieger', x: 2900, y: 280, patrol: [2600, 3300] },
    { type: 'springer', x: 4000, y: 612, patrol: [3900, 4100] },
    { type: 'stomp', x: 5150, y: 612, patrol: [5050, 5250] },
  ],

  // Ster hoog tussen de rotsen van veld B; de Gouden Nul hangt boven het
  // tweede riviertje — grijp 'm midden in de oversteek-sprong!
  star: { x: 2950, y: 300 },
  goudenNul: { x: 3700, y: 480 },

  goal: { x: 5500, y: 588, value: 6 },

  reward: {
    title: 'Level 10-2 gehaald! 🏆',
    subtitle: 'BOEM, BOEM, BOEM — niets houdt een reus tegen!',
    stars: 3, medal: 'adventure_10_2', medalLabel: 'Rots-Beuker',
  },
};

export const LEVEL_10_3 = {
  id: '10-3',
  naam: 'Kruip-Tunnels',

  worldW: 5600,
  worldH: 800,
  killY: 720,
  terrain: 'reus',
  bg: { top: 0x8fd3ff, bottom: 0x8ed36b },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Eet een besje en word MUIZEKLEIN — kruip door de gangetjes! 🫐🐭',

  // Les 3: de krimpbes. Drie lage rots-plafonds (waarvan twee vlak achter
  // elkaar!), tussendoor een maatbloem, een reuzen-rots en op het eind een
  // vraagmuur. Wisselen tussen maten is de hele les.
  platforms: [
    [0, 660, 5600, 140],
    [4650, 430, 220, 26],  // ster-richel na de tunnels
  ],

  krimpbessen: [[850, 600], [2900, 600]],
  lageTunnels: [
    [1150, 624, 320],
    [3200, 624, 300],
    [3800, 624, 300],      // dubbel: blijf nog even klein!
  ],
  maatbloemen: [[1750, 600], [4350, 600]], // terug naar je eigen maat
  reuzenhappen: [[2100, 600]],
  reuzenBlokken: [[2450, 360, 90, 300]],   // word GROOT tussen de tunnels door

  vraagMuren: [
    { x: 5100, kies: 'minder', opties: [4, 8] },
  ],

  pickups: [
    // Pas NÁ de laatste tunnel: groter worden past niet door een gangetje.
    { x: 4450, y: 600, amount: 1 },
    { x: 4900, y: 600, amount: 1, regen: true }, // vóór de vraagmuur
  ],

  grommels: [
    { type: 'stomp', x: 600, y: 612, patrol: [500, 780] },
    { type: 'springer', x: 2700, y: 612, patrol: [2620, 2800] },
    { type: 'stomp', x: 3600, y: 612, patrol: [3540, 3760] }, // tussen tunnel 2 en 3!
    { type: 'springer', x: 5300, y: 612, patrol: [5220, 5450] },
  ],

  // Ster op de richel; een Gouden Nul goed verstopt vlak achter tunnel 3
  // (alleen zichtbaar als je er klein doorheen kruipt).
  star: { x: 4760, y: 390 },
  goudenNul: { x: 4180, y: 600 },

  goal: { x: 5500, y: 588, value: 6 },

  reward: {
    title: 'Level 10-3 gehaald! 🏆',
    subtitle: 'Klein, groot, klein — jij kent élke maat!',
    stars: 3, medal: 'adventure_10_3', medalLabel: 'Tunnel-Kruiper',
  },
};

export const LEVEL_10_4 = {
  id: '10-4',
  naam: 'Groot óf Klein?',

  worldW: 6000,
  worldH: 800,
  killY: 720,
  terrain: 'reus',
  bg: { top: 0x8fd3ff, bottom: 0x79c65a },

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Kies goed: word je GROOT voor de rots, of KLEIN voor de tunnel? 🍎🫐',

  // Les 4: kiezen! Vier stations met steeds BEIDE vruchten: de bes ligt op de
  // GROND (doorlopen = klein), de appel op een RICHEL erboven (springen =
  // groot) — kiezen is zo een fysieke actie, nooit een toevalstreffer. Fout
  // gekozen? Loop terug, het fruit groeit vanzelf terug. Station 4 is de
  // eindproef: rots en tunnel VLAK achter elkaar (snel wisselen!). Plus twee
  // vraagmuren (meer/minder).
  platforms: [
    [0, 660, 6000, 140],
    // appel-richels ruim RECHTS van de bes: zo raakt de sprong óp de richel
    // nooit per ongeluk de bes op de grond (vang-zones overlappen niet)
    [820, 470, 130, 22],   // appel-richel station 1
    [1820, 470, 130, 22],  // appel-richel station 2
    [2620, 470, 130, 22],  // appel-richel station 3
    [4120, 470, 130, 22],  // appel-richel station 4
  ],

  // station 1: tunnel · station 2: rots · station 3: tunnel · station 4: rots+tunnel!
  krimpbessen: [[660, 600], [1660, 600], [2460, 600], [3960, 600]],
  reuzenhappen: [[885, 430], [1885, 430], [2685, 430], [4185, 430]],
  lageTunnels: [
    [1000, 624, 300],
    [2800, 624, 300],
    [4700, 624, 300],
  ],
  reuzenBlokken: [
    [2100, 360, 90, 300],
    [4400, 360, 90, 300],  // …en 230px verder begint de tunnel: wisselen!
  ],

  vraagMuren: [
    { x: 3600, kies: 'meer', opties: [9, 6] },
    { x: 5500, kies: 'minder', opties: [2, 7] },
  ],

  pickups: [
    // pas ná de laatste tunnel (zie tunnel-regel bovenaan dit bestand)
    { x: 5150, y: 600, amount: 1 },
    { x: 5350, y: 600, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 1450, y: 612, patrol: [1350, 1600] },
    { type: 'springer', x: 2350, y: 612, patrol: [2270, 2440] },
    { type: 'vlieger', x: 3300, y: 300, patrol: [3150, 3500] }, // ná tunnel 3 (niet door de rots vliegen)
    { type: 'stomp', x: 3850, y: 612, patrol: [3750, 3940] },
    { type: 'springer', x: 5750, y: 612, patrol: [5650, 5850] },
  ],

  star: { x: 2100, y: 300 }, // hoog boven rots 1
  goudenNul: { x: 5050, y: 600 }, // vlak achter de laatste tunnel

  goal: { x: 5900, y: 588, value: 8 },

  reward: {
    title: 'Level 10-4 gehaald! 🏆',
    subtitle: 'Groot voor de rots, klein voor de tunnel — knap gekozen!',
    stars: 3, medal: 'adventure_10_4', medalLabel: 'Maat-Meester',
  },
};

export const LEVEL_10_5 = {
  id: '10-5',
  naam: 'De Reuzen-Grommel',

  worldW: 5200,
  worldH: 800,
  killY: 720,
  terrain: 'reus',
  bg: { top: 0x8fd3ff, bottom: 0x6fc250 }, // diep groen — de eindproef

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Alle maten nog één keer — en RAM dan de Reuzen-Grommel! 🦣💥',

  // De eindproef: álle werkwoorden van Reuzenland op een rij (happen, smashen,
  // krimpen, kruipen, terug-bloeien) en dan het BEUK-gevecht: de Reuzen-
  // Grommel is 9 groot en gooit keien. Hap de arena-appel, word zelf een reus
  // en ram hem — elke beuk maakt hem een maat kleiner (9 → 6 → 3), en kost
  // jou je reuzenkracht: terug naar de appel, keien ontwijken, wéér beuken!
  platforms: [
    [0, 660, 5200, 140],
    [1850, 440, 220, 26], // ster-richel
  ],

  reuzenhappen: [[1150, 600], [3000, 600], [3560, 600]], // de derde = de arena-appel
  reuzenBlokken: [
    [1500, 360, 90, 300],
    [3300, 360, 90, 300],
  ],
  krimpbessen: [[2250, 600]],
  lageTunnels: [[2450, 624, 300]],
  maatbloemen: [[2850, 600]],

  boss: {
    x: 3900,
    name: 'Reuzen-Grommel',
    look: 'reus',
    stijl: 'beuk',
    stages: [
      { doel: 9 }, // zó groot is hij — beuk hem kleiner!
      { doel: 6 },
      { doel: 3 },
    ],
  },

  pickups: [
    { x: 300, y: 600, amount: 1 },
    { x: 800, y: 600, amount: 1 },
    { x: 3740, y: 600, amount: 1, regen: true }, // snack tussen de rollende keien
  ],

  grommels: [
    { type: 'stomp', x: 700, y: 612, patrol: [600, 850] },
    { type: 'springer', x: 2100, y: 612, patrol: [2020, 2200] },
    { type: 'stomp', x: 3550, y: 612, patrol: [3450, 3680] },
  ],

  star: { x: 1960, y: 400 }, // op de richel
  goudenNul: { x: 3300, y: 300 }, // hoog boven rots 2

  goal: { x: 5000, y: 588, value: 10 },

  reward: {
    title: 'REUZENLAND UITGESPEELD! 🏆🦣',
    subtitle: 'Groot, klein en dapper — heel Reuzenland juicht voor jou!',
    stars: 5, medal: 'world10_done', medalLabel: 'Held van Reuzenland',
  },
};

export const WORLD10 = [LEVEL_10_1, LEVEL_10_2, LEVEL_10_3, LEVEL_10_4, LEVEL_10_5];
