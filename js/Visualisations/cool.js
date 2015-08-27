/*

Cool


© Guillaume Gonnet
License GPLv2

*/


(function() {

	var canvas = $("#fft2 canvas")[0],
		ctx = canvas.getContext('2d');


	var $img = $("#fft2 img"),
		$progress = $("#fft2Progress"),
		$point = $("#fft2Point"),
		$timeElapsed = $("#fft2TimeElapsed"),
		$timeLeft = $("#fft2TimeLeft");


	var angle = 0,
		imagesCount = 2,
		imageIndex = Math.randIn(0, imagesCount-1),
		isPlaying = false;



	$progress.click(function(e) {
		dancer.setTime((e.pageX - $(this).offset().left) * dancer.getDuration() / 700);
	});


	$img.load(function() {
		
		if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
			
			console.log('Invalid image: img' + index + '.jpg');
			nextImg();

		} else {

			$img.fadeIn();
		}
	});



	function nextImg() {

		imageIndex++;

		if (imageIndex > imagesCount)
			imageIndex = 1;

		$img.fadeOut();
		$img.attr('src', 'asset/img' + imageIndex + '.jpg');
	}


	function onKeyDown(e) {

		if (e.keyCode == 39 || e.keyCode == 37)
			nextImg();

	}



	function animate() {

		// Canvas

		angle = angle >= 2 ? 0 : angle + 1 / 60;

		ctx.clearRect(0, 0, 40, 40);

		ctx.fillStyle = "#E67D7D";
		ctx.beginPath();
		ctx.arc(20 ,20 ,10 ,0, 2*Math.PI);
		ctx.fill();

		ctx.lineWidth = 2;
		ctx.strokeStyle = '#E67D7D';

		ctx.beginPath();
		ctx.arc(20 ,20 ,13 , angle * Math.PI, angle * Math.PI + 3 * Math.PI / 4);
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(20 ,20 ,13 , angle * Math.PI +  Math.PI, angle * Math.PI + 7 * Math.PI / 4);
		ctx.stroke();



		// HTML

		$point.css("left", (dancer.getTime() * 700 / dancer.getDuration()) + "px");
		$timeElapsed.text(parseTime(dancer.getTime()));
		$timeLeft.text(parseTime(dancer.getDuration() - dancer.getTime()));



		if (isPlaying)
			requestAnimationFrame(animate);

	}


	nextImg();
	animate();




	var fft = {

		onPlay: function() {
			
			if (!isPlaying)
				requestAnimationFrame(animate);

			isPlaying = true;
		},


		onPause: function() {
			isPlaying = false;
			cancelAnimationFrame(animate);
		},


		on: function() {
			$(window).bind('keydown', onKeyDown);
			isPlaying = dancer.isPlaying();
			requestAnimationFrame(animate);
		},

		off: function() {
			$(window).unbind('keydown', onKeyDown);
			isPlaying = false;
		},


		update: function() {
			
		},


		onResize: function(height , width) {
			fft.reset();
		},


		reset: function() {
			
		}
	};



	fft.onResize(wHeight, wWidth);

	FFTManager[2] = fft;

})();