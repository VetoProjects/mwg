(function() {
  var audioContext
    , osc
    , form = "square"
    , freq = 440
    , play = false
    , st = false
    ;

  (function init(g){
      try {
        audioContext = new (g.AudioContext || g.webkitAudioContext);
      } catch (_) {
        alert('No web audio oscillator support in this browser');
      }
  }(window));

  function start() {
    stop();
    osc = audioContext.createOscillator();
    osc.frequency.value = freq;
    osc.type = form;
    osc.volume = 0.4;
    osc.connect(audioContext.destination);
    osc.start();
    osc.connect(analyzer(audioContext));
  }

  function stop() {
    if (osc) osc.stop();
    osc = null;
  }

  var analyzer = function(context) {
      var node = context.createAnalyser()
        , canvas = null
        , canvasCtx = null
        , bufferLength = 2048
        , dataArray = new Uint8Array(bufferLength)
        ;

      node.fftSize = bufferLength;

      canvas = document.getElementById("draw");
      canvasCtx = canvas.getContext('2d');
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      node.draw = function() {
          if (canvas === null) return;

          var rect = canvas.getBoundingClientRect()
            , width = rect.width
            , height = rect.height
            ;

          node.getByteTimeDomainData(dataArray);

          canvasCtx.canvas.width = width;
          canvasCtx.canvas.height = height;
          canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

          canvasCtx.lineWidth = 1;
          canvasCtx.strokeStyle = 'rgb(0, 200, 0)';
          canvasCtx.beginPath();

          var sliceWidth = width * 1.0 / bufferLength
            , x = 0
            ;

          for (var i = 0; i < bufferLength; i++) {
              var v = dataArray[i] / 128.0;
              var y = v * height / 2;

              if (i === 0) canvasCtx.moveTo(x, y);
              else canvasCtx.lineTo(x, y);

              x += sliceWidth;
          }
          canvasCtx.lineTo(width, height / 2);
          canvasCtx.stroke();
          if (!st) requestAnimationFrame(node.draw);
      };

      setTimeout(() => requestAnimationFrame(node.draw), 100);

      return node;
  };

  var maybeStart = (f) => () => { f(); play ? start() : stop(); };

  var pitch = document.getElementById("pitch");
  var pitchdisp = document.getElementById("pitchdisp");

  pitch.oninput = maybeStart(() => { pitchdisp.value = pitch.value; freq = pitch.value; });
  pitchdisp.onkeyup = maybeStart(() => { pitch.value = pitchdisp.value; freq = pitch.value; });

  var form_in = document.getElementById("form");

  form_in.onchange = maybeStart(() => form = form_in.value.toLowerCase());

  var play_in = document.getElementById("play");

  play_in.onclick = maybeStart(() => { play = !play; play_in.value = play ? "Stop" : "Start"; });

  var static_in = document.getElementById("static");

  static_in.onclick = maybeStart(() => st = static_in.checked);
})();
