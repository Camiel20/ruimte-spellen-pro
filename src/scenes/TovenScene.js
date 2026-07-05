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
    this.time.addEvent({ delay: 3200, loop: true, callback: () => { if (!this.bezig) this.nulHelper.knipper(); } });

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
    const g = this.add.graphics().setDepth(0);
    // warme tovenaars-sfeer: paars-bruin met een gloed
    g.fillStyle(0x3a2f66, 1); g.fillRect(0, 0, width, height);
    g.fillStyle(0x4a3a7a, 1); g.fillEllipse(width / 2, height * 0.55, width * 1.3, height * 0.9);
    // houten vloer + toonbank
    g.fillStyle(0x5a3d28, 1); g.fillRect(0, height - 150, width, 150);
    g.fillStyle(0x4a3020, 1);
    for (let x = 0; x < width; x += 60) g.fillRect(x, height - 150, 2, 150);
    g.fillStyle(0x6a4a30, 1); g.fillRect(0, height - 156, width, 8);

    // planken met kleurige flesjes (het decor dat straks "bloeit")
    [140, 205].forEach((py) => {
      g.fillStyle(0x4a3020, 1); g.fillRect(250, py + 22, 120, 6);
    });
    const flesKleuren = [0xe8402c, 0x57b947, 0x38b6cf, 0xf6c624, 0xec6aa9, 0x9b6dd6];
    let fi = 0;
    [[262, 140], [292, 140], [322, 140], [352, 140], [278, 205], [338, 205]].forEach(([fx, fy]) => {
      const kl = flesKleuren[fi++ % flesKleuren.length];
      g.fillStyle(kl, 0.9); g.fillRoundedRect(fx - 8, fy - 4, 16, 26, 4);
      g.fillStyle(0xa97142, 1); g.fillRect(fx - 4, fy - 10, 8, 7);
    });

    // dwarrelende magie-stofjes
    for (let i = 0; i < 18; i++) {
      const s = this.add.circle(Phaser.Math.Between(20, width - 20), Phaser.Math.Between(80, height - 40), Phaser.Math.FloatBetween(1, 2.4), 0xffe9a8, 0.6).setDepth(1);
      this.tweens.add({ targets: s, y: s.y - Phaser.Math.Between(20, 50), alpha: 0.1, duration: Phaser.Math.Between(2500, 5000), yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: Phaser.Math.Between(0, 2000) });
    }
  }

  buildKetel() {
    const g = this.add.graphics().setDepth(8);
    g.fillStyle(0x000000, 0.28); g.fillEllipse(KETEL_X, KETEL_Y + 70, 150, 30);
    // pot
    g.fillStyle(0x241a3a, 1);
    g.beginPath();
    g.moveTo(KETEL_X - 74, KETEL_Y - 20);
    g.lineTo(KETEL_X - 60, KETEL_Y + 60);
    g.lineTo(KETEL_X + 60, KETEL_Y + 60);
    g.lineTo(KETEL_X + 74, KETEL_Y - 20);
    g.closePath(); g.fillPath();
    g.lineStyle(5, 0x0f0a1e, 1); g.strokePath();
    // pootjes
    g.fillStyle(0x1a1230, 1);
    g.fillRect(KETEL_X - 50, KETEL_Y + 58, 12, 14);
    g.fillRect(KETEL_X + 38, KETEL_Y + 58, 12, 14);

    // vloeistof (kleur verandert live)
    this.liquid = this.add.ellipse(KETEL_X, KETEL_Y - 20, 148, 40, KLEUREN.leeg).setDepth(9);
    this.add.ellipse(KETEL_X, KETEL_Y - 20, 148, 40).setStrokeStyle(3, 0xc084fc).setDepth(10);
    // glans-borrels
    this.borrels = [];
    for (let i = 0; i < 4; i++) {
      const b = this.add.circle(KETEL_X + Phaser.Math.Between(-40, 40), KETEL_Y - 22, Phaser.Math.Between(4, 8), 0xffffff, 0.35).setDepth(11).setVisible(false);
      this.tweens.add({ targets: b, y: b.y - 10, scale: 0.2, duration: Phaser.Math.Between(700, 1200), yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 800) });
      this.borrels.push(b);
    }
    // gloed onder de rand
    this.ketelGloed = this.add.ellipse(KETEL_X, KETEL_Y - 20, 168, 52, 0xffffff, 0.0).setDepth(8);
  }

  // ------------------------------------------------------ klant + recept

  nieuweKlant() {
    this.bezig = false;
    this.recept = kiesRecept(Math.random, this.vorigId);
    this.vorigId = this.recept.id;
    this.staat = { druppels: {}, sterren: 0, roer: 0, gespeld: 0 };

    if (this.kaartC) this.kaartC.destroy();
    if (this.klantC) this.klantC.destroy();
    if (this.knoppenC) this.knoppenC.destroy();
    if (this.lettersC) this.lettersC.destroy();

    this.setKetelKleur('leeg');
    this.borrels.forEach((b) => b.setVisible(false));

    this.buildKlant();
    this.buildKaart();
    this.buildKnoppen();
    this.buildLetters();
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

    // stap-chips (druppels per kleur, sterren, roer) op een rij
    const chips = [];
    this.recept.druppels.forEach((d) => chips.push({ type: 'druppel', kleur: d.kleur, nodig: d.aantal }));
    chips.push({ type: 'sterren', nodig: this.recept.sterren });
    chips.push({ type: 'roer', nodig: this.recept.roer });
    const chipW = (width - 60) / chips.length;
    chips.forEach((ch, i) => {
      const x = -width / 2 + 30 + chipW * i + chipW / 2;
      const y = -6;
      if (ch.type === 'druppel') {
        c.add(this.add.circle(x - 14, y, 7, KLEUREN[ch.kleur]).setStrokeStyle(1.5, 0x0006));
      } else {
        c.add(this.add.text(x - 20, y, ch.type === 'sterren' ? '⭐' : '🥄', { fontSize: '15px' }).setOrigin(0.5));
      }
      const key = ch.type === 'druppel' ? 'd_' + ch.kleur : ch.type;
      const txt = this.add.text(x + 2, y, `0/${ch.nodig}`, { fontFamily: 'Arial', fontSize: '13px', fontStyle: 'bold', color: '#5a3d28' }).setOrigin(0, 0.5);
      c.add(txt);
      this.kaartRefs[key] = txt;
    });

    // woord-slots onderaan de kaart
    const woord = this.recept.woord;
    this.kaartRefs.woordSlots = [];
    const slotW = 26, totW = woord.length * (slotW + 4);
    woord.split('').forEach((ch, i) => {
      const sx = -totW / 2 + i * (slotW + 4) + slotW / 2;
      const box = this.add.graphics();
      box.fillStyle(0xffffff, 0.8); box.fillRoundedRect(sx - slotW / 2, 20, slotW, 24, 5);
      box.lineStyle(1.5, 0xc9a76a, 1); box.strokeRoundedRect(sx - slotW / 2, 20, slotW, 24, 5);
      c.add(box);
      const t = this.add.text(sx, 32, '', { fontFamily: 'Arial Black, Arial', fontSize: '16px', fontStyle: 'bold', color: '#7c4a1e' }).setOrigin(0.5);
      c.add(t);
      this.kaartRefs.woordSlots.push(t);
    });
    this.updateKaart();
  }

  updateKaart() {
    const st = brouwStatus(this.recept, this.staat);
    this.recept.druppels.forEach((d) => {
      const heb = this.staat.druppels[d.kleur] || 0;
      const ref = this.kaartRefs['d_' + d.kleur];
      if (ref) ref.setText(`${heb}/${d.aantal}`).setColor(heb >= d.aantal ? '#2e6b1e' : '#5a3d28');
    });
    if (this.kaartRefs.sterren) this.kaartRefs.sterren.setText(`${this.staat.sterren}/${this.recept.sterren}`).setColor(st.sterrenOk ? '#2e6b1e' : '#5a3d28');
    if (this.kaartRefs.roer) this.kaartRefs.roer.setText(`${this.staat.roer}/${this.recept.roer}`).setColor(st.roerOk ? '#2e6b1e' : '#5a3d28');
    this.kaartRefs.woordSlots.forEach((t, i) => t.setText(i < this.staat.gespeld ? this.recept.woord[i] : ''));
  }

  // ------------------------------------------------------ knoppen & letters

  buildKnoppen() {
    const { width } = this.scale;
    const c = this.add.container(0, 610).setDepth(30);
    this.knoppenC = c;
    const items = [];
    this.recept.druppels.forEach((d) => items.push({ soort: 'druppel', kleur: d.kleur }));
    items.push({ soort: 'ster' });
    items.push({ soort: 'roer' });
    const bw = 78, gap = 8, totW = items.length * bw + (items.length - 1) * gap;
    let x = width / 2 - totW / 2 + bw / 2;
    items.forEach((it) => {
      const label = it.soort === 'druppel' ? 'druppel' : it.soort === 'ster' ? 'sterretje' : 'roeren';
      const kleur = it.soort === 'druppel' ? KLEUREN[it.kleur] : it.soort === 'ster' ? 0xf6c624 : 0x9b6dd6;
      const knop = this.maakKnop(x, 0, label, kleur, it);
      c.add(knop);
      x += bw + gap;
    });
  }

  maakKnop(x, y, label, kleur, it) {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    const hex = '#' + kleur.toString(16).padStart(6, '0');
    g.fillStyle(0xfbf1dc, 1); g.fillRoundedRect(-38, -24, 76, 48, 12);
    g.lineStyle(2.5, kleur, 1); g.strokeRoundedRect(-38, -24, 76, 48, 12);
    // icoontje
    if (it.soort === 'druppel') g.fillStyle(kleur, 1), g.fillCircle(0, -6, 8);
    const ic = this.add.text(0, -7, it.soort === 'ster' ? '⭐' : it.soort === 'roer' ? '🥄' : '', { fontSize: '16px' }).setOrigin(0.5);
    const lab = this.add.text(0, 12, label, { fontFamily: 'Arial', fontSize: '10px', fontStyle: 'bold', color: hex }).setOrigin(0.5);
    const hit = this.add.rectangle(0, 0, 76, 48, 0, 0).setInteractive({ useHandCursor: true });
    c.add([g, ic, lab, hit]);
    hit.on('pointerdown', () => {
      if (this.bezig) return;
      this.tweens.add({ targets: c, scale: 0.9, duration: 70, yoyo: true });
      if (it.soort === 'druppel') this.addDruppel(it.kleur);
      else if (it.soort === 'ster') this.addSter();
      else this.addRoer();
    });
    return c;
  }

  buildLetters() {
    const { width } = this.scale;
    const c = this.add.container(0, 700).setDepth(30);
    this.lettersC = c;
    const letters = this.recept.woord.split('');
    Phaser.Utils.Array.Shuffle(letters);
    const kleuren = [0xe8402c, 0xf08a24, 0xf6c624, 0x57b947, 0x38b6cf, 0x9b6dd6];
    const tw = 44, gap = 8, totW = letters.length * tw + (letters.length - 1) * gap;
    let x = width / 2 - totW / 2 + tw / 2;
    letters.forEach((ch, i) => {
      const tegel = this.add.container(x, 0);
      const g = this.add.graphics();
      g.fillStyle(kleuren[i % kleuren.length], 1); g.fillRoundedRect(-22, -22, 44, 44, 10);
      g.lineStyle(2.5, INKT, 1); g.strokeRoundedRect(-22, -22, 44, 44, 10);
      const t = this.add.text(0, 0, ch, { fontFamily: 'Arial Black, Arial', fontSize: '22px', fontStyle: 'bold', color: '#ffffff', stroke: '#00000055', strokeThickness: 3 }).setOrigin(0.5);
      const hit = this.add.rectangle(0, 0, 44, 44, 0, 0).setInteractive({ useHandCursor: true });
      tegel.add([g, t, hit]);
      tegel.letter = ch; tegel.gebruikt = false;
      hit.on('pointerdown', () => this.tapLetter(tegel));
      c.add(tegel);
      x += tw + gap;
    });
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
  }

  addDruppel(kleur) {
    const nodig = (this.recept.druppels.find((d) => d.kleur === kleur) || {}).aantal || 0;
    if ((this.staat.druppels[kleur] || 0) >= nodig) return;
    this.staat.druppels[kleur] = (this.staat.druppels[kleur] || 0) + 1;
    // druppel valt in de ketel
    const drop = this.add.circle(KETEL_X + Phaser.Math.Between(-30, 30), 590, 8, KLEUREN[kleur]).setDepth(12);
    this.tweens.add({ targets: drop, y: KETEL_Y - 20, duration: 260, ease: 'Quad.easeIn', onComplete: () => { drop.destroy(); this.plons(KLEUREN[kleur]); } });
    SFX.pick();
    this.setKetelKleur(ketelKleur(this.dropArray()));
    this.updateKaart();
    this.checkKlaar();
  }

  addSter() {
    if (this.staat.sterren >= this.recept.sterren) return;
    this.staat.sterren++;
    const st = this.add.image(KETEL_X + Phaser.Math.Between(-24, 24), 580, 'star').setScale(1.4).setTint(0xfff2a8).setDepth(12);
    this.tweens.add({ targets: st, y: KETEL_Y - 22, scale: 0.4, angle: 240, duration: 300, ease: 'Quad.easeIn', onComplete: () => { st.destroy(); this.plons(0xfff2a8); } });
    SFX.sparkle();
    this.updateKaart();
    this.checkKlaar();
  }

  addRoer() {
    if (this.staat.roer >= this.recept.roer) return;
    this.staat.roer++;
    this.borrels.forEach((b) => b.setVisible(true));
    // roer-swirl
    const sp = this.add.text(KETEL_X, KETEL_Y - 22, '🥄', { fontSize: '22px' }).setOrigin(0.5).setDepth(13);
    this.tweens.add({ targets: sp, angle: 360, duration: 380, onComplete: () => sp.destroy() });
    this.tweens.add({ targets: this.liquid, scaleX: 1.08, duration: 120, yoyo: true });
    SFX.combine ? SFX.combine(2) : SFX.pick();
    this.updateKaart();
    this.checkKlaar();
  }

  tapLetter(tegel) {
    if (this.bezig || tegel.gebruikt) return;
    if (tegel.letter === this.recept.woord[this.staat.gespeld]) {
      tegel.gebruikt = true;
      this.staat.gespeld++;
      // letter lost op in sterrenstof richting de ketel
      this.tweens.add({ targets: tegel, x: this.knoppenC ? tegel.x : tegel.x, alpha: 0.2, scale: 0.6, duration: 200 });
      const spark = this.add.image(tegel.x, 700, 'star').setScale(1.2).setTint(0xffffff).setDepth(40);
      this.tweens.add({ targets: spark, x: KETEL_X, y: KETEL_Y - 20, scale: 0, duration: 400, ease: 'Quad.easeIn', onComplete: () => spark.destroy() });
      SFX.coin();
      this.updateKaart();
      this.checkKlaar();
    } else {
      this.tweens.add({ targets: tegel, x: tegel.x + 5, duration: 50, yoyo: true, repeat: 3 });
      SFX.oops(); Voice.cue('oops');
    }
  }

  plons(kleur) {
    const p = this.add.particles(KETEL_X, KETEL_Y - 20, 'star', { speed: { min: 30, max: 90 }, scale: { start: 0.7, end: 0 }, lifespan: 300, quantity: 4, tint: kleur, blendMode: 'ADD' }).setDepth(12);
    this.time.delayedCall(300, () => p.destroy());
  }

  // ------------------------------------------------------ het wonder

  checkKlaar() {
    if (this.bezig) return;
    if (brouwStatus(this.recept, this.staat).klaar) this.brouwKlaar();
  }

  brouwKlaar() {
    this.bezig = true;
    if (this.klantC && this.klantC.wolkje) this.klantC.wolkje.destroy();

    // opbouw: ketel gloeit en zwelt
    this.setKetelKleur(this.recept.doelkleur);
    this.tweens.add({ targets: this.ketelGloed, alpha: 0.5, scale: 1.3, duration: 260, yoyo: true });
    this.tweens.add({
      targets: this.liquid, scaleX: 1.15, scaleY: 1.3, duration: 300, ease: 'Sine.inOut',
      onComplete: () => this.poef(),
    });
  }

  poef() {
    // POEF! grote uitbarsting + camera-tik
    SFX.fanfare(); Voice.cue('cheer');
    this.cameras.main.shake(180, 0.006);
    this.cameras.main.flash(200, 255, 245, 210);
    const kleur = KLEUREN[this.recept.doelkleur];
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
  }
}
