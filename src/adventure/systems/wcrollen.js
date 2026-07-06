// ===== SYSTEEM: WC-ROL-PLATFORMS (Wc-Wonderland) =====
// Platforms van wc-papier: zodra je erop staat begint de rol af te rollen —
// het papier scheurt en dwarrelt weg, dus dóórlopen! Even later rolt de rol
// zichzelf netjes weer op. Werkwoord: doorlopen/timing.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';

const AFROL = 850;    // ms afrollen (waarschuwing) zodra je erop staat
const OP = 2400;      // ms "papier op" voordat de rol zich weer oprolt

export default {
  build(s, L) {
    s.wcRollen = [];
    (L.wcRollen || []).forEach(([x, y, w]) => {
      const body = s.add.rectangle(x, y + 8, w, 16, 0x000000, 0);
      s.physics.add.existing(body, true);
      s.platforms.add(body);

      const c = s.add.container(x, y).setDepth(-9);
      // de rol zelf (links) — blijft altijd staan
      const rol = s.add.graphics();
      rol.fillStyle(0x000000, 0.15); rol.fillEllipse(-w / 2 + 4, 20, 44, 10);
      rol.fillStyle(0xf5f9fc, 1); rol.fillCircle(-w / 2 + 4, 0, 20);
      rol.fillStyle(0xd9c9a8, 1); rol.fillCircle(-w / 2 + 4, 0, 8); // kokertje
      rol.fillStyle(0xffffff, 0.8); rol.fillCircle(-w / 2 - 2, -6, 6);
      c.add(rol);
      // de papier-strook (het platform)
      const papier = s.add.graphics();
      papier.fillStyle(0xf5f9fc, 1); papier.fillRoundedRect(-w / 2 + 8, -8, w - 8, 16, 5);
      papier.fillStyle(0xdfe8ee, 1);
      for (let px = -w / 2 + 26; px < w / 2 - 12; px += 26) papier.fillRect(px, -8, 2, 16); // velletjes-perforatie
      papier.fillStyle(0xffffff, 0.85); papier.fillRoundedRect(-w / 2 + 8, -8, w - 8, 5, 3);
      c.add(papier);

      s.wcRollen.push({ x, y, w, body, c, rol, papier, staat: 'vol', tot: 0 });
    });
  },

  update(s, time) {
    if (!s.wcRollen || !s.wcRollen.length) return;
    const p = s.player;
    for (const R of s.wcRollen) {
      const erop = (p.body.blocked.down || p.body.touching.down)
        && Math.abs(p.x - R.x) < R.w / 2 + 12
        && Math.abs((p.y + p.totalH / 2) - R.y) < 24;

      if (R.staat === 'vol' && erop) {
        R.staat = 'afrollen'; R.tot = time + AFROL;
        SFX.pop();
        // de rol draait zenuwachtig, het papier wappert
        R.spin = s.tweens.add({ targets: R.rol, angle: -70, duration: 200, repeat: 4 });
        s.tweens.add({ targets: R.papier, y: 2, duration: 100, yoyo: true, repeat: 5 });
      } else if (R.staat === 'afrollen' && time >= R.tot) {
        // het papier scheurt en dwarrelt weg — de body gaat uit
        R.staat = 'op'; R.tot = time + OP;
        R.body.body.enable = false;
        if (R.spin) R.spin.stop();
        R.rol.setAngle(0);
        SFX.split();
        s.tweens.add({ targets: R.papier, y: 46, angle: 14, alpha: 0, duration: 420, ease: 'Quad.easeIn' });
        // dwarrelende snippers
        for (let i = 0; i < 5; i++) {
          const sn = s.add.rectangle(R.x + Phaser.Math.Between(-R.w / 2, R.w / 2), R.y, 12, 8, 0xffffff, 0.95).setDepth(8);
          s.tweens.add({ targets: sn, y: R.y + Phaser.Math.Between(50, 120), x: sn.x + Phaser.Math.Between(-30, 30), angle: Phaser.Math.Between(-200, 200), alpha: 0, duration: Phaser.Math.Between(500, 900), onComplete: () => sn.destroy() });
        }
      } else if (R.staat === 'op' && time >= R.tot) {
        // de rol rolt zich weer op (alleen als de speler er niet middenin hangt)
        if (Math.abs(p.x - R.x) > R.w / 2 + 20 || p.y + p.totalH / 2 < R.y - 30) {
          R.staat = 'vol';
          R.body.body.enable = true;
          R.papier.setAngle(0);
          s.tweens.add({ targets: R.papier, y: 0, alpha: 1, duration: 280, ease: 'Back.easeOut' });
          s.tweens.add({ targets: R.rol, angle: 360, duration: 320, onComplete: () => R.rol.setAngle(0) });
          SFX.place();
        } else {
          R.tot = time + 400;
        }
      }
    }
  },
};
