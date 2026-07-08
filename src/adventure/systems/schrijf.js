// ===== SCHRIJF-POORT — het letter-avontuur (Alfa-Blokken in Getallen-Land) =====
// Een rondloop-mechaniek: bij een kloof staat een SLAPEND Alfa-Blok dat zijn
// letter kwijt is. Loop ernaartoe → ✋ → schrijf de kleine letter over (de
// bewezen overtrek-overlay) → het blok wordt wakker én er verschijnt een brug
// over de kloof. Zo schrijf je een woord bij elkaar terwijl je door de wereld
// loopt. De overtrek-overlay + het bevriezen leeft in AdventureScene
// (enterSchrijf); dit systeem bouwt de poorten en lost ze op.
//
// Level-veld:  schrijfPoorten: [{ letter, gapX, gapW, x?, triggerX?, triggerW?, kleurIdx? }]

import Phaser from 'phaser';
import { LOWER_PATHS, RAINBOW } from '../../glyphs.js';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { confettiBurst } from '../../reward.js';

// Teken genormaliseerde letterpaden (0..1) in een vak op graphics g.
function strokePaden(g, paths, ox, oy, sz, lw, color) {
  g.lineStyle(lw, color, 1);
  for (const st of paths) {
    g.beginPath(); g.moveTo(ox + st[0][0] * sz, oy + st[0][1] * sz);
    for (let i = 1; i < st.length; i++) g.lineTo(ox + st[i][0] * sz, oy + st[i][1] * sz);
    g.strokePath();
  }
}

// Een Alfa-Blok (letter-figuurtje). wakker=false → grijs, ogen dicht, zzz;
// wakker=true → felle kleur, witte letter, open oogjes.
function tekenBlok(s, x, y, letter, kleur, wakker) {
  const c = s.add.container(x, y).setDepth(5);
  const size = 62, half = size / 2;
  const g = s.add.graphics(); c.add(g);
  g.fillStyle(wakker ? kleur : 0xb8bfc7, 1); g.fillRoundedRect(-half, -half, size, size, 13);
  if (wakker) { g.fillStyle(0xffffff, 0.22); g.fillRoundedRect(-half, -half, size, size * 0.4, 13); }
  g.lineStyle(3.5, 0x2b2f3a, 1); g.strokeRoundedRect(-half, -half, size, size, 13);
  strokePaden(g, LOWER_PATHS[letter], -half + size * 0.14, -half + size * 0.14, size * 0.72,
    Math.max(4, size * 0.09), wakker ? 0xffffff : 0x8a9199);
  const ey = -size * 0.03;
  if (wakker) {
    g.fillStyle(0xffffff, 1); g.fillCircle(-size * 0.17, ey, size * 0.1); g.fillCircle(size * 0.17, ey, size * 0.1);
    g.fillStyle(0x2b2f3a, 1); g.fillCircle(-size * 0.14, ey, size * 0.05); g.fillCircle(size * 0.2, ey, size * 0.05);
  } else {
    g.lineStyle(3, 0x2b2f3a, 1);
    g.lineBetween(-size * 0.26, ey, -size * 0.08, ey); g.lineBetween(size * 0.08, ey, size * 0.26, ey);
  }
  return c;
}

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

  const g = s.add.graphics().setDepth(2);
  const n = Math.max(3, Math.round(pz.gapW / 70)), pw = pz.gapW / n;
  for (let i = 0; i < n; i++) {
    const cx = pz.gapX + pw * (i + 0.5);
    const gg = s.add.graphics().setDepth(2);
    gg.fillStyle(0xb5793f, 1); gg.fillRoundedRect(cx - pw / 2 + 2, plankTop, pw - 4, 16, 4);
    gg.lineStyle(2.5, 0x7c4f28, 1); gg.strokeRoundedRect(cx - pw / 2 + 2, plankTop, pw - 4, 16, 4);
    gg.setScale(1, 0);
    s.tweens.add({ targets: gg, scaleY: 1, duration: 200, delay: i * 110, ease: 'Back.out',
      onComplete: () => { SFX.place && SFX.place(); s.sparkleAt && s.sparkleAt(cx, plankTop, 6); } });
  }
  g.destroy();
}

function bouwPoort(s, L, P, idx) {
  const groundTop = L.platforms[0][1];
  const kleur = RAINBOW[(P.kleurIdx != null ? P.kleurIdx : idx) % RAINBOW.length];

  // de kloof: donkere spleet
  const chasm = s.add.graphics().setDepth(-11);
  chasm.fillStyle(0x2a3a2a, 1); chasm.fillRect(P.gapX, groundTop, P.gapW, 220);

  // het slapende blok net vóór de kloof
  const fx = P.x != null ? P.x : P.gapX - 46;
  const fy = groundTop - 31;
  const friend = tekenBlok(s, fx, fy, P.letter, kleur, false);
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
    zone: new Phaser.Geom.Rectangle(triggerX, groundTop - 120, triggerW, 160),
    prompt: 'Schrijf de letter!',
  };
  pz.onSolve = () => solvePoort(s, L, pz);
  s.puzzles.push(pz);
}

function solvePoort(s, L, pz) {
  if (pz.zzz) { s.tweens.killTweensOf(pz.zzz); pz.zzz.destroy(); pz.zzz = null; }
  if (pz.friend) pz.friend.destroy();
  pz.friend = tekenBlok(s, pz.friendPos.x, pz.friendPos.y, pz.letter, pz.kleur, true);
  s.tweens.add({ targets: pz.friend, y: pz.friendPos.y - 18, duration: 180, yoyo: true, repeat: 1, ease: 'Quad.out' });
  s.tweens.add({ targets: pz.friend, scale: { from: 0.7, to: 1 }, duration: 260, ease: 'Back.out' });

  legBrug(s, L, pz);
  confettiBurst(s, 90);
  if (s.cameraPunch) s.cameraPunch();
  SFX.yay && SFX.yay();
  Voice.cue('cheer');
  s.time.delayedCall(280, () => Voice.cue('klank-' + pz.letter));
  if (s.questText) s.questText.setText('Ren verder! 🚩');
  if (s.vierMijlpaal) s.vierMijlpaal(pz.gapX + pz.gapW / 2);
}

export default {
  build(s, L) {
    (L.schrijfPoorten || []).forEach((P, i) => bouwPoort(s, L, P, i));
  },
};
