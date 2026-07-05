// Nul's Toverwinkel: pure spellogica, los van Phaser zodat vitest 'm kan testen.
//
// Fase 1 — de magische kern: recepten, kleuren mengen, en de brouw-check.
// De speler brouwt een drankje door de juiste aantallen ingrediënten toe te
// voegen, de kleuren te mengen (blauw + geel = groen!) en het toverwoord te
// spellen. Het "plaatje" (ketel, sterretjes, transformatie) leeft in de scene.

// Kleuren met hun hex — de primaire kleuren + de mengsels.
export const KLEUREN = {
  rood: 0xe8402c, blauw: 0x3b82f6, geel: 0xf6c624,
  groen: 0x57b947, paars: 0x9b6dd6, oranje: 0xf08a24,
  bruin: 0x8a5a2b, leeg: 0xd8c7f0,
};

// Twee kleuren mengen (volgorde maakt niet uit). Zelfde + zelfde = zichzelf;
// een onbekend paar wordt modderbruin (dat leert: niet alles mengt mooi).
export function mengKleur(a, b) {
  if (a === b) return a;
  const paar = [a, b].sort().join('+');
  const regels = {
    'blauw+rood': 'paars',
    'blauw+geel': 'groen',
    'geel+rood': 'oranje',
  };
  return regels[paar] || 'bruin';
}

// Welke kleur heeft de ketel, gegeven alle toegevoegde druppels (lijst van
// kleur-namen)? Geen druppels = leeg; één kleur = die kleur; twee = het mengsel;
// drie of meer = modder.
export function ketelKleur(druppels) {
  const uniek = [...new Set(druppels)];
  if (uniek.length === 0) return 'leeg';
  if (uniek.length === 1) return uniek[0];
  if (uniek.length === 2) return mengKleur(uniek[0], uniek[1]);
  return 'bruin';
}

// De recepten van fase 1. `klant`/`transform` sturen de tekening + het
// wonder-effect in de scene; `doelkleur` is de kleur die de ketel moet worden.
export const RECEPTEN = [
  {
    id: 'groei', naam: 'Groei-drank', klant: 'bloem', wens: 'Ik wil GROEIEN!',
    druppels: [{ kleur: 'blauw', aantal: 2 }, { kleur: 'geel', aantal: 2 }],
    sterren: 3, roer: 3, woord: 'GROEI', doelkleur: 'groen',
  },
  {
    id: 'glim', naam: 'Glim-drank', klant: 'mol', wens: 'Laat me GLIMMEN!',
    druppels: [{ kleur: 'geel', aantal: 3 }],
    sterren: 2, roer: 2, woord: 'GLIM', doelkleur: 'geel',
  },
  {
    id: 'slaap', naam: 'Slaap-drank', klant: 'egel', wens: 'Ik wil SLAPEN…',
    druppels: [{ kleur: 'blauw', aantal: 2 }, { kleur: 'rood', aantal: 1 }],
    sterren: 2, roer: 4, woord: 'SLAAP', doelkleur: 'paars',
  },
  {
    id: 'vlieg', naam: 'Vlieg-drank', klant: 'muis', wens: 'Ik wil VLIEGEN!',
    druppels: [{ kleur: 'rood', aantal: 2 }, { kleur: 'geel', aantal: 1 }],
    sterren: 3, roer: 2, woord: 'VLIEG', doelkleur: 'oranje',
  },
];

export function receptById(id) {
  return RECEPTEN.find((r) => r.id === id) || null;
}

// Kies een recept (niet twee keer achter elkaar hetzelfde). Niveau mag later
// de moeilijkere recepten ontsluiten; in fase 1 zijn ze allemaal beschikbaar.
export function kiesRecept(rnd = Math.random, vorigId = null) {
  const opties = RECEPTEN.filter((r) => r.id !== vorigId);
  const lijst = opties.length ? opties : RECEPTEN;
  return lijst[Math.floor(rnd() * lijst.length)];
}

// Alle druppels van een recept als platte lijst kleur-namen (voor ketelKleur).
export function receptDruppels(recept) {
  return recept.druppels.flatMap((d) => Array(d.aantal).fill(d.kleur));
}

// Is de brouw klaar? `staat` = { druppels:{kleur:aantal}, sterren, roer, gespeld }.
export function brouwStatus(recept, staat) {
  const druppelsOk = recept.druppels.every((d) => (staat.druppels[d.kleur] || 0) >= d.aantal);
  const sterrenOk = (staat.sterren || 0) >= recept.sterren;
  const roerOk = (staat.roer || 0) >= recept.roer;
  const woordOk = (staat.gespeld || 0) >= recept.woord.length;
  return { druppelsOk, sterrenOk, roerOk, woordOk, klaar: druppelsOk && sterrenOk && roerOk && woordOk };
}

// --- Adaptieve ladder (voor latere fasen; hier alvast getest) ---
export function nieuweLadder(start = 1) {
  return { niveau: Math.max(1, Math.min(4, start)), reeksGoed: 0 };
}
export function ladderGoed(l) {
  const reeksGoed = l.reeksGoed + 1;
  if (reeksGoed >= 3 && l.niveau < 4) return { niveau: l.niveau + 1, reeksGoed: 0 };
  return { niveau: l.niveau, reeksGoed };
}
