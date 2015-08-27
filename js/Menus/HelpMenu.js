/*

Help Menu

*/



(function() {

	var $menu = $("#help"),
		$btn = $("#helpBtn");


	var menu = new Menu($menu);


	$btn.click(function() {
		menu.switch();
	});


	window.HelpMenu = menu;

})();
