# Learning Ray Tracing

## Introduction

This is a collection of ray tracing code examples and small learning and practice projects.

At this time it includes 16 incremental steps from an initial Hello World image to a ray-traced 
scene of random spheres with random materials and colors. These are based on Peter Shirley's book
[Ray Tracing in One Weekend](https://raytracing.github.io/).

I will continue to add more code based on his other two books, other courses as well as my own 
experiments.

The purpose of this archive is to keep a reference handy in case I need a refresher. 

It also serves a secondary purpose as a learning diary, to keep track of my progress over time. 
That's why each step is numbered. Maybe one day when I add step #999 to this repo, I'll have 
achieved graphics programming mastery :)

It will include code in several languages, primarily the language used in the book or tutorial, but 
also ports to other languages including Javascript. 

Javascript is not optimal for the heavy lifting needed for ray tracing, especially in the beginning 
where rendering is more or less 'brute-force' without any acceleration structures, but it allows me 
to create some interactive apps for the web to explore parameters, visualize and play with some 
principles. Because of its limitations it's also a good exercise to explore ways to optimize and 
measure the impact of each improvement, sometimes with surprising results where a small change led
to significant speed-ups.

Eventually I plan to try WebAssembly, shaders and WebGPU and see how they can be used with ray 
tracing as well. I'll add any new developments as a new section.

## Installation and Usage

See the readme-file inside each section directory for instructions how to compile using GCC, Visual
Studio Code, Emscripten or Python where available.

## Summary

  - 001-016 based on Peter Shirley's: [Ray Tracing in One Weekend](https://raytracing.github.io/books/RayTracingInOneWeekend.html)


