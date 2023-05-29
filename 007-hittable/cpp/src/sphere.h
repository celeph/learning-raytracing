#ifndef SPHEREH
#define SPHEREH

#include "hittable.h"

class sphere: public hittable {
  public:
    sphere() {}

    // constructor that sets center and radius properties below
    sphere(vec3 cen, float r) : center(cen), radius(r) { };

    virtual bool hit(const ray& r, float t_min, float t_max, hit_record& rec) const;

    vec3 center;
    float radius;
};


bool sphere::hit(const ray& r, float t_min, float t_max, hit_record& rec) const {
  vec3 oc = r.origin() - center;
  float a = dot(r.direction(), r.direction());
  float b = dot(oc, r.direction()); // removed 2.0
  float c = dot(oc, oc) - radius*radius;
  float discriminant = b*b - a*c; // removed 4.0

  if (discriminant > 0) {
    // solve quadratic formula -b - sqrt()
    float temp = (-b - sqrt(discriminant))/a; // removed 2.0 because they cancel each other out
    if (temp < t_max && temp > t_min) {
      rec.t = temp;
      rec.p = r.point_at_parameter(rec.t);
      rec.normal = (rec.p - center) / radius;
      return true;
    }

    // solve quadratic formula -b + sqrt()
    temp = (-b + sqrt(discriminant))/a; // removed 2.0 because they cancel each other out
    if (temp < t_max && temp > t_min) {
      rec.t = temp;
      rec.p = r.point_at_parameter(rec.t);
      rec.normal = (rec.p - center) / radius;
      return true;
    }
  }
  return false;
}

#endif
