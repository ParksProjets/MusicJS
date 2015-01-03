/*

OptionsFFT

© Guillaume Gonnet
License GPLv2

*/


(function() {


	// Beat

	$('input[type=radio][name=beat]').change(function() {
		
		Kick.off();
		BPM.off();

		if (this.value == "kick")
			Kick.on();

		else if (this.value == "beatdetector")
			BPM.on();

	});







	// FFT Options

	var $container = $('#fftOptions');
	
	function setFFTOption() {

		$container.children().remove();

		var fft = FFTManager.get();

		if (!fft.options) {
			$container.append($('<p class="info">' + t('none') + '</p>'));
			return;
		}



		for (var i = 0, l = fft.options.length; i < l; i++) {
			var o = fft.options[i];

			switch (o.type) {

				case "checkbox":
					var $elem = $('<input type="checkbox">');

					if (o.checked)
						$elem.attr('checked', 'true');

					$elem.change(function() {
						o.checked = $(this).is(":checked");
						o.onChange(o.checked);
					});

					$container.append([ $elem, $('<label>' + o.text + '</label>') ]);
					break;


			}
		}

	}




	var $menu = $("#optionsFFT"),
		$btn = $("#btnFFT");

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

			setFFTOption();
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

	window.FFTMenu = menu;
	Menus.push(menu);

})();