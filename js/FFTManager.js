/*

Manager of FFTs

© Guillaume Gonnet
License GPLv2

*/



var FFTManager = [];

FFTManager.current = 0;


FFTManager.get = function() {
	return FFTManager[FFTManager.current];
}


FFTManager.set = function(index) {

	if (index < 0 || index >= FFTManager.length)
		return;

	$("#fft" + FFTManager.current).hide();
	$("#fft" + index).show();

	if (FFTManager[FFTManager.current].off)
		FFTManager[FFTManager.current].off();

	if (FFTManager[index].on)
		FFTManager[index].on();

	FFTManager.current = index;
}



FFTManager.prev = function() {

	FFTManager.set(FFTManager.current <= 0 ? FFTManager.length - 1 : FFTManager.current - 1);
}



FFTManager.next = function() {
	
	FFTManager.set(FFTManager.current >= FFTManager.length - 1 ? 0 : FFTManager.current + 1);
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
	
	if (FFTManager[FFTManager.current].onPlay)
		FFTManager[FFTManager.current].onPlay();
}

FFTManager.onPause = function() {
	
	if (FFTManager[FFTManager.current].onPause)
		FFTManager[FFTManager.current].onPause();
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




// Events

dancer.bind("update", FFTManager.update);
dancer.bind("play", FFTManager.onPlay);
dancer.bind("pause", FFTManager.onPause);

$(window).resize(FFTManager.onResize);




// Kick
/*
kick = dancer.createKick({

	onKick: FFTManager.onKick,

	offKick: FFTManager.offKick,
	
	decay: 0.02,
	threshold: 0.25,
	frequency: [0,10]

}).on();
*/