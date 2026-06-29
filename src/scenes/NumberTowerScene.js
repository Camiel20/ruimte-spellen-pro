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

// Blok-soorten (plaatswaarde). x wordt per level gezet.
function placeDefs() {
  return {
    h: { key: 'h', label: 'Honderden', color: 0xfbbf24, val: 100, blab: '100', w: 96 },
    t: { key: 't', label: 'Tientallen', color: 0x34d399, val: 10, blab: '10', w: 84 },
    o: { key: 'o', label: 'Eenheden', color: 0x60a5fa, val: 1, blab: '1', w: 70 },
  };
}

export default class NumberTowerScene extends Phaser.Scene {
  constructor() { super('NumberTower'); }

  create() {
    const { width } = this.scale;
    this.addStars();

    this.level = 1;
    this.xp = 0;
    this.locked = false;
    this.counts = { h: 0, t: 0, o: 0 };
    this.blocks = [];
    this.boardItems = [];
    this.bh = 24;
    this.gap = 4;
    this.baseY = 558;

    this.backBtn();

    this.add.text(width / 2, 26, '🧱 Getallen-Toren', {
      fontFamily: 'Arial Black, Arial', fontSize: '24px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setShadow(0, 0, '#34d399', 14, true, true);

    this.levelText = this.add.text(width / 2, 54, '', {
      fontFamily: 'Arial', fontSize: '15px', color: '#94a3b8',
    }).setOrigin(0.5);

    this.promptText = this.add.text(width / 2, 92, '', {
      fontFamily: 'Arial', fontSize: '17px', fontStyle: 'bold', color: '#c4b5fd',
      align: 'center', wordWrap: { width: width - 40 },
    }).setOrigin(0.5);

    // Het grote, levende getal
    this.totalText = this.add.text(width / 2, 142, '0', {
      fontFamily: 'Arial Black, Arial', fontSize: '46px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);

    this.breakdownText = this.add.text(width / 2, 182, '', {
      fontFamily: 'Arial', fontSize: '14px', color: '#94a3b8',
    }).setOrigin(0.5);

    // Voorlees-knop
    this.speaker = this.add.text(width - 18, 142, '🔊', { fontSize: '28px' })
      .setOrigin(1, 0.5).setDepth(20).setInteractive({ useHandCursor: true });
    this.speaker.on('pointerdown', () => this.sayCurrent());

    this.add.text(width / 2, 712, 'Tik op een blok om het weg te halen ↩', {
      fontFamily: 'Arial', fontSize: '12px', color: '#64748b',
    }).setOrigin(0.5);

    this.startLevel();
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
      // Grondplaat onder de kolom
      const ground = this.add.graphics().setDepth(2);
      ground.fillStyle(p.color, 0.85);
      ground.fillRoundedRect(p.x - p.w / 2 - 8, this.baseY + 2, p.w + 16, 8, 4);
      // Vage kolom-baan zodat het stapelen duidelijk is
      ground.fillStyle(p.color, 0.05);
      ground.fillRoundedRect(p.x - p.w / 2 - 4, 214, p.w + 8, this.baseY - 214 + 2, 8);

      const lbl = this.add.text(p.x, this.baseY + 22, p.label, {
        fontFamily: 'Arial', fontSize: '13px', fontStyle: 'bold',
        color: '#' + p.color.toString(16).padStart(6, '0'),
      }).setOrigin(0.5);

      p.cntText = this.add.text(p.x, this.baseY + 40, '', {
        fontFamily: 'Arial', fontSize: '13px', color: '#cbd5e1',
      }).setOrigin(0.5);

      const btn = this.makePaletteBtn(p);

      this.boardItems.push(ground, lbl, p.cntText, btn);
    });

    this.updateHeader();
    this.newRound();
  }

  makePaletteBtn(p) {
    const y = 648;
    const w = this.places.length === 3 ? 108 : 130, h = 56;
    const c = this.add.container(p.x, y).setDepth(15);
    const bg = this.add.graphics();
    bg.fillStyle(p.color, 0.92);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    bg.lineStyle(2, 0xffffff, 0.25);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
    const t = this.add.text(0, 0, `+${p.val}`, {
      fontFamily: 'Arial Black, Arial', fontSize: '24px', fontStyle: 'bold', color: '#0b1020',
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
    if (isSoundOn()) this.speak('ruilen!');
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
        const blk = this.makeBlock(p.x, cy, p.w, this.bh, p.color, p.blab, p.key);
        this.blocks.push(blk);
        if (p.key === popKey && i === count - 1) {
          this.tweens.add({ targets: blk, scaleX: { from: 1.3, to: 1 }, scaleY: { from: 0.6, to: 1 }, duration: 220, ease: 'Back.easeOut' });
        }
      }
    });
  }

  makeBlock(cx, cy, w, h, color, label, key) {
    const c = this.add.container(cx, cy).setDepth(6);
    const g = this.add.graphics();
    g.fillStyle(color, 0.95);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    g.lineStyle(1.5, 0xffffff, 0.35);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    g.fillStyle(0xffffff, 0.18);
    g.fillRoundedRect(-w / 2 + 3, -h / 2 + 3, w - 6, h * 0.35, 4);
    const t = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black, Arial', fontSize: '14px', fontStyle: 'bold', color: '#0b1020',
    }).setOrigin(0.5);
    c.add([g, t]);
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
      this.breakdownText.setText('Te veel! Haal een blok weg ↩');
    } else {
      this.totalText.setColor('#ffffff');
    }
  }

  success() {
    this.locked = true;
    SFX.win();
    confettiBurst(this);
    if (isSoundOn()) this.speak(this.words(this.target) + '! goed zo!');
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

  speak(text) {
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'nl-NL';
      u.rate = 0.9;
      synth.speak(u);
    } catch (e) {}
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

  // --- Gedeelde helpers (zelfde stijl als andere scenes) ---
  addStars() {
    const { width, height } = this.scale;
    for (let i = 0; i < 50; i++) {
      const s = this.add.image(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), 'star')
        .setAlpha(Phaser.Math.FloatBetween(0.2, 0.7)).setDepth(-1);
      this.tweens.add({ targets: s, alpha: 0.1, duration: Phaser.Math.Between(1500, 3000), yoyo: true, repeat: -1 });
    }
  }

  backBtn() {
    const b = this.add.text(16, 16, '⬅ Terug', {
      fontFamily: 'Arial', fontSize: '16px', color: '#94a3b8',
      backgroundColor: '#1e293b', padding: { x: 10, y: 6 },
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
