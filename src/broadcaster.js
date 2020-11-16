import {initRecorder} from './sono'

let init = false;
let audioCache = [];
const soundController = {}

export function initBc(recording=true) {
  window.WebSocket = window.WebSocket || window.MozWebSocket;

  window.connection = new WebSocket("ws://127.0.0.1:3001/broadcast");
  window.connection.binaryType = 'arraybuffer'

  // TODO how to handle sending info regarding the broadcast?
  // window.connection.binaryType = 'blob'
  // window.infoConnection = new WebSocket("ws://127.0.0.1:3001/broadcast");
  window.recording = recording;

  connection.onopen = function() {
    // connection is opened and ready to use
    console.log("hi, listening");

    if (!window.streamAudioCtx) {
      window.streamAudioCtx = window.AudioContext || window.webkitAudioContext;
    }

    soundController.nextTime = 0;
    soundController.speakerContext = new streamAudioCtx();
    if(recording){
      initRecorder()
    }

  };

  infoConnection.onopen = function() {
    // connection is opened and ready to use
    console.log("hi, listening to your info");
  };

  connection.onerror = function(error) {
    // an error occurred when sending/receiving data
  };

}

export function recorderBroadcast (e) {
  const left = e.inputBuffer.getChannelData(0);
  if (window.recording === true) {
    const chunk = left;
    window.connection.send(chunk);
  }
};

export function listen2Bc(){
  window.connection.onmessage = function(message) {

    console.log(">>> Receiving Audio Stream", message);

    var array = new Float32Array(message.data);
    var buffer = soundController.speakerContext.createBuffer(1, 2048, 44100);
    buffer.copyToChannel(array, 0);

    audioCache.push(buffer);
    // make sure we put at least 5 chunks in the buffer before starting
    if ((init === true) || ((init === false) && (audioCache.length > 5))) { 
        init = true;
        soundController.playCache(audioCache);
    }
  };

  soundController.playCache = function (cache) {
    while (cache.length) {
      var buffer = cache.shift();
      var source    = soundController.speakerContext.createBufferSource();
      source.buffer = buffer;
      source.connect(soundController.speakerContext.destination);
      if (soundController.nextTime == 0) {
          // add a delay of 0.05 seconds
          soundController.nextTime = soundController.speakerContext.currentTime + 0.05;  
      }
      source.start(soundController.nextTime);
      // schedule buffers to be played consecutively
      soundController.nextTime+=source.buffer.duration;  
    }
  };
}
