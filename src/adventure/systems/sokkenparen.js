// ===== SYSTEEM: SOKKENPAREN (de Kleren-Kast, Wereld 13) =====
// De Sokken-Dief heeft overal sokken door elkaar gegooid! Verspreid in het
// level hangen sokken aan knijpers — van elk patroon precies TWEE. Tik een
// sok (hij licht op) en tik dan zijn TWEELING: PAAR! Hartjes, en het paar
// huppelt samen weg. Mis? Zachte oeps; na 2 missers pulseert de tweeling.
// Leerdoel: hetzelfde herkennen (patronen vergelijken).
// Veld: `sokkenParen: [{ x, y, patroon }]` — elk patroon precies 2×.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { drawSok } from '../sokken.js';

function maakSok(s, S0) {
  // depth 13 = boven de speler (12): tikken op een sok waar je vóór staat
  // moet de SOK raken, niet jezelf splitsen (topOnly-regel)
  const c = s.add.container(S0.x, S0.y).setDepth(13);
  const g = s.add.graphics();
  // knijper + touwtje waar de sok aan bungelt
  g.lineStyle(2, 0x9aa0a6, 0.8); g.beginPath(); g.moveTo(0, -38); g.lineTo(0, -26); g.strokePath();
  g.fillStyle(0xd9a04a, 1); g.fillRect(-2.5, -32, 5, 9);
  drawSok(g, S0.patroon, 1);
  c.add(g);
  // selectie-ring (onzichtbaar tot je 'm kiest)
  const ring = s.add.circle(2, 0, 34, 0xffe16b, 0).setStrokeStyle(4, 0xffe16b, 0);
  c.add(ring);
  c.ring = ring;
  c.patroon = S0.patroon;
  c.klaar = false;
  // gecentreerde hit-area rond sok + knijper (containers doen dat niet vanzelf!)
  c.setInteractive(new Phaser.Geom.Rectangle(-28, -42, 56, 76), Phaser.Geom.Rectangle.Contains);
  c.input.cursor = 'pointer';
  s.tweens.add({ targets: c, angle: Phaser.Math.Between(0, 1) ? 4 : -4, duration: 1000 + Math.random() * 400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  return c;
}

function kies(s, SP, sok) {
  if (sok.klaar || !sok.active) return;
  const sel = SP.selectie;
  if (!sel || !sel.active || sel.klaar) {
    // eerste sok van het (hopelijk) paar
    SP.selectie = sok;
    sok.ring.setStrokeStyle(4, 0xffe16b, 1);
    s.tweens.add({ targets: sok, scale: 1.18, duration: 140, ease: 'Back.out' });
    SFX.pick();
    s.questText.setText('Waar hangt de tweeling van deze sok? 🧦');
    return;
  }
  if (sel === sok) {
    // zelfde sok nog eens = weer loslaten
    SP.selectie = null;
    sok.ring.setStrokeStyle(4, 0xffe16b, 0);
    s.tweens.add({ targets: sok, scale: 1, duration: 140 });
    return;
  }
  if (sel.patroon === sok.patroon) {
    // PAAR GEVONDEN! Ze vliegen naar elkaar toe en huppelen samen weg.
    SP.selectie = null;
    sel.klaar = true; sok.klaar = true;
    sel.disableInteractive(); sok.disableInteractive();
    SFX.correct(); Voice.cue('great');
    const mx = (sel.x + sok.x) / 2, my = Math.min(sel.y, sok.y) - 20;
    s.heart(mx, my - 26); s.heart(mx - 22, my - 10); s.heart(mx + 22, my - 10);
    s.burstStars(mx, my, 8);
    [sel, sok].forEach((z, i) => {
      s.tweens.killTweensOf(z);
      s.tweens.add({
        targets: z, x: mx + (i ? 20 : -20), y: my, scale: 1.1, angle: 0, duration: 320, ease: 'Sine.inOut',
        onComplete: () => s.tweens.add({
          targets: z, y: z.y - 90, alpha: 0, angle: i ? 20 : -20, duration: 700, delay: 350, ease: 'Quad.in',
          onComplete: () => z.destroy(),
        }),
      });
    });
    SP.klaar += 1;
    SP.fouten = 0;
    if (SP.klaar >= SP.paren) {
      s.questText.setText('Alle sokkenparen weer samen! 🧦💕');
      SFX.yay(); s.cameraPunch();
      s.vierMijlpaal(mx);
    } else {
      s.questText.setText(`Paar ${SP.klaar} van ${SP.paren} — zoek de volgende! 🧦`);
    }
  } else {
    // niet dezelfde — zachte oeps, kijk nog eens goed
    SFX.oops(); Voice.cue('oops');
    s.tweens.add({ targets: sok, angle: { from: -8, to: 8 }, duration: 70, yoyo: true, repeat: 3, onComplete: () => sok.setAngle(0) });
    s.questText.setText('Bijna — kijk goed naar het patroon! 🔍');
    SP.fouten = (SP.fouten || 0) + 1;
    if (SP.fouten >= 2 && sel.active) {
      const maatje = SP.sokken.find((z) => z.active && !z.klaar && z !== sel && z.patroon === sel.patroon);
      if (maatje) s.pulsHulp(maatje);
      Voice.hint('hint-sokken', 900);
    }
  }
}

export default {
  build(s, L) {
    s.sokkenParen = null;
    const lijst = L.sokkenParen || [];
    if (!lijst.length) return;
    const SP = { sokken: [], selectie: null, klaar: 0, paren: lijst.length / 2, fouten: 0 };
    lijst.forEach((S0) => {
      const sok = maakSok(s, S0);
      sok.on('pointerdown', () => kies(s, SP, sok));
      SP.sokken.push(sok);
    });
    s.sokkenParen = SP;
  },

  update(s) {
    const SP = s.sokkenParen;
    if (!SP || SP.klaar >= SP.paren) return;
    // eerste keer bij een sok in de buurt: gesproken uitleg
    if (!s._sokkenHint) {
      const p = s.player;
      if (SP.sokken.some((z) => z.active && Math.abs(p.x - z.x) < 220)) {
        s._sokkenHint = true;
        Voice.hint('hint-sokken');
        s.questText.setText('Tik twee DEZELFDE sokken — maak de paren! 🧦');
      }
    }
  },
};
