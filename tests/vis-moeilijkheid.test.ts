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
import { kanEten } from '../src/vis/logic/regels';

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

  it('boost blijft ontsnappen mogelijk maken voor élke roofvis, ook op maximale dreiging', () => {
    for (const [id, soort] of Object.entries(SOORTEN)) {
      if (soort.gedrag !== 'roofvis' && soort.gedrag !== 'apex') continue;
      // De apex-burst schaalt niet mee; roofvissen wel.
      const maxJaag = soort.gedrag === 'apex' ? soort.topSnelheid : soort.topSnelheid * jaagFactor(DREIGING_MAX);
      for (const fase of FASES) {
        if (!kanEten(soort.radius, fase.radius)) continue;
        expect(
          maxJaag,
          `fase ${fase.fase} kan niet met boost ontsnappen aan ${id}`,
        ).toBeLessThan(fase.maxSnelheid * BOOST_FACTOR);
      }
    }
  });
});

describe('spawngewichten', () => {
  it('niveau 0 = de basisgewichten uit de config', () => {
    for (const zone of ZONES) {
      expect(spawnGewichten(zone.nr, 0)).toEqual(zone.gewichten);
    }
  });

  it('zone 1 op niveau 10: de volle 20 pp gaat naar de enige roofvis', () => {
    expect(spawnGewichten(1, 10)).toEqual({
      vlokje: 27, pruillip: 23, snapper: 36, pijltje: 8, stipje: 6,
    });
  });

  it('zone 2 op niveau 3: 6 pp naar rato over Snapper en Pijlbek', () => {
    const g = spawnGewichten(2, 3);
    expect(g.flapper).toBeCloseTo(28, 6); // 34 − 6
    expect(g.snapper).toBeCloseTo(17 + (6 * 17) / 29, 6);
    expect(g.pijlbek).toBeCloseTo(12 + (6 * 12) / 29, 6);
  });

  it('zone 3 verdeelt naar rato over drie roofvissen en stopt op de prooivloer', () => {
    const g = spawnGewichten(3, 10);
    expect(g.flapper).toBeCloseTo(10, 6); // 28 − 18 = vloer
    expect(g.snapper).toBeCloseTo(12 + (18 * 12) / 32, 6);
    expect(g.grombaars).toBeCloseTo(10 + (18 * 10) / 32, 6);
    expect(g.prikbek).toBeCloseTo(10 + (18 * 10) / 32, 6);
  });

  it('zone 4 stopt op de prooivloer en schuift daarna niet verder', () => {
    const g10 = spawnGewichten(4, 10);
    expect(g10.flapper).toBeCloseTo(10, 6); // 24 − 14
    expect(spawnGewichten(4, 50)).toEqual(g10);
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
