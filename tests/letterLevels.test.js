import { describe, it, expect } from 'vitest';
import { LETTER_LEVELS } from '../src/levels/letterLevels.js';
import { validateLevel } from '../src/adventure/logic.js';
import { LOWER_PATHS } from '../src/glyphs.js';

describe('Letter-Land — Wereld 1 "De Praatweide"', () => {
  it('heeft 5 levels (4 gewoon + 1 baas)', () => {
    expect(LETTER_LEVELS.length).toBe(5);
    expect(LETTER_LEVELS.map((L) => L.id)).toEqual(['alfa-1', 'alfa-2', 'alfa-3', 'alfa-4', 'alfa-5']);
  });

  it('elk level is geldig volgens de validator', () => {
    for (const L of LETTER_LEVELS) {
      expect(validateLevel(L), `${L.id}: ${validateLevel(L).join('; ')}`).toEqual([]);
    }
  });

  it('elk level heeft de eigen sfeer (letter-terrein + Priet)', () => {
    for (const L of LETTER_LEVELS) {
      expect(L.terrain).toBe('letters');
      expect(L.maatje).toBe('potlood');
    }
  });

  it('de schrijf-poorten spellen het woord van de vlag, met bestaande paden', () => {
    for (const L of LETTER_LEVELS) {
      expect(L.schrijfPoorten.map((p) => p.letter).join('')).toBe(L.goal.woord);
      for (const p of L.schrijfPoorten) expect(LOWER_PATHS[p.letter]).toBeTruthy();
    }
  });

  it('de kloven zijn te breed om over te springen (schrijven verplicht)', () => {
    for (const L of LETTER_LEVELS) for (const p of L.schrijfPoorten) expect(p.gapW).toBeGreaterThanOrEqual(300);
  });

  it('het laatste level is de baas: De Sisser + finale', () => {
    const baas = LETTER_LEVELS[LETTER_LEVELS.length - 1];
    expect(baas.sisser).toBeTruthy();
    expect(baas.finale).toBe('letter');
    expect(baas.reward.stars).toBe(5);
  });
});
