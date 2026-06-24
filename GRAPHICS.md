# Graphics & Geluid — hoe het mooier kan

Een korte gids over wat er nu in zit, en hoe je het naar een hoger
niveau tilt. Met de console-vergelijking erbij, want die helpt om te
snappen waar je staat.

---

## Waar sta je nu?

Met Phaser zit je op het niveau van **mooie 2D-games** — denk aan de
2D-spellen uit het PS1/PS2-tijdperk, of moderne mobiele puzzelspellen
zoals Candy Crush en Drop the Number. Voor vrolijke kinderspellen rond
getallen is dit precies het juiste niveau.

In de huidige versie:
- Glanzende 3D-ogende ballonnen (getekend met kleurverlopen)
- Vloeiende animaties met "bounce"-effect
- Particle-explosies bij elke merge
- Camera-schud bij grote merges
- Pulserende sterrenhemel
- Geluid (zelf gegenereerd, geen bestanden nodig)

---

## De grootste sprong: echte plaatjes

Nu teken ik ballonnen met code (cirkels + kleurverloop). De grootste
zichtbare verbetering is overstappen op **echte getekende afbeeldingen**.
Dat gaat zo:

### Stap 1 — Een plaatje bemachtigen

Je hebt een `balloon.png` nodig (transparante achtergrond). Opties:
- **Gratis game-art**: ga naar **kenney.nl** — honderden gratis,
  vrij te gebruiken plaatjes in vrolijke stijl. Perfect voor kinderen.
- **AI-generator**: vraag om "een vrolijke cartoon ballon, transparante
  PNG, game asset stijl"
- **Zelf (laten) tekenen**

### Stap 2 — Plaatje in de map zetten

Leg het bestand in:
```
public/assets/balloon.png
```

### Stap 3 — Inladen

Open `src/scenes/BootScene.js` en haal de `//` weg voor deze regel:
```js
this.load.image('balloon', 'assets/balloon.png');
```

Klaar! Het spel gebruikt nu automatisch het echte plaatje in plaats
van de getekende versie — je hoeft verder niets te veranderen.

---

## Wat er nog meer kan in Phaser (zonder van engine te wisselen)

| Verbetering | Wat het doet | Moeite |
|---|---|---|
| Echte plaatjes | Ballon/astronaut als tekening i.p.v. vorm | Klein |
| Sprite-animatie | Astronaut die echt loopt (meerdere frames) | Middel |
| Parallax-achtergrond | Sterren/planeten in lagen voor diepte | Klein |
| Achtergrondmuziek | Vrolijk muziekje onder het spel | Klein |
| Shader-effecten | Gloed, vervaging, kleurzweem | Middel |
| Lettertype (font) | Eigen speels lettertype i.p.v. Arial | Klein |

Dit alles blijft binnen Phaser — dezelfde engine, dezelfde manier van
werken die je nu al kent.

---

## En 3D? (de PS3/PS4/PS5-richting)

Voor échte 3D — een ruimteschip waar je omheen draait, een planeet-
oppervlak om overheen te lopen — heb je een 3D-engine nodig:

- **Godot** — gratis, kan 2D én 3D, vriendelijke community. De logische
  volgende stap als je ooit 3D wilt.
- **Unity / Unreal** — hiermee worden echte console-games gemaakt. Zeer
  krachtig, maar een grote leercurve en overkill voor kinderspellen.

**Eerlijk advies:** 3D is indrukwekkend maar past niet echt bij vrolijke
getallen-spellen, en kost onevenredig veel meer werk. Mooi 2D met echte
illustraties is voor Adrian de beste prijs-kwaliteit.

---

## Console-vergelijking samengevat

- **Oude HTML-versie** → vroege thuiscomputer / simpele browsergame
- **Nu (Phaser, getekende vormen)** → PS1-niveau 2D
- **Phaser + echte plaatjes & animaties** → PS2-niveau 2D / moderne mobiele game
- **Godot/Unity 3D** → PS3/PS4/PS5 (andere wereld, veel meer werk)

Voor wat jij maakt is "Phaser + echte plaatjes" de sweet spot. 🚀
