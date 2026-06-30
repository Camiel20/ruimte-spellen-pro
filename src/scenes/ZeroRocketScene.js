import Phaser from 'phaser';
import { SFX, initAudio } from '../sound.js';
import { Voice } from '../voice.js';
import { addStars, giveMedal } from '../progress.js';

// Nul-Raket — tik op +0 en je getal wordt 10x groter (een nul erbij): de
// raket vliegt hoger door steeds spannendere zones. Gemaakt voor Adrian, die
// dol is op nullen en grote getallen. Leerdoel: een nul erbij = 10x zo groot
// (machten van 10) + de namen van grote getallen.

const MAX = 18; // 1 met 18 nullen = triljoen

const NAMES = [
  'een', 'tien', 'honderd', 'duizend', 'tienduizend', 'honderdduizend',
  'miljoen', 'tienmiljoen', 'honderdmiljoen', 'miljard', 'tienmiljard',
  'honderdmiljard', 'biljoen', 'tienbiljoen', 'honderdbiljoen', 'biljard',
  'tienbiljard', 'honderdbiljard', 'triljoen',
];

// Per aantal nullen: een landmark + achtergrondkleuren (gras -> ruimte)
const ZONES = [
  { e: '🌱', l: 'De grond', t: 0x8fe1ff, b: 0xd7f5a8 },
  { e: '🏠', l: 'Boven het huis', t: 0x8fe1ff, b: 0xc3eca6 },
  { e: '🌳', l: 'Boven de bomen', t: 0x84d9ff, b: 0xb0e892 },
  { e: '🎈', l: 'Bij de ballonnen', t: 0x7cccff, b: 0xc9e8ff },
  { e: '☁️', l: 'In de wolken', t: 0x6db8f5, b: 0xd2ecff },
  { e: '🦅', l: 'Hoog in de lucht', t: 0x4f9fe6, b: 0xa6d3f5 },
  { e: '🌙', l: 'Bij de maan', t: 0x2a4a8a, b: 0x5a7fb8 },
  { e: '🛰️', l: 'Bij de satelliet', t: 0x16264f, b: 0x33477a },
  { e: '⭐', l: 'Tussen de sterren', t: 0x0c1430, b: 0x1e2a52 },
  { e: '🪐', l: 'Bij Saturnus', t: 0x0a0f28, b: 0x281a48 },
  { e: '☄️', l: 'Voorbij de komeet', t: 0x080a20, b: 0x351c40 },
  { e: '🌌', l: 'In de melkweg', t: 0x0a0820, b: 0x401c50 },
  { e: '✨', l: 'In de sterrenstof', t: 0x100828, b: 0x4c1c5e },
  { e: '🌠', l: 'Bij de vallende ster', t: 0x140a30, b: 0x581c6a },
  { e: '🔭', l: 'Verre sterrenstelsels', t: 0x180a38, b: 0x641c76 },
  { e: '👽', l: 'Buitenaards gebied', t: 0x1c0a40, b: 0x701c84 },
  { e: '🌀', l: 'Door een wormgat', t: 0x200a48, b: 0x7c1c92 },
  { e: '💫', l: 'Een andere melkweg', t: 0x240a50, b: 0x882ca0 },
  { e: '🚀', l: 'Het einde van het heelal!', t: 0x2a0a58, b: 0x9a3cb4 },
];

// Mijlpalen die sterren geven (eerste keer per sessie)
const REWARDS = { 6: 1, 9: 2, 12: 3, 18: 5 };

function dots(s) { return s.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }

export default class ZeroRocketScene extends Phaser.Scene {
  constructor() { super('ZeroRocket'); }

  create() {
    const { width, height } = this.scale;
    this.zeros = 0;
    this.rewarded = {};

    this.bg = this.add.graphics().setDepth(-10);
    this.twinkle = []; // sterretjes voor de ruimte-zones
    for (let i = 0; i < 40; i++) {
      const s = this.add.image(Phaser.Math.Between(0, width), Phaser.Math.Between(120, height - 120), 'star')
        .setAlpha(0).setScale(Phaser.Math.FloatBetween(0.3, 0.9)).setDepth(-9);
      this.twinkle.push(s);
    }

    // Landmark + zone-label (midden)
    this.landmark = this.add.text(width / 2, 250, '', { fontSize: '64px' }).setOrigin(0.5).setDepth(5);
    this.tweens.add({ targets: this.landmark, y: 238, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.zoneLabel = this.add.text(width / 2, 300, '', {
      fontFamily: 'Arial Black, Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(5).setStroke('#12203a', 5);

    // Raket
    this.rocket = this.add.container(width / 2, 470).setDepth(6);
    this.drawRocket(this.rocket);
    this.rocketBob = this.tweens.add({ targets: this.rocket, y: 458, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // Hoogtemeter (links)
    this.altBar = this.add.graphics().setDepth(4);

    // HUD-paneel + groot getal + nullen-teller
    const panel = this.add.graphics().setDepth(8);
    panel.fillStyle(0x12203a, 0.72);
    panel.fillRoundedRect(8, 6, width - 16, 150, 18);
    panel.lineStyle(2, 0xffffff, 0.18);
    panel.strokeRoundedRect(8, 6, width - 16, 150, 18);

    this.add.text(width / 2, 26, '🚀 Nul-Raket', {
      fontFamily: 'Arial Black, Arial', fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(9);

    this.numText = this.add.text(width / 2, 84, '1', {
      fontFamily: 'Arial Black, Arial', fontSize: '48px', fontStyle: 'bold', color: '#fde047',
    }).setOrigin(0.5).setDepth(9).setStroke('#16202b', 7);

    this.zeroText = this.add.text(width / 2, 128, '', {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#cbd5e1',
    }).setOrigin(0.5).setDepth(9);

    // Naam-pil (mijlpaal), net onder het paneel
    this.namePill = this.add.text(width / 2, 178, '', {
      fontFamily: 'Arial Black, Arial', fontSize: '20px', fontStyle: 'bold', color: '#1f2d3a',
      backgroundColor: '#fde047', padding: { x: 16, y: 6 },
    }).setOrigin(0.5).setDepth(9);

    this.buildButtons(width, height);

    // Voorlees-knop (op de titelregel, zodat het brede getal er niet tegenaan loopt)
    this.speaker = this.add.text(width - 18, 26, '🔊', { fontSize: '24px' })
      .setOrigin(1, 0.5).setDepth(20).setInteractive({ useHandCursor: true });
    this.speaker.on('pointerdown', () => Voice.cue('number', this.zeros + 1));

    const back = this.add.text(16, 16, '⬅ Terug', {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
      backgroundColor: '#1f2d3a', padding: { x: 10, y: 6 },
    }).setDepth(20).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => { SFX.click(); this.scene.start('Menu'); });

    this.setZone(0);
    this.updateNumber();
  }

  drawRocket(c) {
    const body = this.add.graphics();
    // romp
    body.fillStyle(0xf1f5f9, 1);
    body.fillRoundedRect(-16, -34, 32, 58, 14);
    // neus
    body.fillStyle(0xe8402c, 1);
    body.fillTriangle(-16, -22, 16, -22, 0, -52);
    // vinnen
    body.fillStyle(0xe8402c, 1);
    body.fillTriangle(-16, 8, -16, 28, -30, 30);
    body.fillTriangle(16, 8, 16, 28, 30, 30);
    // raam
    body.fillStyle(0x38b6cf, 1);
    body.fillCircle(0, -8, 9);
    body.lineStyle(3, 0x1f2d3a, 1);
    body.strokeCircle(0, -8, 9);
    body.fillStyle(0xffffff, 0.5);
    body.fillCircle(-3, -11, 3);
    // omtrek
    body.lineStyle(3, 0x1f2d3a, 1);
    body.strokeRoundedRect(-16, -34, 32, 58, 14);
    c.add(body);
  }

  buildButtons(width, height) {
    // Grote +0 knop (Numberblocks-kubus)
    const bx = width / 2, by = height - 70;
    const c = this.add.container(bx, by).setDepth(15);
    const g = this.add.graphics();
    g.fillStyle(0x57b947, 1);
    g.fillRoundedRect(-90, -42, 180, 84, 18);
    g.fillStyle(0xffffff, 0.3);
    g.fillRoundedRect(-84, -38, 168, 26, 12);
    g.lineStyle(4, 0x1f2d3a, 1);
    g.strokeRoundedRect(-90, -42, 180, 84, 18);
    const t = this.add.text(0, 0, '+0 🚀', {
      fontFamily: 'Arial Black, Arial', fontSize: '34px', fontStyle: 'bold', color: '#16202b',
    }).setOrigin(0.5);
    c.add([g, t]);
    const hit = this.add.rectangle(0, 0, 180, 84, 0, 0).setInteractive({ useHandCursor: true });
    c.add(hit);
    hit.on('pointerdown', () => {
      this.tweens.add({ targets: c, scale: 0.92, duration: 70, yoyo: true });
      this.addZero();
    });

    // Kleine −0 en reset
    this.roundBtn(70, by, '−0', 0xf08a24, () => this.removeZero());
    this.roundBtn(width - 70, by, '↺', 0x6b7b8a, () => this.reset());
  }

  roundBtn(x, y, label, color, fn) {
    const c = this.add.container(x, y).setDepth(15);
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillRoundedRect(-32, -30, 64, 60, 14);
    g.fillStyle(0xffffff, 0.3);
    g.fillRoundedRect(-28, -27, 56, 18, 9);
    g.lineStyle(3, 0x1f2d3a, 1);
    g.strokeRoundedRect(-32, -30, 64, 60, 14);
    const t = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black, Arial', fontSize: '24px', fontStyle: 'bold', color: '#16202b',
    }).setOrigin(0.5);
    c.add([g, t]);
    const hit = this.add.rectangle(0, 0, 64, 60, 0, 0).setInteractive({ useHandCursor: true });
    c.add(hit);
    hit.on('pointerdown', () => { this.tweens.add({ targets: c, scale: 0.9, duration: 70, yoyo: true }); fn(); });
  }

  addZero() {
    initAudio();
    if (this.zeros >= MAX) { this.maxParty(); return; }
    this.zeros++;
    SFX.grow(Math.min(this.zeros + 1, 8) + Math.floor(this.zeros / 4));
    this.thrust();
    this.setZone(this.zeros);
    this.updateNumber();
    this.floatText('×10', this.scale.width / 2 + 90, 84, '#fde047');
    this.showName(true);
    Voice.cue('number', this.zeros + 1);
    // beloning bij mijlpalen (eenmalig per sessie)
    if (REWARDS[this.zeros] && !this.rewarded[this.zeros]) {
      this.rewarded[this.zeros] = true;
      addStars(REWARDS[this.zeros]);
      SFX.fanfare();
      this.confetti();
      this.floatText(`+${REWARDS[this.zeros]} ⭐`, this.scale.width / 2, 150, '#fbbf24');
    }
  }

  removeZero() {
    if (this.zeros <= 0) return;
    this.zeros--;
    SFX.shrink();
    this.setZone(this.zeros);
    this.updateNumber();
    this.showName(false);
  }

  reset() {
    if (this.zeros === 0) return;
    SFX.click();
    this.zeros = 0;
    this.setZone(0);
    this.updateNumber();
    this.showName(false);
  }

  thrust() {
    // vlam + duw omhoog
    const r = this.rocket;
    this.rocketBob.pause();
    const baseY = 470;
    r.y = baseY;
    this.tweens.add({ targets: r, y: baseY - 36, duration: 140, yoyo: true, ease: 'Quad.easeOut',
      onComplete: () => { r.y = baseY; this.rocketBob.resume(); } });
    const flame = this.add.particles(r.x, r.y + 28, 'star', {
      speedY: { min: 120, max: 260 }, speedX: { min: -40, max: 40 },
      scale: { start: 1.2, end: 0 }, lifespan: 400, quantity: 4,
      tint: [0xfde047, 0xf97316, 0xe8402c], blendMode: 'ADD',
    }).setDepth(5);
    this.time.delayedCall(220, () => { flame.stop(); this.time.delayedCall(420, () => flame.destroy()); });
  }

  setZone(z) {
    const zone = ZONES[Math.min(z, ZONES.length - 1)];
    const { width, height } = this.scale;
    this.bg.clear();
    this.bg.fillGradientStyle(zone.t, zone.t, zone.b, zone.b, 1);
    this.bg.fillRect(0, 0, width, height);

    // sterretjes feller naarmate je hoger komt (vanaf de wolken)
    const starAlpha = Phaser.Math.Clamp((z - 4) / 6, 0, 0.9);
    this.twinkle.forEach((s) => s.setAlpha(starAlpha * Phaser.Math.FloatBetween(0.4, 1)));

    this.landmark.setText(zone.e);
    this.zoneLabel.setText(zone.l);
    this.tweens.add({ targets: this.landmark, scale: { from: 1.3, to: 1 }, duration: 260, ease: 'Back.easeOut' });

    // hoogtemeter
    this.altBar.clear();
    const x = 18, top = 220, h = 380;
    this.altBar.fillStyle(0x000000, 0.25);
    this.altBar.fillRoundedRect(x, top, 12, h, 6);
    const fill = h * (z / MAX);
    this.altBar.fillStyle(0xfde047, 0.95);
    this.altBar.fillRoundedRect(x, top + h - fill, 12, fill, 6);
  }

  updateNumber() {
    const numStr = this.zeros === 0 ? '1' : '1' + '0'.repeat(this.zeros);
    this.numText.setFontSize(48);
    this.numText.setText(dots(numStr));
    const maxW = this.scale.width - 60;
    if (this.numText.width > maxW) this.numText.setFontSize(Math.floor(48 * maxW / this.numText.width));
    this.zeroText.setText(this.zeros === 0 ? 'nog geen nullen' : `0️⃣ ${this.zeros} ${this.zeros === 1 ? 'nul' : 'nullen'}`);
  }

  showName(pop) {
    this.namePill.setText(NAMES[this.zeros] + '!');
    if (pop) this.tweens.add({ targets: this.namePill, scale: { from: 1.25, to: 1 }, duration: 280, ease: 'Back.easeOut' });
  }

  maxParty() {
    SFX.win();
    this.confetti();
    if (!this.rewarded.medal) { this.rewarded.medal = true; giveMedal('rocket_max'); }
    this.floatText('🏆 Het hele heelal door!', this.scale.width / 2, 360, '#fde047');
    Voice.cue('cheer');
  }

  confetti() {
    const { width } = this.scale;
    const p = this.add.particles(width / 2, 60, 'star', {
      x: { min: 0, max: width }, y: -10,
      speedY: { min: 120, max: 320 }, scale: { start: 1.5, end: 0 }, lifespan: 1900, quantity: 3,
      tint: [0xe8402c, 0xf6c624, 0x57b947, 0x38b6cf, 0xec6aa9], blendMode: 'ADD',
    }).setDepth(30);
    this.time.delayedCall(1900, () => p.destroy());
  }

  floatText(txt, x, y, color) {
    const t = this.add.text(x, y, txt, {
      fontFamily: 'Arial Black, Arial', fontSize: '22px', fontStyle: 'bold', color,
    }).setOrigin(0.5).setDepth(40).setStroke('#16202b', 4);
    this.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 1000, onComplete: () => t.destroy() });
  }

}
