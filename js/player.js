(function () {

alert(4);

  var
    AUDIO_FILE = '../songs/zircon_devils_spirit',
    dancer, kick,
    carre = document.getElementById("test");

  /*
   * Dancer.js magic
   */
  Dancer.setOptions({
    flashSWF : '../../lib/soundmanager2.swf',
    flashJS  : '../../lib/soundmanager2.js'
  });

  dancer = new Dancer();
  kick = dancer.createKick({
    onKick: function () {
      carre.style.width = "400px";
      carre.style.height = "400px"; 
    },
    offKick: function () {
      carre.style.width = "200px";
      carre.style.height = "200px"; 
    }
  }).on();

  dancer
    .load({ src: AUDIO_FILE, codecs: [ 'ogg', 'mp3' ]});

  Dancer.isSupported() || loaded();
  !dancer.isLoaded() ? dancer.bind( 'loaded', loaded ) : loaded();

  /*
   * Loading
   */

  function loaded () {
    var
      supported = Dancer.isSupported(),
      p;

    
    if ( !supported ) {
      p = document.createElement('P');
      p.appendChild( document.createTextNode( 'Your browser does not currently support either Web Audio API or Audio Data API. The audio may play, but the visualizers will not move to the music; check out the latest Chrome or Firefox browsers!' ) );
      document.getElementsByTagName("body")[0].appendChild( p );
    }

    dancer.play();
  }

  // For debugging
  window.dancer = dancer;

})();
