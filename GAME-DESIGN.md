# GETALLEN-LAND — Het Grote Tel-Avontuur
### Game Design Document (GDD) · werktitel · v1.0

> Een origineel, educatief 2D-platformavontuur in de sfeer van Numberblocks —
> **zonder** auteursrechtelijk beschermde beelden, namen of audio te kopiëren.
> Gemaakt voor jonge kinderen (±5–7 jaar). Rekenen is geen los onderdeel maar
> zit ín de sprongen, deuren, bruggen en vijanden.

---

## 0. High concept (één alinea)
Je bent **Één**, een dapper, nieuwsgierig blokje. De vrolijke, kleurrijke
wereld wordt langzaam grijs gezogen door **Baron Grauw** en zijn **Grommels**,
die getallen "opeten" tot er niets (nul) overblijft. Samen met **Nul** — het
enige wezentje dat niet bang is voor niks — reis je door vijf werelden, ren en
spring je door levels, red je andere getallen-vriendjes, en **tel je de wereld
weer tot leven**. Elke brug, deur, trein en vijand is een klein rekenraadsel:
niet als quiz, maar als iets dat je met je vinger *doet*. Getallen groter maken
is letterlijk je superkracht.

**Pijlers (waar elke ontwerpkeuze aan getoetst wordt):**
1. **Rekenen = spelen.** Nooit een som-popup; altijd een brug, deur of sprong.
2. **Elk getal heeft karakter.** Nieuwe getallen = nieuwe krachten & grapjes.
3. **Altijd wat te ontdekken.** Elke paar seconden een beloning of geheim.
4. **Vriendelijk, nooit eng, nooit "game over".** Fouten mogen; je krimpt, je
   sterft niet.
5. **Zichtbare vooruitgang.** Grijs wordt weer kleur — je ziet je succes.

---

## 1. Verhaal & waarom je op avontuur gaat
Getallen-Land is een wereld die leeft dóór te tellen: zolang er geteld wordt,
zijn de blokjes vrolijk en kleurrijk. **Baron Grauw** vindt tellen maar rommelig
en wil "één grote rust van niks" — een wereld zonder getallen, helemaal grijs.
Zijn **Grommels** (kleine grijze knabbelaars) trekken blokjes van getallen af,
waardoor vriendjes uit elkaar vallen, bruggen inzakken en kleuren verdwijnen.

**Één** woont in de Tel-Weide. Op een ochtend is het halve dorp grijs. Alleen
**Nul** rolt nog vrolijk rond — want Nul ís al niks, dus de Grommels kunnen niks
van Nul afpakken. Nul lacht: *"Niks is niet eng! Niks is gewoon waar je begint
met tellen!"* Samen besluiten ze de wereld terug te tellen, vriendje voor
vriendje, tot bij het grijze fort van Baron Grauw.

**Waarom dit werkt voor kinderen:** de heldendaad ís optellen (de wereld
herstellen), de vijand ís aftrekken (dingen kleiner maken). Dat maakt de
kernboodschap voelbaar zonder uitleg. En **Nul** krijgt een hoofdrol — perfect
voor een kind dat dol is op de 0.

---

## 2. Hoofdpersonages
- **Één (de speler).** Klein rood blokje, één oog vol lef. Start met basiskracht
  (lopen, springen). Groeit door het avontuur heen letterlijk groter en sterker.
- **Nul (gids & maatje).** Rond, lichtblauw, altijd blij. Zweeft mee, geeft
  hints, en heeft de unieke **Nul-kracht**: iets even "op niks" zetten — een
  Grommel bevriezen, een foute stapel wissen zodat je opnieuw mag, of een schild
  maken. Nul is de sleutel tot de finale.
- **De gered-wordende Numberblocks (2 t/m 10, 100).** Elk gevangen als grijze,
  uit elkaar gevallen blokjes. Maak het juiste getal → hij springt tot leven,
  krijgt kleur, en **sluit zich aan met een nieuwe kracht** (zie §6).
- **Baron Grauw (eindbaas).** Een grote, sjieke grijze schim met een monocle en
  een "niks-machine". Niet eng-eng: meer een chagrijnige, komische snob die
  gewoon nog nooit het plezier van tellen heeft ontdekt.
- **De Grommels (vijanden).** Kleine grijze knabbelaars. Nooit bloederig of
  eng — ze trekken blokjes af en maken pruillipjes. Je "verslaat" ze door ze
  terug te kleuren (zie §9): ze veranderen in vrolijke vriendjes. Beloning i.p.v.
  straf.

---

## 3. De kernmechaniek: "Jij bent een getal"
Je waarde (het cijfer op je hoofd-schijfje) is tegelijk je **kracht**, je
**sleutel** en je **gereedschap**. Alle wiskunde vloeit hieruit voort.

**De vier werkwoorden:**
1. **GROEIEN (+).** Verzamel gloeiende **tel-bolletjes** (+1) of loop door een
   **+veld**; je wordt een hoger blok → springt hoger, bereikt hogere richels,
   stampt grotere vijanden.
2. **BOUWEN / GEVEN (=).** Bij een "getal-slot" geef je precies het juiste getal
   af: leg blokjes neer om een **brug** te vormen, vul een **trein**, bouw
   **stapstenen** in een rivier, of "wees" het getal dat een **deur** vraagt.
3. **SPLITSEN (−).** Trek jezelf of een blok in stukken: word kleiner om door een
   nauw gat te passen, of laat een deel achter op een drukplaat ("laat 2 hier,
   neem 3 mee").
4. **NUL-KRACHT (0).** Reset/bevries/bescherm — Nul's speciale actie.

**Waarom dit slim is:** getalbegrip, optellen, splitsen (getalrelaties) en
plaatswaarde worden *bewegingen*, geen sommen. En er zijn **meerdere
oplossingen** (5 = 2+3 = 4+1 = vijf losse enen), dus geen dwingende "maak-de-5"-
sleur maar echte keuzevrijheid.

**Touch-first besturing (telefoon/tablet):**
- Grote **←  →** knoppen links, grote **Springen**-knop rechts.
- Eén contextknop **✋ (Pak/Bouw/Splits)** die verandert met wat vóór je is.
- Puzzels met losse blokjes: **slepen & tikken** (samenvoegen = op elkaar
  slepen, splitsen = tik → scheurt in twee) — precies wat we al gebouwd hebben.
- Alles bedienbaar zonder te kunnen lezen (iconen + geluidscues).

---

## 4. Gameplay-loop
**Moment-tot-moment (elke paar seconden iets leuks):** rennen, springen,
muntjes-tellen (elke munt telt hoorbaar mee), een Grommel terugkleuren, een
blokje dat op z'n plek "klikt", een geheim dat oplicht.

**Per level (±3–6 min):** start → verken & verzamel → los 1–3 verweven
rekenpoorten op → optioneel geheim/ster vinden → bereik de **doel-vlag** (een
groot gloeiend getal dat je "compleet maakt") → het level kleurt weer helemaal
bij → sterren-telling.

**Per wereld (±5–6 levels):** gewone levels → een **red-een-vriendje-level**
(nieuwe Numberblock + kracht) → een **baas-level** (Grommel-luitenant, verslagen
met een groter rekenraadsel) → wereld hersteld, poort naar volgende wereld open.

**Hele game:** vijf werelden → grijze fort van Baron Grauw → grote finale waarin
je met Nul en álle vriendjes samen het grootste getal bouwt en de kleur
terugbrengt.

---

## 5. Hoe de speler sterker wordt
- **Nieuwe getallen = nieuwe krachten** (elk wereld-einde één, zie §6).
- **Tel-badges:** verhogen je maximale grootte (verder groeien = hoger springen).
- **Sterren:** openen nieuwe levels/werelden op de wereldkaart (à la Mario World).
- **Nul-upgrades:** Nul leert hinten → bevriezen → schild → "grote reset" (finale).
- **Sticker-album (zie §8):** vult zich; 100% geeft een bonuswereld.

---

## 6. Hoe nieuwe Numberblocks worden geïntroduceerd (kracht per getal)
Elke gered vriendje leert *door te spelen* wat dat getal "is", gekoppeld aan een
platform-kracht die bij z'n karakter past:
- **2 — Dubbelsprong.** Twee sprongen. (Concept: 2, dubbel, paren.)
- **3 — Stamp/driehoek-duik.** Breek bepaalde blokken, activeer 3-schakelaars.
- **4 — Sterke Vierkant.** Duw zware kisten, sta stevig op wiebelplatforms.
- **5 — Ster-hand.** Grijp/slinger aan sterren-haken, high-five-aanval. (Vijf =
  hand met vijf.)
- **6/7/8/9 — mini-krachten & kleuren** (bv. 7 = regenboog-brug, zeven kleuren).
- **10 — De grote Tien!** Tien enen klikken samen tot een Tien: mega-vorm, breekt
  grijze muren. Dé "make-ten"-mijlpaal.
- **100 — finale-kracht** in de ruimtewereld (Adrian's grote-getallen-liefde).

Dit maakt "een nieuw getal ontmoeten" spannend én leerzaam: je vóélt wat 2, 5 of
10 bijzonder maakt.

---

## 7. De werelden (5 + finale + geheim)
Elke wereld = eigen biome, eigen getalconcept, oplopende moeilijkheid.

1. **Tel-Weide (getallen 1–5).** Groen, zonnig, zacht. Leert: tellen, +1, kleine
   combinaties, bereik-door-groeien. Red: **Twee & Drie**. Baas: een dikke
   "Drie-Grommel" die je met een grotere stapel voorbij loopt.
2. **Handjes-Kust (de 5-wereld).** Strand, zee, vijf-thema. Leert: vijftallen,
   dubbelen, samen 10 maken. Red: **Vier & Vijf** (ster-hand!). Puzzels met
   stapstenen over water. Baas: een golf-Grommel die je stopt tot je "10" bouwt.
3. **Wolkenstad / Tien-Torens (de 10-wereld).** Zwevende wolkenplatforms.
   Leert: **tien maken**, tientallen, plaatswaarde-intro (10 enen → 1 tien).
   Red: **Tien**. Liften die pas werken bij het juiste tiental. Baas: een
   wolk-Grommel; versla door tientallen te stapelen.
4. **Snoep-Splitsland (splitsen/aftrekken).** Kleurrijk snoepland. Leert:
   **splitsen & getalrelaties** (7 = 3+4), slim aftrekken om Grommels te
   ontwijken, "geef een deel weg"-puzzels. Red: **Zes t/m Negen**. Baas: een
   snoep-Grommel die alleen wijkt als je hem in twee gelijke helften "deelt".
5. **Sterrenruimte / Honderd-Heuvels (grote getallen, finale-aanloop).**
   Ruimte, planeten, grote getallen. Leert: honderdtallen, groot tellen, alles
   samen. Red: **Honderd**. Laag zwaartekracht = hoge sprongen.
   → **Fort van Baron Grauw:** de grote finale (zie §11).
- **Geheime Nul-Wereld:** vrij te spelen door alle **Gouden Nullen** te vinden —
  een vrolijk, bizar bonusgebied dat draait om de 0.

---

## 8. Verzamelobjecten & geheimen
**Verzamelen (de nieuwsgierigheids-motor):**
- **Sterren (3 per level):** 1 voor de finish, 1 voor een verstopt geheim, 1 voor
  een reken-bonus (bv. munten pakken die samen precies 10 zijn). Sterren openen
  levels/werelden → stimuleert verkennen & opnieuw spelen.
- **Gouden Nullen:** zeldzaam, goed verstopt. Alles verzameld → geheime Nul-Wereld.
- **Vriendjes-Album / Cijfer-stickers:** elk gered getal en elke ontdekte "getal-
  weetje" vult een album. Zichtbaar "nog niet compleet" = kinderen willen door.
- **Munten (tel-muntjes):** tellen hoorbaar mee; sets die 10 vormen geven bonus
  (versterkt make-ten spelenderwijs).

**Geheimen (elke paar seconden iets te ontdekken):**
- Verborgen paadjes, buizen/grotten met bonuskamers.
- **Onzichtbare blokken** die verschijnen als je het juiste getal maakt.
- **Regenboog-brug** die verschijnt bij het bouwen van een **7** (zeven kleuren).
- **Warp-routes** tussen werelden.
- Een verstopte **schatkist** per level (sterren/gouden nul).

---

## 9. Puzzels & vijanden (rekenen verweven)
**Poort-types (nooit twee keer hetzelfde aanvoelend):**
- **Brug omlaag** bij het juiste getal (bouw N blokjes tot een brug van lengte N).
- **Deur** die alleen opent met het juiste Numberblock (wees N, of breng N).
- **Trein** met lege wagons: vul tot het totaal N is (meerdere oplossingen).
- **Rivier** oversteken via stapstenen die samen N zijn.
- **Red een vriendje:** assembleer het juiste getal om hem te bevrijden.
- **Weegschaal/balans:** maak beide kanten gelijk (gelijkheid, =).
- **Lift/hoogte:** groei tot exact de goede hoogte om een richel te halen.

**Vijanden (Grommels) — geweldloos, slim:**
- **Stomp-Grommel:** stap erop als je groter bent (grootte vergelijken).
- **Kleur-Grommel:** gooi een blokje = "voeg licht toe" → hij wordt weer vrolijk.
- **Slot-Grommel:** blokkeert tot je een exact getal toont.
- **Deel-Grommel (baas):** wijkt pas als je hem eerlijk in gelijke delen splitst.
Verslagen Grommels worden kleurrijke vriendjes en juichen mee — beloning, geen
straf.

---

## 10. Educatie volledig verweven (curriculum-kaart)
Alles wat het kind leert, dóet het als spelactie — nooit als toets:
- **Wereld 1:** tellen, getalherkenning 1–5, +1, kleine optellingen, groter/kleiner.
- **Wereld 2:** vijftallen, **dubbelen**, samen 10 maken, optellen tot 10.
- **Wereld 3:** **tien maken**, tientallen, **plaatswaarde**-gevoel (wisselen).
- **Wereld 4:** **splitsen & getalrelaties** (number bonds), aftrekken, delen/helften.
- **Wereld 5:** honderdtallen, groot tellen, gecombineerd rekenen.
- **Doorlopend:** de *identiteit* van elk getal (karakter = kracht), gelijkheid (=),
  vergelijken, patronen. Geen leesvaardigheid vereist (iconen + audio).

Toetsing = voortgang: kan het kind de poort openen, dan heeft het het begrepen.
Vastlopen = een vriendelijke hint van Nul, nooit een rood kruis.

---

## 11. Einddoelen
- **Per level:** bereik het doel-getal, herstel de kleur, verzamel 3 sterren.
- **Per wereld:** versla de baas, bevrijd de "grote" Numberblock, open de volgende
  wereld.
- **Hoofddoel:** bereik het **grijze fort**; in de finale bouw je samen met Nul en
  alle geredde vriendjes stap voor stap een gigantisch getal dat het grijs
  wegveegt en de hele wereld terug in kleur zet. Baron Grauw ontdekt dat tellen
  juist leuk is en doet mee.
- **Ware einde (100%):** alle sterren + stickers + Gouden Nullen → geheime
  Nul-Wereld + een groot feest-level.

---

## 12. Moeilijkheidscurve & "faal-vriendelijk" model
- **Geen game-over.** Val je of raakt een Grommel je, dan **krimp je** (−1) of
  verlies je een blokje; bij nul val je zacht terug naar het laatste **checkpoint**.
  Oneindig proberen. Nul kan bijspringen.
- **Curve:** W1 heel zacht (één-staps, veel checkpoints) → geleidelijk meer
  stappen (10 = 6+4), splitsen, keuzes, later lichte tijdsdruk/optionele
  uitdaging → W5 grote getallen. Hoofdpad is altijd haalbaar; extra sterren zijn
  de pit voor wie meer wil.
- **Twee sporen:** makkelijk **hoofdpad** (verhaal uitspelen) + pittige
  **ster/geheim-uitdagingen** (herspeelbaarheid, oudere/handigere kinderen).

---

## 13. Nieuwsgierig houden
- Elke wereld een **nieuw vriendje + nieuwe kracht** (constante novelty).
- **Zichtbare herstel-magie** (grijs → kleur) als tastbare voortgang.
- **Album & Gouden Nullen** die "nog niet af" zijn.
- **Bazen & wereldkaart** met verborgen paden.
- **Oplopend "wow"**: van 1 naar 10 naar 100 naar de ruimte (grote getallen).
- **Beloningscadans:** ontwerp-regel = elke ~10–20 sec iets leuks (munt, kleur,
  geheim, animatie, geluidje).

---

## 14. Lengte & pacing
- ~**5 werelden × ~5–6 levels ≈ 30 levels**, elk **3–6 min**.
- **Hoofdverhaal:** ±**4–6 uur** voor een kind van 5–7.
- **100% (alle sterren/stickers/gouden nullen/geheime wereld):** ±**8–10 uur**.
- Korte levels passen bij jonge aandachtsspanne en de beloningscadans; ideaal in
  sessies van 10–20 min.

---

## 15. Art- & audio-richting
- **Kunst:** één samenhangende, zelfgetekende cartoon-stijl (dikke lijnen, felle
  kleuren, glanzende blokken met gezichtjes, armpjes, schoentjes) — 100% origineel,
  géén Numberblocks-assets. Grijs vs. kleur is het centrale visuele thema.
- **Animatie:** veel squash & stretch, idle-wiebel, knipperen, uitdrukkingen,
  begroetingen. "Alles leeft."
- **Geluid:** vrolijke **Web Audio**-klankjes + muziek per wereld. **Geen browser-
  TTS.** Spraak/feedback via de bestaande **VoiceManager** (`voice.js`) met cues;
  klaar om later **echte ingesproken NL-stemfragmenten** (mp3/ogg) toe te voegen
  (bv. papa/mama, of een verteller) zonder codewijziging.
- **Toegankelijk voor niet-lezers:** iconen, kleur, audio; nergens verplicht lezen.

---

## 16. Productienotities (voor het bouwteam)
Deze game is een uitbreiding van de bestaande codebase (Phaser 3 + Vite,
GitHub Pages). Herbruikbaar wat er al staat:
- **Numberblock-personages** (getekende stapels met gezicht/armpjes/schoentjes),
  de **merge/split**-interactie, **VoiceManager**, **SFX**, **sterren/medailles**
  (`progress.js`), confetti/beloningen (`reward.js`).
- Het huidige "Getallen-Land" (verkenbare wereld met Nul) is een goede **techniek-
  proeftuin**: camera-follow, lopen, wereld-art, NPC's — allemaal bruikbaar als
  basis voor echte platform-levels.

**Aanbevolen aanpak (niet alles tegelijk):**
1. **Verticale plak (vertical slice):** één compleet, gepolijst level uit Wereld 1
   met lopen/springen, groeien, één brug-poort, één Grommel, één ster, één geheim,
   en de doel-vlag. Dit bewijst het spelgevoel.
2. **Wereld 1 volledig** (5–6 levels + red-Twee/Drie + baas + wereldkaart).
3. **Systemen uitbouwen** (album, sterren-poorten, nieuwe krachten) per wereld.
4. **Wereld 2–5** iteratief, daarna de finale + geheime Nul-Wereld.

**Belangrijkste ontwerp-risico's & keuzes:**
- **Platform-besturing op touch** moet super simpel: grote knoppen, ruime
  sprong-marges, "coyote time", geen precisiesprongen voor jonge kinderen.
- **Puzzels kort houden** (1–3 acties) en met meerdere oplossingen, zodat het
  nooit een som-toets wordt.
- **Nooit straffen:** krimpen i.p.v. doodgaan; hints via Nul.
- **Reken-moeilijkheid loskoppelen van platform-moeilijkheid**, zodat een kind dat
  goed rekent maar minder handig springt (of andersom) toch vooruitkomt.

---

## 17. Appendix — voorbeeld-level (om het gevoel concreet te maken)
**Wereld 1, Level 1-3: "De Kapotte Brug".**
1. Je start als **Één** op een zonnig weiland. Munten tellen hoorbaar mee terwijl
   je rent. Een Grommel knabbelt aan een bloem → je springt erop, hij wordt weer
   kleurig en juicht.
2. Een kloof met een **ingezakte brug**; een bordje toont **3**. Naast de kloof
   liggen losse blokjes (1, 2) en een tel-bolletje (+1). Je maakt een **3**
   (2+1, of drie enen, of groei jezelf tot 3 en "leg jezelf neer") → de brug
   klikt met drie planken op z'n plek, kleur stroomt terug.
3. Over de brug hoor je een grijs vriendje piepen: **Twee** is uit elkaar
   gevallen in twee losse enen. Je klikt ze samen → **Twee** springt tot leven,
   krijgt kleur, en geeft je de **Dubbelsprong**.
4. Met de dubbelsprong haal je een hoge richel met de verstopte **ster** (geheim),
   en verderop een **Gouden Nul** in een wolk-grot.
5. Je bereikt de **doel-vlag**: een grote glanzende **3** die je "compleet maakt";
   het hele level knalt in kleur, sterren-telling verschijnt, Nul doet een dansje.

Dit ene level bevat al: platformen, tellen, optellen (meerdere oplossingen), een
vijand-als-beloning, een nieuwe kracht/karakter, een geheim, een verzamelobject,
en zichtbare herstel-magie — precies de mix voor de hele game.

---

*Einde GDD v1.0 — een levend document. Volgende stap wanneer we weer gaan bouwen:*
*de vertical slice (Wereld 1, één level) als bewijs van het spelgevoel.*
