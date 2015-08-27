/*

Menus

*/




// Class menu

function Menu(elem) {

	this.elem = elem;
	this.isVisible = false;

	TweenMax.set(elem, { x: -260, display: "block" });

	Menus.push(this);
}



// Open the menu
Menu.prototype.show = function() {
	Menus.hideAll();
	TweenMax.to(this.elem, .7, { x: 0, onComplete: this.onShowEnd  });
	
	this.isVisible = true;

	this.onShow && this.onShow();
}



// Close the menu
Menu.prototype.hide = function() {
	TweenMax.to(this.elem, .7, { x: -260, onComplete: this.onHideEnd });

	this.isVisible = false;

	this.onHide && this.onHide();
}



// Show/hide
Menu.prototype.switch = function() {
	
	if (this.isVisible)
		this.hide();
	else
		this.show();
}







// Array of all menus

var Menus = [];


Menus.hideAll = function() {

	for (var i = 0; i < Menus.length; i++)
		Menus[i].hide();

	Menus.isOneVisible = false;
};


Menus.isOneVisible = false;







// List of menus on the left

var $listMenu = $('#listMenu');

var ListMenu = new Menu($listMenu);


ListMenu.open = function() {

	for (var i = 0; i < Menus.length; i++) {
		
		if (Menus[i].isVisible)
			break;
	}

	if (i == Menus.length)
		ListMenu.show();

	Menus.isOneVisible = true;
}




$listMenu.find('.a-btn').click(function() {

	var menu = $(this).attr('data-menu');

	if (!(window[menu] instanceof Menu))
		return;

	window[menu].show();
	ListMenu.hide();

});