// ===== SYSTEEM: MAAN-ZONES =====
// Zones met maan-zwaartekracht: binnen de zone val je langzaam en spring je
// superhoog — zo haal je richels die normaal onbereikbaar zijn. Werkwoord:
// zweven. (Alleen de speler zweeft; Grommels merken er niets van.)

import { SFX } from '../../sound.js';

export default {
  build(s, L) {
    s.maanZones = L.maanZones || [];
    s.inMaanZone = false;
    if (!s.maanZones.length) return;
    const groundTop = L.platforms[0][1];
    s.maanZones.forEach((Z) => {
      const g = s.add.graphics().setDepth(-13);
      g.fillStyle(0x9fb6ff, 0.08); g.fillRoundedRect(Z.x, 56, Z.w, groundTop - 56, 26);
      g.lineStyle(2.5, 0xbfd0ff, 0.4); g.strokeRoundedRect(Z.x, 56, Z.w, groundTop - 56, 26);
      // zwevende fonkeltjes in de zone
      g.fillStyle(0xffffff, 0.5);
      for (let i = 0; i < Math.floor(Z.w / 46); i++) {
        g.fillCircle(Z.x + 24 + i * 46, 130 + ((i * 97) % (groundTop - 220)), 2.2);
      }
      s.tweens.add({ targets: g, alpha: 0.55, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      // maantje-bordje bovenaan de zone
      const icon = s.add.container(Z.x + Z.w / 2, 88).setDepth(-12);
      const ig = s.add.graphics();
      ig.fillStyle(0xe8e4f0, 1); ig.fillCircle(0, 0, 16);
      ig.fillStyle(0xc9c4d8, 0.9); ig.fillCircle(-5, -3, 4); ig.fillCircle(6, 4, 3);
      ig.lineStyle(2.5, 0x8a86ad, 1); ig.strokeCircle(0, 0, 16);
      icon.add(ig);
      s.tweens.add({ targets: icon, y: 96, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });
  },

  update(s) {
    if (!s.maanZones.length) return;
    const px = s.player.x;
    const inZone = s.maanZones.some((Z) => px >= Z.x && px <= Z.x + Z.w);
    if (inZone !== s.inMaanZone) {
      s.inMaanZone = inZone;
      // Arcade telt wereld- + lijf-zwaartekracht op: −55% van de wereld ≈ zweven.
      s.player.body.setGravityY(inZone ? -s.physics.world.gravity.y * 0.55 : 0);
      if (inZone) { SFX.sparkle(); s.questText.setText('Maan-zwaartekracht — spring superhoog! 🌙'); }
    }
    // zweef-fonkeltjes onder je voeten zolang je in de lucht hangt
    if (inZone && !s.player.body.blocked.down && Math.random() < 0.06) {
      s.sparkleAt(s.player.x, s.player.y + s.player.totalH / 2, 1);
    }
  },
};
