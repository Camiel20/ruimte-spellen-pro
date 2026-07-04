// Tests voor de Ballon-Feest-spellogica (src/balloonLogic.js).
// Dit is het "brein" van het spel: zwaartekracht, groepen, spawn-plafond,
// regenboog-joker en de prik/sterren-regels.
import { describe, it, expect } from 'vitest';
import {
  COLS, ROWS, RAINBOW, PRIK_MAX, PRIK_LAADT_BIJ,
  maakBord, valOmlaag, vindGroep, mergeWaarde, activeerRegenboog,
  spawnOpties, kiesVolgende, magRegenboog, verdienPrik, sterrenVoorScore,
} from '../src/balloonLogic.js';

// Hulpje: bouw een bord uit een compacte matrix (rij 0 = bovenaan).
function bord(matrix) {
  const state = maakBord();
  matrix.forEach((rij, r) => rij.forEach((v, c) => { state.vals[r][c] = v; }));
  return state;
}

describe('valOmlaag (zwaartekracht)', () => {
  it('laat zwevende ballonnen naar de bodem zakken', () => {
    const s = maakBord();
    s.vals[2][0] = 4;
    s.vals[5][0] = 8;
    valOmlaag(s);
    expect(s.vals[ROWS - 1][0]).toBe(8);   // onderste eerst
    expect(s.vals[ROWS - 2][0]).toBe(4);   // daarboven
    expect(s.vals[2][0]).toBe(0);
    expect(s.vals[5][0]).toBe(0);
  });

  it('verplaatst de items-laag (sprites) precies mee', () => {
    const s = maakBord();
    s.vals[0][3] = 2;
    s.items[0][3] = 'sprite-A';
    valOmlaag(s);
    expect(s.vals[ROWS - 1][3]).toBe(2);
    expect(s.items[ROWS - 1][3]).toBe('sprite-A');
    expect(s.items[0][3]).toBe(null);
  });

  it('laat lastDrop meeverhuizen met de gevallen ballon', () => {
    const s = maakBord();
    s.vals[1][2] = 4;
    s.lastDrop = { r: 1, c: 2 };
    valOmlaag(s);
    expect(s.lastDrop).toEqual({ r: ROWS - 1, c: 2 });
  });
});

describe('vindGroep (flood-fill)', () => {
  it('vindt twee gelijke buren', () => {
    const s = maakBord();
    s.vals[7][0] = 8;
    s.vals[7][1] = 8;
    const g = vindGroep(s.vals);
    expect(g).not.toBe(null);
    expect(g.val).toBe(8);
    expect(g.cells).toHaveLength(2);
  });

  it('vindt een L-vormige groep van drie in één keer', () => {
    const s = maakBord();
    s.vals[7][0] = 4;
    s.vals[7][1] = 4;
    s.vals[6][0] = 4;
    const g = vindGroep(s.vals);
    expect(g.cells).toHaveLength(3);
  });

  it('ziet diagonale ballonnen NIET als buren', () => {
    const s = maakBord();
    s.vals[7][0] = 4;
    s.vals[6][1] = 4;
    expect(vindGroep(s.vals)).toBe(null);
  });

  it('laat regenboog-jokers met rust (ook twee naast elkaar)', () => {
    const s = maakBord();
    s.vals[7][0] = RAINBOW;
    s.vals[7][1] = RAINBOW;
    expect(vindGroep(s.vals)).toBe(null);
  });
});

describe('mergeWaarde', () => {
  it('verdubbelt per extra ballon: 2 -> x2, 3 -> x4, 4 -> x8', () => {
    expect(mergeWaarde(8, 2)).toBe(16);
    expect(mergeWaarde(8, 3)).toBe(32);
    expect(mergeWaarde(2, 4)).toBe(16);
  });
});

describe('activeerRegenboog', () => {
  it('neemt de HOOGSTE buurwaarde aan', () => {
    const s = maakBord();
    s.vals[7][1] = RAINBOW;
    s.vals[7][0] = 4;
    s.vals[7][2] = 16;
    const rb = activeerRegenboog(s.vals);
    expect(rb).toEqual({ r: 7, c: 1, val: 16 });
  });

  it('blijft wachten zonder getal-buur', () => {
    const s = maakBord();
    s.vals[7][3] = RAINBOW;
    expect(activeerRegenboog(s.vals)).toBe(null);
  });

  it('telt een andere regenboog niet als buur', () => {
    const s = maakBord();
    s.vals[7][0] = RAINBOW;
    s.vals[7][1] = RAINBOW;
    expect(activeerRegenboog(s.vals)).toBe(null);
  });
});

describe('spawnOpties (de kern-fix tegen vastlopen)', () => {
  it('geeft aan het begin alleen 2, 4 en 8', () => {
    const uniek = [...new Set(spawnOpties(2))].sort((a, b) => a - b);
    expect(uniek).toEqual([2, 4, 8]);
  });

  it('blijft klein zolang je beste ballon klein is (t/m 64)', () => {
    const uniek = [...new Set(spawnOpties(64))].sort((a, b) => a - b);
    expect(uniek).toEqual([2, 4, 8]);
  });

  it('kruipt heel traag mee: beste 512 -> plafond 64', () => {
    const uniek = [...new Set(spawnOpties(512))].sort((a, b) => a - b);
    expect(uniek).toEqual([2, 4, 8, 16, 32, 64]);
  });

  it('komt NOOIT boven 64 uit, hoe groot je beste ballon ook is', () => {
    expect(Math.max(...spawnOpties(4096))).toBe(64);
    expect(Math.max(...spawnOpties(1 << 20))).toBe(64);
  });

  it('laat kleine waarden zwaarder wegen dan grote', () => {
    const opties = spawnOpties(2); // plafond 8
    const tel = (v) => opties.filter((x) => x === v).length;
    expect(tel(2)).toBeGreaterThan(tel(4));
    expect(tel(4)).toBeGreaterThan(tel(8));
  });

  it('kiesVolgende pakt netjes de randen van de lijst', () => {
    expect(kiesVolgende(2, () => 0)).toBe(2);         // eerste optie
    expect(kiesVolgende(2, () => 0.9999)).toBe(8);    // laatste optie
  });
});

describe('magRegenboog (genade-drop)', () => {
  it('geeft niets op een rustig bord', () => {
    const s = maakBord();
    s.vals[7][0] = 4;
    expect(magRegenboog(s.vals, 99)).toBe(false);
  });

  it('grijpt in als een stapel de bovenste rijen raakt', () => {
    const s = maakBord();
    for (let r = 1; r < ROWS; r++) s.vals[r][2] = 2 ** (r + 1); // toren tot rij 1
    expect(magRegenboog(s.vals, 10)).toBe(true);
  });

  it('grijpt in als het bord >= 60% vol staat', () => {
    const s = maakBord();
    let n = 0;
    const nodig = Math.floor(ROWS * COLS * 0.6);
    // vul van onderaf, zonder de bovenste twee rijen te raken
    for (let r = ROWS - 1; r >= 2 && n < nodig; r--) {
      for (let c = 0; c < COLS && n < nodig; c++) { s.vals[r][c] = 4; n++; }
    }
    expect(magRegenboog(s.vals, 10)).toBe(true);
  });

  it('respecteert de afkoeltijd van 6 drops', () => {
    const s = maakBord();
    for (let r = 1; r < ROWS; r++) s.vals[r][2] = 2 ** (r + 1);
    expect(magRegenboog(s.vals, 3)).toBe(false);
  });
});

describe('prik & sterren', () => {
  it('een grote merge geeft een prik-lading terug', () => {
    expect(verdienPrik(PRIK_LAADT_BIJ)).toBe(true);
    expect(verdienPrik(32)).toBe(false);
    expect(PRIK_MAX).toBe(3);
  });

  it('sterren: minimaal 1, 1 per 200 punten, maximaal 25', () => {
    expect(sterrenVoorScore(0)).toBe(1);
    expect(sterrenVoorScore(1000)).toBe(5);
    expect(sterrenVoorScore(999999)).toBe(25);
  });
});
