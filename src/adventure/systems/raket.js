// ===== SYSTEEM: RAKET (tank precies vol!) =====
// Tellen met sprongen van 10: verzamel vaatjes van 10 tot de tank op precies
// `doel` staat, stap in en de raket vliegt je over het ruimte-ravijn.
// Werkwoord: tanken (tientallen tellen tot 100).

import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { confettiBurst } from '../../reward.js';

function drawBar(s) {
  const R = s.raket, bar = R.meterBar;
  bar.clear();
  bar.fillStyle(0x2b3d52, 1); bar.fillRoundedRect(-54, 2, 108, 10, 5);
  const frac = Math.min(1, R.fuel / R.doel);
  if (frac > 0) { bar.fillStyle(frac >= 1 ? 0x2fae4e : 0xffc14d, 1); bar.fillRoundedRect(-54, 2, 108 * frac, 10, 5); }
}

function launch(s) {
  const R = s.raket;
  R.launched = true;
  s.mode = 'vlucht'; // update-lus pauzeert de besturing tijdens de vlucht
  const p = s.player;
  p.body.setVelocity(0, 0);
  p.body.enable = false;
  const groundTop = s.level.platforms[0][1];
  s.tweens.add({ targets: R.meter, alpha: 0, duration: 400 });
  // instappen: Één huppelt naar de patrijspoort en verdwijnt erin
  SFX.pick(); Voice.cue('whee');
  s.tweens.add({
    targets: p, x: R.c.x, y: R.c.y - 112, scale: 0.25, duration: 420, ease: 'Sine.inOut',
    onComplete: () => {
      p.setVisible(false); p.setScale(1);
      R.win.setFillStyle(0xe8402c); // Één kijkt door het raampje
      SFX.fanfare(); s.cameraPunch(0.04, 6);
      s.questText.setText('3… 2… 1… LANCEREN! 🚀');
      R.flame.setVisible(true);
      const sx = R.c.x, ex = R.landX, peak = 330;
      const prog = { t: 0 };
      s.tweens.add({
        targets: prog, t: 1, duration: 2600, delay: 600, ease: 'Sine.inOut',
        onUpdate: () => {
          const t = prog.t;
          R.c.x = sx + (ex - sx) * t;
          R.c.y = groundTop - Math.sin(Math.PI * t) * peak;
          R.c.angle = Math.sin(Math.PI * t) * 14;
          p.setPosition(R.c.x, R.c.y - 100); // camera volgt de speler → dus de raket
          if (Math.random() < 0.3) s.sparkleAt(R.c.x, R.c.y + 10, 1);
        },
        onComplete: () => {
          R.flame.setVisible(false);
          R.c.angle = 0; R.c.y = groundTop;
          R.win.setFillStyle(0x8fd3f2);
          // uitstappen: voeten netjes op de grond + checkpoint hier
          p.setVisible(true);
          p.setPosition(ex + 60, groundTop - p.totalH / 2 - 2);
          p.body.enable = true;
          p.body.reset(p.x, p.y);
          s.checkpoint = { x: p.x, bottom: groundTop };
          s.mode = 'explore';
          confettiBurst(s, 130); SFX.yay(); Voice.cue('cheer'); s.cameraPunch();
          s.questText.setText('Wat een vlucht! Ren naar de vlag! 🚩');
          s.vierMijlpaal(ex);
        },
      });
    },
  });
}

export default {
  build(s, L) {
    s.raket = null;
    s.fuelDrums = [];
    if (!L.raket) return;
    const R = L.raket, groundTop = L.platforms[0][1];

    const c = s.add.container(R.x, groundTop).setDepth(7);
    const g = s.add.graphics();
    g.fillStyle(0x000000, 0.18); g.fillEllipse(0, 2, 80, 14);
    // vinnen
    g.fillStyle(0xb93227, 1);
    g.fillTriangle(-24, -10, -46, 0, -24, -58);
    g.fillTriangle(24, -10, 46, 0, 24, -58);
    // romp + neuskegel + glansstreep
    g.fillStyle(0xe8eef5, 1); g.fillRoundedRect(-26, -158, 52, 152, { tl: 26, tr: 26, bl: 10, br: 10 });
    g.fillStyle(0xe8402c, 1); g.fillTriangle(-26, -150, 26, -150, 0, -208);
    g.fillStyle(0xffffff, 0.55); g.fillRoundedRect(-20, -140, 10, 90, 5);
    g.lineStyle(3.5, 0x5b6168, 1); g.strokeRoundedRect(-26, -158, 52, 152, { tl: 26, tr: 26, bl: 10, br: 10 });
    c.add(g);
    // patrijspoort (bij de lancering kijkt Één erdoorheen)
    const win = s.add.circle(0, -112, 15, 0x8fd3f2).setStrokeStyle(4, 0x5b6168);
    c.add(win);
    // vlam (pas zichtbaar bij de lancering)
    const flame = s.add.graphics();
    flame.fillStyle(0xf07c1f, 0.95); flame.fillTriangle(-14, -4, 14, -4, 0, 42);
    flame.fillStyle(0xffe16b, 0.95); flame.fillTriangle(-8, -4, 8, -4, 0, 26);
    flame.setVisible(false);
    c.add(flame);
    s.tweens.add({ targets: flame, scaleY: 1.3, duration: 90, yoyo: true, repeat: -1 });

    // tank-meter boven de raket: balk + grote teller
    const meter = s.add.container(R.x, groundTop - 258).setDepth(7);
    const mbg = s.add.graphics();
    mbg.fillStyle(0x16202b, 0.55); mbg.fillRoundedRect(-64, -24, 128, 60, 14);
    meter.add(mbg);
    const bar = s.add.graphics();
    meter.add(bar);
    const mt = s.add.text(0, -8, `0 / ${R.doel}`, { fontFamily: 'Arial Black, Arial', fontSize: '18px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
    const ml = s.add.text(0, 24, '⛽ tank de raket!', { fontFamily: 'Arial', fontSize: '12px', color: '#cfe0ee' }).setOrigin(0.5);
    meter.add([mt, ml]);

    s.raket = { ...R, c, flame, win, meter, meterText: mt, meterBar: bar, fuel: 0, ready: false, launched: false, cueAt: 0 };
    drawBar(s);

    // de vaatjes van 10 (oranje jerrycans)
    (R.drums || []).forEach(([x, y]) => {
      const d = s.add.container(x, y).setDepth(5);
      const dg = s.add.graphics();
      dg.fillStyle(0xb45309, 1); dg.fillRoundedRect(-6, -21, 12, 6, 2); // dopje
      dg.fillStyle(0xf07c1f, 1); dg.fillRoundedRect(-14, -16, 28, 32, 6);
      dg.fillStyle(0xffc14d, 1); dg.fillRoundedRect(-14, -16, 28, 9, { tl: 6, tr: 6, bl: 0, br: 0 });
      dg.lineStyle(2.5, 0xb45309, 1); dg.strokeRoundedRect(-14, -16, 28, 32, 6);
      d.add(dg);
      d.add(s.add.text(0, 2, '10', { fontFamily: 'Arial Black, Arial', fontSize: '14px', fontStyle: 'bold', color: '#7a3d05' }).setOrigin(0.5));
      d.taken = false;
      s.tweens.add({ targets: d, y: y - 7, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      s.fuelDrums.push(d);
    });
  },

  update(s, time) {
    const R = s.raket;
    if (!R || R.launched) return;
    const p = s.player;
    // vaatjes oppakken: +10 op de teller (hardop tellen in tientallen!)
    for (const d of s.fuelDrums) {
      if (d.taken) continue;
      if (Math.abs(p.x - d.x) < 46 && Math.abs(p.y - d.y) < 62) {
        d.taken = true;
        R.fuel += 10;
        s.tweens.killTweensOf(d);
        s.tweens.add({ targets: d, scale: 0, y: d.y - 20, duration: 220, ease: 'Back.in', onComplete: () => d.destroy() });
        SFX.coin(); SFX.grow(R.fuel / 10); // oplopend toontje: 10, 20, 30, …
        const t10 = s.add.text(d.x, d.y - 26, '+10', { fontFamily: 'Arial Black, Arial', fontSize: '20px', fontStyle: 'bold', color: '#ffe16b' }).setOrigin(0.5).setDepth(60).setStroke('#7a3d05', 5);
        s.tweens.add({ targets: t10, y: d.y - 64, alpha: 0, duration: 800, ease: 'Quad.out', onComplete: () => t10.destroy() });
        R.meterText.setText(`${R.fuel} / ${R.doel}`);
        drawBar(s);
        s.tweens.add({ targets: R.meter, scale: 1.15, duration: 120, yoyo: true });
        if (R.fuel >= R.doel) {
          R.ready = true;
          SFX.fanfare(); Voice.cue('cheer'); confettiBurst(s, 80);
          R.meterText.setText(`${R.doel}! VOL`);
          s.questText.setText(`PRECIES ${R.doel} — de tank is vol! Stap in! 🚀`);
          s.tweens.add({ targets: R.c, x: R.c.x + 3, duration: 70, yoyo: true, repeat: 5 }); // trappelen om te gaan
        } else {
          s.questText.setText(`Brandstof: ${R.fuel} / ${R.doel} ⛽`);
        }
      }
    }
    // bij de raket: instappen (vol) of uitleggen wat hij wil (nog niet vol)
    if (Math.abs(p.x - R.c.x) < 60) {
      if (R.ready) launch(s);
      else if (time > R.cueAt) {
        if (!R.cueAt) { Voice.cue('greet'); Voice.hint('hint-raket', 700); }
        R.cueAt = time + 2600;
        s.questText.setText(`De raket wil PRECIES ${R.doel} brandstof — pak de vaatjes van 10! ⛽`);
      }
    }
  },
};
