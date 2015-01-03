/*

Beat

© Guillaume Gonnet
License GPLv2

*/



// BPM

(function() {

	window.BPM = {};

	var active = false,
		index = 0,
		dt, start;


	BPM.on = function() {
		active = true;
	}

	BPM.off = function() {
		active = false;
	}



	function onPlay() {
		var song = Player.playlist.get();
		dt = 0;

		if (!song.bpm)
			return;
		
		dt = song.bpm.dt;
		start = song.bpm.start;
		index = 0;
	}


	function update() {
		if (!active || !dt)
			return;

		var time = dancer.getTime() + start;

		var ni = Math.floor(time / dt);
		if (ni != index) {
			FFTManager.onKick();
			index = ni;
		}
		else {
			FFTManager.offKick();
		}
	}


	dancer.bind("play", onPlay);
	dancer.bind("update", update);

})();




// Kick

var Kick = dancer.createKick({

	onKick: FFTManager.onKick,

	offKick: FFTManager.offKick,
	
	decay: 0.02,
	threshold: 0.25,
	frequency: [0,10]

}).on();



