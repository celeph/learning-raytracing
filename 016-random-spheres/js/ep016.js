function classExists(c) {
  return (typeof(c) == "function" && typeof(c.prototype) == "object");
}

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
  constructor(vec3_a, vec3_b) { this.vec3_A = vec3_a; this.vec3_B = vec3_b; }

  vec3_origin() { return this.vec3_A; }
  vec3_direction() { return this.vec3_B; }
  vec3_point_at_parameter(float_t) { return this.vec3_A.add(this.vec3_B.mulfl(float_t)); }
}


// =================================================================================================

class material {
  constructor() { }
  
  vec3_random_in_unit_sphere() {
    var vec3_p;
    
    do {
      // get random from 0-1, multiply with 2 to get 0-2, subtract to -1 to +1
      vec3_p = ((new vec3(Math.random(), Math.random(), Math.random()))
        .mulfl(2.0))
        .sub(new vec3(1,1,1));
    } while (vec3_p.squared_length() >= 1.0); // remember sphere: x^2+y^2+z^2 = 1^2
    
    vec3_p = ((new vec3(Math.random(), Math.random(), Math.random())).mulfl(2.0)).sub(new vec3(1,1,1));
    
    return vec3_p;
  }

  vec3_reflect(vec3_v, vec3_n) {
    return vec3_v.sub(vec3_n.mulfl(vec3_v.dot(vec3_n)).mulfl(2));
  }
  
  bool_scatter(ray_r_in, hit_record_rec, vec3$attenuation, ray$scattered) { }

  bool_refract(vec3_v, vec3_n, float_ni_over_nt, vec3$refracted) {
    var vec3_uv = vec3_v.unit_vector();
    var float_dt = vec3_uv.dot(vec3_n);
    var float_discriminant = 1.0 - float_ni_over_nt * float_ni_over_nt * (1.0 - float_dt * float_dt);

    if (float_discriminant > 0) {
      vec3$refracted.v = ( (vec3_uv.sub(vec3_n.mulfl(float_dt))).mulfl(float_ni_over_nt) )
        .sub( vec3_n.mulfl(Math.sqrt(float_discriminant)) );
      return true;
    }
    else return false;
  }

  float_schlick(float_cosine, float_ref_idx) {
    var float_r0 = (1-float_ref_idx) / (1+float_ref_idx);
    float_r0 = float_r0*float_r0;
    return float_r0 + (1-float_r0) * Math.pow((1-float_cosine),5);
  }
}

class lambertian extends material {
  constructor(vec3_a) { super(); this.vec3_albedo = vec3_a; }
  
  bool_scatter(ray_r_in, hit_record_rec, vec3$attenuation, ray$scattered) {
    var vec3_target = hit_record_rec.vec3_normal.add(this.vec3_random_in_unit_sphere());
    ray$scattered.v = new ray(hit_record_rec.vec3_p, vec3_target);
    vec3$attenuation.v = this.vec3_albedo;
    return true;
  }
}

class metal extends material {
  constructor(vec3_a, float_f) { 
    super(); 
    this.vec3_albedo = vec3_a; 
    
    if (float_f < 1) this.float_fuzziness = float_f;
    else this.float_fuzziness = 1;
  }
  
  bool_scatter(ray_r_in, hit_record_rec, vec3$attenuation, ray$scattered) {
    var vec3_reflected = this.vec3_reflect(ray_r_in.vec3_direction().unit_vector(), hit_record_rec.vec3_normal);
    //...
    // this.scattered = new ray(hit_record_rec.vec3_p, vec3_reflected);
    ray$scattered.v = new ray(hit_record_rec.vec3_p, vec3_reflected.add(this.vec3_random_in_unit_sphere().mulfl(this.float_fuzziness)));
    //...
    vec3$attenuation.v = this.vec3_albedo;
    return (ray$scattered.v.vec3_direction().dot(hit_record_rec.vec3_normal) > 0);
  }
};

// new:
class dielectric extends material {
  constructor(float_ri) {
    super();
    this.float_ref_idx = float_ri;
  }
  
  // new convention
  // - prefix variable names with type
  // - "pass by reference" arguments should be passed as {v: object} and '$' after type prefix
  bool_scatter(ray_r_in, hit_record_rec, vec3$attenuation, ray$scattered) {
    var vec3_outward_normal;

    // with unit vector, the left sphere turns slightly darker
    // var reflected = this.vec3_reflect(ray_r_in.vec3_direction().unit_vector(), rec.vec3_normal);
    var vec3_reflected = this.vec3_reflect(ray_r_in.vec3_direction(), hit_record_rec.vec3_normal);

    var float_ni_over_nt;

    // attenuation is always 1, glass surface doesn't absorb anything
    vec3$attenuation.v = new vec3(1.0, 1.0, 1.0);
    //vec3$attenuation.v = new vec3(1.0, 1.0, 0.0); // introduces a color bug by killing the blue channel

    var vec3$refracted = { v: new vec3(1.0, 1.0, 1.0) };
  
    var float_reflect_prob;
    var float_cosine;

    if (ray_r_in.vec3_direction().dot(hit_record_rec.vec3_normal) > 0) {
      vec3_outward_normal = hit_record_rec.vec3_normal.mulfl(-1.0);
      float_ni_over_nt = this.float_ref_idx;
      // float_cosine = this.float_ref_idx * ray_r_in.vec3_direction().dot(hit_record_rec.vec3_normal) / ray_r_in.vec3_direction().length();
      float_cosine = (ray_r_in.vec3_direction().dot(hit_record_rec.vec3_normal)) / (ray_r_in.vec3_direction().length());
      float_cosine = Math.sqrt(1 - this.float_ref_idx*this.float_ref_idx*(1-float_cosine*float_cosine));
    }
    else {
      vec3_outward_normal = hit_record_rec.vec3_normal;
      float_ni_over_nt = 1.0 / this.float_ref_idx;
      float_cosine = -(ray_r_in.vec3_direction().dot(hit_record_rec.vec3_normal)) / (ray_r_in.vec3_direction().length());
    }

    if (this.bool_refract(ray_r_in.vec3_direction(), vec3_outward_normal, float_ni_over_nt, vec3$refracted)) {
      float_reflect_prob = this.float_schlick(float_cosine, this.float_ref_idx);
    }
    else {
      // scattered = ray(hit_record_rec.vec3_p, vec3_reflected); // not needed, commented out for performance improvement
      float_reflect_prob = 1.0;
    }

    if (Math.random() < float_reflect_prob) {
      ray$scattered.v = new ray(hit_record_rec.vec3_p, vec3_reflected);
      // return false; // this introduces another bug because it tells the caller that there are no reflections
    }
    else {
      ray$scattered.v = new ray(hit_record_rec.vec3_p, vec3$refracted.v);
    }

    return true;
  }
}

// =================================================================================================

var hit_record = {
  float_t: 0.0,
  vec3_p: null,
  vec3_normal: null
};


class hittable {
  constructor() { }
  bool_hit(ray_r, float_t_min, float_t_max, hit_record_rec) { }
}


class sphere extends hittable {
  // new: added mat_ptr
  constructor(vec3_cen, float_r, material_m) { 
    super(); 
    this.vec3_center = vec3_cen; 
    this.float_radius = float_r; 
    this.float_rsquared = float_r*float_r; 
    this.material_mat_ptr = material_m; 
  }

  bool_hit(ray_r, float_t_min, float_t_max, hit_record_rec) { 
    var vec3_oc = ray_r.vec3_origin().sub(this.vec3_center); // vec3
    var float_a = ray_r.vec3_direction().dot(ray_r.vec3_direction()); // float
    var float_b = vec3_oc.dot(ray_r.vec3_direction()); // float
    var float_c = vec3_oc.dot(vec3_oc) - this.float_rsquared; // float
    var float_discriminant = float_b*float_b - float_a*float_c; // float

    if (float_discriminant > 0) {
      // solve quadratic formula -b - sqrt()
      var float_temp = (-float_b - Math.sqrt(float_discriminant))/float_a; // float
      if (float_temp < float_t_max && float_temp > float_t_min) {
        hit_record_rec.float_t = float_temp;
        hit_record_rec.vec3_p = ray_r.vec3_point_at_parameter(hit_record_rec.float_t);
        hit_record_rec.vec3_normal = (hit_record_rec.vec3_p.sub(this.vec3_center)).divfl(this.float_radius);
        // new: added mat_ptr
        hit_record_rec.material_mat_ptr = this.material_mat_ptr;
        return true;
      }

      // solve quadratic formula -b + sqrt()
      float_temp = (-float_b + Math.sqrt(float_discriminant))/float_a; 
      if (float_temp < float_t_max && float_temp > float_t_min) {
        hit_record_rec.float_t = float_temp;
        hit_record_rec.vec3_p = ray_r.vec3_point_at_parameter(hit_record_rec.float_t);
        hit_record_rec.vec3_normal = (hit_record_rec.vec3_p.sub(this.vec3_center)).divfl(this.float_radius);
        // new: added mat_ptr
        hit_record_rec.material_mat_ptr = this.material_mat_ptr;
        return true;
      }
    }
    return false;
  }
}


class hittable_list extends hittable {
  constructor(hittable_l, int_n) { 
    super(); 
    this.hittable_list = hittable_l; 
    this.int_list_size = int_n; 
  }
  
  bool_hit(ray_r, float_t_min, float_t_max, hit_record_rec) { 
    var hit_record_temp_rec = hit_record_rec;
    var bool_hit_anything = false;
    var float_closest_so_far = float_t_max;
    for (var i = 0; i < this.int_list_size; i++) {
      if (this.hittable_list[i].bool_hit(ray_r, float_t_min, float_closest_so_far, hit_record_temp_rec)) {
        bool_hit_anything = true;
        float_closest_so_far = hit_record_temp_rec.float_t;
        hit_record_rec = hit_record_temp_rec;
      }
    }
    return bool_hit_anything;
  }
}


// =================================================================================================


class camera {
  constructor(vec3_lookfrom, vec3_lookat, vec3_vup, float_vfov, float_aspect, float_aperture, float_focus_dist) {
    this.float_lens_radius = float_aperture / 2;
    var float_theta = float_vfov * Math.PI/180.0;
    var float_half_height = Math.tan(float_theta/2);
    var float_half_width = float_aspect * float_half_height;

    this.vec3_origin = vec3_lookfrom;
    this.vec3_w = (vec3_lookfrom.sub(vec3_lookat)).unit_vector();
    this.vec3_u = vec3_vup.cross(this.vec3_w).unit_vector();
    this.vec3_v = this.vec3_w.cross(this.vec3_u);
    
    // this.vec3_lower_left_corner = new vec3(-float_half_width, -float_half_height, -1.0);
    this.vec3_lower_left_corner = this.vec3_origin
      .sub(this.vec3_u.mulfl(float_half_width*float_focus_dist))
      .sub(this.vec3_v.mulfl(float_half_height*float_focus_dist))
      .sub(this.vec3_w.mulfl(float_focus_dist));
      
    //this.vec3_horizontal = new vec3(2*float_half_width, 0.0, 0.0);
    this.vec3_horizontal = this.vec3_u.mulfl(2*float_half_width*float_focus_dist);
    
    //this.vec3_vertical = new vec3(0.0, 2*float_half_height, 0.0);
    this.vec3_vertical = this.vec3_v.mulfl(2*float_half_height*float_focus_dist);
    
    //this.vec3_origin = new vec3(0.0, 0.0, 0.0);
  }
  
  vec3_random_in_unit_disk() {
    var vec3_p;
    do {
      vec3_p = new vec3(Math.random(), Math.random(), 0).sub(new vec3(1,1,0)).mulfl(2.0);
    } while (vec3_p.dot(vec3_p) >= 1.0);
    return vec3_p;
  }
  
  ray_get_ray(float_s, float_t) { // float
    var vec3_rd = (this.vec3_random_in_unit_disk()).mulfl(this.float_lens_radius);
    var vec3_offset = (this.vec3_u.mulfl(vec3_rd.x)).add(this.vec3_v.mulfl(vec3_rd.y));
    return new ray(this.vec3_origin.add(vec3_offset), this.vec3_lower_left_corner
      .add(this.vec3_horizontal.mulfl(float_s))
      .add(this.vec3_vertical.mulfl(float_t))
      .sub(this.vec3_origin)
      .sub(vec3_offset)
    );
  }
}


// =================================================================================================

// raytracer
// this class coordinates rendering passes and makes sure
// one rendering task doesn't block the browser or other rendering tasks
class raytracer {
  
  vec3_color(ray_r, hittable_world, int_depth) {
    var hit_record_rec = hit_record;
    if (hittable_world.bool_hit(ray_r, 0.001, Infinity, hit_record_rec)) {
  
      var vec3$attenuation = { v: null };
      var ray$scattered = { v: null };
      var scatter = hit_record_rec.material_mat_ptr.bool_scatter(ray_r, hit_record_rec, vec3$attenuation, ray$scattered);

      // new: update to use the new material with a depth of 50 recursive calls
      if (int_depth < 50 && scatter) {
        return vec3$attenuation.v.mul(
          this.vec3_color(ray$scattered.v, hittable_world, int_depth+1)
        );
      }
      else {
        return new vec3(0,0,0);
      }
    }
    else {
      var vec3_unit_direction = ray_r.vec3_direction().unit_vector();
      var float_t = 0.5 * (vec3_unit_direction.y + 1.0);
      
      // return (new vec3(1.0, 1.0, 1.0))
      // .mulfl(1.0 - t)
      // .add( 
      //   (new vec3(0.5, 0.7, 1.0)).mulfl(t) 
      // );
        
      return (new vec3(1.0-float_t+float_t*0.5, 1.0-float_t+float_t*0.7, 1.0-float_t+float_t));
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
    var vec3_lookfrom = new vec3(3,3,2);
    var vec3_lookat = new vec3(0,0,-1);
    var float_dist_to_focus = (vec3_lookfrom.sub(vec3_lookat)).length();
    var float_aperture = 2.0;

    this.cam = c.camera || new camera(vec3_lookfrom, vec3_lookat, new vec3(0,1,0), 20, this.nx/this.ny, float_aperture, float_dist_to_focus);
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
        r = this.cam.ray_get_ray(u, v);
        col = col.add(this.vec3_color(r, this.world, 0));
      }
      col = col.divfl(this.ns);
    }
    else {
      u = i / this.nx;
      v = j / this.ny;
      r = this.cam.ray_get_ray(u, v);
      col = this.vec3_color(r, this.world, 0);
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

var ep016 = {
  container: '',
  width: 0,
  height: 0,
  ctx: null,
  raytracer: null,

  css: function() {
    return '<'+'style>'+
      '#'+this.container+'-raytracer{margin:0 auto;display:block;width:'+this.width+'px;'+
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
    
    //this.renderSinglePass();
     this.renderMultiPass();
    // this.renderMultiPassScaled();
  },

  getObjectList: function() {
    var list = [
      new sphere(new vec3(0,0,-1), 0.5, new lambertian(new vec3(0.1, 0.2, 0.5))),
      new sphere(new vec3(0,-100.5,-1), 100, new lambertian(new vec3(0.8, 0.8, 0.0))),
      new sphere(new vec3(1,0,-1), 0.5, new metal(new vec3(0.8, 0.6, 0.2), 0.0)), // right metal sphere
      new sphere(new vec3(-1,0,-1), 0.5, new dielectric(1.5)), // left glass sphere
      new sphere(new vec3(-1,0,-1), -0.45, new dielectric(1.5)), // left glass sphere
    ];
    return list;
  },
  
  random_scene() {
    var n = 500;
    var list = [
      new sphere(new vec3(0,-1000,0), 1000, new lambertian(new vec3(0.5, 0.5, 0.5)))
    ];
    
    var i = 1;

    for (var a = -3; a < 3; a++) {
      for (var b = -3; b < 3; b++) {
        var choose_mat = Math.random();
        var vec3_center = new vec3(a+0.9*Math.random(), 0.2, b+0.9*Math.random());
        if ((vec3_center.sub(new vec3(4, 0.2, 0))).length() > 0.9) {
          if (choose_mat < 0.8) { // diffuse
            list.push(new sphere(vec3_center, 0.2, new lambertian(new vec3(Math.random()*Math.random(), Math.random()*Math.random(), Math.random()*Math.random()))));
          }
          else if (choose_mat < 0.95) { // metal
            list.push(new sphere(vec3_center, 0.2, new metal(new vec3(0.5*(1+Math.random()), 0.5*(1+Math.random()), 0.5*(1+Math.random())), 0.5*Math.random())));
          }
          else { // glass
            list.push(new sphere(vec3_center, 0.2, new dielectric(1.5)));
          }
        }
      }
    }

    list.push(new sphere(new vec3(0,1,0), 1.0, new dielectric(1.5)));
    list.push(new sphere(new vec3(-4,1,0), 1.0, new lambertian(new vec3(0.4,0.2,0.1))));
    list.push(new sphere(new vec3(4,1,0), 1.0, new metal(new vec3(0.7,0.6,0.5), 0.0)));

    return list;
  },

  renderSinglePass: function() {
    var list = this.random_scene();
    
    var vec3_lookfrom = new vec3(13,2,3);
    var vec3_lookat = new vec3(0,0,0);
    var float_dist_to_focus = 10.0; // (vec3_lookfrom.sub(vec3_lookat)).length();
    var float_aperture = 0.1; // 2.0;
    var cam = new camera(vec3_lookfrom, vec3_lookat, new vec3(0,1,0), 20, this.width/this.height, float_aperture, float_dist_to_focus);

    this.raytracer = new raytracer({
      // canvas settings
      client: this,
      ctx: this.ctx,
      width: this.width, 
      height: this.height,
      drawMethod: 'image', // 'rect' or 'image'

      // scene settings
      world: new hittable_list(list, list.length),
      camera: cam,
      
      // anti-aliasing settings
      antiAliasing: true,
      ns: 100/2,

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
    var list = this.random_scene();

    raytracer.speed = 5;
    raytracer.multipassVariant = 1;

    var vec3_lookfrom = new vec3(13,2,3);
    var vec3_lookat = new vec3(0,0,0);
    var float_dist_to_focus = 10.0; // (vec3_lookfrom.sub(vec3_lookat)).length();
    var float_aperture = 0.1; // 2.0;
    var cam = new camera(vec3_lookfrom, vec3_lookat, new vec3(0,1,0), 20, this.width/this.height, float_aperture, float_dist_to_focus);

    this.raytracer = new raytracer({
      // canvas settings
      client: this,
      ctx: this.ctx,
      width: this.width, 
      height: this.height,
      drawMethod: 'rect', // 'rect' or 'image'

      // scene settings
      world: new hittable_list(list, list.length),
      camera: cam,

      // anti-aliasing settings
      antiAliasing: true,
      ns: 100/2,

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
    var list = this.random_scene();
    var scale = 4;
    var o = document.getElementById(this.container+'-canvas');
    o.width *= scale;
    o.height *= scale;
    
    var o2 = document.getElementById(this.container+'-raytracer');
    o2.style.width = o.width+'px';
    
    raytracer.speed = 10;
    raytracer.multipassVariant = 0;

    var vec3_lookfrom = new vec3(13,2,3);
    var vec3_lookat = new vec3(0,0,0);
    var float_dist_to_focus = 10.0; // (vec3_lookfrom.sub(vec3_lookat)).length();
    var float_aperture = 0.1; // 2.0;
    var cam = new camera(vec3_lookfrom, vec3_lookat, new vec3(0,1,0), 20, this.width/this.height, float_aperture, float_dist_to_focus);

    this.raytracer = new raytracer({
      // canvas settings
      client: this,
      ctx: this.ctx,
      width: this.width, 
      height: this.height,
      drawMethod: 'rect', // 'rect' or 'image'

      // scene settings
      world: new hittable_list(list, list.length),
      camera: cam,

      // anti-aliasing settings
      antiAliasing: true,
      ns: 100/2,

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
  ep016.main({
    container: 'ep016',
    width: 200*3,
    height: 100*3
  });
  
  // start rendering
  raytracer.render();
  
  let endTime = performance.now();
  let totalTime = (endTime-startTime);
  ep016.log(totalTime+' ms');
};
