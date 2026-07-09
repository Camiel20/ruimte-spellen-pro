import { describe, it, expect } from 'vitest';
import { LETTER_LEVELS } from '../src/levels/letterLevels.js';
import { validateLevel } from '../src/adventure/logic.js';
import { LOWER_PATHS } from '../src/glyphs.js';

const clone = (o) => JSON.parse(JSON.stringify(o));
const gewoon = LETTER_LEVELS.filter((L) => !L.boss);      // schrijf-levels
const baas = LETTER_LEVELS[LETTER_LEVELS.length - 1];     // De Sisser

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

  it('elk level haalt de norm-lengte (5000-6000px, geen dun level meer)', () => {
    for (const L of LETTER_LEVELS) expect(L.worldW).toBeGreaterThanOrEqual(5000);
  });

  it('de schrijf-poorten spellen het woord van de vlag, met bestaande paden', () => {
    for (const L of gewoon) {
      expect(L.schrijfPoorten.map((p) => p.letter).join('')).toBe(L.goal.woord);
      for (const p of L.schrijfPoorten) expect(LOWER_PATHS[p.letter]).toBeTruthy();
    }
  });

  it('de kloven zijn te breed om over te springen (schrijven verplicht)', () => {
    for (const L of gewoon) for (const p of L.schrijfPoorten) expect(p.gapW).toBeGreaterThanOrEqual(300);
  });

  it('krachten verdien je door letter-vriendjes te redden (geldige geeft-waarden)', () => {
    const KRACHTEN = new Set(['doubleJump', 'stamp', 'duw', 'mega']);
    const gegeven = new Set();
    for (const L of gewoon) for (const p of L.schrijfPoorten) {
      if (p.geeft) { expect(KRACHTEN.has(p.geeft)).toBe(true); gegeven.add(p.geeft); }
    }
    // de drie kern-krachten worden ergens in de wereld geschonken
    expect(gegeven.has('doubleJump')).toBe(true);
    expect(gegeven.has('stamp')).toBe(true);
    expect(gegeven.has('duw')).toBe(true);
  });

  it('het laatste level is de baas: De Sisser (stijl sisser) + finale', () => {
    expect(baas.boss).toBeTruthy();
    expect(baas.boss.stijl).toBe('sisser');
    expect(baas.boss.look).toBe('sisser');
    expect(baas.boss.stages.map((s) => s.letter).join('')).toBe(baas.boss.woord);
    expect(baas.boss.woord).toBe(baas.goal.woord);
    expect(baas.finale).toBe('letter');
    expect(baas.reward.stars).toBe(5);
  });
});

describe('Validator — nieuwe Letter-Land-regels', () => {
  it('keurt een sisser-baas met een ongeldige letter af', () => {
    const L = clone(baas);
    L.boss.stages[0].letter = 'P'; // hoofdletter — moet a-z zijn
    expect(validateLevel(L).some((e) => /sisser/.test(e))).toBe(true);
  });

  it('keurt een schrijf-poort met een onbekende kracht af', () => {
    const L = clone(gewoon[0]);
    L.schrijfPoorten[0].geeft = 'vliegen';
    expect(validateLevel(L).some((e) => /geeft/.test(e))).toBe(true);
  });
});
