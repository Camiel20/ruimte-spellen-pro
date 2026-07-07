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

  if (L.terrain === 'fort') {
    // HET GRAUWE FORT (Wereld 6): onweerslucht, verre fort-torens en trage
    // grauwe wolken. Geen zon — die heeft Baron Grauw weggejaagd.
    const torens = scene.add.graphics().setDepth(-27).setScrollFactor(0.3);
    torens.fillStyle(0x3f3b48, 0.9);
    [[40, 300, 70], [150, 380, 90], [300, 340, 80], [420, 400, 100]].forEach(([tx, th, tw]) => {
      torens.fillRect(tx, scene.scale.height - th - 140, tw, th + 140);
      for (let k = 0; k < tw; k += 18) torens.fillRect(tx + k, scene.scale.height - th - 156, 10, 18); // kantelen
    });
    // verlichte raampjes
    torens.fillStyle(0xffe16b, 0.5);
    [[70, 320], [190, 390], [330, 360], [460, 420]].forEach(([wx, wy]) => torens.fillRect(wx, scene.scale.height - wy, 10, 14));
    scene.clouds = [];
    for (let i = 0; i < 6; i++) {
      const x = (i / 6) * L.worldW + Phaser.Math.Between(-40, 40);
      const y = Phaser.Math.Between(60, 260);
      const c = scene.add.container(x, y).setDepth(-26).setScrollFactor(0.5).setAlpha(0.55);
      const g = scene.add.graphics();
      g.fillStyle(0x565b61, 0.9);
      [[-26, 4, 17], [-6, -8, 23], [16, 0, 20], [34, 7, 14]].forEach(([cx, cy, r]) => g.fillCircle(cx, cy, r));
      c.add(g);
      c.driftSpeed = Phaser.Math.FloatBetween(6, 14);
      scene.clouds.push(c);
    }
    return;
  }

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

  if (L.terrain === 'pizza') {
    // PIZZA-VULKAAN (Wereld 7): warme lucht, in de verte de grote rokende
    // pizza-oven-vulkaan, en drijvende kaas-wolkjes.
    const zon = scene.add.container(scene.scale.width - 70, 90).setDepth(-28).setScrollFactor(0.25);
    const zg = scene.add.circle(0, 0, 54, 0xffe9a8, 0.4);
    zon.add([zg, scene.add.circle(0, 0, 32, 0xffd24d)]);
    scene.tweens.add({ targets: zg, scale: 1.18, alpha: 0.55, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // de Pizza-Vulkaan zelf: een afgeplatte korst-berg met borrelende saus-krater
    const vulkaan = scene.add.graphics().setDepth(-27).setScrollFactor(0.3);
    const vx = 130, vb = scene.scale.height - 140;
    vulkaan.fillStyle(0xc98a3d, 0.95);
    vulkaan.beginPath();
    vulkaan.moveTo(vx - 150, vb); vulkaan.lineTo(vx - 44, vb - 280);
    vulkaan.lineTo(vx + 44, vb - 280); vulkaan.lineTo(vx + 150, vb);
    vulkaan.closePath(); vulkaan.fillPath();
    vulkaan.fillStyle(0xdca050, 0.9);
    vulkaan.beginPath();
    vulkaan.moveTo(vx - 116, vb); vulkaan.lineTo(vx - 40, vb - 264);
    vulkaan.lineTo(vx - 14, vb - 264); vulkaan.lineTo(vx - 26, vb);
    vulkaan.closePath(); vulkaan.fillPath();
    // saus-krater in de afgeplatte top + druipers langs de hellingen
    vulkaan.fillStyle(0xe8402c, 1); vulkaan.fillEllipse(vx, vb - 280, 84, 20);
    vulkaan.fillStyle(0xe8402c, 0.95);
    vulkaan.fillRoundedRect(vx - 40, vb - 278, 12, 40, 6);
    vulkaan.fillRoundedRect(vx - 4, vb - 274, 10, 58, 5);
    vulkaan.fillRoundedRect(vx + 28, vb - 278, 11, 30, 5);
    // rook uit de krater
    scene.time.addEvent({
      delay: 1300, loop: true, callback: () => {
        if (!scene.scene.isActive()) return;
        const r = scene.add.circle(vx + Phaser.Math.Between(-16, 16), vb - 306, Phaser.Math.Between(8, 13), 0xf0e6da, 0.45).setDepth(-27).setScrollFactor(0.3);
        scene.tweens.add({ targets: r, y: r.y - 90, scale: 2, alpha: 0, duration: 3200, onComplete: () => r.destroy() });
      },
    });

    // kaas-gele wolkjes
    scene.clouds = [];
    for (let i = 0; i < 7; i++) {
      const x = (i / 7) * L.worldW + Phaser.Math.Between(-40, 40);
      const y = Phaser.Math.Between(70, 250);
      const c = scene.add.container(x, y).setDepth(-26).setScrollFactor(0.5).setAlpha(0.85);
      const g = scene.add.graphics();
      g.fillStyle(0xfff3cf, 0.95);
      [[-26, 4, 17], [-6, -8, 23], [16, 0, 20], [34, 7, 14]].forEach(([cx, cy, r]) => g.fillCircle(cx, cy, r));
      c.add(g);
      c.driftSpeed = Phaser.Math.FloatBetween(5, 12);
      scene.clouds.push(c);
    }
    // verre kaas-heuvels
    const heuvels = scene.add.graphics().setDepth(-26).setScrollFactor(0.35);
    heuvels.fillStyle(0xe0b054, 0.75);
    for (let x = -100; x < scene.scale.width + 200; x += 180) heuvels.fillCircle(x, scene.scale.height, 150);
    return;
  }

  if (L.terrain === 'pannenkoek') {
    // PANNENKOEKEN-PARADIJS (Wereld 8): honing-warme lucht, slagroom-wolken,
    // en in de verte reuzen-pannenkoekentorens met druipende stroop.
    const zon = scene.add.container(scene.scale.width - 70, 90).setDepth(-28).setScrollFactor(0.25);
    const zg = scene.add.circle(0, 0, 54, 0xffe9a8, 0.42);
    zon.add([zg, scene.add.circle(0, 0, 32, 0xffd24d)]);
    scene.tweens.add({ targets: zg, scale: 1.18, alpha: 0.55, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // pannenkoekentorens in de verte (met stroop en boter)
    const torens = scene.add.graphics().setDepth(-27).setScrollFactor(0.3);
    [[90, 9, 62], [330, 13, 78], [430, 7, 50]].forEach(([tx, lagen, tw]) => {
      const vb = scene.scale.height - 140;
      for (let k = 0; k < lagen; k++) {
        torens.fillStyle(k % 2 ? 0xdca050 : 0xc98a3d, 0.92);
        torens.fillEllipse(tx, vb - k * 13, tw - (k % 3) * 5, 20);
      }
      // stroop die over de bovenste laag druipt + botertje
      torens.fillStyle(0xb96a1e, 0.85);
      torens.fillEllipse(tx, vb - lagen * 13 + 2, tw * 0.7, 12);
      torens.fillRoundedRect(tx - tw * 0.28, vb - lagen * 13 + 4, 7, 22, 3);
      torens.fillRoundedRect(tx + tw * 0.14, vb - lagen * 13 + 4, 6, 16, 3);
      torens.fillStyle(0xffe16b, 1); torens.fillRoundedRect(tx - 9, vb - lagen * 13 - 8, 18, 9, 3);
    });

    // dikke slagroom-wolken
    scene.clouds = [];
    for (let i = 0; i < 7; i++) {
      const x = (i / 7) * L.worldW + Phaser.Math.Between(-40, 40);
      const y = Phaser.Math.Between(60, 240);
      const c = scene.add.container(x, y).setDepth(-26).setScrollFactor(0.5);
      const g = scene.add.graphics();
      g.fillStyle(0xffffff, 0.96);
      [[-30, 6, 18], [-8, -10, 26], [18, -2, 22], [38, 8, 15], [4, 12, 28]].forEach(([cx, cy, r]) => g.fillCircle(cx, cy, r));
      g.fillStyle(0xffe9f2, 0.8); g.fillCircle(-14, 12, 16); // zachte roze onderkant
      c.add(g);
      c.driftSpeed = Phaser.Math.FloatBetween(4, 10);
      scene.clouds.push(c);
    }
    // aardbei-heuvels in de verte
    const heuvels = scene.add.graphics().setDepth(-26).setScrollFactor(0.35);
    heuvels.fillStyle(0xe89aa8, 0.7);
    for (let x = -100; x < scene.scale.width + 200; x += 180) heuvels.fillCircle(x, scene.scale.height, 150);
    return;
  }

  if (L.terrain === 'wc') {
    // WC-WONDERLAND (Wereld 9): frisse lucht, in de verte vrolijke drollen-
    // heuvels mét gezichtjes en torens van wc-rollen. Gek en knuffelbaar.
    const zon = scene.add.container(scene.scale.width - 70, 90).setDepth(-28).setScrollFactor(0.25);
    const zg = scene.add.circle(0, 0, 54, 0xfff3b0, 0.4);
    zon.add([zg, scene.add.circle(0, 0, 32, 0xffe16b)]);
    scene.tweens.add({ targets: zg, scale: 1.18, alpha: 0.55, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    const verte = scene.add.graphics().setDepth(-27).setScrollFactor(0.3);
    const vb = scene.scale.height - 140;
    // drollen-heuvels met blije gezichtjes
    [[90, 1.3], [300, 1.0], [440, 0.8]].forEach(([hx, sc]) => {
      verte.fillStyle(0x9c6b45, 0.9);
      verte.fillEllipse(hx, vb - 18 * sc, 130 * sc, 60 * sc);
      verte.fillEllipse(hx, vb - 48 * sc, 96 * sc, 46 * sc);
      verte.fillEllipse(hx + 4 * sc, vb - 76 * sc, 60 * sc, 32 * sc);
      verte.lineStyle(4, 0x6a4526, 1);
      verte.beginPath(); verte.arc(hx + 8 * sc, vb - 92 * sc, 10 * sc, Math.PI, 2.2 * Math.PI); verte.strokePath();
      // gezichtje
      verte.fillStyle(0xffffff, 1); verte.fillCircle(hx - 12 * sc, vb - 50 * sc, 6 * sc); verte.fillCircle(hx + 12 * sc, vb - 50 * sc, 6 * sc);
      verte.fillStyle(0x2c1c0e, 1); verte.fillCircle(hx - 12 * sc, vb - 49 * sc, 2.6 * sc); verte.fillCircle(hx + 12 * sc, vb - 49 * sc, 2.6 * sc);
      verte.lineStyle(2.5 * sc, 0x2c1c0e, 1);
      verte.beginPath(); verte.arc(hx, vb - 40 * sc, 7 * sc, 0.2, Math.PI - 0.2); verte.strokePath();
    });
    // wc-rol-torens
    [[190, 3], [385, 4]].forEach(([tx, lagen]) => {
      for (let k = 0; k < lagen; k++) {
        verte.fillStyle(k % 2 ? 0xf5f9fc : 0xe8eef3, 0.95);
        verte.fillRoundedRect(tx - 26, vb - 34 - k * 30, 52, 30, 8);
        verte.fillStyle(0xd9c9a8, 0.9); verte.fillEllipse(tx, vb - 19 - k * 30, 16, 8);
      }
    });

    scene.clouds = [];
    for (let i = 0; i < 7; i++) {
      const x = (i / 7) * L.worldW + Phaser.Math.Between(-40, 40);
      const y = Phaser.Math.Between(70, 250);
      const c = scene.add.container(x, y).setDepth(-26).setScrollFactor(0.5);
      const g = scene.add.graphics();
      g.fillStyle(0xffffff, 0.92);
      [[-26, 4, 17], [-6, -8, 23], [16, 0, 20], [34, 7, 14]].forEach(([cx, cy, r]) => g.fillCircle(cx, cy, r));
      c.add(g);
      c.driftSpeed = Phaser.Math.FloatBetween(4, 10);
      scene.clouds.push(c);
    }
    const heuvels = scene.add.graphics().setDepth(-26).setScrollFactor(0.35);
    heuvels.fillStyle(0xb08558, 0.7);
    for (let x = -100; x < scene.scale.width + 200; x += 180) heuvels.fillCircle(x, scene.scale.height, 150);
    return;
  }

  if (L.terrain === 'reus') {
    // REUZENLAND (Wereld 10): een frisse groene wereld waarin ALLES gigantisch
    // is — reuzenpaddenstoelen en manshoge bloemen in de verte, dikke bolle
    // wolken en een grote vrolijke zon. Jij bent hier maar klein… tot je hapt.
    const zon = scene.add.container(scene.scale.width - 70, 88).setDepth(-28).setScrollFactor(0.22);
    const zg = scene.add.circle(0, 0, 60, 0xfff3b0, 0.4);
    zon.add([zg, scene.add.circle(0, 0, 36, 0xffe16b)]);
    scene.tweens.add({ targets: zg, scale: 1.16, alpha: 0.55, duration: 1900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // reuzenpaddenstoelen + manshoge bloemen in de verte (parallax)
    const verte = scene.add.graphics().setDepth(-27).setScrollFactor(0.3);
    const vb = scene.scale.height - 130;
    [[70, 1.5], [250, 1.0], [420, 1.7], [560, 1.1]].forEach(([px, sc]) => {
      // dikke steel
      verte.fillStyle(0xf3ead2, 0.95);
      verte.fillRoundedRect(px - 13 * sc, vb - 120 * sc, 26 * sc, 120 * sc, 10 * sc);
      // rode hoed met stippen
      verte.fillStyle(0xe8402c, 0.95);
      verte.fillEllipse(px, vb - 120 * sc, 92 * sc, 54 * sc);
      verte.fillStyle(0xd0331f, 0.95);
      verte.fillRect(px - 46 * sc, vb - 120 * sc, 92 * sc, 10 * sc);
      verte.fillStyle(0xffffff, 0.9);
      [[-24, -128], [10, -134], [30, -120], [-6, -118]].forEach(([dx, dy]) => verte.fillCircle(px + dx * sc, vb + dy * sc, 7 * sc));
    });
    // reuzenbloemen tussen de paddenstoelen
    [[160, 1.1], [350, 1.4], [500, 0.9]].forEach(([px, sc]) => {
      verte.fillStyle(0x4fae4a, 0.9); verte.fillRect(px - 4 * sc, vb - 96 * sc, 8 * sc, 96 * sc);
      verte.fillStyle(0xffcf3f, 0.95);
      for (let a = 0; a < 8; a++) { const ang = (a / 8) * Math.PI * 2; verte.fillEllipse(px + Math.cos(ang) * 22 * sc, vb - 96 * sc + Math.sin(ang) * 22 * sc, 15 * sc, 11 * sc); }
      verte.fillStyle(0xe8912c, 1); verte.fillCircle(px, vb - 96 * sc, 13 * sc);
    });

    scene.clouds = [];
    for (let i = 0; i < 7; i++) {
      const x = (i / 7) * L.worldW + Phaser.Math.Between(-40, 40);
      const y = Phaser.Math.Between(60, 240);
      const s = Phaser.Math.FloatBetween(0.9, 1.5);
      const c = scene.add.container(x, y).setDepth(-26).setScale(s).setScrollFactor(0.5);
      const g = scene.add.graphics();
      g.fillStyle(0xffffff, 0.95);
      [[-30, 6, 20], [-6, -10, 28], [20, -2, 24], [42, 8, 16], [6, 12, 30]].forEach(([cx, cy, r]) => g.fillCircle(cx, cy, r));
      c.add(g);
      c.driftSpeed = Phaser.Math.FloatBetween(4, 10);
      scene.clouds.push(c);
    }
    const heuvels = scene.add.graphics().setDepth(-26).setScrollFactor(0.35);
    heuvels.fillStyle(darker(L.bg.bottom, 18), 0.7);
    for (let x = -100; x < scene.scale.width + 200; x += 180) heuvels.fillCircle(x, scene.scale.height, 160);
    return;
  }

  if (L.terrain === 'zee') {
    // DE BUBBEL-ZEE (Wereld 12): we zijn ÓNDER water. Lichtstralen zakken
    // van boven naar beneden, bubbels stijgen op, en in de verte zwemmen
    // vissen-silhouetten langs koraal-torens. Geen zon — wel een waterlijn
    // met glinstering bovenin.
    const licht = scene.add.graphics().setDepth(-28).setScrollFactor(0.15);
    licht.fillStyle(0xbfe8f5, 0.12);
    [[60, 90], [220, 130], [420, 70], [560, 110]].forEach(([lx, lw]) => {
      licht.fillTriangle(lx, 0, lx + lw, 0, lx + lw * 2.2, scene.scale.height);
    });
    scene.tweens.add({ targets: licht, alpha: 0.55, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    // glinsterende waterlijn bovenin
    const lijn = scene.add.graphics().setDepth(-27).setScrollFactor(0.2);
    lijn.fillStyle(0xd7f0fa, 0.35);
    for (let x = -40; x < scene.scale.width + 60; x += 46) lijn.fillEllipse(x, 26, 34, 8);

    // verre koraal-torens + wuivend zeewier
    const verte = scene.add.graphics().setDepth(-27).setScrollFactor(0.3);
    const vb = scene.scale.height - 140;
    [[80, 1.2, 0xe07a9a], [260, 0.9, 0xf0a24d], [450, 1.4, 0xb96ad0]].forEach(([kx, sc, col]) => {
      verte.fillStyle(col, 0.75);
      verte.fillRoundedRect(kx - 10 * sc, vb - 120 * sc, 20 * sc, 120 * sc, 8 * sc);
      verte.fillRoundedRect(kx - 34 * sc, vb - 80 * sc, 16 * sc, 80 * sc, 7 * sc);
      verte.fillRoundedRect(kx + 20 * sc, vb - 95 * sc, 17 * sc, 95 * sc, 7 * sc);
      verte.fillCircle(kx, vb - 124 * sc, 12 * sc); verte.fillCircle(kx - 26 * sc, vb - 82 * sc, 9 * sc); verte.fillCircle(kx + 28 * sc, vb - 98 * sc, 10 * sc);
    });
    // vissen-silhouetten
    verte.fillStyle(0x2e5f7a, 0.55);
    [[150, 180, 1], [340, 240, -1], [520, 150, 1], [240, 320, -1]].forEach(([fx, fy, dir]) => {
      verte.fillEllipse(fx, fy, 26, 12);
      verte.fillTriangle(fx - dir * 13, fy, fx - dir * 24, fy - 8, fx - dir * 24, fy + 8);
    });

    // opstijgende bubbels als "wolken" (driften omhoog i.p.v. opzij)
    scene.clouds = [];
    for (let i = 0; i < 8; i++) {
      const x = (i / 8) * L.worldW + Phaser.Math.Between(-40, 40);
      const y = Phaser.Math.Between(100, 500);
      const c = scene.add.container(x, y).setDepth(-26).setScrollFactor(0.5).setAlpha(0.7);
      const g = scene.add.graphics();
      g.lineStyle(2, 0xbfe8f5, 0.9);
      g.strokeCircle(0, 0, 10); g.strokeCircle(16, -14, 6); g.strokeCircle(-12, -20, 4);
      g.fillStyle(0xffffff, 0.4); g.fillCircle(-3, -3, 3);
      c.add(g);
      c.driftSpeed = Phaser.Math.FloatBetween(4, 9);
      scene.clouds.push(c);
    }
    const heuvels = scene.add.graphics().setDepth(-26).setScrollFactor(0.35);
    heuvels.fillStyle(darker(L.bg.bottom, 18), 0.7);
    for (let x = -100; x < scene.scale.width + 200; x += 180) heuvels.fillCircle(x, scene.scale.height, 150);
    return;
  }

  if (L.terrain === 'billen') {
    // BILLENLAND (Wereld 11): een zacht-roze giechel-wereld. In de verte
    // grote billen-heuvels (dubbel-bollen met blosjes) en zwevende
    // zeepbellen — want de Stinke-Bil moet nodig in bad. Gek en knuffelbaar,
    // net als Wc-Wonderland.
    const zon = scene.add.container(scene.scale.width - 70, 90).setDepth(-28).setScrollFactor(0.25);
    const zg = scene.add.circle(0, 0, 54, 0xfff3b0, 0.4);
    zon.add([zg, scene.add.circle(0, 0, 32, 0xffe16b)]);
    scene.tweens.add({ targets: zg, scale: 1.18, alpha: 0.55, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    const verte = scene.add.graphics().setDepth(-27).setScrollFactor(0.3);
    const vb = scene.scale.height - 140;
    // billen-heuvels: twee bollen naast elkaar met een spleet en blosjes
    [[100, 1.4], [300, 1.0], [470, 1.25]].forEach(([hx, sc]) => {
      verte.fillStyle(0xf2b8a0, 0.95);
      verte.fillCircle(hx - 34 * sc, vb - 40 * sc, 52 * sc);
      verte.fillCircle(hx + 34 * sc, vb - 40 * sc, 52 * sc);
      verte.fillRect(hx - 60 * sc, vb - 30 * sc, 120 * sc, 32 * sc);
      verte.lineStyle(3 * sc, 0xd08a70, 0.9);
      verte.beginPath(); verte.moveTo(hx, vb - 78 * sc); verte.lineTo(hx, vb - 12 * sc); verte.strokePath();
      // blosjes op beide bollen
      verte.fillStyle(0xf08a8a, 0.55);
      verte.fillEllipse(hx - 40 * sc, vb - 44 * sc, 20 * sc, 12 * sc);
      verte.fillEllipse(hx + 40 * sc, vb - 44 * sc, 20 * sc, 12 * sc);
    });
    // zwevende zeepbellen (het bad wacht!)
    for (let i = 0; i < 6; i++) {
      const bx = 60 + i * 90, by = 150 + (i % 3) * 60;
      verte.lineStyle(2, 0xbfe8f5, 0.8); verte.strokeCircle(bx, by, 9 + (i % 3) * 4);
      verte.fillStyle(0xffffff, 0.5); verte.fillCircle(bx - 3, by - 4, 2.5);
    }

    scene.clouds = [];
    for (let i = 0; i < 7; i++) {
      const x = (i / 7) * L.worldW + Phaser.Math.Between(-40, 40);
      const y = Phaser.Math.Between(70, 250);
      const c = scene.add.container(x, y).setDepth(-26).setScrollFactor(0.5);
      const g = scene.add.graphics();
      g.fillStyle(0xffffff, 0.93);
      [[-26, 4, 17], [-6, -8, 23], [16, 0, 20], [34, 7, 14]].forEach(([cx, cy, r]) => g.fillCircle(cx, cy, r));
      c.add(g);
      c.driftSpeed = Phaser.Math.FloatBetween(4, 10);
      scene.clouds.push(c);
    }
    const heuvels = scene.add.graphics().setDepth(-26).setScrollFactor(0.35);
    heuvels.fillStyle(0xe8a58c, 0.7);
    for (let x = -100; x < scene.scale.width + 200; x += 180) heuvels.fillCircle(x, scene.scale.height, 150);
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
// In de Pizza-Vulkaan is het "water" tomatensaus; in het Pannenkoeken-
// Paradijs is het een meer van warme stroop.
export function buildWater(scene, L) {
  const saus = L.terrain === 'pizza';
  const stroop = L.terrain === 'pannenkoek';
  const diepzee = L.terrain === 'zee'; // de donkere geul — dieper dan diep
  const kleuren = saus
    ? [0xd0331f, 0xf07c5a, 0xffc14d]
    : stroop ? [0xb96a1e, 0xdca050, 0xffe16b]
    : diepzee ? [0x123a52, 0x1f5f80, 0x7fd0f0] : [0x3fa9e0, 0x7fd0f0, 0xffffff];
  (L.water || []).forEach(([x, y, w, h]) => {
    const g = scene.add.graphics().setDepth(-14);
    g.fillStyle(kleuren[0], 1); g.fillRect(x, y, w, h);
    g.fillStyle(kleuren[1], 0.5);
    for (let wx = x; wx < x + w; wx += 42) g.fillEllipse(wx + 21, y + 12, 26, 8);
    g.fillStyle(kleuren[2], 0.25);
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
  } else if (scene.level.terrain === 'fort') {
    // FORT (Wereld 6): grauwe kasteelstenen met fakkels en grijze vlaggetjes.
    g.fillStyle(0x565b61, 1); g.fillRect(x, y + 12, w, h - 12);
    // steen-voegen
    g.lineStyle(2, 0x3f434a, 0.8);
    for (let ry = y + 16; ry < y + h - 6; ry += 24) { g.beginPath(); g.moveTo(x, ry); g.lineTo(x + w, ry); g.strokePath(); }
    g.fillStyle(0x6c7178, 1); g.fillRect(x, y, w, 16);
    g.fillStyle(0x8a8f96, 1); g.fillRect(x, y, w, 6);
    // om en om: fakkel en grauw vlaggetje
    let fort = false;
    for (let fx = x + 50; fx < x + w - 30; fx += 150) {
      fort = !fort;
      if (fort) {
        g.fillStyle(0x8a5a33, 1); g.fillRect(fx - 2, y - 18, 4, 18);
        g.fillStyle(0xf07c1f, 1); g.fillEllipse(fx, y - 24, 10, 14);
        g.fillStyle(0xffe16b, 1); g.fillEllipse(fx, y - 22, 5, 8);
      } else {
        g.fillStyle(0xcfd6dd, 1); g.fillRect(fx - 1, y - 20, 2, 20);
        g.fillStyle(0x6c7178, 1); g.fillTriangle(fx + 1, y - 20, fx + 1, y - 11, fx + 13, y - 16);
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
  } else if (scene.level.terrain === 'pizza') {
    // PIZZA-VULKAAN (Wereld 7): goudbruine korst met een gesmolten kaas-toplaag,
    // druipende kaas en om en om een salami en een basilicumblaadje.
    g.fillStyle(0xc98a3d, 1); g.fillRect(x, y + 12, w, h - 12);
    g.fillStyle(0xb5762f, 0.6);
    for (let ex = x + 12; ex < x + w; ex += 46) g.fillEllipse(ex, y + 34, 16, 8); // korst-bobbels
    g.fillStyle(0xf6c624, 1); g.fillRect(x, y, w, 16);                            // kaaslaag
    g.fillStyle(0xffe16b, 1); g.fillRect(x, y, w, 6);                             // kaas-glans
    // druipende kaas over de korstrand
    g.fillStyle(0xf6c624, 1);
    for (let dx = x + 20; dx < x + w - 10; dx += 56) {
      g.fillRoundedRect(dx, y + 14, 9, 10 + (dx % 3) * 4, 4);
    }
    // om en om: salami en basilicumblaadje bovenop
    let piz = false;
    for (let fx = x + 50; fx < x + w - 30; fx += 150) {
      piz = !piz;
      if (piz) {
        g.fillStyle(0xb93227, 1); g.fillCircle(fx, y - 2, 9);
        g.fillStyle(0xe8402c, 1); g.fillCircle(fx, y - 2, 7);
        g.fillStyle(0x8a1d12, 1); g.fillCircle(fx - 2, y - 4, 1.6); g.fillCircle(fx + 3, y, 1.4);
      } else {
        g.fillStyle(0x57b947, 1); g.fillEllipse(fx, y - 3, 16, 9);
        g.lineStyle(1.5, 0x2f7d33, 1);
        g.beginPath(); g.moveTo(fx - 7, y - 3); g.lineTo(fx + 7, y - 3); g.strokePath();
      }
    }
  } else if (scene.level.terrain === 'pannenkoek') {
    // PANNENKOEKEN-PARADIJS (Wereld 8): de grond is een stapel pannenkoeken
    // met een strooplaag bovenop; om en om een aardbei en een slagroomtoef.
    g.fillStyle(0xc98a3d, 1); g.fillRect(x, y + 12, w, h - 12);
    g.fillStyle(0xb5762f, 0.7);
    for (let ry = y + 26; ry < y + h - 6; ry += 22) { // pannenkoek-lagen
      for (let ex = x + 20; ex < x + w - 10; ex += 68) g.fillEllipse(ex, ry, 52, 9);
    }
    g.fillStyle(0xdca050, 1); g.fillRect(x, y, w, 16);   // bovenste pannenkoek
    g.fillStyle(0xeab86a, 1); g.fillRect(x, y, w, 6);
    // stroop die over de rand druipt
    g.fillStyle(0xb96a1e, 0.9);
    for (let dx = x + 26; dx < x + w - 10; dx += 62) {
      g.fillRoundedRect(dx, y + 12, 8, 12 + (dx % 3) * 5, 4);
    }
    // om en om: aardbei en slagroomtoef
    let pk = false;
    for (let fx = x + 50; fx < x + w - 30; fx += 150) {
      pk = !pk;
      if (pk) {
        g.fillStyle(0xe8402c, 1); g.fillCircle(fx, y - 5, 7);
        g.fillTriangle(fx - 7, y - 7, fx + 7, y - 7, fx, y + 2);
        g.fillStyle(0x57b947, 1); g.fillEllipse(fx, y - 11, 10, 4);
        g.fillStyle(0xffe16b, 1); g.fillCircle(fx - 2, y - 5, 1); g.fillCircle(fx + 3, y - 3, 1);
      } else {
        g.fillStyle(0xffffff, 1);
        g.fillCircle(fx - 5, y - 4, 5); g.fillCircle(fx + 5, y - 4, 5); g.fillCircle(fx, y - 9, 6);
        g.fillStyle(0xe8402c, 1); g.fillCircle(fx, y - 15, 3);
      }
    }
  } else if (scene.level.terrain === 'wc') {
    // WC-WONDERLAND (Wereld 9): zachte bruine grond met een frisse gras-rand
    // (het dorp houdt het netjes!), en om en om een mini-drolletje met
    // oogjes en een wc-rolletje als decoratie.
    g.fillStyle(0x9c6b45, 1); g.fillRect(x, y + 12, w, h - 12);
    g.fillStyle(0x8a5a33, 0.6);
    for (let ex = x + 12; ex < x + w; ex += 46) g.fillEllipse(ex, y + 34, 16, 8);
    g.fillStyle(0x8fce6a, 1); g.fillRect(x, y, w, 16);   // fris-groene rand
    g.fillStyle(0xaede8a, 1); g.fillRect(x, y, w, 6);
    g.fillStyle(0x6fae4a, 1);
    for (let bx = x + 6; bx < x + w; bx += 16) g.fillTriangle(bx, y, bx + 5, y, bx + 2.5, y - 6);
    // om en om: mini-drolletje met oogjes en een wc-rolletje
    let wc = false;
    for (let fx = x + 50; fx < x + w - 30; fx += 150) {
      wc = !wc;
      if (wc) {
        g.fillStyle(0x8a5a33, 1);
        g.fillEllipse(fx, y - 4, 18, 9); g.fillEllipse(fx + 1, y - 10, 12, 7);
        g.lineStyle(2, 0x5d3a1e, 1); g.beginPath(); g.arc(fx + 2, y - 15, 4, Math.PI, 2.3 * Math.PI); g.strokePath();
        g.fillStyle(0xffffff, 1); g.fillCircle(fx - 3, y - 6, 2.2); g.fillCircle(fx + 4, y - 6, 2.2);
        g.fillStyle(0x2c1c0e, 1); g.fillCircle(fx - 3, y - 6, 1); g.fillCircle(fx + 4, y - 6, 1);
      } else {
        g.fillStyle(0xf5f9fc, 1); g.fillRoundedRect(fx - 9, y - 14, 18, 14, 4);
        g.fillStyle(0xd9c9a8, 1); g.fillEllipse(fx, y - 7, 7, 4);
      }
    }
  } else if (scene.level.terrain === 'zee') {
    // DE BUBBEL-ZEE (Wereld 12): zeebodem — zand met een lichte toplaag,
    // en om en om een koraaltje met anemoon-slierten en een blije zeester.
    g.fillStyle(0xd9c08a, 1); g.fillRect(x, y + 12, w, h - 12);
    g.fillStyle(0xc4ab74, 0.6);
    for (let ex = x + 12; ex < x + w; ex += 46) g.fillEllipse(ex, y + 34, 16, 8);
    g.fillStyle(0xefd7a0, 1); g.fillRect(x, y, w, 16);
    g.fillStyle(0xf8e6ba, 1); g.fillRect(x, y, w, 6);
    // golf-ribbels in het zand
    g.lineStyle(2, 0xc4ab74, 0.7);
    for (let bx = x + 20; bx < x + w - 12; bx += 52) {
      g.beginPath(); g.arc(bx, y + 8, 8, 0.15 * Math.PI, 0.85 * Math.PI); g.strokePath();
    }
    // om en om: koraaltje met anemoon en een blije zeester
    let zee = false;
    for (let fx = x + 50; fx < x + w - 30; fx += 150) {
      zee = !zee;
      if (zee) {
        g.fillStyle(0xe07a9a, 1);
        g.fillRoundedRect(fx - 3, y - 18, 6, 18, 3);
        g.fillRoundedRect(fx - 12, y - 12, 5, 12, 2);
        g.fillRoundedRect(fx + 7, y - 14, 5, 14, 2);
        g.fillCircle(fx, y - 20, 4); g.fillCircle(fx - 10, y - 13, 3); g.fillCircle(fx + 9, y - 15, 3);
      } else {
        g.fillStyle(0xf0a24d, 1);
        for (let a = 0; a < 5; a++) {
          const ang = -Math.PI / 2 + a * (2 * Math.PI / 5);
          g.fillEllipse(fx + Math.cos(ang) * 5, y - 6 + Math.sin(ang) * 5, 5, 5);
        }
        g.fillCircle(fx, y - 6, 3.6);
        g.fillStyle(0x16202b, 1); g.fillCircle(fx - 1.4, y - 7, 0.8); g.fillCircle(1.4 + fx, y - 7, 0.8);
      }
    }
  } else if (scene.level.terrain === 'billen') {
    // BILLENLAND (Wereld 11): zachte perzik-grond met een roze bloesem-rand,
    // en om en om een mini-bil met blosjes en een glinsterende zeepbel.
    g.fillStyle(0xb98868, 1); g.fillRect(x, y + 12, w, h - 12);
    g.fillStyle(0xa87556, 0.6);
    for (let ex = x + 12; ex < x + w; ex += 46) g.fillEllipse(ex, y + 34, 16, 8);
    g.fillStyle(0xf2a7b8, 1); g.fillRect(x, y, w, 16);   // roze bloesem-laag
    g.fillStyle(0xf8c4d0, 1); g.fillRect(x, y, w, 6);
    g.fillStyle(0xe088a0, 1);
    for (let bx = x + 6; bx < x + w; bx += 16) g.fillCircle(bx + 2, y - 2, 3); // bloesem-bolletjes
    // om en om: mini-bil met blosjes en een zeepbel
    let bil = false;
    for (let fx = x + 50; fx < x + w - 30; fx += 150) {
      bil = !bil;
      if (bil) {
        g.fillStyle(0xf2b8a0, 1); g.fillCircle(fx - 6, y - 8, 8); g.fillCircle(fx + 6, y - 8, 8);
        g.fillRect(fx - 12, y - 8, 24, 8);
        g.lineStyle(2, 0xd08a70, 1); g.beginPath(); g.moveTo(fx, y - 14); g.lineTo(fx, y); g.strokePath();
        g.fillStyle(0xf08a8a, 0.6); g.fillEllipse(fx - 7, y - 9, 6, 4); g.fillEllipse(fx + 7, y - 9, 6, 4);
      } else {
        g.lineStyle(2, 0xbfe8f5, 0.9); g.strokeCircle(fx, y - 12, 8);
        g.fillStyle(0xffffff, 0.55); g.fillCircle(fx - 3, y - 15, 2.2);
      }
    }
  } else if (scene.level.terrain === 'reus') {
    // REUZENLAND (Wereld 10): sappige groene grond met EXTRA hoge grassprieten
    // en om en om een reuzen-madeliefje en een klein rood paddenstoeltje —
    // alles net een maatje groter dan normaal.
    g.fillStyle(0x7a5230, 1); g.fillRect(x, y + 12, w, h - 12);
    g.fillStyle(0x694626, 0.6);
    for (let ex = x + 12; ex < x + w; ex += 46) g.fillEllipse(ex, y + 34, 16, 8);
    g.fillStyle(0x4fae4a, 1); g.fillRect(x, y, w, 18);
    g.fillStyle(lighten(0x4fae4a, 22), 1); g.fillRect(x, y, w, 7);
    // hoge grassprieten
    g.fillStyle(0x3f9d3f, 1);
    for (let bx = x + 6; bx < x + w; bx += 14) g.fillTriangle(bx, y, bx + 6, y, bx + 3, y - 11);
    // om en om: reuzen-madeliefje en rood paddenstoeltje
    let reus = false;
    for (let fx = x + 50; fx < x + w - 30; fx += 150) {
      reus = !reus;
      if (reus) {
        g.fillStyle(0x2f7d33, 1); g.fillRect(fx - 2, y - 20, 4, 20);
        g.fillStyle(0xffffff, 1);
        for (let a = 0; a < 8; a++) { const ang = (a / 8) * Math.PI * 2; g.fillEllipse(fx + Math.cos(ang) * 8, y - 22 + Math.sin(ang) * 8, 5, 3.4); }
        g.fillStyle(0xffcf3f, 1); g.fillCircle(fx, y - 22, 5);
      } else {
        g.fillStyle(0xf5efe2, 1); g.fillRoundedRect(fx - 4, y - 16, 8, 16, 3);
        g.fillStyle(0xe8402c, 1); g.slice(fx, y - 15, 12, Math.PI, 0, false); g.fillPath();
        g.fillStyle(0xffffff, 1); g.fillCircle(fx - 4, y - 18, 2); g.fillCircle(fx + 4, y - 19, 2); g.fillCircle(fx, y - 15, 1.8);
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
