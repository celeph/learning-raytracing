@echo off
if @%1@==@clean@ goto clean
if @%1@==@run@ goto run

set "back=%cd%"
cd ..\..\..\..\wasm\emsdk
call emsdk_env.bat
cd %back%

emcc src\surfacenormal-example.cpp -o output\surfacenormal-example.html^
 -O3^
 -s WASM=1^
 --shell-file src\template.html

goto end

:clean
del /Q output\*.*
goto end

:run
set "back=%cd%"
cd output
python -m SimpleHTTPServer 8080
cd %back%
goto end

:end
echo Done.
