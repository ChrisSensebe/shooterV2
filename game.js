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
}

//base class for drawable objects
function Drawable(){
	this.init = function(x,y,width,height,image){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.image = image;
	}
	this.speed = 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;
}
//Background object, inherits from Drawable
function Background(){
	this.speed = 1;
	this.draw = function(){
		if (this.y >= this.canvasHeight) {
			this.y = 0;
		}
		this.ctx = document.getElementById("backgroundCanvas").getContext("2d");
		this.ctx.drawImage(this.image, this.x, this.y);
		this.ctx.drawImage(this.image, this.x, this.y - this.canvasHeight);
		this.y += this.speed;
	}
}
Background.prototype = new Drawable();
//Player object, inherits from Drawable
function Player(){
	this.speed = 4;
	this.bulletPool = new BulletPool(15);
	this.bulletPool.init();
	this.ctx = document.getElementById("playerCanvas").getContext("2d");
	var fireRate = 15;
	var counter = 0;
	this.count = function(){
		if(counter<15){
			counter++;
		}
	}
	this.draw = function(){
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
		if(32 in keys && counter >= fireRate){
			this.fire();
			counter = 0;
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
	this.ctx = document.getElementById("playerCanvas").getContext("2d");
	//set bullet values when fired
	this.spawn = function(x,y,speed){
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.alive = true;
	}
	//draw method return true if moved offscreen --> bullet is ready to be cleared by the pool
	this.draw = function(){
		this.ctx.clearRect(this.x-1,this.y,this.width+2,this.height);
		this.y -= this.speed;
		if(this.y <= (0 - this.height)){
			return true;
		}
		else{
			this.ctx.drawImage(this.image,this.x,this.y);
		}
	}
	//reset the bullet valuesb 
	this.clear = function(){
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
	}
}
Bullet.prototype = new Drawable;

//creates a pool of bullets
function BulletPool(maxSize){
	var size = maxSize;
	var pool = [];
	//populates the array
	this.init = function(){
		for (var i = 0; i < size; i++) {
			var bullet = new Bullet();
			bullet.init(0,0,10,10,imageRepository.bullet);
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

function game(){
	//background initialisation
	background1 = new Background();
	background1.init(0,0,0,0,imageRepository.background1);
	background1.canvasWidth = document.getElementById("backgroundCanvas").width;
	background1.canvasHeight = document.getElementById("backgroundCanvas").height;

	//player initialisation
	player = new Player();
	player.init(375,475,25,25,imageRepository.player);

	setInterval(backgroundLoop, 1000/60);
	setInterval(playerLoop, 1000/60);

	function backgroundLoop(){
		background1.draw();
	}
	function playerLoop(){
		player.count();
		player.inputs();
		player.draw();
		player.bulletPool.animate();
	}
}