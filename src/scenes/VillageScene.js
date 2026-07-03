import Phaser from 'phaser';
import { SFX, initAudio } from '../sound.js';
import { Voice } from '../voice.js';
import { startMusic } from '../music.js';
import { getLevelRecord } from '../progress.js';
import { sig, darker } from '../adventure/palette.js';
import { drawAwakeFriendInto } from '../adventure/art.js';
import { ROSTER, rescuedFrom, rescueInfo } from '../adventure/roster.js';
import { LEVELS } from '../levels/index.js';

// ===== HET GETALLEN-DORPJE =====
// De verzamel-hub: elk gered vriendje (afgeleid uit je level-voortgang, zie
// adventure/roster.js) woont hier in z'n eigen huisje. Nog-niet-geredde
// getallen zijn grijze huisjes met een "?" — tik erop en je hoort/ziet in
// welk level je dat vriendje kunt redden. Zo is er altijd een reden om
// verder te spelen: "red ze allemaal!"

// Vaste plekjes voor de huisjes (1 t/m 10 + Twintig), kronkelend door de wei.
const PLOTS = [
  [90, 235], [245, 215], [395, 240],
  [85, 400], [240, 380], [395, 405],
  [90, 565], [245, 545], [400, 570],
  [130, 720], [340, 725],
];

export default class VillageScene extends Phaser.Scene {
  constructor() { super('Village'); }

  create() {
    initAudio();
    startMusic('menu'); // rustig deuntje in het dorp
    const W = this.scale.width, H = this.scale.height;

    this.rescued = rescuedFrom(LEVELS, (id) => {
      const r = getLevelRecord(id);
      return !!(r && r.done);
    });

    this.buildBackground(W, H);
    this.buildPath();
    ROSTER.forEach((n, i) => this.buildPlot(n, PLOTS[i]));
    this.buildChrome(W, H);
  }

  // ---------------------------------------------------------------- decor
  buildBackground(W, H) {
    const g = this.add.graphics().setDepth(-20);
    g.fillGradientStyle(0x8fe1ff, 0x8fe1ff, 0xa9e07f, 0xa9e07f, 1);
    g.fillRect(0, 0, W, H);
    // zon
    g.fillStyle(0xffe66d, 0.5); g.fillCircle(W - 60, 138, 46);
    g.fillStyle(0xfff3a3, 0.95); g.fillCircle(W - 60, 138, 32);
    // wolkjes
    [[80, 150, 1], [300, 120, 1.2], [180, 660, 0.9]].forEach(([x, y, s]) => {
      const c = this.add.graphics().setDepth(-18);
      c.fillStyle(0xffffff, 0.85);
      c.fillCircle(x, y, 20 * s); c.fillCircle(x + 22 * s, y + 5 * s, 15 * s); c.fillCircle(x - 20 * s, y + 5 * s, 13 * s);
      this.tweens.add({ targets: c, x: 16 * s, duration: 5200 + 900 * s, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });
    // bloemetjes in de wei (vaste plekjes, buiten de huisjes)
    const fl = this.add.graphics().setDepth(-16);
    [[40, 300], [440, 320], [160, 470], [330, 300], [50, 640], [430, 650], [140, 760], [360, 745], [455, 480]].forEach(([x, y]) => {
      fl.fillStyle(0xff6b9d, 1); fl.fillCircle(x, y, 4);
      fl.fillStyle(0xffe16b, 1); fl.fillCircle(x, y, 1.8);
      fl.fillStyle(0x3f9d3f, 1); fl.fillRect(x - 1, y + 4, 2, 7);
    });
  }

  // Kronkelpaadje langs de huisjes (zelfde stijl als de wereldkaart).
  buildPath() {
    const g = this.add.graphics().setDepth(-10);
    g.lineStyle(7, 0xffffff, 0.7);
    for (let i = 0; i < PLOTS.length - 1; i++) {
      const [ax, ay] = PLOTS[i], [bx, by] = PLOTS[i + 1];
      const steps = 9, mx = (ax + bx) / 2;
      for (let s = 0; s < steps; s += 2) {
        const q = (t) => [
          Phaser.Math.Interpolation.QuadraticBezier(t, ax, mx, bx),
          Phaser.Math.Interpolation.QuadraticBezier(t, ay, (ay + by) / 2, by),
        ];
        const [x1, y1] = q(s / steps), [x2, y2] = q((s + 1) / steps);
        g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokePath();
      }
    }
  }

  // ---------------------------------------------------------------- huisjes
  buildPlot(n, [x, y]) {
    const isHome = this.rescued.has(n);
    const col = isHome ? sig(n) : 0x9aa0a6;
    const edge = isHome ? darker(col, 50) : 0x565b61;

    // Huisje in een container zodat het kan wiebelen bij een tik.
    const house = this.add.container(x, y).setDepth(5);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.14); g.fillEllipse(0, 38, 88, 12);
    g.fillStyle(col, 1); g.fillRoundedRect(-34, -18, 68, 54, 8);
    g.lineStyle(3, edge, 1); g.strokeRoundedRect(-34, -18, 68, 54, 8);
    g.fillStyle(edge, 1); g.fillTriangle(-43, -16, 43, -16, 0, -52);
    // deur + raampje
    g.fillStyle(darker(col, 45), 1); g.fillRoundedRect(-11, 8, 22, 28, { tl: 8, tr: 8, bl: 0, br: 0 });
    g.fillStyle(0xfff3b0, isHome ? 1 : 0.4); g.fillCircle(21, -2, 6);
    g.lineStyle(2, edge, 1); g.strokeCircle(21, -2, 6);
    house.add(g);
    // naambordje op het dak: het getal (of "?")
    const disc = this.add.circle(0, -34, 11, 0xffffff).setStrokeStyle(2.5, 0x16202b);
    const num = this.add.text(0, -34, isHome ? `${n}` : '?', {
      fontFamily: 'Arial Black, Arial', fontSize: '13px', fontStyle: 'bold',
      color: isHome ? '#16202b' : '#8a8f96',
    }).setOrigin(0.5);
    house.add([disc, num]);

    if (isHome) {
      // Het vriendje woont hier: buiten spelen! (zelfde look als bij de redding)
      const f = this.add.container(x + 46, y + 6).setDepth(6);
      drawAwakeFriendInto(this, f, n, sig(n));
      this.tweens.add({
        targets: f, y: y + 2, duration: 900 + (n % 4) * 140,
        yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: n * 90,
      });
      f.setSize(58, 84);
      f.setInteractive(new Phaser.Geom.Rectangle(-29, -44, 58, 84), Phaser.Geom.Rectangle.Contains);
      f.on('pointerdown', () => {
        SFX.giggle(); Voice.number(n);
        this.tweens.add({ targets: f, y: y - 22, duration: 180, yoyo: true, ease: 'Quad.out' });
        this.heart(f.x, f.y - 44);
        const info = rescueInfo(LEVELS, n);
        this.setHint(n === 1 ? 'Één — dat ben jij! 💪' : `${info ? info.name : n} woont hier! 🏠`);
      });
    } else {
      // Nog leeg: tik = hint waar je dit vriendje kunt redden.
      house.setSize(96, 100);
      house.setInteractive(new Phaser.Geom.Rectangle(-48, -58, 96, 100), Phaser.Geom.Rectangle.Contains);
      house.on('pointerdown', () => {
        SFX.click(); Voice.cue('greet');
        this.tweens.add({ targets: house, angle: 3, duration: 80, yoyo: true, repeat: 3 });
        const info = rescueInfo(LEVELS, n);
        this.setHint(info ? `Red ${info.name} in level ${info.id}! 🦸` : 'Dit huisje wacht op een nieuw avontuur! 🌟');
      });
    }
  }

  // ---------------------------------------------------------------- hud
  buildChrome(W, H) {
    const top = this.add.graphics().setScrollFactor(0).setDepth(50);
    top.fillStyle(0x16202b, 0.55); top.fillRoundedRect(8, 10, W - 16, 84, 16);
    const back = this.add.graphics().setScrollFactor(0).setDepth(51);
    back.fillStyle(0xffffff, 1); back.fillTriangle(40, 26, 40, 50, 22, 38); back.fillRect(40, 34, 12, 8);
    back.setInteractive(new Phaser.Geom.Rectangle(12, 16, 52, 46), Phaser.Geom.Rectangle.Contains);
    back.on('pointerdown', () => { SFX.click(); this.scene.start('WorldMap'); });
    this.add.text(W / 2, 34, '🏘️ Het Getallen-Dorpje', {
      fontFamily: 'Arial Black, Arial', fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(51).setStroke('#1f2d3a', 5);
    const count = this.rescued.size - 1, total = ROSTER.length - 1; // Één ben je zelf
    this.add.text(W / 2, 66, `Al ${count} van de ${total} vriendjes wonen hier!`, {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffe16b',
    }).setOrigin(0.5).setDepth(51).setStroke('#1f2d3a', 4);

    // hint-balkje onderaan
    this.hintText = this.add.text(W / 2, H - 18, 'Tik op een vriendje of een huisje!', {
      fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#16202b',
      backgroundColor: '#ffffffcc', padding: { x: 12, y: 5 },
    }).setOrigin(0.5).setDepth(51);
  }

  setHint(msg) {
    this.hintText.setText(msg);
    this.hintText.setScale(0.8);
    this.tweens.add({ targets: this.hintText, scale: 1, duration: 200, ease: 'Back.out' });
  }

  heart(x, y) {
    const g = this.add.graphics().setDepth(60);
    g.fillStyle(0xff6b9d, 1); g.fillCircle(-4, 0, 5); g.fillCircle(4, 0, 5); g.fillTriangle(-9, 2, 9, 2, 0, 13);
    g.x = x; g.y = y;
    this.tweens.add({ targets: g, y: y - 32, alpha: 0, scale: 1.4, duration: 800, ease: 'Quad.out', onComplete: () => g.destroy() });
  }
}
