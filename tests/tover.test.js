// Tests voor de Toverwinkel-logica (src/toverLogic.js).
import { describe, it, expect } from 'vitest';
import {
  KLEUREN, RECEPTEN, mengKleur, ketelKleur, receptById, kiesRecept,
  receptDruppels, brouwStatus, nieuweLadder, ladderGoed,
} from '../src/toverLogic.js';

describe('mengKleur', () => {
  it('mengt de primaire kleuren goed (volgorde maakt niet uit)', () => {
    expect(mengKleur('blauw', 'geel')).toBe('groen');
    expect(mengKleur('geel', 'blauw')).toBe('groen');
    expect(mengKleur('blauw', 'rood')).toBe('paars');
    expect(mengKleur('rood', 'geel')).toBe('oranje');
  });
  it('zelfde + zelfde = zichzelf', () => {
    expect(mengKleur('rood', 'rood')).toBe('rood');
  });
  it('een raar mengsel wordt bruin', () => {
    expect(mengKleur('groen', 'oranje')).toBe('bruin');
  });
});

describe('ketelKleur', () => {
  it('leeg zonder druppels', () => {
    expect(ketelKleur([])).toBe('leeg');
  });
  it('één kleur blijft die kleur', () => {
    expect(ketelKleur(['geel', 'geel', 'geel'])).toBe('geel');
  });
  it('twee kleuren mengen live', () => {
    expect(ketelKleur(['blauw', 'blauw', 'geel', 'geel'])).toBe('groen');
    expect(ketelKleur(['blauw', 'rood'])).toBe('paars');
  });
  it('drie of meer kleuren wordt modder', () => {
    expect(ketelKleur(['rood', 'blauw', 'geel'])).toBe('bruin');
  });
});

describe('recepten', () => {
  it('elk recept heeft een hoofdletter-woord en geldige kleuren', () => {
    RECEPTEN.forEach((r) => {
      expect(r.woord).toBe(r.woord.toUpperCase());
      expect(r.woord.length).toBeGreaterThanOrEqual(3);
      r.druppels.forEach((d) => expect(KLEUREN[d.kleur]).toBeDefined());
      expect(KLEUREN[r.doelkleur]).toBeDefined();
    });
  });
  it('de doelkleur klopt met het mengsel van de druppels', () => {
    RECEPTEN.forEach((r) => {
      expect(ketelKleur(receptDruppels(r))).toBe(r.doelkleur);
    });
  });
  it('receptById vindt en mist correct', () => {
    expect(receptById('groei').naam).toBe('Groei-drank');
    expect(receptById('bestaatniet')).toBe(null);
  });
  it('kiesRecept geeft niet twee keer hetzelfde achter elkaar', () => {
    let vorig = null;
    for (let i = 0; i < 30; i++) {
      const r = kiesRecept(Math.random, vorig);
      expect(r.id).not.toBe(vorig);
      vorig = r.id;
    }
  });
});

describe('brouwStatus', () => {
  const groei = receptById('groei'); // 2 blauw, 2 geel, 3 sterren, 3 roer, GROEI(5)

  it('nog niet klaar bij een lege ketel', () => {
    const s = brouwStatus(groei, { druppels: {}, sterren: 0, roer: 0, gespeld: 0 });
    expect(s.klaar).toBe(false);
    expect(s.druppelsOk).toBe(false);
  });

  it('klaar als alle stappen gehaald zijn', () => {
    const s = brouwStatus(groei, { druppels: { blauw: 2, geel: 2 }, sterren: 3, roer: 3, gespeld: 5 });
    expect(s).toMatchObject({ druppelsOk: true, sterrenOk: true, roerOk: true, woordOk: true, klaar: true });
  });

  it('één ontbrekende stap blokkeert de brouw', () => {
    const bijna = { druppels: { blauw: 2, geel: 2 }, sterren: 3, roer: 3, gespeld: 4 };
    expect(brouwStatus(groei, bijna).klaar).toBe(false);
    expect(brouwStatus(groei, bijna).woordOk).toBe(false);
  });

  it('meer dan genoeg mag ook (>=)', () => {
    const s = brouwStatus(groei, { druppels: { blauw: 3, geel: 2 }, sterren: 5, roer: 9, gespeld: 5 });
    expect(s.klaar).toBe(true);
  });
});

describe('ladder', () => {
  it('3 goed → niveau omhoog, gecapt op 4', () => {
    let l = nieuweLadder(1);
    l = ladderGoed(ladderGoed(ladderGoed(l)));
    expect(l.niveau).toBe(2);
    let hoog = nieuweLadder(4);
    for (let i = 0; i < 6; i++) hoog = ladderGoed(hoog);
    expect(hoog.niveau).toBe(4);
  });
});
