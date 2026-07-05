// ===== SYSTEEM: KANTEL-PUNTEN (Pizza-Vulkaan) =====
// Platforms van pizzapunten die even ná je landing wiebelen en dan omklappen —
// je moet dus dóór blijven springen. Na een paar tellen veren ze terug.
// Werkwoord: timen/doorspringen.

import { SFX } from '../../sound.js';

const WIEBEL = 620;   // ms wiebelen (waarschuwing) voor het kantelen
const WEG = 2100;     // ms weg voordat de punt terugveert

export default {
  build(s, L) {
    s.kantels = [];
    (L.kantels || []).forEach(([x, y, w]) => {
      // onzichtbare statische body in de platforms-groep (collider bestaat al)
      const body = s.add.rectangle(x, y + 9, w, 18, 0x000000, 0);
      s.physics.add.existing(body, true);
      s.platforms.add(body);

      // de pizzapunt zelf: korst-randen, kaas-bovenkant, salami's
      const c = s.add.container(x, y).setDepth(-9);
      const g = s.add.graphics();
      const hw = w / 2;
      g.fillStyle(0x000000, 0.15); g.fillEllipse(0, 22, w * 0.9, 10);
      g.fillStyle(0xc98a3d, 1); g.fillRoundedRect(-hw, 0, w, 18, 8);          // korst-onderkant
      g.fillStyle(0xf6c624, 1); g.fillRoundedRect(-hw, -2, w, 12, 6);         // kaaslaag
      g.fillStyle(0xffe16b, 1); g.fillRoundedRect(-hw, -2, w, 5, 3);          // kaas-glans
      // druipende kaas
      g.fillStyle(0xf6c624, 1);
      for (let dx = -hw + 14; dx < hw - 8; dx += 34) g.fillTriangle(dx, 10, dx + 9, 10, dx + 4.5, 22);
      // salami's + basilicum om en om
      let sal = false;
      for (let dx = -hw + 18; dx < hw - 12; dx += 40) {
        sal = !sal;
        if (sal) {
          g.fillStyle(0xe8402c, 1); g.fillCircle(dx, 2, 7);
          g.fillStyle(0xb93227, 1); g.fillCircle(dx - 2, 0, 1.8); g.fillCircle(dx + 2, 3, 1.6);
        } else {
          g.fillStyle(0x57b947, 1); g.fillEllipse(dx, 2, 12, 7);
          g.lineStyle(1.5, 0x2f7d33, 1); g.beginPath(); g.moveTo(dx - 5, 2); g.lineTo(dx + 5, 2); g.strokePath();
        }
      }
      // dikke korst-uiteinden (bolletjes)
      g.fillStyle(0xdca050, 1); g.fillCircle(-hw + 2, 8, 11); g.fillCircle(hw - 2, 8, 11);
      g.fillStyle(0xeab86a, 1); g.fillCircle(-hw + 2, 6, 7); g.fillCircle(hw - 2, 6, 7);
      c.add(g);

      s.kantels.push({ x, y, w, body, c, staat: 'vast', tot: 0, baseY: y });
    });
  },

  update(s, time) {
    if (!s.kantels || !s.kantels.length) return;
    const p = s.player;
    for (const K of s.kantels) {
      const erop = (p.body.blocked.down || p.body.touching.down)
        && Math.abs(p.x - K.x) < K.w / 2 + 12
        && Math.abs((p.y + p.totalH / 2) - K.y) < 26;

      if (K.staat === 'vast' && erop) {
        K.staat = 'wiebel'; K.tot = time + WIEBEL;
        SFX.pop();
        s.tweens.add({ targets: K.c, angle: { from: -3, to: 3 }, duration: 90, yoyo: true, repeat: 6 });
      } else if (K.staat === 'wiebel' && time >= K.tot) {
        // KANTELEN — de kant waar je staat klapt omlaag
        K.staat = 'weg'; K.tot = time + WEG;
        K.body.body.enable = false;
        const richting = p.x >= K.x ? 1 : -1;
        SFX.split();
        s.tweens.add({ targets: K.c, angle: richting * 52, y: K.baseY + 26, alpha: 0.35, duration: 360, ease: 'Quad.in' });
      } else if (K.staat === 'weg' && time >= K.tot) {
        // terugveren (alleen als de speler er niet middenin staat)
        if (Math.abs(p.x - K.x) > K.w / 2 + 20 || p.y + p.totalH / 2 < K.y - 30) {
          K.staat = 'vast';
          K.body.body.enable = true;
          s.tweens.add({ targets: K.c, angle: 0, y: K.baseY, alpha: 1, duration: 260, ease: 'Back.out' });
          SFX.place();
        } else {
          K.tot = time + 400; // wacht heel even tot de speler weg is
        }
      }
    }
  },
};
