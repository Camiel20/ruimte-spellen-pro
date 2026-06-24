import Phaser from 'phaser';
import { SFX } from '../sound.js';
import { getHigh, saveHigh, addStars, giveMedal } from '../progress.js';

// Ballon Merge — schone versie met gescheiden datamodel.
//
// BELANGRIJKE AANPAK (hiermee zijn de merge-bugs opgelost):
// We houden TWEE dingen apart:
//   1. this.vals[r][c]    = puur de getallen (het "brein" van het spel)
//   2. this.sprites[r][c] = de getekende ballonnen (het "plaatje")
// Eerst rekenen we ALLE merges + zwaartekracht uit op de getallen,
// daarna pas verplaatsen we de plaatjes. Zo kan het plaatje nooit meer
// uit de pas lopen met de werkelijke spelstaat.
//
// Spelregel: gelijke buren (boven/onder/links/rechts) versmelten en
// VERDUBBELEN. Twee 8'en -> 16. Drie 8'en aan elkaar -> 8,16,32 enzovoort.

const COLS = 6;
const ROWS = 8;

const COLORS = {
  2: [0x4ade80, 0x16a34a], 4: [0x22d3ee, 0x0891b2],
  8: [0x60a5fa, 0x2563eb], 16: [0xa78bfa, 0x7c3aed],
  32: [0xe879f9, 0xc026d3], 64: [0xfb923c, 0xea580c],
  128: [0xf87171, 0xdc2626], 256: [0xfbbf24, 0xd97706],
  512: [0x14b8a6, 0x0d9488], 1024: [0xf43f5e, 0xbe123c],
  2048: [0x8b5cf6, 0x6d28d9], 4096: [0xec4899, 0xbe185d],
};

export default class BalloonScene extends Phaser.Scene {
  constructor() {
    super('Balloon');
  }

  create() {
    const { width, height } = this.scale;
    this.cellW = width / COLS;
    this.topH = 90;
    this.boardTop = this.topH;

    // Sterren-achtergrond
    for (let i = 0; i < 50; i++) {
      const s = this.add.image(
        Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), 'star'
      ).setAlpha(Phaser.Math.FloatBetween(0.2, 0.7));
      this.tweens.add({
        targets: s, alpha: 0.1, duration: Phaser.Math.Between(1500, 3000),
        yoyo: true, repeat: -1,
      });
    }

    // DATAMODEL: alleen getallen (0 = leeg)
    this.vals = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    // VISUEEL: de bijbehorende sprites (null = leeg)
    this.sprites = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

    this.score = 0;
    this.highest = 2;
    this.busy = false;

    this.scoreText = this.add.text(16, 16, '🏆 0', {
      fontFamily: 'Arial', fontSize: '22px', fontStyle: 'bold', color: '#fff',
    });
    this.nextText = this.add.text(width / 2, 50, '', {
      fontFamily: 'Arial', fontSize: '16px', color: '#94a3b8',
    }).setOrigin(0.5);

    const back = this.add.text(width - 16, 16, '⬅ Terug', {
      fontFamily: 'Arial', fontSize: '16px', color: '#94a3b8',
      backgroundColor: '#1e293b', padding: { x: 10, y: 6 },
    }).setOrigin(1, 0).setInteractive();
    back.on('pointerdown', () => this.scene.start('Menu'));

    const line = this.add.graphics();
    line.lineStyle(1, 0xffffff, 0.1);
    line.lineBetween(0, this.topH, width, this.topH);

    this.hoverCol = Math.floor(COLS / 2);
    this.pickNext();
    this.spawnHover();

    // Tikken in een kolom laat de ballon daar meteen vallen.
    // Slepen mag ook: de ballon volgt je vinger en valt los bij loslaten.
    this.input.on('pointerdown', (p) => {
      if (this.busy) return;
      // negeer tikken op de terug-knop bovenaan
      if (p.y < this.topH) return;
      this.hoverCol = Phaser.Math.Clamp(Math.floor(p.x / this.cellW), 0, COLS - 1);
      if (this.hover) this.hover.x = this.cellX(this.hoverCol);
      this.dragging = true;
    });
    this.input.on('pointermove', (p) => {
      if (this.busy || !this.dragging) return;
      this.hoverCol = Phaser.Math.Clamp(Math.floor(p.x / this.cellW), 0, COLS - 1);
      if (this.hover) this.hover.x = this.cellX(this.hoverCol);
    });
    this.input.on('pointerup', (p) => {
      if (this.busy) { this.dragging = false; return; }
      if (!this.dragging) return;
      this.dragging = false;
      // gebruik de kolom waar de vinger losliet
      if (p && p.y >= this.topH) {
        this.hoverCol = Phaser.Math.Clamp(Math.floor(p.x / this.cellW), 0, COLS - 1);
      }
      this.drop(this.hoverCol);
    });
  }

  pickNext() {
    const maxDrop = Math.max(2, this.highest);
    const opts = [];
    let v = 2;
    while (v <= maxDrop) {
      const weight = v === 2 ? 4 : 3;
      for (let i = 0; i < weight; i++) opts.push(v);
      v *= 2;
    }
    this.nextVal = Phaser.Utils.Array.GetRandom(opts);
  }

  cellX(col) { return col * this.cellW + this.cellW / 2; }
  cellY(row) { return this.boardTop + row * this.cellW + this.cellW / 2; }

  makeBalloon(val, x, y) {
    const [light, dark] = COLORS[val] || COLORS[4096];
    const c = this.add.container(x, y);
    const r = this.cellW * 0.4;

    // De echte ballon-afbeelding, ingekleurd met de waarde-kleur.
    // De afbeelding heeft al glans en schaduw, dus geen extra lagen nodig.
    const body = this.add.image(0, 0, 'balloon').setDisplaySize(r * 2.1, r * 2.1).setTint(light);

    // Nummer met een lichte donkere cirkel eronder voor leesbaarheid
    const disc = this.add.circle(0, 0, r * 0.52, dark, 0.35);
    const label = this.add.text(0, 0, String(val), {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: `${val >= 100 ? r * 0.62 : r * 0.85}px`, color: '#ffffff',
      stroke: '#00000055', strokeThickness: 3,
    }).setOrigin(0.5);

    c.add([body, disc, label]);
    return c;
  }

  spawnHover() {
    this.hover = this.makeBalloon(this.nextVal, this.cellX(this.hoverCol), this.topH / 2);
    this.hoverBob = this.tweens.add({
      targets: this.hover, y: this.topH / 2 - 5,
      duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut',
    });
    this.nextText.setText(`Volgende: ${this.nextVal}`);
  }

  findRow(col) {
    for (let r = ROWS - 1; r >= 0; r--) if (this.vals[r][col] === 0) return r;
    return -1;
  }

  drop(col) {
    const row = this.findRow(col);
    if (row === -1) return;
    this.busy = true;

    const ball = this.hover;
    this.hoverBob.stop();
    this.hover = null;

    const val = this.nextVal;
    this.vals[row][col] = val;
    this.sprites[row][col] = ball;
    this.lastDrop = { r: row, c: col }; // onthoud waar je net liet vallen
    this.pickNext();
    SFX.pop();

    this.tweens.add({
      targets: ball,
      x: this.cellX(col),
      y: this.cellY(row),
      duration: 350,
      ease: 'Bounce.easeOut',
      onComplete: () => this.resolveStep(),
    });
  }

  // Eén stap: zwaartekracht, dan zoek een merge en voer hem uit.
  // We werken steeds eerst het datamodel (vals) bij; sprites volgen.
  resolveStep() {
    this.applyGravityData();

    const group = this.findGroupData();
    if (group) {
      this.doGroupData(group.cells, group.val);
      this.time.delayedCall(220, () => this.resolveStep());
    } else {
      this.lastDrop = null; // ketting klaar; volgende drop begint vers
      this.syncSprites();
      this.busy = false;
      this.spawnHover();
      for (let c = 0; c < COLS; c++) {
        if (this.vals[0][c] !== 0) { this.gameOver(); return; }
      }
    }
  }

  // Zwaartekracht op BEIDE arrays tegelijk, zodat ze gelijk blijven
  applyGravityData() {
    for (let c = 0; c < COLS; c++) {
      const colVals = [];
      const colSprites = [];
      let dropOldRow = -1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (this.vals[r][c] !== 0) {
          // onthoud welk item in deze kolom de "laatste actie"-cel is
          if (this.lastDrop && this.lastDrop.c === c && this.lastDrop.r === r) {
            dropOldRow = colVals.length; // index in de gestapelde lijst
          }
          colVals.push(this.vals[r][c]);
          colSprites.push(this.sprites[r][c]);
        }
      }
      for (let r = ROWS - 1, i = 0; r >= 0; r--, i++) {
        if (i < colVals.length) {
          this.vals[r][c] = colVals[i];
          this.sprites[r][c] = colSprites[i];
          // laat lastDrop met de gevallen ballon meebewegen
          if (i === dropOldRow) this.lastDrop = { r, c };
        } else {
          this.vals[r][c] = 0;
          this.sprites[r][c] = null;
        }
      }
    }
  }

  // Zoek een aaneengesloten GROEP van 2+ gelijke ballonnen (flood-fill).
  // Zo versmelten drie-of-meer-op-een-rij in één keer samen.
  findGroupData() {
    const seen = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    for (let r = ROWS - 1; r >= 0; r--) {
      for (let c = 0; c < COLS; c++) {
        if (this.vals[r][c] === 0 || seen[r][c]) continue;
        const v = this.vals[r][c];
        const group = [];
        const stack = [[r, c]];
        seen[r][c] = true;
        while (stack.length) {
          const [cr, cc] = stack.pop();
          group.push([cr, cc]);
          for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nr = cr + dr, nc = cc + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS &&
                !seen[nr][nc] && this.vals[nr][nc] === v) {
              seen[nr][nc] = true;
              stack.push([nr, nc]);
            }
          }
        }
        if (group.length >= 2) return { cells: group, val: v };
      }
    }
    return null;
  }

  // Versmelt een hele groep tegelijk. Elke extra ballon verdubbelt.
  // 2 gelijke -> x2, 3 -> x4, 4 -> x8 ... en het resultaat landt op de
  // laagste (en bij gelijke hoogte meest linkse) cel van de groep.
  doGroupData(group, val) {
    // Bepaal de doelcel waar het resultaat verschijnt.
    // Voorkeur 1: de cel die je zojuist liet vallen (voelt natuurlijk:
    //   het samenvoegen gebeurt waar JIJ de ballon neerlegde).
    // Voorkeur 2: anders de laagste, dan meest rechtse cel.
    let target = null;
    if (this.lastDrop) {
      const inGroup = group.find(([r, c]) => r === this.lastDrop.r && c === this.lastDrop.c);
      if (inGroup) target = inGroup;
    }
    if (!target) {
      target = group[0];
      for (const [r, c] of group) {
        if (r > target[0] || (r === target[0] && c > target[1])) target = [r, c];
      }
    }
    const [trow, tcol] = target;
    const tx = this.cellX(tcol), ty = this.cellY(trow);
    // Houd vast waar deze merge landde, zodat een eventuele KETTING-merge
    // daarna óók naar deze plek toe trekt (en niet ineens de andere kant op).
    // Zwaartekracht verandert hierna alleen de rij binnen dezelfde kolom,
    // dus we updaten de rij in applyGravityData mee.
    this.lastDrop = { r: trow, c: tcol };

    let nv = val;
    // Alle niet-doel ballonnen vliegen naar het doel en verdwijnen
    group.forEach(([r, c]) => {
      if (r === trow && c === tcol) return;
      nv *= 2;
      const spr = this.sprites[r][c];
      this.vals[r][c] = 0;
      this.sprites[r][c] = null;
      if (spr) {
        this.tweens.add({
          targets: spr, x: tx, y: ty, scale: 0, duration: 160,
          onComplete: () => spr.destroy(),
        });
      }
    });

    // Vervang de doel-ballon door de nieuwe waarde
    const oldSpr = this.sprites[trow][tcol];
    if (oldSpr) oldSpr.destroy();
    this.vals[trow][tcol] = nv;
    const merged = this.makeBalloon(nv, tx, ty);
    merged.setScale(0.6);
    this.sprites[trow][tcol] = merged;
    this.tweens.add({ targets: merged, scale: 1, duration: 200, ease: 'Back.easeOut' });

    this.burst(tx, ty, (COLORS[nv] || COLORS[4096])[0]);
    SFX.merge(nv);

    this.score += nv;
    this.scoreText.setText('🏆 ' + this.score.toLocaleString('nl-NL'));
    if (nv > this.highest) this.highest = nv;
    if (nv >= 512) giveMedal('balloon_512');
    if (nv >= 64) this.cameras.main.shake(150, 0.005);
  }

  // Schuif elke sprite naar de plek die zijn datamodel-cel aangeeft
  syncSprites() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const spr = this.sprites[r][c];
        if (spr) {
          const tx = this.cellX(c), ty = this.cellY(r);
          if (Math.abs(spr.x - tx) > 0.5 || Math.abs(spr.y - ty) > 0.5) {
            this.tweens.add({ targets: spr, x: tx, y: ty, duration: 150, ease: 'Quad.easeIn' });
          }
        }
      }
    }
  }

  burst(x, y, color) {
    const particles = this.add.particles(x, y, 'star', {
      speed: { min: 50, max: 200 },
      scale: { start: 1.5, end: 0 },
      lifespan: 500, quantity: 12, tint: color, blendMode: 'ADD',
    });
    this.time.delayedCall(500, () => particles.destroy());
  }

  gameOver() {
    SFX.gameover();
    const { width, height } = this.scale;
    const cx = width / 2, cy = height / 2;
    const isRecord = saveHigh('balloon', this.score);
    const high = getHigh('balloon');
    const earned = Math.max(1, Math.floor(this.score / 200));
    addStars(earned);
    const bg = this.add.graphics().setDepth(200);
    bg.fillStyle(0x000000, 0.8);
    bg.fillRect(0, 0, width, height);
    this.add.text(cx, cy - 50, 'Ballonnen vol! 🎈', {
      fontFamily: 'Arial', fontSize: '32px', fontStyle: 'bold', color: '#fff',
    }).setOrigin(0.5).setDepth(201);
    this.add.text(cx, cy, `Score: ${this.score.toLocaleString('nl-NL')}`, {
      fontFamily: 'Arial', fontSize: '20px', color: '#94a3b8',
    }).setOrigin(0.5).setDepth(201);
    this.add.text(cx, cy + 32, isRecord ? '🌟 Nieuw record! 🌟' : `Record: ${high.toLocaleString('nl-NL')}`, {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: isRecord ? '#fbbf24' : '#64748b',
    }).setOrigin(0.5).setDepth(201);
    this.add.text(cx, cy + 56, `+${earned} ⭐`, {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#fbbf24',
    }).setOrigin(0.5).setDepth(201);
    const btn = this.add.text(cx, cy + 100, 'Opnieuw 🔄', {
      fontFamily: 'Arial', fontSize: '22px', fontStyle: 'bold',
      color: '#1a1a2e', backgroundColor: '#fbbf24', padding: { x: 24, y: 12 },
    }).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => this.scene.restart());
  }
}
