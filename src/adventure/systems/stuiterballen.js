// ===== SYSTEEM: REUZEN-STUITERBALLEN (het Stuiter-Stadion, Wereld 14) =====
// Een grote strandbal die je kunt DUWEN (hij rolt!) én waarop je kunt
// stuiteren: land erop en je wordt hoger gelanceerd dan je ooit kunt
// springen — en je dubbelsprong is weer opgeladen. Het beweeg-werkwoord van
// het Stadion: zelf beslissen wáár de bal moet liggen (onder die hoge
// richel!) en er dan bovenop springen.
// Veld: `stuiterBallen: [x, x, ...]` — de bal ligt op de grond.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';

const R = 34;          // straal van de bal
const LANCEER = -880;  // hoger dan de stuiter-bil (−840) — dit is een ECHTE bal

const PANEEL = [0xe8402c, 0xffe16b, 0x3f8fe8, 0x57b947];

function tekenBal(s) {
  const g = s.add.graphics();
  // strandbal: gekleurde panelen rond een witte pool
  for (let i = 0; i < 4; i++) {
    g.fillStyle(PANEEL[i], 1);
    g.slice(0, 0, R, (i / 4) * Math.PI * 2 - Math.PI / 2, ((i + 1) / 4) * Math.PI * 2 - Math.PI / 2, false);
    g.fillPath();
  }
  g.fillStyle(0xffffff, 1); g.fillCircle(0, 0, 9);
  g.fillStyle(0xffffff, 0.45); g.fillEllipse(-11, -13, 16, 10); // glans
  g.lineStyle(3, 0x16202b, 0.35); g.strokeCircle(0, 0, R);
  return g;
}

export default {
  build(s, L) {
    s.stuiterBallen = [];
    (L.stuiterBallen || []).forEach((x) => {
      const groundTop = L.platforms[0][1];
      const c = s.add.container(x, groundTop - R).setDepth(7);
      const schaduw = s.add.graphics();
      schaduw.fillStyle(0x000000, 0.16); schaduw.fillEllipse(0, R + 4, R * 2 + 6, 10);
      c.add(schaduw);
      const art = s.add.container(0, 0);
      art.add(tekenBal(s));
      c.add(art);
      c.art = art;

      s.physics.add.existing(c);
      c.body.setSize(R * 2, R * 2); c.body.setOffset(-R, -R);
      c.body.pushable = true;         // een bal duw je gewoon — geen kracht nodig
      c.body.setDragX(420);           // rolt nog even door: bal-gevoel
      c.body.setMaxVelocityX(150);
      c.body.setBounce(0.2, 0);
      c.body.setCollideWorldBounds(true);
      c.cd = 0;
      s.stuiterBallen.push(c);
    });
  },

  afterPlayer(s) {
    for (const bal of s.stuiterBallen || []) {
      s.physics.add.collider(bal, s.platforms);
      s.physics.add.collider(bal, s.doorGroup);
      s.physics.add.collider(s.player, bal);
    }
  },

  update(s, time) {
    if (!s.stuiterBallen || !s.stuiterBallen.length) return;
    const p = s.player, b = p.body;
    for (const bal of s.stuiterBallen) {
      // de bal rolt zichtbaar mee met zijn snelheid
      bal.art.angle += bal.body.velocity.x * 0.06;
      // eerste keer in de buurt: gesproken uitleg
      if (!s._stuiterbalHint && Math.abs(p.x - bal.x) < 240) {
        s._stuiterbalHint = true;
        Voice.hint('hint-stuiterbal');
        s.questText.setText('Duw de bal waar jij wilt — en STUITER erop! ⚽');
      }
      if (time < bal.cd) continue;
      // alleen bij LANDEN bovenop de bal (vallend, voeten rond de top)
      if (b.velocity.y > 60 && Math.abs(p.x - bal.x) < R + 14
        && b.bottom > bal.y - R - 18 && b.bottom < bal.y + 10) {
        bal.cd = time + 350;
        b.setVelocityY(LANCEER);
        s.jumpsUsed = 0; // dubbelsprong weer opgeladen — stuiter-kettingen!
        SFX.split(); Voice.cue('whee');
        s.squashArt(0.8, 1.3, 160);
        // de bal deukt in en veert terug
        s.tweens.killTweensOf(bal.art);
        bal.art.setScale(1, 1);
        s.tweens.add({ targets: bal.art, scaleY: 0.6, scaleX: 1.22, duration: 110, yoyo: true, ease: 'Quad.out' });
        s.sparkleAt(bal.x, bal.y - R, 6);
      }
    }
  },
};
