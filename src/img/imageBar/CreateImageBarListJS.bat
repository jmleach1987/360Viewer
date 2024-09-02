@echo off

:: Check if run from UNC path
set c=%cd%
cls
if %c% EQU C:\Windows goto:UNC

cd ..
cd ..
set x=%cd%
set jsloc=%x%\js\imageBarList.js
set imageBarLoc=%x%\img\imageBar

echo ib.imageBarList = []>%jsloc%

FOR /f "tokens=* delims= " %%a in ('DIR /S /B %imageBarLoc%\*.jpg') do call:test %%a
echo Written to %jsloc%
echo COMPLETE
pause
goto:eop


:test
set t=%~nx1
echo %t%
echo ib.imageBarList.push( "%t%" );>>%jsloc%
goto:eop


:UNC
echo.
echo    This tool cannot be run from a network location. 
echo    Please map this drive to Y: then try again
echo.
pause
goto:eop



:eop