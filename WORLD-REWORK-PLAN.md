# Wereld-rework-plan — repetitieve werelden distinctief maken

> **Voor een verse Claude Code-sessie.** Dit is een zelfstandig uitvoerplan.
> Repo: `C:\Projects\ruimte-spellen-pro` (Windows, PowerShell + Git Bash).
> **Lees eerst** het geheugen `getallen-land-status` (via MEMORY.md) +
> `git log --oneline -8` voor de actuele stand. Dan dit plan uitvoeren.

## Context & doel

"Nul & Co" / Getallen-Land is een data-gedreven Numberblocks-platformer (Phaser 3).
Feedback van de gebruiker: het spel voelt **repetitief** — "elke wereld = één truc
+ lopen". Er is al gedaan (zie git): W18/W19 herbouwd naar 4 distinctieve levels;
de 5 gate-stapelaars opgeschoond; de **anti-herhaling-rubriek wordt globaal
afgedwongen** (`tests/rubriek.test.js`: max 1 "zwaar poort-station" per level).

Een data-analyse (mechanic-gebruik per level) wees uit dat de **objectieve**
herhaling klein was, maar dat een handvol werelden **clone-achtige levels** heeft:
dezelfde signatuur-mechaniek in elk level, met bijna-identieke levels ertussen.
**Dit plan herbouwt die werelden zodat elk level een eigen identiteit krijgt** —
zoals de W18/W19-rework — met behoud van thema, baas, medailles en leerdoel.

**BELANGRIJKSTE ONTWERP-LES (uit W18/W19-mis + herstel):** niet blind alles
herschrijven. Bouw geen 5 levels op één sjabloon. Elk level een eigen set-piece +
structuur; de reken-truc is een *hoogtepunt*, de ruggengraat is **actieve
beweging**. Zie [[interactie-boven-aankleding]] en [[antwoorden-schudden]].

## De rework-werelden (prioriteit) — met bewijs

| Wereld | Signatuur | Probleem (data) |
|---|---|---|
| **W11 Billenland** 🍑 | bil-trampolines + paren-borden (even/oneven) | `bil,paren` in álle 5 levels; **11-2 ≈ 11-4** (beide `wolk,bil,vraag,paren`) |
| **W12 Bubbel-Zee** 🌊 | zwem-zones + duikboot (verliefde getallen) | `zwem`(+`duik`) domineert; **12-1 = 12-3** (identiek `zwem,vraag,duik`) |
| **W7 Pizza-Vulkaan** 🍕 | geisers + kantels + bakkerij (eerlijk delen) | `geiser` in álle 5 levels |
| **W9 Wc-Wonderland** 💩 | wc-rollen + stink-zones + spoelpotten (sommen kiezen) | `wcrol,stink` in 4/5 levels |
| **W17 Circus-Kanon** 🎪 | koorden + kanonnen + weegwippen (wegen/balans) | `koord,kanon,weeg`; **17-4 ≈ 17-5** |

**Optioneel daarna** (lichter): W4 (4-2 is dun: alleen `vraag`), W8 (8-3 is dun:
alleen `glij`). Klein bijwerken volstaat.

**MET RUST LATEN** (al gevarieerd of bewust simpel): W1 (tutorial — bouw-basis),
W2, W3, W5, W6 (finale), W10, W13, W14, W15, W16, W18, W19.

## Per wereld: doel-identiteiten (5 distinctieve levels)

Behoud per wereld: `terrain`, `boss` (look+stijl+stages), medailles
(`adventure_NN_M` / `worldNN_done`), en het leerdoel. Verander de LEVEL-STRUCTUUR.
De signatuur-mechaniek mag in de meeste levels terugkomen (dat is het thema), maar
**elk level krijgt een eigen set-piece, eigen structuur en ≥1 hergebruikte
mechaniek uit een eerdere wereld** (spaced repetition). Schrap de bijna-duplicaten.

- **W11 Billenland** — `bilTrampolines` + `parenBorden` behouden. Voorstel:
  - 11-1 *Stuiter-intro*: een stuiter-parcours (bil-ketting over kloven), leer de
    lancering; 1× paren-bord als toetje. Beweging-eerst.
  - 11-2 *Paren-Plein*: het even/oneven-bord is de ster (2 borden, oplopend) +
    telwolken-klim; géén bil-spam.
  - 11-3 *Duw-Vallei* (al de-gated): duw-kisten + bil-ketting + 1 paren-bord.
  - 11-4 *Hoge Show*: **verticaal** (`worldH:1800`), klim via stuiter-billen naar
    hoge richels, paren-bord op de top. Andere structuur dan 11-2!
  - 11-5 *Stinke-Bil* (baas, stijl `vang`) — aanloop gevarieerd.
  - Hergebruik: telwolken, duw-kist, koord, achtervolging (skin `sneeuwbal`/`bal`).
- **W12 Bubbel-Zee** — `zwemZones` + `duikboten` behouden. Voorstel:
  - 12-1 *Zwem-intro*: een zwem-parcours (op/neer door diep water), 1× duikboot.
  - 12-2 *Koraal-Doolhof*: duw-kisten + zwem-doolhof, **geen** duik (andere beat).
  - 12-3 *Diepzee-Duik*: de duikboot is de ster (tank vullen → varen) + een
    achtervolging (haai, skin `bal`/`komeet`). Schrap de kloon met 12-1.
  - 12-4 *Stroom-Klim*: **verticaal**, zwem-klim omhoog + duikboot boven.
  - 12-5 *Inkt-Octopus* (baas, stijl `tien`).
  - Hergebruik: telwolken, duw-kist, koord, geiser (bubbel-geiser), chase.
- **W7 Pizza-Vulkaan** — `geisers` + `kantels` + `bakkerij` behouden, maar **niet
  in elk level geiser**. Voorstel: één geiser-parcours-level, één kantel-level,
  één bakkerij-level (eerlijk delen als ster), één beweging/chase-level (rollend
  kaaswiel, skin), baas 7-5. Hergebruik telwolken/duw-kist/koord/portaal.
- **W9 Wc-Wonderland** — `wcRollen` + `stinkZones` + `spoelpotten` behouden;
  spreid ze (niet wcrol+stink in elk level). Voorstel: één wc-rol-parcours, één
  stink-lift-level, één spoelpotten-som-level (ster), één beweging/chase-level
  (huppelend drolletje), baas 9-5. Hergebruik telwolken/duw-kist/geiser.
- **W17 Circus-Kanon** — `koorden` + `kanonnen` + `weegWippen` behouden; schrap de
  17-4≈17-5-kloon. Voorstel: koord-gauntlet-level, kanon-ketting-level (over grote
  ravijnen), weeg-puzzel-level (balans als ster), gemengd, baas 17-5. Hergebruik
  telwolken/duw-kist/achtervolging.

> NB: de exacte level-inhoud ontwerp je tijdens de uitvoering, per level de
> validator + rubriek + smoke groen. Bovenstaande zijn richtinggevende schetsen.

## Technische uitvoering (zelfstandig)

**Levels = pure data.** Elk `src/levels/worldNN.js` exporteert 5 (of 4)
`LEVEL_NN_M`-objecten + `export const WORLDNN = [...]`. `WORLDS` staat in
`src/levels/index.js`. **Mechanics = systems** in `src/adventure/systems/*.js`
(elk `{ build(s,L), update?, afterPlayer? }`), geregistreerd in `systems/index.js`.

**Level-schema** (zie een recent bestand, bv. `src/levels/world18.js` als model):
`id`, `naam`, `worldW`, `worldH` (800; verticaal 1800), `killY` (720; vert 1730),
`terrain`, `bg:{top,bottom}`, `start:{x,y}`, `startDoubleJump/Stamp/Duw/Mega:true`,
`intro`, `platforms:[[x,y,w,h]]` (platforms[0] = hoofdvloer; bij verticaal moet dat
de ONDERSTE vloer zijn — systemen ankeren erop), systeem-velden, `pickups`,
`grommels:[{type,x,y,patrol:[lo,hi]}]` (types: stomp/vlieger/springer/werper/
glijder), `star:{x,y}`, `goudenNul:{x,y}`, `goal:{x,y,value}`, `reward:{title,
subtitle,stars,medal,medalLabel}`. Normaal `stars:3, medal:'adventure_NN_M'`; baas
`stars:5, medal:'worldNN_done'` + `boss:{x,name,look,stijl,stages}`.

**HARDE REGELS (de validator `src/adventure/logic.js` + rubriek dwingen af):**
1. **Rubriek**: max **1 "zwaar poort-station"** per level (`ZWARE_POORTEN` in
   logic.js: baskets, bowlingBanen, dinoRitten, flitsSpoken, knopenWinkels,
   koekoeken, maatRekken, parenBorden, patroon, plates, portalen, sneeuwballen,
   tandwielen, thermometers, weegWippen). `vraagMuren` telt NIET mee (licht accent).
2. Doorlopende grond onder elke mechaniek (de validator geeft precieze fouten).
3. `goal` vóórbij de baas; grommel-patrouilles volledig op een platform; killY >
   groundTop; koord `y <= groundTop-40`; enz. — **draai `npm test` en fix elke
   melding** (de validator is expliciet).
4. Keuze-systemen schudden hun opties bij `build` (nooit vaste posities in data).
5. **Tik-valkuil**: tikbare wereld-objecten op sta-hoogte MOETEN `depth ≥ 13` met
   een gecentreerde hit-rect — gebruik `src/adventure/tik.js` `maakTikbaar`.

**Norm**: ~4500-6000px breed (of verticaal), 4-6 beats, actieve-beweging-
ruggengraat, ≥1 hergebruikte mechaniek. Gebruik de bestaande system-bibliotheek
(telWolken, duwKisten+grauwMuren, koorden, achtervolgingen [skins: komeet/bal/
sneeuwbal/spook], glijbanen, portalen, vraagMuren, geisers, maanZones, …).

## Verificatie (per wereld, vóór de volgende)

1. `npm test` — validator keurt alle levels + rubriek (≤1 poort/level) + logica.
   Alles groen (nu 349 tests).
2. `npm run build` — schoon.
3. **Headless smoke** in de preview (Getallen-Land is nu LAZY — Adventure is niet
   vooraf geregistreerd): start dev-server (`preview_start`), dan in de tab:
   `menu = g.scene.getScene('Menu'); menu.launchCluster('WorldMap')` om het
   cluster te laden; dáárna `g.scene.start('Adventure',{levelIndex:IDX})` +
   pomp frames met `g.step(t,16.7)` én **fake `Date.now`** (+16.7/frame; zet terug
   na afloop). Assert: geen exception, systemen instantiëren. Zie
   [[preview-test-hygiene]]. (Tab is `document.hidden` → RAF staat stil, dus
   handmatig pompen; screenshot-tool timet uit → gebruik `g.renderer.snapshot`.)
4. **Gebruiker playtest** de herbouwde wereld op localhost:5173/iPhone. Ouder-modus
   (5× titel-tik in Instellingen) opent alle werelden + de dev-levelkiezer.

## Werkwijze / afspraken

- **Denkstand**: ontwerp = high, bouwen = medium, polish = laag. Kondig wissels aan.
- **Kosten-bewust**: ik bouw + test (npm test/build + headless); **gebruiker
  playtest zelf**.
- **Committen**: lokaal per wereld/mijlpaal (Nederlands, eindig met
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`). **Pushen = pas na
  expliciet "ja"** (publiek → auto-deploy). Commit-identiteit staat goed
  (Camiel20 <camielsmits@live.nl>).
- ⚠️ **Windows**: geen bestanden `nul.*`/`con.*`/`prn.*` (gereserveerde namen).
- Update na elke wereld het geheugen `getallen-land-status`.

## Volgorde
W11 → W12 → W7 → W9 → W17 (grootste clone-winst eerst), elk met playtest-poort.
Daarna optioneel W4/W8 licht bijwerken. **Begin met W11.**
