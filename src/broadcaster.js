import { initRecorder, stopRecorder } from "./sono";

let init = false;
let audioCache = [];
const soundController = {};

export function initWsConnection(isBroadcaster) {
  window.WebSocket = window.WebSocket || window.MozWebSocket;
  window.connection = new WebSocket("ws://127.0.0.1:3001/broadcast");
  window.connection.binaryType = "arraybuffer";

  connection.onopen = function() {
    if (isBroadcaster) {
      startBroadcast();
    } else {
      listen2Broadcast();
    }
  };
}

export function startBroadcast(recording = true) {
  window.recording = true;
  initRecorder();

  window.connection.send("Started broadcast. You are the broadcaster");

  window.connection.onmessage = function(message) {
    console.log(message.data);
  };

  connection.onerror = function(error) {
    // an error occurred when sending/receiving data
  };
}

export function listen2Broadcast() {
  if (!window.streamAudioCtx) {
    window.streamAudioCtx = window.AudioContext || window.webkitAudioContext;
  }

  soundController.nextTime = 0;
  soundController.speakerContext = new streamAudioCtx();

  window.connection.send("Connected to broadcast. You are a listener");

  window.connection.onmessage = function(message) {
    if (typeof message.data === "string") {
      console.log(message.data);
      return;
    }

    console.log(">>> Receiving Audio Stream", message);

    var array = new Float32Array(message.data);
    var buffer = soundController.speakerContext.createBuffer(1, 2048, 44100);
    buffer.copyToChannel(array, 0);

    audioCache.push(buffer);
    // make sure we put at least 5 chunks in the buffer before starting
    if (init === true || (init === false && audioCache.length > 5)) {
      init = true;
      soundController.playCache(audioCache);
    }
  };

  soundController.playCache = function(cache) {
    while (cache.length) {
      var buffer = cache.shift();
      var source = soundController.speakerContext.createBufferSource();
      source.buffer = buffer;
      source.connect(soundController.speakerContext.destination);
      if (soundController.nextTime == 0) {
        // add a delay of 0.05 seconds
        soundController.nextTime =
          soundController.speakerContext.currentTime + 0.05;
      }
      source.start(soundController.nextTime);
      // schedule buffers to be played consecutively
      soundController.nextTime += source.buffer.duration;
    }
  };
}

window.onbeforeunload = function() {
  stopRecorder();
  window.connection.onclose = function() {}; // disable onclose handler first
  window.connection.close();
};

export function closeBroadcast() {
  window.connection.close();
  stopRecorder();
}
