import axios from 'axios'
import { setup } from 'axios-cache-adapter'

export function loadingLock(action){
  if (action === 'on') {
    document.body.style.cursor = 'wait'
    document.getElementById('main').style.pointerEvents = 'none'
  } else if (action === 'off') {
    document.body.style.cursor = 'default'
    document.getElementById('main').style.pointerEvents = 'auto'
  }
}

const api = setup({
  // `axios` options
  // baseURL: 'http://some-rest.api',

  // `axios-cache-adapter` options
  cache: {
    maxAge: 15 * 60 * 1000
  }
})

export function loadWavetables(){
  return api.get('http://localhost:8081/sounds/wavetables/').then((response) => response.data)
}

export function loadSoundKits(){
  return api.get('http://localhost:8081/sounds/soundkits/').then((response) => response.data)
}

export function loadSingleSamples(){
  return api.get('http://localhost:8081/sounds/single_samples/').then((response) => response.data)
}

export function loadImpulses(){
  return api.get('http://localhost:8081/sounds/impulse_responses/').then((response) => response.data)
}

export function loadFrequencyKits(){
  return api.get('http://localhost:8081/sounds/frequencykits/').then((response) => response.data)
}

export function loadLoops(){
  return api.get('http://localhost:8081/sounds/loops/').then((response) => response.data)
}

export default api