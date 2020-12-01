<script>
  // Advanced Looper Settings:
  // Bars: loop starts after x bars (default 1)
  // Bars: loop plays for x bars after starting (default ~)
  // Time signature: 4/4 (disabled)
  // Time offset: in seconds (default 0)
  // add ability for a ghost looper (only for keeping time, doesnt play anything)
  // disable timing
  // disable looping

  import { playNote, stopNote, loadFile, loadSounds, playSound, stopSound, startLoop, changeBpm, getIsPlaying, stopLoop } from "./sono";
  import { onDestroy } from "svelte";
  import { loadLoops, loadingLock } from "./api.js";
  import Select from "svelte-select";
  import shortid from 'shortid'

  let loopers = [
    {title: 'Beat', options: [], id: shortid.generate(), count: 0}, 
    {title: 'Instrumental', options: [], id: shortid.generate(), count: 0}, 
    {title: 'Vocal', options: [], id: shortid.generate(), count: 0}, 
    {title: 'Other', options: [], id: shortid.generate(), count: 0}
  ];

  let items
  let selectedOption
  let counterMap = {}
  let isPlayingMap = {}

  onDestroy(() => {
    
  });

  const optionIdentifier = "uuid";
  const getOptionLabel = option => `${option.title} - ${option.bpm} bpm`;
  const getSelectionLabel = option => `${option.title}`;


  function handleChangeBpm(e, looper){
    const selectedLoop = looper.selected
    const newBpm = Number(e.target.value)

    const newLooper = {
      ...looper,
      selected: {
        ...selectedLoop,
        bpm: newBpm
      }
    }
    loopers = loopers.map((l) => l.id === looper.id ? (newLooper): l)
    changeBpm(newLooper, newBpm)
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
    let countNum = startLoop(loop)    
    if(countNum !== 0){
      const interval = setInterval(() => {
        countNum = Number(Number(countNum - 0.1).toFixed(1))
        loopers = loopers.map((l) => l.id === loop.id ? ({...l, count: countNum}): l)
        if(countNum <= 0){
          loopers = loopers.map((l) => l.id === loop.id ? ({...l, isPlaying: true, count: 0}): l)
          clearInterval(interval)
        }  
      }, 100)
    } else {
      loopers = loopers.map((l) => l.id === loop.id ? ({...l, isPlaying: true }) : l)
    }
  }

  const handleStopNow = (loop) => {
    stopSound(loop.id, 'looper')
    loopers = loopers.map((l) => l.id === loop.id ? ({...l, isPlaying: false}): l)
  }

  const handleStopLoop = (loop) => {
    let countNum = stopLoop(loop)
    if(countNum !== 0){
      const interval = setInterval(() => {
        countNum = Number(Number(countNum - 0.1).toFixed(1))
        loopers = loopers.map((l) => l.id === loop.id ? ({...l, count: countNum}): l)

        if(countNum <= 0){
          loopers = loopers.map((l) => l.id === loop.id ? ({...l, isPlaying: false, count: 0}): l)
          clearInterval(interval)
        }  
      }, 100)
    } else {
      loopers = loopers.map((l) => l.id === loop.id ? ({...l, isPlaying: false }) : l)
    }
  }

  const handleClear = (looper) => {
    loopers = loopers.map((l) => {
      if(looper.title === l.title){
        return {
          ...l,
          selected: null
        }
      } else {
        return l
      }
    })
  }

  const handleSelect = async (event, looper) => {
    const bpm = window.sonoStore.baseLoop ? window.sonoStore.baseLoop.loop.selected.bpm : event.detail.bpm
    const originalBpm = event.detail.bpm
    const playbackRate = Number(bpm) / Number(originalBpm)
    loopers = loopers.map((l) => {
      if(looper.title === l.title){
        return {
          ...l,
          selected: {
            ...event.detail,
            bpm,
            originalBpm 
          }
        }
      } else {
        return l
      }
    })
    loadingLock('on')
    await loadFile(event.detail.file, looper.id, 'looper', playbackRate)
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
  <form>
    <input type="hidden" autocomplete="false" name="">
      <section class="looper-container">
        {#each loopers as loop}
          <div class="looper">
            <div class="loop-header">
              {loop.title}
            </div>
            <div class="select">
              <Select isDisabled={loop.isPlaying} items={loop.options} {optionIdentifier} {getSelectionLabel} {getOptionLabel}
              on:clear={(e) => handleClear(loop)}
              on:select={(e) => handleSelect(e, loop)}  placeholder="Sounds: Loop"></Select>
            </div>

            {#if loop.selected}
              <div class="controls-container">
                {#if loop.count > 0}
                    <div class="tab" on:click={() => handleStopLoop(loop)}>{Number(loop.count).toFixed(1)}</div>
                {:else }
                  {#if loop.isPlaying }
                    <div class="tab" on:click={() => handleStopLoop(loop)}>Stop Loop</div>
                  {:else}
                    <div class="tab" on:click={() => handleStartLoop(loop)}>Start Loop</div>
                  {/if}
                {/if}
                <div class="bpm-container">
                  <input class="bpm" type="number" name="" value={loop.selected.bpm} placeholder="BPM" on:change={(e) => handleChangeBpm(e, loop)} />
                  {#if loop.selected.bpm}
                  <label class="bpm-label">BPM</label>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </section>
    </form>
</section>
