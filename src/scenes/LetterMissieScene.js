// ===== LETTER-LAND · Wereld 1 — de missie-engine (KERN: woord-magie) =====
// Eén data-gedreven scene voor álle Praatweide-missies (zie letterland/missies.js).
// De Praatweide is grijs en stil (De Grote Stilte). Bij een SPEL-PLEK zie je een
// grijze schim van wat er moet gebeuren + de door de Sisser dooreengegooide
// letters. Zet ze op volgorde (sleep of tik) → de klanken worden NETJES uitgespeld
// → dan klinkt het HELE WOORD → POEF → het woord GEBEURT (de zon smelt het ijs,
// een mat overbrugt de kloof, een bel wekt een vriendje, een bal verplettert een
// rots) en de kleur keert terug. Sommige gewekte letter-vriendjes schenken je hun
// KLANK-KRACHT (bv. de B = Botsbal: super-sprong).
//
// Eigen systeem (niet de getallen-engine); hergebruikt bewezen tech: physics-
// gevoel, klank/woord-clips, cast-art, confetti.

import Phaser from 'phaser';
import { SFX, initAudio } from '../sound.js';
import { Voice } from '../voice.js';
import { stopMusic } from '../music.js';
import { confettiBurst } from '../reward.js';
import { tekenAlfaBlok, tekenPotloodLijf } from '../adventure/letterCast.js';
import { MOVE_SPEED, JUMP_BASE, COYOTE_MS, BUFFER_MS } from '../adventure/constants.js';
import { volgendeVak, woordAf, schud } from '../letterland/woordLogic.js';
import { MISSIES, GROND, KRACHT_NAAM } from '../letterland/missies.js';

const WORLDH = 800;
const STRIP = 240;
const BOTS_JUMP = 985; // super-sprong (Botsbal): apex ≈ 440px → hoge richels haalbaar

export default class LetterMissieScene extends Phaser.Scene {
  constructor() { super('LetterMissie'); }

  create(data) {
    initAudio();
    stopMusic();
    this.missieKey = (data && data.missie) || 'm1';
    this.cfg = MISSIES[this.missieKey] || MISSIES.m1;
    this.worldW = this.cfg.worldW;
    this.powers = { ...(this.cfg.powers || {}) };
    this.obstakels = {};
    this.frozen = false; this.nearSpot = null; this.sterren = 0;
    this.lastSafeX = this.cfg.startX; this.camPan = null; this.pitX0 = null; this.pitX1 = null;

    this.physics.world.setBounds(0, 0, this.worldW, WORLDH);
    this.cameras.main.setBounds(0, 0, this.worldW, WORLDH);

    this.tekenDecor();
    this.bouwWaas();
    this.bouwGrond();
    this.bouwHindernissen();
    this.bouwSpelPlekken();
    this.bouwSpeler();
    this.bouwPriet();
    this.bouwVlag();
    this.bouwBesturing();
    this.bouwHud();

    this.input.on('drag', (p, obj, dx, dy) => { if (obj.getData && obj.getData('tray')) { obj.x = dx; obj.y = dy; } });
    this.input.on('dragend', (p, obj) => { if (obj.getData && obj.getData('tray')) this.probeerPlaatsen(obj); });

    this.cameras.main.centerOn(this.cfg.startX, GROND - 120);
    this.cameras.main.fadeIn(400);
    this.zegPriet(this.cfg.intro, 2000);
    Voice.cue('welcome');
  }

  // ----------------------------------------------------------------- DECOR (grijs)
  tekenDecor() {
    const W = this.worldW;
    const sky = this.add.graphics().setDepth(-10);
    sky.fillGradientStyle(0x9fb8c7, 0x9fb8c7, 0xa9c6a6, 0xa9c6a6, 1); sky.fillRect(0, 0, W, WORLDH);
    const g = this.add.graphics().setDepth(-8);
    g.fillStyle(0x86a880, 1); g.fillRect(0, GROND, W, WORLDH - GROND); g.fillStyle(0x759a6f, 1); g.fillRect(0, GROND, W, 8);
    for (let i = 0; i * 250 < W; i++) { const x = 160 + i * 250, y = 90 + (i % 3) * 40; const c = this.add.graphics().setDepth(-9); c.fillStyle(0xc4d0d6, 0.9); c.fillCircle(x, y, 26); c.fillCircle(x + 26, y + 6, 20); c.fillCircle(x - 24, y + 8, 18); }
    for (let i = 0; i * 300 < W; i++) { const x = 240 + i * 300; const t = this.add.graphics().setDepth(-7); t.fillStyle(0x8a6b52, 1); t.fillRect(x - 6, GROND - 70, 12, 70); t.fillStyle(0x8fae86, 1); t.fillCircle(x, GROND - 84, 34); t.fillCircle(x - 22, GROND - 66, 24); t.fillCircle(x + 22, GROND - 66, 24); }
  }

  bouwWaas() {
    this.waas = [];
    for (let x = 0; x < this.worldW; x += STRIP) this.waas.push(this.add.rectangle(x + STRIP / 2, WORLDH / 2, STRIP, WORLDH, 0x8f9aa0, 0.42).setDepth(-3));
  }

  lichtOp(x0, x1) {
    for (const r of this.waas) { if (r.alpha <= 0.01) continue; if (r.x >= x0 - STRIP / 2 && r.x <= x1 + STRIP / 2) this.tweens.add({ targets: r, alpha: 0, duration: 700, ease: 'Sine.in' }); }
  }

  // ----------------------------------------------------------------- GROND
  bouwGrond() {
    this.grond = this.physics.add.staticGroup();
    (this.cfg.grond || []).forEach(([x, w]) => this.maakGrond(x, w));
    (this.cfg.richels || []).forEach(([x, y, w]) => this.maakRichel(x, y, w));
  }

  maakGrond(x, w) {
    const r = this.add.rectangle(x + w / 2, GROND + 50, w, 100, 0x000000, 0);
    this.physics.add.existing(r, true); this.grond.add(r);
    const g = this.add.graphics().setDepth(-6); g.fillStyle(0x86a880, 1); g.fillRect(x, GROND, w, 100); g.fillStyle(0x9ac091, 1); g.fillRect(x, GROND, w, 7);
  }

  maakRichel(x, y, w) {
    const r = this.add.rectangle(x + w / 2, y + 11, w, 22, 0x000000, 0);
    this.physics.add.existing(r, true); this.grond.add(r);
    const g = this.add.graphics().setDepth(-6); g.fillStyle(0x7d5c46, 1); g.fillRoundedRect(x, y, w, 22, 6); g.fillStyle(0x9ac091, 1); g.fillRect(x, y, w, 6);
  }

  // ----------------------------------------------------------------- HINDERNISSEN
  bouwHindernissen() {
    this.hindernisBodies = [];
    for (const h of (this.cfg.hindernissen || [])) {
      if (h.type === 'ijs') this.maakIjs(h);
      else if (h.type === 'kloof') { this.pitX0 = h.x0; this.pitX1 = h.x1; this.obstakels[h.id] = { ...h }; }
      else if (h.type === 'braam') this.maakBraam(h);
      else if (h.type === 'rots') this.maakRots(h);
      else if (h.type === 'kracht') this.maakKrachtVriend(h);
    }
  }

  maakIjs(h) {
    const art = this.add.container(h.x, GROND - 70).setDepth(5);
    const g = this.add.graphics();
    g.fillStyle(0xbcd2dd, 0.95); g.fillRoundedRect(-26, -70, 52, 140, 10); g.fillStyle(0xe4f1f6, 0.7); g.fillRoundedRect(-18, -60, 14, 120, 6); g.lineStyle(3, 0x8fb0bd, 1); g.strokeRoundedRect(-26, -70, 52, 140, 10);
    art.add(g);
    // volle-hoogte blokkade (net als de getallen-baas): je kúnt er niet
    // overheen springen → een woord spellen is de enige weg vooruit.
    const body = this.hoogBody(h.x, 52); this.hindernisBodies.push(body);
    this.obstakels[h.id] = { ...h, art, body };
  }

  // een onzichtbaar schermhoog blokkade-lijf op x (kun je niet overspringen)
  hoogBody(x, w) {
    const topY = 40, hh = GROND - topY;
    const body = this.add.rectangle(x, topY + hh / 2, w, hh, 0x000000, 0);
    this.physics.add.existing(body, true);
    return body;
  }

  maakBraam(h) {
    const art = this.add.container(h.x, GROND - 55).setDepth(5);
    const g = this.add.graphics(); g.fillStyle(0x6f7a63, 1); for (let i = 0; i < 5; i++) g.fillCircle(-16 + i * 8, -50 + i * 20, 13); g.lineStyle(3, 0x4f5946, 1); g.strokeRoundedRect(-20, -60, 40, 120, 10); art.add(g);
    const body = this.hoogBody(h.x, 44); this.hindernisBodies.push(body);
    const slaper = tekenAlfaBlok(this, h.slaperX, GROND - 31, 'a', 0xf6a723, false).setDepth(6);
    const zzz = this.add.text(h.slaperX + 26, GROND - 74, 'z z z', { fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#8a9199' }).setOrigin(0.5).setDepth(6);
    this.tweens.add({ targets: zzz, y: GROND - 84, alpha: 0.4, duration: 1400, yoyo: true, repeat: -1 });
    this.obstakels[h.id] = { ...h, art, body, slaper, zzz };
  }

  maakRots(h) {
    const art = this.add.container(h.x, GROND - 30).setDepth(5);
    const g = this.add.graphics(); g.fillStyle(0x000000, 0.14); g.fillEllipse(0, 28, 74, 14); g.fillStyle(0x8b8f95, 1); g.fillCircle(0, 0, 34); g.fillStyle(0x7a7e84, 1); g.fillCircle(-11, 9, 20); g.lineStyle(3, 0x5f636a, 1); g.strokeCircle(0, 0, 34); art.add(g);
    // schermhoge blokkade (je kunt er niet overheen; alleen de bal ruimt 'm op)
    const body = this.hoogBody(h.x, 62); this.hindernisBodies.push(body);
    this.obstakels[h.id] = { ...h, art, body };
  }

  maakKrachtVriend(h) {
    // een slapend letter-vriendje op z'n richel; wek 'm (bel) → hij schenkt z'n kracht
    const y = (h.ledgeY != null ? h.ledgeY : GROND - 31) - 1;
    const slaper = tekenAlfaBlok(this, h.x, y - 30, h.letter, 0x3aa0ff, false).setDepth(6);
    const zzz = this.add.text(h.x + 26, y - 74, 'z z z', { fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#8a9199' }).setOrigin(0.5).setDepth(6);
    this.tweens.add({ targets: zzz, y: y - 84, alpha: 0.4, duration: 1400, yoyo: true, repeat: -1 });
    this.obstakels[h.id] = { ...h, slaper, zzz, blokY: y - 30 };
  }

  // ----------------------------------------------------------------- SPEL-PLEKKEN
  bouwSpelPlekken() {
    this.spots = [];
    for (const cfg of (this.cfg.spots || [])) this.maakSpot(cfg);
  }

  maakSpot(cfg) {
    const c = this.add.container(cfg.x, cfg.y).setDepth(6);
    const g = this.add.graphics(); g.fillStyle(0x000000, 0.14); g.fillEllipse(0, 4, 60, 14); g.fillStyle(0x7f8a90, 1); g.fillRoundedRect(-26, -18, 52, 20, 8); c.add(g);
    const schim = this.add.text(0, -58, cfg.schim, { fontSize: '34px' }).setOrigin(0.5).setAlpha(0.55); c.add(schim);
    const dots = this.add.text(0, -26, [...cfg.woord].join(' ').toUpperCase(), { fontFamily: 'Arial Black, Arial', fontSize: '15px', fontStyle: 'bold', color: '#5c666d' }).setOrigin(0.5).setAlpha(0.5); c.add(dots);
    this.tweens.add({ targets: schim, y: -66, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const hint = this.add.container(0, -96).setDepth(16).setVisible(false);
    const hg = this.add.graphics(); hg.fillStyle(0xffffff, 0.96); hg.fillRoundedRect(-58, -18, 116, 34, 10); hg.lineStyle(2, 0x16202b, 1); hg.strokeRoundedRect(-58, -18, 116, 34, 10);
    hint.add([hg, this.add.text(0, -1, 'Tik: spel het! ✍️', { fontFamily: 'Arial Black, Arial', fontSize: '13px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5)]); c.add(hint);
    const spot = { ...cfg, c, schim, dots, hint, solved: false };
    c.setSize(90, 120).setInteractive(new Phaser.Geom.Rectangle(-45, -100, 90, 120), Phaser.Geom.Rectangle.Contains);
    c.on('pointerdown', () => { if (!spot.solved && this.nearSpot === spot && !this.frozen) this.openSpell(spot); });
    this.spots.push(spot);
  }

  // ----------------------------------------------------------------- SPELER
  bouwSpeler() {
    const root = this.add.container(this.cfg.startX, GROND - 40).setDepth(10);
    const art = this.add.container(0, 0); root.add(art);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.16); g.fillEllipse(0, 24, 34, 8);
    g.fillStyle(0x38b6cf, 1); g.fillRoundedRect(-18, -22, 36, 44, 12); g.fillStyle(0xffffff, 0.25); g.fillRoundedRect(-18, -22, 36, 16, 12); g.lineStyle(3, 0x1f7a9e, 1); g.strokeRoundedRect(-18, -22, 36, 44, 12);
    g.fillStyle(0xffffff, 1); g.fillCircle(-6, -4, 6); g.fillCircle(7, -4, 6); g.fillStyle(0x16202b, 1); g.fillCircle(-5, -3, 3); g.fillCircle(8, -3, 3);
    g.lineStyle(2.5, 0x16202b, 1); g.beginPath(); g.arc(1, 6, 6, 0.15 * Math.PI, 0.85 * Math.PI); g.strokePath();
    g.fillStyle(0x1f7a9e, 1); g.fillRoundedRect(-16, 20, 12, 8, 3); g.fillRoundedRect(4, 20, 12, 8, 3);
    art.add(g);
    this.physics.add.existing(root); root.body.setSize(36, 46).setOffset(-18, -24); root.body.setCollideWorldBounds(true);
    root.art = art; this.speler = root;
    this.physics.add.collider(this.speler, this.grond);
    (this.hindernisBodies || []).forEach((b) => this.physics.add.collider(this.speler, b));
    this.jumpsUsed = 0; this.lastGroundAt = 0; this.jumpBufferedAt = -9999;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  bouwPriet() {
    this.priet = this.add.container(this.cfg.startX - 50, GROND - 44).setDepth(9);
    const lijf = this.add.container(0, 0); tekenPotloodLijf(this, lijf); this.priet.add(lijf);
    this.tweens.add({ targets: lijf, angle: 6, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.prietTekst = this.add.text(0, 0, '', { fontFamily: 'Arial Black, Arial', fontSize: '13px', fontStyle: 'bold', color: '#16202b', backgroundColor: '#ffffff', padding: { x: 8, y: 5 } }).setOrigin(0.5).setDepth(17).setVisible(false);
  }

  zegPriet(txt, ms = 1800) { if (!this.prietTekst) return; this.prietTekst.setText(txt).setVisible(true); this.time.delayedCall(ms, () => this.prietTekst && this.prietTekst.setVisible(false)); }

  bouwVlag() {
    this.vlagX = this.cfg.vlagX;
    const c = this.add.container(this.vlagX, GROND).setDepth(6);
    const g = this.add.graphics(); g.fillStyle(0x8a6b52, 1); g.fillRect(-3, -110, 6, 110); g.fillStyle(0xf43f5e, 1); g.fillTriangle(3, -108, 3, -78, 46, -93); c.add([g, this.add.text(26, -60, '🏁', { fontSize: '22px' }).setOrigin(0.5)]);
  }

  bouwBesturing() {
    this.moveDir = 0; this.input.addPointer(3);
    const y = this.scale.height - 60;
    const mk = (x, label, on, off) => {
      const g = this.add.graphics().setScrollFactor(0).setDepth(60); g.fillStyle(0x16202b, 0.34); g.fillCircle(x, y, 38); g.lineStyle(3, 0xffffff, 0.5); g.strokeCircle(x, y, 38);
      const t = this.add.text(x, y, label, { fontFamily: 'Arial', fontSize: '30px', color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(61);
      const hit = this.add.circle(x, y, 42, 0xffffff, 0.001).setScrollFactor(0).setDepth(62).setInteractive({ useHandCursor: true });
      hit.on('pointerdown', on); hit.on('pointerup', off); hit.on('pointerout', off); return { g, t, hit };
    };
    this.btnLeft = mk(56, '◀', () => { this.moveDir = -1; }, () => { if (this.moveDir === -1) this.moveDir = 0; });
    this.btnRight = mk(150, '▶', () => { this.moveDir = 1; }, () => { if (this.moveDir === 1) this.moveDir = 0; });
    this.btnJump = mk(this.scale.width - 56, '⬆', () => { this.jumpBufferedAt = this.time.now; }, () => {});
    const tg = this.add.graphics().setScrollFactor(0).setDepth(60); tg.fillStyle(0x38b6cf, 1); tg.fillCircle(30, 30, 22); tg.lineStyle(3, 0x1f7a9e, 1); tg.strokeCircle(30, 30, 22);
    this.add.text(30, 30, '🏠', { fontSize: '20px' }).setOrigin(0.5).setScrollFactor(0).setDepth(61);
    this.add.circle(30, 30, 24, 0xffffff, 0.001).setScrollFactor(0).setDepth(62).setInteractive({ useHandCursor: true }).on('pointerdown', () => { SFX.click(); stopMusic(); this.scene.start('Menu'); });
  }

  setControlsZichtbaar(v) { [this.btnLeft, this.btnRight, this.btnJump].forEach((b) => { b.g.setVisible(v); b.t.setVisible(v); if (v) b.hit.setInteractive(); else b.hit.disableInteractive(); }); }

  bouwHud() {
    this.hint = this.add.text(this.scale.width / 2, 40, `${this.cfg.naam} — breng het terug tot leven!`, { fontFamily: 'Arial Black, Arial', fontSize: '15px', fontStyle: 'bold', color: '#16202b', backgroundColor: '#ffffffcc', padding: { x: 10, y: 5 } }).setOrigin(0.5).setScrollFactor(0).setDepth(60);
  }

  // ================================================================= SPEL-OVERLAY
  openSpell(spot) {
    if (this.frozen) return;
    this.frozen = true; this.speler.body.setVelocity(0, 0); this.setControlsZichtbaar(false); spot.hint.setVisible(false);
    const woord = spot.woord, W = this.scale.width, H = this.scale.height;
    const ov = this.add.container(0, 0).setScrollFactor(0).setDepth(100);
    ov.add(this.add.rectangle(W / 2, H / 2, W, H, 0x12202a, 0.78).setInteractive());
    ov.add(this.add.text(W / 2, 150, spot.schim, { fontSize: '84px' }).setOrigin(0.5).setAlpha(0.85));
    ov.add(this.add.text(W / 2, 232, 'Zet de letters op volgorde!', { fontFamily: 'Arial Black, Arial', fontSize: '17px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5));
    const slots = new Array(woord.length).fill(null); slots[0] = woord[0];
    const slotCont = []; const sw = 66, tot = woord.length * sw, sx = W / 2 - tot / 2 + sw / 2;
    for (let i = 0; i < woord.length; i++) {
      const c = this.add.container(sx + i * sw, 320);
      const g = this.add.graphics(); g.fillStyle(0xffffff, i === 0 ? 0.9 : 0.14); g.fillRoundedRect(-28, -28, 56, 56, 12); g.lineStyle(3, 0xffffff, 0.85); g.strokeRoundedRect(-28, -28, 56, 56, 12); c.add(g);
      const t = this.add.text(0, 0, i === 0 ? woord[0].toUpperCase() : '', { fontFamily: 'Arial Black, Arial', fontSize: '34px', fontStyle: 'bold', color: i === 0 ? '#16202b' : '#ffffff' }).setOrigin(0.5); c.add(t); c.tekst = t; c.bg = g;
      ov.add(c); slotCont.push(c);
    }
    const rest = schud(woord.slice(1).split('')); const tiles = [];
    const tw = 62, ttot = rest.length * tw, tx = W / 2 - ttot / 2 + tw / 2, ty = 470;
    rest.forEach((letter, i) => {
      const tile = this.add.container(tx + i * tw, ty).setScrollFactor(0);
      const g = this.add.graphics(); g.fillStyle(0xffe16b, 1); g.fillRoundedRect(-26, -26, 52, 52, 12); g.lineStyle(3, 0xcf9f18, 1); g.strokeRoundedRect(-26, -26, 52, 52, 12);
      tile.add([g, this.add.text(0, 0, letter.toUpperCase(), { fontFamily: 'Arial Black, Arial', fontSize: '30px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5)]);
      tile.setSize(56, 56).setInteractive(new Phaser.Geom.Rectangle(-28, -28, 56, 56), Phaser.Geom.Rectangle.Contains); this.input.setDraggable(tile);
      tile.setData('tray', true); tile.setData('letter', letter); tile.setData('hx', tile.x); tile.setData('hy', tile.y);
      ov.add(tile); tiles.push(tile);
    });
    ov.add(this.add.text(W / 2, 540, 'Sleep of tik een letter', { fontFamily: 'Arial', fontSize: '13px', color: '#cfe0ea' }).setOrigin(0.5));
    this.spell = { spot, woord, slots, slotCont, tiles, ov };
    SFX.click();
  }

  probeerPlaatsen(tile) {
    if (!this.spell) return;
    const s = this.spell; const idx = volgendeVak(s.slots, s.woord.length); const letter = tile.getData('letter');
    if (idx >= 0 && letter === s.woord[idx]) {
      s.slots[idx] = letter; tile.setData('tray', false); tile.disableInteractive();
      const slot = s.slotCont[idx];
      this.tweens.add({ targets: tile, x: slot.x, y: slot.y, scale: 0.9, duration: 220, ease: 'Back.out', onComplete: () => tile.setVisible(false) });
      slot.bg.clear(); slot.bg.fillStyle(0xffe16b, 1); slot.bg.fillRoundedRect(-28, -28, 56, 56, 12); slot.bg.lineStyle(3, 0xcf9f18, 1); slot.bg.strokeRoundedRect(-28, -28, 56, 56, 12);
      slot.tekst.setText(letter.toUpperCase()).setColor('#16202b');
      this.tweens.add({ targets: slot, scale: { from: 1.25, to: 1 }, duration: 240, ease: 'Back.out' });
      SFX.place();
      if (woordAf(s.slots, s.woord)) this.blendEnPoef();
    } else {
      SFX.pop();
      this.tweens.add({ targets: tile, x: tile.getData('hx'), y: tile.getData('hy'), duration: 260, ease: 'Back.out' });
      this.tweens.add({ targets: tile, angle: { from: -10, to: 0 }, duration: 220, ease: 'Sine.inOut' });
    }
  }

  blendEnPoef() {
    const s = this.spell; const gap = 260;
    // VISUEEL uitlezen: de vakjes lichten om de beurt op (geen losse letter-
    // stemmen meer — de klank-clips klonken dubbel/vreemd, "zz o nn"). Daarna
    // klinkt het HÉLE WOORD als één schone clip ("Zon!") → POEF.
    [...s.woord].forEach((ch, i) => this.time.delayedCall(140 + i * gap, () => { const c = s.slotCont[i]; if (c) this.tweens.add({ targets: c, scale: { from: 1, to: 1.28 }, yoyo: true, duration: 200, ease: 'Quad.out' }); }));
    const na = 140 + s.woord.length * gap;
    this.time.delayedCall(na, () => { Voice.cue('woord-' + s.woord); this.tweens.add({ targets: s.slotCont, scale: { from: 1, to: 1.18 }, yoyo: true, duration: 260, ease: 'Back.out' }); });
    this.time.delayedCall(na + 560, () => this.poef());
  }

  poef() {
    const s = this.spell; if (!s) return; const spot = s.spot;
    const W = this.scale.width, H = this.scale.height;
    const flits = this.add.rectangle(W / 2, H / 2, W, H, 0xffffff, 0).setScrollFactor(0).setDepth(101);
    this.tweens.add({ targets: flits, alpha: 0.85, yoyo: true, duration: 180, onComplete: () => flits.destroy() });
    SFX.sparkle(); s.ov.destroy(); this.spell = null; this.frozen = false; this.setControlsZichtbaar(true);
    spot.solved = true; spot.dots.setVisible(false); spot.schim.setAlpha(0.15);
    this.manifest(spot);
  }

  // ----------------------------------------------------------------- HET WOORD GEBEURT
  manifest(spot) {
    if (spot.geheim) this.fxGeheim(spot);
    else {
      const obst = this.obstakels[spot.doel];
      const fx = { ijs: () => this.fxIjs(obst), kloof: () => this.fxKloof(obst), braam: () => this.fxBraam(obst), rots: () => this.fxRots(obst), kracht: () => this.fxKracht(obst) };
      (fx[obst && obst.type] || (() => {}))();
    }
    confettiBurst(this, 40); SFX.yay(); Voice.cue('cheer'); this.cameras.main.flash(200, 255, 255, 200);
    this.zegPriet('Kijk! Het woord gebeurt! 🎉', 1800);
  }

  fxIjs(obst) {
    this.panNaar(obst.x, GROND - 150, 1700);
    const zon = this.add.container(obst.x, GROND - 120).setDepth(4).setScale(0);
    const g = this.add.graphics(); g.fillStyle(0xffe16b, 1); g.fillCircle(0, 0, 34);
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.fillTriangle(Math.cos(a) * 34, Math.sin(a) * 34, Math.cos(a - 0.12) * 58, Math.sin(a - 0.12) * 58, Math.cos(a + 0.12) * 58, Math.sin(a + 0.12) * 58); }
    zon.add(g);
    this.tweens.add({ targets: zon, scale: 1, y: GROND - 220, duration: 900, ease: 'Back.out' });
    this.tweens.add({ targets: zon, angle: 40, duration: 6000, repeat: -1 });
    if (obst.art) this.tweens.add({ targets: obst.art, alpha: 0, y: obst.art.y + 30, scaleY: 0.2, duration: 800, delay: 300, onComplete: () => obst.art.destroy() });
    if (obst.body) obst.body.body.enable = false;
    this.lichtOp(obst.x - 300, obst.x + 300);
  }

  fxKloof(obst) {
    this.panNaar((obst.x0 + obst.x1) / 2, GROND - 30, 1800);
    const w = obst.x1 - obst.x0;
    const brug = this.add.rectangle((obst.x0 + obst.x1) / 2, GROND + 8, w, 18, 0x000000, 0); this.physics.add.existing(brug, true); this.grond.add(brug); this.physics.add.collider(this.speler, brug);
    const g = this.add.graphics().setDepth(4); g.fillStyle(0xd98a4e, 1); g.fillRoundedRect(obst.x0, GROND - 4, w, 16, 4); for (let i = 0; i < w; i += 26) { g.lineStyle(2, 0xa9663a, 1); g.strokeRect(obst.x0 + i, GROND - 4, 26, 16); }
    g.setScale(1, 0); this.tweens.add({ targets: g, scaleY: 1, duration: 500, ease: 'Back.out' });
    this.lichtOp(obst.x0 - 120, obst.x1 + 120);
  }

  fxBraam(obst) {
    this.panNaar(obst.x - 30, GROND - 90, 1800);
    const bel = this.add.text(obst.x, GROND - 150, '🔔', { fontSize: '40px' }).setOrigin(0.5).setDepth(7).setScale(0);
    this.tweens.add({ targets: bel, scale: 1, duration: 300, ease: 'Back.out' });
    this.tweens.add({ targets: bel, angle: { from: -18, to: 18 }, yoyo: true, repeat: 5, duration: 120, delay: 300, onComplete: () => this.tweens.add({ targets: bel, alpha: 0, y: bel.y - 20, duration: 500, onComplete: () => bel.destroy() }) });
    if (obst.slaper) { const x = obst.slaper.x, y = obst.slaper.y; obst.slaper.destroy(); obst.zzz && obst.zzz.destroy();
      const wakker = tekenAlfaBlok(this, x, y, 'a', 0xf6a723, true).setDepth(6);
      this.tweens.add({ targets: wakker, x: x - 90, duration: 700, delay: 500, ease: 'Quad.out' });
      this.tweens.add({ targets: wakker, y: y - 20, yoyo: true, repeat: 2, duration: 200, delay: 500 });
    }
    if (obst.body) obst.body.body.enable = false;
    if (obst.art) this.tweens.add({ targets: obst.art, alpha: 0, y: obst.art.y - 40, duration: 700, delay: 500, onComplete: () => obst.art.destroy() });
    this.lichtOp(obst.x - 240, obst.x + 240);
  }

  fxRots(obst) {
    this.panNaar(obst.x, GROND - 40, 1800);
    const bal = this.add.container(obst.x - 200, GROND - 24).setDepth(7);
    const g = this.add.graphics(); g.fillStyle(0xf05a5a, 1); g.fillCircle(0, 0, 20); g.fillStyle(0xffffff, 0.5); g.fillCircle(-6, -6, 6); g.lineStyle(2.5, 0xc23b3b, 1); g.strokeCircle(0, 0, 20); bal.add(g);
    this.tweens.add({ targets: bal, x: obst.x - 34, angle: 720, duration: 620, ease: 'Quad.in', onComplete: () => {
      if (obst.body) obst.body.body.enable = false;
      if (obst.art) this.tweens.add({ targets: obst.art, alpha: 0, scaleY: 0.2, y: obst.art.y + 24, duration: 400 });
      for (let i = 0; i < 8; i++) { const p = this.add.circle(obst.x + Phaser.Math.Between(-20, 20), GROND - 30, Phaser.Math.Between(3, 7), 0x8b8f95, 1).setDepth(8); this.tweens.add({ targets: p, x: p.x + Phaser.Math.Between(-40, 40), y: p.y - Phaser.Math.Between(10, 50), alpha: 0, duration: 500, onComplete: () => p.destroy() }); }
      this.tweens.add({ targets: bal, x: obst.x + 180, angle: 1080, alpha: 0, duration: 600 });
    } });
    this.lichtOp(obst.x - 240, obst.x + 240);
  }

  fxKracht(obst) {
    this.panNaar(obst.x, obst.blokY - 20, 1600);
    if (obst.slaper) { const x = obst.slaper.x, y = obst.slaper.y; obst.slaper.destroy(); obst.zzz && obst.zzz.destroy();
      const wakker = tekenAlfaBlok(this, x, y, obst.letter, 0x3aa0ff, true).setDepth(6);
      this.tweens.add({ targets: wakker, y: y - 16, yoyo: true, repeat: 3, duration: 220 });
    }
    this.time.delayedCall(500, () => this.grantPower(obst.kracht));
    this.lichtOp(obst.x - 240, obst.x + 240);
  }

  fxGeheim(spot) {
    this.panNaar(spot.x, spot.y - 40, 1500);
    const pop = this.add.container(spot.x, spot.y - 52).setDepth(7).setScale(0);
    const g = this.add.graphics(); g.fillStyle(0xff6b9d, 1); g.fillRoundedRect(-15, -26, 30, 46, 12); g.fillStyle(0xffffff, 1); g.fillCircle(-5, -12, 5); g.fillCircle(7, -12, 5); g.fillStyle(0x16202b, 1); g.fillCircle(-4, -11, 2.4); g.fillCircle(8, -11, 2.4); pop.add(g);
    this.tweens.add({ targets: pop, scale: 1, duration: 400, ease: 'Back.out' }); this.tweens.add({ targets: pop, angle: 8, yoyo: true, repeat: -1, duration: 500 });
    this.sterren += 1; this.geefSter(spot.x, spot.y - 100); this.zegPriet('Een geheim woord! ⭐', 1800); this.lichtOp(spot.x - 220, spot.x + 220);
  }

  geefSter(x, y) {
    const st = this.add.text(x, y, '⭐', { fontSize: '30px' }).setOrigin(0.5).setDepth(30);
    this.tweens.add({ targets: st, y: y - 40, scale: 1.4, duration: 500, ease: 'Back.out', yoyo: true, onComplete: () => this.tweens.add({ targets: st, alpha: 0, duration: 300, onComplete: () => st.destroy() }) });
    SFX.sparkle();
  }

  // ----------------------------------------------------------------- KLANK-KRACHT
  grantPower(kracht) {
    this.powers[kracht] = true;
    const W = this.scale.width, H = this.scale.height;
    const c = this.add.container(W / 2, H / 2 - 80).setScrollFactor(0).setDepth(115).setScale(0);
    const g = this.add.graphics(); g.fillStyle(0xffe16b, 0.35); for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.fillTriangle(0, 0, Math.cos(a - 0.09) * 180, Math.sin(a - 0.09) * 180, Math.cos(a + 0.09) * 180, Math.sin(a + 0.09) * 180); } c.add(g);
    c.add(this.add.circle(0, -6, 52, 0xffffff).setStrokeStyle(5, 0xf6a723));
    c.add(this.add.text(0, -8, '🦘', { fontSize: '44px' }).setOrigin(0.5));
    c.add(this.add.text(0, 66, 'NIEUWE KRACHT!', { fontFamily: 'Arial Black, Arial', fontSize: '22px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5).setStroke('#b45309', 7));
    c.add(this.add.text(0, 98, KRACHT_NAAM[kracht] || kracht, { fontFamily: 'Arial Black, Arial', fontSize: '13px', fontStyle: 'bold', color: '#ffe16b' }).setOrigin(0.5).setStroke('#1f2d3a', 5));
    this.tweens.add({ targets: c, scale: 1, duration: 420, ease: 'Back.out' }); this.tweens.add({ targets: g, angle: 40, duration: 2600 });
    SFX.yay(); Voice.cue('cheer');
    this.zegPriet('Probeer maar — spring hoog! 🦘', 2400);
    this.time.delayedCall(2200, () => this.tweens.add({ targets: c, scale: 0, alpha: 0, duration: 300, onComplete: () => c.destroy() }));
  }

  // ================================================================= UPDATE
  update(time) {
    const p = this.speler; if (!p || !p.body) return;
    this.updateCamera(time);
    const b = p.body; const onFloor = b.blocked.down || b.touching.down;
    if (onFloor) { this.jumpsUsed = 0; this.lastGroundAt = time; if (Math.abs(b.velocity.x) < 5 && !this.overPit(p.x)) this.lastSafeX = p.x; }

    if (this.priet) {
      this.priet.x += (p.x - 46 - this.priet.x) * 0.08; this.priet.y += (p.y + 4 - this.priet.y) * 0.08;
      if (this.prietTekst && this.prietTekst.visible) { this.prietTekst.x = this.priet.x; this.prietTekst.y = this.priet.y - 44; }
    }

    if (this.frozen) { b.setVelocity(0, 0); return; }

    let dir = this.moveDir;
    if (this.cursors.left.isDown) dir = -1; else if (this.cursors.right.isDown) dir = 1;
    b.setVelocityX(dir * MOVE_SPEED); if (dir !== 0) p.art.scaleX = dir;

    if (Phaser.Input.Keyboard.JustDown(this.keySpace) || (this.cursors.up && Phaser.Input.Keyboard.JustDown(this.cursors.up))) this.jumpBufferedAt = time;
    const wantJump = (time - this.jumpBufferedAt) < BUFFER_MS; const coyoteOk = (time - this.lastGroundAt) < COYOTE_MS;
    if (wantJump && this.jumpsUsed < 1 && coyoteOk) {
      this.jumpBufferedAt = -9999; this.jumpsUsed = 1;
      const bots = !!this.powers.bots;
      b.setVelocityY(-(bots ? BOTS_JUMP : JUMP_BASE));
      SFX.pick(); Voice.cue(bots ? 'whee' : 'jump');
      if (bots) this.tweens.add({ targets: p.art, scaleX: 1.35, scaleY: 0.7, yoyo: true, duration: 220, ease: 'Quad.out' });
    }
    if (onFloor && dir !== 0) p.art.y = Math.sin(time * 0.02) * 1.6; else if (p.art.y !== 0) p.art.y *= 0.8;

    if (p.y > WORLDH + 20) this.respawn();

    let near = null;
    for (const s of this.spots) { if (s.solved) { s.hint.setVisible(false); continue; } const dichtbij = Math.abs(p.x - s.x) < 90 && Math.abs(p.y - s.y) < 150; s.hint.setVisible(dichtbij); if (dichtbij) near = s; }
    if (near && near !== this.nearSpot) Voice.cue('greet');
    this.nearSpot = near;

    if (!this._klaar && p.x > this.vlagX - 20) { this._klaar = true; this.missieKlaar(); }
  }

  overPit(x) { return this.pitX0 != null && x > this.pitX0 - 10 && x < this.pitX1 + 10; }

  updateCamera(time) {
    const cam = this.cameras.main, W = this.scale.width, H = this.scale.height; let tx, ty;
    if (this.camPan && time < this.camPan.until) { tx = this.camPan.x - W / 2; ty = this.camPan.y - H / 2; }
    else { this.camPan = null; tx = this.speler.x - W * 0.34; ty = this.speler.y - H * 0.58; }
    tx = Phaser.Math.Clamp(tx, 0, Math.max(0, this.worldW - W)); ty = Phaser.Math.Clamp(ty, 0, Math.max(0, WORLDH - H));
    const snel = this.camPan ? 0.06 : 0.10;
    cam.scrollX += (tx - cam.scrollX) * snel; cam.scrollY += (ty - cam.scrollY) * snel;
  }

  panNaar(x, y, ms = 1500) { this.camPan = { x, y, until: this.time.now + ms }; }

  respawn() { const p = this.speler; p.body.setVelocity(0, 0); p.setPosition(this.lastSafeX, GROND - 60); p.body.reset(this.lastSafeX, GROND - 60); this.cameras.main.flash(160, 120, 140, 160); }

  missieKlaar() {
    this.frozen = true; this.speler.body.setVelocity(0, 0); this.setControlsZichtbaar(false);
    this.lichtOp(0, this.worldW); confettiBurst(this, 40); SFX.yay(); Voice.cue('cheer');
    const W = this.scale.width, H = this.scale.height;
    const ov = this.add.container(0, 0).setScrollFactor(0).setDepth(120);
    ov.add(this.add.rectangle(W / 2, H / 2, W, H, 0x12202a, 0.6));
    ov.add(this.add.text(W / 2, H / 2 - 90, `${this.cfg.naam} gehaald! 🎉`, { fontFamily: 'Arial Black, Arial', fontSize: '23px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5).setStroke('#e8402c', 8));
    ov.add(this.add.text(W / 2, H / 2 - 48, `⭐ ${this.sterren} geheim${this.sterren === 1 ? '' : 'en'} gevonden`, { fontFamily: 'Arial Black, Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffe16b' }).setOrigin(0.5));
    const knop = (yy, kleur, rand, txt, fn) => {
      const g = this.add.graphics(); g.fillStyle(kleur, 1); g.fillRoundedRect(W / 2 - 100, yy, 200, 52, 15); g.lineStyle(4, rand, 1); g.strokeRoundedRect(W / 2 - 100, yy, 200, 52, 15); ov.add(g);
      ov.add(this.add.text(W / 2, yy + 26, txt, { fontFamily: 'Arial Black, Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5));
      const hit = this.add.rectangle(W / 2, yy + 26, 200, 52, 0xffffff, 0.001).setScrollFactor(0).setDepth(121).setInteractive({ useHandCursor: true }); hit.on('pointerdown', fn);
    };
    if (this.cfg.volgende) {
      knop(H / 2 + 6, 0x4ade80, 0x1f9d57, 'Volgende missie →', () => { SFX.click(); this.scene.start('LetterMissie', { missie: this.cfg.volgende }); });
      knop(H / 2 + 70, 0x38b6cf, 0x1f7a9e, 'Naar het menu', () => { SFX.click(); stopMusic(); this.scene.start('Menu'); });
    } else {
      knop(H / 2 + 30, 0x38b6cf, 0x1f7a9e, 'Naar het menu', () => { SFX.click(); stopMusic(); this.scene.start('Menu'); });
    }
  }
}
