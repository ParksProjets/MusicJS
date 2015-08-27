/*

Menu de l'equalizer

*/



(function() {

	var $menu = $("#musicMenu"),
		$btn = $("#btnMusic");

	var $selectTempo = $("#musicTempo"),
		$radioCF = $('input[type=radio][name=crossfade]'),
		$radioStorage = $('input[type=radio][name=storage]');


	var menu = new Menu($menu);





	// Tempo

	menu.currentTempo = 1;

	function apllyTempo() {

		if (adapter.audioNode && adapter.audioNode.playbackRate !== undefined)
			adapter.audioNode.playbackRate.value = menu.currentTempo;

		else if (adapter.audio && adapter.audio.playbackRate !== undefined)
			adapter.audio.playbackRate = menu.currentTempo;

		adapter.lastPlaybackRate = menu.currentTempo;;
	}

	dancer.bind('play', apllyTempo);


	$selectTempo.change(function() {
		menu.currentTempo = parseFloat($(this).val());
		apllyTempo();
	});





	// Crossfade

	$radioCF.change(function() {
		
		if (this.value == "true")
			Player.Crossfade.on();
		else
			Player.Crossfade.off();
	});




	// Storage

	menu.storage = "auto";

	$radioStorage.change(function() {
		
		menu.storage = this.value;
	});




	$btn.click(function() {
		menu.switch();
	});


	menu.onHide = function() {
		$selectTempo.blur();
	};


	window.MusicMenu = menu;

})();