// Ballon-Feest: pure spellogica, los van Phaser zodat vitest 'm kan testen.
//
// Het bord is een raster van getallen (0 = leeg, RAINBOW = regenboog-joker).
// De scene houdt daarnaast een parallel raster met sprites bij ("items");
// alle functies hier verplaatsen beide tegelijk zodat plaatje en werkelijkheid
// nooit uit de pas lopen (zelfde aanpak als de oude BalloonScene).
//
// DE KERN-FIX tegen vastlopen zit in spawnOpties(): je krijgt alléén kleine
// ballonnen. Grote getallen ontstaan alleen door zelf te versmelten, dus er
// is altijd combineerbaar materiaal op het bord.

export const COLS = 6;
export const ROWS = 8;
export const RAINBOW = -1;      // joker: versmelt met elke buur
export const PRIK_MAX = 3;      // maximaal aantal prik-ladingen
export const PRIK_LAADT_BIJ = 64; // merge-resultaat dat een prik-lading teruggeeft

export function maakBord() {
  return {
    vals: Array.from({ length: ROWS }, () => Array(COLS).fill(0)),
    items: Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
    lastDrop: null,
  };
}

// Zwaartekracht: alles zakt per kolom naar beneden. lastDrop verhuist mee,
// zodat een ketting-merge blijft "plakken" aan de plek van de laatste actie.
export function valOmlaag(state) {
  const { vals, items } = state;
  for (let c = 0; c < COLS; c++) {
    const kolomVals = [];
    const kolomItems = [];
    let dropIdx = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (vals[r][c] !== 0) {
        if (state.lastDrop && state.lastDrop.c === c && state.lastDrop.r === r) {
          dropIdx = kolomVals.length;
        }
        kolomVals.push(vals[r][c]);
        kolomItems.push(items[r][c]);
      }
    }
    for (let r = ROWS - 1, i = 0; r >= 0; r--, i++) {
      if (i < kolomVals.length) {
        vals[r][c] = kolomVals[i];
        items[r][c] = kolomItems[i];
        if (i === dropIdx) state.lastDrop = { r, c };
      } else {
        vals[r][c] = 0;
        items[r][c] = null;
      }
    }
  }
}

// Zoek een aaneengesloten groep van 2+ gelijke ballonnen (flood-fill).
// Regenbogen (negatief) doen hier niet mee: die activeren eerst via
// activeerRegenboog en worden dan een gewoon getal.
export function vindGroep(vals) {
  const seen = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  for (let r = ROWS - 1; r >= 0; r--) {
    for (let c = 0; c < COLS; c++) {
      if (vals[r][c] <= 0 || seen[r][c]) continue;
      const v = vals[r][c];
      const groep = [];
      const stack = [[r, c]];
      seen[r][c] = true;
      while (stack.length) {
        const [cr, cc] = stack.pop();
        groep.push([cr, cc]);
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nr = cr + dr, nc = cc + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS &&
              !seen[nr][nc] && vals[nr][nc] === v) {
            seen[nr][nc] = true;
            stack.push([nr, nc]);
          }
        }
      }
      if (groep.length >= 2) return { cells: groep, val: v };
    }
  }
  return null;
}

// Een groep van n ballonnen versmelt tot één: elke extra ballon verdubbelt.
// 2 gelijke -> x2, 3 -> x4, 4 -> x8 ...
export function mergeWaarde(val, aantal) {
  return val * Math.pow(2, aantal - 1);
}

// Zoek een regenboog-joker die een getal-buur heeft en geef terug welke
// waarde hij aanneemt (de HOOGSTE buurwaarde — het gulste cadeau).
// Geen buur met een getal? Dan blijft hij liggen wachten (return null).
export function activeerRegenboog(vals) {
  for (let r = ROWS - 1; r >= 0; r--) {
    for (let c = 0; c < COLS; c++) {
      if (vals[r][c] !== RAINBOW) continue;
      let best = 0;
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && vals[nr][nc] > 0) {
          best = Math.max(best, vals[nr][nc]);
        }
      }
      if (best > 0) return { r, c, val: best };
    }
  }
  return null;
}

// KERN-FIX: welke ballonnen kun je krijgen? Alleen kleintjes!
// Het plafond kruipt heel traag mee met je beste ballon (1/8e ervan),
// begint op 8 en komt nooit boven 64 uit. Kleinere waarden wegen zwaarder.
export function spawnOpties(hoogste) {
  const plafond = Math.max(8, Math.min(64, hoogste / 8));
  const opties = [];
  for (let v = 2; v <= plafond; v *= 2) {
    const gewicht = Math.max(1, Math.min(6, Math.round(plafond / v)));
    for (let i = 0; i < gewicht; i++) opties.push(v);
  }
  return opties;
}

export function kiesVolgende(hoogste, rnd = Math.random) {
  const opties = spawnOpties(hoogste);
  return opties[Math.floor(rnd() * opties.length)];
}

// Genade-regel: als het bord vol dreigt te raken (iets in de bovenste twee
// rijen, of >= 60% gevuld) én de vorige joker is minstens 6 drops geleden,
// dan komt er een regenboog-joker aan.
export function magRegenboog(vals, dropsSindsJoker) {
  if (dropsSindsJoker < 6) return false;
  let gevuld = 0;
  let hoog = false;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (vals[r][c] !== 0) {
        gevuld++;
        if (r <= 1) hoog = true;
      }
    }
  }
  return hoog || gevuld >= Math.floor(ROWS * COLS * 0.6);
}

// Een grote merge geeft een prik-lading terug (tot PRIK_MAX).
export function verdienPrik(mergeResultaat) {
  return mergeResultaat >= PRIK_LAADT_BIJ;
}

// Sterren aan het eind van een potje: 1 per 200 punten, minimaal 1,
// met een plafond zodat lange potjes de sterren-economie niet opblazen.
export function sterrenVoorScore(score) {
  return Math.max(1, Math.min(25, Math.floor(score / 200)));
}
