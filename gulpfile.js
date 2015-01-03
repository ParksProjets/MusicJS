var gulp = require('gulp');

var concat = require('gulp-concat');




gulp.task('js', function() {

	var base = "js/";

	var files = [
		"vendors/three-post.min.js",
		"knob.js",

		"Utils.js",
		"Translate.js",
		"BeatDetector.js",
		"main.js",
		"Player.js",
		"FFTManager.js",
		"Beat.js",

		"OptionsFFT.js",
		"EQMenu.js",
		"MusicMenu.js",
		"HelpMenu.js",
		"ControlsMenu.js",

		"DropMusic.js",

		"FFT/*"
	];



	for (var i = 0; i < files.length; i++)
		files[i] = base + files[i];
	
	return gulp.src(files)
		.pipe(concat("allv2.js"))
		.pipe(gulp.dest('js/'));

});





gulp.task('default', ['js']);