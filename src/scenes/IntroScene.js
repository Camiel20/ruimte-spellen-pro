// ===== INTRO — het verhaal, zonder één woord =====
// Eén keer, bij de allereerste start van Getallen-Land: een vrolijke vallei
// vol tellende vriendjes… tot Baron Grauw voorbij zweeft en alle kleur grijs
// zuigt. Alleen Nul blijft vrolijk (van niks kun je niks afpakken!) en samen
// met Één ga je op pad. Woordeloos — een kind van 5 snapt het plaatje.
// Tikken = overslaan. Daarna nooit meer (progress: settings.introGezien).

import Phaser from 'phaser';
import { SFX, initAudio } from '../sound.js';
import { Voice } from '../voice.js';
import { stopMusic } from '../music.js';
import { setSetting } from '../progress.js';
import { sig, darker } from '../adventure/palette.js';
import { drawCubeStack, addNumberDisc, addFeet } from '../adventure/art.js';

export default class IntroScene extends Phaser.Scene {
  constructor() { super('Intro'); }

  create() {
    initAudio();
    stopMusic();
    const W = this.scale.width, H = this.scale.height;
    this.klaar = false;
    const GROND = 640;

    // --- de vrolijke vallei -------------------------------------------------
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x8fd3ff, 0x8fd3ff, 0xbfe8ff, 0xbfe8ff, 1);
    sky.fillRect(0, 0, W, H);
    const zon = this.add.container(W - 80, 110);
    const zg = this.add.graphics();
    zg.fillStyle(0xfff3b0, 0.4); zg.fillCircle(0, 0, 52);
    zg.fillStyle(0xffe16b, 1); zg.fillCircle(0, 0, 32);
    zon.add(zg);
    const gras = this.add.graphics();
    gras.fillStyle(0x8ed36b, 1); gras.fillRect(0, GROND, W, H - GROND);
    gras.fillStyle(0x57b947, 1); gras.fillRect(0, GROND, W, 14);
    for (const [fx, fy] of [[60, 700], [180, 740], [320, 690], [430, 745]]) {
      gras.fillStyle(0xff6b9d, 1); gras.fillCircle(fx, fy, 5);
      gras.fillStyle(0xffe16b, 1); gras.fillCircle(fx, fy, 2.2);
    }

    // --- de vriendjes (2, 3, 5) + Één ---------------------------------------
    const maakVriendje = (v, x) => {
      const c = this.add.container(x, 0);
      const { totalH } = drawCubeStack(this, c, v, { w: 34, cell: 34, color: sig(v), eyeR: 6, eyeX: 8, pupilR: 2.6, mouthR: 6, faceStroke: 2 });
      addNumberDisc(this, c, v, -totalH / 2 - 12, 10, '12px');
      c.y = GROND - totalH / 2;
      c._h = totalH;
      this.tweens.add({ targets: c, y: c.y - 6, duration: 800 + v * 120, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      return c;
    };
    const vriendjes = [maakVriendje(2, 120), maakVriendje(3, 240), maakVriendje(5, 380)];

    const een = this.add.container(60, 0);
    const eenStack = drawCubeStack(this, een, 1, { w: 40, cell: 40, color: sig(1) });
    addFeet(this, een, darker(sig(1), 40), 40, eenStack.totalH);
    addNumberDisc(this, een, 1, eenStack.top - 10, 11, '13px');
    een.y = GROND - eenStack.totalH / 2 - 4;

    // --- overslaan/verder-knop (géén tekst nodig: grote groene ▶) -----------
    const knop = this.add.container(W / 2, H - 70).setDepth(50);
    const kg = this.add.graphics();
    kg.fillStyle(0x2fae4e, 1); kg.fillCircle(0, 0, 36);
    kg.lineStyle(4, 0x1f7a36, 1); kg.strokeCircle(0, 0, 36);
    knop.add([kg, this.add.text(2, 0, '▶', { fontSize: '30px', color: '#ffffff' }).setOrigin(0.5)]);
    this.tweens.add({ targets: knop, scale: 1.1, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.input.once('pointerdown', () => this.startSpel());

    Voice.cue('welcome');

    // --- Baron Grauw komt aanzweven -----------------------------------------
    const grauw = this.add.container(W + 120, 250).setDepth(10);
    const gg = this.add.graphics();
    // wolkje waar hij op zweeft
    gg.fillStyle(0x6c7178, 0.85); gg.fillEllipse(0, 74, 110, 30); gg.fillEllipse(-34, 66, 60, 24); gg.fillEllipse(36, 66, 60, 24);
    // cape
    gg.fillStyle(0x4a4f55, 1); gg.fillTriangle(-30, -40, 30, -40, 44, 58);
    // lijf: lange grijze heer
    gg.fillStyle(0x7d838c, 1); gg.fillRoundedRect(-28, -66, 56, 128, 12);
    gg.fillStyle(0x6c7178, 1); gg.fillRoundedRect(-28, 44, 56, 18, 12);
    gg.lineStyle(3.5, 0x4a4f55, 1); gg.strokeRoundedRect(-28, -66, 56, 128, 12);
    // hoge hoed
    gg.fillStyle(0x2b2f34, 1); gg.fillRect(-30, -78, 60, 8); gg.fillRoundedRect(-18, -112, 36, 38, 4);
    grauw.add(gg);
    // boos gezicht + monocle (goud)
    grauw.add(this.add.circle(-10, -44, 7, 0xffffff).setStrokeStyle(2, 0x2b2f34));
    const mono = this.add.circle(12, -44, 9, 0xffffff).setStrokeStyle(2.5, 0xd9a821);
    grauw.add(mono);
    grauw.add(this.add.circle(-10, -43, 3, 0x2b2f34));
    grauw.add(this.add.circle(12, -43, 3, 0x2b2f34));
    const mond = this.add.graphics();
    mond.lineStyle(3, 0x2b2f34, 1); mond.beginPath(); mond.arc(0, -18, 9, 1.15 * Math.PI, 1.85 * Math.PI); mond.strokePath();
    grauw.add(mond);
    this.tweens.add({ targets: grauw, y: 242, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // --- de grijze waas + grijze hoezen over de vriendjes --------------------
    const waas = this.add.graphics().setDepth(5).setAlpha(0);
    waas.fillStyle(0x8a8f96, 0.45); waas.fillRect(0, 0, W, H);
    const hoezen = vriendjes.map((f) => {
      const hoes = this.add.graphics().setDepth(6).setAlpha(0);
      hoes.fillStyle(0x9aa0a6, 0.92);
      hoes.fillRoundedRect(f.x - 19, GROND - f._h - 2, 38, f._h + 2, 8);
      return hoes;
    });

    // --- het verhaal (tijdlijn) ----------------------------------------------
    const T = (ms, fn) => this.time.delayedCall(ms, () => { if (!this.klaar) fn(); });
    // 2s: Grauw zweeft binnen
    T(1800, () => {
      this.tweens.add({ targets: grauw, x: W - 120, duration: 1600, ease: 'Sine.out' });
      Voice.cue('oops'); SFX.oops();
    });
    // 4.2s: hij lacht — en de kleur verdwijnt
    T(4200, () => {
      this.tweens.add({ targets: grauw, scaleX: 1.1, scaleY: 0.92, duration: 160, yoyo: true, repeat: 2 });
      Voice.cue('laugh');
      this.tweens.add({ targets: waas, alpha: 1, duration: 1400 });
      hoezen.forEach((hoes, i) => this.tweens.add({ targets: hoes, alpha: 1, duration: 900, delay: 300 + i * 350 }));
      // vriendjes zakken verdrietig in elkaar
      vriendjes.forEach((f, i) => {
        this.tweens.killTweensOf(f);
        this.tweens.add({ targets: f, angle: i % 2 ? 5 : -5, scaleY: 0.94, y: f.y + 5, duration: 700, delay: 300 + i * 350 });
      });
      SFX.shrink();
    });
    // 7s: Grauw vertrekt, tevreden
    T(7000, () => {
      this.tweens.add({ targets: grauw, x: -160, y: 180, duration: 2000, ease: 'Sine.in' });
    });
    // 8.2s: Nul stuitert binnen — de enige die nog vrolijk is!
    T(8200, () => {
      const nul = this.add.container(-30, GROND - 20).setDepth(12);
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
      nul.add(this.add.circle(0, -27, 9, 0xffffff).setStrokeStyle(2, 0x16202b));
      nul.add(this.add.text(0, -27, '0', { fontFamily: 'Arial Black, Arial', fontSize: '12px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5));
      // huppelend naar Één toe
      this.tweens.add({ targets: nul, x: een.x + 52, duration: 1400, ease: 'Sine.inOut' });
      this.tweens.add({ targets: nul, y: GROND - 46, duration: 350, yoyo: true, repeat: 3, ease: 'Quad.out' });
      Voice.cue('greet'); SFX.giggle();
      // hartje + Één springt vastberaden op (1,6s nadat Nul binnenkwam)
      this.time.delayedCall(1600, () => {
        if (this.klaar) return;
        const hart = this.add.graphics().setDepth(13);
        hart.fillStyle(0xff6b9d, 1); hart.fillCircle(-4, 0, 5); hart.fillCircle(4, 0, 5); hart.fillTriangle(-9, 2, 9, 2, 0, 13);
        hart.x = een.x + 26; hart.y = GROND - 90;
        this.tweens.add({ targets: hart, y: hart.y - 30, alpha: 0, duration: 900 });
        this.tweens.add({ targets: een, y: een.y - 30, duration: 220, yoyo: true, repeat: 2, ease: 'Quad.out' });
        Voice.cue('cheer'); SFX.yay();
      });
    });
    // 12.5s: vanzelf naar de wereldkaart
    T(12500, () => this.startSpel());
  }

  startSpel() {
    if (this.klaar) return;
    this.klaar = true;
    setSetting('introGezien', true); // nooit meer opnieuw
    SFX.click();
    this.cameras.main.fadeOut(350, 8, 16, 26);
    this.time.delayedCall(360, () => this.scene.start('WorldMap'));
  }
}
