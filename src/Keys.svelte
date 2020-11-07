<script>
  import sono from './sono'
  import { loadSoundKits, loadingLock } from './api.js';
  import Select from 'svelte-select'
  import axios from 'axios'

  let items
  let soundKit
  let selectedSoundKit

  const optionIdentifier = 'id';
  const getOptionLabel = (option) => option.title;
  const getSelectionLabel = (option) => option.title;

  function stopPlaying(){
    down = false
    sono().stop()
  }

  const loadOptions = async () => {
    items = await loadSoundKits()
  }

  const handleSelect = async (event) => {
    // loadingLock('on')
    // const response = await axios.get(event.detail.file)
    // console.log('loaded', event.detail.title)
    // loadingLock('off')
    // soundKit = response.data
  }

  function handleSelectType(event){
    selectedInteractionType = event.detail.id
  }

  loadOptions()

</script>

<section>
  <div class="select">
    <Select {items} {optionIdentifier} {getSelectionLabel} {getOptionLabel} bind:selectedSoundKit on:select={handleSelect} placeholder="Select SoundKit"></Select>
  </div>
</section>

<style>
   .select {
     width: 200px;
     margin: 0 auto;
     margin-top: 25px;
     margin-bottom: 25px;
   }
</style>