import Phaser from 'phaser';
import { SFX, initAudio } from '../sound.js';
import { Voice } from '../voice.js';
import { stopMusic } from '../music.js';
import { confettiBurst, showReward } from '../reward.js';
import { addStars, getStars } from '../progress.js';

// ===== GETALLEN-LAND =====
// Een grote, verkenbare Numberblocks-wereld (100% zelf getekend, geen
// auteursrechtelijke beelden/audio). Je loopt met een gidsje door een
// kleurrijke vallei vol bomen, huisjes, paadjes en een riviertje met brug.
// Verspreid in de wereld staan getallen-vriendjes die een getal nodig hebben.
// Maak dat getal door losse Numberblocks SAMEN te slepen (optellen) of door
// ze UIT ELKAAR te trekken (tik = scheuren in twee). Help alle vriendjes en
// vind verborgen sterren in de struiken!

const WORLD = { w: 480, h: 1560 };

// Numberblocks-signatuurkleuren (cyclisch voorbij 12).
const SIG = [0xe8402c, 0xf08a24, 0xf6c624, 0x57b947, 0x38b6cf, 0x9b6dd6,
  0xec6aa9, 0x14b8a6, 0x4f63c9, 0xf25c54, 0x37c2a0, 0x6366f1];
function sig(n) { return SIG[(Math.max(1, n) - 1) % SIG.length]; }
function lighten(c, amt) {
  const r = Math.min(255, ((c >> 16) & 255) + amt), g = Math.min(255, ((c >> 8) & 255) + amt), b = Math.min(255, (c & 255) + amt);
  return (r << 16) | (g << 8) | b;
}
function darker(c, amt) {
  const r = Math.max(0, ((c >> 16) & 255) - amt), g = Math.max(0, ((c >> 8) & 255) - amt), b = Math.max(0, (c & 255) - amt);
  return (r << 16) | (g << 8) | b;
}

// Het landschap loopt van onder (weide) naar boven (ruimte).
const PAL = { top: 0x8fd6ff, bot: 0xdff3ff, hill: 0x73c24a, hill2: 0x5fa83a, path: 0xe7c98a, water: 0x5fc7e8, trunk: 0x9c6b3f, leaf: 0x4caf50 };
const FLOWERS = [0xff6b9d, 0xffd23f, 0xff8a5b, 0xb06eff, 0x6ee0c0];

export default class NumberLandScene extends Phaser.Scene {
  constructor() { super('NumberLand'); }

  create() {
    initAudio();
    stopMusic(); // geen menu-muziek hier (eigen geluid + stem)

    this.blocks = [];
    this.spots = [];
    this.solvedCount = 0;
    this.locked = false;
    this.walkTarget = null;
    this.input.dragDistanceThreshold = 12;

    this.cameras.main.setBounds(0, 0, WORLD.w, WORLD.h);

    this.buildWorld();
    this.buildGroundInput();
    this.buildAvatar();
    this.buildSpots();
    this.buildNPCs();
    this.buildSecrets();
    this.buildHud();

    // slepen van blokjes (in wereld-coördinaten)
    this.input.on('drag', (p, obj, dx, dy) => {
      if (obj.getData && obj.getData('block')) { obj.x = dx; obj.y = dy; }
    });

    this.cameras.main.startFollow(this.avatar, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(180, 240);
    this.cameras.main.fadeIn(450, 8, 16, 26);

    Voice.cue('welcome');
  }

  // ============================================================ WERELD
  buildWorld() {
    this.sky = this.add.graphics().setDepth(-20);
    this.sky.fillGradientStyle(PAL.top, PAL.top, PAL.bot, PAL.bot, 1);
    this.sky.fillRect(0, 0, WORLD.w, WORLD.h);

    // zon
    const sun = this.add.container(WORLD.w - 64, 80).setDepth(-18).setScrollFactor(0.3);
    const glow = this.add.circle(0, 0, 56, 0xfff3b0, 0.35);
    sun.add([glow, this.add.circle(0, 0, 32, 0xffe16b)]);
    this.tweens.add({ targets: glow, scale: 1.18, alpha: 0.5, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // grasgrond over de hele wereld + een kronkelpad omhoog
    const g = this.add.graphics().setDepth(-16);
    g.fillStyle(PAL.hill, 1); g.fillRect(0, 150, WORLD.w, WORLD.h - 150);
    g.fillStyle(lighten(PAL.hill, 14), 0.5);
    for (let y = 200; y < WORLD.h; y += 90) for (let x = 10; x < WORLD.w; x += 70) g.fillEllipse(x + (y % 2) * 30, y, 22, 7);
    // pad
    g.fillStyle(PAL.path, 1);
    let px = WORLD.w / 2;
    for (let y = WORLD.h - 40; y > 180; y -= 16) {
      px = WORLD.w / 2 + Math.sin(y * 0.012) * 90;
      g.fillCircle(px, y, 26);
    }
    g.fillStyle(darker(PAL.path, 16), 0.4);
    for (let y = WORLD.h - 40; y > 180; y -= 60) { px = WORLD.w / 2 + Math.sin(y * 0.012) * 90; g.fillEllipse(px, y, 30, 8); }

    // riviertje + brug ergens halverwege
    const rivY = 1020;
    g.fillStyle(PAL.water, 1); g.fillRect(0, rivY, WORLD.w, 64);
    g.fillStyle(lighten(PAL.water, 45), 0.5);
    for (let x = 0; x < WORLD.w; x += 30) g.fillEllipse(x + 15, rivY + 20, 18, 5);
    px = WORLD.w / 2 + Math.sin(rivY * 0.012) * 90;
    g.fillStyle(0x9c6b3f, 1); g.fillRoundedRect(px - 38, rivY + 18, 76, 30, 5);
    g.fillStyle(0x7a4f2c, 1);
    for (let i = 0; i < 6; i++) g.fillRect(px - 33 + i * 12, rivY + 20, 2, 26);

    // bomen, struiken, bloemen, huisjes verspreid over de hele wereld
    this.scenery = []; this.bushes = [];
    const treeXs = [40, 446, 64, 420, 50, 440];
    for (let i = 0; i < 14; i++) {
      const x = Phaser.Math.Between(0, 1) ? Phaser.Math.Between(24, 70) : Phaser.Math.Between(410, 456);
      const y = 240 + i * 92 + Phaser.Math.Between(-20, 20);
      if (Math.abs(y - rivY) < 70) continue;
      this.drawTree(x, y, 0.7 + Math.random() * 0.5);
    }
    for (let i = 0; i < 12; i++) {
      const x = Phaser.Math.Between(40, WORLD.w - 40), y = 260 + i * 105 + Phaser.Math.Between(-25, 25);
      if (Math.abs(y - rivY) < 60) continue;
      this.bushes.push(this.drawBush(x, y));
    }
    for (let i = 0; i < 26; i++) {
      const x = Phaser.Math.Between(20, WORLD.w - 20), y = Phaser.Math.Between(210, WORLD.h - 30);
      if (Math.abs(y - rivY) < 50) continue;
      this.drawFlower(x, y, Phaser.Utils.Array.GetRandom(FLOWERS));
    }
    // een paar getallen-huisjes
    this.drawHouse(70, 1320, 1, sig(1));
    this.drawHouse(WORLD.w - 70, 740, 2, sig(2));
    this.drawHouse(78, 430, 3, sig(3));

    // wolken (licht parallax) + vlinders
    this.clouds = [];
    for (let i = 0; i < 7; i++) {
      const c = this.makeCloud(Phaser.Math.Between(0, WORLD.w), Phaser.Math.Between(60, WORLD.h - 200), Phaser.Math.FloatBetween(0.7, 1.3));
      c.driftSpeed = Phaser.Math.FloatBetween(5, 13); this.clouds.push(c);
    }
    this.fliers = [];
    for (let i = 0; i < 6; i++) this.spawnButterfly();
  }

  buildGroundInput() {
    // onzichtbare laag over de hele wereld: tik = loop daarheen
    this.ground = this.add.zone(0, 0, WORLD.w, WORLD.h).setOrigin(0).setDepth(-15);
    this.ground.setInteractive();
    this.ground.on('pointerup', (p) => {
      if (this.locked) return;
      // alleen lopen bij een tik (niet na slepen van de camera/blok)
      if (p.getDistance() > 16) return;
      this.walkTo(p.worldX, p.worldY);
    });
  }

  // ============================================================ GIDSJE
  // Het gidsje is "Nul" — een rond figuurtje (duidelijk anders dan de vierkante
  // Numberblocks), in een eigen kleur. Adrian is dol op de 0.
  buildAvatar() {
    const c = this.add.container(WORLD.w / 2, WORLD.h - 80).setDepth(20);
    const sh = this.add.ellipse(0, 30, 44, 12, 0x000000, 0.18);
    const col = 0x7ec8ff;
    const body = this.add.graphics();
    body.fillStyle(col, 1); body.fillEllipse(0, 0, 48, 54);
    body.fillStyle(lighten(col, 45), 0.6); body.fillEllipse(-9, -11, 16, 20);
    body.lineStyle(3, darker(col, 45), 1); body.strokeEllipse(0, 0, 48, 54);
    // schoentjes
    const feet = this.add.graphics(); feet.fillStyle(darker(col, 35), 1);
    feet.fillRoundedRect(-16, 22, 13, 9, 4); feet.fillRoundedRect(3, 22, 13, 9, 4);
    // gezicht
    const eL = this.add.circle(-8, -5, 8, 0xffffff).setStrokeStyle(2, 0x16202b);
    const eR = this.add.circle(8, -5, 8, 0xffffff).setStrokeStyle(2, 0x16202b);
    const pL = this.add.circle(-8, -4, 3.4, 0x16202b), pR = this.add.circle(8, -4, 3.4, 0x16202b);
    const mouth = this.add.graphics(); mouth.lineStyle(2.5, 0x16202b, 1); mouth.beginPath(); mouth.arc(0, 6, 8, 0.12 * Math.PI, 0.88 * Math.PI); mouth.strokePath();
    // schijfje met "0"
    const disc = this.add.circle(0, -32, 12, 0xffffff).setStrokeStyle(2.5, 0x16202b);
    const num = this.add.text(0, -32, '0', { fontFamily: 'Arial Black, Arial', fontSize: '15px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
    c.add([sh, feet, body, eL, eR, pL, pR, mouth, disc, num]);
    c.shadow = sh; c.body = body; c.feet = feet;
    this.avatar = c;
    this.tweens.add({ targets: body, scaleY: 1.05, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  walkTo(x, y) {
    this.walkTarget = {
      x: Phaser.Math.Clamp(x, 36, WORLD.w - 36),
      y: Phaser.Math.Clamp(y, 230, WORLD.h - 46),
    };
    // marker waar je heen loopt
    if (this.marker) this.marker.destroy();
    this.marker = this.add.circle(this.walkTarget.x, this.walkTarget.y + 12, 8, 0xffffff, 0.5).setDepth(1);
    this.tweens.add({ targets: this.marker, scale: 1.8, alpha: 0, duration: 500, onComplete: () => { if (this.marker) { this.marker.destroy(); this.marker = null; } } });
  }

  updateAvatar(dt, time) {
    const a = this.avatar; if (!a) return;
    if (this.walkTarget) {
      const dx = this.walkTarget.x - a.x, dy = this.walkTarget.y - a.y;
      const d = Math.hypot(dx, dy);
      if (d < 4) { this.walkTarget = null; a.feet.y = 0; }
      else {
        const sp = Math.min(d, 200 * dt);
        a.x += (dx / d) * sp; a.y += (dy / d) * sp;
        a.scaleX = dx < 0 ? -1 : 1;
        a.body.y = Math.sin(time * 0.02) * 2; // wiebel
        if (Math.floor(time / 160) !== this._lastStep) { this._lastStep = Math.floor(time / 160); SFX.step(); this.dustPuff(a.x, a.y + 24); }
      }
    } else if (a.body) {
      a.body.y *= 0.8;
    }
  }

  // ============================================================ VRIENDJES + PUZZELS
  buildSpots() {
    // drie getallen-vriendjes verspreid omhoog, met oplopend doel
    const defs = [
      { x: WORLD.w / 2 + 70, y: WORLD.h - 360, target: 3 },
      { x: WORLD.w / 2 - 80, y: 760, target: 5 },
      { x: WORLD.w / 2 + 60, y: 360, target: 8 },
    ];
    defs.forEach((d) => this.makeSpot(d));
  }

  makeSpot(def) {
    const spot = { ...def, solved: false, blocks: [] };
    // het vriendje (rond wezentje met een wens-wolkje)
    const f = this.add.container(def.x, def.y).setDepth(6);
    const col = sig(def.target);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.16); g.fillEllipse(0, 30, 52, 12);
    g.fillStyle(col, 1); g.fillCircle(0, 6, 26);
    g.fillStyle(lighten(col, 60), 0.5); g.fillCircle(-8, -2, 9);
    g.lineStyle(3, darker(col, 40), 1); g.strokeCircle(0, 6, 26);
    g.fillStyle(darker(col, 35), 1); g.fillRoundedRect(-18, 28, 12, 10, 4); g.fillRoundedRect(6, 28, 12, 10, 4);
    f.add(g);
    const eL = this.add.circle(-9, 0, 7, 0xffffff).setStrokeStyle(2, 0x16202b);
    const eR = this.add.circle(9, 0, 7, 0xffffff).setStrokeStyle(2, 0x16202b);
    f.add(eL); f.add(eR);
    const pL = this.add.circle(-9, 1, 3.2, 0x16202b), pR = this.add.circle(9, 1, 3.2, 0x16202b);
    pL.baseX = -9; pL.baseY = 1; pR.baseX = 9; pR.baseY = 1;
    f.add(pL); f.add(pR);
    const m = this.add.graphics(); m.lineStyle(2.5, 0x16202b, 1); m.beginPath(); m.arc(0, 10, 7, 0.1 * Math.PI, 0.9 * Math.PI); m.strokePath(); f.add(m);
    spot.friend = f; spot.mouth = m; spot.pupils = [pL, pR]; spot.eyes = [eL, eR];
    spot.baseY = def.y; spot.blinkT = Phaser.Math.Between(900, 3200); spot.greeted = false; spot.idleT = Phaser.Math.Between(2000, 5000);
    this.tweens.add({ targets: f, y: def.y - 6, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // wens-wolkje met het doelgetal
    const bub = this.add.container(def.x, def.y - 54).setDepth(7);
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 1); bg.lineStyle(3, 0x16202b, 1);
    bg.fillRoundedRect(-26, -22, 52, 40, 12); bg.strokeRoundedRect(-26, -22, 52, 40, 12);
    bg.fillTriangle(-6, 14, 6, 14, 0, 26);
    const want = this.add.text(0, -2, `${def.target}`, { fontFamily: 'Arial Black, Arial', fontSize: '26px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
    bub.add([bg, want]); spot.bubble = bub;
    this.tweens.add({ targets: bub, scale: 1.08, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // losse blokjes om het doel mee te maken (verdeel in stukjes)
    const parts = this.partition(def.target);
    parts.forEach((v, i) => {
      const ang = (i / parts.length) * Math.PI * 2;
      const bx = Phaser.Math.Clamp(def.x + Math.cos(ang) * 96 + Phaser.Math.Between(-10, 10), 50, WORLD.w - 50);
      const by = Phaser.Math.Clamp(def.y + 120 + Math.sin(ang) * 30 + i * 4, def.y + 70, def.y + 175);
      const b = this.makeBlock(v, bx, by);
      spot.blocks.push(b);
    });

    this.spots.push(spot);
  }

  partition(target) {
    const pieces = target >= 7 ? 3 : 2;
    const parts = []; let rest = target;
    for (let i = 0; i < pieces - 1; i++) {
      const max = rest - (pieces - 1 - i);
      const v = Phaser.Math.Between(1, Math.max(1, Math.min(max, target - 1)));
      parts.push(v); rest -= v;
    }
    parts.push(rest);
    return Phaser.Utils.Array.Shuffle(parts);
  }

  // ============================================================ LEVEN (rondlopende Numberblocks)
  buildNPCs() {
    this.npcs = [];
    [[120, 1380, 1], [350, 900, 2], [150, 560, 4]].forEach(([x, y, v]) => this.npcs.push(this.makeWanderer(v, x, y)));
  }

  makeWanderer(value, x, y) {
    const c = this.add.container(x, y).setDepth(12);
    const col = sig(value);
    const sh = this.add.ellipse(0, 22, 34, 9, 0x000000, 0.16);
    const body = this.add.graphics();
    body.fillStyle(col, 1); body.fillRoundedRect(-16, -16, 32, 34, 7);
    body.fillStyle(darker(col, 28), 1); body.fillRoundedRect(-16, 10, 32, 8, 7);
    body.fillStyle(col, 1); body.fillRoundedRect(-16, -16, 32, 26, 7);
    body.fillStyle(lighten(col, 70), 0.5); body.fillRoundedRect(-12, -12, 10, 14, 4);
    body.lineStyle(2.5, darker(col, 50), 0.9); body.strokeRoundedRect(-16, -16, 32, 34, 7);
    const feet = this.add.graphics(); feet.fillStyle(darker(col, 40), 1);
    feet.fillRoundedRect(-13, 16, 11, 8, 4); feet.fillRoundedRect(2, 16, 11, 8, 4);
    const eL = this.add.circle(-6, -4, 6, 0xffffff).setStrokeStyle(2, 0x16202b);
    const eR = this.add.circle(6, -4, 6, 0xffffff).setStrokeStyle(2, 0x16202b);
    const pL = this.add.circle(-6, -3, 2.6, 0x16202b), pR = this.add.circle(6, -3, 2.6, 0x16202b);
    const mouth = this.add.graphics(); mouth.lineStyle(2, 0x16202b, 1); mouth.beginPath(); mouth.arc(0, 3, 5, 0.15 * Math.PI, 0.85 * Math.PI); mouth.strokePath();
    const disc = this.add.circle(0, -24, 9, 0xffffff).setStrokeStyle(2, 0x16202b);
    const num = this.add.text(0, -24, `${value}`, { fontFamily: 'Arial Black, Arial', fontSize: '11px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
    c.add([sh, feet, body, eL, eR, pL, pR, mouth, disc, num]);
    c.body = body; c.eyes = [eL, eR]; c.value = value;
    c.target = null; c.retarget = Phaser.Math.Between(500, 2500); c.greetT = 0; c.blinkT = Phaser.Math.Between(900, 3200);
    this.tweens.add({ targets: body, scaleY: 1.05, duration: Phaser.Math.Between(800, 1100), yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    return c;
  }

  updateNPCs(dt, time) {
    const a = this.avatar;
    for (const n of this.npcs) {
      n.retarget -= dt * 1000;
      if (!n.target || n.retarget <= 0) {
        n.target = { x: Phaser.Math.Clamp(n.x + Phaser.Math.Between(-130, 130), 50, WORLD.w - 50), y: Phaser.Math.Clamp(n.y + Phaser.Math.Between(-130, 130), 250, WORLD.h - 60) };
        n.retarget = Phaser.Math.Between(2200, 5000);
      }
      const dx = n.target.x - n.x, dy = n.target.y - n.y, d = Math.hypot(dx, dy);
      if (d > 3) { const sp = Math.min(d, 64 * dt); n.x += (dx / d) * sp; n.y += (dy / d) * sp; n.body.y = Math.sin(time * 0.014) * 1.6; }
      else n.body.y *= 0.85;
      n.blinkT -= dt * 1000;
      if (n.blinkT <= 0) { n.blinkT = Phaser.Math.Between(1800, 4200); for (const e of n.eyes) this.tweens.add({ targets: e, scaleY: 0.1, duration: 70, yoyo: true }); }
      n.greetT -= dt * 1000;
      if (a && n.greetT <= 0 && Phaser.Math.Distance.Between(n.x, n.y, a.x, a.y) < 84) {
        n.greetT = 4500;
        this.tweens.add({ targets: n, y: n.y - 14, duration: 170, yoyo: true, ease: 'Quad.out' });
        Voice.cue('greet'); this.heart(n.x, n.y - 26);
      }
    }
  }

  // vriendjes leven: ogen volgen Nul, knipperen, zwaaien als je dichtbij komt
  updateFriends(dt, time) {
    const a = this.avatar;
    for (const s of this.spots) {
      if (!s.friend || !s.friend.active) continue;
      let tx = 0, ty = 0;
      if (a) { const ang = Math.atan2(a.y - s.friend.y, a.x - s.friend.x); tx = Math.cos(ang) * 1.8; ty = Math.sin(ang) * 1.8; }
      for (const p of s.pupils) { p.x = p.baseX + tx; p.y = p.baseY + ty; }
      s.blinkT -= dt * 1000;
      if (s.blinkT <= 0) { s.blinkT = Phaser.Math.Between(1800, 4200); for (const e of s.eyes) this.tweens.add({ targets: e, scaleY: 0.1, duration: 70, yoyo: true }); }
      if (a && !s.solved) {
        const d = Phaser.Math.Distance.Between(a.x, a.y, s.friend.x, s.friend.y);
        if (d < 110 && !s.greeted) {
          s.greeted = true;
          Voice.cue('greet');
          this.tweens.add({ targets: s.friend, scaleX: 1.18, scaleY: 0.86, duration: 130, yoyo: true, ease: 'Quad.out' });
          this.heart(s.friend.x, s.friend.y - 30);
        } else if (d > 200) s.greeted = false;
      }
    }
  }

  // ============================================================ GEHEIMEN
  buildSecrets() {
    this.chest = this.makeChest(WORLD.w - 56, 1180);
  }

  makeChest(x, y) {
    const c = this.add.container(x, y).setDepth(11);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.16); g.fillEllipse(0, 16, 40, 10);
    g.fillStyle(0x9c6b3f, 1); g.fillRoundedRect(-20, -6, 40, 22, 4);
    g.fillStyle(0x7a4f2c, 1); g.fillRoundedRect(-20, -14, 40, 12, 5);
    g.fillStyle(0xffd23f, 1); g.fillRect(-3, -10, 6, 22);
    g.fillStyle(0xffe9a8, 1); g.fillCircle(0, 2, 3);
    g.lineStyle(2.5, 0x4a2f18, 1); g.strokeRoundedRect(-20, -14, 40, 30, 5);
    c.add(g);
    c.opened = false;
    c.setSize(48, 40); c.setInteractive(new Phaser.Geom.Rectangle(-24, -22, 48, 40), Phaser.Geom.Rectangle.Contains);
    c.on('pointerup', (p) => { if (p.getDistance && p.getDistance() > 16) return; this.openChest(c); });
    this.tweens.add({ targets: c, scaleX: 1.04, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    return c;
  }

  openChest(chest) {
    if (chest.opened) return; chest.opened = true;
    this.tweens.killTweensOf(chest);
    this.tweens.add({ targets: chest, scaleX: 1.25, scaleY: 0.8, duration: 120, yoyo: true });
    this.sparkleAt(chest.x, chest.y - 10, 22); this.burstStars(chest.x, chest.y - 10, 22);
    SFX.yay(); Voice.cue('cheer');
    addStars(5); this.starText.setText(`${getStars()}`);
    this.tweens.add({ targets: this.starText, scale: 1.4, duration: 200, yoyo: true });
    this.cameraPunch();
  }

  cameraPunch(zoom = 0.03, shake = 5) {
    const cam = this.cameras.main;
    cam.shake(180, shake / 1000);
    this.tweens.add({ targets: cam, zoom: 1 + zoom, duration: 110, yoyo: true, ease: 'Quad.out' });
  }

  heart(x, y) {
    const g = this.add.graphics().setDepth(60);
    g.fillStyle(0xff6b9d, 1); g.fillCircle(-4, 0, 5); g.fillCircle(4, 0, 5); g.fillTriangle(-9, 2, 9, 2, 0, 13);
    g.x = x; g.y = y;
    this.tweens.add({ targets: g, y: y - 34, alpha: 0, scale: 1.4, duration: 800, ease: 'Quad.out', onComplete: () => g.destroy() });
  }

  dustPuff(x, y) {
    const p = this.add.particles(x, y, 'star', { speed: { min: 10, max: 38 }, angle: { min: 200, max: 340 }, scale: { start: 0.6, end: 0 }, lifespan: 360, quantity: 2, tint: [0xead9b0, 0xcbb489] }).setDepth(18);
    this.time.delayedCall(380, () => p.destroy());
  }

  // ============================================================ HUD
  buildHud() {
    const back = this.add.graphics().setScrollFactor(0).setDepth(50);
    back.fillStyle(0x16202b, 0.42); back.fillRoundedRect(10, 12, 48, 34, 11);
    back.fillStyle(0xffffff, 1); back.fillTriangle(38, 18, 38, 40, 22, 29); back.fillRect(38, 25, 12, 8);
    back.setInteractive(new Phaser.Geom.Rectangle(10, 12, 48, 34), Phaser.Geom.Rectangle.Contains);
    back.on('pointerdown', () => { SFX.click(); this.scene.start('Menu'); });

    this.add.image(WORLD.w - 64, 23, 'star').setScrollFactor(0).setDepth(50).setScale(2.4);
    this.starText = this.add.text(WORLD.w - 16, 23, `${getStars()}`, {
      fontFamily: 'Arial Black, Arial', fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(50).setStroke('#1f2d3a', 5);

    // opdracht-balkje
    const qb = this.add.graphics().setScrollFactor(0).setDepth(50);
    qb.fillStyle(0x16202b, 0.5); qb.fillRoundedRect(WORLD.w / 2 - 110, 12, 220, 30, 12);
    this.questText = this.add.text(WORLD.w / 2, 27, '', {
      fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51);
    this.updateQuest();

    // pijltje omhoog dat naar het dichtstbijzijnde onopgeloste vriendje wijst
    this.guideArrow = this.add.text(WORLD.w / 2, 56, '▲', {
      fontFamily: 'Arial', fontSize: '20px', color: '#fbbf24',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(50).setStroke('#16202b', 4);
  }

  updateQuest() {
    const left = this.spots.filter((s) => !s.solved).length;
    if (left === 0) this.questText.setText('Alle vriendjes geholpen! 🎉');
    else this.questText.setText(`Help de vriendjes:  ${this.solvedCount}/${this.spots.length}`);
  }

  // ============================================================ NUMBERBLOCK-FIGUUR
  makeBlock(value, x, y) {
    const container = this.add.container(x, y).setDepth(10);
    const block = { container, value, eyes: [], pupils: [], mouth: null, wasDragged: false, blinkT: Phaser.Math.Between(800, 3000), faceY: 0, homeX: x, homeY: y };
    container.setData('block', block);
    this.drawBlockVisual(block);
    this.makeInteractive(block);
    this.idleAnim(block);
    this.blocks.push(block);
    container.setScale(0.2);
    this.tweens.add({ targets: container, scale: 1, duration: 320, ease: 'Back.out' });
    return block;
  }

  drawBlockVisual(block) {
    const c = block.container;
    c.removeAll(true);
    block.eyes = []; block.pupils = [];
    const v = block.value, W = 56;
    const ch = Phaser.Math.Clamp(220 / v, 18, 48);
    const totalH = v * ch, color = sig(v), edge = darker(color, 55), top = -totalH / 2;
    block.W = W; block.totalH = totalH;
    const rad = Math.min(9, ch * 0.28);

    const shadow = this.add.ellipse(0, totalH / 2 + 14, W * 0.95, 15, 0x000000, 0.18);
    c.add(shadow); block.shadow = shadow;

    // armpjes
    const armY = top + ch * 0.65;
    const armG = this.add.graphics();
    armG.lineStyle(9, darker(color, 22), 1);
    armG.beginPath(); armG.moveTo(-W / 2 + 4, armY); armG.lineTo(-W / 2 - 15, armY + 10); armG.lineTo(-W / 2 - 19, armY + 29); armG.strokePath();
    armG.fillStyle(darker(color, 22), 1); armG.fillCircle(-W / 2 - 19, armY + 32, 6);
    armG.lineStyle(9, darker(color, 22), 1);
    armG.beginPath(); armG.moveTo(W / 2 - 4, armY); armG.lineTo(W / 2 + 15, armY + 10); armG.lineTo(W / 2 + 19, armY + 29); armG.strokePath();
    armG.fillCircle(W / 2 + 19, armY + 32, 6);
    c.add(armG); block.rightHand = { x: W / 2 + 19, y: armY + 32 };

    const feet = this.add.graphics();
    feet.fillStyle(darker(color, 38), 1);
    feet.fillRoundedRect(-W * 0.42, totalH / 2 - 4, W * 0.34, 13, 6);
    feet.fillRoundedRect(W * 0.08, totalH / 2 - 4, W * 0.34, 13, 6);
    c.add(feet);

    for (let i = 0; i < v; i++) {
      const cy = totalH / 2 - ch / 2 - i * ch, ty = cy - ch / 2;
      const g = this.add.graphics();
      g.fillStyle(color, 1); g.fillRoundedRect(-W / 2, ty, W, ch, rad);
      g.fillStyle(darker(color, 30), 1); g.fillRoundedRect(-W / 2, ty + ch - Math.max(5, ch * 0.18), W, Math.max(5, ch * 0.18), rad);
      g.fillStyle(color, 1); g.fillRoundedRect(-W / 2, ty, W, ch - Math.max(5, ch * 0.18), rad);
      g.fillStyle(lighten(color, 75), 0.55); g.fillRoundedRect(-W / 2 + 5, ty + 4, W * 0.34, ch * 0.5, 5);
      if (i === v - 1) { g.fillStyle(lighten(color, 45), 1); g.fillEllipse(0, ty + 3, W - 10, ch * 0.34); }
      g.lineStyle(2.5, edge, 0.9); g.strokeRoundedRect(-W / 2, ty, W, ch, rad);
      if (i > 0) { g.lineStyle(2, edge, 0.5); g.beginPath(); g.moveTo(-W / 2 + 3, ty); g.lineTo(W / 2 - 3, ty); g.strokePath(); }
      c.add(g);
    }

    const faceY = top + ch * 0.52; block.faceY = faceY;
    const eo = 12, er = Math.min(11, ch * 0.26);
    for (const sx of [-eo, eo]) {
      const white = this.add.circle(sx, faceY - 2, er, 0xffffff).setStrokeStyle(2.5, 0x16202b);
      const pupil = this.add.circle(sx, faceY - 1, er * 0.46, 0x16202b);
      c.add(white); c.add(pupil);
      block.eyes.push(white); block.pupils.push(pupil);
      pupil.baseX = sx; pupil.baseY = faceY - 1;
    }
    const mouth = this.add.graphics(); c.add(mouth); block.mouth = mouth;
    this.setExpression(block, 'happy');

    const discR = 16, discY = top - discR * 0.55;
    const neck = this.add.graphics(); neck.fillStyle(0xffffff, 1); neck.fillRect(-4, top - 6, 8, 8); c.add(neck);
    c.add(this.add.circle(0, discY, discR, 0xffffff).setStrokeStyle(3, 0x16202b));
    c.add(this.add.text(0, discY, `${v}`, { fontFamily: 'Arial Black, Arial', fontSize: `${Math.min(24, 16 + v)}px`, fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5));

    this.drawPersonality(block);

    c.setSize(W, totalH);
    c.setInteractive(new Phaser.Geom.Rectangle(-W / 2 - 8, top - discR * 1.4, W + 16, totalH + discR * 1.4 + 14), Phaser.Geom.Rectangle.Contains);
    this.input.setDraggable(c);
  }

  setExpression(block, kind) {
    const m = block.mouth; if (!m) return;
    m.clear(); m.lineStyle(3, 0x16202b, 1);
    const y = block.faceY + 12;
    if (kind === 'happy') { m.beginPath(); m.arc(0, y - 4, 9, 0.15 * Math.PI, 0.85 * Math.PI); m.strokePath(); }
    else if (kind === 'big') { m.fillStyle(0x16202b, 1); m.fillCircle(0, y, 6); m.fillStyle(0xff7a9c, 1); m.fillCircle(0, y + 1, 3); }
    else if (kind === 'sad') { m.beginPath(); m.arc(0, y + 8, 9, 1.15 * Math.PI, 1.85 * Math.PI); m.strokePath(); }
    else if (kind === 'surprise') { m.strokeCircle(0, y, 5); }
  }

  drawPersonality(block) {
    const c = block.container, v = block.value, fy = block.faceY, top = -block.totalH / 2;
    const g = this.add.graphics(); c.add(g);
    g.fillStyle(0xff8a8a, 0.45); g.fillCircle(-19, fy + 6, 4.5); g.fillCircle(19, fy + 6, 4.5);
    if (v === 2) { g.lineStyle(2.5, 0x16202b, 1); g.strokeCircle(-12, fy - 2, 11); g.strokeCircle(12, fy - 2, 11); g.beginPath(); g.moveTo(-1, fy - 2); g.lineTo(1, fy - 2); g.strokePath(); }
    else if (v === 3) { g.fillStyle(0x16202b, 0.75); for (let i = 0; i < 3; i++) g.fillCircle(0, fy + 20 + i * 15, 3); }
    if (v >= 4) { g.lineStyle(3, 0x16202b, 1); g.beginPath(); g.moveTo(-18, fy - 13); g.lineTo(-7, fy - 11); g.strokePath(); g.beginPath(); g.moveTo(18, fy - 13); g.lineTo(7, fy - 11); g.strokePath(); }
    if (v === 5 && block.rightHand) {
      const star = this.add.image(block.rightHand.x + 5, block.rightHand.y, 'star').setScale(2.6).setTint(0xffe16b);
      c.add(star); this.tweens.add({ targets: star, angle: 360, duration: 4500, repeat: -1 });
    }
  }

  makeInteractive(block) {
    const c = block.container;
    c.on('pointerdown', () => { block.wasDragged = false; });
    c.on('dragstart', () => {
      if (this.locked) return;
      block.wasDragged = true; c.setDepth(40);
      this.tweens.killTweensOf(c);
      this.tweens.add({ targets: c, scaleX: 1.14, scaleY: 0.9, duration: 110, yoyo: true, ease: 'Quad.out', onComplete: () => c.setScale(1.08) });
      if (block.shadow) this.tweens.add({ targets: block.shadow, scaleX: 0.7, alpha: 0.1, duration: 120 });
      SFX.pick(); this.lookAll(block);
    });
    c.on('dragend', () => { if (!this.locked) this.dropBlock(block); });
    c.on('pointerup', () => { if (!block.wasDragged && !this.locked) this.tapBlock(block); });
  }

  idleAnim(block) {
    const c = block.container;
    this.tweens.add({ targets: c, y: c.y - 4, duration: Phaser.Math.Between(1100, 1600), yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: Phaser.Math.Between(0, 600) });
  }

  // ------------------------------------------------- interacties
  tapBlock(block) {
    if (this.locked) return;
    if (block.value <= 1) {
      SFX.giggle(); this.jump(block);
      this.setExpression(block, 'surprise');
      this.time.delayedCall(380, () => this.setExpression(block, 'happy'));
      return;
    }
    const v = block.value, topV = Math.ceil(v / 2), botV = Math.floor(v / 2);
    const c = block.container, sx = c.x, sy = c.y;
    SFX.split();
    block.value = botV; this.drawBlockVisual(block);
    this.tweens.add({ targets: c, scaleX: 1.2, scaleY: 0.8, duration: 90, yoyo: true, ease: 'Quad.out' });
    const piece = this.makeBlock(topV, sx, sy - 10);
    this.tweens.killTweensOf(piece.container);
    piece.container.setScale(0.7);
    const dir = sx < WORLD.w / 2 ? 1 : -1;
    const nx = Phaser.Math.Clamp(sx + dir * Phaser.Math.Between(74, 104), 50, WORLD.w - 50);
    this.tweens.add({ targets: piece.container, x: nx, y: sy, scaleX: 1, scaleY: 1, duration: 380, ease: 'Back.out' });
    this.sparkleAt(sx, sy - block.totalH / 2, 10);
    this.setExpression(block, 'surprise'); this.setExpression(piece, 'surprise');
    this.time.delayedCall(430, () => { this.setExpression(block, 'happy'); this.setExpression(piece, 'happy'); });
    Voice.cue('whee');
  }

  dropBlock(block) {
    const c = block.container; c.setScale(1);
    if (block.shadow) this.tweens.add({ targets: block.shadow, scaleX: 1, alpha: 0.18, duration: 150 });

    // bij een vriendje afgeleverd?
    for (const spot of this.spots) {
      if (spot.solved) continue;
      if (Phaser.Math.Distance.Between(c.x, c.y, spot.friend.x, spot.friend.y) < 86) {
        this.deliver(block, spot); return;
      }
    }
    // op een ander blokje? -> samenvoegen
    let other = null, best = 9999;
    for (const b of this.blocks) {
      if (b === block) continue;
      const d = Phaser.Math.Distance.Between(c.x, c.y, b.container.x, b.container.y);
      if (d < 68 && d < best) { best = d; other = b; }
    }
    if (other) { this.mergeBlocks(block, other); return; }
    this.settle(block);
  }

  settle(block) {
    const c = block.container;
    c.x = Phaser.Math.Clamp(c.x, 44, WORLD.w - 44);
    c.y = Phaser.Math.Clamp(c.y, 230, WORLD.h - 40);
    c.setDepth(10);
    SFX.place();
    this.tweens.add({ targets: c, scaleX: 1.12, scaleY: 0.86, duration: 110, yoyo: true, ease: 'Quad.out' });
  }

  mergeBlocks(moving, target) {
    this.locked = true;
    const a = moving.container, b = target.container, newVal = moving.value + target.value;
    this.tweens.add({
      targets: a, x: b.x, y: b.y, scale: 0.6, duration: 160, ease: 'Quad.in',
      onComplete: () => {
        this.blocks = this.blocks.filter((x) => x !== moving);
        this.spots.forEach((s) => { s.blocks = s.blocks.filter((x) => x !== moving); });
        a.destroy();
        target.value = newVal; this.drawBlockVisual(target); this.idleAnim(target);
        this.popSquash(b, 1.3);
        this.setExpression(target, newVal >= 10 ? 'big' : 'happy');
        this.time.delayedCall(500, () => { if (target.mouth) this.setExpression(target, 'happy'); });
        this.sparkleAt(b.x, b.y - target.totalH / 2, 12); this.burstStars(b.x, b.y, 6);
        SFX.combine(newVal); Voice.number(newVal);
        this.lookAll(target); this.locked = false;
      },
    });
  }

  deliver(block, spot) {
    const c = block.container;
    if (block.value === spot.target) {
      this.locked = true;
      this.tweens.add({ targets: c, x: spot.friend.x, y: spot.friend.y + 20, duration: 200, ease: 'Quad.out' });
      this.solveSpot(block, spot);
    } else {
      SFX.oops(); this.setExpression(block, 'sad');
      this.spotReact(spot, 'sad');
      Voice.cue('oops');
      this.shake(c);
      this.tweens.add({ targets: c, x: block.homeX, y: block.homeY, duration: 380, ease: 'Back.out', onComplete: () => { this.setExpression(block, 'happy'); c.setDepth(10); } });
    }
  }

  spotReact(spot, kind) {
    const m = spot.mouth; if (!m) return;
    m.clear(); m.lineStyle(2.5, 0x16202b, 1);
    if (kind === 'sad') { m.beginPath(); m.arc(0, 16, 7, 1.1 * Math.PI, 1.9 * Math.PI); m.strokePath(); }
    else { m.beginPath(); m.arc(0, 10, 7, 0.1 * Math.PI, 0.9 * Math.PI); m.strokePath(); }
    if (kind === 'sad') this.time.delayedCall(700, () => this.spotReact(spot, 'happy'));
  }

  solveSpot(block, spot) {
    spot.solved = true; this.solvedCount += 1;
    confettiBurst(this, 200);
    this.burstStars(spot.friend.x, spot.friend.y, 16);
    this.sparkleAt(spot.friend.x, spot.friend.y, 18);
    this.cameraPunch();
    SFX.yay();
    this.spotReact(spot, 'happy');
    Voice.cue('great');

    // vriendje + blok dansen
    this.tweens.add({ targets: spot.friend, y: spot.friend.y - 26, duration: 220, yoyo: true, repeat: 2, ease: 'Sine.inOut' });
    this.tweens.add({ targets: block.container, angle: { from: -8, to: 8 }, duration: 140, yoyo: true, repeat: 5, onComplete: () => { block.container.angle = 0; } });
    if (spot.bubble) this.tweens.add({ targets: spot.bubble, scale: 0, alpha: 0, duration: 300, ease: 'Back.in', onComplete: () => spot.bubble.destroy() });

    const reward = 2 + this.solvedCount;
    addStars(reward); this.starText.setText(`${getStars()}`);
    this.tweens.add({ targets: this.starText, scale: 1.3, duration: 200, yoyo: true });
    this.updateQuest();

    this.time.delayedCall(1400, () => {
      // ruim de blokjes van dit vriendje op
      spot.blocks.forEach((b) => { if (b.container.active) this.tweens.add({ targets: b.container, scale: 0, duration: 250, ease: 'Back.in', onComplete: () => b.container.destroy() }); this.blocks = this.blocks.filter((x) => x !== b); });
      spot.blocks = [];
      this.locked = false;
      if (this.solvedCount >= this.spots.length) this.allDone();
    });
  }

  allDone() {
    this.time.delayedCall(400, () => {
      showReward(this, {
        title: 'Held van Getallen-Land! 🏆',
        subtitle: 'Je hebt alle vriendjes geholpen!',
        stars: 5, medal: 'numberland_hero', medalLabel: 'Getallen-Held',
        buttonText: 'Nog een keer! 🔄',
        onClose: () => this.scene.restart(),
      });
    });
  }

  // ------------------------------------------------- effecten
  popSquash(c, big = 1) {
    this.tweens.killTweensOf(c); c.setScale(1);
    this.tweens.add({ targets: c, scaleX: 1.2 * big, scaleY: 0.8, duration: 120, yoyo: true, ease: 'Quad.out', onComplete: () => c.setScale(1) });
  }
  jump(block) { this.tweens.add({ targets: block.container, y: block.container.y - 24, duration: 200, yoyo: true, ease: 'Quad.out' }); }
  shake(c) { const x0 = c.x; this.tweens.add({ targets: c, x: x0 - 8, duration: 50, yoyo: true, repeat: 3, onComplete: () => { c.x = x0; } }); }
  sparkleAt(x, y, n = 8) {
    const p = this.add.particles(x, y, 'star', { speed: { min: 40, max: 160 }, angle: { min: 0, max: 360 }, scale: { start: 1.2, end: 0 }, lifespan: 700, quantity: n, tint: [0xffffff, 0xfff3b0, 0xffe16b], blendMode: 'ADD' }).setDepth(60);
    this.time.delayedCall(750, () => p.destroy());
  }
  burstStars(x, y, n = 10) {
    const p = this.add.particles(x, y, 'star', { speedY: { min: -260, max: -90 }, speedX: { min: -130, max: 130 }, gravityY: 420, scale: { start: 1.6, end: 0.2 }, lifespan: 1100, quantity: n, tint: [0xf87171, 0xfbbf24, 0x4ade80, 0x60a5fa, 0xec4899], rotate: { min: 0, max: 360 } }).setDepth(60);
    this.time.delayedCall(1200, () => p.destroy());
  }
  lookAll(target) { this.lookTarget = target; this.lookT = 1200; }

  // ------------------------------------------------- cartoon-art
  makeCloud(x, y, s = 1) {
    const c = this.add.container(x, y).setDepth(-17).setScale(s).setScrollFactor(0.6);
    const g = this.add.graphics();
    g.fillStyle(0xe8f5ff, 1); g.fillEllipse(6, 15, 82, 20);
    g.fillStyle(0xffffff, 1);
    [[-26, 4, 17], [-6, -8, 23], [16, 0, 20], [34, 7, 14], [4, 11, 26]].forEach(([cx, cy, r]) => g.fillCircle(cx, cy, r));
    c.add(g); return c;
  }
  spawnButterfly() {
    const col = Phaser.Utils.Array.GetRandom(FLOWERS);
    const x = Phaser.Math.Between(0, WORLD.w), y = Phaser.Math.Between(200, WORLD.h - 200);
    const b = this.add.container(x, y).setDepth(15);
    const wing = this.add.graphics();
    const drawWings = (sx) => {
      wing.fillStyle(col, 1); wing.fillEllipse(sx * 11, -6, 18, 20); wing.fillEllipse(sx * 12, 10, 14, 15);
      wing.fillStyle(lighten(col, 65), 0.65); wing.fillEllipse(sx * 11, -6, 9, 11);
      wing.fillStyle(darker(col, 40), 1); wing.fillCircle(sx * 11, -6, 2.5);
    };
    drawWings(-1); drawWings(1);
    wing.fillStyle(0x3a2c20, 1); wing.fillRoundedRect(-2, -11, 4, 24, 2);
    wing.lineStyle(1.5, 0x3a2c20, 1);
    wing.beginPath(); wing.moveTo(0, -11); wing.lineTo(-4, -17); wing.strokePath();
    wing.beginPath(); wing.moveTo(0, -11); wing.lineTo(4, -17); wing.strokePath();
    b.add(wing);
    this.tweens.add({ targets: wing, scaleX: 0.72, duration: 240, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    b.baseY = y; b.phase = Math.random() * Math.PI * 2; b.vx = Phaser.Math.FloatBetween(12, 28) * (Math.random() < 0.5 ? 1 : -1);
    this.fliers.push(b); return b;
  }
  drawTree(x, y, s = 1) {
    const c = this.add.container(x, y).setDepth(-12).setScale(s);
    const g = this.add.graphics();
    g.fillStyle(PAL.trunk, 1); g.fillRoundedRect(-7, -6, 14, 42, 4);
    g.fillStyle(darker(PAL.leaf, 28), 1); g.fillCircle(0, -34, 30);
    g.fillStyle(PAL.leaf, 1); g.fillCircle(-17, -30, 20); g.fillCircle(17, -30, 20); g.fillCircle(0, -46, 22);
    g.fillStyle(lighten(PAL.leaf, 50), 0.5); g.fillCircle(-9, -46, 9);
    c.add(g);
    this.tweens.add({ targets: c, angle: { from: -2.5, to: 2.5 }, duration: Phaser.Math.Between(2200, 3200), yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: Phaser.Math.Between(0, 900) });
    this.scenery.push(c); return c;
  }
  drawBush(x, y) {
    const c = this.add.container(x, y).setDepth(-12);
    const g = this.add.graphics();
    g.fillStyle(darker(PAL.leaf, 22), 1); g.fillCircle(0, 0, 18);
    g.fillStyle(PAL.leaf, 1); g.fillCircle(-13, 3, 13); g.fillCircle(13, 3, 13); g.fillCircle(0, -6, 15);
    g.fillStyle(lighten(PAL.leaf, 42), 0.5); g.fillCircle(-6, -6, 6);
    c.add(g);
    c.setSize(40, 36); c.setInteractive(new Phaser.Geom.Rectangle(-20, -18, 40, 36), Phaser.Geom.Rectangle.Contains);
    c.hasStar = Math.random() < 0.5; c.searched = false;
    c.on('pointerup', (p) => { if (p.getDistance && p.getDistance() > 16) return; this.searchBush(c); });
    this.scenery.push(c); return c;
  }
  searchBush(bush) {
    if (bush.searched) return; bush.searched = true;
    this.tweens.add({ targets: bush, scaleX: 1.15, scaleY: 0.9, duration: 100, yoyo: true });
    if (bush.hasStar) {
      this.sparkleAt(bush.x, bush.y - 6, 10); this.burstStars(bush.x, bush.y, 6);
      addStars(1); this.starText.setText(`${getStars()}`); SFX.sparkle();
      Voice.cue('star');
    } else { SFX.giggle(); }
  }
  drawFlower(x, y, color) {
    const c = this.add.container(x, y).setDepth(-12);
    const g = this.add.graphics();
    g.lineStyle(3, 0x3f9d3f, 1); g.beginPath(); g.moveTo(0, 11); g.lineTo(0, 0); g.strokePath();
    g.fillStyle(color, 1);
    for (let a = 0; a < 5; a++) { const an = (a / 5) * Math.PI * 2; g.fillCircle(Math.cos(an) * 6, Math.sin(an) * 6 - 2, 4.5); }
    g.fillStyle(0xfff0a0, 1); g.fillCircle(0, -2, 4); c.add(g);
    this.tweens.add({ targets: c, angle: { from: -7, to: 7 }, duration: Phaser.Math.Between(1700, 2500), yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: Phaser.Math.Between(0, 900) });
    this.scenery.push(c); return c;
  }
  drawHouse(x, y, number, color) {
    const c = this.add.container(x, y).setDepth(-12);
    const g = this.add.graphics();
    g.fillStyle(lighten(color, 45), 1); g.fillRoundedRect(-26, -22, 52, 44, 5);
    g.lineStyle(3, darker(color, 30), 1); g.strokeRoundedRect(-26, -22, 52, 44, 5);
    g.fillStyle(color, 1); g.fillTriangle(-32, -19, 32, -19, 0, -50);
    g.lineStyle(3, darker(color, 42), 1); g.strokeTriangle(-32, -19, 32, -19, 0, -50);
    g.fillStyle(darker(color, 22), 1); g.fillRoundedRect(-9, -1, 18, 23, 3);
    g.fillStyle(0xfff0a0, 1); g.fillCircle(-16, -8, 5); g.fillCircle(16, -8, 5);
    c.add(g);
    c.add(this.add.circle(0, -34, 9, 0xffffff).setStrokeStyle(2.5, 0x16202b));
    c.add(this.add.text(0, -34, `${number}`, { fontFamily: 'Arial Black, Arial', fontSize: '13px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5));
    this.scenery.push(c); return c;
  }

  // ============================================================ UPDATE
  update(time, delta) {
    const dt = delta / 1000;
    this.updateAvatar(dt, time);
    this.updateNPCs(dt, time);
    this.updateFriends(dt, time);

    for (const c of this.clouds) { c.x += c.driftSpeed * dt; if (c.x > WORLD.w + 70) c.x = -70; }
    for (const f of this.fliers) {
      f.x += f.vx * dt; f.phase += dt * 2; f.y = f.baseY + Math.sin(f.phase) * 10;
      if (f.x > WORLD.w + 40) f.x = -40; if (f.x < -40) f.x = WORLD.w + 40;
    }

    const lt = this.lookTarget && this.lookTarget.container && this.lookTarget.container.active ? this.lookTarget : null;
    if (this.lookT > 0) this.lookT -= delta;
    for (const b of this.blocks) {
      if (!b.container.active) continue;
      let tx, ty;
      if (lt && lt !== b && this.lookT > 0) {
        const ang = Math.atan2(lt.container.y - b.container.y, lt.container.x - b.container.x);
        tx = Math.cos(ang) * 2.4; ty = Math.sin(ang) * 2.4;
      } else { tx = Math.sin(time * 0.0011 + b.homeX) * 1.6; ty = 1; }
      for (const p of b.pupils) { p.x = p.baseX + tx; p.y = p.baseY + ty; }
      b.blinkT -= delta;
      if (b.blinkT <= 0) {
        b.blinkT = Phaser.Math.Between(1600, 4200);
        for (const e of b.eyes) this.tweens.add({ targets: e, scaleY: 0.1, duration: 70, yoyo: true });
        for (const p of b.pupils) this.tweens.add({ targets: p, scaleY: 0.1, duration: 70, yoyo: true });
      }
    }
  }

}
