#!/usr/bin/env python3

""" Simple Image with PPM in Python
"""

import sys

def main():
  nx = 200
  ny = 100
  
  print(f'P3\n{nx} {ny}\n255')
  for j in range(ny, 0, -1):
    for i in range(0, nx, 1):
      r = float(i) / float(nx)
      g = float(j-1) / float(ny)
      b = 0.2

      ir = int(255.99 * r)
      ig = int(255.99 * g)
      ib = int(255.99 * b)

      print(f'{ir} {ig} {ib}')

if __name__ == '__main__':
  sys.exit(main())