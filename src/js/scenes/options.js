import * as PIXI from 'pixi.js';

export class Options {
  constructor(game) {
    this.game = game;
    this.container = new PIXI.Container();
    this.settings = {
      musicVolume: 0.7,
      sfxVolume: 0.8
    };
    this.loadSettings();
  }

  init() {
    // Clear container
    this.container.removeChildren();

    // Create background
    const background = new PIXI.Graphics();
    background.beginFill(0x000000);
    background.drawRect(0, 0, this.game.width, this.game.height);
    background.endFill();
    this.container.addChild(background);

    // Create title
    const title = new PIXI.Text('Options', {
      fontFamily: 'Arial',
      fontSize: 36,
      fill: 0xffffff,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.position.set(this.game.width / 2, 50);
    this.container.addChild(title);

    // Create options UI
    this.createOptionsUI();

    // Create back button
    this.createBackButton();
  }

  createOptionsUI() {
    const optionsContainer = new PIXI.Container();
    optionsContainer.position.set(this.game.width / 2, this.game.height / 2 - 50);

    // Music volume slider
    const musicLabel = new PIXI.Text('Music Volume', {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0xffffff
    });
    musicLabel.anchor.set(0.5, 0);
    optionsContainer.addChild(musicLabel);

    const musicSlider = this.createSlider(300, 20, this.settings.musicVolume, (value) => {
      this.settings.musicVolume = value;
      this.game.audioManager.setMusicVolume(value);
    });
    musicSlider.position.set(0, 40);
    optionsContainer.addChild(musicSlider);

    // SFX volume slider
    const sfxLabel = new PIXI.Text('Sound Effects Volume', {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0xffffff
    });
    sfxLabel.anchor.set(0.5, 0);
    sfxLabel.position.set(0, 100);
    optionsContainer.addChild(sfxLabel);

    const sfxSlider = this.createSlider(300, 20, this.settings.sfxVolume, (value) => {
      this.settings.sfxVolume = value;
      this.game.audioManager.setSfxVolume(value);
    });
    sfxSlider.position.set(0, 140);
    optionsContainer.addChild(sfxSlider);

    // Save button
    const saveButton = this.createButton(200, 50, 'Save Settings', () => {
      this.saveSettings();
      this.game.switchScene('mainMenu');
    });
    saveButton.position.set(0, 220);
    optionsContainer.addChild(saveButton);

    this.container.addChild(optionsContainer);
  }

  createSlider(width, height, initialValue, onChange) {
    const slider = new PIXI.Container();

    // Slider background
    const background = new PIXI.Graphics();
    background.beginFill(0x333333);
    background.drawRoundedRect(-width / 2, -height / 2, width, height, height / 2);
    background.endFill();
    slider.addChild(background);

    // Slider fill
    const fill = new PIXI.Graphics();
    fill.beginFill(0x4CAF50);
    fill.drawRoundedRect(-width / 2, -height / 2, width * initialValue, height, height / 2);
    fill.endFill();
    slider.addChild(fill);

    // Slider handle
    const handle = new PIXI.Graphics();
    handle.beginFill(0xffffff);
    handle.drawCircle(0, 0, height);
    handle.endFill();
    handle.position.set(-width / 2 + width * initialValue, 0);
    slider.addChild(handle);

    // Make slider interactive
    slider.interactive = true;
    slider.cursor = 'pointer';

    const updateSlider = (event) => {
      const localPos = event.data.getLocalPosition(slider.parent);

      // Calculate value (0 to 1)
      let value = (localPos.x + width / 2) / width;
      value = Math.max(0, Math.min(1, value));

      // Update fill and handle
      fill.clear();
      fill.beginFill(0x4CAF50);
      fill.drawRoundedRect(-width / 2, -height / 2, width * value, height, height / 2);
      fill.endFill();

      handle.position.set(-width / 2 + width * value, 0);

      // Call onChange callback
      onChange(value);
    };

    slider.on('pointerdown', (event) => {
      updateSlider(event);
      slider.dragging = true;
    });

    slider.on('pointermove', (event) => {
      if (slider.dragging) {
        updateSlider(event);
      }
    });

    slider.on('pointerup', () => {
      slider.dragging = false;
    });

    slider.on('pointerupoutside', () => {
      slider.dragging = false;
    });

    return slider;
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
      fontSize: 20,
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

  createBackButton() {
    const button = this.createButton(100, 40, 'Back', () => {
      this.game.switchScene('mainMenu');
    });
    button.position.set(60, 30);
    this.container.addChild(button);
  }

  saveSettings() {
    // Save settings to local storage
    localStorage.setItem('tdGameSettings', JSON.stringify(this.settings));

    // Apply settings to audio manager
    this.game.audioManager.setMusicVolume(this.settings.musicVolume);
    this.game.audioManager.setSfxVolume(this.settings.sfxVolume);
  }

  loadSettings() {
    // Load settings from local storage
    const savedSettings = localStorage.getItem('tdGameSettings');
    if (savedSettings) {
      this.settings = JSON.parse(savedSettings);
      this.game.audioManager.setMusicVolume(this.settings.musicVolume);
      this.game.audioManager.setSfxVolume(this.settings.sfxVolume);
    }
  }

  update(delta) {
    // Update logic for options screen
  }
}
