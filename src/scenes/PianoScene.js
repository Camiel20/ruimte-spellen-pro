import Phaser from 'phaser';
import { initAudio, getAudioContext } from '../sound.js';
import { luchtAchtergrond, terugKnop } from '../theme.js';

// Regenboog Piano — 8 toetsen, echte pianotonen, regenboogkleuren.
// Vrij spelen of een liedje volgen (oplichtende toetsen).

const NOTES = [
  { n: 'do', f: 261.63, c: 0xf87171 },
  { n: 're', f: 293.66, c: 0xfb923c },
  { n: 'mi', f: 329.63, c: 0xfbbf24 },
  { n: 'fa', f: 349.23, c: 0x4ade80 },
  { n: 'sol', f: 392.00, c: 0x22d3ee },
  { n: 'la', f: 440.00, c: 0x60a5fa },
  { n: 'si', f: 493.88, c: 0xa855f7 },
  { n: 'do²', f: 523.25, c: 0xe879f9 },
];

const SONGS = {
  'Twinkel': [
    0,0,4,4,5,5,4, 3,3,2,2,1,1,0,
    4,4,3,3,2,2,1, 4,4,3,3,2,2,1,
    0,0,4,4,5,5,4, 3,3,2,2,1,1,0,
  ],
  'Broeder Jacob': [
    0,1,2,0, 0,1,2,0,
    2,3,4, 2,3,4,
    4,5,4,3,2,0, 4,5,4,3,2,0,
    0,4,0, 0,4,0,
  ],
  'Hot Cross Buns': [
    2,1,0, 2,1,0,
    0,0,0,0, 1,1,1,1,
    2,1,0,
  ],
  'Verjaardag': [
    0,0,1,0,3,2,
    0,0,1,0,4,3,
    0,0,7,5,3,2,1,
    3,3,2,0,1,0,
  ],
  'Sinterklaas': [
    2,1,0,1,2,2,2,
    1,1,1,
    2,4,4,
    2,1,0,1,2,2,2,2,
    1,1,2,1,0,
  ],
};

export default class PianoScene extends Phaser.Scene {
  constructor() { super('Piano'); }

  create() {
    const { width, height } = this.scale;
    initAudio();
    // Hergebruik de gedeelde audiocontext (niet elke keer een nieuwe maken)
    this.audioCtx = getAudioContext();
    this.input.on('pointerdown', () => { if (this.audioCtx && this.audioCtx.state === 'suspended') this.audioCtx.resume(); });

    luchtAchtergrond(this, { gras: false });
    terugKnop(this);

    this.display = this.add.text(width / 2, 60, 'Tik op de toetsen! 🌈', {
      fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#1f2d3a',
      backgroundColor: '#ffffffcc', padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setDepth(10);

    // Modusknoppen
    this.mode = 'free';
    this.songSeq = null;
    this.songStep = 0;
    this.makeModeButton(width / 2 - 70, 110, 'Vrij spelen', 'free');
    this.makeModeButton(width / 2 + 70, 110, 'Liedje', 'song');

    // Liedjeskiezers (verborgen tot 'song'-modus)
    this.songButtons = [];
    let sx = 0;
    const names = Object.keys(SONGS);
    const totalW = names.length * 110;
    names.forEach((name, i) => {
      const bx = width / 2 - totalW / 2 + i * 110 + 55;
      const b = this.add.text(bx, 150, '🎵 ' + name, {
        fontFamily: 'Arial', fontSize: '12px', fontStyle: 'bold', color: '#1f2d3a',
        backgroundColor: '#ffffff', padding: { x: 8, y: 6 },
      }).setOrigin(0.5).setInteractive().setVisible(false).setDepth(10);
      b.on('pointerdown', () => this.startSong(name, b));
      this.songButtons.push(b);
    });

    // Toetsen
    this.keys = [];
    const keyTop = 200;
    const keyH = height - keyTop - 30;
    const keyW = width / NOTES.length;
    NOTES.forEach((note, i) => {
      const x = i * keyW;
      const g = this.add.graphics();
      this.drawKey(g, x, keyTop, keyW, keyH, note.c, 1);
      const label = this.add.text(x + keyW / 2, keyTop + keyH - 30, note.n, {
        fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5);
      const zone = this.add.zone(x, keyTop, keyW, keyH).setOrigin(0, 0).setInteractive();
      zone.on('pointerdown', () => this.playNote(i));
      this.keys.push({ g, label, x, y: keyTop, w: keyW, h: keyH, note });
    });

    // Hint-indicators: pulserende rand en bouncing pijl per toets
    this.hintGlow = this.add.graphics().setDepth(5);
    this.hintArrows = this.keys.map((k) =>
      this.add.text(k.x + k.w / 2, k.y - 36, '▼', {
        fontFamily: 'Arial', fontSize: '28px', color: '#ffff00',
        stroke: '#ff8800', strokeThickness: 3,
      }).setOrigin(0.5, 1).setVisible(false).setDepth(11)
    );
  }

  drawKey(g, x, y, w, h, color, brightness) {
    g.clear();
    const c = Phaser.Display.Color.IntegerToColor(color);
    const top = Phaser.Display.Color.GetColor(
      Math.min(255, c.red * brightness * 0.7 + 60),
      Math.min(255, c.green * brightness * 0.7 + 60),
      Math.min(255, c.blue * brightness * 0.7 + 60)
    );
    g.fillStyle(top, 1);
    g.fillRoundedRect(x + 2, y, w - 4, h, { tl: 0, tr: 0, bl: 14, br: 14 });
    g.fillStyle(color, brightness > 1 ? 1 : 0.85);
    g.fillRoundedRect(x + 2, y + 8, w - 4, h - 8, { tl: 0, tr: 0, bl: 14, br: 14 });
  }

  makeModeButton(x, y, label, mode) {
    const b = this.add.text(x, y, label, {
      fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold',
      color: mode === 'free' ? '#fff' : '#64748b',
      backgroundColor: mode === 'free' ? '#7c3aed' : '#e2e8f0',
      padding: { x: 14, y: 8 },
    }).setOrigin(0.5).setInteractive();
    b.modeName = mode;
    b.on('pointerdown', () => this.setMode(mode));
    if (!this.modeButtons) this.modeButtons = [];
    this.modeButtons.push(b);
    return b;
  }

  setMode(mode) {
    this.mode = mode;
    this.songSeq = null;
    this.songStep = 0;
    this.clearHints();
    this.modeButtons.forEach((b) => {
      const active = b.modeName === mode;
      b.setColor(active ? '#fff' : '#64748b');
      b.setBackgroundColor(active ? '#7c3aed' : '#e2e8f0');
    });
    this.songButtons.forEach((b) => b.setVisible(mode === 'song'));
    this.display.setText(mode === 'free' ? 'Tik op de toetsen! 🌈' : 'Kies een liedje! 🎵');
  }

  startSong(name, btn) {
    this.songSeq = SONGS[name].slice();
    this.songStep = 0;
    this.songButtons.forEach((b) => { b.setBackgroundColor('#ffffff'); b.setColor('#1f2d3a'); });
    btn.setBackgroundColor('#16a34a'); btn.setColor('#ffffff');
    this.display.setText('Volg de oplichtende toetsen! ✨');
    this.showHint();
  }

  showHint() {
    this.clearHints();
    if (this.mode !== 'song' || !this.songSeq) return;
    const next = this.songSeq[this.songStep];
    const k = this.keys[next];

    // Heel heldere toets
    this.drawKey(k.g, k.x, k.y, k.w, k.h, k.note.c, 2.2);

    // Pulserende gele rand rondom de actieve toets
    this.hintGlow.clear();
    this.hintGlow.lineStyle(6, 0xffff00, 0.9);
    this.hintGlow.strokeRoundedRect(k.x + 1, k.y, k.w - 2, k.h, { tl: 0, tr: 0, bl: 12, br: 12 });
    this.hintGlow.setAlpha(1);
    this.hintGlowTween = this.tweens.add({
      targets: this.hintGlow, alpha: 0.2, duration: 380, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Label bounce
    this.hintTween = this.tweens.add({
      targets: k.label, scale: 1.6, duration: 350, yoyo: true, repeat: -1,
    });

    // Bouncing pijl boven de toets
    const arrow = this.hintArrows[next];
    arrow.setVisible(true).setPosition(k.x + k.w / 2, k.y - 36);
    this.hintArrowTween = this.tweens.add({
      targets: arrow, y: k.y - 14, duration: 350, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    this.display.setText('Druk op: ' + k.note.n.toUpperCase() + '! 🎹');
  }

  clearHints() {
    if (this.hintTween) { this.hintTween.stop(); this.hintTween = null; }
    if (this.hintArrowTween) { this.hintArrowTween.stop(); this.hintArrowTween = null; }
    if (this.hintGlowTween) { this.hintGlowTween.stop(); this.hintGlowTween = null; }
    if (this.hintGlow) { this.hintGlow.clear(); this.hintGlow.setAlpha(1); }
    this.keys.forEach((k) => { k.label.setScale(1); this.drawKey(k.g, k.x, k.y, k.w, k.h, k.note.c, 1); });
    if (this.hintArrows) this.hintArrows.forEach((a) => a.setVisible(false));
  }

  playNote(i) {
    const note = NOTES[i];
    this.pianoTone(note.f);
    const k = this.keys[i];
    // Indruk-animatie
    this.drawKey(k.g, k.x, k.y, k.w, k.h, note.c, 1.6);
    this.time.delayedCall(150, () => {
      if (!(this.mode === 'song' && this.songSeq && this.songSeq[this.songStep] === i)) {
        this.drawKey(k.g, k.x, k.y, k.w, k.h, note.c, 1);
      }
    });
    this.display.setText(note.n.toUpperCase() + ' 🎵');

    if (this.mode === 'song' && this.songSeq) {
      if (i === this.songSeq[this.songStep]) {
        this.songStep++;
        if (this.songStep >= this.songSeq.length) {
          this.display.setText('Goed gedaan! 🌈🎉');
          this.confetti();
          this.songSeq = null;
          this.songButtons.forEach((b) => { b.setBackgroundColor('#ffffff'); b.setColor('#1f2d3a'); });
          this.clearHints();
        } else {
          this.showHint();
        }
      }
    }
  }

  pianoTone(freq) {
    if (!this.audioCtx) return;
    try {
      const t = this.audioCtx.currentTime, dur = 0.6;
      const o1 = this.audioCtx.createOscillator();
      const o2 = this.audioCtx.createOscillator();
      const g = this.audioCtx.createGain();
      o1.type = 'triangle'; o2.type = 'sine';
      o1.frequency.value = freq; o2.frequency.value = freq * 2;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.3, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o1.connect(g); o2.connect(g); g.connect(this.audioCtx.destination);
      o1.start(t); o2.start(t); o1.stop(t + dur); o2.stop(t + dur);
    } catch (e) {}
  }

  confetti() {
    const { width } = this.scale;
    const p = this.add.particles(width / 2, 100, 'star', {
      x: { min: 0, max: width }, y: -10,
      speedY: { min: 100, max: 300 }, scale: { start: 1.5, end: 0 },
      lifespan: 1800, quantity: 2,
      tint: [0xf87171, 0xfbbf24, 0x4ade80, 0x60a5fa, 0xa855f7],
      blendMode: 'ADD',
    }).setDepth(99);
    this.time.delayedCall(1800, () => p.destroy());
  }
}
