// ===== LETTER-LAND · Wereld 1 — MISSIE-DATA =====
// Elke missie is DATA (geen aparte scene-monoliet): grond, richels, hindernissen
// (met een id), spel-plekken (die naar een hindernis wijzen via `doel`, of
// `geheim:true` zijn) en de kracht die je in de missie leert. LetterMissieScene
// leest dit en bouwt de wereld; de woord-magie-effecten zijn een gedeelde
// bibliotheek per hindernis-type. Zo groeit een nieuwe missie/wereld met één
// data-blok mee — geen copy-paste van de engine.
//
// Hindernis-types (= wat een gespeld woord "doet"):
//   ijs    → de zon smelt de ijsmuur (blokkade weg)
//   kloof  → een mat/brug rolt over de kloof
//   braam  → een bel wekt de bewaker → braam-poort opzij
//   rots   → een bal verplettert de rots (blokkade weg)
//   kracht → wek een letter-vriendje → het schenkt z'n KLANK-KRACHT
//   (geheim)→ een geheim woord geeft een ster

export const GROND = 700;
const G = GROND;

export const MISSIES = {
  // ---- M1 "De Grijze Ochtend": leer woord-magie (geen kracht) ----
  m1: {
    naam: 'De Grijze Ochtend', worldW: 2600, startX: 90, vlagX: 2460,
    intro: 'Spel een woord... en het gebeurt!',
    powers: {},
    grond: [[0, 1080], [1400, 1200]],
    richels: [[1470, G - 100, 130], [1610, G - 190, 170]],
    hindernissen: [
      { id: 'ijs', type: 'ijs', x: 660 },
      { id: 'kloof', type: 'kloof', x0: 1080, x1: 1400 },
      { id: 'braam', type: 'braam', x: 2020, slaperX: 1950 },
    ],
    spots: [
      { woord: 'zon', x: 470, y: G - 30, schim: '☀', doel: 'ijs' },
      { woord: 'mat', x: 980, y: G - 30, schim: '▭', doel: 'kloof' },
      { woord: 'sok', x: 1680, y: G - 188, schim: '❔', geheim: true },
      { woord: 'bel', x: 1900, y: G - 30, schim: '🔔', doel: 'braam' },
    ],
    volgende: 'm2',
  },

  // ---- M2 "De Stuiter-heuvel": verdien de B = Botsbal (super-sprong) ----
  // Duidelijk gepoort pad met schermhoge blokkades: wek de B (bel) → smelt/smash
  // de blokkades met bal & zon → vlag. De Botsbal opent bovendien het GEHEIME
  // woord hoog op de heuvel (bok). Zo heeft de kracht een doel én is de missie
  // helder afgebakend (definitief einde).
  m2: {
    naam: 'De Stuiter-heuvel', worldW: 2800, startX: 90, vlagX: 2650,
    intro: 'Wek het B-blokje — dan spring je SUPER hoog!',
    powers: {},
    grond: [[0, 2800]],
    // B-vriend-richel laag (gewone sprong); de bok-richel hoog (alleen met de
    // Botsbal te halen → de kracht poort het geheim).
    richels: [[560, G - 110, 150], [1480, G - 330, 170]],
    hindernissen: [
      { id: 'bvriend', type: 'kracht', x: 620, ledgeY: G - 110, kracht: 'bots', letter: 'b' },
      { id: 'rots', type: 'rots', x: 1360 },
      { id: 'ijs2', type: 'ijs', x: 2060 },
    ],
    spots: [
      { woord: 'bel', x: 430, y: G - 30, schim: '🔔', doel: 'bvriend' },
      { woord: 'bal', x: 1180, y: G - 30, schim: '⚽', doel: 'rots' },
      { woord: 'bok', x: 1560, y: G - 330, schim: '❔', geheim: true },
      { woord: 'zon', x: 1880, y: G - 30, schim: '☀', doel: 'ijs2' },
    ],
    volgende: 'm3',
  },

  // ---- M3 "Het Sisser-ravijn": verdien de S = Sssprint (dash over het ravijn) ----
  // Wek de S (bel) → je rent supersnel en haalt het brede ravijn (te breed voor
  // een gewone sprong). Daarna: smelt het ijs (zon) en laat de vis je over het
  // water dragen (vis). Geheim: sok, hoog op een richel.
  m3: {
    naam: 'Het Sisser-ravijn', worldW: 3200, startX: 90, vlagX: 3100,
    intro: 'Wek de S — dan ren je supersnel over het ravijn!',
    powers: {},
    // grond met TWEE kloven: het sprint-ravijn (dash) en het water (vis-brug)
    grond: [[0, 900], [1240, 930], [2470, 730]],
    richels: [[560, G - 110, 150], [1440, G - 150, 170]],
    hindernissen: [
      { id: 'svriend', type: 'kracht', x: 620, ledgeY: G - 110, kracht: 'sprint', letter: 's' },
      { id: 'ravijn', type: 'sprintkloof', x0: 900, x1: 1240 },   // 340px → alleen met Sssprint
      { id: 'ijs3', type: 'ijs', x: 1850 },
      { id: 'water', type: 'water', x0: 2170, x1: 2470 },          // vis maakt een vis-brug
    ],
    spots: [
      { woord: 'bel', x: 430, y: G - 30, schim: '🔔', doel: 'svriend' },
      { woord: 'sok', x: 1520, y: G - 150, schim: '❔', geheim: true },
      { woord: 'zon', x: 1660, y: G - 30, schim: '☀', doel: 'ijs3' },
      { woord: 'vis', x: 2030, y: G - 30, schim: '🐟', doel: 'water' },
    ],
    volgende: null,
  },
};

// Namen + iconen van de klank-krachten (voor de "nieuwe kracht"-viering).
export const KRACHT_NAAM = {
  bots: 'BOTSBAL — spring SUPER hoog! 🦘',
  sprint: 'SSSPRINT — ren supersnel! 💨',
};
export const KRACHT_ICOON = {
  bots: '🦘',
  sprint: '💨',
};
