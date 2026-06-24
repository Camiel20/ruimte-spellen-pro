import Phaser from 'phaser';
import { SFX } from '../sound.js';
import { getStars, getMedalCount, hasMedal } from '../progress.js';

// Beloningenkast — laat zien hoeveel sterren en welke medailles je hebt.

const ALL_MEDALS = [
  { id: 'math_easy', icon: '🌍', label: 'Verkenner' },
  { id: 'math_medium', icon: '🪐', label: 'Ruimtepiloot' },
  { id: 'math_hard', icon: '🌌', label: 'Sterrenheld' },
  { id: 'trace_digits', icon: '🔢', label: 'Cijferheld' },
  { id: 'trace_letters', icon: '🔤', label: 'Letterheld' },
  { id: 'trace_name', icon: '🌟', label: 'Naamheld' },
  { id: 'platform_done', icon: '🚀', label: 'Ruimtereiziger' },
  { id: 'balloon_512', icon: '🎈', label: 'Ballonkoning' },
  { id: 'snake_50', icon: '🐍', label: 'Slangenmeester' },
];

export default class AwardsScene extends Phaser.Scene {
  constructor() { super('Awards'); }

  create() {
    const { width, height } = this.scale;
    for (let i = 0; i < 50; i++) {
      const s = this.add.image(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), 'star')
        .setAlpha(Phaser.Math.FloatBetween(0.2, 0.6));
      this.tweens.add({ targets: s, alpha: 0.1, duration: Phaser.Math.Between(1500, 3000), yoyo: true, repeat: -1 });
    }

    const back = this.add.text(16, 16, '⬅ Terug', {
      fontFamily: 'Arial', fontSize: '16px', color: '#94a3b8',
      backgroundColor: '#1e293b', padding: { x: 10, y: 6 },
    }).setInteractive();
    back.on('pointerdown', () => this.scene.start('Menu'));

    this.add.text(width / 2, 60, '🏆 Mijn Beloningen', {
      fontFamily: 'Arial', fontSize: '26px', fontStyle: 'bold', color: '#fff',
    }).setOrigin(0.5);

    // Sterrenteller
    const stars = getStars();
    this.add.text(width / 2, 110, `⭐ ${stars} sterren verzameld`, {
      fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', color: '#fbbf24',
    }).setOrigin(0.5);

    const got = getMedalCount();
    this.add.text(width / 2, 142, `🏅 ${got} van ${ALL_MEDALS.length} medailles`, {
      fontFamily: 'Arial', fontSize: '16px', color: '#94a3b8',
    }).setOrigin(0.5);

    // Medailles in een rooster van 3 kolommen
    const cols = 3;
    const cellW = 120, cellH = 120;
    const startX = width / 2 - cellW;
    const startY = 210;
    ALL_MEDALS.forEach((m, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = startX + col * cellW, y = startY + row * cellH;
      const owned = hasMedal(m.id);

      const bg = this.add.graphics();
      bg.fillStyle(owned ? 0xfbbf24 : 0x1e293b, owned ? 0.18 : 0.5);
      bg.lineStyle(2, owned ? 0xfbbf24 : 0x334155, owned ? 0.7 : 0.4);
      bg.fillRoundedRect(x - 50, y - 50, 100, 100, 14);
      bg.strokeRoundedRect(x - 50, y - 50, 100, 100, 14);

      const icon = this.add.text(x, y - 12, owned ? m.icon : '🔒', { fontSize: owned ? '42px' : '30px' }).setOrigin(0.5);
      if (owned) this.tweens.add({ targets: icon, angle: { from: -6, to: 6 }, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

      this.add.text(x, y + 34, owned ? m.label : '???', {
        fontFamily: 'Arial', fontSize: '12px', fontStyle: 'bold',
        color: owned ? '#fff' : '#64748b', align: 'center', wordWrap: { width: 96 },
      }).setOrigin(0.5);
    });

    this.add.text(width / 2, height - 40, 'Speel spellen om medailles te verdienen!', {
      fontFamily: 'Arial', fontSize: '13px', color: '#64748b',
    }).setOrigin(0.5);
  }
}
