@echo off

title Dome Projects to Data
set pth=Y:\ThreeDTeam\web\uploads\Dome_Projects


if "%pth%" NEQ "%cd%" goto:NeedsUpdate
set jsloc=%pth%\DomeProjectsDataList.js

echo // This content is dynamically generated.>%jsloc%
echo export const DomeProjectData = [>>%jsloc%

set comma=
FOR /f "tokens=* delims= " %%a in ('DIR /S /B /O:-D "%pth%\*.json"') do call:test "%%a"
echo ];>>%jsloc%
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
echo %f%

if "%f%" EQU "%jsloc%" goto:eop

call set f=%%f:%pth%\=%%
call set p=%%f:\Campos.json=%%

set testbackup=%f:_backup=%
::set testprivate=%f:_private=%

if "%testbackup%" NEQ "%f%" goto:eop
::if "%testprivate%" NEQ "%f%" goto:eop

:: Replace \ with /
set f=%f:\=/%
set p=%p:\=/%

:: set the first and second word split by / as the group and project
:: remove _private first
set ll=%p:_private=%
for /f "tokens=1,2 delims=/" %%a in ("%ll%") do set group=%%a&set project=%%b

echo.
echo	%comma%{group:"%group%",project:"%project%",dataFile:"%f%"}
echo	%comma%{group:"%group%",project:"%project%",dataFile:"%f%"}>>%jsloc%
set comma=,

goto:eop


:eop