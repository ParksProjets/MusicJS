/*

FFT Visualisation barres


© Guillaume Gonnet
License GPLv2

*/


(function() {


	var canvas = $("#fft0 canvas")[0],
		ctx = canvas.getContext('2d');

	ctx.fillStyle = "#666666";

	var h = 0, w = 0;
	var min = 0, max = 400;


	var $title = $("#fft0Title"),
		$bpm = $("#fft0BPM"),
		titleVisible = true;

	function showTitle(value) {
		titleVisible = value;

		if (value)
			$title.add($bpm).fadeIn();
		else
			$title.add($bpm).fadeOut();
	}


	function setTitle() {
		var song = Playlist.get();

		$title.text(song.name);

		if (song.bpm)
			$bpm.text(song.bpm.tempo + ' BPM');
		else
			$bpm.empty();
	}




	var fft = {

		onPlay: function() {
			setTitle();

			if (titleVisible)
				$title.add($bpm).fadeIn();
		},

		on: function() {
			setTitle();

			if (dancer.isPlaying() && titleVisible)
				$title.add($bpm).show();
		},


		onKick: function() {
			ctx.fillStyle = "#ff0077";
		},


		offKick: function() {
			ctx.fillStyle = "#666666";
		},


		update: function() {
			var spectrum = dancer.getSpectrum(),
				width = w * 0.9 / (max - min),
				height = h * 0.95 * 1.5,
				offsetX = w * 0.05,
				offsetY = h * 0.95;

			ctx.clearRect( 0, 0, w, h );
			for ( var i = min, l = spectrum.length; i < l && i < max; i++ ) {
				ctx.fillRect( offsetX + (i - min) * width, offsetY, width, -spectrum[ i ] * height);
			}
		},


		onResize: function(height , width) {
			canvas.height = h = height;
			canvas.width = w = width;
			fft.reset();
		},


		reset: function() {
			ctx.fillStyle = "#666666";
			ctx.clearRect( 0, 0, w, h );

			if (!dancer.isPlaying())
				$title.add($bpm).fadeOut();
		}
	};




	fft.options = [
		{
			type: "checkbox",
			text: t('show title'),
			onChange: showTitle,
			checked: true
		}
	];




	fft.onResize(wHeight, wWidth);

	FFTManager[0] = fft;

})();