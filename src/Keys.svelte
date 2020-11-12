<script>
  // Advanced Keys Settings:
  // Include detune pad
  // Include numbers and space
  // Manually adjust frequencies
  // Add effect to specific key
  // Change behavior on key hold
  // Change Effect settings (Impulse and Other Effect) 

  import { playNote, stopNote, loadFile, loadSounds, playSound, stopSound, applyEffect, clearEffect, clearImpulse, loadImpulse } from "./sono";
  import { onDestroy, onMount } from "svelte";
  import { loadSoundKits, loadingLock, loadImpulses, loadFrequencyKits } from "./api.js";
  import Select from "svelte-select";
  import { cloneDeep } from "lodash";
  import keysDefault from "./keys-constant";
  import DEFAULT_EFFECTS from './effects-list'

  let soundKits;
  let frequencyKits;
  let impulses;
  let effects;

  let selectedSoundKit;
  let selectedFrequencyKit;
  let selectedImpulse
  let selectedEffect;

  let keys = cloneDeep(keysDefault);  

  function pressKeyDown(e) {

    keys = keys.map(row =>
      row.map(key => {
        const newSelected = key.selected ? key.selected : key.code === e.keyCode;
        if (newSelected) {
          if(selectedSoundKit){
            if(key.uuid){
              playSound(key.code, 'keys')
            } else {
              console.log('No sound assigned to key')
            }
          } else {
            playNote(key.freq, key.note);
          }
        }

        return {
          ...key,
          selected: newSelected
        };
      })
    );
  }

  function pressKeyUp(e) {
    keys = keys.map(row =>
      row.map(key => {
        const isKey = key.code === e.keyCode && key.selected
        const newSelected = isKey ? false : key.selected

        if(isKey){
          if(selectedSoundKit){
            if(key.uuid){
              stopSound(key.code)
            } else {
              console.log('No sound assigned to key')
            }
          } else {
            stopNote(key.note)
          }
        }

        return {
          ...key,
          selected: newSelected
        };
      })
    );
  }

  onMount(() => {
    window.addEventListener("keydown", pressKeyDown, false);
    window.addEventListener("keyup", pressKeyUp, false);
    loadOptions();
  })

  onDestroy(() => {
    window.removeEventListener("keydown", pressKeyDown, false);
    window.removeEventListener("keyup", pressKeyUp, false);
  });

  const optionIdentifier = "uuid";
  const idOptionIdentifier = "id";
  const getOptionLabel = option => option.title;
  const getSelectionLabel = option => option.title;

  const loadOptions = async () => {
    effects = DEFAULT_EFFECTS
    frequencyKits = []
    soundKits = await loadSoundKits();
    impulses = await loadImpulses();
  };

  const handleClearImpulse = () => {
    selectedImpulse = null
    clearImpulse('keys')
  }

  const handleSelectImpulse = async (event) => {
    selectedImpulse = event.detail
    loadingLock('on')
    await loadImpulse(event.detail.file, 'keys')
    loadingLock('off')
  }

  const handleClearEffect = () => {
    selectedEffect = null
    clearEffect('keys')
  }

  const handleSelectEffect = (event) => {
    selectedEffect = event.detail
    applyEffect(event.detail.id, 'keys')
  }

  const handleClearFrequencyKit = () => {
    keys = cloneDeep(keysDefault);
    selectedFrequencyKit = null
  }

  const handleSelectFrequencyKit = (event) => {
    selectedFrequencyKit = event.detail
  }

  const handleClearSoundKit = () => {
    keys = cloneDeep(keysDefault);
    selectedSoundKit = null
  }

  const handleSelectSoundKit = async (event) => {
    loadingLock('on')
    let newKeys
    await loadSounds(event.detail.sound_key_codes)

    newKeys = keys.map(row =>
        row.map(key => {
            const found = event.detail.sound_key_codes.find((item) => {
              return Number(item.key_code.code) === key.code
            })

            if(found){
              return {
                ...key,
                uuid: found.sound.uuid
              }
            } else {
              return key
            }
        })
      )
   
    selectedSoundKit = event.detail

    keys = [...newKeys]
    loadingLock('off')
  }

</script>

<style>
  .tab {
    padding: 4px;
  }

  .keys-container {
    width: 500px;
    margin: 0 auto;
  }
  .key {
    border: 1px solid #ff3e00;
    cursor: pointer;
    padding: 10px;
    margin: 0 4px;
    background: white;
  }

  .selected {
    background: #ff3e00;
    color: white;
  }

  .key-row {
    display: inline-flex;
    margin: 0 auto;
    margin: 12px 0;
  }

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

  .disabled {
    border:  1px solid #efefef;
  }
</style>

<section>
  <div class="select-container">
    <div class="select">
      <Select
        isDisabled={!!selectedFrequencyKit}
        items={soundKits}
        optionIdentifier={idOptionIdentifier}
        {getSelectionLabel}
        {getOptionLabel}
        bind:selectedSoundKit
        on:clear={handleClearSoundKit}
        on:select="{handleSelectSoundKit}"
        placeholder="Sounds: Multi-Sound Kit"
      ></Select>
    </div>
    <div class="select">
      <Select
        isDisabled={!!selectedSoundKit}
        items={frequencyKits}
        optionIdentifier={idOptionIdentifier}
        {getSelectionLabel}
        {getOptionLabel}
        bind:selectedSoundKit
        on:clear={handleClearFrequencyKit}
        on:select="{handleSelectFrequencyKit}"
        placeholder="Sounds: Single-Sound Kit"
      ></Select>
    </div>
  </div>

  <div class="select-container">
    <div class="select">
      <Select
        items={impulses}
        {optionIdentifier}
        {getSelectionLabel}
        {getOptionLabel}
        bind:selectedImpulse
        on:clear={handleClearImpulse}
        on:select="{handleSelectImpulse}"
        placeholder="Effects: Impulse"
      ></Select>
    </div>
    <div class="select">
      <Select
        items={effects}
        optionIdentifier={idOptionIdentifier}
        {getSelectionLabel}
        {getOptionLabel}
        bind:selectedEffect
        on:clear={handleClearEffect}
        on:select="{handleSelectEffect}"
        placeholder="Effects: Tuna Effect"
      ></Select>
    </div>
  </div>

  <section class="keys-container">
    {#each keys as row}
    <div class="key-row">
      {#each row as key}
      <div class="key {key.selected ? 'selected' : ''} {selectedSoundKit && !key.uuid ? 'disabled' : ''}" id="{key.code}">{key.note}</div>
      {/each}
    </div>
    {/each}
  </section>
</section>
