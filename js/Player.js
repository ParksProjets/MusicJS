/*

Player

© Guillaume Gonnet
License GPLv2

*/



// Namespace
var Player = {};

Player.current = 0;

Player.mode = 'next';




// Playlist

Player.playlist = [];


Player.playlist.get = function(index) {
	return Player.playlist[ (index || Player.current) - 1];
}


Player.playlist.getNextIndex = function() {

	if (Player.current < Player.playlist.length)
		return Player.current + 1;
	else
		return 0;
}



Player.playlist.add = function(obj) {

	var song = {
		fileName: obj.name,
		name: obj.name.substr(0, obj.name.lastIndexOf('.')) || obj.name,
		buffer: obj.buffer,
		elem: obj.elem,
		bpm: null
	};


	BeatDetector.run(song);

	return Player.playlist.push(song);
}



Player.playlist.remove = function(i) {

	return Player.playlist.slice(1, i);
}





// Commands

Player.play = function(index) {

	if (typeof index == 'undefined' && Player.current)
		return dancer.play();

	if (typeof index == 'string' || (!Player.current && !index))
		index = 1;

	Player.current = index;

	dancer.pause();
	dancer.setTime(0);
	adapter.buffer = Player.playlist[index - 1].buffer;
	dancer.play();
}



Player.pause = function() {

	dancer.pause();
}



Player.stop = function() {

	dancer.pause();
	FFTManager.resetAll();

	dancer.setTime(0);
	dancer.trigger('pause');
}




Player.next = function() {

	if (Player.current < Player.playlist.length)
		Player.play(Player.current + 1);
};


Player.last = function() {

	if (Player.current > 1)
		Player.play(Player.current - 1);
};






// Crossfade

(function() {

	var CF = window.Player.Crossfade = {};


	var active = false;

	CF.time = 5;



	var prevAdapter = null;

	var fakeEvents = {};

	var fakeDancer = { trigger: function(n) {
		fakeEvents[n] && fakeEvents[n]();
	} };


	function run() {

		if (prevAdapter)
			return;

		var i = Player.playlist.getNextIndex();
		if (!i) return;

		Player.current = i;
		var song = Player.playlist[i-1];


		var adpt = new Dancer.adapters.webaudiobuffer(dancer);
		adpt.buffer = song.buffer;


		adpt.eq.gain.gain.linearRampToValueAtTime(0, 0);
		adpt.eq.gain.gain.linearRampToValueAtTime(1, CF.time);

		adapter.eq.gain.gain.linearRampToValueAtTime(1, adapter.context.currentTime);
		adapter.eq.gain.gain.linearRampToValueAtTime(0, adapter.context.currentTime + CF.time);


		adpt.play();

		adapter.dancer = fakeDancer;
		prevAdapter = adapter;

		adapter = adpt;
		dancer.audioAdapter = adapter;

		dancer.trigger('play');
	}


	fakeEvents.end = function() {
		prevAdapter = null;
	};



	function update() {

		if (!active)
			return;

		if (dancer.getDuration() - dancer.getTime() <= CF.time)
			run();
	}



	CF.on = function() {
		active = true;
	};



	CF.off = function() {
		active = false;
	};


	CF.on();
	dancer.bind("update", update);

})();






// Events

dancer.bind("end", function() {

	if (Player.mode == 'next')
		Player.next();
});