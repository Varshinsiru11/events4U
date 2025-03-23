@echo off
echo ===================================
echo EventHub Backend Starter
echo ===================================
echo.
echo This script will start the EventHub backend server
echo.

REM Check if Python is installed
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/downloads/
    echo.
    pause
    exit /b
)

REM Install required packages if not already installed
echo Installing required packages...
pip install flask flask-cors

REM Run the backend server
echo.
echo Starting the backend server...
echo.
python eventhub_backend.py

pause 