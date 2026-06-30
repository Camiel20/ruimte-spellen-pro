import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import BalloonScene from './scenes/BalloonScene.js';
import MathScene from './scenes/MathScene.js';
import DiffScene from './scenes/DiffScene.js';
import TraceScene from './scenes/TraceScene.js';
import TraceMenuScene from './scenes/TraceMenuScene.js';
import ClickerScene from './scenes/ClickerScene.js';
import PianoScene from './scenes/PianoScene.js';
import PlatformScene from './scenes/PlatformScene.js';
import AwardsScene from './scenes/AwardsScene.js';
import SettingsScene from './scenes/SettingsScene.js';
import CityScene from './scenes/CityScene.js';
import NumberTowerScene from './scenes/NumberTowerScene.js';
import ZeroRocketScene from './scenes/ZeroRocketScene.js';
import NumberLandScene from './scenes/NumberLandScene.js';
import StatsScene from './scenes/StatsScene.js';
import { installTracking } from './stats.js';

// Het hele spel wordt hier opgebouwd. Elk spel is een aparte "Scene"
// in de map src/scenes/. Nieuwe spellen voeg je toe door een nieuwe
// scene te maken en die hieronder te registreren.

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0b0d1a',
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
    BalloonScene, MathScene, DiffScene,
    TraceScene, TraceMenuScene, ClickerScene, PianoScene, PlatformScene,
    AwardsScene, SettingsScene, CityScene, NumberTowerScene, ZeroRocketScene,
    NumberLandScene, StatsScene,
  ],
};

installTracking(new Phaser.Game(config));
