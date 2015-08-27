/*

Menu de l'equalizer

*/



(function() {


	$("#volume").knob({ name: "Volume" }).change(function(e, value) {
		dancer.eq.setGain(value);
	});


	$("#highGain").knob({ name: "High" }).change(function(e, value) {
		dancer.eq.setHighGain(value);
	});


	$("#midGain").knob({ name: "Mid" }).change(function(e, value) {
		dancer.eq.setMidGain(value);
	});


	$("#lowGain").knob({ name: "Low" }).change(function(e, value) {
		dancer.eq.setLowGain(value);
	});





	// Menu

	var $menu = $("#eq"),
		$btn = $("#btnEQ");


	var menu = new Menu($menu);

	$btn.click(function() {
		menu.switch();
	});


	window.EQMenu = menu;

})();
