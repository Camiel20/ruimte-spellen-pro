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

// De Boom-Grommel (Wereld 3): een boze boom met een kruin tot bovenin het
// scherm — zo zie je vanzelf dat je er niet overheen kunt springen.
// Zelfde contract als drawBoss (bubble/bubbleText/brow/mouth).
export function drawTreeBoss(scene, x, groundY) {
  const c = scene.add.container(x, groundY - 90).setDepth(7);
  const bark = 0x8a5a33, barkEdge = 0x5a3a1e, leaf = 0x3f9d3f, leafDark = 0x2f7d33;
  const g = scene.add.graphics();
  // schaduw + stam + wortels
  g.fillStyle(0x000000, 0.18); g.fillEllipse(0, 92, 120, 20);
  g.fillStyle(bark, 1);
  g.fillRoundedRect(-28, -60, 56, 150, 12);
  g.fillTriangle(-46, 90, -10, 90, -18, 40);
  g.fillTriangle(46, 90, 10, 90, 18, 40);
  g.fillStyle(barkEdge, 0.5); g.fillRoundedRect(-6, -40, 8, 70, 4); // groef
  g.lineStyle(4, barkEdge, 1); g.strokeRoundedRect(-28, -60, 56, 150, 12);
  c.add(g);
  // KRUIN: bladerbollen stapelen tot bovenin (= zichtbare blokkade)
  const foliage = scene.add.graphics();
  foliage.fillStyle(leafDark, 1);
  [[0, -160, 66], [-46, -240, 52], [46, -250, 54], [0, -330, 58], [-34, -410, 46], [30, -440, 48], [0, -500, 44]]
    .forEach(([fx, fy, r]) => foliage.fillCircle(fx, fy, r));
  foliage.fillStyle(leaf, 1);
  [[0, -170, 54], [-40, -248, 42], [42, -258, 44], [0, -338, 48], [-30, -416, 37], [26, -446, 39], [0, -506, 35]]
    .forEach(([fx, fy, r]) => foliage.fillCircle(fx, fy, r));
  c.add(foliage);
  // boos gezicht op de stam
  const eL = scene.add.circle(-12, -26, 10, 0xffffff).setStrokeStyle(3, barkEdge);
  const eR = scene.add.circle(12, -26, 10, 0xffffff).setStrokeStyle(3, barkEdge);
  const pL = scene.add.circle(-12, -23, 4, 0x2c1c0e), pR = scene.add.circle(12, -23, 4, 0x2c1c0e);
  const br = scene.add.graphics(); br.lineStyle(4, barkEdge, 1);
  br.beginPath(); br.moveTo(-24, -42); br.lineTo(-4, -35); br.strokePath();
  br.beginPath(); br.moveTo(24, -42); br.lineTo(4, -35); br.strokePath();
  const m = scene.add.graphics(); m.lineStyle(4, barkEdge, 1); m.beginPath(); m.arc(0, 2, 11, 1.15 * Math.PI, 1.85 * Math.PI); m.strokePath();
  c.add([eL, eR, pL, pR, br, m]);
  c.bodyG = g; c.foliage = foliage; c.brow = br; c.mouth = m; c.eyes = [eL, eR];

  // tekstwolkje naast de stam (de kruin zit erboven)
  const bub = scene.add.container(64, -66);
  const bg = scene.add.graphics(); bg.fillStyle(0xffffff, 1); bg.lineStyle(3, 0x16202b, 1);
  bg.fillRoundedRect(-28, -24, 56, 44, 12); bg.strokeRoundedRect(-28, -24, 56, 44, 12); bg.fillTriangle(-6, 18, 6, 18, 0, 30);
  const wn = scene.add.text(0, -2, '', { fontFamily: 'Arial Black, Arial', fontSize: '30px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
  bub.add([bg, wn]); c.add(bub); c.bubble = bub; c.bubbleText = wn;
  scene.tweens.add({ targets: bub, scale: 1.08, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  // zachtjes wiegen in de wind
  scene.tweens.add({ targets: c, angle: 1.2, duration: 1900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return c;
}

// De verslagen Boom-Grommel wordt lief: lach + roze bloesem in de kruin.
export function happyTreeBoss(scene, c) {
  c.brow.clear();
  c.mouth.clear(); c.mouth.lineStyle(4, 0x5a3a1e, 1); c.mouth.beginPath(); c.mouth.arc(0, -4, 12, 0.12 * Math.PI, 0.88 * Math.PI); c.mouth.strokePath();
  c.foliage.fillStyle(0xffb7d0, 1);
  [[-30, -180, 7], [26, -210, 6], [-48, -280, 7], [40, -300, 6], [-10, -360, 7], [20, -430, 6], [-26, -470, 6], [4, -520, 7]]
    .forEach(([fx, fy, r]) => c.foliage.fillCircle(fx, fy, r));
}

// De Kristal-Grommel (Wereld 4): een boze kristal-reus met torenhoge
// kristal-pieken erachter (= zichtbare blokkade tot bovenin het scherm).
// Zelfde contract als drawBoss (bubble/bubbleText/brow/mouth).
export function drawCrystalBoss(scene, x, groundY) {
  const c = scene.add.container(x, groundY - 80).setDepth(7);
  const paars = 0x9b6dd6, licht = 0xc9aef0, edge = 0x5d3f8c;
  // pieken-muur erachter, tot bovenin het scherm
  const spires = scene.add.graphics();
  spires.fillStyle(edge, 0.85);
  spires.fillTriangle(-44, 80, -8, 80, -26, -520);
  spires.fillTriangle(6, 80, 46, 80, 26, -460);
  spires.fillStyle(paars, 0.9);
  spires.fillTriangle(-36, 80, -14, 80, -25, -480);
  spires.fillTriangle(12, 80, 40, 80, 26, -420);
  spires.fillStyle(licht, 0.8);
  spires.fillTriangle(-28, 80, -22, 80, -25, -440);
  spires.fillTriangle(22, 80, 30, 80, 26, -380);
  c.add(spires);
  // romp: grote kristal (zeshoekig)
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.18); g.fillEllipse(0, 84, 110, 20);
  g.fillStyle(paars, 1);
  g.beginPath();
  g.moveTo(0, -78); g.lineTo(44, -40); g.lineTo(44, 50); g.lineTo(0, 82); g.lineTo(-44, 50); g.lineTo(-44, -40);
  g.closePath(); g.fillPath();
  g.fillStyle(licht, 0.55);
  g.fillTriangle(0, -78, 44, -40, 8, -30);
  g.fillTriangle(-44, -40, -20, -50, -30, 10);
  g.lineStyle(4, edge, 1);
  g.beginPath();
  g.moveTo(0, -78); g.lineTo(44, -40); g.lineTo(44, 50); g.lineTo(0, 82); g.lineTo(-44, 50); g.lineTo(-44, -40);
  g.closePath(); g.strokePath();
  c.add(g);
  // boos gezicht
  const eL = scene.add.circle(-15, -18, 11, 0xffffff).setStrokeStyle(3, edge);
  const eR = scene.add.circle(15, -18, 11, 0xffffff).setStrokeStyle(3, edge);
  const pL = scene.add.circle(-15, -15, 4.5, 0x2c1650), pR = scene.add.circle(15, -15, 4.5, 0x2c1650);
  const br = scene.add.graphics(); br.lineStyle(4.5, edge, 1);
  br.beginPath(); br.moveTo(-28, -36); br.lineTo(-5, -28); br.strokePath();
  br.beginPath(); br.moveTo(28, -36); br.lineTo(5, -28); br.strokePath();
  const m = scene.add.graphics(); m.lineStyle(4, edge, 1); m.beginPath(); m.arc(0, 14, 12, 1.15 * Math.PI, 1.85 * Math.PI); m.strokePath();
  c.add([eL, eR, pL, pR, br, m]);
  c.bodyG = g; c.spires = spires; c.brow = br; c.mouth = m; c.eyes = [eL, eR];

  // tekstwolkje naast de kristal
  const bub = scene.add.container(66, -60);
  const bg = scene.add.graphics(); bg.fillStyle(0xffffff, 1); bg.lineStyle(3, 0x16202b, 1);
  bg.fillRoundedRect(-28, -24, 56, 44, 12); bg.strokeRoundedRect(-28, -24, 56, 44, 12); bg.fillTriangle(-6, 18, 6, 18, 0, 30);
  const wn = scene.add.text(0, -2, '', { fontFamily: 'Arial Black, Arial', fontSize: '30px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
  bub.add([bg, wn]); c.add(bub); c.bubble = bub; c.bubbleText = wn;
  scene.tweens.add({ targets: bub, scale: 1.08, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  // fonkelen + heel licht zweven
  scene.tweens.add({ targets: c, y: c.y - 6, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  scene.tweens.add({ targets: spires, alpha: 0.75, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return c;
}

// De verslagen Kristal-Grommel gaat stralen: lach + regenboog-fonkels.
export function happyCrystalBoss(scene, c) {
  c.brow.clear();
  c.mouth.clear(); c.mouth.lineStyle(4, 0x5d3f8c, 1); c.mouth.beginPath(); c.mouth.arc(0, 8, 13, 0.12 * Math.PI, 0.88 * Math.PI); c.mouth.strokePath();
  const kleuren = [0xf87171, 0xfbbf24, 0x4ade80, 0x60a5fa, 0xec4899];
  c.bodyG.fillStyle(0xffffff, 0.9);
  [[-20, -40], [18, -52], [30, 20], [-32, 30], [4, 60]].forEach(([fx, fy], i) => {
    c.bodyG.fillStyle(kleuren[i % kleuren.length], 0.9);
    c.bodyG.fillCircle(fx, fy, 5);
  });
}

// Tollende kristal-scherf (de aanval van de Kristal-Grommel) — sneller dan
// golf/eikel. Physics/beweging regelt de scene.
export function drawCrystalShard(scene, x, y) {
  const c = scene.add.container(x, y).setDepth(8);
  const shadow = scene.add.graphics();
  shadow.fillStyle(0x000000, 0.14); shadow.fillEllipse(0, 0, 30, 7);
  c.add(shadow);
  const inner = scene.add.container(0, -16);
  const g = scene.add.graphics();
  g.fillStyle(0x9b6dd6, 1);
  g.fillTriangle(0, -16, 13, 0, 0, 16); g.fillTriangle(0, -16, -13, 0, 0, 16);
  g.fillStyle(0xc9aef0, 0.9); g.fillTriangle(0, -12, 8, 0, 0, 12);
  g.lineStyle(2.5, 0x5d3f8c, 1);
  g.beginPath(); g.moveTo(0, -16); g.lineTo(13, 0); g.lineTo(0, 16); g.lineTo(-13, 0); g.closePath(); g.strokePath();
  inner.add(g);
  c.add(inner);
  scene.tweens.add({ targets: inner, angle: -360, duration: 550, repeat: -1 }); // snel tollen
  return c;
}

// Rollende eikel (de aanval van de Boom-Grommel) — zelfde gedrag als het
// golfje, ander uiterlijk. Physics/beweging regelt de scene.
export function drawAcorn(scene, x, y) {
  const c = scene.add.container(x, y).setDepth(8);
  const shadow = scene.add.graphics();
  shadow.fillStyle(0x000000, 0.14); shadow.fillEllipse(0, 0, 30, 7);
  c.add(shadow);
  const inner = scene.add.container(0, -15);
  const g = scene.add.graphics();
  g.fillStyle(0xb07a45, 1); g.fillEllipse(0, 1, 24, 26);
  g.fillStyle(0x6e4a26, 1); g.slice(0, -5, 13, Math.PI, 0, false); g.fillPath();
  g.fillRoundedRect(-2, -19, 4, 7, 2); // steeltje
  g.fillStyle(0xd9a86a, 0.6); g.fillEllipse(-5, 2, 6, 12); // glansje
  inner.add(g);
  c.add(inner);
  scene.tweens.add({ targets: inner, angle: -360, duration: 800, repeat: -1 }); // tollen
  return c;
}

// De Meteoor-Grommel (Wereld 5): een gloeiende ruimterots met een vuurstaart
// tot bovenin het scherm (= zichtbare blokkade). Zelfde contract als drawBoss
// (bubble/bubbleText/brow/mouth).
export function drawMeteorBoss(scene, x, groundY) {
  const c = scene.add.container(x, groundY - 78).setDepth(7);
  const rots = 0x8a6e5a, rotsDonker = 0x5d4636, vuur = 0xf07c1f, vuurLicht = 0xffc14d;
  // vuurstaart-zuil erachter, tot bovenin het scherm
  const spires = scene.add.graphics();
  spires.fillStyle(0xe8402c, 0.75);
  spires.fillTriangle(-40, 70, -4, 70, -22, -520);
  spires.fillTriangle(2, 70, 42, 70, 22, -450);
  spires.fillStyle(vuur, 0.85);
  spires.fillTriangle(-33, 70, -11, 70, -22, -470);
  spires.fillTriangle(9, 70, 36, 70, 22, -400);
  spires.fillStyle(vuurLicht, 0.85);
  spires.fillTriangle(-27, 70, -17, 70, -22, -420);
  spires.fillTriangle(17, 70, 27, 70, 22, -350);
  c.add(spires);
  // romp: grote ronde ruimterots met kraters
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.18); g.fillEllipse(0, 82, 112, 20);
  g.fillStyle(rots, 1); g.fillCircle(0, 0, 62);
  g.fillStyle(lighten(rots, 30), 0.5); g.fillCircle(-18, -20, 30);
  g.fillStyle(rotsDonker, 0.85);
  g.fillEllipse(-26, 18, 20, 14); g.fillEllipse(28, -26, 16, 12); g.fillEllipse(20, 30, 13, 9);
  g.lineStyle(4, rotsDonker, 1); g.strokeCircle(0, 0, 62);
  c.add(g);
  // boos gezicht
  const eL = scene.add.circle(-16, -12, 11, 0xffffff).setStrokeStyle(3, rotsDonker);
  const eR = scene.add.circle(16, -12, 11, 0xffffff).setStrokeStyle(3, rotsDonker);
  const pL = scene.add.circle(-16, -9, 4.5, 0x2c1c0e), pR = scene.add.circle(16, -9, 4.5, 0x2c1c0e);
  const br = scene.add.graphics(); br.lineStyle(4.5, rotsDonker, 1);
  br.beginPath(); br.moveTo(-29, -30); br.lineTo(-6, -22); br.strokePath();
  br.beginPath(); br.moveTo(29, -30); br.lineTo(6, -22); br.strokePath();
  const m = scene.add.graphics(); m.lineStyle(4, rotsDonker, 1); m.beginPath(); m.arc(0, 20, 12, 1.15 * Math.PI, 1.85 * Math.PI); m.strokePath();
  c.add([eL, eR, pL, pR, br, m]);
  c.bodyG = g; c.spires = spires; c.brow = br; c.mouth = m; c.eyes = [eL, eR];

  // tekstwolkje naast de rots
  const bub = scene.add.container(66, -58);
  const bg = scene.add.graphics(); bg.fillStyle(0xffffff, 1); bg.lineStyle(3, 0x16202b, 1);
  bg.fillRoundedRect(-28, -24, 56, 44, 12); bg.strokeRoundedRect(-28, -24, 56, 44, 12); bg.fillTriangle(-6, 18, 6, 18, 0, 30);
  const wn = scene.add.text(0, -2, '', { fontFamily: 'Arial Black, Arial', fontSize: '30px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
  bub.add([bg, wn]); c.add(bub); c.bubble = bub; c.bubbleText = wn;
  scene.tweens.add({ targets: bub, scale: 1.08, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  // gloeien + heel licht zweven
  scene.tweens.add({ targets: c, y: c.y - 7, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  scene.tweens.add({ targets: spires, alpha: 0.7, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return c;
}

// De verslagen Meteoor-Grommel koelt af: het vuur dooft, hij lacht en krijgt
// gele sterretjes op zijn buik — een vriendelijk maantje.
export function happyMeteorBoss(scene, c) {
  c.brow.clear();
  c.mouth.clear(); c.mouth.lineStyle(4, 0x5d4636, 1); c.mouth.beginPath(); c.mouth.arc(0, 14, 13, 0.12 * Math.PI, 0.88 * Math.PI); c.mouth.strokePath();
  scene.tweens.killTweensOf(c.spires);
  scene.tweens.add({ targets: c.spires, alpha: 0, duration: 800 });
  c.bodyG.fillStyle(0xffe16b, 0.95);
  [[-30, -4], [28, 6], [-8, 36], [14, -36]].forEach(([fx, fy]) => {
    c.bodyG.fillTriangle(fx - 5, fy, fx + 5, fy, fx, fy - 7);
    c.bodyG.fillTriangle(fx - 5, fy - 3, fx + 5, fy - 3, fx, fy + 5);
  });
}

// Vlammende vuurbal (de aanval van de Meteoor-Grommel) — het snelste
// projectiel van alle bazen. Physics/beweging regelt de scene.
export function drawFireball(scene, x, y) {
  const c = scene.add.container(x, y).setDepth(8);
  const shadow = scene.add.graphics();
  shadow.fillStyle(0x000000, 0.14); shadow.fillEllipse(0, 0, 30, 7);
  c.add(shadow);
  const inner = scene.add.container(0, -15);
  const trail = scene.add.graphics();
  trail.fillStyle(0xf07c1f, 0.8); trail.fillEllipse(16, 0, 26, 14);
  trail.fillStyle(0xffc14d, 0.8); trail.fillEllipse(10, 0, 16, 9);
  inner.add(trail);
  const g = scene.add.graphics();
  g.fillStyle(0xe8402c, 1); g.fillCircle(0, 0, 13);
  g.fillStyle(0xf07c1f, 1); g.fillCircle(-2, -2, 9);
  g.fillStyle(0xffe16b, 1); g.fillCircle(-3, -3, 5);
  inner.add(g);
  c.add(inner);
  scene.tweens.add({ targets: trail, scaleX: 1.25, alpha: 0.55, duration: 140, yoyo: true, repeat: -1 });
  return c;
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
