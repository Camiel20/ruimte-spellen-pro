// ===== SYSTEEM: DE GROEI-SNEEUWBAL (Onder-Nul, Wereld 18) =====
// Tweede werkwoord van Onder-Nul: DUW een sneeuwbal door de sneeuw en hij
// GROEIT — elke sneeuwhoop die hij overrolt telt er ééntje bij (1, 2, 3…).
// Groot genoeg? Dan ramt hij de bevroren poort open. Fysiek optellen: je
// ZIET het getal groeien. Contrast met het terugtellen van de thermometer.
// Veld: `sneeuwballen: [{ x, doel }]` — doel 3-8; de poort staat op x+320.
// De sneeuwhopen (doel−1 stuks) worden automatisch tussen bal en poort gelegd.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { confettiBurst } from '../../reward.js';

export const SNEEUW_DEUR = 320;   // afstand startplek bal → poort (ook voor de validator)
const R0 = 16;                    // straal bij grootte 1
const RGROEI = 4.2;               // px straal per grootte-eenheid

function tekenBal(B) {
  const r = B.r;
  B.art.clear();
  B.art.fillStyle(0x000000, 0.16); B.art.fillEllipse(0, r + 3, r * 1.8, r * 0.4);
  B.art.fillStyle(0xffffff, 1); B.art.fillCircle(0, 0, r);
  B.art.fillStyle(0xe8f4ff, 1); B.art.fillCircle(-r * 0.25, -r * 0.25, r * 0.55);
  B.art.lineStyle(2, 0xbfe3fb, 1); B.art.strokeCircle(0, 0, r);
  // een paar sneeuw-korreltjes voor textuur
  B.art.fillStyle(0xdff2ff, 1);
  B.art.fillCircle(r * 0.3, r * 0.2, 2.4); B.art.fillCircle(-r * 0.1, r * 0.4, 1.8); B.art.fillCircle(r * 0.15, -r * 0.4, 2);
}

function groei(s, B) {
  B.grootte += 1;
  B.r = R0 + (B.grootte - 1) * RGROEI;
  SFX.place(); Voice.number(B.grootte); s.sparkleAt(B.cx, B.groundTop - B.r, 6);
  tekenBal(B);
  B.getal.setText(`${B.grootte}`);
  s.tweens.add({ targets: B.getalBord, scale: 1.2, duration: 110, yoyo: true });
  s.questText.setText(`De sneeuwbal is nu ${B.grootte} groot! Duw door… ❄️`);
}

function ramPoort(s, B) {
  B.klaar = true;
  SFX.fanfare(); Voice.cue('cheer'); confettiBurst(s, 80); s.cameraPunch(0.04, 7);
  s.questText.setText(`${B.doel} groot — BOEM! De poort is open! ⛄`);
  // de bal ramt de poort en spat uiteen in een sneeuwwolk
  s.tweens.add({ targets: B.node, x: B.muurX - 10, duration: 260, ease: 'Quad.in', onComplete: () => {
    for (let i = 0; i < 14; i++) {
      const f = s.add.circle(B.muurX - 20, B.groundTop - 30, Phaser.Math.Between(4, 9), 0xffffff, 0.95).setDepth(15);
      s.tweens.add({ targets: f, x: f.x + Phaser.Math.Between(-90, 60), y: f.y - Phaser.Math.Between(10, 80), alpha: 0, duration: 620, ease: 'Quad.out', onComplete: () => f.destroy() });
    }
    s.tweens.add({ targets: B.node, alpha: 0, scale: 0.4, duration: 300, onComplete: () => B.node.destroy() });
  } });
  B.body.body.enable = false;
  s.doorGroup.remove(B.body, false, false);
  s.tweens.add({ targets: B.muurArt, y: 520, alpha: 0.1, duration: 700, delay: 200, ease: 'Quad.in' });
  s.vierMijlpaal(B.cx);
}

export default {
  build(s, L) {
    s.sneeuwballen = [];
    (L.sneeuwballen || []).forEach((B0) => {
      const groundTop = L.platforms[0][1];
      const muurX = B0.x + SNEEUW_DEUR;

      // de bal zelf (container zodat we 'm los kunnen roteren + verplaatsen)
      const node = s.add.container(B0.x, 0).setDepth(11);
      const art = s.add.graphics();
      node.add(art);
      const getalBord = s.add.container(0, 0).setDepth(12);
      const gb = s.add.graphics(); gb.fillStyle(0x3fa9e0, 0.9); gb.fillCircle(0, 0, 13);
      getalBord.add(gb);
      const getal = s.add.text(0, 0, '1', { fontFamily: 'Arial Black, Arial', fontSize: '16px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
      getalBord.add(getal);
      node.add(getalBord);

      // de sneeuwhopen (doel−1 stuks, gelijkmatig tussen bal en poort)
      const nHopen = Math.max(0, B0.doel - 1);
      const hopen = [];
      for (let i = 0; i < nHopen; i++) {
        const hx = B0.x + 70 + (i + 1) * ((SNEEUW_DEUR - 110) / (nHopen + 1));
        const hg = s.add.graphics().setDepth(2);
        hg.fillStyle(0xffffff, 1); hg.fillEllipse(hx, groundTop - 8, 40, 20);
        hg.fillStyle(0xe8f4ff, 1); hg.fillEllipse(hx - 6, groundTop - 12, 22, 12);
        hg.lineStyle(2, 0xbfe3fb, 1); hg.strokeEllipse(hx, groundTop - 8, 40, 20);
        hopen.push({ x: hx, art: hg, op: false });
      }

      // de poort (bevroren blokkade tot de bal groot genoeg is)
      const body = s.add.rectangle(muurX, (40 + groundTop) / 2, 44, groundTop - 40, 0x000000, 0);
      s.physics.add.existing(body, true);
      s.doorGroup.add(body);
      const muurArt = s.add.container(muurX, 0).setDepth(4);
      const mg = s.add.graphics();
      mg.fillStyle(0xbfe3fb, 0.92); mg.fillRoundedRect(-22, 150, 44, groundTop - 148, 10);
      mg.fillStyle(0xdff2ff, 0.9); mg.fillRoundedRect(-22, 150, 44, 16, 6);
      mg.lineStyle(3, 0x7fb8d8, 1); mg.strokeRoundedRect(-22, 150, 44, groundTop - 148, 10);
      muurArt.add(mg);

      const B = {
        ...B0, node, art, getal, getalBord, hopen, body, muurArt, muurX, groundTop,
        cx: B0.x, r: R0, grootte: 1, klaar: false, cuePlayed: false,
      };
      tekenBal(B);
      B.node.y = groundTop - B.r;
      s.sneeuwballen.push(B);
    });
  },

  update(s) {
    if (!s.sneeuwballen || !s.sneeuwballen.length) return;
    const p = s.player;
    for (const B of s.sneeuwballen) {
      if (B.klaar) continue;
      if (!B.cuePlayed && Math.abs(p.x - B.cx) < 240) {
        B.cuePlayed = true;
        Voice.hint('hint-sneeuwbal');
        s.questText.setText('Duw de sneeuwbal door de sneeuw — hij groeit! ⛄');
      }

      // DUWEN: sta je er met je rechterkant tegenaan en loop je naar rechts?
      const onFloor = p.body.blocked.down || p.body.touching.down;
      const raakt = p.body.right >= B.cx - B.r - 6 && p.x < B.cx && Math.abs((p.y) - (B.groundTop - B.r)) < 90;
      if (onFloor && raakt && p.body.velocity.x > 20) {
        const nieuw = p.body.right + B.r;
        if (nieuw > B.cx) {
          const dx = nieuw - B.cx;
          B.cx = nieuw;
          B.node.x = B.cx;
          B.node.y = B.groundTop - B.r;
          B.art.angle += dx * (180 / (Math.PI * B.r)); // rol-hoek
        }
      }

      // sneeuwhopen overrold?
      for (const h of B.hopen) {
        if (!h.op && B.cx >= h.x) {
          h.op = true;
          s.tweens.add({ targets: h.art, alpha: 0, duration: 300, onComplete: () => h.art.destroy() });
          groei(s, B);
        }
      }

      // poort geraakt en groot genoeg?
      if (B.cx + B.r >= B.muurX - 6 && B.grootte >= B.doel) ramPoort(s, B);
    }
  },
};
