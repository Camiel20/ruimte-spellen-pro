// ===== SYSTEEM: STINK-WOLKJES (Wc-Wonderland) =====
// Boven een vrolijk drolletje stijgt een groene stank-kolom op — stap erin
// en de stank tilt je zachtjes omhoog (het domste en dus beste grapje van
// het spel). Uitstappen = opzij lopen. Werkwoord: zweven/sturen.

import Phaser from 'phaser';
import { Voice } from '../../voice.js';

const LIFT = -245;   // stijgsnelheid in de kolom
const HOOGTE = 340;  // hoe hoog de stank reikt (standaard)

export default {
  build(s, L) {
    s.stinkZones = [];
    (L.stinkZones || []).forEach((Z) => {
      const groundTop = L.platforms[0][1];
      const hoogte = Z.hoogte || HOOGTE;
      const cx = Z.x + Z.w / 2;

      // het bron-drolletje (mét blij gezichtje — hij is trots op z'n stank)
      const drol = s.add.container(cx, groundTop).setDepth(5);
      const g = s.add.graphics();
      g.fillStyle(0x000000, 0.16); g.fillEllipse(0, 2, 56, 10);
      g.fillStyle(0x8a5a33, 1);
      g.fillEllipse(0, -8, 46, 20); g.fillEllipse(0, -20, 34, 16); g.fillEllipse(2, -30, 20, 12);
      g.fillStyle(0xa9713f, 0.7); g.fillEllipse(-8, -10, 14, 7);
      g.fillStyle(0xffffff, 1); g.fillCircle(-7, -19, 4.5); g.fillCircle(7, -19, 4.5);
      g.fillStyle(0x2c1c0e, 1); g.fillCircle(-7, -18, 2); g.fillCircle(7, -18, 2);
      g.lineStyle(2, 0x2c1c0e, 1); g.beginPath(); g.arc(0, -13, 5, 0.2, Math.PI - 0.2); g.strokePath();
      drol.add(g);
      s.tweens.add({ targets: drol, scaleX: 1.05, scaleY: 0.96, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

      // de groene stank-kolom (zachte slierten die opstijgen)
      const kolom = s.add.graphics().setDepth(3).setAlpha(0.5);
      kolom.fillStyle(0x8fce6a, 0.22); kolom.fillRoundedRect(Z.x, groundTop - hoogte, Z.w, hoogte, 22);
      s.tweens.add({ targets: kolom, alpha: 0.3, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      // opstijgende stink-sliertjes
      s.time.addEvent({
        delay: 420, loop: true, callback: () => {
          if (!s.scene.isActive()) return;
          const w = s.add.graphics().setDepth(4).setAlpha(0.6);
          const sx = Z.x + Phaser.Math.Between(8, Z.w - 8);
          w.lineStyle(3, 0x9fd97a, 0.8);
          w.beginPath(); w.moveTo(0, 0);
          for (let k = 1; k <= 4; k++) w.lineTo(Math.sin(k * 1.8) * 7, -k * 12);
          w.strokePath();
          w.setPosition(sx, groundTop - 20);
          s.tweens.add({ targets: w, y: groundTop - hoogte + 20, alpha: 0, duration: 1600, ease: 'Sine.easeOut', onComplete: () => w.destroy() });
        },
      });

      s.stinkZones.push({ ...Z, hoogte, groundTop, wheeAt: 0 });
    });
  },

  update(s, time) {
    if (!s.stinkZones || !s.stinkZones.length) return;
    const p = s.player;
    for (const Z of s.stinkZones) {
      const erin = p.x > Z.x - 4 && p.x < Z.x + Z.w + 4
        && p.y > Z.groundTop - Z.hoogte && p.y < Z.groundTop + 10;
      if (erin) {
        // de stank tilt je zachtjes op
        if (p.body.velocity.y > LIFT) p.body.setVelocityY(Math.max(LIFT, p.body.velocity.y - 30));
        if (time > Z.wheeAt) { Z.wheeAt = time + 1400; Voice.cue('whee'); }
      }
    }
  },
};
