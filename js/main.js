/*

Fichier principal

*/






var wHeight = 0, wWidth = 0;

function resize(e) {

	wHeight = $(window).height();
	wWidth = $(window).width();

	//$("body").height(wHeight).width(wWidth);
	$("#params").css("top", (wHeight - 25) + "px");

}


$(window).resize(resize);
resize();





// Dancer

var dancer = new Dancer(),
	adapter = new Dancer.adapters.webaudiobuffer(dancer);
		
dancer.audioAdapter = adapter;


var kick;





// Event keydown

$(window).keydown(onKeyDown);

function onKeyDown(e) {

	if (e.keyCode == 38) {
		FFTManager.prev();
	}

	else if (e.keyCode == 40) {
		FFTManager.next();
	}

	else if (e.keyCode == 32) { // Espace
		$("#switch").trigger("click");
	}

	else if (e.keyCode == 69) { // E
		EQMenu.switch();
	}
}
