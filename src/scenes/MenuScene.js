import Phaser from 'phaser';
import { SFX, initAudio, toggleSound, isSoundOn } from '../sound.js';
import { getStars, getMedalCount, getSetting } from '../progress.js';
import { startMusic } from '../music.js';

export default class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    const { width, height } = this.scale;
    startMusic();
    this.input.once('pointerdown', () => { initAudio(); startMusic(); });

    this.buildBackground(width, height);
    this.buildHeader(width);
    this.buildGrid(width);
    this.buildControls(width);
    this.scheduleShootingStar(width, height);
  }

  buildBackground(width, height) {
    const bg = this.add.graphics().setDepth(0);
    bg.fillGradientStyle(0x04081a, 0x04081a, 0x0a1228, 0x0a1228, 1);
    bg.fillRect(0, 0, width, height);

    const neb = this.add.graphics().setDepth(1);
    [
      [width * 0.12, height * 0.15, 200, 0x4c1d95, 0.55],
      [width * 0.88, height * 0.32, 230, 0x1e3a8a, 0.45],
      [width * 0.55, height * 0.75, 280, 0x7c1d54, 0.4],
      [width * 0.05, height * 0.68, 160, 0x064e3b, 0.35],
    ].forEach(([x, y, r, c, a]) => {
      for (let i = 7; i > 0; i--) {
        neb.fillStyle(c, a * (i / 7) * 0.2);
        neb.fillCircle(x, y, r * (i / 7));
      }
    });

    // Sterren in 3 lagen
    [[70, 0.35, 0.5], [40, 0.7, 1.0], [20, 1.0, 1.8]].forEach(([count, alpha, size]) => {
      for (let i = 0; i < count; i++) {
        const s = this.add.image(
          Phaser.Math.Between(0, width),
          Phaser.Math.Between(0, height),
          'star'
        ).setAlpha(Phaser.Math.FloatBetween(alpha * 0.3, alpha)).setScale(size).setDepth(2);
        this.tweens.add({
          targets: s, alpha: Phaser.Math.FloatBetween(0.05, alpha * 0.25),
          duration: Phaser.Math.Between(900, 3000),
          delay: Phaser.Math.Between(0, 2500),
          yoyo: true, repeat: -1,
        });
      }
    });

    // Zwevende achtergrond-planeten
    [
      { t: '🪐', x: width * 0.88, y: height * 0.09, sz: 50, dy: 16, dur: 4200 },
      { t: '🌙', x: width * 0.1,  y: height * 0.16, sz: 36, dy: 12, dur: 3600 },
      { t: '⭐', x: width * 0.94, y: height * 0.70, sz: 30, dy: 10, dur: 3000 },
      { t: '☄️', x: width * 0.07, y: height * 0.63, sz: 28, dy: 14, dur: 3900 },
    ].forEach(({ t, x, y, sz, dy, dur }) => {
      const p = this.add.text(x, y, t, { fontSize: `${sz}px` })
        .setOrigin(0.5).setDepth(2).setAlpha(0.5);
      this.tweens.add({ targets: p, y: y - dy, duration: dur, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.tweens.add({ targets: p, angle: 360, duration: dur * 5, repeat: -1 });
    });
  }

  buildHeader(width) {
    const title = this.add.text(width / 2, 36, '🚀 RUIMTE SPELLEN', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '30px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(10);
    title.setShadow(0, 0, '#a855f7', 22, true, true);
    this.tweens.addCounter({
      from: 0, to: 360, duration: 5000, repeat: -1,
      onUpdate: (tw) => title.setTint(
        Phaser.Display.Color.HSVToRGB(tw.getValue() / 360, 0.5, 1).color
      ),
    });
    this.tweens.add({ targets: title, y: 32, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    const childName = getSetting('childName') || 'Adrian';
    const nameTxt = this.add.text(width / 2, 72, `💖 ${childName} 💖`, {
      fontFamily: 'Arial', fontSize: '17px', fontStyle: 'bold', color: '#f9a8d4',
    }).setOrigin(0.5).setDepth(10);
    this.tweens.add({ targets: nameTxt, alpha: 0.5, duration: 1600, yoyo: true, repeat: -1 });

    const stars = getStars();
    const medals = getMedalCount();
    const badge = this.add.text(width / 2, 100, `⭐ ${stars}   🏅 ${medals}`, {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#fbbf24',
      backgroundColor: '#0e143099', padding: { x: 18, y: 7 },
    }).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });
    badge.on('pointerdown', () => { SFX.click(); this.scene.start('Awards'); });
    this.tweens.add({ targets: badge, scale: 1.06, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  buildGrid(width) {
    const GAMES = [
      { icon: '🧮', name: 'Ruimte Rekenen',  color: 0x3b82f6, go: () => this.scene.start('Diff') },
      { icon: '✏️', name: 'Schrijven',        color: 0xf97316, go: () => this.scene.start('TraceMenu') },
      { icon: '🎈', name: 'Ballon Merge',     color: 0xa855f7, go: () => this.scene.start('Balloon') },
      { icon: '🪐', name: 'Planeet Tikker',   color: 0xeab308, go: () => this.scene.start('Clicker') },
      { icon: '🏃', name: 'Ruimte Avontuur',  color: 0xef4444, go: () => this.scene.start('Platform', { level: 0 }) },
      { icon: '🎹', name: 'Regenboog Piano',  color: 0xec4899, go: () => this.scene.start('Piano') },
      { icon: '🚗', name: 'Stad Rijden',      color: 0x22c55e, go: () => this.scene.start('City') },
      { icon: '🧱', name: 'Getallen Toren',   color: 0x14b8a6, go: () => this.scene.start('NumberTower') },
      { icon: '🐍', name: '3D Snake',         color: 0x06b6d4, go: () => this.launchSnake() },
    ];

    const cardW = 213, cardH = 125, gapX = 8, gapY = 8;
    const startX = (width - cardW * 2 - gapX) / 2 + cardW / 2;
    const startY = 198;

    GAMES.forEach((game, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = startX + col * (cardW + gapX);
      const y = startY + row * (cardH + gapY);
      this.makeGameTile(x, y, cardW, cardH, game, i);
    });
  }

  makeGameTile(x, y, w, h, { icon, name, color, go }, index) {
    const topH = Math.round(h * 0.56);
    const botH = h - topH;
    const r = 16;

    const container = this.add.container(x, y + 28).setDepth(5).setAlpha(0);

    // Pulserende gloed-ring buiten de kaart
    const glowRing = this.add.graphics();
    glowRing.lineStyle(7, color, 0.6);
    glowRing.strokeRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, r + 4);
    glowRing.fillStyle(color, 0.08);
    glowRing.fillRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, r + 4);

    // Gekleurde bovenkant (icon-zone)
    const topBg = this.add.graphics();
    topBg.fillStyle(color, 0.3);
    topBg.fillRoundedRect(-w / 2, -h / 2, w, topH + r, { tl: r, tr: r, bl: 0, br: 0 });
    topBg.lineStyle(1.5, color, 0.55);
    topBg.strokeRoundedRect(-w / 2, -h / 2, w, h, r);

    // Donkere onderkant (naam-zone)
    const botBg = this.add.graphics();
    botBg.fillStyle(0x060c22, 0.92);
    botBg.fillRoundedRect(-w / 2, -h / 2 + topH, w, botH, { tl: 0, tr: 0, bl: r, br: r });

    // Glans-highlight bovenin
    const shine = this.add.graphics();
    shine.fillStyle(0xffffff, 0.08);
    shine.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, topH * 0.4, { tl: r - 2, tr: r - 2, bl: 0, br: 0 });

    // Groot emoji-icoon
    const iconTxt = this.add.text(0, -h / 2 + topH * 0.5, icon, {
      fontSize: '44px',
    }).setOrigin(0.5);

    // Spelnaam
    const nameTxt = this.add.text(0, -h / 2 + topH + botH * 0.45, name, {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);

    // Kleur-accent-streepje onderaan
    const accent = this.add.graphics();
    accent.fillStyle(color, 0.8);
    accent.fillRoundedRect(-w / 2 + 22, h / 2 - 6, w - 44, 3, 2);

    const hit = this.add.rectangle(0, 0, w, h, 0, 0).setInteractive({ useHandCursor: true });

    container.add([glowRing, topBg, botBg, shine, iconTxt, nameTxt, accent, hit]);

    // Inschuif-animatie
    this.tweens.add({
      targets: container, alpha: 1, y, duration: 420,
      delay: index * 55, ease: 'Back.easeOut',
    });

    // Pulserende gloed
    this.tweens.add({
      targets: glowRing,
      alpha: { from: 1, to: 0.2 },
      duration: 1200 + index * 110,
      yoyo: true, repeat: -1, ease: 'Sine.inOut',
    });

    // Icoon zachtjes wippen
    this.tweens.add({
      targets: iconTxt,
      y: -h / 2 + topH * 0.5 - 5,
      duration: 1500 + index * 80,
      yoyo: true, repeat: -1, ease: 'Sine.inOut',
    });

    // Hover/tap gedrag
    hit.on('pointerover', () => {
      this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 130, ease: 'Back.easeOut' });
    });
    hit.on('pointerout', () => {
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 130 });
    });
    hit.on('pointerdown', () => {
      initAudio();
      SFX.click();
      this.tweens.add({ targets: container, scale: 0.92, duration: 80, yoyo: true });
      this.time.delayedCall(130, go);
    });
  }

  buildControls(width) {
    this.soundBtn = this.add.text(width - 16, 14, isSoundOn() ? '🔊' : '🔇', { fontSize: '26px' })
      .setOrigin(1, 0).setDepth(20).setInteractive({ useHandCursor: true });
    this.soundBtn.on('pointerdown', () => this.soundBtn.setText(toggleSound() ? '🔊' : '🔇'));

    const gear = this.add.text(16, 14, '⚙️', { fontSize: '26px' })
      .setOrigin(0, 0).setDepth(20).setInteractive({ useHandCursor: true });
    gear.on('pointerdown', () => { SFX.click(); this.scene.start('Settings'); });
  }

  scheduleShootingStar(width, height) {
    const shoot = () => {
      if (!this.scene.isActive('Menu')) return;
      const sx = Phaser.Math.Between(0, width * 0.7);
      const sy = Phaser.Math.Between(0, height * 0.45);
      const len = Phaser.Math.Between(55, 95);
      const trail = this.add.graphics().setDepth(8);
      trail.fillStyle(0xffffff, 1);
      trail.fillRect(0, -1, len, 2);
      trail.setPosition(sx, sy).setAlpha(0).setAngle(28);
      this.tweens.add({
        targets: trail,
        x: sx + len * 2, y: sy + len * 0.95,
        alpha: { from: 0.95, to: 0 },
        duration: Phaser.Math.Between(350, 520),
        ease: 'Quad.easeIn',
        onComplete: () => {
          trail.destroy();
          this.time.delayedCall(Phaser.Math.Between(2000, 6500), shoot);
        },
      });
    };
    this.time.delayedCall(Phaser.Math.Between(600, 2500), shoot);
  }

  launchSnake() {
    const canvas = this.game.canvas;
    const loading = this.add.text(this.scale.width / 2, this.scale.height / 2, '3D laden... 🐍', {
      fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', color: '#fff',
    }).setOrigin(0.5).setDepth(100);
    import('../snake3d.js').then(({ launchSnake3D }) => {
      loading.destroy();
      canvas.style.display = 'none';
      launchSnake3D(() => {
        canvas.style.display = 'block';
        this.scene.restart();
      });
    });
  }
}
