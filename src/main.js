import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import TraceScene from './scenes/TraceScene.js';
import TraceMenuScene from './scenes/TraceMenuScene.js';
import AwardsScene from './scenes/AwardsScene.js';
import SettingsScene from './scenes/SettingsScene.js';
import StatsScene from './scenes/StatsScene.js';
import { installTracking } from './stats.js';
import { Voice } from './voice.js';

// Het hele spel wordt hier opgebouwd. Elk spel is een aparte "Scene"
// in de map src/scenes/. Nieuwe spellen voeg je toe door een nieuwe
// scene te maken en die hieronder te registreren.

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#bfe3fb',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 480,
    height: 800,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1100 },
      debug: false,
    },
  },
  scene: [
    // Alleen de KERN-scenes zijn eager. De losse spellen (Reken-Raket, Ballon-
    // Feest, Tikker, Piano, Bezorg, Toren, Nul-Raket, Plakboek, Toverwinkel) én
    // het hele GETALLEN-LAND + LETTER-LAND cluster (Adventure/WorldMap/Feest/…)
    // worden LAZY geladen via MenuScene (launchLazy / launchCluster) — zo blijft
    // de start-bundel klein en start de app sneller.
    BootScene, MenuScene,
    TraceScene, TraceMenuScene,
    AwardsScene, SettingsScene, StatsScene,
  ],

};

const game = new Phaser.Game(config);
installTracking(game);

// Echte stemclips (public/voice/, gegenereerd met tools/maak-stemmen.mjs):
// het manifest vertelt welke er zijn; Voice speelt ze i.p.v. de piepjes.
// Faalt dit (bv. offline vóór de allereerste cache), dan blijven de
// Web Audio-piepjes gewoon werken — geluid valt nooit stil.
fetch('voice/manifest.json')
  .then((r) => (r.ok ? r.json() : null))
  .then((m) => { if (m) Object.entries(m).forEach(([naam, bestand]) => Voice.registerClip(naam, `voice/${bestand}`)); })
  .catch(() => {});

// Alleen tijdens ontwikkelen: game-instance beschikbaar maken voor debuggen/
// preview (bv. window.__game.scene.start('Adventure')). Weggelaten in de
// productie-build.
if (import.meta.env && import.meta.env.DEV) window.__game = game;

// Offline spelen (vliegtuig/auto): service worker cachet alles wat geladen is.
// Alleen in productie — tijdens ontwikkelen zou de cache HMR in de weg zitten.
if (!import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// Vraag de browser om de opslag te beschermen tegen automatisch opruimen.
// (Geen garantie tegen "geschiedenis wissen" — daarvoor is de bewaar-code
// in Instellingen — maar het helpt tegen stille schoonmaak-acties.)
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().catch(() => {});
}
