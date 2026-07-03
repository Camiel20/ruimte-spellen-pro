// ===== SYSTEEM: GEEF-PLATEN =====
// Gouden plaat + slagboom: GEEF een deel van jezelf (bv. 3 blokjes) om de
// weg te openen — aftrekken met je eigen lijf als materiaal. Het gegeven
// stapeltje wordt een blij mini-vriendje. Werkwoord: geven/aftrekken.

import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { sig } from '../palette.js';
import { drawCubeStack, addNumberDisc } from '../art.js';

function give(s, pl) {
  pl.given = true;
  const n = pl.doel, was = s.playerValue;
  s.playerValue -= n;
  s.drawPlayer();
  SFX.split(); Voice.number(n);
  // het gegeven stapeltje wordt een blij mini-vriendje op de plaat
  const c = s.add.container(pl.x, 0).setDepth(5);
  const { totalH } = drawCubeStack(s, c, n, { w: 26, cell: 26, color: sig(n), eyeR: 4.5, eyeX: 5.5, pupilR: 2, mouthR: 4.5, faceStroke: 2 });
  c.y = pl.groundTop - totalH / 2;
  addNumberDisc(s, c, n, -totalH / 2 - 10, 9, '11px');
  s.tweens.add({ targets: c, y: c.y - 14, duration: 220, yoyo: true, repeat: 2, ease: 'Sine.inOut' });
  s.heart(pl.x, pl.groundTop - totalH - 26);
  // slagboom omhoog + blokkade weg
  pl.body.body.enable = false;
  s.tweens.add({ targets: pl.beam, angle: -78, duration: 500, ease: 'Back.out' });
  s.tweens.add({ targets: [pl.shimmer, pl.hart], alpha: 0, duration: 500, onComplete: () => { pl.shimmer.destroy(); pl.hart.destroy(); } });
  SFX.yay(); Voice.cue('cheer'); s.burstStars(pl.x, pl.groundTop - 60, 10);
  s.cameraPunch();
  s.questText.setText(`Dank je wel! ${was} − ${n} = ${s.playerValue} — de weg is open! 🚩`);
  s.vierMijlpaal(pl.x);
}

export default {
  build(s, L) {
    s.plates = [];
    (L.plates || []).forEach((P) => {
      const groundTop = L.platforms[0][1];
      const bx = P.x + 96;
      // schermhoge blokkade (niet overheen te springen)…
      const body = s.add.rectangle(bx, (40 + groundTop) / 2, 40, groundTop - 40, 0x000000, 0);
      s.physics.add.existing(body, true);
      s.doorGroup.add(body);
      // …zichtbaar gemaakt met een fonkel-zuil + slagboom
      const shimmer = s.add.graphics().setDepth(3);
      shimmer.fillStyle(0xfff3b0, 0.18); shimmer.fillRoundedRect(bx - 20, 46, 40, groundTop - 106, 18);
      shimmer.fillStyle(0xffe16b, 0.5);
      for (let yy = 70; yy < groundTop - 80; yy += 52) shimmer.fillCircle(bx - 8 + (Math.floor(yy / 52) % 2) * 16, yy, 4);
      s.tweens.add({ targets: shimmer, alpha: 0.5, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      const post = s.add.graphics().setDepth(4);
      post.fillStyle(0x9c6b3f, 1); post.fillRoundedRect(bx + 10, groundTop - 78, 10, 78, 4);
      const beam = s.add.container(bx + 15, groundTop - 72).setDepth(4);
      const bg = s.add.graphics();
      bg.fillStyle(0xe8402c, 1); bg.fillRoundedRect(-86, -7, 92, 14, 7);
      bg.fillStyle(0xffffff, 1); bg.fillRoundedRect(-64, -7, 18, 14, 7); bg.fillRoundedRect(-28, -7, 18, 14, 7);
      beam.add(bg);
      // de plaat zelf + gevraagd getal + zwevend hartje
      const plate = s.add.graphics().setDepth(2);
      plate.fillStyle(0xb98d12, 1); plate.fillEllipse(P.x, groundTop + 3, 84, 18);
      plate.fillStyle(0xffe16b, 1); plate.fillEllipse(P.x, groundTop, 84, 16);
      plate.lineStyle(3, 0xb98d12, 1); plate.strokeEllipse(P.x, groundTop, 84, 16);
      s.add.circle(P.x, groundTop - 46, 15, 0xffffff).setStrokeStyle(3, 0x16202b).setDepth(4);
      s.add.text(P.x, groundTop - 46, `${P.doel}`, { fontFamily: 'Arial Black, Arial', fontSize: '17px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5).setDepth(4);
      const hart = s.add.graphics().setDepth(4);
      hart.fillStyle(0xff6b9d, 1); hart.fillCircle(-4, 0, 5); hart.fillCircle(4, 0, 5); hart.fillTriangle(-9, 2, 9, 2, 0, 13);
      hart.x = P.x; hart.y = groundTop - 78;
      s.tweens.add({ targets: hart, y: groundTop - 86, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      s.plates.push({ ...P, body, beam, shimmer, hart, given: false, groundTop });
    });
  },

  update(s) {
    const p = s.player;
    const onFloor = p.body.blocked.down || p.body.touching.down;
    for (const pl of s.plates) {
      if (pl.given) continue;
      if (Math.abs(p.x - pl.x) < 42 && onFloor) {
        if (!pl.cuePlayed) { pl.cuePlayed = true; Voice.number(pl.doel); }
        if (s.playerValue > pl.doel) give(s, pl);
        else s.questText.setText(`Geef ${pl.doel} blokjes — word eerst groter! (pak bolletjes)`);
      }
    }
  },
};
