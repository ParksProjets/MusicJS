/*

Help Menu

*/



(function() {

	var $menu = $("#help"),
		$btn = $("#helpBtn");


	$menu.mouseleave(mouseleave);

	function mouseleave() {
		menu.hide();
	}


	$btn.click(function() {
		menu.switch();
	});



	var menu = {

		isVisible: false,

		show: function() {
			Menus.hideAll();
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

	window.HelpMenu = menu;
	Menus.push(menu);

})();
