// Gedeelde cijfer- en letterpaden (genormaliseerd 0-1), plus een
// herbruikbare schrijf-uitdaging die in elke Phaser-scene als overlay
// kan draaien. Zo gebruiken zowel het Schrijven-spel als Planeet Tikker
// dezelfde vormen en logica.

export const DIGIT_PATHS = {
  0: [[[.5, .14], [.34, .22], [.28, .5], [.34, .78], [.5, .86], [.66, .78], [.72, .5], [.66, .22], [.5, .14]]],
  1: [[[.35, .28], [.5, .15], [.5, .85]]],
  2: [[[.28, .3], [.32, .2], [.42, .14], [.56, .14], [.68, .22], [.7, .36],
       [.62, .5], [.46, .62], [.3, .76], [.26, .85], [.74, .85]]],
  3: [[[.3, .24], [.4, .15], [.56, .14], [.68, .22], [.68, .36], [.56, .46],
       [.44, .49], [.58, .52], [.7, .62], [.68, .78], [.54, .86], [.38, .85], [.28, .76]]],
  4: [[[.6, .14], [.26, .62], [.78, .62]], [[.6, .14], [.6, .86]]],
  5: [[[.68, .15], [.34, .15], [.3, .42], [.36, .38], [.52, .36], [.66, .44],
       [.7, .6], [.64, .78], [.48, .85], [.32, .82], [.26, .74]]],
  6: [[[.66, .18], [.5, .15], [.38, .24], [.3, .42], [.28, .62], [.32, .78],
       [.46, .86], [.6, .84], [.68, .72], [.66, .58], [.54, .5], [.4, .52], [.31, .6]]],
  7: [[[.28, .16], [.74, .16], [.62, .42], [.5, .64], [.42, .86]]],
  8: [[[.5, .15], [.36, .2], [.32, .32], [.42, .43], [.5, .48], [.58, .43],
       [.68, .32], [.64, .2], [.5, .15]],
      [[.5, .48], [.36, .56], [.3, .7], [.38, .82], [.5, .86], [.62, .82],
       [.7, .7], [.64, .56], [.5, .48]]],
  9: [[[.66, .42], [.6, .52], [.46, .55], [.34, .48], [.3, .34], [.36, .22],
       [.5, .15], [.62, .2], [.68, .34], [.68, .54], [.6, .72], [.48, .85], [.34, .85]]],
  10: [[[.16, .28], [.26, .15], [.26, .85]],
       [[.58, .16], [.46, .24], [.42, .42], [.42, .58], [.46, .76], [.58, .85],
        [.7, .76], [.74, .58], [.74, .42], [.7, .24], [.58, .16]]],
};

export const LETTER_PATHS = {
  A: [[[.2, .85], [.5, .15], [.8, .85]], [[.32, .55], [.68, .55]]],
  B: [[[.28, .15], [.28, .85]], [[.28, .15], [.6, .2], [.64, .35], [.5, .48], [.28, .5]], [[.28, .5], [.58, .54], [.68, .7], [.58, .82], [.28, .85]]],
  C: [[[.72, .26], [.56, .16], [.38, .2], [.28, .4], [.28, .6], [.38, .8], [.56, .84], [.72, .74]]],
  D: [[[.28, .15], [.28, .85]], [[.28, .15], [.58, .2], [.72, .4], [.72, .6], [.58, .8], [.28, .85]]],
  E: [[[.7, .15], [.3, .15], [.3, .85], [.7, .85]], [[.3, .5], [.58, .5]]],
  F: [[[.7, .15], [.3, .15], [.3, .85]], [[.3, .5], [.58, .5]]],
  G: [[[.72, .26], [.56, .16], [.38, .2], [.28, .4], [.28, .6], [.38, .8], [.58, .84], [.72, .72], [.72, .55], [.54, .55]]],
  H: [[[.28, .15], [.28, .85]], [[.72, .15], [.72, .85]], [[.28, .5], [.72, .5]]],
  I: [[[.5, .15], [.5, .85]]],
  J: [[[.7, .15], [.7, .68], [.6, .82], [.42, .84], [.32, .7]]],
  K: [[[.28, .15], [.28, .85]], [[.7, .15], [.28, .5], [.7, .85]]],
  L: [[[.3, .15], [.3, .85], [.7, .85]]],
  M: [[[.22, .85], [.22, .15], [.5, .55], [.78, .15], [.78, .85]]],
  N: [[[.28, .85], [.28, .15], [.72, .85], [.72, .15]]],
  O: [[[.5, .15], [.32, .24], [.26, .5], [.32, .76], [.5, .85], [.68, .76], [.74, .5], [.68, .24], [.5, .15]]],
  P: [[[.3, .85], [.3, .15], [.6, .2], [.68, .35], [.6, .48], [.3, .52]]],
  Q: [[[.5, .15], [.32, .24], [.26, .5], [.32, .76], [.5, .85], [.68, .76], [.74, .5], [.68, .24], [.5, .15]], [[.58, .68], [.78, .9]]],
  R: [[[.3, .85], [.3, .15], [.6, .2], [.68, .35], [.6, .48], [.3, .52]], [[.45, .52], [.72, .85]]],
  S: [[[.7, .24], [.54, .15], [.38, .18], [.3, .32], [.4, .46], [.6, .54], [.7, .68], [.62, .82], [.44, .85], [.3, .76]]],
  T: [[[.2, .15], [.8, .15]], [[.5, .15], [.5, .85]]],
  U: [[[.28, .15], [.28, .65], [.38, .82], [.5, .85], [.62, .82], [.72, .65], [.72, .15]]],
  V: [[[.24, .15], [.5, .85], [.76, .15]]],
  W: [[[.18, .15], [.34, .85], [.5, .4], [.66, .85], [.82, .15]]],
  X: [[[.28, .15], [.72, .85]], [[.72, .15], [.28, .85]]],
  Y: [[[.28, .15], [.5, .5], [.72, .15]], [[.5, .5], [.5, .85]]],
  Z: [[[.28, .15], [.72, .15], [.28, .85], [.72, .85]]],
};

export const RAINBOW = [0xf87171, 0xfb923c, 0xfbbf24, 0x4ade80, 0x22d3ee, 0x60a5fa, 0xa855f7];

export function randomGlyph() {
  const r = Math.random();
  // Adrian houdt van de 0: extra grote kans om juist een nul te schrijven.
  if (r < 0.3) return zeroGlyph();
  if (r < 0.65) {
    const n = Math.floor(Math.random() * 9) + 1; // 1..9 (sla 10 over: te complex tussendoor)
    return { label: String(n), paths: DIGIT_PATHS[n] };
  }
  const letters = Object.keys(LETTER_PATHS);
  const ch = letters[Math.floor(Math.random() * letters.length)];
  return { label: ch, paths: LETTER_PATHS[ch] };
}

// Altijd een nul — voor de "nieuwe nul!"-mijlpalen in Planeet Tikker.
export function zeroGlyph() {
  return { label: '0', paths: DIGIT_PATHS[0] };
}

// Een schrijf-uitdaging als overlay binnen een bestaande scene.
// Roep aan met new TraceChallenge(scene, { label, paths, onDone }).
// De speler moet het teken overtrekken; daarna verdwijnt de overlay en
// wordt onDone() aangeroepen.
export class TraceChallenge {
  constructor(scene, opts) {
    this.scene = scene;
    this.label = opts.label;
    this.rawPaths = opts.paths;
    this.onDone = opts.onDone;
    this.depth = opts.depth || 500;
    this.items = [];
    this.build();
  }

  build() {
    const s = this.scene;
    const { width, height } = s.scale;
    const D = this.depth;

    const bg = s.add.graphics().setScrollFactor(0).setDepth(D);
    bg.fillStyle(0x0b0d1a, 1);
    bg.fillRect(0, 0, width, height);
    this.items.push(bg);

    const title = s.add.text(width / 2, 58, `✏️ Schrijf: ${this.label}`, {
      fontFamily: 'Arial', fontSize: '26px', fontStyle: 'bold', color: '#fff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1);
    this.items.push(title);

    this.msg = s.add.text(width / 2, 96, 'Begin bij de groene stip! 🟢', {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#fbbf24',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1);
    this.items.push(this.msg);

    // Tekengebied
    const m = Math.min(width - 80, height - 280);
    this.area = { x: (width - m) / 2, y: 130, w: m, h: m };

    this.guide = s.add.graphics().setScrollFactor(0).setDepth(D + 2);
    this.userG = s.add.graphics().setScrollFactor(0).setDepth(D + 3);
    this.items.push(this.guide, this.userG);

    // Bouw strokes + checkpoints
    const pad = this.area.w * 0.12;
    const sz = this.area.w - pad * 2;
    const ox = this.area.x + pad, oy = this.area.y + (this.area.h - sz) / 2;
    this.strokes = this.rawPaths.map((st) => st.map(([nx, ny]) => ({ x: ox + nx * sz, y: oy + ny * sz })));
    this.check = []; this.checkHit = []; this.strokeOf = []; this.strokeProgress = [];
    this.strokes.forEach((st, si) => {
      this.strokeProgress[si] = 0;
      for (let i = 0; i < st.length - 1; i++) {
        const a = st[i], b = st[i + 1];
        const segLen = Math.hypot(b.x - a.x, b.y - a.y);
        const steps = Math.max(3, Math.round(segLen / (sz * 0.05)));
        for (let k = 0; k < steps; k++) {
          this.check.push({ x: a.x + (b.x - a.x) * k / steps, y: a.y + (b.y - a.y) * k / steps });
          this.checkHit.push(false); this.strokeOf.push(si);
        }
      }
      const last = st[st.length - 1];
      this.check.push({ x: last.x, y: last.y }); this.checkHit.push(false); this.strokeOf.push(si);
    });
    this.strokeCheckIdx = this.strokes.map((_, si) =>
      this.check.map((c, i) => (this.strokeOf[i] === si ? i : -1)).filter((i) => i >= 0));

    // Input — eigen handlers, met hoge prioriteit
    this.drawing = false; this.activeStroke = 0; this.strayed = false; this.userPts = [];
    this.onDown = (p) => this.pointerDown(p);
    this.onMove = (p) => this.pointerMove(p);
    this.onUp = () => this.pointerUp();
    s.input.on('pointerdown', this.onDown);
    s.input.on('pointermove', this.onMove);
    s.input.on('pointerup', this.onUp);

    this.tolFactor = 0.075; // iets vergevingsgezind tussendoor
    this.passThreshold = 0.8;
    this.drawGuide();
  }

  inArea(p) {
    return p.x >= this.area.x && p.x <= this.area.x + this.area.w &&
           p.y >= this.area.y && p.y <= this.area.y + this.area.h;
  }

  firstUnfinished() {
    for (let si = 0; si < this.strokes.length; si++) {
      const idxs = this.strokeCheckIdx[si];
      const hit = idxs.filter((i) => this.checkHit[i]).length;
      if (hit / idxs.length < this.passThreshold) return si;
    }
    return -1;
  }

  pointerDown(p) {
    if (!this.inArea(p)) return;
    const si = this.firstUnfinished();
    if (si === -1) return;
    const start = this.strokes[si][0];
    const startTol = Math.max(34, this.area.w * 0.12);
    if (Math.hypot(p.x - start.x, p.y - start.y) > startTol) {
      this.msg.setText('Begin bij de groene stip! 🟢');
      this.drawing = false;
      return;
    }
    this.activeStroke = si; this.drawing = true; this.strayed = false;
    this.userPts = [{ x: p.x, y: p.y }];
    this.mark(p);
  }

  pointerMove(p) {
    if (!this.drawing) return;
    this.userPts.push({ x: p.x, y: p.y });
    this.mark(p);
    this.drawUser();
  }

  pointerUp() {
    if (!this.drawing) return;
    this.drawing = false;
    const idxs = this.strokeCheckIdx[this.activeStroke];
    const hit = idxs.filter((i) => this.checkHit[i]).length / idxs.length;
    if (this.strayed || hit < this.passThreshold) {
      this.msg.setText('Bijna! Probeer de lijn netjes te volgen ✏️');
      idxs.forEach((i) => { this.checkHit[i] = false; });
      this.strokeProgress[this.activeStroke] = 0;
      this.userPts = []; this.userG.clear(); this.drawGuide();
      return;
    }
    if (this.firstUnfinished() === -1) { this.finish(); }
    else { this.msg.setText('Top! Nu de volgende lijn 🟢'); this.userPts = []; this.userG.clear(); this.drawGuide(); }
  }

  mark(p) {
    const tol = Math.max(20, this.area.w * this.tolFactor);
    const idxs = this.strokeCheckIdx[this.activeStroke];
    let prog = this.strokeProgress[this.activeStroke];
    let nearest = Infinity;
    for (let j = 0; j < idxs.length; j++) {
      const c = this.check[idxs[j]];
      const d = Math.hypot(c.x - p.x, c.y - p.y);
      if (d < nearest) nearest = d;
    }
    if (nearest > tol * 2.2) this.strayed = true;
    while (prog < idxs.length) {
      const c = this.check[idxs[prog]];
      if (Math.hypot(c.x - p.x, c.y - p.y) <= tol) { this.checkHit[idxs[prog]] = true; prog++; }
      else break;
    }
    this.strokeProgress[this.activeStroke] = prog;
  }

  drawGuide() {
    const g = this.guide;
    g.clear();
    const lineW = Math.max(14, this.area.w * 0.05);
    for (const st of this.strokes) {
      g.lineStyle(lineW, 0x60a5fa, 0.55);
      g.beginPath(); g.moveTo(st[0].x, st[0].y);
      for (let i = 1; i < st.length; i++) g.lineTo(st[i].x, st[i].y);
      g.strokePath();
    }
    for (let i = 0; i < this.check.length; i++) {
      if (this.checkHit[i]) {
        g.fillStyle(RAINBOW[i % RAINBOW.length], 1);
        g.fillCircle(this.check[i].x, this.check[i].y, Math.max(6, this.area.w * 0.022));
      }
    }
    for (const st of this.strokes) {
      g.fillStyle(0x4ade80, 1); g.fillCircle(st[0].x, st[0].y, Math.max(10, this.area.w * 0.032));
      const last = st[st.length - 1];
      g.fillStyle(0xf87171, 1); g.fillCircle(last.x, last.y, Math.max(7, this.area.w * 0.024));
    }
  }

  drawUser() {
    const g = this.userG;
    g.clear();
    if (this.userPts.length < 2) return;
    g.lineStyle(Math.max(5, this.area.w * 0.018), 0xffffff, 1);
    g.beginPath(); g.moveTo(this.userPts[0].x, this.userPts[0].y);
    for (let i = 1; i < this.userPts.length; i++) g.lineTo(this.userPts[i].x, this.userPts[i].y);
    g.strokePath();
  }

  finish() {
    const s = this.scene;
    this.msg.setText('Super! 🎉');
    // confetti
    const p = s.add.particles(s.scale.width / 2, 120, 'star', {
      x: { min: 0, max: s.scale.width }, y: -10,
      speedY: { min: 120, max: 300 }, scale: { start: 1.4, end: 0 },
      lifespan: 1400, quantity: 3, tint: RAINBOW, blendMode: 'ADD',
    }).setScrollFactor(0).setDepth(this.depth + 5);
    s.time.delayedCall(1400, () => p.destroy());
    s.time.delayedCall(700, () => this.destroy());
  }

  destroy() {
    const s = this.scene;
    s.input.off('pointerdown', this.onDown);
    s.input.off('pointermove', this.onMove);
    s.input.off('pointerup', this.onUp);
    this.items.forEach((o) => o.destroy());
    if (this.onDone) this.onDone();
  }
}
