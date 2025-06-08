import * as PIXI from 'pixi.js';

export class Toast {
  constructor(game) {
    this.game = game;
    this.container = new PIXI.Container();
    this.container.zIndex = 10000; // Ensure it appears above other elements
    this.game.app.stage.addChild(this.container);
    this.activeToasts = [];
  }

  show(message, options = {}) {
    const {
      duration = 3000,
      background = 0x000000,
      textColor = 0xFFFFFF,
      alpha = 0.8,
      fontSize = 16,
      padding = 10,
      position = 'bottom' // 'top', 'bottom', 'middle'
    } = options;

    // Create toast container
    const toast = new PIXI.Container();

    // Create background
    const bg = new PIXI.Graphics();
    bg.beginFill(background, alpha);
    bg.drawRoundedRect(0, 0, 10, 10, 5); // Will resize based on text
    bg.endFill();
    toast.addChild(bg);

    // Create text
    const text = new PIXI.Text(message, {
      fontFamily: 'Arial',
      fontSize: fontSize,
      fill: textColor,
      align: 'center',
      resolution: 2
    });
    text.anchor.set(0.5);
    text.position.set(padding + text.width / 2, padding + text.height / 2);
    toast.addChild(text);

    // Resize background to fit text
    bg.clear();
    bg.beginFill(background, alpha);
    bg.drawRoundedRect(0, 0, text.width + padding * 2, text.height + padding * 2, 5);
    bg.endFill();

    // Position toast based on option
    toast.x = (this.game.width - (text.width + padding * 2)) / 2;

    if (position === 'top') {
      toast.y = 20;
    } else if (position === 'bottom') {
      toast.y = this.game.height - (text.height + padding * 2) - 20;
    } else { // middle
      toast.y = (this.game.height - (text.height + padding * 2)) / 2;
    }

    // Add to container
    this.container.addChild(toast);
    this.activeToasts.push(toast);

    // Animate in
    toast.alpha = 0;

    // Animation timeline
    const fadeIn = () => {
      toast.alpha += 0.1;
      if (toast.alpha < 1) {
        requestAnimationFrame(fadeIn);
      }
    };

    fadeIn();

    // Set timeout to remove
    setTimeout(() => {
      const fadeOut = () => {
        toast.alpha -= 0.1;
        if (toast.alpha > 0) {
          requestAnimationFrame(fadeOut);
        } else {
          this.container.removeChild(toast);
          const index = this.activeToasts.indexOf(toast);
          if (index !== -1) {
            this.activeToasts.splice(index, 1);
          }
        }
      };

      fadeOut();
    }, duration);

    return toast;
  }

  clear() {
    // Remove all active toasts
    for (const toast of this.activeToasts) {
      this.container.removeChild(toast);
    }
    this.activeToasts = [];
  }
}
