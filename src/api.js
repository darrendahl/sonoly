import axios from 'axios'

export function loadOptions(){
  return axios.get('http://localhost:8080/sounds/?cat=wavetable').then((response) => response.data.results)
}