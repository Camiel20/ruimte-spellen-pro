// ===== SYSTEEM: DE REUZENFLIP (Pannenkoeken-Paradijs) =====
// Reuzen-pannenkoeken (met slaperige gezichtjes!) zweven boven het
// stroop-meer. Om de zoveel tijd worden ze wakker, wiebelen ze als
// waarschuwing… en FLIPPEN ze een heel rondje — sta je er dan nog op,
// dan val je! Oversteken tussen de flips door = de eindproef.
// Werkwoord: timing onder druk.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';

const RUST = 2400;    // ms slapen (veilig)
const WIEBEL = 750;   // ms wakker + wiebelen (waarschuwing!)
const FLIP = 950;     // ms de flip zelf (niet solide)

export default {
  build(s, L) {
    s.reuzenflips = [];
    (L.reuzenflips || []).forEach(([x, y, w], i) => {
      // statische body in de platform-groep
      const body = s.add.rectangle(x, y + 10, w, 20, 0x000000, 0);
      s.physics.add.existing(body, true);
      s.platforms.add(body);

      // de reuzen-pannenkoek zelf
      const c = s.add.container(x, y).setDepth(-9);
      const g = s.add.graphics();
      g.fillStyle(0x000000, 0.16); g.fillEllipse(0, 26, w * 0.95, 14);
      g.fillStyle(0xc98a3d, 1); g.fillEllipse(0, 8, w, 26);
      g.fillStyle(0xdca050, 1); g.fillEllipse(0, 3, w, 24);
      g.fillStyle(0xeab86a, 1); g.fillEllipse(-w * 0.06, 0, w - 26, 15);
      // klontje boter + strooppootjes
      g.fillStyle(0xffe16b, 1); g.fillRoundedRect(-w * 0.28, -12, 22, 10, 3);
      g.fillStyle(0xb96a1e, 0.8);
      g.fillRoundedRect(-w * 0.1, 10, 8, 14, 4); g.fillRoundedRect(w * 0.18, 10, 7, 11, 3);
      c.add(g);
      // slaperig gezichtje
      const gezicht = s.add.graphics();
      gezicht.lineStyle(3, 0x7a4a1e, 1);
      gezicht.beginPath(); gezicht.arc(w * 0.08 - 12, -1, 5, 0.15 * Math.PI, 0.85 * Math.PI); gezicht.strokePath(); // oogje dicht
      gezicht.beginPath(); gezicht.arc(w * 0.08 + 12, -1, 5, 0.15 * Math.PI, 0.85 * Math.PI); gezicht.strokePath();
      gezicht.beginPath(); gezicht.arc(w * 0.08, 8, 5, 0.1 * Math.PI, 0.9 * Math.PI); gezicht.strokePath();     // mondje
      c.add(gezicht);

      s.reuzenflips.push({ c, body, x, y, w, fase: 'rust', faseTot: 0, offset: (i % 4) * 850, gestart: false });
    });
  },

  update(s, time) {
    if (!s.reuzenflips || !s.reuzenflips.length) return;
    const p = s.player;
    for (const R of s.reuzenflips) {
      if (!R.gestart) { R.gestart = true; R.faseTot = time + RUST + R.offset; }
      if (time < R.faseTot) continue;

      if (R.fase === 'rust') {
        R.fase = 'wiebel'; R.faseTot = time + WIEBEL;
        if (Math.abs(p.x - R.x) < 420) SFX.pop();
        s.tweens.add({ targets: R.c, angle: { from: -4, to: 4 }, duration: 110, yoyo: true, repeat: 5 });
      } else if (R.fase === 'wiebel') {
        R.fase = 'flip'; R.faseTot = time + FLIP;
        R.body.body.enable = false; // niet meer solide — spring weg!
        if (Math.abs(p.x - R.x) < 420) SFX.split();
        s.tweens.killTweensOf(R.c);
        R.c.setAngle(0);
        s.tweens.add({ targets: R.c, angle: 360, duration: FLIP - 120, ease: 'Sine.inOut', onComplete: () => R.c.setAngle(0) });
        // stroopspetters eronder
        for (let i = 0; i < 5; i++) {
          const d = s.add.circle(R.x + Phaser.Math.Between(-R.w / 2, R.w / 2), R.y + 30, Phaser.Math.Between(3, 6), 0xb96a1e, 0.85).setDepth(8);
          s.tweens.add({ targets: d, y: d.y + Phaser.Math.Between(30, 70), alpha: 0, duration: 500, onComplete: () => d.destroy() });
        }
      } else {
        R.fase = 'rust'; R.faseTot = time + RUST;
        R.body.body.enable = true;
        s.tweens.add({ targets: R.c, scaleY: 0.85, duration: 110, yoyo: true }); // plofje bij het neerkomen
        if (Math.abs(p.x - R.x) < 420) SFX.place();
      }
    }
  },
};
