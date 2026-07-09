# LETTER-LAND — De Grote Stilte
### Game Design Document (GDD) · werktitel · v0.1 (herontwerp)

> Een origineel spel-avontuur waarin je leert **lezen en spellen door te doen**,
> in de sfeer van Alphablocks — maar **zonder** auteursrechtelijke beelden,
> namen of audio. Voor jonge kinderen (±4–7 jaar). Lezen is geen los oefeningetje
> maar zit ín de sprongen, de puzzels en je krachten.

> **Waarom dit document bestaat:** de eerste bouw was een reskin van Getallen-Land
> (geleende krachten + "loop naar een poort"-levels). Dat gooien we weg. Letters
> kunnen iets wat getallen niet kunnen — **klinken** en samen **woorden met
> betekenis** vormen — en dáár draait dit spel volledig op.

---

## 0. High concept (één alinea)
Je bent een klein, dapper letter-vriendje in **Letter-Land**, een wereld die
leeft dóór geluid: gepraat, gezang, geritsel, gelach. **De Sisser** — een grijze
mopperkont met een vinger op z'n lippen — vindt al dat lawaai maar niks en zuigt
de **klank uit de woorden**. Zonder klank vallen de woorden stil: de wereld wordt
grijs, dingen werken niet meer, vriendjes vallen in slaap. Jij brengt de wereld
terug door **woorden te spellen die écht gebeuren**: spel *zon* en de zon breekt
door het ijs; spel *bal* en een reuzenbal ploft neer om overheen te kaatsen; spel
*bel* en een slapend vriendje wordt wakker. En elke letter die je bevriendt geeft
je een **kracht op basis van z'n klank**: de **S** sist en laat je vooruit
*sssprinten*, de **B** *botst* je superhoog, de **W** blaast een *windvlaag*.
Lezen is letterlijk je toverkracht.

**Pijlers (waar elke ontwerpkeuze aan getoetst wordt):**
1. **Woord-magie = de kern.** Elk echt obstakel los je op door een woord te
   spellen wiens *betekenis* de oplossing is. Lezen = iets doen, nooit een quiz.
2. **Elke letter is een klank-kracht.** Krachten komen van letters, elk gekoppeld
   aan z'n klank. Geen geleende platformer-werkwoorden.
3. **Geen rechtdoor — speeltuinen met keuze.** Verkennen, verzamelen, aftakkingen,
   geheimen. Meerdere woorden = meerdere routes.
4. **De wereld kleurt terug.** Stilte → klank, grijs → kleur. Hoe meer je spelt,
   hoe levendiger de wereld — je succes is zichtbaar en voelbaar.
5. **Interactie boven aankleding.** Het kind verzamelt letters, bouwt het woord
   met z'n vinger en ziet de magie. Plaatjes zijn de beloning, niet de kern.
6. **Vriendelijk, nooit "game over".** Fout = een zacht "hmm, dat is *mmm*, we
   zoeken *sss*" + de klank klinkt. Nooit straf.
7. **Woordlengte volgt de missie, niet een vaste regel.** Wereld 1 = 3-letter-
   woorden. Daarna mag het 4 of 5 zijn — maar de lengte hoort bij wat de puzzel
   *nodig heeft* (een naam, een rijm, een groot ding), niet bij een schema.

---

## 1. Verhaal & waarom je op avontuur gaat
Letter-Land leeft dóór geluid. De **Sisser** wil "één grote, fijne stilte" en
bouwt een machine die de klank uit woorden zuigt (**De Grote Stilte**). Waar de
klank verdwijnt, wordt alles grijs en stil: de zon durft niet meer te schijnen,
bruggen vallen weg, de Alfa-Blokjes vallen in slaap.

Jij bent het enige vriendje dat nog *durft te praten*. Samen met **Priet het
potlood** (dat níét stil te krijgen is) reis je door Letter-Land en breng je de
klank — en de kleur — terug, woord voor woord. Onderweg bevrijd je letter-
vriendjes die je hun kracht schenken, en versla je de **Stilte-familie** van de
Sisser. In de finale ontdekt de Sisser dat woorden juist het állermooiste klinken
en zingt hij mee.

---

## 2. De kern-loop: WOORD-MAGIE (de spel-plek)
Dit is het hart van het spel en het moet **tastbaar en leesbaar** zijn voor een
4–6-jarige. Zo werkt een *spel-plek*:

1. **Het doel is een grijze schim.** Een vervaagd plaatje toont wát er moet
   gebeuren (een grijze zon boven bevroren ijs, een lege vijver, een kapotte
   brug). Erboven staan lege **letter-vakjes** (3 voor een 3-letterwoord).
2. **Je verzamelt de letters.** De juiste letter-vriendjes liggen verspreid in
   het level (op richels, in struiken, achter een waterval). Je raapt ze op in je
   **letter-buidel**. (Soms liggen er extra/verkeerde letters → je moet *kiezen*.)
3. **Je bouwt het woord met je vinger.** Sleep de letters in de vakjes, op
   volgorde. Elke opgepakte letter **zingt z'n klank**. Een juiste letter klikt
   vast met een blij geluid; een verkeerde schudt zacht en speelt z'n klank
   ("dat is *mmm*, we zoeken *sss*"). Voor niet-lezers: de schim + de eerste
   letter staat lichtgrijs voorgedrukt als hint.
4. **BLEND & POEF.** Vol woord → de letters schuiven samen, zingen snel achter
   elkaar, dan klinkt het hele woord → **POEF** → het ding verschijnt in volle
   kleur en **doet z'n ding** (zon schijnt/ijs smelt, vis rijst op, bal ploft
   neer). De kleur keert terug in de omgeving.

**Waarom dit sterker is dan overtrekken:** het kind moet (a) de schim *lezen* om
het woord te weten, (b) de juiste letters *vinden en kiezen* (lezen), (c) ze
*ordenen* (spellen), (d) genieten van de magie (beloning). Overtrekken
(`TraceChallenge`, bestaat al) blijft optioneel beschikbaar als "letter opladen"
voor de allerjongsten, maar **samenstellen is de ster**.

**Voorbeelden van woord → effect (betekenis = oplossing):**
| woord | wat het doet |
|-------|--------------|
| `zon` | zon breekt door → ijs smelt, pad open |
| `vis` | een grote vis rijst op en draagt je over het water |
| `bal` | een reuzen-stuiterbal ploft neer → kaats naar een hoge richel |
| `bel` | een bel rinkelt → een slapend vriendje wordt wakker |
| `bus` | een busje komt aanrijden → lift naar het volgende stuk |
| `mat` | een mat rolt uit → over de modder/prikkels |
| `pen` | een grote pen prikt een ballon/zeepbel kapot |

---

## 3. KLANK-KRACHTEN (letters = je gereedschapskist)
Krachten komen **niet** uit Getallen-Land. Elke kracht is een **letter-vriendje**
dat je bevrijdt, en de kracht weerspiegelt z'n **klank**. Zo leert élke kracht een
klank, en zijn er in principe 26 mogelijk (uitbreidbaar per wereld).

**Kern-set (Wereld 1–2), diep uitgewerkt:**
- **S — "sss" — Sssprint:** schiet pijlsnel vooruit (dash); glij onder lage
  openingen door; skate over glad ijs. (slang-achtig)
- **B — "buh" — Botsbal:** rol je op tot een stuiterbal, kaats superhoog en van
  muren af. (haal hoge geheimen)
- **W — "wuh" — Windvlaag:** blaas een vlaag → drijvende platforms bewegen,
  stilte-wolkjes waaien weg, je zeilt op een blad over een kloof.

**Latere krachten (W3–4+), pas als de missie ze nodig heeft:**
- **R — "rrr" — Rol:** rol als een kei door tunnels, ram grijze blokken kapot.
- **G — "g" — Groei:** word groot (duw zware dingen, stamp). *(betekenisvol: een
  hoofdletter is "groot", zie W4)*
- **P — "puh" — Pof:** pop zeepbellen, duw blokken, polsstok-sprong.
- **F — "fff" — Fffoep:** een lange blaas / zweef zachtjes naar beneden.
- **T — "tuh" — Tik:** schop blokken, zet schakelaars aan.

**Ontwerpregel:** een kracht gebruiken versterkt élke keer z'n klank. Krachten
blijven (meestal) een wereld lang beschikbaar, zodat latere puzzels ze combineren
(spel een woord én gebruik een kracht om bij de spel-plek te komen). **Diepte
boven breedte:** W1 levert 3 échte krachten (S, B, W) met level-ontwerp eromheen;
daarna 1–2 per wereld. Nooit 26 halve krachten.

---

## 4. De STILTE-FAMILIE (villains per wereld)
De Sisser stal de klank; z'n familie steelt elk een taal-aspect → elke wereld z'n
eigen antagonist + baas-mechaniek.

- **De Sisser** (hoofd-villain, W1 & finale) — sust; zuigt de klank uit letters.
  Baas: spel z'n gestolen woorden terug terwijl je z'n "sss"-wolkjes ontwijkt.
  *(Al geprototyped — behouden, maar nu als slotstuk van een rijke wereld, niet
  als hele spel.)*
- **De Klinkervreter** (W2) — eet de klinkers, zodat woorden niet af komen.
  Baas: dwing hem de klinkers uit te spugen door de juiste woorden te spellen.
- **De Rijm-rover** (W3) — hutselt eerste letters door elkaar; niets rijmt of
  klopt meer. Baas: rijm-kettingen op tijd afmaken.
- **Kapitein Klein** (W4) — verwart hoofd- en kleine letters. Baas: zet elke naam
  weer met een hoofdletter.
- **Finale — Stiltestad:** de familie verzamelt; jij zingt de stad weer tot
  leven. De Sisser bekeert zich en zingt mee.

---

## 5. Werelden & leerlijn (woordlengte volgt de missie)
- **W1 — De Praatweide · 3-letterwoorden.** Leer woord-magie; bevriend **S, B,
  W**. Concrete, tekenbare woorden (zon, vis, bal, bel, bus, pen, mat, kat, sok).
  Baas: **De Sisser**.
- **W2 — De Klinkergrot · klinkers (3→4 letters).** De 5 klinkers **A-E-I-O-U**
  zijn gevangen en stil. **Held-mechaniek:** dezelfde medeklinkers + een andere
  klinker = een ánder woord = een ander effect. `b_l` → **bal** (stuitert) /
  **bel** (rinkelt) / **bol** (rolt weg). Je kiest de klinker die de puzzel nodig
  heeft → je bevrijdt die klinker. Leert: klinkers doen het zware werk. Baas: **De
  Klinkervreter**.
- **W3 — Het Rijmwoud · rijmen (3-letter-families).** Verander de eerste letter →
  **kat → mat → rat**, **sok → rok → kok**. Rijm-wissel transformeert de wereld
  (een *kat* wordt een *mat* om over te lopen). Later 4-letter-rijmen (maan → baan
  → laan → kraan). Baas: **De Rijm-rover**.
- **W4 — Hoofdletterberg · hoofd/kleine letters (4–5 letters).** HOOFDletter =
  GROOT & sterk, kleine letter = klein & wendbaar (case = vorm, met betekenis).
  Namen beginnen met een hoofdletter → spel de **NAAM** van een vriendje om 'm te
  wekken (Sam, Nul, Adrian?). Baas: **Kapitein Klein**.
- **W5 — Stiltestad (finale) · 4–5 letters, mini-zinnetje.** Herstel de stad met
  woord-magie; climax = een kort zinnetje ("de zon"). Baas: **De Sisser** + familie
  (bekeerd slotfeest).

**Woordlengte-regel (jouw punt):** lengte is een **ontwerp-knop per puzzel**,
begrensd door het wereld-niveau. W1 gebruikt 3 letters omdat een brug/zon 3
letters is; een latere "spel de naam"-missie mag 3 of 5; een rijm-familie blijft
kort; een "groot" concept mag een langer woord rechtvaardigen. Nooit lengte om de
lengte.

**Gecureerde woordbanken (tekenbaar én fonetisch schoon):**
- 3-letter: zon, vis, bal, bel, bus, pen, kat, pet, jas, mat, bak, pot, kip, mok,
  tas, sok, rok, bad, mes, vla.
- klinker-wissel (zelfde medeklinkers): **b_l → bal/bel/bol**, **b_k → bak/bek/
  bok**, **p_t → pot/pet**, **r_k → rok/... ** (curatie loopt door bij de bouw).
- rijm-families: **-ok**: sok, rok, kok, bok, hok · **-at**: kat, mat, rat, gat,
  lat · **-aan** (4): maan, baan, laan, kraan.

---

## 6. Level-ontwerp-playbook (zo sterft "rechtdoor lopen")
Elk level (een klein wereld-stuk, ±4–6 min) MOET hebben:
- **Verkennen & verzamelen:** letters/vriendjes verstopt op richels, in struiken,
  achter watervallen. Het kind struint rond en vult z'n letter-buidel.
- **2–4 woord-magie-plekken**, waarvan minstens één **optioneel** (geheim woord →
  geheime beloning).
- **Aftakkende routes:** spel woord A voor de hoge weg, woord B voor de lage;
  welke letters je vindt bepaalt welk pad open gaat.
- **Kracht-gepoorte verkenning (metroidvania-light):** je hebt B-bots nodig voor
  díe richel, S-sprint voor dát ijs, W-wind voor díe kloof. Terugkomen met een
  nieuwe kracht onthult geheimen.
- **Een levende wereld:** rondlopende letter-NPC's (elk doet z'n klank-actie), de
  kleur die terugkeert terwijl je spelt, verstopte **geheime woorden** die
  schatkamers openen (herspeelwaarde).
- **Baas = slotstuk** met de wereld-mechaniek op volle sterkte.

**NOOIT:** een rechte gang met identieke poorten.

---

## 7. Art & audio
- 100% zelf getekend (geen auteursrechtelijke Alphablocks-beelden/-audio), in de
  Nul & Co-huisstijl. Letters zijn figuurtjes met gezicht + hun klank-actie (S
  slingert, B stuitert). De Sisser + Stilte-familie bestaan al deels
  (`letterCast.js`).
- **"Kleur keert terug"-lijn:** werelden beginnen grijs/verzadigingsloos (De Grote
  Stilte); elk gespeld woord schildert een plek terug in kleur — een zichtbare,
  emotionele voortgangsbalk.
- Audio: hergebruik de Web-Audio-jingles + de neurale **klank-clips (klank-a..z
  bestaan al!)** + woord-clips; blend de letterklanken bij een af woord.
  (`Voice.cue('klank-x')`, `tools/maak-stemmen.mjs`.)

---

## 8. Techniek (eerlijk & bouwbaar)
- **Niet blijven vastplakken aan `AdventureScene`** voor de letter-magie — dát
  maakte het een reskin. De **woord-magie-spel-plek** en de **klank-krachten**
  verdienen eigen systemen.
  - *Aanpak (pragmatisch):* hergebruik de **loop/spring/verken-schil** van de
    avontuur-engine, maar **vervang de puzzel- én kracht-laag** volledig door
    letter-eigen systemen. Zo blijft de bouw behapbaar zonder een reskin te zijn.
- **Herbruikbaar:** `TraceChallenge` (optioneel letter-opladen), de klank/woord-
  audio-pijplijn, confetti/juice, de loop/spring-controller, kaart- en cutscene-
  scaffolding, de bestaande cast-art.
- **Nieuw te bouwen:** de **spel-plek** (schim-doel + letter-vakjes + sleep-
  samenstellen + blend + manifest-effect), de **letter-buidel/verzameling**, elke
  **klank-kracht** als eigen ability-module, het **kleur-terug-systeem**, de
  **klinker-wissel** (W2), **rijm-wissel** (W3), **case** (W4).
- **Data-gedreven levels:** een level somt spel-plekken op (doelwoord, wat het
  manifesteert, positie), letter-pickups, kracht-poorten, geheimen.

---

## 9. Bouw-routekaart (uitgever-stijl: eerst diepte, dan breedte)
- **Mijlpaal 0 — Vertical slice (bewijs de kern):** ÉÉN level van W1 met
  verkennen, 2 spel-plekken met echte manifest-effecten (`zon` smelt ijs, `bal`
  kaatst je omhoog), 1 klank-kracht verdiend (**B-bots**) die een geheim opent, de
  S-sprint-intro, en kleur-terug. Nog geen baas. **Is dit level leuk én
  verrassend, dan werkt het spel.**
- **Mijlpaal 1 — W1 De Praatweide af:** 4–5 speeltuin-levels + S/B/W + De Sisser-
  baas als slotstuk (het bestaande gevecht opgewaardeerd).
- **Mijlpaal 2 — W2 De Klinkergrot** (klinker-wissel) — de "oh, dit is écht een
  eigen spel"-wereld.
- **Mijlpaal 3+ — W3 Rijmwoud, W4 Hoofdletterberg, W5 Stiltestad.**
- Na elke mijlpaal: **playtest met Adrian** vóór de volgende.

---

## 10. Risico's & open vragen (kritische eerlijkheid)
- **Slepen-om-te-spellen op de iPad voor een 4-jarige** moet vergevingsgezind zijn
  (grote drop-zones, snappen). Vroeg prototypen.
- **Lees-belasting:** de schim + eerste-letter-hint + gezongen klanken moeten
  niet-lezers dragen. Houd woorden tekenbaar (concrete zelfstandige naamwoorden).
- **Scope:** 5 werelden is groot. Eerst de slice; geen breedte vóór de kern
  bewezen leuk is.
- **Klinker-wissel/rijm** hebben tekenbare minimale paren nodig (bal/bel/bol;
  kat/mat/rat) — woordlijsten curen op tekenbaar én fonetisch schoon.

---

> **Dit is een levend document.** Alles hierin is een voorstel om samen bij te
> sturen: welke krachten, welke werelden, welke woorden. Zeg wat je wil aanscherpen,
> dan bouwen we daarna gericht (te beginnen bij Mijlpaal 0 — de slice die bewijst
> dat de kern leuk is).
