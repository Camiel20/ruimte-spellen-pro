// ===== VIJAND-ART: Grommels, bazen en hun effecten =====
// Alleen tekenen (containers/graphics/tweens); gedrag (patrouille, botsingen,
// fasen, golf-physics) blijft in de scene.

import { sig, lighten, darker } from './palette.js';
import { tekenSisser } from './letterCast.js';
import { drawSok } from './sokken.js';

// Het grijze Grommel-lijfje (tekent ín de art-container van makeGrommel).
// type 'springer' = FELORANJE springveren + gele pet (onmiskenbaar: die gaat
// huppen!); type 'vlieger' = witte vleugeltjes en geen schaduwpootjes.
export function drawGrommelArt(scene, art, type) {
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.16); g.fillEllipse(0, type === 'vlieger' ? 26 : 20, 34, 9);
  if (type === 'springer') {
    // grote feloranje springveren onder het lijfje — zichtbaar van veraf
    g.lineStyle(4, 0xf07c1f, 1);
    for (const sx of [-9, 9]) {
      g.beginPath(); g.moveTo(sx, 14); g.lineTo(sx - 5, 18); g.lineTo(sx + 5, 22); g.lineTo(sx - 4, 26); g.strokePath();
    }
  }
  if (type === 'vlieger') {
    // witte vleugeltjes (de flap-tween zit in makeGrommel)
    g.fillStyle(0xf4f8fc, 0.95);
    g.fillEllipse(-22, -6, 18, 10); g.fillEllipse(22, -6, 18, 10);
    g.lineStyle(2, 0x9aa0a6, 1); g.strokeEllipse(-22, -6, 18, 10); g.strokeEllipse(22, -6, 18, 10);
  }
  g.fillStyle(0x8a8f96, 1); g.fillRoundedRect(-16, -14, 32, 30, 8);
  g.fillStyle(0x6c7178, 1); g.fillRoundedRect(-16, 8, 32, 8, 8);
  g.fillStyle(lighten(0x8a8f96, 40), 0.5); g.fillRoundedRect(-12, -10, 9, 10, 4);
  g.lineStyle(2.5, 0x4a4f55, 1); g.strokeRoundedRect(-16, -14, 32, 30, 8);
  if (type === 'springer') {
    // geel petje met propellertje — het huppel-uniform
    g.fillStyle(0xf6c624, 1); g.slice(0, -13, 11, Math.PI, 0, false); g.fillPath();
    g.fillStyle(0xe8402c, 1); g.fillCircle(0, -22, 3.5);
    g.lineStyle(2, 0xb98d12, 1); g.beginPath(); g.moveTo(0, -19); g.lineTo(0, -14); g.strokePath();
  }
  if (type === 'werper') {
    // witte koksmuts + een tomaat in het handje — de Tomaten-Werper (W7)
    g.fillStyle(0xf5f9fc, 1); g.fillRoundedRect(-9, -26, 18, 13, 5);
    g.fillCircle(-7, -25, 6); g.fillCircle(0, -28, 7); g.fillCircle(7, -25, 6);
    g.lineStyle(2, 0xc9d2da, 1); g.strokeRoundedRect(-9, -26, 18, 13, 5);
    g.fillStyle(0xe8402c, 1); g.fillCircle(20, 2, 7);        // de tomaat!
    g.fillStyle(0x57b947, 1); g.fillEllipse(21, -4, 8, 4);
  }
  if (type === 'glijder') {
    // een boter-slee onder de voetjes + skibrilletje — de Boter-Glijder (W8)
    g.fillStyle(0xffe16b, 1); g.fillRoundedRect(-20, 14, 40, 10, 5);
    g.fillStyle(0xfff3b0, 1); g.fillRoundedRect(-20, 14, 40, 4, 3);
    g.lineStyle(2, 0xb98d12, 1); g.strokeRoundedRect(-20, 14, 40, 10, 5);
    g.fillStyle(0x38b6cf, 0.4); g.fillRoundedRect(-13, -8, 26, 9, 4); // brilletje
    g.lineStyle(2, 0x2a7a94, 1); g.strokeRoundedRect(-13, -8, 26, 9, 4);
  }
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

// De verslagen Golf-Baas wordt een vriendelijk golfje: blije mond en hij
// zakt langzaam in tot een klein deinend golfje naast het pad.
export function happyWaveBoss(scene, c) {
  c.brow.clear();
  c.mouth.clear(); c.mouth.lineStyle(4, 0x176b9e, 1); c.mouth.beginPath(); c.mouth.arc(0, 2, 15, 0.12 * Math.PI, 0.88 * Math.PI); c.mouth.strokePath();
  scene.tweens.add({ targets: c, scale: 0.45, y: c.y + 46, delay: 2100, duration: 900, ease: 'Sine.inOut' });
  // de waterzuil zakt in — de weg is vrij
  if (c.sprayWall) {
    scene.tweens.killTweensOf(c.sprayWall);
    scene.tweens.add({ targets: c.sprayWall, alpha: 0, duration: 700, onComplete: () => c.sprayWall.destroy() });
  }
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

// BARON GRAUW zelf (de finale, Wereld 6): een lange grijze heer met hoge
// hoed, monocle en cape, zwevend op een grauwe wolk — met een onweerszuil
// tot bovenin het scherm (= zichtbare blokkade). Zelfde contract als drawBoss.
export function drawGrauwBoss(scene, x, groundY) {
  const c = scene.add.container(x, groundY - 110).setDepth(7);
  const grijs = 0x7d838c, donker = 0x4a4f55, hoed = 0x2b2f34;
  // onweerszuil erachter, tot bovenin het scherm
  const spires = scene.add.graphics();
  spires.fillStyle(0x565b61, 0.75);
  spires.fillTriangle(-42, 105, -4, 105, -24, -490);
  spires.fillTriangle(4, 105, 44, 105, 24, -420);
  spires.fillStyle(0x6c7178, 0.8);
  spires.fillTriangle(-34, 105, -12, 105, -24, -440);
  spires.fillTriangle(12, 105, 38, 105, 24, -370);
  // bliksemflitsjes in de zuil
  spires.lineStyle(3, 0xffe16b, 0.8);
  spires.beginPath(); spires.moveTo(-24, -300); spires.lineTo(-16, -260); spires.lineTo(-26, -250); spires.lineTo(-18, -210); spires.strokePath();
  spires.beginPath(); spires.moveTo(24, -200); spires.lineTo(30, -168); spires.lineTo(22, -160); spires.lineTo(28, -128); spires.strokePath();
  c.add(spires);
  const g = scene.add.graphics();
  // grauwe wolk waar hij op zweeft
  g.fillStyle(0x6c7178, 0.9); g.fillEllipse(0, 96, 130, 34); g.fillEllipse(-42, 86, 70, 28); g.fillEllipse(44, 86, 70, 28);
  // cape
  g.fillStyle(donker, 1); g.fillTriangle(-34, -46, 34, -46, 52, 70);
  // lijf: lange grijze heer
  g.fillStyle(grijs, 1); g.fillRoundedRect(-32, -76, 64, 150, 14);
  g.fillStyle(0x6c7178, 1); g.fillRoundedRect(-32, 54, 64, 20, 14);
  g.fillStyle(lighten(grijs, 30), 0.4); g.fillRoundedRect(-26, -66, 20, 46, 8);
  g.lineStyle(4, donker, 1); g.strokeRoundedRect(-32, -76, 64, 150, 14);
  // hoge hoed
  g.fillStyle(hoed, 1); g.fillRect(-36, -90, 72, 9); g.fillRoundedRect(-22, -132, 44, 44, 5);
  g.fillStyle(0x565b61, 1); g.fillRect(-22, -104, 44, 6); // hoedband
  c.add(g);
  // boos gezicht + gouden monocle
  const eL = scene.add.circle(-12, -52, 9, 0xffffff).setStrokeStyle(2.5, hoed);
  const eR = scene.add.circle(14, -52, 11, 0xffffff).setStrokeStyle(3, 0xd9a821); // monocle!
  const pL = scene.add.circle(-12, -51, 3.5, 0x2b2f34), pR = scene.add.circle(14, -51, 3.8, 0x2b2f34);
  const ketting = scene.add.graphics();
  ketting.lineStyle(1.8, 0xd9a821, 1);
  ketting.beginPath(); ketting.moveTo(23, -46); ketting.lineTo(28, -26); ketting.strokePath();
  const br = scene.add.graphics(); br.lineStyle(4, hoed, 1);
  br.beginPath(); br.moveTo(-24, -68); br.lineTo(-4, -62); br.strokePath();
  br.beginPath(); br.moveTo(26, -68); br.lineTo(6, -62); br.strokePath();
  const m = scene.add.graphics(); m.lineStyle(3.5, hoed, 1);
  m.beginPath(); m.arc(0, -22, 11, 1.15 * Math.PI, 1.85 * Math.PI); m.strokePath();
  c.add([ketting, eL, eR, pL, pR, br, m]);
  c.bodyG = g; c.spires = spires; c.brow = br; c.mouth = m; c.eyes = [eL, eR]; c.monocle = eR;

  // tekstwolkje naast hem
  const bub = scene.add.container(72, -66);
  const bg = scene.add.graphics(); bg.fillStyle(0xffffff, 1); bg.lineStyle(3, 0x16202b, 1);
  bg.fillRoundedRect(-28, -24, 56, 44, 12); bg.strokeRoundedRect(-28, -24, 56, 44, 12); bg.fillTriangle(-6, 18, 6, 18, 0, 30);
  const wn = scene.add.text(0, -2, '', { fontFamily: 'Arial Black, Arial', fontSize: '30px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
  bub.add([bg, wn]); c.add(bub); c.bubble = bub; c.bubbleText = wn;
  scene.tweens.add({ targets: bub, scale: 1.08, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  scene.tweens.add({ targets: c, y: c.y - 8, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  scene.tweens.add({ targets: spires, alpha: 0.72, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return c;
}

// De verslagen Baron Grauw ONTDEKT TELLEN: monocle wipt, de lach komt, zijn
// pak kleurt paars en de onweerszuil lost op. Geen verliezer — een bekeerling.
export function happyGrauwBoss(scene, c) {
  c.brow.clear();
  c.mouth.clear(); c.mouth.lineStyle(3.5, 0x2b2f34, 1); c.mouth.beginPath(); c.mouth.arc(0, -28, 13, 0.12 * Math.PI, 0.88 * Math.PI); c.mouth.strokePath();
  // monocle wipt omhoog van verbazing
  scene.tweens.add({ targets: c.monocle, y: c.monocle.y - 16, angle: 30, duration: 350, yoyo: true, ease: 'Quad.out' });
  // de onweerszuil lost op — de weg is vrij en de lucht klaart op
  scene.tweens.killTweensOf(c.spires);
  scene.tweens.add({ targets: c.spires, alpha: 0, duration: 900 });
  // zijn pak kleurt: paarse strepen + gouden knopen (hij telt ze hardop!)
  c.bodyG.fillStyle(0x9b6dd6, 0.85);
  c.bodyG.fillRoundedRect(-32, -20, 64, 12, 6);
  c.bodyG.fillRoundedRect(-32, 8, 64, 12, 6);
  c.bodyG.fillStyle(0xffe16b, 1);
  [[0, -44], [0, -6], [0, 30]].forEach(([fx, fy]) => c.bodyG.fillCircle(fx, fy, 4));
}

// Grauw-wolkje (de aanval van Baron Grauw) — het allersnelste projectiel:
// een klein knorrig onweerswolkje met een bliksemstaartje.
export function drawGrauwWolkje(scene, x, y) {
  const c = scene.add.container(x, y).setDepth(8);
  const shadow = scene.add.graphics();
  shadow.fillStyle(0x000000, 0.14); shadow.fillEllipse(0, 0, 30, 7);
  c.add(shadow);
  const inner = scene.add.container(0, -16);
  const g = scene.add.graphics();
  g.fillStyle(0x6c7178, 1); g.fillEllipse(0, 0, 34, 18); g.fillCircle(-10, -6, 9); g.fillCircle(2, -9, 10); g.fillCircle(12, -5, 8);
  g.lineStyle(2, 0x4a4f55, 1); g.strokeEllipse(0, 0, 34, 18);
  g.fillStyle(0xffe16b, 1); g.fillTriangle(2, 8, 8, 8, -2, 20); // bliksemstaartje
  inner.add(g);
  c.add(inner);
  scene.tweens.add({ targets: inner, y: -20, duration: 200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return c;
}

// KAAS-GROMMEL (Wereld 7, de Pizza-Vulkaan): een grote boze kaaswig met
// gaten, die alle toppings van het dorp gestolen heeft.
export function drawKaasBoss(scene, x, groundY) {
  const c = scene.add.container(x, groundY - 70).setDepth(7);
  const kaas = 0xf6c624, kaasLicht = 0xffe16b, kaasDonker = 0xc9940f;
  // gestolen toppings-berg achter hem (zijn buit!)
  const buit = scene.add.graphics();
  buit.fillStyle(0xb93227, 0.9);
  [[-78, 44, 11], [-96, 30, 9], [-64, 22, 10], [-88, 8, 8]].forEach(([bx, by, br]) => { buit.fillCircle(bx, by, br); });
  buit.fillStyle(0xb08a5a, 0.9); buit.fillEllipse(-78, -6, 22, 13); buit.fillEllipse(-98, 46, 18, 11);
  c.add(buit);
  // romp: dikke kaaswig
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.18); g.fillEllipse(0, 74, 130, 20);
  g.fillStyle(kaas, 1);
  g.beginPath(); g.moveTo(-66, 70); g.lineTo(70, 70); g.lineTo(70, 26); g.lineTo(-66, -62); g.closePath(); g.fillPath();
  g.fillStyle(kaasLicht, 0.8);
  g.beginPath(); g.moveTo(-60, 62); g.lineTo(-8, 62); g.lineTo(-60, -40); g.closePath(); g.fillPath();
  g.lineStyle(4, kaasDonker, 1);
  g.beginPath(); g.moveTo(-66, 70); g.lineTo(70, 70); g.lineTo(70, 26); g.lineTo(-66, -62); g.closePath(); g.strokePath();
  // kaas-gaten
  g.fillStyle(kaasDonker, 0.8);
  g.fillEllipse(28, 50, 18, 14); g.fillEllipse(-14, 34, 13, 10); g.fillEllipse(46, 14, 11, 9); g.fillEllipse(8, 8, 9, 7);
  c.add(g);
  // boos gezicht
  const eL = scene.add.circle(8, -14, 11, 0xffffff).setStrokeStyle(3, kaasDonker);
  const eR = scene.add.circle(40, -8, 11, 0xffffff).setStrokeStyle(3, kaasDonker);
  const pL = scene.add.circle(8, -11, 4.5, 0x4a3505), pR = scene.add.circle(40, -5, 4.5, 0x4a3505);
  const br = scene.add.graphics(); br.lineStyle(4.5, kaasDonker, 1);
  br.beginPath(); br.moveTo(-4, -32); br.lineTo(18, -24); br.strokePath();
  br.beginPath(); br.moveTo(52, -24); br.lineTo(31, -19); br.strokePath();
  const m = scene.add.graphics(); m.lineStyle(4, kaasDonker, 1);
  m.beginPath(); m.arc(26, 32, 12, 1.15 * Math.PI, 1.85 * Math.PI); m.strokePath();
  c.add([eL, eR, pL, pR, br, m]);
  c.bodyG = g; c.brow = br; c.mouth = m; c.eyes = [eL, eR];

  // tekstwolkje
  const bub = scene.add.container(84, -66);
  const bg = scene.add.graphics(); bg.fillStyle(0xffffff, 1); bg.lineStyle(3, 0x16202b, 1);
  bg.fillRoundedRect(-28, -24, 56, 44, 12); bg.strokeRoundedRect(-28, -24, 56, 44, 12); bg.fillTriangle(-6, 18, 6, 18, 0, 30);
  const wn = scene.add.text(0, -2, '', { fontFamily: 'Arial Black, Arial', fontSize: '30px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
  bub.add([bg, wn]); c.add(bub); c.bubble = bub; c.bubbleText = wn;
  scene.tweens.add({ targets: bub, scale: 1.08, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  // knorrig wiebelen
  scene.tweens.add({ targets: c, y: c.y - 6, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return c;
}

// De verslagen Kaas-Grommel wordt lief: hij lacht, deelt zijn toppings uit
// en krijgt een basilicum-feesthoedje.
export function happyKaasBoss(scene, c) {
  c.brow.clear();
  c.mouth.clear(); c.mouth.lineStyle(4, 0xc9940f, 1);
  c.mouth.beginPath(); c.mouth.arc(26, 28, 13, 0.12 * Math.PI, 0.88 * Math.PI); c.mouth.strokePath();
  // basilicum-feesthoedje op de punt
  c.bodyG.fillStyle(0x57b947, 1); c.bodyG.fillEllipse(-58, -68, 26, 14);
  c.bodyG.fillStyle(0x2f7d33, 1); c.bodyG.fillEllipse(-58, -70, 14, 7);
  // blosjes
  c.bodyG.fillStyle(0xf07c5a, 0.55); c.bodyG.fillEllipse(0, 4, 12, 8); c.bodyG.fillEllipse(48, 10, 12, 8);
}

// Rollend kaaswiel (de aanval van de Kaas-Grommel) — physics regelt de scene.
export function drawKaasWiel(scene, x, y) {
  const c = scene.add.container(x, y).setDepth(8);
  const shadow = scene.add.graphics();
  shadow.fillStyle(0x000000, 0.14); shadow.fillEllipse(0, 0, 30, 7);
  c.add(shadow);
  const inner = scene.add.container(0, -15);
  const g = scene.add.graphics();
  g.fillStyle(0xc9940f, 1); g.fillCircle(0, 0, 15);
  g.fillStyle(0xf6c624, 1); g.fillCircle(0, 0, 12);
  g.fillStyle(0xc9940f, 0.85); g.fillEllipse(-4, -3, 6, 5); g.fillEllipse(5, 4, 5, 4); g.fillEllipse(3, -6, 3.5, 3);
  inner.add(g);
  c.add(inner);
  scene.tweens.add({ targets: inner, angle: -360, duration: 600, repeat: -1 }); // hij rólt
  return c;
}

// DE REUZEN-DROL (Wereld 9, Wc-Wonderland): een enorme drol met een kroontje
// die de grote wc blokkeert. Knuffelbaar boos — Adrians humor.
export function drawDrolBoss(scene, x, groundY) {
  const c = scene.add.container(x, groundY - 64).setDepth(7);
  const bruin = 0x8a5a33, licht = 0xa9713f, donker = 0x5d3a1e;
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.18); g.fillEllipse(0, 66, 130, 20);
  // drie swirl-lagen + een krul bovenop
  g.fillStyle(bruin, 1);
  g.fillEllipse(0, 42, 124, 52); g.fillEllipse(0, 8, 96, 46); g.fillEllipse(4, -24, 64, 36);
  g.fillStyle(licht, 0.6);
  g.fillEllipse(-24, 34, 40, 18); g.fillEllipse(-18, 2, 30, 14); g.fillEllipse(-6, -28, 20, 10);
  g.lineStyle(4, donker, 1);
  g.beginPath(); g.arc(10, -38, 12, Math.PI, 2.2 * Math.PI); g.strokePath(); // de krul
  c.add(g);
  // kroontje!
  const kroon = scene.add.graphics();
  kroon.fillStyle(0xffd24d, 1);
  kroon.fillTriangle(-16, -46, -8, -64, 0, -46);
  kroon.fillTriangle(-2, -46, 6, -66, 14, -46);
  kroon.fillTriangle(12, -46, 20, -62, 28, -46);
  kroon.fillRect(-16, -48, 44, 6);
  kroon.setAngle(-8); kroon.x = 6;
  c.add(kroon);
  // boos gezicht
  const eL = scene.add.circle(-14, 2, 11, 0xffffff).setStrokeStyle(3, donker);
  const eR = scene.add.circle(16, 2, 11, 0xffffff).setStrokeStyle(3, donker);
  const pL = scene.add.circle(-14, 5, 4.5, 0x2c1c0e), pR = scene.add.circle(16, 5, 4.5, 0x2c1c0e);
  const br = scene.add.graphics(); br.lineStyle(4.5, donker, 1);
  br.beginPath(); br.moveTo(-27, -14); br.lineTo(-4, -7); br.strokePath();
  br.beginPath(); br.moveTo(29, -14); br.lineTo(7, -7); br.strokePath();
  const m = scene.add.graphics(); m.lineStyle(4, donker, 1);
  m.beginPath(); m.arc(1, 30, 12, 1.15 * Math.PI, 1.85 * Math.PI); m.strokePath();
  c.add([eL, eR, pL, pR, br, m]);
  c.bodyG = g; c.brow = br; c.mouth = m; c.eyes = [eL, eR];

  // tekstwolkje
  const bub = scene.add.container(78, -52);
  const bg = scene.add.graphics(); bg.fillStyle(0xffffff, 1); bg.lineStyle(3, 0x16202b, 1);
  bg.fillRoundedRect(-28, -24, 56, 44, 12); bg.strokeRoundedRect(-28, -24, 56, 44, 12); bg.fillTriangle(-6, 18, 6, 18, 0, 30);
  const wn = scene.add.text(0, -2, '', { fontFamily: 'Arial Black, Arial', fontSize: '30px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
  bub.add([bg, wn]); c.add(bub); c.bubble = bub; c.bubbleText = wn;
  scene.tweens.add({ targets: bub, scale: 1.08, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  // trots deinen
  scene.tweens.add({ targets: c, scaleX: 1.03, scaleY: 0.97, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return c;
}

// De verslagen Reuzen-Drol wordt lief: lachje, blosjes en een strikje.
export function happyDrolBoss(scene, c) {
  c.brow.clear();
  c.mouth.clear(); c.mouth.lineStyle(4, 0x5d3a1e, 1);
  c.mouth.beginPath(); c.mouth.arc(1, 26, 13, 0.12 * Math.PI, 0.88 * Math.PI); c.mouth.strokePath();
  // blosjes + strikje op de krul
  c.bodyG.fillStyle(0xf9a8d4, 0.7); c.bodyG.fillEllipse(-30, 12, 13, 8); c.bodyG.fillEllipse(32, 12, 13, 8);
  c.bodyG.fillStyle(0xe8402c, 1);
  c.bodyG.fillTriangle(14, -52, 26, -58, 26, -46);
  c.bodyG.fillTriangle(38, -52, 26, -58, 26, -46);
  c.bodyG.fillCircle(26, -52, 3.5);
}

// Drolletje (de aanval van de Reuzen-Drol) — stuitert rollend voort.
export function drawDrolletje(scene, x, y) {
  const c = scene.add.container(x, y).setDepth(8);
  const shadow = scene.add.graphics();
  shadow.fillStyle(0x000000, 0.14); shadow.fillEllipse(0, 0, 28, 7);
  c.add(shadow);
  const inner = scene.add.container(0, -14);
  const g = scene.add.graphics();
  g.fillStyle(0x8a5a33, 1); g.fillEllipse(0, 4, 26, 13); g.fillEllipse(1, -4, 18, 10);
  g.fillStyle(0xa9713f, 0.7); g.fillEllipse(-5, 2, 9, 5);
  g.lineStyle(2.5, 0x5d3a1e, 1); g.beginPath(); g.arc(3, -9, 5, Math.PI, 2.3 * Math.PI); g.strokePath();
  // ondeugende oogjes
  g.fillStyle(0xffffff, 1); g.fillCircle(-4, -2, 3); g.fillCircle(5, -2, 3);
  g.fillStyle(0x2c1c0e, 1); g.fillCircle(-4, -2, 1.4); g.fillCircle(5, -2, 1.4);
  inner.add(g);
  c.add(inner);
  scene.tweens.add({ targets: inner, y: -20, duration: 190, yoyo: true, repeat: -1, ease: 'Quad.out' }); // hij huppelt!
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

// ===== DE REUZEN-GROMMEL (Wereld 10, Reuzenland) =====
// De klassieke Grommel-baas maar dan GIGANTISCH — hij krimpt per beuk-fase
// (de scene tweent zijn schaal), dus alles is relatief getekend. Het anker
// staat 105px boven de grond zodat de voeten op schaal 1.5 op de grond staan.
export function drawReusBoss(scene, x, groundY) {
  const c = drawBoss(scene, x, groundY);
  scene.tweens.killTweensOf(c); // de standaard dein-tween hoort bij de oude y
  c.setScale(1.5);
  c.y = groundY - 105; // voeten op de grond bij schaal 1.5 (70 × 1.5)
  c.grondY = groundY;  // de scene rekent hiermee de y bij elke krimp-fase uit
  scene.tweens.add({ targets: c, y: c.y - 8, duration: 1500, yoyo: true, repeat: -1, ease: "Sine.inOut" });
  return c;
}

// Rollende kei (de aanval van de Reuzen-Grommel): grijze rotsbal met mos.
export function drawKei(scene, x, y) {
  const c = scene.add.container(x, y).setDepth(8);
  const shadow = scene.add.graphics();
  shadow.fillStyle(0x000000, 0.16); shadow.fillEllipse(0, 0, 34, 8);
  c.add(shadow);
  const inner = scene.add.container(0, -17);
  const g = scene.add.graphics();
  g.fillStyle(0x8a8274, 1); g.fillCircle(0, 0, 16);
  g.fillStyle(0x6f6858, 1); g.fillEllipse(5, 5, 10, 7); g.fillEllipse(-7, -3, 7, 5);
  g.fillStyle(0xa8a091, 0.8); g.fillEllipse(-5, -7, 8, 5); // glansje
  g.fillStyle(0x4fae4a, 0.9); g.fillEllipse(8, -10, 8, 4); // plukje mos
  g.lineStyle(2.5, 0x57503f, 1); g.strokeCircle(0, 0, 16);
  inner.add(g);
  c.add(inner);
  scene.tweens.add({ targets: inner, angle: -360, duration: 700, repeat: -1 }); // rollen!
  return c;
}

// ===== DE STINKE-BIL (Wereld 11, Billenland) =====
// Een grote mopperende bil die NIET in bad wil — hij heeft alle zeepbellen
// gestolen en gooit stinkwolkjes. Vang de zeepbellen terug en hij wordt
// schoongeboend (en stiekem heel blij).
export function drawBilBoss(scene, x, groundY) {
  const c = scene.add.container(x, groundY - 64).setDepth(7);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.18); g.fillEllipse(0, 68, 120, 20);
  // twee grote bollen + spleet
  g.fillStyle(0xd9a184, 1);
  g.fillCircle(-30, 10, 46); g.fillCircle(30, 10, 46);
  g.fillRect(-58, 16, 116, 44);
  g.fillStyle(0xe8b89c, 0.75); g.fillEllipse(-36, -8, 34, 24); g.fillEllipse(24, -8, 34, 24);
  g.lineStyle(4.5, 0xa8714f, 1);
  g.beginPath(); g.moveTo(0, -30); g.lineTo(0, 52); g.strokePath();
  g.lineStyle(4, 0xa8714f, 0.9); g.strokeCircle(-30, 10, 46); g.strokeCircle(30, 10, 46);
  // vieze vegen + vliegjes-lijntjes (hij stinkt!)
  g.fillStyle(0x8a7a4a, 0.45); g.fillEllipse(-40, 26, 22, 10); g.fillEllipse(38, 18, 18, 9);
  g.lineStyle(2, 0x7a9d4a, 0.7);
  g.beginPath(); g.arc(-54, -34, 8, 0, 1.5 * Math.PI); g.strokePath();
  g.beginPath(); g.arc(56, -28, 6, 0.4, 1.9 * Math.PI); g.strokePath();
  c.add(g);
  c.bodyG = g;
  // boos gezichtje op de linkerbol
  const eL = scene.add.circle(-40, -2, 9, 0xffffff).setStrokeStyle(2.5, 0x333333);
  const eR = scene.add.circle(-18, -2, 9, 0xffffff).setStrokeStyle(2.5, 0x333333);
  const pL = scene.add.circle(-40, 0, 3.6, 0x222222), pR = scene.add.circle(-18, 0, 3.6, 0x222222);
  const br = scene.add.graphics(); br.lineStyle(3.5, 0x6e4a2c, 1);
  br.beginPath(); br.moveTo(-50, -16); br.lineTo(-32, -10); br.strokePath();
  br.beginPath(); br.moveTo(-8, -10); br.lineTo(-26, -13); br.strokePath();
  const m = scene.add.graphics(); m.lineStyle(3, 0x6e4a2c, 1);
  m.beginPath(); m.arc(-29, 22, 9, 1.15 * Math.PI, 1.85 * Math.PI); m.strokePath();
  c.add([eL, eR, pL, pR, br, m]);
  c.brow = br; c.mouth = m;

  const bub = scene.add.container(0, -104);
  const bg = scene.add.graphics(); bg.fillStyle(0xffffff, 1); bg.lineStyle(3, 0x16202b, 1);
  bg.fillRoundedRect(-28, -24, 56, 44, 12); bg.strokeRoundedRect(-28, -24, 56, 44, 12); bg.fillTriangle(-6, 18, 6, 18, 0, 30);
  const wn = scene.add.text(0, -2, '', { fontFamily: 'Arial Black, Arial', fontSize: '30px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
  bub.add([bg, wn]); c.add(bub); c.bubble = bub; c.bubbleText = wn;
  scene.tweens.add({ targets: bub, scale: 1.08, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  scene.tweens.add({ targets: c, y: c.y - 6, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return c;
}

// Schoongeboend en dolblij: roze-fris, blosjes, lach en zeepbelletjes.
export function happyBilBoss(scene, c) {
  c.bodyG.clear();
  const g = c.bodyG;
  g.fillStyle(0x000000, 0.18); g.fillEllipse(0, 68, 120, 20);
  g.fillStyle(0xf2b8a0, 1);
  g.fillCircle(-30, 10, 46); g.fillCircle(30, 10, 46);
  g.fillRect(-58, 16, 116, 44);
  g.fillStyle(0xf8cdb8, 0.85); g.fillEllipse(-36, -8, 34, 24); g.fillEllipse(24, -8, 34, 24);
  g.lineStyle(4.5, 0xd08a70, 1);
  g.beginPath(); g.moveTo(0, -30); g.lineTo(0, 52); g.strokePath();
  g.lineStyle(4, 0xd08a70, 0.9); g.strokeCircle(-30, 10, 46); g.strokeCircle(30, 10, 46);
  // blosjes + frisse zeepbelletjes
  g.fillStyle(0xf08a8a, 0.6); g.fillEllipse(-48, 12, 18, 11); g.fillEllipse(48, 12, 18, 11);
  g.lineStyle(2, 0xbfe8f5, 0.95);
  g.strokeCircle(-56, -34, 8); g.strokeCircle(54, -26, 6); g.strokeCircle(40, -46, 5);
  c.brow.clear();
  c.mouth.clear(); c.mouth.lineStyle(3.5, 0x8a4a30, 1);
  c.mouth.beginPath(); c.mouth.arc(-29, 14, 11, 0.12 * Math.PI, 0.88 * Math.PI); c.mouth.strokePath();
}

// Stinkwolkje (projectiel van de Stinke-Bil): groen-grijs walm-wolkje.
export function drawStinkWolkje(scene, x, y) {
  const c = scene.add.container(x, y).setDepth(8);
  const inner = scene.add.container(0, -16);
  const g = scene.add.graphics();
  g.fillStyle(0x9dbb6a, 0.85);
  g.fillCircle(-9, 2, 10); g.fillCircle(6, -3, 12); g.fillCircle(12, 5, 8);
  g.fillStyle(0x7a9d4a, 0.7); g.fillCircle(0, 6, 9);
  g.lineStyle(2, 0x5d7a35, 0.8);
  g.beginPath(); g.arc(-2, -12, 5, 0.3, 1.6 * Math.PI); g.strokePath();
  inner.add(g);
  c.add(inner);
  scene.tweens.add({ targets: inner, scale: 1.15, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return c;
}

// Zeepbel (vang-doel bij de Stinke-Bil): glinsterende bel met badeend-glans.
export function drawZeepbel(scene, i) {
  const g = scene.add.graphics();
  g.fillStyle(0xd7f0fa, 0.35); g.fillCircle(0, 0, 15);
  g.lineStyle(2.5, 0xbfe8f5, 1); g.strokeCircle(0, 0, 15);
  g.fillStyle(0xffffff, 0.75); g.fillEllipse(-5, -6, 7, 4.5);
  // om en om een klein badeendje of hartje ín de bel
  if (i % 2 === 0) {
    g.fillStyle(0xffe16b, 1); g.fillEllipse(1, 3, 11, 8); g.fillCircle(6, -2, 4.5);
    g.fillStyle(0xf6a723, 1); g.fillTriangle(9, -2, 13, -1, 9, 1);
    g.fillStyle(0x16202b, 1); g.fillCircle(7, -3, 1);
  } else {
    g.fillStyle(0xff6b9d, 0.95); g.fillCircle(-3, 1, 4); g.fillCircle(3, 1, 4);
    g.fillTriangle(-6.4, 3, 6.4, 3, 0, 10);
  }
  return g;
}

// ===== DE INKT-OCTOPUS (Wereld 12, de Bubbel-Zee) =====
// Een grote paarse octopus die de doorgang dichthoudt met zijn tentakels en
// inkt-klodders schiet. Je peutert hem tentakel voor tentakel los met
// 10-maatjes (verliefde getallen) — daarna wordt hij roze en dolblij.
export function drawOctopusBoss(scene, x, groundY) {
  const c = scene.add.container(x, groundY - 72).setDepth(7);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.18); g.fillEllipse(0, 76, 130, 20);
  // tentakels (golvend onderaan)
  g.fillStyle(0x7a4ea0, 1);
  for (let i = 0; i < 5; i++) {
    const tx = -52 + i * 26;
    g.fillRoundedRect(tx - 8, 26, 16, 44, 8);
    g.fillCircle(tx, 70, 9);
  }
  // zuignapjes
  g.fillStyle(0xb98ad0, 0.9);
  for (let i = 0; i < 5; i++) { const tx = -52 + i * 26; g.fillCircle(tx, 48, 3.4); g.fillCircle(tx, 62, 3); }
  // bolle kop
  g.fillStyle(0x8a5eb0, 1); g.fillEllipse(0, -8, 116, 96);
  g.fillStyle(0x9d74c2, 0.8); g.fillEllipse(-18, -28, 52, 34);
  g.lineStyle(4, 0x5d3a80, 1); g.strokeEllipse(0, -8, 116, 96);
  c.add(g);
  c.bodyG = g;
  // boze ogen + frons
  const eL = scene.add.circle(-20, -14, 11, 0xffffff).setStrokeStyle(3, 0x333333);
  const eR = scene.add.circle(20, -14, 11, 0xffffff).setStrokeStyle(3, 0x333333);
  const pL = scene.add.circle(-20, -12, 4.4, 0x222222), pR = scene.add.circle(20, -12, 4.4, 0x222222);
  const br = scene.add.graphics(); br.lineStyle(4, 0x3d2456, 1);
  br.beginPath(); br.moveTo(-32, -30); br.lineTo(-10, -24); br.strokePath();
  br.beginPath(); br.moveTo(32, -30); br.lineTo(10, -24); br.strokePath();
  const m = scene.add.graphics(); m.lineStyle(3, 0x3d2456, 1);
  m.beginPath(); m.arc(0, 16, 11, 1.15 * Math.PI, 1.85 * Math.PI); m.strokePath();
  c.add([eL, eR, pL, pR, br, m]);
  c.brow = br; c.mouth = m;

  const bub = scene.add.container(0, -110);
  const bg = scene.add.graphics(); bg.fillStyle(0xffffff, 1); bg.lineStyle(3, 0x16202b, 1);
  bg.fillRoundedRect(-34, -24, 68, 44, 12); bg.strokeRoundedRect(-34, -24, 68, 44, 12); bg.fillTriangle(-6, 18, 6, 18, 0, 30);
  const wn = scene.add.text(0, -2, '', { fontFamily: 'Arial Black, Arial', fontSize: '24px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
  bub.add([bg, wn]); c.add(bub); c.bubble = bub; c.bubbleText = wn;
  scene.tweens.add({ targets: bub, scale: 1.08, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  scene.tweens.add({ targets: c, y: c.y - 7, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return c;
}

// Losgepeuterd en dolgelukkig: zacht roze, blosjes en hartjes-oogjes.
export function happyOctopusBoss(scene, c) {
  c.bodyG.clear();
  const g = c.bodyG;
  g.fillStyle(0x000000, 0.18); g.fillEllipse(0, 76, 130, 20);
  g.fillStyle(0xe08ab8, 1);
  for (let i = 0; i < 5; i++) {
    const tx = -52 + i * 26;
    g.fillRoundedRect(tx - 8, 26, 16, 44, 8);
    g.fillCircle(tx, 70, 9);
  }
  g.fillStyle(0xf2a7cc, 0.9);
  for (let i = 0; i < 5; i++) { const tx = -52 + i * 26; g.fillCircle(tx, 48, 3.4); g.fillCircle(tx, 62, 3); }
  g.fillStyle(0xe89ac2, 1); g.fillEllipse(0, -8, 116, 96);
  g.fillStyle(0xf2b8d6, 0.85); g.fillEllipse(-18, -28, 52, 34);
  g.lineStyle(4, 0xb05a8a, 1); g.strokeEllipse(0, -8, 116, 96);
  g.fillStyle(0xf08a8a, 0.6); g.fillEllipse(-40, 4, 18, 11); g.fillEllipse(40, 4, 18, 11); // blosjes
  c.brow.clear();
  c.mouth.clear(); c.mouth.lineStyle(3.5, 0x8a3d66, 1);
  c.mouth.beginPath(); c.mouth.arc(0, 8, 13, 0.12 * Math.PI, 0.88 * Math.PI); c.mouth.strokePath();
}

// Inkt-klodder (projectiel van de Inkt-Octopus): donkere spetter-bal.
export function drawInktKlodder(scene, x, y) {
  const c = scene.add.container(x, y).setDepth(8);
  const inner = scene.add.container(0, -15);
  const g = scene.add.graphics();
  g.fillStyle(0x2d2440, 0.95); g.fillCircle(0, 0, 11);
  g.fillCircle(-9, 4, 6); g.fillCircle(9, 3, 5); g.fillCircle(3, -9, 5);
  g.fillStyle(0x4a3a68, 0.9); g.fillCircle(-3, -3, 4);
  inner.add(g);
  c.add(inner);
  scene.tweens.add({ targets: inner, angle: 360, duration: 900, repeat: -1 });
  return c;
}

// ===== DE SISSER — de Letter-Land-baas =====
// Look voor de baas-registry (stijl 'sisser'): De Grote Stilte zelf. Hergebruikt
// tekenSisser (letterCast.js) en volgt het baas-contract (bubble/bubbleText;
// bodyG voor de happy-redraw). Het gestolen woord staat in z'n wolkje en kleurt
// letter voor letter terug naarmate jij ze schrijft.
export function drawSisserBoss(scene, x, groundY) {
  const c = scene.add.container(x, groundY - 82).setDepth(7);
  const sis = tekenSisser(scene, 0, 0, 1.55, false); // de villain, fors
  c.add(sis);
  c._sis = sis; c.bodyG = sis._graphics;

  // tekstwolkje met het gestolen woord (met blanks: "··· → p·· → pe· → pen")
  const bub = scene.add.container(0, -152);
  const bg = scene.add.graphics(); bg.fillStyle(0xffffff, 1); bg.lineStyle(3, 0x16202b, 1);
  bg.fillRoundedRect(-42, -24, 84, 46, 12); bg.strokeRoundedRect(-42, -24, 84, 46, 12); bg.fillTriangle(-6, 20, 6, 20, 0, 32);
  const wn = scene.add.text(0, -1, '', { fontFamily: 'Arial Black, Arial', fontSize: '26px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
  bub.add([bg, wn]); c.add(bub); c.bubble = bub; c.bubbleText = wn;
  scene.tweens.add({ targets: bub, scale: 1.08, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  scene.tweens.add({ targets: c, y: c.y - 7, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return c;
}

// Verslagen → bekeerd: de boze villain maakt plaats voor de blije gedaante
// (paarse strepen, lach, muzieknootje). Zelfde slot in de container.
export function happySisserBoss(scene, c) {
  if (c._sis) c._sis.destroy();
  const blij = tekenSisser(scene, 0, 0, 1.55, true);
  c.addAt(blij, 0);
  c._sis = blij; c.bodyG = blij._graphics;
  scene.tweens.add({ targets: c, scaleX: 0.95, scaleY: 0.95, duration: 420, ease: 'Back.out' });
}

// Stilte-wolkje (projectiel van De Sisser): een grijs "sss"-pluisje dat naar je
// toe drijft — spring eroverheen. Zelfde contract als drawInktKlodder.
export function drawStilPuff(scene, x, y) {
  const c = scene.add.container(x, y).setDepth(8);
  const inner = scene.add.container(0, -15);
  const g = scene.add.graphics();
  g.fillStyle(0xcfd4db, 0.95);
  g.fillCircle(-9, 0, 11); g.fillCircle(6, -4, 13); g.fillCircle(13, 5, 9); g.fillCircle(-2, 7, 10);
  g.lineStyle(2.5, 0x9198a1, 1);
  g.strokeCircle(-9, 0, 11); g.strokeCircle(6, -4, 13);
  inner.add(g);
  inner.add(scene.add.text(2, -2, 'sss', { fontFamily: 'Arial Black, Arial', fontSize: '15px', fontStyle: 'bold', color: '#5a6069' }).setOrigin(0.5));
  c.add(inner);
  scene.tweens.add({ targets: inner, angle: 10, duration: 480, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return c;
}

// ===== ANTWOORD-SCHELP (Golf-Baas, stijl 'surf') =====
// Zelfde contract als tekenGetalBel (container + .waarde/.spawnY/.taken +
// bob-tween): een roze waaier-schelp met het getal erin — raak de schelp
// met het aantal golven dat je telde.
export function drawSchelpKeuze(scene, x, y, waarde) {
  const c = scene.add.container(x, y).setDepth(6);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.12); g.fillEllipse(0, 26, 44, 8);
  // waaier van de schelp
  g.fillStyle(0xf2a7b8, 1);
  g.slice(0, 12, 26, Math.PI, 0, false); g.fillPath();
  g.fillStyle(0xf8cdd8, 0.9);
  for (let i = 0; i < 4; i++) {
    const a = Math.PI + (i + 0.5) * (Math.PI / 4);
    g.fillTriangle(0, 12, Math.cos(a) * 25, 12 + Math.sin(a) * 25, Math.cos(a + 0.32) * 25, 12 + Math.sin(a + 0.32) * 25);
  }
  g.lineStyle(3, 0xd06a88, 1);
  g.beginPath(); g.arc(0, 12, 26, Math.PI, 0); g.strokePath();
  g.fillStyle(0xd06a88, 1); g.fillEllipse(0, 13, 14, 6); // het voetje
  c.add(g);
  c.add(scene.add.text(0, -2, `${waarde}`, {
    fontFamily: 'Arial Black, Arial', fontSize: '19px', fontStyle: 'bold', color: '#8a3d55',
  }).setOrigin(0.5));
  scene.tweens.add({ targets: c, y: y - 9, duration: 950 + (waarde % 3) * 160, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  c.waarde = waarde; c.spawnY = y; c.taken = false;
  return c;
}

// Eikeltje als raap-item (Boom-Baas, stijl 'schud') — vangArt-contract.
export function drawEikeltje(scene) {
  const g = scene.add.graphics();
  g.fillStyle(0xb07a45, 1); g.fillEllipse(0, 3, 18, 20);
  g.fillStyle(0x6e4a26, 1); g.slice(0, -3, 10, Math.PI, 0, false); g.fillPath();
  g.fillRoundedRect(-1.5, -14, 3, 5, 1.5);
  g.fillStyle(0xd9a86a, 0.6); g.fillEllipse(-4, 3, 5, 9);
  return g;
}

// ===== ANTWOORD-KRISTAL (Kristal-Baas, stijl 'splits') =====
// Zelfde contract als tekenGetalBel: een zwevend paars kristal-brok met het
// getal erin — raak het brok dat het splits-raadsel compleet maakt.
export function drawKristalKeuze(scene, x, y, waarde) {
  const c = scene.add.container(x, y).setDepth(6);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.12); g.fillEllipse(0, 28, 40, 8);
  g.fillStyle(0x9b6dd6, 0.95);
  g.fillPoints([{ x: 0, y: -26 }, { x: 20, y: -6 }, { x: 13, y: 22 }, { x: -13, y: 22 }, { x: -20, y: -6 }], true);
  g.fillStyle(0xc7a6ee, 0.85);
  g.fillPoints([{ x: 0, y: -26 }, { x: 20, y: -6 }, { x: 0, y: 0 }], true);
  g.fillStyle(0x7a4eb0, 0.9);
  g.fillPoints([{ x: -20, y: -6 }, { x: 0, y: 0 }, { x: -13, y: 22 }], true);
  g.lineStyle(2.5, 0x5d3a80, 1);
  g.strokePoints([{ x: 0, y: -26 }, { x: 20, y: -6 }, { x: 13, y: 22 }, { x: -13, y: 22 }, { x: -20, y: -6 }], true);
  c.add(g);
  c.add(scene.add.text(0, 0, `${waarde}`, {
    fontFamily: 'Arial Black, Arial', fontSize: '19px', fontStyle: 'bold', color: '#ffffff',
  }).setOrigin(0.5).setStroke('#4a2a66', 4));
  scene.tweens.add({ targets: c, y: y - 9, duration: 900 + (waarde % 3) * 170, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  c.waarde = waarde; c.spawnY = y; c.taken = false;
  return c;
}

// Kleur-orb (Grauw-finale, akte 1): de gestolen kleur die hij morst —
// vang ze terug! Elke orb heeft een andere regenboog-kleur.
export function drawKleurOrb(scene, i) {
  const KLEUREN = [0xe8402c, 0xf6c624, 0x2fae4e, 0x3f8fe8, 0x9b6dd6];
  const kleur = KLEUREN[i % KLEUREN.length];
  const g = scene.add.graphics();
  g.fillStyle(kleur, 0.28); g.fillCircle(0, 0, 17);
  g.fillStyle(kleur, 1); g.fillCircle(0, 0, 11);
  g.fillStyle(0xffffff, 0.7); g.fillEllipse(-4, -4, 6, 4);
  g.lineStyle(2, 0xffffff, 0.5); g.strokeCircle(0, 0, 14);
  return g;
}

// ===== DE PANNEN-BAAS (Wereld 8, Pannenkoeken-Paradijs) =====
// Een reusachtige koekenpan op pootjes die pannenkoeken over de arena
// flipt. Stijl 'surf'-hergebruik: TEL de pannenkoeken en raak het bord
// met het goede aantal. Happy: er ligt een dolblije pannenkoek in de pan.
export function drawPanBoss(scene, x, groundY) {
  const c = scene.add.container(x, groundY - 64).setDepth(7);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.18); g.fillEllipse(0, 68, 120, 20);
  // pootjes
  g.fillStyle(0x2b2f34, 1); g.fillRoundedRect(-38, 42, 14, 24, 5); g.fillRoundedRect(24, 42, 14, 24, 5);
  // de pan: donker gietijzer, schuin naar de speler gekanteld
  g.fillStyle(0x3a3f45, 1); g.fillEllipse(0, 8, 128, 96);
  g.fillStyle(0x2b2f34, 1); g.fillEllipse(0, 12, 112, 78);
  g.fillStyle(0x565b61, 1); g.fillEllipse(0, 2, 118, 84); // rand-glans
  g.fillStyle(0x23272b, 1); g.fillEllipse(0, 6, 104, 70); // pan-vlak
  // de steel, omhoog als een staart
  g.fillStyle(0x3a3f45, 1); g.fillRoundedRect(52, -58, 18, 64, 8);
  g.lineStyle(3, 0x16191d, 1); g.strokeEllipse(0, 8, 128, 96);
  // boter-klontje dat sist in de pan
  g.fillStyle(0xffe16b, 0.9); g.fillRoundedRect(-34, -16, 18, 12, 4);
  c.add(g);
  c.bodyG = g;
  // boos gezicht óp het pan-vlak
  const eL = scene.add.circle(-18, -4, 9, 0xffffff).setStrokeStyle(2.5, 0x111111);
  const eR = scene.add.circle(16, -4, 9, 0xffffff).setStrokeStyle(2.5, 0x111111);
  const pL = scene.add.circle(-18, -2, 3.6, 0x111111), pR = scene.add.circle(16, -2, 3.6, 0x111111);
  const br = scene.add.graphics(); br.lineStyle(3.5, 0xf3d9a4, 1);
  br.beginPath(); br.moveTo(-30, -18); br.lineTo(-8, -12); br.strokePath();
  br.beginPath(); br.moveTo(28, -18); br.lineTo(6, -12); br.strokePath();
  const m = scene.add.graphics(); m.lineStyle(3, 0xf3d9a4, 1);
  m.beginPath(); m.arc(-1, 20, 10, 1.15 * Math.PI, 1.85 * Math.PI); m.strokePath();
  c.add([eL, eR, pL, pR, br, m]);
  c.brow = br; c.mouth = m;

  const bub = scene.add.container(0, -104);
  const bg = scene.add.graphics(); bg.fillStyle(0xffffff, 1); bg.lineStyle(3, 0x16202b, 1);
  bg.fillRoundedRect(-28, -24, 56, 44, 12); bg.strokeRoundedRect(-28, -24, 56, 44, 12); bg.fillTriangle(-6, 18, 6, 18, 0, 30);
  const wn = scene.add.text(0, -2, '', { fontFamily: 'Arial Black, Arial', fontSize: '30px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
  bub.add([bg, wn]); c.add(bub); c.bubble = bub; c.bubbleText = wn;
  scene.tweens.add({ targets: bub, scale: 1.08, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  scene.tweens.add({ targets: c, y: c.y - 6, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return c;
}

// Verslagen = er ligt een dolgelukkige pannenkoek in de pan.
export function happyPanBoss(scene, c) {
  c.bodyG.clear();
  const g = c.bodyG;
  g.fillStyle(0x000000, 0.18); g.fillEllipse(0, 68, 120, 20);
  g.fillStyle(0x2b2f34, 1); g.fillRoundedRect(-38, 42, 14, 24, 5); g.fillRoundedRect(24, 42, 14, 24, 5);
  g.fillStyle(0x3a3f45, 1); g.fillEllipse(0, 8, 128, 96);
  g.fillStyle(0x565b61, 1); g.fillEllipse(0, 2, 118, 84);
  // een goudbruine pannenkoek vult de pan!
  g.fillStyle(0xe8b96e, 1); g.fillEllipse(0, 4, 100, 66);
  g.fillStyle(0xd9a44f, 0.8); g.fillEllipse(-14, 0, 20, 12); g.fillEllipse(18, 10, 16, 10);
  g.fillStyle(0xffe16b, 0.95); g.fillRoundedRect(-10, -12, 20, 13, 4); // klontje boter
  g.fillStyle(0x3a3f45, 1); g.fillRoundedRect(52, -58, 18, 64, 8);
  g.lineStyle(3, 0x16191d, 1); g.strokeEllipse(0, 8, 128, 96);
  c.brow.clear();
  c.mouth.clear(); c.mouth.lineStyle(3.5, 0x8a5a33, 1);
  c.mouth.beginPath(); c.mouth.arc(-1, 12, 13, 0.12 * Math.PI, 0.88 * Math.PI); c.mouth.strokePath();
}

// Vliegende pannenkoek (projectiel van de Pannen-Baas): flipt al rollend.
export function drawPannenkoekje(scene, x, y) {
  const c = scene.add.container(x, y).setDepth(8);
  const shadow = scene.add.graphics();
  shadow.fillStyle(0x000000, 0.14); shadow.fillEllipse(0, 0, 30, 7);
  c.add(shadow);
  const inner = scene.add.container(0, -15);
  const g = scene.add.graphics();
  g.fillStyle(0xe8b96e, 1); g.fillEllipse(0, 0, 28, 22);
  g.fillStyle(0xd9a44f, 0.85); g.fillEllipse(-5, -3, 9, 6); g.fillEllipse(7, 4, 7, 5);
  g.fillStyle(0xffe16b, 0.9); g.fillRoundedRect(-4, -5, 8, 6, 2);
  g.lineStyle(2, 0xb98a3e, 1); g.strokeEllipse(0, 0, 28, 22);
  inner.add(g);
  c.add(inner);
  scene.tweens.add({ targets: inner, scaleY: { from: 1, to: 0.25 }, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.inOut' }); // FLIP!
  return c;
}

// Antwoord-bordje (keuze-art, contract zoals de schelp): wit bord met getal.
export function drawBordKeuze(scene, x, y, waarde) {
  const c = scene.add.container(x, y).setDepth(6);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.12); g.fillEllipse(0, 24, 46, 8);
  g.fillStyle(0xffffff, 1); g.fillEllipse(0, 4, 52, 34);
  g.fillStyle(0xeef2f6, 1); g.fillEllipse(0, 2, 36, 22);
  g.lineStyle(2.5, 0x7fa8d0, 1); g.strokeEllipse(0, 4, 52, 34);
  c.add(g);
  c.add(scene.add.text(0, 0, `${waarde}`, {
    fontFamily: 'Arial Black, Arial', fontSize: '19px', fontStyle: 'bold', color: '#16202b',
  }).setOrigin(0.5));
  scene.tweens.add({ targets: c, y: y - 9, duration: 950 + (waarde % 3) * 160, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  c.waarde = waarde; c.spawnY = y; c.taken = false;
  return c;
}

// ===== DE SOKKEN-DIEF (Wereld 13, de Kleren-Kast) =====
// Een sluwe schurk met een sok als muts en een uitpuilende buit-zak vol
// gestolen sokken. Stijl 'paar': hij toont een sok in zijn denk-wolkje —
// raak de TWEELING tussen de zwevende sokken en hij laat een zak los.
// Verslagen = hij geeft álle sokken terug (en houdt alleen zijn muts).
export function drawSokDiefBoss(scene, x, groundY) {
  const c = scene.add.container(x, groundY - 64).setDepth(7);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.18); g.fillEllipse(0, 68, 120, 20);
  // de buit-zak op zijn rug (uitpuilend, dichtgeknoopt met een koord)
  g.fillStyle(0x8a6a45, 1); g.fillEllipse(38, -6, 66, 84);
  g.fillStyle(0xa9855c, 0.7); g.fillEllipse(30, -18, 34, 40);
  g.lineStyle(3.5, 0x6e5436, 1); g.strokeEllipse(38, -6, 66, 84);
  g.lineStyle(3, 0x6e5436, 1); g.beginPath(); g.moveTo(24, -44); g.lineTo(50, -40); g.strokePath(); // het koord
  c.add(g);
  // sokken die uit de zak piepen
  const piep1 = scene.add.graphics(); drawSok(piep1, 'stippen', 0.5); piep1.setPosition(46, -48).setAngle(30);
  const piep2 = scene.add.graphics(); drawSok(piep2, 'sterren', 0.45); piep2.setPosition(26, -52).setAngle(-20);
  c.add([piep1, piep2]);
  // het lijf: een lange schurk in schemer-paars, op sluip-voetjes
  const lijf = scene.add.graphics();
  lijf.fillStyle(0x5d5470, 1); lijf.fillRoundedRect(-34, -46, 58, 108, 14);
  lijf.fillStyle(0x6e6584, 1); lijf.fillRoundedRect(-34, -46, 58, 22, 12);
  lijf.lineStyle(3.5, 0x423b52, 1); lijf.strokeRoundedRect(-34, -46, 58, 108, 14);
  lijf.fillStyle(0x423b52, 1); lijf.fillEllipse(-20, 64, 26, 10); lijf.fillEllipse(4, 64, 26, 10);
  // een sok als muts (rood-gestreept, met hangend puntje)
  lijf.fillStyle(0xe8402c, 1);
  lijf.fillRoundedRect(-30, -66, 50, 24, 10);
  lijf.fillCircle(24, -50, 9);
  lijf.fillStyle(0xffe16b, 1); lijf.fillRect(-30, -60, 50, 5);
  lijf.fillStyle(0xffffff, 1); lijf.fillRoundedRect(-32, -48, 54, 8, 4); // de boord
  c.add(lijf);
  c.bodyG = lijf;
  // sluwe oogjes + grijnsje
  const eL = scene.add.circle(-18, -28, 8, 0xffffff).setStrokeStyle(2.5, 0x2b2f34);
  const eR = scene.add.circle(4, -28, 8, 0xffffff).setStrokeStyle(2.5, 0x2b2f34);
  const pL = scene.add.circle(-16, -27, 3.2, 0x222222), pR = scene.add.circle(6, -27, 3.2, 0x222222);
  const br = scene.add.graphics(); br.lineStyle(3.5, 0x2b2f34, 1);
  br.beginPath(); br.moveTo(-26, -40); br.lineTo(-10, -34); br.strokePath();
  br.beginPath(); br.moveTo(12, -34); br.lineTo(-2, -37); br.strokePath();
  const m = scene.add.graphics(); m.lineStyle(3, 0x2b2f34, 1);
  m.beginPath(); m.arc(-7, -10, 9, 1.25 * Math.PI, 1.95 * Math.PI); m.strokePath();
  c.add([eL, eR, pL, pR, br, m]);
  c.brow = br; c.mouth = m;

  const bub = scene.add.container(0, -112);
  const bg = scene.add.graphics(); bg.fillStyle(0xffffff, 1); bg.lineStyle(3, 0x16202b, 1);
  bg.fillRoundedRect(-28, -24, 56, 44, 12); bg.strokeRoundedRect(-28, -24, 56, 44, 12); bg.fillTriangle(-6, 18, 6, 18, 0, 30);
  const wn = scene.add.text(0, -2, '', { fontFamily: 'Arial Black, Arial', fontSize: '30px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
  bub.add([bg, wn]); c.add(bub); c.bubble = bub; c.bubbleText = wn;
  scene.tweens.add({ targets: bub, scale: 1.08, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  scene.tweens.add({ targets: c, y: c.y - 6, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return c;
}

// Bekeerd: de dief wordt sokken-uitdeler — blos, brede lach, fris blauw pak.
export function happySokDiefBoss(scene, c) {
  c.bodyG.clear();
  const lijf = c.bodyG;
  lijf.fillStyle(0x7fb8e8, 1); lijf.fillRoundedRect(-34, -46, 58, 108, 14);
  lijf.fillStyle(0x9fcbef, 1); lijf.fillRoundedRect(-34, -46, 58, 22, 12);
  lijf.lineStyle(3.5, 0x3f6fa8, 1); lijf.strokeRoundedRect(-34, -46, 58, 108, 14);
  lijf.fillStyle(0x3f6fa8, 1); lijf.fillEllipse(-20, 64, 26, 10); lijf.fillEllipse(4, 64, 26, 10);
  // de muts blijft (die is van hemzelf), nu vrolijk
  lijf.fillStyle(0xe8402c, 1);
  lijf.fillRoundedRect(-30, -66, 50, 24, 10);
  lijf.fillCircle(24, -50, 9);
  lijf.fillStyle(0xffe16b, 1); lijf.fillRect(-30, -60, 50, 5);
  lijf.fillStyle(0xffffff, 1); lijf.fillRoundedRect(-32, -48, 54, 8, 4);
  // blosjes
  lijf.fillStyle(0xf08a8a, 0.6); lijf.fillEllipse(-26, -14, 14, 9); lijf.fillEllipse(12, -14, 14, 9);
  c.brow.clear();
  c.mouth.clear(); c.mouth.lineStyle(3.5, 0x2b2f34, 1);
  c.mouth.beginPath(); c.mouth.arc(-7, -16, 11, 0.12 * Math.PI, 0.88 * Math.PI); c.mouth.strokePath();
}

// Natte sok (projectiel van de Sokken-Dief): een doorweekte sok met druppels.
export function drawNatteSok(scene, x, y) {
  const c = scene.add.container(x, y).setDepth(8);
  const inner = scene.add.container(0, -16);
  const g = scene.add.graphics();
  drawSok(g, 'stippen', 0.75);
  // druppels eraf
  g.fillStyle(0x7fd0f0, 0.9);
  g.fillEllipse(-12, 14, 5, 8); g.fillEllipse(10, 16, 4, 7); g.fillEllipse(0, 19, 4, 6);
  inner.add(g);
  c.add(inner);
  scene.tweens.add({ targets: inner, angle: { from: -14, to: 14 }, duration: 220, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return c;
}

// Keuze-sok (stijl 'paar'): een zwevende sok met patroon — zelfde contract
// als tekenGetalBel, maar 'waarde' is hier de patroon-naam (string).
export function drawSokKeuze(scene, x, y, waarde) {
  const c = scene.add.container(x, y).setDepth(6);
  const glow = scene.add.circle(2, 0, 30, 0xfff3b0, 0.25);
  c.add(glow);
  const g = scene.add.graphics();
  drawSok(g, waarde, 1.05);
  c.add(g);
  scene.tweens.add({ targets: c, y: y - 10, duration: 950 + (waarde.length % 3) * 160, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  c.waarde = waarde; c.spawnY = y; c.taken = false;
  return c;
}

// ===== DE KEGEL-KONING (Wereld 14, het Stuiter-Stadion) =====
// Een reusachtige bowlingkegel met een kroon en een snor die rollende
// bowlingballen op je afstuurt. Stijl 'kegel': hij stampt een stel kegels
// om — reken uit hoeveel er nog staan en raak het goede antwoord-bord.
export function drawKegelBoss(scene, x, groundY) {
  const c = scene.add.container(x, groundY - 78).setDepth(7);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.18); g.fillEllipse(0, 82, 110, 20);
  // het kegel-lijf: wit met rode banden, glimmend
  g.fillStyle(0xf5f9fc, 1);
  g.fillEllipse(0, 74, 74, 22);             // voet
  g.fillRoundedRect(-32, -38, 64, 116, 26); // lijf
  g.fillCircle(0, -44, 26);                 // kop
  g.fillStyle(0xe8402c, 1); g.fillRect(-32, -14, 64, 15); g.fillRect(-30, 8, 60, 10);
  g.fillStyle(0xffffff, 0.55); g.fillEllipse(-13, -30, 14, 42); // glans
  g.lineStyle(4, 0x9aa0a6, 1); g.strokeRoundedRect(-32, -38, 64, 116, 26);
  // armpjes met witte handschoentjes
  g.lineStyle(5, 0xd0d6dd, 1);
  g.beginPath(); g.moveTo(-32, 10); g.lineTo(-52, -6); g.strokePath();
  g.beginPath(); g.moveTo(32, 10); g.lineTo(52, 24); g.strokePath();
  g.fillStyle(0xffffff, 1); g.fillCircle(-54, -9, 7); g.fillCircle(54, 27, 7);
  c.add(g);
  c.bodyG = g;
  // de kroon
  const kroon = scene.add.graphics();
  kroon.fillStyle(0xf6c624, 1);
  kroon.fillRect(-20, -78, 40, 10);
  kroon.fillTriangle(-20, -78, -12, -78, -16, -94);
  kroon.fillTriangle(-8, -78, 8, -78, 0, -98);
  kroon.fillTriangle(12, -78, 20, -78, 16, -94);
  kroon.fillStyle(0xe8402c, 1); kroon.fillCircle(0, -88, 3.4);
  kroon.lineStyle(2, 0xb98d12, 1); kroon.strokeRect(-20, -78, 40, 10);
  c.add(kroon);
  // koninklijk gezicht: streng + een snor
  const eL = scene.add.circle(-10, -48, 7, 0xffffff).setStrokeStyle(2.5, 0x2b2f34);
  const eR = scene.add.circle(10, -48, 7, 0xffffff).setStrokeStyle(2.5, 0x2b2f34);
  const pL = scene.add.circle(-9, -47, 3, 0x222222), pR = scene.add.circle(11, -47, 3, 0x222222);
  const br = scene.add.graphics(); br.lineStyle(3.5, 0x2b2f34, 1);
  br.beginPath(); br.moveTo(-17, -58); br.lineTo(-4, -55); br.strokePath();
  br.beginPath(); br.moveTo(17, -58); br.lineTo(4, -55); br.strokePath();
  const m = scene.add.graphics();
  m.fillStyle(0x6e4a2c, 1); // de snor
  m.fillEllipse(-7, -34, 13, 6); m.fillEllipse(7, -34, 13, 6);
  m.lineStyle(3, 0x2b2f34, 1);
  m.beginPath(); m.arc(0, -26, 6, 1.2 * Math.PI, 1.9 * Math.PI); m.strokePath();
  c.add([eL, eR, pL, pR, br, m]);
  c.brow = br; c.mouth = m;

  const bub = scene.add.container(0, -136);
  const bg = scene.add.graphics(); bg.fillStyle(0xffffff, 1); bg.lineStyle(3, 0x16202b, 1);
  bg.fillRoundedRect(-42, -24, 84, 44, 12); bg.strokeRoundedRect(-42, -24, 84, 44, 12); bg.fillTriangle(-6, 18, 6, 18, 0, 30);
  const wn = scene.add.text(0, -2, '', { fontFamily: 'Arial Black, Arial', fontSize: '30px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
  bub.add([bg, wn]); c.add(bub); c.bubble = bub; c.bubbleText = wn;
  scene.tweens.add({ targets: bub, scale: 1.08, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  scene.tweens.add({ targets: c, y: c.y - 6, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return c;
}

// Verslagen (= eindelijk omgekegeld): krullende snor, brede lach, blosjes.
export function happyKegelBoss(scene, c) {
  c.brow.clear();
  c.mouth.clear();
  c.mouth.fillStyle(0x6e4a2c, 1); // de snor krult nu vrolijk omhoog
  c.mouth.fillEllipse(-8, -36, 13, 5); c.mouth.fillEllipse(8, -36, 13, 5);
  c.mouth.lineStyle(3.5, 0x2b2f34, 1);
  c.mouth.beginPath(); c.mouth.arc(0, -32, 10, 0.12 * Math.PI, 0.88 * Math.PI); c.mouth.strokePath();
  // blosjes op het kegel-lijf
  c.bodyG.fillStyle(0xf08a8a, 0.6);
  c.bodyG.fillEllipse(-22, -40, 13, 8); c.bodyG.fillEllipse(22, -40, 13, 8);
}

// Bowlingbal (projectiel van de Kegel-Koning): rolt zwaar over de grond.
export function drawBowlingBal(scene, x, y) {
  const c = scene.add.container(x, y).setDepth(8);
  const inner = scene.add.container(0, -16);
  const g = scene.add.graphics();
  g.fillStyle(0x2b4a8a, 1); g.fillCircle(0, 0, 15);
  g.fillStyle(0x3f63a8, 1); g.fillCircle(-4, -4, 9);
  g.fillStyle(0x16202b, 1); g.fillCircle(-3, -3, 2.2); g.fillCircle(4, -3, 2.2); g.fillCircle(0, 4, 2.2);
  g.fillStyle(0xffffff, 0.3); g.fillEllipse(-6, -7, 7, 4);
  g.lineStyle(2.5, 0x1c3260, 1); g.strokeCircle(0, 0, 15);
  inner.add(g);
  c.add(inner);
  scene.tweens.add({ targets: inner, angle: -360, duration: 700, repeat: -1 });
  return c;
}

// ===== REKEN-REX (Wereld 15, Dino-Dal) =====
// Een grote groene T-rex met piepkleine armpjes die rollende dino-eieren
// op je afstuurt. Stijl 'sprong': hij doet sprongen over de getallenlijn —
// reken uit waar hij landt en raak het goede bot-bord.
export function drawRexBoss(scene, x, groundY) {
  const c = scene.add.container(x, groundY - 78).setDepth(7);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.18); g.fillEllipse(0, 82, 130, 20);
  // staart
  g.fillStyle(0x57944a, 1);
  g.fillTriangle(-38, 26, -104, 52, -34, 56);
  // lijf + poten
  g.fillEllipse(0, 26, 84, 88);
  g.fillStyle(0x477a3c, 1);
  g.fillRoundedRect(-30, 56, 22, 24, 8); g.fillRoundedRect(8, 56, 22, 24, 8);
  // buik
  g.fillStyle(0xd9e8a8, 0.85); g.fillEllipse(4, 34, 46, 56);
  // kop met grote kaak
  g.fillStyle(0x57944a, 1);
  g.fillEllipse(18, -44, 74, 46);
  g.fillRoundedRect(22, -34, 44, 20, 8); // onderkaak
  // tandjes (vriendelijk stomp)
  g.fillStyle(0xffffff, 1);
  for (let i = 0; i < 4; i++) g.fillTriangle(30 + i * 9, -24, 38 + i * 9, -24, 34 + i * 9, -17);
  // piepkleine armpjes
  g.lineStyle(6, 0x477a3c, 1);
  g.beginPath(); g.moveTo(28, 6); g.lineTo(42, 12); g.strokePath();
  g.beginPath(); g.moveTo(24, 16); g.lineTo(36, 24); g.strokePath();
  // rug-plaatjes
  g.fillStyle(0x2f6a33, 1);
  for (let i = 0; i < 4; i++) g.fillTriangle(-30 + i * 16, -12 - i * 4, -16 + i * 16, -14 - i * 4, -23 + i * 16, -28 - i * 4);
  c.add(g);
  c.bodyG = g;
  // boze oogjes + wenkbrauwen
  const eL = scene.add.circle(2, -52, 8, 0xffffff).setStrokeStyle(2.5, 0x2b2f34);
  const eR = scene.add.circle(24, -54, 8, 0xffffff).setStrokeStyle(2.5, 0x2b2f34);
  const pL = scene.add.circle(4, -51, 3.2, 0x222222), pR = scene.add.circle(26, -53, 3.2, 0x222222);
  const br = scene.add.graphics(); br.lineStyle(3.5, 0x2f4a26, 1);
  br.beginPath(); br.moveTo(-6, -63); br.lineTo(9, -58); br.strokePath();
  br.beginPath(); br.moveTo(33, -64); br.lineTo(19, -60); br.strokePath();
  const m = scene.add.graphics();
  c.add([eL, eR, pL, pR, br, m]);
  c.brow = br; c.mouth = m;

  const bub = scene.add.container(0, -136);
  const bg = scene.add.graphics(); bg.fillStyle(0xffffff, 1); bg.lineStyle(3, 0x16202b, 1);
  bg.fillRoundedRect(-42, -24, 84, 44, 12); bg.strokeRoundedRect(-42, -24, 84, 44, 12); bg.fillTriangle(-6, 18, 6, 18, 0, 30);
  const wn = scene.add.text(0, -2, '', { fontFamily: 'Arial Black, Arial', fontSize: '24px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
  bub.add([bg, wn]); c.add(bub); c.bubble = bub; c.bubbleText = wn;
  scene.tweens.add({ targets: bub, scale: 1.08, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  scene.tweens.add({ targets: c, y: c.y - 6, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return c;
}

// Getemd: blije rex met blosjes en een bloemetje in zijn bek.
export function happyRexBoss(scene, c) {
  c.brow.clear();
  c.mouth.clear();
  c.mouth.fillStyle(0xf08a8a, 0.6);
  c.mouth.fillEllipse(-8, -40, 14, 9); c.mouth.fillEllipse(40, -42, 12, 8);
  // een bloemetje in de bek
  c.mouth.fillStyle(0x4fae4a, 1); c.mouth.fillRect(52, -30, 3, 12);
  c.mouth.fillStyle(0xff6b9d, 1);
  for (let a = 0; a < 5; a++) {
    const ang = -Math.PI / 2 + a * (2 * Math.PI / 5);
    c.mouth.fillCircle(53 + Math.cos(ang) * 5, -34 + Math.sin(ang) * 5, 3);
  }
  c.mouth.fillStyle(0xffe16b, 1); c.mouth.fillCircle(53, -34, 2.6);
}

// Dino-ei (projectiel van Reken-Rex): een gespikkeld ei dat voorbij rolt.
export function drawDinoEi(scene, x, y) {
  const c = scene.add.container(x, y).setDepth(8);
  const inner = scene.add.container(0, -16);
  const g = scene.add.graphics();
  g.fillStyle(0xf3ead2, 1); g.fillEllipse(0, 0, 26, 32);
  g.fillStyle(0x9ab86a, 0.8);
  g.fillCircle(-5, -6, 4); g.fillCircle(6, 2, 3.4); g.fillCircle(-2, 9, 2.8);
  g.lineStyle(2, 0xc9b88a, 1); g.strokeEllipse(0, 0, 26, 32);
  inner.add(g);
  c.add(inner);
  scene.tweens.add({ targets: inner, angle: -360, duration: 800, repeat: -1 });
  return c;
}

// Bot-bord (keuze-art voor stijl 'sprong'): een bot met het getal erop.
export function drawBotBord(scene, x, y, waarde) {
  const c = scene.add.container(x, y).setDepth(6);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.12); g.fillEllipse(0, 26, 46, 8);
  g.fillStyle(0xf3ead2, 1);
  g.fillRoundedRect(-20, -9, 40, 18, 9);
  [[-20, -9], [-20, 9], [20, -9], [20, 9]].forEach(([bx, by]) => g.fillCircle(bx, by, 8));
  g.lineStyle(2, 0xc9b88a, 1); g.strokeRoundedRect(-20, -9, 40, 18, 9);
  c.add(g);
  c.add(scene.add.text(0, 0, `${waarde}`, {
    fontFamily: 'Arial Black, Arial', fontSize: '17px', fontStyle: 'bold', color: '#5d4426',
  }).setOrigin(0.5));
  scene.tweens.add({ targets: c, y: y - 9, duration: 900 + (waarde % 3) * 160, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  c.waarde = waarde; c.spawnY = y; c.taken = false;
  return c;
}

// ===== BARON TIK-TAK (Wereld 16, de Klokken-Toren) =====
// Een norse staande klok met een snor die de tijd heeft stilgezet en
// zoevende wijzertjes gooit. Stijl 'klok': raak de klok die de gevraagde
// tijd toont ("4 uur", "half 8") — dan tikt hij weer een fase verder.
export function drawTikTakBoss(scene, x, groundY) {
  const c = scene.add.container(x, groundY - 84).setDepth(7);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.18); g.fillEllipse(0, 88, 110, 20);
  // de staande-klok-kast
  g.fillStyle(0x6e5436, 1); g.fillRoundedRect(-36, -66, 72, 150, 12);
  g.fillStyle(0x8a6a45, 1); g.fillRoundedRect(-36, -66, 72, 18, 10);
  g.fillRoundedRect(-42, 74, 84, 12, 5); // voet
  g.lineStyle(3.5, 0x4a3a26, 1); g.strokeRoundedRect(-36, -66, 72, 150, 12);
  // het slinger-raam in zijn buik (de slinger-tween hangt eronder)
  g.fillStyle(0x3a2c1c, 1); g.fillRoundedRect(-20, 10, 40, 58, 8);
  c.add(g);
  c.bodyG = g;
  const slinger = scene.add.container(0, 14);
  const sg = scene.add.graphics();
  sg.lineStyle(3, 0xd9ad55, 1); sg.beginPath(); sg.moveTo(0, 0); sg.lineTo(0, 40); sg.strokePath();
  sg.fillStyle(0xf6c624, 1); sg.fillCircle(0, 44, 9);
  slinger.add(sg);
  c.add(slinger);
  scene.tweens.add({ targets: slinger, angle: { from: -16, to: 16 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  // de wijzerplaat als GEZICHT
  const plaat = scene.add.graphics();
  plaat.fillStyle(0xf3e8d0, 1); plaat.fillCircle(0, -34, 30);
  plaat.lineStyle(3, 0xb98d3a, 1); plaat.strokeCircle(0, -34, 30);
  for (let a = 0; a < 12; a++) {
    const ang = (a / 12) * Math.PI * 2;
    plaat.fillStyle(0x6e5436, 1);
    plaat.fillCircle(Math.cos(ang) * 24, -34 + Math.sin(ang) * 24, 1.8);
  }
  c.add(plaat);
  const eL = scene.add.circle(-11, -40, 6.5, 0xffffff).setStrokeStyle(2.2, 0x2b2f34);
  const eR = scene.add.circle(11, -40, 6.5, 0xffffff).setStrokeStyle(2.2, 0x2b2f34);
  const pL = scene.add.circle(-10, -39, 2.6, 0x222222), pR = scene.add.circle(12, -39, 2.6, 0x222222);
  const br = scene.add.graphics(); br.lineStyle(3, 0x2b2f34, 1);
  br.beginPath(); br.moveTo(-18, -50); br.lineTo(-5, -46); br.strokePath();
  br.beginPath(); br.moveTo(18, -50); br.lineTo(5, -46); br.strokePath();
  const m = scene.add.graphics();
  m.fillStyle(0x4a3a26, 1); // de wijzer-snor (staat stil op tien voor twee)
  m.fillEllipse(-9, -25, 15, 5); m.fillEllipse(9, -25, 15, 5);
  m.lineStyle(2.6, 0x2b2f34, 1);
  m.beginPath(); m.arc(0, -19, 5, 1.2 * Math.PI, 1.9 * Math.PI); m.strokePath();
  c.add([eL, eR, pL, pR, br, m]);
  c.brow = br; c.mouth = m;

  const bub = scene.add.container(0, -132);
  const bg = scene.add.graphics(); bg.fillStyle(0xffffff, 1); bg.lineStyle(3, 0x16202b, 1);
  bg.fillRoundedRect(-46, -24, 92, 44, 12); bg.strokeRoundedRect(-46, -24, 92, 44, 12); bg.fillTriangle(-6, 18, 6, 18, 0, 30);
  const wn = scene.add.text(0, -2, '', { fontFamily: 'Arial Black, Arial', fontSize: '20px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
  bub.add([bg, wn]); c.add(bub); c.bubble = bub; c.bubbleText = wn;
  scene.tweens.add({ targets: bub, scale: 1.08, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  scene.tweens.add({ targets: c, y: c.y - 6, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return c;
}

// De tijd tikt weer: krul-snor, lach en een koekoeksvogeltje bovenop.
export function happyTikTakBoss(scene, c) {
  c.brow.clear();
  c.mouth.clear();
  c.mouth.fillStyle(0x4a3a26, 1);
  c.mouth.fillEllipse(-10, -27, 15, 4.5); c.mouth.fillEllipse(10, -27, 15, 4.5);
  c.mouth.lineStyle(3, 0x2b2f34, 1);
  c.mouth.beginPath(); c.mouth.arc(0, -24, 8, 0.12 * Math.PI, 0.88 * Math.PI); c.mouth.strokePath();
  // het koekoeksvogeltje wipt tevoorschijn
  c.mouth.fillStyle(0xf6c624, 1); c.mouth.fillEllipse(0, -76, 16, 12);
  c.mouth.fillCircle(7, -80, 6);
  c.mouth.fillStyle(0xf07c1f, 1); c.mouth.fillTriangle(12, -80, 18, -79, 12, -77);
  c.mouth.fillStyle(0x16202b, 1); c.mouth.fillCircle(8, -81, 1.4);
  // blosjes op de wijzerplaat
  c.mouth.fillStyle(0xf08a8a, 0.6);
  c.mouth.fillEllipse(-20, -30, 10, 6); c.mouth.fillEllipse(20, -30, 10, 6);
}

// Zoevend wijzertje (projectiel van Baron Tik-Tak).
export function drawWijzertje(scene, x, y) {
  const c = scene.add.container(x, y).setDepth(8);
  const inner = scene.add.container(0, -16);
  const g = scene.add.graphics();
  g.fillStyle(0x2b2f34, 1);
  g.fillTriangle(-16, 4, -16, -4, 18, 0);
  g.fillCircle(-14, 0, 6);
  g.fillStyle(0xf6c624, 1); g.fillCircle(-14, 0, 3);
  inner.add(g);
  c.add(inner);
  scene.tweens.add({ targets: inner, angle: -360, duration: 500, repeat: -1 });
  return c;
}

// Klok-bord (keuze-art voor stijl 'klok'): een analoge klok die 'waarde'
// toont — hele uren (4) of halve (7.5 = half 8). De grote wijzer wijst
// omhoog (heel uur) of omlaag (half), de kleine staat (tussen de) uren.
export function drawKlokKeuze(scene, x, y, waarde) {
  const c = scene.add.container(x, y).setDepth(6);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.12); g.fillEllipse(0, 30, 46, 8);
  g.fillStyle(0x8a6a45, 1); g.fillCircle(0, 0, 27);
  g.fillStyle(0xf3e8d0, 1); g.fillCircle(0, 0, 23);
  for (let a = 0; a < 12; a++) {
    const ang = (a / 12) * Math.PI * 2 - Math.PI / 2;
    const groot = a % 3 === 0;
    g.fillStyle(0x6e5436, 1);
    g.fillCircle(Math.cos(ang) * 18.5, Math.sin(ang) * 18.5, groot ? 2.2 : 1.3);
  }
  c.add(g);
  // 12 bovenaan als anker voor beginnende klok-kijkers
  c.add(scene.add.text(0, -13, '12', { fontFamily: 'Arial', fontSize: '8px', fontStyle: 'bold', color: '#6e5436' }).setOrigin(0.5));
  const wijzers = scene.add.graphics();
  const half = waarde % 1 !== 0;
  const uurAng = ((waarde % 12) / 12) * Math.PI * 2 - Math.PI / 2;
  wijzers.lineStyle(3.5, 0x2b2f34, 1); // kleine wijzer (uur)
  wijzers.beginPath(); wijzers.moveTo(0, 0); wijzers.lineTo(Math.cos(uurAng) * 10, Math.sin(uurAng) * 10); wijzers.strokePath();
  wijzers.lineStyle(2.4, 0xd94f3f, 1); // grote wijzer: omhoog (heel) of omlaag (half)
  wijzers.beginPath(); wijzers.moveTo(0, 0); wijzers.lineTo(0, half ? 17 : -17); wijzers.strokePath();
  wijzers.fillStyle(0x2b2f34, 1); wijzers.fillCircle(0, 0, 2.6);
  c.add(wijzers);
  scene.tweens.add({ targets: c, y: y - 9, duration: 900 + (Math.round(waarde) % 3) * 160, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  c.waarde = waarde; c.spawnY = y; c.taken = false;
  return c;
}

// ===== DE STERKE MAN (Wereld 17, het Circus-Kanon) =====
// Een goedmoedige krachtpatser in een gestreept hemd met een reuzen-halter.
// Stijl 'balans': maak zijn halter aan jouw kant PRECIES even zwaar met
// schijven van 1/2/5 — dan tilt hij hem, wankelt, en verliest een fase.
export function drawSterkeManBoss(scene, x, groundY) {
  const c = scene.add.container(x, groundY - 72).setDepth(7);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.18); g.fillEllipse(0, 76, 120, 20);
  // benen in een stevige spreidstand
  g.fillStyle(0x3a5a8a, 1);
  g.fillRoundedRect(-30, 34, 22, 40, 8); g.fillRoundedRect(8, 34, 22, 40, 8);
  g.fillStyle(0x2b2f34, 1); g.fillEllipse(-19, 74, 30, 10); g.fillEllipse(19, 74, 30, 10);
  // het gestreepte krachtpatser-hemd
  g.fillStyle(0xf3e8d0, 1); g.fillRoundedRect(-34, -26, 68, 64, 16);
  g.fillStyle(0xd94f3f, 1);
  for (let ry = -18; ry < 34; ry += 16) g.fillRect(-34, ry, 68, 8);
  // dikke armen omhoog (klaar om te tillen)
  g.lineStyle(13, 0xe8b88a, 1);
  g.beginPath(); g.moveTo(-30, -14); g.lineTo(-52, -48); g.strokePath();
  g.beginPath(); g.moveTo(30, -14); g.lineTo(52, -48); g.strokePath();
  g.fillStyle(0xe8b88a, 1); g.fillCircle(-53, -52, 8); g.fillCircle(53, -52, 8);
  // hoofd met kaal kruintje en één plukje
  g.fillCircle(0, -46, 22);
  g.fillStyle(0x6e4a2c, 1); g.fillEllipse(0, -66, 10, 5);
  c.add(g);
  c.bodyG = g;
  // vastberaden gezicht + krul-snor
  const eL = scene.add.circle(-8, -50, 6, 0xffffff).setStrokeStyle(2.2, 0x2b2f34);
  const eR = scene.add.circle(8, -50, 6, 0xffffff).setStrokeStyle(2.2, 0x2b2f34);
  const pL = scene.add.circle(-7, -49, 2.4, 0x222222), pR = scene.add.circle(9, -49, 2.4, 0x222222);
  const br = scene.add.graphics(); br.lineStyle(3, 0x6e4a2c, 1);
  br.beginPath(); br.moveTo(-14, -59); br.lineTo(-3, -56); br.strokePath();
  br.beginPath(); br.moveTo(14, -59); br.lineTo(3, -56); br.strokePath();
  const m = scene.add.graphics();
  m.fillStyle(0x6e4a2c, 1); // de krul-snor
  m.fillEllipse(-8, -38, 13, 5); m.fillEllipse(8, -38, 13, 5);
  m.fillCircle(-15, -40, 3); m.fillCircle(15, -40, 3);
  c.add([eL, eR, pL, pR, br, m]);
  c.brow = br; c.mouth = m;

  const bub = scene.add.container(0, -124);
  const bg = scene.add.graphics(); bg.fillStyle(0xffffff, 1); bg.lineStyle(3, 0x16202b, 1);
  bg.fillRoundedRect(-38, -24, 76, 44, 12); bg.strokeRoundedRect(-38, -24, 76, 44, 12); bg.fillTriangle(-6, 18, 6, 18, 0, 30);
  const wn = scene.add.text(0, -2, '', { fontFamily: 'Arial Black, Arial', fontSize: '24px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
  bub.add([bg, wn]); c.add(bub); c.bubble = bub; c.bubbleText = wn;
  scene.tweens.add({ targets: bub, scale: 1.08, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  scene.tweens.add({ targets: c, y: c.y - 6, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return c;
}

// Hij buigt als een echte artiest: krul-snor omhoog, brede lach, blosjes.
export function happySterkeManBoss(scene, c) {
  c.brow.clear();
  c.mouth.clear();
  c.mouth.fillStyle(0x6e4a2c, 1);
  c.mouth.fillEllipse(-8, -40, 13, 5); c.mouth.fillEllipse(8, -40, 13, 5);
  c.mouth.fillCircle(-15, -44, 3); c.mouth.fillCircle(15, -44, 3); // de snor krult omhoog
  c.mouth.lineStyle(3, 0x2b2f34, 1);
  c.mouth.beginPath(); c.mouth.arc(0, -36, 8, 0.12 * Math.PI, 0.88 * Math.PI); c.mouth.strokePath();
  c.mouth.fillStyle(0xf08a8a, 0.6);
  c.mouth.fillEllipse(-17, -44, 10, 6); c.mouth.fillEllipse(17, -44, 10, 6);
}

// Stuiterende kettlebell (projectiel van De Sterke Man).
export function drawKettlebell(scene, x, y) {
  const c = scene.add.container(x, y).setDepth(8);
  const inner = scene.add.container(0, -16);
  const g = scene.add.graphics();
  g.fillStyle(0x4a4f55, 1); g.fillCircle(0, 3, 13);
  g.lineStyle(4.5, 0x4a4f55, 1);
  g.beginPath(); g.arc(0, -8, 8, Math.PI, 2 * Math.PI); g.strokePath();
  g.fillStyle(0x6a7078, 1); g.fillEllipse(-4, -1, 7, 9);
  inner.add(g);
  inner.add(scene.add.text(0, 3, '5', { fontFamily: 'Arial Black, Arial', fontSize: '11px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5));
  c.add(inner);
  scene.tweens.add({ targets: inner, angle: { from: -20, to: 20 }, duration: 300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return c;
}
