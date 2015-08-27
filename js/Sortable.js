/*

Sortable list


© Guillaume Gonnet
License GPLv2

*/




// Namespace
var Sortable = {};




Sortable.create = function(obj, container) {

	var $currentItem = null;
	var currentItem = null;

	var $clone = null;

	var $holder = null;
	var holder = null;
	var lastElementHover = null;


	var start = { x: 0, y: 0 };

	var offset = { x: 0, y: 0 };

	var h = 0, w = 0;

	var $container = $(container);






	// Mouse move

	function mousemove(e) {

		TweenMax.set($clone, { x: e.clientX - offset.x, y: e.clientY - offset.y });


		var holderVisible = false;


		$container.children().each(function(index, el) {
			
			var $this = $(this),
				o = $this.offset();

			if (e.clientX > o.left && e.clientX <= o.left + w &&
				e.clientY > o.top && e.clientY <= o.top + h) {

				//console.log($this.text());


				if (this == currentItem)
					return false;


				if (this == holder) {
					holderVisible = true;
					return false;
				}



				var next = $this.next()[0],
					prev = $this.prev()[0];

				if (e.clientY >= o.top + (h / 2)) {
					holderVisible = (next != currentItem);

					if (next == currentItem || next == holder)
						return false;

					$this.after($holder.remove());
					//TweenMax.from($holder, .6, { height: 0 });
				}



				else if (e.clientY < o.top + (h / 2)) {
					holderVisible = (prev != currentItem);

					if (prev == currentItem || prev == holder)
						return false;

					$this.before($holder.remove());
					//TweenMax.from(holder, .6, { height: 0 });
				}



				lastElementHover = this;
				holderVisible = true;

				return false;
			}
		});




		if (!holderVisible)
			$holder.remove();

	}








	// Mouse Up

	function mouseup() {

		$(window).unbind('mousemove', mousemove);
		$(window).unbind('mouseup', mouseup);


		if (jQuery.contains(document, holder)) {

			var li = $songsContainer.children('.song:not(.holder)').index($currentItem);

			$currentItem.detach();
			$holder.replaceWith($currentItem);

			$holder.remove();

			if (obj.onSortableChange)
				obj.onSortableChange(li, $songsContainer.children('.song').index($currentItem));
		}


		$currentItem = null;
		$clone.remove();
	}









	// Mouse a child of the container

	obj.move = function(item, e) {

		if ($currentItem)
			return;


		$currentItem = $(item);
		currentItem = $currentItem[0];

		$clone = $currentItem.clone();

		$clone.addClass('clone');
		$clone.width($currentItem.width());
		$clone.height($currentItem.height());


		$holder = $currentItem.clone().empty().addClass('holder');
		holder = $holder[0];


		start.x = e.clientX;
		start.y = e.clientY;

		offset.x = e.clientX - $currentItem.offset().left;
		offset.y = e.clientY - $currentItem.offset().top;

		w = $currentItem.outerWidth();
		h = $currentItem.outerHeight();


		$(window).bind('mousemove', mousemove);
		$(window).bind('mouseup', mouseup);

		$('body').append($clone);
		TweenMax.set($clone, { x: e.clientX - offset.x, y: e.clientY - offset.y });
	};



};