# Ruimte Spellen Pro

Een verzameling kinderspellen, gemaakt voor Adrian. Gebouwd met **Phaser 3**
(game-engine) en **Vite** (bouwtool). Persoonlijk/privé project.

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
