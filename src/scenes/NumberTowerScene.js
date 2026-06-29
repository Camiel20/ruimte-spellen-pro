import Phaser from 'phaser';
import { SFX, initAudio, isSoundOn } from '../sound.js';
import { showReward, confettiBurst } from '../reward.js';

// Getallen-Toren — stapel plaatswaarde-blokken (1, 10, 100) tot ze samen
// een groter getal vormen. Leerdoel: plaatswaarde + optellen met "wisselen"
// (10 eenheden -> 1 tiental). Gemaakt voor Adrian (eind groep 2 / start groep 3).
//
// Vijf levels lopen op in moeilijkheid:
//   1 Bouwmeester  — bouw een getal na (plaatswaarde-gevoel)
//   2 Optel-piloot — optellen zonder wisselen (25 + 24)
//   3 Ruil-baas    — optellen MET wisselen (28 + 14)  <- de nieuwe vaardigheid
//   4 Honderd-held — voorbij de 100 (80 + 50)
//   5 Nul-meester  — ronde honderdtallen, vol nullen (200 + 300)

const LEVELS = [
  { i: '🧱', n: 'Bouwmeester',  mode: 'build', max: 99,  hundreds: false, rounds: 4, stars: 3 },
  { i: '➕', n: 'Optel-piloot', mode: 'add', gen: 'nocarry',  hundreds: false, rounds: 4, stars: 4 },
  { i: '🔁', n: 'Ruil-baas',    mode: 'add', gen: 'carry',    hundreds: false, rounds: 5, stars: 5 },
  { i: '💯', n: 'Honderd-held', mode: 'add', gen: 'hundreds', hundreds: true,  rounds: 5, stars: 6 },
  { i: '0️⃣', n: 'Nul-meester',  mode: 'add', gen: 'round',    hundreds: true,  rounds: 4, stars: 8 },
];

// Blok-soorten (plaatswaarde) in Numberblocks-signatuurkleuren.
// Eenheden = rood (zoals "One"), Tientallen = blauw (zoals "Five"),
// Honderden = geel (zoals "Three"). x wordt per level gezet.
function placeDefs() {
  return {
    h: { key: 'h', label: 'Honderden', color: 0xf6c624, val: 100, blab: '100', w: 82 },
    t: { key: 't', label: 'Tientallen', color: 0x38b6cf, val: 10, blab: '10', w: 70 },
    o: { key: 'o', label: 'Eenheden', color: 0xe8402c, val: 1, blab: '1', w: 58 },
  };
}

// Numberblocks-signatuurkleuren 1..10 (voor het grote getal als figuurtje).
const SIG = ['#e8402c', '#f08a24', '#f6c624', '#57b947', '#38b6cf',
  '#ec6aa9', '#9b6dd6', '#6b7b8a', '#4f63c9', '#e34da0'];
function sigColor(n) {
  if (n <= 0) return '#cbd5e1';
  return SIG[(n - 1) % 10];
}

export default class NumberTowerScene extends Phaser.Scene {
  constructor() { super('NumberTower'); }

  create() {
    const { width, height } = this.scale;
    this.buildBackground(width, height);

    this.level = 1;
    this.xp = 0;
    this.locked = false;
    this.counts = { h: 0, t: 0, o: 0 };
    this.blocks = [];
    this.boardItems = [];
    this.bh = 30;
    this.gap = 3;
    this.baseY = 560;

    // Vrolijke voorlees-stem klaarzetten (kiest een NL-stem zodra die laadt)
    this.nlVoice = null;
    this.loadVoice();
    // iOS/Safari blokkeert de stem tot de eerste tik. Bij de eerste
    // aanraking "ontgrendelen" we 'm met een stil zinnetje.
    this.speechPrimed = false;
    this.input.on('pointerdown', () => this.primeSpeech());

    // Donker HUD-paneel zodat de tekst goed leesbaar blijft op de
    // heldere Numberblocks-achtergrond.
    const panel = this.add.graphics().setDepth(0);
    panel.fillStyle(0x12203a, 0.66);
    panel.fillRoundedRect(8, 6, width - 16, 208, 18);
    panel.lineStyle(2, 0xffffff, 0.18);
    panel.strokeRoundedRect(8, 6, width - 16, 208, 18);

    this.backBtn();

    this.add.text(width / 2, 26, '🔢 Getallen-Toren', {
      fontFamily: 'Arial Black, Arial', fontSize: '24px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(6).setShadow(0, 0, '#38b6cf', 14, true, true);

    this.levelText = this.add.text(width / 2, 52, '', {
      fontFamily: 'Arial', fontSize: '15px', color: '#cbd5e1',
    }).setOrigin(0.5).setDepth(6);

    this.promptText = this.add.text(width / 2, 80, '', {
      fontFamily: 'Arial', fontSize: '17px', fontStyle: 'bold', color: '#fde68a',
      align: 'center', wordWrap: { width: width - 40 },
    }).setOrigin(0.5).setDepth(6);

    // Het grote, levende getal als Numberblocks-figuurtje: googly eyes
    // boven het getal, dat meekleurt met zijn signatuurkleur.
    this.totalEyes = this.add.container(width / 2, 122).setDepth(7);
    [-22, 22].forEach((dx) => {
      const wsc = this.add.circle(dx, 0, 9, 0xffffff).setStrokeStyle(2, 0x16202b);
      const pup = this.add.circle(dx, 2, 4, 0x16202b);
      this.totalEyes.add([wsc, pup]);
    });
    this.tweens.add({
      targets: this.totalEyes, scaleY: 0.1, duration: 90,
      yoyo: true, repeat: -1, repeatDelay: 2600, ease: 'Sine.inOut',
    });

    this.totalText = this.add.text(width / 2, 152, '0', {
      fontFamily: 'Arial Black, Arial', fontSize: '46px', fontStyle: 'bold', color: '#cbd5e1',
    }).setOrigin(0.5).setDepth(6).setStroke('#16202b', 7);

    this.breakdownText = this.add.text(width / 2, 190, '', {
      fontFamily: 'Arial', fontSize: '14px', color: '#cbd5e1',
    }).setOrigin(0.5).setDepth(6);

    // Voorlees-knop
    this.speaker = this.add.text(width - 18, 150, '🔊', { fontSize: '28px' })
      .setOrigin(1, 0.5).setDepth(20).setInteractive({ useHandCursor: true });
    this.speaker.on('pointerdown', () => this.sayCurrent());

    this.add.text(width / 2, 712, 'Tik op een blokje om het weg te halen ↩', {
      fontFamily: 'Arial', fontSize: '12px', fontStyle: 'bold', color: '#1f2d3a',
    }).setOrigin(0.5).setDepth(6);

    this.startLevel();
  }

  // Heldere, vrolijke Numberblocks-achtergrond met wolkjes en
  // zwevende gekleurde kubussen.
  buildBackground(width, height) {
    const bg = this.add.graphics().setDepth(-5);
    bg.fillGradientStyle(0x8fe1ff, 0x8fe1ff, 0xd7f5a8, 0xd7f5a8, 1);
    bg.fillRect(0, 0, width, height);

    [[80, 250, 1], [380, 330, 1.3], [120, 560, 0.9], [410, 600, 1.05]].forEach(([x, y, s]) => {
      const cl = this.add.graphics().setDepth(-4);
      cl.fillStyle(0xffffff, 0.75);
      cl.fillCircle(x, y, 22 * s);
      cl.fillCircle(x + 24 * s, y + 6 * s, 18 * s);
      cl.fillCircle(x - 22 * s, y + 6 * s, 16 * s);
      cl.fillRoundedRect(x - 30 * s, y, 60 * s, 16 * s, 8);
      this.tweens.add({ targets: cl, x: `+=${20 * s}`, duration: 6000 + 2000 * s, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });

    const cubeCols = [0xe8402c, 0xf08a24, 0xf6c624, 0x57b947, 0x38b6cf, 0xec6aa9, 0x9b6dd6];
    for (let i = 0; i < 10; i++) {
      const s = Phaser.Math.Between(16, 30);
      const x = Phaser.Math.Between(24, width - 24);
      const y = Phaser.Math.Between(230, height - 110);
      const col = Phaser.Utils.Array.GetRandom(cubeCols);
      const g = this.add.graphics().setDepth(-4).setAlpha(0.4);
      g.fillStyle(col, 1);
      g.fillRoundedRect(-s / 2, -s / 2, s, s, 5);
      g.lineStyle(2, 0x1f2d3a, 0.55);
      g.strokeRoundedRect(-s / 2, -s / 2, s, s, 5);
      g.setPosition(x, y);
      this.tweens.add({ targets: g, y: y - Phaser.Math.Between(15, 30), duration: Phaser.Math.Between(2500, 4500), yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.tweens.add({ targets: g, angle: Phaser.Math.Between(-20, 20), duration: Phaser.Math.Between(3000, 5000), yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
  }

  // --- Level opbouwen (kolommen + palet) ---
  startLevel() {
    const lv = LEVELS[this.level - 1];
    this.lv = lv;

    const defs = placeDefs();
    this.places = lv.hundreds ? [defs.h, defs.t, defs.o] : [defs.t, defs.o];
    const cols = this.places.length === 3 ? [112, 240, 368] : [162, 318];
    this.places.forEach((p, i) => { p.x = cols[i]; });

    // Oud bord opruimen
    this.boardItems.forEach((o) => o.destroy());
    this.boardItems = [];
    this.blocks.forEach((o) => o.destroy());
    this.blocks = [];

    this.places.forEach((p) => {
      // Grondplaat + vage kolom-baan zodat het stapelen duidelijk is
      const ground = this.add.graphics().setDepth(2);
      ground.fillStyle(0xffffff, 0.18);
      ground.fillRoundedRect(p.x - p.w / 2 - 6, 222, p.w + 12, this.baseY - 222 + 12, 10);
      ground.lineStyle(2, 0x1f2d3a, 0.18);
      ground.strokeRoundedRect(p.x - p.w / 2 - 6, 222, p.w + 12, this.baseY - 222 + 12, 10);
      ground.fillStyle(p.color, 1);
      ground.fillRoundedRect(p.x - p.w / 2 - 8, this.baseY + 4, p.w + 16, 9, 4);

      // Naam-label op een wit pilletje voor contrast op de heldere bg
      const lblBg = this.add.graphics().setDepth(2);
      lblBg.fillStyle(0x12203a, 0.8);
      lblBg.fillRoundedRect(p.x - p.w / 2 - 6, this.baseY + 18, p.w + 12, 22, 11);
      const lbl = this.add.text(p.x, this.baseY + 29, p.label, {
        fontFamily: 'Arial', fontSize: '12px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5).setDepth(3);

      p.cntText = this.add.text(p.x, this.baseY + 50, '', {
        fontFamily: 'Arial Black, Arial', fontSize: '14px', fontStyle: 'bold', color: '#1f2d3a',
      }).setOrigin(0.5).setDepth(3);

      const btn = this.makePaletteBtn(p);

      this.boardItems.push(ground, lblBg, lbl, p.cntText, btn);
    });

    this.updateHeader();
    this.newRound();
  }

  makePaletteBtn(p) {
    const y = 648;
    const w = this.places.length === 3 ? 108 : 130, h = 56;
    const c = this.add.container(p.x, y).setDepth(15);
    const bg = this.add.graphics();
    bg.fillStyle(p.color, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    bg.fillStyle(0xffffff, 0.3); // glans
    bg.fillRoundedRect(-w / 2 + 5, -h / 2 + 4, w - 10, h * 0.34, 9);
    bg.lineStyle(3, 0x1f2d3a, 1); // dikke donkere rand (Numberblocks-stijl)
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
    const t = this.add.text(0, 0, `+${p.val}`, {
      fontFamily: 'Arial Black, Arial', fontSize: '24px', fontStyle: 'bold', color: '#16202b',
    }).setOrigin(0.5);
    c.add([bg, t]);
    const hit = this.add.rectangle(0, 0, w, h, 0, 0).setInteractive({ useHandCursor: true });
    c.add(hit);
    hit.on('pointerover', () => this.tweens.add({ targets: c, scale: 1.06, duration: 100 }));
    hit.on('pointerout', () => this.tweens.add({ targets: c, scale: 1, duration: 100 }));
    hit.on('pointerdown', () => {
      this.tweens.add({ targets: c, scale: 0.9, duration: 70, yoyo: true });
      this.addBlock(p.key);
    });
    return c;
  }

  // --- Een nieuwe ronde (som of bouw-opdracht) ---
  newRound() {
    const lv = this.lv;
    this.locked = false;
    if (lv.mode === 'build') {
      const target = Phaser.Math.Between(11, lv.max);
      this.a = target; this.b = 0; this.target = target;
      this.counts = { h: 0, t: 0, o: 0 };
      this.promptText.setText(`Bouw het getal ${target}!`);
    } else {
      const [a, b, target] = this.genAdd(lv);
      this.a = a; this.b = b; this.target = target;
      this.counts = this.digits(a);
      this.promptText.setText(`${a} + ${b} = ?\nDoe er ${b} bij!`);
    }
    this.render();
    this.updateTotal();
    this.sayCurrent();
  }

  genAdd(lv) {
    let a, b;
    if (lv.gen === 'nocarry') {
      const ao = Phaser.Math.Between(1, 8), bo = Phaser.Math.Between(1, 9 - ao);
      const at = Phaser.Math.Between(1, 4), bt = Phaser.Math.Between(1, Math.max(1, 9 - at));
      a = at * 10 + ao; b = bt * 10 + bo;
    } else if (lv.gen === 'carry') {
      const ao = Phaser.Math.Between(2, 9), bo = Phaser.Math.Between(11 - ao, 9);
      const at = Phaser.Math.Between(1, 4), bt = Phaser.Math.Between(1, Math.max(1, 8 - at));
      a = at * 10 + ao; b = bt * 10 + bo;
    } else if (lv.gen === 'hundreds') {
      const at = Phaser.Math.Between(3, 9), bt = Phaser.Math.Between(11 - at, 9);
      const ao = Phaser.Math.Between(0, 4), bo = Phaser.Math.Between(0, Math.max(0, 9 - ao));
      a = at * 10 + ao; b = bt * 10 + bo;
    } else { // round — ronde honderdtallen, vol nullen
      const ah = Phaser.Math.Between(1, 4), bh = Phaser.Math.Between(1, Math.max(1, 9 - ah));
      a = ah * 100; b = bh * 100;
    }
    return [a, b, a + b];
  }

  digits(n) {
    return { h: Math.floor(n / 100), t: Math.floor(n / 10) % 10, o: n % 10 };
  }

  // --- Blok toevoegen / weghalen ---
  addBlock(key) {
    if (this.locked) return;
    initAudio();
    this.counts[key]++;
    SFX.coin();
    this.render(key);
    if (this.doRuil()) {
      // ruil heeft opnieuw getekend + gevierd
    }
    this.updateTotal();
  }

  removeBlock(key) {
    if (this.locked) return;
    if (this.counts[key] <= 0) return;
    this.counts[key]--;
    SFX.pop();
    this.render();
    this.updateTotal();
  }

  // 10 eenheden -> 1 tiental, 10 tientallen -> 1 honderdtal
  doRuil() {
    let did = false;
    while (this.counts.o >= 10) { this.counts.o -= 10; this.counts.t += 1; did = true; }
    if (this.lv.hundreds) {
      while (this.counts.t >= 10) { this.counts.t -= 10; this.counts.h += 1; did = true; }
    }
    if (did) {
      this.render();
      this.ruilCelebrate();
    }
    return did;
  }

  ruilCelebrate() {
    const { width } = this.scale;
    SFX.levelup();
    if (isSoundOn()) this.speak(`Ruilen! ${this.cheer()}`, { pitch: 1.8, rate: 1.05 });
    const banner = this.add.text(width / 2, 300, '🔁 RUILEN!', {
      fontFamily: 'Arial Black, Arial', fontSize: '42px', fontStyle: 'bold', color: '#fde047',
    }).setOrigin(0.5).setDepth(80).setShadow(0, 0, '#f59e0b', 18, true, true).setScale(0.5);
    this.tweens.add({ targets: banner, scale: 1.1, duration: 260, ease: 'Back.easeOut', yoyo: true, hold: 500,
      onComplete: () => this.tweens.add({ targets: banner, alpha: 0, y: 250, duration: 350, onComplete: () => banner.destroy() }) });
    confettiBurst(this, 70);
  }

  // --- Tekenen van de stapels ---
  render(popKey) {
    this.blocks.forEach((b) => b.destroy());
    this.blocks = [];
    this.places.forEach((p) => {
      const count = this.counts[p.key];
      if (p.cntText) p.cntText.setText(count > 0 ? `×${count}` : '');
      for (let i = 0; i < count; i++) {
        const cy = this.baseY - i * (this.bh + this.gap) - this.bh / 2;
        // Het bovenste blokje van de stapel krijgt een gezichtje,
        // zodat de stapel een Numberblocks-figuurtje wordt.
        const blk = this.makeBlock(p.x, cy, p.w, this.bh, p.color, p.blab, p.key, i === count - 1);
        this.blocks.push(blk);
        if (p.key === popKey && i === count - 1) {
          this.tweens.add({ targets: blk, scaleX: { from: 1.3, to: 1 }, scaleY: { from: 0.6, to: 1 }, duration: 220, ease: 'Back.easeOut' });
        }
      }
    });
  }

  // Numberblocks-kubus: felle kleur, glans, dikke donkere rand. Met
  // googly eyes + lach op het bovenste blokje van de stapel.
  makeBlock(cx, cy, w, h, color, label, key, withFace) {
    const dark = 0x1f2d3a;
    const c = this.add.container(cx, cy).setDepth(6);
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 7);
    g.fillStyle(0xffffff, 0.3); // glans bovenin
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 3, w - 8, h * 0.32, 5);
    g.lineStyle(3, dark, 1); // dikke donkere rand
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 7);
    c.add(g);

    if (withFace) {
      const ex = Math.min(11, w * 0.18);
      const ey = -h * 0.04;
      [-ex, ex].forEach((dx) => {
        const wsc = this.add.circle(dx, ey, 5.4, 0xffffff).setStrokeStyle(1.5, dark);
        const pup = this.add.circle(dx, ey + 1, 2.5, dark);
        c.add([wsc, pup]);
      });
      const smile = this.add.graphics();
      smile.lineStyle(2, dark, 1);
      smile.beginPath();
      smile.arc(0, ey + 4, 5, 0.12 * Math.PI, 0.88 * Math.PI);
      smile.strokePath();
      c.add(smile);
      const t = this.add.text(0, h * 0.30, label, {
        fontFamily: 'Arial Black, Arial', fontSize: '10px', fontStyle: 'bold', color: '#16202b',
      }).setOrigin(0.5);
      c.add(t);
    } else {
      const t = this.add.text(0, 0, label, {
        fontFamily: 'Arial Black, Arial', fontSize: '14px', fontStyle: 'bold', color: '#16202b',
      }).setOrigin(0.5);
      c.add(t);
    }

    const hit = this.add.rectangle(0, 0, w, h, 0, 0).setInteractive({ useHandCursor: true });
    c.add(hit);
    hit.on('pointerdown', () => this.removeBlock(key));
    return c;
  }

  // --- Totaal + win-check ---
  updateTotal() {
    const total = this.counts.h * 100 + this.counts.t * 10 + this.counts.o;
    this.total = total;
    this.totalText.setText(String(total));

    const parts = [];
    if (this.counts.h) parts.push(`${this.counts.h}×100`);
    if (this.counts.t) parts.push(`${this.counts.t}×10`);
    if (this.counts.o) parts.push(`${this.counts.o}×1`);
    this.breakdownText.setText(parts.length ? `${parts.join(' + ')} = ${total}` : '');

    if (this.locked) return;
    if (total === this.target) {
      this.totalText.setColor('#4ade80');
      this.success();
    } else if (total > this.target) {
      this.totalText.setColor('#f87171');
      this.breakdownText.setText('Te veel! Haal een blokje weg ↩');
    } else {
      // Het getal kleurt mee met zijn Numberblocks-signatuurkleur
      this.totalText.setColor(sigColor(total));
    }
  }

  success() {
    this.locked = true;
    SFX.win();
    confettiBurst(this);
    if (isSoundOn()) this.speak(`${this.cheer()} ${this.words(this.target)}!`, { pitch: 1.7, rate: 1.02 });
    this.floatText('🎉 Goed!', this.scale.width / 2, 230, '#4ade80');
    this.xp++;
    this.updateHeader();
    this.time.delayedCall(1500, () => {
      if (this.xp >= this.lv.rounds) this.levelComplete();
      else this.newRound();
    });
  }

  levelComplete() {
    const lv = this.lv;
    const last = this.level >= LEVELS.length;
    showReward(this, {
      title: last ? 'Toren-meester! 🏆' : `${lv.n} gehaald!`,
      subtitle: last
        ? 'Je hebt alle levels van de Getallen-Toren uitgespeeld!'
        : `Klaar voor het volgende level?`,
      stars: lv.stars,
      medal: 'tower_' + this.level,
      medalLabel: lv.n,
      buttonText: last ? 'Terug 🏠' : 'Volgende! 🚀',
      onClose: () => {
        if (last) { this.scene.start('Menu'); return; }
        this.level++;
        this.xp = 0;
        this.startLevel();
      },
    });
  }

  updateHeader() {
    const lv = this.lv;
    const ronde = Math.min(this.xp + 1, lv.rounds);
    this.levelText.setText(`${lv.i} Level ${this.level} — ${lv.n}   (ronde ${ronde}/${lv.rounds})`);
  }

  // --- Voorlezen (Web Speech API, nl-NL) ---
  sayCurrent() {
    if (!isSoundOn()) return;
    if (this.lv.mode === 'build') this.speak(this.words(this.target));
    else this.speak(`${this.words(this.a)} plus ${this.words(this.b)}`);
  }

  speak(text, opts = {}) {
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'nl-NL';
      if (this.nlVoice) u.voice = this.nlVoice;
      // Hogere toonhoogte = vrolijker/kinderlijker (Numberblocks-sfeer)
      u.pitch = opts.pitch != null ? opts.pitch : 1.5;
      u.rate = opts.rate != null ? opts.rate : 1.0;
      u.volume = 1;
      synth.speak(u);
    } catch (e) {}
  }

  // Kies een Nederlandse stem, het liefst een vrolijke/vrouwelijke
  loadVoice() {
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      const pick = () => {
        const nl = synth.getVoices().filter((v) => /nl(-|_)?/i.test(v.lang));
        if (!nl.length) return;
        const fav = nl.find((v) => /female|vrouw|fenna|lotte|saskia|ellen|google/i.test(v.name));
        this.nlVoice = fav || nl[0];
      };
      pick();
      synth.onvoiceschanged = pick;
    } catch (e) {}
  }

  // iOS heeft een echte gebruikers-tik nodig voordat de stem mag spreken.
  // Eén keer een stil zinnetje afspelen "ontgrendelt" het voor de sessie.
  primeSpeech() {
    if (this.speechPrimed) return;
    this.speechPrimed = true;
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      synth.speak(u);
      this.loadVoice();
    } catch (e) {}
  }

  // Willekeurig vrolijk kreetje
  cheer() {
    return Phaser.Utils.Array.GetRandom(['Joepie!', 'Hoera!', 'Goed zo!', 'Super!', 'Top!', 'Wauw!', 'Yes!']);
  }

  // Getal -> Nederlandse woorden (0..9999), voor de voorlees-stem
  words(n) {
    if (n === 0) return 'nul';
    const ones = ['', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen'];
    const teens = ['tien', 'elf', 'twaalf', 'dertien', 'veertien', 'vijftien', 'zestien', 'zeventien', 'achttien', 'negentien'];
    const tens = ['', '', 'twintig', 'dertig', 'veertig', 'vijftig', 'zestig', 'zeventig', 'tachtig', 'negentig'];
    const under100 = (x) => {
      if (x < 10) return ones[x];
      if (x < 20) return teens[x - 10];
      const t = Math.floor(x / 10), o = x % 10;
      return o === 0 ? tens[t] : ones[o] + 'en' + tens[t];
    };
    const under1000 = (x) => {
      if (x < 100) return under100(x);
      const h = Math.floor(x / 100), r = x % 100;
      const hw = h === 1 ? 'honderd' : ones[h] + 'honderd';
      return r === 0 ? hw : hw + under100(r);
    };
    if (n < 1000) return under1000(n);
    const th = Math.floor(n / 1000), r = n % 1000;
    const tw = th === 1 ? 'duizend' : under1000(th) + 'duizend';
    return r === 0 ? tw : tw + under1000(r);
  }

  // --- Gedeelde helpers ---
  backBtn() {
    const b = this.add.text(16, 16, '⬅ Terug', {
      fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
      backgroundColor: '#1f2d3a', padding: { x: 10, y: 6 },
    }).setInteractive({ useHandCursor: true }).setDepth(50);
    b.on('pointerdown', () => { SFX.click(); this.scene.start('Menu'); });
  }

  floatText(txt, x, y, color) {
    const t = this.add.text(x, y, txt, {
      fontFamily: 'Arial Black, Arial', fontSize: '26px', fontStyle: 'bold', color,
    }).setOrigin(0.5).setDepth(90);
    this.tweens.add({ targets: t, y: y - 44, alpha: 0, duration: 1100, onComplete: () => t.destroy() });
  }
}
