# See also https://www.geeksforgeeks.org/operator-overloading-in-python/
# https://docs.python.org/3/reference/datamodel.html#object.__complex__

import math

class vec3:
  def __init__(self, e0, e1, e2):
    self.e = [e0, e1, e2]

  @property
  def x(self):
    return self.e[0]

  @property
  def y(self):
    return self.e[1]

  @property
  def z(self):
    return self.e[2]

  @property
  def r(self):
    return self.e[0]

  @property
  def g(self):
    return self.e[1]

  @property
  def b(self):
    return self.e[2]

  def __pos__(self):
    return vec3(self.x, self.y, self.z)

  def __neg__(self):
    return vec3(-self.x, -self.y, -self.z)

  def __iadd__(self, v):
    self.e[0] += v.x
    self.e[1] += v.y
    self.e[2] += v.z
    return self

  def __isub__(self, v):
    self.e[0] -= v.x
    self.e[1] -= v.y
    self.e[2] -= v.z
    return self

  def __imul__(self, v):
    if isinstance(v, vec3):
      self.e[0] *= v.x
      self.e[1] *= v.y
      self.e[2] *= v.z
    else:
      self.e[0] *= v
      self.e[1] *= v
      self.e[2] *= v
    return self

  def __idiv__(self, v):
    if isinstance(v, vec3):
      self.e[0] /= v.x
      self.e[1] /= v.y
      self.e[2] /= v.z
    else:
      k = 1.0 / v
      self.e[0] *= k
      self.e[1] *= k
      self.e[2] *= k
    return self

  def __add__(self, v):
    return vec3(self.x + v.x, self.y + v.y, self.z + v.z)

  def __sub__(self, v):
    return vec3(self.x - v.x, self.y - v.y, self.z - v.z)

  def __mul__(self, v):
    if isinstance(v, vec3):
      return vec3(self.x * v.x, self.y * v.y, self.z * v.z)
    else:
      return vec3(self.x * v, self.y * v, self.z * v)

  def __truediv__(self, v):
    if isinstance(v, vec3):
      return vec3(self.x / v.x, self.y / v.y, self.z / v.z)
    else:
      return vec3(self.x / v, self.y / v, self.z / v)

  @property
  def length(self):
    return math.sqrt(self.e[0] * self.e[0] + self.e[1] * self.e[1] + self.e[2] * self.e[2])

  @property
  def squared_length(self):
    return self.e[0] * self.e[0] + self.e[1] * self.e[1] + self.e[2] * self.e[2]

  def make_unit_vector(self):
    k = 1.0 / math.sqrt(self.e[0] * self.e[0] + self.e[1] * self.e[1] + self.e[2] * self.e[2])
    self.e[0] *= k
    self.e[1] *= k
    self.e[2] *= k
    return self

  def dot(self, v):
    return self.e[0] * v.e[0] + self.e[1] * v.e[1] + self.e[2] * v.e[2]; 

  def cross(self, v):
    return vec3(
      (self.e[1] * v.e[2] - self.e[2] * v.e[1]),
      (-(self.e[0] * v.e[2] - self.e[2] * v.e[0])),
      (self.e[0] * v.e[1] - self.e[1] * v.e[0]))

  def toInt(self):
    return vec3(int(self.x), int(self.y), int(self.z))

  @property
  def unit_vector(self):
    return self / self.length;

  def __str__(self):
    return f"({self.x},{self.y},{self.z})"

  def hey(self):
    for x in self.e:
      print(x)
    print(f"hello")
