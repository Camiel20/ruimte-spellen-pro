import Phaser from 'phaser';
import { SFX } from '../sound.js';

// Stad Rijden — GTA 1/2-stijl topdown rijspel.
// Besturing: gas/rem/sturen via knoppen (touch) of pijltjestoetsen.
// Rijmodel: scalaire carSpeed + grip-blend voor GTA-drift.

const TILE = 64;

// R=weg, .=trottoir, B=gebouw, P=startplek speler.
// Alle rijen MOETEN exact 28 tekens zijn.
const CITY = [
  "BBBBBBBBBBBBBBBBBBBBBBBBBBBB",
  "BRRRRRRRRRRRRRRRRRRRRRRRRRRB",
  "B..R..BBBBB..R..BBBBB..R...B",
  "B..R..BBBBB..R..BBBBB..R...B",
  "B..R..BBBBB..R..BBBBB..R...B",
  "B..R.........R.........R...B",
  "BRRRRRRRRRRRRRRRRRRRRRRRRRRB",
  "B..R.........R.........R...B",
  "B..R..BBBBB..R..BBBBB..R...B",
  "B..R..BBBBB..R..BBBBB..R...B",
  "B..R.........R.........R...B",
  "BRRRRRRRRRRRRPRRRRRRRRRRRRB",
  "B..R.........R.........R...B",
  "B..R..BBBBB..R..BBBBB..R...B",
  "B..R..BBBBB..R..BBBBB..R...B",
  "B..R.........R.........R...B",
  "BRRRRRRRRRRRRRRRRRRRRRRRRRRB",
  "B..R.........R.........R...B",
  "B..R..BBBBB..R..BBBBB..R...B",
  "B..R..BBBBB..R..BBBBB..R...B",
  "BRRRRRRRRRRRRRRRRRRRRRRRRRRB",
  "BBBBBBBBBBBBBBBBBBBBBBBBBBBB",
];

function isRoad(r, c) {
  if (r < 0 || r >= CITY.length || c < 0 || c >= CITY[0].length) return false;
  const ch = CITY[r][c];
  return ch === 'R' || ch === 'P';
}

// Kleurpaletten voor stadsblokken (4 wijken, elk met 2 tinten)
const GEBOUW_PALETTEN = [
  [0x7a6a58, 0x6a5a48],   // bakstenen bruin
  [0x526070, 0x425060],   // beton blauwgrijs
  [0x586858, 0x485848],   // industrieel groengrijs
  [0x706860, 0x605850],   // beige/grijs
];

export default class CityScene extends Phaser.Scene {
  constructor() { super('City'); }

  create() {
    const rows = CITY.length, cols = CITY[0].length;
    this.worldW = cols * TILE;
    this.worldH = rows * TILE;
    this.carAngle = 0;   // rijrichting in graden: 0=rechts, 90=omlaag, -90=omhoog, 180=links
    this.carSpeed = 0;   // rijsnelheid px/sec (negatief = achteruit)

    this.physics.world.setBounds(0, 0, this.worldW, this.worldH);
    this.cameras.main.setBounds(0, 0, this.worldW, this.worldH);

    // Donkere achtergrond
    this.add.rectangle(0, 0, this.worldW, this.worldH, 0x1a1a22).setOrigin(0).setDepth(-10);

    // --- Stad tekenen ---
    this.buildings = this.physics.add.staticGroup();
    let startX = this.worldW / 2, startY = this.worldH / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ch = CITY[r][c];
        const x = c * TILE + TILE / 2;
        const y = r * TILE + TILE / 2;

        if (ch === 'R' || ch === 'P') {
          this._tekenWeg(x, y, r, c);
          if (ch === 'P') { startX = x; startY = y; }

        } else if (ch === '.') {
          this._tekenTrottoir(x, y, r, c);

        } else if (ch === 'B') {
          const collider = this._tekenGebouw(x, y, r, c);
          this.buildings.add(collider);
        }
      }
    }

    // --- Speler-auto ---
    this.car = this.physics.add.sprite(startX, startY, 'car_player');
    this.car.setDepth(8);
    this.car.setCollideWorldBounds(true);
    this.car.body.setAllowGravity(false);
    this.car.body.setSize(44, 28).setOffset(10, 8);
    this.car.body.setMaxVelocity(350);
    this.car.setAngle(this.carAngle);

    this.physics.add.collider(this.car, this.buildings);

    // --- Verkeer ---
    this.traffic = this.physics.add.group();
    this._spawnVerkeer();
    this.physics.add.collider(this.car, this.traffic);
    this.physics.add.collider(this.traffic, this.buildings);
    this.physics.add.collider(this.traffic, this.traffic);

    // --- Camera ---
    this.cameras.main.startFollow(this.car, true, 0.1, 0.1);
    this.cameras.main.setZoom(0.85);

    // --- Bediening ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = { gas: false, brake: false, left: false, right: false };
    this._maakKnoppen();

    // Terug-knop
    const back = this.add.text(12, 12, '⬅', {
      fontFamily: 'Arial', fontSize: '20px', color: '#fff',
      backgroundColor: '#1e293b', padding: { x: 10, y: 6 },
    }).setScrollFactor(0).setDepth(100).setInteractive();
    back.on('pointerdown', () => this.scene.start('Menu'));

    this.add.text(this.scale.width / 2, 16, '🚗 Stad Rijden', {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#fff',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    this.snelheidsTekst = this.add.text(this.scale.width - 12, 12, '0 km/u', {
      fontFamily: 'Arial', fontSize: '13px', color: '#aaffaa',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    this.input.addPointer(3);
  }

  // --- Tekenhelpers ---

  _tekenWeg(x, y, r, c) {
    // Wegdek
    this.add.rectangle(x, y, TILE, TILE, 0x28282e).setDepth(-4);

    const up  = isRoad(r - 1, c);
    const dn  = isRoad(r + 1, c);
    const lft = isRoad(r, c - 1);
    const rgt = isRoad(r, c + 1);
    const hWeg = lft || rgt;
    const vWeg = up || dn;
    const kruispunt = hWeg && vWeg;

    if (kruispunt) {
      // Kruispunt: geen markering, wel lichte hoekjes
      this.add.rectangle(x, y, TILE - 2, TILE - 2, 0x2e2e36).setDepth(-4);
    } else if (hWeg) {
      // Horizontale weg: gele stippellijn in het midden
      this.add.rectangle(x, y, TILE * 0.45, 3, 0xccbb00, 0.5).setDepth(-3);
      // Witte kantlijnen
      this.add.rectangle(x, y - TILE / 2 + 2, TILE, 2, 0xffffff, 0.35).setDepth(-3);
      this.add.rectangle(x, y + TILE / 2 - 2, TILE, 2, 0xffffff, 0.35).setDepth(-3);
    } else {
      // Verticale weg
      this.add.rectangle(x, y, 3, TILE * 0.45, 0xccbb00, 0.5).setDepth(-3);
      this.add.rectangle(x - TILE / 2 + 2, y, 2, TILE, 0xffffff, 0.35).setDepth(-3);
      this.add.rectangle(x + TILE / 2 - 2, y, 2, TILE, 0xffffff, 0.35).setDepth(-3);
    }
  }

  _tekenTrottoir(x, y, r, c) {
    // Stoep — grijs met subtiele stoeprand richting de weg
    this.add.rectangle(x, y, TILE, TILE, 0x686860).setDepth(-4);
    // Donkere rand aan wegkant
    if (isRoad(r - 1, c)) this.add.rectangle(x, y - TILE / 2 + 1, TILE, 3, 0x3a3a3a).setDepth(-3);
    if (isRoad(r + 1, c)) this.add.rectangle(x, y + TILE / 2 - 1, TILE, 3, 0x3a3a3a).setDepth(-3);
    if (isRoad(r, c - 1)) this.add.rectangle(x - TILE / 2 + 1, y, 3, TILE, 0x3a3a3a).setDepth(-3);
    if (isRoad(r, c + 1)) this.add.rectangle(x + TILE / 2 - 1, y, 3, TILE, 0x3a3a3a).setDepth(-3);
  }

  _tekenGebouw(x, y, r, c) {
    // Schaduw (zuidoost-offset voor nep-diepte)
    this.add.rectangle(x + 6, y + 6, TILE - 8, TILE - 8, 0x000000, 0.3).setDepth(0);

    // Gebouwkleur — per stadsblok consistent
    const wi = Math.floor(r / 5) % 4;
    const palet = GEBOUW_PALETTEN[wi];
    const basisKleur = palet[(r + c) % 2];

    const gebouw = this.add.rectangle(x, y, TILE - 6, TILE - 6, basisKleur).setDepth(1);
    gebouw.setStrokeStyle(2, 0x0d0d14);

    // Dakrand (lichtere rand bovenop)
    this.add.rectangle(x, y - (TILE - 6) / 2 + 3, TILE - 6, 5,
      Phaser.Display.Color.GetColor(
        Math.min(((basisKleur >> 16) & 0xff) + 40, 255),
        Math.min(((basisKleur >> 8) & 0xff) + 40, 255),
        Math.min((basisKleur & 0xff) + 40, 255)
      )).setDepth(2);

    // Raampjes (2×2 raster)
    const raamKleur = 0x90b8d8;
    const verlicht = [
      Math.random() > 0.3, Math.random() > 0.3,
      Math.random() > 0.4, Math.random() > 0.4,
    ];
    const rx = [x - 13, x + 5], ry = [y - 12, y + 6];
    let ri = 0;
    for (const ry2 of ry)
      for (const rx2 of rx) {
        this.add.rectangle(rx2, ry2, 10, 9, raamKleur, verlicht[ri++] ? 0.75 : 0.2).setDepth(2);
      }

    // De rechthoek fungeert als physics-collider
    return gebouw;
  }

  // --- Verkeer ---

  _spawnVerkeer() {
    const kleuren = ['car_red', 'car_blue', 'car_green'];
    const plekken = [];
    for (let r = 0; r < CITY.length; r++)
      for (let c = 0; c < CITY[0].length; c++)
        if (CITY[r][c] === 'R') plekken.push({ x: c * TILE + TILE / 2, y: r * TILE + TILE / 2 });
    Phaser.Utils.Array.Shuffle(plekken);
    for (let i = 0; i < 5 && i < plekken.length; i++) {
      const t = this.physics.add.sprite(plekken[i].x, plekken[i].y, kleuren[i % kleuren.length]);
      t.setDepth(8);
      t.setCollideWorldBounds(true);
      t.body.setAllowGravity(false);
      t.body.setSize(44, 28).setOffset(10, 8);
      t.dir = Phaser.Math.Between(0, 3) * 90;
      t.setAngle(t.dir);
      t.wisselTimer = Phaser.Math.Between(1200, 3500);
      this.traffic.add(t);
    }
  }

  // --- Bedieningsknoppen ---

  _maakKnoppen() {
    const { width, height } = this.scale;
    const y = height - 60;
    this.bedieningKnoppen = [];
    const mk = (bx, w, h2, label, key, kleur) => {
      const btn = this.add.container(bx, y).setScrollFactor(0).setDepth(100);
      const bg = this.add.graphics();
      bg.fillStyle(kleur, 0.25);
      bg.lineStyle(2, kleur, 0.6);
      bg.fillRoundedRect(-w / 2, -h2 / 2, w, h2, 12);
      bg.strokeRoundedRect(-w / 2, -h2 / 2, w, h2, 12);
      const t = this.add.text(0, 0, label, {
        fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', color: '#fff',
      }).setOrigin(0.5);
      btn.add([bg, t]);
      this.bedieningKnoppen.push({ key, x: bx, y, w, h: h2, bg, kleur });
    };
    mk(50,  70, 64, '◀', 'left',  0xffffff);
    mk(130, 70, 64, '▶', 'right', 0xffffff);
    mk(width - 50,  70, 64, '⛽', 'gas',   0x4ade80);
    mk(width - 130, 70, 64, '🛑', 'brake', 0xf87171);
  }

  _leesKnoppen() {
    // Camera heeft zoom 0.85 — scrollFactor(0) objecten WORDEN wel gezoomd,
    // dus de gerenderde positie wijkt af van de opgeslagen spel-coördinaat.
    // Bereken de werkelijke schermposities via de camera-zoom.
    const z = this.cameras.main.zoom;
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    const pointers = [this.input.pointer1, this.input.pointer2, this.input.pointer3, this.input.pointer4]
      .filter((p) => p && p.isDown);
    this.keys.left = this.keys.right = this.keys.gas = this.keys.brake = false;
    for (const btn of this.bedieningKnoppen) {
      const sx = cx + (btn.x - cx) * z;
      const sy = cy + (btn.y - cy) * z;
      let ingedrukt = false;
      for (const p of pointers) {
        if (Math.abs(p.x - sx) <= btn.w * z / 2 && Math.abs(p.y - sy) <= btn.h * z / 2) {
          ingedrukt = true;
          break;
        }
      }
      if (ingedrukt) this.keys[btn.key] = true;
      btn.bg.clear();
      btn.bg.fillStyle(btn.kleur, ingedrukt ? 0.5 : 0.25);
      btn.bg.lineStyle(2, btn.kleur, ingedrukt ? 0.9 : 0.6);
      btn.bg.fillRoundedRect(-btn.w / 2, -btn.h / 2, btn.w, btn.h, 12);
      btn.bg.strokeRoundedRect(-btn.w / 2, -btn.h / 2, btn.w, btn.h, 12);
    }
  }

  // --- Update-lus ---

  update(time, delta) {
    if (!this.car || !this.car.body) return;
    this._leesKnoppen();
    const dt = delta / 1000;

    const gas   = this.keys.gas   || (this.cursors && this.cursors.up.isDown);
    const rem   = this.keys.brake || (this.cursors && this.cursors.down.isDown);
    const links = this.keys.left  || (this.cursors && this.cursors.left.isDown);
    const rechts = this.keys.right || (this.cursors && this.cursors.right.isDown);

    // Botsingsdetectie: vergelijk werkelijke velocity (na Phaser-correctie) met verwachte
    const rad = Phaser.Math.DegToRad(this.carAngle);
    const vx0 = this.car.body.velocity.x;
    const vy0 = this.car.body.velocity.y;
    const projSnelheid = vx0 * Math.cos(rad) + vy0 * Math.sin(rad);
    if (Math.abs(this.carSpeed) > 60 && Math.abs(projSnelheid) < Math.abs(this.carSpeed) * 0.5) {
      // Botsing — carSpeed terugzetten
      this.carSpeed = projSnelheid * 0.4;
    }

    // Gas / rem
    if (gas)  this.carSpeed = Math.min(this.carSpeed + 400 * dt, 280);
    if (rem)  this.carSpeed = Math.max(this.carSpeed - 500 * dt, -100);
    if (!gas && !rem) {
      if (Math.abs(this.carSpeed) < 15) {
        this.carSpeed = 0;
      } else {
        this.carSpeed -= Math.sign(this.carSpeed) * 220 * dt;
      }
    }

    // Sturen (alleen bij voldoende snelheid; omgekeerd bij achteruit)
    if (Math.abs(this.carSpeed) > 20) {
      const stuur = 130 * (this.carSpeed > 0 ? 1 : -1);
      if (links)  this.carAngle -= stuur * dt;
      if (rechts) this.carAngle += stuur * dt;
    }
    this.car.setAngle(this.carAngle);

    // Velocity instellen met grip-model (kleine drift — GTA-gevoel)
    const newRad = Phaser.Math.DegToRad(this.carAngle);
    const doelVx = Math.cos(newRad) * this.carSpeed;
    const doelVy = Math.sin(newRad) * this.carSpeed;
    const grip = 0.88;
    this.car.body.velocity.x = vx0 * (1 - grip) + doelVx * grip;
    this.car.body.velocity.y = vy0 * (1 - grip) + doelVy * grip;

    // Snelheidsmeter
    this.snelheidsTekst.setText(`${Math.abs(Math.round(this.carSpeed))} km/u`);

    // Verkeer-AI
    this.traffic.getChildren().forEach((t) => {
      t.wisselTimer -= delta;
      if (t.wisselTimer <= 0) {
        t.dir = (t.dir + (Phaser.Math.Between(0, 1) ? 90 : -90) + 360) % 360;
        t.wisselTimer = Phaser.Math.Between(1500, 4000);
      }
      t.setAngle(t.dir);
      const tr = Phaser.Math.DegToRad(t.dir);
      t.body.velocity.x = Math.cos(tr) * 90;
      t.body.velocity.y = Math.sin(tr) * 90;
    });
  }
}
