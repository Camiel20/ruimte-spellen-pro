import Phaser from 'phaser';
import { SFX } from '../sound.js';
import { Voice } from '../voice.js';
import { getHigh, saveHigh, addStars, giveMedal } from '../progress.js';
import { confettiBurst } from '../reward.js';
import {
  COLS, ROWS, RAINBOW, PRIK_MAX,
  maakBord, valOmlaag, vindGroep, mergeWaarde, activeerRegenboog,
  kiesVolgende, magRegenboog, verdienPrik, sterrenVoorScore,
} from '../balloonLogic.js';

// Ballon-Feest — het grote ballonnen-merge-spel, opgepoetst.
//
// De spellogica (zwaartekracht, groepen, spawn-plafond, regenboog-joker)
// leeft in src/balloonLogic.js en is met vitest getest (tests/balloon.test.js).
// Deze scene is alleen het "plaatje": lucht, wolken, karakter-ballonnen met
// gezichtjes, en alle feestjes eromheen.
//
// Datamodel-afspraak (zelfde als de oude versie, die hiermee bugvrij werd):
// eerst rekenen we op de getallen (state.vals), daarna pas bewegen de
// sprites (state.items) — zo lopen plaatje en werkelijkheid nooit uiteen.

// Kleur per "verdieping" (licht, donker) — fel met dikke donkere rand,
// zoals de Numberblocks-tegels elders in het project.
const TIERS = {
  2: [0xe8402c, 0x9c2417], 4: [0xf08a24, 0xa85a10],
  8: [0xf6c624, 0xb08a0e], 16: [0x57b947, 0x35772b],
  32: [0x38b6cf, 0x1f7d91], 64: [0xec6aa9, 0xa93c72],
  128: [0x9b6dd6, 0x67419a], 256: [0x4f63c9, 0x32408f],
  512: [0xe34da0, 0x9e2f6c], 1024: [0x14b8a6, 0x0c7568],
  2048: [0xfbbf24, 0xb28312], 4096: [0xf87171, 0xb91c1c],
};
const REGENBOOG_KLEUREN = [0xe8402c, 0xf08a24, 0xf6c624, 0x57b947, 0x38b6cf, 0x9b6dd6];

function tierKleur(v) { return TIERS[v] || TIERS[4096]; }

export default class BalloonScene extends Phaser.Scene {
  constructor() {
    super('Balloon');
  }

  create() {
    const { width, height } = this.scale;
    this.cellW = width / COLS;          // 80 bij 480 breed
    this.topH = 96;
    this.boardTop = this.topH;
    this.boardH = ROWS * this.cellW;    // 640

    this.state = maakBord();
    this.score = 0;
    this.highest = 2;
    this.busy = false;
    this.combo = 0;
    this.prikLading = PRIK_MAX;
    this.prikModus = false;
    this.dropsSindsJoker = 99;          // eerste joker mag meteen als het nodig is
    this.voorbij = false;

    this.buildLucht();
    this.buildHud();

    // Wachtrij: huidige = wat je nu laat vallen, volgende = wat daarna komt
    this.huidigeVal = kiesVolgende(this.highest);
    this.volgendeVal = kiesVolgende(this.highest);
    this.updateVolgendePreview();

    this.hoverCol = Math.floor(COLS / 2);
    this.buildHint();
    this.spawnHover();

    // Tikken in een kolom laat de ballon daar vallen; slepen mag ook.
    this.input.on('pointerdown', (p) => this.opTik(p));
    this.input.on('pointermove', (p) => {
      if (this.busy || !this.dragging) return;
      this.zetHoverKolom(p.x);
    });
    this.input.on('pointerup', (p) => {
      if (this.busy) { this.dragging = false; return; }
      if (!this.dragging) return;
      this.dragging = false;
      if (p && p.y >= this.topH) this.zetHoverKolom(p.x);
      this.drop(this.hoverCol);
    });

    // Af en toe knippert er ergens een ballon met zijn ogen
    this.time.addEvent({ delay: 2400, loop: true, callback: () => this.knipperRandom() });

    this.cameras.main.fadeIn(350, 191, 227, 251);
  }

  // ---------------------------------------------------------- decor & HUD

  buildLucht() {
    const { width, height } = this.scale;

    // Lucht: van dieper blauw bovenin naar bijna wit onderin
    const g = this.add.graphics().setDepth(0);
    g.fillGradientStyle(0x7fbdf0, 0x7fbdf0, 0xcfeafd, 0xcfeafd, 1);
    g.fillRect(0, 0, width, height);

    // Zon met zachte gloed, rustig pulserend
    const gloed = this.add.circle(width - 78, 150, 44, 0xfde68a, 0.55).setDepth(0);
    this.add.circle(width - 78, 150, 30, 0xfcd34d).setDepth(0);
    this.tweens.add({ targets: gloed, scale: 1.18, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // Wolken die traag voorbij drijven (parallax: hoger = kleiner en trager)
    this.wolken = [];
    for (let i = 0; i < 5; i++) {
      const ver = i < 2; // de eerste twee zijn "verre" wolken
      const w = this.maakWolk(ver ? 0.7 : 1);
      w.x = Phaser.Math.Between(-40, width + 40);
      w.y = ver ? Phaser.Math.Between(115, 240) : Phaser.Math.Between(150, 520);
      w.setAlpha(ver ? 0.6 : 0.9).setDepth(1);
      w.snelheid = ver ? Phaser.Math.FloatBetween(4, 8) : Phaser.Math.FloatBetween(9, 17);
      this.wolken.push(w);
    }

    // Grasje onderaan met bloemetjes — de ballonnen "staan" hierop
    const grasY = this.boardTop + this.boardH;
    const gras = this.add.graphics().setDepth(3);
    gras.fillStyle(0x8fd674, 1);
    gras.fillRect(0, grasY, width, height - grasY);
    gras.fillStyle(0x7bc862, 1);
    for (let x = 20; x < width; x += 46) {
      gras.fillEllipse(x, grasY + 6, 52, 14);
    }
    for (let i = 0; i < 7; i++) {
      const bx = 28 + i * 68 + Phaser.Math.Between(-12, 12);
      const kleur = [0xf87171, 0xfbbf24, 0xec6aa9, 0xa78bfa][i % 4];
      gras.lineStyle(2, 0x5da84e).lineBetween(bx, grasY + 30, bx, grasY + 16);
      gras.fillStyle(kleur, 1).fillCircle(bx, grasY + 13, 5);
      gras.fillStyle(0xfef3c7, 1).fillCircle(bx, grasY + 13, 2);
    }
  }

  maakWolk(schaal = 1) {
    const c = this.add.container(0, 0);
    const bollen = [[0, 0, 30, 16], [24, -6, 22, 15], [-24, 4, 20, 13], [10, 8, 26, 12]];
    bollen.forEach(([x, y, rx, ry]) => {
      c.add(this.add.ellipse(x, y, rx * 2, ry * 2, 0xffffff));
    });
    c.setScale(schaal);
    return c;
  }

  buildHud() {
    const { width } = this.scale;
    const D = 100;

    const paneel = this.add.graphics().setDepth(D);
    paneel.fillStyle(0xffffff, 0.92);
    paneel.fillRoundedRect(10, 8, width - 20, 80, 18);
    paneel.lineStyle(2, 0xdbe7f0, 1);
    paneel.strokeRoundedRect(10, 8, width - 20, 80, 18);

    // Terug-knopje
    const terug = this.add.circle(38, 48, 21, 0xf1f5f9).setDepth(D + 1)
      .setStrokeStyle(2, 0xcbd5e1).setInteractive({ useHandCursor: true });
    this.add.text(38, 47, '⬅', { fontSize: '18px' }).setOrigin(0.5).setDepth(D + 2);
    terug.on('pointerdown', () => { if (!this.voorbij) this.scene.start('Menu'); });

    // Score
    this.add.text(74, 20, 'Score', {
      fontFamily: 'Arial', fontSize: '12px', color: '#64748b',
    }).setDepth(D + 1);
    this.scoreText = this.add.text(74, 36, '0', {
      fontFamily: 'Arial', fontSize: '26px', fontStyle: 'bold', color: '#1e293b',
    }).setDepth(D + 1);

    // Volgende-ballon (de wachtrij)
    this.add.text(238, 20, 'Volgende', {
      fontFamily: 'Arial', fontSize: '12px', color: '#64748b',
    }).setOrigin(0.5, 0).setDepth(D + 1);
    this.volgendePreview = null;

    // Prik-knop met ladings-stippen
    this.prikKnop = this.add.graphics().setDepth(D + 1);
    this.prikTekst = this.add.text(398, 42, '📌 Prik', {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(D + 2);
    this.prikZone = this.add.zone(398, 42, 116, 40).setDepth(D + 3)
      .setInteractive({ useHandCursor: true });
    this.prikZone.on('pointerdown', () => this.togglePrik());
    this.prikPips = [];
    for (let i = 0; i < PRIK_MAX; i++) {
      this.prikPips.push(this.add.circle(376 + i * 22, 74, 6, 0xf472b6).setDepth(D + 1));
    }
    this.prikHint = this.add.text(width / 2, this.topH + 22, 'Tik een ballon om te prikken! 📌', {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#be185d',
      backgroundColor: '#ffffffdd', padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setDepth(D + 1).setVisible(false);
    this.updatePrikUI();
  }

  updatePrikUI() {
    const aan = this.prikModus;
    this.prikKnop.clear();
    this.prikKnop.fillStyle(this.prikLading > 0 ? (aan ? 0xdb2777 : 0xf472b6) : 0xe2e8f0, 1);
    this.prikKnop.fillRoundedRect(340, 22, 116, 40, 20);
    this.prikTekst.setColor(this.prikLading > 0 ? '#ffffff' : '#94a3b8');
    this.prikPips.forEach((pip, i) => {
      pip.setFillStyle(i < this.prikLading ? 0xf472b6 : 0xe2e8f0);
    });
    this.prikHint.setVisible(aan);
    if (aan && !this.prikPuls) {
      this.prikPuls = this.tweens.add({
        targets: this.prikTekst, scale: 1.12, duration: 380, yoyo: true, repeat: -1,
      });
    } else if (!aan && this.prikPuls) {
      this.prikPuls.stop();
      this.prikPuls = null;
      this.prikTekst.setScale(1);
    }
  }

  updateVolgendePreview() {
    if (this.volgendePreview) this.weg(this.volgendePreview);
    this.volgendePreview = this.makeBalloon(this.volgendeVal, 238, 58)
      .setScale(0.4).setDepth(101);
  }

  // ------------------------------------------------------ ballon tekenen

  // Bouwt een karakter-ballon: fel lijf met dikke rand, glans, oogjes die
  // kunnen knipperen, lachje, wangetjes, knoopje met touwtje, en het getal
  // op de buik. Grotere getallen krijgen flair (kroontje, sterretjes).
  makeBalloon(val, x, y) {
    const c = this.add.container(x || 0, y || 0).setDepth(5);
    const lijf = this.add.container(0, 0);
    c.add(lijf);
    c.lijf = lijf;
    const R = this.cellW * 0.375;   // 30 bij cel 80
    const ry = R * 1.13;

    const g = this.add.graphics();
    lijf.add(g);

    // Touwtje + knoopje eerst (achter het lijf)
    g.lineStyle(2, 0x8d99ae, 1);
    g.beginPath();
    g.moveTo(0, ry + 2);
    g.lineTo(3, ry + 8);
    g.lineTo(-2, ry + 15);
    g.strokePath();

    if (val === RAINBOW) {
      // Regenboog-joker: gekleurde ringen + ster-oogjes
      REGENBOOG_KLEUREN.forEach((kleur, i) => {
        const f = 1 - i * 0.16;
        g.fillStyle(kleur, 1);
        g.fillEllipse(0, 0, R * 2 * f, ry * 2 * f);
      });
      g.lineStyle(3.5, 0x475569, 1);
      g.strokeEllipse(0, 0, R * 2, ry * 2);
      g.fillStyle(0x475569, 1);
      g.fillTriangle(-5, ry - 1, 5, ry - 1, 0, ry + 6);
      const sterL = this.add.image(-R * 0.34, -R * 0.14, 'star').setScale(1.4).setTint(0xfff7cc);
      const sterR = this.add.image(R * 0.34, -R * 0.14, 'star').setScale(1.4).setTint(0xfff7cc);
      lijf.add([sterL, sterR]);
      const mond = this.add.graphics();
      mond.lineStyle(2.5, 0x334155, 1);
      mond.beginPath();
      mond.arc(0, R * 0.14, R * 0.26, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160));
      mond.strokePath();
      lijf.add(mond);
      const label = this.add.text(0, R * 0.56, '✨', { fontSize: `${R * 0.5}px` }).setOrigin(0.5);
      lijf.add(label);
      c.knipperDelen = [];
      this.tweens.add({
        targets: [sterL, sterR], angle: 360, duration: 2600, repeat: -1,
      });
    } else {
      const [licht, donker] = tierKleur(val);
      const goud = val >= 1024;

      g.fillStyle(licht, 1);
      g.fillEllipse(0, 0, R * 2, ry * 2);
      g.lineStyle(goud ? 4 : 3.5, goud ? 0xd4a017 : donker, 1);
      g.strokeEllipse(0, 0, R * 2, ry * 2);

      // Knoopje
      g.fillStyle(goud ? 0xd4a017 : donker, 1);
      g.fillTriangle(-5, ry - 1, 5, ry - 1, 0, ry + 6);

      // Glans
      g.fillStyle(0xffffff, 0.35);
      g.fillEllipse(-R * 0.36, -R * 0.44, R * 0.5, R * 0.72);

      // Gezichtje
      const oogL = this.add.circle(-R * 0.34, -R * 0.16, R * 0.2, 0xffffff);
      const oogR = this.add.circle(R * 0.34, -R * 0.16, R * 0.2, 0xffffff);
      const pupL = this.add.circle(-R * 0.34, -R * 0.13, R * 0.095, 0x1e293b);
      const pupR = this.add.circle(R * 0.34, -R * 0.13, R * 0.095, 0x1e293b);
      const mond = this.add.graphics();
      mond.lineStyle(2.5, 0x1e293b, 1);
      mond.beginPath();
      mond.arc(0, R * 0.1, R * 0.24, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160));
      mond.strokePath();
      const wangL = this.add.circle(-R * 0.6, R * 0.08, R * 0.12, 0xf9a8d4, 0.55);
      const wangR = this.add.circle(R * 0.6, R * 0.08, R * 0.12, 0xf9a8d4, 0.55);
      lijf.add([oogL, oogR, pupL, pupR, mond, wangL, wangR]);
      c.knipperDelen = [oogL, oogR, pupL, pupR];

      // Het getal op de buik
      const cijfers = String(val).length;
      const maat = cijfers <= 2 ? R * 0.6 : cijfers === 3 ? R * 0.48 : R * 0.38;
      const label = this.add.text(0, R * 0.56, String(val), {
        fontFamily: 'Arial', fontStyle: 'bold', fontSize: `${maat}px`,
        color: '#ffffff', stroke: '#00000066', strokeThickness: 4,
      }).setOrigin(0.5);
      lijf.add(label);

      // Flair voor toppers
      if (val >= 64) {
        const kroon = this.add.graphics();
        kroon.fillStyle(0xfde047, 1);
        kroon.lineStyle(1.5, 0xca8a04, 1);
        kroon.beginPath();
        kroon.moveTo(-9, -ry + 3);
        kroon.lineTo(-9, -ry - 7);
        kroon.lineTo(-4.5, -ry - 1);
        kroon.lineTo(0, -ry - 9);
        kroon.lineTo(4.5, -ry - 1);
        kroon.lineTo(9, -ry - 7);
        kroon.lineTo(9, -ry + 3);
        kroon.closePath();
        kroon.fillPath();
        kroon.strokePath();
        lijf.add(kroon);
      }
      if (val >= 256) {
        for (let i = 0; i < 3; i++) {
          const hoek = -1.1 + i * 1.15;
          const ster = this.add.image(Math.cos(hoek) * R * 1.15, Math.sin(hoek) * ry * 1.05 - 4, 'star')
            .setScale(0.9).setTint(0xfff7cc);
          lijf.add(ster);
          this.tweens.add({
            targets: ster, alpha: 0.25, scale: 0.5,
            duration: 520 + i * 160, yoyo: true, repeat: -1,
          });
        }
      }
    }

    // Zacht wiegen — op het binnenlijf, zodat het nooit botst met
    // positie-tweens op de buitenste container.
    this.tweens.add({
      targets: lijf, angle: Phaser.Math.FloatBetween(1.2, 2.2),
      duration: Phaser.Math.Between(1300, 1900), yoyo: true, repeat: -1,
      ease: 'Sine.inOut', delay: Phaser.Math.Between(0, 700),
    });

    return c;
  }

  // Sprite netjes opruimen: eerst alle tweens eraf (ook die op het lijf)
  weg(spr) {
    if (!spr) return;
    this.tweens.killTweensOf(spr);
    if (spr.lijf) this.tweens.killTweensOf(spr.lijf);
    spr.destroy();
  }

  knipperRandom() {
    if (this.voorbij) return;
    const alle = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const spr = this.state.items[r][c];
        if (spr && spr.knipperDelen && spr.knipperDelen.length) alle.push(spr);
      }
    }
    if (this.hover && this.hover.knipperDelen && this.hover.knipperDelen.length) alle.push(this.hover);
    Phaser.Utils.Array.Shuffle(alle).slice(0, 2).forEach((spr) => {
      this.tweens.add({
        targets: spr.knipperDelen, scaleY: 0.12, duration: 70, yoyo: true,
      });
    });
  }

  // ------------------------------------------------------ hint & besturing

  buildHint() {
    this.kolomGlow = this.add.rectangle(
      0, this.boardTop + this.boardH / 2, this.cellW, this.boardH, 0xffffff, 0.12
    ).setDepth(2).setVisible(false);
    this.ghost = this.add.graphics().setDepth(2).setVisible(false);
    this.ghostVoor = null; // voor welke waarde de ghost getekend is
  }

  updateHint() {
    if (this.busy || this.prikModus || this.voorbij) {
      this.kolomGlow.setVisible(false);
      this.ghost.setVisible(false);
      return;
    }
    this.kolomGlow.setVisible(true);
    this.kolomGlow.x = this.cellX(this.hoverCol);
    const row = this.findRow(this.hoverCol);
    if (row === -1) {
      this.ghost.setVisible(false);
      return;
    }
    if (this.ghostVoor !== this.huidigeVal) {
      const kleur = this.huidigeVal === RAINBOW ? 0xffffff : tierKleur(this.huidigeVal)[0];
      const R = this.cellW * 0.375;
      this.ghost.clear();
      this.ghost.fillStyle(kleur, 0.2);
      this.ghost.fillEllipse(0, 0, R * 2, R * 2.26);
      this.ghost.lineStyle(2, kleur, 0.55);
      this.ghost.strokeEllipse(0, 0, R * 2, R * 2.26);
      this.ghostVoor = this.huidigeVal;
    }
    this.ghost.setPosition(this.cellX(this.hoverCol), this.cellY(row)).setVisible(true);
  }

  zetHoverKolom(px) {
    this.hoverCol = Phaser.Math.Clamp(Math.floor(px / this.cellW), 0, COLS - 1);
    if (this.hover) this.hover.x = this.cellX(this.hoverCol);
    this.updateHint();
  }

  opTik(p) {
    if (this.busy || this.voorbij) return;
    if (p.y < this.topH) return; // HUD heeft eigen knoppen

    if (this.prikModus) {
      this.prikOp(p);
      return;
    }
    this.zetHoverKolom(p.x);
    this.dragging = true;
  }

  togglePrik() {
    if (this.busy || this.voorbij) return;
    if (this.prikLading <= 0) {
      Voice.cue('oops');
      this.tweens.add({ targets: this.prikTekst, x: '+=5', duration: 50, yoyo: true, repeat: 3 });
      return;
    }
    this.prikModus = !this.prikModus;
    SFX.click();
    this.updatePrikUI();
    this.updateHint();
  }

  prikOp(p) {
    const c = Math.floor(p.x / this.cellW);
    const r = Math.floor((p.y - this.boardTop) / this.cellW);
    this.prikModus = false;
    this.updatePrikUI();
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS || this.state.vals[r][c] === 0) {
      this.updateHint(); // niks geprikt: alleen de modus uit
      return;
    }
    // POP! Ballon weg, lading eraf, en de rest zakt (en merget misschien!)
    this.busy = true;
    this.prikLading--;
    this.updatePrikUI();
    const spr = this.state.items[r][c];
    this.state.vals[r][c] = 0;
    this.state.items[r][c] = null;
    this.state.lastDrop = null;
    if (spr) {
      this.tweens.killTweensOf(spr);
      this.tweens.add({
        targets: spr, scale: 1.4, alpha: 0, duration: 130,
        onComplete: () => this.weg(spr),
      });
    }
    this.burst(this.cellX(c), this.cellY(r), 0xffffff);
    SFX.pop();
    Voice.cue('pop');
    this.time.delayedCall(170, () => this.resolveStep());
  }

  // ------------------------------------------------------------ spelverloop

  cellX(col) { return col * this.cellW + this.cellW / 2; }
  cellY(row) { return this.boardTop + row * this.cellW + this.cellW / 2; }

  findRow(col) {
    for (let r = ROWS - 1; r >= 0; r--) if (this.state.vals[r][col] === 0) return r;
    return -1;
  }

  spawnHover() {
    // Nét onder het HUD-paneel zweven (erachter zou hij wegvallen tegen het wit)
    const hy = this.topH + 44;
    this.hover = this.makeBalloon(this.huidigeVal, this.cellX(this.hoverCol), hy);
    this.hover.setDepth(6);
    this.hoverBob = this.tweens.add({
      targets: this.hover, y: hy - 8,
      duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut',
    });
    this.updateHint();
  }

  drop(col) {
    const row = this.findRow(col);
    if (row === -1) {
      // Kolom vol: schud even nee
      this.tweens.add({ targets: this.hover, x: '+=6', duration: 55, yoyo: true, repeat: 3 });
      Voice.cue('oops');
      return;
    }
    this.busy = true;
    this.updateHint();

    const ball = this.hover;
    this.hoverBob.stop();
    this.hover = null;

    this.state.vals[row][col] = this.huidigeVal;
    this.state.items[row][col] = ball;
    this.state.lastDrop = { r: row, c: col };
    this.dropsSindsJoker++;

    // Wachtrij doorschuiven; genade-joker als het bord vol dreigt te raken
    this.huidigeVal = this.volgendeVal;
    if (this.huidigeVal !== RAINBOW && magRegenboog(this.state.vals, this.dropsSindsJoker)) {
      this.volgendeVal = RAINBOW;
      this.dropsSindsJoker = 0;
    } else {
      this.volgendeVal = kiesVolgende(this.highest);
    }
    this.updateVolgendePreview();

    SFX.pop();
    this.tweens.add({
      targets: ball,
      x: this.cellX(col),
      y: this.cellY(row),
      duration: 340,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        // Landings-squash: even indeuken en terugveren
        this.tweens.add({
          targets: ball, scaleX: 1.12, scaleY: 0.86, duration: 70, yoyo: true,
          onComplete: () => this.resolveStep(),
        });
      },
    });
  }

  // Eén stap van de ketting: zwaartekracht -> regenboog wakker maken ->
  // een groep versmelten -> opnieuw. Niets meer te doen? Dan afronden.
  resolveStep() {
    valOmlaag(this.state);
    this.syncSprites();

    const rb = activeerRegenboog(this.state.vals);
    if (rb) {
      this.wordRegenboogWakker(rb);
      this.time.delayedCall(260, () => this.resolveStep());
      return;
    }

    const groep = vindGroep(this.state.vals);
    if (groep) {
      this.doeMerge(groep);
      this.time.delayedCall(250, () => this.resolveStep());
      return;
    }

    // Ketting klaar
    this.state.lastDrop = null;
    if (this.combo >= 3) Voice.cue('laugh');
    this.combo = 0;
    for (let c = 0; c < COLS; c++) {
      if (this.state.vals[0][c] !== 0) { this.gameOver(); return; }
    }
    this.busy = false;
    this.spawnHover();
  }

  // De regenboog-joker neemt de (hoogste) buurwaarde aan
  wordRegenboogWakker({ r, c, val }) {
    const oud = this.state.items[r][c];
    this.weg(oud);
    this.state.vals[r][c] = val;
    const nieuw = this.makeBalloon(val, this.cellX(c), this.cellY(r));
    nieuw.setScale(0.5);
    this.state.items[r][c] = nieuw;
    this.state.lastDrop = { r, c };
    this.tweens.add({ targets: nieuw, scale: 1, duration: 220, ease: 'Back.easeOut' });
    this.burst(this.cellX(c), this.cellY(r), 0xffffff);
    SFX.sparkle();
    Voice.cue('star');
  }

  doeMerge({ cells, val }) {
    this.combo++;

    // Doelcel: liefst de plek van je laatste actie, anders laagste/rechtse
    let target = null;
    if (this.state.lastDrop) {
      target = cells.find(([r, c]) => r === this.state.lastDrop.r && c === this.state.lastDrop.c) || null;
    }
    if (!target) {
      target = cells[0];
      for (const [r, c] of cells) {
        if (r > target[0] || (r === target[0] && c > target[1])) target = [r, c];
      }
    }
    const [trow, tcol] = target;
    const tx = this.cellX(tcol), ty = this.cellY(trow);
    this.state.lastDrop = { r: trow, c: tcol };

    const nv = mergeWaarde(val, cells.length);

    // De rest vliegt naar het doel toe
    cells.forEach(([r, c]) => {
      if (r === trow && c === tcol) return;
      const spr = this.state.items[r][c];
      this.state.vals[r][c] = 0;
      this.state.items[r][c] = null;
      if (spr) {
        this.tweens.killTweensOf(spr);
        this.tweens.add({
          targets: spr, x: tx, y: ty, scale: 0.15, angle: Phaser.Math.Between(-40, 40),
          duration: 170, ease: 'Quad.easeIn',
          onComplete: () => this.weg(spr),
        });
      }
    });

    // En het doel wordt de nieuwe, grotere ballon
    this.weg(this.state.items[trow][tcol]);
    this.state.vals[trow][tcol] = nv;
    const nieuw = this.makeBalloon(nv, tx, ty);
    nieuw.setScale(0.55);
    this.state.items[trow][tcol] = nieuw;
    this.tweens.add({ targets: nieuw, scale: 1, duration: 230, ease: 'Back.easeOut' });

    this.burst(tx, ty, tierKleur(nv)[0]);
    SFX.merge(nv);

    this.score += nv;
    this.scoreText.setText(this.score.toLocaleString('nl-NL'));

    // Combo-feestje bij kettingen
    if (this.combo >= 2) {
      const ct = this.add.text(tx, ty - 52, `Combo x${this.combo}! ✨`, {
        fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold',
        color: '#d97706', stroke: '#ffffff', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(150);
      this.tweens.add({
        targets: ct, y: ty - 92, alpha: 0, duration: 750,
        onComplete: () => ct.destroy(),
      });
      SFX.giggle();
    }

    // Nieuwe record-ballon? Groot feest!
    if (nv > this.highest) {
      this.highest = nv;
      this.vierNieuwRecord(nv);
    }

    // Grote merges laden de prik-knop weer op
    if (verdienPrik(nv) && this.prikLading < PRIK_MAX) {
      this.prikLading++;
      this.updatePrikUI();
      const pip = this.prikPips[this.prikLading - 1];
      this.tweens.add({ targets: pip, scale: 1.8, duration: 160, yoyo: true });
      SFX.coin();
    }

    if (nv >= 512) giveMedal('balloon_512');
    if (nv >= 2048) giveMedal('balloon_2048');
  }

  vierNieuwRecord(nv) {
    const { width } = this.scale;
    const [licht] = tierKleur(nv);
    const kleurHex = '#' + licht.toString(16).padStart(6, '0');
    const t = this.add.text(width / 2, 330, `${nv}!`, {
      fontFamily: 'Arial', fontSize: '68px', fontStyle: 'bold',
      color: kleurHex, stroke: '#ffffff', strokeThickness: 10,
    }).setOrigin(0.5).setScale(0.2).setDepth(150);
    this.tweens.add({
      targets: t, scale: 1.1, duration: 260, ease: 'Back.easeOut',
      onComplete: () => this.tweens.add({
        targets: t, y: 270, alpha: 0, duration: 600, delay: 350,
        onComplete: () => t.destroy(),
      }),
    });
    if (nv >= 64) {
      Voice.cue('cheer');
      this.cameras.main.shake(150, 0.004);
      confettiBurst(this, 140);
    } else {
      Voice.cue('great');
    }
  }

  // Schuif elke sprite naar de plek die zijn datamodel-cel aangeeft
  syncSprites() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const spr = this.state.items[r][c];
        if (spr) {
          const tx = this.cellX(c), ty = this.cellY(r);
          if (Math.abs(spr.x - tx) > 0.5 || Math.abs(spr.y - ty) > 0.5) {
            if (spr.syncTween && spr.syncTween.isPlaying()) spr.syncTween.stop();
            spr.syncTween = this.tweens.add({
              targets: spr, x: tx, y: ty, duration: 150, ease: 'Quad.easeIn',
            });
          }
        }
      }
    }
  }

  burst(x, y, color) {
    const particles = this.add.particles(x, y, 'star', {
      speed: { min: 50, max: 200 },
      scale: { start: 1.4, end: 0 },
      lifespan: 450, quantity: 12, tint: color, blendMode: 'ADD',
    }).setDepth(90);
    this.time.delayedCall(500, () => particles.destroy());
  }

  update(time, delta) {
    // Wolken drijven traag voorbij
    if (!this.wolken) return;
    const { width } = this.scale;
    for (const w of this.wolken) {
      w.x += (w.snelheid * delta) / 1000;
      if (w.x > width + 90) {
        w.x = -90;
        w.y = Phaser.Math.Between(115, 520);
      }
    }
  }

  // -------------------------------------------------------- zachte afloop

  gameOver() {
    this.voorbij = true;
    this.busy = true;
    this.prikModus = false;
    this.updatePrikUI();
    this.updateHint();

    const { width, height } = this.scale;
    const isRecord = saveHigh('balloon', this.score);
    const record = getHigh('balloon');
    const sterren = sterrenVoorScore(this.score);
    addStars(sterren);

    // Alle ballonnen zweven vrolijk weg — geen harde game-over
    SFX.win();
    Voice.cue('cheer');
    let i = 0;
    const laatZweven = (spr) => {
      if (!spr) return;
      this.tweens.killTweensOf(spr);
      this.tweens.add({
        targets: spr,
        y: -120 - Phaser.Math.Between(0, 160),
        x: spr.x + Phaser.Math.Between(-70, 70),
        angle: Phaser.Math.Between(-24, 24),
        duration: 1100 + Phaser.Math.Between(0, 500),
        delay: i * 35,
        ease: 'Sine.easeIn',
      });
      i++;
    };
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) laatZweven(this.state.items[r][c]);
    }
    laatZweven(this.hover);
    confettiBurst(this, 210);

    this.time.delayedCall(850, () => {
      const D = 200;
      this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0.3).setDepth(D);
      const kaart = this.add.graphics().setDepth(D + 1);
      kaart.fillStyle(0xffffff, 0.97);
      kaart.fillRoundedRect(50, 180, width - 100, 420, 26);
      kaart.lineStyle(3, 0xbfdbfe, 1);
      kaart.strokeRoundedRect(50, 180, width - 100, 420, 26);

      const cx = width / 2;
      this.add.text(cx, 226, '🎈', { fontSize: '46px' }).setOrigin(0.5).setDepth(D + 2);
      this.add.text(cx, 282, 'Wat een ballonnen-feest!', {
        fontFamily: 'Arial', fontSize: '25px', fontStyle: 'bold', color: '#1e293b',
      }).setOrigin(0.5).setDepth(D + 2);

      this.add.text(cx, 326, `Score: ${this.score.toLocaleString('nl-NL')}`, {
        fontFamily: 'Arial', fontSize: '21px', color: '#475569',
      }).setOrigin(0.5).setDepth(D + 2);
      this.add.text(cx, 358, isRecord ? '🌟 Nieuw record! 🌟' : `Record: ${record.toLocaleString('nl-NL')}`, {
        fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold',
        color: isRecord ? '#d97706' : '#94a3b8',
      }).setOrigin(0.5).setDepth(D + 2);

      // Je grootste ballon verdient een ereplekje
      this.add.text(cx, 398, 'Grootste ballon:', {
        fontFamily: 'Arial', fontSize: '14px', color: '#64748b',
      }).setOrigin(0.5).setDepth(D + 2);
      const topBallon = this.makeBalloon(this.highest, cx, 448).setScale(0.85).setDepth(D + 2);
      this.tweens.add({ targets: topBallon, scale: 0.95, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

      this.add.text(cx, 500, `+${sterren} ⭐`, {
        fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', color: '#d97706',
      }).setOrigin(0.5).setDepth(D + 2);

      const opnieuw = this.add.text(cx, 552, 'Nog een keer 🎈', {
        fontFamily: 'Arial', fontSize: '21px', fontStyle: 'bold',
        color: '#1a1a2e', backgroundColor: '#fbbf24', padding: { x: 24, y: 12 },
      }).setOrigin(0.5).setDepth(D + 3).setInteractive({ useHandCursor: true });
      opnieuw.on('pointerdown', () => this.scene.restart());

      const menu = this.add.text(cx, 620, '🏠 Menu', {
        fontFamily: 'Arial', fontSize: '16px', color: '#64748b',
        backgroundColor: '#f1f5f9', padding: { x: 16, y: 8 },
      }).setOrigin(0.5).setDepth(D + 3).setInteractive({ useHandCursor: true });
      menu.on('pointerdown', () => this.scene.start('Menu'));
    });
  }
}
