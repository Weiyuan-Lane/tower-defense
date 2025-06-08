import * as PIXI from 'pixi.js';
import { MainMenu } from '../scenes/main-menu';
import { MapSelection } from '../scenes/map-selection';
import { Options } from '../scenes/options';
import { HighScores } from '../scenes/high-scores';
import { Gameplay } from '../scenes/gameplay';
import { AudioManager } from '../managers/audio-manager';
import { ScoreManager } from '../managers/score-manager';
import { Toast } from '../utils/toast';

export class Game {
  constructor() {
    // Game configuration
    this.width = 800;
    this.height = 600;
    this.maxWidth = 800; // Maximum width for the canvas
    this.maxHeight = 600; // Maximum height for the canvas
    this.backgroundColor = 0x1a1a1a;

    // Create PIXI Application with improved settings
    this.app = new PIXI.Application({
      width: this.width,
      height: this.height,
      backgroundColor: this.backgroundColor,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    });
    this.app.stage.sortableChildren = true;

    // Add the canvas to the DOM
    document.getElementById('game-container').appendChild(this.app.view);

    // Game state
    this.currentScene = null;
    this.scenes = {};

    // Managers
    this.audioManager = new AudioManager();
    this.scoreManager = new ScoreManager();
    this.toast = new Toast(this);

    // Initialize scenes
    this.initScenes();

    // Handle window resize
    window.addEventListener('resize', this.resize.bind(this));
    this.resize();
  }

  initScenes() {
    // Create scenes
    this.scenes = {
      mainMenu: new MainMenu(this),
      mapSelection: new MapSelection(this),
      options: new Options(this),
      highScores: new HighScores(this),
      gameplay: new Gameplay(this)
    };
  }

  start() {
    // Load assets and then start the game
    this.loadAssets().then(() => {
      // Start with the main menu
      this.switchScene('mainMenu');

      // Start the game loop
      this.app.ticker.add(this.update.bind(this));
    });
  }

  async loadAssets() {
    // Load all game assets
    return new Promise((resolve) => {
      // Add assets to load here
      // PIXI.Assets.add('mapTiles', 'assets/images/map-tiles.png');
      // PIXI.Assets.add('towerSprites', 'assets/images/towers.png');
      // PIXI.Assets.add('enemySprites', 'assets/images/enemies.png');

      // Load all assets
      // PIXI.Assets.load(['mapTiles', 'towerSprites', 'enemySprites']).then(() => {
      //   resolve();
      // });

      // For now, just resolve immediately
      resolve();
    });
  }

  update(delta) {
    // Update the current scene
    if (this.currentScene) {
      this.currentScene.update(delta);
    }
  }

  switchScene(sceneName) {
    // Remove current scene if exists
    if (this.currentScene) {
      this.app.stage.removeChild(this.currentScene.container);
    }

    // Set and initialize new scene
    this.currentScene = this.scenes[sceneName];
    this.currentScene.init();

    // Add new scene to stage
    this.app.stage.addChild(this.currentScene.container);
  }

  // Helper method to create high-quality text
  createText(text, options = {}) {
    const style = {
      ...this.defaultTextStyle,
      ...options
    };

    const pixiText = new PIXI.Text(text, style);
    pixiText.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
    return pixiText;
  }

  // Helper method to show toast notifications
  showToast(message, options = {}) {
    return this.toast.show(message, options);
  }

  resize() {
    // Calculate scale to fit the window while maintaining aspect ratio
    let scale = Math.min(
      window.innerWidth / this.width,
      window.innerHeight / this.height
    );

    // Calculate new dimensions
    let newWidth = this.width * scale;
    let newHeight = this.height * scale;

    // Apply maximum width/height constraints if needed
    if (newWidth > this.maxWidth) {
      scale = this.maxWidth / this.width;
      newWidth = this.maxWidth;
      newHeight = this.height * scale;
    }

    if (newHeight > this.maxHeight) {
      scale = this.maxHeight / this.height;
      newHeight = this.maxHeight;
      newWidth = this.width * scale;
    }

    // Update the view's CSS style
    this.app.view.style.width = `${newWidth}px`;
    this.app.view.style.height = `${newHeight}px`;
  }
}
