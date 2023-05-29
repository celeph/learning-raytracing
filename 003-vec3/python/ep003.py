#!/usr/bin/env python3

""" Simple Image with PPM in Python
"""

import sys
from vec3 import vec3

def main():
  nx = 200
  ny = 100

  print(f'P3\n{nx} {ny}\n255')
  for j in range(ny, 0, -1):
    for i in range(0, nx, 1):
      col = vec3(i/nx, j/ny, 0.2)
      col *= 255.99
      col = col.toInt()
      print(f'{col.r} {col.g} {col.b}')

if __name__ == '__main__':
  sys.exit(main())