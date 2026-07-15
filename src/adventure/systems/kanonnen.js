// ===== SYSTEEM: HET CIRCUS-KANON (het Circus-Kanon, Wereld 17) =====
// Het knal-werkwoord: kruip in het kanon (loop ertegen), tik kruit-vaatjes
// in de lader en tik de LONT. Precies genoeg kruit = een prachtige boog
// over het ravijn; te weinig of te veel = een sputterende PLOF en je wipt
// er giechelend weer uit (rook, geen straf). Inschatten + durven!
// Veld: `kanonnen: [{ x, vaatjes, landX }]` — vaatjes = 1-3 nodig.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { confettiBurst } from '../../reward.js';

function tekenVaatje(s) {
  const g = s.add.graphics();
  g.fillStyle(0x000000, 0.14); g.fillEllipse(0, 18, 30, 7);
  g.fillStyle(0x8a5a33, 1); g.fillRoundedRect(-12, -16, 24, 32, 7);
  g.fillStyle(0xa9713f, 1); g.fillRoundedRect(-12, -8, 24, 6, 3);
  g.lineStyle(2.5, 0x5d3a1e, 1); g.strokeRoundedRect(-12, -16, 24, 32, 7);
  g.fillStyle(0x2b2f34, 1); g.fillEllipse(0, -16, 16, 5); // kruit bovenin
  return g;
}

function tekenStippen(s, K) {
  K.stipBar.clear();
  for (let i = 0; i < 3; i++) {
    const px = (i - 1) * 16;
    if (i < K.geladen) { K.stipBar.fillStyle(0x2b2f34, 1); K.stipBar.fillCircle(px, 0, 5.5); }
    K.stipBar.lineStyle(2, 0x5d3a1e, 1); K.stipBar.strokeCircle(px, 0, 5.5);
  }
}

function stapIn(s, K) {
  const p = s.player;
  K.bezig = true;
  s.mode = 'vlucht';
  p.body.setVelocity(0, 0);
  p.body.enable = false;
  SFX.pick(); Voice.cue('whee');
  // je kruipt in de loop — alleen je hoofdje piept eruit
  s.tweens.add({
    targets: p, x: K.x + 22, y: K.loopY - 8, scale: 0.4, duration: 380, ease: 'Sine.inOut',
    onComplete: () => {
      s.questText.setText('Laad de vaatjes… en tik de LONT! 💥');
      if (!s._kanonHint) { s._kanonHint = true; Voice.hint('hint-kanon'); }
    },
  });
}

function laad(s, K, vaatje) {
  if (!K.bezig || K.vuurt || K.geladen >= 3) return;
  K.geladen += 1;
  SFX.place(); Voice.number(K.geladen);
  tekenStippen(s, K);
  s.tweens.add({ targets: vaatje, scale: 0.85, duration: 90, yoyo: true });
  const vlieg = s.add.container(vaatje.x, vaatje.y).setDepth(14);
  vlieg.add(tekenVaatje(s));
  s.tweens.add({ targets: vlieg, x: K.x, y: K.loopY + 10, scale: 0.4, angle: 180, duration: 320, ease: 'Sine.inOut', onComplete: () => vlieg.destroy() });
}

function lont(s, K) {
  if (!K.bezig || K.vuurt) return;
  K.vuurt = true;
  const p = s.player;
  s.tweens.add({ targets: K.lontKnop, scale: 0.85, duration: 90, yoyo: true });
  // de lont sist even af…
  SFX.sparkle();
  s.time.delayedCall(500, () => {
    if (K.geladen === K.vaatjes) {
      // BOEM! De perfecte boog naar de overkant.
      SFX.stomp(); s.cameraPunch(0.06, 9); confettiBurst(s, 80);
      Voice.cue('whee');
      for (let i = 0; i < 8; i++) {
        const rook = s.add.circle(K.x + 30, K.loopY - 10, Phaser.Math.Between(6, 12), 0xd0d6dd, 0.7).setDepth(14);
        s.tweens.add({ targets: rook, x: rook.x + Phaser.Math.Between(-20, 40), y: rook.y - Phaser.Math.Between(10, 50), scale: 2, alpha: 0, duration: 700, onComplete: () => rook.destroy() });
      }
      const groundTop = s.level.platforms[0][1];
      const sx = K.x + 30, sy = K.loopY - 16;
      const boog = { t: 0 };
      p.setScale(1);
      s.tweens.add({
        targets: boog, t: 1, duration: 1300, ease: 'Sine.inOut',
        onUpdate: () => {
          p.setPosition(
            Phaser.Math.Linear(sx, K.landX, boog.t),
            Phaser.Math.Linear(sy, groundTop - 60, boog.t) - Math.sin(boog.t * Math.PI) * 260,
          );
          p.angle = boog.t * 360; // een echte salto!
        },
        onComplete: () => {
          p.setAngle(0);
          p.setPosition(K.landX, groundTop - p.totalH / 2 - 2);
          p.body.enable = true;
          p.body.reset(p.x, p.y);
          s.checkpoint = { x: p.x, bottom: groundTop };
          s.mode = 'explore';
          K.bezig = false; K.vuurt = false; K.geladen = 0;
          tekenStippen(s, K);
          SFX.yay(); Voice.cue('cheer'); s.burstStars(p.x, p.y - 40, 8);
          s.questText.setText('Wat een vlucht! 🎪');
          s.vierMijlpaal(K.landX);
        },
      });
      s.tweens.add({ targets: K.loopArt, angle: -6, duration: 120, yoyo: true }); // terugslag
    } else {
      // PLOF — te weinig (of te veel) kruit: je wipt er giechelend uit.
      // (Geen rekenfout: dit is inschatten, geen som.)
      SFX.oops(); SFX.giggle(); Voice.cue('laugh');
      for (let i = 0; i < 5; i++) {
        const rook = s.add.circle(K.x + 26, K.loopY - 6, Phaser.Math.Between(5, 9), 0x8a8f96, 0.7).setDepth(14);
        s.tweens.add({ targets: rook, y: rook.y - Phaser.Math.Between(8, 26), scale: 1.6, alpha: 0, duration: 600, onComplete: () => rook.destroy() });
      }
      const groundTop = s.level.platforms[0][1];
      s.questText.setText(K.geladen < K.vaatjes
        ? `Pfff… te weinig kruit voor zo'n ravijn! Probeer er meer! 😅`
        : 'BOEM-plof… dat was juist te veel! 😅');
      // je wipt er zachtjes uit, naast het kanon
      const boog = { t: 0 };
      const sx = K.x + 22, sy = K.loopY - 8;
      s.tweens.add({
        targets: boog, t: 1, duration: 600, ease: 'Sine.inOut',
        onUpdate: () => {
          p.setPosition(Phaser.Math.Linear(sx, K.x - 70, boog.t), Phaser.Math.Linear(sy, groundTop - 60, boog.t) - Math.sin(boog.t * Math.PI) * 70);
        },
        onComplete: () => {
          p.setScale(1);
          p.setPosition(K.x - 70, groundTop - p.totalH / 2 - 2);
          p.body.enable = true;
          p.body.reset(p.x, p.y);
          s.mode = 'explore';
          K.vuurt = false; K.geladen = 0; K.bezig = false; K.pakCd = s.time.now + 900;
          tekenStippen(s, K);
        },
      });
    }
  });
}

export default {
  build(s, L) {
    s.kanonnen = [];
    (L.kanonnen || []).forEach((K0) => {
      const groundTop = L.platforms[0][1];
      const loopY = groundTop - 74;

      // het kanon: onderstel met wielen + een schuine loop
      const onderstel = s.add.graphics().setDepth(4);
      onderstel.fillStyle(0x000000, 0.16); onderstel.fillEllipse(K0.x, groundTop + 2, 120, 14);
      onderstel.fillStyle(0x8a5a33, 1); onderstel.fillTriangle(K0.x - 36, groundTop - 10, K0.x + 36, groundTop - 10, K0.x, groundTop - 56);
      onderstel.fillStyle(0x5d3a1e, 1); onderstel.fillCircle(K0.x - 24, groundTop - 14, 15); onderstel.fillCircle(K0.x + 24, groundTop - 14, 15);
      onderstel.fillStyle(0xc9a05a, 1); onderstel.fillCircle(K0.x - 24, groundTop - 14, 6); onderstel.fillCircle(K0.x + 24, groundTop - 14, 6);
      const loopArt = s.add.container(K0.x, loopY).setDepth(5);
      const lg = s.add.graphics();
      lg.fillStyle(0x3a3f45, 1); lg.fillRoundedRect(-26, -22, 74, 44, 16);
      lg.fillStyle(0x565b61, 1); lg.fillRoundedRect(-26, -22, 74, 14, 10);
      lg.fillStyle(0x2b2f34, 1); lg.fillEllipse(46, 0, 16, 40);
      lg.fillStyle(0x16202b, 1); lg.fillEllipse(47, 0, 9, 30);
      // gouden ster op de loop — circus!
      lg.fillStyle(0xf6c624, 1);
      for (let a = 0; a < 5; a++) {
        const ang = -Math.PI / 2 + a * (2 * Math.PI / 5);
        lg.fillCircle(-2 + Math.cos(ang) * 7, Math.sin(ang) * 7, 3);
      }
      loopArt.add(lg);
      loopArt.setAngle(-24); // schuin omhoog gericht

      // de drie kruit-vaatjes op een rijtje (tikbaar, depth 13)
      const K = { ...K0, loopY, loopArt, geladen: 0, bezig: false, vuurt: false, pakCd: 0, cuePlayed: false, vaatjesArt: [] };
      for (let i = 0; i < 3; i++) {
        const vaatje = s.add.container(K0.x - 130 + i * 44, groundTop - 20).setDepth(13);
        vaatje.add(tekenVaatje(s));
        vaatje.setInteractive(new Phaser.Geom.Rectangle(-17, -22, 34, 44), Phaser.Geom.Rectangle.Contains);
        vaatje.input.cursor = 'pointer';
        vaatje.on('pointerdown', () => laad(s, K, vaatje));
        K.vaatjesArt.push(vaatje);
      }
      // de lont-knop op het kanon (tikbaar)
      const lontKnop = s.add.container(K0.x - 30, loopY - 44).setDepth(13);
      const kg = s.add.graphics();
      kg.fillStyle(0xe8402c, 1); kg.fillCircle(0, 0, 15);
      kg.lineStyle(3, 0xb93227, 1); kg.strokeCircle(0, 0, 15);
      kg.lineStyle(3, 0xf6c624, 1);
      kg.beginPath(); kg.moveTo(0, -14); kg.lineTo(6, -24); kg.strokePath(); // het lontje
      lontKnop.add(kg);
      lontKnop.add(s.add.text(0, 1, '💥', { fontSize: '13px' }).setOrigin(0.5));
      lontKnop.setInteractive(new Phaser.Geom.Rectangle(-20, -26, 40, 48), Phaser.Geom.Rectangle.Contains);
      lontKnop.input.cursor = 'pointer';
      K.lontKnop = lontKnop;
      lontKnop.on('pointerdown', () => lont(s, K));
      // de kruit-stippen boven het kanon
      const stipBord = s.add.container(K0.x, loopY - 76).setDepth(7);
      const sbg = s.add.graphics();
      sbg.fillStyle(0x16202b, 0.6); sbg.fillRoundedRect(-38, -15, 76, 30, 10);
      stipBord.add(sbg);
      const stipBar = s.add.graphics();
      stipBord.add(stipBar);
      K.stipBar = stipBar;
      tekenStippen(s, K);

      s.kanonnen.push(K);
    });
  },

  update(s, time) {
    if (!s.kanonnen || !s.kanonnen.length) return;
    const p = s.player;
    for (const K of s.kanonnen) {
      if (K.bezig) continue;
      if (!K.cuePlayed && Math.abs(p.x - K.x) < 260) {
        K.cuePlayed = true;
        Voice.hint('hint-kanon');
        s.questText.setText('Kruip in het kanon — en KNAL over het ravijn! 💥');
      }
      // instappen: loop tegen het kanon aan
      if (s.mode === 'explore' && time > K.pakCd
        && Math.abs(p.x - K.x) < 44 && Math.abs(p.y - (K.loopY + 20)) < 90) {
        stapIn(s, K);
      }
    }
  },
};
