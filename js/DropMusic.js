/*

Fichier de gestion du glisser/déposer

*/



var dragging = 0, $dropHelp = $("#dropMusic");

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
		readFile(e.dataTransfer.files[i]);

	$dropHelp.fadeOut();
	dragging = 0;
}, false);





$songsContainer = $("#songs");

// On lit la musique
function readFile(file) {

	var fr = new FileReader();
	console.log(file);

	// Elements dans le menu
	var $elem = $('<div></div>'),
		$del = $('<p class="del">x</p>'),
		$name = $('<p class="name">' + file.name + '</p>'),
		$duration = $('<p class="duration"></p>');
	
	// Loader
	var $loader = $('<div class="loader1"></div>');
	for (var i = 1; i < 9; i++)
		$loader.append('<div class="rotateG_0'+i+'"></div>');

	$songsContainer.append($elem.append([ $del, $name, $loader, $duration ]));


	fr.onload = function(e) {
		var fileResult = e.target.result;
		
		adapter.context.decodeAudioData(fileResult, function(buffer) {

			$loader.remove();
			$duration.text(parseTime(buffer.duration));

			$elem.click(function() {
				dancer.setTime(0);
				adapter.buffer = buffer;
				dancer.play();
			});

		}, function(e) {
			alert("Error :(");
		});

	};


	fr.onerror = function(e) {
		alert('Impossible de lire le fichier :(');
	};

	
	fr.readAsArrayBuffer(file);

}