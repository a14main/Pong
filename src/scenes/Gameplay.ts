import Phaser from "phaser";
import SceneKeys from "../keys/SceneKeys";
import AssetKeys from "../keys/AssetKeys";

interface AIControl {
    isDown: boolean
}

interface Cursor {
    up: Phaser.Input.Keyboard.Key | AIControl,
    down: Phaser.Input.Keyboard.Key | AIControl
}

const PADDLE_SPEED = 400;
const PADDLE_HEIGHT = 160;
const PADDLE_WIDTH = 20;
const BALL_SIZE = 25;
const BALL_SPEED = 400;


export default class Gameplay extends Phaser.Scene {
    constructor() {
        super(SceneKeys.Gameplay);
    }

    private leftPaddle!: Phaser.GameObjects.Rectangle;
    private rightPaddle!: Phaser.GameObjects.Rectangle;
    private ball!: Phaser.GameObjects.Rectangle;
    private ballVelocity!: Phaser.Math.Vector2;

    private p1Score: number = 0;
    private p2Score: number = 0;

    private p1ScoreText!: Phaser.GameObjects.BitmapText;
    private p2ScoreText!: Phaser.GameObjects.BitmapText;

    private leftCursors?: Cursor
    private rightCursors?: Cursor
    private players!: number;

    private aiClock!: number;
    private aiDelay!: number;

    create(data: { players: number }) {
        const { width, height } = this.scale;
        this.players = data.players;

        this.leftPaddle = this.add.rectangle(
            100,
            height * 0.5,
            PADDLE_WIDTH,
            PADDLE_HEIGHT,
            0xffffff
        );

        this.rightPaddle = this.add.rectangle(
            width - 100,
            height * 0.5,
            PADDLE_WIDTH,
            PADDLE_HEIGHT,
            0xffffff
        );

        this.ball = this.add.rectangle(
            width * 0.5,
            height * 0.5,
            BALL_SIZE,
            BALL_SIZE,
            0xc0c0c0
        );
        this.ballVelocity = new Phaser.Math.Vector2();
        this.setBallDirection(-1);

        this.leftCursors = this.input.keyboard?.addKeys({ 'up': 'w', 'down': 's' }) as Cursor;
        if (data.players === 2) {
            this.rightCursors = this.input.keyboard?.addKeys({ 'up': 'UP', 'down': 'DOWN' }) as Cursor;
        } else {
            this.rightCursors = {
                up: { isDown: false },
                down: { isDown: false }
            }
        }

        this.aiClock = 0;
        this.aiDelay = 0;

        const graphics = this.add.graphics({
            lineStyle: {
                width: 16,
                color: 0xffffff
            }
        });

        this.p1Score = 0;
        this.p2Score = 0;

        this.p1ScoreText = this.add.bitmapText(width / 2 - 100, 100, AssetKeys.Font, "0", 200, Phaser.GameObjects.BitmapText.ALIGN_RIGHT).setOrigin(1, 0.5);
        this.p2ScoreText = this.add.bitmapText(width / 2 + 100, 100, AssetKeys.Font, "0", 200, Phaser.GameObjects.BitmapText.ALIGN_LEFT).setOrigin(0, 0.5);

        graphics.strokeRect(0,0,width,height);
        graphics.lineBetween(width/2, 0, width/2, height);

        this.cameras.main.setBackgroundColor(0x004000);
        this.cameras.main.postFX.addGradient(0x004000, 0x008000, 0.5);
    }

    update(time: number, deltaTime: number) {
        const { width, height } = this.scale;

        // Get user input:
        let leftDir = 0;
        let rightDir = 0;
        if (this.leftCursors) {
            leftDir = +this.leftCursors.down.isDown - +this.leftCursors.up.isDown;
        }

        // Get AI Control:
        if (this.players === 1) {
            this.aiLogic(deltaTime);
        }

        if (this.rightCursors) {
            rightDir = +this.rightCursors.down.isDown - +this.rightCursors.up.isDown;
        }


        const deltaSeconds = deltaTime / 1000;

        // Move paddles:
        this.leftPaddle.y += leftDir * PADDLE_SPEED * deltaSeconds;
        this.rightPaddle.y += rightDir * PADDLE_SPEED * deltaSeconds;



        // Move ball:
        this.ball.x += this.ballVelocity.x * deltaSeconds;
        this.ball.y += this.ballVelocity.y * deltaSeconds;

        // Check collisions:
        if (this.ball.y - 25 < 0 || this.ball.y + 25 > height) {
            this.ballVelocity.y = -this.ballVelocity.y;
        }

        if (this.ball.x + 25 < 0) {
            // Player 2 scores a point
            this.nextRound(2);
        }

        if (this.ball.x - 25 > width) {
            // Player 1 scores a point
            this.nextRound(1);
        }

        if (Phaser.Geom.Intersects.RectangleToRectangle(
            this.ball.getBounds(),
            this.leftPaddle.getBounds())
        ) {
            this.ball.x = this.leftPaddle.x + (PADDLE_WIDTH / 2) + (BALL_SIZE / 2);
            const dy = (this.ball.y - this.leftPaddle.y) / (PADDLE_HEIGHT / 2);
            this.ballVelocity.rotate(Math.PI + (dy * Math.PI / 6));

        }

        if (Phaser.Geom.Intersects.RectangleToRectangle(
            this.ball.getBounds(),
            this.rightPaddle.getBounds())
        ) {
            this.ball.x = this.rightPaddle.x - (PADDLE_WIDTH / 2) - (BALL_SIZE / 2);
            const dy = (this.ball.y - this.rightPaddle.y) / (PADDLE_HEIGHT / 2);
            this.ballVelocity.rotate(Math.PI + (dy * Math.PI / 6));

        }

    }

    private aiLogic(deltaTime: number) {
        this.aiClock += deltaTime;

        if (this.aiClock > this.aiDelay) {
            this.aiClock = 0;
            this.aiDelay = Phaser.Math.Between(150, 800);
            const dy = this.ball.y - this.rightPaddle.y;
            if (Math.abs(dy) > PADDLE_HEIGHT / 2 && this.ballVelocity.x > 0) {
                if (dy < 0) {
                    this.rightCursors!.up.isDown = true;
                    this.rightCursors!.down.isDown = false;
                } else {
                    this.rightCursors!.up.isDown = false;
                    this.rightCursors!.down.isDown = true;
                }
            } else {
                this.rightCursors!.up.isDown = false;
                this.rightCursors!.down.isDown = false;
            }
        }
    }


    private nextRound(playerPoint: number) {
        if (playerPoint == 1) {
            this.p1Score++;
        } else if (playerPoint == 2) {
            this.p2Score++;
        }
        this.p1ScoreText.setText(this.p1Score.toFixed(0));
        this.p2ScoreText.setText(this.p2Score.toFixed(0));

        

        const { width, height } = this.scale;
        this.ball.setPosition(width * 0.5, height * 0.5)
        if (this.p1Score >= 11 || this.p2Score >= 11) {
            this.gameOver();
            return
        }
        this.setBallDirection(playerPoint == 1 ? -1 : 1)
    }

    private setBallDirection(direction: number) {
        this.ballVelocity.set(BALL_SPEED * direction, 0);
    }

    private gameOver() {
        const {width, height} = this.scale;
        this.ballVelocity.set(0,0);
        const winner = this.p1Score > this.p2Score ? "Player 1" : "Player 2";
        this.add.bitmapText(
            width * 0.5,
            height * 0.5,
            AssetKeys.Font,
            `${winner} Wins!!!`,
            200,
            Phaser.GameObjects.BitmapText.ALIGN_CENTER
        ).setOrigin(0.5);
        this.input.keyboard?.on(Phaser.Input.Keyboard.Events.ANY_KEY_UP, (event: any) => {
            if (event.key === 'r') {
                this.restartGame();
            } else {
                this.scene.start(SceneKeys.MainMenu)
            }
        });
    }

    restartGame() {
        this.p1Score = 0;
        this.p2Score = 0;
        this.scene.restart();
    }
}