// Tests voor de Tel-Slang-logica (src/snakeLogic.js).
import { describe, it, expect } from 'vitest';
import {
  TIENTAL_NAMEN, TIENTAL_WOORD, MISSIES,
  gepasseerdeTientallen, tientalNaam, telHint, getallenlijnFractie,
  voerWaarde, maakBestelling, krimpBijBotsing, missieVoortgang, volgendeMissie,
} from '../src/snakeLogic.js';

describe('tientallen', () => {
  it('gepasseerdeTientallen vindt elk tiental hoogstens één keer', () => {
    expect(gepasseerdeTientallen(8, 21)).toEqual([10, 20]);
    expect(gepasseerdeTientallen(10, 10)).toEqual([]);
    expect(gepasseerdeTientallen(9, 10)).toEqual([10]);
    expect(gepasseerdeTientallen(0, 5)).toEqual([]);
    expect(gepasseerdeTientallen(95, 100)).toEqual([100]);
  });

  it('tientalNaam geeft de juiste feestnaam', () => {
    expect(tientalNaam(10)).toBe('TIEN!');
    expect(tientalNaam(100)).toBe('HONDERD!!!');
    expect(tientalNaam(110)).toBe('110!');
  });

  it('lijstlengtes kloppen', () => {
    expect(TIENTAL_NAMEN).toHaveLength(10);
    expect(TIENTAL_WOORD).toHaveLength(10);
  });
});

describe('telHint', () => {
  it('geeft "nog X tot <tiental>" binnen 3 van het volgende tiental', () => {
    expect(telHint(18)).toEqual({ rest: 2, doel: 20, woord: 'TWINTIG' });
    expect(telHint(17)).toEqual({ rest: 3, doel: 20, woord: 'TWINTIG' });
    expect(telHint(97)).toEqual({ rest: 3, doel: 100, woord: 'HONDERD' });
  });

  it('geeft niets als je te ver van het tiental zit of op een tiental staat', () => {
    expect(telHint(14)).toBe(null);
    expect(telHint(20)).toBe(null);   // volgende is 30, rest 10
    expect(telHint(100)).toBe(null);  // geen tiental boven 100
  });
});

describe('getallenlijnFractie', () => {
  it('clamp tussen 0 en 1', () => {
    expect(getallenlijnFractie(0)).toBe(0);
    expect(getallenlijnFractie(50)).toBe(0.5);
    expect(getallenlijnFractie(150)).toBe(1);
    expect(getallenlijnFractie(-5)).toBe(0);
  });
});

describe('voerWaarde', () => {
  it('is altijd 1, 2 of 3', () => {
    for (let i = 0; i < 200; i++) expect([1, 2, 3]).toContain(voerWaarde());
  });
  it('1 komt het vaakst voor', () => {
    const tel = { 1: 0, 2: 0, 3: 0 };
    for (let i = 0; i < 600; i++) tel[voerWaarde()]++;
    expect(tel[1]).toBeGreaterThan(tel[2]);
    expect(tel[2]).toBeGreaterThan(tel[3]);
  });
  it('respecteert de kansdrempels met een vaste rnd', () => {
    expect(voerWaarde(() => 0.1)).toBe(1);
    expect(voerWaarde(() => 0.8)).toBe(2);
    expect(voerWaarde(() => 0.99)).toBe(3);
  });
});

describe('maakBestelling', () => {
  it('geeft een doel + afleiders, allemaal uniek en 1..9', () => {
    for (let i = 0; i < 50; i++) {
      const b = maakBestelling();
      expect(b.opties).toContain(b.doel);
      expect(b.opties).toHaveLength(3);
      expect(new Set(b.opties).size).toBe(3);
      b.opties.forEach((o) => { expect(o).toBeGreaterThanOrEqual(1); expect(o).toBeLessThanOrEqual(9); });
    }
  });
});

describe('krimpBijBotsing (faal-vriendelijk)', () => {
  it('verliest segmenten maar zakt nooit onder het minimum', () => {
    expect(krimpBijBotsing(20)).toBe(15);
    expect(krimpBijBotsing(5)).toBe(3);
    expect(krimpBijBotsing(3)).toBe(3);
  });
});

describe('missies', () => {
  it('groei-missie klaar bij lengte >= doel', () => {
    const m = MISSIES[0]; // groei naar 10
    expect(missieVoortgang(m, { lengte: 8 }).klaar).toBe(false);
    expect(missieVoortgang(m, { lengte: 10 }).klaar).toBe(true);
    expect(missieVoortgang(m, { lengte: 12 }).huidig).toBe(10); // gecapt op doel
  });

  it('nullen-missie telt gouden nullen van deze missie', () => {
    const m = MISSIES[1]; // vang 1 gouden nul
    expect(missieVoortgang(m, { nullenDezeMissie: 0 }).klaar).toBe(false);
    expect(missieVoortgang(m, { nullenDezeMissie: 1 }).klaar).toBe(true);
  });

  it('volgendeMissie loopt netjes af', () => {
    expect(volgendeMissie(0)).toBe(MISSIES[0]);
    expect(volgendeMissie(MISSIES.length)).toBe(null);
  });
});
