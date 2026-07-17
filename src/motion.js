// ===== RUSTIGE ANIMATIES (toegankelijkheid) =====
// Sommige kinderen zijn gevoelig voor snelle beweging of flikkering. Deze
// helper vertelt of we de "rustige animaties"-modus aan hebben: óf via de
// instelling (Instellingen → 🎬), óf via het systeem (prefers-reduced-motion).
// Gebruikt op de zwaarste plekken: de spookjes-flits (nooit strobo) en het
// confetti-feest.

import { getSetting } from './progress.js';

let mediaReduced = false;
try {
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaReduced = mq.matches;
    // reageer live als de gebruiker de systeeminstelling wijzigt
    (mq.addEventListener ? mq.addEventListener('change', (e) => { mediaReduced = e.matches; })
      : mq.addListener && mq.addListener((e) => { mediaReduced = e.matches; }));
  }
} catch { /* geen matchMedia (test/oude browser) — negeer */ }

export function reducedMotion() {
  try { if (getSetting('reducedMotion')) return true; } catch { /* geen opslag */ }
  return mediaReduced;
}
