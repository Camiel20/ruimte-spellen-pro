// ===== SYSTEEM: HET REUZEN-TANDWIEL (de Klokken-Toren, Wereld 16) =====
// Motoriek-werkwoord: teken RONDJES op het grote tandwiel (het roer-gebaar
// van de Toverwinkel) — het wiel draait met je vinger mee, en na elke volle
// slag klikt de poort een stukje verder open. Drie slagen = doorgang! Het
// stippen-bord telt mee (niet-lezer-proof).
// Veld: `tandwielen: [{ x, y }]` — de poort staat op x + 150.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { confettiBurst } from '../../reward.js';

export const TANDWIEL_DEUR = 150; // afstand wiel → poort (ook voor de validator)
const SLAGEN = 3;

function tekenWiel(s, r) {
  const g = s.add.graphics();
  g.fillStyle(0xc9a05a, 1);
  for (let a = 0; a < 10; a++) {
    const ang = (a / 10) * Math.PI * 2;
    g.fillRoundedRect(Math.cos(ang) * r - 7, Math.sin(ang) * r - 11, 14, 22, 4);
  }
  g.fillCircle(0, 0, r);
  g.fillStyle(0xb98d3a, 1); g.fillCircle(0, 0, r - 10);
  // spaken + as (zodat je het draaien ZIET)
  g.lineStyle(9, 0x8a6a2e, 1);
  for (let a = 0; a < 4; a++) {
    const ang = (a / 4) * Math.PI;
    g.beginPath();
    g.moveTo(Math.cos(ang) * (r - 12), Math.sin(ang) * (r - 12));
    g.lineTo(-Math.cos(ang) * (r - 12), -Math.sin(ang) * (r - 12));
    g.strokePath();
  }
  g.fillStyle(0x6e5436, 1); g.fillCircle(0, 0, 13);
  g.fillStyle(0xd9ad55, 1); g.fillCircle(0, 0, 6);
  return g;
}

function tekenStippen(s, T) {
  T.stipBar.clear();
  for (let i = 0; i < SLAGEN; i++) {
    const px = (i - (SLAGEN - 1) / 2) * 18;
    if (i < T.slagen) { T.stipBar.fillStyle(0xf6c624, 1); T.stipBar.fillCircle(px, 0, 6.5); }
    T.stipBar.lineStyle(2, 0x8a6a2e, 1); T.stipBar.strokeCircle(px, 0, 6.5);
  }
}

function slagKlaar(s, T) {
  T.slagen += 1;
  SFX.correct(); Voice.number(T.slagen);
  tekenStippen(s, T);
  s.sparkleAt(T.x, T.y, 6);
  s.tweens.add({ targets: T.stipBord, scale: 1.15, duration: 110, yoyo: true });
  // de poort klikt een stap verder open (zakt per slag een stuk)
  const stap = (T.groundTop - 190) / SLAGEN;
  s.tweens.add({ targets: T.muurArt, y: T.muurArt.y + stap, duration: 320, ease: 'Back.out' });
  SFX.place();
  if (T.slagen >= SLAGEN) {
    T.klaar = true;
    T.wiel.disableInteractive();
    SFX.fanfare(); Voice.cue('cheer'); confettiBurst(s, 90); s.cameraPunch();
    T.body.body.enable = false;
    s.doorGroup.remove(T.body, false, false);
    s.tweens.add({ targets: T.muurArt, alpha: 0.15, duration: 500 });
    s.questText.setText('Drie hele rondjes — de poort is open! ⚙️');
    s.vierMijlpaal(T.x);
  } else {
    s.questText.setText(`Slag ${T.slagen} van ${SLAGEN} — draai verder! ⚙️`);
  }
}

export default {
  build(s, L) {
    s.tandwielen = [];
    (L.tandwielen || []).forEach((T0) => {
      const groundTop = L.platforms[0][1];
      const r = 62;

      // het wiel (draai-baar via vinger-rondjes; depth 13 = boven de speler)
      const wiel = s.add.container(T0.x, T0.y).setDepth(13);
      wiel.add(tekenWiel(s, r));
      wiel.setInteractive(new Phaser.Geom.Circle(0, 0, r + 14), Phaser.Geom.Circle.Contains);
      wiel.input.cursor = 'pointer';

      // stippen-bord: hoeveel slagen nog?
      const stipBord = s.add.container(T0.x, T0.y - r - 42).setDepth(7);
      const bg = s.add.graphics();
      bg.fillStyle(0x16202b, 0.6); bg.fillRoundedRect(-46, -18, 92, 36, 11);
      stipBord.add(bg);
      const stipBar = s.add.graphics();
      stipBord.add(stipBar);

      // de poort: zakt per slag verder open (art start hoog)
      const muurX = T0.x + TANDWIEL_DEUR;
      const body = s.add.rectangle(muurX, (40 + groundTop) / 2, 46, groundTop - 40, 0x000000, 0);
      s.physics.add.existing(body, true);
      s.doorGroup.add(body);
      const muurArt = s.add.container(muurX, 0).setDepth(4);
      const mg = s.add.graphics();
      mg.fillStyle(0x6e5436, 1); mg.fillRoundedRect(-23, 150, 46, groundTop - 148, 10);
      mg.fillStyle(0x8a6a45, 1); mg.fillRoundedRect(-23, 150, 46, 14, 6);
      mg.lineStyle(3, 0x4a3a26, 1); mg.strokeRoundedRect(-23, 150, 46, groundTop - 148, 10);
      // tandwiel-reliëf op de poort
      mg.lineStyle(2.5, 0x4a3a26, 0.7);
      for (let ky = 210; ky < groundTop - 40; ky += 100) mg.strokeCircle(0, ky, 12);
      muurArt.add(mg);

      const T = {
        ...T0, wiel, stipBord, stipBar, body, muurArt, groundTop,
        slagen: 0, klaar: false, draaiHoek: 0, vorigeHoek: null, cuePlayed: false,
      };
      tekenStippen(s, T);

      // het draai-gebaar: volg de vinger-hoek rond het midden en sommeer
      wiel.on('pointermove', (pointer) => {
        if (T.klaar || !pointer.isDown) { T.vorigeHoek = null; return; }
        const hoek = Math.atan2(pointer.worldY - T.y, pointer.worldX - T.x);
        if (T.vorigeHoek != null) {
          let d = hoek - T.vorigeHoek;
          if (d > Math.PI) d -= Math.PI * 2;
          if (d < -Math.PI) d += Math.PI * 2;
          T.draaiHoek += Math.abs(d);
          wiel.angle += Phaser.Math.RadToDeg(d); // het wiel draait mee met je vinger
          if (T.draaiHoek >= Math.PI * 2) {
            T.draaiHoek -= Math.PI * 2;
            slagKlaar(s, T);
          }
        }
        T.vorigeHoek = hoek;
      });
      wiel.on('pointerout', () => { T.vorigeHoek = null; });
      wiel.on('pointerup', () => { T.vorigeHoek = null; });

      s.tandwielen.push(T);
    });
  },

  update(s) {
    if (!s.tandwielen || !s.tandwielen.length) return;
    const p = s.player;
    for (const T of s.tandwielen) {
      if (T.klaar) continue;
      if (!T.cuePlayed && Math.abs(p.x - T.x) < 240) {
        T.cuePlayed = true;
        Voice.hint('hint-tandwiel');
        s.questText.setText('Teken RONDJES op het tandwiel — draai de poort open! ⚙️');
      }
    }
  },
};
