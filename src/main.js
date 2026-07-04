import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import BalloonScene from './scenes/BalloonScene.js';
import MathScene from './scenes/MathScene.js';
import TraceScene from './scenes/TraceScene.js';
import TraceMenuScene from './scenes/TraceMenuScene.js';
import ClickerScene from './scenes/ClickerScene.js';
import PianoScene from './scenes/PianoScene.js';
import AwardsScene from './scenes/AwardsScene.js';
import SettingsScene from './scenes/SettingsScene.js';
import CityScene from './scenes/CityScene.js';
import NumberTowerScene from './scenes/NumberTowerScene.js';
import ZeroRocketScene from './scenes/ZeroRocketScene.js';
import AdventureScene from './scenes/AdventureScene.js';
import IntroScene from './scenes/IntroScene.js';
import FeestScene from './scenes/FeestScene.js';
import WorldMapScene from './scenes/WorldMapScene.js';
import VillageScene from './scenes/VillageScene.js';
import StatsScene from './scenes/StatsScene.js';
import StickerScene from './scenes/StickerScene.js';
import { installTracking } from './stats.js';

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
    BootScene, MenuScene,
    BalloonScene, MathScene,
    TraceScene, TraceMenuScene, ClickerScene, PianoScene,
    AwardsScene, SettingsScene, CityScene, NumberTowerScene, ZeroRocketScene,
    AdventureScene, IntroScene, FeestScene, WorldMapScene, VillageScene, StatsScene,
    StickerScene,
  ],
};

const game = new Phaser.Game(config);
installTracking(game);

// Alleen tijdens ontwikkelen: game-instance beschikbaar maken voor debuggen/
// preview (bv. window.__game.scene.start('Adventure')). Weggelaten in de
// productie-build.
if (import.meta.env && import.meta.env.DEV) window.__game = game;

// Offline spelen (vliegtuig/auto): service worker cachet alles wat geladen is.
// Alleen in productie — tijdens ontwikkelen zou de cache HMR in de weg zitten.
if (!import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
