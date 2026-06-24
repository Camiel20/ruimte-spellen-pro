# Projectoverdracht — Ruimte Spellen (voor Claude Code)

Dit document beschrijft het project "ruimte-spellen-pro" zodat je het kunt
overnemen en verder uitbouwen. Lees dit eerst helemaal door voordat je
wijzigingen maakt.

---

## 1. Wat het is

Een verzameling educatieve spellen voor een jong kind (Adrian, ~6 jaar),
gebouwd als één web-app. Gemaakt met **Phaser 3** (2D-spellen) en
**Three.js** (één 3D-spel). Draait in de browser en wordt gehost op GitHub
Pages. De UI-taal is **Nederlands** — houd dat aan in alle teksten,
commentaar en spelinhoud.

De eigenaar (Camiel) is geen ervaren ontwikkelaar. Houd uitleg eenvoudig,
commentaar in het Nederlands, en vermijd dat je dingen stukmaakt die al
werken.

## 2. Tech-stack en hoe je het draait

- **Phaser** `^3.80.1` (npm)
- **Three.js** `0.160.0` — zit LOKAAL in `src/vendor/three.module.js` en
  wordt geïmporteerd via `import * as THREE from './vendor/three.module.js'`.
  Dit is bewust: het netwerk van de eigenaar blokkeerde eerder downloads.
  Three.js staat NIET in package.json. Laat dit zo, tenzij expliciet
  gevraagd om naar npm over te stappen.
- **Vite** `^5` als build-tool en dev-server.
- Geen TypeScript, geen framework. Gewoon ES-modules.

Commando's (vanuit de projectmap):
```
npm install        # eenmalig (alleen Phaser + Vite)
npm run dev        # ontwikkelserver op localhost:5173
npm run dev -- --host   # ook bereikbaar op het wifi-netwerk (iPad testen)
npm run build      # bouwt naar dist/ (dit is wat naar GitHub gaat)
npm run preview    # bekijk de productie-build lokaal
```

Deploy: `npm run build` maakt `dist/` met `index.html`, `assets/`,
`manifest.webmanifest` en `icon.png`. De INHOUD van `dist/` wordt naar de
root van de GitHub-repo geüpload (NIET de dist-map zelf). Live op
`camiel20.github.io/ruimte-spellen/`. `vite.config.js` heeft `base: './'`
zodat relatieve paden op GitHub Pages werken — laat dat zo.

## 3. Architectuur

`src/main.js` bouwt de Phaser-game en registreert alle scenes. Config:
canvas 480×800, `Scale.FIT` met autoCenter, arcade physics met
`gravity.y: 1100` (alleen de platformer gebruikt zwaartekracht; andere
physics-scenes zetten `body.setAllowGravity(false)`).

Elk spel is een **Phaser Scene** in `src/scenes/`. Gedeelde modules:

- `src/sound.js` — Web Audio geluidseffecten (`SFX.coin()`, `.win()`, etc.),
  `initAudio()`, `toggleSound()`, `isSoundOn()`, en `getAudioContext()`
  (gedeelde AudioContext — maak NOOIT een nieuwe aan, browsers limiteren ze).
- `src/music.js` — zachte achtergrondmuziek via Web Audio. `startMusic()`,
  `stopMusic()`, `setMusicEnabled()`.
- `src/progress.js` — CENTRAAL opslagsysteem (localStorage, key
  `rsp_progress_v1`). Sterren, medailles, topscores, instellingen.
  Functies: `getStars/addStars`, `hasMedal/giveMedal/getMedalCount`,
  `getHigh/saveHigh`, `getSetting/setSetting`, `resetProgress`.
  Instellingen: `music` (bool), `difficulty` ('makkelijk'|'normaal'|
  'moeilijk'), `childName` (string).
- `src/reward.js` — herbruikbaar beloningsscherm `showReward(scene, opts)`
  en `confettiBurst(scene)`.
- `src/glyphs.js` — gedeelde cijfer- en letterpaden (`DIGIT_PATHS`,
  `LETTER_PATHS`, genormaliseerd 0-1) PLUS een herbruikbare klasse
  `TraceChallenge(scene, {label, paths, onDone})` die als overlay in
  elke scene een schrijf-uitdaging toont. `randomGlyph()` geeft een
  willekeurig cijfer/letter.
- `src/snake3d.js` — het 3D-spel (Three.js), los van Phaser. Wordt
  dynamisch geïmporteerd (`import('../snake3d.js')`) zodat Three.js pas
  laadt als de snake opent.

Assets staan in `public/assets/` en worden geladen in
`src/scenes/BootScene.js`. Zelfgemaakte PNG's (ballon, auto's) — er worden
GEEN externe asset-downloads gebruikt.

## 4. De spellen (scenes)

- **MenuScene** — hoofdmenu met sterrenbalk (tik = Awards), tandwiel
  (= Settings), 7 spelkaarten. Start achtergrondmuziek.
- **DiffScene + MathScene** — "Ruimte Rekenen": kies moeilijkheid, los
  sommen op, planeten als levels, combo's. Medailles per moeilijkheid.
- **TraceMenuScene + TraceScene** — "Schrijven": kies cijfers / letters /
  eigen naam. Overtrekken met sequentiële checkpoints, strengheid hangt
  af van `difficulty`. Gebruikt nu EIGEN kopie van paden (zie §6 opschoning).
- **BalloonScene** — "Ballon Merge": laat ballonnen vallen, gelijke buren
  smelten samen (flood-fill, verdubbelt). Gescheiden datamodel:
  `this.vals[r][c]` (getallen) en `this.sprites[r][c]` (beeld) los van
  elkaar; merges op getallen, daarna beeld syncen. Medaille bij 512.
- **ClickerScene** — "Planeet Tikker": cookie-clicker. 13 planeten tot
  10 miljard, 15 upgrades, scrollbare winkel, voortgangsbalk. BIJ ELKE
  NIEUWE PLANEET een `TraceChallenge` (schrijf-uitdaging) die het spel
  pauzeert tot het kind een letter/cijfer schrijft. Slaat op in
  localStorage (`rsp_clicker`). Economie is gebalanceerd op ~30 min naar
  10 miljard.
- **PlatformScene** — "Ruimte Avontuur": platformer, 3 levels, astronaut,
  aliens (erop springen), munten, vlag. Levens hangen af van difficulty.
  Multitouch-knoppen via `readControls()` (leest pointers per frame).
- **PianoScene** — "Regenboog Piano": 8 toetsen, vrij spelen of liedje
  volgen. Gebruikt de gedeelde AudioContext.
- **snake3d.js** — "3D Snake": Slither.io-stijl in Three.js. Groot veld,
  AI-slangen die je opeet om te groeien, power-ups, respawnt.
- **AwardsScene** — toont verzamelde sterren + medailles (raster).
- **SettingsScene** — ouder-instellingen: muziek, moeilijkheid, naam,
  voortgang wissen. ONDERAAN een verborgen knop "🚗 Stad Rijden" die het
  rijspel opent (bewust verstopt voor de ouder).
- **CityScene** — "Stad Rijden" (PROEF, het nieuwste spel): GTA 1/2-stijl
  topdown rijspel. Zie §5 — hier is waarschijnlijk de meeste vervolgwerk.

## 5. CityScene — de proef die uitgebouwd kan worden

Bestand: `src/scenes/CityScene.js`. Status: speelbare basis, geen doel/
missies.

Hoe het werkt nu:
- `CITY` is een array van strings (20 tekens breed, 20 hoog). Tekens:
  `R`=weg, `.`=gras/stoep, `B`=gebouw (obstakel), `P`=startplek speler.
  ALLE rijen MOETEN exact even lang zijn (de code gebruikt `CITY[0].length`
  voor het aantal kolommen). Controleer dit bij elke wijziging.
- Auto-physics: `this.car` is een arcade sprite. `carAngle` is de
  stuurhoek in graden. Gas/rem voegt snelheid toe in de kijkrichting;
  `setDrag` zorgt voor natuurlijke vertraging. Sturen werkt alleen bij
  snelheid (`speed > 10`). De sprite wijst standaard naar rechts (0°),
  daarom `setAngle(carAngle - 90)`.
- Collision-body is bewust vierkant (`setSize(30,30)`) omdat arcade-bodies
  niet meedraaien met de sprite-rotatie.
- Verkeer: 5 auto's die rechtdoor rijden en af en toe 90° afslaan.
- Besturing: knoppen via `readControls()` (multitouch, leest pointers per
  frame — zelfde patroon als de platformer) + pijltjestoetsen.
- Auto-sprites: `public/assets/car_player.png` (blauw), `car_red/blue/
  green.png`. 64×44 px, wijzen naar rechts. Gegenereerd met Pillow.

Logische vervolgstappen (in oplopende complexiteit):
1. Een doel: pakketjes/sterren ophalen en ergens afleveren (met een pijl
   of kaartje dat de route wijst). Past bij educatief: tel pakketjes.
2. Een timer of score.
3. Botsing-effect (auto schudt/vertraagt bij raken van gebouw of verkeer).
4. Groter/mooier stadsplan, meerdere stadsdelen.
5. Eventueel een minimap (hoek van het scherm, vaste positie via
   `setScrollFactor(0)`).
6. Geluid: motorgeluid (kan met Web Audio in `sound.js`-stijl).

## 6. Belangrijke conventies en valkuilen

- **Taal**: alles in het Nederlands (UI, commentaar, spelnamen).
- **Knoppen in Phaser**: gebruik NOOIT een `setInteractive()` met een
  custom hitArea op een Container — dat klikgebied loopt fout door de
  FIT-schaling. Gebruik in plaats daarvan een los, onzichtbaar
  `this.add.rectangle(0,0,w,h,0xffffff,0).setInteractive()` als klikvlak,
  OF plaats knoppen direct op de scene (niet genest in een container) met
  een hoge `setDepth`. Dit is meerdere keren een bug geweest.
- **Overlay-knoppen** (win/game-over): plaats ze direct op de scene met
  hoge depth, niet in een container.
- **Multitouch-knoppen** (platformer, city): lees per frame welke pointers
  binnen welke knop-rechthoek vallen (`readControls()`), in plaats van
  `pointerdown/up`-events. Op iPad werkt anders maar één knop tegelijk.
  Roep `this.input.addPointer(3)` aan in `create()`.
- **Zwaartekracht**: global `gravity.y: 1100`. Elke physics-sprite die NIET
  moet vallen heeft `body.setAllowGravity(false)` nodig (zie city, snake-
  fragmenten, platformer-munten).
- **Geen browser-storage in losse var**: gebruik localStorage via
  `progress.js` (centraal) of de specifieke key per spel.
- **AudioContext**: altijd via `getAudioContext()` uit sound.js. Nooit een
  nieuwe `new AudioContext()` aanmaken.
- **Tracen / schrijven**: er zijn nu TWEE kopieën van de cijfer/letter-
  paden — één in `src/glyphs.js` (gedeeld, gebruikt door de clicker-
  uitdaging) en één bovenin `src/scenes/TraceScene.js` (het schrijf-spel
  zelf). OPSCHOON-KANS: laat `TraceScene.js` ook `DIGIT_PATHS`/
  `LETTER_PATHS` uit `glyphs.js` importeren en de eigen kopie verwijderen,
  zodat er één bron is. Test daarna het schrijf-spel goed (cijfers,
  letters, naam) — de ghost-tekst moet een niet-lege string krijgen,
  anders crasht Phaser met een `drawImage`-fout op een 0×0 canvas.
- **Bouwen verifiëren**: draai na elke wijziging `npm run build` en
  controleer dat het zonder fouten bouwt. De ontwikkelaar kan zelf
  visueel testen met `npm run dev`; jij kunt dat niet, dus leun op de
  build + logische controle.

## 7. Bekende aandachtspunten

- De totale JS-bundel is groot (~1,5 MB) door Phaser + Three.js. Three.js
  zit in een aparte chunk (`snake3d`) door de dynamische import, dus de
  rest blijft snel. De chunk-grootte-waarschuwing is onderdrukt in
  `vite.config.js`. Niet zorgwekkend.
- PWA: `public/manifest.webmanifest` + `apple-mobile-web-app-capable` in
  `index.html` zorgen dat het fullscreen draait als je het op de iPad aan
  het beginscherm toevoegt via Safari.
- Het project is incrementeel gegroeid met losse ZIP-uitwisseling. Nu het
  in een echte map staat, kun jij directer werken: bewerk bestanden, draai
  de build, en laat de eigenaar `npm run dev` gebruiken om te testen.

## 8. Werkwijze die goed werkt

1. Begrijp de betreffende scene voordat je wijzigt; de scenes zijn redelijk
   op zichzelf staand.
2. Maak kleine, gerichte wijzigingen en bouw na elke stap.
3. Houd de stijl consistent (kleuren, ronde hoeken, Nederlandse teksten,
   emoji-iconen).
4. Vraag de eigenaar om te testen met `npm run dev` en specifiek te
   beschrijven wat er gebeurt — hij is je ogen.
5. Breek niets wat al werkt: de spellen voor het kind zijn in gebruik.
