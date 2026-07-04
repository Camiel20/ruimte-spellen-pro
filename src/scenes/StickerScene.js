import Phaser from 'phaser';
import { SFX } from '../sound.js';
import { Voice } from '../voice.js';
import { getStars, spendStars, getStickers, getStickerCount, addSticker, giveMedal } from '../progress.js';
import { confettiBurst } from '../reward.js';
import { luchtAchtergrond, terugKnop, schermTitel, maakNul, INKT } from '../theme.js';
import {
  PAGINAS, TOTAAL, PAK_KOST, alleStickers, openPak, paginaVol,
  albumVol, aantalCompleet, nieuwVollePaginas,
} from '../stickerLogic.js';

// Plakboek — verzamel-meta over alle spellen. Verdiende sterren koop je in
// voor verrassings-pakjes vol stickers; vul de thema-pagina's.
//
// De logica (catalogus, pakjes, voortgang) leeft in src/stickerLogic.js en is
// met vitest getest. Deze scene is het plaatje: het boek, de getekende
// stickers en het pakjes-openen.

// Slot-posities op een pagina (3 kolommen × 2 rijen)
const KOL = [96, 240, 384];
const RIJ = [250, 415];
const STICKER_R = 40;

export default class StickerScene extends Phaser.Scene {
  constructor() { super('Sticker'); }

  create() {
    const { width } = this.scale;
    luchtAchtergrond(this, { gras: false });
    terugKnop(this);
    schermTitel(this, 40, '📖 Mijn Plakboek');

    this.pagina = 0;

    // Sterrensaldo-chip
    this.sterChip = this.add.text(width - 16, 40, '', {
      fontFamily: 'Arial', fontSize: '17px', fontStyle: 'bold', color: '#b45309',
      backgroundColor: '#ffffffdd', padding: { x: 12, y: 6 },
    }).setOrigin(1, 0.5).setDepth(20);

    // Nul kijkt mee vanuit de hoek
    this.nul = maakNul(this, 44, 116, 26).setDepth(20);
    this.time.addEvent({ delay: 3000, loop: true, callback: () => this.nul.knipper() });

    this.buildBoek();
    this.buildNav();
    this.buildOpenKnop();
    this.tekenPagina();
    this.updateSaldo();

    this.cameras.main.fadeIn(300, 191, 227, 251);
  }

  updateSaldo() {
    this.sterChip.setText(`⭐ ${getStars()}`);
    const compleet = aantalCompleet(getStickers());
    if (this.voortgangTekst) this.voortgangTekst.setText(`${compleet} / ${TOTAAL} stickers`);
  }

  buildBoek() {
    const { width } = this.scale;
    const kaart = this.add.graphics().setDepth(2);
    kaart.fillStyle(0xffffff, 0.96);
    kaart.fillRoundedRect(22, 150, width - 44, 400, 24);
    kaart.lineStyle(3, 0xdCE9f3, 1);
    kaart.strokeRoundedRect(22, 150, width - 44, 400, 24);
    // ringband-gaatjes bovenaan (net een echt insteekboek)
    kaart.fillStyle(0xe2e8f0, 1);
    for (let i = 0; i < 6; i++) kaart.fillCircle(70 + i * ((width - 140) / 5), 168, 4);
  }

  buildNav() {
    const { width } = this.scale;
    this.pagTitel = this.add.text(width / 2, 190, '', {
      fontFamily: 'Arial Black, Arial', fontSize: '20px', fontStyle: 'bold', color: '#1f2d3a',
    }).setOrigin(0.5).setDepth(5);
    this.pagTelling = this.add.text(width / 2, 214, '', {
      fontFamily: 'Arial', fontSize: '13px', fontStyle: 'bold', color: '#64748b',
    }).setOrigin(0.5).setDepth(5);

    const pijl = (x, dir) => {
      const c = this.add.circle(x, 200, 20, 0xffffff).setDepth(6)
        .setStrokeStyle(2.5, 0xbcd9ee).setInteractive({ useHandCursor: true });
      this.add.text(x, 199, dir < 0 ? '◀' : '▶', { fontSize: '18px', color: '#3b82f6' })
        .setOrigin(0.5).setDepth(7);
      c.on('pointerdown', () => this.wisselPagina(dir));
      return c;
    };
    pijl(44, -1);
    pijl(width - 44, 1);

    // pagina-stipjes onderaan het boek
    this.stipjes = [];
    const sx = width / 2 - (PAGINAS.length - 1) * 12;
    for (let i = 0; i < PAGINAS.length; i++) {
      this.stipjes.push(this.add.circle(sx + i * 24, 566, 5, 0xcbd5e1).setDepth(5));
    }
  }

  buildOpenKnop() {
    const { width } = this.scale;
    this.voortgangTekst = this.add.text(width / 2, 596, '', {
      fontFamily: 'Arial', fontSize: '13px', fontStyle: 'bold', color: '#3b5a72',
    }).setOrigin(0.5).setDepth(5);

    this.openKnop = this.add.container(width / 2, 660).setDepth(6);
    const bg = this.add.graphics();
    bg.fillStyle(0xfbbf24, 1);
    bg.fillRoundedRect(-140, -30, 280, 60, 22);
    bg.lineStyle(3, 0xd97706, 1);
    bg.strokeRoundedRect(-140, -30, 280, 60, 22);
    this.openLabel = this.add.text(0, 0, `Open verrassing   ${PAK_KOST}⭐`, {
      fontFamily: 'Arial Black, Arial', fontSize: '19px', fontStyle: 'bold', color: '#1a1a2e',
    }).setOrigin(0.5);
    const hit = this.add.rectangle(0, 0, 280, 60, 0, 0).setInteractive({ useHandCursor: true });
    this.openKnop.add([bg, this.openLabel, hit]);
    hit.on('pointerdown', () => this.openPakje());
    this.tweens.add({ targets: this.openKnop, scale: 1.04, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  wisselPagina(dir) {
    const n = Phaser.Math.Clamp(this.pagina + dir, 0, PAGINAS.length - 1);
    if (n === this.pagina) return;
    this.pagina = n;
    SFX.click();
    this.tekenPagina();
  }

  tekenPagina() {
    if (this.pagContainer) this.pagContainer.destroy();
    this.pagContainer = this.add.container(0, 0).setDepth(4);

    const p = PAGINAS[this.pagina];
    const owned = getStickers();
    this.pagTitel.setText(p.naam).setColor('#' + p.accent.toString(16).padStart(6, '0'));
    const heeft = p.stickers.filter((s) => (owned[s.id] || 0) > 0).length;
    this.pagTelling.setText(`${heeft} van ${p.stickers.length}`);
    this.stipjes.forEach((st, i) => st.setFillStyle(i === this.pagina ? p.accent : (paginaVol(owned, i) ? 0xfbbf24 : 0xcbd5e1)));

    p.stickers.forEach((def, i) => {
      const x = KOL[i % 3], y = RIJ[Math.floor(i / 3)];
      const aantal = getStickerCount(def.id);
      this.maakSlot(x, y, def, aantal);
    });

    if (paginaVol(owned, this.pagina)) this.paginaCompleetVlag();
  }

  maakSlot(x, y, def, aantal) {
    const slot = this.add.container(x, y);
    this.pagContainer.add(slot);

    // slot-achtergrond (zacht rondje)
    const bg = this.add.graphics();
    bg.fillStyle(aantal > 0 ? 0xfff7e6 : 0xeef2f7, aantal > 0 ? 0.9 : 0.7);
    bg.lineStyle(2.5, aantal > 0 ? 0xf5c518 : 0xcbd5e1, aantal > 0 ? 1 : 0.6);
    bg.fillRoundedRect(-64, -58, 128, 116, 16);
    bg.strokeRoundedRect(-64, -58, 128, 116, 16);
    slot.add(bg);

    if (aantal <= 0) {
      // Nog niet: grijze silhouet met vraagteken
      const q = this.add.circle(0, -6, STICKER_R, 0xd7dee7);
      const qm = this.add.text(0, -6, '?', { fontFamily: 'Arial Black, Arial', fontSize: '34px', color: '#9aa8b8' }).setOrigin(0.5);
      slot.add([q, qm]);
      return;
    }

    // Glimmer-ring bij een dubbel (>=2)
    if (aantal >= 2) {
      const ring = this.add.circle(0, -6, STICKER_R + 6).setStrokeStyle(3, 0xfacc15, 0.9);
      slot.add(ring);
      this.tweens.add({ targets: ring, angle: 360, duration: 4000, repeat: -1 });
      for (let k = 0; k < 3; k++) {
        const hoek = k * 2.1;
        const glim = this.add.image(Math.cos(hoek) * (STICKER_R + 6), Math.sin(hoek) * (STICKER_R + 6) - 6, 'star')
          .setScale(0.7).setTint(0xfff7cc);
        slot.add(glim);
        this.tweens.add({ targets: glim, alpha: 0.2, scale: 0.4, duration: 700 + k * 200, yoyo: true, repeat: -1 });
      }
    }

    const art = this.tekenSticker(def, STICKER_R);
    art.y = -8;
    slot.add(art);
    const naam = this.add.text(0, 44, def.naam, {
      fontFamily: 'Arial', fontSize: '11px', fontStyle: 'bold', color: '#475569',
    }).setOrigin(0.5);
    slot.add(naam);

    // klein plop-animatietje
    slot.setScale(0.85);
    this.tweens.add({ targets: slot, scale: 1, duration: 260, ease: 'Back.easeOut' });
  }

  paginaCompleetVlag() {
    const { width } = this.scale;
    const lint = this.add.container(width - 70, 176).setDepth(8);
    const g = this.add.graphics();
    g.fillStyle(0xfbbf24, 1); g.fillRoundedRect(-46, -14, 92, 28, 14);
    g.lineStyle(2, 0xd97706, 1); g.strokeRoundedRect(-46, -14, 92, 28, 14);
    const t = this.add.text(0, 0, 'VOL! ⭐', { fontFamily: 'Arial Black, Arial', fontSize: '13px', fontStyle: 'bold', color: '#1a1a2e' }).setOrigin(0.5);
    lint.add([g, t]);
    this.pagContainer.add(lint);
    this.tweens.add({ targets: lint, angle: { from: -4, to: 4 }, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  // ---------------------------------------------------- pakje openen

  openPakje() {
    if (this.bezig) return;
    if (getStars() < PAK_KOST) {
      SFX.oops(); Voice.cue('oops');
      this.tweens.add({ targets: this.openKnop, x: '+=6', duration: 50, yoyo: true, repeat: 3 });
      this.toonHint('Speel spelletjes voor meer sterren! ⭐');
      return;
    }
    this.bezig = true;
    spendStars(PAK_KOST);
    const voor = JSON.parse(JSON.stringify(getStickers()));
    const pak = openPak(voor);
    pak.forEach((p) => addSticker(p.id));
    const na = getStickers();
    this.updateSaldo();
    SFX.coin();
    this.toonPakOverlay(pak, () => {
      const nieuwVol = nieuwVollePaginas(voor, na);
      const compleet = albumVol(na);
      // spring naar een pagina met een nieuwe sticker (of een net-volle)
      const eersteNieuw = pak.find((p) => p.nieuw);
      if (eersteNieuw) this.pagina = alleStickers().find((s) => s.id === eersteNieuw.id).pagina;
      this.tekenPagina();
      if (nieuwVol.length) this.vierPagina(nieuwVol[0], compleet);
      else this.bezig = false;
    });
  }

  toonPakOverlay(pak, klaar) {
    const { width, height } = this.scale;
    const D = 300;
    const laag = [];
    const scrim = this.add.rectangle(width / 2, height / 2, width, height, 0x1e293b, 0.78).setDepth(D).setInteractive();
    laag.push(scrim);
    laag.push(this.add.text(width / 2, 150, 'Verrassing! 🎁', {
      fontFamily: 'Arial Black, Arial', fontSize: '30px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(D + 1));
    confettiBurst(this, D + 1);

    pak.forEach((p, i) => {
      const def = alleStickers().find((s) => s.id === p.id);
      const cx = width / 2, cy = 320 + i * 170;
      const kaart = this.add.container(cx, cy).setDepth(D + 2).setScale(0);
      const bg = this.add.graphics();
      bg.fillStyle(0xffffff, 1); bg.fillRoundedRect(-120, -70, 240, 140, 20);
      bg.lineStyle(4, p.nieuw ? 0x4ade80 : 0xfacc15, 1); bg.strokeRoundedRect(-120, -70, 240, 140, 20);
      kaart.add(bg);
      const art = this.tekenSticker(def, 42); art.x = -60; kaart.add(art);
      kaart.add(this.add.text(20, -30, def.naam, { fontFamily: 'Arial Black, Arial', fontSize: '18px', fontStyle: 'bold', color: '#1f2d3a' }).setOrigin(0, 0.5));
      const badge = this.add.text(20, 8, p.nieuw ? 'NIEUW! ✨' : 'GLIMMER! ✨', {
        fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: p.nieuw ? '#15803d' : '#b45309',
      }).setOrigin(0, 0.5);
      kaart.add(badge);
      laag.push(kaart);
      this.tweens.add({
        targets: kaart, scale: 1, duration: 340, delay: 260 + i * 260, ease: 'Back.easeOut',
        onStart: () => { if (i === 0) SFX.sparkle(); else this.time.delayedCall(0, () => SFX.sparkle()); },
      });
    });
    Voice.cue('star');

    const knop = this.add.text(width / 2, height - 120, 'Leuk! 😄', {
      fontFamily: 'Arial Black, Arial', fontSize: '20px', fontStyle: 'bold',
      color: '#1a1a2e', backgroundColor: '#fbbf24', padding: { x: 28, y: 12 },
    }).setOrigin(0.5).setDepth(D + 3).setAlpha(0).setInteractive({ useHandCursor: true });
    laag.push(knop);
    this.tweens.add({ targets: knop, alpha: 1, delay: 300 + pak.length * 260, duration: 300 });
    knop.on('pointerdown', () => { SFX.click(); laag.forEach((o) => o.destroy()); klaar(); });
  }

  vierPagina(pagIndex, albumCompleet) {
    const { width, height } = this.scale;
    const D = 320;
    const laag = [];
    laag.push(this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6).setDepth(D).setInteractive());
    confettiBurst(this, D + 2);
    SFX.win(); Voice.cue('cheer');
    laag.push(this.add.text(width / 2, height / 2 - 90, '🏅', { fontSize: '64px' }).setOrigin(0.5).setDepth(D + 1));
    const titel = albumCompleet ? 'HET ALBUM IS VOL!' : `Pagina compleet:\n${PAGINAS[pagIndex].naam}!`;
    laag.push(this.add.text(width / 2, height / 2, titel, {
      fontFamily: 'Arial Black, Arial', fontSize: albumCompleet ? 28 : 24, fontStyle: 'bold',
      color: '#ffffff', align: 'center', stroke: '#1f2d3a', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(D + 1));
    if (albumCompleet) giveMedal('sticker_album');
    else giveMedal('sticker_pagina');
    const knop = this.add.text(width / 2, height / 2 + 90, 'Joepie! 🎉', {
      fontFamily: 'Arial Black, Arial', fontSize: '20px', fontStyle: 'bold',
      color: '#1a1a2e', backgroundColor: '#fbbf24', padding: { x: 26, y: 12 },
    }).setOrigin(0.5).setDepth(D + 2).setInteractive({ useHandCursor: true });
    laag.push(knop);
    knop.on('pointerdown', () => { SFX.click(); laag.forEach((o) => o.destroy()); this.bezig = false; });
  }

  toonHint(tekst) {
    const { width } = this.scale;
    if (this.hint) this.hint.destroy();
    this.hint = this.add.text(width / 2, 620, tekst, {
      fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#be185d',
      backgroundColor: '#ffffffee', padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setDepth(30);
    this.time.delayedCall(2200, () => { if (this.hint) { this.hint.destroy(); this.hint = null; } });
  }

  // ---------------------------------------------------- de tekenaar
  // Geeft een container met de getekende sticker (straal r), gecentreerd.

  gezicht(c, r) {
    c.add(this.add.circle(-r * 0.28, -r * 0.12, r * 0.14, 0xffffff).setStrokeStyle(1.5, INKT));
    c.add(this.add.circle(r * 0.28, -r * 0.12, r * 0.14, 0xffffff).setStrokeStyle(1.5, INKT));
    c.add(this.add.circle(-r * 0.28, -r * 0.1, r * 0.06, INKT));
    c.add(this.add.circle(r * 0.28, -r * 0.1, r * 0.06, INKT));
    const m = this.add.graphics();
    m.lineStyle(2.2, INKT, 1);
    m.beginPath(); m.arc(0, r * 0.14, r * 0.2, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160)); m.strokePath();
    c.add(m);
    c.add(this.add.circle(-r * 0.5, r * 0.12, r * 0.1, 0xf9a8d4, 0.6));
    c.add(this.add.circle(r * 0.5, r * 0.12, r * 0.1, 0xf9a8d4, 0.6));
  }

  tekenSticker(def, r) {
    const c = this.add.container(0, 0);
    const g = this.add.graphics();
    c.add(g);
    const donker = Phaser.Display.Color.ValueToColor(def.kleur).darken(35).color;

    switch (def.kind) {
      case 'ballon':
      case 'ballon_rb': {
        g.lineStyle(2, 0x8d99ae, 1); g.lineBetween(0, r * 1.1, 3, r * 1.35);
        if (def.kind === 'ballon_rb') {
          [0xe8402c, 0xf08a24, 0xf6c624, 0x57b947, 0x38b6cf, 0x9b6dd6].forEach((kl, i) => {
            g.fillStyle(kl, 1); g.fillEllipse(0, 0, r * 2 * (1 - i * 0.15), r * 2.2 * (1 - i * 0.15));
          });
          g.lineStyle(3, 0x475569, 1); g.strokeEllipse(0, 0, r * 2, r * 2.2);
        } else {
          g.fillStyle(def.kleur, 1); g.fillEllipse(0, 0, r * 2, r * 2.2);
          g.lineStyle(3, donker, 1); g.strokeEllipse(0, 0, r * 2, r * 2.2);
          g.fillStyle(0xffffff, 0.35); g.fillEllipse(-r * 0.35, -r * 0.4, r * 0.5, r * 0.7);
        }
        this.gezicht(c, r);
        break;
      }
      case 'ster': {
        const s = this.add.image(0, 0, 'star').setScale(r / 5).setTint(def.kleur); c.add(s);
        this.gezicht(c, r * 0.7);
        break;
      }
      case 'maan': {
        g.fillStyle(0xfde68a, 1); g.fillCircle(0, 0, r);
        g.fillStyle(0xbfe3fb, 1); g.fillCircle(r * 0.4, -r * 0.15, r * 0.9);
        g.fillStyle(0xfde68a, 1); g.fillCircle(-r * 0.15, 0, r * 0.85);
        c.add(this.add.circle(-r * 0.35, -r * 0.15, r * 0.12, INKT));
        const m = this.add.graphics(); m.lineStyle(2, INKT, 1);
        m.beginPath(); m.arc(-r * 0.3, r * 0.1, r * 0.16, 0.2, Math.PI - 0.2); m.strokePath(); c.add(m);
        break;
      }
      case 'planeet': {
        g.lineStyle(5, donker, 0.6); g.strokeEllipse(0, r * 0.15, r * 2.6, r * 0.7);
        g.fillStyle(def.kleur, 1); g.fillCircle(0, 0, r);
        g.lineStyle(3, donker, 1); g.strokeCircle(0, 0, r);
        g.fillStyle(0xffffff, 0.3); g.fillEllipse(-r * 0.35, -r * 0.4, r * 0.45, r * 0.6);
        this.gezicht(c, r);
        break;
      }
      case 'raket': {
        g.fillStyle(0xf08a24, 1); g.fillTriangle(-r * 0.35, r * 0.7, 0, r * 1.25, r * 0.35, r * 0.7);
        g.fillStyle(0xfde047, 1); g.fillTriangle(-r * 0.18, r * 0.7, 0, r, r * 0.18, r * 0.7);
        g.fillStyle(def.kleur, 1); g.fillTriangle(0, -r * 1.15, r * 0.5, -r * 0.2, -r * 0.5, -r * 0.2);
        g.fillStyle(0xf1f5f9, 1); g.fillRoundedRect(-r * 0.5, -r * 0.5, r, r * 1.2, r * 0.3);
        g.lineStyle(2.5, 0x64748b, 1); g.strokeRoundedRect(-r * 0.5, -r * 0.5, r, r * 1.2, r * 0.3);
        g.fillStyle(def.kleur, 1);
        g.fillTriangle(-r * 0.5, r * 0.3, -r * 0.9, r * 0.7, -r * 0.5, r * 0.6);
        g.fillTriangle(r * 0.5, r * 0.3, r * 0.9, r * 0.7, r * 0.5, r * 0.6);
        g.fillStyle(0xbae6fd, 1); g.fillCircle(0, -r * 0.05, r * 0.28);
        g.lineStyle(2, 0x64748b, 1); g.strokeCircle(0, -r * 0.05, r * 0.28);
        break;
      }
      case 'komeet': {
        g.fillStyle(def.kleur, 0.5); g.fillTriangle(r * 0.2, r * 0.2, r * 1.3, r * 1.3, r * 0.5, -r * 0.1);
        g.fillStyle(0xfff7cc, 0.35); g.fillTriangle(r * 0.1, r * 0.3, r * 1.1, r * 1.4, r * 0.6, r * 0.1);
        const s = this.add.image(-r * 0.2, -r * 0.2, 'star').setScale(r / 5.5).setTint(def.kleur); c.add(s);
        break;
      }
      case 'nulplaneet': {
        g.lineStyle(6, 0xfbbf24, 0.7); g.strokeEllipse(0, r * 0.15, r * 2.7, r * 0.75);
        g.fillStyle(def.kleur, 1); g.fillCircle(0, 0, r);
        g.fillStyle(0x2a1b5e, 1); g.fillCircle(0, 0, r * 0.42);
        g.lineStyle(3, 0xfbbf24, 1); g.strokeCircle(0, 0, r); g.strokeCircle(0, 0, r * 0.42);
        this.gezicht(c, r);
        break;
      }
      case 'blokje': {
        g.fillStyle(def.kleur, 1); g.fillRoundedRect(-r * 0.9, -r * 0.9, r * 1.8, r * 1.8, r * 0.22);
        g.fillStyle(0xffffff, 0.3); g.fillRoundedRect(-r * 0.78, -r * 0.78, r * 1.56, r * 0.5, r * 0.16);
        g.lineStyle(3.5, INKT, 1); g.strokeRoundedRect(-r * 0.9, -r * 0.9, r * 1.8, r * 1.8, r * 0.22);
        this.gezicht(c, r * 0.85);
        c.add(this.add.text(0, r * 0.5, def.label, {
          fontFamily: 'Arial Black, Arial', fontSize: `${r * 0.55}px`, fontStyle: 'bold',
          color: '#ffffff', stroke: '#00000055', strokeThickness: 3,
        }).setOrigin(0.5));
        break;
      }
      case 'bloem': {
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * Math.PI * 2;
          g.fillStyle(def.kleur, 1); g.fillCircle(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6, r * 0.42);
        }
        g.fillStyle(0xfcd34d, 1); g.fillCircle(0, 0, r * 0.5);
        c.add(this.add.circle(-r * 0.14, -r * 0.05, r * 0.08, INKT));
        c.add(this.add.circle(r * 0.14, -r * 0.05, r * 0.08, INKT));
        const m = this.add.graphics(); m.lineStyle(2, INKT, 1);
        m.beginPath(); m.arc(0, r * 0.1, r * 0.16, 0.2, Math.PI - 0.2); m.strokePath(); c.add(m);
        break;
      }
      case 'zon': {
        g.fillStyle(0xfcd34d, 1);
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2;
          g.fillTriangle(Math.cos(a) * r, Math.sin(a) * r, Math.cos(a + 0.2) * r * 0.7, Math.sin(a + 0.2) * r * 0.7, Math.cos(a - 0.2) * r * 0.7, Math.sin(a - 0.2) * r * 0.7);
        }
        g.fillStyle(0xfbbf24, 1); g.fillCircle(0, 0, r * 0.75);
        this.gezicht(c, r * 0.75);
        break;
      }
      case 'wolk': {
        g.fillStyle(0xffffff, 1);
        [[0, 0, r * 0.9], [r * 0.7, r * 0.1, r * 0.6], [-r * 0.7, r * 0.15, r * 0.55], [r * 0.3, -r * 0.3, r * 0.6]].forEach(([dx, dy, rr]) => g.fillCircle(dx, dy, rr));
        g.lineStyle(2.5, 0xcbd5e1, 1); g.strokeCircle(0, 0, r * 0.9);
        this.gezicht(c, r * 0.7);
        break;
      }
      case 'vlinder': {
        g.fillStyle(def.kleur, 1);
        g.fillEllipse(-r * 0.5, -r * 0.35, r * 0.9, r * 0.8);
        g.fillEllipse(-r * 0.45, r * 0.45, r * 0.75, r * 0.7);
        g.fillEllipse(r * 0.5, -r * 0.35, r * 0.9, r * 0.8);
        g.fillEllipse(r * 0.45, r * 0.45, r * 0.75, r * 0.7);
        g.fillStyle(0xffffff, 0.5); g.fillCircle(-r * 0.5, -r * 0.35, r * 0.18); g.fillCircle(r * 0.5, -r * 0.35, r * 0.18);
        g.fillStyle(INKT, 1); g.fillEllipse(0, 0, r * 0.24, r * 1.3);
        g.lineStyle(2, INKT, 1); g.lineBetween(0, -r * 0.6, -r * 0.2, -r * 0.9); g.lineBetween(0, -r * 0.6, r * 0.2, -r * 0.9);
        break;
      }
      case 'boom': {
        g.fillStyle(0x8a5a2b, 1); g.fillRoundedRect(-r * 0.16, r * 0.2, r * 0.32, r * 0.9, r * 0.1);
        g.fillStyle(def.kleur, 1);
        g.fillCircle(0, -r * 0.3, r * 0.7); g.fillCircle(-r * 0.5, r * 0.05, r * 0.5); g.fillCircle(r * 0.5, r * 0.05, r * 0.5);
        g.fillStyle(0xffffff, 0.15); g.fillCircle(-r * 0.2, -r * 0.5, r * 0.3);
        break;
      }
      case 'slang': {
        g.lineStyle(r * 0.5, def.kleur, 1);
        g.beginPath(); g.moveTo(-r * 0.9, r * 0.5);
        g.lineTo(-r * 0.3, -r * 0.2); g.lineTo(r * 0.3, r * 0.4); g.lineTo(r * 0.8, -r * 0.3);
        g.strokePath();
        g.fillStyle(def.kleur, 1); g.fillCircle(r * 0.8, -r * 0.3, r * 0.42);
        c.add(this.add.circle(r * 0.72, -r * 0.42, r * 0.1, 0xffffff).setStrokeStyle(1, INKT));
        c.add(this.add.circle(r * 0.92, -r * 0.42, r * 0.1, 0xffffff).setStrokeStyle(1, INKT));
        c.add(this.add.circle(r * 0.72, -r * 0.42, r * 0.045, INKT));
        c.add(this.add.circle(r * 0.92, -r * 0.42, r * 0.045, INKT));
        const tong = this.add.graphics(); tong.lineStyle(2, 0xe8402c, 1);
        tong.lineBetween(r * 0.82, -r * 0.1, r * 0.82, r * 0.15); c.add(tong);
        break;
      }
      default: {
        g.fillStyle(def.kleur, 1); g.fillCircle(0, 0, r);
      }
    }
    return c;
  }
}
