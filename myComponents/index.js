import './lib/webaudio-controls.js';

const getBaseURL = () => {
	return new URL('.', import.meta.url);
};

class myComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentSong = 1;
    this.src = this.getAttribute('src') + this.currentSong + '.mp3';

    // pour faire du WebAudio
    var audioCtx = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new audioCtx();
    this.ctx = new AudioContext();
    var analyser;
    var bufferLength;
    var dataArray;
    var masterGain;

    this.filters = [];
    var stereoPanner;
  }

  nextSong() {
    if(this.currentSong < 3) {
      this.currentSong++;
    } else {
      this.currentSong = 1;
    }
    this.player.src = this.getAttribute('src') + this.currentSong + '.mp3';
  }

  previousSong() {
    if(this.currentSong > 1) {
      this.currentSong--;
    } else { 
      this.currentSong = 3;
    }
    this.player.src = this.getAttribute('src') + this.currentSong + '.mp3';
    this.player.loop = false;
  }

  switchLoop() {
    if (this.player.loop == true) {
      this.player.loop = !this.player.loop;
      this.shadowRoot.querySelectorAll("#loop")[0].innerText = this.player.loop;
    } else {
      this.player.loop = !this.player.loop;
      this.shadowRoot.querySelectorAll("#loop")[0].innerText = this.player.loop;
    }
  }

  connectedCallback() {
    // Do something
    this.shadowRoot.innerHTML = `
        <style>
        label { color: white; }

        div audio {
          display: block;
          margin-bottom:10px;
          margin-left:10px;
        }

        #myCanvas {
          border:1px;
        }
        .main {
          margin: auto;
          border:1px;
          border-radius:15px;
          background-color:lightGrey;
          padding:10px;
          width:320px;
          box-shadow: 10px 10px 5px grey;
          text-align:center;
          font-family: "Open Sans";
          font-size: 12px;
          margin-left: auto;
          margin-right: auto;
        }
        
        #canvas2 {
          margin-bottom:10px;
          border:1px solid;
          margin-left: auto;
          margin-right: auto;
        }
        .eq {
          margin: 32px;
          border:1px solid;
          border-radius:15px;
          background-color:lightGrey;
          padding:10px;
          width:300px;
          box-shadow: 10px 10px 5px grey;
          text-align:center;
          font-family: "Open Sans";
          font-size: 12px;
        }
        
        div.controls:hover {
          color:blue;
          font-weight:bold;
        }
        div.controls label {
          display: inline-block;
          text-align: center;
          width: 50px;
        }
        
        div.controls label, div.controls input, output {
            vertical-align: middle;
            padding: 0;
            margin: 0;
           font-family: "Open Sans",Verdana,Geneva,sans-serif,sans-serif;
          font-size: 12px;
        }
        </style>
        <canvas id="myCanvas" width=600 height=300 style="position: absolute; top: 100px; left: 375px;"></canvas>
        <audio id="player" src="${this.src}" controls crossorigin="anonymous" loop style="visibility: hidden;"></audio>
        <div style="position: absolute; top: 450px; left: 390px;">
        <button id="previous" style="border-radius: 12px;"><img src="./myComponents/assets/buttons/chapter-previous-pngrepo-com.png" width=50 height=40/></button>
        <button id="moin10secs" style="border-radius: 12px;"><img src="./myComponents/assets/buttons/forge-icon.svg" width=50 height=40/></button>
        <button id="play" style="border-radius: 12px;"><img src="./myComponents/assets/buttons/play-pngrepo-com.png" width=50 height=40 /></button>
        <button id="pause" style="border-radius: 12px;"><img src="./myComponents/assets/buttons/pause-btn-svgrepo-com.svg" width=50 height=40/></button>
         <button id="stop" style="border-radius: 12px;"><img src="./myComponents/assets/buttons/stop-btn-svgrepo-com.svg" width=50 height=40/></button>
        <button id="replay" style="border-radius: 12px;"><img src="./myComponents/assets/buttons/replay-svgrepo-com.svg" width=50 height=40/></button>
        <button id="plus10secs" style="border-radius: 12px;"><img src="./myComponents/assets/buttons/forge-icon (1).svg" width=50 height=40/></button>
        <button id="next" style="border-radius: 12px;"><img src="./myComponents/assets/buttons/chapter-next-pngrepo-com.png" width=50 height=40/></button>
        </div>
        <div style="position: absolute; top: 160px; left: 40px;">
        <webaudio-knob
        id="vu-bluered"
        src="./myComponents/assets/knobs/Mvubluered1c.png"
        value=0.5
        min=0
        max=1
        step=0.1
        width=200
        height=150
        sprites=30
        tooltip="dB"
        disabled=true
    >
    </webaudio-knob>
    <div>
    <br>
    &nbsp;
    <webaudio-knob 
    id="volumeKnob" 
    src="./myComponents/assets/knobs/LittlePhatty.png" 
    value="0.5" max="1" step="0.1" diameter="64" sprites="100" 
    valuetip="0" tooltip="Volume">
  </webaudio-knob>
  &nbsp;&nbsp;&nbsp;
  <webaudio-knob 
        id="balance" 
        src="./myComponents/assets/knobs/Roland-Volume-41pos.png" 
        value="0" max="1" min=-1 step="0.1" diameter="64" sprites="30" 
        valuetip="0" tooltip="Balance Gauche/Droite">
        </webaudio-knob>
        &nbsp;
        </div>
        &nbsp; &nbsp;
<webaudio-knob
id="onOff"
src="./myComponents/assets/knobs/ONButtonBlueFlat.png"
value=0
min=0
max=1
step=1
width=120
height=120
sprites="1" 
tooltip="Loop: Le bouton est difficile à activer et il faut jouer la prochaine chanson pour prendre en compte votre choix"
>
</webaudio-knob>

</div>

<div style="position: absolute; top: 100px; left: 1100px;">
    <canvas id="canvas2" width=250 height=100></canvas>
  
    <div style="position: absolute; left: 100px;">
    <div class="controls">
    <label>60Hz</label>
    <webaudio-knob 
          id="freq_60" 
          src="./myComponents/assets/knobs/DIAL_NASTY_-_01.png" 
          value="0" max="1" min=-1 step="0.1" diameter="50" sprites="30" 
          valuetip="0" tooltip="60Hz">
        </webaudio-knob>
  </div>
  <br>

  <div class="controls">
    <label>170Hz</label>
    <webaudio-knob 
          id="freq_170" 
          src="./myComponents/assets/knobs/DIAL_NASTY_-_01.png" 
          value="0" max="1" min=-1 step="0.1" diameter="50" sprites="30" 
          valuetip="0" tooltip="170Hz">
        </webaudio-knob>
  </div>
  <div class="controls">
    <label>350Hz</label>
    <webaudio-knob 
          id="freq_350" 
          src="./myComponents/assets/knobs/DIAL_NASTY_-_01.png" 
          value="0" max="1" min=-1 step="0.1" diameter="50" sprites="30" 
          valuetip="0" tooltip="350Hz">
          </webaudio-knob>
  </div>
  <div class="controls">
    <label>1000Hz</label>
    <webaudio-knob 
          id="freq_1000" 
          src="./myComponents/assets/knobs/DIAL_NASTY_-_01.png" 
          value="0" max="1" min=-1 step="0.1" diameter="50" sprites="30" 
          valuetip="0" tooltip="1000Hz">
          </webaudio-knob>

  </div>
  <div class="controls">
    <label>3500Hz</label>
    <webaudio-knob 
          id="freq_3500" 
          src="./myComponents/assets/knobs/DIAL_NASTY_-_01.png" 
          value="0" max="1" min=-1 step="0.1" diameter="50" sprites="30" 
          valuetip="0" tooltip="3500Hz">
          </webaudio-knob>

  </div>
  <div class="controls">
    <label>10000Hz</label>
    <webaudio-knob 
          id="freq_10000" 
          src="./myComponents/assets/knobs/DIAL_NASTY_-_01.png" 
          value="0" max="1" min=-1 step="0.1" diameter="50" sprites="30" 
          valuetip="0" tooltip="10000Hz">
          </webaudio-knob>
  </div>
  </div>
    `;


    this.player = this.shadowRoot.querySelector('#player');

    

    this.buildGraph();

    this.canvas2 = this.shadowRoot.querySelector("#canvas2");
    this.canvas2Width = this.canvas2.width;
    this.canvas2Height = this.canvas2.height;
    this.canvasContext = this.canvas2.getContext('2d');

    // pour dessiner/animer
    this.canvas = this.shadowRoot.querySelector('#myCanvas');
    this.canvasCtx = this.canvas.getContext('2d');

    this.player.onplay = () => {
      // pour démarrer webaudio lors d'un click...
      console.log("play");
      this.ctx.resume()
    }

    this.defineListeners();

    // on démarre l'animation
    requestAnimationFrame(() => {
      this.animation();
    });

    requestAnimationFrame(() => {
      this.visualize2();
    });

  }

  animation() {

    this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.analyser.getByteFrequencyData(this.dataArray);

    var barWidth = this.canvas.width / this.bufferLength;
      var barHeight;
      var x = 0;
   
      // values go from 0 to 256 and the canvas heigt is 100. Let's rescale
      // before drawing. This is the scale factor
      var heightScale = this.canvas.height/128;
  
      for(var i = 0; i < this.bufferLength; i++) {
        barHeight = this.dataArray[i];


        this.canvasCtx.fillStyle = 'rgb(' + (barHeight+i) + ',' + (100+i) + ',' + (200+i) + ')';
        barHeight *= heightScale;
        this.canvasCtx.fillRect(x, this.canvas.height-barHeight/2, barWidth, barHeight/2);

        // 2 is the number of pixels between bars
        x += barWidth + 1;
      }

    requestAnimationFrame(() => {
      this.animation();
    });
  }

  buildGraph() {
    this.player.onplay = (e) => {this.ctx.resume();}

    this.player.addEventListener('play',() => this.ctx.resume());

    var sourceNode = this.ctx.createMediaElementSource(this.player);

    // Create an analyser node
    this.analyser = this.ctx.createAnalyser();
  
  // Try changing for lower values: 512, 256, 128, 64...
  this.analyser.fftSize = 512;
  this.bufferLength = this.analyser.frequencyBinCount;
  this.dataArray = new Uint8Array(this.bufferLength);
  

  const interval = setInterval(() => {
  if (this.ctx) {

    [60, 170, 350, 1000, 3500, 10000].forEach((freq, i) => {
        const eq = this.ctx.createBiquadFilter();
        eq.frequency.value = freq;
        eq.type = "peaking";
        eq.gain.value = 0;
        this.filters.push(eq);
    });
    clearInterval(interval);
  }
  sourceNode.connect(this.filters[0]);
  for(var i = 0; i < this.filters.length - 1; i++) {
   this.filters[i].connect(this.filters[i+1]);
   }

      // Connect filters in serie

  
    // Master volume is a gain node
    this.masterGain = this.ctx.createGain();
    this.masterGain.value = 1;
 

   // connect the last filter to the speakers
   this.filters[this.filters.length - 1].connect(this.masterGain);
  
  // for stereo balancing, split the signal
  this.stereoPanner = this.ctx.createStereoPanner();
  // connect master volume output to the panner
  this.masterGain.connect(this.stereoPanner);
  
  // Connect the stereo panner to analyser and analyser to destination
  this.stereoPanner.connect(this.analyser);  


  sourceNode.connect(this.analyser);
  this.analyser.connect(this.ctx.destination);

}, 500);

  }

visualize2() {
    this.canvasContext.save();
    this.canvasContext.fillStyle = "rgba(0, 0, 0, 0.05)";
    this.canvasContext.fillRect (0, 0, this.canvas2Width, this.canvas2Height);

    this.analyser.getByteFrequencyData(this.dataArray);
    var nbFreq = this.dataArray.length;
    
    var SPACER_WIDTH = 5;
    var BAR_WIDTH = 2;
    var OFFSET = 100;
    var CUTOFF = 23;
    var HALF_HEIGHT = this.canvas2Height/2;
    var numBars = 1.7*Math.round(this.canvas2Width / SPACER_WIDTH);
    var magnitude;
  
    this.canvasContext.lineCap = 'round';

    for (var i = 0; i < numBars; ++i) {
       magnitude = 0.3*this.dataArray[Math.round((i * nbFreq) / numBars)];
        
       this.canvasContext.fillStyle = "hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)";
       this.canvasContext.fillRect(i * SPACER_WIDTH, HALF_HEIGHT, BAR_WIDTH, -magnitude);
       this.canvasContext.fillRect(i * SPACER_WIDTH, HALF_HEIGHT, BAR_WIDTH, magnitude);

    }
    
    // Draw animated white lines top
    this.canvasContext.strokeStyle = "white";
    this.canvasContext.beginPath();

    for (i = 0; i < numBars; ++i) {
        magnitude = 0.3*this.dataArray[Math.round((i * nbFreq) / numBars)];
          if(i > 0) {
            //console.log("line lineTo "  + i*SPACER_WIDTH + ", " + -magnitude);
            this.canvasContext.lineTo(i*SPACER_WIDTH, HALF_HEIGHT-magnitude);
        } else {
            //console.log("line moveto "  + i*SPACER_WIDTH + ", " + -magnitude);
            this.canvasContext.moveTo(i*SPACER_WIDTH, HALF_HEIGHT-magnitude);
        }
    }
    for (i = 0; i < numBars; ++i) {
        magnitude = 0.3*this.dataArray[Math.round((i * nbFreq) / numBars)];
          if(i > 0) {
            //console.log("line lineTo "  + i*SPACER_WIDTH + ", " + -magnitude);
            this.canvasContext.lineTo(i*SPACER_WIDTH, HALF_HEIGHT+magnitude);
        } else {
            //console.log("line moveto "  + i*SPACER_WIDTH + ", " + -magnitude);
            this.canvasContext.moveTo(i*SPACER_WIDTH, HALF_HEIGHT+magnitude);
        }
    }    
    this.canvasContext.stroke();
    
    this.canvasContext.restore();
  
    requestAnimationFrame(() => {
      this.visualize2();
    });
}

  fixRelativeURLs() {
    const baseURL = getBaseURL();
    console.log('baseURL', baseURL);

    const knobs = this.shadowRoot.querySelectorAll('webaudio-knob');

    for (const knob of knobs) {
      console.log("fixing " + knob.getAttribute('src'));

      const src = knob.src;
      knob.src =  baseURL  + src;

      console.log("new value : " + knob.src);
    }
  }

  
changeGain(sliderVal,nbFilter) {
  this.filters[nbFilter] = parseFloat(sliderVal);
}

changeBalance(sliderVal) {
  // between -1 and +1
  var value = parseFloat(sliderVal);
  
this.stereoPanner.pan.value = value;
}



  defineListeners() {
    this.shadowRoot.querySelector('#play').addEventListener('click', () => {
      this.player.play();
    });

    this.shadowRoot.querySelector('#pause').addEventListener('click', () => {
      this.player.pause();
    });
    this.shadowRoot.querySelector('#stop').addEventListener('click', () => {
      this.player.pause();
      this.player.currentTime = 0;
    });

    this.shadowRoot.querySelector('#volumeKnob').addEventListener('input', (evt) => {
      this.player.volume = evt.target.value;
      this.shadowRoot.querySelector('#vu-bluered').value = evt.target.value;
    });

    this.shadowRoot.querySelector('#plus10secs').addEventListener('click', () => {
      this.player.currentTime += 10;
    });
    this.shadowRoot.querySelector('#moin10secs').addEventListener('click', () => {
      this.player.currentTime -= 10;
    });

    this.shadowRoot.querySelector('#replay').addEventListener('click', () => {
      this.player.pause();
      this.player.currentTime = 0;
      this.player.play();
    });

    this.shadowRoot.querySelector('#next').addEventListener('click', () => {
      this.nextSong();
      this.player.play();
    });

    this.shadowRoot.querySelector('#previous').addEventListener('click', () => {
      this.previousSong();
      this.player.play();
    });

    this.shadowRoot.querySelector('#onOff').addEventListener('input', (evt) => {
      this.switchLoop();
    });

    this.shadowRoot.querySelector('#balance').addEventListener('input', (evt) => {
      this.changeBalance(evt.target.value);
    });
this.shadowRoot.querySelector('#freq_60').addEventListener('input', (evt) => {
  this.changeGain(0, evt.target.value);
});
this.shadowRoot.querySelector('#freq_170').addEventListener('input', (evt) => {
  this.changeGain(1, evt.target.value);
});
this.shadowRoot.querySelector('#freq_350').addEventListener('input', (evt) => {
  this.changeGain(2, evt.target.value);
});
this.shadowRoot.querySelector('#freq_1000').addEventListener('input', (evt) => {
  this.changeGain(3, evt.target.value);
});
this.shadowRoot.querySelector('#freq_3500').addEventListener('input', (evt) => {
  this.changeGain(4, evt.target.value);
});
this.shadowRoot.querySelector('#freq_10000').addEventListener('input', (evt) => {
  this.changeGain(5, evt.target.value);
});
  }
}

customElements.define("my-audio", myComponent);

