/*

Beat Detector
http://tech.beatport.com/2014/web-audio/beat-detection-using-web-audio/


© Guillaume Gonnet
License GPLv2

*/



(function() {


	window.BeatDetector = {};



	BeatDetector.run = function(obj) {

		if (typeof OfflineAudioContext == "undefined" || !obj.buffer)
			return false;
		

		// Create offline context
		var offlineContext = new OfflineAudioContext(1, obj.buffer.length, obj.buffer.sampleRate);

		// Create buffer source & filter
		var source = offlineContext.createBufferSource();
		source.buffer = obj.buffer;

		var filter = offlineContext.createBiquadFilter();
		filter.type = "lowpass";

		source.connect(filter);
		filter.connect(offlineContext.destination);


		// Start & render
		source.start(0);
		offlineContext.startRendering();


		// Act on the result
		offlineContext.oncomplete = function(e) {

			var filteredBuffer = e.renderedBuffer;

			var peaks,
				initialThresold = 0.9,
				thresold = initialThresold,
				minThresold = 0.3,
				minPeaks = 30;

			do {
				peaks = getPeaksAtThreshold(e.renderedBuffer.getChannelData(0), thresold);
				thresold -= 0.05;
			} while (peaks.length < minPeaks && thresold >= minThresold);


			var intervals = countIntervalsBetweenNearbyPeaks(peaks);
			var groups = groupNeighborsByTempo(intervals, filteredBuffer.sampleRate);

			if (groups.length == 0)
				return;
			

			var top = groups.sort(function(intA, intB) {
				return intB.count - intA.count;
			}).splice(0, 5);


			var dt = 60 / top[0].tempo;

			obj.bpm = {
				tempo: top[0].tempo,
				dt: dt,
				start: (top[0].start / filteredBuffer.sampleRate) % dt
			};
			
		};

	}




	
	// Function to identify peaks

	function getPeaksAtThreshold(data, threshold) {
		var peaksArray = [];
		var length = data.length;
		
		for(var i = 0; i < length;) {
			if (data[i] > threshold) {
				peaksArray.push(i);
				// Skip forward ~ 1/4s to get past this peak.
				i += 10000;
			}
			i++;
		}

		return peaksArray;
	}





	// Function used to return a histogram of peak intervals

	function countIntervalsBetweenNearbyPeaks(peaks) {
		var intervalCounts = [];
		
		peaks.forEach(function(peak, index) {
			
			for (var i = 0; i < 10; i++) {
				var interval = peaks[index + i] - peak;
				var foundInterval = intervalCounts.some(function(intervalCount) {
					if (intervalCount.interval === interval)
						return intervalCount.count++;
				});

				if (!foundInterval) {
					intervalCounts.push({
						interval: interval,
						count: 1,
						start: peak
					});
				}
			}
		});

		return intervalCounts;
	}





	// Function used to return a histogram of tempo candidates

	function groupNeighborsByTempo(intervalCounts, sampleRate) {
		var tempoCounts = [];
		
		intervalCounts.forEach(function(intervalCount, i) {
			
			if (intervalCount.interval !== 0) {
				// Convert an interval to tempo
				var theoreticalTempo = 60 / (intervalCount.interval / sampleRate );

				// Adjust the tempo to fit within the 90-180 BPM range
				while (theoreticalTempo < 90) theoreticalTempo *= 2;
				while (theoreticalTempo > 180) theoreticalTempo /= 2;

				theoreticalTempo = Math.round(theoreticalTempo);
				var foundTempo = tempoCounts.some(function(tempoCount) {
					if (tempoCount.tempo === theoreticalTempo)
						return tempoCount.count += intervalCount.count;
				});

				if (!foundTempo) {
					tempoCounts.push({
						tempo: theoreticalTempo,
						count: intervalCount.count,
						start: intervalCount.start
					});
				}
			}
		});

		return tempoCounts;
	}



})();