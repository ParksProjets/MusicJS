/*

Source Menu

*/



(function() {

	var $menu = $("#sourceMenu"),

		$choices = $("#sourceChoices"),
		$SC = $("#sourceSoundcloud");




	// Soundcloud

	$("#btnSrcSC").click(function() {

		$choices.hide();
		$SC.show();

	});



	$SC.find("input[type=text]").keyup(function(e) {

		if (e.keyCode != 13)
			return;

		$SC.find('div').remove();


		Soundcloud.search($(this).val(), function(tracks) {

			tracks.splice(6, 50);

			tracks.forEach(function(e) {

				if (!e.stream_url)
					return;

				var $div = $(document.createElement('div')),
					$h6 = $('<h6>' + e.title + '</h6>'),
					$small = $('<small>Time: ' + e.duration + '</small>');

				$div.append([ $h6, $small ]);

				$div.click(function() {
					Soundcloud.stream(e.stream_url, e.title);
				});

				$SC.append($div);

			});

		});
	});




	// Micro

	$('#btnSrcMicro').click(function() {

		setTimeout(function() {
			$("#volume").knob(0);
		}, 1300);
	
		EQMenu.show();

		Microphone.play();
	});



	// Menu

	var menu = new Menu($menu);

	menu.onHideEnd = function() {

		$SC.hide();

		$choices.show();
	}


	window.SourceMenu = menu;

})();
