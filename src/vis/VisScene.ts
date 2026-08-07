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
import { boekPagina, boekVol, telOntdekt } from './logic/boek';
import { bouwBoek } from './BoekOverlay';
import { addStars, giveMedal } from '../progress.js';
import {
  ANIM_FPS,
  ANIM_FRAMES,
  TEX,
  TEX_SCHAAL,
  ZONE_LUCHT,
  kleurNummer,
  maakBesturingTexturen,
  maakBoekTexturen,
  maakDieptelagen,
  maakEffectTexturen,
  maakLichtstralen,
  maakNpcTexturen,
  maakSpelerTexturen,
  maakVignet,
  texSchaalVoor,
  vernietigBoekTexturen,
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

/** Hoe de kleur-unlocks in een zin heten ("nog 40 punten tot de groene vis"). */
const KLEUR_NAAM: Record<string, string> = {
  oranje: 'oranje',
  groen: 'groene',
  paars: 'paarse',
  goud: 'gouden',
};

// Maatvoering van de dieptemeter rechts in beeld (alleen opmaak, geen speltuning).
const DM_X = CFG.SCHERM_B - 20;
const DM_Y = 96;
const DM_H = 300;

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
  private grensLabel!: Phaser.GameObjects.Text;
  private bellen: Phaser.GameObjects.Image[] = [];
  private plankton: Phaser.GameObjects.Image[] = [];
  private spoor: Phaser.GameObjects.Image[] = [];
  private spoorIndex = 0;
  private spoorT = 0;
  private flitsen: Phaser.GameObjects.Image[] = [];
  private flitsIndex = 0;

  // HUD
  private hudBalken!: Phaser.GameObjects.Graphics;
  private scoreTekst!: Phaser.GameObjects.Text;
  private laatsteScore = -1;
  private pauzeKnop!: Phaser.GameObjects.Text;
  private zoneTekst!: Phaser.GameObjects.Text;
  private zoneTekstT = 0; // s dat de zonenaam nog blijft staan
  private laatsteZone = 0;
  private hintTekst!: Phaser.GameObjects.Text;
  private hintT = 0; // s dat de hint nog blijft staan
  private duikHintGehad = false; // de duik-hint komt één keer per ronde

  // Vissenboek en beloningen
  private rondeVangst: CFG.Vangst = {}; // nog niet weggeschreven ontmoetingen
  private ontdekt = new Set<SoortId>(); // wat al in het boek staat
  private boekOpen = false;
  private nieuwTekst!: Phaser.GameObjects.Text;
  private nieuwT = 0; // s dat de NIEUW!-melding nog staat
  private nieuwRij: SoortId[] = []; // wachtrij: je eet er soms drie kort na elkaar
  private nieuwRecord = false;
  private sterrenRonde = 0; // sterren die deze ronde zijn uitgekeerd
  private gehaaldeKleuren = 0; // hoeveel kleur-drempels al gemeld zijn

  // Besturing
  private toetsen: Record<string, Phaser.Input.Keyboard.Key> = {};
  private joystickBasis!: Phaser.GameObjects.Image;
  private joystickDuim!: Phaser.GameObjects.Image;
  private joystickPointer: number | null = null;
  private joystickThuis: Punt = { x: 0, y: 0 };
  private boostKnop!: Phaser.GameObjects.Image;
  private boostKnopTekst!: Phaser.GameObjects.Text;
  private boostPointer: number | null = null;
  /** Vinger die op een overlay-knop drukte; die mag niet ook gaan sturen. */
  private negeerPointer: number | null = null;
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
  /** Kant-en-klare texture-sleutels per animatieframe: geen strings per frame. */
  private soortSleutels: Record<string, string[]> = {};
  private spelerSleutels: string[][] = [];

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

    // Phaser hergebruikt dezelfde scene-instantie: bij een tweede bezoek draait
    // create() opnieuw, terwijl de sprites van de vorige keer al vernietigd
    // zijn. De lijsten moeten dus leeg vóórdat we ze opnieuw vullen — anders
    // deelt de pool dode sprites uit en klapt het spel eruit.
    this.pool.length = 0;
    this.bellen.length = 0;
    this.plankton.length = 0;
    this.spoor.length = 0;
    this.flitsen.length = 0;
    this.actiefAantal = 0;

    this.bouwAchtergrond();
    this.bouwPool();
    this.bouwSpeler();
    this.bouwHud();
    this.bouwBesturing();

    this.overlay = this.add.container(0, 0).setScrollFactor(0).setDepth(200).setVisible(false);

    this.cameras.main.startFollow(this.speler.sprite, false, CFG.CAMERA_LERP, CFG.CAMERA_LERP);
    // `once`: anders stapelt er per bezoek een luisteraar op.
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.opruimen());

    this.startRonde();
  }

  // ───────────────────────────────────────────────────────── opbouw

  /**
   * Zet alle opzoekwerk één keer klaar: welke fase-config bij welk nummer
   * hoort, en tussen welke diepten een soort thuishoort. Zonder deze tabellen
   * zou de update-lus per vis per frame moeten zoeken (en closures maken).
   */
  private bouwOpzoektabellen(): void {
    for (const f of CFG.FASES) {
      this.faseCfg[f.fase] = f;
      const rij: string[] = [];
      for (let frame = 0; frame < ANIM_FRAMES; frame++) rij[frame] = TEX.speler(f.fase, frame);
      this.spelerSleutels[f.fase] = rij;
    }
    for (const id of Object.keys(CFG.SOORTEN) as SoortId[]) {
      const rij: string[] = [];
      for (let frame = 0; frame < ANIM_FRAMES; frame++) rij[frame] = TEX.soort(id, frame);
      this.soortSleutels[id] = rij;
    }
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
    // Hap-flitsjes: ook gepoold, zodat er tijdens het spelen niets ontstaat.
    for (let i = 0; i < 8; i++) {
      this.flitsen.push(this.add.image(0, 0, TEX.hap).setDepth(8).setVisible(false));
    }

    // Koudwatergrens: alleen zichtbaar zolang zone 4 op slot zit.
    this.grensBand = this.add
      .rectangle(CFG.WERELD_B / 2, CFG.GRENS_Y, CFG.WERELD_B, 26, 0x9be7ff, 0.35)
      .setDepth(-5);
    // Zonder uitleg is een gekleurde streep een raadsel: vertel wat er moet.
    this.grensLabel = this.add
      .text(CFG.WERELD_B / 2, CFG.GRENS_Y - 26, '', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '18px',
        color: '#e8fbff',
        backgroundColor: '#03101f99',
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(-4);

    const vignetGrootte = Math.ceil(Math.sqrt(CFG.SCHERM_B ** 2 + CFG.SCHERM_H ** 2));
    this.vignet = this.add
      .image(CFG.SCHERM_B / 2, CFG.SCHERM_H / 2, TEX.vignet)
      .setDisplaySize(vignetGrootte, vignetGrootte)
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

    // Dieptemeter langs de rechterrand: de vier zones als gekleurde banden,
    // zodat je zíet dat er nog drie werelden onder je liggen.
    achter.fillStyle(0x03101f, 0.3);
    achter.fillRoundedRect(DM_X - 7, DM_Y - 8, 14, DM_H + 16, 7);
    for (let i = 0; i < CFG.AANTAL_ZONES; i++) {
      const bandY = DM_Y + (i * DM_H) / CFG.AANTAL_ZONES;
      const bandH = DM_H / CFG.AANTAL_ZONES - 3;
      achter.fillStyle(ZONE_LUCHT[i][1], 0.95);
      achter.fillRoundedRect(DM_X - 4, bandY, 8, bandH, 4);
    }

    this.zoneTekst = this.add
      .text(CFG.SCHERM_B / 2, 84, '', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(102)
      .setAlpha(0);

    // Eigen plek voor de NIEUW!-melding: de fasenaam staat op 0,32 H en de
    // duikhint op 0,62 H, dus die zouden elkaar overschrijven.
    this.nieuwTekst = this.add
      .text(CFG.SCHERM_B / 2, CFG.SCHERM_H * 0.44, '', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '20px',
        color: '#ffe066',
        backgroundColor: '#03101fcc',
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(102)
      .setAlpha(0);

    this.hintTekst = this.add
      .text(CFG.SCHERM_B / 2, CFG.SCHERM_H * 0.62, '', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '17px',
        color: '#ffffff',
        backgroundColor: '#03101fbb',
        padding: { x: 12, y: 7 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(102)
      .setAlpha(0);

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
      if (this.boekOpen) return; // het boek heeft zijn eigen terugknop
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
        if (this.boekOpen) {
          // Esc sluit eerst het boek, terug naar de kaart eronder.
          this.boekOpen = false;
          vernietigBoekTexturen(this);
          if (this.status === 'pauze') this.toonPauzeKaart();
          else this.toonEindKaart();
          return;
        }
        if (this.status === 'spelen') this.pauzeer();
        else if (this.status === 'pauze') this.hervat();
      });
    }

    // Phaser volgt standaard MAAR ÉÉN vinger. Zonder dit werkt de zwiepknop
    // niet zolang je andere duim op de joystick staat — precies wat je op een
    // telefoon de hele tijd doet. Zelfde regel als in Bezorg-Baas en Adventure.
    this.input.addPointer(3);

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

    this.joystickThuis.x = jx;
    this.joystickThuis.y = jy;

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      Geluid.ontgrendel();
      // Deze tik hoorde bij een overlay-knop (die de status net op 'spelen'
      // zette); hij mag de vis niet óók laten wegschieten.
      if (p.id === this.negeerPointer) return;
      if (this.status !== 'spelen') return;
      if (this.raaktBoostKnop(p)) {
        this.boostPointer = p.id;
      } else if (
        p.x < CFG.SCHERM_B * CFG.JOYSTICK_ZONE_B &&
        p.y > CFG.SCHERM_H * CFG.JOYSTICK_ZONE_H
      ) {
        // Zwevende joystick: de ring springt naar de vinger, zodat je vanaf
        // dat punt fijn kunt doseren in plaats van meteen vol uitslag te geven.
        this.joystickPointer = p.id;
        this.joystickBasis.setPosition(p.x, p.y);
        this.joystickDuim.setPosition(p.x, p.y);
        this.invoerSterkte = 0;
      }
    });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (this.status === 'spelen' && p.id === this.joystickPointer) this.zetDuim(p.x, p.y);
    });
    const losLaten = (p: Phaser.Input.Pointer): void => {
      if (p.id === this.joystickPointer) this.laatJoystickLos();
      if (p.id === this.boostPointer) this.boostPointer = null;
      if (p.id === this.negeerPointer) this.negeerPointer = null;
    };
    this.input.on('pointerup', losLaten);
    this.input.on('pointerupoutside', losLaten);
  }

  /** Zet de joystick terug op zijn rustplek en stopt het sturen. */
  private laatJoystickLos(): void {
    this.joystickPointer = null;
    this.joystickBasis.setPosition(this.joystickThuis.x, this.joystickThuis.y);
    this.joystickDuim.setPosition(this.joystickThuis.x, this.joystickThuis.y);
    this.invoerSterkte = 0;
  }

  /** Ligt deze vinger nog op het scherm? */
  private vingerNogNeer(id: number): boolean {
    for (const p of this.input.manager.pointers) {
      if (p.id === id) return p.isDown;
    }
    return false;
  }

  /**
   * Vangnet voor verloren "vinger los"-events (vinger van het scherm geveegd,
   * scherm gedraaid, tabwissel). Zonder dit blijft de joystick vastgeplakt of
   * blijft de zwiep aan staan — op een telefoon niet meer te herstellen zonder
   * het spel opnieuw te starten.
   */
  private controleerVingers(): void {
    if (this.joystickPointer !== null && !this.vingerNogNeer(this.joystickPointer)) {
      this.laatJoystickLos();
    }
    if (this.boostPointer !== null && !this.vingerNogNeer(this.boostPointer)) {
      this.boostPointer = null;
    }
    if (this.negeerPointer !== null && !this.vingerNogNeer(this.negeerPointer)) {
      this.negeerPointer = null;
    }
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
    for (const f of this.flitsen) f.setVisible(false);
    this.tekenSpeler();

    const opSlot = !this.save.zone4Ontgrendeld(this.saveData);
    this.grensBand.setVisible(opSlot);
    this.grensLabel
      .setVisible(opSlot)
      .setText(`❄ Koud water — haal eerst fase ${CFG.ZONE4_EIS_FASE}`);

    this.laatsteZone = zoneVoorY(CFG.START_POS.y);
    this.zoneTekstT = 0;
    this.zoneTekst.setAlpha(0);
    this.hintT = 0;
    this.hintTekst.setAlpha(0);
    this.duikHintGehad = false;

    // Vissenboek en beloningen: de al ontdekte soorten komen uit de save.
    this.rondeVangst = {};
    this.ontdekt = new Set(Object.keys(this.saveData.vangst) as SoortId[]);
    this.nieuwRij.length = 0;
    this.nieuwT = 0;
    this.nieuwTekst.setAlpha(0);
    this.boekOpen = false;
    this.nieuwRecord = false;
    this.sterrenRonde = 0;
    // Besturing schoon beginnen: Phaser hergebruikt de scene-instantie, dus
    // een vastgehouden vinger uit een vorig bezoek zou blijven staan.
    this.boostPointer = null;
    this.negeerPointer = null;
    this.laatJoystickLos();
    this.gehaaldeKleuren = CFG.KLEUR_UNLOCKS.filter((k) => k.drempelScore === 0).length;

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
    this.bewaarVangst();
    this.toonPauzeKaart();
  }

  /** De pauzekaart; ook gebruikt om te verversen na een keuze of het boek. */
  private toonPauzeKaart(): void {
    this.toonKaart('Pauze', this.recordRegels(), [
      { tekst: '▶ Verder spelen', kleur: 0x22c55e, actie: () => this.hervat() },
      { tekst: '📖 Vissenboek', kleur: 0x0ea5e9, actie: () => this.toonBoek() },
      { tekst: '⬅ Terug naar het menu', kleur: 0x64748b, actie: () => this.scene.start('Menu') },
    ]);
  }

  private hervat(): void {
    if (this.status !== 'pauze') return;
    this.status = 'spelen';
    this.overlay.setVisible(false);
    this.overlay.removeAll(true);
  }

  private gaDood(doorSoort?: SoortId): void {
    if (this.status === 'dood') return;
    this.status = 'dood';
    Geluid.dood();
    this.cameras.main.shake(260, 0.012);
    this.speler.boostAan = false;

    // Wie jou opeet komt óók in het vissenboek — met teller 0 ("ontmoet").
    if (doorSoort) this.telVangst(doorSoort, 0);
    this.bewaarVangst();

    this.nieuwRecord = this.score > this.saveData.hoogsteScore;
    this.saveData = this.save.registreerRonde({
      score: this.score,
      duurSec: Math.round(this.rondeT),
      grootsteMassa: Math.round(this.grootsteMassa),
      grootsteFase: this.grootsteFase,
      gegeten: this.gegeten,
      datumIso: new Date().toISOString(),
    });
    this.verdeelBeloningen();

    this.tweens.add({
      targets: this.speler.sprite,
      alpha: 0,
      scale: this.speler.sprite.scale * 0.4,
      duration: CFG.DOOD_ANIMATIE * 1000,
      onComplete: () => {
        if (this.nieuwRecord) Geluid.record();
        this.toonEindKaart();
      },
    });
  }

  /** De eindkaart; ook gebruikt om te verversen na een keuze of het boek. */
  private toonEindKaart(): void {
    const naam = CFG.FASES.find((f) => f.fase === this.grootsteFase)?.naam ?? '';
    const regels = [
      `Score: ${this.score}${this.nieuwRecord ? '   ⭐ NIEUW RECORD!' : ''}`,
      `Overleefd: ${this.tijdTekst(this.rondeT)}`,
      `Grootste vis: ${naam} (fase ${this.grootsteFase})`,
      `Vissen gegeten: ${this.gegeten}`,
    ];
    if (this.sterrenRonde > 0) regels.push(`Verdiend: ${this.sterrenRonde} ⭐ voor je prijzenkast`);
    const volgende = this.volgendeKleur();
    if (volgende) regels.push(`Nog ${volgende.tekort} punten tot de ${volgende.naam} vis.`);
    regels.push('', ...this.recordRegels());

    this.toonKaart('Opgegeten!', regels, [
      { tekst: '▶ Nog een keer', kleur: 0x22c55e, actie: () => this.startRonde() },
      { tekst: '📖 Vissenboek', kleur: 0x0ea5e9, actie: () => this.toonBoek() },
      { tekst: '⬅ Terug naar het menu', kleur: 0x64748b, actie: () => this.scene.start('Menu') },
    ]);
  }

  /** Welke kleur is de eerstvolgende die je kunt ontgrendelen, en hoe ver nog? */
  private volgendeKleur(): { naam: string; tekort: number } | null {
    const hoogste = this.saveData.hoogsteScore;
    for (const k of CFG.KLEUR_UNLOCKS) {
      if (k.drempelScore > hoogste) {
        return { naam: KLEUR_NAAM[k.id] ?? k.id, tekort: k.drempelScore - hoogste };
      }
    }
    return null;
  }

  // ───────────────────────────────────────────────────────── vissenboek

  /** Telt een ontmoeting; `n = 0` betekent "ontdekt, maar niet opgegeten". */
  private telVangst(id: SoortId, n: number): void {
    if (CFG.SOORTEN[id].gedrag === 'gevaar') return; // de kwal hoort niet in het boek
    this.rondeVangst[id] = (this.rondeVangst[id] ?? 0) + n;
    if (this.ontdekt.has(id)) return;

    this.ontdekt.add(id);
    if (n > 0) this.meldNieuweSoort(id);
    // Een nieuwe soort gebeurt hoogstens 16 keer in het leven van een save:
    // dat moment wil je niet verliezen als de tab wordt weggeveegd.
    this.bewaarVangst();
  }

  /** Schrijft de nog niet bewaarde vangsten weg (en leegt de tussenstand). */
  private bewaarVangst(): void {
    if (Object.keys(this.rondeVangst).length === 0) return;
    this.saveData = this.save.registreerVangst(this.rondeVangst);
    this.rondeVangst = {};
  }

  private toonBoek(): void {
    this.boekOpen = true;
    maakBoekTexturen(this);
    this.overlay.removeAll(true);
    const zone4 = this.save.zone4Ontgrendeld(this.saveData);
    bouwBoek(
      this,
      this.overlay,
      boekPagina(this.saveData.vangst, zone4),
      telOntdekt(this.saveData.vangst),
      (p) => this.sluitBoek(p),
    );
    this.zetOverlayVast();
    this.overlay.setVisible(true);
  }

  /**
   * De overlay zelf staat op scrollFactor 0, maar KINDEREN erven dat niet. Voor
   * het tekenen maakt dat niets uit (de container bepaalt de plek), maar het
   * AANRAAKGEBIED wordt wel met de camera meegeschoven — en die staat in deze
   * wereld van 3200×4800 px bijna nooit op 0. Zonder deze regel liggen de
   * knoppen van de eind- en pauzekaart dus honderden pixels naast waar je ze
   * ziet, en lijkt het spel vast te zitten. Moet ná het toevoegen van de
   * kinderen gebeuren.
   */
  private zetOverlayVast(): void {
    this.overlay.setScrollFactor(0);
    // LET OP: `setScrollFactor(0, 0, true)` werkt hier NIET. Phaser gebruikt
    // daarvoor SetAll, en dat slaat objecten over die de eigenschap niet als
    // eigen property hebben — en `scrollFactorX` komt van de prototype-mixin.
    // Per kind de methode aanroepen zet hem wél.
    for (const kind of this.overlay.list) {
      (kind as Partial<Phaser.GameObjects.Components.ScrollFactor>).setScrollFactor?.(0, 0);
    }
  }

  /**
   * Keert sterren en medailles uit aan de rest van Nul & Co (§9 van DESIGN.md).
   * Dit is het enige punt waar Hapvis in `progress.js` schrijft.
   */
  private verdeelBeloningen(): void {
    this.sterrenRonde = Math.min(
      CFG.STERREN_MAX_RONDE,
      Math.floor(this.score / CFG.STER_PER_SCORE),
    );
    if (this.sterrenRonde > 0) addStars(this.sterrenRonde);

    if (this.speler.pos.y >= CFG.GRENS_Y) giveMedal(CFG.MEDAILLE_DIEP);
    if (this.grootsteFase >= CFG.FASES[CFG.FASES.length - 1].fase) giveMedal(CFG.MEDAILLE_REUS);
    if ((this.saveData.vangst.diepteschrik ?? 0) > 0) giveMedal(CFG.MEDAILLE_APEX);
    if (boekVol(this.saveData.vangst)) giveMedal(CFG.MEDAILLE_BOEK);
  }

  /** Zet een pas ontdekte soort in de wachtrij voor de NIEUW!-melding. */
  private meldNieuweSoort(id: SoortId): void {
    this.nieuwRij.push(id);
  }

  private sluitBoek(p: Phaser.Input.Pointer): void {
    this.boekOpen = false;
    this.negeerPointer = p.id;
    vernietigBoekTexturen(this);
    if (this.status === 'pauze') this.toonPauzeKaart();
    else this.toonEindKaart();
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

    // Lopende meldingen wegzetten: de kaart is 96% dekkend, dus een vervagende
    // hint schemert er anders doorheen.
    this.hintT = 0;
    this.hintTekst.setAlpha(0);
    this.nieuwT = 0;
    this.nieuwTekst.setAlpha(0);

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
      vlak.on('pointerdown', (p: Phaser.Input.Pointer) => {
        Geluid.ontgrendel();
        Geluid.knop();
        this.negeerPointer = p.id; // deze vinger stuurt niet mee
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

    // Alles behalve de verduistering (kind 0) verschuift naar het midden van
    // het scherm; de verduistering moet het hele scherm blijven bedekken.
    // De verschuiving mag ook NEGATIEF zijn: een volle eindkaart (5 rondes,
    // keuzerij én drie knoppen) is hoger dan het scherm en moet dan omhoog in
    // plaats van eruit lopen. De bovenkant blijft wel op ≥ 12 px staan.
    let verschuif = Math.round((h - kaartHoog) / 2 - kaartTop);
    if (kaartTop + verschuif < 12) verschuif = 12 - kaartTop;
    if (verschuif !== 0) {
      const kinderen = this.overlay.list as unknown as { y: number }[];
      for (let i = 1; i < kinderen.length; i++) kinderen[i].y += verschuif;
    }

    this.zetOverlayVast();
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
    // Eén bron voor beide kaarten: eerder waren dit aparte kopieën, waardoor
    // de "NIEUW RECORD"-regel verdween zodra je een kleur koos.
    if (this.status === 'pauze') this.toonPauzeKaart();
    else if (this.status === 'dood') this.toonEindKaart();
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
    let apexen = 0;
    for (const e of this.pool) {
      if (e.actief && e.gedrag === 'apex') apexen++;
    }
    if (apexen >= CFG.APEX_MAX_ACTIEF) return;
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
      // Jagers patrouilleren in een ander tempo dan prooivissen dwalen.
      const jager = cfg.gedrag === 'roofvis' || cfg.gedrag === 'apex';
      const dwaalMin = jager ? CFG.PATROUILLE_MIN : CFG.DWAAL_MIN;
      const dwaalMax = jager ? CFG.PATROUILLE_MAX : CFG.DWAAL_MAX;
      e.dwaalT = dwaalMin + Math.random() * (dwaalMax - dwaalMin);
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
        .setScale(texSchaalVoor(cfg.radius))
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
    this.updateFlitsen(dt);
    this.updateMeldingen(dt);
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
    this.controleerVingers();
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
      s.sprite.setTexture(this.spelerSleutels[s.fase][frame]);
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
    s.sprite.setScale((s.radius / faseCfg.radius) * texSchaalVoor(faseCfg.radius));
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

      // Dwaalt/patrouilleert deze vis? Alleen dán mag de zoneband zijn koers
      // bijsturen — een jager of vluchter laat zich daardoor niet leiden.
      let dwaaltNu = true;

      if (e.gedrag === 'roofvis' || e.gedrag === 'apex') {
        // Een roofvis die de speler niet aankan, is zelf prooi en vlucht. De
        // apex vlucht nooit: die is het trofee-doel en blijft rustig rondgaan.
        if (
          e.gedrag === 'roofvis' &&
          kanEten(speler.radius, e.radius) &&
          afstandSpeler < CFG.PROOI_DETECTIE
        ) {
          vluchtVector(e.pos, speler.pos, this.v1);
          doelHoek = Math.atan2(this.v1.y, this.v1.x);
          doelSnelheid = cfg.kruisSnelheid * CFG.VLUCHT_FACTOR;
          dwaaltNu = false;
        } else {
          doelSnelheid = this.jaagGedrag(e, dt, afstandSpeler, cfg.kruisSnelheid);
          if (e.geheugenT > 0) {
            doelHoek = Math.atan2(e.doelY - e.pos.y, e.doelX - e.pos.x);
            dwaaltNu = false;
          } else {
            doelHoek = this.dwaal(e, dt, CFG.PATROUILLE_MIN, CFG.PATROUILLE_MAX);
          }
        }
      } else {
        // Prooi- en schoolvissen: vluchten voor alles wat groter is.
        const vlucht = this.zoekBedreiging(e, afstandSpeler);
        if (vlucht) {
          doelHoek = Math.atan2(this.v1.y, this.v1.x);
          doelSnelheid = cfg.topSnelheid;
          dwaaltNu = false;
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

      doelHoek = this.buigNaarBinnen(e, doelHoek, dwaaltNu);

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
      e.sprite.setTexture(this.soortSleutels[e.soort][frame]);
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
      // Een burst die eindigt doordat de speler uit zicht raakt, kost óók rust
      // — anders kun je de Diepteschrik eindeloos op burstsnelheid houden door
      // steeds even buiten zijn zichtradius te duiken.
      if (isApex && e.burstT > 0) e.rustT = CFG.APEX_RUST;
      e.burstT = 0;
      return kruis;
    }

    e.geheugenT -= dt;
    e.jaagT += dt;

    // Dezelfde afbreekregels voor roofvis én apex: te lang of te ver = stoppen.
    if (!magBlijvenJagen(e.jaagT, afstandSpeler)) {
      e.jaagT = 0;
      e.burstT = 0;
      e.geheugenT = 0;
      e.afkoelT = CFG.JAAG_AFKOEL;
      return kruis;
    }

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
      if (n >= CFG.SCHOOL_MAX_BUREN) break; // meer buren voegt niets toe
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
   * Houdt NPC's binnen de wereld en — als ze dwalen — ruwweg binnen hun eigen
   * dieptezone. De wereldrand geldt altijd; de zoneband alleen tijdens dwalen
   * of patrouilleren, want anders zou een jager of vluchter zijn koers laten
   * bepalen door de zonegrens (en zou je gratis kunnen ontsnappen).
   */
  private buigNaarBinnen(e: Entiteit, doelHoek: number, dwaaltNu: boolean): number {
    let mikX = 0;
    let mikY = 0;
    if (e.pos.x < CFG.RAND_MARGE) mikX = 1;
    else if (e.pos.x > CFG.WERELD_B - CFG.RAND_MARGE) mikX = -1;
    if (e.pos.y < CFG.RAND_MARGE) mikY = 1;
    else if (e.pos.y > CFG.WERELD_H - CFG.RAND_MARGE) mikY = -1;

    if (mikY === 0 && dwaaltNu) {
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
        this.gaDood(e.soort);
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
    this.telVangst(e.soort, 1);
    this.geefTerug(e);

    const nieuweFase = faseVoorMassa(s.massa);
    if (nieuweFase !== s.fase) {
      s.fase = nieuweFase;
      s.maxSnelheid = maxSnelheidVoorMassa(s.massa);
      if (nieuweFase > this.grootsteFase) this.grootsteFase = nieuweFase;
      s.sprite.setTexture(this.spelerSleutels[nieuweFase][s.frame]);
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

  /** Kleine flits op een wereldpositie; pakt de volgende uit de vaste ring. */
  private flits(x: number, y: number, kleur: number): void {
    const beeld = this.flitsen[this.flitsIndex];
    this.flitsIndex = (this.flitsIndex + 1) % this.flitsen.length;
    beeld.setPosition(x, y).setTint(kleur).setScale(0.6).setAlpha(0.9).setVisible(true);
  }

  /** Laat de actieve flitsjes uitdijen en vervagen (geen tweens, geen afval). */
  private updateFlitsen(dt: number): void {
    for (const f of this.flitsen) {
      if (!f.visible) continue;
      f.setScale(f.scale + dt * 6);
      f.setAlpha(f.alpha - dt * 3.5);
      if (f.alpha <= 0.02) f.setVisible(false);
    }
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
    // Af en toe een zacht blubje; niet bij het opnieuw vullen aan het begin.
    if (!overalRond && Math.random() < 0.04) Geluid.bel();
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

  /**
   * Zonenaam bij het passeren van een grens, plus één duik-hint zodra de
   * speler groot genoeg is maar nog in de startzone rondhangt. Zonder deze
   * twee dingen merkt een kind niet dat er drie zones onder hem liggen.
   */
  private updateMeldingen(dt: number): void {
    const zone = zoneVoorY(this.speler.pos.y);
    if (zone !== this.laatsteZone) {
      this.laatsteZone = zone;
      const cfg = CFG.ZONES.find((z) => z.nr === zone);
      this.zoneTekst.setText(cfg ? cfg.naam.toUpperCase() : '');
      this.zoneTekstT = CFG.HINT_DUUR;
      this.zoneTekst.setAlpha(1);
    }
    if (this.zoneTekstT > 0) {
      this.zoneTekstT -= dt;
      this.zoneTekst.setAlpha(Math.min(1, this.zoneTekstT / 0.8));
    }

    if (
      !this.duikHintGehad &&
      this.speler.fase >= CFG.HINT_DIEPTE_FASE &&
      zone === 1 &&
      this.status === 'spelen'
    ) {
      this.duikHintGehad = true;
      this.toonHint('Zwem naar beneden ↓  daar zwemt groter eten');
    }
    if (this.hintT > 0) {
      this.hintT -= dt;
      this.hintTekst.setAlpha(Math.min(1, this.hintT / 0.8));
    }

    // NIEUW!-meldingen één voor één: in zone 1 eet je makkelijk drie nieuwe
    // soorten binnen een paar seconden, en dan overschrijft de derde de eerste.
    if (this.nieuwT > 0) {
      this.nieuwT -= dt;
      this.nieuwTekst.setAlpha(Math.min(1, this.nieuwT / 0.5));
    } else if (this.nieuwRij.length > 0) {
      const id = this.nieuwRij.shift() as SoortId;
      this.nieuwTekst.setText(`NIEUW!  ${CFG.SOORT_NAAM[id]}`).setAlpha(1);
      this.nieuwT = CFG.HINT_DUUR * 0.6;
      Geluid.record();
    }

    // Kleur-mijlpalen: die bestonden al, maar waren alleen op de eindkaart te
    // zien. Nu hoor en zie je het op het moment zelf.
    const gehaald = CFG.KLEUR_UNLOCKS.filter((k) => this.score >= k.drempelScore).length;
    if (gehaald > this.gehaaldeKleuren) {
      const k = CFG.KLEUR_UNLOCKS[gehaald - 1];
      this.gehaaldeKleuren = gehaald;
      if (k.drempelScore > 0) this.toonHint(`Nieuwe kleur: de ${KLEUR_NAAM[k.id] ?? k.id} vis!`);
    }
  }

  private toonHint(tekst: string): void {
    this.hintTekst.setText(tekst).setAlpha(1);
    this.hintT = CFG.HINT_DUUR;
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

    // Dieptemeter: waar zwem ik, en welk stuk zit nog op slot?
    const deelDiepte = Phaser.Math.Clamp(s.pos.y / CFG.WERELD_H, 0, 1);
    const markerY = DM_Y + deelDiepte * DM_H;
    if (!this.save.zone4Ontgrendeld(this.saveData)) {
      // grendelstrepen over de laatste band
      const slotY = DM_Y + (DM_H * (CFG.AANTAL_ZONES - 1)) / CFG.AANTAL_ZONES;
      g.fillStyle(0x03101f, 0.75);
      g.fillRoundedRect(DM_X - 4, slotY, 8, DM_H / CFG.AANTAL_ZONES - 3, 4);
      g.fillStyle(0xffffff, 0.5);
      for (let i = 0; i < 3; i++) g.fillRect(DM_X - 4, slotY + 6 + i * 8, 8, 2);
    }
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(DM_X - 14, markerY, DM_X - 8, markerY - 5, DM_X - 8, markerY + 5);
    g.fillStyle(0xffd60a, 1);
    g.fillCircle(DM_X, markerY, 3.5);

    // De zwiepknop laat zien of er genoeg energie is om te starten.
    const kanZwiepen = s.boostAan || magBoostStarten(s.energie);
    this.boostKnop.setAlpha(kanZwiepen ? 1 : 0.45);
    this.boostKnop.setScale(TEX_SCHAAL * (s.boostAan ? 0.92 : 1));
    this.boostKnopTekst.setAlpha(kanZwiepen ? 0.95 : 0.35);
  }

  private opruimen(): void {
    this.bewaarVangst(); // niets van het vissenboek verliezen bij het verlaten
    vernietigBoekTexturen(this);
    this.input.removeAllListeners();
    this.input.keyboard?.removeAllListeners();
  }
}
