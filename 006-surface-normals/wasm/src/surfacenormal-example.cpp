#include <stdio.h>
#include <iostream>
#include "vec3.h"
#include "ray.h"

#ifdef __EMSCRIPTEN__
#include <SDL/SDL.h>
#include <emscripten.h>
#endif

float hit_sphere(const vec3& center, float radius, const ray& r) {
  // See notes, solving the quadratic formula where p(t)=A+tB meets the sphere x^2+y^2+z^2=R^2
  vec3 oc = r.origin() - center;
  float a = dot(r.direction(), r.direction());
  float b = 2.0 * dot(oc, r.direction());
  float c = dot(oc, oc) - radius * radius;
  float discriminant = b*b - 4*a*c;

  if (discriminant < 0) return -1.0; // square root of negative numbers not defined here, no roots = ray doesn't hit sphere
  else return (-b - sqrt(discriminant)) / (2.0*a); // return smallest t (closest hitpoint)
}

vec3 color(const ray& r) {
  // get closest t intersecting with the sphere with center at (0,0,-1) and radius 0.5
  float t = hit_sphere(vec3(0.0,0.0,-1.0), 0.5, r);

  // if t > 0 we have hit the sphere
  // if t < 0 no roots, no intersection with sphere
  if (t > 0.0) {
    // N = (P - C) converted into a unit-vector with components between -1 and 1
    vec3 N = unit_vector(r.point_at_parameter(t) - vec3(0.0,0.0,-1.0));

    // map components to 0-1 and use these as r, g, b values
    return 0.5 * vec3(N.x() + 1.0, N.y() + 1.0, N.z() + 1.0);
  }

  // ray didn't hit the sphere, get the pixel position the ray is passing through (u,v) as unit-vector -1 to 1 
  vec3 unit_direction = unit_vector(r.direction());
  // map this to 0-1
  t = 0.5 * (unit_direction.y() + 1.0);
  // linear interpolation from blue to white
  return (1.0 - t) * vec3(1.0, 1.0, 1.0) + t * vec3(0.5, 0.7, 1.0);
}

extern "C" int main(int argc, char** argv) {
  int nx = 200;
  int ny = 100;

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

  vec3 lower_left_corner(-2.0, -1.0, -1.0);
  vec3 horizontal(4.0, 0.0, 0.0);
  vec3 vertical(0.0, 2.0, 0.0);
  vec3 origin(0.0, 0.0, 0.0);

  for (int j = ny-1; j >= 0; j--) {
    for (int i = 0; i < nx; i++) {
      float u = float(i) / float(nx);
      float v = float(j) / float(ny);

      // define a ray from the origin (eye) through the pixel at (u,v)
      ray r(origin, lower_left_corner + u * horizontal + v * vertical);

      // determine color for this ray
      vec3 col = color(r);

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
