import { Enemy } from '../entities/enemy';

export class EnemyManager {
  constructor(gameplay) {
    this.gameplay = gameplay;
    this.enemies = [];
    this.spawnSchedule = [];
    this.spawnTimer = 0;
    this.enemiesConfig = require('../../config/enemies.json').enemies;
  }

  setSpawnSchedule(schedule) {
    this.spawnSchedule = [...schedule];
    this.spawnTimer = 0;
  }

  spawnEnemy(type) {
    // Get enemy config
    const enemyConfig = this.enemiesConfig.find(e => e.id === type);
    if (!enemyConfig) return;

    // Get path from map
    const path = this.gameplay.mapData.path;
    if (!path || path.length < 2) return;

    // Create enemy
    const enemy = new Enemy(enemyConfig, path);
    this.enemies.push(enemy);

    // Add enemy to game container
    this.gameplay.gameContainer.addChild(enemy.sprite);
  }

  removeEnemy(enemy) {
    // Remove from game container
    this.gameplay.gameContainer.removeChild(enemy.sprite);

    // Remove from enemies array
    const index = this.enemies.indexOf(enemy);
    if (index !== -1) {
      this.enemies.splice(index, 1);
    }
  }

  enemyReachedEnd(enemy) {
    this.removeEnemy(enemy);
    this.gameplay.waveManager.enemyReachedEnd();
  }

  enemyDefeated(enemy) {
    // Award money to player
    this.gameplay.addMoney(enemy.reward);

    // Remove enemy
    this.removeEnemy(enemy);

    // Notify wave manager
    this.gameplay.waveManager.enemyDefeated();

    // Play sound effect
    this.gameplay.game.audioManager.playSfx('enemyDeath');
  }

  update(delta) {
    // Process spawn schedule
    if (this.spawnSchedule.length > 0) {
      this.spawnTimer += delta / 60; // delta is in frames, convert to seconds

      while (this.spawnSchedule.length > 0 && this.spawnTimer >= this.spawnSchedule[0].delay) {
        const enemyToSpawn = this.spawnSchedule.shift();
        this.spawnEnemy(enemyToSpawn.type);
      }
    }

    // Update all enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(delta);

      // Check if enemy reached the end
      if (enemy.reachedEnd) {
        this.enemyReachedEnd(enemy);
      }
      // Check if enemy is defeated
      else if (enemy.health <= 0) {
        this.enemyDefeated(enemy);
      }
    }
  }
}
