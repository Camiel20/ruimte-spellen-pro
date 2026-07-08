// ===== ALFA-BLOKKEN — PURE WOORD-LOGICA (geen Phaser) =====
// Het schrijfspel "Alfa-Blokken": schrijf woorden in KLEINE letters, letter
// voor letter; elke letter komt tot leven als blok-figuurtje en samen vormen
// ze het woord (Alphablocks-stijl). De werelden lopen op in woordlengte.
//
// Deze module is bewust Phaser-vrij zodat de woord-data 1:1 getest kan worden
// (zie tests/alfa.test.js): elke letter moet een klein-letter overtrek-pad
// hebben, elk woord moet bij de wereldlengte passen en elk icoon moet bestaan.

import { LOWER_PATHS } from './glyphs.js';

// Woord-werelden, oplopende lengte. `icoon` = teken-id in src/alfaIconen.js.
// Woorden zijn kort, klankzuiver en goed te tekenen (geen dubbelklanken die
// een beginnende lezer verwarren).
export const WERELDEN = [
  {
    id: 'w1', naam: 'Korte Woordjes', lengte: 3,
    top: 0x8fd3ff, bottom: 0x8ed36b,
    woorden: [
      { w: 'aap', icoon: 'aap' },
      { w: 'zon', icoon: 'zon' },
      { w: 'vis', icoon: 'vis' },
      { w: 'bus', icoon: 'bus' },
      { w: 'pen', icoon: 'pen' },
      { w: 'bal', icoon: 'bal' },
      { w: 'kat', icoon: 'kat' },
      { w: 'jas', icoon: 'jas' },
    ],
    reward: { title: 'Wereld 1 uitgeschreven! 🏆', stars: 5, medal: 'alfa_w1', medalLabel: 'Woord-Bouwer' },
  },
];

export function letters(woord) { return woord.split(''); }

// De klank die een letter maakt bij het 'blenden' (Alphablocks-stijl). Bewust
// simpel: de meest voorkomende klank. Wordt straks door de stem gebruikt; de
// fijn-afstemming per woord (korte/lange klinker) kan later.
export const KLANKEN = {
  a: 'a', b: 'buh', c: 'kuh', d: 'duh', e: 'e', f: 'ff', g: 'chg', h: 'hh',
  i: 'i', j: 'juh', k: 'kuh', l: 'll', m: 'mm', n: 'nn', o: 'o', p: 'puh',
  q: 'kwuh', r: 'rr', s: 'ss', t: 'tuh', u: 'u', v: 'vv', w: 'wuh',
  x: 'ks', y: 'ij', z: 'zz',
};

// Controleer de woord-data op ontwerpfouten (zoals de level-validator van
// Getallen-Land). `iconenIds` = de set beschikbare teken-ids uit alfaIconen.
export function valideerWerelden(iconenIds) {
  const errors = [];
  const iconen = new Set(iconenIds || []);
  const err = (m) => errors.push(m);

  WERELDEN.forEach((W) => {
    if (!W.id) err('wereld mist een id');
    if (!W.lengte || W.lengte < 2) err(`[${W.id}] ongeldige woordlengte`);
    if (!Array.isArray(W.woorden) || W.woorden.length === 0) { err(`[${W.id}] heeft geen woorden`); return; }
    W.woorden.forEach(({ w, icoon }) => {
      if (typeof w !== 'string' || !w) { err(`[${W.id}] leeg woord`); return; }
      if (w.length !== W.lengte) err(`[${W.id}] "${w}" is ${w.length} letters, wereld vraagt ${W.lengte}`);
      if (w !== w.toLowerCase()) err(`[${W.id}] "${w}" is niet volledig kleine letters`);
      for (const ch of w) {
        if (!LOWER_PATHS[ch]) err(`[${W.id}] "${w}": letter '${ch}' heeft geen klein-letter pad`);
      }
      if (!iconen.has(icoon)) err(`[${W.id}] "${w}": icoon '${icoon}' bestaat niet in alfaIconen`);
    });
  });
  return errors;
}
