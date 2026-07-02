// ===== KLEURENPALET (Numberblocks-signatuurkleuren) + kleurhulpjes =====
// Eén bron voor alle scenes (AdventureScene, WorldMapScene, art-modules).

export const SIG = [0xe8402c, 0xf08a24, 0xf6c624, 0x57b947, 0x38b6cf, 0x9b6dd6,
  0xec6aa9, 0x14b8a6, 0x4f63c9, 0xf25c54, 0x37c2a0, 0x6366f1];

// Signatuurkleur van getal n (1-gebaseerd, wrapt rond).
export function sig(n) { return SIG[(Math.max(1, n) - 1) % SIG.length]; }

export function lighten(c, amt) {
  const r = Math.min(255, ((c >> 16) & 255) + amt), g = Math.min(255, ((c >> 8) & 255) + amt), b = Math.min(255, (c & 255) + amt);
  return (r << 16) | (g << 8) | b;
}

export function darker(c, amt) {
  const r = Math.max(0, ((c >> 16) & 255) - amt), g = Math.max(0, ((c >> 8) & 255) - amt), b = Math.max(0, (c & 255) - amt);
  return (r << 16) | (g << 8) | b;
}
