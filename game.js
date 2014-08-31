var keys = {};

//event listeners
addEventListener("keydown",
	function(e){
	touches[e.keyCode] = true;
	if((e.keyCode >= 37)&&(e.keyCode <= 40)){
		e.preventDefault();
	}
});

addEventListener("keyup",
function(e){
	delete touches[e.keyCode];
});


//holds all images for the game
var imageRepository = new function(){
	//background1
	this.background1 = new Image();
	this.background1.src = "background1.png";
	//player
	this.player = new Image;
	this.player.src = "player.png"
}

//base class for drawable objects
function Drawable(){
	this.init = function(x,y,image){
		this.x = x;
		this.y = y;
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
	this.draw = function(){
		this.ctx = document.getElementById("playerCanvas").getContext("2d");
		this.ctx.drawImage(this.image, this.x, this.y)
	}
	this.move = function(){
		if(38 in touches && this.y >=0){
			this.y -= playerSpeed;
		}
		if(40 in touches && this.y <= 575){
			this.y += playerSpeed;
		}
		if(39 in touches && this.x <= 775){
			this.x += playerSpeed;
		}
		if (37 in touches && this.x >= 0) {
			this.x -= playerSpeed;
		}
	}
	this
} 

function game(){
	//background initialisation
	background1 = new Background();
	background1.init(0,0,imageRepository.background1);
	background1.canvasWidth = document.getElementById("backgroundCanvas").width;
	background1.canvasHeight = document.getElementById("backgroundCanvas").height;

	setInterval(backgroundLoop, 1000/60);

	function backgroundLoop(){
		background1.draw();
	}
}