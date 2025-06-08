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
    this.projectiles = [];
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
    bg.drawRoundedRect(-210, -40, 420, 80, 10);
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

    // Add cancel button to unselect tower
    const cancelButton = this.createCancelButton();
    cancelButton.position.set(totalWidth / 2 + spacing * 2 + buttonWidth / 2, 0);
    panel.addChild(cancelButton);

    this.uiContainer.addChild(panel);
    this.cancelButton = cancelButton; // Store reference for showing/hiding
  }

  createCancelButton() {
    const button = new PIXI.Container();
    button.interactive = true;
    button.cursor = 'pointer';
    button.visible = false; // Initially hidden

    // Button background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x333333);
    bg.lineStyle(2, 0xFF5555);
    bg.drawRoundedRect(-30, -30, 60, 60, 5);
    bg.endFill();
    button.addChild(bg);

    // X icon
    const icon = new PIXI.Graphics();
    icon.lineStyle(4, 0xFF5555);
    icon.moveTo(-15, -15);
    icon.lineTo(15, 15);
    icon.moveTo(15, -15);
    icon.lineTo(-15, 15);
    button.addChild(icon);

    // Label
    const labelText = new PIXI.Text('Cancel', {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0xffffff
    });
    labelText.anchor.set(0.5);
    labelText.position.set(0, 20);
    button.addChild(labelText);

    // Button events
    button.on('pointerdown', () => {
      this.towerManager.selectTowerType(null);
      this.game.showToast("Tower selection canceled", {
        duration: 1500,
        background: 0x555555,
        position: 'top'
      });
      this.hideCancelButton();
    });

    button.on('pointerover', () => {
      bg.tint = 0x666666;
    });

    button.on('pointerout', () => {
      bg.tint = 0xffffff;
    });

    return button;
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
    icon.drawCircle(0, 0, 10);
    icon.endFill();
    button.addChild(icon);

    // Tower cost
    const costText = new PIXI.Text(`$${tower.baseCost}`, {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0xedc001
    });
    costText.anchor.set(0.5);
    costText.position.set(0, 20);
    button.addChild(costText);

    // Add tower title above the button
    const titleText = new PIXI.Text(tower.name, {
      fontFamily: 'Arial',
      fontSize: 8,
      fill: 0xffffff,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 80
    });
    titleText.anchor.set(0.5, 1);
    titleText.position.set(0, -15);
    button.addChild(titleText);

    // Button events
    button.on('pointerdown', () => {
      this.towerManager.selectTowerType(tower.id);
      this.showCancelButton();
    });

    button.on('pointerover', () => {
      bg.tint = 0x666666;
    });

    button.on('pointerout', () => {
      bg.tint = 0xffffff;
    });

    return button;
  }

  showCancelButton() {
    this.cancelButton.visible = true;
  }

  hideCancelButton() {
    this.cancelButton.visible = false;
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

    const waveReachedText = new PIXI.Text(`You reached Wave ${this.wave}`, {
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

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.update(delta);

      // Remove inactive projectiles
      if (!projectile.active) {
        this.gameContainer.removeChild(projectile.sprite);
        this.projectiles.splice(i, 1);
      }
    }

    // Update UI
    this.updateUI();
  }

  createTowerUpgradeMenu(tower, x, y) {
    // Remove any existing upgrade menu
    this.closeTowerUpgradeMenu();

    // Create a new container for the upgrade menu
    this.upgradeMenu = new PIXI.Container();
    this.upgradeMenu.position.set(x, y - 80); // Position above the tower
    this.upgradeMenu.zIndex = 100; // Ensure it appears above other elements

    // Background panel
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.8);
    bg.drawRoundedRect(-75, -60, 150, 120, 10);
    bg.endFill();
    this.upgradeMenu.addChild(bg);

    // Tower info
    const nameText = new PIXI.Text(tower.name, {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xffffff
    });
    nameText.anchor.set(0.5, 0);
    nameText.position.set(0, -50);
    this.upgradeMenu.addChild(nameText);

    const levelText = new PIXI.Text(`Level: ${tower.level}`, {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0xffffff
    });
    levelText.anchor.set(0.5, 0);
    levelText.position.set(0, -30);
    this.upgradeMenu.addChild(levelText);

    // Calculate upgrade cost
    const towerConfig = this.towerManager.towersConfig.find(t => t.id === tower.type);
    const upgradeFormulas = require('../../config/game-settings.json').towerSettings.upgradeFormulas;
    const upgradeCost = Math.floor(eval(upgradeFormulas.cost.formula
      .replace('baseCost', towerConfig.baseCost)
      .replace('level', tower.level)));

    // Upgrade button
    const upgradeButton = this.createButton(120, 30, `Upgrade ($${upgradeCost})`, () => {
      if (this.towerManager.upgradeTower(tower)) {
        this.game.showToast(`Tower upgraded to level ${tower.level}!`, {
          duration: 2000,
          background: 0x4CAF50,
          position: 'top'
        });

        const upgradeCost = Math.floor(eval(upgradeFormulas.cost.formula
          .replace('baseCost', towerConfig.baseCost)
          .replace('level', tower.level)));
        levelText.text = `Level: ${tower.level}`;
        upgradeButton.text = `Upgrade ($${upgradeCost})`;

      } else {
        this.game.showToast("Not enough money for upgrade", {
          duration: 2000,
          background: 0xFF5555,
          position: 'top'
        });
      }
    });
    upgradeButton.position.set(0, 0);
    this.upgradeMenu.addChild(upgradeButton);

    // Demolish button
    const demolishButton = this.createButton(120, 30, "Demolish", () => {
      // Calculate refund amount (50% of total investment)
      let refundAmount = Math.floor(towerConfig.baseCost * 0.5);
      for (let i = 1; i < tower.level; i++) {
        const levelCost = Math.floor(eval(upgradeFormulas.cost.formula
          .replace('baseCost', towerConfig.baseCost)
          .replace('level', i)));
        refundAmount += Math.floor(levelCost * 0.5);
      }

      // Remove tower
      this.towerManager.removeTower(tower);

      // Add refund
      this.addMoney(refundAmount);

      this.game.showToast(`Tower demolished! +$${refundAmount}`, {
        duration: 2000,
        background: 0x4CAF50,
        position: 'top'
      });

      this.closeTowerUpgradeMenu();
    });
    demolishButton.position.set(0, 40);
    this.upgradeMenu.addChild(demolishButton);

    // Add to UI container
    this.uiContainer.addChild(this.upgradeMenu);

    // Add click outside listener
    this.clickOutsideHandler = (event) => {
      const point = event.data.global;
      const bounds = this.upgradeMenu.getBounds();

      if (point.x < bounds.x || point.x > bounds.x + bounds.width ||
          point.y < bounds.y || point.y > bounds.y + bounds.height) {
        this.closeTowerUpgradeMenu();
      }
    };

    this.game.app.stage.interactive = true;
    this.game.app.stage.on('pointerdown', this.clickOutsideHandler);
  }

  closeTowerUpgradeMenu() {
    if (this.upgradeMenu) {
      this.uiContainer.removeChild(this.upgradeMenu);
      this.upgradeMenu = null;

      // Remove click outside listener
      if (this.clickOutsideHandler) {
        this.game.app.stage.off('pointerdown', this.clickOutsideHandler);
        this.clickOutsideHandler = null;
      }
    }
  }
}
