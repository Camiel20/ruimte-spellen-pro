// ===== GEDEELDE TIK-HELPER =====
// Legt de hard geleerde tik-regels van Getallen-Land ÉÉN keer vast, zodat elk
// tikbaar wereld-object ze niet opnieuw hoeft af te leiden. Dat afleiden ging
// telkens mis en gaf een terugkerende bugklasse (W13/W14-munten & truien, de
// bakkerij-overlay, het hoedjes-paneel op de wereldkaart).
//
// De regels:
//  1. DEPTH >= 13. De speler is depth 12 én zelf interactief (splitsZelf); met
//     `topOnly` vangt het figuurtje anders elke tik af zodra het vóór het object
//     staat ("betalen werkt niet"). Alle tikbare wereld-objecten dus depth >= 13.
//  2. GECENTREERDE hit-vorm expliciet meegeven. Een container heeft anders een
//     hit-area vanaf zijn lokale (0,0) i.p.v. rond het midden.
//  3. CAP de hit-breedte op de buurafstand (optioneel via `w`), anders 'steelt'
//     een breed vlak de tik van de buurman.
//  4. scrollFactor(0)-CONTAINER-valkuil: interactieve kinderen van een vaste
//     (HUD-)container krijgen verschoven tik-zones bij camera-scroll. Zet zulke
//     objecten in WERELD-coördinaten, niet in een scrollFactor(0)-container.
//
// Gebruik:
//   maakTikbaar(scene, container, { w, h, onTik });                 // rechthoek
//   maakTikbaar(scene, container, { r, onTik });                    // cirkel
//   maakTikbaar(scene, container, { hit: <Geom>, onTik });          // eigen vorm

import Phaser from 'phaser';

export function maakTikbaar(scene, obj, opties = {}) {
  const { w = 48, h = 48, r, depth = 13, hit, onTik, cursor = 'pointer' } = opties;
  obj.setDepth(Math.max(depth, 13)); // regel 1: nooit onder de speler (12)

  let geom = hit;
  let contains;
  if (geom) {
    contains = geom instanceof Phaser.Geom.Circle
      ? Phaser.Geom.Circle.Contains
      : Phaser.Geom.Rectangle.Contains;
  } else if (r != null) {
    geom = new Phaser.Geom.Circle(0, 0, r);       // regel 2: gecentreerd
    contains = Phaser.Geom.Circle.Contains;
  } else {
    geom = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h); // regel 2 + 3
    contains = Phaser.Geom.Rectangle.Contains;
  }

  obj.setInteractive(geom, contains);
  if (obj.input) obj.input.cursor = cursor;
  if (onTik) obj.on('pointerdown', (pointer, lx, ly, event) => onTik(pointer, event));
  return obj;
}
