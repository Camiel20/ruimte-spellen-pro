import Phaser from 'phaser';
import { SFX } from './sound.js';

// Huisstijl van NUL & CO — de "thuiswereld" van de app.
//
// Overal dezelfde warme taal: heldere lucht, zon en wolkjes, gras met
// bloemetjes, witte kaarten en felle kleuren met een dikke donkere rand.
// Ruimte-decors bestaan alleen nog BINNEN spellen (als bestemming), niet
// als schil van de app.
//
// Gebruik:
//   luchtAchtergrond(this);            // in create() van een scherm
//   const nul = maakNul(this, x, y, r) // de mascotte (met .arm om te zwaaien)
//   terugKnop(this);                   // witte terug-pil linksboven

export const INKT = 0x334155;          // de vaste donkere randkleur
export const LUCHT_BOVEN = 0x8fd7f7;
export const LUCHT_ONDER = 0xd9f0fd;

// Heldere lucht met zon, drijvende wolkjes en (optioneel) een grasrandje.
export function luchtAchtergrond(scene, { gras = true } = {}) {
  const { width, height } = scene.scale;

  const g = scene.add.graphics().setDepth(0);
  g.fillGradientStyle(LUCHT_BOVEN, LUCHT_BOVEN, LUCHT_ONDER, LUCHT_ONDER, 1);
  g.fillRect(0, 0, width, height);

  // Zon met zachte, ademende gloed
  const gloed = scene.add.circle(width - 60, 118, 44, 0xfde68a, 0.55).setDepth(0);
  scene.add.circle(width - 60, 118, 30, 0xfcd34d).setDepth(0);
  scene.tweens.add({ targets: gloed, scale: 1.15, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

  // Wolkjes die zachtjes heen en weer drijven
  [[80, 180, 1], [340, 270, 1.2], [140, 520, 0.9], [380, 640, 1.05]].forEach(([x, y, s]) => {
    const c = scene.add.container(x, y).setDepth(0).setAlpha(0.85);
    [[0, 0, 26, 14], [22, -5, 19, 13], [-21, 4, 17, 11], [8, 7, 22, 10]].forEach(([dx, dy, rx, ry]) => {
      c.add(scene.add.ellipse(dx * s, dy * s, rx * 2 * s, ry * 2 * s, 0xffffff));
    });
    scene.tweens.add({ targets: c, x: x + 24, duration: 7000 + s * 1500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  });

  if (gras) {
    const gr = scene.add.graphics().setDepth(0);
    gr.fillStyle(0x8fd674, 1);
    gr.fillRect(0, height - 44, width, 44);
    gr.fillStyle(0x7bc862, 1);
    for (let x = 20; x < width; x += 52) gr.fillEllipse(x, height - 40, 56, 14);
    const bloemKleuren = [0xf87171, 0xec6aa9, 0xa78bfa, 0xfbbf24];
    for (let i = 0; i < 5; i++) {
      const bx = 40 + i * (width - 80) / 4 + Phaser.Math.Between(-10, 10);
      gr.lineStyle(2, 0x5da84e).lineBetween(bx, height - 24, bx, height - 34);
      gr.fillStyle(bloemKleuren[i % 4], 1).fillCircle(bx, height - 37, 4.5);
      gr.fillStyle(0xfef3c7, 1).fillCircle(bx, height - 37, 1.8);
    }
  }
}

// De mascotte: Nul — een vrolijke ronde nul met een gezichtje.
// Geeft een container terug; `.arm` kun je laten zwaaien, `.knipper()`
// laat de oogjes knipperen.
export function maakNul(scene, x, y, r = 26) {
  const c = scene.add.container(x, y);

  const g = scene.add.graphics();
  g.fillStyle(0xffffff, 1);
  g.fillCircle(0, 0, r);
  g.lineStyle(Math.max(3, r * 0.15), INKT, 1);
  g.strokeCircle(0, 0, r);
  // het gat van de nul (luchtkleurig, zodat het "open" oogt)
  g.fillStyle(0xbfe3fb, 1);
  g.fillCircle(0, -r * 0.06, r * 0.4);
  g.lineStyle(Math.max(2, r * 0.1), INKT, 1);
  g.strokeCircle(0, -r * 0.06, r * 0.4);
  c.add(g);

  // Gezichtje op de band van de nul
  const oogL = scene.add.circle(-r * 0.36, -r * 0.66, r * 0.12, INKT);
  const oogR = scene.add.circle(r * 0.36, -r * 0.66, r * 0.12, INKT);
  const mond = scene.add.graphics();
  mond.lineStyle(Math.max(2, r * 0.09), INKT, 1);
  mond.beginPath();
  mond.arc(0, r * 0.52, r * 0.24, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160));
  mond.strokePath();
  const wangL = scene.add.circle(-r * 0.72, r * 0.02, r * 0.15, 0xf9a8d4, 0.75);
  const wangR = scene.add.circle(r * 0.72, r * 0.02, r * 0.15, 0xf9a8d4, 0.75);
  c.add([oogL, oogR, mond, wangL, wangR]);

  // Zwaai-armpje (rechts), draait om zijn schoudertje
  const arm = scene.add.graphics();
  arm.lineStyle(Math.max(3, r * 0.13), INKT, 1);
  arm.lineBetween(0, 0, r * 0.5, -r * 0.55);
  arm.fillStyle(0xffffff, 1);
  arm.fillCircle(r * 0.5, -r * 0.55, r * 0.16);
  arm.lineStyle(2, INKT, 1);
  arm.strokeCircle(r * 0.5, -r * 0.55, r * 0.16);
  arm.setPosition(r * 0.86, -r * 0.14);
  c.add(arm);
  c.arm = arm;

  c.knipper = () => {
    scene.tweens.add({ targets: [oogL, oogR], scaleY: 0.15, duration: 70, yoyo: true });
  };
  return c;
}

// Witte terug-pil linksboven — hetzelfde op elk scherm.
export function terugKnop(scene, doel = 'Menu') {
  const b = scene.add.text(16, 16, '⬅ Terug', {
    fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#334155',
    backgroundColor: '#ffffff', padding: { x: 12, y: 7 },
  }).setDepth(50).setInteractive({ useHandCursor: true });
  b.on('pointerdown', () => { SFX.click(); scene.scene.start(doel); });
  return b;
}

// Donkere titel voor op de lichte lucht (vervangt de witte koppen).
export function schermTitel(scene, y, tekst) {
  return scene.add.text(scene.scale.width / 2, y, tekst, {
    fontFamily: 'Arial Black, Arial', fontSize: '26px', fontStyle: 'bold',
    color: '#1f2d3a',
  }).setOrigin(0.5).setDepth(10);
}
