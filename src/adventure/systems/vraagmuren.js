// ===== SYSTEEM: ANTWOORD-BLOKKEN (meer/minder) =====
// Een muur met een vraag ("waar is MEER?") en twee zweefblokken met getallen:
// spring en raak het juiste blok met een kopstoot → de muur zakt weg.
// Werkwoord: vergelijken. NIET-LEZER-PROOF: onder elk blok hangt een mini
// kubus-stapel (vergelijk léngtes) en het bord toont een groot/klein-icoon.

import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { confettiBurst } from '../../reward.js';
import { sig, darker } from '../palette.js';

function hit(s, vm, blok) {
  const bc = blok._art;
  if (blok._idx === vm.goedIdx) {
    vm.opgelost = true;
    SFX.correct(); Voice.cue('great');
    s.tweens.add({ targets: bc, y: bc.y - 18, duration: 120, yoyo: true, ease: 'Quad.out' });
    const flash = s.add.graphics().setDepth(6);
    flash.fillStyle(0x2fae4e, 0.5); flash.fillRoundedRect(bc.x - 28, bc.y - 26, 56, 52, 10);
    s.tweens.add({ targets: flash, alpha: 0, duration: 600, onComplete: () => flash.destroy() });
    // de muur zakt in de grond
    vm.body.body.enable = false;
    s.tweens.add({ targets: vm.art, y: 480, alpha: 0.2, duration: 700, ease: 'Quad.in' });
    confettiBurst(s, 90); s.cameraPunch(); SFX.yay();
    s.burstStars(vm.x, 400, 10);
    s.questText.setText('Goed gekozen! De muur zakt weg! 🚩');
  } else {
    s.rekenFouten += 1; // telt mee voor de foutloos-ster
    SFX.wrong(); Voice.cue('oops');
    s.tweens.add({ targets: bc, x: bc.x + 6, duration: 60, yoyo: true, repeat: 3 });
    const flash = s.add.graphics().setDepth(6);
    flash.fillStyle(0xe8402c, 0.45); flash.fillRoundedRect(bc.x - 28, bc.y - 26, 56, 52, 10);
    s.tweens.add({ targets: flash, alpha: 0, duration: 500, onComplete: () => flash.destroy() });
    s.questText.setText(vm.kies === 'meer' ? 'Oeps — welk getal is MEER?' : 'Oeps — welk getal is MINDER?');
  }
}

export default {
  build(s, L) {
    s.vraagMuren = [];
    s.antwoordGroup = s.physics.add.staticGroup();
    (L.vraagMuren || []).forEach((V) => {
      const groundTop = L.platforms[0][1];
      const goedIdx = V.kies === 'meer'
        ? (V.opties[0] > V.opties[1] ? 0 : 1)
        : (V.opties[0] < V.opties[1] ? 0 : 1);
      // schermhoge blokkade + zichtbare rotsmuur
      const body = s.add.rectangle(V.x, (40 + groundTop) / 2, 46, groundTop - 40, 0x000000, 0);
      s.physics.add.existing(body, true);
      s.doorGroup.add(body);
      const art = s.add.container(V.x, 0).setDepth(4);
      const g = s.add.graphics();
      g.fillStyle(0x7d838c, 1); g.fillRoundedRect(-23, 120, 46, groundTop - 118, 10);
      g.fillStyle(0x9aa0a6, 1); g.fillRoundedRect(-23, 120, 46, 14, 6);
      g.lineStyle(3, 0x5b6168, 1); g.strokeRoundedRect(-23, 120, 46, groundTop - 118, 10);
      const bord = s.add.container(0, 96);
      const bg = s.add.graphics();
      bg.fillStyle(0xf3e2c0, 1); bg.lineStyle(3, 0x9c6b3f, 1);
      bg.fillRoundedRect(-66, -20, 132, 40, 10); bg.strokeRoundedRect(-66, -20, 132, 40, 10);
      const vt = s.add.text(-12, 0, V.kies === 'meer' ? 'MEER?' : 'MINDER?', {
        fontFamily: 'Arial Black, Arial', fontSize: '16px', fontStyle: 'bold', color: '#16202b',
      }).setOrigin(0.5);
      // NIET-LEZER: icoon naast het woord — klein & groot staafje, met een
      // groene ring om wat je zoekt (het lange of het korte).
      const ic = s.add.graphics();
      ic.fillStyle(0x9c6b3f, 1);
      ic.fillRoundedRect(40, -2, 7, 10, 2);   // klein staafje
      ic.fillRoundedRect(51, -10, 7, 18, 2);  // groot staafje
      ic.lineStyle(2.5, 0x2fae4e, 1);
      if (V.kies === 'meer') ic.strokeCircle(54.5, -1, 9);
      else ic.strokeCircle(43.5, 3, 9);
      bord.add([bg, vt, ic]);
      art.add([g, bord]);
      // twee antwoord-blokken vóór de muur
      const blokken = V.opties.map((val, i) => {
        const bx = V.x - 190 + i * 105, by = 410;
        const blok = s.add.rectangle(bx, by, 56, 52, 0x000000, 0);
        s.physics.add.existing(blok, true);
        s.antwoordGroup.add(blok);
        const bc = s.add.container(bx, by).setDepth(5);
        const bgra = s.add.graphics();
        bgra.fillStyle(0xf6c624, 1); bgra.fillRoundedRect(-28, -26, 56, 52, 10);
        bgra.fillStyle(0xffe16b, 1); bgra.fillRoundedRect(-24, -22, 48, 20, 8);
        bgra.lineStyle(3.5, 0xb98d12, 1); bgra.strokeRoundedRect(-28, -26, 56, 52, 10);
        const num = s.add.text(0, 0, `${val}`, { fontFamily: 'Arial Black, Arial', fontSize: '24px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5);
        // NIET-LEZER: mini kubus-stapel onder het blok — je vergelijkt
        // hoevéélheden (lengte van de toren), niet alleen cijfers.
        const stack = s.add.graphics();
        const cw = 14, ch = 7, col = sig(val);
        for (let k = 0; k < val; k++) {
          stack.fillStyle(col, 1); stack.fillRoundedRect(-cw / 2, 32 + k * ch, cw, ch - 1.5, 2);
        }
        stack.lineStyle(1.5, darker(col, 45), 1); stack.strokeRoundedRect(-cw / 2, 32, cw, val * ch, 2);
        bc.add([bgra, num, stack]);
        blok._art = bc; blok._idx = i;
        return blok;
      });
      const vm = { ...V, body, art, blokken, goedIdx, opgelost: false, lastHit: 0, cuePlayed: false };
      blokken.forEach((b) => { b._vm = vm; });
      s.vraagMuren.push(vm);
    });
  },

  // Kopstoot-detectie: overlap i.p.v. botsing, zodat óók een gegroeide (lange)
  // speler — die niet ónder het blok past — gewoon kan springen en raken.
  afterPlayer(s) {
    s.physics.add.overlap(s.player, s.antwoordGroup, (pl, blok) => {
      const vm = blok._vm;
      if (!vm || vm.opgelost || s.time.now < vm.lastHit + 500) return;
      if (pl.body.velocity.y < -40 && pl.body.bottom > blok.body.bottom) {
        vm.lastHit = s.time.now;
        pl.body.setVelocityY(90); // kopstoot: je stuitert er zachtjes vanaf
        hit(s, vm, blok);
      }
    });
  },

  update(s) {
    const p = s.player;
    for (const vm of s.vraagMuren) {
      if (vm.opgelost) continue;
      if (Math.abs(p.x - (vm.x - 140)) < 170) {
        if (!vm.cuePlayed) { vm.cuePlayed = true; Voice.cue('greet'); }
        s.questText.setText(`Spring tegen het blok met ${vm.kies.toUpperCase()}! ⬆`);
      }
    }
  },
};
