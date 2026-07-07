// ===== SYSTEEM: STUITER-BILLEN (Billenland, Wereld 11) =====
// Grote zachte billen als trampolines: land erop en je wordt met een
// daverende PRRRT! hoog de lucht in gelanceerd — hoger dan je zelf kunt
// springen, en je dubbelsprong is weer opgeladen. Het beweeg-werkwoord van
// Billenland (giechel-garantie voor Adrian).
// Veld: `bilTrampolines: [[x, y]]` — (x, y) = de bovenkant van de bil.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';

const LANCEER = -840;  // flink hoger dan de gewone sprong (600)

export default {
  build(s, L) {
    s.bilTrampolines = [];
    (L.bilTrampolines || []).forEach(([x, y]) => {
      const c = s.add.container(x, y).setDepth(3);
      const g = s.add.graphics();
      // schaduw + twee zachte bollen met een spleet en blosjes
      g.fillStyle(0x000000, 0.14); g.fillEllipse(0, 34, 96, 14);
      g.fillStyle(0xf2b8a0, 1);
      g.fillCircle(-24, 8, 32); g.fillCircle(24, 8, 32);
      g.fillRect(-42, 12, 84, 22);
      g.fillStyle(0xf8cdb8, 0.8); g.fillEllipse(-28, -4, 26, 18); g.fillEllipse(20, -4, 26, 18); // glans
      g.lineStyle(3.5, 0xd08a70, 1);
      g.beginPath(); g.moveTo(0, -20); g.lineTo(0, 30); g.strokePath(); // de spleet
      g.lineStyle(3, 0xd08a70, 0.8); g.strokeCircle(-24, 8, 32); g.strokeCircle(24, 8, 32);
      // blosjes
      g.fillStyle(0xf08a8a, 0.55); g.fillEllipse(-32, 6, 18, 11); g.fillEllipse(32, 6, 18, 11);
      c.add(g);
      // rustig mee-ademen
      s.tweens.add({ targets: c, scaleY: 1.04, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      s.bilTrampolines.push({ c, x, y, cd: 0 });
    });
  },

  update(s, time) {
    if (!s.bilTrampolines || !s.bilTrampolines.length) return;
    const p = s.player, b = p.body;
    for (const bil of s.bilTrampolines) {
      if (time < bil.cd) continue;
      // alleen bij LANDEN op de bil (vallend, voeten rond de bovenkant)
      if (b.velocity.y > 60 && Math.abs(p.x - bil.x) < 52
        && b.bottom > bil.y - 26 && b.bottom < bil.y + 34) {
        bil.cd = time + 350;
        b.setVelocityY(LANCEER);
        s.jumpsUsed = 0; // dubbelsprong weer opgeladen — stuiter-kettingen!
        SFX.split(); Voice.cue('laugh'); // PRRRT + giechel
        s.squashArt(0.8, 1.3, 160);
        // de bil deukt in en wipt terug
        s.tweens.killTweensOf(bil.c);
        bil.c.setScale(1, 1);
        s.tweens.add({ targets: bil.c, scaleY: 0.62, scaleX: 1.18, duration: 110, yoyo: true, ease: 'Quad.out',
          onComplete: () => s.tweens.add({ targets: bil.c, scaleY: 1.04, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut' }) });
        // PRRRT-wolkje + tekstje
        for (let i = 0; i < 5; i++) {
          const w = s.add.circle(bil.x + Phaser.Math.Between(-26, 26), bil.y + 18, Phaser.Math.Between(5, 9), 0xcfe8b8, 0.7).setDepth(4);
          s.tweens.add({ targets: w, y: w.y + Phaser.Math.Between(10, 26), x: w.x + Phaser.Math.Between(-24, 24), alpha: 0, scale: 1.8, duration: 480, onComplete: () => w.destroy() });
        }
        const txt = s.add.text(bil.x, bil.y - 34, 'PRRRT!', {
          fontFamily: 'Arial Black, Arial', fontSize: '17px', fontStyle: 'bold', color: '#7a9d4a',
        }).setOrigin(0.5).setDepth(9).setStroke('#ffffff', 4).setAngle(Phaser.Math.Between(-9, 9));
        s.tweens.add({ targets: txt, y: txt.y - 34, alpha: 0, duration: 650, ease: 'Quad.out', onComplete: () => txt.destroy() });
      }
    }
  },
};
