@echo off
title ThreatSense - Backend Server
echo ========================================
echo   ThreatSense Backend - Starting...
echo   Accessible at: https://api.mysrkr.online
echo ========================================
cd /d "%~dp0\threatsense\backend"
call venv\Scripts\activate.bat
python main.py
pause
