// Hapvis — moeilijkheidscurve: dreigingsniveau en de gevolgen daarvan.
// Pure functies, geen Phaser. Alle getallen komen uit GameConfig.ts.

import {
  DREIGING_INTERVAL,
  DREIGING_MAX,
  DREIGING_PP_MAX,
  DREIGING_PP_PER_STAP,
  DREIGING_SNELHEID_MAX,
  DREIGING_SNELHEID_PER_STAP,
  PROOI_VLOER_PCT,
  SOORTEN,
  ZONES,
  type Gedrag,
  type SoortId,
  type ZoneConfig,
} from '../GameConfig';

/** Dreigingsniveau (0..DREIGING_MAX) op rondetijd t (s): +1 per interval. */
export function dreigingsNiveau(tijdSec: number): number {
  return Math.min(DREIGING_MAX, Math.floor(tijdSec / DREIGING_INTERVAL));
}

/** Schaalt dit gedrag mee met de dreiging? Alleen roofvissen; apex-burst en vlucht niet. */
export function schaaltMee(gedrag: Gedrag): boolean {
  return gedrag === 'roofvis';
}

/** Snelheidsfactor voor jaagsnelheden van roofvissen op dit dreigingsniveau. */
export function jaagFactor(niveau: number): number {
  return 1 + Math.min(DREIGING_SNELHEID_MAX, DREIGING_SNELHEID_PER_STAP * niveau);
}

function zoneConfig(zoneNr: number): ZoneConfig {
  const zone = ZONES.find((z) => z.nr === zoneNr);
  if (!zone) throw new Error(`Onbekende zone: ${zoneNr}`);
  return zone;
}

/**
 * Verdeel een verschuiving (pp) naar rato van de basisgewichten over de
 * roofvissoorten; andere soorten blijven onaangeroerd.
 */
export function verdeelVerschuiving(
  gewichten: Partial<Record<SoortId, number>>,
  roofIds: SoortId[],
  verschuiving: number,
): Partial<Record<SoortId, number>> {
  const nieuw = { ...gewichten };
  const totaal = roofIds.reduce((som, id) => som + (gewichten[id] ?? 0), 0);
  if (totaal <= 0) return nieuw;
  for (const id of roofIds) {
    nieuw[id] = (nieuw[id] ?? 0) + (verschuiving * (gewichten[id] ?? 0)) / totaal;
  }
  return nieuw;
}

/**
 * Spawngewichten (%) van een zone op een dreigingsniveau. Per stap verschuift
 * DREIGING_PP_PER_STAP pp van het snoep-prooigewicht naar het totale
 * roofvisgewicht, naar rato verdeeld over de roofvissoorten van de zone.
 * Het snoepgewicht zakt nooit onder PROOI_VLOER_PCT; de som blijft 100.
 */
export function spawnGewichten(zoneNr: number, niveau: number): Partial<Record<SoortId, number>> {
  const zone = zoneConfig(zoneNr);
  const basis: Partial<Record<SoortId, number>> = { ...zone.gewichten };
  const roofIds = (Object.keys(basis) as SoortId[]).filter(
    (id) => SOORTEN[id].gedrag === 'roofvis',
  );
  if (roofIds.length === 0) return basis;

  const snoepBasis = basis[zone.snoepSoort] ?? 0;
  const verschuiving = Math.min(
    DREIGING_PP_PER_STAP * niveau,
    DREIGING_PP_MAX,
    snoepBasis - PROOI_VLOER_PCT,
  );
  if (verschuiving <= 0) return basis;

  const nieuw = verdeelVerschuiving(basis, roofIds, verschuiving);
  nieuw[zone.snoepSoort] = snoepBasis - verschuiving;
  return nieuw;
}
