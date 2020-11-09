import axios from "axios";

function initSono() {
	const AudioContext = window.AudioContext || window.webkitAudioContext;
	window.audioCtx = new AudioContext();
	window.sonoStore = {};
}

function stopNote(note) {
	console.log(note, sonoStore);
	if (sonoStore[`${note}_osc`] && sonoStore[`${note}_osc`].isPlaying) {
		sonoStore[`${note}_osc`].osc.stop(audioCtx.currentTime);
		sonoStore[`${note}_osc`] = null;
	}
}

function playNote(freq, note) {
	let osc, isPlaying;
	console.log(note, freq, sonoStore);
	if (!sonoStore[`${note}_osc`] || !sonoStore[`${note}_osc`].isPlaying) {
		sonoStore[`${note}_osc`] = {
			osc: audioCtx.createOscillator()
		};
	}
	osc = sonoStore[`${note}_osc`].osc;
	isPlaying = sonoStore[`${note}_osc`].isPlaying;
	osc.frequency.value = freq;
	osc.connect(audioCtx.destination);
	if (!isPlaying) {
		osc.start();
	}

	sonoStore[`${note}_osc`].isPlaying = true;
}

function playSweep({ x, y }, wavetableData) {
	const wavetable = wavetableData ? wavetableData : null;

	if (!sonoStore.wave || !sonoStore.osc) {
		sonoStore.wave = audioCtx.createPeriodicWave(wavetable.real, wavetable.imag, {
			disableNormalization: true
		});
		sonoStore.osc = audioCtx.createOscillator();
	}

	osc.setPeriodicWave(sonoStore.wave);
	// osc.type = 'sine'
	osc.frequency.value = x;

	osc.detune.value = (125 - y) * 4;
	osc.connect(audioCtx.destination);
	if (!sonoStore.isPlaying) {
		osc.start();
		sonoStore.isPlaying = true;
	}
}

function storeFile(buffer, uuid) {
	const source = audioCtx.createBufferSource();
	source.buffer = buffer;
	sonoStore[uuid] = source;
}

function loadFiles() {}

function playSound(uuid){
	const source = sonoStore[uuid]
	source.connect(audioCtx.destination)
	source.start(audioCtx.currentTime)
}


function stopSound(uuid){
	const source = sonoStore[uuid]
	source.stop(audioCtx.currentTime)
	storeFile(source.buffer, uuid)
}


// function loadFile(fileUrl, uuid) {
//   
//   var request = new XMLHttpRequest();
//
//   request.open('GET', fileUrl, true);
//
//   request.responseType = 'arraybuffer';
//
//
//   request.onload = function() {
//     var audioData = request.response;
//     console.log(request.response)
//
//     audioCtx.decodeAudioData(audioData, function(buffer) {

//         // source.loop = true;
//       },
//
//       function(e){ console.log("Error with decoding audio data" + e.err); });
//
//   }
//
//   request.send();
// }

function loadSounds(sounds) {
	const arr = sounds.map(s =>
		axios({ method: "get", url: s.file, responseType: "arraybuffer" }).then(response => ({
			...response,
			uuid: s.uuid
		}))
	);

	axios.all(arr).then(
		axios.spread((...responses) => {
			responses.forEach((r) => {
				audioCtx.decodeAudioData(r.data, (buffer) => {
					storeFile(buffer, r.uuid)
				})
			})
		})
	);
}

function loadFile(fileUrl, uuid) {
	axios({
		method: "get",
		url: fileUrl,
		responseType: "arraybuffer"
	}).then(response => {
		console.log(response.data);

		audioCtx.decodeAudioData(response.data, buffer => {
			storeFile(buffer, uuid);
		});
	});
}

function stopSweep() {
	if (!sonoStore.osc) return;
	sonoStore.osc.stop(audioCtx.currentTime + 0.0001);
	sonoStore.isPlaying = false;
	sonoStore.wave = null;
	sonoStore.osc = null;
}

export { initSono, playSweep, playNote, stopNote, stopSweep, loadFile, loadSounds, playSound, stopSound };
