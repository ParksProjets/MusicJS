/*

Player


© Guillaume Gonnet
License GPLv2

*/



// Namespace
var Player = {};

Player.current = 0;

Player.mode = 'next';






// Commands

Player.play = function(index) {

	if (typeof index == 'undefined' && Player.current)
		return dancer.play();


	if (!Playlist.songs.length)
		return;


	if (typeof index == 'object')
		index = Playlist.songs.indexOf(index) + 1;

	if (index <= 0 || typeof index == 'string' || (!Player.current && !index))
		index = 1;


	Player.current = index;


	dancer.pause();
	dancer.setTime(0);
	dancer.audioAdapter = adapter = Playlist.getAdapter(Player.current);
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

	if (Player.current < Playlist.songs.length)
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

		var i = Playlist.getNextIndex();
		if (!i) return;

		Player.current = i;


		var adpt = Playlist.getAdapter(i, true);

		adpt.eq.gain.gain.linearRampToValueAtTime(0, 0);
		adpt.eq.gain.gain.linearRampToValueAtTime(1, CF.time * 1.5);

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

		if (!active) return;

		if (dancer.getDuration() - dancer.getTime() <= CF.time)
			run();
	}



	CF.on = function() {
		active = true;
	};


	CF.off = function() {
		active = false;
	};


	//CF.on();
	dancer.bind("update", update);

})();






// Events

dancer.bind("end", function() {

	if (Player.mode == 'next')
		Player.next();
});