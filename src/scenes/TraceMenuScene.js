import Phaser from 'phaser';
import { SFX, initAudio } from '../sound.js';
import { getSetting } from '../progress.js';

// Kiesscherm voor het Schrijven-spel: cijfers, letters of je eigen naam.

export default class TraceMenuScene extends Phaser.Scene {
  constructor() { super('TraceMenu'); }

  create() {
    const { width, height } = this.scale;
    for (let i = 0; i < 50; i++) {
      const s = this.add.image(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), 'star')
        .setAlpha(Phaser.Math.FloatBetween(0.2, 0.7));
      this.tweens.add({ targets: s, alpha: 0.1, duration: Phaser.Math.Between(1500, 3000), yoyo: true, repeat: -1 });
    }

    const back = this.add.text(16, 16, '⬅ Terug', {
      fontFamily: 'Arial', fontSize: '16px', color: '#94a3b8',
      backgroundColor: '#1e293b', padding: { x: 10, y: 6 },
    }).setInteractive();
    back.on('pointerdown', () => this.scene.start('Menu'));

    this.add.text(width / 2, 90, '✏️ Wat wil je schrijven?', {
      fontFamily: 'Arial', fontSize: '24px', fontStyle: 'bold', color: '#fff',
    }).setOrigin(0.5);

    const childName = (getSetting('childName') || 'Adrian');

    this.card(width / 2, 210, '🔢  Cijfers', '1 tot en met 10', 0x60a5fa, 'digits');
    this.card(width / 2, 320, '🔤  Letters', 'het hele alfabet A-Z', 0xfb923c, 'letters');
    this.card(width / 2, 430, `🌟  Mijn naam`, `schrijf "${childName}"`, 0xec4899, 'name');
  }

  card(x, y, title, sub, color, mode) {
    const w = 320, h = 84;
    const c = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.12);
    bg.lineStyle(2.5, color, 0.4);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 16);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 16);
    const t = this.add.text(-w / 2 + 20, -16, title, {
      fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold',
      color: '#' + color.toString(16).padStart(6, '0'),
    });
    const s = this.add.text(-w / 2 + 20, 14, sub, {
      fontFamily: 'Arial', fontSize: '13px', color: '#94a3b8',
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
