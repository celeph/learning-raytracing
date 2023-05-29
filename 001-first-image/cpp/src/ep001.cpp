#include <iostream>

int main() {
  int nx = 200;
  int ny = 100;

  std::cout << "P3\n" << nx << " " << ny << "\n255\n";
  for (int j = ny-1; j >= 0; j--) {
    for (int i = 0; i < nx; i++) {
      float r = float(i) / float(nx); // left to right from 0 to 0.995
      float g = float(j) / float(ny); // top to bottom from 0.99 to 0
      float b = 0.2;

      int ir = int(255.99 * r); // left to right from 0 to 254
      int ig = int(255.99 * g); // top to bottom from 253 to 0
      int ib = int(255.99 * b); // always 51

      std::cout << ir << " " << ig << " " << ib << "\n";
    }
  }
}
