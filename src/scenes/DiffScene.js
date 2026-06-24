import Phaser from 'phaser';
import { SFX, initAudio } from '../sound.js';

// Kies-scherm voor de moeilijkheidsgraad van Ruimte Rekenen.

export default class DiffScene extends Phaser.Scene {
  constructor() { super('Diff'); }

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

    this.add.text(width / 2, 80, '🧮 Kies je missie!', {
      fontFamily: 'Arial', fontSize: '26px', fontStyle: 'bold', color: '#fff',
    }).setOrigin(0.5);
    this.add.text(width / 2, 120, 'Hoe moeilijk durf jij?', {
      fontFamily: 'Arial', fontSize: '15px', color: '#94a3b8',
    }).setOrigin(0.5);

    this.card(width / 2, 230, '🌍  Verkenner', 'Optellen en aftrekken', 0x4ade80, 'easy');
    this.card(width / 2, 340, '🪐  Ruimtepiloot', 'Grotere nummers en keersommen', 0xfbbf24, 'medium');
    this.card(width / 2, 450, '🌌  Sterrenheld', 'Mega nummers!', 0xf87171, 'hard');
  }

  card(x, y, title, sub, color, diff) {
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
        onComplete: () => this.scene.start('Math', { diff }) });
    });
  }
}
