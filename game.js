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


//holds all images for the game
var imageRepository = new function(){
	//background1
	this.background1 = new Image();
	this.background1.src = "background1.png";
	//player
	this.player = new Image();
	this.player.src = "player.png";
	//bullet
	this.bullet = new Image();
	this.bullet.src = "shoot1.png";
	//enemy1
	this.enemy1 = new Image();
	this.enemy1.src = "enemy1.png"
}
//Text object
function Text(){
	this.init = function(x,y,txt){
		this.x = x;
		this.y = y;
		this.txt = txt;
	}
	this.draw = function(){
		this.ctx = document.getElementById("UICanvas").getContext("2d");
		this.ctx.font = "30px Arial";
		this.ctx.fillStyle ="blue";
		this.ctx.clearRect(this.x,this.y-30,200,30);
		this.ctx.fillText(this.txt,this.x,this.y);
	}
}
//base class for drawable objects
function Drawable(){
	this.init = function(x,y,image,canvas){
		this.x = x;
		this.y = y;
		this.image = image;
		this.width = image.width;
		this.height = image.height;
		this.canvas = document.getElementById(canvas);
	}
	this.speed = 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;
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
	this.invincibleTimer = 30;
	this.bulletPool = new BulletPool(15);
	this.bulletPool.init();
	var fireRate = 15;
	var fireCounter = 0;
	this.count = function(){
		if(fireCounter<15){
			fireCounter++;
		}
		if (this.invincibleTimer<30) {
			this.invincibleTimer++;
		}
	}
	this.draw = function(){
		this.ctx = this.canvas.getContext("2d");
		this.ctx.drawImage(this.image, this.x, this.y)
	}
	this.inputs = function(){
		if(37 in keys || 38 in keys || 39 in keys || 40 in keys){
			this.ctx.clearRect(this.x,this.y,this.width,this.height);
			if(38 in keys && this.y >=0){
				this.y -= 4;
			}
			if(40 in keys && this.y <= 575){
				this.y += 4;
			}
			if(39 in keys && this.x <= 775){
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
		this.bulletPool.get(this.x+7, this.y, 6);
	}
}
Player.prototype = new Drawable();
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
		this.ctx.clearRect(this.x-1,this.y,this.width+2,this.height);
		this.y -= this.speed;
		if(this.y <= (0 - this.height)){
			return true;
		}
		else{
			this.ctx.drawImage(this.image,this.x,this.y);
		}
	}
	//reset the bullet values
	this.clear = function(){
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
	}
}
Bullet.prototype = new Drawable;
//Enemy object, inherits from Drawable
function Enemy(){
	this.speed = 4;
	this.setNewPos = function(){
		this.y = Math.floor((Math.random()*600)-600);
		this.x = Math.floor(Math.random()*800)
	}
	this.draw = function(){
		this.ctx = this.canvas.getContext("2d");
		this.ctx.clearRect(this.x,this.y,this.width,this.height);
		this.y += this.speed;
		this.ctx.drawImage(this.image, this.x, this.y);
		if (this.y > 650) {
			this.setNewPos();
		}
	}
}
Enemy.prototype = new Drawable;

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
//creates a pool of enemies
function EnemyPool(maxSize){
	var size = maxSize;
	var pool = [];
	//populates the array
	this.init = function(){
		for (var i = 0; i < size; i++){
			var x = Math.floor(Math.random()*800);
			var y = Math.floor((Math.random()*600)-600);
			var enemy = new Enemy();
			enemy.init(x,y,imageRepository.enemy1,"enemyCanvas");
			pool[i] = enemy;
		}
	}
	//animates enemies
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
			pool[i].draw();
		}
	}
	//collison with player
	this.collideWith = function(playerObj){
		for (var i = 0; i < pool.length; i++) {
			if(boxCollision(pool[i],playerObj)){
				if(pixelLevelCollision(pool[i],playerObj)){
					if(playerObj.invincibleTimer==30){
						playerObj.invincibleTimer = 0;
						playerObj.lives--;
					}
				}
			}
		}
	}
}

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

function game(){

	//background init
	background1 = new Background();
	background1.init(0,0,imageRepository.background1,"backgroundCanvas");

	//player init
	player = new Player();
	player.init(375,475,imageRepository.player,"playerCanvas");

	//enemyPool init
	enemyPool1 = new EnemyPool(10);
	enemyPool1.init();

	//hud
	livesText = new Text();
	livesText.init(20,580,"lives: ");

	setInterval(gameLoop,1000/60);

	function gameLoop(){
		backgroundLoop();
		playerLoop();
		enemyLoop();
		hudLoop();
	}

	function backgroundLoop(){
		background1.draw();
	}
	function playerLoop(){
		player.count();
		player.inputs();
		player.draw();
		player.bulletPool.animate();
	}
	function enemyLoop(){
		enemyPool1.animate();
		enemyPool1.collideWith(player);
	}
	function hudLoop(){
		livesText.draw();
		livesText.txt = "lives: " + player.lives;
	}
}