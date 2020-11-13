<script>
  // Advanced Pad Settings:
  // set size of canvas
  // add multiplier to x,y
  // add min/max frequency,detune to x,y
  // switch (detune is x and freqency is y)
  // change pixel size from 2,2 - x,x

  import {playSweep, stopSweep, applyEffect, 
    clearEffect, clearImpulse, loadImpulse } from './sono'
  import api, { loadWavetables, loadingLock, loadImpulses, loadSingleSamples } from './api.js';
  import SSelect from 'svelte-select'
  import DEFAULT_EFFECTS from './effects-list'

  let selectedWavetable
  let selectedEffect
  let selectedImpulse
  let selectedSingleSample

  let wavetables
  let impulses
  let singleSamples
  let effects

  let wavetableData

  const idOptionIdentifier = 'id';
  const optionIdentifier = 'uuid';
  const getOptionLabel = (option) => option.title;
  const getSelectionLabel = (option) => option.title;

  let m = {x: null, y: null}
  let prevM = {x: null, y: null}
  let to
  let count = 0
  let down = false

  function handleDown(evt){
    var canvas = document.getElementById('pad');
    down = true

    var rect = canvas.getBoundingClientRect();

    prevM = m
    m.x = (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
    m.y = (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;

    if (canvas.getContext) {
      var ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.fillStyle = '#ff3e00';
      ctx.fillRect(m.x, m.y, 2, 2);
      count++
      playSweep(m, wavetableData)
      clearTimeout(to)
      to = setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }, 100)
    }
  }

  function handleMove(evt){
    if(!down) return
    var canvas = document.getElementById('pad');
    var rect = canvas.getBoundingClientRect();

    prevM = m
    m.x = (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
    m.y = (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;

    if (canvas.getContext) {
      var ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.fillStyle = '#ff3e00';
      ctx.fillRect(m.x, m.y, 2, 2);
      count++

      if(count % 10 === 0){
        playSweep(m, wavetableData)
      }

      clearTimeout(to)
      to = setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }, 100)
    }
  }

  function stopPlaying(){
    down = false
    stopSweep()
  }

  const loadOptions = async () => {
    effects = DEFAULT_EFFECTS
    singleSamples = await loadSingleSamples();
    wavetables = await loadWavetables()
    impulses = await loadImpulses();
  }

  const handleSelectWavetable = async (event) => {
    loadingLock('on')
    const response = await api.get(event.detail.file)
    loadingLock('off')
    wavetableData = response.data
  }

  const handleClearWavetable = async (event) => {
    wavetableData = null
    selectedWavetable = null  
  }


  function handleSelectType(event){
    selectedInteractionType = event.detail.id
  }

  const handleClearEffect = () => {
    selectedEffect = null
    clearEffect('pad')
  }

  const handleSelectEffect = (event) => {
    selectedEffect = event.detail
    applyEffect(event.detail.id, 'pad')
  }

  const handleClearImpulse = () => {
    selectedImpulse = null
    clearImpulse('pad')
  }

  const handleSelectImpulse = async (event) => {
    selectedImpulse = event.detail
    loadingLock('on')
    await loadImpulse(event.detail.file, 'pad')
    loadingLock('off')
  }

  const handleClearSingleSample = () => {
    selectedSingleSample = null
  }

  const handleSelectSingleSample = async (event) => {
    selectedSingleSample = event.detail
    loadingLock('on')
    await loadFile(selectedSingleSample.file, 'freqkit_sound', 'pad')
    loadingLock('off')
  }

  loadOptions()
</script>

<div class="select-container">
  <div class="select">
    <SSelect
      items="{wavetables}"
      {optionIdentifier}
      {getSelectionLabel}
      {getOptionLabel}
      bind:selectedWavetable
      on:clear="{handleClearWavetable}"
      on:select="{handleSelectWavetable}"
      placeholder="Sounds: Wavetable"
    ></SSelect>
  </div>
  <!-- 
  TODO: Single samples
  <div class="select">
    <SSelect
      items="{sounds}"
      {optionIdentifier}
      {getSelectionLabel}
      {getOptionLabel}
      bind:selectedSound
      on:clear="{handleClearSound}"
      on:select="{handleSelectSound}"
      placeholder="Sounds: Single-Sound"
    ></SSelect>
  </div> -->
</div>

<div class="select-container">
  <div class="select">
    <SSelect
      items="{impulses}"
      {optionIdentifier}
      {getSelectionLabel}
      {getOptionLabel}
      bind:selectedImpulse
      on:clear="{handleClearImpulse}"
      on:select="{handleSelectImpulse}"
      placeholder="Effects: Impulse"
    ></SSelect>
  </div>
  <div class="select">
    <SSelect
      items="{effects}"
      optionIdentifier={idOptionIdentifier}
      {getSelectionLabel}
      {getOptionLabel}
      bind:selectedEffect
      on:clear="{handleClearEffect}"
      on:select="{handleSelectEffect}"
      placeholder="Effects: Tuna Effect"
    ></SSelect>
  </div>
</div>

<canvas
  id="pad"
  width="500"
  height="250"
  on:mousedown="{handleDown}"
  on:mousemove="{handleMove}"
  on:mouseout="{stopPlaying}"
  on:mouseup="{stopPlaying}"
></canvas>
<style>
  .select-container {
    display: flex;
    width: 430px;
    margin: 0 auto;
    margin-bottom: 24px;
  }

  .select {
    width: 200px;
    margin: 0 auto;
  }
  canvas {
    border: 1px solid #0f0f0f;
    background: #f3f3f3;
    border-radius: 1px;
    margin: 0 auto;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
  }
</style>
