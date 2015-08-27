/*

Manage drops of music file


© Guillaume Gonnet
License GPLv2

*/




// Namespace
var DropMusic = {};



// JQuery
var $dropHelp = $("#dropMusic");
var $songsContainer = $("#songs");




// Drop Events

var dragging = 0;


$(window).bind("dragenter", function(e) {
	e.preventDefault();
	e.stopPropagation();

	dragging++;
	if (dragging == 1)
		$dropHelp.fadeIn();
});



$(window).bind("dragleave", function(e) {
	e.preventDefault();
	e.stopPropagation();

	dragging--;
	if (dragging == 0)
		$dropHelp.fadeOut();
});



$(window).bind("dragover", function (e) {
	e.preventDefault();
	e.stopPropagation();
});



window.addEventListener("drop", function (e) {
	e.preventDefault();
	e.stopPropagation();

	for (var i = 0; i < e.dataTransfer.files.length; i++)
		DropMusic.load(e.dataTransfer.files[i]);

	$dropHelp.fadeOut();

	dragging = 0;
}, false);













// Load a music file

DropMusic.load = function(file) {

	if (MusicMenu.storage == "buffered")
		return DropMusic.loadBufferd(file);

	else if (MusicMenu.storage == "blob")
		return DropMusic.loadBlob(file);


	var ext = file.name.substr(file.name.lastIndexOf('.') + 1).toLocaleLowerCase();

	if (ext == 'flac')
		DropMusic.loadBufferd(file);
	else
		DropMusic.loadBlob(file);
};







// Create a blob with the file

DropMusic.loadBlob = function(file) {

	var audio = new Audio();
	audio.src = window.URL.createObjectURL(file);


	var song = Playlist.add({
		type: 'blob',
		name: file.name.substr(0, file.name.lastIndexOf('.')) || file.name,
		audio: audio
	});
};







// Read the file and store it in a buffer

DropMusic.loadBufferd = function(file) {


	var fr = new FileReader();


	var song = Playlist.add({
		type: 'buffered',
		name: file.name.substr(0, file.name.lastIndexOf('.')) || file.name
	});



	fr.onload = function(e) {
		
		var fileResult = e.target.result,
			fileResult2 = fileResult.slice(0);


		// Callback: add song to playlist
		function success(buffer) {

			fileResult = fileResult2 = null;

			song.buffer = buffer;

			Playlist.update(song);
		}
		

		// Use AudioContext.decodeAudioData to decode the file
		Dancer.context.decodeAudioData(fileResult, success, function() {

			// If AudioContext.decodeAudioData can't, try with js (for FLAC...)
			Decoder.decodeAudioData(fileResult2, success, function(e) {
				
				fileResult = fileResult2 = null;

				// Error
				Playlist.remove(song);
				alert(t('incompatible file'));
			});

		});


	};


	fr.onerror = function(e) {
		Playlist.remove(song);
		alert(t('cant read file'));
	};

	
	fr.readAsArrayBuffer(file);

};