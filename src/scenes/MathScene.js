import Phaser from 'phaser';
import { SFX } from '../sound.js';
import { showReward } from '../reward.js';
import { saveHigh, getHigh } from '../progress.js';

// Ruimte Rekenen — los sommen op, stijg door de levels (planeten).
// Drie moeilijkheidsgraden. Per goed antwoord punten + combo-multiplier.

const DIFFS = {
  easy: { name: 'Verkenner', color: 0x4ade80, levels: [
    { n: 'Aarde', i: '🌍', a: 7, b: 5, ops: ['+'], xp: 5 },
    { n: 'Maan', i: '🌙', a: 10, b: 8, ops: ['+'], xp: 5 },
    { n: 'Mars', i: '🔴', a: 10, b: 5, ops: ['-'], xp: 6 },
    { n: 'Jupiter', i: '🟠', a: 10, b: 8, ops: ['+', '-'], xp: 6 },
    { n: 'Saturnus', i: '🪐', a: 14, b: 10, ops: ['+'], xp: 7 },
    { n: 'Neptunus', i: '💠', a: 20, b: 15, ops: ['+', '-'], xp: 8 },
    { n: 'Supernova', i: '💫', a: 50, b: 30, ops: ['+', '-'], xp: 9 },
  ]},
  medium: { name: 'Ruimtepiloot', color: 0xfbbf24, levels: [
    { n: 'Aarde', i: '🌍', a: 15, b: 12, ops: ['+'], xp: 5 },
    { n: 'Maan', i: '🌙', a: 20, b: 15, ops: ['+', '-'], xp: 5 },
    { n: 'Mars', i: '🔴', a: 30, b: 20, ops: ['+', '-'], xp: 6 },
    { n: 'Jupiter', i: '🟠', a: 8, b: 5, ops: ['×'], xp: 6 },
    { n: 'Saturnus', i: '🪐', a: 10, b: 7, ops: ['×'], xp: 7 },
    { n: 'Neptunus', i: '💠', a: 80, b: 50, ops: ['+', '-'], xp: 8 },
    { n: 'Supernova', i: '💫', a: 200, b: 100, ops: ['+', '-', '×'], xp: 9 },
  ]},
  hard: { name: 'Sterrenheld', color: 0xf87171, levels: [
    { n: 'Aarde', i: '🌍', a: 30, b: 25, ops: ['+', '-'], xp: 5 },
    { n: 'Maan', i: '🌙', a: 10, b: 8, ops: ['×'], xp: 5 },
    { n: 'Mars', i: '🔴', a: 60, b: 40, ops: ['+', '-', '×'], xp: 6 },
    { n: 'Jupiter', i: '🟠', a: 12, b: 10, ops: ['×'], xp: 6 },
    { n: 'Saturnus', i: '🪐', a: 100, b: 60, ops: ['+', '-', '×'], xp: 7 },
    { n: 'Neptunus', i: '💠', a: 200, b: 100, ops: ['+', '-', '×'], xp: 8 },
    { n: 'Supernova', i: '💫', a: 999, b: 500, ops: ['+', '-', '×'], xp: 9 },
  ]},
};

export default class MathScene extends Phaser.Scene {
  constructor() { super('Math'); }

  init(data) {
    this.diff = data.diff || 'easy';
  }

  create() {
    const { width, height } = this.scale;
    this.addStars();

    this.cfg = DIFFS[this.diff];
    this.score = 0;
    this.combo = 0;
    this.level = 1;
    this.xp = 0;
    this.locked = false;

    // Terug-knop
    this.backBtn('Menu');

    // Titel
    this.add.text(width / 2, 30, this.cfg.name, {
      fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold',
      color: '#' + this.cfg.color.toString(16).padStart(6, '0'),
    }).setOrigin(0.5);

    // Level badge + planeten-rij
    this.levelText = this.add.text(width / 2, 64, '', {
      fontFamily: 'Arial', fontSize: '16px', color: '#94a3b8',
    }).setOrigin(0.5);

    // XP balk
    this.xpBarBg = this.add.rectangle(width / 2, 92, 280, 10, 0x1e293b).setOrigin(0.5);
    this.xpBar = this.add.rectangle(width / 2 - 140, 92, 4, 10, this.cfg.color).setOrigin(0, 0.5);

    // Combo tekst
    this.comboText = this.add.text(width / 2, 120, '', {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#fbbf24',
    }).setOrigin(0.5);

    // Score
    this.add.text(width / 2, 160, '🏆 Score', {
      fontFamily: 'Arial', fontSize: '14px', color: '#64748b',
    }).setOrigin(0.5);
    this.scoreText = this.add.text(width / 2, 195, '0', {
      fontFamily: 'Arial', fontSize: '44px', fontStyle: 'bold', color: '#fff',
    }).setOrigin(0.5);

    // Som
    this.probText = this.add.text(width / 2, 280, '', {
      fontFamily: 'Arial', fontSize: '40px', fontStyle: 'bold', color: '#fff',
    }).setOrigin(0.5);

    // Antwoordknoppen (2x2)
    this.answerBtns = [];
    const bw = 150, bh = 70, gap = 16;
    const positions = [
      [width / 2 - bw / 2 - gap / 2, 400],
      [width / 2 + bw / 2 + gap / 2, 400],
      [width / 2 - bw / 2 - gap / 2, 400 + bh + gap],
      [width / 2 + bw / 2 + gap / 2, 400 + bh + gap],
    ];
    for (let i = 0; i < 4; i++) {
      const [x, y] = positions[i];
      const btn = this.makeAnswerButton(x, y, bw, bh);
      this.answerBtns.push(btn);
    }

    this.updateUI();
    this.newProblem();
  }

  curLevel() {
    return this.cfg.levels[Math.min(this.level - 1, this.cfg.levels.length - 1)];
  }

  makeAnswerButton(x, y, w, h) {
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.06);
    bg.lineStyle(2.5, 0xffffff, 0.15);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
    const text = this.add.text(0, 0, '', {
      fontFamily: 'Arial', fontSize: '28px', fontStyle: 'bold', color: '#fff',
    }).setOrigin(0.5);
    container.add([bg, text]);
    container.bg = bg; container.label = text; container.w = w; container.h = h;
    const hit = this.add.rectangle(0, 0, w, h, 0xffffff, 0).setInteractive({ useHandCursor: true });
    container.add(hit);
    hit.on('pointerdown', () => this.checkAnswer(container));
    return container;
  }

  setButtonColor(btn, fill, line) {
    btn.bg.clear();
    btn.bg.fillStyle(fill, fill === 0xffffff ? 0.06 : 0.85);
    btn.bg.lineStyle(2.5, line, fill === 0xffffff ? 0.15 : 1);
    btn.bg.fillRoundedRect(-btn.w / 2, -btn.h / 2, btn.w, btn.h, 14);
    btn.bg.strokeRoundedRect(-btn.w / 2, -btn.h / 2, btn.w, btn.h, 14);
  }

  newProblem() {
    this.locked = false;
    const l = this.curLevel();
    const op = Phaser.Utils.Array.GetRandom(l.ops);
    let a, b, ans;
    if (op === '×') { a = Phaser.Math.Between(1, l.a); b = Phaser.Math.Between(1, l.b); ans = a * b; }
    else if (op === '-') { a = Phaser.Math.Between(1, l.a); b = Phaser.Math.Between(1, Math.min(a, l.b)); ans = a - b; }
    else { a = Phaser.Math.Between(1, l.a); b = Phaser.Math.Between(1, l.b); ans = a + b; }
    this.answer = ans;
    this.probText.setText(`${a} ${op} ${b} = ?`);

    // Antwoordopties
    const opts = new Set([ans]);
    let tries = 0;
    while (opts.size < 4 && tries < 60) {
      const range = Math.max(5, Math.floor(ans * 0.3));
      let w = ans + Phaser.Math.Between(-range, range);
      if (w < 0) w = Phaser.Math.Between(0, ans + range);
      opts.add(w);
      tries++;
    }
    while (opts.size < 4) opts.add(ans + opts.size + 1);
    const arr = Phaser.Utils.Array.Shuffle([...opts]);
    this.answerBtns.forEach((btn, i) => {
      btn.label.setText(arr[i].toLocaleString('nl-NL'));
      btn.setData('val', arr[i]);
      this.setButtonColor(btn, 0xffffff, 0xffffff);
    });
  }

  checkAnswer(btn) {
    if (this.locked) return;
    this.locked = true;
    const val = btn.getData('val');
    if (val === this.answer) {
      this.setButtonColor(btn, 0x4ade80, 0x4ade80);
      SFX.correct();
      this.combo++;
      const mult = this.combo >= 10 ? 5 : this.combo >= 7 ? 4 : this.combo >= 5 ? 3 : this.combo >= 3 ? 2 : 1;
      const pts = (this.level * 20 + Math.max(this.answer, 5)) * mult;
      this.score += pts;
      this.floatText('+' + pts.toLocaleString('nl-NL') + (mult > 1 ? ` (x${mult}!)` : ''), btn.x, btn.y - 40, '#4ade80');
      this.xp++;
      if (this.xp >= this.curLevel().xp) {
        if (this.level >= this.cfg.levels.length) { this.updateUI(); this.win(); return; }
        this.level++; this.xp = 0;
        this.updateUI();
        this.levelUp();
        return;
      }
      this.updateUI();
      this.time.delayedCall(600, () => this.newProblem());
    } else {
      this.setButtonColor(btn, 0xf87171, 0xf87171);
      SFX.wrong();
      // toon juiste antwoord groen
      this.answerBtns.forEach((b) => {
        if (b.getData('val') === this.answer) this.setButtonColor(b, 0x4ade80, 0x4ade80);
      });
      this.combo = 0;
      this.updateUI();
      this.time.delayedCall(1100, () => this.newProblem());
    }
  }

  updateUI() {
    this.scoreText.setText(this.score.toLocaleString('nl-NL'));
    const l = this.curLevel();
    this.levelText.setText(`${l.i} Level ${this.level} — ${l.n}`);
    const pct = this.xp / this.curLevel().xp;
    this.xpBar.width = 280 * pct;
    if (this.combo >= 10) this.comboText.setText(`🔥 ${this.combo}x MEGA COMBO!`);
    else if (this.combo >= 5) this.comboText.setText(`🔥 ${this.combo}x combo!`);
    else if (this.combo >= 3) this.comboText.setText(`⚡ ${this.combo}x combo`);
    else this.comboText.setText('');
  }

  levelUp() {
    SFX.levelup();
    const { width, height } = this.scale;
    const l = this.curLevel();
    const cx = width / 2, cy = height / 2;
    this.overlay = [];
    const bg = this.add.graphics().setDepth(100);
    bg.fillStyle(0x000000, 0.8);
    bg.fillRect(0, 0, width, height);
    const ico = this.add.text(cx, cy - 60, l.i, { fontSize: '70px' }).setOrigin(0.5).setDepth(101);
    const t = this.add.text(cx, cy + 10, `Level ${this.level}!`, {
      fontFamily: 'Arial', fontSize: '36px', fontStyle: 'bold', color: '#fbbf24',
    }).setOrigin(0.5).setDepth(101);
    const sub = this.add.text(cx, cy + 50, `Welkom op ${l.n}!`, {
      fontFamily: 'Arial', fontSize: '18px', color: '#94a3b8',
    }).setOrigin(0.5).setDepth(101);
    const btn = this.add.text(cx, cy + 110, 'Doorgaan! 🚀', {
      fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold',
      color: '#1a1a2e', backgroundColor: '#fbbf24', padding: { x: 24, y: 12 },
    }).setOrigin(0.5).setDepth(102).setInteractive({ useHandCursor: true });
    const cleanup = [bg, ico, t, sub, btn];
    btn.on('pointerdown', () => { cleanup.forEach((o) => o.destroy()); this.newProblem(); });
    this.confetti();
  }

  win() {
    SFX.win();
    const record = saveHigh('math_' + this.diff, this.score);
    // sterren op basis van moeilijkheid
    const starMap = { easy: 3, medium: 5, hard: 8 };
    const stars = starMap[this.diff] || 3;
    const diffName = { easy: 'Verkenner', medium: 'Ruimtepiloot', hard: 'Sterrenheld' }[this.diff] || '';
    showReward(this, {
      title: 'Missie voltooid!',
      subtitle: `Eindscore: ${this.score.toLocaleString('nl-NL')}${record ? '\n🌟 Nieuw record!' : ''}`,
      stars,
      medal: 'math_' + this.diff,
      medalLabel: diffName,
      buttonText: 'Terug 🏠',
      onClose: () => this.scene.start('Menu'),
    });
  }

  // --- gedeelde helpers ---
  addStars() {
    const { width, height } = this.scale;
    for (let i = 0; i < 50; i++) {
      const s = this.add.image(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), 'star')
        .setAlpha(Phaser.Math.FloatBetween(0.2, 0.7)).setDepth(-1);
      this.tweens.add({ targets: s, alpha: 0.1, duration: Phaser.Math.Between(1500, 3000), yoyo: true, repeat: -1 });
    }
  }

  backBtn(scene) {
    const b = this.add.text(16, 16, '⬅ Terug', {
      fontFamily: 'Arial', fontSize: '16px', color: '#94a3b8',
      backgroundColor: '#1e293b', padding: { x: 10, y: 6 },
    }).setInteractive().setDepth(50);
    b.on('pointerdown', () => this.scene.start(scene));
  }

  floatText(txt, x, y, color) {
    const t = this.add.text(x, y, txt, {
      fontFamily: 'Arial', fontSize: '22px', fontStyle: 'bold', color,
    }).setOrigin(0.5).setDepth(60);
    this.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 900, onComplete: () => t.destroy() });
  }

  confetti() {
    const { width } = this.scale;
    const p = this.add.particles(width / 2, 100, 'star', {
      x: { min: 0, max: width }, y: -10,
      speedY: { min: 100, max: 300 }, speedX: { min: -50, max: 50 },
      scale: { start: 1.5, end: 0 }, lifespan: 2000, quantity: 2,
      tint: [0xf87171, 0xfbbf24, 0x4ade80, 0x60a5fa, 0xa855f7],
      blendMode: 'ADD',
    }).setDepth(99);
    this.time.delayedCall(2000, () => p.destroy());
  }
}
