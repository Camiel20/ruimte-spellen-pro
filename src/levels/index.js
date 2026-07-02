// ===== ALLE WERELDEN OP ÉÉN PLEK =====
// Eén bron voor de level-lijst en de wereld-metadata (naam + kaartkleuren).
// AdventureScene, WorldMapScene, VillageScene en de tests importeren hier —
// een nieuwe wereld toevoegen = één regel in WORLDS.

import { WORLD1 } from './world1.js';
import { WORLD2 } from './world2.js';
import { WORLD3 } from './world3.js';
import { WORLD4 } from './world4.js';
import { WORLD5 } from './world5.js';

export const WORLDS = [
  { levels: WORLD1, naam: 'Wereld 1 · De Vallei', top: 0x8fd3ff, bottom: 0x8ed36b },
  { levels: WORLD2, naam: 'Wereld 2 · De Kust', top: 0x8fd3ff, bottom: 0xf3e2b0 },
  { levels: WORLD3, naam: 'Wereld 3 · Het Bos', top: 0x8fd3ff, bottom: 0x6faf5f },
  { levels: WORLD4, naam: 'Wereld 4 · De Kristal-Bergen', top: 0xa9c4e8, bottom: 0x9aa0a6 },
  { levels: WORLD5, naam: 'Wereld 5 · De Ruimte', top: 0x1c1840, bottom: 0x4a3a78 },
];

// Platte lijst: de level-ketting loopt hier op volgorde doorheen.
export const LEVELS = WORLDS.flatMap((w) => w.levels);
