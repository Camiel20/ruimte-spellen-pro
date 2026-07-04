import Phaser from 'phaser';
import { SFX } from '../sound.js';
import { Voice } from '../voice.js';
import { getSetting, setSetting, addStars, giveMedal, hasMedal } from '../progress.js';
import { confettiBurst } from '../reward.js';
import { maakNul, INKT } from '../theme.js';
import {
  maakSom, maakNulSom, maakAfleiders, nieuweLadder, ladderGoed, ladderFout,
  metersVoorGoed, TURBO_MS, nieuweBestemmingen, volgendeBestemming,
  sterrenVoorVlucht, SOMMEN_PER_VLUCHT, NULPLANEET_NODIG,
} from '../rekenLogic.js';

// Reken-Raket — sommen zijn brandstof. Elk goed antwoord stuwt de raket
// hoger, van het gras tot voorbij de melkweg. Antwoorden kies je niet met
// een knop maar door er met je raket doorheen te vliegen.
//
// De spellogica (leerlijn, adaptieve ladder, afleiders, beloningen) leeft in
// src/rekenLogic.js en is met vitest getest (tests/reken.test.js). Deze scene
// is het plaatje: zones, planeten met gezichtjes, de raket met Nul als
// copiloot, en alle feestjes eromheen.

const LANES = [80, 240, 400];
const SIG = [0xe8402c, 0xf08a24, 0xf6c624, 0x57b947, 0x38b6cf, 0xec6aa9, 0x9b6dd6, 0x6b7b8a, 0x4f63c9, 0xe34da0];
const PLANEET_KLEUREN = [
  [0x14b8a6, 0x0c7568], [0xf08a24, 0xa85a10], [0xec6aa9, 0xa93c72],
  [0x9b6dd6, 0x67419a], [0x57b947, 0x35772b], [0x4f63c9, 0x32408f],
];

// Zones: hoe hoger je totaal, hoe dieper je de ruimte in klimt.
const ZONES = [
  { tot: 400, boven: 0x8fd7f7, onder: 0xd9f0fd, sterren: 0, wolken: 0.85 },
  { tot: 1500, boven: 0x5b9fe0, onder: 0xa8d4f5, sterren: 0, wolken: 0.6 },
  { tot: 3000, boven: 0x3b5bbf, onder: 0x7fa8e0, sterren: 0.4, wolken: 0.3 },
  { tot: 6000, boven: 0x1e2a6e, onder: 0x3b5bbf, sterren: 0.75, wolken: 0 },
  { tot: Infinity, boven: 0x17103f, onder: 0x4a2b8e, sterren: 1, wolken: 0 },
];

export default class MathScene extends Phaser.Scene {
  constructor() { super('Math'); }

  init(data) {
    this.nulPlaneetVlucht = !!(data && data.nulPlaneet);
  }

  create() {
    this.hoogteTotaal = getSetting('rekenHoogte') || 0;
    this.nullen = getSetting('rekenNullen') || 0;
    this.mastery = getSetting('rekenMastery') || {};
    this.ladder = nieuweLadder(getSetting('rekenNiveau') || 1);

    this.vluchtMeters = 0;
    this.somIndex = 0;
    this.vluchtFouten = 0;
    this.nullenDezeVlucht = 0;
    this.busy = false;
    this.voorbij = false;
    this.raketLane = 1;

    this.buildAchtergrond();
    this.buildRaket();
    this.buildHud();

    this.time.addEvent({ delay: 2600, loop: true, callback: () => this.knipper() });
    this.cameras.main.fadeIn(300, 191, 227, 251);
    this.nieuweSom();
  }

  // ------------------------------------------------------------ decor

  huidigeZone() {
    if (this.nulPlaneetVlucht) {
      return this.nulZone || (this.nulZone = { boven: 0x2a1b5e, onder: 0x6b21a8, sterren: 1, wolken: 0 });
    }
    const h = this.hoogteTotaal + this.vluchtMeters;
    return ZONES.find((z) => h < z.tot) || ZONES[ZONES.length - 1];
  }

  buildAchtergrond() {
    const { width, height } = this.scale;
    this.bg = this.add.graphics().setDepth(0);

    // Sterren (zichtbaar in hogere zones)
    this.sterrenDeco = [];
    for (let i = 0; i < 40; i++) {
      const s = this.add.image(
        Phaser.Math.Between(10, width - 10), Phaser.Math.Between(10, height - 10), 'star'
      ).setDepth(1).setAlpha(0);
      s.basisAlpha = Phaser.Math.FloatBetween(0.4, 1);
      this.tweens.add({
        targets: s, scale: { from: 0.7, to: 1.2 },
        duration: Phaser.Math.Between(900, 1900), yoyo: true, repeat: -1,
      });
      this.sterrenDeco.push(s);
    }

    // Wolken
    this.wolken = [];
    for (let i = 0; i < 4; i++) {
      const c = this.add.container(
        Phaser.Math.Between(30, width - 30), Phaser.Math.Between(200, height - 120)
      ).setDepth(1);
      [[0, 0, 30, 16], [24, -6, 22, 15], [-24, 4, 20, 13]].forEach(([dx, dy, rx, ry]) => {
        c.add(this.add.ellipse(dx, dy, rx * 2, ry * 2, 0xffffff));
      });
      this.wolken.push(c);
    }
    this.tekenZone();
  }

  tekenZone() {
    const { width, height } = this.scale;
    const z = this.huidigeZone();
    this.bg.clear();
    this.bg.fillGradientStyle(z.boven, z.boven, z.onder, z.onder, 1);
    this.bg.fillRect(0, 0, width, height);
    this.sterrenDeco.forEach((s) => s.setAlpha(s.basisAlpha * z.sterren));
    this.wolken.forEach((w) => w.setAlpha(z.wolken));
    this.laatsteZone = z;
  }

  // ------------------------------------------------------------ raket

  buildRaket() {
    const c = this.add.container(LANES[this.raketLane], 600).setDepth(10);

    const vlam = this.add.graphics();
    vlam.fillStyle(0xf08a24, 1);
    vlam.fillTriangle(-10, 30, 0, 62, 10, 30);
    vlam.fillStyle(0xfde047, 1);
    vlam.fillTriangle(-5, 30, 0, 48, 5, 30);
    vlam.setPosition(0, 2);
    c.add(vlam);
    this.vlam = vlam;
    this.tweens.add({
      targets: vlam, scaleY: { from: 0.85, to: 1.15 }, scaleX: { from: 1, to: 0.9 },
      duration: 140, yoyo: true, repeat: -1,
    });

    const g = this.add.graphics();
    g.fillStyle(0xe8402c, 1);
    g.fillTriangle(0, -66, 18, -30, -18, -30);
    g.fillStyle(0xf1f5f9, 1);
    g.fillRoundedRect(-18, -34, 36, 66, 12);
    g.lineStyle(3, 0x64748b, 1);
    g.strokeRoundedRect(-18, -34, 36, 66, 12);
    g.fillStyle(0xe8402c, 1);
    g.fillTriangle(-18, 12, -34, 36, -18, 28);
    g.fillTriangle(18, 12, 34, 36, 18, 28);
    c.add(g);

    // Raampje met Nul als copiloot
    const raam = this.add.circle(0, -8, 15, 0xbae6fd).setStrokeStyle(3, 0x64748b);
    c.add(raam);
    const nul = maakNul(this, 0, -8, 10);
    nul.arm.setVisible(false);
    c.add(nul);
    this.nulCopiloot = nul;

    this.raket = c;
    this.tweens.add({ targets: c, y: 594, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  // ------------------------------------------------------------ HUD

  buildHud() {
    const { width } = this.scale;
    const D = 100;

    // Som-kaart bovenin
    const kaart = this.add.graphics().setDepth(D);
    kaart.fillStyle(0xffffff, 0.94);
    kaart.fillRoundedRect(14, 10, width - 28, 122, 20);
    kaart.lineStyle(3, 0xbcd9ee, 1);
    kaart.strokeRoundedRect(14, 10, width - 28, 122, 20);

    this.somTekst = this.add.text(width / 2, 52, '', {
      fontFamily: 'Arial Black, Arial', fontSize: '40px', fontStyle: 'bold', color: '#1f2d3a',
    }).setOrigin(0.5).setDepth(D + 1);

    // Numberblocks-blokjes als steuntje onder de som
    this.torens = this.add.container(width / 2, 116).setDepth(D + 1);

    // Voortgang: 10 bolletjes
    this.bolletjes = [];
    for (let i = 0; i < SOMMEN_PER_VLUCHT; i++) {
      const b = this.add.circle(width / 2 - (SOMMEN_PER_VLUCHT - 1) * 9 + i * 18, 118, 5, 0xe2e8f0)
        .setStrokeStyle(1.5, 0x94a3b8).setDepth(D + 2);
      this.bolletjes.push(b);
    }

    // Terug-knopje in de kaart-hoek
    const terug = this.add.circle(40, 36, 17, 0xf1f5f9).setDepth(D + 2)
      .setStrokeStyle(2, 0xcbd5e1).setInteractive({ useHandCursor: true });
    this.add.text(40, 35, '⬅', { fontSize: '15px' }).setOrigin(0.5).setDepth(D + 3);
    terug.on('pointerdown', () => {
      if (!this.voorbij) { SFX.click(); this.bewaar(); this.scene.start('Menu'); }
    });

    // Hoogte-chip (alle nullen voluit!) en gouden-nullen-chip
    this.hoogteChip = this.add.text(20, 146, '', {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#1f2d3a',
      backgroundColor: '#ffffffcc', padding: { x: 12, y: 6 },
    }).setDepth(D);
    this.nullenChip = this.add.text(width - 20, 146, '', {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#b45309',
      backgroundColor: '#ffffffcc', padding: { x: 12, y: 6 },
    }).setOrigin(1, 0).setDepth(D);
    this.updateChips();
  }

  updateChips() {
    const h = this.hoogteTotaal + this.vluchtMeters;
    this.hoogteChip.setText(`⬆ ${h.toLocaleString('nl-NL')} m`);
    this.nullenChip.setText(`⭕ ×${this.nullen}`);
  }

  // Numberblocks-torentjes: kolommen van max 5 blokjes per getal.
  tekenToren(container, waarde, kleur, xOffset) {
    const B = 13;
    const kolommen = Math.ceil(waarde / 5);
    for (let i = 0; i < waarde; i++) {
      const kol = Math.floor(i / 5);
      const rij = i % 5;
      const blok = this.add.rectangle(
        xOffset + kol * (B + 2) - ((kolommen - 1) * (B + 2)) / 2,
        -rij * (B + 1),
        B, B, kleur
      ).setStrokeStyle(1.5, INKT);
      container.add(blok);
    }
  }

  updateTorens(som) {
    this.torens.removeAll(true);
    const geleerd = (this.mastery[this.ladder.niveau] || 0) >= 6;
    const hulp = (!geleerd || this.somFouten > 0) &&
      som.a <= 20 && som.b <= 20 && som.b > 0 && !this.nulPlaneetVlucht;
    if (!hulp) {
      this.torens.setVisible(false);
      this.toonBolletjes();
      return;
    }
    this.torens.setVisible(true).setAlpha(0);
    this.tekenToren(this.torens, som.a, SIG[(som.a - 1) % 10], -55);
    this.torens.add(this.add.text(0, -18, som.op, {
      fontFamily: 'Arial', fontSize: '22px', fontStyle: 'bold', color: '#5b7083',
    }).setOrigin(0.5));
    this.tekenToren(this.torens, som.b, SIG[(som.b - 1) % 10], 55);
    this.tweens.add({ targets: this.torens, alpha: 1, duration: 250 });
    // de bolletjes staan op dezelfde plek; even verstoppen
    this.bolletjes.forEach((b) => b.setVisible(false));
  }

  toonBolletjes() {
    this.bolletjes.forEach((b, i) => {
      b.setVisible(true);
      b.setFillStyle(i < this.somIndex ? 0x57b947 : 0xe2e8f0);
    });
  }

  // ------------------------------------------------------------ sommen

  nieuweSom() {
    if (this.voorbij) return;
    this.busy = false;
    this.somFouten = 0;

    const niveau = this.nulPlaneetVlucht ? 7 : this.ladder.niveau;
    const magNul = !this.nulPlaneetVlucht && this.nullenDezeVlucht < 2 && Math.random() < 0.18;
    this.som = magNul ? maakNulSom(niveau) : maakSom(niveau);

    this.somTekst.setFontSize(this.som.a >= 1000 || this.som.b >= 1000 ? 30 : 40);
    this.somTekst.setText(
      `${this.som.a.toLocaleString('nl-NL')} ${this.som.op} ${this.som.b.toLocaleString('nl-NL')} = ?`
    );

    this.updateTorens(this.som);

    // Antwoorden husselen over de drie banen
    const [w1, w2] = maakAfleiders(this.som.antwoord);
    const waarden = Phaser.Utils.Array.Shuffle([this.som.antwoord, w1, w2]);
    this.antwoordLane = waarden.indexOf(this.som.antwoord);

    const kleuren = Phaser.Utils.Array.Shuffle([...PLANEET_KLEUREN]).slice(0, 3);
    this.planeten = waarden.map((w, lane) => this.maakPlaneet(w, lane, kleuren[lane]));
    this.somStart = this.time.now;
  }

  maakPlaneet(waarde, lane, [licht, donker]) {
    const c = this.add.container(LANES[lane], -80).setDepth(5);
    const r = 46;

    const g = this.add.graphics();
    if (Math.random() < 0.3) { // af en toe een saturnus-ringetje
      g.lineStyle(6, donker, 0.55);
      g.strokeEllipse(0, 6, r * 1.5, r * 0.4);
    }
    g.fillStyle(licht, 1);
    g.fillCircle(0, 0, r);
    g.lineStyle(3.5, donker, 1);
    g.strokeCircle(0, 0, r);
    g.fillStyle(0xffffff, 0.3);
    g.fillEllipse(-r * 0.34, -r * 0.4, r * 0.5, r * 0.66);
    c.add(g);

    const oogL = this.add.circle(-14, -12, 7.5, 0xffffff);
    const oogR = this.add.circle(14, -12, 7.5, 0xffffff);
    const pupL = this.add.circle(-14, -11, 3.5, 0x1e293b);
    const pupR = this.add.circle(14, -11, 3.5, 0x1e293b);
    const mond = this.add.graphics();
    mond.lineStyle(2.5, 0x1e293b, 1);
    mond.beginPath();
    mond.arc(0, 4, 11, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160));
    mond.strokePath();
    const wangL = this.add.circle(-26, 3, 5.5, 0xf9a8d4, 0.6);
    const wangR = this.add.circle(26, 3, 5.5, 0xf9a8d4, 0.6);
    c.add([oogL, oogR, pupL, pupR, mond, wangL, wangR]);
    c.knipperDelen = [oogL, oogR, pupL, pupR];

    const cijfers = String(waarde).length;
    const maat = cijfers <= 2 ? 26 : cijfers === 3 ? 21 : cijfers === 4 ? 17 : 14;
    c.add(this.add.text(0, 26, waarde.toLocaleString('nl-NL'), {
      fontFamily: 'Arial', fontStyle: 'bold', fontSize: `${maat}px`,
      color: '#ffffff', stroke: '#00000066', strokeThickness: 4,
    }).setOrigin(0.5));

    c.lane = lane;
    c.setSize(r * 2.4, r * 2.4);
    c.setInteractive({ useHandCursor: true });
    c.on('pointerdown', () => this.kies(lane));

    this.tweens.add({ targets: c, y: 330, duration: 480, ease: 'Back.easeOut', delay: lane * 90 });
    this.tweens.add({
      targets: c, angle: Phaser.Math.FloatBetween(1.5, 2.5),
      duration: Phaser.Math.Between(1400, 2000),
      yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: Phaser.Math.Between(0, 600),
    });
    return c;
  }

  knipper() {
    if (this.voorbij) return;
    if (this.nulCopiloot) this.nulCopiloot.knipper();
    const alle = (this.planeten || []).filter((p) => p && p.knipperDelen);
    Phaser.Utils.Array.Shuffle(alle).slice(0, 1).forEach((p) => {
      this.tweens.add({ targets: p.knipperDelen, scaleY: 0.12, duration: 70, yoyo: true });
    });
  }

  kies(lane) {
    if (this.busy || this.voorbij) return;
    this.busy = true;
    // Eerst zwenkt de raket naar de gekozen baan
    this.raketLane = lane;
    this.tweens.add({
      targets: this.raket, x: LANES[lane], duration: 180, ease: 'Quad.easeOut',
      onComplete: () => {
        if (lane === this.antwoordLane) this.goed();
        else this.fout(lane);
      },
    });
  }

  goed() {
    const turbo = this.time.now - this.somStart < TURBO_MS;
    const niveau = this.nulPlaneetVlucht ? 7 : this.ladder.niveau;
    const meters = metersVoorGoed(niveau, turbo);
    const oudeZone = this.laatsteZone;

    this.mastery[niveau] = (this.mastery[niveau] || 0) + 1;
    if (!this.nulPlaneetVlucht) this.ladder = ladderGoed(this.ladder);

    const doel = this.planeten[this.antwoordLane];
    SFX.grow(this.somIndex + 1);
    Voice.cue(this.somIndex >= SOMMEN_PER_VLUCHT - 1 ? 'cheer' : 'great');

    // De juiste planeet knalt in confetti, de rest zakt weg (wij stijgen!)
    this.burst(doel.x, doel.y);
    this.tweens.killTweensOf(doel);
    this.tweens.add({ targets: doel, scale: 1.35, alpha: 0, duration: 240, onComplete: () => doel.destroy() });
    this.planeten.forEach((p, i) => {
      if (i === this.antwoordLane || !p) return;
      this.tweens.killTweensOf(p);
      this.tweens.add({
        targets: p, y: '+=560', alpha: 0.4, duration: 620, ease: 'Quad.easeIn',
        onComplete: () => p.destroy(),
      });
    });
    this.planeten = null;

    // Vlam groot + wolken scrollen omlaag
    this.tweens.add({ targets: this.vlam, scaleX: 1.7, scaleY: 1.9, duration: 220, yoyo: true });
    this.wolken.forEach((w) => {
      this.tweens.add({
        targets: w, y: `+=${Phaser.Math.Between(120, 220)}`, duration: 650, ease: 'Sine.inOut',
        onComplete: () => { if (w.y > 820) { w.y = -60; w.x = Phaser.Math.Between(30, 450); } },
      });
    });
    if (turbo) {
      this.callout('⚡ TURBO!', '#d97706', this.raket.x, 500, 22);
      this.cameras.main.shake(120, 0.003);
    }

    // Hoogte-teller tikt op
    const van = this.vluchtMeters;
    this.vluchtMeters += meters;
    this.tweens.addCounter({
      from: van, to: this.vluchtMeters, duration: 600,
      onUpdate: (tw) => {
        const h = this.hoogteTotaal + Math.round(tw.getValue());
        this.hoogteChip.setText(`⬆ ${h.toLocaleString('nl-NL')} m`);
      },
    });

    // Gouden nul verdiend?
    if (this.som.isNulSom) {
      this.nullen += 1;
      this.nullenDezeVlucht += 1;
      const ring = this.add.circle(doel.x, doel.y, 18).setStrokeStyle(7, 0xfbbf24).setDepth(150);
      this.tweens.add({
        targets: ring, x: this.scale.width - 60, y: 156, scale: 0.5, duration: 700, ease: 'Quad.easeIn',
        onComplete: () => {
          ring.destroy();
          this.updateChips();
          this.tweens.add({ targets: this.nullenChip, scale: 1.25, duration: 140, yoyo: true });
        },
      });
      SFX.sparkle();
      Voice.cue('star');
      this.callout('GOUDEN NUL! ⭕', '#b45309', this.scale.width / 2, 240, 24);
      if (this.nullen === NULPLANEET_NODIG) {
        this.time.delayedCall(800, () => {
          this.callout('⭕ DE NUL-PLANEET IS OPEN! 🪐', '#7c3aed', this.scale.width / 2, 330, 22);
          confettiBurst(this, 160);
          Voice.cue('cheer');
        });
      }
    }

    // Nul de copiloot doet een blij wiebeltje
    this.tweens.add({
      targets: this.nulCopiloot, angle: { from: -10, to: 10 }, duration: 90, yoyo: true, repeat: 2,
      onComplete: () => this.nulCopiloot.setAngle(0),
    });

    this.somIndex += 1;
    this.time.delayedCall(700, () => {
      if (this.huidigeZone() !== oudeZone) {
        this.tekenZone();
        this.cameras.main.flash(260, 255, 255, 255);
      }
      if (this.somIndex >= SOMMEN_PER_VLUCHT) this.landing();
      else this.nieuweSom();
    });
  }

  fout(lane) {
    this.somFouten += 1;
    this.vluchtFouten += 1;
    if (!this.nulPlaneetVlucht) this.ladder = ladderFout(this.ladder);

    const p = this.planeten[lane];
    Voice.cue('oops');
    // De planeet schudt "nee" en dooft; de som blijft gewoon staan
    this.tweens.add({ targets: p, x: '+=7', duration: 55, yoyo: true, repeat: 3 });
    this.tweens.add({ targets: p, alpha: 0.35, duration: 250, delay: 240 });
    p.disableInteractive();

    // De raket stuitert zachtjes; Nul schrikt even
    this.tweens.add({ targets: this.raket, y: '+=14', duration: 130, yoyo: true, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: this.nulCopiloot, x: '+=3', duration: 60, yoyo: true, repeat: 3 });

    // Tweede misser: blokjes-hint + het goede antwoord pulseert zachtjes
    if (this.somFouten >= 2) {
      this.updateTorens(this.som);
      const doel = this.planeten[this.antwoordLane];
      if (doel) {
        this.tweens.add({ targets: doel, scale: { from: 1, to: 1.12 }, duration: 420, yoyo: true, repeat: -1 });
      }
    }
    this.busy = false;
  }

  callout(tekst, kleur, x, y, maat = 26) {
    const t = this.add.text(x, y, tekst, {
      fontFamily: 'Arial Black, Arial', fontSize: `${maat}px`, fontStyle: 'bold',
      color: kleur, stroke: '#ffffff', strokeThickness: 6,
    }).setOrigin(0.5).setScale(0.3).setDepth(150);
    this.tweens.add({
      targets: t, scale: 1, duration: 240, ease: 'Back.easeOut',
      onComplete: () => this.tweens.add({
        targets: t, y: y - 40, alpha: 0, duration: 600, delay: 500, onComplete: () => t.destroy(),
      }),
    });
  }

  burst(x, y) {
    const p = this.add.particles(x, y, 'star', {
      speed: { min: 60, max: 220 }, scale: { start: 1.4, end: 0 },
      lifespan: 450, quantity: 14,
      tint: [0xfbbf24, 0xf87171, 0x4ade80, 0x60a5fa], blendMode: 'ADD',
    }).setDepth(90);
    this.time.delayedCall(500, () => p.destroy());
  }

  bewaar() {
    setSetting('rekenNiveau', this.ladder.niveau);
    setSetting('rekenMastery', this.mastery);
    setSetting('rekenNullen', this.nullen);
    setSetting('rekenHoogte', this.hoogteTotaal + this.vluchtMeters);
  }

  // ------------------------------------------------------------ landing

  landing() {
    this.voorbij = true;
    this.busy = true;
    const { width } = this.scale;

    const oudeHoogte = this.hoogteTotaal;
    this.hoogteTotaal += this.vluchtMeters;
    this.vluchtMeters = 0;
    const sterren = sterrenVoorVlucht(this.vluchtFouten);
    addStars(sterren);
    this.bewaar();

    // Nieuwe bestemmingen bereikt? (de oude medailles blijven verdienbaar)
    const nieuw = nieuweBestemmingen(oudeHoogte, this.hoogteTotaal);
    let medailleNieuw = false;
    nieuw.forEach((b) => { if (b.medal) medailleNieuw = giveMedal(b.medal) || medailleNieuw; });
    if (this.nulPlaneetVlucht) medailleNieuw = giveMedal('reken_nul') || medailleNieuw;

    SFX.fanfare();
    Voice.cue('cheer');
    confettiBurst(this, 210);

    this.time.delayedCall(500, () => {
      const D = 200;
      this.add.rectangle(width / 2, 400, width, 800, 0xffffff, 0.3).setDepth(D);
      const kaart = this.add.graphics().setDepth(D + 1);
      kaart.fillStyle(0xffffff, 0.97);
      kaart.fillRoundedRect(46, 190, width - 92, 430, 26);
      kaart.lineStyle(3, 0xbfdbfe, 1);
      kaart.strokeRoundedRect(46, 190, width - 92, 430, 26);

      const cx = width / 2;
      const top = nieuw[nieuw.length - 1];
      const titel = this.nulPlaneetVlucht ? 'De Nul-Planeet is van jou! ⭕'
        : top ? `Je bereikte ${top.naam}! ${top.icoon}` : 'Vlucht voltooid! 🚀';
      this.add.text(cx, 236, titel, {
        fontFamily: 'Arial Black, Arial', fontSize: '22px', fontStyle: 'bold', color: '#1f2d3a',
        align: 'center', wordWrap: { width: width - 130 },
      }).setOrigin(0.5).setDepth(D + 2);

      // Sterren-slots (1-3)
      for (let i = 0; i < 3; i++) {
        const st = this.add.image(cx - 52 + i * 52, 296, 'star').setDepth(D + 2).setScale(0.4);
        if (i >= sterren) st.setTint(0x94a3b8).setAlpha(0.5);
        this.tweens.add({
          targets: st, scale: i < sterren ? 4.2 : 3.0,
          delay: 250 + i * 200, duration: 300, ease: 'Back.out',
        });
      }

      this.add.text(cx, 352, `Deze vlucht: +${(this.hoogteTotaal - oudeHoogte).toLocaleString('nl-NL')} m`, {
        fontFamily: 'Arial', fontSize: '17px', color: '#475569',
      }).setOrigin(0.5).setDepth(D + 2);
      this.add.text(cx, 382, `Totale hoogte: ${this.hoogteTotaal.toLocaleString('nl-NL')} m`, {
        fontFamily: 'Arial', fontSize: '19px', fontStyle: 'bold', color: '#1f2d3a',
      }).setOrigin(0.5).setDepth(D + 2);

      const volgende = volgendeBestemming(this.hoogteTotaal);
      if (volgende) {
        this.add.text(cx, 414,
          `Nog ${(volgende.hoogte - this.hoogteTotaal).toLocaleString('nl-NL')} m naar ${volgende.naam} ${volgende.icoon}`, {
            fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#3b5a72',
          }).setOrigin(0.5).setDepth(D + 2);
      }
      if (medailleNieuw) {
        this.add.text(cx, 442, '🏅 Nieuwe medaille!', {
          fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#15803d',
        }).setOrigin(0.5).setDepth(D + 2);
      }

      const opnieuw = this.add.text(cx, 486, 'Nog een vlucht 🚀', {
        fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold',
        color: '#1a1a2e', backgroundColor: '#fbbf24', padding: { x: 24, y: 12 },
      }).setOrigin(0.5).setDepth(D + 3).setInteractive({ useHandCursor: true });
      opnieuw.on('pointerdown', () => { SFX.click(); this.scene.restart({ nulPlaneet: false }); });

      if (this.nullen >= NULPLANEET_NODIG && !this.nulPlaneetVlucht) {
        const np = this.add.text(cx, 542, hasMedal('reken_nul') ? '⭕ Nul-Planeet 🪐' : '⭕ Naar de NUL-PLANEET! 🪐', {
          fontFamily: 'Arial', fontSize: '17px', fontStyle: 'bold',
          color: '#ffffff', backgroundColor: '#7c3aed', padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setDepth(D + 3).setInteractive({ useHandCursor: true });
        np.on('pointerdown', () => { SFX.click(); this.scene.restart({ nulPlaneet: true }); });
        this.tweens.add({ targets: np, scale: 1.05, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      }

      const menu = this.add.text(cx, 592, '🏠 Menu', {
        fontFamily: 'Arial', fontSize: '15px', color: '#64748b',
        backgroundColor: '#f1f5f9', padding: { x: 16, y: 8 },
      }).setOrigin(0.5).setDepth(D + 3).setInteractive({ useHandCursor: true });
      menu.on('pointerdown', () => { SFX.click(); this.scene.start('Menu'); });
    });
  }
}
