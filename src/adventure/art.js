// ===== ART-FACTORY: alle numberblock-lijven op één plek =====
// Eén tekenset voor de speler, de bouwblokken en de vriendjes. Voorheen had
// elke plek z'n eigen kopie van "kubus-stapel met gezichtje" — stijlwijzigingen
// (of later: skins/expressies) hoeven nu maar op één plek.
// Puur tekenen: geen physics, geen input — dat blijft in de scene.

import { lighten, darker } from './palette.js';

// Stapel van `value` vierkante cellen met glans, donkere onderrand, naadlijnen
// en een gezichtje op de bovenste cel. Tekent ín `parent` (container),
// gecentreerd rond (0,0). Geeft { top, totalH } terug voor wie eromheen bouwt.
export function drawCubeStack(scene, parent, value, opts) {
  const {
    w, cell, color,
    cellRadius = 8,
    band = Math.max(4, Math.round(cell * 0.16)), // donkere onderrand per cel
    gloss = true, seams = true,
    eyeR = 8, eyeX = 11, pupilR = 3.5, mouthR = 8, mouthW = 3, faceStroke = 2.5,
  } = opts;
  const totalH = value * cell, top = -totalH / 2;

  for (let i = 0; i < value; i++) {
    const ty = totalH / 2 - (i + 1) * cell;
    const g = scene.add.graphics();
    g.fillStyle(color, 1); g.fillRoundedRect(-w / 2, ty, w, cell, cellRadius);
    g.fillStyle(darker(color, 28), 1); g.fillRoundedRect(-w / 2, ty + cell - band, w, band, cellRadius);
    g.fillStyle(color, 1); g.fillRoundedRect(-w / 2, ty, w, cell - band, cellRadius);
    if (gloss) { g.fillStyle(lighten(color, 75), 0.5); g.fillRoundedRect(-w / 2 + w * 0.1, ty + cell * 0.08, w * 0.31, cell * 0.41, 4); }
    g.lineStyle(2.5, darker(color, 55), 0.9); g.strokeRoundedRect(-w / 2, ty, w, cell, cellRadius);
    if (seams && i > 0) { g.lineStyle(2, darker(color, 55), 0.5); g.beginPath(); g.moveTo(-w / 2 + 3, ty); g.lineTo(w / 2 - 3, ty); g.strokePath(); }
    parent.add(g);
  }

  // gezichtje op de bovenste cel
  const faceY = top + cell * 0.5;
  for (const sx of [-eyeX, eyeX]) {
    parent.add(scene.add.circle(sx, faceY - 2, eyeR, 0xffffff).setStrokeStyle(faceStroke, 0x16202b));
    parent.add(scene.add.circle(sx, faceY - 1, pupilR, 0x16202b));
  }
  const m = scene.add.graphics(); m.lineStyle(mouthW, 0x16202b, 1);
  m.beginPath(); m.arc(0, faceY + mouthR, mouthR, 0.15 * Math.PI, 0.85 * Math.PI); m.strokePath();
  parent.add(m);

  return { top, totalH };
}

// Wit cijfer-schijfje (het "hoofdje" boven de stapel).
export function addNumberDisc(scene, parent, value, y, r = 12, fontSize = '15px') {
  parent.add(scene.add.circle(0, y, r, 0xffffff).setStrokeStyle(2.5, 0x16202b));
  parent.add(scene.add.text(0, y, `${value}`, {
    fontFamily: 'Arial Black, Arial', fontSize, fontStyle: 'bold', color: '#16202b',
  }).setOrigin(0.5));
}

// Schoentjes onder de stapel (alleen de speler heeft voetjes).
export function addFeet(scene, parent, color, w, totalH) {
  const feet = scene.add.graphics(); feet.fillStyle(color, 1);
  feet.fillRoundedRect(-w * 0.42, totalH / 2 - 3, w * 0.34, 11, 5);
  feet.fillRoundedRect(w * 0.08, totalH / 2 - 3, w * 0.34, 11, 5);
  parent.add(feet);
}

// Grijs, "uit elkaar gevallen" vriendje dat op redding wacht — met wens-wolkje
// (het doelgetal). c.bubble = het wolkje (voor de wegvlieg-tween bij redding).
export function makeSleepingFriend(scene, x, y, value) {
  const c = scene.add.container(x, y).setDepth(6);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.16); g.fillEllipse(0, 26, 46, 11);
  g.fillStyle(0x9aa0a6, 1); g.fillRoundedRect(-20, -18, 40, 42, 8);
  g.fillStyle(0x7f858c, 1); g.fillRoundedRect(-20, 14, 40, 10, 8);
  g.lineStyle(2.5, 0x565b61, 1); g.strokeRoundedRect(-20, -18, 40, 42, 8);
  // droevige oogjes + zielige mond
  const eL = scene.add.circle(-8, -4, 6, 0xffffff).setStrokeStyle(2, 0x444444);
  const eR = scene.add.circle(8, -4, 6, 0xffffff).setStrokeStyle(2, 0x444444);
  const pL = scene.add.circle(-8, -3, 2.4, 0x333333), pR = scene.add.circle(8, -3, 2.4, 0x333333);
  const m = scene.add.graphics(); m.lineStyle(2, 0x565b61, 1); m.beginPath(); m.arc(0, 12, 6, 1.1 * Math.PI, 1.9 * Math.PI); m.strokePath();
  // wens-wolkje met doelgetal
  const bub = scene.add.container(0, -52);
  const bg = scene.add.graphics();
  bg.fillStyle(0xffffff, 1); bg.lineStyle(3, 0x16202b, 1);
  bg.fillRoundedRect(-22, -20, 44, 34, 10); bg.strokeRoundedRect(-22, -20, 44, 34, 10);
  bg.fillTriangle(-5, 12, 5, 12, 0, 22);
  const wn = scene.add.text(0, -3, `${value}`, { fontFamily: 'Arial Black, Arial', fontSize: '22px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
  bub.add([bg, wn]);
  scene.tweens.add({ targets: bub, scale: 1.08, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  c.add([g, eL, eR, pL, pR, m, bub]);
  c.bubble = bub;
  return c;
}

// Het geredde vriendje: kleur terug + blij gezicht + cijfer-schijfje.
// Vervangt de inhoud van de container (het wolkje is dan al weggetweend).
export function drawAwakeFriendInto(scene, f, value, color) {
  f.removeAll(true);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.16); g.fillEllipse(0, 26, 46, 11);
  g.fillStyle(color, 1); g.fillRoundedRect(-20, -18, 40, 42, 8);
  g.fillStyle(darker(color, 28), 1); g.fillRoundedRect(-20, 14, 40, 10, 8);
  g.fillStyle(lighten(color, 70), 0.5); g.fillRoundedRect(-15, -14, 11, 14, 4);
  g.lineStyle(2.5, darker(color, 50), 1); g.strokeRoundedRect(-20, -18, 40, 42, 8);
  const eL = scene.add.circle(-8, -4, 6, 0xffffff).setStrokeStyle(2, 0x16202b);
  const eR = scene.add.circle(8, -4, 6, 0xffffff).setStrokeStyle(2, 0x16202b);
  const pL = scene.add.circle(-8, -3, 2.6, 0x16202b), pR = scene.add.circle(8, -3, 2.6, 0x16202b);
  const m = scene.add.graphics(); m.lineStyle(2.5, 0x16202b, 1); m.beginPath(); m.arc(0, 4, 6, 0.12 * Math.PI, 0.88 * Math.PI); m.strokePath();
  const disc = scene.add.circle(0, -30, 11, 0xffffff).setStrokeStyle(2.5, 0x16202b);
  const num = scene.add.text(0, -30, `${value}`, { fontFamily: 'Arial Black, Arial', fontSize: '13px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
  f.add([g, eL, eR, pL, pR, m, disc, num]);
}
