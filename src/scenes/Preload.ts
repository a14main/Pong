import Phaser from "phaser";
import SceneKeys from "../keys/SceneKeys";
import AssetKeys from "../keys/AssetKeys";

export default class Preload extends Phaser.Scene {
    constructor() {
        super(SceneKeys.Preload)
    }

    preload() {
        this.load.bitmapFont(AssetKeys.Font, './fonts/battlenet.png', './fonts/battlenet.fnt');
    }

    create() {
        this.scene.start(SceneKeys.MainMenu);
    }
}