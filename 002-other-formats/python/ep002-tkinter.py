#!/usr/bin/env python3

""" Simple Image with Python and Pillow
"""

import sys
from tkinter import *
from PIL import Image, ImageTk

def rgb_to_hex(rgb):
  return '#%02x%02x%02x' % rgb

def main():
  nx = 200
  ny = 100

  img = Image.new(mode="RGB", size=(nx, ny))
  pixels = img.load()

  app = Tk()
  app.geometry(f"{nx}x{ny}")

  canvas = Canvas(app, bg='black')
  canvas.pack(anchor='nw', fill='both', expand=1)

  for j in range(ny, 0, -1):
    for i in range(0, nx, 1):
      r = float(i) / float(nx)
      g = float(j-1) / float(ny)
      b = 0.2

      ir = int(255.99 * r)
      ig = int(255.99 * g)
      ib = int(255.99 * b)

      # canvas.create_line(i, ny-j, i+1, ny-j, fill=rgb_to_hex((ir, ig, ib)))
      pixels[i, ny-j] = (ir, ig, ib)

  image = ImageTk.PhotoImage(img)
  canvas.create_image(0, 0, image=image, anchor='nw')

  app.mainloop()

if __name__ == '__main__':
  sys.exit(main())