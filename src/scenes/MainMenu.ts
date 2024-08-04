import Phaser from "phaser";
import SceneKeys from "../keys/SceneKeys";
import AssetKeys from "../keys/AssetKeys";

export default class MainMenu extends Phaser.Scene {
    constructor() {
        super(SceneKeys.MainMenu)
    }

    create() {
        const { width, height } = this.scale;
        this.add.bitmapText(
            width * 0.5,
            height * 0.5 - 200,
            AssetKeys.Font,
            "PONG",
            400,
            Phaser.GameObjects.BitmapText.ALIGN_CENTER
        ).setOrigin(0.5);


        const button1 = this.add.bitmapText(
            width * 0.5,
            height * 0.5,
            AssetKeys.Font,
            "1 Player",
            80,
            Phaser.GameObjects.BitmapText.ALIGN_CENTER
        ).setOrigin(0.5, 0)
        .setInteractive({
            useHandCursor: true
        })
        .on(Phaser.Input.Events.POINTER_OVER, () => {
            button1.setTint(0xFFFF00);
        })
        .on(Phaser.Input.Events.POINTER_OUT, () => {
            button1.setTint(0xFFFFFF);
        })
        .on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.startGame(1);
        });

        const button2 = this.add.bitmapText(
            width * 0.5,
            height * 0.5 + 80,
            AssetKeys.Font,
            "2 Player",
            80,
            Phaser.GameObjects.BitmapText.ALIGN_CENTER
        ).setOrigin(0.5, 0)
        .setInteractive({
            useHandCursor: true
        })
        .on(Phaser.Input.Events.POINTER_OVER, () => {
            button2.setTint(0xFFFF00);
        })
        .on(Phaser.Input.Events.POINTER_OUT, () => {
            button2.setTint(0xFFFFFF);
        })
        .on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.startGame(2);
        });


    }

    private startGame(players: number) {
        this.scene.start(SceneKeys.Gameplay, {players: players});
    }
}