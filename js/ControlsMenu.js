/*

Menus

© Guillaume Gonnet
License GPLv2

*/



// Functions: control player

dancer.bind("end", function() {
	FFTManager.resetAll();
	dancerUpdate();
});






// Controls HTML

var $progress = $("#progress div"), 
	$temps1 = $("#temps span:eq(0)"), 
	$temps2 = $("#temps span:eq(1)");

var timer = null;


$("#switch").click(function() {

	if (dancer.isPlaying())
		Player.pause();
	else
		Player.play();
});


$("#progress").click(function(e) {
	dancer.setTime((e.pageX - $(this).offset().left) * dancer.getDuration() / 200);
	dancerUpdate();
});


$("#stop").click(Player.stop);




$("#next").click(Player.next);

$("#last").click(Player.last);






dancer.bind("play", function() {

	$("#play").hide();
	$("#pause").show();

	timer = setInterval(dancerUpdate, 1000 / 30);
	$temps2.text(parseTime(dancer.getDuration()));
});



dancer.bind("pause", function() {

	$("#pause").hide();
	$("#play").show();
	
	clearInterval(timer);
	dancerUpdate();
});



function dancerUpdate() {
	$progress.css("left", (dancer.getTime() * 200 / dancer.getDuration()) + "px");
	$temps1.text(parseTime(dancer.getTime()));
}





// Menu

var menuOpened = false;

var Menu = {

	opened: false,

	open: function() {
		$("#menu").css("right", 0);
		Menu.opened = true;
	},

	close: function() {
		$("#menu").css("right", "-260px");
		Menu.opened = false;
	}
}





// Options

$("#params").hover(function() {
	
	$("#menu .contents").css("top", (- $(this).height() + 19) + "px");
}, function() {
	
	$("#menu .contents").css("top", 0); 
});






// Events Window

function onMouseMove(e) {
	
	if (Menu.opened && e.pageX < wWidth - 255)
		Menu.close();

	else if (!Menu.opened && e.pageX > wWidth - 80)
		Menu.open();
}


