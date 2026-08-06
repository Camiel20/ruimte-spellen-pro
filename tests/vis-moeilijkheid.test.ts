// Tests voor de Hapvis-moeilijkheidscurve (src/vis/logic/moeilijkheid.ts):
// dreigingsniveau, snelheids-scaling en de spawngewicht-verschuiving.
import { describe, it, expect } from 'vitest';
import {
  BOOST_FACTOR,
  DREIGING_MAX,
  FASES,
  PROOI_VLOER_PCT,
  SOORTEN,
  ZONES,
} from '../src/vis/GameConfig';
import {
  dreigingsNiveau,
  jaagFactor,
  schaaltMee,
  spawnGewichten,
  verdeelVerschuiving,
} from '../src/vis/logic/moeilijkheid';

describe('dreigingsniveau', () => {
  it('stijgt met 1 per 30 s en stopt op 10', () => {
    expect(dreigingsNiveau(0)).toBe(0);
    expect(dreigingsNiveau(29.9)).toBe(0);
    expect(dreigingsNiveau(30)).toBe(1);
    expect(dreigingsNiveau(300)).toBe(10);
    expect(dreigingsNiveau(99999)).toBe(DREIGING_MAX);
  });
});

describe('snelheids-scaling', () => {
  it('alleen roofvissen schalen mee; apex-burst en vlucht niet', () => {
    expect(schaaltMee('roofvis')).toBe(true);
    expect(schaaltMee('apex')).toBe(false);
    expect(schaaltMee('prooivis')).toBe(false);
    expect(schaaltMee('schoolvis')).toBe(false);
  });

  it('+2% per stap, max +20%', () => {
    expect(jaagFactor(0)).toBe(1);
    expect(jaagFactor(2)).toBeCloseTo(1.04, 10);
    expect(jaagFactor(7)).toBeCloseTo(1.14, 10);
    expect(jaagFactor(10)).toBeCloseTo(1.2, 10);
    expect(jaagFactor(50)).toBeCloseTo(1.2, 10); // cap
  });

  it('de crossovers uit het ontwerp kloppen', () => {
    // Grombaars passeert fase-2-zwemmen (165) vanaf stap 2 en fase 1 (170) vanaf stap 4.
    expect(SOORTEN.grombaars.topSnelheid * jaagFactor(1)).toBeLessThan(165);
    expect(SOORTEN.grombaars.topSnelheid * jaagFactor(2)).toBeGreaterThan(165);
    expect(SOORTEN.grombaars.topSnelheid * jaagFactor(4)).toBeGreaterThan(170);
    // Snapper passeert fase-1-zwemmen (170) vanaf stap 7.
    expect(SOORTEN.snapper.topSnelheid * jaagFactor(6)).toBeLessThan(170);
    expect(SOORTEN.snapper.topSnelheid * jaagFactor(7)).toBeGreaterThan(170);
    // Boost-ontsnapping blijft overal mogelijk: max-waarden onder de laagste boost.
    expect(SOORTEN.snapper.topSnelheid * jaagFactor(10)).toBeCloseTo(180, 10);
    expect(SOORTEN.grombaars.topSnelheid * jaagFactor(10)).toBeCloseTo(192, 10);
    expect(SOORTEN.diepteschrik.topSnelheid).toBe(260); // schaalt niet mee
  });

  it('de boost-garantie volgt uit de config, niet uit losse getallen', () => {
    // Elke fase kan met boost aan de (niet-schalende) apex-burst ontkomen…
    const laagsteBoost = Math.min(...FASES.map((f) => f.maxSnelheid)) * BOOST_FACTOR;
    expect(laagsteBoost).toBeGreaterThan(SOORTEN.diepteschrik.topSnelheid);
    // …en aan de roofvissen op maximale dreiging in de fasen waar ze jagen.
    expect(SOORTEN.snapper.topSnelheid * jaagFactor(DREIGING_MAX)).toBeLessThan(
      FASES[0].maxSnelheid * BOOST_FACTOR,
    );
    expect(SOORTEN.grombaars.topSnelheid * jaagFactor(DREIGING_MAX)).toBeLessThan(
      FASES[1].maxSnelheid * BOOST_FACTOR,
    );
  });
});

describe('spawngewichten', () => {
  it('niveau 0 = de basisgewichten', () => {
    expect(spawnGewichten(1, 0)).toEqual({ vlokje: 55, stipje: 35, snapper: 10 });
  });

  it('zone 1 op niveau 10: Snapper 30, Vlokje 35', () => {
    expect(spawnGewichten(1, 10)).toEqual({ vlokje: 35, stipje: 35, snapper: 30 });
  });

  it('zone 2 op niveau 3: +6 pp naar Snapper, Flapper −6', () => {
    expect(spawnGewichten(2, 3)).toEqual({ stipje: 30, flapper: 29, snapper: 31, kwal: 10 });
  });

  it('zone 3 verdeelt naar rato over Snapper en Grombaars (+1/+1 per stap)', () => {
    expect(spawnGewichten(3, 10)).toEqual({ flapper: 10, snapper: 40, grombaars: 40, kwal: 10 });
  });

  it('verdeelt naar rato, ook bij ongelijke roofvisgewichten', () => {
    // Kunstmatige zone: bewaakt de naar-rato-formule los van de echte zonedata
    // (daar zijn de roofvisgewichten toevallig gelijk of enkelvoudig).
    const nieuw = verdeelVerschuiving(
      { snapper: 40, grombaars: 20, flapper: 30, kwal: 10 },
      ['snapper', 'grombaars'],
      6,
    );
    expect(nieuw).toEqual({ snapper: 44, grombaars: 22, flapper: 30, kwal: 10 });
  });

  it('zone 4 stopt op +10 pp (Flapper-vloer van 10%)', () => {
    expect(spawnGewichten(4, 5)).toEqual({ flapper: 10, grombaars: 70, kwal: 20 });
    expect(spawnGewichten(4, 10)).toEqual({ flapper: 10, grombaars: 70, kwal: 20 }); // niet verder
  });

  it('alle zones × alle niveaus: som 100, niets negatief, snoep ≥ vloer', () => {
    for (const zone of ZONES) {
      for (let niveau = 0; niveau <= DREIGING_MAX; niveau++) {
        const g = spawnGewichten(zone.nr, niveau);
        const waarden = Object.values(g) as number[];
        expect(waarden.reduce((a, b) => a + b, 0)).toBeCloseTo(100, 10);
        for (const w of waarden) expect(w).toBeGreaterThanOrEqual(0);
        expect(g[zone.snoepSoort] ?? 0).toBeGreaterThanOrEqual(PROOI_VLOER_PCT);
      }
    }
  });

  it('onbekende zone gooit', () => {
    expect(() => spawnGewichten(9, 0)).toThrow();
  });
});
