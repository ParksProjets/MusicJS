/*

Fichier de gestion des FFTs

*/


var FFTManager = [];

FFTManager.current = 0;



FFTManager.prev = function() {
	
	this[this.current].off();
	$("#fft" + this.current).hide();
	
	this.current = this.current <= 0 ? this.length-1 : this.current-1;
		
	this[this.current].on();
	$("#fft" + this.current).show();
}



FFTManager.next = function() {
	
	this[this.current].off();
	$("#fft" + this.current).hide();
	
	this.current = this.current >= this.length-1 ? 0 : this.current+1;
		
	this[this.current].on();
	$("#fft" + this.current).show();
}



FFTManager.resetAll = function() {
	for (var i = 0; i < FFTManager.length; i++) {
		if (FFTManager[i].reset)
			FFTManager[i].reset();
	}
}




FFTManager.update = function() {
	FFTManager[FFTManager.current].update();
}




FFTManager.onPlay = function() {

}

FFTManager.onPause = function() {

}



FFTManager.onKick = function() {
	if (FFTManager[FFTManager.current].onKick)
		FFTManager[FFTManager.current].onKick();
}

FFTManager.offKick = function() {
	if (FFTManager[FFTManager.current].offKick)
		FFTManager[FFTManager.current].offKick();
}



FFTManager.onResize = function() {
	for (var i = 0; i < FFTManager.length; i++) {
		if (FFTManager[i].onResize)
			FFTManager[i].onResize(wHeight, wWidth);
	}
}







dancer.bind("update", FFTManager.update);
//dancer.bind("play", FFTManager.onPlay);
//dancer.bind("pause", FFTManager.onPause);

$(window).resize(FFTManager.onResize);



// Kick

kick = dancer.createKick({

	onKick: FFTManager.onKick,

	offKick: FFTManager.offKick,
	
	decay: 0.02,
	threshold: 0.25,
	frequency: [0,10]

}).on();