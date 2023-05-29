#include <stdio.h>
#include <iostream>
#include "vec3.h"
#include "random.h"
#include "ray.h"
#include "sphere.h"
#include "hittable_list.h"
#include <float.h>
#include "camera.h"

#ifdef __EMSCRIPTEN__
#include <SDL/SDL.h>
#include <emscripten.h>
#endif

vec3 color(const ray& r, hittable *world) {
  hit_record rec;

  if (world->hit(r, 0.0, INFINITY, rec)) { // was MAXFLOAT
    return 0.5 * vec3(rec.normal.x()+1, rec.normal.y()+1, rec.normal.z()+1);
  }
  else {
    vec3 unit_direction = unit_vector(r.direction());
    float t = 0.5 * (unit_direction.y() + 1.0);
    return (1.0-t) * vec3(1.0, 1.0, 1.0) + t*vec3(0.5, 0.7, 1.0);
  }
}

extern "C" int main(int argc, char** argv) {
  int nx = 200;
  int ny = 100;
  int ns = 100;

#ifdef __EMSCRIPTEN__
  SDL_Init(SDL_INIT_VIDEO);
  SDL_Surface *screen = SDL_SetVideoMode(nx, ny, 32, SDL_SWSURFACE);

#ifdef TEST_SDL_LOCK_OPTS
  EM_ASM("SDL.defaults.copyOnLock = false; SDL.defaults.discardOnLock = true; SDL.defaults.opaqueFrontBuffer = false;");
#endif

  if (SDL_MUSTLOCK(screen)) SDL_LockSurface(screen);
#else
  std::cout << "P3\n" << nx << " " << ny << "\n255\n";
#endif

  hittable *list[2];
  list[0] = new sphere(vec3(0,0,-1), 0.5);
  list[1] = new sphere(vec3(0,-100.5,-1), 100);

  hittable *world = new hittable_list(list, 2);
  camera cam;

  for (int j = ny-1; j >= 0; j--) {
    for (int i = 0; i < nx; i++) {
      vec3 col(0,0,0);
      for (int s = 0; s < ns; s++) {
        float u = float(i + random_double()) / float(nx); // was drand48()
        float v = float(j + random_double()) / float(ny);

        // define a ray from the origin (eye) through the pixel at (u,v)
        ray r = cam.get_ray(u, v);

        vec3 p = r.point_at_parameter(2.0);
        col += color(r, world);
      }
      col /= float(ns);

      int ir = int(255.99 * col[0]);
      int ig = int(255.99 * col[1]);
      int ib = int(255.99 * col[2]);
      int alpha = 255;
#ifdef __EMSCRIPTEN__
      *((Uint32*)screen->pixels + (ny-j-1) * nx + i) = SDL_MapRGBA(screen->format, ir, ig, ib, alpha);
#else
      std::cout << ir << " " << ig << " " << ib << "\n";
#endif
    }
  }

#ifdef __EMSCRIPTEN__
  if (SDL_MUSTLOCK(screen)) SDL_UnlockSurface(screen);
  SDL_Flip(screen); 
  SDL_Quit();
#endif

  return 0;
}
