#include <stdio.h>
#include <iostream>
#include "vec3.h"

#ifdef __EMSCRIPTEN__
#include <SDL/SDL.h>
#include <emscripten.h>
#endif

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

  for (int j = ny-1; j >= 0; j--) {
    for (int i = 0; i < nx; i++) {
      vec3 col( float(i) / float(nx), float(j) / float(ny), 0.2 );

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

