import * as PIXI from 'pixi.js';
import { Projectile } from './projectile';

const TOWER_SIZE = 20; // Size of the tower base in pixels
export class Tower {
  constructor(config, gameplay, x, y) {
    this.type = config.id;
    this.name = config.name;
    this.x = x;
    this.y = y;
    this.level = 1;

    // Base stats
    this.baseDamage = config.baseDamage;
    this.baseRange = config.baseRange;
    this.baseSpeed = config.baseSpeed; // Attacks per second

    // Current stats (will be updated when leveling up)
    this.damage = this.baseDamage;
    this.range = this.baseRange;
    this.speed = this.baseSpeed;

    // Projectile properties
    this.projectileType = config.projectileType;
    this.projectileEffect = config.projectileEffect;
    this.projectileSpeed = config.projectileSpeed;
    this.splashRadius = config.splashRadius;

    // Effect properties
    this.effectPower = config.baseEffectPower;
    this.effectDuration = config.baseEffectDuration;

    // Attack cooldown
    this.cooldown = 0;

    // Target
    this.target = null;

    // Create container and graphics
    this.container = new PIXI.Container();
    this.container.position.set(x, y);

    // Create tower graphics
    this.createTowerGraphics();

    // Create range indicator (hidden by default)
    this.createRangeIndicator();

    // Create level text
    this.createLevelText();

    // Make tower interactive
    this.setupInteraction(gameplay);
  }

  createTowerGraphics() {
    // Base
    const base = new PIXI.Graphics();
    base.beginFill(0x666666);
    base.drawCircle(0, 0, TOWER_SIZE);
    base.endFill();
    this.container.addChild(base);

    // Tower body
    const body = new PIXI.Graphics();
    body.beginFill(0x4CAF50);
    body.drawRect(-10, -15, 20, 30);
    body.endFill();
    this.container.addChild(body);
  }

  createRangeIndicator() {
    this.rangeIndicator = new PIXI.Graphics();
    this.rangeIndicator.beginFill(0x4CAF50, 0.2);
    this.rangeIndicator.drawCircle(0, 0, this.range);
    this.rangeIndicator.endFill();
    this.rangeIndicator.visible = false;
    this.container.addChild(this.rangeIndicator);
  }

  createLevelText() {
    this.levelText = new PIXI.Text(`${this.level}`, {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0xffffff
    });
    this.levelText.anchor.set(0.5);
    this.levelText.position.set(0, -25);
    this.container.addChild(this.levelText);
  }

  setupInteraction(gameplay) {
    this.container.interactive = true;
    this.container.cursor = 'pointer';

    this.container.on('pointerdown', (event) => {
      const localPos = event.data.getLocalPosition(this.container);

      if (localPos.x > -TOWER_SIZE && localPos.x < TOWER_SIZE &&
          localPos.y > -TOWER_SIZE && localPos.y < TOWER_SIZE) {
        this.showUpgradeMenu(gameplay);
      }

      // Stop event propagation to prevent closing the menu immediately
      event.stopPropagation();
    });

    this.container.on('pointermove', (event) => {
      const localPos = event.data.getLocalPosition(this.container);
      console.log('Pointer over tower at:', localPos);
      if (localPos.x > -TOWER_SIZE && localPos.x < TOWER_SIZE &&
          localPos.y > -TOWER_SIZE && localPos.y < TOWER_SIZE) {
        this.rangeIndicator.visible = true;
      } else {
        this.rangeIndicator.visible = false;
      }
    });

    this.container.on('pointerout', () => {
      this.rangeIndicator.visible = false;
    });
  }

  showUpgradeMenu(gameplay) {
    // Show upgrade menu at tower's position
    if (gameplay && gameplay.createTowerUpgradeMenu) {
      gameplay.createTowerUpgradeMenu(this, this.x, this.y);
    }
  }

  upgrade() {
    this.level++;

    // Get upgrade formulas
    const upgradeFormulas = require('../../config/game-settings.json').towerSettings.upgradeFormulas;

    // Update stats
    this.damage = Math.floor(eval(upgradeFormulas.damage.formula
      .replace('baseDamage', this.baseDamage)
      .replace('level', this.level - 1)));

    this.range = Math.floor(eval(upgradeFormulas.range.formula
      .replace('baseRange', this.baseRange)
      .replace('level', this.level - 1)));

    this.speed = eval(upgradeFormulas.speed.formula
      .replace('baseSpeed', this.baseSpeed)
      .replace('level', this.level - 1));

    if (this.projectileEffect && this.effectPower) {
      this.effectPower = eval(upgradeFormulas.effectPower.formula
        .replace('baseEffectPower', this.baseEffectPower)
        .replace('level', this.level - 1));
    }

    if (this.projectileEffect && this.effectDuration) {
      this.effectDuration = eval(upgradeFormulas.effectDuration.formula
        .replace('baseEffectDuration', this.baseEffectDuration)
        .replace('level', this.level - 1));
    }

    // Update range indicator
    this.rangeIndicator.clear();
    this.rangeIndicator.beginFill(0x4CAF50, 0.2);
    this.rangeIndicator.drawCircle(0, 0, this.range);
    this.rangeIndicator.endFill();

    // Update level text
    this.levelText.text = `${this.level}`;
  }

  findTarget(enemies) {
    // Find the enemy that is furthest along the path within range
    let bestTarget = null;
    let furthestProgress = -1;

    for (const enemy of enemies) {
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= this.range && enemy.pathProgress > furthestProgress) {
        bestTarget = enemy;
        furthestProgress = enemy.pathProgress;
      }
    }

    return bestTarget;
  }

  attack(target, gameplay) {
    // Create projectile
    const projectile = new Projectile({
      x: this.x,
      y: this.y,
      targetX: target.x,
      targetY: target.y,
      target: target,
      damage: this.damage,
      speed: this.projectileSpeed,
      type: this.projectileType,
      effect: this.projectileEffect,
      effectPower: this.effectPower,
      effectDuration: this.effectDuration,
      splashRadius: this.splashRadius
    });

    // Add projectile to game container
    const gameplayScene = this.container.parent;
    if (gameplayScene) {
      gameplayScene.addChild(projectile.sprite);
      gameplay.projectiles.push(projectile);
      gameplay.game.audioManager.playSfx('towerShoot');
    }
  }

  update(delta, enemies, gameplay) {
    // Update cooldown
    if (this.cooldown > 0) {
      this.cooldown -= delta / 60; // delta is in frames, convert to seconds
    }

    // If on cooldown, don't attack
    if (this.cooldown > 0) return;

    // Find target
    this.target = this.findTarget(enemies);

    // If no target, don't attack
    if (!this.target) return;

    // Attack target
    this.attack(this.target, gameplay);

    // Reset cooldown
    this.cooldown = 1 / this.speed;
  }
}
