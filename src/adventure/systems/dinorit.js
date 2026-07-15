// ===== SYSTEEM: DE DINO-RIT (Dino-Dal, Wereld 15) =====
// HET leer-werkwoord van het Dino-Dal: SPRONGEN op de getallenlijn — dé
// opstap naar de tafels. Bij een geschilderde getallenlijn staan drie
// dino's te trappelen: de STAPPER (sprongen van 2), de SPRINGER (5) en de
// REUZEN-DINO (10). Het bord zegt "kom precies op {doel}!" — kies een dino,
// klim erop en TEL MEE terwijl hij boog voor boog springt (de stem telt
// elke landing). De goede dino landt precies op het doel → de slagboom
// gaat open. De verkeerde springt er vrolijk VOORBIJ ("34… dat is te
// ver!"), schudt, en draagt je terug naar het begin. Geen straf, wel les.
// Veld: `dinoRitten: [{ x, start, doel }]` — precies één sprong uit
// {2, 5, 10} deelt (doel − start), zie de validator.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { confettiBurst } from '../../reward.js';
import { DINO_PPU, DINO_LIJN_START, dinoritMuurX } from '../logic.js';

export const DINO_SOORTEN = [
  { sprong: 2, naam: 'Stapper', kleur: 0x57b947, schaal: 0.75 },
  { sprong: 5, naam: 'Springer', kleur: 0xf6a723, schaal: 1.0 },
  { sprong: 10, naam: 'Reuzen-Dino', kleur: 0x3f8fe8, schaal: 1.3 },
];

// De MOE-REGEL: een dino doet maximaal 6 sprongen ("kleine beentjes worden
// moe"). Zo kan óók de Reuzen-Dino de enige juiste zijn: 40 lukt de Stapper
// (20 sprongen) en de Springer (8) simpelweg niet. Wiskundig sluitend én
// een les op zich: grote sprongen komen véél sneller ver.
export const MAX_HOPS = 6;

// Een vrolijke dino rond (0,0) = het midden van zijn lijf; sc = maat.
function tekenDino(s, kleur, sc) {
  const g = s.add.graphics();
  g.fillStyle(0x000000, 0.14); g.fillEllipse(0, 30 * sc, 70 * sc, 10 * sc);
  const donker = Phaser.Display.Color.IntegerToColor(kleur).darken(25).color;
  // staart + lijf + nek + kop
  g.fillStyle(kleur, 1);
  g.fillTriangle(-26 * sc, 8 * sc, -58 * sc, 20 * sc, -24 * sc, 22 * sc);
  g.fillEllipse(0, 8 * sc, 56 * sc, 38 * sc);
  g.fillRoundedRect(18 * sc, -26 * sc, 13 * sc, 36 * sc, 6 * sc);
  g.fillEllipse(28 * sc, -28 * sc, 26 * sc, 18 * sc);
  // buik + pootjes
  g.fillStyle(0xfff3b0, 0.75); g.fillEllipse(2 * sc, 14 * sc, 34 * sc, 20 * sc);
  g.fillStyle(donker, 1);
  g.fillRoundedRect(-16 * sc, 20 * sc, 10 * sc, 12 * sc, 4 * sc);
  g.fillRoundedRect(8 * sc, 20 * sc, 10 * sc, 12 * sc, 4 * sc);
  // rug-plaatjes
  g.fillStyle(donker, 1);
  for (let i = 0; i < 3; i++) g.fillTriangle((-14 + i * 12) * sc, -8 * sc, (-4 + i * 12) * sc, -8 * sc, (-9 + i * 12) * sc, (-18 - (i % 2) * 3) * sc);
  // oogje + lach
  g.fillStyle(0xffffff, 1); g.fillCircle(30 * sc, -31 * sc, 5 * sc);
  g.fillStyle(0x16202b, 1); g.fillCircle(31 * sc, -30 * sc, 2.3 * sc);
  g.lineStyle(2 * sc, 0x16202b, 0.8);
  g.beginPath(); g.arc(34 * sc, -24 * sc, 4 * sc, 0.1 * Math.PI, 0.8 * Math.PI); g.strokePath();
  return g;
}

// Het getal-schildje op de buik van elke dino: zó groot springt hij.
function sprongSchild(s, sprong, sc) {
  const c = s.add.container(0, 6 * sc);
  c.add(s.add.circle(0, 0, 12 * sc, 0xffffff).setStrokeStyle(2.5 * sc, 0x16202b));
  c.add(s.add.text(0, 0, `${sprong}`, {
    fontFamily: 'Arial Black, Arial', fontSize: `${Math.round(14 * sc)}px`, fontStyle: 'bold', color: '#16202b',
  }).setOrigin(0.5));
  return c;
}

function tekenGetallenlijn(s, D, groundTop) {
  const g = s.add.graphics().setDepth(2);
  const x0 = D.x + DINO_LIJN_START;
  const eenheden = D.doel - D.start;
  const x1 = x0 + eenheden * DINO_PPU;
  g.lineStyle(5, 0x8a6a4a, 1);
  g.beginPath(); g.moveTo(x0 - 14, groundTop - 6); g.lineTo(x1 + 24, groundTop - 6); g.strokePath();
  for (let u = 0; u <= eenheden; u++) {
    const tx = x0 + u * DINO_PPU;
    const waarde = D.start + u;
    const groot = waarde % 5 === 0;
    g.lineStyle(groot ? 4 : 2.5, 0x8a6a4a, 1);
    g.beginPath(); g.moveTo(tx, groundTop - 6); g.lineTo(tx, groundTop - (groot ? 22 : 14)); g.strokePath();
    if (groot) {
      s.add.text(tx, groundTop - 34, `${waarde}`, {
        fontFamily: 'Arial Black, Arial', fontSize: '14px', fontStyle: 'bold', color: '#5d4426',
      }).setOrigin(0.5).setDepth(2);
    }
  }
  // het doel krijgt een vlaggetje
  g.fillStyle(0xe8402c, 1); g.fillTriangle(x1 + 2, groundTop - 56, x1 + 2, groundTop - 40, x1 + 22, groundTop - 48);
  g.lineStyle(3, 0x8a6a4a, 1); g.beginPath(); g.moveTo(x1, groundTop - 56); g.lineTo(x1, groundTop - 6); g.strokePath();
}

function rijd(s, D, keuze) {
  if (D.klaar || D.bezig) return;
  D.bezig = true;
  s.mode = 'vlucht';
  const p = s.player;
  p.body.setVelocity(0, 0);
  p.body.enable = false;
  SFX.pick(); Voice.cue('whee');
  const groundTop = s.level.platforms[0][1];
  const sprong = keuze.soort.sprong;
  const afstand = D.doel - D.start;
  const goed = afstand % sprong === 0 && afstand / sprong <= MAX_HOPS;
  // fout = te véél sprongen nodig (hij stopt moe) óf hij springt eroverheen
  const hops = goed ? afstand / sprong : Math.min(Math.ceil(afstand / sprong), MAX_HOPS);
  const x0 = D.x + DINO_LIJN_START;
  const dinoY = groundTop - 30 * keuze.soort.schaal - 6;
  // opstijgen: jij klimt op de rug
  s.tweens.add({ targets: p, x: keuze.c.x, y: dinoY - 40 * keuze.soort.schaal, duration: 320, ease: 'Sine.inOut' });
  s.tweens.killTweensOf(keuze.c);
  s.tweens.add({
    targets: keuze.c, x: x0, y: dinoY, duration: 420, delay: 340, ease: 'Sine.inOut',
    onUpdate: () => p.setPosition(keuze.c.x, keuze.c.y - 40 * keuze.soort.schaal), // jij rijdt mee
    onComplete: () => hop(0),
  });
  s.questText.setText(`Daar gaat de ${keuze.soort.naam} — tel mee! 🦖`);

  const hopDuur = sprong === 2 ? 330 : sprong === 5 ? 430 : 520;
  const hop = (i) => {
    if (i >= hops) return geland();
    const van = x0 + i * sprong * DINO_PPU;
    const naar = van + sprong * DINO_PPU;
    const boog = { t: 0 };
    s.tweens.add({
      targets: boog, t: 1, duration: hopDuur, ease: 'Sine.inOut',
      onUpdate: () => {
        keuze.c.x = Phaser.Math.Linear(van, naar, boog.t);
        keuze.c.y = dinoY - Math.sin(boog.t * Math.PI) * (34 + sprong * 3);
        keuze.c.angle = Math.sin(boog.t * Math.PI) * 8;
        p.setPosition(keuze.c.x, keuze.c.y - 40 * keuze.soort.schaal);
      },
      onComplete: () => {
        keuze.c.angle = 0;
        const waarde = D.start + (i + 1) * sprong;
        SFX.step(); Voice.number(Math.min(waarde, 100));
        s.sparkleAt(keuze.c.x, groundTop - 10, 3);
        // het getal ploept even op boven de landing
        const pop = s.add.text(keuze.c.x, groundTop - 70, `${waarde}`, {
          fontFamily: 'Arial Black, Arial', fontSize: '22px', fontStyle: 'bold', color: '#5d4426',
        }).setOrigin(0.5).setDepth(9).setStroke('#ffffff', 5);
        s.tweens.add({ targets: pop, y: pop.y - 26, alpha: 0, duration: 700, onComplete: () => pop.destroy() });
        s.time.delayedCall(160, () => hop(i + 1));
      },
    });
  };

  const geland = () => {
    const eindWaarde = D.start + hops * sprong;
    if (goed) {
      // PRECIES op het doel! Afstappen, poort open.
      D.klaar = true;
      SFX.fanfare(); Voice.cue('cheer'); confettiBurst(s, 110); s.cameraPunch();
      s.tweens.add({ targets: keuze.c, y: keuze.c.y - 12, duration: 150, yoyo: true, repeat: 2 });
      p.setVisible(true);
      p.setPosition(keuze.c.x + 50, groundTop - p.totalH / 2 - 2);
      p.body.enable = true;
      p.body.reset(p.x, p.y);
      s.checkpoint = { x: p.x, bottom: groundTop };
      s.mode = 'explore';
      D.body.body.enable = false;
      s.doorGroup.remove(D.body, false, false);
      s.tweens.add({ targets: D.muurArt, y: 480, alpha: 0.2, duration: 700, ease: 'Quad.in' });
      s.questText.setText(`PRECIES ${D.doel} — met sprongen van ${sprong}! 🚩`);
      s.vierMijlpaal(D.x + DINO_LIJN_START);
    } else {
      // niet gehaald: hij springt eroverheen óf geeft moe op — en draagt je terug.
      s.rekenFouten += 1;
      D.fouten = (D.fouten || 0) + 1;
      SFX.oops(); Voice.cue('oops');
      s.tweens.add({ targets: keuze.c, angle: { from: -7, to: 7 }, duration: 80, yoyo: true, repeat: 4, onComplete: () => keuze.c.setAngle(0) });
      s.questText.setText(eindWaarde > D.doel
        ? `${eindWaarde}… dat is VOORBIJ ${D.doel}! Een andere dino? 🦖`
        : `Pfoe… ${eindWaarde} — zó ver komt de ${keuze.soort.naam} niet, zijn beentjes zijn moe! 😅`);
      s.time.delayedCall(900, () => {
        s.tweens.add({
          targets: keuze.c, x: keuze.thuisX, y: keuze.thuisY, duration: 900, ease: 'Sine.inOut',
          onUpdate: () => p.setPosition(keuze.c.x, keuze.c.y - 40 * keuze.soort.schaal),
          onComplete: () => {
            p.setPosition(keuze.thuisX - 50, groundTop - p.totalH / 2 - 2);
            p.body.enable = true;
            p.body.reset(p.x, p.y);
            s.mode = 'explore';
            D.bezig = false;
            if (D.fouten >= 2) {
              const juist = D.dinos.find((k) => afstand % k.soort.sprong === 0 && afstand / k.soort.sprong <= MAX_HOPS);
              if (juist) s.pulsHulp(juist.c);
              Voice.hint('hint-dino', 900);
            }
          },
        });
      });
    }
  };
}

export default {
  build(s, L) {
    s.dinoRitten = [];
    (L.dinoRitten || []).forEach((D0) => {
      const groundTop = L.platforms[0][1];

      // het opdracht-bord: "kom precies op {doel}!"
      const bord = s.add.container(D0.x + 40, groundTop - 200).setDepth(7);
      const bg = s.add.graphics();
      bg.fillStyle(0x16202b, 0.6); bg.fillRoundedRect(-96, -26, 192, 52, 14);
      bord.add(bg);
      bord.add(s.add.text(0, 0, `🦖 kom PRECIES op ${D0.doel}!`, {
        fontFamily: 'Arial Black, Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5));
      s.tweens.add({ targets: bord, y: bord.y - 5, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

      tekenGetallenlijn(s, D0, groundTop);

      // de slagboom voorbij het doel (schermhoge blokkade)
      const muurX = dinoritMuurX(D0);
      const body = s.add.rectangle(muurX, (40 + groundTop) / 2, 46, groundTop - 40, 0x000000, 0);
      s.physics.add.existing(body, true);
      s.doorGroup.add(body);
      const muurArt = s.add.container(muurX, 0).setDepth(4);
      const mg = s.add.graphics();
      mg.fillStyle(0x8a6a4a, 1); mg.fillRoundedRect(-23, 150, 46, groundTop - 148, 10);
      mg.fillStyle(0xa8857a, 1); mg.fillRoundedRect(-23, 150, 46, 14, 6);
      mg.lineStyle(3, 0x6e5436, 1); mg.strokeRoundedRect(-23, 150, 46, groundTop - 148, 10);
      // botten-versiering op de muur
      mg.lineStyle(4, 0xf3ead2, 0.9);
      for (let ky = 210; ky < groundTop - 40; ky += 110) {
        mg.beginPath(); mg.arc(0, ky, 11, Math.PI, 2 * Math.PI); mg.strokePath();
      }
      muurArt.add(mg);

      const D = { ...D0, body, muurArt, dinos: [], klaar: false, bezig: false, fouten: 0, cuePlayed: false };

      // de drie dino's, GESCHUD neergezet (nooit dezelfde volgorde)
      const soorten = [...DINO_SOORTEN];
      for (let k = soorten.length - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1));
        [soorten[k], soorten[j]] = [soorten[j], soorten[k]];
      }
      soorten.forEach((soort, i) => {
        const dx = D0.x - 90 + i * 92;
        const dy = groundTop - 30 * soort.schaal - 6;
        // depth 13 = boven de speler (12): de tik moet de DINO raken
        const c = s.add.container(dx, dy).setDepth(13);
        c.add(tekenDino(s, soort.kleur, soort.schaal));
        c.add(sprongSchild(s, soort.sprong, soort.schaal));
        const hw = Math.min(84 * soort.schaal, 86), hh = 70 * soort.schaal;
        c.setInteractive(new Phaser.Geom.Rectangle(-hw / 2, -hh / 2, hw, hh), Phaser.Geom.Rectangle.Contains);
        c.input.cursor = 'pointer';
        const keuze = { c, soort, thuisX: dx, thuisY: dy };
        c.on('pointerdown', () => rijd(s, D, keuze));
        s.tweens.add({ targets: c, y: dy - 4, duration: 700 + i * 130, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        D.dinos.push(keuze);
      });

      s.dinoRitten.push(D);
    });
  },

  update(s) {
    if (!s.dinoRitten || !s.dinoRitten.length) return;
    const p = s.player;
    for (const D of s.dinoRitten) {
      if (D.klaar) continue;
      if (!D.cuePlayed && Math.abs(p.x - D.x) < 260) {
        D.cuePlayed = true;
        Voice.hint('hint-dino');
        s.questText.setText(`Welke dino komt PRECIES op ${D.doel}? Kijk naar hun sprong-getal! 🦖`);
      }
    }
  },
};
