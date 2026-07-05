// ===== SYSTEEM: NUL-FEEST (de geheime Nul-Wereld) =====
// De bonuswereld hoort een FEESTJE te zijn: overal zweven gouden nullen om
// te vangen (teller bovenin!), bij elk tiental knalt er nul-vuurwerk, en
// reuzen-nul-RINGEN lanceren je juichend de lucht in. Vang je ze allemaal,
// dan barst de grote NUL-REGEN los (+ bonus-sterren). Geen gevaar — feest.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { confettiBurst } from '../../reward.js';
import { addStars } from '../../progress.js';

const GOUD = 0xffd24d, GOUD_DONKER = 0xb98d12;

// Een getekende gouden nul (ellips-ring met glans).
function tekenNul(s, r) {
  const g = s.add.graphics();
  g.lineStyle(r * 0.55, GOUD_DONKER, 1); g.strokeEllipse(0, 0, r * 1.5, r * 2);
  g.lineStyle(r * 0.38, GOUD, 1); g.strokeEllipse(0, 0, r * 1.5, r * 2);
  g.lineStyle(r * 0.13, 0xfff3b0, 0.9); g.strokeEllipse(-r * 0.12, -r * 0.16, r * 1.15, r * 1.55);
  return g;
}

function vuurwerk(s, x, y, groot) {
  const n = groot ? 16 : 10;
  for (let i = 0; i < n; i++) {
    const hoek = (i / n) * Math.PI * 2;
    const c = s.add.container(x, y).setDepth(62);
    c.add(tekenNul(s, groot ? 9 : 6));
    const afst = Phaser.Math.Between(70, groot ? 190 : 130);
    s.tweens.add({
      targets: c, x: x + Math.cos(hoek) * afst, y: y + Math.sin(hoek) * afst - 30,
      angle: Phaser.Math.Between(-180, 180), alpha: 0, duration: Phaser.Math.Between(600, 950),
      ease: 'Quad.out', onComplete: () => c.destroy(),
    });
  }
  s.cameraPunch(0.02, 4);
}

function banner(s, tekst) {
  const W = s.scale.width;
  const t = s.add.text(W / 2, 250, tekst, {
    fontFamily: 'Arial Black, Arial', fontSize: '40px', fontStyle: 'bold',
    color: '#ffd24d', stroke: '#7a3d05', strokeThickness: 9,
  }).setOrigin(0.5).setScrollFactor(0).setDepth(230).setScale(0.2);
  s.tweens.add({ targets: t, scale: 1.15, duration: 320, ease: 'Back.out' });
  s.tweens.add({ targets: t, y: 200, alpha: 0, delay: 1000, duration: 600, onComplete: () => t.destroy() });
}

// De grote finale: nul-regen over het hele scherm + bonus-sterren.
function nulRegen(s) {
  const F = s.nulFeest;
  F.klaar = true;
  SFX.fanfare(); Voice.cue('cheer');
  banner(s, 'ALLE NULLEN! ⭕🎉');
  confettiBurst(s, 150);
  const W = s.scale.width;
  for (let i = 0; i < 34; i++) {
    s.time.delayedCall(i * 90, () => {
      const c = s.add.container(Phaser.Math.Between(10, W - 10), -30).setDepth(228).setScrollFactor(0);
      c.add(tekenNul(s, Phaser.Math.Between(6, 13)));
      s.tweens.add({
        targets: c, y: s.scale.height + 40, angle: Phaser.Math.Between(-220, 220),
        duration: Phaser.Math.Between(1700, 2800), ease: 'Sine.in', onComplete: () => c.destroy(),
      });
    });
  }
  s.time.delayedCall(1200, () => {
    addStars(5);
    banner(s, '+5 STERREN! ⭐');
    s.questText.setText('Wat een NUL-FEEST — ren naar de nul-vlag! ⭕🚩');
  });
}

export default {
  build(s, L) {
    s.nulFeest = null;
    if (!L.nulFeest) return;
    const F = { nullen: [], ringen: [], gevangen: 0, totaal: (L.nulFeest.nullen || []).length, klaar: false };
    s.nulFeest = F;

    // zwevende gouden nullen om te vangen
    (L.nulFeest.nullen || []).forEach(([x, y], i) => {
      const c = s.add.container(x, y).setDepth(5);
      c.add(tekenNul(s, 11));
      c.taken = false;
      s.tweens.add({ targets: c, y: y - 9, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: (i % 5) * 140 });
      s.tweens.add({ targets: c, angle: 8, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: (i % 3) * 220 });
      F.nullen.push(c);
    });

    // reuzen-nul-ringen: spring erin en je wordt gelanceerd!
    (L.nulFeest.ringen || []).forEach(([x, y]) => {
      const c = s.add.container(x, y).setDepth(4);
      const gloed = s.add.ellipse(0, 0, 120, 156, GOUD, 0.14);
      c.add(gloed);
      c.add(tekenNul(s, 44));
      s.tweens.add({ targets: c, y: y - 12, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      s.tweens.add({ targets: gloed, alpha: 0.32, scale: 1.12, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      F.ringen.push({ c, x, y, cd: 0 });
    });

    // teller bovenin (alleen als er nullen te vangen zijn)
    if (F.totaal) {
      F.hud = s.add.text(s.scale.width / 2, 54, `⭕ 0 / ${F.totaal}`, {
        fontFamily: 'Arial Black, Arial', fontSize: '19px', fontStyle: 'bold',
        color: '#ffffff', backgroundColor: '#b98d12dd', padding: { x: 14, y: 6 },
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(60);
    }
  },

  update(s, time) {
    const F = s.nulFeest;
    if (!F) return;
    const p = s.player;

    // nullen vangen
    if (!F.klaar) {
      for (const c of F.nullen) {
        if (c.taken) continue;
        if (Math.abs(p.x - c.x) < 42 && Math.abs(p.y - c.y) < 56) {
          c.taken = true;
          F.gevangen += 1;
          s.tweens.killTweensOf(c);
          s.tweens.add({ targets: c, scale: 1.8, alpha: 0, y: c.y - 30, duration: 260, ease: 'Quad.out', onComplete: () => c.destroy() });
          SFX.grow((F.gevangen % 10) || 10); // oplopend toontje per tiental
          F.hud.setText(`⭕ ${F.gevangen} / ${F.totaal}`);
          s.tweens.add({ targets: F.hud, scale: 1.18, duration: 110, yoyo: true });
          if (F.gevangen % 10 === 0 && F.gevangen < F.totaal) {
            // tiental-feest: vuurwerk + banner + het getal hardop
            vuurwerk(s, p.x, p.y - 40, false);
            banner(s, `${F.gevangen} NULLEN! ✨`);
            SFX.yay(); Voice.number(F.gevangen);
          }
          if (F.gevangen >= F.totaal) {
            vuurwerk(s, p.x, p.y - 40, true);
            nulRegen(s);
          }
        }
      }
    }

    // ringen: erdoorheen springen = juichende lancering
    for (const R of F.ringen) {
      if (time < R.cd) continue;
      if (Math.abs(p.x - R.x) < 46 && Math.abs(p.y - R.y) < 70) {
        R.cd = time + 700;
        p.body.setVelocityY(-880);
        SFX.pick(); Voice.cue('whee');
        s.tweens.add({ targets: R.c, scale: 1.22, duration: 130, yoyo: true, ease: 'Quad.out' });
        s.tweens.add({ targets: R.c, angle: 360, duration: 500, onComplete: () => R.c.setAngle(0) });
        for (let i = 0; i < 6; i++) {
          const d = s.add.container(p.x + Phaser.Math.Between(-18, 18), p.y + Phaser.Math.Between(-10, 24)).setDepth(8);
          d.add(tekenNul(s, 5));
          s.tweens.add({ targets: d, y: d.y + 46, alpha: 0, duration: 480, onComplete: () => d.destroy() });
        }
      }
    }
  },
};
