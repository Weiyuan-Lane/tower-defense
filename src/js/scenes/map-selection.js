import * as PIXI from 'pixi.js';

export class MapSelection {
  constructor(game) {
    this.game = game;
    this.container = new PIXI.Container();
    this.maps = [];
    this.selectedMapIndex = 0;
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
    const title = new PIXI.Text('Select Map', {
      fontFamily: 'Arial',
      fontSize: 36,
      fill: 0xffffff,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.position.set(this.game.width / 2, 50);
    this.container.addChild(title);

    // Load maps from config
    this.loadMaps();

    // Create map selection UI
    this.createMapSelectionUI();

    // Create back button
    this.createBackButton();
  }

  loadMaps() {
    const mapsConfig = require('../../config/maps.json');
    this.maps = mapsConfig.maps;
  }

  createMapSelectionUI() {
    const mapContainer = new PIXI.Container();
    mapContainer.position.set(this.game.width / 2, this.game.height / 2 - 50);

    // Create map preview
    const previewSize = 300;
    const titleTexture = PIXI.Texture.from(`assets/images/${this.maps[this.selectedMapIndex].titleImage}`);
    const previewSprite = new PIXI.Sprite(titleTexture);
    previewSprite.anchor.set(0.5);
    previewSprite.width = previewSize;
    previewSprite.height = previewSize;
    mapContainer.addChild(previewSprite);

    // Map name and difficulty
    const mapInfo = new PIXI.Container();
    mapInfo.position.set(0, previewSize / 2 + 20);

    const mapName = new PIXI.Text(this.maps[this.selectedMapIndex].name, {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xffffff,
      align: 'center'
    });
    mapName.anchor.set(0.5, 0);
    mapInfo.addChild(mapName);

    const mapDifficulty = new PIXI.Text(`Difficulty: ${this.maps[this.selectedMapIndex].difficulty}`, {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0xcccccc,
      align: 'center'
    });
    mapDifficulty.anchor.set(0.5, 0);
    mapDifficulty.position.set(0, 30);
    mapInfo.addChild(mapDifficulty);

    mapContainer.addChild(mapInfo);

    // Navigation arrows
    const arrowLeft = this.createArrowButton(-previewSize / 2 - 40, 0, '←', () => this.changeMap(-1));
    const arrowRight = this.createArrowButton(previewSize / 2 + 40, 0, '→', () => this.changeMap(1));

    mapContainer.addChild(arrowLeft);
    mapContainer.addChild(arrowRight);

    // Start game button
    const startButton = this.createButton(200, 50, 'Start Game', () => {
      this.game.selectedMap = this.maps[this.selectedMapIndex].id;
      this.game.switchScene('gameplay');
    });
    startButton.position.set(0, previewSize / 2 + 110);
    mapContainer.addChild(startButton);

    this.container.addChild(mapContainer);

    // Store references for updating
    this.mapName = mapName;
    this.mapDifficulty = mapDifficulty;
    this.mapPreviewSprite = previewSprite;
  }

  createArrowButton(x, y, symbol, onClick) {
    const button = new PIXI.Container();
    button.position.set(x, y);
    button.interactive = true;
    button.cursor = 'pointer';

    const background = new PIXI.Graphics();
    background.beginFill(0x4CAF50);
    background.drawCircle(0, 0, 25);
    background.endFill();
    button.addChild(background);

    const text = new PIXI.Text(symbol, {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xffffff
    });
    text.anchor.set(0.5);
    button.addChild(text);

    button.on('pointerdown', onClick);
    button.on('pointerover', () => {
      background.tint = 0x45a049;
    });
    button.on('pointerout', () => {
      background.tint = 0xffffff;
    });

    return button;
  }

  createButton(width, height, text, onClick) {
    const button = new PIXI.Container();
    button.interactive = true;
    button.cursor = 'pointer';

    const background = new PIXI.Graphics();
    background.beginFill(0x4CAF50);
    background.drawRoundedRect(-width / 2, -height / 2, width, height, 10);
    background.endFill();
    button.addChild(background);

    const buttonText = new PIXI.Text(text, {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0xffffff
    });
    buttonText.anchor.set(0.5);
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

  createBackButton() {
    const button = this.createButton(100, 40, 'Back', () => {
      this.game.switchScene('mainMenu');
    });
    button.position.set(60, 30);
    this.container.addChild(button);
  }

  changeMap(direction) {
    this.selectedMapIndex = (this.selectedMapIndex + direction + this.maps.length) % this.maps.length;
    this.updateMapInfo();
  }

  updateMapInfo() {
    const selectedMap = this.maps[this.selectedMapIndex];
    this.mapName.text = selectedMap.name;
    this.mapDifficulty.text = `Difficulty: ${selectedMap.difficulty}`;

    const texture = PIXI.Texture.from(`assets/images/${selectedMap.titleImage}`);
    this.mapPreviewSprite.texture = texture;
  }

  update(delta) {
    // Update logic for map selection screen
  }
}
