// Valideert ALLE leveldata: elk level moet oplosbaar en compleet zijn.
// Dit vangt ontwerpfouten (onhaalbare brug, vlag buiten de wereld, platform
// dwars door een kloof) op het moment dat je ze maakt — niet pas al spelend.
import { describe, it, expect } from 'vitest';
import { validateLevel, canMakeTarget, findPair, splitParts } from '../src/adventure/logic.js';
import { LEVELS } from '../src/levels/index.js';

describe('leveldata', () => {
  it('heeft unieke level-ids', () => {
    const ids = LEVELS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const L of LEVELS) {
    it(`level ${L.id} (${L.naam}) is geldig en oplosbaar`, () => {
      expect(validateLevel(L)).toEqual([]);
    });
  }
});

describe('puzzellogica', () => {
  it('canMakeTarget: subset-som', () => {
    expect(canMakeTarget([4, 6], 10)).toBe(true);
    expect(canMakeTarget([3, 4, 7], 10)).toBe(true);   // 3+7
    expect(canMakeTarget([2, 5, 8], 10)).toBe(true);   // 2+8
    expect(canMakeTarget([1, 2], 5)).toBe(false);      // te weinig
    expect(canMakeTarget([6, 6], 10)).toBe(false);     // alleen 6 of 12
    expect(canMakeTarget([2, 3, 4], 9)).toBe(true);    // drie samen
  });

  it('findPair: vindt een kloppend paar (of null)', () => {
    expect(findPair([3, 4, 7], 10)).toEqual([0, 2]);
    expect(findPair([5, 5], 10)).toEqual([0, 1]);
    expect(findPair([6, 6], 10)).toBeNull();
  });

  it('splitParts: splitst op de gekozen celgrens, altijd geldige delen', () => {
    expect(splitParts(7, 3)).toEqual([3, 4]);
    expect(splitParts(7, 5)).toEqual([5, 2]);
    expect(splitParts(7, 0)).toEqual([1, 6]);   // clamp onder
    expect(splitParts(7, 99)).toEqual([6, 1]);  // clamp boven
    expect(splitParts(2, 1)).toEqual([1, 1]);
  });

  it('validateLevel: vangt een grommel die de kloof in wandelt', () => {
    const kapot = {
      id: 'x-2', worldW: 1000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 400, 140], [760, 660, 240, 140]],
      grommels: [{ type: 'stomp', x: 300, y: 612, patrol: [200, 500] }], // 500 > rand 400
      goal: { x: 900, y: 588, value: 3 },
    };
    const errors = validateLevel(kapot);
    expect(errors.some((e) => e.includes('kloof in'))).toBe(true);
  });

  it('validateLevel: vangt een start zonder grond eronder', () => {
    const kapot = {
      id: 'x-3', worldW: 1000, worldH: 800, killY: 720,
      start: { x: 500, y: 500 }, // boven het gat tussen de platforms
      platforms: [[0, 660, 400, 140], [760, 660, 240, 140]],
      goal: { x: 900, y: 588, value: 3 },
    };
    const errors = validateLevel(kapot);
    expect(errors.some((e) => e.includes('geen platform eronder'))).toBe(true);
  });

  it('validateLevel: vangt een geef-plaat die kan vastlopen', () => {
    const kapot = {
      id: 'x-4', worldW: 1000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 1000, 140]],
      pickups: [{ x: 100, y: 600, amount: 1 }], // maar 1 bolletje vóór de plaat
      plates: [{ x: 400, doel: 3 }],
      goal: { x: 900, y: 588, value: 3 },
    };
    const errors = validateLevel(kapot);
    expect(errors.some((e) => e.includes('vastlopen'))).toBe(true);
    // mét een regen-bolletje is het wél haalbaar
    const goed = { ...kapot, pickups: [{ x: 100, y: 600, amount: 1, regen: true }] };
    expect(validateLevel(goed)).toEqual([]);
  });

  it('validateLevel: vangt een onoplosbare brug (samen te weinig)', () => {
    const kapot = {
      id: 'x-1', worldW: 1000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 400, 140], [760, 660, 240, 140]],
      gate: { gapX: 400, gapW: 360, y: 650, doel: 10, blocks: [1, 2], triggerX: 300, triggerW: 100 },
      goal: { x: 900, y: 588, value: 10 },
    };
    const errors = validateLevel(kapot);
    expect(errors.some((e) => e.includes('onoplosbaar'))).toBe(true);
    // [6,6] → 10 is WÉL oplosbaar (samenvoegen tot 12, dan splitsen op 10+2)
    const splitsbaar = { ...kapot, gate: { ...kapot.gate, blocks: [6, 6] } };
    expect(validateLevel(splitsbaar)).toEqual([]);
  });

  it('validateLevel: vangt een trein die niet precies te verdelen is', () => {
    const kapot = {
      id: 'x-5', worldW: 1000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 400, 140], [760, 660, 240, 140]],
      gate: { type: 'trein', gapX: 400, gapW: 360, y: 650, wagons: [4, 6], blocks: [8], triggerX: 300, triggerW: 100 },
      goal: { x: 900, y: 588, value: 10 },
    };
    const errors = validateLevel(kapot);
    expect(errors.some((e) => e.includes('verdelen moet precies kloppen'))).toBe(true);
  });
});
