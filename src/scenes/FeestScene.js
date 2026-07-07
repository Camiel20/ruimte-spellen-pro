// ===== HET GROTE FEEST — de aftiteling =====
// Na het verslaan van Baron Grauw (6-2): alle geredde vriendjes dansen,
// confetti regent, de baron (nu met paarse strepen!) viert mee, en het spel
// zegt waar het al die tijd om ging: gemaakt voor Adrian. Woordeloos genoeg
// voor een niet-lezer; de EINDE-tekst is versiering.

import Phaser from 'phaser';
import { SFX, initAudio } from '../sound.js';
import { Voice } from '../voice.js';
import { startMusic } from '../music.js';
import { confettiBurst } from '../reward.js';
import { getSetting } from '../progress.js';
import { sig, darker } from '../adventure/palette.js';
import { drawCubeStack, addNumberDisc, addFeet } from '../adventure/art.js';
import { ROSTER } from '../adventure/roster.js';
import { bossLook } from '../adventure/bossRegistry.js';

export default class FeestScene extends Phaser.Scene {
  constructor() { super('Feest'); }

  // slot: true = HET GROTE SLOTFEEST (na 12-5) — alle bekeerde bazen dansen mee!
  init(data) { this.slot = !!(data && data.slot); }

  create() {
    initAudio();
    startMusic('menu'); // rustig vrolijk deuntje onder het feest
    const W = this.scale.width, H = this.scale.height;

    // vrolijke lucht — de kleur is terug!
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x8fd3ff, 0x8fd3ff, 0x8ed36b, 0x8ed36b, 1);
    sky.fillRect(0, 0, W, H);
    const zon = this.add.graphics();
    zon.fillStyle(0xfff3b0, 0.4); zon.fillCircle(W - 70, 90, 52);
    zon.fillStyle(0xffe16b, 1); zon.fillCircle(W - 70, 90, 32);

    // Na 6-2 is het verhaal-deel gered (maar het spel nog lang niet uit —
    // "EINDE!" was hier misleidend); na 12-5 is ALLES gered: het slotfeest.
    this.add.text(W / 2, 90, this.slot ? '👑 ALLES GERED! 👑' : 'HOERA!', {
      fontFamily: 'Arial Black, Arial', fontSize: this.slot ? '34px' : '52px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setStroke('#e8402c', 12);
    this.add.text(W / 2, 148, this.slot ? 'Alle twaalf de landen dansen mee! 🎉' : 'Getallen-Land is gered! 🎉', {
      fontFamily: 'Arial Black, Arial', fontSize: '20px', fontStyle: 'bold', color: '#16202b',
    }).setOrigin(0.5).setStroke('#ffffff', 6);

    // alle vriendjes op een rij (dansend), plus Één vooraan
    const rij = [1, ...ROSTER.filter((n) => n !== 1)];
    rij.forEach((v, i) => {
      const x = 55 + (i % 6) * 76;
      const baseY = 320 + Math.floor(i / 6) * 170;
      const c = this.add.container(x, baseY);
      const cell = Math.min(30, 150 / v); // Twintig blijft passen
      const { totalH, top } = drawCubeStack(this, c, v, { w: 30, cell, color: sig(v), eyeR: 5, eyeX: 7, pupilR: 2.2, mouthR: 5, faceStroke: 2 });
      if (v === 1) addFeet(this, c, darker(sig(1), 40), 30, totalH);
      addNumberDisc(this, c, v, top - 10, 9, '11px');
      c.y = baseY - totalH / 2;
      this.tweens.add({
        targets: c, y: c.y - 22, duration: 380 + (i % 5) * 60,
        yoyo: true, repeat: -1, ease: 'Quad.out', delay: i * 90,
      });
    });

    // Nul draait pirouettes tussen de vriendjes
    const nul = this.add.container(W / 2, 250);
    const ng = this.add.graphics();
    ng.fillStyle(0x7fd0f0, 1); ng.fillCircle(0, 0, 17);
    ng.fillStyle(0xbfe8ff, 0.85); ng.fillCircle(-5, -6, 5);
    ng.lineStyle(3, 0x2b7fae, 1); ng.strokeCircle(0, 0, 17);
    nul.add(ng);
    nul.add(this.add.circle(-6, -3, 4.5, 0xffffff).setStrokeStyle(1.8, 0x16202b));
    nul.add(this.add.circle(6, -3, 4.5, 0xffffff).setStrokeStyle(1.8, 0x16202b));
    nul.add(this.add.circle(-6, -2.4, 2, 0x16202b));
    nul.add(this.add.circle(6, -2.4, 2, 0x16202b));
    const nm = this.add.graphics(); nm.lineStyle(2.4, 0x16202b, 1);
    nm.beginPath(); nm.arc(0, 4, 6, 0.15 * Math.PI, 0.85 * Math.PI); nm.strokePath();
    nul.add(nm);
    this.tweens.add({ targets: nul, angle: 360, duration: 1400, repeat: -1 });
    this.tweens.add({ targets: nul, x: W / 2 + 120, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // HET SLOTFEEST: alle bekeerde bazen dansen mee in hun blije vorm —
    // hun happy-art bestaat al in het baas-register. (De vaste Grauw
    // hieronder wordt dan overgeslagen: hij staat mídden in de galerij.)
    if (this.slot) {
      const gasten = ['golf', 'boom', 'kristal', 'meteoor', 'kaas', 'grauw', 'drol', 'reus', 'bil', 'octopus', 'pan'];
      gasten.forEach((lookNaam, i) => {
        try {
          const look = bossLook(lookNaam);
          const rij = i < 6 ? 0 : 1;
          const kol = rij === 0 ? i : i - 6;
          const bx = (rij === 0 ? 50 : 90) + kol * 76;
          const by = rij === 0 ? 600 : 710;
          const c = look.draw(this, bx, by);
          look.happy(this, c, { stages: [{ doel: 5 }] }); // mock-pz voor looks die 'm lezen
          if (c.bubble) c.bubble.setVisible(false);
          if (c.sprayWall) c.sprayWall.setVisible(false); // de golf-blokkade hoort bij het gevecht
          c.setScale(0.4);
          this.tweens.add({ targets: c, angle: i % 2 ? 5 : -5, duration: 480 + i * 40, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        } catch (e) { /* een gast die niet past slaat de dans over */ }
      });
      this.add.text(W / 2, 775, `Gemaakt voor ${getSetting('childName') || 'jou'} 💙`, {
        fontFamily: 'Arial Black, Arial', fontSize: '16px', fontStyle: 'bold', color: '#e8402c',
      }).setOrigin(0.5).setStroke('#ffffff', 6);
      confettiBurst(this, 300);
      this.time.addEvent({ delay: 1500, loop: true, callback: () => confettiBurst(this, 300) });
      SFX.win(); Voice.cue('cheer'); Voice.hint('woord-joepie', 800); // dít is een groot moment!
      this.time.addEvent({ delay: 3400, loop: true, callback: () => Voice.cue('laugh') });
      this.maakKaartKnop();
      return;
    }

    // Baron Grauw viert mee — paarse strepen, gouden knopen, grote lach
    const grauw = this.add.container(W / 2, 640);
    const gg = this.add.graphics();
    gg.fillStyle(0x7d838c, 1); gg.fillRoundedRect(-24, -56, 48, 104, 10);
    gg.fillStyle(0x9b6dd6, 0.85); gg.fillRoundedRect(-24, -14, 48, 10, 5); gg.fillRoundedRect(-24, 8, 48, 10, 5);
    gg.lineStyle(3, 0x4a4f55, 1); gg.strokeRoundedRect(-24, -56, 48, 104, 10);
    gg.fillStyle(0x2b2f34, 1); gg.fillRect(-27, -66, 54, 7); gg.fillRoundedRect(-16, -96, 32, 32, 4);
    gg.fillStyle(0xffe16b, 1); gg.fillCircle(0, -30, 3); gg.fillCircle(0, -2, 3);
    grauw.add(gg);
    grauw.add(this.add.circle(-9, -40, 6, 0xffffff).setStrokeStyle(2, 0x2b2f34));
    grauw.add(this.add.circle(10, -40, 7, 0xffffff).setStrokeStyle(2, 0xd9a821));
    grauw.add(this.add.circle(-9, -39, 2.5, 0x2b2f34));
    grauw.add(this.add.circle(10, -39, 2.5, 0x2b2f34));
    const gm = this.add.graphics(); gm.lineStyle(3, 0x2b2f34, 1);
    gm.beginPath(); gm.arc(0, -20, 9, 0.12 * Math.PI, 0.88 * Math.PI); gm.strokePath();
    grauw.add(gm);
    this.add.text(W / 2, 712, 'Zelfs Baron Grauw telt mee: 1… 2… 3!', {
      fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#16202b',
    }).setOrigin(0.5).setStroke('#ffffff', 5);
    this.tweens.add({ targets: grauw, angle: 4, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // voor wie het spel maakte en voor wie het is
    this.add.text(W / 2, 762, `Gemaakt voor ${getSetting('childName') || 'jou'} 💙`, {
      fontFamily: 'Arial Black, Arial', fontSize: '16px', fontStyle: 'bold', color: '#e8402c',
    }).setOrigin(0.5).setStroke('#ffffff', 6);

    // confetti blijft komen + af en toe gejuich
    confettiBurst(this, 300);
    this.time.addEvent({ delay: 1800, loop: true, callback: () => confettiBurst(this, 300) });
    SFX.win(); Voice.cue('cheer');
    this.time.addEvent({ delay: 3400, loop: true, callback: () => Voice.cue('laugh') });

    this.maakKaartKnop();
  }

  // terug naar de kaart (grote knop bovenin, het feest is vol)
  maakKaartKnop() {
    const knop = this.add.container(52, 40).setDepth(50);
    const kg = this.add.graphics();
    kg.fillStyle(0x38b6cf, 1); kg.fillCircle(0, 0, 30);
    kg.lineStyle(4, 0x1f7a9e, 1); kg.strokeCircle(0, 0, 30);
    knop.add([kg, this.add.text(0, 0, '🗺️', { fontSize: '24px' }).setOrigin(0.5)]);
    knop.setSize(66, 66).setInteractive({ useHandCursor: true });
    knop.on('pointerdown', () => { SFX.click(); this.scene.start('WorldMap'); });
  }
}
