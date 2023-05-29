@echo off
if @%1@==@clean@ goto clean
if @%1@==@run@ goto run

set "back=%cd%"
cd \emsdk
call emsdk_env.bat
cd %back%

emcc src\ep003.cpp -o output\ep003.html^
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
python -m http.server 9090
cd %back%
goto end

:end
echo Done.
