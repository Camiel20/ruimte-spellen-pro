// ===== WERELD 11 — BILLENLAND (leveldata) =====
// Adrians eigen wens: een billen-wereld! 🍑 Zacht-roze giechel-land met
// billen-heuvels, zeepbellen en de Stinke-Bil die NIET in bad wil.
// Concept: EVEN & ONEVEN — billen komen in PAREN! Twee werkwoorden:
//   - STUITEREN 🍑 : land op een stuiter-bil → PRRRT! → hoog gelanceerd
//     (hoger dan je zelf springt, en je dubbelsprong laadt opnieuw).
//   - PAREN CHECKEN 💑 : het paren-bord toont een getal mét zijn stipjes in
//     paren — heeft iedereen een maatje (even) of blijft er eentje alleen
//     (oneven)? Kopstoot tegen het goede blok.
//
// REWORK 2026-07-18 (WORLD-REWORK-PLAN): de vijf levels waren clone-achtig
// (bil + paren in élk level; 11-2 ≈ 11-4). Nu heeft ELK level een eigen
// karakter en structuur; de reken-truc (paren-bord) is een HOOGTEPUNT, de
// ruggengraat is actieve beweging. Max één paren-bord-station per level
// (anti-herhaling-rubriek). Elk level hergebruikt ≥1 eerdere klassieker.
//   11-1 Stuiter-Parcours — eiland-hoppen over kloven (bounce-parcours)
//   11-2 Het Paren-Plein  — paren ís de ster (2 borden) + koord + tel-klim
//   11-3 Duw-Vallei       — duw-kisten + koord-oversteek (fysiek)
//   11-4 De Hoge Stuiter-Show — VERTICAAL: stuiter recht omhoog de toren in
//   11-5 De Stinke-Bil    — baas, met een rollende-bal-achtervolging vooraf

export const LEVEL_11_1 = {
  id: '11-1',
  naam: 'Stuiter-Parcours',

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
  intro: 'Spring van eiland naar eiland — PRRRT over de zeep-kloven! 🍑',

  // BEWEGING-EERST: drie zeep-kloven, elk over te steken met een stuiter-bil.
  // Leer de lancering. Een tel-wolken-trapje naar de ster, en helemaal aan
  // het eind één paren-bord als toetje (4 = makkelijk even).
  platforms: [
    [0, 660, 1150, 140],     // eiland 1 (start)
    [1430, 660, 1170, 140],  // eiland 2 (na kloof 1)
    [2880, 660, 1320, 140],  // eiland 3 (paren-bord)
    [4480, 660, 520, 140],   // eiland 4 (finish)
  ],

  water: [
    [1150, 690, 280, 110],   // zeep-kloof 1
    [2600, 690, 280, 110],   // zeep-kloof 2
    [4200, 690, 280, 110],   // zeep-kloof 3
  ],

  bilTrampolines: [
    [1100, 600], // stuiter over kloof 1
    [2540, 600], // stuiter over kloof 2 (Gouden Nul hoog in de boog!)
    [4140, 600], // stuiter over kloof 3
  ],

  telWolken: [[560, 490, 120], [740, 380, 120]], // wolken-trapje naar de ster

  parenBorden: [
    { x: 3700, getal: 4 },  // ⚫⚫ ⚫⚫ — iedereen een maatje!
  ],

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 1600, y: 600, amount: 1 },
    { x: 3450, y: 600, amount: 1, regen: true }, // vóór het paren-bord
  ],

  grommels: [
    { type: 'stomp', x: 400, y: 612, patrol: [300, 600] },
    { type: 'springer', x: 2000, y: 612, patrol: [1900, 2150] },
    { type: 'vlieger', x: 2740, y: 320, patrol: [2620, 2860] }, // boven kloof 2
    { type: 'stomp', x: 3200, y: 612, patrol: [3050, 3400] },
    { type: 'vlieger', x: 4340, y: 320, patrol: [4220, 4460] }, // boven kloof 3
  ],

  star: { x: 800, y: 335 },
  goudenNul: { x: 2560, y: 330 }, // hoog in de stuiter-boog over kloof 2

  goal: { x: 4750, y: 588, value: 4 },

  reward: {
    title: 'Level 11-1 gehaald! 🏆',
    subtitle: 'Van eiland naar eiland gestuiterd — welkom in Billenland!',
    stars: 3, medal: 'adventure_11_1', medalLabel: 'Stuiter-Ster',
  },
};

export const LEVEL_11_2 = {
  id: '11-2',
  naam: 'Het Paren-Plein',

  worldW: 5200,
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

  // PAREN IS DE STER: twee paren-borden (5 oneven → 8 even), een tel-wolken-
  // klim naar de ster, en een koord-brug over het bad-meer. Bewust WEINIG
  // stuiter-billen (die zijn het thema van 11-1/11-4) — hier is de puzzel de ster.
  platforms: [
    [0, 660, 2700, 140],     // plein A (bord 1)
    [3100, 660, 2100, 140],  // plein B (bord 2)
  ],

  water: [[2700, 690, 400, 110]], // het bad-meer (zeepsop!) onder het koord

  koorden: [[2620, 3160, 480]], // koord-brug over het bad-meer

  parenBorden: [
    { x: 1400, getal: 5 },  // ⚫⚫ ⚫⚫ ⚫ — eentje alleen!
    { x: 4200, getal: 8 },  // ⚫⚫ ⚫⚫ ⚫⚫ ⚫⚫ — allemaal paren
  ],

  telWolken: [[520, 500, 110], [700, 400, 110], [880, 300, 110]], // 1-2-3 omhoog

  bilTrampolines: [[4800, 600]], // één fun-bil naar de Gouden Nul

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 1150, y: 600, amount: 1, regen: true }, // vóór bord 1
    { x: 3950, y: 600, amount: 1, regen: true }, // vóór bord 2
  ],

  grommels: [
    { type: 'stomp', x: 600, y: 612, patrol: [500, 800] },
    { type: 'glijder', x: 1900, y: 612, patrol: [1750, 2100] },
    { type: 'vlieger', x: 2900, y: 330, patrol: [2750, 3150] }, // boven het koord
    { type: 'springer', x: 3600, y: 612, patrol: [3500, 3750] },
    { type: 'stomp', x: 4700, y: 612, patrol: [4600, 4850] },
  ],

  star: { x: 920, y: 258 },        // bovenop het tel-wolken-trapje
  goudenNul: { x: 4820, y: 300 },  // hoog boven de fun-bil

  goal: { x: 5050, y: 588, value: 8 },

  reward: {
    title: 'Level 11-2 gehaald! 🏆',
    subtitle: '5 is oneven, 8 is even — jij ziet het zó!',
    stars: 3, medal: 'adventure_11_2', medalLabel: 'Paren-Kenner',
  },
};

export const LEVEL_11_3 = {
  id: '11-3',
  naam: 'Duw-Vallei',

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
  intro: 'Duw de kist onder de richel en klim omhoog! 📦🍑',

  // FYSIEK: duw-kisten als opstapjes (kist onder de richel → klim naar de ster),
  // een koord-oversteek over de vallei, en één paren-bord (9 = lastig, veel
  // stipjes). De duw-kracht + het koord zijn de ruggengraat.
  platforms: [
    [0, 660, 2800, 140],     // vallei-vloer A
    [3200, 660, 2400, 140],  // vallei-vloer B (na de koord-kloof)
    [1500, 470, 180, 26],    // ster-richel — bereikbaar via de duw-kist
  ],

  water: [[2800, 690, 400, 110]], // zeep-kloof onder het koord

  koorden: [[2720, 3260, 480]],   // koord-oversteek over de vallei

  duwKisten: [1450, 3600],        // kist 1 → onder de ster-richel; kist 2 → bonus

  parenBorden: [
    { x: 4400, getal: 9 },  // ⚫⚫ ⚫⚫ ⚫⚫ ⚫⚫ ⚫ — eentje alleen!
  ],

  bilTrampolines: [[900, 600], [4900, 600]], // dodge-bounce + Gouden-Nul-bil

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 1200, y: 600, amount: 1 },        // bij de duw-kist
    { x: 4150, y: 600, amount: 1, regen: true }, // vóór het paren-bord
  ],

  grommels: [
    { type: 'stomp', x: 500, y: 612, patrol: [400, 700] },
    { type: 'werper', x: 2000, y: 612, patrol: [1900, 2150] }, // gooit zeep-klodders!
    { type: 'vlieger', x: 2950, y: 330, patrol: [2800, 3200] }, // boven het koord
    { type: 'springer', x: 3800, y: 612, patrol: [3700, 3950] },
    { type: 'stomp', x: 5250, y: 612, patrol: [5150, 5400] },
  ],

  star: { x: 1580, y: 420 },       // op de richel boven de duw-kist
  goudenNul: { x: 4920, y: 300 },  // hoog boven de Gouden-Nul-bil

  goal: { x: 5450, y: 588, value: 9 },

  reward: {
    title: 'Level 11-3 gehaald! 🏆',
    subtitle: 'Geduwd, geklommen en over het koord — sterke Bouwmeester!',
    stars: 3, medal: 'adventure_11_3', medalLabel: 'Duw-Baas',
  },
};

export const LEVEL_11_4 = {
  id: '11-4',
  naam: 'De Hoge Stuiter-Show',

  worldW: 2400,
  worldH: 1800,
  killY: 1730,
  terrain: 'billen',
  bg: { top: 0x8fd3ff, bottom: 0xeaa89e }, // licht bovenin — klim naar de top!

  start: { x: 90, y: 1560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'Klim de billen-toren in — de stuiter-bil geeft je een zetje! 🍑🗼',

  // VERTICAAL: de hoogste klim van Billenland. Richel voor richel omhoog met
  // je dubbelsprong; twee stuiter-billen onderin geven een flinke ZET omhoog
  // (in een open koker, zodat je niet tegen een richel bonkt). Val je? Dan land
  // je zacht op de onderste vloer (vangnet) en probeer je opnieuw — faal-
  // vriendelijk. Géén paren-bord hier (kan niet op sta-hoogte in een verticaal
  // level) — dit is de beweeg-showcase. NB: de ONDERSTE vloer is platforms[0]
  // (systemen ankeren op de hoofdvloer). Klim-ritme bewezen in 16-4.
  platforms: [
    [0, 1660, 2400, 140],     // de toren-vloer (start + vangnet)
    [1000, 1480, 180, 26],
    [1400, 1330, 180, 26],
    [1800, 1180, 180, 26],
    [2050, 1010, 190, 26],
    [1650, 860, 180, 26],
    [1250, 710, 180, 26],
    [850, 560, 180, 26],
    [1250, 410, 190, 26],
    [1700, 300, 300, 26],     // de top (vlag!)
    [480, 320, 180, 26],      // ster-richel (dubbelsprong vanaf richel 850)
  ],

  bilTrampolines: [
    [900, 1600],   // onderste zetje — open koker omhoog naar de eerste richels
    [2140, 988],   // hoog boostje vanaf richel 2050 (open koker)
  ],

  telWolken: [[420, 1360, 120]], // zacht wolkje als tussenstap

  pickups: [
    { x: 300, y: 1600, amount: 1 },
    { x: 1085, y: 1440, amount: 1 },
    { x: 1730, y: 1140, amount: 1, regen: true },
  ],

  grommels: [
    { type: 'stomp', x: 1500, y: 1612, patrol: [1400, 1600] },
    { type: 'vlieger', x: 1500, y: 900, patrol: [1300, 1700] },
    { type: 'vlieger', x: 1200, y: 480, patrol: [1000, 1400] }, // bewaakt de top!
  ],

  star: { x: 560, y: 260 },        // op de ster-richel
  goudenNul: { x: 940, y: 1200 },  // pak 'm in de stuiter-boog omhoog!

  goal: { x: 1850, y: 228, value: 6 },

  reward: {
    title: 'Level 11-4 gehaald! 🏆',
    subtitle: 'Helemaal naar de top gestuiterd — wat een stuiter-show!',
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
  intro: 'RENNEN voor de reuzen-zeepbal — dan de Stinke-Bil in bad! 🧼💨',

  // BAAS met een gevarieerde aanloop: eerst een rollende reuzen-zeepbal-
  // achtervolging (RENNEN!), dan over het koord, één paren-bord (6) als
  // opwarmer, en dan De Stinke-Bil: vang per fase precies 4, 6 en 8 zeepbellen
  // terug (allemaal PAREN — tel maar na!) en dan móet hij in bad.
  platforms: [
    [0, 660, 2600, 140],     // renbaan (achtervolging)
    [2900, 660, 2300, 140],  // baas-veld (na de koord-kloof)
  ],

  water: [[2600, 690, 300, 110]], // zeep-kloof onder het koord

  koorden: [[2620, 3160, 480]],   // koord-oversteek naar het baas-veld

  achtervolgingen: [
    { spawnX: 300, triggerX: 800, endX: 2400, skin: 'bal' }, // de reuzen-zeepbal rolt!
  ],

  bilTrampolines: [
    [1500, 600], // stuiter over de rollende bal heen (durf-dodge!)
    [3400, 600], // naar de ster
  ],

  parenBorden: [
    { x: 4000, getal: 6 }, // opwarmer: 6 = drie paren
  ],

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 3000, y: 600, amount: 1 },              // na het koord
    { x: 3850, y: 600, amount: 1, regen: true }, // vóór het paren-bord
    { x: 4400, y: 600, amount: 1, regen: true }, // snack vóór de baas
  ],

  grommels: [
    { type: 'vlieger', x: 2900, y: 330, patrol: [2750, 3150] }, // boven het koord
    { type: 'springer', x: 3700, y: 612, patrol: [3600, 3850] },
    { type: 'glijder', x: 4300, y: 612, patrol: [4150, 4450] },
  ],

  boss: {
    x: 4600,
    name: 'De Stinke-Bil',
    look: 'bil',
    stijl: 'vang',
    stages: [
      { doel: 4 }, // 2 paren zeepbellen
      { doel: 6 }, // 3 paren
      { doel: 8 }, // 4 paren — en dan het bad in!
    ],
  },

  star: { x: 3430, y: 320 },       // boven de bil op het baas-veld
  goudenNul: { x: 1500, y: 300 },  // hoog boven de dodge-bil (pak 'm tijdens de ren!)

  goal: { x: 5000, y: 588, value: 10 },

  reward: {
    title: 'BILLENLAND UITGESPEELD! 🏆🍑',
    subtitle: 'De Stinke-Bil zit in bad en het hele land ruikt weer fris!',
    stars: 5, medal: 'world11_done', medalLabel: 'Held van Billenland',
  },
};

export const WORLD11 = [LEVEL_11_1, LEVEL_11_2, LEVEL_11_3, LEVEL_11_4, LEVEL_11_5];
