@echo off
title Push MoboBrowser to GitHub
cd /d "%~dp0"
echo ========================================================
echo Pushing MoboBrowser to GitHub (oreothebuilder/mobobrowser)
echo ========================================================
git push -u origin main
echo.
pause
