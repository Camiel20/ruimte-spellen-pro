// ===== TERREIN & DECOR: lucht, water, platforms en grond-thema's =====
// Puur visueel + statische physics-platforms. Het grond-thema komt uit de
// leveldata (`terrain: 'zand'` → strand; anders gras) — nieuwe werelden
// krijgen hier hun eigen look zonder engine-wijzigingen elders.

import Phaser from 'phaser';
import { lighten, darker } from './palette.js';
import { LOWER_PATHS, RAINBOW } from '../glyphs.js';

// Teken een kleine letter (uit LOWER_PATHS) op graphics g — voor het
// letter-terrein (zwevende letters + letter-tegeltjes in het gras).
function letterStroke(g, ch, ox, oy, sz, lw, col) {
  const paths = LOWER_PATHS[ch];
  if (!paths) return;
  g.lineStyle(lw, col, 1);
  for (const st of paths) {
    g.beginPath(); g.moveTo(ox + st[0][0] * sz, oy + st[0][1] * sz);
    for (let i = 1; i < st.length; i++) g.lineTo(ox + st[i][0] * sz, oy + st[i][1] * sz);
    g.strokePath();
  }
}
const ABC = 'abcdefghijklmnopqrstuvwxyz';

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

  if (L.terrain === 'letters') {
    // DE PRAATWEIDE (Letter-Land, Wereld 1): een vrolijke, kleurige weide waar
    // woorden groeien. Zon, wolkjes én zwevende pastel-letters in de verte —
    // eigen identiteit, geen kaal gras. (De grond krijgt letter-tegeltjes.)
    const zon = scene.add.container(scene.scale.width - 70, 88).setDepth(-28).setScrollFactor(0.24);
    const zg = scene.add.circle(0, 0, 56, 0xfff3b0, 0.4);
    zon.add([zg, scene.add.circle(0, 0, 33, 0xffe16b)]);
    scene.tweens.add({ targets: zg, scale: 1.16, alpha: 0.55, duration: 1900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // zwevende pastel-letters (drijven mee als "wolken")
    scene.clouds = [];
    for (let i = 0; i < 8; i++) {
      const x = (i / 8) * L.worldW + Phaser.Math.Between(-40, 40);
      const y = Phaser.Math.Between(60, 250);
      const c = scene.add.container(x, y).setDepth(-27).setScrollFactor(0.5).setAlpha(0.55);
      const g = scene.add.graphics();
      const col = RAINBOW[i % RAINBOW.length];
      g.fillStyle(col, 0.55); g.fillRoundedRect(-21, -21, 42, 42, 11);
      g.fillStyle(0xffffff, 0.2); g.fillRoundedRect(-21, -21, 42, 16, 11);
      letterStroke(g, ABC[i % 26], -21 + 42 * 0.16, -21 + 42 * 0.16, 42 * 0.68, 5, 0xffffff);
      c.add(g);
      c.driftSpeed = Phaser.Math.FloatBetween(4, 9);
      scene.clouds.push(c);
    }
    // een paar echte witte wolkjes ertussen
    for (let i = 0; i < 3; i++) {
      const x = (i / 3) * L.worldW + Phaser.Math.Between(-30, 60);
      const c = scene.add.container(x, Phaser.Math.Between(90, 200)).setDepth(-27).setScrollFactor(0.5).setAlpha(0.85);
      const g = scene.add.graphics();
      g.fillStyle(0xffffff, 0.92);
      [[-24, 4, 15], [-6, -7, 21], [14, 0, 18], [30, 6, 12]].forEach(([cx, cy, r]) => g.fillCircle(cx, cy, r));
      c.add(g);
      c.driftSpeed = Phaser.Math.FloatBetween(5, 10);
      scene.clouds.push(c);
    }
    const hillsL = scene.add.graphics().setDepth(-26).setScrollFactor(0.35);
    hillsL.fillStyle(darker(L.bg.bottom, 18), 0.7);
    for (let x = -100; x < scene.scale.width + 200; x += 180) hillsL.fillCircle(x, scene.scale.height, 150);
    return;
  }

  if (L.terrain === 'kleren') {
    // DE KLEREN-KAST (Wereld 13): we stappen een reuzen-kledingkast binnen!
    // Houten planken-wanden, opgevouwen truien-stapels in de verte, een warme
    // hanglamp i.p.v. de zon, en wapperend wasgoed drift voorbij als "wolken".
    // de achterwand: zachte houten planken (heel subtiel, parallax)
    const wand = scene.add.graphics().setDepth(-28).setScrollFactor(0.12);
    wand.lineStyle(3, 0xc9a06a, 0.25);
    for (let px = 40; px < scene.scale.width + 60; px += 90) {
      wand.beginPath(); wand.moveTo(px, 0); wand.lineTo(px, scene.scale.height); wand.strokePath();
    }
    // warme hanglamp bovenin (het licht in de kast)
    const lamp = scene.add.container(scene.scale.width - 90, 60).setDepth(-28).setScrollFactor(0.25);
    const lg = scene.add.graphics();
    lg.lineStyle(3, 0x8a6a45, 1); lg.beginPath(); lg.moveTo(0, -60); lg.lineTo(0, -18); lg.strokePath(); // snoer
    lg.fillStyle(0xd9a04a, 1); lg.fillTriangle(-26, 0, 26, 0, 0, -22); // kap
    const gloed = scene.add.circle(0, 14, 40, 0xffe9a8, 0.35);
    lamp.add([gloed, lg, scene.add.circle(0, 8, 12, 0xffe16b)]);
    scene.tweens.add({ targets: gloed, scale: 1.18, alpha: 0.5, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // de verte: reuzen-stapels opgevouwen truien + een hanger-rail
    const verte = scene.add.graphics().setDepth(-27).setScrollFactor(0.3);
    const vb = scene.scale.height - 140;
    [[80, 5, 1.2], [260, 7, 1.0], [430, 4, 1.4], [560, 6, 0.9]].forEach(([tx, lagen, sc]) => {
      const KLR = [0xe8829e, 0x7fb8e8, 0x9ad08a, 0xf0c060, 0xb99ae0];
      for (let k = 0; k < lagen; k++) {
        verte.fillStyle(KLR[(k + Math.floor(tx / 90)) % KLR.length], 0.85);
        verte.fillRoundedRect(tx - 52 * sc, vb - (k + 1) * 20 * sc, 104 * sc, 18 * sc, 8 * sc);
        verte.fillStyle(0xffffff, 0.18);
        verte.fillRoundedRect(tx - 52 * sc, vb - (k + 1) * 20 * sc, 104 * sc, 6 * sc, 4 * sc);
      }
    });
    // hanger-rail met een paar hangertjes bovenin de verte
    verte.lineStyle(4, 0x8a6a45, 0.7);
    verte.beginPath(); verte.moveTo(-20, 130); verte.lineTo(scene.scale.width + 20, 130); verte.strokePath();
    [[70, 0x7fb8e8], [180, 0xe8829e], [330, 0x9ad08a], [470, 0xf0c060]].forEach(([hx, col]) => {
      verte.lineStyle(2.5, 0x9aa0a6, 0.9);
      verte.strokeCircle(hx, 136, 5);
      verte.beginPath(); verte.moveTo(hx - 14, 152); verte.lineTo(hx, 140); verte.lineTo(hx + 14, 152); verte.strokePath();
      verte.fillStyle(col, 0.75);
      verte.fillRoundedRect(hx - 15, 150, 30, 42, 7); // hangend hemdje
      verte.fillStyle(0xffffff, 0.15); verte.fillRoundedRect(hx - 15, 150, 30, 12, 6);
    });

    // wapperend wasgoed drift voorbij als "wolken": shirtjes en sokken aan een lijntje
    scene.clouds = [];
    const WASKLEUR = [0xe8829e, 0x7fb8e8, 0x9ad08a, 0xf0c060, 0xb99ae0, 0xf2a7b8];
    for (let i = 0; i < 7; i++) {
      const x = (i / 7) * L.worldW + Phaser.Math.Between(-40, 40);
      const y = Phaser.Math.Between(70, 250);
      const c = scene.add.container(x, y).setDepth(-26).setScrollFactor(0.5).setAlpha(0.8);
      const g = scene.add.graphics();
      const col = WASKLEUR[i % WASKLEUR.length];
      // mini-waslijntje met knijpers
      g.lineStyle(2, 0xffffff, 0.7);
      g.beginPath(); g.moveTo(-34, -14); g.lineTo(34, -10); g.strokePath();
      g.fillStyle(0xd9a04a, 1); g.fillRect(-16, -16, 4, 8); g.fillRect(12, -15, 4, 8);
      if (i % 3 === 2) {
        // een wapperende sok
        g.fillStyle(col, 0.95);
        g.fillRoundedRect(-10, -12, 16, 22, 6); g.fillCircle(4, 8, 8); g.fillRoundedRect(-10, 2, 18, 12, 6);
        g.fillStyle(0xffffff, 0.9); g.fillRoundedRect(-11, -14, 18, 6, 3);
      } else {
        // een wapperend hemdje
        g.fillStyle(col, 0.95); g.fillRoundedRect(-20, -12, 40, 30, 8);
        g.fillStyle(col, 0.8); g.fillTriangle(-20, -8, -30, 2, -20, 6); g.fillTriangle(20, -8, 30, 2, 20, 6);
        g.fillStyle(0xffffff, 0.2); g.fillRoundedRect(-20, -12, 40, 9, 6);
      }
      c.add(g);
      scene.tweens.add({ targets: c, angle: i % 2 ? 4 : -4, duration: 900 + i * 90, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      c.driftSpeed = Phaser.Math.FloatBetween(4, 10);
      scene.clouds.push(c);
    }
    const heuvels = scene.add.graphics().setDepth(-26).setScrollFactor(0.35);
    heuvels.fillStyle(darker(L.bg.bottom, 18), 0.7);
    for (let x = -100; x < scene.scale.width + 200; x += 180) heuvels.fillCircle(x, scene.scale.height, 150);
    return;
  }

  if (L.terrain === 'ballen') {
    // HET STUITER-STADION (Wereld 14): een vrolijk sportstadion. Tribunes met
    // stippen-publiek en vlaggetjes in de verte, zwevende ballonnen als
    // "wolken", en een groot juich-bord. Zon erbij — sportdag-weer!
    const zon = scene.add.container(scene.scale.width - 70, 90).setDepth(-28).setScrollFactor(0.25);
    const zg = scene.add.circle(0, 0, 54, 0xfff3b0, 0.4);
    zon.add([zg, scene.add.circle(0, 0, 32, 0xffe16b)]);
    scene.tweens.add({ targets: zg, scale: 1.18, alpha: 0.55, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // de tribune: banden met stippen-publiek + een rij vlaggetjes erboven
    const tribune = scene.add.graphics().setDepth(-27).setScrollFactor(0.3);
    const vb = scene.scale.height - 140;
    const TRIB = [0xd06a5a, 0x5a8ad0, 0x6ab06a];
    for (let ring = 0; ring < 3; ring++) {
      const ty = vb - 40 - ring * 46;
      tribune.fillStyle(TRIB[ring % TRIB.length], 0.55);
      tribune.fillRect(-20, ty, scene.scale.width + 40, 40);
      // het publiek: vrolijke stippen-hoofdjes in feestkleuren
      const PUB = [0xffe16b, 0xf2a7b8, 0x8fd3f2, 0xffffff, 0xf0c060];
      for (let px = 10 + ring * 14; px < scene.scale.width + 20; px += 34) {
        tribune.fillStyle(PUB[(Math.floor(px / 34) + ring) % PUB.length], 0.85);
        tribune.fillCircle(px, ty + 14 + (px % 2) * 6, 6);
      }
    }
    // vlaggetjes-lijn boven de tribune
    const VLAG = [0xe8402c, 0xffe16b, 0x57b947, 0x3f8fe8, 0x9b6dd6];
    tribune.lineStyle(2.5, 0xffffff, 0.9);
    tribune.beginPath(); tribune.moveTo(-20, vb - 178); tribune.lineTo(scene.scale.width + 20, vb - 170); tribune.strokePath();
    for (let fx = 0; fx < scene.scale.width + 20; fx += 44) {
      tribune.fillStyle(VLAG[Math.floor(fx / 44) % VLAG.length], 0.95);
      tribune.fillTriangle(fx, vb - 177, fx + 22, vb - 175, fx + 11, vb - 152);
    }

    // zwevende feest-ballonnen als "wolken"
    scene.clouds = [];
    for (let i = 0; i < 7; i++) {
      const x = (i / 7) * L.worldW + Phaser.Math.Between(-40, 40);
      const y = Phaser.Math.Between(70, 260);
      const c = scene.add.container(x, y).setDepth(-26).setScrollFactor(0.5).setAlpha(0.85);
      const g = scene.add.graphics();
      const col = VLAG[i % VLAG.length];
      g.lineStyle(2, 0x8a8f96, 0.7);
      g.beginPath(); g.moveTo(0, 16); g.lineTo(2, 42); g.strokePath(); // touwtje
      g.fillStyle(col, 0.95); g.fillEllipse(0, 0, 30, 36);
      g.fillStyle(0xffffff, 0.5); g.fillEllipse(-7, -9, 9, 12);
      g.fillTriangle(-5, 17, 5, 17, 0, 22);
      c.add(g);
      c.driftSpeed = Phaser.Math.FloatBetween(4, 10);
      scene.clouds.push(c);
    }
    const heuvels = scene.add.graphics().setDepth(-26).setScrollFactor(0.35);
    heuvels.fillStyle(darker(L.bg.bottom, 15), 0.6);
    for (let x = -100; x < scene.scale.width + 200; x += 180) heuvels.fillCircle(x, scene.scale.height, 150);
    return;
  }

  if (L.terrain === 'dino') {
    // DINO-DAL (Wereld 15): een prehistorische vallei — warme oerzon, een
    // rokende vulkaan in de verte, reuzen-varens, dino-silhouetten en hier
    // en daar een rib-botje. Vriendelijk oerwoud, geen eng moeras.
    const zon = scene.add.container(scene.scale.width - 70, 90).setDepth(-28).setScrollFactor(0.25);
    const zg = scene.add.circle(0, 0, 56, 0xffd9a0, 0.42);
    zon.add([zg, scene.add.circle(0, 0, 33, 0xf6a723)]);
    scene.tweens.add({ targets: zg, scale: 1.18, alpha: 0.55, duration: 1900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // de vulkaan in de verte (met rook-pufjes, zoals de Pizza-Vulkaan)
    const verte = scene.add.graphics().setDepth(-27).setScrollFactor(0.3);
    const vb = scene.scale.height - 140;
    const vx = 120;
    verte.fillStyle(0x8a6a5a, 0.95);
    verte.fillTriangle(vx - 130, vb, vx - 24, vb - 240, vx + 24, vb - 240);
    verte.fillTriangle(vx - 24, vb - 240, vx + 24, vb - 240, vx + 130, vb);
    verte.fillRect(vx - 130, vb - 2, 260, 4);
    verte.fillStyle(0xa8857a, 0.9);
    verte.fillTriangle(vx - 90, vb, vx - 22, vb - 226, vx - 4, vb - 226);
    verte.fillStyle(0xe8402c, 0.95); verte.fillEllipse(vx, vb - 240, 46, 12);
    scene.time.addEvent({
      delay: 1500, loop: true, callback: () => {
        if (!scene.scene.isActive()) return;
        const r = scene.add.circle(vx + Phaser.Math.Between(-10, 10), vb - 258, Phaser.Math.Between(7, 12), 0xb9a89a, 0.45).setDepth(-27).setScrollFactor(0.3);
        scene.tweens.add({ targets: r, y: r.y - 80, scale: 2, alpha: 0, duration: 3000, onComplete: () => r.destroy() });
      },
    });
    // dino-silhouetten die in de verte grazen
    verte.fillStyle(0x5d7a4a, 0.55);
    [[300, 1.0], [470, 0.7]].forEach(([dx, sc]) => {
      verte.fillEllipse(dx, vb - 26 * sc, 74 * sc, 34 * sc);                    // lijf
      verte.fillRoundedRect(dx + 28 * sc, vb - 66 * sc, 12 * sc, 46 * sc, 6);  // nek
      verte.fillEllipse(dx + 36 * sc, vb - 68 * sc, 22 * sc, 13 * sc);         // kop
      verte.fillTriangle(dx - 36 * sc, vb - 24 * sc, dx - 78 * sc, vb - 8 * sc, dx - 34 * sc, vb - 8 * sc); // staart
      verte.fillRect(dx - 20 * sc, vb - 14 * sc, 9 * sc, 16 * sc); verte.fillRect(dx + 12 * sc, vb - 14 * sc, 9 * sc, 16 * sc);
    });
    // reuzen-varens
    [[60, 1.2], [230, 0.9], [420, 1.1], [560, 0.8]].forEach(([fx, sc]) => {
      verte.lineStyle(4 * sc, 0x4a7a3f, 0.8);
      for (let a = -2; a <= 2; a++) {
        verte.beginPath(); verte.moveTo(fx, vb);
        verte.lineTo(fx + a * 22 * sc, vb - 70 * sc);
        verte.strokePath();
        verte.fillStyle(0x57944a, 0.7);
        verte.fillEllipse(fx + a * 22 * sc, vb - 74 * sc, 16 * sc, 8 * sc);
      }
    });

    scene.clouds = [];
    for (let i = 0; i < 7; i++) {
      const x = (i / 7) * L.worldW + Phaser.Math.Between(-40, 40);
      const y = Phaser.Math.Between(60, 240);
      const c = scene.add.container(x, y).setDepth(-26).setScrollFactor(0.5).setAlpha(0.9);
      const g = scene.add.graphics();
      g.fillStyle(0xfff3dc, 0.95);
      [[-26, 4, 17], [-6, -8, 23], [16, 0, 20], [34, 7, 14]].forEach(([cx, cy, r]) => g.fillCircle(cx, cy, r));
      c.add(g);
      c.driftSpeed = Phaser.Math.FloatBetween(4, 10);
      scene.clouds.push(c);
    }
    const heuvels = scene.add.graphics().setDepth(-26).setScrollFactor(0.35);
    heuvels.fillStyle(darker(L.bg.bottom, 18), 0.7);
    for (let x = -100; x < scene.scale.width + 200; x += 180) heuvels.fillCircle(x, scene.scale.height, 150);
    return;
  }

  if (L.terrain === 'klok') {
    // DE KLOKKEN-TOREN (Wereld 16): we zijn BINNEN in een reuzenklok —
    // koperen wanden, draaiende tandwielen in de verte, hangende slingers
    // en kleine koekoeksklokjes. Warm lamplicht i.p.v. een zon.
    const lamp = scene.add.container(scene.scale.width - 90, 64).setDepth(-28).setScrollFactor(0.25);
    const gloed = scene.add.circle(0, 10, 42, 0xffe9a8, 0.35);
    const lg = scene.add.graphics();
    lg.lineStyle(3, 0x6e5436, 1); lg.beginPath(); lg.moveTo(0, -64); lg.lineTo(0, -14); lg.strokePath();
    lg.fillStyle(0xb98d3a, 1); lg.fillTriangle(-24, 0, 24, 0, 0, -20);
    lamp.add([gloed, lg, scene.add.circle(0, 6, 11, 0xffe16b)]);
    scene.tweens.add({ targets: gloed, scale: 1.2, alpha: 0.5, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // verre wand: groot tandwiel-silhouet dat heel traag draait + kozijnen
    const wand = scene.add.graphics().setDepth(-28).setScrollFactor(0.12);
    wand.lineStyle(3, 0x8a6a45, 0.22);
    for (let px = 40; px < scene.scale.width + 60; px += 110) {
      wand.strokeRoundedRect(px, 60, 70, scene.scale.height - 140, 8);
    }
    const groot = scene.add.container(90, 200).setDepth(-27).setScrollFactor(0.25).setAlpha(0.5);
    const tg = scene.add.graphics();
    tg.fillStyle(0xb98d3a, 0.8);
    for (let a = 0; a < 10; a++) {
      const ang = (a / 10) * Math.PI * 2;
      tg.fillRoundedRect(Math.cos(ang) * 66 - 8, Math.sin(ang) * 66 - 12, 16, 24, 4);
    }
    tg.fillCircle(0, 0, 62);
    tg.fillStyle(0x8a6a45, 0.9); tg.fillCircle(0, 0, 16);
    for (let a = 0; a < 5; a++) {
      const ang = (a / 5) * Math.PI * 2;
      tg.fillStyle(0xa8813f, 0.5);
      tg.fillEllipse(Math.cos(ang) * 36, Math.sin(ang) * 36, 18, 18);
    }
    groot.add(tg);
    scene.tweens.add({ targets: groot, angle: 360, duration: 60000, repeat: -1 });
    // een tweede, kleiner tandwiel dat andersom draait
    const klein = scene.add.container(240, 320).setDepth(-27).setScrollFactor(0.25).setAlpha(0.4);
    const kg = scene.add.graphics();
    kg.fillStyle(0x9a7a4a, 0.8);
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * Math.PI * 2;
      kg.fillRoundedRect(Math.cos(ang) * 38 - 6, Math.sin(ang) * 38 - 9, 12, 18, 3);
    }
    kg.fillCircle(0, 0, 36); kg.fillStyle(0x7a5c36, 0.9); kg.fillCircle(0, 0, 10);
    klein.add(kg);
    scene.tweens.add({ targets: klein, angle: -360, duration: 42000, repeat: -1 });
    // verre koekoeksklokjes aan de wand
    const kk = scene.add.graphics().setDepth(-27).setScrollFactor(0.3);
    [[400, 160, 0.9], [520, 260, 1.1]].forEach(([hx, hy, sc]) => {
      kk.fillStyle(0x8a6a45, 0.85);
      kk.fillTriangle(hx - 26 * sc, hy, hx + 26 * sc, hy, hx, hy - 26 * sc);
      kk.fillRoundedRect(hx - 20 * sc, hy, 40 * sc, 34 * sc, 5 * sc);
      kk.fillStyle(0xf3e8d0, 0.9); kk.fillCircle(hx, hy + 14 * sc, 11 * sc);
      kk.lineStyle(2 * sc, 0x4a3a26, 1);
      kk.beginPath(); kk.moveTo(hx, hy + 14 * sc); kk.lineTo(hx, hy + 7 * sc); kk.strokePath();
      kk.beginPath(); kk.moveTo(hx, hy + 14 * sc); kk.lineTo(hx + 5 * sc, hy + 14 * sc); kk.strokePath();
      kk.fillStyle(0xb98d3a, 0.9); kk.fillRect(hx - 2 * sc, hy + 34 * sc, 4 * sc, 16 * sc);
      kk.fillEllipse(hx, hy + 52 * sc, 10 * sc, 6 * sc);
    });

    // zwevende radertjes en veertjes drijven voorbij als "wolken"
    scene.clouds = [];
    for (let i = 0; i < 7; i++) {
      const x = (i / 7) * L.worldW + Phaser.Math.Between(-40, 40);
      const y = Phaser.Math.Between(70, 260);
      const c = scene.add.container(x, y).setDepth(-26).setScrollFactor(0.5).setAlpha(0.55);
      const g = scene.add.graphics();
      g.fillStyle(0xc9a05a, 0.9);
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2;
        g.fillRoundedRect(Math.cos(ang) * 16 - 3.5, Math.sin(ang) * 16 - 5.5, 7, 11, 2);
      }
      g.fillCircle(0, 0, 15);
      g.fillStyle(0x8a6a45, 1); g.fillCircle(0, 0, 5);
      c.add(g);
      scene.tweens.add({ targets: c, angle: i % 2 ? 360 : -360, duration: 9000 + i * 800, repeat: -1 });
      c.driftSpeed = Phaser.Math.FloatBetween(3, 8);
      scene.clouds.push(c);
    }
    const heuvels = scene.add.graphics().setDepth(-26).setScrollFactor(0.35);
    heuvels.fillStyle(darker(L.bg.bottom, 16), 0.7);
    for (let x = -100; x < scene.scale.width + 200; x += 180) heuvels.fillCircle(x, scene.scale.height, 150);
    return;
  }

  if (L.terrain === 'circus') {
    // HET CIRCUS-KANON (Wereld 17): binnen in de grote circustent —
    // gestreept tentdoek, lichtjes-slingers, stippen-publiek op de
    // tribunes (het W14-recept) en spotlights op de piste.
    const doek = scene.add.graphics().setDepth(-29).setScrollFactor(0.1);
    const BAAN = [0xd94f3f, 0xf3e8d0];
    const topX = scene.scale.width / 2;
    for (let i = 0; i < 10; i++) {
      doek.fillStyle(BAAN[i % 2], 0.35);
      const x0 = -80 + i * (scene.scale.width + 160) / 10;
      const x1 = x0 + (scene.scale.width + 160) / 10;
      doek.fillTriangle(topX, -40, x0, 240, x1, 240);
    }
    // spotlights die de piste in schijnen
    const spots = scene.add.graphics().setDepth(-28).setScrollFactor(0.15);
    spots.fillStyle(0xfff3b0, 0.13);
    spots.fillTriangle(80, 40, 30, 40, 240, scene.scale.height);
    spots.fillTriangle(400, 40, 450, 40, 260, scene.scale.height);
    scene.tweens.add({ targets: spots, alpha: 0.6, duration: 2100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // tribunes met stippen-publiek + lichtjes-slinger
    const tribune = scene.add.graphics().setDepth(-27).setScrollFactor(0.3);
    const vb = scene.scale.height - 140;
    const TRIB = [0x8a4a6a, 0x5a6a9a];
    for (let ring = 0; ring < 2; ring++) {
      const ty = vb - 30 - ring * 44;
      tribune.fillStyle(TRIB[ring % TRIB.length], 0.55);
      tribune.fillRect(-20, ty, scene.scale.width + 40, 38);
      const PUB = [0xffe16b, 0xf2a7b8, 0x8fd3f2, 0xffffff, 0xf0c060];
      for (let px = 12 + ring * 15; px < scene.scale.width + 20; px += 32) {
        tribune.fillStyle(PUB[(Math.floor(px / 32) + ring) % PUB.length], 0.85);
        tribune.fillCircle(px, ty + 13 + (px % 2) * 6, 6);
      }
    }
    // lichtjes-slinger boven de piste
    const LICHT = [0xffe16b, 0xe8402c, 0x57b947, 0x3f8fe8, 0xf2a7b8];
    tribune.lineStyle(2, 0x8a6a45, 0.8);
    tribune.beginPath(); tribune.moveTo(-20, 200); tribune.lineTo(scene.scale.width / 2, 240); tribune.lineTo(scene.scale.width + 20, 200); tribune.strokePath();
    for (let i = 0; i < 12; i++) {
      const t = i / 11;
      const lx = -20 + t * (scene.scale.width + 40);
      const ly = 200 + Math.sin(t * Math.PI) * 40 + 8;
      tribune.fillStyle(LICHT[i % LICHT.length], 0.95);
      tribune.fillCircle(lx, ly, 5);
    }

    // zwevende confetti-plukjes en ballonnen als "wolken"
    scene.clouds = [];
    for (let i = 0; i < 7; i++) {
      const x = (i / 7) * L.worldW + Phaser.Math.Between(-40, 40);
      const y = Phaser.Math.Between(80, 280);
      const c = scene.add.container(x, y).setDepth(-26).setScrollFactor(0.5).setAlpha(0.8);
      const g = scene.add.graphics();
      if (i % 2) {
        const col = LICHT[i % LICHT.length];
        g.lineStyle(2, 0x8a8f96, 0.7);
        g.beginPath(); g.moveTo(0, 15); g.lineTo(2, 40); g.strokePath();
        g.fillStyle(col, 0.95); g.fillEllipse(0, 0, 26, 32);
        g.fillStyle(0xffffff, 0.5); g.fillEllipse(-6, -8, 8, 10);
      } else {
        for (let k = 0; k < 6; k++) {
          g.fillStyle(LICHT[k % LICHT.length], 0.85);
          g.fillRect(Phaser.Math.Between(-24, 20), Phaser.Math.Between(-18, 14), 7, 4);
        }
      }
      c.add(g);
      c.driftSpeed = Phaser.Math.FloatBetween(4, 9);
      scene.clouds.push(c);
    }
    const heuvels = scene.add.graphics().setDepth(-26).setScrollFactor(0.35);
    heuvels.fillStyle(darker(L.bg.bottom, 15), 0.6);
    for (let x = -100; x < scene.scale.width + 200; x += 180) heuvels.fillCircle(x, scene.scale.height, 150);
    return;
  }

  if (L.terrain === 'ijs') {
    // ONDER-NUL (Wereld 18): een ijspaleis onder een winterlucht met
    // noorderlicht-banden, een bleke winterzon, dwarrelende sneeuw en
    // besneeuwde heuvels.
    const aurora = scene.add.graphics().setDepth(-29).setScrollFactor(0.12);
    const AUR = [0x6fe3c0, 0x7fb8f0, 0xc79ff0];
    for (let i = 0; i < 3; i++) {
      aurora.fillStyle(AUR[i], 0.16);
      const yy = 56 + i * 26;
      aurora.beginPath();
      aurora.moveTo(-40, yy);
      for (let xx = -40; xx <= scene.scale.width + 40; xx += 40) aurora.lineTo(xx, yy + Math.sin(xx / 90 + i) * 18);
      aurora.lineTo(scene.scale.width + 40, yy + 44); aurora.lineTo(-40, yy + 44);
      aurora.closePath(); aurora.fillPath();
    }
    scene.tweens.add({ targets: aurora, alpha: 0.7, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    // bleke winterzon
    const sun = scene.add.container(scene.scale.width - 78, 88).setDepth(-28).setScrollFactor(0.25);
    const glow = scene.add.circle(0, 0, 50, 0xeaf6ff, 0.4);
    sun.add([glow, scene.add.circle(0, 0, 30, 0xffffff, 0.95)]);
    scene.tweens.add({ targets: glow, scale: 1.18, alpha: 0.6, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    // sneeuw-wolken (driften mee in update)
    scene.clouds = [];
    for (let i = 0; i < 8; i++) {
      const x = (i / 8) * L.worldW + Phaser.Math.Between(-40, 40);
      const y = Phaser.Math.Between(70, 250);
      const s = Phaser.Math.FloatBetween(0.7, 1.3);
      const c = scene.add.container(x, y).setDepth(-27).setScale(s).setScrollFactor(0.5);
      const g = scene.add.graphics();
      g.fillStyle(0xeef7ff, 0.95);
      [[-26, 4, 17], [-6, -8, 23], [16, 0, 20], [34, 7, 14], [4, 11, 26]].forEach(([cx, cy, r]) => g.fillCircle(cx, cy, r));
      c.add(g);
      c.driftSpeed = Phaser.Math.FloatBetween(4, 10);
      scene.clouds.push(c);
    }
    // besneeuwde heuvels
    const hills = scene.add.graphics().setDepth(-26).setScrollFactor(0.35);
    for (let x = -100; x < scene.scale.width + 200; x += 180) {
      hills.fillStyle(0xdff0fb, 0.85); hills.fillCircle(x, scene.scale.height, 150);
      hills.fillStyle(0xffffff, 0.6); hills.fillEllipse(x - 40, scene.scale.height - 120, 80, 30);
    }
    // dwarrelende sneeuwvlokjes (vaste laag, licht parallax)
    const snow = scene.add.graphics().setDepth(-25).setScrollFactor(0.6);
    for (let i = 0; i < 60; i++) { snow.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.5, 0.95)); snow.fillCircle(Phaser.Math.Between(0, scene.scale.width), Phaser.Math.Between(0, scene.scale.height), Phaser.Math.FloatBetween(1.2, 2.8)); }
    scene.tweens.add({ targets: snow, y: 20, duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    return;
  }

  if (L.terrain === 'spook') {
    // HET SPOOK-SLOT (Wereld 19): een vriendelijke griezelnacht — paars-blauwe
    // lucht, een grote maan, sterretjes, spinragjes in de hoeken, drijvende
    // vleermuisjes en een kasteel-silhouet op de heuvels.
    const moon = scene.add.container(scene.scale.width - 90, 96).setDepth(-28).setScrollFactor(0.22);
    const halo = scene.add.circle(0, 0, 54, 0xe8e0ff, 0.25);
    moon.add([halo, scene.add.circle(0, 0, 34, 0xf4efd8, 0.98)]);
    const mkr = scene.add.graphics(); mkr.fillStyle(0xd8d0b8, 0.7); mkr.fillCircle(-10, -6, 6); mkr.fillCircle(8, 8, 4); mkr.fillCircle(12, -10, 3);
    moon.add(mkr);
    scene.tweens.add({ targets: halo, scale: 1.15, alpha: 0.4, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    // sterretjes
    const stars = scene.add.graphics().setDepth(-29).setScrollFactor(0.12);
    for (let i = 0; i < 50; i++) { stars.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.4, 0.9)); stars.fillCircle(Phaser.Math.Between(0, scene.scale.width), Phaser.Math.Between(0, 260), Phaser.Math.FloatBetween(1, 2.2)); }
    scene.tweens.add({ targets: stars, alpha: 0.55, duration: 1800, yoyo: true, repeat: -1 });
    // spinragjes in de bovenhoeken
    const web = scene.add.graphics().setDepth(-27).setScrollFactor(0.15);
    web.lineStyle(1.4, 0xbfc4d8, 0.35);
    for (let a = 0; a <= 4; a++) { const ang = (a / 4) * (Math.PI / 2); web.beginPath(); web.moveTo(0, 0); web.lineTo(Math.cos(ang) * 110, Math.sin(ang) * 110); web.strokePath(); }
    for (let r = 28; r <= 100; r += 24) { web.beginPath(); web.moveTo(r, 0); web.lineTo(0, r); web.strokePath(); }
    for (let a = 0; a <= 4; a++) { const ang = (a / 4) * (Math.PI / 2); web.beginPath(); web.moveTo(scene.scale.width, 0); web.lineTo(scene.scale.width - Math.cos(ang) * 110, Math.sin(ang) * 110); web.strokePath(); }
    for (let r = 28; r <= 100; r += 24) { web.beginPath(); web.moveTo(scene.scale.width - r, 0); web.lineTo(scene.scale.width, r); web.strokePath(); }
    // drijvende vleermuisjes (driften mee in update)
    scene.clouds = [];
    for (let i = 0; i < 7; i++) {
      const x = (i / 7) * L.worldW + Phaser.Math.Between(-40, 40);
      const y = Phaser.Math.Between(80, 260);
      const c = scene.add.container(x, y).setDepth(-26).setScrollFactor(0.5).setAlpha(0.85);
      const g = scene.add.graphics();
      g.fillStyle(0x3a2b52, 0.9);
      g.fillCircle(0, 0, 6); g.fillTriangle(-4, -1, -16, -8, -13, 4); g.fillTriangle(4, -1, 16, -8, 13, 4);
      c.add(g);
      c.driftSpeed = Phaser.Math.FloatBetween(6, 12);
      scene.clouds.push(c);
    }
    // kasteel-silhouet met verlichte raampjes
    const kast = scene.add.graphics().setDepth(-26).setScrollFactor(0.35);
    kast.fillStyle(0x241a38, 0.85);
    for (let x = -100; x < scene.scale.width + 200; x += 200) kast.fillCircle(x, scene.scale.height, 150);
    for (const tx of [90, scene.scale.width * 0.5, scene.scale.width - 80]) {
      kast.fillStyle(0x2b2044, 0.9); kast.fillRect(tx - 22, scene.scale.height - 150, 44, 150);
      for (let bx = -22; bx < 22; bx += 14) kast.fillRect(tx + bx, scene.scale.height - 164, 8, 14);
      kast.fillStyle(0xffe16b, 0.8); kast.fillRect(tx - 5, scene.scale.height - 120, 10, 12);
    }
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
  const sop = L.terrain === 'kleren';  // een schuimend sop-bad in de Kleren-Kast
  const ballenbak = L.terrain === 'ballen'; // een zee van kleurige balletjes
  const lava = L.terrain === 'dino';   // borrelende oer-lava in het Dino-Dal
  const kleuren = saus
    ? [0xd0331f, 0xf07c5a, 0xffc14d]
    : stroop ? [0xb96a1e, 0xdca050, 0xffe16b]
    : diepzee ? [0x123a52, 0x1f5f80, 0x7fd0f0]
    : sop ? [0x9fd0e8, 0xd7f0fa, 0xffffff]
    : ballenbak ? [0xe8a23f, 0xf0c060, 0xe8402c]
    : lava ? [0xd0331f, 0xf07c1f, 0xffe16b] : [0x3fa9e0, 0x7fd0f0, 0xffffff];
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
  } else if (scene.level.terrain === 'kleren') {
    // DE KLEREN-KAST (Wereld 13): de grond is een stapel opgevouwen truien —
    // zachte stof-lagen met stiksel-streepjes, en om en om een grote knoop
    // en een opgerold sokje als decoratie.
    const LAAG = [0xe8829e, 0x7fb8e8, 0x9ad08a, 0xf0c060];
    g.fillStyle(0xb99ae0, 1); g.fillRect(x, y + 12, w, h - 12);
    for (let ry = y + 24, k = 0; ry < y + h - 6; ry += 20, k++) {
      g.fillStyle(LAAG[k % LAAG.length], 0.55);
      g.fillRoundedRect(x + 4, ry, w - 8, 16, 8);
    }
    g.fillStyle(0xf2a7b8, 1); g.fillRect(x, y, w, 16);  // bovenste trui-laag
    g.fillStyle(0xf8c4d0, 1); g.fillRect(x, y, w, 6);
    // stiksel-streepjes langs de rand
    g.lineStyle(2, 0xd06a88, 0.9);
    for (let bx = x + 8; bx < x + w - 8; bx += 14) {
      g.beginPath(); g.moveTo(bx, y + 10); g.lineTo(bx + 7, y + 10); g.strokePath();
    }
    // om en om: een grote knoop en een opgerold sokje
    let kle = false;
    for (let fx = x + 50; fx < x + w - 30; fx += 150) {
      kle = !kle;
      if (kle) {
        g.fillStyle(0xf0c060, 1); g.fillCircle(fx, y - 6, 8);
        g.lineStyle(2, 0xb98d12, 1); g.strokeCircle(fx, y - 6, 8);
        g.fillStyle(0xb98d12, 1);
        g.fillCircle(fx - 2.6, y - 8, 1.3); g.fillCircle(fx + 2.6, y - 8, 1.3);
        g.fillCircle(fx - 2.6, y - 3.6, 1.3); g.fillCircle(fx + 2.6, y - 3.6, 1.3);
      } else {
        g.fillStyle(0x7fb8e8, 1); g.fillCircle(fx, y - 7, 8);
        g.lineStyle(2, 0x3f6fa8, 0.9);
        g.beginPath(); g.arc(fx, y - 7, 5, 0, 1.6 * Math.PI); g.strokePath();
        g.fillStyle(0xffffff, 0.9); g.fillRoundedRect(fx + 3, y - 10, 8, 5, 2); // het boordje piept eruit
      }
    }
  } else if (scene.level.terrain === 'ballen') {
    // HET STUITER-STADION (Wereld 14): een verzorgd grasveld met witte
    // krijtlijnen, en om en om een voetbal en een mini-kegel als decoratie.
    g.fillStyle(0xb07a45, 1); g.fillRect(x, y + 12, w, h - 12);
    g.fillStyle(0x9c6b3f, 0.6);
    for (let ex = x + 12; ex < x + w; ex += 46) g.fillEllipse(ex, y + 34, 16, 8);
    g.fillStyle(0x4fae4a, 1); g.fillRect(x, y, w, 16);
    g.fillStyle(lighten(0x4fae4a, 22), 1); g.fillRect(x, y, w, 6);
    // gemaaide banen: om en om een iets donkerder strook
    g.fillStyle(0x429a3f, 0.4);
    for (let bx = x; bx < x + w; bx += 128) g.fillRect(bx, y, Math.min(64, x + w - bx), 16);
    // witte krijtlijnen op het veld
    g.lineStyle(3, 0xffffff, 0.8);
    for (let bx = x + 90; bx < x + w - 40; bx += 240) {
      g.beginPath(); g.moveTo(bx, y + 2); g.lineTo(bx, y + 14); g.strokePath();
    }
    // om en om: een voetbal en een mini-kegel
    let bal = false;
    for (let fx = x + 50; fx < x + w - 30; fx += 150) {
      bal = !bal;
      if (bal) {
        g.fillStyle(0xffffff, 1); g.fillCircle(fx, y - 8, 8);
        g.lineStyle(1.8, 0xd0d6dd, 1); g.strokeCircle(fx, y - 8, 8);
        g.fillStyle(0x16202b, 1);
        for (let a = 0; a < 5; a++) {
          const ang = -Math.PI / 2 + a * (2 * Math.PI / 5);
          g.fillCircle(fx + Math.cos(ang) * 4.6, y - 8 + Math.sin(ang) * 4.6, 1.7);
        }
        g.fillCircle(fx, y - 8, 2);
      } else {
        g.fillStyle(0xf5f9fc, 1);
        g.fillEllipse(fx, y - 3, 10, 5);
        g.fillRoundedRect(fx - 4, y - 18, 8, 15, 3);
        g.fillCircle(fx, y - 18, 3.4);
        g.fillStyle(0xe8402c, 1); g.fillRect(fx - 4, y - 13, 8, 3.4); // rode band
      }
    }
  } else if (scene.level.terrain === 'dino') {
    // DINO-DAL (Wereld 15): oer-aarde met een mos-groene toplaag, en om en
    // om een rib-botje dat uit de grond steekt en een klein varentje.
    g.fillStyle(0x8a6a4a, 1); g.fillRect(x, y + 12, w, h - 12);
    g.fillStyle(0x7a5a3c, 0.6);
    for (let ex = x + 12; ex < x + w; ex += 46) g.fillEllipse(ex, y + 34, 16, 8);
    g.fillStyle(0x6faa4f, 1); g.fillRect(x, y, w, 16);
    g.fillStyle(lighten(0x6faa4f, 20), 1); g.fillRect(x, y, w, 6);
    g.fillStyle(0x578a3f, 1);
    for (let bx = x + 6; bx < x + w; bx += 15) g.fillTriangle(bx, y, bx + 6, y, bx + 3, y - 8);
    // om en om: een rib-botje en een varentje
    let dino = false;
    for (let fx = x + 50; fx < x + w - 30; fx += 150) {
      dino = !dino;
      if (dino) {
        g.lineStyle(4, 0xf3ead2, 1);
        g.beginPath(); g.arc(fx, y + 4, 12, Math.PI, 2 * Math.PI); g.strokePath();
        g.fillStyle(0xf3ead2, 1); g.fillCircle(fx - 12, y + 2, 3); g.fillCircle(fx + 12, y + 2, 3);
      } else {
        g.lineStyle(2.5, 0x3f7a33, 1);
        for (const a of [-1, 0, 1]) {
          g.beginPath(); g.moveTo(fx, y); g.lineTo(fx + a * 8, y - 15); g.strokePath();
        }
        g.fillStyle(0x57944a, 1);
        for (const a of [-1, 0, 1]) g.fillEllipse(fx + a * 8, y - 17, 8, 4.5);
      }
    }
  } else if (scene.level.terrain === 'klok') {
    // DE KLOKKEN-TOREN (Wereld 16): een koperen vloer met klinknagels en
    // paneel-voegen, en om en om een liggend radertje en een sleuteltje.
    g.fillStyle(0x6e5436, 1); g.fillRect(x, y + 12, w, h - 12);
    g.lineStyle(2, 0x5a442c, 0.8);
    for (let ry = y + 30; ry < y + h - 6; ry += 26) { g.beginPath(); g.moveTo(x, ry); g.lineTo(x + w, ry); g.strokePath(); }
    g.fillStyle(0xb98d3a, 1); g.fillRect(x, y, w, 16);
    g.fillStyle(0xd9ad55, 1); g.fillRect(x, y, w, 6);
    // klinknagels langs de rand
    g.fillStyle(0x8a6a2e, 1);
    for (let bx = x + 14; bx < x + w - 8; bx += 34) g.fillCircle(bx, y + 11, 2.6);
    // om en om: een liggend radertje en een opwind-sleuteltje
    let klok = false;
    for (let fx = x + 50; fx < x + w - 30; fx += 150) {
      klok = !klok;
      if (klok) {
        g.fillStyle(0xc9a05a, 1);
        for (let a = 0; a < 8; a++) {
          const ang = (a / 8) * Math.PI * 2;
          g.fillRect(fx + Math.cos(ang) * 9 - 2, y - 9 + Math.sin(ang) * 9 - 3, 4, 6);
        }
        g.fillCircle(fx, y - 9, 8);
        g.fillStyle(0x6e5436, 1); g.fillCircle(fx, y - 9, 3);
      } else {
        g.lineStyle(2.5, 0x9a7a3a, 1);
        g.strokeCircle(fx - 5, y - 14, 4.5);
        g.beginPath(); g.moveTo(fx - 1, y - 12); g.lineTo(fx + 9, y - 4); g.strokePath();
        g.beginPath(); g.moveTo(fx + 5, y - 8); g.lineTo(fx + 8, y - 11); g.strokePath();
      }
    }
  } else if (scene.level.terrain === 'circus') {
    // HET CIRCUS-KANON (Wereld 17): zaagsel-vloer met een rood-witte
    // piste-rand, en om en om een ster-confettiplek en een pauze-balletje.
    g.fillStyle(0xc9a05a, 1); g.fillRect(x, y + 12, w, h - 12);
    g.fillStyle(0xb98d4a, 0.6);
    for (let ex = x + 12; ex < x + w; ex += 46) g.fillEllipse(ex, y + 34, 16, 8);
    g.fillStyle(0xe8d9a8, 1); g.fillRect(x, y, w, 16); // licht zaagsel bovenop
    g.fillStyle(0xf3e8c0, 1); g.fillRect(x, y, w, 6);
    // de piste-rand: rood-witte blokjes
    for (let bx = x; bx < x + w; bx += 36) {
      g.fillStyle(Math.floor(bx / 36) % 2 ? 0xd94f3f : 0xf3e8d0, 1);
      g.fillRect(bx, y + 12, Math.min(36, x + w - bx), 7);
    }
    // om en om: een gouden ster en een gestreept balletje
    let cir = false;
    for (let fx = x + 50; fx < x + w - 30; fx += 150) {
      cir = !cir;
      if (cir) {
        g.fillStyle(0xf6c624, 1);
        for (let a = 0; a < 5; a++) {
          const ang = -Math.PI / 2 + a * (2 * Math.PI / 5);
          g.fillCircle(fx + Math.cos(ang) * 5, y - 8 + Math.sin(ang) * 5, 2.6);
        }
        g.fillCircle(fx, y - 8, 3);
      } else {
        g.fillStyle(0xf3e8d0, 1); g.fillCircle(fx, y - 7, 7);
        g.fillStyle(0xe8402c, 1);
        g.slice(fx, y - 7, 7, -0.5 * Math.PI, 0.5 * Math.PI, false); g.fillPath();
        g.fillStyle(0xffffff, 0.5); g.fillEllipse(fx - 2, y - 10, 4, 3);
        g.lineStyle(1.6, 0xb93227, 1); g.strokeCircle(fx, y - 7, 7);
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
  } else if (scene.level.terrain === 'letters') {
    // DE PRAATWEIDE (Letter-Land): fris gras met om en om een gekleurd
    // letter-tegeltje en een vrolijk bloemetje — de weide waar woorden groeien.
    g.fillStyle(0xb07a45, 1); g.fillRect(x, y + 12, w, h - 12);
    g.fillStyle(0x9c6b3f, 0.6);
    for (let ex = x + 12; ex < x + w; ex += 46) g.fillEllipse(ex, y + 34, 16, 8);
    g.fillStyle(0x63c24d, 1); g.fillRect(x, y, w, 16);
    g.fillStyle(lighten(0x63c24d, 22), 1); g.fillRect(x, y, w, 6);
    g.fillStyle(0x3f9d3f, 1);
    for (let bx = x + 6; bx < x + w; bx += 16) g.fillTriangle(bx, y, bx + 5, y, bx + 2.5, y - 6);
    let lt = false;
    for (let fx = x + 50; fx < x + w - 30; fx += 130) {
      lt = !lt;
      const k = Math.floor(fx / 130);
      if (lt) {
        // klein letter-tegeltje dat uit het gras piept
        const col = RAINBOW[k % RAINBOW.length];
        g.fillStyle(col, 1); g.fillRoundedRect(fx - 9, y - 20, 18, 18, 5);
        g.fillStyle(0xffffff, 0.22); g.fillRoundedRect(fx - 9, y - 20, 18, 7, 5);
        g.lineStyle(2, 0x2b2f3a, 1); g.strokeRoundedRect(fx - 9, y - 20, 18, 18, 5);
        letterStroke(g, ABC[k % 26], fx - 9 + 18 * 0.16, y - 20 + 18 * 0.16, 18 * 0.68, 2.4, 0xffffff);
      } else {
        // vrolijk bloemetje
        g.fillStyle(0xff6b9d, 1);
        for (let a = 0; a < 5; a++) { const ang = -Math.PI / 2 + a * (2 * Math.PI / 5); g.fillCircle(fx + Math.cos(ang) * 4, y - 8 + Math.sin(ang) * 4, 3); }
        g.fillStyle(0xffe16b, 1); g.fillCircle(fx, y - 8, 2.4);
      }
    }
  } else if (scene.level.terrain === 'spook') {
    // HET SPOOK-SLOT (Wereld 19): oude kasteelvloer — donkere flagstones met
    // een paarse gloed-rand, en om en om een grafzerkje en een pompoen-lampje.
    g.fillStyle(0x3a3550, 1); g.fillRect(x, y + 12, w, h - 12);
    g.fillStyle(0x2b2842, 0.7);
    for (let ex = x + 10; ex < x + w; ex += 40) g.fillRect(ex, y + 12, 2, h - 12);
    g.fillStyle(0x4a4568, 1); g.fillRect(x, y, w, 16);
    g.fillStyle(0x6a5f88, 1); g.fillRect(x, y, w, 6);
    g.fillStyle(0xbfa0f0, 0.5); g.fillRect(x, y, w, 2);
    let spk = false;
    for (let fx = x + 50; fx < x + w - 30; fx += 150) {
      spk = !spk;
      if (spk) {
        g.fillStyle(0x8a8f9a, 1); g.fillRoundedRect(fx - 8, y - 20, 16, 20, 5);
        g.slice(fx, y - 20, 8, Math.PI, 0, false); g.fillPath();
        g.lineStyle(1.5, 0x4a4f58, 1); g.strokeRoundedRect(fx - 8, y - 20, 16, 20, 5);
      } else {
        g.fillStyle(0xf0821f, 1); g.fillCircle(fx, y - 8, 7);
        g.fillStyle(0x2b2f34, 1);
        g.fillTriangle(fx - 4, y - 9, fx - 1, y - 9, fx - 2.5, y - 5);
        g.fillTriangle(fx + 4, y - 9, fx + 1, y - 9, fx + 2.5, y - 5);
        g.fillStyle(0x57a94f, 1); g.fillRect(fx - 1, y - 16, 2, 4);
      }
    }
  } else if (scene.level.terrain === 'ijs') {
    // ONDER-NUL (Wereld 18): pakijs — een blauw-witte laag met een glazige
    // toplaag, en om en om een sneeuwmannetje en een ijskristal.
    g.fillStyle(0x9fd0ea, 1); g.fillRect(x, y + 12, w, h - 12);
    g.fillStyle(0x7fb8d8, 0.6);
    for (let ex = x + 12; ex < x + w; ex += 46) g.fillEllipse(ex, y + 34, 16, 8);
    g.fillStyle(0xeaf6ff, 1); g.fillRect(x, y, w, 16);
    g.fillStyle(0xffffff, 1); g.fillRect(x, y, w, 6);
    g.fillStyle(0xffffff, 0.7);
    for (let gx = x + 20; gx < x + w; gx += 70) g.fillCircle(gx, y + 3, 1.6);
    let ijs = false;
    for (let fx = x + 50; fx < x + w - 30; fx += 150) {
      ijs = !ijs;
      if (ijs) {
        g.fillStyle(0xffffff, 1); g.fillCircle(fx, y - 6, 8); g.fillCircle(fx, y - 18, 6);
        g.lineStyle(2, 0xbfe3fb, 1); g.strokeCircle(fx, y - 6, 8); g.strokeCircle(fx, y - 18, 6);
        g.fillStyle(0x2b2f34, 1); g.fillCircle(fx - 2, y - 19, 1); g.fillCircle(fx + 2, y - 19, 1);
        g.fillStyle(0xe8402c, 1); g.fillTriangle(fx + 2, y - 18, fx + 9, y - 17, fx + 2, y - 16);
      } else {
        g.fillStyle(0xbfe3fb, 0.9); g.fillTriangle(fx - 6, y, fx + 6, y, fx, y - 20);
        g.fillStyle(0xffffff, 0.7); g.fillTriangle(fx - 2, y, fx + 2, y, fx, y - 14);
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
