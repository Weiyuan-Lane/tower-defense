import * as PIXI from 'pixi.js';

export class MainMenu {
  constructor(game) {
    this.game = game;
    this.container = new PIXI.Container();
  }

  init() {
    // Clear container
    this.container.removeChildren();

    // Create background
    const background = new PIXI.Graphics();
    background.beginFill(0x000000);
    background.drawRect(0, 0, this.game.width, this.game.height);
    background.endFill();
    this.container.addChild(background);

    // Create title
    const title = new PIXI.Text('Tower Defense Game', {
      fontFamily: 'Arial',
      fontSize: 36,
      fill: 0xffffff,
      align: 'center'
    });
    title.resolution = 2;
    title.anchor.set(0.5);
    title.position.set(this.game.width / 2, 100);
    this.container.addChild(title);

    // Create menu buttons
    this.createMenuButtons();
  }

  createMenuButtons() {
    const buttonData = [
      { text: 'Play Game', action: () => this.game.switchScene('mapSelection') },
      { text: 'Options', action: () => this.game.switchScene('options') },
      { text: 'High Scores', action: () => this.game.switchScene('highScores') }
    ];

    const buttonContainer = new PIXI.Container();
    buttonContainer.position.set(this.game.width / 2, this.game.height / 2);

    let yOffset = 0;
    const buttonHeight = 60;
    const buttonWidth = 200;
    const buttonSpacing = 20;

    buttonData.forEach(data => {
      const button = this.createButton(buttonWidth, buttonHeight, data.text, data.action);
      button.position.set(-buttonWidth / 2, yOffset);
      buttonContainer.addChild(button);
      yOffset += buttonHeight + buttonSpacing;
    });

    this.container.addChild(buttonContainer);
  }

  createButton(width, height, text, onClick) {
    const button = new PIXI.Container();
    button.interactive = true;
    button.cursor = 'pointer';

    // Button background
    const background = new PIXI.Graphics();
    background.beginFill(0x4CAF50);
    background.drawRoundedRect(0, 0, width, height, 10);
    background.endFill();
    button.addChild(background);

    // Button text
    const buttonText = new PIXI.Text(text, {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xffffff
    });
    buttonText.resolution = 2;
    buttonText.anchor.set(0.5);
    buttonText.position.set(width / 2, height / 2);
    button.addChild(buttonText);

    // Button events
    button.on('pointerdown', onClick);
    button.on('pointerover', () => {
      background.tint = 0x45a049;
    });
    button.on('pointerout', () => {
      background.tint = 0xffffff;
    });

    return button;
  }

  update(delta) {
    // Update logic for main menu (animations, etc.)
  }
}
