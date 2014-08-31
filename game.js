var imageRepository = new function(){
	//background1
	this.background1 = new Image();
	this.background1.src = "background1.png";
}

function draw(){
	var ctx = document.getElementById("gameCanvas").getContext("2d");
	ctx.drawImage(imageRepository.background1, 0, 0);
}

//base class for drawable objects
function Drawable(){
	this.init = function(x,y){
		this.x = x;
		this.y = y;
	}
	this.speed = 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;
}

//background object
function Background(){
	this.speed = 1;
	this.draw = function(){
		this.ctx = document.getElementById("gameCanvas").getContext("2d");
		this.ctx.drawImage(imageRepository.background1, this.x, this.y);
	}
}

Background.prototype = new Drawable();

function game(){
	this.background1 = new Background();
	this.background1.init(0,0);
	this.background1.draw();
}