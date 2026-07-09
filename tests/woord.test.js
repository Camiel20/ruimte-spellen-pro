import { describe, it, expect } from 'vitest';
import { letterKlopt, volgendeVak, woordAf, benodigdeLetters, schud, M1_WOORDEN } from '../src/letterland/woordLogic.js';

describe('Woord-magie — kern-logica', () => {
  it('letterKlopt controleert per vakje-positie', () => {
    expect(letterKlopt('zon', 0, 'z')).toBe(true);
    expect(letterKlopt('zon', 1, 'o')).toBe(true);
    expect(letterKlopt('zon', 1, 'z')).toBe(false);
    expect(letterKlopt('zon', 3, 'x')).toBe(false); // buiten het woord
  });

  it('volgendeVak vindt het eerste lege vakje', () => {
    expect(volgendeVak([null, null, null], 3)).toBe(0);
    expect(volgendeVak(['z', null, null], 3)).toBe(1);
    expect(volgendeVak(['z', 'o', 'n'], 3)).toBe(-1); // vol
  });

  it('woordAf herkent een correct gespeld woord', () => {
    expect(woordAf(['z', 'o', 'n'], 'zon')).toBe(true);
    expect(woordAf(['z', 'n', 'o'], 'zon')).toBe(false);
    expect(woordAf(['z', 'o'], 'zon')).toBe(false);
  });

  it('benodigdeLetters geeft de letters (met dubbelen)', () => {
    expect(benodigdeLetters('bel')).toEqual(['b', 'e', 'l']);
    expect(benodigdeLetters('sok')).toEqual(['s', 'o', 'k']);
  });

  it('schud behoudt alle letters (alleen de volgorde wisselt)', () => {
    const bron = ['z', 'o', 'n', 'm', 'a', 't'];
    const uit = schud(bron, () => 0.5);
    expect([...uit].sort()).toEqual([...bron].sort());
    expect(uit.length).toBe(bron.length);
  });

  it('M1 heeft 4 tekenbare 3-letterwoorden', () => {
    expect(M1_WOORDEN.length).toBe(4);
    for (const w of M1_WOORDEN) {
      expect(w).toMatch(/^[a-z]{3}$/);
    }
  });
});
