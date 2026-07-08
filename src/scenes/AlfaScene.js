import Phaser from 'phaser';
import { SFX } from '../sound.js';
import { Voice } from '../voice.js';
import { showReward } from '../reward.js';
import { luchtAchtergrond, terugKnop, maakNul } from '../theme.js';
import { LOWER_PATHS, RAINBOW } from '../glyphs.js';
import { WERELDEN, letters } from '../alfaLogic.js';
import { tekenIcoon } from '../alfaIconen.js';

// ===== ALFA-BLOKKEN — het schrijfspel =====
// Schrijf een woord in KLEINE letters, letter voor letter. Elke letter komt
// tot leven als blok-figuurtje in de woord-rij (Alphablocks-stijl); als het
// woord af is pakken de blokjes elkaars hand en klinkt het hele woord.
// Het overtrekken hergebruikt de bewezen aanpak van het Schrijven-spel
// (sequentiële checkpoints + afdwaal-detectie), maar met kleine letters op een
// echte schrijf-liniatuur zodat de groottes kloppen.

// Liniatuur-banden (dezelfde metriek waarop de letters in glyphs.js staan).
const BAND = { asc: 0.14, xtop: 0.44, base: 0.82, desc: 0.98 };

export default class AlfaScene extends Phaser.Scene {
  constructor() { super('Alfa'); }

  init(data) {
    this.wereldIdx = (data && data.wereld) || 0;
  }

  create() {
    const { width, height } = this.scale;
    this.wereld = WERELDEN[this.wereldIdx] || WERELDEN[0];

    luchtAchtergrond(this);
    terugKnop(this);

    // Strengheid: kindvriendelijk (iets vergevingsgezind).
    this.tolFactor = 0.078;
    this.passThreshold = 0.8;

    this.hud = this.add.text(width / 2, 26, '', {
      fontFamily: 'Arial', fontSize: '17px', fontStyle: 'bold', color: '#1f2d3a',
      backgroundColor: '#ffffffdd', padding: { x: 14, y: 6 },
    }).setOrigin(0.5).setDepth(10);

    this.msg = this.add.text(width / 2, 58, '', {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#3b5a72',
    }).setOrigin(0.5).setDepth(10);

    // Woord-plaatje (wordt per woord getekend)
    this.iconLaag = this.add.container(width / 2, 118).setDepth(9);

    // De woord-rij (Alphablock-slots) komt hier (per woord opgebouwd)
    this.rijY = 208;

    // Schrijf-kaart met liniatuur
    const cardX = 36, cardY = 262, cardW = width - 72, cardH = 384;
    const side = Math.min(cardW - 24, cardH - 24);
    this.box = { ox: cardX + (cardW - side) / 2, oy: cardY + (cardH - side) / 2, sz: side };
    const kaart = this.add.graphics().setDepth(1);
    kaart.fillStyle(0xffffff, 0.96); kaart.fillRoundedRect(cardX, cardY, cardW, cardH, 22);
    kaart.lineStyle(3, 0xbcd9ee, 1); kaart.strokeRoundedRect(cardX, cardY, cardW, cardH, 22);
    this.tekenLiniatuur(kaart, cardX + 14, this.box.ox, this.box.oy, this.box.sz, cardW - 28);

    this.guide = this.add.graphics().setDepth(3);   // voorgedrukte letter + checkpoints
    this.userG = this.add.graphics().setDepth(4);   // jouw krijt-lijn

    // Nul de schrijfcoach
    this.nul = maakNul(this, 60, height - 92, 32).setDepth(10);
    this.tweens.add({ targets: this.nul, y: height - 98, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.time.addEvent({ delay: 3000, loop: true, callback: () => this.nul.knipper && this.nul.knipper() });

    // Opnieuw-knop
    const retry = this.add.text(width - 74, height - 84, '↻', {
      fontFamily: 'Arial', fontSize: '22px', fontStyle: 'bold', color: '#1d4ed8',
      backgroundColor: '#ffffff', padding: { x: 12, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);
    retry.on('pointerdown', () => { SFX.click(); this.loadLetter(); });

    // Teken-input
    this.drawing = false; this.userPts = [];
    this.input.on('pointerdown', (p) => this.onDown(p));
    this.input.on('pointermove', (p) => this.onMove(p));
    this.input.on('pointerup', () => this.onUp());

    this.woordIdx = 0;
    this.loadWord();
  }

  // Vier schrijf-lijnen op de kaart: bovenlijn, x-hoogte (stippel), basislijn,
  // staartlijn — net als in een echt schrift.
  tekenLiniatuur(g, x0, ox, oy, sz, w) {
    const Y = (b) => oy + b * sz;
    g.lineStyle(2, 0xcfe0f0, 1);
    [BAND.asc, BAND.base].forEach((b) => g.lineBetween(x0, Y(b), x0 + w, Y(b)));
    g.lineStyle(3, 0xf0c8e6, 1); // basislijn iets accent
    g.lineBetween(x0, Y(BAND.base), x0 + w, Y(BAND.base));
    // x-hoogte als stippellijn
    g.lineStyle(2, 0xd7c2ea, 1);
    for (let x = x0; x < x0 + w; x += 12) g.lineBetween(x, Y(BAND.xtop), x + 6, Y(BAND.xtop));
  }

  get woordData() { return this.wereld.woorden[this.woordIdx]; }

  loadWord() {
    const wd = this.woordData;
    this.letterIdx = 0;

    // plaatje
    this.iconLaag.removeAll(true);
    const ic = tekenIcoon(this, wd.icoon, 0, 0, 96);
    this.iconLaag.add(ic);
    this.tweens.add({ targets: ic, y: -6, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // woord-rij (slots)
    if (this.slotLaag) this.slotLaag.destroy(true);
    this.slotLaag = this.add.container(0, 0).setDepth(9);
    this.slots = [];
    const chars = letters(wd.w);
    const tile = Math.min(64, (this.scale.width - 48) / chars.length - 8);
    const gap = 10;
    const totaal = chars.length * tile + (chars.length - 1) * gap;
    const startX = (this.scale.width - totaal) / 2 + tile / 2;
    chars.forEach((ch, i) => {
      const x = startX + i * (tile + gap);
      const c = this.add.container(x, this.rijY);
      this.slotLaag.add(c);
      this.slots.push({ c, x, y: this.rijY, size: tile, letter: ch, klaar: false });
      this.tekenSlot(i, false);
    });

    this.hud.setText(`✏️ ${this.wereld.naam}   Woord ${this.woordIdx + 1}/${this.wereld.woorden.length}`);
    this.loadLetter();
  }

  // Teken een slot in de woord-rij. klaar=false → lichtgrijs voorgedrukt;
  // klaar=true → vrolijk gekleurd Alphablock-figuurtje.
  tekenSlot(i, klaar) {
    const s = this.slots[i];
    s.c.removeAll(true);
    const half = s.size / 2;
    const g = this.add.graphics();
    s.c.add(g);
    const kleur = RAINBOW[i % RAINBOW.length];
    if (!klaar) {
      g.fillStyle(0xeef2f7, 1); g.fillRoundedRect(-half, -half, s.size, s.size, 12);
      g.lineStyle(3, i === this.letterIdx ? 0x3b82f6 : 0xcdd7e2, 1);
      g.strokeRoundedRect(-half, -half, s.size, s.size, 12);
      // voorgedrukte letter (lichtgrijs)
      this.strokePaden(g, LOWER_PATHS[s.letter], -half + s.size * 0.12, -half + s.size * 0.12, s.size * 0.76, Math.max(4, s.size * 0.09), 0xc3ccd6, 1);
    } else {
      g.fillStyle(kleur, 1); g.fillRoundedRect(-half, -half, s.size, s.size, 12);
      g.lineStyle(3, 0x2b2f3a, 1); g.strokeRoundedRect(-half, -half, s.size, s.size, 12);
      g.fillStyle(0xffffff, 0.22); g.fillRoundedRect(-half, -half, s.size, s.size * 0.4, 12); // glans
      // witte letter
      this.strokePaden(g, LOWER_PATHS[s.letter], -half + s.size * 0.12, -half + s.size * 0.12, s.size * 0.76, Math.max(4, s.size * 0.1), 0xffffff, 1);
      // gezichtje
      const ey = -s.size * 0.06;
      g.fillStyle(0xffffff, 1); g.fillCircle(-s.size * 0.16, ey, s.size * 0.09); g.fillCircle(s.size * 0.16, ey, s.size * 0.09);
      g.fillStyle(0x2b2f3a, 1); g.fillCircle(-s.size * 0.14, ey, s.size * 0.045); g.fillCircle(s.size * 0.18, ey, s.size * 0.045);
    }
  }

  loadLetter() {
    this.done = false; this.drawing = false; this.userPts = []; this.userG.clear();
    const ch = this.woordData.w[this.letterIdx];
    const raw = LOWER_PATHS[ch];

    // Bouw de strokes in de schrijf-box (0..1 → box, incl. staarten/stokken).
    const { ox, oy, sz } = this.box;
    this.strokes = raw.map((st) => st.map(([nx, ny]) => ({ x: ox + nx * sz, y: oy + ny * sz })));

    // Checkpoints per stroke (sequentieel), zoals in het Schrijven-spel.
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
    this.activeStroke = 0; this.strayed = false;

    // markeer welke slot actief is
    this.slots.forEach((_, i) => this.tekenSlot(i, this.slots[i].klaar));

    this.msg.setText('Trek de letter over met je vinger! ✏️');
    this.zegKlank(ch);
    this.drawGuide();
  }

  drawGuide() {
    const g = this.guide; g.clear();
    const ch = this.woordData.w[this.letterIdx];
    const { ox, oy, sz } = this.box;
    // voorgedrukte letter (lichtgrijs, dik) om over te trekken
    this.strokePaden(g, LOWER_PATHS[ch], ox, oy, sz, Math.max(16, sz * 0.055), 0xdbe3ec, 1);

    // gevulde checkpoints (regenboog) tonen je voortgang
    for (let i = 0; i < this.check.length; i++) {
      if (this.checkHit[i]) { g.fillStyle(RAINBOW[i % RAINBOW.length], 1); g.fillCircle(this.check[i].x, this.check[i].y, Math.max(7, sz * 0.022)); }
    }
    // start (groen) + eind (rood) per stroke
    for (const st of this.strokes) {
      g.fillStyle(0x4ade80, 1); g.fillCircle(st[0].x, st[0].y, Math.max(11, sz * 0.033));
      const last = st[st.length - 1];
      g.fillStyle(0xf87171, 1); g.fillCircle(last.x, last.y, Math.max(8, sz * 0.024));
    }
  }

  // Teken genormaliseerde paden (0..1) in een vak.
  strokePaden(g, paths, ox, oy, sz, lineW, color, alpha) {
    g.lineStyle(lineW, color, alpha);
    for (const st of paths) {
      g.beginPath(); g.moveTo(ox + st[0][0] * sz, oy + st[0][1] * sz);
      for (let i = 1; i < st.length; i++) g.lineTo(ox + st[i][0] * sz, oy + st[i][1] * sz);
      g.strokePath();
    }
  }

  inBox(p) {
    const { ox, oy, sz } = this.box;
    return p.x >= ox - 20 && p.x <= ox + sz + 20 && p.y >= oy - 20 && p.y <= oy + sz + 20;
  }

  firstUnfinishedStroke() {
    for (let si = 0; si < this.strokes.length; si++) {
      const idxs = this.strokeCheckIdx[si];
      const hit = idxs.filter((i) => this.checkHit[i]).length;
      if (hit / idxs.length < this.passThreshold) return si;
    }
    return -1;
  }

  onDown(p) {
    if (this.done || !this.inBox(p)) return;
    const si = this.firstUnfinishedStroke();
    if (si === -1) return;
    const start = this.strokes[si][0];
    const startTol = Math.max(36, this.box.sz * 0.13);
    if (Math.hypot(p.x - start.x, p.y - start.y) > startTol) {
      this.msg.setText('Begin bij de groene stip! 🟢'); this.drawing = false; return;
    }
    this.activeStroke = si; this.drawing = true; this.strayed = false;
    this.userPts = [{ x: p.x, y: p.y }]; this.markNear(p);
  }

  onMove(p) {
    if (!this.drawing || this.done) return;
    this.userPts.push({ x: p.x, y: p.y }); this.markNear(p); this.drawUser(); this.drawGuide();
  }

  onUp() {
    if (!this.drawing || this.done) return;
    this.drawing = false;
    const idxs = this.strokeCheckIdx[this.activeStroke];
    const hit = idxs.filter((i) => this.checkHit[i]).length / idxs.length;
    if (this.strayed || hit < this.passThreshold) {
      this.msg.setText(this.strayed ? 'Blijf op de lijn! Probeer nog eens ✏️' : 'Bijna! Volg de hele lijn van groen naar rood ✏️');
      SFX.oops(); if (this.strayed) Voice.cue('oops');
      this.tweens.add({ targets: this.nul, x: '+=5', duration: 55, yoyo: true, repeat: 3 });
      idxs.forEach((i) => { this.checkHit[i] = false; });
      this.strokeProgress[this.activeStroke] = 0; this.userPts = []; this.userG.clear(); this.drawGuide();
      return;
    }
    if (this.firstUnfinishedStroke() === -1) this.letterDone();
    else { this.msg.setText('Top! Nu de volgende lijn 🟢'); this.userPts = []; this.userG.clear(); this.drawGuide(); }
  }

  markNear(p) {
    const tol = Math.max(22, this.box.sz * this.tolFactor);
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

  drawUser() {
    const g = this.userG; g.clear();
    if (this.userPts.length < 2) return;
    g.lineStyle(Math.max(6, this.box.sz * 0.02), RAINBOW[this.letterIdx % RAINBOW.length], 1);
    g.beginPath(); g.moveTo(this.userPts[0].x, this.userPts[0].y);
    for (let i = 1; i < this.userPts.length; i++) g.lineTo(this.userPts[i].x, this.userPts[i].y);
    g.strokePath();
  }

  letterDone() {
    this.done = true;
    SFX.sparkle && SFX.sparkle();
    Voice.cue('star');
    this.slots[this.letterIdx].klaar = true;
    this.tekenSlot(this.letterIdx, true);
    const s = this.slots[this.letterIdx];
    this.tweens.add({ targets: s.c, y: s.y - 14, duration: 170, yoyo: true, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: s.c, scale: { from: 0.6, to: 1 }, duration: 260, ease: 'Back.easeOut' });
    this.userG.clear(); this.guide.clear();

    if (this.letterIdx >= this.woordData.w.length - 1) {
      this.time.delayedCall(420, () => this.wordDone());
    } else {
      this.letterIdx++;
      this.time.delayedCall(360, () => this.loadLetter());
    }
  }

  wordDone() {
    // De blokjes pakken elkaars hand (armpjes tussen de slots) + het woord klinkt.
    const arms = this.add.graphics().setDepth(8);
    for (let i = 0; i + 1 < this.slots.length; i++) {
      const a = this.slots[i], b = this.slots[i + 1];
      arms.lineStyle(6, 0x2b2f3a, 1);
      arms.beginPath(); arms.moveTo(a.x + a.size * 0.4, a.y + 4);
      arms.lineTo((a.x + b.x) / 2, a.y + 14); arms.lineTo(b.x - b.size * 0.4, b.y + 4); arms.strokePath();
    }
    this.slotLaag.add(arms);
    // hele rij + plaatje juichen
    this.tweens.add({ targets: this.slotLaag, y: -10, duration: 200, yoyo: true, repeat: 1, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: this.iconLaag, scale: 1.2, duration: 240, yoyo: true, ease: 'Back.easeOut' });
    this.msg.setText(`Super! Je schreef "${this.woordData.w}"! 🎉`);
    SFX.levelup && SFX.levelup();
    this.blendWoord(this.woordData.w);
    this.confetti();
    this.tweens.add({ targets: this.nul.arm || this.nul, angle: { from: -8, to: 30 }, duration: 130, yoyo: true, repeat: 4 });

    this.time.delayedCall(1700, () => {
      if (this.woordIdx >= this.wereld.woorden.length - 1) this.worldDone();
      else { this.woordIdx++; this.loadWord(); }
    });
  }

  worldDone() {
    SFX.win && SFX.win();
    const r = this.wereld.reward || {};
    showReward(this, {
      title: r.title || 'Wereld uitgeschreven! 🏆',
      subtitle: `Alle ${this.wereld.woorden.length} woorden geschreven!`,
      stars: r.stars || 5, medal: r.medal, medalLabel: r.medalLabel,
      buttonText: 'Terug 🏠', onClose: () => this.scene.start('Menu'),
    });
  }

  // Klank via de stem zodra je aan een letter begint (echte clip zodra
  // geregistreerd, anders stil — jingle geeft directe feedback). Zie
  // tools/maak-stemmen.mjs.
  zegKlank(letter) { Voice.cue('klank-' + letter); }

  // "Blenden" (Alphablocks-stijl): de losse klanken snel achter elkaar en dan
  // het hele woord — de blokjes lezen samen hun woord voor.
  blendWoord(woord) {
    Voice.cue('cheer'); // vrolijke jingle onder het feestje
    const chars = letters(woord);
    chars.forEach((ch, i) => this.time.delayedCall(120 + i * 230, () => Voice.cue('klank-' + ch)));
    this.time.delayedCall(120 + chars.length * 230 + 200, () => Voice.cue('woord-' + woord));
  }

  confetti() {
    const { width } = this.scale;
    const p = this.add.particles(width / 2, 90, 'star', {
      x: { min: 0, max: width }, y: -10, speedY: { min: 100, max: 300 }, speedX: { min: -50, max: 50 },
      scale: { start: 1.4, end: 0 }, lifespan: 1700, quantity: 2, tint: RAINBOW, blendMode: 'ADD',
    }).setDepth(99);
    this.time.delayedCall(1700, () => p.destroy());
  }
}
