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

/**
 * Genormaliseerde vector; de nulvector blijft {0, 0}. Geef `uit` mee om in een
 * bestaande vector te schrijven — de scene doet dat in zijn update-lus, zodat
 * er per frame niets wordt aangemaakt.
 */
export function normaliseer(v: Vec, uit: Vec = { x: 0, y: 0 }): Vec {
  const l = lengte(v);
  if (l === 0) {
    uit.x = 0;
    uit.y = 0;
    return uit;
  }
  uit.x = v.x / l;
  uit.y = v.y / l;
  return uit;
}

/** Eenheidsvector die recht van de bedreiging af wijst. */
export function vluchtVector(eigen: Vec, bedreiging: Vec, uit: Vec = { x: 0, y: 0 }): Vec {
  uit.x = eigen.x - bedreiging.x;
  uit.y = eigen.y - bedreiging.y;
  return normaliseer(uit, uit);
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

// Werkvectoren voor schoolKracht: hergebruikt, zodat de update-lus van de
// scene geen objecten per frame aanmaakt.
const _sep: Vec = { x: 0, y: 0 };
const _somVel: Vec = { x: 0, y: 0 };
const _zwaartepunt: Vec = { x: 0, y: 0 };
const _hulp: Vec = { x: 0, y: 0 };

/**
 * Boids-kracht (richtingsvector, niet geschaald naar snelheid) voor een
 * schoolvis: separatie + alignment + cohesie over de buren binnen
 * SCHOOL_RADIUS. Zonder buren: nulvector.
 *
 * `aantal` laat de scene een hergebruikte buffer meegeven waarvan alleen de
 * eerste n plekken gevuld zijn; `uit` voorkomt een nieuwe vector per aanroep.
 */
export function schoolKracht(
  eigenPos: Vec,
  buren: SchoolLid[],
  aantal: number = buren.length,
  uit: Vec = { x: 0, y: 0 },
): Vec {
  _sep.x = 0;
  _sep.y = 0;
  _somVel.x = 0;
  _somVel.y = 0;
  _zwaartepunt.x = 0;
  _zwaartepunt.y = 0;
  let n = 0;

  for (let i = 0; i < aantal; i++) {
    const b = buren[i];
    const dx = eigenPos.x - b.pos.x;
    const dy = eigenPos.y - b.pos.y;
    const afstand = Math.sqrt(dx * dx + dy * dy);
    if (afstand > SCHOOL_RADIUS) continue;
    n++;
    if (afstand <= SCHOOL_SEPARATIE_AFSTAND) {
      _hulp.x = dx;
      _hulp.y = dy;
      normaliseer(_hulp, _hulp);
      _sep.x += _hulp.x;
      _sep.y += _hulp.y;
    }
    _somVel.x += b.vel.x;
    _somVel.y += b.vel.y;
    _zwaartepunt.x += b.pos.x;
    _zwaartepunt.y += b.pos.y;
  }

  if (n === 0) {
    uit.x = 0;
    uit.y = 0;
    return uit;
  }

  _hulp.x = _somVel.x / n;
  _hulp.y = _somVel.y / n;
  normaliseer(_hulp, _hulp);
  const alignX = _hulp.x;
  const alignY = _hulp.y;

  _hulp.x = _zwaartepunt.x / n - eigenPos.x;
  _hulp.y = _zwaartepunt.y / n - eigenPos.y;
  normaliseer(_hulp, _hulp);

  uit.x = _sep.x * SCHOOL_SEPARATIE + alignX * SCHOOL_ALIGNMENT + _hulp.x * SCHOOL_COHESIE;
  uit.y = _sep.y * SCHOOL_SEPARATIE + alignY * SCHOOL_ALIGNMENT + _hulp.y * SCHOOL_COHESIE;
  return uit;
}
