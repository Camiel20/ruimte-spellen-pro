import Phaser from 'phaser';
import { SFX } from '../sound.js';
import { getSetting, setSetting, resetProgress, exportProgress, importProgress } from '../progress.js';
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

    // GEHEIME OUDER-MODUS: 5× snel op de titel tikken → toggle. Geeft op
    // productie de level-kiezer + alle werelden open in Getallen-Land, zodat
    // een ouder nieuwe levels kan testen zonder alles uit te spelen.
    this.titelTikken = 0;
    const titelZone = this.add.zone(width / 2, 66, 300, 70).setInteractive();
    titelZone.on('pointerdown', () => {
      this.titelTikken += 1;
      if (this.titelTikTimer) this.titelTikTimer.remove();
      this.titelTikTimer = this.time.delayedCall(1600, () => { this.titelTikken = 0; });
      if (this.titelTikken >= 5) {
        const nieuw = !getSetting('ouderModus');
        setSetting('ouderModus', nieuw);
        SFX.fanfare();
        this.toast(nieuw ? '🔧 Ouder-modus AAN' : '🔧 Ouder-modus UIT');
        this.time.delayedCall(900, () => this.scene.restart()); // toont/verbergt de rij
      }
    });

    // Muziek aan/uit
    this.toggleRow(width / 2, 180, '🎵 Achtergrondmuziek', 'music');

    // Zichtbare uit-knop zolang de ouder-modus aanstaat
    if (getSetting('ouderModus')) this.toggleRow(width / 2, 232, '🔧 Ouder-modus', 'ouderModus');

    // Naam van het kind. (De oude globale moeilijkheids-knop is verwijderd:
    // de spellen regelen hun moeilijkheid nu zelf, adaptief per spel.)
    this.add.text(width / 2, 290, '🌟 Naam van het kind', {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#1f2d3a',
    }).setOrigin(0.5);
    this.add.text(width / 2, 320, '(gebruikt in het menu en bij "Mijn naam" schrijven)', {
      fontFamily: 'Arial', fontSize: '12px', color: '#5b7083',
    }).setOrigin(0.5);
    this.nameRow(width / 2, 360);

    // ---- Voortgang bewaren & terugzetten (bewaar-code) ----
    // Safari's "geschiedenis wissen" gooit alles weg; hiermee kan een ouder
    // de voortgang veiligstellen (delen naar WhatsApp/Notities) en terugzetten.
    this.add.text(width / 2, 470, '💾 Voortgang veiligstellen', {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#1f2d3a',
    }).setOrigin(0.5);
    this.add.text(width / 2, 498, '(bewaar de code in Notities of WhatsApp — dan ben je\nniets kwijt als Safari-gegevens gewist worden)', {
      fontFamily: 'Arial', fontSize: '12px', color: '#5b7083', align: 'center',
    }).setOrigin(0.5);

    const bewaarBtn = this.add.text(width / 2 - 90, 552, '📤 Code delen', {
      fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#14532d',
      backgroundColor: '#bbf7d0', padding: { x: 14, y: 9 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    bewaarBtn.on('pointerdown', () => this.deelBewaarCode());

    const herstelBtn = this.add.text(width / 2 + 90, 552, '📥 Code terugzetten', {
      fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#1d4ed8',
      backgroundColor: '#dbeafe', padding: { x: 14, y: 9 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    herstelBtn.on('pointerdown', () => this.zetBewaarCodeTerug());

    // Voortgang wissen
    const reset = this.add.text(width / 2, height - 60, '🗑️ Voortgang wissen', {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#b91c1c',
      backgroundColor: '#ffffff', padding: { x: 16, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    reset.on('pointerdown', () => this.confirmReset());
  }

  deelBewaarCode() {
    SFX.click();
    const code = exportProgress();
    if (!code) { this.toast('Er ging iets mis 😕'); return; }
    // iOS/Android: het echte deelmenu (Notities, WhatsApp, …); anders kopiëren.
    if (navigator.share) {
      navigator.share({ title: 'Nul & Co bewaar-code', text: code }).catch(() => {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code)
        .then(() => this.toast('📋 Code gekopieerd!'))
        .catch(() => { try { window.prompt('Kopieer deze bewaar-code:', code); } catch (e) {} });
    } else {
      try { window.prompt('Kopieer deze bewaar-code:', code); } catch (e) {}
    }
  }

  zetBewaarCodeTerug() {
    SFX.click();
    let code = null;
    try { code = window.prompt('Plak hier de bewaar-code:'); } catch (e) {}
    if (!code) return;
    if (importProgress(code)) {
      SFX.fanfare();
      this.toast('✅ Voortgang teruggezet!');
      this.time.delayedCall(1000, () => this.scene.restart());
    } else {
      SFX.oops();
      this.toast('❌ Die code klopt niet — plak de hele code');
    }
  }

  toast(tekst) {
    const { width } = this.scale;
    const t = this.add.text(width / 2, 120, tekst, {
      fontFamily: 'Arial Black, Arial', fontSize: '17px', fontStyle: 'bold', color: '#ffffff',
      backgroundColor: '#1f2d3a', padding: { x: 16, y: 10 },
    }).setOrigin(0.5).setDepth(300).setScale(0.4);
    this.tweens.add({ targets: t, scale: 1, duration: 220, ease: 'Back.out' });
    this.tweens.add({ targets: t, alpha: 0, delay: 1400, duration: 400, onComplete: () => t.destroy() });
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
