// ===== SYSTEEM: SPOOK-TREDEN (Het Spook-Slot, Wereld 19) =====
// Spookachtige stenen treden die om de zoveel tijd VERVAGEN — dan zak je er
// dwars doorheen! Ze knipperen eerst als waarschuwing en worden dan even
// doorschijnend. Time je sprong tussen de flikkeringen door. Werkwoord:
// timing/motoriek, in het griezel-thema van het kasteel.
// Veld: `spookTreden: [{ x, y, w, periode }]` — periode = ms vast (default 1600).

import Phaser from 'phaser';
import { SFX } from '../../sound.js';

const KNIPPER = 700; // ms waarschuwing (nog solide, maar flikkert)
const WEG = 900;     // ms doorschijnend (niet solide!)

function tekenTrede(s, x, y, w) {
  const c = s.add.container(x, y).setDepth(-6);
  const g = s.add.graphics();
  g.fillStyle(0x000000, 0.14); g.fillEllipse(0, 16, w * 0.9, 8);
  g.fillStyle(0x6a6f86, 1); g.fillRoundedRect(-w / 2, -8, w, 20, 6);
  g.fillStyle(0x868ca6, 1); g.fillRoundedRect(-w / 2, -8, w, 8, 5);
  g.lineStyle(2, 0x3a2b52, 0.8); g.strokeRoundedRect(-w / 2, -8, w, 20, 6);
  // spookige oogjes op de steen (een figuurtje!)
  g.fillStyle(0xe8f0ff, 0.9); g.fillCircle(-8, 0, 3.4); g.fillCircle(8, 0, 3.4);
  g.fillStyle(0x2b2f34, 1); g.fillCircle(-8, 0, 1.5); g.fillCircle(8, 0, 1.5);
  c.add(g);
  return c;
}

export default {
  build(s, L) {
    s.spookTreden = [];
    (L.spookTreden || []).forEach((T0, i) => {
      const w = T0.w || 120;
      const body = s.add.rectangle(T0.x, T0.y + 6, w, 18, 0x000000, 0);
      s.physics.add.existing(body, true);
      s.platforms.add(body);
      const c = tekenTrede(s, T0.x, T0.y, w);
      s.spookTreden.push({
        ...T0, c, body, w, vast: T0.periode || 1600, fase: 'vast', faseTot: 0,
        offset: (i % 3) * 600, gestart: false,
      });
    });
  },

  update(s, time) {
    if (!s.spookTreden || !s.spookTreden.length) return;
    const p = s.player;
    for (const T of s.spookTreden) {
      if (!T.gestart) { T.gestart = true; T.faseTot = time + T.vast + T.offset; }
      if (time < T.faseTot) continue;

      if (T.fase === 'vast') {
        T.fase = 'knipper'; T.faseTot = time + KNIPPER;
        if (Math.abs(p.x - T.x) < 420) SFX.pop();
        s.tweens.add({ targets: T.c, alpha: 0.5, duration: 120, yoyo: true, repeat: 2 });
      } else if (T.fase === 'knipper') {
        T.fase = 'weg'; T.faseTot = time + WEG;
        T.body.body.enable = false; // niet meer solide — je zakt erdoor!
        s.tweens.killTweensOf(T.c);
        s.tweens.add({ targets: T.c, alpha: 0.18, duration: 200 });
      } else {
        T.fase = 'vast'; T.faseTot = time + T.vast;
        T.body.body.enable = true;
        s.tweens.killTweensOf(T.c);
        s.tweens.add({ targets: T.c, alpha: 1, duration: 180 });
        s.tweens.add({ targets: T.c, scaleY: 0.8, duration: 110, yoyo: true }); // plofje bij terugkomst
        if (Math.abs(p.x - T.x) < 420) SFX.place();
      }
    }
  },
};
