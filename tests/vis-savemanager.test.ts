// Tests voor de Hapvis-SaveManager (src/vis/SaveManager.ts): records,
// laatste 5 rondes, unlocks en robuustheid — met een localStorage-stub.
import { describe, it, expect } from 'vitest';
import { OPSLAG_SLEUTEL, ZONE4_EIS_FASE } from '../src/vis/GameConfig';
import { SaveManager, type OpslagAchtig, type Ronde } from '../src/vis/SaveManager';

function maakStub(): OpslagAchtig & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => {
      data.set(k, v);
    },
  };
}

function ronde(deels: Partial<Ronde> = {}): Ronde {
  return {
    score: 100,
    duurSec: 60,
    grootsteMassa: 40,
    grootsteFase: 2,
    gegeten: 12,
    datumIso: '2026-08-06T12:00:00.000Z',
    ...deels,
  };
}

describe('laden', () => {
  it('zonder data: lege save met standaardkleur en -skin', () => {
    const sm = new SaveManager(maakStub());
    const data = sm.laad();
    expect(data.hoogsteScore).toBe(0);
    expect(data.laatste5).toEqual([]);
    expect(data.gekozenKleur).toBe('oranje');
    expect(data.gekozenSkin).toBe('gewoon');
  });

  it('kapotte JSON of rare types vallen terug op de standaardwaarden', () => {
    const stub = maakStub();
    stub.data.set(OPSLAG_SLEUTEL, '{niet json');
    expect(new SaveManager(stub).laad().hoogsteScore).toBe(0);

    stub.data.set(OPSLAG_SLEUTEL, JSON.stringify({ hoogsteScore: 'veel', laatste5: 'nee' }));
    const data = new SaveManager(stub).laad();
    expect(data.hoogsteScore).toBe(0);
    expect(data.laatste5).toEqual([]);
  });

  it('zonder opslag (geen localStorage) werkt de manager in-memory', () => {
    const sm = new SaveManager(); // valt in Node terug op GeheugenOpslag
    const data = sm.registreerRonde(ronde({ score: 250 }));
    expect(data.hoogsteScore).toBe(250);
  });
});

describe('records en laatste 5', () => {
  it('records worden alleen hoger, totaalGegeten telt op', () => {
    const sm = new SaveManager(maakStub());
    sm.registreerRonde(ronde({ score: 300, duurSec: 90, grootsteMassa: 100, grootsteFase: 3, gegeten: 20 }));
    const data = sm.registreerRonde(ronde({ score: 150, duurSec: 200, grootsteMassa: 60, grootsteFase: 2, gegeten: 5 }));
    expect(data.hoogsteScore).toBe(300); // lagere score verlaagt niets
    expect(data.langsteOverlevingSec).toBe(200);
    expect(data.grootsteMassa).toBe(100);
    expect(data.grootsteFase).toBe(3);
    expect(data.meesteGegeten).toBe(20);
    expect(data.totaalGegeten).toBe(25);
  });

  it('laatste 5: nieuwste eerst, maximaal vijf', () => {
    const sm = new SaveManager(maakStub());
    for (let i = 1; i <= 7; i++) sm.registreerRonde(ronde({ score: i }));
    const data = sm.laad();
    expect(data.laatste5).toHaveLength(5);
    expect(data.laatste5.map((r) => r.score)).toEqual([7, 6, 5, 4, 3]);
  });

  it('bewaart via de opslag (herlaadbaar met een nieuwe manager)', () => {
    const stub = maakStub();
    new SaveManager(stub).registreerRonde(ronde({ score: 42 }));
    expect(new SaveManager(stub).laad().hoogsteScore).toBe(42);
  });
});

describe('vissenboek (vangst)', () => {
  it('lege save begint met een leeg boek', () => {
    expect(new SaveManager(maakStub()).laad().vangst).toEqual({});
  });

  it('telt vangsten op; een delta van 0 zet de soort alleen op ontdekt', () => {
    const sm = new SaveManager(maakStub());
    sm.registreerVangst({ vlokje: 2 });
    sm.registreerVangst({ vlokje: 2, maantje: 1 });
    expect(sm.laad().vangst).toEqual({ vlokje: 4, maantje: 1 });
    sm.registreerVangst({ hengelbek: 0 });
    expect(sm.laad().vangst.hengelbek).toBe(0);
    expect('hengelbek' in sm.laad().vangst).toBe(true);
  });

  it('een afgeronde ronde WIST het boek niet', () => {
    // Dit is de belangrijkste regressietest: laad() bouwt de save veld voor
    // veld op en bewaar() schrijft dat terug. Ontbreekt `vangst` daar, dan
    // veegt elke ronde stilletjes het hele boek leeg.
    const sm = new SaveManager(maakStub());
    sm.registreerVangst({ vlokje: 3, snapper: 1 });
    sm.registreerRonde(ronde({ score: 120 }));
    expect(sm.laad().vangst).toEqual({ vlokje: 3, snapper: 1 });
  });

  it('een oude save zonder vangst blijft gewoon werken', () => {
    const stub = maakStub();
    stub.data.set(
      OPSLAG_SLEUTEL,
      JSON.stringify({ hoogsteScore: 900, totaalGegeten: 40, gekozenKleur: 'groen' }),
    );
    const data = new SaveManager(stub).laad();
    expect(data.vangst).toEqual({});
    expect(data.hoogsteScore).toBe(900);
    expect(data.gekozenKleur).toBe('groen');
  });

  it('filtert rommel uit een kapotte vangst-tabel', () => {
    const stub = maakStub();
    const zet = (vangst: unknown) => stub.data.set(OPSLAG_SLEUTEL, JSON.stringify({ vangst }));

    zet(null);
    expect(new SaveManager(stub).laad().vangst).toEqual({});
    zet('nee');
    expect(new SaveManager(stub).laad().vangst).toEqual({});
    zet([1, 2, 3]); // array-indices mogen geen soort-id's worden
    expect(new SaveManager(stub).laad().vangst).toEqual({});
    zet({ vlokje: -3, stipje: 1.7, flapper: null, zeemeermin: 4, kwal: 2, maantje: 2 });
    expect(new SaveManager(stub).laad().vangst).toEqual({ vlokje: 0, stipje: 1, maantje: 2 });
  });
});

describe('unlocks', () => {
  it('kleuren volgen de hoogste score (500 / 2000 / 5000)', () => {
    const sm = new SaveManager(maakStub());
    expect(sm.ontgrendeldeKleuren()).toEqual(['oranje']);
    sm.registreerRonde(ronde({ score: 600 }));
    expect(sm.ontgrendeldeKleuren()).toEqual(['oranje', 'groen']);
    sm.registreerRonde(ronde({ score: 5000 }));
    expect(sm.ontgrendeldeKleuren()).toEqual(['oranje', 'groen', 'paars', 'goud']);
  });

  it('skins: Neonvisje bij 100 totaal gegeten, Stekelbaars bij 1× fase 5', () => {
    const sm = new SaveManager(maakStub());
    expect(sm.ontgrendeldeSkins()).toEqual(['gewoon']);
    sm.registreerRonde(ronde({ gegeten: 100, grootsteFase: 3 }));
    expect(sm.ontgrendeldeSkins()).toEqual(['gewoon', 'neonvisje']);
    sm.registreerRonde(ronde({ gegeten: 0, grootsteFase: 5 }));
    expect(sm.ontgrendeldeSkins()).toEqual(['gewoon', 'neonvisje', 'stekelbaars']);
  });

  it('markeerFase opent de diepte meteen, zonder op het einde van de ronde te wachten', () => {
    // Dit was een echte bug: de ontgrendeling hing aan registreerRonde, dus je
    // zag "word eerst groter" terwijl je die grootte al had.
    const sm = new SaveManager(maakStub());
    expect(sm.zone4Ontgrendeld()).toBe(false);
    const data = sm.markeerFase(ZONE4_EIS_FASE);
    expect(data.grootsteFase).toBe(ZONE4_EIS_FASE);
    expect(sm.zone4Ontgrendeld()).toBe(true);
  });

  it('markeerFase verlaagt een bestaand record nooit', () => {
    const sm = new SaveManager(maakStub());
    sm.markeerFase(5);
    sm.markeerFase(2);
    expect(sm.laad().grootsteFase).toBe(5);
  });

  it('zone 4 ontgrendelt permanent na 1× fase 4', () => {
    const sm = new SaveManager(maakStub());
    expect(sm.zone4Ontgrendeld()).toBe(false);
    sm.registreerRonde(ronde({ grootsteFase: 4 }));
    expect(sm.zone4Ontgrendeld()).toBe(true);
    sm.registreerRonde(ronde({ grootsteFase: 1 })); // latere kleine ronde
    expect(sm.zone4Ontgrendeld()).toBe(true); // blijft open
  });

  it('kiezen kan alleen wat ontgrendeld is', () => {
    const sm = new SaveManager(maakStub());
    expect(sm.kiesKleur('goud')).toBe(false);
    expect(sm.laad().gekozenKleur).toBe('oranje');
    sm.registreerRonde(ronde({ score: 5000 }));
    expect(sm.kiesKleur('goud')).toBe(true);
    expect(sm.laad().gekozenKleur).toBe('goud');
    expect(sm.kiesSkin('neonvisje')).toBe(false); // nog niet verdiend
    expect(sm.kiesSkin('gewoon')).toBe(true);
  });
});
