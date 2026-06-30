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
Het hoofdmenu-tegeltje **"Getallen-Land"** (scene-key `NumberLand`) is de
huidige, volledig herontworpen versie van wat ooit "Ruimte/​Getallen-Avontuur"
heette. Een levende, vrolijke **Numberblocks-wereld** (100% zelfgemaakt, geen
auteursrechtelijke beelden/audio). De kern is precies waar de serie om draait:
getallen **maken** door blokjes samen te voegen en te splitsen.
- **Samenvoegen:** sleep een Numberblock op een andere → ze tellen op tot een
  groter getal (squash & stretch, confetti, `SFX.combine`, voorlezen).
- **Splitsen:** tik op een blok → er springt een **1** los (waarde −1).
- **Puzzel "Maak het getal":** sleep het juiste getal op de gloeiende doel-plek.
  Goed = feest + sterren; fout = vriendelijk "oei!" en terug (geen straf).
- **Personages:** elke waarde een eigen signatuurkleur, **3D-glans-kubussen met
  groeven, een wit cijfer-schijfje bovenop het hoofd, armpjes en schoentjes**
  (zie `drawBlockVisual`), plus knipperende ogen die de actieve blok volgen en
  een idle-wiebel. Expressies via `setExpression` (blij/groot/verbaasd/verdrietig).
- **Wereld:** vier gebieden (`ZONES`: Bloemenweide → Strand → Snoepland →
  Ruimte) die je **vrijspeelt met sterren** (elke 4 puzzels). Levende deco:
  drijvende wolken, vlinders/vogels, wiegende bloemen, een 🎁-verrassing die
  af en toe overzweeft voor bonus-sterren. Doel-getallen lopen op per gebied.
- **Geluid:** nieuwe vrolijke Web Audio-effecten in `sound.js`
  (`SFX.pick`, `place`, `sparkle`, `combine`, `yay`, `oops`, `giggle`) — géén
  placeholder-piepjes. Werkt óók op iOS. Stem leest getallen/kreetjes voor
  (Web Speech `nl-NL`, hoge toon), zelfde iOS-kanttekening als Getallen-Toren.
- **Sterren/confetti** via het gedeelde `reward.js` (`confettiBurst`,
  `showReward` bij een nieuw gebied).

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
