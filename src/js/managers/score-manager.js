export class ScoreManager {
  constructor() {
    this.highScores = [];
    this.loadHighScores();
  }

  loadHighScores() {
    // Load high scores from local storage
    const savedScores = localStorage.getItem('tdGameHighScores');
    if (savedScores) {
      this.highScores = JSON.parse(savedScores);
    } else {
      // Initialize with empty array if no scores exist
      this.highScores = [];
    }

    // Sort scores by wave (highest first)
    this.highScores.sort((a, b) => b.wave - a.wave);
  }

  saveHighScores() {
    // Save high scores to local storage
    localStorage.setItem('tdGameHighScores', JSON.stringify(this.highScores));
  }

  addScore(name, map, wave) {
    // Add a new score
    this.highScores.push({
      name,
      map,
      wave
    });

    // Sort scores by wave (highest first)
    this.highScores.sort((a, b) => b.wave - a.wave);

    // Limit to top 100 scores
    if (this.highScores.length > 100) {
      this.highScores = this.highScores.slice(0, 100);
    }

    // Save updated scores
    this.saveHighScores();

    // Return the rank of the new score
    return this.getScoreRank(name, map, wave);
  }

  getScoreRank(name, map, wave) {
    // Find the rank of a specific score
    for (let i = 0; i < this.highScores.length; i++) {
      const score = this.highScores[i];
      if (score.name === name && score.map === map && score.wave === wave) {
        return i + 1;
      }
    }
    return -1;
  }

  getTopScores(count = 10) {
    // Get the top N scores
    return this.highScores.slice(0, count);
  }

  isHighScore(wave) {
    // Check if a wave count would be a high score
    if (this.highScores.length < 100) {
      return true;
    }

    return wave > this.highScores[this.highScores.length - 1].wave;
  }
}
