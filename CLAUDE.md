# Nul & Co (voorheen "Ruimte Spellen Pro")

Een verzameling kinderspellen, gemaakt voor Adrian. Gebouwd met **Phaser 3**
(game-engine) en **Vite** (bouwtool). Persoonlijk/privé project.

## Merk & huisstijl (rebrand juli 2026)
- **App-naam: "Nul & Co"** ("spelen met getallen"); mascotte = **Nul**, een
  vrolijke ronde nul (`maakNul` in `src/theme.js`). De repo-naam en de
  GitHub Pages-URL blijven `ruimte-spellen-pro` (anders breekt de link/deploy).
- **`src/theme.js` = de huisstijl**: `luchtAchtergrond()` (lichte lucht, zon,
  wolkjes, gras), `maakNul()`, `terugKnop()`, `schermTitel()`. Alle
  systeemschermen (menu, prijzenkast, statistieken, instellingen, schrijf-menu)
  gebruiken dit lichte thema; donkere ruimte-decors bestaan alleen nog BINNEN
  spellen als bestemming (Nul-Raket, Planeet Tikker, e.d.).
- `public/icon.png` (512, Nul-mascotte) wordt gegenereerd met een zelfgeschreven
  Node-script (rasterisatie + PNG via node:zlib) — geen externe libraries.
- Manifest/index/theme-color: licht (`#bfe3fb`); iOS-statusbalk `default`.

## Draaien
```bash
npm install      # eenmalig
npm run dev      # lokaal spelen (open de link die verschijnt)
npm run build    # productie-build naar dist/
```

## Structuur
- `src/main.js` — registreert alle spellen (scenes).
- `src/scenes/*` — elk spel is een aparte Phaser-scene (o.a. `ClickerScene.js` = "Planeet Tikker", `NumberTowerScene.js` = "Getallen-Toren", `MathScene.js` = "Reken-Raket", `ZeroRocketScene.js` = "Nul-Raket", `StickerScene.js` = "Plakboek", `BezorgScene.js` = "Bezorg-Baas"). Getallen-Land = `WorldMapScene` + `AdventureScene`.
- `MenuScene.js` heeft een **Numberblocks-thema** (heldere lucht, zon, wolkjes, zwevende cijfer-kubussen; tegels als felle kubussen met dikke donkere rand).
- `src/glyphs.js` — gedeelde cijfer-/letterpaden + `TraceChallenge` (schrijf-overlay), gebruikt door het schrijfspel én Planeet Tikker.
- `src/progress.js` — voortgang (sterren, medailles, topscores, instellingen) in localStorage.
- `src/stats.js` — speel-statistieken (hoe vaak + hoe lang per spel) in localStorage; `installTracking(game)` koppelt zich aan de scene-events. Bekijken via `StatsScene.js` ("Statistieken", 📊-knop in het menu).
- `public/` — afbeeldingen, geluiden, icon, manifest.

## Hosting & deploy
- GitHub: https://github.com/Camiel20/ruimte-spellen-pro (openbaar, nodig voor gratis Pages).
- Speelbare link: https://camiel20.github.io/ruimte-spellen-pro/
- Auto-deploy via `.github/workflows/deploy.yml` bij elke push naar `master` (1–2 min).

## Werkwijze / belangrijke afspraken
- **Canonieke map: `C:\Projects\ruimte-spellen-pro`.** NIET in OneDrive werken — OneDrive-sync brak eerder de git-koppeling en maakte dubbele mappen.
- **Commit-identiteit:** persoonlijk account `Camiel20`, e-mail `camielsmits@live.nl` (NIET het werk-account). Na een verse `git clone` zo instellen:
  ```bash
  git config user.name "Camiel20"
  git config user.email "camielsmits@live.nl"
  ```
- **Sessie hervatten** met `claude -c` (of `claude --resume`) in deze map, zodat context behouden blijft.
- **GitHub-login / pushen:** authenticatie loopt via GitHub CLI (`gh`). Het token verloopt af en toe; dan voelt het als "koppeling kwijt". Herstellen: `gh auth login -h github.com` (kies GitHub.com → HTTPS → browser, log in als **Camiel20**), eventueel `gh auth setup-git`, daarna `git push origin master`. De git-config zelf (account, remote) blijft gewoon goed staan.

## Planeet Tikker (`src/scenes/ClickerScene.js`)
Idle/tik-spel. Recent toegevoegd voor Adrian (houdt van het cijfer 0):
- Volledige getallen met alle nullen i.p.v. afkortingen (`fmt()`), score krimpt mee.
- Nullen-teller + feestje bij elke nieuwe nul (macht van 10).
- Cijfer-0 toegevoegd aan de schrijf-oefeningen (`glyphs.js`), met extra kans.
- Doorgroeien tot triljoen (10^18): meer planeten, kleuren, mijlpalen en winkel-upgrades.
- Gouden nullen vangen voor een bonus.
- **Ruimte-spel = eigen donkere kosmos-achtergrond** (gradient + sterren, `depth -2`).
  Net als Nul-Raket mag het donker zijn (bestemming). BELANGRIJK: scenes die geen
  eigen achtergrond tekenen schijnen nu de lichte app-canvas (`#bfe3fb`) door —
  elk ruimte-spel MOET dus zelf een achtergrond vullen (rebrand-valkuil, juli 2026).

### Openstaande ideeën (nog niet gebouwd)
- Nullen-medailles in het prijzenscherm (`AwardsScene.js`).

## Ballon-Feest (`src/scenes/BalloonScene.js`)
Merge-spel (2048-stijl, menutegel 🎈 "Ballon-Feest") — in juli 2026 volledig
opgeknapt: karakter-ballonnen met oogjes/lach/wangetjes/touwtje in een lucht-
decor (wolken-parallax, zon, grasje), i.p.v. het oude donkere sterrenveld.
- **Spellogica los van Phaser** in `src/balloonLogic.js`, unit-getest in
  `tests/balloon.test.js`. De scene is alleen het "plaatje" (datamodel `vals`
  eerst, sprites volgen — dezelfde bugvrije aanpak als voorheen).
- **Kern-fix vastlopen:** spawns blijven altijd klein (`spawnOpties`: plafond =
  hoogste/8, min 8, cap 64) — grote getallen maak je alleen zelf via merges.
- **Vangnetten:** regenboog-joker (`RAINBOW = -1`, neemt de hoogste buurwaarde
  aan; verschijnt als genade-drop bij een vol bord) en de prik-knop 📌
  (3 ladingen, pop één ballon; merge ≥ 64 laadt een lading terug).
- **Juice:** landings-hint (kolomglow + ghost), combo-kettingen, record-callout,
  kroontje ≥ 64 / sterretjes ≥ 256, knipperende ogen, zachte game-over
  (ballonnen zweven weg + witte kaart, "Nog een keer").
- Medailles: `balloon_512` (Ballonkoning) en nieuw `balloon_2048`
  (Ballon-Legende). Highscore-sleutel blijft `balloon`.

## Schrijven (`src/scenes/TraceScene.js` + `TraceMenuScene.js`)
Overtrek-spel (cijfers 0–10, letters, eigen naam) — juli 2026 opgefrist naar de
huisstijl: wit "schriftje" met liniatuur op de lichte lucht, Nul als
schrijfcoach (juicht/schudt/knippert), regenboog-krijtje per teken,
voortgangs-bolletjes, `Voice.number()` bij elk cijfer. De teken-engine
(sequentiële checkpoints, afdwaal-detectie) is ongewijzigd met een vaste
kindvriendelijke strengheid (de globale moeilijkheids-knop is juli 2026
verwijderd — spellen regelen moeilijkheid nu zelf/adaptief). Paden komen uit
`src/glyphs.js` (dedupe — cijfer 0 doet daardoor ook mee in de cijfer-reeks).

## Reken-Raket (`src/scenes/MathScene.js`) — voorheen "Ruimte Rekenen"
Automatiseer-spel voor groep 3 (juli 2026 volledig herbouwd). Sommen zijn
brandstof: kies het antwoord door met de raket door de juiste antwoord-planeet
te vliegen; 10 sommen per vlucht, daarna landing + sterren.
- **Logica los van Phaser** in `src/rekenLogic.js` (getest in
  `tests/reken.test.js`): leerlijn N1–N7 (t/m 5 → optellen/aftrekken t/m 10 →
  dubbelen → t/m 20 zonder/met tientalsprong → **N7 "nul-magie"**: 900+100,
  9.000+1.000), adaptieve ladder (3 goed → omhoog, 2 fout → zachtjes terug),
  plausibele afleiders (±1/±2, cijferdraai; bij nul-magie een nul te veel/weinig).
- **Geen keuzescherm meer**: `DiffScene` is verwijderd; de tegel 🛸 start
  `Math` direct. De ladder onthoudt het niveau (settings `rekenNiveau`).
- **Blokjes-hulp**: Numberblocks-torentjes onder de som; vervagen zodra een
  niveau beheerst is (mastery ≥ 6), komen terug na een 2e fout (dan pulseert
  ook het juiste antwoord). Geen timer, geen straf; snel antwoorden = TURBO
  (dubbele meters).
- **Gouden nullen**: nul-sommen (a+0, a−0, a−a) geven een gouden nul; bij 5
  opent de geheime **NUL-PLANEET** (vlucht met alleen nul-magie, medal
  `reken_nul`).
- **Bestemmingen** op totaalhoogte: Wolk 400 / Maan 1.500 (`math_easy`) /
  Mars 3.000 / Saturnus 6.000 (`math_medium`) / Melkweg 10.000 (`math_hard`)
  — de oude medailles blijven zo verdienbaar.
- Voortgang in settings: `rekenNiveau`, `rekenMastery`, `rekenNullen`,
  `rekenHoogte`.

## Plakboek (`src/scenes/StickerScene.js`)
Verzamel-meta over álle spellen (menutegel 📖 "Plakboek", juli 2026). Verdiende
sterren (`spendStars`) koop je in voor verrassings-pakjes (`PAK_KOST = 5`, 2
stickers per pakje); vul 4 thema-pagina's van 6 stickers (24 totaal).
- **Logica los van Phaser** in `src/stickerLogic.js` (vitest, `tests/sticker.test.js`):
  catalogus (`PAGINAS`), `openPak` met **duplicaat-bescherming** (80% voorkeur
  voor nog-niet-bezeten stickers, rariteit-weging gewoon/zeldzaam/goud),
  `paginaVol`/`albumVol`/`nieuwVollePaginas`.
- **Opslag** in `progress.js`: `stickers` (id→aantal; ≥2 = "glimmer"), plus
  `spendStars`, `getStickers`, `addSticker`, `getStickerCount`.
- **Scene** = het plaatje: insteekboek met pagina's, een zelf-tekenende
  `tekenSticker` (ballon/planeet/blokje/slang/bloem/… — geen emoji, past bij de
  huisstijl), pakjes-open-overlay met NIEUW!/GLIMMER!-badges, pagina- en
  album-feest. Medailles `sticker_pagina` en `sticker_album` (Album-meester).
- Thema's: Ballonnen-feest · De Ruimte · Getallen-vriendjes · Buiten spelen.

## Bezorg-Baas (`src/scenes/BezorgScene.js`) — verving "Stad Rijden"
Rij-/leerspel (menutegel 🚚, juli 2026): Nul rijdt een bezorgbusje door het
Getallen-Dorp en brengt pakjes naar het juiste huis. Elk huis heeft een vast
label — een getal (1–9) of een kort woord — en de bestelling vraagt erom als
getal, **som (reken-adres: "3 + 4" → huis 7)** of woord. Traint getallen ÉN lezen.
- **Logica los van Phaser** in `src/bezorgLogic.js` (vitest, `tests/bezorg.test.js`):
  `labelDorp`, `kiesBestelling` (niveau 1 getal / 2 woord / 3 som), adaptieve
  ladder, `sterrenVoorRonde`. Niveau blijft bewaard (`bezorgNiveau` in settings),
  zodat het reken-adres pas na wat oefenen verschijnt (zoals Reken-Raket).
- **Rij-model** hergebruikt uit het oude Stad Rijden (scalaire `carSpeed` +
  grip-drift, gas/rem/stuur-knoppen). **GEEN camera-zoom** — anders schaalt de
  scrollFactor(0)-HUD mee (valkuil). Bezorgen = dicht bij een huis stoppen
  (`HUIS_RADIUS`, snelheid < `PARKEER_SNELHEID`); `huisOnderVan()` voorkomt een
  valse fout-levering op het huis waar je net stopte.
- **Eigen getekende voertuigen** (`maakVoertuigTexturen` → `generateTexture`):
  busje + autootjes met gezichtjes. Hierdoor zijn de oude `car_*.png` weg
  (auteursrecht-vraag opgelost) en is `CityScene.js` verwijderd.
- Faal-vriendelijk (geen game-over; fout huis schudt "oeps, dat is 4!"),
  gouden nullen verstopt in het dorp, medaille `bezorg_baas`. 6 leveringen/ronde.

## Tel-Slang (`src/snake3d.js`) — voorheen "3D Snake"
Three.js slither-spel (menutegel 🐍, launcht als DOM-overlay via
`MenuScene.launchSnake`). Juli 2026 herkaderd: **de slang ís het getal** — langer
worden = hoger tellen naar 100.
- **Telbare logica los** in `src/snakeLogic.js` (vitest, `tests/snake.test.js`):
  tientallen (`gepasseerdeTientallen`, `tientalNaam`), `telHint` ("nog 2 tot 20"),
  `voerWaarde` (1/2/3), `maakBestelling` ("eet de 7" + afleiders), `krimpBijBotsing`,
  `MISSIES` + `missieVoortgang`.
- **`count` ≠ fysieke lengte**: `player.count` is HET getal (groeit met hele
  voer-waarden); de fysieke lijflengte is gecapt (`BODY_MAX`) voor perf/look.
  Tientallen/getallenlijn/missies/regenboog kijken naar `count`.
- **HUD (DOM)**: grote telling midden-boven, missie-chip, "Eet de N!"-banner,
  en een **getallenlijn 0–100** onderin met meelopend lichtje. Cijfer-voer toont
  zijn getal via een sprite (`digitTexture`/`digitSprite`).
- **Faal-vriendelijk (geen game-over meer)**: rand = zacht terugsturen; grotere
  slang = je wordt korter (`botBumpCd`-afkoeltijd); eigen-staart-dood eruit.
  Topscore (`snake`) = hoogste telling, bewaard in `quit()`. Medals snake_50/100.
- Behouden: neon-arena, bots, kroontje, regenboog-slang ≥25, gouden-nul-magneet.

## Nul's Toverwinkel (`src/scenes/TovenScene.js`) — FASE 1 (juli 2026)
Magisch brouw-/lees-/tel-flagship (menutegel 🧪, scene-key `Toverwinkel`).
Vlaggenschip-ontwerp staat in het geheugen ([[toverwinkel-plan]]); **fase 1 = de
magische kern** is gebouwd, fasen 2-4 (klanten-cast, groeiende wereld, verhaal)
nog niet. Kern-loop: klant met wens → brouw het drankje (kleuren mengen, sterren,
roeren, toverwoord spellen) → POEF → klant transformeert → een bloemetje bloeit
op in de winkel (kleur keert terug).
- **Logica los** in `src/toverLogic.js` (vitest, `tests/tover.test.js`): `KLEUREN`,
  `mengKleur` (blauw+geel=groen, blauw+rood=paars, rood+geel=oranje, rest=bruin),
  `ketelKleur` (live ketelkleur uit de druppels), `RECEPTEN` (4: groei/glim/slaap/
  vlieg), `brouwStatus`, `kiesRecept`, adaptieve ladder.
- **De ketel mengt live**: elke druppel herberekent de kleur via `ketelKleur`.
- **Faal-vriendelijk**: palet = alleen de recept-kleuren (geen fout mogelijk);
  foute letter schudt zachtjes. Geen game-over.
- **Opslag**: `progress.recepten` (Toverboek, `markRecept`/`hasRecept`), medaille
  `tover_start` (Leerling-Tovenaar) bij het eerste drankje.
- **Bloei**: `bloei()` laat per gelukt drankje een bloemetje opbloeien in het
  grauwe-paarse winkeldecor, én een `warmte`-gloedlaag klaart de winkel steeds
  verder op — "de wereld kleurt terug".
- **Magie-pass (2026-07-05)**: niet-lezer-vriendelijk + magischer gemaakt. Het
  toverwoord staat LICHTGRIJS voorgedrukt (kopiëren); aantallen zijn STIPJES i.p.v.
  breuken; een wijs-handje (`_wijzer`) + puls (`updateHint`) wijzen de volgende stap;
  Nul reageert overal (`nulReactie`: blij/wow/spannend/juich); het kleurmengen wordt
  gevierd (`mixFeest`: "GROEN!"/"PAARS!"…); en de poef heeft meer aanloop.
- **SPEELGOED-PASS (2026-07-06)**: alle knoppen vervangen door echte handelingen
  (les: [[interactie-boven-aankleding]]). **Flesjes SLEEP je** boven de ketel
  (kantelen = druppelen op een timer in `update()`; zelf op tijd stoppen — één
  te veel = bruin schuim + **schuimspaan** om 'm eruit te vissen, `checkKlaar`
  blokkeert tot het klopt, pips kleuren rood). **Sterretjes fladderen** rond
  (`fladder`) en vang je met een tik. **Roeren = échte rondjes tekenen** in de
  ketel (`roerBeweging` sommeert de draaihoek; lepel volgt je vinger, draaikolk
  groeit). **Letters prik je uit opstijgende bellen** (`spawnBel`/`prikBel`;
  foute bel = onschuldige plop). Het wijs-handje volgt bewegende doelen via
  `update()` (`_wijzerDoel`). Tegel staat nog achter de Ouder-modus (test)
  tot de speeltest met Adrian slaagt.
- **Grafische overhaul (2026-07-05)**: van platte vormen naar een geschilderd,
  sfeervol decor. `schilderWinkel()` tekent het interieur één keer op een
  canvas-textuur (`tw_bg`): muur-verloop, warme gloed, houten planken met
  gloeiende flesjes, houten vloer met perspectief, hangende lantaarns, vignette,
  en een **gloeiende boog-nis** achter de ketel (i.p.v. een donker raam). Daar
  bovenop: een **volumetrische lichtbundel** uit de ketel, opstijgende **sintels**
  + drijvende **runen** (additief), en een **ketel-upgrade** (verloop-body,
  metalen rand + klinknagels, schuimrand, opstijgende stoom, pulserende
  gloed-halo die mee-kleurt met de drank). POEF kreeg **schokgolf-ringen** + een
  kleur-flits. NB: Phaser-shapes hebben geen `preFX`, dus de gloed komt van
  additieve lagen, niet van een shader (degradeert netjes, geen crash).

## Getallen-Toren (`src/scenes/NumberTowerScene.js`)
Plaatswaarde-/stapelspel voor Adrian (eind groep 2 / start groep 3). Tik op
`+1` / `+10` / `+100` om kubussen in de juiste kolom te stapelen tot ze samen
het doelgetal vormen. Leerdoel: plaatswaarde + optellen mét "wisselen"
(10 eenheden → 1 tiental). Vijf oplopende levels: Bouwmeester (bouw getal na),
Optel-piloot (zonder wisselen, `25+24`), Ruil-baas (mét wisselen, `28+14`),
Honderd-held (voorbij 100), Nul-meester (ronde honderdtallen).
- **Numberblocks-thema** (geen ruimte-thema): heldere lucht-naar-gras
  achtergrond, felle kubussen met dikke donkere rand, en het bovenste blokje
  van elke stapel krijgt googly eyes + lach (= een figuurtje). Het grote getal
  kleurt mee met zijn signatuurkleur (`SIG`/`sigColor`).
- **Stem:** getallen/sommen worden voorgelezen via de Web Speech API (`nl-NL`),
  met hogere toonhoogte (vrolijk/kinderlijk) en kreetjes ("Joepie!", "Ruilen!").
  Géén echte Numberblocks-clips (auteursrecht).
- **iOS-let op:** Safari blokkeert de stem tot de eerste tik → `primeSpeech()`
  ontgrendelt 'm bij de eerste aanraking. De voorlees-knop 🔊 werkt het meest
  betrouwbaar. Bij geen geluid op iPhone: check de fysieke **mute-schakelaar**
  en het volume — die dempen ook het webgeluid (geldt ook voor de `SFX`-piepjes).

### Openstaande ideeën Getallen-Toren
- Optie 3: eigen ingesproken stemmetjes als geluidsbestandjes in `public/`
  (pappa/mamma's stem), als alternatief voor de browser-stem.

## ~~Getallen-Land (oude `NumberLandScene.js`)~~ — VERWIJDERD juli 2026
> Let op: onderstaande beschrijft de OUDE verkenbare wereld (`NumberLandScene`,
> nu verwijderd). Het huidige "Getallen-Land" is de platformer (`WorldMapScene`
> + `AdventureScene`, zie het geheugen + `GAME-DESIGN.md`). Onderstaande blijft
> als historische referentie voor herbruikbare technieken.

Het hoofdmenu-tegeltje **"Getallen-Land"** (scene-key `NumberLand`) is een
**verkenbare Numberblocks-wereld** (100% zelf getekend, geen auteursrechtelijke
beelden/audio). Een grote verticale vallei (`WORLD` = 480×1560) met camera die
meebeweegt; je loopt rond en helpt getallen-vriendjes.
- **Verkennen:** je bestuurt **"Nul"** (een rond gidsje, duidelijk anders dan de
  vierkante blokken — Adrian houdt van 0). **Tik op de grond** (onzichtbare
  `ground`-zone) → Nul loopt erheen, de camera volgt (`startFollow` + deadzone,
  geclampt op `setBounds`). HUD staat vast met `setScrollFactor(0)`.
- **Vriendjes & puzzels:** verspreid in de wereld staan **getallen-vriendjes**
  (`buildSpots`/`makeSpot`) met een wens-wolkje (doelgetal). Maak dat getal van
  de losse Numberblocks ernaast en **sleep het op het vriendje** → opgelost
  (`solveSpot`): confetti, sterren, dansje. Alle vriendjes klaar → `showReward`
  + medaille `numberland_hero`.
- **Samenvoegen:** sleep een blok op een ander → ze tellen op (`mergeBlocks`).
- **Splitsen (uit elkaar trekken):** **tik** op een blok → het scheurt in twee
  helften (5 → 3 + 2), `tapBlock` + `SFX.split`.
- **Verborgen sterren:** tik op een **struik** (`drawBush`/`searchBush`) → soms
  springt er een ster uit (+1).
- **Personages:** elke waarde een eigen signatuurkleur, **3D-glans-kubussen met
  groeven, wit cijfer-schijfje, armpjes en schoentjes** (`drawBlockVisual`), plus
  knipperende ogen die de actieve blok volgen, idle-wiebel en **eigen trekjes**
  (`drawPersonality`: wangetjes voor iedereen, bril voor de 2, knoopjes voor de 3,
  wenkbrauwen vanaf de 4, ster-in-de-hand voor de 5).
- **Art:** alles zelf getekend (geen emoji): wolken (parallax), vlinders, bomen,
  struiken, bloemen, getallen-huisjes, een kronkelpad met brug over een riviertje.
- **Leven in de wereld:** rondlopende **Numberblock-NPC's** (`buildNPCs`/
  `makeWanderer`/`updateNPCs`) die willekeurig wandelen, knipperen en **Nul
  begroeten** (hupje + hartje + `Voice.cue('greet')`). De vriendjes leven mee
  (`updateFriends`): ogen volgen Nul, knipperen, zwaaien als je dichtbij komt.
  Stofwolkjes onder Nul tijdens het lopen (`dustPuff`), camera-juice bij succes
  (`cameraPunch` = shake + zoom-tik), en een fade-in bij binnenkomst.
- **Geheim:** een verstopte **schatkist** (`buildSecrets`/`makeChest`) — tik =
  open → +5 sterren, confetti, camera-tik. Plus de sterren in de struiken.

### GELUID & STEM — belangrijk
- **GEEN browser-TTS meer.** Alle `SpeechSynthesis`-code is volledig verwijderd
  uit het hele project (klonk onnatuurlijk op iPhone/Safari).
- **`src/voice.js` = VoiceManager.** Spraak/feedback loopt via `Voice.cue(name)`
  / `Voice.number(n)`: korte, vrolijke **Web Audio**-klankjes (welcome, number,
  cheer, great, laugh, oops, star, greet, jump, yawn, whee). Werkt overal
  hetzelfde, ook op iOS.
- **ECHTE STEM AANWEZIG (2026-07-07):** 69 Nederlandse clips in `public/voice/`
  (getallen 0-20, tientallen t/m 100, joepie/oeps/hoi/welkom/super, plus ~35
  HINT-clips: per systeem een instructie, krachten, baas-aanmoedigingen).
  `Voice.hint(name, delayMs)` = het gesproken instructie-kanaal: globaal
  gethrottled (~4s, hints praten nooit door elkaar), speelt alleen als de
  clip bestaat, delay om na een getal-clip te spreken. Cue-regel: eerste
  nadering per level + na een fout. Anti-gok: na 2 fouten op één keuzepunt
  pulseert het juiste antwoord (`pulsHulp`). Alles gegenereerd
  met `node tools/maak-stemmen.mjs` (gratis Microsoft neural stem
  nl-NL-FennaNeural via `msedge-tts`, devDependency; vrolijk gestemd met
  pitch +18Hz / rate 1.08). `public/voice/manifest.json` wordt in `main.js`
  geladen → `Voice.registerClip` per clip. Clips spelen via **Web
  Audio-buffers** (fetch → decodeAudioData), NIET via `<audio>` — zo liften ze
  mee op de bestaande iOS-ontgrendeling. Geen clip of nog niet geladen → de
  oude Web Audio-jingle klinkt (geluid valt nooit stil). Jingle-cues
  (laugh/whee/star/jump/pop/yawn) blijven bewust synthetisch. Andere stem/toon:
  pas STEM/TOON aan in tools/maak-stemmen.mjs en draai opnieuw. ⚠️ Bij een
  commerciële release clips opnieuw genereren met een gelicenseerde dienst
  (Azure TTS/ElevenLabs); eigen opnames (pappa/mamma) kunnen er gewoon
  overheen: zelfde bestandsnaam in public/voice/ = klaar.
- **SFX** blijven in `sound.js` (`pick`, `place`, `sparkle`, `combine`, `yay`,
  `oops`, `giggle`, `split`, `step`). **Menu-muziek stopt** bij binnenkomst
  (`stopMusic()` in `create`).

### Openstaande ideeën Getallen-Land
- Puzzels nóg meer als avontuur (brug die een getal mist, huisje dat op zijn
  Numberblock wacht) en meerdere vrij te spelen gebieden met eigen landschap.
- Meer geheimen (grotten, regenbogen, verborgen paadjes) en verzamelobjecten.

### Oudere Avontuur-versies (VERWIJDERD juli 2026)
- `src/scenes/NumberLandScene.js` (verkenbare wereld), `src/scenes/PlatformScene.js`
  (eerste 2D-platformer) en `src/platform3d.js` (3D-renner) zijn **verwijderd** in
  de opruim-sprint: ze waren niet meer bereikbaar vanuit een tegel (vervangen door
  Getallen-Land). Ook `MenuScene.launchPlatform3D` is weg. Terughalen? → uit git.

## Nul-Raket (`src/scenes/ZeroRocketScene.js`)
Machten-van-10-spel voor Adrian (dol op nullen/grote getallen). Tik op **+0**
en er komt een nul bij → het getal wordt 10× groter en de raket vliegt door
steeds spannendere zones omhoog (gras → wolken → ruimte → melkweg). `−0` haalt
een nul weg (÷10), `↺` reset. Doorgroeien tot **triljoen** (10^18, 18 nullen).
- Het getal is een **string** (`'1' + '0'.repeat(zeros)`), niet een JS-number —
  zo kloppen alle nullen exact, ook voorbij `Number.MAX_SAFE_INTEGER`. De
  lettergrootte schaalt automatisch zodat het lange getal past.
- `NAMES`/`ZONES` (per aantal nullen) geven de naam (tien…triljoen) en de
  landmark/achtergrondkleuren. Mijlpalen (`REWARDS`) geven sterren; triljoen
  geeft de medaille `rocket_max`.
- **Geluid:** `SFX.grow` (oplopend), `SFX.fanfare` bij mijlpalen + voorlezen
  van de getalnaam (Web Speech).
