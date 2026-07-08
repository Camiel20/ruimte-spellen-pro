// ===== LETTER-LAND — HET FEEST (finale-stub) =====
// Na het verslaan van De Sisser: de gewekte Alfa-Blokken spellen samen een
// woord, Priet draait pirouettes en De Sisser (nu een vriend!) danst mee.
// "De letters klinken weer!" Woordeloos genoeg voor een niet-lezer; de tekst is
// versiering. (De volledige finale komt in een latere fase.)

import Phaser from 'phaser';
import { SFX, initAudio } from '../sound.js';
import { Voice } from '../voice.js';
import { startMusic } from '../music.js';
import { confettiBurst } from '../reward.js';
import { getSetting } from '../progress.js';
import { RAINBOW } from '../glyphs.js';
import { tekenAlfaBlok, tekenSisser, tekenPotloodLijf } from '../adventure/letterCast.js';

export default class LetterFeestScene extends Phaser.Scene {
  constructor() { super('LetterFeest'); }

  create() {
    initAudio();
    startMusic('menu');
    const W = this.scale.width, H = this.scale.height;

    const sky = this.add.graphics();
    sky.fillGradientStyle(0x9ad7ff, 0x9ad7ff, 0x74c95a, 0x74c95a, 1);
    sky.fillRect(0, 0, W, H);
    const zg = this.add.graphics();
    zg.fillStyle(0xfff3b0, 0.4); zg.fillCircle(W - 66, 84, 52);
    zg.fillStyle(0xffe16b, 1); zg.fillCircle(W - 66, 84, 32);

    this.add.text(W / 2, 92, 'HOERA!', {
      fontFamily: 'Arial Black, Arial', fontSize: '50px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setStroke('#e8402c', 12);
    this.add.text(W / 2, 150, 'De letters klinken weer! 🎉', {
      fontFamily: 'Arial Black, Arial', fontSize: '19px', fontStyle: 'bold', color: '#16202b',
    }).setOrigin(0.5).setStroke('#ffffff', 6);

    // de gewekte Alfa-Blokken spellen "hoera"
    const woord = 'hoera';
    const chars = [...woord];
    const tot = chars.length * 66;
    const startX = W / 2 - tot / 2 + 33;
    chars.forEach((ch, i) => {
      const b = tekenAlfaBlok(this, startX + i * 66, 320, ch, RAINBOW[i % RAINBOW.length], true, 54);
      this.tweens.add({ targets: b, y: 300, duration: 360 + (i % 4) * 70, yoyo: true, repeat: -1, ease: 'Quad.out', delay: i * 90 });
      // muzieknootjes: ze praten weer!
      this.time.addEvent({ delay: 900 + i * 120, loop: true, callback: () => {
        const n = this.add.text(b.x + 18, b.y - 34, '♪', { fontSize: '16px', color: '#ffffff' }).setOrigin(0.5);
        this.tweens.add({ targets: n, y: n.y - 30, alpha: 0, duration: 1100, onComplete: () => n.destroy() });
      } });
    });

    // Priet draait pirouettes
    const priet = this.add.container(W / 2, 470).setDepth(10);
    const plijf = this.add.container(0, 0); tekenPotloodLijf(this, plijf); priet.add(plijf);
    this.tweens.add({ targets: priet, angle: 360, duration: 1600, repeat: -1 });
    this.tweens.add({ targets: priet, x: W / 2 + 110, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // De Sisser danst mee (bekeerd)
    const sisser = tekenSisser(this, W / 2, 620, 0.9, true).setDepth(8);
    this.tweens.add({ targets: sisser, angle: 5, duration: 480, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    this.add.text(W / 2, 748, `Gemaakt voor ${getSetting('childName') || 'jou'} 💙`, {
      fontFamily: 'Arial Black, Arial', fontSize: '16px', fontStyle: 'bold', color: '#e8402c',
    }).setOrigin(0.5).setStroke('#ffffff', 6);

    confettiBurst(this, 300);
    this.time.addEvent({ delay: 1600, loop: true, callback: () => confettiBurst(this, 300) });
    SFX.win(); Voice.cue('cheer');
    this.time.addEvent({ delay: 3400, loop: true, callback: () => Voice.cue('laugh') });

    // terug naar de kaart
    const knop = this.add.container(52, 40).setDepth(50);
    const kg = this.add.graphics();
    kg.fillStyle(0x38b6cf, 1); kg.fillCircle(0, 0, 30); kg.lineStyle(4, 0x1f7a9e, 1); kg.strokeCircle(0, 0, 30);
    knop.add([kg, this.add.text(0, 0, '🗺️', { fontSize: '24px' }).setOrigin(0.5)]);
    knop.setSize(66, 66).setInteractive({ useHandCursor: true });
    knop.on('pointerdown', () => { SFX.click(); this.scene.start('LetterMap'); });
  }
}
