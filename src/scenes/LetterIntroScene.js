// ===== LETTER-LAND INTRO — het verhaal, zonder één woord =====
// Eén keer, bij de allereerste start van Letter-Land: een vrolijke weide vol
// pratende Alfa-Blokken… tot DE SISSER binnen zweeft, "Sssst!" doet en de
// letters/klank uit de woorden zuigt. De blokken vallen stil en in slaap.
// Alleen Priet het potlood blijft krassen (niet stil te krijgen!) — samen ga je
// op pad om de letters terug te schrijven. Tikken = overslaan. Daarna nooit meer
// (settings.letterIntroGezien).

import Phaser from 'phaser';
import { SFX, initAudio } from '../sound.js';
import { Voice } from '../voice.js';
import { stopMusic } from '../music.js';
import { setSetting } from '../progress.js';
import { RAINBOW } from '../glyphs.js';
import { tekenAlfaBlok, tekenSisser, tekenPotloodLijf } from '../adventure/letterCast.js';

export default class LetterIntroScene extends Phaser.Scene {
  constructor() { super('LetterIntro'); }

  create() {
    initAudio();
    stopMusic();
    const W = this.scale.width, H = this.scale.height;
    this.klaar = false;
    const GROND = 640;

    // --- de vrolijke Praatweide ---------------------------------------------
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x9ad7ff, 0x9ad7ff, 0xbdeeff, 0xbdeeff, 1);
    sky.fillRect(0, 0, W, H);
    const zg = this.add.graphics();
    zg.fillStyle(0xfff3b0, 0.4); zg.fillCircle(W - 70, 100, 52);
    zg.fillStyle(0xffe16b, 1); zg.fillCircle(W - 70, 100, 32);
    const gras = this.add.graphics();
    gras.fillStyle(0x63c24d, 1); gras.fillRect(0, GROND, W, H - GROND);
    gras.fillStyle(0x4fae4a, 1); gras.fillRect(0, GROND, W, 14);

    // --- drie pratende Alfa-Blokken (a a p) ---------------------------------
    const letters = ['a', 'a', 'p'];
    const blokken = letters.map((ch, i) => {
      const b = tekenAlfaBlok(this, 120 + i * 90, GROND - 34, ch, RAINBOW[i % RAINBOW.length], true, 56);
      this.tweens.add({ targets: b, y: b.y - 8, duration: 700 + i * 120, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      return b;
    });
    // muzieknootjes stijgen op (ze "praten") tot de stilte komt
    this.praatTimer = this.time.addEvent({
      delay: 600, loop: true, callback: () => {
        if (this.klaar || this.stil) return;
        const b = Phaser.Utils.Array.GetRandom(blokken);
        const n = this.add.text(b.x + 20, b.y - 34, '♪', { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
        this.tweens.add({ targets: n, y: n.y - 34, alpha: 0, duration: 1100, onComplete: () => n.destroy() });
      },
    });

    // --- Priet het potlood (het maatje) -------------------------------------
    const priet = this.add.container(60, GROND - 26).setDepth(12);
    const plijf = this.add.container(0, 0); tekenPotloodLijf(this, plijf); priet.add(plijf);
    this.tweens.add({ targets: priet, y: GROND - 40, duration: 360, yoyo: true, repeat: -1, ease: 'Quad.out' });

    // --- overslaan-knop (grote groene ▶) ------------------------------------
    const knop = this.add.container(W / 2, H - 70).setDepth(50);
    const kg = this.add.graphics();
    kg.fillStyle(0x2fae4e, 1); kg.fillCircle(0, 0, 36);
    kg.lineStyle(4, 0x1f7a36, 1); kg.strokeCircle(0, 0, 36);
    knop.add([kg, this.add.text(2, 0, '▶', { fontSize: '30px', color: '#ffffff' }).setOrigin(0.5)]);
    this.tweens.add({ targets: knop, scale: 1.1, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.input.once('pointerdown', () => this.startSpel());

    Voice.cue('welcome');

    // --- De Sisser zweeft binnen --------------------------------------------
    const sisser = tekenSisser(this, W + 120, GROND - 120, 1, false).setDepth(10);
    this.tweens.add({ targets: sisser, y: GROND - 128, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    const T = (ms, fn) => this.time.delayedCall(ms, () => { if (!this.klaar) fn(); });

    // 1.8s: hij zweeft binnen met een grote "Sssst!"
    T(1800, () => {
      this.tweens.add({ targets: sisser, x: W - 110, duration: 1600, ease: 'Sine.out' });
      const bub = this.add.text(W - 180, GROND - 200, 'Sssst!', {
        fontFamily: 'Arial Black, Arial', fontSize: '26px', fontStyle: 'bold', color: '#565b61',
      }).setOrigin(0.5).setStroke('#ffffff', 6).setDepth(11);
      this.tweens.add({ targets: bub, scale: { from: 0.5, to: 1 }, duration: 300, ease: 'Back.out' });
      this.time.delayedCall(1800, () => this.tweens.add({ targets: bub, alpha: 0, duration: 500, onComplete: () => bub.destroy() }));
      Voice.cue('oops'); SFX.oops();
    });

    // 4.2s: hij zuigt de klank eruit — de blokken vallen stil & in slaap
    T(4200, () => {
      this.stil = true;
      const waas = this.add.graphics().setDepth(5).setAlpha(0);
      waas.fillStyle(0x8a8f96, 0.4); waas.fillRect(0, 0, W, H);
      this.tweens.add({ targets: waas, alpha: 1, duration: 1200 });
      SFX.shrink();
      blokken.forEach((b, i) => this.time.delayedCall(250 + i * 300, () => {
        if (this.klaar) return;
        const x = b.x, y = b.y, ch = b._letter;
        b.destroy();
        const slaap = tekenAlfaBlok(this, x, y, ch, RAINBOW[i % RAINBOW.length], false, 56);
        this.tweens.add({ targets: slaap, angle: i % 2 ? 6 : -6, y: y + 6, duration: 500 });
        const z = this.add.text(x + 22, y - 34, 'z', { fontSize: '16px', fontStyle: 'bold', color: '#8a9199' }).setOrigin(0.5).setDepth(6);
        this.tweens.add({ targets: z, y: z.y - 20, alpha: 0.3, duration: 1400, yoyo: true, repeat: -1 });
      }));
    });

    // 7s: De Sisser vertrekt, tevreden.
    T(7000, () => this.tweens.add({ targets: sisser, x: W + 160, y: GROND - 90, duration: 1800, ease: 'Sine.in' }));

    // 8.4s: Priet blijft krassen (niet stil te krijgen!) en huppelt naar jou.
    T(8400, () => {
      const kras = this.add.graphics().setDepth(13);
      kras.lineStyle(3, 0x2b2f3a, 1);
      kras.beginPath(); kras.moveTo(priet.x + 14, GROND - 20);
      for (let i = 1; i <= 8; i++) kras.lineTo(priet.x + 14 + i * 5, GROND - 20 + (i % 2 ? -6 : 6));
      kras.strokePath();
      this.tweens.add({ targets: kras, alpha: 0, duration: 1200, onComplete: () => kras.destroy() });
      const hart = this.add.graphics().setDepth(13);
      hart.fillStyle(0xff6b9d, 1); hart.fillCircle(-4, 0, 5); hart.fillCircle(4, 0, 5); hart.fillTriangle(-9, 2, 9, 2, 0, 13);
      hart.setPosition(priet.x + 6, GROND - 80);
      this.tweens.add({ targets: hart, y: hart.y - 30, alpha: 0, duration: 900 });
      this.tweens.add({ targets: priet, y: GROND - 60, duration: 250, yoyo: true, repeat: 2, ease: 'Quad.out' });
      Voice.cue('cheer'); SFX.giggle();
    });

    // 12.5s: vanzelf naar de letter-kaart.
    T(12500, () => this.startSpel());
  }

  startSpel() {
    if (this.klaar) return;
    this.klaar = true;
    setSetting('letterIntroGezien', true);
    SFX.click();
    this.cameras.main.fadeOut(350, 8, 16, 26);
    this.time.delayedCall(360, () => this.scene.start('LetterMap'));
  }
}
