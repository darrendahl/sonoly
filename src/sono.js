import api from "./api";
import axios from "axios";
import BPM_TIME_KEY from "./bpm-time-key";
import { getTunaEffect } from "./init-tuna-effects";
import Tuna from "tunajs"
import smoothfade from 'smoothfade'
import { sendData } from './api'


function initSono() {
	const bufferSize = 2048;
	const AudioContext = window.AudioContext || window.webkitAudioContext;
	window.audioCtx = new AudioContext();
	window.sonoStore = {};
	window.tuna = new Tuna(window.audioCtx);
	window.globalGain = audioCtx.createGain()
	window.recorder = audioCtx.createScriptProcessor(bufferSize, 1, 1)
	recorder.onaudioprocess = recorderProcess
	globalGain.connect(recorder)
	recorder.connect(audioCtx.destination)
}

function stopNote(note, isFade) {
	if (sonoStore[`${note}_osc`] && sonoStore[`${note}_osc`].isPlaying) {

		if(isFade){
			const gain = sonoStore[`${note}_osc`].gain
			const sm = smoothfade(window.audioCtx, gain, {fadeLength: 0.5})
			sm.fadeOut()
		} else {
			sonoStore[`${note}_osc`].osc.stop(audioCtx.currentTime + 0.1);
		}
		sonoStore[`${note}_osc`] = null;
	}
}

function playNote(freq, note) {
	let osc, gain, isPlaying;
	if (!sonoStore[`${note}_osc`] || !sonoStore[`${note}_osc`].isPlaying) {
		sonoStore[`${note}_osc`] = {
			osc: audioCtx.createOscillator(),
			gain: audioCtx.createGain()
		};
	}
	osc = sonoStore[`${note}_osc`].osc;
	gain = sonoStore[`${note}_osc`].gain;

	isPlaying = sonoStore[`${note}_osc`].isPlaying;
	osc.frequency.value = freq;

	if (sonoStore.currentEffect_keys) {
		const effect = sonoStore.currentEffect_keys.effect;
		gain.connect(effect);
		effect.connect(audioCtx.destination);
	}

	if (sonoStore.currentImpulse_keys) {
		const impulseNode = sonoStore.currentImpulse_keys.source;
		// osc.connect(impulseNode);
		gain.connect(impulseNode)
		impulseNode.connect(audioCtx.destination);
	}

	osc.connect(gain);
	// gain.connect(audioCtx.destination);
	gain.gain.value = 0.3;
	gain.connect(globalGain)
	globalGain.connect(audioCtx.destination);

	if (!isPlaying) {
		osc.start();
	}

	sonoStore[`${note}_osc`].isPlaying = true;
}

function playSweep({ x, y }, wavetableData) {
	const wavetable = wavetableData ? wavetableData : null;
	let osc, gain;
	if (!sonoStore.osc) {
		sonoStore.osc = audioCtx.createOscillator();
		sonoStore.gain = audioCtx.createGain();
	}
	osc = sonoStore.osc;
	gain = sonoStore.gain;

	if (!sonoStore.wave && wavetable) {
		sonoStore.wave = audioCtx.createPeriodicWave(
			wavetable.real,
			wavetable.imag,
			{
				disableNormalization: true
			}
		);
		osc.setPeriodicWave(sonoStore.wave);
	}

	// osc.type = 'sine'
	osc.frequency.value = x;

	osc.detune.value = 125 - y;

	if (sonoStore.currentEffect_pad) {
		const effect = sonoStore.currentEffect_pad.effect;
		osc.connect(effect);
		effect.connect(audioCtx.destination);
	}

	if (sonoStore.currentImpulse_pad) {
		const impulseNode = sonoStore.currentImpulse_pad.source;
		osc.connect(impulseNode);
		impulseNode.connect(audioCtx.destination);
	}

	osc.connect(gain);
	gain.gain.value = 0.3;
	gain.connect(globalGain)
	globalGain.connect(audioCtx.destination);

	if (!sonoStore.isPlaying) {
		osc.start();
		sonoStore.isPlaying = true;
	}
}

function clearFile(playerId, instr) {
	sonoStore[`${playerId}_${instr}`] = null
}

function storeFile(buffer, playerId, instr, playbackRate = 1) {
	const source = audioCtx.createBufferSource();
	const gain = audioCtx.createGain();
	source.buffer = buffer;
	source.playbackRate.value = playbackRate;

	sonoStore[`${playerId}_${instr}`] = {
		source: source,
		gain: gain,
		isPlaying: false
	};
}

function storeImpulse(buffer, instr) {
	const source = audioCtx.createConvolver();
	source.buffer = buffer;
	sonoStore[`currentImpulse_${instr}`] = {
		source: source
	};
}


function recorderProcess (e) {
  const left = e.inputBuffer.getChannelData(0);
  if (window.recording === true) {
    const chunk = left;
    window.connection.send(chunk);
  }
};

function playSound(playerId, instr, isLoop = false, timeUntilPlay = 0, playbackRate) {
	if (!sonoStore[`${playerId}_${instr}`]) return;

	if (sonoStore[`${playerId}_${instr}`].isPlaying) {
		const newSource = audioCtx.createBufferSource();
		const newGain = audioCtx.createGain();
		newSource.buffer = sonoStore[`${playerId}_${instr}`].source.buffer;
		newSource.playbackRate.value =
			sonoStore[`${playerId}_${instr}`].source.playbackRate.value;
		sonoStore[`${playerId}_${instr}`] = {
			source: newSource,
			isPlaying: false,
			gain: newGain
		};
	}

	const { source, gain, isPlaying } = sonoStore[`${playerId}_${instr}`];

	if(playbackRate){
		source.playbackRate.value = playbackRate	
	}

	if (sonoStore.currentEffect_keys && instr === "keys") {
		const effect = sonoStore.currentEffect_keys.effect;
		source.connect(effect);
		effect.connect(audioCtx.destination);
	}

	if (sonoStore.currentImpulse_keys && instr === "keys") {
		const impulseNode = sonoStore.currentImpulse_keys.source;
		source.connect(impulseNode);
		impulseNode.connect(audioCtx.destination);
	}

	source.loop = isLoop;
	// source.connect(audioCtx.destination);

	source.connect(gain);
	// gain.connect(audioCtx.destination);
	gain.gain.value = 0.5;

	gain.connect(globalGain)
	globalGain.connect(audioCtx.destination)
	

	source.start(audioCtx.currentTime + timeUntilPlay);
	sonoStore[`${playerId}_${instr}`].isPlaying = true;
}

function getSource(playerId, instr) {
	return sonoStore[`${playerId}_${instr}`].source;
}

function startLoop(loop) {
	if (!sonoStore.baseLoop) {
		sonoStore.baseLoop = {
			loop,
			source: getSource(loop.id, "looper"),
			timeStarted: audioCtx.currentTime
		};
		playSound(loop.id, "looper", true);
		return 0;
	} else {
		let currentTime = audioCtx.currentTime - sonoStore.baseLoop.timeStarted;
		let playOn = BPM_TIME_KEY[String(sonoStore.baseLoop.loop.selected.bpm)];
		let timeUntilPlay = playOn - (currentTime % playOn);

		playSound(loop.id, "looper", true, timeUntilPlay);
		return Number(timeUntilPlay.toFixed(1));
	}
}

const getPlayingList = instr => {
	const arr = [];

	Object.keys(sonoStore).forEach(key => {
		if (key.includes(instr) && sonoStore[key].isPlaying) {
			arr.push(sonoStore[key]);
		}
	});

	return arr;
};

function stopLoop(loop) {
	let currentTime = audioCtx.currentTime - sonoStore.baseLoop.timeStarted;
	let playOn = BPM_TIME_KEY[String(sonoStore.baseLoop.loop.selected.bpm)];
	let timeUntilStop =
		playOn -
		(currentTime % playOn) / sonoStore.baseLoop.source.playbackRate.value;
	stopSound(loop.id, "looper", timeUntilStop);
	const list = getPlayingList("looper");
	if (list.length === 0) {
		sonoStore.baseLoop = null;
	}
	return Number(timeUntilStop.toFixed(1));
}

function changeBpm(looper, newBpm) {
	const source = getSource(looper.id, "looper");
	const loop = looper.selected;
	const newPlaybackRate = newBpm / loop.originalBpm;
	if (sonoStore.baseLoop && sonoStore.baseLoop.loop.id === loop.id) {
		sonoStore.baseLoop.loop.selected.bpm = newBpm;
	}
	source.playbackRate.value = newPlaybackRate;
}

function stopSound(playerId, instr, timeUntilStop = 0) {
	if (!sonoStore[`${playerId}_${instr}`]) return;
	const { source } = sonoStore[`${playerId}_${instr}`];
	const playbackRate = source.playbackRate.value;
	source.stop(audioCtx.currentTime + timeUntilStop);
	storeFile(source.buffer, playerId, instr, playbackRate);
}

function loadSounds(soundKeys) {
	const arr = soundKeys.map(sk =>
		api({
			method: "get",
			url: sk.sound.file,
			responseType: "arraybuffer"
		}).then(response => ({
			...response,
			key_code: sk.key_code.code
		}))
	);

	return axios.all(arr).then(
		axios.spread((...responses) => {
			responses.forEach(r => {
				audioCtx.decodeAudioData(r.data, buffer => {
					storeFile(buffer, r.key_code, "keys");
				});
			});
		})
	);
}

function loadFile(fileUrl, playerId, instr) {
	return api({
		method: "get",
		url: fileUrl,
		responseType: "arraybuffer"
	}).then(response => {
		audioCtx.decodeAudioData(response.data, buffer => {
			storeFile(buffer, playerId, instr);
		});
	});
}

function loadImpulse(fileUrl, instr) {
	return api({
		method: "get",
		url: fileUrl,
		responseType: "arraybuffer"
	}).then(response => {
		audioCtx.decodeAudioData(response.data, buffer => {
			storeImpulse(buffer, instr);
		});
	});
}

function getIsPlaying(playerId, instr) {
	return sonoStore[`${playerId}_${instr}`]?.isPlaying;
}

function stopSweep() {
	if (!sonoStore.osc) return;
	sonoStore.osc.stop(audioCtx.currentTime + 0.0001);
	sonoStore.isPlaying = false;
	sonoStore.wave = null;
	sonoStore.osc = null;
}

function applyEffect(effectId, instr) {
	const effect = getTunaEffect(effectId);
	sonoStore[`currentEffect_${instr}`] = {
		effectId: effectId,
		effect
	};
}

function clearEffect(instr) {
	sonoStore[`currentEffect_${instr}`] = null;
}

function applyImpulse(effectId, instr) {
	const effect = getTunaEffect(effectId);
	sonoStore[`currentImpulse_${instr}`] = effect;
}

function clearImpulse(instr) {
	sonoStore[`currentImpulse_${instr}`] = null;
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
	changeBpm,
	getIsPlaying,
	stopLoop,
	applyEffect,
	clearEffect,
	loadImpulse,
	clearImpulse
};
