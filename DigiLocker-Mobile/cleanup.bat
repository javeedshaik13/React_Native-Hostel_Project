@echo off
REM Cleanup Script for DigiLocker React Native Project
REM Run this to remove unused files (Windows)

echo 🧹 Starting cleanup...
echo.

REM Remove old screens folder
echo ❌ Removing old /screens folder...
if exist "screens" rmdir /s /q "screens"

REM Remove old App.js script
echo ❌ Removing old /scripts/App.js...
if exist "scripts\App.js" del /f /q "scripts\App.js"

REM Remove unused constants files
echo ❌ Removing unused constants files...
if exist "constants\createPostScreen.jsx" del /f /q "constants\createPostScreen.jsx"
if exist "constants\userSettings.jsx" del /f /q "constants\userSettings.jsx"

echo.
echo ✅ Cleanup complete!
echo.
echo 📊 Summary:
echo - Removed /screens folder (6 files)
echo - Removed /scripts/App.js
echo - Removed /constants/createPostScreen.jsx
echo - Removed /constants/userSettings.jsx
echo.
echo 🎉 Your project is now cleaner!
echo Run 'npm start' to test the app.
echo.
pause
