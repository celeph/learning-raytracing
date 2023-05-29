Ray Tracing 005: Sphere
=======================

Build with GCC (G++) with Cygwin on Windows
-------------------------------------------

Build all:

``` bash
cd cpp
make
```

Run executable:

``` bash
make run
```

Clean obj and bin directories:

``` bash
make clean
```


Build with Visual Studio Code on Windows
----------------------------------------

Build all:

    Open Developer PowerShell for VS 2019
    
``` bash
cd cpp
code .
```

    Terminal > Run Task > build debug
    
    Terminal > Run Task > build release


Run executable:

    Terminal > Run Task > run


Clean obj and bin directories:

    Terminal > Run Task > clean



Build with Emscripten on Windows
--------------------------------

The Emscripten version is just a first WebAssembly test.

I haven't spent much time exploring Emscripten or WebAssembly's full potential yet.

The source code is pretty much the same as the original C++ version. 
There are only a few preprocessor directives (`__EMSCRIPTEN__`) to 
include the Emscripten headers and mark Emscripten and SDL specific 
code.

Instead of writing the pixel data to a PPM file, it will write them 
to an SDL surface. SDL is a cross-platform library that also supports 
Emscripten.

### Install emsdk

These are the steps needed for Windows. 
See also https://emscripten.org/docs/getting_started/downloads.html.

``` bash
git clone https://github.com/emscripten-core/emsdk.git
git pull
emsdk install latest
emsdk activate latest
emsdk_env.bat

cd ray-tracing\myproject\wasm
mklink /D emsdk D:\emsdk
```

### Compile

The `make.bat` file takes care of setting the environment variables and 
calling `emcc` to compile the wasm files. 

Note: This batch file navigates to `\emsdk` to call `emsdk_env.bat`, then 
changes back to the original directory. A symlink to the emsdk directory 
didn't work here.

Build:

``` bash
cd wasm
make
```

Run server:

``` bash
cd wasm
make run
```

Open http://localhost:9090/

Note: The makefile will attempt to launch the Python3 `http.server` 
module to listen to port 9090. Feel free to change port or server (e.g. NodeJS).

Clean output directory:

``` bash
cd wasm
make clean
```


Build with Python
-----------------

The `make.bat` file in the `python` directory calls the Python
script and directs its output to a new ppm file. It functions 
much like the C++ file, except it's just one single step.

