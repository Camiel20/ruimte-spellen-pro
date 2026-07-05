// ===== SYSTEEM: FLIPPERPANNEN (Pannenkoeken-Paradijs) =====
// Koekenpannen als trampolines: land erop en de pan FLIPT je torenhoog de
// lucht in — mét een echte pannenkoek-salto (de speler draait een rondje!).
// Sommige pannen zweven boven stroop-meren: de enige weg naar de overkant.
// Werkwoord: mikken/lanceren.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';

export default {
  build(s, L) {
    s.flippers = [];
    (L.flippers || []).forEach(([x, y]) => {
      const c = s.add.container(x, y).setDepth(5);
      const g = s.add.graphics();
      // steel + pan (van opzij) + pannenkoek erin
      g.fillStyle(0x000000, 0.18); g.fillEllipse(0, 16, 96, 14);
      g.fillStyle(0x5b4a3a, 1); g.fillRoundedRect(40, -8, 46, 10, 5);       // steel
      g.fillStyle(0x2f2a26, 1); g.fillEllipse(0, 0, 96, 26);                 // pan
      g.fillStyle(0x4a443e, 1); g.fillEllipse(0, -4, 84, 18);                // binnenkant
      c.add(g);
      const koek = s.add.graphics();
      koek.fillStyle(0xdca050, 1); koek.fillEllipse(0, -8, 64, 14);
      koek.fillStyle(0xeab86a, 1); koek.fillEllipse(0, -10, 56, 10);
      c.add(koek);
      s.tweens.add({ targets: c, y: y - 6, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      s.flippers.push({ c, koek, x, y, cd: 0 });
    });
  },

  update(s, time) {
    if (!s.flippers || !s.flippers.length) return;
    const p = s.player;
    for (const F of s.flippers) {
      if (time < F.cd) continue;
      // erop landen (vallend of staand, van boven)
      if (Math.abs(p.x - F.x) < 52 && p.y + p.totalH / 2 > F.y - 46 && p.y < F.y + 10 && p.body.velocity.y > -80) {
        F.cd = time + 750;
        p.body.setVelocityY(-(F.kracht || 1020));
        SFX.pick(); Voice.cue('whee');
        // de pan flipt, de pannenkoek springt mee omhoog
        s.tweens.add({ targets: F.c, angle: -24, duration: 90, yoyo: true, ease: 'Quad.out' });
        s.tweens.add({ targets: F.koek, y: -60, angle: 180, duration: 300, yoyo: true, ease: 'Quad.out' });
        // SALTO! de speler draait een heel rondje
        p.setAngle(0);
        s.tweens.add({ targets: p, angle: p.art && p.art.scaleX < 0 ? -360 : 360, duration: 620, ease: 'Sine.out', onComplete: () => p.setAngle(0) });
        const t = s.add.text(F.x, F.y - 60, 'FLIP!', {
          fontFamily: 'Arial Black, Arial', fontSize: '22px', fontStyle: 'bold',
          color: '#ffe16b', stroke: '#7a3d05', strokeThickness: 6,
        }).setOrigin(0.5).setDepth(60);
        s.tweens.add({ targets: t, y: F.y - 110, alpha: 0, duration: 700, onComplete: () => t.destroy() });
        s.sparkleAt(F.x, F.y - 20, 6);
      }
    }
  },
};
