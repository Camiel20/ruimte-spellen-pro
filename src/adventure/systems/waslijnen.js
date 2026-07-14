// ===== SYSTEEM: WASLIJN-TOKKELBAAN (de Kleren-Kast, Wereld 13) =====
// Een waslijn hangt over het ravijn; aan het begin bungelt een hangertje.
// Spring op en GRIJP het hangertje → je zoeft langs de lijn naar de overkant
// (met wapperende benen). Het beweeg-werkwoord van de Kleren-Kast: durven
// springen + loslaten op het goede moment doet de zwaartekracht vanzelf.
// Veld: `wasLijnen: [{ x1, y1, x2, y2 }]` — (x1,y1) = hanger, (x2,y2) = einde.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';

const SNELHEID = 330; // px/s langs de lijn

function tekenHanger(s) {
  const g = s.add.graphics();
  g.lineStyle(3.5, 0x9aa0a6, 1);
  g.strokeCircle(0, -14, 5);                       // het haakje
  g.beginPath(); g.moveTo(-16, 4); g.lineTo(0, -9); g.lineTo(16, 4); g.strokePath();
  g.beginPath(); g.moveTo(-16, 4); g.lineTo(16, 4); g.strokePath();
  g.fillStyle(0xd9a04a, 1); g.fillRoundedRect(-3, -12, 6, 6, 2); // knijpertje
  return g;
}

function startRit(s, W) {
  const p = s.player;
  W.bezig = true;
  s.mode = 'vlucht'; // besturing pauzeert (zelfde stand als raket/duikboot)
  p.body.setVelocity(0, 0);
  p.body.enable = false;
  SFX.pick(); Voice.cue('whee');
  s.questText.setText('Zoefff — hou je vast! 🧺');
  W.hanger.setVisible(false);
  const lengte = Phaser.Math.Distance.Between(W.x1, W.y1, W.x2, W.y2);
  const rit = { t: 0 };
  const ritHanger = tekenHanger(s).setDepth(9);
  s.tweens.add({
    targets: rit, t: 1, duration: (lengte / SNELHEID) * 1000, ease: 'Sine.inOut',
    onUpdate: () => {
      const hx = Phaser.Math.Linear(W.x1, W.x2, rit.t);
      const hy = Phaser.Math.Linear(W.y1, W.y2, rit.t) + Math.sin(rit.t * Math.PI) * 14; // de lijn zakt ietsje door
      ritHanger.setPosition(hx, hy);
      p.setPosition(hx, hy + 44); // jij bungelt eronder
      p.art.angle = Math.sin(rit.t * Math.PI * 4) * 7; // wapperende benen
      if (Math.random() < 0.2) s.sparkleAt(hx, hy - 6, 1);
    },
    onComplete: () => {
      ritHanger.destroy();
      p.art.angle = 0;
      p.body.enable = true;
      p.body.reset(p.x, p.y);
      p.body.setVelocity(160, -180); // een vrolijk boogje eraf
      s.jumpsUsed = 0;
      s.mode = 'explore';
      SFX.yay();
      s.questText.setText('Wat een rit! 🎉');
      // het hangertje glijdt (even later) terug naar het begin — opnieuw kan altijd
      s.time.delayedCall(1600, () => {
        if (!W.hanger.active) return;
        W.hanger.setPosition(W.x1, W.y1 + 6).setVisible(true).setAlpha(0);
        s.tweens.add({ targets: W.hanger, alpha: 1, duration: 300 });
        W.bezig = false;
      });
    },
  });
}

export default {
  build(s, L) {
    s.wasLijnen = [];
    (L.wasLijnen || []).forEach((W0) => {
      // de lijn zelf (met een lichte doorzak-boog) + palen op de eindpunten
      const g = s.add.graphics().setDepth(2);
      g.lineStyle(3.5, 0xf5f9fc, 0.95);
      const midX = (W0.x1 + W0.x2) / 2, midY = (W0.y1 + W0.y2) / 2 + 16;
      g.beginPath(); g.moveTo(W0.x1, W0.y1);
      for (let t = 0.1; t <= 1.001; t += 0.1) {
        const qx = Phaser.Math.Linear(Phaser.Math.Linear(W0.x1, midX, t), Phaser.Math.Linear(midX, W0.x2, t), t);
        const qy = Phaser.Math.Linear(Phaser.Math.Linear(W0.y1, midY, t), Phaser.Math.Linear(midY, W0.y2, t), t);
        g.lineTo(qx, qy);
      }
      g.strokePath();
      // knijpers op de lijn
      g.fillStyle(0xd9a04a, 1);
      for (const t of [0.3, 0.6, 0.85]) {
        g.fillRect(Phaser.Math.Linear(W0.x1, W0.x2, t) - 2, Phaser.Math.Linear(W0.y1, W0.y2, t) + 10 - 2, 4, 9);
      }

      const hanger = s.add.container(W0.x1, W0.y1 + 6).setDepth(9);
      hanger.add(tekenHanger(s));
      s.tweens.add({ targets: hanger, y: W0.y1 + 12, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

      s.wasLijnen.push({ ...W0, hanger, bezig: false });
    });
  },

  update(s) {
    if (!s.wasLijnen || !s.wasLijnen.length || s.mode !== 'explore') return;
    const p = s.player, b = p.body;
    for (const W of s.wasLijnen) {
      if (W.bezig) continue;
      // eerste keer in de buurt: gesproken uitleg
      if (!s._waslijnHint && Math.abs(p.x - W.x1) < 260) {
        s._waslijnHint = true;
        Voice.hint('hint-waslijn');
        s.questText.setText('Spring en grijp het hangertje! 🧺');
      }
      // GRIJPEN: in de lucht, dicht bij het hangertje
      const opGrond = b.blocked.down || b.touching.down;
      if (!opGrond && Math.abs(p.x - W.hanger.x) < 46 && Math.abs(p.y - W.hanger.y) < 58) {
        startRit(s, W);
        break;
      }
    }
  },
};
