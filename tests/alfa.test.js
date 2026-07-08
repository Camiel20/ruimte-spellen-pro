import { describe, it, expect } from 'vitest';
import { WERELDEN, valideerWerelden, letters, KLANKEN } from '../src/alfaLogic.js';
import { ICOON_IDS } from '../src/alfaIconen.js';
import { LOWER_PATHS } from '../src/glyphs.js';

describe('Alfa-Blokken woord-data', () => {
  it('valideert zonder ontwerpfouten', () => {
    expect(valideerWerelden(ICOON_IDS)).toEqual([]);
  });

  it('elke wereld heeft woorden van de juiste lengte, in kleine letters', () => {
    for (const W of WERELDEN) {
      expect(W.woorden.length).toBeGreaterThan(0);
      for (const { w } of W.woorden) {
        expect(w).toBe(w.toLowerCase());
        expect(w.length).toBe(W.lengte);
      }
    }
  });

  it('elke letter in elk woord heeft een klein-letter overtrek-pad', () => {
    for (const W of WERELDEN) {
      for (const { w } of W.woorden) {
        for (const ch of letters(w)) {
          expect(LOWER_PATHS[ch], `pad voor '${ch}'`).toBeTruthy();
        }
      }
    }
  });

  it('elk woord-icoon bestaat in alfaIconen', () => {
    const set = new Set(ICOON_IDS);
    for (const W of WERELDEN) for (const { icoon } of W.woorden) expect(set.has(icoon)).toBe(true);
  });

  it('alle 26 kleine letters hebben een klank en een pad', () => {
    for (const ch of 'abcdefghijklmnopqrstuvwxyz') {
      expect(LOWER_PATHS[ch], `pad ${ch}`).toBeTruthy();
      expect(KLANKEN[ch], `klank ${ch}`).toBeTruthy();
    }
  });
});
