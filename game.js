var preloadTotal = 1;
var background1 = new image();

function startGame(){
	preloadAssets();
}

function preloadAssets(){
	imgBackground1.onload = preloadUpdate();
	imgBackground1.src = "background1.png";
}

function preloadUpdate(){
	preloadCount++;
	if(preloadCount == preloadTotal){
		launchGame();
	}
}