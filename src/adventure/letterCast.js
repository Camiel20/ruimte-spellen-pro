// ===== LETTER-LAND — de cast (gedeelde teken-functies) =====
// Eén plek voor de figuurtjes van het letter-avontuur, zodat de scene, de
// schrijf-poort, het maatje en de cutscenes exact dezelfde tekeningen delen:
//   - Alfa-Blok   : een letter-blokje (slapend/grijs ↔ wakker/kleurig)
//   - De Sisser    : de villain ("De Grote Stilte") — een grijze mopperkont
//                    met een vinger op de lippen; zuigt de klank uit woorden.
//   - Priet        : het maatje — een potlood dat niet stil te krijgen is.
// Alles zelf-getekend (geen emoji, geen auteursrechtelijke beelden).

import { LOWER_PATHS } from '../glyphs.js';

const DONKER = 0x2b2f3a;

// Teken genormaliseerde letterpaden (0..1) in een vak op graphics g.
function strokePaden(g, paths, ox, oy, sz, lw, color) {
  g.lineStyle(lw, color, 1);
  for (const st of paths) {
    g.beginPath(); g.moveTo(ox + st[0][0] * sz, oy + st[0][1] * sz);
    for (let i = 1; i < st.length; i++) g.lineTo(ox + st[i][0] * sz, oy + st[i][1] * sz);
    g.strokePath();
  }
}

// Een Alfa-Blok: wakker=false → grijs, ogen dicht; wakker=true → felle kleur,
// witte letter, open oogjes. Gecentreerd op (x, y); size = blokgrootte.
export function tekenAlfaBlok(s, x, y, letter, kleur, wakker, size = 62) {
  const c = s.add.container(x, y).setDepth(5);
  const half = size / 2;
  const g = s.add.graphics(); c.add(g);
  g.fillStyle(wakker ? kleur : 0xb8bfc7, 1); g.fillRoundedRect(-half, -half, size, size, 13);
  if (wakker) { g.fillStyle(0xffffff, 0.22); g.fillRoundedRect(-half, -half, size, size * 0.4, 13); }
  g.lineStyle(3.5, DONKER, 1); g.strokeRoundedRect(-half, -half, size, size, 13);
  strokePaden(g, LOWER_PATHS[letter], -half + size * 0.14, -half + size * 0.14, size * 0.72,
    Math.max(4, size * 0.09), wakker ? 0xffffff : 0x8a9199);
  const ey = -size * 0.03;
  if (wakker) {
    g.fillStyle(0xffffff, 1); g.fillCircle(-size * 0.17, ey, size * 0.1); g.fillCircle(size * 0.17, ey, size * 0.1);
    g.fillStyle(DONKER, 1); g.fillCircle(-size * 0.14, ey, size * 0.05); g.fillCircle(size * 0.2, ey, size * 0.05);
  } else {
    g.lineStyle(3, DONKER, 1);
    g.lineBetween(-size * 0.26, ey, -size * 0.08, ey); g.lineBetween(size * 0.08, ey, size * 0.26, ey);
  }
  c._letter = letter; c._kleur = kleur;
  return c;
}

// De Sisser — de villain. Grote grijze mopperkont met een hoge grijze muts en
// een vinger vóór de lippen ("sssst!"). blij=true → bekeerd: paarse strepen +
// lach, vinger omlaag. Gecentreerd op (x, y). Geeft een container terug.
export function tekenSisser(s, x, y, schaal = 1, blij = false) {
  const c = s.add.container(x, y).setScale(schaal);
  const g = s.add.graphics(); c.add(g);
  // schaduw
  g.fillStyle(0x000000, 0.12); g.fillEllipse(0, 74, 74, 14);
  // cape/mantel
  g.fillStyle(0x4a4f55, 1); g.fillTriangle(-30, -30, 30, -30, 46, 74);
  // lijf
  g.fillStyle(0x7d838c, 1); g.fillRoundedRect(-30, -56, 60, 130, 14);
  if (blij) { // bekeerd: vrolijke paarse strepen
    g.fillStyle(0x9b6dd6, 0.85); g.fillRect(-30, -28, 60, 9); g.fillRect(-30, -2, 60, 9); g.fillRect(-30, 24, 60, 9);
  }
  g.lineStyle(3.5, 0x4a4f55, 1); g.strokeRoundedRect(-30, -56, 60, 130, 14);
  // hoge grijze puntmuts (stilte-muts)
  g.fillStyle(0x565b61, 1); g.fillTriangle(-24, -52, 24, -52, 0, -112);
  g.fillStyle(0x6c7178, 1); g.fillRect(-28, -56, 56, 10);
  // ogen + wenkbrauwen
  g.fillStyle(0xffffff, 1); g.fillCircle(-12, -34, 8); g.fillCircle(12, -34, 8);
  g.fillStyle(DONKER, 1); g.fillCircle(-12, -33, 3.4); g.fillCircle(12, -33, 3.4);
  g.lineStyle(3.5, DONKER, 1);
  if (blij) {
    // blije boog-wenkbrauwen + grote lach + vinger omlaag (hij zingt mee!)
    g.beginPath(); g.arc(-12, -44, 7, 1.15 * Math.PI, 1.85 * Math.PI); g.strokePath();
    g.beginPath(); g.arc(12, -44, 7, 1.15 * Math.PI, 1.85 * Math.PI); g.strokePath();
    g.beginPath(); g.arc(0, -18, 11, 0.12 * Math.PI, 0.88 * Math.PI); g.strokePath();
    // muzieknootje
    g.fillStyle(0x9b6dd6, 1); g.fillCircle(24, -60, 4); g.fillRect(27, -76, 2.5, 16);
  } else {
    // boze wenkbrauwen (naar binnen)
    g.lineBetween(-20, -46, -6, -40); g.lineBetween(20, -46, 6, -40);
    // klein gesloten mondje
    g.lineBetween(-6, -14, 6, -14);
    // de shush-vinger: een hand met één vinger recht over de lippen
    g.fillStyle(0xe8d9c4, 1);
    g.fillRoundedRect(-6, -30, 12, 26, 6);   // vinger
    g.fillCircle(0, -4, 9);                   // vuist
    g.lineStyle(2.5, 0xb9a789, 1);
    g.strokeRoundedRect(-6, -30, 12, 26, 6); g.strokeCircle(0, -4, 9);
    // "sssst" belletje
    g.fillStyle(0xffffff, 0.9); g.fillEllipse(30, -46, 30, 18);
    g.fillStyle(0x8a8f96, 1);
  }
  c._graphics = g;
  return c;
}

// Priet het potlood — het maatje. Tekent het "lijf" (gecentreerd op 0,0, ~32px
// hoog) dat de maatje-code laat meezweven/kantelen. Geen container-wrapper hier:
// de aanroeper voegt 'm toe aan zijn eigen volg-container.
export function tekenPotloodLijf(s, lijf) {
  const g = s.add.graphics();
  g.fillStyle(0x000000, 0.1); g.fillEllipse(0, 22, 22, 5);
  // houten punt (onder)
  g.fillStyle(0xe8c9a0, 1); g.fillTriangle(-7, 10, 7, 10, 0, 24);
  g.fillStyle(0x4a4f55, 1); g.fillTriangle(-2.6, 19, 2.6, 19, 0, 24); // grafiet
  // gele body
  g.fillStyle(0xf6c624, 1); g.fillRoundedRect(-7, -14, 14, 25, 3);
  g.lineStyle(2.5, 0xcf9f18, 1); g.strokeRoundedRect(-7, -14, 14, 25, 3);
  // metalen bandje + roze gum
  g.fillStyle(0xbfc4c9, 1); g.fillRect(-7, -18, 14, 5);
  g.fillStyle(0xf2a7b8, 1); g.fillRoundedRect(-7, -24, 14, 8, 3);
  lijf.add(g);
  // gezichtje op de body
  lijf.add(s.add.circle(-4, -3, 3.4, 0xffffff).setStrokeStyle(1.6, DONKER));
  lijf.add(s.add.circle(4, -3, 3.4, 0xffffff).setStrokeStyle(1.6, DONKER));
  lijf.add(s.add.circle(-4, -2.6, 1.5, DONKER));
  lijf.add(s.add.circle(4, -2.6, 1.5, DONKER));
  const m = s.add.graphics(); m.lineStyle(2, DONKER, 1);
  m.beginPath(); m.arc(0, 3, 4, 0.15 * Math.PI, 0.85 * Math.PI); m.strokePath();
  lijf.add(m);
}
