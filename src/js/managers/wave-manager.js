export class WaveManager {
  constructor(gameplay) {
    this.gameplay = gameplay;
    this.currentWave = 0;
    this.waveInProgress = false;
    this.preparationTimeLeft = 0;
    this.preparationTime = 60; // 60 seconds between waves
    this.enemiesRemaining = 0;
    this.gameSettings = require('../../config/game-settings.json').gameSettings;
  }

  startPreparation() {
    this.waveInProgress = false;
    this.preparationTimeLeft = this.preparationTime;
  }

  startWave() {
    if (this.waveInProgress) return;

    this.currentWave++;
    this.gameplay.wave = this.currentWave;
    this.waveInProgress = true;
    this.preparationTimeLeft = 0;

    // Check if we've reached the maximum number of waves
    if (this.currentWave > this.gameSettings.maxWaves) {
      this.gameplay.endGame(true); // Win the game
      return;
    }

    // Check if this is a boss wave
    const isBossWave = this.currentWave % this.gameSettings.bossWaveFrequency === 0;

    // Spawn enemies for this wave
    this.spawnWaveEnemies(isBossWave);
  }

  spawnWaveEnemies(isBossWave) {
    // In a real implementation, this would use the wave configuration from the map
    // For now, we'll generate enemies based on the current wave

    // Calculate number of enemies based on wave number
    const baseEnemyCount = 10 + Math.floor(this.currentWave * 1.5);

    // Determine enemy types to spawn
    const enemyTypes = ['basic'];
    if (this.currentWave >= 3) enemyTypes.push('fast');
    if (this.currentWave >= 5) enemyTypes.push('armored');
    if (this.currentWave >= 10) enemyTypes.push('flying');
    if (this.currentWave >= 15) enemyTypes.push('healing');
    if (this.currentWave >= 20) enemyTypes.push('splitting');

    // Create spawn schedule
    const spawnSchedule = [];

    // Add regular enemies
    let totalEnemies = baseEnemyCount;
    let spawnDelay = 0;
    const spawnInterval = 0.8 - Math.min(0.6, this.currentWave * 0.01); // Spawn faster in later waves

    for (let i = 0; i < totalEnemies; i++) {
      const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      spawnSchedule.push({
        type: randomType,
        delay: spawnDelay
      });
      spawnDelay += spawnInterval;
    }

    // Add boss if it's a boss wave
    if (isBossWave) {
      const bossLevel = Math.ceil(this.currentWave / this.gameSettings.bossWaveFrequency);
      const bossType = `boss${Math.min(3, bossLevel)}`;

      spawnSchedule.push({
        type: bossType,
        delay: spawnDelay + 2 // Spawn boss 2 seconds after the last regular enemy
      });

      totalEnemies++;
    }

    this.enemiesRemaining = totalEnemies;

    // Pass spawn schedule to enemy manager
    this.gameplay.enemyManager.setSpawnSchedule(spawnSchedule);
  }

  enemyReachedEnd() {
    this.gameplay.loseLife();
    this.enemyDefeated();
  }

  enemyDefeated() {
    this.enemiesRemaining--;

    // Check if wave is complete
    if (this.enemiesRemaining <= 0 && this.waveInProgress) {
      this.waveComplete();
    }
  }

  waveComplete() {
    this.waveInProgress = false;
    this.startPreparation();
  }

  update(delta) {
    // Update preparation timer
    if (!this.waveInProgress && this.preparationTimeLeft > 0) {
      this.preparationTimeLeft -= delta / 60; // delta is in frames, convert to seconds

      if (this.preparationTimeLeft <= 0) {
        this.startWave();
      }
    }
  }
}
