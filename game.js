var imageRepository = new function(){
	//background1
	this.background1 = new Image();
	this.background1.src = "background1.png";
}

function draw(){
	var ctx  = document.getElementById("gameCanvas").getContext("2d");
	ctx.drawImage(imageRepository.background1, 0, 0);
}