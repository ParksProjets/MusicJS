/*

Main File

© Guillaume Gonnet
License GPLv2

*/




// Window size

var wHeight = 0, wWidth = 0;

function resize(e) {

	wHeight = $(window).height();
	wWidth = $(window).width();
}


$(window).resize(resize);
resize();




// Menus

var Menus = [];

Menus.hideAll = function() {

	for (var i = 0; i  < Menus.length; i++)
		Menus[i].hide();
}





// Dancer

var dancer = new Dancer(),
	adapter = new Dancer.adapters.webaudiobuffer(dancer);
		
dancer.audioAdapter = adapter;




// Event keydown

$(window).keydown(onKeyDown);

function onKeyDown(e) {

	if (e.keyCode == 38) {
		FFTManager.prev();
	}

	else if (e.keyCode == 40) {
		FFTManager.next();
	}

	else if (e.keyCode == 32) { // Space
		$("#switch").trigger("click");
	}

	else if (e.keyCode == 69) { // E
		EQMenu.switch();
	}

	else if (e.keyCode == 79) { // O
		FFTMenu.switch();
	}

	else if (e.keyCode == 77) { // O
		MusicMenu.switch();
	}
}
