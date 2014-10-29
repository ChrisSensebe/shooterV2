var started = false;
var paused = false;
var keys = {};

//event listeners
addEventListener("keydown",
	function(e){
	keys[e.keyCode] = true;
	if((e.keyCode >= 37)&&(e.keyCode <= 40)){
		e.preventDefault();
	}
});
addEventListener("keyup",
function(e){
	delete keys[e.keyCode];
});
addEventListener("keypress",
function(e){
	if(e.keyCode == 13 && started){
		togglePause();
	}
});

//holds all images for the game
var imageRepository = new function(){
	//background1
	this.background1 = new Image();
	this.background1.src = "background1.png";
	//background2
	this.background2 = new Image();
	this.background2.src = "background2.png";
	//player
	this.player = new Image();
	this.player.src = "player.png";
	//bullet
	this.bullet = new Image();
	this.bullet.src = "shoot1.png";
	//enemy1
	this.enemy1 = new Image();
	this.enemy1.src = "enemy1.png";
	//asteroid
	this.asteroid = new Image();
	this.asteroid.src = "asteroid50px.png";
}

//base class for drawable objects
function Drawable(){
	this.init = function(x,y,image,canvas,speed){
		this.x = x;
		this.y = y;
		this.image = image;
		this.width = image.width;
		this.height = image.height;
		this.canvas = document.getElementById(canvas);
		this.ctx = this.canvas.getContext("2d");
		this.speed = speed;

	}
	this.speed = 0;
	this.isColliding = false;
}

//Background object, inherits from Drawable
function Background(){
	this.speed = 1;
	this.draw = function(){
		this.ctx = this.canvas.getContext("2d");
		if (this.y >= this.canvas.height) {
			this.y = 0;
		}
		this.ctx.drawImage(this.image, this.x, this.y);
		this.ctx.drawImage(this.image, this.x, this.y - this.canvas.height);
		this.y += this.speed;
	}
}
Background.prototype = new Drawable();

//Player object, inherits from Drawable
function Player(){
	this.speed = 4;
	this.lives = 3;
	this.score = 0;
	this.bulletPool = new BulletPool(15);
	this.bulletPool.init();
	var fireRate = 15;
	var fireCounter = 0;
	this.updateCounters = function(){
		if(fireCounter<15){
			fireCounter++;
		}
	}
	this.draw = function(){
		this.ctx = this.canvas.getContext("2d");
		this.ctx.drawImage(this.image, this.x, this.y)
	}
	this.clearRect = function(){
		this.ctx = this.canvas.getContext("2d");
		this.ctx.clearRect(this.x,this.y,this.width,this.height);
	}
	this.inputs = function(){
		if(37 in keys || 38 in keys || 39 in keys || 40 in keys){
			this.clearRect();
			if(38 in keys && this.y >=0){
				this.y -= 4;
			}
			if(40 in keys && this.y <= (this.canvas.height-this.height)){
				this.y += 4;
			}
			if(39 in keys && this.x <= this.canvas.width-this.width){
				this.x += 4;
			}
			if (37 in keys && this.x >= 0) {
				this.x -= 4;
			}
			this.draw();
		}
		if(32 in keys && fireCounter >= fireRate){
			this.fire();
			fireCounter = 0;
		}
	}
	this.fire = function(){
		this.bulletPool.get(this.x+this.width/2 - imageRepository.bullet.width/2, this.y, 6);
	}
}
Player.prototype = new Drawable();

//creates a pool of bullets
function BulletPool(maxSize){
	var size = maxSize;
	var pool = [];
	//populates the array
	this.init = function(){
		for (var i = 0; i < size; i++) {
			var bullet = new Bullet();
			bullet.init(0,0,imageRepository.bullet,"playerShootCanvas");
			pool[i] = bullet;
		}
	}
	//grabs last item from the list, if !alive initializes it and pushes it in front of the array
	this.get = function(x,y,speed){
		if(!pool[size-1].alive){
			pool[size-1].spawn(x,y,speed);
			pool.unshift(pool.pop());
		}
	}
	//returns pool
	this.getPool = function(){
		return pool;
	}
	//draws/animate any in use bullet until we find a bullet that is not alive
	this.animate = function(){
		for (var i = 0; i < size; i++) {
			if (pool[i].alive) {
				if (pool[i].draw()) {
					pool[i].clear();
					pool.push((pool.splice(i,1))[0]);
				}
			}
			else{
				break;
			}
		}
	}
}

//Bullet object, inherits from Drawable
function Bullet(){
	//true if bullet is in use
	this.alive = false;
	//set bullet values when fired
	this.spawn = function(x,y,speed){
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.alive = true;
	}
	//draw method return true if moved offscreen --> bullet is ready to be cleared by the pool
	this.draw = function(){
		this.ctx = this.canvas.getContext("2d");
		this.ctx.clearRect(this.x,this.y,this.width,this.height);
		this.y -= this.speed;
		if(this.y <= (0 - this.height) || this.isColliding){
			return true;
		}
		else{
			this.ctx.drawImage(this.image,this.x,this.y);
		}
	}
	//resets the bullet values
	this.clear = function(){
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
		this.isColliding = false;
	}
}
Bullet.prototype = new Drawable;

//creates a pool of enemies
function EnemyPool(maxSize,enemyType){
	var canvas = document.getElementById("enemyCanvas");
	var size = maxSize;
	var pool = [];
	//populates the array
	this.init = function(){
		if(enemyType === "asteroid"){
			for (var i = 0; i < size; i++){
				var x = Math.floor(Math.random()*canvas.width);
				var y = Math.floor((Math.random()*canvas.height)-canvas.height);
				var enemy = new Enemy();
				enemy.init(x,y,imageRepository.asteroid,"enemyCanvas",3);
				pool[i] = enemy;
			}
		}
		else if(enemyType === "enemy1"){
			for (var i = 0; i < size; i++){
				var x = Math.floor(Math.random()*canvas.width);
				var y = Math.floor((Math.random()*canvas.height)-canvas.height);
				var enemy = new Type1Enemy();
				enemy.init(x,y,imageRepository.enemy1,"enemyCanvas",3);
				pool[i] = enemy;
			}
		}
	}
	//animates enemes
	this.animate = function(){
		//checks if there is already a enemy at this position
		for (var i = 0; i < pool.length; i++) {
			for (var j = 0; j < pool.length; j++) {
				if(pool[i]!=pool[j]){
					if(boxCollision(pool[i],pool[j])){
						pool[j].setNewPos();
					}
				}
			}
		}
		for (var i = 0; i < pool.length; i++) {
			pool[i].clearRect();
			pool[i].move();
			pool[i].draw();
		}
	}
	//returns pool
	this.getPool = function(){
		return pool;
	}
}

//Enemy object, inherits from Drawable
function Enemy(){
	//set new position for enemy
	this.setNewPos = function(){
		this.clearRect();
		this.y = Math.floor((Math.random()*this.canvas.height)-this.canvas.height);
		this.x = Math.floor(Math.random()*this.canvas.width);
		this.isColliding = false;
	}
	//clears enemy on canvas
	this.clearRect = function(){
		this.ctx.clearRect(this.x,this.y,this.width,this.height);
	}
	//moves enemy
	this.move = function(){
		if (this.y > this.canvas.height || this.isColliding) {
			this.setNewPos();
		}
		else{
			this.y += this.speed;
		}
	}
	//draws enemy on canvas
	this.draw = function(){
		this.ctx.drawImage(this.image, this.x, this.y);
	}
}
Enemy.prototype = new Drawable;

//type 1 enemy
function Type1Enemy(){
	this.direction = "";
	this.move = function(){
		if(this.isColliding){
			this.setNewPos();
		}
		if (this.direction === "down") {
			this.y += this.speed;
			if (this.y > this.canvas.height*3/4) {
				this.direction = "left";
			}
		}
		else if(this.direction === "up" ){
			this.y -= this.speed;
			if (this.y < this.canvas.height/4){
				this.direction = "right";
			}
		}
		else if(this.direction === "right"){
			this.x += this.speed;
			if(this.x > this.canvas.width*3/4){
				this.direction = "down";
			}
		}
		else if(this.direction === "left"){
			this.x -= this.speed;
			if(this.x < this.canvas.width/4){
				this.direction = "up";
			}
		}
		else{
			this.y += this.speed;
			if (this.y > this.canvas.height/4) {
				this.direction = "right";
			}
		}
	}
}
Type1Enemy.prototype = new Enemy;

//box collision function
function boxCollision(drawable1,drawable2){
	var widthCollide = (drawable1.x > (drawable2.x-drawable1.width) && drawable1.x < (drawable2.x+drawable2.width));
	var heightCollide = (drawable1.y > (drawable2.y-drawable1.height) && drawable1.y < (drawable2.y+drawable2.height));
	return (widthCollide && heightCollide);
}

//pixel level collision detection
function pixelLevelCollision(drawable1,drawable2){

	var collisionBoxX = drawable1.x < drawable2.x ? drawable2.x : drawable1.x;
	var collisionBoxY = drawable1.y < drawable2.y ? drawable2.y : drawable1.y;
	var xMax = (drawable1.width + drawable1.x) < (drawable2.width + drawable2.x) ? (drawable1.width + drawable1.x) : (drawable2.width + drawable2.x);
	var collisionBoxWidth = xMax - collisionBoxX;
	var yMax = (drawable1.height + drawable1.y) < (drawable2.height + drawable2.y) ? (drawable1.height + drawable1.y) : (drawable2.height + drawable2.y);
	var collisionBoxHeight = yMax - collisionBoxY;

	var context1 = drawable1.canvas.getContext('2d');
	var context1Data = context1.getImageData(collisionBoxX,collisionBoxY,collisionBoxWidth,collisionBoxHeight).data;

	var context2 = drawable2.canvas.getContext('2d');
	var context2Data = context2.getImageData(collisionBoxX,collisionBoxY,collisionBoxWidth,collisionBoxHeight).data;

	for (var i = 3; i < context1Data.length; i += 4) {
		if (context1Data[i]>0 && context2Data[i]>0) {
			return true;
		}
	}
	return false;
}

function togglePause(){
	if(paused){
		interval = setInterval(gameLoop,1000/60);
		document.getElementById("gameStatus").innerHTML = "";
	}
	else{
		clearInterval(interval);
		document.getElementById("gameStatus").innerHTML = "Paused";
	}
	paused = !paused;
}

//clears player, enemies, and bullets canvases
function clearCanvases(){
	var playerCanvas = document.getElementById("playerCanvas");
	var enemiesCanvas = document.getElementById("enemyCanvas");
	var playerBulletsCanvas = document.getElementById("playerShootCanvas");
	var playerCtx = playerCanvas.getContext("2d");
	var enemiesCtx = enemiesCanvas.getContext("2d");
	var playerBulletsCtx = playerBulletsCanvas.getContext("2d");
	playerCtx.clearRect(0,0,playerCanvas.width,playerCanvas.height);
	enemiesCtx.clearRect(0,0,enemiesCanvas.width,enemiesCanvas.height);
	playerBulletsCtx.clearRect(0,0,playerBulletsCanvas.width,playerBulletsCanvas.height);
}

function newGame(){
	clearCanvases();
	document.getElementById("gameStatus").innerHTML = "";
	//background init
	background1 = new Background();
	background1.init(0,0,imageRepository.background1,"backgroundCanvas1");
	background2 = new Background();
	background2.init(0,0,imageRepository.background2,"backgroundCanvas2");
	background2.speed = 2;
	//player init
	player = new Player();
	player.init(375,475,imageRepository.player,"playerCanvas");
	player.draw();
	//enemyPool init
	asteroidPool = new EnemyPool(10,"asteroid");
	asteroidPool.init();
	enemyPool1 = new EnemyPool(5,"enemy1");
	enemyPool1.init();
	//starts game loop
	started = true;
	interval = setInterval(gameLoop,1000/60);
}

function game(){
	if(!started){
		newGame();
	}
}

function gameLoop(){

	inputs();
	gameLogic();
	draw();

	function inputs(){
		player.inputs();
	}

	function gameLogic(){
		player.updateCounters();
		collisions();
	}
	function draw(){
		background1.draw();
		document.getElementById("backgroundCanvas2").getContext("2d").clearRect(0,0,800,600);
		background2.draw();
		player.bulletPool.animate();
		asteroidPool.animate();
		enemyPool1.animate();
		updateInterface();
	}
	function collisions(){
		//player wih enemies
		for (var i = 0; i < asteroidPool.getPool().length; i++) {
			if(collision(asteroidPool.getPool()[i],player)){
				asteroidPool.getPool()[i].isColliding = true;
				player.lives--;
			}
		}
		for(var i=0;i<enemyPool1.getPool().length;i++){
			if(collision(enemyPool1.getPool()[i],player)){
				enemyPool1.getPool([i]).isColliding = true;
				player.lives--;
			}
		}
		//player bullets with enemies
		for(var i=0;i<asteroidPool.getPool().length;i++){
			for(var j=0;j<player.bulletPool.getPool().length;j++){
				if(player.bulletPool.getPool()[j].alive){
					if(collision(asteroidPool.getPool()[i],player.bulletPool.getPool()[j])){
						asteroidPool.getPool()[i].isColliding = true;
						player.bulletPool.getPool()[j].isColliding = true;
						player.score++;
					}
				}
			}
		}
		for(var i=0;i<enemyPool1.getPool().length;i++){
			for(var j=0;j<player.bulletPool.getPool().length;j++){
				if(player.bulletPool.getPool()[j].alive){
					if(collision(enemyPool1.getPool()[i],player.bulletPool.getPool()[j])){
						enemyPool1.getPool()[i].isColliding = true;
						player.bulletPool.getPool()[j].isColliding = true;
						player.score++;
					}
				}
			}
		}
		//type1Enemy with asteroids
		for(var i=0;i<asteroidPool.getPool().length;i++){
			for(var j=0;j<enemyPool1.getPool().length;j++){
				if(boxCollision(asteroidPool.getPool()[i],enemyPool1.getPool()[j])){
					enemyPool1.getPool()[j].clearRect();
					enemyPool1.getPool()[j].setNewPos();
				}
			}
		}
	}
	//game interface
	function updateInterface(){
		document.getElementById("lives").innerHTML = "Lives: " + player.lives;
		document.getElementById("score").innerHTML = "Score: " + player.score;
		if (player.lives<=0) {
			document.getElementById("gameStatus").innerHTML = "Game Over";
			clearInterval(interval);
			started = false;
		}
	}
	//collision function between two drawable objects
	function collision(drawable1,drawable2){
		if (boxCollision(drawable1,drawable2)){
			return pixelLevelCollision(drawable1,drawable2);
		}
	}
}