@echo off
title ThreatSense - Cloudflare Tunnel
echo ========================================
echo   Cloudflare Tunnel - Starting...
echo   mysrkr.online     -> localhost:5173
echo   api.mysrkr.online -> localhost:8000
echo ========================================

:: Change to the directory containing this script and cloudflared.exe
cd /d "%~dp0"

:: Run the tunnel using the config file
cloudflared.exe tunnel --config cloudflared-config.yml run

pause
