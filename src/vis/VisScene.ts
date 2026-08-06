// Hapvis — de speelbare scene. Alles wat hier gebeurt is "het plaatje + de
// lus": de spelregels zelf staan in logic/ (los getest), alle getallen in
// GameConfig.ts. Beweging doen we met de hand (geen Arcade Physics), zodat
// acceleratie, traagheid en draaisnelheid exact het ontwerp volgen én de
// wereldbrede zwaartekracht van de andere spellen ons niet raakt.

import Phaser from 'phaser';
import * as CFG from './GameConfig';
import type { Gedrag, SoortId } from './GameConfig';
import {
  eetBinnenBereik,
  faseVoorMassa,
  kanEten,
  magBoostStarten,
  massaNaEten,
  massaNaKwal,
  maxSnelheidVoorMassa,
  nieuweEnergie,
  radiusVoorMassa,
} from './logic/regels';
import { dreigingsNiveau, jaagFactor } from './logic/moeilijkheid';
import { kiesSoort, kiesSpawnPunt, schoolPosities, zoneVoorY, type Punt } from './logic/spawn';
import {
  draaiNaar,
  inZicht,
  magBlijvenJagen,
  normaliseer,
  schoolKracht,
  vluchtVector,
  type SchoolLid,
  type Vec,
} from './logic/sturing';
import { SaveManager, type SaveData } from './SaveManager';
import {
  ANIM_FPS,
  ANIM_FRAMES,
  TEX,
  TEX_SCHAAL,
  ZONE_LUCHT,
  kleurNummer,
  maakBesturingTexturen,
  maakDieptelagen,
  maakEffectTexturen,
  maakLichtstralen,
  maakNpcTexturen,
  maakSpelerTexturen,
  maakVignet,
} from './graphics';
import { Geluid } from './geluid';
import { stopMusic } from '../music.js';

/** Eén vis (of kwal) uit de pool. Wordt hergebruikt, nooit weggegooid. */
interface Entiteit extends SchoolLid {
  actief: boolean;
  soort: SoortId;
  gedrag: Gedrag;
  radius: number;
  hoek: number; // kijkrichting in rad
  sprite: Phaser.GameObjects.Image;
  dwaalT: number; // s tot een nieuwe dwaalrichting
  dwaalHoek: number;
  jaagT: number; // s dat deze jacht al duurt
  afkoelT: number; // s afkoelen na een afgebroken jacht
  geheugenT: number; // s dat het laatst-geziene punt nog geldt
  doelX: number;
  doelY: number;
  burstT: number; // s dat de apex-burst al duurt
  rustT: number; // s rust na een burst
  sinusT: number; // s, fase van de kwal-slinger
  driftOmkeerT: number; // s tot de kwal omkeert
  driftRichting: number; // +1 omlaag, −1 omhoog
  animT: number; // s, loopt de staartslag-frames af
  frame: number; // huidig staartslag-frame
}

interface Speler {
  pos: Vec;
  vel: Vec;
  hoek: number;
  massa: number;
  radius: number;
  fase: number;
  /** Topsnelheid van de huidige fase; herberekend bij elke fasewissel. */
  maxSnelheid: number;
  energie: number;
  boostAan: boolean;
  onkwetsbaarT: number;
  animT: number;
  frame: number;
  sprite: Phaser.GameObjects.Image;
}

type Status = 'spelen' | 'pauze' | 'dood';

export default class VisScene extends Phaser.Scene {
  private save = new SaveManager();
  private saveData!: SaveData;

  private speler!: Speler;
  private pool: Entiteit[] = [];
  private actiefAantal = 0;

  private status: Status = 'spelen';
  private rondeT = 0; // s sinds het begin van deze ronde
  private dreiging = 0;
  private spawnT = 0; // s tot de volgende spawner-check
  private apexRolT = 0; // s tot de volgende apex-kansrol
  private score = 0;
  private gegeten = 0;
  private grootsteMassa = 0;
  private grootsteFase = 1;

  // Beeld
  private achtergrond!: Phaser.GameObjects.Graphics;
  private lichtstralen!: Phaser.GameObjects.Image;
  private laagVer!: Phaser.GameObjects.TileSprite;
  private laagMid!: Phaser.GameObjects.TileSprite;
  private vignet!: Phaser.GameObjects.Image;
  private grensBand!: Phaser.GameObjects.Rectangle;
  private bellen: Phaser.GameObjects.Image[] = [];
  private plankton: Phaser.GameObjects.Image[] = [];
  private spoor: Phaser.GameObjects.Image[] = [];
  private spoorIndex = 0;
  private spoorT = 0;

  // HUD
  private hudBalken!: Phaser.GameObjects.Graphics;
  private scoreTekst!: Phaser.GameObjects.Text;
  private laatsteScore = -1;
  private pauzeKnop!: Phaser.GameObjects.Text;

  // Besturing
  private toetsen: Record<string, Phaser.Input.Keyboard.Key> = {};
  private joystickBasis!: Phaser.GameObjects.Image;
  private joystickDuim!: Phaser.GameObjects.Image;
  private joystickPointer: number | null = null;
  private boostKnop!: Phaser.GameObjects.Image;
  private boostKnopTekst!: Phaser.GameObjects.Text;
  private boostPointer: number | null = null;
  private invoer: Vec = { x: 0, y: 0 };
  private invoerSterkte = 0;

  // Overlay (pauze / eindkaart)
  private overlay!: Phaser.GameObjects.Container;

  // Werkgeheugen: hergebruikt in update(), zodat er per frame niets ontstaat.
  private v1: Vec = { x: 0, y: 0 };
  private v2: Vec = { x: 0, y: 0 };
  private burenBuffer: Entiteit[] = [];
  private camCentrum: Punt = { x: 0, y: 0 };
  /** Fase-config per fasenummer; voorkomt een zoekactie (en closure) per frame. */
  private faseCfg: Record<number, CFG.FaseConfig> = {};
  /** Dieptegrenzen per soort; voorkomt zoeken + spreads in de AI-lus. */
  private zoneGrens: Record<string, { boven: number; onder: number }> = {};

  constructor() {
    super('Hapvis');
  }

  create(): void {
    stopMusic();
    this.saveData = this.save.laad();
    this.bouwOpzoektabellen();

    maakNpcTexturen(this);
    maakEffectTexturen(this);
    maakSpelerTexturen(this, CFG.FASES, this.saveData.gekozenKleur, this.saveData.gekozenSkin);
    maakVignet(this, Math.ceil(Math.sqrt(CFG.SCHERM_B ** 2 + CFG.SCHERM_H ** 2)));
    maakLichtstralen(this, CFG.SCHERM_B, CFG.SCHERM_H);
    maakDieptelagen(this, CFG.SCHERM_B, CFG.SCHERM_H);

    this.cameras.main.setBounds(0, 0, CFG.WERELD_B, CFG.WERELD_H);
    this.physics.world.setBounds(0, 0, CFG.WERELD_B, CFG.WERELD_H);

    this.bouwAchtergrond();
    this.bouwPool();
    this.bouwSpeler();
    this.bouwHud();
    this.bouwBesturing();

    this.overlay = this.add.container(0, 0).setScrollFactor(0).setDepth(200).setVisible(false);

    this.cameras.main.startFollow(this.speler.sprite, false, CFG.CAMERA_LERP, CFG.CAMERA_LERP);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => this.opruimen());

    this.startRonde();
  }

  // ───────────────────────────────────────────────────────── opbouw

  /**
   * Zet alle opzoekwerk één keer klaar: welke fase-config bij welk nummer
   * hoort, en tussen welke diepten een soort thuishoort. Zonder deze tabellen
   * zou de update-lus per vis per frame moeten zoeken (en closures maken).
   */
  private bouwOpzoektabellen(): void {
    for (const f of CFG.FASES) this.faseCfg[f.fase] = f;
    for (const id of Object.keys(CFG.SOORTEN) as SoortId[]) {
      const zones = CFG.SOORTEN[id].zones;
      let laagste = zones[0] ?? 1;
      let hoogste = zones[0] ?? 1;
      for (const nr of zones) {
        if (nr < laagste) laagste = nr;
        if (nr > hoogste) hoogste = nr;
      }
      this.zoneGrens[id] = {
        boven: (laagste - 1) * CFG.ZONE_HOOGTE - CFG.ZONE_UITLOOP,
        onder: hoogste * CFG.ZONE_HOOGTE + CFG.ZONE_UITLOOP,
      };
    }
  }

  private bouwAchtergrond(): void {
    this.achtergrond = this.add.graphics().setScrollFactor(0).setDepth(-20);

    // Twee silhouet-lagen die met verschillende snelheid meeschuiven: dat geeft
    // het water diepte zonder dat er een enkel echt object in de wereld staat.
    this.laagVer = this.add
      .tileSprite(0, 0, CFG.SCHERM_B, CFG.SCHERM_H, TEX.verVer)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(-19)
      .setAlpha(0.5);
    this.laagMid = this.add
      .tileSprite(0, 0, CFG.SCHERM_B, CFG.SCHERM_H, TEX.verMid)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(-18)
      .setAlpha(0.55);

    // Zonnestralen door het wateroppervlak; vervagen met de diepte.
    this.lichtstralen = this.add
      .image(0, 0, TEX.stralen)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(-17)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0);

    // Zwevend plankton (ver, klein) en belletjes (dichterbij, groter).
    for (let i = 0; i < 40; i++) {
      this.plankton.push(
        this.add.image(0, 0, TEX.plankton).setDepth(-12).setScale(0.4 + Math.random() * 0.9),
      );
    }
    for (let i = 0; i < 22; i++) {
      const bel = this.add
        .image(0, 0, TEX.bubbel)
        .setDepth(-10)
        .setAlpha(0.5)
        .setScale(0.2 + Math.random() * 0.35);
      this.bellen.push(bel);
    }
    // Bellenspoor achter de speler tijdens het zwiepen.
    for (let i = 0; i < 16; i++) {
      this.spoor.push(this.add.image(0, 0, TEX.bubbel).setDepth(5).setVisible(false));
    }

    // Koudwatergrens: alleen zichtbaar zolang zone 4 op slot zit.
    this.grensBand = this.add
      .rectangle(CFG.WERELD_B / 2, CFG.GRENS_Y, CFG.WERELD_B, 26, 0x9be7ff, 0.35)
      .setDepth(-5);

    this.vignet = this.add
      .image(CFG.SCHERM_B / 2, CFG.SCHERM_H / 2, TEX.vignet)
      .setScrollFactor(0)
      .setDepth(40)
      .setAlpha(0);
  }

  private bouwPool(): void {
    for (let i = 0; i < CFG.POOL_GROOTTE; i++) {
      const sprite = this.add.image(0, 0, TEX.soort('vlokje', 0)).setVisible(false).setDepth(4);
      this.pool.push({
        actief: false,
        soort: 'vlokje',
        gedrag: 'prooivis',
        radius: CFG.SOORTEN.vlokje.radius,
        hoek: 0,
        pos: { x: 0, y: 0 },
        vel: { x: 0, y: 0 },
        sprite,
        dwaalT: 0,
        dwaalHoek: 0,
        jaagT: 0,
        afkoelT: 0,
        geheugenT: 0,
        doelX: 0,
        doelY: 0,
        burstT: 0,
        rustT: 0,
        sinusT: 0,
        driftOmkeerT: 0,
        driftRichting: 1,
        animT: 0,
        frame: 0,
      });
    }
  }

  private bouwSpeler(): void {
    const sprite = this.add.image(CFG.START_POS.x, CFG.START_POS.y, TEX.speler(1, 0)).setDepth(6);
    this.speler = {
      pos: { x: CFG.START_POS.x, y: CFG.START_POS.y },
      vel: { x: 0, y: 0 },
      hoek: 0,
      massa: CFG.SPELER_START_MASSA,
      radius: radiusVoorMassa(CFG.SPELER_START_MASSA),
      fase: 1,
      maxSnelheid: maxSnelheidVoorMassa(CFG.SPELER_START_MASSA),
      energie: CFG.ENERGIE_MAX,
      boostAan: false,
      onkwetsbaarT: 0,
      animT: 0,
      frame: 0,
      sprite,
    };
  }

  private bouwHud(): void {
    // Vaste achtergrondpaneeltjes: één keer tekenen, daarna alleen de balken.
    const achter = this.add.graphics().setScrollFactor(0).setDepth(99);
    achter.fillStyle(0x03101f, 0.32);
    achter.fillRoundedRect(8, 8, 150, 56, 14);
    achter.fillStyle(0x03101f, 0.32);
    achter.fillCircle(CFG.SCHERM_B - 30, 30, 22);
    achter.fillStyle(0x03101f, 0.3);
    achter.fillRoundedRect(10, CFG.SCHERM_H - 28, CFG.SCHERM_B - 20, 16, 8);

    this.hudBalken = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.scoreTekst = this.add
      .text(20, 14, '0', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '24px',
        color: '#ffffff',
      })
      .setScrollFactor(0)
      .setDepth(101);
    this.pauzeKnop = this.add
      .text(CFG.SCHERM_B - 30, 30, '⏸', { fontFamily: 'Arial', fontSize: '22px' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101)
      .setInteractive({ useHandCursor: true });
    this.pauzeKnop.on('pointerdown', () => {
      Geluid.ontgrendel();
      Geluid.knop();
      if (this.status === 'spelen') this.pauzeer();
      else if (this.status === 'pauze') this.hervat();
    });
  }

  private bouwBesturing(): void {
    const kb = this.input.keyboard;
    if (kb) {
      this.toetsen = kb.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE') as Record<
        string,
        Phaser.Input.Keyboard.Key
      >;
      kb.on('keydown-ESC', () => {
        Geluid.ontgrendel();
        if (this.status === 'spelen') this.pauzeer();
        else if (this.status === 'pauze') this.hervat();
      });
    }

    maakBesturingTexturen(this, CFG.JOYSTICK_STRAAL, CFG.BOOSTKNOP_STRAAL);

    const jx = CFG.JOYSTICK_STRAAL + 26;
    const jy = CFG.SCHERM_H - CFG.JOYSTICK_STRAAL - 34;
    this.joystickBasis = this.add
      .image(jx, jy, TEX.stickBasis)
      .setScale(TEX_SCHAAL)
      .setScrollFactor(0)
      .setDepth(100);
    this.joystickDuim = this.add
      .image(jx, jy, TEX.stickDuim)
      .setScale(TEX_SCHAAL)
      .setScrollFactor(0)
      .setDepth(101);

    const bx = CFG.SCHERM_B - CFG.BOOSTKNOP_STRAAL - 20;
    const by = CFG.SCHERM_H - CFG.BOOSTKNOP_STRAAL - 34;
    this.boostKnop = this.add
      .image(bx, by, TEX.boostKnop)
      .setScale(TEX_SCHAAL)
      .setScrollFactor(0)
      .setDepth(100);
    this.boostKnopTekst = this.add
      .text(bx, by + CFG.BOOSTKNOP_STRAAL * 0.55, 'ZWIEP', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '13px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101)
      .setAlpha(0.9);

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      Geluid.ontgrendel();
      if (this.status !== 'spelen') return;
      if (this.raaktBoostKnop(p)) {
        this.boostPointer = p.id;
      } else if (p.x < CFG.SCHERM_B * 0.62 && p.y > CFG.SCHERM_H * 0.35) {
        this.joystickPointer = p.id;
        this.zetDuim(p.x, p.y);
      }
    });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (this.status === 'spelen' && p.id === this.joystickPointer) this.zetDuim(p.x, p.y);
    });
    const losLaten = (p: Phaser.Input.Pointer): void => {
      if (p.id === this.joystickPointer) {
        this.joystickPointer = null;
        this.joystickDuim.setPosition(this.joystickBasis.x, this.joystickBasis.y);
        this.invoerSterkte = 0;
      }
      if (p.id === this.boostPointer) this.boostPointer = null;
    };
    this.input.on('pointerup', losLaten);
    this.input.on('pointerupoutside', losLaten);
  }

  private raaktBoostKnop(p: Phaser.Input.Pointer): boolean {
    const dx = p.x - this.boostKnop.x;
    const dy = p.y - this.boostKnop.y;
    return dx * dx + dy * dy <= CFG.BOOSTKNOP_STRAAL * CFG.BOOSTKNOP_STRAAL;
  }

  /** Zet de joystickduim op de vinger, geklemd binnen de basiscirkel. */
  private zetDuim(x: number, y: number): void {
    let dx = x - this.joystickBasis.x;
    let dy = y - this.joystickBasis.y;
    const lengte = Math.sqrt(dx * dx + dy * dy);
    if (lengte > CFG.JOYSTICK_STRAAL) {
      dx = (dx / lengte) * CFG.JOYSTICK_STRAAL;
      dy = (dy / lengte) * CFG.JOYSTICK_STRAAL;
    }
    this.joystickDuim.setPosition(this.joystickBasis.x + dx, this.joystickBasis.y + dy);
    if (lengte < CFG.JOYSTICK_DODE_ZONE) {
      this.invoerSterkte = 0;
      return;
    }
    this.invoer.x = dx;
    this.invoer.y = dy;
    normaliseer(this.invoer, this.invoer);
    this.invoerSterkte = Math.min(1, lengte / CFG.JOYSTICK_STRAAL);
  }

  // ───────────────────────────────────────────────────────── ronde

  private startRonde(): void {
    this.status = 'spelen';
    this.rondeT = 0;
    this.dreiging = 0;
    this.spawnT = 0;
    this.apexRolT = CFG.APEX_ROL_INTERVAL;
    this.score = 0;
    this.gegeten = 0;
    this.grootsteMassa = CFG.SPELER_START_MASSA;
    this.grootsteFase = 1;
    this.laatsteScore = -1;

    for (const e of this.pool) this.geefTerug(e);
    this.actiefAantal = 0;

    this.speler.pos.x = CFG.START_POS.x;
    this.speler.pos.y = CFG.START_POS.y;
    this.speler.vel.x = 0;
    this.speler.vel.y = 0;
    this.speler.hoek = 0;
    this.speler.massa = CFG.SPELER_START_MASSA;
    this.speler.radius = radiusVoorMassa(CFG.SPELER_START_MASSA);
    this.speler.fase = 1;
    this.speler.maxSnelheid = maxSnelheidVoorMassa(CFG.SPELER_START_MASSA);
    this.speler.energie = CFG.ENERGIE_MAX;
    this.speler.boostAan = false;
    this.speler.onkwetsbaarT = 0;
    this.speler.animT = 0;
    this.speler.frame = 0;
    this.speler.sprite.setTexture(TEX.speler(1, 0)).setVisible(true).setAlpha(1);
    for (const bel of this.spoor) bel.setVisible(false);
    this.tekenSpeler();

    this.grensBand.setVisible(!this.save.zone4Ontgrendeld(this.saveData));

    // Camera meteen op de speler, zodat de eerste spawns écht buiten beeld
    // vallen (de spawnring rekent met het cameracentrum).
    this.cameras.main.centerOn(this.speler.pos.x, this.speler.pos.y);
    this.camCentrum.x = this.cameras.main.midPoint.x;
    this.camCentrum.y = this.cameras.main.midPoint.y;

    for (const bel of this.bellen) this.verplaatsBel(bel, true);
    for (const p of this.plankton) this.verplaatsPlankton(p, true);

    // Vul de ring buiten beeld tot de doelbezetting: het scherm begint leeg en
    // stroomt in een paar seconden vol.
    let pogingen = 0;
    while (this.actiefAantal < CFG.DOEL_BEZETTING && pogingen < CFG.DOEL_BEZETTING * 4) {
      pogingen++;
      this.spawnActie();
    }

    this.overlay.setVisible(false);
    this.overlay.removeAll(true);
  }

  private pauzeer(): void {
    if (this.status !== 'spelen') return;
    this.status = 'pauze';
    this.toonKaart('Pauze', this.recordRegels(), [
      { tekst: '▶ Verder spelen', kleur: 0x22c55e, actie: () => this.hervat() },
      { tekst: '⬅ Terug naar het menu', kleur: 0x64748b, actie: () => this.scene.start('Menu') },
    ]);
  }

  private hervat(): void {
    if (this.status !== 'pauze') return;
    this.status = 'spelen';
    this.overlay.setVisible(false);
    this.overlay.removeAll(true);
  }

  private gaDood(): void {
    if (this.status === 'dood') return;
    this.status = 'dood';
    Geluid.dood();
    this.cameras.main.shake(260, 0.012);
    this.speler.boostAan = false;

    const vorige = this.saveData;
    const nieuwRecord = this.score > vorige.hoogsteScore;
    this.saveData = this.save.registreerRonde({
      score: this.score,
      duurSec: Math.round(this.rondeT),
      grootsteMassa: Math.round(this.grootsteMassa),
      grootsteFase: this.grootsteFase,
      gegeten: this.gegeten,
      datumIso: new Date().toISOString(),
    });

    this.tweens.add({
      targets: this.speler.sprite,
      alpha: 0,
      scale: this.speler.sprite.scale * 0.4,
      duration: CFG.DOOD_ANIMATIE * 1000,
      onComplete: () => {
        if (nieuwRecord) Geluid.record();
        const naam = CFG.FASES.find((f) => f.fase === this.grootsteFase)?.naam ?? '';
        const regels = [
          `Score: ${this.score}${nieuwRecord ? '   ⭐ NIEUW RECORD!' : ''}`,
          `Overleefd: ${this.tijdTekst(this.rondeT)}`,
          `Grootste vis: ${naam} (fase ${this.grootsteFase})`,
          `Vissen gegeten: ${this.gegeten}`,
          '',
          ...this.recordRegels(),
        ];
        this.toonKaart('Opgegeten!', regels, [
          { tekst: '▶ Nog een keer', kleur: 0x22c55e, actie: () => this.startRonde() },
          { tekst: '⬅ Terug naar het menu', kleur: 0x64748b, actie: () => this.scene.start('Menu') },
        ]);
      },
    });
  }

  private tijdTekst(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m > 0 ? `${m} min ${s} sec` : `${s} sec`;
  }

  private recordRegels(): string[] {
    const d = this.saveData;
    const regels = [
      'JOUW RECORDS',
      `Hoogste score: ${d.hoogsteScore}`,
      `Langst overleefd: ${this.tijdTekst(d.langsteOverlevingSec)}`,
      `Grootste vis: ${d.grootsteMassa} (fase ${Math.max(1, d.grootsteFase)})`,
      `Meeste gegeten: ${d.meesteGegeten}   ·   totaal: ${d.totaalGegeten}`,
    ];
    if (d.laatste5.length > 0) {
      regels.push('', 'LAATSTE RONDES');
      for (const r of d.laatste5) {
        regels.push(`${r.score} punten · ${this.tijdTekst(r.duurSec)} · ${r.gegeten} gegeten`);
      }
    }
    if (!this.save.zone4Ontgrendeld(d)) {
      regels.push('', `Haal fase ${CFG.ZONE4_EIS_FASE} om de Inktdiepte te openen.`);
    }
    return regels;
  }

  // ───────────────────────────────────────────────────────── overlay

  private toonKaart(
    titel: string,
    regels: string[],
    knoppen: { tekst: string; kleur: number; actie: () => void }[],
  ): void {
    this.overlay.removeAll(true);
    const b = CFG.SCHERM_B;
    const h = CFG.SCHERM_H;

    this.overlay.add(this.add.rectangle(0, 0, b, h, 0x03101f, 0.72).setOrigin(0));

    // De kaart wordt pas getekend als de inhoud is uitgemeten (hij staat al
    // wel vooraan in de container, dus achter alle tekst).
    const kaart = this.add.graphics();
    this.overlay.add(kaart);

    const kaartTop = 60;
    this.overlay.add(
      this.add
        .text(b / 2, kaartTop + 32, titel, {
          fontFamily: 'Arial Black, Arial',
          fontSize: '28px',
          color: '#14303f',
        })
        .setOrigin(0.5),
    );

    let y = kaartTop + 72;
    for (const regel of regels) {
      if (regel !== '') {
        const kop = regel === regel.toUpperCase() && regel.length < 22;
        this.overlay.add(
          this.add
            .text(b / 2, y, regel, {
              fontFamily: kop ? 'Arial Black, Arial' : 'Arial',
              fontSize: kop ? '14px' : '15px',
              color: kop ? '#0ea5e9' : '#14303f',
            })
            .setOrigin(0.5),
        );
      }
      y += regel === '' ? 10 : 20;
    }

    y = this.bouwKeuzerij(y + 6);

    const knopY = y + 34;
    knoppen.forEach((k, i) => {
      const ky = knopY + i * 52;
      const vlak = this.add
        .rectangle(b / 2, ky, b - 110, 42, k.kleur, 1)
        .setInteractive({ useHandCursor: true });
      const label = this.add
        .text(b / 2, ky, k.tekst, {
          fontFamily: 'Arial Black, Arial',
          fontSize: '17px',
          color: '#ffffff',
        })
        .setOrigin(0.5);
      vlak.on('pointerdown', () => {
        Geluid.ontgrendel();
        Geluid.knop();
        k.actie();
      });
      this.overlay.add(vlak);
      this.overlay.add(label);
    });

    // Nu pas de kaart zelf: precies zo hoog als zijn inhoud, en verticaal
    // gecentreerd zodat er geen gat onder de knoppen valt.
    const kaartHoog = knopY + knoppen.length * 52 - kaartTop + 8;
    kaart.fillStyle(0xffffff, 0.96);
    kaart.fillRoundedRect(20, kaartTop, b - 40, kaartHoog, 22);
    kaart.lineStyle(4, 0x14303f, 1);
    kaart.strokeRoundedRect(20, kaartTop, b - 40, kaartHoog, 22);

    // Alles behalve de verduistering (kind 0) zakt naar het midden van het
    // scherm; de verduistering moet het hele scherm blijven bedekken.
    const verschuif = Math.max(0, Math.round((h - kaartHoog) / 2 - kaartTop));
    if (verschuif > 0) {
      const kinderen = this.overlay.list as unknown as { y: number }[];
      for (let i = 1; i < kinderen.length; i++) kinderen[i].y += verschuif;
    }

    this.overlay.setVisible(true);
  }

  /** Rij met ontgrendelde kleuren en skins; geeft de nieuwe y terug. */
  private bouwKeuzerij(startY: number): number {
    const kleuren = this.save.ontgrendeldeKleuren(this.saveData);
    const skins = this.save.ontgrendeldeSkins(this.saveData);
    if (kleuren.length <= 1 && skins.length <= 1) return startY;

    const b = CFG.SCHERM_B;
    let y = startY;
    this.overlay.add(
      this.add
        .text(b / 2, y, 'JOUW VISJE', {
          fontFamily: 'Arial Black, Arial',
          fontSize: '14px',
          color: '#0ea5e9',
        })
        .setOrigin(0.5),
    );
    y += 26;

    const stapX = 46;
    const startX = b / 2 - ((kleuren.length - 1) * stapX) / 2;
    kleuren.forEach((id, i) => {
      const x = startX + i * stapX;
      const gekozen = this.saveData.gekozenKleur === id;
      const cirkel = this.add
        .circle(x, y, gekozen ? 17 : 14, kleurNummer(id), 1)
        .setStrokeStyle(gekozen ? 4 : 2, 0x14303f)
        .setInteractive({ useHandCursor: true });
      cirkel.on('pointerdown', () => {
        Geluid.ontgrendel();
        Geluid.knop();
        if (this.save.kiesKleur(id)) this.pasUiterlijkToe();
      });
      this.overlay.add(cirkel);
    });
    y += 34;

    if (skins.length > 1) {
      const namen: Record<string, string> = {
        gewoon: 'Gewoon',
        neonvisje: 'Neon',
        stekelbaars: 'Stekels',
      };
      const skinStap = 96;
      const skinStart = b / 2 - ((skins.length - 1) * skinStap) / 2;
      skins.forEach((id, i) => {
        const x = skinStart + i * skinStap;
        const gekozen = this.saveData.gekozenSkin === id;
        const knop = this.add
          .rectangle(x, y, 88, 26, gekozen ? 0x0ea5e9 : 0xe2e8f0, 1)
          .setInteractive({ useHandCursor: true });
        const label = this.add
          .text(x, y, namen[id] ?? id, {
            fontFamily: 'Arial',
            fontSize: '13px',
            fontStyle: 'bold',
            color: gekozen ? '#ffffff' : '#14303f',
          })
          .setOrigin(0.5);
        knop.on('pointerdown', () => {
          Geluid.ontgrendel();
          Geluid.knop();
          if (this.save.kiesSkin(id)) this.pasUiterlijkToe();
        });
        this.overlay.add(knop);
        this.overlay.add(label);
      });
      y += 30;
    }
    return y;
  }

  /** Nieuwe kleur/skin: spelertextures opnieuw bakken en de kaart verversen. */
  private pasUiterlijkToe(): void {
    this.saveData = this.save.laad();
    maakSpelerTexturen(this, CFG.FASES, this.saveData.gekozenKleur, this.saveData.gekozenSkin);
    this.speler.sprite.setTexture(TEX.speler(this.speler.fase, this.speler.frame));
    this.tekenSpeler();
    if (this.status === 'pauze') this.pauzeer2();
    else if (this.status === 'dood') this.herbouwEindkaart();
  }

  /** Ververst de pauzekaart (dezelfde inhoud, nieuwe selectie-markering). */
  private pauzeer2(): void {
    this.toonKaart('Pauze', this.recordRegels(), [
      { tekst: '▶ Verder spelen', kleur: 0x22c55e, actie: () => this.hervat() },
      { tekst: '⬅ Terug naar het menu', kleur: 0x64748b, actie: () => this.scene.start('Menu') },
    ]);
  }

  private herbouwEindkaart(): void {
    const naam = CFG.FASES.find((f) => f.fase === this.grootsteFase)?.naam ?? '';
    const regels = [
      `Score: ${this.score}`,
      `Overleefd: ${this.tijdTekst(this.rondeT)}`,
      `Grootste vis: ${naam} (fase ${this.grootsteFase})`,
      `Vissen gegeten: ${this.gegeten}`,
      '',
      ...this.recordRegels(),
    ];
    this.toonKaart('Opgegeten!', regels, [
      { tekst: '▶ Nog een keer', kleur: 0x22c55e, actie: () => this.startRonde() },
      { tekst: '⬅ Terug naar het menu', kleur: 0x64748b, actie: () => this.scene.start('Menu') },
    ]);
  }

  // ───────────────────────────────────────────────────────── spawnen

  /** Eén spawn-actie: één vis, of één school van SCHOOL_SPAWN_N leden. */
  private spawnActie(): void {
    if (this.actiefAantal >= CFG.MAX_ACTIEF) return;
    const punt = kiesSpawnPunt(this.camCentrum, Math.random);
    if (!punt) return;
    const zone = zoneVoorY(punt.y);
    if (zone === CFG.AANTAL_ZONES && !this.save.zone4Ontgrendeld(this.saveData)) return;
    const soort = kiesSoort(zone, this.dreiging, Math.random);

    if (CFG.SOORTEN[soort].gedrag === 'schoolvis') {
      if (this.actiefAantal + CFG.SCHOOL_SPAWN_N > CFG.MAX_ACTIEF) return;
      const posities = schoolPosities(punt, Math.random);
      for (const p of posities) this.neemUitPool(soort, p.x, p.y);
    } else {
      this.neemUitPool(soort, punt.x, punt.y);
    }
  }

  private probeerApex(): void {
    for (const e of this.pool) {
      if (e.actief && e.gedrag === 'apex') return; // er is er al één
    }
    for (let i = 0; i < CFG.SPAWN_POGINGEN; i++) {
      const punt = kiesSpawnPunt(this.camCentrum, Math.random);
      if (punt && zoneVoorY(punt.y) === CFG.AANTAL_ZONES) {
        this.neemUitPool('diepteschrik', punt.x, punt.y);
        return;
      }
    }
  }

  private neemUitPool(soort: SoortId, x: number, y: number): Entiteit | null {
    if (this.actiefAantal >= CFG.MAX_ACTIEF) return null;
    for (const e of this.pool) {
      if (e.actief) continue;
      const cfg = CFG.SOORTEN[soort];
      e.actief = true;
      e.soort = soort;
      e.gedrag = cfg.gedrag;
      e.radius = cfg.radius;
      e.pos.x = x;
      e.pos.y = y;
      e.hoek = Math.random() * Math.PI * 2;
      e.vel.x = Math.cos(e.hoek) * cfg.kruisSnelheid;
      e.vel.y = Math.sin(e.hoek) * cfg.kruisSnelheid;
      e.dwaalHoek = e.hoek;
      e.dwaalT = CFG.DWAAL_MIN + Math.random() * (CFG.DWAAL_MAX - CFG.DWAAL_MIN);
      e.jaagT = 0;
      e.afkoelT = 0;
      e.geheugenT = 0;
      e.burstT = 0;
      e.rustT = 0;
      e.sinusT = Math.random() * CFG.KWAL_PERIODE;
      e.driftOmkeerT = Math.random() * CFG.KWAL_OMKEER;
      e.driftRichting = Math.random() < 0.5 ? 1 : -1;
      e.animT = Math.random() * ANIM_FRAMES; // niet alle vissen in de maat
      e.frame = 0;
      e.sprite
        .setTexture(TEX.soort(soort, 0))
        .setPosition(x, y)
        .setVisible(true)
        .setScale(TEX_SCHAAL)
        .setAlpha(1)
        .setFlipY(false)
        .setRotation(0);
      this.actiefAantal++;
      return e;
    }
    return null;
  }

  private geefTerug(e: Entiteit): void {
    if (e.actief) this.actiefAantal--;
    e.actief = false;
    e.sprite.setVisible(false);
  }

  // ───────────────────────────────────────────────────────── de lus

  update(_tijd: number, deltaMs: number): void {
    const dt = Math.min(deltaMs / 1000, 0.05); // na een tabwissel niet doorschieten
    this.camCentrum.x = this.cameras.main.midPoint.x;
    this.camCentrum.y = this.cameras.main.midPoint.y;
    this.tekenAchtergrond();

    if (this.status !== 'spelen') return;

    this.rondeT += dt;
    this.dreiging = dreigingsNiveau(this.rondeT);

    this.updateSpeler(dt);
    this.updateEntiteiten(dt);
    this.botsingen();
    this.updateSpawner(dt);
    this.updateBellen(dt);
    this.tekenHud();
  }

  private invoerUitToetsen(): void {
    let x = 0;
    let y = 0;
    const t = this.toetsen;
    if (t.A?.isDown || t.LEFT?.isDown) x -= 1;
    if (t.D?.isDown || t.RIGHT?.isDown) x += 1;
    if (t.W?.isDown || t.UP?.isDown) y -= 1;
    if (t.S?.isDown || t.DOWN?.isDown) y += 1;
    if (x === 0 && y === 0) return;
    this.invoer.x = x;
    this.invoer.y = y;
    normaliseer(this.invoer, this.invoer);
    this.invoerSterkte = 1;
  }

  private updateSpeler(dt: number): void {
    const s = this.speler;
    if (this.joystickPointer === null) this.invoerSterkte = 0;
    this.invoerUitToetsen();

    // Boost: starten mag pas vanaf de drempel, doorgaan zolang er energie is.
    const wilBoost = this.boostPointer !== null || this.toetsen.SPACE?.isDown === true;
    const magDoor = s.boostAan ? s.energie > 0 : magBoostStarten(s.energie);
    const boostNu = wilBoost && magDoor;
    if (boostNu && !s.boostAan) Geluid.boost();
    s.boostAan = boostNu;
    s.energie = nieuweEnergie(s.energie, dt, s.boostAan);

    const maxSnelheid = s.maxSnelheid * (s.boostAan ? CFG.BOOST_FACTOR : 1);
    if (this.invoerSterkte > 0) {
      const doelHoek = Math.atan2(this.invoer.y, this.invoer.x);
      s.hoek = draaiNaar(s.hoek, doelHoek, CFG.SPELER_DRAAI, dt);
      s.vel.x += Math.cos(s.hoek) * CFG.SPELER_ACCEL * this.invoerSterkte * dt;
      s.vel.y += Math.sin(s.hoek) * CFG.SPELER_ACCEL * this.invoerSterkte * dt;
    } else {
      this.remAf(s.vel, CFG.SPELER_DRAG * dt);
    }
    this.klemSnelheid(s.vel, maxSnelheid);

    s.pos.x += s.vel.x * dt;
    s.pos.y += s.vel.y * dt;

    // Wereldranden: de speler wordt geklemd (geen stuiter).
    if (s.pos.x < s.radius) {
      s.pos.x = s.radius;
      s.vel.x = 0;
    }
    if (s.pos.x > CFG.WERELD_B - s.radius) {
      s.pos.x = CFG.WERELD_B - s.radius;
      s.vel.x = 0;
    }
    if (s.pos.y < s.radius) {
      s.pos.y = s.radius;
      s.vel.y = 0;
    }
    if (s.pos.y > CFG.WERELD_H - s.radius) {
      s.pos.y = CFG.WERELD_H - s.radius;
      s.vel.y = 0;
    }

    // Koudwatergrens: zone 4 blijft dicht tot je ooit fase 4 haalde.
    if (!this.save.zone4Ontgrendeld(this.saveData) && s.pos.y > CFG.GRENS_Y) {
      s.pos.y = CFG.GRENS_Y;
      if (s.vel.y > 0) s.vel.y = -CFG.GRENS_DUW;
    }

    if (s.onkwetsbaarT > 0) s.onkwetsbaarT -= dt;

    // Staartslag volgt de zwemsnelheid.
    const tempo = Math.sqrt(s.vel.x * s.vel.x + s.vel.y * s.vel.y) / s.maxSnelheid;
    s.animT += dt * Math.min(2.5, 0.6 + tempo);
    const frame = Math.floor(s.animT * ANIM_FPS) % ANIM_FRAMES;
    if (frame !== s.frame) {
      s.frame = frame;
      s.sprite.setTexture(TEX.speler(s.fase, frame));
    }

    this.updateSpoor(dt);
    this.tekenSpeler();
  }

  /** Bellenspoor achter de vis tijdens het zwiepen (vaste pool, geen nieuwe objecten). */
  private updateSpoor(dt: number): void {
    const s = this.speler;
    this.spoorT -= dt;
    if (s.boostAan && this.spoorT <= 0) {
      this.spoorT = 0.05;
      const bel = this.spoor[this.spoorIndex];
      this.spoorIndex = (this.spoorIndex + 1) % this.spoor.length;
      bel
        .setPosition(s.pos.x - Math.cos(s.hoek) * s.radius * 1.2, s.pos.y - Math.sin(s.hoek) * s.radius * 1.2)
        .setVisible(true)
        .setAlpha(0.75)
        .setScale(0.1 + Math.random() * 0.18);
    }
    for (const bel of this.spoor) {
      if (!bel.visible) continue;
      bel.y -= 30 * dt;
      bel.setAlpha(bel.alpha - dt * 1.1);
      bel.setScale(bel.scale + dt * 0.12);
      if (bel.alpha <= 0.02) bel.setVisible(false);
    }
  }

  private remAf(vel: Vec, hoeveel: number): void {
    const snelheid = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
    if (snelheid <= hoeveel) {
      vel.x = 0;
      vel.y = 0;
      return;
    }
    const factor = (snelheid - hoeveel) / snelheid;
    vel.x *= factor;
    vel.y *= factor;
  }

  private klemSnelheid(vel: Vec, max: number): void {
    const snelheid = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
    if (snelheid > max && snelheid > 0) {
      vel.x = (vel.x / snelheid) * max;
      vel.y = (vel.y / snelheid) * max;
    }
  }

  private tekenSpeler(): void {
    const s = this.speler;
    const faseCfg = this.faseCfg[s.fase] ?? CFG.FASES[0];
    s.sprite.setPosition(s.pos.x, s.pos.y);
    s.sprite.setScale((s.radius / faseCfg.radius) * TEX_SCHAAL);
    s.sprite.setRotation(s.hoek);
    s.sprite.setFlipY(Math.cos(s.hoek) < 0);
    s.sprite.setAlpha(s.onkwetsbaarT > 0 ? 0.55 : 1);
  }

  // ───────────────────────────────────────────────────────── AI

  private updateEntiteiten(dt: number): void {
    const speler = this.speler;
    for (const e of this.pool) {
      if (!e.actief) continue;

      // Buiten de despawn-straal? Terug in de pool (en later opnieuw gebruikt).
      const dxc = e.pos.x - this.camCentrum.x;
      const dyc = e.pos.y - this.camCentrum.y;
      if (dxc * dxc + dyc * dyc > CFG.DESPAWN_AFSTAND * CFG.DESPAWN_AFSTAND) {
        this.geefTerug(e);
        continue;
      }

      if (e.gedrag === 'gevaar') {
        this.updateKwal(e, dt);
        continue;
      }

      const dxs = speler.pos.x - e.pos.x;
      const dys = speler.pos.y - e.pos.y;
      const afstandSpeler = Math.sqrt(dxs * dxs + dys * dys);
      const cfg = CFG.SOORTEN[e.soort];
      let doelHoek = e.dwaalHoek;
      let doelSnelheid = cfg.kruisSnelheid;

      if (e.gedrag === 'roofvis' || e.gedrag === 'apex') {
        // Een roofvis die de speler niet aankan, is zelf prooi en vlucht.
        if (kanEten(speler.radius, e.radius) && afstandSpeler < CFG.PROOI_DETECTIE) {
          vluchtVector(e.pos, speler.pos, this.v1);
          doelHoek = Math.atan2(this.v1.y, this.v1.x);
          doelSnelheid = cfg.kruisSnelheid * CFG.VLUCHT_FACTOR;
        } else {
          doelSnelheid = this.jaagGedrag(e, dt, afstandSpeler, cfg.kruisSnelheid);
          if (e.geheugenT > 0) doelHoek = Math.atan2(e.doelY - e.pos.y, e.doelX - e.pos.x);
          else doelHoek = this.dwaal(e, dt, CFG.PATROUILLE_MIN, CFG.PATROUILLE_MAX);
        }
      } else {
        // Prooi- en schoolvissen: vluchten voor alles wat groter is.
        const vlucht = this.zoekBedreiging(e, afstandSpeler);
        if (vlucht) {
          doelHoek = Math.atan2(this.v1.y, this.v1.x);
          doelSnelheid = cfg.topSnelheid;
        } else if (e.gedrag === 'schoolvis') {
          const aantal = this.verzamelBuren(e);
          if (aantal > 0) {
            schoolKracht(e.pos, this.burenBuffer, aantal, this.v2);
            if (this.v2.x !== 0 || this.v2.y !== 0) {
              doelHoek = Math.atan2(this.v2.y, this.v2.x);
            } else {
              doelHoek = this.dwaal(e, dt, CFG.DWAAL_MIN, CFG.DWAAL_MAX);
            }
          } else {
            doelHoek = this.dwaal(e, dt, CFG.DWAAL_MIN, CFG.DWAAL_MAX);
          }
        } else {
          doelHoek = this.dwaal(e, dt, CFG.DWAAL_MIN, CFG.DWAAL_MAX);
        }
      }

      doelHoek = this.buigNaarBinnen(e, doelHoek);

      const draai = e.gedrag === 'roofvis' || e.gedrag === 'apex' ? CFG.ROOFVIS_DRAAI : CFG.NPC_DRAAI;
      e.hoek = draaiNaar(e.hoek, doelHoek, draai, dt);
      e.vel.x += Math.cos(e.hoek) * CFG.NPC_ACCEL * dt;
      e.vel.y += Math.sin(e.hoek) * CFG.NPC_ACCEL * dt;
      this.klemSnelheid(e.vel, doelSnelheid);
      e.pos.x += e.vel.x * dt;
      e.pos.y += e.vel.y * dt;
      e.pos.x = Phaser.Math.Clamp(e.pos.x, 0, CFG.WERELD_B);
      e.pos.y = Phaser.Math.Clamp(e.pos.y, 0, CFG.WERELD_H);

      this.animeer(e, dt, doelSnelheid / Math.max(1, cfg.kruisSnelheid));
      e.sprite.setPosition(e.pos.x, e.pos.y);
      e.sprite.setRotation(e.hoek);
      e.sprite.setFlipY(Math.cos(e.hoek) < 0);
    }
  }

  /** Laat de staart slaan: sneller zwemmen = sneller frame wisselen. */
  private animeer(e: Entiteit, dt: number, tempo: number): void {
    e.animT += dt * Math.min(2.5, 0.6 + tempo);
    const frame = Math.floor(e.animT * ANIM_FPS) % ANIM_FRAMES;
    if (frame !== e.frame) {
      e.frame = frame;
      e.sprite.setTexture(TEX.soort(e.soort, frame));
    }
  }

  /** Jaaglogica van roofvis en apex; geeft de gewenste snelheid terug. */
  private jaagGedrag(e: Entiteit, dt: number, afstandSpeler: number, kruis: number): number {
    const isApex = e.gedrag === 'apex';
    const cfg = CFG.SOORTEN[e.soort];

    if (e.afkoelT > 0) {
      e.afkoelT -= dt;
      e.geheugenT = 0;
      return kruis;
    }
    if (isApex && e.rustT > 0) {
      e.rustT -= dt;
      e.geheugenT = 0;
      return kruis;
    }

    const zicht = isApex ? CFG.APEX_ZICHT : CFG.ROOF_ZICHT;
    const hoek = isApex ? CFG.APEX_ZICHTHOEK : CFG.ROOF_ZICHTHOEK;
    const magEten = kanEten(e.radius, this.speler.radius);
    if (magEten && inZicht(e.pos, e.hoek, this.speler.pos, zicht, hoek)) {
      e.doelX = this.speler.pos.x;
      e.doelY = this.speler.pos.y;
      e.geheugenT = CFG.JAAG_GEHEUGEN;
    }

    if (e.geheugenT <= 0) {
      e.jaagT = 0;
      e.burstT = 0;
      return kruis;
    }

    e.geheugenT -= dt;
    e.jaagT += dt;
    if (isApex) {
      e.burstT += dt;
      if (e.burstT > CFG.APEX_BURST_MAX_T) {
        e.burstT = 0;
        e.jaagT = 0;
        e.geheugenT = 0;
        e.rustT = CFG.APEX_RUST;
        return kruis;
      }
      return cfg.topSnelheid; // de apex-burst schaalt bewust niet met de dreiging
    }
    if (!magBlijvenJagen(e.jaagT, afstandSpeler)) {
      e.jaagT = 0;
      e.geheugenT = 0;
      e.afkoelT = CFG.JAAG_AFKOEL;
      return kruis;
    }
    return cfg.topSnelheid * jaagFactor(this.dreiging);
  }

  /**
   * Zoekt de dichtstbijzijnde grotere vis binnen PROOI_DETECTIE en zet de
   * vluchtrichting in v1. Geeft terug of er gevlucht moet worden.
   */
  private zoekBedreiging(e: Entiteit, afstandSpeler: number): boolean {
    let besteAfstand = CFG.PROOI_DETECTIE;
    let besteX = 0;
    let besteY = 0;
    let gevonden = false;

    if (afstandSpeler < besteAfstand && this.speler.radius > e.radius) {
      besteAfstand = afstandSpeler;
      besteX = this.speler.pos.x;
      besteY = this.speler.pos.y;
      gevonden = true;
    }
    for (const ander of this.pool) {
      if (!ander.actief || ander === e || ander.radius <= e.radius) continue;
      if (ander.gedrag === 'gevaar') continue;
      const dx = ander.pos.x - e.pos.x;
      const dy = ander.pos.y - e.pos.y;
      const afstand = Math.sqrt(dx * dx + dy * dy);
      if (afstand < besteAfstand) {
        besteAfstand = afstand;
        besteX = ander.pos.x;
        besteY = ander.pos.y;
        gevonden = true;
      }
    }
    if (!gevonden) return false;
    this.v2.x = besteX;
    this.v2.y = besteY;
    vluchtVector(e.pos, this.v2, this.v1);
    return true;
  }

  /** Vult burenBuffer met soortgenoten binnen de schoolradius; geeft het aantal. */
  private verzamelBuren(e: Entiteit): number {
    let n = 0;
    for (const ander of this.pool) {
      if (!ander.actief || ander === e || ander.soort !== e.soort) continue;
      const dx = ander.pos.x - e.pos.x;
      const dy = ander.pos.y - e.pos.y;
      if (dx * dx + dy * dy > CFG.SCHOOL_RADIUS * CFG.SCHOOL_RADIUS) continue;
      this.burenBuffer[n] = ander;
      n++;
      if (n >= CFG.SCHOOL_SPAWN_N * 2) break; // meer buren voegt niets toe
    }
    return n;
  }

  /** Nieuwe dwaalrichting zodra de timer afloopt; geeft de huidige richting. */
  private dwaal(e: Entiteit, dt: number, min: number, max: number): number {
    e.dwaalT -= dt;
    if (e.dwaalT <= 0) {
      e.dwaalT = min + Math.random() * (max - min);
      e.dwaalHoek = Math.random() * Math.PI * 2;
    }
    return e.dwaalHoek;
  }

  /**
   * Houdt NPC's binnen de wereld en ruwweg binnen hun eigen dieptezone: bij de
   * rand of te ver buiten de zoneband wordt de richting naar binnen gebogen.
   */
  private buigNaarBinnen(e: Entiteit, doelHoek: number): number {
    let mikX = 0;
    let mikY = 0;
    if (e.pos.x < CFG.RAND_MARGE) mikX = 1;
    else if (e.pos.x > CFG.WERELD_B - CFG.RAND_MARGE) mikX = -1;
    if (e.pos.y < CFG.RAND_MARGE) mikY = 1;
    else if (e.pos.y > CFG.WERELD_H - CFG.RAND_MARGE) mikY = -1;

    if (mikY === 0) {
      const grens = this.zoneGrens[e.soort];
      if (e.pos.y < grens.boven) mikY = 1;
      else if (e.pos.y > grens.onder) mikY = -1;
    }

    if (mikX === 0 && mikY === 0) return doelHoek;
    return Math.atan2(mikY !== 0 ? mikY : Math.sin(doelHoek), mikX !== 0 ? mikX : Math.cos(doelHoek));
  }

  private updateKwal(e: Entiteit, dt: number): void {
    e.sinusT += dt;
    e.driftOmkeerT -= dt;
    if (e.driftOmkeerT <= 0) {
      e.driftOmkeerT = CFG.KWAL_OMKEER;
      e.driftRichting *= -1;
    }
    const slinger =
      Math.cos((e.sinusT / CFG.KWAL_PERIODE) * Math.PI * 2) *
      ((CFG.KWAL_AMPLITUDE * Math.PI * 2) / CFG.KWAL_PERIODE);
    e.pos.x += slinger * dt;
    e.pos.y += CFG.KWAL_DRIFT * e.driftRichting * dt;
    e.pos.x = Phaser.Math.Clamp(e.pos.x, 0, CFG.WERELD_B);
    e.pos.y = Phaser.Math.Clamp(e.pos.y, 0, CFG.WERELD_H);
    this.animeer(e, dt, 0.4); // rustig pulserende koepel
    e.sprite.setPosition(e.pos.x, e.pos.y);
  }

  // ───────────────────────────────────────────────────────── botsingen

  private botsingen(): void {
    const s = this.speler;
    for (const e of this.pool) {
      if (!e.actief) continue;
      const dx = e.pos.x - s.pos.x;
      const dy = e.pos.y - s.pos.y;
      const afstand = Math.sqrt(dx * dx + dy * dy);

      if (e.gedrag === 'gevaar') {
        if (afstand < e.radius + s.radius && s.onkwetsbaarT <= 0) {
          s.massa = massaNaKwal(s.massa);
          s.radius = radiusVoorMassa(s.massa);
          s.onkwetsbaarT = CFG.ONKWETSBAAR;
          Geluid.au();
          this.cameras.main.shake(180, 0.008);
          this.flits(s.pos.x, s.pos.y, 0xe0aaff);
        }
        continue;
      }

      if (kanEten(s.radius, e.radius) && eetBinnenBereik(afstand, s.radius)) {
        this.eetOp(e);
        continue;
      }
      if (
        (e.gedrag === 'roofvis' || e.gedrag === 'apex') &&
        kanEten(e.radius, s.radius) &&
        eetBinnenBereik(afstand, e.radius)
      ) {
        this.gaDood();
        return;
      }
    }
  }

  private eetOp(e: Entiteit): void {
    const s = this.speler;
    const cfg = CFG.SOORTEN[e.soort];
    s.massa = massaNaEten(s.massa, cfg.massa);
    s.radius = radiusVoorMassa(s.massa);
    this.score += cfg.score;
    this.gegeten++;
    if (s.massa > this.grootsteMassa) this.grootsteMassa = s.massa;

    Geluid.hap(e.radius);
    this.flits(e.pos.x, e.pos.y, 0xffffff);
    this.geefTerug(e);

    const nieuweFase = faseVoorMassa(s.massa);
    if (nieuweFase !== s.fase) {
      s.fase = nieuweFase;
      s.maxSnelheid = maxSnelheidVoorMassa(s.massa);
      if (nieuweFase > this.grootsteFase) this.grootsteFase = nieuweFase;
      s.sprite.setTexture(TEX.speler(nieuweFase, s.frame));
      Geluid.fase();
      this.cameras.main.flash(200, 255, 255, 255);
      this.toonFaseNaam(nieuweFase);
    }
    this.tekenSpeler();
  }

  private toonFaseNaam(fase: number): void {
    const naam = CFG.FASES.find((f) => f.fase === fase)?.naam ?? '';
    const tekst = this.add
      .text(CFG.SCHERM_B / 2, CFG.SCHERM_H * 0.32, naam.toUpperCase() + '!', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(120);
    this.tweens.add({
      targets: tekst,
      y: tekst.y - 40,
      alpha: 0,
      duration: 1200,
      onComplete: () => tekst.destroy(),
    });
  }

  /** Kleine flits op een wereldpositie (alleen bij een gebeurtenis, niet per frame). */
  private flits(x: number, y: number, kleur: number): void {
    const beeld = this.add.image(x, y, TEX.hap).setDepth(8).setTint(kleur);
    this.tweens.add({
      targets: beeld,
      scale: 2.2,
      alpha: 0,
      duration: 260,
      onComplete: () => beeld.destroy(),
    });
  }

  // ───────────────────────────────────────────────────────── spawner & sfeer

  private updateSpawner(dt: number): void {
    this.spawnT -= dt;
    if (this.spawnT <= 0) {
      this.spawnT = CFG.SPAWN_INTERVAL;
      let acties = 0;
      while (acties < CFG.SPAWN_ACTIES_MAX && this.actiefAantal < CFG.DOEL_BEZETTING) {
        acties++;
        this.spawnActie();
      }
    }

    this.apexRolT -= dt;
    if (this.apexRolT <= 0) {
      this.apexRolT = CFG.APEX_ROL_INTERVAL;
      if (Math.random() < CFG.APEX_KANS && this.save.zone4Ontgrendeld(this.saveData)) {
        this.probeerApex();
      }
    }
  }

  private updateBellen(dt: number): void {
    for (const bel of this.bellen) {
      bel.y -= 26 * dt;
      if (bel.y < this.camCentrum.y - CFG.SCHERM_H) this.verplaatsBel(bel, false);
    }
    // Plankton dwarrelt langzaam omhoog en blijft rond de camera hangen.
    for (const p of this.plankton) {
      p.y -= 9 * dt;
      const dx = p.x - this.camCentrum.x;
      const dy = p.y - this.camCentrum.y;
      if (Math.abs(dx) > CFG.SCHERM_B || Math.abs(dy) > CFG.SCHERM_H * 0.7) {
        this.verplaatsPlankton(p, false);
      }
    }
  }

  private verplaatsPlankton(p: Phaser.GameObjects.Image, overalRond: boolean): void {
    p.x = this.camCentrum.x + (Math.random() - 0.5) * CFG.SCHERM_B * 1.6;
    p.y = this.camCentrum.y + (overalRond ? (Math.random() - 0.5) * CFG.SCHERM_H : CFG.SCHERM_H * 0.62);
    p.setAlpha(0.2 + Math.random() * 0.45);
  }

  private verplaatsBel(bel: Phaser.GameObjects.Image, overalRond: boolean): void {
    const spreiding = overalRond ? CFG.SCHERM_H : CFG.SCHERM_H * 0.5;
    bel.x = this.camCentrum.x + (Math.random() - 0.5) * CFG.SCHERM_B * 1.4;
    bel.y = this.camCentrum.y + (overalRond ? (Math.random() - 0.5) * spreiding : CFG.SCHERM_H * 0.6);
    bel.setAlpha(0.25 + Math.random() * 0.35);
  }

  // ───────────────────────────────────────────────────────── tekenen

  private tekenAchtergrond(): void {
    const y = this.speler.pos.y;
    const zone = zoneVoorY(y);
    const binnenZone = Phaser.Math.Clamp((y - (zone - 1) * CFG.ZONE_HOOGTE) / CFG.ZONE_HOOGTE, 0, 1);
    const volgende = ZONE_LUCHT[Math.min(zone, ZONE_LUCHT.length - 1)];
    const huidige = ZONE_LUCHT[zone - 1];
    const boven = this.mengKleur(huidige[0], volgende[0], binnenZone);
    const onder = this.mengKleur(huidige[1], volgende[1], binnenZone);

    this.achtergrond.clear();
    this.achtergrond.fillGradientStyle(boven, boven, onder, onder, 1);
    this.achtergrond.fillRect(0, 0, CFG.SCHERM_B, CFG.SCHERM_H);

    // Wateroppervlak (wereld-y = 0): vlak onder de zon is het water bijna wit.
    // Alleen tekenen als het oppervlak in of net boven beeld ligt.
    const oppervlakY = -this.cameras.main.scrollY;
    if (oppervlakY > -180) {
      this.achtergrond.fillGradientStyle(0xffffff, 0xffffff, boven, boven, 0.6, 0.6, 0, 0);
      this.achtergrond.fillRect(0, oppervlakY, CFG.SCHERM_B, 180);
    }

    // Parallax: de verre laag schuift het traagst, de middenlaag sneller.
    const cam = this.cameras.main;
    this.laagVer.tilePositionX = cam.scrollX * 0.18;
    this.laagVer.tilePositionY = cam.scrollY * 0.12;
    this.laagVer.setTint(this.mengKleur(onder, 0x000000, 0.45));
    this.laagMid.tilePositionX = cam.scrollX * 0.42;
    this.laagMid.tilePositionY = cam.scrollY * 0.3;
    this.laagMid.setTint(this.mengKleur(onder, 0x000000, 0.62));

    // Zonlicht: fel aan de oppervlakte, weg in de diepte.
    this.lichtstralen.setAlpha(Phaser.Math.Clamp(1 - y / (CFG.ZONE_HOOGTE * 2.2), 0, 1) * 0.75);

    // Vignet: pas in de diepte, en alleen als de speler er echt is.
    const diepte = Phaser.Math.Clamp((y - (CFG.GRENS_Y - CFG.ZONE_HOOGTE / 2)) / CFG.ZONE_HOOGTE, 0, 1);
    this.vignet.setAlpha(diepte);
  }

  /** Mengt twee kleuren zonder objecten aan te maken (kanaal voor kanaal). */
  private mengKleur(a: number, b: number, t: number): number {
    const ar = (a >> 16) & 0xff;
    const ag = (a >> 8) & 0xff;
    const ab = a & 0xff;
    const br = (b >> 16) & 0xff;
    const bg = (b >> 8) & 0xff;
    const bb = b & 0xff;
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bl = Math.round(ab + (bb - ab) * t);
    return (r << 16) | (g << 8) | bl;
  }

  private tekenHud(): void {
    if (this.score !== this.laatsteScore) {
      this.scoreTekst.setText(String(this.score));
      this.laatsteScore = this.score;
    }

    const g = this.hudBalken;
    g.clear();

    // Fase-voortgang: hoe ver naar de volgende evolutie.
    const s = this.speler;
    const huidig = this.faseCfg[s.fase] ?? CFG.FASES[0];
    const volgende = this.faseCfg[s.fase + 1];
    const deel = volgende
      ? Phaser.Math.Clamp((s.massa - huidig.drempel) / (volgende.drempel - huidig.drempel), 0, 1)
      : 1;
    g.fillStyle(0x03101f, 0.45);
    g.fillRoundedRect(20, 46, 126, 11, 6);
    g.fillStyle(0x7cf5d5, 1);
    g.fillRoundedRect(20, 46, Math.max(6, 126 * deel), 11, 6);
    g.fillStyle(0xffffff, 0.35);
    g.fillRoundedRect(22, 48, Math.max(4, 126 * deel - 4), 3, 2); // glansje

    // Energie voor de boost, met de startdrempel als streepje.
    const bx = 14;
    const by = CFG.SCHERM_H - 24;
    const bb = CFG.SCHERM_B - 28;
    const energieDeel = s.energie / CFG.ENERGIE_MAX;
    g.fillStyle(s.boostAan ? 0xffd60a : 0x9fe3ff, 1);
    g.fillRoundedRect(bx, by, Math.max(6, bb * energieDeel), 8, 4);
    g.fillStyle(0xffffff, 0.4);
    g.fillRoundedRect(bx + 2, by + 1.5, Math.max(4, bb * energieDeel - 4), 2.5, 1.5);
    g.fillStyle(0xffffff, 0.9);
    const drempelX = bx + bb * (CFG.BOOST_START_MIN / CFG.ENERGIE_MAX);
    g.fillRect(drempelX, by - 3, 2, 14);

    // De zwiepknop laat zien of er genoeg energie is om te starten.
    const kanZwiepen = s.boostAan || magBoostStarten(s.energie);
    this.boostKnop.setAlpha(kanZwiepen ? 1 : 0.45);
    this.boostKnop.setScale(TEX_SCHAAL * (s.boostAan ? 0.92 : 1));
    this.boostKnopTekst.setAlpha(kanZwiepen ? 0.95 : 0.35);
  }

  private opruimen(): void {
    this.input.removeAllListeners();
    this.input.keyboard?.removeAllListeners();
  }
}
