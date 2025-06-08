import * as PIXI from 'pixi.js';
import { TowerManager } from '../managers/tower-manager';
import { EnemyManager } from '../managers/enemy-manager';
import { WaveManager } from '../managers/wave-manager';
import { Map } from '../entities/map';

export class Gameplay {
  constructor(game) {
    this.game = game;
    this.container = new PIXI.Container();
    this.uiContainer = new PIXI.Container();
    this.gameContainer = new PIXI.Container();
    this.mapData = null;
    this.money = 0;
    this.lives = 0;
    this.wave = 0;
    this.gameOver = false;
    this.paused = false;
  }
  
  init() {
    // Clear containers
    this.container.removeChildren();
    this.uiContainer.removeChildren();
    this.gameContainer.removeChildren();
    
    // Add containers to main container
    this.container.addChild(this.gameContainer);
    this.container.addChild(this.uiContainer);
    
    // Load map data
    this.loadMapData();
    
    // Initialize game state
    this.money = this.mapData.startingMoney;
    this.lives = this.mapData.lives;
    this.wave = 0;
    this.gameOver = false;
    this.paused = false;
    
    // Create map
    this.map = new Map(this.mapData);
    this.gameContainer.addChild(this.map.container);
    
    // Initialize managers
    this.towerManager = new TowerManager(this);
    this.enemyManager = new EnemyManager(this);
    this.waveManager = new WaveManager(this);
    
    // Create UI
    this.createUI();
    
    // Start the game
    this.startWavePreparation();
  }
  
  loadMapData() {
    // In a real implementation, this would load from the selected map in config
    // For now, we'll use the first map from our maps.json
    const mapsConfig = require('../../config/maps.json');
    this.mapData = mapsConfig.maps.find(map => map.id === this.game.selectedMap) || mapsConfig.maps[0];
  }
  
  createUI() {
    // Game info panel (money, lives, wave)
    const infoPanel = new PIXI.Container();
    infoPanel.position.set(10, 10);
    
    // Background
    const infoBg = new PIXI.Graphics();
    infoBg.beginFill(0x000000, 0.7);
    infoBg.drawRoundedRect(0, 0, 200, 80, 10);
    infoBg.endFill();
    infoPanel.addChild(infoBg);
    
    // Money text
    this.moneyText = new PIXI.Text(`Money: ${this.money}`, {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xffffff
    });
    this.moneyText.position.set(10, 10);
    infoPanel.addChild(this.moneyText);
    
    // Lives text
    this.livesText = new PIXI.Text(`Lives: ${this.lives}`, {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xffffff
    });
    this.livesText.position.set(10, 30);
    infoPanel.addChild(this.livesText);
    
    // Wave text
    this.waveText = new PIXI.Text(`Wave: ${this.wave}/100`, {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xffffff
    });
    this.waveText.position.set(10, 50);
    infoPanel.addChild(this.waveText);
    
    this.uiContainer.addChild(infoPanel);
    
    // Tower selection panel
    this.createTowerSelectionPanel();
    
    // Wave control panel
    this.createWaveControlPanel();
  }
  
  createTowerSelectionPanel() {
    const panel = new PIXI.Container();
    panel.position.set(this.game.width / 2, this.game.height - 50);
    
    // Background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.7);
    bg.drawRoundedRect(-250, -40, 500, 80, 10);
    bg.endFill();
    panel.addChild(bg);
    
    // Tower buttons
    const towersConfig = require('../../config/towers.json');
    const towers = towersConfig.towers.slice(0, 5); // Show only first 5 towers
    
    const buttonWidth = 60;
    const spacing = 20;
    const totalWidth = towers.length * buttonWidth + (towers.length - 1) * spacing;
    let xPos = -totalWidth / 2;
    
    towers.forEach(tower => {
      const button = this.createTowerButton(tower);
      button.position.set(xPos + buttonWidth / 2, 0);
      panel.addChild(button);
      xPos += buttonWidth + spacing;
    });
    
    this.uiContainer.addChild(panel);
  }
  
  createTowerButton(tower) {
    const button = new PIXI.Container();
    button.interactive = true;
    button.cursor = 'pointer';
    
    // Button background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x333333);
    bg.lineStyle(2, 0x4CAF50);
    bg.drawRoundedRect(-30, -30, 60, 60, 5);
    bg.endFill();
    button.addChild(bg);
    
    // Tower icon (placeholder)
    const icon = new PIXI.Graphics();
    icon.beginFill(0x4CAF50);
    icon.drawCircle(0, 0, 15);
    icon.endFill();
    button.addChild(icon);
    
    // Tower cost
    const costText = new PIXI.Text(`$${tower.baseCost}`, {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0xffffff
    });
    costText.anchor.set(0.5);
    costText.position.set(0, 20);
    button.addChild(costText);
    
    // Button events
    button.on('pointerdown', () => {
      this.towerManager.selectTowerType(tower.id);
    });
    
    button.on('pointerover', () => {
      bg.tint = 0x666666;
    });
    
    button.on('pointerout', () => {
      bg.tint = 0xffffff;
    });
    
    return button;
  }
  
  createWaveControlPanel() {
    const panel = new PIXI.Container();
    panel.position.set(this.game.width - 100, 50);
    
    // Wave timer
    this.waveTimerText = new PIXI.Text('Next wave: 60s', {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xffffff
    });
    this.waveTimerText.anchor.set(0.5);
    panel.addChild(this.waveTimerText);
    
    // Start wave button
    this.startWaveButton = this.createButton(150, 40, 'Start Wave', () => {
      this.waveManager.startWave();
    });
    this.startWaveButton.position.set(0, 30);
    panel.addChild(this.startWaveButton);
    
    this.uiContainer.addChild(panel);
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
      fontSize: 16,
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
  
  startWavePreparation() {
    this.waveManager.startPreparation();
  }
  
  updateUI() {
    this.moneyText.text = `Money: ${this.money}`;
    this.livesText.text = `Lives: ${this.lives}`;
    this.waveText.text = `Wave: ${this.wave}/100`;
    
    if (this.waveManager.preparationTimeLeft > 0) {
      this.waveTimerText.text = `Next wave: ${Math.ceil(this.waveManager.preparationTimeLeft)}s`;
      this.startWaveButton.visible = true;
    } else {
      this.waveTimerText.text = 'Wave in progress';
      this.startWaveButton.visible = false;
    }
  }
  
  addMoney(amount) {
    this.money += amount;
    this.updateUI();
  }
  
  spendMoney(amount) {
    if (this.money >= amount) {
      this.money -= amount;
      this.updateUI();
      return true;
    }
    return false;
  }
  
  loseLife(amount = 1) {
    this.lives -= amount;
    this.updateUI();
    
    if (this.lives <= 0) {
      this.gameOver = true;
      this.endGame();
    }
  }
  
  endGame() {
    // Show game over screen
    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.7);
    overlay.drawRect(0, 0, this.game.width, this.game.height);
    overlay.endFill();
    this.uiContainer.addChild(overlay);
    
    const gameOverText = new PIXI.Text('Game Over', {
      fontFamily: 'Arial',
      fontSize: 48,
      fill: 0xff0000,
      align: 'center'
    });
    gameOverText.anchor.set(0.5);
    gameOverText.position.set(this.game.width / 2, this.game.height / 2 - 50);
    this.uiContainer.addChild(gameOverText);
    
    const waveReachedText = new PIXI.Text(`You reached wave ${this.wave}`, {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xffffff,
      align: 'center'
    });
    waveReachedText.anchor.set(0.5);
    waveReachedText.position.set(this.game.width / 2, this.game.height / 2);
    this.uiContainer.addChild(waveReachedText);
    
    const mainMenuButton = this.createButton(200, 50, 'Main Menu', () => {
      this.game.switchScene('mainMenu');
    });
    mainMenuButton.position.set(this.game.width / 2, this.game.height / 2 + 80);
    this.uiContainer.addChild(mainMenuButton);
    
    // Check if this is a high score
    if (this.game.scoreManager.isHighScore(this.wave)) {
      // Show high score input
      this.showHighScoreInput();
    }
  }
  
  showHighScoreInput() {
    // In a real implementation, this would show an input field for the player's name
    // For now, we'll just add a generic high score
    const playerName = 'Player';
    this.game.scoreManager.addScore(playerName, this.mapData.name, this.wave);
  }
  
  update(delta) {
    if (this.gameOver || this.paused) return;
    
    // Update managers
    this.towerManager.update(delta);
    this.enemyManager.update(delta);
    this.waveManager.update(delta);
    
    // Update UI
    this.updateUI();
  }
}
