import { Tower } from '../entities/tower';
import * as PIXI from 'pixi.js';

export class TowerManager {
  constructor(gameplay) {
    this.gameplay = gameplay;
    this.towers = [];
    this.selectedTowerType = null;
    this.placementGhost = null;
    this.towersConfig = require('../../config/towers.json').towers;

    // Set up event listeners for tower placement
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Add event listeners to the game container for tower placement
    this.gameplay.gameContainer.interactive = true;

    this.gameplay.gameContainer.on('pointermove', (event) => {
      this.handlePointerMove(event);
    });

    this.gameplay.gameContainer.on('pointerdown', (event) => {
      this.handlePointerDown(event);
    });
  }

  selectTowerType(towerTypeId) {
    this.selectedTowerType = towerTypeId;
    this.createPlacementGhost();
  }

  createPlacementGhost() {
    // Remove existing ghost if any
    if (this.placementGhost) {
      this.gameplay.gameContainer.removeChild(this.placementGhost);
    }

    if (!this.selectedTowerType) return;

    // Get tower config
    const towerConfig = this.towersConfig.find(t => t.id === this.selectedTowerType);
    if (!towerConfig) return;

    // Create ghost tower
    this.placementGhost = new PIXI.Container();

    // Tower base
    const base = new PIXI.Graphics();
    base.beginFill(0x4CAF50, 0.5);
    base.drawCircle(0, 0, 20);
    base.endFill();
    this.placementGhost.addChild(base);

    // Tower range indicator
    const range = new PIXI.Graphics();
    range.beginFill(0x4CAF50, 0.2);
    range.drawCircle(0, 0, towerConfig.baseRange);
    range.endFill();
    this.placementGhost.addChild(range);

    // Add to game container
    this.gameplay.gameContainer.addChild(this.placementGhost);

    // Hide initially
    this.placementGhost.visible = false;
  }

  handlePointerMove(event) {
    if (!this.placementGhost) return;

    // Get position in game coordinates
    const position = event.data.getLocalPosition(this.gameplay.gameContainer);

    // Update ghost position
    this.placementGhost.position.set(position.x, position.y);

    // Check if position is valid for placement
    const canPlace = this.canPlaceTowerAt(position.x, position.y);

    // Update ghost appearance
    this.placementGhost.visible = true;
    this.placementGhost.children[0].tint = canPlace ? 0x4CAF50 : 0xFF0000;
  }

  handlePointerDown(event) {
    if (!this.selectedTowerType) return;

    // Get position in game coordinates
    const position = event.data.getLocalPosition(this.gameplay.gameContainer);

    // Try to place tower
    this.placeTower(position.x, position.y);
  }

  canPlaceTowerAt(x, y) {
    // Check if position is within buildable areas
    const buildableAreas = this.gameplay.mapData.buildableAreas;
    let withinBuildableArea = false;

    for (const area of buildableAreas) {
      if (
        x >= area.x &&
        x <= area.x + area.width &&
        y >= area.y &&
        y <= area.y + area.height
      ) {
        withinBuildableArea = true;
        break;
      }
    }

    if (!withinBuildableArea) return false;

    // Check if position overlaps with existing towers
    for (const tower of this.towers) {
      const dx = tower.x - x;
      const dy = tower.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 40) { // Assuming towers need 40px spacing
        return false;
      }
    }

    // Check if position is on the path
    const path = this.gameplay.mapData.path;
    for (let i = 0; i < path.length - 1; i++) {
      const p1 = path[i];
      const p2 = path[i + 1];

      // Check if point is near line segment
      const distToSegment = this.distanceToLineSegment(p1.x, p1.y, p2.x, p2.y, x, y);
      if (distToSegment < 30) { // 30px buffer around path
        return false;
      }
    }

    return true;
  }

  distanceToLineSegment(x1, y1, x2, y2, x, y) {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;

    return Math.sqrt(dx * dx + dy * dy);
  }

  placeTower(x, y) {
    if (!this.canPlaceTowerAt(x, y)) return;

    // Get tower config
    const towerConfig = this.towersConfig.find(t => t.id === this.selectedTowerType);
    if (!towerConfig) return;

    // Check if player has enough money
    if (!this.gameplay.spendMoney(towerConfig.baseCost)) {
      this.gameplay.game.showToast("Not enough money!", {
        duration: 3000,
        position: 'top',
        fontSize: 20
      });
      return;
    }

    // Create tower
    const tower = new Tower(towerConfig, x, y);
    this.towers.push(tower);

    // Add tower to game container
    this.gameplay.gameContainer.addChild(tower.container);

    // Play sound effect
    this.gameplay.game.audioManager.playSfx('towerPlace');
  }

  upgradeTower(tower) {
    // Calculate upgrade cost
    const towerConfig = this.towersConfig.find(t => t.id === tower.type);
    const upgradeFormulas = require('../../config/game-settings.json').towerSettings.upgradeFormulas;

    const upgradeCost = Math.floor(eval(upgradeFormulas.cost.formula
      .replace('baseCost', towerConfig.baseCost)
      .replace('level', tower.level)));

    // Check if player has enough money
    if (!this.gameplay.spendMoney(upgradeCost)) {
      console.log('Not enough money for upgrade');
      return false;
    }

    // Upgrade tower
    tower.upgrade();

    // Play sound effect
    this.gameplay.game.audioManager.playSfx('upgrade');

    return true;
  }

  update(delta) {
    // Update all towers
    for (const tower of this.towers) {
      tower.update(delta, this.gameplay.enemyManager.enemies, this.gameplay);
    }
  }
}
