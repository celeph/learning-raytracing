#ifndef RANDOMH
#define RANDOMH

#include <cstdlib>

// workaround when drand48() is not available
inline double random_double() {
  return rand() / (RAND_MAX + 1.0);
}

#endif