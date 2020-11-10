import axios from "axios";
import BPM_TIME_KEY from './bpm-time-key'

function initSono() {
	const AudioContext = window.AudioContext || window.webkitAudioContext;
	window.audioCtx = new AudioContext();
	window.sonoStore = {};
}

function stopNote(note) {
	if (sonoStore[`${note}_osc`] && sonoStore[`${note}_osc`].isPlaying) {
		sonoStore[`${note}_osc`].osc.stop(audioCtx.currentTime);
		sonoStore[`${note}_osc`] = null;
	}
}

function playNote(freq, note) {
	let osc, isPlaying;
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

function storeFile(buffer, playerId, playerType) {
	const source = audioCtx.createBufferSource();
	source.buffer = buffer;
	sonoStore[`${playerId}_${playerType}`] = {
		source: source,
		isPlaying: false
	};
}

function loadFiles() {}

function playSound(playerId, playerType, isLoop, timeUntilPlay = 0) {
	if(!sonoStore[`${playerId}_${playerType}`]) return 

	if (sonoStore[`${playerId}_${playerType}`].isPlaying) {
		const newSource = audioCtx.createBufferSource();
		newSource.buffer = sonoStore[`${playerId}_${playerType}`].source.buffer;
		sonoStore[`${playerId}_${playerType}`] = {
			source: newSource,
			isPlaying: false
		};
	}

	const { source, isPlaying } = sonoStore[`${playerId}_${playerType}`];
	source.loop = isLoop
	source.connect(audioCtx.destination);
	source.start(audioCtx.currentTime + timeUntilPlay);
	sonoStore[`${playerId}_${playerType}`].isPlaying = true;
}

function getSource(playerId, playerType){
	return sonoStore[`${playerId}_${playerType}`].source
}

function startLoop(loop) {
	if(!sonoStore.baseLoop){
		sonoStore.baseLoop = {
			loop,
			source: getSource(loop.id, 'looper'),
			timeStarted: audioCtx.currentTime
		}
		playSound(loop.id, 'looper', true)
		return 0
	} else {
		let currentTime = (audioCtx.currentTime - sonoStore.baseLoop.timeStarted);
		let playOn = BPM_TIME_KEY[String(sonoStore.baseLoop.loop.selected.bpm)]
		let timeUntilPlay = playOn - ((currentTime % playOn) / sonoStore.baseLoop.source.playbackRate.value);
		playSound(loop.id, 'looper', true, timeUntilPlay)
		return Number(timeUntilPlay.toFixed(1))
	}
}

function stopLoop(loop) {
	let currentTime = (audioCtx.currentTime - sonoStore.baseLoop.timeStarted);
	let playOn = BPM_TIME_KEY[String(sonoStore.baseLoop.loop.selected.bpm)]
	let timeUntilStop = playOn - ((currentTime % playOn) / sonoStore.baseLoop.source.playbackRate.value);
	console.log(timeUntilStop, playOn, currentTime)
	stopSound(loop.id, 'looper', timeUntilStop)
	return Number(timeUntilStop.toFixed(1))
}

function changePlaybackRate(looper, newPlaybackRate){
	const source = getSource(looper.id, 'looper')
	source.playbackRate.value = newPlaybackRate
}

function stopSound(playerId, playerType, timeUntilStop=0) {
	const { source } = sonoStore[`${playerId}_${playerType}`];
	source.stop(audioCtx.currentTime + timeUntilStop);
	storeFile(source.buffer, playerId, playerType);
}

function loadSounds(soundKeys) {
	const arr = soundKeys.map(sk =>
		axios({ method: "get", url: sk.sound.file, responseType: "arraybuffer" }).then(response => ({
			...response,
			key_code: sk.key_code.code
		}))
	);

	return axios.all(arr).then(
		axios.spread((...responses) => {
			responses.forEach(r => {
				audioCtx.decodeAudioData(r.data, buffer => {
					storeFile(buffer, r.key_code, 'key');
				});
			});
		})
	);
}

function loadFile(fileUrl, playerId, playerType) {
	return axios({
		method: "get",
		url: fileUrl,
		responseType: "arraybuffer"
	}).then(response => {
		audioCtx.decodeAudioData(response.data, buffer => {
			storeFile(buffer, playerId, playerType);
		});
	});
}

function getIsPlaying(playerId, playerType){
	return sonoStore[`${playerId}_${playerType}`]?.isPlaying
}

function stopSweep() {
	if (!sonoStore.osc) return;
	sonoStore.osc.stop(audioCtx.currentTime + 0.0001);
	sonoStore.isPlaying = false;
	sonoStore.wave = null;
	sonoStore.osc = null;
}

export {
	initSono,
	playSweep,
	playNote,
	stopNote,
	stopSweep,
	loadFile,
	loadSounds,
	playSound,
	stopSound,
	startLoop,
	changePlaybackRate,
	getIsPlaying,
	stopLoop
};
