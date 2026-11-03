@echo off
title Build Windows Installer - Mobile Device Browser
cd /d "%~dp0"
echo ========================================================
echo Building Windows Installer & Portable EXE...
echo ========================================================
npm run build:all
echo.
echo ========================================================
echo Build Complete! Check the 'dist' folder for your installer.
echo ========================================================
pause
