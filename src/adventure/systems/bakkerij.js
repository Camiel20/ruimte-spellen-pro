// ===== SYSTEEM: PIZZA-BAKKERIJ (Pizza-Vulkaan) =====
// Verzamel toppings in het level, breng ze naar de steenoven en verdeel ze
// EERLIJK over de pizza's (evenveel op elk!) — dé voorloper van breuken.
// Lukt het? Dan bakt de oven een BRUG van pizzapunten over het ravijn.
// Werkwoord: eerlijk delen.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { confettiBurst } from '../../reward.js';

// Eén topping tekenen (om en om salami en champignon).
function drawTopping(s, i) {
  const g = s.add.graphics();
  if (i % 2 === 0) {
    g.fillStyle(0xb93227, 1); g.fillCircle(0, 0, 13);
    g.fillStyle(0xe8402c, 1); g.fillCircle(0, 0, 11);
    g.fillStyle(0x8a1d12, 1); g.fillCircle(-4, -3, 2); g.fillCircle(4, 2, 2); g.fillCircle(1, -5, 1.6);
  } else {
    g.fillStyle(0xf5efe2, 1); g.fillRoundedRect(-4, -2, 8, 12, 3);
    g.fillStyle(0xb08a5a, 1); g.fillEllipse(0, -4, 24, 14);
    g.fillStyle(0xd9b98a, 1); g.fillEllipse(0, -6, 18, 8);
  }
  return g;
}

// Eén pizza (bodem + saus + kaas) als container met tel-label.
function drawPizza(s, x, y, r) {
  const c = s.add.container(x, y);
  const g = s.add.graphics();
  g.fillStyle(0x000000, 0.2); g.fillEllipse(0, r * 0.9, r * 2.1, 16);
  g.fillStyle(0xc98a3d, 1); g.fillCircle(0, 0, r);
  g.fillStyle(0xe8402c, 1); g.fillCircle(0, 0, r - 8);
  g.fillStyle(0xf6c624, 1); g.fillCircle(0, 0, r - 13);
  g.fillStyle(0xffe16b, 0.7); g.fillEllipse(-r * 0.25, -r * 0.3, r * 0.7, r * 0.4);
  c.add(g);
  return c;
}

function startVerdeel(s) {
  const B = s.bakkerij;
  B.bezig = true;
  s.mode = 'bakkerij';
  s.player.body.setVelocity(0, 0);

  // LET OP: géén scrollFactor(0)-container — interactieve kinderen van zo'n
  // container krijgen hun tik-zones verschoven zodra de camera gescrold is
  // (Phaser-valkuil; hierdoor "werkte het pizza-tikken niet" op de iPad).
  // In plaats daarvan: camera stilzetten en de overlay in WERELD-coördinaten
  // op de camerapositie zetten — dan klopt de hit-test gewoon.
  const cam = s.cameras.main;
  cam.stopFollow();
  const W = s.scale.width, H = s.scale.height;
  const ov = s.add.container(cam.scrollX, cam.scrollY).setDepth(80);
  B.overlay = ov;

  const dim = s.add.rectangle(W / 2, H / 2, W, H, 0x1a0e08, 0.72).setInteractive();
  ov.add(dim);
  ov.add(s.add.text(W / 2, 150, 'Verdeel EERLIJK!', {
    fontFamily: 'Arial Black, Arial', fontSize: '30px', fontStyle: 'bold', color: '#ffe16b', stroke: '#7a3d05', strokeThickness: 7,
  }).setOrigin(0.5));
  B.uitleg = s.add.text(W / 2, 196, `Evenveel op elke pizza — tik een pizza! 🍕`, {
    fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
  }).setOrigin(0.5);
  ov.add(B.uitleg);

  // de pizza's
  const n = B.pizzas, r = 62;
  const xs = n === 2 ? [W / 2 - 110, W / 2 + 110] : [W / 2 - 150, W / 2, W / 2 + 150];
  B.pizzaRefs = [];
  xs.forEach((px, pi) => {
    const pc = drawPizza(s, px, 330, r);
    pc.setSize(r * 2.3, r * 2.3).setInteractive({ useHandCursor: true });
    const label = s.add.text(px, 330 + r + 26, '0', {
      fontFamily: 'Arial Black, Arial', fontSize: '24px', fontStyle: 'bold', color: '#ffffff', stroke: '#7a3d05', strokeThickness: 5,
    }).setOrigin(0.5);
    ov.add([pc, label]);
    const ref = { c: pc, label, count: 0, x: px, y: 330, slots: [] };
    pc.on('pointerdown', () => legTopping(s, ref));
    B.pizzaRefs.push(ref);
  });

  // de "hand" met te verdelen toppings onderin
  B.hand = [];
  const totaal = B.per * B.pizzas;
  for (let i = 0; i < totaal; i++) {
    const t = s.add.container(W / 2 + (i - (totaal - 1) / 2) * 36, 520);
    t.add(drawTopping(s, i));
    t.idx = i;
    ov.add(t);
    s.tweens.add({ targets: t, y: 514, duration: 700, yoyo: true, repeat: -1, delay: i * 80, ease: 'Sine.inOut' });
    B.hand.push(t);
  }
}

function legTopping(s, ref) {
  const B = s.bakkerij;
  if (!B.bezig || B.controle) return;
  const t = B.hand.find((h) => !h.geplaatst);
  if (!t) return;
  t.geplaatst = true;
  ref.count += 1;
  // slot-positie in een rondje op de pizza
  const hoek = (ref.slots.length * 2.4) + 0.6;
  const rr = ref.slots.length === 0 ? 0 : 26 + (ref.slots.length % 2) * 12;
  const tx = ref.x + Math.cos(hoek) * rr, ty = ref.y + Math.sin(hoek) * rr * 0.7;
  ref.slots.push(t);
  s.tweens.killTweensOf(t);
  SFX.place(); Voice.number(ref.count);
  s.tweens.add({ targets: t, x: tx, y: ty, scale: 0.9, duration: 260, ease: 'Back.out' });
  ref.label.setText(`${ref.count}`);
  s.tweens.add({ targets: ref.c, scale: 1.06, duration: 110, yoyo: true });

  if (B.hand.every((h) => h.geplaatst)) {
    B.controle = true;
    s.time.delayedCall(420, () => controleer(s));
  }
}

function controleer(s) {
  const B = s.bakkerij;
  const counts = B.pizzaRefs.map((r) => r.count);
  const eerlijk = counts.every((c) => c === counts[0]);
  if (eerlijk) {
    SFX.fanfare(); Voice.cue('cheer'); confettiBurst(s, 110);
    B.uitleg.setText(`EERLIJK! ${counts.join(' en ')} — iedereen evenveel! 🎉`);
    B.pizzaRefs.forEach((r) => s.tweens.add({ targets: [r.c, ...r.slots], y: '-=14', duration: 200, yoyo: true, repeat: 2 }));
    s.time.delayedCall(1300, () => bak(s));
  } else {
    SFX.oops(); Voice.cue('oops');
    B.uitleg.setText(`Oeps: ${counts.join(' en ')} — dat is niet eerlijk! Probeer opnieuw 💛`);
    B.pizzaRefs.forEach((r) => s.tweens.add({ targets: r.c, x: r.x + 5, duration: 60, yoyo: true, repeat: 5 }));
    // toppings terug naar de hand
    s.time.delayedCall(1100, () => {
      const W = s.scale.width, totaal = B.hand.length;
      B.hand.forEach((t, i) => {
        t.geplaatst = false;
        s.tweens.add({ targets: t, x: W / 2 + (i - (totaal - 1) / 2) * 36, y: 520, scale: 1, duration: 300, ease: 'Sine.inOut' });
      });
      B.pizzaRefs.forEach((r) => { r.count = 0; r.slots = []; r.label.setText('0'); });
      B.controle = false;
    });
  }
}

function bak(s) {
  const B = s.bakkerij;
  // overlay dicht, pizza's "de oven in"
  s.tweens.add({ targets: B.overlay, alpha: 0, duration: 400, onComplete: () => B.overlay.destroy() });

  // de oven brandt los!
  SFX.grow(6);
  B.vuur.setVisible(true);
  s.tweens.add({ targets: B.vuur, scaleY: 1.5, duration: 130, yoyo: true, repeat: 7 });
  s.cameraPunch(0.03, 5);
  s.questText.setText('De oven bakt… 🔥');

  s.time.delayedCall(1400, () => {
    B.vuur.setVisible(false);
    B.klaar = true;
    // POEF — de pizzapunten-brug verschijnt punt voor punt
    SFX.fanfare(); Voice.cue('great'); s.cameraPunch();
    const [bx, by, bw] = B.brug;
    const stap = 76;
    for (let x0 = bx, i = 0; x0 < bx + bw; x0 += stap, i++) {
      const px = Math.min(x0 + stap / 2, bx + bw - stap / 2);
      s.time.delayedCall(i * 140, () => {
        const body = s.add.rectangle(px, by + 9, stap, 18, 0x000000, 0);
        s.physics.add.existing(body, true);
        s.platforms.add(body);
        const c = s.add.container(px, by + 40).setDepth(-9).setAlpha(0);
        const g = s.add.graphics();
        g.fillStyle(0xc98a3d, 1); g.fillTriangle(-stap / 2 + 4, 0, stap / 2 - 4, 0, 0, 30);
        g.fillStyle(0xf6c624, 1); g.fillTriangle(-stap / 2 + 8, 0, stap / 2 - 8, 0, 0, 24);
        g.fillStyle(0xe8402c, 1); g.fillCircle(0, 8, 6);
        g.fillStyle(0xc98a3d, 1); g.fillRoundedRect(-stap / 2 + 2, -14, stap - 4, 16, 7);
        g.fillStyle(0xf6c624, 1); g.fillRoundedRect(-stap / 2 + 2, -14, stap - 4, 9, 5);
        c.add(g);
        s.tweens.add({ targets: c, y: by, alpha: 1, duration: 260, ease: 'Back.out' });
        SFX.place(); s.sparkleAt(px, by - 10, 4);
      });
    }
    s.time.delayedCall(bw / stap * 140 + 400, () => {
      s.mode = 'explore';
      s.cameras.main.startFollow(s.player, true, 0.12, 0.12); // follow weer aan
      s.checkpoint = { x: B.x, bottom: B.groundTop };
      s.questText.setText('De pizzapunten-brug is klaar — ren eroverheen! 🍕🚩');
      s.vierMijlpaal(B.x);
    });
  });
}

export default {
  build(s, L) {
    s.bakkerij = null;
    if (!L.bakkerij) return;
    const B = L.bakkerij, groundTop = L.platforms[0][1];

    // de steenoven-vulkaan: stenen koepel met vuurmond en rokende schoorsteen
    const c = s.add.container(B.x, groundTop).setDepth(6);
    const g = s.add.graphics();
    g.fillStyle(0x000000, 0.2); g.fillEllipse(0, 2, 150, 18);
    g.fillStyle(0x8a6250, 1); g.fillEllipse(0, -50, 150, 130);      // koepel
    g.fillStyle(0xa07a64, 1); g.fillEllipse(-16, -66, 100, 80);     // licht op de koepel
    // stenen
    g.fillStyle(0x6e4a3a, 0.85);
    [[-52, -30, 24], [-10, -96, 22], [40, -44, 26], [10, -30, 18], [-38, -76, 18], [52, -80, 16]].forEach(([sx, sy, sr]) => g.fillEllipse(sx, sy, sr, sr * 0.7));
    // vuurmond
    g.fillStyle(0x2c1810, 1); g.fillEllipse(0, -18, 76, 62);
    g.fillStyle(0x1a0e08, 1); g.fillRect(-38, -18, 76, 20);
    c.add(g);
    // vuur in de mond (zichtbaar bij het bakken + zacht sudderend ervoor)
    const vuur = s.add.graphics();
    vuur.fillStyle(0xf07c1f, 0.95); vuur.fillTriangle(-20, 0, 20, 0, 0, -42);
    vuur.fillStyle(0xffe16b, 0.95); vuur.fillTriangle(-11, 0, 11, 0, 0, -26);
    vuur.y = -6; vuur.setVisible(false);
    c.add(vuur);
    // sudder-vlammetje (altijd aan, klein)
    const sudder = s.add.graphics();
    sudder.fillStyle(0xf07c1f, 0.85); sudder.fillTriangle(-9, 0, 9, 0, 0, -20);
    sudder.fillStyle(0xffe16b, 0.9); sudder.fillTriangle(-5, 0, 5, 0, 0, -12);
    sudder.y = -6;
    c.add(sudder);
    s.tweens.add({ targets: sudder, scaleY: 1.35, scaleX: 0.85, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    // schoorsteen-rook
    s.time.addEvent({
      delay: 900, loop: true, callback: () => {
        if (!s.scene.isActive()) return;
        const r = s.add.circle(B.x + 8, groundTop - 118, Phaser.Math.Between(6, 10), 0xd9cfc5, 0.5).setDepth(5);
        s.tweens.add({ targets: r, y: r.y - 70, x: r.x + Phaser.Math.Between(-14, 20), scale: 1.9, alpha: 0, duration: 2400, onComplete: () => r.destroy() });
      },
    });

    // teller boven de oven
    const totaal = B.per * B.pizzas;
    const meter = s.add.container(B.x, groundTop - 190).setDepth(7);
    const mbg = s.add.graphics();
    mbg.fillStyle(0x16202b, 0.55); mbg.fillRoundedRect(-70, -22, 140, 46, 14);
    const mt = s.add.text(0, -6, `🍕 0 / ${totaal}`, { fontFamily: 'Arial Black, Arial', fontSize: '18px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
    const ml = s.add.text(0, 14, 'zoek de toppings!', { fontFamily: 'Arial', fontSize: '11px', color: '#ffe0c2' }).setOrigin(0.5);
    meter.add([mbg, mt, ml]);

    s.bakkerij = { ...B, c, vuur, meter, meterText: mt, groundTop, verzameld: 0, totaal, bezig: false, klaar: false, cueAt: 0 };

    // de toppings in de wereld (om en om salami/champignon, dobberend)
    s.toppings = [];
    (B.toppings || []).forEach(([x, y], i) => {
      const t = s.add.container(x, y).setDepth(5);
      t.add(drawTopping(s, i));
      t.taken = false;
      s.tweens.add({ targets: t, y: y - 8, duration: 850, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: (i % 4) * 160 });
      s.toppings.push(t);
    });
  },

  update(s, time) {
    const B = s.bakkerij;
    if (!B || B.klaar || B.bezig) return;
    const p = s.player;
    // toppings rapen
    for (const t of s.toppings) {
      if (t.taken) continue;
      if (Math.abs(p.x - t.x) < 44 && Math.abs(p.y - t.y) < 58) {
        t.taken = true;
        B.verzameld += 1;
        s.tweens.killTweensOf(t);
        s.tweens.add({ targets: t, scale: 0, y: t.y - 22, duration: 220, ease: 'Back.in', onComplete: () => t.destroy() });
        SFX.coin(); Voice.number(B.verzameld);
        B.meterText.setText(`🍕 ${B.verzameld} / ${B.totaal}`);
        s.tweens.add({ targets: B.meter, scale: 1.15, duration: 120, yoyo: true });
        if (B.verzameld >= B.totaal) {
          SFX.yay(); s.questText.setText('Alles gevonden — naar de oven! 🔥');
        } else {
          s.questText.setText(`Toppings: ${B.verzameld} / ${B.totaal} 🍕`);
        }
      }
    }
    // bij de oven
    if (Math.abs(p.x - B.x) < 70) {
      if (B.verzameld >= B.totaal) startVerdeel(s);
      else if (time > B.cueAt) {
        if (!B.cueAt) Voice.cue('greet');
        B.cueAt = time + 2600;
        s.questText.setText(`De oven wil ${B.totaal} toppings — zoek ze! (${B.verzameld}/${B.totaal}) 🍕`);
      }
    }
  },
};
