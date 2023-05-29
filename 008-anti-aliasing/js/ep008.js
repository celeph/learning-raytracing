//...
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
//...


class ray {
  constructor(a,b) { this.A = a; this.B = b; }

  origin() { return this.A; }
  direction() { return this.B; }
  point_at_parameter(t) { return this.A.add(this.B.mulfl(t)); }
}


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
  constructor(cen, r) { super(); this.center = cen; this.radius = r; this.rsquared = r*r; }
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
        return true;
      }

      // solve quadratic formula -b + sqrt()
      temp = (-b + Math.sqrt(discriminant))/a; 
      if (temp < t_max && temp > t_min) {
        rec.t = temp;
        rec.p = r.point_at_parameter(rec.t);
        rec.normal = (rec.p.sub(this.center)).divfl(this.radius);
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


var ep008 = {
  container: '',
  width: 0,
  height: 0,
  ctx: null,

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
    
    this.render();
  },

  color: function(r, world) {
    var rec = hit_record;
    if (world.hit(r, 0.0, Infinity, rec)) {
      return (new vec3(rec.normal.x+1, rec.normal.y+1, rec.normal.z+1)).mulfl(0.5);
      
      // surprisingly, this made it worse:
      // return rec.normal.addfl(1).mulfl(0.5);
      
      // this was about the same:
      // return (new vec3((rec.normal.x+1)*0.5, (rec.normal.y+1)*0.5, (rec.normal.z+1)*0.5));
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
  },

  render: function() {
    var ctx = this.ctx;
    var nx = this.width;
    var ny = this.height;
    var ns = 100;
    
    var imageData = ctx.createImageData(nx, ny);

    var list = [
      new sphere(new vec3(0,0,-1), 0.5),
      new sphere(new vec3(0,-100.5,-1), 100)
    ];
    var world = new hittable_list(list, 2);
    var cam = new camera();

    var passes = 10;
    var totalTime = 0;
    for (var p = 0; p < passes; p++) {
      var startTime = performance.now();

      var idx, col, u, v, r;
    
      for (var j = ny-1; j >= 0; j--) {
        for (var i = 0; i < nx; i++) {
          col = new vec3(0,0,0);
          for (var s = 0; s < ns; s++) {
            u = (i + Math.random()) / nx;
            v = (j + Math.random()) / ny;
            r = cam.get_ray(u, v);
            col = col.add(this.color(r, world));
          }
          col = col.divfl(ns);
          col = col.mulfl(255.99);

          idx = 4*(i + (ny-j-1)*nx);
          imageData.data[idx++] = Math.round(col.r);   
          imageData.data[idx++] = Math.round(col.g);
          imageData.data[idx++] = Math.round(col.b);
          imageData.data[idx++] = 255; // alpha

          // ctx.fillStyle = 'rgb('+Math.round(col.r)+','+Math.round(col.g)+','+Math.round(col.b)+')';
          // ctx.fillRect(i, ny-j-1, 1, 1);
        }
      }
    
      ctx.putImageData(imageData, 0, 0);
      
      var endTime = performance.now();
      totalTime += (endTime-startTime);
    }
    
    this.log('Total time for '+passes+' passes: '+totalTime+' ms');
    this.log('Avg time per pass: '+(totalTime/passes)+' ms = '+(Math.round(totalTime/passes)/1000)+' s');
  }
};

window.onload = function() { 
  let startTime = performance.now();
  ep008.main({
    container: 'ep008',
    width: 200,
    height: 100
  });
  let endTime = performance.now();
  let totalTime = (endTime-startTime);
  ep008.log(totalTime+' ms');
};
