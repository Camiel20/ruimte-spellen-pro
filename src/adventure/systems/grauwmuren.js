// ===== SYSTEEM: GRAUWE MUREN (de tien-kracht) =====
// Schermhoge muren van grauwe blokken die Baron Grauw heeft neergezet.
// Alleen wie TIEN heeft gered (de mega-kracht!) ramt er dwars doorheen:
// gewoon tegen de muur aan rennen → KABOEM. Werkwoord: rammen/doorzetten.
// Leveldata: grauwMuren: [x, x, ...] (schermhoog, op de grond).

import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';

function breek(s, muur) {
  muur.broken = true;
  muur.body.body.enable = false;
  SFX.stomp(); SFX.yay(); s.cameraPunch(0.05, 8);
  s.burstStars(muur.x, 400, 16);
  // de muur brokkelt af: blokjes vallen naar beneden
  s.tweens.add({ targets: muur.art, scaleY: 0.05, y: muur.groundTop, alpha: 0.2, duration: 420, ease: 'Quad.in', onComplete: () => muur.art.destroy() });
  Voice.cue('cheer');
  s.questText.setText('KABOEM! De tien-kracht breekt de muur! 🔟💥');
  s.vierMijlpaal(muur.x);
}

export default {
  build(s, L) {
    s.grauwMuren = [];
    s.grauwGroup = s.physics.add.staticGroup();
    (L.grauwMuren || []).forEach((x) => {
      const groundTop = L.platforms[0][1];
      const topY = 120, h = groundTop - topY;
      const body = s.add.rectangle(x, topY + h / 2, 54, h, 0x000000, 0);
      s.physics.add.existing(body, true);
      s.grauwGroup.add(body);
      // grauwe blokken-muur met barsten…
      const art = s.add.container(x, topY + h / 2).setDepth(4);
      const g = s.add.graphics();
      for (let yy = -h / 2; yy < h / 2; yy += 42) {
        const rij = Math.floor((yy + h / 2) / 42) % 2;
        g.fillStyle(rij ? 0x8a8f96 : 0x7d838c, 1);
        g.fillRoundedRect(-26, yy, 52, 40, 5);
        g.lineStyle(2.5, 0x565b61, 1); g.strokeRoundedRect(-26, yy, 52, 40, 5);
      }
      // …met barsten (hij is al zwak — de tien-kracht maakt hem af)
      g.lineStyle(2, 0x4a4f55, 0.8);
      g.beginPath(); g.moveTo(-8, -h / 2 + 30); g.lineTo(6, -h / 2 + 90); g.lineTo(-4, -h / 2 + 150); g.strokePath();
      g.beginPath(); g.moveTo(10, h / 2 - 160); g.lineTo(-6, h / 2 - 90); g.lineTo(8, h / 2 - 30); g.strokePath();
      art.add(g);
      // schild met '10': je ziet meteen wiens kracht dit vraagt
      art.add(s.add.circle(0, -h / 2 + 36, 17, 0xffffff).setStrokeStyle(3, 0x16202b));
      art.add(s.add.text(0, -h / 2 + 36, '10', { fontFamily: 'Arial Black, Arial', fontSize: '16px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5));
      const muur = { x, body, art, groundTop, broken: false, hintAt: 0 };
      body._muur = muur;
      s.grauwMuren.push(muur);
    });
  },

  afterPlayer(s) {
    if (!s.grauwMuren.length) return;
    s.physics.add.collider(s.player, s.grauwGroup, null, (pl, body) => {
      const muur = body._muur;
      if (!muur || muur.broken) return false;
      // Mét de tien-kracht + rennend tegen de muur → erdoorheen!
      if (s.powers.mega && Math.abs(pl.body.velocity.x) > 60) {
        breek(s, muur);
        return false;
      }
      if (!s.powers.mega && s.time.now > muur.hintAt) {
        muur.hintAt = s.time.now + 2600;
        s.questText.setText('Een grauwe muur… alleen de TIEN-kracht breekt hem! 🔟');
      }
      return true;
    });
  },
};
