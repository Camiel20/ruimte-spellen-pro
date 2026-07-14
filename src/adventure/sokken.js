// ===== SOKKEN-PATRONEN (Wereld 13, de Kleren-Kast) =====
// Gedeeld door het sokkenparen-systeem (vind de tweelingsok) én de
// Sokken-Dief-baas (stijl 'paar': kies de sok die hetzelfde is).
// Puur tekenwerk op een meegegeven graphics — geen Phaser-import, zodat
// de validator (logic.js) de patroon-namen ook kan importeren.

export const SOK_PATRONEN = ['strepen', 'stippen', 'zigzag', 'sterren', 'hartjes', 'blokjes'];

// Basis- en accentkleur per patroon: fel en goed te onderscheiden.
export const SOK_KLEUREN = {
  strepen: [0xe8402c, 0xffe16b], // rood met gele strepen
  stippen: [0x3f8fe8, 0xffffff], // blauw met witte stippen
  zigzag: [0x57b947, 0xfff3b0],  // groen met lichte zigzag
  sterren: [0x9b6dd6, 0xffe16b], // paars met gele sterretjes
  hartjes: [0xf2a7b8, 0xe8402c], // roze met rode hartjes
  blokjes: [0xf6a723, 0x16202b], // oranje met donkere blokjes
};

// Teken een vrolijke sok rond (0, 0): been omhoog, voet naar rechts.
// s = schaal (1 ≈ 46px hoog). Het patroon maakt de tweeling herkenbaar.
export function drawSok(g, patroon, s = 1) {
  const [basis, accent] = SOK_KLEUREN[patroon] || SOK_KLEUREN.strepen;
  // schaduwtje
  g.fillStyle(0x000000, 0.12); g.fillEllipse(3 * s, 24 * s, 34 * s, 7 * s);
  // been (verticaal) + voet (bocht naar rechts)
  g.fillStyle(basis, 1);
  g.fillRoundedRect(-10 * s, -22 * s, 20 * s, 32 * s, 6 * s);
  g.fillRoundedRect(-10 * s, 2 * s, 30 * s, 18 * s, 9 * s);
  g.fillCircle(17 * s, 11 * s, 9 * s); // teen
  // boord bovenaan
  g.fillStyle(0xffffff, 1); g.fillRoundedRect(-11 * s, -24 * s, 22 * s, 8 * s, 4 * s);
  // hiel
  g.fillStyle(accent, 0.85); g.fillCircle(-4 * s, 15 * s, 6 * s);
  // het patroon zelf
  if (patroon === 'stippen') {
    g.fillStyle(accent, 0.95);
    [[-4, -12], [4, -5], [-3, 2], [8, 9], [1, 12]].forEach(([px, py]) => g.fillCircle(px * s, py * s, 2.6 * s));
  } else if (patroon === 'zigzag') {
    g.lineStyle(2.6 * s, accent, 0.95);
    for (const zy of [-12, -4]) {
      g.beginPath(); g.moveTo(-9 * s, zy * s);
      g.lineTo(-4 * s, (zy + 4) * s); g.lineTo(1 * s, zy * s); g.lineTo(6 * s, (zy + 4) * s); g.lineTo(9 * s, (zy + 1) * s);
      g.strokePath();
    }
  } else if (patroon === 'sterren') {
    g.fillStyle(accent, 1);
    [[-3, -11], [5, -3], [-2, 6]].forEach(([px, py]) => {
      for (let a = 0; a < 5; a++) {
        const ang = -Math.PI / 2 + a * (2 * Math.PI / 5);
        g.fillCircle((px + Math.cos(ang) * 2.6) * s, (py + Math.sin(ang) * 2.6) * s, 1.6 * s);
      }
      g.fillCircle(px * s, py * s, 1.8 * s);
    });
  } else if (patroon === 'hartjes') {
    g.fillStyle(accent, 0.95);
    [[-3, -10], [4, 0], [10, 10]].forEach(([px, py]) => {
      g.fillCircle((px - 1.7) * s, py * s, 2.2 * s); g.fillCircle((px + 1.7) * s, py * s, 2.2 * s);
      g.fillTriangle((px - 3.6) * s, (py + 1) * s, (px + 3.6) * s, (py + 1) * s, px * s, (py + 5) * s);
    });
  } else if (patroon === 'blokjes') {
    g.fillStyle(accent, 0.8);
    [[-7, -13], [1, -6], [-6, 1], [6, 6], [12, 12]].forEach(([px, py]) => g.fillRect(px * s, py * s, 5 * s, 5 * s));
  } else {
    // strepen (standaard)
    g.fillStyle(accent, 0.95);
    for (const sy of [-14, -6, 2]) g.fillRect(-10 * s, sy * s, 20 * s, 4 * s);
    g.fillRect(-2 * s, 10 * s, 20 * s, 4 * s);
  }
  // omlijning van het been
  g.lineStyle(2.4 * s, 0x16202b, 0.35);
  g.strokeRoundedRect(-10 * s, -22 * s, 20 * s, 32 * s, 6 * s);
}
