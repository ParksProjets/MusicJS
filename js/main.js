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




// Dancer

var dancer = new Dancer(),
	adapter = dancer.audioAdapter;
		




// Event keydown

$(window).keydown(onKeyDown);

function onKeyDown(e) {

	if ($("input:focus").length)
		return;

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






// Events Window

function onMouseMove(e) {
	
	// Control Menu

	if (ControlsMenu.opened && e.pageX < wWidth - 255)
		ControlsMenu.close();

	else if (!ControlsMenu.opened && e.pageX > wWidth - 100)
		ControlsMenu.open();



	// Menus on the left

	else if (!Menus.isOneVisible && e.pageX < 100)
		ListMenu.open();

	else if (Menus.isOneVisible && e.pageX > 250)
		Menus.hideAll();
}


$(window).mousemove(onMouseMove);