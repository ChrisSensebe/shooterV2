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
		if (this.y >= this.canvasHeight) {
			this.y = 0;
		}
		this.ctx = document.getElementById("backgroundCanvas").getContext("2d");
		this.ctx.drawImage(this.image, this.x, this.y);
		this.ctx.drawImage(this.image, this.x, this.y - this.canvasHeight);
		this.y += this.speed;
	}
}
//Background inherits from Drawable
Background.prototype = new Drawable();

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