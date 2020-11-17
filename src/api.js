import axios from 'axios'
import { setup } from 'axios-cache-adapter'

const BASE_URL = process.env === 'dev' ? 'http://localhost:8081' : 'https://sonolib.onrender.com'

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
  baseURL: BASE_URL,

  // `axios-cache-adapter` options
  cache: {
    maxAge: 15 * 60 * 1000
  }
})

export function loadWavetables(){
  return api.get('/sounds/wavetables/').then((response) => response.data)
}

export function loadSoundKits(){
  return api.get('/sounds/soundkits/').then((response) => response.data)
}

export function loadSingleSamples(){
  return api.get('/sounds/single_samples/').then((response) => response.data)
}

export function loadImpulses(){
  return api.get('/sounds/impulse_responses/').then((response) => response.data)
}

export function loadFrequencyKits(){
  return api.get('/sounds/frequencykits/').then((response) => response.data)
}

export function loadLoops(){
  return api.get('/sounds/loops/').then((response) => response.data)
}


export default api