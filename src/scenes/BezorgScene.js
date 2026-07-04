import Phaser from 'phaser';
import { SFX } from '../sound.js';
import { Voice } from '../voice.js';
import { addStars, giveMedal, getSetting, setSetting } from '../progress.js';
import { confettiBurst } from '../reward.js';
import { INKT } from '../theme.js';
import {
  labelDorp, kiesBestelling, isJuisteBezorging,
  nieuweLadder, ladderGoed, ladderFout, sterrenVoorRonde,
  LEVERINGEN_PER_RONDE,
} from '../bezorgLogic.js';

// Bezorg-Baas — Nul rijdt een bezorgbusje door het Getallen-Dorp en brengt
// pakjes naar de juiste huizen. Elk huis heeft een getal (1–9) of een kort
// woord; de bestelling vraagt erom als getal, som ("3 + 4") of woord.
//
// Rij-logica hergebruikt uit het oude Stad Rijden (scalaire carSpeed +
// grip-drift). De spellogica (bestellingen, adaptieve ladder) staat los in
// src/bezorgLogic.js en is met vitest getest.

const TILE = 64;
const COLS = 15, ROWS = 13;
const ROAD_ROWS = new Set([1, 6, 11]);
const ROAD_COLS = new Set([1, 7, 13]);
const HUIS_PLEKKEN = [[2, 2], [2, 5], [2, 10], [5, 2], [5, 12], [10, 3], [10, 8], [10, 12]];
const BOOM_PLEKKEN = [[3, 8], [4, 4], [8, 5], [8, 11], [9, 12]];
const NUL_PLEKKEN = [[4, 10], [9, 3]]; // verstopte gouden nullen
const SIG = [0xe8402c, 0xf08a24, 0xf6c624, 0x57b947, 0x38b6cf, 0xec6aa9, 0x9b6dd6, 0x6b7b8a, 0x4f63c9];

const HUIS_RADIUS = 56;   // hoe dichtbij je moet stoppen om te bezorgen
const PARKEER_SNELHEID = 48;

function isRoad(r, c) { return ROAD_ROWS.has(r) || ROAD_COLS.has(c); }

export default class BezorgScene extends Phaser.Scene {
  constructor() { super('Bezorg'); }

  create() {
    this.worldW = COLS * TILE;
    this.worldH = ROWS * TILE;
    this.carAngle = -90;
    this.carSpeed = 0;
    // Niveau groeit adaptief mee ÉN blijft bewaard tussen rondes (zoals
    // Reken-Raket), zodat het reken-adres (niveau 3) na wat oefenen verschijnt.
    this.ladder = nieuweLadder(getSetting('bezorgNiveau') || 1);
    this.geleverd = 0;
    this.fouten = 0;
    this.nullenBonus = 0;
    this.voorbij = false;
    this.vorigeSlot = -1;
    this.laatstBijHuis = null;

    this.maakVoertuigTexturen();

    this.physics.world.setBounds(0, 0, this.worldW, this.worldH);
    this.cameras.main.setBounds(0, 0, this.worldW, this.worldH);
    this.cameras.main.setBackgroundColor('#8fd674');

    this.buildDorp();
    this.buildVan();
    this.buildVerkeer();

    // Geen camera-zoom: scrollFactor(0)-HUD (kaartje, knoppen) rendert dan
    // 1-op-1 op de juiste plek. Camera volgt de van door het dorp.
    this.cameras.main.startFollow(this.van, true, 0.12, 0.12);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = { gas: false, brake: false, left: false, right: false };
    this.maakKnoppen();
    this.buildHud();
    this.input.addPointer(3);

    this.nieuweBestelling();
    this.cameras.main.fadeIn(300, 143, 214, 116);
  }

  // ---------------------------------------------------- eigen voertuig-art

  maakVoertuigTexturen() {
    if (this.textures.exists('bezorg_van')) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Busje, wijst naar rechts (angle 0). 64×40.
    const drawWielen = (len) => {
      g.fillStyle(0x1e293b, 1);
      [12, len - 16].forEach((wx) => { g.fillRoundedRect(wx, 2, 10, 5, 2); g.fillRoundedRect(wx, 33, 10, 5, 2); });
    };
    g.clear();
    drawWielen(64);
    g.fillStyle(0xf1f5f9, 1); g.fillRoundedRect(6, 7, 52, 26, 7);
    g.lineStyle(2.5, 0x64748b, 1); g.strokeRoundedRect(6, 7, 52, 26, 7);
    g.fillStyle(0xe8402c, 1); g.fillRoundedRect(44, 7, 14, 26, 7);       // rode cabine
    g.fillStyle(0xbae6fd, 1); g.fillRoundedRect(40, 11, 12, 18, 3);      // voorruit
    g.lineStyle(2, 0x64748b, 1); g.strokeRoundedRect(40, 11, 12, 18, 3);
    g.fillStyle(0xfbbf24, 1); g.fillRoundedRect(16, 12, 16, 16, 3);      // pakje op het dak
    g.lineStyle(1.5, 0xa8730e, 1); g.strokeRoundedRect(16, 12, 16, 16, 3);
    g.lineBetween(24, 12, 24, 28); g.lineBetween(16, 20, 32, 20);
    g.generateTexture('bezorg_van', 64, 40);

    // Vriendelijke autootjes met oogjes, per kleur. 56×36.
    [[0xf87171, 'auto_rood'], [0x60a5fa, 'auto_blauw'], [0x57b947, 'auto_groen']].forEach(([kl, key]) => {
      g.clear();
      g.fillStyle(0x1e293b, 1);
      [10, 40].forEach((wx) => { g.fillRoundedRect(wx, 1, 9, 5, 2); g.fillRoundedRect(wx, 30, 9, 5, 2); });
      g.fillStyle(kl, 1); g.fillRoundedRect(5, 6, 46, 24, 8);
      g.lineStyle(2.5, INKT, 1); g.strokeRoundedRect(5, 6, 46, 24, 8);
      g.fillStyle(0xbae6fd, 1); g.fillRoundedRect(30, 9, 15, 18, 4);    // voorruit
      g.fillStyle(0xffffff, 1); g.fillCircle(37, 14, 3); g.fillCircle(37, 22, 3); // oogjes
      g.fillStyle(INKT, 1); g.fillCircle(38, 14, 1.4); g.fillCircle(38, 22, 1.4);
      g.fillStyle(0xfde047, 1); g.fillCircle(49, 12, 2.5); g.fillCircle(49, 24, 2.5); // koplampen
      g.generateTexture(key, 56, 36);
    });
    g.destroy();
  }

  // ---------------------------------------------------- het dorp

  buildDorp() {
    // grond: gras + wegen + stoepranden
    const grond = this.add.graphics().setDepth(-10);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = c * TILE, y = r * TILE;
        if (isRoad(r, c)) {
          grond.fillStyle(0xb8bcc4, 1); grond.fillRect(x, y, TILE, TILE);
          grond.fillStyle(0xffffff, 0.5);
          if (ROAD_ROWS.has(r)) for (let d = 8; d < TILE; d += 22) grond.fillRect(x + d, y + TILE / 2 - 2, 12, 4);
          if (ROAD_COLS.has(c)) for (let d = 8; d < TILE; d += 22) grond.fillRect(x + TILE / 2 - 2, y + d, 4, 12);
        } else {
          grond.fillStyle((r + c) % 2 ? 0x8fd674 : 0x86ce6a, 1);
          grond.fillRect(x, y, TILE, TILE);
        }
      }
    }

    // vijver
    grond.fillStyle(0x5cc0e8, 1); grond.fillEllipse(11.5 * TILE, 8.5 * TILE, 150, 96);
    grond.fillStyle(0xbfeaf7, 0.6); grond.fillEllipse(11 * TILE, 8.1 * TILE, 46, 22);

    // bomen (decoratief, geen obstakel)
    BOOM_PLEKKEN.forEach(([r, c]) => {
      const x = c * TILE + TILE / 2, y = r * TILE + TILE / 2;
      const t = this.add.graphics().setDepth(y);
      t.fillStyle(0x8a5a2b, 1); t.fillRoundedRect(x - 5, y, 10, 20, 3);
      t.fillStyle(0x57a844, 1); t.fillCircle(x, y - 8, 26);
      t.fillStyle(0x4f9c3e, 1); t.fillCircle(x - 15, y + 2, 16); t.fillCircle(x + 15, y + 2, 16);
      t.fillStyle(0xffffff, 0.12); t.fillCircle(x - 8, y - 16, 10);
    });

    // gouden nullen
    this.nullen = [];
    NUL_PLEKKEN.forEach(([r, c]) => {
      const x = c * TILE + TILE / 2, y = r * TILE + TILE / 2;
      const g = this.add.circle(x, y, 15).setStrokeStyle(7, 0xfbbf24).setDepth(y);
      this.tweens.add({ targets: g, angle: 360, duration: 3000, repeat: -1 });
      this.tweens.add({ targets: g, scale: 1.15, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.nullen.push(g);
    });

    // huizen met labels
    this.gebouwen = this.physics.add.staticGroup();
    const labels = labelDorp(HUIS_PLEKKEN.length, 3);
    this.huizen = HUIS_PLEKKEN.map(([r, c], i) => this.maakHuis(r, c, labels[i]));
  }

  maakHuis(r, c, label) {
    const x = c * TILE + TILE / 2, y = r * TILE + TILE / 2;
    const kleur = label.kind === 'getal' ? SIG[(label.getal - 1) % SIG.length] : SIG[(c + r) % SIG.length];
    const donker = Phaser.Display.Color.ValueToColor(kleur).darken(38).color;
    const cont = this.add.container(x, y).setDepth(y);

    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.18); g.fillEllipse(4, 26, 60, 16);           // schaduw
    g.fillStyle(kleur, 1); g.fillRoundedRect(-27, -20, 54, 46, 7);
    g.lineStyle(3, donker, 1); g.strokeRoundedRect(-27, -20, 54, 46, 7);
    g.fillStyle(donker, 1); g.fillTriangle(-31, -18, 0, -42, 31, -18);   // dak
    g.lineStyle(3, donker, 1); g.strokeTriangle(-31, -18, 0, -42, 31, -18);
    g.fillStyle(0x8a5a2b, 1); g.fillRoundedRect(-9, 6, 18, 20, 3);       // deur
    cont.add(g);
    // gezichtje
    cont.add(this.add.circle(-11, -6, 4.5, 0xffffff).setStrokeStyle(1.5, INKT));
    cont.add(this.add.circle(11, -6, 4.5, 0xffffff).setStrokeStyle(1.5, INKT));
    cont.add(this.add.circle(-11, -5, 2, INKT));
    cont.add(this.add.circle(11, -5, 2, INKT));

    // label (getal groot, of woord)
    const tekst = label.kind === 'getal' ? String(label.getal) : label.woord;
    const maat = label.kind === 'getal' ? 30 : (tekst.length >= 4 ? 15 : 18);
    const bord = this.add.graphics();
    bord.fillStyle(0xffffff, 0.95); bord.fillRoundedRect(-24, -46, 48, 22, 6);
    bord.lineStyle(2, donker, 1); bord.strokeRoundedRect(-24, -46, 48, 22, 6);
    cont.add(bord);
    cont.add(this.add.text(0, -35, tekst, {
      fontFamily: 'Arial Black, Arial', fontSize: `${label.kind === 'getal' ? 20 : maat}px`,
      fontStyle: 'bold', color: '#1f2d3a',
    }).setOrigin(0.5));

    // physics-collider (rechthoek op de huis-basis)
    const col = this.gebouwen.create(x, y, null).setVisible(false);
    col.body.setSize(50, 42).setOffset(-25, -20);
    col.refreshBody();

    return { r, c, x, y, label, cont, kleur, donker };
  }

  // ---------------------------------------------------- van & verkeer

  buildVan() {
    const start = { x: 7 * TILE + TILE / 2, y: 6 * TILE + TILE / 2 };
    this.van = this.physics.add.sprite(start.x, start.y, 'bezorg_van').setDepth(9000);
    this.van.setCollideWorldBounds(true);
    this.van.body.setAllowGravity(false);
    this.van.body.setSize(48, 30).setOffset(8, 5);
    this.van.body.setMaxVelocity(320);
    this.van.setAngle(this.carAngle);
    this.physics.add.collider(this.van, this.gebouwen);

    // Nul-bijrijder-badge in de hoek (HUD)
  }

  buildVerkeer() {
    this.verkeer = this.physics.add.group();
    const kleuren = ['auto_rood', 'auto_blauw', 'auto_groen'];
    const plekken = [[6, 4], [6, 10], [1, 8], [11, 6]];
    plekken.forEach((p, i) => {
      const t = this.physics.add.sprite(p[1] * TILE + TILE / 2, p[0] * TILE + TILE / 2, kleuren[i % 3]).setDepth(8000);
      t.setCollideWorldBounds(true);
      t.body.setAllowGravity(false);
      t.body.setSize(46, 28).setOffset(5, 4);
      t.dir = Phaser.Math.Between(0, 3) * 90;
      t.setAngle(t.dir);
      t.wisselTimer = Phaser.Math.Between(1500, 3500);
      this.verkeer.add(t);
    });
    this.physics.add.collider(this.van, this.verkeer);
    this.physics.add.collider(this.verkeer, this.gebouwen);
    this.physics.add.collider(this.verkeer, this.verkeer);
  }

  // ---------------------------------------------------- HUD & bestelling

  buildHud() {
    const { width } = this.scale;
    const D = 10000;

    // Terug-pil
    const back = this.add.text(14, 14, '⬅ Terug', {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#334155',
      backgroundColor: '#ffffff', padding: { x: 11, y: 6 },
    }).setScrollFactor(0).setDepth(D + 1).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => { SFX.click(); this.scene.start('Menu'); });

    // Bestel-kaartje
    this.ticket = this.add.container(width / 2, 40).setScrollFactor(0).setDepth(D + 1);
    const kaart = this.add.graphics();
    kaart.fillStyle(0xffffff, 0.96); kaart.fillRoundedRect(-135, -26, 270, 52, 16);
    kaart.lineStyle(2.5, 0xbcd9ee, 1); kaart.strokeRoundedRect(-135, -26, 270, 52, 16);
    // pakje-icoon
    const pk = this.add.graphics();
    pk.fillStyle(0xf08a24, 1); pk.fillRoundedRect(-118, -16, 32, 30, 4);
    pk.lineStyle(2, 0xa85a10, 1); pk.strokeRoundedRect(-118, -16, 32, 30, 4);
    pk.lineBetween(-118, -1, -86, -1); pk.lineBetween(-102, -16, -102, 14);
    this.ticket.add([kaart, pk]);
    this.ticketLabel = this.add.text(30, 0, '', {
      fontFamily: 'Arial Black, Arial', fontSize: '26px', fontStyle: 'bold', color: '#1f2d3a',
    }).setOrigin(0.5);
    this.ticketVoor = this.add.text(-72, -14, 'Breng naar', {
      fontFamily: 'Arial', fontSize: '11px', color: '#64748b',
    }).setOrigin(0, 0.5);
    this.ticket.add([this.ticketVoor, this.ticketLabel]);

    // Voortgangsbolletjes
    this.bolletjes = [];
    for (let i = 0; i < LEVERINGEN_PER_RONDE; i++) {
      this.bolletjes.push(this.add.circle(width / 2 - (LEVERINGEN_PER_RONDE - 1) * 8 + i * 16, 76, 5, 0xffffff, 0.8)
        .setStrokeStyle(1.5, 0x64748b).setScrollFactor(0).setDepth(D + 1));
    }

    // richtingpijl (wereld-ruimte, boven de van)
    this.pijl = this.add.graphics().setDepth(9500);
  }

  updateBolletjes() {
    this.bolletjes.forEach((b, i) => b.setFillStyle(i < this.geleverd ? 0x57b947 : 0xffffff, i < this.geleverd ? 1 : 0.8));
  }

  huisOnderVan() {
    let bij = null;
    this.huizen.forEach((h, i) => { if (Math.hypot(this.van.x - h.x, this.van.y - h.y) < HUIS_RADIUS) bij = i; });
    return bij;
  }

  nieuweBestelling() {
    const labels = this.huizen.map((h) => h.label);
    this.bestelling = kiesBestelling(labels, this.ladder.niveau, Math.random, this.vorigeSlot);
    this.vorigeSlot = this.bestelling.slot;
    // Sta je nu al op een huis? Onthoud dat, zodat stilstaan na een levering
    // niet meteen als een foute levering telt (je moet er echt naartoe rijden).
    this.laatstBijHuis = this.huisOnderVan();
    this.ticketLabel.setText(this.bestelling.tekst);
    this.ticketLabel.setFontSize(this.bestelling.soort === 'woord' && this.bestelling.tekst.length >= 4 ? 20 : 26);
    this.updateBolletjes();
    if (this.bestelling.soort !== 'woord') Voice.cue('number', this.bestelling.getal);
    else Voice.cue('great');
  }

  // ---------------------------------------------------- rij-model + lus

  maakKnoppen() {
    const { width, height } = this.scale;
    const y = height - 54;
    this.bedieningKnoppen = [];
    const mk = (bx, label, key, kleur) => {
      const btn = this.add.container(bx, y).setScrollFactor(0).setDepth(10000);
      const bg = this.add.graphics();
      bg.fillStyle(0xffffff, 0.8); bg.lineStyle(3, kleur, 0.9);
      bg.fillCircle(0, 0, 30); bg.strokeCircle(0, 0, 30);
      const t = this.add.text(0, 0, label, { fontFamily: 'Arial', fontSize: '24px', color: '#334155' }).setOrigin(0.5);
      btn.add([bg, t]);
      this.bedieningKnoppen.push({ key, x: bx, y, r: 30, bg, kleur });
    };
    mk(48, '◀', 'left', 0x94a3b8);
    mk(116, '▶', 'right', 0x94a3b8);
    mk(width - 116, '🛑', 'brake', 0xf87171);
    mk(width - 48, '⛽', 'gas', 0x4ade80);
  }

  leesKnoppen() {
    const z = this.cameras.main.zoom;
    const cx = this.scale.width / 2, cy = this.scale.height / 2;
    const pointers = [this.input.pointer1, this.input.pointer2, this.input.pointer3, this.input.pointer4].filter((p) => p && p.isDown);
    this.keys.left = this.keys.right = this.keys.gas = this.keys.brake = false;
    for (const btn of this.bedieningKnoppen) {
      const sx = cx + (btn.x - cx) * z, sy = cy + (btn.y - cy) * z;
      let in2 = false;
      for (const p of pointers) if (Math.hypot(p.x - sx, p.y - sy) <= btn.r * z + 6) { in2 = true; break; }
      if (in2) this.keys[btn.key] = true;
      btn.bg.clear();
      btn.bg.fillStyle(0xffffff, in2 ? 0.95 : 0.8); btn.bg.lineStyle(3, btn.kleur, in2 ? 1 : 0.9);
      btn.bg.fillCircle(0, 0, 30); btn.bg.strokeCircle(0, 0, 30);
    }
  }

  update(time, delta) {
    if (!this.van || !this.van.body || this.voorbij) return;
    this.leesKnoppen();
    const dt = delta / 1000;
    const gas = this.keys.gas || (this.cursors && this.cursors.up.isDown);
    const rem = this.keys.brake || (this.cursors && this.cursors.down.isDown);
    const links = this.keys.left || (this.cursors && this.cursors.left.isDown);
    const rechts = this.keys.right || (this.cursors && this.cursors.right.isDown);

    const rad = Phaser.Math.DegToRad(this.carAngle);
    const vx0 = this.van.body.velocity.x, vy0 = this.van.body.velocity.y;
    const proj = vx0 * Math.cos(rad) + vy0 * Math.sin(rad);
    if (Math.abs(this.carSpeed) > 60 && Math.abs(proj) < Math.abs(this.carSpeed) * 0.5) this.carSpeed = proj * 0.4;

    if (gas) this.carSpeed = Math.min(this.carSpeed + 400 * dt, 260);
    if (rem) this.carSpeed = Math.max(this.carSpeed - 500 * dt, -90);
    if (!gas && !rem) {
      if (Math.abs(this.carSpeed) < 15) this.carSpeed = 0;
      else this.carSpeed -= Math.sign(this.carSpeed) * 220 * dt;
    }
    if (Math.abs(this.carSpeed) > 20) {
      const stuur = 135 * (this.carSpeed > 0 ? 1 : -1);
      if (links) this.carAngle -= stuur * dt;
      if (rechts) this.carAngle += stuur * dt;
    }
    this.van.setAngle(this.carAngle);
    const nr = Phaser.Math.DegToRad(this.carAngle);
    const grip = 0.88;
    this.van.body.velocity.x = vx0 * (1 - grip) + Math.cos(nr) * this.carSpeed * grip;
    this.van.body.velocity.y = vy0 * (1 - grip) + Math.sin(nr) * this.carSpeed * grip;

    this.updateVerkeer(delta);
    this.checkGoudenNullen();
    this.checkBezorging();
    this.updatePijl();
  }

  updateVerkeer(delta) {
    this.verkeer.getChildren().forEach((t) => {
      t.wisselTimer -= delta;
      if (t.wisselTimer <= 0) {
        t.dir = (t.dir + (Phaser.Math.Between(0, 1) ? 90 : -90) + 360) % 360;
        t.wisselTimer = Phaser.Math.Between(1500, 4000);
      }
      t.setAngle(t.dir);
      const tr = Phaser.Math.DegToRad(t.dir);
      t.body.velocity.x = Math.cos(tr) * 80;
      t.body.velocity.y = Math.sin(tr) * 80;
    });
  }

  checkGoudenNullen() {
    this.nullen.forEach((g) => {
      if (!g.actief && g.active !== false && Math.hypot(this.van.x - g.x, this.van.y - g.y) < 46) {
        g.actief = true;
        this.nullenBonus += 1;
        SFX.sparkle(); Voice.cue('star');
        this.burst(g.x, g.y, 0xfbbf24);
        this.tweens.add({ targets: g, scale: 0, alpha: 0, duration: 250, onComplete: () => g.destroy() });
      }
    });
  }

  updatePijl() {
    const h = this.huizen[this.bestelling.slot];
    this.pijl.clear();
    const d = Math.hypot(h.x - this.van.x, h.y - this.van.y);
    if (d < 70) return; // dichtbij: pijl weg, lees zelf het bordje
    const a = Math.atan2(h.y - this.van.y, h.x - this.van.x);
    const ox = this.van.x + Math.cos(a) * 46, oy = this.van.y + Math.sin(a) * 46 - 44;
    this.pijl.fillStyle(0xf97316, 0.95);
    this.pijl.save(); this.pijl.translateCanvas(ox, oy); this.pijl.rotateCanvas(a);
    this.pijl.fillTriangle(-8, -9, 14, 0, -8, 9);
    this.pijl.fillRect(-16, -4, 10, 8);
    this.pijl.restore();
  }

  checkBezorging() {
    if (Math.abs(this.carSpeed) > PARKEER_SNELHEID) { this.laatstBijHuis = null; return; }
    let bij = null;
    this.huizen.forEach((h, i) => { if (Math.hypot(this.van.x - h.x, this.van.y - h.y) < HUIS_RADIUS) bij = i; });
    if (bij === null) { this.laatstBijHuis = null; return; }
    if (bij === this.laatstBijHuis) return; // al beoordeeld deze stop
    this.laatstBijHuis = bij;
    if (isJuisteBezorging(this.bestelling, bij)) this.bezorgGoed(bij);
    else this.bezorgFout(bij);
  }

  bezorgGoed(slot) {
    const h = this.huizen[slot];
    this.geleverd += 1;
    this.ladder = ladderGoed(this.ladder);
    setSetting('bezorgNiveau', this.ladder.niveau);
    SFX.coin(); Voice.cue(this.geleverd >= LEVERINGEN_PER_RONDE ? 'cheer' : 'great');
    this.burst(h.x, h.y - 30, h.kleur);
    // pakje vliegt van de van naar het huis
    const pk = this.add.rectangle(this.van.x, this.van.y, 16, 16, 0xf08a24).setStrokeStyle(2, 0xa85a10).setDepth(9600);
    this.tweens.add({
      targets: pk, x: h.x, y: h.y - 8, duration: 320, ease: 'Quad.easeIn',
      onComplete: () => { pk.destroy(); this.tweens.add({ targets: h.cont, y: h.y - 12, duration: 140, yoyo: true, ease: 'Quad.easeOut' }); },
    });
    // blij hartje
    const hart = this.add.text(h.x, h.y - 44, '💛', { fontSize: '26px' }).setOrigin(0.5).setDepth(9700);
    this.tweens.add({ targets: hart, y: h.y - 80, alpha: 0, duration: 900, onComplete: () => hart.destroy() });
    this.updateBolletjes();

    if (this.geleverd >= LEVERINGEN_PER_RONDE) this.rondeKlaar();
    else this.time.delayedCall(650, () => this.nieuweBestelling());
  }

  bezorgFout(slot) {
    const h = this.huizen[slot];
    this.fouten += 1;
    this.ladder = ladderFout(this.ladder);
    setSetting('bezorgNiveau', this.ladder.niveau);
    SFX.oops(); Voice.cue('oops');
    this.tweens.add({ targets: h.cont, angle: { from: -6, to: 6 }, duration: 60, yoyo: true, repeat: 3, onComplete: () => h.cont.setAngle(0) });
    const nee = this.add.text(h.x, h.y - 44, `oeps, dat is ${h.label.kind === 'getal' ? h.label.getal : h.label.woord}!`, {
      fontFamily: 'Arial', fontSize: '13px', fontStyle: 'bold', color: '#be185d',
      backgroundColor: '#ffffffee', padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setDepth(9700);
    this.tweens.add({ targets: nee, y: h.y - 70, alpha: 0, duration: 1300, onComplete: () => nee.destroy() });
  }

  burst(x, y, kleur) {
    const p = this.add.particles(x, y, 'star', {
      speed: { min: 60, max: 200 }, scale: { start: 1.2, end: 0 }, lifespan: 500, quantity: 12,
      tint: [kleur, 0xfbbf24, 0xffffff], blendMode: 'ADD',
    }).setDepth(9800);
    this.time.delayedCall(500, () => p.destroy());
  }

  // ---------------------------------------------------- ronde klaar

  rondeKlaar() {
    this.voorbij = true;
    this.van.body.setVelocity(0, 0);
    const { width, height } = this.scale;
    const sterren = sterrenVoorRonde(this.fouten) + (this.nullenBonus > 0 ? 1 : 0);
    addStars(sterren);
    giveMedal('bezorg_baas');

    SFX.win(); Voice.cue('cheer');
    confettiBurst(this, 12000);

    const D = 11000;
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55).setScrollFactor(0).setDepth(D);
    const kaart = this.add.graphics().setScrollFactor(0).setDepth(D + 1);
    kaart.fillStyle(0xffffff, 0.97); kaart.fillRoundedRect(width / 2 - 150, height / 2 - 150, 300, 300, 24);
    kaart.lineStyle(3, 0xbfdbfe, 1); kaart.strokeRoundedRect(width / 2 - 150, height / 2 - 150, 300, 300, 24);
    const cx = width / 2;
    this.add.text(cx, height / 2 - 110, '🚚', { fontSize: '46px' }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 2);
    this.add.text(cx, height / 2 - 62, 'Alles bezorgd!', {
      fontFamily: 'Arial Black, Arial', fontSize: '26px', fontStyle: 'bold', color: '#1f2d3a',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 2);
    for (let i = 0; i < 3; i++) {
      const st = this.add.image(cx - 52 + i * 52, height / 2 - 8, 'star').setScrollFactor(0).setDepth(D + 2).setScale(0.4);
      if (i >= sterren) st.setTint(0x94a3b8).setAlpha(0.5);
      this.tweens.add({ targets: st, scale: i < sterren ? 4.2 : 3, delay: 250 + i * 200, duration: 300, ease: 'Back.out' });
    }
    this.add.text(cx, height / 2 + 44, this.nullenBonus > 0 ? `+${sterren} ⭐   (⭕ ×${this.nullenBonus})` : `+${sterren} ⭐`, {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#b45309',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 2);

    const opnieuw = this.add.text(cx, height / 2 + 96, 'Nog een rondje 🚚', {
      fontFamily: 'Arial Black, Arial', fontSize: '19px', fontStyle: 'bold',
      color: '#1a1a2e', backgroundColor: '#fbbf24', padding: { x: 22, y: 11 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 3).setInteractive({ useHandCursor: true });
    opnieuw.on('pointerdown', () => { SFX.click(); this.scene.restart(); });
    const menu = this.add.text(cx, height / 2 + 140, '🏠 Menu', {
      fontFamily: 'Arial', fontSize: '15px', color: '#64748b', backgroundColor: '#f1f5f9', padding: { x: 14, y: 7 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 3).setInteractive({ useHandCursor: true });
    menu.on('pointerdown', () => { SFX.click(); this.scene.start('Menu'); });
  }
}
