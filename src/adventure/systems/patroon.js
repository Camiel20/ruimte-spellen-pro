// ===== SYSTEEM: PATROON-PANNENKOEK (Pannenkoeken-Paradijs) =====
// De chef legt toppings in een patroon op de reuzen-pannenkoek — maar wat
// komt er op de lege plek? Kies de juiste topping (patronen herkennen =
// echt kleuterdoel). Drie rondes goed = de slagboom gaat open.
// Overlay in WERELD-coördinaten + camera stil (scrollFactor-valkuil!).

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { confettiBurst } from '../../reward.js';

// Eén topping tekenen in een cirkeltje.
export function tekenTopping(s, soort, r = 20) {
  const c = s.add.container(0, 0);
  const g = s.add.graphics();
  g.fillStyle(0xfff6e8, 1); g.fillCircle(0, 0, r);
  g.lineStyle(3, 0xd9c9a8, 1); g.strokeCircle(0, 0, r);
  if (soort === 'aardbei') {
    g.fillStyle(0xe8402c, 1);
    g.fillCircle(0, 2, r * 0.52);
    g.fillTriangle(-r * 0.5, 0, r * 0.5, 0, 0, r * 0.62);
    g.fillStyle(0x57b947, 1); g.fillEllipse(0, -r * 0.42, r * 0.7, r * 0.3);
    g.fillStyle(0xffe16b, 1);
    [[-4, 2], [4, 4], [0, 9], [-6, 8], [6, -1]].forEach(([px, py]) => g.fillCircle(px * (r / 20), py * (r / 20), 1.3));
  } else if (soort === 'banaan') {
    g.lineStyle(r * 0.34, 0xf6c624, 1);
    g.beginPath(); g.arc(0, -r * 0.15, r * 0.5, 0.15 * Math.PI, 0.85 * Math.PI); g.strokePath();
    g.fillStyle(0x8a5a33, 1); g.fillCircle(-r * 0.48, 0, 2.2); g.fillCircle(r * 0.48, 0, 2.2);
  } else if (soort === 'bes') {
    g.fillStyle(0x4a5fc4, 1); g.fillCircle(0, 0, r * 0.5);
    g.fillStyle(0x7d8fe0, 0.9); g.fillCircle(-r * 0.16, -r * 0.16, r * 0.2);
  } else { // room (slagroom-toef)
    g.fillStyle(0xffffff, 1);
    g.fillCircle(-r * 0.28, r * 0.1, r * 0.3); g.fillCircle(r * 0.28, r * 0.1, r * 0.3);
    g.fillCircle(0, -r * 0.12, r * 0.36); g.fillCircle(0, r * 0.2, r * 0.42);
    g.fillStyle(0xe8402c, 1); g.fillCircle(0, -r * 0.42, r * 0.18); // kersje
  }
  c.add(g);
  return c;
}

function startPatroon(s) {
  const PT = s.patroon;
  PT.bezig = true;
  s.mode = 'patroon';
  s.player.body.setVelocity(0, 0);
  const cam = s.cameras.main;
  cam.stopFollow();
  const W = s.scale.width, H = s.scale.height;
  const ov = s.add.container(cam.scrollX, cam.scrollY).setDepth(80);
  PT.overlay = ov;
  ov.add(s.add.rectangle(W / 2, H / 2, W, H, 0x2a1608, 0.78).setInteractive());
  ov.add(s.add.text(W / 2, 140, 'Wat komt er nu?', {
    fontFamily: 'Arial Black, Arial', fontSize: '30px', fontStyle: 'bold',
    color: '#ffe16b', stroke: '#7a3d05', strokeThickness: 7,
  }).setOrigin(0.5));
  PT.uitleg = s.add.text(W / 2, 182, 'Kijk goed naar het patroon… 👀', {
    fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
  }).setOrigin(0.5);
  ov.add(PT.uitleg);
  PT.rondeC = null;
  toonRonde(s);
}

function toonRonde(s) {
  const PT = s.patroon;
  const W = s.scale.width;
  if (PT.rondeC) PT.rondeC.destroy();
  const R = PT.rondes[PT.ronde];
  const c = s.add.container(0, 0);
  PT.overlay.add(c);
  PT.rondeC = c;

  // de reuzen-pannenkoek met het patroon erop
  const pk = s.add.graphics();
  pk.fillStyle(0xc98a3d, 1); pk.fillEllipse(W / 2, 300, 400, 150);
  pk.fillStyle(0xdca050, 1); pk.fillEllipse(W / 2, 294, 392, 142);
  pk.fillStyle(0xeab86a, 1); pk.fillEllipse(W / 2, 290, 350, 112);
  c.add(pk);

  const n = R.reeks.length + 1;
  const stapX = Math.min(64, 340 / (n - 1));
  const startX = W / 2 - ((n - 1) * stapX) / 2;
  R.reeks.forEach((soort, i) => {
    const t = tekenTopping(s, soort, 22);
    t.setPosition(startX + i * stapX, 296);
    c.add(t);
  });
  // het lege plekje met een pulserend vraagteken
  const leeg = s.add.container(startX + (n - 1) * stapX, 296);
  const lg = s.add.graphics();
  lg.lineStyle(3, 0x7a4a1e, 0.9); lg.strokeCircle(0, 0, 22);
  leeg.add(lg);
  leeg.add(s.add.text(0, 0, '?', { fontFamily: 'Arial Black, Arial', fontSize: '26px', fontStyle: 'bold', color: '#7a4a1e' }).setOrigin(0.5));
  c.add(leeg);
  s.tweens.add({ targets: leeg, scale: 1.2, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  PT.leeg = leeg;

  // de keuze-knoppen
  const ky = 470;
  const kStap = 120;
  const kStart = W / 2 - ((R.opties.length - 1) * kStap) / 2;
  R.opties.forEach((soort, i) => {
    const knop = s.add.container(kStart + i * kStap, ky);
    const bg = s.add.graphics();
    bg.fillStyle(0xfff6e8, 1); bg.fillRoundedRect(-44, -44, 88, 88, 20);
    bg.lineStyle(4, 0xb98d12, 1); bg.strokeRoundedRect(-44, -44, 88, 88, 20);
    knop.add(bg);
    const top = tekenTopping(s, soort, 26);
    knop.add(top);
    knop.setSize(92, 92).setInteractive({ useHandCursor: true });
    knop.on('pointerdown', () => kies(s, knop, soort));
    c.add(knop);
    s.tweens.add({ targets: knop, y: ky - 5, duration: 700, yoyo: true, repeat: -1, delay: i * 160, ease: 'Sine.inOut' });
  });
  PT.uitleg.setText(`Ronde ${PT.ronde + 1} van ${PT.rondes.length} — maak het patroon af!`);
}

function kies(s, knop, soort) {
  const PT = s.patroon;
  if (PT.blokkade) return;
  const R = PT.rondes[PT.ronde];
  if (soort === R.antwoord) {
    PT.blokkade = true;
    SFX.correct(); Voice.cue('great');
    // de topping springt naar het lege plekje
    const t = tekenTopping(s, soort, 22);
    t.setPosition(knop.x, knop.y);
    PT.rondeC.add(t);
    s.tweens.killTweensOf(PT.leeg);
    PT.leeg.setVisible(false);
    s.tweens.add({
      targets: t, x: PT.leeg.x, y: PT.leeg.y, duration: 420, ease: 'Back.out',
      onComplete: () => {
        confettiBurst(s, 40);
        PT.ronde += 1;
        PT.blokkade = false;
        if (PT.ronde >= PT.rondes.length) klaarPatroon(s);
        else s.time.delayedCall(700, () => { if (PT.bezig) toonRonde(s); });
      },
    });
  } else {
    SFX.oops(); Voice.cue('oops');
    s.tweens.add({ targets: knop, x: knop.x + 6, duration: 60, yoyo: true, repeat: 4 });
    PT.uitleg.setText('Bijna! Zeg het patroon maar hardop… 💛');
  }
}

function klaarPatroon(s) {
  const PT = s.patroon;
  SFX.fanfare(); Voice.cue('cheer'); confettiBurst(s, 120);
  PT.uitleg.setText('Alle patronen goed — de weg is open! 🎉');
  s.time.delayedCall(1100, () => {
    s.tweens.add({ targets: PT.overlay, alpha: 0, duration: 380, onComplete: () => PT.overlay.destroy() });
    PT.klaar = true;
    s.mode = 'explore';
    s.cameras.main.startFollow(s.player, true, 0.12, 0.12);
    // slagboom omhoog
    PT.blok.body.enable = false;
    s.tweens.add({ targets: PT.beam, angle: -78, duration: 500, ease: 'Back.out' });
    s.tweens.add({ targets: PT.shimmer, alpha: 0, duration: 500, onComplete: () => PT.shimmer.destroy() });
    s.checkpoint = { x: PT.x, bottom: PT.groundTop };
    s.questText.setText('Patroon-meester! Ren maar door! 🚩');
    s.vierMijlpaal(PT.x);
  });
}

export default {
  build(s, L) {
    s.patroon = null;
    if (!L.patroon) return;
    const P = L.patroon, groundTop = L.platforms[0][1];

    // het patroon-bord in de wereld (schildersezel met de pannenkoek)
    const c = s.add.container(P.x, groundTop).setDepth(6);
    const g = s.add.graphics();
    g.fillStyle(0x000000, 0.18); g.fillEllipse(0, 2, 110, 14);
    g.fillStyle(0x8a5a33, 1);
    g.fillRoundedRect(-42, -110, 10, 110, 4); g.fillRoundedRect(32, -110, 10, 110, 4);
    g.fillStyle(0xf5efe2, 1); g.fillRoundedRect(-52, -128, 104, 74, 10);
    g.lineStyle(4, 0x8a5a33, 1); g.strokeRoundedRect(-52, -128, 104, 74, 10);
    g.fillStyle(0xdca050, 1); g.fillEllipse(0, -92, 84, 42);
    c.add(g);
    ['aardbei', 'banaan', 'aardbei'].forEach((soort, i) => {
      const t = tekenTopping(s, soort, 9);
      t.setPosition(-24 + i * 24, -92);
      c.add(t);
    });

    // slagboom + fonkel-blokkade (zoals de geef-platen)
    const bx = P.x + 130;
    const blok = s.add.rectangle(bx, (40 + groundTop) / 2, 40, groundTop - 40, 0x000000, 0);
    s.physics.add.existing(blok, true);
    s.doorGroup.add(blok);
    const shimmer = s.add.graphics().setDepth(3);
    shimmer.fillStyle(0xffe9c2, 0.2); shimmer.fillRoundedRect(bx - 20, 46, 40, groundTop - 106, 18);
    shimmer.fillStyle(0xffd24d, 0.5);
    for (let yy = 70; yy < groundTop - 80; yy += 52) shimmer.fillCircle(bx - 8 + (Math.floor(yy / 52) % 2) * 16, yy, 4);
    s.tweens.add({ targets: shimmer, alpha: 0.5, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const post = s.add.graphics().setDepth(4);
    post.fillStyle(0x8a5a33, 1); post.fillRoundedRect(bx + 10, groundTop - 78, 10, 78, 4);
    const beam = s.add.container(bx + 15, groundTop - 72).setDepth(4);
    const bg = s.add.graphics();
    bg.fillStyle(0xe8402c, 1); bg.fillRoundedRect(-86, -7, 92, 14, 7);
    bg.fillStyle(0xffffff, 1); bg.fillRoundedRect(-64, -7, 18, 14, 7); bg.fillRoundedRect(-28, -7, 18, 14, 7);
    beam.add(bg);

    s.patroon = { ...P, c, blok, beam, shimmer, groundTop, ronde: 0, bezig: false, klaar: false, blokkade: false };
  },

  update(s) {
    const PT = s.patroon;
    if (!PT || PT.klaar || PT.bezig) return;
    if (Math.abs(s.player.x - PT.x) < 60) startPatroon(s);
  },
};
