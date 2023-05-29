
const ep001 = {
  container: '',
  width: 0,
  height: 0,
  ctx: null,

  css: function() {
    const c = this.container;
    return `<style>
      #${c}-raytracer{margin:0 auto;display:block;width:200px;border:1px solid #ccc;line-height:0;padding:5px}
      #${c}-log {margin:1em auto;font-face:monospace;font-size:7pt;width:${this.width}px;height:${this.height}px;overflow:auto;border:1px solid #ccc;padding:5px}
      </style>`;
  },
    
  log: function(msg) {
    let msgs = document.getElementById(this.container+'-log');
    if (!msgs) {
      msgs = document.createElement('pre');
      msgs.setAttribute('id', this.container+'-log');
      msgs.setAttribute('class', 'messages');
      msg = document.createTextNode(msg+'\n');
      msgs.appendChild(msg);
      document.getElementById(this.container).appendChild(msgs);
    }
    else {
      msg = document.createTextNode(msg+'\n');
      msgs.insertBefore(msg, msgs.childNodes[0]);
    }
  },

  initCanvas: function() {
    const c = this.container;
    let html = `<div class="raytracer" id="${c}-raytracer">
      <canvas id="${c}-canvas" width="${this.width}" height="${this.height}"></canvas>
      </div>`;

    let out = document.getElementById(c);
    if (out) out.innerHTML = this.css() + html;
    else return;
    
    let canvas = document.getElementById(this.container+'-canvas');
    this.ctx = canvas.getContext('2d');
  },
  
  main: function(config) {
    this.container = config.container;
    this.width = config.width;
    this.height = config.height;

    this.initCanvas();
    if (!this.ctx) return;

    let startTime = performance.now();
    this.render();
    let endTime = performance.now();
    let totalTime = (endTime-startTime);
    this.log(totalTime+' ms');
  },
  
  render: function() {
//...
    let ctx = this.ctx;

    const nx = this.width;
    const ny = this.height;

    for (let j = ny-1; j >= 0; j--) {
      for (let i = 0; i < nx; i++) {
        let r = i / nx; // left to right from 0 to 0.995
        let g = j / ny; // top to bottom from 0.99 to 0
        let b = 0.2;

        let ir = parseInt(255.99 * r); // left to right from 0 to 254
        let ig = parseInt(255.99 * g); // top to bottom from 253 to 0
        let ib = parseInt(255.99 * b); // always 51

        ctx.fillStyle = `rgb(${ir},${ig},${ib})`;
        ctx.fillRect(i, ny-j-1, 1, 1); // x, y, width, height
      }
    }
//...
  }
};

window.addEventListener('load', function() { 
  ep001.main({
    container: 'ep001',
    width: 200,
    height: 100
  }); 
}, false);

