// ===== SYSTEEM: FOSSIELEN VEGEN (Dino-Dal, Wereld 15) =====
// Een zandheuvel met iets erin… VEEG met je vinger over het zand (echte
// veeg-beweging, geen tik) en laag voor laag komt een dino-skelet
// tevoorschijn — als opgraving-feestje met sterren en een juich. Puur
// verwonder-werkwoord: geen blokkade, wel een beloning voor nieuwsgierige
// vingers. Veld: `fossielen: [[x]]` — de heuvel ligt op de grond.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';

const LAGEN = 3;      // drie vegen-lagen zand
const VEEG_PX = 70;   // zoveel vinger-beweging veegt één laag weg

// het verstopte skelet: een opgerolde dino van botjes
function tekenSkelet(s) {
  const g = s.add.graphics();
  g.lineStyle(4, 0xf3ead2, 1);
  // ruggengraat-boog
  g.beginPath(); g.arc(0, 6, 26, Math.PI, 2 * Math.PI); g.strokePath();
  // ribben
  for (let i = -1; i <= 1; i++) {
    g.beginPath(); g.moveTo(i * 12, -14 + Math.abs(i) * 4); g.lineTo(i * 12, 8); g.strokePath();
  }
  // kop + oogkas
  g.fillStyle(0xf3ead2, 1); g.fillEllipse(30, -6, 20, 13);
  g.fillStyle(0x8a6a4a, 1); g.fillCircle(33, -8, 3);
  // staart-botjes
  g.fillStyle(0xf3ead2, 1);
  g.fillCircle(-30, 2, 4); g.fillCircle(-38, 6, 3.4); g.fillCircle(-45, 10, 2.8);
  return g;
}

function tekenZandlaag(s, laag) {
  const g = s.add.graphics();
  const b = 92 - laag * 14, h = 42 - laag * 8;
  g.fillStyle(laag % 2 ? 0xd9b878 : 0xcfa960, 1);
  g.fillEllipse(0, 8 - laag * 6, b, h);
  g.fillStyle(0xe8cf94, 0.6); g.fillEllipse(-10, 2 - laag * 6, b * 0.4, h * 0.4);
  return g;
}

function veegLaag(s, F) {
  F.laag += 1;
  SFX.step();
  const zand = F.zandLagen[LAGEN - F.laag];
  // zandkorrels stuiven weg
  for (let i = 0; i < 6; i++) {
    const k = s.add.circle(F.x + Phaser.Math.Between(-30, 30), F.y - 10, Phaser.Math.Between(2, 4), 0xd9b878, 0.9).setDepth(9);
    s.tweens.add({ targets: k, x: k.x + Phaser.Math.Between(-40, 40), y: k.y - Phaser.Math.Between(10, 34), alpha: 0, duration: 420, onComplete: () => k.destroy() });
  }
  s.tweens.add({ targets: zand, alpha: 0, scale: 1.15, duration: 260, onComplete: () => zand.destroy() });
  if (F.laag >= LAGEN) {
    // HET FOSSIEL! Opgraving compleet.
    F.klaar = true;
    F.zone.disableInteractive();
    SFX.fanfare(); Voice.cue('great');
    s.burstStars(F.x, F.y - 30, 10);
    s.sparkleAt(F.x, F.y - 16, 8);
    s.tweens.add({ targets: F.skelet, alpha: 1, scale: { from: 0.8, to: 1 }, duration: 400, ease: 'Back.out' });
    s.questText.setText('Een echt dino-fossiel — wat een vondst! 🦴');
    s.tweens.add({ targets: F.skelet, y: F.skelet.y - 4, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  } else {
    s.questText.setText('Er zit iets in het zand — veeg verder! 🖐️');
  }
}

export default {
  build(s, L) {
    s.fossielen = [];
    (L.fossielen || []).forEach(([x]) => {
      const groundTop = L.platforms[0][1];
      const y = groundTop;
      const c = s.add.container(x, y).setDepth(5);
      // het skelet ligt eronder (onzichtbaar tot alles is weggeveegd)
      const skelet = s.add.container(0, -14);
      skelet.add(tekenSkelet(s));
      skelet.setAlpha(0);
      c.add(skelet);
      // de zand-lagen erbovenop (groot → klein)
      const zandLagen = [];
      for (let laag = 0; laag < LAGEN; laag++) {
        const zg = tekenZandlaag(s, laag);
        zg.setY(-10 - laag * 6);
        c.add(zg);
        zandLagen.push(zg);
      }
      // glinstertje als uitnodiging
      const twinkel = s.add.star(x + 18, y - 34, 5, 3, 7, 0xffe16b).setDepth(6);
      s.tweens.add({ targets: twinkel, alpha: 0.2, scale: 1.3, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

      // de veeg-zone (depth 13 = boven de speler; vegen = pointermove)
      const zone = s.add.container(x, y - 16).setDepth(13);
      zone.setInteractive(new Phaser.Geom.Rectangle(-56, -34, 112, 62), Phaser.Geom.Rectangle.Contains);
      const F = { x, y, zandLagen, skelet, zone, twinkel, laag: 0, klaar: false, veegAcc: 0, laatsteX: null, cuePlayed: false };
      zone.on('pointermove', (pointer) => {
        if (F.klaar || !pointer.isDown) { F.laatsteX = null; return; }
        if (F.laatsteX != null) {
          F.veegAcc += Math.abs(pointer.worldX - F.laatsteX);
          if (F.veegAcc >= VEEG_PX) { F.veegAcc = 0; veegLaag(s, F); }
        }
        F.laatsteX = pointer.worldX;
      });
      zone.on('pointerout', () => { F.laatsteX = null; });
      s.fossielen.push(F);
    });
  },

  update(s) {
    if (!s.fossielen || !s.fossielen.length) return;
    const p = s.player;
    for (const F of s.fossielen) {
      if (F.klaar) {
        if (F.twinkel.active) F.twinkel.destroy();
        continue;
      }
      if (!F.cuePlayed && Math.abs(p.x - F.x) < 200) {
        F.cuePlayed = true;
        Voice.hint('hint-fossiel');
        s.questText.setText('Daar glinstert iets — VEEG het zand weg! 🖐️');
      }
    }
  },
};
