// ===== SYSTEEM: PAREN-BORDEN (Billenland, Wereld 11) =====
// Het leerdoel van Billenland: EVEN & ONEVEN — billen komen in paren! Een
// muur verspert de weg; op het bord staat een getal én zijn stipjes netjes
// in PAREN gezet. Heeft iedereen een maatje (even), of blijft er eentje
// alleen over (oneven)? Spring met een kopstoot tegen het goede blok:
//  💑 twee bolletjes samen + hartje  = iedereen heeft een maatje (EVEN)
//  🙁 één bolletje alleen            = eentje blijft over (ONEVEN)
// NIET-LEZER-PROOF: de stipjes-paren tonen het antwoord — tel/kijk maar!
// Veld: `parenBorden: [{ x, getal }]` (opties geschud bij build).

import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { confettiBurst } from '../../reward.js';
import { sig, darker } from '../palette.js';

// icoontje "paartje" (samen = even) of "alleen" (oneven) in een blok-container
function tekenKeuzeIcoon(s, samen) {
  const g = s.add.graphics();
  if (samen) {
    // twee vriendjes hand-in-hand + hartje
    g.fillStyle(0x57b947, 1); g.fillCircle(-10, 2, 9);
    g.fillStyle(0x3f9d3f, 1); g.fillCircle(10, 2, 9);
    g.fillStyle(0xffffff, 1); g.fillCircle(-12, 0, 2.6); g.fillCircle(8, 0, 2.6);
    g.fillStyle(0x16202b, 1); g.fillCircle(-12, 0, 1.2); g.fillCircle(8, 0, 1.2);
    g.lineStyle(2.5, 0x2f7d33, 1); g.beginPath(); g.moveTo(-4, 6); g.lineTo(4, 6); g.strokePath(); // handjes
    g.fillStyle(0xff6b9d, 1); g.fillCircle(-2.6, -12, 3.4); g.fillCircle(2.6, -12, 3.4);
    g.fillTriangle(-5.6, -10.5, 5.6, -10.5, 0, -4);
  } else {
    // één bolletje, alleen (met een traantje)
    g.fillStyle(0x8a8f96, 1); g.fillCircle(0, 2, 9);
    g.fillStyle(0xffffff, 1); g.fillCircle(-3, 0, 2.6);
    g.fillStyle(0x16202b, 1); g.fillCircle(-3, 0, 1.2);
    g.lineStyle(2, 0x565b61, 1); g.beginPath(); g.arc(0, 8, 4, 1.15 * Math.PI, 1.85 * Math.PI); g.strokePath();
    g.fillStyle(0x7fd0f0, 0.9); g.fillEllipse(5, 6, 3.4, 5);
  }
  return g;
}

function hit(s, pb, blok) {
  const bc = blok._art;
  if (blok._idx === pb.goedIdx) {
    pb.opgelost = true;
    SFX.correct(); Voice.cue('great');
    s.tweens.add({ targets: bc, y: bc.y - 18, duration: 120, yoyo: true, ease: 'Quad.out' });
    // het eenzame stipje krijgt alsnog een maatje-knuffel (bij even: feestje)
    pb.body.body.enable = false;
    s.tweens.add({ targets: pb.art, y: 480, alpha: 0.2, duration: 700, ease: 'Quad.in' });
    confettiBurst(s, 90); s.cameraPunch(); SFX.yay();
    s.burstStars(pb.x, 400, 10);
    s.questText.setText(pb.even ? `${pb.getal} is EVEN — allemaal paren! 💑` : `${pb.getal} is ONEVEN — eentje alleen! 🚩`);
    s.vierMijlpaal(pb.x);
  } else {
    s.rekenFouten += 1;
    SFX.wrong(); Voice.cue('oops');
    s.tweens.add({ targets: bc, x: bc.x + 6, duration: 60, yoyo: true, repeat: 3 });
    s.questText.setText('Oeps — kijk naar de stipjes: heeft iedereen een maatje?');
    // anti-gok: na 2 fouten pulseert het juiste blok zachtjes
    pb.fouten = (pb.fouten || 0) + 1;
    if (pb.fouten >= 2) {
      s.pulsHulp(pb.blokken[pb.goedIdx]._art);
      Voice.hint('hint-paren', 900);
    }
  }
}

export default {
  build(s, L) {
    s.parenBorden = [];
    s.parenGroup = s.physics.add.staticGroup();
    (L.parenBorden || []).forEach((P) => {
      const groundTop = L.platforms[0][1];
      const even = P.getal % 2 === 0;
      // GESCHUD: het paartjes-blok staat niet altijd op dezelfde plek
      const volgorde = Math.random() < 0.5 ? [true, false] : [false, true]; // true = "samen"-blok
      const goedIdx = volgorde[0] === even ? 0 : 1;

      // schermhoge blokkade + zichtbare muur (zelfde skelet als de vraagmuur)
      const body = s.add.rectangle(P.x, (40 + groundTop) / 2, 46, groundTop - 40, 0x000000, 0);
      s.physics.add.existing(body, true);
      s.doorGroup.add(body);
      const art = s.add.container(P.x, 0).setDepth(4);
      const g = s.add.graphics();
      g.fillStyle(0xd08aa0, 1); g.fillRoundedRect(-23, 150, 46, groundTop - 148, 10);
      g.fillStyle(0xf2a7b8, 1); g.fillRoundedRect(-23, 150, 46, 14, 6);
      g.lineStyle(3, 0xa05a75, 1); g.strokeRoundedRect(-23, 150, 46, groundTop - 148, 10);

      // het bord: groot getal + de stipjes netjes in paren
      const bord = s.add.container(0, 92);
      const bg = s.add.graphics();
      bg.fillStyle(0xfdf2f6, 1); bg.lineStyle(3, 0xa05a75, 1);
      bg.fillRoundedRect(-70, -34, 140, 96, 12); bg.strokeRoundedRect(-70, -34, 140, 96, 12);
      const num = s.add.text(0, -14, `${P.getal}`, {
        fontFamily: 'Arial Black, Arial', fontSize: '30px', fontStyle: 'bold', color: '#16202b',
      }).setOrigin(0.5);
      // stipjes-paren: per paar twee bolletjes tegen elkaar; oneven = het
      // laatste bolletje staat alléén (grijs) — je ZIET het antwoord
      const dots = s.add.graphics();
      const paren = Math.floor(P.getal / 2);
      const startX = -((paren + (even ? 0 : 1)) - 1) * 14 - (even ? 0 : 0);
      for (let k = 0; k < paren; k++) {
        const px = startX + k * 28;
        dots.fillStyle(sig(P.getal), 1);
        dots.fillCircle(px - 5.5, 22, 6); dots.fillCircle(px + 5.5, 22, 6);
        dots.lineStyle(1.6, darker(sig(P.getal), 40), 1);
        dots.strokeCircle(px - 5.5, 22, 6); dots.strokeCircle(px + 5.5, 22, 6);
      }
      if (!even) {
        const px = startX + paren * 28;
        dots.fillStyle(0x9aa0a6, 1); dots.fillCircle(px, 22, 6);
        dots.lineStyle(1.6, 0x565b61, 1); dots.strokeCircle(px, 22, 6);
      }
      bord.add([bg, num, dots]);
      art.add([g, bord]);

      // twee keuze-blokken vóór de muur (in geschudde volgorde)
      const blokken = volgorde.map((samen, i) => {
        const bx = P.x - 190 + i * 105, by = 410;
        const blok = s.add.rectangle(bx, by, 56, 52, 0x000000, 0);
        s.physics.add.existing(blok, true);
        s.parenGroup.add(blok);
        const bc = s.add.container(bx, by).setDepth(5);
        const bgra = s.add.graphics();
        bgra.fillStyle(0xf6c624, 1); bgra.fillRoundedRect(-28, -26, 56, 52, 10);
        bgra.fillStyle(0xffe16b, 1); bgra.fillRoundedRect(-24, -22, 48, 20, 8);
        bgra.lineStyle(3.5, 0xb98d12, 1); bgra.strokeRoundedRect(-28, -26, 56, 52, 10);
        bc.add([bgra, tekenKeuzeIcoon(s, samen)]);
        blok._art = bc; blok._idx = i;
        return blok;
      });

      const pb = { ...P, even, body, art, blokken, goedIdx, opgelost: false, lastHit: 0, cuePlayed: false };
      blokken.forEach((b) => { b._pb = pb; });
      s.parenBorden.push(pb);
    });
  },

  afterPlayer(s) {
    if (!s.parenGroup) return;
    s.physics.add.overlap(s.player, s.parenGroup, (pl, blok) => {
      const pb = blok._pb;
      if (!pb || pb.opgelost || s.time.now < pb.lastHit + 500) return;
      if (pl.body.velocity.y < -40 && pl.body.bottom > blok.body.bottom) {
        pb.lastHit = s.time.now;
        pl.body.setVelocityY(90);
        hit(s, pb, blok);
      }
    });
  },

  update(s) {
    if (!s.parenBorden || !s.parenBorden.length) return;
    const p = s.player;
    for (const pb of s.parenBorden) {
      if (pb.opgelost) continue;
      if (Math.abs(p.x - (pb.x - 140)) < 170) {
        if (!pb.cuePlayed) { pb.cuePlayed = true; Voice.number(pb.getal); Voice.hint('hint-paren', 1100); }
        s.questText.setText('Heeft iedereen een maatje? Spring tegen het goede blok! ⬆');
      }
    }
  },
};
