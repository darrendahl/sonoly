<script>
  import { playNote, stopNote, loadFile, loadSounds, playSound, stopSound } from "./sono";
  import { onDestroy, onMount } from "svelte";
  import { loadSoundKits, loadingLock } from "./api.js";
  import Select from "svelte-select";
  import axios from "axios";
  import { cloneDeep } from "lodash";
  import keysDefault from "./keys-constant";

  let items;
  let soundKit;
  let selectedSoundKit;
  let keys = cloneDeep(keysDefault);

  function pressKeyDown(e) {

    keys = keys.map(row =>
      row.map(key => {
        const newSelected = key.selected ? key.selected : key.code === e.keyCode;
        if (newSelected) {
          if(selectedSoundKit){
            if(key.uuid){
              playSound(key.code)
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
  })

  onDestroy(() => {
    window.removeEventListener("keydown", pressKeyDown, false);
    window.removeEventListener("keyup", pressKeyUp, false);
  });

  const optionIdentifier = "uuid";
  const getOptionLabel = option => option.title;
  const getSelectionLabel = option => option.title;

  const loadOptions = async () => {
    items = await loadSoundKits();
  };

  const handleSelect = async (event) => {
    loadingLock('on')
    // const response = await axios.get(event.detail.file)
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

  function handleSelectType(event) {
    selectedInteractionType = event.detail.id;
  }

  loadOptions();
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
  }

  /*.key:hover, .key.selected{
    background: #ff3e00;
    color: white;
  }*/

  .selected {
    background: #ff3e00;
    color: white;
  }

  .key-row {
    display: inline-flex;
    margin: 0 auto;
    margin: 12px 0;
  }

  .select {
    width: 200px;
    margin: 0 auto;
    margin-top: 25px;
    margin-bottom: 25px;
  }

  .disabled {
    border:  1px solid #efefef;
  }
</style>

<section>
  <div class="select">
    <Select
      {items}
      {optionIdentifier}
      {getSelectionLabel}
      {getOptionLabel}
      bind:selectedSoundKit
      on:select="{handleSelect}"
      placeholder="Select SoundKit"
    ></Select>
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
