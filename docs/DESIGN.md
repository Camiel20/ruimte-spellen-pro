# Hapvis — Ontwerp v1 (fase 1)

Eigen naam en vormgeving (geen kopie van een bestaand spel). Onderdeel van Nul & Co:
menutegel 🐟, alle nieuwe code onder `src/vis/` in TypeScript. Volledig offline, geen
binaire assets (graphics via Phaser Graphics → `generateTexture`, geluid via
WebAudio-synthese), opslag alleen via localStorage achter één `SaveManager`.
**Elk getal in dit document wordt letterlijk een constante in `src/vis/GameConfig.ts`**
(voorbeeldnamen in `CODE`), met eenheid en commentaar.

## 1. Gameplayloop

Je start als klein visje (fase 1) in de lichte bovenlaag van een grote scrollende zee.
Je zwemt rond, eet kleinere vissen en groeit in massa; bij vaste massadrempels evolueer
je naar een grotere visvorm. Grotere roofvissen proberen jou te eten; met boost ontsnap
je, ten koste van energie die vanzelf herstelt. Hoe dieper je zwemt, hoe groter de prooi
én het gevaar, en binnen een ronde loopt de dreiging ook op met de tijd. Word je
opgegeten, dan eindigt de ronde: records worden lokaal bijgewerkt en je begint weer klein.

**Ronde & UI:** de scene start direct spelend op `START_POS = (1600, 400)`
(horizontaal midden, boven in zone 1); elke ronde is een volledige reset (pool leeg, dreiging 0, apex-timer 0). Bij
dood: opgegeten-animatie 0,8 s → overlay met rondestats, de records, de laatste 5
rondes, een keuzerij voor ontgrendelde kleuren/skins en knoppen "Nog een keer" +
terugknop (huisstijl). De pauze-overlay toont dezelfde records en keuzerij.

## 2. Voedselketen

Eetregel (geldt beide richtingen, dus ook voor roofvissen die de speler eten):
een eter mag een prooi eten als `prooiRadius <= eterRadius * EET_FACTOR`,
`EET_FACTOR = 0.8` (verhouding, configureerbaar). "Grootte" = botsingsradius in px
(cirkel-botsing).

**Hapafstand — bewust in het voordeel van het kind.** De SPELER hapt zodra de
cirkels elkaar raken: `afstand < eigenRadius + prooiRadius × HAP_HULP` met
`HAP_HULP = 1`. Een roofvis moet de speler écht te pakken krijgen; daar telt
alleen zijn eigen radius ("mond raakt"). Zonder die hulp moet je binnen 12 px van
een bewegend doel mikken — niet te doen voor een zesjarige (speeltest aug 2026).

| Soort        | Gedrag     | Massa | Radius (px) | Kruissnelheid (px/s) | Topsnelheid (px/s) | Score | Zones |
|--------------|------------|------:|------------:|---------------------:|-------------------:|------:|-------|
| Pijltje      | schoolvis  |     2 |           5 |                   55 |          66 (×1,2) |     1 | 1     |
| Vlokje       | prooivis   |     2 |           6 |                   60 |          72 (×1,2) |     1 | 1     |
| Stipje       | schoolvis  |     4 |           8 |                   68 |        81,6 (×1,2) |     2 | 1–2   |
| Fonkeltje    | prooivis   |     4 |           9 |                   68 |        81,6 (×1,2) |     2 | 4     |
| Pruillip     | prooivis   |     6 |          10 |                   72 |        86,4 (×1,2) |     3 | 1     |
| Flapper      | prooivis   |    10 |          12 |                   74 |        88,8 (×1,2) |     5 | 2–4   |
| Maantje      | prooivis   |    16 |          14 |                   76 |        91,2 (×1,2) |     8 | 2–3   |
| Zilverpijl   | schoolvis  |    24 |          16 |                   76 |        91,2 (×1,2) |    12 | 3     |
| Snapper      | roofvis    |    30 |          17 |                   70 |         150 (jaag) |    15 | 1–3   |
| Snorrebol    | prooivis   |    50 |          20 |                   72 |        86,4 (×1,2) |    25 | 4     |
| Bolwang      | prooivis   |    65 |          22 |                   72 |        86,4 (×1,2) |    32 | 3–4   |
| Pijlbek      | roofvis    |    75 |          23 |                   68 |         152 (jaag) |    35 | 2     |
| Grombaars    | roofvis    |    90 |          25 |                   60 |         160 (jaag) |    40 | 3–4   |
| Prikbek      | roofvis    |   253 |          34 |                   62 |         148 (jaag) |   110 | 3–4   |
| Diepteschrik | apex (zeldzaam) | 400 |     44 |                   60 |        260 (burst) |   150 | 4     |
| Hengelbek    | roofvis    |   900 |          72 |                   55 |         138 (jaag) |   250 | 4     |
| Kwal         | gevaar (geen vis) | — |     14 |          zie onder |                  — |     0 | 2–4   |

De ladder is bewust dicht bezet: bij elke spelergrootte zwemt er in de zone waar
je hoort iets eetbaars én iets gevaarlijks. Twee grenzen zijn kritiek: de
**Prikbek** (34) dekt fase 3 (eet t/m radius 27,2) en de **Hengelbek** (72) eet
óók een volgroeide speler (72 × 0,8 = 57,6 > 56) en is zelf nooit eetbaar — die
zorgt dat de ronde altijd kan eindigen. De Hengelbek-score van 250 is daarmee
onbereikbaar in v1 en staat er alleen voor de volledigheid.

Prooivissen vluchten op `VLUCHT_FACTOR = 1.2` × kruissnelheid; jaag-/burstsnelheden
staan los in de tabel. Alle NPC's: acceleratie `NPC_ACCEL = 300` px/s², draaisnelheid
2,5 rad/s (roofvissen 3,0). **Kwal:** drijft verticaal op `KWAL_DRIFT = 20` px/s
(keert elke `KWAL_OMKEER = 4` s om) en slingert horizontaal met een sinus: amplitude
`KWAL_AMPLITUDE = 40` px, periode `KWAL_PERIODE = 3` s. Contact kost
`KWAL_STRAF = 0.10` (10% massa, nooit onder de drempel van de huidige fase), daarna
`ONKWETSBAAR = 1.0` s. **Ecologie v1:** roofvissen jagen en eten alléén de speler;
NPC's eten elkaar niet en groeien niet; de kwal raakt alleen de speler; prooivissen
vluchten wél voor elke grotere vis, ook NPC-roofvissen (gedrag zonder gevolg).
Een roofvis jaagt alleen als hij de speler kán opeten; is de speler groter, dan
vlucht hij op `kruissnelheid × VLUCHT_FACTOR` binnen `PROOI_DETECTIE`. De
Diepteschrik vlucht nooit: die blijft patrouilleren en is zo in fase 5 het
trofee-doel.

**Speler:** start massa 10, radius 12. `SPELER_ACCEL = 400` px/s², demping
`SPELER_DRAG = 250` px/s², draaisnelheid 4,5 rad/s; elke vis kijkt altijd in zijn
bewegingsrichting. Boost: `BOOST_FACTOR = 1.8` × maxsnelheid, energie 0–100,
verbruik 35/s, herstel 20/s, starten vereist ≥ 10 energie.

## 3. Groeicurve

Eten: `massa += prooiMassa * GROEI_OPNAME`, `GROEI_OPNAME = 0.5`. Massa-cap
`MASSA_MAX = 999`. De radius interpoleert lineair met de massa tussen de fasedrempels;
boven fase 5 blijft de radius 56.

| Fase | Naam       | Massadrempel | Radius (px) | Maxsnelheid (px/s) |
|-----:|------------|-------------:|------------:|-------------------:|
| 1    | Grondel    |   10 (start) |          12 |                170 |
| 2    | Baars      |           30 |          17 |                165 |
| 3    | Makreel    |           80 |          24 |                160 |
| 4    | Tonijn     |          200 |          34 |                155 |
| 5    | Reuzenbaars |         500 |          56 |                150 |

Ter controle: fasestap 1→2 ≈ 20 Vlokjes (of 10 Stipjes), 2→3 ≈ 10 Flappers,
3→4 ≈ 8 Snappers, 4→5 ≈ 7 Grombaarzen. De Diepteschrik (radius 44) is pas eetbaar in
fase 5 (44 ≤ 56 × 0,8) en kan de speler eten zolang die radius < 35,2 heeft (t/m begin
fase 4). **Snelheidsbalans (bij dreiging 0; §6 beschrijft hoe dit verschuift):** elke roofvis
is langzamer dan de spelerfasen die hij kan opeten — Snapper 150 < 170 (eet alleen
fase 1), Pijlbek 152 < 165 (t/m radius 18,4), Grombaars 160 < 165 (t/m radius 20),
Prikbek 148 < 160 (t/m radius 27,2), Hengelbek 138 < 150 (eet álles). Deze regel
wordt in `tests/vis-regels.test.ts` over de hele tabel afgedwongen. Alleen de Diepteschrik-burst (260) is
sneller dan zwemmen; daarvoor is boost nodig (fase 4: 155 × 1,8 = 279 > 260; fase 5:
150 × 1,8 = 270 > 260) en de burst schaalt niet mee met de dreiging (§6).

## 4. AI-gedragingen (4 typen)

- **Prooivis** — dwaalt: nieuwe willekeurige richting elke 1,5–3 s. Vlucht recht weg
  van elke grotere vis binnen `PROOI_DETECTIE = 95` px, op vluchtsnelheid.
  Parameters: detectieradius, dwaalinterval, `VLUCHT_FACTOR`.
- **Schoolvis** — boids binnen schoolradius 120 px: separatie gewicht 1,0 (binnen
  24 px), alignment 0,6, cohesie 0,4. Vlucht als prooivis; de school reageert als
  groep. Spawnt in groepjes van `SCHOOL_SPAWN_N = 5` binnen 80 px rond één spawnpunt
  (elk lid telt mee voor `MAX_ACTIEF`). Parameters: schoolradius, drie gewichten,
  separatieafstand, groepsgrootte.
- **Roofvis** — patrouilleert op kruissnelheid (nieuwe richting elke 2–4 s); "ziet"
  de speler alleen binnen zichtradius `ROOF_ZICHT = 220` px én zichthoek 120°;
  onthoudt het laatst-gezien-punt 1,0 s en jaagt daarheen (weet dus niet exact waar
  de speler is). Breekt af na `JAAG_MAX_T = 4` s of als de afstand >
  `JAAG_MAX_AFSTAND = 400` px; daarna 3 s afkoelen. Parameters: patrouille-interval,
  zichtradius/-hoek, geheugen, max tijd/afstand, afkoeltijd.
- **Diepteschrik (apex)** — max 1 tegelijk; elke 30 s een spawnkans van 15%, alleen
  in zone 4. Patrouilleert op 60 px/s; ziet rondom (360°) binnen 260 px; burst
  260 px/s, max 2 s, daarna 6 s rust. Zelfde geheugen- en afbreekregels als de
  roofvis (`JAAG_MAX_T`/`JAAG_MAX_AFSTAND` → `JAAG_AFKOEL`); een burst die
  eindigt doordat de speler uit zicht raakt kost óók `APEX_RUST`, zodat de
  burst niet eindeloos te verlengen is.

## 5. Zones & wereld

Wereld `WERELD_B × WERELD_H = 3200 × 4800` px; 4 horizontale dieptezones van 1200 px.
Canvas is de bestaande 480×800-config. **Camera:** géén zoom in v1 (wereld-px =
scherm-px); volgt de speler met lerp 0,08, geclampt op de wereldbounds. **Randen:**
de speler wordt geclampt op de wereldbounds; NPC-dwaalrichtingen spiegelen naar binnen
binnen `RAND_MARGE = 100` px van een rand. Geen harde zone-binding: een NPC die > 200 px
buiten zijn zoneband dwaalt, buigt zijn dwaalrichting terug.

Een gewicht is de kans op één **spawn-actie**; een schoolvis-actie zet meteen
`SCHOOL_SPAWN_N` vissen neer. Schoolsoorten hebben daarom een laag gewicht — hun
aandeel in wat je ziet is ongeveer vijf keer zo groot.

| Zone | Naam        | Diepte (px) | Spawngewichten                                | Sfeer / gevaar |
|-----:|-------------|-------------|-----------------------------------------------|----------------|
| 1    | Riffel-rif  | 0–1200      | Vlokje 47, Pruillip 23, Snapper 16, Pijltje 8, Stipje 6 | licht, veilig begin |
| 2    | Open Blauw  | 1200–2400   | Flapper 34, Maantje 23, Snapper 17, Pijlbek 12, Kwal 11, Stipje 3 | eerste kwallen |
| 3    | Schemerlaag | 2400–3600   | Flapper 28, Maantje 16, Bolwang 12, Snapper 12, Grombaars 10, Prikbek 10, Kwal 8, Zilverpijl 4 | donkerder tint |
| 4    | Inktdiepte  | 3600–4800   | Flapper 24, Fonkeltje 20, Snorrebol 15, Bolwang 12, Grombaars 11, Prikbek 8, Hengelbek 6, Kwal 4 (+ Diepteschrik-regel) | donkerste laag; zichtvignet rond de speler, straal 420 px |

**Koudwatergrens:** vóór ontgrendeling (1× fase 3 gehaald, permanent — §7) duwt de
grens op y = 3600 de speler terug met `GRENS_DUW = 200` px/s, met een zichtbare
kleurband én een bordje dat vertelt wat je moet halen. **Spawnen: nooit in of vlak bij beeld** — afstand tot het cameracentrum
≥ halve schermdiagonaal + `SPAWN_MARGE = 120` px (bij 480×800: ≈ 467 + 120 = 587 px);
despawn bij > `DESPAWN_AFSTAND = 1050` px. Maximaal `MAX_ACTIEF = 60` actieve
entiteiten (incl. kwallen) uit een object-pool van 80; doelbezetting = 50
entiteiten binnen de despawnstraal rond het cameracentrum. **Die straal bepaalt
hoe vol de zee oogt:** op 1600 px stonden dezelfde 50 vissen uitgesmeerd over
6,6 miljoen px² en kwamen er gemeten 2 in beeld; op 1050 px zijn dat er ~10,
zonder extra vissen en dus zonder prestatiekosten. De spawner checkt elke `SPAWN_INTERVAL = 0,5` s en
doet max 3 spawn-acties per check; een school telt als één actie (5 leden tegelijk,
alleen als de pool nog ≥ 5 plekken vrij heeft). Geen objectcreatie per frame; alles
via de pool. Bij
rondestart wordt de ring tussen 667 en 1600 px direct tot de doelbezetting gevuld:
het beeld begint leeg en stroomt binnen enkele seconden vol.

## 6. Moeilijkheidsopbouw

Eén dreigingswaarde per ronde: start 0, +1 per `DREIGING_INTERVAL = 30` s, max 10.
Per stap: **(a)** +2 procentpunt op het tótale roofvisgewicht per zone, naar rato
verdeeld over de roofvissoorten van de zone (zone 3: +1 pp Snapper, +1 pp Grombaars),
afgesnoept van het grootste **basis**-prooigewicht van de zone (zone 1: Vlokje;
zones 2–4: Flapper) — dat zakt nooit onder 10% (zone 4 stopt dus bij +10 pp, de rest
haalt +20 pp); **(b)** de jaagsnelheid van Snapper en Grombaars +2% per stap
(max +20%). Vluchtsnelheden en de Diepteschrik-burst schalen níet mee, zodat
boost-ontsnappen altijd blijft werken (max: Snapper 180 < fase-1-boost 306;
Grombaars 192 < fase-2-boost 297; burst 260 < laagste boost 270). Zonder boost
verschuift het wel: de Grombaars passeert fase-2-zwemmen (165) al vanaf stap 2 en
fase-1-zwemmen (170) vanaf stap 4; de Snapper passeert fase-1-zwemmen vanaf stap 7.
Ontsnappen kost dan boost of scherp draaien — bewust: wie klein diep blijft hangen,
moet boosten. De diepte is de tweede moeilijkheids-as; die kiest de speler
zelf.

## 7. Bestanden & afhankelijkheden

| Module | Doet | Mag kennen |
|--------|------|------------|
| `src/vis/GameConfig.ts` | alle tuningwaarden, met eenheid + commentaar | niets |
| `src/vis/logic/regels.ts` | `kanEten`, `massaNaEten`, `radiusVoorMassa`, `faseVoorMassa` | GameConfig |
| `src/vis/logic/moeilijkheid.ts` | dreigingsniveau(t), spawngewicht- en snelheidsfactor | GameConfig |
| `src/vis/logic/spawn.ts` | spawnpunt-keuze (buiten beeld) + soortkeuze per zone (rng als parameter, deterministisch testbaar) | GameConfig |
| `src/vis/logic/sturing.ts` | pure steering-helpers: vluchtvector, jaagbesluit, schoolkrachten | GameConfig |
| `src/vis/logic/boek.ts` | vissenboek: welke soorten, ontdekt/op slot, volgorde | GameConfig, regels |
| `src/vis/SaveManager.ts` | records, unlocks + vangst in localStorage (sleutel `hapvis_v1`) | GameConfig; géén Phaser |
| `src/vis/graphics.ts` | getekende textures: visvormen (oog, vinnen, staart — vrolijke cartoonstijl), kwal, joystick, knoppen, boek-plaatjes | Phaser, GameConfig |
| `src/vis/geluid.ts` | WebAudio-synth: hap, fase-fanfare, boost, au, einde-deuntje | niets van Phaser |
| `src/vis/BoekOverlay.ts` | tekent het vissenboek-raster (alleen opbouw, geen toestand) | Phaser, GameConfig, boek |
| `src/vis/VisScene.ts` | de Phaser-scene: pooling, input, camera, HUD, pauze-/dood-overlay | alles hierboven |

Modules onder `logic/` en `SaveManager` importeren géén Phaser → unit-testbaar met
vitest (al aanwezig): `tests/vis-*.test.ts` voor eetregel, groei/fase/radius,
moeilijkheidscurve, spawnafstand + soortkeuze, SaveManager (localStorage-stub).
Integratie: `src/main.js` registreert `VisScene`; menutegel 🐟 in `MenuScene`.

**HUD:** score linksboven, energiebalk onderin (met drempelstreep op 10),
fase-voortgangsbalkje (massa → volgende drempel), pauzeknop rechtsboven, en langs
de rechterrand een **dieptemeter**: de vier zones als gekleurde banden met een
markering waar je zwemt en strepen over de zone die nog op slot zit. Bij het
passeren van een zonegrens verschijnt kort de zonenaam, en zodra je fase
`HINT_DIEPTE_FASE` haalt terwijl je nog in zone 1 rondhangt, wijst een eenmalige
hint naar beneden. Massa-getal en dreiging worden níet getoond. **Records (SaveManager):** hoogsteScore,
langsteOverleving (s), grootsteMassa (+ bijbehorende fase = "grootste vis"),
meesteGegeten (één ronde), laatste 5 rondes {score, duur, fase, gegeten, datum},
totaalGegeten, gekozenKleur, gekozenSkin. **Unlocks:** kleuren Groen/Paars/Goud bij
score ≥ 500 / 2000 / 5000; visvorm-skin "Neonvisje" bij 100 totaal gegeten;
"Stekelbaars" bij 1× fase 5; zone 4 bij 1× fase 3. Kiezen op de dood-/pauze-overlay
(§1); skins/kleuren zijn puur cosmetisch. Score = som van de score-kolom in §2, alleen
door te eten. De kleur-drempels worden ook tíjdens het spel getoond: op de eindkaart
staat hoeveel punten de volgende kleur nog kost, en bij het passeren van een drempel
verschijnt kort een melding.

## 8. Vissenboek

Een permanente verzameling van de **16 vissoorten** (de Kwal telt niet mee:
`gedrag === 'gevaar'`). Gekozen boven score-missies omdat het beeld is in plaats
van tekst — een kind van 5-6 leest nog niet, maar ziet meteen welk vakje leeg is.

- **Ontdekregel:** een soort komt in het boek als je hem opeet **óf als hij jou
  opeet**. Dat geeft de Hengelbek (radius 72, nooit eetbaar: 72 × 0,8 = 57,6 > 56)
  een plek, en maakt van opgegeten worden ook iets om te ontdekken.
- **Opslag:** `vangst` in de SaveManager — per soort het aantal keer gegeten.
  Sleutel aanwezig = ontdekt; waarde 0 = "ontmoet" (hij at jou op).
- **Weergave:** raster van 4 × 4 op de volle kaart, gesorteerd op oplopende radius,
  zodat het boek de voedselketen leest. Ontdekt = het echte visplaatje + naam +
  teller; nog niet ontdekt = hetzelfde silhouet in donker met een `?`. Per tegel
  stippen in de zonekleuren van de dieptemeter, zodat zichtbaar is wáár die vis
  zwemt. Soorten die alleen in zone 4 leven tonen 🔒 + "haal fase
  `ZONE4_EIS_FASE`" zolang de Inktdiepte dicht is.
- **Bereikbaar** vanaf de pauzekaart én de eindkaart. Tijdens het spelen verschijnt
  bij een eerste vangst kort "NIEUW! <naam>".
- **Plaatjes** worden apart gebakken op boekgrootte (straal `BOEK_VIS_R`), niet
  opgeschaald: de speltextures staan op spelgrootte en het Pijltje (radius 5) zou
  anders 3× vergroot worden. Ze worden lui gebakken bij het openen en weer
  opgeruimd bij het sluiten, zodat het videogeheugen in rust gelijk blijft.

## 9. Beloningen in de app

Hapvis levert sterren en medailles aan Nul & Co (dit vervangt de eerdere keuze
"geen koppeling"). Sterren gaan naar de gedeelde pot in `src/progress.js` en zijn
dus ook in het Plakboek te besteden.

- **Sterren per ronde:** `score / STER_PER_SCORE`, naar beneden afgerond, met een
  plafond van `STERREN_MAX_RONDE` — zodat één lange ronde de sterrenpot niet
  scheeftrekt.
- **Medailles** (`giveMedal`, getoond op Hapvis' eigen eindkaart): `vis_diep`
  (Inktdiepte bereikt), `vis_reus` (fase 5 bereikt), `vis_apex` (een Diepteschrik
  opgegeten), `vis_boek` (alle 16 soorten in het boek).

## 10. Niet in versie 1

**Besturing:** mobiel — virtuele joystick links (straal 60 px, dode zone 10 px),
boostknop rechts (straal 72 px), pauzeknop rechtsboven; desktop — WASD/pijltjes,
spatie = boost, Esc = pauze.

## 8. Niet in versie 1

- Geen missies of quests, en met name geen terugkerende/resetbare opdrachten: dat
  is een retentiemechaniek voor volwassenen en wordt bij een kind een verplichting.
  Het vissenboek (§8) is bewust een permanente verzameling.
- Geen power-ups (behalve boost) of baasgevechten.
- Geen achtergrondmuziek (alleen SFX); geen instellingenscherm (alleen pauze).
- Geen koppeling met het Plakboek zelf: Hapvis levert sterren (§9), maar krijgt
  geen eigen stickerpagina — anders kun je een vissenalbum vullen zonder Hapvis
  te spelen.
- Geen dag/nacht, weer of stromingen; geen gamepad; geen save van een lopende ronde.
- Geen extra speelbare soorten met eigen gedrag of stats (skins zijn puur cosmetisch).
- Geen NPC-onderlinge ecologie (roofvissen eten alleen de speler, zie §2).

## Aannames

1. **Integratie in dit bestaande Nul & Co-project** (JavaScript): nieuwe code in
   TypeScript onder `src/vis/`; fase 2 voegt `typescript` als devDependency toe plus
   een tsconfig die alleen `src/vis/` en de vis-tests strikt checkt. Vite en vitest 4
   verwerken `.ts` out of the box; Phaser 3.80 levert eigen typedefinities mee.
2. Canvas blijft de bestaande 480×800 portret-config (Scale.FIT) — het spel is dus
   portret, ook op desktop, net als de andere Nul & Co-spellen.
3. De spec-ontgrendeling "vissoorten" is geïnterpreteerd als **cosmetische
   visvorm-skins** (geen eigen gedrag); zeg het als je speelbare soorten met eigen
   stats bedoelde, dan wordt dat een latere versie.
4. Records/unlocks in een eigen localStorage-sleutel (`hapvis_v1`), los van
   `progress.js`; koppeling met sterren/medailles kan later.
5. Bestandsnaam `docs/DESIGN.md` zoals gevraagd; hernoemen naar bv.
   `docs/HAPVIS-DESIGN.md` kan, want de repo-root heeft al een `GAME-DESIGN.md`
   (Getallen-Land).
6. Alle teksten in het spel zijn Nederlands; geluid krijgt een eigen `geluid.ts`
   (synthese), los van het bestaande `sound.js`, zodat het spel zelfstandig blijft.
7. Fase 1 levert alleen dit document; de checks `npx tsc --noEmit` / `npm run build` /
   `npm test` gelden vanaf fase 2 (de TS-toolchain bestaat nu nog niet).
