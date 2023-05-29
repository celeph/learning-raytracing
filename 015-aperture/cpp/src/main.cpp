#ifdef GERRIT_VSCODE
#define _USE_MATH_DEFINES
#include <math.h>
#define _CRT_RAND_S
#include <stdlib.h>
#endif

#include <iostream>
#include "vec3.h"
#include "random.h"
#include "ray.h"
#include "sphere.h"
#include "hittable_list.h"
#include <float.h>
#include "camera.h"
#include "material.h"

#ifdef __EMSCRIPTEN__
#include <SDL/SDL.h>
#include <emscripten.h>
#endif


vec3 color(const ray& r, hittable *world, int depth) {
  hit_record rec;

  if (world->hit(r, 0.001, INFINITY, rec)) {
    ray scattered;
    vec3 attenuation;
    if (depth < 50 && rec.mat_ptr->scatter(r, rec, attenuation, scattered)) {
      return attenuation*color(scattered, world, depth+1);
    }
    else {
      return vec3(0,0,0);
    }
  }
  else {
    vec3 unit_direction = unit_vector(r.direction());
    float t = 0.5 * (unit_direction.y() + 1.0);
    return (1.0-t) * vec3(1.0, 1.0, 1.0) + t*vec3(0.5, 0.7, 1.0);
  }
}

extern "C" int main(int argc, char** argv) {
  int nx = 200*3;
  int ny = 100*3;
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

  //hittable *list[2];
  //float R = cos(M_PI/4);
  //list[0] = new sphere(vec3(-R,0,-1), R, new lambertian(vec3(0,0,1)));
  //list[1] = new sphere(vec3(R,0,-1), R, new lambertian(vec3(1,0,0)));
  //hittable *world = new hittable_list(list, 2);

  hittable *list[5]; // add a couple more spheres, and assign material type
  list[0] = new sphere(vec3(0,0,-1), 0.5, new lambertian(vec3(0.1, 0.2, 0.5)));
  list[1] = new sphere(vec3(0,-100.5,-1), 100, new lambertian(vec3(0.8, 0.8, 0.0)));
  list[2] = new sphere(vec3(1,0,-1), 0.5, new metal(vec3(0.8, 0.6, 0.2), 0.0)); // right metal sphere
  list[3] = new sphere(vec3(-1,0,-1), 0.5, new dielectric(1.5)); // left glass sphere
  list[4] = new sphere(vec3(-1,0,-1), -0.45, new dielectric(1.5)); // left glass sphere
  hittable *world = new hittable_list(list, 5);

  vec3 lookfrom(3,3,2);
  vec3 lookat(0,0,-1);
  float dist_to_focus = (lookfrom-lookat).length();
  float aperture = 2.0;

  camera cam(lookfrom, lookat, vec3(0,1,0), 20, float(nx)/float(ny), aperture, dist_to_focus);
 
  for (int j = ny-1; j >= 0; j--) {
    for (int i = 0; i < nx; i++) {
      vec3 col(0,0,0);
      for (int s = 0; s < ns; s++) {
        float u = float(i + random_double()) / float(nx);
        float v = float(j + random_double()) / float(ny);

        // define a ray from the origin (eye) through the pixel at (u,v)
        ray r = cam.get_ray(u, v);

        // add depth parameter, starting at 0
        col += color(r, world, 0);
      }
      col /= float(ns);

      col = vec3( sqrt(col[0]), sqrt(col[1]), sqrt(col[2]) );
      
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
