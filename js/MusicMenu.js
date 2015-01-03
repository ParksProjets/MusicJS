/*

Menu de l'equalizer

*/



(function() {

	var menu = {};


	var $menu = $("#musicMenu"),
		$btn = $("#btnMusic");

	var $selectTempo = $("#musicTempo"),
		$radioCF = $('input[type=radio][name=crossfade]');



	// Tempo

	menu.currentTempo = 1;

	function apllyTempo() {

		if (adapter.audioNode)
			adapter.audioNode.playbackRate.value = menu.currentTempo;

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




	$menu.mouseleave(mouseleave);

	function mouseleave() {
		menu.hide();
	}

	$btn.click(function() {
		menu.switch();
	});





	menu.isVisible = false;


	menu.show = function() {
		Menus.hideAll();
		TweenMax.to($menu, .5, { x: 0 });
		this.isVisible = true;
	};


	menu.hide = function() {
		TweenMax.to($menu, .5, { x: -260 });
		this.isVisible = false;

		$selectTempo.blur();
	};


	menu.switch = function() {
		if (this.isVisible)
			this.hide();
		else
			this.show();
	};



	TweenMax.set($menu, { x: -260, display: "block" });

	window.MusicMenu = menu;
	Menus.push(menu);

})();