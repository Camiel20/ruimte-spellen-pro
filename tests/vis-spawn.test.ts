// Tests voor de Hapvis-spawnlogica (src/vis/logic/spawn.ts): spawnafstand,
// zone-indeling, soortkeuze en school-spawns — allemaal met een geseede rng.
import { describe, it, expect } from 'vitest';
import {
  AANTAL_ZONES,
  DESPAWN_AFSTAND,
  SCHOOL_SPAWN_N,
  SCHOOL_SPAWN_STRAAL,
  SOORTEN,
  START_POS,
  WERELD_B,
  WERELD_H,
  ZONE_HOOGTE,
  ZONES,
  type SoortId,
} from '../src/vis/GameConfig';
import {
  isGeldigSpawnPunt,
  kiesSoort,
  kiesSpawnPunt,
  minSpawnAfstand,
  schoolPosities,
  zoneVoorY,
  type Punt,
  type Rng,
} from '../src/vis/logic/spawn';

// Deterministische rng (mulberry32) zodat de tests reproduceerbaar zijn.
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

function afstand(a: Punt, b: Punt): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

describe('spawnafstand', () => {
  it('minimale spawnafstand = halve schermdiagonaal + marge (≈ 666,5 px)', () => {
    expect(minSpawnAfstand()).toBeCloseTo(Math.sqrt(480 * 480 + 800 * 800) / 2 + 200, 5);
    expect(minSpawnAfstand()).toBeGreaterThan(666);
    expect(minSpawnAfstand()).toBeLessThan(667);
  });

  it('gekozen punten liggen altijd in de ring én binnen de wereld', () => {
    const rng = maakRng(42);
    const centrum = { x: WERELD_B / 2, y: WERELD_H / 2 };
    for (let i = 0; i < 500; i++) {
      const p = kiesSpawnPunt(centrum, rng);
      expect(p).not.toBeNull();
      if (!p) continue;
      const d = afstand(p, centrum);
      expect(d).toBeGreaterThanOrEqual(minSpawnAfstand());
      expect(d).toBeLessThanOrEqual(DESPAWN_AFSTAND);
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(WERELD_B);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(WERELD_H);
    }
  });

  it('vindt ook bij de startpositie (dicht bij de bovenrand) geldige punten', () => {
    const rng = maakRng(7);
    for (let i = 0; i < 100; i++) {
      const p = kiesSpawnPunt(START_POS, rng);
      expect(p).not.toBeNull();
      if (p) expect(isGeldigSpawnPunt(p, START_POS)).toBe(true);
    }
  });

  it('ook in een hoek van de wereld (geclampte camera) lukt het nog', () => {
    const rng = maakRng(1234);
    const hoek = { x: 240, y: 400 }; // camera geclampt linksboven (halve schermmaat)
    for (let i = 0; i < 100; i++) {
      const p = kiesSpawnPunt(hoek, rng);
      expect(p).not.toBeNull();
      if (p) expect(isGeldigSpawnPunt(p, hoek)).toBe(true);
    }
  });
});

describe('zone-indeling', () => {
  it('deelt de diepte in vier banden van 1200 px', () => {
    expect(zoneVoorY(0)).toBe(1);
    expect(zoneVoorY(1199)).toBe(1);
    expect(zoneVoorY(1200)).toBe(2);
    expect(zoneVoorY(2400)).toBe(3);
    expect(zoneVoorY(3599)).toBe(3);
    expect(zoneVoorY(3600)).toBe(4);
    expect(zoneVoorY(4799)).toBe(4);
    expect(zoneVoorY(4800)).toBe(4); // clamp op de onderrand
    expect(zoneVoorY(-5)).toBe(1); // clamp op de bovenrand
  });
});

describe('soortkeuze', () => {
  it('kiest deterministisch met rng 0: de eerste soort met gewicht', () => {
    const eerste: Rng = () => 0;
    expect(kiesSoort(1, 0, eerste)).toBe('vlokje');
  });

  it('volgt de zone-gewichten bij benadering (zone 1, niveau 0)', () => {
    const rng = maakRng(99);
    const tellingen: Record<string, number> = {};
    const n = 4000;
    for (let i = 0; i < n; i++) {
      const soort = kiesSoort(1, 0, rng);
      tellingen[soort] = (tellingen[soort] ?? 0) + 1;
    }
    expect((tellingen.vlokje ?? 0) / n).toBeGreaterThan(0.42); // basis 47%
    expect((tellingen.vlokje ?? 0) / n).toBeLessThan(0.52);
    expect((tellingen.snapper ?? 0) / n).toBeGreaterThan(0.12); // basis 16%
    expect((tellingen.snapper ?? 0) / n).toBeLessThan(0.2);
  });

  it('het dreigingsniveau werkt door in de soortkeuze', () => {
    // Met rng 0,4 valt de keuze in zone 1 op niveau 0 nog in de Vlokje-band
    // (47%), maar op niveau 10 (Vlokje nog 27%) in de band daarna.
    const vast: Rng = () => 0.4;
    expect(kiesSoort(1, 0, vast)).toBe('vlokje');
    expect(kiesSoort(1, 10, vast)).toBe('pruillip');
  });

  it('zone 1 op niveau 10: het Snapper-aandeel is naar ±36% geschoven', () => {
    const rng = maakRng(77);
    const n = 4000;
    let snapper = 0;
    for (let i = 0; i < n; i++) if (kiesSoort(1, 10, rng) === 'snapper') snapper++;
    expect(snapper / n).toBeGreaterThan(0.31);
    expect(snapper / n).toBeLessThan(0.41);
  });

  it('elke zone levert alleen soorten die daar volgens de config horen', () => {
    const rng = maakRng(5);
    for (const zone of ZONES) {
      const toegestaan = Object.keys(zone.gewichten);
      for (let i = 0; i < 400; i++) {
        for (const niveau of [0, 10]) {
          expect(toegestaan).toContain(kiesSoort(zone.nr, niveau, rng));
        }
      }
    }
  });
});

describe('zone-config-consistentie', () => {
  it('de zonebanden sluiten precies aan op ZONE_HOOGTE en de wereld', () => {
    expect(ZONES).toHaveLength(AANTAL_ZONES);
    for (const zone of ZONES) {
      expect(zone.vanY).toBe((zone.nr - 1) * ZONE_HOOGTE);
      expect(zone.totY).toBe(zone.nr * ZONE_HOOGTE);
    }
    expect(ZONES[ZONES.length - 1].totY).toBe(WERELD_H);
  });

  it('SOORTEN[].zones en ZONES[].gewichten spreken elkaar niet tegen', () => {
    for (const zone of ZONES) {
      for (const id of Object.keys(zone.gewichten) as SoortId[]) {
        expect(SOORTEN[id].zones).toContain(zone.nr);
      }
    }
    for (const id of Object.keys(SOORTEN) as SoortId[]) {
      if (id === 'diepteschrik') continue; // spawnt via de aparte apex-regel
      for (const nr of SOORTEN[id].zones) {
        const zone = ZONES.find((z) => z.nr === nr);
        expect(zone?.gewichten[id] ?? 0).toBeGreaterThan(0);
      }
    }
  });
});

describe('school-spawn', () => {
  it('levert 5 posities binnen de spawnstraal rond het centrum', () => {
    const rng = maakRng(11);
    const centrum = { x: 1000, y: 2000 };
    const posities = schoolPosities(centrum, rng);
    expect(posities).toHaveLength(SCHOOL_SPAWN_N);
    for (const p of posities) {
      expect(afstand(p, centrum)).toBeLessThanOrEqual(SCHOOL_SPAWN_STRAAL);
    }
  });
});
