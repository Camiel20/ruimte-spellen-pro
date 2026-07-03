// ===== BAAS-REGISTRY: alle baas-looks op één plek =====
// Elke wereld-baas is één entry: hoe hij getekend wordt, hoe hij er blij
// uitziet na de nederlaag, welk projectiel hij schiet en hoe snel. De scene
// kent geen looks meer — een nieuwe baas toevoegen = art in enemyArt.js +
// één entry hier. (Voorheen: if-ketens op vier plekken in AdventureScene.)

import {
  drawBoss, recolorBossHappy,
  drawWaveBoss, drawSprayWall, happyWaveBoss, drawWaveMinion,
  drawTreeBoss, happyTreeBoss, drawAcorn,
  drawCrystalBoss, happyCrystalBoss, drawCrystalShard,
  drawMeteorBoss, happyMeteorBoss, drawFireball,
  drawGrauwBoss, happyGrauwBoss, drawGrauwWolkje,
} from './enemyArt.js';
import { sig } from './palette.js';

export const BOSS_LOOKS = {
  // De klassieke grijze Grommel-baas (W1) — schiet niet terug.
  grommel: {
    draw: (s, x, groundTop) => drawBoss(s, x, groundTop),
    happy: (s, c, pz) => recolorBossHappy(s, c, sig(pz.stages[pz.stages.length - 1].doel)),
    projectile: null,
  },
  // Golf-Baas (W2): waterzuil-blokkade + rollende golfjes.
  golf: {
    draw: (s, x, groundTop) => {
      const c = drawWaveBoss(s, x, groundTop);
      c.sprayWall = drawSprayWall(s, x, groundTop); // zichtbare schermhoge blokkade
      return c;
    },
    happy: (s, c) => happyWaveBoss(s, c),
    projectile: drawWaveMinion,
    speed: -175,
    waarschuwing: 'Pas op — een golf! Spring! 🌊',
  },
  // Boom-Grommel (W3): eikels.
  boom: {
    draw: (s, x, groundTop) => drawTreeBoss(s, x, groundTop),
    happy: (s, c) => happyTreeBoss(s, c),
    projectile: drawAcorn,
    speed: -175,
    waarschuwing: 'Pas op — een eikel! Spring! 🌰',
  },
  // Kristal-Grommel (W4): snellere scherven.
  kristal: {
    draw: (s, x, groundTop) => drawCrystalBoss(s, x, groundTop),
    happy: (s, c) => happyCrystalBoss(s, c),
    projectile: drawCrystalShard,
    speed: -215,
    waarschuwing: 'Pas op — een kristal! Spring! 💎',
  },
  // Meteoor-Grommel (W5): de snelste vuurballen.
  meteoor: {
    draw: (s, x, groundTop) => drawMeteorBoss(s, x, groundTop),
    happy: (s, c) => happyMeteorBoss(s, c),
    projectile: drawFireball,
    speed: -235,
    waarschuwing: 'Pas op — een vuurbal! Spring! ☄️',
  },
  // BARON GRAUW (W6, de finale): grauw-wolkjes — het allersnelst.
  grauw: {
    draw: (s, x, groundTop) => drawGrauwBoss(s, x, groundTop),
    happy: (s, c) => happyGrauwBoss(s, c),
    projectile: drawGrauwWolkje,
    speed: -250,
    waarschuwing: 'Pas op — een grauw-wolkje! Spring! ⛈️',
  },
};

export function bossLook(name) {
  return BOSS_LOOKS[name] || BOSS_LOOKS.grommel;
}
