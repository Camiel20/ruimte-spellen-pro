// ===== SYSTEEM: KOORDDANSEN (het Circus-Kanon, Wereld 17) =====
// Een slap koord tussen twee palen: een smal platform dat zichtbaar
// doorbuigt en wiebelt zodra jij erop staat. De physics is een gewoon
// (smal) platform — het wiebelen zit in de art, dus geen valkuilen. Puur
// balanceer-gevoel: durf jij eroverheen?
// Veld: `koorden: [[x1, x2, y]]`.

import { SFX } from '../../sound.js';

function tekenKoord(g, x1, x2, y, zak) {
  g.clear();
  const mid = (x1 + x2) / 2;
  // de palen
  g.fillStyle(0x8a4a6a, 1);
  g.fillRoundedRect(x1 - 8, y - 8, 10, 60, 4);
  g.fillRoundedRect(x2 - 2, y - 8, 10, 60, 4);
  g.fillStyle(0xf6c624, 1); g.fillCircle(x1 - 3, y - 12, 6); g.fillCircle(x2 + 3, y - 12, 6);
  // het koord (quadratisch doorgebogen)
  g.lineStyle(5, 0xe8d9a8, 1);
  g.beginPath(); g.moveTo(x1, y);
  for (let t = 0.05; t <= 1.001; t += 0.05) {
    const px = x1 + (x2 - x1) * t;
    const py = y + Math.sin(t * Math.PI) * zak;
    g.lineTo(px, py);
  }
  g.strokePath();
  g.lineStyle(2, 0xc9b88a, 0.8);
  g.beginPath(); g.moveTo(x1, y + 3);
  for (let t = 0.05; t <= 1.001; t += 0.05) {
    g.lineTo(x1 + (x2 - x1) * t, y + 3 + Math.sin(t * Math.PI) * zak);
  }
  g.strokePath();
}

export default {
  build(s, L) {
    s.koorden = [];
    (L.koorden || []).forEach(([x1, x2, y]) => {
      // het physics-platform: smal en vlak (het wiebelen is puur visueel)
      const body = s.add.rectangle((x1 + x2) / 2, y + 5, x2 - x1, 10, 0x000000, 0);
      s.physics.add.existing(body, true);
      s.platforms.add(body);
      const g = s.add.graphics().setDepth(3);
      const K = { x1, x2, y, g, zak: 4, doelZak: 4, wiebel: 0 };
      tekenKoord(g, x1, x2, y, 4);
      s.koorden.push(K);
    });
  },

  update(s, time) {
    if (!s.koorden || !s.koorden.length) return;
    const p = s.player, b = p.body;
    for (const K of s.koorden) {
      const opKoord = (b.blocked.down || b.touching.down)
        && p.x > K.x1 - 10 && p.x < K.x2 + 10
        && Math.abs(b.bottom - (K.y + 0)) < 16;
      // het koord zakt door waar jij staat en trilt zachtjes na
      K.doelZak = opKoord ? 14 : 4;
      const wiebel = opKoord ? Math.sin(time * 0.02) * 2.4 : 0;
      const nieuweZak = K.zak + (K.doelZak - K.zak) * 0.15 + wiebel * 0.3;
      if (Math.abs(nieuweZak - K.zak) > 0.15) {
        K.zak = nieuweZak;
        tekenKoord(K.g, K.x1, K.x2, K.y, K.zak);
      }
      // een stapje op het koord mag je horen
      if (opKoord && time > (K.stapCd || 0)) {
        K.stapCd = time + 700;
        if (Math.abs(b.velocity.x) > 40) SFX.step();
      }
    }
  },
};
