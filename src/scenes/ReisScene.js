// ===== DE REIS — het verhaal-lijmstuk, zonder één woord =====
// Eén keer, bij de eerste start van een level in Wereld 7 of hoger: het land
// is gered en Baron Grauw is nu een vriend… maar zijn oude wolken-machine
// pruttelt nog! Ze hoest waas-wolkjes over de verre landen aan de horizon
// (pizza-berg, pannenkoeken-stapel, wc, reuzen-paddenstoel, billen-heuvel,
// zee). Grauw kijkt beschaamd — en Nul & Één gaan op reis om óók die landen
// weer op te vrolijken. Zo klopt de grauw-waas in W7-12 verhaal-technisch.
// Tikken = overslaan. Daarna nooit meer (settings.reisGezien).

import Phaser from 'phaser';
import { SFX, initAudio } from '../sound.js';
import { Voice } from '../voice.js';
import { stopMusic } from '../music.js';
import { setSetting } from '../progress.js';
import { sig, darker } from '../adventure/palette.js';
import { drawCubeStack, addNumberDisc, addFeet } from '../adventure/art.js';

export default class ReisScene extends Phaser.Scene {
  constructor() { super('Reis'); }

  init(data) { this.doelLevelIndex = data && data.levelIndex != null ? data.levelIndex : null; }

  create() {
    initAudio();
    stopMusic();
    const W = this.scale.width, H = this.scale.height;
    this.klaar = false;
    const GROND = 640;

    // --- de vallei, WEER IN KLEUR (het feest na Wereld 6) -------------------
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x8fd3ff, 0x8fd3ff, 0xbfe8ff, 0xbfe8ff, 1);
    sky.fillRect(0, 0, W, H);
    const zon = this.add.graphics();
    zon.fillStyle(0xfff3b0, 0.4); zon.fillCircle(W - 80, 110, 52);
    zon.fillStyle(0xffe16b, 1); zon.fillCircle(W - 80, 110, 32);
    const gras = this.add.graphics();
    gras.fillStyle(0x8ed36b, 1); gras.fillRect(0, GROND, W, H - GROND);
    gras.fillStyle(0x57b947, 1); gras.fillRect(0, GROND, W, 14);

    // --- de verre landen aan de horizon (mini-silhouetten) ------------------
    // pizza-berg · pannenkoeken-stapel · wc · paddenstoel · billen · zee
    const landen = [];
    const maakLand = (x, teken) => {
      const c = this.add.container(x, GROND - 6).setScale(0.9);
      const g = this.add.graphics();
      teken(g);
      c.add(g);
      landen.push(c);
      return c;
    };
    maakLand(40, (g) => { g.fillStyle(0xf0b24a, 1); g.fillTriangle(-16, 0, 16, 0, 0, -26); g.fillStyle(0xe8402c, 1); g.fillCircle(-4, -10, 2.5); g.fillCircle(5, -7, 2.5); });
    maakLand(105, (g) => { g.fillStyle(0xf3d9a4, 1); for (let i = 0; i < 3; i++) g.fillEllipse(0, -5 - i * 7, 30 - i * 4, 8); });
    maakLand(170, (g) => { g.fillStyle(0xffffff, 1); g.fillRoundedRect(-9, -22, 18, 22, 4); g.fillEllipse(0, -2, 24, 8); });
    maakLand(235, (g) => { g.fillStyle(0xe8402c, 1); g.fillEllipse(0, -18, 28, 14); g.fillStyle(0xf3e2c0, 1); g.fillRect(-4, -12, 8, 12); g.fillStyle(0xffffff, 1); g.fillCircle(-7, -19, 3); g.fillCircle(6, -16, 3); });
    maakLand(300, (g) => { g.fillStyle(0xf2b8a0, 1); g.fillCircle(-7, -8, 9); g.fillCircle(7, -8, 9); g.fillRect(-14, -8, 28, 8); });
    maakLand(365, (g) => { g.fillStyle(0x3fa9e0, 1); for (let i = 0; i < 3; i++) g.fillEllipse(-8 + i * 8, -4 - (i % 2) * 3, 12, 6); });

    // --- de vriendjes vieren feest (kleur is terug!) -------------------------
    const maakVriendje = (v, x) => {
      const c = this.add.container(x, 0);
      const { totalH } = drawCubeStack(this, c, v, { w: 30, cell: 30, color: sig(v), eyeR: 5, eyeX: 7, pupilR: 2.2, mouthR: 5, faceStroke: 2 });
      c.y = GROND - totalH / 2;
      this.tweens.add({ targets: c, y: c.y - 10, duration: 500 + v * 90, yoyo: true, repeat: -1, ease: 'Quad.out' });
      return c;
    };
    maakVriendje(2, 90); maakVriendje(3, 200);

    // --- Één en Nul (de helden) ----------------------------------------------
    const een = this.add.container(300, 0);
    const eenStack = drawCubeStack(this, een, 1, { w: 40, cell: 40, color: sig(1) });
    addFeet(this, een, darker(sig(1), 40), 40, eenStack.totalH);
    addNumberDisc(this, een, 1, eenStack.top - 10, 11, '13px');
    een.y = GROND - eenStack.totalH / 2 - 4;

    const nul = this.add.container(250, GROND - 20).setDepth(12);
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

    // --- Grauw (nu een vriend: paarse strepen!) + zijn oude machine ----------
    const grauw = this.add.container(W - 120, GROND - 90).setDepth(10);
    const gg = this.add.graphics();
    gg.fillStyle(0x4a4f55, 1); gg.fillTriangle(-26, -36, 26, -36, 38, 52);
    gg.fillStyle(0x7d838c, 1); gg.fillRoundedRect(-24, -58, 48, 112, 10);
    // paarse strepen: hij hoort er nu bij
    gg.fillStyle(0x9b6dd6, 0.85); gg.fillRect(-24, -30, 48, 8); gg.fillRect(-24, -6, 48, 8); gg.fillRect(-24, 18, 48, 8);
    gg.lineStyle(3, 0x4a4f55, 1); gg.strokeRoundedRect(-24, -58, 48, 112, 10);
    gg.fillStyle(0x2b2f34, 1); gg.fillRect(-26, -68, 52, 7); gg.fillRoundedRect(-15, -98, 30, 32, 4);
    grauw.add(gg);
    grauw.add(this.add.circle(-8, -40, 6, 0xffffff).setStrokeStyle(2, 0x2b2f34));
    grauw.add(this.add.circle(10, -40, 8, 0xffffff).setStrokeStyle(2.2, 0xd9a821));
    grauw.add(this.add.circle(-8, -39, 2.6, 0x2b2f34));
    grauw.add(this.add.circle(10, -39, 2.6, 0x2b2f34));
    const gmond = this.add.graphics(); // beschaamd mondje (klein streepje)
    gmond.lineStyle(2.5, 0x2b2f34, 1); gmond.beginPath(); gmond.moveTo(-6, -18); gmond.lineTo(6, -16); gmond.strokePath();
    grauw.add(gmond);

    // de oude wolken-machine: een grijze ketel met pruttel-pijp
    const machine = this.add.container(W - 55, GROND - 34).setDepth(9);
    const mg = this.add.graphics();
    mg.fillStyle(0x6c7178, 1); mg.fillRoundedRect(-26, -30, 52, 60, 10);
    mg.fillStyle(0x565b61, 1); mg.fillRoundedRect(-30, 22, 60, 10, 5);
    mg.lineStyle(3, 0x4a4f55, 1); mg.strokeRoundedRect(-26, -30, 52, 60, 10);
    mg.fillStyle(0x565b61, 1); mg.fillRoundedRect(-8, -52, 16, 24, 5); // de pijp
    mg.fillStyle(0x8a8f96, 1); mg.fillCircle(-10, -6, 7); mg.fillCircle(10, 4, 6); // klinknagels/wielen
    machine.add(mg);
    this.tweens.add({ targets: machine, angle: { from: -1.5, to: 1.5 }, duration: 300, yoyo: true, repeat: -1 }); // pruttelt

    // --- overslaan-knop (grote groene ▶) -------------------------------------
    const knop = this.add.container(W / 2, H - 70).setDepth(50);
    const kg = this.add.graphics();
    kg.fillStyle(0x2fae4e, 1); kg.fillCircle(0, 0, 36);
    kg.lineStyle(4, 0x1f7a36, 1); kg.strokeCircle(0, 0, 36);
    knop.add([kg, this.add.text(2, 0, '▶', { fontSize: '30px', color: '#ffffff' }).setOrigin(0.5)]);
    this.tweens.add({ targets: knop, scale: 1.1, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.input.once('pointerdown', () => this.startAvontuur());

    Voice.cue('cheer'); SFX.yay();

    // --- de tijdlijn ----------------------------------------------------------
    const T = (ms, fn) => this.time.delayedCall(ms, () => { if (!this.klaar) fn(); });

    // 1.8s: de machine hoest! Waas-wolkjes puffen richting de verre landen.
    T(1800, () => {
      SFX.oops(); Voice.cue('oops');
      landen.forEach((land, i) => {
        this.time.delayedCall(i * 420, () => {
          if (this.klaar) return;
          const puff = this.add.graphics().setDepth(11);
          puff.fillStyle(0x8a8f96, 0.85);
          puff.fillCircle(0, 0, 9); puff.fillCircle(9, -5, 7); puff.fillCircle(-8, -4, 6);
          puff.setPosition(machine.x, machine.y - 55);
          this.tweens.add({
            targets: puff, x: land.x, y: GROND - 40, duration: 900, ease: 'Sine.inOut',
            onComplete: () => {
              puff.destroy();
              // het landje wordt grauw…
              land.each((kind) => { if (kind.setAlpha) kind.setAlpha(0.45); });
              const hoes = this.add.graphics();
              hoes.fillStyle(0x9aa0a6, 0.6); hoes.fillEllipse(0, -12, 42, 34);
              land.add(hoes);
              SFX.shrink();
            },
          });
        });
      });
    });

    // 6s: Grauw kijkt beschaamd en wijst naar de machine (zweetdruppel).
    T(6000, () => {
      this.tweens.add({ targets: grauw, angle: -6, duration: 400, yoyo: true, repeat: 1 });
      const druppel = this.add.graphics().setDepth(11);
      druppel.fillStyle(0x7fd0f0, 0.95); druppel.fillCircle(0, 0, 5); druppel.fillTriangle(-5, -2, 5, -2, 0, -12);
      druppel.setPosition(grauw.x - 30, grauw.y - 60);
      this.tweens.add({ targets: druppel, y: druppel.y + 26, alpha: 0, duration: 900 });
      Voice.cue('yawn'); // verontschuldigend zuchtje
    });

    // 8s: Één springt vastberaden op; Nul huppelt — rugzakje om, op reis!
    T(8000, () => {
      this.tweens.add({ targets: een, y: een.y - 30, duration: 220, yoyo: true, repeat: 2, ease: 'Quad.out' });
      const rugzak = this.add.graphics().setDepth(12);
      rugzak.fillStyle(0xe8402c, 1); rugzak.fillRoundedRect(-9, -12, 18, 24, 6);
      rugzak.fillStyle(0xffe16b, 1); rugzak.fillRoundedRect(-6, -8, 12, 9, 3);
      rugzak.setPosition(een.x - 28, een.y);
      this._rugzak = rugzak;
      const hart = this.add.graphics().setDepth(13);
      hart.fillStyle(0xff6b9d, 1); hart.fillCircle(-4, 0, 5); hart.fillCircle(4, 0, 5); hart.fillTriangle(-9, 2, 9, 2, 0, 13);
      hart.setPosition(een.x + 26, GROND - 90);
      this.tweens.add({ targets: hart, y: hart.y - 30, alpha: 0, duration: 900 });
      Voice.cue('cheer'); SFX.yay();
    });

    // 10s: en daar gaan ze — naar rechts, de wijde wereld in!
    T(10000, () => {
      this.tweens.add({ targets: [een, nul, this._rugzak].filter(Boolean), x: '+=260', duration: 2200, ease: 'Sine.inOut' });
      this.tweens.add({ targets: nul, y: nul.y - 22, duration: 300, yoyo: true, repeat: 6, ease: 'Quad.out' });
      Voice.cue('whee');
    });

    // 13s: vanzelf het avontuur in.
    T(13000, () => this.startAvontuur());
  }

  startAvontuur() {
    if (this.klaar) return;
    this.klaar = true;
    setSetting('reisGezien', true); // nooit meer opnieuw
    SFX.click();
    this.cameras.main.fadeOut(350, 8, 16, 26);
    this.time.delayedCall(360, () => {
      if (this.doelLevelIndex != null) this.scene.start('Adventure', { levelIndex: this.doelLevelIndex });
      else this.scene.start('WorldMap');
    });
  }
}
