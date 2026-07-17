// ===== SYSTEEM: DE VRIES-THERMOMETER (Onder-Nul, Wereld 18) =====
// HET leer-werkwoord van Onder-Nul: TERUGTELLEN NAAR 0 (en eronder!). Een
// grote thermometer wil op een koude waarde gezet worden ("zet op 0!", of
// "zet op −2!"). Tik ▼ kouder / ▲ warmer — de kwik zakt/stijgt en de stem
// telt mee (3, 2, 1, NUL, min één, min twee…). Staat hij precies goed? Tik
// dan het ijs-luik: KRAK! — het bevriest een brug en de poort barst open.
// Fout getal = het luik rammelt "nee". Voorbij? Gewoon terugtikken — geen straf.
// Veld: `thermometers: [{ x, doel }]` — doel mag negatief (−5..5); poort op x+160.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { confettiBurst } from '../../reward.js';

export const THERMO_DEUR = 160; // afstand thermometer → poort (ook voor de validator)
const PPU = 22;                 // pixels per graad op de schaal

// de begin-stand ligt altijd bóven het doel én bij een leuk terugtel-getal
// (min. 3), zodat je écht door de nul heen telt
function startTemp(doel) { return Math.max(3, doel + 3); }
function hoogLaag(doel) { return { hoog: startTemp(doel), laag: Math.min(doel - 2, -2) }; }

// teken de kwik-vulling van de bulb tot de huidige temperatuur
function tekenKwik(T) {
  const { hoog, laag } = hoogLaag(T.doel);
  T.kwik.clear();
  const bulbY = T.bulbY;
  const topY = bulbY - (T.temp - laag) * PPU;
  // buis-vulling (kouder = blauwer, warmer = roder)
  const koud = T.temp <= 0;
  T.kwik.fillStyle(koud ? 0x6fc7f0 : 0xe8574a, 1);
  T.kwik.fillRoundedRect(T.x - 7, topY, 14, bulbY - topY + 6, 6);
  T.kwik.fillStyle(koud ? 0x8fd8f8 : 0xf28a80, 1);
  T.kwik.fillRoundedRect(T.x - 4, topY + 2, 4, bulbY - topY, 2);
  // de bulb onderaan
  T.kwik.fillStyle(koud ? 0x4fb3e6 : 0xd94f3f, 1);
  T.kwik.fillCircle(T.x, bulbY + 14, 16);
  T.kwik.fillStyle(koud ? 0x8fd8f8 : 0xf28a80, 1); T.kwik.fillCircle(T.x - 5, bulbY + 9, 5);
  void hoog;
}

function toonGetal(T) {
  const min = T.temp < 0;
  T.getalTxt.setText(`${T.temp}°`);
  T.getalTxt.setColor(T.temp === 0 ? '#f6c624' : min ? '#3fa9e0' : '#e8574a');
}

function stel(s, T, stap) {
  const { hoog, laag } = hoogLaag(T.doel);
  const na = Phaser.Math.Clamp(T.temp + stap, laag, hoog);
  if (na === T.temp) return;
  T.temp = na;
  SFX.pick();
  if (T.temp >= 0) Voice.number(T.temp);
  else Voice.cue('star'); // onder nul: een klankje i.p.v. een (ongesproken) getal
  tekenKwik(T);
  toonGetal(T);
  s.tweens.add({ targets: T.getalBord, scale: 1.12, duration: 90, yoyo: true });
  if (T.temp === T.doel) {
    s.questText.setText(`${T.doel}° — precies goed! Tik het ijs-luik! ❄️`);
    s.tweens.add({ targets: T.luik, scale: 1.15, duration: 260, yoyo: true, repeat: 2 });
  } else {
    s.questText.setText(`${T.temp}°… ${T.temp > T.doel ? 'nog kouder' : 'iets warmer'}, tot ${T.doel}°! 🌡️`);
  }
}

function tikLuik(s, T) {
  if (T.klaar) return;
  if (T.temp === T.doel) {
    // BEVROREN! Het ijs-luik barst — de poort valt aan gruzelementen.
    T.klaar = true;
    SFX.fanfare(); Voice.cue('cheer'); confettiBurst(s, 90); s.cameraPunch();
    s.questText.setText('KRAK! Het ijs breekt — de weg is vrij! ❄️');
    // ijs-scherven spatten uit de poort
    for (let i = 0; i < 10; i++) {
      const sc = s.add.graphics().setDepth(15);
      sc.fillStyle(0xdff2ff, 0.95);
      sc.fillTriangle(0, -6, 5, 4, -5, 4);
      sc.setPosition(T.muurX, 200 + i * 32);
      s.tweens.add({ targets: sc, x: sc.x + Phaser.Math.Between(-70, 70), y: sc.y + Phaser.Math.Between(30, 90), angle: Phaser.Math.Between(-180, 180), alpha: 0, duration: 620, ease: 'Quad.in', onComplete: () => sc.destroy() });
    }
    T.body.body.enable = false;
    s.doorGroup.remove(T.body, false, false);
    s.tweens.add({ targets: T.muurArt, y: 520, alpha: 0.1, duration: 700, ease: 'Quad.in' });
    s.vierMijlpaal(T.x);
  } else {
    // nog niet de goede temperatuur — het luik rammelt "nee"
    s.rekenFouten += 1;
    T.fouten = (T.fouten || 0) + 1;
    SFX.oops(); Voice.cue('oops');
    s.tweens.add({ targets: T.luik, angle: { from: -10, to: 10 }, duration: 70, yoyo: true, repeat: 3, onComplete: () => T.luik.setAngle(0) });
    s.questText.setText(`De thermometer staat op ${T.temp}° — het moet ${T.doel}°! 🌡️`);
    if (T.fouten >= 2) {
      // wijs de goede kant: pulseer de knop die je nog moet tikken
      s.pulsHulp(T.temp > T.doel ? T.kouderKnop : T.warmerKnop);
      Voice.hint('hint-thermometer', 900);
    }
  }
}

// een tik-plaat (▼/▲) — depth 13 = boven de speler (tik-valkuil W14)
function maakKnop(s, x, y, pijl, kleur) {
  const c = s.add.container(x, y).setDepth(13);
  const g = s.add.graphics();
  g.fillStyle(0x000000, 0.14); g.fillEllipse(0, 26, 46, 10);
  g.fillStyle(kleur, 1); g.fillCircle(0, 0, 24);
  g.lineStyle(3, 0xffffff, 0.9); g.strokeCircle(0, 0, 24);
  g.fillStyle(0xffffff, 1);
  if (pijl === 'kouder') g.fillTriangle(-11, -7, 11, -7, 0, 12);
  else g.fillTriangle(-11, 7, 11, 7, 0, -12);
  c.add(g);
  c.setInteractive(new Phaser.Geom.Rectangle(-28, -28, 56, 60), Phaser.Geom.Rectangle.Contains);
  c.input.cursor = 'pointer';
  return c;
}

export default {
  build(s, L) {
    s.thermometers = [];
    (L.thermometers || []).forEach((T0) => {
      const groundTop = L.platforms[0][1];
      const { hoog, laag } = hoogLaag(T0.doel);
      const tubeH = (hoog - laag) * PPU;
      const bulbY = groundTop - 70;
      const topY = bulbY - tubeH;

      // de behuizing (houten paal met een glazen buis)
      const kast = s.add.graphics().setDepth(3);
      kast.fillStyle(0x000000, 0.16); kast.fillEllipse(T0.x, groundTop + 2, 90, 14);
      kast.fillStyle(0xbfe3fb, 1); kast.fillRoundedRect(T0.x - 16, topY - 24, 32, tubeH + 60, 14);
      kast.lineStyle(3, 0x7fb8d8, 1); kast.strokeRoundedRect(T0.x - 16, topY - 24, 32, tubeH + 60, 14);
      // schaal-streepjes met een dik streepje op 0 en op het doel
      for (let v = laag; v <= hoog; v++) {
        const y = bulbY - (v - laag) * PPU;
        const dik = v === 0;
        kast.lineStyle(dik ? 3 : 1.5, v === 0 ? 0xf6c624 : 0x5a86a0, 1);
        kast.beginPath(); kast.moveTo(T0.x + 8, y); kast.lineTo(T0.x + (dik ? 20 : 15), y); kast.strokePath();
      }
      // doel-markering: een sneeuwvlokje naast het te-bereiken getal
      const doelY = bulbY - (T0.doel - laag) * PPU;
      const doelG = s.add.graphics().setDepth(6);
      doelG.fillStyle(0x3fa9e0, 1);
      doelG.fillTriangle(T0.x + 28, doelY, T0.x + 40, doelY - 6, T0.x + 40, doelY + 6);
      doelG.lineStyle(2, 0xffffff, 0.9);
      for (let a = 0; a < 6; a++) { const ang = (a / 6) * Math.PI * 2; doelG.beginPath(); doelG.moveTo(T0.x + 52, doelY); doelG.lineTo(T0.x + 52 + Math.cos(ang) * 7, doelY + Math.sin(ang) * 7); doelG.strokePath(); }
      s.tweens.add({ targets: doelG, alpha: 0.4, duration: 700, yoyo: true, repeat: -1 });

      // de kwik (herteken bij elke stap)
      const kwik = s.add.graphics().setDepth(4);

      // het grote getal-bord bovenaan
      const getalBord = s.add.container(T0.x, topY - 54).setDepth(7);
      const gb = s.add.graphics();
      gb.fillStyle(0x16202b, 0.6); gb.fillRoundedRect(-40, -20, 80, 40, 12);
      getalBord.add(gb);
      const getalTxt = s.add.text(0, 0, '', { fontFamily: 'Arial Black, Arial', fontSize: '22px', fontStyle: 'bold', color: '#e8574a' }).setOrigin(0.5);
      getalBord.add(getalTxt);
      s.tweens.add({ targets: getalBord, y: getalBord.y - 5, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

      // twee tik-knoppen (kouder / warmer)
      const kouderKnop = maakKnop(s, T0.x - 70, groundTop - 60, 'kouder', 0x3fa9e0);
      const warmerKnop = maakKnop(s, T0.x - 70, groundTop - 130, 'warmer', 0xe8574a);

      // het ijs-luik (bevestig-tik) naast de poort
      const luikX = T0.x + 74;
      const luik = s.add.container(luikX, groundTop - 96).setDepth(13);
      const lg = s.add.graphics();
      lg.fillStyle(0xbfe3fb, 0.95); lg.fillRoundedRect(-22, -22, 44, 44, 8);
      lg.lineStyle(3, 0x7fb8d8, 1); lg.strokeRoundedRect(-22, -22, 44, 44, 8);
      lg.fillStyle(0xffffff, 0.9);
      for (let a = 0; a < 6; a++) { const ang = (a / 6) * Math.PI * 2; lg.beginPath(); lg.moveTo(0, 0); lg.lineTo(Math.cos(ang) * 14, Math.sin(ang) * 14); lg.strokePath(); }
      luik.add(lg);
      luik.setInteractive(new Phaser.Geom.Rectangle(-26, -26, 52, 52), Phaser.Geom.Rectangle.Contains);
      luik.input.cursor = 'pointer';

      // de poort (schermhoge ijs-blokkade)
      const muurX = T0.x + THERMO_DEUR;
      const body = s.add.rectangle(muurX, (40 + groundTop) / 2, 46, groundTop - 40, 0x000000, 0);
      s.physics.add.existing(body, true);
      s.doorGroup.add(body);
      const muurArt = s.add.container(muurX, 0).setDepth(4);
      const mg = s.add.graphics();
      mg.fillStyle(0xbfe3fb, 0.92); mg.fillRoundedRect(-23, 150, 46, groundTop - 148, 10);
      mg.fillStyle(0xdff2ff, 0.9); mg.fillRoundedRect(-23, 150, 46, 16, 6);
      mg.lineStyle(3, 0x7fb8d8, 1); mg.strokeRoundedRect(-23, 150, 46, groundTop - 148, 10);
      // ijs-barsten
      mg.lineStyle(2, 0xffffff, 0.5);
      for (let ky = 200; ky < groundTop - 40; ky += 90) { mg.beginPath(); mg.moveTo(-14, ky); mg.lineTo(6, ky + 26); mg.lineTo(-4, ky + 52); mg.strokePath(); }
      muurArt.add(mg);

      const T = {
        ...T0, x: T0.x, kwik, getalTxt, getalBord, luik, kouderKnop, warmerKnop,
        body, muurArt, muurX, bulbY, groundTop, temp: hoog, klaar: false, fouten: 0, cuePlayed: false,
      };
      tekenKwik(T);
      toonGetal(T);

      kouderKnop.on('pointerdown', () => { if (!T.klaar) stel(s, T, -1); });
      warmerKnop.on('pointerdown', () => { if (!T.klaar) stel(s, T, 1); });
      luik.on('pointerdown', () => tikLuik(s, T));
      s.thermometers.push(T);
    });
  },

  update(s) {
    if (!s.thermometers || !s.thermometers.length) return;
    const p = s.player;
    for (const T of s.thermometers) {
      if (T.klaar) continue;
      if (!T.cuePlayed && Math.abs(p.x - T.x) < 240) {
        T.cuePlayed = true;
        Voice.hint('hint-thermometer');
        s.questText.setText(`Zet de thermometer op ${T.doel}° — tik ▼ tot ${T.doel}, dan het ijs-luik! 🌡️`);
      }
    }
  },
};
