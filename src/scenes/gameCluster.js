// ===== GETALLEN-LAND + LETTER-LAND CLUSTER (lazy) =====
// Deze scenes horen bij elkaar: ze wisselen onderling van scherm (level ↔
// wereldkaart ↔ dorp ↔ feest) én Letter-Land HERGEBRUIKT de Adventure-engine
// (LetterMapScene start 'Adventure' met een eigen levelset). Daarom laden we ze
// als één blok LAZY (vanuit MenuScene.launchCluster) — zo zit dit hele cluster
// + z'n zware deps (levels, 47 systems, enemyArt, terrein, bossStijlen, glyphs)
// NIET in de start-bundel, maar wordt het pas geladen bij de eerste keer spelen.

import AdventureScene from './AdventureScene.js';
import WorldMapScene from './WorldMapScene.js';
import VillageScene from './VillageScene.js';
import FeestScene from './FeestScene.js';
import ReisScene from './ReisScene.js';
import IntroScene from './IntroScene.js';
import LetterIntroScene from './LetterIntroScene.js';
import LetterMapScene from './LetterMapScene.js';
import LetterFeestScene from './LetterFeestScene.js';
import LetterMissieScene from './LetterMissieScene.js';

// [scene-key, klasse] — MenuScene registreert deze in één keer.
export const GAME_CLUSTER = [
  ['Adventure', AdventureScene],
  ['WorldMap', WorldMapScene],
  ['Village', VillageScene],
  ['Feest', FeestScene],
  ['Reis', ReisScene],
  ['Intro', IntroScene],
  ['LetterIntro', LetterIntroScene],
  ['LetterMap', LetterMapScene],
  ['LetterFeest', LetterFeestScene],
  ['LetterMissie', LetterMissieScene],
];
