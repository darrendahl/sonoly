export function getTunaEffect(effectId) {
  if (effectId === "chorus") {
    return new window.tuna.Chorus({
      rate: 1.5, //0.01 to 8+
      feedback: 0.4, //0 to 1+
      depth: 0.7, //0 to 1
      delay: 0.0045, //0 to 1
      bypass: 0 //the value 1 starts the effect as bypassed, 0 or 1
    });
  } else if (effectId === "delay") {
    return new window.tuna.Delay({
      feedback: 0.45, //0 to 1+
      delayTime: 100, //1 to 10000 milliseconds
      wetLevel: 0.5, //0 to 1+
      dryLevel: 1, //0 to 1+
      cutoff: 20000, //cutoff frequency of the built in lowpass-filter. 20 to 22050
      bypass: 0
    });
  } else if (effectId === "phaser") {
    return new window.tuna.Phaser({
      rate: 0.1, //0.01 to 8 is a decent range, but higher values are possible
      depth: 0.6, //0 to 1
      feedback: 0.7, //0 to 1+
      stereoPhase: 40, //0 to 180
      baseModulationFrequency: 700, //500 to 1500
      bypass: 0
    });
  } else if (effectId === "overdrive") {
    return new window.tuna.Overdrive({
      outputGain: 0, //-42 to 0 in dB
      drive: 1, //0 to 1
      curveAmount: 0.725, //0 to 1
      algorithmIndex: 0, //0 to 5, selects one of the drive algorithms
      bypass: 0
    });
  } else if (effectId === "compressor") {
    return new window.tuna.Compressor({
      threshold: -20, //-100 to 0
      makeupGain: 1, //0 and up (in decibels)
      attack: 1, //0 to 1000
      release: 250, //0 to 3000
      ratio: 4, //1 to 20
      knee: 5, //0 to 40
      automakeup: false, //true/false
      bypass: 0
    });
  } else if (effectId === "filter") {
    return new window.tuna.Filter({
      frequency: 800, //20 to 22050
      Q: 1, //0.001 to 100
      gain: 0, //-40 to 40 (in decibels)
      filterType: "lowpass", //lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass
      bypass: 0
    });
  } else if (effectId === "tremolo") {
    return new window.tuna.Tremolo({
      intensity: 0.3, //0 to 1
      rate: 5, //0.001 to 8
      stereoPhase: 0, //0 to 180
      bypass: 0
    });
  } else if (effectId === "wahwah") {
    // wahwah is broken
    return new window.tuna.WahWah({
      automode: true, //true/false
      baseFrequency: 0.5, //0 to 1
      excursionOctaves: 2, //1 to 6
      sweep: 0.2, //0 to 1
      resonance: 10, //1 to 100
      sensitivity: 0.5, //-1 to 1
      bypass: 0
    });
  } else if (effectId === "bitcrusher") {
    return new window.tuna.Bitcrusher({
      bits: 4, //1 to 16
      normfreq: 0.1, //0 to 1
      bufferSize: 4096 //256 to 16384
    });
  } else if (effectId === "moogfilter") {
    return new window.tuna.MoogFilter({
      cutoff: 0.065, //0 to 1
      resonance: 3.5, //0 to 4
      bufferSize: 4096 //256 to 16384
    });
  } else if (effectId === "pingpongdelay") {
    return new window.tuna.PingPongDelay({
      wetLevel: 0.5, //0 to 1
      feedback: 0.3, //0 to 1
      delayTimeLeft: 200, //1 to 10000 (milliseconds)
      delayTimeRight: 400 //1 to 10000 (milliseconds)
    });
  }
}
