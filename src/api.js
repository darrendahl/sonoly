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
  return axios.get('http://localhost:8080/sounds/?cat=wavetable').then((response) => response.data.results)
}