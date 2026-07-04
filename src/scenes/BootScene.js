import Phaser from 'phaser';
import { maakNul, LUCHT_BOVEN, LUCHT_ONDER } from '../theme.js';

// De BootScene draait als allereerste en bereidt alles voor.
//
// HIER ZIE JE DE TWEE MANIEREN OM GRAPHICS TE KRIJGEN:
//
//  A) ECHTE PLAATJES inladen (de "mooie" weg).
//     Zet een .png in de map  public/assets/  en laad hem hier in.
//     Voorbeeld staat hieronder, maar uitgezet met // zolang je nog
//     geen plaatjes hebt. Haal de // weg zodra je een plaatje hebt.
//
//  B) GETEKENDE texturen (de "het werkt meteen" weg).
//     We tekenen zelf simpele vormen naar een texture. Dit gebruiken
//     we nu als fallback zodat het spel altijd werkt.
//
// Het mooie: de rest van het spel hoeft NIET te veranderen. Of je nu
// een echt plaatje of een getekende vorm gebruikt, beide heten 'balloon'
// en worden op dezelfde manier getoond.

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // === A) ECHTE PLAATJES ===
    // De mooie glanzende ballon. Omdat hij wit/grijs is, kunnen we hem
    // met setTint() per getal een eigen kleur geven.
    this.load.image('balloon', 'assets/balloon.png');
    // Auto's voor het verborgen rijspel (Stad Rijden)
    this.load.image('car_player', 'assets/car_player.png');
    this.load.image('car_red', 'assets/car_red.png');
    this.load.image('car_blue', 'assets/car_blue.png');
    this.load.image('car_green', 'assets/car_green.png');
    //
    // Meer voorbeelden (haal de // weg als je ze hebt):
    // this.load.image('astronaut', 'assets/astronaut.png');
    // this.load.image('planet-bg', 'assets/achtergrond.png');
    // this.load.audio('muziek', 'assets/achtergrondmuziek.mp3');

    // Laadscherm in huisstijl: lichte lucht, stuiterende Nul en een
    // laadbalk van Numberblocks-blokjes die één voor één inkleuren.
    const { width, height } = this.scale;
    const lucht = this.add.graphics();
    lucht.fillGradientStyle(LUCHT_BOVEN, LUCHT_BOVEN, LUCHT_ONDER, LUCHT_ONDER, 1);
    lucht.fillRect(0, 0, width, height);

    const nul = maakNul(this, width / 2, height / 2 - 80, 44);
    this.tweens.add({
      targets: nul, y: height / 2 - 104, duration: 520,
      yoyo: true, repeat: -1, ease: 'Sine.inOut',
    });

    this.add.text(width / 2, height / 2 + 6, 'NUL & CO', {
      fontFamily: 'Arial Black, Arial', fontSize: '34px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setStroke('#1f2d3a', 8);

    const SIG = [0xe8402c, 0xf08a24, 0xf6c624, 0x57b947, 0x38b6cf, 0x9b6dd6];
    const blokjes = [];
    const bw = 30, gap = 8;
    const startX = width / 2 - (SIG.length * (bw + gap) - gap) / 2 + bw / 2;
    for (let i = 0; i < SIG.length; i++) {
      const b = this.add.rectangle(startX + i * (bw + gap), height / 2 + 64, bw, bw, 0xffffff, 0.45)
        .setStrokeStyle(3, 0x334155);
      blokjes.push(b);
    }
    this.load.on('progress', (p) => {
      const vol = Math.ceil(p * SIG.length);
      for (let i = 0; i < vol; i++) blokjes[i].setFillStyle(SIG[i], 1);
    });
  }

  create() {
    // === B) FALLBACK: getekende texturen ===
    // We maken deze alleen aan als er nog GEEN echt plaatje is ingeladen
    // met dezelfde naam. Zo kun je later plaatjes toevoegen zonder hier
    // iets te hoeven weghalen.
    if (!this.textures.exists('balloon')) this.makeBalloonTexture();
    if (!this.textures.exists('star')) this.makeStarTexture();

    this.scene.start('Menu');
  }

  makeBalloonTexture() {
    const size = 128;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1);
    g.fillCircle(size / 2, size / 2, size / 2 - 4);
    g.generateTexture('balloon', size, size);
    g.destroy();
  }

  makeStarTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4, 4, 3);
    g.generateTexture('star', 8, 8);
    g.destroy();
  }
}
