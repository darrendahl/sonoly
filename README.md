### Bluejam is a collection of instruments you can play with your keyboard and mouse.

### To get started locally

```
git clone https://github.com/bluedahltech/bluejam/
cd bluejam
npm install
npm run dev
```


----------

### How to use

First, you select your instrument, then you can select your sounds and effects. Depending on the instrument, these can be single sounds, multi sound kits, frequency kits, wavetables, loops, impulse responses, synths, and effects. Then, you play the instrument using your keyboard and mouse.

Bluejam has 3 instruments by default: Keys, Loopers, and Pad. 

----------

### Important distinctions from bluejam and other music making applications.

1. This is not a DAW, or Digital Audio Workstation, like GarageBand and others. We are not composing professional grade music using bluejam. It's is about jamming, experimenting, discovering, and playing in the moment.

2. We don’t have any timelines or waveforms in the app. It's not a DAW. We are building instruments that can be played with your keyboard and mouse. We are not building software to compose beats and songs. 

----------

### Architecture 

There is a backend Django application and in a separate repo and a frontend React application in this repo. In order to get the entire application working locally you will have to clone both, but you can use https://sonolib.onrender.com for the sounds, as it is a public rest api. 

  - The Backend https://github.com/bluedahltech/sonolib/ is for managing the sound library and data models that the frontend instruments consume, hosted at https://sonolib.onrender.com

  - The Frontend https://github.com/bluedahltech/bluejam/ is the interface where you play the instruments

Each instrument has the capability to apply sounds and effects. Some sounds and effects are done fully in JavaScript using Tunajs, Tonejs and the web audio api. Otherwise, we pull single samples, loops, multi sound kits, impulse responses, and wavetables from the backend library application. 

Certain instruments depend on particular backend data models. If you wish to create a new instrument, it may require a new data model on the backend application to supercharge your instrument.

Sono.js contains all of our web audio api based code. Right now, it’s a bunch of utility functions with a global store.

See the frequency to note chart and the bpm and bars to seconds chart to understand some of the numerology behind the app.

Of course, this is an open source project. See the issues page for an initial todo list. We welcome ideas, pull requests, and issues. If you wish to contribute to the project, clone the repo, view the issues, and don’t hesitate to reach out if you have any questions. :)

Special thanks to:
Tunajs
Tonejs
