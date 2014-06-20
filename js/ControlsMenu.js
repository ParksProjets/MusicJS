/*

Fichier de gestion du menu et des controls

*/


// Utlis

function parseTime(time) {
	var minutes = Math.floor(time / 60);
	var secondes = Math.floor(time - minutes*60)
	return ((minutes < 10) ? "0"+minutes : minutes) + ":" + ((secondes < 10) ? "0"+secondes : secondes);
}





// Controls

var $progress = $("#progress div"), 
	$temps1 = $("#temps span:eq(0)"), 
	$temps2 = $("#temps span:eq(1)");

var timer;


$("#switch").click(function() {
	if (dancer.isPlaying())
		dancer.pause();
	else
		dancer.play();
});


$("#progress").click(function(e) {
	dancer.setTime((e.pageX - $(this).offset().left) * dancer.getDuration() / 200);
	dancerUpdate();
});


$("#stop").click(function() {
	dancer.pause();
	FFTManager.resetAll();

	dancer.setTime(0);
	dancerUpdate();
});



dancer.bind("play", function() {

	$("#play").hide();
	$("#pause").show();

	timer = setInterval(dancerUpdate, 1000 / 30);
	$temps2.text(parseTime(dancer.getDuration()));

});



dancer.bind("pause", function() {

	$("#pause").hide();
	$("#play").show();
	if(timer)
		clearInterval(timer);

});



function dancerUpdate() {
	$progress.css("left", (dancer.getTime() * 200 / dancer.getDuration()) + "px");
	$temps1.text(parseTime(dancer.getTime()));
}





// Menu

var menuOpened = false;

function ouvreMenu() {
	menuOpened = true;
	$("#menu").css("right", 0);
}

function fermeMenu() {
	menuOpened = false;
	$("#menu").css("right", "-260px");
}





// Options

$("#params").hover(function() {
	$("#menu .contents").css("top", (- $(this).height() + 19) + "px");
}, function() {
	$("#menu .contents").css("top", 0); 
});


$("#btnEQ").click(function() {
	EQMenu.switch();
});






// Events window

$(window).mousemove(onMouseMove);


function onMouseMove(e) {
	if(menuOpened) {
		if(e.pageX < wWidth - 255)
			fermeMenu();
	}
	else {
		if(e.pageX > wWidth - 80)
			ouvreMenu();
	}
}


