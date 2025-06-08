import * as PIXI from 'pixi.js';

export class Map {
  constructor(mapData) {
    this.mapData = mapData;
    this.container = new PIXI.Container();
    
    this.createMap();
  }
  
  createMap() {
    // Create background
    this.createBackground();
    
    // Create path
    this.createPath();
    
    // Create buildable areas indicators (for debugging)
    this.createBuildableAreas();
  }
  
  createBackground() {
    // Create a simple background
    const background = new PIXI.Graphics();
    background.beginFill(0x333333);
    background.drawRect(0, 0, this.mapData.width, this.mapData.height);
    background.endFill();
    this.container.addChild(background);
    
    // In a real implementation, this would load the background image
    // const backgroundTexture = PIXI.Texture.from(`assets/images/${this.mapData.backgroundImage}`);
    // const backgroundSprite = new PIXI.Sprite(backgroundTexture);
    // this.container.addChild(backgroundSprite);
  }
  
  createPath() {
    // Draw the path
    const path = new PIXI.Graphics();
    path.lineStyle(30, 0x996633, 1);
    
    // Draw path segments
    const pathPoints = this.mapData.path;
    if (pathPoints.length >= 2) {
      path.moveTo(pathPoints[0].x, pathPoints[0].y);
      
      for (let i = 1; i < pathPoints.length; i++) {
        path.lineTo(pathPoints[i].x, pathPoints[i].y);
      }
    }
    
    this.container.addChild(path);
    
    // Add start and end markers
    if (pathPoints.length >= 2) {
      // Start marker
      const startMarker = new PIXI.Graphics();
      startMarker.beginFill(0x00ff00);
      startMarker.drawCircle(pathPoints[0].x, pathPoints[0].y, 15);
      startMarker.endFill();
      this.container.addChild(startMarker);
      
      // End marker
      const endMarker = new PIXI.Graphics();
      endMarker.beginFill(0xff0000);
      endMarker.drawCircle(pathPoints[pathPoints.length - 1].x, pathPoints[pathPoints.length - 1].y, 15);
      endMarker.endFill();
      this.container.addChild(endMarker);
    }
  }
  
  createBuildableAreas() {
    // Draw buildable areas (for debugging)
    const buildableAreas = new PIXI.Graphics();
    buildableAreas.beginFill(0x00ff00, 0.1);
    
    for (const area of this.mapData.buildableAreas) {
      buildableAreas.drawRect(area.x, area.y, area.width, area.height);
    }
    
    buildableAreas.endFill();
    this.container.addChild(buildableAreas);
  }
}
