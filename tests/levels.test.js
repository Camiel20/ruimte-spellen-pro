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

  it('validateLevel: vangt een raket-tank die nooit vol kan', () => {
    const kapot = {
      id: 'x-6', worldW: 3000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 1400, 140], [2400, 660, 600, 140]],
      raket: { x: 1300, doel: 100, landX: 2500, drums: [[200, 600], [400, 600], [600, 600]] }, // 3×10 = 30 < 100
      goal: { x: 2900, y: 588, value: 100 },
    };
    const errors = validateLevel(kapot);
    expect(errors.some((e) => e.includes('tank kan nooit vol'))).toBe(true);
    // met 10 vaatjes is het wél in orde
    const goed = { ...kapot, raket: { ...kapot.raket, drums: Array.from({ length: 10 }, (_, i) => [150 + i * 100, 600]) } };
    expect(validateLevel(goed)).toEqual([]);
  });

  it('validateLevel: vangt een portaal-groep zonder (of met dubbele) goede som', () => {
    const basis = {
      id: 'x-7', worldW: 2000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 2000, 140]],
      goal: { x: 1900, y: 588, value: 20 },
    };
    // geen enkele som maakt 20 → onoplosbaar
    const geen = { ...basis, portalen: [{ x: 600, doel: 20, opties: [[10, 5], [20, 10]] }] };
    expect(validateLevel(geen).some((e) => e.includes('precies één'))).toBe(true);
    // twee sommen maken 20 → geen raadsel meer
    const dubbel = { ...basis, portalen: [{ x: 600, doel: 20, opties: [[10, 10], [15, 5]] }] };
    expect(validateLevel(dubbel).some((e) => e.includes('precies één'))).toBe(true);
    // precies één goede som → in orde
    const goed = { ...basis, portalen: [{ x: 600, doel: 20, opties: [[10, 10], [15, 10]] }] };
    expect(validateLevel(goed)).toEqual([]);
  });

  it('validateLevel: vangt een grauwe muur zonder tien-kracht', () => {
    const kapot = {
      id: 'x-9', worldW: 2000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 2000, 140]],
      grauwMuren: [800], // geen startMega en geen redding die 'mega' geeft
      goal: { x: 1900, y: 588, value: 10 },
    };
    expect(validateLevel(kapot).some((e) => e.includes('tien-kracht'))).toBe(true);
    // mét startMega is het wél in orde
    const goed = { ...kapot, startMega: true };
    expect(validateLevel(goed)).toEqual([]);
  });

  it('validateLevel: vangt een bakkerij die niet eerlijk te verdelen is', () => {
    const basis = {
      id: 'x-10', worldW: 3000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 1500, 140], [2400, 660, 600, 140]],
      goal: { x: 2900, y: 588, value: 3 },
    };
    // 5 toppings over 2 pizza's à 3 = 6 nodig → onoplosbaar
    const kapot = { ...basis, bakkerij: { x: 1400, pizzas: 2, per: 3, toppings: [[100, 600], [200, 600], [300, 600], [400, 600], [500, 600]], brug: [1500, 660, 900] } };
    expect(validateLevel(kapot).some((e) => e.includes('eerlijk delen'))).toBe(true);
    // met 6 toppings klopt het precies
    const goed = { ...kapot, bakkerij: { ...kapot.bakkerij, toppings: [[100, 600], [200, 600], [300, 600], [400, 600], [500, 600], [600, 600]] } };
    expect(validateLevel(goed)).toEqual([]);
  });

  it('validateLevel: vangt een geiser die niet op de grond staat', () => {
    const kapot = {
      id: 'x-11', worldW: 1000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 400, 140], [760, 660, 240, 140]],
      geisers: [{ x: 500 }], // midden in de kloof
      goal: { x: 900, y: 588, value: 3 },
    };
    expect(validateLevel(kapot).some((e) => e.includes('geiser'))).toBe(true);
  });

  it('validateLevel: vangt een kantel-punt buiten de wereld', () => {
    const kapot = {
      id: 'x-12', worldW: 1000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 1000, 140]],
      kantels: [[980, 600, 130]], // steekt buiten de wereld
      goal: { x: 900, y: 588, value: 3 },
    };
    expect(validateLevel(kapot).some((e) => e.includes('kantel-punt'))).toBe(true);
  });

  it('validateLevel: vangt een maan-zone buiten de wereld', () => {
    const kapot = {
      id: 'x-8', worldW: 1000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 1000, 140]],
      maanZones: [{ x: 800, w: 400 }], // steekt 200px buiten de wereld
      goal: { x: 900, y: 588, value: 3 },
    };
    const errors = validateLevel(kapot);
    expect(errors.some((e) => e.includes('maan-zone'))).toBe(true);
  });
});
