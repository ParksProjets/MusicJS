/*

Menus


© Guillaume Gonnet
License GPLv2

*/



// JQuery

var $controlMenu = $('#menu');





// Namespace
var ControlsMenu = {};

ControlsMenu.opened = false;




// Open the menu
ControlsMenu.open = function() {

	TweenMax.to($controlMenu, 1, { x: 0 });
	ControlsMenu.opened = true;
};




// Close the menu
ControlsMenu.close = function() {
	
	TweenMax.to($controlMenu, 1, { x: 260 });
	ControlsMenu.opened = false;
};











// HTML Controls

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











// Dancer events


function dancerUpdate() {

	if (dancer.getDuration())
		$progress.css("left", (dancer.getTime() * 200 / dancer.getDuration()) + "px");
	else
		$progress.css("left", 0);

	$temps1.text(parseTime(dancer.getTime()));
}


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


dancer.bind("end", function() {
	FFTManager.resetAll();
	dancerUpdate();
});











// Playlist manager


ControlsMenu.mode = 'normal';


// Mode: edit the playlist
ControlsMenu.editMode = function() {

	$songsContainer.addClass('edit');
	ControlsMenu.mode = 'edit';

	$('#managePlayBtn').text(t('end editing'));
};




// Mode: normal (play songs)
ControlsMenu.normalMode = function() {

	$songsContainer.removeClass('edit');
	ControlsMenu.mode = 'normal';

	$('#managePlayBtn').text(t('manage playlist'));
};





// Button
$('#managePlayBtn').click(function() {

	if ($songsContainer.hasClass('edit'))
		ControlsMenu.normalMode();
	else
		ControlsMenu.editMode();

});






// Create a sortable list
Sortable.create(ControlsMenu, $songsContainer);



// When the playlist change
ControlsMenu.onSortableChange = function(li, ni) {

	var s = Playlist.songs[li];

	Playlist.songs.splice(li, 1);
	Playlist.songs.splice(ni, 0, s);


	console.log(Player.current, li + 1, ni + 1);

	if (Player.current == li + 1)
		Player.current = ni + 1;
};