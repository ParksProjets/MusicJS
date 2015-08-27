/*

Knob: control volume for example

© Guillaume Gonnet
License GPLv2

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



	var opts = $.extend({}, $.fn.knob.defaults, options);

	return this.each(function (i, el) {
		var $elem = $(this);


		if ($.data(this, 'knob')) {
			var obj = $.data(this, 'knob');

			if (options !== undefined)
				obj.set(options);

			return;
		}


		var obj = new Knob($elem, opts);
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




	// Set up the main element
	this.$elem = $elem;

	$elem
		.addClass('knob')
		.append($wheelContainer);



	// Set up the wheel
	this.$wheel = $wheel;
	$wheel.append('<p>'+options.name+'</p>');

	


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




Knob.prototype.set = function(value) {

	value = Math.max(Math.min(this.options.max, value), this.options.min);

	var angle = (value - this.options.min) / (this.options.max - this.options.min) * 270 - 135;

	TweenMax.to(this.$wheel, .4, { rotation: angle });
	this.$elem.trigger("change", [ value ]);
};



Knob.prototype.get = function() {

	TweenMax.to($wheel, .4, { rotation: angle });
	$elem.trigger("change", [ options.min + (angle+135) / 270 * (options.max -  options.min) ]);
}