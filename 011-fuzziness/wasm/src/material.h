#ifndef MATERIALH
#define MATERIALH

vec3 random_in_unit_sphere() {
  vec3 p;
  do {
    p = 2.0 * vec3(random_double(), random_double(), random_double()) - vec3(1,1,1);
  } while (p.squared_length() >= 1.0); // remember sphere: x^2+y^2+z^2 = 1^2
  return p;
}

vec3 reflect(const vec3& v, const vec3& n) {
  return v - 2*dot(v,n)*n;
}

class material {
  public:
    virtual bool scatter(const ray& r_in, const hit_record& rec, vec3& attenuation, ray& scattered) const = 0;
};

class lambertian : public material {
  public:
    lambertian(const vec3& a) : albedo(a) {}
    virtual bool scatter(const ray& r_in, const hit_record& rec, vec3& attenuation, ray& scattered) const {
      // vec3 target = rec.p + rec.normal + random_in_unit_sphere();
      // scattered = ray(rec.p, target-rec.p);
      vec3 target = rec.normal + random_in_unit_sphere();
      scattered = ray(rec.p, target);
      
      attenuation = albedo;
      return true;
    }

    vec3 albedo;
};

class metal : public material {
  public:
    // new: add parameter f for fuzziness
    metal(const vec3& a, float f) : albedo(a) { 
      if (f < 1) fuzz = f; // make sure fuzziness doesn't exceed radius of unit-sphere (otherwise the bigger the sphere the fuzzier refrections 
      else fuzz = 1; 
    }

    virtual bool scatter(const ray& r_in, const hit_record& rec, vec3& attenuation, ray& scattered) const {
      vec3 reflected = reflect(unit_vector(r_in.direction()), rec.normal);
      // scattered = ray(rec.p, reflected);
      scattered = ray(rec.p, reflected + fuzz * random_in_unit_sphere());
      attenuation = albedo;
      return (dot(scattered.direction(), rec.normal) > 0);
    }

    vec3 albedo;
    float fuzz;
};


#endif

