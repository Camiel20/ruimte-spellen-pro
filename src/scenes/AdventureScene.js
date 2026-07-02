import Phaser from 'phaser';
import { SFX, initAudio } from '../sound.js';
import { Voice } from '../voice.js';
import { startMusic } from '../music.js';
import { confettiBurst, showReward } from '../reward.js';
import { addStars, getStars } from '../progress.js';
import { WORLD1, LEVEL_1_1 } from '../levels/world1.js';
import { WORLD2 } from '../levels/world2.js';

// Alle levels achter elkaar (Wereld 1 → Wereld 2 → ...); de level-ketting
// loopt gewoon door via de index.
const LEVELS = [...WORLD1, ...WORLD2];

// ===== TEL-AVONTUUR — level-engine =====
// Data-gedreven 2D-platformer in de sfeer van Numberblocks (100% zelf getekend).
// Deze engine leest een leveldata-object (zie src/levels/world1.js) en bouwt er
// een speelbaar level van. Zie SLICE-SPEC.md voor het plan.
//
// Systemen (allemaal optioneel per level, dus levels delen één engine):
//  - platforms, groei-bolletjes, Grommels, verstopte ster, doel-vlag
//  - PUZZELS (bouw-modus bevriest lopen): 'brug' (leg planken) en 'redding'
//    (help een gevallen Numberblock → geeft een KRACHT)
//  - DEUREN: 'wees N' — de deur opent alleen als JIJ waarde N bent
//  - KRACHTEN: dubbelsprong (verdiend door een vriendje te redden)
//  - level-ketting: doel gehaald → volgend level uit WORLD1
//
// Twee scene-standen:
//   'explore' — Arcade Physics actief; ← → loopt, Spring springt, camera volgt.
//   'build'   — bij een puzzel: physics bevroren, blokjes-overlay (slepen =
//               samenvoegen, tik = splitsen) tot het doelgetal klaar is.

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

const CELL = 42;      // hoogte van één blok-cel
const PW = 44;        // breedte van de speler/blokjes
const MOVE_SPEED = 210;
const JUMP_BASE = 600;      // sprongkracht bij waarde 1
const JUMP_PER_LEVEL = 42;  // extra kracht per groei-stap (hoger springen)
const COYOTE_MS = 120;      // nog net springen na de rand
const BUFFER_MS = 130;      // tik vlak vóór de landing telt alsnog

export default class AdventureScene extends Phaser.Scene {
  constructor() { super('Adventure'); }

  create(data) {
    initAudio();
    startMusic('adventure'); // vrolijk avontuur-deuntje tijdens het spelen

    this.levelIndex = (data && data.levelIndex) || 0;
    this.level = LEVELS[this.levelIndex] || LEVEL_1_1;
    const L = this.level;

    this.mode = 'explore';
    this.playerValue = L.startValue || 1;
    this.checkpoint = { ...L.start };
    this.invulnUntil = 0;
    this.lastGroundAt = -9999;
    this.jumpBufferedAt = -9999;
    this.jumpsUsed = 0;
    this.powers = { doubleJump: !!L.startDoubleJump, stamp: !!L.startStamp };
    this.won = false;

    this.cameras.main.setBounds(0, 0, L.worldW, L.worldH);
    this.physics.world.setBounds(0, 0, L.worldW, L.worldH);

    this.buildBackground(L);
    this.buildWater(L);
    this.buildPlatforms(L);
    this.buildPickups(L);
    this.buildPuzzles(L);
    this.buildDoors(L);
    this.buildBreakables(L);
    this.buildBoss(L);
    this.buildGrommels(L);
    this.buildStar(L);
    this.buildGoal(L);
    this.buildPlayer(L);
    this.buildTouchControls();
    this.buildHud();
    if (import.meta.env && import.meta.env.DEV) this.buildDevLevelPicker();

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(140, 220);
    this.cameras.main.fadeIn(400, 8, 16, 26);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keySpace = this.input.keyboard.addKey('SPACE');

    Voice.cue('welcome');
  }

  // ============================================================ ACHTERGROND
  buildBackground(L) {
    const sky = this.add.graphics().setDepth(-30).setScrollFactor(0);
    sky.fillGradientStyle(L.bg.top, L.bg.top, L.bg.bottom, L.bg.bottom, 1);
    sky.fillRect(0, 0, this.scale.width, this.scale.height);

    // Zon (licht parallax)
    const sun = this.add.container(this.scale.width - 70, 90).setDepth(-28).setScrollFactor(0.25);
    const glow = this.add.circle(0, 0, 54, 0xfff3b0, 0.35);
    sun.add([glow, this.add.circle(0, 0, 32, 0xffe16b)]);
    this.tweens.add({ targets: glow, scale: 1.18, alpha: 0.5, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // Wolkjes (parallax) verspreid over de wereldbreedte
    this.clouds = [];
    for (let i = 0; i < 8; i++) {
      const x = (i / 8) * L.worldW + Phaser.Math.Between(-40, 40);
      const y = Phaser.Math.Between(70, 260);
      const s = Phaser.Math.FloatBetween(0.7, 1.3);
      const c = this.add.container(x, y).setDepth(-27).setScale(s).setScrollFactor(0.5);
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 0.9);
      [[-26, 4, 17], [-6, -8, 23], [16, 0, 20], [34, 7, 14], [4, 11, 26]].forEach(([cx, cy, r]) => g.fillCircle(cx, cy, r));
      c.add(g);
      c.driftSpeed = Phaser.Math.FloatBetween(4, 11);
      this.clouds.push(c);
    }

    // Verre heuvels (parallax) voor diepte
    const hills = this.add.graphics().setDepth(-26).setScrollFactor(0.35);
    hills.fillStyle(darker(L.bg.bottom, 20), 0.7);
    for (let x = -100; x < this.scale.width + 200; x += 180) hills.fillCircle(x, this.scale.height, 150);
  }

  // ============================================================ WATER (visueel)
  buildWater(L) {
    (L.water || []).forEach(([x, y, w, h]) => {
      const g = this.add.graphics().setDepth(-14);
      g.fillStyle(0x3fa9e0, 1); g.fillRect(x, y, w, h);
      g.fillStyle(0x7fd0f0, 0.5);
      for (let wx = x; wx < x + w; wx += 42) g.fillEllipse(wx + 21, y + 12, 26, 8);
      g.fillStyle(0xffffff, 0.25);
      for (let wx = x; wx < x + w; wx += 60) g.fillEllipse(wx + 30, y + 26, 18, 5);
      this.tweens.add({ targets: g, alpha: 0.82, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });
  }

  // ============================================================ PLATFORMS / GROND
  buildPlatforms(L) {
    this.platforms = this.physics.add.staticGroup();
    L.platforms.forEach(([x, y, w, h]) => {
      const plat = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0x000000, 0);
      this.physics.add.existing(plat, true);
      this.platforms.add(plat);
      this.drawGround(x, y, w, h);
    });
  }

  drawGround(x, y, w, h) {
    const g = this.add.graphics().setDepth(-10);
    // aarde
    g.fillStyle(0xb07a45, 1); g.fillRect(x, y + 12, w, h - 12);
    g.fillStyle(0x9c6b3f, 0.6);
    for (let ex = x + 12; ex < x + w; ex += 46) g.fillEllipse(ex, y + 34, 16, 8);
    // gras-toplaag
    g.fillStyle(0x57b947, 1); g.fillRect(x, y, w, 16);
    g.fillStyle(lighten(0x57b947, 22), 1); g.fillRect(x, y, w, 6);
    g.fillStyle(0x3f9d3f, 1);
    for (let bx = x + 6; bx < x + w; bx += 16) g.fillTriangle(bx, y, bx + 5, y, bx + 2.5, y - 6);
    // klein bloemetje hier en daar
    for (let fx = x + 40; fx < x + w - 20; fx += 130) {
      g.fillStyle(0xff6b9d, 1); g.fillCircle(fx, y - 10, 3);
      g.fillStyle(0xffe16b, 1); g.fillCircle(fx, y - 10, 1.4);
    }
  }

  // ============================================================ GROEI-BOLLETJES
  buildPickups(L) {
    this.pickups = [];
    (L.pickups || []).forEach((p) => {
      const c = this.add.container(p.x, p.y).setDepth(5);
      const glow = this.add.circle(0, 0, 15, 0xfff3b0, 0.5);
      const ball = this.add.circle(0, 0, 10, 0xffe16b).setStrokeStyle(3, 0xf6a723);
      const plus = this.add.text(0, 0, '+1', { fontFamily: 'Arial Black, Arial', fontSize: '13px', fontStyle: 'bold', color: '#7a4f10' }).setOrigin(0.5);
      c.add([glow, ball, plus]);
      c.amount = p.amount || 1; c.taken = false;
      this.tweens.add({ targets: c, y: p.y - 8, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.tweens.add({ targets: glow, scale: 1.3, alpha: 0.2, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.pickups.push(c);
    });
  }

  // ============================================================ PUZZELS (brug + redding)
  buildPuzzles(L) {
    this.puzzles = [];

    // 'brug' — leg planken over een kloof (blok-overlay tot doelgetal).
    // Eén level mag meerdere bruggen hebben (L.gate = enkel, L.gates = lijst);
    // elke brug is zelfstandig (eigen kloof, bordje, trigger-zone en blokjes).
    [L.gate, ...(L.gates || [])].filter(Boolean).forEach((G) => {
      const pz = { type: 'brug', ...G, solved: false };
      const groundTop = L.platforms[0][1];

      // De kloof zichtbaar maken: donkere spleet.
      const chasm = this.add.graphics().setDepth(-11);
      chasm.fillStyle(G.water ? 0x3fa9e0 : 0x2a3a2a, 1); chasm.fillRect(G.gapX, groundTop, G.gapW, 200);
      if (G.water) { chasm.fillStyle(0x7fd0f0, 0.5); for (let wx = G.gapX; wx < G.gapX + G.gapW; wx += 42) chasm.fillEllipse(wx + 21, groundTop + 12, 26, 8); }

      // Bordje met het doelgetal.
      const sign = this.add.container(G.gapX - 16, G.y - 74).setDepth(4);
      const post = this.add.graphics();
      post.fillStyle(0x9c6b3f, 1); post.fillRect(-3, 0, 6, 60);
      post.fillStyle(0xf3e2c0, 1); post.fillRoundedRect(-24, -30, 48, 40, 8);
      post.lineStyle(3, 0x9c6b3f, 1); post.strokeRoundedRect(-24, -30, 48, 40, 8);
      const want = this.add.text(0, -10, `${G.doel}`, { fontFamily: 'Arial Black, Arial', fontSize: '30px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
      sign.add([post, want]);
      this.tweens.add({ targets: sign, y: G.y - 80, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      pz.sign = sign;
      pz.zone = new Phaser.Geom.Rectangle(G.triggerX, groundTop - 120, G.triggerW, 160);
      pz.prompt = 'Bouw de brug!';
      pz.onSolve = () => this.solveBridge(pz);
      this.puzzles.push(pz);
    });

    // 'redding' — help een gevallen Numberblock; geeft een kracht
    (L.rescues || []).forEach((R) => {
      const pz = { type: 'redding', ...R, solved: false };
      pz.friend = this.drawSleepingFriend(R.x, R.y, R.doel);
      pz.zone = new Phaser.Geom.Rectangle(R.x - 55, R.y - 130, 110, 170);
      pz.prompt = `Help ${R.name || 'het vriendje'}!`;
      pz.onSolve = () => this.reviveFriend(pz);
      this.puzzles.push(pz);
    });
  }

  // Een grijs, "uit elkaar gevallen" vriendje dat op redding wacht.
  drawSleepingFriend(x, y, value) {
    const c = this.add.container(x, y).setDepth(6);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.16); g.fillEllipse(0, 26, 46, 11);
    g.fillStyle(0x9aa0a6, 1); g.fillRoundedRect(-20, -18, 40, 42, 8);
    g.fillStyle(0x7f858c, 1); g.fillRoundedRect(-20, 14, 40, 10, 8);
    g.lineStyle(2.5, 0x565b61, 1); g.strokeRoundedRect(-20, -18, 40, 42, 8);
    // droevige oogjes + traan
    const eL = this.add.circle(-8, -4, 6, 0xffffff).setStrokeStyle(2, 0x444);
    const eR = this.add.circle(8, -4, 6, 0xffffff).setStrokeStyle(2, 0x444);
    const pL = this.add.circle(-8, -3, 2.4, 0x333), pR = this.add.circle(8, -3, 2.4, 0x333);
    const m = this.add.graphics(); m.lineStyle(2, 0x565b61, 1); m.beginPath(); m.arc(0, 12, 6, 1.1 * Math.PI, 1.9 * Math.PI); m.strokePath();
    // wens-wolkje met doelgetal
    const bub = this.add.container(0, -52);
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 1); bg.lineStyle(3, 0x16202b, 1);
    bg.fillRoundedRect(-22, -20, 44, 34, 10); bg.strokeRoundedRect(-22, -20, 44, 34, 10);
    bg.fillTriangle(-5, 12, 5, 12, 0, 22);
    const wn = this.add.text(0, -3, `${value}`, { fontFamily: 'Arial Black, Arial', fontSize: '22px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
    bub.add([bg, wn]);
    this.tweens.add({ targets: bub, scale: 1.08, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    c.add([g, eL, eR, pL, pR, m, bub]);
    c.bubble = bub;
    return c;
  }

  // ============================================================ DEUREN ('wees N')
  buildDoors(L) {
    this.doors = [];
    this.doorGroup = this.physics.add.staticGroup();
    (L.doors || []).forEach((D) => {
      const topY = D.topY != null ? D.topY : 300;
      const groundY = D.y != null ? D.y : L.platforms[0][1];
      const h = groundY - topY, cx = D.x, cy = topY + h / 2, w = 46;

      // fysieke blokkade
      const body = this.add.rectangle(cx, cy, w, h, 0x000000, 0);
      this.physics.add.existing(body, true);
      this.doorGroup.add(body);

      // visuele deur (grijs = op slot) met het benodigde getal
      const art = this.add.container(cx, cy).setDepth(4);
      const g = this.add.graphics();
      g.fillStyle(0x8a8f96, 1); g.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
      g.fillStyle(lighten(0x8a8f96, 30), 0.5); g.fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, 14, 5);
      g.lineStyle(4, 0x4a4f55, 1); g.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
      // klinknagels
      g.fillStyle(0x6c7178, 1);
      for (let yy = -h / 2 + 14; yy < h / 2 - 6; yy += 34) { g.fillCircle(-w / 2 + 8, yy, 3); g.fillCircle(w / 2 - 8, yy, 3); }
      art.add(g);
      // slot-schijf met getal (bovenaan)
      const disc = this.add.circle(0, -h / 2 + 34, 18, 0xffffff).setStrokeStyle(3, 0x16202b);
      const num = this.add.text(0, -h / 2 + 34, `${D.doel}`, { fontFamily: 'Arial Black, Arial', fontSize: '22px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
      art.add([disc, num]);

      // zwevend "wees N"-wolkje
      const hint = this.add.container(cx, topY - 26).setDepth(5);
      const hb = this.add.graphics(); hb.fillStyle(0xffffff, 0.95); hb.lineStyle(3, 0x16202b, 1);
      hb.fillRoundedRect(-52, -18, 104, 34, 10); hb.strokeRoundedRect(-52, -18, 104, 34, 10);
      const ht = this.add.text(0, -1, `Wees ${D.doel}!`, { fontFamily: 'Arial Black, Arial', fontSize: '15px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
      hint.add([hb, ht]);
      this.tweens.add({ targets: hint, y: topY - 32, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

      const door = { doel: D.doel, x: cx, topY, groundY, body, art, hint, hintText: ht, opened: false };
      this.doors.push(door);
    });
  }

  openDoor(door) {
    if (door.opened) return; door.opened = true;
    door.body.enable = false;
    this.doorGroup.remove(door.body, false, false);
    SFX.correct(); Voice.cue('great'); this.cameraPunch();
    this.sparkleAt(door.x, (door.topY + door.groundY) / 2, 16);
    this.tweens.add({ targets: door.art, scaleY: 0, y: door.groundY, alpha: 0.2, duration: 450, ease: 'Back.in', onComplete: () => door.art.destroy() });
    this.tweens.add({ targets: door.hint, scale: 0, alpha: 0, duration: 300, onComplete: () => door.hint.destroy() });
    this.questText.setText('De deur is open! 🚪');
  }

  // ============================================================ BREEKBARE KRATTEN
  // Kratten die je met de STAMP-kracht (van Drie) van bovenaf kapot slaat.
  // Zonder de kracht zijn het gewone, stevige platforms.
  buildBreakables(L) {
    this.breakGroup = this.physics.add.staticGroup();
    (L.breakables || []).forEach(([x, y, w, h]) => {
      const body = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0x000000, 0);
      this.physics.add.existing(body, true);
      this.breakGroup.add(body);
      const art = this.add.container(x + w / 2, y + h / 2).setDepth(-9);
      const g = this.add.graphics();
      g.fillStyle(0xb5793e, 1); g.fillRoundedRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4, 4);
      g.fillStyle(0x8a5a2b, 1); g.fillRect(-w / 2 + 2, -3, w - 4, 6);
      g.fillStyle(lighten(0xb5793e, 30), 0.5); g.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w * 0.3, 8, 3);
      g.lineStyle(3, 0x6e4620, 1); g.strokeRoundedRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4, 4);
      // barstjes
      g.lineStyle(1.5, 0x5a3a1c, 0.7); g.beginPath(); g.moveTo(-w * 0.15, -h / 2 + 4); g.lineTo(0, 0); g.lineTo(-w * 0.1, h / 2 - 4); g.strokePath();
      art.add(g); body._art = art;
    });
  }

  breakBlock(block) {
    if (block._broken) return; block._broken = true;
    block.body.enable = false;
    this.breakGroup.remove(block, false, false);
    if (block._art) { const a = block._art; this.tweens.add({ targets: a, scaleY: 0, scaleX: 1.2, alpha: 0, duration: 200, ease: 'Quad.in', onComplete: () => a.destroy() }); }
    SFX.stomp(); this.burstStars(block.x, block.y, 8); this.cameraPunch(0.02, 4);
    this.jumpsUsed = 0;
  }

  // ============================================================ BAAS (Wereld-einde)
  // Een grote Grommel-baas die de weg verspert. Je verslaat 'm GEWELDLOOS met
  // een groter rekenraadsel in fasen (bouw 3 → 4 → 5). Elke fase kleurt hij bij;
  // na de laatste stapt hij als vriendje opzij en opent de weg.
  buildBoss(L) {
    this.bossGroup = this.physics.add.staticGroup();
    if (!L.boss) return;
    const B = L.boss, groundTop = L.platforms[0][1];
    const topY = 300, h = groundTop - topY, w = 90;
    const body = this.add.rectangle(B.x, topY + h / 2, w, h, 0x000000, 0);
    this.physics.add.existing(body, true);
    this.bossGroup.add(body);

    const art = this.drawBoss(B.x, groundTop);
    const pz = {
      type: 'boss', ...B, solved: false, stageIndex: 0,
      doel: B.stages[0].doel, blocks: B.stages[0].blocks,
      zone: new Phaser.Geom.Rectangle(B.x - 210, groundTop - 160, 190, 200),
      prompt: 'Versla de Baas!', bossBody: body, bossArt: art,
    };
    art.bubbleText.setText(`${pz.doel}`);
    pz.onSolve = () => this.defeatBoss(pz);
    this.puzzles.push(pz);
  }

  drawBoss(x, groundY) {
    const c = this.add.container(x, groundY - 70).setDepth(7);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.18); g.fillEllipse(0, 74, 96, 20);
    g.fillStyle(0x8a8f96, 1); g.fillRoundedRect(-46, -70, 92, 144, 14);
    g.fillStyle(0x6c7178, 1); g.fillRoundedRect(-46, 44, 92, 22, 14);
    g.fillStyle(lighten(0x8a8f96, 30), 0.4); g.fillRoundedRect(-38, -60, 26, 44, 8);
    g.lineStyle(4, 0x4a4f55, 1); g.strokeRoundedRect(-46, -70, 92, 144, 14);
    const eL = this.add.circle(-17, -30, 13, 0xffffff).setStrokeStyle(3, 0x333);
    const eR = this.add.circle(17, -30, 13, 0xffffff).setStrokeStyle(3, 0x333);
    const pL = this.add.circle(-17, -27, 5, 0x222), pR = this.add.circle(17, -27, 5, 0x222);
    const br = this.add.graphics(); br.lineStyle(4, 0x3a3f45, 1);
    br.beginPath(); br.moveTo(-30, -48); br.lineTo(-7, -39); br.strokePath();
    br.beginPath(); br.moveTo(30, -48); br.lineTo(7, -39); br.strokePath();
    const m = this.add.graphics(); m.lineStyle(3, 0x3a3f45, 1); m.beginPath(); m.arc(0, 12, 14, 1.15 * Math.PI, 1.85 * Math.PI); m.strokePath();
    c.add([g, eL, eR, pL, pR, br, m]);
    c.bodyG = g; c.brow = br; c.mouth = m; c.eyes = [eL, eR];

    const bub = this.add.container(0, -108);
    const bg = this.add.graphics(); bg.fillStyle(0xffffff, 1); bg.lineStyle(3, 0x16202b, 1);
    bg.fillRoundedRect(-28, -24, 56, 44, 12); bg.strokeRoundedRect(-28, -24, 56, 44, 12); bg.fillTriangle(-6, 18, 6, 18, 0, 30);
    const wn = this.add.text(0, -2, '', { fontFamily: 'Arial Black, Arial', fontSize: '30px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
    bub.add([bg, wn]); c.add(bub); c.bubble = bub; c.bubbleText = wn;
    this.tweens.add({ targets: bub, scale: 1.08, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: c, y: c.y - 6, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    return c;
  }

  bossStageReact(pz) {
    const c = pz.bossArt;
    c.bubbleText.setText(`${pz.doel}`);
    this.tweens.add({ targets: c, scaleX: 1.12, scaleY: 0.86, duration: 130, yoyo: true, repeat: 1, ease: 'Quad.out' });
    this.sparkleAt(c.x, c.y, 12); SFX.combine(pz.doel);
    const left = pz.stages.length - pz.stageIndex;
    this.questText.setText(`De Baas wankelt! Nog ${left}× — bouw de ${pz.doel}`);
  }

  defeatBoss(pz) {
    const c = pz.bossArt;
    pz.bossBody.body.enable = false; this.bossGroup.remove(pz.bossBody, false, false);
    const col = sig(pz.stages[pz.stages.length - 1].doel);
    c.bodyG.clear();
    c.bodyG.fillStyle(0x000000, 0.18); c.bodyG.fillEllipse(0, 74, 96, 20);
    c.bodyG.fillStyle(col, 1); c.bodyG.fillRoundedRect(-46, -70, 92, 144, 14);
    c.bodyG.fillStyle(darker(col, 28), 1); c.bodyG.fillRoundedRect(-46, 44, 92, 22, 14);
    c.bodyG.fillStyle(lighten(col, 70), 0.5); c.bodyG.fillRoundedRect(-38, -60, 26, 44, 8);
    c.bodyG.lineStyle(4, darker(col, 50), 1); c.bodyG.strokeRoundedRect(-46, -70, 92, 144, 14);
    // blije wenkbrauwen + mond
    c.brow.clear();
    c.mouth.clear(); c.mouth.lineStyle(4, 0x16202b, 1); c.mouth.beginPath(); c.mouth.arc(0, 6, 15, 0.12 * Math.PI, 0.88 * Math.PI); c.mouth.strokePath();
    if (c.bubble) this.tweens.add({ targets: c.bubble, scale: 0, alpha: 0, duration: 300, ease: 'Back.in', onComplete: () => c.bubble.destroy() });
    confettiBurst(this, 150); this.cameraPunch(0.05, 7); SFX.yay(); Voice.cue('cheer'); this.burstStars(c.x, c.y - 20, 16);
    this.tweens.add({ targets: c, y: c.y - 30, duration: 250, yoyo: true, repeat: 3, ease: 'Sine.inOut' });
    this.questText.setText('Baas verslagen! Ren naar de vlag! 🚩');
  }

  // ============================================================ GROMMELS
  buildGrommels(L) {
    this.grommels = [];
    (L.grommels || []).forEach((def) => this.grommels.push(this.makeGrommel(def)));
  }

  makeGrommel(def) {
    const c = this.add.container(def.x, def.y).setDepth(8);
    const art = this.add.container(0, 0);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.16); g.fillEllipse(0, 20, 34, 9);
    g.fillStyle(0x8a8f96, 1); g.fillRoundedRect(-16, -14, 32, 30, 8);
    g.fillStyle(0x6c7178, 1); g.fillRoundedRect(-16, 8, 32, 8, 8);
    g.fillStyle(lighten(0x8a8f96, 40), 0.5); g.fillRoundedRect(-12, -10, 9, 10, 4);
    g.lineStyle(2.5, 0x4a4f55, 1); g.strokeRoundedRect(-16, -14, 32, 30, 8);
    const eL = this.add.circle(-6, -3, 5, 0xffffff).setStrokeStyle(2, 0x333);
    const eR = this.add.circle(6, -3, 5, 0xffffff).setStrokeStyle(2, 0x333);
    const pL = this.add.circle(-6, -2, 2.2, 0x222), pR = this.add.circle(6, -2, 2.2, 0x222);
    const mouth = this.add.graphics(); mouth.lineStyle(2, 0x3a3f45, 1);
    mouth.beginPath(); mouth.arc(0, 10, 5, 1.15 * Math.PI, 1.85 * Math.PI); mouth.strokePath();
    art.add([g, eL, eR, pL, pR, mouth]);
    c.add(art);
    c.art = art; c.def = def; c.alive = true; c.dir = 1;

    this.physics.add.existing(c);
    c.body.setSize(32, 30); c.body.setOffset(-16, -14);
    c.body.setAllowGravity(true);
    this.tweens.add({ targets: art, scaleY: 1.06, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    return c;
  }

  // ============================================================ STER (geheim)
  buildStar(L) {
    if (!L.star) { this.starPickup = null; return; }
    const c = this.add.container(L.star.x, L.star.y).setDepth(6);
    const glow = this.add.circle(0, 0, 18, 0xfff3b0, 0.4);
    const st = this.add.star(0, 0, 5, 7, 15, 0xffe16b).setStrokeStyle(3, 0xf6a723);
    c.add([glow, st]); c.taken = false;
    this.tweens.add({ targets: c, angle: 360, duration: 6000, repeat: -1 });
    this.tweens.add({ targets: glow, scale: 1.35, alpha: 0.15, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.starPickup = c;
  }

  // ============================================================ DOEL-VLAG
  buildGoal(L) {
    const c = this.add.container(L.goal.x, L.goal.y).setDepth(6);
    const pole = this.add.graphics();
    pole.fillStyle(0xcfd6dd, 1); pole.fillRect(-3, -70, 6, 150);
    pole.fillStyle(0xffffff, 0.6); pole.fillRect(-3, -70, 2, 150);
    c.add(pole);
    const disc = this.add.circle(0, -48, 30, 0xbfc4c9).setStrokeStyle(4, 0x16202b);
    const num = this.add.text(0, -48, `${L.goal.value}`, { fontFamily: 'Arial Black, Arial', fontSize: '34px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
    c.add([disc, num]);
    c.disc = disc; c.value = L.goal.value; c.reached = false;
    this.tweens.add({ targets: c, y: L.goal.y - 6, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.goal = c;
  }

  // ============================================================ SPELER (Één)
  buildPlayer(L) {
    const root = this.add.container(L.start.x, L.start.y).setDepth(12);
    const art = this.add.container(0, 0);
    root.add(art);
    root.art = art;
    this.physics.add.existing(root);
    root.body.setCollideWorldBounds(true);
    this.player = root;
    this.drawPlayer();

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.doorGroup);
    this.physics.add.collider(this.player, this.bossGroup);
    // Breekbare kratten: met stamp-kracht + naar beneden vallend → sla je erdoorheen.
    this.physics.add.collider(this.player, this.breakGroup, null, (player, block) => {
      if (this.powers.stamp && player.body.velocity.y > 60 && player.body.bottom <= block.body.top + 22) {
        this.breakBlock(block); return false; // val erdoorheen
      }
      return true; // anders gewoon stevig
    });
    this.grommels.forEach((gr) => {
      this.physics.add.collider(gr, this.platforms);
      this.physics.add.overlap(this.player, gr, () => this.hitGrommel(gr));
    });
  }

  drawPlayer() {
    const v = this.playerValue;
    const art = this.player.art;
    art.removeAll(true);
    const w = PW, totalH = v * CELL, top = -totalH / 2;

    for (let i = 0; i < v; i++) {
      const ty = totalH / 2 - (i + 1) * CELL;
      const color = sig(1); // Één is rood; groeien houdt de rode identiteit
      const g = this.add.graphics();
      g.fillStyle(color, 1); g.fillRoundedRect(-w / 2, ty, w, CELL, 8);
      g.fillStyle(darker(color, 28), 1); g.fillRoundedRect(-w / 2, ty + CELL - 8, w, 8, 8);
      g.fillStyle(color, 1); g.fillRoundedRect(-w / 2, ty, w, CELL - 8, 8);
      g.fillStyle(lighten(color, 75), 0.5); g.fillRoundedRect(-w / 2 + 5, ty + 4, w * 0.32, CELL * 0.42, 5);
      g.lineStyle(2.5, darker(color, 55), 0.9); g.strokeRoundedRect(-w / 2, ty, w, CELL, 8);
      art.add(g);
    }
    const feet = this.add.graphics(); feet.fillStyle(darker(sig(1), 40), 1);
    feet.fillRoundedRect(-w * 0.42, totalH / 2 - 3, w * 0.34, 11, 5);
    feet.fillRoundedRect(w * 0.08, totalH / 2 - 3, w * 0.34, 11, 5);
    art.add(feet);
    const faceY = top + CELL * 0.5;
    for (const sx of [-11, 11]) {
      art.add(this.add.circle(sx, faceY - 2, 8, 0xffffff).setStrokeStyle(2.5, 0x16202b));
      art.add(this.add.circle(sx, faceY - 1, 3.5, 0x16202b));
    }
    const m = this.add.graphics(); m.lineStyle(3, 0x16202b, 1);
    m.beginPath(); m.arc(0, faceY + 8, 8, 0.15 * Math.PI, 0.85 * Math.PI); m.strokePath();
    art.add(m);
    const discY = top - 9;
    art.add(this.add.circle(0, discY, 13, 0xffffff).setStrokeStyle(2.5, 0x16202b));
    art.add(this.add.text(0, discY, `${v}`, { fontFamily: 'Arial Black, Arial', fontSize: '17px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5));

    const body = this.player.body;
    const oldBottom = body ? (this.player.y - body.height / 2 + body.height) : null;
    body.setSize(w, totalH);
    body.setOffset(-w / 2, -totalH / 2);
    if (oldBottom != null) this.player.y = oldBottom - totalH / 2;
    this.player.totalH = totalH;
  }

  growPlayer(amount) {
    this.playerValue += amount;
    this.drawPlayer();
    SFX.grow(this.playerValue);
    Voice.cue('cheer');
    this.tweens.add({ targets: this.player.art, scaleX: 1.2, scaleY: 0.85, duration: 130, yoyo: true, ease: 'Quad.out' });
    this.sparkleAt(this.player.x, this.player.y, 12);
  }

  // ============================================================ BESTURING (touch)
  buildTouchControls() {
    this.moveDir = 0;
    // Multi-touch: standaard trackt Phaser maar 1 touch-pointer, waardoor je op
    // iOS niet tegelijk kunt lopen én springen. Extra pointers = meerdere
    // gelijktijdige aanrakingen (loopknop vasthouden + springtik + slepen).
    this.input.addPointer(3);
    const y = this.scale.height - 60;

    const mkBtn = (x, label, on, off) => {
      const g = this.add.graphics().setScrollFactor(0).setDepth(60);
      g.fillStyle(0x16202b, 0.34); g.fillCircle(x, y, 38);
      g.lineStyle(3, 0xffffff, 0.5); g.strokeCircle(x, y, 38);
      const t = this.add.text(x, y, label, { fontFamily: 'Arial', fontSize: '30px', color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(61);
      const hit = this.add.circle(x, y, 40, 0xffffff, 0.001).setScrollFactor(0).setDepth(62).setInteractive({ useHandCursor: true });
      hit.on('pointerdown', on); hit.on('pointerup', off); hit.on('pointerout', off);
      return { g, t, hit };
    };

    this.btnLeft = mkBtn(56, '◀', () => { this.moveDir = -1; }, () => { if (this.moveDir === -1) this.moveDir = 0; });
    this.btnRight = mkBtn(150, '▶', () => { this.moveDir = 1; }, () => { if (this.moveDir === 1) this.moveDir = 0; });
    this.btnJump = mkBtn(this.scale.width - 56, '⬆', () => { this.jumpBufferedAt = this.time.now; }, () => {});

    // Context-knop ✋ — verschijnt alleen bij een puzzel. LOS geplaatst (niet in
    // een container), want container-kinderen vangen muisklikken onbetrouwbaar.
    const bx = this.scale.width - 56, by = y - 96;
    const bgb = this.add.graphics().setScrollFactor(0).setDepth(63);
    bgb.fillStyle(0xf6c624, 1); bgb.fillCircle(bx, by, 34); bgb.lineStyle(3, 0x16202b, 1); bgb.strokeCircle(bx, by, 34);
    const bt = this.add.text(bx, by, '✋', { fontSize: '30px' }).setOrigin(0.5).setScrollFactor(0).setDepth(64);
    const blabel = this.add.text(bx, by - 48, '', {
      fontFamily: 'Arial Black, Arial', fontSize: '13px', fontStyle: 'bold', color: '#16202b',
      backgroundColor: '#ffe16b', padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(64);
    const bhit = this.add.circle(bx, by, 40, 0xffffff, 0.001).setScrollFactor(0).setDepth(65).setInteractive({ useHandCursor: true });
    bhit.on('pointerdown', () => this.enterBuild());
    this.btnBuildParts = [bgb, bt, blabel, bhit];
    this.btnBuildLabel = blabel;
    this.setBuildBtnVisible(false);
    this.tweens.add({ targets: bt, scale: 1.14, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: blabel, y: by - 54, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  setBuildBtnVisible(v) {
    if (this.btnBuildParts) this.btnBuildParts.forEach((o) => o.setVisible(v));
  }

  buildHud() {
    const back = this.add.graphics().setScrollFactor(0).setDepth(60);
    back.fillStyle(0x16202b, 0.42); back.fillRoundedRect(10, 12, 48, 34, 11);
    back.fillStyle(0xffffff, 1); back.fillTriangle(38, 18, 38, 40, 22, 29); back.fillRect(38, 25, 12, 8);
    back.setInteractive(new Phaser.Geom.Rectangle(10, 12, 48, 34), Phaser.Geom.Rectangle.Contains);
    back.on('pointerdown', () => { SFX.click(); this.scene.start('Menu'); });

    this.add.image(this.scale.width - 64, 27, 'star').setScrollFactor(0).setDepth(60).setScale(2.4);
    this.starText = this.add.text(this.scale.width - 16, 27, `${getStars()}`, {
      fontFamily: 'Arial Black, Arial', fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(60).setStroke('#1f2d3a', 5);

    const qb = this.add.graphics().setScrollFactor(0).setDepth(60);
    qb.fillStyle(0x16202b, 0.5); qb.fillRoundedRect(this.scale.width / 2 - 120, 12, 240, 30, 12);
    this.questText = this.add.text(this.scale.width / 2, 27, this.level.intro || 'Op avontuur!', {
      fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(61);
  }

  // ============================================================ DEV: LEVEL-KIEZER
  // Alleen in `npm run dev` (import.meta.env.DEV). Strip met knopjes onderin om
  // direct naar elk level te springen — zo hoef je niet alles door te spelen.
  // Verdwijnt automatisch in de productie-build (GitHub Pages).
  buildDevLevelPicker() {
    const W = this.scale.width;
    const chipW = Math.min(58, (W - 20) / LEVELS.length);
    const y = this.scale.height - 22;
    const totalW = chipW * LEVELS.length;
    let x = (W - totalW) / 2 + chipW / 2;

    const strip = this.add.graphics().setScrollFactor(0).setDepth(90);
    strip.fillStyle(0x16202b, 0.55);
    strip.fillRoundedRect((W - totalW) / 2 - 6, y - 15, totalW + 12, 30, 10);

    LEVELS.forEach((lvl, i) => {
      const active = i === this.levelIndex;
      const cx = x + i * chipW;
      const chip = this.add.text(cx, y, lvl.id, {
        fontFamily: 'Arial Black, Arial', fontSize: '13px', fontStyle: 'bold',
        color: active ? '#16202b' : '#ffffff',
        backgroundColor: active ? '#ffe16b' : '#2b3d52',
        padding: { x: 6, y: 3 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(91).setInteractive({ useHandCursor: true });
      chip.on('pointerdown', () => {
        SFX.click();
        this.scene.restart({ levelIndex: i });
      });
    });

    this.add.text((W - totalW) / 2 - 6, y - 26, 'DEV', {
      fontFamily: 'Arial Black, Arial', fontSize: '10px', fontStyle: 'bold', color: '#ffe16b',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(91);
  }

  // ============================================================ BOUW-MODUS (puzzels)
  enterBuild() {
    if (this.mode !== 'explore' || !this.nearPuzzle || this.nearPuzzle.solved) return;
    const pz = this.nearPuzzle;
    this.activePuzzle = pz;
    this.mode = 'build';
    this.physics.pause();
    this.player.body.setVelocity(0, 0);
    this.setBuildBtnVisible(false);
    [this.btnLeft, this.btnRight, this.btnJump].forEach((b) => { b.g.setVisible(false); b.t.setVisible(false); b.hit.disableInteractive(); });

    const W = this.scale.width, H = this.scale.height;
    const panel = this.add.container(0, 0).setScrollFactor(0).setDepth(120);
    const dim = this.add.graphics(); dim.fillStyle(0x0a1420, 0.82); dim.fillRect(0, 0, W, H);
    panel.add(dim);

    const title = this.add.text(W / 2, 70, `Maak de ${pz.doel}!`, {
      fontFamily: 'Arial Black, Arial', fontSize: '26px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    const hint = this.add.text(W / 2, 104, 'Sleep om samen te voegen · tik 2× om te splitsen', {
      fontFamily: 'Arial', fontSize: '13px', color: '#9fb3c8',
    }).setOrigin(0.5);
    panel.add([title, hint]);

    const goalDisc = this.add.circle(W / 2, 160, 26, sig(pz.doel)).setStrokeStyle(4, 0x16202b);
    const goalNum = this.add.text(W / 2, 160, `${pz.doel}`, { fontFamily: 'Arial Black, Arial', fontSize: '28px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
    panel.add([goalDisc, goalNum]);

    const backBtn = this.add.text(30, 34, '↩', { fontSize: '30px', color: '#ffffff' }).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this.exitBuild());
    panel.add(backBtn);

    this.buildPanel = panel;
    this.buildBlocks = [];
    // Lage drempel = het blok komt meteen los als je sleept (geen plakkerige
    // dode zone). Een echte tik (nauwelijks beweging) blijft splitsen.
    this.input.dragDistanceThreshold = 3;

    pz.blocks.forEach((val, i) => {
      const bx = W / 2 + (i - (pz.blocks.length - 1) / 2) * 120;
      const by = H - 300; // iets hoger, zodat een volle toren (t/m 10) past
      this.makeBuildBlock(val, bx, by);
    });

    // Sleep-handler: SCHERM-positie van de vinger (blokjes zitten in een
    // scrollFactor-0 overlay; dragX/dragY zijn wereld-coörd. → zou wegspringen).
    this._dragHandler = (p, obj) => {
      if (obj.getData && obj.getData('buildBlock')) {
        // grijp-offset: het blok volgt de vinger vanaf waar je 'm pakte
        // (geen sprong met het midden naar de vinger).
        obj.x = p.x + (obj._grabDX || 0);
        obj.y = p.y + (obj._grabDY || 0);
      }
    };
    this.input.on('drag', this._dragHandler);
  }

  exitBuild(solved = false) {
    if (this.mode !== 'build') return;
    this.mode = 'explore';
    if (this._dragHandler) { this.input.off('drag', this._dragHandler); this._dragHandler = null; }
    if (this.buildPanel) { this.buildPanel.destroy(); this.buildPanel = null; }
    this.buildBlocks = [];
    [this.btnLeft, this.btnRight, this.btnJump].forEach((b) => { b.g.setVisible(true); b.t.setVisible(true); b.hit.setInteractive(); });
    this.physics.resume();
  }

  makeBuildBlock(value, x, y) {
    const c = this.add.container(x, y).setScrollFactor(0).setDepth(122);
    c.setData('buildBlock', { value });
    this.drawBuildBlock(c, value);
    this.buildPanel.add(c);
    this.buildBlocks.push(c);

    c._lastTap = 0;
    c.on('pointerdown', () => { c._dragged = false; });
    c.on('dragstart', (p) => { c._dragged = true; c._grabDX = c.x - p.x; c._grabDY = c.y - p.y; c.setDepth(140); this.tweens.add({ targets: c, scale: 1.1, duration: 100, yoyo: true, onComplete: () => c.setScale(1.06) }); SFX.pick(); });
    c.on('dragend', () => this.dropBuildBlock(c));
    // Splitsen = 2× tikken (dubbeltik). Eén losse tik doet niks, zodat het
    // loslaten van een sleep-samenvoeging niet per ongeluk splitst.
    c.on('pointerup', () => {
      if (c._dragged) return;
      const now = this.time.now;
      if (now - (c._lastTap || 0) < 340) { c._lastTap = 0; this.splitBuildBlock(c); }
      else { c._lastTap = now; this.tweens.add({ targets: c, scale: 1.06, duration: 90, yoyo: true }); }
    });
    c.setScale(0.3);
    this.tweens.add({ targets: c, scale: 1, duration: 260, ease: 'Back.out' });
    return c;
  }

  drawBuildBlock(c, value) {
    c.removeAll(true);
    c.setData('buildBlock', { value });
    // Cellen blijven VIERKANTE kubussen: breedte == hoogte. Vol formaat (46px)
    // t/m 10; daarboven krimpen ze samen (uniform) zodat de toren blijft passen
    // (torenhoogte blijft dan constant ±460px) — nooit platgeknepen.
    const cell = Phaser.Math.Clamp(460 / value, 18, 46);
    const w = cell, ch = cell, totalH = value * ch, color = sig(value), top = -totalH / 2;
    const s = w / 52; // schaalt de gezicht-/cijfer-details mee met de kubusgrootte
    for (let i = 0; i < value; i++) {
      const ty = totalH / 2 - (i + 1) * ch;
      const g = this.add.graphics();
      g.fillStyle(color, 1); g.fillRoundedRect(-w / 2, ty, w, ch, 7);
      g.fillStyle(darker(color, 28), 1); g.fillRoundedRect(-w / 2, ty + ch - 6 * s, w, 6 * s, 7);
      g.fillStyle(color, 1); g.fillRoundedRect(-w / 2, ty, w, ch - 6 * s, 7);
      g.fillStyle(lighten(color, 75), 0.5); g.fillRoundedRect(-w / 2 + 5 * s, ty + 3 * s, w * 0.3, ch * 0.4, 4);
      g.lineStyle(2.5, darker(color, 55), 0.9); g.strokeRoundedRect(-w / 2, ty, w, ch, 7);
      if (i > 0) { g.lineStyle(2, darker(color, 55), 0.5); g.beginPath(); g.moveTo(-w / 2 + 3, ty); g.lineTo(w / 2 - 3, ty); g.strokePath(); }
      c.add(g);
    }
    const faceY = top + ch * 0.5;
    for (const sx of [-11 * s, 11 * s]) { c.add(this.add.circle(sx, faceY - 1, 7 * s, 0xffffff).setStrokeStyle(2.5, 0x16202b)); c.add(this.add.circle(sx, faceY, 3 * s, 0x16202b)); }
    const m = this.add.graphics(); m.lineStyle(3, 0x16202b, 1); m.beginPath(); m.arc(0, faceY + 8 * s, 7 * s, 0.15 * Math.PI, 0.85 * Math.PI); m.strokePath(); c.add(m);
    const discY = top - 12;
    c.add(this.add.circle(0, discY, 12, 0xffffff).setStrokeStyle(2.5, 0x16202b));
    c.add(this.add.text(0, discY, `${value}`, { fontFamily: 'Arial Black, Arial', fontSize: '15px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5));
    // Ruim aanraakgebied: het HELE blok + flinke marge is grijpbaar (fijner op
    // touch/iOS — je hoeft niet precies op een celletje te tikken).
    c.setSize(w + 28, totalH + 52);
    c.setInteractive(new Phaser.Geom.Rectangle(-w / 2 - 14, top - 30, w + 28, totalH + 56), Phaser.Geom.Rectangle.Contains);
    this.input.setDraggable(c);
  }

  dropBuildBlock(moving) {
    moving.setScale(1); moving.setDepth(122);
    let other = null, best = 9999;
    for (const b of this.buildBlocks) {
      if (b === moving) continue;
      const d = Phaser.Math.Distance.Between(moving.x, moving.y, b.x, b.y);
      if (d < 70 && d < best) { best = d; other = b; }
    }
    if (other) { this.mergeBuildBlocks(moving, other); return; }
    SFX.place();
  }

  mergeBuildBlocks(moving, target) {
    const newVal = moving.getData('buildBlock').value + target.getData('buildBlock').value;
    this.tweens.add({
      targets: moving, x: target.x, y: target.y, scale: 0.5, duration: 150, ease: 'Quad.in',
      onComplete: () => {
        this.buildBlocks = this.buildBlocks.filter((b) => b !== moving);
        moving.destroy();
        target._lastTap = 0; // reset dubbeltik-teller (voorkomt per ongeluk splitsen na samenvoegen)
        this.drawBuildBlock(target, newVal);
        this.tweens.add({ targets: target, scaleX: 1.25, scaleY: 0.8, duration: 120, yoyo: true });
        SFX.combine(newVal); Voice.number(newVal);
        this.sparkleAt2(target.x, target.y);
        this.checkPuzzleSolved(target);
      },
    });
  }

  splitBuildBlock(c) {
    const val = c.getData('buildBlock').value;
    if (val <= 1) { SFX.giggle(); this.tweens.add({ targets: c, y: c.y - 16, duration: 180, yoyo: true, ease: 'Quad.out' }); return; }
    const botV = Math.floor(val / 2), topV = Math.ceil(val / 2);
    SFX.split();
    this.drawBuildBlock(c, botV);
    this.tweens.add({ targets: c, scaleX: 1.2, scaleY: 0.8, duration: 90, yoyo: true });
    const piece = this.makeBuildBlock(topV, c.x, c.y);
    const dir = c.x < this.scale.width / 2 ? 1 : -1;
    this.tweens.add({ targets: piece, x: Phaser.Math.Clamp(c.x + dir * 90, 60, this.scale.width - 60), duration: 320, ease: 'Back.out' });
    Voice.cue('whee');
  }

  checkPuzzleSolved(block) {
    const pz = this.activePuzzle;
    if (!pz || block.getData('buildBlock').value !== pz.doel) return;
    this.tweens.add({ targets: block, y: block.y - 10, scale: 1.2, duration: 200, yoyo: true });
    SFX.correct(); Voice.cue('great');

    // Baas: meerdere fasen (3 → 4 → 5). Pas na de laatste is hij verslagen.
    if (pz.type === 'boss' && pz.stageIndex < pz.stages.length - 1) {
      pz.stageIndex += 1;
      pz.doel = pz.stages[pz.stageIndex].doel;
      pz.blocks = pz.stages[pz.stageIndex].blocks;
      this.time.delayedCall(450, () => { this.exitBuild(true); this.bossStageReact(pz); });
      return;
    }

    pz.solved = true;
    this.time.delayedCall(450, () => { this.exitBuild(true); pz.onSolve(); });
  }

  // ============================================================ BRUG NEERLEGGEN
  solveBridge(pz) {
    const G = pz, L = this.level;
    if (pz.sign) this.tweens.add({ targets: pz.sign, alpha: 0, y: G.y - 110, duration: 500, onComplete: () => pz.sign.destroy() });

    const plankTop = L.platforms[0][1] - 6;
    const plank = this.add.rectangle(G.gapX + G.gapW / 2, plankTop + 10, G.gapW, 20, 0x000000, 0);
    this.physics.add.existing(plank, true);
    this.platforms.add(plank);
    this.physics.add.collider(this.player, plank);
    this.grommels.forEach((gr) => this.physics.add.collider(gr, plank));

    const nP = G.doel;
    for (let i = 0; i < nP; i++) {
      const pw = G.gapW / nP, cx = G.gapX + pw * (i + 0.5);
      const plankG = this.add.graphics().setDepth(2);
      const col = sig(i + 1);
      plankG.fillStyle(col, 1); plankG.fillRoundedRect(cx - pw / 2 + 2, plankTop, pw - 4, 16, 4);
      plankG.lineStyle(2.5, darker(col, 45), 1); plankG.strokeRoundedRect(cx - pw / 2 + 2, plankTop, pw - 4, 16, 4);
      plankG.setScale(1, 0);
      this.tweens.add({ targets: plankG, scaleY: 1, duration: 220, delay: i * 140, ease: 'Back.out', onComplete: () => { SFX.place(); this.sparkleAt(cx, plankTop, 6); } });
    }
    this.time.delayedCall(nP * 140 + 300, () => { confettiBurst(this, 100); this.cameraPunch(); SFX.yay(); });
    this.questText.setText(this.level.afterGate || 'Ren verder! 🚩');
  }

  // ============================================================ VRIENDJE REDDEN → KRACHT
  reviveFriend(pz) {
    const f = pz.friend, col = sig(pz.doel);
    if (f.bubble) this.tweens.add({ targets: f.bubble, scale: 0, alpha: 0, duration: 250, ease: 'Back.in', onComplete: () => f.bubble.destroy() });
    // kleur terug + blij
    f.removeAll(true);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.16); g.fillEllipse(0, 26, 46, 11);
    g.fillStyle(col, 1); g.fillRoundedRect(-20, -18, 40, 42, 8);
    g.fillStyle(darker(col, 28), 1); g.fillRoundedRect(-20, 14, 40, 10, 8);
    g.fillStyle(lighten(col, 70), 0.5); g.fillRoundedRect(-15, -14, 11, 14, 4);
    g.lineStyle(2.5, darker(col, 50), 1); g.strokeRoundedRect(-20, -18, 40, 42, 8);
    const eL = this.add.circle(-8, -4, 6, 0xffffff).setStrokeStyle(2, 0x16202b);
    const eR = this.add.circle(8, -4, 6, 0xffffff).setStrokeStyle(2, 0x16202b);
    const pL = this.add.circle(-8, -3, 2.6, 0x16202b), pR = this.add.circle(8, -3, 2.6, 0x16202b);
    const m = this.add.graphics(); m.lineStyle(2.5, 0x16202b, 1); m.beginPath(); m.arc(0, 4, 6, 0.12 * Math.PI, 0.88 * Math.PI); m.strokePath();
    const disc = this.add.circle(0, -30, 11, 0xffffff).setStrokeStyle(2.5, 0x16202b);
    const num = this.add.text(0, -30, `${pz.doel}`, { fontFamily: 'Arial Black, Arial', fontSize: '13px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
    f.add([g, eL, eR, pL, pR, m, disc, num]);
    confettiBurst(this, 100); this.cameraPunch(); SFX.yay(); Voice.cue('cheer');
    this.burstStars(f.x, f.y - 10, 12);
    this.tweens.add({ targets: f, y: f.y - 24, duration: 220, yoyo: true, repeat: 2, ease: 'Sine.inOut' });

    if (pz.gives) this.grantPower(pz.gives, pz.name || `de ${pz.doel}`);
  }

  grantPower(power, who) {
    if (power === 'doubleJump') {
      this.powers.doubleJump = true;
      // spring-knop een "×2"-badge geven
      if (!this.jumpBadge) {
        this.jumpBadge = this.add.text(this.scale.width - 40, this.scale.height - 88, '×2', {
          fontFamily: 'Arial Black, Arial', fontSize: '15px', fontStyle: 'bold', color: '#16202b',
          backgroundColor: '#ffe16b', padding: { x: 5, y: 2 },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(62);
        this.tweens.add({ targets: this.jumpBadge, scale: 1.2, duration: 500, yoyo: true, repeat: 3 });
      }
      this.questText.setText('Nieuwe kracht: DUBBELSPRONG! Spring 2× 🦘');
    } else if (power === 'stamp') {
      this.powers.stamp = true;
      if (!this.stampBadge) {
        this.stampBadge = this.add.text(this.scale.width - 40, this.scale.height - 88, '💥', {
          fontSize: '18px', backgroundColor: '#ffe16b', padding: { x: 3, y: 2 },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(62);
        this.tweens.add({ targets: this.stampBadge, scale: 1.2, duration: 500, yoyo: true, repeat: 3 });
      }
      this.questText.setText('Nieuwe kracht: STAMPEN! Spring op kratten 💥');
    }
  }

  // ============================================================ GROMMEL-INTERACTIE
  hitGrommel(gr) {
    if (!gr.alive || this.mode !== 'explore') return;
    const p = this.player.body, gb = gr.body;
    const falling = p.velocity.y > 20;
    const above = p.bottom <= gb.top + 18;
    if (falling && above) {
      gr.alive = false; gr.body.enable = false;
      this.tweens.killTweensOf(gr.art);
      this.recolorGrommel(gr);
      this.player.body.setVelocityY(-380);
      this.jumpsUsed = 0; // stampen geeft je je sprongen terug
      SFX.stomp(); Voice.cue('cheer'); this.burstStars(gr.x, gr.y - 10, 8);
      this.tweens.add({ targets: gr.art, y: -12, duration: 160, yoyo: true, ease: 'Quad.out' });
    } else if (this.time.now > this.invulnUntil) {
      this.shrinkPlayer(gr);
    }
  }

  recolorGrommel(gr) {
    gr.art.removeAll(true);
    const col = sig(Phaser.Math.Between(3, 7));
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.16); g.fillEllipse(0, 20, 34, 9);
    g.fillStyle(col, 1); g.fillRoundedRect(-16, -14, 32, 30, 8);
    g.fillStyle(darker(col, 28), 1); g.fillRoundedRect(-16, 8, 32, 8, 8);
    g.lineStyle(2.5, darker(col, 50), 1); g.strokeRoundedRect(-16, -14, 32, 30, 8);
    const eL = this.add.circle(-6, -3, 5, 0xffffff).setStrokeStyle(2, 0x16202b);
    const eR = this.add.circle(6, -3, 5, 0xffffff).setStrokeStyle(2, 0x16202b);
    const pL = this.add.circle(-6, -2, 2.4, 0x16202b), pR = this.add.circle(6, -2, 2.4, 0x16202b);
    const m = this.add.graphics(); m.lineStyle(2, 0x16202b, 1); m.beginPath(); m.arc(0, 4, 5, 0.15 * Math.PI, 0.85 * Math.PI); m.strokePath();
    gr.art.add([g, eL, eR, pL, pR, m]);
    this.heart(gr.x, gr.y - 24);
    this.tweens.add({ targets: gr.art, scaleX: 1.15, scaleY: 0.85, duration: 130, yoyo: true, repeat: 2 });
  }

  shrinkPlayer(gr) {
    this.invulnUntil = this.time.now + 1100;
    SFX.shrink(); Voice.cue('oops');
    const dir = this.player.x < gr.x ? -1 : 1;
    this.player.body.setVelocity(dir * 190, -240);
    this.tweens.add({ targets: this.player.art, alpha: 0.3, duration: 110, yoyo: true, repeat: 4, onComplete: () => this.player.art.setAlpha(1) });

    if (this.playerValue <= 1) this.respawn();
    else { this.playerValue -= 1; this.drawPlayer(); }
  }

  // Staat de speler STEVIG op een platform (draagt het z'n volle breedte),
  // of hangt hij op een randje boven een kuil? Alleen bij stevig staan slaan we
  // een checkpoint op — anders zou je bij een val boven de kuil respawnen en
  // eindeloos blijven vallen.
  solidlyGrounded() {
    const b = this.player.body, feetY = b.bottom, cx = b.center.x, halfSupport = b.halfWidth * 0.5;
    for (const grp of [this.platforms, this.doorGroup, this.bossGroup]) {
      if (!grp) continue;
      for (const plat of grp.getChildren()) {
        const pb = plat.body;
        if (!pb || !pb.enable) continue;
        if (Math.abs(pb.top - feetY) < 10 && pb.left <= cx - halfSupport && pb.right >= cx + halfSupport) return true;
      }
    }
    return false;
  }

  respawn() {
    this.player.body.setVelocity(0, 0);
    this.cameras.main.flash(250, 30, 40, 60);
    this.player.setPosition(this.checkpoint.x, this.checkpoint.y);
    this.playerValue = Math.max(1, this.playerValue);
    this.drawPlayer();
  }

  // ============================================================ EFFECTEN
  cameraPunch(zoom = 0.03, shake = 5) {
    const cam = this.cameras.main;
    cam.shake(160, shake / 1000);
    this.tweens.add({ targets: cam, zoom: 1 + zoom, duration: 110, yoyo: true, ease: 'Quad.out' });
  }
  heart(x, y) {
    const g = this.add.graphics().setDepth(60);
    g.fillStyle(0xff6b9d, 1); g.fillCircle(-4, 0, 5); g.fillCircle(4, 0, 5); g.fillTriangle(-9, 2, 9, 2, 0, 13);
    g.x = x; g.y = y;
    this.tweens.add({ targets: g, y: y - 32, alpha: 0, scale: 1.4, duration: 800, ease: 'Quad.out', onComplete: () => g.destroy() });
  }
  sparkleAt(x, y, n = 8) {
    const p = this.add.particles(x, y, 'star', { speed: { min: 40, max: 150 }, angle: { min: 0, max: 360 }, scale: { start: 1.2, end: 0 }, lifespan: 650, quantity: n, tint: [0xffffff, 0xfff3b0, 0xffe16b], blendMode: 'ADD' }).setDepth(60);
    this.time.delayedCall(700, () => p.destroy());
  }
  sparkleAt2(x, y) {
    const p = this.add.particles(x, y, 'star', { speed: { min: 40, max: 150 }, angle: { min: 0, max: 360 }, scale: { start: 1.2, end: 0 }, lifespan: 600, quantity: 10, tint: [0xffffff, 0xfff3b0, 0xffe16b], blendMode: 'ADD' }).setScrollFactor(0).setDepth(130);
    this.time.delayedCall(650, () => p.destroy());
  }
  burstStars(x, y, n = 10) {
    const p = this.add.particles(x, y, 'star', { speedY: { min: -260, max: -90 }, speedX: { min: -130, max: 130 }, gravityY: 420, scale: { start: 1.6, end: 0.2 }, lifespan: 1000, quantity: n, tint: [0xf87171, 0xfbbf24, 0x4ade80, 0x60a5fa, 0xec4899], rotate: { min: 0, max: 360 } }).setDepth(60);
    this.time.delayedCall(1100, () => p.destroy());
  }

  // ============================================================ WINNEN + LEVEL-KETTING
  win() {
    if (this.won) return; this.won = true;
    this.goal.reached = true;
    this.goal.disc.setFillStyle(sig(this.goal.value));
    this.tweens.add({ targets: this.goal, scale: 1.2, duration: 200, yoyo: true, repeat: 2 });
    confettiBurst(this, 200); this.cameraPunch(0.05, 7); SFX.win(); Voice.cue('cheer');

    const L = this.level;
    const hasNext = !!LEVELS[this.levelIndex + 1];
    const R = L.reward || {};
    this.time.delayedCall(700, () => {
      showReward(this, {
        title: R.title || 'Level gehaald! 🏆',
        subtitle: R.subtitle || 'Goed gedaan!',
        stars: R.stars || 3,
        medal: R.medal, medalLabel: R.medalLabel,
        buttonText: hasNext ? 'Volgend level ▶' : 'Nog een keer! 🔄',
        onClose: () => {
          if (hasNext) this.scene.restart({ levelIndex: this.levelIndex + 1 });
          else this.scene.restart({ levelIndex: this.levelIndex });
        },
      });
    });
  }

  // ============================================================ UPDATE
  update(time, delta) {
    if (this.mode !== 'explore' || this.won) return;
    const p = this.player, body = p.body;
    const onFloor = body.blocked.down || body.touching.down;
    if (onFloor) {
      this.lastGroundAt = time; this.jumpsUsed = 0;
      if (this.solidlyGrounded()) this.checkpoint = { x: p.x, y: p.y - 4 };
    }

    // Horizontale beweging (touch of toetsenbord)
    let dir = this.moveDir;
    if (this.cursors.left.isDown) dir = -1;
    else if (this.cursors.right.isDown) dir = 1;
    body.setVelocityX(dir * MOVE_SPEED);
    if (dir !== 0) p.art.scaleX = dir;

    // Springen: coyote-time + jump-buffer + eventueel dubbelsprong
    if (Phaser.Input.Keyboard.JustDown(this.keySpace) || (this.cursors.up && Phaser.Input.Keyboard.JustDown(this.cursors.up))) {
      this.jumpBufferedAt = time;
    }
    const wantJump = (time - this.jumpBufferedAt) < BUFFER_MS;
    const maxJumps = this.powers.doubleJump ? 2 : 1;
    const coyoteOk = (time - this.lastGroundAt) < COYOTE_MS;
    if (wantJump && this.jumpsUsed < maxJumps && (this.jumpsUsed > 0 || coyoteOk)) {
      this.jumpBufferedAt = -9999;
      const second = this.jumpsUsed > 0;
      this.jumpsUsed += 1;
      body.setVelocityY(-(JUMP_BASE + (this.playerValue - 1) * JUMP_PER_LEVEL));
      SFX.pick(); Voice.cue(second ? 'whee' : 'jump');
      this.tweens.add({ targets: p.art, scaleX: 0.85, scaleY: 1.18, duration: 130, yoyo: true, ease: 'Quad.out' });
      if (second) this.sparkleAt(p.x, p.y + p.totalH / 2, 8);
    }

    // Loop-squash
    if (onFloor && dir !== 0) p.art.y = Math.sin(time * 0.02) * 1.5; else if (p.art.y !== 0) p.art.y *= 0.8;

    // Groei-bolletjes oppakken
    for (const pk of this.pickups) {
      if (pk.taken) continue;
      if (Math.abs(p.x - pk.x) < 46 && Math.abs(p.y - pk.y) < 60) {
        pk.taken = true; SFX.coin();
        this.tweens.add({ targets: pk, scale: 0, duration: 200, ease: 'Back.in', onComplete: () => pk.destroy() });
        this.growPlayer(pk.amount);
      }
    }

    // Puzzel-trigger: ✋-knop tonen bij de dichtstbijzijnde onopgeloste puzzel
    this.nearPuzzle = null;
    for (const pz of this.puzzles) {
      if (pz.solved) continue;
      if (Phaser.Geom.Rectangle.Contains(pz.zone, p.x, p.y) && onFloor) { this.nearPuzzle = pz; break; }
    }
    if (this.nearPuzzle) {
      this.setBuildBtnVisible(true);
      this.btnBuildLabel.setText(this.nearPuzzle.prompt);
      this.questText.setText(`Tik op ✋: ${this.nearPuzzle.prompt}`);
    } else {
      this.setBuildBtnVisible(false);
    }

    // Deuren ('wees N'): open als je exact waarde N bent en dichtbij staat
    for (const door of this.doors) {
      if (door.opened) continue;
      const dx = Math.abs(p.x - door.x);
      if (dx < 70) {
        if (this.playerValue === door.doel) this.openDoor(door);
        else {
          const need = this.playerValue < door.doel ? 'Word groter!' : 'Word kleiner!';
          door.hintText.setText(need);
          this.questText.setText(`Wees ${door.doel} om de deur te openen — ${need}`);
        }
      } else if (door.hintText.text !== `Wees ${door.doel}!`) {
        door.hintText.setText(`Wees ${door.doel}!`);
      }
    }

    // Ster oppakken (ruime rechthoek: pak 'm ook al scheer je er in een boog langs)
    if (this.starPickup && !this.starPickup.taken &&
        Math.abs(p.x - this.starPickup.x) < 50 && Math.abs(p.y - this.starPickup.y) < 62) {
      this.starPickup.taken = true;
      addStars(1); this.starText.setText(`${getStars()}`);
      this.tweens.add({ targets: this.starText, scale: 1.4, duration: 200, yoyo: true });
      SFX.sparkle(); Voice.cue('star'); this.burstStars(this.starPickup.x, this.starPickup.y, 10);
      this.tweens.add({ targets: this.starPickup, scale: 0, angle: 200, duration: 250, ease: 'Back.in', onComplete: () => this.starPickup.destroy() });
    }

    // Doel-vlag halen (ruime rechthoek: de vlag is hoog, en je waarde/hoogte
    // wisselt — dus niet afhankelijk maken van je precieze midden-hoogte)
    if (!this.goal.reached && Math.abs(p.x - this.goal.x) < 48 && Math.abs(p.y - this.goal.y) < 100) {
      this.win();
    }

    // In een kloof gevallen → zacht terug naar checkpoint
    if (p.y > this.level.killY) this.respawn();

    // Grommels patrouilleren
    for (const gr of this.grommels) {
      if (!gr.alive) continue;
      const [lo, hi] = gr.def.patrol;
      if (gr.x <= lo) gr.dir = 1; else if (gr.x >= hi) gr.dir = -1;
      gr.body.setVelocityX(gr.dir * 55);
      gr.art.scaleX = gr.dir;
    }

    // Wolken driften
    for (const c of this.clouds) { c.x += c.driftSpeed * (delta / 1000); if (c.x > this.level.worldW + 80) c.x = -80; }
  }
}
