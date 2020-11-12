<script>
  // Advanced Pad Settings:
  // set size of canvas
  // add multiplier to x,y
  // add min/max frequency,detune to x,y
  // switch (detune is x and freqency is y)
  // change pixel size from 2,2 - x,x

  import {playSweep, stopSweep, applyEffect, 
    clearEffect, clearImpulse, loadImpulse } from './sono'
  import api, { loadWavetables, loadingLock, loadImpulses, loadSounds } from './api.js';
  import SSelect from 'svelte-select'
  import DEFAULT_EFFECTS from './effects-list'

  let selectedWavetable
  let selectedEffect
  let selectedImpulse
  let selectedSound

  let wavetables
  let impulses
  let sounds
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
    sounds = await loadSounds();
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
    clearImpulse('keys')
  }

  const handleSelectImpulse = async (event) => {
    selectedImpulse = event.detail
    loadingLock('on')
    await loadImpulse(event.detail.file, 'pad')
    loadingLock('off')
  }

  const handleSelectSound = (event) => {
    selectedSound = event.detail
  }

  const handleClearSound = () => {
    selectedSound = null
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
  </div>
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
