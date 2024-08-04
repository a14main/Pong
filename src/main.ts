import Phaser from "phaser";
import Boot from "./scenes/Boot";
import Preload from "./scenes/Preload";
import MainMenu from "./scenes/MainMenu";
import Gameplay from "./scenes/Gameplay";
import GameOver from "./scenes/GameOver";

const game = new Phaser.Game({
  width: 1920,
  height: 1080,
  parent: 'app',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [Boot, Preload, MainMenu, Gameplay, GameOver],
  autoRound: true,
  roundPixels: true,
  pixelArt: true,
  antialias: false
});