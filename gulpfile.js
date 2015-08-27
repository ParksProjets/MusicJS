var gulp = require('gulp');

var concat = require('gulp-concat');




gulp.task('js', function() {

	var base = "js/";

	var files = [

		// Vendors
		"vendors/EventDispatcher.js",
		"vendors/three-post.min.js",
		"vendors/knob.js",


		"Utils.js",
		"Sortable.js",
		"Translate.js",
		"BeatDetector.js",
		"main.js",
		"Player.js",
		"Playlist.js",
		"FFTManager.js",
		"Beat.js",


		// Menus
		"Menus/Menus.js",
		"Menus/SourceMenu.js",
		"Menus/FFTMenu.js",
		"Menus/EQMenu.js",
		"Menus/MusicMenu.js",
		"Menus/HelpMenu.js",
		"Menus/ControlsMenu.js",


		// Decoders
		"Decoders/DecoderAccess.js",


		"DropMusic.js",
		"Microphone.js",
		//"YoutubeMusic.js",
		"Soundcloud.js",
		

		// FFTs
		"Visualisations/*"

	];




	for (var i = 0; i < files.length; i++)
		files[i] = base + files[i];
	
	return gulp.src(files)
		.pipe(concat("allv3.js"))
		.pipe(gulp.dest('js/'));

});






gulp.task('worker', function() {

	var base = "js/";

	var files = [

		"vendors/EventDispatcher.js",
		"Decoders/Worker.js",

		// Decoders
		"Decoders/Bitstream.js",
		"Decoders/Buffer.js",
		"Decoders/BufferList.js",
		"Decoders/Stream.js",
		"Decoders/Demuxer.js",
		"Decoders/Decoder.js",

		// FLAC
		"Decoders/FLAC/demuxer.js",
		"Decoders/FLAC/FLACDecoder.js",

	];


	for (var i = 0; i < files.length; i++)
		files[i] = base + files[i];
	
	return gulp.src(files)
		.pipe(concat("worker.js"))
		.pipe(gulp.dest('js/'));

});





gulp.task('default', ['js']);