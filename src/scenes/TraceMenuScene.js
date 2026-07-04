import Phaser from 'phaser';
import { SFX, initAudio } from '../sound.js';
import { getSetting } from '../progress.js';
import { luchtAchtergrond, terugKnop, schermTitel } from '../theme.js';

// Kiesscherm voor het Schrijven-spel: cijfers, letters of je eigen naam.

export default class TraceMenuScene extends Phaser.Scene {
  constructor() { super('TraceMenu'); }

  create() {
    const { width } = this.scale;
    luchtAchtergrond(this);
    terugKnop(this);
    schermTitel(this, 90, '✏️ Wat wil je schrijven?');

    const childName = (getSetting('childName') || 'Adrian');

    this.card(width / 2, 210, '🔢  Cijfers', '1 tot en met 10', 0x60a5fa, 'digits');
    this.card(width / 2, 320, '🔤  Letters', 'het hele alfabet A-Z', 0xfb923c, 'letters');
    this.card(width / 2, 430, `🌟  Mijn naam`, `schrijf "${childName}"`, 0xec4899, 'name');
  }

  card(x, y, title, sub, color, mode) {
    const w = 320, h = 84;
    const c = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.92);
    bg.lineStyle(3.5, color, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 16);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 16);
    const t = this.add.text(-w / 2 + 20, -16, title, {
      fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold',
      color: '#1f2d3a',
    });
    const s = this.add.text(-w / 2 + 20, 14, sub, {
      fontFamily: 'Arial', fontSize: '13px', color: '#5b7083',
    });
    c.add([bg, t, s]);
    const hit = this.add.rectangle(0, 0, w, h, 0xffffff, 0).setInteractive({ useHandCursor: true });
    c.add(hit);
    hit.on('pointerdown', () => {
      initAudio(); SFX.click();
      this.tweens.add({ targets: c, scale: 0.96, duration: 80, yoyo: true,
        onComplete: () => this.scene.start('Trace', { mode }) });
    });
  }
}
