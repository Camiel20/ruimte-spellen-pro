import Phaser from 'phaser';
import { SFX } from '../sound.js';
import { getStars, getMedalCount, hasMedal } from '../progress.js';
import { luchtAchtergrond, terugKnop, schermTitel } from '../theme.js';

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
  { id: 'balloon_2048', icon: '🌈', label: 'Ballon-Legende' },
  { id: 'reken_nul', icon: '⭕', label: 'Nul-Planeet' },
  { id: 'sticker_pagina', icon: '📄', label: 'Pagina Vol' },
  { id: 'sticker_album', icon: '📖', label: 'Album-meester' },
  { id: 'bezorg_baas', icon: '🚚', label: 'Bezorg-Baas' },
  { id: 'snake_50', icon: '🐍', label: 'Slangenmeester' },
];

export default class AwardsScene extends Phaser.Scene {
  constructor() { super('Awards'); }

  create() {
    const { width, height } = this.scale;
    luchtAchtergrond(this);
    terugKnop(this);
    schermTitel(this, 60, '🏆 Mijn Beloningen');

    // Sterrenteller
    const stars = getStars();
    this.add.text(width / 2, 110, `⭐ ${stars} sterren verzameld`, {
      fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', color: '#b45309',
    }).setOrigin(0.5);

    const got = getMedalCount();
    this.add.text(width / 2, 142, `🏅 ${got} van ${ALL_MEDALS.length} medailles`, {
      fontFamily: 'Arial', fontSize: '16px', color: '#5b7083',
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
      bg.fillStyle(owned ? 0xfef3c7 : 0xffffff, owned ? 0.95 : 0.55);
      bg.lineStyle(3, owned ? 0xf59e0b : 0x94a3b8, owned ? 1 : 0.5);
      bg.fillRoundedRect(x - 50, y - 50, 100, 100, 14);
      bg.strokeRoundedRect(x - 50, y - 50, 100, 100, 14);

      const icon = this.add.text(x, y - 12, owned ? m.icon : '🔒', { fontSize: owned ? '42px' : '30px' }).setOrigin(0.5);
      if (!owned) icon.setAlpha(0.45);
      if (owned) this.tweens.add({ targets: icon, angle: { from: -6, to: 6 }, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

      this.add.text(x, y + 34, owned ? m.label : '???', {
        fontFamily: 'Arial', fontSize: '12px', fontStyle: 'bold',
        color: owned ? '#92400e' : '#8296a8', align: 'center', wordWrap: { width: 96 },
      }).setOrigin(0.5);
    });

    this.add.text(width / 2, height - 60, 'Speel spellen om medailles te verdienen!', {
      fontFamily: 'Arial', fontSize: '13px', fontStyle: 'bold', color: '#3b5a72',
    }).setOrigin(0.5);
  }
}
