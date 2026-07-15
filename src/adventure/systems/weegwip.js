// ===== SYSTEEM: DE WEEGSCHAAL-WIP (het Circus-Kanon, Wereld 17) =====
// HET leer-werkwoord van het circus: WEGEN & BALANS. Links op de grote wip
// staat al een gewicht (bv. 7); tik gewicht-schijven van 1/2/5 van het rek
// en ze vliegen op jouw kant — de wip KANTELT live mee, dus je ziet
// zwaarder/lichter gebeuren. Precies gelijk = de wip klikt horizontaal vast
// en de poort gaat open. Te zwaar = alles glijdt er giechelend af, opnieuw.
// Veld: `weegWippen: [{ x, doel }]` — doel 3-15; de poort staat op x + 190.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { confettiBurst } from '../../reward.js';

export const WIP_DEUR = 190; // afstand wip → poort (ook voor de validator)
const SCHIJVEN = [1, 2, 5];
const SCHIJF_KLEUR = { 1: 0xf6c624, 2: 0x3f8fe8, 5: 0xd94f3f };

function tekenSchijf(s, w, r) {
  const g = s.add.graphics();
  g.fillStyle(0x000000, 0.14); g.fillEllipse(0, r + 4, r * 2, 8);
  g.fillStyle(SCHIJF_KLEUR[w] || 0xf6c624, 1); g.fillCircle(0, 0, r);
  g.lineStyle(3, 0x16202b, 0.4); g.strokeCircle(0, 0, r);
  g.fillStyle(0xffffff, 0.35); g.fillEllipse(-r * 0.3, -r * 0.35, r * 0.5, r * 0.3);
  return g;
}

function kantel(s, W, meteen = false) {
  const hoek = Phaser.Math.Clamp((W.doel - W.saldo) * 2.6, -18, 18);
  if (meteen) W.balk.setAngle(hoek);
  else s.tweens.add({ targets: W.balk, angle: hoek, duration: 340, ease: 'Sine.out' });
  W.saldoTxt.setText(`${W.saldo}`);
}

function leg(s, W, waarde, munt) {
  if (W.klaar || W.blokkade) return;
  W.saldo += waarde;
  SFX.coin();
  s.tweens.add({ targets: munt, scale: 0.86, duration: 90, yoyo: true });
  const kleur = SCHIJF_KLEUR[waarde] || 0xf6c624;
  const doelPunt = W.balk.getWorldTransformMatrix().transformPoint(120, -16);
  const vlieg = s.add.circle(munt.x, munt.y, 9 + waarde * 1.6, kleur).setDepth(14);
  s.tweens.add({
    targets: vlieg, x: doelPunt.x, y: doelPunt.y, duration: 340, ease: 'Sine.inOut',
    onComplete: () => {
      vlieg.destroy();
      Voice.number(Math.min(W.saldo, 20));
      kantel(s, W);
      if (W.saldo === W.doel) {
        // IN BALANS! De wip klikt horizontaal vast — poort open.
        W.klaar = true;
        SFX.fanfare(); Voice.cue('cheer'); confettiBurst(s, 100); s.cameraPunch();
        s.questText.setText(`${W.doel} en ${W.doel} — precies in balans! ⚖️`);
        s.burstStars(W.x, W.balkY - 40, 10);
        W.body.body.enable = false;
        s.doorGroup.remove(W.body, false, false);
        s.tweens.add({ targets: W.muurArt, y: 480, alpha: 0.2, duration: 700, ease: 'Quad.in' });
        s.vierMijlpaal(W.x);
      } else if (W.saldo > W.doel) {
        // te zwaar — de wip klapt door en alles glijdt eraf
        W.blokkade = true;
        s.rekenFouten += 1;
        W.fouten = (W.fouten || 0) + 1;
        SFX.oops(); Voice.cue('oops'); SFX.giggle();
        s.questText.setText(`Oei — ${W.saldo} is te zwaar! Alles glijdt eraf… 😅`);
        s.tweens.add({ targets: W.balk, angle: -24, duration: 260, ease: 'Quad.out' });
        for (let i = 0; i < 5; i++) {
          const brok = s.add.circle(doelPunt.x, doelPunt.y, 7, 0x8a97a2).setDepth(14);
          s.tweens.add({ targets: brok, x: brok.x + 26 + Math.random() * 80, y: W.groundTop - 4, alpha: 0.2, duration: 460 + i * 60, ease: 'Quad.in', onComplete: () => brok.destroy() });
        }
        s.time.delayedCall(1300, () => {
          W.saldo = 0;
          kantel(s, W);
          W.blokkade = false;
          s.questText.setText(`Opnieuw — maak er PRECIES ${W.doel} van! ⚖️`);
          if (W.fouten >= 2) {
            const past = [...SCHIJVEN].reverse().find((v) => v <= W.doel);
            const munt2 = W.munten.find((m) => m.waarde === past);
            if (munt2) s.pulsHulp(munt2);
            Voice.hint('hint-weegwip', 900);
          }
        });
      } else {
        s.questText.setText(`${W.saldo} van de ${W.doel} — nog wat erbij! ⚖️`);
      }
    },
  });
}

export default {
  build(s, L) {
    s.weegWippen = [];
    (L.weegWippen || []).forEach((W0) => {
      const groundTop = L.platforms[0][1];
      const balkY = groundTop - 92;

      // de staander + de kantelende balk met twee schalen
      const voet = s.add.graphics().setDepth(4);
      voet.fillStyle(0x000000, 0.16); voet.fillEllipse(W0.x, groundTop + 2, 90, 12);
      voet.fillStyle(0x8a4a6a, 1); voet.fillTriangle(W0.x - 26, groundTop, W0.x + 26, groundTop, W0.x, balkY);
      voet.fillStyle(0xa85a80, 1); voet.fillTriangle(W0.x - 16, groundTop, W0.x, groundTop, W0.x, balkY + 16);

      const balk = s.add.container(W0.x, balkY).setDepth(5);
      const bg = s.add.graphics();
      bg.fillStyle(0xd94f3f, 1); bg.fillRoundedRect(-150, -7, 300, 14, 7);
      bg.fillStyle(0xf3e8d0, 1);
      for (let bx = -150; bx < 150; bx += 40) bg.fillRect(bx + 20, -7, 20, 14); // circus-strepen
      bg.fillStyle(0x8a4a6a, 1); bg.fillCircle(0, 0, 10);
      // linker schaal: het vaste doel-gewicht
      bg.fillStyle(0x4a4f55, 1); bg.fillRoundedRect(-146, -40, 52, 34, 8);
      balk.add(bg);
      balk.add(s.add.text(-120, -23, `${W0.doel}`, {
        fontFamily: 'Arial Black, Arial', fontSize: '19px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5));
      // rechter schaal: jouw kant
      const rg = s.add.graphics();
      rg.fillStyle(0x8a97a2, 1); rg.fillRoundedRect(94, -12, 52, 12, 6);
      balk.add(rg);
      const saldoTxt = s.add.text(120, -28, '0', {
        fontFamily: 'Arial Black, Arial', fontSize: '19px', fontStyle: 'bold', color: '#ffe16b',
      }).setOrigin(0.5).setStroke('#16202b', 4);
      balk.add(saldoTxt);

      // de poort
      const muurX = W0.x + WIP_DEUR;
      const body = s.add.rectangle(muurX, (40 + groundTop) / 2, 46, groundTop - 40, 0x000000, 0);
      s.physics.add.existing(body, true);
      s.doorGroup.add(body);
      const muurArt = s.add.container(muurX, 0).setDepth(4);
      const mg = s.add.graphics();
      mg.fillStyle(0xd94f3f, 1); mg.fillRoundedRect(-23, 150, 46, groundTop - 148, 10);
      mg.fillStyle(0xf3e8d0, 1);
      for (let ky = 170; ky < groundTop - 20; ky += 80) mg.fillRect(-23, ky, 46, 26); // circus-banen
      mg.lineStyle(3, 0xb93227, 1); mg.strokeRoundedRect(-23, 150, 46, groundTop - 148, 10);
      muurArt.add(mg);

      const W = {
        ...W0, balk, balkY, saldoTxt, body, muurArt, groundTop,
        saldo: 0, klaar: false, blokkade: false, fouten: 0, cuePlayed: false, munten: [],
      };
      kantel(s, W, true); // begint scheef: links is zwaar

      // het schijven-rek: 1/2/5, oneindig tikbaar (GESCHUDDE volgorde)
      const waarden = [...SCHIJVEN];
      for (let k = waarden.length - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1));
        [waarden[k], waarden[j]] = [waarden[j], waarden[k]];
      }
      waarden.forEach((w, i) => {
        const r = 13 + w * 2.4;
        // depth 13 = boven de speler: de tik moet de SCHIJF raken
        const munt = s.add.container(W0.x - 210 + i * 62, groundTop - r - 6).setDepth(13);
        munt.add(tekenSchijf(s, w, r));
        munt.add(s.add.text(0, 0, `${w}`, {
          fontFamily: 'Arial Black, Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
        }).setOrigin(0.5).setStroke('#16202b', 4));
        munt.waarde = w;
        munt.setInteractive(new Phaser.Geom.Rectangle(-r - 6, -r - 6, r * 2 + 12, r * 2 + 12), Phaser.Geom.Rectangle.Contains);
        munt.input.cursor = 'pointer';
        munt.on('pointerdown', () => leg(s, W, w, munt));
        s.tweens.add({ targets: munt, y: munt.y - 4, duration: 800 + i * 140, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        W.munten.push(munt);
      });

      s.weegWippen.push(W);
    });
  },

  update(s) {
    if (!s.weegWippen || !s.weegWippen.length) return;
    const p = s.player;
    for (const W of s.weegWippen) {
      if (W.klaar) continue;
      if (!W.cuePlayed && Math.abs(p.x - W.x) < 260) {
        W.cuePlayed = true;
        Voice.hint('hint-weegwip');
        s.questText.setText(`Links weegt ${W.doel} — maak jouw kant GELIJK! ⚖️`);
      }
    }
  },
};
