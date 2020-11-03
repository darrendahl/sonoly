import wavetable from './wavetables/Bass'

function initSono(){
	const AudioContext = window.AudioContext || window.webkitAudioContext;
	window.audioCtx = new AudioContext();	
}

function playSweep({x,y}, useWave=true) {
	if(!window.wave || !window.osc){
		window.wave = audioCtx.createPeriodicWave(wavetable.real, wavetable.imag, {disableNormalization: true});
		window.osc = audioCtx.createOscillator();		
	}

	console.log(wave)
	osc.setPeriodicWave(wave);
	// osc.type = 'sine'
	osc.frequency.value = x;

	osc.detune.value = (125 - y) * 20;

	console.log(osc.frequency.value, osc.detune.value)
	osc.connect(audioCtx.destination);
	if(!window.isPlaying){
		osc.start();
		window.isPlaying = true
	}

	
	return sono
}

function stop(){
	if(!window.osc) return
	window.osc.stop(audioCtx.currentTime + 0.1);
	window.isPlaying = false
	window.wave = null
	window.osc = null
}

function sono(){
	return {
		playSweep,
		stop
	}	
}
export { initSono }
export default sono
