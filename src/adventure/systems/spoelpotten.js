// ===== SYSTEEM: DOORSPOEL-POTTEN (Wc-Wonderland) =====
// Een rij wc-potten met sommen erboven. Spring in de pot met de JUISTE som
// en je wordt doorgespoeld naar de overkant (SPOEEEL! + fonteintje).
// Verkeerde pot? Dan borrel je giechelend uit dezelfde pot weer omhoog.
// Werkwoord: som kiezen (het rekenmoment van deze wereld).

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { confettiBurst } from '../../reward.js';

const POT_AFSTAND = 130;

// Eén wc-pot tekenen (schattig: witte pot, brilletje, stortbakje).
function tekenPot(s, x, groundTop, som) {
  const c = s.add.container(x, groundTop).setDepth(6);
  const g = s.add.graphics();
  g.fillStyle(0x000000, 0.16); g.fillEllipse(0, 2, 78, 12);
  g.fillStyle(0xdfe8ee, 1); g.fillRoundedRect(-16, -58, 32, 30, 6);   // stortbak
  g.fillStyle(0xf5f9fc, 1); g.fillRoundedRect(-13, -54, 26, 10, 4);
  g.fillStyle(0xb9c6d0, 1); g.fillCircle(12, -50, 4);                 // spoelknop
  g.fillStyle(0xf5f9fc, 1);
  g.fillRoundedRect(-11, -30, 22, 22, 5);                             // voet
  g.fillEllipse(0, -32, 56, 22);                                      // pot-rand
  g.fillStyle(0xdfe8ee, 1); g.fillEllipse(0, -33, 44, 15);
  g.fillStyle(0x3fa9e0, 0.85); g.fillEllipse(0, -32, 34, 10);         // spoelwater
  g.lineStyle(2.5, 0x8a97a2, 1); g.strokeEllipse(0, -32, 56, 22);
  c.add(g);
  if (som) {
    const bord = s.add.container(0, -86);
    const bg = s.add.graphics();
    bg.fillStyle(0xffffff, 0.97); bg.fillRoundedRect(-32, -16, 64, 32, 9);
    bg.lineStyle(2.5, 0x8a5a33, 1); bg.strokeRoundedRect(-32, -16, 64, 32, 9);
    bord.add(bg);
    bord.add(s.add.text(0, 0, `${som[0]} + ${som[1]}`, { fontFamily: 'Arial Black, Arial', fontSize: '16px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5));
    c.add(bord);
    s.tweens.add({ targets: bord, y: -90, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }
  return c;
}

// De spoel-reis: speler verdwijnt in de pot, en komt ergens weer omhoog.
function spoel(s, G, pot, goed) {
  s.mode = 'spoel';
  const p = s.player;
  p.body.setVelocity(0, 0);
  p.body.enable = false;
  SFX.split(); Voice.cue('whee');
  s.questText.setText(goed ? 'SPOEEEEL! 🌀' : 'Hmm… waar kom ik uit? 🌀');
  // de pot slikt je op (draaiend het gat in)
  s.tweens.add({ targets: pot, scaleX: 1.12, duration: 100, yoyo: true });
  s.tweens.add({
    targets: p, x: pot.x, y: G.groundTop - 34, scale: 0.15, angle: 540, duration: 480, ease: 'Quad.easeIn',
    onComplete: () => {
      p.setVisible(false); p.setScale(1); p.setAngle(0);
      s.cameras.main.shake(280, 0.004); // onderaardse reis…
      s.time.delayedCall(650, () => {
        const uitX = goed ? G.uitX : pot.x;
        // fontein uit de uitgang!
        const spuit = s.add.graphics().setDepth(7);
        spuit.fillStyle(0x7fd0f0, 0.85); spuit.fillEllipse(uitX, G.groundTop - 60, 30, 70);
        spuit.fillStyle(0xffffff, 0.7); spuit.fillEllipse(uitX, G.groundTop - 88, 18, 34);
        s.tweens.add({ targets: spuit, alpha: 0, duration: 500, onComplete: () => spuit.destroy() });
        p.setVisible(true);
        p.setPosition(uitX, G.groundTop - 120);
        p.body.enable = true;
        p.body.reset(uitX, G.groundTop - 120);
        p.body.setVelocityY(-360); // eruit gelanceerd met het spoelwater
        s.mode = 'explore';
        if (goed) {
          G.klaar = true;
          SFX.fanfare(); Voice.cue('cheer'); confettiBurst(s, 90); s.cameraPunch();
          s.checkpoint = { x: uitX, bottom: G.groundTop };
          s.questText.setText(`${G.opties[G.goedIdx][0]} + ${G.opties[G.goedIdx][1]} = ${G.doel} — doorgespoeld! 🎉`);
          s.vierMijlpaal(uitX);
        } else {
          SFX.oops(); Voice.cue('laugh');
          s.questText.setText(`Brrr — die som is geen ${G.doel}! Probeer een andere pot 💛`);
        }
      });
    },
  });
}

export default {
  build(s, L) {
    s.spoelGroepen = [];
    (L.spoelpotten || []).forEach((SP) => {
      const groundTop = L.platforms[0][1];
      // GESCHUD: de goede pot staat elke speelbeurt ergens anders
      const opties = [...SP.opties];
      for (let k = opties.length - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1));
        [opties[k], opties[j]] = [opties[j], opties[k]];
      }
      const G = { ...SP, opties, groundTop, klaar: false, potten: [], cd: 0 };
      G.goedIdx = opties.findIndex((o) => o[0] + o[1] === SP.doel);
      opties.forEach((som, i) => {
        const pot = tekenPot(s, SP.x + i * POT_AFSTAND, groundTop, som);
        pot.som = som;
        G.potten.push(pot);
      });
      // de uitgang-pot aan de overkant (zonder som-bord)
      G.uitPot = tekenPot(s, SP.uitX, groundTop, null);
      // doel-bord: "zoek de pot met N!"
      const doelBord = s.add.container(SP.x + POT_AFSTAND, groundTop - 148).setDepth(7);
      const bg = s.add.graphics();
      bg.fillStyle(0x16202b, 0.6); bg.fillRoundedRect(-78, -20, 156, 40, 12);
      doelBord.add(bg);
      doelBord.add(s.add.text(0, 0, `🚽 zoek de ${SP.doel}!`, { fontFamily: 'Arial Black, Arial', fontSize: '17px', fontStyle: 'bold', color: '#ffe16b' }).setOrigin(0.5));
      s.spoelGroepen.push(G);
    });
  },

  update(s, time) {
    if (!s.spoelGroepen || !s.spoelGroepen.length || s.mode !== 'explore') return;
    const p = s.player;
    const onFloor = p.body.blocked.down || p.body.touching.down;
    for (const G of s.spoelGroepen) {
      if (G.klaar || time < G.cd) continue;
      for (const pot of G.potten) {
        if (Math.abs(p.x - pot.x) < 30 && onFloor && Math.abs((p.y + p.totalH / 2) - G.groundTop) < 20) {
          G.cd = time + 1600;
          const goed = pot.som[0] + pot.som[1] === G.doel;
          if (!G.cueDone) { G.cueDone = true; Voice.number(G.doel); }
          spoel(s, G, pot, goed);
          return;
        }
      }
    }
  },
};
