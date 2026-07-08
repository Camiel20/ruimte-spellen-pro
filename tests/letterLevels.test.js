import { describe, it, expect } from 'vitest';
import { LETTER_LEVELS } from '../src/levels/letterLevels.js';
import { validateLevel } from '../src/adventure/logic.js';
import { WERELDEN } from '../src/alfaLogic.js';
import { LOWER_PATHS } from '../src/glyphs.js';

describe('Letter-Land levels', () => {
  it('genereert één level per W1-woord', () => {
    expect(LETTER_LEVELS.length).toBe(WERELDEN[0].woorden.length);
  });

  it('elk level is geldig volgens de validator', () => {
    for (const L of LETTER_LEVELS) {
      expect(validateLevel(L), `${L.id}: ${validateLevel(L).join('; ')}`).toEqual([]);
    }
  });

  it('elk level heeft één schrijf-poort per letter, met een bestaand pad', () => {
    LETTER_LEVELS.forEach((L, i) => {
      const woord = WERELDEN[0].woorden[i].w;
      expect(L.schrijfPoorten.map((p) => p.letter).join('')).toBe(woord);
      expect(L.goal.woord).toBe(woord);
      for (const p of L.schrijfPoorten) expect(LOWER_PATHS[p.letter]).toBeTruthy();
    });
  });

  it('de kloven zijn te breed om zomaar over te springen (schrijven verplicht)', () => {
    for (const L of LETTER_LEVELS) for (const p of L.schrijfPoorten) expect(p.gapW).toBeGreaterThanOrEqual(300);
  });
});
