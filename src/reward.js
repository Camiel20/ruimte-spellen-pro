// Herbruikbare beloning-overlay voor Phaser-scenes.
// Toont een feestelijk scherm met sterren, eventueel een medaille, en
// confetti. Roep aan met showReward(scene, { titel, sterren, medaille }).

import { addStars, giveMedal } from './progress.js';

export function confettiBurst(scene, depth = 300) {
  const { width } = scene.scale;
  const p = scene.add.particles(width / 2, 80, 'star', {
    x: { min: 0, max: width }, y: -10,
    speedY: { min: 120, max: 320 }, speedX: { min: -60, max: 60 },
    scale: { start: 1.6, end: 0 }, lifespan: 2200, quantity: 3,
    tint: [0xf87171, 0xfbbf24, 0x4ade80, 0x60a5fa, 0xa855f7, 0xec4899],
    blendMode: 'ADD',
  }).setScrollFactor(0).setDepth(depth);
  scene.time.delayedCall(2200, () => p.destroy());
  return p;
}

// Toont een volledig beloningsscherm. onClose wordt aangeroepen bij de knop.
// opts: { title, subtitle, stars, medal, medalLabel, buttonText, onClose }
export function showReward(scene, opts) {
  const { width, height } = scene.scale;
  const cx = width / 2, cy = height / 2;
  const D = 300;
  const items = [];

  const bg = scene.add.graphics().setScrollFactor(0).setDepth(D);
  bg.fillStyle(0x000000, 0.82);
  bg.fillRect(0, 0, width, height);
  items.push(bg);

  if (opts.stars > 0) addStars(opts.stars);
  let newMedal = false;
  if (opts.medal) newMedal = giveMedal(opts.medal);

  confettiBurst(scene, D + 10);

  const icon = scene.add.text(cx, cy - 120, newMedal ? '🏅' : '🌟', { fontSize: '72px' })
    .setOrigin(0.5).setScrollFactor(0).setDepth(D + 1);
  items.push(icon);
  scene.tweens.add({ targets: icon, scale: 1.15, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

  const title = scene.add.text(cx, cy - 50, opts.title || 'Goed gedaan!', {
    fontFamily: 'Arial', fontSize: '30px', fontStyle: 'bold', color: '#fff',
  }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1);
  items.push(title);

  if (opts.subtitle) {
    const sub = scene.add.text(cx, cy - 12, opts.subtitle, {
      fontFamily: 'Arial', fontSize: '17px', color: '#94a3b8', align: 'center', wordWrap: { width: width - 80 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1);
    items.push(sub);
  }

  if (opts.sterrenVan3 != null) {
    // Drie sterren-slots (à la Mario/Angry Birds): je ziet wat je verdiende
    // én wat er nog te halen valt — reden om het level opnieuw te spelen.
    for (let i = 0; i < 3; i++) {
      const st = scene.add.image(cx - 52 + i * 52, cy + 34, 'star')
        .setScale(0.4).setScrollFactor(0).setDepth(D + 1);
      if (i >= opts.sterrenVan3) st.setTint(0x475569).setAlpha(0.55); // nog niet verdiend
      items.push(st);
      scene.tweens.add({
        targets: st, scale: i < opts.sterrenVan3 ? 4.4 : 3.2,
        delay: 250 + i * 220, duration: 300, ease: 'Back.out',
      });
    }
  } else if (opts.stars > 0) {
    const st = scene.add.text(cx, cy + 28, `+${opts.stars}  ⭐`, {
      fontFamily: 'Arial', fontSize: '26px', fontStyle: 'bold', color: '#fbbf24',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1);
    items.push(st);
    scene.tweens.add({ targets: st, scale: 1.1, duration: 500, yoyo: true, repeat: 2 });
  }

  if (newMedal && opts.medalLabel) {
    const ml = scene.add.text(cx, cy + 62, `Nieuwe medaille: ${opts.medalLabel}!`, {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#4ade80',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1);
    items.push(ml);
  }

  const btn = scene.add.text(cx, cy + 120, opts.buttonText || 'Verder 🚀', {
    fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold',
    color: '#1a1a2e', backgroundColor: '#fbbf24', padding: { x: 26, y: 12 },
  }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 2).setInteractive({ useHandCursor: true });
  items.push(btn);
  btn.on('pointerdown', () => {
    items.forEach((o) => o.destroy());
    if (opts.onClose) opts.onClose();
  });

  return items;
}
