import Phaser from 'phaser';
import { SFX } from '../sound.js';
import { addStars, giveMedal, getSetting } from '../progress.js';

// Getallen-Avontuur — Numberblocks-platformer. Je begint als "1" en wordt
// groter door +1-blokjes te verzamelen (je telt op, wordt hoger en springt
// hoger). Min-monstertjes maken je kleiner i.p.v. dood; je kunt erop springen
// om ze te poppen. Haal de vlag — en word zo groot als het doelgetal!
// De level-indeling (platforms/physics) is hetzelfde als voorheen, dus
// geverifieerd haalbaar. C = +1-blokje, A = min-monster, F = vlag, P = start.

const TILE = 40;

// Numberblocks-signatuurkleuren 1..10
const SIG = [0xe8402c, 0xf08a24, 0xf6c624, 0x57b947, 0x38b6cf,
  0xec6aa9, 0x9b6dd6, 0x6b7b8a, 0x4f63c9, 0xe34da0];
const SIG_HEX = ['#e8402c', '#f08a24', '#f6c624', '#57b947', '#38b6cf',
  '#ec6aa9', '#9b6dd6', '#6b7b8a', '#4f63c9', '#e34da0'];
const sig = (v) => (v <= 0 ? 0xcbd5e1 : SIG[(v - 1) % 10]);
const sigHex = (v) => (v <= 0 ? '#cbd5e1' : SIG_HEX[(v - 1) % 10]);

const TARGETS = [5, 8, 10]; // doelgetal per level

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
    const livesByDiff = { makkelijk: 5, normaal: 3, moeilijk: 2 };
    const startLives = livesByDiff[getSetting('difficulty')] || 3;
    this.lives = data.lives != null ? data.lives : startLives;
    this.gameEnded = false;
    this.value = 1;          // je begint als "1"
    this.target = TARGETS[Math.min(this.levelIdx, TARGETS.length - 1)];
    this.hurtUntil = 0;
  }

  create() {
    const { width, height } = this.scale;
    this.keys = { left: false, right: false, jump: false };
    this.input.addPointer(3);

    this.parse(PLEVELS[this.levelIdx]);

    this.cameras.main.setBounds(0, 0, this.levelW * TILE, this.levelH * TILE);
    this.physics.world.setBounds(0, 0, this.levelW * TILE, this.levelH * TILE + 600);

    this.buildBackground();
    this.buildLevel();

    // HUD: groot huidig getal + levens + doel (vast op scherm)
    this.numText = this.add.text(14, 30, '1', {
      fontFamily: 'Arial Black, Arial', fontSize: '34px', fontStyle: 'bold', color: sigHex(1),
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100).setStroke('#1f2d3a', 6);
    this.hud = this.add.text(14, 60, '', {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#12203a',
    }).setScrollFactor(0).setDepth(100);
    this.updateHud();

    const back = this.add.text(width - 12, 12, '⬅', {
      fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', color: '#ffffff',
      backgroundColor: '#1f2d3a', padding: { x: 10, y: 6 },
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100).setInteractive();
    back.on('pointerdown', () => this.scene.start('Menu'));

    this.makeControls();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey('SPACE');

    // Korte uitleg-banner die vanzelf verdwijnt
    this.banner(`Word ${this.target} en haal de vlag! 🚩`);
  }

  parse(map) {
    this.levelH = map.length;
    this.levelW = Math.max(...map.map((r) => r.length));
    this.tiles = map;
  }

  buildBackground() {
    const wpx = this.levelW * TILE, hpx = this.levelH * TILE;
    // Heldere lucht-naar-gras achtergrond (volgt camera niet: vast canvas)
    const bg = this.add.graphics().setScrollFactor(0).setDepth(-10);
    bg.fillGradientStyle(0x8fe1ff, 0x8fe1ff, 0xd7f5a8, 0xd7f5a8, 1);
    bg.fillRect(0, 0, this.scale.width, this.scale.height);

    // Wolkjes met lichte parallax
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(0, wpx);
      const y = Phaser.Math.Between(20, hpx * 0.5);
      const s = Phaser.Math.FloatBetween(0.8, 1.4);
      const cl = this.add.graphics().setScrollFactor(0.4).setDepth(-9);
      cl.fillStyle(0xffffff, 0.8);
      cl.fillCircle(x, y, 22 * s);
      cl.fillCircle(x + 24 * s, y + 6 * s, 18 * s);
      cl.fillCircle(x - 22 * s, y + 6 * s, 16 * s);
      cl.fillRoundedRect(x - 30 * s, y, 60 * s, 16 * s, 8);
    }
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
          // Grasgrond met aarde eronder
          const t = this.add.rectangle(x, y, TILE, TILE, 0x8b5e34);
          this.add.rectangle(x, y - TILE / 2 + 5, TILE, 10, 0x57b947);
          this.ground.add(t);
        } else if (ch === 'B') {
          const t = this.add.rectangle(x, y, TILE - 2, TILE - 2, 0xc78a3b).setStrokeStyle(3, 0x1f2d3a);
          this.bricks.add(t);
        } else if (ch === '?') {
          const t = this.add.rectangle(x, y, TILE - 2, TILE - 2, 0xf6c624).setStrokeStyle(3, 0x1f2d3a);
          this.add.text(x, y, '?', { fontFamily: 'Arial Black, Arial', fontSize: '22px', fontStyle: 'bold', color: '#1f2d3a' }).setOrigin(0.5);
          t.isCoinBlock = true; t.used = false;
          this.coinBlocks.add(t);
        } else if (ch === 'C') {
          const coin = this.add.container(x, y);
          this.drawPlusBlock(coin);
          this.physics.add.existing(coin);
          coin.body.setAllowGravity(false);
          this.tweens.add({ targets: coin, y: y - 5, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
          this.coins.add(coin);
        } else if (ch === 'A') {
          const mon = this.add.container(x, y);
          this.drawMonster(mon);
          this.physics.add.existing(mon);
          mon.body.setAllowGravity(false);
          mon.vx = -50;
          mon.startX = x;
          this.aliens.add(mon);
        } else if (ch === 'F') {
          this.flagX = x; this.flagY = y;
          this.flag = this.add.text(x, y, '🚩', { fontSize: '34px' }).setOrigin(0.5);
        } else if (ch === 'P') {
          startX = x; startY = y;
        }
      }
    }
    this.startX = startX; this.startY = startY;

    // Speler: een Numberblocks-figuurtje (stapel kubussen)
    this.player = this.add.container(startX, startY);
    this.drawNumberblock(this.player, this.value);
    this.physics.add.existing(this.player);
    this.player.body.setSize(26, 30);
    this.player.body.setOffset(-13, -15);
    this.player.body.setCollideWorldBounds(true);
    this.player.face = 1;

    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.bricks);
    this.physics.add.collider(this.player, this.coinBlocks, this.hitBlock, null, this);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  // Teken de speler als stapel van `value` kubussen (bovenste met gezichtje)
  drawNumberblock(container, value) {
    container.removeAll(true);
    const CAP = 6;
    const n = Math.min(Math.max(value, 1), CAP);
    const cube = 22;
    const color = sig(value);
    for (let i = 0; i < n; i++) {
      const cy = -i * (cube - 2); // licht overlappend stapelen, omhoog
      const g = this.add.graphics();
      g.fillStyle(color, 1);
      g.fillRoundedRect(-cube / 2, cy - cube / 2, cube, cube, 5);
      g.fillStyle(0xffffff, 0.28);
      g.fillRoundedRect(-cube / 2 + 3, cy - cube / 2 + 2, cube - 6, cube * 0.3, 4);
      g.lineStyle(2.5, 0x1f2d3a, 1);
      g.strokeRoundedRect(-cube / 2, cy - cube / 2, cube, cube, 5);
      container.add(g);
      if (i === n - 1) {
        [-4.5, 4.5].forEach((dx) => {
          container.add(this.add.circle(dx, cy - 2, 3.4, 0xffffff).setStrokeStyle(1, 0x1f2d3a));
          container.add(this.add.circle(dx, cy - 1.5, 1.7, 0x1f2d3a));
        });
        const sm = this.add.graphics();
        sm.lineStyle(1.5, 0x1f2d3a, 1);
        sm.beginPath(); sm.arc(0, cy + 2.5, 3, 0.15 * Math.PI, 0.85 * Math.PI); sm.strokePath();
        container.add(sm);
      }
    }
    // Nummer-badge naast de stapel
    const badge = this.add.text(cube / 2 + 5, -((n - 1) * (cube - 2)) / 2, String(value), {
      fontFamily: 'Arial Black, Arial', fontSize: '17px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0, 0.5).setStroke('#1f2d3a', 4);
    container.add(badge);
  }

  drawPlusBlock(container) {
    const s = 26;
    const g = this.add.graphics();
    g.fillStyle(0x57b947, 1);
    g.fillRoundedRect(-s / 2, -s / 2, s, s, 6);
    g.fillStyle(0xffffff, 0.3);
    g.fillRoundedRect(-s / 2 + 3, -s / 2 + 2, s - 6, s * 0.3, 4);
    g.lineStyle(2.5, 0x1f2d3a, 1);
    g.strokeRoundedRect(-s / 2, -s / 2, s, s, 6);
    const t = this.add.text(0, 0, '+1', {
      fontFamily: 'Arial Black, Arial', fontSize: '13px', fontStyle: 'bold', color: '#16302a',
    }).setOrigin(0.5);
    container.add([g, t]);
  }

  drawMonster(container) {
    const g = this.add.graphics();
    g.fillStyle(0x4b3a6b, 1);
    g.fillRoundedRect(-15, -13, 30, 26, 11);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(-5, -3, 4.5); g.fillCircle(6, -3, 4.5);
    g.fillStyle(0x1f2d3a, 1);
    g.fillCircle(-5, -2, 2.2); g.fillCircle(6, -2, 2.2);
    g.lineStyle(2.5, 0x1f2d3a, 1);
    g.strokeRoundedRect(-15, -13, 30, 26, 11);
    const t = this.add.text(0, 8, '−1', {
      fontFamily: 'Arial Black, Arial', fontSize: '11px', fontStyle: 'bold', color: '#fda4af',
    }).setOrigin(0.5);
    container.add([g, t]);
  }

  makeControls() {
    const { width, height } = this.scale;
    const y = height - 45;
    this.controlButtons = [];
    const mk = (x, w, label, key, color) => {
      const btn = this.add.container(x, y).setScrollFactor(0).setDepth(100);
      const bg = this.add.graphics();
      bg.fillStyle(color, 0.85);
      bg.fillRoundedRect(-w / 2, -35, w, 70, 14);
      bg.lineStyle(3, 0x1f2d3a, 1);
      bg.strokeRoundedRect(-w / 2, -35, w, 70, 14);
      const t = this.add.text(0, 0, label, { fontFamily: 'Arial Black, Arial', fontSize: '22px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
      btn.add([bg, t]);
      this.controlButtons.push({ key, x, y, w, h: 70, bg, color });
    };
    mk(55, 80, '◀', 'left', 0xffffff);
    mk(150, 80, '▶', 'right', 0xffffff);
    mk(width - 90, 150, '⬆ SPRING', 'jump', 0x57b947);
  }

  readControls() {
    if (!this.controlButtons) return;
    const pointers = [this.input.pointer1, this.input.pointer2, this.input.pointer3, this.input.pointer4]
      .filter((p) => p && p.isDown);
    this.keys.left = false; this.keys.right = false; this.keys.jump = false;
    for (const btn of this.controlButtons) {
      let pressed = false;
      for (const p of pointers) {
        if (Math.abs(p.x - btn.x) <= btn.w / 2 && Math.abs(p.y - btn.y) <= btn.h / 2) {
          pressed = true; break;
        }
      }
      if (pressed) this.keys[btn.key] = true;
      btn.bg.clear();
      btn.bg.fillStyle(btn.color, pressed ? 1 : 0.85);
      btn.bg.fillRoundedRect(-btn.w / 2, -35, btn.w, 70, 14);
      btn.bg.lineStyle(3, 0x1f2d3a, 1);
      btn.bg.strokeRoundedRect(-btn.w / 2, -35, btn.w, 70, 14);
    }
  }

  hitBlock(player, block) {
    if (player.body.velocity.y < 0 && player.y > block.y) {
      if (block.isCoinBlock && !block.used) {
        block.used = true;
        block.fillColor = 0xb59030;
        this.score += 50;
        SFX.coin();
        this.floatText('+50', block.x, block.y - 20, '#f6c624');
        this.updateHud();
      }
    }
  }

  update(time, delta) {
    if (!this.player || !this.player.body) return;
    if (this.gameEnded) { this.player.body.setVelocity(0, 0); return; }
    const p = this.player;
    const onGround = p.body.blocked.down || p.body.touching.down;

    this.readControls();

    const left = this.keys.left || (this.cursors && this.cursors.left.isDown);
    const right = this.keys.right || (this.cursors && this.cursors.right.isDown);
    const jump = this.keys.jump || (this.cursors && this.cursors.up.isDown) || (this.spaceKey && this.spaceKey.isDown);

    if (left) { p.body.setVelocityX(-170); p.face = -1; }
    else if (right) { p.body.setVelocityX(170); p.face = 1; }
    else p.body.setVelocityX(0);

    // Hoe groter, hoe hoger je springt (Numberblocks-bonus)
    if (jump && onGround) {
      const jv = 440 + Math.min(this.value, 8) * 13;
      p.body.setVelocityY(-jv);
      SFX.pop();
    }

    // Knipperen tijdens onkwetsbaarheid na een tik
    p.setAlpha(time < this.hurtUntil && Math.floor(time / 100) % 2 === 0 ? 0.4 : 1);

    if (p.y > this.levelH * TILE + 80) { this.die(); return; }

    // Monsters heen en weer
    this.aliens.getChildren().forEach((a) => {
      a.body.setVelocityX(a.vx);
      if (Math.abs(a.x - a.startX) > TILE * 2.5) {
        a.vx *= -1;
        a.x = Phaser.Math.Clamp(a.x, a.startX - TILE * 2.5, a.startX + TILE * 2.5);
      }
    });

    // +1-blokjes oppakken = groeien
    this.coins.getChildren().forEach((coin) => {
      if (Phaser.Math.Distance.Between(p.x, p.y, coin.x, coin.y) < 30) {
        coin.destroy();
        this.grow();
      }
    });

    // Monsters: erop springen = poppen, anders word je kleiner
    this.aliens.getChildren().forEach((a) => {
      if (Phaser.Math.Distance.Between(p.x, p.y, a.x, a.y) < 30) {
        if (p.body.velocity.y > 0 && p.y < a.y - 6) {
          a.destroy();
          p.body.setVelocityY(-320);
          this.score += 30;
          SFX.coin();
          this.floatText('Boem! +30', a.x, a.y - 20, '#57b947');
          this.updateHud();
        } else if (time > this.hurtUntil) {
          this.hurt(time);
        }
      }
    });

    if (this.flag && Phaser.Math.Distance.Between(p.x, p.y, this.flagX, this.flagY) < 30) {
      this.win();
    }
  }

  grow() {
    this.value++;
    this.score += 10;
    this.drawNumberblock(this.player, this.value);
    // vrolijk oplopend toontje
    SFX.merge(this.value * this.value);
    this.say(this.value, true);
    this.floatText(`${this.value}!`, this.player.x, this.player.y - 40, sigHex(this.value));
    if (this.value === this.target) {
      this.floatText('🎉 Doel!', this.player.x, this.player.y - 64, '#f6c624');
      this.banner(`Top! Je bent ${this.target}! Haal nu de vlag 🚩`);
    }
    this.updateHud();
  }

  hurt(time) {
    if (this.value > 1) {
      this.value--;
      this.drawNumberblock(this.player, this.value);
      SFX.wrong();
      this.say(this.value, false);
      this.floatText('−1', this.player.x, this.player.y - 40, '#f87171');
      // terugstoot
      this.player.body.setVelocityY(-220);
      this.player.body.setVelocityX(this.player.face * -160);
      this.hurtUntil = time + 1200;
      this.updateHud();
    } else {
      this.die();
    }
  }

  die() {
    SFX.gameover();
    this.lives--;
    if (this.lives <= 0) {
      this.gameOver();
    } else {
      this.value = 1;
      this.drawNumberblock(this.player, this.value);
      this.player.setPosition(this.startX, this.startY);
      this.player.body.setVelocity(0, 0);
      this.player.setAlpha(1);
      this.hurtUntil = 0;
      this.updateHud();
    }
  }

  win() {
    this.flag = null;
    this.gameEnded = true;
    SFX.win();
    this.confetti();
    const reached = this.value >= this.target;
    const { width, height } = this.scale;
    const cx = width / 2, cy = height / 2;
    const bg = this.add.graphics().setScrollFactor(0).setDepth(200);
    bg.fillStyle(0x12203a, 0.82);
    bg.fillRect(0, 0, width, height);
    const last = this.levelIdx + 1 >= PLEVELS.length;
    const stars = reached ? 3 : 2;
    addStars(stars);
    if (last) giveMedal('platform_done');
    this.add.text(cx, cy - 60, last ? '🏆' : '🚩', { fontSize: '64px' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(201);
    this.add.text(cx, cy - 4, last ? 'Alle levels gehaald!' : `Level ${this.levelIdx + 1} gehaald!`, {
      fontFamily: 'Arial Black, Arial', fontSize: '24px', fontStyle: 'bold', color: '#fff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
    this.add.text(cx, cy + 32, reached ? `Je werd ${this.value}! 🌟` : `Je werd ${this.value} (doel was ${this.target})`, {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: reached ? '#86efac' : '#cbd5e1',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
    this.add.text(cx, cy + 60, `+${stars} ⭐`, {
      fontFamily: 'Arial Black, Arial', fontSize: '18px', fontStyle: 'bold', color: '#f6c624',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
    this.overlayButton(cx, cy + 104, last ? 'Terug 🏠' : 'Volgende 🚀', 0x57b947, () => {
      if (last) this.scene.start('Menu');
      else this.scene.start('Platform', { level: this.levelIdx + 1, score: this.score, lives: this.lives });
    });
  }

  gameOver() {
    this.gameEnded = true;
    const { width, height } = this.scale;
    const cx = width / 2, cy = height / 2;
    const bg = this.add.graphics().setScrollFactor(0).setDepth(200);
    bg.fillStyle(0x12203a, 0.85);
    bg.fillRect(0, 0, width, height);
    this.add.text(cx, cy - 60, '💥', { fontSize: '64px' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(201);
    this.add.text(cx, cy, 'Game Over!', {
      fontFamily: 'Arial Black, Arial', fontSize: '28px', fontStyle: 'bold', color: '#fff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
    this.add.text(cx, cy + 35, `Score: ${this.score.toLocaleString('nl-NL')}`, {
      fontFamily: 'Arial', fontSize: '16px', color: '#cbd5e1',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
    this.overlayButton(cx, cy + 90, 'Opnieuw 🚀', 0x57b947, () =>
      this.scene.start('Platform', { level: this.levelIdx, score: 0, lives: 3 }));
    this.overlayButton(cx, cy + 150, '🏠 Menu', 0x4b3a6b, () => this.scene.start('Menu'), '#ffffff');
  }

  overlayButton(x, y, label, color, onClick, textColor) {
    const t = this.add.text(x, y, label, {
      fontFamily: 'Arial Black, Arial', fontSize: '20px', fontStyle: 'bold',
      color: textColor || '#16202b',
      backgroundColor: '#' + color.toString(16).padStart(6, '0'),
      padding: { x: 24, y: 12 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(202).setInteractive({ useHandCursor: true });
    t.on('pointerdown', () => { SFX.coin(); onClick(); });
    return t;
  }

  updateHud() {
    this.numText.setText(String(this.value)).setColor(sigHex(this.value));
    this.hud.setText(`${'❤️'.repeat(Math.max(this.lives, 0))}   🎯 word ${this.target}   ⭐ ${this.score}`);
  }

  // Korte banner bovenin die vanzelf vervaagt
  banner(text) {
    if (this.bannerTxt) this.bannerTxt.destroy();
    this.bannerTxt = this.add.text(this.scale.width / 2, 26, text, {
      fontFamily: 'Arial Black, Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
      backgroundColor: '#12203aDD', padding: { x: 12, y: 6 },
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(120);
    const b = this.bannerTxt;
    this.tweens.add({ targets: b, alpha: 0, delay: 2600, duration: 600, onComplete: () => { if (b) b.destroy(); } });
  }

  floatText(txt, x, y, color) {
    const t = this.add.text(x, y, txt, {
      fontFamily: 'Arial Black, Arial', fontSize: '18px', fontStyle: 'bold', color,
    }).setOrigin(0.5).setDepth(60).setStroke('#1f2d3a', 4);
    this.tweens.add({ targets: t, y: y - 32, alpha: 0, duration: 850, onComplete: () => t.destroy() });
  }

  confetti() {
    const { width } = this.scale;
    const p = this.add.particles(width / 2, 80, 'star', {
      x: { min: 0, max: width }, y: -10,
      speedY: { min: 100, max: 280 }, scale: { start: 1.5, end: 0 },
      lifespan: 1800, quantity: 2, scrollFactor: 0,
      tint: [0xe8402c, 0xf6c624, 0x57b947, 0x38b6cf, 0x9b6dd6], blendMode: 'ADD',
    }).setScrollFactor(0).setDepth(199);
    this.time.delayedCall(1800, () => p.destroy());
  }

  // --- Voorlezen ---
  say(n, happy) {
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(happy ? `${this.words(n)}!` : this.words(n));
      u.lang = 'nl-NL';
      u.pitch = happy ? 1.7 : 1.2;
      u.rate = 1.0;
      synth.speak(u);
    } catch (e) {}
  }

  words(n) {
    if (n <= 0) return 'nul';
    const ones = ['', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen'];
    const teens = ['tien', 'elf', 'twaalf', 'dertien', 'veertien', 'vijftien', 'zestien', 'zeventien', 'achttien', 'negentien'];
    const tens = ['', '', 'twintig', 'dertig', 'veertig', 'vijftig', 'zestig', 'zeventig', 'tachtig', 'negentig'];
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) { const t = Math.floor(n / 10), o = n % 10; return o === 0 ? tens[t] : ones[o] + 'en' + tens[t]; }
    return String(n);
  }
}
