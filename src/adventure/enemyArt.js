// ===== VIJAND-ART: Grommels, bazen en hun effecten =====
// Alleen tekenen (containers/graphics/tweens); gedrag (patrouille, botsingen,
// fasen, golf-physics) blijft in de scene.

import { sig, lighten, darker } from './palette.js';

// Het grijze Grommel-lijfje (tekent ín de art-container van makeGrommel).
export function drawGrommelArt(scene, art) {
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.16); g.fillEllipse(0, 20, 34, 9);
  g.fillStyle(0x8a8f96, 1); g.fillRoundedRect(-16, -14, 32, 30, 8);
  g.fillStyle(0x6c7178, 1); g.fillRoundedRect(-16, 8, 32, 8, 8);
  g.fillStyle(lighten(0x8a8f96, 40), 0.5); g.fillRoundedRect(-12, -10, 9, 10, 4);
  g.lineStyle(2.5, 0x4a4f55, 1); g.strokeRoundedRect(-16, -14, 32, 30, 8);
  const eL = scene.add.circle(-6, -3, 5, 0xffffff).setStrokeStyle(2, 0x333333);
  const eR = scene.add.circle(6, -3, 5, 0xffffff).setStrokeStyle(2, 0x333333);
  const pL = scene.add.circle(-6, -2, 2.2, 0x222222), pR = scene.add.circle(6, -2, 2.2, 0x222222);
  const mouth = scene.add.graphics(); mouth.lineStyle(2, 0x3a3f45, 1);
  mouth.beginPath(); mouth.arc(0, 10, 5, 1.15 * Math.PI, 1.85 * Math.PI); mouth.strokePath();
  art.add([g, eL, eR, pL, pR, mouth]);
}

// Teruggekleurde (vriendelijke) Grommel na een stamp.
export function recolorGrommelArt(scene, art, col) {
  art.removeAll(true);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.16); g.fillEllipse(0, 20, 34, 9);
  g.fillStyle(col, 1); g.fillRoundedRect(-16, -14, 32, 30, 8);
  g.fillStyle(darker(col, 28), 1); g.fillRoundedRect(-16, 8, 32, 8, 8);
  g.lineStyle(2.5, darker(col, 50), 1); g.strokeRoundedRect(-16, -14, 32, 30, 8);
  const eL = scene.add.circle(-6, -3, 5, 0xffffff).setStrokeStyle(2, 0x16202b);
  const eR = scene.add.circle(6, -3, 5, 0xffffff).setStrokeStyle(2, 0x16202b);
  const pL = scene.add.circle(-6, -2, 2.4, 0x16202b), pR = scene.add.circle(6, -2, 2.4, 0x16202b);
  const m = scene.add.graphics(); m.lineStyle(2, 0x16202b, 1); m.beginPath(); m.arc(0, 4, 5, 0.15 * Math.PI, 0.85 * Math.PI); m.strokePath();
  art.add([g, eL, eR, pL, pR, m]);
}

// De klassieke grijze Grommel-BAAS (Wereld 1).
export function drawBoss(scene, x, groundY) {
  const c = scene.add.container(x, groundY - 70).setDepth(7);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.18); g.fillEllipse(0, 74, 96, 20);
  g.fillStyle(0x8a8f96, 1); g.fillRoundedRect(-46, -70, 92, 144, 14);
  g.fillStyle(0x6c7178, 1); g.fillRoundedRect(-46, 44, 92, 22, 14);
  g.fillStyle(lighten(0x8a8f96, 30), 0.4); g.fillRoundedRect(-38, -60, 26, 44, 8);
  g.lineStyle(4, 0x4a4f55, 1); g.strokeRoundedRect(-46, -70, 92, 144, 14);
  const eL = scene.add.circle(-17, -30, 13, 0xffffff).setStrokeStyle(3, 0x333333);
  const eR = scene.add.circle(17, -30, 13, 0xffffff).setStrokeStyle(3, 0x333333);
  const pL = scene.add.circle(-17, -27, 5, 0x222222), pR = scene.add.circle(17, -27, 5, 0x222222);
  const br = scene.add.graphics(); br.lineStyle(4, 0x3a3f45, 1);
  br.beginPath(); br.moveTo(-30, -48); br.lineTo(-7, -39); br.strokePath();
  br.beginPath(); br.moveTo(30, -48); br.lineTo(7, -39); br.strokePath();
  const m = scene.add.graphics(); m.lineStyle(3, 0x3a3f45, 1); m.beginPath(); m.arc(0, 12, 14, 1.15 * Math.PI, 1.85 * Math.PI); m.strokePath();
  c.add([g, eL, eR, pL, pR, br, m]);
  c.bodyG = g; c.brow = br; c.mouth = m; c.eyes = [eL, eR];

  const bub = scene.add.container(0, -108);
  const bg = scene.add.graphics(); bg.fillStyle(0xffffff, 1); bg.lineStyle(3, 0x16202b, 1);
  bg.fillRoundedRect(-28, -24, 56, 44, 12); bg.strokeRoundedRect(-28, -24, 56, 44, 12); bg.fillTriangle(-6, 18, 6, 18, 0, 30);
  const wn = scene.add.text(0, -2, '', { fontFamily: 'Arial Black, Arial', fontSize: '30px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
  bub.add([bg, wn]); c.add(bub); c.bubble = bub; c.bubbleText = wn;
  scene.tweens.add({ targets: bub, scale: 1.08, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  scene.tweens.add({ targets: c, y: c.y - 6, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return c;
}

// De verslagen W1-baas kleurt bij en lacht.
export function recolorBossHappy(scene, c, col) {
  c.bodyG.clear();
  c.bodyG.fillStyle(0x000000, 0.18); c.bodyG.fillEllipse(0, 74, 96, 20);
  c.bodyG.fillStyle(col, 1); c.bodyG.fillRoundedRect(-46, -70, 92, 144, 14);
  c.bodyG.fillStyle(darker(col, 28), 1); c.bodyG.fillRoundedRect(-46, 44, 92, 22, 14);
  c.bodyG.fillStyle(lighten(col, 70), 0.5); c.bodyG.fillRoundedRect(-38, -60, 26, 44, 8);
  c.bodyG.lineStyle(4, darker(col, 50), 1); c.bodyG.strokeRoundedRect(-46, -70, 92, 144, 14);
  c.brow.clear();
  c.mouth.clear(); c.mouth.lineStyle(4, 0x16202b, 1); c.mouth.beginPath(); c.mouth.arc(0, 6, 15, 0.12 * Math.PI, 0.88 * Math.PI); c.mouth.strokePath();
}

// De Golf-Baas (Wereld 2): een grote blauwe golf met schuimkuif en boze
// oogjes. Zelfde contract als drawBoss (bubble/bubbleText/brow/mouth).
export function drawWaveBoss(scene, x, groundY) {
  const c = scene.add.container(x, groundY - 70).setDepth(7);
  const deep = 0x1f7fc4, mid = 0x2e9adf, edge = 0x176b9e;
  const g = scene.add.graphics();
  // schaduw
  g.fillStyle(0x000000, 0.18); g.fillEllipse(0, 74, 112, 20);
  // romp: hoge golf, bovenkant rond, krul naar links (de kant van de speler)
  g.fillStyle(mid, 1); g.fillRoundedRect(-52, -78, 104, 152, { tl: 46, tr: 52, bl: 10, br: 10 });
  g.fillCircle(-48, -58, 18); // overhangende krul
  // donkere onderrand (diep water)
  g.fillStyle(deep, 1); g.fillRoundedRect(-52, 46, 104, 28, { tl: 0, tr: 0, bl: 10, br: 10 });
  // licht-strepen: golvend water
  g.fillStyle(lighten(mid, 55), 0.55);
  g.fillRoundedRect(-38, -50, 30, 9, 4); g.fillRoundedRect(-4, -28, 34, 8, 4); g.fillRoundedRect(-34, -4, 26, 8, 4);
  g.lineStyle(4, edge, 1); g.strokeRoundedRect(-52, -78, 104, 152, { tl: 46, tr: 52, bl: 10, br: 10 });
  // schuimkuif over de top + spetters
  const foam = scene.add.graphics();
  foam.fillStyle(0xeafaff, 1);
  [[-44, -64, 13], [-24, -78, 15], [0, -84, 16], [24, -78, 14], [44, -64, 12], [-56, -46, 9], [-62, -32, 7]]
    .forEach(([fx, fy, r]) => foam.fillCircle(fx, fy, r));
  foam.fillStyle(0xbfe8ff, 0.9); foam.fillCircle(-66, -14, 4); foam.fillCircle(60, -40, 4); foam.fillCircle(54, -10, 3);
  // boos gezicht
  const eL = scene.add.circle(-16, -26, 12, 0xffffff).setStrokeStyle(3, edge);
  const eR = scene.add.circle(16, -26, 12, 0xffffff).setStrokeStyle(3, edge);
  const pL = scene.add.circle(-16, -23, 5, 0x123246), pR = scene.add.circle(16, -23, 5, 0x123246);
  const br = scene.add.graphics(); br.lineStyle(5, edge, 1);
  br.beginPath(); br.moveTo(-30, -46); br.lineTo(-6, -38); br.strokePath();
  br.beginPath(); br.moveTo(30, -46); br.lineTo(6, -38); br.strokePath();
  const m = scene.add.graphics(); m.lineStyle(4, edge, 1); m.beginPath(); m.arc(0, 10, 13, 1.15 * Math.PI, 1.85 * Math.PI); m.strokePath();
  c.add([g, foam, eL, eR, pL, pR, br, m]);
  c.bodyG = g; c.foam = foam; c.brow = br; c.mouth = m; c.eyes = [eL, eR];

  // tekstwolkje met het doelgetal (iets hoger: de kuif is hoog)
  const bub = scene.add.container(0, -124);
  const bg = scene.add.graphics(); bg.fillStyle(0xffffff, 1); bg.lineStyle(3, 0x16202b, 1);
  bg.fillRoundedRect(-28, -24, 56, 44, 12); bg.strokeRoundedRect(-28, -24, 56, 44, 12); bg.fillTriangle(-6, 18, 6, 18, 0, 30);
  const wn = scene.add.text(0, -2, '', { fontFamily: 'Arial Black, Arial', fontSize: '30px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
  bub.add([bg, wn]); c.add(bub); c.bubble = bub; c.bubbleText = wn;
  scene.tweens.add({ targets: bub, scale: 1.08, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  // deinen als de zee + glinsterend schuim
  scene.tweens.add({ targets: c, y: c.y - 9, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  scene.tweens.add({ targets: c, angle: 2, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  scene.tweens.add({ targets: foam, alpha: 0.75, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return c;
}

// Doorschijnende zuil van opspattend water boven de Golf-Baas: maakt
// zichtbaar dat je er niet overheen kunt springen (de blokkade is schermhoog).
export function drawSprayWall(scene, x, groundTop) {
  const g = scene.add.graphics().setDepth(6);
  const topY = 46, h = (groundTop - 128) - topY;
  g.fillStyle(0x8fd3f2, 0.22); g.fillRoundedRect(x - 30, topY, 60, h + 24, 26);
  g.fillStyle(0xbfe8ff, 0.35);
  for (let yy = topY + 18; yy < topY + h; yy += 44) g.fillCircle(x - 12 + (Math.floor(yy / 44) % 2) * 24, yy, 7);
  g.fillStyle(0xeafaff, 0.5);
  for (let yy = topY + 36; yy < topY + h; yy += 62) g.fillCircle(x + 8 - (Math.floor(yy / 62) % 2) * 20, yy, 4);
  scene.tweens.add({ targets: g, alpha: 0.6, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return g;
}

// Klein rollend golfje (de aanval van de Golf-Baas) — alleen het uiterlijk;
// physics/beweging regelt de scene.
export function drawWaveMinion(scene, x, y) {
  const c = scene.add.container(x, y).setDepth(8);
  const g = scene.add.graphics();
  g.fillStyle(0x2e9adf, 1); g.fillRoundedRect(-24, -30, 48, 32, { tl: 20, tr: 20, bl: 4, br: 4 });
  g.fillStyle(0x1f7fc4, 1); g.fillRoundedRect(-24, -8, 48, 10, { tl: 0, tr: 0, bl: 4, br: 4 });
  g.fillStyle(0xeafaff, 1); g.fillCircle(-14, -28, 8); g.fillCircle(0, -32, 9); g.fillCircle(14, -28, 8);
  g.fillStyle(lighten(0x2e9adf, 55), 0.6); g.fillRoundedRect(-14, -20, 18, 6, 3);
  c.add(g);
  return c;
}
