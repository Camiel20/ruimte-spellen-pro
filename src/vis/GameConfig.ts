// Hapvis — alle tuningwaarden op één plek. Elk getal komt letterlijk uit
// docs/DESIGN.md; wijzig het daar én hier tegelijk. Eenheden: px = wereldpixels
// (v1 heeft geen camera-zoom, dus wereld-px = scherm-px), s = seconden,
// rad = radialen, pp = procentpunt. Geen magische getallen buiten dit bestand.

export type Gedrag = 'prooivis' | 'schoolvis' | 'roofvis' | 'apex' | 'gevaar';

export type SoortId =
  | 'pijltje'
  | 'vlokje'
  | 'stipje'
  | 'fonkeltje'
  | 'pruillip'
  | 'flapper'
  | 'maantje'
  | 'zilverpijl'
  | 'snapper'
  | 'snorrebol'
  | 'bolwang'
  | 'pijlbek'
  | 'grombaars'
  | 'prikbek'
  | 'diepteschrik'
  | 'hengelbek'
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
/**
 * Hoeveel van de PROOI-straal meetelt bij het happen. Op 0 moet het middelpunt
 * van de prooi binnen je eigen straal komen (12 px in fase 1 — veel te precies
 * voor een kind). Op 1 hap je zodra de cirkels elkaar raken. Geldt alleen als
 * de SPELER eet; roofvissen moeten de speler nog steeds echt te pakken krijgen.
 */
export const HAP_HULP = 1;

// ── Voedselketen (tabel §2 van DESIGN.md) ───────────────────────────────────
// De radius-ladder is bewust dicht bezet: bij elke spelergrootte moet er in de
// zone waar je hoort iets eetbaars ÉN iets gevaarlijks zwemmen. Een roofvis met
// radius R eet spelers t/m R × EET_FACTOR; controleer die keten bij elke wijziging
// (tests/vis-regels.test.ts pint de tabel vast).
export const SOORTEN: Record<SoortId, SoortConfig> = {
  // ── kleine hapjes ─────────────────────────────────────────────────────────
  pijltje:      { gedrag: 'schoolvis', massa: 2,   radius: 5,  kruisSnelheid: 55, topSnelheid: 66,   score: 1,   zones: [1] },
  vlokje:       { gedrag: 'prooivis',  massa: 2,   radius: 6,  kruisSnelheid: 60, topSnelheid: 72,   score: 1,   zones: [1] },
  stipje:       { gedrag: 'schoolvis', massa: 4,   radius: 8,  kruisSnelheid: 68, topSnelheid: 81.6, score: 2,   zones: [1, 2] },
  fonkeltje:    { gedrag: 'prooivis',  massa: 4,   radius: 9,  kruisSnelheid: 68, topSnelheid: 81.6, score: 2,   zones: [4] },
  pruillip:     { gedrag: 'prooivis',  massa: 6,   radius: 10, kruisSnelheid: 72, topSnelheid: 86.4, score: 3,   zones: [1] },
  flapper:      { gedrag: 'prooivis',  massa: 10,  radius: 12, kruisSnelheid: 74, topSnelheid: 88.8, score: 5,   zones: [2, 3, 4] },
  maantje:      { gedrag: 'prooivis',  massa: 16,  radius: 14, kruisSnelheid: 76, topSnelheid: 91.2, score: 8,   zones: [2, 3] },
  zilverpijl:   { gedrag: 'schoolvis', massa: 24,  radius: 16, kruisSnelheid: 76, topSnelheid: 91.2, score: 12,  zones: [3] },
  // ── middenmoot: prooi én jager ────────────────────────────────────────────
  snapper:      { gedrag: 'roofvis',   massa: 30,  radius: 17, kruisSnelheid: 70, topSnelheid: 150, score: 15,  zones: [1, 2, 3] },
  snorrebol:    { gedrag: 'prooivis',  massa: 50,  radius: 20, kruisSnelheid: 72, topSnelheid: 86.4, score: 25,  zones: [4] },
  bolwang:      { gedrag: 'prooivis',  massa: 65,  radius: 22, kruisSnelheid: 72, topSnelheid: 86.4, score: 32,  zones: [3, 4] },
  pijlbek:      { gedrag: 'roofvis',   massa: 75,  radius: 23, kruisSnelheid: 68, topSnelheid: 152, score: 35,  zones: [2] },
  grombaars:    { gedrag: 'roofvis',   massa: 90,  radius: 25, kruisSnelheid: 60, topSnelheid: 160, score: 40,  zones: [3, 4] },
  // ── zwaargewichten ────────────────────────────────────────────────────────
  prikbek:      { gedrag: 'roofvis',   massa: 253, radius: 34, kruisSnelheid: 62, topSnelheid: 148, score: 110, zones: [3, 4] },
  diepteschrik: { gedrag: 'apex',      massa: 400, radius: 44, kruisSnelheid: 60, topSnelheid: 260, score: 150, zones: [4] },
  // De Hengelbek is de enige die ook een volgroeide speler (radius 56) opeet:
  // 72 × 0,8 = 57,6. Zelf is hij nooit eetbaar — hij blijft dus altijd gevaarlijk.
  hengelbek:    { gedrag: 'roofvis',   massa: 900, radius: 72, kruisSnelheid: 55, topSnelheid: 138, score: 250, zones: [4] },
  kwal:         { gedrag: 'gevaar',    massa: 0,   radius: 14, kruisSnelheid: 0,  topSnelheid: 0,   score: 0,   zones: [2, 3, 4] },
};

/**
 * Nederlandse namen — kolom 1 van de tabel in §2 van DESIGN.md. Bewust NAAST
 * `SOORTEN` en niet erin: die tabel wordt in tests/vis-regels.test.ts letterlijk
 * vastgepind als wisselbeveiliging, en een naam is geen speltuning.
 */
export const SOORT_NAAM: Record<SoortId, string> = {
  pijltje: 'Pijltje',
  vlokje: 'Vlokje',
  stipje: 'Stipje',
  fonkeltje: 'Fonkeltje',
  pruillip: 'Pruillip',
  flapper: 'Flapper',
  maantje: 'Maantje',
  zilverpijl: 'Zilverpijl',
  snapper: 'Snapper',
  snorrebol: 'Snorrebol',
  bolwang: 'Bolwang',
  pijlbek: 'Pijlbek',
  grombaars: 'Grombaars',
  prikbek: 'Prikbek',
  diepteschrik: 'Diepteschrik',
  hengelbek: 'Hengelbek',
  kwal: 'Kwal',
};

/**
 * Vissenboek: hoe vaak de speler elke soort ooit opat. Sleutel aanwezig =
 * ontdekt; waarde 0 = "ontmoet" (die soort at de speler op).
 */
export type Vangst = Partial<Record<SoortId, number>>;

/**
 * Vluchtsnelheid prooi = kruissnelheid × dit. Stond op 1,6; toen liep je op je
 * eerste "grote hapje" maar 26 px/s in en was vangen praktisch onmogelijk —
 * ook voor een volwassene (speeltest aug 2026).
 */
export const VLUCHT_FACTOR = 1.2;
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
export const SPELER_DRAAI = 4.5; // rad/s max draaisnelheid (wendbaar genoeg om bij te sturen)

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
// px: prooi vlucht voor grotere vis binnen deze afstand. Stond op 140; toen
// begon alles al te vluchten voordat je in de buurt was.
export const PROOI_DETECTIE = 95;
export const DWAAL_MIN = 1.5; // s min. dwaalinterval prooivis
export const DWAAL_MAX = 3.0; // s max. dwaalinterval prooivis

export const SCHOOL_RADIUS = 120; // px boids-buurradius
export const SCHOOL_SEPARATIE_AFSTAND = 24; // px: separatie geldt binnen deze afstand
export const SCHOOL_SEPARATIE = 1.0; // gewicht separatie
export const SCHOOL_ALIGNMENT = 0.6; // gewicht alignment
export const SCHOOL_COHESIE = 0.4; // gewicht cohesie
export const SCHOOL_SPAWN_N = 5; // leden per school-spawn (één spawn-actie)
export const SCHOOL_SPAWN_STRAAL = 80; // px spreiding rond het spawnpunt
export const SCHOOL_MAX_BUREN = 10; // max buren in de boids-som (meer verandert niets merkbaars)

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
export const VIGNET_STRAAL = 420; // px: tot hier ziet de speler in zone 4 nog goed
export const VIGNET_KERN = 0.55; // aandeel van die straal dat volledig helder blijft

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

// LET OP: een gewicht is de kans op één SPAWN-ACTIE, en een schoolvis-actie zet
// SCHOOL_SPAWN_N vissen neer. Schoolsoorten hebben hier dus een laag gewicht:
// hun aandeel in wat je ziet is ongeveer vijf keer zo groot.
export const ZONES: ZoneConfig[] = [
  { nr: 1, naam: 'Riffel-rif',  vanY: 0,    totY: 1200,
    gewichten: { vlokje: 47, pruillip: 23, snapper: 16, pijltje: 8, stipje: 6 },
    snoepSoort: 'vlokje' },
  { nr: 2, naam: 'Open Blauw',  vanY: 1200, totY: 2400,
    gewichten: { flapper: 34, maantje: 23, snapper: 17, pijlbek: 12, kwal: 11, stipje: 3 },
    snoepSoort: 'flapper' },
  { nr: 3, naam: 'Schemerlaag', vanY: 2400, totY: 3600,
    gewichten: { flapper: 28, maantje: 16, bolwang: 12, snapper: 12, grombaars: 10, prikbek: 10, kwal: 8, zilverpijl: 4 },
    snoepSoort: 'flapper' },
  { nr: 4, naam: 'Inktdiepte',  vanY: 3600, totY: 4800,
    gewichten: { flapper: 24, fonkeltje: 20, snorrebol: 15, bolwang: 12, grombaars: 11, prikbek: 8, hengelbek: 6, kwal: 4 },
    snoepSoort: 'flapper' },
];

// ── Spawnen & pooling ───────────────────────────────────────────────────────
export const SPAWN_MARGE = 120; // px bovenop de halve schermdiagonaal (≈ 467 + 120 ≈ 587)
/**
 * px van het cameracentrum. Stond op 1600: de 50 vissen waren toen uitgesmeerd
 * over een ring van 6,6 miljoen px², waarvan je scherm maar 6% ziet — gemeten
 * kwamen er 2 vissen in beeld en voelde de zee leeg. Op 1050 zit dezelfde
 * populatie in een veel kleiner gebied, zonder extra vissen (dus zonder
 * prestatiekosten).
 */
export const DESPAWN_AFSTAND = 1050;
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

// ── Leesbaar gevaar (§10.1 van DESIGN.md) ───────────────────────────────────
// Het roofdierbrein (zichtkegel, geheugen, afhaken) bestond al maar was
// onzichtbaar; zonder beeld is ontwijken geen vaardigheid maar pech.
export const ALARM_BADGE_HOOGTE = 26; // px boven de vis waar het uitroepteken zweeft
export const ALARM_POOL = 6; // aantal alarm-badges (meer jagers tegelijk komt niet voor)
export const ALARM_RING_DIKTE = 2.5; // px lijndikte van de rode ring om een jager
export const ALARM_RING_MARGE = 6; // px dat de ring buiten de botsingsradius valt
export const ALARM_PULS = 6; // pulsen/s van ring en badge
export const ALARM_GELUID_PAUZE = 1.2; // s minimale stilte tussen twee "gespot"-tonen
export const RANDWAARSCHUWING_AFSTAND = 700; // px waarbinnen de randgloed opkomt
// De gloed wordt verdeeld over de vier randen naar richting, dus één rand krijgt
// bij een schuine hoek maar een deel. Op 0,5 was er in beeld nagenoeg niets te
// zien (gemeten: 0,14 alpha bij een jager op 192 px schuin rechtsboven).
export const RANDWAARSCHUWING_MAX = 0.8;
export const RANDWAARSCHUWING_DIKTE = 110; // px breedte van de gloedband langs de rand

// ── Luchtbelschild (§10.2 van DESIGN.md) ────────────────────────────────────
export const SCHILD_HAPPEN = 12; // happen om een geklapt schild terug te verdienen
export const SCHILD_ONKWETSBAAR = 1.5; // s onaanraakbaar na een klap
export const SCHILD_TERUGSTOOT = 260; // px/s waarmee je van de jager weg schiet
export const SCHILD_PULS = 1.6; // pulsen/s van de bel (rustig ademen)

// ── Gebeurtenissen (§10.3 van DESIGN.md) ────────────────────────────────────
export const GEBEURTENIS_EERSTE = 25; // s tot de eerste gebeurtenis van een ronde
export const GEBEURTENIS_PAUZE_MIN = 35; // s min. rust tussen twee gebeurtenissen
export const GEBEURTENIS_PAUZE_MAX = 55; // s max. rust tussen twee gebeurtenissen
export const PARADE_DUUR = 12; // s
export const PARADE_TEMPO = 2; // × spawntempo tijdens de parade
export const STILTE_DUUR = 10; // s
export const JACHT_DUUR = 14; // s
export const JACHT_PP = 12; // pp extra roofvisgewicht tijdens de jachttijd
export const GEBEURTENIS_BANNER = 2.6; // s dat de aankondiging blijft staan
export const STILTE_LICHT = 0.12; // aandeel waarmee het water optrekt tijdens de stilte
export const JACHT_DONKER = 0.14; // aandeel waarmee het water verduistert bij jachttijd

// ── Gevoel (§10.4 van DESIGN.md) ────────────────────────────────────────────
export const HITSTOP = 0.055; // s bevriezen bij een flinke hap
export const HITSTOP_MIN_R = 12; // px prooistraal vanaf waar de hitstop aangaat
export const HITSTOP_FASE = 0.12; // s bevriezen bij een nieuwe fase
export const COMBO_TIJD = 2.0; // s venster waarbinnen een volgende hap meetelt
export const COMBO_MIN = 3; // vanaf deze combo verschijnt de teller en het bonuspunt
export const COMBO_BONUS = 1; // punten extra per stap boven COMBO_MIN
export const COMBO_TOON_STAP = 60; // Hz die de hap-toon per combostap stijgt
export const COMBO_TOON_MAX = 480; // Hz maximale stijging (anders wordt het gepiep)
export const SFEER_VOLUME = 0.05; // volume van de onderwater-drone (0..1)

// ── Gouden nullen (§10.5 van DESIGN.md) ─────────────────────────────────────
export const NUL_INTERVAL = 20; // s tussen spawnkans-rollen
export const NUL_KANS = 0.5; // kans per rol
export const NUL_MAX_ACTIEF = 1; // hoeveel gouden nullen tegelijk in de wereld
export const NUL_RADIUS = 16; // px botsingsradius (ruim: hij mag makkelijk te pakken zijn)
export const NUL_SCORE = 25; // punten bij het oppikken
export const NUL_DRIFT = 26; // px/s waarmee hij omhoog zweeft
export const NUL_AMPLITUDE = 34; // px horizontale slinger
export const NUL_PERIODE = 2.6; // s periode van die slinger
export const NUL_MEDAILLE_EIS = 25; // totaal opgepikte nullen voor de medaille

// ── Finale: reuzenkracht & winnen (§10.6 van DESIGN.md) ─────────────────────
export const MEGA_DUUR = 18; // s reuzenkracht na het opeten van een Diepteschrik
/**
 * × botsingsradius tijdens de reuzenkracht. Op je grootst: 56 × 1,8 = 100,8.
 * Om een Hengelbek (72) te mogen eten is 72 / 0,8 = 90 nodig, dus dat past met
 * marge; omgekeerd is 100,8 > 57,6 zodat niets jou dan nog kan opeten.
 */
export const MEGA_FACTOR = 1.8;
export const MEGA_WAARSCHUWING = 5; // s waarin de meter knippert voor het aflopen
export const MEGA_TINT = 0xffe066; // goudgloed over de speler (art, maar hoort bij de regel)

// ── HUD & besturing ─────────────────────────────────────────────────────────
export const HINT_DIEPTE_FASE = 2; // vanaf deze fase wijst een hint naar beneden
export const HINT_DUUR = 3.5; // s dat zo'n hint blijft staan

export const JOYSTICK_STRAAL = 60; // px virtuele joystick (mobiel, links)
export const JOYSTICK_DODE_ZONE = 10; // px dode zone in het midden
export const JOYSTICK_ZONE_B = 0.62; // aandeel schermbreedte waarin een tik stuurt
export const JOYSTICK_ZONE_H = 0.35; // vanaf dit aandeel schermhoogte stuurt een tik
export const BOOSTKNOP_STRAAL = 72; // px boostknop (mobiel, rechts)

// ── Opslag, records & unlocks (§7 van DESIGN.md) ────────────────────────────
export const OPSLAG_SLEUTEL = 'hapvis_v1'; // localStorage-sleutel
export const LAATSTE_N_RONDES = 5; // bewaarde recente rondes

export const ZONE4_EIS_FASE = 3; // zone 4 ontgrendelt na 1× deze fase bereiken
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

// ── Beloningen in de app (§9 van DESIGN.md) ─────────────────────────────────
export const STER_PER_SCORE = 250; // punten per ster aan het eind van een ronde
export const STERREN_MAX_RONDE = 8; // plafond, zodat één lange ronde de pot niet scheeftrekt

/** Medaille-id's; moeten exact zo in ALL_MEDALS van AwardsScene.js staan. */
export const MEDAILLE_DIEP = 'vis_diep'; // de Inktdiepte bereikt
export const MEDAILLE_REUS = 'vis_reus'; // fase 5 bereikt
export const MEDAILLE_APEX = 'vis_apex'; // een Diepteschrik opgegeten
export const MEDAILLE_BOEK = 'vis_boek'; // alle soorten in het vissenboek
export const MEDAILLE_NUL = 'vis_nul'; // NUL_MEDAILLE_EIS gouden nullen opgepikt
export const MEDAILLE_KONING = 'vis_koning'; // de Hengelbek opgegeten: gewonnen (§10.6)
