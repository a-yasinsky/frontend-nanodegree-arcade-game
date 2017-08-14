"use strict";
// Generates random int to set columns and rows
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// Enemies our player must avoid
var Enemy = function(x = 0, y = 0, speed = 1) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
	this.x = x;
	this.y = y;
	this.speed = speed;
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
	this.updateCoords(dt);
	this.onChangeCoords();
};

//Update enemy's coordinates
Enemy.prototype.updateCoords = function(dt) {
	this.x += this.speed * dt;
	if(this.x >= Resources.colWidth * Resources.numCols) this.x = 0;
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
	// Variable to set Enemy not lower then botton of row
	var deltaY = 15;
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y - deltaY);
};
// Checks if the player is caught
Enemy.prototype.checkCaught = function() {
	var deltaX = 25;
	if (!(this instanceof Player))
		if(this.y === player.y &&
			this.x + Resources.colWidth >= player.x + deltaX &&
			this.x <= player.x + deltaX)
			player.caught();
};
// Checks whether the player is caught and whether he has reached the finish line
Enemy.prototype.onChangeCoords = function() {
	this.checkCaught();
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(col = 0, row = 0) {
	this.x = 0;
	this.y = 0;
	this.currentCol = col;
	this.currentRow = row;
	this.sprite = 'images/char-boy.png';
	
	// Counts x,y values to drowing
	this.updateCoords = function(dt = 0) {
		this.x = this.currentCol * Resources.colWidth;
		this.y = this.currentRow * Resources.rowHeight;
	};
	// Initial coordinates counting
	this.updateCoords();
};
// Enemy's methods are inherited
Player.prototype = Object.create(Enemy.prototype);
// Set the right constructor
Player.prototype.constructor = Player;
// Process a pressed key with Player 'movementObj' object, checks if where gems on the way
Player.prototype.handleInput = function(side){
	game.canMove() && side && function(side) {
		this.movementObj[side].call(this);
		this.checkGem();
	}.call(this,side);
};
// Checks the player has reached the finish line
Player.prototype.onChangeCoords = function() {
	this.checkWin();
};
// Cheks if player has reached the finish line
Player.prototype.checkWin = function() {
	if(this.currentRow == 0) this.win();
};
// Actions when player reaches the finish line. Checks if it time to add new rock.
Player.prototype.win = function() {
	this.reset();
	game.score += 100;
	game.renderScoreLives();
	if(game.score % 500 === 0 && allRocks.length < 15) {
		allRocks.push(new Rock());
	}
};
// Actions when player caught by enemies. Checks if it time to show game over screen.
Player.prototype.caught = function() {
	this.reset();
	game.lives -= 1;
	game.renderScoreLives();
	if(game.lives <= 0) game.showGameOver();
};
// Checks rocks on player's way
Player.prototype.noRocks =  function(newRow, newCol) {
	return ! allRocks.some(function(element) {
		return (element.getCoords().x === newCol &&
		   element.getCoords().y === newRow);
	});
};
// Used to process a pressed key
Player.prototype.movementObj = {
	'up': function(){
		if((this.currentRow - 1) >= 0 &&
			this.noRocks(this.currentRow - 1, this.currentCol))
			   this.currentRow--;
	},
	'down': function(){
		if((this.currentRow + 1) < Resources.numRows &&
			this.noRocks(this.currentRow + 1, this.currentCol))
			   this.currentRow++;
	},
	'left': function(){
		if((this.currentCol - 1) >= 0 &&
			this.noRocks(this.currentRow, this.currentCol - 1))
			   this.currentCol--;
	},
	'right': function(){
		if((this.currentCol + 1) < Resources.numCols &&
			this.noRocks(this.currentRow, this.currentCol + 1))
			   this.currentCol++;
	}
};
// Checks gems on player's way
Player.prototype.checkGem = function() {
	if(gem.getCoords().x === this.currentCol &&
	   gem.getCoords().y === this.currentRow){
		   game.findGem();
		   gem.reset();
	   }
};
// Sets start values to players coordinates
Player.prototype.reset = function() {
	this.currentCol = 2;
	this.currentRow = 5;
};

// Game managment functions
var Game = function(global) {
	var settings = {
		level: 1,
		character: "boy",
		moveIsAvailable: false
	};

	this.score = 0;

	this.lives = 3;
	
	// Init the game, sets initial values of global variables
	this.init = function() {
		global.allEnemies = [new Enemy(0, 1 * Resources.rowHeight, 50)];
		global.player = new Player(2,5);
		global.allRocks = [];
		global.gem = new Gem();
	};
	// Resets the game
	this.reset = function() {
		document.getElementById('player-choose').style.display = 'block';
		document.getElementById('player-choose-overlay').style.display = 'block';
		document.getElementById('game-over').style.display = 'none';
		settings.moveIsAvailable = false;
		this.score = 0;
		this.lives = 3;
		this.renderScoreLives();
	};
	// Returns player's state to lock movements under settings screen
	this.canMove = function () {
		return settings.moveIsAvailable;
	};
	// Sets initianl values of the game
	// Parametrs: playerImage - choosen sprite, level - choosen level
	this.start = function (playerImage, level) {
		var enemiesSpeed = 50 * level;
		var enemiesAmount = 2 * level;
		var enemyNewCoords = { x:0, y:0 };
		var newSprite = ['images/char-',playerImage,'.png'].join("");
		player.sprite = newSprite;
		allEnemies.length = 0;
		allRocks.length = 0;
		gem.reset();
		for(var i = 0; i < enemiesAmount; i++) {
			enemyNewCoords.x = getRandomInt(1,500);
			enemyNewCoords.y = getRandomInt(1,4) * Resources.rowHeight;
			allEnemies.push(new Enemy(enemyNewCoords.x, enemyNewCoords.y , getRandomInt(50,enemiesSpeed)));
		}
		settings.moveIsAvailable = true;
	};
	// Shows game over screen
	this.showGameOver = function() {
		document.getElementById('player-choose-overlay').style.display = 'block';
		document.getElementById('game-over').style.display = 'block';
		settings.moveIsAvailable = false;
	}
	// The player found a gem
	this.findGem = function() {
		this.score += 100;
		this.renderScoreLives();
	};
};
// Draws score and lives
Game.prototype.renderScoreLives = function() {
	var livesHTML = "";
	document.getElementById('score').innerHTML = ["Score:",this.score].join(" ");
	for (var i = 0; i < this.lives; i++) livesHTML += '<img src="images/Heart.png" class="heart" alt="heart">';
	document.getElementById('lives').innerHTML = livesHTML;
};

// Rocks wich player cant pass throught
var Rock = function() {
	this.x = 0;
	this.y = 0;
	var currentCol = 0;
	var currentRow = 0;
	this.sprite = 'images/Rock.png';
	// Recursive function generates new UNREPEATED coordinates
	function generateNewCoords() {
		var rockNewCoords = { x:0, y:0 };
		rockNewCoords.x = getRandomInt(0,5);
		rockNewCoords.y = getRandomInt(1,4);
		for(var i = 0; i < allRocks.length; i++) {
			if(allRocks[i].getCoords().x === rockNewCoords.x &&
			   allRocks[i].getCoords().y === rockNewCoords.y) {
				   rockNewCoords = generateNewCoords(allRocks);
				   return rockNewCoords;
			   }
		}
		return rockNewCoords;
	}
	// Counts x,y values to drowing
	this.updateCoords = function() {
		this.x = currentCol * Resources.colWidth;
		this.y = currentRow * Resources.rowHeight;
	};
	// Gets column and row
	this.getCoords = function() {
		return { x: currentCol, y: currentRow};
	};
	// Inits the object
	function init() {
		var rockNewCoords = generateNewCoords();
		currentCol = rockNewCoords.x;
		currentRow = rockNewCoords.y;
		this.updateCoords();
	}
	
	init.call(this);
};

// Draw the rock on the screen, required method for game
Rock.prototype.render = function() {
	var deltaY = 20;
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y - deltaY);
};

// Gems wich increase the score
var Gem = function(col = -1, row = -1) {
	this.x = 0;
	this.y = 0;
	var currentCol = col;
	var currentRow = row;
	this.sprite = 'images/Gem Green.png';
	// Values to calculate appearing time
	this.allTime = 0;
	this.delayApear = 12;
	this.delayDisapear = 18;
	this.setted = false;
	// Sets column and row values
	this.setCoords = function(col,row) {
		currentCol = col;
		currentRow = row;
		this.updateCoords();
	};
	// Counts x,y values to drowing
	this.updateCoords = function() {
		this.x = currentCol * Resources.colWidth;
		this.y = currentRow * Resources.rowHeight;
	};
	// Return column and row values
	this.getCoords = function() {
		return { x: currentCol, y: currentRow};
	};
	// Reset initial values of first gem
	this.reset = function() {
		this.setCoords(-1, -1);
		this.setted = false;
		this.allTime = 0;
	};
	// Initial coordinates counting
	this.updateCoords();
};

// Enemy's methods are inherited
Gem.prototype = Object.create(Rock.prototype);
// Set the right constructor
Gem.prototype.constructor = Gem;
// Updates the internal counter, displays or hides the gem
Gem.prototype.update = function(dt) {
	this.allTime += dt;
	if(this.allTime >= this.delayApear && !this.setted) {
		this.setCoords(getRandomInt(0,5), getRandomInt(1,4));
		this.setted = true;
	}
	if(this.allTime >= this.delayDisapear && this.setted) {
		this.reset();
	}
};
// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var game = new Game(this);
game.init();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
// This listens for click on Start button and starts the game
startButton.addEventListener('click', function(e) {
	document.getElementById('player-choose').style.display = 'none';
	document.getElementById('player-choose-overlay').style.display = 'none';
	game.start(
			   document.querySelector('input[name="player"]:checked').value,
			   document.querySelector('input[name="level"]:checked').value
			  );
});
// This listens for click on Restart button on game over screen
restartButton.addEventListener('click', function(e) {
	game.reset();
});