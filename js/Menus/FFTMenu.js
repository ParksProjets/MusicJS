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




	// Menu

	var $menu = $("#optionsFFT"),
		$btn = $("#btnFFT");

	
	var menu = new Menu($menu);
	menu.onShow = setFFTOption;


	$btn.click(function() {
		menu.switch();
	});



	window.FFTMenu = menu;

})();