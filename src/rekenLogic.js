// Reken-Raket: pure spellogica, los van Phaser zodat vitest 'm kan testen.
//
// Dit is het pedagogische hart: de adaptieve ladder (groep 3-leerlijn),
// de som-generators per niveau, plausibele afleiders, de nul-sommen
// (gouden nullen) en de hoogte/bestemmingen-economie.

export const NIVEAU_MIN = 1;
export const NIVEAU_MAX = 7;

// De leerlijn (groep 3): elk niveau één somtype.
// N7 is de "nul-magie": dezelfde kleine som, maar met steeds meer nullen.
export const NIVEAU_INFO = {
  1: 'plus/min 1 en 0, tot 5',
  2: 'optellen tot 10',
  3: 'aftrekken tot 10',
  4: 'dubbelen',
  5: 'tot 20, zonder tientalsprong',
  6: 'tot 20, met tientalsprong',
  7: 'nul-magie (grote ronde getallen)',
};

function tussen(rnd, min, max) { // willekeurig geheel getal, grenzen inclusief
  return min + Math.floor(rnd() * (max - min + 1));
}

// Eén som voor het gegeven niveau. Antwoorden zijn altijd >= 0.
export function maakSom(niveau, rnd = Math.random) {
  let a, b, op = '+';
  switch (niveau) {
    case 1: { // erbij/eraf met 0 of 1, klein en veilig
      b = tussen(rnd, 0, 1);
      if (rnd() < 0.5) { op = '+'; a = tussen(rnd, 1, 5 - b); }
      else { op = '-'; a = tussen(rnd, Math.max(1, b), 5); }
      break;
    }
    case 2: { // optellen t/m 10
      a = tussen(rnd, 1, 9);
      b = tussen(rnd, 1, 10 - a);
      break;
    }
    case 3: { // aftrekken t/m 10
      op = '-';
      a = tussen(rnd, 2, 10);
      b = tussen(rnd, 1, a - 1);
      break;
    }
    case 4: { // dubbelen (het feest-niveau)
      a = tussen(rnd, 2, 10);
      b = a;
      break;
    }
    case 5: { // t/m 20 zonder tientaloverschrijding
      if (rnd() < 0.5) {
        op = '+';
        a = tussen(rnd, 11, 18);
        const ruimte = 9 - (a % 10);
        b = tussen(rnd, 1, Math.max(1, ruimte));
      } else {
        op = '-';
        a = tussen(rnd, 12, 19);
        b = tussen(rnd, 1, a % 10 || 1);
      }
      break;
    }
    case 6: { // t/m 20 mét overschrijding (8+7, 15-8)
      if (rnd() < 0.5) {
        op = '+';
        a = tussen(rnd, 6, 9);
        b = tussen(rnd, 11 - a, 9);
      } else {
        op = '-';
        a = tussen(rnd, 11, 18);
        b = tussen(rnd, (a % 10) + 1, 9);
      }
      break;
    }
    default: { // 7: nul-magie — kleine som maal 10/100/1000
      const k = tussen(rnd, 1, 3);
      const schaal = Math.pow(10, k);
      if (rnd() < 0.6) {
        const c = tussen(rnd, 1, 9);
        const d = tussen(rnd, 1, 10 - c);
        a = c * schaal; b = d * schaal;
      } else {
        op = '-';
        const c = tussen(rnd, 2, 10);
        const d = tussen(rnd, 1, c - 1);
        a = c * schaal; b = d * schaal;
      }
    }
  }
  const antwoord = op === '+' ? a + b : a - b;
  return { a, b, op, antwoord, isNulSom: false };
}

// Nul-som: laat zien dat nul niks verandert (a+0, a-0) of alles (a-a=0).
// Goed beantwoord = een gouden nul. Schaal groeit mee met het niveau.
export function maakNulSom(niveau, rnd = Math.random) {
  const schaal = niveau >= 7 ? Math.pow(10, tussen(rnd, 1, 3)) : 1;
  const basis = tussen(rnd, 1, niveau >= 5 ? 10 : 5) * schaal;
  const vorm = tussen(rnd, 0, 2);
  if (vorm === 0) return { a: basis, b: 0, op: '+', antwoord: basis, isNulSom: true };
  if (vorm === 1) return { a: basis, b: 0, op: '-', antwoord: basis, isNulSom: true };
  return { a: basis, b: basis, op: '-', antwoord: 0, isNulSom: true };
}

function cijferdraai(n) {
  const s = String(n);
  const omgekeerd = Number(s.split('').reverse().join(''));
  return omgekeerd;
}

// Twee plausibele afleiders: dichtbij genoeg om te moeten nadenken,
// nooit negatief, nooit gelijk aan het antwoord of aan elkaar.
export function maakAfleiders(antwoord, rnd = Math.random) {
  const kand = [];
  if (antwoord >= 100) {
    // nul-magie: verleid met een nul te veel of te weinig
    kand.push(antwoord * 10);
    if (antwoord % 10 === 0) kand.push(antwoord / 10);
    const m = Math.pow(10, String(antwoord).length - 1);
    kand.push(antwoord + m);
    if (antwoord - m > 0) kand.push(antwoord - m);
  } else {
    kand.push(antwoord + 1, antwoord + 2);
    if (antwoord - 1 >= 0) kand.push(antwoord - 1);
    if (antwoord - 2 >= 0) kand.push(antwoord - 2);
    const draai = cijferdraai(antwoord);
    if (antwoord >= 10 && draai !== antwoord) kand.push(draai);
  }
  const uniek = [...new Set(kand)].filter((k) => k !== antwoord && k >= 0);
  // husselen (Fisher-Yates met de meegegeven rnd, voor testbaarheid)
  for (let i = uniek.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [uniek[i], uniek[j]] = [uniek[j], uniek[i]];
  }
  while (uniek.length < 2) uniek.push(antwoord + 3 + uniek.length);
  return uniek.slice(0, 2);
}

// ---------------------------------------------------------- adaptieve ladder
// 3 goed op rij -> stilletjes een niveau omhoog; 2 fout na elkaar -> zachtjes
// terug. Geen UI-drama: het kind merkt alleen dat het "precies goed" blijft.

export function nieuweLadder(startNiveau = 1) {
  const niveau = Math.min(NIVEAU_MAX, Math.max(NIVEAU_MIN, startNiveau));
  return { niveau, reeksGoed: 0, reeksFout: 0 };
}

export function ladderGoed(l) {
  const reeksGoed = l.reeksGoed + 1;
  if (reeksGoed >= 3 && l.niveau < NIVEAU_MAX) {
    return { niveau: l.niveau + 1, reeksGoed: 0, reeksFout: 0 };
  }
  return { niveau: l.niveau, reeksGoed, reeksFout: 0 };
}

export function ladderFout(l) {
  const reeksFout = l.reeksFout + 1;
  if (reeksFout >= 2 && l.niveau > NIVEAU_MIN) {
    return { niveau: l.niveau - 1, reeksGoed: 0, reeksFout: 0 };
  }
  return { niveau: l.niveau, reeksGoed: 0, reeksFout };
}

// ------------------------------------------------------- hoogte & beloningen

// Meters per goede som; turbo (snel antwoord) verdubbelt. Nooit straf.
export function metersVoorGoed(niveau, turbo = false) {
  return (30 + niveau * 10) * (turbo ? 2 : 1);
}

export const TURBO_MS = 4500; // sneller dan dit = turbo-boost

export const BESTEMMINGEN = [
  { naam: 'de Grote Wolk', icoon: '☁️', hoogte: 400 },
  { naam: 'de Maan', icoon: '🌙', hoogte: 1500, medal: 'math_easy' },
  { naam: 'Mars', icoon: '🔴', hoogte: 3000 },
  { naam: 'Saturnus', icoon: '🪐', hoogte: 6000, medal: 'math_medium' },
  { naam: 'de Melkweg', icoon: '🌌', hoogte: 10000, medal: 'math_hard' },
];

// Welke bestemmingen zijn met deze vlucht (van->tot meter) NIEUW bereikt?
export function nieuweBestemmingen(van, tot) {
  return BESTEMMINGEN.filter((b) => van < b.hoogte && tot >= b.hoogte);
}

// De volgende bestemming boven deze hoogte (of null als alles bereikt is).
export function volgendeBestemming(hoogte) {
  return BESTEMMINGEN.find((b) => b.hoogte > hoogte) || null;
}

export const SOMMEN_PER_VLUCHT = 10;
export const NULPLANEET_NODIG = 5; // gouden nullen voor de geheime planeet

export function sterrenVoorVlucht(fouten) {
  if (fouten === 0) return 3;
  if (fouten <= 2) return 2;
  return 1;
}
