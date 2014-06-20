/*

FFT Visualisation barres

*/


(function() {


	var canvas = $("#fft0 canvas")[0],
		ctx = canvas.getContext('2d'),

		h = 0,
		w = 0,

		min = 0,
		max = 400;


	ctx.fillStyle = "#666666";




	var fft = {

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
		},


		on: function() {

		},


		off: function() {
			
		}
	};



	fft.onResize(wHeight, wWidth);

	FFTManager[0] = fft;

})();