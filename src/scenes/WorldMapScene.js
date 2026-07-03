import Phaser from 'phaser';
import { SFX } from '../sound.js';
import { getLevelRecord, getLevelSterren, getAdventureCurrent, getStars } from '../progress.js';
import { sig } from '../adventure/palette.js';
import { WORLDS } from '../levels/index.js';

// ===== WERELDKAART =====
// Het level-overzicht van Getallen-Land: een kronkelpad met een stip per
// level, gegroepeerd per wereld (elke wereld z'n eigen landschapskleur).
// - gehaald  → gekleurde kubus + ✔ (en een ster-stempel als de ster gepakt is)
// - huidig   → pulserende kubus met ▶
// - op slot  → grijze kubus met slotje (niet klikbaar)
// Tik op een open level = spelen. Grote "Verder spelen"-knop onderin.
// Geen tekst nodig om te snappen waar je bent — voortgang is zichtbaar als pad.


const HEADER_H = 88;   // vaste balk bovenin
const FOOTER_H = 96;   // vaste balk onderin (verder spelen)
const ROW_H = 96;      // hoogte per level-stip
const WORLD_PAD = 64;  // ruimte voor elke wereld-kop

export default class WorldMapScene extends Phaser.Scene {
  constructor() { super('WorldMap'); }

  create() {
    const W = this.scale.width, H = this.scale.height;

    // Alle levels plat + posities berekenen (van onder naar boven klimmen
    // voelt als "omhoog reizen", maar van boven naar beneden scrollen leest
    // makkelijker voor een kind → wereld 1 bovenaan, pad slingert naar beneden).
    this.entries = [];
    let y = HEADER_H + 30;
    WORLDS.forEach((world, wi) => {
      this.entries.push({ type: 'header', world, y: y + 18 });
      y += WORLD_PAD;
      world.levels.forEach((lvl, li) => {
        const x = W / 2 + Math.sin((this.entries.length) * 1.05) * 120; // slinger
        this.entries.push({ type: 'level', lvl, world: wi, x, y });
        y += ROW_H;
      });
      y += 26;
    });
    const contentH = y + FOOTER_H;

    // Totaal VERDIENDE sterren (max 3 per level) — opent de wereld-poorten.
    this.totaalSterren = this.entries
      .filter((e) => e.type === 'level')
      .reduce((sum, e) => sum + getLevelSterren(e.lvl.id), 0);

    this.cameras.main.setBounds(0, 0, W, Math.max(contentH, H));
    this.buildBackground(W, Math.max(contentH, H));
    this.buildPath();
    this.buildNodes();
    this.buildChrome(W, H);
    this.enableScroll(contentH, H);

    // Kaart opent gecentreerd op het huidige level.
    const cur = this.currentEntry();
    if (cur) this.cameras.main.scrollY = Phaser.Math.Clamp(cur.y - H / 2, 0, Math.max(0, contentH - H));
  }

  currentId() {
    const cur = getAdventureCurrent();
    if (cur) return cur;
    // nog nooit gespeeld → eerste level
    const first = this.entries.find((e) => e.type === 'level');
    return first ? first.lvl.id : null;
  }

  currentEntry() {
    const id = this.currentId();
    return this.entries.find((e) => e.type === 'level' && e.lvl.id === id) || null;
  }

  levelIndexOf(id) {
    let i = 0, found = -1;
    this.entries.forEach((e) => {
      if (e.type !== 'level') return;
      if (e.lvl.id === id) found = i;
      i += 1;
    });
    return found;
  }

  // Een level is speelbaar als het gehaald is, of het eerstvolgende is —
  // én de wereld-poort open is (genoeg verdiende sterren).
  isUnlocked(id) {
    const rec = getLevelRecord(id);
    if (rec && rec.done) return true; // al gehaald blijft altijd open
    const entry = this.entries.find((e) => e.type === 'level' && e.lvl.id === id);
    if (entry && this.totaalSterren < (WORLDS[entry.world].sterren || 0)) return false;
    let prevDone = true; // eerste level is altijd open
    for (const e of this.entries) {
      if (e.type !== 'level') continue;
      if (e.lvl.id === id) return prevDone;
      const r = getLevelRecord(e.lvl.id);
      prevDone = !!(r && r.done);
    }
    return false;
  }

  buildBackground(W, H) {
    // Banden per wereld: lucht bovenaan, dan per wereld z'n landschapskleur.
    const g = this.add.graphics().setDepth(-20);
    g.fillGradientStyle(0x8fd3ff, 0x8fd3ff, 0xbfe8ff, 0xbfe8ff, 1);
    g.fillRect(0, 0, W, H);
    // zachte kleurvlekken per wereld-sectie
    this.entries.filter((e) => e.type === 'header').forEach((e, i) => {
      const nextHeader = this.entries.filter((x) => x.type === 'header')[i + 1];
      const endY = nextHeader ? nextHeader.y - 40 : H;
      g.fillStyle(WORLDS[i].bottom, 0.35);
      g.fillRoundedRect(14, e.y - 26, W - 28, endY - e.y + 20, 26);
    });
    // wolkjes
    for (let i = 0; i < Math.ceil(H / 260); i++) {
      const c = this.add.graphics().setDepth(-18);
      const x = 40 + ((i * 173) % (W - 80)), yy = 60 + i * 260;
      c.fillStyle(0xffffff, 0.75);
      c.fillCircle(x, yy, 18); c.fillCircle(x + 20, yy + 5, 14); c.fillCircle(x - 18, yy + 5, 12);
      this.tweens.add({ targets: c, x: 14, duration: 5200 + i * 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
  }

  buildPath() {
    // Gestippeld pad langs de level-stippen.
    const pts = this.entries.filter((e) => e.type === 'level');
    const g = this.add.graphics().setDepth(-10);
    g.lineStyle(7, 0xffffff, 0.85);
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const steps = 9;
      for (let s = 0; s < steps; s += 2) {
        const t1 = s / steps, t2 = (s + 1) / steps;
        const mx = (a.x + b.x) / 2;
        // zachte curve via kwadratische interpolatie
        const q = (t) => {
          const x = Phaser.Math.Interpolation.QuadraticBezier(t, a.x, mx, b.x);
          const y2 = Phaser.Math.Interpolation.QuadraticBezier(t, a.y, (a.y + b.y) / 2, b.y);
          return [x, y2];
        };
        const [x1, y1] = q(t1), [x2, y2] = q(t2);
        g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokePath();
      }
    }
  }

  buildNodes() {
    const curId = this.currentId();
    this.entries.forEach((e) => {
      if (e.type === 'header') {
        this.add.text(this.scale.width / 2, e.y, e.world.naam, {
          fontFamily: 'Arial Black, Arial', fontSize: '20px', fontStyle: 'bold', color: '#ffffff',
        }).setOrigin(0.5).setStroke('#1f2d3a', 6).setDepth(5);
        // Wereld-poort: nog niet genoeg sterren? Toon wat er nodig is.
        const nodig = e.world.sterren || 0;
        if (this.totaalSterren < nodig) {
          this.add.text(this.scale.width / 2, e.y + 24, `🔒 Verzamel ${nodig} sterren (jij hebt ${this.totaalSterren})`, {
            fontFamily: 'Arial', fontSize: '13px', fontStyle: 'bold', color: '#ffe16b',
          }).setOrigin(0.5).setStroke('#1f2d3a', 4).setDepth(5);
        }
        return;
      }
      this.drawLevelNode(e, e.lvl.id === curId);
    });
  }

  drawLevelNode(e, isCurrent) {
    const id = e.lvl.id;
    const rec = getLevelRecord(id);
    const done = !!(rec && rec.done);
    const unlocked = this.isUnlocked(id);
    const isBoss = !!e.lvl.boss;
    const s = isBoss ? 64 : 54; // baas-levels iets groter
    const num = parseInt(id.split('-')[1], 10) || 1;
    const col = done || isCurrent ? sig(num) : 0x9aa0a6;

    const c = this.add.container(e.x, e.y).setDepth(10);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.16); g.fillEllipse(0, s / 2 + 6, s + 10, 12);
    g.fillStyle(col, 1); g.fillRoundedRect(-s / 2, -s / 2, s, s, 12);
    g.fillStyle(0xffffff, 0.28); g.fillRoundedRect(-s / 2 + 5, -s / 2 + 4, s - 10, s * 0.3, 8);
    g.lineStyle(4, 0x1f2d3a, 1); g.strokeRoundedRect(-s / 2, -s / 2, s, s, 12);
    c.add(g);

    const label = this.add.text(0, -2, id, {
      fontFamily: 'Arial Black, Arial', fontSize: isBoss ? '20px' : '17px', fontStyle: 'bold',
      color: unlocked ? '#16202b' : '#5b6168',
    }).setOrigin(0.5);
    c.add(label);

    if (!unlocked) {
      // slotje
      const lock = this.add.graphics();
      lock.fillStyle(0x5b6168, 1); lock.fillRoundedRect(-9, 8, 18, 14, 4);
      lock.lineStyle(3.5, 0x5b6168, 1); lock.beginPath(); lock.arc(0, 8, 7, Math.PI, 2 * Math.PI); lock.strokePath();
      c.add(lock);
    } else if (done) {
      // ✔-stempel + drie sterren-slots eronder (vol = verdiend, grijs = nog
      // te halen → reden om het level opnieuw te spelen!)
      const st = this.add.graphics();
      st.fillStyle(0x2fae4e, 1); st.fillCircle(s / 2 - 4, -s / 2 + 4, 12);
      st.lineStyle(3.5, 0xffffff, 1);
      st.beginPath(); st.moveTo(s / 2 - 10, -s / 2 + 4); st.lineTo(s / 2 - 6, -s / 2 + 9); st.lineTo(s / 2 + 3, -s / 2 - 3); st.strokePath();
      c.add(st);
      const earned = getLevelSterren(id);
      for (let i = 0; i < 3; i++) {
        const mst = this.add.image(-18 + i * 18, s / 2 + 13, 'star').setScale(1.7);
        if (i >= earned) mst.setTint(0x6b7280).setAlpha(0.55);
        c.add(mst);
      }
    }

    if (isCurrent && unlocked) {
      // ▶-vlaggetje + pulsen: hier ben je!
      const play = this.add.text(0, -s / 2 - 20, '▶', { fontSize: '22px', color: '#ffffff' })
        .setOrigin(0.5).setStroke('#e8402c', 6);
      c.add(play);
      this.tweens.add({ targets: c, scale: 1.1, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.tweens.add({ targets: play, y: -s / 2 - 26, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }

    if (unlocked) {
      c.setSize(s + 22, s + 22);
      c.setInteractive({ useHandCursor: true });
      c.on('pointerup', () => {
        if (this._dragging) return; // scroll-sleep ≠ klik
        SFX.click();
        this.tweens.add({ targets: c, scale: 0.9, duration: 80, yoyo: true, onComplete: () => {
          this.scene.start('Adventure', { levelIndex: this.levelIndexOf(id) });
        } });
      });
    }
  }

  buildChrome(W, H) {
    // Vaste kop: terug + titel + sterren
    const top = this.add.graphics().setScrollFactor(0).setDepth(50);
    top.fillStyle(0x16202b, 0.55); top.fillRoundedRect(8, 10, W - 16, HEADER_H - 26, 16);
    const back = this.add.graphics().setScrollFactor(0).setDepth(51);
    back.fillStyle(0xffffff, 1); back.fillTriangle(40, 24, 40, 48, 22, 36); back.fillRect(40, 32, 12, 8);
    back.setInteractive(new Phaser.Geom.Rectangle(12, 14, 52, 46), Phaser.Geom.Rectangle.Contains);
    back.on('pointerdown', () => { SFX.click(); this.scene.start('Menu'); });
    this.add.text(W / 2, 36, '🗺️ Getallen-Land', {
      fontFamily: 'Arial Black, Arial', fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51).setStroke('#1f2d3a', 5);
    this.add.image(W - 66, 36, 'star').setScrollFactor(0).setDepth(51).setScale(2.2);
    this.add.text(W - 20, 36, `${getStars()}`, {
      fontFamily: 'Arial Black, Arial', fontSize: '20px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(51).setStroke('#1f2d3a', 5);

    // Vaste voet: grote "Verder spelen"-knop
    const cur = this.currentEntry();
    const bw = 260, bh = 58, bx = W / 2, by = H - FOOTER_H / 2 - 6;
    const btn = this.add.graphics().setScrollFactor(0).setDepth(50);
    btn.fillStyle(0x000000, 0.25); btn.fillRoundedRect(bx - bw / 2 + 3, by - bh / 2 + 4, bw, bh, 18);
    btn.fillStyle(0x2fae4e, 1); btn.fillRoundedRect(bx - bw / 2, by - bh / 2, bw, bh, 18);
    btn.lineStyle(4, 0x1f7a36, 1); btn.strokeRoundedRect(bx - bw / 2, by - bh / 2, bw, bh, 18);
    const btxt = this.add.text(bx, by, cur ? `▶ Verder spelen  (${cur.lvl.id})` : '▶ Spelen', {
      fontFamily: 'Arial Black, Arial', fontSize: '20px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51).setStroke('#1f7a36', 4);
    const hit = this.add.rectangle(bx, by, bw + 16, bh + 16, 0xffffff, 0.001)
      .setScrollFactor(0).setDepth(52).setInteractive({ useHandCursor: true });
    hit.on('pointerdown', () => {
      SFX.click();
      const target = this.currentEntry();
      this.scene.start('Adventure', target ? { levelIndex: this.levelIndexOf(target.lvl.id) } : {});
    });
    this.tweens.add({ targets: btxt, scale: 1.05, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // Dorpje-knop (linksonder): bezoek je geredde vriendjes.
    const vg = this.add.graphics().setScrollFactor(0).setDepth(50);
    vg.fillStyle(0x000000, 0.25); vg.fillRoundedRect(27, by - bh / 2 + 4, 58, 58, 16);
    vg.fillStyle(0xf6c624, 1); vg.fillRoundedRect(24, by - bh / 2, 58, 58, 16);
    vg.lineStyle(4, 0xb98d12, 1); vg.strokeRoundedRect(24, by - bh / 2, 58, 58, 16);
    const vt = this.add.text(53, by, '🏘️', { fontSize: '26px' }).setOrigin(0.5).setScrollFactor(0).setDepth(51);
    const vhit = this.add.rectangle(53, by, 66, 66, 0xffffff, 0.001)
      .setScrollFactor(0).setDepth(52).setInteractive({ useHandCursor: true });
    vhit.on('pointerdown', () => { SFX.click(); this.scene.start('Village'); });
    this.tweens.add({ targets: vt, angle: 6, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  enableScroll(contentH, H) {
    // Verticaal slepen om te scrollen (touch-vriendelijk); wiel werkt ook.
    const maxScroll = Math.max(0, contentH - H);
    this._dragging = false;
    let startY = 0, startScroll = 0;
    this.input.on('pointerdown', (p) => { startY = p.y; startScroll = this.cameras.main.scrollY; this._dragging = false; });
    this.input.on('pointermove', (p) => {
      if (!p.isDown) return;
      const dy = p.y - startY;
      if (Math.abs(dy) > 8) this._dragging = true;
      this.cameras.main.scrollY = Phaser.Math.Clamp(startScroll - dy, 0, maxScroll);
    });
    this.input.on('pointerup', () => { this.time.delayedCall(40, () => { this._dragging = false; }); });
    this.input.on('wheel', (p, o, dx, dy) => {
      this.cameras.main.scrollY = Phaser.Math.Clamp(this.cameras.main.scrollY + dy * 0.6, 0, maxScroll);
    });
  }
}
