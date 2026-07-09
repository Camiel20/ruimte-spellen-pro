// ===== LETTER-LAND · WOORD-MAGIE — pure logica =====
// De kern van Letter-Land: bij een SPEL-PLEK sleep/tik je letters in vakjes tot
// ze op volgorde het doelwoord vormen — dan "gebeurt" het woord (de zon schijnt,
// een mat rolt uit, een bel rinkelt). Deze module bevat alleen de telbare/
// testbare logica; het tekenwerk zit in PraatweideScene.js (unit-getest, geen
// Phaser hier).

// Klopt deze letter voor dít vakje (positie index) van het woord?
export function letterKlopt(woord, index, letter) {
  return index >= 0 && index < woord.length && woord[index] === letter;
}

// Het eerste nog-lege vakje (waar de volgende letter in moet). -1 = woord vol.
export function volgendeVak(slots, woordLengte) {
  for (let i = 0; i < woordLengte; i++) if (slots[i] == null) return i;
  return -1;
}

// Is het woord af en correct gespeld?
export function woordAf(slots, woord) {
  if (slots.length !== woord.length) return false;
  return slots.every((l, i) => l === woord[i]);
}

// De letters die je nodig hebt (met dubbelen), geschud voor de letter-bak.
export function benodigdeLetters(woord) {
  return [...woord];
}

export function schud(arr, rng = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// De woorden van missie 1 "De Grijze Ochtend". Elk is tekenbaar en 3 letters.
// (De effecten/posities staan in de scene; dit is de leerlijn-data.)
export const M1_WOORDEN = ['zon', 'mat', 'bel', 'sok'];
