#include <iostream>

#define STB_IMAGE_IMPLEMENTATION
#include "../stb/stb_image.h"
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include "../stb/stb_image_write.h"

int main() {
  int x, y, n;
  // unsigned char *data = stbi_load("foo.png", &x, &y, &n, 0);
  unsigned char *data = NULL;
  #ifdef GERRIT_VSCODE
  const char* filename = "./output/ep002-vs.png";
  #else
  const char* filename = "./output/ep002.png";
  #endif

  int nx = 200;
  int ny = 100;

  data = (unsigned char*) malloc(nx * ny * 3);
  if (data == NULL) {
    printf("Could not alloc image buffer.\n");
    return 0;
  } 

  for (int j = ny-1; j >= 0; j--) {
    for (int i = 0; i < nx; i++) {
      float r = float(i) / float(nx);
      float g = float(j) / float(ny);
      float b = 0.2;

      int ir = int(255.99 * r);
      int ig = int(255.99 * g);
      int ib = int(255.99 * b);

      data[((ny-j-1)*nx+i)*3+0] = ir;
      data[((ny-j-1)*nx+i)*3+1] = ig;
      data[((ny-j-1)*nx+i)*3+2] = ib;
    }
  }

  stbi_write_png(filename, nx, ny, 3, data, 0);
}
