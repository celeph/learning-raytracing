#ifndef SPHEREH
#define SPHEREH

#include "hittable.h"

class sphere: public hittable {
  public:
    sphere() {}

    // constructor that sets center and radius properties below
    // add material pointer
    sphere(vec3 cen, float r, material *m) : center(cen), radius(r), mat_ptr(m) { };

    virtual bool hit(const ray& r, float t_min, float t_max, hit_record& rec) const;

    vec3 center;
    float radius;
    material *mat_ptr;
};


bool sphere::hit(const ray& r, float t_min, float t_max, hit_record& rec) const {
  vec3 oc = r.origin() - center;
  float a = dot(r.direction(), r.direction());
  float b = dot(oc, r.direction());
  float c = dot(oc, oc) - radius*radius;
  float discriminant = b*b - a*c;


  if (discriminant > 0) {
    // solve quadratic formula -b - sqrt()
    float temp = (-b - sqrt(b*b - a*c))/a; // removed 2 because they cancel each other out? They don't really, do they?
    if (temp < t_max && temp > t_min) {
      rec.t = temp;
      rec.p = r.point_at_parameter(rec.t);
      rec.normal = (rec.p - center) / radius;
      rec.mat_ptr = mat_ptr;
      return true;
    }

    // solve quadratic formula -b + sqrt()
    temp = (-b + sqrt(b*b - a*c))/a; // removed 2 because they cancel each other out? They don't really, do they?
    if (temp < t_max && temp > t_min) {
      rec.t = temp;
      rec.p = r.point_at_parameter(rec.t);
      rec.normal = (rec.p - center) / radius;
      rec.mat_ptr = mat_ptr;
      return true;
    }
  }
  return false;
}

#endif
