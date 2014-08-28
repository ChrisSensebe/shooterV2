function draw(){
	var ctx = document.getElementById("gameCanvas").getContext("2d");
	var img = new Image();
	img.src = "background1.png";
	ctx.drawImage(img,0,0);
}