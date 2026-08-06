// Hapvis — alle tuningwaarden op één plek. Elk getal komt letterlijk uit
// docs/DESIGN.md; wijzig het daar én hier tegelijk. Eenheden: px = wereldpixels
// (v1 heeft geen camera-zoom, dus wereld-px = scherm-px), s = seconden,
// rad = radialen, pp = procentpunt. Geen magische getallen buiten dit bestand.

export type Gedrag = 'prooivis' | 'schoolvis' | 'roofvis' | 'apex' | 'gevaar';

export type SoortId =
  | 'vlokje'
  | 'stipje'
  | 'flapper'
  | 'snapper'
  | 'grombaars'
  | 'diepteschrik'
  | 'kwal';

export interface SoortConfig {
  gedrag: Gedrag;
  massa: number; // massa-eenheden (kwal: 0 = n.v.t., geen vis)
  radius: number; // px, botsingsradius
  kruisSnelheid: number; // px/s (kwal: 0, beweegt via de KWAL_*-constanten)
  topSnelheid: number; // px/s — prooi: vlucht (= kruis × VLUCHT_FACTOR), roofvis: jaag, apex: burst
  score: number; // punten bij opeten door de speler
  zones: number[]; // zonenummers waar de soort in de spawntabel staat
}

// ── Eetregel ────────────────────────────────────────────────────────────────
export const EET_FACTOR = 0.8; // verhouding: eetbaar als prooiRadius <= eterRadius × dit

// ── Voedselketen (tabel §2 van DESIGN.md) ───────────────────────────────────
export const SOORTEN: Record<SoortId, SoortConfig> = {
  vlokje:       { gedrag: 'prooivis',  massa: 2,   radius: 6,  kruisSnelheid: 60, topSnelheid: 96,  score: 1,   zones: [1] },
  stipje:       { gedrag: 'schoolvis', massa: 4,   radius: 8,  kruisSnelheid: 80, topSnelheid: 128, score: 2,   zones: [1, 2] },
  flapper:      { gedrag: 'prooivis',  massa: 10,  radius: 12, kruisSnelheid: 90, topSnelheid: 144, score: 5,   zones: [2, 3, 4] },
  snapper:      { gedrag: 'roofvis',   massa: 30,  radius: 17, kruisSnelheid: 70, topSnelheid: 150, score: 15,  zones: [1, 2, 3] },
  grombaars:    { gedrag: 'roofvis',   massa: 90,  radius: 25, kruisSnelheid: 60, topSnelheid: 160, score: 40,  zones: [3, 4] },
  diepteschrik: { gedrag: 'apex',      massa: 400, radius: 44, kruisSnelheid: 60, topSnelheid: 260, score: 150, zones: [4] },
  kwal:         { gedrag: 'gevaar',    massa: 0,   radius: 14, kruisSnelheid: 0,  topSnelheid: 0,   score: 0,   zones: [2, 3, 4] },
};

export const VLUCHT_FACTOR = 1.6; // vluchtsnelheid prooi = kruissnelheid × dit
export const NPC_ACCEL = 300; // px/s²
export const NPC_DRAAI = 2.5; // rad/s (prooi- en schoolvissen)
export const ROOFVIS_DRAAI = 3.0; // rad/s (roofvissen + apex)

// ── Kwal ────────────────────────────────────────────────────────────────────
export const KWAL_DRIFT = 20; // px/s verticale drift
export const KWAL_OMKEER = 4; // s: drift keert elke zoveel s om (omhoog/omlaag)
export const KWAL_AMPLITUDE = 40; // px horizontale sinus-slinger
export const KWAL_PERIODE = 3; // s periode van de sinus
export const KWAL_STRAF = 0.1; // aandeel massa dat contact kost (10%)
export const ONKWETSBAAR = 1.0; // s onkwetsbaar na kwal-contact

// ── Speler ──────────────────────────────────────────────────────────────────
export const SPELER_START_MASSA = 10; // massa-eenheden bij rondestart
export const SPELER_ACCEL = 400; // px/s²
export const SPELER_DRAG = 250; // px/s² demping
export const SPELER_DRAAI = 3.5; // rad/s max draaisnelheid

export const BOOST_FACTOR = 1.8; // × maxsnelheid tijdens boost
export const ENERGIE_MAX = 100; // energie-eenheden
export const ENERGIE_VERBRUIK = 35; // energie/s tijdens boost
export const ENERGIE_HERSTEL = 20; // energie/s zonder boost
export const BOOST_START_MIN = 10; // minimale energie om boost te mogen starten

// ── Groeicurve (tabel §3 van DESIGN.md) ─────────────────────────────────────
export const GROEI_OPNAME = 0.5; // massa += prooiMassa × dit
export const MASSA_MAX = 999; // massa-cap

export interface FaseConfig {
  fase: number;
  naam: string;
  drempel: number; // massadrempel waarop de fase ingaat
  radius: number; // px op de drempel (lineaire lerp tussen drempels)
  maxSnelheid: number; // px/s, constant binnen de fase
}

export const FASES: FaseConfig[] = [
  { fase: 1, naam: 'Grondel',     drempel: 10,  radius: 12, maxSnelheid: 170 },
  { fase: 2, naam: 'Baars',       drempel: 30,  radius: 17, maxSnelheid: 165 },
  { fase: 3, naam: 'Makreel',     drempel: 80,  radius: 24, maxSnelheid: 160 },
  { fase: 4, naam: 'Tonijn',      drempel: 200, radius: 34, maxSnelheid: 155 },
  { fase: 5, naam: 'Reuzenbaars', drempel: 500, radius: 56, maxSnelheid: 150 },
];

// ── AI ──────────────────────────────────────────────────────────────────────
export const PROOI_DETECTIE = 140; // px: prooi vlucht voor grotere vis binnen deze afstand
export const DWAAL_MIN = 1.5; // s min. dwaalinterval prooivis
export const DWAAL_MAX = 3.0; // s max. dwaalinterval prooivis

export const SCHOOL_RADIUS = 120; // px boids-buurradius
export const SCHOOL_SEPARATIE_AFSTAND = 24; // px: separatie geldt binnen deze afstand
export const SCHOOL_SEPARATIE = 1.0; // gewicht separatie
export const SCHOOL_ALIGNMENT = 0.6; // gewicht alignment
export const SCHOOL_COHESIE = 0.4; // gewicht cohesie
export const SCHOOL_SPAWN_N = 5; // leden per school-spawn (één spawn-actie)
export const SCHOOL_SPAWN_STRAAL = 80; // px spreiding rond het spawnpunt

export const PATROUILLE_MIN = 2; // s min. richtingswissel-interval roofvis
export const PATROUILLE_MAX = 4; // s max. richtingswissel-interval roofvis
export const ROOF_ZICHT = 220; // px zichtradius roofvis
export const ROOF_ZICHTHOEK = 120; // graden zichtkegel roofvis
export const JAAG_GEHEUGEN = 1.0; // s onthoudt laatst-gezien-punt
export const JAAG_MAX_T = 4; // s max. achtervolgtijd
export const JAAG_MAX_AFSTAND = 400; // px: jacht breekt af boven deze afstand
export const JAAG_AFKOEL = 3; // s afkoelen na afgebroken jacht

export const APEX_MAX_ACTIEF = 1; // max Diepteschrikken tegelijk
export const APEX_ROL_INTERVAL = 30; // s tussen spawnkans-rollen
export const APEX_KANS = 0.15; // kans per rol (alleen zone 4)
export const APEX_ZICHT = 260; // px zichtradius, rondom (360°)
export const APEX_ZICHTHOEK = 360; // graden (ziet rondom)
export const APEX_BURST_MAX_T = 2; // s max. burst-duur
export const APEX_RUST = 6; // s rust na een burst

// ── Wereld & zones (§5 van DESIGN.md) ───────────────────────────────────────
export const WERELD_B = 3200; // px wereldbreedte
export const WERELD_H = 4800; // px werelddiepte
export const ZONE_HOOGTE = 1200; // px per dieptezone
export const AANTAL_ZONES = 4;

export const SCHERM_B = 480; // px, bestaande Nul & Co-canvasbreedte
export const SCHERM_H = 800; // px, bestaande Nul & Co-canvashoogte

export const CAMERA_LERP = 0.08; // volgfactor camera (geen zoom in v1)
export const RAND_MARGE = 100; // px: NPC-dwaalrichting spiegelt naar binnen binnen deze rand
export const ZONE_UITLOOP = 200; // px: NPC buigt terug als hij zó ver buiten zijn zoneband is
export const GRENS_Y = 3600; // px koudwatergrens (zone 4) vóór ontgrendeling
export const GRENS_DUW = 200; // px/s terugduw bij de koudwatergrens
export const VIGNET_STRAAL = 420; // px zichtvignet rond de speler in zone 4

export const START_POS = { x: 1600, y: 400 }; // px startpositie (horizontaal midden, boven in zone 1)
export const DOOD_ANIMATIE = 0.8; // s opgegeten-animatie voor de overlay

export interface ZoneConfig {
  nr: number;
  naam: string;
  vanY: number; // px bovengrens
  totY: number; // px ondergrens (exclusief)
  gewichten: Partial<Record<SoortId, number>>; // spawngewichten in %, som = 100
  snoepSoort: SoortId; // grootste basis-prooigewicht: hiervan snoept de dreiging af
}

export const ZONES: ZoneConfig[] = [
  { nr: 1, naam: 'Riffel-rif',  vanY: 0,    totY: 1200, gewichten: { vlokje: 55, stipje: 35, snapper: 10 },               snoepSoort: 'vlokje' },
  { nr: 2, naam: 'Open Blauw',  vanY: 1200, totY: 2400, gewichten: { stipje: 30, flapper: 35, snapper: 25, kwal: 10 },    snoepSoort: 'flapper' },
  { nr: 3, naam: 'Schemerlaag', vanY: 2400, totY: 3600, gewichten: { flapper: 30, snapper: 30, grombaars: 30, kwal: 10 }, snoepSoort: 'flapper' },
  { nr: 4, naam: 'Inktdiepte',  vanY: 3600, totY: 4800, gewichten: { flapper: 20, grombaars: 60, kwal: 20 },              snoepSoort: 'flapper' },
];

// ── Spawnen & pooling ───────────────────────────────────────────────────────
export const SPAWN_MARGE = 200; // px bovenop de halve schermdiagonaal (≈ 467 + 200 ≈ 667)
export const DESPAWN_AFSTAND = 1600; // px van het cameracentrum
export const MAX_ACTIEF = 60; // max actieve entiteiten (incl. kwallen)
export const POOL_GROOTTE = 80; // objectpool-grootte
export const DOEL_BEZETTING = 50; // gewenste entiteiten binnen de despawnstraal
export const SPAWN_INTERVAL = 0.5; // s tussen spawner-checks
export const SPAWN_ACTIES_MAX = 3; // spawn-acties per check (een school = één actie)
export const SPAWN_POGINGEN = 20; // pogingen om een geldig punt in de ring te vinden

// ── Moeilijkheid (§6 van DESIGN.md) ─────────────────────────────────────────
export const DREIGING_INTERVAL = 30; // s per dreigingsstap
export const DREIGING_MAX = 10; // maximale dreigingswaarde
export const DREIGING_PP_PER_STAP = 2; // pp verschuiving naar roofvisgewicht per stap
export const DREIGING_PP_MAX = 20; // pp maximale totale verschuiving
export const PROOI_VLOER_PCT = 10; // %: het snoep-prooigewicht zakt nooit hieronder
export const DREIGING_SNELHEID_PER_STAP = 0.02; // jaagsnelheid roofvis +2% per stap
export const DREIGING_SNELHEID_MAX = 0.2; // max +20% (apex-burst en vlucht schalen NIET mee)

// ── HUD & besturing ─────────────────────────────────────────────────────────
export const JOYSTICK_STRAAL = 60; // px virtuele joystick (mobiel, links)
export const JOYSTICK_DODE_ZONE = 10; // px dode zone in het midden
export const BOOSTKNOP_STRAAL = 72; // px boostknop (mobiel, rechts)

// ── Opslag, records & unlocks (§7 van DESIGN.md) ────────────────────────────
export const OPSLAG_SLEUTEL = 'hapvis_v1'; // localStorage-sleutel
export const LAATSTE_N_RONDES = 5; // bewaarde recente rondes

export const ZONE4_EIS_FASE = 4; // zone 4 ontgrendelt na 1× deze fase bereiken
export const SKIN_NEON_EIS_GEGETEN = 100; // totaal gegeten voor skin "Neonvisje"
export const SKIN_STEKELBAARS_EIS_FASE = 5; // 1× deze fase voor skin "Stekelbaars"

export interface KleurUnlock {
  id: string;
  drempelScore: number; // hoogste score die de kleur ontgrendelt (0 = start)
}

export const KLEUR_UNLOCKS: KleurUnlock[] = [
  { id: 'oranje', drempelScore: 0 },
  { id: 'groen',  drempelScore: 500 },
  { id: 'paars',  drempelScore: 2000 },
  { id: 'goud',   drempelScore: 5000 },
];

export const STANDAARD_KLEUR = 'oranje';
export const STANDAARD_SKIN = 'gewoon';
