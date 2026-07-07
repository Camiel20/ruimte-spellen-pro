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
  drawKaasBoss, happyKaasBoss, drawKaasWiel,
  drawDrolBoss, happyDrolBoss, drawDrolletje,
  drawReusBoss, drawKei,
  drawBilBoss, happyBilBoss, drawStinkWolkje, drawZeepbel,
  drawOctopusBoss, happyOctopusBoss, drawInktKlodder,
  drawSchelpKeuze, drawEikeltje,
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
    keuzeArt: drawSchelpKeuze, // stijl 'surf': antwoord-schelpen i.p.v. bellen
  },
  // Boom-Grommel (W3): eikels.
  boom: {
    draw: (s, x, groundTop) => drawTreeBoss(s, x, groundTop),
    happy: (s, c) => happyTreeBoss(s, c),
    projectile: drawAcorn,
    speed: -175,
    waarschuwing: 'Pas op — een eikel! Spring! 🌰',
    vangArt: drawEikeltje, // stijl 'schud': raap gevallen eikels
    vangIcoon: '🌰',
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
  // Kaas-Grommel (W7, de Pizza-Vulkaan): rollende kaaswielen.
  kaas: {
    draw: (s, x, groundTop) => drawKaasBoss(s, x, groundTop),
    happy: (s, c) => happyKaasBoss(s, c),
    projectile: drawKaasWiel,
    speed: -225,
    waarschuwing: 'Pas op — een kaaswiel! Spring! 🧀',
  },
  // De Reuzen-Grommel (W10, Reuzenland): rollende keien. Verslaan doe je
  // niet met bouwen maar met BEUKEN (stijl 'beuk'): word zelf een reus en
  // ram hem — hij krimpt per klap (de scene tweent zijn schaal omlaag).
  reus: {
    draw: (s, x, groundTop) => drawReusBoss(s, x, groundTop),
    happy: (s, c, pz) => recolorBossHappy(s, c, sig(pz.stages[pz.stages.length - 1].doel)),
    projectile: drawKei,
    speed: -190,
    waarschuwing: 'Pas op — een rollende kei! Spring! 🪨',
  },
  // De Reuzen-Drol (W9, Wc-Wonderland): huppelende drolletjes.
  drol: {
    draw: (s, x, groundTop) => drawDrolBoss(s, x, groundTop),
    happy: (s, c) => happyDrolBoss(s, c),
    projectile: drawDrolletje,
    speed: -240,
    waarschuwing: 'Pas op — een drolletje! Spring! 💩',
  },
  // De Stinke-Bil (W11, Billenland): wil NIET in bad — gooit stinkwolkjes.
  // Vang-stijl met een eigen vangst: zeepbellen i.p.v. pizza-toppings.
  bil: {
    draw: (s, x, groundTop) => drawBilBoss(s, x, groundTop),
    happy: (s, c) => happyBilBoss(s, c),
    projectile: drawStinkWolkje,
    speed: -210,
    waarschuwing: 'Pas op — een stinkwolkje! Spring! 💨',
    vangArt: drawZeepbel,
    vangIcoon: '🧼',
    vangTekst: 'Vang {n} zeepbellen — dan moet hij in bad! 🧼',
  },
  // De Inkt-Octopus (W12, de Bubbel-Zee): inkt-klodders. Verslaan met
  // stijl 'tien': raak per fase de bel die zijn getal tot 10 aanvult
  // (verliefde getallen) — dan laat een tentakel los.
  octopus: {
    draw: (s, x, groundTop) => drawOctopusBoss(s, x, groundTop),
    happy: (s, c) => happyOctopusBoss(s, c),
    projectile: drawInktKlodder,
    speed: -215,
    waarschuwing: 'Pas op — een inkt-klodder! Spring! 🖤',
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
