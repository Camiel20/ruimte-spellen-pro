// ===== SYSTEEM: BOTER-GLIJBANEN (Pannenkoeken-Paradijs) =====
// Gesmolten boter op de pannenkoek: stap erop en je GLIJDT — de vaart bouwt
// op en houdt even aan in de lucht (zo scheer je over gaten!). Sturen kan
// een beetje, stoppen niet: de eerste echte momentum-mechaniek van het spel.
// Werkwoord: glijden + op het juiste moment springen.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';

const TOP_SNELHEID = 430;   // vol glij-tempo (sneller dan lopen!)
const OPBOUW = 0.055;       // hoe snel de vaart opbouwt op de baan
const LUCHT_VERVAL = 0.985; // vaart blijft bijna helemaal hangen in de lucht
const GROND_VERVAL = 0.90;  // op gewone grond remt boter-vaart snel af

export default {
  build(s, L) {
    s.glijbanen = [];
    s._glijV = 0;
    (L.glijbanen || []).forEach(([x, w, dir, y]) => {
      const top = y != null ? y : L.platforms[0][1];
      const g = s.add.graphics().setDepth(-8);
      // glimmende boterlaag op de grond
      g.fillStyle(0xffe16b, 0.95); g.fillRoundedRect(x, top - 6, w, 10, 5);
      g.fillStyle(0xfff3b0, 0.9); g.fillRoundedRect(x + 4, top - 6, w - 8, 4, 2);
      // botervlootjes + richtingspijlen
      for (let bx = x + 30; bx < x + w - 20; bx += 110) {
        g.fillStyle(0xffd24d, 1); g.fillRoundedRect(bx - 9, top - 16, 18, 11, 3);
        g.fillStyle(0xfff3b0, 1); g.fillRoundedRect(bx - 9, top - 16, 18, 4, 2);
      }
      g.fillStyle(0xb98d12, 0.75);
      for (let ax = x + 60; ax < x + w - 30; ax += 110) {
        const px = dir > 0 ? ax : ax + 14;
        g.fillTriangle(px, top - 1, px, top + 5, px + dir * 14, top + 2);
      }
      s.glijbanen.push({ x, w, dir, top });
    });
  },

  update(s, time) {
    if (s._glijV === undefined) return;
    if (!s.glijbanen || (!s.glijbanen.length && !s._glijV)) return;
    const p = s.player, body = p.body;
    const onFloor = body.blocked.down || body.touching.down;
    const voeten = p.y + p.totalH / 2;

    // sta ik op een boter-baan?
    let baan = null;
    if (onFloor) {
      for (const B of s.glijbanen) {
        if (p.x > B.x - 6 && p.x < B.x + B.w + 6 && Math.abs(voeten - B.top) < 26) { baan = B; break; }
      }
    }

    if (baan) {
      // vaart opbouwen richting de baan-richting
      s._glijV = Phaser.Math.Linear(s._glijV, baan.dir * TOP_SNELHEID, OPBOUW);
      if (!s._glijGeluid || time > s._glijGeluid) { s._glijGeluid = time + 900; SFX.step(); }
      if (Math.abs(s._glijV) > 300 && !s._glijWhee) { s._glijWhee = true; Voice.cue('whee'); }
      // boterspetters onder de voeten
      if (Math.random() < 0.3) {
        const d = s.add.circle(p.x - Math.sign(s._glijV) * 14, voeten - 2, Phaser.Math.Between(2, 4), 0xffe16b, 0.9).setDepth(8);
        s.tweens.add({ targets: d, y: d.y - Phaser.Math.Between(8, 20), alpha: 0, duration: 340, onComplete: () => d.destroy() });
      }
    } else if (onFloor) {
      s._glijV *= GROND_VERVAL; // gewone grond remt af
      s._glijWhee = false;
    } else {
      s._glijV *= LUCHT_VERVAL; // in de lucht: vaart houden (over het gat!)
    }
    // stilstand-drempel alléén buiten de baan (anders smoort hij de opbouw)
    if (!baan && Math.abs(s._glijV) < 24) { s._glijV = 0; s._glijWhee = false; }

    // vaart toepassen: boter wint van je voeten (sturen mag een béétje)
    if (s._glijV !== 0) {
      body.setVelocityX(body.velocity.x * 0.3 + s._glijV);
    }
  },
};
