// ===== SYSTEEM: PORTALEN (kies de goede som) =====
// Portalen met elk een som erboven; alleen de som die het doelgetal maakt
// teleporteert je vóórbij het sterrenhek — de rest stuurt je terug naar het
// begin. Werkwoord: portaal-rekenen (sommen vergelijken met het doel).
// NIET-LEZER-PROOF: onder elke som staan tien-staafjes/stippen, zodat je de
// hoeveelheden kunt zíen zonder de cijfers te lezen.

import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { confettiBurst } from '../../reward.js';
import { portaalMuurX, PORTAL_AFSTAND } from '../logic.js';

// Flits-teleport naar x-positie tx (voeten op de grond).
function teleport(s, tx) {
  const p = s.player, groundTop = s.level.platforms[0][1];
  s.sparkleAt(p.x, p.y, 10);
  p.setPosition(tx, groundTop - p.totalH / 2 - 2);
  p.body.reset(p.x, p.y);
  s.sparkleAt(tx, p.y, 10);
  s.cameras.main.flash(180, 120, 140, 255);
}

// Hoeveelheids-plaatje onder een som-bordje: tientallen als staafjes van 10,
// kleine getallen als stippen. 30+30 = ●●● | ●●● in staafjes-vorm.
function drawSomViz(s, o) {
  const viz = s.add.graphics();
  const groups = [];
  const width = (val) => (val % 10 === 0 && val >= 10 ? (val / 10) * 9 : Math.min(val, 5) * 7 + 2);
  const total = width(o[0]) + 12 + width(o[1]);
  let x0 = -total / 2;
  o.forEach((val, gi) => {
    if (gi === 1) {
      viz.lineStyle(2.5, 0x16202b, 1);
      viz.beginPath(); viz.moveTo(x0 + 2, 29); viz.lineTo(x0 + 8, 29); viz.strokePath();
      viz.beginPath(); viz.moveTo(x0 + 5, 26); viz.lineTo(x0 + 5, 32); viz.strokePath();
      x0 += 12;
    }
    if (val % 10 === 0 && val >= 10) {
      viz.fillStyle(0xf6c624, 1);
      for (let k = 0; k < val / 10; k++) viz.fillRoundedRect(x0 + k * 9, 21, 6, 16, 2);
    } else {
      viz.fillStyle(0x38b6cf, 1);
      for (let k = 0; k < Math.min(val, 10); k++) viz.fillCircle(x0 + 4 + (k % 5) * 7, 25 + Math.floor(k / 5) * 8, 2.8);
    }
    x0 += width(val);
    groups.push(val);
  });
  return viz;
}

export default {
  build(s, L) {
    s.portalen = [];
    const groundTop = L.platforms[0][1];
    const kleuren = [0x38b6cf, 0x9b6dd6, 0xf28ba8];
    (L.portalen || []).forEach((P) => {
      const muurX = portaalMuurX(P);
      // sterrenhek: schermhoge blokkade + fonkelende zuil van sterretjes
      const body = s.add.rectangle(muurX, (40 + groundTop) / 2, 44, groundTop - 40, 0x000000, 0);
      s.physics.add.existing(body, true);
      s.doorGroup.add(body);
      const hek = s.add.graphics().setDepth(3);
      hek.fillStyle(0x9fb6ff, 0.16); hek.fillRoundedRect(muurX - 22, 46, 44, groundTop - 66, 20);
      hek.fillStyle(0xffffff, 0.7);
      for (let yy = 76; yy < groundTop - 40; yy += 46) {
        const sx = muurX - 8 + (Math.floor(yy / 46) % 2) * 16;
        hek.fillTriangle(sx - 5, yy, sx + 5, yy, sx, yy - 7);
        hek.fillTriangle(sx - 5, yy - 3, sx + 5, yy - 3, sx, yy + 5);
      }
      s.tweens.add({ targets: hek, alpha: 0.5, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      // bord met het doel boven de portalen
      const mid = P.x + ((P.opties.length - 1) * PORTAL_AFSTAND) / 2;
      const bord = s.add.container(mid, 150).setDepth(5);
      const bg = s.add.graphics();
      bg.fillStyle(0xf3e2c0, 1); bg.lineStyle(3, 0x9c6b3f, 1);
      bg.fillRoundedRect(-84, -22, 168, 44, 12); bg.strokeRoundedRect(-84, -22, 168, 44, 12);
      bord.add([bg, s.add.text(0, 0, `Welke som is ${P.doel}?`, { fontFamily: 'Arial Black, Arial', fontSize: '16px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5)]);
      s.tweens.add({ targets: bord, y: 144, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      // de portalen zelf: ovale ringen met een som-bordje erboven.
      // GESCHUD: zo staat het goede antwoord niet altijd op dezelfde plek
      // (en is het elke speelbeurt anders).
      const geschud = [...P.opties];
      for (let k = geschud.length - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1));
        [geschud[k], geschud[j]] = [geschud[j], geschud[k]];
      }
      const ringen = geschud.map((o, i) => {
        const px = P.x + i * PORTAL_AFSTAND;
        const ring = s.add.container(px, groundTop - 64).setDepth(4);
        const rg = s.add.graphics();
        rg.fillStyle(kleuren[i % 3], 0.22); rg.fillEllipse(0, 0, 52, 116);
        rg.lineStyle(6, kleuren[i % 3], 1); rg.strokeEllipse(0, 0, 52, 116);
        rg.lineStyle(3, 0xffffff, 0.55); rg.strokeEllipse(0, 0, 34, 92);
        ring.add(rg);
        const label = s.add.container(0, -100);
        const lb = s.add.graphics();
        lb.fillStyle(0xffffff, 0.95); lb.lineStyle(3, 0x16202b, 1);
        lb.fillRoundedRect(-42, -17, 84, 60, 9); lb.strokeRoundedRect(-42, -17, 84, 60, 9);
        label.add([lb, s.add.text(0, 0, `${o[0]}+${o[1]}`, { fontFamily: 'Arial Black, Arial', fontSize: '17px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5)]);
        label.add(drawSomViz(s, o)); // hoeveelheden ónder de som
        ring.add(label);
        s.tweens.add({ targets: ring, scaleY: 1.04, duration: 900 + i * 130, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        return { x: px, som: o[0] + o[1], art: ring };
      });
      s.portalen.push({ ...P, muurX, body, hek, ringen, opgelost: false, cooldownTot: 0, cuePlayed: false });
    });
  },

  update(s, time) {
    const p = s.player;
    for (const po of s.portalen) {
      if (po.opgelost || time < po.cooldownTot) continue;
      if (!po.cuePlayed && Math.abs(p.x - po.x) < 300) {
        po.cuePlayed = true; Voice.cue('greet');
        Voice.hint('hint-portaal', 700);
        s.questText.setText(`Stap in het portaal waar de som ${po.doel} is! ✨`);
      }
      for (const pt of po.ringen) {
        if (Math.abs(p.x - pt.x) < 24 && (p.body.blocked.down || p.body.touching.down)) {
          po.cooldownTot = time + 900;
          if (pt.som === po.doel) {
            po.opgelost = true;
            po.body.body.enable = false;
            teleport(s, po.muurX + 110);
            SFX.correct(); Voice.cue('great'); confettiBurst(s, 90); s.cameraPunch();
            s.tweens.add({ targets: po.hek, alpha: 0, duration: 600, onComplete: () => po.hek.destroy() });
            po.ringen.forEach((r) => s.tweens.add({ targets: r.art, alpha: 0.35, duration: 500 }));
            s.questText.setText(`Ja! Dat is samen ${po.doel} — het sterrenhek is open! 🚩`);
            s.vierMijlpaal(po.muurX);
          } else {
            s.rekenFouten += 1; // telt mee voor de foutloos-ster
            teleport(s, po.x - 170);
            SFX.wrong(); Voice.cue('oops');
            s.questText.setText(`Dat is samen ${pt.som}, niet ${po.doel} — probeer een ander portaal!`);
            // anti-gok: na 2 fouten pulseert het juiste portaal zachtjes
            po.fouten = (po.fouten || 0) + 1;
            if (po.fouten >= 2) {
              const goed = po.ringen.find((r) => r.som === po.doel);
              if (goed) s.pulsHulp(goed.art);
              Voice.hint('hint-portaal', 900);
            }
          }
          break;
        }
      }
    }
  },
};
