# Tower Defense Game

A browser-based tower defense game built with PixiJS.

## Features

- Client-side only game (no server-side logic)
- Multiple maps with different layouts and difficulties
- Various tower types with different abilities
- Tower upgrades with scaling stats
- Enemy waves with increasing difficulty
- Boss waves every 5 waves
- High score tracking

## Game Mechanics

- Build towers to defend against waves of enemies
- Towers can be upgraded with money earned from defeating enemies
- Different tower types have different projectiles and effects
- Enemies follow a predefined path from start to end
- Lose lives when enemies reach the end of the path
- Game ends when you run out of lives
- Try to survive as many waves as possible

## Tower Types

The game features various tower types with different attributes:

- **Projectile Types**:
  - Single target
  - Area of effect

- **Projectile Effects**:
  - Stun (stop unit movement)
  - Slow (reduce unit movement speed)
  - Poison (damage over time)
  - Fire (damage over time with burning animation)
  - Confusion (make units move backward)

## Configuration

The game is highly configurable through JSON files:

- `maps.json`: Define map layouts, paths, buildable areas, and starting conditions
- `towers.json`: Configure tower types, base stats, and projectile properties
- `enemies.json`: Set up enemy types, stats, and special abilities
- `game-settings.json`: Control game mechanics, upgrade formulas, and scaling

## Development

### Prerequisites

- Node.js and npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

### Running the Development Server

```
npm start
```

This will start a development server at http://localhost:9000

### Building for Production

```
npm run build
```

This will create a production build in the `dist` directory.

## License

MIT
