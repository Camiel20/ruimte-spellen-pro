import Phaser from 'phaser';
import { SFX, initAudio, isSoundOn } from '../sound.js';
import { stopMusic } from '../music.js';
import { confettiBurst, showReward } from '../reward.js';
import { addStars, getStars } from '../progress.js';

// ===== GETALLEN-LAND =====
// Een levende, vrolijke Numberblocks-wereld (zelfgemaakt, geen auteursrechtelijke
// beelden/audio). De kern is precies waar Numberblocks om draait: getallen MAKEN
// door blokjes samen te voegen (optellen) en te splitsen.
//
//  • Sleep een Numberblock op een andere  -> ze worden samen een groter getal.
//  • Tik op een Numberblock                -> er springt een 1 los (splitsen).
//  • Sleep het juiste getal op de doel-plek -> puzzel opgelost! Sterren + feest.
//
// Elk personage heeft een eigen kleur, gezicht, knipperende ogen, idle-wiebel
// en reacties. De wereld leeft met wolken, bloemen, vlinders en vogels, en je
// speelt nieuwe gebieden vrij met sterren.

// Numberblocks-signatuurkleuren (cyclisch voorbij 12).
const SIG = [0xe8402c, 0xf08a24, 0xf6c624, 0x57b947, 0x38b6cf, 0x9b6dd6,
  0xec6aa9, 0x14b8a6, 0x4f63c9, 0xf25c54, 0x37c2a0, 0x6366f1];
function sig(n) { return SIG[(Math.max(1, n) - 1) % SIG.length]; }
function lighten(c, amt) {
  const r = Math.min(255, ((c >> 16) & 255) + amt);
  const g = Math.min(255, ((c >> 8) & 255) + amt);
  const b = Math.min(255, (c & 255) + amt);
  return (r << 16) | (g << 8) | b;
}
function darker(c, amt) {
  const r = Math.max(0, ((c >> 16) & 255) - amt);
  const g = Math.max(0, ((c >> 8) & 255) - amt);
  const b = Math.max(0, (c & 255) - amt);
  return (r << 16) | (g << 8) | b;
}

// Vier gebieden om vrij te spelen — alles wordt zelf getekend (geen emoji).
// Elk gebied heeft eigen lucht-, grond-, pad-, water- en bloemkleuren.
const ZONES = [
  { name: 'Bloemenweide', top: 0x8fd6ff, bot: 0xd9f4ff, hill: 0x73c24a, hill2: 0x5fa83a, path: 0xe7c98a, water: 0x5fc7e8, trunk: 0x9c6b3f, leaf: 0x4caf50, flowers: [0xff6b9d, 0xffd23f, 0xff8a5b, 0xb06eff] },
  { name: 'Zonnestrand', top: 0x6ec7ff, bot: 0xfff0c8, hill: 0xf2d59a, hill2: 0xe2bd76, path: 0xf0dca6, water: 0x49b6e0, trunk: 0x8a5a32, leaf: 0x57c06a, flowers: [0xff8a5b, 0xffd23f, 0xff5e7e, 0x6ee0c0] },
  { name: 'Snoepland', top: 0xffb6e6, bot: 0xffe9f6, hill: 0xff9ed6, hill2: 0xef76bd, path: 0xffd1ec, water: 0xff9ed6, trunk: 0xb5728f, leaf: 0xff7ec4, flowers: [0xff5ea8, 0xfff06b, 0x8be0ff, 0xc98bff] },
  { name: 'Sterrenruimte', top: 0x241a55, bot: 0x49379a, hill: 0x3a2f6e, hill2: 0x271f52, path: 0x6b5bb0, water: 0x7a6bd0, trunk: 0x5a4a9a, leaf: 0x8a7be0, flowers: [0xffe16b, 0x8be0ff, 0xff8ad0, 0xb6a0ff], night: true },
];

const WORDS = ['nul', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven',
  'acht', 'negen', 'tien', 'elf', 'twaalf', 'dertien', 'veertien', 'vijftien',
  'zestien', 'zeventien', 'achttien', 'negentien', 'twintig'];

const PLAY = { x0: 40, x1: 440, y0: 330, y1: 690 }; // speelveld waar blokjes leven

export default class NumberLandScene extends Phaser.Scene {
  constructor() { super('NumberLand'); }

  create() {
    initAudio();
    stopMusic(); // geen menu-muziek in Getallen-Land (eigen geluid + stem)
    const { width, height } = this.scale;
    this.W = width; this.H = height;

    this.zone = 0;
    this.solved = 0;          // opgeloste puzzels (voor gebied-ontgrendeling)
    this.blocks = [];
    this.locked = false;
    this.nlVoice = null;
    this.loadVoice();
    this.speechPrimed = false;
    this.input.on('pointerdown', () => this.primeSpeech());
    this.input.dragDistanceThreshold = 12; // klein tikje = splitsen, groot = slepen

    this.buildWorld();
    this.buildHud();
    this.buildPedestal();

    this.input.on('drag', (p, obj, dx, dy) => {
      if (obj.getData && obj.getData('block')) { obj.x = dx; obj.y = dy; }
    });

    this.startPuzzle();

    // Af en toe een verrassing (cadeautje dat overdrijft) — extra beloning.
    this.surpriseTimer = this.time.addEvent({ delay: 14000, loop: true, callback: () => this.maybeSurprise() });

    this.events.once('shutdown', () => { try { window.speechSynthesis.cancel(); } catch (e) {} });
  }

  // ---------------------------------------------------------------- WERELD
  buildWorld() {
    const z = ZONES[this.zone];
    this.sky = this.add.graphics().setDepth(-10);
    this.paintSky(z);

    // Zon met zachte gloed
    this.sun = this.add.container(this.W - 70, 92).setDepth(-9);
    const glow = this.add.circle(0, 0, 60, 0xfff3b0, 0.35);
    const sunC = this.add.circle(0, 0, 34, 0xffe16b);
    this.sun.add([glow, sunC]);
    this.tweens.add({ targets: glow, scale: 1.18, alpha: 0.5, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // Heuvels (twee lagen voor diepte)
    this.hills = this.add.graphics().setDepth(-8);
    this.paintHills(z);

    // Wolken (zelf getekend, drijven)
    this.clouds = [];
    for (let i = 0; i < 4; i++) {
      const c = this.makeCloud(Phaser.Math.Between(0, this.W), Phaser.Math.Between(70, 200), Phaser.Math.FloatBetween(0.7, 1.3));
      c.driftSpeed = Phaser.Math.FloatBetween(5, 14);
      this.clouds.push(c);
    }

    // Scenery: pad, riviertje, brug, bomen, struiken, bloemen, getallen-huisjes
    this.scenery = [];
    this.buildScenery(z);

    // Vlinders in de lucht (zweven rond)
    this.fliers = [];
    for (let i = 0; i < 4; i++) this.spawnButterfly(z);
  }

  paintSky(z) {
    this.sky.clear();
    this.sky.fillGradientStyle(z.top, z.top, z.bot, z.bot, 1);
    this.sky.fillRect(0, 0, this.W, this.H);
    if (z.night) {
      this.sky.fillStyle(0xffffff, 0.9);
      for (let i = 0; i < 44; i++) this.sky.fillCircle(Phaser.Math.Between(8, this.W - 8), Phaser.Math.Between(56, 380), Phaser.Math.FloatBetween(0.7, 1.9));
    }
  }

  paintHills(z) {
    const g = this.hills; g.clear();
    g.fillStyle(z.hill2, 1);
    g.beginPath(); g.moveTo(0, 760);
    g.lineTo(0, 700); g.arc(120, 700, 120, Math.PI, 0); g.arc(360, 710, 130, Math.PI, 0);
    g.lineTo(this.W, 760); g.closePath(); g.fillPath();
    g.fillStyle(z.hill, 1);
    g.fillRect(0, 740, this.W, this.H - 740);
    g.fillStyle(lighten(z.hill, 18), 1);
    g.beginPath(); g.moveTo(0, 752); g.lineTo(this.W, 752); g.lineTo(this.W, 760); g.lineTo(0, 760); g.closePath(); g.fillPath();
  }

  // ---- zelf-getekende cartoon-art (geen emoji) ----
  makeCloud(x, y, s = 1) {
    const c = this.add.container(x, y).setDepth(-7).setScale(s);
    const g = this.add.graphics();
    g.fillStyle(0xe8f5ff, 1); g.fillEllipse(6, 15, 82, 20);
    g.fillStyle(0xffffff, 1);
    [[-26, 4, 17], [-6, -8, 23], [16, 0, 20], [34, 7, 14], [4, 11, 26]].forEach(([cx, cy, r]) => g.fillCircle(cx, cy, r));
    c.add(g);
    return c;
  }

  spawnButterfly(z) {
    const col = Phaser.Utils.Array.GetRandom(z.flowers);
    const x = Phaser.Math.Between(0, this.W), y = Phaser.Math.Between(150, 320);
    const b = this.add.container(x, y).setDepth(-5);
    const wing = this.add.graphics();
    const drawWings = (sx) => {
      wing.fillStyle(col, 1);
      wing.fillEllipse(sx * 11, -6, 18, 20); wing.fillEllipse(sx * 12, 10, 14, 15);
      wing.fillStyle(lighten(col, 65), 0.65); wing.fillEllipse(sx * 11, -6, 9, 11);
      wing.fillStyle(darker(col, 40), 1); wing.fillCircle(sx * 11, -6, 2.5);
    };
    drawWings(-1); drawWings(1);
    wing.fillStyle(0x3a2c20, 1); wing.fillRoundedRect(-2, -11, 4, 24, 2);
    // voelsprieten
    wing.lineStyle(1.5, 0x3a2c20, 1);
    wing.beginPath(); wing.moveTo(0, -11); wing.lineTo(-4, -17); wing.strokePath();
    wing.beginPath(); wing.moveTo(0, -11); wing.lineTo(4, -17); wing.strokePath();
    b.add(wing);
    this.tweens.add({ targets: wing, scaleX: 0.72, duration: 240, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    b.baseY = y; b.phase = Math.random() * Math.PI * 2;
    b.vx = Phaser.Math.FloatBetween(12, 28) * (Math.random() < 0.5 ? 1 : -1);
    this.fliers.push(b);
    return b;
  }

  buildScenery(z) {
    // pad + riviertje + brug
    const g = this.add.graphics().setDepth(-7.6);
    g.lineStyle(34, darker(z.path, 22), 1);
    g.beginPath(); g.moveTo(this.W * 0.5, 698); g.lineTo(this.W * 0.42, 738); g.lineTo(this.W * 0.5, 778); g.strokePath();
    g.lineStyle(27, z.path, 1);
    g.beginPath(); g.moveTo(this.W * 0.5, 698); g.lineTo(this.W * 0.42, 738); g.lineTo(this.W * 0.5, 778); g.strokePath();
    g.fillStyle(z.water, 1); g.fillRect(0, 780, this.W, this.H - 780);
    g.fillStyle(lighten(z.water, 45), 0.5);
    for (let x = 0; x < this.W; x += 30) g.fillEllipse(x + 15, 788, 18, 5);
    g.fillStyle(0x9c6b3f, 1); g.fillRoundedRect(this.W * 0.5 - 34, 772, 68, 20, 4);
    g.fillStyle(0x7a4f2c, 1);
    for (let i = 0; i < 5; i++) g.fillRect(this.W * 0.5 - 30 + i * 13, 774, 2, 16);
    this.scenery.push(g);

    // bomen + struiken
    [42, 116, this.W - 48, this.W - 124].forEach((tx, i) => this.scenery.push(this.drawTree(tx, 712 + (i % 2) * 10, z, 0.8 + Math.random() * 0.5)));
    [72, this.W - 78, this.W * 0.5].forEach((bx) => this.scenery.push(this.drawBush(bx, 754, z)));

    // getallen-huisjes op de heuvel
    this.scenery.push(this.drawHouse(80, 690, 1, sig(1)));
    this.scenery.push(this.drawHouse(this.W - 80, 684, 2, sig(2)));

    // bloemen
    for (let i = 0; i < 11; i++) {
      this.scenery.push(this.drawFlower(Phaser.Math.Between(16, this.W - 16), Phaser.Math.Between(706, 774), Phaser.Utils.Array.GetRandom(z.flowers)));
    }
  }

  drawTree(x, y, z, s = 1) {
    const c = this.add.container(x, y).setDepth(-6).setScale(s);
    const g = this.add.graphics();
    g.fillStyle(z.trunk, 1); g.fillRoundedRect(-7, -6, 14, 42, 4);
    g.fillStyle(darker(z.leaf, 28), 1); g.fillCircle(0, -34, 30);
    g.fillStyle(z.leaf, 1); g.fillCircle(-17, -30, 20); g.fillCircle(17, -30, 20); g.fillCircle(0, -46, 22);
    g.fillStyle(lighten(z.leaf, 50), 0.5); g.fillCircle(-9, -46, 9);
    c.add(g);
    this.tweens.add({ targets: c, angle: { from: -2.5, to: 2.5 }, duration: Phaser.Math.Between(2200, 3200), yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: Phaser.Math.Between(0, 900) });
    return c;
  }

  drawBush(x, y, z) {
    const c = this.add.container(x, y).setDepth(-6);
    const g = this.add.graphics();
    g.fillStyle(darker(z.leaf, 22), 1); g.fillCircle(0, 0, 18);
    g.fillStyle(z.leaf, 1); g.fillCircle(-13, 3, 13); g.fillCircle(13, 3, 13); g.fillCircle(0, -6, 15);
    g.fillStyle(lighten(z.leaf, 42), 0.5); g.fillCircle(-6, -6, 6);
    c.add(g);
    return c;
  }

  drawFlower(x, y, color) {
    const c = this.add.container(x, y).setDepth(-6);
    const g = this.add.graphics();
    g.lineStyle(3, 0x3f9d3f, 1); g.beginPath(); g.moveTo(0, 11); g.lineTo(0, 0); g.strokePath();
    g.fillStyle(color, 1);
    for (let a = 0; a < 5; a++) { const an = (a / 5) * Math.PI * 2; g.fillCircle(Math.cos(an) * 6, Math.sin(an) * 6 - 2, 4.5); }
    g.fillStyle(0xfff0a0, 1); g.fillCircle(0, -2, 4);
    c.add(g);
    this.tweens.add({ targets: c, angle: { from: -7, to: 7 }, duration: Phaser.Math.Between(1700, 2500), yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: Phaser.Math.Between(0, 900) });
    return c;
  }

  drawHouse(x, y, number, color) {
    const c = this.add.container(x, y).setDepth(-6);
    const g = this.add.graphics();
    g.fillStyle(lighten(color, 45), 1); g.fillRoundedRect(-26, -22, 52, 44, 5);
    g.lineStyle(3, darker(color, 30), 1); g.strokeRoundedRect(-26, -22, 52, 44, 5);
    g.fillStyle(color, 1); g.fillTriangle(-32, -19, 32, -19, 0, -50);
    g.lineStyle(3, darker(color, 42), 1); g.strokeTriangle(-32, -19, 32, -19, 0, -50);
    g.fillStyle(darker(color, 22), 1); g.fillRoundedRect(-9, -1, 18, 23, 3);
    g.fillStyle(0xfff0a0, 1); g.fillCircle(-16, -8, 5); g.fillCircle(16, -8, 5);
    c.add(g);
    const sign = this.add.circle(0, -34, 9, 0xffffff).setStrokeStyle(2.5, 0x16202b);
    const num = this.add.text(0, -34, `${number}`, { fontFamily: 'Arial Black, Arial', fontSize: '13px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
    c.add(sign); c.add(num);
    return c;
  }

  makeGift(x, y) {
    const c = this.add.container(x, y).setDepth(35);
    const g = this.add.graphics();
    g.fillStyle(0xff5e7e, 1); g.fillRoundedRect(-16, -12, 32, 26, 4);
    g.fillStyle(0xffd23f, 1); g.fillRect(-3, -12, 6, 26); g.fillRect(-16, -2, 32, 6);
    g.fillCircle(-6, -14, 6); g.fillCircle(6, -14, 6);
    g.fillStyle(0xff5e7e, 1); g.fillCircle(0, -14, 3);
    c.add(g);
    c.setSize(40, 44);
    c.setInteractive(new Phaser.Geom.Rectangle(-20, -22, 40, 44), Phaser.Geom.Rectangle.Contains);
    return c;
  }

  // Geef elke Numberblock eigen trekjes (bril, knoopjes, wenkbrauwen, sterhand…)
  drawPersonality(block) {
    const c = block.container, v = block.value;
    const fy = block.faceY, top = -block.totalH / 2;
    const g = this.add.graphics(); c.add(g);
    // rode wangetjes voor iedereen
    g.fillStyle(0xff8a8a, 0.45); g.fillCircle(-19, fy + 6, 4.5); g.fillCircle(19, fy + 6, 4.5);
    if (v === 2) { // bril
      g.lineStyle(2.5, 0x16202b, 1);
      g.strokeCircle(-12, fy - 2, 11); g.strokeCircle(12, fy - 2, 11);
      g.beginPath(); g.moveTo(-1, fy - 2); g.lineTo(1, fy - 2); g.strokePath();
    } else if (v === 3) { // knoopjes op de buik
      g.fillStyle(0x16202b, 0.75);
      for (let i = 0; i < 3; i++) g.fillCircle(0, fy + 20 + i * 15, 3);
    }
    if (v >= 4) { // stoere/blije wenkbrauwen
      g.lineStyle(3, 0x16202b, 1);
      g.beginPath(); g.moveTo(-18, fy - 13); g.lineTo(-7, fy - 11); g.strokePath();
      g.beginPath(); g.moveTo(18, fy - 13); g.lineTo(7, fy - 11); g.strokePath();
    }
    if (v === 5 && block.rightHand) { // sterhand
      const star = this.add.image(block.rightHand.x + 5, block.rightHand.y, 'star').setScale(2.6).setTint(0xffe16b);
      c.add(star);
      this.tweens.add({ targets: star, angle: 360, duration: 4500, repeat: -1 });
    }
  }

  // ------------------------------------------------------------------ HUD
  buildHud() {
    // Terug-knop (zelf getekend pijltje)
    const back = this.add.graphics().setDepth(50);
    back.fillStyle(0x16202b, 0.42); back.fillRoundedRect(10, 12, 48, 34, 11);
    back.fillStyle(0xffffff, 1);
    back.fillTriangle(38, 18, 38, 40, 22, 29); back.fillRect(38, 25, 12, 8);
    back.setInteractive(new Phaser.Geom.Rectangle(10, 12, 48, 34), Phaser.Geom.Rectangle.Contains);
    back.on('pointerdown', () => { SFX.click(); this.scene.start('Menu'); });

    // Sterren-teller (echte ster-afbeelding i.p.v. emoji)
    this.add.image(this.W - 64, 23, 'star').setDepth(50).setScale(2.4);
    this.starText = this.add.text(this.W - 16, 23, `${getStars()}`, {
      fontFamily: 'Arial Black, Arial', fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(1, 0.5).setDepth(50).setStroke('#1f2d3a', 5);

    // Gebied-naam
    this.zoneText = this.add.text(this.W / 2, 24, ZONES[this.zone].name, {
      fontFamily: 'Arial Black, Arial', fontSize: '17px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(50).setStroke('#1f2d3a', 4);

    // Voortgang naar volgend gebied (mini-bolletjes)
    this.progDots = this.add.container(this.W / 2, 48).setDepth(50);
    this.drawProgress();
  }

  drawProgress() {
    this.progDots.removeAll(true);
    const need = this.puzzlesPerZone();
    const done = this.solved % need;
    const gap = 16, startX = -((need - 1) * gap) / 2;
    for (let i = 0; i < need; i++) {
      const dot = this.add.circle(startX + i * gap, 0, 5, i < done ? 0xfbbf24 : 0xffffff, i < done ? 1 : 0.4);
      dot.setStrokeStyle(2, 0x1f2d3a, 0.6);
      this.progDots.add(dot);
    }
  }

  puzzlesPerZone() { return 4; }

  // ------------------------------------------------------------- DOEL-PLEK
  buildPedestal() {
    this.pedestal = this.add.container(this.W / 2, 200).setDepth(5);
    // gloeiende ring/pad
    const pad = this.add.ellipse(0, 40, 130, 40, 0xffffff, 0.25);
    this.padRing = this.add.ellipse(0, 40, 120, 36).setStrokeStyle(5, 0xfbbf24, 1);
    // praatwolk
    const bubble = this.add.graphics();
    bubble.fillStyle(0xffffff, 1); bubble.lineStyle(4, 0x1f2d3a, 1);
    bubble.fillRoundedRect(-92, -52, 184, 64, 16); bubble.strokeRoundedRect(-92, -52, 184, 64, 16);
    bubble.fillTriangle(-14, 10, 14, 10, 0, 30); bubble.fillStyle(0x1f2d3a, 1);
    this.promptText = this.add.text(0, -20, 'Maak de 5!', {
      fontFamily: 'Arial Black, Arial', fontSize: '24px', fontStyle: 'bold', color: '#1f2d3a',
    }).setOrigin(0.5);
    this.targetBadge = this.add.text(0, 40, '5', {
      fontFamily: 'Arial Black, Arial', fontSize: '34px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setStroke('#1f2d3a', 6);
    this.pedestal.add([pad, this.padRing, bubble, this.promptText, this.targetBadge]);
    this.tweens.add({ targets: this.padRing, scaleX: 1.12, scaleY: 1.12, alpha: 0.7, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  setPrompt(target) {
    this.promptText.setText(`Maak de ${target}!`);
    this.targetBadge.setText(`${target}`).setColor('#' + sig(target).toString(16).padStart(6, '0'));
    this.tweens.add({ targets: this.targetBadge, scale: 1.25, duration: 200, yoyo: true, ease: 'Back.out' });
  }

  // ------------------------------------------------------------- PUZZELS
  startPuzzle() {
    this.locked = false;
    // doel loopt op met het gebied
    const base = [4, 5, 7, 9][this.zone];
    this.target = base + Phaser.Math.Between(-1, 2); // wat variatie
    this.target = Phaser.Math.Clamp(this.target, 3, 12);
    this.setPrompt(this.target);
    this.spawnPuzzleBlocks(this.target);
    this.say(`Maak de ${WORDS[this.target] || this.target}`);
  }

  // Verdeel het doel in 2-3 stukjes en zet die als losse blokjes neer,
  // plus soms een afleider, zodat het kind ze moet samenvoegen.
  spawnPuzzleBlocks(target) {
    this.blocks.forEach((b) => b.container.destroy());
    this.blocks = [];

    const parts = this.partition(target);
    // soms een kleine afleider (1 of 2) erbij, maar nooit zo dat het verwart
    if (Phaser.Math.Between(0, 2) === 0 && target <= 9) parts.push(Phaser.Math.Between(1, 2));

    Phaser.Utils.Array.Shuffle(parts);
    const n = parts.length;
    parts.forEach((v, i) => {
      const cols = Math.min(n, 3);
      const col = i % cols, row = Math.floor(i / cols);
      const x = Phaser.Math.Linear(PLAY.x0 + 50, PLAY.x1 - 50, cols === 1 ? 0.5 : col / (cols - 1));
      const y = PLAY.y0 + 70 + row * 150 + Phaser.Math.Between(-12, 12);
      this.makeBlock(v, x, y);
    });
  }

  partition(target) {
    // 2 of 3 stukjes die optellen tot target (elk >= 1)
    const pieces = target >= 7 ? 3 : 2;
    const parts = [];
    let rest = target;
    for (let i = 0; i < pieces - 1; i++) {
      const max = rest - (pieces - 1 - i);
      const v = Phaser.Math.Between(1, Math.max(1, Math.min(max, target - 1)));
      parts.push(v); rest -= v;
    }
    parts.push(rest);
    return parts;
  }

  // ----------------------------------------------------- NUMBERBLOCK-FIGUUR
  makeBlock(value, x, y) {
    const container = this.add.container(x, y).setDepth(10);
    const block = { container, value, eyes: [], pupils: [], mouth: null, cubes: [], wasDragged: false, blinkT: 0, faceY: 0, homeX: x, homeY: y };
    container.setData('block', block);
    this.drawBlockVisual(block);
    this.makeInteractive(block);
    this.idleAnim(block);
    this.blocks.push(block);
    // verschijn-pop
    container.setScale(0.2);
    this.tweens.add({ targets: container, scale: 1, duration: 320, ease: 'Back.out' });
    return block;
  }

  drawBlockVisual(block) {
    const c = block.container;
    c.removeAll(true);
    block.eyes = []; block.pupils = [];
    const v = block.value;
    const W = 58;
    const ch = Phaser.Math.Clamp(230 / v, 18, 50); // kubus-vormig klein, dunner bij groot
    const totalH = v * ch;
    const color = sig(v);
    const edge = darker(color, 55);
    const top = totalH / 2 - totalH; // = -totalH/2
    block.W = W; block.totalH = totalH;
    const rad = Math.min(9, ch * 0.28);

    // schaduw op de grond
    const shadow = this.add.ellipse(0, totalH / 2 + 14, W * 0.95, 16, 0x000000, 0.18);
    c.add(shadow); block.shadow = shadow;

    // ---- armpjes (achter het lijf), in een donkerder tint ----
    const armY = top + ch * 0.65;
    const armG = this.add.graphics();
    armG.lineStyle(9, darker(color, 22), 1);
    // links
    armG.beginPath(); armG.moveTo(-W / 2 + 4, armY);
    armG.lineTo(-W / 2 - 16, armY + 10); armG.lineTo(-W / 2 - 20, armY + 30); armG.strokePath();
    armG.fillStyle(darker(color, 22), 1); armG.fillCircle(-W / 2 - 20, armY + 33, 6);
    // rechts
    armG.lineStyle(9, darker(color, 22), 1);
    armG.beginPath(); armG.moveTo(W / 2 - 4, armY);
    armG.lineTo(W / 2 + 16, armY + 10); armG.lineTo(W / 2 + 20, armY + 30); armG.strokePath();
    armG.fillCircle(W / 2 + 20, armY + 33, 6);
    c.add(armG); block.arms = armG;
    block.rightHand = { x: W / 2 + 20, y: armY + 33 };

    // ---- schoentjes ----
    const feet = this.add.graphics();
    feet.fillStyle(darker(color, 38), 1);
    feet.fillRoundedRect(-W * 0.42, totalH / 2 - 4, W * 0.34, 14, 6);
    feet.fillRoundedRect(W * 0.08, totalH / 2 - 4, W * 0.34, 14, 6);
    feet.fillStyle(lighten(color, 30), 0.5);
    feet.fillRoundedRect(-W * 0.40, totalH / 2 - 2, W * 0.30, 4, 3);
    feet.fillRoundedRect(W * 0.10, totalH / 2 - 2, W * 0.30, 4, 3);
    c.add(feet);

    // ---- kubussen met 3D-glans (van onder naar boven) ----
    for (let i = 0; i < v; i++) {
      const cy = totalH / 2 - ch / 2 - i * ch;
      const ty = cy - ch / 2; // bovenkant van dit blokje
      const g = this.add.graphics();
      // basis
      g.fillStyle(color, 1);
      g.fillRoundedRect(-W / 2, ty, W, ch, rad);
      // donkere onderrand (volume)
      g.fillStyle(darker(color, 30), 1);
      g.fillRoundedRect(-W / 2, ty + ch - Math.max(5, ch * 0.18), W, Math.max(5, ch * 0.18), rad);
      g.fillStyle(color, 1);
      g.fillRoundedRect(-W / 2, ty, W, ch - Math.max(5, ch * 0.18), rad);
      // glans-strook linksboven
      g.fillStyle(lighten(color, 75), 0.55);
      g.fillRoundedRect(-W / 2 + 5, ty + 4, W * 0.34, ch * 0.5, 5);
      // top-vlak op het BOVENSTE blokje (alsof je er licht op neerkijkt)
      if (i === v - 1) {
        g.fillStyle(lighten(color, 45), 1);
        g.fillEllipse(0, ty + 3, W - 10, ch * 0.34);
      }
      // subtiele rand in dezelfde kleurfamilie (geen hard zwart)
      g.lineStyle(2.5, edge, 0.9);
      g.strokeRoundedRect(-W / 2, ty, W, ch, rad);
      // groef-lijn tussen de blokjes
      if (i > 0) { g.lineStyle(2, edge, 0.5); g.beginPath(); g.moveTo(-W / 2 + 3, ty); g.lineTo(W / 2 - 3, ty); g.strokePath(); }
      c.add(g);
    }

    // ---- gezicht op het bovenste blokje ----
    const faceY = top + ch * 0.52;
    block.faceY = faceY;
    const eo = 12, er = Math.min(11, ch * 0.26);
    for (const sx of [-eo, eo]) {
      const white = this.add.circle(sx, faceY - 2, er, 0xffffff).setStrokeStyle(2.5, 0x16202b);
      const pupil = this.add.circle(sx, faceY - 1, er * 0.46, 0x16202b);
      c.add(white); c.add(pupil);
      block.eyes.push(white); block.pupils.push(pupil);
      pupil.baseX = sx; pupil.baseY = faceY - 1;
    }
    const mouth = this.add.graphics();
    c.add(mouth); block.mouth = mouth;
    this.setExpression(block, 'happy');

    // ---- cijfer-schijfje bovenop het hoofd (zoals de echte Numberblocks) ----
    const discR = 16;
    const discY = top - discR * 0.55;
    const neck = this.add.graphics();
    neck.fillStyle(0xffffff, 1); neck.fillRect(-4, top - 6, 8, 8);
    c.add(neck);
    const disc = this.add.circle(0, discY, discR, 0xffffff).setStrokeStyle(3, 0x16202b);
    c.add(disc);
    const num = this.add.text(0, discY, `${v}`, {
      fontFamily: 'Arial Black, Arial', fontSize: `${Math.min(24, 16 + v)}px`, fontStyle: 'bold', color: '#16202b',
    }).setOrigin(0.5);
    c.add(num);

    // ---- eigen persoonlijkheid (bril, knoopjes, wenkbrauwen, sterhand…) ----
    this.drawPersonality(block);

    // hitbox (lijf + schijfje)
    c.setSize(W, totalH);
    c.setInteractive(new Phaser.Geom.Rectangle(-W / 2 - 8, top - discR * 1.4, W + 16, totalH + discR * 1.4 + 14), Phaser.Geom.Rectangle.Contains);
    this.input.setDraggable(c);
  }

  setExpression(block, kind) {
    const m = block.mouth; if (!m) return;
    m.clear(); m.lineStyle(3, 0x16202b, 1);
    const y = block.faceY + 12;
    if (kind === 'happy') { m.beginPath(); m.arc(0, y - 4, 9, 0.15 * Math.PI, 0.85 * Math.PI); m.strokePath(); }
    else if (kind === 'big') { m.fillStyle(0x16202b, 1); m.fillCircle(0, y, 6); m.fillStyle(0xff7a9c, 1); m.fillCircle(0, y + 1, 3); }
    else if (kind === 'sad') { m.beginPath(); m.arc(0, y + 8, 9, 1.15 * Math.PI, 1.85 * Math.PI); m.strokePath(); }
    else if (kind === 'surprise') { m.lineStyle(3, 0x16202b, 1); m.strokeCircle(0, y, 5); }
  }

  makeInteractive(block) {
    const c = block.container;
    c.on('pointerdown', () => { block.wasDragged = false; });
    c.on('dragstart', () => {
      if (this.locked) return;
      block.wasDragged = true;
      c.setDepth(40);
      this.tweens.killTweensOf(c);
      this.tweens.add({ targets: c, scaleX: 1.14, scaleY: 0.9, duration: 110, yoyo: true, ease: 'Quad.out',
        onComplete: () => { c.setScale(1.08); } });
      if (block.shadow) this.tweens.add({ targets: block.shadow, scaleX: 0.7, alpha: 0.1, duration: 120 });
      SFX.pick();
      this.lookAll(block);
    });
    c.on('dragend', () => { if (!this.locked) this.dropBlock(block); });
    c.on('pointerup', () => { if (!block.wasDragged && !this.locked) this.tapBlock(block); });
  }

  // Idle: zacht op-en-neer wiebelen + af en toe knipperen.
  idleAnim(block) {
    const c = block.container;
    this.tweens.add({ targets: c, y: c.y - 4, duration: Phaser.Math.Between(1100, 1600), yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: Phaser.Math.Between(0, 600) });
    block.blinkT = Phaser.Math.Between(800, 3000);
  }

  // ----------------------------------------------------------- INTERACTIES
  tapBlock(block) {
    // Splitsen: er springt een 1 los (als het kan). Anders: giecheltje.
    if (block.value <= 1) {
      SFX.giggle();
      this.jump(block);
      this.setExpression(block, 'surprise');
      this.time.delayedCall(400, () => this.setExpression(block, 'happy'));
      return;
    }
    block.value -= 1;
    this.drawBlockVisual(block);
    this.popSquash(block.container);
    SFX.pop();
    // de losgesprongen 1 verschijnt ernaast
    const nx = Phaser.Math.Clamp(block.container.x + Phaser.Math.Between(60, 90), PLAY.x0 + 30, PLAY.x1 - 30);
    const one = this.makeBlock(1, block.container.x, block.container.y);
    this.tweens.add({ targets: one.container, x: nx, duration: 320, ease: 'Back.out' });
    this.sparkleAt(block.container.x, block.container.y - block.totalH / 2, 6);
    this.say('een');
  }

  dropBlock(block) {
    const c = block.container;
    c.setScale(1);
    if (block.shadow) this.tweens.add({ targets: block.shadow, scaleX: 1, alpha: 0.18, duration: 150 });

    // op de doel-plek?
    const ped = this.pedestal;
    if (Phaser.Math.Distance.Between(c.x, c.y, ped.x, ped.y + 40) < 90) {
      this.trySolve(block);
      return;
    }

    // op een ander blokje? -> samenvoegen
    let other = null, best = 9999;
    for (const b of this.blocks) {
      if (b === block) continue;
      const d = Phaser.Math.Distance.Between(c.x, c.y, b.container.x, b.container.y);
      if (d < 70 && d < best) { best = d; other = b; }
    }
    if (other) { this.mergeBlocks(block, other); return; }

    // anders: netjes binnen het veld blijven, met een klein stuiter-landing
    this.settle(block);
  }

  settle(block) {
    const c = block.container;
    c.x = Phaser.Math.Clamp(c.x, PLAY.x0 + 30, PLAY.x1 - 30);
    c.y = Phaser.Math.Clamp(c.y, PLAY.y0 + 20, PLAY.y1);
    c.setDepth(10);
    SFX.place();
    this.tweens.add({ targets: c, scaleX: 1.12, scaleY: 0.86, duration: 110, yoyo: true, ease: 'Quad.out' });
  }

  mergeBlocks(moving, target) {
    this.locked = true;
    const a = moving.container, b = target.container;
    const newVal = moving.value + target.value;
    // het bewegende blokje vliegt naar het doel-blokje
    this.tweens.add({
      targets: a, x: b.x, y: b.y, scale: 0.6, duration: 160, ease: 'Quad.in',
      onComplete: () => {
        // verwijder het bewegende, het doel-blokje wordt het nieuwe getal
        this.blocks = this.blocks.filter((x) => x !== moving);
        a.destroy();
        target.value = newVal;
        this.drawBlockVisual(target);
        this.idleAnim(target);
        this.popSquash(b, 1.3);
        this.setExpression(target, newVal >= 10 ? 'big' : 'happy');
        this.time.delayedCall(500, () => { if (target.mouth) this.setExpression(target, 'happy'); });
        this.sparkleAt(b.x, b.y - target.totalH / 2, 12);
        this.burstStars(b.x, b.y, 6);
        SFX.combine(newVal);
        this.say(`${WORDS[newVal] || newVal}`);
        this.lookAll(target);
        this.locked = false;
      },
    });
  }

  trySolve(block) {
    const c = block.container;
    if (block.value === this.target) {
      this.locked = true;
      // op de pad zetten + vieren
      this.tweens.add({ targets: c, x: this.pedestal.x, y: this.pedestal.y + 40, duration: 200, ease: 'Quad.out' });
      this.celebrate(block);
    } else {
      // vriendelijk terug, geen straf
      SFX.oops();
      this.setExpression(block, 'sad');
      this.say(`oei, dat is ${WORDS[block.value] || block.value}`);
      this.shake(c);
      this.tweens.add({ targets: c, x: block.homeX, y: block.homeY, duration: 380, ease: 'Back.out',
        onComplete: () => { this.setExpression(block, 'happy'); c.setDepth(10); } });
    }
  }

  celebrate(block) {
    const c = block.container;
    this.solved += 1;
    this.drawProgress();
    confettiBurst(this, 200);
    this.burstStars(c.x, c.y, 16);
    this.sparkleAt(c.x, c.y - block.totalH / 2, 18);
    SFX.yay();
    this.say(`${WORDS[this.target] || this.target}! ${this.cheer()}`, { pitch: 1.7 });
    // het figuurtje danst
    this.setExpression(block, 'big');
    this.tweens.add({ targets: c, y: c.y - 24, duration: 220, yoyo: true, repeat: 2, ease: 'Sine.inOut' });
    this.tweens.add({ targets: c, angle: { from: -8, to: 8 }, duration: 140, yoyo: true, repeat: 5, ease: 'Sine.inOut',
      onComplete: () => { c.angle = 0; } });

    const reward = 1 + this.zone; // meer sterren in latere gebieden
    addStars(reward);
    this.starText.setText(`${getStars()}`);
    this.tweens.add({ targets: this.starText, scale: 1.3, duration: 200, yoyo: true });

    const need = this.puzzlesPerZone();
    const unlock = (this.solved % need === 0) && this.zone < ZONES.length - 1;

    this.time.delayedCall(1500, () => {
      // ruim alle blokjes op
      this.blocks.forEach((b) => this.tweens.add({ targets: b.container, scale: 0, duration: 250, ease: 'Back.in' }));
      this.time.delayedCall(280, () => {
        this.blocks.forEach((b) => b.container.destroy());
        this.blocks = [];
        if (unlock) this.unlockZone();
        else this.startPuzzle();
      });
    });
  }

  unlockZone() {
    this.zone += 1;
    const z = ZONES[this.zone];
    showReward(this, {
      title: 'Nieuw gebied! 🎉',
      subtitle: `Welkom in ${z.name}!`,
      stars: 2,
      buttonText: 'Verken! ✨',
      onClose: () => {
        this.starText.setText(`${getStars()}`);
        this.repaintZone();
        this.startPuzzle();
      },
    });
    this.say(`Nieuw gebied! ${z.name}`, { pitch: 1.7 });
  }

  repaintZone() {
    const z = ZONES[this.zone];
    this.paintSky(z); this.paintHills(z);
    this.zoneText.setText(z.name);
    this.drawProgress();
    // bouw de scenery opnieuw op in de stijl van het nieuwe gebied
    this.scenery.forEach((s) => s.destroy());
    this.scenery = [];
    this.buildScenery(z);
  }

  // ----------------------------------------------------- KLEINE EFFECTEN
  popSquash(c, big = 1) {
    this.tweens.killTweensOf(c);
    c.setScale(1);
    this.tweens.add({ targets: c, scaleX: 1.2 * big, scaleY: 0.8, duration: 120, yoyo: true, ease: 'Quad.out',
      onComplete: () => c.setScale(1) });
  }

  jump(block) {
    const c = block.container;
    this.tweens.add({ targets: c, y: c.y - 26, duration: 200, yoyo: true, ease: 'Quad.out' });
  }

  shake(c) {
    const x0 = c.x;
    this.tweens.add({ targets: c, x: x0 - 8, duration: 50, yoyo: true, repeat: 3, onComplete: () => { c.x = x0; } });
  }

  sparkleAt(x, y, n = 8) {
    const p = this.add.particles(x, y, 'star', {
      speed: { min: 40, max: 160 }, angle: { min: 0, max: 360 },
      scale: { start: 1.2, end: 0 }, lifespan: 700, quantity: n,
      tint: [0xffffff, 0xfff3b0, 0xffe16b], blendMode: 'ADD',
    }).setDepth(60);
    this.time.delayedCall(750, () => p.destroy());
  }

  burstStars(x, y, n = 10) {
    const p = this.add.particles(x, y, 'star', {
      speedY: { min: -260, max: -90 }, speedX: { min: -130, max: 130 },
      gravityY: 420, scale: { start: 1.6, end: 0.2 }, lifespan: 1100, quantity: n,
      tint: [0xf87171, 0xfbbf24, 0x4ade80, 0x60a5fa, 0xec4899], rotate: { min: 0, max: 360 },
    }).setDepth(60);
    this.time.delayedCall(1200, () => p.destroy());
  }

  // Verrassing: een cadeautje zweeft binnen; tik = bonus-sterren.
  maybeSurprise() {
    if (this.locked || this.surprise) return;
    if (Phaser.Math.Between(0, 1) === 0) return;
    const y = Phaser.Math.Between(PLAY.y0 + 30, PLAY.y0 + 90);
    const gift = this.makeGift(-30, y);
    this.surprise = gift;
    this.tweens.add({ targets: gift, x: this.W + 30, duration: 7000, ease: 'Linear',
      onComplete: () => { gift.destroy(); if (this.surprise === gift) this.surprise = null; } });
    this.tweens.add({ targets: gift, y: y - 12, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    gift.on('pointerdown', () => {
      if (!gift.active) return;
      this.tweens.killTweensOf(gift);
      this.sparkleAt(gift.x, gift.y, 14);
      this.burstStars(gift.x, gift.y, 10);
      addStars(2); this.starText.setText(`${getStars()}`);
      SFX.sparkle(); this.say('Cadeautje! Twee sterren!', { pitch: 1.7 });
      gift.destroy(); this.surprise = null;
    });
  }

  // Laat alle gezichtjes naar een blokje kijken (ogen volgen).
  lookAll(target) { this.lookTarget = target; this.lookT = 1200; }

  // ------------------------------------------------------------- UPDATE
  update(time, delta) {
    const dt = delta / 1000;
    // wolken drijven
    for (const c of this.clouds) {
      c.x += c.driftSpeed * dt;
      if (c.x > this.W + 60) c.x = -60;
    }
    // vlinders/vogels zweven
    for (const f of this.fliers) {
      f.x += f.vx * dt;
      f.phase += dt * 2;
      f.y = f.baseY + Math.sin(f.phase) * 10;
      if (f.x > this.W + 40) f.x = -40;
      if (f.x < -40) f.x = this.W + 40;
    }
    // ogen + knipperen
    const lt = this.lookTarget && this.lookTarget.container && this.lookTarget.container.active ? this.lookTarget : null;
    if (this.lookT > 0) this.lookT -= delta;
    for (const b of this.blocks) {
      if (!b.container.active) continue;
      // pupillen richten
      let tx = 0, ty = 0;
      if (lt && lt !== b && this.lookT > 0) {
        const ang = Math.atan2((lt.container.y) - (b.container.y), (lt.container.x) - (b.container.x));
        tx = Math.cos(ang) * 2.4; ty = Math.sin(ang) * 2.4;
      } else {
        tx = Math.sin(time * 0.0011 + b.homeX) * 1.6; ty = 1;
      }
      for (const p of b.pupils) { p.x = p.baseX + tx; p.y = p.baseY + ty; }
      // knipperen
      b.blinkT -= delta;
      if (b.blinkT <= 0) {
        b.blinkT = Phaser.Math.Between(1600, 4200);
        for (const e of b.eyes) this.tweens.add({ targets: e, scaleY: 0.1, duration: 70, yoyo: true });
        for (const p of b.pupils) this.tweens.add({ targets: p, scaleY: 0.1, duration: 70, yoyo: true });
      }
    }
  }

  // ------------------------------------------------------------- STEM
  say(text, opts = {}) {
    if (!isSoundOn()) return;
    try {
      const synth = window.speechSynthesis; if (!synth) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'nl-NL'; if (this.nlVoice) u.voice = this.nlVoice;
      u.pitch = opts.pitch != null ? opts.pitch : 1.5; u.rate = opts.rate != null ? opts.rate : 1.0; u.volume = 1;
      synth.speak(u);
    } catch (e) {}
  }
  loadVoice() {
    try {
      const synth = window.speechSynthesis; if (!synth) return;
      const pick = () => {
        const nl = synth.getVoices().filter((v) => /nl(-|_)?/i.test(v.lang));
        if (!nl.length) return;
        this.nlVoice = nl.find((v) => /female|vrouw|fenna|lotte|saskia|ellen|google/i.test(v.name)) || nl[0];
      };
      pick(); synth.onvoiceschanged = pick;
    } catch (e) {}
  }
  primeSpeech() {
    if (this.speechPrimed) return; this.speechPrimed = true;
    try {
      const synth = window.speechSynthesis; if (!synth) return;
      const u = new SpeechSynthesisUtterance(' '); u.volume = 0; synth.speak(u); this.loadVoice();
    } catch (e) {}
  }
  cheer() { return Phaser.Utils.Array.GetRandom(['Joepie!', 'Hoera!', 'Goed zo!', 'Super!', 'Top!', 'Wauw!', 'Yes!']); }
}
