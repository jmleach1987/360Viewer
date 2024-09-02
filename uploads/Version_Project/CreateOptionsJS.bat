@echo off

:: Check if run from UNC path
set c=%cd%
cls
if %c% EQU C:\Windows goto:UNC

set x=%~1
if "x" EQU "x%x%" goto:NoDrag


echo wd.options = []>%x%\Options.js
FOR /f "tokens=* delims= " %%a in ('DIR /S /B %x%\*.jpg') do call:test %%a
echo COMPLETE
pause
goto:eop


:test
set t=%~nx1
echo wd.options.push( "%t%" );>>%x%\Options.js
goto:eop



:NoDrag
echo.
echo    This tool has no idea what project to add data 
echo    to. Please drag the project over this tool's icon
echo    to start it.
echo.
pause
goto:eop


:UNC
echo.
echo    This tool cannot be run from a network location. 
echo    Please map this drive to Y: then try again
echo.
pause
goto:eop



wd.options = []
wd.options.push( "Bakery_Layout_Option_1_Shot_01.jpg" );
wd.options.push( "Bakery_Layout_Option_1_Shot_02.jpg" );
wd.options.push( "Bakery_Layout_Option_1_Shot_03.jpg" );
wd.options.push( "Bakery_Layout_Option_1_Shot_04.jpg" );
wd.options.push( "Bakery_Layout_Option_2_Shot_01.jpg" );
wd.options.push( "Bakery_Layout_Option_2_Shot_02.jpg" );
wd.options.push( "Bakery_Layout_Option_2_Shot_03.jpg" );
wd.options.push( "Bakery_Layout_Option_2_Shot_04.jpg" );



:eop