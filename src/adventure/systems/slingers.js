// ===== SYSTEEM: SLINGER-LIANEN (de Klokken-Toren, Wereld 16) =====
// Grote klok-slingers zwaaien heen en weer. Spring op en GRIJP het handvat
// (in de lucht, bij het gewicht onderaan) — je zwaait mee op het ritme van
// de klok. Tik (waar dan ook) om LOS te laten: je vliegt weg mét de
// zwaai-snelheid — het loslaat-moment bepaalt je boog. Dé timing-skill van
// de Klokken-Toren, faalvriendelijk (misgegrepen = gewoon nog eens).
// Veld: `slingers: [{ x, y, lengte }]` — (x, y) = het draaipunt.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';

const AMPLITUDE = 0.85;   // maximale uitwijking in radialen (~49°)
const PERIODE = 2400;     // ms per volle zwaai heen-en-weer

function laatLos(s, S) {
  const p = s.player;
  if (!S.rijdend) return;
  S.rijdend = false;
  S.pakCd = s.time.now + 700; // niet meteen opnieuw vastplakken
  if (S.losHandler) { s.input.off('pointerdown', S.losHandler); S.losHandler = null; }
  p.art.angle = 0;
  p.body.enable = true;
  p.body.reset(p.x, p.y);
  // meegeven wat de slinger had: de tangentiële snelheid op dít moment
  const t = s.time.now;
  const theta = AMPLITUDE * Math.sin((t / PERIODE) * Math.PI * 2 + S.fase);
  const thetaSnelheid = AMPLITUDE * Math.cos((t / PERIODE) * Math.PI * 2 + S.fase) * (Math.PI * 2 / PERIODE) * 1000;
  const vx = Phaser.Math.Clamp(S.lengte * thetaSnelheid * Math.cos(theta) * 1.15, -420, 420);
  const vy = Phaser.Math.Clamp(-S.lengte * thetaSnelheid * Math.sin(theta), -260, 200) - 180;
  p.body.setVelocity(vx, vy);
  s.jumpsUsed = 0; // je mag nog bijsturen met een dubbelsprong
  s.mode = 'explore';
  SFX.split(); Voice.cue('whee');
}

function grijp(s, S) {
  const p = s.player;
  S.rijdend = true;
  s.mode = 'vlucht'; // besturing pauzeert; loslaten = tikken
  p.body.setVelocity(0, 0);
  p.body.enable = false;
  SFX.pick();
  s.questText.setText('Zwaai mee… en TIK om los te laten! 🕰️');
  if (!s._slingerHint) { s._slingerHint = true; Voice.hint('hint-slinger'); }
  // één tik (waar dan ook, ook op de springknop) = loslaten
  S.losHandler = () => laatLos(s, S);
  s.time.delayedCall(150, () => { if (S.rijdend) s.input.once('pointerdown', S.losHandler); });
}

// Per frame: pendelen + (tijdens de rit) de speler meenemen. LET OP: dit
// hangt aan de SCENE-update-event en niet aan SYSTEMS.update — die laatste
// stopt buiten mode 'explore', en juist tijdens de rit (mode 'vlucht') moet
// de slinger dóórzwaaien.
function stap(s, time) {
  if (!s.slingers || !s.slingers.length) return;
  const p = s.player;
  if (!p || !p.body) return;
  const b = p.body;
  for (const S of s.slingers) {
    // de pendel-beweging (klok-ritme, elke slinger net uit fase)
    const theta = AMPLITUDE * Math.sin((time / PERIODE) * Math.PI * 2 + S.fase);
    const bx = S.x + Math.sin(theta) * S.lengte;
    const by = S.y + Math.cos(theta) * S.lengte;
    S.bob.setPosition(bx, by);
    S.bob.setAngle(Phaser.Math.RadToDeg(theta) * 0.5);
    S.koord.clear();
    S.koord.lineStyle(4, 0x8a6a45, 1);
    S.koord.beginPath(); S.koord.moveTo(S.x, S.y); S.koord.lineTo(bx, by); S.koord.strokePath();

    if (S.rijdend) {
      // jij hangt aan het handvat en zwaait mee
      p.setPosition(bx, by + 42);
      p.art.angle = Phaser.Math.RadToDeg(theta) * 0.6;
      continue;
    }
    // GRIJPEN: in de lucht, dicht bij het gewicht
    if (s.mode !== 'explore' || time < S.pakCd) continue;
    const opGrond = b.blocked.down || b.touching.down;
    if (!opGrond && Math.abs(p.x - bx) < 48 && Math.abs(p.y - by) < 60) grijp(s, S);
  }
}

export default {
  build(s, L) {
    s.slingers = [];
    (L.slingers || []).forEach((S0, i) => {
      // het draaipunt (een koperen bout)
      const bout = s.add.graphics().setDepth(3);
      bout.fillStyle(0xb98d3a, 1); bout.fillCircle(S0.x, S0.y, 9);
      bout.fillStyle(0x6e5436, 1); bout.fillCircle(S0.x, S0.y, 4);
      // het koord wordt elke frame opnieuw getekend
      const koord = s.add.graphics().setDepth(3);
      // het slinger-gewicht met handvat (de gouden schijf van een klok)
      const bob = s.add.container(S0.x, S0.y + S0.lengte).setDepth(6);
      const bg = s.add.graphics();
      bg.fillStyle(0xf6c624, 1); bg.fillCircle(0, 0, 20);
      bg.fillStyle(0xffe16b, 1); bg.fillCircle(-5, -5, 8);
      bg.lineStyle(3, 0xb98d12, 1); bg.strokeCircle(0, 0, 20);
      bg.lineStyle(3.5, 0x8a6a2e, 1); bg.strokeCircle(0, -26, 6); // het grijp-oog
      bob.add(bg);
      s.slingers.push({ ...S0, koord, bob, fase: i * 1.3, rijdend: false, pakCd: 0, losHandler: null });
    });
    if (s.slingers.length) {
      const handler = (time) => stap(s, time);
      s.events.on('update', handler);
      s.events.once('shutdown', () => s.events.off('update', handler));
    }
  },
};
