function classExists(c) {
  return (typeof(c) == "function" && typeof(c.prototype) == "object");
}


// =================================================================================================

class vec3 {
  constructor(x,y,z) { this.x = x; this.y = y; this.z = z; }
  get r() { return this.x; }
  get g() { return this.y; }
  get b() { return this.z; }
  toString() { return '('+this.x+','+this.y+','+this.z+')'; }
  
  // vec3 + vec3
  add(v) { return new vec3(this.x+v.x, this.y+v.y, this.z+v.z); }
  
  // vec3 + float
  addfl(fl) { return new vec3(this.x+fl, this.y+fl, this.z+fl); }

  // vec3 - vec3
  sub(v) { return new vec3(this.x-v.x, this.y-v.y, this.z-v.z); }
  
  // vec3 - float
  subfl(fl) { return new vec3(this.x-fl, this.y-fl, this.z-fl); }
  
  // vec3 * vec3
  mul(v) { return new vec3(this.x*v.x, this.y*v.y, this.z*v.z); }
  
  // vec3 * float
  mulfl(fl) { return new vec3(this.x*fl, this.y*fl, this.z*fl); }
  
  // vec3 / vec3
  div(v) { return new vec3(this.x/v.x, this.y/v.y, this.z/v.z); }
  
  // vec3 / float
  divfl(fl) { return this.mulfl(1/fl); }
  
  // vec3 dot vec3
  dot(v) { return this.x*v.x + this.y*v.y + this.z*v.z; }
  
  // vec3 cross vec3
  cross(v) { 
    return new vec3( 
      (this.y*v.z - this.z*v.y),
      (-(this.x*v.z - this.z*v.x)),
      (this.x*v.y - this.y*v.x) 
    );
  }
  
  length() { return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z); }
  
  squared_length() { return this.x*this.x + this.y*this.y + this.z*this.z; }
  
  make_unit_vector() {
    var k = 1.0 / this.length();
    return this.mulfl(k);
  }
  
  unit_vector() { return this.divfl(this.length()); }
}


// =================================================================================================


class ray {
  constructor(a,b) { this.A = a; this.B = b; }

  origin() { return this.A; }
  direction() { return this.B; }
  point_at_parameter(t) { return this.A.add(this.B.mulfl(t)); }
}


// =================================================================================================

class material {
  constructor() { }
  
  random_in_unit_sphere() {
    var p;
    
    do {
      // get random from 0-1, multiply with 2 to get 0-2, subtract to -1 to +1
      p = ((new vec3(Math.random(), Math.random(), Math.random()))
        .mulfl(2.0))
        .sub(new vec3(1,1,1));
    } while (p.squared_length() >= 1.0); // remember sphere: x^2+y^2+z^2 = 1^2
    
    p = ((new vec3(Math.random(), Math.random(), Math.random())).mulfl(2.0)).sub(new vec3(1,1,1));
    
    return p;
  }

  // vec3 v
  // vec3 n
  // @return vec3
  reflect(v, n) {
    return v.sub(n.mulfl(v.dot(n)).mulfl(2));
  }
  
  // ray r_in
  // hit_record rec
  // vec3 attenuation
  // ray scattered
  scatter(r_in, rec) { }
}

class lambertian extends material {
  constructor(a) { super(); this.albedo = a; }
  
  scatter(r_in, rec) {
    var target = rec.normal.add(this.random_in_unit_sphere());
    this.scattered = new ray(rec.p, target);
    this.attenuation = this.albedo;
    return true;
  }
}

class metal extends material {
  constructor(a, f) { 
    super(); 
    this.albedo = a; 
    
    if (f < 1) this.fuzziness = f;
    else this.fuzziness = 1;
  }
  
  scatter(r_in, rec) {
    var reflected = this.reflect(r_in.direction().unit_vector(), rec.normal);
    //...
    // this.scattered = new ray(rec.p, reflected);
    this.scattered = new ray(rec.p, reflected.add(this.random_in_unit_sphere().mulfl(this.fuzziness)));
    //...
    this.attenuation = this.albedo;
    return (this.scattered.direction().dot(rec.normal) > 0);
  }
};

// =================================================================================================

var hit_record = {
  t: 0.0,
  p: null,
  normal: null
};


class hittable {
  constructor() { }
  hit(r, t_min, t_max, rec) { }
}


class sphere extends hittable {
  // new: added mat_ptr
  constructor(cen, r, m) { super(); this.center = cen; this.radius = r; this.rsquared = r*r; this.mat_ptr = m; }
  hit(r, t_min, t_max, rec) {
        
    var oc = r.origin().sub(this.center); // vec3
    var a = r.direction().dot(r.direction()); // float
    var b = oc.dot(r.direction()); // float
    var c = oc.dot(oc) - this.rsquared; // float
    var discriminant = b*b - a*c; // float

    if (discriminant > 0) {
      // solve quadratic formula -b - sqrt()
      var temp = (-b - Math.sqrt(discriminant))/a; // float
      if (temp < t_max && temp > t_min) {
        rec.t = temp;
        rec.p = r.point_at_parameter(hit_record.t);
        rec.normal = (rec.p.sub(this.center)).divfl(this.radius);
        // new: added mat_ptr
        rec.mat_ptr = this.mat_ptr;
        return true;
      }

      // solve quadratic formula -b + sqrt()
      temp = (-b + Math.sqrt(discriminant))/a; 
      if (temp < t_max && temp > t_min) {
        rec.t = temp;
        rec.p = r.point_at_parameter(rec.t);
        rec.normal = (rec.p.sub(this.center)).divfl(this.radius);
        // new: added mat_ptr
        rec.mat_ptr = this.mat_ptr;
        return true;
      }
    }
    return false;
  }
}


class hittable_list extends hittable {
  constructor(l, n) { super(); this.list = l; this.list_size = n; }
  hit(r, t_min, t_max, rec) { 
    var temp_rec = rec;
    var hit_anything = false;
    var closest_so_far = t_max;
    for (var i = 0; i < this.list_size; i++) {
      if (this.list[i].hit(r, t_min, closest_so_far, temp_rec)) {
        hit_anything = true;
        closest_so_far = temp_rec.t;
        rec = temp_rec;
      }
    }
    return hit_anything;
  }
}


// =================================================================================================


class camera {
  constructor() {
    this.lower_left_corner = new vec3(-2.0, -1.0, -1.0);
    this.horizontal = new vec3(4.0, 0.0, 0.0);
    this.vertical = new vec3(0.0, 2.0, 0.0);
    this.origin = new vec3(0.0, 0.0, 0.0);
  }
  
  get_ray(u, v) { // float
    return new ray(this.origin, this.lower_left_corner
      .add(this.horizontal.mulfl(u))
      .add(this.vertical.mulfl(v))
      .sub(this.origin)
    );
  }
}


// =================================================================================================

// raytracer
// this class coordinates rendering passes and makes sure
// one rendering task doesn't block the browser or other rendering tasks
class raytracer {
  
  color(r, world, depth) {
    var rec = hit_record;
    if (world.hit(r, 0.001, Infinity, rec)) {
  
      // new: update to use the new material with a depth of 50 recursive calls
      if (depth < 50 && rec.mat_ptr.scatter(r, rec)) {
        return rec.mat_ptr.attenuation.mul(this.color(rec.mat_ptr.scattered, world, depth+1));
      }
      else {
        return new vec3(0,0,0);
      }
    }
    else {
      var unit_direction = r.direction().unit_vector();
      var t = 0.5 * (unit_direction.y + 1.0);
      
      // return (new vec3(1.0, 1.0, 1.0))
      // .mulfl(1.0 - t)
      // .add( 
      //   (new vec3(0.5, 0.7, 1.0)).mulfl(t) 
      // );
        
      return (new vec3(1.0-t+t*0.5, 1.0-t+t*0.7, 1.0-t+t));
    }
  }


  // canvas settings
  client = null; // reference to the client app (to access log)
  ctx = null; // canvas context
  drawMethod = 'image'; // or 'rect' - draw image frame or each pixel as rectangle
  imageData = null; // buffer for image data

  // scene settings
  nx = 0; // width
  ny = 0; // height
  world = null;
  cam = null;

  // anti-aliasing settings
  antiAliasing = true;
  ns = 100; // number of random samples (for anti-aliasing)

  // multi-pass rendering
  multipass = false;
  px = 0; // pass count x
  py = 0; // pass count y
  sw = 0; // section width
  sh = 0; // section height
  renderComplete = false; // true if image complete
  
  // static flags to tweak behavior or test features
  static speed = 10;
  static multipassVariant = 0;
  
  // measuring time
  totalTime = 0;
  timePasses = [];
  
  constructor(c) {
    // canvas settings
    this.client = c.client;
    this.ctx = c.ctx;
    this.nx = c.width;
    this.ny = c.height;

    // use ImageData or draw individual pixel rectangles
    if (typeof c.drawMethod != 'undefined') this.drawMethod = c.drawMethod;
    if (this.drawMethod == 'image') this.imageData = this.ctx.createImageData(this.nx, this.ny);

    // camera and scene
    this.cam = new camera();
    this.world = c.world;

    // number of random samples (for anti-aliasing)
    if (typeof c.antiAliasing !== 'undefined') this.antiAliasing = c.antiAliasing;
    c.ns = c.ns || 100;
    this.ns = c.ns;

    // multipass rendering
    if (typeof c.multipass !== 'undefined') this.multipass = c.multipass;
    c.threads = c.threads || 1;
    this.sw = Math.ceil(this.nx/c.threads);
    this.sh = Math.ceil(this.ny/c.threads);

    // scaling
    // canvas scale and translate, can be used to zoom in and highlight certain details
    // only available with rectangle draw method
    c.scaleX = c.scaleX || 1;
    c.scaleY = c.scaleY || 1;
    if (c.scaleX > 0 && c.scaleY > 0) {
      this.ctx.scale(c.scaleX, c.scaleY);
      this.drawMethod = 'rect';
    }

    c.translateX = c.translateX || 0;
    c.translateY = c.translateY || 0;
    if (c.translateX != 0 && c.translateY != 0) 
      this.ctx.translate(c.translateX, c.translateY);

    // add this instance to global renderer pool
    this.addRenderer();
  }

  addRenderer() {
    if (typeof raytracer.renderers == 'undefined') raytracer.renderers = [];
    raytracer.renderers[raytracer.renderers.length] = this;
  }
  
  // abort and reset rendering
  resetRender() {
    this.renderComplete = true;
    this.px = 0;
    this.py = 0;
    this.ctx.clearRect(0, 0, this.nx, this.ny);
    this.totalTime = 0;
  }
  
  // returns true if all renderers in the pool are complete
  // signal that render process can be stopped
  static allRendersComplete() {
    var ret = true;
    if (typeof raytracer.renderers != 'undefined') {
      for(var i=0; i<raytracer.renderers.length; i++) {
        ret = ret && raytracer.renderers[i].renderComplete;
      }
    }
    return ret;
  }

  // coordinate frame render in all instances
  static render() {
    if (typeof raytracer.renderers != 'undefined') {
      for(var i=0; i<raytracer.renderers.length; i++) {
        if (!raytracer.renderers[i].multipass) raytracer.renderers[i].renderInSinglePass();
        else if (!raytracer.renderers[i].renderComplete) raytracer.renderers[i].renderPass();
      }

      // @todo use animation frames instead
      if (!raytracer.allRendersComplete()) { 
        window.setTimeout(function() { raytracer.render(); }, raytracer.speed); 
        return; 
      }
    }
  }

  renderRay(i,j) {
    var col = new vec3(0,0,0);
    var u, v, r; 
    
    if (this.antiAliasing) {
      for (var s = 0; s < this.ns; s++) {
        u = (i + Math.random()) / this.nx;
        v = (j + Math.random()) / this.ny;
        r = this.cam.get_ray(u, v);
        col = col.add(this.color(r, this.world, 0));
      }
      col = col.divfl(this.ns);
    }
    else {
      u = i / this.nx;
      v = j / this.ny;
      r = this.cam.get_ray(u, v);
      col = this.color(r, this.world, 0);
    }

//...
    col = new vec3( Math.sqrt(col.x), Math.sqrt(col.y), Math.sqrt(col.z) ); // gamma correct
//...        
         
    col = col.mulfl(255.99);
    return col;
  }


  renderInSinglePass() {
    var startTime = performance.now();
    
    if (this.drawMethod == 'image') {
      for (var j = this.ny-1; j >= 0; j--) {
        for (var i = 0; i < this.nx; i++) {
          var col = this.renderRay(i,j);
          var idx = 4*(i + (this.ny-j-1)*this.nx);
          this.imageData.data[idx++] = Math.round(col.r);   
          this.imageData.data[idx++] = Math.round(col.g);
          this.imageData.data[idx++] = Math.round(col.b);
          this.imageData.data[idx++] = 255; // alpha
        }
      }
      this.ctx.putImageData(this.imageData, 0, 0);
    }
    else {
      for (var j = this.ny-1; j >= 0; j--) {
        for (var i = 0; i < this.nx; i++) {
          var col = this.renderRay(i,j);
          this.ctx.fillStyle = 'rgb('+Math.round(col.r)+','+Math.round(col.g)+','+Math.round(col.b)+')';
          this.ctx.fillRect(i, this.ny-j-1, 1, 1);
        }
      }
    }
    
    var endTime = performance.now();
    var timePass = endTime-startTime;
    this.timePasses.push(timePass);
    this.totalTime += timePass;

    this.renderComplete = true;
    this.client.log('Total time for '+this.timePasses.length+' passes: '+this.totalTime+' ms = '+Math.round(this.totalTime/1000)+' s');
  }


  renderPass() {
    if (raytracer.multipassVariant == 1) { this.renderPass_v1(); return; }
    
    var startTime = performance.now();
    
    if (this.drawMethod == 'image') {
      var ys = this.ny - this.py * this.sh;
      var ye = ys - this.sh;
      if (ye > this.ny) ye = this.ny;
      
      for (var j = ys; j >= ye; j--) {
        var xs = this.px * this.sw;
        var xe = xs + this.sw;
        // rounding sw may exceed width of canvas. While this doesn't matter with rectangle drawing
        // method, this does affect imageData method in that the overflow adds pixels at the beginning
        if (xe > this.nx) xe = this.nx; 

        for (var i = xs; i < xe; i++) {
          var col = this.renderRay(i,j);
          var idx = 4*(i + (this.ny-j)*this.nx);
          this.imageData.data[idx++] = Math.round(col.r);   
          this.imageData.data[idx++] = Math.round(col.g);
          this.imageData.data[idx++] = Math.round(col.b);
          this.imageData.data[idx++] = 255; // alpha
        }
      }
      this.ctx.putImageData(this.imageData, 0, 0);
    }
    else {
      var ys = this.ny - this.py * this.sh;
      var ye = ys - this.sh;
      if (ye > this.ny) ye = this.ny;
      for (var j = ys; j >= ye; j--) {
        var xs = this.px * this.sw;
        var xe = xs + this.sw;
        // rounding sw may exceed width of canvas. While this doesn't matter with rectangle drawing
        // method, this does affect imageData method in that the overflow adds pixels at the beginning
        if (xe > this.nx) xe = this.nx; 

        for (var i = xs; i < xe; i++) {
          var col = this.renderRay(i,j);
          // var c = Math.round(j/this.ny*256);
          // var col = new vec3(c,c,c);
          // var c = Math.round(i/this.nx*256);
          // var col = new vec3(c,c,c);
          this.ctx.fillStyle = 'rgb('+Math.round(col.r)+','+Math.round(col.g)+','+Math.round(col.b)+')';
          this.ctx.fillRect(i, this.ny-j-1, 1, 1);
          // this.ctx.fillRect(0, this.ny-j-1, this.nx, 1);
        }
      }
    }
    
    var endTime = performance.now();
    var timePass = endTime-startTime;
    this.timePasses.push(timePass);
    this.totalTime += timePass;

    // this.client.log(this.px+' '+this.py+' '+(this.px * this.sw)+' '+(this.py * this.sh));
    this.px++; 
    if (this.px * this.sw >= this.nx) this.px = 0;
    else return;
    
    this.py++;
    if (this.py * this.sh >= this.ny) {
      this.renderComplete = true;
      this.client.log('Total time for '+this.timePasses.length+' passes: '+this.totalTime+' ms');
      this.client.log('Avg time per pass: '+(this.totalTime/this.timePasses.length)+' ms = '+(Math.round(this.totalTime/this.timePasses.length)/1000)+' s');
    }
  }
  
  renderPass_v1() {
    var startTime = performance.now();
    
    if (this.drawMethod == 'image') {
      
      for (var j = this.ny-1-this.py; j >= 0; j-=this.sh) {
        for (var i = this.px; i < this.nx; i+=this.sw) {
          var col = this.renderRay(i,j);
          var idx = 4*(i + (this.ny-j-1)*this.nx);
          this.imageData.data[idx++] = Math.round(col.r);   
          this.imageData.data[idx++] = Math.round(col.g);
          this.imageData.data[idx++] = Math.round(col.b);
          this.imageData.data[idx++] = 255; // alpha
        }
      }
      this.ctx.putImageData(this.imageData, 0, 0);
    }
    else {
      for (var j = this.ny-this.py; j >= 0; j-=this.sh) {
        for (var i = this.px; i < this.nx; i+=this.sw) {
          var col = this.renderRay(i,j);
          this.ctx.fillStyle = 'rgb('+Math.round(col.r)+','+Math.round(col.g)+','+Math.round(col.b)+')';
          this.ctx.fillRect(i, this.ny-j-1, 1, 1);
          // this.ctx.fillRect(0, this.ny-j-1, this.nx, 1);
        }
      }
    }
    
    var endTime = performance.now();
    var timePass = endTime-startTime;
    this.timePasses.push(timePass);
    this.totalTime += timePass;

    this.px++; 
    if (this.px > this.sw) this.px = 0;
    else return;
    
    this.py++;
    if (this.py > this.sh) {
      this.renderComplete = true;
      this.client.log('Total time for '+this.timePasses.length+' passes: '+this.totalTime+' ms');
      this.client.log('Avg time per pass: '+(this.totalTime/this.timePasses.length)+' ms = '+(Math.round(this.totalTime/this.timePasses.length)/1000)+' s');
    }
  }
}

// =================================================================================================

var ep011 = {
  container: '',
  width: 0,
  height: 0,
  ctx: null,
  raytracer: null,

  css: function() {
    return '<'+'style>'+
      '#'+this.container+'-raytracer{margin:0 auto;display:block;width:200px;'+
        'border:1px solid #ccc;line-height:0;padding:5px}'+
      '#'+this.container+'-log {margin:1em auto;font-face:monospace;font-size:7pt;'+
        'width:'+this.width+'px;height:'+this.height+'px;overflow:auto;'+
        'border:1px solid #ccc;padding:5px}'+
      '</'+'style>';
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
      // msgs.appendChild(msg);
      msgs.insertBefore(msg, msgs.childNodes[0]);
    }
  },

  initCanvas: function() {
    var html = '<div class="raytracer" id="'+this.container+'-raytracer">'+
      '<canvas id="'+this.container+'-canvas" width="'+this.width+'" height="'+this.height+'">'+
      '</canvas></div>';

    var out = document.getElementById(this.container);
    if (out) out.innerHTML = this.css() + html;
    else return;
    
    var c = document.getElementById(this.container+'-canvas');
    this.ctx = c.getContext('2d');
  },

  main: function(config) {
    this.container = config.container;
    this.width = config.width;
    this.height = config.height;
    
    this.initCanvas();
    if (!this.ctx) return;
    
    this.renderSinglePass();
    // this.renderMultiPass();
    // this.renderMultiPassScaled();
  },

  getObjectList: function() {
    var list = [
      new sphere(new vec3(0,0,-1), 0.5, new lambertian(new vec3(0.8, 0.3, 0.3))),
      new sphere(new vec3(0,-100.5,-1), 100, new lambertian(new vec3(0.8, 0.8, 0.0))),
      //...
      // new: fuzziness parameter
      new sphere(new vec3(1,0,-1), 0.5, new metal(new vec3(0.8, 0.6, 0.2), 1.0)),
      new sphere(new vec3(-1,0,-1), 0.5, new metal(new vec3(0.8, 0.8, 0.8), 0.3))
      //...
    ];
    return list;
  },

  renderSinglePass: function() {
    var list = this.getObjectList();
    
    this.raytracer = new raytracer({
      // canvas settings
      client: this,
      ctx: this.ctx,
      width: this.width, 
      height: this.height,
      drawMethod: 'image', // 'rect' or 'image'

      // scene settings
      world: new hittable_list(list, list.length),

      // anti-aliasing settings
      antiAliasing: true,
      ns: 100,

      // multipass rendering
      multipass: false,
      threads: 1,
      
      // scaling
      scaleX: 1, 
      scaleY: 1,
      translateX: 0, 
      translateY: 0,
    });
  },
  
  renderMultiPass: function() {
    var list = this.getObjectList();

    raytracer.speed = 10;
    raytracer.multipassVariant = 1;

    this.raytracer = new raytracer({
      // canvas settings
      client: this,
      ctx: this.ctx,
      width: this.width, 
      height: this.height,
      drawMethod: 'rect', // 'rect' or 'image'

      // scene settings
      world: new hittable_list(list, list.length),

      // anti-aliasing settings
      antiAliasing: true,
      ns: 100,

      // multipass rendering
      multipass: true,
      threads: 10,
      
      // scaling
      scaleX: 1, 
      scaleY: 1,
      translateX: 0, 
      translateY: 0,
    });
  },
  
  renderMultiPassScaled: function() {
    var list = this.getObjectList();
    var scale = 4;
    var o = document.getElementById(this.container+'-canvas');
    o.width *= scale;
    o.height *= scale;
    
    var o2 = document.getElementById(this.container+'-raytracer');
    o2.style.width = o.width+'px';
    
    raytracer.speed = 10;
    raytracer.multipassVariant = 0;

    this.raytracer = new raytracer({
      // canvas settings
      client: this,
      ctx: this.ctx,
      width: this.width, 
      height: this.height,
      drawMethod: 'rect', // 'rect' or 'image'

      // scene settings
      world: new hittable_list(list, list.length),

      // anti-aliasing settings
      antiAliasing: true,
      ns: 100,

      // multipass rendering
      multipass: true,
      threads: 2,
      
      // scaling
      /*
      scaleX: 4, 
      scaleY: 4,
      translateX: -42, 
      translateY: -42,
      */
      scaleX: scale, 
      scaleY: scale,
      translateX: 0, 
      translateY: 0,
    });
  }
};

window.onload = function() { 
  let startTime = performance.now();

  // initialize raytracer
  // setup canvas and scene
  ep011.main({
    container: 'ep011',
    width: 200,
    height: 100
  });
  
  // start rendering
  raytracer.render();
  
  let endTime = performance.now();
  let totalTime = (endTime-startTime);
  ep011.log(totalTime+' ms');
};



