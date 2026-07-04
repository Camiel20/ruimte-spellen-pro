import Phaser from 'phaser';
import { SFX } from '../sound.js';
import { Voice } from '../voice.js';
import { showReward } from '../reward.js';
import { getSetting } from '../progress.js';
import { DIGIT_PATHS, LETTER_PATHS, RAINBOW } from '../glyphs.js';
import { luchtAchtergrond, terugKnop, maakNul } from '../theme.js';

// Schrijven — volg cijfers, letters of je eigen naam met je vinger op een
// wit "schriftje" met liniatuur. Nul kijkt mee en moedigt aan.
// De teken-paden komen uit src/glyphs.js (gedeeld met Planeet Tikker).

export default class TraceScene extends Phaser.Scene {
  constructor() { super('Trace'); }

  init(data) {
    this.mode = (data && data.mode) || 'digits';
  }

  create() {
    const { width, height } = this.scale;

    // Strengheid hangt af van de moeilijkheid: makkelijk = vergevingsgezind,
    // moeilijk = je moet preciezer op de lijn blijven.
    // Vaste, kindvriendelijke strengheid (de oude globale moeilijkheids-knop
    // is verwijderd; spellen regelen hun moeilijkheid nu zelf).
    this.tolFactor = 0.062;
    this.passThreshold = 0.9;

    luchtAchtergrond(this);
    terugKnop(this);

    // Bouw de reeks tekens op basis van de modus.
    this.items = this.buildItems();
    this.index = 0;
    this.score = 0;

    this.hud = this.add.text(width / 2, 28, '', {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#1f2d3a',
      backgroundColor: '#ffffffdd', padding: { x: 14, y: 6 },
    }).setOrigin(0.5).setDepth(10);
    this.msg = this.add.text(width / 2, 64, '', {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#3b5a72',
    }).setOrigin(0.5).setDepth(10);

    // Tekengebied: een wit "schriftje" met zachte liniatuur
    this.area = { x: 40, y: 92, w: width - 80, h: width - 80 };
    const kaart = this.add.graphics().setDepth(1);
    kaart.fillStyle(0xffffff, 0.95);
    kaart.fillRoundedRect(this.area.x - 14, this.area.y - 10, this.area.w + 28, this.area.h + 20, 22);
    kaart.lineStyle(3, 0xbcd9ee, 1);
    kaart.strokeRoundedRect(this.area.x - 14, this.area.y - 10, this.area.w + 28, this.area.h + 20, 22);
    kaart.lineStyle(1.5, 0xdbeafe, 1);
    for (let ly = this.area.y + 40; ly < this.area.y + this.area.h; ly += 44) {
      kaart.lineBetween(this.area.x, ly, this.area.x + this.area.w, ly);
    }

    this.graphics = this.add.graphics().setDepth(3);
    this.userGraphics = this.add.graphics().setDepth(4);

    // Voortgangs-bolletjes: één per teken in de reeks
    this.bolletjes = [];
    const bTussen = Math.min(20, (width - 60) / this.items.length);
    const bStart = width / 2 - ((this.items.length - 1) * bTussen) / 2;
    for (let i = 0; i < this.items.length; i++) {
      this.bolletjes.push(
        this.add.circle(bStart + i * bTussen, this.area.y + this.area.h + 32, 6, 0xffffff, 0.8)
          .setStrokeStyle(1.5, 0x94a3b8).setDepth(10)
      );
    }

    // Nul kijkt mee en moedigt aan
    this.nulCoach = maakNul(this, 66, height - 116, 34).setDepth(10);
    this.tweens.add({
      targets: this.nulCoach, y: height - 122, duration: 1300,
      yoyo: true, repeat: -1, ease: 'Sine.inOut',
    });
    this.time.addEvent({ delay: 2800, loop: true, callback: () => this.nulCoach.knipper() });

    // Retry knop
    const retry = this.add.text(width / 2, height - 108, '↻ Opnieuw', {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold',
      color: '#1d4ed8', backgroundColor: '#ffffff', padding: { x: 18, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);
    retry.on('pointerdown', () => { SFX.click(); this.loadDigit(); });

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
    // cijfers 0..10 — de nul hoort erbij! (Adrian's favoriet)
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
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
    // Cijfers worden "voorgelezen" met een vrolijk klankje
    if (typeof this.curItem() === 'number') Voice.number(this.curItem());
    this.updateBolletjes();
    this.drawGuide();
  }

  updateBolletjes() {
    this.bolletjes.forEach((b, i) => {
      b.setFillStyle(i < this.index ? 0x57b947 : 0xffffff, i < this.index ? 1 : 0.8);
      if (i === this.index) b.setStrokeStyle(2.5, 0x3b82f6);
      else b.setStrokeStyle(1.5, 0x94a3b8);
    });
  }

  drawGuide() {
    const g = this.graphics;
    g.clear();

    // Toon het teken groot en vaag op het schriftje ter herkenning
    if (!this.ghostText) {
      const ghostSize = Math.min(220, Math.round(this.area.h * 0.55));
      this.ghostText = this.add.text(this.area.x + this.area.w / 2, this.area.y + this.area.h / 2, this.curLabel(), {
        fontFamily: 'Arial', fontSize: `${ghostSize}px`, fontStyle: 'bold', color: '#e8eef5',
      }).setOrigin(0.5).setDepth(2).setScale(1);
    }
    const label = this.curLabel();
    // Verberg de achtergrond-letter bij meerletterige tekens (zoals 10)
    this.ghostText.setVisible(label.length === 1);
    if (label.length === 1) this.ghostText.setText(label);

    const lineW = Math.max(16, this.area.w * 0.055);
    for (const st of this.strokes) {
      // Buitenrand (blauw) voor diepte
      g.lineStyle(lineW + 4, 0x3b82f6, 0.3);
      g.beginPath();
      g.moveTo(st[0].x, st[0].y);
      for (let i = 1; i < st.length; i++) g.lineTo(st[i].x, st[i].y);
      g.strokePath();
      // Binnenbaan (heel licht blauw — de "schrijfweg" op het witte schriftje)
      g.lineStyle(lineW, 0xdbeafe, 1);
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
      SFX.oops();
      Voice.cue('oops');
      this.tweens.add({ targets: this.nulCoach, x: '+=5', duration: 55, yoyo: true, repeat: 3 });
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
    // Je "krijtje" heeft per teken een eigen regenboogkleur
    const g = this.userGraphics;
    g.clear();
    g.lineStyle(Math.max(6, this.area.w * 0.02), RAINBOW[this.index % RAINBOW.length], 1);
    g.beginPath();
    g.moveTo(this.userPts[0].x, this.userPts[0].y);
    for (let i = 1; i < this.userPts.length; i++) g.lineTo(this.userPts[i].x, this.userPts[i].y);
    g.strokePath();
  }

  success() {
    this.done = true;
    this.score += 10000;
    SFX.levelup();
    Voice.cue(this.index % 3 === 2 ? 'cheer' : 'great');
    const kind = (typeof this.curItem() === 'number') ? 'Cijfer' : 'Letter';
    this.hud.setText(`📝 ${kind}: ${this.curLabel()}    🏆 ${this.score.toLocaleString('nl-NL')}`);
    this.msg.setText(`Super! ${this.curLabel()} geschreven! 🎉`);
    this.confetti();
    // Nul juicht: zwaaien + hupje; het teken maakt een vreugdesprongetje
    this.tweens.add({ targets: this.nulCoach.arm, angle: { from: -8, to: 30 }, duration: 130, yoyo: true, repeat: 4 });
    this.tweens.add({ targets: this.nulCoach, y: '-=16', duration: 170, yoyo: true, repeat: 1, ease: 'Quad.easeOut' });
    if (this.ghostText.visible) {
      this.tweens.add({ targets: this.ghostText, scale: 1.15, duration: 200, yoyo: true, ease: 'Back.easeOut' });
    }
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
