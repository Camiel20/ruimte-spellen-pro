// ===== SYSTEEM: ZWEM-ZONES (Bubbel-Zee, Wereld 12) =====
// Kolommen "diep water" waarin je ZWEMT in plaats van springt: je zakt maar
// langzaam, en elke sprong-tik is een zwemslag — je kunt er eindeloos veel
// maken, dus tik-tik-tik = omhoog zwemmen naar sterren en gouden nullen.
// Het nieuwe beweeg-gevoel van de Bubbel-Zee (broertje van de maan-zones,
// maar dan zonder plafond aan je sprongen).
// Veld: `zwemZones: [{ x, w }]` (schermhoge kolom, zoals maan-zones).

import Phaser from 'phaser';
import { SFX } from '../../sound.js';

const ZWEM_OMHOOG = -300; // max stijg-snelheid (zwemslag-plafond)
const ZWEM_OMLAAG = 130;  // max zak-snelheid (dobberen, nooit pletter-vallen)

export default {
  build(s, L) {
    s.zwemZones = L.zwemZones || [];
    s.inZwemZone = false;
    if (!s.zwemZones.length) return;
    const groundTop = L.platforms[0][1];
    s.zwemZones.forEach((Z) => {
      // blauwe water-kolom met golfrandje en bubbels
      const g = s.add.graphics().setDepth(-13);
      g.fillStyle(0x3fa9e0, 0.14); g.fillRoundedRect(Z.x, 56, Z.w, groundTop - 56, 26);
      g.lineStyle(2.5, 0x7fd0f0, 0.5); g.strokeRoundedRect(Z.x, 56, Z.w, groundTop - 56, 26);
      g.fillStyle(0xd7f0fa, 0.4);
      for (let wx = Z.x + 10; wx < Z.x + Z.w - 10; wx += 40) g.fillEllipse(wx + 16, 62, 26, 7);
      s.tweens.add({ targets: g, alpha: 0.6, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      // bubbel-bordje bovenaan de zone
      const icon = s.add.container(Z.x + Z.w / 2, 88).setDepth(-12);
      const ig = s.add.graphics();
      ig.lineStyle(3, 0x7fd0f0, 1); ig.strokeCircle(0, 0, 14); ig.strokeCircle(13, -11, 7);
      ig.fillStyle(0xffffff, 0.55); ig.fillCircle(-4, -4, 3.5);
      icon.add(ig);
      s.tweens.add({ targets: icon, y: 80, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });
  },

  update(s) {
    if (!s.zwemZones.length) return;
    const p = s.player, b = p.body;
    const inZone = s.zwemZones.some((Z) => p.x >= Z.x && p.x <= Z.x + Z.w);
    if (inZone !== s.inZwemZone) {
      s.inZwemZone = inZone;
      // bijna gewichtloos in het water (Arcade telt lijf-gravity bij de wereld op)
      b.setGravityY(inZone ? -s.physics.world.gravity.y * 0.8 : 0);
      if (inZone) {
        SFX.sparkle();
        s.questText.setText('Diep water — tik-tik-tik omhoog zwemmen! 🐠');
      }
    }
    if (inZone) {
      // zwemslagen: sprongen nooit "op" + snelheid gedempt tot zwem-tempo
      s.jumpsUsed = 0;
      s.lastGroundAt = s.time.now; // coyote altijd vers: elke tik is een slag
      if (b.velocity.y < ZWEM_OMHOOG) b.setVelocityY(ZWEM_OMHOOG);
      if (b.velocity.y > ZWEM_OMLAAG) b.setVelocityY(ZWEM_OMLAAG);
      // bubbel-spoor terwijl je zwemt
      if (!b.blocked.down && Math.random() < 0.1) {
        const bub = s.add.circle(p.x + Phaser.Math.Between(-10, 10), p.y - p.totalH / 2, Phaser.Math.Between(2, 4), 0xd7f0fa, 0.8).setDepth(11);
        s.tweens.add({ targets: bub, y: bub.y - Phaser.Math.Between(30, 60), alpha: 0, duration: 700, onComplete: () => bub.destroy() });
      }
    }
  },
};
