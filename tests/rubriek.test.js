// Bewaakt de ANTI-HERHALING-RUBRIEK (los van de speelbaarheids-validator).
// Doel: de "poort-muur-gang" doorbreken — max één zwaar poort-station per level,
// zodat de reken-truc een hoogtepunt is en niet de hele ruggengraat.
//
// Sinds 2026-07-18 GLOBAAL afgedwongen: ALLE levels moeten voldoen (de 5
// gate-stapelaars 11-3/14-4/14-5/15-4/16-5 zijn opgeschoond). Een nieuw of
// gewijzigd level dat twee tel-stations stapelt, laat deze test — en dus de
// deploy-gate — meteen falen.
import { describe, it, expect } from 'vitest';
import { rubriekViolations, zwarePoortenIn } from '../src/adventure/logic.js';
import { LEVELS } from '../src/levels/index.js';

describe('anti-herhaling-rubriek', () => {
  for (const L of LEVELS) {
    it(`level ${L.id} voldoet aan de rubriek (max 1 zwaar poort-station)`, () => {
      expect(rubriekViolations(L)).toEqual([]);
    });
  }

  it('geen enkel level stapelt meerdere tel-stations', () => {
    const schuld = LEVELS.filter((l) => zwarePoortenIn(l).length > 1).map((l) => l.id);
    expect(schuld).toEqual([]);
  });
});
