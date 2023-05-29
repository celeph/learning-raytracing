class vec3 {
  constructor(e0,e1,e2) {
    this.e = [];
    this.e[0] = parseFloat(e0);
    this.e[1] = parseFloat(e1);
    this.e[2] = parseFloat(e2);
  }
  
  get x() { return this.e[0]; }
  get y() { return this.e[1]; }
  get z() { return this.e[2]; }
  get r() { return this.e[0]; }
  get g() { return this.e[1]; }
  get b() { return this.e[2]; }

  toString() { return '('+this.e[0]+','+this.e[1]+','+this.e[2]+')'; }
  
  add(summand) {
    if (summand.constructor.name == this.constructor.name) { // perform vec3 + vec3
      return new vec3(this.e[0]+summand.e[0], this.e[1]+summand.e[1], this.e[2]+summand.e[2]);
    } else { // perform vec3 + float
      summand = parseFloat(summand);
      return new vec3(this.e[0]+summand, this.e[1]+summand, this.e[2]+summand);
    }
  }

  sub(subtrahend) {
    if (subtrahend.constructor.name == this.constructor.name) { // perform vec3 - vec3
      return new vec3(this.e[0]-subtrahend.e[0], this.e[1]-subtrahend.e[1], this.e[2]-subtrahend.e[2]);
    } else { // perform vec3 - float
      subtrahend = parseFloat(subtrahend);
      return new vec3(this.e[0]-subtrahend, this.e[1]-subtrahend, this.e[2]-subtrahend);
    }
  }
  
  mul(factor) {
    if (factor.constructor.name == this.constructor.name) { // perform vec3 * vec3
      return new vec3(this.e[0]*factor.e[0], this.e[1]*factor.e[1], this.e[2]*factor.e[2]);
    } else { // perform vec3 * float
      factor = parseFloat(factor);
      return new vec3(this.e[0]*factor, this.e[1]*factor, this.e[2]*factor);
    }
  }
  
  div(divisor) {
    if (divisor.constructor.name == this.constructor.name) { // perform vec3 / vec3
      return new vec3(this.e[0]/divisor.e[0], this.e[1]/divisor.e[1], this.e[2]/divisor.e[2]);
    } else { // perform vec3 / float
      divisor = 1/parseFloat(divisor);
      return this.mul(divisor);
    }
  }
  
  dot(v2) {
    if (v2.constructor.name == this.constructor.name) { // perform vec3 dot vec3
      return this.e[0]*v2.e[0] + this.e[1]*v2.e[1] + this.e[2]*v2.e[2];
    } else return this;
  }
  
  cross(v2) {
    if (v2.constructor.name == this.constructor.name) { // perform vec3 cross vec3
      return new vec3( (this.e[1]*v2.e[2] - this.e[2]*v2.e[1]),
        (-(this.e[0]*v2.e[2] - this.e[2]*v2.e[0])),
        (this.e[0]*v2.e[1] - this.e[1]*v2.e[0]) );
    } else return this;
  }
  
  length() {
    return Math.sqrt(this.e[0]*this.e[0] + this.e[1]*this.e[1] + this.e[2]*this.e[2]);
  }
  
  squared_length() {
    return this.e[0]*this.e[0] + this.e[1]*this.e[1] + this.e[2]*this.e[2];
  }
  
  make_unit_vector() {
    var k = 1.0 / this.length();
    return this.mul(k);
  }
  
  unit_vector() {
    return this.div(this.length()); 
  }
  
  toInt() {
    return new vec3(parseInt(this.x), parseInt(this.y), parseInt(this.z));
  }
  
  run_tests() {
    var v1 = new vec3(1, 2, 3);
    console.log('v1: '+v1, v1.x, v1.y, v1.z);

    var v2 = new vec3(4, 5, 6);
    console.log('v2: '+v2, v2.x, v2.y, v2.z);

    var number = 1;
    console.log('v1+v2: '+v1.add(v2), v1.add(v2));
    console.log('v1+number: '+v1.add(number), v1.add(number));

    console.log('v1-v2: '+v1.sub(v2), v1.sub(v2));
    console.log('v1-number: '+v1.sub(number), v1.sub(number));

    number = 2;
    console.log('v1*v2: '+v1.mul(v2), v1.mul(v2));
    console.log('v1*number: '+v1.mul(number), v1.mul(number));

    console.log('v1/v2: '+v1.div(v2), v1.div(v2));
    console.log('v1/number: '+v1.div(number), v1.div(number));

    console.log('v1 dot v2: '+v1.dot(v2), v1.dot(v2));
    console.log('v1 cross v2: '+v1.cross(v2), v1.cross(v2));

    console.log('v1.length: '+v1.length());
    console.log('v1.squared_length: '+v1.squared_length());

    console.log('v1.make_unit_vector: '+v1.make_unit_vector());
    console.log('v1.unit_vector: '+v1.unit_vector());
  }
}


var ep003 = {
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

    for (var j = ny-1; j >= 0; j--) {
      for (var i = 0; i < nx; i++) {
        var color = new vec3(
          parseFloat(i)/parseFloat(nx), 
          parseFloat(j)/parseFloat(ny), 
          0.2
        );
        color = color.mul(255.99);
        color = color.toInt();
        
        ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
        ctx.fillRect(i, ny-j-1, 1, 1); // x, y, width, height
      }
    }
//...
  }
};

window.addEventListener('load', function() { 
  ep003.main({
    container: 'ep003',
    width: 200,
    height: 100
  }); 
}, false);

