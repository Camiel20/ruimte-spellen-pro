import Phaser from 'phaser';
import { SFX, initAudio } from '../sound.js';
import { addStars } from '../progress.js';
import { TraceChallenge, randomGlyph, zeroGlyph } from '../glyphs.js';

// Planeet Tikker — tik op de planeet, koop upgrades, bouw je imperium.
// Score loopt automatisch door zolang het spel open is.
// Doel: groei helemaal door tot een TRILJOEN (1 met 18 nullen!), met
// steeds nieuwe planeten en bij elke nieuwe nul een klein feestje.

const PLANETS =      ['🌑', '🪐', '🌍', '🌙', '⭐', '☄️', '🌌', '💫', '🌟', '🔆', '🌞', '✨', '🌠', '🌀', '🛸', '🔮', '🌈', '🌋', '🪩', '👑', '♾️'];
const PLANET_NAMES = ['Steenklomp', 'Steenplaneet', 'Waterwereld', 'Maanbasis', 'Sterplaneet', 'Komeet', 'Melkweg', 'Supernova', 'Superster', 'Reuzenster', 'Zonnekern', 'Sterrenstelsel', 'Heelal', 'Dubbel-heelal', 'Ufo-zwerm', 'Toverster', 'Regenboogstelsel', 'Vuurplaneet', 'Discoheelal', 'Kroon-heelal', 'Triljoen-ster'];
const MILESTONES =   [0, 500, 5000, 25000, 100000, 500000, 2000000, 10000000, 50000000, 200000000, 1e9, 5e9, 25e9, 100e9, 500e9, 1e12, 10e12, 100e12, 1e15, 100e15, 1e18];
const PLANET_COLORS = [0x78716c, 0x9ca3af, 0x60a5fa, 0xcbd5e1, 0xfbbf24, 0xfb923c, 0xa855f7, 0xec4899, 0xfde047, 0xf97316, 0xfacc15, 0xc084fc, 0x22d3ee, 0x818cf8, 0x34d399, 0xf472b6, 0xfb7185, 0xef4444, 0x06b6d4, 0xeab308, 0xffffff];

// Nederlandse namen bij een aantal nullen (machten van 10).
const ZERO_NAMES = { 3: 'duizend', 6: 'miljoen', 9: 'miljard', 12: 'biljoen', 15: 'biljard', 18: 'triljoen' };

const SHOP = [
  { id: 'click', name: 'Sterkere tik', desc: '+1 per tik', ic: '👆', base: 15, type: 'click', val: 1 },
  { id: 'sat', name: 'Satelliet', desc: '+2 per seconde', ic: '🛰️', base: 25, type: 'auto', val: 2 },
  { id: 'rover', name: 'Maanwagen', desc: '+10 per seconde', ic: '🚗', base: 120, type: 'auto', val: 10 },
  { id: 'rocket', name: 'Raket', desc: '+50 per seconde', ic: '🚀', base: 600, type: 'auto', val: 50 },
  { id: 'click2', name: 'Mega-tik', desc: '+25 per tik', ic: '✊', base: 1500, type: 'click', val: 25 },
  { id: 'station', name: 'Ruimtestation', desc: '+250 per seconde', ic: '🛸', base: 3000, type: 'auto', val: 250 },
  { id: 'colony', name: 'Kolonie', desc: '+1.500 per seconde', ic: '🏙️', base: 15000, type: 'auto', val: 1500 },
  { id: 'planet', name: 'Planeetfabriek', desc: '+8.000 per seconde', ic: '🪐', base: 75000, type: 'auto', val: 8000 },
  { id: 'click3', name: 'Superkracht-tik', desc: '+1.000 per tik', ic: '💥', base: 200000, type: 'click', val: 1000 },
  { id: 'star', name: 'Sterrenmijn', desc: '+50.000 per seconde', ic: '⭐', base: 400000, type: 'auto', val: 50000 },
  { id: 'galaxy', name: 'Melkwegmotor', desc: '+300.000 per seconde', ic: '🌌', base: 2000000, type: 'auto', val: 300000 },
  { id: 'blackhole', name: 'Zwart gat', desc: '+2.000.000 per seconde', ic: '🕳️', base: 10000000, type: 'auto', val: 2000000 },
  { id: 'click4', name: 'Kosmische tik', desc: '+100.000 per tik', ic: '🌠', base: 30000000, type: 'click', val: 100000 },
  { id: 'universe', name: 'Heelal-machine', desc: '+15.000.000 per seconde', ic: '✨', base: 80000000, type: 'auto', val: 15000000 },
  { id: 'bigbang', name: 'Oerknal-motor', desc: '+100.000.000 per seconde', ic: '💢', base: 500000000, type: 'auto', val: 100000000 },
  { id: 'nebula', name: 'Nevel-fabriek', desc: '+700.000.000 per seconde', ic: '🌫️', base: 3e9, type: 'auto', val: 700000000 },
  { id: 'click5', name: 'Sterren-tik', desc: '+10.000.000 per tik', ic: '🌟', base: 1e10, type: 'click', val: 10000000 },
  { id: 'quasar', name: 'Quasar', desc: '+5.000.000.000 per seconde', ic: '💠', base: 2e10, type: 'auto', val: 5000000000 },
  { id: 'cluster', name: 'Sterrenhoop', desc: '+40.000.000.000 per seconde', ic: '🪐', base: 1.5e11, type: 'auto', val: 40000000000 },
  { id: 'multiverse', name: 'Multiversum', desc: '+300.000.000.000 per seconde', ic: '🌀', base: 1e12, type: 'auto', val: 300000000000 },
  { id: 'click6', name: 'Heelal-tik', desc: '+1.000.000.000 per tik', ic: '🌠', base: 5e12, type: 'click', val: 1000000000 },
  { id: 'rainbow', name: 'Regenboog-motor', desc: '+2.500.000.000.000 per seconde', ic: '🌈', base: 2e13, type: 'auto', val: 2500000000000 },
  { id: 'infinity', name: 'Oneindigheid', desc: '+25.000.000.000.000 per seconde', ic: '♾️', base: 1.5e14, type: 'auto', val: 25000000000000 },
];

export default class ClickerScene extends Phaser.Scene {
  constructor() { super('Clicker'); }

  create() {
    const { width, height } = this.scale;
    for (let i = 0; i < 40; i++) {
      const s = this.add.image(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), 'star')
        .setAlpha(Phaser.Math.FloatBetween(0.2, 0.6)).setDepth(-1);
      this.tweens.add({ targets: s, alpha: 0.1, duration: Phaser.Math.Between(1500, 3000), yoyo: true, repeat: -1 });
    }

    const back = this.add.text(16, 16, '⬅ Terug', {
      fontFamily: 'Arial', fontSize: '16px', color: '#94a3b8',
      backgroundColor: '#1e293b', padding: { x: 10, y: 6 },
    }).setInteractive();
    back.on('pointerdown', () => { this.saveData(); this.scene.start('Menu'); });

    // Laad opgeslagen data
    this.loadData();

    // Score
    this.scoreText = this.add.text(width / 2, 64, '0', {
      fontFamily: 'Arial', fontSize: '42px', fontStyle: 'bold', color: '#fff',
    }).setOrigin(0.5).setDepth(5);
    this.scoreText.setShadow(0, 0, '#fbbf24', 12, true, true);
    this.rateText = this.add.text(width / 2, 100, '', {
      fontFamily: 'Arial', fontSize: '14px', color: '#94a3b8',
    }).setOrigin(0.5).setDepth(5);

    // Nullen-teller — Adrian's favoriet: laat zien hoeveel nullen je hebt.
    this.zeroText = this.add.text(width / 2, 124, '', {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#fde047',
    }).setOrigin(0.5).setDepth(5);
    this.zeroText.setShadow(0, 0, '#a16207', 8, true, true);

    // --- Planeet met gloed-aura en draaiende ring ---
    const px = width / 2, py = 200;
    this.auraGlow = this.add.graphics().setDepth(1);   // zachte gloed achter de planeet
    this.orbitRing = this.add.graphics().setDepth(1);  // draaiende ring
    this.ringAngle = 0;

    // Twee kleine maantjes die om de planeet draaien
    this.moons = [
      this.add.text(px, py, '🌑', { fontSize: '22px' }).setOrigin(0.5).setDepth(2),
      this.add.text(px, py, '⭐', { fontSize: '18px' }).setOrigin(0.5).setDepth(4),
    ];
    this.moonAngle = 0;

    // Planeet (klikbaar) — groter en met schaduw
    this.planet = this.add.text(px, py, PLANETS[0], { fontSize: '130px' })
      .setOrigin(0.5).setDepth(3).setInteractive({ useHandCursor: true });
    this.planet.on('pointerdown', () => this.click());
    // zacht zweven
    this.tweens.add({ targets: this.planet, y: py - 8, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // Naam van de huidige planeet
    this.planetName = this.add.text(px, 285, '', {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#fbbf24',
    }).setOrigin(0.5).setDepth(5);

    // --- Voortgangsbalk naar de volgende planeet ---
    this.nextLabel = this.add.text(px, 312, '', {
      fontFamily: 'Arial', fontSize: '12px', color: '#94a3b8',
    }).setOrigin(0.5).setDepth(5);
    this.progBarBg = this.add.graphics().setDepth(4);
    this.progBar = this.add.graphics().setDepth(5);

    // --- Scrollbare winkel ---
    // Alle upgrades zitten in een container die je met je vinger op en neer
    // kunt slepen. Een masker zorgt dat ze alleen in het winkelvak zichtbaar zijn.
    const { width: W } = this.scale;
    this.shopTop = 366;
    this.shopBottom = height - 6;
    this.shopViewH = this.shopBottom - this.shopTop;

    this.shopButtons = [];
    this.shopContainer = this.add.container(0, this.shopTop).setDepth(4);
    let sy = 32;
    const itemGap = 64;
    SHOP.forEach((item) => {
      const btn = this.makeShopItem(W / 2, sy, item);
      this.shopContainer.add(btn.container);
      this.shopButtons.push({ item, ...btn });
      sy += itemGap;
    });
    this.shopContentH = sy + 8;
    this.shopScroll = 0;
    this.shopMinScroll = Math.min(0, this.shopViewH - this.shopContentH);

    // Masker zodat items buiten het vak onzichtbaar zijn
    const maskG = this.add.graphics();
    maskG.fillRect(0, this.shopTop, W, this.shopViewH);
    const mask = maskG.createGeometryMask();
    this.shopContainer.setMask(mask);
    maskG.setVisible(false);

    // "Winkel" kopje + scroll-hint
    this.add.text(W / 2, this.shopTop - 2, '🛒 Winkel — sleep om te scrollen', {
      fontFamily: 'Arial', fontSize: '12px', color: '#64748b',
    }).setOrigin(0.5, 1).setDepth(5);

    // Sleep-scroll voor de winkel
    this.dragActive = false;
    this.dragMoved = 0;
    this.input.on('pointerdown', (p) => {
      if (this.challengeActive) return;
      if (p.y >= this.shopTop && p.y <= this.shopBottom) { this.dragActive = true; this.dragMoved = 0; this.lastPy = p.y; }
    });
    this.input.on('pointermove', (p) => {
      if (this.dragActive && p.isDown) {
        const dy = p.y - this.lastPy;
        this.lastPy = p.y;
        this.dragMoved += Math.abs(dy);
        this.shopScroll = Phaser.Math.Clamp(this.shopScroll + dy, this.shopMinScroll, 0);
        this.shopContainer.y = this.shopTop + this.shopScroll;
      }
    });
    this.input.on('pointerup', () => { this.dragActive = false; });

    this.recalc();
    this.lastStage = this.curStage(); // voorkom valse "nieuwe planeet" bij laden
    this.lastZeros = this.zeros(this.score); // voorkom vals "nieuwe nul" bij laden
    this.goldenZeros = [];
    this.updateUI();

    // Automatische inkomsten (10x per seconde) — pauzeert tijdens een uitdaging
    this.timer = this.time.addEvent({
      delay: 100, loop: true, callback: () => {
        if (this.challengeActive) return;
        if (this.perSec > 0) { this.score += this.perSec / 10; this.updateUI(); }
      },
    });

    // Sla regelmatig op
    this.saveTimer = this.time.addEvent({ delay: 3000, loop: true, callback: () => this.saveData() });

    // Af en toe zweeft er een glimmende gouden 0 voorbij: tik 'm voor een bonus!
    this.goldenTimer = this.time.addEvent({
      delay: 14000, loop: true, callback: () => this.spawnGoldenZero(),
    });
    this.time.delayedCall(5000, () => this.spawnGoldenZero());

    // Opruimen bij verlaten van de scene
    this.events.once('shutdown', () => {
      if (this.timer) this.timer.remove();
      if (this.saveTimer) this.saveTimer.remove();
      if (this.goldenTimer) this.goldenTimer.remove();
      this.saveData();
    });
  }

  update(time, delta) {
    if (!this.planet) return;
    const px = this.planet.x, py = 200;
    // Maantjes laten draaien
    this.moonAngle += delta * 0.0012;
    if (this.moons) {
      this.moons[0].setPosition(px + Math.cos(this.moonAngle) * 95, py + Math.sin(this.moonAngle) * 42);
      this.moons[1].setPosition(px + Math.cos(this.moonAngle + Math.PI) * 105, py + Math.sin(this.moonAngle + Math.PI) * 48);
    }
    // Draaiende ring + pulserende gloed
    this.ringAngle += delta * 0.0006;
    const idx = this.curStage();
    const color = PLANET_COLORS[idx];
    const pulse = 0.5 + Math.sin(time * 0.003) * 0.15;
    if (this.auraGlow) {
      this.auraGlow.clear();
      for (let i = 5; i > 0; i--) {
        this.auraGlow.fillStyle(color, 0.04 * pulse);
        this.auraGlow.fillCircle(px, py, 60 + i * 12);
      }
    }
    if (this.orbitRing) {
      this.orbitRing.clear();
      this.orbitRing.lineStyle(2, color, 0.35);
      // ovale baan
      const steps = 40;
      this.orbitRing.beginPath();
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * Math.PI * 2 + this.ringAngle;
        const x = px + Math.cos(a) * 100, y = py + Math.sin(a) * 45;
        if (i === 0) this.orbitRing.moveTo(x, y); else this.orbitRing.lineTo(x, y);
      }
      this.orbitRing.strokePath();
    }
  }

  curStage() {
    let idx = 0;
    for (let i = 0; i < MILESTONES.length; i++) if (this.score >= MILESTONES[i]) idx = i;
    return Math.min(idx, PLANETS.length - 1);
  }

  // Volledig getal met alle nullen, gegroepeerd met puntjes:
  // 12500 → "12.500", 1500000000 → "1.500.000.000".
  // Adrian houdt van nullen, dus we korten NIET af met "mln"/"mld".
  // Boven de rekengrens van JavaScript (~9 biljard) ronden we af op nette
  // nullen, zodat de laatste cijfers niet gaan "trillen".
  fmt(n) {
    n = Math.floor(n);
    if (n < 1e15) return n.toLocaleString('nl-NL');
    const digits = Math.floor(Math.log10(n) + 1e-9) + 1;
    const sig = 4; // eerste 4 cijfers tellen, de rest wordt nette nullen
    const lead = Math.round(n / Math.pow(10, digits - sig));
    const s = String(lead) + '0'.repeat(digits - sig);
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // Aantal nullen in een getal (1.000.000 → 6). Gebruikt voor de nullen-teller.
  zeros(n) {
    n = Math.floor(n);
    if (n < 1) return 0;
    return Math.floor(Math.log10(n) + 1e-9);
  }

  cost(item) {
    return Math.floor(item.base * Math.pow(1.13, item.owned || 0));
  }

  makeShopItem(x, y, item) {
    const w = 340, h = 60;
    const c = this.add.container(x, y);
    const bg = this.add.graphics();
    const ic = this.add.text(-w / 2 + 24, 0, item.ic, { fontSize: '28px' }).setOrigin(0.5);
    const name = this.add.text(-w / 2 + 50, -12, item.name, {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#fff',
    });
    const desc = this.add.text(-w / 2 + 50, 8, item.desc, {
      fontFamily: 'Arial', fontSize: '12px', color: '#94a3b8',
    });
    const cost = this.add.text(w / 2 - 16, -10, '', {
      fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#fbbf24',
    }).setOrigin(1, 0.5);
    const owned = this.add.text(w / 2 - 16, 12, '', {
      fontFamily: 'Arial', fontSize: '12px', color: '#64748b',
    }).setOrigin(1, 0.5);
    c.add([bg, ic, name, desc, cost, owned]);
    const hit = this.add.rectangle(0, 0, w, h, 0xffffff, 0).setInteractive({ useHandCursor: true });
    c.add(hit);
    // Koop pas bij loslaten, en alleen als je niet aan het scrollen was.
    hit.on('pointerup', () => { if (!this.challengeActive && this.dragMoved < 8) this.buy(item); });
    return { container: c, bg, cost, owned, w, h };
  }

  click() {
    if (this.challengeActive) return;
    initAudio();
    this.score += this.perClick;
    SFX.click();
    this.updateUI();
    // Tik-animatie + zwevend nummer
    this.tweens.add({ targets: this.planet, scale: 0.92, duration: 80, yoyo: true });
    const f = this.add.text(this.planet.x + Phaser.Math.Between(-30, 30), this.planet.y - 40, '+' + this.fmt(this.perClick), {
      fontFamily: 'Arial', fontSize: '22px', fontStyle: 'bold', color: '#fbbf24',
    }).setOrigin(0.5).setDepth(10);
    f.setShadow(0, 0, '#000', 4, true, true);
    this.tweens.add({ targets: f, y: f.y - 55, alpha: 0, duration: 850, onComplete: () => f.destroy() });
    // kleine sterren-uitbarsting
    const p = this.add.particles(this.planet.x, this.planet.y, 'star', {
      speed: { min: 60, max: 160 }, angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 }, lifespan: 500, quantity: 6,
      tint: [0xfbbf24, 0xffffff], blendMode: 'ADD',
    }).setDepth(6);
    this.time.delayedCall(500, () => p.destroy());
  }

  buy(item) {
    const c = this.cost(item);
    if (this.score >= c) {
      this.score -= c;
      item.owned = (item.owned || 0) + 1;
      SFX.coin();
      this.recalc();
      this.saveData();
      this.updateUI();
    }
  }

  recalc() {
    this.perClick = 1;
    this.perSec = 0;
    SHOP.forEach((item) => {
      if (item.type === 'click') this.perClick += item.val * (item.owned || 0);
      else this.perSec += item.val * (item.owned || 0);
    });
  }

  updateUI() {
    // Score tonen en automatisch laten krimpen als het getal heel lang wordt,
    // zodat alle nullen op het scherm blijven passen.
    const str = this.fmt(this.score);
    this.scoreText.setText(str);
    const size = str.length > 18 ? 24 : str.length > 14 ? 30 : str.length > 9 ? 36 : 42;
    this.scoreText.setFontSize(size);
    this.rateText.setText(`${this.fmt(this.perSec)} per seconde · ${this.fmt(this.perClick)} per tik`);

    // Nullen-teller bijwerken (+ feest bij elke nieuwe nul)
    const z = this.zeros(this.score);
    const name = ZERO_NAMES[z];
    this.zeroText.setText(z < 1 ? '' : `🔢 ${z} ${z === 1 ? 'nul' : 'nullen'}${name ? ` — een ${name}!` : ''}`);
    if (this.lastZeros === undefined) this.lastZeros = z;
    if (z > this.lastZeros && !this.challengeActive) {
      this.lastZeros = z;
      this.celebrateZero(z);
    }

    // Planeet evolueert
    const idx = this.curStage();
    this.planet.setText(PLANETS[idx]);
    this.planetName.setText(PLANET_NAMES[idx]);

    // Bij een nieuwe planeet: eerst een schrijf-uitdaging, dan het feest.
    if (this.lastStage === undefined) this.lastStage = idx;
    if (idx > this.lastStage && !this.challengeActive) {
      this.lastStage = idx;
      this.startWriteChallenge(idx);
    }

    // Voortgangsbalk naar de volgende planeet
    const px = this.planet.x;
    const by = 332, bw = 240, bh = 12;
    this.progBarBg.clear();
    this.progBarBg.fillStyle(0x1e293b, 1);
    this.progBarBg.fillRoundedRect(px - bw / 2, by, bw, bh, 6);
    if (idx < MILESTONES.length - 1) {
      const cur = MILESTONES[idx], next = MILESTONES[idx + 1];
      const pct = Phaser.Math.Clamp((this.score - cur) / (next - cur), 0, 1);
      this.progBar.clear();
      this.progBar.fillStyle(PLANET_COLORS[idx + 1], 1);
      this.progBar.fillRoundedRect(px - bw / 2, by, Math.max(6, bw * pct), bh, 6);
      this.nextLabel.setText(`Volgende: ${PLANET_NAMES[idx + 1]} ${PLANETS[idx + 1]}  bij  ${this.fmt(next)}`);
    } else {
      this.progBar.clear();
      this.progBar.fillStyle(0xfde047, 1);
      this.progBar.fillRoundedRect(px - bw / 2, by, bw, bh, 6);
      this.nextLabel.setText('🌟 Hoogste planeet bereikt! 🌟');
    }

    // Winkel bijwerken
    this.shopButtons.forEach(({ item, bg, cost, owned, w, h }) => {
      const c = this.cost(item);
      const afford = this.score >= c;
      bg.clear();
      bg.fillStyle(afford ? 0x4ade80 : 0xffffff, afford ? 0.14 : 0.05);
      bg.lineStyle(2, afford ? 0x4ade80 : 0xffffff, afford ? 0.5 : 0.12);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
      cost.setText('🏆 ' + this.fmt(c));
      owned.setText((item.owned || 0) > 0 ? '×' + item.owned : '');
    });
  }

  startWriteChallenge(idx) {
    // Pauzeer het tikken/inkomen tot de letter of het cijfer geschreven is.
    // Harde check: maak nooit twee uitdagingen tegelijk aan.
    if (this.challengeActive || this.currentChallenge) return;
    this.challengeActive = true;
    const glyph = randomGlyph();
    this.currentChallenge = new TraceChallenge(this, {
      label: glyph.label,
      paths: glyph.paths,
      depth: 500,
      onDone: () => {
        this.currentChallenge = null;
        this.challengeActive = false;
        this.celebrateEvolution(idx);
      },
    });
  }

  celebrateEvolution(idx) {
    SFX.levelup();
    addStars(2);
    const px = this.planet.x, py = 200;
    // confetti-uitbarsting
    const p = this.add.particles(px, py, 'star', {
      speed: { min: 100, max: 260 }, angle: { min: 0, max: 360 },
      scale: { start: 1.4, end: 0 }, lifespan: 1200, quantity: 30,
      tint: [PLANET_COLORS[idx], 0xfbbf24, 0xffffff], blendMode: 'ADD',
    }).setDepth(20);
    this.time.delayedCall(900, () => p.destroy());
    // melding
    const msg = this.add.text(px, 150, `Nieuwe planeet!\n${PLANET_NAMES[idx]} ${PLANETS[idx]}`, {
      fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', color: '#fff', align: 'center',
    }).setOrigin(0.5).setDepth(21);
    msg.setShadow(0, 0, '#000', 6, true, true);
    this.tweens.add({ targets: msg, y: 110, alpha: 0, duration: 1800, onComplete: () => msg.destroy() });
    this.planet.setScale(0.3);
    this.tweens.add({ targets: this.planet, scale: 1, duration: 500, ease: 'Back.easeOut' });
  }

  // Klein feestje bij elke nieuwe nul: een gouden 0 die omhoog zweeft.
  celebrateZero(z) {
    SFX.coin();
    const { width } = this.scale;
    const name = ZERO_NAMES[z];
    const txt = name ? `Een ${name}!\n${z} nullen 🎉` : `${z} nullen!`;
    const m = this.add.text(width / 2, 150, txt, {
      fontFamily: 'Arial', fontSize: name ? '22px' : '18px', fontStyle: 'bold',
      color: '#fde047', align: 'center',
    }).setOrigin(0.5).setDepth(22);
    m.setShadow(0, 0, '#000', 6, true, true);
    this.tweens.add({ targets: m, y: 116, alpha: 0, duration: 1600, onComplete: () => m.destroy() });
    // Een dansende gouden 0
    const zero = this.add.text(width / 2, 150, '0', {
      fontFamily: 'Arial', fontSize: '64px', fontStyle: 'bold', color: '#fde047',
    }).setOrigin(0.5).setDepth(21).setScale(0.3);
    zero.setShadow(0, 0, '#a16207', 14, true, true);
    this.tweens.add({ targets: zero, scale: 1, duration: 300, ease: 'Back.easeOut',
      yoyo: true, hold: 200, onComplete: () => zero.destroy() });
    // Bij een mijlpaal-naam (miljoen, miljard, ...) een ster erbij.
    if (name) addStars(1);
  }

  // Laat een glimmende gouden 0 over het scherm zweven. Tik 'm voor een bonus.
  spawnGoldenZero() {
    if (this.challengeActive || !this.scene.isActive()) return;
    if (this.goldenZeros && this.goldenZeros.length >= 2) return;
    const { width } = this.scale;
    const fromLeft = Math.random() < 0.5;
    // Boven de winkel (die begint op y≈366) zodat tikken niet botst met scrollen.
    const y = Phaser.Math.Between(150, 345);
    const startX = fromLeft ? -40 : width + 40;
    const endX = fromLeft ? width + 40 : -40;
    const zero = this.add.text(startX, y, '0', {
      fontFamily: 'Arial', fontSize: '52px', fontStyle: 'bold', color: '#fde047',
    }).setOrigin(0.5).setDepth(30).setInteractive({ useHandCursor: true });
    zero.setShadow(0, 0, '#fbbf24', 16, true, true);
    this.tweens.add({ targets: zero, angle: fromLeft ? 360 : -360, duration: 1600, repeat: -1 });
    const glide = this.tweens.add({
      targets: zero, x: endX, duration: 9000, ease: 'Sine.inOut',
      onComplete: () => { this.removeGoldenZero(zero); this.tweens.killTweensOf(zero); zero.destroy(); },
    });
    zero.once('pointerdown', () => { glide.stop(); this.catchGoldenZero(zero); });
    this.goldenZeros.push(zero);
  }

  removeGoldenZero(zero) {
    if (!this.goldenZeros) return;
    const i = this.goldenZeros.indexOf(zero);
    if (i >= 0) this.goldenZeros.splice(i, 1);
  }

  catchGoldenZero(zero) {
    this.removeGoldenZero(zero);
    SFX.levelup();
    // Bonus: flink wat punten in één keer (schaalt mee met je spel).
    const bonus = Math.max(50, Math.floor(this.score * 0.05), this.perSec * 20, this.perClick * 15);
    this.score += bonus;
    this.updateUI();
    const f = this.add.text(zero.x, zero.y, '+' + this.fmt(bonus), {
      fontFamily: 'Arial', fontSize: '24px', fontStyle: 'bold', color: '#fde047',
    }).setOrigin(0.5).setDepth(31);
    f.setShadow(0, 0, '#000', 5, true, true);
    this.tweens.add({ targets: f, y: f.y - 60, alpha: 0, duration: 1100, onComplete: () => f.destroy() });
    const p = this.add.particles(zero.x, zero.y, 'star', {
      speed: { min: 80, max: 220 }, angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 }, lifespan: 700, quantity: 16,
      tint: [0xfde047, 0xfbbf24, 0xffffff], blendMode: 'ADD',
    }).setDepth(31);
    this.time.delayedCall(700, () => p.destroy());
    this.tweens.killTweensOf(zero);
    zero.destroy();
  }

  loadData() {
    try {
      const d = JSON.parse(localStorage.getItem('rsp_clicker') || '{}');
      this.score = d.score || 0;
      SHOP.forEach((item) => { item.owned = (d.owned && d.owned[item.id]) || 0; });
    } catch (e) {
      this.score = 0;
      SHOP.forEach((item) => { item.owned = 0; });
    }
  }

  saveData() {
    try {
      const owned = {};
      SHOP.forEach((item) => { owned[item.id] = item.owned || 0; });
      localStorage.setItem('rsp_clicker', JSON.stringify({ score: this.score, owned }));
    } catch (e) {}
  }
}
