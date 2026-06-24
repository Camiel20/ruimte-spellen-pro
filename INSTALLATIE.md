# Ruimte Spellen Pro — Installatiegids voor Windows

Deze gids helpt je stap voor stap om van "plakken in GitHub" naar een
echte ontwikkelomgeving te gaan. Je hebt geen ervaring nodig — volg
gewoon de stappen. Eenmalig instellen kost ongeveer 20 minuten.

---

## Wat ga je installeren?

1. **Node.js** — de motor die het project draait op je PC
2. **Een code-editor (VS Code)** — om de bestanden te bekijken en aan te passen
3. **Het project zelf** — de bestanden die ik voor je heb klaargezet

---

## Stap 1 — Node.js installeren

1. Ga naar **https://nodejs.org**
2. Klik op de grote groene knop die zegt **"LTS"** (dat is de stabiele versie)
3. Open het gedownloade bestand (`node-v...-x64.msi`)
4. Klik steeds op **Next** → vink **"Automatically install the necessary tools"** NIET aan (niet nodig) → **Install**
5. Klaar! Om te controleren of het werkt:
   - Druk op de **Windows-toets**, typ `cmd`, druk Enter (dit opent de "Opdrachtprompt")
   - Typ: `node --version` en druk Enter
   - Je ziet nu zoiets als `v20.11.0` — dan is het gelukt

---

## Stap 2 — VS Code installeren (de code-editor)

1. Ga naar **https://code.visualstudio.com**
2. Klik **Download for Windows**
3. Installeer het (klik steeds Next, accepteer de standaardopties)
4. Open VS Code als het klaar is

---

## Stap 3 — Het project op je PC zetten

Je hebt de projectmap `ruimte-spellen-pro` van mij gekregen (als ZIP).

1. Pak de ZIP uit naar een handige plek, bijvoorbeeld `Documenten\ruimte-spellen-pro`
2. Open VS Code
3. Klik bovenin op **File → Open Folder...**
4. Kies de map `ruimte-spellen-pro` die je net hebt uitgepakt
5. Je ziet nu links alle bestanden verschijnen

---

## Stap 4 — De onderdelen ophalen (eenmalig)

Het project heeft "bouwstenen" nodig (Phaser en Vite). Die haal je zo op:

1. In VS Code, klik bovenin op **Terminal → New Terminal**
2. Onderin verschijnt een zwart venster (de terminal)
3. Typ dit en druk Enter:

   ```
   npm install
   ```

4. Wacht een halve minuut. Er verschijnt een mapje `node_modules` —
   dat is normaal, dat hoef je nooit aan te raken.

---

## Stap 5 — Het spel starten (dit doe je elke keer)

In dezelfde terminal, typ:

```
npm run dev
```

Je ziet nu iets als:

```
  VITE v5.x  ready in 300 ms
  ➜  Local:   http://localhost:5173/
```

Houd **Ctrl** ingedrukt en klik op dat `http://localhost:5173/` adres,
of typ het over in je browser. Het spel opent!

**Het mooie:** terwijl dit draait, wordt elke wijziging die je in de code
maakt meteen live zichtbaar in de browser. Geen herladen nodig.

Om te stoppen: klik in de terminal en druk **Ctrl + C**.

---

## Stap 6 — Op de iPad/iPhone testen

Zolang `npm run dev` draait, kun je het ook op je telefoon bekijken —
mits die op hetzelfde wifi-netwerk zit:

1. Stop de dev-server (Ctrl+C) en start hem zo:

   ```
   npm run dev -- --host
   ```

2. Nu zie je ook een **Network** adres, bijvoorbeeld `http://192.168.1.23:5173/`
3. Typ dat adres in Safari op de iPad — en je speelt de nieuwe versie!

---

## Stap 7 — Publiceren naar GitHub Pages (zoals je gewend bent)

Als je tevreden bent en het online wilt zetten:

1. In de terminal:

   ```
   npm run build
   ```

2. Er verschijnt een map `dist`. Alles in die map is je kant-en-klare website.
3. Upload de **inhoud** van de `dist`-map naar je GitHub repo (in plaats van
   het oude `index.html`). Net als vroeger plak/upload je deze bestanden,
   en GitHub Pages serveert ze.

   Let op: upload de bestanden ván binnen de `dist`-map, niet de map zelf.

---

## Hoe het project in elkaar zit

```
ruimte-spellen-pro/
├── index.html              ← de startpagina (hoef je amper aan te komen)
├── package.json            ← lijst van bouwstenen
├── src/
│   ├── main.js             ← hier worden alle spellen geregistreerd
│   └── scenes/
│       ├── BootScene.js    ← laadt plaatjes/geluiden, draait als eerste
│       ├── MenuScene.js    ← het hoofdmenu
│       └── BalloonScene.js ← het Ballon Merge spel (voorbeeld)
└── public/                 ← hier komen later plaatjes en geluiden
```

**Een nieuw spel toevoegen** doe je zo:
1. Maak een nieuw bestand in `src/scenes/`, bijvoorbeeld `MathScene.js`
2. Kopieer de structuur van `BalloonScene.js` als startpunt
3. Registreer het in `src/main.js` (voeg het toe aan de `scene: [...]` lijst)
4. Verwijs ernaar vanuit het menu in `MenuScene.js`

---

## Veelvoorkomende problemen

**"npm wordt niet herkend als opdracht"**
→ Node.js is niet (goed) geïnstalleerd, of je moet VS Code helemaal
   afsluiten en opnieuw openen na het installeren van Node.

**De browser blijft wit**
→ Kijk in de terminal of er een rode foutmelding staat. Vaak is het een
   typefout in de code. De foutmelding zegt meestal in welk bestand en
   op welke regel.

**Wijziging niet zichtbaar**
→ Draait `npm run dev` nog? Zo niet, start hem opnieuw.

---

## Wat is er nu al "een niveau hoger"?

In dit voorbeeld-project zie je meteen het verschil met de oude versie:

- **Echte glanzende 3D-ballonnen** met kleurverlopen in plaats van platte cirkels
- **Vloeiende val-animaties** met "bounce"-effect (Bounce.easeOut)
- **Particle-explosies** bij elke merge
- **Camera-schud** bij grote merges voor extra impact
- **Pulserende sterrenhemel** als achtergrond
- **Regenboog-animatie** op de titel

En dit is nog maar één spel. De structuur is nu zo opgezet dat je
makkelijk de andere spellen kunt overzetten en verbeteren.

---

## En daarna? (de echte app)

Als dit eenmaal draait en je het in de App Store wilt, is de volgende stap
**Capacitor** — dat pakt deze webcode in als een echte iOS-app. Dat vereist
wel een Mac en een Apple Developer-account (99 dollar per jaar). Maar dat is
een latere zorg; eerst dit lekker mooi maken.

Veel plezier samen met Adrian! 🚀
