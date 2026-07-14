// ===== SYSTEEM: HET MATEN-REK (de Kleren-Kast, Wereld 13) =====
// Het leer-werkwoord van de Kleren-Kast: ORDENEN van klein naar groot.
// Voor een kledingrek liggen truien in alle maten door elkaar. Tik steeds
// de KLEINSTE die er nog ligt — hij vliegt naar het volgende haakje. Alles
// netjes op volgorde = de kast-deur zakt open. Mis-tik = vriendelijke schud;
// na 2 missers pulseert de kleinste (anti-gok). Opties GESCHUD bij build.
// Veld: `maatRekken: [{ x, aantal }]` — aantal = 3-5 truien. De deur staat
// op x + 170 (zelfde skelet als de vraagmuur).

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { confettiBurst } from '../../reward.js';

export const REK_DEUR = 170; // afstand rek → deur (ook voor de validator)

const MAATJES = [0.55, 0.75, 0.95, 1.15, 1.35];
const TRUI_KLEUR = [0xe8829e, 0x7fb8e8, 0x9ad08a, 0xf0c060, 0xb99ae0];

// Teken een truitje rond (0,0), sc = maat-schaal. Hoe groter, hoe breder/hoger.
function tekenTrui(s, sc, kleur) {
  const g = s.add.graphics();
  const w = 44 * sc, h = 34 * sc;
  g.fillStyle(0x000000, 0.12); g.fillEllipse(0, h / 2 + 4, w + 8, 8);
  g.fillStyle(kleur, 1);
  g.fillRoundedRect(-w / 2, -h / 2, w, h, 8 * sc);
  // mouwtjes
  g.fillRoundedRect(-w / 2 - 10 * sc, -h / 2 + 2, 12 * sc, h * 0.55, 5 * sc);
  g.fillRoundedRect(w / 2 - 2 * sc, -h / 2 + 2, 12 * sc, h * 0.55, 5 * sc);
  // boord + glans
  g.fillStyle(0xffffff, 0.85); g.fillRoundedRect(-9 * sc, -h / 2 - 3 * sc, 18 * sc, 6 * sc, 3 * sc);
  g.fillStyle(0xffffff, 0.18); g.fillRoundedRect(-w / 2, -h / 2, w, h * 0.3, 8 * sc);
  g.lineStyle(2.2, 0x16202b, 0.3); g.strokeRoundedRect(-w / 2, -h / 2, w, h, 8 * sc);
  return g;
}

function tik(s, R, trui) {
  if (R.klaar || trui.opgehangen) return;
  const rest = R.truien.filter((t) => !t.opgehangen);
  const kleinste = rest.reduce((a, b) => (a.maat < b.maat ? a : b));
  if (trui === kleinste) {
    // GOED — naar het volgende haakje!
    trui.opgehangen = true;
    trui.disableInteractive();
    R.fouten = 0;
    const haakIdx = R.truien.filter((t) => t.opgehangen).length - 1;
    const hx = R.x - 64 + haakIdx * (128 / Math.max(1, R.aantal - 1));
    SFX.place(); Voice.cue('great');
    s.tweens.killTweensOf(trui);
    s.tweens.add({
      targets: trui, x: hx, y: R.railY + 26 * trui.maat, angle: 0, duration: 420, ease: 'Sine.inOut',
      onComplete: () => {
        s.sparkleAt(hx, R.railY, 4);
        s.tweens.add({ targets: trui, angle: 5, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      },
    });
    if (rest.length === 1) {
      // dat was de laatste (en dus de grootste): de deur mag open!
      R.klaar = true;
      s.time.delayedCall(560, () => openDeur(s, R));
    } else {
      s.questText.setText('Mooi! En welke is nú het kleinst? 👕');
    }
  } else {
    // niet de kleinste — vriendelijke schud
    s.rekenFouten += 1;
    SFX.oops(); Voice.cue('oops');
    s.tweens.add({ targets: trui, x: trui.x + 6, duration: 60, yoyo: true, repeat: 3 });
    s.questText.setText('Kijk goed — welke trui is het KLEINST? 🔍');
    R.fouten = (R.fouten || 0) + 1;
    if (R.fouten >= 2) {
      s.pulsHulp(kleinste);
      Voice.hint('hint-maatrek', 900);
    }
  }
}

function openDeur(s, R) {
  R.body.body.enable = false;
  s.doorGroup.remove(R.body, false, false);
  SFX.fanfare(); Voice.cue('cheer'); confettiBurst(s, 100); s.cameraPunch();
  s.tweens.add({ targets: R.deurArt, y: 480, alpha: 0.2, duration: 700, ease: 'Quad.in' });
  s.questText.setText('Van klein naar groot — de kast is open! 🚪');
  s.vierMijlpaal(R.x);
}

export default {
  build(s, L) {
    s.maatRekken = [];
    (L.maatRekken || []).forEach((R0) => {
      const groundTop = L.platforms[0][1];
      const aantal = Math.max(3, Math.min(5, R0.aantal || 3));
      const railY = groundTop - 190;

      // het rek: twee staanders + een rail met haakjes
      const rek = s.add.graphics().setDepth(3);
      rek.fillStyle(0x8a6a45, 1);
      rek.fillRoundedRect(R0.x - 86, railY - 10, 10, groundTop - railY + 10, 4);
      rek.fillRoundedRect(R0.x + 76, railY - 10, 10, groundTop - railY + 10, 4);
      rek.fillStyle(0xa9855c, 1); rek.fillRoundedRect(R0.x - 92, railY - 14, 184, 10, 5);
      rek.lineStyle(2.5, 0x9aa0a6, 1);
      for (let i = 0; i < aantal; i++) {
        const hx = R0.x - 64 + i * (128 / Math.max(1, aantal - 1));
        rek.strokeCircle(hx, railY + 2, 4);
      }
      // bordje "klein → groot" (niet-lezer-proof: een kleine en grote stip met een pijl)
      rek.fillStyle(0xfdf6e8, 1); rek.fillRoundedRect(R0.x - 44, railY - 52, 88, 30, 8);
      rek.lineStyle(2.5, 0xb98d12, 1); rek.strokeRoundedRect(R0.x - 44, railY - 52, 88, 30, 8);
      rek.fillStyle(0x16202b, 1);
      rek.fillCircle(R0.x - 26, railY - 37, 4);
      rek.fillCircle(R0.x + 26, railY - 37, 9);
      rek.lineStyle(2.5, 0x16202b, 1);
      rek.beginPath(); rek.moveTo(R0.x - 14, railY - 37); rek.lineTo(R0.x + 10, railY - 37); rek.strokePath();
      rek.fillTriangle(R0.x + 8, railY - 42, R0.x + 8, railY - 32, R0.x + 16, railY - 37);

      // de kast-deur (schermhoge blokkade, zelfde skelet als de vraagmuur)
      const deurX = R0.x + REK_DEUR;
      const body = s.add.rectangle(deurX, (40 + groundTop) / 2, 46, groundTop - 40, 0x000000, 0);
      s.physics.add.existing(body, true);
      s.doorGroup.add(body);
      const deurArt = s.add.container(deurX, 0).setDepth(4);
      const dg = s.add.graphics();
      dg.fillStyle(0xa9855c, 1); dg.fillRoundedRect(-23, 150, 46, groundTop - 148, 10);
      dg.fillStyle(0xc9a06a, 1); dg.fillRoundedRect(-23, 150, 46, 14, 6);
      dg.lineStyle(3, 0x8a6a45, 1); dg.strokeRoundedRect(-23, 150, 46, groundTop - 148, 10);
      dg.fillStyle(0xf0c060, 1); dg.fillCircle(12, 320, 5); // deurknopje
      // paneel-groeven
      dg.lineStyle(2, 0x8a6a45, 0.7);
      dg.strokeRoundedRect(-14, 180, 28, 120, 6); dg.strokeRoundedRect(-14, 330, 28, 120, 6);
      deurArt.add(dg);

      // de truien: unieke maten, GESCHUD op de grond vóór het rek
      const maten = MAATJES.slice(0, aantal);
      for (let k = maten.length - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1));
        [maten[k], maten[j]] = [maten[j], maten[k]];
      }
      const R = { ...R0, aantal, railY, body, deurArt, truien: [], klaar: false, fouten: 0, cuePlayed: false };
      maten.forEach((maat, i) => {
        const tx = R0.x - 250 + i * 78; // ruim uit elkaar: hit-gebieden mogen niet overlappen
        const ty = groundTop - 20 * maat;
        // depth 13 = BOVEN de speler (12): een tik op de trui waar je vóór
        // staat moet de TRUI raken, niet jezelf splitsen (topOnly!)
        const trui = s.add.container(tx, ty).setDepth(13);
        trui.add(tekenTrui(s, maat, TRUI_KLEUR[MAATJES.indexOf(maat)]));
        trui.maat = maat;
        trui.opgehangen = false;
        // gecentreerde hit-area, gecapt op de tussenafstand (anders tik je de buurman)
        const hw = Math.min(64 * maat + 20, 74), hh = 44 * maat + 20;
        trui.setInteractive(new Phaser.Geom.Rectangle(-hw / 2, -hh / 2, hw, hh), Phaser.Geom.Rectangle.Contains);
        trui.input.cursor = 'pointer';
        trui.on('pointerdown', () => tik(s, R, trui));
        s.tweens.add({ targets: trui, y: ty - 4, duration: 900 + i * 120, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        R.truien.push(trui);
      });
      s.maatRekken.push(R);
    });
  },

  update(s) {
    if (!s.maatRekken || !s.maatRekken.length) return;
    const p = s.player;
    for (const R of s.maatRekken) {
      if (R.klaar) continue;
      if (!R.cuePlayed && Math.abs(p.x - (R.x - 120)) < 220) {
        R.cuePlayed = true;
        Voice.hint('hint-maatrek');
        s.questText.setText('Hang de truien op: tik steeds de KLEINSTE! 👕');
      }
    }
  },
};
