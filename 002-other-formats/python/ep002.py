#!/usr/bin/env python3

""" Simple Image with Python and Pillow
"""

import sys
from PIL import Image

def main():
  nx = 200
  ny = 100
  
  img = Image.new(mode="RGB", size=(nx, ny))
  pixels = img.load()

  for j in range(img.size[1], 0, -1):
    for i in range(0, img.size[0], 1):
      r = float(i) / float(nx)
      g = float(j-1) / float(ny)
      b = 0.2

      ir = int(255.99 * r)
      ig = int(255.99 * g)
      ib = int(255.99 * b)

      pixels[i, ny-j] = (ir, ig, ib)

  img.save('./output/ep002.png')
  img.show()

if __name__ == '__main__':
  sys.exit(main())