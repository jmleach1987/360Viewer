@echo off

set pth=X:\ThreeDTeam\web\uploads\Image_Projects
if not exist "%pth%" set pth=h:\ThreeDTeam\web\uploads\Dome_Projects

if "%pth%" NEQ "%cd%" goto:NeedsUpdate

cd ..
cd ..
set jsloc=%pth%\ProjectImagesList.js

echo // This content is dynamically generated.>%jsloc%
echo pl.ProjectImages = []>>%jsloc%

FOR /f "tokens=* delims= " %%a in ('DIR /S /B "%pth%\*.jpg"') do call:test "%%a"
echo COMPLETE
::pause
goto:eop


:NeedsUpdate
echo.
echo The target path does not match.
echo.
echo  Target: %pth%
echo Current: %cd%
echo.
echo You may be running the tool from a non mapped network drive.
echo.
echo If this is not the case, this tool needs to be updated.
pause
goto:eop


:test
set f=%~1
set p=%~dp1

:: X:\ThreeDTeam\web\uploads\Image_Projects

set f=%f:~26,200%
set p=%p:~41,-1%

set f=%f:\=/%
set p=%p:\=/%

for /f "tokens=1,2 delims=/" %%a in ("%p%") do set group=%%a&set project=%%b
echo "%f%"
echo pl.ProjectImages.push( { group: "%group%", project: "%project%", imgName: "%f%" } );>>%jsloc%
goto:eop


:eop