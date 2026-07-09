// ===== SCHRIJF-POORT — het letter-avontuur (Letter-Land) =====
// Rondloop-mechaniek: bij een kloof staat een SLAPEND Alfa-Blok dat zijn letter
// kwijt is (De Sisser heeft de klank eruit gezogen). Loop ernaartoe → ✋ →
// schrijf de kleine letter over (de overtrek-overlay in AdventureScene:
// enterSchrijf) → het blok wordt wakker, z'n klank klinkt én er verschijnt een
// brug. Zo schrijf je al lopend een woord bij elkaar. Elke geschreven letter
// laat ook een stuk "stilte-waas" wegtrekken (vierMijlpaal → kleurHerstel).
//
// Level-velden:
//   schrijfPoorten: [{ letter, gapX, gapW, x?, triggerX?, triggerW?, kleurIdx? }]
//   sisser: { x }   — baas-level: De Sisser looms; krimpt per geschreven letter.

import Phaser from 'phaser';
import { RAINBOW } from '../../glyphs.js';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { confettiBurst } from '../../reward.js';
import { tekenAlfaBlok, tekenSisser } from '../letterCast.js';

// Leg een houten brug over de kloof (met collider) — precies zoals de
// getallen-brug, maar zonder telling.
function legBrug(s, L, pz) {
  const groundTop = L.platforms[0][1];
  const plankTop = groundTop - 6;
  const plank = s.add.rectangle(pz.gapX + pz.gapW / 2, plankTop + 10, pz.gapW, 20, 0x000000, 0);
  s.physics.add.existing(plank, true);
  s.platforms.add(plank);
  s.physics.add.collider(s.player, plank);
  (s.grommels || []).forEach((gr) => s.physics.add.collider(gr, plank));

  const n = Math.max(3, Math.round(pz.gapW / 70)), pw = pz.gapW / n;
  for (let i = 0; i < n; i++) {
    const cx = pz.gapX + pw * (i + 0.5);
    const gg = s.add.graphics().setDepth(2);
    gg.fillStyle(0xb5793f, 1); gg.fillRoundedRect(cx - pw / 2 + 2, plankTop, pw - 4, 16, 4);
    gg.lineStyle(2.5, 0x7c4f28, 1); gg.strokeRoundedRect(cx - pw / 2 + 2, plankTop, pw - 4, 16, 4);
    gg.setScale(1, 0);
    s.tweens.add({ targets: gg, scaleY: 1, duration: 200, delay: i * 110, ease: 'Back.out',
      onComplete: () => { if (SFX.place) SFX.place(); if (s.sparkleAt) s.sparkleAt(cx, plankTop, 6); } });
  }
}

function bouwPoort(s, L, P, idx) {
  const groundTop = L.platforms[0][1];
  const kleur = RAINBOW[(P.kleurIdx != null ? P.kleurIdx : idx) % RAINBOW.length];

  // de kloof: donkere spleet
  const chasm = s.add.graphics().setDepth(-11);
  chasm.fillStyle(0x2a3a2a, 1); chasm.fillRect(P.gapX, groundTop, P.gapW, 220);

  // het slapende blok net vóór de kloof + zzz
  const fx = P.x != null ? P.x : P.gapX - 46;
  const fy = groundTop - 31;
  const friend = tekenAlfaBlok(s, fx, fy, P.letter, kleur, false);
  const zzz = s.add.text(fx + 26, fy - 44, 'z z z', {
    fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#8a9199',
  }).setOrigin(0.5).setDepth(6);
  s.tweens.add({ targets: zzz, y: fy - 54, alpha: 0.4, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

  const triggerX = P.triggerX != null ? P.triggerX : P.gapX - 150;
  const triggerW = P.triggerW != null ? P.triggerW : 150;
  const pz = {
    type: 'schrijf', letter: P.letter, solved: false,
    gapX: P.gapX, gapW: P.gapW, kleur,
    friend, friendPos: { x: fx, y: fy }, zzz,
    geeft: P.geeft || null, // dit gewekte blok schenkt een kracht (Deel 1)
    zone: new Phaser.Geom.Rectangle(triggerX, groundTop - 120, triggerW, 160),
    prompt: 'Schrijf de letter!',
  };
  pz.onSolve = () => solvePoort(s, L, pz);
  s.puzzles.push(pz);
}

function solvePoort(s, L, pz) {
  if (pz.zzz) { s.tweens.killTweensOf(pz.zzz); pz.zzz.destroy(); pz.zzz = null; }
  if (pz.friend) pz.friend.destroy();
  pz.friend = tekenAlfaBlok(s, pz.friendPos.x, pz.friendPos.y, pz.letter, pz.kleur, true);
  s.tweens.add({ targets: pz.friend, y: pz.friendPos.y - 18, duration: 180, yoyo: true, repeat: 1, ease: 'Quad.out' });
  s.tweens.add({ targets: pz.friend, scale: { from: 0.7, to: 1 }, duration: 260, ease: 'Back.out' });

  legBrug(s, L, pz);
  confettiBurst(s, 90);
  if (s.cameraPunch) s.cameraPunch();
  if (SFX.yay) SFX.yay();
  Voice.cue('cheer');
  s.time.delayedCall(280, () => Voice.cue('klank-' + pz.letter));
  if (s.questText) s.questText.setText('Ren verder! 🚩');
  if (s.vierMijlpaal) s.vierMijlpaal(pz.gapX + pz.gapW / 2); // stilte-waas trekt weg

  // Dit gewekte Alfa-Blok schenkt je z'n kracht (krachten verdien je al
  // schrijvend — hergebruikt grantPower + het stralen-banner).
  if (pz.geeft && s.grantPower && !s.powers?.[pz.geeft]) {
    s.time.delayedCall(560, () => s.grantPower(pz.geeft, 'het Alfa-Blok'));
  }

  reactSisser(s);
}

// ---- De Sisser (baas) ----
function bouwSisser(s, L) {
  const groundTop = L.platforms[0][1];
  const total = (L.schrijfPoorten || []).length || 1;
  const base = 1.4;
  const c = tekenSisser(s, L.sisser.x, groundTop - 74, base, false);
  c.setDepth(4);
  s.tweens.add({ targets: c, y: groundTop - 82, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  s._sisser = { c, total, done: 0, base, x: L.sisser.x, groundTop };
}

function reactSisser(s) {
  const S = s._sisser;
  if (!S) return;
  S.done += 1;
  const t = S.done / S.total;
  const sc = S.base * (1 - 0.55 * t);
  s.tweens.add({ targets: S.c, scaleX: sc, scaleY: sc, duration: 320, ease: 'Back.in' });
  s.tweens.add({ targets: S.c, angle: 8, duration: 70, yoyo: true, repeat: 3 });
  if (S.done >= S.total) {
    // verslagen → bekeerd: hij ontdekt dat woorden juist leuk klinken
    s.time.delayedCall(420, () => {
      const x = S.c.x, y = S.c.y;
      S.c.destroy();
      const blij = tekenSisser(s, x, y, S.base * 0.7, true).setDepth(4);
      s.tweens.add({ targets: blij, y: y - 16, duration: 220, yoyo: true, repeat: 3, ease: 'Quad.out' });
      confettiBurst(s, 140);
      if (s.cameraPunch) s.cameraPunch();
      if (SFX.win) SFX.win();
      Voice.cue('cheer');
    });
    s._sisser = null;
  }
}

export default {
  build(s, L) {
    (L.schrijfPoorten || []).forEach((P, i) => bouwPoort(s, L, P, i));
    if (L.sisser) bouwSisser(s, L);
  },
};
