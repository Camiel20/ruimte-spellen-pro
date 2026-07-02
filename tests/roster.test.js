// Dorps-roster: pure afleiding "wie is gered" uit leveldata + voortgang.
import { describe, it, expect } from 'vitest';
import { ROSTER, rescuedFrom, rescueInfo } from '../src/adventure/roster.js';
import { WORLD1 } from '../src/levels/world1.js';
import { WORLD2 } from '../src/levels/world2.js';

const LEVELS = [...WORLD1, ...WORLD2];

const FAKE = [
  { id: 'a-1', rescues: [{ doel: 2, name: 'Twee' }] },
  { id: 'a-2', rescues: [{ doel: 3, name: 'Drie' }, { doel: 4, name: 'Vier' }] },
  { id: 'a-3' }, // level zonder reddingen
];

describe('roster', () => {
  it('Één woont er altijd al (dat ben jij)', () => {
    expect(rescuedFrom(FAKE, () => false).has(1)).toBe(true);
  });

  it('level gehaald ⇒ zijn vriendjes zijn gered (ook meerdere per level)', () => {
    const done = new Set(['a-2']);
    const s = rescuedFrom(FAKE, (id) => done.has(id));
    expect(s.has(3)).toBe(true);
    expect(s.has(4)).toBe(true);
    expect(s.has(2)).toBe(false); // a-1 nog niet gehaald
  });

  it('rescueInfo wijst naar het juiste level', () => {
    expect(rescueInfo(FAKE, 3)).toEqual({ id: 'a-2', name: 'Drie' });
    expect(rescueInfo(FAKE, 9)).toBeNull();
  });

  it('echte leveldata: elk roster-getal is te redden, ben je zelf, of is bewust "komt later"', () => {
    const later = [];
    for (const n of ROSTER) {
      if (n === 1) continue; // jijzelf
      if (!rescueInfo(LEVELS, n)) later.push(n);
    }
    // Nu nog niet te redden: 8 en 10 (haakjes voor Wereld 3+). Voeg je een
    // redding toe, dan hoort dit lijstje te krimpen — pas de test dan aan.
    expect(later).toEqual([8, 10]);
  });
});
