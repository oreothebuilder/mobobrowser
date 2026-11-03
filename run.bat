@echo off
title MoboBrowser
cd /d "%~dp0"
if exist "dist\win-unpacked\MoboBrowser.exe" (
    start "" "dist\win-unpacked\MoboBrowser.exe"
) else if exist "dist\win-unpacked\Mobile Device Browser.exe" (
    start "" "dist\win-unpacked\Mobile Device Browser.exe"
) else (
    echo Launching development mode...
    npm start
)
