// ===== DE GEHEIME NUL-WERELD ⭕ =====
// Alleen te openen door Gouden Nullen te vinden (verstopt door alle
// werelden heen). En dan is het ook echt FEEST: een dromerige vallei vol
// zwevende gouden nullen om te vangen (vuurwerk bij elk tiental!),
// reuzen-nul-ringen die je de lucht in lanceren, en een grote nul-regen
// als je ze alle 30 hebt. Geen enkel gevaar — dit is de beloning.

export const LEVEL_0_1 = {
  id: '0-1',
  naam: 'Het Nul-Feest',

  worldW: 3000,
  worldH: 800,
  killY: 720,
  bg: { top: 0xeaf6ff, bottom: 0xfff6dd }, // dromerig wit met een gouden gloed

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'FEEST! Vang alle 30 gouden nullen — spring door de ringen! ⭕🎉',

  platforms: [
    [0, 660, 1050, 140],
    [1350, 660, 900, 140],
    [2400, 660, 600, 140],
  ],

  // Zweef-wolken over het eerste ravijn (Nul houdt van zweven).
  telWolken: [
    [1080, 640, 120, 0],
    [1220, 640, 120, 1500],
  ],

  nulFeest: {
    // 30 gouden nullen: rijen op de grond + bogen hoog boven de ringen.
    nullen: [
      // vallei 1 — grond
      [200, 600], [350, 600], [500, 600], [650, 600], [800, 600], [950, 600],
      // boog boven ring 1
      [300, 300], [350, 220], [400, 300],
      // boog boven ring 2
      [650, 240], [700, 160], [750, 240],
      // op het zweef-wolken-pad
      [1090, 560], [1230, 560],
      // vallei 2 — grond
      [1400, 600], [1560, 600], [1720, 600], [1880, 600], [2040, 600], [2200, 600],
      // boog boven ring 3
      [1450, 280], [1500, 200], [1550, 280],
      // boog boven ring 4
      [1850, 220], [1900, 140], [1950, 220],
      // finale-vallei
      [2450, 600], [2550, 600], [2650, 600], [2750, 600],
    ],
    // reuzen-nul-ringen: spring erin en je vliegt juichend omhoog
    ringen: [
      [350, 480], [700, 400], [1500, 460], [1900, 380], [2600, 440],
    ],
  },

  pickups: [
    { x: 250, y: 600, amount: 1, regen: true },
    { x: 1650, y: 600, amount: 1 },
  ],

  // GEEN grommels — dit is de feest-wereld, hier kan niets mis gaan.

  star: { x: 1900, y: 70 }, // hoog boven ring 4: dubbele ring-lancering!

  goal: { x: 2920, y: 588, value: 0 }, // DE VLAG TOONT NUL!

  reward: {
    title: 'HET NUL-FEEST IS VAN JOU! ⭕🎉',
    subtitle: 'Nul is het begin van alles — net als jij en je beste maatje!',
    stars: 5, medal: 'nul_wereld', medalLabel: 'Nul-Vriend',
  },
};

export const WORLD0 = [LEVEL_0_1];
