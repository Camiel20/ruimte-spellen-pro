// ===== SYSTEEM: DE LANTAARN-FLITS (Het Spook-Slot, Wereld 19) =====
// HET leer-werkwoord van het Spook-Slot: SUBITIZEREN (flits-tellen — een
// aantal in één oogopslag herkennen zonder één-voor-één te tellen). In een
// donkere nis houdt een lantaarn de wacht. Tik de lantaarn → de spookjes
// lichten ~1 seconde op… en verdwijnen weer! Hoeveel waren het? Tik het
// grafzerkje met het juiste getal → de poort kraakt open. Fout = de spookjes
// giechelen "boe!" en flitsen opnieuw. Faal-vriendelijk, geen straf.
// Veld: `flitsSpoken: [{ x, aantal }]` — aantal 2-6; de poort staat op x+170.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { confettiBurst } from '../../reward.js';
import { reducedMotion } from '../../motion.js';

export const FLITS_DEUR = 170; // afstand lantaarn → poort (ook voor de validator)

// een schattig mini-spookje (met gekke onderbroek!) — inline getekend
function tekenSpookje(s, x, y) {
  const c = s.add.container(x, y).setDepth(9);
  const g = s.add.graphics();
  g.fillStyle(0xf2f4f8, 0.96); g.fillCircle(0, -3, 14); g.fillRect(-14, -3, 28, 15);
  for (let k = -2; k <= 2; k++) g.fillCircle(k * 7, 12, 4);
  g.fillStyle(0x2b2f34, 1); g.fillCircle(-5, -5, 2.4); g.fillCircle(5, -5, 2.4);
  g.fillStyle(0xf2a7b8, 0.9); // gekke onderbroek
  g.fillRoundedRect(-9, 4, 18, 8, 3);
  g.lineStyle(1.4, 0xd06a88, 1); g.strokeRoundedRect(-9, 4, 18, 8, 3);
  c.add(g);
  return c;
}

// een grafzerkje met een getal (het antwoord-tikvlak) — depth 13
function tekenZerk(s, x, groundTop, getal) {
  const c = s.add.container(x, groundTop - 34).setDepth(13);
  const g = s.add.graphics();
  g.fillStyle(0x000000, 0.16); g.fillEllipse(0, 30, 54, 10);
  g.fillStyle(0x8a8f9a, 1);
  g.fillRoundedRect(-22, -30, 44, 60, 10);
  g.slice(0, -30, 22, Math.PI, 0, false); g.fillPath();
  g.fillStyle(0x6a6f7a, 1); g.fillRoundedRect(-22, 18, 44, 12, 4);
  g.lineStyle(2.5, 0x4a4f58, 1); g.strokeRoundedRect(-22, -30, 44, 60, 10);
  // een klein gloeiend kaarsje bovenop
  g.fillStyle(0xffe16b, 0.9); g.fillCircle(0, -44, 5);
  c.add(g);
  c.add(s.add.text(0, -2, `${getal}`, {
    fontFamily: 'Arial Black, Arial', fontSize: '24px', fontStyle: 'bold', color: '#f6f6f6',
  }).setOrigin(0.5).setStroke('#2b2f34', 4));
  c.setInteractive(new Phaser.Geom.Rectangle(-26, -40, 52, 74), Phaser.Geom.Rectangle.Contains);
  c.input.cursor = 'pointer';
  c.getal = getal;
  return c;
}

// bouw 3 geschudde opties: het juiste aantal + 2 plausibele afleiders
function maakOpties(aantal) {
  const opties = new Set([aantal]);
  const kandidaten = [aantal - 1, aantal + 1, aantal - 2, aantal + 2].filter((v) => v >= 2 && v <= 7);
  for (let k = kandidaten.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [kandidaten[k], kandidaten[j]] = [kandidaten[j], kandidaten[k]]; }
  for (const v of kandidaten) { if (opties.size >= 3) break; opties.add(v); }
  const arr = [...opties];
  for (let k = arr.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [arr[k], arr[j]] = [arr[j], arr[k]]; }
  return arr;
}

function flits(s, F) {
  if (F.klaar || F.bezig) return;
  F.bezig = true;
  // rustige modus: zachte, tragere in/uit-fade (geen strobo), iets langer zichtbaar
  const rustig = reducedMotion();
  SFX.sparkle(); Voice.cue('star');
  s.tweens.add({ targets: F.lantaarnGloed, alpha: 0.9, scale: rustig ? 1.15 : 1.4, duration: rustig ? 300 : 160, yoyo: true });
  // toon de spookjes verspreid boven de nis, ~1s (rustig: ~2s), dan weg
  const spookjes = [];
  const plekken = [];
  for (let i = 0; i < F.aantal; i++) {
    let sx, sy, tries = 0;
    do { sx = F.x - 70 + Phaser.Math.Between(0, 200); sy = F.groundTop - Phaser.Math.Between(90, 220); tries++; }
    while (tries < 12 && plekken.some((p) => Math.abs(p.x - sx) < 46 && Math.abs(p.y - sy) < 46));
    plekken.push({ x: sx, y: sy });
    const sp = tekenSpookje(s, sx, sy);
    sp.setAlpha(0).setScale(rustig ? 0.9 : 0.6);
    s.tweens.add({ targets: sp, alpha: 1, scale: 1, duration: rustig ? 420 : 150, ease: rustig ? 'Sine.out' : 'Back.out' });
    s.tweens.add({ targets: sp, alpha: 0, scale: rustig ? 0.9 : 0.7, duration: rustig ? 500 : 240, delay: rustig ? 1500 : 1000, onComplete: () => sp.destroy() });
    spookjes.push(sp);
  }
  // na de flits: de antwoord-zerkjes verschijnen (of ze zijn er al)
  s.time.delayedCall(rustig ? 2100 : 1360, () => {
    if (F.klaar) return;
    F.bezig = false;
    s.questText.setText('En… weg! Hoeveel spookjes waren het? 👻');
    if (!F.zerken || !F.zerken.some((z) => z.active)) toonZerken(s, F);
  });
}

function toonZerken(s, F) {
  F.zerken = F.opties.map((getal, i) => {
    const z = tekenZerk(s, F.x - 60 + i * 90, F.groundTop, getal);
    z.setScale(0.2);
    s.tweens.add({ targets: z, scale: 1, duration: 300, delay: i * 110, ease: 'Back.out' });
    z.on('pointerdown', () => kiesZerk(s, F, z));
    return z;
  });
}

function kiesZerk(s, F, z) {
  if (F.klaar || z.gekozen) return;
  z.gekozen = true;
  if (z.getal === F.aantal) {
    // GOED GETELD! De poort kraakt open.
    F.klaar = true;
    SFX.fanfare(); Voice.number(F.aantal); confettiBurst(s, 80); s.cameraPunch();
    s.questText.setText(`${F.aantal} spookjes — precies goed! De poort opent! 👻`);
    (F.zerken || []).forEach((zz) => { if (zz !== z && zz.active) s.tweens.add({ targets: zz, scale: 0, alpha: 0, duration: 260, onComplete: () => zz.destroy() }); });
    s.tweens.add({ targets: z, y: z.y - 20, duration: 260, yoyo: true, repeat: 2 });
    F.body.body.enable = false;
    s.doorGroup.remove(F.body, false, false);
    s.tweens.add({ targets: F.muurArt, alpha: 0.12, y: 500, duration: 700, ease: 'Quad.in' });
    s.vierMijlpaal(F.x);
  } else {
    // fout — een vriendelijke "boe!" en opnieuw flitsen
    s.rekenFouten += 1;
    F.fouten = (F.fouten || 0) + 1;
    SFX.oops(); Voice.cue('oops'); SFX.giggle();
    s.questText.setText('Boe! Net niet — kijk nog eens, ze komen terug! 👻');
    s.tweens.add({ targets: z, angle: { from: -8, to: 8 }, duration: 70, yoyo: true, repeat: 3, onComplete: () => { z.setAngle(0); z.gekozen = false; } });
    if (F.fouten >= 2) {
      const goed = (F.zerken || []).find((zz) => zz.active && zz.getal === F.aantal);
      if (goed) s.pulsHulp(goed);
      Voice.hint('hint-flits', 700);
    }
    s.time.delayedCall(600, () => { if (!F.klaar) flits(s, F); });
  }
}

export default {
  build(s, L) {
    s.flitsSpoken = [];
    (L.flitsSpoken || []).forEach((F0) => {
      const groundTop = L.platforms[0][1];

      // de donkere nis met een lantaarn-paal
      const nis = s.add.graphics().setDepth(3);
      nis.fillStyle(0x1a1426, 0.55); nis.fillRoundedRect(F0.x - 90, groundTop - 240, 200, 240, 16);
      nis.lineStyle(3, 0x3a2b52, 0.8); nis.strokeRoundedRect(F0.x - 90, groundTop - 240, 200, 240, 16);

      // de lantaarn (tikbaar, depth 13)
      const lantaarn = s.add.container(F0.x - 130, groundTop - 70).setDepth(13);
      const gloed = s.add.circle(0, -4, 22, 0xffe16b, 0.35);
      lantaarn.add(gloed);
      const lg = s.add.graphics();
      lg.fillStyle(0x3a2b52, 1); lg.fillRect(-3, 6, 6, 40); // paal
      lg.fillStyle(0x2b2f34, 1); lg.fillRoundedRect(-11, -18, 22, 26, 5);
      lg.fillStyle(0xffe9a8, 1); lg.fillRoundedRect(-8, -14, 16, 18, 3); // het licht
      lg.fillStyle(0xffc14d, 1); lg.fillCircle(0, -5, 4);
      lg.lineStyle(2, 0x16202b, 1); lg.strokeRoundedRect(-11, -18, 22, 26, 5);
      lantaarn.add(lg);
      lantaarn.setInteractive(new Phaser.Geom.Rectangle(-24, -30, 48, 80), Phaser.Geom.Rectangle.Contains);
      lantaarn.input.cursor = 'pointer';
      s.tweens.add({ targets: gloed, alpha: 0.55, scale: 1.15, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

      // het doel-bordje boven de nis
      const bord = s.add.container(F0.x + 10, groundTop - 260).setDepth(7);
      const bg = s.add.graphics(); bg.fillStyle(0x16202b, 0.6); bg.fillRoundedRect(-96, -22, 192, 44, 12);
      bord.add(bg);
      bord.add(s.add.text(0, 0, '🔦 tik de lantaarn — tel de spookjes!', {
        fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5));
      s.tweens.add({ targets: bord, y: bord.y - 5, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

      // de poort (schermhoge grafhek-blokkade)
      const muurX = F0.x + FLITS_DEUR;
      const body = s.add.rectangle(muurX, (40 + groundTop) / 2, 46, groundTop - 40, 0x000000, 0);
      s.physics.add.existing(body, true);
      s.doorGroup.add(body);
      const muurArt = s.add.container(muurX, 0).setDepth(4);
      const mg = s.add.graphics();
      mg.fillStyle(0x4a4f58, 1); mg.fillRoundedRect(-22, 150, 44, groundTop - 148, 8);
      mg.fillStyle(0x6a6f7a, 1); mg.fillRoundedRect(-22, 150, 44, 14, 5);
      mg.lineStyle(3, 0x2b2f34, 1); mg.strokeRoundedRect(-22, 150, 44, groundTop - 148, 8);
      // grafhek-spijlen
      mg.lineStyle(3, 0x2b2f34, 0.8);
      for (let ky = 190; ky < groundTop - 40; ky += 60) { mg.beginPath(); mg.moveTo(-10, ky); mg.lineTo(-10, ky + 40); mg.strokePath(); mg.beginPath(); mg.moveTo(10, ky); mg.lineTo(10, ky + 40); mg.strokePath(); }
      muurArt.add(mg);

      const F = {
        ...F0, x: F0.x, lantaarn, lantaarnGloed: gloed, body, muurArt, groundTop,
        opties: maakOpties(F0.aantal), zerken: null, klaar: false, bezig: false, fouten: 0, cuePlayed: false,
      };
      lantaarn.on('pointerdown', () => flits(s, F));
      s.flitsSpoken.push(F);
    });
  },

  update(s) {
    if (!s.flitsSpoken || !s.flitsSpoken.length) return;
    const p = s.player;
    for (const F of s.flitsSpoken) {
      if (F.klaar) continue;
      if (!F.cuePlayed && Math.abs(p.x - F.x) < 240) {
        F.cuePlayed = true;
        Voice.hint('hint-flits');
        s.questText.setText('Tik de lantaarn — de spookjes flitsen op. Hoeveel zie je? 🔦👻');
      }
    }
  },
};
