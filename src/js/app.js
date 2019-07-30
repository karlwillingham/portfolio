import Typed from 'typed.js'
import Game from './snake/index.js'
import '../css/style.scss'

// Load the Terminal
new Typed('#terminal', {
  stringsElement: '#typed-strings',
  typeSpeed: 50,
  backSpeed: 5,
  loop: true
});

// Create the Snake Game
document.getElementById('snakeGameBtn').addEventListener("click", function() {
  const snakeGame = document.getElementById('snakeGame');

  // Overlay and full screen
  snakeGame.classList.add("overlay");

  // Create the Game tag
  const canvas = document.createElement('canvas');
  canvas.setAttribute('id', 'snake');
  snakeGame.appendChild(canvas);

  window.mySnake = new Game("snake", {
    canvasWidth: window.innerWidth,
    canvasHeight: window.innerHeight,
    frameLength: 10,
    blocks: 30,
    speedFactor: 1.4,
    fnGameEnd: function() {
      const snake = document.getElementById('snake');
      snake.parentNode.removeChild(snake);
      document.getElementById('snakeGame').classList.remove("overlay");
    }
  });
})