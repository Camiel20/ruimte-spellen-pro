// Hapvis — pure spelregels: eten, groei, fases, energie. Geen Phaser.
// Alle getallen komen uit GameConfig.ts.

import {
  BOOST_START_MIN,
  EET_FACTOR,
  ENERGIE_HERSTEL,
  ENERGIE_MAX,
  ENERGIE_VERBRUIK,
  FASES,
  GROEI_OPNAME,
  KWAL_STRAF,
  MASSA_MAX,
} from '../GameConfig';

/** Mag een eter met deze radius een prooi met die radius eten? */
export function kanEten(eterRadius: number, prooiRadius: number): boolean {
  return prooiRadius <= eterRadius * EET_FACTOR;
}

/** "Mond raakt": eten gebeurt zodra de middelpunt-afstand kleiner is dan de eter-radius. */
export function eetBinnenBereik(afstand: number, eterRadius: number): boolean {
  return afstand < eterRadius;
}

/** Nieuwe massa na het eten van een prooi (gecapt op MASSA_MAX). */
export function massaNaEten(massa: number, prooiMassa: number): number {
  return Math.min(MASSA_MAX, massa + prooiMassa * GROEI_OPNAME);
}

/** Fasenummer (1..5) voor een massa; onder de eerste drempel geldt fase 1. */
export function faseVoorMassa(massa: number): number {
  let fase = FASES[0].fase;
  for (const f of FASES) {
    if (massa >= f.drempel) fase = f.fase;
  }
  return fase;
}

/** Massadrempel waarop een fase ingaat. */
export function faseDrempel(fase: number): number {
  const gevonden = FASES.find((f) => f.fase === fase);
  if (!gevonden) throw new Error(`Onbekende fase: ${fase}`);
  return gevonden.drempel;
}

/**
 * Botsingsradius (px) voor een massa: lineaire interpolatie tussen de
 * fasedrempels; onder fase 1 en boven fase 5 wordt geclampt.
 */
export function radiusVoorMassa(massa: number): number {
  const eerste = FASES[0];
  const laatste = FASES[FASES.length - 1];
  if (massa <= eerste.drempel) return eerste.radius;
  if (massa >= laatste.drempel) return laatste.radius;
  for (let i = 0; i < FASES.length - 1; i++) {
    const a = FASES[i];
    const b = FASES[i + 1];
    if (massa < b.drempel) {
      const t = (massa - a.drempel) / (b.drempel - a.drempel);
      return a.radius + (b.radius - a.radius) * t;
    }
  }
  return laatste.radius;
}

/** Maximale zwemsnelheid (px/s) van de speler: constant binnen de fase. */
export function maxSnelheidVoorMassa(massa: number): number {
  const fase = faseVoorMassa(massa);
  const cfg = FASES.find((f) => f.fase === fase);
  if (!cfg) throw new Error(`Onbekende fase: ${fase}`);
  return cfg.maxSnelheid;
}

/**
 * Massa na kwal-contact: 10% eraf, maar nooit onder de drempel van de
 * huidige fase (geen fase-terugval).
 */
export function massaNaKwal(massa: number): number {
  const vloer = faseDrempel(faseVoorMassa(massa));
  return Math.max(vloer, massa * (1 - KWAL_STRAF));
}

/** Mag de boost gestart worden bij deze energie? */
export function magBoostStarten(energie: number): boolean {
  return energie >= BOOST_START_MIN;
}

/** Energie na dt seconden (boost verbruikt, anders herstelt), geclampt op [0, max]. */
export function nieuweEnergie(energie: number, dtSec: number, boostAan: boolean): number {
  const e = boostAan
    ? energie - ENERGIE_VERBRUIK * dtSec
    : energie + ENERGIE_HERSTEL * dtSec;
  return Math.min(ENERGIE_MAX, Math.max(0, e));
}
