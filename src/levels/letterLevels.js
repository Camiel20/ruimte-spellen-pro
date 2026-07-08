// ===== LETTER-LAND — LEVELDATA (rondloop-schrijfwereld) =====
// Wereld 1: "De Praatweide" (3-letterwoorden). Het letter-avontuur hergebruikt
// de hele Getallen-Land-engine (AdventureScene): je loopt, springt en verkent,
// maar de "poorten" zijn SCHRIJF-poorten — schrijf de kleine letter van een
// slapend Alfa-Blok (De Sisser heeft de klank eruit gezogen) en er verschijnt
// een brug. Elke geschreven letter laat ook een stuk "stilte-waas" wegtrekken:
// de kleur keert terug. Het laatste level is de baas: De Sisser zelf.
//
// Eigen sfeer: terrain 'letters' (de Praatweide) + Priet het potlood als maatje.

const GROND = 660;
const SEG = 680;   // grondstuk tussen de kloven
const GAP = 340;   // kloof-breedte (te breed om over te springen → schrijven!)
const BG = { top: 0x9ad7ff, bottom: 0x74c95a };

// Bouw een level uit een woord + extra's (ster, pickups, vijandje, baas).
function maakLevel({ woord, idx, ster, grommels, pickups, sisser, finale, reward, intro }) {
  const chars = [...woord];
  const platforms = [];
  const schrijfPoorten = [];
  let x = 0;

  platforms.push([0, GROND, SEG + 80, 140]); // ruime start-grond
  x = SEG + 80;

  chars.forEach((ch, i) => {
    const gapX = x;
    schrijfPoorten.push({
      letter: ch,
      gapX, gapW: GAP,
      x: gapX - 46,                 // het slapende blok net vóór de kloof
      triggerX: gapX - 160, triggerW: 170,
      kleurIdx: i,
    });
    x = gapX + GAP;
    platforms.push([x, GROND, SEG, 140]);
    x += SEG;
  });

  const worldW = x;
  const L = {
    id: `alfa-${idx + 1}`,
    naam: `Woord: ${woord}`,
    worldW, worldH: 800, killY: 720,
    bg: BG, terrain: 'letters', maatje: 'potlood',
    start: { x: 90, y: 560 },
    intro: intro || `Schrijf het woord: ${woord.toUpperCase()}!`,
    afterGate: 'Ren verder! 🚩',
    platforms,
    schrijfPoorten,
    goal: { x: worldW - 110, y: 588, woord, value: chars.length },
    reward: reward || {
      title: `Je schreef "${woord}"! 🏆`,
      subtitle: 'Alle letters geschreven en het woord gebouwd!',
      stars: 3, medal: `alfa_${woord}`, medalLabel: 'Woord-Bouwer',
    },
  };
  if (ster) { L.star = ster.pos; L.platforms.push(ster.ledge); }
  if (grommels) L.grommels = grommels;
  if (pickups) L.pickups = pickups;
  if (sisser) L.sisser = sisser;
  if (finale) L.finale = finale;
  return L;
}

export const LETTER_LEVELS = [
  // 1 — kennismaking: rustig, geen vijand. Eén verstopte ster op een richel.
  maakLevel({
    woord: 'aap', idx: 0,
    intro: 'De Sisser stal de letters! Schrijf ze terug.',
    ster: { ledge: [1300, 556, 120, 22], pos: { x: 1360, y: 526 } },
    pickups: [{ x: 1250, y: 600, amount: 1 }],
  }),
  // 2 — een eerste Sisser-Grommeltje dat rondwaart.
  maakLevel({
    woord: 'zon', idx: 1,
    ster: { ledge: [2300, 540, 120, 22], pos: { x: 2360, y: 510 } },
    grommels: [{ type: 'stomp', x: 2400, y: 612, patrol: [2180, 2740] }],
    pickups: [{ x: 1250, y: 600, amount: 1 }],
  }),
  // 3
  maakLevel({
    woord: 'vis', idx: 2,
    ster: { ledge: [1300, 540, 120, 22], pos: { x: 1360, y: 510 } },
    grommels: [{ type: 'stomp', x: 1400, y: 612, patrol: [1160, 1740] }],
    pickups: [{ x: 2300, y: 600, amount: 1 }],
  }),
  // 4 — twee grommeltjes op weg naar de baas.
  maakLevel({
    woord: 'bus', idx: 3,
    ster: { ledge: [2300, 536, 120, 22], pos: { x: 2360, y: 506 } },
    grommels: [
      { type: 'stomp', x: 1400, y: 612, patrol: [1160, 1740] },
      { type: 'stomp', x: 2400, y: 612, patrol: [2180, 2740] },
    ],
    pickups: [{ x: 1250, y: 600, amount: 1 }],
  }),
  // 5 — DE BAAS: De Sisser zelf. Schrijf het woord → hij krimpt per letter en
  // wordt aan het eind een vrolijke vriend. Finale-viering.
  maakLevel({
    woord: 'pen', idx: 4,
    intro: 'Daar is De Sisser! Schrijf het woord en geef de klank terug!',
    sisser: { x: 3350 },
    grommels: [{ type: 'stomp', x: 1400, y: 612, patrol: [1160, 1740] }],
    finale: 'letter',
    reward: {
      title: 'Je versloeg De Sisser! 🏆🎉',
      subtitle: 'De Praatweide praat weer — de letters klinken!',
      stars: 5, medal: 'alfa_praatweide', medalLabel: 'Held van de Praatweide',
    },
  }),
];
