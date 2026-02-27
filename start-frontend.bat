@echo off
title ThreatSense - Frontend Server
echo ========================================
echo   ThreatSense Frontend - Starting...
echo   Accessible at: https://mysrkr.online
echo ========================================
cd /d "%~dp0\threatsense\frontend-threatsense\threatsense"
npm run dev -- --host 0.0.0.0 --port 5173
pause
