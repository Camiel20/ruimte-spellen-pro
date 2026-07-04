import Phaser from 'phaser';
import { SFX } from '../sound.js';
import { getStats, gameName, formatDuration, resetStats } from '../stats.js';
import { luchtAchtergrond, terugKnop, schermTitel } from '../theme.js';

// Statistieken-scherm: laat per spel zien hoe vaak en hoe lang het gespeeld
// is (lokaal op dit apparaat). Te openen via de 📊-knop in het menu.

const ICONS = {
  Balloon: '🎈', Math: '🛸', Trace: '✏️', Clicker: '🪐', Piano: '🎹',
  Bezorg: '🚚', NumberTower: '🧱', ZeroRocket: '🚀', Snake: '🐍',
};

export default class StatsScene extends Phaser.Scene {
  constructor() { super('Stats'); }

  create() {
    const { width, height } = this.scale;
    luchtAchtergrond(this, { gras: false });
    terugKnop(this);
    schermTitel(this, 40, '📊 Statistieken');

    const stats = getStats();
    const entries = Object.entries(stats)
      .filter(([, v]) => v && (v.plays || v.ms))
      .sort((a, b) => (b[1].ms || 0) - (a[1].ms || 0));

    if (entries.length === 0) {
      this.add.text(width / 2, height / 2, 'Nog niks gespeeld!\nSpeel een spelletje en kom terug. 🎮', {
        fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#3b5a72', align: 'center',
      }).setOrigin(0.5);
      return;
    }

    let totalMs = 0, totalPlays = 0;
    let y = 86;
    entries.forEach(([key, v]) => {
      this.row(width, y, ICONS[key] || '🎮', gameName(key), v.plays || 0, v.ms || 0);
      y += 56;
      totalMs += v.ms || 0;
      totalPlays += v.plays || 0;
    });

    this.add.text(width / 2, y + 16, `Samen: ${totalPlays}× gespeeld • ${formatDuration(totalMs)}`, {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#b45309',
    }).setOrigin(0.5);

    const reset = this.add.text(width / 2, height - 38, '🗑️ Wis statistieken', {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#b91c1c',
      backgroundColor: '#ffffff', padding: { x: 14, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    reset.on('pointerdown', () => { resetStats(); SFX.click(); this.scene.restart(); });
  }

  row(width, y, icon, name, plays, ms) {
    const c = this.add.container(width / 2, y);
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.88);
    g.fillRoundedRect(-width / 2 + 16, -24, width - 32, 48, 12);
    g.lineStyle(2, 0xbcd9ee, 1);
    g.strokeRoundedRect(-width / 2 + 16, -24, width - 32, 48, 12);
    c.add(g);
    c.add(this.add.text(-width / 2 + 30, 0, icon, { fontSize: '26px' }).setOrigin(0, 0.5));
    c.add(this.add.text(-width / 2 + 72, -8, name, {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#1f2d3a',
    }).setOrigin(0, 0.5));
    c.add(this.add.text(-width / 2 + 72, 11, `${plays}× gespeeld`, {
      fontFamily: 'Arial', fontSize: '12px', color: '#5b7083',
    }).setOrigin(0, 0.5));
    c.add(this.add.text(width / 2 - 30, 0, formatDuration(ms), {
      fontFamily: 'Arial Black, Arial', fontSize: '15px', fontStyle: 'bold', color: '#b45309',
    }).setOrigin(1, 0.5));
  }
}
