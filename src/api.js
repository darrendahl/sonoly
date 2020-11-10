import axios from 'axios'

export function loadingLock(action){
  if (action === 'on') {
    document.body.style.cursor = 'wait'
    document.getElementById('main').style.pointerEvents = 'none'
  } else if (action === 'off') {
    document.body.style.cursor = 'default'
    document.getElementById('main').style.pointerEvents = 'auto'
  }
}

export function loadWavetables(){
  return axios.get('http://localhost:8081/sounds/wavetables/').then((response) => response.data)
}

export function loadSoundKits(){
  return axios.get('http://localhost:8081/sounds/soundkits/').then((response) => response.data)
}

export function loadLoops(){
  return axios.get('http://localhost:8081/sounds/loops/').then((response) => response.data)
}