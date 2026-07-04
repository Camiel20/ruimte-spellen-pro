import Phaser from 'phaser';
import { SFX } from '../sound.js';
import { getSetting, setSetting, resetProgress } from '../progress.js';
import { setMusicEnabled } from '../music.js';
import { luchtAchtergrond, terugKnop, schermTitel } from '../theme.js';

// Instellingen — voor de ouder. Muziek aan/uit, moeilijkheid, naam van
// het kind, en de mogelijkheid om alle voortgang te wissen.

export default class SettingsScene extends Phaser.Scene {
  constructor() { super('Settings'); }

  create() {
    const { width, height } = this.scale;
    luchtAchtergrond(this);
    terugKnop(this);
    schermTitel(this, 60, '⚙️ Instellingen');

    // Muziek aan/uit
    this.toggleRow(width / 2, 140, '🎵 Achtergrondmuziek', 'music');

    // Moeilijkheid
    this.add.text(width / 2, 210, '🎯 Moeilijkheid', {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#1f2d3a',
    }).setOrigin(0.5);
    this.difficultyRow(width / 2, 250);

    // Naam van het kind
    this.add.text(width / 2, 330, '🌟 Naam van het kind', {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#1f2d3a',
    }).setOrigin(0.5);
    this.add.text(width / 2, 360, '(gebruikt in het menu en bij "Mijn naam" schrijven)', {
      fontFamily: 'Arial', fontSize: '12px', color: '#5b7083',
    }).setOrigin(0.5);
    this.nameRow(width / 2, 400);

    // Voortgang wissen
    const reset = this.add.text(width / 2, height - 60, '🗑️ Voortgang wissen', {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#b91c1c',
      backgroundColor: '#ffffff', padding: { x: 16, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    reset.on('pointerdown', () => this.confirmReset());
  }

  toggleRow(x, y, label, key) {
    this.add.text(x - 150, y, label, {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#1f2d3a',
    }).setOrigin(0, 0.5);
    const on = getSetting(key);
    const btn = this.add.text(x + 150, y, on ? 'AAN' : 'UIT', {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold',
      color: on ? '#14532d' : '#64748b',
      backgroundColor: on ? '#4ade80' : '#e2e8f0', padding: { x: 16, y: 8 },
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => {
      const newVal = !getSetting(key);
      setSetting(key, newVal);
      btn.setText(newVal ? 'AAN' : 'UIT');
      btn.setColor(newVal ? '#14532d' : '#64748b');
      btn.setBackgroundColor(newVal ? '#4ade80' : '#e2e8f0');
      SFX.click();
      if (key === 'music') setMusicEnabled(newVal);
    });
  }

  difficultyRow(x, y) {
    const opts = [['Makkelijk', 'makkelijk', 0x4ade80], ['Normaal', 'normaal', 0xfbbf24], ['Moeilijk', 'moeilijk', 0xf87171]];
    const bw = 100;
    this.diffButtons = [];
    opts.forEach(([label, val, color], i) => {
      const bx = x - bw + i * bw;
      const cur = getSetting('difficulty') === val;
      const b = this.add.text(bx, y, label, {
        fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold',
        color: cur ? '#1a1a2e' : '#64748b',
        backgroundColor: cur ? '#' + color.toString(16).padStart(6, '0') : '#e2e8f0',
        padding: { x: 12, y: 8 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      b.val = val; b.color2 = color;
      b.on('pointerdown', () => {
        setSetting('difficulty', val);
        SFX.click();
        this.diffButtons.forEach((bb) => {
          const sel = bb.val === val;
          bb.setColor(sel ? '#1a1a2e' : '#64748b');
          bb.setBackgroundColor(sel ? '#' + bb.color2.toString(16).padStart(6, '0') : '#e2e8f0');
        });
      });
      this.diffButtons.push(b);
    });
  }

  nameRow(x, y) {
    // Eenvoudige naam-kiezer met een paar voorinstellingen + handmatig via prompt.
    const cur = getSetting('childName') || 'Adrian';
    this.nameLabel = this.add.text(x, y, cur, {
      fontFamily: 'Arial', fontSize: '22px', fontStyle: 'bold', color: '#be185d',
      backgroundColor: '#ffffff', padding: { x: 20, y: 8 },
    }).setOrigin(0.5);

    const edit = this.add.text(x, y + 50, '✏️ Naam wijzigen', {
      fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#1d4ed8',
      backgroundColor: '#ffffff', padding: { x: 14, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    edit.on('pointerdown', () => {
      SFX.click();
      // Gebruik de browser-prompt om een naam te typen (werkt op pc en tablet)
      let naam = null;
      try { naam = window.prompt('Wat is de naam van het kind?', getSetting('childName') || 'Adrian'); } catch (e) {}
      if (naam && naam.trim()) {
        const clean = naam.trim().slice(0, 12);
        setSetting('childName', clean);
        this.nameLabel.setText(clean);
      }
    });
  }

  confirmReset() {
    const { width, height } = this.scale;
    const D = 200;
    const items = [];
    const bg = this.add.graphics().setDepth(D);
    bg.fillStyle(0x000000, 0.85); bg.fillRect(0, 0, width, height);
    items.push(bg);
    items.push(this.add.text(width / 2, height / 2 - 60, 'Weet je het zeker?', {
      fontFamily: 'Arial', fontSize: '24px', fontStyle: 'bold', color: '#fff',
    }).setOrigin(0.5).setDepth(D + 1));
    items.push(this.add.text(width / 2, height / 2 - 20, 'Alle sterren, medailles,\nscores en upgrades worden gewist.', {
      fontFamily: 'Arial', fontSize: '15px', color: '#94a3b8', align: 'center',
    }).setOrigin(0.5).setDepth(D + 1));
    const yes = this.add.text(width / 2 - 70, height / 2 + 50, 'Ja, wissen', {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#fff',
      backgroundColor: '#f87171', padding: { x: 16, y: 10 },
    }).setOrigin(0.5).setDepth(D + 1).setInteractive({ useHandCursor: true });
    const no = this.add.text(width / 2 + 70, height / 2 + 50, 'Nee', {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#1a1a2e',
      backgroundColor: '#4ade80', padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setDepth(D + 1).setInteractive({ useHandCursor: true });
    items.push(yes); items.push(no);
    yes.on('pointerdown', () => { resetProgress(); SFX.gameover(); this.scene.restart(); });
    no.on('pointerdown', () => { items.forEach((o) => o.destroy()); });
  }
}
