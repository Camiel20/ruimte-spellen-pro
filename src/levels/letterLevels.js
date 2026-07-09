// ===== LETTER-LAND — LEVELDATA (rondloop-schrijfwereld) =====
// Wereld 1: "De Praatweide" (3-letterwoorden). Het letter-avontuur hergebruikt
// de HELE Getallen-Land-engine (AdventureScene): je loopt, springt, klimt en
// verkent, maar de "poorten" zijn SCHRIJF-poorten — schrijf de kleine letter
// van een slapend Alfa-Blok (De Sisser heeft de klank eruit gezogen) en er
// verschijnt een brug. Sommige gewekte blokjes schénken je hun kracht
// (dubbelsprong/stampen/duwen). Elke geschreven letter laat ook een stuk
// "stilte-waas" wegtrekken: de kleur keert terug. Het laatste level is de baas:
// De Sisser zelf — een écht meerfasen-gevecht (schrijf zijn gestolen woord
// terug terwijl je z'n stilte-wolkjes ontwijkt).
//
// Norm (zoals Getallen-Land): ~5000-6000px, 4-6 beats per level (schrijf-poorten
// als ruggengraat + verticaliteit, wisselende vijandjes, krachten, een geheim).
// We houden de verticaliteit ON-THEME met de Praatweide: klim-richels + een
// zwem-vijver (de themed launchers zoals saus-geisers horen bij ándere werelden).
// Eigen sfeer: terrain 'letters' (de Praatweide) + Priet het potlood als maatje.

const GROND = 660;
const GAP = 340;   // kloof-breedte (te breed om over te springen → schrijven!)
const BG = { top: 0x9ad7ff, bottom: 0x74c95a };
const YV = GROND - 48; // grond-vijandjes staan hier (voeten op de grond)

// Bouw de grond + schrijf-poorten uit een reeks "beats". Een beat is:
//   ['grond', breedte]                         → een grondstuk op y=GROND
//   ['gat', letter, { gapW?, geeft? }]         → een schrijf-poort (kloof)
// Geeft platforms, poorten, de wereldbreedte én de grond-spans terug (zodat de
// levels hun systemen relatief tov een grondstuk kunnen plaatsen — geen
// handmatig x-gereken, geen overlap-fouten).
function layout(beats) {
  const platforms = [];
  const poorten = [];
  const grond = []; // [x, w] per grondstuk, in volgorde
  let x = 0;
  let ki = 0;
  for (const b of beats) {
    if (b[0] === 'grond') {
      const w = b[1];
      platforms.push([x, GROND, w, 140]);
      grond.push([x, w]);
      x += w;
    } else { // ['gat', letter, opts]
      const opts = b[2] || {};
      const gapW = opts.gapW || GAP;
      const gapX = x;
      const P = {
        letter: b[1], gapX, gapW,
        x: gapX - 46,                       // slapend blok net vóór de kloof
        triggerX: gapX - 170, triggerW: 180,
        kleurIdx: ki++,
      };
      if (opts.geeft) P.geeft = opts.geeft; // dit blok schenkt een kracht
      poorten.push(P);
      x += gapW;
    }
  }
  return { platforms, poorten, W: x, grond };
}

// Gemeenschappelijke velden + specifieke samenvoegen.
function baseLevel(spec) {
  const { woord } = spec;
  return {
    worldH: 800, killY: 720,
    bg: BG, terrain: 'letters', maatje: 'potlood',
    start: { x: 90, y: 560 },
    afterGate: 'Ren verder! 🚩',
    goal: { x: spec.worldW - 110, y: 588, woord, value: [...woord].length },
    reward: {
      title: `Je schreef "${woord}"! 🏆`,
      subtitle: 'Alle letters geschreven en het woord gebouwd!',
      stars: 3, medal: `alfa_${woord}`, medalLabel: 'Woord-Bouwer',
    },
    ...spec,
  };
}

// Handige klim-richel: [x-links, hoogte-boven-grond, breedte].
const richel = (x, h, w = 150) => [x, GROND - h, w, 22];

// ---------- 1 — "aap": kennismaking + je eerste kracht (dubbelsprong) ----------
function levelAap() {
  const { platforms, poorten, W, grond } = layout([
    ['grond', 840],
    ['gat', 'a', { geeft: 'doubleJump' }], // gered blok schenkt de DUBBELSPRONG
    ['grond', 1560],
    ['gat', 'a'],
    ['grond', 1420],
    ['gat', 'p'],
    ['grond', 980],
  ]);
  const g = grond;
  // klim-trapje naar een verstopte ster boven grondstuk 2 (dubbelsprong helpt)
  platforms.push(richel(g[1][0] + 600, 120, 150));
  platforms.push(richel(g[1][0] + 880, 220, 140));
  return baseLevel({
    id: 'alfa-1', naam: 'Woord: aap', woord: 'aap', worldW: W,
    intro: 'De Sisser stal de letters! Schrijf ze terug — dan wordt alles wakker.',
    platforms, schrijfPoorten: poorten,
    star: { x: g[1][0] + 950, y: GROND - 260 },
    grommels: [{ type: 'stomp', x: g[2][0] + 500, y: YV, patrol: [g[2][0] + 220, g[2][0] + 1050] }],
    pickups: [{ x: 520, y: 600, amount: 1 }, { x: g[3][0] + 400, y: 600, amount: 1 }],
  });
}

// ---------- 2 — "zon": klim + stamp-kracht (kratten kapot) + springers ----------
function levelZon() {
  const { platforms, poorten, W, grond } = layout([
    ['grond', 840],
    ['gat', 'z', { geeft: 'stamp' }], // gered blok schenkt STAMPEN
    ['grond', 1560],
    ['gat', 'o'],
    ['grond', 1520],
    ['gat', 'n'],
    ['grond', 940],
  ]);
  const g = grond;
  // klim-richels naar een hoge ster boven grondstuk 2
  platforms.push(richel(g[1][0] + 640, 130, 150));
  platforms.push(richel(g[1][0] + 940, 230, 140));
  return baseLevel({
    id: 'alfa-2', naam: 'Woord: zon', woord: 'zon', worldW: W,
    intro: 'Schrijf ZON — klim naar de ster en STAMP de kratten kapot!',
    startDoubleJump: true,
    platforms, schrijfPoorten: poorten,
    // krattenstapel (op grondstuk 3) om doorheen te STAMPEN naar een pickup
    breakables: [
      [g[2][0] + 700, GROND - 60, 60, 60],
      [g[2][0] + 700, GROND - 120, 60, 60],
    ],
    star: { x: g[1][0] + 1010, y: GROND - 270 },
    grommels: [
      { type: 'springer', x: g[1][0] + 480, y: YV, patrol: [g[1][0] + 260, g[1][0] + 820] },
      { type: 'springer', x: g[2][0] + 300, y: YV, patrol: [g[2][0] + 120, g[2][0] + 600] },
    ],
    pickups: [{ x: 520, y: 600, amount: 1 }, { x: g[2][0] + 700, y: GROND - 30, amount: 1 }],
  });
}

// ---------- 3 — "vis": een zwem-vijver (op-en-neer) + duw-kracht + vliegers ----------
function levelVis() {
  const { platforms, poorten, W, grond } = layout([
    ['grond', 840],
    ['gat', 'v', { geeft: 'duw' }], // gered blok schenkt DUWEN
    ['grond', 1580],
    ['gat', 'i'],
    ['grond', 1520],
    ['gat', 's'],
    ['grond', 980],
  ]);
  const g = grond;
  return baseLevel({
    id: 'alfa-3', naam: 'Woord: vis', woord: 'vis', worldW: W,
    intro: 'Schrijf VIS — zwem omhoog naar de ster en duw de kist naar de richel!',
    startDoubleJump: true,
    platforms, schrijfPoorten: poorten,
    // een echte vijver: water-decor + een zwem-kolom om tik-tik-tik omhoog te gaan
    water: [[g[1][0] + 180, GROND + 8, 620, 120]],
    zwemZones: [{ x: g[1][0] + 980, w: 240 }],
    // duw-kist als opstapje naar een richel met een pickup (duw is net verdiend)
    duwKisten: [g[2][0] + 640],
    star: { x: g[1][0] + 1100, y: GROND - 330 },
    grommels: [
      { type: 'vlieger', x: g[1][0] + 460, y: GROND - 190, patrol: [g[1][0] + 240, g[1][0] + 820] },
      { type: 'glijder', x: g[2][0] + 520, y: YV, patrol: [g[2][0] + 260, g[2][0] + 940] },
    ],
    pickups: [{ x: 520, y: 600, amount: 1 }, { x: g[2][0] + 900, y: GROND - 160, amount: 1 }],
  });
}

// ---------- 4 — "bus": gauntlet met alle krachten + hoge klim ----------
function levelBus() {
  const { platforms, poorten, W, grond } = layout([
    ['grond', 860],
    ['gat', 'b'],
    ['grond', 1640],
    ['gat', 'u'],
    ['grond', 1600],
    ['gat', 's'],
    ['grond', 1020],
  ]);
  const g = grond;
  // een hogere klim (3 richels) naar een goed verstopte ster
  platforms.push(richel(g[1][0] + 560, 120, 140));
  platforms.push(richel(g[1][0] + 820, 220, 140));
  platforms.push(richel(g[1][0] + 1080, 320, 140));
  return baseLevel({
    id: 'alfa-4', naam: 'Woord: bus', woord: 'bus', worldW: W,
    intro: 'Schrijf BUS — klim helemaal naar boven en let op de vijandjes!',
    startDoubleJump: true, startStamp: true, startDuw: true,
    platforms, schrijfPoorten: poorten,
    star: { x: g[1][0] + 1150, y: GROND - 360 },
    grommels: [
      { type: 'glijder', x: g[1][0] + 460, y: YV, patrol: [g[1][0] + 240, g[1][0] + 780] },
      { type: 'springer', x: g[2][0] + 380, y: YV, patrol: [g[2][0] + 180, g[2][0] + 740] },
      { type: 'vlieger', x: g[2][0] + 1150, y: GROND - 210, patrol: [g[2][0] + 950, g[2][0] + 1450] },
    ],
    pickups: [{ x: 520, y: 600, amount: 1 }, { x: g[3][0] + 480, y: 600, amount: 1 }],
  });
}

// ---------- 5 — DE SISSER (baas): schrijf zijn gestolen woord "pen" terug ----------
function levelBaas() {
  // Aanloop-grond (twee stukken met één springbaar gaatje) → de arena.
  const W = 5400;
  const platforms = [
    [0, GROND, 2600, 140],
    [2760, GROND, W - 2760, 140], // springbaar gaatje van 160px
    richel(1180, 120, 150),
    richel(1440, 220, 140),
    richel(3400, 200, 150),
  ];
  return baseLevel({
    id: 'alfa-5', naam: 'De Sisser', woord: 'pen', worldW: W,
    intro: 'Daar is De Sisser! Ontwijk zijn stilte-wolkjes en schrijf zijn woord terug!',
    startDoubleJump: true, startStamp: true, startDuw: true,
    platforms,
    star: { x: 1510, y: GROND - 260 },
    grommels: [
      { type: 'springer', x: 900, y: YV, patrol: [700, 1300] },
      { type: 'glijder', x: 3100, y: YV, patrol: [2900, 3700] },
    ],
    pickups: [{ x: 520, y: 600, amount: 1 }, { x: 2400, y: 600, amount: 1 }],
    boss: {
      x: 4400, name: 'De Sisser', look: 'sisser', stijl: 'sisser', woord: 'pen',
      stages: [{ letter: 'p' }, { letter: 'e' }, { letter: 'n' }],
    },
    finale: 'letter',
    reward: {
      title: 'Je versloeg De Sisser! 🏆🎉',
      subtitle: 'De Praatweide praat weer — de letters klinken!',
      stars: 5, medal: 'alfa_praatweide', medalLabel: 'Held van de Praatweide',
    },
  });
}

export const LETTER_LEVELS = [levelAap(), levelZon(), levelVis(), levelBus(), levelBaas()];
