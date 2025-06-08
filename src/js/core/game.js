import * as PIXI from 'pixi.js';
import { MainMenu } from '../scenes/main-menu';
import { MapSelection } from '../scenes/map-selection';
import { Options } from '../scenes/options';
import { HighScores } from '../scenes/high-scores';
import { Gameplay } from '../scenes/gameplay';
import { AudioManager } from '../managers/audio-manager';
import { ScoreManager } from '../managers/score-manager';

export class Game {
  constructor() {
    // Game configuration
    this.width = 800;
    this.height = 600;
    this.maxWidth = 800;
    this.maxHeight = 600;
    this.backgroundColor = 0x1a1a1a;

    // Create PIXI Application
    this.app = new PIXI.Application({
      width: this.width,
      height: this.height,
      backgroundColor: this.backgroundColor,
      antialias: true
    });

    // Add the canvas to the DOM
    console.log(this.app.view);
    document.getElementById('game-container').appendChild(this.app.view);

    // Game state
    this.currentScene = null;
    this.scenes = {};

    // Managers
    this.audioManager = new AudioManager();
    this.scoreManager = new ScoreManager();

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

  resize() {
    // Calculate scale to fit the window while maintaining aspect ratio
    const scale = Math.min(
      window.innerWidth / this.width,
      window.innerHeight / this.height
    );

    let newWidth = this.width * scale;
    let newHeight = this.height * scale;
    if (this.maxWidth < newWidth || this.maxHeight < newHeight) {
      newWidth = this.maxWidth;
      newHeight = this.maxHeight;
    }

    // Update the view's CSS style
    this.app.view.style.width = `${newWidth}px`;
    this.app.view.style.height = `${newHeight}px`;
  }
}
