// ===== SYSTEEM: SAUS-GEISERS (Pizza-Vulkaan) =====
// Tomatensaus-fonteinen die periodiek uitbarsten en je omhoog lanceren —
// dé manier om hoge richels te halen in de Pizza-Vulkaan. Eerst borrelt
// het blik even (waarschuwing), dan spuit de zuil omhoog. Werkwoord: timen.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';

const RUST = 1500;     // ms stil
const BORREL = 650;    // ms pruttelen (waarschuwing)
const SPUIT = 1100;    // ms uitbarsting

export default {
  build(s, L) {
    s.geisers = [];
    (L.geisers || []).forEach((G) => {
      const groundTop = L.platforms[0][1];
      const hoogte = G.hoogte || 300;

      // het tomatenblik (rood met witte wikkel + tomaat erop)
      const blik = s.add.container(G.x, groundTop).setDepth(6);
      const bg = s.add.graphics();
      bg.fillStyle(0x000000, 0.18); bg.fillEllipse(0, 2, 62, 12);
      bg.fillStyle(0xc0392b, 1); bg.fillRoundedRect(-24, -44, 48, 44, 6);
      bg.fillStyle(0xf5efe2, 1); bg.fillRect(-24, -34, 48, 20);
      bg.fillStyle(0xe8402c, 1); bg.fillCircle(0, -24, 7);
      bg.fillStyle(0x57b947, 1); bg.fillEllipse(2, -31, 8, 4);
      bg.lineStyle(3, 0x7a1d12, 1); bg.strokeRoundedRect(-24, -44, 48, 44, 6);
      bg.fillStyle(0x7a1d12, 1); bg.fillEllipse(0, -44, 48, 10);
      bg.fillStyle(0xe8402c, 1); bg.fillEllipse(0, -44, 38, 6); // saus in het blik
      blik.add(bg);

      // de saus-zuil (schaalt vanaf de grond omhoog)
      const zuil = s.add.container(G.x, groundTop - 40).setDepth(5);
      const zg = s.add.graphics();
      zg.fillStyle(0xe8402c, 0.92); zg.fillRoundedRect(-16, -hoogte, 32, hoogte, 14);
      zg.fillStyle(0xf07c5a, 0.85); zg.fillRoundedRect(-8, -hoogte + 6, 12, hoogte - 6, 6);
      // spetter-kop bovenop
      zg.fillStyle(0xe8402c, 0.95);
      zg.fillCircle(0, -hoogte, 18); zg.fillCircle(-16, -hoogte + 10, 9); zg.fillCircle(15, -hoogte + 8, 10);
      zuil.add(zg);
      zuil.setScale(1, 0);

      // pruttel-bubbels (zichtbaar tijdens de waarschuwing)
      const bubbels = s.add.container(G.x, groundTop - 44).setDepth(7).setVisible(false);
      for (let i = 0; i < 3; i++) {
        const b = s.add.circle((i - 1) * 10, 0, 4 + i, 0xf07c5a, 0.9);
        bubbels.add(b);
        s.tweens.add({ targets: b, y: -14 - i * 4, alpha: 0.2, duration: 300, yoyo: true, repeat: -1, delay: i * 90 });
      }

      s.geisers.push({
        ...G, hoogte, groundTop, zuil, bubbels,
        faseTot: 0, fase: 'rust',
        offset: G.offset || 0, gestart: false,
      });
    });
  },

  update(s, time, delta) {
    if (!s.geisers || !s.geisers.length) return;
    const p = s.player;
    for (const G of s.geisers) {
      // eerste tik van de klok (offset zodat geisers om-en-om spuiten)
      if (!G.gestart) { G.gestart = true; G.faseTot = time + RUST + G.offset; }

      if (time >= G.faseTot) {
        if (G.fase === 'rust') {
          G.fase = 'borrel'; G.faseTot = time + BORREL;
          G.bubbels.setVisible(true);
          if (Math.abs(p.x - G.x) < 320) SFX.pop();
        } else if (G.fase === 'borrel') {
          G.fase = 'spuit'; G.faseTot = time + SPUIT;
          G.bubbels.setVisible(false);
          s.tweens.add({ targets: G.zuil, scaleY: 1, duration: 160, ease: 'Back.out' });
          if (Math.abs(p.x - G.x) < 420) SFX.sparkle();
        } else {
          G.fase = 'rust'; G.faseTot = time + RUST + (G.periode || 0);
          s.tweens.add({ targets: G.zuil, scaleY: 0, duration: 220, ease: 'Sine.in' });
        }
      }

      // lancering: in de zuil staan tijdens de uitbarsting = omhoog!
      if (G.fase === 'spuit' && G.zuil.scaleY > 0.5) {
        const top = G.groundTop - 40 - G.hoogte * G.zuil.scaleY;
        if (Math.abs(p.x - G.x) < 30 && p.y > top - 20 && p.y < G.groundTop + 8) {
          if (p.body.velocity.y > -420) {
            p.body.setVelocityY(-(G.kracht || 860));
            if (time > (G.wheeAt || 0)) { G.wheeAt = time + 900; Voice.cue('whee'); SFX.pick(); }
            // saus-spetters aan je voeten
            for (let i = 0; i < 5; i++) {
              const d = s.add.circle(p.x + Phaser.Math.Between(-14, 14), p.y + 20, Phaser.Math.Between(3, 6), 0xe8402c, 0.9).setDepth(8);
              s.tweens.add({ targets: d, y: d.y + Phaser.Math.Between(30, 70), alpha: 0, duration: 420, onComplete: () => d.destroy() });
            }
          }
        }
      }
    }
  },
};
