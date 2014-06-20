/*

Menu de l'equalizer

*/



(function() {


	$("#volume").knob({ name: "Volume" }).change(function(e, value) {
		adapter.eq.setGain(value);
	});


	$("#highGain").knob({ name: "High" }).change(function(e, value) {
		adapter.eq.setHighGain(value);
	});


	$("#midGain").knob({ name: "Mid" }).change(function(e, value) {
		adapter.eq.setMidGain(value);
	});


	$("#lowGain").knob({ name: "Low" }).change(function(e, value) {
		adapter.eq.setLowGain(value);
	});



	var $menu = $("#eq");

	$menu.mouseleave(mouseleave);

	function mouseleave() {
		menu.hide();
	}



	var menu = {

		isVisible: false,

		show: function() {
			TweenMax.to($menu, .5, { x: 0 });
			this.isVisible = true;
		},

		hide: function() {
			TweenMax.to($menu, .5, { x: -260 });
			this.isVisible = false;
		},

		switch: function() {
			if (this.isVisible)
				this.hide();
			else
				this.show();
		}
	}



	TweenMax.set($menu, { x: -260, display: "block" });

	window.EQMenu = menu;

})();
