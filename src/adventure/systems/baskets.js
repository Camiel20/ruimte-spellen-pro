// ===== SYSTEEM: DE BASKET (het Stuiter-Stadion, Wereld 14) =====
// Precies tellen mét motoriek: "gooi er PRECIES doel in de basket!" Elke tik
// op de ballenbak werpt een bal in een mooie boog — altijd raak (het gaat om
// TELLEN en op tijd STOPPEN, niet om mikken). De stippen op het scorebord
// lopen mee. Bij precies doel: luid de bel → de doorgang gaat open. Eén te
// veel? De basket kiepert alle ballen er giechelend uit en je telt opnieuw
// (het pannenkoeken-toren-recept, maar dan in de wereld zelf).
// Veld: `baskets: [{ x, doel }]` — doel 3-15; de slagboom staat op x + 180.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { confettiBurst } from '../../reward.js';

export const BASKET_MUUR = 180; // afstand basket → slagboom (voor de validator)

function tekenBalletje(s, r = 11) {
  const g = s.add.graphics();
  g.fillStyle(0xf07c1f, 1); g.fillCircle(0, 0, r);
  g.lineStyle(1.8, 0xb35510, 1);
  g.strokeCircle(0, 0, r);
  g.beginPath(); g.moveTo(-r, 0); g.lineTo(r, 0); g.strokePath();
  g.beginPath(); g.arc(-r, 0, r, -0.5, 0.5); g.strokePath();
  g.beginPath(); g.arc(r, 0, r, Math.PI - 0.5, Math.PI + 0.5); g.strokePath();
  g.fillStyle(0xffffff, 0.35); g.fillEllipse(-4, -4, 6, 4);
  return g;
}

function tekenStippen(s, BK) {
  const bar = BK.stipBar;
  bar.clear();
  const per = 5; // rijen van 5 — netjes telbaar
  for (let i = 0; i < BK.doel; i++) {
    const rij = Math.floor(i / per);
    const px = (i % per) * 15 - (Math.min(BK.doel, per) - 1) * 7.5;
    const py = rij * 15;
    if (i < BK.teller) { bar.fillStyle(0xf07c1f, 1); bar.fillCircle(px, py, 5.6); }
    bar.lineStyle(1.8, 0xb35510, 1); bar.strokeCircle(px, py, 5.6);
  }
}

function werp(s, BK) {
  if (BK.klaar || BK.blokkade) return;
  BK.teller += 1;
  SFX.pick();
  s.tweens.add({ targets: BK.bak, scaleY: 0.88, duration: 90, yoyo: true });
  const bal = s.add.container(BK.bakX, BK.bakY - 20).setDepth(9);
  bal.add(tekenBalletje(s));
  const start = { x: BK.bakX, y: BK.bakY - 20 };
  const boog = { t: 0 };
  s.tweens.add({
    targets: boog, t: 1, duration: 520, ease: 'Sine.inOut',
    onUpdate: () => {
      bal.x = Phaser.Math.Linear(start.x, BK.ringX, boog.t);
      bal.y = Phaser.Math.Linear(start.y, BK.ringY, boog.t) - Math.sin(boog.t * Math.PI) * 180;
      bal.angle = boog.t * 300;
    },
    onComplete: () => {
      // SWISH! Door het net, en weg is-ie (de stippen onthouden hem).
      SFX.place();
      s.tweens.add({ targets: BK.net, scaleY: 1.25, duration: 120, yoyo: true, ease: 'Quad.out' });
      s.tweens.add({ targets: bal, y: BK.ringY + 34, scale: 0.6, alpha: 0, duration: 220, ease: 'Quad.in', onComplete: () => bal.destroy() });
      Voice.number(BK.teller);
      tekenStippen(s, BK);
      s.tweens.add({ targets: BK.scoreBord, scale: 1.12, duration: 110, yoyo: true });
      if (BK.teller > BK.doel) kieper(s, BK);
      else if (BK.teller === BK.doel) {
        s.questText.setText(`${BK.doel}! Precies goed — LUID DE BEL! 🔔`);
        s.tweens.add({ targets: BK.bel, scale: 1.18, duration: 300, yoyo: true, repeat: 3 });
      }
    },
  });
}

function kieper(s, BK) {
  BK.blokkade = true;
  s.rekenFouten += 1;
  BK.fouten = (BK.fouten || 0) + 1;
  SFX.oops(); Voice.cue('oops'); SFX.giggle();
  s.questText.setText(`Oei — dat waren er ${BK.teller}, eentje te veel! 😅`);
  // de basket kiepert om: alle ballen stuiteren eruit
  s.tweens.add({ targets: BK.ringC, angle: -70, duration: 300, yoyo: true, delay: 150, ease: 'Quad.out' });
  for (let i = 0; i < Math.min(BK.teller, 9); i++) {
    const bal = s.add.container(BK.ringX, BK.ringY + 10).setDepth(9);
    bal.add(tekenBalletje(s, 9));
    s.tweens.add({
      targets: bal, x: BK.ringX - 40 - Math.random() * 120, y: BK.ringY + 150 + Math.random() * 40,
      angle: -360, duration: 550 + i * 70, ease: 'Quad.in', onComplete: () => bal.destroy(),
    });
  }
  s.time.delayedCall(1400, () => {
    BK.teller = 0;
    tekenStippen(s, BK);
    BK.blokkade = false;
    s.questText.setText(`Opnieuw — tel maar mee tot ${BK.doel}!`);
    if (BK.fouten >= 2) Voice.hint('hint-basket', 600);
  });
}

function luidBel(s, BK) {
  if (BK.klaar || BK.blokkade) return;
  if (BK.teller === BK.doel) {
    BK.klaar = true;
    SFX.fanfare(); Voice.cue('cheer'); confettiBurst(s, 110); s.cameraPunch();
    s.questText.setText(`PRECIES ${BK.doel} — wat een score! 🏀`);
    s.burstStars(BK.ringX, BK.ringY - 40, 10);
    BK.body.body.enable = false;
    s.doorGroup.remove(BK.body, false, false);
    s.tweens.add({ targets: BK.muurArt, y: 480, alpha: 0.2, duration: 700, ease: 'Quad.in' });
    s.vierMijlpaal(BK.x);
  } else if (BK.teller < BK.doel) {
    SFX.wrong(); Voice.number(BK.teller);
    s.questText.setText(`Nog niet — er zitten er pas ${BK.teller} in, we willen er ${BK.doel}!`);
    s.tweens.add({ targets: BK.bel, x: BK.bel.x + 5, duration: 60, yoyo: true, repeat: 4 });
  }
}

export default {
  build(s, L) {
    s.baskets = [];
    (L.baskets || []).forEach((B0) => {
      const groundTop = L.platforms[0][1];
      const ringX = B0.x, ringY = groundTop - 190;

      // de paal + het bord + de ring met net
      const paal = s.add.graphics().setDepth(3);
      paal.fillStyle(0x000000, 0.14); paal.fillEllipse(B0.x + 26, groundTop + 2, 60, 10);
      paal.fillStyle(0x8a8f96, 1); paal.fillRoundedRect(B0.x + 20, ringY - 60, 12, groundTop - ringY + 60, 5);
      paal.fillStyle(0xf5f9fc, 1); paal.fillRoundedRect(B0.x - 26, ringY - 66, 72, 52, 6);
      paal.lineStyle(3, 0xe8402c, 1); paal.strokeRoundedRect(B0.x - 26, ringY - 66, 72, 52, 6);
      paal.lineStyle(2.5, 0xe8402c, 0.8); paal.strokeRect(B0.x - 8, ringY - 44, 30, 24);

      const ringC = s.add.container(ringX, ringY).setDepth(5);
      const rg = s.add.graphics();
      rg.lineStyle(4.5, 0xe8402c, 1); rg.strokeEllipse(0, 0, 52, 14);
      ringC.add(rg);
      const net = s.add.graphics();
      net.lineStyle(1.8, 0xf5f9fc, 0.9);
      for (let i = -2; i <= 2; i++) {
        net.beginPath(); net.moveTo(i * 11, 4); net.lineTo(i * 7, 34); net.strokePath();
      }
      net.beginPath(); net.moveTo(-15, 20); net.lineTo(15, 20); net.strokePath();
      ringC.add(net);

      // scorebord met stippen op de paal
      const scoreBord = s.add.container(B0.x + 26, ringY - 110).setDepth(7);
      const sg = s.add.graphics();
      const rijen = Math.ceil(B0.doel / 5);
      sg.fillStyle(0x16202b, 0.6); sg.fillRoundedRect(-52, -24, 104, 26 + rijen * 15, 12);
      scoreBord.add(sg);
      scoreBord.add(s.add.text(0, -12, `🏀 gooi er ${B0.doel}!`, {
        fontFamily: 'Arial Black, Arial', fontSize: '13px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5));
      const stipBar = s.add.graphics();
      stipBar.setY(8);
      scoreBord.add(stipBar);
      s.tweens.add({ targets: scoreBord, y: scoreBord.y - 5, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

      // de ballenbak (grote tik-knop) links van de paal
      const bakX = B0.x - 104, bakY = groundTop - 20;
      const bak = s.add.container(bakX, bakY).setDepth(6);
      const bkg = s.add.graphics();
      bkg.fillStyle(0x000000, 0.14); bkg.fillEllipse(0, 22, 96, 12);
      bkg.fillStyle(0x8a6a45, 1); bkg.fillRoundedRect(-44, -18, 88, 38, 8);
      bkg.fillStyle(0x6e5436, 1); bkg.fillEllipse(0, -18, 88, 18);
      bak.add(bkg);
      // een bak vol ballen
      [[-24, -18], [0, -24], [22, -17], [-10, -14], [12, -12]].forEach(([bx, by]) => {
        const mb = tekenBalletje(s, 10); mb.setPosition(bx, by); bak.add(mb);
      });
      bak.add(s.add.text(0, 34, '👆 GOOI!', { fontFamily: 'Arial Black, Arial', fontSize: '14px', fontStyle: 'bold', color: '#f07c1f' }).setOrigin(0.5).setStroke('#ffffff', 4));
      bak.setSize(100, 78).setInteractive({ useHandCursor: true });
      s.tweens.add({ targets: bak, y: bakY - 4, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

      // de gouden bel (klaar!) rechts van de paal
      const bel = s.add.container(B0.x + 96, groundTop - 46).setDepth(6);
      const blg = s.add.graphics();
      blg.fillStyle(0xffd24d, 1); blg.fillRoundedRect(-26, -24, 52, 40, 12);
      blg.fillStyle(0xb98d12, 1); blg.fillRoundedRect(-26, 8, 52, 10, 5);
      bel.add(blg);
      bel.add(s.add.text(0, -6, '🔔', { fontSize: '22px' }).setOrigin(0.5));
      bel.add(s.add.text(0, 30, 'KLAAR!', { fontFamily: 'Arial Black, Arial', fontSize: '12px', fontStyle: 'bold', color: '#b98d12' }).setOrigin(0.5).setStroke('#ffffff', 3));
      bel.setSize(64, 76).setInteractive({ useHandCursor: true });

      // de slagboom (schermhoge blokkade)
      const muurX = B0.x + BASKET_MUUR;
      const body = s.add.rectangle(muurX, (40 + groundTop) / 2, 46, groundTop - 40, 0x000000, 0);
      s.physics.add.existing(body, true);
      s.doorGroup.add(body);
      const muurArt = s.add.container(muurX, 0).setDepth(4);
      const mg = s.add.graphics();
      mg.fillStyle(0x4fae4a, 1); mg.fillRoundedRect(-23, 150, 46, groundTop - 148, 10);
      mg.fillStyle(0x6fc26a, 1); mg.fillRoundedRect(-23, 150, 46, 14, 6);
      mg.lineStyle(3, 0x2f7d33, 1); mg.strokeRoundedRect(-23, 150, 46, groundTop - 148, 10);
      mg.fillStyle(0xffffff, 0.85);
      for (let ky = 190; ky < groundTop - 30; ky += 90) mg.fillCircle(0, ky, 8); // witte stippen (ballen)
      muurArt.add(mg);

      const BK = {
        ...B0, ringX, ringY, ringC, net, scoreBord, stipBar, bak, bakX, bakY, bel, body, muurArt,
        teller: 0, klaar: false, blokkade: false, fouten: 0, cuePlayed: false,
      };
      tekenStippen(s, BK);
      bak.on('pointerdown', () => werp(s, BK));
      bel.on('pointerdown', () => luidBel(s, BK));
      s.baskets.push(BK);
    });
  },

  update(s) {
    if (!s.baskets || !s.baskets.length) return;
    const p = s.player;
    for (const BK of s.baskets) {
      if (BK.klaar) continue;
      if (!BK.cuePlayed && Math.abs(p.x - BK.x) < 260) {
        BK.cuePlayed = true;
        Voice.hint('hint-basket');
        s.questText.setText(`Gooi er PRECIES ${BK.doel} in — en stop op tijd! 🏀`);
      }
    }
  },
};
