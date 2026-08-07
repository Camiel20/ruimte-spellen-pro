// Hapvis — pure spelregels: eten, groei, fases, energie. Geen Phaser.
// Alle getallen komen uit GameConfig.ts.

import {
  BOOST_START_MIN,
  COMBO_BONUS,
  COMBO_MIN,
  COMBO_TOON_MAX,
  COMBO_TOON_STAP,
  EET_FACTOR,
  ENERGIE_HERSTEL,
  ENERGIE_MAX,
  ENERGIE_VERBRUIK,
  FASES,
  GROEI_OPNAME,
  HAP_HULP,
  KWAL_STRAF,
  MASSA_MAX,
  SPELER_START_MASSA,
} from '../GameConfig';

/** Mag een eter met deze radius een prooi met die radius eten? */
export function kanEten(eterRadius: number, prooiRadius: number): boolean {
  return prooiRadius <= eterRadius * EET_FACTOR;
}

/**
 * Is de prooi te pakken? Zonder `prooiRadius` moet het middelpunt van de prooi
 * binnen je eigen straal komen — dat is streng en geldt voor roofvissen die de
 * SPELER pakken. Geef je de prooistraal mee, dan hapt hij zodra de cirkels
 * elkaar raken (`HAP_HULP`); dat is wat de speler zelf gebruikt, want binnen
 * 12 px mikken is voor een kind niet te doen.
 */
export function eetBinnenBereik(afstand: number, eterRadius: number, prooiRadius = 0): boolean {
  return afstand < eterRadius + prooiRadius * HAP_HULP;
}

/** Nieuwe massa na het eten van een prooi (gecapt op MASSA_MAX). */
export function massaNaEten(massa: number, prooiMassa: number): number {
  return Math.min(MASSA_MAX, massa + prooiMassa * GROEI_OPNAME);
}

// NB: deze functies draaien in de update-lus van de scene. Ze gebruiken
// bewust geïndexeerde lussen in plaats van find/for-of, want die maken per
// aanroep een closure of iterator aan — en dat mag niet per frame gebeuren.

/** Fasenummer (1..5) voor een massa; onder de eerste drempel geldt fase 1. */
export function faseVoorMassa(massa: number): number {
  let fase = FASES[0].fase;
  for (let i = 0; i < FASES.length; i++) {
    if (massa >= FASES[i].drempel) fase = FASES[i].fase;
  }
  return fase;
}

/** Massadrempel waarop een fase ingaat. */
export function faseDrempel(fase: number): number {
  for (let i = 0; i < FASES.length; i++) {
    if (FASES[i].fase === fase) return FASES[i].drempel;
  }
  throw new Error(`Onbekende fase: ${fase}`);
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
  for (let i = 0; i < FASES.length; i++) {
    if (FASES[i].fase === fase) return FASES[i].maxSnelheid;
  }
  throw new Error(`Onbekende fase: ${fase}`);
}

/**
 * Massa na kwal-contact: 10% eraf, maar nooit onder de drempel van de
 * huidige fase (geen fase-terugval).
 */
export function massaNaKwal(massa: number): number {
  const vloer = faseDrempel(faseVoorMassa(massa));
  return Math.max(vloer, massa * (1 - KWAL_STRAF));
}

/**
 * Massa nadat het luchtbelschild geklapt is (§10.2): je zakt één fase terug naar
 * de drempel daaronder, met de startmassa als vloer. Bewust een hele fase en
 * geen percentage — een kind moet kunnen zíen dat het misging, en "ik ben weer
 * een Makreel" is een begrijpelijk verlies. In fase 1 kost het niets meer dan
 * het schild zelf; lager dan de startmassa kun je niet.
 */
export function massaNaKlap(massa: number): number {
  const fase = faseVoorMassa(massa);
  if (fase <= FASES[0].fase) return SPELER_START_MASSA;
  return Math.max(SPELER_START_MASSA, faseDrempel(fase - 1));
}

/** Bonuspunten voor een hap bij deze combostand (0 onder de drempel). */
export function comboBonus(combo: number): number {
  return combo >= COMBO_MIN ? (combo - COMBO_MIN + 1) * COMBO_BONUS : 0;
}

/** Hoeveel Hz de hap-toon stijgt bij deze combostand; gecapt tegen gepiep. */
export function comboToonStijging(combo: number): number {
  if (combo < COMBO_MIN) return 0;
  return Math.min(COMBO_TOON_MAX, (combo - COMBO_MIN + 1) * COMBO_TOON_STAP);
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
