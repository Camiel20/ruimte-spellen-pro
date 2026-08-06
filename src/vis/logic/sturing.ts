// Hapvis — pure steering-helpers: vluchten, zien, draaien, schoolgedrag.
// Geen Phaser; de scene vertaalt deze vectoren/besluiten naar snelheden.

import {
  JAAG_MAX_AFSTAND,
  JAAG_MAX_T,
  SCHOOL_ALIGNMENT,
  SCHOOL_COHESIE,
  SCHOOL_RADIUS,
  SCHOOL_SEPARATIE,
  SCHOOL_SEPARATIE_AFSTAND,
} from '../GameConfig';

export interface Vec {
  x: number;
  y: number;
}

export function lengte(v: Vec): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

/** Genormaliseerde vector; de nulvector blijft {0, 0}. */
export function normaliseer(v: Vec): Vec {
  const l = lengte(v);
  if (l === 0) return { x: 0, y: 0 };
  return { x: v.x / l, y: v.y / l };
}

/** Eenheidsvector die recht van de bedreiging af wijst. */
export function vluchtVector(eigen: Vec, bedreiging: Vec): Vec {
  return normaliseer({ x: eigen.x - bedreiging.x, y: eigen.y - bedreiging.y });
}

/** Kortste hoekverschil doel − huidig, gewikkeld naar [−π, π]. */
export function hoekVerschil(doel: number, huidig: number): number {
  let d = (doel - huidig) % (2 * Math.PI);
  if (d > Math.PI) d -= 2 * Math.PI;
  if (d < -Math.PI) d += 2 * Math.PI;
  return d;
}

/** Draai huidig richting doel, begrensd door maxRadPerS × dtSec (kortste kant op). */
export function draaiNaar(huidig: number, doel: number, maxRadPerS: number, dtSec: number): number {
  const d = hoekVerschil(doel, huidig);
  const max = maxRadPerS * dtSec;
  return huidig + Math.max(-max, Math.min(max, d));
}

/**
 * Ziet een vis op eigenPos (kijkend in kijkHoekRad) het doel? Binnen de
 * zichtradius én binnen de zichtkegel; 360° of meer betekent rondom kijken.
 */
export function inZicht(
  eigenPos: Vec,
  kijkHoekRad: number,
  doelPos: Vec,
  zichtRadius: number,
  zichtHoekGraden: number,
): boolean {
  const dx = doelPos.x - eigenPos.x;
  const dy = doelPos.y - eigenPos.y;
  if (Math.sqrt(dx * dx + dy * dy) > zichtRadius) return false;
  if (zichtHoekGraden >= 360) return true;
  if (dx === 0 && dy === 0) return true;
  const naarDoel = Math.atan2(dy, dx);
  const halveKegel = ((zichtHoekGraden * Math.PI) / 180) / 2;
  return Math.abs(hoekVerschil(naarDoel, kijkHoekRad)) <= halveKegel;
}

/** Mag een roofvis blijven jagen? Binnen max. tijd én max. afstand. */
export function magBlijvenJagen(jaagTijdSec: number, afstandTotDoel: number): boolean {
  return jaagTijdSec <= JAAG_MAX_T && afstandTotDoel <= JAAG_MAX_AFSTAND;
}

export interface SchoolLid {
  pos: Vec;
  vel: Vec;
}

/**
 * Boids-kracht (richtingsvector, niet geschaald naar snelheid) voor een
 * schoolvis: separatie + alignment + cohesie over de buren binnen
 * SCHOOL_RADIUS. Zonder buren: nulvector.
 */
export function schoolKracht(eigenPos: Vec, buren: SchoolLid[]): Vec {
  const binnen = buren.filter((b) => {
    const dx = b.pos.x - eigenPos.x;
    const dy = b.pos.y - eigenPos.y;
    return Math.sqrt(dx * dx + dy * dy) <= SCHOOL_RADIUS;
  });
  if (binnen.length === 0) return { x: 0, y: 0 };

  const separatie: Vec = { x: 0, y: 0 };
  const somVel: Vec = { x: 0, y: 0 };
  const zwaartepunt: Vec = { x: 0, y: 0 };
  for (const b of binnen) {
    const dx = eigenPos.x - b.pos.x;
    const dy = eigenPos.y - b.pos.y;
    if (Math.sqrt(dx * dx + dy * dy) <= SCHOOL_SEPARATIE_AFSTAND) {
      const weg = normaliseer({ x: dx, y: dy });
      separatie.x += weg.x;
      separatie.y += weg.y;
    }
    somVel.x += b.vel.x;
    somVel.y += b.vel.y;
    zwaartepunt.x += b.pos.x;
    zwaartepunt.y += b.pos.y;
  }
  const alignment = normaliseer({ x: somVel.x / binnen.length, y: somVel.y / binnen.length });
  const cohesie = normaliseer({
    x: zwaartepunt.x / binnen.length - eigenPos.x,
    y: zwaartepunt.y / binnen.length - eigenPos.y,
  });
  return {
    x: separatie.x * SCHOOL_SEPARATIE + alignment.x * SCHOOL_ALIGNMENT + cohesie.x * SCHOOL_COHESIE,
    y: separatie.y * SCHOOL_SEPARATIE + alignment.y * SCHOOL_ALIGNMENT + cohesie.y * SCHOOL_COHESIE,
  };
}
