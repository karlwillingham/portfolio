/*!
 * options.js
 * Version: 1.0
 *
 * Copyright 2016 Karl Willingham
 * Released under the MIT license
 */

/* Default Settings
*/
var defaults = {

    // Initialize Drawing
    initialize: true,
  
    // Canvas Size
    canvasWidth: 500,
    canvasHeight: 500,
  
    // Canvas Border Color
    canvasStyleBorder: "#000 solid 0px",
  
    // Game Text ID - Leave Blank if not wanted
    gameTextID: "game-text",
  
    // Game Frame length
    frameLength: 8,
  
    // Speed up Factor
    speedFactor: 1.1,
  
    // Game Border Color
    borderColor: "#FFF",
  
    // Number of Blocks per row
    blocks: 20,
  
    // Snake Attributes
    snake: {
      // Snake type
      type: "snake",
      // Initial number of Blocks Size
      size: 3,
      // Snake Color
      color: "#FFF",
    },
  
    // Mouse Attributes
    mouse: {
      type: "mouse",
      size: 1,
      color: "#FFF",
    },

    // Callbacks
    fnGameEnd: function(){},
  
  };
  
/*!
 * canvas-snake.js
 * Version: 1.0
 *
 * Copyright 2016 Karl Willingham
 * Released under the MIT license
 */

// Constants
var LEFT = 37,
  UP = 38,
  RIGHT = 39,
  DOWN = 40,
  ESCAPE = 27;

// Game Class
function Game(canvasID, options) {
  // Set options and Variables
  this.options = this.setOptions(options);
  this.frameLength = this.options.frameLength;
  this.speedFactor = this.options.speedFactor;

  // Set Canvas Settings
  this.canvas = document.getElementById(canvasID);
  this.ctx = this.canvas.getContext("2d");
  this.canvas.width = this.options.canvasWidth;
  this.canvas.height = this.options.canvasHeight;
  this.canvas.style.border = this.options.canvasStyleBorder;

  // Set Block Dimensions for Game Borders
  this.blockSize = this.options.blocks;
  this.borderCorners = this.borderCorners();
  this.borderWidth = this.borderCorners[2][0];
  this.borderHeight = this.borderCorners[2][1];

  // Initialize
  if (this.options.initialize)
    this.init();
};

Game.prototype.init = function() {
  // Set Game Variables
  this.snake = new Snake(this.ctx, this.blockSize, this.options.snake);
  this.mouse = new Mouse(this.ctx, this.blockSize, this.borderCorners, this.options.mouse);
  this.score = 0;

  // Start Game Loop
  this.interval = setInterval(function() {
    this.loop()
  }.bind(this), 1000 / this.frameLength);
};

Game.prototype.setOptions = function(options) {
  var result = {};
  for (var key in defaults)
    result[key] = (key in options) ? options[key] : defaults[key];
  return result;
};

// Display Game Text if ID Exists
Game.prototype.gameText = function(locationID) {
  var gameText = document.getElementById(this.options.gameTextID);
  var output = "Your Score: " + this.score;
  if (gameText) {
    switch (locationID) {
      case 0:
        // Moving
        break;
      case 1:
        // Hit Mouse
        break;
      case 2:
        output += ", you just hit a wall!"
        break;
      case 3:
        output += ", you just hit yourself!"
        break;
    }
    gameText.innerHTML = output;
  }
};

Game.prototype.draw = function() {
  this.drawBorder();
  this.snake.draw();
  this.mouse.draw();
};

Game.prototype.drawBorder = function() {
  this.ctx.save();
  this.ctx.strokeStyle = this.options.borderColor;
  this.ctx.lineWidth = this.blockSize;
  this.ctx.lineCap = 'square';
  var offset = this.ctx.lineWidth / 2;
  var corners = this.borderCorners;
  this.ctx.beginPath();
  this.ctx.moveTo(corners[3][0], corners[3][1]);
  for (var i = 0; i < corners.length; i++)
    this.ctx.lineTo(corners[i][0], corners[i][1]);

  this.ctx.stroke();
  this.ctx.restore();
};

Game.prototype.loop = function() {
  var locationID = this.locationCheck();
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.gameText(locationID);

  // Check the Snake Location
  switch (locationID) {
    case 0:
      this.snake.move();
      break;
    case 1:
      this.snake.grow();
      this.mouse.setPosition();
      this.speedUp();
      this.score++;
      break;
    case 2:
    case 3:
      this.end();
      break;
  }

  this.draw();
  this.keyEvents();
};

Game.prototype.end = function() {
  clearInterval(this.interval);
  this.options.fnGameEnd()
  console.log('End Game');
};

Game.prototype.restart = function() {
  console.log('Restart Game Not Implemented');
};

Game.prototype.speedUp = function() {
  this.frameLength *= this.speedFactor;
  clearInterval(this.interval);

  // Start Game Loop
  this.interval = setInterval(function() {
    this.loop()
  }.bind(this), 1000 / this.frameLength);
};

Game.prototype.keyEvents = function() {
  document.addEventListener('keydown', function(event) {
    var key = event.which;
    if (key == UP || key == DOWN || key == LEFT || key == RIGHT) {
      this.snake.setDirection(key);
      event.preventDefault();
    } else if (key == ESCAPE) {
      this.end();
    }
  }.bind(this));
};

// Return block dimensions
Game.prototype.borderCorners = function() {
  var borderHeight = this.blockSize * Math.floor(this.canvas.height / this.blockSize);
  var borderWidth = this.blockSize * Math.floor(this.canvas.width / this.blockSize);
  var offset = this.blockSize / 2;
  return [
    [offset, offset], // up, left
    [borderWidth - offset, offset], // up, right
    [borderWidth - offset, borderHeight - offset], // down, right
    [offset, borderHeight - offset] // down, left
  ];
};

/* Check location of snake
  0 => Valid location no objects hit
  1 => Hit Mouse - Grow Snake
  2 => hit border - end game
  3 => hit self - end game
*/
Game.prototype.locationCheck = function() {
  var snakePosition = this.snake.getPosition();
  var snakeHead = {
    x: snakePosition[0][0],
    y: snakePosition[0][1]
  };

  // Hit a border
  if (snakeHead.x < this.blockSize || snakeHead.y < this.blockSize ||
    snakeHead.x > this.borderWidth - this.blockSize ||
    snakeHead.y > this.borderHeight - this.blockSize) {
    console.log('hit border');
    return 2;
  }

  // Hit Snake
  for (var i = 1; i < snakePosition.length; i++) {
    if (snakeHead.x == snakePosition[i][0] &&
      snakeHead.y == snakePosition[i][1]) {
      console.log('hit Snake');
      return 3;
    }
  }

  // Hit Mouse
  var mousePosition = this.mouse.getPosition();
  mousePosition = {
    x: mousePosition[0],
    y: mousePosition[1]
  };

  if (mousePosition.x == snakeHead.x / this.blockSize &&
    mousePosition.y == snakeHead.y / this.blockSize) {
    console.log('Nice, hit mouse');
    return 1;
  }

  // No objects hit
  return 0;
};

// Snake Class
function Snake(ctx, blockSize, options) {
  this.ctx = ctx;
  this.type = options.type;
  this.size = options.size;
  this.weight = options.weight;
  this.color = options.color;
  this.blockSize = blockSize;
  this.position = [];
  this.direction = RIGHT;

  // Initial Position
  var x = Math.floor(this.blockSize * (this.size + 2));
  var y = Math.floor(this.blockSize * (this.size + 2));
  for (var i = this.size; i > 0; i--)
    this.position.push([x + this.blockSize * i, y]);

  // Init Drawing
  this.draw();
};

// Set Snake direction
Snake.prototype.setDirection = function(direction) {
  var possibleDirections = [];

  switch (direction) {
    case LEFT:
    case RIGHT:
      possibleDirections = [UP, DOWN];
      break;
    case UP:
    case DOWN:
      possibleDirections = [LEFT, RIGHT];
      break;
  }

  if (possibleDirections.indexOf(this.direction) > -1) {
    this.direction = direction;
  }
};

Snake.prototype.getDirection = function() {
  return this.direction;
};

Snake.prototype.draw = function() {
  this.ctx.save();
  this.ctx.fillStyle = this.color;
  for (var i = 0; i < this.position.length; i++) {
    this.ctx.fillRect(this.position[i][0], this.position[i][1], this.blockSize, this.blockSize); //x,y,width,height
  }
};

// Remove tail and move head forward in position array
Snake.prototype.move = function() {
  var x = 0,
    y = 0;

  switch (this.direction) {
    case LEFT:
      x -= this.blockSize
      break;
    case RIGHT:
      x += this.blockSize
      break;
    case UP:
      y -= this.blockSize
      break;
    case DOWN:
      y += this.blockSize
      break;
  }

  // Adjust position array - remove tail and head
  this.position.pop();
  var nextPosition = [this.position[0][0] + x, this.position[0][1] + y];
  this.position.unshift(nextPosition);
};

Snake.prototype.grow = function() {
  this.size++;
  var x = 0,
    y = 0;

  switch (this.direction) {
    case LEFT:
      x -= this.blockSize
      break;
    case RIGHT:
      x += this.blockSize
      break;
    case UP:
      y -= this.blockSize
      break;
    case DOWN:
      y += this.blockSize
      break;
  }
  //this.position.push(); conditinoally push based on direction
  var nextPosition = [this.position[0][0] + x, this.position[0][1] + y];
  this.position.unshift(nextPosition);
};

Snake.prototype.getPosition = function() {
  return this.position;
};


// Mouse Class
function Mouse(ctx, blockSize, borderCorners, options) {
  this.ctx = ctx;
  this.blockSize = blockSize;
  this.borderCorners = borderCorners;
  this.position = [];
  this.type = options.type;
  this.color = options.color;
  this.size = options.size;
  // Set init position
  this.setPosition(); // Position is number 1 through # blocks Alloud
};

Mouse.prototype.getPosition = function() {
  return this.position;
};

// Output x,y => 1 through max Blocks over
Mouse.prototype.setPosition = function() {
  // Returns a random number between 1 and max
  var rand = function (max) {
    return Math.floor(Math.random() * max) + 1;
  }
  var maxWidth = this.borderCorners[1][0];
  var maxHeight = this.borderCorners[3][1];
  var x_max = Math.floor(maxWidth / this.blockSize - 1);
  var y_max = Math.floor(maxHeight / this.blockSize - 1);
  this.position = [rand(x_max), rand(y_max)];
};

Mouse.prototype.draw = function() {
  this.ctx.save();
  this.ctx.fillStyle = this.color;
  this.ctx.beginPath();
  var radius = this.blockSize / 2;
  var x = this.position[0] * this.blockSize + radius;
  var y = this.position[1] * this.blockSize + radius;
  this.ctx.arc(x, y, radius, 0, Math.PI * 2, true);
  this.ctx.fill();
  this.ctx.restore();
};

export default Game;