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
- `src/scenes/*` — elk spel is een aparte Phaser-scene (o.a. `ClickerScene.js` = "Planeet Tikker", `NumberTowerScene.js` = "Getallen-Toren", `PlatformScene.js` = "Getallen-Avontuur", `ZeroRocketScene.js` = "Nul-Raket").
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
(sequentiële checkpoints, afdwaal-detectie, moeilijkheid via instellingen)
is ongewijzigd; paden komen nu uit `src/glyphs.js` (dedupe — cijfer 0 doet
daardoor ook mee in de cijfer-reeks).

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

## Getallen-Land (`src/scenes/NumberLandScene.js`)
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
- **Klaar voor echte stem:** wil je later ingesproken NL-fragmenten? Zet mp3/ogg
  in `public/voice/` en registreer ze met `Voice.registerClip('cheer',
  'voice/cheer.mp3')` (of `'number-5'` → `voice/vijf.mp3`). Bestaat er een clip
  voor een cue, dan speelt die; anders de Web Audio-fallback. De game roept
  alleen `Voice.cue(...)` aan en weet niets van de bron.
- **SFX** blijven in `sound.js` (`pick`, `place`, `sparkle`, `combine`, `yay`,
  `oops`, `giggle`, `split`, `step`). **Menu-muziek stopt** bij binnenkomst
  (`stopMusic()` in `create`).

### Openstaande ideeën Getallen-Land
- Puzzels nóg meer als avontuur (brug die een getal mist, huisje dat op zijn
  Numberblock wacht) en meerdere vrij te spelen gebieden met eigen landschap.
- Meer geheimen (grotten, regenbogen, verborgen paadjes) en verzamelobjecten.

### Oudere Avontuur-versies (niet meer in het menu)
- `src/platform3d.js` — een **3D-renner** (Three.js, Crossy-Road-stijl): groei
  van 1 naar het doelgetal, ontwijk/stamp min-monsters, haal de vlag. Werkt,
  maar voelde te veel als tech-demo; vervangen door Getallen-Land. Kan later
  als bonus-tegel terugkomen (`MenuScene.launchPlatform3D` staat nog klaar).
- `src/scenes/PlatformScene.js` — de allereerste 2D-platformer. Nog geregistreerd
  maar niet meer gekoppeld aan een tegel.

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
