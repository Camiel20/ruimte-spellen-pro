// Hapvis — het ENIGE opslagpunt van het spel: records, laatste rondes en
// unlocks in localStorage (sleutel OPSLAG_SLEUTEL). Geen Phaser. De opslag is
// injecteerbaar (tests gebruiken een stub); zonder werkende localStorage valt
// hij terug op in-memory, zodat het spel altijd blijft draaien.

import {
  KLEUR_UNLOCKS,
  LAATSTE_N_RONDES,
  OPSLAG_SLEUTEL,
  SOORTEN,
  SKIN_NEON_EIS_GEGETEN,
  SKIN_STEKELBAARS_EIS_FASE,
  STANDAARD_KLEUR,
  STANDAARD_SKIN,
  ZONE4_EIS_FASE,
  type SoortId,
  type Vangst,
} from './GameConfig';

export interface OpslagAchtig {
  getItem(sleutel: string): string | null;
  setItem(sleutel: string, waarde: string): void;
}

export interface Ronde {
  score: number;
  duurSec: number; // overleefde tijd in seconden
  grootsteMassa: number; // hoogste massa in deze ronde
  grootsteFase: number; // hoogste fase in deze ronde (1..5)
  gegeten: number; // aantal gegeten vissen in deze ronde
  datumIso: string; // ISO-datum, door de aanroeper meegegeven (testbaar)
}

export interface SaveData {
  vangst: Vangst; // vissenboek: per soort hoe vaak gegeten (0 = alleen ontmoet)
  hoogsteScore: number;
  langsteOverlevingSec: number;
  grootsteMassa: number; // record "grootste vis"
  grootsteFase: number; // fase bij dat record / hoogste ooit
  meesteGegeten: number; // meeste vissen gegeten in één ronde
  totaalGegeten: number; // cumulatief over alle rondes
  laatste5: Ronde[]; // nieuwste eerst, max LAATSTE_N_RONDES
  gekozenKleur: string;
  gekozenSkin: string;
}

function leegSave(): SaveData {
  return {
    vangst: {},
    hoogsteScore: 0,
    langsteOverlevingSec: 0,
    grootsteMassa: 0,
    grootsteFase: 0,
    meesteGegeten: 0,
    totaalGegeten: 0,
    laatste5: [],
    gekozenKleur: STANDAARD_KLEUR,
    gekozenSkin: STANDAARD_SKIN,
  };
}

function getal(waarde: unknown, terugval: number): number {
  return typeof waarde === 'number' && Number.isFinite(waarde) ? waarde : terugval;
}

function tekst(waarde: unknown, terugval: string): string {
  return typeof waarde === 'string' && waarde.length > 0 ? waarde : terugval;
}

/**
 * Leest een vangst-tabel uit de opslag. Alleen bekende soort-id's en hele
 * getallen ≥ 0; de kwal hoort niet in het boek. Let op: `null` en arrays zijn
 * allebei `typeof 'object'`, dus die moeten expliciet worden afgevangen —
 * anders sluipen array-indices als soort-id's naar binnen.
 */
function vangstVan(waarde: unknown): Vangst {
  if (typeof waarde !== 'object' || waarde === null || Array.isArray(waarde)) return {};
  const uit: Vangst = {};
  for (const [sleutel, aantal] of Object.entries(waarde as Record<string, unknown>)) {
    if (!Object.prototype.hasOwnProperty.call(SOORTEN, sleutel)) continue;
    const id = sleutel as SoortId;
    if (SOORTEN[id].gedrag === 'gevaar') continue; // kwal is geen vis
    if (typeof aantal !== 'number' || !Number.isFinite(aantal)) continue;
    uit[id] = Math.max(0, Math.floor(aantal));
  }
  return uit;
}

/** In-memory terugval als localStorage ontbreekt of stuk is (bv. private mode). */
class GeheugenOpslag implements OpslagAchtig {
  private data = new Map<string, string>();
  getItem(sleutel: string): string | null {
    return this.data.get(sleutel) ?? null;
  }
  setItem(sleutel: string, waarde: string): void {
    this.data.set(sleutel, waarde);
  }
}

function standaardOpslag(): OpslagAchtig {
  try {
    const opslag = (globalThis as { localStorage?: OpslagAchtig }).localStorage;
    if (opslag) return opslag;
  } catch {
    // localStorage kan gooien (bv. geblokkeerd) — dan in-memory.
  }
  return new GeheugenOpslag();
}

export class SaveManager {
  private opslag: OpslagAchtig;

  constructor(opslag?: OpslagAchtig) {
    this.opslag = opslag ?? standaardOpslag();
  }

  /** Lees de save; ongeldige of ontbrekende data valt terug op een leeg record. */
  laad(): SaveData {
    let ruw: string | null = null;
    try {
      ruw = this.opslag.getItem(OPSLAG_SLEUTEL);
    } catch {
      return leegSave();
    }
    if (!ruw) return leegSave();
    try {
      const parsed = JSON.parse(ruw) as Partial<SaveData>;
      const leeg = leegSave();
      return {
        // LET OP: elk veld dat hier ontbreekt wordt bij de eerstvolgende
        // schrijfactie stilletjes gewist — `bewaar()` schrijft dit resultaat terug.
        vangst: vangstVan(parsed.vangst),
        hoogsteScore: getal(parsed.hoogsteScore, leeg.hoogsteScore),
        langsteOverlevingSec: getal(parsed.langsteOverlevingSec, leeg.langsteOverlevingSec),
        grootsteMassa: getal(parsed.grootsteMassa, leeg.grootsteMassa),
        grootsteFase: getal(parsed.grootsteFase, leeg.grootsteFase),
        meesteGegeten: getal(parsed.meesteGegeten, leeg.meesteGegeten),
        totaalGegeten: getal(parsed.totaalGegeten, leeg.totaalGegeten),
        laatste5: Array.isArray(parsed.laatste5)
          ? parsed.laatste5.slice(0, LAATSTE_N_RONDES).map((r) => ({
              score: getal(r?.score, 0),
              duurSec: getal(r?.duurSec, 0),
              grootsteMassa: getal(r?.grootsteMassa, 0),
              grootsteFase: getal(r?.grootsteFase, 0),
              gegeten: getal(r?.gegeten, 0),
              datumIso: tekst(r?.datumIso, ''),
            }))
          : [],
        gekozenKleur: tekst(parsed.gekozenKleur, leeg.gekozenKleur),
        gekozenSkin: tekst(parsed.gekozenSkin, leeg.gekozenSkin),
      };
    } catch {
      return leegSave();
    }
  }

  private bewaar(data: SaveData): void {
    try {
      this.opslag.setItem(OPSLAG_SLEUTEL, JSON.stringify(data));
    } catch {
      // Vol of geblokkeerd: het spel speelt door, de save gaat dan verloren.
    }
  }

  /** Verwerk een afgelopen ronde: records bijwerken + toevoegen aan laatste 5. */
  registreerRonde(ronde: Ronde): SaveData {
    const data = this.laad();
    data.hoogsteScore = Math.max(data.hoogsteScore, ronde.score);
    data.langsteOverlevingSec = Math.max(data.langsteOverlevingSec, ronde.duurSec);
    if (ronde.grootsteMassa > data.grootsteMassa) {
      data.grootsteMassa = ronde.grootsteMassa;
    }
    data.grootsteFase = Math.max(data.grootsteFase, ronde.grootsteFase);
    data.meesteGegeten = Math.max(data.meesteGegeten, ronde.gegeten);
    data.totaalGegeten += ronde.gegeten;
    data.laatste5 = [ronde, ...data.laatste5].slice(0, LAATSTE_N_RONDES);
    this.bewaar(data);
    return data;
  }

  /**
   * Telt vangsten op bij het vissenboek. Een delta van 0 zet de soort alleen
   * op "ontdekt" — dat is wat er gebeurt als die soort de speler opat.
   */
  registreerVangst(delta: Readonly<Vangst>): SaveData {
    const data = this.laad();
    for (const [sleutel, aantal] of Object.entries(delta)) {
      const id = sleutel as SoortId;
      if (!Object.prototype.hasOwnProperty.call(SOORTEN, id)) continue;
      if (SOORTEN[id].gedrag === 'gevaar') continue;
      data.vangst[id] = (data.vangst[id] ?? 0) + Math.max(0, Math.floor(aantal ?? 0));
    }
    this.bewaar(data);
    return data;
  }

  /** Ontgrendelde kleur-id's (op volgorde van KLEUR_UNLOCKS). */
  ontgrendeldeKleuren(data: SaveData = this.laad()): string[] {
    return KLEUR_UNLOCKS.filter((k) => data.hoogsteScore >= k.drempelScore).map((k) => k.id);
  }

  /** Ontgrendelde skin-id's (de standaardskin is er altijd). */
  ontgrendeldeSkins(data: SaveData = this.laad()): string[] {
    const skins = [STANDAARD_SKIN];
    if (data.totaalGegeten >= SKIN_NEON_EIS_GEGETEN) skins.push('neonvisje');
    if (data.grootsteFase >= SKIN_STEKELBAARS_EIS_FASE) skins.push('stekelbaars');
    return skins;
  }

  /** Is zone 4 (Inktdiepte) permanent ontgrendeld? */
  zone4Ontgrendeld(data: SaveData = this.laad()): boolean {
    return data.grootsteFase >= ZONE4_EIS_FASE;
  }

  /** Kies een kleur; genegeerd als die (nog) niet ontgrendeld is. */
  kiesKleur(id: string): boolean {
    const data = this.laad();
    if (!this.ontgrendeldeKleuren(data).includes(id)) return false;
    data.gekozenKleur = id;
    this.bewaar(data);
    return true;
  }

  /** Kies een skin; genegeerd als die (nog) niet ontgrendeld is. */
  kiesSkin(id: string): boolean {
    const data = this.laad();
    if (!this.ontgrendeldeSkins(data).includes(id)) return false;
    data.gekozenSkin = id;
    this.bewaar(data);
    return true;
  }
}
