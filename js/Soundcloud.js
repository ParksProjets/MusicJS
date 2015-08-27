/*

Use of the SoundCloud API


© Guillaume Gonnet
License GPLv2

*/


(function() {


	// The SoundCloud API is not loaded
	if (typeof SC == "undefined")
		return;


	// Namespace
	var Soundcloud = {};


	var id = "5e551e70a6f4fabda790ae5a43c10865";


	SC.initialize({
		client_id: id
	});



	Soundcloud.search = function(req, callback) {

		SC.get('/tracks', { q: req }, function(tracks) {
			
			console.log(tracks);

			callback(tracks);

			/*
			if (tracks.length && tracks[0].stream_url)
				Soundcloud.stream(tracks[0].stream_url, tracks[0].title);
			else
				console.log('Erreur: sound.stream_url');
			*/

		});

	};





	Soundcloud.load = function(url) {


		SC.get('/resolve', { url: url }, function(sound) {
			
			if (sound.errors) {
				console.log(sound.errors);
				return;
			}

			if (sound.kind == "playlist") {
				console.log('Erreur: playlist');
				self.sound = sound;
				self.streamPlaylistIndex = 0;
				self.streamUrl = function(){
					return sound.tracks[self.streamPlaylistIndex].stream_url + '?client_id=' + client_id;
				}
				return;
			}


			console.log(sound);

		
			if (sound.stream_url)
				Soundcloud.stream(sound.stream_url, sound.title);
			else
				console.log('Erreur: sound.stream_url');
			
		});
	};






	Soundcloud.stream = function(url, name) {

		var audio = new Audio();

		//audio.autoplay = true;
		//audio.preload = true;
		//audio.crossOrigin = "anonymous";

		audio.src = url + '?client_id=' + id;

		Playlist.add({
			name: name,
			audio: audio,
			crossDomain: true
		});

	};




	window.Soundcloud = Soundcloud;

})();