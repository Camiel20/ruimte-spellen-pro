// Tests voor de Hapvis-spelregels (src/vis/logic/regels.ts): eetregel,
// groeicurve, fases, kwal-straf en boost-energie. Elk verwacht getal is na
// te rekenen vanuit docs/DESIGN.md.
import { describe, it, expect } from 'vitest';
import {
  AANTAL_ZONES,
  COMBO_BONUS,
  COMBO_MIN,
  COMBO_TOON_MAX,
  COMBO_TOON_STAP,
  DESPAWN_AFSTAND,
  EET_FACTOR,
  FASES,
  MASSA_MAX,
  MEGA_DUUR,
  MEGA_FACTOR,
  SOORTEN,
  SPELER_START_MASSA,
  VLUCHT_FACTOR,
  ZONE4_EIS_FASE,
  ZONES,
} from '../src/vis/GameConfig';
import {
  comboBonus,
  comboToonStijging,
  eetBinnenBereik,
  faseDrempel,
  faseVoorMassa,
  kanEten,
  magBoostStarten,
  massaNaEten,
  massaNaKlap,
  massaNaKwal,
  maxSnelheidVoorMassa,
  nieuweEnergie,
  radiusVoorMassa,
} from '../src/vis/logic/regels';

describe('eetregel', () => {
  it('eet op of onder de 0,8-grens, niet erboven', () => {
    expect(kanEten(17, 13.6)).toBe(true); // exact op de grens
    expect(kanEten(17, 13.61)).toBe(false);
  });

  it('fase 1 (radius 12) eet Vlokje en Stipje, geen Flapper', () => {
    expect(kanEten(12, SOORTEN.vlokje.radius)).toBe(true);
    expect(kanEten(12, SOORTEN.stipje.radius)).toBe(true);
    expect(kanEten(12, SOORTEN.flapper.radius)).toBe(false);
  });

  it('Diepteschrik is pas eetbaar in fase 5 en eet spelers tot radius 35,2', () => {
    const apex = SOORTEN.diepteschrik.radius; // 44
    expect(kanEten(56, apex)).toBe(true); // fase 5: 44 <= 44,8
    expect(kanEten(34, apex)).toBe(false); // fase 4-drempel kan hem nog niet eten
    expect(kanEten(apex, 35.1)).toBe(true); // apex eet radius < 35,2
    expect(kanEten(apex, 35.3)).toBe(false);
  });

  it('roofvis-eetgrenzen volgen uit de config-radii (Snapper 13,6; Grombaars 20)', () => {
    expect(kanEten(SOORTEN.snapper.radius, 13.5)).toBe(true);
    expect(kanEten(SOORTEN.snapper.radius, 13.7)).toBe(false);
    expect(kanEten(SOORTEN.grombaars.radius, 19.9)).toBe(true);
    expect(kanEten(SOORTEN.grombaars.radius, 20.1)).toBe(false);
  });

  it('mond raakt: afstand kleiner dan de eter-radius', () => {
    expect(eetBinnenBereik(11.9, 12)).toBe(true);
    expect(eetBinnenBereik(12, 12)).toBe(false);
  });

  it('de speler hapt zodra de cirkels raken; een roofvis moet dichterbij komen', () => {
    // Speler (r12) hapt een Vlokje (r6) al op 17 px: anders moet je binnen
    // 12 px mikken op een bewegend doel, en dat lukt een kind niet.
    expect(eetBinnenBereik(17, 12, SOORTEN.vlokje.radius)).toBe(true);
    expect(eetBinnenBereik(18, 12, SOORTEN.vlokje.radius)).toBe(false);
    // Zonder prooistraal (zo pakt een roofvis de speler) blijft het streng.
    expect(eetBinnenBereik(17, 12)).toBe(false);
  });

  it('vluchtende prooi is langzamer dan de speler die erop jaagt', () => {
    // De kern van de speelbaarheid: je moet echt inlopen. Fase 1 zwemt 170.
    const faseEen = FASES[0].maxSnelheid;
    for (const id of ['pijltje', 'vlokje', 'stipje', 'pruillip'] as const) {
      const marge = faseEen - SOORTEN[id].topSnelheid;
      expect(marge, `${id} laat maar ${marge} px/s inloopruimte`).toBeGreaterThanOrEqual(60);
    }
  });
});

describe('groeicurve', () => {
  it('massa groeit met de halve prooimassa, gecapt op MASSA_MAX', () => {
    expect(massaNaEten(10, SOORTEN.vlokje.massa)).toBe(11); // 10 + 2×0,5
    expect(massaNaEten(998, SOORTEN.grombaars.massa)).toBe(MASSA_MAX);
  });

  it('fases slaan om op de drempels', () => {
    expect(faseVoorMassa(9)).toBe(1); // onder de start: nog steeds fase 1
    expect(faseVoorMassa(10)).toBe(1);
    expect(faseVoorMassa(29.9)).toBe(1);
    expect(faseVoorMassa(30)).toBe(2);
    expect(faseVoorMassa(80)).toBe(3);
    expect(faseVoorMassa(200)).toBe(4);
    expect(faseVoorMassa(500)).toBe(5);
    expect(faseVoorMassa(MASSA_MAX)).toBe(5);
  });

  it('radius lerpt lineair tussen de drempels en clampt aan de randen', () => {
    expect(radiusVoorMassa(10)).toBe(12);
    expect(radiusVoorMassa(5)).toBe(12); // clamp onder de start
    expect(radiusVoorMassa(20)).toBeCloseTo(14.5, 5); // 12 + 5 × (10/20)
    expect(radiusVoorMassa(30)).toBe(17);
    expect(radiusVoorMassa(80)).toBe(24);
    expect(radiusVoorMassa(200)).toBe(34);
    expect(radiusVoorMassa(500)).toBe(56);
    expect(radiusVoorMassa(MASSA_MAX)).toBe(56); // boven fase 5 blijft 56
  });

  it('radius 20 ("Grombaars-grens" uit het ontwerp) ligt bij massa ≈ 51,4', () => {
    const massa = 30 + ((20 - 17) / (24 - 17)) * (80 - 30); // ≈ 51,43
    expect(radiusVoorMassa(massa)).toBeCloseTo(20, 5);
  });

  it('maxsnelheid is constant per fase', () => {
    expect(maxSnelheidVoorMassa(10)).toBe(170);
    expect(maxSnelheidVoorMassa(51)).toBe(165);
    expect(maxSnelheidVoorMassa(500)).toBe(150);
  });

  it('aantal prooien per fasestap klopt met het ontwerp', () => {
    // Fase 1→2: 20 Vlokjes (elk +1 massa) overbruggen 10 → 30…
    let massa = 10;
    for (let i = 0; i < 20; i++) massa = massaNaEten(massa, SOORTEN.vlokje.massa);
    expect(massa).toBe(30);
    // …of 10 Stipjes (elk +2 massa).
    let viaStipjes = 10;
    for (let i = 0; i < 10; i++) viaStipjes = massaNaEten(viaStipjes, SOORTEN.stipje.massa);
    expect(viaStipjes).toBe(30);
    // Fase 2→3: 10 Flappers (elk +5) overbruggen 30 → 80.
    for (let i = 0; i < 10; i++) massa = massaNaEten(massa, SOORTEN.flapper.massa);
    expect(massa).toBe(80);
    // Fase 3→4: 8 Snappers (elk +15) overbruggen 80 → 200.
    for (let i = 0; i < 8; i++) massa = massaNaEten(massa, SOORTEN.snapper.massa);
    expect(massa).toBe(200);
    // Fase 4→5: 7 Grombaarzen (elk +45) halen de 500-drempel.
    for (let i = 0; i < 7; i++) massa = massaNaEten(massa, SOORTEN.grombaars.massa);
    expect(massa).toBeGreaterThanOrEqual(500);
  });
});

describe('kwal-straf', () => {
  it('kost 10% massa maar zakt nooit onder de fasedrempel', () => {
    expect(massaNaKwal(100)).toBe(90); // fase 3 (drempel 80): gewoon −10%
    expect(massaNaKwal(82)).toBe(80); // −10% zou 73,8 zijn → vloer op de drempel
    expect(faseVoorMassa(massaNaKwal(82))).toBe(3); // geen fase-terugval
  });
});

describe('boost-energie', () => {
  it('starten vereist minstens 10 energie', () => {
    expect(magBoostStarten(9.9)).toBe(false);
    expect(magBoostStarten(10)).toBe(true);
  });

  it('verbruikt 35/s, herstelt 20/s, geclampt op [0, 100]', () => {
    expect(nieuweEnergie(100, 1, true)).toBe(65);
    expect(nieuweEnergie(65, 1, false)).toBe(85);
    expect(nieuweEnergie(5, 1, true)).toBe(0); // clamp onder
    expect(nieuweEnergie(95, 1, false)).toBe(100); // clamp boven
  });
});

describe('config-consistentie met het ontwerp', () => {
  it('pint de soorten-tabel (§2 van DESIGN.md) letterlijk vast', () => {
    // Bewust duplicaat: dit is de wisselbeveiliging tussen DESIGN.md en
    // GameConfig.ts — wie een waarde wijzigt, moet het op drie plekken menen.
    expect(SOORTEN).toEqual({
      pijltje:      { gedrag: 'schoolvis', massa: 2,   radius: 5,  kruisSnelheid: 55, topSnelheid: 66,   score: 1,   zones: [1] },
      vlokje:       { gedrag: 'prooivis',  massa: 2,   radius: 6,  kruisSnelheid: 60, topSnelheid: 72,   score: 1,   zones: [1] },
      stipje:       { gedrag: 'schoolvis', massa: 4,   radius: 8,  kruisSnelheid: 68, topSnelheid: 81.6, score: 2,   zones: [1, 2] },
      fonkeltje:    { gedrag: 'prooivis',  massa: 4,   radius: 9,  kruisSnelheid: 68, topSnelheid: 81.6, score: 2,   zones: [4] },
      pruillip:     { gedrag: 'prooivis',  massa: 6,   radius: 10, kruisSnelheid: 72, topSnelheid: 86.4, score: 3,   zones: [1] },
      flapper:      { gedrag: 'prooivis',  massa: 10,  radius: 12, kruisSnelheid: 74, topSnelheid: 88.8, score: 5,   zones: [2, 3, 4] },
      maantje:      { gedrag: 'prooivis',  massa: 16,  radius: 14, kruisSnelheid: 76, topSnelheid: 91.2, score: 8,   zones: [2, 3] },
      zilverpijl:   { gedrag: 'schoolvis', massa: 24,  radius: 16, kruisSnelheid: 76, topSnelheid: 91.2, score: 12,  zones: [3] },
      snapper:      { gedrag: 'roofvis',   massa: 30,  radius: 17, kruisSnelheid: 70, topSnelheid: 150,  score: 15,  zones: [1, 2, 3] },
      snorrebol:    { gedrag: 'prooivis',  massa: 50,  radius: 20, kruisSnelheid: 72, topSnelheid: 86.4, score: 25,  zones: [4] },
      bolwang:      { gedrag: 'prooivis',  massa: 65,  radius: 22, kruisSnelheid: 72, topSnelheid: 86.4, score: 32,  zones: [3, 4] },
      pijlbek:      { gedrag: 'roofvis',   massa: 75,  radius: 23, kruisSnelheid: 68, topSnelheid: 152,   score: 35,  zones: [2] },
      grombaars:    { gedrag: 'roofvis',   massa: 90,  radius: 25, kruisSnelheid: 60, topSnelheid: 160,   score: 40,  zones: [3, 4] },
      prikbek:      { gedrag: 'roofvis',   massa: 253, radius: 34, kruisSnelheid: 62, topSnelheid: 148,   score: 110, zones: [3, 4] },
      diepteschrik: { gedrag: 'apex',      massa: 400, radius: 44, kruisSnelheid: 60, topSnelheid: 260,   score: 150, zones: [4] },
      hengelbek:    { gedrag: 'roofvis',   massa: 900, radius: 72, kruisSnelheid: 55, topSnelheid: 138,   score: 250, zones: [4] },
      kwal:         { gedrag: 'gevaar',    massa: 0,   radius: 14, kruisSnelheid: 0,  topSnelheid: 0,     score: 0,   zones: [2, 3, 4] },
    });
  });

  it('pint de fase-tabel (§3 van DESIGN.md) letterlijk vast', () => {
    expect(FASES).toEqual([
      { fase: 1, naam: 'Grondel',     drempel: 10,  radius: 12, maxSnelheid: 170 },
      { fase: 2, naam: 'Baars',       drempel: 30,  radius: 17, maxSnelheid: 165 },
      { fase: 3, naam: 'Makreel',     drempel: 80,  radius: 24, maxSnelheid: 160 },
      { fase: 4, naam: 'Tonijn',      drempel: 200, radius: 34, maxSnelheid: 155 },
      { fase: 5, naam: 'Reuzenbaars', drempel: 500, radius: 56, maxSnelheid: 150 },
    ]);
  });

  it('vluchtsnelheid van prooi- en schoolvissen = kruissnelheid × VLUCHT_FACTOR', () => {
    for (const soort of Object.values(SOORTEN)) {
      if (soort.gedrag === 'prooivis' || soort.gedrag === 'schoolvis') {
        expect(soort.topSnelheid).toBeCloseTo(soort.kruisSnelheid * VLUCHT_FACTOR, 5);
      }
    }
  });

  it('elke roofvis is langzamer dan de spelerfasen die hij kan opeten', () => {
    // Anders kun je bij dreiging 0 niet eens wegzwemmen van je jager. De apex
    // is de bewuste uitzondering: zijn burst is sneller, daar is boost voor
    // (zie DESIGN.md §3/§4) — die wordt in vis-moeilijkheid.test.ts gedekt.
    for (const [id, soort] of Object.entries(SOORTEN)) {
      if (soort.gedrag !== 'roofvis') continue;
      for (const fase of FASES) {
        if (!kanEten(soort.radius, fase.radius)) continue; // jaagt niet op deze fase
        expect(
          soort.topSnelheid,
          `${id} (${soort.topSnelheid}) moet langzamer zijn dan fase ${fase.fase} (${fase.maxSnelheid})`,
        ).toBeLessThan(fase.maxSnelheid);
      }
    }
  });

  it('elke fase vindt eten in een zone die hij mag betreden', () => {
    // Niet élke zone hoeft elke fase te voeden (te diep gaan als klein visje
    // hóórt gevaarlijk te zijn), maar geen enkele fase mag vastlopen.
    for (const fase of FASES) {
      const bereikbaar = ZONES.filter(
        (z) => z.nr !== AANTAL_ZONES || fase.fase >= ZONE4_EIS_FASE,
      );
      const heeftEten = bereikbaar.some((z) =>
        (Object.keys(z.gewichten) as (keyof typeof SOORTEN)[]).some(
          (id) => SOORTEN[id].gedrag !== 'gevaar' && kanEten(fase.radius, SOORTEN[id].radius),
        ),
      );
      expect(heeftEten, `fase ${fase.fase} vindt nergens eten`).toBe(true);
    }
  });

  it('elke zone voedt minstens één fase én bedreigt minstens één fase', () => {
    // Een zone waar niets te halen valt (of waar niets gevaarlijk is) is
    // verspilde wereld.
    for (const zone of ZONES) {
      const ids = Object.keys(zone.gewichten) as (keyof typeof SOORTEN)[];
      const voedt = FASES.some((f) =>
        ids.some((id) => SOORTEN[id].gedrag !== 'gevaar' && kanEten(f.radius, SOORTEN[id].radius)),
      );
      const bedreigt = FASES.some((f) =>
        ids.some(
          (id) =>
            (SOORTEN[id].gedrag === 'roofvis' || SOORTEN[id].gedrag === 'apex') &&
            kanEten(SOORTEN[id].radius, f.radius),
        ),
      );
      expect(voedt, `${zone.naam} voedt niemand`).toBe(true);
      expect(bedreigt, `${zone.naam} bedreigt niemand`).toBe(true);
    }
  });

  it('geen enkele fase is onsterfelijk: er bestaat altijd een jager', () => {
    for (const fase of FASES) {
      const jagers = Object.values(SOORTEN).filter(
        (s) => (s.gedrag === 'roofvis' || s.gedrag === 'apex') && kanEten(s.radius, fase.radius),
      );
      expect(jagers.length, `niets kan een fase-${fase.fase}-speler opeten`).toBeGreaterThan(0);
    }
    // Ook bij de maximale massa (radius blijft dan op het fase-5-niveau).
    const maxRadius = FASES[FASES.length - 1].radius;
    expect(
      Object.values(SOORTEN).some(
        (s) => (s.gedrag === 'roofvis' || s.gedrag === 'apex') && kanEten(s.radius, maxRadius),
      ),
    ).toBe(true);
  });

  it('vluchtende prooi is in te halen door de fase die hem mag eten', () => {
    for (const [id, soort] of Object.entries(SOORTEN)) {
      if (soort.gedrag !== 'prooivis' && soort.gedrag !== 'schoolvis') continue;
      const eersteFase = FASES.find((f) => kanEten(f.radius, soort.radius));
      expect(eersteFase, `${id} is voor geen enkele fase eetbaar`).toBeDefined();
      if (!eersteFase) continue;
      expect(
        soort.topSnelheid,
        `${id} vlucht sneller (${soort.topSnelheid}) dan fase ${eersteFase.fase} zwemt`,
      ).toBeLessThan(eersteFase.maxSnelheid);
    }
  });

  it('fasedrempels en zone-gewichten zijn oplopend/kloppend', () => {
    for (let i = 1; i < FASES.length; i++) {
      expect(FASES[i].drempel).toBeGreaterThan(FASES[i - 1].drempel);
      expect(FASES[i].radius).toBeGreaterThan(FASES[i - 1].radius);
    }
    for (const zone of ZONES) {
      const som = Object.values(zone.gewichten).reduce((a, b) => a + b, 0);
      expect(som).toBe(100);
    }
  });

  it('faseDrempel gooit op een onbekende fase', () => {
    expect(faseDrempel(1)).toBe(10);
    expect(() => faseDrempel(6)).toThrow();
  });

  it('de eetfactor zelf staat op 0,8', () => {
    expect(EET_FACTOR).toBe(0.8);
  });
});

// ── v3: luchtbelschild en combo (§10.2 / §10.4 van DESIGN.md) ────────────────
describe('luchtbelschild: massa na een klap', () => {
  it('zakt precies één fase terug, naar de drempel eronder', () => {
    for (let i = 1; i < FASES.length; i++) {
      const midden = (FASES[i].drempel + (FASES[i + 1]?.drempel ?? MASSA_MAX)) / 2;
      expect(faseVoorMassa(midden)).toBe(FASES[i].fase); // controle op de testopzet
      expect(massaNaKlap(midden)).toBe(FASES[i - 1].drempel);
      expect(faseVoorMassa(massaNaKlap(midden))).toBe(FASES[i].fase - 1);
    }
  });

  it('in fase 1 is de startmassa de vloer — lager kun je niet zakken', () => {
    expect(massaNaKlap(SPELER_START_MASSA)).toBe(SPELER_START_MASSA);
    expect(massaNaKlap(25)).toBe(SPELER_START_MASSA); // nog fase 1
    expect(massaNaKlap(MASSA_MAX)).toBe(FASES[FASES.length - 2].drempel);
  });

  it('een klap kost altijd massa zodra je boven fase 1 zit', () => {
    for (let i = 1; i < FASES.length; i++) {
      expect(massaNaKlap(FASES[i].drempel)).toBeLessThan(FASES[i].drempel);
    }
    // ...en nooit meer dan de fase eronder: je verliest hoogstens één stap.
    expect(massaNaKlap(FASES[4].drempel)).toBe(FASES[3].drempel);
  });

  it('de uitkomst is nooit negatief of onder de startmassa', () => {
    for (const massa of [0, 1, 9, 10, 11, 29, 30, 79, 200, 499, 500, 999]) {
      expect(massaNaKlap(massa)).toBeGreaterThanOrEqual(SPELER_START_MASSA);
    }
  });
});

describe('combo', () => {
  it('levert pas bonus vanaf de drempel', () => {
    expect(comboBonus(0)).toBe(0);
    expect(comboBonus(COMBO_MIN - 1)).toBe(0);
    expect(comboBonus(COMBO_MIN)).toBe(COMBO_BONUS);
    expect(comboBonus(COMBO_MIN + 3)).toBe(COMBO_BONUS * 4);
  });

  it('de toonhoogte stijgt mee maar wordt gecapt', () => {
    expect(comboToonStijging(COMBO_MIN - 1)).toBe(0);
    expect(comboToonStijging(COMBO_MIN)).toBe(COMBO_TOON_STAP);
    expect(comboToonStijging(1000)).toBe(COMBO_TOON_MAX);
    // monotoon niet-dalend, zodat de toon nooit terugvalt tijdens een reeks
    let vorige = 0;
    for (let c = 0; c < 40; c++) {
      const nu = comboToonStijging(c);
      expect(nu).toBeGreaterThanOrEqual(vorige);
      vorige = nu;
    }
  });
});

// ── v3: de finale (§10.6 van DESIGN.md) ─────────────────────────────────────
describe('reuzenkracht en winnen', () => {
  const maxR = FASES[FASES.length - 1].radius;
  const megaR = maxR * MEGA_FACTOR;
  const hengelbek = SOORTEN.hengelbek.radius;
  const apex = SOORTEN.diepteschrik.radius;

  it('de Hengelbek is normaal ONeetbaar en eet zelfs een volgroeide speler op', () => {
    // Dit is met opzet zo: zonder hem kan een uitgegroeide speler niet meer
    // sterven en loopt een ronde nooit af.
    expect(kanEten(maxR, hengelbek)).toBe(false);
    expect(kanEten(hengelbek, maxR)).toBe(true);
  });

  it('de Diepteschrik is wél te eten zodra je volgroeid bent — dat start de finale', () => {
    expect(kanEten(maxR, apex)).toBe(true);
    expect(kanEten(apex, maxR)).toBe(false);
    // Krap: hij mag niet per ongeluk al veel eerder eetbaar worden.
    expect(apex).toBeGreaterThan(FASES[FASES.length - 2].radius * EET_FACTOR);
  });

  it('met reuzenkracht kun je de Hengelbek wél op, en niets jou', () => {
    expect(kanEten(megaR, hengelbek)).toBe(true);
    expect(kanEten(hengelbek, megaR)).toBe(false);
    // Geen enkele soort kan een speler met reuzenkracht aan.
    for (const id of Object.keys(SOORTEN) as (keyof typeof SOORTEN)[]) {
      expect(kanEten(SOORTEN[id].radius, megaR), `${id} zou de mega-speler eten`).toBe(false);
    }
  });

  it('MEGA_FACTOR heeft marge: precies genoeg zou bij een tuningtik breken', () => {
    const nodig = hengelbek / EET_FACTOR / maxR; // = 1,607...
    expect(MEGA_FACTOR).toBeGreaterThan(nodig);
    expect(MEGA_FACTOR / nodig).toBeGreaterThan(1.1); // minstens 10% speling
  });

  it('de reuzenkracht duurt lang genoeg om de opgeroepen baas te bereiken', () => {
    // Hij spawnt op hoogstens DESPAWN_AFSTAND; bij de traagste (fase 5) snelheid
    // moet je hem binnen de tijd kunnen halen, anders is de finale onhaalbaar.
    const traagste = FASES[FASES.length - 1].maxSnelheid;
    expect(MEGA_DUUR * traagste).toBeGreaterThan(DESPAWN_AFSTAND);
  });
});
