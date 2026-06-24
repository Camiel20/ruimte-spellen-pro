# Testen op iPhone / iPad 📱

Je hebt alle spellen nu in de Phaser-versie. Zo test je ze op de iPad of
iPhone van Adrian. Je PC en de iPad moeten op **hetzelfde wifi-netwerk**
zitten.

## Stap voor stap

1. Open de Opdrachtprompt (Windows-toets → typ `cmd` → Enter)

2. Ga naar je projectmap:
   ```
   cd OneDrive\Documenten\ruimte-spellen-pro
   ```

3. Start het spel met de `--host` optie (dit maakt het zichtbaar op je
   wifi-netwerk):
   ```
   npm run dev -- --host
   ```

4. Je ziet nu twee adressen verschijnen, bijvoorbeeld:
   ```
   ➜  Local:   http://localhost:5173/
   ➜  Network: http://192.168.1.23:5173/
   ```

5. Pak de iPad. Open **Safari** en typ het **Network**-adres over
   (dus die met de cijfers, bijv. `192.168.1.23:5173`).

6. Het spel opent! Test alle zes de spellen.

## Het draaiend houden

Zolang `npm run dev` in het zwarte venster draait, blijft het spel
bereikbaar op de iPad. Sluit je het venster (of druk Ctrl+C), dan stopt
het. Voor testen laat je het dus gewoon openstaan.

Het mooie: elke keer dat ik een verbetering maak en jij het bestand
vervangt, hoef je op de iPad alleen Safari te verversen — geen opnieuw
opstarten nodig.

## Werkt het Network-adres niet?

- Controleer of de iPad op hetzelfde wifi zit als de PC (niet op 4G/5G).
- Windows Firewall kan de eerste keer vragen of Node toegang mag tot het
  netwerk → klik **Toestaan**.
- Soms blokkeert een "gast"-wifi onderlinge verbindingen. Gebruik dan je
  gewone thuis-wifi.

## Als je tevreden bent: naar de iPad als app

Net als bij de oude versie kun je dit op GitHub Pages zetten en dan op de
iPad "aan beginscherm toevoegen" via Safari (het deel-icoontje). Dan staat
het als app-icoon op het beginscherm.

Eerst online zetten:
```
npm run build
```
Upload daarna de inhoud van de `dist`-map naar je GitHub repo (zie
INSTALLATIE.md, stap 7).

Veel testplezier met Adrian! 🚀
