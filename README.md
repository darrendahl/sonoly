### https://sono.ly is a collection of instruments you can play with your keyboard and mouse and livestream to anyone.

Sono.ly é uma coleção de instrumentos que você pode tocar com o teclado e mouse e transmitir ao vivo para qualquer pessoa.

#### DEMO:
[![Sono.ly video demo](https://i.ibb.co/X3HSZnx/Screen-Shot-2020-12-02-at-4-50-38-PM.png)](https://www.youtube.com/watch?v=c83sUM6eWOU)


### To get started locally

```
git clone https://github.com/bluedahltech/sono.ly/
cd sono.ly
npm install
npm run dev
```


----------

### How to use

First, you select your instrument, then you can select your sounds and effects. Depending on the instrument, these can be single sounds, multi sound kits, frequency kits, wavetables, loops, impulse responses, synths, and effects. Then, you play the instrument using your keyboard and mouse. If you wish, you can livestream your session to anyone who wants to join and listen.

Sono.ly has 3 instruments by default: Keys, Loopers, and Pad. 

----------

### Important distinctions from sono.ly and other music making applications.

1. This is not a DAW, or Digital Audio Workstation, like GarageBand and others. We are not composing professional grade music using sono.ly. Sono.ly is about jamming, experimenting, discovering, and playing live in the moment. Livestreaming allows others to sit in on your sessions. We don't record full songs on Sono.ly natively in the app. That being said, no one is stopping you from recording a screen capture video of your sono.ly sessions using Soundflower, Kap or some other software.

2. We don’t have any timelines or waveforms in the app. Again, sono.ly is not a DAW. We are building instruments that can be played with your keyboard and mouse, and then livestream to anyone. We are not building software to compose beats and songs. 

----------

### Architecture 

There is a backend Django application and a Node.js middle layer application in separate repos and a frontend Svelte application in this repo. In order to get the entire application working locally you will have to clone all three, but you can use https://sonolib.onrender.com for the sounds, as it is a public rest api. 

  - The Backend https://github.com/bluedahltech/sonolib/ is for managing the sound library and data models that the frontend instruments consume, hosted at https://sonolib.onrender.com

  - The Frontend https://github.com/bluedahltech/sono.ly/ is the interface where you play the instruments

  - The Middle Nodejs layer https://github.com/bluedahltech/sonoly-node/ handles the live stream

Each instrument has the capability to apply sounds and effects. Some sounds and effects are done fully in JavaScript using Tunajs, Tonejs and the web audio api. Otherwise, we pull single samples, loops, multi sound kits, impulse responses, and wavetables from the backend library application. 

Certain instruments depend on particular backend data models. If you wish to create a new instrument, it may require a new data model on the backend application to supercharge your instrument.

Sono.js contains all of our web audio api based code. Right now, it’s a bunch of utility functions with a global store.

See the frequency to note chart and the bpm and bars to seconds chart to understand some of the numerology behind the app.

Of course, this is an open source project. See the issues page for an initial todo list. We welcome ideas, pull requests, and issues. If you wish to contribute to the project, clone the repo, view the issues, and don’t hesitate to reach out if you have any questions. :)

Special thanks to:
Tunajs
Tonejs
