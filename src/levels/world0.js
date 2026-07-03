// ===== DE GEHEIME NUL-WERELD ⭕ =====
// Alleen te openen door Gouden Nullen te vinden (verstopt door alle
// werelden heen). Een dromerige witte vallei die om NUL draait — en de
// vlag toont… 0! Niks is het begin van alles.

export const LEVEL_0_1 = {
  id: '0-1',
  naam: 'De Nul-Vallei',

  worldW: 2400,
  worldH: 800,
  killY: 720,
  bg: { top: 0xeaf6ff, bottom: 0xffffff }, // dromerig wit — de wereld van Nul

  start: { x: 90, y: 560 },
  startDoubleJump: true,
  startStamp: true,
  startDuw: true,
  startMega: true,
  intro: 'De geheime Nul-Vallei! Alles begint bij nul… ⭕',

  platforms: [
    [0, 660, 900, 140],
    [1260, 660, 1140, 140],
  ],

  // Zweef-wolken over het wolkenravijn (Nul houdt van zweven).
  telWolken: [
    [950, 640, 130, 0],
    [1110, 640, 130, 1700],
  ],

  pickups: [
    { x: 250, y: 600, amount: 1 },
    { x: 420, y: 600, amount: 1 },
    { x: 700, y: 600, amount: 1, regen: true },
    { x: 1400, y: 600, amount: 1 },
    { x: 1650, y: 600, amount: 1 },
  ],

  // Wees 2 — het kleinste deur-getal van het spel (Nul houdt van klein).
  doors: [
    { x: 620, doel: 2, topY: 120 },
  ],

  grommels: [
    { type: 'springer', x: 1500, y: 612, patrol: [1400, 1650] },
    { type: 'vlieger', x: 1900, y: 420, patrol: [1700, 2100] },
  ],

  star: { x: 1750, y: 430 },

  goal: { x: 2320, y: 588, value: 0 }, // DE VLAG TOONT NUL!

  reward: {
    title: 'DE NUL-VALLEI IS VAN JOU! ⭕🎉',
    subtitle: 'Nul is het begin van alles — net als jij en je beste maatje!',
    stars: 5, medal: 'nul_wereld', medalLabel: 'Nul-Vriend',
  },
};

export const WORLD0 = [LEVEL_0_1];
