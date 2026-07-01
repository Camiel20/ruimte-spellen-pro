# VERTICAL SLICE — Bouwplan Level 1-1 "De Kapotte Brug"

> Concreet bouwplan voor het **eerste, gepolijste level** van Getallen-Land
> (zie `GAME-DESIGN.md` voor de visie). Dit document is het *bouwplan*, niet de
> visie: het vertaalt de vier vastgelegde ontwerpbesluiten naar code-structuur,
> zodat we de slice kunnen bouwen zonder onderweg nog te hoeven beslissen.
> **Doel van de slice:** het spelgevoel bewijzen — niet de hele game.

---

## 0. Vastgelegde besluiten (01-07-2026)
Deze vier keuzes liggen vast en sturen dit hele plan:

| # | Onderwerp | Besluit |
|---|-----------|---------|
| 1 | **Physics** | **Phaser Arcade Physics** — echte zwaartekracht/collisions. Staat al aan in `main.js` (`gravity.y: 1100`). |
| 2 | **Puzzelmodus** | **Bouw-modus bevriest lopen** — bij een poort pauzeert beweging; loop-knoppen → slepen/tikken van blokjes. |
| 3 | **Zelf-blok** | **Nu weglaten** — de brug bouw je met losse blokjes, niet met de speler zelf. |
| 4 | **Levelvorm** | **Data-gedreven** — een level = een data-object; één engine leest het uit. |

---

## 1. Scope van deze ene slice
**Zit erin (moet werken en gepolijst):**
- Lopen + springen met Arcade Physics op vaste platforms.
- Coyote-time + ruime sprong-marge (kindvriendelijk, geen precisiesprongen).
- Groeien: één **tel-bolletje (+1)** oppakken → Één wordt groter, springt hoger.
- Eén **brug-poort** (doel = 3): in bouw-modus losse blokjes (merge/split) tot 3
  → brug klikt op z'n plek, kleur stroomt terug.
- Eén **Grommel** (stomp-type): erop springen → hij wordt kleurig en juicht.
- Eén verstopte **ster** (geheim, bereikbaar ná de brug/groei).
- **Doel-vlag** (glanzende 3): raakt = level compleet → `showReward`.
- Grijs→kleur herstel-magie zichtbaar bij het oplossen van de brug.
- Touch-HUD: **← →** links, **Spring** rechts, contextknop **✋** (verschijnt bij poort).

**Bewust NIET in de slice (bewaren voor later):**
- "Leg jezelf neer als getal" (besluit 3).
- Wereldkaart, sterren-poorten, album/stickers.
- Nieuwe krachten (dubbelsprong etc.) — Twee reddén tonen we, de *kracht* activeren we nog niet.
- Meerdere poort-types (trein, rivier, weegschaal). Alleen de brug.
- Gouden Nul (mag als leeg "later hier"-plekje getekend worden, niet functioneel).

---

## 2. Nieuwe bestanden

```
src/scenes/AdventureScene.js   # de level-engine (leest leveldata, doet physics + HUD + puzzel-states)
src/levels/world1.js           # leveldata (LEVEL_1_1 als eerste; array voor de rest)
```

Registreren in `src/main.js`: importeren + toevoegen aan de `scene: [...]`-lijst
(scene-key bv. `Adventure`). Voorlopig **niet** aan een menutegel koppelen — start
'm tijdens ontwikkelen direct (bv. tijdelijke debug-tegel of `scene.start('Adventure', { level: 'LEVEL_1_1' })`).

> Naamkeuze: `AdventureScene` (niet `PlatformScene` — die bestaat al als de oude
> 2D-platformer en blijft ongemoeid).

---

## 3. Leveldata-schema (besluit 4)
Eén level is puur data. De engine kent geen level-specifieke code. Voorstel:

```js
// src/levels/world1.js
export const LEVEL_1_1 = {
  id: '1-1',
  naam: 'De Kapotte Brug',
  world: 480, worldW: 1600,            // wereldbreedte (camera scrollt horizontaal)
  bg: { top: 0x8fd3ff, bottom: 0x8ed36b }, // lucht → gras (Numberblocks-thema)
  start: { x: 60, y: 500 },            // spawn van Één
  platforms: [                          // [x, y, breedte, hoogte] — statische bodies
    [0, 560, 640, 60],
    [720, 560, 400, 60],               // andere kant van de kloof
    [300, 420, 120, 20],               // richel voor de verstopte ster
  ],
  pickups: [                            // groei-bolletjes (+1)
    { x: 200, y: 500, amount: 1 },
  ],
  gates: [                              // reken-poorten
    { type: 'brug', x: 660, y: 560, gap: 80, doel: 3,
      blocks: [1, 2] },                // losse blokjes die klaarliggen (som/split naar 3)
  ],
  grommels: [
    { type: 'stomp', x: 420, y: 520, patrol: 80 },
  ],
  secrets: [
    { type: 'ster', x: 340, y: 380 },  // bereikbaar via richel na groei/dubbelsprong
  ],
  goal: { x: 1500, y: 500, value: 3 }, // doel-vlag
};

export const WORLD1 = [LEVEL_1_1 /*, LEVEL_1_2, ... */];
```

> De engine valideert niets exotisch: onbekende `type`-waarden negeert hij met een
> console-waarschuwing, zodat half-afgemaakte leveldata niet crasht.

---

## 4. Scene-states (besluit 2)
`AdventureScene` is een kleine state-machine. Twee hoofdstanden:

- **VERKENNEN** — Arcade Physics actief; ← → beweegt, Spring springt; camera volgt
  Één (`startFollow`, deadzone, `setBounds` op worldW). ✋-knop verborgen tenzij Één
  vlak bij een poort staat.
- **BOUWEN** — betreden zodra Één een poort-triggerzone raakt *en* op ✋ tikt.
  - Speler-body krijgt `body.moveable = false` / velocity 0 (bevroren, blijft staan).
  - Loop-/sprongknoppen verbergen; de losse blokjes van de poort worden interactief
    (slepen = samenvoegen, tik = splitsen — hergebruik uit `NumberLandScene`).
  - Een **terug-knop** (↩) om bouw-modus te verlaten zonder op te lossen.
  - Bij `som === doel`: poort lost op (`solveGate`), terug naar VERKENNEN.

Overgangen krijgen een korte fade/juice zodat het duidelijk voelt (geen harde knip).

---

## 5. Hergebruik uit bestaande code (exacte API's)
Niets van dit hoeft opnieuw bedacht:

| Nodig | Uit | Aanroep |
|-------|-----|---------|
| Numberblock-uiterlijk (glans, cijfer, armpjes, ogen) | `NumberLandScene.js` | `drawBlockVisual(block)`, `drawPersonality(block)`, palet `SIG[]` |
| Blokjes samenvoegen / splitsen | `NumberLandScene.js` | `mergeBlocks(a, b)`, `tapBlock(block)` — patroon overnemen in engine |
| Geluid (woordloos) | `voice.js` | `Voice.cue('cheer')`, `Voice.cue('jump')`, `Voice.cue('greet')`, `Voice.number(3)` |
| SFX | `sound.js` | `SFX.coin()` (bolletje), `SFX.grow(n)` (groeien), `SFX.merge(n)`, `SFX.correct()` (poort klikt), `SFX.pop()` |
| Beloningsscherm + confetti | `reward.js` | `showReward(scene, { title, stars, medal, onClose })`, `confettiBurst(scene)` |
| Sterren / medailles | `progress.js` | `addStars(n)`, `giveMedal(id)`, `hasMedal(id)` |
| Menu-muziek stoppen bij binnenkomst | (patroon uit `NumberLandScene`) | `stopMusic()` in `create` |

Beloningen slice: level-af → `showReward` met `stars: 3` (finish + geheim-ster +
brug-bonus) en medaille `adventure_1_1`.

---

## 6. Kindvriendelijke besturing (ontwerp-risico uit GDD §16)
- **Coyote-time** ~120 ms: sprong lukt ook nét na de rand (Arcade: eigen timer, niet
  puur `body.onFloor()`).
- **Jump-buffer** ~120 ms: tik vlak vóór de landing telt alsnog.
- **Ruime hitboxen**, grote knoppen (min ~64 px), geen straf: raakt een Grommel je
  van opzij → je **krimpt −1** en stuitert terug (geen dood). Bij grootte 0: zacht
  terug naar laatste checkpoint (in de slice: het startpunt).
- **Reken los van platform:** de brug-poort staat op **vaste grond zonder afgrond
  eronder tijdens het bouwen** — zo dwing je nooit springen én rekenen tegelijk af.

---

## 7. Bouwvolgorde (klein → compleet, elke stap speelbaar)
1. **Engine-skelet:** `AdventureScene` leest `LEVEL_1_1`, tekent bg + platforms
   (statische Arcade-bodies), spawnt Één als physics-sprite. Lopen + springen werkt.
2. **Camera + HUD:** follow met bounds; touch-knoppen ← → Spring.
3. **Groei-bolletje:** oppakken → waarde +1, blok groter, `SFX.grow`, hoger springen.
4. **Grommel (stomp):** patrouille; erop = terugkleuren + `Voice.cue('cheer')`; van
   opzij = krimpen.
5. **Brug-poort + bouw-modus:** state-machine, merge/split-blokjes, oplossen → brug
   verschijnt + grijs→kleur, `SFX.correct()`.
6. **Verstopte ster + doel-vlag:** ster op de richel; vlag raken → `showReward`.
7. **Polish-pass:** squash & stretch, stofwolkjes, camera-punch bij succes, fade-in.

> Na stap 1–2 kun je al "voelen" of Arcade-besturing goed aanvoelt — het vroegste
> échte bewijs van spelgevoel. Daar eventueel bijsturen vóór de rest.

---

## 8. Definition of done (slice)
- Level speelbaar van start tot doel-vlag op **telefoon-formaat** (480×800, FIT).
- Alle 7 slice-elementen (§1) werken en voelen af.
- Geen game-over; krimpen + checkpoint werkt.
- `showReward` met 3 sterren + medaille verschijnt en is opgeslagen (`progress.js`).
- Draait in de bestaande build (`npm run dev`) zonder console-errors.

---

## 9. Denkstand-advies per bouwstap
Volgens afspraak vooraf aangekondigd:
- **Stap 1 (engine-skelet + state-machine-opzet):** kort even **high** — dit is de
  architectuur die alle latere levels erven.
- **Stap 2–7 (uitvoeren):** **medium** — koers ligt vast, gestaag bouwen.
- **Polish-pass (§7.7) + latere bugfixes:** **laag–medium**.

---

*Volgende stap wanneer je "ga bouwen" zegt: stap 1 (engine-skelet), op high.*
