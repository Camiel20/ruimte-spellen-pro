// ===== LETTER-LAND — WERELDKAART =====
// De kaart van Letter-Land: Wereld 1 "De Praatweide" met een stip per level.
// Lineair vrijspelend (het vorige level uit → het volgende open). Tik op een
// open level = spelen. Terug-knop → hoofdmenu. Eigen "current" afgeleid uit de
// voortgang (geen aparte pointer nodig; level-ids 'alfa-*' botsen niet met de
// getallen-voortgang).

import Phaser from 'phaser';
import { SFX } from '../sound.js';
import { getLevelRecord, getLevelSterren, getSetting } from '../progress.js';
import { RAINBOW } from '../glyphs.js';
import { LETTER_LEVELS } from '../levels/letterLevels.js';
import { tekenPotloodLijf } from '../adventure/letterCast.js';

export default class LetterMapScene extends Phaser.Scene {
  constructor() { super('LetterMap'); }

  create() {
    const W = this.scale.width, H = this.scale.height;

    // achtergrond: de Praatweide
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x9ad7ff, 0x9ad7ff, 0xbdeeff, 0xbdeeff, 1);
    sky.fillRect(0, 0, W, H);
    const gras = this.add.graphics();
    gras.fillStyle(0x63c24d, 1); gras.fillRect(0, H - 90, W, 90);
    gras.fillStyle(0x4fae4a, 1); gras.fillRect(0, H - 90, W, 12);
    const zg = this.add.graphics();
    zg.fillStyle(0xfff3b0, 0.4); zg.fillCircle(W - 60, 70, 46);
    zg.fillStyle(0xffe16b, 1); zg.fillCircle(W - 60, 70, 28);

    // titel-balk
    const kop = this.add.graphics();
    kop.fillStyle(0xffffff, 0.85); kop.fillRoundedRect(40, 22, W - 80, 46, 16);
    this.add.text(W / 2, 45, '🔤 De Praatweide', {
      fontFamily: 'Arial Black, Arial', fontSize: '22px', fontStyle: 'bold', color: '#16202b',
    }).setOrigin(0.5);

    // huidig level = eerste dat nog niet gehaald is
    let curIdx = LETTER_LEVELS.findIndex((L) => !(getLevelRecord(L.id) || {}).done);
    if (curIdx < 0) curIdx = LETTER_LEVELS.length - 1;

    // posities (slingerend pad van boven naar onder)
    const nodes = LETTER_LEVELS.map((L, i) => ({
      L, i,
      x: W / 2 + Math.sin(i * 1.1) * 110,
      y: 130 + i * ((H - 260) / (LETTER_LEVELS.length - 1)),
    }));

    // het pad
    const pad = this.add.graphics().setDepth(1);
    pad.lineStyle(10, 0xffffff, 0.55);
    pad.beginPath(); pad.moveTo(nodes[0].x, nodes[0].y);
    for (let i = 1; i < nodes.length; i++) pad.lineTo(nodes[i].x, nodes[i].y);
    pad.strokePath();

    nodes.forEach((nd) => this.maakNode(nd, curIdx));

    // Priet kijkt mee bij het huidige level
    const cur = nodes[curIdx];
    const priet = this.add.container(cur.x - 52, cur.y).setDepth(20);
    const plijf = this.add.container(0, 0); tekenPotloodLijf(this, plijf); priet.add(plijf);
    this.tweens.add({ targets: priet, y: cur.y - 12, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // terug-knop → menu
    const terug = this.add.container(46, H - 44).setDepth(30);
    const tg = this.add.graphics();
    tg.fillStyle(0xe8402c, 1); tg.fillCircle(0, 0, 26); tg.lineStyle(4, 0xb93227, 1); tg.strokeCircle(0, 0, 26);
    terug.add([tg, this.add.text(0, 0, '🏠', { fontSize: '22px' }).setOrigin(0.5)]);
    terug.setSize(60, 60).setInteractive({ useHandCursor: true });
    terug.on('pointerdown', () => { SFX.click(); this.scene.start('Menu'); });
  }

  maakNode(nd, curIdx) {
    const { L, i, x, y } = nd;
    const rec = getLevelRecord(L.id) || {};
    const open = getSetting('ouderModus') || i === 0 || (getLevelRecord(LETTER_LEVELS[i - 1].id) || {}).done;
    const kleur = RAINBOW[i % RAINBOW.length];
    const isBoss = !!L.boss || !!L.sisser;
    const c = this.add.container(x, y).setDepth(5);
    const g = this.add.graphics();
    const R = isBoss ? 34 : 28;
    if (rec.done) {
      g.fillStyle(kleur, 1); g.fillRoundedRect(-R, -R, R * 2, R * 2, 12);
      g.fillStyle(0xffffff, 0.22); g.fillRoundedRect(-R, -R, R * 2, R * 0.8, 12);
      g.lineStyle(4, 0x2b2f3a, 1); g.strokeRoundedRect(-R, -R, R * 2, R * 2, 12);
    } else if (open) {
      g.fillStyle(0xffffff, 1); g.fillRoundedRect(-R, -R, R * 2, R * 2, 12);
      g.lineStyle(4, i === curIdx ? 0x2fae4e : kleur, 1); g.strokeRoundedRect(-R, -R, R * 2, R * 2, 12);
    } else {
      g.fillStyle(0xd8dee5, 1); g.fillRoundedRect(-R, -R, R * 2, R * 2, 12);
      g.lineStyle(4, 0x9aa0a6, 1); g.strokeRoundedRect(-R, -R, R * 2, R * 2, 12);
    }
    c.add(g);
    // het woord op de node
    const woord = L.goal.woord || '?';
    if (open || rec.done) {
      c.add(this.add.text(0, isBoss ? -4 : 0, isBoss ? 'BAAS' : woord, {
        fontFamily: 'Arial Black, Arial', fontSize: isBoss ? '14px' : '18px', fontStyle: 'bold',
        color: rec.done ? '#ffffff' : '#16202b',
      }).setOrigin(0.5));
      if (isBoss) c.add(this.add.text(0, 14, woord, { fontFamily: 'Arial Black, Arial', fontSize: '13px', fontStyle: 'bold', color: rec.done ? '#ffffff' : '#565b61' }).setOrigin(0.5));
    } else {
      c.add(this.add.text(0, 0, '🔒', { fontSize: '22px' }).setOrigin(0.5));
    }
    // sterren-stempeltjes onder gehaalde levels
    if (rec.done) {
      const st = getLevelSterren(L.id);
      for (let k = 0; k < 3; k++) {
        c.add(this.add.star(-16 + k * 16, R + 10, 5, 4, 8, k < st ? 0xffe16b : 0xced6de).setStrokeStyle(1.5, 0xb98d12));
      }
    }
    if (i === curIdx && !rec.done) this.tweens.add({ targets: c, scale: 1.1, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    if (open) {
      const hit = this.add.rectangle(x, y, R * 2 + 20, R * 2 + 20, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => {
        SFX.click();
        this.scene.start('Adventure', { levelSet: LETTER_LEVELS, levelIndex: i, homeScene: 'LetterMap' });
      });
    }
  }
}
