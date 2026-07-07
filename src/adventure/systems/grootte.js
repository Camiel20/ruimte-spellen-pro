// ===== SYSTEEM: GROOT & KLEIN (Reuzenland, Wereld 10) =====
// De hoofd-werkwoorden van Reuzenland: HAPPEN en KRIMPEN.
//  - Een REUZENHAP 🍎 maakt je een stampende reus (schaal-factor GIANT). Als
//    reus verpletter je REUZENBLOKKEN die de weg versperren en squish je
//    Grommels gewoon plat.
//  - Een KRIMPBES 🫐 maakt je muizeklein (TINY). Klein pas je door de LAGE
//    TUNNELS — plafonds waar je normaal met je kop tegenaan botst.
//  - Een MAATBLOEM 🌼 zet je terug op je eigen maat.
// De maat is een schaal BOVENOP je waarde: hij loopt via hetzelfde veilige
// resize-pad als groeien/splitsen (drawPlayer + body.reset), dus geen gevecht
// met de physics-body. Lage tunnels gaten "meten" je vanzelf via de physics
// (te groot = je kop botst) — geen fragiele "ben ik klein?"-checks nodig.
//
// Leerdoel: GROTER / KLEINER — het fundament onder vergelijken en meten.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';

export const GIANT = 1.75;   // schaal als reus
export const TINY = 0.5;     // schaal als muisje
export const GIANT_MIN = 1.4; // vanaf deze schaal tel je als "reus" (smash/squish)

// Teken een stukje fruit (reuzenhap / krimpbes / maatbloem) ín een container.
function tekenFruit(scene, soort) {
  const g = scene.add.graphics();
  if (soort === 'groot') {
    // grote glimmende rode appel met blad + steeltje
    g.fillStyle(0x000000, 0.14); g.fillEllipse(0, 22, 34, 8);
    g.fillStyle(0xe8402c, 1); g.fillCircle(-7, 0, 16); g.fillCircle(7, 0, 16); g.fillCircle(0, 3, 17);
    g.fillStyle(0xff7a5c, 0.7); g.fillEllipse(-6, -6, 8, 12);
    g.fillStyle(0x7a4a1e, 1); g.fillRect(-2, -20, 4, 10);
    g.fillStyle(0x57b947, 1); g.fillEllipse(9, -16, 16, 9);
  } else if (soort === 'klein') {
    // klein trosje blauwe besjes
    g.fillStyle(0x000000, 0.12); g.fillEllipse(0, 14, 22, 6);
    g.fillStyle(0x4a7fd6, 1); g.fillCircle(-6, 2, 8); g.fillCircle(6, 3, 8); g.fillCircle(0, -4, 8);
    g.fillStyle(0x8fb6f0, 0.8); g.fillCircle(-8, -1, 3); g.fillCircle(4, 0, 3); g.fillCircle(-2, -7, 3);
    g.fillStyle(0x2f7d33, 1); g.fillEllipse(3, -12, 12, 6);
  } else {
    // vrolijk madeliefje = terug naar je eigen maat
    g.fillStyle(0xffffff, 1);
    for (let a = 0; a < 8; a++) { const ang = (a / 8) * Math.PI * 2; g.fillEllipse(Math.cos(ang) * 12, Math.sin(ang) * 12, 8, 5); }
    g.fillStyle(0xffcf3f, 1); g.fillCircle(0, 0, 8);
  }
  return g;
}

export default {
  build(s, L) {
    s.grootteFruit = [];
    const maakFruit = (x, y, soort) => {
      const c = s.add.container(x, y).setDepth(6);
      const glow = s.add.circle(0, 0, 22, soort === 'klein' ? 0x9fc0ff : soort === 'groot' ? 0xffb0a0 : 0xfff3b0, 0.4);
      c.add([glow, tekenFruit(s, soort)]);
      s.tweens.add({ targets: c, y: y - 8, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      s.tweens.add({ targets: glow, scale: 1.3, alpha: 0.15, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      s.grootteFruit.push({ c, x, y, soort, taken: false });
    };
    (L.reuzenhappen || []).forEach(([x, y]) => maakFruit(x, y, 'groot'));
    (L.krimpbessen || []).forEach(([x, y]) => maakFruit(x, y, 'klein'));
    (L.maatbloemen || []).forEach(([x, y]) => maakFruit(x, y, 'normaal'));

    // LAGE TUNNELS: een massief plafond-blok (van de bovenkant tot ceilingY).
    // Het zit in de gewone platform-groep, dus de bestaande speler-collider
    // regelt het: te groot = je kop botst; muizeklein = je glipt eronder door.
    (L.lageTunnels || []).forEach(([x, ceilingY, w]) => {
      const body = s.add.rectangle(x + w / 2, ceilingY / 2, w, ceilingY, 0x000000, 0);
      s.physics.add.existing(body, true);
      s.platforms.add(body);
      body._noCheckpoint = true; // geen checkpoint tegen een plafond
      // rots-plafond met stalactieten en een "kruip hier!"-gevoel
      const g = s.add.graphics().setDepth(-9);
      g.fillStyle(0x8a7a5e, 1); g.fillRect(x, 0, w, ceilingY);
      g.fillStyle(0x6f6046, 1); g.fillRect(x, ceilingY - 14, w, 14);
      g.fillStyle(0x9c8c6e, 0.6);
      for (let bx = x + 10; bx < x + w; bx += 40) g.fillEllipse(bx, ceilingY - 26, 18, 10);
      g.fillStyle(0x6f6046, 1);
      for (let bx = x + 22; bx < x + w - 12; bx += 54) g.fillTriangle(bx - 7, ceilingY, bx + 7, ceilingY, bx, ceilingY + 16);
      // mos-randje onderaan
      g.fillStyle(0x4fae4a, 0.8);
      for (let bx = x + 6; bx < x + w; bx += 12) g.fillCircle(bx, ceilingY - 2, 3);
    });

    // REUZENBLOKKEN: massieve rotsblokken die de weg versperren. Als reus loop
    // je er dwars doorheen (verplettert); anders zijn ze gewoon solide.
    s.reuzenBlokGroup = s.physics.add.staticGroup();
    s.reuzenBlokken = [];
    (L.reuzenBlokken || []).forEach(([x, y, w, h]) => {
      const body = s.add.rectangle(x + w / 2, y + h / 2, w, h, 0x000000, 0);
      s.physics.add.existing(body, true);
      s.reuzenBlokGroup.add(body);
      const art = s.add.container(x + w / 2, y + h / 2).setDepth(-8);
      const g = s.add.graphics();
      g.fillStyle(0x9a8f7a, 1); g.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
      g.fillStyle(0x847a66, 1); g.fillRect(-w / 2, h / 2 - 12, w, 12);
      g.fillStyle(0xb4a992, 0.5); g.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w * 0.3, 10, 4);
      g.lineStyle(3, 0x6a6152, 1); g.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
      // steen-voegen
      g.lineStyle(2, 0x6a6152, 0.6);
      g.beginPath(); g.moveTo(-w / 2, 0); g.lineTo(w / 2, 0); g.strokePath();
      g.beginPath(); g.moveTo(0, -h / 2); g.lineTo(0, 0); g.strokePath();
      g.beginPath(); g.moveTo(-w * 0.15, 0); g.lineTo(-w * 0.15, h / 2); g.strokePath();
      art.add(g); body._art = art;
      s.reuzenBlokken.push(body);
    });
  },

  afterPlayer(s) {
    if (!s.reuzenBlokGroup) return;
    // Solide — behalve als je een reus bent: dan beuk je er dwars doorheen.
    s.physics.add.collider(s.player, s.reuzenBlokGroup, null, (player, block) => {
      if (block._broken) return false;
      if (s.reus >= GIANT_MIN) { s.smashReuzenBlok(block); return false; }
      return true;
    });
  },

  update(s) {
    if (!s.grootteFruit || !s.grootteFruit.length) return;
    const b = s.player.body;
    for (const f of s.grootteFruit) {
      if (f.taken) continue;
      const factor = f.soort === 'groot' ? GIANT : f.soort === 'klein' ? TINY : 1;
      // eerste keer bij maat-fruit in dit level: gesproken uitleg
      if (!s._maatHint && f.soort !== 'normaal' && Math.abs(s.player.x - f.x) < 260) {
        s._maatHint = true;
        Voice.hint(f.soort === 'groot' ? 'hint-reus' : 'hint-muis', 300);
      }
      if ((s.reus || 1) === factor) continue; // al deze maat — fruit blijft liggen
      // Ruimhartig vangen, gemeten aan je LIJF (niet je midden — het midden
      // van een lange speler hangt hoog en miste het fruit juist bij een
      // sprong erop, de Adrian-bug). Twee manieren, wie het eerst raakt wint:
      //  1. de CIRKEL: het fruit zit < 56px van je lijf (scheer je erlangs,
      //     in welke richting ook — ook de appels op richels).
      //  2. de KOLOM: je springt er recht overheen (tot ~165px boven het
      //     fruit telt nog) — Mario-munt-ruimhartig.
      const dx = Math.max(b.left - f.x, 0, f.x - b.right); // afstand tot je lijf (x)
      const dy = Math.max(b.top - f.y, 0, f.y - b.bottom); //  … en in y
      const cirkel = dx * dx + dy * dy < 56 * 56;
      // De kolom telt alleen rond de sprong-piek en tijdens het dalen: zo
      // vangt een sprong ÓP het fruit altijd, maar kun je er in de klim van
      // een (dubbel)sprong bewust overheen — belangrijk bij de kies-stations.
      const kolom = b.velocity.y > -60 && dx < 40 && (f.y - b.bottom) < 165 && (b.top - f.y) < 60;
      if (cirkel || kolom) {
        f.taken = true;
        SFX.coin();
        s.setReus(factor, f.soort);
        // het fruit groeit na een paar tellen terug (anti-vastloper — je kunt
        // altijd terug naar de goede maat)
        s.tweens.add({ targets: f.c, scale: 0, duration: 200, ease: 'Back.in' });
        s.time.delayedCall(3500, () => {
          if (!f.c.active) return;
          f.taken = false; SFX.sparkle();
          s.tweens.add({ targets: f.c, scale: 1, duration: 260, ease: 'Back.out' });
        });
      }
    }
  },
};
