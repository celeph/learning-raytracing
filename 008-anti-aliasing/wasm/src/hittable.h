#ifndef HITTABLEH
#define HITTABLEH

#include "ray.h"

struct hit_record {
  float t;
  vec3 p;
  vec3 normal;
};

class hittable {
  public:
    // only trace t between t_min and t_max
    // hit_record is used to keep track of what hit was the closest
    virtual bool hit(const ray& r, float t_min, float t_max, hit_record& rec) const = 0;
};

#endif

