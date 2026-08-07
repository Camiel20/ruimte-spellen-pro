// Tests voor het vissenboek (src/vis/logic/boek.ts): welke soorten erin staan,
// wat ontdekt heet, en wat op slot zit.
import { describe, it, expect } from 'vitest';
import { FASES, SOORTEN, SOORT_NAAM, ZONE4_EIS_FASE } from '../src/vis/GameConfig';
import {
  boekPagina,
  boekSoorten,
  boekTotaal,
  boekVol,
  isNieuweSoort,
  maxSpelerRadius,
  ooitVangbaar,
  telOntdekt,
} from '../src/vis/logic/boek';

describe('welke soorten in het boek staan', () => {
  it('16 vissen, oplopend op grootte, zonder de kwal', () => {
    expect(boekSoorten()).toEqual([
      'pijltje', 'vlokje', 'stipje', 'fonkeltje', 'pruillip', 'flapper', 'maantje',
      'zilverpijl', 'snapper', 'snorrebol', 'bolwang', 'pijlbek', 'grombaars',
      'prikbek', 'diepteschrik', 'hengelbek',
    ]);
    expect(boekSoorten()).not.toContain('kwal');
    expect(boekTotaal()).toBe(16);
  });

  it('de volgorde loopt echt op in radius', () => {
    const radii = boekSoorten().map((id) => SOORTEN[id].radius);
    for (let i = 1; i < radii.length; i++) {
      expect(radii[i]).toBeGreaterThanOrEqual(radii[i - 1]);
    }
  });

  it('elke soort heeft een naam en die namen zijn uniek', () => {
    expect(Object.keys(SOORT_NAAM).sort()).toEqual(Object.keys(SOORTEN).sort());
    const namen = Object.values(SOORT_NAAM);
    expect(new Set(namen).size).toBe(namen.length);
    for (const naam of namen) expect(naam.length).toBeGreaterThan(0);
  });
});

describe('vangbaarheid', () => {
  it('precies één soort is nooit te eten, en dat is de Hengelbek', () => {
    const onvangbaar = boekSoorten().filter((id) => !ooitVangbaar(id));
    expect(onvangbaar).toEqual(['hengelbek']);
  });

  it('de Diepteschrik valt er nét binnen (44 ≤ 56 × 0,8)', () => {
    expect(maxSpelerRadius()).toBe(FASES[FASES.length - 1].radius);
    expect(ooitVangbaar('diepteschrik')).toBe(true);
    expect(SOORTEN.diepteschrik.radius).toBeLessThanOrEqual(maxSpelerRadius() * 0.8);
  });
});

describe('boekPagina', () => {
  it('leeg boek: niets ontdekt, alles op 0', () => {
    const pagina = boekPagina({}, true);
    expect(pagina).toHaveLength(16);
    for (const item of pagina) {
      expect(item.ontdekt).toBe(false);
      expect(item.aantal).toBe(0);
    }
  });

  it('alleen de diepzee-soorten zitten op slot zolang zone 4 dicht is', () => {
    const opSlot = boekPagina({}, false).filter((i) => i.opSlot).map((i) => i.id);
    expect(opSlot.sort()).toEqual(['diepteschrik', 'fonkeltje', 'hengelbek', 'snorrebol']);
    // Flapper/Bolwang/Grombaars/Prikbek zwemmen óók ondieper en zitten dus niet op slot.
    expect(opSlot).not.toContain('flapper');
    expect(opSlot).not.toContain('prikbek');
    expect(boekPagina({}, true).some((i) => i.opSlot)).toBe(false);
    expect(ZONE4_EIS_FASE).toBeGreaterThan(0); // het slot hangt aan deze eis
  });

  it('een soort die JOU opat telt als ontdekt met aantal 0', () => {
    const item = boekPagina({ hengelbek: 0 }, true).find((i) => i.id === 'hengelbek');
    expect(item?.ontdekt).toBe(true);
    expect(item?.aantal).toBe(0);
    expect(item?.vangbaar).toBe(false);
  });

  it('geeft de zones met hun namen terug', () => {
    const flapper = boekPagina({}, true).find((i) => i.id === 'flapper');
    expect(flapper?.zones).toEqual([2, 3, 4]);
    expect(flapper?.zoneNamen).toEqual(['Open Blauw', 'Schemerlaag', 'Inktdiepte']);
  });
});

describe('tellen', () => {
  it('telt alleen boek-soorten; de kwal telt nooit mee', () => {
    expect(telOntdekt({})).toBe(0);
    expect(telOntdekt({ kwal: 9, vlokje: 1 })).toBe(1);
    expect(telOntdekt({ hengelbek: 0, vlokje: 3 })).toBe(2);
  });

  it('isNieuweSoort kijkt naar de sleutel, niet naar het aantal', () => {
    expect(isNieuweSoort({}, 'vlokje')).toBe(true);
    expect(isNieuweSoort({ vlokje: 0 }, 'vlokje')).toBe(false);
    expect(isNieuweSoort({ vlokje: 5 }, 'vlokje')).toBe(false);
    expect(isNieuweSoort({}, 'kwal')).toBe(false); // de kwal komt nooit in het boek
  });

  it('boekVol pas als alle 16 soorten ontdekt zijn', () => {
    const vangst: Record<string, number> = {};
    const soorten = boekSoorten();
    for (const id of soorten.slice(0, soorten.length - 1)) vangst[id] = 1;
    expect(boekVol(vangst)).toBe(false);
    vangst[soorten[soorten.length - 1]] = 0; // ook "ontmoet" telt mee
    expect(boekVol(vangst)).toBe(true);
  });
});
