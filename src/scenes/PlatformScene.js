import Phaser from 'phaser';
import { SFX } from '../sound.js';
import { addStars, giveMedal, getSetting } from '../progress.js';

// Ruimte Avontuur — platformer. Astronaut springt over platforms,
// verslaat aliens (erop springen), verzamelt sterren, haalt de vlag.
// Levels en physics zijn geverifieerd haalbaar.

const TILE = 40;
const PLEVELS = [
  [
    "                                         ",
    "                                         ",
    "              C C C                      ",
    "          C   BBB          C C           ",
    "      C      C       A    C   C     C    ",
    "   P C    C     C C     C   C   C C   C F",
    "XXXXXXXXXXXX XXXXXXXXX X XXXXXXXXXXXXXXXX",
    "XXXXXXXXXXXX XXXXXXXXX X XXXXXXXXXXXXXXXX",
    "XXXXXXXXXXXX XXXXXXXXX X XXXXXXXXXXXXXXXX",
  ],
  [
    "                                                   ",
    "           C C        C C                          ",
    "       ?   BBB   ?    BBB        C C                ",
    "     C          C          C    BBB        C       ",
    "   C     A    C    A     C         C   A    C C     ",
    "P C   C    C    C    C     C C        C   C  C  C  F",
    "XXXXX XXXXXX XXXXX XXXXXX XXXXXXX XXXXXXXXXXXXXXXXX",
    "XXXXX XXXXXX XXXXX XXXXXX XXXXXXX XXXXXXXXXXXXXXXXX",
    "XXXXX XXXXXX XXXXX XXXXXX XXXXXXX XXXXXXXXXXXXXXXXX",
  ],
  [
    "                                                         ",
    "        C C          C C            C C                   ",
    "    ?   BBB    ?     BBB     BBB    BBB                   ",
    "  C        C      C       C      C        C       C  C    ",
    "     A   C   A   C    A  C    A C     A  C    A  C   C  C  ",
    "P  C   C   C   C   C   C   C   C   C   C   C   C  C  C  C F",
    "XXXX  XXXX  XXXX  XXXX  XXXX  XXXX  XXXX  XXXX  XXXXXXXXXX",
    "XXXX  XXXX  XXXX  XXXX  XXXX  XXXX  XXXX  XXXX  XXXXXXXXXX",
    "XXXX  XXXX  XXXX  XXXX  XXXX  XXXX  XXXX  XXXX  XXXXXXXXXX",
  ],
];

export default class PlatformScene extends Phaser.Scene {
  constructor() { super('Platform'); }

  init(data) {
    this.levelIdx = data.level || 0;
    this.score = data.score != null ? data.score : 0;
    // Aantal levens hangt af van de gekozen moeilijkheid (alleen bij start).
    const livesByDiff = { makkelijk: 5, normaal: 3, moeilijk: 2 };
    const startLives = livesByDiff[getSetting('difficulty')] || 3;
    this.lives = data.lives != null ? data.lives : startLives;
    this.gameEnded = false;
  }

  create() {
    const { width, height } = this.scale;
    this.keys = { left: false, right: false, jump: false };

    // Sta meerdere vingers tegelijk toe (bv. rechts vasthouden én springen).
    // Zonder dit werkt op iPad/iPhone maar één knop tegelijk.
    this.input.addPointer(3);

    this.parse(PLEVELS[this.levelIdx]);

    // Camera & wereldgrenzen
    this.cameras.main.setBounds(0, 0, this.levelW * TILE, this.levelH * TILE);
    // Wereldgrens loopt extra ver door naar beneden, zodat het mannetje
    // echt in een gat KAN vallen (en we dat detecteren). Links/rechts/boven
    // blijven begrensd.
    this.physics.world.setBounds(0, 0, this.levelW * TILE, this.levelH * TILE + 600);

    // Sterren ver weg (parallax)
    this.bgStars = [];
    for (let i = 0; i < 60; i++) {
      const s = this.add.image(
        Phaser.Math.Between(0, this.levelW * TILE), Phaser.Math.Between(0, this.levelH * TILE), 'star'
      ).setAlpha(Phaser.Math.FloatBetween(0.2, 0.6)).setScrollFactor(0.3);
    }

    this.buildLevel();

    // HUD (vast op scherm)
    this.hud = this.add.text(12, 12, '', {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#fff',
    }).setScrollFactor(0).setDepth(100);
    this.updateHud();

    const back = this.add.text(width - 12, 12, '⬅', {
      fontFamily: 'Arial', fontSize: '20px', color: '#94a3b8',
      backgroundColor: '#1e293b', padding: { x: 10, y: 6 },
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100).setInteractive();
    back.on('pointerdown', () => this.scene.start('Menu'));

    // Bediening (vast op scherm)
    this.makeControls();

    // Toetsenbord (voor desktop testen)
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey('SPACE');
  }

  parse(map) {
    this.levelH = map.length;
    this.levelW = Math.max(...map.map((r) => r.length));
    this.tiles = map;
  }

  buildLevel() {
    this.ground = this.physics.add.staticGroup();
    this.bricks = this.physics.add.staticGroup();
    this.coinBlocks = this.physics.add.staticGroup();
    this.coins = this.physics.add.group({ allowGravity: false, immovable: true });
    this.aliens = this.physics.add.group({ allowGravity: false });
    let startX = 60, startY = 200;
    this.flagX = 0; this.flagY = 0;

    for (let r = 0; r < this.tiles.length; r++) {
      const row = this.tiles[r];
      for (let c = 0; c < row.length; c++) {
        const ch = row[c];
        const x = c * TILE + TILE / 2, y = r * TILE + TILE / 2;
        if (ch === 'X') {
          const t = this.add.rectangle(x, y, TILE, TILE, 0x3b2f5c);
          this.add.rectangle(x, y - TILE / 2 + 3, TILE, 6, 0x4c3d75);
          this.ground.add(t);
        } else if (ch === 'B') {
          const t = this.add.rectangle(x, y, TILE - 2, TILE - 2, 0x8b5a2b).setStrokeStyle(2, 0x6b4420);
          this.bricks.add(t);
        } else if (ch === '?') {
          const t = this.add.rectangle(x, y, TILE - 2, TILE - 2, 0xfbbf24);
          this.add.text(x, y, '?', { fontFamily: 'Arial', fontSize: '22px', fontStyle: 'bold', color: '#1a1a2e' }).setOrigin(0.5);
          t.isCoinBlock = true; t.used = false;
          this.coinBlocks.add(t);
        } else if (ch === 'C') {
          const coin = this.add.text(x, y, '⭐', { fontSize: '22px' }).setOrigin(0.5);
          this.physics.add.existing(coin);
          coin.body.setAllowGravity(false);
          this.tweens.add({ targets: coin, y: y - 4, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
          this.coins.add(coin);
        } else if (ch === 'A') {
          const alien = this.add.text(x, y, '👾', { fontSize: '26px' }).setOrigin(0.5);
          this.physics.add.existing(alien);
          alien.body.setAllowGravity(false);
          alien.vx = -50;
          alien.startX = x;
          this.aliens.add(alien);
        } else if (ch === 'F') {
          this.flagX = x; this.flagY = y;
          this.flag = this.add.text(x, y, '🚩', { fontSize: '34px' }).setOrigin(0.5);
        } else if (ch === 'P') {
          startX = x; startY = y;
        }
      }
    }
    this.startX = startX; this.startY = startY;

    // Speler: getekende astronaut (container met physics)
    this.player = this.add.container(startX, startY);
    this.drawAstronaut(this.player);
    this.physics.add.existing(this.player);
    this.player.body.setSize(28, 36);
    this.player.body.setOffset(-14, -18);
    this.player.body.setCollideWorldBounds(true);
    this.player.face = 1;

    // Botsingen
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.bricks);
    this.physics.add.collider(this.player, this.coinBlocks, this.hitBlock, null, this);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  drawAstronaut(container) {
    // Lichaam
    const body = this.add.ellipse(0, 2, 22, 28, 0xf1f5f9);
    const pack = this.add.rectangle(-10, 0, 6, 18, 0x94a3b8);
    const helmet = this.add.circle(0, -12, 11, 0xf8fafc);
    const visor = this.add.circle(0, -12, 7, 0x3b82f6);
    const shine = this.add.circle(-3, -14, 2.5, 0xffffff).setAlpha(0.7);
    const panel = this.add.rectangle(0, 4, 8, 5, 0x3b82f6);
    container.add([pack, body, panel, helmet, visor, shine]);
  }

  makeControls() {
    const { width, height } = this.scale;
    const y = height - 45;
    this.controlButtons = [];
    const mk = (x, w, label, key, color) => {
      const btn = this.add.container(x, y).setScrollFactor(0).setDepth(100);
      const bg = this.add.graphics();
      bg.fillStyle(color, 0.2);
      bg.lineStyle(2, color, 0.5);
      bg.fillRoundedRect(-w / 2, -35, w, 70, 14);
      bg.strokeRoundedRect(-w / 2, -35, w, 70, 14);
      const t = this.add.text(0, 0, label, { fontFamily: 'Arial', fontSize: '22px', fontStyle: 'bold', color: '#fff' }).setOrigin(0.5);
      btn.add([bg, t]);
      // Bewaar het klikvlak (scherm-coördinaten) zodat we in update()
      // per vinger kunnen checken welke knop wordt ingedrukt. Dit werkt
      // betrouwbaar met meerdere vingers tegelijk op iPad/iPhone.
      this.controlButtons.push({ key, x, y, w, h: 70, bg, color });
    };
    mk(55, 80, '◀', 'left', 0xffffff);
    mk(150, 80, '▶', 'right', 0xffffff);
    mk(width - 90, 150, '⬆ SPRING', 'jump', 0x4ade80);
  }

  // Lees elke frame welke knoppen worden aangeraakt (alle vingers).
  readControls() {
    if (!this.controlButtons) return;
    const pointers = [this.input.pointer1, this.input.pointer2, this.input.pointer3, this.input.pointer4]
      .filter((p) => p && p.isDown);
    // reset
    this.keys.left = false; this.keys.right = false; this.keys.jump = false;
    for (const btn of this.controlButtons) {
      let pressed = false;
      for (const p of pointers) {
        if (Math.abs(p.x - btn.x) <= btn.w / 2 && Math.abs(p.y - btn.y) <= btn.h / 2) {
          pressed = true; break;
        }
      }
      if (pressed) this.keys[btn.key] = true;
      // visuele feedback
      btn.bg.clear();
      btn.bg.fillStyle(btn.color, pressed ? 0.45 : 0.2);
      btn.bg.lineStyle(2, btn.color, pressed ? 0.9 : 0.5);
      btn.bg.fillRoundedRect(-btn.w / 2, -35, btn.w, 70, 14);
      btn.bg.strokeRoundedRect(-btn.w / 2, -35, btn.w, 70, 14);
    }
  }

  hitBlock(player, block) {
    // Alleen als speler omhoog tegen het blok botst
    if (player.body.velocity.y < 0 && player.y > block.y) {
      if (block.isCoinBlock && !block.used) {
        block.used = true;
        block.fillColor = 0x5b4a2a;
        this.score += 50;
        SFX.coin();
        this.floatText('+50', block.x, block.y - 20, '#fbbf24');
        this.updateHud();
      }
    }
  }

  update(time, delta) {
    if (!this.player || !this.player.body) return;
    if (this.gameEnded) { this.player.body.setVelocity(0, 0); return; }
    const p = this.player;
    const onGround = p.body.blocked.down || p.body.touching.down;

    // Lees de touch-knoppen (werkt met meerdere vingers)
    this.readControls();

    // Beweging
    const left = this.keys.left || (this.cursors && this.cursors.left.isDown);
    const right = this.keys.right || (this.cursors && this.cursors.right.isDown);
    const jump = this.keys.jump || (this.cursors && this.cursors.up.isDown) || (this.spaceKey && this.spaceKey.isDown);

    if (left) { p.body.setVelocityX(-170); p.face = -1; }
    else if (right) { p.body.setVelocityX(170); p.face = 1; }
    else p.body.setVelocityX(0);

    if (jump && onGround) { p.body.setVelocityY(-470); SFX.pop(); }

    // Gevallen?
    if (p.y > this.levelH * TILE + 80) { this.die(); return; }

    // Aliens bewegen heen en weer
    this.aliens.getChildren().forEach((a) => {
      a.body.setVelocityX(a.vx);
      if (Math.abs(a.x - a.startX) > TILE * 2.5) {
        a.vx *= -1;
        a.x = Phaser.Math.Clamp(a.x, a.startX - TILE * 2.5, a.startX + TILE * 2.5);
      }
    });

    // Munten oppakken
    this.coins.getChildren().forEach((coin) => {
      if (Phaser.Math.Distance.Between(p.x, p.y, coin.x, coin.y) < 28) {
        coin.destroy();
        this.score += 10;
        SFX.coin();
        this.updateHud();
      }
    });

    // Aliens: erop springen = verslaan, anders dood
    this.aliens.getChildren().forEach((a) => {
      if (Phaser.Math.Distance.Between(p.x, p.y, a.x, a.y) < 28) {
        if (p.body.velocity.y > 0 && p.y < a.y - 6) {
          a.destroy();
          p.body.setVelocityY(-300);
          this.score += 100;
          SFX.coin();
          this.floatText('+100', a.x, a.y - 20, '#4ade80');
          this.updateHud();
        } else {
          this.die();
        }
      }
    });

    // Vlag bereikt?
    if (this.flag && Phaser.Math.Distance.Between(p.x, p.y, this.flagX, this.flagY) < 30) {
      this.win();
    }
  }

  die() {
    SFX.gameover();
    this.lives--;
    if (this.lives <= 0) {
      this.gameOver();
    } else {
      this.player.setPosition(this.startX, this.startY);
      this.player.body.setVelocity(0, 0);
      this.updateHud();
    }
  }

  win() {
    this.flag = null;
    this.gameEnded = true;
    SFX.win();
    this.confetti();
    const { width, height } = this.scale;
    const cx = width / 2, cy = height / 2;
    const bg = this.add.graphics().setScrollFactor(0).setDepth(200);
    bg.fillStyle(0x000000, 0.8);
    bg.fillRect(0, 0, width, height);
    const last = this.levelIdx + 1 >= PLEVELS.length;
    addStars(2); // 2 sterren per gehaald level
    if (last) giveMedal('platform_done');
    this.add.text(cx, cy - 50, last ? '🏆' : '🚩', { fontSize: '64px' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(201);
    this.add.text(cx, cy + 10, last ? 'Alle levels gehaald!' : `Level ${this.levelIdx + 1} gehaald!`, {
      fontFamily: 'Arial', fontSize: '24px', fontStyle: 'bold', color: '#fff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
    this.add.text(cx, cy + 44, '+2 ⭐', {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#fbbf24',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
    this.overlayButton(cx, cy + 90, last ? 'Terug 🏠' : 'Volgende 🚀', 0xfbbf24, () => {
      if (last) this.scene.start('Menu');
      else this.scene.start('Platform', { level: this.levelIdx + 1, score: this.score, lives: this.lives });
    });
  }

  gameOver() {
    this.gameEnded = true;
    const { width, height } = this.scale;
    const cx = width / 2, cy = height / 2;
    const bg = this.add.graphics().setScrollFactor(0).setDepth(200);
    bg.fillStyle(0x000000, 0.85);
    bg.fillRect(0, 0, width, height);
    this.add.text(cx, cy - 60, '💥', { fontSize: '64px' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(201);
    this.add.text(cx, cy, 'Game Over!', {
      fontFamily: 'Arial', fontSize: '28px', fontStyle: 'bold', color: '#fff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
    this.add.text(cx, cy + 35, `Score: ${this.score.toLocaleString('nl-NL')}`, {
      fontFamily: 'Arial', fontSize: '16px', color: '#94a3b8',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
    this.overlayButton(cx, cy + 90, 'Opnieuw 🚀', 0xfbbf24, () =>
      this.scene.start('Platform', { level: this.levelIdx, score: 0, lives: 3 }));
    this.overlayButton(cx, cy + 150, '🏠 Menu', 0x334155, () => this.scene.start('Menu'), '#ffffff');
  }

  // Maak een betrouwbaar klikbare knop (los van containers) voor overlays.
  overlayButton(x, y, label, color, onClick, textColor) {
    const t = this.add.text(x, y, label, {
      fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold',
      color: textColor || '#1a1a2e',
      backgroundColor: '#' + color.toString(16).padStart(6, '0'),
      padding: { x: 24, y: 12 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(202).setInteractive({ useHandCursor: true });
    t.on('pointerdown', () => { SFX.coin(); onClick(); });
    return t;
  }

  updateHud() {
    this.hud.setText(`⭐ ${this.score}    ${'❤️'.repeat(Math.max(this.lives, 0))}`);
  }

  floatText(txt, x, y, color) {
    const t = this.add.text(x, y, txt, {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color,
    }).setOrigin(0.5).setDepth(60);
    this.tweens.add({ targets: t, y: y - 30, alpha: 0, duration: 800, onComplete: () => t.destroy() });
  }

  confetti() {
    const { width } = this.scale;
    const p = this.add.particles(width / 2, 80, 'star', {
      x: { min: 0, max: width }, y: -10,
      speedY: { min: 100, max: 280 }, scale: { start: 1.5, end: 0 },
      lifespan: 1800, quantity: 2, scrollFactor: 0,
      tint: [0xf87171, 0xfbbf24, 0x4ade80, 0x60a5fa, 0xa855f7], blendMode: 'ADD',
    }).setScrollFactor(0).setDepth(199);
    this.time.delayedCall(1800, () => p.destroy());
  }
}
