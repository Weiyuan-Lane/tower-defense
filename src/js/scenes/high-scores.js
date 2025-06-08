import * as PIXI from 'pixi.js';

export class HighScores {
  constructor(game) {
    this.game = game;
    this.container = new PIXI.Container();
    this.scores = [];
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
    const title = new PIXI.Text('High Scores', {
      fontFamily: 'Arial',
      fontSize: 36,
      fill: 0xffffff,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.position.set(this.game.width / 2, 50);
    this.container.addChild(title);

    // Load high scores
    this.loadHighScores();

    // Create high scores UI
    this.createHighScoresUI();

    // Create back button
    this.createBackButton();
  }

  loadHighScores() {
    // Load high scores from local storage
    const savedScores = localStorage.getItem('tdGameHighScores');
    if (savedScores) {
      this.scores = JSON.parse(savedScores);
    } else {
      // Sample scores for demonstration
      this.scores = [
        { name: 'Player1', map: 'Forest Path', wave: 42 },
        { name: 'Player2', map: 'Desert Canyon', wave: 37 },
        { name: 'Player3', map: 'Mountain Pass', wave: 25 },
        { name: 'Player4', map: 'Forest Path', wave: 18 },
        { name: 'Player5', map: 'Desert Canyon', wave: 15 }
      ];
    }

    // Sort scores by wave (highest first)
    this.scores.sort((a, b) => b.wave - a.wave);
  }

  createHighScoresUI() {
    const scoresContainer = new PIXI.Container();
    scoresContainer.position.set(this.game.width / 2, 120);

    // Create headers
    const headers = ['Rank', 'Player', 'Map', 'Wave'];
    const headerWidths = [80, 150, 200, 100];
    let xOffset = -headerWidths.reduce((sum, width) => sum + width, 0) / 2;

    headers.forEach((header, index) => {
      const headerText = new PIXI.Text(header, {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xffffff,
        align: 'center'
      });

      if (index === 0) {
        headerText.anchor.set(0.5, 0);
        headerText.position.set(xOffset + headerWidths[index] / 2, 0);
      } else if (index === headers.length - 1) {
        headerText.anchor.set(0.5, 0);
        headerText.position.set(xOffset + headerWidths[index] / 2, 0);
      } else {
        headerText.anchor.set(0.5, 0);
        headerText.position.set(xOffset + headerWidths[index] / 2, 0);
      }

      scoresContainer.addChild(headerText);
      xOffset += headerWidths[index];
    });

    // Create divider
    const divider = new PIXI.Graphics();
    divider.lineStyle(2, 0xffffff);
    divider.moveTo(-headerWidths.reduce((sum, width) => sum + width, 0) / 2, 40);
    divider.lineTo(headerWidths.reduce((sum, width) => sum + width, 0) / 2, 40);
    scoresContainer.addChild(divider);

    // Create score rows
    const maxScores = 10;
    const rowHeight = 40;

    for (let i = 0; i < Math.min(this.scores.length, maxScores); i++) {
      const score = this.scores[i];
      const yPos = 60 + i * rowHeight;

      // Row background (alternating colors)
      const rowBackground = new PIXI.Graphics();
      rowBackground.beginFill(i % 2 === 0 ? 0x222222 : 0x333333);
      rowBackground.drawRect(
        -headerWidths.reduce((sum, width) => sum + width, 0) / 2,
        yPos - 5,
        headerWidths.reduce((sum, width) => sum + width, 0),
        rowHeight
      );
      rowBackground.endFill();
      scoresContainer.addChild(rowBackground);

      // Row data
      const rowData = [
        `#${i + 1}`,
        score.name,
        score.map,
        score.wave.toString()
      ];

      let xOffset = -headerWidths.reduce((sum, width) => sum + width, 0) / 2;

      rowData.forEach((data, index) => {
        const dataText = new PIXI.Text(data, {
          fontFamily: 'Arial',
          fontSize: 20,
          fill: 0xffffff,
          align: 'center'
        });
        
        if (index === 0) {
          dataText.anchor.set(0.5, 0.5);
          dataText.position.set(xOffset + headerWidths[index] / 2, yPos + rowHeight / 2 - 5);
        } else if (index === rowData.length - 1) {
          dataText.anchor.set(0.5, 0.5);
          dataText.position.set(xOffset + headerWidths[index] / 2, yPos + rowHeight / 2 - 5);
        } else {
          dataText.anchor.set(0.5, 0.5);
          dataText.position.set(xOffset + headerWidths[index] / 2, yPos + rowHeight / 2 - 5);
        }
        
        scoresContainer.addChild(dataText);
        xOffset += headerWidths[index];
      });
    }

    this.container.addChild(scoresContainer);
  }

  createBackButton() {
    const button = this.createButton(100, 40, 'Back', () => {
      this.game.switchScene('mainMenu');
    });
    button.position.set(60, 30);
    this.container.addChild(button);
  }

  createButton(width, height, text, onClick) {
    const button = new PIXI.Container();
    button.interactive = true;
    button.cursor = 'pointer';

    const background = new PIXI.Graphics();
    background.beginFill(0x4CAF50);
    background.drawRoundedRect(0, 0, width, height, 10);
    background.endFill();
    button.addChild(background);

    const buttonText = new PIXI.Text(text, {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0xffffff
    });
    buttonText.anchor.set(0.5);
    buttonText.position.set(width / 2, height / 2);
    button.addChild(buttonText);

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
    // Update logic for high scores screen
  }
}
