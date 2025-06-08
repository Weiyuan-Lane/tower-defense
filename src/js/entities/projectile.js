import * as PIXI from 'pixi.js';

export class Projectile {
  constructor(config) {
    this.x = config.x;
    this.y = config.y;
    this.targetX = config.targetX;
    this.targetY = config.targetY;
    this.target = config.target;
    this.damage = config.damage;
    this.speed = config.speed;
    this.type = config.type || 'single';
    this.effect = config.effect;
    this.effectPower = config.effectPower;
    this.effectDuration = config.effectDuration;
    this.splashRadius = config.splashRadius;
    
    this.active = true;
    
    // Create sprite
    this.createSprite();
    
    // Calculate direction
    this.calculateDirection();
  }
  
  createSprite() {
    this.sprite = new PIXI.Container();
    this.sprite.position.set(this.x, this.y);
    
    // Create projectile graphics based on type and effect
    const graphics = new PIXI.Graphics();
    
    if (this.effect === 'fire') {
      graphics.beginFill(0xff4500);
      graphics.drawCircle(0, 0, 5);
    } else if (this.effect === 'slow' || this.effect === 'stun') {
      graphics.beginFill(0x00ffff);
      graphics.drawCircle(0, 0, 5);
    } else if (this.effect === 'poison') {
      graphics.beginFill(0x00ff00);
      graphics.drawCircle(0, 0, 5);
    } else if (this.effect === 'confusion') {
      graphics.beginFill(0xff00ff);
      graphics.drawCircle(0, 0, 5);
    } else {
      graphics.beginFill(0xffff00);
      graphics.drawCircle(0, 0, 5);
    }
    
    graphics.endFill();
    this.sprite.addChild(graphics);
  }
  
  calculateDirection() {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    this.directionX = dx / distance;
    this.directionY = dy / distance;
  }
  
  update(delta) {
    if (!this.active) return;
    
    // Move projectile
    const moveDistance = this.speed * delta / 60;
    this.x += this.directionX * moveDistance;
    this.y += this.directionY * moveDistance;
    
    // Update sprite position
    this.sprite.position.set(this.x, this.y);
    
    // Check if hit target
    if (this.target) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 10) {
        this.hit();
      }
    }
    
    // Check if out of bounds
    if (this.x < 0 || this.x > 800 || this.y < 0 || this.y > 600) {
      this.destroy();
    }
  }
  
  hit() {
    if (this.type === 'single') {
      // Deal damage to target
      this.target.takeDamage(this.damage);
      
      // Apply effect if any
      if (this.effect && this.effectPower && this.effectDuration) {
        this.target.applyStatusEffect(this.effect, this.effectPower, this.effectDuration);
      }
    } else if (this.type === 'area') {
      // Get all enemies in range
      const gameplayScene = this.sprite.parent.parent;
      if (!gameplayScene || !gameplayScene.enemyManager) return;
      
      const enemies = gameplayScene.enemyManager.enemies;
      
      for (const enemy of enemies) {
        const dx = enemy.x - this.x;
        const dy = enemy.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= this.splashRadius) {
          // Deal damage to enemy
          enemy.takeDamage(this.damage);
          
          // Apply effect if any
          if (this.effect && this.effectPower && this.effectDuration) {
            enemy.applyStatusEffect(this.effect, this.effectPower, this.effectDuration);
          }
        }
      }
      
      // Create splash effect
      this.createSplashEffect();
    }
    
    // Destroy projectile
    this.destroy();
  }
  
  createSplashEffect() {
    // Create a simple splash effect
    const splash = new PIXI.Graphics();
    splash.beginFill(0xffff00, 0.5);
    splash.drawCircle(0, 0, this.splashRadius);
    splash.endFill();
    splash.position.set(this.x, this.y);
    
    // Add to game container
    const gameContainer = this.sprite.parent;
    if (gameContainer) {
      gameContainer.addChild(splash);
      
      // Animate and remove
      let alpha = 0.5;
      const fadeOut = () => {
        alpha -= 0.05;
        splash.alpha = alpha;
        
        if (alpha <= 0) {
          gameContainer.removeChild(splash);
        } else {
          requestAnimationFrame(fadeOut);
        }
      };
      
      fadeOut();
    }
  }
  
  destroy() {
    this.active = false;
    
    // Remove from game container
    const gameContainer = this.sprite.parent;
    if (gameContainer) {
      gameContainer.removeChild(this.sprite);
    }
  }
}
