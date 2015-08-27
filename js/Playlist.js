/*

Playlist


© Guillaume Gonnet
License GPLv2

*/






// jQuery

var $songsContainer = $('#songs'),
	$helpSongs = $('#helpSongs');




// Namespace
var Playlist = {};

Playlist.songs = [];







// Get obj by index
Playlist.get = function(index) {

	index = index || Player.current;

	if (typeof index == "number")
		return Playlist.songs[ (index || Player.current) - 1];
	else
		return index;
}


Playlist.getNextIndex = function() {

	if (typeof Player.current != "number")
		return 0;

	if (Player.current < Playlist.songs.length)
		return Player.current + 1;
	else
		return 0;
}









// Get the adapter

Playlist.getAdapter = function(index, other) {

	other = other || false;

	var obj = typeof index == 'number' ? Playlist.get(index) : index,
		adpt = null;


	if (obj.crossDomain) {

		if (!(adapter instanceof Dancer.adapters.crossDomain) || other)
			adpt = new Dancer.adapters.crossDomain(dancer);
		else
			adpt = adapter;

		adpt.load(obj.audio);
	}


	else if (obj.type == 'buffered') {

		if (!(adapter instanceof Dancer.adapters.audiobuffer) || other)
			adpt = new Dancer.adapters.audiobuffer(dancer);
		else
			adpt = adapter;

		adpt.buffer = obj.buffer;

	}


	else if (obj.type == 'url' || obj.audio) {

		if (!(adapter instanceof Dancer.adapters.http) || other)
			adpt = new Dancer.adapters.http(dancer);
		else
			adpt = adapter;

		adpt.load(obj);
	}


	return adpt;
}











// Add a music to the playlist

Playlist.add = function(obj) {

	$helpSongs.hide();


	// Create the elements in the menu
	var $elem = $('<div class="song"></div>'),
		$name = $('<p class="name">' + obj.name + '</p>'),
		$duration = $('<p class="duration"></p>'),
		$del = $('<p class="del">x</p>');


	// Loader
	var $loader = $('<div class="loader1"></div>');
	for (var i = 1; i < 9; i++)
		$loader.append('<div class="rotateG_0'+i+'"></div>');


	$songsContainer.append($elem.append([ $name, $loader, $duration, $del ]));





	// Create the song object

	var song = {
		type: 'none',
		duration: 0,
		name: obj.name,
		elem: $elem,
		loaded: false,
		bpm: null,
		crossDomain: !!obj.crossDomain
	};


	


	// If the song if buffered
	if (obj.type == 'buffered' || obj.buffer) {
		
		song.type = 'buffered';
	}


	// If the song is an Audio object
	else if (obj.type == 'url' || obj.audio) {
		
		song.type = obj.type || 'url';
		song.audio = obj.audio;
	}


	Playlist.update(song);
	Playlist.songs.push(song);


	// Delete
	var down = false;

	$del.mousedown(function(e) {
		e.stopPropagation();
		down = true;
	});

	$del.mouseup(function(e) {
		e.stopPropagation();

		if (down)
			Playlist.remove(song);

		down = false;
	});


	return song;
}












// Update the song object

Playlist.update = function(song) {


	// Remove the loader and make the song clickable
	function loadComplete() {
		
		var $elem = song.elem;

		$elem.find('.loader1').remove();
		$elem.find('.duration').text(parseTime(song.duration));

		song.loaded = true;


		$elem.click(function() {
			
			if (ControlsMenu.mode == 'normal')
				Player.play(song);
		});
		//event.stopImmediatePropagation(

		$elem.mousedown(function(e) {
			
			if (ControlsMenu.mode == 'edit')
				ControlsMenu.move(this, e);
		});

	}



	// Music not load yet but can be played
	var loadPartial = loadComplete;


	// Music loaded
	function partialEnd() {
		if (!song.loaded) loadComplete();
	}




	// The song is buffered
	if (song.type == 'buffered') {

		if (!song.buffer)
			return;

		song.duration = song.buffer.duration;
		BeatDetector.run(song);
		loadComplete();
	}


	// The song is an Audio object
	else if (song.type == 'url' || song.audio) {

		var audio = song.audio,
			callback = function() { Playlist.update(song); };

		song.duration = song.audio.duration;

		if (audio.readyState < 3 && !audio.oncanplay) {
			audio.oncanplay = callback;
		}

		else if (audio.readyState == 3 && !audio.onloadeddata) {
			audio.oncanplay = null;
			audio.onloadeddata = callback;
			loadPartial();
		}

		else {
			audio.onloadeddata = audio.oncanplay = null;
			partialEnd();
		}
	}

}











// Remove from the playlist
Playlist.remove = function(i) {

	if (typeof i == 'object')
		i = Playlist.songs.indexOf(i);

	if (i == -1)
		return;


	if (i + 1 == Player.current) {
		Player.stop();
		Player.current = 0;
	}



	var obj = Playlist.songs[i];


	delete obj.buffer;

	obj.elem.remove();

	if (obj.type == 'blob')
		URL.revokeObjectURL(obj.audio.src);


	Playlist.songs.splice(i, 1);
}
