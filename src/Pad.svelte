<script>
  import {playSweep, stopSweep} from './sono'
  import { loadWavetables, loadingLock } from './api.js';
  import Select from 'svelte-select'
  import axios from 'axios'

  let selectedWavetable
  let wavetableData
  let items
  let selectedInteractionType = 'mousemove'

  let interactionTypes = [{title: 'Mouse Move', id: 'mousemove'},
  {title: 'Mouse Down', id: 'mousedown'}]

  const optionIdentifier = 'id';
  const getOptionLabel = (option) => option.title;
  const getSelectionLabel = (option) => option.title;

  let m = {x: null, y: null}
  let prevM = {x: null, y: null}
  let to
  let count = 0
  let down = false

  function handleDown(evt){
    var canvas = document.getElementById('pad');

    console.log(evt)

    down = true

    var rect = canvas.getBoundingClientRect();

    prevM = m
    m.x = (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
    m.y = (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;

    if (canvas.getContext) {
      var ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.fillStyle = '#ff3e00';
      // ctx.moveTo(m.x, m.y);
      ctx.fillRect(m.x, m.y, 2, 2);
      // ctx.stroke();
      // ctx.moveTo(prevM.x, prevM.y);
      // ctx.lineTo(m.x, m.y);
      // ctx.strokeStyle = 'blue';
      // ctx.lineWidth = 1;
      // ctx.stroke();
      // ctx.closePath();
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


    console.log(evt)

    var rect = canvas.getBoundingClientRect();

    prevM = m
    m.x = (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
    m.y = (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;

    if (canvas.getContext) {
      var ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.fillStyle = '#ff3e00';
      // ctx.moveTo(m.x, m.y);
      ctx.fillRect(m.x, m.y, 2, 2);
      // ctx.stroke();
      // ctx.moveTo(prevM.x, prevM.y);
      // ctx.lineTo(m.x, m.y);
      // ctx.strokeStyle = 'blue';
      // ctx.lineWidth = 1;
      // ctx.stroke();
      // ctx.closePath();
      count++

      if(count % 10 === 0){
        console.log(m, count)
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
    items = await loadWavetables()
    console.log(items)
  }

  const handleSelect = async (event) => {
    loadingLock('on')
    const response = await axios.get(event.detail.file)
    console.log('loaded', event.detail.title)
    loadingLock('off')
    wavetableData = response.data
  }

  function handleSelectType(event){
    selectedInteractionType = event.detail.id
  }

  loadOptions()


</script>

<div class="select">
  <Select {items} {optionIdentifier} {getSelectionLabel} {getOptionLabel} bind:selectedWavetable on:select={handleSelect} placeholder="Select Wavetable"></Select>
</div>

<canvas id="pad" width="500" height="250" on:mousedown={handleDown} on:mousemove={handleMove} on:mouseout={stopPlaying} on:mouseup={stopPlaying}></canvas>
<style>
    .select {
      width: 200px;
      margin: 0 auto;
      margin-top: 25px;
      margin-bottom: 25px;
    }

  canvas{
    border: 1px solid #0f0f0f;
    background: #f3f3f3;
    border-radius: 1px;
    margin: 0 auto;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
  }
</style>