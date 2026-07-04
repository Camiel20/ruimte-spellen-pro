// Tests voor de Bezorg-Baas-logica (src/bezorgLogic.js).
import { describe, it, expect } from 'vitest';
import {
  WOORDEN, NIVEAU_MAX, LEVERINGEN_PER_RONDE,
  labelDorp, kiesBestelling, isJuisteBezorging,
  nieuweLadder, ladderGoed, ladderFout, sterrenVoorRonde,
} from '../src/bezorgLogic.js';

describe('woordenlijst', () => {
  it('alle woorden zijn maximaal 5 letters en hoofdletters', () => {
    WOORDEN.forEach((w) => {
      expect(w.length).toBeLessThanOrEqual(5);
      expect(w).toBe(w.toUpperCase());
    });
  });
});

describe('labelDorp', () => {
  it('geeft het gevraagde aantal huizen met unieke getallen en woorden', () => {
    const labels = labelDorp(8, 3);
    expect(labels).toHaveLength(8);
    const getallen = labels.filter((l) => l.kind === 'getal').map((l) => l.getal);
    const woorden = labels.filter((l) => l.kind === 'woord').map((l) => l.woord);
    expect(woorden.length).toBe(3);
    expect(getallen.length).toBe(5);
    expect(new Set(getallen).size).toBe(getallen.length); // uniek
    expect(new Set(woorden).size).toBe(woorden.length);
    getallen.forEach((g) => { expect(g).toBeGreaterThanOrEqual(1); expect(g).toBeLessThanOrEqual(9); });
  });

  it('kan een dorp zonder woorden maken', () => {
    const labels = labelDorp(5, 0);
    expect(labels.every((l) => l.kind === 'getal')).toBe(true);
  });
});

describe('kiesBestelling per niveau', () => {
  const labels = [
    { kind: 'getal', getal: 5 }, { kind: 'getal', getal: 8 }, { kind: 'getal', getal: 3 },
    { kind: 'getal', getal: 1 }, { kind: 'getal', getal: 9 },
    { kind: 'woord', woord: 'OMA' }, { kind: 'woord', woord: 'BAL' }, { kind: 'woord', woord: 'VIS' },
  ];

  it('niveau 1: altijd een direct getal-adres', () => {
    for (let i = 0; i < 30; i++) {
      const b = kiesBestelling(labels, 1);
      expect(b.soort).toBe('getal');
      expect(labels[b.slot].kind).toBe('getal');
      expect(b.tekst).toBe(String(labels[b.slot].getal));
    }
  });

  it('niveau 2: kan ook een woord-adres geven', () => {
    let woordGezien = false;
    for (let i = 0; i < 60; i++) {
      const b = kiesBestelling(labels, 2);
      expect(['getal', 'woord']).toContain(b.soort);
      if (b.soort === 'woord') { woordGezien = true; expect(labels[b.slot].woord).toBe(b.woord); }
    }
    expect(woordGezien).toBe(true);
  });

  it('niveau 3: som-adres klopt met het huisnummer', () => {
    let somGezien = false;
    for (let i = 0; i < 80; i++) {
      const b = kiesBestelling(labels, 3);
      if (b.soort === 'som') {
        somGezien = true;
        expect(b.a + b.b).toBe(b.getal);
        expect(b.a).toBeGreaterThanOrEqual(1);
        expect(b.b).toBeGreaterThanOrEqual(1);
        expect(labels[b.slot].getal).toBe(b.getal);
      }
    }
    expect(somGezien).toBe(true);
  });

  it('kiest niet twee keer achter elkaar hetzelfde huis', () => {
    let vorige = -1;
    for (let i = 0; i < 40; i++) {
      const b = kiesBestelling(labels, 3, Math.random, vorige);
      expect(b.slot).not.toBe(vorige);
      vorige = b.slot;
    }
  });
});

describe('isJuisteBezorging', () => {
  it('true bij het doelhuis, false bij een ander', () => {
    const b = { slot: 4 };
    expect(isJuisteBezorging(b, 4)).toBe(true);
    expect(isJuisteBezorging(b, 2)).toBe(false);
  });
});

describe('adaptieve ladder', () => {
  it('3 goed → omhoog, 2 fout → terug, binnen 1..3', () => {
    let l = nieuweLadder(1);
    l = ladderGoed(ladderGoed(ladderGoed(l)));
    expect(l.niveau).toBe(2);
    l = ladderFout(ladderFout(l));
    expect(l.niveau).toBe(1);
    l = ladderFout(ladderFout(l)); // niet onder 1
    expect(l.niveau).toBe(1);
    let hoog = nieuweLadder(3);
    for (let i = 0; i < 6; i++) hoog = ladderGoed(hoog);
    expect(hoog.niveau).toBe(NIVEAU_MAX);
  });

  it('een goede levering breekt de fout-reeks', () => {
    let l = nieuweLadder(3);
    l = ladderFout(l); l = ladderGoed(l); l = ladderFout(l);
    expect(l.niveau).toBe(3);
  });
});

describe('beloning', () => {
  it('sterren: foutloos 3, weinig 2, veel 1', () => {
    expect(sterrenVoorRonde(0)).toBe(3);
    expect(sterrenVoorRonde(2)).toBe(2);
    expect(sterrenVoorRonde(5)).toBe(1);
    expect(LEVERINGEN_PER_RONDE).toBeGreaterThan(0);
  });
});
