// ===== TERREIN & DECOR: lucht, water, platforms en grond-thema's =====
// Puur visueel + statische physics-platforms. Het grond-thema komt uit de
// leveldata (`terrain: 'zand'` → strand; anders gras) — nieuwe werelden
// krijgen hier hun eigen look zonder engine-wijzigingen elders.

import Phaser from 'phaser';
import { lighten, darker } from './palette.js';

export function buildBackground(scene, L) {
  const sky = scene.add.graphics().setDepth(-30).setScrollFactor(0);
  sky.fillGradientStyle(L.bg.top, L.bg.top, L.bg.bottom, L.bg.bottom, 1);
  sky.fillRect(0, 0, scene.scale.width, scene.scale.height);

  if (L.terrain === 'ruimte') {
    // RUIMTE (Wereld 5): fonkelsterren, een maan en verre planeetjes i.p.v.
    // zon en wolken; paarse nevel-slierten driften mee als "wolken".
    const stars = scene.add.graphics().setDepth(-28).setScrollFactor(0.15);
    for (let i = 0; i < 70; i++) {
      const sx = Math.random() * (scene.scale.width + 200) - 100;
      const sy = Math.random() * 540;
      stars.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.35, 0.95));
      stars.fillCircle(sx, sy, Math.random() < 0.15 ? 2.2 : 1.3);
    }
    scene.tweens.add({ targets: stars, alpha: 0.55, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const moon = scene.add.container(scene.scale.width - 80, 100).setDepth(-27).setScrollFactor(0.25);
    const mg = scene.add.graphics();
    mg.fillStyle(0xfff3b0, 0.16); mg.fillCircle(0, 0, 52);
    mg.fillStyle(0xe8e4f0, 1); mg.fillCircle(0, 0, 34);
    mg.fillStyle(0xc9c4d8, 0.85); mg.fillCircle(-10, -6, 7); mg.fillCircle(12, 8, 5); mg.fillCircle(4, -15, 4);
    moon.add(mg);
    // verre planeetjes met een ring
    [[88, 214, 14, 0xf28ba8], [300, 138, 10, 0x7fd0f0]].forEach(([px, py, r, col]) => {
      const pg = scene.add.graphics().setDepth(-27).setScrollFactor(0.2);
      pg.fillStyle(col, 0.9); pg.fillCircle(px, py, r);
      pg.lineStyle(2.5, lighten(col, 40), 0.8); pg.strokeEllipse(px, py + 2, r * 2.6, r * 0.9);
    });
    scene.clouds = [];
    for (let i = 0; i < 5; i++) {
      const x = (i / 5) * L.worldW + Phaser.Math.Between(-40, 40);
      const y = Phaser.Math.Between(90, 300);
      const c = scene.add.container(x, y).setDepth(-26).setScrollFactor(0.5).setAlpha(0.35);
      const g = scene.add.graphics();
      g.fillStyle(0x8f86c8, 0.7);
      [[-30, 2, 16], [-4, -6, 22], [20, 2, 17], [40, 8, 11]].forEach(([cx, cy, r]) => g.fillCircle(cx, cy, r));
      c.add(g);
      c.driftSpeed = Phaser.Math.FloatBetween(3, 8);
      scene.clouds.push(c);
    }
    const kraters = scene.add.graphics().setDepth(-26).setScrollFactor(0.35);
    kraters.fillStyle(darker(L.bg.bottom, 25), 0.8);
    for (let x = -100; x < scene.scale.width + 200; x += 180) kraters.fillCircle(x, scene.scale.height, 150);
    return;
  }

  // Zon (licht parallax)
  const sun = scene.add.container(scene.scale.width - 70, 90).setDepth(-28).setScrollFactor(0.25);
  const glow = scene.add.circle(0, 0, 54, 0xfff3b0, 0.35);
  sun.add([glow, scene.add.circle(0, 0, 32, 0xffe16b)]);
  scene.tweens.add({ targets: glow, scale: 1.18, alpha: 0.5, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

  // Wolkjes (parallax) verspreid over de wereldbreedte — scene.clouds driften in update()
  scene.clouds = [];
  for (let i = 0; i < 8; i++) {
    const x = (i / 8) * L.worldW + Phaser.Math.Between(-40, 40);
    const y = Phaser.Math.Between(70, 260);
    const s = Phaser.Math.FloatBetween(0.7, 1.3);
    const c = scene.add.container(x, y).setDepth(-27).setScale(s).setScrollFactor(0.5);
    const g = scene.add.graphics();
    g.fillStyle(0xffffff, 0.9);
    [[-26, 4, 17], [-6, -8, 23], [16, 0, 20], [34, 7, 14], [4, 11, 26]].forEach(([cx, cy, r]) => g.fillCircle(cx, cy, r));
    c.add(g);
    c.driftSpeed = Phaser.Math.FloatBetween(4, 11);
    scene.clouds.push(c);
  }

  // Verre heuvels (parallax) voor diepte
  const hills = scene.add.graphics().setDepth(-26).setScrollFactor(0.35);
  hills.fillStyle(darker(L.bg.bottom, 20), 0.7);
  for (let x = -100; x < scene.scale.width + 200; x += 180) hills.fillCircle(x, scene.scale.height, 150);
}

// Water is alleen visueel: vallen in zee wordt door killY/respawn afgehandeld.
export function buildWater(scene, L) {
  (L.water || []).forEach(([x, y, w, h]) => {
    const g = scene.add.graphics().setDepth(-14);
    g.fillStyle(0x3fa9e0, 1); g.fillRect(x, y, w, h);
    g.fillStyle(0x7fd0f0, 0.5);
    for (let wx = x; wx < x + w; wx += 42) g.fillEllipse(wx + 21, y + 12, 26, 8);
    g.fillStyle(0xffffff, 0.25);
    for (let wx = x; wx < x + w; wx += 60) g.fillEllipse(wx + 30, y + 26, 18, 5);
    scene.tweens.add({ targets: g, alpha: 0.82, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  });
}

// Statische platform-bodies (onzichtbaar) + getekende grond erbovenop.
export function buildPlatforms(scene, L) {
  scene.platforms = scene.physics.add.staticGroup();
  L.platforms.forEach(([x, y, w, h]) => {
    const plat = scene.add.rectangle(x + w / 2, y + h / 2, w, h, 0x000000, 0);
    scene.physics.add.existing(plat, true);
    scene.platforms.add(plat);
    drawGround(scene, x, y, w, h);
  });
}

export function drawGround(scene, x, y, w, h) {
  const g = scene.add.graphics().setDepth(-10);
  if (scene.level.terrain === 'zand') {
    // STRAND: warm zand met een lichte toplaag, schelpjes en zeesterren.
    g.fillStyle(0xe3bd76, 1); g.fillRect(x, y + 12, w, h - 12);
    g.fillStyle(0xd2ab64, 0.6);
    for (let ex = x + 12; ex < x + w; ex += 46) g.fillEllipse(ex, y + 34, 16, 8);
    g.fillStyle(0xf3dc9a, 1); g.fillRect(x, y, w, 16);
    g.fillStyle(0xfae9b8, 1); g.fillRect(x, y, w, 6);
    // schelpje (wit waaiertje) en zeester (roze) om en om
    let toggle = false;
    for (let fx = x + 44; fx < x + w - 24; fx += 120) {
      toggle = !toggle;
      if (toggle) {
        g.fillStyle(0xfff6e8, 1); g.slice(fx, y - 2, 6, Math.PI, 0, false); g.fillPath();
        g.lineStyle(1.5, 0xd2ab64, 1);
        g.beginPath(); g.moveTo(fx, y - 2); g.lineTo(fx - 3, y - 7); g.strokePath();
        g.beginPath(); g.moveTo(fx, y - 2); g.lineTo(fx + 3, y - 7); g.strokePath();
      } else {
        g.fillStyle(0xf28ba8, 1);
        for (let a = 0; a < 5; a++) {
          const ang = -Math.PI / 2 + a * (2 * Math.PI / 5);
          g.fillEllipse(fx + Math.cos(ang) * 4, y - 5 + Math.sin(ang) * 4, 4, 4);
        }
        g.fillCircle(fx, y - 5, 3);
      }
    }
  } else if (scene.level.terrain === 'berg') {
    // BERG (Wereld 4): grijze rots met een lichte rand, kiezels en kristallen.
    g.fillStyle(0x7d838c, 1); g.fillRect(x, y + 12, w, h - 12);
    g.fillStyle(0x6a7078, 0.7);
    for (let ex = x + 12; ex < x + w; ex += 46) g.fillEllipse(ex, y + 34, 16, 8);
    g.fillStyle(0x9aa0a6, 1); g.fillRect(x, y, w, 16);
    g.fillStyle(0xb9bfc6, 1); g.fillRect(x, y, w, 6);
    // scheurtjes in de rotsrand
    g.lineStyle(2, 0x6a7078, 0.7);
    for (let bx = x + 24; bx < x + w - 10; bx += 64) {
      g.beginPath(); g.moveTo(bx, y + 4); g.lineTo(bx + 8, y + 13); g.strokePath();
    }
    // om en om: paars kristal en kiezelsteentjes
    let berg = false;
    for (let fx = x + 50; fx < x + w - 30; fx += 150) {
      berg = !berg;
      if (berg) {
        g.fillStyle(0x9b6dd6, 1);
        g.fillTriangle(fx - 8, y, fx - 1, y, fx - 5, y - 18);
        g.fillTriangle(fx - 2, y, fx + 8, y, fx + 3, y - 26);
        g.fillStyle(0xc9aef0, 0.9);
        g.fillTriangle(fx + 1, y, fx + 5, y, fx + 3, y - 22);
      } else {
        g.fillStyle(0x6a7078, 1); g.fillEllipse(fx - 6, y - 3, 10, 7);
        g.fillStyle(0x8a9098, 1); g.fillEllipse(fx + 5, y - 4, 12, 8);
      }
    }
  } else if (scene.level.terrain === 'ruimte') {
    // RUIMTE (Wereld 5): paarsgrijze maanrots met kraters in de toplaag,
    // fonkelkristallen en kleine ruimte-vlaggetjes.
    g.fillStyle(0x565273, 1); g.fillRect(x, y + 12, w, h - 12);
    g.fillStyle(0x474463, 0.7);
    for (let ex = x + 12; ex < x + w; ex += 46) g.fillEllipse(ex, y + 34, 16, 8);
    g.fillStyle(0x8a86ad, 1); g.fillRect(x, y, w, 16);
    g.fillStyle(0xa8a4c8, 1); g.fillRect(x, y, w, 6);
    // kratertjes in de toplaag
    for (let bx = x + 34; bx < x + w - 18; bx += 96) {
      g.fillStyle(0x6e6a8f, 1); g.fillEllipse(bx, y + 11, 18, 7);
      g.fillStyle(0x565273, 0.85); g.fillEllipse(bx, y + 10, 12, 4);
    }
    // om en om: fonkelkristal (zeegroen) en een klein ruimte-vlaggetje
    let ruimte = false;
    for (let fx = x + 50; fx < x + w - 30; fx += 150) {
      ruimte = !ruimte;
      if (ruimte) {
        g.fillStyle(0x4fd6c2, 1);
        g.fillTriangle(fx - 7, y, fx + 1, y, fx - 3, y - 16);
        g.fillTriangle(fx - 1, y, fx + 8, y, fx + 4, y - 22);
        g.fillStyle(0x9df0e2, 0.9); g.fillTriangle(fx + 1, y, fx + 6, y, fx + 4, y - 18);
      } else {
        g.fillStyle(0xcfd6dd, 1); g.fillRect(fx - 1, y - 20, 2, 20);
        g.fillStyle(0xffe16b, 1); g.fillTriangle(fx + 1, y - 20, fx + 1, y - 11, fx + 13, y - 16);
      }
    }
  } else if (scene.level.terrain === 'bos') {
    // BOS (Wereld 3): donkere aarde + mos-toplaag, paddenstoelen en boompjes.
    g.fillStyle(0x6e4a2c, 1); g.fillRect(x, y + 12, w, h - 12);
    g.fillStyle(0x5d3e24, 0.6);
    for (let ex = x + 12; ex < x + w; ex += 46) g.fillEllipse(ex, y + 34, 16, 8);
    g.fillStyle(0x3f8d3f, 1); g.fillRect(x, y, w, 16);
    g.fillStyle(0x57a94f, 1); g.fillRect(x, y, w, 6);
    g.fillStyle(0x2f7d33, 1);
    for (let bx = x + 6; bx < x + w; bx += 16) g.fillTriangle(bx, y, bx + 5, y, bx + 2.5, y - 6);
    // om en om: paddenstoel en dennenboompje
    let bos = false;
    for (let fx = x + 50; fx < x + w - 30; fx += 150) {
      bos = !bos;
      if (bos) {
        g.fillStyle(0xf5efe2, 1); g.fillRoundedRect(fx - 3, y - 12, 6, 12, 2);
        g.fillStyle(0xe8402c, 1); g.slice(fx, y - 11, 9, Math.PI, 0, false); g.fillPath();
        g.fillStyle(0xffffff, 1); g.fillCircle(fx - 3, y - 14, 1.6); g.fillCircle(fx + 3, y - 15, 1.6);
      } else {
        g.fillStyle(0x8a5a33, 1); g.fillRect(fx - 3, y - 16, 6, 16);
        g.fillStyle(0x2f7d33, 1);
        g.fillTriangle(fx - 14, y - 12, fx + 14, y - 12, fx, y - 34);
        g.fillTriangle(fx - 11, y - 24, fx + 11, y - 24, fx, y - 44);
      }
    }
  } else {
    // GRAS (Wereld 1): aarde + groene toplaag met sprietjes en bloemetjes.
    g.fillStyle(0xb07a45, 1); g.fillRect(x, y + 12, w, h - 12);
    g.fillStyle(0x9c6b3f, 0.6);
    for (let ex = x + 12; ex < x + w; ex += 46) g.fillEllipse(ex, y + 34, 16, 8);
    g.fillStyle(0x57b947, 1); g.fillRect(x, y, w, 16);
    g.fillStyle(lighten(0x57b947, 22), 1); g.fillRect(x, y, w, 6);
    g.fillStyle(0x3f9d3f, 1);
    for (let bx = x + 6; bx < x + w; bx += 16) g.fillTriangle(bx, y, bx + 5, y, bx + 2.5, y - 6);
    for (let fx = x + 40; fx < x + w - 20; fx += 130) {
      g.fillStyle(0xff6b9d, 1); g.fillCircle(fx, y - 10, 3);
      g.fillStyle(0xffe16b, 1); g.fillCircle(fx, y - 10, 1.4);
    }
  }
}
