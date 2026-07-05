import Phaser from 'phaser';
import { SFX, initAudio, toggleSound, isSoundOn } from '../sound.js';
import { getStars, getMedalCount, getSetting } from '../progress.js';
import { startMusic } from '../music.js';
import { notePlay, startTimer, stopTimer } from '../stats.js';
import { maakNul } from '../theme.js';

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

    // Eénmalig bij opstarten: "Welkom terug, <naam> 🙂" (niet telkens je uit
    // een spel terugkeert — vlag in de registry geldt per app-sessie).
    if (!this.registry.get('welcomed')) {
      this.registry.set('welcomed', true);
      this.showWelcomeBack(width, height);
    }
  }

  showWelcomeBack(width, height) {
    const name = getSetting('childName') || 'Adrian';
    const banner = this.add.container(width / 2, height * 0.42).setDepth(100).setAlpha(0);

    const bg = this.add.graphics();
    bg.fillStyle(0x1f2d3a, 0.92); bg.fillRoundedRect(-190, -46, 380, 92, 20);
    bg.lineStyle(4, 0xffe16b, 1); bg.strokeRoundedRect(-190, -46, 380, 92, 20);
    const txt = this.add.text(0, 0, `Welkom terug,\n${name} 🙂`, {
      fontFamily: 'Arial Black, Arial', fontSize: '26px', fontStyle: 'bold',
      color: '#ffffff', align: 'center', lineSpacing: 4,
    }).setOrigin(0.5).setStroke('#0e1430', 5);
    banner.add([bg, txt]);
    banner.setScale(0.6);

    SFX.click();
    this.tweens.add({ targets: banner, alpha: 1, scale: 1, duration: 420, ease: 'Back.out' });
    this.tweens.add({
      targets: banner, alpha: 0, scale: 0.9, delay: 2000, duration: 500, ease: 'Quad.in',
      onComplete: () => banner.destroy(),
    });
  }

  buildBackground(width, height) {
    // Heldere Numberblocks-lucht (blauw naar gras-groen)
    const bg = this.add.graphics().setDepth(0);
    bg.fillGradientStyle(0x8fe1ff, 0x8fe1ff, 0xd7f5a8, 0xd7f5a8, 1);
    bg.fillRect(0, 0, width, height);

    // Zonnetje
    const sun = this.add.graphics().setDepth(1);
    sun.fillStyle(0xfff3a3, 0.9);
    sun.fillCircle(width - 56, 150, 40);
    sun.fillStyle(0xffe66d, 0.5);
    sun.fillCircle(width - 56, 150, 54);

    // Wolkjes
    [[70, 200, 1], [330, 150, 1.25], [120, 470, 0.9], [380, 560, 1.1], [220, 680, 1]].forEach(([x, y, s]) => {
      const cl = this.add.graphics().setDepth(1);
      cl.fillStyle(0xffffff, 0.8);
      cl.fillCircle(x, y, 22 * s);
      cl.fillCircle(x + 24 * s, y + 6 * s, 18 * s);
      cl.fillCircle(x - 22 * s, y + 6 * s, 16 * s);
      cl.fillRoundedRect(x - 30 * s, y, 60 * s, 16 * s, 8);
      this.tweens.add({ targets: cl, x: `+=${18 * s}`, duration: 6000 + 1500 * s, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });

    // Zwevende Numberblocks-kubusjes (1..9) met gezichtje
    const SIG = [0xe8402c, 0xf08a24, 0xf6c624, 0x57b947, 0x38b6cf, 0xec6aa9, 0x9b6dd6, 0x6b7b8a, 0x4f63c9];
    const spots = [
      [40, 320, 30], [width - 38, 300, 26], [60, 600, 24],
      [width - 46, 520, 30], [width - 40, 680, 22], [44, 720, 20],
    ];
    spots.forEach(([x, y, s], i) => {
      const col = SIG[i % SIG.length];
      const cube = this.add.container(x, y).setDepth(2).setAlpha(0.85);
      const g = this.add.graphics();
      g.fillStyle(col, 1);
      g.fillRoundedRect(-s / 2, -s / 2, s, s, 5);
      g.fillStyle(0xffffff, 0.3);
      g.fillRoundedRect(-s / 2 + 3, -s / 2 + 2, s - 6, s * 0.32, 4);
      g.lineStyle(2.5, 0x1f2d3a, 1);
      g.strokeRoundedRect(-s / 2, -s / 2, s, s, 5);
      const e = s * 0.16;
      [-e, e].forEach((dx) => {
        cube.add(this.add.circle(dx, -s * 0.05, s * 0.1, 0xffffff).setStrokeStyle(1.5, 0x1f2d3a));
        cube.add(this.add.circle(dx, -s * 0.03, s * 0.045, 0x1f2d3a));
      });
      cube.addAt(g, 0);
      this.tweens.add({ targets: cube, y: y - Phaser.Math.Between(14, 26), duration: Phaser.Math.Between(2600, 4200), yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.tweens.add({ targets: cube, angle: Phaser.Math.Between(-14, 14), duration: Phaser.Math.Between(3000, 5000), yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });
  }

  buildHeader(width) {
    // Het NUL & CO-logo: zwaaiende Nul-mascotte naast dikke witte letters
    const logo = this.add.container(width / 2, 46).setDepth(10);

    const stijl = {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '34px', fontStyle: 'bold', color: '#ffffff',
    };
    const t1 = this.add.text(0, 0, 'NUL', stijl).setOrigin(0, 0.5).setStroke('#1f2d3a', 8);
    const t2 = this.add.text(0, 0, '&', {
      ...stijl, fontSize: '26px', color: '#fbbf24',
    }).setOrigin(0, 0.5).setStroke('#1f2d3a', 7);
    const t3 = this.add.text(0, 0, 'CO', stijl).setOrigin(0, 0.5).setStroke('#1f2d3a', 8);
    t1.setShadow(2, 3, '#1f2d3a', 4, true, true);
    t3.setShadow(2, 3, '#1f2d3a', 4, true, true);

    // Letters netjes achter elkaar, mascotte links ervan; geheel centreren
    const nulR = 27;
    t2.x = t1.width + 8;
    t3.x = t2.x + t2.width + 8;
    const tekstB = t3.x + t3.width;
    const totaal = nulR * 2 + 16 + tekstB;
    const links = -totaal / 2;
    const nul = maakNul(this, links + nulR, 2, nulR);
    [t1, t2, t3].forEach((t) => { t.x += links + nulR * 2 + 16; });
    logo.add([nul, t1, t2, t3]);

    this.tweens.add({ targets: logo, y: 42, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    // Nul zwaait je gedag en knippert af en toe
    this.tweens.add({
      targets: nul.arm, angle: { from: -6, to: 26 }, duration: 360,
      yoyo: true, repeat: -1, repeatDelay: 1400, ease: 'Sine.inOut',
    });
    this.time.addEvent({ delay: 2800, loop: true, callback: () => nul.knipper() });

    this.add.text(width / 2, 84, 'spelen met getallen', {
      fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#3b5a72',
    }).setOrigin(0.5).setDepth(10);

    const childName = getSetting('childName') || 'Adrian';
    const nameTxt = this.add.text(width / 2, 108, `💖 ${childName} 💖`, {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(10).setStroke('#db2777', 5);
    this.tweens.add({ targets: nameTxt, alpha: 0.55, duration: 1600, yoyo: true, repeat: -1 });

    const stars = getStars();
    const medals = getMedalCount();
    const badge = this.add.text(width / 2, 138, `⭐ ${stars}   🏅 ${medals}`, {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#b45309',
      backgroundColor: '#ffffffdd', padding: { x: 18, y: 7 },
    }).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });
    badge.on('pointerdown', () => { SFX.click(); this.scene.start('Awards'); });
    this.tweens.add({ targets: badge, scale: 1.06, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  buildGrid(width) {
    const GAMES = [
      { icon: '🛸', name: 'Reken-Raket',     color: 0x3b82f6, go: () => this.scene.start('Math') },
      { icon: '✏️', name: 'Schrijven',        color: 0xf97316, go: () => this.scene.start('TraceMenu') },
      { icon: '🎈', name: 'Ballon-Feest',     color: 0xa855f7, go: () => this.scene.start('Balloon') },
      { icon: '🪐', name: 'Planeet Tikker',   color: 0xeab308, go: () => this.scene.start('Clicker') },
      // eerste keer: eerst het (woordeloze) verhaal van Baron Grauw
      { icon: '🦸', name: 'Getallen-Land',     color: 0xe8402c, go: () => this.scene.start(getSetting('introGezien') ? 'WorldMap' : 'Intro') },
      { icon: '🎹', name: 'Regenboog Piano',  color: 0xec4899, go: () => this.scene.start('Piano') },
      { icon: '🚚', name: 'Bezorg-Baas',      color: 0x22c55e, go: () => this.scene.start('Bezorg') },
      { icon: '🧱', name: 'Getallen Toren',   color: 0x14b8a6, go: () => this.scene.start('NumberTower') },
      { icon: '🚀', name: 'Nul-Raket',        color: 0x6366f1, go: () => this.scene.start('ZeroRocket') },
      { icon: '🐍', name: 'Tel-Slang',        color: 0x06b6d4, go: () => this.launchSnake() },
      { icon: '📖', name: 'Plakboek',         color: 0xf59e0b, go: () => this.scene.start('Sticker') },
      { icon: '🧪', name: 'Toverwinkel',      color: 0x7c3aed, go: () => this.scene.start('Toverwinkel') },
    ];

    // 11 tegels = 6 rijen. Compact genoeg zodat álles (ook de laatste rij)
    // op het scherm van 800px past — anders viel het 11e tegeltje eronder.
    const cardW = 213, cardH = 98, gapX = 8, gapY = 7;
    const startX = (width - cardW * 2 - gapX) / 2 + cardW / 2;
    const startY = 210;

    GAMES.forEach((game, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = startX + col * (cardW + gapX);
      const y = startY + row * (cardH + gapY);
      this.makeGameTile(x, y, cardW, cardH, game, i);
    });
  }

  makeGameTile(x, y, w, h, { icon, name, color, go }, index) {
    const r = 18;

    const container = this.add.container(x, y + 28).setDepth(5).setAlpha(0);

    // Numberblocks-kubus: felle kleur, glans bovenin, dikke donkere rand
    const body = this.add.graphics();
    body.fillStyle(color, 1);
    body.fillRoundedRect(-w / 2, -h / 2, w, h, r);
    body.fillStyle(0xffffff, 0.28); // glans
    body.fillRoundedRect(-w / 2 + 6, -h / 2 + 5, w - 12, h * 0.32, r - 4);
    body.lineStyle(4, 0x1f2d3a, 1); // dikke donkere rand
    body.strokeRoundedRect(-w / 2, -h / 2, w, h, r);

    // Groot emoji-icoon (in de bovenste helft)
    const iconTxt = this.add.text(0, -h * 0.16, icon, {
      fontSize: '40px',
    }).setOrigin(0.5);

    // Naam op een donker pilletje, zodat het op elke kleur leesbaar is
    const pillW = w - 26, pillH = 30, pillY = h / 2 - 26;
    const pill = this.add.graphics();
    pill.fillStyle(0x12203a, 0.88);
    pill.fillRoundedRect(-pillW / 2, pillY - pillH / 2, pillW, pillH, 12);
    const nameTxt = this.add.text(0, pillY, name, {
      fontFamily: 'Arial Black, Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);

    // Onzichtbare gloed-ring (voor de pulse-animatie hieronder)
    const glowRing = this.add.graphics();
    glowRing.lineStyle(5, 0xffffff, 0.5);
    glowRing.strokeRoundedRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6, r + 3);

    const hit = this.add.rectangle(0, 0, w, h, 0, 0).setInteractive({ useHandCursor: true });

    container.add([glowRing, body, iconTxt, pill, nameTxt, hit]);

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
      y: -h * 0.16 - 5,
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

    const stats = this.add.text(54, 14, '📊', { fontSize: '26px' })
      .setOrigin(0, 0).setDepth(20).setInteractive({ useHandCursor: true });
    stats.on('pointerdown', () => { SFX.click(); this.scene.start('Stats'); });
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
    notePlay('Snake'); startTimer('Snake');
    import('../snake3d.js').then(({ launchSnake3D }) => {
      loading.destroy();
      canvas.style.display = 'none';
      launchSnake3D(() => {
        stopTimer();
        canvas.style.display = 'block';
        this.scene.restart();
      });
    });
  }

}
