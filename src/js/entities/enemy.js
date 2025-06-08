import * as PIXI from 'pixi.js';

export class Enemy {
  constructor(config, path) {
    this.id = config.id;
    this.name = config.name;
    this.baseHealth = config.baseHealth;
    this.baseSpeed = config.baseSpeed;
    this.baseReward = config.baseReward;
    this.size = config.size;
    this.flying = config.flying || false;
    this.isBoss = config.isBoss || false;
    this.specialAbility = config.specialAbility;
    
    // Current stats
    this.health = this.baseHealth;
    this.maxHealth = this.baseHealth;
    this.speed = this.baseSpeed;
    this.reward = this.baseReward;
    
    // Path following
    this.path = path;
    this.currentPathIndex = 0;
    this.pathProgress = 0; // 0 to 1 for entire path
    this.reachedEnd = false;
    
    // Position
    this.x = path[0].x;
    this.y = path[0].y;
    
    // Status effects
    this.statusEffects = [];
    
    // Create sprite
    this.createSprite();
  }
  
  createSprite() {
    // Create a simple sprite
    this.sprite = new PIXI.Container();
    this.sprite.position.set(this.x, this.y);
    
    // Enemy body
    const body = new PIXI.Graphics();
    
    if (this.isBoss) {
      body.beginFill(0xff0000);
      body.drawRect(-this.size.width / 2, -this.size.height / 2, this.size.width, this.size.height);
    } else if (this.flying) {
      body.beginFill(0x00ffff);
      body.drawCircle(0, 0, this.size.width / 2);
    } else {
      body.beginFill(0xff9900);
      body.drawCircle(0, 0, this.size.width / 2);
    }
    
    body.endFill();
    this.sprite.addChild(body);
    
    // Health bar
    this.healthBar = new PIXI.Container();
    this.healthBar.position.set(0, -this.size.height / 2 - 10);
    
    const healthBarBg = new PIXI.Graphics();
    healthBarBg.beginFill(0x000000);
    healthBarBg.drawRect(-this.size.width / 2, 0, this.size.width, 5);
    healthBarBg.endFill();
    this.healthBar.addChild(healthBarBg);
    
    this.healthBarFill = new PIXI.Graphics();
    this.healthBarFill.beginFill(0x00ff00);
    this.healthBarFill.drawRect(-this.size.width / 2, 0, this.size.width, 5);
    this.healthBarFill.endFill();
    this.healthBar.addChild(this.healthBarFill);
    
    this.sprite.addChild(this.healthBar);
    
    // In a real implementation, this would use sprites
    // const enemyTexture = PIXI.Texture.from(`assets/images/${config.sprite}`);
    // const enemySprite = new PIXI.Sprite(enemyTexture);
    // enemySprite.anchor.set(0.5);
    // this.sprite.addChild(enemySprite);
  }
  
  updateHealthBar() {
    const healthPercent = Math.max(0, this.health / this.maxHealth);
    
    this.healthBarFill.clear();
    this.healthBarFill.beginFill(0x00ff00);
    this.healthBarFill.drawRect(-this.size.width / 2, 0, this.size.width * healthPercent, 5);
    this.healthBarFill.endFill();
  }
  
  takeDamage(amount) {
    this.health -= amount;
    this.updateHealthBar();
  }
  
  applyStatusEffect(effect, power, duration) {
    // Check if effect already exists
    const existingEffect = this.statusEffects.find(e => e.type === effect);
    
    if (existingEffect) {
      // Refresh duration
      existingEffect.duration = Math.max(existingEffect.duration, duration);
      
      // Use the stronger power
      existingEffect.power = Math.max(existingEffect.power, power);
    } else {
      // Add new effect
      this.statusEffects.push({
        type: effect,
        power,
        duration
      });
      
      // Apply effect immediately
      this.applyEffect(effect, power);
    }
  }
  
  applyEffect(effect, power) {
    switch (effect) {
      case 'slow':
        this.speed = this.baseSpeed * (1 - power);
        break;
      case 'stun':
        this.speed = 0;
        break;
      case 'poison':
      case 'fire':
        // Damage over time is handled in update
        break;
      case 'confusion':
        // Reverse direction
        this.currentPathIndex = Math.max(0, this.currentPathIndex - 2);
        break;
    }
  }
  
  removeEffect(effect) {
    switch (effect) {
      case 'slow':
      case 'stun':
        this.speed = this.baseSpeed;
        break;
    }
  }
  
  updateStatusEffects(delta) {
    const secondsDelta = delta / 60;
    
    // Process each status effect
    for (let i = this.statusEffects.length - 1; i >= 0; i--) {
      const effect = this.statusEffects[i];
      
      // Reduce duration
      effect.duration -= secondsDelta;
      
      // Apply damage over time effects
      if (effect.type === 'poison' || effect.type === 'fire') {
        const damagePerSecond = effect.power;
        this.takeDamage(damagePerSecond * secondsDelta);
      }
      
      // Remove expired effects
      if (effect.duration <= 0) {
        this.removeEffect(effect.type);
        this.statusEffects.splice(i, 1);
      }
    }
  }
  
  moveAlongPath(delta) {
    const secondsDelta = delta / 60;
    
    // If reached end or stunned, don't move
    if (this.reachedEnd || this.speed <= 0) return;
    
    // Get current and next points on path
    const currentPoint = this.path[this.currentPathIndex];
    const nextPoint = this.path[this.currentPathIndex + 1];
    
    if (!nextPoint) {
      // Reached end of path
      this.reachedEnd = true;
      return;
    }
    
    // Calculate direction and distance to next point
    const dx = nextPoint.x - this.x;
    const dy = nextPoint.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 5) {
      // Reached next point, move to next segment
      this.currentPathIndex++;
      
      // If reached end of path
      if (this.currentPathIndex >= this.path.length - 1) {
        this.reachedEnd = true;
      }
      
      return;
    }
    
    // Move towards next point
    const moveDistance = this.speed * secondsDelta * 60; // Convert to pixels per frame
    const moveRatio = Math.min(1, moveDistance / distance);
    
    this.x += dx * moveRatio;
    this.y += dy * moveRatio;
    
    // Update sprite position
    this.sprite.position.set(this.x, this.y);
    
    // Update path progress
    this.updatePathProgress();
  }
  
  updatePathProgress() {
    // Calculate progress along entire path (0 to 1)
    let totalPathLength = 0;
    let coveredLength = 0;
    
    for (let i = 0; i < this.path.length - 1; i++) {
      const p1 = this.path[i];
      const p2 = this.path[i + 1];
      const segmentLength = Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
      );
      
      totalPathLength += segmentLength;
      
      if (i < this.currentPathIndex) {
        coveredLength += segmentLength;
      } else if (i === this.currentPathIndex) {
        const dx = this.x - p1.x;
        const dy = this.y - p1.y;
        const distanceCovered = Math.sqrt(dx * dx + dy * dy);
        coveredLength += distanceCovered;
      }
    }
    
    this.pathProgress = coveredLength / totalPathLength;
  }
  
  update(delta) {
    // Update status effects
    this.updateStatusEffects(delta);
    
    // Move along path
    this.moveAlongPath(delta);
  }
}
