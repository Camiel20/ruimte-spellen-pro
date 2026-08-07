// Tests voor de Hapvis-gebeurtenissen (src/vis/logic/gebeurtenis.ts, §10.3 van
// docs/DESIGN.md): keuze, timing, spawnfilter en gewichtsverschuiving — met een
// geseede rng, dus reproduceerbaar.
import { describe, it, expect } from 'vitest';
import {
  GEBEURTENIS_EERSTE,
  GEBEURTENIS_PAUZE_MAX,
  GEBEURTENIS_PAUZE_MIN,
  JACHT_PP,
  PARADE_TEMPO,
  PROOI_VLOER_PCT,
  SOORTEN,
  ZONES,
  type SoortId,
} from '../src/vis/GameConfig';
import {
  GEBEURTENISSEN,
  gebeurtenisConfig,
  gewichtenTijdens,
  kiesGebeurtenis,
  kiesSoortTijdens,
  magSpawnen,
  spawnTempoFactor,
  wachttijd,
  wateraanpassing,
  type GebeurtenisId,
} from '../src/vis/logic/gebeurtenis';
import type { Rng } from '../src/vis/logic/spawn';

function maakRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const IDS: GebeurtenisId[] = ['parade', 'stilte', 'jachttijd'];

describe('keuze', () => {
  it('kiest nooit dezelfde als de vorige', () => {
    const rng = maakRng(3);
    for (const vorige of IDS) {
      for (let i = 0; i < 300; i++) {
        expect(kiesGebeurtenis(rng, vorige)).not.toBe(vorige);
      }
    }
  });

  it('kan zonder vorige alle drie opleveren', () => {
    const rng = maakRng(21);
    const gezien = new Set<GebeurtenisId>();
    for (let i = 0; i < 600; i++) gezien.add(kiesGebeurtenis(rng, null));
    expect(gezien.size).toBe(GEBEURTENISSEN.length);
  });

  it('geeft altijd een geldige id terug, ook bij rng exact 0 en bijna 1', () => {
    for (const rng of [() => 0, () => 0.999999] as Rng[]) {
      for (const vorige of [...IDS, null]) {
        expect(IDS).toContain(kiesGebeurtenis(rng, vorige));
      }
    }
  });

  it('elke gebeurtenis heeft een duur en een naam', () => {
    for (const id of IDS) {
      const cfg = gebeurtenisConfig(id);
      expect(cfg.duur).toBeGreaterThan(0);
      expect(cfg.naam.length).toBeGreaterThan(0);
      expect(cfg.gewicht).toBeGreaterThan(0);
    }
    expect(() => gebeurtenisConfig('bestaatniet' as GebeurtenisId)).toThrow();
  });
});

describe('timing', () => {
  it('de eerste komt op een vast moment, de rest in de bandbreedte', () => {
    const rng = maakRng(8);
    expect(wachttijd(rng, true)).toBe(GEBEURTENIS_EERSTE);
    for (let i = 0; i < 500; i++) {
      const t = wachttijd(rng, false);
      expect(t).toBeGreaterThanOrEqual(GEBEURTENIS_PAUZE_MIN);
      expect(t).toBeLessThanOrEqual(GEBEURTENIS_PAUZE_MAX);
    }
  });

  it('een gebeurtenis duurt korter dan de kortste pauze erna', () => {
    // Anders lopen twee gebeurtenissen in elkaar over.
    for (const id of IDS) {
      expect(gebeurtenisConfig(id).duur).toBeLessThan(GEBEURTENIS_PAUZE_MIN);
    }
  });
});

describe('spawnfilter', () => {
  it('stilte laat geen jagers spawnen, parade alleen eetbare vis', () => {
    expect(magSpawnen('roofvis', 'stilte')).toBe(false);
    expect(magSpawnen('apex', 'stilte')).toBe(false);
    expect(magSpawnen('prooivis', 'stilte')).toBe(true);
    expect(magSpawnen('gevaar', 'stilte')).toBe(true); // de kwal drijft gewoon door

    expect(magSpawnen('prooivis', 'parade')).toBe(true);
    expect(magSpawnen('schoolvis', 'parade')).toBe(true);
    expect(magSpawnen('roofvis', 'parade')).toBe(false);
    expect(magSpawnen('apex', 'parade')).toBe(false);
    expect(magSpawnen('gevaar', 'parade')).toBe(false);
  });

  it('zonder gebeurtenis mag alles', () => {
    for (const g of ['prooivis', 'schoolvis', 'roofvis', 'apex', 'gevaar'] as const) {
      expect(magSpawnen(g, null)).toBe(true);
    }
  });

  it('alleen de parade versnelt het spawntempo', () => {
    expect(spawnTempoFactor('parade')).toBe(PARADE_TEMPO);
    expect(spawnTempoFactor('stilte')).toBe(1);
    expect(spawnTempoFactor('jachttijd')).toBe(1);
    expect(spawnTempoFactor(null)).toBe(1);
  });

  it('het water klaart op bij stilte en verduistert bij jachttijd', () => {
    expect(wateraanpassing('stilte')).toBeGreaterThan(0);
    expect(wateraanpassing('jachttijd')).toBeLessThan(0);
    expect(wateraanpassing('parade')).toBe(0);
    expect(wateraanpassing(null)).toBe(0);
  });
});

describe('gewichten tijdens een gebeurtenis', () => {
  it('elke zone houdt bij elke gebeurtenis een niet-lege tabel over', () => {
    for (const zone of ZONES) {
      for (const niveau of [0, 5, 10]) {
        for (const id of [...IDS, null]) {
          const g = gewichtenTijdens(zone.nr, niveau, id);
          const som = Object.values(g).reduce((a, b) => a + (b ?? 0), 0);
          expect(som, `zone ${zone.nr} / ${id}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('bij parade en stilte blijft er in elke zone iets te ETEN over', () => {
    // Zonder prooi wordt een gebeurtenis een straf in plaats van een adempauze.
    for (const zone of ZONES) {
      for (const id of ['parade', 'stilte'] as GebeurtenisId[]) {
        const ids = Object.keys(gewichtenTijdens(zone.nr, 10, id)) as SoortId[];
        const eetbaar = ids.filter(
          (s) => SOORTEN[s].gedrag === 'prooivis' || SOORTEN[s].gedrag === 'schoolvis',
        );
        expect(eetbaar.length, `zone ${zone.nr} / ${id}`).toBeGreaterThan(0);
      }
    }
  });

  it('parade levert bij elke trekking uitsluitend eetbare vis op', () => {
    const rng = maakRng(4321);
    for (const zone of ZONES) {
      for (let i = 0; i < 400; i++) {
        const soort = kiesSoortTijdens(zone.nr, 10, 'parade', rng);
        expect(magSpawnen(SOORTEN[soort].gedrag, 'parade')).toBe(true);
      }
    }
  });

  it('stilte levert nooit een roofvis of apex op', () => {
    const rng = maakRng(999);
    for (const zone of ZONES) {
      for (let i = 0; i < 400; i++) {
        const soort = kiesSoortTijdens(zone.nr, 10, 'stilte', rng);
        expect(SOORTEN[soort].gedrag).not.toBe('roofvis');
        expect(SOORTEN[soort].gedrag).not.toBe('apex');
      }
    }
  });

  it('jachttijd verschuift naar de roofvissen zonder de prooivloer te breken', () => {
    for (const zone of ZONES) {
      for (const niveau of [0, 5, 10]) {
        const basis = gewichtenTijdens(zone.nr, niveau, null);
        const jacht = gewichtenTijdens(zone.nr, niveau, 'jachttijd');
        const roofIds = (Object.keys(basis) as SoortId[]).filter(
          (id) => SOORTEN[id].gedrag === 'roofvis',
        );
        const roofBasis = roofIds.reduce((s, id) => s + (basis[id] ?? 0), 0);
        const roofJacht = roofIds.reduce((s, id) => s + (jacht[id] ?? 0), 0);
        expect(roofJacht, `zone ${zone.nr} niveau ${niveau}`).toBeGreaterThanOrEqual(roofBasis);
        expect(roofJacht - roofBasis).toBeLessThanOrEqual(JACHT_PP + 1e-9);
        expect(jacht[zone.snoepSoort] ?? 0).toBeGreaterThanOrEqual(PROOI_VLOER_PCT - 1e-9);
      }
    }
  });

  it('de som blijft 100: er wordt verschoven, niet bijgemaakt', () => {
    for (const zone of ZONES) {
      for (const niveau of [0, 5, 10]) {
        const som = Object.values(gewichtenTijdens(zone.nr, niveau, 'jachttijd')).reduce(
          (a, b) => a + (b ?? 0),
          0,
        );
        expect(som).toBeCloseTo(100, 6);
      }
    }
  });

  it('zonder gebeurtenis is de tabel gelijk aan de gewone dreigingstabel', () => {
    const rng = maakRng(55);
    for (const zone of ZONES) {
      for (let i = 0; i < 200; i++) {
        const soort = kiesSoortTijdens(zone.nr, 3, null, rng);
        expect(SOORTEN[soort].zones).toContain(zone.nr);
      }
    }
  });
});
