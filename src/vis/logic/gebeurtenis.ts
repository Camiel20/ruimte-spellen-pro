// Hapvis — gebeurtenissen (§10.3 van DESIGN.md): korte periodes die het beeld
// veranderen, zodat een ronde een ritme heeft in plaats van alleen een oplopend
// dreigingsgetal. Pure functies met injecteerbare rng. Geen Phaser.

import {
  GEBEURTENIS_EERSTE,
  GEBEURTENIS_PAUZE_MAX,
  GEBEURTENIS_PAUZE_MIN,
  JACHT_DONKER,
  JACHT_DUUR,
  JACHT_PP,
  PARADE_DUUR,
  PARADE_TEMPO,
  PROOI_VLOER_PCT,
  SOORTEN,
  STILTE_DUUR,
  STILTE_LICHT,
  ZONES,
  type Gedrag,
  type SoortId,
  type ZoneConfig,
} from '../GameConfig';
import { spawnGewichten, verdeelVerschuiving } from './moeilijkheid';
import { kiesUitGewichten, type Rng } from './spawn';

export type GebeurtenisId = 'parade' | 'stilte' | 'jachttijd';

export interface GebeurtenisConfig {
  id: GebeurtenisId;
  naam: string; // tekst op de banner
  duur: number; // s
  gewicht: number; // relatieve trekkans
}

export const GEBEURTENISSEN: GebeurtenisConfig[] = [
  { id: 'parade', naam: 'Vissen-parade!', duur: PARADE_DUUR, gewicht: 40 },
  { id: 'stilte', naam: 'Even rustig...', duur: STILTE_DUUR, gewicht: 25 },
  { id: 'jachttijd', naam: 'Jachttijd!', duur: JACHT_DUUR, gewicht: 35 },
];

export function gebeurtenisConfig(id: GebeurtenisId): GebeurtenisConfig {
  for (let i = 0; i < GEBEURTENISSEN.length; i++) {
    if (GEBEURTENISSEN[i].id === id) return GEBEURTENISSEN[i];
  }
  throw new Error(`Onbekende gebeurtenis: ${id}`);
}

/**
 * Trek de volgende gebeurtenis, nooit dezelfde als de vorige — anders krijg je
 * twee paradetjes achter elkaar en verdwijnt juist de afwisseling die het doel is.
 */
export function kiesGebeurtenis(rng: Rng, vorige: GebeurtenisId | null): GebeurtenisId {
  const opties = GEBEURTENISSEN.filter((g) => g.id !== vorige);
  const totaal = opties.reduce((som, g) => som + g.gewicht, 0);
  let rest = rng() * totaal;
  for (const g of opties) {
    rest -= g.gewicht;
    if (rest < 0) return g.id;
  }
  return opties[opties.length - 1].id;
}

/** Seconden tot de volgende gebeurtenis; de eerste komt sneller dan de rest. */
export function wachttijd(rng: Rng, eerste: boolean): number {
  if (eerste) return GEBEURTENIS_EERSTE;
  return GEBEURTENIS_PAUZE_MIN + rng() * (GEBEURTENIS_PAUZE_MAX - GEBEURTENIS_PAUZE_MIN);
}

/**
 * Mag dit gedrag spawnen tijdens de lopende gebeurtenis? Tijdens de stilte geen
 * jagers, tijdens de parade uitsluitend eetbare vis (ook geen kwal — het is
 * bedoeld als feestje).
 */
export function magSpawnen(gedrag: Gedrag, actief: GebeurtenisId | null): boolean {
  if (actief === 'stilte') return gedrag !== 'roofvis' && gedrag !== 'apex';
  if (actief === 'parade') return gedrag === 'prooivis' || gedrag === 'schoolvis';
  return true;
}

/** Vermenigvuldiger op het spawntempo tijdens de lopende gebeurtenis. */
export function spawnTempoFactor(actief: GebeurtenisId | null): number {
  return actief === 'parade' ? PARADE_TEMPO : 1;
}

/**
 * Hoe het water eruitziet tijdens de gebeurtenis: positief = lichter (stilte),
 * negatief = donkerder (jachttijd), 0 = onveranderd.
 */
export function wateraanpassing(actief: GebeurtenisId | null): number {
  if (actief === 'stilte') return STILTE_LICHT;
  if (actief === 'jachttijd') return -JACHT_DONKER;
  return 0;
}

function zoneVan(zoneNr: number): ZoneConfig {
  for (let i = 0; i < ZONES.length; i++) {
    if (ZONES[i].nr === zoneNr) return ZONES[i];
  }
  throw new Error(`Onbekende zone: ${zoneNr}`);
}

/**
 * Spawngewichten inclusief het effect van de gebeurtenis. Jachttijd schuift nog
 * eens JACHT_PP pp naar de roofvissen (bovenop de dreigingscurve), maar houdt
 * zich aan dezelfde prooivloer — anders kan een zone tijdelijk zonder eten
 * komen te zitten. Stilte en parade filteren alleen; blijft er niets over, dan
 * geldt de gewone tabel (kan niet gebeuren met de huidige zones, maar een lege
 * tabel zou de spawner laten crashen).
 */
export function gewichtenTijdens(
  zoneNr: number,
  niveau: number,
  actief: GebeurtenisId | null,
): Partial<Record<SoortId, number>> {
  const basis = spawnGewichten(zoneNr, niveau);
  if (actief === null) return basis;

  if (actief === 'jachttijd') {
    const zone = zoneVan(zoneNr);
    const roofIds = (Object.keys(basis) as SoortId[]).filter(
      (id) => SOORTEN[id].gedrag === 'roofvis',
    );
    if (roofIds.length === 0) return basis;
    const snoepNu = basis[zone.snoepSoort] ?? 0;
    const verschuiving = Math.min(JACHT_PP, snoepNu - PROOI_VLOER_PCT);
    if (verschuiving <= 0) return basis;
    const nieuw = verdeelVerschuiving(basis, roofIds, verschuiving);
    nieuw[zone.snoepSoort] = snoepNu - verschuiving;
    return nieuw;
  }

  const gefilterd: Partial<Record<SoortId, number>> = {};
  let som = 0;
  for (const id of Object.keys(basis) as SoortId[]) {
    if (!magSpawnen(SOORTEN[id].gedrag, actief)) continue;
    gefilterd[id] = basis[id];
    som += basis[id] ?? 0;
  }
  return som > 0 ? gefilterd : basis;
}

/** Soortkeuze met de gebeurtenis meegerekend; zelfde trekking als `kiesSoort`. */
export function kiesSoortTijdens(
  zoneNr: number,
  niveau: number,
  actief: GebeurtenisId | null,
  rng: Rng,
): SoortId {
  return kiesUitGewichten(gewichtenTijdens(zoneNr, niveau, actief), rng);
}
