/*



*/



$.fn.knob = function(options, val) {


	if (typeof options == 'string' && val === undefined) {

		if (!$.data(this[0], 'knob'))
			return null;

		return $.data(this[0], 'knob').options[options];
	}



	if (typeof options == 'string' && val !== undefined) {

		return this.each(function (i, el) {

			var obj = $.data(this, 'knob');

			if (!obj)  return;

			obj.changeOptions(options, val);
		});

	}



	options = $.extend({}, $.fn.knob.defaults, options);

	return this.each(function (i, el) {
		var $elem = $(this);

		if ($.data(this, 'knob'))  return;

		var obj = new Knob($elem, options);
		$.data(this, 'knob', obj);
	});

}




$.fn.knob.defaults = {
	radius: 50,
	min: 0,
	max: 100,
	def: 50,
	name: ""
};






function Knob($elem, options) {

	var _this = this;

	this.options = options;


	var $wheelContainer = $('<div class="wheelContainer"></div>'),
		$wheel = $('<div class="wheel"></div>');

	$wheelContainer.append($wheel).css("width", options.radius*2 + "px");
	$wheel.css({
		"width": options.radius*2 + "px",
		"height": options.radius*2 + "px",
		"border-radius": options.radius + "px"
	});



	var $tige = $("<div></div>");
	$tige.css({
		"height": options.radius/2 + "px"
	});

	$wheel.append($tige);


	var $rt = $('<div class="tige rt"></div>'),
		$lt = $('<div class="tige lt"></div>'),
		$0t = $('<div class="tige"></div>');

	$rt.css("top", options.radius*2 - 14 + "px");
	$lt.css("top", options.radius*2 - 14 + "px");

	$wheelContainer.append([ $rt, $lt, $0t ]);

	$0t.css({
		left: options.radius - 1.5 + "px",
		top: "-12px"
	});


	$elem
		.addClass('knob')
		.append($wheelContainer);


	$wheel.append('<p>'+options.name+'</p>');


	this.$wheel = $wheel;



	function calcAngle(e) {
		var posX = e.pageX - $wheelContainer.offset().left,
			posY = e.pageY - $wheelContainer.offset().top;

		var angle = Math.atan2(posX - options.radius, options.radius - posY) * 180 / Math.PI;
		
		if (angle > 135)
			angle = 135;
		else if (angle < -135)
			angle = -135;

		TweenMax.to($wheel, .4, { rotation: angle });
		$elem.trigger("change", [ options.min + (angle+135) / 270 * (options.max -  options.min) ]);
	}




	function mousedown(e) {

		calcAngle(e);
		
		$(window)
			.bind("mousemove", calcAngle)
			.bind("mouseup", mouseup);

	}



	function mouseup() {
		$(window)
			.unbind("mousemove", calcAngle)
			.unbind("mouseup", mouseup);
	}


	$wheel.bind("mousedown", mousedown);

}





Knob.prototype = {};


Knob.prototype.changeOptions = function(option, val) {

	this.options[option] = val;

	switch (option) {

		case "name":
			this.$wheel.find("p").text(val);
			break;

	}
	
	
}




