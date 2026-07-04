// Tests voor de Reken-Raket-spellogica (src/rekenLogic.js):
// de groep 3-leerlijn, de adaptieve ladder, afleiders en de beloningen.
import { describe, it, expect } from 'vitest';
import {
  NIVEAU_MIN, NIVEAU_MAX, maakSom, maakNulSom, maakAfleiders,
  nieuweLadder, ladderGoed, ladderFout, metersVoorGoed,
  BESTEMMINGEN, nieuweBestemmingen, volgendeBestemming,
  sterrenVoorVlucht, SOMMEN_PER_VLUCHT, NULPLANEET_NODIG,
} from '../src/rekenLogic.js';

// Hulpje: genereer veel sommen voor een niveau en check ze allemaal.
function proef(niveau, n = 300) {
  const sommen = [];
  for (let i = 0; i < n; i++) sommen.push(maakSom(niveau));
  return sommen;
}

describe('maakSom per niveau (de leerlijn)', () => {
  it('N1: alleen +0/+1/-0/-1, antwoorden 0..5', () => {
    for (const s of proef(1)) {
      expect(s.b).toBeLessThanOrEqual(1);
      expect(s.antwoord).toBeGreaterThanOrEqual(0);
      expect(s.antwoord).toBeLessThanOrEqual(5);
    }
  });

  it('N2: optellen, antwoord nooit boven 10', () => {
    for (const s of proef(2)) {
      expect(s.op).toBe('+');
      expect(s.antwoord).toBeLessThanOrEqual(10);
      expect(s.antwoord).toBeGreaterThanOrEqual(2);
    }
  });

  it('N3: aftrekken, nooit negatief, a hooguit 10', () => {
    for (const s of proef(3)) {
      expect(s.op).toBe('-');
      expect(s.a).toBeLessThanOrEqual(10);
      expect(s.antwoord).toBeGreaterThanOrEqual(1);
    }
  });

  it('N4: altijd dubbelen (a+a)', () => {
    for (const s of proef(4)) {
      expect(s.op).toBe('+');
      expect(s.b).toBe(s.a);
    }
  });

  it('N5: t/m 20 ZONDER tientalsprong', () => {
    for (const s of proef(5)) {
      expect(s.antwoord).toBeLessThanOrEqual(20);
      if (s.op === '+') expect((s.a % 10) + s.b).toBeLessThanOrEqual(9);
      else expect(s.a % 10).toBeGreaterThanOrEqual(s.b % 10); // geen lenen
    }
  });

  it('N6: t/m 20 MET tientalsprong', () => {
    for (const s of proef(6)) {
      expect(s.antwoord).toBeLessThanOrEqual(20);
      expect(s.antwoord).toBeGreaterThanOrEqual(0);
      if (s.op === '+') expect((s.a % 10) + s.b).toBeGreaterThanOrEqual(10);
      else expect(s.a % 10).toBeLessThan(s.b); // lenen nodig
    }
  });

  it('N7 (nul-magie): ronde getallen, schaal 10..1000', () => {
    for (const s of proef(7)) {
      expect(s.a % 10).toBe(0);
      expect(s.b % 10).toBe(0);
      expect(s.a).toBeGreaterThanOrEqual(10);
      expect(s.a).toBeLessThanOrEqual(10000);
      expect(s.antwoord).toBeGreaterThanOrEqual(0);
    }
  });

  it('alle sommen rekenen kloppend', () => {
    for (let niveau = NIVEAU_MIN; niveau <= NIVEAU_MAX; niveau++) {
      for (const s of proef(niveau, 100)) {
        expect(s.antwoord).toBe(s.op === '+' ? s.a + s.b : s.a - s.b);
      }
    }
  });
});

describe('maakNulSom (gouden nullen)', () => {
  it('is altijd een echte nul-som: +0, -0 of a-a=0', () => {
    for (let i = 0; i < 200; i++) {
      const s = maakNulSom(3);
      expect(s.isNulSom).toBe(true);
      const isPlusNul = s.b === 0;
      const isZelfNul = s.op === '-' && s.a === s.b;
      expect(isPlusNul || isZelfNul).toBe(true);
    }
  });

  it('groeit mee met nul-magie-niveau (grote ronde getallen)', () => {
    let grootGezien = false;
    for (let i = 0; i < 100; i++) {
      const s = maakNulSom(7);
      if (s.a >= 100) grootGezien = true;
    }
    expect(grootGezien).toBe(true);
  });
});

describe('maakAfleiders', () => {
  it('geeft precies 2 unieke, niet-negatieve afleiders != antwoord', () => {
    for (const antwoord of [0, 1, 5, 12, 20, 200, 5000]) {
      for (let i = 0; i < 50; i++) {
        const [w1, w2] = maakAfleiders(antwoord);
        expect(w1).not.toBe(antwoord);
        expect(w2).not.toBe(antwoord);
        expect(w1).not.toBe(w2);
        expect(w1).toBeGreaterThanOrEqual(0);
        expect(w2).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('verleidt bij nul-magie met een nul te veel/te weinig', () => {
    const gezien = new Set();
    for (let i = 0; i < 100; i++) maakAfleiders(200).forEach((w) => gezien.add(w));
    expect(gezien.has(2000) || gezien.has(20)).toBe(true);
  });
});

describe('adaptieve ladder', () => {
  it('3 goed op rij -> niveau omhoog', () => {
    let l = nieuweLadder(2);
    l = ladderGoed(l); l = ladderGoed(l);
    expect(l.niveau).toBe(2);
    l = ladderGoed(l);
    expect(l.niveau).toBe(3);
    expect(l.reeksGoed).toBe(0);
  });

  it('2 fout na elkaar -> niveau zachtjes terug', () => {
    let l = nieuweLadder(4);
    l = ladderFout(l);
    expect(l.niveau).toBe(4);
    l = ladderFout(l);
    expect(l.niveau).toBe(3);
  });

  it('een goed antwoord verbreekt de fout-reeks', () => {
    let l = nieuweLadder(4);
    l = ladderFout(l); l = ladderGoed(l); l = ladderFout(l);
    expect(l.niveau).toBe(4);
  });

  it('blijft binnen de grenzen (1..7)', () => {
    let onder = nieuweLadder(1);
    onder = ladderFout(ladderFout(onder));
    expect(onder.niveau).toBe(NIVEAU_MIN);
    let boven = nieuweLadder(7);
    for (let i = 0; i < 9; i++) boven = ladderGoed(boven);
    expect(boven.niveau).toBe(NIVEAU_MAX);
  });
});

describe('hoogte & beloningen', () => {
  it('meters groeien met het niveau; turbo verdubbelt', () => {
    expect(metersVoorGoed(1)).toBe(40);
    expect(metersVoorGoed(7)).toBe(100);
    expect(metersVoorGoed(3, true)).toBe(metersVoorGoed(3) * 2);
  });

  it('bestemmingen: oplopend, met de juiste oude medailles eraan', () => {
    const hoogtes = BESTEMMINGEN.map((b) => b.hoogte);
    expect([...hoogtes].sort((a, b) => a - b)).toEqual(hoogtes);
    const medals = BESTEMMINGEN.filter((b) => b.medal).map((b) => b.medal);
    expect(medals).toEqual(['math_easy', 'math_medium', 'math_hard']);
  });

  it('nieuweBestemmingen ziet alleen wat deze vlucht gepasseerd is', () => {
    const nieuw = nieuweBestemmingen(1200, 3200);
    expect(nieuw.map((b) => b.naam)).toEqual(['de Maan', 'Mars']);
    expect(nieuweBestemmingen(400, 400)).toEqual([]);
  });

  it('volgendeBestemming wijst altijd omhoog', () => {
    expect(volgendeBestemming(0).naam).toBe('de Grote Wolk');
    expect(volgendeBestemming(5000).naam).toBe('Saturnus');
    expect(volgendeBestemming(99999)).toBe(null);
  });

  it('sterren: foutloos 3, beetje 2, veel 1', () => {
    expect(sterrenVoorVlucht(0)).toBe(3);
    expect(sterrenVoorVlucht(2)).toBe(2);
    expect(sterrenVoorVlucht(5)).toBe(1);
    expect(SOMMEN_PER_VLUCHT).toBe(10);
    expect(NULPLANEET_NODIG).toBe(5);
  });
});
