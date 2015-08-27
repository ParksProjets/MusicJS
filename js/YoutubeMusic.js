/*

Youtube Music
Work In Progress


© Guillaume Gonnet
License GPLv2

*/



// Namespace
var Youtube = {};


Youtube.ready = false;




// Youtube API


function showResponse(response) {
	console.log(response);

	Youtube.loadVideoId(response.items[0].id.videoId);
}





// Load API
function onClientLoad() {
	gapi.client.load('youtube', 'v3', onYouTubeApiLoad);
}


// Connect to Google (key: http://goo.gl/PdPA1)
function onYouTubeApiLoad() {

	gapi.client.setApiKey('AIzaSyDspQ63svClEUotoAfyhAxqOOUVa5ejODQ');

	Youtube.ready = true;
}



Youtube.search = function(query) {

	var request = gapi.client.youtube.search.list({
		part: 'snippet',
		q: query
	});
	

	request.execute(onSearchResponse);

}

// Called automatically with the response of the YouTube API request.
function onSearchResponse(response) {
	showResponse(response);
}



function getYqlUrl(url) {
	return 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from html where url="' + url + '"') + '&format=json&callback=';
}



var audio;

// Youtube In MP3

Youtube.loadVideoId = function(id) {

	console.log('Load: '+ id);


	// YQL for cross domain

	var yimUrl = 'http://YoutubeInMP3.com/fetch/?api=advanced&format=JSON&video=http://www.youtube.com/watch?v=' + id,
		yql = getYqlUrl(yimUrl);

	$.get(yql, function(d) {

		var txt = d.query.results.body.p;

		if (txt) {

			try {
				var obj = JSON.parse(txt)
			} catch(e) {
				console.log('Erreur JSON :(');
				return;
			}

			var url = obj.link;

		}
		else {

			try {
				var url = d.query.results.body.div[1].div[1].a[0].href;
			} catch(e) {
				console.log('Erreur HTML :(');
				return;
			}

			$.get(getYqlUrl(url), function(d2) {
				console.log(d2);
			});

			console.log(url);
		}


		
		console.log(url);
	

		audio = new Audio(url);

		audio.oncanplay = function() {
			
			var i = Player.playlist.add({
				name: "Yolo",
				elem: $(''),
				audio: audio
			});

			Player.play(i);

		};
	});

};

