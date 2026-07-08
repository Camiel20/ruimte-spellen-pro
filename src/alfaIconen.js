// ===== ALFA-BLOKKEN — ZELFGETEKENDE WOORD-ICOONTJES =====
// Elk woord heeft een eigen, zelf-getekend plaatje in de Nul & Co-huisstijl
// (felle kleuren, dikke donkere rand, vrolijke oogjes). GEEN emoji, geen
// auteursrechtelijke beelden. Elke teken-functie tekent gecentreerd op (0,0)
// binnen een vak van ±S/2; `tekenIcoon` zet er een container omheen.
//
// `ICOON_IDS` is Phaser-vrij (een simpele lijst), zodat de test de woord-data
// kan valideren zonder de engine te laden.

const DONKER = 0x2b2f3a;

// id -> teken(g, S). g = Phaser.Graphics, S = doelgrootte (breedte ≈ S).
// Geëxporteerd zodat een verificatie-render (buiten Phaser) dezelfde vormen kan
// tekenen; in het spel loopt alles via `tekenIcoon`.
export const TEKENAARS = {
  zon: (g, S) => {
    const r = S * 0.30;
    g.fillStyle(0xf7b733, 1);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const x = Math.cos(a), y = Math.sin(a);
      g.fillTriangle(x * r * 1.15 - y * S * 0.06, y * r * 1.15 + x * S * 0.06,
                     x * r * 1.15 + y * S * 0.06, y * r * 1.15 - x * S * 0.06,
                     x * r * 1.7, y * r * 1.7);
    }
    g.fillStyle(0xfcd34d, 1); g.fillCircle(0, 0, r);
    g.lineStyle(Math.max(3, S * 0.03), DONKER, 1); g.strokeCircle(0, 0, r);
    gezicht(g, S, 0, r * 0.05, r * 0.9);
  },

  bal: (g, S) => {
    const r = S * 0.40;
    g.fillStyle(0xef4444, 1); g.fillCircle(0, 0, r);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(-r * 0.35, -r * 0.35, r * 0.16);
    g.lineStyle(Math.max(3, S * 0.028), 0xffffff, 0.9);
    g.beginPath(); g.arc(0, -r * 1.2, r * 1.3, Math.PI * 0.25, Math.PI * 0.75, false); g.strokePath();
    g.beginPath(); g.arc(0, r * 1.2, r * 1.3, Math.PI * 1.25, Math.PI * 1.75, false); g.strokePath();
    g.lineStyle(Math.max(3, S * 0.03), DONKER, 1); g.strokeCircle(0, 0, r);
  },

  vis: (g, S) => {
    g.fillStyle(0x22c1c3, 1);
    g.fillTriangle(S * 0.20, 0, S * 0.44, -S * 0.20, S * 0.44, S * 0.20); // staart
    g.fillEllipse(0, 0, S * 0.66, S * 0.44);                              // lijf
    g.fillStyle(0x0e7490, 0.5); g.fillTriangle(-S * 0.02, -S * 0.06, S * 0.14, -S * 0.24, S * 0.16, -S * 0.02); // vin
    g.lineStyle(Math.max(3, S * 0.028), DONKER, 1); g.strokeEllipse(0, 0, S * 0.66, S * 0.44);
    // oog
    oog(g, -S * 0.16, -S * 0.03, S * 0.09);
    // glimlach
    g.lineStyle(Math.max(2.5, S * 0.02), DONKER, 1);
    g.beginPath(); g.arc(-S * 0.22, S * 0.04, S * 0.09, 0, Math.PI, false); g.strokePath();
  },

  bus: (g, S) => {
    const w = S * 0.8, h = S * 0.5;
    g.fillStyle(0xf59e0b, 1); g.fillRoundedRect(-w / 2, -h / 2, w, h, S * 0.08);
    g.fillStyle(0xbae6fd, 1); // ramen
    for (let i = 0; i < 3; i++) g.fillRoundedRect(-w / 2 + S * 0.08 + i * S * 0.22, -h / 2 + S * 0.08, S * 0.17, S * 0.16, S * 0.02);
    g.fillStyle(0xe11d48, 1); g.fillRect(-w / 2, h * 0.12, w, S * 0.07); // streep
    g.lineStyle(Math.max(3, S * 0.03), DONKER, 1); g.strokeRoundedRect(-w / 2, -h / 2, w, h, S * 0.08);
    g.fillStyle(DONKER, 1); g.fillCircle(-w * 0.28, h / 2, S * 0.09); g.fillCircle(w * 0.28, h / 2, S * 0.09);
    g.fillStyle(0x9aa0a6, 1); g.fillCircle(-w * 0.28, h / 2, S * 0.04); g.fillCircle(w * 0.28, h / 2, S * 0.04);
  },

  pen: (g, S) => {
    // schuine stift
    const rot = -0.5;
    const pts = (x, y) => ({ x: x * Math.cos(rot) - y * Math.sin(rot), y: x * Math.sin(rot) + y * Math.cos(rot) });
    const bl = S * 0.42;
    const a = pts(-bl, -S * 0.09), b = pts(bl * 0.6, -S * 0.09), c = pts(bl * 0.6, S * 0.09), d = pts(-bl, S * 0.09);
    g.fillStyle(0x6366f1, 1);
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(c.x, c.y); g.lineTo(d.x, d.y); g.closePath(); g.fillPath();
    const t1 = pts(bl * 0.6, -S * 0.09), t2 = pts(bl * 0.6, S * 0.09), tip = pts(bl, 0);
    g.fillStyle(0x334155, 1); g.fillTriangle(t1.x, t1.y, t2.x, t2.y, tip.x, tip.y); // punt
    const cap1 = pts(-bl, -S * 0.09), cap2 = pts(-bl, S * 0.09), cap3 = pts(-bl - S * 0.12, S * 0.09), cap4 = pts(-bl - S * 0.12, -S * 0.09);
    g.fillStyle(0x8b5cf6, 1);
    g.beginPath(); g.moveTo(cap1.x, cap1.y); g.lineTo(cap4.x, cap4.y); g.lineTo(cap3.x, cap3.y); g.lineTo(cap2.x, cap2.y); g.closePath(); g.fillPath();
    g.lineStyle(Math.max(2.5, S * 0.022), DONKER, 1);
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(c.x, c.y); g.lineTo(d.x, d.y); g.closePath(); g.strokePath();
  },

  kat: (g, S) => {
    const r = S * 0.32;
    g.fillStyle(0x9ca3af, 1);
    g.fillTriangle(-r * 0.9, -r * 0.7, -r * 0.2, -r * 1.4, -r * 0.1, -r * 0.6); // oor L
    g.fillTriangle(r * 0.9, -r * 0.7, r * 0.2, -r * 1.4, r * 0.1, -r * 0.6);     // oor R
    g.fillCircle(0, 0, r);
    g.lineStyle(Math.max(3, S * 0.028), DONKER, 1); g.strokeCircle(0, 0, r);
    oog(g, -r * 0.4, -r * 0.1, r * 0.16); oog(g, r * 0.4, -r * 0.1, r * 0.16);
    g.fillStyle(0xf472b6, 1); g.fillTriangle(-r * 0.12, r * 0.2, r * 0.12, r * 0.2, 0, r * 0.36); // neusje
    g.lineStyle(Math.max(2, S * 0.016), DONKER, 1);
    [-1, 1].forEach((s) => { g.lineBetween(s * r * 0.35, r * 0.32, s * r * 1.1, r * 0.22); g.lineBetween(s * r * 0.35, r * 0.42, s * r * 1.1, r * 0.5); });
  },

  aap: (g, S) => {
    const r = S * 0.32;
    g.fillStyle(0x8b5e34, 1);
    g.fillCircle(-r * 1.0, -r * 0.2, r * 0.42); g.fillCircle(r * 1.0, -r * 0.2, r * 0.42); // oren
    g.fillStyle(0xc9986a, 1); g.fillCircle(-r * 1.0, -r * 0.2, r * 0.22); g.fillCircle(r * 1.0, -r * 0.2, r * 0.22);
    g.fillStyle(0x8b5e34, 1); g.fillCircle(0, 0, r);
    g.fillStyle(0xc9986a, 1); g.fillEllipse(0, r * 0.28, r * 1.1, r * 0.9); // snuit
    g.lineStyle(Math.max(3, S * 0.028), DONKER, 1); g.strokeCircle(0, 0, r);
    oog(g, -r * 0.36, -r * 0.18, r * 0.16); oog(g, r * 0.36, -r * 0.18, r * 0.16);
    g.fillStyle(DONKER, 1); g.fillCircle(-r * 0.16, r * 0.2, r * 0.06); g.fillCircle(r * 0.16, r * 0.2, r * 0.06); // neusgaten
    g.lineStyle(Math.max(2.5, S * 0.02), DONKER, 1);
    g.beginPath(); g.arc(0, r * 0.35, r * 0.34, 0.15 * Math.PI, 0.85 * Math.PI, false); g.strokePath(); // lach
  },

  jas: (g, S) => {
    const w = S * 0.5;
    g.fillStyle(0x2563eb, 1);
    // lijf (trapezium)
    g.beginPath(); g.moveTo(-w * 0.7, -S * 0.28); g.lineTo(w * 0.7, -S * 0.28);
    g.lineTo(w * 0.85, S * 0.34); g.lineTo(-w * 0.85, S * 0.34); g.closePath(); g.fillPath();
    // mouwen
    g.fillTriangle(-w * 0.7, -S * 0.26, -w * 1.25, S * 0.12, -w * 0.7, S * 0.12);
    g.fillTriangle(w * 0.7, -S * 0.26, w * 1.25, S * 0.12, w * 0.7, S * 0.12);
    // kraag
    g.fillStyle(0x1e40af, 1);
    g.fillTriangle(-w * 0.28, -S * 0.28, 0, S * 0.02, -w * 0.02, -S * 0.28);
    g.fillTriangle(w * 0.28, -S * 0.28, 0, S * 0.02, w * 0.02, -S * 0.28);
    // knopen
    g.fillStyle(0xfcd34d, 1);
    for (let i = 0; i < 3; i++) g.fillCircle(0, -S * 0.02 + i * S * 0.13, S * 0.04);
    g.lineStyle(Math.max(3, S * 0.026), DONKER, 1);
    g.beginPath(); g.moveTo(-w * 0.7, -S * 0.28); g.lineTo(w * 0.7, -S * 0.28);
    g.lineTo(w * 0.85, S * 0.34); g.lineTo(-w * 0.85, S * 0.34); g.closePath(); g.strokePath();
  },
};

// Vrolijk oogje (wit met donkere pupil + glinster).
function oog(g, x, y, r) {
  g.fillStyle(0xffffff, 1); g.fillCircle(x, y, r);
  g.fillStyle(DONKER, 1); g.fillCircle(x + r * 0.15, y, r * 0.55);
  g.fillStyle(0xffffff, 1); g.fillCircle(x - r * 0.15, y - r * 0.2, r * 0.2);
}

// Twee oogjes + glimlach op afstand `sp` rond (cx, cy).
function gezicht(g, S, cy, sp) {
  oog(g, -sp * 0.35, cy - sp * 0.1, sp * 0.18);
  oog(g, sp * 0.35, cy - sp * 0.1, sp * 0.18);
  g.lineStyle(Math.max(2.5, S * 0.02), DONKER, 1);
  g.beginPath(); g.arc(0, cy + sp * 0.05, sp * 0.32, 0.1 * Math.PI, 0.9 * Math.PI, false); g.strokePath();
}

export const ICOON_IDS = Object.keys(TEKENAARS);

// Teken een woord-icoon als losse container gecentreerd op (x, y).
export function tekenIcoon(scene, id, x, y, size) {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  const fn = TEKENAARS[id];
  if (fn) fn(g, size);
  c.add(g);
  return c;
}
