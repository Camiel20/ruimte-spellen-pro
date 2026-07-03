import Phaser from 'phaser';
import { SFX, initAudio } from '../sound.js';
import { Voice } from '../voice.js';
import { startMusic, muziekVoorTerrein } from '../music.js';
import { confettiBurst, showReward } from '../reward.js';
import { addStars, getStars, markLevelDone, setAdventureCurrent, getAdventureCurrent, heeftGoudenNul, markGoudenNul, telGoudenNullen } from '../progress.js';
import { sig, lighten, darker } from '../adventure/palette.js';
import BuildOverlay from '../adventure/BuildOverlay.js';
import { drawCubeStack, addNumberDisc, addFeet, makeSleepingFriend, drawAwakeFriendInto } from '../adventure/art.js';
import { buildBackground, buildWater, buildPlatforms } from '../adventure/terrain.js';
import { drawGrommelArt, recolorGrommelArt } from '../adventure/enemyArt.js';
import { bossLook } from '../adventure/bossRegistry.js';
import { SYSTEMS } from '../adventure/systems/index.js';
// LET OP: het bestand heet 'maatje.js' en niet 'nul.js' — NUL is een
// gereserveerde apparaatnaam op Windows (git kan zo'n bestand niet openen!).
import { buildNul, updateNul } from '../adventure/maatje.js';
import { CELL, PW, MOVE_SPEED, JUMP_BASE, JUMP_PER_LEVEL, COYOTE_MS, BUFFER_MS } from '../adventure/constants.js';
import { LEVELS } from '../levels/index.js';

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

export default class AdventureScene extends Phaser.Scene {
  constructor() { super('Adventure'); }

  create(data) {
    initAudio();

    // Welk level? Expliciet meegegeven (wereldkaart/level-ketting) wint;
    // anders hervatten waar je gebleven was ("verder spelen"); anders 1-1.
    if (data && data.levelIndex != null) {
      this.levelIndex = data.levelIndex;
    } else {
      const cur = getAdventureCurrent();
      const idx = cur ? LEVELS.findIndex((l) => l.id === cur) : -1;
      this.levelIndex = idx >= 0 ? idx : 0;
    }
    this.level = LEVELS[this.levelIndex] || LEVELS[0];
    setAdventureCurrent(this.level.id); // onthoud waar we zijn (ook na app-sluiten)
    const L = this.level;
    // avontuur-deuntje in de klankkleur van deze wereld
    startMusic('adventure', muziekVoorTerrein(L.terrain));

    this.mode = 'explore';
    this.playerValue = L.startValue || 1;
    // Checkpoint bewaart de VOETEN-positie (bottom), niet het midden: de
    // spelerhoogte verandert (groeien/krimpen) en met een midden-positie kwam
    // een gegroeide speler tot z'n knieën in de grond terecht → val-lus.
    this.checkpoint = { x: L.start.x, bottom: L.start.y + ((L.startValue || 1) * CELL) / 2 };
    this.invulnUntil = 0;
    this.lastGroundAt = -9999;
    this.jumpBufferedAt = -9999;
    this.jumpsUsed = 0;
    this.powers = {
      doubleJump: !!L.startDoubleJump,
      stamp: !!L.startStamp,
      duw: !!L.startDuw,   // kracht van Vier (W2): zware kisten schuiven
      mega: !!L.startMega, // tien-kracht (W3): door grauwe muren rammen
    };
    this.won = false;
    this.rekenFouten = 0; // foutloos rekenen = extra ster bij de vlag

    // Phaser HERGEBRUIKT scene-instanties: alles wat vorige potjes op `this`
    // zetten leeft nog (als kapotte referenties). Expliciet resetten, anders
    // weigert bv. confirmExit ("dialoog staat al open") na één keer gebruiken.
    this.exitPanel = null;
    this.nearPuzzle = null;
    this.powerBadges = [];
    this.buildUI = new BuildOverlay(this); // verse bouw-overlay per potje (eigen staat)

    this.cameras.main.setBounds(0, 0, L.worldW, L.worldH);
    this.physics.world.setBounds(0, 0, L.worldW, L.worldH);
    // Onderkant OPEN: anders "staat" een lange speler (waarde 4-5) op de
    // onzichtbare wereldbodem in zee, nét boven killY → geen respawn.
    this.physics.world.setBoundsCollision(true, true, true, false);

    buildBackground(this, L);
    buildWater(this, L);
    buildPlatforms(this, L);
    this.buildGrauwWaas(L);
    this.buildPickups(L);
    this.buildPuzzles(L);
    this.buildDoors(L);
    // Alle optionele mechanics (tel-wolken, geef-platen, vraagmuren, chases,
    // maan-zones, raket, portalen) leven als SYSTEMEN in adventure/systems/ —
    // de scene loopt er generiek overheen en kent hun binnenkant niet.
    SYSTEMS.forEach((sys) => sys.build(this, L));
    this.buildBreakables(L);
    this.buildBoss(L);
    this.buildGrommels(L);
    this.buildStar(L);
    this.buildGoudenNul(L);
    this.buildGoal(L);
    this.buildPlayer(L);
    SYSTEMS.forEach((sys) => { if (sys.afterPlayer) sys.afterPlayer(this); });
    this.buildCheckpointFlag(L);
    buildNul(this); // je maatje zweeft met je mee
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
  // ============================================================ GROEI-BOLLETJES
  buildPickups(L) {
    this.pickups = [];
    (L.pickups || []).forEach((p) => this.makePickup(p));
  }

  makePickup(p) {
    const c = this.add.container(p.x, p.y).setDepth(5);
    const glow = this.add.circle(0, 0, 15, 0xfff3b0, 0.5);
    const ball = this.add.circle(0, 0, 10, 0xffe16b).setStrokeStyle(3, 0xf6a723);
    const plus = this.add.text(0, 0, `+${p.amount || 1}`, { fontFamily: 'Arial Black, Arial', fontSize: '13px', fontStyle: 'bold', color: '#7a4f10' }).setOrigin(0.5);
    c.add([glow, ball, plus]);
    c._plus = plus; // zodat zelf-splitsen de waarde kan ophogen (+1 → +2)
    c.amount = p.amount || 1; c.taken = false; c.regen = !!p.regen; // regen = magisch: groeit terug
    this.tweens.add({ targets: c, y: p.y - 8, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: glow, scale: 1.3, alpha: 0.2, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.pickups.push(c);
    return c;
  }

  // ============================================================ PUZZELS (brug + redding)
  buildPuzzles(L) {
    this.puzzles = [];

    // 'brug' — leg planken over een kloof (blok-overlay tot doelgetal).
    // 'trein' — VERDEEL de blokken precies over de wagons (splitsen!).
    // Eén level mag meerdere poorten hebben (L.gate = enkel, L.gates = lijst);
    // elke poort is zelfstandig (eigen kloof, bordje, trigger-zone en blokjes).
    [L.gate, ...(L.gates || [])].filter(Boolean).forEach((G) => {
      const pz = { type: G.type || 'brug', ...G, solved: false };
      if (pz.type === 'trein') pz.doel = (G.wagons || []).reduce((s, w) => s + w, 0); // voor planken + titel
      const groundTop = L.platforms[0][1];

      // De kloof zichtbaar maken: donkere spleet.
      const chasm = this.add.graphics().setDepth(-11);
      chasm.fillStyle(G.water ? 0x3fa9e0 : 0x2a3a2a, 1); chasm.fillRect(G.gapX, groundTop, G.gapW, 200);
      if (G.water) { chasm.fillStyle(0x7fd0f0, 0.5); for (let wx = G.gapX; wx < G.gapX + G.gapW; wx += 42) chasm.fillEllipse(wx + 21, groundTop + 12, 26, 8); }

      // Bordje: het doelgetal (brug) of de wagon-verdeling (trein).
      const sign = this.add.container(G.gapX - 16, G.y - 74).setDepth(4);
      const post = this.add.graphics();
      post.fillStyle(0x9c6b3f, 1); post.fillRect(-3, 0, 6, 60);
      const bordW = pz.type === 'trein' ? 76 : 48;
      post.fillStyle(0xf3e2c0, 1); post.fillRoundedRect(-bordW / 2, -30, bordW, 40, 8);
      post.lineStyle(3, 0x9c6b3f, 1); post.strokeRoundedRect(-bordW / 2, -30, bordW, 40, 8);
      const want = this.add.text(0, -10, pz.type === 'trein' ? (G.wagons || []).join('+') : `${G.doel}`, {
        fontFamily: 'Arial Black, Arial', fontSize: pz.type === 'trein' ? '20px' : '30px', fontStyle: 'bold', color: '#16202b',
      }).setOrigin(0.5);
      sign.add([post, want]);
      this.tweens.add({ targets: sign, y: G.y - 80, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      pz.sign = sign;
      pz.zone = new Phaser.Geom.Rectangle(G.triggerX, groundTop - 120, G.triggerW, 160);
      pz.prompt = pz.type === 'trein' ? 'Vul de trein!' : 'Bouw de brug!';
      pz.onSolve = () => this.solveBridge(pz);
      this.puzzles.push(pz);
    });

    // 'redding' — help een gevallen Numberblock; geeft een kracht
    (L.rescues || []).forEach((R) => {
      const pz = { type: 'redding', ...R, solved: false };
      pz.friend = makeSleepingFriend(this, R.x, R.y, R.doel);
      pz.zone = new Phaser.Geom.Rectangle(R.x - 55, R.y - 130, 110, 170);
      pz.prompt = `Help ${R.name || 'het vriendje'}!`;
      pz.onSolve = () => this.reviveFriend(pz);
      this.puzzles.push(pz);
    });
  }

  // Een grijs, "uit elkaar gevallen" vriendje dat op redding wacht.
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
    this.vierMijlpaal(door.x);
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
    this.bossWaves = []; // rollende golven van de Golf-Baas (look: 'golf')
    if (!L.boss) return;
    const B = L.boss, groundTop = L.platforms[0][1];
    // Blokkade tot bovenaan het scherm: ook met dubbelsprong + groei (waarde 5
    // springt ~400px) kun je NIET over de baas heen — verslaan is de enige weg.
    const topY = 40, h = groundTop - topY, w = 90;
    const body = this.add.rectangle(B.x, topY + h / 2, w, h, 0x000000, 0);
    this.physics.add.existing(body, true);
    this.bossGroup.add(body);

    // Elke wereld z'n eigen baas: alles (art, projectiel, blij-worden) komt
    // uit de baas-registry — nieuwe baas = één entry in bossRegistry.js.
    const art = bossLook(B.look).draw(this, B.x, groundTop);
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

  bossStageReact(pz) {
    const c = pz.bossArt;
    c.bubbleText.setText(`${pz.doel}`);
    this.tweens.add({ targets: c, scaleX: 1.12, scaleY: 0.86, duration: 130, yoyo: true, repeat: 1, ease: 'Quad.out' });
    this.sparkleAt(c.x, c.y, 12); SFX.combine(pz.doel);
    const left = pz.stages.length - pz.stageIndex;
    this.questText.setText(`De Baas wankelt! Nog ${left}× — bouw de ${pz.doel}`);
    this.vierMijlpaal(pz.bossArt.x);

    // Schiet de baas terug? Na fase 1 één projectiel, daarna twee — spring
    // eroverheen. Zolang ze rollen kun je niet bouwen (cooldown).
    if (bossLook(pz.look).projectile) {
      const n = Math.min(pz.stageIndex, 2);
      pz.cooldownUntil = this.time.now + 420 + n * 950 + 800;
      for (let i = 0; i < n; i++) {
        this.time.delayedCall(420 + i * 950, () => { if (!pz.solved && this.mode === 'explore') this.spawnBossWave(pz); });
      }
    }
  }

  // ============================================================ GOLVEN (Golf-Baas-aanval)
  spawnBossWave(pz) {
    const groundTop = this.level.platforms[0][1];
    const look = bossLook(pz.look);
    const c = look.projectile(this, pz.bossArt.x - 84, groundTop);
    this.physics.add.existing(c);
    c.body.setAllowGravity(false);
    c.body.setSize(44, 30); c.body.setOffset(-22, -30);
    c.body.setVelocityX(look.speed); // per baas: latere werelden schieten sneller
    c.stopX = Math.max(60, pz.bossArt.x - 820); // dooft vanzelf uit na ±800px
    this.tweens.add({ targets: c, scaleY: 1.12, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.bossWaves.push(c);
    SFX.split(); this.sparkleAt(c.x, groundTop - 22, 6);
    this.questText.setText(look.waarschuwing);
  }

  splashWave(i) {
    const w = this.bossWaves[i];
    this.bossWaves.splice(i, 1);
    this.sparkleAt(w.x, w.y - 16, 8);
    w.destroy();
  }

  clearBossWaves() {
    while (this.bossWaves.length) this.splashWave(0);
  }

  defeatBoss(pz) {
    const c = pz.bossArt;
    pz.bossBody.body.enable = false; this.bossGroup.remove(pz.bossBody, false, false);
    this.clearBossWaves();
    this.tweens.killTweensOf(c); // stop dein-/wiebel-tweens zodat de win-animatie niet vecht
    bossLook(pz.look).happy(this, c, pz); // elke baas z'n eigen blije gedaante
    if (c.bubble) this.tweens.add({ targets: c.bubble, scale: 0, alpha: 0, duration: 300, ease: 'Back.in', onComplete: () => c.bubble.destroy() });
    confettiBurst(this, 150); this.cameraPunch(0.05, 7); SFX.yay(); Voice.cue('cheer'); this.burstStars(c.x, c.y - 20, 16);
    this.tweens.add({ targets: c, y: c.y - 30, duration: 250, yoyo: true, repeat: 3, ease: 'Sine.inOut' });
    this.questText.setText('Baas verslagen! Ren naar de vlag! 🚩');
    this.vierMijlpaal(c.x);
  }

  // ============================================================ GROMMELS
  buildGrommels(L) {
    this.grommels = [];
    (L.grommels || []).forEach((def) => this.grommels.push(this.makeGrommel(def)));
  }

  makeGrommel(def) {
    const c = this.add.container(def.x, def.y).setDepth(8);
    const art = this.add.container(0, 0);
    drawGrommelArt(this, art, def.type); // springer = oranje veren, vlieger = vleugels
    c.add(art);
    c.art = art; c.def = def; c.alive = true; c.dir = 1;

    this.physics.add.existing(c);
    c.body.setSize(32, 30); c.body.setOffset(-16, -14);
    // vliegers zweven (geen zwaartekracht); de rest loopt op de grond
    c.body.setAllowGravity(def.type !== 'vlieger');
    // idle: vliegers flapperen snel, lopers wiebelen rustig
    this.tweens.add({
      targets: art, scaleY: def.type === 'vlieger' ? 1.12 : 1.06,
      duration: def.type === 'vlieger' ? 240 : 700, yoyo: true, repeat: -1, ease: 'Sine.inOut',
    });
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

  // ============================================================ GOUDEN NUL (geheim!)
  // Zeldzaam, goed verstopt: een grote gouden 0. Verzamel er genoeg en de
  // geheime Nul-wereld opent op de kaart. Al gevonden = een stil aandenken.
  buildGoudenNul(L) {
    this.goudenNul = null;
    if (!L.goudenNul) return;
    const al = heeftGoudenNul(L.id);
    const c = this.add.container(L.goudenNul.x, L.goudenNul.y).setDepth(6);
    const g = this.add.graphics();
    g.fillStyle(0xfff3b0, 0.35); g.fillCircle(0, 0, 26);
    g.lineStyle(9, 0xf6c624, 1); g.strokeEllipse(0, 0, 30, 40);
    g.lineStyle(2.5, 0xb98d12, 1); g.strokeEllipse(0, 0, 40, 50); g.strokeEllipse(0, 0, 20, 30);
    c.add(g);
    if (al) {
      c.setAlpha(0.3); c.taken = true; // al gevonden — blijft als aandenken staan
    } else {
      c.taken = false;
      this.tweens.add({ targets: c, angle: 8, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.tweens.add({ targets: c, scale: 1.12, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    this.goudenNul = c;
  }

  // ============================================================ DOEL-VLAG
  buildGoal(L) {
    const c = this.add.container(L.goal.x, L.goal.y).setDepth(6);
    const pole = this.add.graphics();
    pole.fillStyle(0xcfd6dd, 1); pole.fillRect(-3, -70, 6, 150);
    pole.fillStyle(0xffffff, 0.6); pole.fillRect(-3, -70, 2, 150);
    c.add(pole);
    const disc = this.add.circle(0, -48, 30, 0xbfc4c9).setStrokeStyle(4, 0x16202b);
    // driecijferige doelen (100!) iets kleiner, zodat ze in de schijf passen
    const num = this.add.text(0, -48, `${L.goal.value}`, { fontFamily: 'Arial Black, Arial', fontSize: L.goal.value >= 100 ? '23px' : '34px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
    c.add([disc, num]);
    c.disc = disc; c.num = num; c.value = L.goal.value; c.reached = false;
    this.tweens.add({ targets: c, y: L.goal.y - 6, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.goal = c;

    // Missie-level ('grommels'): de vlag zit op SLOT tot alle Grommels zijn
    // teruggekleurd — een jacht-level i.p.v. een bouw-level.
    this.goalLocked = L.missie === 'grommels';
    if (this.goalLocked) {
      const lock = this.add.graphics();
      lock.fillStyle(0x565b61, 1); lock.fillRoundedRect(-9, -6, 18, 14, 3);
      lock.lineStyle(3.5, 0x565b61, 1); lock.beginPath(); lock.arc(0, -7, 7, Math.PI, 2 * Math.PI); lock.strokePath();
      lock.y = -96;
      c.add(lock);
      c.lock = lock;
    }
  }

  // Alle Grommels blij? → slot van de vlag af (missie-levels).
  checkGrommelMissie() {
    if (!this.goalLocked || this.level.missie !== 'grommels') return;
    const left = this.grommels.filter((g) => g.alive).length;
    if (left > 0) {
      this.questText.setText(`Goed zo! Nog ${left} Grommel${left === 1 ? '' : 's'} te gaan 🎨`);
      return;
    }
    this.goalLocked = false;
    SFX.fanfare(); Voice.cue('cheer'); confettiBurst(this, 120);
    if (this.goal.lock) this.tweens.add({ targets: this.goal.lock, alpha: 0, scale: 2, duration: 400, onComplete: () => this.goal.lock.destroy() });
    this.goal.disc.setFillStyle(sig(this.goal.value));
    this.tweens.add({ targets: this.goal, scale: 1.15, duration: 200, yoyo: true, repeat: 2 });
    this.questText.setText('Alle Grommels blij! Ren naar de vlag! 🚩');
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
    // (De kopstoot-overlap van de antwoord-blokken registreert het
    // vraagmuren-systeem zelf via zijn afterPlayer-hook.)
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

    // Tik op jezelf = een blokje afsplitsen (−1). Zo kun je bij een
    // "wees N"-deur nooit vastlopen omdat je te groot bent.
    this.player.setInteractive(new Phaser.Geom.Rectangle(-PW / 2 - 10, -this.player.totalH / 2 - 10, PW + 20, this.player.totalH + 20), Phaser.Geom.Rectangle.Contains);
    this.player.on('pointerdown', () => this.splitsZelf());
  }

  // Zelf-splitsen: −1 blokje, dat als gewoon groei-bolletje naast je blijft
  // liggen — dus per ongeluk of te ver gekrompen? Pak het gewoon weer op.
  // (Het GDD-werkwoord "splitsen": word kleiner wanneer JIJ dat wilt.)
  splitsZelf() {
    if (this.mode !== 'explore' || this.won || this.playerValue <= 1) return;
    const onFloor = this.player.body.blocked.down || this.player.body.touching.down;
    if (!onFloor) return; // niet midden in een sprong
    if (this._zelfSplitsAt && this.time.now < this._zelfSplitsAt) return;
    this._zelfSplitsAt = this.time.now + 650; // rustig aan: één blokje per tik

    this.playerValue -= 1;
    this.laatsteVoortgang = this.time.now;
    const bottom = this.player.body.bottom;
    this.drawPlayer();
    // BELANGRIJK: bij een dynamisch lichaam is de BODY de baas over de
    // positie. Alleen container.y zetten (drawPlayer) is niet genoeg — dan
    // blijf je op de oude, hogere body-positie in de lucht "staan".
    this.player.setPosition(this.player.x, bottom - this.player.totalH / 2);
    this.player.body.reset(this.player.x, this.player.y);
    SFX.split(); Voice.cue('whee');
    this.tweens.add({ targets: this.player.art, scaleX: 1.2, scaleY: 0.85, duration: 120, yoyo: true, ease: 'Quad.out' });

    // Het blokje blijft naast je liggen. Tik je vaker? Dan groeit hetzelfde
    // bolletje mee (+1 → +2 → +3) i.p.v. een regen aan losse muntjes.
    const bestaand = this.pickups.find((pk) => pk._zelf && !pk.taken
      && Math.abs(pk.x - this.player.x) < 110 && Math.abs(pk.y - (bottom - 28)) < 80);
    if (bestaand) {
      bestaand.amount += 1;
      bestaand._plus.setText(`+${bestaand.amount}`);
      this.tweens.add({ targets: bestaand, scale: 1.25, duration: 140, yoyo: true, ease: 'Quad.out' });
    } else {
      const dir = this.player.art.scaleX >= 0 ? -1 : 1;
      const px = Phaser.Math.Clamp(this.player.x + dir * 60, 30, this.level.worldW - 30);
      const pk = this.makePickup({ x: px, y: bottom - 28, amount: 1 });
      pk._zelf = true;
      pk.setScale(0.3);
      this.tweens.add({ targets: pk, scale: 1, duration: 260, ease: 'Back.out' });
    }
    this.sparkleAt(this.player.x, bottom - 40, 6);
    this.questText.setText(`${this.playerValue + 1} − 1 = ${this.playerValue} — het blokje blijft voor je liggen!`);
  }

  drawPlayer() {
    const v = this.playerValue;
    const art = this.player.art;
    art.removeAll(true);
    // Eén is rood; groeien houdt de rode identiteit.
    const { top, totalH } = drawCubeStack(this, art, v, { w: PW, cell: CELL, color: sig(1) });
    addFeet(this, art, darker(sig(1), 40), PW, totalH);
    addNumberDisc(this, art, v, top - 9, 13, '17px');

    const body = this.player.body;
    const oldBottom = body ? (this.player.y - body.height / 2 + body.height) : null;
    body.setSize(PW, totalH);
    body.setOffset(-PW / 2, -totalH / 2);
    if (oldBottom != null) this.player.y = oldBottom - totalH / 2;
    this.player.totalH = totalH;
    // tik-gebied meegroeien met de nieuwe lengte (voor zelf-splitsen)
    if (this.player.input) {
      this.player.input.hitArea.setTo(-PW / 2 - 10, -totalH / 2 - 10, PW + 20, totalH + 20);
    }
  }

  growPlayer(amount) {
    this.playerValue += amount;
    this.laatsteVoortgang = this.time.now; // voortgang: Nul hoeft niet te wijzen
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
    this.refreshPowerBadges(); // toon de krachten waarmee je dit level begint
    this.tweens.add({ targets: bt, scale: 1.14, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: blabel, y: by - 54, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  setBuildBtnVisible(v) {
    if (this.btnBuildParts) this.btnBuildParts.forEach((o) => o.setVisible(v));
  }

  // "Stoppen?"-bevestiging bij de terugknop: voorkomt dat een misklik het hele
  // level weggooit. Iconen i.p.v. tekst: 🗺️ = naar de kaart, ▶ = verder spelen.
  confirmExit() {
    if (this.mode !== 'explore' || this.exitPanel) return;
    this.physics.pause();
    const W = this.scale.width, H = this.scale.height;
    const panel = this.add.container(0, 0).setScrollFactor(0).setDepth(210);
    this.exitPanel = panel;
    const dim = this.add.graphics();
    dim.fillStyle(0x0a1420, 0.7); dim.fillRect(0, 0, W, H);
    dim.setInteractive(new Phaser.Geom.Rectangle(0, 0, W, H), Phaser.Geom.Rectangle.Contains);
    const box = this.add.graphics();
    box.fillStyle(0xffffff, 1); box.fillRoundedRect(W / 2 - 150, H / 2 - 105, 300, 190, 22);
    box.lineStyle(5, 0x1f2d3a, 1); box.strokeRoundedRect(W / 2 - 150, H / 2 - 105, 300, 190, 22);
    const t = this.add.text(W / 2, H / 2 - 62, 'Stoppen?', {
      fontFamily: 'Arial Black, Arial', fontSize: '26px', fontStyle: 'bold', color: '#16202b',
    }).setOrigin(0.5);
    panel.add([dim, box, t]);

    const mkBtn = (x, col, edge, icon, cb) => {
      const g = this.add.graphics();
      g.fillStyle(col, 1); g.fillCircle(x, H / 2 + 14, 42);
      g.lineStyle(4, edge, 1); g.strokeCircle(x, H / 2 + 14, 42);
      const ic = this.add.text(x, H / 2 + 14, icon, { fontSize: '34px' }).setOrigin(0.5);
      const hit = this.add.circle(x, H / 2 + 14, 48, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
      hit.on('pointerdown', cb);
      panel.add([g, ic, hit]);
    };
    // verder spelen (groen, rechts) & stoppen naar de kaart (blauw, links)
    mkBtn(W / 2 - 75, 0x38b6cf, 0x1f7a9e, '🗺️', () => { SFX.click(); this.scene.start('WorldMap'); });
    mkBtn(W / 2 + 75, 0x2fae4e, 0x1f7a36, '▶', () => {
      SFX.click();
      panel.destroy(); this.exitPanel = null; this.physics.resume();
    });
  }

  buildHud() {
    const back = this.add.graphics().setScrollFactor(0).setDepth(60);
    back.fillStyle(0x16202b, 0.42); back.fillRoundedRect(10, 12, 48, 34, 11);
    back.fillStyle(0xffffff, 1); back.fillTriangle(38, 18, 38, 40, 22, 29); back.fillRect(38, 25, 12, 8);
    back.setInteractive(new Phaser.Geom.Rectangle(10, 12, 48, 34), Phaser.Geom.Rectangle.Contains);
    back.on('pointerdown', () => { SFX.click(); this.confirmExit(); });

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
    // Meerdere rijen: met 25+ levels past één rij niet meer op 480px breed.
    const perRow = 14, rowH = 25;
    const chipW = (W - 24) / perRow;
    const rows = Math.ceil(LEVELS.length / perRow);
    const yTop = this.scale.height - 22 - (rows - 1) * rowH;

    const strip = this.add.graphics().setScrollFactor(0).setDepth(90);
    strip.fillStyle(0x16202b, 0.55);
    strip.fillRoundedRect(6, yTop - 14, W - 12, rows * rowH + 6, 10);

    LEVELS.forEach((lvl, i) => {
      const active = i === this.levelIndex;
      const cx = 12 + (i % perRow) * chipW + chipW / 2;
      const cy = yTop + Math.floor(i / perRow) * rowH;
      const chip = this.add.text(cx, cy, lvl.id, {
        fontFamily: 'Arial Black, Arial', fontSize: '11px', fontStyle: 'bold',
        color: active ? '#16202b' : '#ffffff',
        backgroundColor: active ? '#ffe16b' : '#2b3d52',
        padding: { x: 4, y: 3 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(91).setInteractive({ useHandCursor: true });
      chip.on('pointerdown', () => {
        SFX.click();
        this.scene.restart({ levelIndex: i });
      });
    });

    this.add.text(8, yTop - 25, 'DEV', {
      fontFamily: 'Arial Black, Arial', fontSize: '10px', fontStyle: 'bold', color: '#ffe16b',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(91);
  }

  // ============================================================ BOUW-MODUS
  // De hele bouw-overlay (paneel, blokken, samenvoegen/splitsen, hints,
  // telmoment) leeft in adventure/BuildOverlay.js. De ✋-knop roept dit aan.
  enterBuild() { this.buildUI.enter(); }

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
    this.vierMijlpaal(G.gapX + G.gapW / 2);
  }

  // ============================================================ VRIENDJE REDDEN → KRACHT
  reviveFriend(pz) {
    const f = pz.friend;
    if (f.bubble) this.tweens.add({ targets: f.bubble, scale: 0, alpha: 0, duration: 250, ease: 'Back.in', onComplete: () => f.bubble.destroy() });
    drawAwakeFriendInto(this, f, pz.doel, sig(pz.doel)); // kleur terug + blij
    confettiBurst(this, 100); this.cameraPunch(); SFX.yay(); Voice.cue('cheer');
    this.burstStars(f.x, f.y - 10, 12);
    this.tweens.add({ targets: f, y: f.y - 24, duration: 220, yoyo: true, repeat: 2, ease: 'Sine.inOut' });
    this.vierMijlpaal(f.x);

    if (pz.gives) this.grantPower(pz.gives, pz.name || `de ${pz.doel}`);
  }

  grantPower(power, who) {
    this.powers[power] = true;
    this.refreshPowerBadges(true);
    const NAMEN = {
      doubleJump: 'DUBBELSPRONG! Spring 2× 🦘',
      stamp: 'STAMPEN! Spring op kratten 💥',
      duw: 'DUWEN! Schuif zware kisten 💪',
      mega: 'TIEN-KRACHT! Ram door grauwe muren 🔟',
    };
    SFX.fanfare();
    this.questText.setText(`Nieuwe kracht van ${who}: ${NAMEN[power] || power}`);
    this.vierNieuweKracht(power, who);
  }

  // Een nieuwe kracht is een FEEST (Kirby-regel): groot stralen-banner met
  // icoon en naam, confetti, camera-tik — niet alleen een regeltje tekst.
  vierNieuweKracht(power, who) {
    const W = this.scale.width, H = this.scale.height;
    const ICOON = { doubleJump: '🦘', stamp: '💥', duw: '💪', mega: '🔟' };
    const NAAM = { doubleJump: 'DUBBELSPRONG', stamp: 'STAMP-KRACHT', duw: 'DUW-KRACHT', mega: 'TIEN-KRACHT' };
    const c = this.add.container(W / 2, H / 2 - 70).setScrollFactor(0).setDepth(200).setScale(0);
    const stralen = this.add.graphics();
    stralen.fillStyle(0xffe16b, 0.35);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      stralen.fillTriangle(0, 0, Math.cos(a - 0.09) * 215, Math.sin(a - 0.09) * 215, Math.cos(a + 0.09) * 215, Math.sin(a + 0.09) * 215);
    }
    c.add(stralen);
    c.add(this.add.circle(0, -10, 64, 0xffffff).setStrokeStyle(6, 0xf6a723));
    c.add(this.add.text(0, -12, ICOON[power] || '⭐', { fontSize: '54px' }).setOrigin(0.5));
    c.add(this.add.text(0, 80, 'NIEUWE KRACHT!', {
      fontFamily: 'Arial Black, Arial', fontSize: '27px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setStroke('#b45309', 8));
    c.add(this.add.text(0, 114, `${NAAM[power] || power} — van ${who}!`, {
      fontFamily: 'Arial Black, Arial', fontSize: '17px', fontStyle: 'bold', color: '#ffe16b',
    }).setOrigin(0.5).setStroke('#1f2d3a', 6));
    this.tweens.add({ targets: c, scale: 1, duration: 420, ease: 'Back.out' });
    this.tweens.add({ targets: stralen, angle: 40, duration: 2600 });
    confettiBurst(this, 210);
    this.cameraPunch(0.05, 6);
    this.time.delayedCall(2300, () => {
      this.tweens.add({ targets: c, scale: 0, alpha: 0, duration: 300, ease: 'Back.in', onComplete: () => c.destroy() });
    });
  }

  // Badge-rij naast de springknop: één icoontje per verdiende kracht.
  // (De oude losse ×2/💥-badges stonden op precies dezelfde plek en
  // overlapten elkaar zodra je twee krachten had.)
  refreshPowerBadges(feest = false) {
    (this.powerBadges || []).forEach((b) => b.destroy());
    this.powerBadges = [];
    const ICONEN = [['doubleJump', '×2'], ['stamp', '💥'], ['duw', '💪'], ['mega', '🔟']];
    let i = 0;
    for (const [key, icoon] of ICONEN) {
      if (!this.powers[key]) continue;
      const b = this.add.text(this.scale.width - 108 - i * 32, this.scale.height - 56, icoon, {
        fontFamily: 'Arial Black, Arial', fontSize: '14px', fontStyle: 'bold', color: '#16202b',
        backgroundColor: '#ffe16b', padding: { x: 4, y: 3 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(62);
      this.powerBadges.push(b);
      i += 1;
    }
    if (feest && this.powerBadges.length) {
      const nieuwste = this.powerBadges[this.powerBadges.length - 1];
      this.tweens.add({ targets: nieuwste, scale: 1.4, duration: 300, yoyo: true, repeat: 2, ease: 'Quad.out' });
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
      this.checkGrommelMissie(); // missie-levels: telt af naar de vlag
    } else if (this.time.now > this.invulnUntil) {
      this.shrinkPlayer(gr);
    }
  }

  recolorGrommel(gr) {
    recolorGrommelArt(this, gr.art, sig(Phaser.Math.Between(3, 7)));
    this.heart(gr.x, gr.y - 24);
    this.tweens.add({ targets: gr.art, scaleX: 1.15, scaleY: 0.85, duration: 130, yoyo: true, repeat: 2 });
  }

  shrinkPlayer(gr) {
    this.invulnUntil = this.time.now + 1100;
    SFX.shrink(); Voice.cue('oops');
    const dir = this.player.x < gr.x ? -1 : 1;
    this.player.body.setVelocity(dir * 190, -240);
    this.tweens.add({ targets: this.player.art, alpha: 0.3, duration: 110, yoyo: true, repeat: 4, onComplete: () => this.player.art.setAlpha(1) });
    this.nulReact('zorg'); // Nul schrikt met je mee

    // Tijdens een achtervolging krimp je nooit onder de 2: kleiner = lager
    // springen, en dat maakte het rennen een negatieve spiraal.
    const inChase = (this.chases || []).some((ch) => ch.actief);
    if (inChase) { this.playerValue = Math.max(2, this.playerValue - 1); this.drawPlayer(); return; }
    if (this.playerValue <= 1) this.respawn();
    else { this.playerValue -= 1; this.drawPlayer(); }
  }

  // ============================================================ CHECKPOINT-VLAGGETJE
  // Klein groen vlaggetje dat laat zíen waar je terugkomt na een val — zoals
  // Nintendo checkpoints altijd zichtbaar maakt. Het huppelt met je mee.
  buildCheckpointFlag(L) {
    const c = this.add.container(L.start.x, L.start.y).setDepth(3);
    const g = this.add.graphics();
    g.fillStyle(0xcfd6dd, 1); g.fillRect(-1.5, -34, 3, 34);
    g.fillStyle(0x2fae4e, 1); g.fillTriangle(1.5, -34, 1.5, -20, 20, -27);
    g.lineStyle(1.5, 0x1f7a36, 1); g.strokeTriangle(1.5, -34, 1.5, -20, 20, -27);
    c.add(g);
    this.cpFlag = c;
    this._cpFlagX = L.start.x;
    this.moveCheckpointFlag(L.start.x, L.start.y + ((L.startValue || 1) * CELL) / 2);
  }

  moveCheckpointFlag(x, bottom) {
    if (!this.cpFlag) return;
    this.cpFlag.setPosition(x - 26, bottom); // ietsje achter je, niet in de weg
    this.tweens.add({ targets: this.cpFlag, scaleY: 1.25, duration: 130, yoyo: true, ease: 'Quad.out' });
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
        if (plat._noCheckpoint) continue; // geen checkpoint op een verdwijn-wolk
        if (Math.abs(pb.top - feetY) < 10 && pb.left <= cx - halfSupport && pb.right >= cx + halfSupport) return true;
      }
    }
    return false;
  }

  respawn() {
    this.cameras.main.flash(250, 30, 40, 60);
    // Eerst het lijf op maat (waarde kan veranderd zijn), DAN plaatsen met de
    // voeten net boven de checkpoint-vloer — zo sta je nooit ín de grond
    // (diepe overlap kan Arcade Physics niet scheiden → je zakte erdoorheen).
    this.playerValue = Math.max(1, this.playerValue);
    this.drawPlayer();
    this.player.setPosition(this.checkpoint.x, this.checkpoint.bottom - this.player.totalH / 2 - 2);
    // body.reset synct de physics-body (incl. vorige-positie) met de nieuwe
    // plek en zet de snelheid op nul — geen rare separatie-sprong na teleport.
    this.player.body.reset(this.player.x, this.player.y);
    this.jumpsUsed = 0;
    this.invulnUntil = this.time.now + 800; // even op adem komen na een val
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

  // ============================================================ DE GRAUW-WAAS (grijs → kleur)
  // Baron Grauw's grijze waas ligt over het level. Elke opgeloste klus (brug,
  // deur, plaat, muur, portaal, chase, baas-fase) tilt een strook op — je
  // ZIET de kleur terugkomen terwijl je speelt (GDD-pijler 5: zichtbare
  // vooruitgang). Bij de vlag trekt de rest weg.
  buildGrauwWaas(L) {
    this.waasStroken = [];
    this.herstelTotaal = this.telHerstelKlussen(L);
    this.herstelKlaar = 0;
    const STROOK = 420;
    const n = Math.ceil(L.worldW / STROOK);
    for (let i = 0; i < n; i++) {
      const x = i * STROOK, w = Math.min(STROOK, L.worldW - x);
      const g = this.add.graphics().setDepth(30); // boven de wereld, onder de HUD
      g.fillStyle(0x8a8f96, 0.34);
      g.fillRect(x, 0, w, L.worldH);
      g._cx = x + w / 2; g._weg = false;
      this.waasStroken.push(g);
    }
  }

  telHerstelKlussen(L) {
    return [L.gate, ...(L.gates || [])].filter(Boolean).length
      + (L.rescues || []).length + (L.doors || []).length
      + (L.plates || []).length + (L.vraagMuren || []).length
      + (L.portalen || []).length + (L.achtervolgingen || []).length
      + (L.grauwMuren || []).length
      + (L.raket ? 1 : 0) + (L.boss ? L.boss.stages.length : 0);
  }

  kleurHerstel(x) {
    if (!this.waasStroken || !this.waasStroken.length || !this.herstelTotaal) return;
    this.herstelKlaar += 1;
    const doel = Math.round(this.waasStroken.length * Math.min(1, this.herstelKlaar / this.herstelTotaal));
    const al = this.waasStroken.filter((g) => g._weg).length;
    const rest = this.waasStroken.filter((g) => !g._weg);
    rest.sort((a, b) => Math.abs(a._cx - x) - Math.abs(b._cx - x)); // dichtstbij eerst
    for (let i = 0; i < doel - al && i < rest.length; i++) this.liftWaas(rest[i], i * 140);
  }

  liftWaas(g, delay = 0) {
    g._weg = true;
    this.time.delayedCall(delay, () => {
      this.sparkleAt(g._cx, 300, 8);
      this.tweens.add({ targets: g, alpha: 0, duration: 900, ease: 'Sine.inOut', onComplete: () => g.destroy() });
    });
  }

  // Elke opgeloste klus = een feestje: Nul juicht én een stuk waas trekt weg.
  vierMijlpaal(x) {
    this.nulReact('blij');
    this.kleurHerstel(x);
  }

  // Nul leeft mee: 'blij' = hupje + hartje, 'zorg' = trillen, 'ster' = pirouette.
  nulReact(soort) {
    const nul = this.nul;
    if (!nul) return;
    this.laatsteVoortgang = this.time.now;
    nul.modeNul = 'volg';
    this.tweens.killTweensOf(nul.lijf);
    nul.lijf.setPosition(0, 0); nul.lijf.angle = 0;
    if (soort === 'blij') {
      this.tweens.add({ targets: nul.lijf, y: -24, duration: 200, yoyo: true, ease: 'Quad.out' });
      this.heart(nul.x, nul.y - 32);
    } else if (soort === 'ster') {
      this.tweens.add({ targets: nul.lijf, angle: 360, duration: 500, onComplete: () => { nul.lijf.angle = 0; } });
    } else if (soort === 'zorg') {
      this.tweens.add({ targets: nul.lijf, x: 5, duration: 60, yoyo: true, repeat: 4, onComplete: () => { nul.lijf.x = 0; } });
    }
  }

  // ============================================================ WINNEN + LEVEL-KETTING
  win() {
    if (this.won) return; this.won = true;
    this.goal.reached = true;
    this.goal.disc.setFillStyle(sig(this.goal.value));
    confettiBurst(this, 200); this.cameraPunch(0.05, 7); SFX.win(); Voice.cue('cheer');

    const L = this.level;
    // finale-level: hierna komt het grote feest, geen volgend level
    const hasNext = !!LEVELS[this.levelIndex + 1] && !L.finale;
    const R = L.reward || {};

    // VERDIENDE sterren (max 3): finish + de geheime ster + foutloos gerekend.
    // Geen gratis sterren meer — de teller op de kaart betekent nu echt iets.
    const heeftSter = !!(this.starPickup && this.starPickup.taken);
    const verdiend = 1 + (heeftSter ? 1 : 0) + (this.rekenFouten === 0 ? 1 : 0);

    // De rest van de Grauw-waas trekt weg: het hele level in kleur! En Nul
    // danst een vreugdedansje naast de vlag.
    (this.waasStroken || []).filter((g) => !g._weg).forEach((g, i) => this.liftWaas(g, i * 120));
    if (this.nul) {
      this.tweens.killTweensOf(this.nul.lijf);
      this.tweens.add({ targets: this.nul.lijf, angle: 360, duration: 550, repeat: 2 });
    }

    // Voortgang vastleggen: gehaald, ster en beste sterren-score.
    markLevelDone(L.id, { ...(heeftSter ? { star: true } : {}), sterren: verdiend });
    if (hasNext) setAdventureCurrent(LEVELS[this.levelIndex + 1].id);

    // TEL-FINALE: de vlag telt hoorbaar naar zijn getal — jij maakt hem
    // compleet! Ronde tientallen tellen met sprongen van 10 (20, 30 … 100).
    const val = this.goal.value;
    const perTien = val >= 20 && val % 10 === 0;
    const stappen = perTien ? val / 10 : val;
    for (let i = 0; i < stappen; i++) {
      this.time.delayedCall(140 + i * 110, () => {
        this.goal.num.setText(`${perTien ? (i + 1) * 10 : i + 1}`);
        SFX.grow(i + 1);
        this.tweens.add({ targets: this.goal.disc, scale: 1.15, duration: 80, yoyo: true });
      });
    }
    const telKlaar = 140 + stappen * 110;
    this.tweens.add({ targets: this.goal, scale: 1.2, duration: 200, delay: telKlaar, yoyo: true, repeat: 2 });

    this.time.delayedCall(telKlaar + 520, () => {
      showReward(this, {
        title: R.title || 'Level gehaald! 🏆',
        subtitle: R.subtitle || 'Goed gedaan!',
        stars: verdiend,
        sterrenVan3: verdiend, // toont de 3 slots: wat heb je (nog niet) verdiend
        medal: R.medal, medalLabel: R.medalLabel,
        buttonText: L.finale ? 'FEEST! 🎉' : hasNext ? 'Volgend level ▶' : 'Nog een keer! 🔄',
        onClose: () => {
          if (L.finale) this.scene.start('Feest');
          else if (hasNext) this.scene.restart({ levelIndex: this.levelIndex + 1 });
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
      if (this.solidlyGrounded()) {
        this.checkpoint = { x: p.x, bottom: body.bottom };
        // vlaggetje huppelt mee zodra je een flink stuk verder bent
        if (Math.abs(this.checkpoint.x - this._cpFlagX) > 150) {
          this._cpFlagX = this.checkpoint.x;
          this.moveCheckpointFlag(this.checkpoint.x, this.checkpoint.bottom);
        }
      }
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

    // Groei-bolletjes oppakken (regen-bolletjes groeien na een paar tellen
    // terug — anti-vastloper bij de geef-platen)
    for (const pk of this.pickups) {
      if (pk.taken) continue;
      if (Math.abs(p.x - pk.x) < 46 && Math.abs(p.y - pk.y) < 60) {
        pk.taken = true; SFX.coin();
        if (pk.regen) {
          this.tweens.add({ targets: pk, scale: 0, duration: 200, ease: 'Back.in' });
          this.time.delayedCall(5000, () => {
            if (!pk.active) return;
            pk.taken = false; SFX.sparkle();
            this.tweens.add({ targets: pk, scale: 1, duration: 260, ease: 'Back.out' });
          });
        } else {
          this.tweens.add({ targets: pk, scale: 0, duration: 200, ease: 'Back.in', onComplete: () => pk.destroy() });
        }
        this.growPlayer(pk.amount);
      }
    }

    // Puzzel-trigger: ✋-knop tonen bij de dichtstbijzijnde onopgeloste puzzel.
    // (cooldownUntil: tijdens de golf-aanval van de Golf-Baas even niet bouwen —
    // eerst springen!)
    this.nearPuzzle = null;
    for (const pz of this.puzzles) {
      if (pz.solved || (pz.cooldownUntil && time < pz.cooldownUntil)) continue;
      if (Phaser.Geom.Rectangle.Contains(pz.zone, p.x, p.y) && onFloor) { this.nearPuzzle = pz; break; }
    }
    if (this.nearPuzzle) {
      // Eerste keer bij deze puzzel: vrolijk begroetings-cue (hoorbare uitnodiging).
      if (!this.nearPuzzle.cuePlayed) { this.nearPuzzle.cuePlayed = true; Voice.cue('greet'); }
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
        // Eerste keer bij de deur: het gevraagde getal klinkt (zonder lezen te snappen).
        if (!door.cuePlayed) { door.cuePlayed = true; Voice.number(door.doel); }
        if (this.playerValue === door.doel) this.openDoor(door);
        else if (this.playerValue < door.doel) {
          door.hintText.setText('Word groter!');
          this.questText.setText(`Wees ${door.doel} om de deur te openen — pak bolletjes!`);
        } else {
          // te groot → splits jezelf: tik op je eigen figuurtje (−1)
          door.hintText.setText('Tik op jezelf: −1');
          this.questText.setText(`Te groot! Tik op jezelf om een blokje af te splitsen ✂️`);
        }
      } else if (door.hintText.text !== `Wees ${door.doel}!`) {
        door.hintText.setText(`Wees ${door.doel}!`);
      }
    }

    // Alle level-systemen (tel-wolken, platen, muren, chases, maan-zones,
    // raket, portalen) — zie adventure/systems/index.js voor de volgorde.
    for (const sys of SYSTEMS) { if (sys.update) sys.update(this, time, delta); }

    // Ster oppakken (ruime rechthoek: pak 'm ook al scheer je er in een boog langs)
    if (this.starPickup && !this.starPickup.taken &&
        Math.abs(p.x - this.starPickup.x) < 50 && Math.abs(p.y - this.starPickup.y) < 62) {
      this.starPickup.taken = true;
      addStars(1); this.starText.setText(`${getStars()}`);
      this.tweens.add({ targets: this.starText, scale: 1.4, duration: 200, yoyo: true });
      SFX.sparkle(); Voice.cue('star'); this.burstStars(this.starPickup.x, this.starPickup.y, 10);
      this.tweens.add({ targets: this.starPickup, scale: 0, angle: 200, duration: 250, ease: 'Back.in', onComplete: () => this.starPickup.destroy() });
      this.nulReact('ster'); // Nul draait een blij rondje
    }

    // GOUDEN NUL gevonden?! (zeldzaam — opent de geheime Nul-wereld)
    if (this.goudenNul && !this.goudenNul.taken
      && Math.abs(p.x - this.goudenNul.x) < 52 && Math.abs(p.y - this.goudenNul.y) < 64) {
      this.goudenNul.taken = true;
      markGoudenNul(this.level.id);
      SFX.fanfare(); Voice.cue('star'); confettiBurst(this, 100);
      this.burstStars(this.goudenNul.x, this.goudenNul.y, 14);
      this.nulReact('ster');
      this.cameraPunch(0.05, 6);
      this.questText.setText(`GOUDEN NUL gevonden! ⭕ (${telGoudenNullen()} van de 6)`);
      this.tweens.add({ targets: this.goudenNul, scale: 2, alpha: 0, angle: 260, duration: 500, ease: 'Back.in' });
    }

    // Doel-vlag halen (ruime rechthoek: de vlag is hoog, en je waarde/hoogte
    // wisselt — dus niet afhankelijk maken van je precieze midden-hoogte)
    if (!this.goal.reached && Math.abs(p.x - this.goal.x) < 48 && Math.abs(p.y - this.goal.y) < 100) {
      if (this.goalLocked) {
        // missie nog niet af → vriendelijke herinnering (niet elke frame)
        if (!this._lockHintAt || time > this._lockHintAt) {
          this._lockHintAt = time + 1800;
          SFX.oops();
          this.questText.setText('Eerst alle Grommels terugkleuren! 🎨');
          this.tweens.add({ targets: this.goal, angle: 4, duration: 70, yoyo: true, repeat: 3 });
        }
      } else {
        this.win();
      }
    }

    // In een kloof gevallen → zacht terug naar checkpoint. Check op de
    // VOETEN: het midden van een lange speler (waarde 4-5) komt anders nooit
    // onder de grens uit.
    if (body.bottom > this.level.killY) this.respawn();

    // Grommels patrouilleren; springers HUPPEN (timing!) en vliegers zweven
    // in een golfbaan — stamp ze midden in de lucht.
    for (const gr of this.grommels) {
      if (!gr.alive) continue;
      const [lo, hi] = gr.def.patrol;
      if (gr.x <= lo) gr.dir = 1; else if (gr.x >= hi) gr.dir = -1;
      gr.body.setVelocityX(gr.dir * (gr.def.type === 'springer' ? 70 : gr.def.type === 'vlieger' ? 80 : 55));
      gr.art.scaleX = gr.dir;
      if (gr.def.type === 'springer' && gr.body.blocked.down && time > (gr.nextHop || 0)) {
        gr.nextHop = time + 1300 + (gr.def.x % 500); // eigen ritme per springer
        gr.body.setVelocityY(-440); // flinke hup — je ziet 'm van veraf
        this.tweens.add({ targets: gr.art, scaleY: 1.3, scaleX: gr.dir * 0.8, duration: 150, yoyo: true, ease: 'Quad.out' });
      }
      if (gr.def.type === 'vlieger') {
        gr.body.setVelocityY(Math.sin(time * 0.004 + gr.def.x) * 70);
      }
    }

    // Golven van de Golf-Baas: rollen naar links; spring eroverheen!
    for (let i = this.bossWaves.length - 1; i >= 0; i--) {
      const w = this.bossWaves[i];
      if (w.x <= w.stopX) { this.splashWave(i); continue; } // uitgedoofd
      if (time > this.invulnUntil && Math.abs(p.x - w.x) < 34 && body.bottom > w.y - 26) {
        this.splashWave(i); // raak: golf spat uiteen…
        this.shrinkPlayer(w); // …en je krimpt (zelfde straf als een Grommel)
      }
    }

    // Nul zweeft mee (of wijst naar de dichtstbijzijnde klus)
    updateNul(this, time, delta);

    // Wolken driften
    for (const c of this.clouds) { c.x += c.driftSpeed * (delta / 1000); if (c.x > this.level.worldW + 80) c.x = -80; }
  }
}
