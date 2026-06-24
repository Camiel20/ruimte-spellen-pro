import Phaser from 'phaser';

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

    // Toon een laadbalk terwijl alles inlaadt (handig bij echte plaatjes)
    const { width, height } = this.scale;
    const barBg = this.add.rectangle(width / 2, height / 2, 200, 20, 0x334155);
    const bar = this.add.rectangle(width / 2 - 98, height / 2, 4, 14, 0x60a5fa).setOrigin(0, 0.5);
    this.load.on('progress', (p) => { bar.width = 196 * p; });
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
