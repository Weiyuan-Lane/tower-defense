import './styles/main.css';
import { Game } from './js/core/game';

// Initialize the game when the DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.start();
});
