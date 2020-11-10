<script>
  import { playNote, stopNote, loadFile, loadSounds, playSound, stopSound, startLoop, changePlaybackRate, getIsPlaying } from "./sono";
  import { onDestroy } from "svelte";
  import { loadLoops, loadingLock } from "./api.js";
  import Select from "svelte-select";
  import axios from "axios";
  import shortid from 'shortid'

  let loopers = [
    {title: 'Beat', options: [], id: shortid.generate()}, 
    {title: 'Instrumental', options: [], id: shortid.generate()}, 
    {title: 'Vocal', options: [], id: shortid.generate()}, 
    {title: 'Other', options: [], id: shortid.generate()}
  ];

  let items
  let selectedOption
  let counter = {id: '', count: 0}

  onDestroy(() => {
    
  });

  const optionIdentifier = "uuid";
  const getOptionLabel = option => `${option.title} - ${option.bpm}BPM`;
  const getSelectionLabel = option => `${option.title}`;

  function changeBpm(e, looper){
    const loop = looper.selected
    const newBpm = e.target.value
    const playbackRate = newBpm / loop.originalBpm
    changePlaybackRate(looper, playbackRate)
  }

  const loadOptions = async () => {
    items = await loadLoops();
    loopers = loopers.map((l) => {
      return {
        ...l,
        options: items.filter((i) => i.loop_type.title === l.title)
      }
    })
  };

  const handleStartLoop = (loop) => {
    let  countNum = startLoop(loop)


    loopers = loopers.map((l) => l.id === loop.id ? ({...l, isPlaying: true}): l)

    if(countNum !== 0){
      counter = {id: loop.id, count: countNum}
      const interval = setInterval(() => {
        counter = {
          id: loop.id,
          count: counter.count - 1
        }
        if(counter.count === 0){
          clearInterval(interval)
        }  
      }, 1000)
    }
  }

  const handleStopNow = (loop) => {
    stopSound(loop.id, 'looper')
    loopers = loopers.map((l) => l.id === loop.id ? ({...l, isPlaying: false}): l)
  }

  const handleStopLoop = (loop) => {
    let  countNum = stopLoop(loop)
    loopers = loopers.map((l) => l.id === loop.id ? ({...l, isPlaying: false}): l)

    if(countNum !== 0){
      counter = {id: loop.id, count: countNum}
      const interval = setInterval(() => {
        counter = {
          id: loop.id,
          count: counter.count - 1
        }
        if(counter.count === 0){
          clearInterval(interval)
        }  
      }, 1000)
    }
  }

  const handleSelect = async (event, looper) => {
    loopers = loopers.map((l) => {
      if(looper.title === l.title){
        return {
          ...l,
          selected: {
            ...event.detail,
            originalBpm: event.detail.bpm
          }
        }
      } else {
        return l
      }
    })
    loadingLock('on')
    await loadFile(event.detail.file, looper.id, 'looper')
    loadingLock('off')
  }

  loadOptions();
</script>

<style>
  .looper {
    width: 100%;
    border: 1px solid #cfcfcf;
    margin: 8px;
    padding: 12px;
    background: #f7f7f7;
  }

  .select {
    width: 270px;
    margin: 0 auto;
    margin-top: 12px;
  }

  .looper-container {

    width: 800px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;    
  }

  .tab{
    border: 1px solid #ff3e00;
    padding: 4px;
    cursor: pointer;
    margin-right: 8px;
    background: white;
  }

  .bpm{
    height: 28px;
    width: 80px;
    margin: 0;
    border: 1px solid #ff0000;
    border-radius: 0;
    padding: 4px;
    margin-right: 8px;
  }


  .tab:hover, .tab.selected{
    background: #ff3e00;
    color: white;
  }

  .loop-header {
    margin-top: 12px;
  }

  .looper-container>div {
    flex: 0 44%;
  }

  .disabled {
    border:  1px solid #efefef;
  }
  .controls-container{
    
    margin: 0 auto;
    margin-top: 12px;
    width: 300px;
    display: flex;
    justify-content: center;
  }

  .bpm-container{
    position: relative;
  }

  .bpm-label{
    position: absolute;
    right: 12px;
    top: 5px;
    color: #adadad;
  }

  .bpm:hover ~ .bpm-label{
    display: none;
  }
</style>

<section>
  <div class="select">

  </div>

  <section class="looper-container">
    {#each loopers as loop}
      <div class="looper">
        <div class="loop-header">
          {loop.title}
        </div>
        <div class="select">
          <Select items={loop.options} {optionIdentifier} {getSelectionLabel} {getOptionLabel} on:select={(e) => handleSelect(e, loop)} placeholder="Select Loop"></Select>
        </div>

        {#if loop.selected}
          <div class="controls-container">
            {#if !loop.isPlaying}
              <div class="tab" on:click={() => handleStartLoop(loop)}>Start Loop</div>
            {:else }
              {#if counter.id === loop.id && counter.count !== 0 }
                <div class="tab" on:click={() => handleStopLoop(loop)}>{counter.count}</div>
              {:else}
                <div class="tab" on:click={() => handleStopLoop(loop)}>Stop Loop</div>
              {/if}
            {/if}
            {#if !loop.isPlaying}
              <div class="tab">Play Once</div>
            {:else }
              <div class="tab" on:click={() => handleStopNow(loop)}>Stop Now</div>
            {/if}
            <div class="bpm-container">
              <input class="bpm" type="number" name="" value={loop.selected.bpm} placeholder="BPM" on:change={(e) => changeBpm(e, loop)} />
              {#if loop.selected.bpm}
              <label class="bpm-label">BPM</label>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </section>
</section>
