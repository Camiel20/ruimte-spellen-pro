// ===== SYSTEEM: DE KNOPEN-WINKEL (de Kleren-Kast, Wereld 13) =====
// Het betaal-werkwoord: in de winkel kost een cadeautje bijvoorbeeld 7
// knopen. Op de toonbank liggen knopen-munten van 1, 2 en 5 — tik munten in
// het bakje tot je er PRECIES genoeg hebt (stipjes tellen mee, niet-lezer-
// proof). Te veel? Het bakje kiept giechelend om en je begint opnieuw.
// Precies goed = GEKOCHT — de winkeldeur gaat open. Leerdoel: bedragen
// samenstellen met munten van 1/2/5 (geld-rekenen groep 3).
// Veld: `knopenWinkels: [{ x, prijs }]` — prijs 3-15; deur op x + 160.

import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { confettiBurst } from '../../reward.js';

export const WINKEL_DEUR = 160; // afstand kraam → deur (ook voor de validator)
const MUNTEN = [1, 2, 5];
const MUNT_KLEUR = { 1: 0xc9855c, 2: 0xb9bfc6, 5: 0xf0c060 }; // koper/zilver/goud

function tekenKnoopMunt(s, waarde, r = 17) {
  const g = s.add.graphics();
  const kleur = MUNT_KLEUR[waarde] || 0xf0c060;
  g.fillStyle(0x000000, 0.14); g.fillEllipse(1, r + 3, r * 2, 6);
  g.fillStyle(kleur, 1); g.fillCircle(0, 0, r);
  g.lineStyle(2.5, 0x8a6a45, 1); g.strokeCircle(0, 0, r);
  g.lineStyle(1.6, 0xffffff, 0.5); g.strokeCircle(0, 0, r - 4);
  // knoopsgaatjes
  g.fillStyle(0x8a6a45, 1);
  g.fillCircle(-3.4, -3.4, 1.6); g.fillCircle(3.4, -3.4, 1.6);
  g.fillCircle(-3.4, 3.4, 1.6); g.fillCircle(3.4, 3.4, 1.6);
  return g;
}

function tekenStippen(s, W) {
  const bar = W.stipBar;
  bar.clear();
  const per = Math.min(W.prijs, 8);
  for (let i = 0; i < W.prijs; i++) {
    const rij = Math.floor(i / per);
    const px = (i % per) * 13 - ((Math.min(W.prijs, per) - 1) * 13) / 2;
    const py = rij * 14;
    if (i < W.saldo) { bar.fillStyle(0xf0c060, 1); bar.fillCircle(px, py, 5); }
    bar.lineStyle(1.8, 0x8a6a45, 1); bar.strokeCircle(px, py, 5);
  }
}

function betaal(s, W, waarde, munt) {
  if (W.klaar || W.blokkade) return;
  W.saldo += waarde;
  SFX.coin();
  // een kopie van de munt vliegt in het bakje
  const vlieg = s.add.container(munt.x, munt.y).setDepth(9);
  vlieg.add(tekenKnoopMunt(s, waarde, 15));
  s.tweens.add({ targets: munt, scale: 0.85, duration: 90, yoyo: true });
  s.tweens.add({
    targets: vlieg, x: W.bakX, y: W.bakY - 8, angle: 220, duration: 340, ease: 'Sine.inOut',
    onComplete: () => {
      vlieg.destroy();
      SFX.place();
      Voice.number(Math.min(W.saldo, 20));
      tekenStippen(s, W);
      s.tweens.add({ targets: W.stipBord, scale: 1.12, duration: 110, yoyo: true });
      if (W.saldo === W.prijs) {
        gekocht(s, W);
      } else if (W.saldo > W.prijs) {
        teVeel(s, W);
      } else {
        s.questText.setText(`${W.saldo} knopen… we willen er ${W.prijs}. Nog wat erbij! 🧵`);
      }
    },
  });
}

function teVeel(s, W) {
  W.blokkade = true;
  s.rekenFouten += 1;
  SFX.oops(); Voice.cue('oops'); SFX.giggle();
  s.questText.setText(`Oei — dat is ${W.saldo}, te veel! Het bakje kiept om… 😅`);
  // het bakje kiept: knoopjes stuiteren eruit
  s.tweens.add({ targets: W.bak, angle: -110, duration: 320, yoyo: true, delay: 120, ease: 'Quad.out' });
  for (let i = 0; i < Math.min(W.saldo, 8); i++) {
    const k = s.add.container(W.bakX, W.bakY - 6).setDepth(9);
    k.add(tekenKnoopMunt(s, 1, 8));
    s.tweens.add({
      targets: k, x: W.bakX - 30 - Math.random() * 90, y: W.bakY + 30, angle: -300,
      duration: 500 + i * 70, ease: 'Quad.in', onComplete: () => k.destroy(),
    });
  }
  W.fouten = (W.fouten || 0) + 1;
  s.time.delayedCall(1300, () => {
    W.saldo = 0;
    tekenStippen(s, W);
    W.blokkade = false;
    s.questText.setText(`Opnieuw — betaal PRECIES ${W.prijs} knopen! 🧵`);
    if (W.fouten >= 2) {
      // anti-gok: wijs de munt aan die nu nog precies past
      const rest = W.prijs;
      const past = [...MUNTEN].reverse().find((m) => m <= rest);
      const munt = W.munten.find((mu) => mu.waarde === past);
      if (munt) s.pulsHulp(munt);
      Voice.hint('hint-winkel', 900);
    }
  });
}

function gekocht(s, W) {
  W.klaar = true;
  W.body.body.enable = false;
  s.doorGroup.remove(W.body, false, false);
  SFX.fanfare(); Voice.cue('cheer'); confettiBurst(s, 110); s.cameraPunch();
  s.questText.setText(`PRECIES ${W.prijs} — gekocht! 🎁`);
  // het cadeautje springt blij op en het deur-doek schuift open
  s.tweens.add({ targets: W.cadeau, y: W.cadeau.y - 26, duration: 220, yoyo: true, repeat: 2, ease: 'Quad.out' });
  s.burstStars(W.x, W.bakY - 60, 10);
  s.tweens.add({ targets: W.deurArt, y: 480, alpha: 0.2, duration: 700, ease: 'Quad.in' });
  s.vierMijlpaal(W.x);
}

export default {
  build(s, L) {
    s.knopenWinkels = [];
    (L.knopenWinkels || []).forEach((W0) => {
      const groundTop = L.platforms[0][1];

      // de kraam: toonbank + gestreepte luifel
      const kraam = s.add.graphics().setDepth(3);
      kraam.fillStyle(0x000000, 0.14); kraam.fillEllipse(W0.x, groundTop + 2, 200, 14);
      kraam.fillStyle(0xa9855c, 1); kraam.fillRoundedRect(W0.x - 95, groundTop - 74, 190, 74, 8);
      kraam.fillStyle(0xc9a06a, 1); kraam.fillRoundedRect(W0.x - 95, groundTop - 74, 190, 12, 6);
      // luifel
      kraam.fillStyle(0x8a6a45, 1);
      kraam.fillRect(W0.x - 100, groundTop - 168, 8, 100); kraam.fillRect(W0.x + 92, groundTop - 168, 8, 100);
      for (let i = 0; i < 6; i++) {
        kraam.fillStyle(i % 2 ? 0xe8829e : 0xfdf6e8, 1);
        kraam.fillRect(W0.x - 102 + i * 34, groundTop - 178, 34, 16);
        kraam.fillTriangle(W0.x - 102 + i * 34, groundTop - 162, W0.x - 68 + i * 34, groundTop - 162, W0.x - 85 + i * 34, groundTop - 148);
      }

      // het cadeautje dat te koop is (een strik-doosje op de toonbank)
      const cadeau = s.add.container(W0.x + 56, groundTop - 92).setDepth(5);
      const cg = s.add.graphics();
      cg.fillStyle(0xe8402c, 1); cg.fillRoundedRect(-16, -14, 32, 26, 5);
      cg.fillStyle(0xffe16b, 1); cg.fillRect(-3, -14, 6, 26); cg.fillRect(-16, -4, 32, 6);
      cg.fillStyle(0xffe16b, 1); cg.fillCircle(-5, -17, 4); cg.fillCircle(5, -17, 4);
      cadeau.add(cg);
      s.tweens.add({ targets: cadeau, angle: 5, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

      // prijsbord: cadeautje "kost" prijs — met stipjes (niet-lezer-proof)
      const stipBord = s.add.container(W0.x, groundTop - 216).setDepth(7);
      const bg = s.add.graphics();
      const bordW = Math.max(120, Math.min(W0.prijs, 8) * 13 + 44);
      bg.fillStyle(0xfdf6e8, 1); bg.fillRoundedRect(-bordW / 2, -30, bordW, W0.prijs > 8 ? 74 : 60, 12);
      bg.lineStyle(3, 0xb98d12, 1); bg.strokeRoundedRect(-bordW / 2, -30, bordW, W0.prijs > 8 ? 74 : 60, 12);
      stipBord.add(bg);
      stipBord.add(s.add.text(0, -16, `🎁 ${W0.prijs} 🧵`, {
        fontFamily: 'Arial Black, Arial', fontSize: '17px', fontStyle: 'bold', color: '#8a6a45',
      }).setOrigin(0.5));
      const stipBar = s.add.graphics();
      stipBar.setY(6);
      stipBord.add(stipBar);
      s.tweens.add({ targets: stipBord, y: stipBord.y - 5, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

      // het betaal-bakje
      const bakX = W0.x - 56, bakY = groundTop - 86;
      const bak = s.add.container(bakX, bakY).setDepth(5);
      const bkg = s.add.graphics();
      bkg.fillStyle(0x8a6a45, 1); bkg.fillRoundedRect(-24, -12, 48, 18, 6);
      bkg.fillStyle(0x6e5436, 1); bkg.fillEllipse(0, -12, 48, 10);
      bak.add(bkg);

      // de deur (schermhoge blokkade)
      const deurX = W0.x + WINKEL_DEUR;
      const body = s.add.rectangle(deurX, (40 + groundTop) / 2, 46, groundTop - 40, 0x000000, 0);
      s.physics.add.existing(body, true);
      s.doorGroup.add(body);
      const deurArt = s.add.container(deurX, 0).setDepth(4);
      const dg = s.add.graphics();
      dg.fillStyle(0xe8829e, 1); dg.fillRoundedRect(-23, 150, 46, groundTop - 148, 10);
      dg.fillStyle(0xf2b8c8, 1); dg.fillRoundedRect(-23, 150, 46, 14, 6);
      dg.lineStyle(3, 0xd06a88, 1); dg.strokeRoundedRect(-23, 150, 46, groundTop - 148, 10);
      // knopen op het doek
      dg.fillStyle(0xf0c060, 1);
      for (let ky = 200; ky < groundTop - 40; ky += 90) dg.fillCircle(0, ky, 7);
      deurArt.add(dg);

      const W = {
        ...W0, body, deurArt, cadeau, bak, bakX, bakY, stipBord, stipBar,
        saldo: 0, klaar: false, blokkade: false, fouten: 0, cuePlayed: false, munten: [],
      };
      tekenStippen(s, W);

      // de munten op de toonbank: 1, 2 en 5 (oneindig — tik zo vaak je wilt)
      MUNTEN.forEach((waarde, i) => {
        const munt = s.add.container(W0.x - 30 + i * 44, groundTop - 118).setDepth(6);
        munt.add(tekenKnoopMunt(s, waarde));
        munt.add(s.add.text(0, 0, `${waarde}`, {
          fontFamily: 'Arial Black, Arial', fontSize: '15px', fontStyle: 'bold', color: '#5d4426',
        }).setOrigin(0.5));
        munt.waarde = waarde;
        munt.setSize(44, 44).setInteractive({ useHandCursor: true });
        munt.on('pointerdown', () => betaal(s, W, waarde, munt));
        s.tweens.add({ targets: munt, y: munt.y - 4, duration: 800 + i * 140, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        W.munten.push(munt);
      });

      s.knopenWinkels.push(W);
    });
  },

  update(s) {
    if (!s.knopenWinkels || !s.knopenWinkels.length) return;
    const p = s.player;
    for (const W of s.knopenWinkels) {
      if (W.klaar) continue;
      if (!W.cuePlayed && Math.abs(p.x - W.x) < 240) {
        W.cuePlayed = true;
        Voice.hint('hint-winkel');
        s.questText.setText(`Betaal PRECIES ${W.prijs} knopen — tik de munten! 🧵`);
      }
    }
  },
};
