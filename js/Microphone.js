/*

Get the microphone

*/



// Namespace
var Microphone = {};




// Play with the microphone

Microphone.play = function() {

	Player.current = {
		type: 'microphone',
		duration: 0,
		name: "Microphone",
		//elem: $elem,
		loaded: true
	};


	dancer.pause();
	dancer.setTime(0);

	dancer.audioAdapter = adapter = new Dancer.adapters.microphone(dancer);

	dancer.play();
};






// Stop the micropnone

Microphone.stop = function() {

	if (adapter instanceof Dancer.adapters.microphone)
		adapter.pause();
}