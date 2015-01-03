/*

Fichier de gestion du glisser/déposer

© Guillaume Gonnet
License GPLv2

*/



var dragging = 0, $dropHelp = $("#dropMusic");


// Events Drop

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
	Menu.open();
	setTimeout(function() {
		$(window).mousemove(onMouseMove);
	}, 2000);

	dragging = 0;
}, false);





$songsContainer = $("#songs");


// Read the music file
function readFile(file) {


	var fr = new FileReader();
	var name = file.name.substr(0, file.name.lastIndexOf('.')) || file.name;


	// Elements in the menu
	var $elem = $('<div></div>'),
		$del = $('<p class="del">x</p>'),
		$name = $('<p class="name">' + name + '</p>'),
		$duration = $('<p class="duration"></p>');
	

	// Loader
	var $loader = $('<div class="loader1"></div>');
	for (var i = 1; i < 9; i++)
		$loader.append('<div class="rotateG_0'+i+'"></div>');

	$songsContainer.append($elem.append([ $del, $name, $loader, $duration ]));



	fr.onload = function(e) {
		var fileResult = e.target.result;
		
		adapter.context.decodeAudioData(fileResult, function(buffer) {

			// Decode OK
			var i = Player.playlist.add({ name: file.name, buffer: buffer, elem: $elem });

			$loader.remove();
			$duration.text(parseTime(buffer.duration));

			$elem.click(function() {
				Player.play(i);
			});


		}, function(e) {

			// Error
			$elem.remove();
			alert(t('incompatible file'));
		});

	};


	fr.onerror = function(e) {
		alert(t('cant read file'));
	};

	
	fr.readAsArrayBuffer(file);

}




// Show drop message at start
$dropHelp.fadeIn();