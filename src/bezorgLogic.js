// Bezorg-Baas: pure spellogica, los van Phaser zodat vitest 'm kan testen.
//
// Nul rijdt door het Getallen-Dorp en bezorgt pakjes bij de juiste huizen.
// Elk huis heeft een vast label voor de hele ronde: óf een getal (1–9) óf een
// kort woord (max 5 letters). Een bestelling wijst een doelhuis aan en vraagt
// erom op drie manieren, oplopend in moeilijkheid:
//   niveau 1  'getal'  — "Breng naar huis 5"           (getal herkennen)
//   niveau 2  'woord'  — "Breng naar OMA"              (kort woord lezen)
//   niveau 3  'som'    — "Breng naar huis 3 + 4"       (reken-adres → 7)
//
// De huizen houden hun label de hele ronde (een huis is een huis); alleen de
// manier waarop we ernaar vragen wordt lastiger.

// Korte, kindvriendelijke woorden (max 5 letters, hoofdletters zoals in het
// Schrijf-spel). NUL is een knipoog naar de mascotte.
export const WOORDEN = [
  'MAM', 'PAP', 'OMA', 'OPA', 'NUL', 'BAL', 'VIS', 'KAT',
  'ZON', 'BOOM', 'MAAN', 'EEND', 'AAP', 'KIP', 'KOE', 'BOOT',
];

export const NIVEAU_MIN = 1;
export const NIVEAU_MAX = 3;
export const LEVERINGEN_PER_RONDE = 6;

function kies(rnd, lijst) { return lijst[Math.floor(rnd() * lijst.length)]; }
function schud(rnd, lijst) {
  const a = lijst.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Verdeel de huis-plekken over getal-huizen en woord-huizen met unieke labels.
// `aantal` = totaal aantal huizen; `woordHuizen` = hoeveel daarvan een woord
// krijgen (de rest krijgt een uniek getal 1–9).
export function labelDorp(aantal, woordHuizen, rnd = Math.random) {
  const wCount = Math.max(0, Math.min(woordHuizen, aantal));
  const getalCount = aantal - wCount;
  const getallen = schud(rnd, [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, getalCount);
  const woorden = schud(rnd, WOORDEN).slice(0, wCount);
  const labels = [
    ...getallen.map((g) => ({ kind: 'getal', getal: g })),
    ...woorden.map((w) => ({ kind: 'woord', woord: w })),
  ];
  return schud(rnd, labels); // door elkaar over de plekken
}

// Maak een bestelling voor het huidige dorp en niveau. `vorigeSlot` voorkomt
// twee keer achter elkaar hetzelfde doelhuis.
export function kiesBestelling(labels, niveau, rnd = Math.random, vorigeSlot = -1) {
  const getalSlots = labels.map((l, i) => (l.kind === 'getal' ? i : -1)).filter((i) => i >= 0);
  const woordSlots = labels.map((l, i) => (l.kind === 'woord' ? i : -1)).filter((i) => i >= 0);

  // Welke soorten adressen mogen op dit niveau?
  const soorten = ['getal'];
  if (niveau >= 2 && woordSlots.length) soorten.push('woord');
  if (niveau >= 3 && getalSlots.some((i) => labels[i].getal >= 2)) soorten.push('som');

  let poging = 0;
  while (poging++ < 40) {
    const soort = kies(rnd, soorten);
    let slot;
    if (soort === 'woord') slot = kies(rnd, woordSlots);
    else if (soort === 'som') slot = kies(rnd, getalSlots.filter((i) => labels[i].getal >= 2));
    else slot = kies(rnd, getalSlots);
    if (slot === vorigeSlot && labels.length > 1) continue;

    const l = labels[slot];
    if (soort === 'woord') {
      return { slot, soort, woord: l.woord, tekst: l.woord, spreek: l.woord };
    }
    if (soort === 'som') {
      const n = l.getal;
      const a = 1 + Math.floor(rnd() * (n - 1)); // 1..n-1
      const b = n - a;
      return { slot, soort, getal: n, a, b, tekst: `${a} + ${b}`, spreek: `${a} plus ${b}` };
    }
    return { slot, soort, getal: l.getal, tekst: String(l.getal), spreek: String(l.getal) };
  }
  // val terug op een simpel getal-adres
  const slot = getalSlots[0] ?? 0;
  return { slot, soort: 'getal', getal: labels[slot].getal, tekst: String(labels[slot].getal), spreek: String(labels[slot].getal) };
}

// Klopt de aflevering? Vergelijk het huis waar je stopte met het doelhuis.
export function isJuisteBezorging(bestelling, slot) {
  return bestelling.slot === slot;
}

// --- Adaptieve ladder (3 goed → omhoog, 2 fout → zachtjes terug) ---
export function nieuweLadder(start = 1) {
  return { niveau: Math.min(NIVEAU_MAX, Math.max(NIVEAU_MIN, start)), reeksGoed: 0, reeksFout: 0 };
}
export function ladderGoed(l) {
  const reeksGoed = l.reeksGoed + 1;
  if (reeksGoed >= 3 && l.niveau < NIVEAU_MAX) return { niveau: l.niveau + 1, reeksGoed: 0, reeksFout: 0 };
  return { niveau: l.niveau, reeksGoed, reeksFout: 0 };
}
export function ladderFout(l) {
  const reeksFout = l.reeksFout + 1;
  if (reeksFout >= 2 && l.niveau > NIVEAU_MIN) return { niveau: l.niveau - 1, reeksGoed: 0, reeksFout: 0 };
  return { niveau: l.niveau, reeksGoed: 0, reeksFout };
}

// Sterren aan het eind van een ronde: foutloos 3, een beetje 2, veel 1.
export function sterrenVoorRonde(fouten) {
  if (fouten === 0) return 3;
  if (fouten <= 2) return 2;
  return 1;
}
