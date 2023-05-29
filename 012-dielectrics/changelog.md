# Changelog

## 011 -> 012

- **main.cpp**: removed vec3 p = r.point_at_parameter(2.0), not used, not needed
- **main.cpp**: updated object list with additional sphere and dielectric materials
- **material.h**: added refract and schlick functions
- **material.h**: added dielectric material class

## 010 -> 011

- **main.cpp**: added fuzziness parameter to metal spheres
- **material.h**: added fuzziness parameter to metal constructor
- **material.h**: added random fuzziness vector to reflected ray
