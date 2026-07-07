// ===== ALLE WERELDEN OP ÉÉN PLEK =====
// Eén bron voor de level-lijst en de wereld-metadata (naam + kaartkleuren).
// AdventureScene, WorldMapScene, VillageScene en de tests importeren hier —
// een nieuwe wereld toevoegen = één regel in WORLDS.

import { WORLD1 } from './world1.js';
import { WORLD2 } from './world2.js';
import { WORLD3 } from './world3.js';
import { WORLD4 } from './world4.js';
import { WORLD5 } from './world5.js';
import { WORLD6 } from './world6.js';
import { WORLD7 } from './world7.js';
import { WORLD8 } from './world8.js';
import { WORLD9 } from './world9.js';
import { WORLD10 } from './world10.js';
import { WORLD11 } from './world11.js';
import { WORLD12 } from './world12.js';
import { WORLD0 } from './world0.js';

// `sterren` = hoeveel verdiende sterren de wereld opent (à la Mario World).
// Bewust mild afgesteld: wie alleen levels úitspeelt (1 ster/level) komt er
// altijd — de drempels geven sterren betekenis zonder ooit te blokkeren.
// De geheime wereld opent níet met sterren maar met Gouden Nullen (geheim).
export const WORLDS = [
  { levels: WORLD1, naam: 'Wereld 1 · De Vallei', top: 0x8fd3ff, bottom: 0x8ed36b, sterren: 0 },
  { levels: WORLD2, naam: 'Wereld 2 · De Kust', top: 0x8fd3ff, bottom: 0xf3e2b0, sterren: 4 },
  { levels: WORLD3, naam: 'Wereld 3 · Het Bos', top: 0x8fd3ff, bottom: 0x6faf5f, sterren: 9 },
  { levels: WORLD4, naam: 'Wereld 4 · De Kristal-Bergen', top: 0xa9c4e8, bottom: 0x9aa0a6, sterren: 15 },
  { levels: WORLD5, naam: 'Wereld 5 · De Ruimte', top: 0x1c1840, bottom: 0x4a3a78, sterren: 21 },
  { levels: WORLD6, naam: 'Wereld 6 · Het Grauwe Fort', top: 0x3a3540, bottom: 0x6c7178, sterren: 27 },
  { levels: WORLD7, naam: 'Wereld 7 · De Pizza-Vulkaan 🍕', top: 0x8fd3ff, bottom: 0xf0b24a, sterren: 33 },
  { levels: WORLD8, naam: 'Wereld 8 · Het Pannenkoeken-Paradijs 🥞', top: 0x8fd3ff, bottom: 0xf3d9a4, sterren: 39 },
  { levels: WORLD9, naam: 'Wereld 9 · Wc-Wonderland 💩', top: 0x8fd3ff, bottom: 0xcfe8b8, sterren: 45 },
  { levels: WORLD10, naam: 'Wereld 10 · Reuzenland 🦣', top: 0x8fd3ff, bottom: 0x86cf63, sterren: 51 },
  { levels: WORLD11, naam: 'Wereld 11 · Billenland 🍑', top: 0x8fd3ff, bottom: 0xf5c8c0, sterren: 57 },
  { levels: WORLD12, naam: 'Wereld 12 · De Bubbel-Zee 🌊', top: 0x5fb8dd, bottom: 0x1f6f96, sterren: 63 },
  { levels: WORLD0, naam: 'Geheime Nul-Wereld ⭕', top: 0xeaf6ff, bottom: 0xdfefff, geheim: true, nullen: 5, sterren: 0 },
];

// Platte lijst: de level-ketting loopt hier op volgorde doorheen.
export const LEVELS = WORLDS.flatMap((w) => w.levels);
