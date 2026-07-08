// ===== NUL — je maatje op avontuur =====
// Het ronde, lichtblauwe gidsje uit het verhaal: het enige wezentje dat niet
// bang is voor de Grommels (van Nul valt niks af te pakken!). Nul zweeft
// achter je aan, leeft mee met alles wat je doet, en als je een tijdje niet
// verder komt zweeft hij naar de dichtstbijzijnde klus en stuitert daar —
// een hint zonder woorden (belangrijk: de speler kan nog niet lezen).
//
// De scene praat met Nul via twee dingen:
//   - scene.nulReact('blij' | 'zorg' | 'ster')  — reactie-animaties
//   - scene.laatsteVoortgang                    — timer voor de wijs-hint

import { Voice } from '../voice.js';
import { tekenPotloodLijf } from './letterCast.js';

export function buildNul(s) {
  const c = s.add.container(s.level.start.x - 44, s.level.start.y - 60).setDepth(11);
  // binnenste container: reactie-tweens (hupje/draai) vechten zo niet met
  // de volg-beweging die elke frame de buitenpositie zet
  const lijf = s.add.container(0, 0);
  // Letter-Land heeft een eigen maatje: Priet het potlood (niet stil te
  // krijgen), i.p.v. Nul. Zelfde volg-/wijs-gedrag; alleen het plaatje verschilt.
  if (s.level.maatje === 'potlood') {
    tekenPotloodLijf(s, lijf);
  } else {
    const g = s.add.graphics();
    g.fillStyle(0x000000, 0.1); g.fillEllipse(0, 22, 26, 6);
    g.fillStyle(0x7fd0f0, 1); g.fillCircle(0, 0, 15);
    g.fillStyle(0xbfe8ff, 0.85); g.fillCircle(-5, -6, 5); // glansje
    g.lineStyle(3, 0x2b7fae, 1); g.strokeCircle(0, 0, 15);
    lijf.add(g);
    lijf.add(s.add.circle(-5.5, -3, 4, 0xffffff).setStrokeStyle(1.8, 0x16202b));
    lijf.add(s.add.circle(5.5, -3, 4, 0xffffff).setStrokeStyle(1.8, 0x16202b));
    lijf.add(s.add.circle(-5.5, -2.4, 1.8, 0x16202b));
    lijf.add(s.add.circle(5.5, -2.4, 1.8, 0x16202b));
    const m = s.add.graphics(); m.lineStyle(2.2, 0x16202b, 1);
    m.beginPath(); m.arc(0, 4, 5, 0.15 * Math.PI, 0.85 * Math.PI); m.strokePath();
    lijf.add(m);
    // '0'-schijfje boven het hoofd — zelfde beeldtaal als alle vriendjes
    lijf.add(s.add.circle(0, -25, 8, 0xffffff).setStrokeStyle(2, 0x16202b));
    lijf.add(s.add.text(0, -25, '0', { fontFamily: 'Arial Black, Arial', fontSize: '11px', fontStyle: 'bold', color: '#16202b' }).setOrigin(0.5));
  }
  c.add(lijf);
  c.lijf = lijf;
  c.modeNul = 'volg';
  c.wijsTot = 0;
  c.doelX = 0; c.doelY = 0;
  s.nul = c;
  s.laatsteVoortgang = s.time.now;
  return c;
}

export function updateNul(s, time, delta) {
  const nul = s.nul;
  if (!nul) return;
  const p = s.player;

  // Even geen voortgang? Nul zweeft naar de dichtstbijzijnde onopgeloste
  // klus en stuitert daar 3,5 seconde — kijk, dáár moet je iets doen!
  if (nul.modeNul === 'volg' && time - s.laatsteVoortgang > 12000) {
    const doel = zoekKlus(s);
    if (doel) {
      nul.modeNul = 'wijs';
      nul.doelX = doel.x; nul.doelY = doel.y;
      nul.wijsTot = time + 3500;
      Voice.cue('greet');
      s.tweens.add({ targets: nul.lijf, y: -14, duration: 240, yoyo: true, repeat: 5, ease: 'Quad.out' });
    }
    s.laatsteVoortgang = time; // niet elke frame opnieuw zoeken
  }

  let tx, ty;
  if (nul.modeNul === 'wijs') {
    tx = nul.doelX; ty = nul.doelY;
    if (time > nul.wijsTot) nul.modeNul = 'volg';
  } else {
    // zweef schuin achter je hoofd, aan de kant waar je vandaan komt
    const dir = p.art.scaleX >= 0 ? 1 : -1;
    tx = p.x - dir * 46;
    ty = p.y - p.totalH / 2 - 34;
  }
  const k = Math.min(1, (delta / 16.6) * 0.07); // zachte volg-lerp
  nul.x += (tx - nul.x) * k;
  nul.y += (ty + Math.sin(time * 0.004) * 7 - nul.y) * k;
  nul.lijf.scaleX = nul.x > p.x ? -1 : 1; // altijd naar jou kijken
}

// Dichtstbijzijnde onopgeloste klus binnen 800px (puzzels, deuren, platen,
// portalen, vraagmuren) — waar Nul naartoe wijst.
function zoekKlus(s) {
  const p = s.player;
  const kandidaten = [];
  for (const pz of s.puzzles || []) {
    if (!pz.solved && pz.zone) kandidaten.push({ x: pz.zone.centerX, y: pz.zone.y + 20 });
  }
  for (const d of s.doors || []) if (!d.opened) kandidaten.push({ x: d.x - 60, y: 420 });
  for (const pl of s.plates || []) if (!pl.given) kandidaten.push({ x: pl.x, y: pl.groundTop - 130 });
  for (const po of s.portalen || []) if (!po.opgelost) kandidaten.push({ x: po.x + 130, y: 430 });
  for (const vm of s.vraagMuren || []) if (!vm.opgelost) kandidaten.push({ x: vm.x - 140, y: 370 });
  let best = null, bestAfstand = 800;
  for (const kd of kandidaten) {
    const d = Math.abs(kd.x - p.x);
    if (d < bestAfstand) { bestAfstand = d; best = kd; }
  }
  return best;
}
