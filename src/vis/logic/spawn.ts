// Hapvis — spawnlogica: waar en wat er spawnt. Pure functies met een
// injecteerbare rng (deterministisch testbaar). Geen Phaser.

import {
  DESPAWN_AFSTAND,
  SCHERM_B,
  SCHERM_H,
  SCHOOL_SPAWN_N,
  SCHOOL_SPAWN_STRAAL,
  SPAWN_MARGE,
  SPAWN_POGINGEN,
  WERELD_B,
  WERELD_H,
  ZONE_HOOGTE,
  AANTAL_ZONES,
  type SoortId,
} from '../GameConfig';
import { spawnGewichten } from './moeilijkheid';

/** Random-generator: geeft een getal in [0, 1). Injecteerbaar voor tests. */
export type Rng = () => number;

export interface Punt {
  x: number;
  y: number;
}

/** Minimale spawnafstand (px) tot het cameracentrum: halve schermdiagonaal + marge. */
export function minSpawnAfstand(): number {
  return Math.sqrt(SCHERM_B * SCHERM_B + SCHERM_H * SCHERM_H) / 2 + SPAWN_MARGE;
}

/** Zonenummer (1..AANTAL_ZONES) voor een diepte y (px), geclampt op de wereld. */
export function zoneVoorY(y: number): number {
  return Math.min(AANTAL_ZONES, Math.max(1, Math.floor(y / ZONE_HOOGTE) + 1));
}

/** Geldig spawnpunt: in de ring [minSpawnAfstand, DESPAWN_AFSTAND] én binnen de wereld. */
export function isGeldigSpawnPunt(p: Punt, camCentrum: Punt): boolean {
  const dx = p.x - camCentrum.x;
  const dy = p.y - camCentrum.y;
  const afstand = Math.sqrt(dx * dx + dy * dy);
  return (
    afstand >= minSpawnAfstand() &&
    afstand <= DESPAWN_AFSTAND &&
    p.x >= 0 &&
    p.x <= WERELD_B &&
    p.y >= 0 &&
    p.y <= WERELD_H
  );
}

/**
 * Kies een spawnpunt in de ring buiten beeld. Probeert SPAWN_POGINGEN keer;
 * null als er (in extreme hoeken van de wereld) geen geldig punt gevonden is.
 */
export function kiesSpawnPunt(camCentrum: Punt, rng: Rng): Punt | null {
  const min = minSpawnAfstand();
  for (let i = 0; i < SPAWN_POGINGEN; i++) {
    const hoek = rng() * 2 * Math.PI;
    const afstand = min + rng() * (DESPAWN_AFSTAND - min);
    const p = {
      x: camCentrum.x + Math.cos(hoek) * afstand,
      y: camCentrum.y + Math.sin(hoek) * afstand,
    };
    if (isGeldigSpawnPunt(p, camCentrum)) return p;
  }
  return null;
}

/**
 * Trek één soort uit een gewichtentabel (roulettewiel). Apart van `kiesSoort`
 * zodat de gebeurtenissen (§10.3) hun eigen tabel kunnen aanleveren zonder deze
 * trekking te dupliceren.
 */
export function kiesUitGewichten(
  gewichten: Partial<Record<SoortId, number>>,
  rng: Rng,
): SoortId {
  const ids = Object.keys(gewichten) as SoortId[];
  const totaal = ids.reduce((som, id) => som + (gewichten[id] ?? 0), 0);
  let rest = rng() * totaal;
  for (const id of ids) {
    rest -= gewichten[id] ?? 0;
    if (rest < 0) return id;
  }
  return ids[ids.length - 1];
}

/** Kies een soort volgens de spawngewichten van de zone op dit dreigingsniveau. */
export function kiesSoort(zoneNr: number, niveau: number, rng: Rng): SoortId {
  return kiesUitGewichten(spawnGewichten(zoneNr, niveau), rng);
}

/** Posities voor één school-spawn: n leden binnen de spawnstraal rond het centrum. */
export function schoolPosities(centrum: Punt, rng: Rng, n: number = SCHOOL_SPAWN_N): Punt[] {
  const posities: Punt[] = [];
  for (let i = 0; i < n; i++) {
    const hoek = rng() * 2 * Math.PI;
    const afstand = rng() * SCHOOL_SPAWN_STRAAL;
    posities.push({
      x: centrum.x + Math.cos(hoek) * afstand,
      y: centrum.y + Math.sin(hoek) * afstand,
    });
  }
  return posities;
}
