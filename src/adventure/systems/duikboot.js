// ===== SYSTEEM: DE DUIKBOOT (verliefde getallen!) =====
// Het pronkstuk van de Bubbel-Zee, gebouwd op het geliefde raket-recept:
// verzamel → tank vol → RIJDEN! De lucht-tank toont "7 ❤ ? = 10" en er
// zweven getal-bellen rond: alleen de bel die de tank PRECIES vol maakt
// (het 10-maatje, dé verliefde getallen van groep 3) past erin — een foute
// bel plopt vriendelijk weg en komt terug. Tank vol → instappen → de
// duikboot vaart golvend met bubbel-spoor en koplamp over de donkere geul.
// Veld: `duikboten: [{ x, landX, toon, bellen: [[x, y, waarde], …] }]`.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { confettiBurst } from '../../reward.js';

// Glinsterende lucht-bel met een getal erin — ook de Inkt-Octopus gebruikt
// deze (zijn tentakel-raadsels zijn dezelfde 10-maatjes).
export function tekenGetalBel(s, x, y, waarde) {
  const c = s.add.container(x, y).setDepth(6);
  const g = s.add.graphics();
  g.fillStyle(0xd7f0fa, 0.3); g.fillCircle(0, 0, 24);
  g.lineStyle(3, 0x7fd0f0, 1); g.strokeCircle(0, 0, 24);
  g.fillStyle(0xffffff, 0.7); g.fillEllipse(-8, -9, 10, 6);
  c.add(g);
  c.add(s.add.text(0, 0, `${waarde}`, {
    fontFamily: 'Arial Black, Arial', fontSize: '22px', fontStyle: 'bold', color: '#16506b',
  }).setOrigin(0.5));
  s.tweens.add({ targets: c, y: y - 10, duration: 1000 + (waarde % 3) * 180, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  c.waarde = waarde; c.spawnY = y; c.taken = false;
  return c;
}

// Het tank-bord: "7 ❤ ? = 10" + tien stippen (toon gevuld, rest open).
function tekenMeter(s, D) {
  const bar = D.meterBar;
  bar.clear();
  for (let i = 0; i < 10; i++) {
    const px = -63 + i * 14;
    if (i < D.vulling) { bar.fillStyle(0x38b6cf, 1); bar.fillCircle(px, 10, 6); }
    bar.lineStyle(2, 0x1f7a9e, 1); bar.strokeCircle(px, 10, 6);
  }
}

function vaar(s, D) {
  D.vertrokken = true;
  s.mode = 'vlucht'; // zelfde stand als de raket: besturing pauzeert
  const p = s.player;
  p.body.setVelocity(0, 0);
  p.body.enable = false;
  const groundTop = s.level.platforms[0][1];
  s.tweens.add({ targets: D.meter, alpha: 0, duration: 400 });
  SFX.pick(); Voice.cue('whee');
  // instappen door de koepel
  s.tweens.add({
    targets: p, x: D.c.x, y: D.c.y - 46, scale: 0.25, duration: 420, ease: 'Sine.inOut',
    onComplete: () => {
      p.setVisible(false); p.setScale(1);
      D.koepelNul.setVisible(true); // daar zit je, achter het glas!
      SFX.fanfare(); s.cameraPunch(0.04, 6);
      s.questText.setText('Borrel-borrel… VAART! 🫧');
      D.schroefTween.timeScale = 4; // de schroef op volle kracht
      D.lamp.setVisible(true);
      const sx = D.c.x, ex = D.landX;
      const prog = { t: 0 };
      s.tweens.add({
        targets: prog, t: 1, duration: 2800, delay: 500, ease: 'Sine.inOut',
        onUpdate: () => {
          const t = prog.t;
          D.c.x = sx + (ex - sx) * t;
          D.c.y = groundTop - 46 - Math.sin(t * Math.PI * 3) * 22; // golvende vaart
          D.c.angle = Math.cos(t * Math.PI * 3) * 6;
          p.setPosition(D.c.x, D.c.y); // camera volgt de speler → dus de boot
          if (Math.random() < 0.5) {
            const bub = s.add.circle(D.c.x - 52, D.c.y + Phaser.Math.Between(-8, 8), Phaser.Math.Between(2, 5), 0xd7f0fa, 0.8).setDepth(6);
            s.tweens.add({ targets: bub, y: bub.y - Phaser.Math.Between(24, 60), alpha: 0, duration: 600, onComplete: () => bub.destroy() });
          }
        },
        onComplete: () => {
          D.c.angle = 0; D.c.y = groundTop - 46;
          D.schroefTween.timeScale = 1;
          D.lamp.setVisible(false);
          D.koepelNul.setVisible(false);
          // uitstappen: voeten op de grond + checkpoint hier
          p.setVisible(true);
          p.setPosition(ex + 70, groundTop - p.totalH / 2 - 2);
          p.body.enable = true;
          p.body.reset(p.x, p.y);
          s.checkpoint = { x: p.x, bottom: groundTop };
          s.mode = 'explore';
          confettiBurst(s, 130); SFX.yay(); Voice.cue('cheer'); s.cameraPunch();
          s.questText.setText('Wat een vaart! Verder! 🚩');
          s.vierMijlpaal(ex);
        },
      });
    },
  });
}

export default {
  build(s, L) {
    s.duikboten = [];
    (L.duikboten || []).forEach((D0) => {
      const groundTop = L.platforms[0][1];
      const c = s.add.container(D0.x, groundTop - 46).setDepth(7);
      const g = s.add.graphics();
      // romp: vrolijk geel met een buik-band en patrijspoorten
      g.fillStyle(0x000000, 0.16); g.fillEllipse(0, 44, 120, 14);
      g.fillStyle(0xf6c624, 1); g.fillEllipse(0, 0, 128, 64);
      g.fillStyle(0xe8a51a, 1); g.fillEllipse(0, 14, 124, 34);
      g.lineStyle(3.5, 0xb98d12, 1); g.strokeEllipse(0, 0, 128, 64);
      // patrijspoorten
      for (const px of [-30, 2, 34]) {
        g.fillStyle(0x8fd3f2, 1); g.fillCircle(px, 6, 8);
        g.lineStyle(3, 0xb98d12, 1); g.strokeCircle(px, 6, 8);
      }
      // periscoop
      g.fillStyle(0xe8a51a, 1); g.fillRoundedRect(-6, -52, 12, 24, 4);
      g.fillRoundedRect(-6, -56, 22, 10, 4);
      c.add(g);
      // koepel met (straks) jou erin
      const koepel = s.add.graphics();
      koepel.fillStyle(0xd7f0fa, 0.75); koepel.slice(0, -28, 24, Math.PI, 0, false); koepel.fillPath();
      koepel.lineStyle(3, 0xb98d12, 1); koepel.strokeCircle(0, -28, 0.1); koepel.beginPath(); koepel.arc(0, -28, 24, Math.PI, 0); koepel.strokePath();
      c.add(koepel);
      const koepelNul = s.add.circle(0, -34, 9, 0xe8402c).setVisible(false);
      c.add(koepelNul);
      // schroef achterop (draait rustig, op volle kracht tijdens de vaart)
      const schroef = s.add.container(-66, 4);
      const sg = s.add.graphics();
      sg.fillStyle(0x8a97a2, 1); sg.fillEllipse(0, -12, 8, 20); sg.fillEllipse(0, 12, 8, 20);
      sg.fillCircle(0, 0, 5);
      schroef.add(sg);
      c.add(schroef);
      const schroefTween = s.tweens.add({ targets: schroef, angle: 360, duration: 900, repeat: -1 });
      // koplamp-bundel (alleen tijdens de vaart)
      const lamp = s.add.graphics().setVisible(false);
      lamp.fillStyle(0xfff3b0, 0.3); lamp.fillTriangle(58, -6, 58, 14, 150, 34); lamp.fillTriangle(58, -6, 58, 14, 150, -26);
      c.add(lamp);

      // het tank-bord: "toon ❤ ? = 10" + de tien stippen
      const meter = s.add.container(D0.x, groundTop - 168).setDepth(7);
      const mbg = s.add.graphics();
      mbg.fillStyle(0x16202b, 0.55); mbg.fillRoundedRect(-78, -26, 156, 56, 14);
      meter.add(mbg);
      const mt = s.add.text(0, -10, `${D0.toon} ❤ ? = 10`, {
        fontFamily: 'Arial Black, Arial', fontSize: '17px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5);
      meter.add(mt);
      const bar = s.add.graphics();
      meter.add(bar);

      const D = {
        ...D0, c, meter, meterText: mt, meterBar: bar, koepelNul, schroefTween, lamp,
        vulling: D0.toon, vol: false, vertrokken: false, cueAt: 0,
      };
      tekenMeter(s, D);

      // de getal-bellen
      D.belSprites = (D0.bellen || []).map(([bx, by, w]) => tekenGetalBel(s, bx, by, w));
      s.duikboten.push(D);
    });
  },

  update(s, time) {
    if (!s.duikboten || !s.duikboten.length) return;
    const p = s.player, b = p.body;
    for (const D of s.duikboten) {
      if (D.vertrokken) continue;
      // bellen aanraken (ruim, aan het lijf gemeten — zoals het maat-fruit)
      if (!D.vol) {
        for (const bel of D.belSprites) {
          if (bel.taken || !bel.active) continue;
          const dx = Math.max(b.left - bel.x, 0, bel.x - b.right);
          const dy = Math.max(b.top - bel.y, 0, bel.y - b.bottom);
          if (dx * dx + dy * dy > 52 * 52) continue;
          bel.taken = true;
          if (bel.waarde === 10 - D.toon) {
            // HET MAATJE! De bel vliegt naar de tank → vol → hartjes!
            SFX.correct(); Voice.number(bel.waarde);
            s.tweens.killTweensOf(bel);
            s.tweens.add({
              targets: bel, x: D.c.x, y: D.c.y - 120, scale: 0.4, duration: 500, ease: 'Sine.inOut',
              onComplete: () => {
                bel.destroy();
                D.vol = true;
                D.vulling = 10;
                tekenMeter(s, D);
                D.meterText.setText(`${D.toon} ❤ ${bel.waarde} = 10!`);
                SFX.fanfare(); Voice.cue('cheer'); confettiBurst(s, 90);
                s.heart(D.c.x, D.c.y - 130); s.heart(D.c.x - 26, D.c.y - 110); s.heart(D.c.x + 26, D.c.y - 110);
                s.tweens.add({ targets: D.meter, scale: 1.15, duration: 140, yoyo: true });
                s.questText.setText(`${D.toon} en ${bel.waarde} zijn verliefd — samen 10! Stap in! 🫧`);
                s.tweens.add({ targets: D.c, x: D.c.x + 3, duration: 70, yoyo: true, repeat: 5 });
              },
            });
          } else {
            // vriendelijke plop — de bel komt zo terug
            SFX.oops(); Voice.cue('oops');
            s.rekenFouten += 1;
            s.tweens.add({ targets: bel, scale: 0, alpha: 0, duration: 260, ease: 'Back.in' });
            s.questText.setText(`${D.toon} + ${bel.waarde} is geen 10 — zoek het maatje van ${D.toon}!`);
            s.time.delayedCall(2400, () => {
              if (!bel.active) return;
              bel.taken = false; bel.setScale(1).setAlpha(1); SFX.sparkle();
              s.tweens.add({ targets: bel, scale: { from: 0.3, to: 1 }, duration: 260, ease: 'Back.out' });
            });
          }
          break;
        }
      }
      // bij de duikboot: instappen (vol) of uitleggen wat hij wil
      if (Math.abs(p.x - D.c.x) < 64) {
        if (D.vol) vaar(s, D);
        else if (time > D.cueAt) {
          if (!D.cueAt) Voice.cue('greet');
          D.cueAt = time + 2600;
          s.questText.setText(`De tank wil PRECIES 10: ${D.toon} + ? — pak de goede lucht-bel! 🫧`);
        }
      }
    }
  },
};
