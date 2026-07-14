// ===== SYSTEEM: DE BOWLING-BAAN (het Stuiter-Stadion, Wereld 14) =====
// Het leer-werkwoord van het Stadion: AFTREKKEN ("hoeveel staan er nog?").
// Tik de bowlingbal → hij rolt de baan af en KLETTERT een stel kegels om
// (elke beurt een ander aantal — vers bij herspelen, positie-raden kan
// niet). Dan verschijnen drie antwoord-borden: raak het bord met hoeveel
// kegels er nog STAAN. De staande kegels zijn gewoon telbaar (niet-lezer-
// proof); grote banen gebruiken REKKEN van 10 (30 = 3 planken van 10) —
// zo zie je 60 − 24 gebeuren: 2 hele planken + 4 losse vallen om.
// Fout = de kegels komen giechelend overeind en je rolt opnieuw (nieuwe som).
// Veld: `bowlingBanen: [{ x, kegels }]` — kegels 6-10 óf 20/30/40/50/60.
// De slagboom staat op x + BAAN_MUUR.

import Phaser from 'phaser';
import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';
import { confettiBurst } from '../../reward.js';

export const BAAN_VELD = 300; // afstand station → kegels
export const BAAN_MUUR = 520; // afstand station → slagboom (voor de validator)

// Antwoord-bord in kegel-vorm met een groot getal — ook de Kegel-Koning
// gebruikt deze (keuzeArt-contract: scene, x, y, waarde).
export function tekenKegelBord(s, x, y, waarde) {
  const c = s.add.container(x, y).setDepth(6);
  const g = s.add.graphics();
  g.fillStyle(0x000000, 0.12); g.fillEllipse(0, 30, 40, 8);
  g.fillStyle(0xf5f9fc, 1);
  g.fillEllipse(0, 20, 26, 12);          // voet
  g.fillRoundedRect(-11, -18, 22, 40, 8); // lijf
  g.fillCircle(0, -20, 9);                // kop
  g.fillStyle(0xe8402c, 1); g.fillRect(-11, -8, 22, 7); // rode band
  g.fillStyle(0xffffff, 0.5); g.fillEllipse(-4, -14, 6, 10);
  g.lineStyle(2.5, 0x9aa0a6, 1); g.strokeRoundedRect(-11, -18, 22, 40, 8);
  c.add(g);
  c.add(s.add.text(0, 6, `${waarde}`, {
    fontFamily: 'Arial Black, Arial', fontSize: '17px', fontStyle: 'bold', color: '#16202b',
  }).setOrigin(0.5).setStroke('#ffffff', 3));
  s.tweens.add({ targets: c, y: y - 9, duration: 900 + (waarde % 3) * 160, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  c.waarde = waarde; c.spawnY = y; c.taken = false;
  return c;
}

// Eén mini-kegel (op de baan of op een rek-plank).
function tekenMiniKegel(s, sc = 1) {
  const g = s.add.graphics();
  g.fillStyle(0xf5f9fc, 1);
  g.fillRoundedRect(-5 * sc, -9 * sc, 10 * sc, 20 * sc, 4 * sc);
  g.fillCircle(0, -10 * sc, 4.4 * sc);
  g.fillStyle(0xe8402c, 1); g.fillRect(-5 * sc, -4 * sc, 10 * sc, 3.6 * sc);
  g.lineStyle(1.4 * sc, 0x9aa0a6, 0.8); g.strokeRoundedRect(-5 * sc, -9 * sc, 10 * sc, 20 * sc, 4 * sc);
  return g;
}

function maakKegels(s, B) {
  const groundTop = s.level.platforms[0][1];
  const veldX = B.x + BAAN_VELD;
  B.pins = [];
  if (B.kegels <= 10) {
    // een gewone rij kegels op de baan
    for (let i = 0; i < B.kegels; i++) {
      const pin = s.add.container(veldX - ((B.kegels - 1) * 26) / 2 + i * 26, groundTop - 12).setDepth(5);
      pin.add(tekenMiniKegel(s, 1.35));
      pin.staat = true;
      B.pins.push(pin);
    }
  } else {
    // de KEGEL-KAST: planken van 10 boven elkaar — tientallen die je ZIET
    const rekken = Math.round(B.kegels / 10);
    const kast = s.add.graphics().setDepth(4);
    kast.fillStyle(0x8a6a45, 1);
    kast.fillRoundedRect(veldX - 78, groundTop - 26 - rekken * 34, 10, rekken * 34 + 26, 4);
    kast.fillRoundedRect(veldX + 68, groundTop - 26 - rekken * 34, 10, rekken * 34 + 26, 4);
    for (let r = 0; r < rekken; r++) {
      const plankY = groundTop - 22 - r * 34;
      kast.fillStyle(0xa9855c, 1); kast.fillRoundedRect(veldX - 78, plankY, 156, 8, 4);
      for (let i = 0; i < 10; i++) {
        const pin = s.add.container(veldX - 63 + i * 14, plankY - 9).setDepth(5);
        pin.add(tekenMiniKegel(s, 0.95));
        pin.staat = true;
        B.pins.push(pin); // volgorde: plank 0 (onder) eerst, links → rechts
      }
    }
    B.kast = kast;
  }
}

// De som + antwoord-borden voor deze worp: dynamisch en GESCHUD.
function maakVraag(s, B) {
  const groundTop = s.level.platforms[0][1];
  const N = B.kegels, K = B.gevallen, ans = N - K;
  // twee plausibele afleiders: ±1/±2, en bij tiental-banen ook een tiental-mis
  const kandidaten = N > 10 ? [ans - 10, ans + 10, ans - 1, ans + 1] : [ans - 1, ans + 1, ans - 2, ans + 2];
  const afleiders = [];
  for (const kd of kandidaten) {
    if (kd > 0 && kd < N && kd !== ans && !afleiders.includes(kd)) afleiders.push(kd);
    if (afleiders.length === 2) break;
  }
  const opties = [ans, ...afleiders];
  for (let k = opties.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [opties[k], opties[j]] = [opties[j], opties[k]];
  }
  // het som-bord boven de baan
  const bord = s.add.container(B.x + BAAN_VELD - 60, groundTop - 260).setDepth(7);
  const bg = s.add.graphics();
  bg.fillStyle(0x16202b, 0.6); bg.fillRoundedRect(-92, -26, 184, 52, 14);
  bord.add(bg);
  bord.add(s.add.text(0, 0, `${N} − ${K} = ?`, {
    fontFamily: 'Arial Black, Arial', fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
  }).setOrigin(0.5));
  bord.setScale(0.2);
  s.tweens.add({ targets: bord, scale: 1, duration: 300, ease: 'Back.out' });
  B.somBord = bord;
  // de antwoord-borden (kegel-vorm), zwevend vóór de baan
  B.borden = opties.map((w, i) => {
    const hoog = i % 2 === 1;
    const kb = tekenKegelBord(s, B.x + 40 + i * 110, hoog ? groundTop - 190 : groundTop - 80, w);
    kb.setScale(0.2);
    s.tweens.add({ targets: kb, scale: 1, duration: 300, delay: i * 110, ease: 'Back.out' });
    return kb;
  });
  B.fase = 'vraag';
  s.questText.setText(`Er stonden ${N}, er vielen er ${K} — hoeveel staan er NOG? 🎳`);
}

function rol(s, B) {
  if (B.fase !== 'klaar') return;
  B.fase = 'rollen';
  const groundTop = s.level.platforms[0][1];
  // het aantal gevallen kegels: elke beurt anders (vers bij herspelen)
  if (B.kegels <= 10) {
    B.gevallen = Phaser.Math.Between(1, B.kegels - 1);
  } else {
    // tiental-banen: hele rekken + losse. Max rekken−2 rekken omver, zodat er
    // altijd een mooi tiental-beeld blijft STAAN (60−59=1 is geen les meer).
    const rekken = Math.round(B.kegels / 10);
    B.gevallen = 10 * Phaser.Math.Between(1, Math.max(1, rekken - 2)) + Phaser.Math.Between(0, 9);
  }
  SFX.pick();
  s.questText.setText('Daar rolt de bal… 🎳');
  B.bal.disableInteractive();
  s.tweens.add({
    targets: B.bal, x: B.x + BAAN_VELD - 40, angle: 720, duration: 850, ease: 'Sine.in',
    onComplete: () => {
      // KLETTER! De gevallen kegels tuimelen om (van voor naar achter)
      SFX.stomp(); s.cameraPunch(0.03, 5); SFX.giggle();
      for (let i = 0; i < B.gevallen; i++) {
        const pin = B.pins[i];
        pin.staat = false;
        s.tweens.add({
          targets: pin, angle: i % 2 ? 96 : -96, y: pin.y + 6, alpha: 0.25,
          duration: 300, delay: i * 45, ease: 'Quad.in',
        });
      }
      s.tweens.add({ targets: B.bal, alpha: 0, duration: 250, delay: 350 });
      s.time.delayedCall(Math.min(B.gevallen * 45 + 500, 2600), () => maakVraag(s, B));
    },
  });
}

function goedGeraakt(s, B, bord) {
  B.fase = 'open';
  SFX.correct(); Voice.number(bord.waarde);
  s.tweens.killTweensOf(bord);
  s.burstStars(bord.x, bord.y, 8);
  s.tweens.add({ targets: bord, scale: 0, y: bord.y - 26, duration: 260, ease: 'Back.in', onComplete: () => bord.destroy() });
  (B.borden || []).forEach((b2) => { if (b2 !== bord && b2.active) s.tweens.add({ targets: b2, scale: 0, alpha: 0, duration: 240, onComplete: () => b2.destroy() }); });
  if (B.somBord) {
    const sb = B.somBord; // eerst vangen: B.somBord gaat meteen op null
    B.somBord = null;
    s.tweens.add({ targets: sb, alpha: 0, duration: 300, onComplete: () => sb.destroy() });
  }
  // de staande kegels juichen (hupje), de slagboom gaat open
  B.pins.forEach((pin, i) => {
    if (!pin.staat) return;
    s.tweens.add({ targets: pin, y: pin.y - 10, duration: 180, yoyo: true, delay: i * 30, ease: 'Quad.out' });
  });
  SFX.fanfare(); Voice.cue('cheer'); confettiBurst(s, 100); s.cameraPunch();
  B.body.body.enable = false;
  s.doorGroup.remove(B.body, false, false);
  s.tweens.add({ targets: B.muurArt, y: 480, alpha: 0.2, duration: 700, ease: 'Quad.in' });
  s.questText.setText(`Ja! Er staan er nog ${bord.waarde} — STRIKE voor jou! 🎳`);
  s.vierMijlpaal(B.x + BAAN_VELD);
}

function foutGeraakt(s, B, bord) {
  s.rekenFouten += 1;
  B.fouten = (B.fouten || 0) + 1;
  SFX.oops(); Voice.cue('oops');
  bord.taken = true;
  s.tweens.add({ targets: bord, scale: 0, alpha: 0, duration: 240, ease: 'Back.in' });
  s.questText.setText(`Hmm, ${bord.waarde} klopt niet — tel de kegels die nog staan! 🔍`);
  // anti-gok: na 2 fouten pulseert het goede bord even
  if (B.fouten >= 2) {
    const goed = (B.borden || []).find((b2) => b2.active && b2.waarde === B.kegels - B.gevallen);
    if (goed) s.pulsHulp(goed);
    Voice.hint('hint-bowling', 900);
  }
  s.time.delayedCall(2200, () => {
    if (!bord.active || B.fase !== 'vraag') return;
    bord.taken = false; bord.setScale(1).setAlpha(1); SFX.sparkle();
  });
}

export default {
  build(s, L) {
    s.bowlingBanen = [];
    (L.bowlingBanen || []).forEach((B0) => {
      const groundTop = L.platforms[0][1];

      // het werp-station: een standaard met de bowlingbal erop
      const st = s.add.graphics().setDepth(4);
      st.fillStyle(0x000000, 0.14); st.fillEllipse(B0.x, groundTop + 2, 90, 12);
      st.fillStyle(0x8a6a45, 1); st.fillRoundedRect(B0.x - 30, groundTop - 26, 60, 26, 6);
      st.fillStyle(0xa9855c, 1); st.fillEllipse(B0.x, groundTop - 26, 60, 12);
      // de baan zelf: een gladde strook richting de kegels
      st.fillStyle(0xd9c08a, 0.9); st.fillRect(B0.x + 40, groundTop - 6, BAAN_VELD + 40, 6);
      st.lineStyle(2, 0xb98d12, 0.6);
      st.beginPath(); st.moveTo(B0.x + 40, groundTop - 6); st.lineTo(B0.x + BAAN_VELD + 80, groundTop - 6); st.strokePath();

      // depth 13 = boven de speler (12): de bal staat op sta-hoogte — een tik
      // moet de BAL raken, niet jezelf splitsen (topOnly-regel)
      const bal = s.add.container(B0.x, groundTop - 44).setDepth(13);
      const bg = s.add.graphics();
      bg.fillStyle(0x2b4a8a, 1); bg.fillCircle(0, 0, 16);
      bg.fillStyle(0xffffff, 0.35); bg.fillEllipse(-5, -6, 9, 6);
      bg.fillStyle(0x16202b, 1); bg.fillCircle(-3, -2, 2); bg.fillCircle(3, -2, 2); bg.fillCircle(0, 4, 2);
      bal.add(bg);
      // gecentreerde hit-area (containers doen dat niet vanzelf!)
      bal.setInteractive(new Phaser.Geom.Rectangle(-26, -26, 52, 52), Phaser.Geom.Rectangle.Contains);
      bal.input.cursor = 'pointer';
      s.tweens.add({ targets: bal, y: bal.y - 5, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

      // de slagboom achter de kegels (schermhoge blokkade)
      const muurX = B0.x + BAAN_MUUR;
      const body = s.add.rectangle(muurX, (40 + groundTop) / 2, 46, groundTop - 40, 0x000000, 0);
      s.physics.add.existing(body, true);
      s.doorGroup.add(body);
      const muurArt = s.add.container(muurX, 0).setDepth(4);
      const mg = s.add.graphics();
      mg.fillStyle(0xf5f9fc, 1); mg.fillRoundedRect(-23, 150, 46, groundTop - 148, 10);
      mg.fillStyle(0xe8402c, 1);
      for (let ky = 170; ky < groundTop - 20; ky += 80) mg.fillRect(-23, ky, 46, 26); // rood-witte banen
      mg.lineStyle(3, 0x9aa0a6, 1); mg.strokeRoundedRect(-23, 150, 46, groundTop - 148, 10);
      muurArt.add(mg);

      const B = {
        ...B0, bal, balStartX: B0.x, body, muurArt,
        fase: 'klaar', gevallen: 0, fouten: 0, pins: [], borden: [], somBord: null, cuePlayed: false,
      };
      maakKegels(s, B);
      bal.on('pointerdown', () => rol(s, B));
      s.bowlingBanen.push(B);
    });
  },

  update(s) {
    if (!s.bowlingBanen || !s.bowlingBanen.length) return;
    const p = s.player;
    for (const B of s.bowlingBanen) {
      if (B.fase === 'open') continue;
      if (!B.cuePlayed && Math.abs(p.x - B.x) < 260) {
        B.cuePlayed = true;
        Voice.hint('hint-bowling');
        s.questText.setText('Tik de bal — rol de kegels om! 🎳');
      }
      // opnieuw klaarzetten na een foute ronde gebeurt in reset(); antwoorden aanraken:
      if (B.fase === 'vraag') {
        for (const bord of B.borden) {
          if (!bord.active || bord.taken) continue;
          const dxB = Math.max(p.body.left - bord.x, 0, bord.x - p.body.right);
          const dyB = Math.max(p.body.top - bord.y, 0, bord.y - p.body.bottom);
          if (dxB * dxB + dyB * dyB > 50 * 50) continue;
          if (bord.waarde === B.kegels - B.gevallen) goedGeraakt(s, B, bord);
          else foutGeraakt(s, B, bord);
          break;
        }
      }
    }
  },
};

