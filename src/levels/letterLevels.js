// ===== LETTER-LAND — LEVELDATA (rondloop-schrijfwereld) =====
// Het letter-avontuur hergebruikt de hele Getallen-Land-engine (AdventureScene):
// je loopt, springt en verkent, maar de "poorten" zijn SCHRIJF-poorten — schrijf
// de kleine letter van een slapend Alfa-Blok en er verschijnt een brug. Zo bouw
// je al lopend een woord bij elkaar.
//
// De levels worden GEGENEREERD uit de woordenlijst (src/alfaLogic.js) zodat de
// werelden vanzelf meegroeien: één level per woord, één schrijf-poort per letter.

import { WERELDEN } from '../alfaLogic.js';

const GROND = 660;
const SEG = 680;   // grondstuk tussen de kloven
const GAP = 340;   // kloof-breedte (te breed om over te springen → je moet schrijven)

function maakLevel(woord, idx) {
  const chars = [...woord];
  const platforms = [];
  const schrijfPoorten = [];
  let x = 0;

  platforms.push([0, GROND, SEG + 80, 140]); // ruime start-grond
  x = SEG + 80;

  chars.forEach((ch, i) => {
    const gapX = x;
    schrijfPoorten.push({
      letter: ch,
      gapX, gapW: GAP,
      x: gapX - 46,                 // het slapende blok net vóór de kloof
      triggerX: gapX - 160, triggerW: 170,
      kleurIdx: i,
    });
    x = gapX + GAP;
    platforms.push([x, GROND, SEG, 140]);
    x += SEG;
  });

  const worldW = x;
  return {
    id: `alfa-${idx + 1}`,
    naam: `Woord: ${woord}`,
    worldW, worldH: 800, killY: 720,
    bg: { top: 0x8fd3ff, bottom: 0x8ed36b },
    terrain: 'gras',
    start: { x: 90, y: 560 },
    intro: `Schrijf het woord: ${woord.toUpperCase()}!`,
    afterGate: 'Ren verder! 🚩',
    platforms,
    schrijfPoorten,
    goal: { x: worldW - 110, y: 588, woord, value: chars.length },
    reward: {
      title: `Je schreef "${woord}"! 🏆`,
      subtitle: 'Alle letters geschreven en het woord gebouwd!',
      stars: 3, medal: `alfa_${woord}`, medalLabel: 'Woord-Bouwer',
    },
  };
}

export const LETTER_LEVELS = WERELDEN[0].woorden.map((w, i) => maakLevel(w.w, i));
