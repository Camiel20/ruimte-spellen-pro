// ===== HOEDJES — de verzamel-beloning van Getallen-Land =====
// Elke gehaalde wereld geeft een hoedje voor je figuurtje (de 🎩-knop op de
// wereldkaart). Puur cosmetisch, puur trots. Het hoedje wordt op het ene
// render-choke-point getekend (drawPlayer in AdventureScene) en schaalt dus
// automatisch mee met reus/muisje.
//
// Elke teken(g, s)-functie tekent rond (0, 0) = het midden van de BOVENKANT
// van de top-kubus, met s = schaal (1 = normale kubus van 44px). Omhoog is
// negatief-y.

import { hasMedal, telGoudenNullen } from '../progress.js';

export const HOEDJES = [
  { id: 'pet', naam: 'Rode Pet', medal: 'world1_done', teken: (g, s) => {
    g.fillStyle(0xe8402c, 1); g.fillRoundedRect(-14 * s, -14 * s, 28 * s, 12 * s, 6 * s);
    g.slice(0, -12 * s, 14 * s, Math.PI, 0, false); g.fillPath();
    g.fillStyle(0xb93227, 1); g.fillRoundedRect(4 * s, -6 * s, 18 * s, 5 * s, 2 * s); // klepje
    g.fillStyle(0xffffff, 1); g.fillCircle(0, -18 * s, 3.4 * s);
  } },
  { id: 'strandhoed', naam: 'Strandhoed', medal: 'world2_done', teken: (g, s) => {
    g.fillStyle(0xffe16b, 1); g.fillEllipse(0, -4 * s, 40 * s, 10 * s);
    g.slice(0, -6 * s, 13 * s, Math.PI, 0, false); g.fillPath();
    g.fillStyle(0xe8402c, 1); g.fillRect(-13 * s, -10 * s, 26 * s, 4 * s); // lint
  } },
  { id: 'eikel', naam: 'Eikel-Mutsje', medal: 'world3_done', teken: (g, s) => {
    g.fillStyle(0x6e4a26, 1); g.slice(0, -3 * s, 16 * s, Math.PI, 0, false); g.fillPath();
    g.fillStyle(0x8a5e33, 1);
    for (let i = 0; i < 3; i++) g.fillCircle(-8 * s + i * 8 * s, -10 * s, 2.6 * s);
    g.fillRoundedRect(-2 * s, -22 * s, 4 * s, 8 * s, 2 * s); // steeltje
  } },
  { id: 'kristalkroon', naam: 'Kristal-Kroontje', medal: 'world4_done', teken: (g, s) => {
    g.fillStyle(0x9b6dd6, 1);
    g.fillTriangle(-14 * s, -2 * s, -8 * s, -2 * s, -11 * s, -16 * s);
    g.fillTriangle(-4 * s, -2 * s, 4 * s, -2 * s, 0, -20 * s);
    g.fillTriangle(8 * s, -2 * s, 14 * s, -2 * s, 11 * s, -16 * s);
    g.fillStyle(0xc7a6ee, 1); g.fillRect(-15 * s, -4 * s, 30 * s, 4 * s);
  } },
  { id: 'astrohelm', naam: 'Astro-Helm', medal: 'world5_done', teken: (g, s) => {
    g.fillStyle(0xe8eef5, 1); g.slice(0, -2 * s, 16 * s, Math.PI, 0, false); g.fillPath();
    g.fillStyle(0x8fd3f2, 0.8); g.fillEllipse(0, -9 * s, 18 * s, 8 * s); // vizier-glans
    g.lineStyle(2 * s, 0x5b6168, 1); g.strokeCircle(10 * s, -16 * s, 2.5 * s); // antenne-bol
    g.fillStyle(0x5b6168, 1); g.fillRect(9 * s, -14 * s, 2 * s, 12 * s);
  } },
  { id: 'hogehoed', naam: 'Grauws Hoge Hoed', medal: 'grauw_verslagen', teken: (g, s) => {
    g.fillStyle(0x2b2f34, 1);
    g.fillRect(-16 * s, -4 * s, 32 * s, 4 * s);
    g.fillRoundedRect(-10 * s, -24 * s, 20 * s, 21 * s, 3 * s);
    g.fillStyle(0x9b6dd6, 1); g.fillRect(-10 * s, -9 * s, 20 * s, 4 * s); // paars lint: hij hoort er nu bij
  } },
  { id: 'koksmuts', naam: 'Koksmuts', medal: 'world7_done', teken: (g, s) => {
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(-11 * s, -12 * s, 22 * s, 10 * s, 3 * s);
    g.fillCircle(-8 * s, -15 * s, 6 * s); g.fillCircle(0, -18 * s, 7 * s); g.fillCircle(8 * s, -15 * s, 6 * s);
    g.lineStyle(1.5 * s, 0xd0d6dd, 1); g.strokeRoundedRect(-11 * s, -12 * s, 22 * s, 10 * s, 3 * s);
  } },
  { id: 'pannenkoek', naam: 'Pannenkoek-Baret', medal: 'world8_done', teken: (g, s) => {
    g.fillStyle(0xe8b96e, 1); g.fillEllipse(0, -5 * s, 34 * s, 11 * s);
    g.fillStyle(0xd9a44f, 0.85); g.fillEllipse(-6 * s, -6 * s, 8 * s, 4 * s); g.fillEllipse(7 * s, -4 * s, 6 * s, 3 * s);
    g.fillStyle(0xffe16b, 1); g.fillRoundedRect(-4 * s, -11 * s, 8 * s, 6 * s, 2 * s); // boter-klontje
  } },
  { id: 'wcrol', naam: 'Wc-Rol-Hoedje', medal: 'world9_done', teken: (g, s) => {
    g.fillStyle(0xffffff, 1); g.fillRoundedRect(-10 * s, -16 * s, 20 * s, 15 * s, 3 * s);
    g.fillStyle(0xd8dee5, 1); g.fillEllipse(0, -16 * s, 20 * s, 7 * s);
    g.fillStyle(0x9aa0a6, 1); g.fillEllipse(0, -16 * s, 8 * s, 3 * s); // het kokertje
    g.fillStyle(0xffffff, 1); g.fillRect(6 * s, -8 * s, 7 * s, 8 * s); // flapje papier
  } },
  { id: 'hoornhelm', naam: 'Reuzen-Helm', medal: 'world10_done', teken: (g, s) => {
    g.fillStyle(0x8a6e5a, 1); g.slice(0, -2 * s, 15 * s, Math.PI, 0, false); g.fillPath();
    g.fillStyle(0xe8eef5, 1);
    g.fillTriangle(-14 * s, -6 * s, -8 * s, -10 * s, -16 * s, -18 * s);
    g.fillTriangle(14 * s, -6 * s, 8 * s, -10 * s, 16 * s, -18 * s);
    g.fillStyle(0x6e5546, 1); g.fillRect(-15 * s, -4 * s, 30 * s, 3 * s);
  } },
  { id: 'strik', naam: 'Roze Strik', medal: 'world11_done', teken: (g, s) => {
    g.fillStyle(0xf2a7b8, 1);
    g.fillTriangle(-3 * s, -6 * s, -16 * s, -14 * s, -16 * s, 0);
    g.fillTriangle(3 * s, -6 * s, 16 * s, -14 * s, 16 * s, 0);
    g.fillStyle(0xd06a88, 1); g.fillCircle(0, -6 * s, 4.5 * s);
  } },
  { id: 'duikbril', naam: 'Duikbril', medal: 'world12_done', teken: (g, s) => {
    g.fillStyle(0x3fa9e0, 1); g.fillRect(-14 * s, -8 * s, 28 * s, 4 * s); // band
    g.fillStyle(0x8fd3f2, 0.9); g.fillEllipse(-7 * s, -7 * s, 11 * s, 9 * s); g.fillEllipse(7 * s, -7 * s, 11 * s, 9 * s);
    g.lineStyle(2 * s, 0x1f7a9e, 1); g.strokeEllipse(-7 * s, -7 * s, 11 * s, 9 * s); g.strokeEllipse(7 * s, -7 * s, 11 * s, 9 * s);
  } },
  { id: 'muts', naam: 'Wollen Muts', medal: 'world13_done', teken: (g, s) => {
    g.fillStyle(0xe8829e, 1); g.slice(0, -4 * s, 14 * s, Math.PI, 0, false); g.fillPath();
    g.fillStyle(0xf2b8c8, 1); g.fillRect(-14 * s, -8 * s, 28 * s, 4 * s); // streep
    g.fillStyle(0xffffff, 1); g.fillRoundedRect(-15 * s, -5 * s, 30 * s, 5 * s, 2.5 * s); // de boord
    g.fillStyle(0xffffff, 1); g.fillCircle(0, -19 * s, 4.5 * s); // de pompon!
    g.fillStyle(0xf2b8c8, 0.6); g.fillCircle(-1.5 * s, -20 * s, 2 * s);
  } },
  { id: 'beker', naam: 'Kampioens-Beker', medal: 'world14_done', teken: (g, s) => {
    g.fillStyle(0xf6c624, 1);
    g.fillRoundedRect(-8 * s, -18 * s, 16 * s, 12 * s, 4 * s);  // de kelk
    g.fillRect(-2.5 * s, -7 * s, 5 * s, 4 * s);                 // het steeltje
    g.fillRoundedRect(-7 * s, -3 * s, 14 * s, 3 * s, 1.5 * s);  // de voet
    g.lineStyle(2.2 * s, 0xb98d12, 1);                          // de oortjes
    g.beginPath(); g.arc(-10 * s, -13 * s, 4 * s, 0.4 * Math.PI, 1.6 * Math.PI); g.strokePath();
    g.beginPath(); g.arc(10 * s, -13 * s, 4 * s, -0.6 * Math.PI, 0.6 * Math.PI); g.strokePath();
    g.fillStyle(0xffe16b, 1); g.fillEllipse(-3 * s, -15 * s, 4 * s, 7 * s); // glans
  } },
  { id: 'dinokam', naam: 'Dino-Kam', medal: 'world15_done', teken: (g, s) => {
    g.fillStyle(0x57944a, 1); g.slice(0, -2 * s, 14 * s, Math.PI, 0, false); g.fillPath();
    g.fillStyle(0x2f6a33, 1); // de rugplaatjes-kam
    g.fillTriangle(-10 * s, -8 * s, -2 * s, -8 * s, -6 * s, -20 * s);
    g.fillTriangle(-2 * s, -10 * s, 6 * s, -10 * s, 2 * s, -24 * s);
    g.fillTriangle(6 * s, -8 * s, 13 * s, -8 * s, 9.5 * s, -18 * s);
    g.fillStyle(0xd9e8a8, 0.8); g.fillEllipse(-6 * s, -4 * s, 8 * s, 4 * s);
  } },
  { id: 'klokhoed', naam: 'Koekoeksklok-Hoedje', medal: 'world16_done', teken: (g, s) => {
    g.fillStyle(0x6e5436, 1); g.fillTriangle(-15 * s, -4 * s, 15 * s, -4 * s, 0, -24 * s);
    g.fillStyle(0x8a6a45, 1); g.fillRect(-13 * s, -6 * s, 26 * s, 4 * s);
    g.fillStyle(0xf3e8d0, 1); g.fillCircle(0, -11 * s, 5.5 * s); // de wijzerplaat
    g.lineStyle(1.4 * s, 0x2b2f34, 1);
    g.beginPath(); g.moveTo(0, -11 * s); g.lineTo(0, -15 * s); g.strokePath();
    g.beginPath(); g.moveTo(0, -11 * s); g.lineTo(3 * s, -11 * s); g.strokePath();
    g.fillStyle(0xf6c624, 1); g.fillCircle(0, -22 * s, 2.4 * s); // het koekoek-gaatje
  } },
  { id: 'directeur', naam: 'Directeurs-Hoed', medal: 'world17_done', teken: (g, s) => {
    g.fillStyle(0xd94f3f, 1);
    g.fillRect(-16 * s, -4 * s, 32 * s, 4 * s);
    g.fillRoundedRect(-10 * s, -24 * s, 20 * s, 21 * s, 3 * s);
    g.fillStyle(0xf6c624, 1); g.fillRect(-10 * s, -9 * s, 20 * s, 4 * s); // gouden lint
    g.fillStyle(0xffe16b, 1); // een ster op de hoed
    for (let a = 0; a < 5; a++) {
      const ang = -Math.PI / 2 + a * (2 * Math.PI / 5);
      g.fillCircle(Math.cos(ang) * 3.4 * s, -16 * s + Math.sin(ang) * 3.4 * s, 1.7 * s);
    }
  } },
  { id: 'aureool', naam: 'Gouden Nul', gouden: true, teken: (g, s) => {
    g.lineStyle(4 * s, 0xf6c624, 1); g.strokeEllipse(0, -16 * s, 26 * s, 9 * s);
    g.lineStyle(1.5 * s, 0xffe16b, 0.8); g.strokeEllipse(0, -16 * s, 30 * s, 12 * s);
  } },
];

// Is dit hoedje al verdiend?
export function isHoedjeVrij(h) {
  if (h.gouden) return telGoudenNullen() >= 5; // de geheime-wereld-eis
  return hasMedal(h.medal);
}

// Teken het gekozen hoedje bovenop een figuurtje. topY = y van de bovenkant
// van de top-kubus (in art-coördinaten), schaal = kubusbreedte / 44.
export function tekenHoedje(scene, container, hoedjeId, topY, schaal) {
  if (!hoedjeId) return false;
  const h = HOEDJES.find((x) => x.id === hoedjeId);
  if (!h) return false;
  const g = scene.add.graphics();
  g.setY(topY);
  h.teken(g, schaal);
  container.add(g);
  return true;
}
