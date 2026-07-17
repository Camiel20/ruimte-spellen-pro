// Valideert ALLE leveldata: elk level moet oplosbaar en compleet zijn.
// Dit vangt ontwerpfouten (onhaalbare brug, vlag buiten de wereld, platform
// dwars door een kloof) op het moment dat je ze maakt — niet pas al spelend.
import { describe, it, expect } from 'vitest';
import { validateLevel, canMakeTarget, findPair, splitParts } from '../src/adventure/logic.js';
import { LEVELS } from '../src/levels/index.js';

describe('leveldata', () => {
  it('heeft unieke level-ids', () => {
    const ids = LEVELS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const L of LEVELS) {
    it(`level ${L.id} (${L.naam}) is geldig en oplosbaar`, () => {
      expect(validateLevel(L)).toEqual([]);
    });
  }
});

describe('puzzellogica', () => {
  it('canMakeTarget: subset-som', () => {
    expect(canMakeTarget([4, 6], 10)).toBe(true);
    expect(canMakeTarget([3, 4, 7], 10)).toBe(true);   // 3+7
    expect(canMakeTarget([2, 5, 8], 10)).toBe(true);   // 2+8
    expect(canMakeTarget([1, 2], 5)).toBe(false);      // te weinig
    expect(canMakeTarget([6, 6], 10)).toBe(false);     // alleen 6 of 12
    expect(canMakeTarget([2, 3, 4], 9)).toBe(true);    // drie samen
  });

  it('findPair: vindt een kloppend paar (of null)', () => {
    expect(findPair([3, 4, 7], 10)).toEqual([0, 2]);
    expect(findPair([5, 5], 10)).toEqual([0, 1]);
    expect(findPair([6, 6], 10)).toBeNull();
  });

  it('splitParts: splitst op de gekozen celgrens, altijd geldige delen', () => {
    expect(splitParts(7, 3)).toEqual([3, 4]);
    expect(splitParts(7, 5)).toEqual([5, 2]);
    expect(splitParts(7, 0)).toEqual([1, 6]);   // clamp onder
    expect(splitParts(7, 99)).toEqual([6, 1]);  // clamp boven
    expect(splitParts(2, 1)).toEqual([1, 1]);
  });

  it('validateLevel: vangt een grommel die de kloof in wandelt', () => {
    const kapot = {
      id: 'x-2', worldW: 1000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 400, 140], [760, 660, 240, 140]],
      grommels: [{ type: 'stomp', x: 300, y: 612, patrol: [200, 500] }], // 500 > rand 400
      goal: { x: 900, y: 588, value: 3 },
    };
    const errors = validateLevel(kapot);
    expect(errors.some((e) => e.includes('kloof in'))).toBe(true);
  });

  it('validateLevel: vangt een start zonder grond eronder', () => {
    const kapot = {
      id: 'x-3', worldW: 1000, worldH: 800, killY: 720,
      start: { x: 500, y: 500 }, // boven het gat tussen de platforms
      platforms: [[0, 660, 400, 140], [760, 660, 240, 140]],
      goal: { x: 900, y: 588, value: 3 },
    };
    const errors = validateLevel(kapot);
    expect(errors.some((e) => e.includes('geen platform eronder'))).toBe(true);
  });

  it('validateLevel: vangt een geef-plaat die kan vastlopen', () => {
    const kapot = {
      id: 'x-4', worldW: 1000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 1000, 140]],
      pickups: [{ x: 100, y: 600, amount: 1 }], // maar 1 bolletje vóór de plaat
      plates: [{ x: 400, doel: 3 }],
      goal: { x: 900, y: 588, value: 3 },
    };
    const errors = validateLevel(kapot);
    expect(errors.some((e) => e.includes('vastlopen'))).toBe(true);
    // mét een regen-bolletje is het wél haalbaar
    const goed = { ...kapot, pickups: [{ x: 100, y: 600, amount: 1, regen: true }] };
    expect(validateLevel(goed)).toEqual([]);
  });

  it('validateLevel: vangt een beuk-baas die niet krimpt of geen reuzenhap heeft', () => {
    const basis = {
      id: 'x-beuk', worldW: 2000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 2000, 140]],
      reuzenhappen: [[600, 600]],
      boss: { x: 1200, look: 'reus', stijl: 'beuk', stages: [{ doel: 9 }, { doel: 6 }, { doel: 3 }] },
      goal: { x: 1800, y: 588, value: 3 },
    };
    expect(validateLevel(basis)).toEqual([]);
    // doelen moeten AFLOPEN (de baas krimpt per beuk)
    const groeit = { ...basis, boss: { ...basis.boss, stages: [{ doel: 3 }, { doel: 6 }] } };
    expect(validateLevel(groeit).some((e) => e.includes('KRIMPEN'))).toBe(true);
    // zonder reuzenhap kun je nooit beuken
    const zonderHap = { ...basis, reuzenhappen: [] };
    expect(validateLevel(zonderHap).some((e) => e.includes('onverslaanbaar'))).toBe(true);
  });

  it('validateLevel: vangt een kapot paren-bord (te klein of te groot getal)', () => {
    const basis = {
      id: 'x-paren', worldW: 2000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 2000, 140]],
      parenBorden: [{ x: 900, getal: 6 }],
      goal: { x: 1800, y: 588, value: 3 },
    };
    expect(validateLevel(basis)).toEqual([]);
    const teKlein = { ...basis, parenBorden: [{ x: 900, getal: 1 }] };
    expect(validateLevel(teKlein).some((e) => e.includes('minstens 2'))).toBe(true);
    const teGroot = { ...basis, parenBorden: [{ x: 900, getal: 15 }] };
    expect(validateLevel(teGroot).some((e) => e.includes('te groot'))).toBe(true);
    // geen aanloop-grond vóór de muur (muur op de rand van een platform)
    const zonderGrond = { ...basis, platforms: [[0, 660, 950, 140], [1050, 660, 950, 140]], parenBorden: [{ x: 1100, getal: 6 }] };
    expect(validateLevel(zonderGrond).some((e) => e.includes('doorlopende grond'))).toBe(true);
  });

  it('validateLevel: vangt een kapotte duikboot (geen of te veel 10-maatjes)', () => {
    const basis = {
      id: 'x-duik', worldW: 3000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 1200, 140], [1800, 660, 1200, 140]],
      water: [[1200, 690, 600, 110]],
      duikboten: [{ x: 1000, landX: 1960, toon: 7, bellen: [[500, 480, 3], [650, 400, 5]] }],
      goal: { x: 2800, y: 588, value: 10 },
    };
    expect(validateLevel(basis)).toEqual([]);
    // geen enkel 10-maatje tussen de bellen → onoplosbaar
    const zonderMaatje = { ...basis, duikboten: [{ ...basis.duikboten[0], bellen: [[500, 480, 4], [650, 400, 5]] }] };
    expect(validateLevel(zonderMaatje).some((e) => e.includes('precies één'))).toBe(true);
    // landingsplek zonder grond
    const zonderLand = { ...basis, duikboten: [{ ...basis.duikboten[0], landX: 1400 }] };
    expect(validateLevel(zonderLand).some((e) => e.includes('geen grond'))).toBe(true);
  });

  it('validateLevel: vangt een finale-baas zonder bouw-climax of grauwe muur', () => {
    const basis = {
      id: 'x-finale', worldW: 3000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      startMega: true,
      platforms: [[0, 660, 3000, 140]],
      grauwMuren: [600],
      boss: {
        x: 2000, look: 'grauw', stijl: 'finale',
        stages: [
          { soort: 'vang', doel: 5 },
          { soort: 'muur', doel: 10 },
          { soort: 'bouw', doel: 30, blocks: [21, 13] },
        ],
      },
      goal: { x: 2800, y: 588, value: 30 },
    };
    expect(validateLevel(basis)).toEqual([]);
    const zonderClimax = { ...basis, boss: { ...basis.boss, stages: [{ soort: 'bouw', doel: 10, blocks: [7, 6] }, { soort: 'vang', doel: 5 }] } };
    expect(validateLevel(zonderClimax).some((e) => e.includes('laatste akte'))).toBe(true);
    const zonderMuur = { ...basis, grauwMuren: [] };
    expect(validateLevel(zonderMuur).some((e) => e.includes('schild-collider'))).toBe(true);
  });

  it('validateLevel: vangt een stomp-baas zonder maan-zone', () => {
    const basis = {
      id: 'x-stomp', worldW: 2000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 2000, 140]],
      maanZones: [{ x: 900, w: 600 }],
      boss: { x: 1200, look: 'meteoor', stijl: 'stomp', stages: [{ doel: 10 }, { doel: 20 }] },
      goal: { x: 1800, y: 588, value: 20 },
    };
    expect(validateLevel(basis)).toEqual([]);
    const zonderZone = { ...basis, maanZones: [{ x: 100, w: 300 }] };
    expect(validateLevel(zonderZone).some((e) => e.includes('maan-zone'))).toBe(true);
    const geenTiental = { ...basis, boss: { ...basis.boss, stages: [{ doel: 12 }] } };
    expect(validateLevel(geenTiental).some((e) => e.includes('tiental'))).toBe(true);
  });

  it('validateLevel: vangt een splits-baas met een kloppend raadsel-gat', () => {
    const basis = {
      id: 'x-splits', worldW: 2000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 2000, 140]],
      boss: { x: 1200, look: 'kristal', stijl: 'splits', stages: [{ van: 10, weg: 6, doel: 4, opties: [4, 3, 6] }] },
      goal: { x: 1800, y: 588, value: 10 },
    };
    expect(validateLevel(basis)).toEqual([]);
    const fouteSom = { ...basis, boss: { ...basis.boss, stages: [{ van: 10, weg: 6, doel: 5, opties: [5, 3, 6] }] } };
    expect(validateLevel(fouteSom).some((e) => e.includes('van − weg'))).toBe(true);
    const geenGoed = { ...basis, boss: { ...basis.boss, stages: [{ van: 10, weg: 6, doel: 4, opties: [3, 6, 7] }] } };
    expect(validateLevel(geenGoed).some((e) => e.includes('precies één'))).toBe(true);
  });

  it('validateLevel: vangt een schud-baas zonder stamp-kracht', () => {
    const basis = {
      id: 'x-schud', worldW: 2000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      startStamp: true,
      platforms: [[0, 660, 2000, 140]],
      boss: { x: 1200, look: 'boom', stijl: 'schud', stages: [{ doel: 4 }, { doel: 6 }] },
      goal: { x: 1800, y: 588, value: 10 },
    };
    expect(validateLevel(basis)).toEqual([]);
    const zonderStamp = { ...basis, startStamp: false };
    expect(validateLevel(zonderStamp).some((e) => e.includes('stamp'))).toBe(true);
  });

  it('validateLevel: vangt een surf-baas zonder kloppende tel-schelp', () => {
    const basis = {
      id: 'x-surf', worldW: 2000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 2000, 140]],
      boss: { x: 1200, look: 'golf', stijl: 'surf', stages: [{ doel: 3, opties: [3, 2, 5] }] },
      goal: { x: 1800, y: 588, value: 10 },
    };
    expect(validateLevel(basis)).toEqual([]);
    const kapot = { ...basis, boss: { ...basis.boss, stages: [{ doel: 3, opties: [2, 4, 5] }] } };
    expect(validateLevel(kapot).some((e) => e.includes('precies één'))).toBe(true);
    const teVeel = { ...basis, boss: { ...basis.boss, stages: [{ doel: 8, opties: [8, 2] }] } };
    expect(validateLevel(teVeel).some((e) => e.includes('2-6'))).toBe(true);
  });

  it('validateLevel: vangt een tien-baas zonder kloppend 10-maatje', () => {
    const basis = {
      id: 'x-tien', worldW: 2000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 2000, 140]],
      boss: { x: 1200, look: 'octopus', stijl: 'tien', stages: [{ doel: 6, opties: [4, 2, 7] }] },
      goal: { x: 1800, y: 588, value: 10 },
    };
    expect(validateLevel(basis)).toEqual([]);
    const kapot = { ...basis, boss: { ...basis.boss, stages: [{ doel: 6, opties: [2, 7, 9] }] } };
    expect(validateLevel(kapot).some((e) => e.includes('precies één'))).toBe(true);
  });

  it('validateLevel: vangt een paar-baas zonder (of met dubbele) tweelingsok', () => {
    const basis = {
      id: 'x-paar', worldW: 2000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 2000, 140]],
      boss: { x: 1200, look: 'sokdief', stijl: 'paar', stages: [{ doel: 'strepen', opties: ['strepen', 'stippen', 'zigzag'] }] },
      goal: { x: 1800, y: 588, value: 10 },
    };
    expect(validateLevel(basis)).toEqual([]);
    const geenTweeling = { ...basis, boss: { ...basis.boss, stages: [{ doel: 'strepen', opties: ['stippen', 'zigzag', 'hartjes'] }] } };
    expect(validateLevel(geenTweeling).some((e) => e.includes('precies één'))).toBe(true);
    const raarPatroon = { ...basis, boss: { ...basis.boss, stages: [{ doel: 'ruitjes', opties: ['ruitjes', 'stippen'] }] } };
    expect(validateLevel(raarPatroon).some((e) => e.includes('geen bekend sok-patroon'))).toBe(true);
  });

  it('validateLevel: vangt een kegel-baas met een som die niet klopt', () => {
    const basis = {
      id: 'x-kegel', worldW: 2000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 2000, 140]],
      boss: { x: 1200, look: 'kegel', stijl: 'kegel', stages: [{ van: 30, weg: 12, doel: 18, opties: [18, 8, 17] }] },
      goal: { x: 1800, y: 588, value: 10 },
    };
    expect(validateLevel(basis)).toEqual([]);
    const fouteSom = { ...basis, boss: { ...basis.boss, stages: [{ van: 30, weg: 12, doel: 17, opties: [17, 8] }] } };
    expect(validateLevel(fouteSom).some((e) => e.includes('van − weg'))).toBe(true);
    const geenBord = { ...basis, boss: { ...basis.boss, stages: [{ van: 30, weg: 12, doel: 18, opties: [8, 17] }] } };
    expect(validateLevel(geenBord).some((e) => e.includes('precies één'))).toBe(true);
    const teGroot = { ...basis, boss: { ...basis.boss, stages: [{ van: 80, weg: 20, doel: 60, opties: [60, 50] }] } };
    expect(validateLevel(teGroot).some((e) => e.includes('4-60'))).toBe(true);
  });

  it('validateLevel: vangt een sok zonder tweeling in het level', () => {
    const basis = {
      id: 'x-sokken', worldW: 2000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 2000, 140]],
      sokkenParen: [
        { x: 400, y: 500, patroon: 'strepen' }, { x: 900, y: 500, patroon: 'strepen' },
      ],
      goal: { x: 1800, y: 588, value: 10 },
    };
    expect(validateLevel(basis)).toEqual([]);
    const wees = { ...basis, sokkenParen: [...basis.sokkenParen, { x: 1200, y: 500, patroon: 'stippen' }] };
    expect(validateLevel(wees).some((e) => e.includes('precies 2×'))).toBe(true);
  });

  it('validateLevel: vangt een waslijn zonder landing en een zwevende stuiterbal', () => {
    const basis = {
      id: 'x-waslijn', worldW: 3000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 1200, 140], [1800, 660, 1200, 140]],
      wasLijnen: [{ x1: 1050, y1: 400, x2: 1950, y2: 440 }],
      stuiterBallen: [600],
      goal: { x: 2800, y: 588, value: 10 },
    };
    expect(validateLevel(basis)).toEqual([]);
    // eindpunt boven de kloof → je zoeft de leegte in
    const leegte = { ...basis, wasLijnen: [{ x1: 1050, y1: 400, x2: 1500, y2: 440 }] };
    expect(validateLevel(leegte).some((e) => e.includes('leegte'))).toBe(true);
    // stuiterbal op de rand van een platform → rolt de kloof in bij het duwen
    const zwevend = { ...basis, stuiterBallen: [1190] };
    expect(validateLevel(zwevend).some((e) => e.includes('stuiterbal'))).toBe(true);
  });

  it('validateLevel: vangt kapotte maten-rekken, winkels, banen en baskets', () => {
    const basis = {
      id: 'x-w13w14', worldW: 4000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 4000, 140]],
      maatRekken: [{ x: 700, aantal: 3 }],
      knopenWinkels: [{ x: 1500, prijs: 7 }],
      bowlingBanen: [{ x: 2100, kegels: 10 }],
      baskets: [{ x: 3200, doel: 8 }],
      goal: { x: 3900, y: 588, value: 10 },
    };
    expect(validateLevel(basis)).toEqual([]);
    const teWeinigTruien = { ...basis, maatRekken: [{ x: 700, aantal: 2 }] };
    expect(validateLevel(teWeinigTruien).some((e) => e.includes('3-5'))).toBe(true);
    const teDuur = { ...basis, knopenWinkels: [{ x: 1500, prijs: 20 }] };
    expect(validateLevel(teDuur).some((e) => e.includes('prijs'))).toBe(true);
    const gekkeKegels = { ...basis, bowlingBanen: [{ x: 2100, kegels: 15 }] };
    expect(validateLevel(gekkeKegels).some((e) => e.includes('tiental'))).toBe(true);
    const teVeelBallen = { ...basis, baskets: [{ x: 3200, doel: 20 }] };
    expect(validateLevel(teVeelBallen).some((e) => e.includes('3-15'))).toBe(true);
  });

  it('validateLevel: vangt een dino-rit waar niet precies één dino kan landen', () => {
    const basis = {
      id: 'x-dino', worldW: 3000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 3000, 140]],
      dinoRitten: [{ x: 700, start: 0, doel: 40 }], // alleen de Reuzen-Dino (4×10)
      goal: { x: 2800, y: 588, value: 10 },
    };
    expect(validateLevel(basis)).toEqual([]);
    // 20 halen zowel de Springer (4×5) als de Reuzen-Dino (2×10) → niet uniek
    const tweeDinos = { ...basis, dinoRitten: [{ x: 700, start: 0, doel: 20 }] };
    expect(validateLevel(tweeDinos).some((e) => e.includes('precies één'))).toBe(true);
    // 7 haalt niemand (7 deelt niet door 2, 5 of 10)
    const niemand = { ...basis, dinoRitten: [{ x: 700, start: 0, doel: 7 }] };
    expect(validateLevel(niemand).some((e) => e.includes('precies één'))).toBe(true);
  });

  it('validateLevel: vangt een sprong-baas met een kapotte som', () => {
    const basis = {
      id: 'x-sprong', worldW: 2000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 2000, 140]],
      boss: { x: 1200, look: 'rex', stijl: 'sprong', stages: [{ start: 20, sprong: 10, keer: 3, doel: 50, opties: [50, 40, 53] }] },
      goal: { x: 1800, y: 588, value: 10 },
    };
    expect(validateLevel(basis)).toEqual([]);
    const fouteSom = { ...basis, boss: { ...basis.boss, stages: [{ start: 20, sprong: 10, keer: 3, doel: 40, opties: [40, 50] }] } };
    expect(validateLevel(fouteSom).some((e) => e.includes('start + sprong'))).toBe(true);
    const gekkeSprong = { ...basis, boss: { ...basis.boss, stages: [{ start: 20, sprong: 3, keer: 3, doel: 29, opties: [29, 26] }] } };
    expect(validateLevel(gekkeSprong).some((e) => e.includes('2, 5 of 10'))).toBe(true);
  });

  it('validateLevel: vangt een klok-baas met een tijd die niet bestaat', () => {
    const basis = {
      id: 'x-klok', worldW: 2000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 2000, 140]],
      boss: { x: 1200, look: 'tiktak', stijl: 'klok', stages: [{ doel: 7.5, opties: [7.5, 6.5, 4] }] },
      goal: { x: 1800, y: 588, value: 10 },
    };
    expect(validateLevel(basis)).toEqual([]);
    const kwartier = { ...basis, boss: { ...basis.boss, stages: [{ doel: 7.25, opties: [7.25, 6] }] } };
    expect(validateLevel(kwartier).some((e) => e.includes('halve stappen'))).toBe(true);
    const dubbel = { ...basis, boss: { ...basis.boss, stages: [{ doel: 4, opties: [4, 4, 9] }] } };
    expect(validateLevel(dubbel).some((e) => e.includes('precies één'))).toBe(true);
  });

  it('validateLevel: vangt een balans-baas die niet zwaarder wordt', () => {
    const basis = {
      id: 'x-balans', worldW: 2000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 2000, 140]],
      boss: { x: 1200, look: 'sterkeman', stijl: 'balans', stages: [{ doel: 10 }, { doel: 15 }, { doel: 20 }] },
      goal: { x: 1800, y: 588, value: 10 },
    };
    expect(validateLevel(basis)).toEqual([]);
    const lichter = { ...basis, boss: { ...basis.boss, stages: [{ doel: 15 }, { doel: 10 }] } };
    expect(validateLevel(lichter).some((e) => e.includes('zwaarder'))).toBe(true);
    const teZwaar = { ...basis, boss: { ...basis.boss, stages: [{ doel: 25 }] } };
    expect(validateLevel(teZwaar).some((e) => e.includes('5-20'))).toBe(true);
  });

  it('validateLevel: vangt kapotte koekoeken, slingers, tandwielen en koorden', () => {
    const basis = {
      id: 'x-w16w17', worldW: 4000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 4000, 140]],
      koekoeken: [{ x: 700, uur: 3 }],
      slingers: [{ x: 1500, y: 240, lengte: 260 }],
      tandwielen: [{ x: 2200, y: 400 }],
      koorden: [[2800, 3300, 480]],
      goal: { x: 3900, y: 588, value: 10 },
    };
    expect(validateLevel(basis)).toEqual([]);
    const dertienUur = { ...basis, koekoeken: [{ x: 700, uur: 13 }] };
    expect(validateLevel(dertienUur).some((e) => e.includes('1-12'))).toBe(true);
    const sleept = { ...basis, slingers: [{ x: 1500, y: 500, lengte: 260 }] }; // 760 > grond
    expect(validateLevel(sleept).some((e) => e.includes('grond'))).toBe(true);
    const laagKoord = { ...basis, koorden: [[2800, 3300, 640]] };
    expect(validateLevel(laagKoord).some((e) => e.includes('koorddansen'))).toBe(true);
  });

  it('validateLevel: vangt kapotte weegwippen en kanonnen', () => {
    const basis = {
      id: 'x-circus', worldW: 4000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 2000, 140], [2400, 660, 1600, 140]],
      weegWippen: [{ x: 800, doel: 7 }],
      kanonnen: [{ x: 1800, vaatjes: 2, landX: 2500 }],
      goal: { x: 3900, y: 588, value: 10 },
    };
    expect(validateLevel(basis)).toEqual([]);
    const teDuur = { ...basis, weegWippen: [{ x: 800, doel: 20 }] };
    expect(validateLevel(teDuur).some((e) => e.includes('3-15'))).toBe(true);
    const teDichtbij = { ...basis, kanonnen: [{ x: 1800, vaatjes: 2, landX: 1950 }] };
    expect(validateLevel(teDichtbij).some((e) => e.includes('300px'))).toBe(true);
    const geenLanding = { ...basis, kanonnen: [{ x: 1800, vaatjes: 2, landX: 2340 }] }; // in de kloof
    expect(validateLevel(geenLanding).some((e) => e.includes('geen grond'))).toBe(true);
  });

  it('validateLevel: vangt kapotte thermometers, sneeuwballen en de vries-baas (W18)', () => {
    const basis = {
      id: 'x-w18', worldW: 4000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 2000, 140], [2400, 660, 1600, 140]],
      thermometers: [{ x: 700, doel: -1 }],
      sneeuwballen: [{ x: 1100, doel: 4 }],
      boss: { x: 3200, look: 'vrieskoning', stijl: 'vries', stages: [{ start: 4, doel: 0 }, { start: 6, doel: -3 }] },
      goal: { x: 3900, y: 588, value: 10 },
    };
    expect(validateLevel(basis)).toEqual([]);
    const teKoud = { ...basis, thermometers: [{ x: 700, doel: -7 }] };
    expect(validateLevel(teKoud).some((e) => e.includes('5..5'))).toBe(true);
    const teKlein = { ...basis, sneeuwballen: [{ x: 1100, doel: 2 }] };
    expect(validateLevel(teKlein).some((e) => e.includes('3-8'))).toBe(true);
    const omhoog = { ...basis, boss: { ...basis.boss, stages: [{ start: 3, doel: 5 }] } }; // doel > start
    expect(validateLevel(omhoog).some((e) => e.includes('terugtellen'))).toBe(true);
  });

  it('validateLevel: vangt kapotte flits-spoken, spook-treden en de flits-baas (W19)', () => {
    const basis = {
      id: 'x-w19', worldW: 4000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 4000, 140]],
      flitsSpoken: [{ x: 700, aantal: 4 }],
      spookTreden: [{ x: 1500, y: 400, w: 120 }],
      boss: { x: 3200, look: 'boe', stijl: 'flits', stages: [{ doel: 3, opties: [3, 4, 2] }, { doel: 5, opties: [5, 6, 4] }] },
      goal: { x: 3900, y: 588, value: 10 },
    };
    expect(validateLevel(basis)).toEqual([]);
    const teVeel = { ...basis, flitsSpoken: [{ x: 700, aantal: 8 }] };
    expect(validateLevel(teVeel).some((e) => e.includes('2-6'))).toBe(true);
    const buiten = { ...basis, spookTreden: [{ x: 3990, y: 400, w: 120 }] };
    expect(validateLevel(buiten).some((e) => e.includes('buiten de wereld'))).toBe(true);
    const geenGoed = { ...basis, boss: { ...basis.boss, stages: [{ doel: 3, opties: [4, 5, 2] }] } };
    expect(validateLevel(geenGoed).some((e) => e.includes('precies'))).toBe(true);
  });

  it('validateLevel: vangt een onoplosbare brug (samen te weinig)', () => {
    const kapot = {
      id: 'x-1', worldW: 1000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 400, 140], [760, 660, 240, 140]],
      gate: { gapX: 400, gapW: 360, y: 650, doel: 10, blocks: [1, 2], triggerX: 300, triggerW: 100 },
      goal: { x: 900, y: 588, value: 10 },
    };
    const errors = validateLevel(kapot);
    expect(errors.some((e) => e.includes('onoplosbaar'))).toBe(true);
    // [6,6] → 10 is WÉL oplosbaar (samenvoegen tot 12, dan splitsen op 10+2)
    const splitsbaar = { ...kapot, gate: { ...kapot.gate, blocks: [6, 6] } };
    expect(validateLevel(splitsbaar)).toEqual([]);
  });

  it('validateLevel: vangt een trein die niet precies te verdelen is', () => {
    const kapot = {
      id: 'x-5', worldW: 1000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 400, 140], [760, 660, 240, 140]],
      gate: { type: 'trein', gapX: 400, gapW: 360, y: 650, wagons: [4, 6], blocks: [8], triggerX: 300, triggerW: 100 },
      goal: { x: 900, y: 588, value: 10 },
    };
    const errors = validateLevel(kapot);
    expect(errors.some((e) => e.includes('verdelen moet precies kloppen'))).toBe(true);
  });

  it('validateLevel: vangt een raket-tank die nooit vol kan', () => {
    const kapot = {
      id: 'x-6', worldW: 3000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 1400, 140], [2400, 660, 600, 140]],
      raket: { x: 1300, doel: 100, landX: 2500, drums: [[200, 600], [400, 600], [600, 600]] }, // 3×10 = 30 < 100
      goal: { x: 2900, y: 588, value: 100 },
    };
    const errors = validateLevel(kapot);
    expect(errors.some((e) => e.includes('tank kan nooit vol'))).toBe(true);
    // met 10 vaatjes is het wél in orde
    const goed = { ...kapot, raket: { ...kapot.raket, drums: Array.from({ length: 10 }, (_, i) => [150 + i * 100, 600]) } };
    expect(validateLevel(goed)).toEqual([]);
  });

  it('validateLevel: vangt een portaal-groep zonder (of met dubbele) goede som', () => {
    const basis = {
      id: 'x-7', worldW: 2000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 2000, 140]],
      goal: { x: 1900, y: 588, value: 20 },
    };
    // geen enkele som maakt 20 → onoplosbaar
    const geen = { ...basis, portalen: [{ x: 600, doel: 20, opties: [[10, 5], [20, 10]] }] };
    expect(validateLevel(geen).some((e) => e.includes('precies één'))).toBe(true);
    // twee sommen maken 20 → geen raadsel meer
    const dubbel = { ...basis, portalen: [{ x: 600, doel: 20, opties: [[10, 10], [15, 5]] }] };
    expect(validateLevel(dubbel).some((e) => e.includes('precies één'))).toBe(true);
    // precies één goede som → in orde
    const goed = { ...basis, portalen: [{ x: 600, doel: 20, opties: [[10, 10], [15, 10]] }] };
    expect(validateLevel(goed)).toEqual([]);
  });

  it('validateLevel: vangt een grauwe muur zonder tien-kracht', () => {
    const kapot = {
      id: 'x-9', worldW: 2000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 2000, 140]],
      grauwMuren: [800], // geen startMega en geen redding die 'mega' geeft
      goal: { x: 1900, y: 588, value: 10 },
    };
    expect(validateLevel(kapot).some((e) => e.includes('tien-kracht'))).toBe(true);
    // mét startMega is het wél in orde
    const goed = { ...kapot, startMega: true };
    expect(validateLevel(goed)).toEqual([]);
  });

  it('validateLevel: vangt een bakkerij die niet eerlijk te verdelen is', () => {
    const basis = {
      id: 'x-10', worldW: 3000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 1500, 140], [2400, 660, 600, 140]],
      goal: { x: 2900, y: 588, value: 3 },
    };
    // 5 toppings over 2 pizza's à 3 = 6 nodig → onoplosbaar
    const kapot = { ...basis, bakkerij: { x: 1400, pizzas: 2, per: 3, toppings: [[100, 600], [200, 600], [300, 600], [400, 600], [500, 600]], brug: [1500, 660, 900] } };
    expect(validateLevel(kapot).some((e) => e.includes('eerlijk delen'))).toBe(true);
    // met 6 toppings klopt het precies
    const goed = { ...kapot, bakkerij: { ...kapot.bakkerij, toppings: [[100, 600], [200, 600], [300, 600], [400, 600], [500, 600], [600, 600]] } };
    expect(validateLevel(goed)).toEqual([]);
  });

  it('validateLevel: vangt een geiser die niet op de grond staat', () => {
    const kapot = {
      id: 'x-11', worldW: 1000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 400, 140], [760, 660, 240, 140]],
      geisers: [{ x: 500 }], // midden in de kloof
      goal: { x: 900, y: 588, value: 3 },
    };
    expect(validateLevel(kapot).some((e) => e.includes('geiser'))).toBe(true);
  });

  it('validateLevel: vangt een kantel-punt buiten de wereld', () => {
    const kapot = {
      id: 'x-12', worldW: 1000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 1000, 140]],
      kantels: [[980, 600, 130]], // steekt buiten de wereld
      goal: { x: 900, y: 588, value: 3 },
    };
    expect(validateLevel(kapot).some((e) => e.includes('kantel-punt'))).toBe(true);
  });

  it('validateLevel: vangt een maan-zone buiten de wereld', () => {
    const kapot = {
      id: 'x-8', worldW: 1000, worldH: 800, killY: 720,
      start: { x: 50, y: 500 },
      platforms: [[0, 660, 1000, 140]],
      maanZones: [{ x: 800, w: 400 }], // steekt 200px buiten de wereld
      goal: { x: 900, y: 588, value: 3 },
    };
    const errors = validateLevel(kapot);
    expect(errors.some((e) => e.includes('maan-zone'))).toBe(true);
  });
});
