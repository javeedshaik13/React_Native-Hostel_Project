@echo off
cd /d "C:\Unknown Files\MERN\DigiLocker-RN\RN-Project\DigiLocker-Mobile"

echo Starting cleanup...

if exist "screens" (
    rmdir /s /q "screens"
    echo - Removed screens folder
)

if exist "scripts\App.js" (
    del /f /q "scripts\App.js"
    echo - Removed scripts\App.js
)

if exist "constants\createPostScreen.jsx" (
    del /f /q "constants\createPostScreen.jsx"
    echo - Removed constants\createPostScreen.jsx
)

if exist "constants\userSettings.jsx" (
    del /f /q "constants\userSettings.jsx"
    echo - Removed constants\userSettings.jsx
)

echo.
echo Cleanup complete!
