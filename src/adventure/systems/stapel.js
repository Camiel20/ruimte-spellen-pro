// ===== SYSTEEM: PANNENKOEKEN-TOREN (Pannenkoeken-Paradijs) =====
// Bak een toren van PRECIES n pannenkoeken: elke tik op de pan flipt er
// één op de stapel (hardop meetellen!). Bij precies n op de bel drukken =
// de toren wordt een echte trap omhoog. Eén te veel? Dan kiepert de hele
// toren hilarisch om en mag je opnieuw. Werkwoord: doortellen & stoppen.
// LET OP: overlay in WERELD-coördinaten + camera stil (geen scrollFactor-
// container — die verschuift tik-zones bij camera-scroll).

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { confettiBurst } from '../../reward.js';

const KOEK_H = 16; // hoogte van één pannenkoek op de stapel

function tekenKoek(s, breed) {
  const g = s.add.graphics();
  g.fillStyle(0xc98a3d, 1); g.fillEllipse(0, 3, breed, 15);
  g.fillStyle(0xdca050, 1); g.fillEllipse(0, 0, breed, 14);
  g.fillStyle(0xeab86a, 1); g.fillEllipse(0, -2, breed - 12, 9);
  return g;
}

function startBakken(s) {
  const ST = s.stapel;
  ST.bezig = true;
  s.mode = 'stapel';
  s.player.body.setVelocity(0, 0);
  const cam = s.cameras.main;
  cam.stopFollow();
  const W = s.scale.width, H = s.scale.height;
  const ov = s.add.container(cam.scrollX, cam.scrollY).setDepth(80);
  ST.overlay = ov;

  ov.add(s.add.rectangle(W / 2, H / 2, W, H, 0x2a1608, 0.78).setInteractive());
  ov.add(s.add.text(W / 2, 130, `Bak er PRECIES ${ST.doel}!`, {
    fontFamily: 'Arial Black, Arial', fontSize: '28px', fontStyle: 'bold',
    color: '#ffe16b', stroke: '#7a3d05', strokeThickness: 7,
  }).setOrigin(0.5));
  ST.uitleg = s.add.text(W / 2, 172, `Tik de pan • stop bij ${ST.doel} en luid de bel! 🔔`, {
    fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
  }).setOrigin(0.5);
  ov.add(ST.uitleg);

  // het bord waar de toren op groeit
  const bordY = 520;
  const bord = s.add.graphics();
  bord.fillStyle(0xf5efe2, 1); bord.fillEllipse(W / 2 + 70, bordY + 8, 170, 26);
  bord.fillStyle(0xd9d2c5, 1); bord.fillEllipse(W / 2 + 70, bordY + 10, 120, 14);
  ov.add(bord);
  ST.torenX = W / 2 + 70; ST.torenY = bordY;
  ST.koeken = [];
  ST.teller = s.add.text(ST.torenX, bordY + 40, '0', {
    fontFamily: 'Arial Black, Arial', fontSize: '34px', fontStyle: 'bold',
    color: '#ffffff', stroke: '#7a3d05', strokeThickness: 7,
  }).setOrigin(0.5);
  ov.add(ST.teller);

  // de pan (grote tik-knop links)
  const panC = s.add.container(W / 2 - 130, 470);
  const pg = s.add.graphics();
  pg.fillStyle(0x000000, 0.2); pg.fillEllipse(0, 40, 130, 18);
  pg.fillStyle(0x5b4a3a, 1); pg.fillRoundedRect(52, -6, 52, 12, 6);
  pg.fillStyle(0x2f2a26, 1); pg.fillEllipse(0, 0, 128, 34);
  pg.fillStyle(0x4a443e, 1); pg.fillEllipse(0, -5, 112, 24);
  panC.add(pg);
  const panKoek = tekenKoek(s, 78); panKoek.y = -10;
  panC.add(panKoek);
  panC.add(s.add.text(0, 52, '👆 TIK!', { fontFamily: 'Arial Black, Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffe16b' }).setOrigin(0.5));
  panC.setSize(180, 130).setInteractive({ useHandCursor: true });
  panC.on('pointerdown', () => flipKoek(s, panC, panKoek));
  ov.add(panC);
  s.tweens.add({ targets: panC, y: 464, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

  // de gouden bel (klaar!)
  const belC = s.add.container(W / 2 + 150, 300);
  const bg2 = s.add.graphics();
  bg2.fillStyle(0xffd24d, 1); bg2.fillRoundedRect(-34, -30, 68, 52, 16);
  bg2.fillStyle(0xb98d12, 1); bg2.fillRoundedRect(-34, 10, 68, 12, 6);
  belC.add(bg2);
  belC.add(s.add.text(0, -6, '🔔', { fontSize: '30px' }).setOrigin(0.5));
  belC.add(s.add.text(0, 40, 'KLAAR!', { fontFamily: 'Arial Black, Arial', fontSize: '14px', fontStyle: 'bold', color: '#ffe16b' }).setOrigin(0.5));
  belC.setSize(90, 100).setInteractive({ useHandCursor: true });
  belC.on('pointerdown', () => luidBel(s));
  ov.add(belC);
  ST.bel = belC;
}

function flipKoek(s, panC, panKoek) {
  const ST = s.stapel;
  if (ST.blokkade) return;
  ST.aantal += 1;
  SFX.pick();
  // pan wipt, pannenkoek vliegt in een boog naar de toren
  s.tweens.add({ targets: panC, angle: -16, duration: 80, yoyo: true });
  const start = { x: panC.x, y: panC.y - 20 };
  const doelY = ST.torenY - ST.koeken.length * KOEK_H - 8;
  const vlieger = tekenKoek(s, 90 - Math.min(30, ST.koeken.length * 2));
  vlieger.setPosition(start.x, start.y);
  ST.overlay.add(vlieger);
  const boog = { t: 0 };
  s.tweens.add({
    targets: boog, t: 1, duration: 420, ease: 'Sine.inOut',
    onUpdate: () => {
      vlieger.x = Phaser.Math.Linear(start.x, ST.torenX, boog.t);
      vlieger.y = Phaser.Math.Linear(start.y, doelY, boog.t) - Math.sin(boog.t * Math.PI) * 150;
      vlieger.angle = boog.t * 360;
    },
    onComplete: () => {
      vlieger.setAngle(0);
      ST.koeken.push(vlieger);
      SFX.place(); Voice.number(ST.aantal);
      ST.teller.setText(`${ST.aantal}`);
      s.tweens.add({ targets: ST.teller, scale: 1.3, duration: 110, yoyo: true });
      // te hoog? de toren wiebelt steeds erger… en kiepert bij doel+1 om!
      if (ST.aantal > ST.doel) omkieperen(s);
      else if (ST.aantal === ST.doel) {
        ST.uitleg.setText(`${ST.doel}! Precies goed — LUID DE BEL! 🔔`);
        s.tweens.add({ targets: ST.bel, scale: 1.18, duration: 300, yoyo: true, repeat: 3 });
      }
    },
  });
}

function omkieperen(s) {
  const ST = s.stapel;
  ST.blokkade = true;
  SFX.oops(); Voice.cue('oops');
  ST.uitleg.setText(`Oei — dat waren er ${ST.aantal}, eentje te veel! 😅`);
  // de hele toren zwiept om: pannenkoeken vliegen alle kanten op
  s.tweens.add({ targets: ST.koeken, angle: 40, duration: 220, delay: 150 });
  ST.koeken.forEach((k, i) => {
    s.tweens.add({
      targets: k, x: k.x + Phaser.Math.Between(60, 190), y: k.y + Phaser.Math.Between(40, 160),
      angle: Phaser.Math.Between(120, 400), alpha: 0, duration: 700, delay: 260 + i * 40,
      ease: 'Quad.in', onComplete: () => k.destroy(),
    });
  });
  SFX.giggle();
  s.time.delayedCall(1400, () => {
    ST.koeken = []; ST.aantal = 0;
    ST.teller.setText('0');
    ST.uitleg.setText(`Opnieuw — tel maar mee tot ${ST.doel}!`);
    ST.blokkade = false;
  });
}

function luidBel(s) {
  const ST = s.stapel;
  if (ST.blokkade) return;
  if (ST.aantal === ST.doel) {
    ST.blokkade = true;
    SFX.fanfare(); Voice.cue('cheer'); confettiBurst(s, 120);
    ST.uitleg.setText(`PRECIES ${ST.doel} — wat een toren! 🥞`);
    s.tweens.add({ targets: ST.koeken, y: '-=10', duration: 160, yoyo: true, repeat: 2 });
    s.time.delayedCall(1100, () => bouwTrap(s));
  } else if (ST.aantal < ST.doel) {
    SFX.wrong(); Voice.number(ST.aantal);
    ST.uitleg.setText(`Nog niet — er liggen er pas ${ST.aantal}, we willen er ${ST.doel}!`);
    s.tweens.add({ targets: ST.bel, x: ST.bel.x + 5, duration: 60, yoyo: true, repeat: 4 });
  }
}

function bouwTrap(s) {
  const ST = s.stapel;
  s.tweens.add({ targets: ST.overlay, alpha: 0, duration: 400, onComplete: () => ST.overlay.destroy() });
  ST.klaar = true;
  SFX.grow(6); s.cameraPunch();
  // de trap van pannenkoek-stapels verschijnt stap voor stap
  (ST.trap || []).forEach(([x, y, w], i) => {
    s.time.delayedCall(300 + i * 260, () => {
      const body = s.add.rectangle(x, y + 9, w, 18, 0x000000, 0);
      s.physics.add.existing(body, true);
      s.platforms.add(body);
      const c = s.add.container(x, y + 30).setDepth(-9).setAlpha(0);
      const hoog = 4 + i * 2; // elke trede is een hoger stapeltje
      const g = s.add.graphics();
      for (let k = 0; k < hoog; k++) {
        g.fillStyle(k % 2 ? 0xdca050 : 0xc98a3d, 1);
        g.fillEllipse(0, -k * 9, w - 8 - (k % 3) * 6, 14);
      }
      g.fillStyle(0xffe16b, 1); g.fillRoundedRect(-8, -hoog * 9 - 6, 16, 8, 3); // botertje bovenop
      c.add(g);
      s.tweens.add({ targets: c, y: y + 9, alpha: 1, duration: 300, ease: 'Back.out' });
      SFX.place(); s.sparkleAt(x, y - 10, 4);
    });
  });
  s.time.delayedCall(300 + (ST.trap || []).length * 260 + 300, () => {
    s.mode = 'explore';
    s.cameras.main.startFollow(s.player, true, 0.12, 0.12);
    s.checkpoint = { x: ST.x, bottom: ST.groundTop };
    s.questText.setText('De pannenkoeken-trap staat — klim omhoog! 🥞🚩');
    s.vierMijlpaal(ST.x);
  });
}

export default {
  build(s, L) {
    s.stapel = null;
    if (!L.stapel) return;
    const ST = L.stapel, groundTop = L.platforms[0][1];

    // het bak-station in de wereld: fornuisje + pan + bord met doel-getal
    const c = s.add.container(ST.x, groundTop).setDepth(6);
    const g = s.add.graphics();
    g.fillStyle(0x000000, 0.2); g.fillEllipse(0, 2, 130, 16);
    g.fillStyle(0x8a5a33, 1); g.fillRoundedRect(-46, -64, 92, 64, 8);   // fornuisje
    g.fillStyle(0xa9713f, 1); g.fillRoundedRect(-46, -64, 92, 12, 6);
    g.fillStyle(0xf07c1f, 1); g.fillEllipse(0, -30, 40, 22);            // vuurtje
    g.fillStyle(0xffe16b, 1); g.fillEllipse(0, -28, 22, 12);
    g.fillStyle(0x2f2a26, 1); g.fillEllipse(0, -66, 96, 22);            // pan bovenop
    g.fillStyle(0xdca050, 1); g.fillEllipse(0, -70, 66, 12);            // pannenkoek
    c.add(g);
    const meter = s.add.container(ST.x, groundTop - 150).setDepth(7);
    const mbg = s.add.graphics();
    mbg.fillStyle(0x16202b, 0.55); mbg.fillRoundedRect(-72, -22, 144, 46, 14);
    meter.add(mbg);
    meter.add(s.add.text(0, -6, `🥞 bak er ${ST.doel}!`, { fontFamily: 'Arial Black, Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5));
    meter.add(s.add.text(0, 14, 'kom maar hier!', { fontFamily: 'Arial', fontSize: '11px', color: '#ffe0c2' }).setOrigin(0.5));
    s.tweens.add({ targets: meter, y: meter.y - 6, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    s.stapel = { ...ST, c, meter, groundTop, aantal: 0, bezig: false, klaar: false, blokkade: false, cueAt: 0 };
  },

  update(s, time) {
    const ST = s.stapel;
    if (!ST || ST.klaar || ST.bezig) return;
    const p = s.player;
    if (Math.abs(p.x - ST.x) < 66) startBakken(s);
  },
};
