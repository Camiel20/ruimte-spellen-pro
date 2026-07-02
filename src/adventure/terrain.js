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
