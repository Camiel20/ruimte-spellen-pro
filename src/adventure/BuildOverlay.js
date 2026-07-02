// ===== BOUW-OVERLAY: de bouw-modus (blokjes samenvoegen/splitsen) =====
// Eigen module met eigen staat (paneel, blokken, hints, missers). De scene
// levert de wereld (physics, knoppen, puzzels) en callbacks (pz.onSolve,
// bossStageReact); dit bestand regelt alles bínnen het bouwscherm.
// Per scene-create wordt een VERSE overlay gemaakt → geen stale-state-bugs.
//
// Interactie: slepen op elkaar = samenvoegen (met hoorbaar telmoment),
// vasthouden = splitsen op de celgrens onder je vinger (getalrelatie-keuze),
// na 2 te-groot-missers of 18s gloeit een kloppend paar (hint).

import Phaser from 'phaser';
import { SFX } from '../sound.js';
import { Voice } from '../voice.js';
import { findPair, splitParts } from './logic.js';
import { sig } from './palette.js';
import { drawCubeStack, addNumberDisc } from './art.js';

export default class BuildOverlay {
  constructor(scene) {
    this.s = scene;
    this.activePuzzle = null;
    this.panel = null;
    this.blocks = [];
    this.mistakes = 0;
    this.hintRings = [];
    this.hintTimer = null;
    this.dragHandler = null;
    this.wagonSlots = [];
    this.wagonLoco = null;
  }

  // Treintje met wagon-doelen: elk wagonnetje wil precies zijn getal.
  buildWagons(pz, panel) {
    const s = this.s, W = s.scale.width;
    this.wagonSlots = [];
    const n = pz.wagons.length;
    const startX = W / 2 - ((n - 1) / 2) * 118 + 30;
    // locomotiefje vooraan (rijdt weg als alle wagons vol zijn)
    const loco = s.add.container(startX - 128, 258);
    const lg = s.add.graphics();
    lg.fillStyle(0x16202b, 1); lg.fillCircle(-18, 24, 9); lg.fillCircle(16, 24, 9);
    lg.fillStyle(0xe8402c, 1); lg.fillRoundedRect(-36, -18, 66, 40, 8);
    lg.fillStyle(0xb93227, 1); lg.fillRoundedRect(6, -44, 26, 28, 5); // cabine
    lg.fillStyle(0x5b6168, 1); lg.fillRoundedRect(-30, -40, 14, 24, 4); // schoorsteen
    lg.fillStyle(0xffe16b, 1); lg.fillCircle(-32, 0, 6); // lamp
    lg.lineStyle(3, 0x16202b, 1); lg.strokeRoundedRect(-36, -18, 66, 40, 8);
    loco.add(lg);
    panel.add(loco);
    this.wagonLoco = loco;
    pz.wagons.forEach((doel, i) => {
      const x = startX + i * 118, y = 258;
      const c = s.add.container(x, y);
      const g = s.add.graphics();
      g.fillStyle(0x5b6168, 1); g.fillRect(-58, 14, 16, 6); // koppelstang
      g.fillStyle(0x16202b, 1); g.fillCircle(-24, 26, 9); g.fillCircle(24, 26, 9); // wielen
      g.fillStyle(sig(doel), 0.35); g.fillRoundedRect(-44, -20, 88, 44, 8); // lege bak
      g.lineStyle(3.5, 0x16202b, 1); g.strokeRoundedRect(-44, -20, 88, 44, 8);
      c.add(g);
      const disc = s.add.circle(0, -40, 14, 0xffffff).setStrokeStyle(3, 0x16202b);
      const num = s.add.text(0, -40, `${doel}`, { fontFamily: 'Arial Black, Arial', fontSize: '16px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
      c.add([disc, num]);
      panel.add(c);
      this.wagonSlots.push({ doel, x, y, filled: false, art: c });
    });
  }

  fillWagon(slot, block) {
    const s = this.s;
    slot.filled = true;
    this.blocks = this.blocks.filter((b) => b !== block);
    this.cancelSplitHold(block);
    block.disableInteractive();
    SFX.correct(); Voice.number(slot.doel);
    // het blok "stapt in" de wagon (krimpt tot wagon-formaat)
    s.tweens.add({ targets: block, x: slot.x, y: slot.y - 16, scale: Math.min(0.9, 52 / block._totalH), duration: 280, ease: 'Back.out' });
    s.tweens.add({ targets: slot.art, scaleX: 1.12, scaleY: 0.9, duration: 120, yoyo: true });
    s.sparkleAt2(slot.x, slot.y);
    if (this.wagonSlots.every((sl) => sl.filled)) {
      const pz = this.activePuzzle;
      pz.solved = true;
      SFX.yay(); Voice.cue('great');
      // tsjoeke-tsjoek: de volle trein rijdt het beeld uit
      const rijders = [this.wagonLoco, ...this.wagonSlots.map((sl) => sl.art), block];
      rijders.forEach((a) => { if (a) s.tweens.add({ targets: a, x: a.x + 640, duration: 950, delay: 380, ease: 'Sine.in' }); });
      s.time.delayedCall(800, () => { this.exit(true); pz.onSolve(); });
    }
  }

  enter() {
    const s = this.s;
    if (s.mode !== 'explore' || !s.nearPuzzle || s.nearPuzzle.solved) return;
    const pz = s.nearPuzzle;
    this.activePuzzle = pz;
    s.mode = 'build';
    s.physics.pause();
    s.clearBossWaves(); // geen bevroren golf die je na het bouwen alsnog raakt
    s.player.body.setVelocity(0, 0);
    s.setBuildBtnVisible(false);
    [s.btnLeft, s.btnRight, s.btnJump].forEach((b) => { b.g.setVisible(false); b.t.setVisible(false); b.hit.disableInteractive(); });

    const W = s.scale.width, H = s.scale.height;

    // IN DE WERELD bouwen: geen donker quiz-scherm meer — de camera glijdt
    // naar de puzzelplek en de blokjes staan op de échte grond van het level.
    // (Zo vóelt rekenen als onderdeel van het avontuur, niet als een popup.)
    const cam = s.cameras.main;
    cam.stopFollow();
    s.tweens.add({
      targets: cam,
      scrollX: Phaser.Math.Clamp(pz.zone.centerX - W / 2, 0, s.level.worldW - W),
      duration: 420, ease: 'Sine.inOut',
    });
    this.groundY = s.level.platforms[0][1] - 4; // bouwvloer (schermhoogte == wereldhoogte)

    const panel = s.add.container(0, 0).setScrollFactor(0).setDepth(120);
    // klein info-banner bovenin (i.p.v. het hele scherm dimmen)
    const banner = s.add.graphics();
    banner.fillStyle(0x0a1420, 0.55); banner.fillRoundedRect(10, 44, W - 20, 152, 18);
    panel.add(banner);

    const title = s.add.text(W / 2, 70, pz.wagons ? 'Verdeel over de trein!' : `Maak de ${pz.doel}!`, {
      fontFamily: 'Arial Black, Arial', fontSize: '26px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    const hint = s.add.text(W / 2, 104, pz.wagons
      ? 'Splits (houd vast) en sleep het goede stuk op elk wagonnetje'
      : 'Sleep op elkaar = samen · houd vast = splitsen', {
      fontFamily: 'Arial', fontSize: '13px', color: '#cfe0ee',
    }).setOrigin(0.5);
    panel.add([title, hint]);

    Voice.number(pz.doel); // doelgetal klinkt — óók begrijpelijk zonder te lezen
    if (pz.wagons) {
      this.buildWagons(pz, panel);
    } else {
      const goalDisc = s.add.circle(W / 2, 160, 26, sig(pz.doel)).setStrokeStyle(4, 0x16202b);
      const goalNum = s.add.text(W / 2, 160, `${pz.doel}`, { fontFamily: 'Arial Black, Arial', fontSize: '28px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
      panel.add([goalDisc, goalNum]);
    }

    const backBtn = s.add.text(34, 68, '↩', { fontSize: '30px', color: '#ffffff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this.exit());
    panel.add(backBtn);

    this.panel = panel;
    this.blocks = [];
    this.mistakes = 0;
    this.hintRings = [];
    // Na 18s zonder oplossing vanzelf een hint laten gloeien.
    this.hintTimer = s.time.delayedCall(18000, () => this.showHint());
    // Drempel 8px: laag genoeg om vlot te slepen, hoog genoeg zodat een
    // trillende vinger tijdens VASTHOUDEN (= splitsen) geen sleep wordt.
    s.input.dragDistanceThreshold = 8;

    pz.blocks.forEach((val, i) => {
      // Trein: blokken aan de zijkanten (de wagons staan in het midden).
      const bx = pz.wagons
        ? (i % 2 === 0 ? 96 : W - 96)
        : W / 2 + (i - (pz.blocks.length - 1) / 2) * 120;
      const c = this.makeBlock(val, bx, this.groundY - 180); // valt zo op de grond
      this.settle(c);
    });

    // Sleep-handler: SCHERM-positie van de vinger (blokjes zitten in een
    // scrollFactor-0 overlay; dragX/dragY zijn wereld-coörd. → zou wegspringen).
    this.dragHandler = (p, obj) => {
      if (obj.getData && obj.getData('buildBlock')) {
        // grijp-offset: het blok volgt de vinger vanaf waar je 'm pakte
        // (geen sprong met het midden naar de vinger).
        obj.x = p.x + (obj._grabDX || 0);
        obj.y = p.y + (obj._grabDY || 0);
      }
    };
    s.input.on('drag', this.dragHandler);
  }

  exit(solved = false) {
    const s = this.s;
    if (s.mode !== 'build') return;
    s.mode = 'explore';
    s.cameras.main.startFollow(s.player, true, 0.12, 0.12); // camera terug naar de speler
    if (this.hintTimer) { this.hintTimer.remove(false); this.hintTimer = null; }
    this.clearHintRings();
    if (this.dragHandler) { s.input.off('drag', this.dragHandler); this.dragHandler = null; }
    if (this.panel) { this.panel.destroy(); this.panel = null; }
    this.blocks = [];
    this.wagonSlots = [];
    this.wagonLoco = null;
    [s.btnLeft, s.btnRight, s.btnJump].forEach((b) => { b.g.setVisible(true); b.t.setVisible(true); b.hit.setInteractive(); });
    s.physics.resume();
  }

  makeBlock(value, x, y) {
    const s = this.s;
    const c = s.add.container(x, y).setScrollFactor(0).setDepth(122);
    c.setData('buildBlock', { value });
    this.drawBlock(c, value);
    this.panel.add(c);
    this.blocks.push(c);

    // Splitsen = VASTHOUDEN (±0,4s): het blok scheurt op de celgrens onder je
    // vinger — zo kies je zélf de splitsing (7 → 5+2 of 3+4: getalrelaties!).
    // Slepen = samenvoegen. Een losse tik doet niets (voorkomt ongelukjes).
    c.on('pointerdown', (p) => { c._dragged = false; this.startSplitHold(c, p); });
    c.on('dragstart', (p) => { this.cancelSplitHold(c); c._dragged = true; c._grabDX = c.x - p.x; c._grabDY = c.y - p.y; c.setDepth(140); s.tweens.add({ targets: c, scale: 1.1, duration: 100, yoyo: true, onComplete: () => c.setScale(1.06) }); SFX.pick(); });
    c.on('dragend', () => this.drop(c));
    c.on('pointerup', () => {
      this.cancelSplitHold(c);
      if (!c._dragged) s.tweens.add({ targets: c, scale: 1.06, duration: 90, yoyo: true });
    });
    c.setScale(0.3);
    s.tweens.add({ targets: c, scale: 1, duration: 260, ease: 'Back.out' });
    return c;
  }

  drawBlock(c, value) {
    const s = this.s;
    c.removeAll(true);
    c.setData('buildBlock', { value });
    // Cellen blijven VIERKANTE kubussen: breedte == hoogte. Vol formaat (46px)
    // t/m 10; daarboven krimpen ze samen (uniform) zodat de toren blijft passen
    // (torenhoogte blijft dan constant ±460px) — nooit platgeknepen.
    const cell = Phaser.Math.Clamp(460 / value, 18, 46);
    const w = cell, sc = w / 52; // sc schaalt gezicht-/cijfer-details mee
    c._cell = cell; c._w = w; c._totalH = value * cell; // voor splits-keuze (celgrens onder de vinger)
    const { top, totalH } = drawCubeStack(s, c, value, {
      w, cell, color: sig(value),
      eyeR: 7 * sc, eyeX: 11 * sc, pupilR: 3 * sc, mouthR: 7 * sc,
    });
    addNumberDisc(s, c, value, top - 12, 12, '15px');
    // Ruim aanraakgebied: het HELE blok + flinke marge is grijpbaar (fijner op
    // touch/iOS — je hoeft niet precies op een celletje te tikken).
    c.setSize(w + 28, totalH + 52);
    c.setInteractive(new Phaser.Geom.Rectangle(-w / 2 - 14, top - 30, w + 28, totalH + 56), Phaser.Geom.Rectangle.Contains);
    s.input.setDraggable(c);
  }

  drop(moving) {
    moving.setScale(1); moving.setDepth(122);
    // Trein: eerst kijken of het blok op een wagonnetje wordt gelegd.
    const pz = this.activePuzzle;
    if (pz && pz.wagons) {
      for (const slot of this.wagonSlots) {
        if (slot.filled) continue;
        if (Phaser.Math.Distance.Between(moving.x, moving.y, slot.x, slot.y) < 90) {
          if (moving.getData('buildBlock').value === slot.doel) {
            this.fillWagon(slot, moving);
          } else {
            SFX.wrong(); Voice.cue('oops');
            this.s.tweens.add({ targets: slot.art, x: slot.x + 6, duration: 60, yoyo: true, repeat: 3 });
            this.settle(moving);
          }
          return;
        }
      }
    }
    let other = null, best = 9999;
    for (const b of this.blocks) {
      if (b === moving) continue;
      const d = Phaser.Math.Distance.Between(moving.x, moving.y, b.x, b.y);
      if (d < 70 && d < best) { best = d; other = b; }
    }
    if (other) { this.merge(moving, other); return; }
    SFX.place();
    this.settle(moving); // zachtjes terug op de grond
  }

  // Blok landt met z'n voetjes op de bouwvloer (de echte grond van het level).
  settle(c) {
    this.s.tweens.add({ targets: c, y: this.groundY - c._totalH / 2, duration: 240, ease: 'Quad.out' });
  }

  merge(moving, target) {
    const s = this.s;
    const newVal = moving.getData('buildBlock').value + target.getData('buildBlock').value;
    s.tweens.add({
      targets: moving, x: target.x, y: target.y, scale: 0.5, duration: 150, ease: 'Quad.in',
      onComplete: () => {
        this.blocks = this.blocks.filter((b) => b !== moving);
        moving.destroy();
        this.cancelSplitHold(target);
        this.clearHintRings();
        this.drawBlock(target, newVal);
        this.settle(target); // de nieuwe (hogere) toren komt netjes op de grond
        s.tweens.add({ targets: target, scaleX: 1.25, scaleY: 0.8, duration: 120, yoyo: true });
        s.sparkleAt2(target.x, target.y);

        // TELMOMENT: de cellen verschijnen één voor één met een oplopend
        // toontje (1-2-3-…) — tellen is het leermoment, niet het eindantwoord.
        const cells = target.list.slice(0, newVal); // eerste n children = cel-graphics (onder → boven)
        cells.forEach((cg) => cg.setAlpha(0));
        cells.forEach((cg, i) => s.time.delayedCall(70 + i * 75, () => {
          if (s.mode !== 'build') return;
          cg.setAlpha(1); SFX.grow(i + 1);
        }));
        s.time.delayedCall(120 + newVal * 75, () => {
          if (s.mode !== 'build') return;
          Voice.number(newVal);
          this.checkSolved(target);
        });

        // Te groot gebouwd? Na 2 missers het juiste paar laten gloeien.
        const pz = this.activePuzzle;
        if (pz && newVal > pz.doel) {
          this.mistakes += 1;
          if (this.mistakes >= 2) s.time.delayedCall(160 + newVal * 75, () => this.showHint());
        }
      },
    });
  }

  // Hulpje voor wie vastloopt: laat een kloppend paar (a + b = doel) gloeien,
  // of — als alles te groot is — het blok dat gesplitst moet worden.
  showHint() {
    const s = this.s;
    if (s.mode !== 'build' || !this.activePuzzle || this.activePuzzle.solved) return;
    if (this.activePuzzle.wagons) return; // trein heeft (nog) geen automatische hint
    this.clearHintRings();
    const doel = this.activePuzzle.doel, bs = this.blocks;
    const pair = findPair(bs.map((b) => b.getData('buildBlock').value), doel);
    let targets = pair ? [bs[pair[0]], bs[pair[1]]] : null;
    if (!targets) {
      const big = bs.find((b) => b.getData('buildBlock').value > doel);
      if (big) targets = [big]; // te groot → houd vast om te splitsen
    }
    if (!targets) return;
    SFX.sparkle(); Voice.cue('greet');
    targets.forEach((b) => {
      const ring = s.add.graphics().setScrollFactor(0).setDepth(150);
      ring.lineStyle(5, 0xffe16b, 1);
      ring.strokeRoundedRect(-(b._w / 2 + 16), -(b._totalH / 2 + 24), b._w + 32, b._totalH + 48, 16);
      ring.x = b.x; ring.y = b.y;
      this.panel.add(ring);
      this.hintRings.push(ring);
      s.tweens.add({ targets: ring, scale: 1.12, alpha: 0.45, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });
  }

  clearHintRings() {
    this.hintRings.forEach((r) => { this.s.tweens.killTweensOf(r); r.destroy(); });
    this.hintRings = [];
  }

  // ---- Splitsen door vast te houden ----
  startSplitHold(c, p) {
    const s = this.s;
    const info = c.getData('buildBlock');
    if (!info || info.value <= 1) return; // een 1 kan niet splitsen
    this.cancelSplitHold(c);
    // Celgrens het dichtst bij de vinger: k = aantal cellen ónder de scheur.
    const cell = c._cell || 40, totalH = c._totalH || info.value * cell;
    const k = Phaser.Math.Clamp(Math.round((totalH / 2 - (p.y - c.y)) / cell), 1, info.value - 1);
    c._tearK = k;
    // Scheur-indicator: gestippelde lijn die "oplaadt" terwijl je vasthoudt.
    const tearY = totalH / 2 - k * cell;
    const tg = s.add.graphics();
    tg.lineStyle(4, 0xffffff, 1);
    for (let x = -c._w / 2 + 2; x < c._w / 2 - 4; x += 10) { tg.beginPath(); tg.moveTo(x, tearY); tg.lineTo(x + 5, tearY); tg.strokePath(); }
    tg.setAlpha(0.25);
    c.add(tg);
    c._tearG = tg;
    c._tearTweens = [
      s.tweens.add({ targets: tg, alpha: 1, duration: 380, ease: 'Quad.in' }),
      s.tweens.add({ targets: c, angle: 1.8, duration: 90, yoyo: true, repeat: 5 }),
    ];
    c._splitTimer = s.time.delayedCall(420, () => this.splitAt(c, c._tearK));
  }

  cancelSplitHold(c) {
    if (c._splitTimer) { c._splitTimer.remove(false); c._splitTimer = null; }
    (c._tearTweens || []).forEach((tw) => tw.stop());
    c._tearTweens = null;
    if (c._tearG) { c._tearG.destroy(); c._tearG = null; }
    c.angle = 0;
  }

  splitAt(c, k) {
    const s = this.s;
    c._splitTimer = null;
    (c._tearTweens || []).forEach((tw) => tw.stop());
    c._tearTweens = null;
    c._tearG = null; // wordt door drawBlock (removeAll) opgeruimd
    c.angle = 0;
    const val = c.getData('buildBlock').value;
    const [botV, topV] = splitParts(val, k);
    SFX.split();
    this.drawBlock(c, botV);
    this.settle(c);
    s.tweens.add({ targets: c, scaleX: 1.2, scaleY: 0.8, duration: 90, yoyo: true });
    const piece = this.makeBlock(topV, c.x, c.y - 40);
    const dir = c.x < s.scale.width / 2 ? 1 : -1;
    s.tweens.add({ targets: piece, x: Phaser.Math.Clamp(c.x + dir * 90, 60, s.scale.width - 60), duration: 320, ease: 'Back.out' });
    this.settle(piece);
    Voice.cue('whee');
    this.clearHintRings(); // blokken zijn veranderd → oude hint klopt niet meer

    // Ook een SPLITSING kan het doel opleveren (bv. 11 → 10 + 1)! Check het
    // deel dat het doel is (hooguit één, dus geen dubbele oplos-trigger).
    const pz = this.activePuzzle;
    if (pz && !pz.solved) {
      const hit = botV === pz.doel ? c : (topV === pz.doel ? piece : null);
      if (hit) s.time.delayedCall(380, () => { if (s.mode === 'build') this.checkSolved(hit); });
    }
  }

  checkSolved(block) {
    const s = this.s;
    const pz = this.activePuzzle;
    if (!pz || pz.wagons) return; // trein lost alleen op via de wagons
    if (block.getData('buildBlock').value !== pz.doel) return;
    s.tweens.add({ targets: block, y: block.y - 10, scale: 1.2, duration: 200, yoyo: true });
    SFX.correct(); Voice.cue('great');

    // Baas: meerdere fasen. Pas na de laatste is hij verslagen.
    if (pz.type === 'boss' && pz.stageIndex < pz.stages.length - 1) {
      pz.stageIndex += 1;
      pz.doel = pz.stages[pz.stageIndex].doel;
      pz.blocks = pz.stages[pz.stageIndex].blocks;
      s.time.delayedCall(450, () => { this.exit(true); s.bossStageReact(pz); });
      return;
    }

    pz.solved = true;
    s.time.delayedCall(450, () => { this.exit(true); pz.onSolve(); });
  }
}
