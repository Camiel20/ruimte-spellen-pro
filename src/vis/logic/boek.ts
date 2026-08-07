// Hapvis — het vissenboek: welke soorten erin staan, wat je al ontdekt hebt en
// wat nog op slot zit. Pure logica, geen Phaser: alles wat te beredeneren valt
// hoort hier en niet in de scene (§8 van DESIGN.md).

import {
  AANTAL_ZONES,
  FASES,
  SOORTEN,
  SOORT_NAAM,
  ZONES,
  type SoortId,
  type Vangst,
} from '../GameConfig';
import { kanEten } from './regels';

export interface BoekItem {
  id: SoortId;
  naam: string;
  ontdekt: boolean; // sleutel aanwezig in de vangst-tabel
  aantal: number; // 0 = ontdekt doordat die soort JOU opat
  zones: number[];
  zoneNamen: string[];
  vangbaar: boolean; // false = kan zelfs volgroeid niet gegeten worden
  opSlot: boolean; // leeft alléén in zone 4, en die staat nog dicht
}

/** Grootste radius die de speler ooit kan bereiken (de laatste fase). */
export function maxSpelerRadius(): number {
  return FASES[FASES.length - 1].radius;
}

/**
 * Kan deze soort ooit opgegeten worden? Afgeleid uit de eetregel, niet
 * hardgecodeerd op id — verandert EET_FACTOR of de fase-5-radius, dan schuift
 * het boek vanzelf mee.
 */
export function ooitVangbaar(id: SoortId): boolean {
  return kanEten(maxSpelerRadius(), SOORTEN[id].radius);
}

/**
 * De soorten in het boek: alle vissen, oplopend op radius. De kwal valt af op
 * zijn gedrag ('gevaar'), niet op zijn naam — het is geen vis.
 */
export function boekSoorten(): SoortId[] {
  return (Object.keys(SOORTEN) as SoortId[])
    .filter((id) => SOORTEN[id].gedrag !== 'gevaar')
    .sort((a, b) => SOORTEN[a].radius - SOORTEN[b].radius);
}

function zoneNaam(nr: number): string {
  const zone = ZONES.find((z) => z.nr === nr);
  return zone ? zone.naam : '';
}

/** Zit deze soort uitsluitend in de diepste zone? */
function alleenDiepste(id: SoortId): boolean {
  const zones = SOORTEN[id].zones;
  return zones.length > 0 && zones.every((z) => z === AANTAL_ZONES);
}

/** Het hele boek als tegels, in weergavevolgorde. */
export function boekPagina(vangst: Vangst, zone4Open: boolean): BoekItem[] {
  return boekSoorten().map((id) => {
    const cfg = SOORTEN[id];
    return {
      id,
      naam: SOORT_NAAM[id],
      // Sleutel aanwezig, niet "> 0": een soort die JOU opat heeft aantal 0 en
      // moet toch ontdekt blijven.
      ontdekt: Object.prototype.hasOwnProperty.call(vangst, id),
      aantal: vangst[id] ?? 0,
      zones: cfg.zones,
      zoneNamen: cfg.zones.map(zoneNaam),
      vangbaar: ooitVangbaar(id),
      opSlot: alleenDiepste(id) && !zone4Open,
    };
  });
}

/** Hoeveel soorten je al ontdekt hebt (de kwal telt niet mee). */
export function telOntdekt(vangst: Vangst): number {
  return boekSoorten().filter((id) => Object.prototype.hasOwnProperty.call(vangst, id)).length;
}

/** Totaal aantal soorten in het boek. */
export function boekTotaal(): number {
  return boekSoorten().length;
}

/** Is dit de eerste keer dat de speler deze soort tegenkomt? */
export function isNieuweSoort(vangst: Vangst, id: SoortId): boolean {
  if (SOORTEN[id].gedrag === 'gevaar') return false;
  return !Object.prototype.hasOwnProperty.call(vangst, id);
}

/** Staat het boek helemaal vol? */
export function boekVol(vangst: Vangst): boolean {
  return telOntdekt(vangst) >= boekTotaal();
}
