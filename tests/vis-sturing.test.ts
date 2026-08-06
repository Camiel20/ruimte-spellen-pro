// Tests voor de Hapvis-steering-helpers (src/vis/logic/sturing.ts):
// vluchten, draaien, zichtkegel, jaaggrenzen en boids-schoolgedrag.
import { describe, it, expect } from 'vitest';
import {
  APEX_ZICHT,
  APEX_ZICHTHOEK,
  ROOF_ZICHT,
  ROOF_ZICHTHOEK,
} from '../src/vis/GameConfig';
import {
  draaiNaar,
  hoekVerschil,
  inZicht,
  lengte,
  magBlijvenJagen,
  normaliseer,
  schoolKracht,
  vluchtVector,
} from '../src/vis/logic/sturing';

describe('vectoren en hoeken', () => {
  it('vluchtvector wijst recht van de bedreiging af', () => {
    const v = vluchtVector({ x: 0, y: 0 }, { x: 10, y: 0 });
    expect(v.x).toBeCloseTo(-1, 10);
    expect(v.y).toBeCloseTo(0, 10);
  });

  it('normaliseer laat de nulvector heel', () => {
    expect(normaliseer({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
    expect(lengte(normaliseer({ x: 3, y: 4 }))).toBeCloseTo(1, 10);
  });

  it('hoekverschil wikkelt naar de kortste kant', () => {
    expect(hoekVerschil(Math.PI / 2, 0)).toBeCloseTo(Math.PI / 2, 10);
    // Van 3,0 naar −3,0 rad is via de "achterkant" maar ≈ 0,283 rad.
    expect(hoekVerschil(-3.0, 3.0)).toBeCloseTo(2 * Math.PI - 6, 10);
  });

  it('draaiNaar begrenst op maxdraai × dt en kiest de kortste kant', () => {
    expect(draaiNaar(0, Math.PI, 3.5, 0.1)).toBeCloseTo(0.35, 10);
    expect(draaiNaar(0, 0.1, 3.5, 1)).toBeCloseTo(0.1, 10); // doel al binnen bereik
    expect(draaiNaar(3.0, -3.0, 3.5, 0.05)).toBeCloseTo(3.175, 10); // draait dóór, niet terug
  });
});

describe('zicht', () => {
  it('roofvis ziet alleen binnen radius én 120°-kegel', () => {
    const eigen = { x: 0, y: 0 };
    const kijkt = 0; // naar rechts (+x)
    expect(inZicht(eigen, kijkt, { x: 200, y: 0 }, ROOF_ZICHT, ROOF_ZICHTHOEK)).toBe(true);
    expect(inZicht(eigen, kijkt, { x: 250, y: 0 }, ROOF_ZICHT, ROOF_ZICHTHOEK)).toBe(false); // te ver
    expect(inZicht(eigen, kijkt, { x: 0, y: 200 }, ROOF_ZICHT, ROOF_ZICHTHOEK)).toBe(false); // 90° > 60°
    // Net binnen de kegelrand (59,9°) telt mee, net erbuiten (60,1°) niet.
    const netBinnen = { x: 100 * Math.cos(1.045), y: 100 * Math.sin(1.045) };
    const netBuiten = { x: 100 * Math.cos(1.049), y: 100 * Math.sin(1.049) };
    expect(inZicht(eigen, kijkt, netBinnen, ROOF_ZICHT, ROOF_ZICHTHOEK)).toBe(true);
    expect(inZicht(eigen, kijkt, netBuiten, ROOF_ZICHT, ROOF_ZICHTHOEK)).toBe(false);
  });

  it('de zichtkegel werkt ook over de ±π-grens (vis kijkt naar links)', () => {
    const eigen = { x: 0, y: 0 };
    // Doel vlak vóór de vis, net over de wrap-grens: moet gezien worden.
    expect(inZicht(eigen, Math.PI, { x: -100, y: -5 }, ROOF_ZICHT, ROOF_ZICHTHOEK)).toBe(true);
    // Doel recht achter de vis: niet.
    expect(inZicht(eigen, Math.PI, { x: 100, y: 0 }, ROOF_ZICHT, ROOF_ZICHTHOEK)).toBe(false);
  });

  it('de apex kijkt rondom (360°)', () => {
    const eigen = { x: 0, y: 0 };
    expect(inZicht(eigen, 0, { x: -200, y: 0 }, APEX_ZICHT, APEX_ZICHTHOEK)).toBe(true);
    expect(inZicht(eigen, 0, { x: -300, y: 0 }, APEX_ZICHT, APEX_ZICHTHOEK)).toBe(false);
  });
});

describe('jaaggrenzen', () => {
  it('breekt af boven 4 s of 400 px (grenzen zelf tellen nog mee)', () => {
    expect(magBlijvenJagen(3, 300)).toBe(true);
    expect(magBlijvenJagen(4, 400)).toBe(true);
    expect(magBlijvenJagen(4.1, 100)).toBe(false);
    expect(magBlijvenJagen(3, 401)).toBe(false);
  });
});

describe('schoolgedrag (boids)', () => {
  it('zonder buren binnen de schoolradius: geen kracht', () => {
    expect(schoolKracht({ x: 0, y: 0 }, [])).toEqual({ x: 0, y: 0 });
    const verWeg = [{ pos: { x: 500, y: 0 }, vel: { x: 0, y: 0 } }];
    expect(schoolKracht({ x: 0, y: 0 }, verWeg)).toEqual({ x: 0, y: 0 });
  });

  it('separatie wint van cohesie als een buur te dichtbij is', () => {
    const buren = [{ pos: { x: 10, y: 0 }, vel: { x: 0, y: 0 } }];
    const kracht = schoolKracht({ x: 0, y: 0 }, buren);
    expect(kracht.x).toBeLessThan(0); // duwt weg: −1 (separatie) + 0,4 (cohesie) = −0,6
    expect(kracht.x).toBeCloseTo(-0.6, 10);
  });

  it('cohesie trekt naar een buur op afstand (buiten de separatiezone)', () => {
    const buren = [{ pos: { x: 100, y: 0 }, vel: { x: 0, y: 0 } }];
    const kracht = schoolKracht({ x: 0, y: 0 }, buren);
    expect(kracht.x).toBeCloseTo(0.4, 10); // alleen cohesie-gewicht
  });

  it('alignment volgt de zwemrichting van de buren', () => {
    const buren = [{ pos: { x: 100, y: 0 }, vel: { x: 0, y: 50 } }];
    const kracht = schoolKracht({ x: 0, y: 0 }, buren);
    expect(kracht.y).toBeCloseTo(0.6, 10); // alignment-gewicht op genormaliseerde snelheid
    expect(kracht.x).toBeCloseTo(0.4, 10); // plus cohesie richting de buur
  });

  it('rekent alleen over de eerste `aantal` buren van een hergebruikte buffer', () => {
    // De scene geeft een vaste buffer mee; alles voorbij `aantal` is oud vuil
    // en mag het resultaat niet beïnvloeden.
    const buffer = [
      { pos: { x: 100, y: 0 }, vel: { x: 0, y: 0 } },
      { pos: { x: 0, y: 100 }, vel: { x: 0, y: 0 } }, // oude buur: telt niet mee
    ];
    const kracht = schoolKracht({ x: 0, y: 0 }, buffer, 1);
    expect(kracht.x).toBeCloseTo(0.4, 10);
    expect(kracht.y).toBeCloseTo(0, 10);
  });

  it('schrijft in de meegegeven uit-vector zonder een nieuwe te maken', () => {
    const uit = { x: 9, y: 9 };
    const buren = [{ pos: { x: 100, y: 0 }, vel: { x: 0, y: 0 } }];
    const resultaat = schoolKracht({ x: 0, y: 0 }, buren, 1, uit);
    expect(resultaat).toBe(uit);
    expect(uit.x).toBeCloseTo(0.4, 10);

    const doel = { x: 0, y: 0 };
    expect(normaliseer({ x: 3, y: 4 }, doel)).toBe(doel);
    expect(doel.x).toBeCloseTo(0.6, 10);
    expect(vluchtVector({ x: 0, y: 0 }, { x: 10, y: 0 }, doel)).toBe(doel);
    expect(doel.x).toBeCloseTo(-1, 10);
  });
});
