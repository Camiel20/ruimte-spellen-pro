// ===== SYSTEEM: DE KOEKOEKSKLOK (de Klokken-Toren, Wereld 16) =====
// HET leer-werkwoord van de Klokken-Toren: KLOKKIJKEN. De grote koekoeks-
// klok wil op een uur gezet worden ("zet op 3 uur!"). Tik op de wijzerplaat
// en de grote wijzer springt één uur verder (de stem telt mee). Staat hij
// goed? Tik dan het deurtje: KOEKOEK! — het vogeltje schiet naar buiten,
// lanceert je omhoog én de poort gaat open. Fout uur = het vogeltje schudt
// "nee". Doorgedraaid? Gewoon het rondje afmaken — geen straf.
// Veld: `koekoeken: [{ x, uur }]` — uur 1-12; de poort staat op x + 150.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { confettiBurst } from '../../reward.js';

export const KOEKOEK_DEUR = 150; // afstand klok → poort (ook voor de validator)
const LANCEER = -900;

function zetWijzer(s, K, stap) {
  K.uurNu = (K.uurNu % 12) + stap;
  SFX.pick();
  Voice.number(K.uurNu);
  s.tweens.add({ targets: K.wijzer, angle: K.uurNu * 30, duration: 240, ease: 'Back.out' });
  s.tweens.add({ targets: K.plaat, scale: 1.06, duration: 90, yoyo: true });
  if (K.uurNu === K.uur) {
    s.questText.setText(`${K.uur} uur — precies goed! Tik het deurtje! 🐦`);
    s.tweens.add({ targets: K.deurtje, scale: 1.15, duration: 280, yoyo: true, repeat: 2 });
  }
}

function tikDeurtje(s, K) {
  if (K.klaar) return;
  if (K.uurNu === K.uur) {
    // KOEKOEK! Het vogeltje schiet naar buiten.
    K.klaar = true;
    SFX.fanfare(); Voice.cue('cheer'); confettiBurst(s, 90); s.cameraPunch();
    const vogel = s.add.container(K.x, K.deurY).setDepth(14);
    const vg = s.add.graphics();
    vg.fillStyle(0xf6c624, 1); vg.fillEllipse(0, 0, 20, 15); vg.fillCircle(9, -5, 7);
    vg.fillStyle(0xf07c1f, 1); vg.fillTriangle(15, -5, 22, -4, 15, -1);
    vg.fillStyle(0x16202b, 1); vg.fillCircle(10, -6, 1.6);
    vogel.add(vg);
    vogel.setScale(0.2);
    s.tweens.add({ targets: vogel, scale: 1, x: K.x + 26, duration: 220, ease: 'Back.out', yoyo: true, hold: 900, onComplete: () => vogel.destroy() });
    s.questText.setText('KOEKOEK! De poort is open! 🐦');
    // sta je dichtbij? Dan lanceert de koekoek je omhoog — wat een lift!
    const p = s.player;
    if (Math.abs(p.x - K.x) < 90) {
      p.body.setVelocityY(LANCEER);
      s.jumpsUsed = 0;
      SFX.split(); Voice.cue('whee');
      s.squashArt(0.8, 1.3, 160);
    }
    K.body.body.enable = false;
    s.doorGroup.remove(K.body, false, false);
    s.tweens.add({ targets: K.muurArt, y: 480, alpha: 0.2, duration: 700, ease: 'Quad.in' });
    s.vierMijlpaal(K.x);
  } else {
    // nog niet het goede uur — het vogeltje piept even en schudt "nee"
    s.rekenFouten += 1;
    K.fouten = (K.fouten || 0) + 1;
    SFX.oops(); Voice.cue('oops');
    s.tweens.add({ targets: K.deurtje, angle: { from: -10, to: 10 }, duration: 70, yoyo: true, repeat: 3, onComplete: () => K.deurtje.setAngle(0) });
    s.questText.setText(`De klok staat op ${K.uurNu} uur — wij willen ${K.uur} uur! 🕐`);
    if (K.fouten >= 2) {
      s.pulsHulp(K.plaat);
      Voice.hint('hint-koekoek', 900);
    }
  }
}

export default {
  build(s, L) {
    s.koekoeken = [];
    (L.koekoeken || []).forEach((K0) => {
      const groundTop = L.platforms[0][1];
      const kastY = groundTop - 96;

      // de kast: houten koekoeksklok met puntdak en het deurtje bovenin
      const kast = s.add.graphics().setDepth(4);
      kast.fillStyle(0x000000, 0.16); kast.fillEllipse(K0.x, groundTop + 2, 130, 14);
      kast.fillStyle(0x8a6a45, 1); kast.fillRoundedRect(K0.x - 52, kastY - 66, 104, 162, 10);
      kast.fillStyle(0x6e5436, 1);
      kast.fillTriangle(K0.x - 66, kastY - 62, K0.x + 66, kastY - 62, K0.x, kastY - 118);
      kast.lineStyle(3.5, 0x4a3a26, 1); kast.strokeRoundedRect(K0.x - 52, kastY - 66, 104, 162, 10);
      // dennenappel-gewichtjes aan kettinkjes
      kast.lineStyle(2, 0x4a3a26, 1);
      kast.beginPath(); kast.moveTo(K0.x - 26, groundTop - 4); kast.lineTo(K0.x - 26, groundTop - 22); kast.strokePath();
      kast.beginPath(); kast.moveTo(K0.x + 26, groundTop - 4); kast.lineTo(K0.x + 26, groundTop - 14); kast.strokePath();
      kast.fillStyle(0x6e5436, 1); kast.fillEllipse(K0.x - 26, groundTop + 2, 10, 14); kast.fillEllipse(K0.x + 26, groundTop + 8, 10, 14);

      // het doel-bord: "zet op {uur} uur!"
      const bord = s.add.container(K0.x, kastY - 158).setDepth(7);
      const bg = s.add.graphics();
      bg.fillStyle(0x16202b, 0.6); bg.fillRoundedRect(-84, -24, 168, 48, 13);
      bord.add(bg);
      bord.add(s.add.text(0, 0, `🕐 zet op ${K0.uur} uur!`, {
        fontFamily: 'Arial Black, Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5));
      s.tweens.add({ targets: bord, y: bord.y - 5, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

      // de WIJZERPLAAT (tikbaar, depth 13 = boven de speler)
      const plaat = s.add.container(K0.x, kastY + 6).setDepth(13);
      const pg = s.add.graphics();
      pg.fillStyle(0xf3e8d0, 1); pg.fillCircle(0, 0, 40);
      pg.lineStyle(4, 0xb98d3a, 1); pg.strokeCircle(0, 0, 40);
      for (let a = 0; a < 12; a++) {
        const ang = (a / 12) * Math.PI * 2 - Math.PI / 2;
        pg.fillStyle(0x6e5436, 1);
        pg.fillCircle(Math.cos(ang) * 32, Math.sin(ang) * 32, a % 3 === 0 ? 3.4 : 2);
      }
      plaat.add(pg);
      plaat.add(s.add.text(0, -24, '12', { fontFamily: 'Arial', fontSize: '11px', fontStyle: 'bold', color: '#6e5436' }).setOrigin(0.5));
      // de grote wijzer (roteert per uur-tik; wijst omhoog = 12)
      const wijzer = s.add.container(0, 0);
      const wg = s.add.graphics();
      wg.fillStyle(0x2b2f34, 1); wg.fillTriangle(-4, 4, 4, 4, 0, -30);
      wg.fillCircle(0, 0, 4.5);
      wijzer.add(wg);
      plaat.add(wijzer);
      plaat.setInteractive(new Phaser.Geom.Rectangle(-44, -44, 88, 88), Phaser.Geom.Rectangle.Contains);
      plaat.input.cursor = 'pointer';

      // het koekoek-DEURTJE in het puntdak (tikbaar)
      const deurY = kastY - 86;
      const deurtje = s.add.container(K0.x, deurY).setDepth(13);
      const dg = s.add.graphics();
      dg.fillStyle(0xd9ad55, 1); dg.fillRoundedRect(-14, -16, 28, 32, 5);
      dg.lineStyle(2.5, 0x4a3a26, 1); dg.strokeRoundedRect(-14, -16, 28, 32, 5);
      dg.fillStyle(0x4a3a26, 1); dg.fillCircle(8, 0, 2);
      deurtje.add(dg);
      deurtje.setInteractive(new Phaser.Geom.Rectangle(-20, -22, 40, 44), Phaser.Geom.Rectangle.Contains);
      deurtje.input.cursor = 'pointer';

      // de poort (schermhoge blokkade)
      const muurX = K0.x + KOEKOEK_DEUR;
      const body = s.add.rectangle(muurX, (40 + groundTop) / 2, 46, groundTop - 40, 0x000000, 0);
      s.physics.add.existing(body, true);
      s.doorGroup.add(body);
      const muurArt = s.add.container(muurX, 0).setDepth(4);
      const mg = s.add.graphics();
      mg.fillStyle(0xb98d3a, 1); mg.fillRoundedRect(-23, 150, 46, groundTop - 148, 10);
      mg.fillStyle(0xd9ad55, 1); mg.fillRoundedRect(-23, 150, 46, 14, 6);
      mg.lineStyle(3, 0x8a6a2e, 1); mg.strokeRoundedRect(-23, 150, 46, groundTop - 148, 10);
      mg.fillStyle(0x8a6a2e, 1);
      for (let ky = 190; ky < groundTop - 30; ky += 80) mg.fillCircle(0, ky, 5); // klinknagels
      muurArt.add(mg);

      // de wijzer begint op een willekeurig uur dat NIET het doel is
      let startUur = Phaser.Math.Between(1, 12);
      if (startUur === K0.uur) startUur = (startUur % 12) + 1;
      const K = { ...K0, plaat, wijzer, deurtje, deurY, body, muurArt, uurNu: startUur, klaar: false, fouten: 0, cuePlayed: false };
      wijzer.setAngle(startUur * 30);
      plaat.on('pointerdown', () => { if (!K.klaar) zetWijzer(s, K, 1); });
      deurtje.on('pointerdown', () => tikDeurtje(s, K));
      s.koekoeken.push(K);
    });
  },

  update(s) {
    if (!s.koekoeken || !s.koekoeken.length) return;
    const p = s.player;
    for (const K of s.koekoeken) {
      if (K.klaar) continue;
      if (!K.cuePlayed && Math.abs(p.x - K.x) < 240) {
        K.cuePlayed = true;
        Voice.hint('hint-koekoek');
        s.questText.setText(`Tik de klok naar ${K.uur} uur — en dan het deurtje! 🕐`);
      }
    }
  },
};
