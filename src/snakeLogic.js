// Tel-Slang: pure telbare logica, los van Three.js zodat vitest 'm kan testen.
//
// De slang ÍS het getal: langer worden = hoger tellen naar 100. Dit bestand
// levert de "getallen"-kant: tiental-momenten, tel-hints, cijfer-voer,
// bestellingen ("eet de 7"), missies en de faal-vriendelijke krimp.

export const TIENTAL_NAMEN = [
  'TIEN!', 'TWINTIG!', 'DERTIG!', 'VEERTIG!', 'VIJFTIG!',
  'ZESTIG!', 'ZEVENTIG!', 'TACHTIG!', 'NEGENTIG!', 'HONDERD!!!',
];
export const TIENTAL_WOORD = [
  'TIEN', 'TWINTIG', 'DERTIG', 'VEERTIG', 'VIJFTIG',
  'ZESTIG', 'ZEVENTIG', 'TACHTIG', 'NEGENTIG', 'HONDERD',
];

// Welke tientallen zijn gepasseerd toen de slang van `oud` naar `nieuw` groeide
// (elk tiental hoogstens één keer). Bv. 8 -> 21 => [10, 20].
export function gepasseerdeTientallen(oud, nieuw) {
  const uit = [];
  const start = Math.floor(oud / 10) * 10 + 10;
  for (let t = Math.max(10, start); t <= nieuw; t += 10) uit.push(t);
  return uit;
}

// Naam bij een tiental-getal (10 -> 'TIEN!'). Buiten 10..100 => "<n>!".
export function tientalNaam(n) {
  if (n >= 10 && n <= 100 && n % 10 === 0) return TIENTAL_NAMEN[n / 10 - 1];
  return `${n}!`;
}

// "Nog X tot TWINTIG": alleen als je binnen 3 van het volgende tiental (t/m 100)
// zit. Anders null.
export function telHint(lengte) {
  const volgend = (Math.floor(lengte / 10) + 1) * 10;
  const rest = volgend - lengte;
  if (volgend >= 10 && volgend <= 100 && rest >= 1 && rest <= 3) {
    return { rest, doel: volgend, woord: TIENTAL_WOORD[volgend / 10 - 1] };
  }
  return null;
}

// Aandeel van de getallenlijn (0..1) dat gevuld is bij deze lengte.
export function getallenlijnFractie(lengte, max = 100) {
  return Math.max(0, Math.min(1, lengte / max));
}

// Cijfer-voer: meestal 1, soms 2, af en toe 3 (eten wordt optellen).
export function voerWaarde(rnd = Math.random) {
  const r = rnd();
  if (r < 0.7) return 1;
  if (r < 0.92) return 2;
  return 3;
}

// Bestelling "eet de N": doelcijfer + afleiders (1..9, allemaal uniek, gehusseld).
export function maakBestelling(rnd = Math.random, aantalAfleiders = 2) {
  const doel = 1 + Math.floor(rnd() * 9);
  const opties = [doel];
  let veilig = 0;
  while (opties.length < 1 + aantalAfleiders && veilig++ < 50) {
    const a = 1 + Math.floor(rnd() * 9);
    if (!opties.includes(a)) opties.push(a);
  }
  for (let i = opties.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [opties[i], opties[j]] = [opties[j], opties[i]];
  }
  return { doel, opties };
}

// Faal-vriendelijk: bij botsing met een grotere slang word je korter i.p.v.
// dood (verlies segmenten, maar nooit onder een minimum).
export function krimpBijBotsing(lengte, verlies = 5, min = 3) {
  return Math.max(min, lengte - verlies);
}

// --- Missies: korte doelen die richting en beloning geven (geen game-over) ---
export const MISSIES = [
  { type: 'groei', doel: 10, tekst: 'Groei naar 10!' },
  { type: 'nullen', doel: 1, tekst: 'Vang een Gouden Nul ⭕' },
  { type: 'groei', doel: 25, tekst: 'Word een regenboog-slang! (25)' },
  { type: 'groei', doel: 50, tekst: 'Groei naar 50!' },
  { type: 'nullen', doel: 3, tekst: 'Vang 3 Gouden Nullen ⭕' },
  { type: 'groei', doel: 100, tekst: 'Haal de HONDERD! 🏆' },
];

export function missieVoortgang(missie, staat) {
  const huidig = missie.type === 'nullen' ? (staat.nullenDezeMissie || 0) : Math.floor(staat.lengte || 0);
  return { huidig: Math.min(huidig, missie.doel), doel: missie.doel, klaar: huidig >= missie.doel };
}

export function volgendeMissie(index) {
  return index < MISSIES.length ? MISSIES[index] : null;
}
