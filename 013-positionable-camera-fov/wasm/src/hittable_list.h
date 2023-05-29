#ifndef HITTABLELISTH
#define HITTABLELISTH

#include "hittable.h"

class hittable_list: public hittable {
  public:
    hittable_list() { }
    hittable_list(hittable **l, int n) { list = l; list_size = n; }

    virtual bool hit(const ray& r, float t_min, float t_max, hit_record& rec) const;

    hittable **list;
    int list_size;
};

bool hittable_list::hit(const ray& r, float t_min, float t_max, hit_record& rec) const {
  hit_record temp_rec;

  // flag to indicate if we've hit anything at all
  bool hit_anything = false;

  // start with the farthest t
  float closest_so_far = t_max;

  // loop through the list
  for (int i = 0; i < list_size; i++) {
    // if we hit something set closest_so_far to the new hit object t which will also become the t_max for the next iteration
    if (list[i]->hit(r, t_min, closest_so_far, temp_rec)) {
      hit_anything = true;
      closest_so_far = temp_rec.t;
      rec = temp_rec;
    }
  }

  return hit_anything;
}

#endif

