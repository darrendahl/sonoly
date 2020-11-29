import { initRecorder, stopRecorder } from "./sono";
import { listeners, broadcastStatus } from './stores'
import { hri } from 'human-readable-ids'

let init = false;
let audioCache = [];
const soundController = {};

const WS_BASE_URL =
  process.env === "dev"
    ? "ws://127.0.0.1:3001"
    : "wss://sonoly-node.onrender.com";

export function initWsConnection(isBroadcaster, sessionId) {
  window.WebSocket = window.WebSocket || window.MozWebSocket;
  if(isBroadcaster){
    window.connection = new WebSocket(`${WS_BASE_URL}/broadcast?sessionId=${sessionId}&role=broadcaster`);
  } else {
    const listenerId = hri.random()
    window.connection = new WebSocket(`${WS_BASE_URL}/broadcast?sessionId=${sessionId}&role=listener&listenerId=${listenerId}`);
  }

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

  window.connection.send('broadcast started');

  window.connection.onmessage = function(message) {
    console.log(message)
    const newListeners = JSON.parse(message.data).map(d => d.listenerId)
    console.log(newListeners)
    listeners.update(l => newListeners)
  };

  connection.onerror = function(error) {
    // an error occurred when sending/receiving data
    console.error(error);
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
      if(message.data === 'Broadcast has ended'){
        broadcastStatus.update(b => message.data)
      }
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
      // console.log(source)
      source.start(soundController.nextTime);
      // schedule buffers to be played consecutively
      soundController.nextTime += source.buffer.duration;
    }
  };
}

window.onbeforeunload = function() {
  if (window.recording) {
    stopRecorder();
  }
  if (window.connection) {
    window.connection.onclose = function() {}; // disable onclose handler first
    window.connection.close();
  }
};

export function closeBroadcast() {
  if (window.connection) {
    window.connection.close();
  }
  if (window.recording) {
    stopRecorder();
  }
}
