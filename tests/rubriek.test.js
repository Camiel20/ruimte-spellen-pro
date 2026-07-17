// Bewaakt de ANTI-HERHALING-RUBRIEK (los van de speelbaarheids-validator).
// Doel: de "poort-muur-gang" doorbreken — max één zwaar poort-station per level,
// zodat de reken-truc een hoogtepunt is en niet de hele ruggengraat.
//
// De rubriek wordt PER REWORK-GOLF aangezet: alleen al-herschreven levels worden
// hier hard afgedwongen, zodat de CI-gate groen blijft terwijl we incrementeel
// alle 19 werelden herschrijven. Voeg level-ids toe zodra een wereld herschreven
// is. Einddoel: alle levels in deze lijst.
import { describe, it, expect } from 'vitest';
import { rubriekViolations, zwarePoortenIn } from '../src/adventure/logic.js';
import { LEVELS } from '../src/levels/index.js';

// Al herschreven volgens de rubriek (2026-07: W18 Onder-Nul + W19 Spook-Slot).
const HERSCHREVEN = [
  '18-1', '18-2', '18-3', '18-4',
  '19-1', '19-2', '19-3', '19-4',
];

describe('anti-herhaling-rubriek', () => {
  for (const id of HERSCHREVEN) {
    const L = LEVELS.find((l) => l.id === id);
    it(`level ${id} voldoet aan de rubriek (max 1 zwaar poort-station)`, () => {
      expect(L, `level ${id} moet bestaan`).toBeTruthy();
      expect(rubriekViolations(L)).toEqual([]);
    });
  }

  // Voortgangs-indicator (faalt niet): hoeveel nog-niet-herschreven levels
  // stapelen meerdere poort-stations? Handig dashboard tijdens de rework.
  it('rapporteert de resterende rubriek-schulden (informatief)', () => {
    const schuld = LEVELS
      .filter((l) => !HERSCHREVEN.includes(l.id))
      .filter((l) => zwarePoortenIn(l).length > 1)
      .map((l) => `${l.id}: ${zwarePoortenIn(l).join('+')}`);
    // eslint-disable-next-line no-console
    console.info(`[rubriek] nog te herschrijven (>1 poort-station): ${schuld.length}\n  ${schuld.join('\n  ')}`);
    expect(Array.isArray(schuld)).toBe(true);
  });
});
