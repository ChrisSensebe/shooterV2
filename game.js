var imageRepository = new function(){
	//background1
	this.background1 = new Image();
	this.background1.src = "background1.png";
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

//background object
function Background(){
	this.speed = 1;
	this.draw = function(){
		this.y += this.speed;
		this.ctx = document.getElementById("gameCanvas").getContext("2d");
		this.ctx.drawImage(this.image, this.x, this.y);
	}
}

//Background inherits from Drawable
Background.prototype = new Drawable();

function game(){
	this.background1 = new Background();
	this.background1.init(0,0,imageRepository.background1);

	setInterval(gameLoop, 1000/60);

	function gameLoop(){
		this.background1.draw();
	}
}