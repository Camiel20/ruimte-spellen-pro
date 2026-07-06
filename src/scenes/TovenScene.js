import Phaser from 'phaser';
import { SFX } from '../sound.js';
import { Voice } from '../voice.js';
import { addStars, giveMedal, markRecept } from '../progress.js';
import { confettiBurst } from '../reward.js';
import { maakNul, INKT } from '../theme.js';
import {
  KLEUREN, mengKleur, ketelKleur, kiesRecept, brouwStatus,
} from '../toverLogic.js';

// Nul's Toverwinkel — FASE 1: de magische kern.
// Een klant komt met een wens; jij brouwt het drankje door de juiste kleuren
// (mengen!), sterretjes, roeren en het toverwoord. Bij succes: POEF, de klant
// transformeert, en er bloeit weer wat kleur op in de winkel.
//
// De brouw-logica (recepten, kleuren mengen, de check) staat los in
// src/toverLogic.js en is met vitest getest. Deze scene is het wonder.

const KLANT_X = 392, KLANT_Y = 300;
const KETEL_X = 236, KETEL_Y = 476;

export default class TovenScene extends Phaser.Scene {
  constructor() { super('Toverwinkel'); }

  create() {
    this.eersteOoit = true;
    this.bloeiBloemen = [];
    this.vorigId = null;
    this.bezig = false;

    this.buildWinkel();
    this.buildKetel();
    this.nulHelper = maakNul(this, 60, 512, 26).setDepth(20);
    this._nulY = 512;
    this.time.addEvent({ delay: 3200, loop: true, callback: () => { if (!this.bezig) this.nulHelper.knipper(); } });
    // wijs-handje dat boven de volgende stap zweeft (begeleiding voor niet-lezers)
    this._puls = []; this._pulsDoelen = [];
    this._wijzer = this.add.text(0, 0, '👇', { fontSize: '26px' }).setOrigin(0.5).setDepth(45).setVisible(false);
    this.tweens.add({ targets: this._wijzer, scale: 1.25, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // ECHT ROEREN: rondjes tekenen met je vinger in de ketel
    this.input.on('pointermove', (p) => this.roerBeweging(p));
    this.input.on('pointerup', () => {
      this._roerVorig = null;
      if (this.lepel) this.lepel.setVisible(false);
      if (this.draaikolk) this.tweens.add({ targets: this.draaikolk, alpha: 0, duration: 450 });
    });

    // Terug-pil
    const back = this.add.text(16, 16, '⬅ Terug', {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#4a3520',
      backgroundColor: '#f4e2b8', padding: { x: 11, y: 6 },
    }).setDepth(50).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => { SFX.click(); this.scene.start('Menu'); });
    this.add.text(this.scale.width / 2, 24, '🧪 Nul\'s Toverwinkel', {
      fontFamily: 'Arial Black, Arial', fontSize: '17px', fontStyle: 'bold', color: '#4a3520',
    }).setOrigin(0.5, 0).setDepth(50);

    this.cameras.main.fadeIn(320, 60, 40, 74);
    this.nieuweKlant();
  }

  // ------------------------------------------------------ winkel-decor

  buildWinkel() {
    const { width, height } = this.scale;
    // geschilderd winkel-decor (canvas-textuur): muur met gloed, boograam met
    // maanlicht + dorpje, houten planken met gloeiende flesjes, vloer, lantaarns.
    if (!this.textures.exists('tw_bg')) this.schilderWinkel(width, height);
    this.add.image(0, 0, 'tw_bg').setOrigin(0).setDepth(-10);

    // volumetrische lichtbundel die uit de ketel omhoog schijnt
    const shaft = this.add.graphics().setDepth(1).setBlendMode(Phaser.BlendModes.ADD);
    shaft.fillStyle(0xffd9a0, 0.10);
    shaft.beginPath();
    shaft.moveTo(KETEL_X - 42, KETEL_Y - 30);
    shaft.lineTo(KETEL_X + 42, KETEL_Y - 30);
    shaft.lineTo(KETEL_X + 155, 30);
    shaft.lineTo(KETEL_X - 155, 30);
    shaft.closePath(); shaft.fillPath();
    if (shaft.preFX) shaft.preFX.addGlow(0xffe4b0, 4, 0, false, 0.1, 10);
    this.tweens.add({ targets: shaft, alpha: 0.6, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // opstijgende sintels/magie-vonken uit de ketel
    this.add.particles(KETEL_X, KETEL_Y - 26, 'star', {
      x: { min: -60, max: 60 }, speed: { min: 12, max: 40 }, angle: { min: 250, max: 290 },
      lifespan: { min: 2600, max: 4200 }, frequency: 240, gravityY: -6,
      scale: { start: 0.5, end: 0 }, alpha: { start: 0.9, end: 0 },
      tint: [0xffe9a8, 0xffd27a, 0xfff6d0], blendMode: 'ADD',
    }).setDepth(3);

    // langzaam drijvende toverrunen
    ['✦', '✧', '⟡', '✺'].forEach((gl, i) => {
      const r = this.add.text(64 + i * 118, 118 + (i % 2) * 84, gl, { fontSize: '20px', color: '#ffe9a8' })
        .setOrigin(0.5).setDepth(2).setAlpha(0.26).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: r, y: r.y - 26, angle: 20, alpha: 0.5, duration: 4000 + i * 500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });

    // gloeiende stofjes
    for (let i = 0; i < 22; i++) {
      const s = this.add.circle(Phaser.Math.Between(20, width - 20), Phaser.Math.Between(80, height - 40), Phaser.Math.FloatBetween(1, 2.6), 0xffe9a8, 0.55).setDepth(2).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: s, y: s.y - Phaser.Math.Between(20, 50), alpha: 0.08, duration: Phaser.Math.Between(2500, 5000), yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: Phaser.Math.Between(0, 2000) });
    }

    // warme gloed-laag: de winkel klaart zichtbaar op naarmate er meer bloeit
    // ("de kleur keert terug"). Boven het decor, onder de ketel/kaarten.
    this.warmte = this.add.rectangle(width / 2, height / 2, width, height, 0xffd9a0).setDepth(4).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);
  }

  // Schildert het winkel-interieur één keer op een canvas-textuur ('tw_bg').
  schilderWinkel(w, h) {
    const tex = this.textures.createCanvas('tw_bg', w, h);
    const c = tex.getContext();
    const rr = (x, y, ww, hh, r) => {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + ww, y, x + ww, y + hh, r);
      c.arcTo(x + ww, y + hh, x, y + hh, r);
      c.arcTo(x, y + hh, x, y, r);
      c.arcTo(x, y, x + ww, y, r);
      c.closePath();
    };

    // muur-verloop
    let wall = c.createLinearGradient(0, 0, 0, h);
    wall.addColorStop(0, '#140a26'); wall.addColorStop(0.5, '#291640'); wall.addColorStop(1, '#3a2352');
    c.fillStyle = wall; c.fillRect(0, 0, w, h);

    // warme gloed rond de ketel
    let glow = c.createRadialGradient(236, 470, 20, 236, 470, 380);
    glow.addColorStop(0, 'rgba(255,190,110,0.42)');
    glow.addColorStop(0.5, 'rgba(200,120,180,0.16)');
    glow.addColorStop(1, 'rgba(120,80,150,0)');
    c.fillStyle = glow; c.fillRect(0, 0, w, h);

    // ---- gloeiende nis achter de ketel (architecturale diepte + magie) ----
    const ax = 240, acy = 300, aw = 152;
    const alcove = () => {
      c.beginPath();
      c.moveTo(ax - aw / 2, 500);
      c.lineTo(ax - aw / 2, acy);
      c.arc(ax, acy, aw / 2, Math.PI, 0, true);
      c.lineTo(ax + aw / 2, 500);
      c.closePath();
    };
    c.save(); alcove(); c.clip();
    let nis = c.createRadialGradient(ax, 400, 20, ax, 400, 250);
    nis.addColorStop(0, 'rgba(255,196,120,0.34)');
    nis.addColorStop(0.55, 'rgba(150,95,175,0.14)');
    nis.addColorStop(1, 'rgba(60,40,90,0)');
    c.fillStyle = nis; c.fillRect(ax - aw, acy - aw, aw * 2, 500);
    // zwevende runen diep in de nis
    c.fillStyle = 'rgba(255,225,170,0.5)'; c.font = '18px serif'; c.textAlign = 'center';
    c.fillText('✦', ax - 46, acy + 6); c.fillText('✧', ax + 48, acy - 6); c.fillText('⟡', ax, acy - 42);
    c.textAlign = 'left';
    c.restore();
    // zachte steen-boog rand
    c.lineWidth = 7; c.strokeStyle = 'rgba(90,66,130,0.55)'; alcove(); c.stroke();
    c.lineWidth = 2; c.strokeStyle = 'rgba(255,225,180,0.28)'; alcove(); c.stroke();

    // ---- houten planken met gloeiende flesjes ----
    const plank = (px, py, pw2) => {
      c.fillStyle = '#3a2416'; c.fillRect(px, py, pw2, 12);
      c.fillStyle = 'rgba(255,220,160,0.15)'; c.fillRect(px, py, pw2, 3);
    };
    const fles = (fx, fy, col) => {
      let fg = c.createRadialGradient(fx, fy, 2, fx, fy, 26);
      fg.addColorStop(0, col + 'cc'); fg.addColorStop(1, col + '00');
      c.fillStyle = fg; c.fillRect(fx - 26, fy - 26, 52, 52);
      c.fillStyle = col; rr(fx - 9, fy - 18, 18, 28, 6); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(fx - 6, fy - 15, 3, 20);
      c.fillStyle = '#7a5230'; c.fillRect(fx - 5, fy - 26, 10, 8);
    };
    plank(28, 214, 112); fles(52, 204, '#e8402c'); fles(86, 204, '#57b947'); fles(118, 204, '#38b6cf');
    plank(28, 306, 112); fles(60, 296, '#f6c624'); fles(106, 296, '#ec6aa9');
    plank(340, 214, 112); fles(362, 204, '#9b6dd6'); fles(396, 204, '#f6c624'); fles(428, 204, '#57b947');
    plank(340, 306, 112); fles(370, 296, '#38b6cf'); fles(416, 296, '#e8402c');

    // ---- houten vloer ----
    const fy0 = h - 160;
    let floor = c.createLinearGradient(0, fy0, 0, h);
    floor.addColorStop(0, '#3a2416'); floor.addColorStop(1, '#1c1008');
    c.fillStyle = floor; c.fillRect(0, fy0, w, 160);
    c.fillStyle = 'rgba(255,210,150,0.10)'; c.fillRect(0, fy0, w, 4);
    c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 2;
    for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(w / 2 + i * 40, fy0); c.lineTo(w / 2 + i * 120, h); c.stroke(); }
    for (let yy = fy0 + 40; yy < h; yy += 40) { c.beginPath(); c.moveTo(0, yy); c.lineTo(w, yy); c.stroke(); }

    // ---- hangende lantaarns ----
    const lantaarn = (lx) => {
      c.strokeStyle = '#2a1c12'; c.lineWidth = 3; c.beginPath(); c.moveTo(lx, 0); c.lineTo(lx, 46); c.stroke();
      let lg = c.createRadialGradient(lx, 58, 3, lx, 58, 34);
      lg.addColorStop(0, 'rgba(255,200,120,0.85)'); lg.addColorStop(1, 'rgba(255,200,120,0)');
      c.fillStyle = lg; c.beginPath(); c.arc(lx, 58, 34, 0, 7); c.fill();
      c.fillStyle = '#ffcf7a'; rr(lx - 9, 46, 18, 24, 5); c.fill();
      c.strokeStyle = '#2a1c12'; c.lineWidth = 2; c.strokeRect(lx - 9, 46, 18, 24);
    };
    lantaarn(70); lantaarn(410);

    // ---- vignette voor diepte ----
    let vig = c.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.72);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.55)');
    c.fillStyle = vig; c.fillRect(0, 0, w, h);

    tex.refresh();
  }

  buildKetel() {
    // grote pulserende gloed-halo achter de ketel
    this.ketelHalo = this.add.ellipse(KETEL_X, KETEL_Y - 10, 270, 210, 0xffb46e, 0.16).setDepth(6).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: this.ketelHalo, scale: 1.12, alpha: 0.24, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    const g = this.add.graphics().setDepth(8);
    g.fillStyle(0x000000, 0.32); g.fillEllipse(KETEL_X, KETEL_Y + 72, 160, 32);
    // pot met verloop (lichte buik → donkere bodem)
    g.fillGradientStyle(0x4a3568, 0x4a3568, 0x160e28, 0x160e28, 1);
    g.beginPath();
    g.moveTo(KETEL_X - 74, KETEL_Y - 20);
    g.lineTo(KETEL_X - 60, KETEL_Y + 60);
    g.lineTo(KETEL_X + 60, KETEL_Y + 60);
    g.lineTo(KETEL_X + 74, KETEL_Y - 20);
    g.closePath(); g.fillPath();
    g.lineStyle(5, 0x0f0a1e, 1); g.strokePath();
    // metalen rand-highlight + klinknagels
    g.lineStyle(4, 0x9a7fc0, 0.9);
    g.beginPath(); g.moveTo(KETEL_X - 70, KETEL_Y - 18); g.lineTo(KETEL_X + 70, KETEL_Y - 18); g.strokePath();
    g.fillStyle(0x6a4f90, 1);
    [-58, -30, 0, 30, 58].forEach((dx) => g.fillCircle(KETEL_X + dx, KETEL_Y - 8, 2.4));
    // pootjes
    g.fillStyle(0x1a1230, 1);
    g.fillRect(KETEL_X - 50, KETEL_Y + 58, 12, 14);
    g.fillRect(KETEL_X + 38, KETEL_Y + 58, 12, 14);

    // vloeistof (kleur verandert live) + gloed-FX
    this.liquid = this.add.ellipse(KETEL_X, KETEL_Y - 20, 148, 40, KLEUREN.leeg).setDepth(9);
    if (this.liquid.preFX) this.liquidGlow = this.liquid.preFX.addGlow(0xffffff, 6, 0, false, 0.1, 14);
    // schuim-rand + glans op het oppervlak
    this.add.ellipse(KETEL_X, KETEL_Y - 20, 148, 40).setStrokeStyle(4, 0xd9b8ff, 0.9).setDepth(10);
    this.add.ellipse(KETEL_X, KETEL_Y - 24, 118, 20, 0xffffff, 0.14).setDepth(10);

    // stoom-sliertjes die opstijgen
    this.add.particles(KETEL_X, KETEL_Y - 24, 'star', {
      x: { min: -48, max: 48 }, speed: { min: 8, max: 24 }, angle: { min: 260, max: 280 },
      lifespan: { min: 1800, max: 3000 }, frequency: 200,
      scale: { start: 0.7, end: 1.6 }, alpha: { start: 0.16, end: 0 },
      tint: 0xffffff, blendMode: 'SCREEN',
    }).setDepth(11);

    // glans-borrels
    this.borrels = [];
    for (let i = 0; i < 5; i++) {
      const b = this.add.circle(KETEL_X + Phaser.Math.Between(-46, 46), KETEL_Y - 22, Phaser.Math.Between(4, 9), 0xffffff, 0.4).setDepth(11).setVisible(false);
      this.tweens.add({ targets: b, y: b.y - 12, scale: 0.2, duration: Phaser.Math.Between(700, 1200), yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 800) });
      this.borrels.push(b);
    }
    // gloed onder de rand (gebruikt door brouwKlaar)
    this.ketelGloed = this.add.ellipse(KETEL_X, KETEL_Y - 20, 168, 52, 0xffffff, 0.0).setDepth(8);

    // de roer-lepel (volgt je vinger langs de rand tijdens het roeren)
    const lepel = this.add.container(KETEL_X, KETEL_Y - 26).setDepth(13).setVisible(false);
    const lg = this.add.graphics();
    lg.fillStyle(0x8a5a33, 1); lg.fillRoundedRect(-4, -48, 8, 54, 4);
    lg.fillStyle(0xa9713f, 1); lg.fillEllipse(0, 10, 18, 12);
    lepel.add(lg);
    this.lepel = lepel;
    // de draaikolk die verschijnt als je roert
    const dk = this.add.graphics().setDepth(10).setVisible(false).setAlpha(0);
    dk.lineStyle(4, 0xffffff, 0.55);
    for (let a = 0; a < 3; a++) { dk.beginPath(); dk.arc(0, 0, 13 + a * 15, a * 1.2, a * 1.2 + 4.1); dk.strokePath(); }
    dk.setPosition(KETEL_X, KETEL_Y - 20);
    dk.scaleY = 0.3;
    this.draaikolk = dk;
  }

  // ------------------------------------------------------ per-frame
  update(time) {
    // schenken: een gekanteld flesje boven de ketel druppelt vanzelf —
    // haal 'm op tijd weg, anders giet je te veel!
    const f = this._sleepFles;
    if (f && f.schenkt && !this.bezig && time > (this._druppelTot || 0)) {
      this._druppelTot = time + 470;
      this.addDruppel(f.kleur, f.x - 24, f.y + 10);
    }
    // het wijs-handje volgt bewegende doelen (fladderende sterretjes, bellen)
    if (this._wijzer && this._wijzer.visible && this._wijzerDoel) {
      const d = this._wijzerDoel;
      if (d.active !== false) this._wijzer.setPosition(d.x, d.y - 46);
      else this.updateHint();
    }
  }

  // ------------------------------------------------------ klant + recept

  nieuweKlant() {
    this.bezig = false;
    this.recept = kiesRecept(Math.random, this.vorigId);
    this.vorigId = this.recept.id;
    this.staat = { druppels: {}, sterren: 0, roer: 0, gespeld: 0 };

    if (this.kaartC) this.kaartC.destroy();
    if (this.klantC) this.klantC.destroy();
    if (this.flessenC) this.flessenC.destroy();
    (this.sterretjes || []).forEach((s2) => s2.destroy());
    (this.bellen || []).forEach((b) => b.destroy());
    if (this.belTimer) this.belTimer.remove();
    if (this.schuimspaan) { this.schuimspaan.destroy(); this.schuimspaan = null; }
    if (this.schuimLaag) { this.schuimLaag.destroy(); this.schuimLaag = null; }
    this._roerTotaal = 0; this._roerVorig = null;

    this.setKetelKleur('leeg');
    this.borrels.forEach((b) => b.setVisible(false));

    this.buildKlant();
    this.buildKaart();
    this.buildFlesjes();
    this.buildSterretjes();
    this.startBellen();
    this._vorigStatus = { druppelsOk: false, sterrenOk: false, roerOk: false, woordOk: false };
    this.updateHint();
  }

  buildKlant() {
    const c = this.add.container(KLANT_X, KLANT_Y).setDepth(15);
    this.klantC = c;
    this.tekenKlant(c, this.recept.klant);
    c.setScale(0.6).setAlpha(0);
    this.tweens.add({ targets: c, scale: 1, alpha: 1, duration: 400, ease: 'Back.easeOut' });
    // idle wiebel
    this.tweens.add({ targets: c, angle: { from: -3, to: 3 }, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // wens-wolkje
    const bubble = this.add.container(KLANT_X - 6, KLANT_Y - 66).setDepth(16);
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.97); bg.fillRoundedRect(-70, -20, 140, 38, 12);
    bg.fillTriangle(-8, 16, 8, 16, 0, 30);
    const t = this.add.text(0, -1, this.recept.wens, {
      fontFamily: 'Arial', fontSize: '13px', fontStyle: 'bold', color: '#4a3520', align: 'center', wordWrap: { width: 128 },
    }).setOrigin(0.5);
    bubble.add([bg, t]);
    c.wolkje = bubble;
    this.tweens.add({ targets: bubble, y: bubble.y - 4, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  // teken een schattig klant-figuurtje per soort
  tekenKlant(c, kind) {
    const g = this.add.graphics();
    c.add(g);
    if (kind === 'bloem') {
      g.lineStyle(6, 0x4f9c3e, 1); g.lineBetween(0, 6, 0, 42);
      g.fillStyle(0xf87171, 1);
      for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 - Math.PI / 2; g.fillCircle(Math.cos(a) * 15, Math.sin(a) * 15, 11); }
      g.fillStyle(0xf8c630, 1); g.fillCircle(0, 0, 12);
      this.klantGezicht(c, 0, 0, 0.9);
    } else if (kind === 'mol') {
      g.fillStyle(0x8a6a52, 1); g.fillEllipse(0, 6, 54, 46);
      g.fillStyle(0x6a4a38, 1); g.fillEllipse(0, 22, 40, 16);
      g.fillStyle(0xf9a8d4, 1); g.fillCircle(0, 2, 8); // snuit
      this.klantGezicht(c, 0, -6, 0.8);
    } else if (kind === 'egel') {
      g.fillStyle(0x6b5545, 1);
      for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI; g.fillTriangle(Math.cos(a) * 24, Math.sin(a) * 24 + 6, Math.cos(a - 0.15) * 40, Math.sin(a - 0.15) * 40 + 6, Math.cos(a + 0.15) * 40, Math.sin(a + 0.15) * 40 + 6); }
      g.fillStyle(0xd8b48a, 1); g.fillEllipse(0, 12, 48, 34);
      this.klantGezicht(c, 0, 10, 0.8);
    } else { // muis
      g.fillStyle(0x9aa0a8, 1); g.fillCircle(0, 6, 24);
      g.fillStyle(0xc7cdd4, 1); g.fillCircle(-18, -12, 12); g.fillCircle(18, -12, 12);
      g.fillStyle(0xf9a8d4, 1); g.fillCircle(-18, -12, 6); g.fillCircle(18, -12, 6);
      this.klantGezicht(c, 0, 4, 0.85);
    }
  }

  klantGezicht(c, x, y, s) {
    c.add(this.add.circle(x - 7 * s, y - 3 * s, 3.5 * s, INKT));
    c.add(this.add.circle(x + 7 * s, y - 3 * s, 3.5 * s, INKT));
    const m = this.add.graphics(); m.lineStyle(2, INKT, 1);
    m.beginPath(); m.arc(x, y + 4 * s, 5 * s, 0.2, Math.PI - 0.2); m.strokePath();
    c.add(m);
    c.add(this.add.circle(x - 13 * s, y + 3 * s, 3 * s, 0xf9a8d4, 0.6));
    c.add(this.add.circle(x + 13 * s, y + 3 * s, 3 * s, 0xf9a8d4, 0.6));
  }

  buildKaart() {
    const { width } = this.scale;
    const c = this.add.container(width / 2, 118).setDepth(30);
    this.kaartC = c;
    this.kaartRefs = { druppel: {}, tik: {} };

    const bg = this.add.graphics();
    bg.fillStyle(0xf4e2b8, 0.98); bg.fillRoundedRect(-width / 2 + 18, -46, width - 36, 96, 14);
    bg.lineStyle(3, 0xc9a76a, 1); bg.strokeRoundedRect(-width / 2 + 18, -46, width - 36, 96, 14);
    c.add(bg);
    c.add(this.add.text(0, -34, this.recept.naam, { fontFamily: 'Arial Black, Arial', fontSize: '15px', fontStyle: 'bold', color: '#7c4a1e' }).setOrigin(0.5));

    // stap-chips met STIPJES (○/●) — tellen wat je ziet, geen breuk lezen
    const chips = [];
    this.recept.druppels.forEach((d) => chips.push({ key: 'd_' + d.kleur, kleur: d.kleur, nodig: d.aantal }));
    chips.push({ key: 'sterren', icon: '⭐', nodig: this.recept.sterren });
    chips.push({ key: 'roer', icon: '🥄', nodig: this.recept.roer });
    this.kaartRefs.pips = {};
    const chipW = (width - 60) / chips.length;
    chips.forEach((ch, i) => {
      const cx = -width / 2 + 30 + chipW * i + chipW / 2, y = -6;
      if (ch.kleur) c.add(this.add.circle(cx - 26, y, 7, KLEUREN[ch.kleur]).setStrokeStyle(1.5, 0x00000066));
      else c.add(this.add.text(cx - 30, y, ch.icon, { fontSize: '15px' }).setOrigin(0.5));
      const pips = [];
      for (let k = 0; k < ch.nodig; k++) {
        const pip = this.add.circle(cx - 6 + k * 13, y, 4.5, 0xe4d3ad).setStrokeStyle(1.5, 0xb08a4a);
        c.add(pip); pips.push(pip);
      }
      this.kaartRefs.pips[ch.key] = pips;
    });

    // woord-slots — het toverwoord staat LICHTGRIJS voorgedrukt (om te kopiëren)
    const woord = this.recept.woord;
    this.kaartRefs.woordSlots = [];
    const slotW = 26, totW = woord.length * (slotW + 4);
    woord.split('').forEach((ch, i) => {
      const sx = -totW / 2 + i * (slotW + 4) + slotW / 2;
      const box = this.add.graphics();
      box.fillStyle(0xffffff, 0.8); box.fillRoundedRect(sx - slotW / 2, 20, slotW, 24, 5);
      box.lineStyle(1.5, 0xc9a76a, 1); box.strokeRoundedRect(sx - slotW / 2, 20, slotW, 24, 5);
      c.add(box);
      const t = this.add.text(sx, 32, ch, { fontFamily: 'Arial Black, Arial', fontSize: '16px', fontStyle: 'bold', color: '#d8c19a' }).setOrigin(0.5);
      c.add(t);
      this.kaartRefs.woordSlots.push(t);
    });
    this.updateKaart();
  }

  updateKaart() {
    const vul = (key, aantal, teveel) => {
      const pips = this.kaartRefs.pips[key]; if (!pips) return;
      pips.forEach((p, i) => p.setFillStyle(teveel ? 0xc0392b : (i < aantal ? 0x57b947 : 0xe4d3ad)));
    };
    this.recept.druppels.forEach((d) => vul('d_' + d.kleur, this.staat.druppels[d.kleur] || 0, (this.staat.druppels[d.kleur] || 0) > d.aantal));
    vul('sterren', this.staat.sterren);
    vul('roer', this.staat.roer);
    this.kaartRefs.woordSlots.forEach((t, i) => t.setColor(i < this.staat.gespeld ? '#2e6b1e' : '#d8c19a'));
  }

  // ------------------------------------------------------ de speeltjes
  // SPEELGOED-PASS: geen knoppen meer — alles is een echte handeling.
  // Flesjes SLEEP je boven de ketel (kantelen = druppelen, zelf stoppen!),
  // sterretjes VANG je uit de lucht, roeren doe je door échte rondjes te
  // tekenen in de ketel, en de letters PRIK je uit opstijgende bellen.

  buildFlesjes() {
    const { width } = this.scale;
    const c = this.add.container(0, 0).setDepth(32);
    this.flessenC = c;
    this.flesjes = {};
    const kleuren = this.recept.druppels.map((d) => d.kleur);
    const totW = kleuren.length * 86;
    // een tafeltje/plank onderin waar de flesjes op staan
    const tafelY = 648;
    const tafel = this.add.graphics();
    tafel.fillStyle(0x3a2416, 1); tafel.fillRoundedRect(width / 2 - totW / 2 - 20, tafelY, totW + 40, 12, 6);
    tafel.fillStyle(0x5a3a22, 1); tafel.fillRoundedRect(width / 2 - totW / 2 - 20, tafelY, totW + 40, 4, 2);
    c.add(tafel);
    kleuren.forEach((kleur, i) => {
      const fx = width / 2 - totW / 2 + 86 * i + 43;
      const fles = this.maakFlesje(fx, tafelY - 26, kleur);
      c.add(fles);
      this.flesjes[kleur] = fles;
    });
  }

  maakFlesje(x, y, kleur) {
    const c = this.add.container(x, y);
    const hex = KLEUREN[kleur];
    const g = this.add.graphics();
    // gloed + fles met drank + kurk
    const gloed = this.add.ellipse(0, 4, 62, 70, hex, 0.22);
    c.add(gloed);
    g.fillStyle(0xffffff, 0.25); g.fillRoundedRect(-16, -18, 32, 46, 9);
    g.fillStyle(hex, 0.95); g.fillRoundedRect(-16, -4, 32, 32, 9);
    g.lineStyle(2.5, 0x4a3520, 1); g.strokeRoundedRect(-16, -18, 32, 46, 9);
    g.fillStyle(0xffffff, 0.35); g.fillRoundedRect(-11, -12, 6, 32, 3);
    g.fillStyle(0xa97142, 1); g.fillRoundedRect(-6, -30, 12, 14, 4);
    c.add(g);
    c.setSize(64, 84).setInteractive({ useHandCursor: true, draggable: true });
    c.thuis = { x, y };
    c.kleur = kleur;
    c.gloed = gloed;

    c.on('dragstart', () => {
      if (this.bezig) return;
      this._sleepFles = c;
      this._druppelTot = 0; // eerste druppel komt meteen zodra je kantelt
      this.flessenC.bringToTop(c);
      this.tweens.add({ targets: c, scale: 1.15, duration: 120 });
      SFX.pick();
    });
    c.on('drag', (pointer, dragX, dragY) => {
      if (this.bezig) return;
      c.setPosition(dragX, dragY);
      // boven de ketel? → kantelen (schenken); anders rechtop
      const boven = Math.abs(dragX - KETEL_X) < 85 && dragY > 300 && dragY < KETEL_Y - 30;
      const doelHoek = boven ? 118 : 0;
      if (Math.abs(c.angle - doelHoek) > 4) c.setAngle(Phaser.Math.Linear(c.angle, doelHoek, 0.25));
      c.schenkt = boven;
    });
    c.on('dragend', () => {
      this._sleepFles = null;
      c.schenkt = false;
      this.tweens.add({ targets: c, x: c.thuis.x, y: c.thuis.y, angle: 0, scale: 1, duration: 320, ease: 'Back.easeOut' });
    });
    return c;
  }

  buildSterretjes() {
    this.sterretjes = [];
    for (let i = 0; i < this.recept.sterren; i++) {
      const sx = Phaser.Math.Between(70, 410), sy = Phaser.Math.Between(300, 420);
      const c = this.add.container(sx, sy).setDepth(34);
      const gloed = this.add.circle(0, 0, 17, 0xfff2a8, 0.25);
      const ster = this.add.image(0, 0, 'star').setScale(1.5).setTint(0xffe16b);
      c.add([gloed, ster]);
      this.tweens.add({ targets: ster, angle: { from: -12, to: 12 }, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.tweens.add({ targets: gloed, alpha: 0.5, scale: 1.25, duration: 600, yoyo: true, repeat: -1 });
      c.setSize(52, 52).setInteractive({ useHandCursor: true });
      c.on('pointerdown', () => this.vangSter(c));
      this.sterretjes.push(c);
      this.fladder(c);
    }
  }

  // laat een sterretje vrolijk rondfladderen (steeds een nieuw doel)
  fladder(c) {
    if (!c.active) return;
    const nx = Phaser.Math.Between(60, 420), ny = Phaser.Math.Between(290, 440);
    c.vlucht = this.tweens.add({
      targets: c, x: nx, y: ny, duration: Phaser.Math.Between(1300, 2100), ease: 'Sine.inOut',
      onComplete: () => this.fladder(c),
    });
  }

  vangSter(c) {
    if (this.bezig || c.gevangen) return;
    c.gevangen = true;
    if (c.vlucht) c.vlucht.stop();
    SFX.giggle ? SFX.giggle() : SFX.sparkle();
    // giechelend de ketel in!
    this.tweens.add({
      targets: c, x: KETEL_X, y: KETEL_Y - 26, scale: 0.3, angle: 300, duration: 420, ease: 'Quad.easeIn',
      onComplete: () => { c.destroy(); this.plons(0xfff2a8); this.addSter(); },
    });
    this.sterretjes = this.sterretjes.filter((s2) => s2 !== c);
  }

  // ---- letter-bellen: het toverwoord borrelt uit de ketel omhoog ----
  startBellen() {
    this.bellen = [];
    this.belTimer = this.time.addEvent({ delay: 1050, loop: true, callback: () => this.spawnBel() });
  }

  spawnBel() {
    if (this.bezig) return;
    const st = brouwStatus(this.recept, this.staat);
    if (st.woordOk) return;
    if (this.bellen.length >= 4) return;
    // welke letter? Vaak de VOLGENDE die nodig is; soms een andere uit het woord
    const nodig = this.recept.woord[this.staat.gespeld];
    const heeftNodig = this.bellen.some((b) => b.letter === nodig);
    const letter = (!heeftNodig || Math.random() < 0.45)
      ? nodig
      : Phaser.Utils.Array.GetRandom(this.recept.woord.split('').filter((l) => l !== nodig)) || nodig;

    const bx = KETEL_X + Phaser.Math.Between(-58, 58);
    const c = this.add.container(bx, KETEL_Y - 34).setDepth(36).setScale(0.3);
    const bel = this.add.circle(0, 0, 24, 0xbfe9ff, 0.30).setStrokeStyle(2.5, 0xdff4ff, 0.9);
    const glans = this.add.ellipse(-8, -9, 10, 6, 0xffffff, 0.7);
    const t = this.add.text(0, 0, letter, { fontFamily: 'Arial Black, Arial', fontSize: '21px', fontStyle: 'bold', color: '#ffffff', stroke: '#3a5a7a', strokeThickness: 4 }).setOrigin(0.5);
    c.add([bel, glans, t]);
    c.letter = letter;
    c.setSize(56, 56).setInteractive({ useHandCursor: true });
    c.on('pointerdown', () => this.prikBel(c));
    this.bellen.push(c);
    this.tweens.add({ targets: c, scale: 1, duration: 260, ease: 'Back.easeOut' });
    // opstijgen met een zwier; bovenaan zachtjes uit elkaar
    this.tweens.add({
      targets: c, y: 165, x: bx + Phaser.Math.Between(-34, 34), duration: Phaser.Math.Between(4200, 5400), ease: 'Sine.easeOut',
      onComplete: () => { if (c.active) this.popBel(c, false); },
    });
  }

  popBel(c, geluid = true) {
    this.bellen = this.bellen.filter((b) => b !== c);
    if (geluid) SFX.pop();
    const ring = this.add.circle(c.x, c.y, 12, 0xffffff, 0).setStrokeStyle(3, 0xdff4ff, 0.9).setDepth(36);
    this.tweens.add({ targets: ring, scale: 2.2, alpha: 0, duration: 260, onComplete: () => ring.destroy() });
    c.destroy();
  }

  prikBel(c) {
    if (this.bezig || !c.active) return;
    if (c.letter === this.recept.woord[this.staat.gespeld]) {
      // GOED: de letter zweeft naar zijn plekje op de kaart
      const slot = this.kaartRefs.woordSlots[this.staat.gespeld];
      this.staat.gespeld++;
      const doelX = this.kaartC.x + slot.x, doelY = this.kaartC.y + slot.y;
      const vlieg = this.add.text(c.x, c.y, c.letter, { fontFamily: 'Arial Black, Arial', fontSize: '21px', fontStyle: 'bold', color: '#ffffff', stroke: '#2e6b1e', strokeThickness: 4 }).setOrigin(0.5).setDepth(50);
      this.popBel(c, false);
      SFX.coin();
      this.tweens.add({
        targets: vlieg, x: doelX, y: doelY, scale: 0.8, duration: 380, ease: 'Quad.easeIn',
        onComplete: () => { vlieg.destroy(); this.updateKaart(); this.tweens.add({ targets: slot, scale: 1.4, duration: 130, yoyo: true }); },
      });
      this.updateKaart();
      this.naActie();
    } else {
      // fout prikje = gewoon een grappige plop, geen straf
      this.popBel(c);
      Voice.cue('laugh');
    }
  }

  // ------------------------------------------------------ acties

  dropArray() {
    const arr = [];
    Object.entries(this.staat.druppels).forEach(([k, n]) => { for (let i = 0; i < n; i++) arr.push(k); });
    return arr;
  }

  setKetelKleur(kleurNaam) {
    const hex = KLEUREN[kleurNaam] || KLEUREN.leeg;
    this.liquid.setFillStyle(hex);
    this.ketelGloed.setFillStyle(hex);
    if (this.liquidGlow) this.liquidGlow.color = kleurNaam === 'leeg' ? 0xffffff : hex;
    if (this.ketelHalo) this.ketelHalo.setFillStyle(kleurNaam === 'leeg' ? 0xffb46e : hex);
  }

  // Eén druppel uit een gekanteld flesje. GEEN plafond meer: te veel gieten
  // kan echt — dan borrelt er bruin schuim op en moet de schuimspaan eraan
  // te pas komen (tellen-met-gevolg: zelf op tijd stoppen!).
  addDruppel(kleur, bronX, bronY) {
    const nodig = (this.recept.druppels.find((d) => d.kleur === kleur) || {}).aantal || 0;
    if ((this.staat.druppels[kleur] || 0) >= nodig + 1) return; // max één te veel
    const uniekVoor = new Set(this.dropArray()).size;
    this.staat.druppels[kleur] = (this.staat.druppels[kleur] || 0) + 1;
    // druppel valt uit de fles-hals in de ketel
    const sx = bronX != null ? bronX : KETEL_X + Phaser.Math.Between(-30, 30);
    const sy = bronY != null ? bronY : 380;
    const drop = this.add.circle(sx, sy, 8, KLEUREN[kleur]).setDepth(12);
    this.tweens.add({ targets: drop, x: KETEL_X + Phaser.Math.Between(-20, 20), y: KETEL_Y - 20, duration: 300, ease: 'Quad.easeIn', onComplete: () => { drop.destroy(); this.plons(KLEUREN[kleur]); } });
    SFX.pick();
    const arr = this.dropArray();
    const kleurNaam = ketelKleur(arr);
    this.setKetelKleur(kleurNaam);
    // KLEURMENG-FEESTJE: net twee kleuren → een nieuwe kleur ontstaat!
    if (new Set(arr).size === 2 && uniekVoor === 1) this.mixFeest(kleurNaam);
    if ((this.staat.druppels[kleur] || 0) > nodig) this.schuimAlarm();
    this.updateKaart();
    this.naActie();
  }

  // Zit er ergens één druppel te veel in?
  overschot() {
    return this.recept.druppels.find((d) => (this.staat.druppels[d.kleur] || 0) > d.aantal) || null;
  }

  // TE VEEL! De ketel boert bruin schuim — vis er eentje uit met de spaan.
  schuimAlarm() {
    SFX.oops(); Voice.cue('oops');
    this.nulReactie('spannend');
    this.cameras.main.shake(120, 0.004);
    if (!this.schuimLaag) {
      const s = this.add.graphics().setDepth(11);
      s.fillStyle(0x8a6a4a, 0.9);
      for (let i = 0; i < 12; i++) s.fillCircle(KETEL_X + Phaser.Math.Between(-58, 58), KETEL_Y - 24 + Phaser.Math.Between(-6, 6), Phaser.Math.Between(6, 12));
      this.schuimLaag = s;
      this.tweens.add({ targets: s, y: -4, duration: 500, yoyo: true, repeat: -1 });
    }
    if (!this.schuimspaan) {
      const c = this.add.container(KETEL_X + 118, KETEL_Y - 60).setDepth(38).setScale(0.3);
      const g = this.add.graphics();
      g.fillStyle(0x8a8f96, 1); g.fillRoundedRect(-4, -34, 8, 44, 4);      // steel
      g.fillStyle(0xb9bfc6, 1); g.fillEllipse(0, 18, 34, 22);              // schep
      g.fillStyle(0x6c7178, 1);
      [[-6, 14], [6, 14], [0, 22]].forEach(([hx, hy]) => g.fillCircle(hx, hy, 2.4)); // gaatjes
      c.add(g);
      c.setSize(48, 66).setInteractive({ useHandCursor: true });
      c.on('pointerdown', () => this.schepEruit());
      this.schuimspaan = c;
      this.tweens.add({ targets: c, scale: 1, duration: 300, ease: 'Back.easeOut' });
    }
  }

  // De schuimspaan vist één druppel te veel uit de ketel — flts!
  schepEruit() {
    if (this.bezig || !this.schuimspaan) return;
    const over = this.overschot();
    if (!over) return;
    this.staat.druppels[over.kleur] -= 1;
    SFX.split();
    // schep-beweging + het uitgeviste drupje vliegt weg
    this.tweens.add({ targets: this.schuimspaan, x: KETEL_X + 30, y: KETEL_Y - 34, angle: -34, duration: 220, yoyo: true, onComplete: () => this.schuimspaan && this.schuimspaan.setAngle(0) });
    const blob = this.add.circle(KETEL_X + 20, KETEL_Y - 30, 9, KLEUREN[over.kleur]).setDepth(40);
    this.tweens.add({ targets: blob, x: KETEL_X + 150, y: KETEL_Y + 60, angle: 240, alpha: 0, duration: 550, ease: 'Quad.easeOut', onComplete: () => blob.destroy() });
    Voice.cue('laugh');
    this.setKetelKleur(ketelKleur(this.dropArray()));
    if (!this.overschot()) {
      // schuim lost op, spaan gaat weer weg
      if (this.schuimLaag) { const sl = this.schuimLaag; this.schuimLaag = null; this.tweens.add({ targets: sl, alpha: 0, duration: 400, onComplete: () => sl.destroy() }); }
      const sp = this.schuimspaan; this.schuimspaan = null;
      this.tweens.add({ targets: sp, scale: 0.2, alpha: 0, duration: 300, onComplete: () => sp.destroy() });
      this.nulReactie('blij');
    }
    this.updateKaart();
    this.naActie();
  }

  addSter() {
    if (this.staat.sterren >= this.recept.sterren) return;
    this.staat.sterren++;
    const st = this.add.image(KETEL_X + Phaser.Math.Between(-24, 24), 580, 'star').setScale(1.4).setTint(0xfff2a8).setDepth(12);
    this.tweens.add({ targets: st, y: KETEL_Y - 22, scale: 0.4, angle: 240, duration: 300, ease: 'Quad.easeIn', onComplete: () => { st.destroy(); this.plons(0xfff2a8); } });
    SFX.sparkle();
    this.updateKaart();
    this.naActie();
  }

  addRoer() {
    if (this.staat.roer >= this.recept.roer) return;
    this.staat.roer++;
    this.borrels.forEach((b) => b.setVisible(true));
    this.tweens.add({ targets: this.liquid, scaleX: 1.08, duration: 120, yoyo: true });
    SFX.combine ? SFX.combine(2) : SFX.pick();
    this.plons(0xffffff);
    this.updateKaart();
    this.naActie();
  }

  // ---- ECHT ROEREN: teken rondjes in de ketel ----
  // pointermove terwijl de vinger in de ketel-zone is: we sommeren de
  // draaihoek rond het midden; elk vol rondje = één keer geroerd.
  roerBeweging(pointer) {
    if (this.bezig || this._sleepFles || !pointer.isDown || !this.staat) return;
    const dx = pointer.x - KETEL_X, dy = pointer.y - (KETEL_Y - 20);
    const inKetel = Math.abs(dx) < 100 && Math.abs(dy) < 75;
    if (!inKetel) { this._roerVorig = null; if (this.lepel) this.lepel.setVisible(false); return; }
    const hoek = Math.atan2(dy, dx);
    // de lepel volgt je vinger langs de rand
    if (this.lepel) {
      this.lepel.setVisible(true).setPosition(KETEL_X + Math.cos(hoek) * 52, KETEL_Y - 26 + Math.sin(hoek) * 14);
    }
    if (this._roerVorig != null) {
      let d = hoek - this._roerVorig;
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      this._roerTotaal += Math.abs(d);
      // draaikolk draait mee terwijl je roert
      if (this.draaikolk) {
        this.draaikolk.setVisible(true).setAlpha(Math.min(0.5, this.draaikolk.alpha + 0.02));
        this.draaikolk.rotation += d * 1.4;
      }
      if (this._roerTotaal >= Math.PI * 2) {
        this._roerTotaal -= Math.PI * 2;
        this.addRoer();
      }
    }
    this._roerVorig = hoek;
  }

  plons(kleur) {
    const p = this.add.particles(KETEL_X, KETEL_Y - 20, 'star', { speed: { min: 30, max: 90 }, scale: { start: 0.7, end: 0 }, lifespan: 300, quantity: 4, tint: kleur, blendMode: 'ADD' }).setDepth(12);
    this.time.delayedCall(300, () => p.destroy());
  }

  // Na elke handeling: Nul juicht bij een net-afgeronde stap, en de volgende
  // stap gaat pulseren zodat een niet-lezer weet wat te doen.
  naActie() {
    const st = brouwStatus(this.recept, this.staat);
    const v = this._vorigStatus || {};
    const netKlaar = (st.druppelsOk && !v.druppelsOk) || (st.sterrenOk && !v.sterrenOk) || (st.roerOk && !v.roerOk) || (st.woordOk && !v.woordOk);
    if (netKlaar && !st.klaar) this.nulReactie('blij');
    this._vorigStatus = st;
    this.updateHint();
    this.checkKlaar();
  }

  // Laat het volgende SPEELTJE pulseren + het wijs-handje wijst (en volgt
  // bewegende doelen via update()): flesje → sterretje → ketel → letter-bel.
  updateHint() {
    (this._puls || []).forEach((t) => t.stop());
    (this._pulsDoelen || []).forEach((o) => o && o.setScale && o.setScale(1));
    this._puls = []; this._pulsDoelen = [];
    this._wijzerDoel = null;
    if (this._wijzer) this._wijzer.setVisible(false);
    if (this._roerHint) this._roerHint.setVisible(false);
    if (this.bezig || !this.flesjes) return;

    // te veel gegoten? → alles wijst naar de schuimspaan
    if (this.overschot() && this.schuimspaan) {
      this._wijzerDoel = this.schuimspaan;
      this._puls.push(this.tweens.add({ targets: this.schuimspaan, scale: 1.15, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.inOut' }));
      this._pulsDoelen.push(this.schuimspaan);
      this._wijzer.setVisible(true).setPosition(this.schuimspaan.x, this.schuimspaan.y - 46);
      return;
    }

    const st = brouwStatus(this.recept, this.staat);
    if (!st.druppelsOk) {
      // pulse de flesjes waarvan nog druppels nodig zijn
      const doelen = [];
      this.recept.druppels.forEach((d) => {
        if ((this.staat.druppels[d.kleur] || 0) < d.aantal && this.flesjes[d.kleur] && this.flesjes[d.kleur] !== this._sleepFles) doelen.push(this.flesjes[d.kleur]);
      });
      doelen.forEach((o) => { this._puls.push(this.tweens.add({ targets: o, scale: 1.12, duration: 480, yoyo: true, repeat: -1, ease: 'Sine.inOut' })); this._pulsDoelen.push(o); });
      if (doelen.length) { this._wijzerDoel = doelen[0]; this._wijzer.setVisible(true).setPosition(doelen[0].x, doelen[0].y - 52); }
    } else if (!st.sterrenOk) {
      // wijs (en volg!) een fladderend sterretje
      const ster = (this.sterretjes || [])[0];
      if (ster) { this._wijzerDoel = ster; this._wijzer.setVisible(true).setPosition(ster.x, ster.y - 46); }
    } else if (!st.roerOk) {
      // roeren: hint boven de ketel
      if (!this._roerHint) {
        this._roerHint = this.add.text(KETEL_X, KETEL_Y - 92, '🥄 roer rondjes!', {
          fontFamily: 'Arial Black, Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffe16b', stroke: '#4a2a10', strokeThickness: 5,
        }).setOrigin(0.5).setDepth(45);
        this.tweens.add({ targets: this._roerHint, y: this._roerHint.y - 6, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      }
      this._roerHint.setVisible(true);
      this._wijzer.setVisible(true).setPosition(KETEL_X, KETEL_Y - 56);
    } else if (!st.woordOk) {
      // wijs de bel met de juiste letter aan (zodra die er is)
      const next = this.recept.woord[this.staat.gespeld];
      const bel = (this.bellen || []).find((b) => b.active && b.letter === next);
      if (bel) { this._wijzerDoel = bel; this._wijzer.setVisible(true).setPosition(bel.x, bel.y - 46); }
    }
  }

  // Nul komt tot leven — reageert op alles (het emotionele kompas).
  nulReactie(kind) {
    const n = this.nulHelper; if (!n) return;
    if (kind === 'spannend') {
      this.tweens.add({ targets: n, scaleX: 0.84, scaleY: 0.9, duration: 260, yoyo: true, hold: 180 });
      return;
    }
    const groot = kind === 'juich';
    this.tweens.add({ targets: n, y: this._nulY - (groot ? 24 : 12), duration: 170, yoyo: true, repeat: groot ? 1 : 0, ease: 'Quad.easeOut', onComplete: () => n.setY(this._nulY) });
    if (n.arm) this.tweens.add({ targets: n.arm, angle: { from: -6, to: groot ? 34 : 22 }, duration: 150, yoyo: true, repeat: groot ? 2 : 0, onComplete: () => n.arm.setAngle(0) });
    if (kind !== 'blij') {
      const e = this.add.text(n.x, this._nulY - 40, groot ? '🎉' : '✨', { fontSize: groot ? '24px' : '18px' }).setOrigin(0.5).setDepth(30);
      this.tweens.add({ targets: e, y: e.y - 26, alpha: 0, duration: 850, onComplete: () => e.destroy() });
    }
    if (kind === 'wow') Voice.cue('star');
    if (kind === 'juich') Voice.cue('cheer');
  }

  // Het kleurmeng-feestje: twee kleuren worden een nieuwe — vier het!
  mixFeest(kleurNaam) {
    const namen = { groen: 'GROEN!', paars: 'PAARS!', oranje: 'ORANJE!', bruin: 'oei, modder…' };
    const hex = KLEUREN[kleurNaam] || 0xffffff;
    const label = this.add.text(KETEL_X, KETEL_Y - 66, namen[kleurNaam] || '', {
      fontFamily: 'Arial Black, Arial', fontSize: '26px', fontStyle: 'bold',
      color: '#' + hex.toString(16).padStart(6, '0'), stroke: '#ffffff', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(50).setScale(0.3);
    this.tweens.add({
      targets: label, scale: 1.1, duration: 220, ease: 'Back.easeOut',
      onComplete: () => this.tweens.add({ targets: label, y: label.y - 28, alpha: 0, duration: 600, delay: 450, onComplete: () => label.destroy() }),
    });
    this.plons(hex);
    SFX.sparkle();
    this.nulReactie('wow');
  }

  // ------------------------------------------------------ het wonder

  checkKlaar() {
    if (this.bezig) return;
    if (this.overschot()) return; // eerst het te-veel eruit vissen!
    if (brouwStatus(this.recept, this.staat).klaar) this.brouwKlaar();
  }

  brouwKlaar() {
    this.bezig = true;
    this.updateHint(); // pulsen + wijzer weg
    [...(this.bellen || [])].forEach((b) => this.popBel(b, false)); // restjes bellen weg
    if (this.klantC && this.klantC.wolkje) this.klantC.wolkje.destroy();
    this.nulReactie('spannend'); // Nul houdt z'n adem in…

    // opbouw: ketel gloeit, trilt en zwelt (anticipatie vóór de knal)
    this.setKetelKleur(this.recept.doelkleur);
    this.tweens.add({ targets: this.ketelGloed, alpha: 0.55, scale: 1.35, duration: 300, yoyo: true, repeat: 1 });
    this.tweens.add({ targets: this.liquid, x: KETEL_X + 2, duration: 40, yoyo: true, repeat: 8 });
    this.tweens.add({
      targets: this.liquid, scaleX: 1.18, scaleY: 1.35, duration: 480, ease: 'Sine.inOut',
      onComplete: () => { this.liquid.setX(KETEL_X); this.poef(); },
    });
  }

  poef() {
    // POEF! grote uitbarsting + camera-tik + Nul juicht
    SFX.fanfare(); this.nulReactie('juich');
    this.cameras.main.shake(180, 0.006);
    this.cameras.main.flash(200, 255, 245, 210);
    const kleur = KLEUREN[this.recept.doelkleur];
    // schokgolf-ringen + een grote kleur-flits
    for (let i = 0; i < 3; i++) {
      const ring = this.add.circle(KETEL_X, KETEL_Y - 20, 20, 0xffffff, 0).setStrokeStyle(6, 0xffe9b0, 0.9).setDepth(59).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: ring, scale: 8, alpha: 0, duration: 720, delay: i * 110, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
    }
    const burst = this.add.circle(KETEL_X, KETEL_Y - 20, 30, kleur, 0.85).setDepth(58).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: burst, scale: 6, alpha: 0, duration: 520, ease: 'Quad.easeOut', onComplete: () => burst.destroy() });
    const p = this.add.particles(KETEL_X, KETEL_Y - 26, 'star', {
      speed: { min: 120, max: 320 }, angle: { min: 250, max: 290 },
      scale: { start: 1.8, end: 0 }, lifespan: 900, quantity: 40,
      tint: [kleur, 0xfff2a8, 0xffffff], blendMode: 'ADD',
    }).setDepth(60);
    this.time.delayedCall(900, () => p.destroy());
    this.tweens.add({ targets: this.liquid, scale: 1, duration: 300 });

    const poef = this.add.text(KETEL_X, KETEL_Y - 90, 'POEF! ✨', {
      fontFamily: 'Arial Black, Arial', fontSize: '34px', fontStyle: 'bold', color: '#fff2a8', stroke: '#7c4a1e', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(61).setScale(0.3);
    this.tweens.add({ targets: poef, scale: 1.1, duration: 260, ease: 'Back.easeOut', onComplete: () => this.tweens.add({ targets: poef, y: poef.y - 40, alpha: 0, duration: 700, delay: 400, onComplete: () => poef.destroy() }) });

    this.time.delayedCall(500, () => this.klantTransform());
  }

  klantTransform() {
    const c = this.klantC, kind = this.recept.klant;
    // het drankje "vliegt" naar de klant
    const fles = this.add.circle(KETEL_X, KETEL_Y - 20, 12, KLEUREN[this.recept.doelkleur]).setDepth(40).setStrokeStyle(2, 0xffffff);
    this.tweens.add({
      targets: fles, x: KLANT_X, y: KLANT_Y, duration: 400, ease: 'Quad.easeIn',
      onComplete: () => {
        fles.destroy();
        this.wonderEffect(c, kind);
      },
    });
  }

  wonderEffect(c, kind) {
    // blije stuiter voor iedereen
    this.tweens.add({ targets: c, y: KLANT_Y - 18, duration: 200, yoyo: true, repeat: 1, ease: 'Quad.easeOut' });
    const hart = this.add.text(KLANT_X, KLANT_Y - 44, '💛', { fontSize: '26px' }).setOrigin(0.5).setDepth(41);
    this.tweens.add({ targets: hart, y: KLANT_Y - 84, alpha: 0, duration: 1000, onComplete: () => hart.destroy() });

    if (kind === 'bloem') {
      this.tweens.add({ targets: c, scale: 1.4, duration: 500, ease: 'Back.easeOut' });
      this.bloemBurst(KLANT_X, KLANT_Y);
    } else if (kind === 'mol') {
      const gloed = this.add.circle(KLANT_X, KLANT_Y, 44, 0xfff2a8, 0.0).setDepth(14);
      this.tweens.add({ targets: gloed, fillAlpha: 0.55, scale: 1.2, duration: 500, yoyo: true, hold: 400, onComplete: () => gloed.destroy() });
    } else if (kind === 'egel') {
      ['z', 'z', 'z'].forEach((z, i) => {
        const zt = this.add.text(KLANT_X + 24 + i * 8, KLANT_Y - 30 - i * 4, 'Z', { fontFamily: 'Arial Black, Arial', fontSize: `${14 + i * 4}px`, color: '#bfe3fb' }).setDepth(41);
        this.tweens.add({ targets: zt, y: zt.y - 30, alpha: 0, duration: 1400, delay: i * 200, onComplete: () => zt.destroy() });
      });
    } else { // muis vliegt weg
      const vleugel = this.add.text(KLANT_X, KLANT_Y - 6, '🪽', { fontSize: '24px' }).setOrigin(0.5).setDepth(14);
      this.tweens.add({ targets: [c, vleugel], y: '-=90', alpha: 0, duration: 1100, ease: 'Sine.easeIn', onComplete: () => vleugel.destroy() });
    }

    // BLOEI: kleur keert terug in de winkel
    this.time.delayedCall(400, () => this.bloei());
    // beloning
    addStars(1);
    const nieuw = markRecept(this.recept.id);
    if (this.eersteOoit) { giveMedal('tover_start'); this.eersteOoit = false; }
    if (nieuw) {
      const n = this.add.text(this.scale.width / 2, 200, '📖 Nieuw recept in je Toverboek!', {
        fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#fff2a8', backgroundColor: '#5a3d28cc', padding: { x: 12, y: 6 },
      }).setOrigin(0.5).setDepth(61);
      this.tweens.add({ targets: n, alpha: 0, y: 180, duration: 900, delay: 900, onComplete: () => n.destroy() });
    }

    // volgende klant
    this.time.delayedCall(1900, () => this.nieuweKlant());
  }

  bloemBurst(x, y) {
    const kleuren = [0xf87171, 0xfbbf24, 0xec6aa9, 0xa78bfa];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const bl = this.add.circle(x, y, 6, kleuren[i % 4]).setDepth(14);
      this.tweens.add({ targets: bl, x: x + Math.cos(a) * 34, y: y + Math.sin(a) * 34, scale: 1.6, alpha: 0, duration: 700, onComplete: () => bl.destroy() });
    }
  }

  // Bij elke gelukte brouw bloeit er een bloemetje op in de grauwe winkel.
  bloei() {
    const { width, height } = this.scale;
    const plekken = [[70, 150], [180, 120], [410, 150], [110, 250], [370, 260], [40, 340], [440, 340]];
    const p = plekken[this.bloeiBloemen.length % plekken.length];
    const jitter = this.bloeiBloemen.length >= plekken.length ? Phaser.Math.Between(-20, 20) : 0;
    const x = p[0] + jitter, y = p[1];
    const kleuren = [0xf87171, 0xfbbf24, 0xec6aa9, 0xa78bfa, 0x4dd0e1];
    const bloem = this.add.container(x, y).setDepth(6).setScale(0);
    const g = this.add.graphics();
    const kl = kleuren[this.bloeiBloemen.length % kleuren.length];
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; g.fillStyle(kl, 1); g.fillCircle(Math.cos(a) * 8, Math.sin(a) * 8, 6); }
    g.fillStyle(0xfde047, 1); g.fillCircle(0, 0, 5);
    bloem.add(g);
    this.bloeiBloemen.push(bloem);
    this.tweens.add({ targets: bloem, scale: 1, duration: 500, ease: 'Back.easeOut' });
    this.tweens.add({ targets: bloem, angle: { from: -6, to: 6 }, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    confettiBurst(this, 60);
    // de winkel wordt een tikje warmer/vrolijker met elke bloei
    if (this.warmte) this.tweens.add({ targets: this.warmte, alpha: Math.min(0.26, this.warmte.alpha + 0.035), duration: 700 });
  }
}
