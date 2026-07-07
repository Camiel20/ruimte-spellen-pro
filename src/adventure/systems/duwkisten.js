// ===== SYSTEEM: DUW-KISTEN (de kracht van Vier) =====
// Zware houten kisten met groene hoekbanden. Zonder de DUW-kracht staan ze
// muurvast; mét de kracht (gered: Vier, de sterke!) schuif je ze langzaam
// opzij — als opstapje naar hoge bonusplekken. Werkwoord: duwen.
// Leveldata: duwKisten: [x, x, ...] (de kist staat op de grond).

import { darker, sig } from '../palette.js';
import { Voice } from '../../voice.js';

const KIST = 58; // breedte/hoogte

export default {
  build(s, L) {
    s.duwKisten = [];
    (L.duwKisten || []).forEach((x) => {
      const groundTop = L.platforms[0][1];
      const c = s.add.container(x, groundTop - KIST / 2).setDepth(7);
      const g = s.add.graphics();
      const hout = 0xb5793e, band = sig(4);
      g.fillStyle(0x000000, 0.16); g.fillEllipse(0, KIST / 2 + 4, KIST + 6, 10);
      g.fillStyle(hout, 1); g.fillRoundedRect(-KIST / 2, -KIST / 2, KIST, KIST, 6);
      g.fillStyle(darker(hout, 25), 1); g.fillRect(-KIST / 2, -4, KIST, 8); // middenplank
      g.lineStyle(3, darker(hout, 45), 1); g.strokeRoundedRect(-KIST / 2, -KIST / 2, KIST, KIST, 6);
      // groene hoekbanden = "dit is een duw-kist" (de kleur van Vier)
      g.lineStyle(5, band, 1);
      g.beginPath(); g.moveTo(-KIST / 2 + 3, -KIST / 2 + 14); g.lineTo(-KIST / 2 + 3, -KIST / 2 + 3); g.lineTo(-KIST / 2 + 14, -KIST / 2 + 3); g.strokePath();
      g.beginPath(); g.moveTo(KIST / 2 - 3, KIST / 2 - 14); g.lineTo(KIST / 2 - 3, KIST / 2 - 3); g.lineTo(KIST / 2 - 14, KIST / 2 - 3); g.strokePath();
      c.add(g);
      // schildje met '4' — je weet meteen wiens kracht dit vraagt
      c.add(s.add.circle(0, -KIST / 2 + 1, 10, 0xffffff).setStrokeStyle(2, 0x16202b));
      c.add(s.add.text(0, -KIST / 2 + 1, '4', { fontFamily: 'Arial Black, Arial', fontSize: '12px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5));

      s.physics.add.existing(c);
      c.body.setSize(KIST, KIST); c.body.setOffset(-KIST / 2, -KIST / 2);
      c.body.setDragX(1600);         // stopt snel: zwaar gevoel
      c.body.setMaxVelocityX(85);    // langzaam schuiven
      c.body.setCollideWorldBounds(true);
      c._hintAt = 0;
      s.duwKisten.push(c);
    });
  },

  afterPlayer(s) {
    for (const kist of s.duwKisten) {
      s.physics.add.collider(kist, s.platforms);
      s.physics.add.collider(kist, s.doorGroup);
      s.grommels.forEach((gr) => s.physics.add.collider(gr, kist));
      s.physics.add.collider(s.player, kist);
    }
  },

  update(s, time) {
    for (const kist of s.duwKisten) {
      // pushable live bijhouden: de kracht kan midden in het level verdiend worden
      kist.body.pushable = !!s.powers.duw;
      // zonder kracht tegen de kist aan lopen → vriendelijke hint (zonder spam)
      if (!s.powers.duw && time > kist._hintAt
        && Math.abs(s.player.x - kist.x) < KIST / 2 + 30
        && Math.abs(s.player.y - kist.y) < 90
        && (s.player.body.touching.left || s.player.body.touching.right)) {
        kist._hintAt = time + 2600;
        s.questText.setText('Oef, te zwaar… hiervoor heb je de DUW-kracht van Vier nodig! 💪');
        if (!kist._hintOoit) { kist._hintOoit = true; Voice.hint('hint-duwkist', 300); }
      }
    }
  },
};
