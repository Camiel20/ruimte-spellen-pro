import Phaser from 'phaser';
import { SFX } from '../sound.js';
import { showReward } from '../reward.js';
import { getSetting } from '../progress.js';

// Schrijven — volg cijfers, letters of je eigen naam met je vinger.
// Per goed geschreven teken punten + sterren.

// Cijferpaden, genormaliseerd 0-1. Elk teken = lijst van strokes.
const DIGIT_PATHS = {
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

// Hoofdletter-paden (eenvoudige, kindvriendelijke vormen).
const LETTER_PATHS = {
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

const RAINBOW = [0xf87171, 0xfb923c, 0xfbbf24, 0x4ade80, 0x22d3ee, 0x60a5fa, 0xa855f7];

export default class TraceScene extends Phaser.Scene {
  constructor() { super('Trace'); }

  init(data) {
    this.mode = (data && data.mode) || 'digits';
  }

  create() {
    const { width, height } = this.scale;

    // Strengheid hangt af van de moeilijkheid: makkelijk = vergevingsgezind,
    // moeilijk = je moet preciezer op de lijn blijven.
    const diff = getSetting('difficulty');
    this.tolFactor = diff === 'makkelijk' ? 0.085 : diff === 'moeilijk' ? 0.05 : 0.062;
    this.passThreshold = diff === 'makkelijk' ? 0.78 : diff === 'moeilijk' ? 0.95 : 0.9;

    for (let i = 0; i < 40; i++) {
      this.add.image(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), 'star')
        .setAlpha(Phaser.Math.FloatBetween(0.15, 0.5)).setDepth(-1);
    }

    const back = this.add.text(16, 16, '⬅ Terug', {
      fontFamily: 'Arial', fontSize: '16px', color: '#94a3b8',
      backgroundColor: '#1e293b', padding: { x: 10, y: 6 },
    }).setInteractive().setDepth(50);
    back.on('pointerdown', () => this.scene.start('Menu'));

    // Bouw de reeks tekens op basis van de modus.
    this.items = this.buildItems();
    this.index = 0;
    this.score = 0;

    this.hud = this.add.text(width / 2, 30, '', {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#fff',
    }).setOrigin(0.5);
    this.msg = this.add.text(width / 2, 64, '', {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#fbbf24',
    }).setOrigin(0.5);

    // Tekengebied
    this.area = { x: 40, y: 100, w: width - 80, h: width - 80 };
    this.graphics = this.add.graphics();
    this.userGraphics = this.add.graphics();

    // Retry knop
    const retry = this.add.text(width / 2, this.area.y + this.area.h + 40, '↻ Opnieuw', {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold',
      color: '#60a5fa', backgroundColor: '#1e293b', padding: { x: 18, y: 10 },
    }).setOrigin(0.5).setInteractive();
    retry.on('pointerdown', () => this.loadDigit());

    // Teken-input
    this.drawing = false;
    this.userPts = [];
    this.input.on('pointerdown', (p) => this.onDown(p));
    this.input.on('pointermove', (p) => this.onMove(p));
    this.input.on('pointerup', () => this.onUp());

    this.loadDigit();
  }

  buildItems() {
    if (this.mode === 'letters') {
      return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    }
    if (this.mode === 'name') {
      let name = (getSetting('childName') || 'ADRIAN').toUpperCase();
      // alleen letters die we kennen
      const arr = name.split('').filter((ch) => LETTER_PATHS[ch]);
      return arr.length ? arr : ['A', 'D', 'R', 'I', 'A', 'N'];
    }
    // cijfers 1..10
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }

  // Het huidige teken (cijfer of letter)
  curItem() { return this.items[this.index]; }
  curPaths() {
    const it = this.curItem();
    return (typeof it === 'number') ? DIGIT_PATHS[it] : LETTER_PATHS[it];
  }
  curLabel() {
    const it = this.curItem();
    return (it === 10) ? '10' : String(it);
  }

  loadDigit() {
    this.done = false;
    this.drawing = false;
    this.userPts = [];
    this.userGraphics.clear();

    // Veiligheid: sla tekens zonder gedefinieerd pad over
    if (!this.curPaths()) {
      if (this.index >= this.items.length - 1) { this.win(); return; }
      this.index++;
      this.loadDigit();
      return;
    }

    const pad = this.area.w * 0.18;
    const sz = Math.min(this.area.w, this.area.h) - pad * 2;
    const ox = this.area.x + (this.area.w - sz) / 2;
    const oy = this.area.y + (this.area.h - sz) / 2;

    const raw = this.curPaths();
    this.strokes = raw.map((stroke) => stroke.map(([nx, ny]) => ({ x: ox + nx * sz, y: oy + ny * sz })));

    // Bouw dichte checkpoints per stroke. We onthouden bij elk checkpoint
    // tot welke stroke het hoort, zodat we per lijn de volgorde checken.
    this.check = [];
    this.checkHit = [];
    this.strokeOf = [];
    this.strokeProgress = []; // hoever je in elke stroke bent (sequentieel)
    this.strokes.forEach((st, si) => {
      this.strokeProgress[si] = 0;
      for (let i = 0; i < st.length - 1; i++) {
        const a = st[i], b = st[i + 1];
        const segLen = Math.hypot(b.x - a.x, b.y - a.y);
        const steps = Math.max(3, Math.round(segLen / (sz * 0.05)));
        for (let k = 0; k < steps; k++) {
          this.check.push({ x: a.x + (b.x - a.x) * k / steps, y: a.y + (b.y - a.y) * k / steps });
          this.checkHit.push(false);
          this.strokeOf.push(si);
        }
      }
      const last = st[st.length - 1];
      this.check.push({ x: last.x, y: last.y });
      this.checkHit.push(false);
      this.strokeOf.push(si);
    });
    // Indices per stroke (voor sequentiële controle)
    this.strokeCheckIdx = this.strokes.map((_, si) =>
      this.check.map((c, i) => (this.strokeOf[i] === si ? i : -1)).filter((i) => i >= 0));
    this.activeStroke = 0;
    this.strayed = false;

    const kind = (typeof this.curItem() === 'number') ? 'Cijfer' : 'Letter';
    const prefix = this.mode === 'name' ? 'Naam' : kind;
    this.hud.setText(`📝 ${prefix}: ${this.curLabel()}    🏆 ${this.score.toLocaleString('nl-NL')}`);
    this.msg.setText('Volg de lijn met je vinger! ✏️');
    this.drawGuide();
  }

  drawGuide() {
    const g = this.graphics;
    g.clear();

    // Toon het teken groot en vaag op de achtergrond ter herkenning
    if (!this.ghostText) {
      const ghostSize = Math.min(220, Math.round(this.area.h * 0.55));
      this.ghostText = this.add.text(this.area.x + this.area.w / 2, this.area.y + this.area.h / 2, this.curLabel(), {
        fontFamily: 'Arial', fontSize: `${ghostSize}px`, fontStyle: 'bold', color: '#1e293b',
      }).setOrigin(0.5).setDepth(-1);
    }
    const label = this.curLabel();
    // Verberg de achtergrond-letter bij meerletterige tekens (zoals 10)
    this.ghostText.setVisible(label.length === 1);
    if (label.length === 1) this.ghostText.setText(label);

    const lineW = Math.max(16, this.area.w * 0.055);
    for (const st of this.strokes) {
      // Buitenrand (donker) voor diepte
      g.lineStyle(lineW + 4, 0x1e3a8a, 0.4);
      g.beginPath();
      g.moveTo(st[0].x, st[0].y);
      for (let i = 1; i < st.length; i++) g.lineTo(st[i].x, st[i].y);
      g.strokePath();
      // Binnenlijn (lichtblauw)
      g.lineStyle(lineW, 0x60a5fa, 0.3);
      g.beginPath();
      g.moveTo(st[0].x, st[0].y);
      for (let i = 1; i < st.length; i++) g.lineTo(st[i].x, st[i].y);
      g.strokePath();
    }

    // Gevulde checkpoints (regenboog) — laat de voortgang zien
    for (let i = 0; i < this.check.length; i++) {
      if (this.checkHit[i]) {
        g.fillStyle(RAINBOW[i % RAINBOW.length], 1);
        g.fillCircle(this.check[i].x, this.check[i].y, Math.max(7, this.area.w * 0.025));
      }
    }

    // Start (groen) en eind (rood) per stroke, bovenop
    for (const st of this.strokes) {
      g.fillStyle(0x4ade80, 1);
      g.fillCircle(st[0].x, st[0].y, Math.max(11, this.area.w * 0.035));
      const last = st[st.length - 1];
      g.fillStyle(0xf87171, 1);
      g.fillCircle(last.x, last.y, Math.max(8, this.area.w * 0.026));
    }
  }

  inArea(p) {
    return p.x >= this.area.x && p.x <= this.area.x + this.area.w &&
           p.y >= this.area.y && p.y <= this.area.y + this.area.h;
  }

  onDown(p) {
    if (this.done || !this.inArea(p)) return;
    // Welke stroke is nog niet af? Begin daar. De veeg moet dicht bij
    // het beginpunt van die stroke starten.
    const si = this.firstUnfinishedStroke();
    if (si === -1) return;
    const start = this.strokes[si][0];
    const startTol = Math.max(34, this.area.w * 0.11);
    if (Math.hypot(p.x - start.x, p.y - start.y) > startTol) {
      // Te ver van het beginpunt: geef een hint maar tel niet mee
      this.msg.setText('Begin bij de groene stip! 🟢');
      this.drawing = false;
      return;
    }
    this.activeStroke = si;
    this.drawing = true;
    this.strayed = false;
    this.userPts = [{ x: p.x, y: p.y }];
    this.markNear(p);
  }

  firstUnfinishedStroke() {
    for (let si = 0; si < this.strokes.length; si++) {
      const idxs = this.strokeCheckIdx[si];
      const hit = idxs.filter((i) => this.checkHit[i]).length;
      if (hit / idxs.length < this.passThreshold) return si;
    }
    return -1;
  }

  onMove(p) {
    if (!this.drawing || this.done) return;
    this.userPts.push({ x: p.x, y: p.y });
    this.markNear(p);
    this.drawUser();
    this.drawGuide();
  }

  onUp() {
    if (!this.drawing || this.done) return;
    this.drawing = false;

    const idxs = this.strokeCheckIdx[this.activeStroke];
    const strokeHit = idxs.filter((i) => this.checkHit[i]).length / idxs.length;

    if (this.strayed) {
      // Te ver van de lijn geweest: deze lijn telt niet
      this.msg.setText('Blijf op de lijn! Probeer nog eens ✏️');
      SFX.wrong();
      idxs.forEach((i) => { this.checkHit[i] = false; });
      this.strokeProgress[this.activeStroke] = 0;
      this.userPts = [];
      this.userGraphics.clear();
      this.drawGuide();
      return;
    }

    if (strokeHit >= this.passThreshold) {
      // Deze lijn is netjes gevolgd
      if (this.firstUnfinishedStroke() === -1) {
        this.success(); // alle lijnen klaar
      } else {
        this.msg.setText('Top! Nu de volgende lijn 🟢');
        this.userPts = [];
        this.userGraphics.clear();
        this.drawGuide();
      }
    } else {
      // Lijn niet ver genoeg gevolgd: reset deze lijn
      this.msg.setText('Bijna! Volg de hele lijn van groen naar rood ✏️');
      idxs.forEach((i) => { this.checkHit[i] = false; });
      this.strokeProgress[this.activeStroke] = 0;
      this.userPts = [];
      this.userGraphics.clear();
      this.drawGuide();
    }
  }

  markNear(p) {
    // Strenge, sequentiële controle binnen de actieve stroke.
    // Het volgende checkpoint moet als eerstvolgende worden geraakt;
    // je kunt dus niet vals spelen door wild te krassen.
    const tol = Math.max(20, this.area.w * this.tolFactor); // strengheid op basis van moeilijkheid
    const idxs = this.strokeCheckIdx[this.activeStroke];
    let prog = this.strokeProgress[this.activeStroke];

    // Afdwalen? Meet afstand tot het DICHTSTBIJZIJNDE punt van de hele
    // actieve lijn (niet alleen de resterende), zodat normaal volgen niet
    // als afdwalen telt, maar ver wegkrassen wel.
    let nearestDist = Infinity;
    for (let j = 0; j < idxs.length; j++) {
      const c = this.check[idxs[j]];
      const d = Math.hypot(c.x - p.x, c.y - p.y);
      if (d < nearestDist) nearestDist = d;
    }
    if (nearestDist > tol * 2.2) this.strayed = true;

    // Markeer opeenvolgende checkpoints die binnen bereik liggen
    while (prog < idxs.length) {
      const c = this.check[idxs[prog]];
      if (Math.hypot(c.x - p.x, c.y - p.y) <= tol) {
        this.checkHit[idxs[prog]] = true;
        prog++;
      } else {
        break;
      }
    }
    this.strokeProgress[this.activeStroke] = prog;
  }

  drawUser() {
    const g = this.userGraphics;
    g.clear();
    g.lineStyle(Math.max(5, this.area.w * 0.018), 0xffffff, 1);
    g.beginPath();
    g.moveTo(this.userPts[0].x, this.userPts[0].y);
    for (let i = 1; i < this.userPts.length; i++) g.lineTo(this.userPts[i].x, this.userPts[i].y);
    g.strokePath();
  }

  success() {
    this.done = true;
    this.score += 10000;
    SFX.levelup();
    const kind = (typeof this.curItem() === 'number') ? 'Cijfer' : 'Letter';
    this.hud.setText(`📝 ${kind}: ${this.curLabel()}    🏆 ${this.score.toLocaleString('nl-NL')}`);
    this.msg.setText(`Super! ${this.curLabel()} geschreven! 🎉`);
    this.confetti();
    this.time.delayedCall(1400, () => {
      if (this.index >= this.items.length - 1) {
        this.win();
      } else {
        this.index++;
        this.loadDigit();
      }
    });
  }

  win() {
    SFX.win();
    const titles = {
      digits: 'Alle cijfers gehaald!',
      letters: 'Het hele alfabet gehaald!',
      name: 'Je naam geschreven!',
    };
    const medals = { digits: 'trace_digits', letters: 'trace_letters', name: 'trace_name' };
    const labels = { digits: 'Cijferheld', letters: 'Letterheld', name: 'Naamheld' };
    showReward(this, {
      title: titles[this.mode] || 'Goed gedaan!',
      subtitle: `Score: ${this.score.toLocaleString('nl-NL')}`,
      stars: this.mode === 'letters' ? 10 : 5,
      medal: medals[this.mode],
      medalLabel: labels[this.mode],
      buttonText: 'Terug 🏠',
      onClose: () => this.scene.start('Menu'),
    });
  }

  confetti() {
    const { width } = this.scale;
    const p = this.add.particles(width / 2, 100, 'star', {
      x: { min: 0, max: width }, y: -10,
      speedY: { min: 100, max: 300 }, speedX: { min: -50, max: 50 },
      scale: { start: 1.5, end: 0 }, lifespan: 1800, quantity: 2,
      tint: RAINBOW, blendMode: 'ADD',
    }).setDepth(99);
    this.time.delayedCall(1800, () => p.destroy());
  }
}
